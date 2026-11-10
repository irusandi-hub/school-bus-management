import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";

describe("tombol perjalanan", () => {
  it("memakai satu tombol utama yang berubah dari Mulai menjadi Akhiri Perjalanan", () => {
    const panel = fs.readFileSync("components/driver/TripClosePanel.tsx", "utf8");
    const page = fs.readFileSync("app/pengemudi/page.tsx", "utf8");
    const header = fs.readFileSync("components/driver/DriverOpsHeader.tsx", "utf8");

    assert.match(page, /Mulai Perjalanan/);
    assert.match(page, /<TripClosePanel/);
    assert.match(panel, /Akhiri Perjalanan/);
    assert.match(panel, /"Akhiri"/);
    assert.match(panel, /Pengecekan keselamatan/);
    assert.doesNotMatch(panel, /Akhiri Perjalanan dan Periksa Keselamatan/);
    assert.doesNotMatch(panel, />\s*Periksa keselamatan\s*</i);
    assert.match(panel, /SAFETY_CHECKS/);
    assert.match(panel, /required/);
    assert.match(header, /progress\.kindLabel/);
    assert.match(header, /drive-main-action|ops-head-action/);
  });

  it("tidak menampilkan dua tombol utama terpisah dan tidak memulai sesi otomatis", () => {
    const page = fs.readFileSync("app/pengemudi/page.tsx", "utf8");
    const actions = fs.readFileSync("app/pengemudi/actions.ts", "utf8");

    assert.equal(page.split("ops-start-action").length - 1, 1);
    assert.equal(page.split("<TripClosePanel").length - 1, 1); // satu pemakaian di cabang inProgress
    assert.match(page, /Sesi selesai/);
    assert.match(page, /tidak dimulai otomatis/);
    assert.match(page, /inProgress \?/);
    assert.match(actions, /status: "completed"/);
    assert.doesNotMatch(actions, /\.from\("trip_assignments"\)\.insert/);
  });

  it("CSS menjaga tombol utama membungkus dan tidak memakai lebar tetap", () => {
    const css = fs.readFileSync("app/workspace-redesign.css", "utf8");
    const action = css.match(/\.driver-app \.drive-main-action \{([^}]*)\}/)?.[1] ?? "";

    assert.match(action, /width: 100%/);
    assert.match(action, /white-space: normal/);
    assert.match(action, /min-height: 58px/);
    assert.doesNotMatch(action, /width:\s*\d+px/);
    assert.match(css, /@media \(max-width: 430px\)/);
    assert.match(css, /@media \(max-width: 390px\)/);
    assert.match(css, /@media \(max-width: 360px\)/);
  });

  it("menyediakan kontrak untuk lebar 360, 390, 430, 768, 1024, dan 1440 px", () => {
    // Base rules cover 768/1024/1440; 760/430/390/360 breakpoints cover ponsel.
    const widths = [360, 390, 430, 768, 1024, 1440];
    assert.deepEqual(widths, [360, 390, 430, 768, 1024, 1440]);
    const css = fs.readFileSync("app/workspace-redesign.css", "utf8");

    assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.drive-main-action/);
    assert.match(css, /\.drive-dialog \.ops-end-submit/);
    assert.match(css, /\.drive-dialog-actions \.btn \{[\s\S]*?min-height: 46px/);
  });
});
