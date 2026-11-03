import { operatorReadContext } from "@/lib/operator/read";

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
  const supabase = await operatorReadContext();
  if (!supabase) {
    return new Response("Layanan database belum dikonfigurasi.", { status: 503 });
  }

  const { data, error } = await supabase
    .from("trips")
    .select("id, status, started_at, arrived_at, completed_at, trip_assignments(service_date, routes(route_name, school_name, direction), buses(fleet_code), drivers(full_name))")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    return new Response("Laporan belum dapat dibuat. Silakan coba kembali.", { status: 500 });
  }

  const header = ["Tanggal layanan", "Rute", "Sekolah", "Arah", "Kode bus", "Pengemudi", "Status", "Mulai", "Tiba", "Selesai"];
  const rows = (data ?? []).map((trip) => {
    const assignment = Array.isArray(trip.trip_assignments) ? trip.trip_assignments[0] : trip.trip_assignments;
    const route = assignment && (Array.isArray(assignment.routes) ? assignment.routes[0] : assignment.routes);
    const bus = assignment && (Array.isArray(assignment.buses) ? assignment.buses[0] : assignment.buses);
    const driver = assignment && (Array.isArray(assignment.drivers) ? assignment.drivers[0] : assignment.drivers);
    return [
      assignment?.service_date,
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
  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="laporan-perjalanan-operator.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
