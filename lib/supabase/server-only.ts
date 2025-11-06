import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { normalizeCookieOptions } from "./cookie-utils";

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
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          const formattedOptions = normalizeCookieOptions(options);
          try {
            if (formattedOptions) {
              cookieStore.set({
                name,
                value,
                ...formattedOptions,
              });
            } else {
              cookieStore.set({
                name,
                value,
              });
            }
          } catch {
            // Silently handle cookie setting errors in server context
          }
        },
        remove(name: string, options?: CookieOptions) {
          const formattedOptions = normalizeCookieOptions(options);
          try {
            if (formattedOptions) {
              cookieStore.delete({
                name,
                ...formattedOptions,
              });
            } else {
              cookieStore.delete(name);
            }
          } catch {
            // Silently handle cookie removal errors in server context
          }
        },
      },
    }
  );
}
