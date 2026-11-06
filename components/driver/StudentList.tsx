import { Pill } from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";
import { ABSENCE_REASONS, studentActionSet } from "@/lib/driver/student-actions";
import { tripEventLabel } from "@/lib/validation";
import { recordStudentEvent } from "@/app/pengemudi/actions";

export type StudentListRow = {
  key: string;
  studentId: string;
  name: string;
  admissionsNumber: string | null;
  stopOrder: number;
  stopName: string;
  address: string | null;
  /** Status kehadiran terakhir (boarded/dropped_off/absent). */
  status: string | null;
  issueNote: string | null;
};

function statusTone(status: string | null) {
  if (status === "boarded") return "success" as const;
  if (status === "dropped_off") return "info" as const;
  if (status === "absent") return "warning" as const;
  if (status === "issue") return "danger" as const;
  return "neutral" as const;
}

/**
 * Daftar siswa pada halaman operasional, mengikuti urutan rute yang terkunci.
 * Hanya tindakan yang relevan dengan tahap perjalanan yang ditampilkan.
 */
export function StudentList({
  rows,
  tripId,
  assignmentId,
  direction,
  tripStatus,
  arrived,
}: {
  rows: StudentListRow[];
  tripId: string | null;
  assignmentId: string;
  direction: string;
  tripStatus: string;
  arrived: boolean;
}) {
  return (
    <ol className="ops-students">
      {rows.map((row, index) => {
        const actions = studentActionSet({ direction, status: row.status, tripStatus, arrived });
        const actionHint =
          actions.hint ??
          (!actions.canDrop
            ? direction === "afternoon"
              ? "Turun di titik aktif setelah siswa tercatat naik."
              : "Turun di sekolah aktif setelah siswa tercatat naik dan kedatangan dikonfirmasi."
            : null);

        return (
          <li className="ops-student" key={row.key} id={`siswa-${row.studentId}`}>
            <span className="ops-student-num" aria-label={`Urutan ${index + 1}`}>
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="ops-student-main">
              <div className="ops-student-title">
                <strong>{row.name}</strong>
                <Pill tone={statusTone(row.status)}>{row.status ? tripEventLabel(row.status) : "Belum dicatat"}</Pill>
              </div>
              <small className="ops-student-addr">
                <Icon name="pin" size={12} />
                {row.stopOrder}. {row.stopName}
                {row.admissionsNumber ? ` · ${row.admissionsNumber}` : ""}
              </small>
              {row.address && (
                <small className="ops-student-addr">
                  <Icon name="home" size={12} /> {row.address} <span className="ops-data-note">data induk</span>
                </small>
              )}
              {row.issueNote && (
                <p className="ops-student-issue">
                  <Icon name="alert" size={12} /> {row.issueNote}
                </p>
              )}
            </div>

            <div className="ops-student-actions">
              {actions.canBoard && tripId ? (
                <form action={recordStudentEvent}>
                  <input type="hidden" name="trip_id" value={tripId} />
                  <input type="hidden" name="assignment_id" value={assignmentId} />
                  <input type="hidden" name="student_id" value={row.studentId} />
                  <button className="ops-action board" type="submit" name="event_type" value="boarded">
                    <Icon name="check" size={15} /> Naik
                  </button>
                </form>
              ) : (
                <button className="ops-action board" type="button" disabled title={actionHint ?? undefined}>
                  <Icon name="check" size={15} /> Naik
                </button>
              )}

              {actions.canDrop && tripId ? (
                <form action={recordStudentEvent}>
                  <input type="hidden" name="trip_id" value={tripId} />
                  <input type="hidden" name="assignment_id" value={assignmentId} />
                  <input type="hidden" name="student_id" value={row.studentId} />
                  <button className="ops-action drop" type="submit" name="event_type" value="dropped_off">
                    <Icon name="arrowRight" size={15} /> {actions.dropLabel}
                  </button>
                </form>
              ) : (
                <button className="ops-action drop" type="button" disabled title={actionHint ?? undefined}>
                  <Icon name="arrowRight" size={15} /> {actions.dropLabel}
                </button>
              )}

              {actions.canAbsent && tripId ? (
                <details className="ops-absent">
                  <summary>Tidak ikut</summary>
                  <div className="ops-absent-menu">
                    <form action={recordStudentEvent}>
                      <input type="hidden" name="trip_id" value={tripId} />
                      <input type="hidden" name="assignment_id" value={assignmentId} />
                      <input type="hidden" name="student_id" value={row.studentId} />
                      <input type="hidden" name="event_type" value="absent" />
                      {ABSENCE_REASONS.map((reason) => (
                        <button key={reason.label} className="ops-action absent" type="submit" name="notes" value={reason.notes}>
                          {reason.label}
                        </button>
                      ))}
                    </form>
                    <small>Dicatat sebagai tidak ikut bus, dengan alasan tersimpan pada catatan.</small>
                  </div>
                </details>
              ) : (
                <button className="ops-action absent" type="button" disabled title={actionHint ?? undefined}>
                  Tidak ikut
                </button>
              )}

              {tripStatus === "in_progress" && tripId ? (
                <details className="ops-issue">
                  <summary>Catat kendala</summary>
                  <form className="ops-issue-form" action={recordStudentEvent}>
                    <input type="hidden" name="trip_id" value={tripId} />
                    <input type="hidden" name="assignment_id" value={assignmentId} />
                    <input type="hidden" name="student_id" value={row.studentId} />
                    <input type="hidden" name="event_type" value="issue" />
                    <textarea
                      name="notes"
                      rows={2}
                      minLength={5}
                      maxLength={300}
                      required
                      placeholder="Contoh: siswa tidak ada di titik jemput, orang tua memberi kabar."
                    />
                    <button className="btn btn-secondary btn-sm" type="submit">
                      Simpan kendala
                    </button>
                  </form>
                </details>
              ) : (
                <button className="ops-action" type="button" disabled title={actionHint ?? undefined}>
                  Catat kendala
                </button>
              )}

              {(actionHint || !actions.canBoard || !actions.canDrop || !actions.canAbsent) && (
                <p className="ops-student-hint">
                  {actionHint ?? "Tombol yang tidak aktif belum sesuai dengan status atau tahap siswa saat ini."}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
