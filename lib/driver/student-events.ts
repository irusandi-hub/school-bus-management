/**
 * A passenger status change is written at most once per short window. This guards
 * against a double click or a retried Server Action creating duplicate history;
 * a later, intentional change of the same type is still allowed.
 */
export const STUDENT_EVENT_DUPLICATE_WINDOW_MS = 10_000;

export function isDuplicateStudentEvent(
  latest: { event_type: string; occurred_at: string } | null,
  eventType: string,
  now = Date.now(),
  windowMs = STUDENT_EVENT_DUPLICATE_WINDOW_MS,
): boolean {
  if (!latest || latest.event_type !== eventType) return false;
  const occurredAt = new Date(latest.occurred_at).getTime();
  if (!Number.isFinite(occurredAt)) return false;
  return now - occurredAt >= 0 && now - occurredAt < windowMs;
}
