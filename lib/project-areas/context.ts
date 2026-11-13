import { cookies } from "next/headers";
import type { ServerSupabase } from "@/lib/admin/support";
import type { ProjectAreaRow } from "@/lib/types";
import { ALL_AREAS, PROJECT_AREA_COOKIE } from "./scope";

export { ALL_AREAS, PROJECT_AREA_COOKIE, loadProjectAreaScope, safeWorkspacePath } from "./scope";
export type { ProjectAreaScope } from "./scope";

export type ProjectAreaContext = {
  areas: ProjectAreaRow[];
  activeAreas: ProjectAreaRow[];
  selectedId: string | null;
  selected: ProjectAreaRow | null;
};

/**
 * Resolves the selected Project Area from the cookie and validates it against the
 * active areas the Operator can read. An inactive or unknown cookie value falls
 * back to the global ("Semua Area") context instead of leaking another area.
 */
export async function getProjectAreaContext(supabase: ServerSupabase): Promise<ProjectAreaContext> {
  const { data } = await supabase
    .from("project_areas")
    .select("id, name, code, city, contact_name, contact_email, contact_phone, active")
    .order("name", { ascending: true });

  const areas = (data ?? []) as ProjectAreaRow[];
  const activeAreas = areas.filter((area) => area.active);
  const cookieStore = await cookies();
  const requested = cookieStore.get(PROJECT_AREA_COOKIE)?.value ?? ALL_AREAS;
  const selected = requested === ALL_AREAS ? null : activeAreas.find((area) => area.id === requested) ?? null;

  return {
    areas,
    activeAreas,
    selectedId: selected?.id ?? null,
    selected,
  };
}
