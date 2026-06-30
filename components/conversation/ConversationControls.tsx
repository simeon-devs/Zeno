"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toggleAiReply, sendManualReply } from "@/app/(dashboard)/conversations/[id]/actions"

interface Props {
  conversationId: string
  aiEnabled: boolean
}

export default function ConversationControls({ conversationId, aiEnabled }: Props) {
  const [ai, setAi] = useState(aiEnabled)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)

  async function handleToggle(val: boolean) {
    setAi(val)
    await toggleAiReply(conversationId, val)
  }

  async function handleSend() {
    if (!reply.trim()) return
    setSending(true)
    await sendManualReply(conversationId, reply.trim())
    setReply("")
    setSending(false)
  }

  return (
    <div className="border-t border-zinc-100 px-6 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">AI Auto-Reply</p>
          <p className="text-xs text-zinc-400">
            {ai ? "AI is handling this conversation" : "You are in control — AI is paused"}
          </p>
        </div>
        <Switch checked={ai} onCheckedChange={handleToggle} />
      </div>

      {!ai && (
        <div className="space-y-2">
          <Textarea
            placeholder="Type a manual reply..."
            value={reply}
            onChange={e => setReply(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button size="sm" onClick={handleSend} disabled={sending || !reply.trim()}>
            {sending ? "Sending..." : "Send"}
          </Button>
        </div>
      )}
    </div>
  )
}
