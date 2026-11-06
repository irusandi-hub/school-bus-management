import { EmptyState, Pill } from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";
import { STOP_STATUS_LABEL, STOP_STATUS_TONE, type NavigationPlan } from "@/lib/driver/navigation";
import { buildDirectionsUrl, formatCoordinates } from "@/lib/navigation/external";

/**
 * Daftar titik jemput dengan status, alamat ringkas, dan tautan peta kecil.
 * Status tidak berasal dari GPS: "menuju lokasi" hanya menandai titik berikutnya
 * pada urutan rute yang belum seluruh siswanya dicatat.
 *
 * Navigasi rute utama tetap satu tombol besar di atas daftar. Tautan per titik
 * hanya pelengkap sekunder agar pengemudi dapat membuka satu alamat bila perlu.
 */
export function NavigationStopList({
  plan,
  skipReasons,
}: {
  plan: NavigationPlan;
  /** Alasan titik tidak lagi dikunjungi (tanpa mengubah urutannya). */
  skipReasons?: Record<string, string>;
}) {
  if (plan.stops.length === 0) {
    return (
      <EmptyState
        icon="route"
        title="Belum ada titik jemput"
        detail="Admin Pusat belum menambahkan titik pada rute ini. Navigasi tidak dapat dibuka tanpa titik yang tersimpan."
      />
    );
  }

  return (
    <ol className="nav-stop-list">
      {plan.stops.map((stop) => {
        const skipReason = skipReasons?.[stop.id];
        const coordinates = formatCoordinates(stop);
        const mapUrl = buildDirectionsUrl(stop);

        return (
          <li
            key={stop.id}
            className={`nav-stop${stop.isSchool ? " is-school" : ""}${stop.status === "heading" ? " is-next" : ""}${skipReason ? " is-skipped" : ""}`}
          >
            <span className="nav-stop-order" aria-hidden="true">
              {stop.status === "done" ? <Icon name="check" size={15} /> : stop.order}
            </span>

            <div className="nav-stop-body">
              <div className="nav-stop-head">
                <strong>{stop.name}</strong>
                <Pill tone={STOP_STATUS_TONE[stop.status]}>{STOP_STATUS_LABEL[stop.status]}</Pill>
              </div>
              <small className="nav-stop-meta">
                {stop.isSchool ? "Gerbang sekolah" : "Titik jemput"} · {stop.order} dari {plan.stops.length}
                {stop.students.length > 0 ? ` · ${stop.students.length} siswa` : " · belum ada siswa"}
              </small>

              {stop.students.length > 0 && (
                <p className="nav-stop-students">{stop.students.map((student) => student.name).join(", ")}</p>
              )}

              {skipReason && <p className="nav-stop-skip">{skipReason}</p>}

              <details className="nav-stop-more">
                <summary>Alamat &amp; peta</summary>
                <div className="nav-stop-address">
                  {stop.addresses.map((address) => (
                    <p className="nav-stop-addr" key={address}>
                      <Icon name="home" size={12} />
                      <span>{address}</span>
                    </p>
                  ))}
                  <p className={`nav-stop-coord${coordinates ? "" : " is-missing"}`}>
                    <Icon name={coordinates ? "pin" : "gpsOff"} size={12} />
                    {coordinates ?? "Koordinat belum tersedia"}
                  </p>
                  {mapUrl ? (
                    <a
                      className="nav-stop-map"
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Buka titik ${stop.order}, ${stop.name}, di aplikasi peta`}
                    >
                      <Icon name="navigation" size={12} /> Buka di aplikasi peta
                    </a>
                  ) : (
                    <span className="nav-stop-map is-unavailable">
                      <Icon name="gpsOff" size={12} /> Peta titik ini belum tersedia
                    </span>
                  )}
                </div>
              </details>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
