"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Reply, Send, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { supabase } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import { toast } from "sonner"

interface Comment {
  id: string
  content: string
  author_name: string
  created_at: string
  parent_comment_id?: string
  replies?: Comment[]
}

interface CommentItemProps {
  comment: Comment
  postId: string
  onReplyAdded: () => void
  level?: number
}

export default function CommentItem({ comment, postId, onReplyAdded, level = 0 }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [replyAuthorName, setReplyAuthorName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { identity } = useUser()

  const maxNestingLevel = 3 // Limit nesting to prevent UI issues

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!replyContent.trim()) {
      toast.warning("Reply required",{
        description: "Please write a reply before submitting.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const finalAuthorName = replyAuthorName.trim() || identity.displayName || "Anonymous"

      const { error } = await supabase.from("comments").insert([
        {
          post_id: postId,
          content: replyContent.trim(),
          author_name: finalAuthorName,
          user_identifier: identity.id,
          parent_comment_id: comment.id,
        },
      ])

      if (error) {
        throw error
      }

      setReplyContent("")
      setReplyAuthorName("")
      setShowReplyForm(false)
      onReplyAdded()

      toast("Reply added!",{
        description: "Your reply has been posted.",
      })
    } catch (error) {
      console.error("Error adding reply:", error)
      toast.error("Failed to add reply",{
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`${level > 0 ? "ml-6 border-l-2 border-border pl-4" : ""}`}>
      <Card className={`bg-card/50 ${level > 0 ? "bg-card/30" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-xs font-medium">
                {comment.author_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="font-medium text-sm text-card-foreground">{comment.author_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </p>
              </div>
              <p className="text-sm text-card-foreground leading-relaxed mb-2">{comment.content}</p>

              {level < maxNestingLevel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-xs text-muted-foreground hover:text-primary p-0 h-auto"
                >
                  <Reply className="w-3 h-3 mr-1" />
                  Reply
                </Button>
              )}
            </div>
          </div>

          {showReplyForm && (
            <div className="mt-4 ml-9 space-y-3">
              <form onSubmit={handleSubmitReply} className="space-y-3">
                <Input
                  placeholder="Your name (optional)"
                  value={replyAuthorName}
                  onChange={(e) => setReplyAuthorName(e.target.value)}
                  maxLength={100}
                  className="bg-input border-border text-sm"
                />
                <Textarea
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-16 bg-input border-border resize-none text-sm"
                  maxLength={1000}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{replyContent.length}/1000</span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReplyForm(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!replyContent.trim() || isSubmitting}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3 mr-1" />
                          Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Render nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} onReplyAdded={onReplyAdded} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
