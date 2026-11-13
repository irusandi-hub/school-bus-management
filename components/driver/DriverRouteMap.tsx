"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";
import type { DeviceLocation } from "@/lib/driver/device-location";
import type { DriverLocationStatus } from "./useDriverLocation";
import "leaflet/dist/leaflet.css";

export type DriverMapStop = {
  id: string;
  order: number;
  name: string;
  isSchool: boolean;
  latitude: number | null;
  longitude: number | null;
  studentCount: number;
  skipped: boolean;
  skipReason: string | null;
};

function hasCoordinates(stop: DriverMapStop): stop is DriverMapStop & { latitude: number; longitude: number } {
  return (
    typeof stop.latitude === "number" &&
    Number.isFinite(stop.latitude) &&
    Math.abs(stop.latitude) <= 90 &&
    typeof stop.longitude === "number" &&
    Number.isFinite(stop.longitude) &&
    Math.abs(stop.longitude) <= 180
  );
}

/**
 * Peta tampilan dari koordinat rute yang tersimpan.
 *
 * Posisi HP pengemudi ditambahkan hanya dari sampel Geolocation yang valid.
 * Tidak ada posisi bus, jalur jalan, atau rute yang dikarang. Garis pada peta
 * hanya menghubungkan urutan titik menurut data rute; bukan jalur jalan dan
 * bukan navigasi belokan.
 */
