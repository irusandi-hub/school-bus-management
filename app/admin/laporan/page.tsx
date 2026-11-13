import Link from "next/link";
import { AdminCopy } from "@/components/i18n/AdminCopy";
import type { Metadata } from "next";
import { ConfigNotice, EmptyRow, MetricStrip, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { ProjectAreaTabs } from "@/components/admin/ProjectAreaTabs";
import { adminReadContext } from "@/lib/admin/read";
import { getProjectAreaContext, loadProjectAreaScope } from "@/lib/project-areas/context";
import type { AuditLogRow } from "@/lib/types";
import { formatDateTime, serviceDateInTimeZone } from "@/lib/validation";

export const metadata: Metadata = { title: "Laporan & Audit | Operator" };

export default async function ReportsPage() {
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const today = serviceDateInTimeZone();
  const areaContext = await getProjectAreaContext(supabase);
  const scope = await loadProjectAreaScope(supabase, areaContext.selectedId);
  const selectedId = areaContext.selectedId;

  let assignmentIds: string[] = [];
  if (selectedId) {
    const { data: areaAssignments } = await supabase
      .from("trip_assignments")
      .select("id")
      .in("route_id", scope.routeIds);
    assignmentIds = ((areaAssignments ?? []) as { id: string }[]).map((row) => row.id);
  }

  let studentsQuery = supabase.from("students").select("id", { count: "exact", head: true }).eq("service_status", "active");
  if (selectedId) studentsQuery = studentsQuery.in("school_id", scope.schoolIds);

  let guardiansQuery = supabase.from("guardians").select("id", { count: "exact", head: true }).eq("active", true);
  if (selectedId) guardiansQuery = guardiansQuery.in("id", scope.guardianIds);

  let routesQuery = supabase.from("routes").select("id", { count: "exact", head: true }).eq("active", true);
  if (selectedId) routesQuery = routesQuery.eq("project_area_id", selectedId);

  let assignmentsQuery = supabase
    .from("trip_assignments")
    .select("id", { count: "exact", head: true })
    .eq("service_date", today);
  if (selectedId) assignmentsQuery = assignmentsQuery.in("route_id", scope.routeIds);

  let completedQuery = supabase.from("trips").select("id", { count: "exact", head: true }).eq("status", "completed");
  if (selectedId) completedQuery = completedQuery.in("assignment_id", assignmentIds);

  const [activeStudents, guardians, routes, assignmentsToday, completedTrips, audits] = await Promise.all([
    studentsQuery,
    guardiansQuery,
    routesQuery,
    assignmentsQuery,
    completedQuery,
    supabase
      .from("audit_logs")
      .select("id, actor_profile_id, action, entity_type, entity_id, summary, created_at, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(60),
  ]);

  const logs = (audits.data ?? []) as unknown as (AuditLogRow & { profiles: { full_name: string } | null })[];

  return (
    <>
      <PageHeader
        title="Laporan & audit"
        description={`Ringkasan data operasional dan jejak aktivitas platform. Konteks: ${areaContext.selected?.name ?? "Semua Area"}.`}
        actions={<Link className="btn btn-secondary btn-sm" href="/operator/laporan/export"><AdminCopy value="Unduh CSV" /></Link>}
      />

      <ProjectAreaTabs areas={areaContext.activeAreas} selectedId={selectedId} nextPath="/admin/laporan" compact />

      {audits.error && <Notice kind="error">Jejak audit belum dapat dimuat. Coba lagi.</Notice>}

      <MetricStrip
        label="Ringkasan operasional"
        items={[
          { label: "Siswa aktif", value: activeStudents.count ?? 0, note: "Layanan berjalan", icon: "students" },
          { label: "Wali aktif", value: guardians.count ?? 0, note: "Akun terdaftar", icon: "guardian" },
          { label: "Rute aktif", value: routes.count ?? 0, note: "Dengan titik jemput", icon: "route" },
          {
            label: "Penugasan hari ini",
            value: assignmentsToday.count ?? 0,
            note: `${completedTrips.count ?? 0} selesai`,
            icon: "assignment",
          },
        ]}
      />

      <div className="admin-overview-grid">
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title"><AdminCopy value="Status modul" /></h2>
              <div className="panel-subtitle"><AdminCopy value="Fitur yang belum tersedia tidak ditampilkan sebagai tombol berjalan" /></div>
            </div>
            <Pill tone="warning">Terbatas</Pill>
          </header>
          <ul className="check-list">
            <li>
              <strong><AdminCopy value="Data induk & akun wali" /></strong>
              <span>✓</span>
              <small><AdminCopy value="Perubahan mengikuti hak akses akun. Riwayat status tetap tersimpan." /></small>
            </li>
            <li>
              <strong><AdminCopy value="Rute, penugasan, perjalanan" /></strong>
              <span>✓</span>
              <small><AdminCopy value="Rute dan penugasan dikelola Operator Utama; perjalanan dijalankan pengemudi yang ditugaskan." /></small>
            </li>
            <li>
              <strong><AdminCopy value="GPS langsung & kamera bus" /></strong>
              <span>—</span>
              <small>
                GPS dan kamera bus belum terintegrasi. Siaran kamera perjalanan mengikuti status dan izin pengemudi,
                bukan laporan yang dibuat-buat.
              </small>
            </li>
            <li>
              <strong><AdminCopy value="Ekspor laporan" /></strong>
              <span>✓</span>
              <small><AdminCopy value="Tersedia dalam format CSV untuk seluruh data perjalanan yang dapat diakses Operator." /></small>
            </li>
          </ul>
        </section>

        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title"><AdminCopy value="Prinsip audit" /></h2>
              <div className="panel-subtitle"><AdminCopy value="Dicatat otomatis saat ada perubahan" /></div>
            </div>
          </header>
          <div className="audit-note">
            <p>
              Audit mencatat aktor, jenis data, operasi, dan waktu. Nilai kolom serta data pribadi tidak disalin ke
              jejak audit agar data pribadi tidak menumpuk di luar tabel asalnya.
            </p>
            <p>
              Jejak audit platform dapat dibaca dan ditinjau oleh Operator Utama. Area Operasional hanya menjadi konteks kerja dan pengelompokan untuk pemetaan serta audit, bukan akun atau pembatas akses.
            </p>
          </div>
        </section>
      </div>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title"><AdminCopy value="Jejak audit terbaru" /></h2>
            <div className="panel-subtitle"><AdminCopy value="60 catatan terakhir · audit platform tidak difilter per area" /></div>
          </div>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table table-stack">
            <thead>
              <tr>
                <th scope="col"><AdminCopy value="Waktu" /></th>
                <th scope="col"><AdminCopy value="Aktor" /></th>
                <th scope="col"><AdminCopy value="Operasi" /></th>
                <th scope="col"><AdminCopy value="Ringkasan" /></th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <EmptyRow
                  colSpan={4}
                  title="Belum ada catatan audit"
                  detail="Catatan audit akan muncul otomatis setelah data ditambahkan atau diubah."
                />
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td data-label="Waktu">{formatDateTime(log.created_at)}</td>
                    <td data-label="Aktor">{log.profiles?.full_name ?? "Sistem"}</td>
                    <td data-label="Operasi">
                      <code>{log.action}</code>
                    </td>
                    <td data-label="Ringkasan">{log.summary}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
