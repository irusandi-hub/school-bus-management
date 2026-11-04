/**
 * Perencanaan navigasi pengemudi.
 *
 * Status setiap titik diturunkan dari data yang benar-benar tersimpan:
 * urutan rute, siswa yang ditempatkan pada titik, dan catatan kehadiran
 * pengemudi. Tidak ada GPS dan tidak ada status yang dikarang.
 *
 * Konsekuensinya penting untuk ditampilkan di UI: "Menuju lokasi" berarti titik
 * berikutnya menurut urutan rute, bukan posisi bus yang dilacak.
 */


/**
 * Cek koordinat yang sama dengan hasValidCoordinates() pada lib/navigation/external.
 * Sengaja ditulis lokal agar modul aturan ini tetap dapat diuji tanpa resolver alias.
 */
function hasStoredCoordinates(stop: { latitude: number | null; longitude: number | null }) {
  const { latitude, longitude } = stop;
  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    Math.abs(latitude) <= 90 &&
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    Math.abs(longitude) <= 180
  );
}

export type NavigationStopStatus = "waiting" | "heading" | "arrived" | "done";

export type RouteStopInput = {
  id: string;
  stop_order: number;
  stop_name: string;
  latitude: number | null;
  longitude: number | null;
  is_school: boolean;
};

export type NavigationRosterEntry = {
  student_id: string;
  stop_id: string;
  students: {
    full_name: string;
    home_address?: string | null;
    pickup_notes?: string | null;
  } | null;
};

export type NavigationEvent = {
  student_id: string;
  event_type: string;
  occurred_at: string;
};

export type NavigationTrip = {
  status: string;
  started_at?: string | null;
  arrived_at?: string | null;
  completed_at?: string | null;
};

export type NavigationStopStudent = {
  id: string;
  name: string;
  pickupNotes: string | null;
};

export type NavigationStop = {
  id: string;
  order: number;
  name: string;
  isSchool: boolean;
  latitude: number | null;
  longitude: number | null;
  status: NavigationStopStatus;
  students: NavigationStopStudent[];
  /** Alamat rumah siswa pada titik ini, dari data induk. */
  addresses: string[];
  hasCoordinates: boolean;
};

export type NavigationOrigin = {
  label: string;
  detail: string;
  latitude: number | null;
  longitude: number | null;
};

export type NavigationPlan = {
  stops: NavigationStop[];
  /** Titik yang dituju sekarang (null bila perjalanan selesai atau belum ada titik). */
  target: NavigationStop | null;
  /** Titik pertama rute, dipakai sebelum perjalanan dimulai. */
  firstStop: NavigationStop | null;
  origin: NavigationOrigin;
  started: boolean;
  completed: boolean;
  /** Selalu false: posisi bus belum dilacak. Dipakai UI untuk tidak mengklaim GPS. */
  tracking: false;
  lastEventAt: string | null;
};

export const STOP_STATUS_LABEL: Record<NavigationStopStatus, string> = {
  waiting: "Menunggu",
  heading: "Menuju lokasi",
  arrived: "Tiba",
  done: "Selesai",
};

export const STOP_STATUS_TONE: Record<NavigationStopStatus, "neutral" | "info" | "warning" | "success"> = {
  waiting: "neutral",
  heading: "info",
  arrived: "warning",
  done: "success",
};

function normalizeCoordinate(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function buildNavigationPlan(input: {
  stops: RouteStopInput[];
  roster: NavigationRosterEntry[];
  events: NavigationEvent[];
  trip: NavigationTrip | null;
  direction: string;
}): NavigationPlan {
  const { stops, roster, events, trip } = input;
  const started = Boolean(trip && trip.status !== "scheduled" && trip.started_at);
  const completed = trip?.status === "completed";

  const recordedStudents = new Set(events.map((event) => event.student_id));
  const studentsByStop = new Map<string, NavigationRosterEntry[]>();
  for (const entry of roster) {
    const list = studentsByStop.get(entry.stop_id) ?? [];
    list.push(entry);
    studentsByStop.set(entry.stop_id, list);
  }

  const ordered = [...stops].sort((a, b) => a.stop_order - b.stop_order);

  const planned: NavigationStop[] = ordered.map((stop) => {
    const entries = studentsByStop.get(stop.id) ?? [];
    const students: NavigationStopStudent[] = entries.map((entry) => ({
      id: entry.student_id,
      name: entry.students?.full_name ?? "Siswa",
      pickupNotes: entry.students?.pickup_notes ?? null,
    }));
    const addresses = entries
      .map((entry) => entry.students?.home_address)
      .filter((address): address is string => Boolean(address && address.trim()));

    return {
      id: stop.id,
      order: stop.stop_order,
      name: stop.stop_name,
      isSchool: stop.is_school,
      latitude: normalizeCoordinate(stop.latitude),
      longitude: normalizeCoordinate(stop.longitude),
      status: "waiting" as NavigationStopStatus,
      students,
      addresses: Array.from(new Set(addresses)),
      hasCoordinates: hasStoredCoordinates(stop),
    };
  });

  // Semua titik selesai ketika perjalanan sudah ditutup.
  if (completed) {
    for (const stop of planned) stop.status = "done";
  } else if (started) {
    for (const stop of planned) {
      if (stop.isSchool) {
        if (trip?.arrived_at) stop.status = "arrived";
        continue;
      }
      const entries = studentsByStop.get(stop.id) ?? [];
      const allRecorded =
        entries.length > 0 && entries.every((entry) => recordedStudents.has(entry.student_id));
      if (allRecorded) stop.status = "done";
    }

    const next = planned.find((stop) => stop.status === "waiting");
    if (next) next.status = "heading";
  }

  const target = completed ? null : (planned.find((stop) => stop.status === "heading") ?? null);

  // Rute sore dimulai dari sekolah; rute pagi tidak punya data garasi.
  const schoolStop = planned.find((stop) => stop.isSchool) ?? null;
  const origin: NavigationOrigin =
    input.direction === "afternoon" && schoolStop
      ? {
          label: "Sekolah",
          detail: `${schoolStop.name} · titik awal rute sore`,
          latitude: schoolStop.latitude,
          longitude: schoolStop.longitude,
        }
      : {
          label: "Lokasi awal",
          detail: "Garasi atau lokasi awal belum dicatat pada data rute.",
          latitude: null,
          longitude: null,
        };

  const lastEventAt = events.reduce<string | null>((latest, event) => {
    if (!latest) return event.occurred_at;
    return event.occurred_at > latest ? event.occurred_at : latest;
  }, null);

  return {
    stops: planned,
    target,
    firstStop: planned[0] ?? null,
    origin,
    started,
    completed,
    tracking: false,
    lastEventAt,
  };
}

/** Tujuan yang dipakai tombol navigasi: titik berjalan, atau titik pertama sebelum mulai. */
export function navigationDestination(plan: NavigationPlan): NavigationStop | null {
  if (plan.completed) return null;
  // Perjalanan yang sudah berjalan tidak pernah kembali ke titik pertama.
  if (plan.started) return plan.target;
  return plan.target ?? plan.firstStop;
}

/** Ringkasan singkat untuk tombol dan kartu. */
export function describeTarget(plan: NavigationPlan): string {
  const destination = navigationDestination(plan);
  if (!destination) return plan.stops.length === 0 ? "Rute belum memiliki titik" : "Perjalanan selesai";
  if (plan.target) return `Tujuan berikutnya · titik ${destination.order}`;
  return `Titik pertama · ${destination.order} dari ${plan.stops.length}`;
}
