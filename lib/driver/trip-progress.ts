/**
 * Turunan status perjalanan pengemudi.
 *
 * Satu modul ini menjadi sumber untuk papan progres, jumlah siswa di kendaraan,
 * dan pemberhentian berikutnya. Semua angka dihitung dari status terbaru per
 * siswa pada `trip_student_events`; tidak ada status baru dan tidak ada angka
 * simulasi di aplikasi.
 *
 * Catatan `issue` adalah kendala, bukan status kehadiran. Catatan itu tidak
 * menimpa status naik/turun/tidak ikut, tetapi tetap disimpan untuk ditampilkan.
 */

export type TripStatusEvent = {
  student_id: string;
  event_type: string;
  occurred_at: string;
  notes?: string | null;
};

export type StudentTripState = {
  status: string | null;
  /** Catatan pada event status terbaru (mis. alasan tidak ikut bus). */
  statusNotes: string | null;
  statusAt: string | null;
  issueNote: string | null;
  hasIssue: boolean;
  /** Ada event apa pun, termasuk issue. Dipakai alur penutupan yang sudah ada. */
  hasAnyEvent: boolean;
  lastEventAt: string | null;
};

export type TripDirection = "pickup" | "dropoff";

export type ProgressStudent = {
  admissionsNumber?: string | null;
  id: string;
  name: string;
  stopId: string;
  stopOrder: number;
  stopName: string;
  address: string | null;
  status: string | null;
  statusNotes: string | null;
};

export type TripProgress = {
  kind: TripDirection;
  kindLabel: "Penjemputan" | "Pengantaran";
  doneLabel: "Sudah dijemput" | "Sudah diantar";
  waitingLabel: "Belum dijemput" | "Belum diantar";
  onboardLabel: "Di kendaraan";
  total: number;
  done: number;
  waiting: number;
  absent: number;
  /** Bagian dari `absent` dengan alasan tidak hadir. */
  noShow: number;
  /** Bagian dari `absent` yang tidak ikut bus/diantar orang tua. */
  notRiding: number;
  onboard: number;
  processed: number;
  needsAction: number;
  percent: number;
  tripStatus: string;
};

export type NextStopStudent = {
  admissionsNumber?: string | null;
  id: string;
  name: string;
  status: string | null;
};

export type NextStopGroup = {
  stopId: string;
  order: number;
  name: string;
  addresses: string[];
  students: NextStopStudent[];
  count: number;
  kindLabel: "Penjemputan berikutnya" | "Pengantaran berikutnya";
  statusLabel: "Menunggu penjemputan" | "Menunggu pengantaran";
};

export type NextStopResult = {
  target: NextStopGroup | null;
  /** Semua siswa pada titik non-sekolah sudah memiliki hasil akhir. */
  allStopsDone: boolean;
  /** Perjalanan berhenti sebelum semua siswa selesai. */
  closedReason: "cancelled" | "completed_early" | null;
  /** Siswa yang masih menunggu tindakan untuk arah perjalanan ini. */
  waitingStudents: number;
};

type StopInput = {
  id: string;
  stop_order: number;
  stop_name: string;
  is_school: boolean;
};

/**
 * Status terbaru per siswa. Event diurutkan berdasarkan waktu; event yang datang
 * terlambat dengan waktu lebih lama tidak boleh menimpa status yang lebih baru.
 * Event berulang tidak menambah hitungan karena hasilnya tetap satu status per siswa.
 */
export function resolveStudentTripStates(events: TripStatusEvent[]): Map<string, StudentTripState> {
  const ordered = events
    .map((event, index) => ({ event, index }))
    .sort((left, right) => {
      // Baris lama/simulasi bisa tidak memiliki waktu; jangan hentikan halaman.
      const time = (left.event.occurred_at ?? "").localeCompare(right.event.occurred_at ?? "");
      return time !== 0 ? time : left.index - right.index;
    });

  const states = new Map<string, StudentTripState>();

  for (const { event } of ordered) {
    const current = states.get(event.student_id) ?? {
      status: null,
      statusNotes: null,
      statusAt: null,
      issueNote: null,
      hasIssue: false,
      hasAnyEvent: false,
      lastEventAt: null,
    };

    const next: StudentTripState = {
      ...current,
      hasAnyEvent: true,
      lastEventAt:
        !current.lastEventAt || event.occurred_at > current.lastEventAt
          ? event.occurred_at
          : current.lastEventAt,
    };

    if (event.event_type === "issue") {
      next.hasIssue = true;
      next.issueNote = event.notes?.trim() || current.issueNote;
    } else {
      next.status = event.event_type;
      next.statusNotes = event.notes?.trim() || null;
      next.statusAt = event.occurred_at;
    }

    states.set(event.student_id, next);
  }

  return states;
}

function normalizedDirection(direction: string): TripDirection {
  return direction === "afternoon" ? "dropoff" : "pickup";
}

function isAbsent(status: string | null): boolean {
  return status === "absent";
}

