"use client";

import { useActionState, useEffect, useState, type ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { Pill } from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";
import { recordStudentEventState } from "@/app/pengemudi/actions";
import { ABSENCE_REASONS, studentActionSet } from "@/lib/driver/student-actions";
import { idleState, tripEventLabel, type ActionState } from "@/lib/validation";

type StudentEventState = ActionState & {
  eventType?: string;
  notes?: string | null;
};

const DONE_LABEL = {
  boarded: "Naik — selesai",
  dropped_off: "Turun — selesai",
  absent: "Tidak Ikut — selesai",
} as const;

type ActionKind = "board" | "drop" | "absent";

type ActionButtonProps = {
  kind: ActionKind;
  label: string;
  doneLabel: string;
  done: boolean;
  icon?: "check" | "arrowRight";
  pending?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/** Tombol tindakan yang sama, dengan penanda selesai tanpa mengubah ukurannya. */
function ActionButton({ kind, label, doneLabel, done, icon, pending = false, className, ...rest }: ActionButtonProps) {
  return (
    <button
      {...rest}
      className={`ops-action ${kind}${done ? " is-done" : ""}`}
      aria-pressed={done}
      data-done={done ? "true" : undefined}
    >
      {done ? <Icon name="check" size={15} /> : icon ? <Icon name={icon} size={15} /> : null}
      {pending ? "Menyimpan…" : done ? doneLabel : label}
    </button>
  );
}

/** Status pending berasal dari form yang benar-benar sedang dikirim. */
function SubmitAction(props: ActionButtonProps) {
  const { pending } = useFormStatus();
  return <ActionButton {...props} pending={pending} />;
}

function statusTone(status: string | null) {
  if (status === "boarded") return "success" as const;
  if (status === "dropped_off") return "info" as const;
  if (status === "absent") return "warning" as const;
  if (status === "issue") return "danger" as const;
  return "neutral" as const;
}

/**
 * Passenger status controls with a per-form pending state, an inline error and
 * a completed marker on the button that was saved. The server action is still
 * the authority and appends every accepted change to trip_student_events; the
 * local status is only set from a successful response or the persisted row.
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
          <SubmitAction
            kind="board"
            label="Naik"
            doneLabel={DONE_LABEL.boarded}
            done={status === "boarded"}
            type="submit"
            name="event_type"
            value="boarded"
            disabled={pending}
          />
        </form>
      ) : (
        <ActionButton
          kind="board"
          label="Naik"
          doneLabel={DONE_LABEL.boarded}
          done={status === "boarded"}
          type="button"
          disabled
          title={actionHint ?? undefined}
        />
      )}

      {actions.canDrop && tripId ? (
        <form action={formAction}>
          {hidden}
          <SubmitAction
            kind="drop"
            label={actions.dropLabel}
            doneLabel={DONE_LABEL.dropped_off}
            done={status === "dropped_off"}
            icon="arrowRight"
            type="submit"
            name="event_type"
            value="dropped_off"
            disabled={pending}
          />
        </form>
      ) : (
        <ActionButton
          kind="drop"
          label={actions.dropLabel}
          doneLabel={DONE_LABEL.dropped_off}
          done={status === "dropped_off"}
          icon="arrowRight"
          type="button"
          disabled
          title={actionHint ?? undefined}
        />
      )}

      {actions.canAbsent && tripId ? (
        status === "boarded" ? (
          <form action={formAction}>
            {hidden}
            <input type="hidden" name="event_type" value="absent" />
            <input
              type="hidden"
              name="notes"
              value="Keikutsertaan dibatalkan setelah siswa naik, sebelum perjalanan tiba."
            />
            <SubmitAction
              kind="absent"
              label="Tidak Ikut"
              doneLabel={DONE_LABEL.absent}
              done={false}
              type="submit"
              disabled={pending}
            />
          </form>
        ) : (
          <details className="ops-absent">
            <summary>Tidak Ikut</summary>
            <div className="ops-absent-menu">
              {ABSENCE_REASONS.map((reason) => (
                <form action={formAction} key={reason.label}>
                  {hidden}
                  <input type="hidden" name="event_type" value="absent" />
                  <SubmitAction
                    kind="absent"
                    label={reason.label}
                    doneLabel={DONE_LABEL.absent}
                    done={status === "absent"}
                    type="submit"
                    name="notes"
                    value={reason.notes}
                    disabled={pending}
                  />
                </form>
              ))}
              <small>Dicatat sebagai tidak ikut bus, dengan alasan tersimpan pada catatan.</small>
            </div>
          </details>
        )
      ) : (
        <ActionButton
          kind="absent"
          label="Tidak Ikut"
          doneLabel={DONE_LABEL.absent}
          done={status === "absent"}
          type="button"
          disabled
          title={actionHint ?? undefined}
        />
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
