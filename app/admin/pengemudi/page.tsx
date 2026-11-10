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
import type { DriverRow } from "@/lib/types";
import { sanitizeSearch } from "@/lib/validation";
import { linkDriverAccount, saveDriver, setDriverActive, unlinkDriverAccount } from "./actions";

export const metadata: Metadata = { title: "Pengemudi | Operator" };

const path = "/admin/pengemudi";
const selectColumns = "id, full_name, phone, license_number, project_area_id, profile_id, active, project_areas(name)";

export default async function PengemudiPage({
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
    .from("drivers")
    .select(selectColumns, { count: "exact" })
    .order("full_name", { ascending: true })
    .range(from, to);

  if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,license_number.ilike.%${q}%`);
  if (status === "aktif") query = query.eq("active", true);
  if (status === "nonaktif") query = query.eq("active", false);
  if (selectedId) query = query.eq("project_area_id", selectedId);

  const { data, count, error } = await query;
  const rows = (data ?? []) as unknown as DriverRow[];

  const linkedIds = rows.filter((row) => row.profile_id).map((row) => row.profile_id as string);
  let emailRows: { profile_id: string; email: string }[] = [];
  if (linkedIds.length) {
    const res = await supabase.rpc("linked_account_emails", { p_profile_ids: linkedIds });
    emailRows = (res.data ?? []) as { profile_id: string; email: string }[];
  }
  const emailById = new Map<string, string>(emailRows.map((row) => [row.profile_id, row.email]));
  const total = count ?? 0;

  let editing: DriverRow | null = null;
  if (editId) {
    let editQuery = supabase.from("drivers").select(selectColumns).eq("id", editId);
    if (selectedId) editQuery = editQuery.eq("project_area_id", selectedId);
    const { data: editRow } = await editQuery.maybeSingle();
    editing = (editRow as unknown as DriverRow | null) ?? null;
  }

  const areaOptions = areaContext.areas
    .filter((area) => area.active || area.id === editing?.project_area_id)
    .map((area) => ({
      value: area.id,
      label: area.active ? area.name : `${area.name} (nonaktif)`,
    }));

  const notice = noticeFromParams(params);
  const baseQuery = { q, status: status || undefined };

  const fields: FieldDef[] = [
    {
      name: "full_name",
      label: "Nama lengkap pengemudi",
      required: true,
      maxLength: 120,
      defaultValue: editing?.full_name,
    },
    {
      name: "phone",
      label: "Nomor telepon",
      type: "tel",
      maxLength: 20,
      defaultValue: editing?.phone,
      placeholder: "+9665xxxxxxxx",
      help: "Nomor kontak operasional. Bukan kredensial login.",
    },
    {
      name: "license_number",
      label: "Nomor SIM",
      maxLength: 40,
      defaultValue: editing?.license_number,
      help: "Nomor izin mengemudi sesuai dokumen resmi.",
    },
    {
      name: "project_area_id",
      label: "Project Area",
      type: "select",
      required: true,
      fullWidth: true,
      defaultValue: editing?.project_area_id ?? selectedId ?? "",
      options: [{ value: "", label: "Pilih Project Area" }, ...areaOptions],
      help: "Area operasional pengemudi. Penugasan hanya boleh menggabungkan pengemudi, bus, dan rute dari area yang sama.",
    },
  ];

  return (
    <>
      <PageHeader
        title="Pengemudi"
        description="Data pengemudi per Project Area untuk kebutuhan penugasan. Tautkan akun login pengemudi pada kolom Akun masuk agar akun tersebut dapat membuka area Pengemudi."
      />

      <ProjectAreaTabs areas={areaContext.activeAreas} selectedId={selectedId} nextPath={path} compact />

      {notice && <Notice kind={notice.kind}>{notice.message}</Notice>}
      {error && <Notice kind="error">Daftar pengemudi belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>}

      <div className="admin-split">
        <section className="panel">
          <ListToolbar
            key={`${q}|${status}|${page}`}
            action={path}
            q={q}
            placeholder="Cari nama, telepon, atau nomor SIM"
            total={total}
            resetHref={path}
            filters={
              <select name="status" defaultValue={status} aria-label="Filter status pengemudi">
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
                  <th scope="col">Nama pengemudi</th>
                  <th scope="col">Telepon</th>
                  <th scope="col">Nomor SIM</th>
                  <th scope="col">Project Area</th>
                  <th scope="col">Status</th>
                  <th scope="col">Akun masuk</th>
                  <th scope="col">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <EmptyRow
                    colSpan={7}
                    title={q || status ? "Tidak ada pengemudi yang cocok" : "Belum ada data pengemudi"}
                    detail={
                      q || status
                        ? "Ubah kata kunci atau filter, lalu terapkan kembali."
                        : "Tambahkan pengemudi pertama melalui formulir di samping."
                    }
                  />
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.full_name}</strong>
                      </td>
                      <td>{row.phone ?? "—"}</td>
                      <td>{row.license_number ?? "—"}</td>
                      <td>{row.project_areas?.name ?? "Belum ditetapkan"}</td>
                      <td>
                        <Pill tone={row.active ? "success" : "neutral"}>{row.active ? "Aktif" : "Nonaktif"}</Pill>
                      </td>
                      <td className="account-cell">
                        {row.profile_id ? (
                          <>
                            <Pill tone="info">Tertaut</Pill>
                            <small>{emailById.get(row.profile_id) ?? "Akun tersambung"}</small>
                            <form action={unlinkDriverAccount} className="row-form">
                              <input type="hidden" name="id" value={row.id} />
                              <ConfirmSubmit
                                className="row-link danger"
                                message={`Lepas tautan akun ${emailById.get(row.profile_id) ?? "tersebut"} dari ${row.full_name}? Akun tersebut tidak lagi dapat masuk area Pengemudi.`}
                              >
                                Lepas tautan
                              </ConfirmSubmit>
                            </form>
                          </>
                        ) : (
                          <form action={linkDriverAccount} className="account-link-form">
                            <input type="hidden" name="id" value={row.id} />
                            <input
                              type="email"
                              name="email"
                              required
                              maxLength={254}
                              placeholder="email@contoh.com"
                              aria-label={`Email akun untuk ${row.full_name}`}
                            />
                            <ConfirmSubmit
                              className="row-link"
                              message={`Tautkan akun ini ke ${row.full_name}? Peran akun menjadi Pengemudi dan hanya dapat melihat penugasan miliknya.`}
                            >
                              Tautkan
                            </ConfirmSubmit>
                          </form>
                        )}
                      </td>
                      <td>
                        <div className="row-actions">
                          <Link className="row-link" href={listHref(path, { ...baseQuery, page, edit: row.id })}>
                            Ubah
                          </Link>
                          <form action={setDriverActive} className="row-form">
                            <input type="hidden" name="id" value={row.id} />
                            <input type="hidden" name="active" value={row.active ? "false" : "true"} />
                            <ConfirmSubmit
                              className={row.active ? "row-link danger" : "row-link"}
                              message={
                                row.active
                                  ? `Nonaktifkan pengemudi ${row.full_name}? Data dan riwayat penugasan tetap tersimpan.`
                                  : `Aktifkan kembali pengemudi ${row.full_name}?`
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
              <h2 className="panel-title">{editing ? "Ubah pengemudi" : "Tambah pengemudi"}</h2>
              <div className="panel-subtitle">
                {editing ? `Memperbarui ${editing.full_name}` : "Data langsung tersimpan"}
              </div>
            </div>
          </header>
          <div className="form-body">
            <RecordForm
              key={editing?.id ?? "new"}
              action={saveDriver}
              fields={fields}
              hidden={{ id: editing?.id ?? "" }}
              submitLabel={editing ? "Simpan perubahan" : "Tambah pengemudi"}
              note="Menonaktifkan pengemudi tidak menghapus data atau riwayat. Penautan dan pelepasan akun dilakukan dari kolom Akun masuk pada tabel."
              secondary={editing ? { href: listHref(path, baseQuery), label: "Batal" } : undefined}
            />
          </div>
        </aside>
      </div>
    </>
  );
}
