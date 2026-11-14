"use client";

import { localeDisplayNames, locales, type Locale } from "@/lib/i18n/config";
import { useRouter } from "next/navigation";
import { useLocale } from "./LocaleProvider";

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLocale();
  const router = useRouter();

  return (
    <label className={`locale-switcher ${compact ? "locale-switcher-compact" : ""}`}>
      <span className="locale-switcher-label">{t("language")}</span>
      <select
        aria-label={t("language")}
        value={locale}
        onChange={(event) => {
          const next = event.target.value as Locale;
          setLocale(next);
          router.refresh();
        }}
      >
        {locales.map((option) => (
          <option key={option} value={option} dir="auto">{localeDisplayNames[option]}</option>
        ))}
      </select>
    </label>
  );
}
