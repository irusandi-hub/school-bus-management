import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { requireGuardian } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";
import { createServerSupabase } from "@/lib/supabase/server";
import type { StudentRow } from "@/lib/types";
import { serviceStatusLabel } from "@/lib/validation";

export const metadata: Metadata = { title: "Portal Wali | School Bus" };

export const dynamic = "force-dynamic";

const selectColumns = "id, admissions_number, full_name, service_status, schools(name)";

export default async function WaliPage() {
  const access = await requireGuardian();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const supabase = await createServerSupabase();
  if (!supabase) return <ConfigNotice />;

  // Row level security returns only this guardian's students that still have an active
  // service status; no client-side filtering is used to hide other students.
  const { data, error } = await supabase.from("students").select(selectColumns).order("full_name", { ascending: true });
  const students = (data ?? []) as unknown as StudentRow[];

  const name = access.viewer.profile?.full_name || access.viewer.email || "Wali";

  return (
    <main className="portal-shell">
      <header className="portal-head">
        <Link className="brand" href="/wali">
          <div className="brand-mark">S</div>
          <div>
            <div className="brand-name">School Bus</div>
            <div className="brand-sub">Portal Wali</div>
          </div>
        </Link>
        <div className="portal-account">
          <span>{name}</span>
          <form action={signOutAction}>
            <button className="btn btn-ghost" type="submit">
              Keluar
            </button>
          </form>
        </div>
      </header>

      <PageHeader
        title="Anak saya"
        description="Daftar ini hanya memuat siswa yang terhubung dengan akun Anda dan masih memiliki layanan aktif."
      />

      {error && <Notice kind="error">Data siswa belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>}

      {students.length === 0 ? (
        <section className="panel access-panel">
          <h2>Layanan belum aktif untuk akun ini</h2>
          <p>
            Tidak ada siswa dengan status layanan aktif yang terhubung dengan akun Anda. Akses layanan tidak dibuka
            sampai minimal satu siswa berstatus aktif. Hubungi Admin Pusat untuk memeriksa status layanan siswa Anda.
          </p>
          <form action={signOutAction}>
            <button className="btn btn-secondary" type="submit">
              Keluar dari akun
            </button>
          </form>
        </section>
      ) : (
        <section className="student-card-grid" aria-label="Daftar anak">
          {students.map((student) => (
            <article className="student-card" key={student.id}>
              <div className="student-card-top">
                <span className="student-avatar" aria-hidden="true">
                  {student.full_name.slice(0, 1).toUpperCase()}
                </span>
                <Pill tone={student.service_status === "active" ? "success" : "warning"}>
                  {serviceStatusLabel(student.service_status)}
                </Pill>
              </div>
              <h2>{student.full_name}</h2>
              <p>Admissions Number {student.admissions_number}</p>
              <dl>
                <div>
                  <dt>Sekolah</dt>
                  <dd>{student.schools?.name ?? "Belum ditetapkan"}</dd>
                </div>
              </dl>
              <div className="student-card-note">
                Status perjalanan dan lokasi bus belum tersedia pada tahap ini. Tidak ada data perjalanan yang
                ditampilkan agar tidak menyesatkan.
              </div>
            </article>
          ))}
        </section>
      )}

      <Notice kind="info">
        Pemilihan peran tidak mengubah hak akses. Akses akun ini ditentukan dari relasi wali dan status layanan siswa di
        database.
      </Notice>

      <footer className="page-footer">
        <span>School Bus Management</span>
        <span>Modul perjalanan &amp; GPS belum aktif</span>
      </footer>
    </main>
  );
}
