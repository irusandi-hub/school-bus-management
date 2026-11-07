import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  compareStudentsByRouteOrder,
  orderStudentsByRouteOrder,
} from "../lib/driver/student-order.ts";

type Student = {
  name: string;
  stopOrder: number;
  admissionsNumber: string | null;
};

function names(students: Student[]): string[] {
  return students.map((student) => student.name);
}

describe("urutan siswa mengikuti rute", () => {
  it("mengurutkan per stop_order, bukan urutan query atau nama", () => {
    const students: Student[] = [
      { name: "C", stopOrder: 2, admissionsNumber: "003" },
      { name: "E", stopOrder: 3, admissionsNumber: "005" },
      { name: "A", stopOrder: 1, admissionsNumber: "001" },
      { name: "D", stopOrder: 3, admissionsNumber: "004" },
      { name: "B", stopOrder: 1, admissionsNumber: "002" },
    ];

    assert.deepEqual(names(orderStudentsByRouteOrder(students)), ["A", "B", "C", "D", "E"]);
  });

  it("mengelompokkan stop_id yang sama dan stabil di dalam kelompok", () => {
    const students: Student[] = [
      { name: "B", stopOrder: 1, admissionsNumber: "010" },
      { name: "A", stopOrder: 1, admissionsNumber: "002" },
      { name: "C", stopOrder: 2, admissionsNumber: "001" },
    ];

    assert.deepEqual(names(orderStudentsByRouteOrder(students)), ["A", "B", "C"]);
    assert.deepEqual(
      names(orderStudentsByRouteOrder([...students].reverse())),
      ["A", "B", "C"],
    );
  });

  it("memakai nomor induk numerik sebagai kunci stabil, bukan nama", () => {
    const students: Student[] = [
      { name: "Ahmad", stopOrder: 1, admissionsNumber: "9" },
      { name: "Budi", stopOrder: 1, admissionsNumber: "10" },
      { name: "Citra", stopOrder: 1, admissionsNumber: "2" },
    ];

    assert.deepEqual(names(orderStudentsByRouteOrder(students)), ["Citra", "Ahmad", "Budi"]);
    assert.ok(
      compareStudentsByRouteOrder(
        { stopOrder: 1, admissionsNumber: "2" },
        { stopOrder: 1, admissionsNumber: "10" },
      ) < 0,
    );
  });

  it("mengikuti stop_order terbaru setelah rute diubah", () => {
    const before: Student[] = [
      { name: "A", stopOrder: 1, admissionsNumber: "001" },
      { name: "B", stopOrder: 1, admissionsNumber: "002" },
      { name: "C", stopOrder: 2, admissionsNumber: "003" },
      { name: "D", stopOrder: 3, admissionsNumber: "004" },
      { name: "E", stopOrder: 3, admissionsNumber: "005" },
    ];
    const after = before.map((student) =>
      student.name === "C" ? { ...student, stopOrder: 0 } : student,
    );

    assert.deepEqual(names(orderStudentsByRouteOrder(before)), ["A", "B", "C", "D", "E"]);
    assert.deepEqual(names(orderStudentsByRouteOrder(after)), ["C", "A", "B", "D", "E"]);
  });

  it("tidak mengubah array masukan", () => {
    const students: Student[] = [
      { name: "B", stopOrder: 2, admissionsNumber: "002" },
      { name: "A", stopOrder: 1, admissionsNumber: "001" },
    ];
    const ordered = orderStudentsByRouteOrder(students);

    assert.deepEqual(names(students), ["B", "A"]);
    assert.notEqual(ordered, students);
  });
});
