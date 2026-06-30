export interface AgentInput {
  companyId: string
  conversationId: string
  incomingMessage: string
}

// Stub — full ReAct implementation comes in Task 5
export async function runAgent(input: AgentInput): Promise<string | null> {
  return null
}
