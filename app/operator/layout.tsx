import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand-logo";
import { OperatorNav } from "@/components/operator/OperatorNav";
import { ConfigNotice } from "@/components/admin/ui";
import { BottomNav } from "@/components/ui/BottomNav";
import { Icon } from "@/components/ui/Icon";
import { operatorBottomNav } from "@/components/ui/nav-config";
import { requireOperator } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "Pengelola | School Bus" };

export const dynamic = "force-dynamic";

export default async function OperatorLayout({ children }: { children: React.ReactNode }) {
  const access = await requireOperator();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const { operator } = access;

  return (
    <div className="app-shell admin-shell operator-shell">
      <aside className="sidebar">
        <BrandLogo
          href="/operator"
          subtitle="Pengelola"
          ariaLabel="School Bus Pengelola"
          className="brand"
        />
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
          <p>Armada, pengemudi, siswa, dan perjalanan hanya milik organisasi ini.</p>
        </div>
      </aside>

      <main className="main">
        <header className="operator-header compact-area-header">
          <BrandLogo href="/operator" subtitle="Area Pengelola" size="sm" />
          <form action={signOutAction}>
            <button className="btn btn-ghost btn-sm" type="submit">
              <Icon name="logout" size={15} />
              Keluar
            </button>
          </form>
        </header>
        {children}
        <footer className="page-footer">
          <span>School Bus Management · Pengelola</span>
          <span>Data organisasi · akses sesuai akun · GPS belum aktif</span>
        </footer>
      </main>

      <BottomNav items={operatorBottomNav} rootHref="/operator" ariaLabel="Navigasi seluler pengelola" />
    </div>
  );
}
