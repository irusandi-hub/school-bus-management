import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "./login-form";
import { homeForRole } from "@/lib/access";
import { getViewerState } from "@/lib/auth";
import { safeNextPath } from "@/lib/paths";

const reasons: Record<string, string> = {
  "sesi-berakhir": "Sesi Anda sudah berakhir. Silakan masuk kembali untuk melanjutkan.",
  "belum-aktivasi": "Akun Anda belum diaktifkan. Selesaikan verifikasi email dan pembuatan kata sandi terlebih dahulu.",
  auth_callback: "Tautan verifikasi tidak dapat diproses. Minta tautan baru dari halaman Aktivasi Akun.",
};

const doors: Record<string, { label: string; detail: string }> = {
  admin: {
    label: "Admin & Operator",
    detail:
      "Gunakan akun staf. Area Admin Pusat dan area operator ditentukan dari peran serta keterkaitan organisasi pada akun Anda.",
  },
  pengemudi: {
    label: "Pengemudi",
    detail:
      "Gunakan akun pengemudi yang sudah ditautkan Admin Pusat. Setelah masuk, Anda diarahkan ke tugas hari ini.",
  },
  wali: {
    label: "Orang Tua/Wali",
    detail:
      "Gunakan email dan kata sandi akun wali. Akun harus didaftarkan Admin Pusat dan memiliki siswa dengan layanan aktif.",
  },
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawNext = typeof params.next === "string" ? params.next : null;
  const rawReason = typeof params.alasan === "string" ? params.alasan : null;
  const peran = typeof params.peran === "string" ? params.peran : null;
  const reason = rawReason ? reasons[rawReason] : undefined;
  const door = peran ? doors[peran] : undefined;

  // A signed-in user is never shown the login form again; they are sent to the area of
  // their database role instead of the area whose card they clicked earlier.
  const state = await getViewerState();
  if (state.status === "authenticated" && state.viewer.profile) {
    redirect(homeForRole(state.viewer.profile.role));
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <BrandLogo href="/" ariaLabel="Kembali ke gerbang akses" className="auth-logo" />
        <p className="eyebrow">SCHOOL BUS MANAGEMENT</p>
        <h1>Masuk ke akun</h1>
        {door ? (
          <p className="auth-door">
            <strong>{door.label}</strong>
            <span>{door.detail}</span>
          </p>
        ) : (
          <p className="auth-copy">
            Gunakan email dan kata sandi akun Anda. Hak akses dibaca dari peran akun di database, bukan dari
            halaman ini.
          </p>
        )}

        <LoginForm next={safeNextPath(rawNext, "")} reason={reason} />

        <p className="auth-footnote">
          Peran akun ditentukan dari data pengguna di server. Lupa kata sandi? Hubungi Admin Pusat untuk pemulihan
          akses.
        </p>

        <div className="auth-links">
          <Link className="auth-back" href="/daftar">
            Aktivasi akun wali
          </Link>
          <Link className="auth-back" href="/">
            Kembali ke gerbang akses
          </Link>
        </div>
      </section>
    </main>
  );
}
