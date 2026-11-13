import { redirect } from "next/navigation";
import { homeForRole } from "@/lib/access";
import { DEV_DRIVER_RECORD, DEV_ORGANISATION, DEV_VIEWER, isDevOpenAccess } from "@/lib/dev-open-access";
import { createServerSupabase } from "@/lib/supabase/server";
import { demoAccountUserId, getDemoOtpAccount } from "@/lib/demo-otp-session";
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
  const demoAccount = await getDemoOtpAccount();
  if (demoAccount) {
    const userId = demoAccountUserId(demoAccount);
    return {
      status: "authenticated",
      viewer: {
        userId,
        email: demoAccount.id + "@demo.schoolbus.example.test",
        profile: { id: userId, full_name: demoAccount.name, role: demoAccount.role, phone: null },
      },
    };
  }

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

/**
 * Mode akses terbuka pengembangan (DEC-024): setiap gerbang area menyajikan identitas
 * simulasi untuk areanya sendiri, sehingga keempat area dapat ditinjau bersamaan tanpa
 * login. Pemeriksaan peran yang sesunguhnya tetap ada di `profiles.role` dan RLS
 * database, dan kembali berlaku penuh begitu `DEV_OPEN_ACCESS` dimatikan.
 */
function devViewerFor(kind: keyof typeof DEV_VIEWER): Viewer {
  const identity = DEV_VIEWER[kind];
  return {
    userId: identity.userId,
    email: identity.email,
    profile: {
      id: identity.userId,
      full_name: identity.fullName,
      role: kind as UserRole,
      phone: null,
    },
  };
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
  if (isDevOpenAccess()) return { status: "ready", viewer: devViewerFor("admin") };

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
  const demoAccount = await getDemoOtpAccount();
  if (demoAccount?.role === "operator") {
    const userId = demoAccountUserId(demoAccount);
    return {
      status: "ready",
      viewer: { userId, email: demoAccount.id + "@demo.schoolbus.example.test", profile: {
        id: userId, full_name: demoAccount.name, role: "operator", phone: null,
      } },
      operator: { id: DEV_ORGANISATION.id, name: DEV_ORGANISATION.name },
    };
  }

  if (isDevOpenAccess()) {
    return {
      status: "ready",
      viewer: devViewerFor("operator"),
      operator: { id: DEV_ORGANISATION.id, name: DEV_ORGANISATION.name },
    };
  }

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
  const demoAccount = await getDemoOtpAccount();
  if (demoAccount?.role === "driver") {
    const userId = demoAccountUserId(demoAccount);
    return {
      status: "ready",
      viewer: { userId, email: demoAccount.id + "@demo.schoolbus.example.test", profile: {
        id: userId, full_name: demoAccount.name, role: "driver", phone: null,
      } },
      driver: { id: DEV_DRIVER_RECORD.id, full_name: demoAccount.name },
    };
  }

  if (isDevOpenAccess()) {
    return {
      status: "ready",
      viewer: devViewerFor("driver"),
      driver: { id: DEV_DRIVER_RECORD.id, full_name: DEV_DRIVER_RECORD.fullName },
    };
  }

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
  const demoAccount = await getDemoOtpAccount();
  if (demoAccount?.role === "parent") {
    const userId = demoAccountUserId(demoAccount);
    return {
      status: "ready",
      viewer: { userId, email: demoAccount.id + "@demo.schoolbus.example.test", profile: {
        id: userId, full_name: demoAccount.name, role: "parent", phone: null,
      } },
    };
  }

  if (isDevOpenAccess()) return { status: "ready", viewer: devViewerFor("parent") };

  const viewer = await requireViewer(nextPath);
  if (!viewer) return { status: "unconfigured" };

  const profile = requireProfile(viewer);
  if (profile.role !== "parent") redirectToOwnArea(profile.role);

  return { status: "ready", viewer };
}
