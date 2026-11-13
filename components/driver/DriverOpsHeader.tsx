import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { signOutAction } from "@/lib/auth-actions";
import type { TripProgress } from "@/lib/driver/trip-progress";

/** Dua baris operasional; detail sekunder di profil, sumber progres dan CTA tetap. */
export function DriverOpsHeader({
  driverName,
  driverId,
  routeName,
  schoolName,
  direction,
  serviceDate,
  tripStatus,
  startedAt,
  arrivedAt,
  completedAt,
  fleetCode,
  plateNumber,
  capacity,
  progress,
  children,
  activeTab = "dashboard",
}: {
  driverName: string;
  driverId: string;
  routeName: string;
  schoolName: string;
  direction: string;
  serviceDate: string;
  tripStatus: string;
  startedAt: string | null;
  arrivedAt: string | null;
  completedAt: string | null;
  fleetCode: string;
  plateNumber: string | null;
  capacity: number;
  progress: TripProgress;
  children?: ReactNode;
  activeTab?: "dashboard" | "riwayat";
}) {
  const shortId = driverId.slice(0, 8).toUpperCase();
  const date = new Date(`${serviceDate}T12:00:00Z`);
  const shortDate = Number.isNaN(date.getTime()) ? serviceDate : new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "short", timeZone: "UTC",
  }).format(date);

  return (
    <section className="ops-head" aria-label="Profil pengemudi, tugas, dan progres perjalanan">
      {/* Baris 1: identitas brand, rute terpotong, dan profil. */}
      <div className="compact-identity-row">
        <BrandLogo href="/pengemudi" size="sm" />
        <h1 className="compact-route" title={`${routeName} • ${shortDate}`}>
          <span>{routeName || "Rute"}</span><time dateTime={serviceDate}> • {shortDate}</time>
        </h1>
        <div className="compact-driver-identity">
          <strong>{driverName || "Pengemudi"}</strong>
          <span>ID {shortId} • {plateNumber || "Plat belum tercatat"}</span>
        </div>
        <form action={signOutAction}><button className="btn btn-ghost btn-sm" type="submit">Keluar</button></form>
      </div>

      <nav className="portal-nav compact-driver-tabs" aria-label="Navigasi Pengemudi">
        <Link href="/pengemudi" aria-current={activeTab === "dashboard" ? "page" : undefined}>Data Pengemudi</Link>
        <Link href="/pengemudi?tab=riwayat" aria-current={activeTab === "riwayat" ? "page" : undefined}>Riwayat</Link>
      </nav>
      {/* Baris 2: angka tetap berasal dari TripProgress; handler CTA tetap children. */}
      <div className="compact-action-row">
        <div className="compact-counters" aria-live="polite" aria-label={`Progres ${progress.kindLabel.toLowerCase()}`}>
          <span className="compact-counter">Total: <b>{progress.total}</b></span>
          <span className="compact-counter" aria-label={`${progress.doneLabel}: ${progress.done}`}>
            {progress.kind === "dropoff" ? "Diantar" : "Dijemput"}: <b>{progress.done}</b>
          </span>
          <span className="compact-counter" aria-label={`${progress.waitingLabel}: ${progress.waiting}`}>Sisa: <b>{progress.waiting}</b></span>
          <span className="compact-counter compact-onboard">Di Bus: <b>{progress.onboard}</b></span>
        </div>
        {children && <div className="ops-head-action">{children}</div>}
      </div>
    </section>
  );
}
