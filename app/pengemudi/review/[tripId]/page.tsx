import type { Metadata } from "next";
import DriverOperationsPage from "@/app/pengemudi/page";
import { TripReviewModal } from "@/components/driver/TripReviewModal";
import { notFound, redirect } from "next/navigation";
import {
  ConfigNotice,
  EmptyRow,
  Notice,
  PageHeader,
  Pill,
  TripStatusPill,
} from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";
import { noticeFromParams } from "@/lib/admin/query";
import { requireDriver } from "@/lib/auth";
import { SAFETY_CHECKS } from "@/lib/driver/trip-end";
import { resolveStudentTripStates } from "@/lib/driver/trip-progress";
import { createServerSupabase } from "@/lib/supabase/server";
import { formatDate, formatDateTime, formatTime, routeDirectionLabel } from "@/lib/validation";

export const metadata: Metadata = { title: "Ringkasan Perjalanan | Pengemudi" };

type ReviewTrip = {
  id: string;
  assignment_id: string;
  status: string;
  started_at: string | null;
  arrived_at: string | null;
  completed_at: string | null;
  safety_checked_at: string | null;
  safety_check_notes: string | null;
  student_count_confirmed: number | null;
  trip_assignments: {
    service_date: string;
    driver_id: string;
    routes: { route_name: string; school_name: string; direction: string } | null;
    buses: { fleet_code: string; plate_number: string | null } | null;
  } | null;
};

type ReviewEvent = {
  student_id: string;
  event_type: string;
  occurred_at: string;
  notes: string | null;
  students: { full_name: string; admissions_number: string | null } | null;
};

const EVENT_LABELS: Record<string, string> = {
  boarded: "Naik",
  dropped_off: "Turun",
  absent: "Tidak Ikut",
};

function statusTone(status: string | null) {
  if (status === "boarded") return "success" as const;
  if (status === "dropped_off") return "info" as const;
  if (status === "absent") return "warning" as const;
  return "neutral" as const;
}

/**
 * Review hanya membaca perjalanan yang benar-benar selesai dan milik pengemudi
 * yang sedang masuk. Tidak ada fallback ke data contoh atau perjalanan lain.
 */
