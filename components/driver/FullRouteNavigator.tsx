import { Icon } from "@/components/ui/Icon";
import type { FullRoute, NavigationPlan } from "@/lib/driver/navigation";
import type { NextStopResult } from "@/lib/driver/trip-progress";
import { routeDirectionLabel } from "@/lib/validation";
import { NavigationStopList } from "./NavigationStopList";

/**
 * Blok navigasi utama halaman pengemudi.
 *
 * Satu tombol membuka SATU rute berisi seluruh titik yang masih harus dilalui.
 * Urutan tidak pernah diubah di sini, siswa yang tidak ikut dilewati tanpa
 * menggeser titik lain, dan titik tanpa koordinat tidak dikirim maupun ditebak.
 *
 * Panel dibuat ringkas agar dapat berdampingan dengan tindakan siswa pada
 * ponsel. Daftar titik dan catatan rinci tersedia lewat area yang dapat dibuka.
 */
export function FullRouteNavigator({
  plan,
  route,
  mapUrl,
  direction,
  tripStatus,
  nextStop,
}: {
  plan: NavigationPlan;
  route: FullRoute;
  mapUrl: string | null;
  direction: string;
  tripStatus: string;
  nextStop: NextStopResult;
}) {
  const completed = plan.completed;
  const activeCount = route.activeStops.length;
  const hasStudents = plan.stops.some((stop) => stop.students.length > 0);
  const noTargetTitle = nextStop.closedReason === "cancelled"
    ? "Perjalanan dibatalkan"
    : nextStop.closedReason === "completed_early"
      ? "Perjalanan ditutup sebelum semua siswa selesai"
      : !hasStudents
        ? "Belum ada siswa di rute ini"
        : "Semua pemberhentian selesai";
  const noTargetDetail = nextStop.closedReason === "cancelled"
    ? "Status perjalanan ini tidak dapat dilanjutkan."
    : nextStop.closedReason === "completed_early"
      ? `${nextStop.waitingStudents} siswa masih menunggu tindakan pada perjalanan ini.`
      : hasStudents
        ? "Tidak ada siswa yang masih menunggu tindakan."
        : "Admin Pusat belum menempatkan siswa pada titik rute ini.";
  const skipReasons = Object.fromEntries(
    route.stops
      .filter((entry) => entry.skipReason)
      .map((entry) => [entry.stop.id, entry.skipReason as string]),
  );
  const ctaReason = completed
    ? "Perjalanan selesai."
    : activeCount === 0
      ? "Tidak ada titik tersisa."
      : !mapUrl
        ? "Koordinat titik belum lengkap."
        : `${activeCount} titik · ${route.pendingStudents} siswa`;

  return (
    <section className="route-card ops-nav-panel" aria-label="Navigasi rute lengkap">
      <header className="route-head">
        <div className="route-head-top">
          <span className="ops-panel-eyebrow">
            <Icon name="navigation" size={13} /> Navigasi rute
          </span>
          <span className="route-direction">{routeDirectionLabel(direction)}</span>
        </div>
        <h2>
          {completed ? "Rute sudah selesai" : `${activeCount} titik aktif`}
          <span className="ops-panel-count">{route.pendingStudents} siswa</span>
        </h2>
        <p className="route-lock" title={route.locked ? "Urutan titik terkunci sejak perjalanan dimulai." : "Urutan titik ditetapkan sistem sebelum perjalanan dimulai."}>
          <Icon name={route.locked ? "shield" : "route"} size={12} />
          {route.locked ? "Urutan terkunci." : "Urutan ditetapkan sistem."}
        </p>
      </header>

      {completed ? (
        <button className="route-cta route-cta-disabled" type="button" disabled>
          <span className="route-cta-icon" aria-hidden="true">
            <Icon name="check" size={19} />
          </span>
          <span className="route-cta-copy">
            <strong>Buka Navigasi</strong>
            <small>{ctaReason}</small>
          </span>
        </button>
      ) : mapUrl ? (
        <a className="route-cta" href={mapUrl} target="_blank" rel="noopener noreferrer">
          <span className="route-cta-icon" aria-hidden="true">
            <Icon name="navigation" size={19} />
          </span>
          <span className="route-cta-copy">
            <strong>Buka Navigasi</strong>
            <small>{ctaReason}</small>
          </span>
          <Icon name="arrowRight" size={17} />
        </a>
      ) : (
        <button className="route-cta route-cta-disabled" type="button" disabled>
          <span className="route-cta-icon" aria-hidden="true">
            <Icon name="gpsOff" size={19} />
          </span>
          <span className="route-cta-copy">
            <strong>Buka Navigasi</strong>
            <small>{ctaReason}</small>
          </span>
        </button>
      )}

      <section
        className={`ops-next${nextStop.target ? " is-active" : " is-complete"}${nextStop.closedReason ? " is-closed" : ""}`}
        aria-live="polite"
        aria-label={nextStop.target ? nextStop.target.kindLabel : noTargetTitle}
      >
        <span className="ops-next-eyebrow">
          <Icon name="pin" size={12} />
          {nextStop.target?.kindLabel ?? "Pemberhentian berikutnya"}
        </span>
        {nextStop.target ? (
          <>
            <div className="ops-next-heading">
              <strong>{nextStop.target.students.map((student) => student.name).join(", ")}</strong>
              <span>
                {nextStop.target.count} siswa · urutan {nextStop.target.order}
              </span>
            </div>
            <p className="ops-next-place" title={nextStop.target.addresses.join(" · ")}>
              <Icon name="pin" size={12} />
              {nextStop.target.name}
              {nextStop.target.addresses.length > 0 && (
                <span>
                  {" "}
                  · {nextStop.target.addresses[0]}
                  {nextStop.target.addresses.length > 1
                    ? ` +${nextStop.target.addresses.length - 1} alamat`
                    : ""}
                </span>
              )}
            </p>
            <p className="ops-next-state">
              <span>{nextStop.target.statusLabel}</span>
              <span className="ops-next-gps">
                <Icon name="gpsOff" size={11} /> Jarak belum tersedia
              </span>
            </p>
          </>
        ) : (
          <div className="ops-next-empty">
            <strong>{noTargetTitle}</strong>
            <p>{noTargetDetail}</p>
          </div>
        )}
      </section>

      {route.missingCoordinateStops.length > 0 && (
        <details className="route-warn" role="alert">
          <summary>
            <Icon name="alert" size={14} />
            <strong>{route.missingCoordinateStops.length} titik tanpa koordinat</strong>
          </summary>
          <p>
            {route.missingCoordinateStops.map((stop) => `${stop.order}. ${stop.name}`).join(", ")}. Titik ini tidak
            dikirim ke aplikasi peta; lengkapi koordinat lewat Admin Pusat atau operator.
          </p>
        </details>
      )}

      {route.omittedStops.length > 0 && (
        <details className="route-warn" role="alert">
          <summary>
            <Icon name="info" size={14} />
            <strong>{route.omittedStops.length} titik tidak dikirim ke peta</strong>
          </summary>
          <p>
            Aplikasi peta menerima {route.mapStops.length} dari {activeCount} titik pada demo ini. Titik lain tetap
            tampil berurutan di aplikasi dan tidak diklaim sudah terkirim.
          </p>
        </details>
      )}

      <details className="route-stops">
        <summary>
          <span>
            <Icon name="pin" size={14} /> Titik pemberhentian
          </span>
          <span>{route.stops.length}</span>
        </summary>
        <div className="route-stops-scroll">
          <NavigationStopList plan={plan} skipReasons={skipReasons} />
        </div>
      </details>

      <details className="route-note">
        <summary>Catatan rute dan aplikasi peta</summary>
        <ul>
          <li>
            Rute dibuka di Google Maps sebagai <strong>satu tautan</strong> berisi {route.mapStops.length} titik pada
            demo ini: maksimal 3 titik antara sesuai urutan rute, ditambah tujuan akhir. Titik lain tetap tampil di
            aplikasi dan tidak diklaim sudah terkirim.
          </li>
          <li>
            Aplikasi peta hanya menghitung jalur jalan antartitik. Urutan relatif titik yang tersisa tidak boleh
            berubah, dan rute belum diverifikasi untuk ukuran bus — ikuti rambu dan kondisi jalan.
          </li>
          <li>
            Status titik berasal dari urutan rute dan catatan pengemudi, bukan GPS. Membuka navigasi tidak mengubah
            status siswa maupun menyelesaikan titik.
          </li>
        </ul>
      </details>

      <p className="route-foot">
        <Icon name="info" size={12} /> {tripStatus === "scheduled" ? "Rute dapat dilihat sebelum mulai. " : ""}
        GPS HP aktif selama perjalanan; jarak dan ETA belum tersedia.
      </p>
    </section>
  );
}
