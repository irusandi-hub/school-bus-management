import type { Metadata } from "next";
import { ConfigNotice } from "@/components/admin/ui";
import { BrandLogo } from "@/components/brand-logo";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { LocalizedText } from "@/components/i18n/LocaleProvider";
import { BottomNav } from "@/components/ui/BottomNav";
import { signOutAction } from "@/lib/auth-actions";
import { driverBottomNav } from "@/components/ui/nav-config";
import { requireDriver } from "@/lib/auth";

export const metadata: Metadata = { title: "Pengemudi | School Bus" };
export const dynamic = "force-dynamic";

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const access = await requireDriver();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const name = access.driver.full_name || access.viewer.profile?.full_name || "Pengemudi";

  return (
    <div className="driver-app">
      <header className="driver-head">
        <BrandLogo href="/pengemudi" subtitle="Area Pengemudi" size="sm" />
        <span>{name}</span>
        <LocaleSwitcher compact />
        <form action={signOutAction}><button className="btn btn-ghost btn-sm" type="submit"><LocalizedText k="signOut" /></button></form>
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
