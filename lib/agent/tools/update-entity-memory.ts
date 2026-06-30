import { updateEntityMemory } from "@/lib/memory/entity"

export async function updateEntity(
  conversationId: string,
  language?: string,
  preferences?: Record<string, unknown>
): Promise<string> {
  await updateEntityMemory(conversationId, {
    ...(language && { contact_language: language }),
    ...(preferences && { contact_preferences: preferences }),
  })
  return "Customer profile updated."
}
