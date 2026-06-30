import { getConversationMemory, formatMemoryForPrompt } from "@/lib/memory/episodic"

export async function getConversationHistory(conversationId: string): Promise<string> {
  const memory = await getConversationMemory(conversationId)
  const formatted = formatMemoryForPrompt(memory)
  return formatted || "No previous conversation history."
}
