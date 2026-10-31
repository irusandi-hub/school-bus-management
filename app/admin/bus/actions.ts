"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminActionContext, writeFailure } from "@/lib/admin/support";
import {
  failure,
  normalizeCode,
  readCheckbox,
  readOptionalText,
  readText,
  success,
  type ActionState,
  type FieldErrors,
} from "@/lib/validation";

const path = "/admin/bus";

export async function saveBus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await adminActionContext();
  if (!ctx.ok) return ctx.state;

  const id = readText(formData, "id");
  const fleetCode = normalizeCode(readText(formData, "fleet_code"));
  const plateNumber = readOptionalText(formData, "plate_number");
  const capacityRaw = readText(formData, "capacity");
  const model = readOptionalText(formData, "model");
  const operatorId = readOptionalText(formData, "operator_id");
  const notes = readOptionalText(formData, "notes");

  const errors: FieldErrors = {};
  if (!/^[A-Z0-9][A-Z0-9-]{1,31}$/.test(fleetCode)) {
    errors.fleet_code = "Kode armada 2–32 karakter: huruf kapital, angka, atau tanda hubung.";
  }

  const capacity = Number(capacityRaw);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100) {
    errors.capacity = "Kapasitas harus bilangan bulat antara 1 dan 100 kursi.";
  }

  if (plateNumber && (plateNumber.length < 3 || plateNumber.length > 20)) {
    errors.plate_number = "Nomor polisi 3–20 karakter.";
  }
  if (model && model.length > 80) errors.model = "Model maksimal 80 karakter.";
  if (notes && notes.length > 300) errors.notes = "Catatan maksimal 300 karakter.";

  if (Object.keys(errors).length > 0) return failure("Periksa kembali isian yang ditandai.", errors);

  const payload = {
    fleet_code: fleetCode,
    plate_number: plateNumber ? plateNumber.toUpperCase() : null,
    capacity,
    model,
    operator_id: operatorId,
    notes,
  };

  const { error } = id
    ? await ctx.supabase.from("buses").update(payload).eq("id", id)
    : await ctx.supabase.from("buses").insert(payload);

  if (error) {
    return writeFailure(error, {
      unique: "Kode armada atau nomor polisi sudah dipakai bus lain. Gunakan nilai lain.",
      foreignKey: "Operator yang dipilih tidak tersedia. Muat ulang halaman lalu pilih kembali.",
    });
  }

  revalidatePath(path);
  revalidatePath("/admin");
  return success(id ? "Data bus berhasil diperbarui." : "Bus baru berhasil ditambahkan.");
}

export async function setBusActive(formData: FormData) {
  const ctx = await adminActionContext();
  if (!ctx.ok) {
    redirect(`${path}?jenis=error&pesan=${encodeURIComponent(ctx.state.message)}`);
  }

  const id = readText(formData, "id");
  const active = readCheckbox(formData, "active");

  const { error } = await ctx.supabase.from("buses").update({ active }).eq("id", id);

  if (error) {
    redirect(
      `${path}?jenis=error&pesan=${encodeURIComponent("Status bus belum dapat diubah. Coba lagi atau hubungi pengelola sistem.")}`,
    );
  }

  revalidatePath(path);
  revalidatePath("/admin");
  redirect(
    `${path}?pesan=${encodeURIComponent(
      active
        ? "Bus diaktifkan kembali."
        : "Bus dinonaktifkan. Data bus dan riwayat penugasan tetap tersimpan.",
    )}`,
  );
}
