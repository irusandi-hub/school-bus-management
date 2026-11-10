"use client";

import { useEffect, useRef, useState } from "react";
import { publishDriverLocation } from "@/app/pengemudi/actions";
import type { DeviceLocation } from "@/lib/driver/device-location";
import { shouldPublishTripLocation } from "@/lib/driver/location-cycle";

export type DriverLocationPublishState = "idle" | "publishing" | "shared" | "retrying";

const PUBLISH_INTERVAL_MS = 2_000;
const RETRY_INTERVAL_MS = 5_000;

/**
 * Mengirim sampel GPS HP yang sudah ada ke server selama perjalanan aktif.
 *
 * Hook ini tidak membuat watcher Geolocation baru. Sampel yang sama dipakai
 * untuk marker peta dan pengiriman ke server. Pengiriman dibatasi agar tidak
 * menulis lebih sering dari 2 detik, tidak berjalan bersamaan, dan diulang
 * ketika koneksi pulih atau server menolak sementara.
 */
export function useDriverLocationPublisher({
  active,
  tripId,
  location,
}: {
  active: boolean;
  tripId: string | null;
  location: DeviceLocation | null;
}): { state: DriverLocationPublishState; message: string } {
  const [state, setState] = useState<DriverLocationPublishState>("idle");
  const lastSent = useRef(0);
  const lastAttempt = useRef(0);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!active || !tripId || !location) {
      setState("idle");
      return;
    }

    let disposed = false;
    let timer: number | undefined;

    const attempt = async () => {
      if (disposed) return;
      if (inFlight.current) {
        // Sampel baru bisa datang saat permintaan sebelumnya belum selesai.
        // Periksa lagi sebentar lagi agar sampel terbaru tidak terlewat.
        timer = window.setTimeout(attempt, 500);
        return;
      }
      if (
        !shouldPublishTripLocation({
          tripStatus: "in_progress",
          tripId,
          hasFix: true,
          online: true,
          lastSentTimestamp: lastSent.current,
          currentTimestamp: location.timestamp,
        })
      ) {
        return;
      }

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setState("retrying");
        timer = window.setTimeout(attempt, RETRY_INTERVAL_MS);
        return;
      }

      const wait = PUBLISH_INTERVAL_MS - (Date.now() - lastAttempt.current);
      if (wait > 0) {
        timer = window.setTimeout(attempt, wait);
        return;
      }

      inFlight.current = true;
      lastAttempt.current = Date.now();
      setState("publishing");

      let result: Awaited<ReturnType<typeof publishDriverLocation>>;
      try {
        result = await publishDriverLocation(tripId, location);
      } catch {
        result = { ok: false, message: "Lokasi HP belum dapat dibagikan ke wali." };
      } finally {
        inFlight.current = false;
      }
      if (disposed) return;

      if (result.ok) {
        lastSent.current = location.timestamp;
        setState("shared");
        return;
      }

      setState("retrying");
      timer = window.setTimeout(attempt, RETRY_INTERVAL_MS);
    };

    void attempt();

    const onOnline = () => {
      if (disposed) return;
      window.clearTimeout(timer);
      void attempt();
    };
    window.addEventListener("online", onOnline);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      window.removeEventListener("online", onOnline);
    };
  }, [active, tripId, location]);

  if (state === "retrying") return { state, message: "Lokasi HP belum terkirim ke wali. Mencoba lagi." };
  if (state === "publishing") return { state, message: "Mengirim lokasi HP ke wali." };
  if (state === "shared") return { state, message: "Lokasi HP terakhir sudah dibagikan ke wali." };
  return { state, message: "Lokasi HP akan dibagikan selama perjalanan aktif." };
}
