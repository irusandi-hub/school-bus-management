"use client";

import { useState } from "react";
import { TripCameraPublisher } from "./TripCameraPublisher";
import { CameraDeviceDemo } from "@/components/camera/CameraDeviceDemo";
import { resolveBroadcastState } from "@/lib/camera/broadcast";

/**
 * Panel siaran kamera pengemudi.
 *
 * Panel dan pilihan sumber selalu terlihat. Status perjalanan hanya
 * menonaktifkan tindakan siaran beserta alasannya; tidak menghapus fitur dari
 * halaman. Uji perangkat tetap terpisah dari siaran perjalanan untuk wali.
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

  return (
    <section className="panel" aria-label="Siaran kamera pengemudi">
      <header className="panel-head">
        <div>
          <h2 className="panel-title">Siaran kamera</h2>
          <p className="panel-subtitle">{tripId ? "Siaran perjalanan aktif" : "Kamera perjalanan dan uji perangkat"}</p>
        </div>
      </header>
      <div className="form-body">
        <p className="broadcast-intro">
          Siapkan saat bus berhenti. Jangan mengoperasikan HP saat mengemudi. Siaran hanya untuk wali yang anaknya masih
          di bus; tidak direkam.
        </p>

        <p className={`broadcast-state phase-${broadcast.phase}`} role="status">
          <strong>{broadcast.title}</strong>
          <span>{broadcast.detail}</span>
        </p>

        <fieldset className="broadcast-source">
          <legend>Pilih sumber siaran</legend>
          <label>
            <input
              type="radio"
              name="broadcast-source"
              value="mobile"
              checked={source === "mobile"}
              onChange={() => {
                setConsent(false);
                setSource("mobile");
              }}
            />
            <span>
              <strong>Kamera perangkat seluler</strong>
              <small>Gunakan kamera HP yang sedang menjalankan aplikasi ini.</small>
            </span>
          </label>
          <label>
            <input
              type="radio"
              name="broadcast-source"
              value="bus"
              checked={source === "bus"}
              onChange={() => {
                setConsent(false);
                setSource("bus");
              }}
            />
            <span>
              <strong>Kamera bus</strong>
              <small>Perangkat kamera yang terpasang di bus.</small>
            </span>
          </label>
        </fieldset>

        {source === "bus" ? (
          <div className="broadcast-unavailable" role="status">
            <strong>Kamera bus belum tersedia</strong>
            <p>Integrasi kamera bus belum terpasang pada layanan ini. Tidak ada kamera bus yang diaktifkan dari pilihan ini.</p>
            <button className="btn btn-secondary" type="button" disabled>
              Mulai siaran kamera bus
            </button>
            <small>Hubungi operator atau pengelola sistem bila kamera bus seharusnya sudah aktif.</small>
          </div>
        ) : broadcast.canPublish && tripId ? (
          <TripCameraPublisher tripId={tripId} />
        ) : broadcast.canPublish && enabled ? (
          <>
            <p className="broadcast-note">
              Mode ini hanya menguji kamera perangkat. Kamera tidak ditautkan ke bus, siswa, atau perjalanan, dan wali
              belum menerima video otomatis.
            </p>
            <label className="broadcast-consent">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span>Saya menguji perangkat sendiri, tanpa anak atau data pribadi di kamera.</span>
            </label>
            {consent ? (
              <CameraDeviceDemo publisherOnly />
            ) : (
              <div className="broadcast-unavailable" role="status">
                <strong>Persetujuan uji perangkat belum dicentang</strong>
                <p>Centang persetujuan di atas untuk menampilkan kontrol siaran uji.</p>
                <button className="btn btn-secondary" type="button" disabled>
                  Mulai siaran uji
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="broadcast-unavailable">
            <button className="btn btn-secondary" type="button" disabled>
              Mulai siaran
            </button>
            <small>Tombol aktif kembali saat perjalanan berlangsung.</small>
          </div>
        )}
      </div>
    </section>
  );
}
