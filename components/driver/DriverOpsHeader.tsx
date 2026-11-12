import type { ReactNode } from "react";
import Link from "next/link";
import { TripStatusPill } from "@/components/admin/ui";
import { BrandLogo } from "@/components/brand-logo";
import { DriverProfileMenu } from "./DriverProfileMenu";
import type { TripProgress } from "@/lib/driver/trip-progress";
import { formatTime, routeDirectionLabel } from "@/lib/validation";

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
  const started = startedAt ? `Mulai ${formatTime(startedAt)}` : "Belum dimulai";
  const ended = completedAt ? ` · Selesai ${formatTime(completedAt)}` : arrivedAt ? ` · Tiba ${formatTime(arrivedAt)}` : "";

  return (
    <section className="ops-head" aria-label="Profil pengemudi, tugas, dan progres perjalanan">
      {/* Baris 1: identitas brand, rute terpotong, dan profil. */}
      <div className="compact-identity-row">
        <BrandLogo href="/pengemudi" size="sm" />
        <h1 className="compact-route" title={`${routeName} • ${shortDate}`}>
          <span>{routeName || "Rute"}</span><time dateTime={serviceDate}> • {shortDate}</time>
        </h1>
        <DriverProfileMenu name={driverName}>
          <p>ID {shortId} • {fleetCode || "Bus belum ditetapkan"}</p>
          <p>{plateNumber || "Plat belum tercatat"} • {capacity} kursi</p>
          <p>{schoolName || "Sekolah belum tercatat"} • {routeDirectionLabel(direction)}</p>
          <TripStatusPill status={tripStatus} />
          <p>{started}{ended}</p>
          <p>{progress.processed}/{progress.total} diproses • {progress.needsAction} perlu tindakan</p>
          <p>{progress.absent} tidak ikut • {progress.noShow} tidak hadir • {progress.notRiding} tidak ikut bus</p>
          <p>Di Bus: <b>{progress.onboard}</b></p>
          <nav className="driver-tabs" aria-label="Navigasi Pengemudi">
            <Link href="/pengemudi" aria-current={activeTab === "dashboard" ? "page" : undefined}>Dashboard</Link>
            <Link href="/pengemudi?tab=riwayat" aria-current={activeTab === "riwayat" ? "page" : undefined}>Riwayat</Link>
          </nav>
        </DriverProfileMenu>
      </div>

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
