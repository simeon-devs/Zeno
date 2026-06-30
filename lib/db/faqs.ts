import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

export async function getFaqs(companyId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("faqs")
    .select("id, question, answer, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: true })

  return data ?? []
}

export async function upsertFaq(companyId: string, faqId: string | null, question: string, answer: string) {
  const supabase = createServiceClient()

  if (faqId) {
    const { data } = await supabase
      .from("faqs")
      .update({ question, answer, embedding: null })
      .eq("id", faqId)
      .select("id")
      .single()
    return data?.id ?? null
  }

  const { data } = await supabase
    .from("faqs")
    .insert({ company_id: companyId, question, answer })
    .select("id")
    .single()
  return data?.id ?? null
}

export async function deleteFaq(faqId: string) {
  const supabase = createServiceClient()
  await supabase.from("faqs").delete().eq("id", faqId)
}
