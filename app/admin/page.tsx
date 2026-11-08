import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, EmptyRow, PageHeader, Pill, StatCard, TripStatusPill } from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";
import { adminReadContext } from "@/lib/admin/read";
import { formatDate, routeDirectionLabel } from "@/lib/validation";

export const metadata: Metadata = { title: "Ringkasan | Admin Pusat" };

function localToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export default async function AdminHomePage() {
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const date = localToday();
  const [schoolRows, operatorRows, studentRows, busRows, driverRows, assignmentRows] = await Promise.all([
    supabase.from("schools").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("operators").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("service_status", "active"),
    supabase.from("buses").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("drivers").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("trip_assignments").select("id, trips(id, status)").eq("service_date", date),
  ]);

  const assignments = (assignmentRows.data ?? []) as unknown as { id: string; trips?: { id: string; status: string }[] | null }[];
  const trips = assignments.flatMap((assignment) => assignment.trips ?? []);
  const running = trips.filter((trip) => trip.status === "in_progress").length;
  const completed = trips.filter((trip) => trip.status === "completed").length;
  const waiting = Math.max(assignments.length - running - completed, 0);

  const shortcuts = [
    { href: "/admin/sekolah", label: "Sekolah", icon: "school" },
    { href: "/admin/operator", label: "Operator", icon: "operator" },
    { href: "/admin/siswa", label: "Siswa", icon: "students" },
    { href: "/admin/wali", label: "Akun wali", icon: "guardian" },
    { href: "/admin/bus", label: "Bus", icon: "bus" },
    { href: "/admin/pengemudi", label: "Pengemudi", icon: "driver" },
    { href: "/admin/rute", label: "Rute", icon: "route" },
    { href: "/admin/penugasan", label: "Penugasan", icon: "assignment" },
    { href: "/admin/laporan", label: "Laporan", icon: "report" },
  ];

  return (
    <>
      <PageHeader title="Ringkasan" description="Data operasional platform." actions={<Pill tone="info">{formatDate(date)}</Pill>} />
      <section className="stats" aria-label="Data aktif">
        <StatCard label="Sekolah aktif" value={schoolRows.count ?? 0} icon="school" />
        <StatCard label="Operator aktif" value={operatorRows.count ?? 0} icon="operator" />
        <StatCard label="Siswa aktif" value={studentRows.count ?? 0} icon="students" />
        <StatCard label="Bus aktif" value={busRows.count ?? 0} note={`${driverRows.count ?? 0} pengemudi aktif`} icon="bus" />
      </section>

      <section className="panel admin-work-panel">
        <header className="panel-head">
          <div><h2 className="panel-title">Operasional hari ini</h2><div className="panel-subtitle">{assignments.length} penugasan</div></div>
          <Link className="btn btn-secondary btn-sm" href="/admin/penugasan">Kelola penugasan</Link>
        </header>
        <div className="stats stats-3" style={{ padding: 14, margin: 0 }}>
          <StatCard label="Berlangsung" value={running} icon="trip" tone="live" />
          <StatCard label="Menunggu" value={waiting} icon="clock" tone="wait" />
          <StatCard label="Selesai" value={completed} icon="check" tone="done" />
        </div>
        {assignmentRows.error ? <p className="ops-note">Data penugasan belum dapat dimuat.</p> : assignments.length === 0 ? (
          <p className="ops-note">Belum ada penugasan hari ini.</p>
        ) : (
          <p className="ops-note">{running} perjalanan berlangsung dari {assignments.length} penugasan hari ini.</p>
        )}
      </section>

      <section className="panel admin-work-panel">
        <header className="panel-head"><div><h2 className="panel-title">Menu pengelolaan</h2><div className="panel-subtitle">Pilih modul yang ingin dikerjakan</div></div></header>
        <div className="quick-grid" style={{ padding: "0 16px 16px", margin: 0 }}>
          {shortcuts.map((item) => <Link className="quick-tile" href={item.href} key={item.href}>
            <span aria-hidden="true"><Icon name={item.icon} /></span><strong>{item.label}</strong>
          </Link>)}
        </div>
      </section>
    </>
  );
}
