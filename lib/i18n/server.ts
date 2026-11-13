import { cookies } from "next/headers";
import { defaultLocale, isLocale } from "./config";

export async function getRequestLocale() {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("sbm_locale")?.value;
  return isLocale(savedLocale) ? savedLocale : defaultLocale;
}
