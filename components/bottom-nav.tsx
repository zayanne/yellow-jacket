"use client"

import { useState } from "react"
import Link from "next/link"
import { Home, PlusCircle, MessageCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import PostComposerDialog from "./post-composer-dialog"
import UserProfileDialog from "./user-profile-dialog"


interface BottomNavProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

type MenuItem = {
  id: string
  label: string
  icon: React.ElementType
  href?: string
  action?: "create" | "profile"
}

export default function BottomNav({ activeSection = "home", onSectionChange }: BottomNavProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handlePostCreated = () => setRefreshTrigger((prev) => prev + 1)

  const menuItems: MenuItem[] = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "create", label: "Create", icon: PlusCircle, action: "create" },
    { id: "blip", label: "Blip", icon: MessageCircle, href: "/blip" },
    { id: "profile", label: "Profile", icon: User, action: "profile" },
  ]

  const handleItemClick = (item: MenuItem) => {
    if (item.action === "create") {
      setIsCreateDialogOpen(true)
    } else if (item.action === "profile") {
      setIsProfileDialogOpen(true)
    } else {
      onSectionChange?.(item.id)
    }
  }

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around py-2 px-4">
          {menuItems.map((item) => {
            const isActive = activeSection === item.id

            const button = (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-2 px-3 text-xs",
                  isActive && "text-primary"
                )}
                onClick={() => handleItemClick(item)}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5",
                    item.action === "create" && "w-6 h-6"
                  )}
                />
                <span className="text-xs">{item.label}</span>
              </Button>
            )

            return item.href ? (
              <Link key={item.id} href={item.href}>
                {button}
              </Link>
            ) : (
              button
            )
          })}
        </div>
      </div>

      {/* Post Composer Dialog */}
      <PostComposerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onPostCreated={handlePostCreated}
      />

      {/* Profile Dialog */}
      <UserProfileDialog
        open={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
      />
    </>
  )
}
