import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadChildren } from "../lib/guardian/data.ts";

type Filter = { kind: "eq" | "in"; column: string; value: unknown };

class MockQuery implements PromiseLike<{ data: unknown[]; error: null }> {
  private filters: Filter[] = [];
  private readonly table: string;
  private readonly datasets: Record<string, unknown[]>;
  private readonly calls: { table: string; filters: Filter[] }[];

  constructor(
    table: string,
    datasets: Record<string, unknown[]>,
    calls: { table: string; filters: Filter[] }[],
  ) {
    this.table = table;
    this.datasets = datasets;
    this.calls = calls;
    calls.push({ table, filters: this.filters });
  }

  select() { return this; }
  order() { return this; }
  eq(column: string, value: unknown) {
    this.filters.push({ kind: "eq", column, value });
    return this;
  }
  in(column: string, value: unknown[]) {
    this.filters.push({ kind: "in", column, value });
    return this;
  }

  then<TResult1 = { data: unknown[]; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: unknown[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    let rows = this.datasets[this.table] ?? [];
    for (const filter of this.filters) {
      rows = rows.filter((row) => {
        const value = (row as Record<string, unknown>)[filter.column];
        return filter.kind === "eq" ? value === filter.value : (filter.value as unknown[]).includes(value);
      });
    }
    return Promise.resolve({ data: rows, error: null }).then(onfulfilled, onrejected);
  }
}

function createSupabase(datasets: Record<string, unknown[]>) {
  const calls: { table: string; filters: Filter[] }[] = [];
  const client = {
    from(table: string) {
      return new MockQuery(table, datasets, calls);
    },
  };
  return { client, calls };
}

const students = [
  {
    id: "student-1",
    admissions_number: "ADM-001",
    full_name: "Anak Satu",
    guardian_id: "guardian-1",
  },
  {
    id: "student-2",
    admissions_number: "ADM-002",
    full_name: "Anak Dua",
    guardian_id: "guardian-1",
  },
  {
    id: "student-other",
    admissions_number: "ADM-003",
    full_name: "Anak Lain",
    guardian_id: "guardian-2",
  },
];

const placements = [
  {
    id: "placement-1",
    student_id: "student-1",
    direction: "morning",
    active: true,
    routes: { id: "route-morning", route_name: "Rute Pagi", school_name: "Sekolah A" },
    route_stops: { stop_name: "Rumah Satu", stop_order: 1 },
  },
  {
    id: "placement-2",
    student_id: "student-1",
    direction: "afternoon",
    active: true,
    routes: { id: "route-afternoon", route_name: "Rute Sore", school_name: "Sekolah A" },
    route_stops: { stop_name: "Sekolah", stop_order: 2 },
  },
  {
    id: "placement-3",
    student_id: "student-2",
    direction: "morning",
    active: true,
    routes: { id: "route-morning", route_name: "Rute Pagi", school_name: "Sekolah A" },
    route_stops: { stop_name: "Rumah Dua", stop_order: 2 },
  },
];

const assignments = [
  {
    route_id: "route-morning",
    driver_id: "driver-1",
    buses: { fleet_code: "BUS-01", plate_number: "ABC-123", capacity: 20 },
    trips: [{ id: "trip-morning", status: "in_progress", started_at: "2026-11-15T03:00:00Z", arrived_at: null, completed_at: null }],
  },
  {
    route_id: "route-afternoon",
    driver_id: null,
    buses: { fleet_code: "BUS-02", plate_number: "XYZ-789", capacity: 16 },
    trips: [],
  },
];

describe("loadChildren query batching", () => {
  it("membatasi data ke wali dan memuat siswa, penempatan, serta penugasan dalam tiga query", async () => {
    const { client, calls } = createSupabase({
      students,
      student_route_stops: placements,
      trip_assignments: assignments,
    });

    const children = await loadChildren(client as never, "guardian-1");

    assert.deepEqual(children.map((child) => child.student.id), ["student-1", "student-2"]);
    assert.equal(calls.length, 3);
    assert.deepEqual(calls.map((call) => call.table), ["students", "student_route_stops", "trip_assignments"]);
    assert.ok(calls[0].filters.some((filter) => filter.kind === "eq" && filter.column === "guardian_id" && filter.value === "guardian-1"));
    assert.ok(calls[1].filters.some((filter) => filter.kind === "in" && filter.column === "student_id" && JSON.stringify(filter.value) === JSON.stringify(["student-1", "student-2"])));
    assert.ok(calls[2].filters.some((filter) => filter.kind === "in" && filter.column === "route_id" && JSON.stringify(filter.value) === JSON.stringify(["route-morning", "route-afternoon"])));

    assert.equal(children[0].placements.length, 2);
    assert.deepEqual(children[0].todayTrips.map((trip) => trip.direction), ["morning", "afternoon"]);
    assert.equal(children[0].todayTrips[0].tripId, "trip-morning");
    assert.equal(children[0].todayTrips[1].tripId, null);
    assert.equal(children[0].todayTrips[1].driverAssigned, false);
    assert.equal(children[1].todayTrips.length, 1);
    assert.equal(children[1].todayTrips[0].routeId, "route-morning");
  });

  it("berhenti setelah query siswa ketika wali tidak memiliki siswa aktif", async () => {
    const { client, calls } = createSupabase({ students: [], student_route_stops: placements, trip_assignments: assignments });

    const children = await loadChildren(client as never, "guardian-empty");

    assert.deepEqual(children, []);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].table, "students");
  });
});
