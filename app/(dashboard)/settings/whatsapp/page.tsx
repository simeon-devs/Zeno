"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveWhatsApp } from "@/app/(dashboard)/settings/actions"

export default function WhatsAppSettingsPage() {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  async function handleSubmit(formData: FormData) {
    setStatus("saving")
    const result = await saveWhatsApp(formData)
    setStatus(result.success ? "saved" : "error")
    setTimeout(() => setStatus("idle"), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">Configure your WhatsApp connection.</p>
      </div>

      <div className="space-y-1">
        <div className="flex gap-4 text-sm border-b border-zinc-100 pb-1">
          <Link href="/settings" className="text-zinc-400 hover:text-zinc-600 pb-1">
            Profile & AI
          </Link>
          <span className="font-medium text-zinc-900 border-b-2 border-zinc-900 pb-1">WhatsApp</span>
        </div>
      </div>

      <section className="space-y-6">
        <div>
          <h2 className="font-semibold">WhatsApp Credentials</h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            Found in your Meta Developer Console → WhatsApp → Getting Started.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp_phone_id">Phone Number ID</Label>
            <Input
              id="whatsapp_phone_id"
              name="whatsapp_phone_id"
              placeholder="12147107617722093"
              defaultValue="12147107617722093"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp_token">Access Token</Label>
            <Input
              id="whatsapp_token"
              name="whatsapp_token"
              type="password"
              placeholder="EAABxx..."
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
      </section>
    </div>
  )
}
