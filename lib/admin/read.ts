import { requireAdmin } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ServerSupabase } from "@/lib/admin/support";

/**
 * For global Operator pages. The layout already gates access; this repeats the check so a
 * page rendered outside the layout still cannot read data without an Operator session.
 */
export async function adminReadContext(): Promise<ServerSupabase | null> {
  const access = await requireAdmin();
  if (access.status === "unconfigured") return null;
  return createServerSupabase();
}
