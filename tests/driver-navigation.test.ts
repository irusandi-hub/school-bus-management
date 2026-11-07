import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildFullRoute, buildNavigationPlan, navigationDestination } from "../lib/driver/navigation.ts";
import {
  GOOGLE_MAPS_MAX_STOPS,
  buildDirectionsUrl,
  buildMultiStopDirectionsUrl,
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

  it("pengantaran tetap menunggu setelah siswa naik dan selesai setelah turun", () => {
    const boarded = buildNavigationPlan({
      stops,
      roster,
      events: [{ student_id: "s1", event_type: "boarded", occurred_at: "2026-11-04T13:10:00.000Z" }],
      trip: {
        status: "in_progress",
        started_at: "2026-11-04T13:00:00.000Z",
        arrived_at: null,
        completed_at: null,
      },
      direction: "afternoon",
    });
    assert.deepEqual(
      boarded.stops.map((stop) => stop.status),
      ["heading", "waiting", "done"],
    );
    assert.equal(boarded.target?.id, "stop-1");

    const dropped = buildNavigationPlan({
      stops,
      roster,
      events: [
        { student_id: "s1", event_type: "boarded", occurred_at: "2026-11-04T13:10:00.000Z" },
        { student_id: "s1", event_type: "dropped_off", occurred_at: "2026-11-04T13:20:00.000Z" },
      ],
      trip: {
        status: "in_progress",
        started_at: "2026-11-04T13:00:00.000Z",
        arrived_at: null,
        completed_at: null,
      },
      direction: "afternoon",
    });
    assert.equal(dropped.stops[0].status, "done");
    assert.equal(dropped.target?.id, "stop-2");
  });

  it("tidak memakai catatan kendala sebagai status kehadiran", () => {
    const plan = buildNavigationPlan({
      stops,
      roster,
      events: [
        { student_id: "s1", event_type: "boarded", occurred_at: "2026-11-04T06:10:00.000Z" },
        { student_id: "s1", event_type: "issue", occurred_at: "2026-11-04T06:15:00.000Z" },
      ],
      trip: {
        status: "in_progress",
        started_at: "2026-11-04T06:00:00.000Z",
        arrived_at: null,
        completed_at: null,
      },
      direction: "morning",
    });

    assert.equal(plan.stops[0].students[0].status, "boarded");
    assert.equal(plan.stops[0].students[0].hasIssue, true);
    assert.equal(plan.stops[0].status, "done");
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

describe("rute lengkap satu tombol", () => {
  const startedTrip = {
    status: "in_progress",
    started_at: "2026-11-04T06:00:00.000Z",
    arrived_at: null,
    completed_at: null,
  };

  it("memuat seluruh titik sebelum perjalanan dimulai dan belum mengunci urutan", () => {
    const plan = buildNavigationPlan({ stops, roster, events: [], trip: null, direction: "morning" });
    const route = buildFullRoute(plan, "morning");

    assert.equal(route.locked, false);
    assert.deepEqual(
      route.activeStops.map((entry) => entry.stop.id),
      ["stop-1", "stop-2", "stop-3"],
    );
    assert.equal(route.pendingStudents, 2);
    assert.deepEqual(
      route.mapStops.map((stop) => stop.id),
      ["stop-1", "stop-2", "stop-3"],
    );
  });

  it("melewati titik yang sudah selesai tanpa mengubah urutan titik lain", () => {
    const plan = buildNavigationPlan({
      stops,
      roster,
      events: [{ student_id: "s1", event_type: "boarded", occurred_at: "2026-11-04T06:10:00.000Z" }],
      trip: startedTrip,
      direction: "morning",
    });
    const route = buildFullRoute(plan, "morning");

    assert.equal(route.locked, true);
    assert.deepEqual(
      route.stops.map((entry) => entry.stop.id),
      ["stop-1", "stop-2", "stop-3"],
    );
    assert.equal(route.stops[0].skipReason, "Semua siswa sudah dicatat");
    assert.deepEqual(
      route.activeStops.map((entry) => entry.stop.id),
      ["stop-2", "stop-3"],
    );
    // Sekolah tetap menjadi tujuan terakhir pada rute pagi.
    assert.equal(route.destination?.id, "stop-3");
    assert.equal(route.pendingStudents, 1);
  });

  it("melewati titik yang seluruh siswanya tidak ikut", () => {
    const plan = buildNavigationPlan({
      stops,
      roster,
      events: [{ student_id: "s1", event_type: "absent", occurred_at: "2026-11-04T06:10:00.000Z" }],
      trip: startedTrip,
      direction: "morning",
    });
    const route = buildFullRoute(plan, "morning");

    assert.equal(route.stops[0].skipReason, "Dilewati · semua siswa tidak ikut");
    assert.deepEqual(
      route.activeStops.map((entry) => entry.stop.id),
      ["stop-2", "stop-3"],
    );
    assert.equal(route.pendingStudents, 1);
  });

  it("memisahkan titik tanpa koordinat dan tidak mengirimnya", () => {
    const plan = buildNavigationPlan({
      stops: [stops[0], { ...stops[1], latitude: null, longitude: null }, stops[2]],
      roster,
      events: [],
      trip: null,
      direction: "morning",
    });
    const route = buildFullRoute(plan, "morning");

    assert.deepEqual(
      route.missingCoordinateStops.map((stop) => stop.id),
      ["stop-2"],
    );
    assert.deepEqual(
      route.mapStops.map((stop) => stop.id),
      ["stop-1", "stop-3"],
    );
    assert.equal(buildMultiStopDirectionsUrl(route.missingCoordinateStops), null);
  });

  it("membatasi tautan peta tetapi mempertahankan titik terakhir", () => {
    const many = Array.from({ length: 12 }, (_, index) => ({
      id: `stop-${index + 1}`,
      route_id: "r1",
      stop_order: index + 1,
      stop_name: `Titik ${index + 1}`,
      latitude: 26.4 + index * 0.001,
      longitude: 50.1 + index * 0.001,
      is_school: false,
    }));
    const manyRoster = many.map((stop, index) => ({
      student_id: `s${index + 1}`,
      stop_id: stop.id,
      students: { full_name: `Siswa ${index + 1}`, home_address: null, pickup_notes: null },
    }));

    const plan = buildNavigationPlan({ stops: many, roster: manyRoster, events: [], trip: null, direction: "morning" });
    const route = buildFullRoute(plan, "morning", GOOGLE_MAPS_MAX_STOPS);

    assert.equal(route.mapStops.length, GOOGLE_MAPS_MAX_STOPS);
    assert.equal(route.destination?.id, "stop-12");
    assert.equal(route.omittedStops.length, 8);
    assert.deepEqual(
      route.mapStops.map((stop) => stop.id),
      ["stop-1", "stop-2", "stop-3", "stop-12"],
    );
    const url = buildMultiStopDirectionsUrl(route.mapStops);
    assert.ok(url);
    assert.ok(url?.includes("destination=26.41"));
    // Tiga titik antara, ditambah tujuan akhir = empat titik pada satu tautan demo.
    assert.equal((url?.match(/%7C/g) ?? []).length, 2);
  });

  it("memakai sekolah sebagai titik awal rute sore, bukan tujuan", () => {
    const plan = buildNavigationPlan({ stops, roster, events: [], trip: null, direction: "afternoon" });
    const route = buildFullRoute(plan, "afternoon");

    assert.equal(route.stops[2].skipReason, "Titik awal rute sore");
    assert.deepEqual(
      route.activeStops.map((entry) => entry.stop.id),
      ["stop-1", "stop-2"],
    );
    assert.equal(plan.origin.label, "Sekolah");
  });

  it("menutup navigasi setelah perjalanan selesai", () => {
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
    const route = buildFullRoute(plan, "morning");

    assert.equal(route.activeStops.length, 0);
    assert.equal(route.mapStops.length, 0);
    assert.equal(route.destination, null);
    assert.ok(route.stops.every((entry) => entry.skipReason === "Perjalanan sudah selesai"));
  });
});

describe("tautan navigasi eksternal", () => {
  it("membuat tautan Google Maps hanya dari koordinat tujuan", () => {
    const url = buildDirectionsUrl({ latitude: 26.4301, longitude: 50.0901 });
    assert.ok(url);
    assert.match(url ?? "", /^https:\/\/www\.google\.com\/maps\/dir\/\?/);
    assert.ok((url ?? "").includes("destination=26.4301%2C50.0901"));
  });

  it("mengirim beberapa titik sebagai satu rute sesuai urutan", () => {
    const url = buildMultiStopDirectionsUrl(
      [
        { latitude: 26.4301, longitude: 50.0901 },
        { latitude: 26.4152, longitude: 50.1023 },
        { latitude: 26.4208, longitude: 50.0812 },
      ],
      { latitude: 26.41, longitude: 50.11 },
    );

    assert.ok(url);
    assert.ok(url?.includes("origin=26.41%2C50.11"));
    assert.ok(url?.includes("waypoints=26.4301%2C50.0901%7C26.4152%2C50.1023"));
    assert.ok(url?.includes("destination=26.4208%2C50.0812"));
  });

  it("menolak rute kosong, lebih dari sepuluh titik, atau koordinat tidak lengkap", () => {
    assert.equal(buildMultiStopDirectionsUrl([]), null);
    assert.equal(buildMultiStopDirectionsUrl([{ latitude: null, longitude: 50 }]), null);
    const tooMany = Array.from({ length: 5 }, () => ({ latitude: 26.4, longitude: 50.1 }));
    assert.equal(buildMultiStopDirectionsUrl(tooMany), null);
    assert.equal(GOOGLE_MAPS_MAX_STOPS, 4);
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
