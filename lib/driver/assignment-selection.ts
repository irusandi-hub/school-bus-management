/**
 * Memilih tugas untuk dashboard Pengemudi.
 *
 * Tugas yang selesai tidak diprioritaskan selama masih ada tugas berjalan
 * atau terjadwal. Jika semua tugas hari ini selesai, tugas terakhir tetap
 * dipilih dalam mode baca-saja agar dashboard utama tetap tampil setelah review.
 */
export type DriverAssignmentLike = {
  id: string;
  trips?: { status?: string | null }[] | null;
};

export function isCompletedAssignment(assignment: DriverAssignmentLike): boolean {
  return assignment.trips?.[0]?.status === "completed";
}

export function selectDriverAssignment<T extends DriverAssignmentLike>(
  assignments: T[],
  requestedId?: string | null,
): T | null {
  const selectable = assignments.filter((assignment) => !isCompletedAssignment(assignment));
  const requested = requestedId ? selectable.find((assignment) => assignment.id === requestedId) : undefined;

  return (
    requested ??
    selectable.find((assignment) => assignment.trips?.[0]?.status === "in_progress") ??
    selectable.find((assignment) => assignment.trips?.[0]?.status === "scheduled") ??
    selectable[0] ??
    assignments.find(isCompletedAssignment) ??
    null
  );
}
