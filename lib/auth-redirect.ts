/**
 * Accept only same-origin, root-relative post-authentication destinations.
 * URL parsing also normalizes backslashes, so checking the parsed origin closes
 * the /\\attacker.example open-redirect edge case.
 */
export function safeInternalRedirect(raw: string | null, origin: string): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";

  try {
    const base = new URL(origin);
    const target = new URL(raw, base);
    if (target.origin !== base.origin) return "/";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/";
  }
}
