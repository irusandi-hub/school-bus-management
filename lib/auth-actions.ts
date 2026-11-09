"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { supabaseNotConfiguredMessage } from "@/lib/supabase/env";
import { scopedNext } from "@/lib/access";
import type { UserRole } from "@/lib/types";
import {
  failure,
  isValidEmail,
  normalizeEmail,
  readText,
  success,
  type ActionState,
} from "@/lib/validation";

async function requestOrigin() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  if (!host) return null;
  return `${proto}://${host}`;
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = normalizeEmail(readText(formData, "email"));
  const password = typeof formData.get("password") === "string" ? (formData.get("password") as string) : "";

  const fieldErrors: Record<string, string> = {};
  if (!isValidEmail(email)) fieldErrors.email = "Masukkan alamat email yang valid.";
  if (password.length === 0) fieldErrors.password = "Kata sandi wajib diisi.";
  if (Object.keys(fieldErrors).length > 0) {
    return failure("Periksa kembali data yang Anda masukkan.", fieldErrors);
  }

  const supabase = await createServerSupabase();
  if (!supabase) return failure(supabaseNotConfiguredMessage);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return failure(
      "Email atau kata sandi tidak sesuai. Periksa kembali penulisan keduanya. Jika Anda belum pernah membuat kata sandi, gunakan halaman Aktivasi Akun.",
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/akun/kata-sandi?alasan=belum-aktivasi");
  }

  // The destination is derived from the role stored in the database, never from the
  // card the visitor clicked or from the `next` query parameter alone.
  const role = profile.role as UserRole;
  const requestedNext = readText(formData, "next");

  if (role === "admin") {
    redirect(scopedNext("admin", requestedNext));
  }

  if (role === "operator") {
    // Operator is the single global authority. Company rows are attribution data,
    // never a prerequisite for authentication or access to the Operator workspace.
    redirect(scopedNext("operator", requestedNext));
  }

  if (role === "driver") {
    const { data: driver } = await supabase
      .from("drivers")
      .select("id")
      .eq("profile_id", data.user.id)
      .eq("active", true)
      .maybeSingle();

    if (!driver) {
      await supabase.auth.signOut();
      return failure(
        "Akun ini memiliki peran pengemudi tetapi belum ditautkan ke data pengemudi yang aktif. Hubungi Operator Utama untuk menautkan akun Anda.",
      );
    }

    redirect(scopedNext("driver", requestedNext));
  }

  if (role === "parent") {
    const { count } = await supabase
      .from("students")
      .select("id", { count: "exact", head: true });

    if (!count) {
      await supabase.auth.signOut();
      return failure(
        "Akun ini belum memiliki siswa dengan layanan aktif, sehingga akses layanan tidak dapat dibuka. Hubungi Operator Utama untuk memeriksa status layanan siswa Anda.",
      );
    }

    redirect(scopedNext("parent", requestedNext));
  }

  await supabase.auth.signOut();
  return failure("Akun ini belum memiliki peran yang diizinkan untuk aplikasi. Hubungi Operator Utama.");
}

export async function requestSignupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = normalizeEmail(readText(formData, "email"));

  if (!isValidEmail(email)) {
    return failure("Masukkan alamat email yang valid.", { email: "Format email belum benar." });
  }

  const supabase = await createServerSupabase();
  if (!supabase) return failure(supabaseNotConfiguredMessage);

  const origin = await requestOrigin();
  if (!origin) {
    return failure("Permintaan belum dapat diproses dari jaringan ini. Coba lagi atau hubungi Operator Utama.");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/akun/kata-sandi")}`,
    },
  });

  if (error) {
    return failure(
      "Permintaan belum berhasil diproses. Tunggu beberapa menit lalu coba lagi. Jika masih gagal, hubungi Operator Utama.",
    );
  }

  // Response is intentionally identical for registered and unregistered emails so the
  // form cannot be used to discover which guardian emails exist in the database.
  return success(
    "Jika email tersebut terdaftar oleh Operator Utama dan memiliki siswa dengan layanan aktif, tautan verifikasi sudah dikirim. Periksa kotak masuk dan folder spam, lalu buka tautan untuk membuat kata sandi.",
  );
}

export async function completeAccountAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const password = typeof formData.get("password") === "string" ? (formData.get("password") as string) : "";
  const confirmation =
    typeof formData.get("password_confirmation") === "string"
      ? (formData.get("password_confirmation") as string)
      : "";

  if (password.length < 8) {
    return failure("Kata sandi minimal 8 karakter.", { password: "Minimal 8 karakter." });
  }
  if (password !== confirmation) {
    return failure("Konfirmasi kata sandi tidak sama.", {
      password_confirmation: "Ulangi kata sandi dengan tepat.",
    });
  }

  const supabase = await createServerSupabase();
  if (!supabase) return failure(supabaseNotConfiguredMessage);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?alasan=sesi-berakhir");
  }

  const { error: passwordError } = await supabase.auth.updateUser({ password });
  if (passwordError) {
    return failure(
      "Kata sandi belum dapat disimpan. Kata sandi minimal 8 karakter dan tidak boleh sama dengan kata sandi sebelumnya. Jika masih gagal, minta tautan verifikasi baru.",
    );
  }

  const { data: claimResult, error: claimError } = await supabase.rpc("claim_guardian_account");

  if (claimError) {
    return failure(
      "Kata sandi sudah tersimpan, tetapi aktivasi akses belum berhasil. Coba muat ulang halaman ini. Jika tetap gagal, hubungi Operator Utama.",
    );
  }

  if (claimResult === "linked") {
    redirect("/wali");
  }

  await supabase.auth.signOut();

  switch (claimResult) {
    case "no_active_service":
      return failure(
        "Akun tidak dapat diaktifkan karena belum ada siswa terhubung dengan layanan aktif. Hubungi Operator Utama untuk memeriksa status layanan siswa Anda.",
      );
    case "not_registered":
      return failure(
        "Email ini belum terdaftar sebagai wali oleh Operator Utama atau sudah dinonaktifkan, sehingga akses tidak dapat dibuka. Hubungi Operator Utama untuk pendaftaran email.",
      );
    case "email_unverified":
      return failure("Email belum terverifikasi. Buka tautan verifikasi terbaru dari email Anda, lalu ulangi proses ini.");
    case "already_linked":
      return failure("Email ini sudah terhubung ke akun lain. Hubungi Operator Utama untuk bantuan.");
    case "role_conflict":
      return failure("Akun ini sudah terdaftar dengan peran lain sehingga tidak dapat diaktifkan sebagai wali. Hubungi Operator Utama.");
    case "unauthenticated":
      return failure("Sesi Anda sudah berakhir. Silakan mulai lagi dari halaman Aktivasi Akun.");
    default:
      return failure("Aktivasi akun belum berhasil karena kendala yang belum diketahui. Coba lagi atau hubungi Operator Utama.");
  }
}

export async function signOutAction() {
  const supabase = await createServerSupabase();
  await supabase?.auth.signOut();
  redirect("/");
}
