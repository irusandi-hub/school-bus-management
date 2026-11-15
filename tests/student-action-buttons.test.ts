import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
import { messages } from "../lib/i18n/messages.ts";

describe("tombol tindakan siswa", () => {
  it("menampilkan label selesai yang tepat untuk Naik, Turun, dan Tidak Ikut", () => {
    const controls = fs.readFileSync("components/driver/StudentStatusControls.tsx", "utf8");

    assert.match(controls, /doneLabel=\{t\("boardDone"\)\}/);
    assert.match(controls, /doneLabel=\{t\("dropDone"\)\}/);
    assert.match(controls, /doneLabel=\{t\("absentDone"\)\}/);
    assert.equal(messages.id.boardDone, "Naik — selesai");
    assert.equal(messages.id.dropDone, "Turun — selesai");
    assert.equal(messages.id.absentDone, "Tidak Ikut — selesai");
    assert.match(controls, /done=\{status === "boarded"\}/);
    assert.match(controls, /done=\{status === "dropped_off"\}/);
    assert.match(controls, /done=\{status === "absent"\}/);
    assert.match(controls, /aria-pressed=\{done\}/);
    assert.match(controls, /name="check"/);
    assert.match(controls, /ops-action \$\{kind\}\$\{done \? " is-done" : ""\}/);
  });

  it("memberi respons pending pada form yang diklik tanpa reload halaman", () => {
    const controls = fs.readFileSync("components/driver/StudentStatusControls.tsx", "utf8");

    assert.match(controls, /useFormStatus/);
    assert.match(controls, /pending \? t\("saving"\) : done \? doneLabel : label/);
    assert.equal(messages.id.saving, "Menyimpan…");
    assert.match(controls, /disabled=\{pending\}/);
    assert.match(controls, /aria-busy=\{pending\}/);
    assert.doesNotMatch(controls, /window\.location|location\.reload|router\.refresh/);
  });

  it("memakai status tersimpan saat halaman dimuat dan hanya mengubahnya setelah sukses", () => {
    const controls = fs.readFileSync("components/driver/StudentStatusControls.tsx", "utf8");
    const page = fs.readFileSync("app/pengemudi/page.tsx", "utf8");
    const effect = controls.match(/useEffect\(\(\) => \{([\s\S]*?)\}, \[state, t\]\)/)?.[1] ?? "";

    assert.match(controls, /useState<string \| null>\(initialStatus\)/);
    assert.match(page, /status: state\?\.status \?\? null/);
    assert.match(effect, /state\.status !== "success"/);
    assert.match(effect, /setStatus\(state\.eventType\)/);
    assert.doesNotMatch(effect, /error/);
  });

  it("memuat gaya indikator selesai dari stylesheet yang benar-benar dipakai halaman Pengemudi", () => {
    // globals.css dimuat oleh root layout untuk seluruh area, termasuk Pengemudi.
    const globals = fs.readFileSync("app/globals.css", "utf8");
    const root = fs.readFileSync("app/layout.tsx", "utf8");
    const redesign = fs.readFileSync("app/workspace-redesign.css", "utf8");
    const operator = fs.readFileSync("components/operator/OperatorWorkspaceLayout.tsx", "utf8");
    const indicator = globals.match(/\.driver-app \.ops-workspace \.ops-action\.is-done,[\s\S]*?\}/)?.[0] ?? "";

    assert.match(root, /import "\.\/globals\.css"/);
    // workspace-redesign.css hanya dimuat layout Operator, jadi bukan tempat aturan Pengemudi.
    assert.match(operator, /workspace-redesign\.css/);
    assert.doesNotMatch(redesign, /ops-action\.is-done/);
    assert.match(indicator, /border-color:#176B55/);
    assert.match(indicator, /background:#E7F4EE/);
    assert.match(indicator, /color:#14513E/);
    assert.match(indicator, /opacity:1/);
    assert.doesNotMatch(indicator, /min-height|width:|padding:|font-size:/);
  });
});
