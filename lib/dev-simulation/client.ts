import { DEV_DRIVER_RECORD, DEV_GUARDIAN_VIEWERS, DEV_VIEWER } from "../dev-open-access.ts";
import { createSimulationTables, type SimRow, type SimTables } from "./data.ts";

/**
 * Klien Supabase simulasi untuk mode akses terbuka pengembangan (DEC-024).
 *
 * Berkas ini hanya memuat subset API supabase-js yang benar-benar dipakai aplikasi
 * (select/insert/update, eq/in/is/or, order/range/limit, maybeSingle, rpc, auth).
 * Tujuannya satu-satunya: membuat ketiga ekosistem dapat ditinjau di lingkungan
 * pengembangan tanpa kredensial dan tanpa menyentuh database mana pun. Otorisasi
 * tetap di database sungguhan lewat RLS; lapisan ini tidak pernah dipakai di
 * produksi dan tidak pernah menerjemahkan kebijakan akses apa pun.
 */

type SimError = { code?: string; message: string; details?: string | null } | null;
type SimResult = { data: unknown; error: SimError; count: number | null };

const UNIQUE_COLUMNS: Record<string, string[]> = {
  schools: ["code"],
  project_areas: ["code"],
  buses: ["fleet_code", "plate_number"],
  students: ["admissions_number"],
  guardians: ["email"],
};

type Relation =
  | { table: string; foreignKey: string; many: false }
  | { table: string; childKey: string; localKey?: string; many: true };

const RELATIONS: Record<string, Record<string, Relation>> = {
  students: {
    schools: { table: "schools", foreignKey: "school_id", many: false },
    guardians: { table: "guardians", foreignKey: "guardian_id", many: false },
  },
  drivers: { project_areas: { table: "project_areas", foreignKey: "project_area_id", many: false } },
  buses: { project_areas: { table: "project_areas", foreignKey: "project_area_id", many: false } },
  guardians: { students: { table: "students", childKey: "guardian_id", many: true } },
  audit_logs: { profiles: { table: "profiles", foreignKey: "actor_profile_id", many: false } },
  student_service_status_history: {
    profiles: { table: "profiles", foreignKey: "actor_profile_id", many: false },
  },
  schools: { project_areas: { table: "project_areas", foreignKey: "project_area_id", many: false } },
  routes: {
    route_stops: { table: "route_stops", childKey: "route_id", many: true },
    schools: { table: "schools", foreignKey: "school_id", many: false },
    project_areas: { table: "project_areas", foreignKey: "project_area_id", many: false },
  },
  route_stops: { routes: { table: "routes", foreignKey: "route_id", many: false } },
  student_route_stops: {
    routes: { table: "routes", foreignKey: "route_id", many: false },
    route_stops: { table: "route_stops", foreignKey: "stop_id", many: false },
    students: { table: "students", foreignKey: "student_id", many: false },
  },
  trip_assignments: {
    routes: { table: "routes", foreignKey: "route_id", many: false },
    buses: { table: "buses", foreignKey: "bus_id", many: false },
    drivers: { table: "drivers", foreignKey: "driver_id", many: false },
    trips: { table: "trips", childKey: "assignment_id", many: true },
  },
  trips: { trip_assignments: { table: "trip_assignments", foreignKey: "assignment_id", many: false } },
  trip_student_events: {
    students: { table: "students", foreignKey: "student_id", many: false },
    trips: { table: "trips", foreignKey: "trip_id", many: false },
  },
};

type Segment = { kind: "column"; name: string } | { kind: "embed"; name: string; segments: Segment[] };

function parseSegments(input: string): Segment[] {
  const segments: Segment[] = [];
  let depth = 0;
  let buffer = "";

  const flush = () => {
    const token = buffer.trim();
    buffer = "";
    if (!token) return;

    const open = token.indexOf("(");
    if (open === -1) {
      segments.push({ kind: "column", name: token });
      return;
    }

    const inner = token.slice(open + 1, token.lastIndexOf(")"));
    segments.push({
      kind: "embed",
      name: token.slice(0, open).trim().replace(/!inner$/, ""),
      segments: parseSegments(inner),
    });
  };

  for (const char of input) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      flush();
      continue;
    }
    buffer += char;
  }
  flush();

  return segments;
}

