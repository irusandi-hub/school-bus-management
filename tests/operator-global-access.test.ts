import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { homeForRole, scopedNext } from "../lib/paths.ts";

describe("arsitektur akses tiga ekosistem", () => {
  it("mengarahkan role operator dan admin legacy ke satu ruang kerja Operator", () => {
    assert.equal(homeForRole("operator"), "/operator");
    assert.equal(homeForRole("admin"), "/operator");
  });

  it("tetap memisahkan beranda Pengemudi dan Orang Tua/Wali", () => {
    assert.equal(homeForRole("driver"), "/pengemudi");
    assert.equal(homeForRole("parent"), "/wali");
  });

  it("hanya menerima tujuan login di dalam ruang kerja role terkait", () => {
    assert.equal(scopedNext("operator", "/operator/siswa"), "/operator/siswa");
    assert.equal(scopedNext("operator", "/admin/siswa"), "/operator");
    assert.equal(scopedNext("driver", "/wali"), "/pengemudi");
    assert.equal(scopedNext("parent", "/wali/riwayat"), "/wali/riwayat");
  });
});
