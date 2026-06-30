import { getCompany } from "@/lib/db/companies"
import { getConversations } from "@/lib/db/conversations"
import ConversationList from "@/components/inbox/ConversationList"

export default async function InboxPage() {
  const company = await getCompany()
  const conversations = company ? await getConversations(company.id) : []

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-8 py-6 border-b border-zinc-100">
        <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
        <p className="text-zinc-500 mt-1 text-sm">Your WhatsApp conversations.</p>
      </div>
      <ConversationList conversations={conversations} />
    </div>
  )
}
