"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEV_DRIVER_RECORD, DEV_VIEWER, isDevOpenAccess } from "@/lib/dev-open-access";
import { createServerSupabase } from "@/lib/supabase/server";
import { supabaseNotConfiguredMessage } from "@/lib/supabase/env";
import { validateDeviceLocation } from "@/lib/driver/device-location";
import { isDuplicateStudentEvent } from "@/lib/driver/student-events";
import { evaluateTripEnd, SAFETY_CHECKS, studentsStillOnBus, type SafetyFieldName } from "@/lib/driver/trip-end";
import { failure, readText, success, type ActionState } from "@/lib/validation";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type DriverContext =
  | { ok: true; supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabase>>>; userId: string; driverId: string }
  | { ok: false; state: ActionState };

async function driverActionContext(): Promise<DriverContext> {
  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, state: failure(supabaseNotConfiguredMessage) };

  // Mode akses terbuka pengembangan (DEC-024): tindakan pengemudi dilayani identitas
  // simulasi. Pemeriksaan peran di bawah tetap utuh untuk mode normal.
  if (isDevOpenAccess()) {
    return { ok: true, supabase, userId: DEV_VIEWER.driver.userId, driverId: DEV_DRIVER_RECORD.id };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, state: failure("Sesi Anda sudah berakhir. Masuk kembali untuk melanjutkan.") };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "driver") {
    return { ok: false, state: failure("Akun Anda tidak memiliki izin area pengemudi untuk tindakan ini.") };
  }

  const { data: driver } = await supabase
    .from("drivers")
    .select("id")
    .eq("profile_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (!driver) return { ok: false, state: failure("Akun pengemudi belum ditautkan ke data pengemudi aktif.") };

  return { ok: true, supabase, userId: user.id, driverId: driver.id as string };
}

function backTo(target: string, message: string, kind: "success" | "error" = "success"): never {
  // Halaman operasional memakai ?tugas=<id>, jadi parameter pesan disambung dengan &.
  const separator = target.includes("?") ? "&" : "?";
  redirect(`${target}${separator}jenis=${kind}&pesan=${encodeURIComponent(message)}`);
}

/** Semua aksi kembali ke satu halaman operasional, bukan halaman detail terpisah. */
function taskPage(assignmentId: string) {
  return `/pengemudi?tugas=${encodeURIComponent(assignmentId)}`;
}

/** Confirms that the assignment really belongs to the signed-in driver before any write. */
async function ownedAssignment(ctx: Extract<DriverContext, { ok: true }>, assignmentId: string) {
  if (!assignmentId) return null;
  const { data } = await ctx.supabase
    .from("trip_assignments")
    .select("id, service_date, routes(route_name)")
    .eq("id", assignmentId)
    .eq("driver_id", ctx.driverId)
    .maybeSingle();
  return data;
}

export async function startTrip(formData: FormData) {
  const ctx = await driverActionContext();
  const assignmentId = readText(formData, "assignment_id");
  const target = taskPage(assignmentId);
  if (!ctx.ok) backTo(target, ctx.state.message, "error");

  const assignment = await ownedAssignment(ctx, assignmentId);
  if (!assignment) backTo("/pengemudi", "Penugasan tidak ditemukan untuk akun Anda.", "error");

  const { data: existing } = await ctx.supabase
    .from("trips")
    .select("id, status")
    .eq("assignment_id", assignmentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.status === "in_progress") {
    backTo(target, "Perjalanan untuk tugas ini sudah berjalan.", "error");
  }
  if (existing?.status === "completed") {
    backTo(target, "Perjalanan untuk tugas ini sudah selesai dan tidak dapat dimulai ulang.", "error");
  }

  const startedAt = new Date().toISOString();

  // Perjalanan terjadwal yang sudah dibuat saat penjadwalan dilanjutkan, bukan diduplikasi.
  const { error } = existing
    ? await ctx.supabase
        .from("trips")
        .update({ status: "in_progress", started_at: startedAt })
        .eq("id", existing.id)
        .eq("status", "scheduled")
    : await ctx.supabase.from("trips").insert({
        assignment_id: assignmentId,
        status: "in_progress",
        started_at: startedAt,
      });

  if (error) backTo(target, "Perjalanan belum dapat dimulai. Periksa koneksi lalu coba lagi.", "error");

  revalidatePath("/pengemudi");
  revalidatePath("/pengemudi/riwayat");
  backTo(target, "Perjalanan dimulai. Catat kehadiran siswa selama perjalanan.");
}

