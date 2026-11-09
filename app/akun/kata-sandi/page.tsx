import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { PasswordForm } from "./password-form";
import { getViewerState } from "@/lib/auth";
import { homeForRole } from "@/lib/access";
import { signOutAction } from "@/lib/auth-actions";

const notices: Record<string, string> = {
  "belum-aktivasi": "Akun Anda belum terhubung ke data wali. Selesaikan proses di bawah ini.",
  "profil-belum-aktif": "Akun ini belum memiliki profil aplikasi. Selesaikan aktivasi akun wali di bawah ini.",
};

// Activation reads the session from cookies; it must never be prerendered as a static page.
export const dynamic = "force-dynamic";

export default async function KataSandiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const state = await getViewerState();

  if (state.status === "anonymous") redirect("/login?alasan=sesi-berakhir");
  if (state.status === "unconfigured") {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <BrandLogo className="auth-logo" />
          <h1>Database belum dikonfigurasi</h1>
          <p className="auth-copy">
            Aktivasi akun belum dapat dilakukan karena koneksi database belum diatur. Hubungi Operator Utama.
          </p>
          <Link className="auth-back" href="/">
            Kembali ke beranda
          </Link>
        </section>
      </main>
    );
  }

  const { viewer } = state;
  if (viewer.profile) redirect(homeForRole(viewer.profile.role));

  const params = await searchParams;
  const rawReason = typeof params.alasan === "string" ? params.alasan : null;
  const notice = rawReason ? notices[rawReason] : undefined;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <BrandLogo className="auth-logo" />
        <p className="eyebrow">AKTIVASI AKUN WALI</p>
        <h1>Buat kata sandi</h1>
        <p className="auth-copy">
          Email <strong>{viewer.email ?? "Anda"}</strong> sudah diverifikasi. Buat kata sandi untuk menyelesaikan
          aktivasi. Akses hanya dibuka jika email terdaftar oleh Operator Utama dan memiliki siswa dengan layanan aktif.
        </p>

        {notice && (
          <p className="form-alert info" role="status">
            {notice}
          </p>
        )}

        <PasswordForm />

        <form action={signOutAction} className="auth-secondary">
          <button type="submit">Keluar dari akun ini</button>
        </form>

        <p className="auth-footnote">
          Jika aktivasi ditolak, akses tidak akan dibuka. Pesan penolakan akan menjelaskan langkah berikutnya tanpa
          menampilkan data siswa atau akun lain.
        </p>
      </section>
    </main>
  );
}
