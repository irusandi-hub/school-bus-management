import test from "node:test";
import assert from "node:assert/strict";
import { defaultLocale, getDirection, isLocale } from "../lib/i18n/config.ts";
import { translate } from "../lib/i18n/messages.ts";
import { translateNavigationLabel } from "../lib/i18n/navigation.ts";
import { translateAdminCopy } from "../lib/i18n/admin-copy.ts";

test("Indonesian remains the default locale", () => {
  assert.equal(defaultLocale, "id");
});

test("only the three supported locales are accepted", () => {
  assert.equal(isLocale("id"), true);
  assert.equal(isLocale("en"), true);
  assert.equal(isLocale("ar"), true);
  assert.equal(isLocale("fr"), false);
  assert.equal(isLocale(undefined), false);
});

test("Arabic uses RTL while Indonesian and English use LTR", () => {
  assert.equal(getDirection("ar"), "rtl");
  assert.equal(getDirection("id"), "ltr");
  assert.equal(getDirection("en"), "ltr");
});

test("essential workspace labels exist in all locales", () => {
  for (const locale of ["id", "en", "ar"] as const) {
    assert.ok(translate(locale, "signOut").length > 0);
    assert.ok(translate(locale, "operator").length > 0);
    assert.ok(translate(locale, "parent").length > 0);
  }
});

test("shared navigation labels are translated without changing route identity", () => {
  assert.equal(translateNavigationLabel("Ringkasan", "en"), "Overview");
  assert.equal(translateNavigationLabel("Pengemudi", "ar"), "السائقون");
  assert.equal(translateNavigationLabel("Ringkasan", "id"), "Ringkasan");
  assert.equal(translateNavigationLabel("Unmapped custom label", "en"), "Unmapped custom label");
});


test("shared operational copy has Indonesian, English, and Arabic variants", () => {
  assert.equal(translateAdminCopy("Status layanan", "id"), "Status layanan");
  assert.equal(translateAdminCopy("Status layanan", "en"), "Service status");
  assert.equal(translateAdminCopy("Status layanan", "ar"), "حالة الخدمة");
});

test("unmapped operational copy remains unchanged instead of disappearing", () => {
  assert.equal(translateAdminCopy("Custom user-provided label", "ar"), "Custom user-provided label");
  assert.equal(translateAdminCopy(undefined, "en"), undefined);
});
