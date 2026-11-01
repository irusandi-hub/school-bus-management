import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice } from "@/components/admin/ui";
import { requireDriver } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "Pengemudi | School Bus" };

export const dynamic = "force-dynamic";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const access = await requireDriver();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const name = access.driver.full_name || access.viewer.profile?.full_name || "Pengemudi";

  return (
    <div className="driver-app">
      <header className="driver-head">
        <Link className="driver-brand" href="/pengemudi">
          <span className="driver-mark" aria-hidden="true">S</span>
          <span>
            <strong>School Bus</strong>
            <small>Area Pengemudi</small>
          </span>
        </Link>
        <div className="driver-account">
          <span>{name}</span>
          <form action={signOutAction}>
            <button className="btn btn-ghost" type="submit">
              Keluar
            </button>
          </form>
        </div>
      </header>

      <main className="driver-main">{children}</main>

      <footer className="driver-foot">
        <span>Hanya tugas dan perjalanan milik akun ini</span>
        <span>GPS &amp; kamera belum aktif</span>
      </footer>

      <nav className="mobile-nav driver-nav" aria-label="Navigasi pengemudi">
        <Link href="/pengemudi">
          <span aria-hidden="true">▦</span>Tugas
        </Link>
        <Link href="/pengemudi/riwayat">
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
