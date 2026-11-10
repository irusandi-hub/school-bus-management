import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";

describe("tombol perjalanan pengemudi", () => {
  it("mempertahankan layout operasional yang disetujui dan satu aksi utama yang berubah sesuai status", () => {
    const page = fs.readFileSync("app/pengemudi/page.tsx", "utf8");
    const header = fs.readFileSync("components/driver/DriverOpsHeader.tsx", "utf8");
    const link = fs.readFileSync("components/driver/OpenSafetyCheckLink.tsx", "utf8");
    assert.match(page, /<DriverOpsHeader/);
    assert.match(page, /<TripClosePanel/);
    assert.match(page, /<div className="ops-workspace">/);
    assert.match(page, /<OpenSafetyCheckLink \/>/);
    assert.match(page, /Mulai Perjalanan/);
    assert.match(header, /className="ops-head"/);
    assert.doesNotMatch(header, /drive-hero|drive-hero-main|drive-main-action/);
    assert.match(link, /Akhiri Perjalanan/);
    assert.doesNotMatch(link, /Periksa keselamatan|Akhiri Perjalanan dan Periksa/);
  });

  it("mempertahankan checklist keselamatan wajib dan tombol final Akhiri", () => {
    const panel = fs.readFileSync("components/driver/TripClosePanel.tsx", "utf8");
    assert.match(panel, /SAFETY_CHECKS\.map/);
    assert.match(panel, /name={check\.name} required/);
    assert.match(panel, /disabled={!canEndTrip}/);
    assert.match(panel, />\s*Akhiri\s*</);
    assert.doesNotMatch(panel, />\s*Akhiri Perjalanan\s*</);
  });

  it("stylesheet redesign hanya dimuat pada layout Pengelola", () => {
    const root = fs.readFileSync("app/layout.tsx", "utf8");
    const operator = fs.readFileSync("components/operator/OperatorWorkspaceLayout.tsx", "utf8");
    assert.doesNotMatch(root, /workspace-redesign\.css/);
    assert.match(operator, /workspace-redesign\.css/);
  });
});
