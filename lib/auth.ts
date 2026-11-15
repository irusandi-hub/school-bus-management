import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { homeForRole } from "@/lib/access";
import { DEV_DRIVER_RECORD, DEV_GUARDIAN_VIEWERS, DEV_VIEWER, isDevOpenAccess } from "@/lib/dev-open-access";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ProfileRow, UserRole } from "@/lib/types";
import { getDemoSession } from "@/lib/demo-session";
import { demoIdentity } from "@/lib/demo-session-token";

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
  {
    const demoSession = await getDemoSession();
    if (demoSession) {
      const identity = demoIdentity(demoSession);
      return {
        status: "authenticated",
        viewer: {
          userId: identity.userId,
          email: identity.email,
          profile: {
            id: identity.userId,
            full_name: identity.fullName,
            role: identity.profileRole,
            phone: null,
          },
        },
      };
    }
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
 * simulasi untuk areanya sendiri, sehingga ketiga ekosistem dapat ditinjau bersamaan tanpa
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

/**
 * Compatibility gate for legacy /admin routes and Server Actions.
 * Both legacy admin accounts and operator accounts resolve to the single global
 * Operator workspace. This alias must remain until legacy route files are moved.
 */
export async function requireAdmin(nextPath = "/operator"): Promise<AdminAccess> {
  const access = await requireOperator(nextPath);
  if (access.status === "unconfigured") return access;
  return { status: "ready", viewer: access.viewer };
}

export type OperatorAccess =
  | { status: "unconfigured" }
  | { status: "ready"; viewer: Viewer; operator: { id: string; name: string } };

/**
 * The Operator is the single global authority of the platform. Legacy admin
 * profiles remain valid during account migration; new operator profiles receive
 * the same global workspace without requiring a company/operator row.
 *
 * Database RLS must be updated by the paired migration before this code is deployed.
 */
export async function requireOperator(nextPath = "/operator"): Promise<OperatorAccess> {
  if (isDevOpenAccess()) {
    const demoSession = await getDemoSession();
    if (demoSession) {
      const identity = demoIdentity(demoSession);
      if (identity.profileRole !== "operator") redirectToOwnArea(identity.profileRole);
      return {
        status: "ready",
        viewer: { userId: identity.userId, email: identity.email, profile: { id: identity.userId, full_name: identity.fullName, role: "operator", phone: null } },
        operator: { id: "global", name: "Operator Utama" },
      };
    }
    return {
      status: "ready",
      viewer: devViewerFor("operator"),
      operator: { id: "global", name: "Operator Utama" },
    };
  }

  const viewer = await requireViewer(nextPath);
  if (!viewer) return { status: "unconfigured" };

  const profile = requireProfile(viewer);
  if (profile.role !== "operator" && profile.role !== "admin") redirectToOwnArea(profile.role);

  return {
    status: "ready",
    viewer,
    operator: { id: "global", name: "Operator Utama" },
  };
}
export type DriverAccess =
  | { status: "unconfigured" }
  | { status: "ready"; viewer: Viewer; driver: { id: string; full_name: string } };

/** Driver access requires the database role AND an active driver row for the account. */
export async function requireDriver(nextPath = "/pengemudi"): Promise<DriverAccess> {
  if (isDevOpenAccess()) {
    const demoSession = await getDemoSession();
    if (demoSession) {
      const identity = demoIdentity(demoSession);
      if (identity.profileRole !== "driver") redirectToOwnArea(identity.profileRole);
      return {
        status: "ready",
        viewer: { userId: identity.userId, email: identity.email, profile: { id: identity.userId, full_name: identity.fullName, role: "driver", phone: null } },
        driver: { id: DEV_DRIVER_RECORD.id, full_name: DEV_DRIVER_RECORD.fullName },
      };
    }
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
  | { status: "ready"; viewer: Viewer; guardianId?: string };

/**
 * Non-redirecting guardian check for route handlers. Pages may use `redirect()`,
 * but an API must answer with a status code the client can handle instead of an
 * HTML login page.
 */
export async function guardianRequestAccess(): Promise<
  "unconfigured" | "anonymous" | "forbidden" | "ready"
> {
  if (isDevOpenAccess()) {
    const demoSession = await getDemoSession();
    return demoSession ? (demoSession.role === "wali" ? "ready" : "forbidden") : "ready";
  }

  const state = await getViewerState();
  if (state.status === "unconfigured") return "unconfigured";
  if (state.status === "anonymous") return "anonymous";
  if (!state.viewer.profile || state.viewer.profile.role !== "parent") return "forbidden";
  return "ready";
}

/** Server-side gate for the guardian area. */
export async function requireGuardian(nextPath = "/wali"): Promise<GuardianAccess> {
  if (isDevOpenAccess()) {
    const demoSession = await getDemoSession();
    if (demoSession) {
      const identity = demoIdentity(demoSession);
      if (identity.profileRole !== "parent") redirectToOwnArea(identity.profileRole);
      return {
        status: "ready",
        viewer: { userId: identity.userId, email: identity.email, profile: { id: identity.userId, full_name: identity.fullName, role: "parent", phone: null } },
        guardianId: identity.guardianId,
      };
    }
  }

  if (isDevOpenAccess()) {
    const cookieStore = await cookies();
    const selectedKey = cookieStore.get("sbm_demo_guardian")?.value;
    const selected =
      selectedKey === "two" || selectedKey === "three"
        ? DEV_GUARDIAN_VIEWERS[selectedKey]
        : DEV_GUARDIAN_VIEWERS.one;
    const viewer: Viewer = {
      userId: selected.userId,
      email: selected.email,
      profile: {
        id: selected.userId,
        full_name: selected.fullName,
        role: "parent",
        phone: null,
      },
    };
    return { status: "ready", viewer, guardianId: selected.guardianId };
  }

  const viewer = await requireViewer(nextPath);
  if (!viewer) return { status: "unconfigured" };

  const profile = requireProfile(viewer);
  if (profile.role !== "parent") redirectToOwnArea(profile.role);

  return { status: "ready", viewer };
}
