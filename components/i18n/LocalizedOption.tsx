"use client";

import { useLocale } from "./LocaleProvider";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

export function LocalizedOption({ value, label }: { value: string; label: string }) {
  const { locale } = useLocale();
  return <option value={value}>{translateAdminCopy(label, locale) ?? label}</option>;
}
