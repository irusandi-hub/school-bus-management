"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEV_DRIVER_RECORD, DEV_VIEWER, isDevOpenAccess } from "@/lib/dev-open-access";
import { createServerSupabase } from "@/lib/supabase/server";
import { supabaseNotConfiguredMessage } from "@/lib/supabase/env";
import { validateDeviceLocation } from "@/lib/driver/device-location";
import { evaluateTripEnd, SAFETY_CHECKS, type SafetyFieldName } from "@/lib/driver/trip-end";
import { failure, readText, type ActionState } from "@/lib/validation";

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

  const { data, error } = await ctx.supabase
    .from("trips")
    .update({ arrived_at: new Date().toISOString() })
    .eq("id", tripId)
    .eq("status", "in_progress")
    .select("id");

  if (error) backTo(target, "Konfirmasi tiba belum tersimpan. Coba lagi.", "error");
  if (!data || data.length === 0) {
    backTo(target, "Konfirmasi tiba tidak dapat dicatat karena perjalanan ini sedang berlangsung.", "error");
  }

  revalidatePath("/pengemudi");
  revalidatePath("/admin/perjalanan");
  backTo(target, "Tiba di sekolah tercatat. Lanjutkan penurunan siswa bila diperlukan.");
}

function readConfirmation(formData: FormData, name: SafetyFieldName) {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

export async function endTrip(formData: FormData) {
  const ctx = await driverActionContext();
  const tripId = readText(formData, "trip_id");
  const assignmentId = readText(formData, "assignment_id");
  const acknowledged = readText(formData, "acknowledge_open");
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

  const latest = new Map<string, string>();
  for (const event of (eventsResult.data ?? []) as { student_id: string; event_type: string }[]) {
    if (!latest.has(event.student_id)) latest.set(event.student_id, event.event_type);
  }
  const openStudents = rosterIds.filter((id) => !latest.has(id) || latest.get(id) === "boarded").length;
  if (openStudents > 0 && acknowledged !== "1") {
    backTo(target, `${openStudents} siswa masih berstatus naik. Periksa kabin dan konfirmasi status siswa sebelum mengakhiri perjalanan.`, "error");
  }
  const exceptionNote = openStudents > 0 ? `Pemeriksaan kabin dikonfirmasi untuk ${openStudents} siswa dengan status naik.` : null;
  const now = new Date().toISOString();
  const { data, error } = await ctx.supabase
    .from("trips")
    .update({
      status: "completed",
      completed_at: now,
      safety_checked_at: now,
      safety_check_notes: [verdict.notes, exceptionNote].filter(Boolean).join(" ") || null,
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
  backTo(target, "Perjalanan selesai. Riwayat tersimpan dan tidak dapat dihapus.");
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

export async function recordStudentEvent(formData: FormData) {
  const ctx = await driverActionContext();
  const tripId = readText(formData, "trip_id");
  const assignmentId = readText(formData, "assignment_id");
  const studentId = readText(formData, "student_id");
  const eventType = readText(formData, "event_type");
  const notes = readText(formData, "notes");
  const target = taskPage(assignmentId);
  if (!ctx.ok) backTo(target, ctx.state.message, "error");

  if (!eventTypes.includes(eventType)) backTo(target, "Jenis status siswa tidak dikenali.", "error");
  if (!studentId) backTo(target, "Siswa tidak dikenali.", "error");
  if (eventType === "issue" && notes.length < 5) {
    backTo(target, "Catatan kendala wajib diisi minimal 5 karakter.", "error");
  }

  const { data: trip } = await ctx.supabase
    .from("trips")
    .select("id, status, trip_assignments(route_id, driver_id)")
    .eq("id", tripId)
    .maybeSingle();

  const assignment = trip?.trip_assignments as unknown as { route_id: string; driver_id: string } | null;
  if (!trip || !assignment || assignment.driver_id !== ctx.driverId) {
    backTo(target, "Perjalanan tidak ditemukan untuk akun Anda.", "error");
  }
  if (trip.status !== "in_progress") {
    backTo(target, "Status siswa hanya dapat dicatat selama perjalanan berlangsung.", "error");
  }

  // The student must be on this route's active roster; arbitrary student ids are refused.
  const { data: roster } = await ctx.supabase
    .from("student_route_stops")
    .select("id")
    .eq("route_id", assignment.route_id)
    .eq("student_id", studentId)
    .eq("active", true)
    .maybeSingle();

  if (!roster) backTo(target, "Siswa tersebut tidak terdaftar pada rute perjalanan ini.", "error");

  const { error } = await ctx.supabase.from("trip_student_events").insert({
    trip_id: tripId,
    student_id: studentId,
    event_type: eventType,
    recorded_by: ctx.userId,
    notes: notes || null,
  });

  if (error) backTo(target, "Status siswa belum tersimpan. Coba lagi.", "error");

  revalidatePath("/pengemudi");
  backTo(target, "Status siswa tercatat pada perjalanan ini.");
}
