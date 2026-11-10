import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";

describe("alur tombol penutupan perjalanan", () => {
  it("CTA header membuka pemeriksaan dan tombol akhir hanya mengakhiri perjalanan", () => {
    const link = fs.readFileSync("components/driver/OpenSafetyCheckLink.tsx", "utf8");
    const panel = fs.readFileSync("components/driver/TripClosePanel.tsx", "utf8");
    const page = fs.readFileSync("app/pengemudi/page.tsx", "utf8");

    assert.match(link, /Akhiri Perjalanan dan Periksa/);
    assert.match(link, /href="#perjalanan-keselamatan"/);
    assert.match(panel, /Pemeriksaan keselamatan wajib/);
    assert.match(panel, /name={check\.name} required/);
    assert.match(panel, />\s*Akhiri Perjalanan\s*</);
    assert.doesNotMatch(panel, /Akhiri Perjalanan dan Periksa Keselamatan/);
    assert.match(page, /<OpenSafetyCheckLink\s*\/>/);
    assert.match(page, /Mulai Perjalanan/);
  });

  it("CSS menjaga tombol membungkus dan tidak memakai lebar tetap", () => {
    const css = fs.readFileSync("app/globals.css", "utf8");
    const block = css.match(/\.ops-start-action,\.ops-end-action\{([^}]*)\}/)?.[1] ?? "";
    const endBlock = css.match(/\.ops-end-action\{([^}]*)\}/)?.[1] ?? "";

    assert.match(block, /width:100%/);
    assert.match(block, /max-width:100%/);
    assert.match(block, /min-width:0/);
    assert.match(block, /white-space:normal/);
    assert.match(block, /overflow-wrap:anywhere/);
    assert.match(css, /\.ops-end-action\{min-height:56px/);
    assert.match(css, /@media\(max-width:400px\)/);
    assert.match(css, /@media\(max-width:759px\)/);
    assert.doesNotMatch(block, /width:\s*\d+px/);
    assert.doesNotMatch(endBlock, /white-space:nowrap/);
  });

  it("menyediakan kontrak untuk lebar 360, 390, 430, 768, 1024, dan 1440 px", () => {
    const widths = [360, 390, 430, 768, 1024, 1440];
    assert.deepEqual(widths, [360, 390, 430, 768, 1024, 1440]);
    const css = fs.readFileSync("app/globals.css", "utf8");
    assert.match(css, /@media\(max-width:400px\)\{[\s\S]*\.ops-end-action/);
    assert.match(css, /\.ops-end-action\{[^}]*font-size:14px/);
  });
});
