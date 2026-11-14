export type DemoOtpRole = "operator" | "pengemudi" | "wali";

const DEMO_OTP_CODES: Record<DemoOtpRole, readonly string[]> = {
  operator: ["123456"],
  pengemudi: ["234567"],
  wali: ["345001", "345002", "345003"],
};

export const DEMO_OTP_DESTINATIONS: Record<DemoOtpRole, string> = {
  operator: "/operator",
  pengemudi: "/pengemudi",
  wali: "/wali",
};

export type DemoGuardianKey = "one" | "two" | "three";

export function demoGuardianKeyForOtp(code: string): DemoGuardianKey | null {
  if (code === "345001") return "one";
  if (code === "345002") return "two";
  if (code === "345003") return "three";
  return null;
}

export function isDemoOtpValid(role: DemoOtpRole, code: string): boolean {
  return DEMO_OTP_CODES[role].includes(code);
}

export function isDemoOtpRole(value: string | null | undefined): value is DemoOtpRole {
  return value === "operator" || value === "pengemudi" || value === "wali";
}
