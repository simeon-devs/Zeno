import { createServiceClient } from "@/lib/supabase/service"

export async function escalateConversation(conversationId: string): Promise<string> {
  const supabase = createServiceClient()
  await supabase
    .from("conversations")
    .update({ status: "escalated" })
    .eq("id", conversationId)

  return "Conversation flagged for human review."
}
