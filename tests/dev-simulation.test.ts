import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { createSimulationClient, resetSimulationData } from "../lib/dev-simulation/client.ts";
import type { SimRow } from "../lib/dev-simulation/data.ts";

type Result = { data: unknown; error: { code?: string; message: string } | null; count: number | null };

function rows(result: Result): SimRow[] {
  return (result.data ?? []) as SimRow[];
}

const STUDENT_1 = "51111111-0000-4000-8000-000000000601";
const STUDENT_2 = "51111111-0000-4000-8000-000000000602";
const ORGANISATION = "51111111-0000-4000-8000-0000000001b1";

describe("klien simulasi pengembangan", () => {
  beforeEach(() => {
    resetSimulationData();
  });

  it("menyelesaikan relasi bersarang seperti siswa → sekolah dan wali", async () => {
    const supabase = createSimulationClient();

    const result = (await supabase
      .from("students")
      .select("id, full_name, schools(name, city), guardians(full_name, email)")) as Result;

    assert.equal(result.error, null);
    const student = rows(result).find((row) => row.id === STUDENT_1) as SimRow;
    assert.equal((student.schools as SimRow).name, "Sekolah Contoh Nusantara");
    assert.equal((student.schools as SimRow).city, "Dammam");
    assert.equal((student.guardians as SimRow).full_name, "Wali Contoh Satu");
  });

  it("menghitung baris terfilter tanpa mengembalikan data pada mode head", async () => {
    const supabase = createSimulationClient();

    const result = (await supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("service_status", "active")) as Result;

    assert.equal(result.data, null);
    assert.equal(result.count, 2);
  });

  it("mendukung pencarian or/ilike dan filter null", async () => {
    const supabase = createSimulationClient();

    const search = (await supabase
      .from("students")
      .select("id, full_name")
      .or("full_name.ilike.%dua%,admissions_number.ilike.%dua%")) as Result;
    assert.equal(rows(search).length, 1);
    assert.equal(rows(search)[0].id, STUDENT_2);

    const unlinked = (await supabase
      .from("guardians")
      .select("id", { count: "exact", head: true })
      .is("profile_id", null)) as Result;
    assert.equal(unlinked.count, 1);
  });

  it("menolak duplikasi nilai unik dengan kode galat yang dipetakan aplikasi", async () => {
    const supabase = createSimulationClient();

    const clash = (await supabase
      .from("buses")
      .insert({ fleet_code: "SIM-BUS-01", plate_number: "SIM 1999", capacity: 20, operator_id: ORGANISATION, active: true })) as Result;
    assert.equal(clash.error?.code, "23505");

    const created = (await supabase
      .from("schools")
      .insert({ code: "SIM-SCH-99", name: "Sekolah Contoh Baru", city: "Dammam", operator_id: null, active: true })) as Result;
    assert.equal(created.error, null);

    const listed = (await supabase.from("schools").select("id, code, name").eq("code", "SIM-SCH-99")) as Result;
    assert.equal(rows(listed).length, 1);
  });

  it("memperbarui baris yang dituju dan menyimpan riwayat status layanan", async () => {
    const supabase = createSimulationClient();

    const update = (await supabase.from("buses").update({ active: false }).eq("fleet_code", "SIM-BUS-01")) as Result;
    assert.equal(update.error, null);
    assert.equal((update.data as SimRow[]).length, 1);

    const listed = (await supabase.from("buses").select("id, active").eq("fleet_code", "SIM-BUS-01")) as Result;
    assert.equal(rows(listed)[0].active, false);

    const rpcResult = (await supabase.rpc("set_student_service_status", {
      p_student_id: STUDENT_1,
      p_status: "paused",
      p_reason: "Contoh uji perubahan status layanan.",
    })) as Result;
    assert.equal(rpcResult.error, null);

    const student = (await supabase.from("students").select("id, service_status").eq("id", STUDENT_1)) as Result;
    assert.equal(rows(student)[0].service_status, "paused");

    const history = (await supabase
      .from("student_service_status_history")
      .select("id, student_id, previous_status, new_status, reason, profiles(full_name)")
      .eq("student_id", STUDENT_1)
      .order("changed_at", { ascending: false })) as Result;
    const latest = rows(history)[0];
    assert.equal(latest.previous_status, "active");
    assert.equal(latest.new_status, "paused");
    assert.equal((latest.profiles as SimRow).full_name, "Operator Contoh");
  });

  it("menyelesaikan relasi satu-ke-banyak trips pada penugasan", async () => {
    const supabase = createSimulationClient();

    const result = (await supabase
      .from("trip_assignments")
      .select(
        "id, service_date, routes(route_name, school_name, direction), buses(fleet_code, plate_number), drivers(full_name), trips(id, status)",
      )) as Result;

    const assignment = rows(result).find((row) => row.id === "51111111-0000-4000-8000-000000000a12") as SimRow;
    assert.equal((assignment.routes as SimRow).route_name, "Rute Contoh Sore");
    assert.equal((assignment.buses as SimRow).fleet_code, "SIM-BUS-03");
    assert.equal((assignment.drivers as SimRow).full_name, "Pengemudi Contoh Dua");

    const trips = assignment.trips as SimRow[];
    assert.equal(trips.length, 1);
    assert.equal(trips[0].status, "in_progress");
  });

  it("tidak menggandakan pengemudi atau bus pada satu tanggal layanan", async () => {
    const supabase = createSimulationClient();
    const result = (await supabase.from("trip_assignments").select("id, driver_id, bus_id, service_date")) as Result;

    const seen = new Set<string>();
    for (const assignment of rows(result)) {
      for (const column of ["driver_id", "bus_id"] as const) {
        const key = `${column}:${assignment[column]}:${assignment.service_date}`;
        assert.equal(seen.has(key), false, `penugasan ganda pada dataset simulasi: ${key}`);
        seen.add(key);
      }
    }
  });

  it("menyisakan minimal satu pengemudi dan satu bus aktif untuk penugasan hari ini", async () => {
    const supabase = createSimulationClient();
    const date = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

    const [drivers, buses, assignments] = [
      (await supabase.from("drivers").select("id").eq("active", true)) as Result,
      (await supabase.from("buses").select("id").eq("active", true)) as Result,
      (await supabase
        .from("trip_assignments")
        .select("driver_id, bus_id, service_date")
        .eq("service_date", date)) as Result,
    ];

    const bookedDrivers = new Set(rows(assignments).map((row) => row.driver_id));
    const bookedBuses = new Set(rows(assignments).map((row) => row.bus_id));

    assert.ok(rows(drivers).some((row) => !bookedDrivers.has(row.id)), "tidak ada pengemudi aktif yang bebas hari ini");
    assert.ok(rows(buses).some((row) => !bookedBuses.has(row.id)), "tidak ada bus aktif yang bebas hari ini");
  });

  it("mengurutkan, membatasi, dan mengambil satu baris seperti klien asli", async () => {
    const supabase = createSimulationClient();

    const limited = (await supabase.from("students").select("id, full_name").order("full_name", { ascending: false }).limit(1)) as Result;
    assert.equal(rows(limited).length, 1);
    assert.equal(rows(limited)[0].full_name, "Siswa Contoh Tiga");

    const single = (await supabase.from("operators").select("id, name").eq("id", ORGANISATION).maybeSingle()) as Result;
    assert.equal((single.data as SimRow).name, "Operator Contoh Nusantara");

    const missing = (await supabase.from("operators").select("id").eq("id", "tidak-ada").maybeSingle()) as Result;
    assert.equal(missing.data, null);
  });

  it("menyimpan perubahan agar terlihat oleh request berikutnya", async () => {
    const writer = createSimulationClient();
    const created = (await writer
      .from("schools")
      .insert({ code: "SIM-SCH-PERSIST", name: "Sekolah Contoh Persisten", city: "Dammam", operator_id: null, active: true })) as Result;
    assert.equal(created.error, null);

    const reader = createSimulationClient();
    const listed = (await reader.from("schools").select("id, code").eq("code", "SIM-SCH-PERSIST")) as Result;
    assert.equal(rows(listed).length, 1);
  });

  it("menolak proses autentikasi dengan pesan yang jujur", async () => {
    const supabase = createSimulationClient();

    const signIn = await supabase.auth.signInWithPassword({ email: "x@example.test", password: " rahasia " });
    assert.notEqual(signIn.error, null);
    assert.match(String(signIn.error?.message), /Mode pengembangan aktif/);

    const rpcUnknown = (await supabase.rpc("fungsi_yang_belum_ada")) as Result;
    assert.match(String(rpcUnknown.error?.message), /belum tersedia/);
  });
});
