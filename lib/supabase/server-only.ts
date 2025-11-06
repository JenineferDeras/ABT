import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase server client for use in Server Components and Server Actions.
 * Uses cookie-based authentication following Supabase SSR patterns.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: {
              maxAge?: number;
              path?: string;
              domain?: string;
              sameSite?: "strict" | "lax" | "none";
              secure?: boolean;
              httpOnly?: boolean;
            };
          }>
        ) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch (error) {
            // Silently handle cookie setting errors in server context
          }
        },
      },
    }
  );
}
