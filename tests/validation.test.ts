import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatDate,
  isServiceStatus,
  isValidAdmissionsNumber,
  isValidEmail,
  isValidPhone,
  normalizeCode,
  normalizeEmail,
  parseCoordinate,
  sanitizeSearch,
  serviceStatusLabel,
  validateLength,
} from "../lib/validation.ts";
import { safeNextPath } from "../lib/paths.ts";

describe("email handling", () => {
  it("normalizes surrounding spaces and casing", () => {
    assert.equal(normalizeEmail("  Wali.Keluarga@Contoh.COM "), "wali.keluarga@contoh.com");
  });

  it("accepts ordinary addresses and rejects malformed ones", () => {
    assert.equal(isValidEmail("wali@contoh.com"), true);
    assert.equal(isValidEmail("wali@contoh"), false);
    assert.equal(isValidEmail("wali contoh.com"), false);
    assert.equal(isValidEmail(""), false);
  });
});

describe("school and operator codes", () => {
  it("uppercases and converts spaces to separators", () => {
    assert.equal(normalizeCode(" sch 001 "), "SCH-001");
  });

  it("drops characters that are not allowed in a code", () => {
    assert.equal(normalizeCode("sch_001/#"), "SCH-001");
  });
});

describe("student identifiers", () => {
  it("accepts alphanumeric admissions numbers", () => {
    assert.equal(isValidAdmissionsNumber("ADM-2026-001"), true);
    assert.equal(isValidAdmissionsNumber("2026/001"), true);
  });

  it("rejects values that are too short or contain separators not allowed by the schema", () => {
    assert.equal(isValidAdmissionsNumber("A"), false);
    assert.equal(isValidAdmissionsNumber("ADM 001"), false);
    assert.equal(isValidAdmissionsNumber("ADM.001"), false);
  });
});

describe("phone validation", () => {
  it("accepts international style numbers", () => {
    assert.equal(isValidPhone("+966512345678"), true);
    assert.equal(isValidPhone("050 123 4567"), true);
  });

  it("rejects letters and empty input", () => {
    assert.equal(isValidPhone("telepon"), false);
    assert.equal(isValidPhone(""), false);
  });
});

describe("coordinate parsing", () => {
  it("returns null for empty input so both coordinates can stay empty", () => {
    assert.deepEqual(parseCoordinate("", "latitude"), { ok: true, value: null });
  });

  it("accepts a comma decimal separator and rounds to six decimals", () => {
    assert.deepEqual(parseCoordinate("26,420123456", "latitude"), { ok: true, value: 26.420123 });
  });

  it("rejects values outside the valid range", () => {
    const latitude = parseCoordinate("95", "latitude");
    const longitude = parseCoordinate("-181", "longitude");
    assert.equal(latitude.ok, false);
    assert.equal(longitude.ok, false);
  });

  it("rejects non numeric input", () => {
    assert.equal(parseCoordinate("timur", "longitude").ok, false);
  });
});

describe("search sanitization", () => {
  it("removes PostgREST filter syntax before it reaches the query", () => {
    assert.equal(sanitizeSearch("ali, (x) *\"y"), "ali x y");
  });

  it("keeps ordinary search text and limits its length", () => {
    assert.equal(sanitizeSearch("  Sekolah Al Faisal  "), "Sekolah Al Faisal");
    assert.equal(sanitizeSearch("a".repeat(200)).length, 80);
  });
});

describe("service status", () => {
  it("recognises only the supported statuses", () => {
    assert.equal(isServiceStatus("active"), true);
    assert.equal(isServiceStatus("paused"), true);
    assert.equal(isServiceStatus("ended"), true);
    assert.equal(isServiceStatus("aktif"), false);
    assert.equal(isServiceStatus(""), false);
  });

  it("maps statuses to Indonesian labels", () => {
    assert.equal(serviceStatusLabel("active"), "Aktif");
    assert.equal(serviceStatusLabel("paused"), "Sementara tidak aktif");
    assert.equal(serviceStatusLabel("ended"), "Dihentikan");
    assert.equal(serviceStatusLabel("other"), "Tidak diketahui");
  });
});

describe("length validation", () => {
  it("returns a message only when the value is outside the range", () => {
    assert.equal(validateLength("Sekolah", "Nama", 2, 120), null);
    assert.match(validateLength("S", "Nama", 2, 120) ?? "", /Nama/);
  });
});

describe("date formatting", () => {
  it("formats date-only values without shifting the day", () => {
    const formatted = formatDate("2026-10-31");
    assert.match(formatted, /2026/);
    assert.match(formatted, /31/);
  });

  it("renders a dash for missing or invalid values", () => {
    assert.equal(formatDate(null), "—");
    assert.equal(formatDate("bukan-tanggal"), "—");
  });
});

describe("post-login redirect safety", () => {
  it("keeps internal paths", () => {
    assert.equal(safeNextPath("/admin/siswa", "/admin"), "/admin/siswa");
  });

  it("rejects absolute and protocol-relative URLs", () => {
    assert.equal(safeNextPath("https://contoh.com", "/admin"), "/admin");
    assert.equal(safeNextPath("//contoh.com", "/admin"), "/admin");
    assert.equal(safeNextPath(null, "/admin"), "/admin");
  });
});
