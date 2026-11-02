"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEV_DRIVER_RECORD, DEV_VIEWER, isDevOpenAccess } from "@/lib/dev-open-access";
import { createServerSupabase } from "@/lib/supabase/server";
import { supabaseNotConfiguredMessage } from "@/lib/supabase/env";
import { failure, readText, type ActionState } from "@/lib/validation";

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
  redirect(`${target}?jenis=${kind}&pesan=${encodeURIComponent(message)}`);
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
  const target = `/pengemudi/tugas/${assignmentId}`;
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

  const { error } = await ctx.supabase.from("trips").insert({
    assignment_id: assignmentId,
    status: "in_progress",
    started_at: new Date().toISOString(),
  });

  if (error) backTo(target, "Perjalanan belum dapat dimulai. Periksa koneksi lalu coba lagi.", "error");

  revalidatePath(target);
  revalidatePath("/pengemudi");
  revalidatePath("/pengemudi/riwayat");
  backTo(target, "Perjalanan dimulai. Catat kehadiran siswa selama perjalanan.");
}

export async function confirmArrival(formData: FormData) {
  const ctx = await driverActionContext();
  const tripId = readText(formData, "trip_id");
  const assignmentId = readText(formData, "assignment_id");
  const target = `/pengemudi/tugas/${assignmentId}`;
  if (!ctx.ok) backTo(target, ctx.state.message, "error");

  const { error } = await ctx.supabase
    .from("trips")
    .update({ arrived_at: new Date().toISOString() })
    .eq("id", tripId)
    .eq("status", "in_progress");

  if (error) backTo(target, "Konfirmasi tiba belum tersimpan. Coba lagi.", "error");

  revalidatePath(target);
  revalidatePath("/admin/perjalanan");
  backTo(target, "Tiba di sekolah tercatat. Lanjutkan penurunan siswa bila diperlukan.");
}

export async function endTrip(formData: FormData) {
  const ctx = await driverActionContext();
  const tripId = readText(formData, "trip_id");
  const assignmentId = readText(formData, "assignment_id");
  const target = `/pengemudi/tugas/${assignmentId}`;
  if (!ctx.ok) backTo(target, ctx.state.message, "error");

  const { error } = await ctx.supabase
    .from("trips")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", tripId)
    .eq("status", "in_progress");

  if (error) backTo(target, "Perjalanan belum dapat diakhiri. Coba lagi.", "error");

  revalidatePath(target);
  revalidatePath("/pengemudi");
  revalidatePath("/pengemudi/riwayat");
  revalidatePath("/admin/perjalanan");
  backTo(target, "Perjalanan selesai. Riwayat tersimpan dan tidak dapat dihapus.");
}

const eventTypes = ["boarded", "dropped_off", "absent", "issue"];

export async function recordStudentEvent(formData: FormData) {
  const ctx = await driverActionContext();
  const tripId = readText(formData, "trip_id");
  const assignmentId = readText(formData, "assignment_id");
  const studentId = readText(formData, "student_id");
  const eventType = readText(formData, "event_type");
  const notes = readText(formData, "notes");
  const target = `/pengemudi/tugas/${assignmentId}`;
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

  revalidatePath(target);
  backTo(target, "Status siswa tercatat pada perjalanan ini.");
}
