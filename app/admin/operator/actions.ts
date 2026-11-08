"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminActionContext, writeFailure } from "@/lib/admin/support";
import {
  failure,
  isValidEmail,
  isValidPhone,
  normalizeCode,
  normalizeEmail,
  readCheckbox,
  readOptionalText,
  readText,
  success,
  type ActionState,
  type FieldErrors,
} from "@/lib/validation";

const path = "/admin/operator";

export async function saveOperator(_prev: ActionState, formData: FormData): Promise<ActionState> {
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
  if (name.length < 2 || name.length > 120) errors.name = "Nama pengelola harus 2–120 karakter.";
  if (!/^[A-Z0-9][A-Z0-9-]{1,19}$/.test(code)) {
    errors.code = "Kode 2–20 karakter: huruf kapital, angka, atau tanda hubung.";
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
    ? await ctx.supabase.from("operators").update(payload).eq("id", id)
    : await ctx.supabase.from("operators").insert(payload);

  if (error) return writeFailure(error, { unique: "Kode pengelola sudah dipakai. Gunakan kode lain." });

  revalidatePath(path);
  revalidatePath("/admin");
  return success(id ? "Data pengelola berhasil diperbarui." : "Pengelola baru berhasil ditambahkan.");
}

/** Error text raised by our own SQL functions is safe to show; anything else is not. */
function linkMessage(raw: string | undefined): string {
  const own =
    /Akses ditolak|Isian belum lengkap|tidak ditemukan|Email belum terdaftar|sudah tertaut|Admin Pusat dan tidak dapat|akun orang tua\/wali/i;
  if (raw && own.test(raw)) return raw;
  return "Penautan akun belum berhasil. Periksa email lalu coba lagi; jika berlanjut, hubungi pengelola sistem.";
}

export async function linkOperatorAccount(formData: FormData) {
  const ctx = await adminActionContext();
  if (!ctx.ok) {
    redirect(`${path}?jenis=error&pesan=${encodeURIComponent(ctx.state.message)}`);
  }

  const id = readText(formData, "id");
  const email = normalizeEmail(readText(formData, "email"));
  if (!id || !isValidEmail(email)) {
    redirect(
      `${path}?jenis=error&pesan=${encodeURIComponent("Isian belum lengkap: masukkan pengelola dan email akun yang valid.")}`,
    );
  }

  const { error } = await ctx.supabase.rpc("link_operator_account", { p_operator_id: id, p_email: email });

  if (error) {
    redirect(`${path}?jenis=error&pesan=${encodeURIComponent(linkMessage(error.message))}`);
  }

  revalidatePath(path);
  revalidatePath("/operator");
  redirect(`${path}?pesan=${encodeURIComponent("Akun berhasil ditautkan sebagai Pengelola.")}`);
}

export async function unlinkOperatorAccount(formData: FormData) {
  const ctx = await adminActionContext();
  if (!ctx.ok) {
    redirect(`${path}?jenis=error&pesan=${encodeURIComponent(ctx.state.message)}`);
  }

  const id = readText(formData, "id");
  if (!id) {
    redirect(`${path}?jenis=error&pesan=${encodeURIComponent("Pengelola belum dipilih.")}`);
  }

  const { error } = await ctx.supabase.rpc("unlink_operator_account", { p_operator_id: id });

  if (error) {
    redirect(`${path}?jenis=error&pesan=${encodeURIComponent(linkMessage(error.message))}`);
  }

  revalidatePath(path);
  revalidatePath("/operator");
  redirect(`${path}?pesan=${encodeURIComponent("Tautan akun pengelola dilepas.")}`);
}

export async function setOperatorActive(formData: FormData) {
  const ctx = await adminActionContext();
  if (!ctx.ok) {
    redirect(`${path}?jenis=error&pesan=${encodeURIComponent(ctx.state.message)}`);
  }

  const id = readText(formData, "id");
  const active = readCheckbox(formData, "active");

  const { error } = await ctx.supabase.from("operators").update({ active }).eq("id", id);

  if (error) {
    redirect(
      `${path}?jenis=error&pesan=${encodeURIComponent("Status pengelola belum dapat diubah. Coba lagi atau hubungi pengelola sistem.")}`,
    );
  }

  revalidatePath(path);
  revalidatePath("/admin");
  redirect(
    `${path}?pesan=${encodeURIComponent(
      active
        ? "Pengelola diaktifkan kembali."
        : "Pengelola dinonaktifkan. Data pengelola, bus, dan pengemudi terkait tetap tersimpan.",
    )}`,
  );
}
