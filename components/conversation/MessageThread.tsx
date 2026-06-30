import MessageBubble from "@/components/conversation/MessageBubble"
import type { Message } from "@/lib/db/messages"

export default function MessageThread({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return <div className="p-8 text-center text-sm text-zinc-400">No messages yet.</div>
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
    </div>
  )
}
