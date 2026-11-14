import type { Metadata } from "next";
import { cookies } from "next/headers";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/messages";
import { ConfigNotice } from "@/components/admin/ui";
import { BrandLogo } from "@/components/brand-logo";
import { LocalizedText } from "@/components/i18n/LocaleProvider";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { Icon } from "@/components/ui/Icon";
import { BottomNav } from "@/components/ui/BottomNav";
import { signOutAction } from "@/lib/auth-actions";
import { driverBottomNav } from "@/components/ui/nav-config";
import { requireDriver } from "@/lib/auth";

export const metadata: Metadata = { title: "Pengemudi | School Bus" };
export const dynamic = "force-dynamic";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("sbm_locale")?.value;
  const locale = isLocale(savedLocale) ? savedLocale : defaultLocale;
  const access = await requireDriver();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const name = access.driver.full_name || access.viewer.profile?.full_name || "Pengemudi";

  return (
    <div className="driver-app">
      <header className="driver-head">
        <BrandLogo href="/pengemudi" subtitle={translate(locale, "driverArea")} size="sm" />
        <span>{name}</span>
        <div className="flex flex-none items-center gap-2">
          <LocaleSwitcher />
          <form action={signOutAction} className="compact-logout-form">
            <button className="compact-logout" type="submit" aria-label={translate(locale, "signOut")} title={translate(locale, "signOut")}>
              <Icon name="logout" size={17} />
            </button>
          </form>
        </div>
      </header>
      <main className="driver-main">{children}</main>
      <footer className="driver-foot">
        <span>{translate(locale, "driverFooterScope")}</span>
        <span>{translate(locale, "driverFooterGps")}</span>
      </footer>
      <BottomNav items={driverBottomNav} rootHref="/pengemudi" ariaLabel={translate(locale, "navigationDriver")} />
    </div>
  );
}
