"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveWhatsApp } from "@/app/(dashboard)/settings/actions"

interface Props {
  phoneId: string
  hasToken: boolean
}

export default function WhatsAppForm({ phoneId, hasToken }: Props) {
  const [phone, setPhone] = useState(phoneId)
  const [token, setToken] = useState("")
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("saving")
    const formData = new FormData()
    formData.set("whatsapp_phone_id", phone)
    formData.set("whatsapp_token", token)
    const result = await saveWhatsApp(formData)
    setStatus(result.success ? "saved" : "error")
    if (result.success) setToken("")
    setTimeout(() => setStatus("idle"), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="whatsapp_phone_id">Phone Number ID</Label>
        <Input
          id="whatsapp_phone_id"
          name="whatsapp_phone_id"
          placeholder="12147107617722093"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="whatsapp_token">Access Token</Label>
        <Input
          id="whatsapp_token"
          name="whatsapp_token"
          type="password"
          placeholder={hasToken ? "Token saved — paste a new one to replace" : "EAABxx..."}
          value={token}
          onChange={e => setToken(e.target.value)}
          required={!hasToken}
        />
        <p className="text-xs text-zinc-400">
          Note: the temporary token expires every 24h. Paste a fresh one here when it does.
        </p>
      </div>
      <Button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving..." : status === "saved" ? "Saved ✓" : "Save credentials"}
      </Button>
      {status === "error" && <p className="text-sm text-red-600">Failed to save. Try again.</p>}
    </form>
  )
}
