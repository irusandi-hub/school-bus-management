import { NextResponse } from "next/server";
import { DEMO_OTP_DESTINATIONS, demoGuardianKeyForOtp, isDemoOtpRole, isDemoOtpValid } from "@/lib/demo-otp";
import { isDevOpenAccess } from "@/lib/dev-open-access";

export async function POST(request: Request) {
  if (!isDevOpenAccess()) {
    return NextResponse.json({ message: "OTP simulasi tidak tersedia." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const role = body && typeof body === "object" ? body.role : null;
  const code = body && typeof body === "object" ? body.code : null;

  if (!isDemoOtpRole(role) || typeof code !== "string" || !isDemoOtpValid(role, code)) {
    return NextResponse.json({ message: "Kode OTP tidak sesuai." }, { status: 400 });
  }

  const response = NextResponse.json({ destination: DEMO_OTP_DESTINATIONS[role] });

  if (role === "wali") {
    const guardianKey = demoGuardianKeyForOtp(code);
    if (!guardianKey) {
      return NextResponse.json({ message: "Akun wali simulasi tidak ditemukan." }, { status: 400 });
    }
    response.cookies.set("sbm_demo_guardian", guardianKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
    });
  } else {
    response.cookies.delete("sbm_demo_guardian");
  }

  return response;
}
