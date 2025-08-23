"use client"

import { useEffect, useState, useRef } from "react"
import { useUser } from "@/contexts/user-context"
import {  ArrowLeft,  } from "lucide-react"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import EditNameDialog from "./EditNameDialog"
import { Button } from "@/components/ui/button"
import { getOrCreateFallbackName } from "@/lib/fallback-name"

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
   <div className="h-screen w-full flex flex-col bg-background text-foreground z-40 overflow-y-hidden">
  {/* Header */}
  <header className="flex-shrink-0 sticky top-0 z-20 border-b border-border/30 bg-card/80 backdrop-blur-xl">
    <div className="mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button className="bg-transparent ">
          <ArrowLeft className="h-5 text-foreground "   />
        </Button>
        <div className="leading-tight">
          <h1 className="text-lg font-semibold">Anonymous Chat</h1>
          <p className="text-sm text-muted-foreground hidden md:block">
            Chatting as <span className="font-medium text-primary">{displayName}</span>
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

  {/* Messages */}
  <main className="flex-1 overflow-y-auto flex flex-col">
    <MessageList onReply={handleReply} />
    <div ref={messagesEndRef} />
  </main>

  {/* Message Input */}
  <footer className="flex-shrink-0 px-4 sm:px-6 py-3 z-60 bg-card/70 border-t border-border/30 backdrop-blur-xl sticky bottom-0">
    <div className="mx-auto">
      <MessageInput mentionUser={mentionUser} />
    </div>
  </footer>

  <EditNameDialog open={nameDialogOpen} onOpenChange={setNameDialogOpen} />
</div>

  )
}
