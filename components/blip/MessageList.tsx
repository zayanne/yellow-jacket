"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useUser } from "@/contexts/user-context"
import { supabase } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ActionsMenu } from "./ActionsMenu"

type NameStyle = {
  type: string
  color: string
  effect?: string
  font_weight?: string
}

type Message = {
  id: string
  author_name: string
  message: string
  user_id: string
  created_at: string
  name_style?: NameStyle | null
}

export default function MessageList({ onReply }: { onReply: (username: string) => void }) {
  const { identity } = useUser()
  const [messages, setMessages] = React.useState<Message[]>([])
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const load = async () => {
      // 1. Fetch registered users with their style + current display_name
      const { data: users } = await supabase
        .from("registered_users")
        .select("user_id, display_name, name_style")

      const userStyles = new Map(
        users?.map(u => [
          u.user_id,
          { style: u.name_style, display_name: u.display_name },
        ]) ?? []
      )

      // 2. Fetch all chat messages
      const { data: msgs } = await supabase
        .from("public_chat")
        .select("*")
        .order("created_at", { ascending: true })

      setMessages(
        (msgs || []).map((m) => {
          const user = userStyles.get(m.user_id)
          return {
            ...m,
            name_style:
              user &&
                user.display_name &&
                user.display_name.toLowerCase() === m.author_name.toLowerCase()
                ? user.style
                : null,

          }
        })
      )
    }
    load()

    // 3. Listen for new messages
    const channel = supabase
      .channel("public_chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "public_chat" },
        async (payload) => {
          const newMsg = payload.new as Message

          // Get user style + display_name
          const { data: user } = await supabase
            .from("registered_users")
            .select("display_name, name_style")
            .eq("user_id", newMsg.user_id)
            .maybeSingle()

          setMessages((prev) => [
            ...prev,
            {
              ...newMsg,
              name_style:
                user &&
                  user.display_name &&
                  user.display_name.toLowerCase() === newMsg.author_name.toLowerCase()
                  ? user.name_style
                  : null,

            },
          ])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  React.useEffect(() => {
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  function renderMessageText(text: string, isMe: boolean) {
    const mentionRegex = /(@\w+)/g
    const parts = text.split(mentionRegex)

    return parts.map((part, i) =>
      mentionRegex.test(part) ? (
        <span
          key={i}
          className={isMe ? "font-bold text-white" : "font-bold text-blue-500"}
        >
          {part}
        </span>
      ) : (
        <span key={i} className={isMe ? "" : "text-sm"}>
          {part}
        </span>
      )
    )
  }

  function renderStyledName(name: string, style?: NameStyle | null) {
    if (!style) {
      return <span className="text-xs text-muted-foreground">{name}</span>
    }

    return (
      <span
        className="text-xs mb-1 ml-1"
        style={{
          color: style.color,
          fontWeight: style.font_weight || "normal",
          textTransform: style.effect === "uppercase" ? "uppercase" : undefined,
          letterSpacing: style.effect === "sharp_edges" ? "0.05em" : undefined,
        }}
      >
        {name}
      </span>
    )
  }

  return (
    <div
      ref={containerRef}
      aria-live="polite"
      className="h-full w-full overflow-y-auto overscroll-contain px-4 sm:px-6 py-4
                 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/40 hover:scrollbar-thumb-primary/60
                 scroll-smooth"
    >
      <div className="mx-auto w-full space-y-4">
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
                <div className={cn("flex flex-col", isMe && "items-start")}>
                  {renderStyledName(msg.author_name, msg.name_style)}

                  <div className="flex relative">
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 shadow-sm border backdrop-blur-sm transition-all duration-300 max-w-md",
                        isMe
                          ? "bg-gradient-to-br from-purple-600 to-purple-800 text-white"
                          : "bg-muted/80 text-foreground border-border/30 hover:shadow-md"
                      )}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {renderMessageText(msg.message, isMe)}
                      </p>

                      <p className="mt-2 text-[10px] opacity-60">
                        {format(new Date(msg.created_at), "hh:mm a")}
                      </p>
                    </div>

                    {!isMe && (
                      <div className="md:opacity-0 md:hover:opacity-100">
                        <ActionsMenu
                          username={msg.author_name}
                          onReply={onReply}
                        />
                      </div>
                    )}
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
