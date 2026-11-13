import "@/app/workspace-redesign.css";
import { BrandLogo } from "@/components/brand-logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { ConfigNotice } from "@/components/admin/ui";
import { LocalizedText } from "@/components/i18n/LocaleProvider";
import { BottomNav } from "@/components/ui/BottomNav";
import { Icon } from "@/components/ui/Icon";
import { adminBottomNav, adminGroups } from "@/components/ui/nav-config";
import { requireOperator } from "@/lib/auth";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/messages";
import { signOutAction } from "@/lib/auth-actions";

/** One global workspace for all platform administration and operations. */
export async function OperatorWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const access = await requireOperator();
  if (access.status === "unconfigured") return <ConfigNotice />;

  return (
    <div className="app-shell admin-shell operator-shell">
      <aside className="sidebar">
        <BrandLogo href="/operator" subtitle={t("operator")} ariaLabel="School Bus Operator" className="brand" />
        <div className="nav-group"><AdminNav /></div>
        <div className="sidebar-bottom">
          <span className="security-icon"><Icon name="shield" size={13} /></span>
          <strong><LocalizedText k="operator" /></strong>
          <p><LocalizedText k="globalAccess" /></p>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <BrandLogo
            href="/operator"
            size="sm"
            ariaLabel="School Bus Operator"
            className="topbar-brand"
          />
          <div className="topbar-context">
            <span className="topbar-kicker"><LocalizedText k="operator" /></span>
            <strong><LocalizedText k="operatorWorkspace" /></strong>
          </div>
          <div className="top-actions">
            <form action={signOutAction}>
              <button className="btn btn-ghost btn-sm topbar-exit" type="submit">
                <Icon name="logout" size={15} /><span><LocalizedText k="signOut" /></span>
              </button>
            </form>
          </div>
        </header>
        {children}
        <footer className="page-footer">
          <span>School Bus Management · <LocalizedText k="operator" /></span>
          <span><LocalizedText k="operatorFooter" /></span>
        </footer>
      </main>
      <BottomNav
        items={adminBottomNav}
        groups={adminGroups}
        rootHref="/operator"
        ariaLabel={locale === "ar" ? "قائمة المشغّل" : locale === "en" ? "Operator navigation" : "Navigasi Operator"}
        areaLabel={t("operator")}
      />
    </div>
  );
}
