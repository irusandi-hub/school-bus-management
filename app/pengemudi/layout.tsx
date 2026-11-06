import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice } from "@/components/admin/ui";
import { BottomNav } from "@/components/ui/BottomNav";
import { Icon } from "@/components/ui/Icon";
import { driverBottomNav } from "@/components/ui/nav-config";
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
          <span className="account-name">{name}</span>
          <form action={signOutAction}>
            <button className="btn btn-ghost btn-sm" type="submit">
              <Icon name="logout" size={15} />
              Keluar
            </button>
          </form>
        </div>
      </header>

      <main className="driver-main">{children}</main>

      <footer className="driver-foot">
        <span>Hanya tugas dan perjalanan milik akun ini</span>
        <span>GPS belum aktif · kamera mengikuti status perjalanan</span>
      </footer>

      <BottomNav items={driverBottomNav} rootHref="/pengemudi" ariaLabel="Navigasi pengemudi" />
    </div>
  );
}
