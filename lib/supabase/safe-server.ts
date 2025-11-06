/**
 * Safe Supabase server utilities that avoid Edge Runtime issues
 * Use these in Server Components to ensure Node.js runtime
 */

import { cache } from "react";

// Mark this module as requiring Node runtime
export const runtime = "nodejs";

export const getServerSupabaseClient = cache(async () => {
  const { createClient } = await import("./server");
  return createClient();
});

/**
 * Example usage in Server Component:
 *
 * import { getServerSupabaseClient } from "@/lib/supabase/safe-server";
 *
 * export default async function Page() {
 *   const supabase = await getServerSupabaseClient();
 *   const { data } = await supabase.from("table").select("*");
 *   return <div>{JSON.stringify(data)}</div>;
 * }
 */
