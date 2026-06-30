import { createServiceClient } from "@/lib/supabase/service"

export interface MessageRecord {
  direction: string
  body: string
  sent_by: string
  created_at: string
}

export interface ConversationMemory {
  summary: string | null
  recentMessages: MessageRecord[]
}

export async function getConversationMemory(
  conversationId: string
): Promise<ConversationMemory> {
  const supabase = createServiceClient()

  const [{ data: messages }, { data: conversation }] = await Promise.all([
    supabase
      .from("messages")
      .select("direction, body, sent_by, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("conversations")
      .select("summary")
      .eq("id", conversationId)
      .single(),
  ])

  return {
    summary: conversation?.summary ?? null,
    recentMessages: (messages ?? []).reverse(),
  }
}

export function formatMemoryForPrompt(memory: ConversationMemory): string {
  const parts: string[] = []

  if (memory.summary) {
    parts.push(`Conversation summary: ${memory.summary}`)
  }

  if (memory.recentMessages.length > 0) {
    const history = memory.recentMessages
      .map((m) => `${m.sent_by === "customer" ? "Customer" : "Agent"}: ${m.body}`)
      .join("\n")
    parts.push(`Recent messages:\n${history}`)
  }

  return parts.join("\n\n")
}
