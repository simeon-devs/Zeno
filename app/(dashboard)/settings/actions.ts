"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { upsertFaq, deleteFaq } from "@/lib/db/faqs"
import { embedAndStoreFaq } from "@/lib/ai/embeddings"

const profileSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  tone: z.enum(["professional_friendly", "formal", "casual", "sales_focused"]),
  response_length: z.enum(["short", "medium", "detailed"]),
  language: z.enum(["auto", "en", "ar", "en_ar"]),
  fallback_message: z.string().min(1),
  auto_reply_enabled: z.boolean(),
})

const whatsappSchema = z.object({
  whatsapp_phone_id: z.string().min(1),
  whatsapp_token: z.string().min(1),
})

async function getCompanyId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single()

  return data?.id ?? null
}

export async function saveProfile(formData: FormData) {
  const companyId = await getCompanyId()
  if (!companyId) return { error: "Not authenticated" }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    tone: formData.get("tone"),
    response_length: formData.get("response_length"),
    language: formData.get("language"),
    fallback_message: formData.get("fallback_message"),
    auto_reply_enabled: formData.get("auto_reply_enabled") === "true",
  })

  if (!parsed.success) return { error: "Invalid data" }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from("companies")
    .update(parsed.data)
    .eq("id", companyId)

  if (error) return { error: error.message }

  revalidatePath("/settings")
  return { success: true }
}

export async function saveWhatsApp(formData: FormData) {
  const companyId = await getCompanyId()
  if (!companyId) return { error: "Not authenticated" }

  const parsed = whatsappSchema.safeParse({
    whatsapp_phone_id: formData.get("whatsapp_phone_id"),
    whatsapp_token: formData.get("whatsapp_token"),
  })

  if (!parsed.success) return { error: "Invalid data" }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from("companies")
    .update(parsed.data)
    .eq("id", companyId)

  if (error) return { error: error.message }

  revalidatePath("/settings/whatsapp")
  return { success: true }
}

export async function saveFaq(formData: FormData) {
  const companyId = await getCompanyId()
  if (!companyId) return { error: "Not authenticated" }

  const faqId = formData.get("faq_id") as string | null
  const question = formData.get("question") as string
  const answer = formData.get("answer") as string

  if (!question || !answer) return { error: "Question and answer required" }

  const id = await upsertFaq(companyId, faqId || null, question, answer)
  if (!id) return { error: "Failed to save FAQ" }

  // embed in background — don't block the UI
  embedAndStoreFaq(id, question, answer).catch(console.error)

  revalidatePath("/settings")
  return { success: true }
}

export async function removeFaq(formData: FormData) {
  const faqId = formData.get("faq_id") as string
  if (!faqId) return { error: "Missing FAQ id" }

  await deleteFaq(faqId)
  revalidatePath("/settings")
  return { success: true }
}
