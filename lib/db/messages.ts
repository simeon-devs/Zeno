import { createClient } from "@/lib/supabase/server"

export interface Message {
  id: string
  direction: "inbound" | "outbound"
  body: string
  sent_by: "customer" | "ai" | "human"
  created_at: string
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("messages")
    .select("id, direction, body, sent_by, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  return data ?? []
}
