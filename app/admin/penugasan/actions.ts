"use server";

import { revalidatePath } from "next/cache";
import { adminActionContext, writeFailure } from "@/lib/admin/support";
import { failure, readText, success, type ActionState, type FieldErrors } from "@/lib/validation";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function saveAssignment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await adminActionContext();
  if (!ctx.ok) return ctx.state;

  const routeId = readText(formData, "route_id");
  const driverId = readText(formData, "driver_id");
  const busId = readText(formData, "bus_id");
  const serviceDate = readText(formData, "service_date");

  const errors: FieldErrors = {};
  if (!routeId) errors.route_id = "Rute wajib dipilih.";
  if (!driverId) errors.driver_id = "Pengemudi wajib dipilih.";
  if (!busId) errors.bus_id = "Bus wajib dipilih.";
  if (!DATE_PATTERN.test(serviceDate)) errors.service_date = "Tanggal layanan wajib diisi.";

  if (Object.keys(errors).length > 0) {
    return failure("Periksa kembali isian yang ditandai.", errors);
  }

  const { data: bus } = await ctx.supabase.from("buses").select("capacity").eq("id", busId).maybeSingle();
  if (!bus) return failure("Bus tidak ditemukan atau sudah tidak aktif.");

  const { error } = await ctx.supabase.from("trip_assignments").insert({
    route_id: routeId,
    driver_id: driverId,
    bus_id: busId,
    service_date: serviceDate,
    assigned_by: ctx.userId,
  });

  if (error) {
    return writeFailure(error, {
      unique: "Pengemudi tersebut sudah ditugaskan pada rute dan tanggal yang sama.",
      fallback: "Penugasan belum tersimpan. Periksa kembali data lalu coba lagi.",
    });
  }

  revalidatePath("/admin/penugasan");
  revalidatePath("/admin/perjalanan");
  revalidatePath("/admin");
  return success("Penugasan berhasil ditambahkan. Pengemudi akan melihatnya pada halaman tugas.");
}
