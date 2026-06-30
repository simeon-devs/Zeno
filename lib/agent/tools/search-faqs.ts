import { searchSimilarFaqs } from "@/lib/memory/semantic"

export async function searchFaqs(
  query: string,
  companyId: string
): Promise<string> {
  const results = await searchSimilarFaqs(query, companyId, 3)

  if (!results.length) return "No relevant FAQs found."

  return results
    .map((r) => `Q: ${r.question}\nA: ${r.answer}`)
    .join("\n\n")
}
