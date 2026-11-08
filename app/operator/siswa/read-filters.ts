export function studentReadFilters(input: Record<string, string | string[] | undefined>) {
  const one = (key: string) => typeof input[key] === "string" ? input[key] as string : "";
  const status = one("status");
  const school = one("school");
  return {
    q: one("q").trim().slice(0, 120).replace(/[\\%_]/g, ""),
    status: status === "active" || status === "inactive" ? status : "",
    school: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(school) ? school : "",
  };
}
export function studentInScope(schoolId: string | null, allowedSchoolIds: string[]) {
  return schoolId !== null && allowedSchoolIds.includes(schoolId);
}
