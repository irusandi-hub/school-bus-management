import type { Metadata } from "next";
import { cookies } from "next/headers";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/messages";
import { ConfigNotice } from "@/components/admin/ui";
import { BrandLogo } from "@/components/brand-logo";
import { LocalizedText } from "@/components/i18n/LocaleProvider";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
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
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("sbm_locale")?.value;
  const locale = isLocale(savedLocale) ? savedLocale : defaultLocale;
  const access = await requireGuardian();
  if (access.status === "unconfigured") return <ConfigNotice />;

  return (
    <div className="portal-shell guardian-shell">
      <header className="portal-head compact-area-header">
        <div className="flex min-w-0 items-center gap-2">
          <BrandLogo href="/wali" subtitle={translate(locale, "guardianPortal")} size="sm" className="brand" />
        </div>
        <PortalNav items={portalNavItems} rootHref="/wali" />
        <div className="portal-account flex items-center gap-2">
          <LocaleSwitcher />
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
        <span>School Bus Management · {translate(locale, "guardianPortal")}</span>
        <span>{translate(locale, "guardianFooter")}</span>
      </footer>
      <BottomNav items={guardianBottomNav} rootHref="/wali" ariaLabel={translate(locale, "navigationGuardian")} />
    </div>
  );
}
