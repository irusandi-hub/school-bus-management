import type { Metadata } from "next";
import { RecordForm, type FieldDef } from "@/components/admin/RecordForm";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { firstParam, noticeFromParams } from "@/lib/admin/query";
import { operatorReadContext } from "@/lib/operator/read";
import type { DriverRow } from "@/lib/types";
import { saveOperatorDriver } from "../actions";

export const metadata: Metadata = { title: "Pengemudi | Operator" };

const selectColumns = "id, full_name, phone, license_number, operator_id, profile_id, active";

export default async function OperatorDriversPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await operatorReadContext();
  if (!supabase) return <ConfigNotice />;

  const notice = noticeFromParams(params);
  const { data, error } = await supabase
    .from("drivers")
    .select(selectColumns)
    .order("full_name", { ascending: true });

  const drivers = (data ?? []) as unknown as DriverRow[];
  const editId = firstParam(params.edit);
  const editing = editId ? drivers.find((driver) => driver.id === editId) : undefined;

  const fields: FieldDef[] = [
    {
      name: "full_name",
      label: "Nama lengkap",
      required: true,
      maxLength: 120,
      defaultValue: editing?.full_name ?? "",
    },
    {
      name: "phone",
      label: "Nomor telepon",
      type: "tel",
      maxLength: 20,
      defaultValue: editing?.phone ?? "",
      placeholder: "+9665xxxxxxxx",
    },
    {
      name: "license_number",
      label: "Nomor SIM",
      maxLength: 40,
      defaultValue: editing?.license_number ?? "",
    },
    {
      name: "active",
      label: "Pengemudi aktif dan dapat ditugaskan",
      type: "checkbox",
      defaultValue: editing ? editing.active : true,
    },
  ];

  return (
    <>
      <PageHeader
        title="Pengemudi"
        description="Pengemudi yang terdaftar di sini hanya dapat ditugaskan oleh organisasi Anda. Akun login pengemudi ditautkan oleh pengelola."
      />

      {error && <Notice kind="error">Daftar pengemudi belum dapat dimuat.</Notice>}
      {notice && <Notice kind={notice.kind}>{notice.message}</Notice>}

      <div className="admin-split">
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Daftar pengemudi</h2>
              <div className="panel-subtitle">{drivers.length} pengemudi pada organisasi Anda</div>
            </div>
          </header>
          <div className="admin-table-wrap">
            <table className="admin-table table-stack">
              <thead>
                <tr>
                  <th scope="col">Pengemudi</th>
                  <th scope="col">SIM</th>
                  <th scope="col">Status</th>
                  <th scope="col">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {drivers.length === 0 ? (
                  <EmptyRow
                    colSpan={4}
                    title="Belum ada pengemudi"
                    detail="Tambahkan pengemudi melalui formulir di samping. Akun login ditautkan pengelola agar pengemudi dapat melihat tugas."
                  />
                ) : (
                  drivers.map((driver) => (
                    <tr key={driver.id}>
                      <td data-label="Pengemudi">
                        <strong>{driver.full_name}</strong>
                        <small>{driver.phone ?? "Telepon belum diisi"}</small>
                      </td>
                      <td data-label="SIM">{driver.license_number ?? "—"}</td>
                      <td data-label="Status">
                        <Pill tone={driver.active ? "success" : "neutral"}>{driver.active ? "Aktif" : "Nonaktif"}</Pill>
                        {!driver.profile_id && <small>Akun login belum ditautkan</small>}
                      </td>
                      <td data-label="Tindakan">
                        <a className="row-link" href={`/operator/pengemudi?edit=${driver.id}`}>
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
              <h2 className="panel-title">{editing ? "Ubah pengemudi" : "Tambah pengemudi"}</h2>
              <div className="panel-subtitle">Organisasi ditentukan otomatis oleh akun Anda</div>
            </div>
          </header>
          <div className="form-body">
            <RecordForm
              key={editing?.id ?? "new"}
              action={saveOperatorDriver}
              fields={fields}
              hidden={editing ? { id: editing.id } : undefined}
              submitLabel={editing ? "Simpan perubahan" : "Tambah pengemudi"}
              secondary={editing ? { href: "/operator/pengemudi", label: "Batalkan" } : undefined}
              note="Penautan akun login pengemudi dilakukan pengelola agar pemilihan peran tidak dapat dilakukan sendiri."
            />
          </div>
        </section>
      </div>
    </>
  );
}
