"use client";

import { useEffect, useRef, useState } from "react";
import { tripCamera } from "@/lib/camera/trip-connection";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

export function TripCameraPublisher({ tripId }: { tripId: string }) {
  const { locale } = useLocale();
  const c = (value: string) => translateAdminCopy(value, locale) ?? value;
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState("Kamera belum aktif");
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let stream: MediaStream | undefined;
    let disconnect: (() => void) | undefined;

    void Promise.resolve()
      .then(() => {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Browser tidak mendukung akses kamera.");
        }
        return navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      })
      .then((media) => {
        if (cancelled) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = media;
        if (video.current) video.current.srcObject = media;
        setStatus("Kamera aktif. Menghubungkan ke perjalanan…");
        disconnect = tripCamera({ tripId, stream: media, onStatus: setStatus });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message =
          error instanceof Error && error.name === "NotAllowedError"
            ? "Izin kamera ditolak. Izinkan kamera melalui pengaturan browser."
            : error instanceof Error && error.name === "NotFoundError"
              ? "Kamera tidak ditemukan pada perangkat ini."
              : error instanceof Error
                ? error.message
                : "Kamera tidak tersedia. Periksa izin dan perangkat.";
        setStatus(message);
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
      <span className="broadcast-publisher-status" role="status">
        {status}
      </span>
      <p className="broadcast-consent-inline">
        {c("Menekan Mulai siaran berarti mengizinkan kamera belakang tanpa audio selama perjalanan ini.")}
      </p>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => {
          if (active) {
            setStatus("Kamera dihentikan");
            setActive(false);
          } else {
            setStatus("Meminta izin kamera perangkat…");
            setActive(true);
          }
        }}
      >
        {active ? c("Hentikan siaran") : c("Mulai siaran")}
      </button>
      {active && <video ref={video} autoPlay muted playsInline />}
    </div>
  );
}
