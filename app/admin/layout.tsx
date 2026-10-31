import Link from "next/link";
import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { ConfigNotice } from "@/components/admin/ui";
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
    <div className="app-shell admin-shell">
      <aside className="sidebar">
        <Link className="brand" href="/admin" aria-label="School Bus Admin Pusat">
          <div className="brand-mark">S</div>
          <div>
            <div className="brand-name">School Bus</div>
            <div className="brand-sub">Admin Pusat</div>
          </div>
        </Link>

        <div className="nav-group">
          <div className="workspace-label">Data induk</div>
          <AdminNav />
        </div>

        <div className="sidebar-bottom">
          <span className="security-icon">✓</span>
          <strong>Otorisasi dari database</strong>
          <p>Setiap perubahan diperiksa ulang oleh kebijakan akses database, bukan hanya oleh tampilan.</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            <div className="eyebrow">DAMMAM · PILOT</div>
            <div className="admin-topbar-role">Ruang kerja Admin Pusat</div>
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
                Keluar
              </button>
            </form>
          </div>
        </header>

        {children}

        <footer className="page-footer">
          <span>School Bus Management</span>
          <span>Data master · modul perjalanan belum aktif</span>
        </footer>
      </main>

      <nav className="mobile-nav" aria-label="Navigasi seluler Admin Pusat">
        <Link href="/admin">
          <span aria-hidden="true">▦</span>Ringkasan
        </Link>
        <Link href="/admin/siswa">
          <span aria-hidden="true">♧</span>Siswa
        </Link>
        <Link href="/admin/wali">
          <span aria-hidden="true">☎</span>Wali
        </Link>
        <Link href="/admin/bus">
          <span aria-hidden="true">▰</span>Bus
        </Link>
      </nav>
    </div>
  );
}
