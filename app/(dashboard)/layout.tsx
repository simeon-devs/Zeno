import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { MessageSquare, Settings, LogOut, Zap } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="flex h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-zinc-200 flex flex-col">
        <div className="px-5 py-5 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-zinc-900" />
            <span className="font-bold text-lg tracking-tight">Zeno</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link href="/inbox">
            <Button variant="ghost" className="w-full justify-start gap-2 font-normal">
              <MessageSquare className="h-4 w-4" />
              Inbox
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start gap-2 font-normal">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </nav>

        <div className="px-3 py-4 border-t border-zinc-100">
          <p className="text-xs text-zinc-400 px-2 mb-2 truncate">{user.email}</p>
          <form action="/auth/signout" method="post">
            <Button variant="ghost" className="w-full justify-start gap-2 font-normal text-zinc-500" type="submit">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
