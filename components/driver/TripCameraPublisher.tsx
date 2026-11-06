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
    void Promise.resolve()
      .then(() => navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false }))
      .then((media) => {
        if (cancelled) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = media;
        if (video.current) video.current.srcObject = media;
        disconnect = tripCamera({ tripId, stream: media, onStatus: setStatus });
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("Kamera tidak tersedia atau izin ditolak");
        setActive(false);
      });
    return () => {
      cancelled = true;
      disconnect?.();
      stream?.getTracks().forEach((track) => track.stop());
      if (video.current) video.current.srcObject = null;
    };
  }, [active, tripId]);

  return (
    <div className="broadcast-publisher-inline">
      <label className="broadcast-consent-inline">
        <input
          type="checkbox"
          checked={consent}
          disabled={active}
          onChange={(event) => setConsent(event.target.checked)}
        />
        <span>Izinkan kamera</span>
      </label>
      <span className="broadcast-publisher-status" role="status">
        {status}
      </span>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={!active && !consent}
        onClick={() => {
          setActive(!active);
          if (active) setStatus("Kamera dihentikan");
        }}
      >
        {active ? "Hentikan" : "Mulai siaran"}
      </button>
      {active && <video ref={video} autoPlay muted playsInline />}
    </div>
  );
}
