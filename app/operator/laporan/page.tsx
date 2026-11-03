import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, Notice, PageHeader, Pill, StatCard } from "@/components/admin/ui";
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
    supabase.from("trip_assignments").select("id", { count: "exact", head: true }).eq("service_date", today()),
    supabase.from("trips").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("trip_student_events").select("id", { count: "exact", head: true }),
  ]);

  return (
    <>
      <PageHeader
        title="Laporan operasional"
        description="Ringkasan ini hanya mencakup bus, pengemudi, dan perjalanan organisasi Anda."
        actions={<Link className="btn btn-primary" href="/operator/laporan/export">Unduh CSV perjalanan</Link>}
      />

      <section className="stats" aria-label="Ringkasan laporan operator">
        <StatCard label="Bus aktif" value={buses.count ?? 0} note="Armada yang dapat ditugaskan" icon="bus" />
        <StatCard label="Pengemudi aktif" value={drivers.count ?? 0} note="Staf organisasi Anda" icon="driver" />
        <StatCard
          label="Penugasan hari ini"
          value={assignmentsToday.count ?? 0}
          note="Rute yang dijadwalkan hari ini"
          icon="assignment"
          tone="wait"
        />
        <StatCard
          label="Perjalanan selesai"
          value={completedTrips.count ?? 0}
          note={`${events.count ?? 0} catatan kehadiran siswa`}
          icon="check"
          tone="done"
        />
      </section>

      <div className="admin-overview-grid">
        <section className="panel">
          <header className="panel-head"><div><h2 className="panel-title">Cakupan laporan</h2><div className="panel-subtitle">Data dibatasi oleh kebijakan database organisasi</div></div><Pill tone="info">Organisasi</Pill></header>
          <ul className="check-list">
            <li><strong>Armada dan pengemudi</strong><span>✓</span><small>Hanya data organisasi yang sedang masuk.</small></li>
            <li><strong>Perjalanan dan kehadiran</strong><span>✓</span><small>Ringkasan dan ekspor berasal dari catatan perjalanan organisasi Anda.</small></li>
            <li><strong>Jejak audit platform</strong><span>—</span><small>Hanya Admin Pusat yang dapat membaca audit lintas organisasi.</small></li>
            <li><strong>Ekspor perjalanan CSV</strong><span>✓</span><small>Unduh hingga 5.000 perjalanan terbaru untuk pengolahan lebih lanjut.</small></li>
          </ul>
        </section>
        <section className="panel">
          <header className="panel-head"><div><h2 className="panel-title">Catatan penggunaan</h2><div className="panel-subtitle">Agar laporan tidak menyesatkan</div></div></header>
          <div className="audit-note">
            <p>Angka 0 berarti belum ada data pada organisasi Anda, bukan data contoh yang disembunyikan. Perjalanan hanya terhitung setelah pengemudi memulai tugas.</p>
            <p>Posisi GPS dan kamera live belum tersedia. Ekspor CSV berisi data perjalanan yang benar-benar tersimpan, bukan lokasi atau rekaman yang belum terintegrasi.</p>
          </div>
        </section>
      </div>
      <Notice kind="info">Untuk laporan lintas sekolah dan jejak audit platform, gunakan akun Admin Pusat. Peran operator tidak dapat dinaikkan dari antarmuka.</Notice>
    </>
  );
}
