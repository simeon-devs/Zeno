import { createServiceClient } from "@/lib/supabase/service"

export async function getBusinessInfo(companyId: string): Promise<string> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from("companies")
    .select("name, description, tone, language")
    .eq("id", companyId)
    .single()

  if (!data) return "Business information not available."

  return `Company: ${data.name}\nDescription: ${data.description}`
}
