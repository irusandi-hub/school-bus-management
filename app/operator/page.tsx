import Link from "next/link";
import type { Metadata } from "next";
import {
  ConfigNotice,
  EmptyRow,
  Notice,
  PageHeader,
  Pill,
  StatCard,
  TripStatusPill,
} from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";
import { operatorGroups, operatorBottomNav } from "@/components/ui/nav-config";
import { requireOperator } from "@/lib/auth";
import { operatorReadContext } from "@/lib/operator/read";
import type { TripAssignmentRow } from "@/lib/types";
import { formatDate, routeDirectionLabel } from "@/lib/validation";

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
        title="Ringkasan"
        description={`Data di halaman ini hanya milik ${access.operator.name}.`}
        actions={
          <Link className="btn btn-primary" href="/operator/operasional">
            <Icon name="clock" size={16} />
            Buka pusat operasi
          </Link>
        }
      />

      <nav className="operator-extra-links" aria-label="Menu operator lainnya">
        {operatorGroups.flatMap((group) => group.items).filter((item) => !operatorBottomNav.some((bottom) => bottom.href === item.href)).map((item) => (
          <Link key={item.href} href={item.href}><Icon name={item.icon} size={16} />{item.label}</Link>
        ))}
      </nav>

      {todayAssignments.error && (
        <Notice kind="error">Penugasan hari ini belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>
      )}

      <section className="stats" aria-label="Ringkasan organisasi">
        <StatCard label="Bus aktif" value={buses.count ?? 0} note="Armada organisasi Anda" icon="bus" />
        <StatCard label="Pengemudi aktif" value={drivers.count ?? 0} note="Staf yang dapat ditugaskan" icon="users" />
        <StatCard
          label="Siswa aktif"
          value={students.count ?? 0}
          note="Dari sekolah yang ditautkan ke organisasi"
          icon="students"
        />
        <StatCard
          label="Tugas hari ini"
          value={assignmentsToday.count ?? 0}
          note={`${activeTrips.count ?? 0} perjalanan berlangsung`}
          icon="assignment"
          tone={activeTrips.count ? "live" : "default"}
        />
      </section>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Penugasan hari ini</h2>
            <div className="panel-subtitle">Hanya bus dan pengemudi organisasi Anda</div>
          </div>
          <div className="panel-head-actions">
            <Pill tone="info">{formatDate(today())}</Pill>
          </div>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table table-stack">
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
                      <td data-label="Rute">
                        <strong>{row.routes?.route_name ?? "Rute"}</strong>
                        <small>
                          {row.routes?.school_name} · {routeDirectionLabel(row.routes?.direction ?? "")}
                        </small>
                      </td>
                      <td data-label="Pengemudi">{row.drivers?.full_name ?? "—"}</td>
                      <td data-label="Bus">{row.buses?.fleet_code ?? "—"}</td>
                      <td data-label="Status">
                        <TripStatusPill status={trip?.status} />
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
          <span aria-hidden="true"><Icon name="bus" /></span>
          <strong>Kelola armada</strong>
          <small>Tambah bus dan atur kapasitas</small>
        </Link>
        <Link className="quick-tile" href="/operator/pengemudi">
          <span aria-hidden="true"><Icon name="driver" /></span>
          <strong>Kelola pengemudi</strong>
          <small>Data staf organisasi Anda</small>
        </Link>
        <Link className="quick-tile" href="/operator/penugasan">
          <span aria-hidden="true"><Icon name="assignment" /></span>
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
