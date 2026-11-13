import Link from "next/link";
import { AdminCopy } from "@/components/i18n/AdminCopy";
import type { Metadata } from "next";
import { RecordForm, type FieldDef } from "@/components/admin/RecordForm";
import { ProjectAreaTabs } from "@/components/admin/ProjectAreaTabs";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { adminReadContext } from "@/lib/admin/read";
import { firstParam, noticeFromParams } from "@/lib/admin/query";
import { getProjectAreaContext } from "@/lib/project-areas/context";
import type { RouteRow } from "@/lib/types";
import { routeDirectionLabel } from "@/lib/validation";
import { saveRoute } from "./actions";

export const metadata: Metadata = { title: "Rute | Operator" };

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
  const areaContext = await getProjectAreaContext(supabase);
  const selectedId = areaContext.selectedId;

  let routesQuery = supabase
    .from("routes")
    .select("id, route_name, school_name, school_id, project_area_id, direction, active, approved_at, schools(name), project_areas(name), route_stops(id)")
    .order("route_name", { ascending: true });
  if (selectedId) routesQuery = routesQuery.eq("project_area_id", selectedId);

  let schoolsQuery = supabase
    .from("schools")
    .select("id, name, project_area_id, active")
    .eq("active", true)
    .order("name", { ascending: true });
  if (selectedId) schoolsQuery = schoolsQuery.eq("project_area_id", selectedId);

  const [{ data, error }, { data: schoolRows }] = await Promise.all([routesQuery, schoolsQuery]);

  const routes = (data ?? []) as unknown as RouteRow[];
  const schools = (schoolRows ?? []) as { id: string; name: string; project_area_id: string | null }[];
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
      name: "school_id",
      label: "Sekolah tujuan",
      type: "select",
      required: true,
      defaultValue: editing?.school_id ?? "",
      options: [
        { value: "", label: schools.length === 0 ? "Belum ada sekolah aktif di area ini" : "Pilih sekolah" },
        ...schools.map((school) => ({ value: school.id, label: school.name })),
      ],
      help: "Area Operasional rute diturunkan dari sekolah yang dipilih agar tidak terjadi pencampuran data.",
    },
    {
      name: "direction",
      label: "Arah perjalanan",
      type: "select",
      required: true,
      defaultValue: editing?.direction ?? "morning",
      options: [
        { value: "morning", label: "Pagi · jemput dari rumah" },
        { value: "afternoon", label: "Sore · antar pulang" },
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
        description="Kelola urutan titik jemput dan siswa per rute. Nonaktifkan rute yang tidak digunakan."
      />

      <ProjectAreaTabs areas={areaContext.activeAreas} selectedId={selectedId} nextPath="/admin/rute" compact />

      {error && <Notice kind="error">Daftar rute belum dapat dimuat. Coba lagi.</Notice>}
      {notice && <Notice kind={notice.kind}>{notice.message}</Notice>}
      {schools.length === 0 && (
        <Notice kind="warning">
          Belum ada sekolah aktif pada konteks ini. Tambahkan sekolah terlebih dahulu agar rute dapat dibuat.
        </Notice>
      )}

      <div className="admin-split">
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title"><AdminCopy value="Daftar rute" /></h2>
              <div className="panel-subtitle">{routes.length} rute tercatat</div>
            </div>
          </header>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col"><AdminCopy value="Rute" /></th>
                  <th scope="col"><AdminCopy value="Area Operasional" /></th>
                  <th scope="col"><AdminCopy value="Arah" /></th>
                  <th scope="col"><AdminCopy value="Titik" /></th>
                  <th scope="col"><AdminCopy value="Status" /></th>
                  <th scope="col"><AdminCopy value="Tindakan" /></th>
                </tr>
              </thead>
              <tbody>
                {routes.length === 0 ? (
                  <EmptyRow
                    colSpan={6}
                    title="Belum ada rute"
                    detail="Tambahkan rute pertama melalui formulir di samping. Titik jemput dan siswa diatur pada halaman detail rute."
                  />
                ) : (
                  routes.map((route) => (
                    <tr key={route.id}>
                      <td>
                        <strong>{route.route_name}</strong>
                        <small>{route.schools?.name ?? route.school_name}</small>
                      </td>
                      <td>{route.project_areas?.name ?? "Belum ditetapkan"}</td>
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
              <h2 className="panel-title"><AdminCopy value={editing ? "Ubah rute" : "Tambah rute"} /></h2>
              <div className="panel-subtitle"><AdminCopy value="Nama, sekolah tujuan, dan arah perjalanan" /></div>
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
                  ? "Rute dapat dibuat setelah ada minimal satu sekolah aktif pada area ini. Tambahkan sekolah terlebih dahulu."
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
