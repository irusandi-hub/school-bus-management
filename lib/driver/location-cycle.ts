/**
 * GPS cycle rules for one driver trip.
 *
 * Tracking is a function of the trip status only. Passenger attendance and the
 * camera have their own cycles and must never stop or start location sharing.
 * The server RPC independently checks that the trip is still in progress and
 * belongs to the signed-in driver.
 */

export function shouldTrackTripLocation(tripStatus: string | null | undefined): boolean {
  return tripStatus === "in_progress";
}

export function shouldPublishTripLocation(input: {
  tripStatus: string | null | undefined;
  tripId: string | null | undefined;
  hasFix: boolean;
  online: boolean;
  lastSentTimestamp: number;
  currentTimestamp: number;
}): boolean {
  if (!shouldTrackTripLocation(input.tripStatus)) return false;
  if (!input.tripId || !input.hasFix || !input.online) return false;
  if (!Number.isFinite(input.currentTimestamp) || input.currentTimestamp <= 0) return false;
  return input.currentTimestamp > input.lastSentTimestamp;
}
