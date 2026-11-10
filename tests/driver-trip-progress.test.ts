import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildNextStop,
  buildTripProgress,
  isStudentDoneForDirection,
  isStudentPendingForDirection,
  resolveStudentTripStates,
  type ProgressStudent,
  type TripStatusEvent,
} from "../lib/driver/trip-progress.ts";

const stops = [
  ...Array.from({ length: 10 }, (_, index) => ({
    id: `stop-${index + 1}`,
    stop_order: index + 1,
    stop_name: `Titik ${index + 1}`,
    is_school: false,
  })),
  { id: "school", stop_order: 11, stop_name: "Sekolah", is_school: true },
];

function studentsWith(overrides: Record<number, Partial<ProgressStudent>> = {}): ProgressStudent[] {
  return Array.from({ length: 30 }, (_, index) => {
    const number = index + 1;
    return {
      id: `s${number}`,
      name: `Siswa ${number}`,
      stopId: `stop-${Math.floor(index / 3) + 1}`,
      stopOrder: Math.floor(index / 3) + 1,
      stopName: `Titik ${Math.floor(index / 3) + 1}`,
      address: `Alamat ${Math.floor(index / 3) + 1}`,
      status: null,
      statusNotes: null,
      ...overrides[number],
    };
  });
}

/**
 * 30 siswa: 18 sudah dijemput, 8 belum, 4 tidak ikut. Enam titik pertama
 * selesai, titik 7 menjadi tujuan pertama yang masih menunggu.
 */
function pickupScenario(changeStudents: number[] = []): ProgressStudent[] {
  const overrides: Record<number, Partial<ProgressStudent>> = {};
  for (let number = 1; number <= 18; number += 1) overrides[number] = { status: "boarded" };
  // Satu siswa tidak ikut pada masing-masing titik 7–10.
  for (const [index, number] of [19, 22, 25, 28].entries()) {
    overrides[number] = {
      status: "absent",
      statusNotes: index % 2 === 0 ? "Tidak hadir" : "Tidak ikut bus",
    };
  }
  for (const number of changeStudents) overrides[number] = { status: "boarded" };
  return studentsWith(overrides);
}

/** 30 siswa: 18 sudah diantar, 12 masih di kendaraan. */
function deliveryScenario(dropStudent19 = false): ProgressStudent[] {
  const overrides: Record<number, Partial<ProgressStudent>> = {};
  for (let number = 1; number <= 18; number += 1) overrides[number] = { status: "dropped_off" };
  for (let number = 19; number <= 30; number += 1) overrides[number] = { status: "boarded" };
  if (dropStudent19) overrides[19] = { status: "dropped_off" };
  return studentsWith(overrides);
}

describe("papan progres perjalanan", () => {
  it("menghitung 30 siswa penjemputan tanpa mencampur tidak ikut sebagai sudah dijemput", () => {
    const progress = buildTripProgress({
      students: pickupScenario(),
      direction: "morning",
      tripStatus: "in_progress",
    });

    assert.equal(progress.total, 30);
    assert.equal(progress.done, 18);
    assert.equal(progress.waiting, 8);
    assert.equal(progress.absent, 4);
    assert.equal(progress.noShow, 2);
    assert.equal(progress.notRiding, 2);
    assert.equal(progress.onboard, 18);
    assert.equal(progress.processed, 22);
    assert.equal(progress.needsAction, 8);
    assert.equal(progress.percent, 73);
    assert.equal(progress.kind, "pickup");
    assert.equal(progress.kindLabel, "Penjemputan");
    assert.equal(progress.doneLabel, "Sudah dijemput");
    assert.equal(progress.waitingLabel, "Belum dijemput");
  });

  it("memindahkan satu siswa dari belum dijemput ke sudah dijemput", () => {
    const before = buildTripProgress({ students: pickupScenario(), direction: "morning", tripStatus: "in_progress" });
    const after = buildTripProgress({
      students: pickupScenario([20]),
      direction: "morning",
      tripStatus: "in_progress",
    });

    assert.equal(before.done, 18);
    assert.equal(before.waiting, 8);
    assert.equal(before.onboard, 18);
    assert.equal(after.done, 19);
    assert.equal(after.waiting, 7);
    assert.equal(after.onboard, 19);
    assert.equal(after.absent, 4);
    assert.equal(after.processed, 23);
  });

  it("menghitung pengantaran: 18 sudah diantar dan 12 masih di kendaraan", () => {
    const progress = buildTripProgress({
      students: deliveryScenario(),
      direction: "afternoon",
      tripStatus: "in_progress",
    });

    assert.equal(progress.kind, "dropoff");
    assert.equal(progress.done, 18);
    assert.equal(progress.waiting, 12);
    assert.equal(progress.onboard, 12);
    assert.equal(progress.absent, 0);
    assert.equal(progress.processed, 18);
    assert.equal(progress.needsAction, 12);
    assert.equal(progress.percent, 60);
    assert.equal(progress.doneLabel, "Sudah diantar");
    assert.equal(progress.waitingLabel, "Belum diantar");
  });

  it("mengurangi sudah diantar, belum diantar, dan di kendaraan setelah satu siswa turun", () => {
    const before = buildTripProgress({ students: deliveryScenario(), direction: "afternoon", tripStatus: "in_progress" });
    const after = buildTripProgress({
      students: deliveryScenario(true),
      direction: "afternoon",
      tripStatus: "in_progress",
    });

    assert.equal(before.done, 18);
    assert.equal(before.waiting, 12);
    assert.equal(before.onboard, 12);
    assert.equal(after.done, 19);
    assert.equal(after.waiting, 11);
    assert.equal(after.onboard, 11);
    assert.equal(after.processed, 19);
  });

  it("membedakan status per arah tanpa menambah arti status baru", () => {
    assert.equal(isStudentDoneForDirection("boarded", "morning"), true);
    assert.equal(isStudentDoneForDirection("dropped_off", "morning"), true);
    assert.equal(isStudentDoneForDirection("boarded", "afternoon"), false);
    assert.equal(isStudentDoneForDirection("dropped_off", "afternoon"), true);
    assert.equal(isStudentDoneForDirection("absent", "morning"), false);
    assert.equal(isStudentPendingForDirection("absent", "afternoon"), false);
    assert.equal(isStudentPendingForDirection("boarded", "afternoon"), true);
  });

  it("memakai perjalanan yang ditutup lebih awal sebagai tidak memerlukan tindakan", () => {
    const progress = buildTripProgress({
      students: pickupScenario(),
      direction: "morning",
      tripStatus: "completed",
    });

    assert.equal(progress.waiting, 8);
    assert.equal(progress.needsAction, 0);
  });
});

