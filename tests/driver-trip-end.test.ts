import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateTripEnd, SAFETY_CHECKS, unrecordedStudents } from "../lib/driver/trip-end.ts";

const allConfirmed = Object.fromEntries(SAFETY_CHECKS.map((check) => [check.name, true])) as Record<
  (typeof SAFETY_CHECKS)[number]["name"],
  boolean
>;

const base = {
  status: "in_progress",
  arrivedAt: "2026-11-02T06:40:00.000Z",
  rosterStudentIds: ["s1", "s2"],
  recordedStudentIds: ["s1", "s2"],
  confirmations: { ...allConfirmed },
  notes: "",
};

describe("aturan mengakhiri perjalanan", () => {
  it("menolak perjalanan yang belum berjalan", () => {
    const result = evaluateTripEnd({ ...base, status: "scheduled" });
    assert.equal(result.ok, false);
    assert.match(result.problems[0], /belum berjalan atau sudah selesai/);
  });

  it("menolak perjalanan yang sudah selesai", () => {
    const result = evaluateTripEnd({ ...base, status: "completed" });
    assert.equal(result.ok, false);
    assert.match(result.problems[0], /belum berjalan atau sudah selesai/);
  });

  it("menolak bila kedatangan di sekolah belum dikonfirmasi", () => {
    const result = evaluateTripEnd({ ...base, arrivedAt: null });
    assert.equal(result.ok, false);
    assert.match(result.problems[0], /kedatangan di sekolah/);
  });

  it("menolak bila masih ada siswa tanpa catatan status", () => {
    const result = evaluateTripEnd({ ...base, recordedStudentIds: ["s1"] });
    assert.equal(result.ok, false);
    assert.match(result.problems[0], /1 siswa/);
    assert.deepEqual(result.unrecordedStudentIds, ["s2"]);
  });

  it("menolak bila pemeriksaan keselamatan belum lengkap", () => {
    const result = evaluateTripEnd({ ...base, confirmations: { ...allConfirmed, safety_headcount_ok: false } });
    assert.equal(result.ok, false);
    assert.match(result.problems[0], /Pemeriksaan keselamatan belum lengkap/);
    assert.match(result.problems[0], /Kabin sudah diperiksa/);
  });

  it("mewajibkan konfirmasi kabin kosong dan tidak mewajibkan konfirmasi barang tertinggal", () => {
    const uncheckedCabin = evaluateTripEnd({
      ...base,
      confirmations: { ...allConfirmed, safety_cabin_clear: false },
    });
    assert.equal(uncheckedCabin.ok, false);
    assert.match(uncheckedCabin.problems[0], /Kabin sudah diperiksa/);

    const belongingsNotAcknowledged = evaluateTripEnd({
      ...base,
      confirmations: { ...allConfirmed, safety_belongings_secured: false },
    });
    assert.equal(belongingsNotAcknowledged.ok, true);
  });
  });

  it("menerima perjalanan yang lengkap dan menyimpan catatan", () => {
    const result = evaluateTripEnd({ ...base, notes: "  Lampu kabin kanan diganti.  " });
    assert.equal(result.ok, true);
    assert.equal(result.studentCount, 2);
    assert.equal(result.notes, "Lampu kabin kanan diganti.");
  });

  it("mengosongkan catatan yang hanya berisi spasi", () => {
    const result = evaluateTripEnd({ ...base, notes: "   " });
    assert.equal(result.ok, true);
    assert.equal(result.notes, null);
  });

  it("menghitung siswa yang belum tercatat tanpa duplikasi", () => {
    assert.deepEqual(unrecordedStudents(["a", "b", "c"], ["b", "b"]), ["a", "c"]);
  });
});