export async function confirmArrival(formData: FormData) {
  const ctx = await driverActionContext();
  const tripId = readText(formData, "trip_id");
  const assignmentId = readText(formData, "assignment_id");
  const target = taskPage(assignmentId);
  if (!ctx.ok) backTo(target, ctx.state.message, "error");
  if (!tripId) backTo(target, "Perjalanan tidak dikenali.", "error");

  const { data: tripData, error: tripError } = await ctx.supabase
    .from("trips")
    .select("id, status, arrived_at, trip_assignments(route_id, driver_id, routes(direction))")
    .eq("id", tripId)
    .eq("assignment_id", assignmentId)
    .maybeSingle();
  const trip = tripData as unknown as {
    id: string;
    status: string;
    arrived_at: string | null;
    trip_assignments: { route_id: string; driver_id: string; routes: { direction: string } | null } | null;
  } | null;
  if (tripError || !trip || !trip.trip_assignments || trip.trip_assignments.driver_id !== ctx.driverId) {
    backTo(target, "Perjalanan tidak ditemukan untuk akun Anda.", "error");
  }
  if (trip.status !== "in_progress") backTo(target, "Perjalanan tidak sedang berlangsung.", "error");
  if (trip.arrived_at) backTo(target, "Status seluruh penumpang sudah dituntaskan.", "success");

  const routeId = trip.trip_assignments.route_id;
  const direction = trip.trip_assignments.routes?.direction ?? "morning";
  const [rosterResult, eventsResult] = await Promise.all([
    ctx.supabase.from("student_route_stops").select("student_id")
      .eq("route_id", routeId).eq("direction", direction).eq("active", true),
    ctx.supabase.from("trip_student_events").select("student_id, event_type, occurred_at")
      .eq("trip_id", tripId).order("occurred_at", { ascending: false }),
  ]);
  if (rosterResult.error || eventsResult.error) {
    backTo(target, "Status seluruh penumpang belum dapat diperiksa. Coba lagi.", "error");
  }

  const rosterIds = [...new Set(((rosterResult.data ?? []) as { student_id: string }[]).map((row) => row.student_id))];
  const latestStatus = new Map<string, string>();
  for (const event of (eventsResult.data ?? []) as { student_id: string; event_type: string }[]) {
    if (!latestStatus.has(event.student_id)) latestStatus.set(event.student_id, event.event_type);
  }

  // Satu tindakan massal: pertahankan siswa Tidak Ikut dan status Turun yang sudah ada,
  // lalu catat Turun untuk semua siswa lain. Event lama tetap tersimpan sebagai riwayat.
  const studentsToMarkDown = rosterIds.filter((studentId) =>
    !["absent", "dropped_off"].includes(latestStatus.get(studentId) ?? ""),
  );
  if (studentsToMarkDown.length > 0) {
    const { error: insertError } = await ctx.supabase.from("trip_student_events").insert(
      studentsToMarkDown.map((studentId) => ({
        trip_id: tripId,
        student_id: studentId,
        event_type: "dropped_off",
        recorded_by: ctx.userId,
        notes: "Status Turun dikonfirmasi sekaligus oleh pengemudi.",
      })),
    );
    if (insertError) backTo(target, "Status Turun seluruh penumpang belum tersimpan. Coba lagi.", "error");
  }

  const { data, error } = await ctx.supabase.from("trips")
    .update({ arrived_at: new Date().toISOString() })
    .eq("id", tripId).eq("status", "in_progress").is("arrived_at", null)
    .select("id");
  if (error) backTo(target, "Konfirmasi seluruh penumpang belum tersimpan. Coba lagi.", "error");
  if (!data || data.length === 0) backTo(target, "Konfirmasi tidak dapat dicatat. Muat ulang halaman.", "error");

  revalidatePath("/pengemudi");
  revalidatePath("/admin/perjalanan");
  backTo(target, `Status Turun berhasil dicatat untuk ${studentsToMarkDown.length} siswa. Status Tidak Ikut tetap dipertahankan.`);
}

