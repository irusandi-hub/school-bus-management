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
import type { BusRow } from "@/lib/types";
import { sanitizeSearch } from "@/lib/validation";
import { saveBus, setBusActive } from "./actions";

export const metadata: Metadata = { title: "Bus | Pengelola" };

const path = "/admin/bus";
const selectColumns = "id, fleet_code, plate_number, capacity, model, notes, operator_id, active, operators(name)";

export default async function BusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const q = sanitizeSearch(firstParam(params.q));
  const status = firstParam(params.status);
  const operatorFilter = firstParam(params.operator);
  const editId = firstParam(params.edit);
  const page = parsePage(params.page);
  const { from, to } = pageRange(page);

  const { data: operatorRows } = await supabase
    .from("operators")
    .select("id, name, active")
    .order("name", { ascending: true });
  const operators = (operatorRows ?? []) as { id: string; name: string; active: boolean }[];

  let query = supabase
    .from("buses")
    .select(selectColumns, { count: "exact" })
    .order("fleet_code", { ascending: true })
    .range(from, to);

  if (q) query = query.or(`fleet_code.ilike.%${q}%,plate_number.ilike.%${q}%`);
  if (status === "aktif") query = query.eq("active", true);
  if (status === "nonaktif") query = query.eq("active", false);
  if (operatorFilter) query = query.eq("operator_id", operatorFilter);

  const { data, count, error } = await query;
  const rows = (data ?? []) as unknown as BusRow[];
  const total = count ?? 0;

  let editing: BusRow | null = null;
  if (editId) {
    const { data: editRow } = await supabase.from("buses").select(selectColumns).eq("id", editId).maybeSingle();
    editing = (editRow as unknown as BusRow | null) ?? null;
  }

  const operatorOptions = operators
    .filter((operator) => operator.active || operator.id === editing?.operator_id)
    .map((operator) => ({
      value: operator.id,
      label: operator.active ? operator.name : `${operator.name} (nonaktif)`,
    }));

  const notice = noticeFromParams(params);
  const baseQuery = { q, status: status || undefined, operator: operatorFilter || undefined };

  const fields: FieldDef[] = [
    {
      name: "fleet_code",
      label: "Kode armada",
      required: true,
      maxLength: 32,
      defaultValue: editing?.fleet_code,
      placeholder: "BUS-001",
      help: "Identitas internal bus. Huruf kapital, angka, dan tanda hubung.",
    },
    {
      name: "plate_number",
      label: "Nomor polisi",
      maxLength: 20,
      defaultValue: editing?.plate_number,
      placeholder: "1234 ABC",
    },
    {
      name: "capacity",
      label: "Kapasitas kursi",
      type: "number",
      required: true,
      min: "1",
      max: "100",
      step: "1",
      defaultValue: editing?.capacity,
      help: "Jumlah kursi penumpang, bukan termasuk pengemudi.",
    },
    {
      name: "model",
      label: "Model bus",
      maxLength: 80,
      defaultValue: editing?.model,
      placeholder: "Contoh: Coaster 28 kursi",
    },
    {
      name: "operator_id",
      label: "Pengelola",
      type: "select",
      fullWidth: true,
      defaultValue: editing?.operator_id ?? "",
      options: [{ value: "", label: "Belum ditetapkan" }, ...operatorOptions],
      help:
        operatorOptions.length === 0
          ? "Belum ada pengelola aktif. Bus tetap dapat disimpan tanpa pengelola."
          : "Pengelola dapat ditetapkan kemudian sesuai kontrak operasional.",
    },
    {
      name: "notes",
      label: "Catatan",
      type: "textarea",
      fullWidth: true,
      maxLength: 300,
      defaultValue: editing?.notes,
    },
  ];

  return (
    <>
      <PageHeader
        title="Bus"
        description="Data armada untuk kebutuhan penugasan. Kapasitas dan nomor polisi divalidasi agar penugasan berikutnya tidak memakai data yang tidak konsisten."
      />

      {notice && <Notice kind={notice.kind}>{notice.message}</Notice>}
      {error && <Notice kind="error">Daftar bus belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>}

      <div className="admin-split">
        <section className="panel">
          <ListToolbar
            key={`${q}|${status}|${operatorFilter}|${page}`}
            action={path}
            q={q}
            placeholder="Cari kode armada atau nomor polisi"
            total={total}
            resetHref={path}
            filters={
              <>
                <select name="operator" defaultValue={operatorFilter} aria-label="Filter pengelola">
                  <option value="">Semua pengelola</option>
                  {operators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.name}
                    </option>
                  ))}
                </select>
                <select name="status" defaultValue={status} aria-label="Filter status bus">
                  <option value="">Semua status</option>
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </>
            }
          />

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Kode armada</th>
                  <th scope="col">Nomor polisi</th>
                  <th scope="col">Kapasitas</th>
                  <th scope="col">Pengelola</th>
                  <th scope="col">Status</th>
                  <th scope="col">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <EmptyRow
                    colSpan={6}
                    title={q || status || operatorFilter ? "Tidak ada bus yang cocok" : "Belum ada data bus"}
                    detail={
                      q || status || operatorFilter
                        ? "Ubah kata kunci atau filter, lalu terapkan kembali."
                        : "Tambahkan bus pertama melalui formulir di samping."
                    }
                  />
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.fleet_code}</strong>
                        {row.model && <small>{row.model}</small>}
                      </td>
                      <td>{row.plate_number ?? "—"}</td>
                      <td>{row.capacity} kursi</td>
                      <td>{row.operators?.name ?? "Belum ditetapkan"}</td>
                      <td>
                        <Pill tone={row.active ? "success" : "neutral"}>{row.active ? "Aktif" : "Nonaktif"}</Pill>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Link className="row-link" href={listHref(path, { ...baseQuery, page, edit: row.id })}>
                            Ubah
                          </Link>
                          <form action={setBusActive} className="row-form">
                            <input type="hidden" name="id" value={row.id} />
                            <input type="hidden" name="active" value={row.active ? "false" : "true"} />
                            <ConfirmSubmit
                              className={row.active ? "row-link danger" : "row-link"}
                              message={
                                row.active
                                  ? `Nonaktifkan ${row.fleet_code}? Data bus dan riwayat penugasan tetap tersimpan.`
                                  : `Aktifkan kembali ${row.fleet_code}?`
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
              <h2 className="panel-title">{editing ? "Ubah data bus" : "Tambah bus"}</h2>
              <div className="panel-subtitle">
                {editing ? `Memperbarui ${editing.fleet_code}` : "Data langsung tersimpan"}
              </div>
            </div>
          </header>
          <div className="form-body">
            <RecordForm
              key={editing?.id ?? "new"}
              action={saveBus}
              fields={fields}
              hidden={{ id: editing?.id ?? "" }}
              submitLabel={editing ? "Simpan perubahan" : "Tambah bus"}
              note="Menonaktifkan bus tidak menghapus data atau riwayat penugasan yang sudah tercatat."
              secondary={editing ? { href: listHref(path, baseQuery), label: "Batal" } : undefined}
            />
          </div>
        </aside>
      </div>
    </>
  );
}
