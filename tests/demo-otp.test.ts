import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEMO_OTP_DESTINATIONS, demoGuardianKeyForOtp, isDemoOtpRole, isDemoOtpValid } from "../lib/demo-otp.ts";

describe("OTP simulasi berdasarkan kartu peran", () => {
  it("menerima kode tetap untuk Operator dan Pengemudi", () => {
    assert.equal(isDemoOtpValid("operator", "123456"), true);
    assert.equal(isDemoOtpValid("pengemudi", "234567"), true);
  });

  it("menerima tiga kode wali yang mewakili akun orang tua berbeda", () => {
    assert.equal(isDemoOtpValid("wali", "345001"), true);
    assert.equal(isDemoOtpValid("wali", "345002"), true);
    assert.equal(isDemoOtpValid("wali", "345003"), true);
  });

  it("menolak kode lintas peran dan kode yang salah", () => {
    assert.equal(isDemoOtpValid("operator", "234567"), false);
    assert.equal(isDemoOtpValid("pengemudi", "123456"), false);
    assert.equal(isDemoOtpValid("wali", "345004"), false);
  });

  it("mengirim tiap peran ke ruang kerja yang benar", () => {
    assert.deepEqual(DEMO_OTP_DESTINATIONS, {
      operator: "/operator",
      pengemudi: "/pengemudi",
      wali: "/wali",
    });
  });

  it("memetakan OTP wali ke akun contoh yang berbeda", () => {
    assert.equal(demoGuardianKeyForOtp("345001"), "one");
    assert.equal(demoGuardianKeyForOtp("345002"), "two");
    assert.equal(demoGuardianKeyForOtp("345003"), "three");
    assert.equal(demoGuardianKeyForOtp("345004"), null);
  });

  it("hanya menerima nama peran yang dikenal", () => {
    assert.equal(isDemoOtpRole("wali"), true);
    assert.equal(isDemoOtpRole("admin"), false);
    assert.equal(isDemoOtpRole(null), false);
  });
});
