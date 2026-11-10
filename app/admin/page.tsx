import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, MetricStrip, PageHeader, Pill } from "@/components/admin/ui";
import { ProjectAreaTabs } from "@/components/admin/ProjectAreaTabs";
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

  return (
    <>
      <PageHeader
        title="Ringkasan"
        description={`Kendali global Operator Utama. Konteks aktif: ${contextLabel}.`}
        actions={<Pill tone="info">{formatDate(date)}</Pill>}
      />

      <ProjectAreaTabs areas={areaContext.activeAreas} selectedId={selectedId} nextPath="/admin" compact />

      <MetricStrip
        label={`Data aktif ${contextLabel}`}
        items={[
          { label: "Sekolah", value: schoolRows.count ?? 0, note: "Aktif", icon: "school" },
          { label: "Siswa", value: studentRows.count ?? 0, note: "Layanan aktif", icon: "students" },
          { label: "Bus", value: busRows.count ?? 0, note: "Armada aktif", icon: "bus" },
          { label: "Pengemudi", value: driverRows.count ?? 0, note: "Akun aktif", icon: "driver" },
          { label: "Project Area", value: areaContext.activeAreas.length, note: "Area aktif", icon: "operator" },
        ]}
      />

      <section className="panel admin-today">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Operasional hari ini</h2>
            <div className="panel-subtitle">
              {assignments.length} penugasan · {contextLabel}
            </div>
          </div>
          <Link className="btn btn-secondary btn-sm" href="/admin/penugasan">
            Kelola penugasan
          </Link>
        </header>
        <div className="today-counts">
          <div className="today-count tone-live">
            <span>Berlangsung</span>
            <strong>{running}</strong>
          </div>
          <div className="today-count tone-wait">
            <span>Menunggu</span>
            <strong>{waiting}</strong>
          </div>
          <div className="today-count tone-done">
            <span>Selesai</span>
            <strong>{completed}</strong>
          </div>
          <p className="today-note">
            {assignmentRows.error
              ? "Data penugasan belum dapat dimuat."
              : assignments.length === 0
                ? "Belum ada penugasan hari ini pada konteks ini."
                : `${running} perjalanan berlangsung dari ${assignments.length} penugasan.`}
          </p>
        </div>
      </section>
    </>
  );
}