function projectRow(
  tables: SimTables,
  tableName: string,
  row: SimRow,
  segments: Segment[],
): SimRow {
  const out: SimRow = {};

  for (const segment of segments) {
    if (segment.kind === "column") {
      out[segment.name] = row[segment.name] ?? null;
      continue;
    }

    const relation = RELATIONS[tableName]?.[segment.name];
    if (!relation) {
      out[segment.name] = null;
      continue;
    }

    const targets = tables[relation.table] ?? [];

    if (relation.many) {
      const localKey = relation.localKey ?? "id";
      out[segment.name] = targets
        .filter((target) => target[relation.childKey] === row[localKey])
        .map((target) => projectRow(tables, relation.table, target, segment.segments));
      continue;
    }

    const match = targets.find((target) => target.id === row[relation.foreignKey]);
    out[segment.name] = match ? projectRow(tables, relation.table, match, segment.segments) : null;
  }

  return out;
}

function compareValues(left: unknown, right: unknown): number {
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left ?? "").localeCompare(String(right ?? ""), "id");
}

function likeMatches(value: unknown, pattern: string, insensitive: boolean): boolean {
  // SQL NULL never matches LIKE, even an all-wildcard pattern.
  if (value === null || value === undefined) return false;
  let expression = "";
  const literal = (character: string) => character.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (let index = 0; index < pattern.length; index++) {
    const character = pattern[index];
    if (character === "\\") {
      if (++index === pattern.length) return false;
      expression += literal(pattern[index]);
    } else if (character === "%") expression += "[\\s\\S]*";
    else if (character === "_") expression += "[\\s\\S]";
    else expression += literal(character);
  }
  return new RegExp(`^(?:${expression})$(?![\\s\\S])`, insensitive ? "iu" : "u").test(String(value));
}

class SimQuery implements PromiseLike<SimResult> {
  private readonly tables: SimTables;
  private readonly tableName: string;
  private readonly predicates: Array<(row: SimRow) => boolean> = [];
  private readonly orders: Array<{ column: string; ascending: boolean }> = [];
  private kind: "select" | "insert" | "update" = "select";
  private payload: SimRow | SimRow[] | null = null;
  private columnSpec = "*";
  private withCount = false;
  private headOnly = false;
  private rangeFrom: number | null = null;
  private rangeTo: number | null = null;
  private limitTo: number | null = null;

  constructor(tables: SimTables, tableName: string) {
    this.tables = tables;
    this.tableName = tableName;
  }

  select(columns = "*", options: { count?: string; head?: boolean } = {}) {
    this.columnSpec = columns;
    this.withCount = options.count === "exact";
    this.headOnly = options.head === true;
    return this;
  }

  insert(values: SimRow | SimRow[]) {
    this.kind = "insert";
    this.payload = values;
    return this;
  }

  update(values: SimRow) {
    this.kind = "update";
    this.payload = values;
    return this;
  }

  eq(column: string, value: unknown) {
    this.predicates.push((row) => row[column] === value);
    return this;
  }

  neq(column: string, value: unknown) {
    this.predicates.push((row) => row[column] !== value);
    return this;
  }

  in(column: string, values: unknown[]) {
    this.predicates.push((row) => values.includes(row[column]));
    return this;
  }

  is(column: string, value: unknown) {
    this.predicates.push((row) => (row[column] ?? null) === value);
    return this;
  }

  /** Mendukung pola `col.ilike.%q%` dan `col.eq.value` yang dipisah koma. */
  or(expression: string) {
    const clauses = expression.split(",").map((part) => {
      const [column = "", operator = "", ...rest] = part.trim().split(".");
      const value = rest.join(".");
      return { column, operator, value };
    });

    this.predicates.push((row) =>
      clauses.some(({ column, operator, value }) => {
        if (operator === "ilike" || operator === "like") return likeMatches(row[column], value, operator === "ilike");
        if (operator === "eq") return String(row[column] ?? "") === value;
        if (operator === "neq") return String(row[column] ?? "") !== value;
        return false;
      }),
    );
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    this.orders.push({ column, ascending: options.ascending !== false });
    return this;
  }

