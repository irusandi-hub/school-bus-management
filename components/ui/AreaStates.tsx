"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "./Icon";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

/** Batas galat per area: pengguna mendapat penjelasan dan tombol coba lagi. */
export function AreaError({
  error,
  reset,
  area,
  backHref,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  area: string;
  backHref: string;
}) {
  const { locale } = useLocale();
  const c = (value: string) => translateAdminCopy(value, locale) ?? value;
  useEffect(() => {
    // Diteruskan ke log server/klien agar kegagalan nyata dapat dilacak.
    console.error(`[${area}]`, error);
  }, [area, error]);

  return (
    <div className="state-panel error" role="alert">
      <span className="state-icon" aria-hidden="true">
        <Icon name="alert" size={22} />
      </span>
      <strong>{c(area)} {c("belum dapat dimuat.")}</strong>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={reset}>
          <Icon name="refresh" size={15} />
          {c("Coba lagi")}
        </button>
        <Link className="btn btn-secondary btn-sm" href={backHref}>
          {c("Kembali ke ringkasan")}
        </Link>
      </div>
      {error.digest && <p style={{ fontSize: 10, color: "#9A9282" }}>{c("Kode galat:")} {error.digest}</p>}
    </div>
  );
}

/** Kerangka pemuatan bersama (dipakai loading.tsx setiap area). */
export function LoadingState({ title, variant = "split" }: { title: string; variant?: "split" | "list" | "cards" }) {
  const { locale } = useLocale();
  const translatedTitle = translateAdminCopy(title, locale) ?? title;
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="admin-page-head">
        <div>
          <h1>{translatedTitle}</h1>
        </div>
      </div>

      {variant === "cards" ? (
        <div className="stats">
          {[0, 1, 2, 3].map((index) => (
            <div className="panel loading-block" key={index} style={{ minHeight: 108 }} />
          ))}
        </div>
      ) : (
        <div className="loading-grid">
          <div className="panel loading-block" />
          <div className="panel loading-block loading-block-tall" />
        </div>
      )}

      {variant !== "split" && (
        <div className="panel" style={{ marginTop: 18, padding: 20 }}>
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </div>
      )}
    </div>
  );
}
