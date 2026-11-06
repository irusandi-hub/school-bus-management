import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ABSENCE_REASONS, studentActionSet } from "../lib/driver/student-actions.ts";

describe("tindakan siswa sesuai tahap perjalanan", () => {
  it("menonaktifkan tindakan sebelum perjalanan dimulai dan memberi alasan", () => {
    const actions = studentActionSet({ direction: "morning", status: null, tripStatus: "scheduled", arrived: false });
    assert.equal(actions.canBoard, false);
    assert.equal(actions.canDrop, false);
    assert.equal(actions.canAbsent, false);
    assert.match(actions.hint ?? "", /Mulai perjalanan/);
  });

  it("menonaktifkan tindakan setelah perjalanan selesai dan memberi alasan", () => {
    const actions = studentActionSet({ direction: "morning", status: null, tripStatus: "completed", arrived: true });
    assert.equal(actions.canBoard || actions.canDrop || actions.canAbsent, false);
    assert.match(actions.hint ?? "", /tidak dapat diubah/);
  });

  it("mengaktifkan naik dan tidak ikut untuk siswa yang belum dicatat", () => {
    const actions = studentActionSet({ direction: "morning", status: null, tripStatus: "in_progress", arrived: false });
    assert.equal(actions.canBoard, true);
    assert.equal(actions.canAbsent, true);
    assert.equal(actions.canDrop, false);
  });

  it("tidak menawarkan turun sebelum siswa tercatat naik", () => {
    for (const status of [null, "issue"]) {
      const actions = studentActionSet({ direction: "afternoon", status, tripStatus: "in_progress", arrived: false });
      assert.equal(actions.canDrop, false);
    }
  });

  it("pagi: hanya menawarkan turun di sekolah setelah kedatangan dicatat", () => {
    const beforeArrival = studentActionSet({ direction: "morning", status: "boarded", tripStatus: "in_progress", arrived: false });
    assert.equal(beforeArrival.canDrop, false);
    assert.equal(beforeArrival.canBoard, false);
    assert.match(beforeArrival.hint ?? "", /di bus/);

    const afterArrival = studentActionSet({ direction: "morning", status: "boarded", tripStatus: "in_progress", arrived: true });
    assert.equal(afterArrival.canDrop, true);
    assert.equal(afterArrival.canBoard, false);
    assert.equal(afterArrival.dropLabel, "Turun di sekolah");
  });

  it("sore: menawarkan turun di titik untuk siswa yang sudah naik", () => {
    const actions = studentActionSet({ direction: "afternoon", status: "boarded", tripStatus: "in_progress", arrived: true });
    assert.equal(actions.canDrop, true);
    assert.equal(actions.dropLabel, "Turun di titik");
  });

  it("menonaktifkan semua tindakan untuk status akhir", () => {
    for (const status of ["absent", "dropped_off"]) {
      const actions = studentActionSet({ direction: "morning", status, tripStatus: "in_progress", arrived: true });
      assert.equal(actions.canBoard || actions.canDrop || actions.canAbsent, false);
    }
  });

  it("menyediakan alasan tidak ikut termasuk diantar orang tua", () => {
    assert.deepEqual(
      ABSENCE_REASONS.map((reason) => reason.label),
      ["Tidak hadir", "Tidak ikut bus", "Diantar orang tua ke sekolah"],
    );
  });
});
