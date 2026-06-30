import ConversationCard from "@/components/inbox/ConversationCard"
import type { ConversationListItem } from "@/lib/db/conversations"

export default function ConversationList({ conversations }: { conversations: ConversationListItem[] }) {
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-zinc-400">
        No conversations yet. Messages from WhatsApp will appear here.
      </div>
    )
  }

  return (
    <div>
      {conversations.map((c) => (
        <ConversationCard key={c.id} conversation={c} />
      ))}
    </div>
  )
}
