import { Icon } from "@/components/ui/Icon";

/**
 * Panel lokasi milik satu anak.
 *
 * Sumber GPS aktual belum terhubung dan policy baca `bus_locations` untuk wali
 * belum ada. Karena itu panel ini hanya menampilkan placeholder peta yang jujur:
 * tidak ada marker, rute, atau posisi bus yang dibuat-buat.
 */
export function ChildBusLocationPanel({ childId }: { childId: string }) {
  const titleId = `guardian-map-title-${childId}`;

  return (
    <section className="guardian-map-panel" aria-labelledby={titleId}>
      <header className="guardian-map-head">
        <div className="guardian-map-title">
          <span className="guardian-map-title-icon" aria-hidden="true">
            <Icon name="pin" size={15} />
          </span>
          <strong id={titleId}>Lokasi bus</strong>
        </div>
        <span className="guardian-map-updated">
          <Icon name="refresh" size={12} />
          Belum ada pembaruan
        </span>
      </header>

      <div
        className="guardian-map-stage"
        role="img"
        aria-label="Peta lokasi bus belum tersedia karena GPS belum terhubung"
      >
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
            <Icon name="gpsOff" size={22} />
          </span>
          <strong>GPS belum terhubung</strong>
          <p>Posisi bus belum tersedia.</p>
          <small>Lokasi akan mengikuti perangkat GPS bus setelah integrasi aktif.</small>
        </div>
      </div>
    </section>
  );
}
