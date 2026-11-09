import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatDate,
  formatTime,
  isServiceStatus,
  isValidAdmissionsNumber,
  isValidEmail,
  isValidPhone,
  normalizeCode,
  normalizeEmail,
  parseCoordinate,
  routeDirectionLabel,
  sanitizeSearch,
  serviceStatusLabel,
  serviceDateInTimeZone,
  tripEventLabel,
  tripStatusLabel,
  validateLength,
} from "../lib/validation.ts";
import { homeForRole, safeNextPath, scopedNext } from "../lib/paths.ts";

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

describe("service date timezone", () => {
  it("uses the Riyadh calendar date when UTC has crossed midnight but Riyadh has not", () => {
    assert.equal(serviceDateInTimeZone(new Date("2026-11-09T20:30:00.000Z")), "2026-11-09");
  });

  it("advances the service date at Riyadh midnight, not UTC midnight", () => {
    assert.equal(serviceDateInTimeZone(new Date("2026-11-09T21:30:00.000Z")), "2026-11-10");
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

  it("maps each database role to its own area", () => {
    assert.equal(homeForRole("admin"), "/operator");
    assert.equal(homeForRole("operator"), "/operator");
    assert.equal(homeForRole("driver"), "/pengemudi");
    assert.equal(homeForRole("parent"), "/wali");
    assert.equal(homeForRole(null), "/tanpa-akses");
  });

  it("never carries a post-login destination into another role's area", () => {
    assert.equal(scopedNext("parent", "/admin/siswa"), "/wali");
    assert.equal(scopedNext("driver", "/admin"), "/pengemudi");
    assert.equal(scopedNext("operator", "/admin/operator"), "/operator");
    assert.equal(scopedNext("admin", "/operator"), "/operator");
    assert.equal(scopedNext("parent", "//contoh.com"), "/wali");
  });

  it("keeps a destination inside the role's own area", () => {
    assert.equal(scopedNext("parent", "/wali/anak/123"), "/wali/anak/123");
    assert.equal(scopedNext("driver", "/pengemudi/tugas/abc"), "/pengemudi/tugas/abc");
    assert.equal(scopedNext("operator", "/operator/bus"), "/operator/bus");
    assert.equal(scopedNext("admin", "/admin/rute"), "/operator");
  });
});

describe("operational labels", () => {
  it("labels route directions", () => {
    assert.equal(routeDirectionLabel("morning"), "Pagi");
    assert.equal(routeDirectionLabel("afternoon"), "Sore");
    assert.equal(routeDirectionLabel(""), "Tidak diketahui");
  });

  it("labels trip statuses without inventing an active trip", () => {
    assert.equal(tripStatusLabel("scheduled"), "Dijadwalkan");
    assert.equal(tripStatusLabel("in_progress"), "Berlangsung");
    assert.equal(tripStatusLabel("completed"), "Selesai");
    assert.equal(tripStatusLabel("cancelled"), "Dibatalkan");
    assert.equal(tripStatusLabel("unknown"), "Tidak diketahui");
  });

  it("labels student events", () => {
    assert.equal(tripEventLabel("boarded"), "Sudah naik");
    assert.equal(tripEventLabel("dropped_off"), "Sudah turun");
    assert.equal(tripEventLabel("absent"), "Tidak ikut");
    assert.equal(tripEventLabel("issue"), "Kendala");
    assert.equal(tripEventLabel("lainnya"), "Belum dicatat");
  });

  it("formats time and handles empty values", () => {
    assert.equal(formatTime(null), "—");
    assert.equal(formatTime(""), "—");
    assert.match(formatTime("2026-10-31T07:05:00.000Z"), /^\d{2}[.:]\d{2}$/);
  });
});
