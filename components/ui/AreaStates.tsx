"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "./Icon";

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
  useEffect(() => {
    // Diteruskan ke log server/klien agar kegagalan nyata dapat dilacak.
    console.error(`[${area}]`, error);
  }, [area, error]);

  return (
    <div className="state-panel error" role="alert">
      <span className="state-icon" aria-hidden="true">
        <Icon name="alert" size={22} />
      </span>
      <strong>{area} gagal dimuat</strong>
      <p>
        Data tidak dapat diambil saat ini. Periksa koneksi Anda lalu coba lagi. Tidak ada perubahan data yang
        tersimpan dari halaman ini.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={reset}>
          <Icon name="refresh" size={15} />
          Coba lagi
        </button>
        <Link className="btn btn-secondary btn-sm" href={backHref}>
          Kembali ke ringkasan
        </Link>
      </div>
      {error.digest && <p style={{ fontSize: 10, color: "#9A9282" }}>Kode galat: {error.digest}</p>}
    </div>
  );
}

/** Kerangka pemuatan bersama (dipakai loading.tsx setiap area). */
export function LoadingState({ title, variant = "split" }: { title: string; variant?: "split" | "list" | "cards" }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="admin-page-head">
        <div>
          <h1>{title}</h1>
          <p>Mengambil data terbaru…</p>
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
