"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Loader2, Send } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import { toast } from "sonner"

interface PostComposerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPostCreated?: () => void
}

export default function PostComposerDialog({ open, onOpenChange, onPostCreated }: PostComposerDialogProps) {
  const [content, setContent] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { identity, updateDisplayName } = useUser()

  useEffect(() => {
    if (open && identity.displayName && !authorName) {
      setAuthorName(identity.displayName)
    }
  }, [open, identity.displayName, authorName])

  const characterCount = content.length
  const isValidLength = characterCount > 0 && characterCount <= 200
  const remainingChars = 200 - characterCount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidLength) {
      if (characterCount === 0) {
        toast.warning("Post is empty",{
          description: "Please write something to share.",
        })
      } else {
        toast.warning("Post too long",{
          description: `Please keep your post under 200 characters. You're ${characterCount - 200} characters over.`,
        })
      }
      return
    }

    setIsSubmitting(true)

    try {
      const finalAuthorName = authorName.trim() || "Anonymous"

      if (authorName.trim() && authorName.trim() !== identity.displayName) {
        updateDisplayName(authorName.trim())
      }

      const { error } = await supabase.from("posts").insert([
        {
          content: content.trim(),
          author_name: finalAuthorName,
        },
      ])

      if (error) {
        throw error
      }

      toast.success("Post published!",{
        description: "Your thoughts have been shared anonymously.",
      })

      setContent("")
      setAuthorName("")
      onOpenChange(false)
      onPostCreated?.()
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error("Failed to publish",{
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      setContent("")
      setAuthorName("")
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* <DialogContent className="sm:max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">Share Your Thoughts</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Express yourself anonymously. Keep it concise with up to 200 characters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dialog-author-name" className="text-sm font-medium">
              Display Name (Optional)
            </Label>
            <Input
              id="dialog-author-name"
              placeholder="Anonymous"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              maxLength={100}
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dialog-post-content" className="text-sm font-medium">
              Your Post
            </Label>
            <Textarea
              id="dialog-post-content"
              placeholder="What's on your mind? Share your thoughts, ideas, or experiences..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32 bg-input border-border resize-none"
              maxLength={200}
            />
            <div className="flex justify-between items-center text-sm">
              <span
                className={`${
                  characterCount > 200
                    ? "text-destructive"
                    : characterCount === 0
                      ? "text-muted-foreground"
                      : "text-primary"
                }`}
              >
                {characterCount}/200 characters
              </span>
              {isValidLength && characterCount > 0 && (
                <span className="text-primary text-xs font-medium">Ready to post!</span>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValidLength || isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent> */}
        <DialogContent className="sm:max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Post Composer (Coming Soon)
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            🚧 This feature is temporarily under maintenance. You cannot post at the moment.
            It will be available soon. Thank you for your patience!
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex flex-col gap-3 text-center">
          <Button disabled className="cursor-not-allowed">
            Feature Disabled
          </Button>
        </div>
      </DialogContent>
      
    </Dialog>
  )
}
