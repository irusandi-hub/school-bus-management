import test from "node:test";
import assert from "node:assert/strict";
import { defaultLocale, getDirection, isLocale } from "../lib/i18n/config.ts";
import { translate } from "../lib/i18n/messages.ts";

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
