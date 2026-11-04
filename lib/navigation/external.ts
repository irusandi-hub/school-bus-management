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
  buildDirectionsUrl: (destination: NavigationDestination) => string | null;
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
  buildDirectionsUrl: (destination) => {
    if (!hasValidCoordinates(destination)) return null;
    const params = new URLSearchParams({
      api: "1",
      destination: `${destination.latitude},${destination.longitude}`,
      travelmode: "driving",
    });
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  },
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

/** Google Maps menerima maksimal 9 titik perantara; pengemudi hanya butuh satu tujuan. */
export function googleMapsSearchUrl(destination: Coordinate): string | null {
  if (!hasValidCoordinates(destination)) return null;
  const params = new URLSearchParams({
    api: "1",
    query: `${destination.latitude},${destination.longitude}`,
  });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}
