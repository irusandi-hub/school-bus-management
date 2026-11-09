import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { csvCell } from "../lib/operator/csv.ts";

describe("CSV export safety", () => {
  it("quotes commas, quotes, and line breaks", () => {
    assert.equal(csvCell('Nama, "Unit"\nDua'), '"Nama, ""Unit""\nDua"');
  });

  it("neutralizes spreadsheet formula prefixes", () => {
    assert.equal(csvCell("=HYPERLINK(\"https://example.test\")"), '"\'=HYPERLINK(""https://example.test"")"');
    assert.equal(csvCell(" +SUM(1,2)"), '"\' +SUM(1,2)"');
    assert.equal(csvCell("-1+2"), '"\'-1+2"');
    assert.equal(csvCell("\\uFEFF=2+2"), '"\\uFEFF=2+2"');
    assert.equal(csvCell("@SUM(1,2)"), '"\'@SUM(1,2)"');
  });

  it("keeps ordinary values and empty cells unchanged", () => {
    assert.equal(csvCell("Rute Dammam 01"), '"Rute Dammam 01"');
    assert.equal(csvCell(null), '""');
  });
});
