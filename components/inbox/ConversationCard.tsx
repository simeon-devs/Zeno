import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { ConversationListItem } from "@/lib/db/conversations"

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  active: "default",
  resolved: "secondary",
  escalated: "destructive",
}

export default function ConversationCard({ conversation }: { conversation: ConversationListItem }) {
  const label = conversation.contact_name || conversation.contact_phone

  return (
    <Link
      href={`/conversations/${conversation.id}`}
      className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 hover:bg-zinc-50 transition-colors"
    >
      <div className="min-w-0">
        <p className="font-medium text-sm truncate">{label}</p>
        <p className="text-xs text-zinc-400 truncate">{conversation.contact_phone}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
        <Badge variant={statusVariant[conversation.status] ?? "default"} className="text-[10px]">
          {conversation.status}
        </Badge>
        <span className="text-[11px] text-zinc-400">
          {new Date(conversation.last_message_at).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </Link>
  )
}
