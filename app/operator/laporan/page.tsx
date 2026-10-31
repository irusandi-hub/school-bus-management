import type { Metadata } from "next";
import { ConfigNotice, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { operatorReadContext } from "@/lib/operator/read";

export const metadata: Metadata = { title: "Laporan | Operator" };

function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export default async function OperatorReportsPage() {
  const supabase = await operatorReadContext();
  if (!supabase) return <ConfigNotice />;

  const [buses, drivers, assignmentsToday, completedTrips, events] = await Promise.all([
    supabase.from("buses").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("drivers").select("id", { count: "exact", head: true }).eq("active", true),
    supabase
      .from("trip_assignments")
      .select("id", { count: "exact", head: true })
      .eq("service_date", today()),
    supabase.from("trips").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("trip_student_events").select("id", { count: "exact", head: true }),
  ]);

  return (
    <>
      <PageHeader
        title="Laporan operasional"
        description="Ringkasan ini hanya mencakup bus, pengemudi, dan perjalanan organisasi Anda. Laporan tidak dapat dipakai untuk membaca organisasi lain."
      />

      <section className="stats" aria-label="Ringkasan laporan operator">
        <article className="stat-card">
          <div className="stat-top">
            <span>Bus aktif</span>
            <span className="stat-icon">▰</span>
          </div>
          <div className="stat-value">{buses.count ?? 0}</div>
          <div className="stat-note">Armada yang dapat ditugaskan</div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Pengemudi aktif</span>
            <span className="stat-icon">◍</span>
          </div>
          <div className="stat-value">{drivers.count ?? 0}</div>
          <div className="stat-note">Staf organisasi Anda</div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Penugasan hari ini</span>
            <span className="stat-icon">☑</span>
          </div>
          <div className="stat-value">{assignmentsToday.count ?? 0}</div>
          <div className="stat-note">Rute yang dijalankan hari ini</div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Perjalanan selesai</span>
            <span className="stat-icon">◷</span>
          </div>
          <div className="stat-value">{completedTrips.count ?? 0}</div>
          <div className="stat-note">{events.count ?? 0} catatan kehadiran siswa</div>
        </article>
      </section>

      <div className="admin-overview-grid">
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Cakupan laporan</h2>
              <div className="panel-subtitle">Ditegakkan oleh kebijakan database</div>
            </div>
            <Pill tone="info">Organisasi</Pill>
          </header>
          <ul className="check-list">
            <li>
              <strong>Armada dan pengemudi</strong>
              <span>✓</span>
              <small>Hanya baris dengan operator yang sama dengan akun Anda.</small>
            </li>
            <li>
              <strong>Perjalanan dan kehadiran</strong>
              <span>✓</span>
              <small>Dihitung dari perjalanan bus organisasi Anda, bukan dari seluruh platform.</small>
            </li>
            <li>
              <strong>Jejak audit platform</strong>
              <span>—</span>
              <small>Hanya Admin Pusat yang dapat membaca audit lintas organisasi.</small>
            </li>
            <li>
              <strong>Ekspor berkas</strong>
              <span>—</span>
              <small>Belum tersedia. Laporan saat ini ditampilkan di layar.</small>
            </li>
          </ul>
        </section>

        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Catatan penggunaan</h2>
              <div className="panel-subtitle">Agar laporan tidak menyesatkan</div>
            </div>
          </header>
          <div className="audit-note">
            <p>
              Angka 0 berarti belum ada data pada organisasi Anda, bukan data contoh yang disembunyikan. Perjalanan
              hanya terhitung setelah pengemudi memulai tugas.
            </p>
            <p>
              Posisi GPS, kamera, dan ekspor laporan belum tersedia. Modul tersebut tidak ditampilkan sebagai fitur
              yang sudah berjalan.
            </p>
          </div>
        </section>
      </div>

      <Notice kind="info">
        Untuk laporan lintas sekolah dan jejak audit platform, gunakan akun Admin Pusat. Peran operator tidak dapat
        dinaikkan dari antarmuka.
      </Notice>
    </>
  );
}
