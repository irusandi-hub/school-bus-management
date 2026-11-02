import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { operatorReadContext } from "@/lib/operator/read";
import type { RouteRow, RouteStopRow, StudentRouteStopRow } from "@/lib/types";
import { routeDirectionLabel } from "@/lib/validation";

export const metadata: Metadata = { title: "Detail rute | Operator" };

const path = "/operator/rute";

export default async function OperatorRouteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await operatorReadContext();
  if (!supabase) return <ConfigNotice />;

  const { data: routeRow, error } = await supabase
    .from("routes")
    .select("id, route_name, school_name, direction, active, approved_at")
    .eq("id", id)
    .maybeSingle();

  const route = routeRow as RouteRow | null;

  if (!route) {
    return (
      <>
        <PageHeader title="Rute" description="Rute dan titik jemput dikelola Admin Pusat." />
        <Notice kind="error">
          {error
            ? "Rute belum dapat dimuat. Muat ulang halaman atau coba lagi nanti."
            : "Rute tidak ditemukan atau bukan bagian organisasi Anda."}
        </Notice>
        <p>
          <Link className="row-link" href={path}>
            Kembali ke daftar rute
          </Link>
        </p>
      </>
    );
  }

  const [{ data: stopRows, error: stopError }, { data: rosterRows, error: rosterError }] = await Promise.all([
    supabase
      .from("route_stops")
      .select("id, route_id, stop_order, stop_name, latitude, longitude, is_school")
      .eq("route_id", id)
      .order("stop_order", { ascending: true }),
    supabase
      .from("student_route_stops")
      .select("id, stop_id, active, students(full_name, admissions_number)")
      .eq("route_id", id)
      .eq("active", true),
  ]);

  const stops = ((stopRows ?? []) as unknown as RouteStopRow[]).slice().sort((a, b) => a.stop_order - b.stop_order);
  const roster = (rosterRows ?? []) as unknown as (StudentRouteStopRow & { stop_id: string })[];

  const studentsByStop = new Map<string, { name: string; number: string }[]>();
  for (const entry of roster) {
    if (!entry.students) continue;
    const list = studentsByStop.get(entry.stop_id) ?? [];
    list.push({ name: entry.students.full_name, number: entry.students.admissions_number });
    studentsByStop.set(entry.stop_id, list);
  }

  const totalStudents = roster.filter((entry) => entry.students).length;

  return (
    <>
      <PageHeader
        title={route.route_name}
        description="Rute, urutan titik jemput, dan siswa yang terdaftar. Perubahan rute dilakukan Admin Pusat."
      />

      <p>
        <Link className="row-link" href={path}>
          ← Kembali ke daftar rute
        </Link>
      </p>

      {stopError && <Notice kind="error">Daftar titik jemput belum dapat dimuat.</Notice>}
      {rosterError && <Notice kind="error">Daftar siswa pada rute ini belum dapat dimuat.</Notice>}

      <section className="panel" style={{ marginBottom: 16 }}>
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Ringkasan rute</h2>
            <div className="panel-subtitle">{route.school_name}</div>
          </div>
        </header>
        <div className="pickup-body">
          <dl className="child-facts">
            <div>
              <dt>Arah</dt>
              <dd>{routeDirectionLabel(route.direction)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <Pill tone={route.active ? "success" : "neutral"}>{route.active ? "Aktif" : "Nonaktif"}</Pill>
              </dd>
            </div>
            <div>
              <dt>Jumlah titik</dt>
              <dd>{stops.length} titik</dd>
            </div>
            <div>
              <dt>Siswa terdaftar</dt>
              <dd>{totalStudents} siswa</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Urutan titik jemput</h2>
            <div className="panel-subtitle">Daftar siswa per titik untuk perjalanan yang ditugaskan</div>
          </div>
        </header>

        {stops.length === 0 ? (
          <EmptyRow
            colSpan={3}
            title="Belum ada titik jemput"
            detail="Admin Pusat belum menambahkan titik jemput pada rute ini."
          />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Urutan</th>
                  <th scope="col">Titik jemput</th>
                  <th scope="col">Siswa</th>
                </tr>
              </thead>
              <tbody>
                {stops.map((stop) => {
                  const students = studentsByStop.get(stop.id) ?? [];
                  return (
                    <tr key={stop.id}>
                      <td>
                        <span className="stop-number">{stop.stop_order}</span>
                      </td>
                      <td>
                        <strong>{stop.stop_name}</strong>
                        <small>{stop.is_school ? "Sekolah" : "Titik jemput siswa"}</small>
                      </td>
                      <td>
                        {students.length === 0 ? (
                          <span className="muted-text">Belum ada siswa</span>
                        ) : (
                          <ul className="stop-students">
                            {students.map((student) => (
                              <li key={student.number}>
                                <strong>{student.name}</strong>
                                <small>{student.number}</small>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
