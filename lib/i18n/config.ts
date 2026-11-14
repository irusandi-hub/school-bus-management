export const locales = ["id", "en", "ar"] as const;

export type Locale = (typeof locales)[number];
export type TextDirection = "ltr" | "rtl";

export const defaultLocale: Locale = "id";

export const localeDisplayNames: Record<Locale, string> = {
  id: "🇮🇩 Bahasa",
  en: "🇬🇧 English",
  ar: "🇸🇦 العربية",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function getDirection(locale: Locale): TextDirection {
  return locale === "ar" ? "rtl" : "ltr";
}
