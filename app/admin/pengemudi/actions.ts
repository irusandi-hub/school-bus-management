"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminActionContext, writeFailure } from "@/lib/admin/support";
import {
  failure,
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  readCheckbox,
  readOptionalText,
  readText,
  success,
  type ActionState,
  type FieldErrors,
} from "@/lib/validation";

const path = "/admin/pengemudi";

/** Error text raised by our own SQL functions is safe to show; anything else is not. */
function linkMessage(raw: string | undefined): string {
  const own =
    /Akses ditolak|Isian belum lengkap|tidak ditemukan|Email belum terdaftar|sudah tertaut|Operator Utama tidak dapat|akun orang tua\/wali/i;
  if (raw && own.test(raw)) return raw;
  return "Penautan akun belum berhasil. Periksa email lalu coba lagi; jika berlanjut, hubungi pengelola sistem.";
}

export async function saveDriver(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await adminActionContext();
  if (!ctx.ok) return ctx.state;

  const id = readText(formData, "id");
  const fullName = readText(formData, "full_name");
  const phone = readOptionalText(formData, "phone");
  const licenseNumber = readOptionalText(formData, "license_number");
  const projectAreaId = readOptionalText(formData, "project_area_id");

  const errors: FieldErrors = {};
  if (fullName.length < 2 || fullName.length > 120) errors.full_name = "Nama pengemudi harus 2–120 karakter.";
  if (phone && !isValidPhone(phone)) {
    errors.phone = "Gunakan format nomor telepon yang valid, misalnya +9665xxxxxxxx.";
  }
  if (licenseNumber && (licenseNumber.length < 3 || licenseNumber.length > 40)) {
    errors.license_number = "Nomor SIM 3–40 karakter.";
  }
  if (!projectAreaId) errors.project_area_id = "Pilih Area Operasional untuk pengemudi ini.";

  if (Object.keys(errors).length > 0) return failure("Periksa kembali isian yang ditandai.", errors);

  const payload = {
    full_name: fullName,
    phone,
    license_number: licenseNumber ? licenseNumber.toUpperCase() : null,
    project_area_id: projectAreaId,
  };

  const { error } = id
    ? await ctx.supabase.from("drivers").update(payload).eq("id", id)
    : await ctx.supabase.from("drivers").insert(payload);

  if (error) {
    return writeFailure(error, {
      foreignKey: "Area Operasional yang dipilih tidak tersedia. Muat ulang halaman lalu pilih kembali.",
      unique: "Data pengemudi sudah terdaftar untuk akun tersebut.",
    });
  }

  revalidatePath(path);
  revalidatePath("/admin");
  return success(id ? "Data pengemudi berhasil diperbarui." : "Pengemudi baru berhasil ditambahkan.");
}

export async function linkDriverAccount(formData: FormData) {
  const ctx = await adminActionContext();
  if (!ctx.ok) {
    redirect(`${path}?jenis=error&pesan=${encodeURIComponent(ctx.state.message)}`);
  }

  const id = readText(formData, "id");
  const email = normalizeEmail(readText(formData, "email"));
  if (!id || !isValidEmail(email)) {
    redirect(
      `${path}?jenis=error&pesan=${encodeURIComponent("Isian belum lengkap: masukkan pengemudi dan email akun yang valid.")}`,
    );
  }

  const { error } = await ctx.supabase.rpc("link_driver_account", { p_driver_id: id, p_email: email });

  if (error) {
    redirect(`${path}?jenis=error&pesan=${encodeURIComponent(linkMessage(error.message))}`);
  }

  revalidatePath(path);
  revalidatePath("/pengemudi");
  redirect(`${path}?pesan=${encodeURIComponent("Akun berhasil ditautkan sebagai Pengemudi.")}`);
}

export async function unlinkDriverAccount(formData: FormData) {
  const ctx = await adminActionContext();
  if (!ctx.ok) {
    redirect(`${path}?jenis=error&pesan=${encodeURIComponent(ctx.state.message)}`);
  }

  const id = readText(formData, "id");
  if (!id) {
    redirect(`${path}?jenis=error&pesan=${encodeURIComponent("Pengemudi belum dipilih.")}`);
  }

  const { error } = await ctx.supabase.rpc("unlink_driver_account", { p_driver_id: id });

  if (error) {
    redirect(`${path}?jenis=error&pesan=${encodeURIComponent(linkMessage(error.message))}`);
  }

  revalidatePath(path);
  revalidatePath("/pengemudi");
  redirect(`${path}?pesan=${encodeURIComponent("Tautan akun pengemudi dilepas.")}`);
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
