/**
 * Aturan penjadwalan operator: satu pengemudi dan satu bus hanya boleh menerima
 * satu penugasan pada tanggal layanan yang sama. Aturan ini dipakai Server Action
 * sebelum menyimpan, dan RLS tetap menjadi lapisan penegak terakhir di database.
 */

export type AssignmentRow = {
  id?: string;
  driver_id: string;
  bus_id: string;
  service_date: string;
};

export type AssignmentConflict = "driver" | "bus" | null;

export function assignmentConflict(input: {
  driverId: string;
  busId: string;
  serviceDate: string;
  existing: AssignmentRow[];
}): AssignmentConflict {
  const sameDate = input.existing.filter((row) => row.service_date === input.serviceDate);

  if (sameDate.some((row) => row.driver_id === input.driverId)) return "driver";
  if (sameDate.some((row) => row.bus_id === input.busId)) return "bus";
  return null;
}

export const ASSIGNMENT_CONFLICT_MESSAGES: Record<Exclude<AssignmentConflict, null>, string> = {
  driver: "Pengemudi sudah memiliki penugasan pada tanggal tersebut. Pilih pengemudi lain atau tanggal lain.",
  bus: "Bus sudah digunakan pada tanggal tersebut. Pilih bus lain atau tanggal lain.",
};
