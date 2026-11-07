import { formatTime } from "../validation.ts";

/** Batas umur sampel GPS HP yang masih boleh tampil sebagai posisi terkini. */
export const GUARDIAN_LOCATION_MAX_AGE_MS = 30_000;

export type GuardianLocationPayload = {
  tripStatus: string;
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  recordedAt: string | null;
  isFresh: boolean;
};

export type GuardianLocationViewState =
  | "loading"
  | "live"
  | "stale"
  | "unavailable"
  | "ended"
  | "scheduled"
  | "offline";

export type GuardianLocationView = {
  state: GuardianLocationViewState;
  title: string;
  detail: string;
  updatedLabel: string;
  connectionIssue: boolean;
  location: { latitude: number; longitude: number; accuracy: number } | null;
};

function coordinates(payload: GuardianLocationPayload | null) {
  if (!payload) return null;
  const { latitude, longitude, accuracyMeters } = payload;
  if (
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > 90 ||
    typeof longitude !== "number" ||
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 180
  ) {
    return null;
  }
  return {
    latitude,
    longitude,
    accuracy: typeof accuracyMeters === "number" && Number.isFinite(accuracyMeters) ? accuracyMeters : 0,
  };
}

/**
 * Menentukan apa yang boleh ditampilkan wali.
 *
 * Koordinat hanya menjadi marker ketika perjalanan masih berlangsung dan sampel
 * berumur paling lama 30 detik. Sampel lama tetap menyimpan waktu pembaruan
 * supaya wali tahu kapan lokasi terakhir diterima, tetapi tidak ditampilkan
 * sebagai posisi terkini.
 */
export function resolveGuardianLocationView(input: {
  tripId: string | null;
  tripStatus: string | null;
  payload: GuardianLocationPayload | null;
  loading?: boolean;
  connectionError?: boolean;
  now?: number;
}): GuardianLocationView {
  const status = input.payload?.tripStatus ?? input.tripStatus;
  const now = input.now ?? Date.now();
  const connectionIssue = Boolean(input.connectionError);

  if (status === "completed" || status === "cancelled") {
    return {
      state: "ended",
      title: "Perjalanan selesai",
      detail: "Lokasi tidak lagi dibagikan setelah perjalanan berakhir.",
      updatedLabel: "Perjalanan selesai",
      connectionIssue: false,
      location: null,
    };
  }

  if (!input.tripId) {
    return {
      state: "unavailable",
      title: "Lokasi belum tersedia",
      detail: "Belum ada perjalanan hari ini yang dapat menampilkan posisi pengemudi.",
      updatedLabel: "Belum ada pembaruan",
      connectionIssue,
      location: null,
    };
  }

  if (status === "scheduled") {
    return {
      state: "scheduled",
      title: "Perjalanan belum dimulai",
      detail: "Lokasi mulai dibagikan setelah pengemudi memulai perjalanan.",
      updatedLabel: "Belum dimulai",
      connectionIssue: false,
      location: null,
    };
  }

  const recordedAt = input.payload?.recordedAt ? Date.parse(input.payload.recordedAt) : Number.NaN;
  const age = Number.isNaN(recordedAt) ? Number.POSITIVE_INFINITY : now - recordedAt;
  const fresh =
    status === "in_progress" &&
    Boolean(input.payload?.isFresh) &&
    Number.isFinite(age) &&
    age >= -5_000 &&
    age <= GUARDIAN_LOCATION_MAX_AGE_MS;
  const point = fresh ? coordinates(input.payload) : null;

  if (fresh && point) {
    return {
      state: "live",
      title: "Lokasi pengemudi",
      detail: "Posisi berasal dari GPS HP pengemudi dan diperbarui otomatis.",
      updatedLabel: connectionIssue
        ? `Koneksi terputus · ${formatTime(input.payload?.recordedAt)}`
        : `Diperbarui ${formatTime(input.payload?.recordedAt)}`,
      connectionIssue,
      location: point,
    };
  }

  if (!Number.isNaN(recordedAt) && Number.isFinite(age)) {
    return {
      state: "stale",
      title: "Lokasi menunggu pembaruan",
      detail: "Posisi terakhir tidak ditampilkan sebagai lokasi terkini karena sudah lebih dari 30 detik.",
      updatedLabel: `Terakhir ${formatTime(input.payload?.recordedAt)}`,
      connectionIssue,
      location: null,
    };
  }

  if (connectionIssue) {
    return {
      state: "offline",
      title: "Koneksi terputus",
      detail: "Lokasi belum dapat dimuat. Panel akan mencoba lagi tanpa memuat ulang halaman.",
      updatedLabel: "Mencoba menyambung",
      connectionIssue: true,
      location: null,
    };
  }

  if (input.loading) {
    return {
      state: "loading",
      title: "Memperbarui lokasi",
      detail: "Menunggu posisi terbaru dari GPS HP pengemudi.",
      updatedLabel: "Memperbarui lokasi…",
      connectionIssue: false,
      location: null,
    };
  }

  return {
    state: "unavailable",
    title: "Lokasi belum tersedia",
    detail: "Pengemudi belum mengirim posisi HP pada perjalanan ini.",
    updatedLabel: "Belum ada pembaruan",
    connectionIssue: false,
    location: null,
  };
}
