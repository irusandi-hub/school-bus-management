import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
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


describe("batas perubahan peran Operator dan Pengemudi", () => {
  const migration = readFileSync(
    new URL("../supabase/migrations/20261109000000_unified_operator_global_authority.sql", import.meta.url),
    "utf8",
  );

  it("melindungi akun Operator Utama dari penautan sebagai Pengemudi", () => {
    assert.match(migration, /p\.role in \('admin', 'operator'\)/);
  });

  it("menegakkan satu identitas global lintas role admin dan operator", () => {
    assert.match(migration, /create unique index if not exists profiles_single_global_operator_idx[\s\S]*where role in \\('admin', 'operator'\\)/);
  });

  it("melindungi semua akun Wali, termasuk tautan wali yang nonaktif, dari demosi menjadi Pengemudi", () => {
    assert.match(migration, /p\.role = 'parent'/);
    assert.match(migration, /from public\.guardians g where g\.profile_id = v_uid/);
    assert.doesNotMatch(migration, /g\.profile_id = v_uid and g\.active/);
  });
});


describe("login Operator global", () => {
  const authActions = readFileSync(
    new URL("../lib/auth-actions.ts", import.meta.url),
    "utf8",
  );
  it("does not require a company row before entering the global workspace", () => {
    const start = authActions.indexOf('if (role === "operator")');
    const end = authActions.indexOf('if (role === "driver")', start);
    const operatorBranch = authActions.slice(start, end);
    assert.match(operatorBranch, /redirect\(scopedNext\("operator", requestedNext\)\)/);
    assert.doesNotMatch(operatorBranch, /from\("operators"\)|profile_id|operator-belum-tertaut/);
  });
});


describe("aktivasi akun sesuai role", () => {
  const passwordPage = readFileSync(
    new URL("../app/akun/kata-sandi/page.tsx", import.meta.url),
    "utf8",
  );
  it("mengarahkan semua profil aktif ke beranda rolenya, bukan form aktivasi wali", () => {
    assert.match(passwordPage, /if \(viewer\.profile\) redirect\(homeForRole\(viewer\.profile\.role\)\)/);
  });
});
