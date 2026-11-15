"use client";

import { useState } from "react";
import { TripCameraPublisher } from "./TripCameraPublisher";
import { CameraDeviceDemo } from "@/components/camera/CameraDeviceDemo";
import { resolveBroadcastState } from "@/lib/camera/broadcast";
import { Icon } from "@/components/ui/Icon";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

/**
 * Panel siaran kamera pengemudi.
 *
 * Panel dan pilihan sumber selalu terlihat. Status perjalanan hanya
 * menonaktifkan tindakan siaran beserta alasannya; tidak menghapus fitur dari
 * halaman. Tampilan dibuat satu baris kendali agar tidak mendominasi area
 * navigasi dan tindakan siswa.
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
  const { locale, t } = useLocale();
  const c = (value: string) => translateAdminCopy(value, locale) ?? value;
  const [consent, setConsent] = useState(false);
  const [source, setSource] = useState<"mobile" | "bus">("mobile");
  const [expanded, setExpanded] = useState(false);
  const broadcast = resolveBroadcastState({ enabled, tripStatus });
  const shortStatus =
    source === "bus"
      ? c("Kamera bus belum terpasang.")
      : broadcast.phase === "active"
        ? tripId
          ? c("Siap untuk perjalanan ini. Tidak direkam.")
          : c("Mulai perjalanan untuk mengaktifkan.")
        : broadcast.phase === "scheduled"
          ? c("Tersedia saat perjalanan berlangsung.")
          : broadcast.phase === "unavailable"
            ? c("Belum tersedia untuk layanan ini.")
            : c("Sudah ditutup untuk perjalanan ini.");

  return (
    <section
      className={`panel broadcast-compact phase-${broadcast.phase}${expanded ? " is-expanded" : ""}`}
      aria-label={c("Siaran kamera pengemudi")}
      role={expanded ? "dialog" : undefined}
      aria-modal={expanded ? true : undefined}
    >
      <div className="broadcast-compact-head">
        <span className="broadcast-compact-icon" aria-hidden="true">
          <Icon name={broadcast.phase === "unavailable" ? "cameraOff" : "camera"} size={17} />
        </span>
        <div className="broadcast-compact-copy">
          <strong>{c("Siaran kamera")}</strong>
          <span role="status">
            <b>{source === "bus" ? c("Kamera bus") : c(broadcast.title)}</b> · {shortStatus}
          </span>
          <small className="broadcast-safety-inline">
            <Icon name="alert" size={11} /> {c("Jangan mengoperasikan HP saat mengemudi. Tidak direkam.")}
          </small>
        </div>
        <div className="broadcast-compact-controls" title={c(broadcast.detail)}>
          <button
            className="broadcast-expand"
            type="button"
            onClick={() => setExpanded(true)}
            aria-label={c("Buka layar penuh kamera")}
            title={c("Layar penuh kamera")}
          >
            <Icon name="expand" size={13} />
            <span>{c("Layar penuh kamera")}</span>
          </button>
          <label className="broadcast-source-select">
            <span className="driver-visually-hidden">{c("Sumber siaran")}</span>
            <select
              value={source}
              onChange={(event) => {
                setConsent(false);
                setSource(event.target.value as "mobile" | "bus");
              }}
            >
              <option value="mobile">{c("Kamera HP")}</option>
              <option value="bus">{c("Kamera bus")}</option>
            </select>
          </label>
          {source === "bus" ? (
            <button className="btn btn-secondary btn-sm" type="button" disabled>
              {c("Mulai siaran")}
            </button>
          ) : broadcast.canPublish && tripId ? (
            <TripCameraPublisher tripId={tripId} />
          ) : broadcast.canPublish && enabled ? (
            <details className="broadcast-demo-compact">
              <summary className="btn btn-secondary btn-sm">{c("Uji kamera")}</summary>
              <div className="broadcast-demo-body">
                <label className="broadcast-consent">
                  <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                  <span>{c("Saya menguji perangkat sendiri, tanpa anak atau data pribadi di kamera.")}</span>
                </label>
                {consent ? (
                  <CameraDeviceDemo publisherOnly />
                ) : (
                  <p className="broadcast-note">{c("Centang persetujuan untuk menampilkan kontrol uji kamera.")}</p>
                )}
              </div>
            </details>
          ) : (
            <button className="btn btn-secondary btn-sm" type="button" disabled>
              {c("Mulai siaran")}
            </button>
          )}
        </div>
      </div>
      {expanded && (
        <div className="broadcast-expanded-stage">
          <div className="broadcast-expanded-bar">
            <span>
              <Icon name="camera" size={18} /> {c("Pratinjau kamera")}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm broadcast-expanded-close"
              onClick={() => setExpanded(false)}
              aria-label={c("Tutup layar penuh kamera")}
            >
              <Icon name="close" size={14} /> {t("close")}
            </button>
          </div>
          <div className="broadcast-expanded-placeholder" role="status">
            <span className="broadcast-expanded-icon" aria-hidden="true">
              <Icon name={broadcast.phase === "unavailable" ? "cameraOff" : "camera"} size={34} />
            </span>
            <strong>{c("Pratinjau layar penuh")}</strong>
            <p>
              {source === "bus"
                ? c("Kamera bus belum terpasang. Pratinjau tersedia setelah perangkat kamera bus terhubung.")
                : broadcast.phase === "active"
                  ? c("Gunakan kontrol siaran di panel kamera untuk mengaktifkan video. Pratinjau ini tidak merekam.")
                  : c("Video tampil di sini saat siaran kamera aktif. Tidak ada rekaman.")}
            </p>
            <small>{c("Status:")} {shortStatus}</small>
          </div>
        </div>
      )}
    </section>
  );
}
