"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { LIVE_STATE_COPY, type LiveVideoState } from "@/lib/guardian/live";
import { CameraStatus } from "./CameraStatus";

export type ParentLiveVideoProps = {
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
};

/**
 * Pemutar Live Video wali.
 *
 * Komponen ini tidak pernah menampilkan indikator LIVE atau video dari data
 * simulasi: indikator hanya muncul ketika `state === "live"` dan URL siaran
 * benar-benar dikirim backend.
 */
export function ParentLiveVideo({
  childName,
  state,
  tripLabel,
  busLabel,
  streamUrl,
  streamMimeType,
  updatedAt,
  simulated,
  compact = false,
}: ParentLiveVideoProps) {
  const [expanded, setExpanded] = useState(false);
  const copy = LIVE_STATE_COPY[state];
  const isLive = state === "live" && Boolean(streamUrl);
  const placeholderIcon = state === "ended" ? "check" : state === "awaiting-boarding" ? "bus" : "cameraOff";

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
    <video className="live-player" controls autoPlay muted playsInline preload="metadata">
      <source src={streamUrl ?? undefined} type={streamMimeType ?? undefined} />
      Peramban Anda tidak mendukung pemutaran video.
    </video>
  ) : (
    <div className={`live-placeholder state-${state}`}>
      <span className="live-placeholder-icon" aria-hidden="true">
        <Icon name={placeholderIcon} size={26} />
      </span>
      <strong>{copy.title}</strong>
      <p>{copy.detail}</p>
      <span className="live-signal">
        <span className="live-signal-dot" aria-hidden="true" />
        Tidak ada siaran
      </span>
    </div>
  );

  return (
    <section className={`live-video${compact ? " is-compact" : ""}`} aria-label={`Live video ${childName}`}>
      <header className="live-head">
        <div className="live-title">
          <span className="live-camera-icon" aria-hidden="true">
            <Icon name={isLive ? "camera" : "cameraOff"} size={16} />
          </span>
          <div>
            <strong>Live video</strong>
            <span>
              {childName} · {tripLabel}
            </span>
          </div>
        </div>
        <div className="live-badges">
          {isLive && (
            <span className="live-badge">
              <span className="live-dot" aria-hidden="true" />
              LIVE
            </span>
          )}
          <CameraStatus state={state} />
          {simulated && (
            <span className="live-demo" title="Data simulasi pengembangan, bukan siaran nyata">
              Pratinjau
            </span>
          )}
        </div>
      </header>

      <div className="live-stage">{stage}</div>

      <footer className="live-foot">
        <span className="live-meta">
          <Icon name="clock" size={12} />
          {updatedAt ? `Diperbarui ${updatedAt}` : "Belum ada pembaruan"}
        </span>
        <span className="live-meta">{busLabel ?? "Bus belum ditetapkan"}</span>
        {isLive && (
          <button className="btn btn-secondary btn-sm live-expand" type="button" onClick={() => setExpanded(true)}>
            <Icon name="expand" size={14} />
            Perbesar
          </button>
        )}
      </footer>

      {expanded && (
        <div
          className="live-fullscreen"
          role="dialog"
          aria-modal="true"
          aria-label={`Live video ${childName} diperbesar`}
        >
          <header className="live-fullscreen-head">
            <div>
              <strong>{childName}</strong>
              <span>{tripLabel}</span>
            </div>
            <div className="live-fullscreen-badges">
              {isLive && (
                <span className="live-badge">
                  <span className="live-dot" aria-hidden="true" />
                  LIVE
                </span>
              )}
              <CameraStatus state={state} />
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
            {copy.detail} Tekan Esc atau Tutup untuk kembali.
          </p>
        </div>
      )}
    </section>
  );
}
