import type { ReactNode } from "react";
import { TripStatusPill } from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";
import { formatDate, formatTime, routeDirectionLabel } from "@/lib/validation";

/**
 * Header ringkas halaman operasional pengemudi.
 *
 * Identitas, kendaraan, jadwal, siswa, dan tugas tetap tersedia sebagai label
 * sekunder. Area ini sengaja tidak memakai kartu metrik besar agar navigasi dan
 * tindakan siswa menjadi pusat layar.
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
  totalStudents,
  onboardStudents,
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
  totalStudents: number;
  onboardStudents: number;
  children?: ReactNode;
}) {
  const initial = (driverName || "P").slice(0, 1).toUpperCase();
  const shortId = driverId.slice(0, 8).toUpperCase();
  const kind = direction === "afternoon" ? "Pengantaran" : "Penjemputan";
  const started = startedAt ? `Mulai ${formatTime(startedAt)}` : "Belum dimulai";
  const ended = completedAt ? ` · Selesai ${formatTime(completedAt)}` : arrivedAt ? ` · Tiba ${formatTime(arrivedAt)}` : "";

  return (
    <section className="ops-head" aria-label="Profil pengemudi dan tugas hari ini">
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
          <span className="ops-head-count" title="Siswa di kendaraan dibanding total siswa pada rute">
            <Icon name="users" size={13} />
            {onboardStudents}/{totalStudents}
          </span>
        </div>
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
