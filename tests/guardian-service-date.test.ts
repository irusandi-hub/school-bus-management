import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { todayDate } from "../lib/guardian/data.ts";

describe("tanggal layanan portal wali", () => {
  it("memakai tanggal Riyadh, bukan tanggal UTC server", () => {
    // 21:30 UTC sudah tanggal berikutnya di Riyadh (UTC+3).
    assert.equal(todayDate(new Date("2026-11-09T21:30:00.000Z")), "2026-11-10");
  });

  it("tetap pada tanggal Riyadh sebelum tengah malam Riyadh", () => {
    // 20:30 UTC masih tanggal yang sama di Riyadh.
    assert.equal(todayDate(new Date("2026-11-09T20:30:00.000Z")), "2026-11-09");
  });
});
