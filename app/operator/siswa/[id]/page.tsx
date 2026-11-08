import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ConfigNotice, EmptyState, Notice, PageHeader, ServiceStatusPill } from "@/components/admin/ui";
import { requireOperator } from "@/lib/auth";
import { operatorReadContext } from "@/lib/operator/read";
import { formatDate, routeDirectionLabel } from "@/lib/validation";
import { studentInScope } from "../read-filters";

export const metadata: Metadata = { title: "Detail siswa | Pengelola" };

export default async function OperatorStudentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const access = await requireOperator();
  if (access.status === "unconfigured") return <ConfigNotice />;
  const supabase = await operatorReadContext();
  if (!supabase) return <ConfigNotice />;
  const { data: schools, error: scopeError } = await supabase.from("schools").select("id").eq("operator_id", access.operator.id);
  if (scopeError) return <Notice kind="error">Detail siswa belum dapat dimuat. Coba lagi nanti.</Notice>;
  const schoolIds = ((schools ?? []) as { id: string }[]).map((school) => school.id);
  if (!schoolIds.length) notFound();
  const { data, error } = await supabase.from("students").select("id, admissions_number, full_name, date_of_birth, school_id, home_address, pickup_notes, service_status, schools(name), guardians(full_name)").eq("id", id).in("school_id", schoolIds).maybeSingle();
  if (error) return <Notice kind="error">Detail siswa belum dapat dimuat. Coba lagi nanti.</Notice>;
  const student = data as unknown as { id: string; admissions_number: string; full_name: string; date_of_birth: string | null; school_id: string | null; home_address: string | null; pickup_notes: string | null; service_status: string; schools: { name: string } | null; guardians: { full_name: string } | null } | null;
  if (!student || !studentInScope(student.school_id, schoolIds)) notFound();
  const { data: rows, error: placementError } = await supabase.from("student_route_stops").select("id, direction, routes(route_name), route_stops(stop_name)").eq("student_id", id).eq("active", true);
  const placements = (rows ?? []) as unknown as { id: string; direction: string; routes: { route_name: string } | null; route_stops: { stop_name: string } | null }[];
  return <>
    <PageHeader title="Detail siswa" description="Data siswa pada organisasi Anda. Halaman ini hanya untuk membaca." actions={<Link href="/operator/siswa" className="btn btn-secondary">Kembali ke daftar siswa</Link>} />
    <section className="panel student-read-detail"><header><h2>{student.full_name}</h2><ServiceStatusPill status={student.service_status} /></header>
      <dl>{[["Nomor siswa", student.admissions_number], ["Tanggal lahir", student.date_of_birth ? formatDate(student.date_of_birth) : "—"], ["Sekolah", student.schools?.name ?? "—"], ["Orang tua", student.guardians?.full_name ?? "—"], ["Alamat", student.home_address ?? "—"], ["Catatan jemput", student.pickup_notes ?? "—"]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </section>
    <section className="panel student-read-detail"><h2>Rute dan titik jemput</h2>
      {placementError ? <Notice kind="error">Rute belum dapat dimuat. Coba lagi nanti.</Notice> : placements.length ? placements.map((placement) => <div className="student-read-placement" key={placement.id}><strong>{routeDirectionLabel(placement.direction)}</strong><p>{placement.routes?.route_name ?? "—"}</p><small>{placement.route_stops?.stop_name ?? "—"}</small></div>) : <EmptyState title="Belum ada penempatan rute" detail="Rute dan titik jemput siswa belum ditentukan." />}
    </section>
  </>;
}
