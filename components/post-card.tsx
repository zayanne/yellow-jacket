"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, MessageCircle, Share2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import CommentSection from "./comment-section"
import ShareModal from "./share-modal"
import { toast } from "sonner"

interface Post {
  id: string
  content: string
  author_name: string
  created_at: string
}

interface PostStats {
  likes: number
  dislikes: number
  comments: number
  shares: number
}

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const [stats, setStats] = useState<PostStats>({ likes: 0, dislikes: 0, comments: 0, shares: 0 })
  const [userInteraction, setUserInteraction] = useState<"liked" | "disliked" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  // Generate a consistent user identifier for this session
  const getUserIdentifier = () => {
    let identifier = localStorage.getItem("user_identifier")
    if (!identifier) {
      identifier = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("user_identifier", identifier)
    }
    return identifier
  }

  useEffect(() => {
    fetchStats()
    checkUserInteraction()
  }, [post.id])

  const fetchStats = async () => {
    try {
      const [likesResult, dislikesResult, commentsResult, sharesResult] = await Promise.all([
        supabase.from("likes").select("id", { count: "exact" }).eq("post_id", post.id),
        supabase.from("dislikes").select("id", { count: "exact" }).eq("post_id", post.id),
        supabase.from("comments").select("id", { count: "exact" }).eq("post_id", post.id),
        supabase.from("shares").select("id", { count: "exact" }).eq("post_id", post.id),
      ])

      setStats({
        likes: likesResult.count || 0,
        dislikes: dislikesResult.count || 0,
        comments: commentsResult.count || 0,
        shares: sharesResult.count || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const checkUserInteraction = async () => {
    const userIdentifier = getUserIdentifier()

    try {
      const [likeResult, dislikeResult] = await Promise.all([
        supabase.from("likes").select("id").eq("post_id", post.id).eq("user_identifier", userIdentifier).single(),
        supabase.from("dislikes").select("id").eq("post_id", post.id).eq("user_identifier", userIdentifier).single(),
      ])

      if (likeResult.data) {
        setUserInteraction("liked")
      } else if (dislikeResult.data) {
        setUserInteraction("disliked")
      }
    } catch (error) {
      // No interaction found, which is expected
    }
  }

  const handleLike = async () => {
    if (isLoading) return
    setIsLoading(true)

    const userIdentifier = getUserIdentifier()

    try {
      if (userInteraction === "liked") {
        // Remove like
        await supabase.from("likes").delete().eq("post_id", post.id).eq("user_identifier", userIdentifier)
        setUserInteraction(null)
        setStats((prev) => ({ ...prev, likes: prev.likes - 1 }))
      } else {
        // Remove dislike if exists
        if (userInteraction === "disliked") {
          await supabase.from("dislikes").delete().eq("post_id", post.id).eq("user_identifier", userIdentifier)
          setStats((prev) => ({ ...prev, dislikes: prev.dislikes - 1 }))
        }

        // Add like
        await supabase.from("likes").insert([{ post_id: post.id, user_identifier: userIdentifier }])
        setUserInteraction("liked")
        setStats((prev) => ({ ...prev, likes: prev.likes + 1 }))
      }
    } catch (error) {
      console.error("Error handling like:", error)
      toast.error("Error",{
        description: "Failed to update like. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDislike = async () => {
    if (isLoading) return
    setIsLoading(true)

    const userIdentifier = getUserIdentifier()

    try {
      if (userInteraction === "disliked") {
        // Remove dislike
        await supabase.from("dislikes").delete().eq("post_id", post.id).eq("user_identifier", userIdentifier)
        setUserInteraction(null)
        setStats((prev) => ({ ...prev, dislikes: prev.dislikes - 1 }))
      } else {
        // Remove like if exists
        if (userInteraction === "liked") {
          await supabase.from("likes").delete().eq("post_id", post.id).eq("user_identifier", userIdentifier)
          setStats((prev) => ({ ...prev, likes: prev.likes - 1 }))
        }

        // Add dislike
        await supabase.from("dislikes").insert([{ post_id: post.id, user_identifier: userIdentifier }])
        setUserInteraction("disliked")
        setStats((prev) => ({ ...prev, dislikes: prev.dislikes + 1 }))
      }
    } catch (error) {
      console.error("Error handling dislike:", error)
      toast.error("Error",{
        description: "Failed to update dislike. Please try again.",
        
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommentClick = () => {
    setShowComments(!showComments)
  }

  const handleCommentAdded = () => {
    setStats((prev) => ({ ...prev, comments: prev.comments + 1 }))
  }

  const handleShareClick = () => {
    setShowShareModal(true)
  }

  const handleShareComplete = () => {
    setStats((prev) => ({ ...prev, shares: prev.shares + 1 }))
  }

  return (
    <Card className="w-full" id={`post-${post.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">
                {post.author_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-card-foreground">{post.author_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-card-foreground leading-relaxed mb-4">{post.content}</p>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLoading}
              className={`flex items-center space-x-1 ${
                userInteraction === "liked"
                  ? "text-primary bg-primary/10 hover:bg-primary/20"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{stats.likes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDislike}
              disabled={isLoading}
              className={`flex items-center space-x-1 ${
                userInteraction === "disliked"
                  ? "text-destructive bg-destructive/10 hover:bg-destructive/20"
                  : "text-muted-foreground hover:text-destructive"
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{stats.dislikes}</span>
            </Button>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCommentClick}
              className="flex items-center space-x-1 text-muted-foreground hover:text-primary"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{stats.comments}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareClick}
              className="flex items-center space-x-1 text-muted-foreground hover:text-primary"
            >
              <Share2 className="w-4 h-4" />
              <span>{stats.shares}</span>
            </Button>
          </div>
        </div>

        <CommentSection
          postId={post.id}
          isOpen={showComments}
          onToggle={handleCommentClick}
          commentCount={stats.comments}
          onCommentAdded={handleCommentAdded}
        />

        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          postId={post.id}
          postContent={post.content}
          authorName={post.author_name}
          onShareComplete={handleShareComplete}
        />
      </CardContent>
    </Card>
  )
}
