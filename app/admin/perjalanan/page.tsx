import type { Metadata } from "next";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { adminReadContext } from "@/lib/admin/read";
import type { TripRow } from "@/lib/types";
import {
  formatDate,
  formatDateTime,
  formatTime,
  routeDirectionLabel,
  tripStatusLabel,
} from "@/lib/validation";

export const metadata: Metadata = { title: "Perjalanan | Pengelola" };

function tripTone(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "in_progress") return "info" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "delayed") return "warning" as const;
  return "neutral" as const;
}

export default async function TripsPage() {
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const { data, error } = await supabase
    .from("trips")
    .select(
      "id, assignment_id, status, started_at, completed_at, arrived_at, created_at, trip_assignments(service_date, routes(route_name, school_name, direction), buses(fleet_code, plate_number), drivers(full_name))",
    )
    .order("created_at", { ascending: false })
    .limit(60);

  const trips = (data ?? []) as unknown as TripRow[];
  const active = trips.filter((trip) => trip.status === "in_progress").length;

  return (
    <>
      <PageHeader
        title="Perjalanan"
        description="Perjalanan dibuat dan diakhiri oleh pengemudi yang ditugaskan. Pengelola memantau status dan waktu, bukan memulai perjalanan dari sini."
        actions={<Pill tone={active > 0 ? "info" : "neutral"}>{active} berlangsung</Pill>}
      />

      {error && <Notice kind="error">Daftar perjalanan belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>}

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">60 perjalanan terbaru</h2>
            <div className="panel-subtitle">Waktu mulai, tiba di sekolah, dan selesai dicatat oleh sistem</div>
          </div>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Tanggal</th>
                <th scope="col">Rute</th>
                <th scope="col">Pengemudi &amp; bus</th>
                <th scope="col">Status</th>
                <th scope="col">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 ? (
                <EmptyRow
                  colSpan={5}
                  title="Belum ada perjalanan"
                  detail="Perjalanan akan muncul setelah pengemudi memulai tugas yang ditugaskan. Tidak ada perjalanan contoh yang ditampilkan."
                />
              ) : (
                trips.map((trip) => (
                  <tr key={trip.id}>
                    <td>{formatDate(trip.trip_assignments?.service_date ?? trip.created_at)}</td>
                    <td>
                      <strong>{trip.trip_assignments?.routes?.route_name ?? "Rute"}</strong>
                      <small>
                        {trip.trip_assignments?.routes?.school_name} ·{" "}
                        {routeDirectionLabel(trip.trip_assignments?.routes?.direction ?? "")}
                      </small>
                    </td>
                    <td>
                      <strong>{trip.trip_assignments?.drivers?.full_name ?? "Pengemudi"}</strong>
                      <small>
                        {trip.trip_assignments?.buses?.fleet_code}
                        {trip.trip_assignments?.buses?.plate_number
                          ? ` · ${trip.trip_assignments.buses.plate_number}`
                          : ""}
                      </small>
                    </td>
                    <td>
                      <Pill tone={tripTone(trip.status)}>{tripStatusLabel(trip.status)}</Pill>
                    </td>
                    <td>
                      <small>Mulai {formatTime(trip.started_at)}</small>
                      <small>Tiba {formatTime(trip.arrived_at)}</small>
                      <small>Selesai {trip.completed_at ? formatDateTime(trip.completed_at) : "—"}</small>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Notice kind="info">
        Posisi GPS dan kamera bus belum tersedia. Siaran kamera perjalanan dikelola pengemudi dan tidak ditampilkan di
        halaman ini; halaman ini tidak menampilkan lokasi atau status perangkat yang tidak benar-benar tercatat.
      </Notice>
    </>
  );
}
