import Link from "next/link";
import type { Metadata } from "next";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { RecordForm, type FieldDef } from "@/components/admin/RecordForm";
import { ProjectAreaTabs } from "@/components/admin/ProjectAreaTabs";
import {
  ConfigNotice,
  EmptyRow,
  ListToolbar,
  Notice,
  PageHeader,
  Pagination,
  Pill,
} from "@/components/admin/ui";
import { adminReadContext } from "@/lib/admin/read";
import { firstParam, listHref, noticeFromParams } from "@/lib/admin/query";
import { PAGE_SIZE, pageRange, parsePage } from "@/lib/admin/support";
import { getProjectAreaContext } from "@/lib/project-areas/context";
import type { SchoolRow } from "@/lib/types";
import { sanitizeSearch } from "@/lib/validation";
import { saveSchool, setSchoolActive } from "./actions";

export const metadata: Metadata = { title: "Sekolah | Operator" };

const path = "/admin/sekolah";
const selectColumns =
  "id, name, code, city, address, latitude, longitude, contact_name, contact_email, contact_phone, project_area_id, active, project_areas(name)";

export default async function SekolahPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const q = sanitizeSearch(firstParam(params.q));
  const status = firstParam(params.status);
  const editId = firstParam(params.edit);
  const page = parsePage(params.page);
  const { from, to } = pageRange(page);
  const areaContext = await getProjectAreaContext(supabase);
  const selectedId = areaContext.selectedId;

  let query = supabase
    .from("schools")
    .select(selectColumns, { count: "exact" })
    .order("name", { ascending: true })
    .range(from, to);

  if (q) query = query.or(`name.ilike.%${q}%,code.ilike.%${q}%,city.ilike.%${q}%`);
  if (status === "aktif") query = query.eq("active", true);
  if (status === "nonaktif") query = query.eq("active", false);
  if (selectedId) query = query.eq("project_area_id", selectedId);

  const { data, count, error } = await query;
  const rows = (data ?? []) as unknown as SchoolRow[];
  const total = count ?? 0;

  let editing: SchoolRow | null = null;
  if (editId) {
    let editQuery = supabase.from("schools").select(selectColumns).eq("id", editId);
    if (selectedId) editQuery = editQuery.eq("project_area_id", selectedId);
    const { data: editRow } = await editQuery.maybeSingle();
    editing = (editRow as unknown as SchoolRow | null) ?? null;
  }

  const areaOptions = areaContext.areas
    .filter((area) => area.active || area.id === editing?.project_area_id)
    .map((area) => ({ value: area.id, label: area.active ? area.name : `${area.name} (nonaktif)` }));

  const notice = noticeFromParams(params);
  const baseQuery = { q, status: status || undefined };

  const fields: FieldDef[] = [
    {
      name: "name",
      label: "Nama sekolah",
      required: true,
      maxLength: 120,
      defaultValue: editing?.name,
      placeholder: "Contoh: Sekolah Dasar Al-Faisal",
    },
    {
      name: "code",
      label: "Kode sekolah",
      required: true,
      maxLength: 20,
      defaultValue: editing?.code,
      placeholder: "SCH-001",
      help: "Huruf kapital, angka, dan tanda hubung. Kode tidak boleh sama dengan sekolah lain.",
    },
    {
      name: "city",
      label: "Kota",
      required: true,
      maxLength: 80,
      defaultValue: editing?.city ?? "Dammam",
    },
    {
      name: "project_area_id",
      label: "Area Operasional",
      type: "select",
      required: true,
      defaultValue: editing?.project_area_id ?? selectedId ?? "",
      options: [
        { value: "", label: "Pilih Area Operasional" },
        ...areaOptions,
      ],
      help: "Area operasional sekolah. Siswa dan rute sekolah ini hanya dapat dihubungkan dengan data dari area yang sama.",
      fullWidth: true,
    },
    {
      name: "address",
      label: "Alamat",
      type: "textarea",
      fullWidth: true,
      maxLength: 400,
      defaultValue: editing?.address,
      placeholder: "Alamat lengkap sekolah",
    },
    {
      name: "latitude",
      label: "Lintang (latitude)",
      type: "number",
      step: "0.000001",
      defaultValue: editing?.latitude,
      help: "Opsional. Isi bersama bujur untuk menyimpan lokasi sekolah.",
    },
    {
      name: "longitude",
      label: "Bujur (longitude)",
      type: "number",
      step: "0.000001",
      defaultValue: editing?.longitude,
      help: "Opsional. Rentang -180 sampai 180.",
    },
    {
      name: "contact_name",
      label: "Nama kontak",
      maxLength: 120,
      defaultValue: editing?.contact_name,
    },
    {
      name: "contact_phone",
      label: "Nomor telepon kontak",
      type: "tel",
      maxLength: 20,
      defaultValue: editing?.contact_phone,
      placeholder: "+9665xxxxxxxx",
    },
    {
      name: "contact_email",
      label: "Email kontak",
      type: "email",
      maxLength: 254,
      defaultValue: editing?.contact_email,
      placeholder: "kontak@sekolah.sa",
    },
  ];

  return (
    <>
      <PageHeader
        title="Sekolah"
        description="Data sekolah per Area Operasional. Nonaktifkan sekolah yang tidak lagi bekerja sama; data dan riwayatnya tetap tersimpan."
      />

      <ProjectAreaTabs areas={areaContext.activeAreas} selectedId={selectedId} nextPath={path} compact />

      {notice && <Notice kind={notice.kind}>{notice.message}</Notice>}
      {error && <Notice kind="error">Daftar sekolah belum dapat dimuat. Coba lagi.</Notice>}

      <div className="admin-split">
        <section className="panel">
          <ListToolbar
            key={`${q}|${status}|${page}`}
            action={path}
            q={q}
            placeholder="Cari nama, kode, atau kota sekolah"
            total={total}
            resetHref={path}
            filters={
              <select name="status" defaultValue={status} aria-label="Filter status sekolah">
                <option value="">Semua status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            }
          />

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Nama sekolah</th>
                  <th scope="col">Kode</th>
                  <th scope="col">Area Operasional</th>
                  <th scope="col">Kontak</th>
                  <th scope="col">Status</th>
                  <th scope="col">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <EmptyRow
                    colSpan={6}
                    title={q || status ? "Tidak ada sekolah yang cocok" : "Belum ada data sekolah"}
                    detail={
                      q || status
                        ? "Ubah kata kunci atau filter status, lalu terapkan kembali."
                        : "Tambahkan sekolah pertama melalui formulir di samping. Data akan langsung tersimpan."
                    }
                  />
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.name}</strong>
                        {row.address && <small>{row.address}</small>}
                      </td>
                      <td>
                        <code>{row.code}</code>
                      </td>
                      <td>{row.project_areas?.name ?? row.city}</td>
                      <td>
                        {row.contact_name ?? "—"}
                        <small>{row.contact_phone ?? row.contact_email ?? "Kontak belum diisi"}</small>
                      </td>
                      <td>
                        <Pill tone={row.active ? "success" : "neutral"}>{row.active ? "Aktif" : "Nonaktif"}</Pill>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Link
                            className="row-link"
                            href={listHref(path, { ...baseQuery, page, edit: row.id })}
                          >
                            Ubah
                          </Link>
                          <form action={setSchoolActive} className="row-form">
                            <input type="hidden" name="id" value={row.id} />
                            <input type="hidden" name="active" value={row.active ? "false" : "true"} />
                            <ConfirmSubmit
                              className={row.active ? "row-link danger" : "row-link"}
                              message={
                                row.active
                                  ? `Nonaktifkan ${row.name}? Data sekolah dan riwayat terkait tetap tersimpan.`
                                  : `Aktifkan kembali ${row.name}?`
                              }
                            >
                              {row.active ? "Nonaktifkan" : "Aktifkan"}
                            </ConfirmSubmit>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            total={total}
            pageSize={PAGE_SIZE}
            prevHref={page > 1 ? listHref(path, { ...baseQuery, page: page - 1 }) : undefined}
            nextHref={from + PAGE_SIZE < total ? listHref(path, { ...baseQuery, page: page + 1 }) : undefined}
          />
        </section>

        <aside className="panel admin-form-panel" id="form">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">{editing ? "Ubah sekolah" : "Tambah sekolah"}</h2>
              <div className="panel-subtitle">
                {editing ? `Memperbarui ${editing.name}` : "Data langsung tersimpan"}
              </div>
            </div>
          </header>
          <div className="form-body">
            <RecordForm
              key={editing?.id ?? "new"}
              action={saveSchool}
              fields={fields}
              hidden={{ id: editing?.id ?? "" }}
              submitLabel={editing ? "Simpan perubahan" : "Tambah sekolah"}
              note="Kode sekolah dan status aktif dipakai untuk mencegah duplikasi data. Menonaktifkan sekolah tidak menghapus data."
              secondary={editing ? { href: listHref(path, baseQuery), label: "Batal" } : undefined}
            />
          </div>
        </aside>
      </div>
    </>
  );
}
