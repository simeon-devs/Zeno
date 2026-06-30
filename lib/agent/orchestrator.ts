import { generateWithTools } from "@/lib/ai/gemini"
import { buildSystemPrompt } from "@/lib/ai/prompt"
import { runTool } from "./runner"
import { createServiceClient } from "@/lib/supabase/service"
import { SchemaType, type Tool } from "@google/generative-ai"

export interface AgentInput {
  companyId: string
  conversationId: string
  incomingMessage: string
}

const AGENT_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "search_faqs",
        description: "Search the company FAQ knowledge base for answers relevant to the customer's question.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: { type: SchemaType.STRING, description: "The search query based on the customer's message" },
          },
          required: ["query"],
        },
      },
      {
        name: "get_business_info",
        description: "Retrieve the company's general business information, name, and description.",
        parameters: { type: SchemaType.OBJECT, properties: {} },
      },
      {
        name: "get_conversation_history",
        description: "Retrieve the recent conversation history and summary for context.",
        parameters: { type: SchemaType.OBJECT, properties: {} },
      },
      {
        name: "update_entity_memory",
        description: "Update the customer profile with detected language or preferences.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            language: { type: SchemaType.STRING, description: "Detected customer language code, e.g. 'en' or 'ar'" },
            preferences: { type: SchemaType.STRING, description: "JSON string of key-value pairs of detected customer preferences" },
          },
        },
      },
      {
        name: "escalate",
        description: "Flag this conversation for human review when the AI cannot confidently answer.",
        parameters: { type: SchemaType.OBJECT, properties: {} },
      },
    ],
  },
]

export async function runAgent(input: AgentInput): Promise<string | null> {
  const supabase = createServiceClient()

  const { data: company } = await supabase
    .from("companies")
    .select("name, description, tone, response_length, language, fallback_message")
    .eq("id", input.companyId)
    .single()

  if (!company) return null

  const systemPrompt = buildSystemPrompt(company)
  const context = { companyId: input.companyId, conversationId: input.conversationId }

  // ReAct loop — max 5 steps to prevent infinite loops
  const MAX_STEPS = 5
  const observations: string[] = []
  let currentMessage = input.incomingMessage

  for (let step = 0; step < MAX_STEPS; step++) {
    const messageWithContext =
      observations.length > 0
        ? `${currentMessage}\n\nContext gathered so far:\n${observations.join("\n---\n")}`
        : currentMessage

    const { text, functionCall } = await generateWithTools(
      systemPrompt,
      messageWithContext,
      AGENT_TOOLS
    )

    // agent decided to call a tool
    if (functionCall) {
      const observation = await runTool(
        functionCall.name,
        functionCall.args as Record<string, string>,
        context
      )
      observations.push(`Tool: ${functionCall.name}\nResult: ${observation}`)

      // if agent escalated, return the fallback message
      if (functionCall.name === "escalate") {
        return company.fallback_message
      }

      continue
    }

    // agent produced a final text response
    if (text) return text.trim()

    break
  }

  return company.fallback_message
}
