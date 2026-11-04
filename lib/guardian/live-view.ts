/**
 * Menyusun data yang ditampilkan ParentLiveVideo untuk satu anak.
 *
 * Dipakai server: status anak, perjalanan hari ini, dan sumber siaran hanya
 * dikirim ketika akses memang berlaku. URL siaran tidak pernah dibuat di sini;
 * nilainya berasal dari konfigurasi backend (lihat live-stream.ts).
 */

import type { ChildOverview, StudentTripEvent } from "@/lib/guardian/data";
import { liveEventKey } from "@/lib/guardian/data";
import { resolveLiveVideoAccess, selectLiveTrip, type LiveVideoState } from "@/lib/guardian/live";
import { resolveLiveStreamSource } from "@/lib/guardian/live-stream";
import { formatTime, routeDirectionLabel, tripStatusLabel } from "@/lib/validation";

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
): ChildLiveVideoView {
  const trip = selectLiveTrip(child.todayTrips);
  const event = trip?.tripId ? events.get(liveEventKey(trip.tripId, child.student.id)) ?? null : null;
  const stream = trip?.tripId
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
