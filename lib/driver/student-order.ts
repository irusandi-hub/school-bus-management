/**
 * Urutan siswa mengikuti urutan pemberhentian rute yang tersimpan.
 *
 * `stop_order` adalah kunci utama. Dalam satu pemberhentian, nomor induk siswa
 * dipakai sebagai kunci stabil yang tidak bergantung pada urutan hasil query,
 * nama, id database, waktu pendaftaran, atau posisi GPS.
 */

export type RouteOrderedStudent = {
  stopOrder: number;
  admissionsNumber: string | null;
};

export function compareStudentsByRouteOrder(
  left: RouteOrderedStudent,
  right: RouteOrderedStudent,
): number {
  const order = left.stopOrder - right.stopOrder;
  if (order !== 0) return order;

  return (left.admissionsNumber ?? "").localeCompare(right.admissionsNumber ?? "", "en", {
    numeric: true,
    sensitivity: "base",
  });
}

export function orderStudentsByRouteOrder<T extends RouteOrderedStudent>(students: T[]): T[] {
  return [...students].sort(compareStudentsByRouteOrder);
}
