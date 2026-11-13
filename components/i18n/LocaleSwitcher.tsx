"use client";

import { getDirection, type Locale } from "@/lib/i18n/config";
import { useLocale } from "./LocaleProvider";

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <label className={`locale-switcher ${compact ? "locale-switcher-compact" : ""}`}>
      <span className="locale-switcher-label">{t("language")}</span>
      <select
        aria-label={t("language")}
        value={locale}
        onChange={(event) => {
          const next = event.target.value as Locale;
          setLocale(next);
          document.documentElement.dir = getDirection(next);
        }}
      >
        <option value="id">🇮🇩 {t("languageId")}</option>
        <option value="en">🇬🇧 {t("languageEn")}</option>
        <option value="ar">🇸🇦 {t("languageAr")}</option>
      </select>
    </label>
  );
}
