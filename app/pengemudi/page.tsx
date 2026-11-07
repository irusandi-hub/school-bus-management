import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, EmptyState, Notice, Pill } from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { DriverAutoRefresh } from "@/components/driver/DriverAutoRefresh";
import { DriverBroadcastPanel } from "@/components/driver/DriverBroadcastPanel";
import { DriverMapPanel } from "@/components/driver/DriverMapPanel";
import { DriverOpsHeader } from "@/components/driver/DriverOpsHeader";
import { FullRouteNavigator } from "@/components/driver/FullRouteNavigator";
import type { DriverMapStop } from "@/components/driver/DriverRouteMap";
import { cameraDemoEnabled } from "@/lib/camera/demo-policy";
import { deploymentKind } from "@/lib/dev-open-access";
import { OpenSafetyCheckLink } from "@/components/driver/OpenSafetyCheckLink";
import { StudentList, type StudentListRow } from "@/components/driver/StudentList";
import { TripClosePanel } from "@/components/driver/TripClosePanel";
import { Icon } from "@/components/ui/Icon";
import { firstParam, noticeFromParams } from "@/lib/admin/query";
import { requireDriver } from "@/lib/auth";
import { buildFullRoute, buildNavigationPlan } from "@/lib/driver/navigation";
import {
  buildNextStop,
  buildTripProgress,
  resolveStudentTripStates,
  type ProgressStudent,
} from "@/lib/driver/trip-progress";
import { DEFAULT_NAVIGATION_PROVIDER, buildRouteDirectionsUrl } from "@/lib/navigation/external";
import { createServerSupabase } from "@/lib/supabase/server";
import type { RouteStopRow, TripEventRow } from "@/lib/types";
import { formatDate, formatDateTime, formatTime, routeDirectionLabel } from "@/lib/validation";
import { startTrip } from "./actions";

export const metadata: Metadata = { title: "Operasional Hari Ini | Pengemudi" };

function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

type RosterEntry = {
  id: string;
  student_id: string;
  stop_id: string;
  direction: string;
  route_stops: { stop_name: string; stop_order: number } | null;
  students: {
    full_name: string;
    admissions_number: string;
    home_address: string | null;
    pickup_notes: string | null;
  } | null;
};

type AssignmentView = {
  id: string;
  route_id: string;
  service_date: string;
  routes: { id: string; route_name: string; school_name: string; direction: string } | null;
  buses: { fleet_code: string; plate_number: string | null; capacity: number } | null;
  trips: {
    id: string;
    status: string;
    started_at: string | null;
    arrived_at: string | null;
    completed_at: string | null;
    safety_checked_at?: string | null;
    safety_check_notes?: string | null;
    student_count_confirmed?: number | null;
  }[];
};

