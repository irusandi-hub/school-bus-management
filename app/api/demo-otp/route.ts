import { NextResponse } from "next/server";
import { DEMO_OTP_DESTINATIONS, demoGuardianKeyForOtp, isDemoOtpRole, isDemoOtpValid } from "@/lib/demo-otp";
import { isDevOpenAccess } from "@/lib/dev-open-access";
import { createDemoSessionToken, DEMO_SESSION_COOKIE, DEMO_SESSION_MAX_AGE, isDemoOtpAvailable } from "@/lib/demo-session-token";

export async function POST(request: Request) {
  const previewSimulation = isDevOpenAccess();
  if (!isDemoOtpAvailable()) {
    return NextResponse.json({ message: "OTP simulasi belum dikonfigurasi." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const role = body && typeof body === "object" ? body.role : null;
  const code = body && typeof body === "object" ? body.code : null;

  if (!isDemoOtpRole(role) || typeof code !== "string" || !isDemoOtpValid(role, code)) {
    return NextResponse.json({ message: "Kode OTP tidak sesuai." }, { status: 400 });
  }

  const guardianKey = role === "wali" ? demoGuardianKeyForOtp(code) : undefined;
  if (role === "wali" && !guardianKey) {
    return NextResponse.json({ message: "Akun wali simulasi tidak ditemukan." }, { status: 400 });
  }

  const token = await createDemoSessionToken(role, guardianKey);
  if (!token) return NextResponse.json({ message: "Sesi demo belum dapat dibuat." }, { status: 503 });

  const response = NextResponse.json({ destination: DEMO_OTP_DESTINATIONS[role] });
  response.cookies.set(DEMO_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: !previewSimulation || process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEMO_SESSION_MAX_AGE,
  });
  response.cookies.delete("sbm_demo_guardian");
  return response;
}
