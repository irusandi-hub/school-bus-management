/**
 * Mode akses terbuka untuk pengembangan UI (DEC-024).
 *
 * Aturan keamanan yang berlaku di sini:
 * - Harus diaktifkan secara eksplisit lewat `DEV_OPEN_ACCESS`. Tanpa variabel itu
 *   aplikasi tetap tertutup (fail-closed).
 * - Tidak pernah aktif saat `NODE_ENV=production`, `VERCEL_ENV=production`, atau
 *   penanda produksi apa pun.
 * - Penanda lingkungan (`APP_ENV` / `NEXT_PUBLIC_APP_ENV`) harus jelas menyatakan
 *   development/local/preview; nilai lain yang tidak dikenal membuat mode ditutup.
 * - Saat mode ini aktif, klien Supabase tidak pernah dibuat dan kredensial tidak
 *   pernah dipakai, sehingga tidak mungkin menyentuh database produksi atau
 *   melemahkan RLS. Data yang dilayani berasal dari dataset simulasi berlabel.
 *
 * Mekanisme otorisasi final tidak dihapus: setiap gerbang tetap ada dan kembali
 * berlaku penuh begitu variabel dev dimatikan.
 */

const ENABLE_VALUES = new Set(["1", "true", "yes", "on"]);
const DEV_MARKERS = new Set(["development", "dev", "local", "preview"]);

export function isDevOpenAccess(): boolean {
  const flag = (process.env.DEV_OPEN_ACCESS ?? "").trim().toLowerCase();
  if (!ENABLE_VALUES.has(flag)) return false;

  // Produksi selalu tertutup, sekalipun flag salah terpasang.
  if (process.env.VERCEL_ENV === "production") return false;
  if ((process.env.PRODUCTION ?? "").trim() === "1") return false;

  const nodeEnv = (process.env.NODE_ENV ?? "").trim().toLowerCase();
  const vercelEnv = (process.env.VERCEL_ENV ?? "").trim().toLowerCase();
  const declared = (process.env.NEXT_PUBLIC_APP_ENV ?? process.env.APP_ENV ?? "").trim().toLowerCase();

  // Preview Vercel menjalankan Next.js dengan NODE_ENV=production saat runtime.
  // Karena itu preview hanya dibuka jika kedua penanda preview cocok dan flag eksplisit aktif.
  const isExplicitVercelPreview = vercelEnv === "preview" && declared === "preview";
  if (isExplicitVercelPreview) return true;

  // Untuk lokal: NODE_ENV harus development/test dan penanda aplikasi, bila ada,
  // harus menyatakan development/local. Lingkungan asing tetap fail-closed.
  if (nodeEnv === "production") return false;
  if (!DEV_MARKERS.has(nodeEnv) && nodeEnv !== "test") return false;
  if (declared && !DEV_MARKERS.has(declared)) return false;

  return true;
}

export const DEV_OPEN_ACCESS_NOTICE =
  "Mode pengembangan aktif: keempat area terbuka tanpa login dan memakai data simulasi berlabel. Semua baris berasal dari dataset contoh di memori server, bukan data siswa, wali, atau armada nyata. Perubahan hilang saat server dimulai ulang.";

/**
 * Identitas simulasi per area; id-nya dipakai juga oleh dataset simulasi. Bentuknya
 * UUID sintetis yang seluruh nibble terakhirnya angka/sandi yang mudah dikenali,
 * sehingga validasi format id di Server Action tetap dapat diuji tanpa data nyata.
 */
export const DEV_VIEWER = {
  admin: { userId: "51111111-0000-4000-8000-0000000000a1", email: "admin.contoh@example.test", fullName: "Admin Contoh" },
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

/** Baris organisasi/pengemudi simulasi yang dipakai gerbang area operator dan pengemudi. */
export const DEV_ORGANISATION = {
  id: "51111111-0000-4000-8000-0000000001b1",
  name: "Operator Contoh Nusantara",
} as const;
export const DEV_DRIVER_RECORD = {
  id: "51111111-0000-4000-8000-0000000004e1",
  fullName: "Pengemudi Contoh Satu",
} as const;
