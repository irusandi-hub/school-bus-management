import assert from "node:assert/strict";
import fs from "node:fs";
import {it} from "node:test";
import {UI_COPY,nextPickupMessage} from "../lib/ui/copy.ts";
it("next student message follows persisted session status including repeated sessions",()=>{
 for(const [status,message] of [["scheduled",UI_COPY.tripNotStarted],["completed",UI_COPY.tripCompleted],["cancelled",UI_COPY.tripCancelled],["unknown",UI_COPY.tripNotStarted]]) {
  assert.equal(nextPickupMessage(status,true,"morning"),message);
 }
 assert.equal(nextPickupMessage("in_progress",true,"morning"),UI_COPY.allPickedUp);
 assert.equal(nextPickupMessage("in_progress",true,"afternoon"),UI_COPY.allDroppedOff);
 assert.equal(nextPickupMessage("in_progress",false,"morning"),UI_COPY.noStudents);
});
it("next identity is gated by server status; closed state has one message only",()=>{
 const source=fs.readFileSync("components/driver/FullRouteNavigator.tsx","utf8");
 assert.match(source,/tripStatus === "in_progress" && Boolean\(nextStop.target\)/);
 assert.match(source,/showNextStudent && nextStop.target/);
 assert.doesNotMatch(source,/noTargetDetail|localStorage|useState/);
});
it("shared loading/error boundaries do not repeat condition or promise writes were rolled back",()=>{
 const source=fs.readFileSync("components/ui/AreaStates.tsx","utf8");
 assert.doesNotMatch(source,/Mengambil data terbaru|Tidak ada perubahan data yang/);
});
