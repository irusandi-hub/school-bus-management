"use client";

import { Icon } from "@/components/ui/Icon";

/**
 * Tautan ringkas dari header ke panel keselamatan.
 *
 * Anchor tetap menjadi fallback tanpa JavaScript; saat aktif, panel dibuka
 * sebelum browser menggulir ke bagian tersebut. Validasi tetap berada di form
 * penutupan perjalanan dan tidak disentuh oleh tautan ini.
 */
export function OpenSafetyCheckLink() {
  return (
    <a
      className="btn ops-primary-action"
      href="#perjalanan-keselamatan"
      onClick={() => {
        const details = document.querySelector<HTMLDetailsElement>(
          "#perjalanan-keselamatan details.ops-close-details",
        );
        if (details) details.open = true;
      }}
    >
      <Icon name="shield" size={16} /> Periksa keselamatan
    </a>
  );
}
