import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
import { getRequestLocale } from "@/lib/i18n/server";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

export const metadata: Metadata = { title: "Halaman tidak ditemukan | School Bus" };

export default async function NotFound() {
  const locale = await getRequestLocale();
  const copy = (value: string) => translateAdminCopy(value, locale) ?? value;
  return (
    <main className="config-page">
      <section className="panel config-card" style={{ textAlign: "center" }}>
        <div className="state-panel" style={{ justifyItems: "center", padding: "6px 0 18px" }}>
          <span className="state-icon" aria-hidden="true">
            <Icon name="search" size={22} />
          </span>
          <strong>{copy("Halaman tidak ditemukan")}</strong>
          <p>
            {copy("Tautan yang Anda buka tidak tersedia atau data yang diminta bukan milik akun Anda. Periksa kembali alamat halaman, atau kembali ke gerbang akses untuk memilih area yang sesuai.")}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="btn btn-primary" href="/">
            {copy("Kembali ke gerbang akses")}
          </Link>
        </div>
      </section>
    </main>
  );
}
