import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { operatorReadContext } from "@/lib/operator/read";
import { formatDate, tripStatusLabel } from "@/lib/validation";

export const metadata: Metadata = { title: "Pusat Operasi | Operator" };

function localToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

type OperationRow = {
  id: string;
  service_date: string;
  routes?: { route_name?: string; school_name?: string; direction?: string } | null;
  buses?: { fleet_code?: string } | null;
  drivers?: { full_name?: string } | null;
  trips?: { id: string; status: string; started_at?: string | null; completed_at?: string | null }[] | null;
};

export default async function OperatorOperationsPage() {
  const supabase = await operatorReadContext();
  if (!supabase) return <ConfigNotice />;

  const date = localToday();
  const [assignmentsResult, busesResult, driversResult] = await Promise.all([
    supabase
      .from("trip_assignments")
      .select("id, service_date, routes(route_name, school_name, direction), buses(fleet_code), drivers(full_name), trips(id, status, started_at, completed_at)")
      .eq("service_date", date)
      .order("created_at", { ascending: true }),
    supabase.from("buses").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("drivers").select("id", { count: "exact", head: true }).eq("active", true),
  ]);

  const rows = (assignmentsResult.data ?? []) as unknown as OperationRow[];
  const stats = {
    total: rows.length,
    running: rows.filter((row) => row.trips?.some((trip) => trip.status === "in_progress")).length,
    completed: rows.filter((row) => row.trips?.some((trip) => trip.status === "completed")).length,
    waiting: rows.filter((row) => !row.trips?.length || row.trips.every((trip) => trip.status === "scheduled")).length,
  };

  return (
    <>
      <PageHeader
        title="Pusat operasi"
        description="Satu tampilan untuk mengendalikan penugasan hari ini, melihat kesiapan armada, dan membuka tindak lanjut operasional."
        actions={<Pill tone="info">{formatDate(date)}</Pill>}
      />

      {assignmentsResult.error && <Notice kind="error">Data operasi hari ini belum dapat dimuat. Coba muat ulang halaman.</Notice>}

      <section className="stats" aria-label="Status operasi hari ini">
        <article className="stat-card"><div className="stat-top"><span>Total penugasan</span><span className="stat-icon">☷</span></div><div className="stat-value">{stats.total}</div><div className="stat-note">Jadwal layanan hari ini</div></article>
        <article className="stat-card"><div className="stat-top"><span>Berlangsung</span><span className="stat-icon">◉</span></div><div className="stat-value">{stats.running}</div><div className="stat-note">Perjalanan yang sedang aktif</div></article>
        <article className="stat-card"><div className="stat-top"><span>Selesai</span><span className="stat-icon">✓</span></div><div className="stat-value">{stats.completed}</div><div className="stat-note">Perjalanan ditutup pengemudi</div></article>
        <article className="stat-card"><div className="stat-top"><span>Menunggu mulai</span><span className="stat-icon">◷</span></div><div className="stat-value">{stats.waiting}</div><div className="stat-note">Belum ada perjalanan aktif</div></article>
      </section>

      <div className="quick-grid">
        <Link className="quick-tile" href="/operator/penugasan"><span aria-hidden="true">☑</span><strong>Buat penugasan</strong><small>Atur rute, pengemudi, bus, dan tanggal</small></Link>
        <Link className="quick-tile" href="/operator/perjalanan"><span aria-hidden="true">◷</span><strong>Lihat perjalanan</strong><small>Buka riwayat perjalanan armada</small></Link>
        <Link className="quick-tile" href="/operator/bus"><span aria-hidden="true">▰</span><strong>Kesiapan armada</strong><small>{busesResult.count ?? 0} bus aktif tersedia</small></Link>
        <Link className="quick-tile" href="/operator/pengemudi"><span aria-hidden="true">◍</span><strong>Kesiapan pengemudi</strong><small>{driversResult.count ?? 0} pengemudi aktif terdaftar</small></Link>
      </div>

      <section className="panel">
        <header className="panel-head">
          <div><h2 className="panel-title">Papan penugasan hari ini</h2><div className="panel-subtitle">Status bersumber dari perjalanan yang dicatat pengemudi</div></div>
          <Link className="btn btn-secondary" href="/operator/penugasan">Kelola penugasan</Link>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th scope="col">Rute dan sekolah</th><th scope="col">Pengemudi</th><th scope="col">Bus</th><th scope="col">Status</th><th scope="col">Tindakan</th></tr></thead>
            <tbody>
              {rows.length === 0 ? <EmptyRow colSpan={5} title="Belum ada penugasan hari ini" detail="Buat penugasan untuk menampilkan rute, pengemudi, dan bus pada papan operasi." /> : rows.map((row) => {
                const trip = row.trips?.[0];
                const status = trip?.status ?? "scheduled";
                return <tr key={row.id}>
                  <td><strong>{row.routes?.route_name ?? "Rute belum tersedia"}</strong><small>{row.routes?.school_name ?? "Sekolah tidak tersedia"}</small></td>
                  <td>{row.drivers?.full_name ?? "—"}</td>
                  <td>{row.buses?.fleet_code ?? "—"}</td>
                  <td><Pill tone={status === "in_progress" ? "info" : status === "completed" ? "success" : "neutral"}>{trip ? tripStatusLabel(status) : "Menunggu mulai"}</Pill></td>
                  <td><Link className="row-link" href="/operator/perjalanan">Lihat perjalanan</Link></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Notice kind="info">Posisi GPS langsung, estimasi kedatangan, dan kamera live belum diaktifkan. Halaman ini tidak membuat data lokasi atau status perjalanan palsu.</Notice>
    </>
  );
}
