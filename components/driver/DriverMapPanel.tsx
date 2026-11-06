import { Icon } from "@/components/ui/Icon";
import { DriverRouteMap, type DriverMapStop } from "./DriverRouteMap";

/**
 * Kartu peta di bawah dua panel operasional.
 *
 * Hanya menampilkan koordinat rute yang tersedia. Posisi bus tidak digambar
 * karena GPS belum terhubung, dan garis peta bukan jalur jalan.
 */
export function DriverMapPanel({ stops }: { stops: DriverMapStop[] }) {
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
              Tampilan saja · {mappedStops} titik dari koordinat tersimpan · S = sekolah
            </small>
          </div>
        </div>
        <span className="ops-map-gps">
          <Icon name="gpsOff" size={12} />
          Lokasi bus belum tersedia
        </span>
      </header>

      <DriverRouteMap stops={stops} />
    </section>
  );
}
