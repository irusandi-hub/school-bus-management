"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { resolveLivePlayback, type LiveVideoState } from "@/lib/guardian/live";
import { tripCamera } from "@/lib/camera/trip-connection";
import { CameraStatus } from "./CameraStatus";

export type ParentLiveVideoProps = {
  tripId?: string | null;
  studentId?: string;
  childName: string;
  state: LiveVideoState;
  tripLabel: string;
  busLabel: string | null;
  /** Hanya terisi ketika state "live" dan backend menyediakan sumber siaran. */
  streamUrl: string | null;
  streamMimeType: string | null;
  updatedAt: string | null;
  simulated: boolean;
  compact?: boolean;
  /** Tampilan besar di dalam kartu anak; metadata bus tidak diulang di footer. */
  presentation?: "default" | "guardian-card";
};

/**
 * Pemutar Live Video wali.
 *
 * Komponen ini tidak pernah menampilkan indikator LIVE atau video dari data
 * simulasi: `resolveLivePlayback` menutup pemutaran ketika `simulated` aktif,
 * ketika state bukan "live", atau ketika backend tidak mengirim URL siaran.
 * State "live" yang tidak boleh diputar ditampilkan sebagai kamera belum
 * terhubung agar teks placeholder tidak menyatakan siaran aktif.
 */
export function ParentLiveVideo({
  tripId, studentId,
  childName,
  state,
  tripLabel,
  busLabel,
  streamUrl,
  streamMimeType,
  updatedAt,
  simulated,
  compact = false,
  presentation = "default",
}: ParentLiveVideoProps) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [media, setMedia] = useState<MediaStream | null>(null);
  const [connection, setConnection] = useState("");
  useEffect(() => {
    if (simulated || !tripId || !studentId || process.env.NEXT_PUBLIC_TRIP_CAMERA_ENABLED !== "1" || (state !== "live" && state !== "on-board-camera-off")) return;
    const disconnect = tripCamera({ tripId, studentId, onStream: setMedia, onStatus: status => { setConnection(status); if (status !== "Terhubung") setMedia(null); } });
    return () => { disconnect(); setMedia(null); };
  }, [tripId, studentId, simulated, state]);
  const playback = resolveLivePlayback({ state, streamUrl, simulated });
  const displayState = media ? "live" : connection.includes("berakhir") ? "ended" : playback.state;
  const isLive = Boolean(media) || playback.canPlay;
  const copyTitle = t(({ "awaiting-boarding": "awaitingChildOnBus", "on-board-camera-off": "cameraNotConnected", ended: "cameraEnded", live: "liveStream" } as const)[displayState]);
  const copyDetail = t(({ "awaiting-boarding": "cameraAccessAfterBoarding", "on-board-camera-off": "cameraBoardedNoStream", ended: "cameraNoRecording", live: "cameraNoRecording" } as const)[displayState]);
  const isGuardianCard = presentation === "guardian-card";
  const placeholderIcon =
    displayState === "ended" ? "check" : displayState === "awaiting-boarding" ? "bus" : "cameraOff";

  useEffect(() => {
    if (!expanded) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  const stage = isLive ? (
    <video ref={node => { if (node) node.srcObject = media; }} className="live-player" controls autoPlay muted playsInline preload="metadata">
      <source src={media ? undefined : streamUrl ?? undefined} type={streamMimeType ?? undefined} />
      {t("videoUnsupported")}
    </video>
  ) : (
    <div className={`live-placeholder state-${displayState}`}>
      <span className="live-placeholder-icon" aria-hidden="true">
        <Icon name={placeholderIcon} size={26} />
      </span>
      <strong>{copyTitle}</strong>
      <p>{copyDetail}</p>
    </div>
  );

  return (
    <section
      className={`live-video${compact ? " is-compact" : ""}${isGuardianCard ? " guardian-camera-panel" : ""}`}
      aria-label={`${t("cameraTitle")} ${childName}`}
    >
      <header className="live-head">
        <div className="live-title">
          <span className="live-camera-icon" aria-hidden="true">
            <Icon name={isLive ? "camera" : "cameraOff"} size={16} />
          </span>
          <div>
            <strong>{isGuardianCard ? (busLabel ? `${t("cameraTitle")} · ${busLabel}` : t("cameraTitle"))  : t("liveVideo")}</strong>
            <span>{isGuardianCard ? tripLabel : `${childName} · ${tripLabel}`}</span>
          </div>
        </div>
        <div className="live-badges">
          {isLive ? (
            <span className="live-badge">
              <span className="live-dot" aria-hidden="true" />
              LIVE
            </span>
          ) : (
            <CameraStatus state={displayState} />
          )}
          {simulated && (
            <span className="live-demo" title={t("simulatedData")}>
              Data simulasi
            </span>
          )}
        </div>
      </header>

      {connection && <p role="status">{connection}</p>}
      <div className="live-stage">{stage}</div>

      <footer className="live-foot">
        {!isGuardianCard ? (
          <>
            <span className="live-meta">
              <Icon name="clock" size={12} />
              {updatedAt ? `${t("updated")} ${updatedAt}` : t("noUpdate")}
            </span>
            <span className="live-meta">{busLabel ?? t("busNotAssigned")}</span>
          </>
        ) : (
          !isLive && <span className="live-meta">{t("zoomWhenLive")}</span>
        )}
        <button
          className="btn btn-secondary btn-sm live-expand"
          type="button"
          disabled={!isLive}
          title={isLive ? undefined : copyDetail}
          onClick={() => setExpanded(true)}
        >
          <Icon name="expand" size={14} />
          Perbesar
        </button>
      </footer>

      {expanded && (
        <div
          className="live-fullscreen"
          role="dialog"
          aria-modal="true"
          aria-label={`${t("liveVideo")} ${childName}`}
        >
          <header className="live-fullscreen-head">
            <div>
              <strong>{childName}</strong>
              <span>{tripLabel}</span>
            </div>
            <div className="live-fullscreen-badges">
              {isLive ? (
                <span className="live-badge">
                  <span className="live-dot" aria-hidden="true" />
                  LIVE
                </span>
              ) : (
                <CameraStatus state={displayState} />
              )}
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={() => setExpanded(false)}
                autoFocus
              >
                <Icon name="shrink" size={14} />
                Tutup
              </button>
            </div>
          </header>

          <div className="live-fullscreen-stage">{stage}</div>
          <p className="live-fullscreen-note">
            {copyDetail} Tekan Esc atau {t("close")} untuk kembali.
          </p>
        </div>
      )}
    </section>
  );
}
