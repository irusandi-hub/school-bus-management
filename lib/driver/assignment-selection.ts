/**
 * Memilih tugas Pengemudi yang masih boleh tampil sebagai perjalanan aktif.
 *
 * Tugas yang perjalanannya sudah selesai tidak pernah dipilih kembali: datanya
 * tetap tersimpan dan hanya ditampilkan lewat halaman riwayat. Tugas berjalan
 * diutamakan, lalu tugas terjadwal, lalu tugas lain yang belum selesai.
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
    null
  );
}
