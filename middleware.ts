import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
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
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  try {
    await supabase.auth.getUser();
  } catch {
    // Silently handle auth errors in middleware
  }

  return response;
}

export const config = {
  matcher: [String.raw`/((?!_next/static|_next/image|favicon.ico|.*\.svg$).*)`],
};
