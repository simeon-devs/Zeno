import { embedText } from "./gemini"
import { createServiceClient } from "@/lib/supabase/service"

export async function embedAndStoreFaq(faqId: string, question: string, answer: string) {
  const text = `${question} ${answer}`
  const embedding = await embedText(text)

  const supabase = createServiceClient()
  await supabase
    .from("faqs")
    .update({ embedding: JSON.stringify(embedding) })
    .eq("id", faqId)
}

export async function searchSimilarFaqs(
  query: string,
  companyId: string,
  matchCount = 3
): Promise<Array<{ question: string; answer: string; similarity: number }>> {
  const embedding = await embedText(query)

  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc("match_faqs", {
    query_embedding: JSON.stringify(embedding),
    filter_company_id: companyId,
    match_count: matchCount,
  })

  if (error || !data) return []
  return data
}
