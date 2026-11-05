/**
 * Status akses Live Video untuk wali.
 *
 * Akses mengikuti catatan perjalanan, bukan tebakan:
 * - Anak belum tercatat naik bus → video belum dapat diakses.
 * - Anak berada di bus → akses terbuka; kamera tetap "belum terhubung" sampai
 *   backend streaming benar-benar mengirim sumber siaran.
 * - Anak sudah turun atau perjalanan selesai → akses berakhir.
 *
 * Indikator LIVE hanya muncul pada state "live", yang hanya bisa terjadi bila
 * sumber siaran tersedia untuk siswa dan perjalanan tersebut.
 */

import type { LiveStreamSource } from "@/lib/guardian/live-stream";

export type LiveVideoState = "awaiting-boarding" | "on-board-camera-off" | "ended" | "live";

export type LiveTripInput = {
  status: string;
  direction: string;
  startedAt?: string | null;
  arrivedAt?: string | null;
  completedAt?: string | null;
};

export type LiveEventInput = {
  event_type: string;
  occurred_at?: string | null;
} | null;

/** Perjalanan yang relevan untuk hari ini: berlangsung, lalu selesai, lalu terjadwal. */
export function selectLiveTrip<T extends LiveTripInput>(trips: T[]): T | null {
  return (
    trips.find((trip) => trip.status === "in_progress") ??
    trips.find((trip) => trip.status === "completed") ??
    trips.find((trip) => trip.status === "scheduled") ??
    trips[0] ??
    null
  );
}

export function resolveLiveVideoState(input: { trip: LiveTripInput | null; event: LiveEventInput }): LiveVideoState {
  const { trip, event } = input;
  if (!trip) return "awaiting-boarding";
  if (trip.status === "completed" || trip.status === "cancelled") return "ended";
  if (event && (event.event_type === "dropped_off" || event.event_type === "absent")) return "ended";
  if (event?.event_type === "boarded" && trip.status === "in_progress") return "on-board-camera-off";
  return "awaiting-boarding";
}

/**
 * State akhir yang dipakai UI. "live" hanya bila anak berada di bus DAN sumber
 * siaran tersedia dari konfigurasi backend.
 */
export function resolveLiveVideoAccess(input: {
  trip: LiveTripInput | null;
  event: LiveEventInput;
  stream: LiveStreamSource | null;
}): LiveVideoState {
  const state = resolveLiveVideoState({ trip: input.trip, event: input.event });
  if (state === "on-board-camera-off" && input.stream) return "live";
  return state;
}

export const LIVE_STATE_COPY: Record<
  LiveVideoState,
  { camera: string; title: string; detail: string; placeholder: string }
> = {
  "awaiting-boarding": {
    camera: "Kamera belum aktif",
    title: "Menunggu anak berada di dalam bus",
    detail: "Akses kamera terbuka setelah pengemudi mencatat anak Anda naik bus.",
    placeholder: "Akses video mengikuti status kehadiran anak pada perjalanan hari ini.",
  },
  "on-board-camera-off": {
    camera: "Kamera belum terhubung",
    title: "Kamera belum terhubung",
    detail:
      "Anak Anda tercatat berada di bus. Kamera kabin belum terintegrasi, sehingga belum ada siaran yang dapat ditampilkan.",
    placeholder: "Area ini akan menampilkan siaran kamera setelah integrasi kamera diaktifkan.",
  },
  ended: {
    camera: "Kamera nonaktif",
    title: "Akses kamera telah berakhir",
    detail: "Anak Anda sudah turun dari bus atau perjalanan sudah selesai, sehingga akses siaran ditutup.",
    placeholder: "Tidak ada siaran aktif. Rekaman perjalanan tidak disimpan oleh aplikasi.",
  },
  live: {
    camera: "Kamera terhubung",
    title: "Siaran langsung",
    detail: "Siaran berasal dari kamera bus yang terhubung. Tidak ada rekaman yang disimpan oleh aplikasi.",
    placeholder: "",
  },
};
