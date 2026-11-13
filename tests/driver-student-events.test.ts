import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
import { isDuplicateStudentEvent, STUDENT_EVENT_DUPLICATE_WINDOW_MS } from "../lib/driver/student-events.ts";
import { createSimulationClient, resetSimulationData } from "../lib/dev-simulation/client.ts";

const NOW = Date.parse("2026-11-10T08:00:00.000Z");

describe("status penumpang", () => {
  it("menolak klik ganda pada event yang sama dalam jendela singkat", () => {
    const latest = { event_type: "boarded", occurred_at: new Date(NOW - 500).toISOString() };
    assert.equal(isDuplicateStudentEvent(latest, "boarded", NOW), true);
  });

  it("mengizinkan perubahan status yang berbeda atau event yang lebih lama", () => {
    const boarded = { event_type: "boarded", occurred_at: new Date(NOW - 500).toISOString() };
    assert.equal(isDuplicateStudentEvent(boarded, "dropped_off", NOW), false);
    assert.equal(isDuplicateStudentEvent(boarded, "boarded", NOW + STUDENT_EVENT_DUPLICATE_WINDOW_MS), false);
    assert.equal(isDuplicateStudentEvent(null, "boarded", NOW), false);
    assert.equal(
      isDuplicateStudentEvent({ event_type: "absent", occurred_at: "bukan-tanggal" }, "absent", NOW),
      false,
    );
  });

  it("menyimpan event dan membacanya kembali pada request berikutnya", async () => {
    resetSimulationData();
    const writer = createSimulationClient();
    const inserted = (await writer.from("trip_student_events").insert({
      trip_id: "51111111-0000-4000-8000-000000000b12",
      student_id: "51111111-0000-4000-8000-000000000602",
      event_type: "dropped_off",
      recorded_by: "51111111-0000-4000-8000-0000000000a3",
      notes: null,
    })) as { error: { message: string } | null };
    assert.equal(inserted.error, null);

    const reader = createSimulationClient();
    const listed = (await reader
      .from("trip_student_events")
      .select("trip_id, student_id, event_type")
      .eq("trip_id", "51111111-0000-4000-8000-000000000b12")
      .eq("student_id", "51111111-0000-4000-8000-000000000602")) as { data: { event_type: string }[] };
    assert.equal(listed.data.length, 1);
    assert.equal(listed.data[0].event_type, "dropped_off");
  });

  it("memakai event terbaru sehingga riwayat tetap append-only", () => {
    const action = fs.readFileSync("app/pengemudi/actions.ts", "utf8");
    const migration = fs.readFileSync("supabase/migrations/20261031000001_operator_driver_guardian_areas.sql", "utf8");

    assert.match(action, /from\("trip_student_events"\)[\s\S]*insert\(/);
    assert.match(action, /isDuplicateStudentEvent/);
    assert.match(migration, /create policy trip_student_events_insert_driver/i);
    assert.doesNotMatch(migration, /grant update on public\.trip_student_events/i);
  });
});
