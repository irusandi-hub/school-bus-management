import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isDevOpenAccess } from "@/lib/dev-open-access";
import { supabaseConfig } from "@/lib/supabase/env";
import { getDemoSession } from "@/lib/demo-session";
import { demoIdentity } from "@/lib/demo-session-token";
import { demoReadOnlyMessage } from "@/lib/demo-read-only";

type RealServerClient = NonNullable<Awaited<ReturnType<typeof createRealServerSupabase>>>;

/**
 * Server-side Supabase client bound to the request cookies.
 * Returns null when the project has not configured Supabase yet, so pages can render
 * an explicit configuration notice instead of failing at build or request time.
 */
async function createRealServerSupabase() {
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

/**
 * Saat mode akses terbuka pengembangan (DEC-024) aktif, klien Supabase sungguhan
 * tidak pernah dibuat: permintaan dilayani klien simulasi yang membaca dataset
 * berlabel di memori. Dengan begitu mode terbuka tidak mungkin menyentuh database
 * produksi dan tidak memengaruhi RLS sama sekali.
 */
export async function createServerSupabase(): Promise<RealServerClient | null> {
  // A signed demo session always uses the isolated simulation dataset. Preview
  // sessions may write; production demo sessions are strictly read-only.
  const demoSession = await getDemoSession();
  if (demoSession) {
    const { createSimulationClient } = await import("@/lib/dev-simulation/client");
    const readOnly = !isDevOpenAccess();
    const message = readOnly ? await demoReadOnlyMessage() : undefined;
    return createSimulationClient(demoIdentity(demoSession), readOnly, message) as unknown as RealServerClient;
  }

  if (isDevOpenAccess()) {
    const { createSimulationClient } = await import("@/lib/dev-simulation/client");
    return createSimulationClient() as unknown as RealServerClient;
  }

  return createRealServerSupabase();
}
