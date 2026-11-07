import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pilih Jenis Pengguna | School Bus Management" };

const roles = [
  { href: "/admin", title: "Admin Pusat", detail: "Kelola data sekolah, operator, siswa, armada, pengemudi, dan laporan.", icon: "▤", tone: "admin", action: "Masuk ke Admin Pusat" },
  { href: "/operator", title: "Operator Bus", detail: "Kelola armada, pengemudi, rute operasional, dan penugasan perjalanan.", icon: "▣", tone: "operator", action: "Masuk sebagai Operator" },
  { href: "/wali", title: "Orang Tua/Wali", detail: "Lihat informasi anak, status perjalanan, lokasi, dan fitur pemantauan yang tersedia.", icon: "♙", tone: "wali", action: "Masuk sebagai Orang Tua/Wali" },
];

export default function ChooseRolePage() {
  return (
    <main className="sbm-chooser">
      <header className="sbm-header">
        <Link href="/" className="sbm-brand"><span className="sbm-mark">▣</span><span>School Bus<br/>Management</span></Link>
        <Link href="/" className="sbm-back">← Kembali ke Beranda</Link>
      </header>
      <section className="sbm-chooser-content">
        <p className="sbm-eyebrow"><i/> AKSES APLIKASI</p>
        <h1>Pilih Jenis Pengguna</h1>
        <p className="sbm-chooser-lead">Pilih area kerja sesuai peran Anda untuk melanjutkan.</p>
        <div className="sbm-chooser-grid">
          {roles.map((role) => <article className={`sbm-chooser-card ${role.tone}`} key={role.href}>
            <span className="sbm-chooser-icon">{role.icon}</span>
            <h2>{role.title}</h2>
            <p>{role.detail}</p>
            <Link href={role.href} className="sbm-primary">{role.action}<b>→</b></Link>
          </article>)}
        </div>
        <p className="sbm-chooser-note">Pengemudi menggunakan area operasional melalui akun yang dikelola operator.</p>
      </section>
      <footer className="sbm-footer"><span>© 2026 School Bus Management</span><span>Dammam, Saudi Arabia</span></footer>
    </main>
  );
}
