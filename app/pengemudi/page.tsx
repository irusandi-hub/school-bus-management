import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, EmptyState, Notice, TripStatusPill } from "@/components/admin/ui";
import { NavigationDestinationCard } from "@/components/driver/NavigationDestinationCard";
import { Icon } from "@/components/ui/Icon";
import { requireDriver } from "@/lib/auth";
import { buildNavigationPlan } from "@/lib/driver/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { NavigationRosterEntry } from "@/lib/driver/navigation";
import type { RouteStopRow, TripAssignmentRow } from "@/lib/types";
import { formatDate, formatTime, routeDirectionLabel } from "@/lib/validation";

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

  const date = today();
  const { data, error } = await supabase
    .from("trip_assignments")
    .select(
      "id, route_id, service_date, routes(route_name, school_name, direction), buses(fleet_code, plate_number, capacity), trips(id, status, started_at, completed_at, arrived_at)",
    )
    .eq("driver_id", access.driver.id)
    .eq("service_date", date)
    .order("service_date", { ascending: true });

  const assignments = (data ?? []) as unknown as TripAssignmentRow[];

  // Data titik dan kehadiran untuk tombol navigasi pada setiap kartu tugas.
  const routeIds = Array.from(new Set(assignments.map((assignment) => assignment.route_id).filter(Boolean)));
  const tripIds = assignments.flatMap((assignment) => (assignment.trips ?? []).map((trip) => trip.id));
  const emptyResult = Promise.resolve({ data: [] as unknown[], error: null });

  const [stopsResult, rosterResult, eventsResult] = await Promise.all([
    routeIds.length > 0
      ? supabase
          .from("route_stops")
          .select("id, route_id, stop_order, stop_name, latitude, longitude, is_school")
          .in("route_id", routeIds)
          .order("stop_order", { ascending: true })
      : emptyResult,
    routeIds.length > 0
      ? supabase
          .from("student_route_stops")
          .select("student_id, route_id, stop_id, students(full_name, home_address, pickup_notes)")
          .in("route_id", routeIds)
          .eq("active", true)
      : emptyResult,
    tripIds.length > 0
      ? supabase
          .from("trip_student_events")
          .select("trip_id, student_id, event_type, occurred_at")
          .in("trip_id", tripIds)
      : emptyResult,
  ]);

  const stopsByRoute = new Map<string, RouteStopRow[]>();
  for (const stop of (stopsResult.data ?? []) as unknown as (RouteStopRow & { route_id: string })[]) {
    const list = stopsByRoute.get(stop.route_id) ?? [];
    list.push(stop);
    stopsByRoute.set(stop.route_id, list);
  }

  const rosterByRoute = new Map<string, NavigationRosterEntry[]>();
  for (const entry of (rosterResult.data ?? []) as unknown as (NavigationRosterEntry & { route_id: string })[]) {
    const list = rosterByRoute.get(entry.route_id) ?? [];
    list.push(entry);
    rosterByRoute.set(entry.route_id, list);
  }

  const eventsByTrip = new Map<string, { student_id: string; event_type: string; occurred_at: string }[]>();
  for (const event of (eventsResult.data ?? []) as unknown as {
    trip_id: string;
    student_id: string;
    event_type: string;
    occurred_at: string;
  }[]) {
    const list = eventsByTrip.get(event.trip_id) ?? [];
    list.push(event);
    eventsByTrip.set(event.trip_id, list);
  }

  const active = assignments.filter((assignment) => assignment.trips?.[0]?.status === "in_progress");
  const finished = assignments.filter((assignment) => assignment.trips?.[0]?.status === "completed");
  const nextTask = active[0] ?? assignments.find((assignment) => !assignment.trips?.[0]) ?? assignments[0];

  return (
    <>
      <section className="driver-hero-card">
        <div>
          <p className="eyebrow light">TUGAS HARI INI · {formatDate(date)}</p>
          <h1>Selamat bertugas, {access.driver.full_name || "Pengemudi"}.</h1>
          <p>
            {assignments.length === 0
              ? "Belum ada tugas untuk hari ini. Hubungi operator bila Anda seharusnya bertugas."
              : `${assignments.length} tugas terjadwal. Buka tugas untuk melihat urutan titik jemput dan mencatat kehadiran siswa.`}
          </p>
        </div>
        <div className="driver-hero-meta">
          <span>Perjalanan berlangsung</span>
          <strong>{active[0]?.routes?.route_name ?? "Tidak ada"}</strong>
        </div>
      </section>

      {error && <Notice kind="error">Tugas hari ini belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>}

      <section className="driver-summary" aria-label="Ringkasan tugas hari ini">
        <div>
          <span>Total tugas</span>
          <strong>{assignments.length}</strong>
          <small>Penugasan yang ditujukan kepada Anda</small>
        </div>
        <div>
          <span>Berlangsung</span>
          <strong>{active.length}</strong>
          <small>Sedang dijalankan</small>
        </div>
        <div>
          <span>Selesai</span>
          <strong>{finished.length}</strong>
          <small>Sudah ditutup</small>
        </div>
      </section>

      <section className="panel driver-panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Daftar tugas</h2>
            <div className="panel-subtitle">Hanya penugasan yang ditujukan kepada Anda</div>
          </div>
          <span className="inline-meta">
            <Icon name="clock" size={13} />
            Status dari catatan perjalanan
          </span>
        </header>

        {assignments.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="Belum ada tugas hari ini"
            detail="Tugas dibuat oleh Admin Pusat atau operator. Tidak ada jadwal contoh yang ditampilkan."
          />
        ) : (
          <ul className="task-card-grid">
            {assignments.map((assignment) => {
              const trip = assignment.trips?.[0];
              const isNext = assignment.id === nextTask?.id && trip?.status !== "completed";
              const plan = buildNavigationPlan({
                stops: stopsByRoute.get(assignment.route_id) ?? [],
                roster: rosterByRoute.get(assignment.route_id) ?? [],
                events: trip ? (eventsByTrip.get(trip.id) ?? []) : [],
                trip: trip
                  ? {
                      status: trip.status,
                      started_at: trip.started_at,
                      arrived_at: trip.arrived_at,
                      completed_at: trip.completed_at,
                    }
                  : null,
                direction: assignment.routes?.direction ?? "morning",
              });
              return (
                <li className="task-card" key={assignment.id}>
                  <div className="task-card-head">
                    <div>
                      <strong>{assignment.routes?.route_name ?? "Rute"}</strong>
                      <small>
                        {assignment.routes?.school_name} ·{" "}
                        {routeDirectionLabel(assignment.routes?.direction ?? "")}
                      </small>
                    </div>
                    <TripStatusPill status={trip?.status} />
                  </div>

                  <div className="task-card-meta">
                    <span>
                      <Icon name="bus" size={13} />
                      {assignment.buses?.fleet_code ?? "Bus belum ditetapkan"}
                    </span>
                    <span>
                      <Icon name="pin" size={13} />
                      {assignment.buses?.capacity ?? 0} kursi
                    </span>
                    {trip?.started_at && (
                      <span>
                        <Icon name="clock" size={13} />
                        Mulai {formatTime(trip.started_at)}
                      </span>
                    )}
                  </div>

                  <NavigationDestinationCard plan={plan} compact />

                  <Link
                    className={`btn ${isNext ? "btn-primary" : "btn-secondary"} btn-lg`}
                    href={`/pengemudi/tugas/${assignment.id}`}
                  >
                    <Icon name={trip?.status === "in_progress" ? "trip" : "arrowRight"} size={16} />
                    {trip?.status === "in_progress"
                      ? "Lanjutkan perjalanan"
                      : trip?.status === "completed"
                        ? "Lihat ringkasan tugas"
                        : "Buka tugas"}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Notice kind="info">
        Tombol navigasi memakai koordinat titik jemput yang tersimpan dan membuka aplikasi peta di luar aplikasi ini.
        Posisi bus dan kamera belum aktif, sehingga tidak ada pelacakan langsung pada halaman ini.
      </Notice>
    </>
  );
}
