import Link from "next/link"
import { getCompany } from "@/lib/db/companies"
import WhatsAppForm from "@/components/settings/WhatsAppForm"

export default async function WhatsAppSettingsPage() {
  const company = await getCompany()

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
        <WhatsAppForm
          phoneId={company?.whatsapp_phone_id ?? ""}
          hasToken={!!company?.whatsapp_token}
        />
      </section>
    </div>
  )
}
