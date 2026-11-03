import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { deploymentKind, isDevOpenAccess } from "../lib/dev-open-access.ts";

const ENV_KEYS = [
  "DEV_OPEN_ACCESS",
  "NODE_ENV",
  "VERCEL_ENV",
  "VERCEL",
  "PRODUCTION",
  "APP_ENV",
  "NEXT_PUBLIC_APP_ENV",
] as const;

const original = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

function setEnv(values: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>) {
  for (const key of ENV_KEYS) delete process.env[key];
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) process.env[key] = value;
  }
}

afterEach(() => {
  setEnv(original as Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>);
});

describe("deploymentKind", () => {
  it("mengenali Vercel Preview meski NODE_ENV=production", () => {
    setEnv({ NODE_ENV: "production", VERCEL_ENV: "preview" });
    assert.equal(deploymentKind(), "preview");
  });

  it("mengenali produksi dari penanda Vercel maupun penanda lain", () => {
    setEnv({ NODE_ENV: "production", VERCEL_ENV: "production" });
    assert.equal(deploymentKind(), "production");

    setEnv({ NODE_ENV: "development", PRODUCTION: "1" });
    assert.equal(deploymentKind(), "production");

    setEnv({ NODE_ENV: "development", NEXT_PUBLIC_APP_ENV: "production" });
    assert.equal(deploymentKind(), "production");
  });

  it("menganggap lingkungan asing tidak dikenal", () => {
    setEnv({ NODE_ENV: "production" });
    assert.equal(deploymentKind(), "unknown");

    setEnv({ NODE_ENV: "server" });
    assert.equal(deploymentKind(), "unknown");

    setEnv({ NODE_ENV: "development", VERCEL_ENV: "staging" });
    assert.equal(deploymentKind(), "unknown");

    setEnv({ NODE_ENV: "development", NEXT_PUBLIC_APP_ENV: "client-preview" });
    assert.equal(deploymentKind(), "unknown");
  });
});

describe("isDevOpenAccess", () => {
  it("membuka mode di Vercel Preview tanpa variabel tambahan", () => {
    setEnv({ NODE_ENV: "production", VERCEL_ENV: "preview" });
    assert.equal(isDevOpenAccess(), true);
  });

  it("membuka mode pada pengembangan lokal", () => {
    setEnv({ NODE_ENV: "development" });
    assert.equal(isDevOpenAccess(), true);

    setEnv({ NODE_ENV: "test" });
    assert.equal(isDevOpenAccess(), true);
  });

  it("tetap membuka Preview yang masih memakai penanda preview eksplisit", () => {
    setEnv({
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      NEXT_PUBLIC_APP_ENV: "preview",
      DEV_OPEN_ACCESS: "1",
    });
    assert.equal(isDevOpenAccess(), true);
  });

  it("menutup mode di Preview bila sakelar darurat dimatikan", () => {
    for (const value of ["0", "false", "off", "no", "disabled"]) {
      setEnv({ NODE_ENV: "production", VERCEL_ENV: "preview", DEV_OPEN_ACCESS: value });
      assert.equal(isDevOpenAccess(), false, `DEV_OPEN_ACCESS=${value} harus menutup mode`);
    }
  });

  it("menutup mode pada produksi, sekalipun flag aktif terpasang", () => {
    setEnv({ NODE_ENV: "production", VERCEL_ENV: "production", DEV_OPEN_ACCESS: "1" });
    assert.equal(isDevOpenAccess(), false);

    setEnv({ NODE_ENV: "production", DEV_OPEN_ACCESS: "1" });
    assert.equal(isDevOpenAccess(), false);

    setEnv({ NODE_ENV: "development", PRODUCTION: "1", DEV_OPEN_ACCESS: "1" });
    assert.equal(isDevOpenAccess(), false);

    setEnv({ NODE_ENV: "development", APP_ENV: "production", DEV_OPEN_ACCESS: "1" });
    assert.equal(isDevOpenAccess(), false);
  });

  it("menutup mode bila lingkungan tidak dikenali (fail-closed)", () => {
    setEnv({ DEV_OPEN_ACCESS: "1" });
    assert.equal(isDevOpenAccess(), false);

    setEnv({ DEV_OPEN_ACCESS: "1", NODE_ENV: "server" });
    assert.equal(isDevOpenAccess(), false);

    setEnv({ DEV_OPEN_ACCESS: "1", NODE_ENV: "development", VERCEL_ENV: "staging" });
    assert.equal(isDevOpenAccess(), false);
  });
});