export default async function DriverTripReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { tripId } = await params;
  const query = await searchParams;
  const access = await requireDriver(`/pengemudi/review/${encodeURIComponent(tripId)}`);
  if (access.status === "unconfigured") return <ConfigNotice />;

  const supabase = await createServerSupabase();
  if (!supabase) return <ConfigNotice />;

  const { data: tripData, error: tripError } = await supabase
    .from("trips")
    .select(
      "id, assignment_id, status, started_at, arrived_at, completed_at, safety_checked_at, safety_check_notes, student_count_confirmed, trip_assignments(service_date, driver_id, routes(route_name, school_name, direction), buses(fleet_code, plate_number))",
    )
    .eq("id", tripId)
    .maybeSingle();

  const trip = tripData as unknown as ReviewTrip | null;

  if (tripError) {
    return (
      <>
        <DriverOperationsPage searchParams={Promise.resolve({})} />
        <TripReviewModal>
        <PageHeader
          title="Ringkasan perjalanan"
          description="Ringkasan tugas yang sudah selesai dan tersimpan."
        />
        <Notice kind="error">Ringkasan perjalanan belum dapat dimuat. Coba lagi.</Notice>
        </TripReviewModal>
      </>
    );
  }

  // Jangan membuka perjalanan pengemudi lain atau perjalanan yang belum selesai.
  if (!trip || trip.trip_assignments?.driver_id !== access.driver.id) notFound();
  if (trip.status !== "completed") redirect(`/pengemudi?tugas=${encodeURIComponent(trip.assignment_id)}`);

  const { data: eventData, error: eventsError } = await supabase
    .from("trip_student_events")
    .select("student_id, event_type, occurred_at, notes, students(full_name, admissions_number)")
    .eq("trip_id", trip.id)
    .order("occurred_at", { ascending: true });

  const events = (eventData ?? []) as unknown as ReviewEvent[];
  const states = resolveStudentTripStates(
    events.map((event) => ({
      student_id: event.student_id,
      event_type: event.event_type,
      occurred_at: event.occurred_at,
      notes: event.notes,
    })),
  );
  const names = new Map(
    events.map((event) => [
      event.student_id,
      {
        name: event.students?.full_name ?? "Siswa",
        admissionsNumber: event.students?.admissions_number ?? null,
      },
    ]),
  );
  const students = [...states.entries()]
    .map(([studentId, state]) => ({
      id: studentId,
      ...names.get(studentId),
      ...state,
    }))
    .sort((left, right) => (left.name ?? "").localeCompare(right.name ?? ""));

  const notice = noticeFromParams(query);
  const assignment = trip.trip_assignments;
  const direction = assignment?.routes?.direction ?? "";
  const safetyRecorded = Boolean(trip.safety_checked_at);
  const belongingsAcknowledged = Boolean(
    trip.safety_check_notes?.includes(
      "Barang yang diketahui tertinggal di dalam bus diamankan; ketentuan tanggung jawab pengemudi telah dikonfirmasi.",
    ),
  );

  return (
    <>
      <DriverOperationsPage searchParams={Promise.resolve({})} />
      <TripReviewModal>
      <PageHeader
        title="Ringkasan perjalanan"
        description="Ringkasan tugas yang sudah selesai. Data diambil dari perjalanan dan catatan yang tersimpan."
      />

      {notice && <Notice kind={notice.kind}>{notice.message}</Notice>}

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">{assignment?.routes?.route_name ?? "Rute"}</h2>
            <div className="panel-subtitle">
              {routeDirectionLabel(direction)} · {formatDate(assignment?.service_date ?? trip.completed_at)} ·{" "}
              {assignment?.routes?.school_name ?? "Sekolah belum tercatat"}
            </div>
          </div>
          <TripStatusPill status={trip.status} />
        </header>
        <div className="ops-review-body">
          <dl className="task-times">
            <div>
              <dt>Mulai</dt>
              <dd>{formatTime(trip.started_at)}</dd>
            </div>
            <div>
              <dt>Tiba di sekolah</dt>
              <dd>{formatTime(trip.arrived_at)}</dd>
            </div>
            <div>
              <dt>Selesai</dt>
              <dd>{formatTime(trip.completed_at)}</dd>
            </div>
          </dl>
          <p className="ops-review-meta">
            Bus {assignment?.buses?.fleet_code ?? "—"}
            {assignment?.buses?.plate_number ? ` · ${assignment.buses.plate_number}` : ""}
            {trip.completed_at ? ` · Ditutup ${formatDateTime(trip.completed_at)}` : ""}
          </p>
        </div>
      </section>

      <div className="content-grid">
        <section className="panel" aria-label="Status siswa pada perjalanan ini">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Status siswa</h2>
              <div className="panel-subtitle">Status terakhir yang tercatat pada perjalanan ini</div>
            </div>
            <Pill tone={students.length > 0 ? "info" : "warning"}>{students.length} siswa</Pill>
          </header>

          {eventsError ? (
            <div className="table-empty">
              <strong>Status siswa belum dapat dimuat</strong>
              <p>Coba lagi.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table table-stack">
                <thead>
                  <tr>
                    <th scope="col">Siswa</th>
                    <th scope="col">Status</th>
                    <th scope="col">Waktu</th>
                    <th scope="col">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <EmptyRow
                      colSpan={4}
                      title="Belum ada catatan siswa"
                      detail="Tidak ada status siswa yang tersimpan pada perjalanan ini."
                    />
                  ) : (
                    students.map((student) => (
                      <tr key={student.id}>
                        <td data-label="Siswa">
                          <strong>{student.name ?? "Siswa"}</strong>
                          <small>{student.admissionsNumber ? `No. ${student.admissionsNumber}` : "Tanpa nomor siswa"}</small>
                        </td>
                        <td data-label="Status">
                          <Pill tone={statusTone(student.status)}>
                            {student.status ? (EVENT_LABELS[student.status] ?? student.status) : "Belum tercatat"}
                          </Pill>
                        </td>
                        <td data-label="Waktu">{student.statusAt ? formatTime(student.statusAt) : "—"}</td>
                        <td data-label="Catatan">
                          {student.issueNote ?? student.statusNotes ?? <span className="ops-review-meta">—</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel" aria-label="Pemeriksaan keselamatan">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Pemeriksaan keselamatan</h2>
              <div className="panel-subtitle">Dicatat saat perjalanan ditutup</div>
            </div>
            <Pill tone={safetyRecorded ? "success" : "warning"}>
              {safetyRecorded ? "Tercatat" : "Tidak tercatat"}
            </Pill>
          </header>
          <div className="ops-review-body">
            <ul className="safety-checks">
              {SAFETY_CHECKS.map((check) => {
                const confirmed = check.required ? safetyRecorded : belongingsAcknowledged;
                return (
                  <li className="safety-check" key={check.name}>
                    <Icon name={confirmed ? "check" : "clock"} size={16} />
                    <span>{check.label} <small>{check.required ? "Wajib" : "Opsional"}</small></span>
                  </li>
                );
              })}
            </ul>
            <p className="ops-review-meta">
              {safetyRecorded
                ? `Checklist dikonfirmasi sebelum penutupan pukul ${formatTime(trip.safety_checked_at)}.`
                : "Perjalanan ini tidak memiliki waktu pencatatan pemeriksaan keselamatan."}
              {typeof trip.student_count_confirmed === "number"
                ? ` Jumlah siswa dikonfirmasi: ${trip.student_count_confirmed}.`
                : ""}
            </p>
            {trip.safety_check_notes && (
              <p>
                <strong>Catatan pemeriksaan:</strong> {trip.safety_check_notes}
              </p>
            )}
          </div>
        </section>
      </div>

      </TripReviewModal>
    </>
  );
}
