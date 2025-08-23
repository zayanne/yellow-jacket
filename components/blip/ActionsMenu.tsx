"use client"

import { Flag, MoreVertical, Reply, Smile } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Props = {
  username: string
  onReply: (username: string) => void
}

export function ActionsMenu({ username, onReply }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MoreVertical className="h-5 w-5 cursor-pointer m-2" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40" side="right">
        <DropdownMenuItem onClick={() => onReply(username)}>
          <Reply /> Reply
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Smile /> React
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Flag /> Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
