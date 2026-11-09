/**
 * Quote a CSV field and neutralize spreadsheet formula prefixes.
 *
 * CSV quoting alone does not stop spreadsheet applications from evaluating
 * formulas in exported cells. Prefix potentially executable values with an
 * apostrophe before quoting them.
 */
export function csvCell(value: unknown): string {
  const raw = value == null ? "" : String(value);
  const safe = /^[\u0000-\u0020\uFEFF]*[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}
