"use client"

import { useEffect, useState, useRef } from "react"
import { useUser } from "@/contexts/user-context"
import { ArrowLeft } from "lucide-react"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import EditNameDialog from "./EditNameDialog"
import { Button } from "@/components/ui/button"
import { getOrCreateFallbackName } from "@/lib/fallback-name"
import { cn } from "@/lib/utils"

export default function BlipBox() {
  const { identity } = useUser()
  const [mounted, setMounted] = useState(false)
  const [nameDialogOpen, setNameDialogOpen] = useState(false)
  const [fallbackName, setFallbackName] = useState<string>("")
  const [mentionUser, setMentionUser] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const loadName = async () => {
      const name = await getOrCreateFallbackName()
      setFallbackName(name)
    }
    loadName()
  }, [])

  const handleReply = (username: string) => setMentionUser(username)

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

  const displayName = identity.displayName || fallbackName

  return (
    <div
      className={cn(
        "flex flex-col h-screen w-full bg-background text-foreground overflow-hidden min-h-0"
      )}
    >
      {/* Header */}
      <header
        className={cn(
          "flex-shrink-0 border-b border-border/30 bg-card/80 backdrop-blur-xl sticky top-0 z-20"
        )}
      >
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="bg-transparent"
            >
              <ArrowLeft className="h-5 text-foreground" />
            </Button>
            <div className="leading-tight">
              <h1 className="text-lg font-semibold">Anonymous Chat</h1>
              <p className="text-sm text-muted-foreground hidden md:block">
                Chatting as{" "}
                <span className="font-medium text-primary">{displayName}</span>
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNameDialogOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            Change name
          </Button>
        </div>
      </header>

      {/* Messages - ONLY SCROLLABLE AREA */}
      <main
        className={cn(
          "flex-1 overflow-y-auto px-4 sm:px-6 py-3 min-h-0",
          // 👇 ensures last messages are never hidden behind input
          "pb-40"
        )}
      >
        <MessageList onReply={handleReply} />
        <div ref={messagesEndRef} />
      </main>

      {/* Input - FIXED to bottom */}
      <footer
        className={cn(
          "fixed bottom-0 left-0 right-0 z-20 px-4 sm:px-6 py-3",
          "bg-card/80 border-t border-border/30 backdrop-blur-xl",
          "pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
        )}
      >
        <MessageInput mentionUser={mentionUser} />
      </footer>

      <EditNameDialog
        open={nameDialogOpen}
        onOpenChange={setNameDialogOpen}
      />
    </div>
  )
}
