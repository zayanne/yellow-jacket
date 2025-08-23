"use client"

import { Home, PlusCircle, MessageCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import PostComposerDialog from "./post-composer-dialog"
import UserProfileDialog from "./user-profile-dialog"

export default function Sidebar() {
  const pathname = usePathname() // ✅ detect current route

  const menuItems = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "blip", label: "Blip", icon: MessageCircle, href: "/blip" },
  ]

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleCreatePost = () => setIsCreateDialogOpen(true)
  const handleOpenProfile = () => setIsProfileDialogOpen(true)
  const handlePostCreated = () => setRefreshTrigger((prev) => prev + 1)

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-sidebar lg:border-r lg:border-sidebar-border">
      <div className="flex flex-col h-full p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-sidebar-foreground">Yellow Jacket</h1>
          <p className="text-sm text-muted-foreground">Anonymous thoughts</p>
        </div>

        <Button onClick={handleCreatePost} className="w-full mb-6" size="lg">
          <PlusCircle className="w-5 h-5 mr-2" />
          Create Post
        </Button>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              asChild
              variant={pathname === item.href ? "secondary" : "ghost"} // ✅ active highlight
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Link href={item.href}>
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            </Button>
          ))}

          <Button
            variant={pathname === "/profile" ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              pathname === "/profile" && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
            onClick={handleOpenProfile}
          >
            <User className="w-5 h-5 mr-3" />
            My Profile
          </Button>
        </nav>

        <div className="mt-auto pt-6 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground">
            Share thoughts anonymously. Be respectful and kind.
          </p>
        </div>
      </div>

      <PostComposerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onPostCreated={handlePostCreated}
      />

      <UserProfileDialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen} />
    </div>
  )
}
