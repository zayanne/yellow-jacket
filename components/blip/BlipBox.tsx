"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/contexts/user-context"
import { MessageCircle } from "lucide-react"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import EditNameDialog from "./EditNameDialog"
import { Button } from "@/components/ui/button"

export default function BlipBox() {
  const { identity } = useUser()
  const [mounted, setMounted] = useState(false)
  const [nameDialogOpen, setNameDialogOpen] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm">Loading chat...</span>
        </div>
      </div>
    )
  }

  const displayName = identity.displayName || identity.id.slice(-6)

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/30 bg-card/80 backdrop-blur-xl">
        <div className="mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted-foreground text-muted flex items-center justify-center shadow-lg">
              <MessageCircle className="h-5 w-5 " />
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-semibold">Anonymous Chat</h1>
              <p className="text-sm text-muted-foreground">
                Chatting as <span className="font-medium text-primary">{displayName}</span>
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setNameDialogOpen(true)} className="text-muted-foreground hover:text-foreground">
            Change name
          </Button>
        </div>
      </header>

      {/* Messages (scrollable) */}
      <main className="flex-1 min-h-0">
        <div className="mx-auto h-full">
          <MessageList />
        </div>
      </main>

      {/* Message Input (pinned) */}
      <footer className="sticky bottom-0 z-20 border-t border-border/30 bg-card/70 backdrop-blur-xl px-4 sm:px-6 py-3">
        <div className="mx-auto">
          <MessageInput />
        </div>
      </footer>

      <EditNameDialog open={nameDialogOpen} onOpenChange={setNameDialogOpen} />
    </div>
  )
}
