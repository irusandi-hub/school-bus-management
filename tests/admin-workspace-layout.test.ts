import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";

const adminPages = [
  "app/admin/page.tsx",
  "app/admin/area/page.tsx",
  "app/admin/bus/page.tsx",
  "app/admin/laporan/page.tsx",
  "app/admin/pengemudi/page.tsx",
  "app/admin/penugasan/page.tsx",
  "app/admin/perjalanan/page.tsx",
  "app/admin/rute/page.tsx",
  "app/admin/rute/[id]/page.tsx",
  "app/admin/sekolah/page.tsx",
  "app/admin/siswa/page.tsx",
  "app/admin/siswa/[id]/page.tsx",
  "app/admin/wali/page.tsx",
];

describe("layout bersama halaman Pengelola", () => {
  it("seluruh halaman utama memakai PageHeader dan kerangka Operator yang sama", () => {
    for (const path of adminPages) {
      const source = fs.readFileSync(path, "utf8");
      assert.match(source, /<PageHeader/, `${path} harus memakai PageHeader`);
    }

    const layout = fs.readFileSync("components/operator/OperatorWorkspaceLayout.tsx", "utf8");
    assert.match(layout, /className="topbar"/);
    assert.match(layout, /topbar-context/);
    assert.match(layout, /<AdminNav/);
    assert.match(layout, /<BottomNav/);
    assert.match(layout, /<MobileMenu/);
  });

  it("pemilih area dan ringkasan metrik tidak mendominasi bagian atas", () => {
    const tabs = fs.readFileSync("components/admin/ProjectAreaTabs.tsx", "utf8");
    const dashboard = fs.readFileSync("app/admin/page.tsx", "utf8");
    const reports = fs.readFileSync("app/admin/laporan/page.tsx", "utf8");

    assert.match(tabs, /area-switch/);
    assert.match(tabs, /name="area" value="all"/);
    assert.match(dashboard, /<MetricStrip/);
    assert.match(reports, /<MetricStrip/);
    assert.doesNotMatch(dashboard, /quick-grid|quick-tile|Menu Operator/);
    assert.doesNotMatch(dashboard, /<StatCard/);
  });

  it("CSS menyatukan header, filter, tabel, dan breakpoint ponsel", () => {
    const css = fs.readFileSync("app/workspace-redesign.css", "utf8");

    assert.match(css, /\.operator-shell \.main > \.topbar/);
    assert.match(css, /\.operator-shell \.admin-page-head/);
    assert.match(css, /\.operator-shell \.area-switch/);
    assert.match(css, /\.operator-shell \.metric-strip/);
    assert.match(css, /\.operator-shell \.admin-table th/);
    assert.match(css, /@media \(max-width: 960px\)/);
    assert.match(css, /@media \(max-width: 760px\)/);
    assert.match(css, /@media \(max-width: 430px\)/);
    assert.match(css, /@media \(max-width: 390px\)/);
    assert.match(css, /@media \(max-width: 360px\)/);
  });
});
