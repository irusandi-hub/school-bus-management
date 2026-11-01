import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function DaftarPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">S</div>
        <p className="eyebrow">AKTIVASI AKUN WALI</p>
        <h1>Verifikasi email Anda</h1>
        <p className="auth-copy">
          Email wali harus didaftarkan lebih dahulu oleh Admin Pusat dan dihubungkan dengan siswa yang memiliki layanan
          aktif. Setelah email terverifikasi, Anda akan membuat kata sandi dan dapat masuk menggunakan email tersebut.
        </p>

        <SignupForm />

        <ol className="auth-steps">
          <li>Masukkan email yang sudah didaftarkan Admin Pusat.</li>
          <li>Buka tautan verifikasi yang dikirim ke email tersebut.</li>
          <li>Buat kata sandi, lalu masuk menggunakan email dan kata sandi.</li>
        </ol>

        <p className="auth-footnote">
          Jika email Anda belum terdaftar, tautan tidak akan mengaktifkan akses. Hubungi Admin Pusat untuk pendaftaran
          email wali dan pemeriksaan status layanan siswa.
        </p>

        <div className="auth-links">
          <Link className="auth-back" href="/login">
            Sudah punya kata sandi? Masuk
          </Link>
          <Link className="auth-back" href="/">
            Kembali ke beranda
          </Link>
        </div>
      </section>
    </main>
  );
}
