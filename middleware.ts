import { createServerClient, type CookieMethods } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      console.error(
        "Missing required environment variables in middleware: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
      return NextResponse.next();
    }

    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const cookieMethods: CookieMethods = {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{ name: string; value: string; options?: unknown }>
      ) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // Only set cookie options if provided and valid
          if (options && typeof options === "object") {
            response.cookies.set(
              name,
              value,
              options as Parameters<typeof response.cookies.set>[2]
            );
          } else {
            response.cookies.set(name, value);
          }
        });
      },
    };

    const supabase = createServerClient(url, anonKey, {
      cookies: cookieMethods,
    });

    // Call getUser with error handling
    try {
      await supabase.auth.getUser();
    } catch (authError) {
      console.error("Auth error in middleware:", authError);
      // Continue even if auth fails - user may be unauthenticated
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
