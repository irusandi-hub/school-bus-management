import Link from "next/link";
import type { Metadata } from "next";
import { OperatorNav } from "@/components/operator/OperatorNav";
import { ConfigNotice } from "@/components/admin/ui";
import { BottomNav } from "@/components/ui/BottomNav";
import { Icon } from "@/components/ui/Icon";
import { MobileMenu } from "@/components/ui/MobileMenu";
import { operatorBottomNav, operatorGroups } from "@/components/ui/nav-config";
import { requireOperator } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "Operator | School Bus" };

export const dynamic = "force-dynamic";

export default async function OperatorLayout({ children }: { children: React.ReactNode }) {
  const access = await requireOperator();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const { viewer, operator } = access;
  const initials = (viewer.profile?.full_name || viewer.email || "OP")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="app-shell admin-shell operator-shell">
      <aside className="sidebar">
        <Link className="brand" href="/operator" aria-label="School Bus Operator">
          <div className="brand-mark">S</div>
          <div>
            <div className="brand-name">School Bus</div>
            <div className="brand-sub">Operator</div>
          </div>
        </Link>
        <div className="org-chip" title={operator.name}>
          <span className="org-chip-dot" aria-hidden="true" />
          <div>
            <strong>{operator.name}</strong>
            <small>Organisasi Anda</small>
          </div>
        </div>
        <div className="nav-group">
          <OperatorNav />
        </div>
        <div className="sidebar-bottom">
          <span className="security-icon">
            <Icon name="shield" size={13} />
          </span>
          <strong>Akses terbatas organisasi</strong>
          <p>Armada, pengemudi, siswa, dan perjalanan difilter oleh kebijakan database untuk organisasi ini saja.</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <MobileMenu
            groups={operatorGroups}
            rootHref="/operator"
            areaLabel="Operator"
            note={`Hanya data milik ${operator.name} yang tersedia di menu ini.`}
          />
          <div className="topbar-title">
            <div className="eyebrow">RUANG KERJA OPERATOR</div>
            <div className="admin-topbar-role">{operator.name}</div>
          </div>
          <div className="top-actions">
            <span className="account-chip" title={viewer.email ?? undefined}>
              <span className="account-avatar" aria-hidden="true">
                {initials || "OP"}
              </span>
              <span className="account-name">{viewer.profile?.full_name || viewer.email}</span>
            </span>
            <form action={signOutAction}>
              <button className="btn btn-ghost" type="submit">
                <Icon name="logout" size={15} />
                Keluar
              </button>
            </form>
          </div>
        </header>
        {children}
        <footer className="page-footer">
          <span>School Bus Management · Operator</span>
          <span>Data organisasi · akses diperiksa database · GPS belum aktif</span>
        </footer>
      </main>

      <BottomNav items={operatorBottomNav} rootHref="/operator" ariaLabel="Navigasi seluler operator" />
    </div>
  );
}
