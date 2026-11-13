import Link from "next/link";
import { LocalizedOption } from "@/components/i18n/LocalizedOption";
import { AdminCopy } from "@/components/i18n/AdminCopy";
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
import { getProjectAreaContext, loadProjectAreaScope } from "@/lib/project-areas/context";
import type { GuardianRow } from "@/lib/types";
import { sanitizeSearch } from "@/lib/validation";
import { saveGuardian, setGuardianActive } from "./actions";

export const metadata: Metadata = { title: "Akun Wali | Operator" };

const path = "/admin/wali";
const selectColumns = "id, profile_id, email, full_name, phone, active";

export default async function WaliPage({
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
  const scope = await loadProjectAreaScope(supabase, areaContext.selectedId);
  const selectedId = areaContext.selectedId;

  let query = supabase
    .from("guardians")
    .select(selectColumns, { count: "exact" })
    .order("full_name", { ascending: true })
    .range(from, to);

  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  if (status === "aktif") query = query.eq("active", true);
  if (status === "nonaktif") query = query.eq("active", false);
  if (selectedId) query = query.in("id", scope.guardianIds);

  const { data, count, error } = await query;
  const rows = (data ?? []) as GuardianRow[];
  const total = count ?? 0;

  const guardianIds = rows.map((row) => row.id);
  const linkedCounts = new Map<string, number>();

  if (guardianIds.length > 0) {
    const { data: links } = await supabase.from("students").select("guardian_id").in("guardian_id", guardianIds);
    for (const link of links ?? []) {
      const key = link.guardian_id as string;
      linkedCounts.set(key, (linkedCounts.get(key) ?? 0) + 1);
    }
  }

  let editing: GuardianRow | null = null;
  if (editId) {
    let editQuery = supabase.from("guardians").select(selectColumns).eq("id", editId);
    if (selectedId) editQuery = editQuery.in("id", scope.guardianIds);
    const { data: editRow } = await editQuery.maybeSingle();
    editing = (editRow as GuardianRow | null) ?? null;
  }

  const notice = noticeFromParams(params);
  const baseQuery = { q, status: status || undefined };
  const emailLocked = Boolean(editing?.profile_id);

  const fields: FieldDef[] = [
    {
      name: "email",
      label: "Email wali",
      type: "email",
      required: true,
      maxLength: 254,
      readOnly: emailLocked,
      defaultValue: editing?.email,
      placeholder: "wali@contoh.com",
      help: emailLocked
        ? "Email akun yang sudah aktif tidak dapat diubah di sini."
        : "Email ini menjadi sumber kebenaran aktivasi akun. Wali hanya dapat mendaftar dengan email yang terdaftar di sini.",
    },
    {
      name: "full_name",
      label: "Nama wali",
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
      help: "Nomor kontak, bukan kredensial login.",
    },
  ];

  return (
    <>
      <PageHeader
        title="Akun Wali"
        description="Daftarkan email wali agar akun dapat diaktifkan melalui verifikasi email."
      />

      <ProjectAreaTabs areas={areaContext.activeAreas} selectedId={selectedId} nextPath={path} compact />

      {notice && <Notice kind={notice.kind}>{notice.message}</Notice>}
      {error && <Notice kind="error">Daftar wali belum dapat dimuat. Coba lagi.</Notice>}

      <div className="admin-split">
        <section className="panel">
          <ListToolbar
            key={`${q}|${status}|${page}`}
            action={path}
            q={q}
            placeholder="Cari nama atau email wali"
            total={total}
            resetHref={path}
            filters={
              <select name="status" defaultValue={status} aria-label="Filter status wali">
                <LocalizedOption value="" label="Semua status" />
                <option value="aktif">Aktif</option>
                <LocalizedOption value="nonaktif" label="Nonaktif" />
              </select>
            }
          />

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col"><AdminCopy value="Nama wali" /></th>
                  <th scope="col"><AdminCopy value="Email" /></th>
                  <th scope="col"><AdminCopy value="Telepon" /></th>
                  <th scope="col"><AdminCopy value="Siswa terhubung" /></th>
                  <th scope="col"><AdminCopy value="Status akun" /></th>
                  <th scope="col"><AdminCopy value="Tindakan" /></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <EmptyRow
                    colSpan={6}
                    title={q || status ? "Tidak ada wali yang cocok" : "Belum ada email wali terdaftar"}
                    detail={
                      q || status
                        ? "Ubah kata kunci atau filter status, lalu terapkan kembali."
                        : "Daftarkan email wali terlebih dahulu, lalu hubungkan siswa melalui menu Data Siswa."
                    }
                  />
                ) : (
                  rows.map((row) => {
                    const linked = linkedCounts.get(row.id) ?? 0;
                    return (
                      <tr key={row.id}>
                        <td>
                          <strong>{row.full_name}</strong>
                        </td>
                        <td>{row.email}</td>
                        <td>{row.phone ?? "—"}</td>
                        <td>
                          {linked} siswa
                          {linked === 0 && <small>Belum ada relasi siswa</small>}
                        </td>
                        <td>
                          <Pill tone={row.active ? "success" : "neutral"}>{row.active ? "Aktif" : "Nonaktif"}</Pill>
                          <small>{row.profile_id ? "Akun sudah dibuat" : "Menunggu aktivasi wali"}</small>
                        </td>
                        <td>
                          <div className="row-actions">
                            <Link className="row-link" href={listHref(path, { ...baseQuery, page, edit: row.id })}>
                              Ubah
                            </Link>
                            <form action={setGuardianActive} className="row-form">
                              <input type="hidden" name="id" value={row.id} />
                              <input type="hidden" name="active" value={row.active ? "false" : "true"} />
                              <ConfirmSubmit
                                className={row.active ? "row-link danger" : "row-link"}
                                message={
                                  row.active
                                    ? `Nonaktifkan akun wali ${row.full_name}? Akses layanannya dicabut, tetapi relasi siswa dan riwayat tetap tersimpan.`
                                    : `Aktifkan kembali akun wali ${row.full_name}?`
                                }
                              >
                                {row.active ? "Nonaktifkan" : "Aktifkan"}
                              </ConfirmSubmit>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
              <h2 className="panel-title">{editing ? "Ubah data wali" : "Daftarkan email wali"}</h2>
              <div className="panel-subtitle">
                {editing ? `Memperbarui ${editing.full_name}` : "Prasyarat aktivasi akun wali"}
              </div>
            </div>
          </header>
          <div className="form-body">
            <RecordForm
              key={editing?.id ?? "new"}
              action={saveGuardian}
              fields={fields}
              hidden={{ id: editing?.id ?? "" }}
              submitLabel={editing ? "Simpan perubahan" : "Daftarkan email"}
              note="Satu siswa hanya memiliki satu wali. Satu akun wali dapat terhubung ke beberapa siswa. Aktivasi hanya berhasil bila minimal satu siswa berstatus layanan aktif."
              secondary={editing ? { href: listHref(path, baseQuery), label: "Batal" } : undefined}
            />
          </div>
        </aside>
      </div>
    </>
  );
}
