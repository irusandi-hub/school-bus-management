import { Icon } from "@/components/ui/Icon";
import type { FullRoute, NavigationPlan } from "@/lib/driver/navigation";
import { routeDirectionLabel } from "@/lib/validation";
import { NavigationStopList } from "./NavigationStopList";

/**
 * Blok navigasi utama halaman pengemudi.
 *
 * Satu tombol membuka SATU rute berisi seluruh titik yang masih harus dilalui.
 * Urutan tidak pernah diubah di sini, siswa yang tidak ikut dilewati tanpa
 * menggeser titik lain, dan titik tanpa koordinat tidak dikirim maupun ditebak.
 */
export function FullRouteNavigator({
  plan,
  route,
  mapUrl,
  direction,
  tripStatus,
}: {
  plan: NavigationPlan;
  route: FullRoute;
  mapUrl: string | null;
  direction: string;
  tripStatus: string;
}) {
  const completed = plan.completed;
  const activeCount = route.activeStops.length;
  const skipReasons = Object.fromEntries(
    route.stops
      .filter((entry) => entry.skipReason)
      .map((entry) => [entry.stop.id, entry.skipReason as string]),
  );

  return (
    <section className="route-card" aria-label="Navigasi rute lengkap">
      <header className="route-head">
        <p className="eyebrow">NAVIGASI RUTE</p>
        <h2>
          {completed ? "Rute sudah selesai" : `Rute lengkap · ${activeCount} titik`}
          <span className="route-direction">{routeDirectionLabel(direction)}</span>
        </h2>
        <p className="route-lock">
          <Icon name={route.locked ? "shield" : "route"} size={13} />
          {route.locked
            ? "Urutan titik terkunci sejak perjalanan dimulai. Aplikasi peta boleh menghitung ulang jalur jalan, tetapi urutan titik tidak berubah."
            : "Urutan titik ditetapkan sistem sebelum perjalanan dimulai. Setelah perjalanan dimulai, urutan dikunci."}
        </p>
      </header>

      {completed ? (
        <button className="route-cta route-cta-disabled" type="button" disabled>
          <span className="route-cta-icon" aria-hidden="true">
            <Icon name="check" size={26} />
          </span>
          <span className="route-cta-copy">
            <strong>Buka Navigasi Rute</strong>
            <small>Perjalanan sudah selesai. Navigasi hanya tersedia selama perjalanan berlangsung.</small>
          </span>
        </button>
      ) : mapUrl ? (
        <a className="route-cta" href={mapUrl} target="_blank" rel="noopener noreferrer">
          <span className="route-cta-icon" aria-hidden="true">
            <Icon name="navigation" size={26} />
          </span>
          <span className="route-cta-copy">
            <strong>Buka Navigasi Rute</strong>
            <small>
              Buka aplikasi peta dan ikuti rute sesuai urutan pemberhentian yang telah ditentukan. Tujuan akhir tetap
              dipertahankan.
            </small>
          </span>
          <Icon name="arrowRight" size={20} />
        </a>
      ) : (
        <button className="route-cta route-cta-disabled" type="button" disabled>
          <span className="route-cta-icon" aria-hidden="true">
            <Icon name="gpsOff" size={26} />
          </span>
          <span className="route-cta-copy">
            <strong>Buka Navigasi Rute</strong>
            <small>
              {activeCount === 0
                ? "Tidak ada titik yang masih perlu dikunjungi pada rute ini."
                : "Titik yang tersisa belum memiliki koordinat tersimpan. Minta Admin Pusat melengkapi koordinat."}
            </small>
          </span>
        </button>
      )}

      <div className="route-summary">
        <div>
          <span>Awal</span>
          <strong>{plan.origin.label}</strong>
        </div>
        <div>
          <span>Tujuan akhir</span>
          <strong>{route.destination?.name ?? "—"}</strong>
        </div>
        <div>
          <span>Titik aktif</span>
          <strong>{activeCount}</strong>
        </div>
        <div>
          <span>Siswa tersisa</span>
          <strong>{route.pendingStudents}</strong>
        </div>
      </div>

      {route.missingCoordinateStops.length > 0 && (
        <div className="route-warn" role="alert">
          <Icon name="alert" size={15} />
          <div>
            <strong>
              {route.missingCoordinateStops.length} titik belum punya koordinat dan tidak dikirim ke aplikasi peta
            </strong>
            <p>
              {route.missingCoordinateStops.map((stop) => `${stop.order}. ${stop.name}`).join(", ")}. Lengkapi
              koordinat lewat Admin Pusat atau operator — alamat tidak ditebak oleh aplikasi.
            </p>
          </div>
        </div>
      )}

      {route.omittedStops.length > 0 && (
        <div className="route-warn" role="alert">
          <Icon name="info" size={15} />
          <div>
            <strong>Google Maps hanya menerima sebagian titik pada demo ini</strong>
            <p>
              {route.mapStops.length} dari {activeCount} titik dikirim (3 titik antara + tujuan akhir).{" "}
              {route.omittedStops.length} titik lain tetap tampil berurutan di aplikasi dan tidak diklaim sudah
              terkirim.
            </p>
          </div>
        </div>
      )}

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
            Status titik di bawah berasal dari urutan rute dan catatan pengemudi, bukan GPS. Membuka navigasi tidak
            mengubah status siswa maupun menyelesaikan titik.
          </li>
        </ul>
      </details>

      <h3 className="route-stops-title">Titik pemberhentian</h3>
      <NavigationStopList plan={plan} skipReasons={skipReasons} />
      <p className="route-foot">
        <Icon name="info" size={13} /> {tripStatus === "scheduled" ? "Rute dapat dilihat sebelum mulai. " : ""}
        Posisi bus belum dilacak karena GPS belum aktif.
      </p>
    </section>
  );
}
