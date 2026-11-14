import Link from "next/link";
import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand-logo";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { getRequestLocale } from "@/lib/i18n/server";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

export const metadata: Metadata = { title: "Eksplorasi Sementara | School Bus Management" };

const roles = [
  { href: "/wali", title: "Orang Tua" },
  { href: "/pengemudi", title: "Pengemudi" },
  { href: "/operator", title: "Pengelola" },
];

export default async function ChooseRolePage() {
  const locale = await getRequestLocale();
  const copy = (value: string) => translateAdminCopy(value, locale) ?? value;
  return (
    <main className="sbm-role-explore relative">
      <div className="absolute end-5 top-5 z-50"><LocaleSwitcher /></div>
      <section className="sbm-role-explore-card" aria-labelledby="explore-title">
        <BrandLogo href="/" ariaLabel="Kembali ke beranda" className="sbm-role-explore-brand" />
        <h1 id="explore-title">{copy("Pilih tampilan pengguna")}</h1>
        <p className="sbm-role-explore-note">{copy("Pilih area yang ingin dibuka. Halaman ini hanya penghubung sementara selama pengembangan aplikasi.")}</p>
        <nav className="sbm-role-explore-actions" aria-label={copy("Pilih tampilan untuk dieksplorasi")}>
          {roles.map((role) => (
            <Link href={role.href} key={role.href}>{copy(role.title)}<span aria-hidden="true">→</span></Link>
          ))}
        </nav>
      </section>
      <style>{`
        .sbm-role-explore{min-height:100vh;display:grid;place-items:center;padding:22px;background:#f7f5ec}
        .sbm-role-explore-card{width:min(100%,410px);padding:26px;background:#fff;border:1px solid #eee5ca;border-radius:16px;box-shadow:0 12px 32px #4e42100a}
        .sbm-role-explore-brand{margin-bottom:24px}
        .sbm-role-explore-card h1{font:800 21px Manrope,sans-serif;letter-spacing:-.5px;color:#263746;margin:0 0 8px}
        .sbm-role-explore-note{font-size:12px;line-height:1.65;color:#78838a;margin:0 0 20px}
        .sbm-role-explore-actions{display:grid;gap:8px}
        .sbm-role-explore-actions a{min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 15px;border:1px solid #e9e3d1;border-radius:9px;text-decoration:none;color:#263746;font:700 13px Manrope,sans-serif;background:#fff;transition:background .15s ease,border-color .15s ease}
        .sbm-role-explore-actions a:hover{background:#fff9e7;border-color:#e8d28b}.sbm-role-explore-actions a:first-child{background:#fff9e7;border-color:#f0dfa9}
        .sbm-role-explore-actions a span{font-size:18px;color:#987400}
        @media(max-width:480px){.sbm-role-explore-card{padding:22px;border-radius:15px}}
      `}</style>
    </main>
  );
}
