import type { LiveVideoState } from "@/lib/guardian/live";

/**
 * Label status kamera yang ringkas untuk header panel.
 *
 * Rincian kondisi tetap berada di layar pemantauan agar status tidak ditulis
 * dua kali dalam satu panel. "LIVE" hanya dirender oleh ParentLiveVideo saat
 * stream benar-benar tersedia.
 */
export function CameraStatus({ state }: { state: LiveVideoState }) {
  const tone = state === "ended" ? "off" : state === "live" ? "on" : "pending";
  const label =
    state === "ended"
      ? "Akses berakhir"
      : state === "live"
        ? "Kamera terhubung"
        : "Akses belum tersedia";

  return (
    <span className={`camera-status ${tone}`}>
      <span className="camera-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
