/** Demo perangkat milik penguji saja; tidak memberi akses kamera perjalanan. */
export function cameraDemoEnabled(kind: string, flag: string | undefined): boolean {
  return (kind === "development" || kind === "preview") && flag === "1";
}

export const DEMO_SESSION_MS = 10 * 60 * 1000;
export const MAX_SIGNAL_LENGTH = 32000;

export function parseDemoDescription(raw: string, expected: "offer" | "answer"): RTCSessionDescriptionInit {
  if (raw.length > MAX_SIGNAL_LENGTH) throw new Error("Kode koneksi terlalu panjang.");
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error("Kode koneksi bukan JSON yang valid."); }
  if (!value || typeof value !== "object") throw new Error("Kode koneksi tidak valid.");
  const description = value as { type?: unknown; sdp?: unknown };
  if (description.type !== expected || typeof description.sdp !== "string" ||
      !description.sdp.startsWith("v=0") || !description.sdp.includes("m=video")) {
    throw new Error(`Diperlukan kode ${expected} video yang valid.`);
  }
  return { type: expected, sdp: description.sdp };
}
