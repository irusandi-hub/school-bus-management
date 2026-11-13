import assert from "node:assert/strict";
import fs from "node:fs";
import { it } from "node:test";
import { canRecordStudentStatus } from "../lib/driver/student-actions.ts";
import { resolveStudentTripStates } from "../lib/driver/trip-progress.ts";

for (const sequence of [["boarded","dropped_off"],["boarded","absent"],["absent","boarded","dropped_off"]]) {
  it(`append-only transition sequence: ${sequence.join(" -> ")}`, () => {
    const events: {student_id:string;event_type:string;occurred_at:string}[]=[];
    let status: string|null=null;
    for(const event_type of sequence) {
      assert.equal(canRecordStudentStatus(status,event_type),true);
      events.push({student_id:"student",event_type,occurred_at:new Date(2026,0,1,0,0,events.length).toISOString()});
      status=resolveStudentTripStates(events).get("student")?.status ?? null;
      assert.equal(status,event_type);
    }
    assert.equal(events.length,sequence.length);
    if(status==="dropped_off") for(const event of ["boarded","absent","dropped_off"]) assert.equal(canRecordStudentStatus(status,event),false);
  });
}
it("Tidak Ikut is a direct form without reason picker or confirmation",()=>{
 const source=fs.readFileSync("components/driver/StudentStatusControls.tsx","utf8");
 assert.doesNotMatch(source,/ABSENCE_REASONS|ops-absent-menu|<summary>Tidak Ikut|window.confirm/);
 assert.match(source,/name="event_type" value="absent"/);
});
it("bulk skips dropped/absent even when a later issue event exists; no arrival gate",()=>{
 const source=fs.readFileSync("app/pengemudi/actions.ts","utf8");
 const block=source.slice(source.indexOf("export async function confirmArrival"),source.indexOf("function readConfirmation"));
 assert.match(block,/resolveStudentTripStates/);
 assert.doesNotMatch(block,/if \(trip.arrived_at\)/);
 const states=resolveStudentTripStates([
 {student_id:"a",event_type:"dropped_off",occurred_at:"2026-11-13T01:00:00Z"},
 {student_id:"a",event_type:"issue",occurred_at:"2026-11-13T02:00:00Z"},
 {student_id:"b",event_type:"absent",occurred_at:"2026-11-13T01:00:00Z"},
 {student_id:"c",event_type:"boarded",occurred_at:"2026-11-13T01:00:00Z"},
 ]);
 assert.deepEqual([...states].filter(([,s])=>!["absent","dropped_off"].includes(s.status??"")).map(([id])=>id),["c"]);
});
