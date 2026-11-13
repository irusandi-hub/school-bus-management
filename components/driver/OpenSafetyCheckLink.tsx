"use client";

import { Icon } from "@/components/ui/Icon";

/** Membuka pemeriksaan akhir tanpa menggulir atau mengubah tata letak dashboard. */
export function OpenSafetyCheckLink() {
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
