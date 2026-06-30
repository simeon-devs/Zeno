import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getConversation } from "@/lib/db/conversations"
import { getMessages } from "@/lib/db/messages"
import MessageThread from "@/components/conversation/MessageThread"
import ConversationControls from "@/components/conversation/ConversationControls"

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const conversation = await getConversation(id)
  if (!conversation) notFound()

  const messages = await getMessages(id)
  const label = conversation.contact_name || conversation.contact_phone
  const aiEnabled = conversation.status === "active"

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3 shrink-0">
        <Link href="/inbox" className="text-zinc-400 hover:text-zinc-600">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold truncate">{label}</h1>
            <Badge variant={conversation.status === "escalated" ? "destructive" : "secondary"} className="text-[10px]">
              {conversation.status === "escalated" ? "manual" : "ai"}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400">{conversation.contact_phone}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <MessageThread messages={messages} />
      </div>

      <ConversationControls conversationId={id} aiEnabled={aiEnabled} />
    </div>
  )
}
