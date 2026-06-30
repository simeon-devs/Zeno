import Link from "next/link"
import { getCompany } from "@/lib/db/companies"
import { getFaqs } from "@/lib/db/faqs"
import ProfileForm from "@/components/settings/ProfileForm"
import FAQEditor from "@/components/settings/FAQEditor"
import { Separator } from "@/components/ui/separator"

const DEFAULT_COMPANY = {
  id: null as string | null,
  name: "",
  description: "",
  tone: "professional_friendly",
  response_length: "medium",
  language: "auto",
  fallback_message: "Thank you for reaching out! Our team will get back to you shortly.",
  auto_reply_enabled: false,
}

export default async function SettingsPage() {
  const company = await getCompany()
  const profile = company ?? DEFAULT_COMPANY
  const faqs = company ? await getFaqs(company.id) : []

  return (
    <div className="max-w-2xl mx-auto px-8 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Configure how Zeno replies on behalf of your business.
        </p>
      </div>

      <div className="space-y-1">
        <div className="flex gap-4 text-sm border-b border-zinc-100 pb-1">
          <span className="font-medium text-zinc-900 border-b-2 border-zinc-900 pb-1">Profile & AI</span>
          <Link href="/settings/whatsapp" className="text-zinc-400 hover:text-zinc-600 pb-1">
            WhatsApp
          </Link>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">Business Profile</h2>
          <p className="text-zinc-500 text-xs mt-0.5">This is what the AI knows about your business.</p>
        </div>
        <ProfileForm company={profile} />
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">Knowledge Base (FAQs)</h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            The AI searches these when answering customer questions.
          </p>
        </div>
        <FAQEditor faqs={faqs} />
      </section>
    </div>
  )
}
