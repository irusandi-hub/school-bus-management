import type { ServerSupabase } from "@/lib/admin/support";
import type { StudentRow } from "@/lib/types";
import { serviceDateInTimeZone } from "../validation.ts";

export type Placement = {
  id: string;
  direction: string;
  routeId: string;
  routeName: string;
  schoolName: string;
  stopName: string;
  stopOrder: number;
};

export type TodayTrip = {
  tripId: string | null;
  routeId: string;
  direction: string;
  status: string;
  busCode: string | null;
  plateNumber: string | null;
  busCapacity: number | null;
  /** Penugasan sudah memiliki pengemudi; nama pengemudi tidak dibagikan ke portal wali. */
  driverAssigned: boolean;
  startedAt: string | null;
  arrivedAt: string | null;
  completedAt: string | null;
};

export type ChildOverview = {
  student: StudentRow;
  placements: Placement[];
  todayTrips: TodayTrip[];
};

/**
 * The service day follows the pilot timezone (Asia/Riyadh), exactly like the Operator
 * dashboard and assignment form. Using the server's local date here would hide the
 * current trip for the first hours of the Riyadh day on a UTC host.
 */
export function todayDate(date: Date = new Date()) {
  return serviceDateInTimeZone(date);
}

export async function loadChildren(supabase: ServerSupabase, guardianId?: string): Promise<ChildOverview[]> {
  const studentQuery = supabase
    .from("students")
    .select(
      "id, admissions_number, full_name, date_of_birth, school_id, guardian_id, home_address, home_latitude, home_longitude, pickup_notes, service_status, service_status_changed_at, schools(name, city), guardians(full_name, email, phone)",
    )
    .eq("service_status", "active");
  const scopedQuery = guardianId ? studentQuery.eq("guardian_id", guardianId) : studentQuery;
  const { data } = await scopedQuery.order("full_name", { ascending: true });

  const students = (data ?? []) as unknown as StudentRow[];
  if (students.length === 0) return [];

  const today = todayDate();
  const studentIds = students.map((student) => student.id);
  const { data: placementRows } = await supabase
    .from("student_route_stops")
    .select("id, student_id, direction, routes(id, route_name, school_name), route_stops(stop_name, stop_order)")
    .in("student_id", studentIds)
    .eq("active", true);

  const placementsByStudent = new Map<string, Placement[]>();
  for (const row of (placementRows ?? []) as unknown as {
    id: string;
    student_id: string;
    direction: string;
    routes: { id: string; route_name: string; school_name: string } | null;
    route_stops: { stop_name: string; stop_order: number } | null;
  }[]) {
    if (!row.routes?.id) continue;
    const placements = placementsByStudent.get(row.student_id) ?? [];
    placements.push({
      id: row.id,
      direction: row.direction,
      routeId: row.routes.id,
      routeName: row.routes.route_name,
      schoolName: row.routes.school_name,
      stopName: row.route_stops?.stop_name ?? "",
      stopOrder: row.route_stops?.stop_order ?? 0,
    });
    placementsByStudent.set(row.student_id, placements);
  }

  const routeIds = Array.from(
    new Set(Array.from(placementsByStudent.values()).flatMap((placements) => placements.map((item) => item.routeId))),
  );
  const assignmentsByRoute = new Map<string, TodayTrip[]>();

  if (routeIds.length > 0) {
    const { data: assignmentRows } = await supabase
      .from("trip_assignments")
      .select(
        "route_id, driver_id, service_date, buses(fleet_code, plate_number, capacity), trips(id, status, started_at, arrived_at, completed_at)",
      )
      .in("route_id", routeIds)
      .eq("service_date", today);

    for (const row of (assignmentRows ?? []) as unknown as {
      route_id: string;
      driver_id: string | null;
      buses: { fleet_code: string; plate_number: string | null; capacity: number } | null;
      trips: {
        id: string;
        status: string;
        started_at: string | null;
        arrived_at: string | null;
        completed_at: string | null;
      }[];
    }[]) {
      const trip = row.trips?.[0];
      const trips = assignmentsByRoute.get(row.route_id) ?? [];
      trips.push({
        tripId: trip?.id ?? null,
        routeId: row.route_id,
        direction: "morning",
        status: trip?.status ?? "scheduled",
        busCode: row.buses?.fleet_code ?? null,
        plateNumber: row.buses?.plate_number ?? null,
        busCapacity: row.buses?.capacity ?? null,
        driverAssigned: Boolean(row.driver_id),
        startedAt: trip?.started_at ?? null,
        arrivedAt: trip?.arrived_at ?? null,
        completedAt: trip?.completed_at ?? null,
      });
      assignmentsByRoute.set(row.route_id, trips);
    }
  }

  return students.map((student) => {
    const placements = placementsByStudent.get(student.id) ?? [];
    const todayTrips = placements.flatMap((placement) =>
      (assignmentsByRoute.get(placement.routeId) ?? []).map((trip) => ({
        ...trip,
        direction: placement.direction,
      })),
    );
    return { student, placements, todayTrips };
  });
}

