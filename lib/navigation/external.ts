/**
 * Tautan navigasi eksternal berbasis koordinat.
 *
 * Aturan yang dijaga di sini:
 * - URL hanya dibuat dari koordinat yang benar-benar tersimpan pada titik jemput.
 * - Tidak ada alamat hasil tebakan dan tidak ada koordinat contoh.
 * - Provider disimpan dalam daftar agar HERE atau layanan lain dapat ditambahkan
 *   tanpa mengubah tombol dan kartu tujuan.
 *
 * Lapisan ini tidak melacak posisi bus. Navigasi hanya membuka rute menuju titik
 * yang dipilih; status perjalanan tetap dikendalikan alur kerja pengemudi.
 */

export type Coordinate = {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
};

export type NavigationDestination = Coordinate & {
  label?: string | null;
};

export type NavigationProviderId = "google-maps";

export type ExternalNavigationProvider = {
  id: NavigationProviderId;
  label: string;
  /** Keterangan singkat yang ditampilkan pada pilihan navigasi. */
  detail: string;
  /** Jumlah titik antara yang didukung satu tautan rute provider ini. */
  maxWaypoints: number;
  buildDirectionsUrl: (destination: NavigationDestination) => string | null;
  /** Rute beberapa titik; provider yang belum mendukungnya boleh tidak mengisi. */
  buildRouteUrl?: (stops: Coordinate[], origin?: Coordinate | null) => string | null;
};

/** Angka valid: bukan NaN/Infinity dan berada pada rentang koordinat bumi. */
function isFiniteInRange(value: number | null | undefined, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

export function hasValidCoordinates(destination: Coordinate): boolean {
  return (
    isFiniteInRange(destination.latitude, -90, 90) &&
    isFiniteInRange(destination.longitude, -180, 180)
  );
}

/** Koordinat ditampilkan apa adanya dari data, dibulatkan untuk keterbacaan. */
export function formatCoordinates(destination: Coordinate): string | null {
  if (!hasValidCoordinates(destination)) return null;
  const latitude = Number(destination.latitude).toFixed(5);
  const longitude = Number(destination.longitude).toFixed(5);
  return `${latitude}, ${longitude}`;
}

export const GOOGLE_MAPS_PROVIDER: ExternalNavigationProvider = {
  id: "google-maps",
  label: "Google Maps",
  detail: "Membuka aplikasi peta bila tersedia, atau Google Maps di peramban.",
  maxWaypoints: 3,
  buildDirectionsUrl: (destination) => {
    if (!hasValidCoordinates(destination)) return null;
    const params = new URLSearchParams({
      api: "1",
      destination: `${destination.latitude},${destination.longitude}`,
      travelmode: "driving",
    });
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  },
  buildRouteUrl: (stops, origin) => buildMultiStopDirectionsUrl(stops, origin),
};

/**
 * Provider yang sudah terhubung. HERE belum terdaftar karena integrasinya belum
 * ada; menambahkannya cukup dengan menambahkan satu entri di sini.
 */
export const EXTERNAL_NAVIGATION_PROVIDERS: ExternalNavigationProvider[] = [GOOGLE_MAPS_PROVIDER];

export const DEFAULT_NAVIGATION_PROVIDER = GOOGLE_MAPS_PROVIDER;

export function findNavigationProvider(id?: string | null): ExternalNavigationProvider | null {
  if (!id) return DEFAULT_NAVIGATION_PROVIDER;
  return EXTERNAL_NAVIGATION_PROVIDERS.find((provider) => provider.id === id) ?? null;
}

/**
 * URL rute menuju tujuan, atau null bila koordinat belum tersedia.
 * Pemanggil wajib menampilkan pesan ketika hasilnya null.
 */
export function buildDirectionsUrl(
  destination: Coordinate,
  providerId: NavigationProviderId = DEFAULT_NAVIGATION_PROVIDER.id,
): string | null {
  const provider = findNavigationProvider(providerId);
  if (!provider) return null;
  return provider.buildDirectionsUrl(destination);
}

/**
 * Satu tautan rute lengkap dari provider aktif. Mengganti provider navigasi
 * cukup dengan menambah entri di EXTERNAL_NAVIGATION_PROVIDERS; alur halaman
 * pengemudi tidak perlu berubah.
 */
export function buildRouteDirectionsUrl(
  stops: Coordinate[],
  origin?: Coordinate | null,
  providerId: NavigationProviderId = DEFAULT_NAVIGATION_PROVIDER.id,
): string | null {
  const provider = findNavigationProvider(providerId);
  if (!provider?.buildRouteUrl) return null;
  return provider.buildRouteUrl(stops, origin);
}

/**
 * Batas rute demo pada satu tautan Google Maps: 3 titik antara + 1 tujuan.
 *
 * Google Maps sebenarnya menerima hingga 9 waypoint, tetapi hanya 3 yang
 * diproses pada peramban ponsel. Untuk demo yang dijalankan dari ponsel, batas
 * aman 3 waypoint dipakai dan titik yang tidak terkirim selalu disebutkan.
 */
export const GOOGLE_MAPS_MAX_WAYPOINTS = 3;
/** Tujuan akhir tetap disertakan, sehingga satu tautan memuat maksimal 4 titik. */
export const GOOGLE_MAPS_MAX_STOPS = GOOGLE_MAPS_MAX_WAYPOINTS + 1;

/**
 * Satu tautan rute melewati beberapa titik sesuai urutan yang diberikan.
 * Hanya dibuat bila SEMUA titik punya koordinat valid dan jumlahnya masih dalam
 * batas; pemanggil wajib menampilkan titik yang belum terkirim.
 */
export function buildMultiStopDirectionsUrl(
  stops: Coordinate[],
  origin?: Coordinate | null,
): string | null {
  if (stops.length === 0 || stops.length > GOOGLE_MAPS_MAX_STOPS) return null;
  if (!stops.every(hasValidCoordinates)) return null;

  const destination = stops[stops.length - 1];
  const params = new URLSearchParams({
    api: "1",
    destination: `${destination.latitude},${destination.longitude}`,
    travelmode: "driving",
  });

  if (origin && hasValidCoordinates(origin)) {
    params.set("origin", `${origin.latitude},${origin.longitude}`);
  }

  const waypoints = stops
    .slice(0, -1)
    .map((stop) => `${stop.latitude},${stop.longitude}`)
    .join("|");
  if (waypoints) params.set("waypoints", waypoints);

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** Google Maps menerima maksimal 9 titik perantara; pengemudi hanya butuh satu tujuan. */
export function googleMapsSearchUrl(destination: Coordinate): string | null {
  if (!hasValidCoordinates(destination)) return null;
  const params = new URLSearchParams({
    api: "1",
    query: `${destination.latitude},${destination.longitude}`,
  });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}
