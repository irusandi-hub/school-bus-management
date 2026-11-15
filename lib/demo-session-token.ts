import { DEV_GUARDIAN_VIEWERS, DEV_VIEWER } from "@/lib/dev-open-access";
import type { DemoGuardianKey, DemoOtpRole } from "@/lib/demo-otp";

export const DEMO_SESSION_COOKIE = "sbm_demo_session";
const SESSION_TTL_SECONDS = 4 * 60 * 60;

export function isDemoOtpAvailable(): boolean {
  return Boolean(process.env.DEMO_OTP_SESSION_SECRET && process.env.DEMO_OTP_SESSION_SECRET.length >= 32);
}

export type DemoSession = {
  role: DemoOtpRole;
  guardianKey?: DemoGuardianKey;
  exp: number;
  version: 1;
};

export type DemoIdentity = {
  userId: string;
  email: string;
  fullName: string;
  profileRole: "operator" | "driver" | "parent";
  guardianId?: string;
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function signingKey(): Promise<CryptoKey | null> {
  const secret = process.env.DEMO_OTP_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createDemoSessionToken(
  role: DemoOtpRole,
  guardianKey?: DemoGuardianKey,
): Promise<string | null> {
  const key = await signingKey();
  if (!key) return null;
  const session: DemoSession = {
    role,
    ...(role === "wali" && guardianKey ? { guardianKey } : {}),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    version: 1,
  };
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(session)));
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyDemoSessionToken(token: string | undefined | null): Promise<DemoSession | null> {
  if (!token || token.length > 2048) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const key = await signingKey();
  if (!key) return null;

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature),
      new TextEncoder().encode(payload),
    );
    if (!valid) return null;
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as Partial<DemoSession>;
    if (
      parsed.version !== 1 ||
      !Number.isInteger(parsed.exp) ||
      (parsed.exp as number) <= Math.floor(Date.now() / 1000) ||
      !["operator", "pengemudi", "wali"].includes(String(parsed.role))
    ) return null;
    if (parsed.role === "wali" && !["one", "two", "three"].includes(String(parsed.guardianKey))) return null;
    return parsed as DemoSession;
  } catch {
    return null;
  }
}

export function demoIdentity(session: DemoSession): DemoIdentity {
  if (session.role === "operator") {
    return { ...DEV_VIEWER.operator, profileRole: "operator" };
  }
  if (session.role === "pengemudi") {
    return { ...DEV_VIEWER.driver, profileRole: "driver" };
  }
  const guardian = DEV_GUARDIAN_VIEWERS[session.guardianKey ?? "one"];
  return {
    userId: guardian.userId,
    email: guardian.email,
    fullName: guardian.fullName,
    profileRole: "parent",
    guardianId: guardian.guardianId,
  };
}

export const DEMO_SESSION_MAX_AGE = SESSION_TTL_SECONDS;
