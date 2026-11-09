import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill, StatCard } from "@/components/admin/ui";
import { adminReadContext } from "@/lib/admin/read";
import type { AuditLogRow } from "@/lib/types";
import { formatDateTime, serviceDateInTimeZone } from "@/lib/validation";

export const metadata: Metadata = { title: "Laporan & Audit | Operator" };

export default async function ReportsPage() {
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const today = serviceDateInTimeZone();

  const [activeStudents, guardians, routes, assignmentsToday, completedTrips, audits] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }).eq("service_status", "active"),
    supabase.from("guardians").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("routes").select("id", { count: "exact", head: true }).eq("active", true),
    supabase
      .from("trip_assignments")
      .select("id", { count: "exact", head: true })
      .eq("service_date", today),
    supabase.from("trips").select("id", { count: "exact", head: true }).eq("status", "completed"),
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
        description="Ringkasan seluruh data operasional dan jejak aktivitas platform." actions={<Link className="btn btn-secondary btn-sm" href="/operator/laporan/export">Unduh CSV</Link>}
      />

      {audits.error && <Notice kind="error">Jejak audit belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>}

      <section className="stats" aria-label="Ringkasan operasional">
        <StatCard
          label="Siswa layanan aktif"
          value={activeStudents.count ?? 0}
          note="Dasar akses portal wali"
          icon="students"
        />
        <StatCard label="Wali aktif" value={guardians.count ?? 0} note="Email wali terdaftar" icon="guardian" />
        <StatCard label="Rute aktif" value={routes.count ?? 0} note="Beserta titik jemput" icon="route" />
        <StatCard
          label="Penugasan hari ini"
          value={assignmentsToday.count ?? 0}
          note={`${completedTrips.count ?? 0} perjalanan selesai tercatat`}
          icon="assignment"
        />
      </section>

      <div className="admin-overview-grid">
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Status modul</h2>
              <div className="panel-subtitle">Fitur yang belum tersedia tidak ditampilkan sebagai tombol berjalan</div>
            </div>
            <Pill tone="warning">Terbatas</Pill>
          </header>
          <ul className="check-list">
            <li>
              <strong>Data induk &amp; akun wali</strong>
              <span>✓</span>
              <small>Perubahan mengikuti hak akses akun. Riwayat status tetap tersimpan.</small>
            </li>
            <li>
              <strong>Rute, penugasan, perjalanan</strong>
              <span>✓</span>
              <small>Rute dan penugasan dikelola Operator Utama; perjalanan dijalankan pengemudi yang ditugaskan.</small>
            </li>
            <li>
              <strong>GPS langsung &amp; kamera bus</strong>
              <span>—</span>
              <small>
                GPS dan kamera bus belum terintegrasi. Siaran kamera perjalanan mengikuti status dan izin pengemudi,
                bukan laporan yang dibuat-buat.
              </small>
            </li>
            <li>
              <strong>Ekspor laporan</strong>
              <span>✓</span>
              <small>Tersedia dalam format CSV untuk seluruh data perjalanan yang dapat diakses Operator.</small>
            </li>
          </ul>
        </section>

        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Prinsip audit</h2>
              <div className="panel-subtitle">Dicatat otomatis saat ada perubahan</div>
            </div>
          </header>
          <div className="audit-note">
            <p>
              Audit mencatat aktor, jenis data, operasi, dan waktu. Nilai kolom serta data pribadi tidak disalin ke
              jejak audit agar data pribadi tidak menumpuk di luar tabel asalnya.
            </p>
            <p>
              Jejak audit platform dapat dibaca dan ditinjau oleh Operator Utama. Data perusahaan dan wilayah hanya menjadi pengelompokan untuk pemetaan serta audit, bukan pembatas akses.
            </p>
          </div>
        </section>
      </div>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Jejak audit terbaru</h2>
            <div className="panel-subtitle">60 catatan terakhir</div>
          </div>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table table-stack">
            <thead>
              <tr>
                <th scope="col">Waktu</th>
                <th scope="col">Aktor</th>
                <th scope="col">Operasi</th>
                <th scope="col">Ringkasan</th>
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
