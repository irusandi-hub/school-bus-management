/**
 * Mode akses terbuka untuk pengembangan UI (DEC-024, disempurnakan DEC-025).
 *
 * Tujuan: ketiga ekosistem aplikasi dapat ditinjau tanpa registrasi/login pada
 * lingkungan non-produksi, sementara produksi tetap tertutup penuh.
 *
 * Satu aturan lingkungan, dipakai oleh middleware, layout area, Server Action,
 * dan klien database:
 * - Lingkungan ditentukan dari penanda platform, bukan dari nama domain/URL.
 * - `production` selalu tertutup, sekalipun `DEV_OPEN_ACCESS=1` terpasang salah.
 * - Lingkungan yang tidak dikenali (mis. `NODE_ENV=production` tanpa penanda
 *   Vercel) juga tertutup — fail-closed.
 * - `preview` (VERCEL_ENV=preview, disuntikkan Vercel sendiri) dan `development`
 *   (lokal) terbuka secara default, sehingga deploy Preview langsung dapat dibuka
 *   tanpa perlu menambah variabel lingkungan di dashboard Vercel.
 * - Sakelar darurat: `DEV_OPEN_ACCESS=0` (atau false/off/no) menutup mode ini di
 *   lingkungan mana pun yang bukan produksi.
 * - Saat aktif, klien Supabase tidak pernah dibuat, sehingga tidak mungkin
 *   menyentuh database produksi atau melemahkan RLS. Data berasal dari dataset
 *   simulasi berlabel di memori server.
 *
 * Gerbang otorisasi asli tidak dihapus: begitu mode ini tertutup, pemeriksaan
 * sesi, peran, dan RLS kembali berlaku penuh.
 */

const DISABLE_VALUES = new Set(["0", "false", "off", "no", "disabled"]);
const DEV_MARKERS = new Set(["development", "dev", "local", "preview", "test", "testing"]);
const PRODUCTION_MARKERS = new Set(["production", "prod"]);

export type DeploymentKind = "production" | "preview" | "development" | "unknown";

function readEnv(key: string): string {
  return (process.env[key] ?? "").trim().toLowerCase();
}

/** Penanda lingkungan aplikasi yang boleh menyatakan mode non-produksi. */
function declaredAppEnv(): string {
  return readEnv("NEXT_PUBLIC_APP_ENV") || readEnv("APP_ENV");
}

/**
 * Menentukan jenis lingkungan deployment secara eksplisit. Penanda produksi
 * selalu menang atas penanda lain agar salah konfigurasi tidak membuka akses.
 */
export function deploymentKind(): DeploymentKind {
  const vercelEnv = readEnv("VERCEL_ENV");
  const nodeEnv = readEnv("NODE_ENV");
  const declared = declaredAppEnv();
  const productionFlag = readEnv("PRODUCTION") || readEnv("APP_ENV_PRODUCTION");

  if (vercelEnv === "production") return "production";
  if (productionFlag === "1" || productionFlag === "true") return "production";
  if (PRODUCTION_MARKERS.has(declared)) return "production";
  if (declared && !DEV_MARKERS.has(declared)) return "unknown";

  // Vercel Preview juga menjalankan Next.js dengan NODE_ENV=production saat build
  // maupun runtime, jadi penanda platform harus dibaca lebih dulu.
  if (vercelEnv === "preview") return "preview";
  if (vercelEnv === "development") return "development";
  if (vercelEnv) return "unknown";

  if (nodeEnv === "production") return "unknown";
  if (nodeEnv === "development" || nodeEnv === "test") return "development";

  return "unknown";
}

/**
 * `true` hanya pada lingkungan non-produksi yang dikenali secara eksplisit dan
 * tidak dimatikan lewat sakelar `DEV_OPEN_ACCESS` (DEC-025).
 */
export function isDevOpenAccess(): boolean {
  const kind = deploymentKind();
  if (kind !== "preview" && kind !== "development") return false;

  return !DISABLE_VALUES.has(readEnv("DEV_OPEN_ACCESS"));
}

export const DEV_OPEN_ACCESS_NOTICE =
  "Mode pengembangan aktif: ketiga ekosistem terbuka tanpa login dan memakai data simulasi berlabel. Semua baris berasal dari dataset contoh di memori server, bukan data siswa, wali, atau armada nyata. Perubahan hilang saat server dimulai ulang.";

/** Label lingkungan untuk pita peringatan, supaya tidak disalahartikan sebagai produksi. */
export function devAccessEnvironmentLabel(): string {
  const kind = deploymentKind();
  if (kind === "preview") return "Vercel Preview";
  if (kind === "development") return "lokal";
  return "tidak dikenal";
}

/**
 * Identitas simulasi per area; id-nya dipakai juga oleh dataset simulasi. Bentuknya
 * UUID sintetis yang seluruh nibble terakhirnya angka/sandi yang mudah dikenali,
 * sehingga validasi format id di Server Action tetap dapat diuji tanpa data nyata.
 */
export const DEV_VIEWER = {
  operator: {
    userId: "51111111-0000-4000-8000-0000000000a2",
    email: "operator.contoh@example.test",
    fullName: "Operator Contoh",
  },
  driver: {
    userId: "51111111-0000-4000-8000-0000000000a3",
    email: "pengemudi.contoh@example.test",
    fullName: "Pengemudi Contoh",
  },
  parent: {
    userId: "51111111-0000-4000-8000-0000000000a4",
    email: "wali.contoh@example.test",
    fullName: "Wali Contoh Satu",
  },
} as const;

/** Data perusahaan/pengemudi simulasi yang dipakai gerbang area operator dan pengemudi. */
export const DEV_COMPANY = {
  id: "51111111-0000-4000-8000-0000000001b1",
  name: "Perusahaan Bus Contoh Nusantara",
} as const;
export const DEV_DRIVER_RECORD = {
  id: "51111111-0000-4000-8000-0000000004e1",
  fullName: "Pengemudi Contoh Satu",
} as const;
