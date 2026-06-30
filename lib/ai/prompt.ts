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

You have access to tools to search the business FAQ and retrieve conversation history. Always use these tools before answering to ensure your response is accurate.

If you cannot find relevant information to answer confidently, use the escalate tool to flag the conversation for human review rather than guessing.

Fallback message if unsure: "${company.fallback_message}"`
}
