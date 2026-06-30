"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { saveProfile } from "@/app/(dashboard)/settings/actions"

const tones = [
  { value: "professional_friendly", label: "Professional & Friendly" },
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "sales_focused", label: "Sales Focused" },
]

const lengths = [
  { value: "short", label: "Short (1-2 sentences)" },
  { value: "medium", label: "Medium (one paragraph)" },
  { value: "detailed", label: "Detailed" },
]

const languages = [
  { value: "auto", label: "Auto-detect" },
  { value: "en", label: "English only" },
  { value: "ar", label: "Arabic only" },
  { value: "en_ar", label: "English + Arabic" },
]

interface Props {
  company: {
    name: string
    description: string
    tone: string
    response_length: string
    language: string
    fallback_message: string
    auto_reply_enabled: boolean
  }
}

export default function ProfileForm({ company }: Props) {
  const [autoReply, setAutoReply] = useState(company.auto_reply_enabled)
  const [name, setName] = useState(company.name)
  const [description, setDescription] = useState(company.description)
  const [tone, setTone] = useState(company.tone)
  const [responseLength, setResponseLength] = useState(company.response_length)
  const [language, setLanguage] = useState(company.language)
  const [fallbackMessage, setFallbackMessage] = useState(company.fallback_message)
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("saving")
    const formData = new FormData()
    formData.set("name", name)
    formData.set("description", description)
    formData.set("tone", tone)
    formData.set("response_length", responseLength)
    formData.set("language", language)
    formData.set("fallback_message", fallbackMessage)
    formData.set("auto_reply_enabled", String(autoReply))
    const result = await saveProfile(formData)
    setStatus(result.success ? "saved" : "error")
    setTimeout(() => setStatus("idle"), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between py-3 border-b border-zinc-100">
        <div>
          <p className="font-medium text-sm">AI Auto-Reply</p>
          <p className="text-xs text-zinc-500">Automatically reply to incoming WhatsApp messages</p>
        </div>
        <Switch checked={autoReply} onCheckedChange={setAutoReply} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Company Name</Label>
        <Input id="name" name="name" value={name} onChange={e => setName(e.target.value)} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Business Description</Label>
        <Textarea
          id="description"
          name="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          placeholder="Describe your business, services, location, and anything the AI should know..."
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tone">AI Tone</Label>
        <select
          id="tone"
          name="tone"
          value={tone}
          onChange={e => setTone(e.target.value)}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
        >
          {tones.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="response_length">Response Length</Label>
        <select
          id="response_length"
          name="response_length"
          value={responseLength}
          onChange={e => setResponseLength(e.target.value)}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
        >
          {lengths.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="language">Reply Language</Label>
        <select
          id="language"
          name="language"
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"
        >
          {languages.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fallback_message">Fallback Message</Label>
        <Textarea
          id="fallback_message"
          name="fallback_message"
          value={fallbackMessage}
          onChange={e => setFallbackMessage(e.target.value)}
          rows={2}
          placeholder="Message sent when AI cannot answer confidently..."
        />
      </div>

      <Button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving..." : status === "saved" ? "Saved ✓" : "Save profile"}
      </Button>
      {status === "error" && <p className="text-sm text-red-600">Failed to save. Try again.</p>}
    </form>
  )
}
