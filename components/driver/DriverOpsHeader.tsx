import type { ReactNode } from "react";
import { TripStatusPill } from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";
import type { TripProgress } from "@/lib/driver/trip-progress";
import { formatDate, formatTime, routeDirectionLabel } from "@/lib/validation";

/**
 * Header operasional pengemudi.
 *
 * Identitas, bus, jadwal, sekolah, jenis perjalanan, dan progres digabung dalam
 * satu blok. Satu area aksi di kanan (desktop) atau di bawah ringkasan (ponsel)
 * menjadi satu-satunya tempat tombol utama perjalanan berada.
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
}) {
  const initial = (driverName || "P").slice(0, 1).toUpperCase();
  const shortId = driverId.slice(0, 8).toUpperCase();
  const started = startedAt ? `Mulai ${formatTime(startedAt)}` : "Belum dimulai";
  const ended = completedAt ? ` · Selesai ${formatTime(completedAt)}` : arrivedAt ? ` · Tiba ${formatTime(arrivedAt)}` : "";

  return (
    <section className="ops-head drive-hero" aria-label="Tugas dan aksi perjalanan">
      <div className="drive-hero-top">
        <span className="ops-avatar" aria-hidden="true">
          {initial}
        </span>
        <div className="ops-ident" title={`ID ${shortId}`}>
          <strong>{driverName || "Pengemudi"}</strong>
          <small>ID {shortId} · Akun pengemudi</small>
        </div>
        <div className="ops-head-pills">
          <TripStatusPill status={tripStatus} />
        </div>
      </div>

      <div className="drive-hero-main">
        <div className="drive-task">
          <span className="ops-task-kicker">
            {routeDirectionLabel(direction)} · {progress.kindLabel} · {formatDate(serviceDate)}
          </span>
          <h1>{routeName || "Rute"}</h1>
          <p className="drive-school" title={schoolName || "Sekolah belum tercatat"}>
            <Icon name="school" size={13} />
            {schoolName || "Sekolah belum tercatat"}
          </p>
        </div>
        {children && <div className="ops-head-action">{children}</div>}
      </div>

      <p className="drive-vehicle">
        <span>
          <Icon name="bus" size={13} />
          {fleetCode || "Bus belum ditetapkan"}
        </span>
        <span>{plateNumber || "Plat belum tercatat"}</span>
        <span>{capacity > 0 ? `${capacity} kursi` : "Kapasitas belum tercatat"}</span>
        <span className="drive-clock">
          <Icon name="clock" size={13} />
          {started}
          {ended}
        </span>
      </p>

      <div className="drive-progress" aria-live="polite" aria-label={`Progres ${progress.kindLabel.toLowerCase()}`}>
        <div className="drive-progress-line">
          <span>
            <b>
              {progress.processed}/{progress.total}
            </b>{" "}
            diproses
          </span>
          <span>
            <b>{progress.needsAction}</b> perlu tindakan
          </span>
          <span>
            <b>{progress.onboard}</b> di kendaraan
          </span>
          {progress.absent > 0 && (
            <span>
              <b>{progress.absent}</b> tidak ikut
            </span>
          )}
        </div>
        <div
          className="drive-progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percent}
          aria-label={`${progress.processed} dari ${progress.total} siswa sudah diproses`}
        >
          <span style={{ width: `${progress.percent}%` }} />
        </div>
      </div>
    </section>
  );
}
