import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/types";

export const DEMO_OTP_COOKIE = "schoolbus_demo_session";
const MAX_AGE_SECONDS = 60 * 60 * 12;

export type DemoOtpAccount = {
  id: "operator" | "driver" | "parent-1" | "parent-2" | "parent-3";
  role: Extract<UserRole, "operator" | "driver" | "parent">;
  name: string;
};

const ACCOUNTS: Record<string, DemoOtpAccount> = {
  "123456": { id: "operator", role: "operator", name: "Operator Contoh" },
  "234567": { id: "driver", role: "driver", name: "Pengemudi Contoh" },
  "345001": { id: "parent-1", role: "parent", name: "Wali Contoh 1" },
  "345002": { id: "parent-2", role: "parent", name: "Wali Contoh 2" },
  "345003": { id: "parent-3", role: "parent", name: "Wali Contoh 3" },
};

function previewDemoEnabled() {
  return process.env.VERCEL_ENV === "preview" &&
    process.env.DEV_OPEN_ACCESS?.trim().toLowerCase() === "0" &&
    Boolean(process.env.DEMO_OTP_SESSION_SECRET);
}

function signature(payload: string) {
  const secret = process.env.DEMO_OTP_SESSION_SECRET;
  if (!secret) throw new Error("Sesi OTP demo belum dikonfigurasi.");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function demoAccountForCode(code: string): DemoOtpAccount | null {
  if (!previewDemoEnabled()) return null;
  return ACCOUNTS[code] ?? null;
}

export function createDemoOtpToken(account: DemoOtpAccount) {
  if (!previewDemoEnabled()) throw new Error("OTP demo hanya tersedia di Vercel Preview.");
  const payload = Buffer.from(JSON.stringify({
    ...account,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifyDemoOtpToken(token: string | undefined | null): DemoOtpAccount | null {
  if (!token || !previewDemoEnabled()) return null;
  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra) return null;
  const expected = signature(payload);
  const supplied = Buffer.from(suppliedSignature);
  const actual = Buffer.from(expected);
  if (supplied.length !== actual.length || !timingSafeEqual(supplied, actual)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const account = ACCOUNTS_BY_ID[parsed.id as DemoOtpAccount["id"]];
    if (!account || parsed.role !== account.role || parsed.name !== account.name) return null;
    if (!Number.isInteger(parsed.exp) || parsed.exp <= Math.floor(Date.now() / 1000)) return null;
    return account;
  } catch {
    return null;
  }
}

const ACCOUNTS_BY_ID: Record<DemoOtpAccount["id"], DemoOtpAccount> = {
  operator: ACCOUNTS["123456"],
  driver: ACCOUNTS["234567"],
  "parent-1": ACCOUNTS["345001"],
  "parent-2": ACCOUNTS["345002"],
  "parent-3": ACCOUNTS["345003"],
};

export async function getDemoOtpAccount() {
  const store = await cookies();
  return verifyDemoOtpToken(store.get(DEMO_OTP_COOKIE)?.value);
}

export function getDemoOtpAccountFromRequest(request: NextRequest) {
  return verifyDemoOtpToken(request.cookies.get(DEMO_OTP_COOKIE)?.value);
}

export function demoAccountUserId(account: DemoOtpAccount) {
  const suffix = account.id === "operator" ? "a2"
    : account.id === "driver" ? "a3"
    : account.id === "parent-1" ? "a4"
    : account.id === "parent-2" ? "a5" : "a6";
  return `51111111-0000-4000-8000-0000000000${suffix}`;
}
