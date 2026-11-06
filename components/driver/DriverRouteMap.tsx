"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
 * Tidak ada posisi bus, jalur jalan, atau rute yang dikarang. Garis pada peta
 * hanya menghubungkan urutan titik menurut data rute; bukan jalur jalan dan
 * bukan navigasi belokan.
 */
export function DriverRouteMap({ stops }: { stops: DriverMapStop[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [tileState, setTileState] = useState<"loading" | "ready" | "error">("loading");
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
        doubleClickZoom: false,
        dragging: false,
        keyboard: false,
        scrollWheelZoom: false,
        touchZoom: false,
        zoomControl: false,
      });

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
          ? "Sekolah"
          : `${stop.studentCount} siswa${stop.skipped && stop.skipReason ? ` · ${stop.skipReason}` : ""}`;
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

      resizeObserver = new ResizeObserver(() => map?.invalidateSize());
      resizeObserver.observe(node);
    }).catch(() => {
      if (!disposed) setTileState("error");
    });

    return () => {
      disposed = true;
      window.clearTimeout(tileTimeout);
      resizeObserver?.disconnect();
      map?.remove();
    };
  }, [validStops]);

  if (validStops.length === 0) {
    return (
      <div className="ops-map-empty" role="status">
        <strong>Koordinat titik belum tersedia</strong>
        <p>Peta hanya dapat ditampilkan dari koordinat rute yang tersimpan.</p>
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
          aria-label={`Peta ${validStops.length} titik rute dari koordinat tersimpan; tampilan saja, bukan navigasi belokan`}
        />
        {tileState !== "ready" && (
          <div className={`ops-map-status is-${tileState}`} role="status">
            <strong>{tileState === "error" ? "Peta tidak dapat dimuat" : "Memuat peta OpenStreetMap…"}</strong>
            <small>
              {tileState === "error"
                ? "Koordinat tetap tersedia di daftar titik. Periksa koneksi lalu muat ulang."
                : "Menunggu ubin peta dari OpenStreetMap."}
            </small>
          </div>
        )}
      </div>
      <div className="ops-map-foot">
        <span>
          <strong>Garis urutan titik</strong>, bukan jalur jalan. Navigasi belokan belum tersedia.
        </span>
        {missingCount > 0 && (
          <span className="ops-map-missing">{missingCount} titik tanpa koordinat tidak ditampilkan.</span>
        )}
      </div>
    </>
  );
}
