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

const path = "/admin/wali";

export async function saveGuardian(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await adminActionContext();
  if (!ctx.ok) return ctx.state;

  const id = readText(formData, "id");
  const email = normalizeEmail(readText(formData, "email"));
  const fullName = readText(formData, "full_name");
  const phone = readOptionalText(formData, "phone");

  const errors: FieldErrors = {};

  if (!isValidEmail(email)) errors.email = "Masukkan alamat email wali yang valid.";
  if (fullName.length < 2 || fullName.length > 120) errors.full_name = "Nama wali harus 2–120 karakter.";
  if (phone && !isValidPhone(phone)) {
    errors.phone = "Gunakan format nomor telepon yang valid, misalnya +9665xxxxxxxx.";
  }

  if (Object.keys(errors).length > 0) return failure("Periksa kembali isian yang ditandai.", errors);

  if (id) {
    const { data: existing } = await ctx.supabase
      .from("guardians")
      .select("profile_id, email")
      .eq("id", id)
      .maybeSingle();

    if (!existing) return failure("Data wali tidak ditemukan. Muat ulang halaman lalu coba lagi.");

    if (existing.profile_id && existing.email !== email) {
      return failure(
        "Email akun wali yang sudah aktif tidak dapat diubah dari halaman ini, agar akses akun tidak tertukar. Nonaktifkan lalu daftarkan email baru bila memang diperlukan.",
        { email: "Email akun aktif tidak dapat diubah." },
      );
    }

    const { error } = await ctx.supabase
      .from("guardians")
      .update({ email, full_name: fullName, phone })
      .eq("id", id);

    if (error) return writeFailure(error, { unique: "Email wali sudah terdaftar. Gunakan email lain." });

    revalidatePath(path);
    return success("Data wali berhasil diperbarui.");
  }

  const { error } = await ctx.supabase
    .from("guardians")
    .insert({ email, full_name: fullName, phone, active: true });

  if (error) return writeFailure(error, { unique: "Email wali sudah terdaftar. Gunakan email lain." });

  revalidatePath(path);
  revalidatePath("/admin");
  return success("Email wali berhasil didaftarkan. Wali dapat melakukan verifikasi email lalu membuat kata sandi.");
}

export async function setGuardianActive(formData: FormData) {
  const ctx = await adminActionContext();
  if (!ctx.ok) {
    redirect(`${path}?jenis=error&pesan=${encodeURIComponent(ctx.state.message)}`);
  }

  const id = readText(formData, "id");
  const active = readCheckbox(formData, "active");

  const { error } = await ctx.supabase.from("guardians").update({ active }).eq("id", id);

  if (error) {
    redirect(
      `${path}?jenis=error&pesan=${encodeURIComponent("Status wali belum dapat diubah. Coba lagi atau hubungi pengelola sistem.")}`,
    );
  }

  revalidatePath(path);
  revalidatePath("/admin");
  redirect(
    `${path}?pesan=${encodeURIComponent(
      active
        ? "Akun wali diaktifkan kembali."
        : "Akun wali dinonaktifkan dan akses layanannya dicabut. Relasi siswa dan riwayat tetap tersimpan.",
    )}`,
  );
}