export function DriverRouteMap({
  stops,
  driverLocation,
  locationStatus,
  locationMessage,
}: {
  stops: DriverMapStop[];
  driverLocation: DeviceLocation | null;
  locationStatus: DriverLocationStatus;
  locationMessage: string;
}) {
  const { locale } = useLocale();
  const c = (value: string) => translateAdminCopy(value, locale) ?? value;
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const driverMarker = useRef<import("leaflet").Marker | null>(null);
  const locateTimer = useRef<number | undefined>(undefined);
  const [mapReady, setMapReady] = useState(false);
  const [tileState, setTileState] = useState<"loading" | "ready" | "error">("loading");
  const [locateNotice, setLocateNotice] = useState<string | null>(null);
  const validStops = useMemo(() => stops.filter(hasCoordinates), [stops]);
  const missingCount = stops.length - validStops.length;

  useEffect(() => {
    const node = container.current;
    if (!node || validStops.length === 0) return;

    let disposed = false;
    let map: import("leaflet").Map | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let tileTimeout: number | undefined;
    setTileState("loading");

    void import("leaflet").then((L) => {
      if (disposed || !container.current) return;

      map = L.map(container.current, {
        attributionControl: true,
        boxZoom: false,
        doubleClickZoom: true,
        dragging: true,
        keyboard: true,
        scrollWheelZoom: true,
        touchZoom: true,
        zoomControl: false,
      });
      mapRef.current = map;

      const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      });
      tiles.on("load", () => {
        if (!disposed) setTileState("ready");
      });
      tiles.on("tileerror", () => {
        if (!disposed) setTileState("error");
      });
      tiles.addTo(map);
      tileTimeout = window.setTimeout(() => {
        if (!disposed) setTileState((current) => (current === "ready" ? current : "error"));
      }, 8000);

      const points = validStops.map((stop) => L.latLng(stop.latitude, stop.longitude));

      if (points.length > 1) {
        L.polyline(points, {
          color: "#8A6A24",
          dashArray: "6 7",
          lineCap: "round",
          opacity: 0.7,
          weight: 3,
        }).addTo(map);
      }

      for (const stop of validStops) {
        const icon = L.divIcon({
          className: `ops-map-marker${stop.isSchool ? " is-school" : ""}${stop.skipped ? " is-skipped" : ""}`,
          html: `<span>${stop.isSchool ? "S" : stop.order}</span>`,
          iconAnchor: [13, 13],
          iconSize: [26, 26],
        });
        const marker = L.marker([stop.latitude, stop.longitude], {
          icon,
          keyboard: false,
          title: `${stop.order}. ${stop.name}`,
        }).addTo(map);

        const tooltip = document.createElement("span");
        const title = document.createElement("strong");
        title.textContent = `${stop.order}. ${stop.name}`;
        const detail = document.createElement("small");
        detail.textContent = stop.isSchool
          ? c("Sekolah")
          : `${stop.studentCount} ${c("Siswa").toLocaleLowerCase(locale)}${stop.skipped && stop.skipReason ? ` · ${c(stop.skipReason)}` : ""}`;
        tooltip.className = "ops-map-tooltip-copy";
        tooltip.append(title, detail);
        marker.bindTooltip(tooltip, {
          className: "ops-map-tooltip",
          direction: "top",
          offset: [0, -12],
          opacity: 1,
        });
      }

      const bounds = L.latLngBounds(points);
      if (points.length === 1) {
        map.setView(points[0], 15);
      } else {
        map.fitBounds(bounds, { maxZoom: 15, padding: [24, 24] });
      }
      map.invalidateSize();
      setMapReady(true);

      resizeObserver = new ResizeObserver(() => map?.invalidateSize());
      resizeObserver.observe(node);
    }).catch(() => {
      if (!disposed) setTileState("error");
    });

    return () => {
      disposed = true;
      window.clearTimeout(tileTimeout);
      resizeObserver?.disconnect();
      driverMarker.current = null;
      mapRef.current = null;
      setMapReady(false);
      map?.remove();
    };
  }, [validStops, locale]);

  // Marker posisi HP diperbarui tanpa membangun ulang peta atau mengubah
  // urutan/titik pemberhentian.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    let disposed = false;
    if (!driverLocation) {
      driverMarker.current?.remove();
      driverMarker.current = null;
      return;
    }

    // Sampel baru hanya memindahkan marker; jangan bangun ulang peta/marker.
    if (driverMarker.current) {
      driverMarker.current.setLatLng([driverLocation.latitude, driverLocation.longitude]);
      return;
    }

    void import("leaflet").then((L) => {
      if (disposed || mapRef.current !== map) return;
      if (!driverLocation || driverMarker.current) return;

      const icon = L.divIcon({
        className: "ops-map-marker is-driver",
        html: "<span>HP</span>",
        iconAnchor: [13, 13],
        iconSize: [26, 26],
      });
      const marker = L.marker([driverLocation.latitude, driverLocation.longitude], {
        icon,
        keyboard: false,
        title: c("Posisi HP pengemudi"),
        zIndexOffset: 500,
      }).addTo(map);

      const tooltip = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = c("Posisi HP pengemudi");
      const detail = document.createElement("small");
      detail.textContent = `${c("Sumber utama · akurasi")} ±${Math.round(driverLocation.accuracy)} m`;
      tooltip.className = "ops-map-tooltip-copy";
      tooltip.append(title, detail);
      marker.bindTooltip(tooltip, {
        className: "ops-map-tooltip",
        direction: "top",
        offset: [0, -12],
        opacity: 1,
      });

      driverMarker.current = marker;
    });

    return () => {
      disposed = true;
    };
  }, [driverLocation, mapReady, locale]);

  const locate = () => {
    const map = mapRef.current;
    if (!driverLocation) {
      setLocateNotice(locationStatus === "locating" ? c("Mencari GPS HP. Tunggu sampel lokasi pertama.") : c(locationMessage));
      return;
    }
    if (!map) {
      setLocateNotice(c("Peta masih dimuat. Coba lagi sebentar."));
      return;
    }

    map.flyTo([driverLocation.latitude, driverLocation.longitude], Math.max(map.getZoom() ?? 15, 15), {
      animate: true,
      duration: 0.6,
    });
    setLocateNotice(c("Peta dipusatkan ke posisi HP."));
    window.clearTimeout(locateTimer.current);
    locateTimer.current = window.setTimeout(() => setLocateNotice(null), 2_500);
  };

  useEffect(() => () => window.clearTimeout(locateTimer.current), []);

  if (validStops.length === 0) {
    return (
      <div className="ops-map-empty" role="status">
        <strong>{c("Koordinat titik belum tersedia")}</strong>
        <p>{c("Peta hanya dapat ditampilkan dari koordinat rute yang tersimpan.")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="ops-map-stage">
        <div
          ref={container}
          className="ops-map-canvas"
          role="region"
          aria-busy={tileState === "loading"}
          aria-label={`${c("Peta")} ${validStops.length} ${c("titik rute dari koordinat tersimpan; dapat digeser dan diperbesar, bukan navigasi belokan")}`}
        />
        <button
          className="ops-map-locate"
          type="button"
          onClick={locate}
          aria-label={c("Pusatkan peta ke posisi HP pengemudi")}
          title={driverLocation ? c("Pusatkan ke posisi HP") : c(locationMessage)}
        >
          <Icon name="navigation" size={13} />
        </button>
        {locateNotice && (
          <p className="ops-map-locate-notice" role="status" aria-live="polite">
            {locateNotice}
          </p>
        )}
        {tileState !== "ready" && (
          <div className={`ops-map-status is-${tileState}`} role="status">
            <strong>{tileState === "error" ? c("Peta tidak dapat dimuat") : c("Memuat peta OpenStreetMap…")}</strong>
            <small>
              {tileState === "error"
                ? c("Koordinat tetap tersedia di daftar titik. Periksa koneksi lalu muat ulang.")
                : c("Menunggu ubin peta dari OpenStreetMap.")}
            </small>
          </div>
        )}
      </div>
      <div className="ops-map-foot">
        <span>
          <strong>{c("Garis urutan titik")}</strong>, {c("bukan jalur jalan. Navigasi belokan belum tersedia.")}
        </span>
        {missingCount > 0 && (
          <span className="ops-map-missing">{missingCount} {c("titik tanpa koordinat tidak ditampilkan.")}</span>
        )}
      </div>
    </>
  );
}
