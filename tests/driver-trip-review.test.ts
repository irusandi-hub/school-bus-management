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

  it("menampilkan status siswa dan pemeriksaan keselamatan tanpa tautan kembali di papan review", () => {
    const page = fs.readFileSync("app/pengemudi/review/[tripId]/page.tsx", "utf8");

    assert.match(page, /\.from\("trip_student_events"\)/);
    assert.match(page, /resolveStudentTripStates/);
    assert.match(page, /SAFETY_CHECKS/);
    assert.match(page, /safety_checked_at/);
    assert.match(page, /student_count_confirmed/);
    assert.doesNotMatch(page, /Kembali ke Halaman Utama Pengemudi/);
    assert.doesNotMatch(page, /href="\/pengemudi"/);
    assert.doesNotMatch(page, /Lihat riwayat perjalanan/);
  });
});

describe("review sebagai overlay dashboard", () => {
  it("memuat dashboard asli di belakang review, termasuk saat URL dibuka langsung", () => {
    const page = fs.readFileSync("app/pengemudi/review/[tripId]/page.tsx", "utf8");
    assert.match(page, /import DriverOperationsPage from "@\/app\/pengemudi\/page"/);
    assert.equal((page.match(/<DriverOperationsPage searchParams=\{Promise.resolve\(\{\}\)\} \/>/g) ?? []).length, 2);
    assert.equal((page.match(/<TripReviewModal>/g) ?? []).length, 2);
    assert.ok(page.indexOf('trip.status !== "completed"') < page.lastIndexOf("<TripReviewModal>"));
  });

  it("X dan Escape menuju dashboard secara langsung tanpa navigasi kembali", () => {
    const modal = fs.readFileSync("components/driver/TripReviewModal.tsx", "utf8");
    assert.match(modal, /router.replace\("\/pengemudi"\)/);
    assert.match(modal, /router.refresh\(\)/);
    assert.doesNotMatch(modal, /router.back\(/);
    assert.match(modal, /aria-label="Tutup review dan kembali ke halaman utama Pengemudi"/);
    assert.match(modal, /onClick=\{closeReview\}/);
    assert.match(modal, /onCancel=/);
    assert.match(modal, /showModal\(\)/);
    assert.match(modal, /autoFocus/);
    const css = fs.readFileSync("components/driver/TripReviewModal.module.css", "utf8");
    assert.match(css, /width: min\(720px/);
    assert.match(css, /max-height: min\(78dvh, 720px\)/);
    assert.match(css, /height: fit-content/);
    assert.match(css, /justify-content: flex-end/);
    assert.match(css, /::backdrop/);
  });
});
