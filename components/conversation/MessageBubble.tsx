import type { Message } from "@/lib/db/messages"

export default function MessageBubble({ message }: { message: Message }) {
  const isInbound = message.direction === "inbound"

  return (
    <div className={`flex ${isInbound ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
          isInbound
            ? "bg-white border border-zinc-200 text-zinc-900 rounded-tl-sm"
            : "bg-zinc-900 text-white rounded-tr-sm"
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
        <p className={`text-[10px] mt-1 ${isInbound ? "text-zinc-400" : "text-zinc-400"}`}>
          {message.sent_by === "ai" ? "Zeno AI · " : message.sent_by === "human" ? "You · " : ""}
          {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  )
}
