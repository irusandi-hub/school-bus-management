import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { isDevOpenAccess } from "../lib/dev-open-access.ts";

const ENV_KEYS = [
  "DEV_OPEN_ACCESS",
  "NODE_ENV",
  "VERCEL_ENV",
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

describe("isDevOpenAccess", () => {
  it("menutup mode saat variabel aktif tidak diberikan", () => {
    setEnv({ NODE_ENV: "development" });
    assert.equal(isDevOpenAccess(), false);
  });

  it("menutup mode saat nilai variabel aktif bukan nilai pengaktif", () => {
    setEnv({ DEV_OPEN_ACCESS: "maybe", NODE_ENV: "development" });
    assert.equal(isDevOpenAccess(), false);
  });

  it("membuka mode hanya pada pengembangan dengan aktifasi eksplisit", () => {
    setEnv({ DEV_OPEN_ACCESS: "1", NODE_ENV: "development" });
    assert.equal(isDevOpenAccess(), true);
  });

  it("tetap tertutup pada NODE_ENV=production berapa pun nilai aktivasinya", () => {
    setEnv({ DEV_OPEN_ACCESS: "true", NODE_ENV: "production" });
    assert.equal(isDevOpenAccess(), false);
  });

  it("tetap tertutup saat penanda produksi lain bernilai produksi", () => {
    setEnv({ DEV_OPEN_ACCESS: "1", NODE_ENV: "development", VERCEL_ENV: "production" });
    assert.equal(isDevOpenAccess(), false);

    setEnv({ DEV_OPEN_ACCESS: "1", NODE_ENV: "development", PRODUCTION: "1" });
    assert.equal(isDevOpenAccess(), false);
  });

  it("tetap tertutup bila penanda lingkungan menyatakan lokasi lain", () => {
    setEnv({ DEV_OPEN_ACCESS: "1", NODE_ENV: "development", APP_ENV: "production" });
    assert.equal(isDevOpenAccess(), false);

    setEnv({ DEV_OPEN_ACCESS: "1", NODE_ENV: "development", APP_ENV: "staging" });
    assert.equal(isDevOpenAccess(), false);

    setEnv({ DEV_OPEN_ACCESS: "1", NODE_ENV: "development", NEXT_PUBLIC_APP_ENV: "client-preview" });
    assert.equal(isDevOpenAccess(), false);
  });

  it("membuka mode untuk preview lokal yang dinyatakan eksplisit", () => {
    setEnv({ DEV_OPEN_ACCESS: "1", NODE_ENV: "development", APP_ENV: "preview" });
    assert.equal(isDevOpenAccess(), true);
  });

  it("menutup mode bila NODE_ENV tidak dikenali sama sekali (fail-closed)", () => {
    setEnv({ DEV_OPEN_ACCESS: "1" });
    assert.equal(isDevOpenAccess(), false);

    setEnv({ DEV_OPEN_ACCESS: "1", NODE_ENV: "server" });
    assert.equal(isDevOpenAccess(), false);
  });
});
