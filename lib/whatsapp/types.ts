export interface WhatsAppTextMessage {
  messaging_product: "whatsapp"
  from: string
  id: string
  timestamp: string
  type: "text"
  text: { body: string }
}

export interface WhatsAppContact {
  profile: { name: string }
  wa_id: string
}

export interface WhatsAppWebhookEntry {
  id: string
  changes: Array<{
    value: {
      messaging_product: "whatsapp"
      metadata: {
        display_phone_number: string
        phone_number_id: string
      }
      contacts?: WhatsAppContact[]
      messages?: WhatsAppTextMessage[]
      statuses?: Array<{ id: string; status: string }>
    }
    field: string
  }>
}

export interface WhatsAppWebhookPayload {
  object: "whatsapp_business_account"
  entry: WhatsAppWebhookEntry[]
}
