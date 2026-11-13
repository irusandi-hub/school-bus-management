"use client";

import { useActionState, useEffect, useState, type ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { Pill } from "@/components/admin/ui";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";
import { Icon } from "@/components/ui/Icon";
import { recordStudentEventState } from "@/app/pengemudi/actions";
import { studentActionSet } from "@/lib/driver/student-actions";
import { idleState, tripEventLabel, type ActionState } from "@/lib/validation";

type StudentEventState = ActionState & {
  eventType?: string;
  notes?: string | null;
};

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
  const { t, locale } = useLocale();
  const copy = (value: string) => translateAdminCopy(value, locale) ?? value;
  return (
    <button
      {...rest}
      className={`ops-action ${kind}${done ? " is-done" : ""}`}
      aria-pressed={done}
      data-done={done ? "true" : undefined}
    >
      {done ? <Icon name="check" size={15} /> : icon ? <Icon name={icon} size={15} /> : null}
      {pending ? t("saving") : done ? doneLabel : label}
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
  const { t } = useLocale();
  const [status, setStatus] = useState<string | null>(initialStatus);
  const [issueNote, setIssueNote] = useState<string | null>(initialIssueNote);
  const [state, formAction, pending] = useActionState<StudentEventState, FormData>(
    recordStudentEventState,
    idleState,
  );

  useEffect(() => {
    if (state.status !== "success" || !state.eventType) return;
    window.dispatchEvent(new Event("schoolbus:student-saved"));
    if (state.eventType === "issue") {
      setIssueNote(state.notes ?? t("issueRecorded"));
      return;
    }
    setStatus(state.eventType);
  }, [state, t]);

  const actions = studentActionSet({ direction, status, tripStatus, arrived });
  const rawActionHint = actions.hint ?? (!actions.canDrop ? "Turun setelah siswa tercatat naik." : null);
  const actionHint = rawActionHint ? ({
    "Perjalanan sudah selesai; status akhir tidak dapat diubah.": t("completedTrip"),
    "Mulai perjalanan untuk mencatat status siswa.": t("startTripFirst"),
    "Tekan Naik jika siswa ikut kembali.": t("boardIfReturned"),
    "Siswa sudah turun.": t("alreadyDropped"),
    "Catat naik saat siswa masuk bus di sekolah.": t("boardAtSchool"),
    "Turun setelah siswa tercatat naik.": t("boardIfReturned"),
  } as Record<string, string>)[rawActionHint] ?? rawActionHint : null;

  const hidden = (
    <>
      <input type="hidden" name="trip_id" value={tripId ?? ""} />
      <input type="hidden" name="assignment_id" value={assignmentId} />
      <input type="hidden" name="student_id" value={studentId} />
    </>
  );

  return (
    <div className="ops-student-actions" aria-busy={pending}>
      {actions.canBoard && tripId ? (
        <form action={formAction}>
          {hidden}
          <SubmitAction
            kind="board"
            label={t("board")}
            doneLabel={t("boardDone")}
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
          label={t("board")}
          doneLabel={t("boardDone")}
          done={status === "boarded"}
          type="button"
          disabled
          title={actionHint ?? undefined}
        />
      )}

      {actions.canAbsent && tripId ? (
        <form action={formAction}>
          {hidden}
          <SubmitAction kind="absent" label={t("absent")} doneLabel={t("absentDone")}
            done={false} type="submit" name="event_type" value="absent" disabled={pending} />
        </form>
      ) : (
        <ActionButton
          kind="absent"
          label={t("absent")}
          doneLabel={t("absentDone")}
          done={status === "absent"}
          type="button"
          disabled
          title={actionHint ?? undefined}
        />
      )}

      <div className="ops-student-state" aria-live="polite">
        <Pill tone={statusTone(status)}>{status === "boarded" ? t("board") : status === "dropped_off" ? t("droppedOff") : status === "absent" ? t("absent") : status ? copy(tripEventLabel(status)) : t("unrecorded")}</Pill>
        {pending && <span className="ops-action-pending">{t("saving")}</span>}
      </div>

      {actions.canDrop && tripId ? (
        <form action={formAction}>
          {hidden}
          <SubmitAction
            kind="drop"
            label={t("drop")}
            doneLabel={t("dropDone")}
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
          label={t("drop")}
          doneLabel={t("dropDone")}
          done={status === "dropped_off"}
          icon="arrowRight"
          type="button"
          disabled
          title={actionHint ?? undefined}
        />
      )}

      {tripStatus === "in_progress" && tripId ? (
        <details className="ops-issue">
          <summary>{t("recordIssue")}</summary>
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
              placeholder={t("issuePlaceholder")}
            />
            <button className="btn btn-secondary btn-sm" type="submit" disabled={pending}>
              {pending ? t("saving") : t("saveIssue")}
            </button>
          </form>
        </details>
      ) : (
        <span className="ops-issue-disabled" aria-disabled="true" title={actionHint ?? undefined}>
          Catat kendala
        </span>
      )}

      {state.status === "error" && (
        <p className="ops-student-error" role="alert">
          {copy(state.message)}
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
          {actionHint ?? t("issueHint")}
        </p>
      )}
    </div>
  );
}
