import { cookies } from "next/headers";
import { DEMO_SESSION_COOKIE, verifyDemoSessionToken, type DemoSession } from "@/lib/demo-session-token";

export async function getDemoSession(): Promise<DemoSession | null> {
  const cookieStore = await cookies();
  return verifyDemoSessionToken(cookieStore.get(DEMO_SESSION_COOKIE)?.value);
}
