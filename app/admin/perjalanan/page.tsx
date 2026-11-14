import type { Metadata } from "next";
import { AdminCopy } from "@/components/i18n/AdminCopy";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { ProjectAreaTabs } from "@/components/admin/ProjectAreaTabs";
import { adminReadContext } from "@/lib/admin/read";
import { getProjectAreaContext, loadProjectAreaScope } from "@/lib/project-areas/context";
import type { TripRow } from "@/lib/types";
import { routeDirectionLabel, tripStatusLabel } from "@/lib/validation";
import { getRequestLocale } from "@/lib/i18n/server";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

export const metadata: Metadata = { title: "Perjalanan | Operator" };

function tripTone(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "in_progress") return "info" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "delayed") return "warning" as const;
  return "neutral" as const;
}

export default async function TripsPage() {
  const locale = await getRequestLocale();
  const c = (value: string) => translateAdminCopy(value, locale) ?? value;
  const dateLocale = locale === "ar" ? "ar-SA-u-ca-gregory" : locale === "en" ? "en-GB" : "id-ID";
  const formatDate = (value: string) => new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Riyadh" }).format(new Date(value.length <= 10 ? `${value.slice(0, 10)}T12:00:00+03:00` : value));
  const formatDateTime = (value: string | null) => value ? new Intl.DateTimeFormat(dateLocale, { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Riyadh" }).format(new Date(value)) : "—";
  const formatTime = (value: string | null) => value ? new Intl.DateTimeFormat(dateLocale, { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Riyadh" }).format(new Date(value)) : "—";
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const areaContext = await getProjectAreaContext(supabase);
  const scope = await loadProjectAreaScope(supabase, areaContext.selectedId);

  let assignmentIds: string[] = [];
  if (areaContext.selectedId) {
    const { data: areaAssignments } = await supabase
      .from("trip_assignments")
      .select("id")
      .in("route_id", scope.routeIds);
    assignmentIds = ((areaAssignments ?? []) as { id: string }[]).map((row) => row.id);
  }

  let tripsQuery = supabase
    .from("trips")
    .select(
      "id, assignment_id, status, started_at, completed_at, arrived_at, created_at, trip_assignments(service_date, routes(route_name, school_name, direction, project_areas(name)), buses(fleet_code, plate_number), drivers(full_name))",
    )
    .order("created_at", { ascending: false })
    .limit(60);
  if (areaContext.selectedId) tripsQuery = tripsQuery.in("assignment_id", assignmentIds);

  const { data, error } = await tripsQuery;

  const trips = (data ?? []) as unknown as TripRow[];
  const active = trips.filter((trip) => trip.status === "in_progress").length;

  return (
    <>
      <PageHeader
        title={c("Perjalanan")}
        description={c("Perjalanan dibuat dan diakhiri oleh pengemudi yang ditugaskan. Operator Utama memantau status dan waktu, bukan memulai perjalanan dari sini.")}
        actions={<Pill tone={active > 0 ? "info" : "neutral"}>{active} {c("Berlangsung")}</Pill>}
      />

      <ProjectAreaTabs areas={areaContext.activeAreas} selectedId={areaContext.selectedId} nextPath="/admin/perjalanan" compact />

      {error && <Notice kind="error">{c("Daftar perjalanan belum dapat dimuat. Coba lagi.")}</Notice>}

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title"><AdminCopy value="60 perjalanan terbaru" /></h2>
            <div className="panel-subtitle"><AdminCopy value="Waktu mulai, tiba di sekolah, dan selesai dicatat oleh sistem" /></div>
          </div>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col"><AdminCopy value="Tanggal" /></th>
                <th scope="col"><AdminCopy value="Rute" /></th>
                <th scope="col"><AdminCopy value="Pengemudi & bus" /></th>
                <th scope="col"><AdminCopy value="Status" /></th>
                <th scope="col"><AdminCopy value="Waktu" /></th>
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 ? (
                <EmptyRow
                  colSpan={5}
                  title={c("Belum ada perjalanan")}
                  detail={c("Perjalanan akan muncul setelah pengemudi memulai tugas yang ditugaskan. Tidak ada perjalanan contoh yang ditampilkan.")}
                />
              ) : (
                trips.map((trip) => (
                  <tr key={trip.id}>
                    <td>{formatDate(trip.trip_assignments?.service_date ?? trip.created_at)}</td>
                    <td>
                      <strong>{trip.trip_assignments?.routes?.route_name ?? c("Rute")}</strong>
                      <small>
                        {trip.trip_assignments?.routes?.school_name} ·{" "}
                        {c(routeDirectionLabel(trip.trip_assignments?.routes?.direction ?? ""))}
                      </small>
                    </td>
                    <td>
                      <strong>{trip.trip_assignments?.drivers?.full_name ?? c("Pengemudi")}</strong>
                      <small>
                        {trip.trip_assignments?.buses?.fleet_code}
                        {trip.trip_assignments?.buses?.plate_number
                          ? ` · ${trip.trip_assignments.buses.plate_number}`
                          : ""}
                      </small>
                    </td>
                    <td>
                      <Pill tone={tripTone(trip.status)}>{c(tripStatusLabel(trip.status))}</Pill>
                    </td>
                    <td>
                      <small>{c("Mulai")} {formatTime(trip.started_at)}</small>
                      <small>{c("Tiba")} {formatTime(trip.arrived_at)}</small>
                      <small>{c("Selesai")} {trip.completed_at ? formatDateTime(trip.completed_at) : "—"}</small>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Notice kind="info">{c("Lokasi GPS terbaru hanya tersedia selama perjalanan berlangsung dan ditampilkan pada portal wali yang berhak. Halaman ini tidak menampilkan lokasi lama sebagai posisi terkini dan tidak mengubah status kamera.")}</Notice>
    </>
  );
}
