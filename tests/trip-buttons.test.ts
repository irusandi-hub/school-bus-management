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
    assert.match(link, /schoolbus:open-trip-safety/);
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

  it("menampilkan checklist keselamatan dalam overlay dan mempertahankan validasi tombol final", () => {
    const panel = fs.readFileSync("components/driver/TripClosePanel.tsx", "utf8");
    assert.match(panel, /^"use client";/);
    assert.match(panel, /SAFETY_CHECKS\.map/);
    assert.match(panel, /name={check\.name} required={check\.required}/);
    assert.match(panel, /onChange={syncConfirmations}/);
    assert.match(panel, /const allRequiredChecksConfirmed = SAFETY_CHECKS\.every/);
    assert.match(panel, /const requirementsMet = canEndTrip && allRequiredChecksConfirmed && unclearStudents === 0/);
    assert.match(panel, /disabled={!requirementsMet}/);
    assert.match(panel, />\s*Akhiri\s*</);
    assert.match(panel, /Semua penumpang sudah turun/);
    assert.match(panel, /disabled={unclearStudents === 0 && Boolean\(trip\.arrived_at\)}/);
    assert.match(panel, /kecuali yang berstatus Tidak Ikut/);
    assert.match(panel, /role="dialog"/);
    assert.match(panel, /aria-modal="true"/);
    assert.match(panel, /schoolbus:open-trip-safety/);
    assert.match(panel, /initialOpen/);
    assert.match(panel, /router\.replace\(`\/pengemudi\?tugas=/);
    assert.match(panel, /aria-label="Tutup pemeriksaan"/);
    assert.match(panel, /event\.key === "Escape"/);
    assert.doesNotMatch(panel, /arrivalReady/);
    assert.ok(panel.indexOf("if (!trip.arrived_at)") < panel.indexOf("else if (unrecordedNames.length > 0)"));
    assert.match(panel, /Belum bisa diakhiri:/);
    assert.doesNotMatch(panel, /Konfirmasi tiba di sekolah/);
    assert.doesNotMatch(panel, /Catatan pemeriksaan/);
  });

  it("konfirmasi semua penumpang turun divalidasi di server sebelum waktu tiba dicatat", () => {
    const actions = fs.readFileSync("app/pengemudi/actions.ts", "utf8");
    const confirmBlock = actions.slice(actions.indexOf("export async function confirmArrival"), actions.indexOf("function readConfirmation"));
    assert.match(confirmBlock, /studentsToMarkDown/);
    assert.match(confirmBlock, /panel=keselamatan/);
    assert.match(confirmBlock, /event_type: "dropped_off"/);
    assert.match(confirmBlock, /!\["absent", "dropped_off"\]/);
    assert.match(confirmBlock, /recorded_by: ctx\.userId/);
    assert.doesNotMatch(confirmBlock, /stillOnBus\.length > 0/);
  });

  it("riwayat ditampilkan sebagai tab pada dashboard, bukan halaman terpisah", () => {
    const page = fs.readFileSync("app/pengemudi/page.tsx", "utf8");
    const oldHistoryRoute = fs.readFileSync("app/pengemudi/riwayat/page.tsx", "utf8");
    assert.match(page, /tab=riwayat/);
    assert.match(page, /firstParam\(query\.tab\) === "riwayat"/);
    assert.match(page, /Navigasi Pengemudi/);
    assert.match(oldHistoryRoute, /redirect\("\/pengemudi\?tab=riwayat"\)/);
  });

  it("stylesheet redesign hanya dimuat pada layout Pengelola", () => {
    const root = fs.readFileSync("app/layout.tsx", "utf8");
    const operator = fs.readFileSync("components/operator/OperatorWorkspaceLayout.tsx", "utf8");
    assert.doesNotMatch(root, /workspace-redesign\.css/);
    assert.match(operator, /workspace-redesign\.css/);
  });
});
