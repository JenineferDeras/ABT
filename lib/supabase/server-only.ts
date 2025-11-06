import "server-only";

import { createServerClient, type CookieMethods } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase server client for use in Server Components and Server Actions.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const cookieMethods: CookieMethods = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(
      cookiesToSet: Array<{ name: string; value: string; options?: unknown }>
    ) {
      cookiesToSet.forEach(({ name, value }) => {
        cookieStore.set(name, value);
      });
    },
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieMethods,
    }
  );
}
