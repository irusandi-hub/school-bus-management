import { requireOperator } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";

export async function operatorReadContext() {
  const access = await requireOperator();
  if (access.status === "unconfigured") return null;
  return createServerSupabase();
}
