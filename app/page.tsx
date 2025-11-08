import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-2xl space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Welcome to Your App
          </h1>
          <p className="text-xl text-muted-foreground">
            A modern Next.js starter with Supabase integration
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/auth/login">
            <Button size="lg">Sign In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="lg" variant="outline">
              Create Account
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-6 text-left">
            <h3 className="mb-2 font-semibold">Next.js 15</h3>
            <p className="text-sm text-muted-foreground">
              Latest React framework with App Router
            </p>
          </div>
          <div className="rounded-lg border p-6 text-left">
            <h3 className="mb-2 font-semibold">Supabase</h3>
            <p className="text-sm text-muted-foreground">
              Open source Firebase alternative
            </p>
          </div>
          <div className="rounded-lg border p-6 text-left">
            <h3 className="mb-2 font-semibold">TypeScript</h3>
            <p className="text-sm text-muted-foreground">
              Type-safe development with strict mode
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
