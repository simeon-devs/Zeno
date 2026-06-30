"use server"

import { revalidatePath } from "next/cache"
import { createServiceClient } from "@/lib/supabase/service"

export async function toggleAiReply(conversationId: string, enabled: boolean) {
  const supabase = createServiceClient()
  await supabase
    .from("conversations")
    .update({ status: enabled ? "active" : "escalated" })
    .eq("id", conversationId)
  revalidatePath(`/conversations/${conversationId}`)
  return { success: true }
}

export async function sendManualReply(conversationId: string, body: string) {
  const supabase = createServiceClient()

  const { data: conversation } = await supabase
    .from("conversations")
    .select("company_id, contact_phone")
    .eq("id", conversationId)
    .single()

  if (!conversation) return { error: "Conversation not found" }

  const { data: company } = await supabase
    .from("companies")
    .select("whatsapp_phone_id, whatsapp_token")
    .eq("id", conversation.company_id)
    .single()

  // send via WhatsApp
  const phoneId = company?.whatsapp_phone_id ?? process.env.META_PHONE_NUMBER_ID!
  const token = company?.whatsapp_token ?? process.env.META_ACCESS_TOKEN!

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneId}/messages`,
    {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: conversation.contact_phone,
        type: "text",
        text: { body },
      }),
    }
  )

  if (!res.ok) return { error: "Failed to send message" }

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    direction: "outbound",
    body,
    sent_by: "human",
  })

  revalidatePath(`/conversations/${conversationId}`)
  return { success: true }
}
