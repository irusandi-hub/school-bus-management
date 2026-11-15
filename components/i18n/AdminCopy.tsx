"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

export function AdminCopy({ value }: { value: string }) {
  const { locale } = useLocale();
  return <>{translateAdminCopy(value, locale) ?? value}</>;
}
