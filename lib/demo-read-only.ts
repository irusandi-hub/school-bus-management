import { getRequestLocale } from "@/lib/i18n/server";

const messages = {
  id: "Untuk simulasi, developer tidak mengizinkan pengguna melakukan perubahan data.",
  en: "For this simulation, the developer does not allow users to make data changes.",
  ar: "لأغراض المحاكاة، لا يسمح المطوّر للمستخدمين بإجراء تغييرات على البيانات.",
} as const;

export async function demoReadOnlyMessage(): Promise<string> {
  const locale = await getRequestLocale();
  return messages[locale] ?? messages.id;
}
