import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase server client for use in Server Components and Server Actions.
 * Uses cookie-based authentication following Supabase SSR patterns.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const formatOptions = (options?: CookieOptions) => {
    if (!options) {
      return undefined;
    }

    if (typeof options.sameSite === "string") {
      return {
        ...options,
        sameSite: options.sameSite.toLowerCase() as "lax" | "strict" | "none",
      };
    }

    return options;
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          const formattedOptions = formatOptions(options);
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
          const formattedOptions = formatOptions(options);
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
