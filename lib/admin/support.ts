import { DEV_VIEWER, isDevOpenAccess } from "@/lib/dev-open-access";
import { createServerSupabase } from "@/lib/supabase/server";
import { supabaseNotConfiguredMessage } from "@/lib/supabase/env";
import { failure, type ActionState } from "@/lib/validation";
import { getDemoSession } from "@/lib/demo-session";
import { demoIdentity } from "@/lib/demo-session-token";
import { demoReadOnlyMessage } from "@/lib/demo-read-only";

export type ServerSupabase = NonNullable<Awaited<ReturnType<typeof createServerSupabase>>>;

type DbError = { code?: string; message?: string; details?: string | null } | null;

export const PAGE_SIZE = 20;

export type AdminActionContext =
  | { ok: true; supabase: ServerSupabase; userId: string }
  | { ok: false; state: ActionState };

/**
 * Every platform mutation requires an authenticated session whose database profile role
 * is `operator` (or legacy `admin` during migration). Row level security enforces the
 * same global Operator authority independently.
 */
export async function adminActionContext(): Promise<AdminActionContext> {
  const demoSession = await getDemoSession();
  if (demoSession && !isDevOpenAccess()) return { ok: false, state: failure(await demoReadOnlyMessage()) };
  if (demoSession && isDevOpenAccess() && demoIdentity(demoSession).profileRole !== "operator") {
    return { ok: false, state: failure("Akun simulasi ini tidak memiliki izin Operator untuk tindakan ini.") };
  }
  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, state: failure(supabaseNotConfiguredMessage) };

  // Mode akses terbuka pengembangan memakai identitas Operator simulasi.
  if (isDevOpenAccess() && !demoSession) return { ok: true, supabase, userId: DEV_VIEWER.operator.userId };
  if (demoSession) return { ok: true, supabase, userId: demoIdentity(demoSession).userId };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, state: failure("Sesi Anda sudah berakhir. Muat ulang halaman lalu masuk kembali.") };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  if (profile?.role !== "operator" && profile?.role !== "admin") {
    return { ok: false, state: failure("Akun Anda tidak memiliki izin Operator untuk tindakan ini.") };
  }

  return { ok: true, supabase, userId: user.id };
}

/**
 * Maps database errors to safe Indonesian messages. Internal codes are logged for
 * diagnostics; constraint names, SQL text and personal data are never sent to the UI.
 */
export function writeFailure(
  error: DbError,
  messages: { unique?: string; foreignKey?: string; fallback?: string } = {},
): ActionState {
  console.error("[admin] write failed", error?.code ?? "unknown");

  switch (error?.code) {
    case "23505":
      return failure(messages.unique ?? "Data dengan kode atau identitas tersebut sudah ada. Gunakan nilai lain.");
    case "23503":
      return failure(
        messages.foreignKey ??
          "Data terkait tidak ditemukan atau masih dipakai oleh data lain, sehingga perubahan belum tersimpan.",
      );
    case "23514":
      return failure("Data belum memenuhi ketentuan. Periksa kembali rentang nilai dan isian wajib.");
    case "42501":
      return failure("Akun Anda tidak memiliki izin untuk perubahan ini.");
    default:
      return failure(messages.fallback ?? "Perubahan belum tersimpan. Periksa koneksi Anda lalu coba lagi.");
  }
}

export type OperatorActionContext =
  | { ok: true; supabase: ServerSupabase; userId: string }
  | { ok: false; state: ActionState };

/**
 * Legacy operator-area mutations use the same global Operator authority. Company/operator
 * rows remain optional data attribution and are not authorization boundaries.
 */
export async function operatorActionContext(): Promise<OperatorActionContext> {
  const demoSession = await getDemoSession();
  if (demoSession && !isDevOpenAccess()) return { ok: false, state: failure(await demoReadOnlyMessage()) };
  if (demoSession && isDevOpenAccess() && demoIdentity(demoSession).profileRole !== "operator") {
    return { ok: false, state: failure("Akun simulasi ini tidak memiliki izin Operator untuk tindakan ini.") };
  }
  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, state: failure(supabaseNotConfiguredMessage) };

  // Development preview uses the dedicated simulated Operator identity.
  if (isDevOpenAccess() && !demoSession) return { ok: true, supabase, userId: DEV_VIEWER.operator.userId };
  if (demoSession) return { ok: true, supabase, userId: demoIdentity(demoSession).userId };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, state: failure("Sesi Anda sudah berakhir. Muat ulang halaman lalu masuk kembali.") };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "operator" && profile?.role !== "admin") {
    return { ok: false, state: failure("Akun Anda tidak memiliki izin Operator untuk tindakan ini.") };
  }

  return { ok: true, supabase, userId: user.id };
}

export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw ?? "1");
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

export function pageRange(page: number) {
  const from = (page - 1) * PAGE_SIZE;
  return { from, to: from + PAGE_SIZE - 1 };
}