  range(from: number, to: number) {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  limit(count: number) {
    this.limitTo = count;
    return this;
  }

  async maybeSingle(): Promise<{ data: SimRow | null; error: SimError }> {
    const result = await this.execute();
    const rows = (result.data ?? []) as SimRow[];
    return { data: rows[0] ?? null, error: result.error };
  }

  async single(): Promise<{ data: SimRow | null; error: SimError }> {
    const result = await this.execute();
    const rows = (result.data ?? []) as SimRow[];
    if (rows.length === 0) return { data: null, error: { message: "Baris tidak ditemukan." } };
    return { data: rows[0] ?? null, error: result.error };
  }

  private rows(): SimRow[] {
    return this.tables[this.tableName] ?? [];
  }

  private uniqueViolation(values: SimRow[]): SimError {
    const columns = UNIQUE_COLUMNS[this.tableName] ?? [];

    for (const candidate of values) {
      for (const column of columns) {
        const value = candidate[column];
        if (value === undefined || value === null || value === "") continue;
        const clash = this.rows().some((row) => row[column] === value);
        if (clash) {
          return {
            code: "23505",
            message: `Nilai ${column} sudah dipakai baris lain pada dataset simulasi.`,
          };
        }
      }
    }

    return null;
  }

  private execute(): SimResult {
    if (this.kind === "insert") {
      const values = Array.isArray(this.payload) ? this.payload : [this.payload ?? {}];
      const clash = this.uniqueViolation(values);
      if (clash) return { data: null, error: clash, count: null };

      const now = new Date().toISOString();
      const stored = values.map((value) => ({
        id: nextSimId(),
        created_at: now,
        // Kolom dengan default database harus tetap terisi pada simulasi.
        ...(this.tableName === "trip_student_events" ? { occurred_at: now } : {}),
        ...value,
      }));

      this.rows().push(...stored);
      return { data: stored, error: null, count: stored.length };
    }

    if (this.kind === "update") {
      const payload = (this.payload ?? {}) as SimRow;
      const matched = this.rows().filter((row) => this.predicates.every((predicate) => predicate(row)));
      matched.forEach((row) => Object.assign(row, payload));
      return { data: matched, error: null, count: matched.length };
    }

    let matched = this.rows().filter((row) => this.predicates.every((predicate) => predicate(row)));

    for (const { column, ascending } of [...this.orders].reverse()) {
      matched = [...matched].sort((left, right) => {
        const a = left[column];
        const b = right[column];
        if (a === null || a === undefined) return b === null || b === undefined ? 0 : 1;
        if (b === null || b === undefined) return -1;
        const result = compareValues(a, b);
        return ascending ? result : -result;
      });
    }

    const total = matched.length;

    if (this.rangeFrom !== null && this.rangeTo !== null) {
      matched = matched.slice(this.rangeFrom, this.rangeTo + 1);
    } else if (this.limitTo !== null) {
      matched = matched.slice(0, this.limitTo);
    }

    const segments = this.columnSpec === "*" ? null : parseSegments(this.columnSpec);
    const data = matched.map((row) =>
      segments ? projectRow(this.tables, this.tableName, row, segments) : { ...row },
    );

    return {
      data: this.headOnly ? null : data,
      error: null,
      count: this.withCount ? total : null,
    };
  }

  then<TResult1 = SimResult, TResult2 = never>(
    onfulfilled?: ((value: SimResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve().then(() => this.execute()).then(onfulfilled, onrejected);
  }
}

const SERVICE_STATUSES = new Set(["active", "paused", "ended"]);
let generatedId = 0;

/** Id baru berbentuk UUID sintetis supaya validasi format id di Server Action tetap lolos. */
function nextSimId() {
  generatedId += 1;
  return `51999999-0000-4000-8000-${String(generatedId).padStart(12, "0")}`;
}

/** Membuat klien simulasi yang dipakai `createServerSupabase()` saat mode dev aktif. */
/**
 * Dataset simulasi disimpan sekali untuk seluruh proses server, sama seperti database
 * sungguhan: tanpa ini setiap request memakai salinan baru dan hasil tambah/ubah dari
 * Server Action langsung hilang sebelum halaman berikutnya dibaca.
 */
const sharedSimulation = globalThis as typeof globalThis & {
  __schoolBusSimulationTables?: SimTables;
};

function simulationTables(): SimTables {
  // Next.js dapat memuat modul ini sekali per bundle route. Simpan di globalThis
  // agar aksi pengemudi dan route wali membaca tabel proses yang sama.
  sharedSimulation.__schoolBusSimulationTables ??= createSimulationTables();
  return sharedSimulation.__schoolBusSimulationTables;
}

/** Mengembalikan dataset simulasi ke kondisi awal; dipakai pengujian dan restart server. */
export function resetSimulationData() {
  sharedSimulation.__schoolBusSimulationTables = createSimulationTables();
  return sharedSimulation.__schoolBusSimulationTables;
}

export function createSimulationClient() {
  const tables = simulationTables();

  const query = (tableName: string) => new SimQuery(tables, tableName);

  const authMessage =
    "Mode pengembangan aktif: proses masuk, pendaftaran, dan aktivasi akun dinonaktifkan karena ketiga ekosistem dibuka tanpa login.";

  return {
    from: query,

    /**
     * Hanya `set_student_service_status` yang disimulasikan sampai selesai, karena
     * alur perubahan status layanan siswa adalah bagian yang harus dapat ditinjau.
     * Fungsi lain mengembalikan galat eksplisit, bukan sukses palsu.
     */
    async rpc(name: string, args: Record<string, unknown> = {}): Promise<{ data: unknown; error: SimError }> {
      if (name === "driver_publish_trip_location") {
        const tripId = String(args.p_trip_id ?? "");
        const trip = tables.trips.find((row) => row.id === tripId);
        const assignment = tables.trip_assignments.find((row) => row.id === trip?.assignment_id);
        if (!trip || assignment?.driver_id !== DEV_DRIVER_RECORD.id || trip.status !== "in_progress") {
          return { data: null, error: { code: "42501", message: "Perjalanan tidak aktif untuk pengemudi ini." } };
        }

        const latitude = Number(args.p_latitude);
        const longitude = Number(args.p_longitude);
        const accuracy = Number(args.p_accuracy);
        const recordedAt = new Date(String(args.p_recorded_at ?? ""));
        if (
          !Number.isFinite(latitude) ||
          Math.abs(latitude) > 90 ||
          !Number.isFinite(longitude) ||
          Math.abs(longitude) > 180 ||
          !Number.isFinite(accuracy) ||
          accuracy < 0 ||
          accuracy > 100 ||
          Number.isNaN(recordedAt.getTime()) ||
          Math.abs(Date.now() - recordedAt.getTime()) > 30_000
        ) {
          return { data: null, error: { code: "22023", message: "Lokasi tidak valid." } };
        }

        const existing = tables.trip_live_locations.find((row) => row.trip_id === tripId);
        if (existing) {
          const previous = new Date(String(existing.recorded_at)).getTime();
          if (recordedAt.getTime() <= previous + 1_500) {
            return { data: [{ recorded_at: existing.recorded_at }], error: null };
          }
          existing.driver_id = DEV_DRIVER_RECORD.id;
          existing.latitude = latitude;
          existing.longitude = longitude;
          existing.accuracy_meters = accuracy;
          existing.recorded_at = recordedAt.toISOString();
          existing.updated_at = new Date().toISOString();
        } else {
          tables.trip_live_locations.push({
            trip_id: tripId,
            driver_id: DEV_DRIVER_RECORD.id,
            latitude,
            longitude,
            accuracy_meters: accuracy,
            recorded_at: recordedAt.toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        return { data: [{ recorded_at: recordedAt.toISOString() }], error: null };
      }

      if (name === "guardian_trip_location") {
        const tripId = String(args.p_trip_id ?? "");
        const trip = tables.trips.find((row) => row.id === tripId);
        const assignment = tables.trip_assignments.find((row) => row.id === trip?.assignment_id);
        const route = tables.routes.find((row) => row.id === assignment?.route_id);
        const requestedGuardianId = String(args.p_guardian_id ?? "");
        const guardian = tables.guardians.find(
          (row) =>
            row.id === (requestedGuardianId || DEV_GUARDIAN_VIEWERS.one.guardianId) &&
            row.active,
        );
        const placement = tables.student_route_stops.find((row) => {
          if (!guardian || row.route_id !== assignment?.route_id || !row.active || row.direction !== route?.direction) {
            return false;
          }
          const student = tables.students.find((entry) => entry.id === row.student_id);
          return student?.guardian_id === guardian.id && student?.service_status === "active";
        });

        if (!trip || !assignment || !route || !guardian || !placement) {
          return { data: null, error: { code: "42501", message: "Akses lokasi ditolak." } };
        }

        const location = tables.trip_live_locations.find((row) => row.trip_id === tripId);
        const recordedAt = location ? new Date(String(location.recorded_at)) : null;
        const fresh = Boolean(
          location &&
            trip.status === "in_progress" &&
            recordedAt &&
            !Number.isNaN(recordedAt.getTime()) &&
            Date.now() - recordedAt.getTime() <= 30_000,
        );

        return {
          data: [
            {
              trip_id: trip.id,
              trip_status: trip.status,
              latitude: fresh ? location?.latitude ?? null : null,
              longitude: fresh ? location?.longitude ?? null : null,
              accuracy_meters: fresh ? location?.accuracy_meters ?? null : null,
              recorded_at: location?.recorded_at ?? null,
              is_fresh: fresh,
            },
          ],
          error: null,
        };
      }

      if (name === "set_student_service_status") {
        const status = String(args.p_status ?? "");
        if (!SERVICE_STATUSES.has(status)) {
          return { data: null, error: { code: "22023", message: "Status layanan tidak dikenal." } };
        }

        const student = tables.students.find((row) => row.id === args.p_student_id);
        if (!student) return { data: null, error: { code: "P0002", message: "Siswa tidak ditemukan." } };

        const changedAt = new Date().toISOString();
        const previous = student.service_status;
        student.service_status = status;
        student.service_status_changed_at = changedAt;
        tables.student_service_status_history.push({
          id: tables.student_service_status_history.length + 1,
          student_id: student.id,
          previous_status: previous ?? null,
          new_status: status,
          reason: String(args.p_reason ?? ""),
          changed_at: changedAt,
          actor_profile_id: DEV_VIEWER.operator.userId,
        });

        return { data: null, error: null };
      }

      return { data: null, error: { message: `Fungsi ${name} belum tersedia pada dataset simulasi.` } };
    },
    auth: {
      async getUser() {
        return {
          data: {
            user: { id: DEV_VIEWER.operator.userId, email: DEV_VIEWER.operator.email, aud: "authenticated" },
          },
          error: null,
        };
      },
      async signOut() {
        return { error: null };
      },
      async signInWithPassword(_credentials: { email: string; password: string }) {
        return { data: { user: null, session: null }, error: { message: authMessage } };
      },
      async signInWithOtp(_options: { email: string; options?: Record<string, unknown> }) {
        return { data: { user: null, session: null }, error: { message: authMessage } };
      },
      async updateUser(_attributes: { password?: string }) {
        return { data: { user: null }, error: { message: authMessage } };
      },
      async exchangeCodeForSession(_code: string) {
        return { data: { session: null }, error: { message: authMessage } };
      },
    },
  };
}

export type SimulationClient = ReturnType<typeof createSimulationClient>;
