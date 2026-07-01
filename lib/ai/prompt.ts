export interface CompanyContext {
  name: string
  description: string
  tone: string
  response_length: string
  language: string
  fallback_message: string
}

const toneMap: Record<string, string> = {
  professional_friendly: "professional yet warm and friendly",
  formal: "formal and polite",
  casual: "casual and conversational",
  sales_focused: "enthusiastic and sales-oriented",
}

const lengthMap: Record<string, string> = {
  short: "Keep replies to 1-2 sentences maximum.",
  medium: "Keep replies to one clear paragraph.",
  detailed: "Provide thorough, detailed responses.",
}

const languageMap: Record<string, string> = {
  auto: "Detect the customer's language and reply in the same language.",
  en: "Always reply in English.",
  ar: "Always reply in Arabic.",
  en_ar: "Reply in both English and Arabic.",
}

export function buildSystemPrompt(company: CompanyContext): string {
  return `You are the AI assistant for ${company.name}.

About the business:
${company.description}

Tone: Be ${toneMap[company.tone] ?? company.tone}.
Length: ${lengthMap[company.response_length] ?? lengthMap.medium}
Language: ${languageMap[company.language] ?? languageMap.auto}

You have access to tools to search the business FAQ and retrieve conversation history. Always use search_faqs and get_business_info before answering.

For greetings, general questions, or anything you can reasonably answer from the business context — reply directly. Only use the escalate tool as a last resort when the question is completely outside your knowledge and truly requires a human (e.g. complaints, emergencies, complex negotiations). Never escalate just because a message seems vague.

Fallback message if unsure: "${company.fallback_message}"`
}
