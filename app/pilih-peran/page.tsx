import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pilih Area Pengguna | School Bus Management" };

const roles = [
  {
    href: "/akses/operator",
    title: "Operator",
    eyebrow: "PENGELOLA OPERASIONAL",
    detail: "Kelola armada, pengemudi, rute, penugasan, dan pantau perjalanan dalam satu pusat kendali.",
    icon: "⌘",
    tone: "operator",
    features: ["Manajemen armada & pengemudi", "Rute dan penugasan", "Monitoring operasional"],
  },
  {
    href: "/akses/pengemudi",
    title: "Pengemudi",
    eyebrow: "OPERASIONAL PERJALANAN",
    detail: "Jalankan tugas harian dengan panduan rute, daftar penjemputan, dan pembaruan status siswa.",
    icon: "➤",
    tone: "driver",
    features: ["Navigasi dan urutan titik", "Daftar siswa dan status", "Mulai dan akhiri perjalanan"],
  },
  {
    href: "/akses/wali",
    title: "Orang Tua/Wali",
    eyebrow: "PEMANTAUAN ANAK",
    detail: "Pantau informasi perjalanan anak, posisi bus, dan fitur komunikasi visual yang tersedia.",
    icon: "⌂",
    tone: "wali",
    features: ["Status perjalanan anak", "Lokasi bus jika tersedia", "Video langsung jika tersedia"],
  },
];

function Brand() {
  return <Link href="/" className="sbm-brand"><span className="sbm-mark"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M6 7.5A3.5 3.5 0 0 1 9.5 4h13A3.5 3.5 0 0 1 26 7.5V23H6V7.5Z" fill="currentColor"/><path d="M8.5 8h15v8h-15z" fill="#fff"/><circle cx="10" cy="24" r="2.5" fill="#142044"/><circle cx="22" cy="24" r="2.5" fill="#142044"/></svg></span><span>School Bus<br/>Management</span></Link>;
}

export default function ChooseRolePage() {
  return (
    <main className="sbm-chooser">
      <header className="sbm-header">
        <Brand/>
        <Link href="/" className="sbm-back"><span aria-hidden="true">←</span> Beranda</Link>
      </header>
      <section className="sbm-chooser-content">
        <div className="sbm-chooser-intro">
          <p className="sbm-eyebrow"><i/> AKSES PLATFORM</p>
          <h1>Satu platform. Tiga area kerja.</h1>
          <p className="sbm-chooser-lead">Pilih area sesuai peran Anda untuk melanjutkan ke aplikasi.</p>
        </div>
        <div className="sbm-chooser-grid">
          {roles.map((role, index) => <article className={`sbm-chooser-card ${role.tone}`} key={role.href}>
            <div className="sbm-role-card-top"><span className="sbm-chooser-icon" aria-hidden="true">{role.icon}</span><span className="sbm-role-index">0{index + 1}</span></div>
            <p className="sbm-role-eyebrow">{role.eyebrow}</p>
            <h2>{role.title}</h2>
            <p className="sbm-role-detail">{role.detail}</p>
            <ul className="sbm-role-features">{role.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}</ul>
            <Link href={role.href} className="sbm-role-action">Lanjutkan <span aria-hidden="true">↗</span></Link>
          </article>)}
        </div>
        <p className="sbm-chooser-note"><span>i</span> Setiap area memiliki fitur dan tampilan yang disesuaikan dengan tanggung jawab penggunanya.</p>
      </section>
      <footer className="sbm-footer"><span>© 2026 School Bus Management. Semua hak dilindungi.</span><span>Dammam, Saudi Arabia</span></footer>
    </main>
  );
}
