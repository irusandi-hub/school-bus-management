import type { Metadata } from "next";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { operatorReadContext } from "@/lib/operator/read";
import type { TripRow } from "@/lib/types";
import { formatDate, formatTime, routeDirectionLabel, tripStatusLabel } from "@/lib/validation";

export const metadata: Metadata = { title: "Perjalanan | Operator" };

export default async function OperatorTripsPage() {
  const supabase = await operatorReadContext();
  if (!supabase) return <ConfigNotice />;

  const { data, error } = await supabase
    .from("trips")
    .select(
      "id, assignment_id, status, started_at, completed_at, arrived_at, created_at, trip_assignments(service_date, routes(route_name, school_name, direction), buses(fleet_code), drivers(full_name))",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  const trips = (data ?? []) as unknown as TripRow[];
  const active = trips.filter((trip) => trip.status === "in_progress").length;

  return (
    <>
      <PageHeader
        title="Perjalanan armada Anda"
        description="Hanya perjalanan yang memakai bus organisasi Anda yang ditampilkan. Posisi GPS dan kamera belum tersedia."
        actions={<Pill tone={active > 0 ? "info" : "neutral"}>{active} berlangsung</Pill>}
      />

      {error && <Notice kind="error">Daftar perjalanan belum dapat dimuat.</Notice>}

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">50 perjalanan terbaru</h2>
            <div className="panel-subtitle">Waktu dicatat oleh sistem saat pengemudi memulai dan mengakhiri tugas</div>
          </div>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Tanggal</th>
                <th scope="col">Rute</th>
                <th scope="col">Pengemudi</th>
                <th scope="col">Status</th>
                <th scope="col">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 ? (
                <EmptyRow
                  colSpan={5}
                  title="Belum ada perjalanan"
                  detail="Perjalanan muncul setelah pengemudi memulai penugasan. Tidak ada data perjalanan contoh."
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
                      <strong>{trip.trip_assignments?.drivers?.full_name ?? "—"}</strong>
                      <small>{trip.trip_assignments?.buses?.fleet_code}</small>
                    </td>
                    <td>
                      <Pill tone={trip.status === "in_progress" ? "info" : trip.status === "completed" ? "success" : "neutral"}>
                        {tripStatusLabel(trip.status)}
                      </Pill>
                    </td>
                    <td>
                      <small>Mulai {formatTime(trip.started_at)}</small>
                      <small>Tiba {formatTime(trip.arrived_at)}</small>
                      
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
