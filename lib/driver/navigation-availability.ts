/** Only a persisted, server-validated in_progress session can open route navigation. */
export function canOpenRouteNavigation(tripStatus: string | null | undefined, mapUrl: string | null): boolean {
  return tripStatus === "in_progress" && Boolean(mapUrl);
}
