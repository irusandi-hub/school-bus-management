"use client";

import { useActionState, useEffect, useState } from "react";
import { Pill } from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";
import { recordStudentEventState } from "@/app/pengemudi/actions";
import { ABSENCE_REASONS, studentActionSet } from "@/lib/driver/student-actions";
import { idleState, tripEventLabel, type ActionState } from "@/lib/validation";

type StudentEventState = ActionState & {
  eventType?: string;
  notes?: string | null;
};

function statusTone(status: string | null) {
  if (status === "boarded") return "success" as const;
  if (status === "dropped_off") return "info" as const;
  if (status === "absent") return "warning" as const;
  if (status === "issue") return "danger" as const;
  return "neutral" as const;
}

/**
 * Passenger status controls with an immediate local status, a pending state and
 * an inline error. The server action is still the authority and appends every
 * accepted change to trip_student_events; the optimistic value only mirrors the
 * response for this student and is replaced by the revalidated page afterwards.
 */
export function StudentStatusControls({
  studentId,
  tripId,
  assignmentId,
  direction,
  tripStatus,
  arrived,
  initialStatus,
  initialIssueNote,
}: {
  studentId: string;
  tripId: string | null;
  assignmentId: string;
  direction: string;
  tripStatus: string;
  arrived: boolean;
  initialStatus: string | null;
  initialIssueNote: string | null;
}) {
  const [status, setStatus] = useState<string | null>(initialStatus);
  const [issueNote, setIssueNote] = useState<string | null>(initialIssueNote);
  const [state, formAction, pending] = useActionState<StudentEventState, FormData>(
    recordStudentEventState,
    idleState,
  );

  useEffect(() => {
    if (state.status !== "success" || !state.eventType) return;
    if (state.eventType === "issue") {
      setIssueNote(state.notes ?? "Kendala tercatat.");
      return;
    }
    setStatus(state.eventType);
  }, [state]);

  const actions = studentActionSet({ direction, status, tripStatus, arrived });
  const actionHint =
    actions.hint ??
    (!actions.canDrop
      ? direction === "afternoon"
        ? "Turun di titik aktif setelah siswa tercatat naik."
        : "Turun di sekolah aktif setelah siswa tercatat naik dan kedatangan dikonfirmasi."
      : null);

  const hidden = (
    <>
      <input type="hidden" name="trip_id" value={tripId ?? ""} />
      <input type="hidden" name="assignment_id" value={assignmentId} />
      <input type="hidden" name="student_id" value={studentId} />
    </>
  );

  return (
    <div className="ops-student-actions" aria-busy={pending}>
      <div className="ops-student-state" aria-live="polite">
        <Pill tone={statusTone(status)}>{status ? tripEventLabel(status) : "Belum dicatat"}</Pill>
        {pending && <span className="ops-action-pending">Menyimpan…</span>}
      </div>

      {actions.canBoard && tripId ? (
        <form action={formAction}>
          {hidden}
          <button className="ops-action board" type="submit" name="event_type" value="boarded" disabled={pending}>
            <Icon name="check" size={15} /> Naik
          </button>
        </form>
      ) : (
        <button className="ops-action board" type="button" disabled title={actionHint ?? undefined}>
          <Icon name="check" size={15} /> Naik
        </button>
      )}

      {actions.canDrop && tripId ? (
        <form action={formAction}>
          {hidden}
          <button className="ops-action drop" type="submit" name="event_type" value="dropped_off" disabled={pending}>
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
            {ABSENCE_REASONS.map((reason) => (
              <form action={formAction} key={reason.label}>
                {hidden}
                <input type="hidden" name="event_type" value="absent" />
                <button className="ops-action absent" type="submit" name="notes" value={reason.notes} disabled={pending}>
                  {reason.label}
                </button>
              </form>
            ))}
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
          <form className="ops-issue-form" action={formAction}>
            {hidden}
            <input type="hidden" name="event_type" value="issue" />
            <textarea
              name="notes"
              rows={2}
              minLength={5}
              maxLength={300}
              required
              defaultValue={issueNote ?? ""}
              placeholder="Contoh: siswa tidak ada di titik jemput, orang tua memberi kabar."
            />
            <button className="btn btn-secondary btn-sm" type="submit" disabled={pending}>
              {pending ? "Menyimpan…" : "Simpan kendala"}
            </button>
          </form>
        </details>
      ) : (
        <button className="ops-action" type="button" disabled title={actionHint ?? undefined}>
          Catat kendala
        </button>
      )}

      {state.status === "error" && (
        <p className="ops-student-error" role="alert">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p className="ops-student-success" role="status">
          {state.message}
        </p>
      )}
      {issueNote && <p className="ops-student-issue"><Icon name="alert" size={12} /> {issueNote}</p>}

      {(actionHint || !actions.canBoard || !actions.canDrop || !actions.canAbsent) && (
        <p className="ops-student-hint">
          {actionHint ?? "Tombol yang tidak aktif belum sesuai dengan status atau tahap siswa saat ini."}
        </p>
      )}
    </div>
  );
}
