import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          const formattedOptions = formatOptions(options);
          if (formattedOptions) {
            response.cookies.set({
              name,
              value,
              ...formattedOptions,
            });
          } else {
            response.cookies.set({
              name,
              value,
            });
          }
        },
        remove(name: string, options?: CookieOptions) {
          const formattedOptions = formatOptions(options);
          if (formattedOptions) {
            response.cookies.delete({
              name,
              ...formattedOptions,
            });
          } else {
            response.cookies.delete(name);
          }
        },
      },
    }
  );

  try {
    await supabase.auth.getUser();
  } catch {
    // Silently handle auth errors in middleware
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
