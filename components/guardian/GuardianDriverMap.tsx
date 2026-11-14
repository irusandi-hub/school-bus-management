"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

export type GuardianDriverPoint = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

/**
 * Peta tampilan untuk lokasi HP pengemudi pada portal wali.
 *
 * Hanya marker posisi pengemudi yang digambar. Tidak ada rute, posisi bus, atau
 * lokasi default. Peta tidak menangkap gestur halaman; wali cukup melihat posisi
 * terbaru yang lolos pemeriksaan kesegaran.
 */
export function GuardianDriverMap({ point }: { point: GuardianDriverPoint }) {
  const { locale } = useLocale();
  const c = (value: string) => translateAdminCopy(value, locale) ?? value;
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const [ready, setReady] = useState(false);
  const [tileState, setTileState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const node = container.current;
    if (!node) return;

    let disposed = false;
    let map: import("leaflet").Map | undefined;
    let tileTimeout: number | undefined;

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
      }).setView([point.latitude, point.longitude], 16);
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

      const icon = L.divIcon({
        className: "ops-map-marker is-driver guardian-live-marker",
        html: "<span>HP</span>",
        iconAnchor: [13, 13],
        iconSize: [26, 26],
      });
      markerRef.current = L.marker([point.latitude, point.longitude], {
        icon,
        keyboard: false,
        title: c("Posisi HP pengemudi"),
        zIndexOffset: 500,
      }).addTo(map);

      setReady(true);
      map.invalidateSize();
    });

    return () => {
      disposed = true;
      window.clearTimeout(tileTimeout);
      markerRef.current = null;
      mapRef.current = null;
      setReady(false);
      map?.remove();
    };
    // Peta hanya dibuat sekali; perubahan koordinat ditangani effect berikutnya.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c]);

  useEffect(() => {
    markerRef.current?.setLatLng([point.latitude, point.longitude]);
    mapRef.current?.panTo([point.latitude, point.longitude], { animate: true, duration: 0.4 });
  }, [point.latitude, point.longitude]);

  return (
    <div className="guardian-live-map-wrap">
      <div
        ref={container}
        className="guardian-live-map"
        role="img"
        aria-label={`${c("Posisi HP pengemudi, akurasi sekitar")} ${Math.round(point.accuracy)} ${c("meter")}`}
      />
      {(!ready || tileState !== "ready") && (
        <span className={`guardian-live-map-status is-${tileState}`} role="status">
          {tileState === "error" ? c("Peta tidak dapat dimuat") : c("Memuat peta…")}
        </span>
      )}
    </div>
  );
}
