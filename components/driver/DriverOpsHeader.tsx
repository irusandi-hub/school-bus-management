import type { ReactNode } from "react";
import { TripStatusPill } from "@/components/admin/ui";
import { formatDate, formatTime, routeDirectionLabel } from "@/lib/validation";

/**
 * Header ringkas halaman operasional pengemudi.
 *
 * Profil, kendaraan, jadwal, dan hitungan siswa dibuat dalam dua tingkat agar
 * tetap terbaca pada ponsel tanpa memenuhi layar sebelum tombol navigasi.
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
        <div className="ops-ident">
          <strong>{driverName || "Pengemudi"}</strong>
          <small>
            ID {shortId} · Akun aktif
          </small>
        </div>
        <TripStatusPill status={tripStatus} />
      </div>

      <dl className="ops-meta">
        <div>
          <dt>Kendaraan</dt>
          <dd>{fleetCode || "Belum ditetapkan"}</dd>
          <small>
            {plateNumber || "Plat belum tercatat"} · {capacity} kursi
          </small>
        </div>
        <div>
          <dt>Jadwal</dt>
          <dd>{formatDate(serviceDate)}</dd>
          <small>
            {routeDirectionLabel(direction)} · {kind} · {started}
            {ended}
          </small>
        </div>
        <div>
          <dt>Siswa di kendaraan</dt>
          <dd>
            {onboardStudents} / {totalStudents}
          </dd>
          <small>Diperbarui setiap status siswa dicatat</small>
        </div>
        <div>
          <dt>Tugas</dt>
          <dd>{routeName || "Rute"}</dd>
          <small>{schoolName || "Sekolah belum tercatat"}</small>
        </div>
      </dl>

      {children && <div className="ops-head-action">{children}</div>}
    </section>
  );
}
