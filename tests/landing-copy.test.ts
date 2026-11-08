import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dictionaries, resolveLanguage } from "../components/landing-copy.ts";

describe("kamus landing", () => {
  it("memiliki kunci dan tiga peran yang sama pada semua bahasa", () => {
    for (const code of ["id", "en", "ar"] as const) {
      assert.deepEqual(Object.keys(dictionaries[code]).sort(), Object.keys(dictionaries.id).sort());
      assert.equal(dictionaries[code].roles.length, 3);
      assert.equal(dictionaries[code].descriptions.length, 3);
      assert.equal(dictionaries[code].chips.length, 3);
    }
  });
  it("mendeteksi bahasa perangkat dan memakai Indonesia sebagai fallback", () => {
    assert.equal(resolveLanguage("ar-SA"), "ar");
    assert.equal(resolveLanguage("en-US"), "en");
    assert.equal(resolveLanguage("id-ID"), "id");
    assert.equal(resolveLanguage("fr-FR"), "id");
    assert.equal(resolveLanguage(null), "id");
  });
});
