import type { LiveVideoState } from "@/lib/guardian/live";
import { useLocale } from "@/components/i18n/LocaleProvider";

/**
 * Label status kamera yang ringkas untuk header panel.
 *
 * Rincian kondisi tetap berada di layar pemantauan agar status tidak ditulis
 * dua kali dalam satu panel. "LIVE" hanya dirender oleh ParentLiveVideo saat
 * stream benar-benar tersedia.
 */
export function CameraStatus({ state }: { state: LiveVideoState }) {
  const { t } = useLocale();
  const tone = state === "ended" ? "off" : state === "live" ? "on" : "pending";
  const label =
    state === "ended"
      ? t("cameraEnded")
      : state === "live"
        ? t("cameraConnected")
        : t("cameraNotConnected");

  return (
    <span className={`camera-status ${tone}`}>
      <span className="camera-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
