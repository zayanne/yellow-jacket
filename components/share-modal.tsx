"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Twitter, Facebook, Linkedin, Check } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  postContent: string
  authorName: string
  onShareComplete: () => void
}

export default function ShareModal({
  isOpen,
  onClose,
  postId,
  postContent,
  authorName,
  onShareComplete,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const postUrl = `${window.location.origin}#post-${postId}`
  const shareText = `Check out this post by ${authorName}: "${postContent.substring(0, 100)}${
    postContent.length > 100 ? "..." : ""
  }"`

  const trackShare = async () => {
    try {
      const userIdentifier =
        localStorage.getItem("user_identifier") || `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      if (!localStorage.getItem("user_identifier")) {
        localStorage.setItem("user_identifier", userIdentifier)
      }

      // Check if user already shared this post
      const { data: existingShare } = await supabase
        .from("shares")
        .select("id")
        .eq("post_id", postId)
        .eq("user_identifier", userIdentifier)
        .single()

      if (!existingShare) {
        await supabase.from("shares").insert([
          {
            post_id: postId,
            user_identifier: userIdentifier,
          },
        ])
        onShareComplete()
      }
    } catch (error) {
      console.error("Error tracking share:", error)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      await trackShare()
      toast.success("Link copied!",{
        description: "Post link has been copied to your clipboard.",
      })
    } catch (error) {
      toast.error("Failed to copy",{
        description: "Could not copy link to clipboard.",
      })
    }
  }

  const handleSocialShare = async (platform: string) => {
    let shareUrl = ""

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(
          postUrl,
        )}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
      await trackShare()
      toast.success("Shared!",{
        description: `Post shared on ${platform.charAt(0).toUpperCase() + platform.slice(1)}.`,
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
          <DialogDescription>Share this post with others using the options below.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy Link */}
          <div className="space-y-2">
            <Label htmlFor="post-url">Post Link</Label>
            <div className="flex items-center space-x-2">
              <Input id="post-url" value={postUrl} readOnly className="bg-muted" />
              <Button onClick={handleCopyLink} size="sm" variant="outline">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Social Media Sharing */}
          <div className="space-y-3">
            <Label>Share on Social Media</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => handleSocialShare("twitter")}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Twitter className="w-4 h-4" />
                <span>Twitter</span>
              </Button>
              <Button
                onClick={() => handleSocialShare("facebook")}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Facebook className="w-4 h-4" />
                <span>Facebook</span>
              </Button>
              <Button
                onClick={() => handleSocialShare("linkedin")}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </Button>
            </div>
          </div>

          {/* Post Preview */}
          <div className="border rounded-lg p-3 bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Preview:</p>
            <p className="text-sm font-medium">{authorName}</p>
            <p className="text-sm text-muted-foreground line-clamp-3">{postContent}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
