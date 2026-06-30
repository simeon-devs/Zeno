import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getConversation } from "@/lib/db/conversations"
import { getMessages } from "@/lib/db/messages"
import MessageThread from "@/components/conversation/MessageThread"

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const conversation = await getConversation(id)
  if (!conversation) notFound()

  const messages = await getMessages(id)
  const label = conversation.contact_name || conversation.contact_phone

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-8 py-6 border-b border-zinc-100 flex items-center gap-3">
        <Link href="/inbox" className="text-zinc-400 hover:text-zinc-600">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold">{label}</h1>
          <p className="text-xs text-zinc-400">{conversation.contact_phone}</p>
        </div>
      </div>
      <MessageThread messages={messages} />
    </div>
  )
}
