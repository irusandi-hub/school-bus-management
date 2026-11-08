import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { studentReadFilters, studentInScope } from "../app/operator/siswa/read-filters.ts";

describe("pembacaan siswa Pengelola", () => {
  it("membatasi filter dan membuang wildcard nama", () => {
    assert.deepEqual(studentReadFilters({ q: "  A%_\\  ", status: "anything", school: "other" }), { q: "A", status: "", school: "" });
    assert.equal(studentReadFilters({ q: "x".repeat(200), status: "inactive" }).q.length, 120);
  });
  it("menolak sekolah di luar organisasi dan sekolah kosong", () => {
    assert.equal(studentInScope("school-b", ["school-a"]), false);
    assert.equal(studentInScope(null, ["school-a"]), false);
    assert.equal(studentInScope("school-a", ["school-a"]), true);
  });
});
