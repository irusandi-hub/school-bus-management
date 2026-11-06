import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, EmptyState, Notice, PageHeader, Pill, StatCard } from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";
import { operatorReadContext } from "@/lib/operator/read";
import { formatDate, formatTime, routeDirectionLabel } from "@/lib/validation";

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

  const running = rows.filter((row) => row.trips?.some((trip) => trip.status === "in_progress"));
  const completed = rows.filter(
    (row) => row.trips?.length && row.trips.every((trip) => trip.status === "completed" || trip.status === "cancelled"),
  );
  const waiting = rows.filter((row) => !running.includes(row) && !completed.includes(row));

  const columns = [
    { key: "live", title: "Berlangsung", icon: "trip" as const, rows: running, empty: "Tidak ada perjalanan berjalan." },
    { key: "wait", title: "Menunggu mulai", icon: "clock" as const, rows: waiting, empty: "Tidak ada tugas yang menunggu." },
    { key: "done", title: "Selesai", icon: "check" as const, rows: completed, empty: "Belum ada perjalanan selesai hari ini." },
  ];

  return (
    <>
      <PageHeader
        title="Pusat operasi"
        description="Satu tampilan untuk mengendalikan penugasan hari ini, melihat kesiapan armada, dan membuka tindak lanjut operasional."
        actions={<Pill tone="info">{formatDate(date)}</Pill>}
        eyebrow="OPERASIONAL HARIAN"
      />

      {assignmentsResult.error && <Notice kind="error">Data operasi hari ini belum dapat dimuat. Coba muat ulang halaman.</Notice>}

      <section className="stats" aria-label="Status operasi hari ini">
        <StatCard label="Total penugasan" value={rows.length} note="Jadwal layanan hari ini" icon="assignment" />
        <StatCard label="Berlangsung" value={running.length} note="Perjalanan sedang aktif" icon="trip" tone="live" />
        <StatCard label="Menunggu mulai" value={waiting.length} note="Belum dimulai pengemudi" icon="clock" tone="wait" />
        <StatCard label="Selesai" value={completed.length} note="Ditutup pengemudi" icon="check" tone="done" />
      </section>

      <div className="quick-grid">
        <Link className="quick-tile" href="/operator/penugasan">
          <span aria-hidden="true"><Icon name="plus" /></span>
          <strong>Buat penugasan</strong>
          <small>Atur rute, pengemudi, bus, dan tanggal</small>
        </Link>
        <Link className="quick-tile" href="/operator/perjalanan">
          <span aria-hidden="true"><Icon name="trip" /></span>
          <strong>Riwayat perjalanan</strong>
          <small>Catatan waktu mulai, tiba, dan selesai</small>
        </Link>
        <Link className="quick-tile" href="/operator/bus">
          <span aria-hidden="true"><Icon name="bus" /></span>
          <strong>Kesiapan armada</strong>
          <small>{busesResult.count ?? 0} bus aktif · {driversResult.count ?? 0} pengemudi aktif</small>
        </Link>
      </div>

      {rows.length === 0 ? (
        <section className="panel">
          <EmptyState
            icon="inbox"
            title="Belum ada penugasan untuk hari ini"
            detail="Buat penugasan agar pengemudi menerima tugas dan perjalanan dapat dipantau dari papan ini."
            action={{ href: "/operator/penugasan", label: "Buat penugasan" }}
          />
        </section>
      ) : (
        <div className="board-grid" aria-label="Papan penugasan hari ini">
          {columns.map((column) => (
            <section className={`board-column ${column.key}`} key={column.key}>
              <header className="board-column-head">
                <strong>
                  <Icon name={column.icon} size={15} />
                  {column.title}
                </strong>
                <span className="board-count">{column.rows.length}</span>
              </header>
              {column.rows.length === 0 ? (
                <p className="board-empty">{column.empty}</p>
              ) : (
                <ul className="board-list">
                  {column.rows.map((row) => {
                    const trip = row.trips?.[0];
                    return (
                      <li className="board-item" key={row.id}>
                        <strong>{row.routes?.route_name ?? "Rute belum tersedia"}</strong>
                        <small>
                          {row.routes?.school_name ?? "Sekolah tidak tersedia"} ·{" "}
                          {routeDirectionLabel(row.routes?.direction ?? "")}
                        </small>
                        <small>
                          {row.drivers?.full_name ?? "Pengemudi belum ditetapkan"} · Bus{" "}
                          {row.buses?.fleet_code ?? "—"}
                        </small>
                        <small>
                          {column.key === "live"
                            ? `Mulai ${formatTime(trip?.started_at)}`
                            : column.key === "done"
                              ? `Selesai ${formatTime(trip?.completed_at)}`
                              : "Menunggu pengemudi memulai"}
                        </small>
                        <Link href="/operator/perjalanan">
                          Lihat perjalanan <Icon name="chevronRight" size={13} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}

      <Notice kind="info">
        Posisi GPS langsung, estimasi kedatangan, dan kamera bus belum tersedia. Siaran kamera perjalanan tidak
        ditampilkan di papan ini; papan hanya memakai status perjalanan yang dicatat pengemudi tanpa membuat data
        lokasi atau status palsu.
      </Notice>
    </>
  );
}
