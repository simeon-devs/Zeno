export async function sendWhatsAppMessage(
  to: string,
  body: string,
  phoneNumberId: string,
  accessToken: string
): Promise<void> {
  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`WhatsApp send failed: ${error}`)
  }
}
