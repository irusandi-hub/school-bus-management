import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeInternalRedirect } from "../lib/auth-redirect.ts";

describe("post-authentication redirect safety", () => {
  const origin = "https://schoolbus.example";

  it("allows an internal path and preserves query and hash", () => {
    assert.equal(safeInternalRedirect("/wali?tab=anak#kamera", origin), "/wali?tab=anak#kamera");
  });

  it("rejects protocol-relative and absolute external URLs", () => {
    assert.equal(safeInternalRedirect("//attacker.example/path", origin), "/");
    assert.equal(safeInternalRedirect("https://attacker.example/path", origin), "/");
  });

  it("rejects backslash-normalized external URLs", () => {
    assert.equal(safeInternalRedirect("/\\\\attacker.example/path", origin), "/");
  });

  it("rejects relative paths and malformed destinations", () => {
    assert.equal(safeInternalRedirect("wali", origin), "/");
    assert.equal(safeInternalRedirect(null, origin), "/");
  });
});
