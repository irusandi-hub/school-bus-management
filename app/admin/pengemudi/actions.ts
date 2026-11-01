"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminActionContext, writeFailure } from "@/lib/admin/support";
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

const path = "/admin/pengemudi";

export async function saveDriver(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await adminActionContext();
  if (!ctx.ok) return ctx.state;

  const id = readText(formData, "id");
  const fullName = readText(formData, "full_name");
  const phone = readOptionalText(formData, "phone");
  const licenseNumber = readOptionalText(formData, "license_number");
  const operatorId = readOptionalText(formData, "operator_id");

  const errors: FieldErrors = {};
  if (fullName.length < 2 || fullName.length > 120) errors.full_name = "Nama pengemudi harus 2–120 karakter.";
  if (phone && !isValidPhone(phone)) {
    errors.phone = "Gunakan format nomor telepon yang valid, misalnya +9665xxxxxxxx.";
  }
  if (licenseNumber && (licenseNumber.length < 3 || licenseNumber.length > 40)) {
    errors.license_number = "Nomor SIM 3–40 karakter.";
  }

  if (Object.keys(errors).length > 0) return failure("Periksa kembali isian yang ditandai.", errors);

  const payload = {
    full_name: fullName,
    phone,
    license_number: licenseNumber ? licenseNumber.toUpperCase() : null,
    operator_id: operatorId,
  };

  const { error } = id
    ? await ctx.supabase.from("drivers").update(payload).eq("id", id)
    : await ctx.supabase.from("drivers").insert(payload);

  if (error) {
    return writeFailure(error, {
      foreignKey: "Operator yang dipilih tidak tersedia. Muat ulang halaman lalu pilih kembali.",
      unique: "Data pengemudi sudah terdaftar untuk akun tersebut.",
    });
  }

  revalidatePath(path);
  revalidatePath("/admin");
  return success(id ? "Data pengemudi berhasil diperbarui." : "Pengemudi baru berhasil ditambahkan.");
}

export async function setDriverActive(formData: FormData) {
  const ctx = await adminActionContext();
  if (!ctx.ok) {
    redirect(`${path}?jenis=error&pesan=${encodeURIComponent(ctx.state.message)}`);
  }

  const id = readText(formData, "id");
  const active = readCheckbox(formData, "active");

  const { error } = await ctx.supabase.from("drivers").update({ active }).eq("id", id);

  if (error) {
    redirect(
      `${path}?jenis=error&pesan=${encodeURIComponent("Status pengemudi belum dapat diubah. Coba lagi atau hubungi pengelola sistem.")}`,
    );
  }

  revalidatePath(path);
  revalidatePath("/admin");
  redirect(
    `${path}?pesan=${encodeURIComponent(
      active
        ? "Pengemudi diaktifkan kembali."
        : "Pengemudi dinonaktifkan. Data dan riwayat penugasan tetap tersimpan.",
    )}`,
  );
}
