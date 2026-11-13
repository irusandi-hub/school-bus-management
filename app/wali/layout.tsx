import type { Metadata } from "next";
import { ConfigNotice } from "@/components/admin/ui";
import { BrandLogo } from "@/components/brand-logo";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { LocalizedText } from "@/components/i18n/LocaleProvider";
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

  return (
    <div className="portal-shell guardian-shell">
      <header className="portal-head compact-area-header">
        <BrandLogo href="/wali" subtitle="Portal Orang Tua/Wali" size="sm" className="brand" />
        <PortalNav items={portalNavItems} rootHref="/wali" />
        <div className="portal-account">
          <LocaleSwitcher compact />
          <form action={signOutAction}>
            <button className="btn btn-ghost btn-sm" type="submit">
              <Icon name="logout" size={15} />
              <LocalizedText k="signOut" />
            </button>
          </form>
        </div>
      </header>
      {children}
      <footer className="page-footer">
        <span>School Bus Management · Portal Wali</span>
        <span>Hanya anak yang terhubung dan aktif · Lokasi mengikuti GPS HP pengemudi</span>
      </footer>
      <BottomNav items={guardianBottomNav} rootHref="/wali" ariaLabel="Navigasi seluler wali" />
    </div>
  );
}
