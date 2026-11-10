import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
import { createSimulationClient, resetSimulationData } from "../lib/dev-simulation/client.ts";
import { loadProjectAreaScope, safeWorkspacePath } from "../lib/project-areas/scope.ts";
import type { ServerSupabase } from "../lib/admin/support.ts";
import { adminGroups } from "../components/ui/nav-config.ts";

const DAMMAM = "51111111-0000-4000-8000-0000000001b1";
const RIYADH = "51111111-0000-4000-8000-0000000001b2";

function simulated() {
  resetSimulationData();
  return createSimulationClient() as unknown as ServerSupabase;
}

describe("Project Area", () => {
  it("keeps the selected area in a safe in-workspace path", () => {
    assert.equal(safeWorkspacePath("/admin/rute?edit=1"), "/admin/rute?edit=1");
    assert.equal(safeWorkspacePath("/operator"), "/operator");
    assert.equal(safeWorkspacePath("/pengemudi"), "/admin");
    assert.equal(safeWorkspacePath("https://evil.test"), "/admin");
    assert.equal(safeWorkspacePath("//evil.test"), "/admin");
    assert.equal(safeWorkspacePath(undefined), "/admin");
  });

  it("resolves only records from the selected area", async () => {
    const supabase = simulated();
    const dammam = await loadProjectAreaScope(supabase, DAMMAM);
    const riyadh = await loadProjectAreaScope(supabase, RIYADH);

    assert.equal(dammam.selectedId, DAMMAM);
    assert.deepEqual(dammam.schoolIds, ["51111111-0000-4000-8000-0000000002c1"]);
    assert.equal(dammam.routeIds.length, 2);
    assert.equal(dammam.busIds.length, 4);
    assert.equal(dammam.driverIds.length, 3);
    assert.deepEqual(dammam.guardianIds, ["51111111-0000-4000-8000-0000000005f1"]);

    assert.deepEqual(riyadh.schoolIds, ["51111111-0000-4000-8000-0000000002c2"]);
    assert.deepEqual(riyadh.routeIds, []);
    assert.deepEqual(riyadh.guardianIds, ["51111111-0000-4000-8000-0000000005f2"]);
  });

  it("does not filter anything in the global Semua Area context", async () => {
    const supabase = simulated();
    const all = await loadProjectAreaScope(supabase, null);
    assert.deepEqual(all, {
      selectedId: null,
      schoolIds: [],
      routeIds: [],
      busIds: [],
      driverIds: [],
      guardianIds: [],
    });
  });

  it("filters the student list to the area schools and excludes the other area", async () => {
    const supabase = simulated();
    const dammam = await loadProjectAreaScope(supabase, DAMMAM);
    const result = (await supabase
      .from("students")
      .select("id, full_name, school_id")
      .in("school_id", dammam.schoolIds)) as { data: { id: string }[] | null };

    assert.equal(result.data?.length, 3);
    assert.equal(result.data?.some((row) => row.id === "51111111-0000-4000-8000-000000000604"), false);
  });

  it("exposes Project Area, not the legacy company, in the operator navigation", () => {
    const labels = adminGroups.flatMap((group) => group.items.map((item) => item.label));
    const hrefs = adminGroups.flatMap((group) => group.items.map((item) => item.href));

    assert.ok(hrefs.includes("/admin/area"));
    assert.ok(labels.includes("Project Area"));
    assert.equal(labels.some((label) => /perusahaan/i.test(label)), false);
  });

  it("dashboard tabs offer all areas plus each area and persist the selection", () => {
    const tabs = fs.readFileSync("components/admin/ProjectAreaTabs.tsx", "utf8");
    const action = fs.readFileSync("lib/project-areas/actions.ts", "utf8");
    const dashboard = fs.readFileSync("app/admin/page.tsx", "utf8");

    assert.match(tabs, /name="area" value="all"/);
    assert.match(tabs, /areas\.map/);
    assert.match(tabs, /setProjectArea/);
    assert.match(action, /cookieStore\.set\(PROJECT_AREA_COOKIE/);
    assert.match(action, /httpOnly: true/);
    assert.match(dashboard, /ProjectAreaTabs/);
    assert.match(dashboard, /loadProjectAreaScope/);
  });

  it("migration renames the legacy entity and enforces cross-area isolation", () => {
    const sql = fs.readFileSync("supabase/migrations/20261110000000_project_areas.sql", "utf8");

    assert.match(sql, /alter table public\.operators rename to project_areas/i);
    assert.match(sql, /alter table public\.schools rename column operator_id to project_area_id/i);
    assert.match(sql, /create trigger routes_validate_project_area/i);
    assert.match(sql, /create trigger trip_assignments_validate_project_area/i);
    assert.match(sql, /create trigger student_route_stops_validate_project_area/i);
    assert.match(sql, /create trigger students_validate_school_project_area/i);
    assert.match(sql, /drop function if exists private\.current_operator_id\(\)/i);
    assert.match(sql, /Rute, bus, dan pengemudi berasal dari Project Area berbeda/i);
    assert.doesNotMatch(sql, /delete from public\.|truncate|drop table/i);
  });
});
