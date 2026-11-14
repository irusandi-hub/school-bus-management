"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@/components/ui/Icon";
import { useLocale } from "@/components/i18n/LocaleProvider";
import {
  resolveGuardianLocationView,
  type GuardianLocationPayload,
} from "@/lib/guardian/driver-location";

const GuardianDriverMap = dynamic(
  () => import("@/components/guardian/GuardianDriverMap").then((module) => module.GuardianDriverMap),
  {
    loading: () => (
      <div className="guardian-live-map-wrap">
        <div className="guardian-live-map" role="status" aria-label="Memuat peta…" />
      </div>
    ),
  },
);

const POLL_INTERVAL_MS = 2_000;

function iconForState(state: string) {
  if (state === "live") return "pin" as const;
  if (state === "ended") return "check" as const;
  if (state === "scheduled") return "clock" as const;
  if (state === "loading" || state === "stale") return "refresh" as const;
  return "gpsOff" as const;
}

/**
 * Panel lokasi milik satu anak.
 *
 * Sumbernya GPS HP pengemudi pada perjalanan anak tersebut. Polling 2 detik
 * hanya membaca RPC yang sudah memeriksa relasi wali di server; tidak ada
 * channel atau broadcast lokasi. Marker dihapus ketika sampel sudah lama agar
 * posisi lama tidak tampil sebagai posisi terkini.
 */
export function ChildBusLocationPanel({
  childId,
  tripId,
  initialTripStatus,
}: {
  childId: string;
  tripId: string | null;
  initialTripStatus: string | null;
}) {
  const { t } = useLocale();
  const titleId = `guardian-map-title-${childId}`;
  const finalStatus = initialTripStatus === "completed" || initialTripStatus === "cancelled";
  const [payload, setPayload] = useState<GuardianLocationPayload | null>(null);
  const [loading, setLoading] = useState(Boolean(tripId) && !finalStatus);
  const [connectionError, setConnectionError] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 5_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!tripId || finalStatus) {
      setLoading(false);
      return;
    }

    let stopped = false;
    let inFlight = false;
    let timer: number | undefined;
    let controller: AbortController | undefined;
    let retryDelayMs = POLL_INTERVAL_MS;

    function schedule(delay = retryDelayMs) {
      if (stopped || document.visibilityState === "hidden" || !navigator.onLine) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(load, delay);
    }

    async function load() {
      if (stopped || inFlight) return;
      if (document.visibilityState === "hidden" || !navigator.onLine) {
        if (!navigator.onLine) setConnectionError(true);
        return;
      }

      inFlight = true;
      controller = new AbortController();

      try {
        const response = await fetch(`/api/wali/lokasi?trip_id=${encodeURIComponent(tripId as string)}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 403 || response.status === 404) {
          stopped = true;
          setPayload(null);
          setConnectionError(false);
          return;
        }
        if (!response.ok) throw new Error("Location request failed");

        const data = (await response.json()) as GuardianLocationPayload;
        if (stopped) return;
        setPayload(data);
        setConnectionError(false);
        retryDelayMs = POLL_INTERVAL_MS;
        if (data.tripStatus === "completed" || data.tripStatus === "cancelled") {
          stopped = true;
          return;
        }
      } catch (error) {
        if (!stopped && (error as Error).name !== "AbortError") {
          setConnectionError(true);
          retryDelayMs = Math.min(Math.max(retryDelayMs * 2, POLL_INTERVAL_MS), 15_000);
        }
      } finally {
        inFlight = false;
        if (!stopped) {
          setLoading(false);
          schedule();
        } else {
          setLoading(false);
        }
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        window.clearTimeout(timer);
        void load();
      } else {
        window.clearTimeout(timer);
      }
    };
    const onOnline = () => {
      setConnectionError(false);
      retryDelayMs = POLL_INTERVAL_MS;
      window.clearTimeout(timer);
      void load();
    };
    const onOffline = () => {
      window.clearTimeout(timer);
      setConnectionError(true);
    };

    void load();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [tripId, finalStatus]);

  const view = resolveGuardianLocationView({
    tripId,
    tripStatus: initialTripStatus,
    payload,
    loading,
    connectionError,
    now,
  });

  const viewTitle = t(({ live: "locationTitle", ended: "locationEnded", scheduled: "locationNotStarted", stale: "locationStale", offline: "locationOffline", loading: "locationLoading", unavailable: "locationUnavailable" } as const)[view.state]);
  const viewDetail = t(({ live: "locationLiveDetail", ended: "locationNoShare", scheduled: "locationStartsAfter", stale: "locationStaleDetail", offline: "locationOfflineDetail", loading: "locationLoadingDetail", unavailable: "locationNoPosition" } as const)[view.state]);
  const updatedLabel = view.state === "ended" ? t("locationEnded") : view.state === "unavailable" ? t("noUpdate") : view.state === "scheduled" ? t("locationNotStarted") : view.state === "offline" ? t("connectionTrying") : view.state === "loading" ? t("locationLoading") : view.updatedLabel.startsWith("Koneksi terputus") ? `${t("locationOffline")} · ${view.updatedLabel.split("·").at(-1)?.trim()}` : view.updatedLabel.startsWith("Terakhir") ? `${t("lastSeen")} ${view.updatedLabel.slice(8)}` : view.updatedLabel.startsWith("Diperbarui") ? `${t("updated")} ${view.updatedLabel.slice(11)}` : view.updatedLabel;

  return (
    <section className="guardian-map-panel" aria-labelledby={titleId}>
      <header className="guardian-map-head">
        <div className="guardian-map-title">
          <span className="guardian-map-title-icon" aria-hidden="true">
            <Icon name="pin" size={15} />
          </span>
          <strong id={titleId}>{t("locationTitle")}</strong>
        </div>
        <span className={`guardian-map-updated is-${view.state}`} role="status">
          <Icon name={iconForState(view.state)} size={12} />
          {updatedLabel}
        </span>
      </header>

      <div className={`guardian-map-stage is-${view.state}`}>
        {view.location ? (
          <GuardianDriverMap point={view.location} />
        ) : (
          <>
            <div className="map-canvas guardian-map-canvas" aria-hidden="true">
              <span className="road r1" />
              <span className="road r2" />
              <span className="road r3" />
              <span className="road r4" />
              <span className="road r5" />
              <span className="road r6" />
            </div>

            <div className="guardian-map-placeholder">
              <span className="guardian-map-placeholder-icon" aria-hidden="true">
                <Icon name={iconForState(view.state)} size={22} />
              </span>
              <strong>{viewTitle}</strong>
              <p>{viewDetail}</p>
              <small>
                {view.state === "ended"
                  ? t("locationNotHistory")
                  : t("locationOnlyPhone")}
              </small>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
