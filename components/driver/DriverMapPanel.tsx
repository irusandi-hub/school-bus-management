"use client";

import { Icon } from "@/components/ui/Icon";
import { useDriverLocation } from "./useDriverLocation";
import { useDriverLocationPublisher } from "./useDriverLocationPublisher";
import { DriverRouteMap, type DriverMapStop } from "./DriverRouteMap";

/**
 * Kartu peta di bawah dua panel operasional.
 *
 * Hanya menampilkan koordinat rute yang tersedia. Marker posisi berasal dari
 * GPS HP pengemudi; GPS bus belum memiliki sumber koordinat di aplikasi ini.
 * Garis peta tetap bukan jalur jalan.
 */
export function DriverMapPanel({
  stops,
  active,
  tripId,
}: {
  stops: DriverMapStop[];
  active: boolean;
  tripId: string | null;
}) {
  const gps = useDriverLocation(active);
  const publisher = useDriverLocationPublisher({ active, tripId, location: gps.location });
  const gpsLabel =
    gps.status === "active" && gps.location
      ? `GPS HP · ±${Math.round(gps.location.accuracy)} m`
      : gps.status === "locating"
        ? "Mencari GPS HP"
        : gps.status === "denied"
          ? "GPS HP ditolak"
          : gps.status === "unsupported"
            ? "GPS HP tidak didukung"
            : gps.status === "invalid"
              ? "Sinyal GPS lemah"
              : gps.status === "stale"
                ? "GPS HP menunggu"
                : gps.status === "unavailable"
                  ? "GPS HP belum tersedia"
                  : "GPS HP belum aktif";
  const mappedStops = stops.filter(
    (stop) =>
      typeof stop.latitude === "number" &&
      Number.isFinite(stop.latitude) &&
      Math.abs(stop.latitude) <= 90 &&
      typeof stop.longitude === "number" &&
      Number.isFinite(stop.longitude) &&
      Math.abs(stop.longitude) <= 180,
  ).length;

  return (
    <section className="panel ops-map" aria-labelledby="ops-map-title">
      <header className="ops-map-head">
        <div className="ops-map-heading">
          <span className="ops-map-icon" aria-hidden="true">
            <Icon name="pin" size={15} />
          </span>
          <div>
            <h2 id="ops-map-title">Peta rute</h2>
            <small>
              Geser/cubit peta · {mappedStops} titik · S = sekolah
            </small>
          </div>
        </div>
        <span className="ops-map-gps" role="status" title={`${gps.message} ${publisher.message}`}>
          <Icon name={gps.status === "active" ? "pin" : "gpsOff"} size={12} />
          {gpsLabel}
        </span>
      </header>

      <DriverRouteMap
        stops={stops}
        driverLocation={gps.location}
        locationStatus={gps.status}
        locationMessage={gps.message}
      />
    </section>
  );
}
