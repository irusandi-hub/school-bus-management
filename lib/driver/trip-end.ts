/**
 * Aturan penutupan perjalanan pengemudi.
 *
 * Perjalanan hanya boleh diakhiri setelah:
 * 1. perjalanan memang sedang berjalan,
 * 2. kedatangan di sekolah sudah dikonfirmasi,
 * 3. seluruh siswa aktif pada rute sudah dicatat statusnya, dan
 * 4. tiga pemeriksaan keselamatan wajib dikonfirmasi pengemudi.
 *
 * Fungsi ini murni agar aturan yang sama dapat diuji tanpa database.
 */

export const SAFETY_CHECKS = [
  {
    name: "safety_vehicle_ok",
    label: "Kondisi bus diperiksa: rem, pintu, lampu, dan jalur keluar aman.",
  },
  {
    name: "safety_headcount_ok",
    label: "Jumlah siswa di bus sudah dihitung dan cocok dengan catatan kehadiran.",
  },
  {
    name: "safety_no_student_left",
    label: "Tidak ada siswa yang tertinggal di bus maupun di titik jemput.",
  },
] as const;

export type SafetyFieldName = (typeof SAFETY_CHECKS)[number]["name"];

export type TripEndInput = {
  status: string;
  arrivedAt: string | null;
  rosterStudentIds: string[];
  recordedStudentIds: string[];
  confirmations: Record<SafetyFieldName, boolean>;
  notes: string;
};

export type TripEndResult =
  | { ok: true; studentCount: number; notes: string | null }
  | { ok: false; problems: string[]; unrecordedStudentIds: string[] };

export function unrecordedStudents(rosterStudentIds: string[], recordedStudentIds: string[]): string[] {
  const recorded = new Set(recordedStudentIds);
  return rosterStudentIds.filter((id) => !recorded.has(id));
}

export function evaluateTripEnd(input: TripEndInput): TripEndResult {
  const problems: string[] = [];
  const missing = unrecordedStudents(input.rosterStudentIds, input.recordedStudentIds);

  if (input.status !== "in_progress") {
    problems.push("Perjalanan ini belum berjalan atau sudah selesai.");
  }

  if (!input.arrivedAt) {
    problems.push("Konfirmasi kedatangan di sekolah sebelum mengakhiri perjalanan.");
  }

  if (missing.length > 0) {
    problems.push(
      `Masih ada ${missing.length} siswa pada rute ini yang belum dicatat statusnya (naik, tidak ikut, atau turun).`,
    );
  }

  const unchecked = SAFETY_CHECKS.filter((check) => !input.confirmations[check.name]);
  if (unchecked.length > 0) {
    problems.push(
      `Pemeriksaan keselamatan belum lengkap: ${unchecked.map((check) => check.label).join(" ")}`,
    );
  }

  if (problems.length > 0) {
    return { ok: false, problems, unrecordedStudentIds: missing };
  }

  const notes = input.notes.trim();
  return { ok: true, studentCount: input.rosterStudentIds.length, notes: notes.length > 0 ? notes : null };
}
