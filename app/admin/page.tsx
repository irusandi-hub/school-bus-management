import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, PageHeader, Pill, StatCard } from "@/components/admin/ui";
import { ProjectAreaTabs } from "@/components/admin/ProjectAreaTabs";
import { Icon } from "@/components/ui/Icon";
import { adminReadContext } from "@/lib/admin/read";
import { getProjectAreaContext, loadProjectAreaScope } from "@/lib/project-areas/context";
import { formatDate, serviceDateInTimeZone } from "@/lib/validation";

export const metadata: Metadata = { title: "Ringkasan | Operator" };

export default async function AdminHomePage() {
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const areaContext = await getProjectAreaContext(supabase);
  const scope = await loadProjectAreaScope(supabase, areaContext.selectedId);
  const selectedId = areaContext.selectedId;
  const date = serviceDateInTimeZone();

  let schoolsQuery = supabase.from("schools").select("id", { count: "exact", head: true }).eq("active", true);
  if (selectedId) schoolsQuery = schoolsQuery.eq("project_area_id", selectedId);

  let studentsQuery = supabase.from("students").select("id", { count: "exact", head: true }).eq("service_status", "active");
  if (selectedId) studentsQuery = studentsQuery.in("school_id", scope.schoolIds);

  let busesQuery = supabase.from("buses").select("id", { count: "exact", head: true }).eq("active", true);
  if (selectedId) busesQuery = busesQuery.eq("project_area_id", selectedId);

  let driversQuery = supabase.from("drivers").select("id", { count: "exact", head: true }).eq("active", true);
  if (selectedId) driversQuery = driversQuery.eq("project_area_id", selectedId);

  let assignmentQuery = supabase
    .from("trip_assignments")
    .select("id, trips(id, status)")
    .eq("service_date", date);
  if (selectedId) assignmentQuery = assignmentQuery.in("route_id", scope.routeIds);

  const [schoolRows, studentRows, busRows, driverRows, assignmentRows] = await Promise.all([
    schoolsQuery,
    studentsQuery,
    busesQuery,
    driversQuery,
    assignmentQuery,
  ]);

  const assignments = (assignmentRows.data ?? []) as unknown as {
    id: string;
    trips?: { id: string; status: string }[] | null;
  }[];
  const trips = assignments.flatMap((assignment) => assignment.trips ?? []);
  const running = trips.filter((trip) => trip.status === "in_progress").length;
  const completed = trips.filter((trip) => trip.status === "completed").length;
  const waiting = Math.max(assignments.length - running - completed, 0);
  const contextLabel = areaContext.selected?.name ?? "Semua Area";

  const shortcuts = [
    { href: "/admin/area", label: "Project Area", icon: "operator" },
    { href: "/admin/sekolah", label: "Sekolah", icon: "school" },
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
      <PageHeader
        title="Ringkasan"
        description={`Operator Utama mengelola seluruh Project Area, sekolah, siswa, wali, armada, rute, penugasan, dan perjalanan. Konteks aktif: ${contextLabel}.`}
        actions={<Pill tone="info">{formatDate(date)}</Pill>}
      />

      <ProjectAreaTabs
        areas={areaContext.activeAreas}
        selectedId={selectedId}
        nextPath="/admin"
      />

      <section className="stats" aria-label={`Data aktif ${contextLabel}`}>
        <StatCard label="Sekolah aktif" value={schoolRows.count ?? 0} icon="school" note={contextLabel} />
        <StatCard label="Siswa aktif" value={studentRows.count ?? 0} icon="students" note="Layanan aktif" />
        <StatCard label="Bus aktif" value={busRows.count ?? 0} note={`${driverRows.count ?? 0} pengemudi aktif`} icon="bus" />
        <StatCard label="Project Area" value={areaContext.activeAreas.length} icon="operator" note="Area aktif" />
      </section>

      <section className="panel admin-work-panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Operasional hari ini</h2>
            <div className="panel-subtitle">{assignments.length} penugasan · {contextLabel}</div>
          </div>
          <Link className="btn btn-secondary btn-sm" href="/admin/penugasan">Kelola penugasan</Link>
        </header>
        <div className="stats stats-3" style={{ padding: 14, margin: 0 }}>
          <StatCard label="Berlangsung" value={running} icon="trip" tone="live" />
          <StatCard label="Menunggu" value={waiting} icon="clock" tone="wait" />
          <StatCard label="Selesai" value={completed} icon="check" tone="done" />
        </div>
        {assignmentRows.error ? <p className="ops-note">Data penugasan belum dapat dimuat.</p> : assignments.length === 0 ? (
          <p className="ops-note">Belum ada penugasan hari ini pada konteks ini.</p>
        ) : (
          <p className="ops-note">{running} perjalanan berlangsung dari {assignments.length} penugasan hari ini.</p>
        )}
      </section>

      <section className="panel admin-work-panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Menu Operator</h2>
            <div className="panel-subtitle">Pilih modul yang ingin dikerjakan pada konteks area aktif</div>
          </div>
        </header>
        <div className="quick-grid" style={{ padding: "0 16px 16px", margin: 0 }}>
          {shortcuts.map((item) => (
            <Link className="quick-tile" href={item.href} key={item.href}>
              <span aria-hidden="true"><Icon name={item.icon} /></span>
              <strong>{item.label}</strong>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
