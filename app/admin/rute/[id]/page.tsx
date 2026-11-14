import Link from "next/link";
import { AdminCopy } from "@/components/i18n/AdminCopy";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RecordForm, type FieldDef } from "@/components/admin/RecordForm";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { Breadcrumbs, ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { adminReadContext } from "@/lib/admin/read";
import { getRequestLocale } from "@/lib/i18n/server";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";
import { firstParam, noticeFromParams } from "@/lib/admin/query";
import { getProjectAreaContext } from "@/lib/project-areas/context";
import type { RouteRow, RouteStopRow, StudentRouteStopRow } from "@/lib/types";
import { routeDirectionLabel } from "@/lib/validation";
import { assignStudentToStop, removeStudentFromRoute, saveStop } from "../actions";

export const metadata: Metadata = { title: "Detail Rute | Pengelola" };

export default async function RouteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const locale = await getRequestLocale();
  const c = (value: string) => translateAdminCopy(value, locale) ?? value;
  const query = await searchParams;
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const areaContext = await getProjectAreaContext(supabase);
  let routeQuery = supabase
    .from("routes")
    .select("id, route_name, school_name, school_id, project_area_id, direction, active, approved_at, schools(name), project_areas(name)")
    .eq("id", id);
  if (areaContext.selectedId) routeQuery = routeQuery.eq("project_area_id", areaContext.selectedId);
  const { data: routeData } = await routeQuery.maybeSingle();

  const route = routeData as unknown as RouteRow | null;
  if (!route) notFound();

  const editStopId = firstParam(query.editStop);
  const notice = noticeFromParams(query);

  const [stopsResult, schoolResult, rosterResult] = await Promise.all([
    supabase
      .from("route_stops")
      .select("id, route_id, stop_order, stop_name, latitude, longitude, is_school")
      .eq("route_id", id)
      .order("stop_order", { ascending: true }),
    route.school_id
      ? supabase.from("schools").select("id, name").eq("id", route.school_id).maybeSingle()
      : supabase.from("schools").select("id, name").eq("name", route.school_name).limit(1).maybeSingle(),
    supabase
      .from("student_route_stops")
      .select(
        "id, student_id, route_id, stop_id, direction, active, route_stops(stop_name, stop_order), students(full_name, admissions_number)",
      )
      .eq("route_id", id)
      .eq("active", true)
      .order("direction", { ascending: true }),
  ]);

  const stops = (stopsResult.data ?? []) as unknown as RouteStopRow[];
  const roster = (rosterResult.data ?? []) as unknown as StudentRouteStopRow[];
  const schoolId = (schoolResult.data?.id as string | undefined) ?? null;

  const { data: studentRows } =
    schoolId === null
      ? { data: [] as { id: string; full_name: string; admissions_number: string }[] }
      : await supabase
          .from("students")
          .select("id, full_name, admissions_number")
          .eq("school_id", schoolId)
          .eq("service_status", "active")
          .order("full_name", { ascending: true });

  const students = (studentRows ?? []) as { id: string; full_name: string; admissions_number: string }[];
  const editingStop = editStopId ? stops.find((stop) => stop.id === editStopId) : undefined;

  const stopFields: FieldDef[] = [
    {
      name: "stop_name",
      label: "Nama titik",
      required: true,
      maxLength: 120,
      placeholder: "Contoh: Gerbang Perumahan Al-Falah",
      defaultValue: editingStop?.stop_name ?? "",
    },
    {
      name: "stop_order",
      label: "Urutan",
      type: "number",
      required: true,
      min: "1",
      defaultValue: editingStop?.stop_order ?? stops.length + 1,
      help: "Urutan 1 adalah titik pertama yang dikunjungi.",
    },
    {
      name: "latitude",
      label: "Lintang",
      required: true,
      placeholder: "26.4207",
      defaultValue: editingStop?.latitude ?? "",
    },
    {
      name: "longitude",
      label: "Bujur",
      required: true,
      placeholder: "50.0888",
      defaultValue: editingStop?.longitude ?? "",
    },
    {
      name: "is_school",
      label: "Titik ini adalah gerbang sekolah",
      type: "checkbox",
      defaultValue: editingStop ? editingStop.is_school : false,
    },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/admin", label: "Ringkasan" },
          { href: "/admin/rute", label: "Rute" },
          { label: route.route_name },
        ]}
      />

      <PageHeader
        title={route.route_name}
        description={`${route.project_areas?.name ?? c("Area Operasional")} · ${route.schools?.name ?? route.school_name} · ${c(routeDirectionLabel(route.direction))} · ${stops.length} ${c("titik")}`}
        actions={<Pill tone={route.active ? "success" : "neutral"}>{route.active ? "Rute aktif" : "Rute nonaktif"}</Pill>}
      />

      {notice && <Notice kind={notice.kind}>{notice.message}</Notice>}

      <div className="detail-grid">
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">{c("Urutan titik jemput")}</h2>
              <div className="panel-subtitle">{c("Titik tidak dapat dihapus agar riwayat tetap utuh; ubah bila perlu")}</div>
            </div>
          </header>
          <div className="admin-table-wrap">
            <table className="admin-table admin-table-compact">
              <thead>
                <tr>
                  <th scope="col"><AdminCopy value="Urutan" /></th>
                  <th scope="col"><AdminCopy value="Titik" /></th>
                  <th scope="col">{c("Koordinat")}</th>
                  <th scope="col"><AdminCopy value="Tindakan" /></th>
                </tr>
              </thead>
              <tbody>
                {stops.length === 0 ? (
                  <EmptyRow
                    colSpan={4}
                    title="Belum ada titik jemput"
                    detail="Tambahkan titik pertama pada formulir di samping. Koordinat titik diperlukan untuk urutan perjalanan."
                  />
                ) : (
                  stops.map((stop) => (
                    <tr key={stop.id}>
                      <td>
                        <strong>{stop.stop_order}</strong>
                      </td>
                      <td>
                        <strong>{stop.stop_name}</strong>
                        {stop.is_school && <small><AdminCopy value="Gerbang sekolah" /></small>}
                      </td>
                      <td>
                        <code>
                          {stop.latitude}, {stop.longitude}
                        </code>
                      </td>
                      <td>
                        <Link className="row-link" href={`/admin/rute/${id}?editStop=${stop.id}`}>
                          {c("Ubah")}
                        </Link>
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
              <h2 className="panel-title">{editingStop ? c("Ubah titik jemput") : c("Tambah titik jemput")}</h2>
              <div className="panel-subtitle">{c("Koordinat titik hanya dipakai untuk operasional rute")}</div>
            </div>
          </header>
          <div className="form-body">
            <RecordForm
              key={editingStop?.id ?? `new-${stops.length}`}
              action={saveStop}
              fields={stopFields}
              hidden={{ route_id: id, ...(editingStop ? { id: editingStop.id } : {}) }}
              submitLabel={editingStop ? "Simpan titik" : "Tambah titik"}
              secondary={editingStop ? { href: `/admin/rute/${id}`, label: "Batalkan" } : undefined}
            />
          </div>
        </section>
      </div>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">{c("Siswa pada rute ini")}</h2>
            <div className="panel-subtitle">
              Roster ini menjadi daftar siswa pada perjalanan pengemudi dan dasar riwayat perjalanan wali
            </div>
          </div>
          <Pill tone="info">{roster.length} penempatan aktif</Pill>
        </header>

        <form className="inline-form roster-form" action={assignStudentToStop}>
          <input type="hidden" name="return_to" value={`/admin/rute/${id}`} />
          <label>
            Siswa
            <select name="student_id" required defaultValue="">
              <option value="" disabled>
                {students.length === 0 ? "Belum ada siswa aktif di sekolah ini" : "Pilih siswa"}
              </option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name} · {student.admissions_number}
                </option>
              ))}
            </select>
          </label>
          <label>
            Titik jemput
            <select name="stop_id" required defaultValue="">
              <option value="" disabled>
                {stops.length === 0 ? "Tambahkan titik terlebih dahulu" : "Pilih titik"}
              </option>
              {stops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.stop_order}. {stop.stop_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Arah
            <select name="direction" defaultValue={route.direction}>
              <option value="morning">Pagi</option>
              <option value="afternoon">Sore</option>
            </select>
          </label>
          <button className="btn btn-primary" type="submit" disabled={students.length === 0 || stops.length === 0}>
            Tempatkan siswa
          </button>
          {(students.length === 0 || stops.length === 0) && (
            <p className="form-note roster-form-note" role="status">
              {stops.length === 0
                ? "Tambahkan minimal satu titik jemput sebelum menempatkan siswa pada rute ini."
                : "Belum ada siswa aktif di sekolah tujuan rute ini. Tambahkan siswa terlebih dahulu melalui menu Data Siswa."}
            </p>
          )}
        </form>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Siswa</th>
                <th scope="col"><AdminCopy value="Titik" /></th>
                <th scope="col"><AdminCopy value="Arah" /></th>
                <th scope="col"><AdminCopy value="Tindakan" /></th>
              </tr>
            </thead>
            <tbody>
              {roster.length === 0 ? (
                <EmptyRow
                  colSpan={4}
                  title="Belum ada siswa pada rute ini"
                  detail="Gunakan formulir di atas untuk menempatkan siswa pada titik jemput. Satu siswa hanya memiliki satu titik aktif per arah."
                />
              ) : (
                roster.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <strong>{entry.students?.full_name ?? "Siswa"}</strong>
                      <small>{entry.students?.admissions_number}</small>
                    </td>
                    <td>
                      {entry.route_stops?.stop_order}. {entry.route_stops?.stop_name}
                    </td>
                    <td>{c(routeDirectionLabel(entry.direction))}</td>
                    <td>
                      <form action={removeStudentFromRoute}>
                        <input type="hidden" name="id" value={entry.id} />
                        <input type="hidden" name="return_to" value={`/admin/rute/${id}`} />
                        <ConfirmSubmit message="Keluarkan siswa ini dari rute aktif? Riwayat penempatan tetap tersimpan.">
                          Keluarkan
                        </ConfirmSubmit>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Notice kind="info">
        Perjalanan baru dibuat oleh pengemudi saat memulai tugas. Rute dan roster ini tidak membuat perjalanan atau
        posisi GPS secara otomatis.
      </Notice>
    </>
  );
}
