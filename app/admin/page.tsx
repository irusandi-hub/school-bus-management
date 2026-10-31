import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { adminReadContext } from "@/lib/admin/read";

export const metadata: Metadata = { title: "Ringkasan | Admin Pusat" };

export default async function AdminHomePage() {
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  // Every figure below is a real database count. With an empty database the values are
  // genuinely 0 rather than placeholder data.
  const [schoolRows, operatorRows, studentRows, activeStudentRows, busRows, driverRows, guardianRows, pendingGuardianRows] =
    await Promise.all([
      supabase.from("schools").select("id", { count: "exact", head: true }).eq("active", true),
      supabase.from("operators").select("id", { count: "exact", head: true }).eq("active", true),
      supabase.from("students").select("id", { count: "exact", head: true }),
      supabase.from("students").select("id", { count: "exact", head: true }).eq("service_status", "active"),
      supabase.from("buses").select("id", { count: "exact", head: true }).eq("active", true),
      supabase.from("drivers").select("id", { count: "exact", head: true }).eq("active", true),
      supabase.from("guardians").select("id", { count: "exact", head: true }).eq("active", true),
      supabase.from("guardians").select("id", { count: "exact", head: true }).eq("active", true).is("profile_id", null),
    ]);

  const schools = schoolRows.count ?? 0;
  const operators = operatorRows.count ?? 0;
  const students = studentRows.count ?? 0;
  const activeStudents = activeStudentRows.count ?? 0;
  const buses = busRows.count ?? 0;
  const drivers = driverRows.count ?? 0;
  const guardians = guardianRows.count ?? 0;
  const pendingGuardians = pendingGuardianRows.count ?? 0;

  const pausedOrEnded = Math.max(students - activeStudents, 0);

  return (
    <>
      <PageHeader
        title="Ringkasan data"
        description="Angka di bawah ini berasal langsung dari database. Belum ada data contoh: nilai 0 berarti memang belum ada catatan."
      />

      <section className="stats" aria-label="Ringkasan data induk">
        <article className="stat-card">
          <div className="stat-top">
            <span>Sekolah aktif</span>
            <span className="stat-icon">⌂</span>
          </div>
          <div className="stat-value">{schools}</div>
          <div className="stat-note">Data tersimpan di tabel sekolah</div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Operator aktif</span>
            <span className="stat-icon">⛟</span>
          </div>
          <div className="stat-value">{operators}</div>
          <div className="stat-note">Perusahaan transportasi terdaftar</div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Siswa dengan layanan aktif</span>
            <span className="stat-icon">♧</span>
          </div>
          <div className="stat-value">{activeStudents}</div>
          <div className="stat-note">{students} siswa tercatat seluruhnya</div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Bus aktif</span>
            <span className="stat-icon">▰</span>
          </div>
          <div className="stat-value">{buses}</div>
          <div className="stat-note">{drivers} pengemudi aktif</div>
        </article>
      </section>

      <div className="admin-overview-grid">
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Kesiapan data</h2>
              <div className="panel-subtitle">Pemeriksaan relasi yang dibutuhkan sebelum modul perjalanan</div>
            </div>
            <Pill tone="info">Tahap data induk</Pill>
          </header>
          <ul className="check-list">
            <li>
              <strong>Siswa aktif</strong>
              <span>{activeStudents}</span>
              <small>Hanya siswa aktif yang dapat diakses akun wali.</small>
            </li>
            <li>
              <strong>Siswa sementara tidak aktif / dihentikan</strong>
              <span>{pausedOrEnded}</span>
              <small>Riwayat layanan tetap tersimpan dan tidak dihapus.</small>
            </li>
            <li>
              <strong>Email wali menunggu aktivasi</strong>
              <span>{pendingGuardians}</span>
              <small>Dari {guardians} akun wali aktif. Wali membuat kata sandi sendiri setelah verifikasi email.</small>
            </li>
          </ul>
        </section>

        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Pintasan pengelolaan</h2>
              <div className="panel-subtitle">Seluruh tombol di bawah membuka modul yang sudah aktif</div>
            </div>
          </header>
          <div className="quick-list">
            {[
              { href: "/admin/sekolah", label: "Sekolah", note: "Tambah, ubah, nonaktifkan", icon: "⌂" },
              { href: "/admin/operator", label: "Operator", note: "Data perusahaan transportasi", icon: "⛟" },
              { href: "/admin/siswa", label: "Data siswa", note: "Identitas, wali, dan titik rumah", icon: "♧" },
              { href: "/admin/wali", label: "Akun wali", note: "Pra-pendaftaran email wali", icon: "☎" },
              { href: "/admin/bus", label: "Bus", note: "Armada dan kapasitas", icon: "▰" },
              { href: "/admin/pengemudi", label: "Pengemudi", note: "Data pengemudi dan operator", icon: "◍" },
            ].map((item) => (
              <Link className="quick-row" href={item.href} key={item.href}>
                <span className="quick-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.note}</small>
                </span>
                <span className="quick-arrow">›</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Notice kind="info">
        Modul perjalanan, GPS, rute, dan kamera belum aktif pada tahap ini. Data yang tersedia di sini adalah data induk
        yang akan dipakai modul tersebut setelah tahap berikutnya disetujui.
      </Notice>
    </>
  );
}