describe("pemberhentian berikutnya", () => {
  it("memilih titik pertama sesuai stop_order, melewati siswa selesai dan tidak ikut", () => {
    const result = buildNextStop({
      stops: [...stops].reverse(),
      students: pickupScenario(),
      direction: "morning",
      tripStatus: "in_progress",
    });

    assert.equal(result.target?.stopId, "stop-7");
    assert.equal(result.target?.order, 7);
    assert.equal(result.target?.count, 2);
    assert.equal(result.target?.kindLabel, "Penjemputan berikutnya");
    assert.equal(result.target?.statusLabel, "Menunggu penjemputan");
    assert.deepEqual(result.target?.students.map((student) => student.name), ["Siswa 20", "Siswa 21"]);
    assert.equal(result.waitingStudents, 8);
    assert.equal(result.allStopsDone, false);
  });

  it("berpindah ke titik berikutnya setelah dua siswa pada titik 7 dicatat", () => {
    const before = buildNextStop({
      stops,
      students: pickupScenario(),
      direction: "morning",
      tripStatus: "in_progress",
    });
    assert.equal(before.target?.stopId, "stop-7");

    const after = buildNextStop({
      stops,
      students: pickupScenario([20, 21]),
      direction: "morning",
      tripStatus: "in_progress",
    });

    assert.equal(after.target?.stopId, "stop-8");
    assert.deepEqual(after.target?.students.map((student) => student.id), ["s23", "s24"]);
    assert.equal(after.waitingStudents, 6);
  });

  it("memakai stop_id, bukan alamat yang mirip, untuk menggabungkan siswa", () => {
    const students = studentsWith({
      1: { address: "Jalan Sama" },
      2: { address: "Jalan Sama", stopId: "stop-2", stopOrder: 2 },
      3: { address: "Jalan Sama", stopId: "stop-1", stopOrder: 1 },
    });
    const result = buildNextStop({ stops, students, direction: "morning", tripStatus: "in_progress" });

    assert.equal(result.target?.stopId, "stop-1");
    assert.deepEqual(result.target?.students.map((student) => student.id), ["s1", "s3"]);
    assert.deepEqual(result.target?.addresses, ["Jalan Sama"]);
  });

  it("memberi alamat kosong tetap tampil sebagai tujuan tanpa mengarang jarak", () => {
    const students = studentsWith();
    const result = buildNextStop({ stops, students, direction: "morning", tripStatus: "in_progress" });

    assert.equal(result.target?.students.length, 3);
    assert.equal(result.target?.addresses.length > 0, true);

    const withoutAddress = buildNextStop({
      stops,
      students: students.map((student) => ({ ...student, address: "" })),
      direction: "morning",
      tripStatus: "in_progress",
    });
    assert.deepEqual(withoutAddress.target?.addresses, []);
    assert.equal(withoutAddress.target?.count, 3);
  });

  it("tidak memakai titik sekolah sebagai pemberhentian berikutnya", () => {
    const onlySchool = studentsWith();
    const result = buildNextStop({
      stops: [{ id: "school", stop_order: 1, stop_name: "Sekolah", is_school: true }],
      students: onlySchool.map((student) => ({ ...student, stopId: "school" })),
      direction: "afternoon",
      tripStatus: "in_progress",
    });

    assert.equal(result.target, null);
    assert.equal(result.allStopsDone, false);
    assert.equal(result.waitingStudents, 30);
  });

  it("menampilkan pesan selesai ketika semua siswa punya hasil akhir", () => {
    const overrides: Record<number, Partial<ProgressStudent>> = {};
    for (let number = 1; number <= 26; number += 1) overrides[number] = { status: "boarded" };
    for (let number = 27; number <= 30; number += 1) overrides[number] = { status: "absent" };
    const finished = buildNextStop({
      stops,
      students: studentsWith(overrides),
      direction: "morning",
      tripStatus: "in_progress",
    });

    assert.equal(finished.target, null);
    assert.equal(finished.allStopsDone, true);
    assert.equal(finished.waitingStudents, 0);
  });

  it("tidak menampilkan tujuan setelah perjalanan dibatalkan atau selesai lebih awal", () => {
    const cancelled = buildNextStop({
      stops,
      students: pickupScenario(),
      direction: "morning",
      tripStatus: "cancelled",
    });
    const early = buildNextStop({
      stops,
      students: pickupScenario(),
      direction: "morning",
      tripStatus: "completed",
    });

    assert.equal(cancelled.target, null);
    assert.equal(cancelled.closedReason, "cancelled");
    assert.equal(cancelled.waitingStudents, 8);
    assert.equal(early.target, null);
    assert.equal(early.closedReason, "completed_early");
  });

  it("mengubah tujuan setelah satu siswa turun pada pengantaran", () => {
    const before = buildNextStop({
      stops,
      students: deliveryScenario(),
      direction: "afternoon",
      tripStatus: "in_progress",
    });
    assert.equal(before.target?.stopId, "stop-7");
    assert.equal(before.target?.count, 3);

    const after = buildNextStop({
      stops,
      students: deliveryScenario(true),
      direction: "afternoon",
      tripStatus: "in_progress",
    });

    assert.equal(after.target?.stopId, "stop-7");
    assert.equal(after.target?.count, 2);
    assert.deepEqual(after.target?.students.map((student) => student.id), ["s20", "s21"]);
    assert.equal(after.waitingStudents, 11);
    assert.equal(after.target?.statusLabel, "Menunggu pengantaran");
  });
});

