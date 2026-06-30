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

  // await processing so Vercel doesn't kill it before it completes
  await processWebhook(payload).catch(console.error)

  return new Response("OK", { status: 200 })
}

async function processWebhook(payload: WhatsAppWebhookPayload) {
  console.log("[webhook] payload:", JSON.stringify(payload, null, 2))
  const supabase = createServiceClient()

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value
      console.log("[webhook] change value:", JSON.stringify(value, null, 2))
      if (!value.messages?.length) {
        console.log("[webhook] skipping — no messages in value")
        continue
      }

      const phoneNumberId = value.metadata.phone_number_id
      const message = value.messages[0]

      // only handle text messages for now
      if (message.type !== "text") continue

      const contactPhone = message.from
      const contactName = value.contacts?.[0]?.profile?.name ?? null
      const messageBody = message.text.body

      // find company by phone number id; fall back to first company (demo/test setup)
      let { data: company, error: companyErr } = await supabase
        .from("companies")
        .select("id, auto_reply_enabled, whatsapp_token")
        .eq("whatsapp_phone_id", phoneNumberId)
        .single()

      console.log("[webhook] company by phone_id:", company, companyErr?.message)

      if (!company) {
        const { data: fallback, error: fallbackErr } = await supabase
          .from("companies")
          .select("id, auto_reply_enabled, whatsapp_token")
          .order("created_at", { ascending: true })
          .limit(1)
          .single()
        console.log("[webhook] fallback company:", fallback, fallbackErr?.message)
        company = fallback
      }

      if (!company) { console.log("[webhook] no company found, skipping"); continue }

      // find or create the conversation
      const { data: conversation, error: convErr } = await supabase
        .from("conversations")
        .upsert(
          { company_id: company.id, contact_phone: contactPhone, contact_name: contactName, last_message_at: new Date().toISOString() },
          { onConflict: "company_id,contact_phone" }
        )
        .select("id")
        .single()

      console.log("[webhook] conversation:", conversation, convErr?.message)

      if (!conversation) continue

      // save inbound message
      const { error: msgErr } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        direction: "inbound",
        body: messageBody,
        sent_by: "customer",
        wa_message_id: message.id,
      })
      console.log("[webhook] message insert error:", msgErr?.message)

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

