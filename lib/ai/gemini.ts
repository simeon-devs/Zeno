import { GoogleGenerativeAI, type Tool, type FunctionCall } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateWithTools(
  systemPrompt: string,
  userMessage: string,
  tools: Tool[]
): Promise<{ text: string | null; functionCall: FunctionCall | null }> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    tools,
    systemInstruction: systemPrompt,
  })

  const result = await model.generateContent(userMessage)
  const part = result.response.candidates?.[0]?.content?.parts?.[0]

  if (part?.functionCall) {
    return { text: null, functionCall: part.functionCall }
  }

  return { text: result.response.text(), functionCall: null }
}

export async function generateText(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function embedText(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
  const result = await model.embedContent(text)
  return result.embedding.values
}
