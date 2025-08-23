"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Send, ChevronDown, ChevronUp } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import CommentItem from "./comment-item"
import { toast } from "sonner"

interface Comment {
  id: string
  content: string
  author_name: string
  created_at: string
  parent_comment_id?: string
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
  isOpen: boolean
  onToggle: () => void
  commentCount: number
  onCommentAdded: () => void
}

export default function CommentSection({
  postId,
  isOpen,
  onToggle,
  commentCount,
  onCommentAdded,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { identity } = useUser()

  useEffect(() => {
    if (isOpen) {
      fetchComments()
    }
  }, [isOpen, postId])

  useEffect(() => {
    if (identity.displayName && !authorName) {
      setAuthorName(identity.displayName)
    }
  }, [identity.displayName, authorName])

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true })

      if (error) {
        throw error
      }

      const commentsMap = new Map<string, Comment>()
      const rootComments: Comment[] = []

      // First pass: create all comment objects
      data?.forEach((comment) => {
        commentsMap.set(comment.id, { ...comment, replies: [] })
      })

      // Second pass: organize into tree structure
      data?.forEach((comment) => {
        const commentObj = commentsMap.get(comment.id)!
        if (comment.parent_comment_id) {
          const parent = commentsMap.get(comment.parent_comment_id)
          if (parent) {
            parent.replies!.push(commentObj)
          }
        } else {
          rootComments.push(commentObj)
        }
      })

      setComments(rootComments)
    } catch (error) {
      console.error("Error fetching comments:", error)
      toast.error("Error",{
        description: "Failed to load comments. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) {
      toast.warning("Comment required",{
        description: "Please write a comment before submitting.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const finalAuthorName = authorName.trim() || identity.displayName || "Anonymous"

      const { error } = await supabase.from("comments").insert([
        {
          post_id: postId,
          content: newComment.trim(),
          author_name: finalAuthorName,
          user_identifier: identity.id,
        },
      ])

      if (error) {
        throw error
      }

      setNewComment("")
      setAuthorName("")
      onCommentAdded()
      fetchComments() // Refresh to show new comment

      toast("Comment added!",{
        description: "Your comment has been posted.",
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error("Failed to add comment",{
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border-t border-border mt-4">
      <Button
        variant="ghost"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-muted-foreground hover:text-foreground"
      >
        <span className="flex items-center space-x-2">
          <span>Comments ({commentCount})</span>
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          {/* Comment Form */}
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleSubmitComment} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="comment-author" className="text-sm font-medium">
                    Display Name (Optional)
                  </Label>
                  <Input
                    id="comment-author"
                    placeholder="Anonymous"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    maxLength={100}
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment-content" className="text-sm font-medium">
                    Your Comment
                  </Label>
                  <Textarea
                    id="comment-content"
                    placeholder="Share your thoughts on this post..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-20 bg-input border-border resize-none"
                    maxLength={1000}
                  />
                  <div className="text-right text-xs text-muted-foreground">{newComment.length}/1000 characters</div>
                </div>

                <Button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Comments List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} postId={postId} onReplyAdded={fetchComments} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