function readConfirmation(formData: FormData, name: SafetyFieldName) {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

export async function endTrip(formData: FormData) {
  const ctx = await driverActionContext();
  const tripId = readText(formData, "trip_id");
  const assignmentId = readText(formData, "assignment_id");
  const target = taskPage(assignmentId);
  if (!ctx.ok) backTo(target, ctx.state.message, "error");
  if (!tripId) backTo(target, "Perjalanan tidak dikenali.", "error");

  // Perjalanan harus milik pengemudi ini dan masih berjalan, bukan hanya cocok id.
  const { data: tripData } = await ctx.supabase
    .from("trips")
    .select("id, status, arrived_at, trip_assignments(route_id, driver_id, routes(direction))")
    .eq("id", tripId)
    .eq("assignment_id", assignmentId)
    .maybeSingle();

  const trip = tripData as unknown as {
    id: string;
    status: string;
    arrived_at: string | null;
    trip_assignments: { route_id: string; driver_id: string; routes: { direction: string } | null } | null;
  } | null;

  if (!trip || !trip.trip_assignments || trip.trip_assignments.driver_id !== ctx.driverId) {
    backTo(target, "Perjalanan tidak ditemukan untuk akun Anda.", "error");
  }
  if (trip.status !== "in_progress") {
    backTo(target, "Perjalanan ini belum berjalan atau sudah selesai.", "error");
  }

  const routeId = trip.trip_assignments.route_id;
  const direction = trip.trip_assignments.routes?.direction ?? "morning";

  const [rosterResult, eventsResult] = await Promise.all([
    ctx.supabase
      .from("student_route_stops")
      .select("student_id")
      .eq("route_id", routeId)
      .eq("direction", direction)
      .eq("active", true),
    ctx.supabase.from("trip_student_events").select("student_id, event_type, occurred_at").eq("trip_id", tripId).order("occurred_at", { ascending: false }),
  ]);

  if (rosterResult.error || eventsResult.error) {
    backTo(target, "Daftar siswa atau status perjalanan belum dapat dimuat. Coba lagi.", "error");
  }

  const rosterIds = ((rosterResult.data ?? []) as unknown as { student_id: string }[]).map((row) => row.student_id);
  const recordedIds = ((eventsResult.data ?? []) as unknown as { student_id: string }[]).map((row) => row.student_id);

  const confirmations = Object.fromEntries(
    SAFETY_CHECKS.map((check) => [check.name, readConfirmation(formData, check.name)]),
  ) as Record<SafetyFieldName, boolean>;

  const verdict = evaluateTripEnd({
    status: trip.status,
    arrivedAt: trip.arrived_at,
    rosterStudentIds: rosterIds,
    recordedStudentIds: recordedIds,
    confirmations,
    notes: readText(formData, "safety_notes"),
  });

  if (!verdict.ok) {
    backTo(target, verdict.problems[0], "error");
  }

  const openStudents = studentsStillOnBus(
    rosterIds,
    (eventsResult.data ?? []) as { student_id: string; event_type: string }[],
  ).length;
  if (openStudents > 0) {
    backTo(
      target,
      `${openStudents} siswa masih berstatus naik atau belum dipastikan turun. Catat status seluruh siswa dan pastikan tidak ada penumpang tertinggal di dalam bus sebelum mengakhiri perjalanan.`,
      "error",
    );
  }
  const belongingsNote = confirmations.safety_belongings_secured
    ? "Barang yang diketahui tertinggal di dalam bus diamankan; ketentuan tanggung jawab pengemudi telah dikonfirmasi."
    : null;
  const now = new Date().toISOString();
  const { data, error } = await ctx.supabase
    .from("trips")
    .update({
      status: "completed",
      completed_at: now,
      safety_checked_at: now,
      safety_check_notes: [verdict.notes, belongingsNote].filter(Boolean).join(" ") || null,
      student_count_confirmed: verdict.studentCount,
    })
    .eq("id", tripId)
    .eq("status", "in_progress")
    .select("id");

  if (error) backTo(target, "Perjalanan belum dapat diakhiri. Coba lagi.", "error");
  if (!data || data.length === 0) {
    backTo(target, "Perjalanan ini sedang berlangsung dan tidak dapat diubah. Muat ulang halaman.", "error");
  }

  revalidatePath("/pengemudi");
  revalidatePath("/pengemudi/riwayat");
  revalidatePath("/admin/perjalanan");
  // Review perjalanan yang baru selesai ditampilkan sebagai papan mengambang di atas dashboard.
  backTo(
    `/pengemudi/review/${encodeURIComponent(tripId)}`,
    "Perjalanan selesai. Riwayat tersimpan dan tidak dapat dihapus.",
  );
}

const eventTypes = ["boarded", "dropped_off", "absent", "issue"];

export async function publishDriverLocation(
  tripId: string,
  input: { latitude: number; longitude: number; accuracy: number; timestamp: number },
) {
  const ctx = await driverActionContext();
  if (!ctx.ok) return { ok: false, message: ctx.state.message };
  if (!UUID_PATTERN.test(tripId)) {
    return { ok: false, message: "Perjalanan tidak dikenali." };
  }

  const checked = validateDeviceLocation(input);
  if (!checked.ok) {
    return {
      ok: false,
      message:
        checked.reason === "accuracy"
          ? "Akurasi GPS HP belum cukup untuk dibagikan."
          : checked.reason === "stale"
            ? "Sampel GPS HP sudah lama. Menunggu posisi baru."
            : "Koordinat GPS HP tidak valid.",
    };
  }

  const { error } = await ctx.supabase.rpc("driver_publish_trip_location", {
    p_trip_id: tripId,
    p_latitude: checked.location.latitude,
    p_longitude: checked.location.longitude,
    p_accuracy: checked.location.accuracy,
    p_recorded_at: new Date(checked.location.timestamp).toISOString(),
  });

  if (error) {
    // RPC/RLS is the authority; the UI only reports that sharing did not happen.
    return { ok: false, message: "Lokasi HP belum dapat dibagikan ke wali." };
  }

  return { ok: true, message: "Lokasi HP dibagikan ke wali." };
}

type StudentEventOutcome = {
  state: ActionState;
  eventType?: string;
  notes?: string | null;
};

/**
 * Shared validation for the redirect and state-based passenger actions. The
 * student must belong to the signed-in driver's in-progress trip, and a repeated
 * submit of the same event within ten seconds is treated as one action so a
 * double click cannot duplicate history rows.
 */
async function recordStudentEventCore(formData: FormData): Promise<StudentEventOutcome> {
  const ctx = await driverActionContext();
  const tripId = readText(formData, "trip_id");
  const studentId = readText(formData, "student_id");
  const eventType = readText(formData, "event_type");
  const notes = readText(formData, "notes");
  if (!ctx.ok) return { state: ctx.state };

  if (!eventTypes.includes(eventType)) return { state: failure("Jenis status siswa tidak dikenali.") };
  if (!studentId) return { state: failure("Siswa tidak dikenali.") };
  if (eventType === "issue" && notes.length < 5) {
    return { state: failure("Catatan kendala wajib diisi minimal 5 karakter.") };
  }

  const { data: trip } = await ctx.supabase
    .from("trips")
    .select("id, status, trip_assignments(route_id, driver_id)")
    .eq("id", tripId)
    .maybeSingle();

  const assignment = trip?.trip_assignments as unknown as { route_id: string; driver_id: string } | null;
  if (!trip || !assignment || assignment.driver_id !== ctx.driverId) {
    return { state: failure("Perjalanan tidak ditemukan untuk akun Anda.") };
  }
  if (trip.status !== "in_progress") {
    return { state: failure("Status siswa hanya dapat dicatat selama perjalanan berlangsung.") };
  }

  // The student must be on this route's active roster; arbitrary student ids are refused.
  const { data: roster } = await ctx.supabase
    .from("student_route_stops")
    .select("id")
    .eq("route_id", assignment.route_id)
    .eq("student_id", studentId)
    .eq("active", true)
    .maybeSingle();

  if (!roster) return { state: failure("Siswa tersebut tidak terdaftar pada rute perjalanan ini.") };

  const { data: latest } = await ctx.supabase
    .from("trip_student_events")
    .select("event_type, notes, occurred_at")
    .eq("trip_id", tripId)
    .eq("student_id", studentId)
    .order("occurred_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const latestEvent = latest as { event_type: string; notes: string | null; occurred_at: string } | null;
  if (isDuplicateStudentEvent(latestEvent, eventType)) {
    revalidatePath("/pengemudi");
    return {
      state: success("Status siswa tersebut sudah tercatat. Tidak ada data ganda yang dibuat."),
      eventType,
      notes: latestEvent?.notes ?? null,
    };
  }

  const { error } = await ctx.supabase.from("trip_student_events").insert({
    trip_id: tripId,
    student_id: studentId,
    event_type: eventType,
    recorded_by: ctx.userId,
    notes: notes || null,
  });

  if (error) return { state: failure("Status siswa belum tersimpan. Coba lagi.") };

  revalidatePath("/pengemudi");
  return {
    state: success("Status siswa tercatat pada perjalanan ini."),
    eventType,
    notes: notes || null,
  };
}

export async function recordStudentEvent(formData: FormData) {
  const assignmentId = readText(formData, "assignment_id");
  const target = taskPage(assignmentId);
  const outcome = await recordStudentEventCore(formData);
  backTo(target, outcome.state.message, outcome.state.status === "error" ? "error" : "success");
}

/** State-based variant used by the client controls to show the newest status immediately. */
export async function recordStudentEventState(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState & { eventType?: string; notes?: string | null }> {
  const outcome = await recordStudentEventCore(formData);
  return { ...outcome.state, eventType: outcome.eventType, notes: outcome.notes };
}
