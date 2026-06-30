import { createServiceClient } from "@/lib/supabase/service"
import { verifyWebhookChallenge } from "@/lib/whatsapp/verify"
import { sendWhatsAppMessage } from "@/lib/whatsapp/send"
import { runAgent } from "@/lib/agent/orchestrator"
import type { WhatsAppWebhookPayload } from "@/lib/whatsapp/types"

// GET — Meta calls this once to verify the webhook URL
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  return verifyWebhookChallenge(searchParams) ?? new Response("Forbidden", { status: 403 })
}

// POST — Meta calls this for every incoming message
export async function POST(request: Request) {
  let payload: WhatsAppWebhookPayload

  try {
    payload = await request.json()
  } catch {
    return new Response("Bad Request", { status: 400 })
  }

  // always return 200 immediately — Meta retries if we take too long
  processWebhook(payload).catch(console.error)

  return new Response("OK", { status: 200 })
}

async function processWebhook(payload: WhatsAppWebhookPayload) {
  const supabase = createServiceClient()

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value
      if (!value.messages?.length) continue

      const phoneNumberId = value.metadata.phone_number_id
      const message = value.messages[0]

      // only handle text messages for now
      if (message.type !== "text") continue

      const contactPhone = message.from
      const contactName = value.contacts?.[0]?.profile?.name ?? null
      const messageBody = message.text.body

      // find company by phone number id; fall back to env var match (test number)
      let { data: company } = await supabase
        .from("companies")
        .select("id, auto_reply_enabled, whatsapp_token")
        .eq("whatsapp_phone_id", phoneNumberId)
        .single()

      if (!company && phoneNumberId === process.env.META_PHONE_NUMBER_ID) {
        // use the first company in the DB (single-tenant demo setup)
        const { data: fallback } = await supabase
          .from("companies")
          .select("id, auto_reply_enabled, whatsapp_token")
          .order("created_at", { ascending: true })
          .limit(1)
          .single()
        company = fallback
      }

      if (!company) continue

      // find or create the conversation
      const { data: conversation } = await supabase
        .from("conversations")
        .upsert(
          { company_id: company.id, contact_phone: contactPhone, contact_name: contactName, last_message_at: new Date().toISOString() },
          { onConflict: "company_id,contact_phone" }
        )
        .select("id")
        .single()

      if (!conversation) continue

      // save inbound message
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        direction: "inbound",
        body: messageBody,
        sent_by: "customer",
        wa_message_id: message.id,
      })

      if (!company.auto_reply_enabled) continue

      // run the agentic reply pipeline
      const reply = await runAgent({
        companyId: company.id,
        conversationId: conversation.id,
        incomingMessage: messageBody,
      })

      if (!reply) continue

      // send reply via Meta API
      const token = company.whatsapp_token ?? process.env.META_ACCESS_TOKEN!
      const pid = phoneNumberId ?? process.env.META_PHONE_NUMBER_ID!

      await sendWhatsAppMessage(contactPhone, reply, pid, token)

      // save outbound message
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        direction: "outbound",
        body: reply,
        sent_by: "ai",
      })
    }
  }
}

