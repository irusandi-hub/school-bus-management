/**
 * Menyusun data yang ditampilkan ParentLiveVideo untuk satu anak.
 *
 * Dipakai server: status anak, perjalanan hari ini, dan sumber siaran hanya
 * dikirim ketika akses memang berlaku. URL siaran tidak pernah dibuat di sini;
 * nilainya berasal dari konfigurasi backend (lihat live-stream.ts).
 *
 * Pada mode simulasi, sumber siaran tidak pernah dibaca atau dikirim. Dengan
 * begitu data contoh tidak dapat membuka siaran LIVE, meskipun konfigurasi
 * stream kebetulan berisi kunci untuk siswa/perjalanan simulasi tersebut.
 */

import type { ChildOverview, StudentTripEvent } from "./data.ts";
import { liveEventKey } from "./data.ts";
import { resolveLiveVideoAccess, selectLiveTrip, type LiveVideoState } from "./live.ts";
import { resolveLiveStreamSource } from "./live-stream.ts";
import { formatTime, routeDirectionLabel, tripStatusLabel } from "../validation.ts";

export type ChildLiveVideoView = {
  state: LiveVideoState;
  tripLabel: string;
  busLabel: string | null;
  updatedAt: string | null;
  streamUrl: string | null;
  streamMimeType: string | null;
};

export function buildChildLiveVideo(
  child: ChildOverview,
  events: Map<string, StudentTripEvent>,
  options: { simulated?: boolean } = {},
): ChildLiveVideoView {
  const trip = selectLiveTrip(child.todayTrips);
  const event = trip?.tripId ? events.get(liveEventKey(trip.tripId, child.student.id)) ?? null : null;
  const stream =
    !options.simulated && trip?.tripId
      ? resolveLiveStreamSource({ studentId: child.student.id, tripId: trip.tripId })
      : null;

  const state = resolveLiveVideoAccess({
    trip: trip
      ? {
          status: trip.status,
          direction: trip.direction,
          startedAt: trip.startedAt,
          arrivedAt: trip.arrivedAt,
          completedAt: trip.completedAt,
        }
      : null,
    event: event ? { event_type: event.eventType, occurred_at: event.occurredAt } : null,
    stream,
  });

  const updatedAt = event?.occurredAt ?? trip?.completedAt ?? trip?.startedAt ?? null;
  const tripLabel = trip
    ? `Perjalanan ${routeDirectionLabel(trip.direction).toLowerCase()} · ${
        trip.status === "scheduled" ? "belum dimulai" : tripStatusLabel(trip.status)
      }`
    : "Belum ada perjalanan hari ini";

  return {
    state,
    tripLabel,
    busLabel: trip?.busCode ? `Bus ${trip.busCode}` : null,
    updatedAt: updatedAt ? formatTime(updatedAt) : null,
    streamUrl: state === "live" ? (stream?.url ?? null) : null,
    streamMimeType: state === "live" ? (stream?.mimeType ?? null) : null,
  };
}
