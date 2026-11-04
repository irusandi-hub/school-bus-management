import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { Breadcrumbs, ConfigNotice, Notice, Pill, TripStatusPill } from "@/components/admin/ui";
import { NavigationDestinationCard } from "@/components/driver/NavigationDestinationCard";
import { NavigationStopList } from "@/components/driver/NavigationStopList";
import { firstParam, noticeFromParams } from "@/lib/admin/query";
import { requireDriver } from "@/lib/auth";
import { buildNavigationPlan } from "@/lib/driver/navigation";
import { SAFETY_CHECKS } from "@/lib/driver/trip-end";
import { createServerSupabase } from "@/lib/supabase/server";
import type { RouteStopRow, TripEventRow } from "@/lib/types";
import {
  formatDate,
  formatTime,
  routeDirectionLabel,
  tripEventLabel,
} from "@/lib/validation";
import { confirmArrival, endTrip, recordStudentEvent, startTrip } from "../../actions";

export const metadata: Metadata = { title: "Detail Tugas | Pengemudi" };

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

function eventTone(type: string | undefined) {
  if (type === "boarded") return "success" as const;
  if (type === "dropped_off") return "info" as const;
  if (type === "absent") return "warning" as const;
  if (type === "issue") return "danger" as const;
  return "neutral" as const;
}

