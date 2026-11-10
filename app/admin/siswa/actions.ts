"use server";

import { revalidatePath } from "next/cache";
import { adminActionContext, writeFailure } from "@/lib/admin/support";
import {
  failure,
  isServiceStatus,
  isValidAdmissionsNumber,
  parseCoordinate,
  readOptionalText,
  readText,
  serviceStatusLabel,
  success,
  type ActionState,
  type FieldErrors,
} from "@/lib/validation";

const path = "/admin/siswa";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function saveStudent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await adminActionContext();
  if (!ctx.ok) return ctx.state;

  const id = readText(formData, "id");
  const admissionsNumber = readText(formData, "admissions_number").toUpperCase();
  const fullName = readText(formData, "full_name");
  const dateOfBirth = readOptionalText(formData, "date_of_birth");
  const schoolId = readText(formData, "school_id");
  const guardianId = readText(formData, "guardian_id");
  const homeAddress = readOptionalText(formData, "home_address");
  const pickupNotes = readOptionalText(formData, "pickup_notes");

  const errors: FieldErrors = {};

  if (!isValidAdmissionsNumber(admissionsNumber)) {
    errors.admissions_number = "Admissions Number 2–32 karakter: huruf, angka, garis miring, atau tanda hubung.";
  }
  if (fullName.length < 2 || fullName.length > 120) errors.full_name = "Nama siswa harus 2–120 karakter.";
  if (!UUID_PATTERN.test(schoolId)) errors.school_id = "Pilih sekolah siswa.";
  if (!UUID_PATTERN.test(guardianId)) errors.guardian_id = "Pilih satu wali untuk siswa ini.";

  if (dateOfBirth) {
    const parsed = new Date(`${dateOfBirth}T00:00:00Z`);
    if (dateOfBirth.length !== 10 || Number.isNaN(parsed.getTime())) {
      errors.date_of_birth = "Format tanggal lahir belum benar.";
    } else if (parsed.getTime() > Date.now()) {
      errors.date_of_birth = "Tanggal lahir tidak boleh di masa depan.";
    } else if (parsed.getUTCFullYear() < 1980) {
      errors.date_of_birth = "Periksa kembali tanggal lahir siswa.";
    }
  }

  const latitude = parseCoordinate(readText(formData, "home_latitude"), "latitude");
  if (!latitude.ok) errors.home_latitude = latitude.message;
  const longitude = parseCoordinate(readText(formData, "home_longitude"), "longitude");
  if (!longitude.ok) errors.home_longitude = longitude.message;

  const latitudeValue = latitude.ok ? latitude.value : null;
  const longitudeValue = longitude.ok ? longitude.value : null;
  if ((latitudeValue === null) !== (longitudeValue === null)) {
    errors.home_latitude = "Isi lintang dan bujur sekaligus, atau kosongkan keduanya.";
  }

  if (homeAddress && homeAddress.length > 400) errors.home_address = "Alamat maksimal 400 karakter.";
  if (pickupNotes && pickupNotes.length > 300) errors.pickup_notes = "Catatan maksimal 300 karakter.";

  if (Object.keys(errors).length > 0) return failure("Periksa kembali isian yang ditandai.", errors);

  const [{ data: school }, { data: guardian }] = await Promise.all([
    ctx.supabase.from("schools").select("id, active").eq("id", schoolId).maybeSingle(),
    ctx.supabase.from("guardians").select("id, active").eq("id", guardianId).maybeSingle(),
  ]);
  if (!school) return failure("Sekolah tidak ditemukan. Muat ulang halaman lalu pilih kembali.", { school_id: "Sekolah tidak ditemukan." });
  if (!guardian) return failure("Wali tidak ditemukan. Muat ulang halaman lalu pilih kembali.", { guardian_id: "Wali tidak ditemukan." });

  const payload = {
    admissions_number: admissionsNumber,
    full_name: fullName,
    date_of_birth: dateOfBirth,
    school_id: schoolId,
    guardian_id: guardianId,
    home_address: homeAddress,
    home_latitude: latitudeValue,
    home_longitude: longitudeValue,
    pickup_notes: pickupNotes,
  };

  const { error } = id
    ? await ctx.supabase.from("students").update(payload).eq("id", id)
    : await ctx.supabase.from("students").insert(payload);

  if (error) {
    return writeFailure(error, {
      unique: "Admissions Number sudah dipakai siswa lain. Gunakan nomor lain.",
      foreignKey: "Sekolah atau wali yang dipilih tidak tersedia. Muat ulang halaman lalu pilih kembali.",
    });
  }

  revalidatePath(path);
  revalidatePath("/admin");
  if (id) revalidatePath(`/admin/siswa/${id}`);

  return success(
    id
      ? "Data siswa berhasil diperbarui."
      : "Siswa baru berhasil ditambahkan dengan status layanan aktif. Perubahan status dilakukan melalui halaman detail siswa agar riwayatnya tercatat.",
  );
}

export async function changeStudentServiceStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await adminActionContext();
  if (!ctx.ok) return ctx.state;

  const studentId = readText(formData, "student_id");
  const status = readText(formData, "status");
  const reason = readText(formData, "reason");

  if (!UUID_PATTERN.test(studentId)) {
    return failure("Data siswa tidak valid. Muat ulang halaman lalu coba lagi.");
  }
  if (!isServiceStatus(status)) {
    return failure("Pilih status layanan yang tersedia.", { status: "Status layanan belum dipilih." });
  }
  if (reason.length < 5) {
    return failure("Alasan perubahan status wajib diisi minimal 5 karakter.", {
      reason: "Tuliskan alasan yang jelas, misalnya tanggal berhenti atau permintaan wali.",
    });
  }

  const { error } = await ctx.supabase.rpc("set_student_service_status", {
    p_student_id: studentId,
    p_status: status,
    p_reason: reason,
  });

  if (error) {
    if (error.code === "42501") {
      return failure("Akun Anda tidak memiliki izin untuk mengubah status layanan siswa.");
    }
    if (error.code === "P0002") {
      return failure("Data siswa tidak ditemukan. Muat ulang halaman lalu coba lagi.");
    }
    if (error.code === "22023") {
      return failure(error.message || "Perubahan status tidak dapat diproses.");
    }
    return writeFailure(error, {
      fallback: "Status layanan belum tersimpan. Periksa koneksi Anda lalu coba lagi.",
    });
  }

  revalidatePath(`/admin/siswa/${studentId}`);
  revalidatePath(path);
  revalidatePath("/admin");

  return success(`Status layanan diubah menjadi “${serviceStatusLabel(status)}”. Riwayat perubahan tersimpan.`);
}
