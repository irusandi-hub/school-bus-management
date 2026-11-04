import { LIVE_STATE_COPY, type LiveVideoState } from "@/lib/guardian/live";

/**
 * Label status kamera. Tidak pernah menampilkan "terhubung" kecuali siaran
 * benar-benar tersedia dari konfigurasi backend.
 */
export function CameraStatus({ state }: { state: LiveVideoState }) {
  const tone = state === "live" ? "on" : state === "ended" ? "off" : "pending";

  return (
    <span className={`camera-status ${tone}`}>
      <span className="camera-dot" aria-hidden="true" />
      {LIVE_STATE_COPY[state].camera}
    </span>
  );
}
