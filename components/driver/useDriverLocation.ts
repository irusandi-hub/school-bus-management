"use client";

import { useEffect, useState } from "react";
import {
  MAX_DEVICE_ACCURACY_METERS,
  MAX_DEVICE_FIX_AGE_MS,
  validateDeviceLocation,
  type DeviceLocation,
} from "@/lib/driver/device-location";

export type DriverLocationStatus =
  | "idle"
  | "locating"
  | "active"
  | "denied"
  | "unsupported"
  | "unavailable"
  | "invalid"
  | "stale";

export type DriverLocationState = {
  status: DriverLocationStatus;
  location: DeviceLocation | null;
  message: string;
};

const IDLE: DriverLocationState = {
  status: "idle",
  location: null,
  message: "GPS HP aktif selama perjalanan berlangsung.",
};

/**
 * Satu watcher GPS HP untuk halaman pengemudi.
 *
 * Watcher hanya dibuat saat perjalanan aktif dan selalu dibersihkan saat
 * perjalanan berakhir/unmount. Hook ini tidak membuat watcher kedua; sampel yang
 * sama dipakai untuk marker peta dan dikirim oleh `useDriverLocationPublisher`
 * hanya selama perjalanan aktif.
 */
export function useDriverLocation(active: boolean): DriverLocationState {
  const [state, setState] = useState<DriverLocationState>(IDLE);

  useEffect(() => {
    if (!active) {
      setState(IDLE);
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({
        status: "unsupported",
        location: null,
        message: "Perangkat ini tidak menyediakan Geolocation API.",
      });
      return;
    }

    let disposed = false;
    let watchId: number | undefined;

    setState({
      status: "locating",
      location: null,
      message: "Menunggu izin dan sinyal GPS HP.",
    });

    const onPosition = (position: GeolocationPosition) => {
      if (disposed) return;
      const result = validateDeviceLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      });

      if (result.ok) {
        setState({ status: "active", location: result.location, message: "Posisi HP diterima." });
        return;
      }

      setState({
        status: "invalid",
        location: null,
        message:
          result.reason === "accuracy"
            ? `Akurasi GPS HP melebihi ${MAX_DEVICE_ACCURACY_METERS} m. Posisi belum dipakai.`
            : result.reason === "stale"
              ? "Sampel GPS HP sudah lama. Menunggu posisi baru."
              : "Koordinat GPS HP tidak valid.",
      });
    };

    const onError = (error: GeolocationPositionError) => {
      if (disposed) return;
      if (error.code === error.PERMISSION_DENIED) {
        setState({
          status: "denied",
          location: null,
          message: "Izin lokasi ditolak. Aktifkan izin lokasi untuk browser ini.",
        });
        return;
      }
      setState({
        status: "unavailable",
        location: null,
        message:
          error.code === error.TIMEOUT
            ? "GPS HP belum memberi sinyal. Watcher tetap menunggu."
            : "Lokasi HP tidak tersedia saat ini.",
      });
    };

    try {
      watchId = navigator.geolocation.watchPosition(onPosition, onError, {
        enableHighAccuracy: true,
        maximumAge: 2_000,
        timeout: 15_000,
      });
    } catch {
      setState({
        status: "unavailable",
        location: null,
        message: "GPS HP tidak dapat dimulai pada perangkat ini.",
      });
    }

    const staleTimer = window.setInterval(() => {
      setState((current) => {
        if (!current.location) return current;
        if (Date.now() - current.location.timestamp <= MAX_DEVICE_FIX_AGE_MS) return current;
        return {
          status: "stale",
          location: null,
          message: "Posisi HP terakhir sudah lama. Menunggu sampel GPS baru.",
        };
      });
    }, 5_000);

    return () => {
      disposed = true;
      window.clearInterval(staleTimer);
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [active]);

  return state;
}
