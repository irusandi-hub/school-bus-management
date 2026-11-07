/**
 * Validasi posisi perangkat pengemudi.
 *
 * GPS HP hanya dipakai bila koordinat berada pada rentang yang sah, akurasi
 * cukup baik, dan sampel masih baru. Modul ini murni agar aturan tersebut dapat
 * diuji tanpa browser dan tanpa mengirim posisi ke server.
 */

export const MAX_DEVICE_ACCURACY_METERS = 100;
export const MAX_DEVICE_FIX_AGE_MS = 30_000;

export type DeviceLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
};

export type DeviceLocationInput = {
  latitude: unknown;
  longitude: unknown;
  accuracy: unknown;
  timestamp: unknown;
};

export type DeviceLocationResult =
  | { ok: true; location: DeviceLocation }
  | { ok: false; reason: "coordinates" | "accuracy" | "stale" };

export function validateDeviceLocation(
  input: DeviceLocationInput,
  now = Date.now(),
): DeviceLocationResult {
  const { latitude, longitude, accuracy, timestamp } = input;

  if (
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > 90 ||
    typeof longitude !== "number" ||
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 180
  ) {
    return { ok: false, reason: "coordinates" };
  }

  if (
    typeof accuracy !== "number" ||
    !Number.isFinite(accuracy) ||
    accuracy < 0 ||
    accuracy > MAX_DEVICE_ACCURACY_METERS
  ) {
    return { ok: false, reason: "accuracy" };
  }

  if (
    typeof timestamp !== "number" ||
    !Number.isFinite(timestamp) ||
    timestamp <= 0 ||
    now - timestamp > MAX_DEVICE_FIX_AGE_MS ||
    timestamp - now > 5_000
  ) {
    return { ok: false, reason: "stale" };
  }

  return {
    ok: true,
    location: { latitude, longitude, accuracy, timestamp },
  };
}
