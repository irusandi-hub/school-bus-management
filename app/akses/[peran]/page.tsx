import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const areas = {
  operator: { title: "Operator", subtitle: "Pusat kendali operasional armada dan perjalanan.", icon: "⌘" },
  pengemudi: { title: "Pengemudi", subtitle: "Akses tugas harian, navigasi, dan informasi penjemputan.", icon: "➤" },
  wali: { title: "Orang Tua/Wali", subtitle: "Akses informasi dan pemantauan perjalanan anak.", icon: "⌂" },
} as const;

type Area = keyof typeof areas;

export const metadata: Metadata = { title: "Akses Pengguna | School Bus Management" };

export default async function RoleAccessPage({ params }: { params: Promise<{ peran: string }> }) {
  const { peran } = await params;
  if (!(peran in areas)) notFound();
  const area = areas[peran as Area];

  return (
    <main className="sbm-access-page">
      <header className="sbm-header">
        <Link href="/" className="sbm-brand"><span className="sbm-mark">▣</span><span>School Bus<br/>Management</span></Link>
        <Link href="/pilih-peran" className="sbm-back">← Ganti area</Link>
      </header>
      <section className="sbm-access-card">
        <span className={`sbm-chooser-icon ${peran}`}>{area.icon}</span>
        <p className="sbm-eyebrow"><i/> AREA PENGGUNA</p>
        <h1>{area.title}</h1>
        <p>{area.subtitle}</p>
        <div className="sbm-access-placeholder">
          <span>✦</span>
          <strong>Area akses sedang disiapkan</strong>
          <small>Tampilan dan alur masuk untuk area ini akan diselesaikan pada tahap UI berikutnya. Autentikasi belum diaktifkan.</small>
        </div>
        <Link href="/pilih-peran" className="sbm-role-action">Kembali ke pilihan pengguna <span>→</span></Link>
      </section>
      <footer className="sbm-footer"><span>© 2026 School Bus Management</span><span>Dammam, Saudi Arabia</span></footer>
    </main>
  );
}
