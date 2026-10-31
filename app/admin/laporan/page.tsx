import type { Metadata } from "next";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { adminReadContext } from "@/lib/admin/read";
import type { AuditLogRow } from "@/lib/types";
import { formatDateTime } from "@/lib/validation";

export const metadata: Metadata = { title: "Laporan & Audit | Admin Pusat" };

export default async function ReportsPage() {
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const today = new Date().toISOString().slice(0, 10);

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
        description="Angka operasional diambil dari data nyata. Jejak audit ditulis otomatis oleh database dan tidak dapat diubah dari aplikasi."
      />

      {audits.error && <Notice kind="error">Jejak audit belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>}

      <section className="stats" aria-label="Ringkasan operasional">
        <article className="stat-card">
          <div className="stat-top">
            <span>Siswa layanan aktif</span>
            <span className="stat-icon">♧</span>
          </div>
          <div className="stat-value">{activeStudents.count ?? 0}</div>
          <div className="stat-note">Dasar akses portal wali</div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Wali aktif</span>
            <span className="stat-icon">☎</span>
          </div>
          <div className="stat-value">{guardians.count ?? 0}</div>
          <div className="stat-note">Email wali terdaftar</div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Rute aktif</span>
            <span className="stat-icon">⇢</span>
          </div>
          <div className="stat-value">{routes.count ?? 0}</div>
          <div className="stat-note">Beserta titik jemput</div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <span>Penugasan hari ini</span>
            <span className="stat-icon">☑</span>
          </div>
          <div className="stat-value">{assignmentsToday.count ?? 0}</div>
          <div className="stat-note">{completedTrips.count ?? 0} perjalanan selesai tercatat</div>
        </article>
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
              <small>CRUD berjalan dengan RLS per peran dan riwayat status append-only.</small>
            </li>
            <li>
              <strong>Rute, penugasan, perjalanan</strong>
              <span>✓</span>
              <small>Rute dan penugasan dikelola Admin; perjalanan dijalankan pengemudi yang ditugaskan.</small>
            </li>
            <li>
              <strong>GPS langsung &amp; kamera</strong>
              <span>—</span>
              <small>Belum terintegrasi. Tidak ada lokasi atau tautan kamera yang dibuat-buat.</small>
            </li>
            <li>
              <strong>Ekspor laporan</strong>
              <span>—</span>
              <small>Belum tersedia; laporan saat ini ditampilkan di layar dan mengikuti kebijakan akses database.</small>
            </li>
          </ul>
        </section>

        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Prinsip audit</h2>
              <div className="panel-subtitle">Ditulis oleh trigger database</div>
            </div>
          </header>
          <div className="audit-note">
            <p>
              Audit mencatat aktor, jenis data, operasi, dan waktu. Nilai kolom serta data pribadi tidak disalin ke
              jejak audit agar data pribadi tidak menumpuk di luar tabel asalnya.
            </p>
            <p>
              Jejak audit hanya dapat dibaca Admin Pusat. Operator tidak memiliki akses ke jejak audit platform;
              laporan operator dibatasi pada data organisasinya.
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
          <table className="admin-table">
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
                    <td>{formatDateTime(log.created_at)}</td>
                    <td>{log.profiles?.full_name ?? "Sistem"}</td>
                    <td>
                      <code>{log.action}</code>
                    </td>
                    <td>{log.summary}</td>
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
