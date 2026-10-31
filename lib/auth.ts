import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ProfileRow, UserRole } from "@/lib/types";

const knownRoles: UserRole[] = ["admin", "driver", "parent"];

export type Viewer = {
  userId: string;
  email: string | null;
  profile: ProfileRow | null;
};

export type ViewerState =
  | { status: "unconfigured" }
  | { status: "anonymous" }
  | { status: "authenticated"; viewer: Viewer };

/**
 * Session and role information is always read from the database. The client never
 * chooses its own role; a role picker in the UI would not change these values.
 */
export async function getViewerState(): Promise<ViewerState> {
  const supabase = await createServerSupabase();
  if (!supabase) return { status: "unconfigured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "anonymous" };

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, phone")
    .eq("id", user.id)
    .maybeSingle();

  const profile =
    data && knownRoles.includes(data.role as UserRole)
      ? {
          id: data.id as string,
          full_name: (data.full_name as string) ?? "",
          role: data.role as UserRole,
          phone: (data.phone as string | null) ?? null,
        }
      : null;

  return {
    status: "authenticated",
    viewer: { userId: user.id, email: user.email ?? null, profile },
  };
}

export type AdminAccess = { status: "unconfigured" } | { status: "ready"; viewer: Viewer };

/** Server-side gate for every Admin Pusat page and action. */
export async function requireAdmin(nextPath = "/admin"): Promise<AdminAccess> {
  const state = await getViewerState();

  if (state.status === "unconfigured") return { status: "unconfigured" };
  if (state.status === "anonymous") {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const { viewer } = state;
  if (!viewer.profile) redirect("/akun/kata-sandi?alasan=profil-belum-aktif");
  if (viewer.profile.role === "parent") redirect("/wali");
  if (viewer.profile.role === "driver") redirect("/login?alasan=modul-pengemudi");

  return { status: "ready", viewer };
}

export type GuardianAccess =
  | { status: "unconfigured" }
  | { status: "ready"; viewer: Viewer };

/** Server-side gate for the guardian area. */
export async function requireGuardian(nextPath = "/wali"): Promise<GuardianAccess> {
  const state = await getViewerState();

  if (state.status === "unconfigured") return { status: "unconfigured" };
  if (state.status === "anonymous") {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const { viewer } = state;
  if (!viewer.profile) redirect("/akun/kata-sandi?alasan=profil-belum-aktif");
  if (viewer.profile.role === "admin") redirect("/admin");
  if (viewer.profile.role === "driver") redirect("/login?alasan=modul-pengemudi");

  return { status: "ready", viewer };
}
