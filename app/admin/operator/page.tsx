import Link from "next/link";
import type { Metadata } from "next";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { RecordForm, type FieldDef } from "@/components/admin/RecordForm";
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
import type { OperatorRow } from "@/lib/types";
import { sanitizeSearch } from "@/lib/validation";
import { saveOperator, setOperatorActive } from "./actions";

export const metadata: Metadata = { title: "Operator | Admin Pusat" };

const path = "/admin/operator";
const selectColumns = "id, name, code, city, contact_name, contact_email, contact_phone, active";

export default async function OperatorPage({
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

  let query = supabase
    .from("operators")
    .select(selectColumns, { count: "exact" })
    .order("name", { ascending: true })
    .range(from, to);

  if (q) query = query.or(`name.ilike.%${q}%,code.ilike.%${q}%,city.ilike.%${q}%`);
  if (status === "aktif") query = query.eq("active", true);
  if (status === "nonaktif") query = query.eq("active", false);

  const { data, count, error } = await query;
  const rows = (data ?? []) as OperatorRow[];
  const total = count ?? 0;

  let editing: OperatorRow | null = null;
  if (editId) {
    const { data: editRow } = await supabase.from("operators").select(selectColumns).eq("id", editId).maybeSingle();
    editing = (editRow as OperatorRow | null) ?? null;
  }

  const notice = noticeFromParams(params);
  const baseQuery = { q, status: status || undefined };

  const fields: FieldDef[] = [
    {
      name: "name",
      label: "Nama operator",
      required: true,
      maxLength: 120,
      defaultValue: editing?.name,
      placeholder: "Contoh: Dammam School Transport Co.",
    },
    {
      name: "code",
      label: "Kode operator",
      required: true,
      maxLength: 20,
      defaultValue: editing?.code,
      placeholder: "OPR-001",
      help: "Huruf kapital, angka, dan tanda hubung. Harus unik.",
    },
    {
      name: "city",
      label: "Kota operasi",
      maxLength: 80,
      defaultValue: editing?.city,
      placeholder: "Dammam",
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
    },
    {
      name: "contact_email",
      label: "Email kontak",
      type: "email",
      maxLength: 254,
      defaultValue: editing?.contact_email,
    },
  ];

  return (
    <>
      <PageHeader
        title="Operator"
        description="Perusahaan atau unit transportasi yang mengoperasikan bus sekolah. Satu operator dapat melayani beberapa sekolah pada modul penugasan berikutnya."
      />

      {notice && <Notice kind={notice.kind}>{notice.message}</Notice>}
      {error && <Notice kind="error">Daftar operator belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>}

      <div className="admin-split">
        <section className="panel">
          <ListToolbar
            key={`${q}|${status}|${page}`}
            action={path}
            q={q}
            placeholder="Cari nama, kode, atau kota operator"
            total={total}
            resetHref={path}
            filters={
              <select name="status" defaultValue={status} aria-label="Filter status operator">
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
                  <th scope="col">Nama operator</th>
                  <th scope="col">Kode</th>
                  <th scope="col">Kota</th>
                  <th scope="col">Kontak</th>
                  <th scope="col">Status</th>
                  <th scope="col">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <EmptyRow
                    colSpan={6}
                    title={q || status ? "Tidak ada operator yang cocok" : "Belum ada data operator"}
                    detail={
                      q || status
                        ? "Ubah kata kunci atau filter status, lalu terapkan kembali."
                        : "Tambahkan operator pertama melalui formulir di samping."
                    }
                  />
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.name}</strong>
                      </td>
                      <td>
                        <code>{row.code}</code>
                      </td>
                      <td>{row.city ?? "—"}</td>
                      <td>
                        {row.contact_name ?? "—"}
                        <small>{row.contact_phone ?? row.contact_email ?? "Kontak belum diisi"}</small>
                      </td>
                      <td>
                        <Pill tone={row.active ? "success" : "neutral"}>{row.active ? "Aktif" : "Nonaktif"}</Pill>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Link className="row-link" href={listHref(path, { ...baseQuery, page, edit: row.id })}>
                            Ubah
                          </Link>
                          <form action={setOperatorActive} className="row-form">
                            <input type="hidden" name="id" value={row.id} />
                            <input type="hidden" name="active" value={row.active ? "false" : "true"} />
                            <ConfirmSubmit
                              className={row.active ? "row-link danger" : "row-link"}
                              message={
                                row.active
                                  ? `Nonaktifkan ${row.name}? Data operator dan riwayat terkait tetap tersimpan.`
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
              <h2 className="panel-title">{editing ? "Ubah operator" : "Tambah operator"}</h2>
              <div className="panel-subtitle">
                {editing ? `Memperbarui ${editing.name}` : "Data tersimpan langsung ke database"}
              </div>
            </div>
          </header>
          <div className="form-body">
            <RecordForm
              key={editing?.id ?? "new"}
              action={saveOperator}
              fields={fields}
              hidden={{ id: editing?.id ?? "" }}
              submitLabel={editing ? "Simpan perubahan" : "Tambah operator"}
              note="Menonaktifkan operator tidak menghapus data bus, pengemudi, atau riwayat yang sudah tercatat."
              secondary={editing ? { href: listHref(path, baseQuery), label: "Batal" } : undefined}
            />
          </div>
        </aside>
      </div>
    </>
  );
}
