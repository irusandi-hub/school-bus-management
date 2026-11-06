/**
 * Status perjalanan yang ditampilkan kepada wali.
 *
 * Status hanya berasal dari perjalanan dan catatan kehadiran yang tersimpan.
 * Tidak ada kesimpulan dari GPS, estimasi kedatangan, atau posisi bus.
 */

export type JourneyTone = "neutral" | "info" | "success" | "warning" | "danger";

export type JourneyIcon = "route" | "clock" | "bus" | "check" | "alert" | "pin";

export type JourneyStatus = {
  key:
    | "no-trip"
    | "scheduled"
    | "waiting"
    | "on-board"
    | "arrived"
    | "dropped-off"
    | "absent"
    | "completed"
    | "cancelled"
    | "unknown";
  label: string;
  detail: string;
  tone: JourneyTone;
  icon: JourneyIcon;
  updatedAt: string | null;
};

export type JourneyTripInput = {
  status: string;
  direction: string;
  startedAt?: string | null;
  arrivedAt?: string | null;
  completedAt?: string | null;
} | null;

export type JourneyEventInput = {
  event_type: string;
  occurred_at?: string | null;
} | null;

function updatedAt(trip: JourneyTripInput, event: JourneyEventInput) {
  return event?.occurred_at ?? trip?.completedAt ?? trip?.arrivedAt ?? trip?.startedAt ?? null;
}

export function resolveChildJourney(input: {
  trip: JourneyTripInput;
  event: JourneyEventInput;
}): JourneyStatus {
  const { trip, event } = input;
  const update = updatedAt(trip, event);

  if (!trip) {
    return {
      key: "no-trip",
      label: "Belum ada perjalanan",
      detail: "Belum ada penugasan perjalanan untuk hari ini.",
      tone: "neutral",
      icon: "route",
      updatedAt: null,
    };
  }

  if (trip.status === "cancelled") {
    return {
      key: "cancelled",
      label: "Perjalanan dibatalkan",
      detail: "Tidak ada perjalanan aktif untuk anak saat ini. Hubungi operator bila perlu.",
      tone: "danger",
      icon: "alert",
      updatedAt: update,
    };
  }

  if (event?.event_type === "absent") {
    return {
      key: "absent",
      label: "Tidak mengikuti perjalanan",
      detail: "Pengemudi mencatat anak tidak ikut pada perjalanan ini.",
      tone: "warning",
      icon: "alert",
      updatedAt: update,
    };
  }

  if (event?.event_type === "dropped_off") {
    return {
      key: "dropped-off",
      label: "Sudah turun dari bus",
      detail:
        trip.direction === "afternoon"
          ? "Anak sudah turun di rumah."
          : "Anak sudah turun di sekolah.",
      tone: "success",
      icon: "check",
      updatedAt: update,
    };
  }

  if (event?.event_type === "boarded") {
    if (trip.status === "completed" || trip.completedAt) {
      return {
        key: "completed",
        label: "Perjalanan selesai",
        detail: "Anak tercatat naik bus, tetapi catatan turun belum tersedia.",
        tone: "warning",
        icon: "check",
        updatedAt: update,
      };
    }

    if (trip.arrivedAt) {
      return {
        key: "arrived",
        label: "Bus sudah tiba",
        detail: "Anak masih tercatat di bus; catatan turun belum dibuat pengemudi.",
        tone: "warning",
        icon: "pin",
        updatedAt: update,
      };
    }

    if (trip.status === "in_progress") {
      return {
        key: "on-board",
        label: "Berada di dalam bus",
        detail:
          trip.direction === "afternoon"
            ? "Perjalanan menuju rumah sedang berlangsung."
            : "Perjalanan menuju sekolah sedang berlangsung.",
        tone: "info",
        icon: "bus",
        updatedAt: update,
      };
    }

    return {
      key: "unknown",
      label: "Status perlu diperiksa",
      detail: "Catatan naik bus sudah ada, tetapi perjalanan belum tercatat berlangsung.",
      tone: "warning",
      icon: "alert",
      updatedAt: update,
    };
  }

  if (trip.status === "completed") {
    return {
      key: "completed",
      label: "Perjalanan selesai",
      detail: "Kehadiran anak belum dicatat pada perjalanan ini.",
      tone: "warning",
      icon: "check",
      updatedAt: update,
    };
  }

  if (trip.status === "in_progress") {
    return {
      key: "waiting",
      label: "Belum dijemput",
      detail: "Perjalanan sudah berjalan, tetapi anak belum dicatat naik bus.",
      tone: "warning",
      icon: "clock",
      updatedAt: update,
    };
  }

  if (trip.status === "scheduled") {
    return {
      key: "scheduled",
      label: "Belum dijemput",
      detail: "Perjalanan belum dimulai. Status berubah setelah pengemudi memulai tugas.",
      tone: "neutral",
      icon: "clock",
      updatedAt: update,
    };
  }

  if (trip.status === "delayed") {
    return {
      key: "waiting",
      label: "Perjalanan tertunda",
      detail: "Perjalanan belum berjalan sesuai jadwal. Hubungi operator bila perlu.",
      tone: "warning",
      icon: "clock",
      updatedAt: update,
    };
  }

  return {
    key: "unknown",
    label: "Status belum tersedia",
    detail: "Status perjalanan belum dapat ditampilkan saat ini.",
    tone: "neutral",
    icon: "clock",
    updatedAt: update,
  };
}
