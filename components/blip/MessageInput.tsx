"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, SendHorizontal } from "lucide-react" // ✅ correct icon name
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"
import { getOrCreateFallbackName } from "@/lib/fallback-name"

export default function MessageInput() {
  const { identity } = useUser()
  const [value, setValue] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const send = async () => {
    const text = value.trim()
    if (!text || sending) return
    setSending(true)
    try {
      const { error } = await supabase.from("public_chat").insert([
        {
          message: text,
          user_id: identity.id,
          author_name: identity.displayName?.trim() || getOrCreateFallbackName(),
        },
      ])
      if (error) {
        console.error("Supabase insert error:", error.message)
        return
      }
      setValue("")
      if (textareaRef.current) textareaRef.current.style.height = "auto"
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        window.innerHeight * 0.3
      )}px`
    }
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300",
          "bg-gradient-to-r from-chat-input-bg/90 to-muted/50 backdrop-blur-sm",
          "border-chat-input-border/50 shadow-sm",
          focused && "border-chat-input-focus/60 shadow-[var(--shadow-input)] scale-[1.01]"
        )}
      >
        {/* Attachment */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 h-9 w-9 rounded-xl hover:bg-accent/50 transition-all duration-200 hover:scale-105 group"
        >
          <Paperclip className="h-4 w-4 text-chat-attachment group-hover:text-primary transition-colors" />
        </Button>

        {/* Textarea + Send */}
        <div className="relative flex flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Type a message..."
            rows={1}
            className={cn(
              "w-full bg-transparent px-3 py-2 pr-12 resize-none overflow-hidden",
              "placeholder:text-muted-foreground/60",
              "text-sm leading-relaxed focus:outline-none",
              "scrollbar-thin scrollbar-thumb-muted-foreground/20"
            )}
            style={{ maxHeight: "120px" }}
          />

          <Button
            type="button"
            onClick={send}
            disabled={sending || value.trim() === ""}
            size="icon"
            className={cn(
              "group",
              "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl",
              "bg-gradient-to-r from-chat-send-bg to-primary-glow",
              "hover:from-chat-send-hover hover:to-primary shadow-[var(--shadow-send)]",
              "border border-primary/20",
              "disabled:opacity-50"
            )}
          >
            <SendHorizontal className="h-3.5 w-3.5 text-white group-hover:text-black transition-colors" />
          </Button>
        </div>
      </div>

      {/* Helper */}
      <div className="flex items-center justify-between mt-2 px-1 sm:px-3">
        <p className="text-xs flex items-center gap-3">
          <span>
            Press <kbd className="px-1.5 py-0.5 text-xs bg-accent/30 rounded border border-border/30 font-mono">Enter</kbd> to send
          </span>
          <span className="hidden sm:inline opacity-70">
            <kbd className="px-1.5 py-0.5 text-xs bg-accent/30 rounded border border-border/30 font-mono">Shift+Enter</kbd> for new line
          </span>
        </p>
        {value.length > 0 && <span className="text-xs opacity-70">{value.length}</span>}
      </div>
    </div>
  )
}
