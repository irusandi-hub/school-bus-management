"use client";
import { useEffect, useRef, useState } from "react";
import { tripCamera } from "@/lib/camera/trip-connection";

export function TripCameraPublisher({ tripId }: { tripId: string }) {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState("Kamera belum aktif");
  const [consent, setConsent] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let stream: MediaStream | undefined;
    let disconnect: (() => void) | undefined;
    void Promise.resolve().then(() => navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })).then(media => {
      if (cancelled) { media.getTracks().forEach(track => track.stop()); return; }
      stream = media;
      if (video.current) video.current.srcObject = media;
      disconnect = tripCamera({ tripId, stream: media, onStatus: setStatus });
    }).catch(() => { if (cancelled) return; setStatus("Kamera tidak tersedia atau izin ditolak"); setActive(false); });
    return () => { cancelled = true; disconnect?.(); stream?.getTracks().forEach(track => track.stop()); if (video.current) video.current.srcObject = null; };
  }, [active, tripId]);
  return <div>
    <p>Siapkan saat bus berhenti. Jangan mengoperasikan HP saat mengemudi. Siaran hanya untuk wali yang anaknya masih di bus; tidak direkam.</p>
    <label><input type="checkbox" checked={consent} disabled={active} onChange={e => setConsent(e.target.checked)} /> Saya menyetujui penggunaan kamera untuk perjalanan aktif ini.</label>
    <p role="status">{status}</p>
    {!active && !consent && (
      <p className="broadcast-note">Setujui penggunaan kamera untuk mengaktifkan tombol siaran.</p>
    )}
    {active && <video ref={video} autoPlay muted playsInline style={{ width: "100%" }} />}
    <button type="button" className="btn btn-secondary" disabled={!active && !consent} onClick={() => { setActive(!active); if (active) setStatus("Kamera dihentikan"); }}>{active ? "Hentikan siaran" : "Mulai siaran"}</button>
  </div>;
}
