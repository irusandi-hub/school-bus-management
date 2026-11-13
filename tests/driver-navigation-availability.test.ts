import assert from "node:assert/strict";
import fs from "node:fs";
import { it } from "node:test";
import { canOpenRouteNavigation } from "../lib/driver/navigation-availability.ts";
import { orderDriverSessions } from "../lib/driver/session-selection.ts";

it("navigation follows persisted lifecycle including refresh and next session", () => {
  for (const [status, expected] of [["scheduled",false],["in_progress",true],["completed",false],["completed",false],["in_progress",true]] as const) {
    assert.equal(canOpenRouteNavigation(status,"https://www.google.com/maps/dir/"),expected);
  }
  for (const status of [null,undefined,"","cancelled","delayed","unknown"]) assert.equal(canOpenRouteNavigation(status,"https://maps.google.com"),false);
  assert.equal(canOpenRouteNavigation("in_progress",null),false);
});
it("restored server session selects active trip, never an older finished session",()=>{
 const completed={status:"completed",started_at:"2026-11-13T01:00:00Z"};
 const active={status:"in_progress",started_at:"2026-11-13T02:00:00Z"};
 assert.equal(canOpenRouteNavigation(orderDriverSessions([completed,active])[0].status,"url"),true);
 assert.equal(canOpenRouteNavigation(orderDriverSessions([completed])[0].status,"url"),false);
});
it("server component gates actual link using persisted status, not local click state",()=>{
 const source=fs.readFileSync("components/driver/FullRouteNavigator.tsx","utf8");
 assert.match(source,/canOpenRouteNavigation\(tripStatus, mapUrl\)/);
 assert.match(source,/navigationEnabled && mapUrl/);
 assert.match(source,/tripStatus !== "in_progress" \? \(/);
 assert.doesNotMatch(source,/useState|localStorage|sessionStorage/);
 const page=fs.readFileSync("app/pengemudi/page.tsx","utf8");
 assert.match(page,/const tripStatus = trip\?\.status \?\? "scheduled"/);
 assert.match(page,/tripStatus={tripStatus}/);
});
