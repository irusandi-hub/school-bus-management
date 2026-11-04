import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveChildJourney } from "../lib/guardian/journey.ts";

const scheduled = {
  status: "scheduled",
  direction: "morning",
  startedAt: null,
  arrivedAt: null,
  completedAt: null,
};

const inProgress = {
  status: "in_progress",
  direction: "morning",
  startedAt: "2026-11-04T06:00:00.000Z",
  arrivedAt: null,
  completedAt: null,
};

const completed = {
  status: "completed",
  direction: "morning",
  startedAt: "2026-11-04T06:00:00.000Z",
  arrivedAt: "2026-11-04T06:40:00.000Z",
  completedAt: "2026-11-04T06:45:00.000Z",
};

describe("status perjalanan wali", () => {
  it("tidak mengarang status ketika belum ada perjalanan", () => {
    const status = resolveChildJourney({ trip: null, event: null });
    assert.equal(status.key, "no-trip");
    assert.equal(status.label, "Belum ada perjalanan");
    assert.equal(status.updatedAt, null);
  });

  it("membedakan perjalanan terjadwal dan yang sudah berjalan tanpa catatan siswa", () => {
    const waiting = resolveChildJourney({ trip: scheduled, event: null });
    assert.equal(waiting.key, "scheduled");
    assert.equal(waiting.label, "Belum dijemput");

    const onTheWay = resolveChildJourney({ trip: inProgress, event: null });
    assert.equal(onTheWay.key, "waiting");
    assert.equal(onTheWay.detail, "Perjalanan sudah berjalan, tetapi anak belum dicatat naik bus.");
  });

  it("menampilkan anak di dalam bus hanya setelah catatan naik pada perjalanan berlangsung", () => {
    const status = resolveChildJourney({
      trip: inProgress,
      event: { event_type: "boarded", occurred_at: "2026-11-04T06:12:00.000Z" },
    });

    assert.equal(status.key, "on-board");
    assert.equal(status.label, "Berada di dalam bus");
    assert.equal(status.tone, "info");
    assert.equal(status.updatedAt, "2026-11-04T06:12:00.000Z");
  });

  it("memakai arah perjalanan untuk konteks naik dan turun", () => {
    const afternoon = { ...inProgress, direction: "afternoon" };
    const onboard = resolveChildJourney({
      trip: afternoon,
      event: { event_type: "boarded" },
    });
    assert.equal(onboard.detail, "Perjalanan menuju rumah sedang berlangsung.");

    const dropped = resolveChildJourney({
      trip: afternoon,
      event: { event_type: "dropped_off" },
    });
    assert.equal(dropped.label, "Sudah turun dari bus");
    assert.equal(dropped.detail, "Anak sudah turun di rumah.");
  });

  it("menandai ketidakhadiran dan perjalanan yang sudah tiba", () => {
    const absent = resolveChildJourney({
      trip: inProgress,
      event: { event_type: "absent" },
    });
    assert.equal(absent.key, "absent");
    assert.equal(absent.tone, "warning");

    const arrived = resolveChildJourney({
      trip: { ...inProgress, arrivedAt: "2026-11-04T06:40:00.000Z" },
      event: { event_type: "boarded" },
    });
    assert.equal(arrived.key, "arrived");
    assert.equal(arrived.label, "Bus sudah tiba");
  });

  it("tidak menyimpulkan kehadiran dari perjalanan yang selesai", () => {
    const noEvent = resolveChildJourney({ trip: completed, event: null });
    assert.equal(noEvent.label, "Perjalanan selesai");
    assert.equal(noEvent.detail, "Kehadiran anak belum dicatat pada perjalanan ini.");
    assert.equal(noEvent.tone, "warning");

    const boarded = resolveChildJourney({
      trip: completed,
      event: { event_type: "boarded" },
    });
    assert.equal(boarded.detail, "Anak tercatat naik bus, tetapi catatan turun belum tersedia.");
  });

  it("menandai data yang tidak konsisten alih-alih menebak", () => {
    const status = resolveChildJourney({
      trip: scheduled,
      event: { event_type: "boarded" },
    });
    assert.equal(status.key, "unknown");
    assert.equal(status.label, "Status perlu diperiksa");
  });
});
