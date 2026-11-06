"use client";

import { useState } from "react";
import { TripCameraPublisher } from "./TripCameraPublisher";
import { CameraDeviceDemo } from "@/components/camera/CameraDeviceDemo";
import { resolveBroadcastState } from "@/lib/camera/broadcast";
import { Icon } from "@/components/ui/Icon";

/**
 * Panel siaran kamera pengemudi.
 *
 * Panel dan pilihan sumber selalu terlihat. Status perjalanan hanya
 * menonaktifkan tindakan siaran beserta alasannya; tidak menghapus fitur dari
 * halaman. Tampilan dibuat satu baris kendali agar tidak mendominasi area
 * navigasi dan tindakan siswa.
 */
export function DriverBroadcastPanel({
  tripStatus,
  tripId,
  enabled,
}: {
  tripStatus: string;
  tripId?: string;
  enabled: boolean;
}) {
  const [consent, setConsent] = useState(false);
  const [source, setSource] = useState<"mobile" | "bus">("mobile");
  const broadcast = resolveBroadcastState({ enabled, tripStatus });
  const shortStatus =
    source === "bus"
      ? "Kamera bus belum terpasang."
      : broadcast.phase === "active"
        ? tripId
          ? "Siap untuk perjalanan ini. Tidak direkam."
          : "Mulai perjalanan untuk mengaktifkan."
        : broadcast.phase === "scheduled"
          ? "Tersedia saat perjalanan berlangsung."
          : broadcast.phase === "unavailable"
            ? "Belum tersedia untuk layanan ini."
            : "Sudah ditutup untuk perjalanan ini.";

  return (
    <section className={`panel broadcast-compact phase-${broadcast.phase}`} aria-label="Siaran kamera pengemudi">
      <div className="broadcast-compact-head">
        <span className="broadcast-compact-icon" aria-hidden="true">
          <Icon name={broadcast.phase === "unavailable" ? "cameraOff" : "camera"} size={17} />
        </span>
        <div className="broadcast-compact-copy">
          <strong>Siaran kamera</strong>
          <span role="status">
            <b>{source === "bus" ? "Kamera bus" : broadcast.title}</b> · {shortStatus}
          </span>
          <small className="broadcast-safety-inline">
            <Icon name="alert" size={11} /> Jangan mengoperasikan HP saat mengemudi. Tidak direkam.
          </small>
        </div>
        <div className="broadcast-compact-controls" title={broadcast.detail}>
          <label className="broadcast-source-select">
            <span className="driver-visually-hidden">Sumber siaran</span>
            <select
              value={source}
              onChange={(event) => {
                setConsent(false);
                setSource(event.target.value as "mobile" | "bus");
              }}
            >
              <option value="mobile">Kamera HP</option>
              <option value="bus">Kamera bus</option>
            </select>
          </label>
          {source === "bus" ? (
            <button className="btn btn-secondary btn-sm" type="button" disabled>
              Mulai siaran
            </button>
          ) : broadcast.canPublish && tripId ? (
            <TripCameraPublisher tripId={tripId} />
          ) : broadcast.canPublish && enabled ? (
            <details className="broadcast-demo-compact">
              <summary className="btn btn-secondary btn-sm">Uji kamera</summary>
              <div className="broadcast-demo-body">
                <label className="broadcast-consent">
                  <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                  <span>Saya menguji perangkat sendiri, tanpa anak atau data pribadi di kamera.</span>
                </label>
                {consent ? (
                  <CameraDeviceDemo publisherOnly />
                ) : (
                  <p className="broadcast-note">Centang persetujuan untuk menampilkan kontrol uji kamera.</p>
                )}
              </div>
            </details>
          ) : (
            <button className="btn btn-secondary btn-sm" type="button" disabled>
              Mulai siaran
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
