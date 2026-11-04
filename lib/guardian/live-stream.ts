/**
 * Kontrak backend siaran kamera bus.
 *
 * Belum ada endpoint kamera. URL siaran hanya boleh berasal dari konfigurasi
 * backend yang diisi ketika integrasi benar-benar tersedia:
 *
 *   LIVE_VIDEO_STREAMS = {"<studentId>:<tripId>":{"url":"https://...","mimeType":"video/mp4","expiresAt":"2026-11-04T10:00:00Z"}}
 *
 * Aturan:
 * - Kosong atau tidak valid berarti "kamera belum terhubung" — bukan siaran contoh.
 * - Hanya HTTPS yang diterima.
 * - Nilai ini dibaca di server dan hanya dikirim ke wali yang berhak, ketika
 *   anak sedang berada di bus.
 */

export type LiveStreamSource = {
  url: string;
  mimeType: string | null;
  expiresAt: string | null;
};

const MAX_URL_LENGTH = 2048;

function normalizeEntry(value: unknown): LiveStreamSource | null {
  if (!value || typeof value !== "object") return null;
  const entry = value as { url?: unknown; mimeType?: unknown; expiresAt?: unknown };
  if (typeof entry.url !== "string" || !entry.url.startsWith("https://")) return null;
  if (entry.url.length > MAX_URL_LENGTH) return null;

  const mimeType =
    typeof entry.mimeType === "string" && entry.mimeType.startsWith("video/") ? entry.mimeType : null;
  const expiresAt = typeof entry.expiresAt === "string" && !Number.isNaN(Date.parse(entry.expiresAt))
    ? entry.expiresAt
    : null;

  return { url: entry.url, mimeType, expiresAt };
}

export function parseLiveStreamConfig(raw: string | null | undefined): Record<string, LiveStreamSource> {
  if (!raw || !raw.trim()) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const result: Record<string, LiveStreamSource> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const entry = normalizeEntry(value);
      if (entry) result[key] = entry;
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * Sumber siaran untuk satu siswa pada satu perjalanan, atau null bila kamera
 * belum terhubung, konfigurasi belum ada, atau tautannya sudah kedaluwarsa.
 */
export function resolveLiveStreamSource(input: {
  studentId: string;
  tripId: string | null;
  raw?: string | null;
  now?: Date;
}): LiveStreamSource | null {
  if (!input.tripId) return null;
  const raw = input.raw === undefined ? process.env.LIVE_VIDEO_STREAMS : input.raw;
  const entry = parseLiveStreamConfig(raw)[`${input.studentId}:${input.tripId}`];
  if (!entry) return null;
  if (entry.expiresAt && Date.parse(entry.expiresAt) <= (input.now ?? new Date()).getTime()) return null;
  return entry;
}
