import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, EmptyState, Notice, PageHeader, ServiceStatusPill } from "@/components/admin/ui";
import { operatorReadContext } from "@/lib/operator/read";
import { requireOperator } from "@/lib/auth";
import type { StudentRow } from "@/lib/types";
import { studentReadFilters } from "./read-filters";

export const metadata: Metadata = { title: "Siswa | Pengelola" };

export default async function OperatorStudentsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const access = await requireOperator();
  if (access.status === "unconfigured") return <ConfigNotice />;
  const supabase = await operatorReadContext();
  if (!supabase) return <ConfigNotice />;
  const filters = studentReadFilters(await searchParams);
  const { data: schoolRows, error: schoolError } = await supabase.from("schools").select("id, name").eq("operator_id", access.operator.id).order("name", { ascending: true });
  const schools = (schoolRows ?? []) as { id: string; name: string }[];
  let query = supabase.from("students").select("id, admissions_number, full_name, service_status, school_id, schools(name), guardians(full_name)").in("school_id", schools.map((school) => school.id));
  if (filters.q) query = query.ilike("full_name", `%${filters.q}%`);
  if (filters.status === "active") query = query.eq("service_status", "active");
  if (filters.status === "inactive") query = query.in("service_status", ["paused", "ended"]);
  if (filters.school) query = query.eq("school_id", filters.school);
  const { data, error } = await query.order("full_name", { ascending: true }).limit(200);
  const students = (data ?? []) as unknown as StudentRow[];
  return <>
    <PageHeader title="Siswa" description="Cari siswa pada sekolah yang terhubung ke organisasi Anda." />
    <form className="panel student-read-filters" method="get" action="/operator/siswa">
      <label>Nama siswa<input name="q" defaultValue={filters.q} maxLength={120} placeholder="Cari nama siswa" /></label>
      <label>Status<select name="status" defaultValue={filters.status}><option value="">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></label>
      <label>Sekolah<select name="school" defaultValue={filters.school}><option value="">Semua sekolah</option>{schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select></label>
      <button type="submit" className="btn btn-primary">Cari</button><Link href="/operator/siswa" className="btn btn-secondary">Reset</Link>
    </form>
    {(error || schoolError) && <Notice kind="error">Daftar siswa belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>}
    {!error && !schoolError && !students.length && <EmptyState title="Belum ada siswa yang ditemukan" detail="Coba nama lain atau pilih semua status dan sekolah." />}
    <section className="student-read-grid" aria-label="Daftar siswa">{students.map((student) => <Link className="panel student-read-card" key={student.id} href={`/operator/siswa/${student.id}`}>
      <div><strong>{student.full_name}</strong><small>{student.admissions_number}</small></div><ServiceStatusPill status={student.service_status} />
      <p>{student.schools?.name ?? "—"}</p><small>Orang tua: {student.guardians?.full_name ?? "—"}</small>
    </Link>)}</section>
    <p className="muted-hint">Maksimal 200 siswa ditampilkan. Halaman ini hanya untuk membaca.</p>
  </>;
}
