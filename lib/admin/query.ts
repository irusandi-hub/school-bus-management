export function listHref(path: string, params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function noticeFromParams(params: Record<string, string | string[] | undefined>) {
  const message = firstParam(params.pesan);
  if (!message) return null;
  return { message, kind: firstParam(params.jenis) === "error" ? ("error" as const) : ("success" as const) };
}
