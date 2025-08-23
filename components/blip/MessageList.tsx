"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useUser } from "@/contexts/user-context"
import { supabase } from "@/lib/supabase/client"

type Message = {
  id: string
  author_name: string
  message: string
  user_id: string
  created_at: string
}

export default function MessageList() {
  const { identity } = useUser()
  const [messages, setMessages] = React.useState<Message[]>([])
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("public_chat").select("*").order("created_at", { ascending: true })
      setMessages(data || [])
    }
    load()

    const channel = supabase
      .channel("public_chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "public_chat" }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  React.useEffect(() => {
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div
      ref={containerRef}
      aria-live="polite"
      className="h-full w-full overflow-y-auto overscroll-contain px-4 sm:px-6 py-4
                 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/40 hover:scrollbar-thumb-primary/60
                 scroll-smooth"
    >
      {/* Add bottom padding so last message isn't hidden behind sticky footer */}
      <div className="mx-auto w-full space-y-4 pb-28">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.user_id === identity.id
            return (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className={cn("flex gap-3", isMe ? "justify-end" : "justify-start")}
              >
                <div className={cn("flex flex-col", isMe && "items-end")}>
                  {!isMe && <span className="text-xs text-muted-foreground mb-1 ml-1">{msg.author_name}</span>}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 shadow-sm border backdrop-blur-sm transition-all duration-300 max-w-md",
                      isMe
                        ? "bg-gradient-to-br from-purple-600 to-purple-800 text-white"
                        : "bg-muted/80 text-foreground border-border/30 hover:shadow-md"
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                    <p className="mt-2 text-[10px] opacity-60">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
