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
