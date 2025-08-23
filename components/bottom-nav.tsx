"use client"

import { Home, PlusCircle, MessageCircle, TrendingUp, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  onCreatePost?: () => void
  onOpenProfile?: () => void
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export default function BottomNav({
  onCreatePost,
  onOpenProfile,
  activeSection = "home",
  onSectionChange,
}: BottomNavProps) {
  const menuItems = [
    { id: "home", label: "Home", icon: Home, href:"/" },
    { id: "create", label: "Create", icon: PlusCircle, action: "create" },
    { id: "Blip", label: "Blip", icon: MessageCircle, href:"/blip" },
    { id: "profile", label: "Profile", icon: User, action: "profile" },
  ]

  const handleItemClick = (item: any) => {
    if (item.action === "create") {
      // onCreatePost()
    } else if (item.action === "profile") {
      // onOpenProfile()
    } else {
      onSectionChange?.(item.id)
    }
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around py-2 px-4">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-2 px-3 text-xs",
              activeSection === item.id && !item.action && "text-primary",
              (item.action === "create" || item.action === "profile") && "text-primary",
            )}
            onClick={() => handleItemClick(item)}
          >
            <item.icon className={cn("w-5 h-5", item.action === "create" && "w-6 h-6")} />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
