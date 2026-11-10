import { operatorReadContext } from "@/lib/operator/read";
import { csvCell } from "@/lib/operator/csv";
import { getProjectAreaContext, loadProjectAreaScope } from "@/lib/project-areas/context";

const PAGE_SIZE = 1000;

export async function GET() {
  const supabase = await operatorReadContext();
  if (!supabase) {
    return new Response("Layanan database belum dikonfigurasi.", { status: 503 });
  }

  const areaContext = await getProjectAreaContext(supabase);
  const scope = await loadProjectAreaScope(supabase, areaContext.selectedId);

  type TripExportRow = {
    id: string;
    status: string;
    started_at: string | null;
    arrived_at: string | null;
    completed_at: string | null;
    trip_assignments:
      | {
          service_date: string;
          routes: {
            route_name: string;
            school_name: string;
            direction: string;
            project_areas: { name: string } | null;
          } | null;
          buses: { fleet_code: string } | null;
          drivers: { full_name: string } | null;
        }
      | {
          service_date: string;
          routes: {
            route_name: string;
            school_name: string;
            direction: string;
            project_areas: { name: string } | null;
          } | null;
          buses: { fleet_code: string } | null;
          drivers: { full_name: string } | null;
        }[]
      | null;
  };

  let assignmentIds: string[] = [];
  if (areaContext.selectedId) {
    const { data: areaAssignments } = await supabase
      .from("trip_assignments")
      .select("id")
      .in("route_id", scope.routeIds);
    assignmentIds = ((areaAssignments ?? []) as { id: string }[]).map((row) => row.id);
  }

  const trips: TripExportRow[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    let query = supabase
      .from("trips")
      .select("id, status, started_at, arrived_at, completed_at, trip_assignments(service_date, routes(route_name, school_name, direction, project_areas(name)), buses(fleet_code), drivers(full_name))")
      .order("created_at", { ascending: false });
    if (areaContext.selectedId) query = query.in("assignment_id", assignmentIds);
    const { data, error } = await query.range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      return new Response("Laporan belum dapat dibuat. Silakan coba kembali.", { status: 500 });
    }

    const batch = (data ?? []) as unknown as TripExportRow[];
    trips.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }

  const header = ["Tanggal layanan", "Project Area", "Rute", "Sekolah", "Arah", "Kode bus", "Pengemudi", "Status", "Mulai", "Tiba", "Selesai"];
  const rows = trips.map((trip) => {
    const assignment = Array.isArray(trip.trip_assignments) ? trip.trip_assignments[0] : trip.trip_assignments;
    const route = assignment && assignment.routes;
    const bus = assignment && assignment.buses;
    const driver = assignment && assignment.drivers;
    return [
      assignment?.service_date,
      route?.project_areas?.name,
      route?.route_name,
      route?.school_name,
      route?.direction,
      bus?.fleet_code,
      driver?.full_name,
      trip.status,
      trip.started_at,
      trip.arrived_at,
      trip.completed_at,
    ].map(csvCell).join(",");
  });

  const csv = [header.map(csvCell).join(","), ...rows].join("\r\n");
  const areaCode = (areaContext.selected?.code ?? "semua-area").toLowerCase();
  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laporan-perjalanan-${areaCode}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
