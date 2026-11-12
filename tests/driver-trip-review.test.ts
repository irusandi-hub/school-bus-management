import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";

describe("review perjalanan pengemudi", () => {
  it("mengarahkan perjalanan yang selesai ke halaman review, bukan langsung ke dashboard", () => {
    const actions = fs.readFileSync("app/pengemudi/actions.ts", "utf8");
    const reviewRedirect = actions.match(/backTo\(\s*`\/pengemudi\/review\/\$\{encodeURIComponent\(tripId\)\}`/);

    assert.ok(reviewRedirect, "endTrip harus mengarah ke /pengemudi/review/<tripId>");
    assert.doesNotMatch(actions, /backTo\("\/pengemudi", "Perjalanan selesai/);
  });

  it("hanya membaca perjalanan selesai yang dimiliki pengemudi", () => {
    const page = fs.readFileSync("app/pengemudi/review/[tripId]/page.tsx", "utf8");

    assert.match(page, /requireDriver/);
    assert.match(page, /\.from\("trips"\)/);
    assert.match(page, /\.eq\("id", tripId\)/);
    assert.match(page, /trip\.trip_assignments\?\.driver_id !== access\.driver\.id/);
    assert.match(page, /trip\.status !== "completed"/);
    assert.match(page, /notFound\(\)/);
  });

  it("menampilkan status siswa, pemeriksaan keselamatan, dan tombol kembali ke dashboard", () => {
    const page = fs.readFileSync("app/pengemudi/review/[tripId]/page.tsx", "utf8");

    assert.match(page, /\.from\("trip_student_events"\)/);
    assert.match(page, /resolveStudentTripStates/);
    assert.match(page, /SAFETY_CHECKS/);
    assert.match(page, /safety_checked_at/);
    assert.match(page, /student_count_confirmed/);
    assert.match(page, /Kembali ke Halaman Utama Pengemudi/);
    assert.match(page, /href="\/pengemudi"/);
    assert.match(page, /Lihat riwayat perjalanan/);
  });
});
