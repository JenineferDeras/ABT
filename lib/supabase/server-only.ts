import "server-only";

import { createServerClient, type CookieMethods } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Validate required environment variables for Supabase
 */
function validateEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return { url, anonKey };
}

/**
 * Creates a Supabase server client for use in Server Components and Server Actions.
 * This function should only be called on the server side.
 *
 * @throws {Error} If required environment variables are missing or auth fails
 */
export async function createClient() {
  try {
    const { url, anonKey } = validateEnv();
    const cookieStore = await cookies();

    const cookieMethods: CookieMethods = {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: Array<{ name: string; value: string; options?: unknown }>
      ) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // Only set cookie options if provided and valid
          if (options && typeof options === "object") {
            cookieStore.set(
              name,
              value,
              options as Parameters<typeof cookieStore.set>[2]
            );
          } else {
            cookieStore.set(name, value);
          }
        });
      },
    };

    return createServerClient(url, anonKey, {
      cookies: cookieMethods,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create Supabase client: ${error.message}`);
    }
    throw error;
  }
}
