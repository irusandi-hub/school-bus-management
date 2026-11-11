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
    // Tombol utama memakai kelas dan ukuran yang sama saat status berubah.
    assert.match(page, /className="btn ops-primary-action ops-start-action"/);
    assert.match(link, /className="btn ops-primary-action ops-start-action"/);
    assert.doesNotMatch(link, /Periksa keselamatan|Akhiri Perjalanan dan Periksa/);
  });

  it("memakai satu lebar tombol untuk Mulai dan Akhiri di setiap breakpoint", () => {
    const globals = fs.readFileSync("app/globals.css", "utf8");

    assert.match(globals, /\.ops-start-action\{min-height:52px;min-width:167px/);
    assert.match(globals, /\.ops-start-action\{min-height:50px;min-width:158px/);
    assert.match(globals, /\.ops-start-action\{min-width:146px;font-size:12\.5px/);
  });

  it("mempertahankan checklist keselamatan wajib dan tombol final Akhiri yang terkunci", () => {
    const panel = fs.readFileSync("components/driver/TripClosePanel.tsx", "utf8");
    assert.match(panel, /^"use client";/);
    assert.match(panel, /SAFETY_CHECKS\.map/);
    assert.match(panel, /name={check\.name} required/);
    assert.match(panel, /onChange={syncConfirmations}/);
    assert.match(panel, /const allChecksConfirmed = SAFETY_CHECKS\.every/);
    assert.match(panel, /const requirementsMet =\s*canEndTrip && allChecksConfirmed/);
    assert.match(panel, /disabled={!requirementsMet}/);
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
