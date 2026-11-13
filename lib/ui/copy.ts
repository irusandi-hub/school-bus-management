/** Canonical copy for identical UI conditions. See docs/UI_COPY_STANDARD.md. */
export const UI_COPY = {
  loadFailed: "Data belum dapat dimuat. Coba lagi.",
  retry: "Coba lagi",
  tripNotStarted: "Perjalanan belum dimulai.",
  tripCompleted: "Perjalanan telah selesai.",
  tripCancelled: "Perjalanan dibatalkan.",
  allPickedUp: "Semua siswa telah dijemput.",
  allDroppedOff: "Semua siswa telah diantar.",
  noStudents: "Belum ada siswa pada rute ini.",
} as const;

export function nextPickupMessage(status: string, hasStudents: boolean, direction: string): string | null {
  if (status === "completed") return UI_COPY.tripCompleted;
  if (status === "cancelled") return UI_COPY.tripCancelled;
  if (status !== "in_progress") return UI_COPY.tripNotStarted;
  if (!hasStudents) return UI_COPY.noStudents;
  return direction === "afternoon" ? UI_COPY.allDroppedOff : UI_COPY.allPickedUp;
}
