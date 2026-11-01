import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, Notice, Pill } from "@/components/admin/ui";
import { requireGuardian } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { loadChildTrips, loadChildren } from "@/lib/guardian/data";
import { formatDate, formatTime, routeDirectionLabel, tripStatusLabel } from "@/lib/validation";

export const metadata: Metadata = { title: "Riwayat Perjalanan | Portal Wali" };

function tripTone(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "in_progress") return "info" as const;
  if (status === "cancelled") return "danger" as const;
  return "neutral" as const;
}

export default async function GuardianHistoryPage() {
  const access = await requireGuardian();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const supabase = await createServerSupabase();
  if (!supabase) return <ConfigNotice />;

  const children = await loadChildren(supabase);
  const grouped = await Promise.all(
    children.map(async (child) => ({
      child,
      trips: await loadChildTrips(
        supabase,
        child.placements.map((placement) => placement.routeId),
        5,
      ),
    })),
  );

  const rows = grouped
    .flatMap((entry) => entry.trips.map((trip) => ({ child: entry.child, trip })))
    .sort((a, b) => (a.trip.serviceDate < b.trip.serviceDate ? 1 : -1))
    .slice(0, 30);

  return (
    <>
      <section className="guardian-hero">
        <div>
          <p className="eyebrow">RIWAYAT</p>
          <h1>Riwayat perjalanan anak</h1>
          <p>
            Hanya perjalanan pada rute anak Anda yang terhubung dengan akun ini. Riwayat tidak dapat diubah atau
            dihapus dari portal.
          </p>
        </div>
      </section>

      {children.length === 0 && (
        <Notice kind="info">Belum ada anak aktif yang terhubung dengan akun ini.</Notice>
      )}

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Perjalanan terbaru</h2>
            <div className="panel-subtitle">Maksimal 5 perjalanan terakhir per anak</div>
          </div>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Tanggal</th>
                <th scope="col">Anak</th>
                <th scope="col">Rute</th>
                <th scope="col">Status</th>
                <th scope="col">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="table-empty">
                      <strong>Belum ada riwayat perjalanan</strong>
                      <p>
                        Riwayat muncul setelah pengemudi memulai dan menyelesaikan perjalanan pada rute anak Anda.
                        Tidak ada data contoh yang ditampilkan.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map(({ child, trip }) => (
                  <tr key={`${child.student.id}-${trip.id}`}>
                    <td>{formatDate(trip.serviceDate)}</td>
                    <td>
                      <Link className="row-link" href={`/wali/anak/${child.student.id}`}>
                        {child.student.full_name}
                      </Link>
                    </td>
                    <td>
                      <strong>{trip.routeName}</strong>
                      <small>
                        {trip.schoolName} · {routeDirectionLabel(trip.direction)}
                      </small>
                    </td>
                    <td>
                      <Pill tone={tripTone(trip.status)}>{tripStatusLabel(trip.status)}</Pill>
                    </td>
                    <td>
                      <small>Mulai {formatTime(trip.startedAt)}</small>
                      <small>Tiba {formatTime(trip.arrivedAt)}</small>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Notice kind="info">
        Peta dan posisi bus langsung belum tersedia. Halaman riwayat hanya menampilkan waktu dan status yang benar-benar
        dicatat sistem.
      </Notice>
    </>
  );
}
