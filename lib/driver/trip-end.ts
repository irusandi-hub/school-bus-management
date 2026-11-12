/**
 * Aturan penutupan perjalanan pengemudi.
 *
 * Perjalanan hanya boleh diakhiri setelah:
 * 1. perjalanan memang sedang berjalan,
 * 2. kedatangan di sekolah sudah dikonfirmasi,
 * 3. seluruh siswa aktif pada rute sudah dicatat statusnya, dan
 * 4. konfirmasi kabin kosong wajib; pernyataan barang tertinggal bersifat tambahan.
 *
 * Fungsi ini murni agar aturan yang sama dapat diuji tanpa database.
 */

export const SAFETY_CHECKS = [
  {
    name: "safety_cabin_clear",
    label: "Kabin sudah diperiksa, tidak ada penumpang yang tertinggal di dalam bus.",
    required: true,
  },
  {
    name: "safety_belongings_secured",
    label: "Barang yang diketahui tertinggal di dalam bus akan diamankan, dan bukan tanggung jawab pengemudi jika kehilangan.",
    required: false,
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

/** Events harus diurutkan terbaru lebih dahulu; siswa tanpa status atau masih "boarded" belum aman. */
export function studentsStillOnBus(
  rosterStudentIds: string[],
  latestFirstEvents: { student_id: string; event_type: string }[],
): string[] {
  const latest = new Map<string, string>();
  for (const event of latestFirstEvents) {
    if (!latest.has(event.student_id)) latest.set(event.student_id, event.event_type);
  }
  return rosterStudentIds.filter((id) => !latest.has(id) || latest.get(id) === "boarded");
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

  const unchecked = SAFETY_CHECKS.filter((check) => check.required && !input.confirmations[check.name]);
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
