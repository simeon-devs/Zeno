import { searchFaqs } from "./tools/search-faqs"
import { getBusinessInfo } from "./tools/get-business-info"
import { getConversationHistory } from "./tools/get-conversation-history"
import { updateEntity } from "./tools/update-entity-memory"
import { escalateConversation } from "./tools/escalate"

export interface ToolCallArgs {
  query?: string
  conversationId?: string
  companyId?: string
  language?: string
  preferences?: Record<string, unknown>
}

export async function runTool(
  toolName: string,
  args: ToolCallArgs,
  context: { companyId: string; conversationId: string }
): Promise<string> {
  switch (toolName) {
    case "search_faqs":
      return searchFaqs(args.query ?? "", context.companyId)

    case "get_business_info":
      return getBusinessInfo(context.companyId)

    case "get_conversation_history":
      return getConversationHistory(context.conversationId)

    case "update_entity_memory":
      return updateEntity(context.conversationId, args.language, args.preferences)

    case "escalate":
      return escalateConversation(context.conversationId)

    default:
      return `Unknown tool: ${toolName}`
  }
}
