import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { requireOperator } from "@/lib/auth";
import { operatorReadContext } from "@/lib/operator/read";
import type { TripAssignmentRow } from "@/lib/types";
import { formatDate, routeDirectionLabel, tripStatusLabel } from "@/lib/validation";

export const metadata: Metadata = { title: "Ringkasan Operator | School Bus" };

function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export default async function OperatorHomePage() {
  const access = await requireOperator();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const supabase = await operatorReadContext();
  if (!supabase) return <ConfigNotice />;

  const [buses, drivers, students, assignmentsToday, activeTrips, todayAssignments] = await Promise.all([
    supabase.from("buses").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("drivers").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("service_status", "active"),
    supabase
      .from("trip_assignments")
      .select("id", { count: "exact", head: true })
      .eq("service_date", today()),
    supabase.from("trips").select("id", { count: "exact", head: true }).eq("status", "in_progress"),
    supabase
      .from("trip_assignments")
      .select("id, service_date, routes(route_name, school_name, direction), buses(fleet_code), drivers(full_name), trips(id, status, started_at, completed_at, arrived_at)")
      .eq("service_date", today())
      .order("service_date", { ascending: true }),
  ]);

  const rows = (todayAssignments.data ?? []) as unknown as TripAssignmentRow[];

  return (
    <>
      <PageHeader
        title={`Ringkasan ${access.operator.name}`}
        description="Semua angka dan daftar di halaman ini dibatasi oleh kebijakan database ke organisasi Anda. Data organisasi lain tidak dapat dibaca dari area ini."
      />

      {todayAssignments.error && (
        <Notice kind="error">Penugasan hari ini belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>
      )}

      <section className="stats" aria-label="Ringkasan organisasi">
        <article className="stat-card">
          <div className="stat-top">
            <span>Bus aktif</span>
            <span className="stat-icon">▰</span>
          </div>
          <div className="stat-value">{buses.count ?? 0}</div>
          <div className="stat-note">Armada organisasi Anda</div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Pengemudi aktif</span>
            <span className="stat-icon">◍</span>
          </div>
          <div className="stat-value">{drivers.count ?? 0}</div>
          <div className="stat-note">Staf yang dapat ditugaskan</div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Siswa aktif</span>
            <span className="stat-icon">♧</span>
          </div>
          <div className="stat-value">{students.count ?? 0}</div>
          <div className="stat-note">Dari sekolah yang ditautkan ke organisasi</div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Tugas hari ini</span>
            <span className="stat-icon">☑</span>
          </div>
          <div className="stat-value">{assignmentsToday.count ?? 0}</div>
          <div className="stat-note">{activeTrips.count ?? 0} perjalanan berlangsung</div>
        </article>
      </section>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Penugasan hari ini</h2>
            <div className="panel-subtitle">Hanya bus dan pengemudi organisasi Anda</div>
          </div>
          <Pill tone="info">{formatDate(today())}</Pill>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Rute</th>
                <th scope="col">Pengemudi</th>
                <th scope="col">Bus</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <EmptyRow
                  colSpan={4}
                  title="Belum ada penugasan hari ini"
                  detail="Buat penugasan melalui menu Penugasan. Pengemudi hanya melihat tugas yang benar-benar dibuat."
                />
              ) : (
                rows.map((row) => {
                  const trip = row.trips?.[0];
                  return (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.routes?.route_name ?? "Rute"}</strong>
                        <small>
                          {row.routes?.school_name} · {routeDirectionLabel(row.routes?.direction ?? "")}
                        </small>
                      </td>
                      <td>{row.drivers?.full_name ?? "—"}</td>
                      <td>{row.buses?.fleet_code ?? "—"}</td>
                      <td>
                        <Pill tone={trip?.status === "in_progress" ? "info" : trip?.status === "completed" ? "success" : "neutral"}>
                          {trip ? tripStatusLabel(trip.status) : "Belum dimulai"}
                        </Pill>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="quick-grid">
        <Link className="quick-tile" href="/operator/bus">
          <span aria-hidden="true">▰</span>
          <strong>Kelola armada</strong>
          <small>Tambah bus dan atur kapasitas</small>
        </Link>
        <Link className="quick-tile" href="/operator/pengemudi">
          <span aria-hidden="true">◍</span>
          <strong>Kelola pengemudi</strong>
          <small>Data staf organisasi Anda</small>
        </Link>
        <Link className="quick-tile" href="/operator/penugasan">
          <span aria-hidden="true">☑</span>
          <strong>Buat penugasan</strong>
          <small>Rute, pengemudi, dan bus</small>
        </Link>
      </div>

      <Notice kind="info">
        Rute dan data induk sekolah dikelola Admin Pusat dan hanya dapat dibaca di sini. Jejak audit platform, akun
        wali, serta data organisasi lain tidak tersedia untuk peran operator.
      </Notice>
    </>
  );
}
