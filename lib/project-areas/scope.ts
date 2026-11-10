import type { ServerSupabase } from "@/lib/admin/support";

/** Cookie that carries the dashboard working context across pages. */
export const PROJECT_AREA_COOKIE = "school_bus_project_area";
export const ALL_AREAS = "all";

export type ProjectAreaScope = {
  selectedId: string | null;
  schoolIds: string[];
  routeIds: string[];
  busIds: string[];
  driverIds: string[];
  guardianIds: string[];
};

/**
 * Loads the identifiers that belong to the selected area. Pages use these arrays
 * to filter lists and counts; an empty selectedId means "Semua Area" and callers
 * must not apply a filter at all.
 */
export async function loadProjectAreaScope(
  supabase: ServerSupabase,
  selectedId: string | null,
): Promise<ProjectAreaScope> {
  if (!selectedId) {
    return { selectedId: null, schoolIds: [], routeIds: [], busIds: [], driverIds: [], guardianIds: [] };
  }

  const [schools, routes, buses, drivers] = await Promise.all([
    supabase.from("schools").select("id").eq("project_area_id", selectedId),
    supabase.from("routes").select("id").eq("project_area_id", selectedId),
    supabase.from("buses").select("id").eq("project_area_id", selectedId),
    supabase.from("drivers").select("id").eq("project_area_id", selectedId),
  ]);

  const schoolIds = ((schools.data ?? []) as { id: string }[]).map((row) => row.id);
  const routeIds = ((routes.data ?? []) as { id: string }[]).map((row) => row.id);
  const busIds = ((buses.data ?? []) as { id: string }[]).map((row) => row.id);
  const driverIds = ((drivers.data ?? []) as { id: string }[]).map((row) => row.id);

  const guardianIds: string[] = [];
  if (schoolIds.length > 0) {
    const { data: studentLinks } = await supabase
      .from("students")
      .select("guardian_id")
      .in("school_id", schoolIds);
    for (const row of (studentLinks ?? []) as { guardian_id: string | null }[]) {
      if (row.guardian_id && !guardianIds.includes(row.guardian_id)) guardianIds.push(row.guardian_id);
    }
  }

  return { selectedId, schoolIds, routeIds, busIds, driverIds, guardianIds };
}

/** A safe in-workspace return path for the area switcher. */
export function safeWorkspacePath(value: string | null | undefined): string {
  if (!value) return "/admin";
  if (!value.startsWith("/")) return "/admin";
  if (value.startsWith("//")) return "/admin";
  if (value === "/admin" || value.startsWith("/admin/") || value === "/operator" || value.startsWith("/operator/")) {
    return value;
  }
  return "/admin";
}
