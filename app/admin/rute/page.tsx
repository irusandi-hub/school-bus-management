import Link from "next/link";
import type { Metadata } from "next";
import { RecordForm, type FieldDef } from "@/components/admin/RecordForm";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { adminReadContext } from "@/lib/admin/read";
import { firstParam, noticeFromParams } from "@/lib/admin/query";
import type { RouteRow } from "@/lib/types";
import { routeDirectionLabel } from "@/lib/validation";
import { saveRoute } from "./actions";

export const metadata: Metadata = { title: "Rute | Admin Pusat" };

export default async function RoutesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const editId = firstParam(params.edit);
  const notice = noticeFromParams(params);

  const [{ data, error }, { data: schoolRows }] = await Promise.all([
    supabase
      .from("routes")
      .select("id, route_name, school_name, direction, active, approved_at, route_stops(id)")
      .order("route_name", { ascending: true }),
    supabase.from("schools").select("name").eq("active", true).order("name", { ascending: true }),
  ]);

  const routes = (data ?? []) as unknown as RouteRow[];
  const schools = (schoolRows ?? []) as { name: string }[];
  const editing = editId ? routes.find((route) => route.id === editId) : undefined;

  const fields: FieldDef[] = [
    {
      name: "route_name",
      label: "Nama rute",
      required: true,
      maxLength: 120,
      placeholder: "Contoh: Rute Al-Falah Pagi",
      defaultValue: editing?.route_name ?? "",
    },
    {
      name: "school_name",
      label: "Sekolah tujuan",
      type: "select",
      required: true,
      defaultValue: editing?.school_name ?? "",
      options: [
        { value: "", label: schools.length === 0 ? "Belum ada sekolah aktif" : "Pilih sekolah" },
        ...schools.map((school) => ({ value: school.name, label: school.name })),
      ],
      help: "Daftar sekolah berasal dari modul Sekolah yang sudah aktif.",
    },
    {
      name: "direction",
      label: "Arah perjalanan",
      type: "select",
      required: true,
      defaultValue: editing?.direction ?? "morning",
      options: [
        { value: "morning", label: "Pagi (antar ke sekolah)" },
        { value: "afternoon", label: "Sore (jemput dari sekolah)" },
      ],
    },
    {
      name: "active",
      label: "Rute aktif dan dapat ditugaskan",
      type: "checkbox",
      defaultValue: editing ? editing.active : true,
    },
  ];

  return (
    <>
      <PageHeader
        title="Rute & titik jemput"
        description="Rute menghubungkan sekolah, urutan titik jemput, dan siswa yang dilayani. Rute tidak dapat dihapus; nonaktifkan bila tidak dipakai lagi."
      />

      {error && <Notice kind="error">Daftar rute belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>}
      {notice && <Notice kind={notice.kind}>{notice.message}</Notice>}
      {schools.length === 0 && (
        <Notice kind="warning">
          Belum ada sekolah aktif. Tambahkan sekolah terlebih dahulu agar rute dapat dibuat.
        </Notice>
      )}

      <div className="admin-split">
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Daftar rute</h2>
              <div className="panel-subtitle">{routes.length} rute tercatat</div>
            </div>
          </header>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Rute</th>
                  <th scope="col">Arah</th>
                  <th scope="col">Titik</th>
                  <th scope="col">Status</th>
                  <th scope="col">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {routes.length === 0 ? (
                  <EmptyRow
                    colSpan={5}
                    title="Belum ada rute"
                    detail="Tambahkan rute pertama melalui formulir di samping. Titik jemput dan siswa diatur pada halaman detail rute."
                  />
                ) : (
                  routes.map((route) => (
                    <tr key={route.id}>
                      <td>
                        <strong>{route.route_name}</strong>
                        <small>{route.school_name}</small>
                      </td>
                      <td>{routeDirectionLabel(route.direction)}</td>
                      <td>{route.route_stops?.length ?? 0}</td>
                      <td>
                        <Pill tone={route.active ? "success" : "neutral"}>{route.active ? "Aktif" : "Nonaktif"}</Pill>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Link className="row-link" href={`/admin/rute/${route.id}`}>
                            Atur titik &amp; siswa
                          </Link>
                          <Link className="row-link" href={`/admin/rute?edit=${route.id}`}>
                            Ubah
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel admin-form-panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">{editing ? "Ubah rute" : "Tambah rute"}</h2>
              <div className="panel-subtitle">Nama, sekolah tujuan, dan arah perjalanan</div>
            </div>
          </header>
          <div className="form-body">
            <RecordForm
              key={editing?.id ?? "new"}
              action={saveRoute}
              fields={fields}
              hidden={editing ? { id: editing.id } : undefined}
              submitLabel={editing ? "Simpan perubahan" : "Tambah rute"}
              disabledReason={
                schools.length === 0
                  ? "Rute dapat dibuat setelah ada minimal satu sekolah aktif. Tambahkan sekolah terlebih dahulu; formulir ini tetap tersedia untuk ditinjau."
                  : undefined
              }
              secondary={editing ? { href: "/admin/rute", label: "Batalkan perubahan" } : undefined}
              note="Rute baru belum memiliki titik jemput. Buka halaman rute untuk menambahkan urutan titik dan menempatkan siswa."
            />
          </div>
        </section>
      </div>
    </>
  );
}
