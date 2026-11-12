import type { ReactNode } from "react";
import Link from "next/link";
import { TripStatusPill } from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";
import type { TripProgress } from "@/lib/driver/trip-progress";
import { formatDate, formatTime, routeDirectionLabel } from "@/lib/validation";

/**
 * Header ringkas halaman operasional pengemudi.
 *
 * Profil, kendaraan, waktu, arah perjalanan, dan papan progres berada pada satu
 * blok agar pengemudi tidak perlu menghitung status siswa sendiri. Papan progres
 * memakai hasil turunan yang sama dengan jumlah siswa di kendaraan dan next stop.
 */
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
  const initial = (driverName || "P").slice(0, 1).toUpperCase();
  const shortId = driverId.slice(0, 8).toUpperCase();
  const kind = direction === "afternoon" ? "Pengantaran" : "Penjemputan";
  const started = startedAt ? `Mulai ${formatTime(startedAt)}` : "Belum dimulai";
  const ended = completedAt ? ` · Selesai ${formatTime(completedAt)}` : arrivedAt ? ` · Tiba ${formatTime(arrivedAt)}` : "";

  return (
    <section className="ops-head" aria-label="Profil pengemudi, tugas, dan progres perjalanan">
      <div className="ops-head-top">
        <span className="ops-avatar" aria-hidden="true">
          {initial}
        </span>
        <div className="ops-ident" title={`ID ${shortId}`}>
          <strong>{driverName || "Pengemudi"}</strong>
          <small>
            ID {shortId} · {fleetCode || "Bus belum ditetapkan"}
          </small>
        </div>
        <div className="ops-head-pills">
          <TripStatusPill status={tripStatus} />
        </div>
        <nav className="driver-tabs" aria-label="Navigasi Pengemudi">
          <Link href="/pengemudi" aria-current={activeTab === "dashboard" ? "page" : undefined}>Dashboard</Link>
          <Link href="/pengemudi?tab=riwayat" aria-current={activeTab === "riwayat" ? "page" : undefined}>Riwayat</Link>
        </nav>
      </div>

      <div className="ops-task-row">
        <div className="ops-task-copy">
          <span className="ops-task-kicker">
            {routeDirectionLabel(direction)} · {kind} · {formatDate(serviceDate)}
          </span>
          <h1>{routeName || "Rute"}</h1>
          <small title={schoolName || "Sekolah belum tercatat"}>
            <Icon name="school" size={12} />
            {schoolName || "Sekolah belum tercatat"}
          </small>
        </div>
        {children && <div className="ops-head-action">{children}</div>}
      </div>

      <div className="ops-progress" aria-live="polite" aria-label={`Progres ${progress.kindLabel.toLowerCase()}`}>
        <div className="ops-progress-grid">
          <div className="ops-progress-cell tone-total">
            <span>Total</span>
            <strong>{progress.total}</strong>
          </div>
          <div className="ops-progress-cell tone-done">
            <span>{progress.doneLabel}</span>
            <strong>{progress.done}</strong>
          </div>
          <div className="ops-progress-cell tone-waiting">
            <span>{progress.waitingLabel}</span>
            <strong>{progress.waiting}</strong>
          </div>
          <div className="ops-progress-cell tone-onboard">
            <span>Di kendaraan</span>
            <strong>{progress.onboard}</strong>
          </div>
        </div>
        <div
          className="ops-progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percent}
          aria-label={`${progress.processed} dari ${progress.total} siswa sudah diproses`}
        >
          <span style={{ width: `${progress.percent}%` }} />
        </div>
        <p className="ops-progress-line">
          <span>
            <b>{progress.processed}</b>/{progress.total} diproses
          </span>
          <span>
            <b>{progress.needsAction}</b> perlu tindakan
          </span>
          <span className="ops-progress-skip">
            <b>{progress.absent}</b> tidak ikut
            {progress.absent > 0 && (
              <> · {progress.noShow} tidak hadir · {progress.notRiding} tidak ikut bus</>
            )}
          </span>
        </p>
      </div>

      <p className="ops-meta-line">
        <span>
          <Icon name="bus" size={12} />
          {plateNumber || "Plat belum tercatat"} · {capacity} kursi
        </span>
        <span>
          <Icon name="clock" size={12} />
          {started}
          {ended}
        </span>
      </p>
    </section>
  );
}
