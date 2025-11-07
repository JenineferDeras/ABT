import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <main className="min-h-screen">
      <nav className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <Link href="/auth/logout">
              <Button variant="outline">Sign Out</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Welcome back!</h2>
          <p className="text-muted-foreground">
            Email: {user.email}
          </p>
          <p className="text-muted-foreground">
            User ID: {user.id}
          </p>
        </div>
      </div>
    </main>
  )
}
