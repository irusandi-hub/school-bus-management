"use server";

import { cookies } from "next/headers";
import { DEMO_OTP_COOKIE, createDemoOtpToken, demoAccountForCode } from "@/lib/demo-otp-session";

export async function verifyDemoOtp(code: string) {
  const normalized = code.replace(/\\D/g, "");
  if (normalized.length !== 6) {
    return { ok: false as const, message: "Masukkan kode OTP 6 digit." };
  }

  const account = demoAccountForCode(normalized);
  if (!account) {
    return {
      ok: false as const,
      message: process.env.VERCEL_ENV === "preview"
        ? "Kode OTP tidak sesuai. Periksa kembali kode demo yang dipilih."
        : "Login OTP simulasi hanya tersedia pada deployment Preview.",
    };
  }

  const token = createDemoOtpToken(account);
  const store = await cookies();
  store.set(DEMO_OTP_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  const destination = account.role === "operator" ? "/operator"
    : account.role === "driver" ? "/pengemudi" : "/wali";

  return { ok: true as const, destination, account: account.id };
}
