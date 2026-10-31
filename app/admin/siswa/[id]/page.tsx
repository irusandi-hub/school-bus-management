import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RecordForm, type FieldDef } from "@/components/admin/RecordForm";
import { ConfigNotice, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { adminReadContext } from "@/lib/admin/read";
import type { StatusHistoryRow, StudentRow } from "@/lib/types";
import {
  formatDate,
  formatDateTime,
  serviceStatusLabel,
  serviceStatusOptions,
} from "@/lib/validation";
import { changeStudentServiceStatus } from "../actions";

export const metadata: Metadata = { title: "Detail Siswa | Admin Pusat" };

const selectColumns =
  "id, admissions_number, full_name, date_of_birth, school_id, guardian_id, home_address, home_latitude, home_longitude, pickup_notes, service_status, service_status_changed_at, schools(name), guardians(full_name, email, phone)";

function statusTone(status: string) {
  if (status === "active") return "success" as const;
  if (status === "paused") return "warning" as const;
  return "neutral" as const;
}

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const { data } = await supabase.from("students").select(selectColumns).eq("id", id).maybeSingle();
  const student = data as unknown as StudentRow | null;

  if (!student) notFound();

  const { data: historyData, error: historyError } = await supabase
    .from("student_service_status_history")
    .select("id, student_id, previous_status, new_status, reason, changed_at, profiles(full_name)")
    .eq("student_id", id)
    .order("changed_at", { ascending: false });

  const history = (historyData ?? []) as unknown as StatusHistoryRow[];

  const statusFields: FieldDef[] = [
    {
      name: "status",
      label: "Status layanan baru",
      type: "select",
      required: true,
      defaultValue: student.service_status,
      options: serviceStatusOptions.map((option) => ({ value: option.value, label: option.label })),
    },
    {
      name: "reason",
      label: "Alasan perubahan",
      type: "textarea",
      required: true,
      fullWidth: true,
      maxLength: 300,
      placeholder: "Contoh: permintaan wali, siswa pindah sekolah, atau layanan dihentikan per tanggal tertentu.",
      help: "Alasan disimpan pada riwayat dan tidak dapat dihapus. Jangan menuliskan data pribadi yang tidak diperlukan.",
    },
  ];

  const coordinates =
    student.home_latitude !== null && student.home_longitude !== null
      ? `${student.home_latitude}, ${student.home_longitude}`
      : "Belum diisi";

  return (
    <>
      <div className="breadcrumb">
        <Link href="/admin/siswa">‹ Kembali ke Data Siswa</Link>
      </div>

      <PageHeader
        title={student.full_name}
        description={`Admissions Number ${student.admissions_number}`}
        actions={
          <Link className="btn btn-secondary" href={`/admin/siswa?edit=${student.id}`}>
            Ubah data siswa
          </Link>
        }
      />

      <div className="detail-grid">
        <section className="panel detail-panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Informasi siswa</h2>
              <div className="panel-subtitle">Data master dan relasi wali</div>
            </div>
          </header>
          <dl className="detail-list">
            <div>
              <dt>Sekolah</dt>
              <dd>{student.schools?.name ?? "Belum ditetapkan"}</dd>
            </div>
            <div>
              <dt>Wali</dt>
              <dd>{student.guardians?.full_name ?? "Belum ditetapkan"}</dd>
            </div>
            <div>
              <dt>Email wali</dt>
              <dd>{student.guardians?.email ?? "—"}</dd>
            </div>
            <div>
              <dt>Telepon wali</dt>
              <dd>{student.guardians?.phone ?? "—"}</dd>
            </div>
            <div>
              <dt>Tanggal lahir</dt>
              <dd>{formatDate(student.date_of_birth)}</dd>
            </div>
            <div>
              <dt>Alamat rumah</dt>
              <dd>{student.home_address ?? "Belum diisi"}</dd>
            </div>
            <div>
              <dt>Koordinat rumah</dt>
              <dd>{coordinates}</dd>
            </div>
            <div>
              <dt>Catatan titik jemput</dt>
              <dd>{student.pickup_notes ?? "Belum diisi"}</dd>
            </div>
          </dl>
          <p className="detail-footnote">
            Koordinat rumah merupakan data privat. Wali hanya dapat melihat data siswa yang terhubung dan masih
            memiliki layanan aktif.
          </p>
        </section>

        <section className="panel detail-panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Status layanan</h2>
              <div className="panel-subtitle">Perubahan status selalu memerlukan alasan</div>
            </div>
            <Pill tone={statusTone(student.service_status)}>{serviceStatusLabel(student.service_status)}</Pill>
          </header>

          <div className="status-summary">
            <span>
              Diperbarui <strong>{formatDateTime(student.service_status_changed_at)}</strong>
            </span>
            <p>
              Status layanan berbeda dari kehadiran perjalanan dan status GPS. Menonaktifkan layanan tidak menghapus data
              siswa, relasi wali, atau riwayat.
            </p>
          </div>

          <div className="form-body">
            <RecordForm
              key={student.service_status}
              action={changeStudentServiceStatus}
              fields={statusFields}
              hidden={{ student_id: student.id }}
              submitLabel="Simpan status layanan"
              confirmMessage="Ubah status layanan siswa ini? Perubahan akan tercatat pada riwayat dan tidak dapat dihapus."
              note="Akses akun wali mengikuti status ini: minimal satu siswa harus aktif agar akun dapat digunakan."
            />
          </div>
        </section>
      </div>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Riwayat status layanan</h2>
            <div className="panel-subtitle">Catatan tetap, tidak dapat diubah atau dihapus</div>
          </div>
        </header>

        {historyError && <div className="form-body"><Notice kind="error">Riwayat status belum dapat dimuat.</Notice></div>}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Waktu</th>
                <th scope="col">Perubahan</th>
                <th scope="col">Alasan</th>
                <th scope="col">Dicatat oleh</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="table-empty">
                      <strong>Belum ada riwayat status</strong>
                      <p>Riwayat akan tercatat otomatis setelah status layanan diubah pertama kali.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDateTime(entry.changed_at)}</td>
                    <td>
                      {entry.previous_status ? `${serviceStatusLabel(entry.previous_status)} → ` : "Awal → "}
                      {serviceStatusLabel(entry.new_status)}
                    </td>
                    <td>{entry.reason}</td>
                    <td>{entry.profiles?.full_name ?? "Tidak tercatat"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
