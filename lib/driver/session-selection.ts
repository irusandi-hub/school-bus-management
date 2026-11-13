/** Active sessions win; completed history is never reopened or overwritten. */
export function orderDriverSessions<T extends { status: string; started_at?: string | null; completed_at?: string | null }>(trips: T[]): T[] {
  const rank = (status: string) => status === "in_progress" ? 0 : status === "scheduled" ? 1 : 2;
  return [...trips].sort((a, b) => rank(a.status) - rank(b.status) ||
    (b.started_at ?? b.completed_at ?? "").localeCompare(a.started_at ?? a.completed_at ?? ""));
}