describe("status terbaru dan event berulang", () => {
  it("memakai event terbaru dan tidak menghitung event berulang dua kali", () => {
    const events: TripStatusEvent[] = [
      { student_id: "s1", event_type: "dropped_off", occurred_at: "2026-11-07T07:00:00.000Z" },
      { student_id: "s1", event_type: "dropped_off", occurred_at: "2026-11-07T07:00:00.000Z" },
      { student_id: "s1", event_type: "boarded", occurred_at: "2026-11-07T06:30:00.000Z" },
      { student_id: "s2", event_type: "issue", occurred_at: "2026-11-07T06:40:00.000Z" },
    ];
    const states = resolveStudentTripStates(events);
    const students = studentsWith({
      1: { status: states.get("s1")?.status ?? null },
      2: { status: states.get("s2")?.status ?? null },
    });
    const progress = buildTripProgress({ students, direction: "afternoon", tripStatus: "in_progress" });

    assert.equal(states.get("s1")?.status, "dropped_off");
    assert.equal(states.get("s2")?.status, null);
    assert.equal(states.get("s2")?.hasIssue, true);
    assert.equal(progress.done, 1);
    assert.equal(progress.onboard, 0);
    assert.equal(progress.waiting, 29);
  });

  it("tidak gagal ketika baris lama tidak memiliki waktu event", () => {
    const events: TripStatusEvent[] = [
      { student_id: "s1", event_type: "boarded", occurred_at: null as unknown as string },
      { student_id: "s2", event_type: "absent", occurred_at: "2026-11-07T07:00:00.000Z" },
    ];
    const states = resolveStudentTripStates(events);
    assert.equal(states.get("s1")?.status, "boarded");
    assert.equal(states.get("s2")?.status, "absent");
  });

  it("mengabaikan event lama yang datang setelah event lebih baru", () => {
    const events: TripStatusEvent[] = [
      { student_id: "s1", event_type: "boarded", occurred_at: "2026-11-07T06:30:00.000Z" },
      { student_id: "s1", event_type: "dropped_off", occurred_at: "2026-11-07T07:00:00.000Z" },
      { student_id: "s1", event_type: "boarded", occurred_at: "2026-11-07T06:40:00.000Z" },
    ];
    const states = resolveStudentTripStates(events);
    assert.equal(states.get("s1")?.status, "dropped_off");
  });
});
