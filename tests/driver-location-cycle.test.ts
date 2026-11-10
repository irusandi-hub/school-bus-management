import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
import { shouldPublishTripLocation, shouldTrackTripLocation } from "../lib/driver/location-cycle.ts";

describe("siklus GPS perjalanan", () => {
  it("aktif selama perjalanan berlangsung, termasuk tanpa siswa naik", () => {
    assert.equal(shouldTrackTripLocation("in_progress"), true);
    assert.equal(shouldTrackTripLocation("scheduled"), false);
    assert.equal(shouldTrackTripLocation("completed"), false);
    assert.equal(shouldTrackTripLocation("cancelled"), false);
    assert.equal(shouldTrackTripLocation(null), false);
  });

  it("tidak bergantung pada status penumpang atau kamera", () => {
    const page = fs.readFileSync("app/pengemudi/page.tsx", "utf8");
    assert.match(page, /shouldTrackTripLocation\(trip\?\.status\)/);
    assert.doesNotMatch(page, /shouldTrackTripLocation\([^)]*(student|roster|camera)/i);
  });

  it("hanya mengirim sampel baru saat online dan memiliki fix", () => {
    const base = {
      tripStatus: "in_progress",
      tripId: "trip-1",
      hasFix: true,
      online: true,
      lastSentTimestamp: 1_000,
      currentTimestamp: 2_000,
    };
    assert.equal(shouldPublishTripLocation(base), true);
    assert.equal(shouldPublishTripLocation({ ...base, tripStatus: "completed" }), false);
    assert.equal(shouldPublishTripLocation({ ...base, tripId: null }), false);
    assert.equal(shouldPublishTripLocation({ ...base, hasFix: false }), false);
    assert.equal(shouldPublishTripLocation({ ...base, online: false }), false);
    assert.equal(shouldPublishTripLocation({ ...base, currentTimestamp: 1_000 }), false);
    assert.equal(shouldPublishTripLocation({ ...base, currentTimestamp: 500 }), false);
    assert.equal(shouldPublishTripLocation({ ...base, currentTimestamp: Number.NaN }), false);
  });
});
