"use client"

import { useState } from "react"
import PostFeed from "@/components/post-feed"
import PostComposerDialog from "@/components/post-composer-dialog"
import UserProfileDialog from "@/components/user-profile-dialog"

export default function Home() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)

 



  return (
    <>  <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="text-center space-y-4 lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl lg:mx-0 mx-auto">
              Discover what others are thinking and share your own anonymous thoughts.
            </p>
          </header>

          <div className="space-y-6">
            <h2 className="text-xl lg:text-2xl font-semibold text-foreground">Recent Posts</h2>
            <PostFeed/>
          </div>
        </div>
      </div>

     
   </>
    
  )
}
