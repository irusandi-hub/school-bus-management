import "@/app/workspace-redesign.css";
import { BrandLogo } from "@/components/brand-logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { ConfigNotice } from "@/components/admin/ui";
import { BottomNav } from "@/components/ui/BottomNav";
import { Icon } from "@/components/ui/Icon";
import { adminBottomNav, adminGroups } from "@/components/ui/nav-config";
import { requireOperator } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";
import { MobileMenu } from "@/components/ui/MobileMenu";

/** One global workspace for all platform administration and operations. */
export async function OperatorWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const access = await requireOperator();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const viewer = access.viewer;
  const initials = (viewer.profile?.full_name || viewer.email || "OP")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="app-shell admin-shell operator-shell">
      <aside className="sidebar">
        <BrandLogo href="/operator" subtitle="Operator Utama" ariaLabel="School Bus Operator" className="brand" />
        <div className="nav-group"><AdminNav /></div>
        <div className="sidebar-bottom">
          <span className="security-icon"><Icon name="shield" size={13} /></span>
          <strong>Operator Utama</strong>
          <p>Akses global seluruh Project Area.</p>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <MobileMenu
            groups={adminGroups}
            rootHref="/operator"
            areaLabel="Operator Utama"
            note="Seluruh data dan operasional platform berada dalam satu ruang kerja Operator."
          />
          <div className="topbar-context">
            <span className="topbar-kicker">Operator Utama</span>
            <strong>Ruang kerja Project Area</strong>
          </div>
          <div className="top-actions">
            <span className="account-chip" title={viewer.email ?? undefined}>
              <span className="account-avatar" aria-hidden="true">{initials || "OP"}</span>
              <span className="account-name">{viewer.profile?.full_name || viewer.email}</span>
            </span>
            <form action={signOutAction}>
              <button className="btn btn-ghost btn-sm topbar-exit" type="submit">
                <Icon name="logout" size={15} /><span>Keluar</span>
              </button>
            </form>
          </div>
        </header>
        {children}
        <footer className="page-footer">
          <span>School Bus Management · Operator Utama</span>
          <span>Kendali global · Project Area · audit operasional</span>
        </footer>
      </main>
      <BottomNav items={adminBottomNav} rootHref="/operator" ariaLabel="Navigasi Operator" />
    </div>
  );
}
