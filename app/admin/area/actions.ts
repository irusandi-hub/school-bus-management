"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminActionContext, writeFailure } from "@/lib/admin/support";
import {
  failure,
  isValidEmail,
  isValidPhone,
  normalizeCode,
  readCheckbox,
  readOptionalText,
  readText,
  success,
  type ActionState,
  type FieldErrors,
} from "@/lib/validation";

const path = "/admin/area";

export async function saveProjectArea(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await adminActionContext();
  if (!ctx.ok) return ctx.state;

  const id = readText(formData, "id");
  const name = readText(formData, "name");
  const code = normalizeCode(readText(formData, "code"));
  const city = readOptionalText(formData, "city");
  const contactName = readOptionalText(formData, "contact_name");
  const contactEmail = readOptionalText(formData, "contact_email");
  const contactPhone = readOptionalText(formData, "contact_phone");

  const errors: FieldErrors = {};
  if (name.length < 2 || name.length > 120) errors.name = "Nama Area Operasional harus 2–120 karakter.";
  if (!/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(code)) {
    errors.code = "Kode area 2–20 karakter: huruf kapital, angka, atau tanda hubung.";
  }
  if (contactEmail && !isValidEmail(contactEmail)) errors.contact_email = "Format email belum benar.";
  if (contactPhone && !isValidPhone(contactPhone)) {
    errors.contact_phone = "Gunakan format nomor telepon yang valid, misalnya +9665xxxxxxxx.";
  }

  if (Object.keys(errors).length > 0) return failure("Periksa kembali isian yang ditandai.", errors);

  const payload = {
    name,
    code,
    city,
    contact_name: contactName,
    contact_email: contactEmail ? contactEmail.toLowerCase() : null,
    contact_phone: contactPhone,
  };

  const { error } = id
    ? await ctx.supabase.from("project_areas").update(payload).eq("id", id)
    : await ctx.supabase.from("project_areas").insert(payload);

  if (error) return writeFailure(error, { unique: "Kode Area Operasional sudah dipakai. Gunakan kode lain." });

  revalidatePath(path);
  revalidatePath("/admin");
  return success(id ? "Area Operasional berhasil diperbarui." : "Area Operasional baru berhasil ditambahkan.");
}

export async function setProjectAreaActive(formData: FormData) {
  const ctx = await adminActionContext();
  if (!ctx.ok) {
    redirect(`${path}?jenis=error&pesan=${encodeURIComponent(ctx.state.message)}`);
  }

  const id = readText(formData, "id");
  const active = readCheckbox(formData, "active");

  const { error } = await ctx.supabase.from("project_areas").update({ active }).eq("id", id);

  if (error) {
    redirect(
      `${path}?jenis=error&pesan=${encodeURIComponent("Status Area Operasional belum dapat diubah. Coba lagi atau hubungi pengelola sistem.")}`,
    );
  }

  revalidatePath(path);
  revalidatePath("/admin");
  redirect(
    `${path}?pesan=${encodeURIComponent(
      active
        ? "Area Operasional diaktifkan kembali."
        : "Area Operasional dinonaktifkan. Data operasional dan riwayatnya tetap tersimpan.",
    )}`,
  );
}