export default async function DriverTaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const access = await requireDriver();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const supabase = await createServerSupabase();
  if (!supabase) return <ConfigNotice />;

  // Ownership is part of the query, not only of the RLS policy.
  const { data: assignmentData } = await supabase
    .from("trip_assignments")
    .select(
      "id, service_date, routes(id, route_name, school_name, direction), buses(fleet_code, plate_number, capacity), trips(id, status, started_at, arrived_at, completed_at, safety_checked_at, student_count_confirmed)",
    )
    .eq("id", id)
    .eq("driver_id", access.driver.id)
    .maybeSingle();

  const assignment = assignmentData as unknown as {
    id: string;
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
      student_count_confirmed?: number | null;
    }[];
  } | null;

  if (!assignment) notFound();

  const routeId = assignment.routes?.id ?? "";
  const direction = assignment.routes?.direction ?? "morning";
  const trip = assignment.trips?.[0] ?? null;
  const notice = noticeFromParams(query);

  const [stopsResult, rosterResult, eventsResult] = await Promise.all([
    supabase
      .from("route_stops")
      .select("id, route_id, stop_order, stop_name, latitude, longitude, is_school")
      .eq("route_id", routeId)
      .order("stop_order", { ascending: true }),
    supabase
      .from("student_route_stops")
      .select(
        "id, student_id, stop_id, direction, route_stops(stop_name, stop_order), students(full_name, admissions_number, home_address, pickup_notes)",
      )
      .eq("route_id", routeId)
      .eq("direction", direction)
      .eq("active", true),
    trip
      ? supabase
          .from("trip_student_events")
          .select("id, trip_id, student_id, event_type, occurred_at, notes")
          .eq("trip_id", trip.id)
          .order("occurred_at", { ascending: false })
      : Promise.resolve({ data: [] as TripEventRow[], error: null }),
  ]);

  const stops = (stopsResult.data ?? []) as unknown as RouteStopRow[];
  const roster = ((rosterResult.data ?? []) as unknown as RosterEntry[]).sort(
    (a, b) => (a.route_stops?.stop_order ?? 0) - (b.route_stops?.stop_order ?? 0),
  );
  const events = (eventsResult.data ?? []) as unknown as TripEventRow[];

  const latestEvent = new Map<string, TripEventRow>();
  for (const event of events) {
    if (!latestEvent.has(event.student_id)) latestEvent.set(event.student_id, event);
  }

  const navigationPlan = buildNavigationPlan({
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

  const inProgress = trip?.status === "in_progress";
  const completed = trip?.status === "completed";
  // Perjalanan terjadwal yang belum dimulai tetap harus bisa dijalankan pengemudi.
  const canStart = !trip || trip.status === "scheduled";

  // Siswa yang belum punya catatan apa pun pada perjalanan ini.
  const unrecorded = roster.filter((entry) => !latestEvent.has(entry.student_id));
  const recorded = roster.length - unrecorded.length;
  const canEndTrip = Boolean(trip?.arrived_at) && unrecorded.length === 0 && !rosterResult.error && !eventsResult.error;

  // Students whose status is unclear for closing the trip (not dropped off/absent).
  const unclearStudents = roster.filter((entry) => {
    const status = latestEvent.get(entry.student_id)?.event_type;
    return !status || status === "boarded";
  }).length;

  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/pengemudi", label: "Tugas hari ini" },
          { label: assignment.routes?.route_name ?? "Detail tugas" },
        ]}
      />

      <section className="task-head">
        <div>
          <p className="eyebrow">{formatDate(assignment.service_date)} · {routeDirectionLabel(direction)}</p>
          <h1>{assignment.routes?.route_name ?? "Tugas"}</h1>
          <p className="task-sub">
            {assignment.routes?.school_name} · Bus {assignment.buses?.fleet_code ?? "—"}
            {assignment.buses?.plate_number ? ` (${assignment.buses.plate_number})` : ""} ·{" "}
            {assignment.buses?.capacity ?? 0} kursi
          </p>
        </div>
        <TripStatusPill status={trip?.status} />
      </section>

      {notice && <Notice kind={notice.kind}>{notice.message}</Notice>}
      {stopsResult.error && <Notice kind="error">Urutan titik jemput belum dapat dimuat.</Notice>}
      {eventsResult.error && <Notice kind="error">Status siswa belum dapat dimuat.</Notice>}
      {rosterResult.error && <Notice kind="error">Daftar siswa belum dapat dimuat.</Notice>}

      <NavigationDestinationCard plan={navigationPlan} />

      <section className="panel task-actions">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Perjalanan</h2>
            <div className="panel-subtitle">Waktu dicatat otomatis oleh sistem</div>
          </div>
        </header>
        <div className="task-action-body">
          {canStart && (
            <>
              <p>Perjalanan belum dimulai. Mulai hanya setelah bus siap dan penugasan ini benar.</p>
              <form action={startTrip}>
                <input type="hidden" name="assignment_id" value={assignment.id} />
                <ConfirmSubmit
                  className="btn btn-primary btn-lg"
                  message="Mulai perjalanan untuk tugas ini? Waktu mulai akan dicatat."
                  pendingLabel="Memulai…"
                >
                  Mulai perjalanan
                </ConfirmSubmit>
              </form>
            </>
          )}

          {trip && trip.status !== "scheduled" && (
            <dl className="task-times">
              <div>
                <dt>Mulai</dt>
                <dd>{formatTime(trip.started_at)}</dd>
              </div>
              <div>
                <dt>Tiba di sekolah</dt>
                <dd>{trip.arrived_at ? formatTime(trip.arrived_at) : "Belum dikonfirmasi"}</dd>
              </div>
              <div>
                <dt>Selesai</dt>
                <dd>{trip.completed_at ? formatTime(trip.completed_at) : "—"}</dd>
              </div>
            </dl>
          )}

          {inProgress && trip && (
            <div className="task-action-row">
              {!trip.arrived_at && (
                <form action={confirmArrival}>
                  <input type="hidden" name="trip_id" value={trip.id} />
                  <input type="hidden" name="assignment_id" value={assignment.id} />
                  <ConfirmSubmit
                    className="btn btn-secondary"
                    message="Konfirmasi bus sudah tiba di sekolah?"
                    pendingLabel="Menyimpan…"
                  >
                    Konfirmasi tiba di sekolah
                  </ConfirmSubmit>
                </form>
              )}
              <form className="task-end-form" action={endTrip}>
                <input type="hidden" name="trip_id" value={trip.id} />
                <input type="hidden" name="assignment_id" value={assignment.id} />
                {unclearStudents > 0 && (
                  <div className="close-warning">
                    <strong>Masih ada {unclearStudents} siswa berstatus naik atau belum dicatat.</strong>
                    <p>Periksa kabin dan pastikan status setiap siswa benar. Siswa tanpa catatan tetap wajib dicatat terlebih dahulu.</p>
                    <label className="close-check">
                      <input type="checkbox" name="acknowledge_open" value="1" required />
                      <span>Saya sudah memeriksa kabin dan memastikan status siswa tersebut benar.</span>
                    </label>
                  </div>
                )}
                <fieldset className="safety-checks">
                  <legend>Pemeriksaan keselamatan wajib</legend>
                  {SAFETY_CHECKS.map((check) => (
                    <label key={check.name} className="safety-check">
                      <input type="checkbox" name={check.name} required />
                      <span>{check.label}</span>
                    </label>
                  ))}
                  <label className="safety-notes">
                    <span>Catatan pemeriksaan (opsional)</span>
                    <textarea name="safety_notes" rows={2} maxLength={400} placeholder="Contoh: lampu kabin kanan diganti sebelum berangkat." />
                  </label>
                </fieldset>

                {!canEndTrip && (
                  <p className="safety-blocked">
                    {!trip.arrived_at && <span>Konfirmasi kedatangan di sekolah belum dicatat. </span>}
                    {unrecorded.length > 0 && (
                      <span>
                        Catat status {unrecorded.length} siswa berikut sebelum mengakhiri:{" "}
                        {unrecorded.map((entry) => entry.students?.full_name ?? "Siswa").join(", ")}.
                      </span>
                    )}
                  </p>
                )}

                <ConfirmSubmit
                  className="btn btn-primary"
                  message="Akhiri perjalanan ini? Status perjalanan akan menjadi selesai dan tidak dapat dimulai ulang."
                  pendingLabel="Mengakhiri…"
                  disabled={!canEndTrip}
                >
                  Akhiri perjalanan
                </ConfirmSubmit>
              </form>
            </div>
          )}

          {completed && (
            <p className="task-completed">
              Perjalanan sudah selesai pada {formatTime(trip?.completed_at)}. Catatan kehadiran tersimpan sebagai
              riwayat dan tidak dapat diubah lagi.
              {trip?.safety_checked_at && (
                <> Pemeriksaan keselamatan dicatat {formatTime(trip.safety_checked_at)}</>
              )}
              {typeof trip?.student_count_confirmed === "number" && (
                <> untuk {trip.student_count_confirmed} siswa pada rute ini.</>
              )}
            </p>
          )}
        </div>
      </section>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Urutan titik jemput</h2>
            <div className="panel-subtitle">
              {stops.length} titik pada rute ini · status dari catatan kehadiran, bukan GPS
            </div>
          </div>
        </header>
        <NavigationStopList plan={navigationPlan} />
      </section>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Daftar siswa</h2>
            <div className="panel-subtitle">
              {inProgress
                ? "Catat status setiap siswa. Ketuk satu tombol per siswa."
                : completed
                  ? "Status akhir perjalanan"
                  : "Status dapat dicatat setelah perjalanan dimulai"}
            </div>
          </div>
          <Pill tone={roster.length > 0 ? "info" : "warning"}>{roster.length} siswa</Pill>
        </header>

        {roster.length > 0 && (
          <div className="manifest-progress">
            <div className={`progress ${recorded === roster.length ? "done" : ""}`} aria-hidden="true">
              <span style={{ width: `${roster.length === 0 ? 0 : Math.round((recorded / roster.length) * 100)}%` }} />
            </div>
            <span>
              {recorded} dari {roster.length} siswa tercatat
            </span>
          </div>
        )}

        {roster.length === 0 ? (
          <div className="table-empty">
            <strong>Belum ada siswa pada rute ini</strong>
            <p>
              Admin Pusat belum menempatkan siswa pada titik jemput rute ini. Jangan mencatat siswa yang tidak
              terdaftar.
            </p>
          </div>
        ) : (
          <ul className="manifest-list">
            {roster.map((entry) => {
              const latest = latestEvent.get(entry.student_id);
              return (
                <li className="manifest-item" key={entry.id}>
                  <div className="manifest-main">
                    <span className="manifest-avatar" aria-hidden="true">
                      {(entry.students?.full_name ?? "S").slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <strong>{entry.students?.full_name ?? "Siswa"}</strong>
                      <small>
                        {entry.route_stops?.stop_order}. {entry.route_stops?.stop_name} ·{" "}
                        {entry.students?.admissions_number}
                      </small>
                      {entry.students?.pickup_notes && <small className="manifest-note">{entry.students.pickup_notes}</small>}
                    </div>
                    <Pill tone={eventTone(latest?.event_type)}>
                      {latest ? tripEventLabel(latest.event_type) : "Belum dicatat"}
                    </Pill>
                  </div>

                  {latest?.notes && <p className="manifest-issue">Catatan: {latest.notes}</p>}

                  {inProgress && trip && (
                    <>
                      <form className="manifest-actions" action={recordStudentEvent}>
                        <input type="hidden" name="trip_id" value={trip.id} />
                        <input type="hidden" name="assignment_id" value={assignment.id} />
                        <input type="hidden" name="student_id" value={entry.student_id} />
                        <button className="chip chip-board" type="submit" name="event_type" value="boarded">
                          Naik
                        </button>
                        <button className="chip chip-drop" type="submit" name="event_type" value="dropped_off">
                          Turun
                        </button>
                        <button className="chip chip-absent" type="submit" name="event_type" value="absent">
                          Tidak ikut
                        </button>
                      </form>

                      <details className="manifest-details">
                        <summary>Catat kendala</summary>
                        <form className="manifest-actions" action={recordStudentEvent}>
                          <input type="hidden" name="trip_id" value={trip.id} />
                          <input type="hidden" name="assignment_id" value={assignment.id} />
                          <input type="hidden" name="student_id" value={entry.student_id} />
                          <input type="hidden" name="event_type" value="issue" />
                          <textarea
                            name="notes"
                            rows={2}
                            maxLength={300}
                            required
                            placeholder="Contoh: siswa tidak hadir di titik jemput, orang tua memberi kabar."
                          />
                          <button className="btn btn-secondary btn-sm" type="submit">
                            Simpan kendala
                          </button>
                        </form>
                      </details>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Notice kind="info">
        Navigasi membuka aplikasi peta dengan koordinat titik yang tersimpan. Posisi bus belum dilacak karena integrasi
        GPS belum aktif, dan kembali dari aplikasi peta tidak mengubah status siswa atau menyelesaikan titik pemberhentian.
      </Notice>
    </>
  );
}
