import type { Metadata } from "next";
import { RecordForm, type FieldDef } from "@/components/admin/RecordForm";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { firstParam, noticeFromParams } from "@/lib/admin/query";
import { operatorReadContext } from "@/lib/operator/read";
import type { BusRow } from "@/lib/types";
import { saveOperatorBus } from "../actions";

export const metadata: Metadata = { title: "Armada | Pengelola" };

const selectColumns = "id, fleet_code, plate_number, capacity, model, notes, operator_id, active";

export default async function OperatorBusesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await operatorReadContext();
  if (!supabase) return <ConfigNotice />;

  const notice = noticeFromParams(params);
  const { data, error } = await supabase
    .from("buses")
    .select(selectColumns)
    .order("fleet_code", { ascending: true });

  const buses = (data ?? []) as unknown as BusRow[];
  const editId = firstParam(params.edit);
  const editing = editId ? buses.find((bus) => bus.id === editId) : undefined;

  const fields: FieldDef[] = [
    {
      name: "fleet_code",
      label: "Kode armada",
      required: true,
      maxLength: 32,
      defaultValue: editing?.fleet_code ?? "",
      placeholder: "BUS-001",
      help: "Kode unik armada organisasi Anda.",
    },
    {
      name: "plate_number",
      label: "Nomor polisi",
      maxLength: 20,
      defaultValue: editing?.plate_number ?? "",
    },
    {
      name: "capacity",
      label: "Kapasitas kursi",
      type: "number",
      required: true,
      min: "1",
      max: "100",
      defaultValue: editing?.capacity ?? 30,
    },
    {
      name: "model",
      label: "Model bus",
      maxLength: 80,
      defaultValue: editing?.model ?? "",
    },
    {
      name: "notes",
      label: "Catatan",
      type: "textarea",
      fullWidth: true,
      maxLength: 300,
      defaultValue: editing?.notes ?? "",
    },
    {
      name: "active",
      label: "Bus aktif dan dapat ditugaskan",
      type: "checkbox",
      defaultValue: editing ? editing.active : true,
    },
  ];

  return (
    <>
      <PageHeader
        title="Armada bus"
        description="Bus yang Anda tambahkan otomatis menjadi milik organisasi Anda. Bus organisasi lain tidak dapat dilihat atau diubah dari area ini."
      />

      {error && <Notice kind="error">Daftar armada belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>}
      {notice && <Notice kind={notice.kind}>{notice.message}</Notice>}

      <div className="admin-split">
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Daftar armada</h2>
              <div className="panel-subtitle">{buses.length} bus pada organisasi Anda</div>
            </div>
          </header>
          <div className="admin-table-wrap">
            <table className="admin-table table-stack">
              <thead>
                <tr>
                  <th scope="col">Armada</th>
                  <th scope="col">Kapasitas</th>
                  <th scope="col">Status</th>
                  <th scope="col">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {buses.length === 0 ? (
                  <EmptyRow
                    colSpan={4}
                    title="Belum ada bus"
                    detail="Tambahkan bus pertama melalui formulir di samping sebelum membuat penugasan."
                  />
                ) : (
                  buses.map((bus) => (
                    <tr key={bus.id}>
                      <td data-label="Armada">
                        <strong>{bus.fleet_code}</strong>
                        <small>{bus.plate_number ?? "Nomor polisi belum diisi"}{bus.model ? ` · ${bus.model}` : ""}</small>
                      </td>
                      <td data-label="Kapasitas">{bus.capacity} kursi</td>
                      <td data-label="Status">
                        <Pill tone={bus.active ? "success" : "neutral"}>{bus.active ? "Aktif" : "Nonaktif"}</Pill>
                      </td>
                      <td data-label="Tindakan">
                        <a className="row-link" href={`/operator/bus?edit=${bus.id}`}>
                          Ubah
                        </a>
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
              <h2 className="panel-title">{editing ? "Ubah bus" : "Tambah bus"}</h2>
              <div className="panel-subtitle">Organisasi ditentukan otomatis oleh akun Anda</div>
            </div>
          </header>
          <div className="form-body">
            <RecordForm
              key={editing?.id ?? "new"}
              action={saveOperatorBus}
              fields={fields}
              hidden={editing ? { id: editing.id } : undefined}
              submitLabel={editing ? "Simpan perubahan" : "Tambah bus"}
              secondary={editing ? { href: "/operator/bus", label: "Batalkan" } : undefined}
            />
          </div>
        </section>
      </div>
    </>
  );
}
