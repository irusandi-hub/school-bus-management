import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cameraDemoEnabled, parseDemoDescription, MAX_SIGNAL_LENGTH } from "../lib/camera/demo-policy.ts";
import { resolveBroadcastState } from "../lib/camera/broadcast.ts";

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
describe("status panel siaran kamera", () => {
  it("menjelaskan fitur yang belum diaktifkan tanpa menyembunyikan panel", () => {
    const state = resolveBroadcastState({ enabled: false, tripStatus: "scheduled" });
    assert.equal(state.phase, "unavailable");
    assert.equal(state.canPublish, false);
    assert.match(state.title, /belum diaktifkan/i);
    assert.ok(state.detail.length > 20);
  });

  it("menonaktifkan siaran sebelum perjalanan dimulai", () => {
    const state = resolveBroadcastState({ enabled: true, tripStatus: "scheduled" });
    assert.equal(state.phase, "scheduled");
    assert.equal(state.canPublish, false);
    assert.match(state.detail, /Mulai perjalanan/);
  });

  it("membuka siaran hanya ketika perjalanan aktif", () => {
    const state = resolveBroadcastState({ enabled: true, tripStatus: "in_progress" });
    assert.equal(state.phase, "active");
    assert.equal(state.canPublish, true);
  });

  it("menutup siaran setelah perjalanan selesai atau dibatalkan", () => {
    for (const tripStatus of ["completed", "cancelled"]) {
      const state = resolveBroadcastState({ enabled: true, tripStatus });
      assert.equal(state.phase, "completed");
      assert.equal(state.canPublish, false);
      assert.ok(state.detail.length > 20);
    }
  });
});

describe("driver camera route placement", () => {
  it("always mounts the panel and only passes a trip id when publishing is enabled", async () => {
    const { readFile } = await import("node:fs/promises");
    const page = await readFile(new URL("../app/pengemudi/page.tsx", import.meta.url), "utf8");
    assert.match(page, /const cameraPublishingEnabled =/);
    assert.match(page, /const cameraEnabled =[\s\S]*?cameraPublishingEnabled/);
    assert.match(page, /<DriverBroadcastPanel[\s\S]*?enabled={cameraEnabled}/);
    assert.match(page, /tripId={cameraPublishingEnabled \? trip\?\.id : undefined}/);
    assert.match(page, /tripStatus={trip\?\.status \?\? "scheduled"}/);
    assert.doesNotMatch(page, /inProgress && \(process\.env\.NEXT_PUBLIC_TRIP_CAMERA_ENABLED/);
    const legacy = await readFile(new URL("../app/pengemudi/tugas/[id]/page.tsx", import.meta.url), "utf8");
    assert.match(legacy, /redirect\(`/);
    assert.doesNotMatch(legacy, /DriverBroadcastPanel/);
  });
});
