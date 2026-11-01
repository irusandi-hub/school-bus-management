import { redirect } from "next/navigation";
import { homeForRole } from "@/lib/access";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ProfileRow, UserRole } from "@/lib/types";

const knownRoles: UserRole[] = ["admin", "operator", "driver", "parent"];

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
 * chooses its own role; picking a card on the access gate does not change these
 * values, and every area below re-checks the role it needs.
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

/** Resolves the viewer or redirects. Shared by every area gate below. */
async function requireViewer(nextPath: string): Promise<Viewer | null> {
  const state = await getViewerState();

  if (state.status === "unconfigured") return null;
  if (state.status === "anonymous") {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return state.viewer;
}

function requireProfile(viewer: Viewer): ProfileRow {
  if (!viewer.profile) redirect("/akun/kata-sandi?alasan=profil-belum-aktif");
  return viewer.profile;
}

/** Sends a signed-in user to the area that matches their database role. */
function redirectToOwnArea(role: UserRole): never {
  redirect(homeForRole(role));
}

export type AdminAccess = { status: "unconfigured" } | { status: "ready"; viewer: Viewer };

/** Server-side gate for every Admin Pusat page and action. */
export async function requireAdmin(nextPath = "/admin"): Promise<AdminAccess> {
  const viewer = await requireViewer(nextPath);
  if (!viewer) return { status: "unconfigured" };

  const profile = requireProfile(viewer);
  if (profile.role !== "admin") redirectToOwnArea(profile.role);

  return { status: "ready", viewer };
}

export type OperatorAccess =
  | { status: "unconfigured" }
  | { status: "ready"; viewer: Viewer; operator: { id: string; name: string } };

/**
 * Operator access requires the database role AND an active operator row linked to the
 * account. A role without an organisation must not see any organisation data.
 */
export async function requireOperator(nextPath = "/operator"): Promise<OperatorAccess> {
  const viewer = await requireViewer(nextPath);
  if (!viewer) return { status: "unconfigured" };

  const profile = requireProfile(viewer);
  if (profile.role !== "operator") redirectToOwnArea(profile.role);

  const supabase = await createServerSupabase();
  if (!supabase) return { status: "unconfigured" };

  const { data: operator } = await supabase
    .from("operators")
    .select("id, name")
    .eq("profile_id", viewer.userId)
    .eq("active", true)
    .maybeSingle();

  if (!operator) redirect("/tanpa-akses?alasan=operator-belum-tertaut");

  return {
    status: "ready",
    viewer,
    operator: { id: operator.id as string, name: operator.name as string },
  };
}

export type DriverAccess =
  | { status: "unconfigured" }
  | { status: "ready"; viewer: Viewer; driver: { id: string; full_name: string } };

/** Driver access requires the database role AND an active driver row for the account. */
export async function requireDriver(nextPath = "/pengemudi"): Promise<DriverAccess> {
  const viewer = await requireViewer(nextPath);
  if (!viewer) return { status: "unconfigured" };

  const profile = requireProfile(viewer);
  if (profile.role !== "driver") redirectToOwnArea(profile.role);

  const supabase = await createServerSupabase();
  if (!supabase) return { status: "unconfigured" };

  const { data: driver } = await supabase
    .from("drivers")
    .select("id, full_name")
    .eq("profile_id", viewer.userId)
    .eq("active", true)
    .maybeSingle();

  if (!driver) redirect("/tanpa-akses?alasan=pengemudi-belum-tertaut");

  return {
    status: "ready",
    viewer,
    driver: { id: driver.id as string, full_name: (driver.full_name as string) ?? "" },
  };
}

export type GuardianAccess =
  | { status: "unconfigured" }
  | { status: "ready"; viewer: Viewer };

/** Server-side gate for the guardian area. */
export async function requireGuardian(nextPath = "/wali"): Promise<GuardianAccess> {
  const viewer = await requireViewer(nextPath);
  if (!viewer) return { status: "unconfigured" };

  const profile = requireProfile(viewer);
  if (profile.role !== "parent") redirectToOwnArea(profile.role);

  return { status: "ready", viewer };
}
