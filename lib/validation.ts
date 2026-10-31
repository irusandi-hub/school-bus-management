export type FieldErrors = Record<string, string>;

export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: FieldErrors;
};

export const idleState: ActionState = { status: "idle", message: "" };

export function failure(message: string, fieldErrors?: FieldErrors): ActionState {
  return { status: "error", message, fieldErrors };
}

export function success(message: string): ActionState {
  return { status: "success", message };
}

export function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function readOptionalText(formData: FormData, name: string): string | null {
  const value = readText(formData, name);
  return value === "" ? null : value;
}

export function readCheckbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

/** Uppercase alphanumeric code used for school and operator identifiers. */
export function normalizeCode(value: string): string {
  return value
    .trim()
    .toUpperCase()
    // Any run of separators becomes a single hyphen so "SCH_001" and "SCH 001" both
    // read as SCH-001 instead of silently collapsing to SCH001.
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20)
    .replace(/-+$/g, "");
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Free-text search is passed to PostgREST filters, so characters that carry filter
 * syntax are removed instead of escaped by hand.
 */
export function sanitizeSearch(value: string): string {
  return value.replace(/[,()*\\"]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value) && value.length <= 254;
}

const ADMISSIONS_PATTERN = /^[A-Za-z0-9/-]{2,32}$/;

export function isValidAdmissionsNumber(value: string): boolean {
  return ADMISSIONS_PATTERN.test(value);
}

export function isValidPhone(value: string): boolean {
  return /^\+?[0-9][0-9\s-]{6,19}$/.test(value);
}

export type ParseCoordinateResult = { ok: true; value: number | null } | { ok: false; message: string };

export function parseCoordinate(value: string, kind: "latitude" | "longitude"): ParseCoordinateResult {
  const trimmed = value.trim();
  if (trimmed === "") return { ok: true, value: null };

  const parsed = Number(trimmed.replace(",", "."));
  if (!Number.isFinite(parsed)) {
    return { ok: false, message: "Koordinat harus berupa angka." };
  }

  const limit = kind === "latitude" ? 90 : 180;
  if (parsed < -limit || parsed > limit) {
    return {
      ok: false,
      message: kind === "latitude" ? "Lintang harus antara -90 dan 90." : "Bujur harus antara -180 dan 180.",
    };
  }

  return { ok: true, value: Number(parsed.toFixed(6)) };
}

export const SERVICE_STATUSES = ["active", "paused", "ended"] as const;
export type ServiceStatusValue = (typeof SERVICE_STATUSES)[number];

export const serviceStatusOptions: { value: ServiceStatusValue; label: string }[] = [
  { value: "active", label: "Aktif menggunakan layanan" },
  { value: "paused", label: "Sementara tidak menggunakan" },
  { value: "ended", label: "Layanan dihentikan" },
];

export function isServiceStatus(value: string): value is ServiceStatusValue {
  return (SERVICE_STATUSES as readonly string[]).includes(value);
}

export function serviceStatusLabel(value: string): string {
  if (value === "active") return "Aktif";
  if (value === "paused") return "Sementara tidak aktif";
  if (value === "ended") return "Dihentikan";
  return "Tidak diketahui";
}

export function routeDirectionLabel(value: string): string {
  if (value === "morning") return "Pagi";
  if (value === "afternoon") return "Sore";
  return "Tidak diketahui";
}

export function tripStatusLabel(value: string): string {
  switch (value) {
    case "scheduled":
      return "Dijadwalkan";
    case "in_progress":
      return "Berlangsung";
    case "completed":
      return "Selesai";
    case "cancelled":
      return "Dibatalkan";
    case "delayed":
      return "Tertunda";
    default:
      return "Tidak diketahui";
  }
}

export function tripEventLabel(value: string): string {
  switch (value) {
    case "boarded":
      return "Sudah naik";
    case "dropped_off":
      return "Sudah turun";
    case "absent":
      return "Tidak ikut";
    case "issue":
      return "Kendala";
    default:
      return "Belum dicatat";
  }
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value.length <= 10 ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function validateLength(
  value: string,
  label: string,
  min: number,
  max: number,
): string | null {
  if (value.length < min || value.length > max) {
    return `${label} harus ${min}–${max} karakter.`;
  }
  return null;
}
