import type { Message } from "@/lib/db/messages"

export default function MessageBubble({ message }: { message: Message }) {
  const isInbound = message.direction === "inbound"

  return (
    <div className={`flex ${isInbound ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
          isInbound ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.body}</p>
        <p className={`text-[10px] mt-1 ${isInbound ? "text-zinc-400" : "text-zinc-300"}`}>
          {message.sent_by === "ai" ? "AI · " : message.sent_by === "human" ? "You · " : ""}
          {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  )
}
