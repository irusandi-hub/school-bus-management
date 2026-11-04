import { Pill } from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";

export type GuardianLocationRow = {
  id: string;
  name: string;
  busLabel: string;
  routeLabel: string;
};

/**
 * Lokasi bus untuk seluruh anak dalam satu panel.
 *
 * Belum ada integrasi GPS yang membagikan posisi bus ke portal wali, sehingga
 * panel ini hanya menyatakan data tidak tersedia. Tidak ada peta, koordinat,
 * atau posisi perkiraan yang dibuat agar terlihat seperti data langsung.
 */
export function GuardianBusLocationPanel({ rows }: { rows: GuardianLocationRow[] }) {
  return (
    <section className="panel guardian-location-panel" id="lokasi-bus" aria-label="Lokasi bus">
      <header className="panel-head">
        <div>
          <h2 className="panel-title">Lokasi bus</h2>
          <div className="panel-subtitle">Posisi bus dan waktu pembaruan terakhir untuk anak Anda</div>
        </div>
        <Pill tone="neutral">GPS belum terhubung</Pill>
      </header>

      <div className="guardian-location-body">
        <div className="guardian-location-note" role="note">
          <span className="guardian-location-note-icon" aria-hidden="true">
            <Icon name="gpsOff" size={19} />
          </span>
          <div>
            <strong>Peta belum dapat ditampilkan</strong>
            <p>
              Belum ada integrasi GPS aktif. Tidak ada posisi aktual maupun posisi lama yang dapat diverifikasi, jadi
              halaman ini tidak menampilkan peta atau koordinat perkiraan.
            </p>
          </div>
        </div>

        <div className="guardian-location-list">
          {rows.map((row) => (
            <article className="guardian-location-row" id={`lokasi-${row.id}`} key={row.id}>
              <div className="guardian-location-row-head">
                <span className="child-avatar guardian-location-avatar" aria-hidden="true">
                  {row.name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <strong>{row.name}</strong>
                  <small>
                    {row.busLabel} · {row.routeLabel}
                  </small>
                </div>
                <Pill tone="neutral">GPS belum tersedia</Pill>
              </div>
              <div className="guardian-location-state">
                <Icon name="pin" size={15} />
                <div>
                  <strong>Posisi bus belum tersedia</strong>
                  <small>Belum ada data lokasi aktual atau data lokasi lama.</small>
                </div>
              </div>
              <p className="guardian-location-updated">
                <Icon name="clock" size={12} />
                Waktu pembaruan terakhir: belum ada
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