/** Pagi: siswa sudah dijemput bila sudah naik atau sudah turun di sekolah. */
function isPickupDone(status: string | null): boolean {
  return status === "boarded" || status === "dropped_off";
}

/** Sore: siswa baru selesai setelah tindakan turun tersimpan. */
function isDropoffDone(status: string | null): boolean {
  return status === "dropped_off";
}

export function isStudentDoneForDirection(status: string | null, direction: string): boolean {
  return normalizedDirection(direction) === "dropoff" ? isDropoffDone(status) : isPickupDone(status);
}

export function isStudentPendingForDirection(status: string | null, direction: string): boolean {
  if (isAbsent(status)) return false;
  return !isStudentDoneForDirection(status, direction);
}

/** Memisahkan alasan tidak ikut yang sudah tersimpan pada notes. */
export function absenceKind(notes: string | null | undefined): "no_show" | "not_riding" {
  const value = (notes ?? "").toLocaleLowerCase("id-ID");
  return value.includes("tidak hadir") ? "no_show" : "not_riding";
}

function uniqueStudents(students: ProgressStudent[]): ProgressStudent[] {
  const seen = new Set<string>();
  return students.filter((student) => {
    if (seen.has(student.id)) return false;
    seen.add(student.id);
    return true;
  });
}

export function buildTripProgress(input: {
  students: ProgressStudent[];
  direction: string;
  tripStatus: string;
}): TripProgress {
  const kind = normalizedDirection(input.direction);
  const students = uniqueStudents(input.students);
  const total = students.length;

  let done = 0;
  let absent = 0;
  let onboard = 0;
  let noShow = 0;
  let notRiding = 0;

  for (const student of students) {
    if (isAbsent(student.status)) {
      absent += 1;
      if (absenceKind(student.statusNotes) === "no_show") noShow += 1;
      else notRiding += 1;
      continue;
    }

    if (isStudentDoneForDirection(student.status, input.direction)) done += 1;
    if (student.status === "boarded") onboard += 1;
  }

  const waiting = total - done - absent;
  const processed = done + absent;
  const closed = input.tripStatus === "completed" || input.tripStatus === "cancelled";

  return {
    kind,
    kindLabel: kind === "dropoff" ? "Pengantaran" : "Penjemputan",
    doneLabel: kind === "dropoff" ? "Sudah diantar" : "Sudah dijemput",
    waitingLabel: kind === "dropoff" ? "Belum diantar" : "Belum dijemput",
    onboardLabel: "Di kendaraan",
    total,
    done,
    waiting,
    absent,
    noShow,
    notRiding,
    onboard,
    processed,
    needsAction: closed ? 0 : waiting,
    percent: total === 0 ? 0 : Math.round((processed / total) * 100),
    tripStatus: input.tripStatus,
  };
}

/**
 * Pemberhentian berikutnya adalah kelompok siswa pertama menurut `stop_order`
 * yang masih membutuhkan tindakan untuk arah perjalanan ini. Pengelompokan hanya
 * memakai `stop_id`; nama atau alamat yang mirip tidak digabung.
 */
export function buildNextStop(input: {
  stops: StopInput[];
  students: ProgressStudent[];
  direction: string;
  tripStatus: string;
}): NextStopResult {
  const kind = normalizedDirection(input.direction);
  const students = uniqueStudents(input.students);
  const waitingStudents = students.filter((student) =>
    isStudentPendingForDirection(student.status, input.direction),
  );
  const pendingByStop = new Map<string, ProgressStudent[]>();

  for (const student of waitingStudents) {
    const list = pendingByStop.get(student.stopId) ?? [];
    list.push(student);
    pendingByStop.set(student.stopId, list);
  }

  const orderedStops = [...input.stops].sort((left, right) => left.stop_order - right.stop_order);
  let target: NextStopGroup | null = null;

  if (input.tripStatus !== "completed" && input.tripStatus !== "cancelled") {
    for (const stop of orderedStops) {
      if (stop.is_school) continue;
      const pending = pendingByStop.get(stop.id) ?? [];
      if (pending.length === 0) continue;

      target = {
        stopId: stop.id,
        order: stop.stop_order,
        name: stop.stop_name,
        addresses: Array.from(
          new Set(
            pending
              .map((student) => student.address?.trim())
              .filter((address): address is string => Boolean(address)),
          ),
        ),
        students: pending.map((student) => ({
          id: student.id,
          name: student.name,
          admissionsNumber: student.admissionsNumber ?? null,
          status: student.status,
        })),
        count: pending.length,
        kindLabel: kind === "dropoff" ? "Pengantaran berikutnya" : "Penjemputan berikutnya",
        statusLabel: kind === "dropoff" ? "Menunggu pengantaran" : "Menunggu penjemputan",
      };
      break;
    }
  }

  const allStopsDone = waitingStudents.length === 0;
  const closedReason =
    input.tripStatus === "cancelled"
      ? "cancelled"
      : input.tripStatus === "completed" && !allStopsDone
        ? "completed_early"
        : null;

  return {
    target,
    allStopsDone,
    closedReason,
    waitingStudents: waitingStudents.length,
  };
}
