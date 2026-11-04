import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Halaman tidak ditemukan | School Bus" };

export default function NotFound() {
  return (
    <main className="config-page">
      <section className="panel config-card" style={{ textAlign: "center" }}>
        <div className="state-panel" style={{ justifyItems: "center", padding: "6px 0 18px" }}>
          <span className="state-icon" aria-hidden="true">
            <Icon name="search" size={22} />
          </span>
          <strong>Halaman tidak ditemukan</strong>
          <p>
            Tautan yang Anda buka tidak tersedia atau data yang diminta bukan milik akun Anda. Periksa kembali alamat
            halaman, atau kembali ke gerbang akses untuk memilih area yang sesuai.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="btn btn-primary" href="/">
            Kembali ke gerbang akses
          </Link>
          <Link className="btn btn-secondary" href="/admin">
            Buka area admin
          </Link>
        </div>
      </section>
    </main>
  );
}
