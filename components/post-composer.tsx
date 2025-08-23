// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import { Loader2, Send } from "lucide-react"
// import { supabase } from "@/lib/supabase/client"
// import { toast } from "sonner"

// interface PostComposerProps {
//   onPostCreated?: () => void
// }

// export default function PostComposer({ onPostCreated }: PostComposerProps) {
//   const [content, setContent] = useState("")
//   const [authorName, setAuthorName] = useState("")
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const characterCount = content.length
//   const isValidLength = characterCount > 0 && characterCount <= 200
//   const remainingChars = 200 - characterCount

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!isValidLength) {
//       if (characterCount === 0) {
//         toast.warning("Post is empty",{
//           description: "Please write something to share.",
//         })
//       } else {
//         toast.warning("Post too long",{
//           description: `Please keep your post under 200 characters. You're ${characterCount - 200} characters over.`,
//         })
//       }
//       return
//     }

//     setIsSubmitting(true)

//     try {
//       const userIdentifier = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

//       const { error } = await supabase.from("posts").insert([
//         {
//           content: content.trim(),
//           author_name: authorName.trim() || "Anonymous",
//         },
//       ])

//       if (error) {
//         throw error
//       }

//       toast({
//         title: "Post published!",
//         description: "Your thoughts have been shared anonymously.",
//       })

//       setContent("")
//       setAuthorName("")
//       onPostCreated?.()
//     } catch (error) {
//       console.error("Error creating post:", error)
//       toast({
//         title: "Failed to publish",
//         description: "Something went wrong. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <Card className="w-full max-w-2xl mx-auto">
//       <CardHeader>
//         <CardTitle className="text-xl font-semibold text-foreground">Share Your Thoughts</CardTitle>
//         <p className="text-sm text-muted-foreground">
//           Express yourself anonymously. Keep it concise with up to 200 characters.
//         </p>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="author-name" className="text-sm font-medium">
//               Display Name (Optional)
//             </Label>
//             <Input
//               id="author-name"
//               placeholder="Anonymous"
//               value={authorName}
//               onChange={(e) => setAuthorName(e.target.value)}
//               maxLength={100}
//               className="bg-input border-border"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="post-content" className="text-sm font-medium">
//               Your Post
//             </Label>
//             <Textarea
//               id="post-content"
//               placeholder="What's on your mind? Share your thoughts, ideas, or experiences..."
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//               className="min-h-32 bg-input border-border resize-none"
//               maxLength={200}
//             />
//             <div className="flex justify-between items-center text-sm">
//               <span
//                 className={`${
//                   characterCount > 200
//                     ? "text-destructive"
//                     : characterCount === 0
//                       ? "text-muted-foreground"
//                       : "text-primary"
//                 }`}
//               >
//                 {characterCount}/200 characters
//               </span>
//               {isValidLength && characterCount > 0 && (
//                 <span className="text-primary text-xs font-medium">Ready to post!</span>
//               )}
//             </div>
//           </div>

//           <Button
//             type="submit"
//             disabled={!isValidLength || isSubmitting}
//             className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
//           >
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                 Publishing...
//               </>
//             ) : (
//               <>
//                 <Send className="w-4 h-4 mr-2" />
//                 Publish Post
//               </>
//             )}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   )
// }
