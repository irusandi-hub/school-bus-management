import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cameraDemoEnabled, parseDemoDescription, MAX_SIGNAL_LENGTH } from "../lib/camera/demo-policy.ts";

describe("isolated camera device demo", () => {
  it("requires explicit opt-in on recognized non-production only", () => {
    for (const kind of ["production", "unknown", "", "prod"]) assert.equal(cameraDemoEnabled(kind, "1"), false);
    for (const kind of ["development", "preview"]) {
      assert.equal(cameraDemoEnabled(kind, "1"), true);
      for (const flag of [undefined, "", "0", "true"]) assert.equal(cameraDemoEnabled(kind, flag), false);
    }
  });
  it("accepts video descriptions only for the expected role", () => {
    const raw = JSON.stringify({ type: "offer", sdp: "v=0\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\n" });
    assert.equal(parseDemoDescription(raw, "offer").type, "offer");
    assert.throws(() => parseDemoDescription(raw, "answer"));
    for (const invalid of ["", "null", "[]", "{}", "broken", JSON.stringify({ type: "offer", sdp: "v=0\r\nm=audio" }), "x".repeat(MAX_SIGNAL_LENGTH + 1)]) {
      assert.throws(() => parseDemoDescription(invalid, "offer"));
    }
  });
});

// Guard the actual route placement as well as the policy: the legacy URL redirects.
describe("driver camera route placement", () => {
  it("mounts only on the operational page behind active-trip and demo gates", async () => {
    const { readFile } = await import("node:fs/promises");
    const page = await readFile(new URL("../app/pengemudi/page.tsx", import.meta.url), "utf8");
    assert.match(page, /const inProgress = trip\?\.status === "in_progress"/);
    assert.match(page, /inProgress && \(process.env.NEXT_PUBLIC_TRIP_CAMERA_ENABLED === "1" \|\| cameraDemoEnabled/);
    assert.match(page, /tripId=\{process.env.NEXT_PUBLIC_TRIP_CAMERA_ENABLED === "1" \? trip!.id : undefined\}/);
    const legacy = await readFile(new URL("../app/pengemudi/tugas/[id]/page.tsx", import.meta.url), "utf8");
    assert.match(legacy, /redirect\(`/);
    assert.doesNotMatch(legacy, /DriverBroadcastPanel/);
  });
});
