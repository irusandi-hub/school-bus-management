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
    assert.match(layout, /groups={adminGroups}/);
    assert.match(layout, /signOutAction/);
    assert.match(layout, /className="topbar-brand"/);
    // Header dibersihkan: tanpa menu hamburger dan tanpa avatar bulat di samping Keluar.
    assert.doesNotMatch(layout, /MobileMenu|menu-trigger|account-avatar|account-chip/);

    // Semua tujuan sidebar tetap terjangkau di ponsel lewat tombol Menu di navigasi bawah.
    const bottomNav = fs.readFileSync("components/ui/BottomNav.tsx", "utf8");
    assert.match(bottomNav, /groups\?: NavGroup\[\]/);
    assert.match(bottomNav, /className="mobile-nav-menu"/);
    assert.match(bottomNav, /className="menu-sheet"/);
    assert.match(bottomNav, /groups\.map/);
    assert.match(bottomNav, /aria-modal="true"/);
    assert.doesNotMatch(bottomNav, /menu-trigger|aria-label="Buka menu navigasi"/);

    const css = fs.readFileSync("app/workspace-redesign.css", "utf8");
    assert.match(css, /\.operator-shell \.topbar-brand \{\s*display: none;/);
    assert.match(
      css,
      /@media \(max-width: 960px\) \{\s*\.operator-shell \.topbar-brand \{\s*display: inline-flex;/,
    );
  });

  it("memakai satu identitas SchoolBus di header Pengelola, Operator, Pengemudi, dan Wali", () => {
    const logo = fs.readFileSync("components/brand-logo.tsx", "utf8");
    const operator = fs.readFileSync("components/operator/OperatorWorkspaceLayout.tsx", "utf8");
    const driver = fs.readFileSync("app/pengemudi/layout.tsx", "utf8");
    const guardian = fs.readFileSync("app/wali/layout.tsx", "utf8");
    const favicon = fs.readFileSync("public/assets/landing/favicon.svg", "utf8");
    const asset = fs.readFileSync("public/assets/landing/logo-schoolbus.svg", "utf8");

    assert.match(logo, /School<span>Bus<\/span>/);
    assert.match(logo, /#0F1B3D/);
    assert.match(logo, /#F5C542/);
    // Referensi: bus gold, penanda lokasi gold, dan jalur perjalanan putih.
    assert.match(logo, /M11\.2 21\.4/);
    assert.match(logo, /M38\.2 11\.6/);
    assert.match(logo, /M4\.6 44\.2/);
    assert.match(logo, /stroke="#FFFFFF"/);
    assert.match(favicon, /#0F1B3D/);
    assert.match(favicon, /#F5C542/);
    assert.match(asset, /viewBox="0 0 48 48"/);
    assert.match(asset, /#0F1B3D/);
    assert.doesNotMatch(logo, /stroke="#F6C51C"|fill="#101B3B"/);

    for (const shell of [operator, driver, guardian]) {
      assert.match(shell, /<BrandLogo/);
    }
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

  it("menampilkan navigasi bawah dan seluruh tujuan Operator sampai 960px", () => {
    const css = fs.readFileSync("app/workspace-redesign.css", "utf8");
    const nav = fs.readFileSync("components/ui/nav-config.ts", "utf8");

    assert.match(css, /@media \(max-width: 960px\) \{\s*\.operator-shell \.mobile-nav \{\s*display: flex;/);
    assert.match(css, /\.operator-shell \.mobile-nav > a,\s*\.operator-shell \.mobile-nav > button \{/);
    const destinations = [...nav.matchAll(/href: "([^"]+)", label: "([^"]+)"/g)];
    assert.ok(destinations.length >= 11, "seluruh tujuan sidebar harus tersedia di menu");
  });
});
