import { createClient } from "@/lib/supabase/server"

export interface ConversationListItem {
  id: string
  contact_phone: string
  contact_name: string | null
  status: string
  last_message_at: string
}

export async function getConversations(companyId: string): Promise<ConversationListItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("conversations")
    .select("id, contact_phone, contact_name, status, last_message_at")
    .eq("company_id", companyId)
    .order("last_message_at", { ascending: false })

  return data ?? []
}

export async function getConversation(conversationId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single()

  return data
}
