import Link from "next/link";
import { LoginForm } from "./login-form";
import { safeNextPath } from "@/lib/paths";

const reasons: Record<string, string> = {
  "sesi-berakhir": "Sesi Anda sudah berakhir. Silakan masuk kembali untuk melanjutkan.",
  "belum-aktivasi": "Akun Anda belum diaktifkan. Selesaikan verifikasi email dan pembuatan kata sandi terlebih dahulu.",
  "modul-pengemudi":
    "Modul pengemudi belum tersedia pada tahap ini. Hubungi Admin Pusat bila Anda memerlukan bantuan.",
  "auth_callback": "Tautan verifikasi tidak dapat diproses. Minta tautan baru dari halaman Aktivasi Akun.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawNext = typeof params.next === "string" ? params.next : null;
  const rawReason = typeof params.alasan === "string" ? params.alasan : null;
  const reason = rawReason ? reasons[rawReason] : undefined;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">S</div>
        <p className="eyebrow">SCHOOL BUS MANAGEMENT</p>
        <h1>Masuk ke akun</h1>
        <p className="auth-copy">
          Gunakan email dan kata sandi akun Anda. Akun wali harus didaftarkan lebih dahulu oleh Admin Pusat melalui
          menu Data Siswa &amp; Wali.
        </p>

        <LoginForm next={safeNextPath(rawNext, "/admin")} reason={reason} />

        <p className="auth-footnote">
          Peran akun ditentukan dari data pengguna di server, bukan dari pilihan tampilan. Lupa kata sandi? Hubungi
          Admin Pusat untuk pemulihan akses.
        </p>

        <div className="auth-links">
          <Link className="auth-back" href="/daftar">
            Aktivasi akun wali
          </Link>
          <Link className="auth-back" href="/">
            Kembali ke beranda
          </Link>
        </div>
      </section>
    </main>
  );
}
