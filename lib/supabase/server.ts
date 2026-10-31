import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig } from "@/lib/supabase/env";

/**
 * Server-side Supabase client bound to the request cookies.
 * Returns null when the project has not configured Supabase yet, so pages can render
 * an explicit configuration notice instead of failing at build or request time.
 */
export async function createServerSupabase() {
  const config = supabaseConfig();
  if (!config) return null;

  const cookieStore = await cookies();

  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component render. Middleware refreshes the session instead.
        }
      },
    },
  });
}
