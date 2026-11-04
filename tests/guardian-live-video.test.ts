import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveLiveVideoAccess, resolveLiveVideoState, selectLiveTrip } from "../lib/guardian/live.ts";
import { parseLiveStreamConfig, resolveLiveStreamSource } from "../lib/guardian/live-stream.ts";

const inProgress = { status: "in_progress", direction: "morning", startedAt: "2026-11-04T06:00:00.000Z" };
const completed = { status: "completed", direction: "morning", startedAt: "2026-11-04T06:00:00.000Z" };
const scheduled = { status: "scheduled", direction: "morning", startedAt: null };

const stream = { url: "https://stream.example.test/bus-1.m3u8", mimeType: "video/mp4", expiresAt: null };

describe("status akses Live Video", () => {
  it("belum memberikan akses ketika perjalanan belum dimulai", () => {
    assert.equal(resolveLiveVideoState({ trip: scheduled, event: null }), "awaiting-boarding");
    assert.equal(resolveLiveVideoState({ trip: null, event: null }), "awaiting-boarding");
  });

  it("menutup akses ketika anak tercatat turun atau tidak ikut", () => {
    assert.equal(
      resolveLiveVideoState({ trip: inProgress, event: { event_type: "dropped_off" } }),
      "ended",
    );
    assert.equal(resolveLiveVideoState({ trip: inProgress, event: { event_type: "absent" } }), "ended");
    assert.equal(resolveLiveVideoState({ trip: completed, event: { event_type: "boarded" } }), "ended");
  });

  it("membuka akses ketika anak berada di bus, tetapi kamera tetap belum terhubung", () => {
    const state = resolveLiveVideoAccess({
      trip: inProgress,
      event: { event_type: "boarded" },
      stream: null,
    });

    assert.equal(state, "on-board-camera-off");
  });

  it("hanya menampilkan state live ketika sumber siaran tersedia", () => {
    assert.equal(
      resolveLiveVideoAccess({ trip: inProgress, event: { event_type: "boarded" }, stream }),
      "live",
    );
  });

  it("tidak pernah menampilkan live untuk anak yang sudah turun walau stream tersedia", () => {
    assert.equal(
      resolveLiveVideoAccess({ trip: completed, event: { event_type: "boarded" }, stream }),
      "ended",
    );
    assert.equal(
      resolveLiveVideoAccess({ trip: inProgress, event: { event_type: "dropped_off" }, stream }),
      "ended",
    );
  });

  it("memilih perjalanan berlangsung lebih dulu, lalu selesai, lalu terjadwal", () => {
    assert.equal(selectLiveTrip([scheduled, completed, inProgress])?.status, "in_progress");
    assert.equal(selectLiveTrip([scheduled, completed])?.status, "completed");
    assert.equal(selectLiveTrip([scheduled])?.status, "scheduled");
    assert.equal(selectLiveTrip([]), null);
  });
});

describe("kontrak sumber siaran", () => {
  const raw = JSON.stringify({
    "student-1:trip-1": { url: "https://stream.example.test/s1.m3u8", mimeType: "video/mp4" },
    "student-2:trip-2": { url: "http://stream.example.test/s2.m3u8" },
    "student-3:trip-3": { url: "https://stream.example.test/s3.m3u8", expiresAt: "2020-01-01T00:00:00Z" },
  });

  it("mengabaikan konfigurasi yang tidak valid atau bukan HTTPS", () => {
    const config = parseLiveStreamConfig(raw);
    assert.ok(config["student-1:trip-1"]);
    assert.equal(config["student-2:trip-2"], undefined);
    assert.deepEqual(parseLiveStreamConfig("{bukan json"), {});
    assert.deepEqual(parseLiveStreamConfig(undefined), {});
  });

  it("tidak menemukan sumber untuk siswa atau perjalanan lain", () => {
    assert.equal(resolveLiveStreamSource({ studentId: "student-9", tripId: "trip-1", raw }), null);
    assert.equal(resolveLiveStreamSource({ studentId: "student-1", tripId: "trip-9", raw }), null);
    assert.equal(resolveLiveStreamSource({ studentId: "student-1", tripId: null, raw }), null);
    assert.equal(resolveLiveStreamSource({ studentId: "student-1", tripId: "trip-1", raw: "" }), null);
  });

  it("menolak sumber yang sudah kedaluwarsa", () => {
    assert.equal(resolveLiveStreamSource({ studentId: "student-3", tripId: "trip-3", raw }), null);
  });

  it("mengembalikan sumber yang valid untuk siswa dan perjalanan yang cocok", () => {
    const source = resolveLiveStreamSource({ studentId: "student-1", tripId: "trip-1", raw });
    assert.equal(source?.url, "https://stream.example.test/s1.m3u8");
  });
});
