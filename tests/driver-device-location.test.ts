import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_DEVICE_ACCURACY_METERS,
  MAX_DEVICE_FIX_AGE_MS,
  validateDeviceLocation,
} from "../lib/driver/device-location.ts";

const NOW = Date.parse("2026-11-07T07:00:00.000Z");

function fix(overrides: Record<string, unknown> = {}) {
  return {
    latitude: -6.2,
    longitude: 106.8167,
    accuracy: 18,
    timestamp: NOW - 2_000,
    ...overrides,
  };
}

describe("validasi GPS HP", () => {
  it("menerima koordinat, akurasi, dan waktu yang sah", () => {
    const result = validateDeviceLocation(fix(), NOW);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.location.latitude, -6.2);
    assert.equal(result.location.longitude, 106.8167);
    assert.equal(result.location.accuracy, 18);
  });

  it("menolak koordinat di luar rentang dan nilai bukan angka", () => {
    assert.deepEqual(validateDeviceLocation(fix({ latitude: 91 }), NOW), {
      ok: false,
      reason: "coordinates",
    });
    assert.deepEqual(validateDeviceLocation(fix({ longitude: -181 }), NOW), {
      ok: false,
      reason: "coordinates",
    });
    assert.deepEqual(validateDeviceLocation(fix({ latitude: "x" }), NOW), {
      ok: false,
      reason: "coordinates",
    });
    assert.deepEqual(validateDeviceLocation(fix({ accuracy: Number.NaN }), NOW), {
      ok: false,
      reason: "accuracy",
    });
  });

  it("menolak akurasi lemah dan sampel lama", () => {
    assert.deepEqual(
      validateDeviceLocation(fix({ accuracy: MAX_DEVICE_ACCURACY_METERS + 1 }), NOW),
      { ok: false, reason: "accuracy" },
    );
    assert.deepEqual(
      validateDeviceLocation(fix({ timestamp: NOW - MAX_DEVICE_FIX_AGE_MS - 1 }), NOW),
      { ok: false, reason: "stale" },
    );
  });

  it("menolak waktu di masa depan yang tidak masuk akal", () => {
    assert.deepEqual(validateDeviceLocation(fix({ timestamp: NOW + 6_000 }), NOW), {
      ok: false,
      reason: "stale",
    });
  });
});
