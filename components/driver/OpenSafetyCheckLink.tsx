"use client";

import { Icon } from "@/components/ui/Icon";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

/** Membuka pemeriksaan akhir tanpa menggulir atau mengubah tata letak dashboard. */
export function OpenSafetyCheckLink() {
  const { locale } = useLocale();
  const label = translateAdminCopy("Akhiri Perjalanan", locale) ?? "Akhiri Perjalanan";
  return (
    <button
      className="btn ops-primary-action ops-start-action"
      type="button"
      onClick={() => window.dispatchEvent(new Event("schoolbus:open-trip-safety"))}
    >
      <Icon name="shield" size={16} /> Akhiri Perjalanan
    </button>
  );
}
