import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isCompletedAssignment,
  selectDriverAssignment,
} from "../lib/driver/assignment-selection.ts";

function assignment(id: string, status: string) {
  return { id, trips: [{ status }] };
}

describe("pemilihan tugas aktif Pengemudi", () => {
  it("tidak pernah memilih tugas yang perjalanannya sudah selesai", () => {
    assert.equal(isCompletedAssignment(assignment("selesai", "completed")), true);
    assert.equal(selectDriverAssignment([assignment("selesai", "completed")]), null);
  });

  it("melewati tugas selesai dan memilih tugas terjadwal berikutnya", () => {
    const selected = selectDriverAssignment(
      [assignment("selesai", "completed"), assignment("berikutnya", "scheduled")],
      "selesai",
    );
    assert.equal(selected?.id, "berikutnya");
  });

  it("mengutamakan perjalanan berlangsung lalu tugas terjadwal", () => {
    assert.equal(
      selectDriverAssignment([
        assignment("terjadwal", "scheduled"),
        assignment("berjalan", "in_progress"),
      ])?.id,
      "berjalan",
    );
    assert.equal(
      selectDriverAssignment([assignment("terjadwal", "scheduled")])?.id,
      "terjadwal",
    );
  });
});

describe("tugas setelah review pagi ditutup", () => {
  it("tetap memilih penjemputan sore tanpa menghapus riwayat atau membuat tugas", () => {
    const assignments = [
      { ...assignment("pagi-selesai", "completed"), direction: "morning" },
      { ...assignment("jemput-sore", "scheduled"), direction: "afternoon" },
    ];
    const before = structuredClone(assignments);
    const selected = selectDriverAssignment(assignments);
    assert.equal(selected?.id, "jemput-sore");
    assert.equal(selected?.direction, "afternoon");
    assert.deepEqual(assignments, before);
  });
});
