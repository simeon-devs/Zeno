import { createServiceClient } from "@/lib/supabase/service"

export async function getEntityMemory(conversationId: string) {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from("conversations")
    .select("contact_name, contact_language, contact_preferences")
    .eq("id", conversationId)
    .single()

  return data ?? { contact_name: null, contact_language: null, contact_preferences: {} }
}

export async function updateEntityMemory(
  conversationId: string,
  updates: { contact_language?: string; contact_preferences?: Record<string, unknown> }
) {
  const supabase = createServiceClient()
  await supabase
    .from("conversations")
    .update(updates)
    .eq("id", conversationId)
}
