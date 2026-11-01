"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminActionContext, writeFailure } from "@/lib/admin/support";
import {
  failure,
  parseCoordinate,
  readCheckbox,
  readText,
  success,
  type ActionState,
  type FieldErrors,
} from "@/lib/validation";

const path = "/admin/rute";

function backTo(target: string, message: string, kind: "success" | "error" = "success"): never {
  redirect(`${target}?jenis=${kind}&pesan=${encodeURIComponent(message)}`);
}

export async function saveRoute(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await adminActionContext();
  if (!ctx.ok) return ctx.state;

  const id = readText(formData, "id");
  const routeName = readText(formData, "route_name");
  const schoolName = readText(formData, "school_name");
  const direction = readText(formData, "direction");
  const active = readCheckbox(formData, "active");

  const errors: FieldErrors = {};
  if (routeName.length < 3 || routeName.length > 120) errors.route_name = "Nama rute harus 3–120 karakter.";
  if (!schoolName) errors.school_name = "Sekolah wajib dipilih.";
  if (direction !== "morning" && direction !== "afternoon") errors.direction = "Arah perjalanan tidak dikenali.";

  if (Object.keys(errors).length > 0) {
    return failure("Periksa kembali isian yang ditandai.", errors);
  }

  const payload = { route_name: routeName, school_name: schoolName, direction, active };
  const { error } = id
    ? await ctx.supabase.from("routes").update(payload).eq("id", id)
    : await ctx.supabase.from("routes").insert(payload);

  if (error) return writeFailure(error, { fallback: "Rute belum tersimpan. Periksa kembali data lalu coba lagi." });

  revalidatePath(path);
  revalidatePath("/admin");
  return success(id ? "Rute berhasil diperbarui." : "Rute baru berhasil ditambahkan. Tambahkan titik jemput pada halaman rute.");
}

export async function saveStop(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await adminActionContext();
  if (!ctx.ok) return ctx.state;

  const id = readText(formData, "id");
  const routeId = readText(formData, "route_id");
  const stopName = readText(formData, "stop_name");
  const stopOrder = Number(readText(formData, "stop_order"));
  const isSchool = readCheckbox(formData, "is_school");
  const latitude = parseCoordinate(readText(formData, "latitude"), "latitude");
  const longitude = parseCoordinate(readText(formData, "longitude"), "longitude");

  const errors: FieldErrors = {};
  if (!routeId) errors.route_id = "Rute tidak dikenali.";
  if (stopName.length < 2 || stopName.length > 120) errors.stop_name = "Nama titik harus 2–120 karakter.";
  if (!Number.isInteger(stopOrder) || stopOrder < 1) errors.stop_order = "Urutan harus bilangan bulat mulai 1.";
  if (!latitude.ok) errors.latitude = latitude.message;
  if (!longitude.ok) errors.longitude = longitude.message;
  if (latitude.ok && latitude.value === null) errors.latitude = "Koordinat titik jemput wajib diisi.";
  if (longitude.ok && longitude.value === null) errors.longitude = "Koordinat titik jemput wajib diisi.";

  if (Object.keys(errors).length > 0) {
    return failure("Periksa kembali isian yang ditandai.", errors);
  }

  const payload = {
    route_id: routeId,
    stop_name: stopName,
    stop_order: stopOrder,
    latitude: latitude.ok ? latitude.value : null,
    longitude: longitude.ok ? longitude.value : null,
    is_school: isSchool,
  };

  const { error } = id
    ? await ctx.supabase.from("route_stops").update(payload).eq("id", id)
    : await ctx.supabase.from("route_stops").insert(payload);

  if (error) {
    return writeFailure(error, {
      unique: "Urutan tersebut sudah dipakai pada rute ini. Gunakan urutan lain.",
      fallback: "Titik jemput belum tersimpan. Periksa kembali data lalu coba lagi.",
    });
  }

  revalidatePath(`${path}/${routeId}`);
  return success(id ? "Titik jemput berhasil diperbarui." : "Titik jemput berhasil ditambahkan.");
}

export async function assignStudentToStop(formData: FormData) {
  const ctx = await adminActionContext();
  const target = readText(formData, "return_to") || path;
  if (!ctx.ok) backTo(target, ctx.state.message, "error");

  const studentId = readText(formData, "student_id");
  const stopId = readText(formData, "stop_id");
  const direction = readText(formData, "direction");

  if (!studentId || !stopId) backTo(target, "Pilih siswa dan titik jemput terlebih dahulu.", "error");
  if (direction !== "morning" && direction !== "afternoon") {
    backTo(target, "Arah perjalanan tidak dikenali.", "error");
  }

  const { data: stop } = await ctx.supabase
    .from("route_stops")
    .select("id, route_id")
    .eq("id", stopId)
    .maybeSingle();

  if (!stop) backTo(target, "Titik jemput tidak ditemukan.", "error");

  const { data: existing } = await ctx.supabase
    .from("student_route_stops")
    .select("id")
    .eq("student_id", studentId)
    .eq("direction", direction)
    .eq("active", true)
    .maybeSingle();

  const payload = {
    student_id: studentId,
    route_id: stop.route_id as string,
    stop_id: stopId,
    direction,
    active: true,
  };

  const { error } = existing
    ? await ctx.supabase.from("student_route_stops").update(payload).eq("id", existing.id)
    : await ctx.supabase.from("student_route_stops").insert(payload);

  if (error) {
    backTo(target, "Penempatan siswa pada titik jemput belum tersimpan. Coba lagi.", "error");
  }

  revalidatePath(target);
  revalidatePath("/admin/siswa");
  backTo(target, existing ? "Titik jemput siswa dipindahkan." : "Siswa berhasil ditempatkan pada titik jemput.");
}

export async function removeStudentFromRoute(formData: FormData) {
  const ctx = await adminActionContext();
  const target = readText(formData, "return_to") || path;
  if (!ctx.ok) backTo(target, ctx.state.message, "error");

  const id = readText(formData, "id");
  const { error } = await ctx.supabase.from("student_route_stops").update({ active: false }).eq("id", id);

  if (error) backTo(target, "Siswa belum dapat dikeluarkan dari rute. Coba lagi.", "error");

  revalidatePath(target);
  revalidatePath("/admin/siswa");
  backTo(target, "Siswa dikeluarkan dari rute aktif. Riwayat penempatan tetap tersimpan.");
}
