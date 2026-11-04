import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildNavigationPlan, navigationDestination } from "../lib/driver/navigation.ts";
import {
  buildDirectionsUrl,
  formatCoordinates,
  googleMapsSearchUrl,
  hasValidCoordinates,
} from "../lib/navigation/external.ts";

const stops = [
  {
    id: "stop-1",
    stop_order: 1,
    stop_name: "Halte Utara",
    latitude: 26.4301,
    longitude: 50.0901,
    is_school: false,
  },
  {
    id: "stop-2",
    stop_order: 2,
    stop_name: "Perumahan Timur",
    latitude: 26.4152,
    longitude: 50.1023,
    is_school: false,
  },
  {
    id: "stop-3",
    stop_order: 3,
    stop_name: "Sekolah Contoh",
    latitude: 26.4208,
    longitude: 50.0812,
    is_school: true,
  },
];

const roster = [
  {
    student_id: "s1",
    stop_id: "stop-1",
    students: { full_name: "Siswa Satu", home_address: "Alamat Satu", pickup_notes: "Depan taman" },
  },
  {
    student_id: "s2",
    stop_id: "stop-2",
    students: { full_name: "Siswa Dua", home_address: null, pickup_notes: null },
  },
];

describe("status titik navigasi", () => {
  it("menandai semua titik menunggu sebelum perjalanan dimulai", () => {
    const plan = buildNavigationPlan({
      stops,
      roster,
      events: [],
      trip: { status: "scheduled", started_at: null, arrived_at: null, completed_at: null },
      direction: "morning",
    });

    assert.equal(plan.started, false);
    assert.equal(plan.target, null);
    assert.deepEqual(
      plan.stops.map((stop) => stop.status),
      ["waiting", "waiting", "waiting"],
    );
    assert.equal(plan.firstStop?.name, "Halte Utara");
    assert.equal(navigationDestination(plan)?.id, "stop-1");
  });

  it("menandai titik berikutnya setelah siswa pada titik sebelumnya dicatat", () => {
    const plan = buildNavigationPlan({
      stops,
      roster,
      events: [{ student_id: "s1", event_type: "boarded", occurred_at: "2026-11-04T06:10:00.000Z" }],
      trip: {
        status: "in_progress",
        started_at: "2026-11-04T06:00:00.000Z",
        arrived_at: null,
        completed_at: null,
      },
      direction: "morning",
    });

    assert.deepEqual(
      plan.stops.map((stop) => stop.status),
      ["done", "heading", "waiting"],
    );
    assert.equal(plan.target?.id, "stop-2");
    assert.equal(navigationDestination(plan)?.name, "Perumahan Timur");
  });

  it("menandai tiba di sekolah hanya setelah kedatangan dikonfirmasi", () => {
    const plan = buildNavigationPlan({
      stops,
      roster,
      events: [
        { student_id: "s1", event_type: "boarded", occurred_at: "2026-11-04T06:10:00.000Z" },
        { student_id: "s2", event_type: "boarded", occurred_at: "2026-11-04T06:20:00.000Z" },
      ],
      trip: {
        status: "in_progress",
        started_at: "2026-11-04T06:00:00.000Z",
        arrived_at: "2026-11-04T06:40:00.000Z",
        completed_at: null,
      },
      direction: "morning",
    });

    assert.deepEqual(
      plan.stops.map((stop) => stop.status),
      ["done", "done", "arrived"],
    );
    assert.equal(plan.target, null);
    assert.equal(navigationDestination(plan), null);
  });

  it("menutup semua titik ketika perjalanan selesai", () => {
    const plan = buildNavigationPlan({
      stops,
      roster,
      events: [],
      trip: {
        status: "completed",
        started_at: "2026-11-04T06:00:00.000Z",
        arrived_at: "2026-11-04T06:40:00.000Z",
        completed_at: "2026-11-04T06:50:00.000Z",
      },
      direction: "morning",
    });

    assert.equal(plan.completed, true);
    assert.equal(plan.target, null);
    assert.equal(navigationDestination(plan), null);
    assert.ok(plan.stops.every((stop) => stop.status === "done"));
  });

  it("memakai sekolah sebagai lokasi awal pada rute sore", () => {
    const plan = buildNavigationPlan({
      stops,
      roster,
      events: [],
      trip: null,
      direction: "afternoon",
    });

    assert.equal(plan.origin.label, "Sekolah");
    assert.equal(plan.origin.latitude, 26.4208);
  });

  it("tidak mengarang lokasi awal ketika data garasi tidak ada", () => {
    const plan = buildNavigationPlan({ stops, roster, events: [], trip: null, direction: "morning" });

    assert.equal(plan.origin.label, "Lokasi awal");
    assert.equal(plan.origin.latitude, null);
    assert.match(plan.origin.detail, /belum dicatat/);
  });

  it("menandai titik tanpa koordinat dan tidak memberi URL navigasi", () => {
    const plan = buildNavigationPlan({
      stops: [{ ...stops[0], latitude: null, longitude: null }],
      roster: [],
      events: [],
      trip: null,
      direction: "morning",
    });

    assert.equal(plan.stops[0].hasCoordinates, false);
    assert.equal(buildDirectionsUrl(plan.stops[0]), null);
    assert.equal(formatCoordinates(plan.stops[0]), null);
    assert.equal(plan.tracking, false);
  });
});

describe("tautan navigasi eksternal", () => {
  it("membuat tautan Google Maps hanya dari koordinat tujuan", () => {
    const url = buildDirectionsUrl({ latitude: 26.4301, longitude: 50.0901 });
    assert.ok(url);
    assert.match(url ?? "", /^https:\/\/www\.google\.com\/maps\/dir\/\?/);
    assert.ok((url ?? "").includes("destination=26.4301%2C50.0901"));
  });

  it("menolak koordinat kosong, bukan angka, dan di luar rentang", () => {
    assert.equal(hasValidCoordinates({ latitude: null, longitude: 50 }), false);
    assert.equal(hasValidCoordinates({ latitude: 91, longitude: 50 }), false);
    assert.equal(hasValidCoordinates({ latitude: 26, longitude: 181 }), false);
    assert.equal(hasValidCoordinates({ latitude: Number.NaN, longitude: 50 }), false);
    assert.equal(buildDirectionsUrl({ latitude: 26, longitude: undefined }), null);
    assert.equal(googleMapsSearchUrl({ latitude: null, longitude: null }), null);
  });
});
