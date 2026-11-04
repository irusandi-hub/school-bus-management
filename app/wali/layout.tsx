import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice } from "@/components/admin/ui";
import { BottomNav } from "@/components/ui/BottomNav";
import { Icon } from "@/components/ui/Icon";
import { PortalNav } from "@/components/ui/PortalNav";
import { guardianBottomNav } from "@/components/ui/nav-config";
import { requireGuardian } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "Portal Wali | School Bus" };
export const dynamic = "force-dynamic";

const portalNavItems = [
  { href: "/wali", label: "Anak saya" },
  { href: "/wali/riwayat", label: "Riwayat" },
];

export default async function GuardianLayout({ children }: { children: React.ReactNode }) {
  const access = await requireGuardian();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const name = access.viewer.profile?.full_name || access.viewer.email || "Wali";

  return (
    <div className="portal-shell guardian-shell">
      <header className="portal-head">
        <Link className="brand" href="/wali">
          <div className="brand-mark">S</div>
          <div>
            <div className="brand-name">School Bus</div>
            <div className="brand-sub">Portal Orang Tua/Wali</div>
          </div>
        </Link>

        <PortalNav items={portalNavItems} rootHref="/wali" />

        <div className="portal-account">
          <span className="account-name">{name}</span>
          <form action={signOutAction}>
            <button className="btn btn-ghost btn-sm" type="submit">
              <Icon name="logout" size={15} />
              Keluar
            </button>
          </form>
        </div>
      </header>

      {children}

      <footer className="page-footer">
        <span>School Bus Management · Portal Wali</span>
        <span>Hanya anak yang terhubung dan aktif · GPS &amp; kamera belum aktif</span>
      </footer>

      <BottomNav items={guardianBottomNav} rootHref="/wali" ariaLabel="Navigasi seluler wali" />
    </div>
  );
}
