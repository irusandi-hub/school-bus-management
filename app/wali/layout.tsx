import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice } from "@/components/admin/ui";
import { requireGuardian } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "Portal Wali | School Bus" };

export const dynamic = "force-dynamic";

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

        <nav className="portal-nav" aria-label="Navigasi portal wali">
          <Link href="/wali">Anak saya</Link>
          <Link href="/wali/riwayat">Riwayat</Link>
        </nav>

        <div className="portal-account">
          <span>{name}</span>
          <form action={signOutAction}>
            <button className="btn btn-ghost" type="submit">
              Keluar
            </button>
          </form>
        </div>
      </header>

      {children}

      <footer className="page-footer">
        <span>School Bus Management · Portal Wali</span>
        <span>Hanya anak yang terhubung dan aktif</span>
      </footer>

      <nav className="mobile-nav guardian-mobile-nav" aria-label="Navigasi seluler wali">
        <Link href="/wali">
          <span aria-hidden="true">⌂</span>Anak saya
        </Link>
        <Link href="/wali/riwayat">
          <span aria-hidden="true">◷</span>Riwayat
        </Link>
        <form action={signOutAction}>
          <button type="submit">
            <span aria-hidden="true">⇥</span>Keluar
          </button>
        </form>
      </nav>
    </div>
  );
}
