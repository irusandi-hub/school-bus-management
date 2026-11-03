import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assignmentConflict, type AssignmentRow } from "../lib/operator/assignment.ts";

const existing: AssignmentRow[] = [
  {
    id: "assignment-1",
    driver_id: "driver-1",
    bus_id: "bus-1",
    service_date: "2026-11-03",
  },
];

describe("aturan penugasan operator", () => {
  it("mengizinkan kombinasi pengemudi dan bus yang belum dipakai pada tanggal itu", () => {
    const conflict = assignmentConflict({
      driverId: "driver-2",
      busId: "bus-2",
      serviceDate: "2026-11-03",
      existing,
    });
    assert.equal(conflict, null);
  });

  it("menolak pengemudi yang sudah ditugaskan pada tanggal yang sama", () => {
    const conflict = assignmentConflict({
      driverId: "driver-1",
      busId: "bus-2",
      serviceDate: "2026-11-03",
      existing,
    });
    assert.equal(conflict, "driver");
  });

  it("menolak bus yang sudah dipakai pada tanggal yang sama", () => {
    const conflict = assignmentConflict({
      driverId: "driver-2",
      busId: "bus-1",
      serviceDate: "2026-11-03",
      existing,
    });
    assert.equal(conflict, "bus");
  });

  it("tidak menolak penugasan yang sama pada tanggal berbeda", () => {
    const conflict = assignmentConflict({
      driverId: "driver-1",
      busId: "bus-1",
      serviceDate: "2026-11-04",
      existing,
    });
    assert.equal(conflict, null);
  });

  it("mengizinkan penugasan pertama saat belum ada jadwal pada tanggal itu", () => {
    const conflict = assignmentConflict({
      driverId: "driver-1",
      busId: "bus-1",
      serviceDate: "2026-11-03",
      existing: [],
    });
    assert.equal(conflict, null);
  });
});
