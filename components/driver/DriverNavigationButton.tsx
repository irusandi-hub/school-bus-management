import { Icon } from "@/components/ui/Icon";
import {
  buildDirectionsUrl,
  formatCoordinates,
  googleMapsSearchUrl,
  hasValidCoordinates,
  type Coordinate,
} from "@/lib/navigation/external";

/**
 * Tombol navigasi pengemudi.
 *
 * Tautan eksternal dibuat dari koordinat titik yang tersimpan. Bila koordinat
 * belum ada, tombol tidak bisa ditekan dan alasannya ditulis jelas — koordinat
 * atau alamat tidak pernah ditebak oleh antarmuka.
 */
export function DriverNavigationButton({
  destination,
  destinationName,
  label = "Mulai navigasi",
  size = "lg",
  variant = "primary",
  showAlternatives = false,
  disabledMessage,
}: {
  destination: Coordinate;
  destinationName?: string | null;
  label?: string;
  size?: "sm" | "default" | "lg";
  variant?: "primary" | "secondary";
  showAlternatives?: boolean;
  disabledMessage?: string;
}) {
  const url = buildDirectionsUrl(destination);
  const coordinates = formatCoordinates(destination);
  const sizeClass = size === "lg" ? " btn-lg" : size === "sm" ? " btn-sm" : "";

  if (!url) {
    return (
      <div className="nav-action">
        <button className={`btn btn-secondary${sizeClass} nav-disabled`} type="button" disabled>
          <Icon name="gpsOff" size={size === "sm" ? 14 : 17} />
          {label}
        </button>
        <p className="nav-missing">
          {disabledMessage ??
            `${destinationName ? `${destinationName} belum` : "Titik ini belum"} memiliki koordinat tersimpan. Navigasi tidak dibuka karena alamat tidak boleh ditebak.`}
        </p>
      </div>
    );
  }

  return (
    <div className="nav-action">
      <a
        className={`btn btn-${variant}${sizeClass} nav-cta`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Buka navigasi ke ${destinationName ?? "tujuan"}`}
      >
        <Icon name="navigation" size={size === "sm" ? 14 : 18} />
        {label}
      </a>

      {showAlternatives && (
        <>
          <p className="nav-hint">
            Membuka Google Maps dengan koordinat {coordinates}. Status perjalanan dan kehadiran siswa tidak berubah
            otomatis.
          </p>
          <details className="nav-alternatives">
            <summary>Opsi navigasi lain</summary>
            <ul>
              <li>
                <a href={googleMapsSearchUrl(destination) ?? url} target="_blank" rel="noopener noreferrer">
                  Buka titik ini di peta
                </a>
                <small>Berguna bila aplikasi peta tidak terpasang di perangkat.</small>
              </li>
              <li>
                <span className="nav-unavailable">HERE / layanan routing lain — belum tersedia</span>
                <small>Integrasi berikutnya dapat ditambahkan tanpa mengubah tombol ini.</small>
              </li>
            </ul>
          </details>
        </>
      )}
    </div>
  );
}

/** Ringkasan koordinat untuk daftar titik: angka asli atau alasan tidak tersedia. */
export function CoordinateLine({ destination }: { destination: Coordinate }) {
  const coordinates = formatCoordinates(destination);
  if (!coordinates) {
    return (
      <span className="nav-coordinate missing">
        <Icon name="gpsOff" size={12} /> Koordinat belum tersedia
      </span>
    );
  }
  return (
    <span className="nav-coordinate">
      <Icon name="pin" size={12} /> {coordinates}
      {!hasValidCoordinates(destination) && " · perlu diperiksa"}
    </span>
  );
}
