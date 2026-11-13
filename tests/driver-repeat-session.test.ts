import assert from "node:assert/strict";
import fs from "node:fs";
import { it } from "node:test";
import { orderDriverSessions } from "../lib/driver/session-selection.ts";

it("selects new active session regardless of embedded row order without mutating history", () => {
  const history = { id: "old", status: "completed", started_at: "2026-11-12T06:00:00Z", completed_at: "2026-11-12T07:00:00Z" };
  const current = { id: "new", status: "in_progress", started_at: "2026-11-12T08:00:00Z", completed_at: null };
  const rows = [history, current];
  const before = structuredClone(rows);
  assert.equal(orderDriverSessions(rows)[0].id, "new");
  assert.deepEqual(rows, before);
  assert.equal(orderDriverSessions([history, {...current, status:"completed", completed_at:"2026-11-12T09:00:00Z"}])[0].id,"new");
});
it("start only resumes scheduled trips; finished trips create new rows", () => {
  const actions = fs.readFileSync("app/pengemudi/actions.ts", "utf8");
  const start = actions.slice(actions.indexOf("export async function startTrip"), actions.indexOf("export async function confirmArrival"));
  assert.match(start, /existing\?\.status === "scheduled"/);
  assert.match(start, /from\("trips"\)\.insert/);
  assert.match(start, /\.eq\("status", "scheduled"\)/);
  assert.match(start, /sessionError/);
  assert.doesNotMatch(start, /sudah selesai dan tidak dapat dimulai ulang/);
  assert.match(fs.readFileSync("app/pengemudi/page.tsx", "utf8"), /trip.status === "completed" \|\| trip.status === "cancelled"/);
});

it("resets student controls for a new trip and refreshes next pickup after saved actions", () => {
  const list = fs.readFileSync("components/driver/StudentList.tsx", "utf8");
  assert.match(list, /key=\{`\$\{tripId/);
  assert.match(fs.readFileSync("components/driver/StudentStatusControls.tsx", "utf8"), /schoolbus:student-saved/);
  assert.match(fs.readFileSync("components/driver/DriverAutoRefresh.tsx", "utf8"), /schoolbus:student-saved/);
});