export default async function DriverOperationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const access = await requireDriver();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const supabase = await createServerSupabase();
  if (!supabase) return <ConfigNotice />;

  const date = today();
  const { data, error } = await supabase
    .from("trip_assignments")
    .select(
      "id, route_id, service_date, routes(id, route_name, school_name, direction), buses(fleet_code, plate_number, capacity), trips(id, status, started_at, arrived_at, completed_at, safety_checked_at, safety_check_notes, student_count_confirmed)",
    )
    .eq("driver_id", access.driver.id)
    .eq("service_date", date)
    .order("service_date", { ascending: true });

  const assignments = (data ?? []) as unknown as AssignmentView[];
  const notice = noticeFromParams(query);
  const requestedId = firstParam(query.tugas);

  // Satu tugas aktif dipilih; tugas lain tetap terjangkau lewat pemilih ringkas.
  const activeAssignment = assignments.find((assignment) => assignment.trips?.[0]?.status === "in_progress");
  const scheduledAssignment = assignments.find((assignment) => assignment.trips?.[0]?.status === "scheduled");
  const selected =
    assignments.find((assignment) => assignment.id === requestedId) ??
    activeAssignment ??
    scheduledAssignment ??
    assignments[0] ??
    null;

  if (!selected) {
    return (
      <>
        <section className="ops-head">
          <div className="ops-head-top">
            <span className="ops-avatar" aria-hidden="true">
              {(access.driver.full_name || "P").slice(0, 1).toUpperCase()}
            </span>
            <div className="ops-ident">
              <strong>{access.driver.full_name || "Pengemudi"}</strong>
              <small>ID {access.driver.id.slice(0, 8).toUpperCase()} · Akun aktif</small>
            </div>
          </div>
          <p className="ops-empty-copy">
            Tidak ada penugasan untuk {formatDate(date)}. Hubungi operator bila Anda seharusnya bertugas.
          </p>
        </section>
        {error && <Notice kind="error">Tugas hari ini belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>}
        <section className="panel">
          <EmptyState
            icon="inbox"
            title="Belum ada tugas hari ini"
            detail="Tugas dibuat oleh Admin Pusat atau operator. Tidak ada jadwal contoh yang ditampilkan."
          />
        </section>
        <p className="ops-foot-link">
          <Link href="/pengemudi/riwayat">
            <Icon name="trip" size={14} /> Lihat riwayat perjalanan
          </Link>
        </p>
      </>
    );
  }

  const routeId = selected.routes?.id ?? "";
  const direction = selected.routes?.direction ?? "morning";
  const trip = selected.trips?.[0] ?? null;

  const emptyResult = Promise.resolve({ data: [] as unknown[], error: null });
  const [stopsResult, rosterResult, eventsResult] = await Promise.all([
    routeId
      ? supabase
          .from("route_stops")
          .select("id, route_id, stop_order, stop_name, latitude, longitude, is_school")
          .eq("route_id", routeId)
          .order("stop_order", { ascending: true })
      : emptyResult,
    routeId
      ? supabase
          .from("student_route_stops")
          .select(
            "id, student_id, stop_id, direction, route_stops(stop_name, stop_order), students(full_name, admissions_number, home_address, pickup_notes)",
          )
          .eq("route_id", routeId)
          .eq("direction", direction)
          .eq("active", true)
      : emptyResult,
    trip
      ? supabase
          .from("trip_student_events")
          .select("id, trip_id, student_id, event_type, occurred_at, notes")
          .eq("trip_id", trip.id)
          .order("occurred_at", { ascending: false })
      : emptyResult,
  ]);

  const stops = (stopsResult.data ?? []) as unknown as RouteStopRow[];
  const roster = ((rosterResult.data ?? []) as unknown as RosterEntry[]).sort(
    (a, b) => (a.route_stops?.stop_order ?? 0) - (b.route_stops?.stop_order ?? 0),
  );
  const events = (eventsResult.data ?? []) as unknown as TripEventRow[];

  // Satu pembacaan status untuk papan progres, jumlah di kendaraan, dan next stop.
  const tripStates = resolveStudentTripStates(
    events.map((event) => ({
      student_id: event.student_id,
      event_type: event.event_type,
      occurred_at: event.occurred_at,
      notes: event.notes,
    })),
  );

  const plan = buildNavigationPlan({
    stops,
    roster: roster.map((entry) => ({
      student_id: entry.student_id,
      stop_id: entry.stop_id,
      students: entry.students,
    })),
    events: events.map((event) => ({
      student_id: event.student_id,
      event_type: event.event_type,
      occurred_at: event.occurred_at,
    })),
    trip: trip
      ? {
          status: trip.status,
          started_at: trip.started_at,
          arrived_at: trip.arrived_at,
          completed_at: trip.completed_at,
        }
      : null,
    direction,
  });

  // Batas tautan mengikuti provider aktif, bukan angka yang ditulis ulang di halaman.
  const fullRoute = buildFullRoute(plan, direction, DEFAULT_NAVIGATION_PROVIDER.maxWaypoints + 1);
  const mapUrl = buildRouteDirectionsUrl(fullRoute.mapStops, plan.origin);
  const mapStops: DriverMapStop[] = fullRoute.stops.map(({ stop, skipReason }) => ({
    id: stop.id,
    order: stop.order,
    name: stop.name,
    isSchool: stop.isSchool,
    latitude: stop.latitude,
    longitude: stop.longitude,
    studentCount: stop.students.length,
    skipped: Boolean(skipReason),
    skipReason,
  }));

  const progressStudents: ProgressStudent[] = roster.map((entry) => {
    const state = tripStates.get(entry.student_id);
    return {
      id: entry.student_id,
      name: entry.students?.full_name ?? "Siswa",
      stopId: entry.stop_id,
      stopOrder: entry.route_stops?.stop_order ?? 0,
      stopName: entry.route_stops?.stop_name ?? "Titik jemput",
      address: entry.students?.home_address ?? null,
      status: state?.status ?? null,
      statusNotes: state?.statusNotes ?? null,
    };
  });

  const studentRows: StudentListRow[] = roster.map((entry) => {
    const state = tripStates.get(entry.student_id);
    return {
      key: entry.id,
      studentId: entry.student_id,
      name: entry.students?.full_name ?? "Siswa",
      admissionsNumber: entry.students?.admissions_number ?? null,
      stopOrder: entry.route_stops?.stop_order ?? 0,
      stopName: entry.route_stops?.stop_name ?? "Titik jemput",
      address: entry.students?.home_address ?? null,
      status: state?.status ?? null,
      issueNote: state?.issueNote ?? null,
    };
  });

  const tripStatus = trip?.status ?? "scheduled";
  const progress = buildTripProgress({ students: progressStudents, direction, tripStatus });
  const nextStop = buildNextStop({
    stops,
    students: progressStudents,
    direction,
    tripStatus,
  });
  const unrecorded = studentRows.filter((row) => !tripStates.get(row.studentId)?.hasAnyEvent);
  const unclearStudents = studentRows.filter((row) => {
    const status = tripStates.get(row.studentId)?.status;
    return !status || status === "boarded";
  }).length;

  const inProgress = trip?.status === "in_progress";
  const completed = trip?.status === "completed";
  const canStart = !trip || trip.status === "scheduled";
  const canEndTrip = Boolean(trip?.arrived_at) && unrecorded.length === 0 && !rosterResult.error && !eventsResult.error;
  const issueNotes = studentRows.filter((row) => row.issueNote);
  const cameraPublishingEnabled = process.env.NEXT_PUBLIC_TRIP_CAMERA_ENABLED === "1";
  const cameraEnabled =
    cameraPublishingEnabled || cameraDemoEnabled(deploymentKind(), process.env.CAMERA_DEVICE_DEMO);
  const startReason = completed
    ? "Perjalanan sudah selesai."
    : inProgress
      ? "Perjalanan sedang berlangsung."
      : trip?.status === "cancelled"
        ? "Perjalanan dibatalkan."
        : "Mulai untuk membuka tindakan siswa dan kamera.";

  return (
    <div className="driver-ops">
      {assignments.length > 1 && (
        <nav className="ops-switch" aria-label="Pilih tugas hari ini">
          <span>Pilih tugas</span>
          {assignments.map((assignment) => {
            const assignmentTrip = assignment.trips?.[0];
            return (
              <Link
                key={assignment.id}
                href={`/pengemudi?tugas=${assignment.id}`}
                aria-current={assignment.id === selected.id ? "page" : undefined}
              >
                {assignment.routes?.route_name ?? "Rute"} · {routeDirectionLabel(assignment.routes?.direction ?? "")} ·{" "}
                {assignmentTrip?.status === "in_progress"
                  ? "Berlangsung"
                  : assignmentTrip?.status === "completed"
                    ? "Selesai"
                    : "Dijadwalkan"}
              </Link>
            );
          })}
        </nav>
      )}

      {notice && <Notice kind={notice.kind}>{notice.message}</Notice>}
      {error && <Notice kind="error">Tugas hari ini belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>}
      {stopsResult.error && <Notice kind="error">Urutan titik jemput belum dapat dimuat.</Notice>}
      {rosterResult.error && <Notice kind="error">Daftar siswa belum dapat dimuat.</Notice>}
      {eventsResult.error && <Notice kind="error">Status siswa belum dapat dimuat.</Notice>}

      <DriverAutoRefresh active={inProgress} />

      <DriverOpsHeader
        driverName={access.driver.full_name}
        driverId={access.driver.id}
        routeName={selected.routes?.route_name ?? "Rute"}
        schoolName={selected.routes?.school_name ?? ""}
        direction={direction}
        serviceDate={selected.service_date}
        tripStatus={tripStatus}
        startedAt={trip?.started_at ?? null}
        arrivedAt={trip?.arrived_at ?? null}
        completedAt={trip?.completed_at ?? null}
        fleetCode={selected.buses?.fleet_code ?? ""}
        plateNumber={selected.buses?.plate_number ?? null}
        capacity={selected.buses?.capacity ?? 0}
        progress={progress}
      >
        {canStart ? (
          <form action={startTrip} className="ops-start">
            <input type="hidden" name="assignment_id" value={selected.id} />
            <ConfirmSubmit
              className="btn ops-primary-action"
              message="Mulai perjalanan untuk tugas ini? Waktu mulai akan dicatat."
              pendingLabel="Memulai…"
            >
              <Icon name="trip" size={16} /> Mulai perjalanan
            </ConfirmSubmit>
          </form>
        ) : inProgress ? (
          <div className="ops-start">
            <OpenSafetyCheckLink />
            <small>Lengkapi pemeriksaan keselamatan.</small>
          </div>
        ) : (
          <div className="ops-start">
            <button className="btn ops-primary-action" type="button" disabled>
              <Icon name="trip" size={16} /> Mulai perjalanan
            </button>
            <small>{startReason}</small>
          </div>
        )}
      </DriverOpsHeader>

      <TripClosePanel
        assignmentId={selected.id}
        trip={trip}
        canEndTrip={canEndTrip}
        unrecordedNames={unrecorded.map((row) => row.name)}
        unclearStudents={unclearStudents}
        totalStudents={studentRows.length}
      />

      <div className="ops-workspace">
        <div className="ops-left">
          <FullRouteNavigator
            plan={plan}
            route={fullRoute}
            mapUrl={mapUrl}
            direction={direction}
            tripStatus={tripStatus}
            nextStop={nextStop}
          />
          <DriverMapPanel stops={mapStops} />
        </div>

        <section className="panel ops-manifest" aria-label="Daftar siswa dan tindakan">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Siswa &amp; tindakan</h2>
            <div className="panel-subtitle">
              Urutan mengikuti rute yang {plan.started ? "terkunci" : "ditetapkan sistem"} · satu tombol per siswa
            </div>
          </div>
          <Pill tone={studentRows.length > 0 ? "info" : "warning"}>{studentRows.length} siswa</Pill>
        </header>

        {studentRows.length === 0 ? (
          <div className="table-empty">
            <strong>Belum ada siswa pada rute ini</strong>
            <p>
              Admin Pusat belum menempatkan siswa pada titik rute ini. Jangan mencatat siswa yang tidak terdaftar.
            </p>
          </div>
        ) : (
          <StudentList
            rows={studentRows}
            tripId={trip?.id ?? null}
            assignmentId={selected.id}
            direction={direction}
            tripStatus={tripStatus}
            arrived={Boolean(trip?.arrived_at)}
          />
        )}

          <details className="ops-review">
            <summary>
              <span>
                <Icon name="report" size={15} /> Catatan &amp; review tugas
              </span>
              <small>{issueNotes.length > 0 ? `${issueNotes.length} kendala tercatat` : "Belum ada kendala"}</small>
            </summary>
            <div className="ops-review-body">
              {trip?.safety_check_notes && (
                <p>
                  <strong>Catatan pemeriksaan:</strong> {trip.safety_check_notes}
                </p>
              )}
              {issueNotes.length > 0 ? (
                <ul>
                  {issueNotes.map((row) => (
                    <li key={row.key}>
                      <strong>{row.name}</strong> — {row.issueNote}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Belum ada catatan kendala pada perjalanan ini.</p>
              )}
              <p className="ops-review-meta">
                {formatDate(selected.service_date)} · {routeDirectionLabel(direction)} · Bus{" "}
                {selected.buses?.fleet_code ?? "—"}
                {trip?.started_at ? ` · Mulai ${formatTime(trip.started_at)}` : ""}
                {trip?.completed_at ? ` · Selesai ${formatDateTime(trip.completed_at)}` : ""}
              </p>
              <Link className="ops-review-link" href="/pengemudi/riwayat">
                Riwayat perjalanan <Icon name="arrowRight" size={13} />
              </Link>
            </div>
          </details>
        </section>
      </div>

      <DriverBroadcastPanel
        key={trip?.id ?? "no-trip"}
        tripStatus={trip?.status ?? "scheduled"}
        tripId={cameraPublishingEnabled ? trip?.id : undefined}
        enabled={cameraEnabled}
      />

      <details className="ops-side-notes">
        <summary>Catatan navigasi, GPS, dan kamera</summary>
        <p>
          Navigasi membuka satu rute berisi titik yang tersimpan. Posisi bus belum dilacak karena GPS belum aktif.
          Siaran kamera mengikuti status perjalanan pada panel kamera, dan kembali dari aplikasi peta tidak mengubah
          status siswa atau menyelesaikan titik pemberhentian.
        </p>
      </details>
    </div>
  );
}