export type StudentTripEvent = {
  tripId: string;
  studentId: string;
  eventType: string;
  occurredAt: string;
};

export function liveEventKey(tripId: string, studentId: string) {
  return `${tripId}:${studentId}`;
}

/**
 * Catatan kehadiran terbaru per siswa pada perjalanan hari ini.
 * Kunci peta memakai liveEventKey(tripId, studentId) agar setiap anak memakai
 * perjalanannya sendiri, termasuk ketika satu akun memiliki beberapa anak.
 *
 * Hanya event kehadiran yang diambil. Event "issue" adalah catatan kendala dan
 * tidak boleh menimpa status naik/turun anak atau membuka akses kamera.
 */
export async function loadTodayStudentEvents(
  supabase: ServerSupabase,
  children: ChildOverview[],
): Promise<Map<string, StudentTripEvent>> {
  const tripIds = Array.from(
    new Set(children.flatMap((child) => child.todayTrips.map((trip) => trip.tripId)).filter(Boolean) as string[]),
  );
  const studentIds = children.map((child) => child.student.id);
  const events = new Map<string, StudentTripEvent>();
  if (tripIds.length === 0 || studentIds.length === 0) return events;

  const { data } = await supabase
    .from("trip_student_events")
    .select("trip_id, student_id, event_type, occurred_at")
    .in("trip_id", tripIds)
    .in("student_id", studentIds)
    .in("event_type", ["boarded", "dropped_off", "absent"])
    .order("occurred_at", { ascending: false });

  for (const row of (data ?? []) as unknown as {
    trip_id: string;
    student_id: string;
    event_type: string;
    occurred_at: string;
  }[]) {
    const key = liveEventKey(row.trip_id, row.student_id);
    if (events.has(key)) continue;
    events.set(key, {
      tripId: row.trip_id,
      studentId: row.student_id,
      eventType: row.event_type,
      occurredAt: row.occurred_at,
    });
  }

  return events;
}

export type ChildTrip = {
  id: string;
  serviceDate: string;
  status: string;
  routeName: string;
  schoolName: string;
  direction: string;
  busCode: string | null;
  startedAt: string | null;
  arrivedAt: string | null;
  completedAt: string | null;
};

export async function loadChildTrips(
  supabase: ServerSupabase,
  routeIds: string[],
  limit = 10,
): Promise<ChildTrip[]> {
  if (routeIds.length === 0) return [];

  const { data } = await supabase
    .from("trips")
    .select(
      "id, status, started_at, arrived_at, completed_at, created_at, trip_assignments!inner(service_date, route_id, routes(route_name, school_name, direction), buses(fleet_code))",
    )
    .in("trip_assignments.route_id", routeIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as unknown as {
    id: string;
    status: string;
    started_at: string | null;
    arrived_at: string | null;
    completed_at: string | null;
    created_at: string;
    trip_assignments: {
      service_date: string;
      routes: { route_name: string; school_name: string; direction: string } | null;
      buses: { fleet_code: string } | null;
    } | null;
  }[]).map((trip) => ({
    id: trip.id,
    serviceDate: trip.trip_assignments?.service_date ?? trip.created_at,
    status: trip.status,
    routeName: trip.trip_assignments?.routes?.route_name ?? "Rute",
    schoolName: trip.trip_assignments?.routes?.school_name ?? "",
    direction: trip.trip_assignments?.routes?.direction ?? "morning",
    busCode: trip.trip_assignments?.buses?.fleet_code ?? null,
    startedAt: trip.started_at,
    arrivedAt: trip.arrived_at,
    completedAt: trip.completed_at,
  }));
}
