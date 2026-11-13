"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminActionContext, writeFailure } from "@/lib/admin/support";
import {
  failure,
  isValidEmail,
  isValidPhone,
  normalizeCode,
  parseCoordinate,
  readCheckbox,
  readOptionalText,
  readText,
  success,
  type ActionState,
  type FieldErrors,
} from "@/lib/validation";

const path = "/admin/sekolah";

export async function saveSchool(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await adminActionContext();
  if (!ctx.ok) return ctx.state;

  const id = readText(formData, "id");
  const name = readText(formData, "name");
  const code = normalizeCode(readText(formData, "code"));
  const city = readText(formData, "city");
  const address = readOptionalText(formData, "address");
  const contactName = readOptionalText(formData, "contact_name");
  const contactEmail = readOptionalText(formData, "contact_email");
  const contactPhone = readOptionalText(formData, "contact_phone");
  const projectAreaId = readOptionalText(formData, "project_area_id");

  const errors: FieldErrors = {};
  if (name.length < 2 || name.length > 120) errors.name = "Nama sekolah harus 2–120 karakter.";
  if (!/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(code)) {
    errors.code = "Kode 2–20 karakter: huruf kapital, angka, atau tanda hubung.";
  }
  if (city.length < 2) errors.city = "Kota wajib diisi minimal 2 karakter.";
  if (!projectAreaId) errors.project_area_id = "Pilih Area Operasional untuk sekolah ini.";
  if (contactEmail && !isValidEmail(contactEmail)) errors.contact_email = "Format email belum benar.";
  if (contactPhone && !isValidPhone(contactPhone)) {
    errors.contact_phone = "Gunakan format nomor telepon yang valid, misalnya +9665xxxxxxxx.";
  }

  const latitude = parseCoordinate(readText(formData, "latitude"), "latitude");
  if (!latitude.ok) errors.latitude = latitude.message;
  const longitude = parseCoordinate(readText(formData, "longitude"), "longitude");
  if (!longitude.ok) errors.longitude = longitude.message;

  const latitudeValue = latitude.ok ? latitude.value : null;
  const longitudeValue = longitude.ok ? longitude.value : null;
  if ((latitudeValue === null) !== (longitudeValue === null)) {
    errors.latitude = "Isi lintang dan bujur sekaligus, atau kosongkan keduanya.";
  }

  if (Object.keys(errors).length > 0) {
    return failure("Periksa kembali isian yang ditandai.", errors);
  }

  const payload = {
    name,
    code,
    city: city || "Dammam",
    address,
    latitude: latitudeValue,
    longitude: longitudeValue,
    contact_name: contactName,
    contact_email: contactEmail ? contactEmail.toLowerCase() : null,
    contact_phone: contactPhone,
    project_area_id: projectAreaId,
  };

  const { error } = id
    ? await ctx.supabase.from("schools").update(payload).eq("id", id)
    : await ctx.supabase.from("schools").insert(payload);

  if (error) return writeFailure(error, { unique: "Kode sekolah sudah dipakai. Gunakan kode lain." });

  revalidatePath(path);
  revalidatePath("/admin");
  return success(id ? "Data sekolah berhasil diperbarui." : "Sekolah baru berhasil ditambahkan.");
}

export async function setSchoolActive(formData: FormData) {
  const ctx = await adminActionContext();
  if (!ctx.ok) {
    redirect(`${path}?jenis=error&pesan=${encodeURIComponent(ctx.state.message)}`);
  }

  const id = readText(formData, "id");
  const active = readCheckbox(formData, "active");

  const { error } = await ctx.supabase.from("schools").update({ active }).eq("id", id);

  if (error) {
    redirect(
      `${path}?jenis=error&pesan=${encodeURIComponent("Status sekolah belum dapat diubah. Coba lagi atau hubungi pengelola sistem.")}`,
    );
  }

  revalidatePath(path);
  revalidatePath("/admin");
  redirect(
    `${path}?pesan=${encodeURIComponent(
      active
        ? "Sekolah diaktifkan kembali."
        : "Sekolah dinonaktifkan. Data sekolah dan riwayat terkait tetap tersimpan.",
    )}`,
  );
}
