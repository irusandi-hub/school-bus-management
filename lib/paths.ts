import type { UserRole } from "./types";

/** Only same-origin absolute paths are accepted as post-login destinations. */
export function safeNextPath(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}

export const roleHome: Record<UserRole, string> = {
  admin: "/admin",
  operator: "/operator",
  driver: "/pengemudi",
  parent: "/wali",
};

export function homeForRole(role: UserRole | null | undefined): string {
  return role ? roleHome[role] : "/tanpa-akses";
}

/**
 * A post-login destination is only honoured when it belongs to the area of the role
 * that the database returned. A guardian sending `next=/admin` is redirected to the
 * guardian area instead of being granted a different workspace.
 */
export function scopedNext(role: UserRole, raw: string | null | undefined): string {
  const home = roleHome[role];
  const next = safeNextPath(raw, home);
  if (next === home || next.startsWith(`${home}/`)) return next;
  return home;
}
