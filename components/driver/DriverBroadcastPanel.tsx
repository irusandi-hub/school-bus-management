"use client";

import { useState } from "react";
import { TripCameraPublisher } from "./TripCameraPublisher";
import { CameraDeviceDemo } from "@/components/camera/CameraDeviceDemo";

/** Opt-in device test only. Never publishes to a simulated trip or guardian. */
export function DriverBroadcastPanel({ inProgress, tripId }: { inProgress: boolean; tripId?: string }) {
  const [consent, setConsent] = useState(false);
  const [source, setSource] = useState<"mobile" | "bus">("mobile");
  return <section className="panel" aria-label="Siaran kamera pengemudi">
    <header className="panel-head"><div>
      <h2 className="panel-title">Siaran kamera</h2>
      <p className="panel-subtitle">{tripId ? "Siaran perjalanan aktif" : "Uji perangkat · bukan siaran wali"}</p>
    </div></header>
    <div style={{ padding: 16 }}>
      <p>Siapkan saat bus berhenti. Jangan mengoperasikan HP saat mengemudi.</p>
      <fieldset style={{ margin: "16px 0", padding: 16, border: "1px solid var(--line)", borderRadius: 12 }}>
        <legend>Pilih sumber siaran</legend>
        <label style={{ display: "flex", gap: 10, padding: "12px 0", alignItems: "flex-start" }}>
          <input type="radio" name="broadcast-source" value="mobile" checked={source === "mobile"} onChange={() => { setConsent(false); setSource("mobile"); }} />
          <span><strong>Kamera perangkat seluler</strong><br /><small>Gunakan kamera HP yang sedang menjalankan aplikasi ini · tersedia untuk uji perangkat.</small></span>
        </label>
        <label style={{ display: "flex", gap: 10, padding: "12px 0", alignItems: "flex-start" }}>
          <input type="radio" name="broadcast-source" value="bus" checked={source === "bus"} onChange={() => { setConsent(false); setSource("bus"); }} />
          <span><strong>Kamera bus</strong><br /><small>Perangkat kamera yang terpasang di bus · pengembangan berikutnya.</small></span>
        </label>
      </fieldset>
      {source === "mobile" && tripId && inProgress ? <TripCameraPublisher tripId={tripId} /> : source === "bus" ? <div role="status" style={{ padding: 16, background: "var(--paper)", borderRadius: 12 }}>
        <strong>Kamera bus belum tersedia</strong>
        <p>Fitur ini memerlukan setting oleh operator layanan aplikasi.</p>
        <p>Integrasi kamera bus disiapkan untuk pengembangan berikutnya. Tidak ada kamera yang diaktifkan dari pilihan ini.</p>
        <button className="btn btn-secondary" type="button" disabled>Lakukan siaran dari kamera bus</button>
      </div> : <>
      <p>Kamera tidak ditautkan ke bus, siswa, atau perjalanan ini. Gunakan objek uji saja. Penonton membuka /demo-kamera dan menukar kode secara privat; wali belum menerima video otomatis.</p>
      {!inProgress ? <p role="status">Mulai perjalanan dahulu untuk membuka kontrol siaran uji.</p> : <>
        <label><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /> Saya menguji perangkat sendiri, tanpa anak atau data pribadi di kamera.</label>
        {consent ? <CameraDeviceDemo publisherOnly /> : <p role="status">Konfirmasi pengujian untuk membuka tombol Mulai siaran uji.</p>}
      </>}
      </>}
    </div>
  </section>;
}
