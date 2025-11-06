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

// Cookie helpers that properly handle getAll/setAll for @supabase/ssr
export const cookieClient = {
  cookies: {
    async getAll() {
      const cookieStore = await cookies();
      return cookieStore.getAll();
    },
    async setAll(
      cookiesToSet: Array<{
        name: string;
        value: string;
        options?: CookieOptions;
      }>
    ) {
      const cookieStore = await cookies();
      cookiesToSet.forEach(({ name, value, options }) => {
        cookieStore.set(name, value, options);
      });
    },
  },
};

/**
 * Creates a Supabase server client for use in Server Components and Server Actions.
 * This function should only be called on the server side.
 *
 * @throws {Error} If required environment variables are missing
 */
export async function createClient() {
  const { env } = await import("./env");

  return createServerClient(
    env.public.SUPABASE_URL,
    env.public.SUPABASE_ANON_KEY,
    {
      cookies: cookieClient.cookies as CookieMethods,
    }
  );
}
