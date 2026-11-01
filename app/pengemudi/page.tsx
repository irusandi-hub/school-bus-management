import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, EmptyRow, Notice, Pill } from "@/components/admin/ui";
import { requireDriver } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import type { TripAssignmentRow } from "@/lib/types";
import { formatDate, formatTime, routeDirectionLabel, tripStatusLabel } from "@/lib/validation";

export const metadata: Metadata = { title: "Tugas Hari Ini | Pengemudi" };

function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export default async function DriverHomePage() {
  const access = await requireDriver();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const supabase = await createServerSupabase();
  if (!supabase) return <ConfigNotice />;

  const { data, error } = await supabase
    .from("trip_assignments")
    .select(
      "id, service_date, routes(route_name, school_name, direction), buses(fleet_code, plate_number, capacity), trips(id, status, started_at, completed_at, arrived_at)",
    )
    .eq("driver_id", access.driver.id)
    .eq("service_date", today())
    .order("service_date", { ascending: true });

  const assignments = (data ?? []) as unknown as TripAssignmentRow[];
  const active = assignments.find((assignment) => assignment.trips?.[0]?.status === "in_progress");

  return (
    <>
      <section className="driver-hero-card">
        <div>
          <p className="eyebrow light">TUGAS HARI INI</p>
          <h1>Selamat bertugas, {access.driver.full_name || "Pengemudi"}.</h1>
          <p>
            {formatDate(today())} · {assignments.length} tugas terjadwal. Buka tugas untuk melihat urutan titik jemput
            dan mencatat kehadiran siswa.
          </p>
        </div>
        <div className="driver-hero-meta">
          <span>Perjalanan berlangsung</span>
          <strong>{active ? active.routes?.route_name ?? "Aktif" : "Tidak ada"}</strong>
        </div>
      </section>

      {error && <Notice kind="error">Tugas hari ini belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>}
      {assignments.length === 0 && !error && (
        <Notice kind="info">
          Belum ada penugasan untuk hari ini. Tugas dibuat oleh Admin Pusat atau operator. Tidak ada jadwal contoh
          yang ditampilkan.
        </Notice>
      )}

      <section className="panel driver-panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Daftar tugas</h2>
            <div className="panel-subtitle">Hanya penugasan yang ditujukan kepada Anda</div>
          </div>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Rute &amp; sekolah</th>
                <th scope="col">Bus</th>
                <th scope="col">Status</th>
                <th scope="col">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <EmptyRow
                  colSpan={4}
                  title="Belum ada tugas hari ini"
                  detail="Hubungi Admin Pusat atau operator bila Anda seharusnya bertugas hari ini."
                />
              ) : (
                assignments.map((assignment) => {
                  const trip = assignment.trips?.[0];
                  return (
                    <tr key={assignment.id}>
                      <td>
                        <strong>{assignment.routes?.route_name ?? "Rute"}</strong>
                        <small>
                          {assignment.routes?.school_name} · {routeDirectionLabel(assignment.routes?.direction ?? "")}
                        </small>
                      </td>
                      <td>
                        <strong>{assignment.buses?.fleet_code ?? "—"}</strong>
                        <small>
                          {assignment.buses?.plate_number ?? "Nomor polisi belum diisi"} ·{" "}
                          {assignment.buses?.capacity ?? 0} kursi
                        </small>
                      </td>
                      <td>
                        <Pill
                          tone={
                            trip?.status === "in_progress"
                              ? "info"
                              : trip?.status === "completed"
                                ? "success"
                                : "neutral"
                          }
                        >
                          {trip ? tripStatusLabel(trip.status) : "Belum dimulai"}
                        </Pill>
                        {trip?.started_at && <small>Mulai {formatTime(trip.started_at)}</small>}
                      </td>
                      <td>
                        <Link className="btn btn-primary btn-sm" href={`/pengemudi/tugas/${assignment.id}`}>
                          Buka tugas
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Notice kind="info">
        Menu administrasi, data pengemudi lain, dan data siswa di luar rute Anda tidak tersedia di area pengemudi.
      </Notice>
    </>
  );
}
