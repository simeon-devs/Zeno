import MessageBubble from "@/components/conversation/MessageBubble"
import type { Message } from "@/lib/db/messages"

export default function MessageThread({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return <div className="p-8 text-center text-sm text-zinc-400">No messages yet.</div>
  }

  return (
    <div className="flex flex-col gap-3 p-6 bg-zinc-50 min-h-[400px]">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
    </div>
  )
}
