import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { BrandLogo } from "@/components/brand-logo";
import { ConfigNotice } from "@/components/admin/ui";
import { BottomNav } from "@/components/ui/BottomNav";
import { Icon } from "@/components/ui/Icon";
import { MobileMenu } from "@/components/ui/MobileMenu";
import { adminBottomNav, adminGroups } from "@/components/ui/nav-config";
import { requireAdmin } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";

export const metadata: Metadata = {
  title: "Admin Pusat | School Bus",
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await requireAdmin();

  if (access.status === "unconfigured") return <ConfigNotice />;

  const { viewer } = access;
  const initials = (viewer.profile?.full_name || viewer.email || "AP")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="app-shell admin-shell admin-workspace">
      <aside className="sidebar">
        <BrandLogo
          href="/admin"
          subtitle="Admin Pusat"
          ariaLabel="School Bus Admin Pusat"
          className="brand"
        />

        <div className="nav-group">
          <AdminNav />
        </div>

        <div className="sidebar-bottom">
          <span className="security-icon">
            <Icon name="shield" size={13} />
          </span>
          <strong>Akses sesuai akun</strong>
          <p>Setiap perubahan diperiksa sesuai hak akses akun Anda.</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <MobileMenu
            groups={adminGroups}
            rootHref="/admin"
            areaLabel="Admin Pusat"
            note="Menu ini menampilkan seluruh modul Admin Pusat. Data yang tampil mengikuti hak akses akun Anda."
          />
          <div className="workspace-heading">
            <BrandLogo size="sm" />
          <div className="topbar-title">
            <div className="eyebrow">DAMMAM · PILOT</div>
            <div className="admin-topbar-role">Ruang kerja Admin Pusat</div>
          </div>
          </div>
          <div className="top-actions">
            <span className="account-chip" title={viewer.email ?? undefined}>
              <span className="account-avatar" aria-hidden="true">
                {initials || "AP"}
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
          <span>School Bus Management · Admin Pusat</span>
          <span>Data induk &amp; operasional · GPS belum aktif · kamera mengikuti perjalanan</span>
        </footer>
      </main>

      <BottomNav items={adminBottomNav} rootHref="/admin" ariaLabel="Navigasi seluler Admin Pusat" />
    </div>
  );
}
