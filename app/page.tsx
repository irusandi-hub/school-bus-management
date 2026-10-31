import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Bus | Manajemen transportasi sekolah",
  description:
    "Aplikasi manajemen bus sekolah untuk Admin Pusat, pengemudi, dan wali siswa. Modul data induk sudah aktif dan tersimpan di database.",
};

const modules = [
  {
    icon: "⌂",
    title: "Sekolah & operator",
    body: "Simpan identitas sekolah, operator transportasi, kontak resmi, dan koordinat sekolah sebagai acuan rute.",
    status: "Aktif",
  },
  {
    icon: "♧",
    title: "Siswa & wali",
    body: "Admissions Number unik, data wali, titik rumah, dan status layanan dengan riwayat perubahan yang tidak dihapus.",
    status: "Aktif",
  },
  {
    icon: "▰",
    title: "Bus & pengemudi",
    body: "Armada, kapasitas, nomor polisi, pengemudi, dan operatornya, dengan validasi data penting.",
    status: "Aktif",
  },
  {
    icon: "☎",
    title: "Akun wali",
    body: "Email wali didaftarkan admin, diverifikasi, lalu wali membuat kata sandi sendiri. Peran tidak dipilih dari tampilan.",
    status: "Aktif",
  },
];

const upcoming = [
  { title: "Penugasan & perjalanan pagi/sore", note: "Membutuhkan rute yang disetujui admin." },
  { title: "GPS dari ponsel pengemudi", note: "Menunggu uji perangkat Android pilot." },
  { title: "Rute bus besar & titik jemput", note: "Validasi vendor routing belum lulus." },
  { title: "Kamera live", note: "Fitur tambahan, menunggu integrasi resmi." },
];

export default function HomePage() {
  return (
    <div className="landing">
      <div className="landing-inner">
        <header className="landing-nav">
          <Link className="landing-brand" href="/">
            <span className="landing-mark">S</span>
            <span>
              <strong>School Bus</strong>
              <small>Manajemen transportasi sekolah</small>
            </span>
          </Link>
          <nav className="landing-nav-links" aria-label="Navigasi utama">
            <a href="#modul">Modul</a>
            <a href="#alur">Cara mulai</a>
            <a href="#status">Status fitur</a>
          </nav>
          <div className="landing-nav-actions">
            <Link className="landing-link" href="/daftar">
              Aktivasi akun wali
            </Link>
            <Link className="landing-cta" href="/login">
              Masuk
            </Link>
          </div>
        </header>

        <section className="landing-hero">
          <div className="hero-copy">
            <p className="hero-kicker">PILOT DAMMAM &amp; SEKITARNYA</p>
            <h1 className="hero-title">
              Data transportasi sekolah yang <em>tertib</em> sejak awal.
            </h1>
            <p className="hero-sub">
              Admin Pusat mengelola sekolah, operator, siswa, wali, bus, dan pengemudi dalam satu tempat. Wali hanya
              dapat melihat anak yang memang terhubung dengannya — diperiksa oleh database, bukan oleh tampilan.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary btn-lg" href="/login">
                Masuk ke ruang kerja
              </Link>
              <Link className="btn btn-outline btn-lg" href="/daftar">
                Aktivasi akun wali
              </Link>
            </div>
            <p className="hero-note">
              Akun wali hanya dapat diaktifkan untuk email yang sudah didaftarkan Admin Pusat dan memiliki siswa dengan
              layanan aktif.
            </p>
          </div>

          <aside className="hero-panel" id="status">
            <div className="hero-panel-head">
              <span className="hero-panel-dot" aria-hidden="true" />
              Status modul
            </div>
            <ul className="module-status-list">
              <li>
                <span>Data induk &amp; akun wali</span>
                <span className="pill success">Aktif</span>
              </li>
              <li>
                <span>Penugasan &amp; perjalanan</span>
                <span className="pill neutral">Belum aktif</span>
              </li>
              <li>
                <span>GPS pengemudi</span>
                <span className="pill neutral">Belum aktif</span>
              </li>
              <li>
                <span>Kamera live</span>
                <span className="pill neutral">Belum aktif</span>
              </li>
            </ul>
            <p className="hero-panel-foot">
              Kami tidak menampilkan angka atau status contoh. Ringkasan hanya berisi data yang benar-benar tersimpan.
            </p>
          </aside>
        </section>

        <section className="landing-section" id="modul">
          <div className="section-head">
            <p className="hero-kicker dark">MODUL YANG SUDAH BERJALAN</p>
            <h2>Empat fondasi data, satu sumber kebenaran</h2>
            <p>
              Semua formulir tersambung ke database dengan validasi, pencarian, dan konfirmasi tindakan. Data historis
              tidak dihapus; status dinonaktifkan agar riwayat tetap utuh.
            </p>
          </div>
          <div className="feature-grid">
            {modules.map((module) => (
              <article className="feature-card" key={module.title}>
                <div className="feature-top">
                  <span className="feature-icon" aria-hidden="true">
                    {module.icon}
                  </span>
                  <span className="pill success">{module.status}</span>
                </div>
                <h3>{module.title}</h3>
                <p>{module.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section" id="alur">
          <div className="section-head">
            <p className="hero-kicker dark">ALUR AKSES WALI</p>
            <h2>Tiga langkah, tanpa memilih peran sendiri</h2>
          </div>
          <div className="step-grid">
            <article className="step-card">
              <span className="step-number">01</span>
              <h3>Admin mendaftarkan email</h3>
              <p>Email wali disimpan di database dan dihubungkan ke siswa yang tepat.</p>
            </article>
            <article className="step-card">
              <span className="step-number">02</span>
              <h3>Wali memverifikasi email</h3>
              <p>Tautan verifikasi dikirim ke email terdaftar, lalu wali membuat kata sandi.</p>
            </article>
            <article className="step-card">
              <span className="step-number">03</span>
              <h3>Masuk dengan email &amp; kata sandi</h3>
              <p>Akses dibuka hanya untuk siswa yang terhubung dan masih memiliki layanan aktif.</p>
            </article>
          </div>
        </section>

        <section className="landing-section">
          <div className="cta-band">
            <div>
              <h2>Mulai dari data yang benar</h2>
              <p>
                Belum punya akun? Akun Admin Pusat dibuat oleh pengelola sistem. Wali memulai dari aktivasi akun dengan
                email terdaftar.
              </p>
            </div>
            <div className="cta-actions">
              <Link className="btn btn-primary btn-lg" href="/login">
                Masuk
              </Link>
              <Link className="btn btn-outline btn-lg" href="/daftar">
                Aktivasi akun wali
              </Link>
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="section-head">
            <p className="hero-kicker dark">TAHAP BERIKUTNYA</p>
            <h2>Yang belum aktif — dan tidak kami tampilkan seolah berjalan</h2>
          </div>
          <ul className="upcoming-list">
            {upcoming.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.note}</span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="landing-footer">
          <span>School Bus Management</span>
          <span>Pilot Dammam · modul data induk</span>
        </footer>
      </div>
    </div>
  );
}
