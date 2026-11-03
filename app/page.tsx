import Link from "next/link";
import type { Metadata } from "next";
import { isDevOpenAccess } from "@/lib/dev-open-access";

// Status akses dibaca saat permintaan berjalan, bukan dibekukan di HTML hasil build
// (DEC-025): deploy Preview terbuka tanpa perlu build ulang, produksi tetap tertutup.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Masuk | School Bus Management",
  description:
    "Gerbang akses School Bus Management untuk Admin & Operator, Pengemudi, dan Orang Tua/Wali.",
};

function AdminIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
      <path d="M4 20V9.5L12 4l8 5.5V20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M2.5 20h19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function DriverIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 11h18" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="7.5" cy="19" r="1.8" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="16.5" cy="19" r="1.8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7 8h3M14 8h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function GuardianIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4.5 20c.7-3.6 3.4-5.6 7.5-5.6s6.8 2 7.5 5.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 3v1.6M4.8 8H3.2M20.8 8h-1.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

const doors = [
  {
    href: "/login?peran=admin",
    areaHref: "/admin",
    label: "Admin & Operator",
    kicker: "Pengelolaan",
    description:
      "Kelola sekolah, operator, siswa, wali, bus, pengemudi, rute, dan perjalanan sesuai kewenangan akun.",
    points: ["Data induk & armada", "Rute dan penugasan", "Laporan operasional"],
    cta: "Masuk sebagai Admin & Operator",
    openCta: "Buka area Admin & Operator",
    icon: <AdminIcon />,
    tone: "admin",
  },
  {
    href: "/login?peran=pengemudi",
    areaHref: "/pengemudi",
    label: "Pengemudi",
    kicker: "Operasional",
    description:
      "Lihat tugas hari ini, urutan titik jemput, dan catat kehadiran siswa selama perjalanan.",
    points: ["Tugas & manifest hari ini", "Mulai dan akhiri perjalanan", "Riwayat perjalanan sendiri"],
    cta: "Masuk sebagai Pengemudi",
    openCta: "Buka area Pengemudi",
    icon: <DriverIcon />,
    tone: "driver",
  },
  {
    href: "/login?peran=wali",
    areaHref: "/wali",
    label: "Orang Tua/Wali",
    kicker: "Pemantauan",
    description:
      "Pantau anak yang terhubung dengan akun Anda: sekolah, layanan, status perjalanan, dan riwayatnya.",
    points: ["Kartu anak & status layanan", "Status perjalanan hari ini", "Riwayat perjalanan anak"],
    cta: "Masuk sebagai Orang Tua/Wali",
    openCta: "Buka area Orang Tua/Wali",
    icon: <GuardianIcon />,
    tone: "parent",
  },
];

export default function AccessGatePage() {
  const openAccess = isDevOpenAccess();

  return (
    <main className="gate">
      <div className="gate-inner">
        <header className="gate-nav">
          <Link className="gate-brand" href="/">
            <span className="gate-mark" aria-hidden="true">S</span>
            <span>
              <strong>School Bus</strong>
              <small>Manajemen Transportasi Sekolah</small>
            </span>
          </Link>
          <span className="gate-area">Dammam · Pilot</span>
        </header>

        <section className="gate-hero">
          <p className="gate-kicker">Satu gerbang akses</p>
          <h1>Tiga ruang kerja, satu layanan bus sekolah yang aman.</h1>
          <p className="gate-copy">
            {openAccess
              ? "Mode pengembangan aktif: keempat area dapat dibuka langsung tanpa login dan memakai data simulasi berlabel. Di produksi, pintu masuk di bawah mengarah ke halaman masuk dan hak akses dibaca dari peran akun di database."
              : "Pilih pintu masuk yang sesuai dengan peran Anda. Kartu di bawah hanya mengarahkan ke halaman masuk — hak akses tetap dibaca dari peran akun di database setelah Anda terautentikasi."}
          </p>
          <div className="gate-meta">
            <span className="gate-meta-item">
              <span className="gate-dot" aria-hidden="true" /> Otorisasi server &amp; database
            </span>
            <span className="gate-meta-item">Bahasa Indonesia</span>
            <span className="gate-meta-item">Akses sesuai peran</span>
          </div>
        </section>

        <section className="gate-cards" aria-label="Pilih pintu masuk">
          {doors.map((door) => (
            <article className={`gate-card gate-card-${door.tone}`} key={door.href}>
              <div className="gate-card-top">
                <span className="gate-icon" aria-hidden="true">{door.icon}</span>
                <span className="gate-card-kicker">{door.kicker}</span>
              </div>
              <h2>{door.label}</h2>
              <p>{door.description}</p>
              <ul className="gate-points">
                {door.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <Link className="gate-cta" href={openAccess ? door.areaHref : door.href}>
                {openAccess ? door.openCta : door.cta}
                <span aria-hidden="true">→</span>
              </Link>
              {door.tone === "parent" && !openAccess && (
                <Link className="gate-secondary" href="/daftar">
                  Belum punya kata sandi? Aktivasi akun wali
                </Link>
              )}
            </article>
          ))}
        </section>

        <section className="gate-footnote" aria-label="Informasi penting">
          <div>
            <strong>Peran tidak dipilih di sini</strong>
            <p>
              Memilih kartu tidak memberikan akses tambahan. Setelah masuk, sistem membaca peran akun dan
              mengarahkan Anda ke area yang benar. URL atau parameter yang diubah tidak memperluas akses.
            </p>
          </div>
          <div>
            <strong>Yang belum tersedia</strong>
            <p>
              Posisi bus langsung (GPS), kamera di dalam bus, dan integrasi perangkat belum aktif. Modul tersebut
              tidak ditampilkan sebagai fitur yang berjalan dan tidak menggunakan data contoh.
            </p>
          </div>
        </section>

        <footer className="gate-footer">
          <span>School Bus Management</span>
          <span>Modul data &amp; perjalanan terbatas · GPS dan kamera belum aktif</span>
        </footer>
      </div>
    </main>
  );
}
