import type { Metadata } from "next";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { requireDriver } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import type { TripRow } from "@/lib/types";
import {
  formatDate,
  formatDateTime,
  formatTime,
  routeDirectionLabel,
  tripStatusLabel,
} from "@/lib/validation";

export const metadata: Metadata = { title: "Riwayat Perjalanan | Pengemudi" };

export default async function DriverHistoryPage() {
  const access = await requireDriver();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const supabase = await createServerSupabase();
  if (!supabase) return <ConfigNotice />;

  const { data, error } = await supabase
    .from("trips")
    .select(
      "id, assignment_id, status, started_at, completed_at, arrived_at, created_at, trip_assignments(service_date, driver_id, routes(route_name, school_name, direction), buses(fleet_code, plate_number))",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  // RLS already limits trips to this driver; the explicit filter keeps the contract clear.
  const trips = ((data ?? []) as unknown as TripRow[]).filter(
    (trip) => (trip.trip_assignments as unknown as { driver_id?: string } | null)?.driver_id === access.driver.id,
  );

  return (
    <>
      <PageHeader
        title="Riwayat perjalanan"
        description="Hanya perjalanan yang Anda jalankan. Riwayat tidak dapat diubah atau dihapus dari aplikasi."
      />

      {error && <Notice kind="error">Riwayat perjalanan belum dapat dimuat. Muat ulang halaman atau coba lagi.</Notice>}

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">50 perjalanan terbaru</h2>
            <div className="panel-subtitle">Waktu mulai, tiba, dan selesai dicatat sistem</div>
          </div>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Tanggal</th>
                <th scope="col">Rute</th>
                <th scope="col">Bus</th>
                <th scope="col">Status</th>
                <th scope="col">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 ? (
                <EmptyRow
                  colSpan={5}
                  title="Belum ada riwayat perjalanan"
                  detail="Riwayat muncul setelah Anda memulai dan menyelesaikan tugas. Tidak ada perjalanan contoh."
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
                    <td>{trip.trip_assignments?.buses?.fleet_code ?? "—"}</td>
                    <td>
                      <Pill tone={trip.status === "completed" ? "success" : trip.status === "in_progress" ? "info" : "neutral"}>
                        {tripStatusLabel(trip.status)}
                      </Pill>
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
    </>
  );
}
