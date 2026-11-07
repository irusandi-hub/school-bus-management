import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GUARDIAN_LOCATION_MAX_AGE_MS,
  resolveGuardianLocationView,
  type GuardianLocationPayload,
} from "../lib/guardian/driver-location.ts";

const NOW = Date.parse("2026-11-07T08:00:00.000Z");

function payload(overrides: Partial<GuardianLocationPayload> = {}): GuardianLocationPayload {
  return {
    tripStatus: "in_progress",
    latitude: -6.2,
    longitude: 106.8167,
    accuracyMeters: 18,
    recordedAt: new Date(NOW - 2_000).toISOString(),
    isFresh: true,
    ...overrides,
  };
}

function view(overrides: Partial<Parameters<typeof resolveGuardianLocationView>[0]> = {}) {
  return resolveGuardianLocationView({
    tripId: "00000000-0000-0000-0000-000000000b01",
    tripStatus: "in_progress",
    payload: payload(),
    now: NOW,
    ...overrides,
  });
}

describe("tampilan lokasi GPS pengemudi untuk wali", () => {
  it("menampilkan marker hanya ketika sampel baru dan perjalanan aktif", () => {
    const result = view();
    assert.equal(result.state, "live");
    assert.deepEqual(result.location, { latitude: -6.2, longitude: 106.8167, accuracy: 18 });
    assert.match(result.updatedLabel, /^Diperbarui /);
    assert.equal(result.connectionIssue, false);
  });

  it("mempertahankan waktu terakhir tetapi menyembunyikan koordinat lama", () => {
    const result = view({
      payload: payload({
        recordedAt: new Date(NOW - GUARDIAN_LOCATION_MAX_AGE_MS - 1_000).toISOString(),
      }),
    });
    assert.equal(result.state, "stale");
    assert.equal(result.location, null);
    assert.match(result.updatedLabel, /^Terakhir /);
  });

  it("menandai koneksi terputus tanpa menghapus lokasi yang masih baru", () => {
    const result = view({ connectionError: true });
    assert.equal(result.state, "live");
    assert.equal(result.connectionIssue, true);
    assert.ok(result.location);
    assert.match(result.updatedLabel, /^Koneksi terputus · /);
  });

  it("membedakan belum ada perjalanan, perjalanan terjadwal, dan perjalanan selesai", () => {
    assert.equal(view({ tripId: null, payload: null, tripStatus: null }).state, "unavailable");
    assert.equal(view({ payload: null, tripStatus: "scheduled" }).state, "scheduled");
    const ended = view({
      payload: payload({ tripStatus: "completed", isFresh: false }),
      tripStatus: "completed",
    });
    assert.equal(ended.state, "ended");
    assert.equal(ended.location, null);
  });

  it("menampilkan status offline, memuat, dan belum tersedia secara terpisah", () => {
    assert.equal(view({ payload: null, connectionError: true }).state, "offline");
    assert.equal(view({ payload: null, loading: true }).state, "loading");
    assert.equal(view({ payload: payload({ latitude: null, longitude: null, recordedAt: null }) }).state, "unavailable");
  });

  it("menolak koordinat tidak valid dan sampel dari masa depan yang terlalu jauh", () => {
    assert.equal(view({ payload: payload({ latitude: 91 }) }).location, null);
    assert.equal(view({ payload: payload({ longitude: 181 }) }).location, null);
    assert.equal(
      view({ payload: payload({ recordedAt: new Date(NOW + 6_000).toISOString() }) }).location,
      null,
    );
  });

  it("tidak menampilkan lokasi ketika payload sudah menyatakan tidak baru", () => {
    const result = view({ payload: payload({ isFresh: false }) });
    assert.equal(result.location, null);
    assert.equal(result.state, "stale");
  });
});
