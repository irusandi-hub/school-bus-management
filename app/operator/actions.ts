"use server";

import { revalidatePath } from "next/cache";
import { operatorActionContext, writeFailure } from "@/lib/admin/support";
import {
  ASSIGNMENT_CONFLICT_MESSAGES,
  assignmentConflict,
  type AssignmentRow,
} from "@/lib/operator/assignment";
import {
  failure,
  isValidPhone,
  readCheckbox,
  readOptionalText,
  readText,
  success,
  type ActionState,
  type FieldErrors,
} from "@/lib/validation";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function saveOperatorBus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await operatorActionContext();
  if (!ctx.ok) return ctx.state;

  const id = readText(formData, "id");
  const fleetCode = readText(formData, "fleet_code").toUpperCase();
  const plateNumber = readOptionalText(formData, "plate_number");
  const capacity = Number(readText(formData, "capacity"));
  const model = readOptionalText(formData, "model");
  const notes = readOptionalText(formData, "notes");
  const active = readCheckbox(formData, "active");

  const errors: FieldErrors = {};
  if (!/^[A-Z0-9][A-Z0-9-]{1,31}$/.test(fleetCode)) {
    errors.fleet_code = "Kode armada 2–32 karakter: huruf kapital, angka, atau tanda hubung.";
  }
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100) {
    errors.capacity = "Kapasitas harus bilangan bulat 1–100.";
  }

  if (Object.keys(errors).length > 0) return failure("Periksa kembali isian yang ditandai.", errors);

  // operator_id always comes from the authenticated organisation, never from the form.
  const payload = {
    fleet_code: fleetCode,
    plate_number: plateNumber,
    capacity,
    model,
    notes,
    active,
    operator_id: ctx.operatorId,
  };

  const { error } = id
    ? await ctx.supabase.from("buses").update(payload).eq("id", id)
    : await ctx.supabase.from("buses").insert(payload);

  if (error) return writeFailure(error, { unique: "Kode armada sudah dipakai pada organisasi ini." });

  revalidatePath("/operator/bus");
  revalidatePath("/operator");
  return success(id ? "Data bus berhasil diperbarui." : "Bus baru berhasil ditambahkan.");
}

export async function saveOperatorDriver(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await operatorActionContext();
  if (!ctx.ok) return ctx.state;

  const id = readText(formData, "id");
  const fullName = readText(formData, "full_name");
  const phone = readOptionalText(formData, "phone");
  const licenseNumber = readOptionalText(formData, "license_number");
  const active = readCheckbox(formData, "active");

  const errors: FieldErrors = {};
  if (fullName.length < 2 || fullName.length > 120) errors.full_name = "Nama pengemudi harus 2–120 karakter.";
  if (phone && !isValidPhone(phone)) errors.phone = "Gunakan format nomor telepon yang valid, misalnya +9665xxxxxxxx.";
  if (licenseNumber && (licenseNumber.length < 3 || licenseNumber.length > 40)) {
    errors.license_number = "Nomor SIM harus 3–40 karakter.";
  }

  if (Object.keys(errors).length > 0) return failure("Periksa kembali isian yang ditandai.", errors);

  const payload = {
    full_name: fullName,
    phone,
    license_number: licenseNumber,
    active,
    operator_id: ctx.operatorId,
  };

  const { error } = id
    ? await ctx.supabase.from("drivers").update(payload).eq("id", id)
    : await ctx.supabase.from("drivers").insert(payload);

  if (error) return writeFailure(error, { fallback: "Data pengemudi belum tersimpan. Coba lagi." });

  revalidatePath("/operator/pengemudi");
  revalidatePath("/operator");
  return success(id ? "Data pengemudi berhasil diperbarui." : "Pengemudi baru berhasil ditambahkan.");
}

export async function saveOperatorAssignment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await operatorActionContext();
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
  if (Object.keys(errors).length > 0) return failure("Periksa kembali isian yang ditandai.", errors);

  // Re-check ownership explicitly; RLS enforces the same rule independently.
  const [{ data: driver }, { data: bus }, { data: route }] = await Promise.all([
    ctx.supabase.from("drivers").select("operator_id, active").eq("id", driverId).maybeSingle(),
    ctx.supabase.from("buses").select("operator_id, active").eq("id", busId).maybeSingle(),
    ctx.supabase.from("routes").select("id, active").eq("id", routeId).maybeSingle(),
  ]);

  if (!driver || driver.operator_id !== ctx.operatorId) {
    return failure("Pengemudi tersebut bukan bagian dari organisasi Anda.");
  }
  if (!driver.active) return failure("Pengemudi nonaktif tidak dapat menerima penugasan.");
  if (!bus || bus.operator_id !== ctx.operatorId) {
    return failure("Bus tersebut bukan bagian dari organisasi Anda.");
  }
  if (!bus.active) return failure("Bus nonaktif tidak dapat digunakan untuk penugasan.");
  if (!route) return failure("Rute tidak tersedia untuk organisasi Anda.");
  if (!route.active) return failure("Rute nonaktif tidak dapat digunakan untuk penugasan.");

  // Prevent assigning the same driver or bus to a second route on the same service date.
  const { data: sameDateRows, error: conflictError } = await ctx.supabase
    .from("trip_assignments")
    .select("id, driver_id, bus_id, service_date")
    .eq("service_date", serviceDate);

  if (conflictError) {
    return failure("Jadwal belum dapat divalidasi. Coba simpan kembali.");
  }

  const conflict = assignmentConflict({
    driverId,
    busId,
    serviceDate,
    existing: (sameDateRows ?? []) as AssignmentRow[],
  });
  if (conflict) return failure(ASSIGNMENT_CONFLICT_MESSAGES[conflict]);

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

  revalidatePath("/operator/penugasan");
  revalidatePath("/operator/perjalanan");
  return success("Penugasan berhasil ditambahkan.");
}
