import "server-only";

import { createServerClient, type CookieMethods } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieOptions = {
  maxAge?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
};

// Cookie helpers that properly await cookies()
export const cookieClient = {
  cookies: {
    async get(name: string) {
      const cookieStore = await cookies();
      return cookieStore.get(name)?.value;
    },
    async set(name: string, value: string, options?: CookieOptions) {
      const cookieStore = await cookies();
      cookieStore.set({ name, value, ...options });
    },
    async delete(name: string, options?: CookieOptions) {
      const cookieStore = await cookies();
      if (options && Object.keys(options).length > 0) {
        // delete expects a single object with cookie attributes when using options
        cookieStore.delete({ name, ...options });
      } else {
        // simple delete by name
        cookieStore.delete(name);
      }
    },
  },
};

/**
 * Creates a Supabase server client for use in Server Components and Server Actions.
 * This function should only be called on the server side.
 * 
 * @example
 * // In a Server Component
 * const supabase = await createClient();
 * const { data } = await supabase.from('table').select('*');
 */
export async function createClient() {
  await cookies(); // Ensure cookies are awaited

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieClient.cookies as CookieMethods,
    }
  );
}
