import type { Metadata } from "next";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { operatorReadContext } from "@/lib/operator/read";
import type { StudentRow } from "@/lib/types";
import { serviceStatusLabel } from "@/lib/validation";

export const metadata: Metadata = { title: "Siswa | Pengelola" };

export default async function OperatorStudentsPage() {
  const supabase = await operatorReadContext();
  if (!supabase) return <ConfigNotice />;

  const { data, error } = await supabase
    .from("students")
    .select("id, admissions_number, full_name, service_status, schools(name), guardians(full_name)")
    .order("full_name", { ascending: true })
    .limit(200);

  const students = (data ?? []) as unknown as StudentRow[];

  return (
    <>
      <PageHeader
        title="Siswa pada sekolah Anda"
        description="Daftar ini dibatasi pada siswa di sekolah yang ditautkan ke organisasi Anda. Data siswa sekolah lain tidak dapat dibaca, termasuk melalui URL langsung."
      />

      {error && <Notice kind="error">Daftar siswa belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>}

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Daftar siswa</h2>
            <div className="panel-subtitle">Maksimal 200 siswa, diurutkan berdasarkan nama</div>
          </div>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table table-stack">
            <thead>
              <tr>
                <th scope="col">Siswa</th>
                <th scope="col">Sekolah</th>
                <th scope="col">Wali</th>
                <th scope="col">Layanan</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <EmptyRow
                  colSpan={4}
                  title="Belum ada siswa"
                  detail="Siswa akan muncul setelah pengelola menautkan sekolah ke organisasi Anda dan menambahkan siswa."
                />
              ) : (
                students.map((student) => (
                  <tr key={student.id}>
                    <td data-label="Siswa">
                      <strong>{student.full_name}</strong>
                      <small>{student.admissions_number}</small>
                    </td>
                    <td data-label="Sekolah">{student.schools?.name ?? "—"}</td>
                    <td data-label="Wali">{student.guardians?.full_name ?? "—"}</td>
                    <td data-label="Layanan">
                      <Pill
                        tone={
                          student.service_status === "active"
                            ? "success"
                            : student.service_status === "paused"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {serviceStatusLabel(student.service_status)}
                      </Pill>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Notice kind="info">
        Halaman ini hanya untuk membaca. Perubahan data siswa, wali, dan sekolah dilakukan pengelola. Penempatan
        siswa pada titik jemput juga dikelola pengelola.
      </Notice>
    </>
  );
}
