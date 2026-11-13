import Link from "next/link";
import { AdminCopy } from "@/components/i18n/AdminCopy";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { RecordForm, type FieldDef } from "@/components/admin/RecordForm";
import { Breadcrumbs, ConfigNotice, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { adminReadContext } from "@/lib/admin/read";
import { getRequestLocale } from "@/lib/i18n/server";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";
import { getProjectAreaContext, loadProjectAreaScope } from "@/lib/project-areas/context";
import type { StatusHistoryRow, StudentRow } from "@/lib/types";
import {
  formatDate,
  formatDateTime,
  routeDirectionLabel,
  serviceStatusLabel,
  serviceStatusOptions,
} from "@/lib/validation";
import { changeStudentServiceStatus } from "../actions";
import { assignStudentToStop, removeStudentFromRoute } from "../../rute/actions";

export const metadata: Metadata = { title: "Detail Siswa | Pengelola" };

const selectColumns =
  "id, admissions_number, full_name, date_of_birth, school_id, guardian_id, home_address, home_latitude, home_longitude, pickup_notes, service_status, service_status_changed_at, schools(name), guardians(full_name, email, phone)";

function statusTone(status: string) {
  if (status === "active") return "success" as const;
  if (status === "paused") return "warning" as const;
  return "neutral" as const;
}

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getRequestLocale();
  const c = (value: string) => translateAdminCopy(value, locale) ?? value;
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const areaContext = await getProjectAreaContext(supabase);
  const scope = await loadProjectAreaScope(supabase, areaContext.selectedId);

  let studentQuery = supabase.from("students").select(selectColumns).eq("id", id);
  if (areaContext.selectedId) studentQuery = studentQuery.in("school_id", scope.schoolIds);
  const { data } = await studentQuery.maybeSingle();
  const student = data as unknown as StudentRow | null;

  if (!student) notFound();

  const { data: historyData, error: historyError } = await supabase
    .from("student_service_status_history")
    .select("id, student_id, previous_status, new_status, reason, changed_at, profiles(full_name)")
    .eq("student_id", id)
    .order("changed_at", { ascending: false });

  const history = (historyData ?? []) as unknown as StatusHistoryRow[];

  const [placementsResult, allStopsResult] = await Promise.all([
    supabase
      .from("student_route_stops")
      .select("id, student_id, route_id, stop_id, direction, active, route_stops(stop_name, stop_order), routes(route_name)")
      .eq("student_id", id)
      .eq("active", true),
    areaContext.selectedId
      ? supabase
          .from("route_stops")
          .select("id, stop_name, stop_order, route_id, routes(route_name)")
          .in("route_id", scope.routeIds)
          .order("stop_order", { ascending: true })
      : supabase
          .from("route_stops")
          .select("id, stop_name, stop_order, route_id, routes(route_name)")
          .order("stop_order", { ascending: true }),
  ]);

  const placements = (placementsResult.data ?? []) as unknown as {
    id: string;
    direction: string;
    route_stops: { stop_name: string; stop_order: number } | null;
    routes: { route_name: string } | null;
  }[];
  const allStops = (allStopsResult.data ?? []) as unknown as {
    id: string;
    stop_name: string;
    stop_order: number;
    routes: { route_name: string } | null;
  }[];

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
      <Breadcrumbs
        items={[
          { href: "/admin", label: "Ringkasan" },
          { href: "/admin/siswa", label: "Data siswa" },
          { label: student.full_name },
        ]}
      />

      <PageHeader
        title={student.full_name}
        description={`${c("Nomor induk siswa")} ${student.admissions_number}`}
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
              <dt><AdminCopy value="Sekolah" /></dt>
              <dd>{student.schools?.name ?? "Belum ditetapkan"}</dd>
            </div>
            <div>
              <dt><AdminCopy value="Wali" /></dt>
              <dd>{student.guardians?.full_name ?? "Belum ditetapkan"}</dd>
            </div>
            <div>
              <dt><AdminCopy value="Email wali" /></dt>
              <dd>{student.guardians?.email ?? "—"}</dd>
            </div>
            <div>
              <dt><AdminCopy value="Telepon wali" /></dt>
              <dd>{student.guardians?.phone ?? "—"}</dd>
            </div>
            <div>
              <dt><AdminCopy value="Tanggal lahir" /></dt>
              <dd>{formatDate(student.date_of_birth)}</dd>
            </div>
            <div>
              <dt><AdminCopy value="Alamat rumah" /></dt>
              <dd>{student.home_address ?? "Belum diisi"}</dd>
            </div>
            <div>
              <dt><AdminCopy value="Koordinat rumah" /></dt>
              <dd>{coordinates}</dd>
            </div>
            <div>
              <dt><AdminCopy value="Catatan titik jemput" /></dt>
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
              <h2 className="panel-title"><AdminCopy value="Status layanan" /></h2>
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

      <section className="panel route-placements">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Rute &amp; titik jemput</h2>
            <div className="panel-subtitle">
              Menentukan urutan titik dan daftar siswa pada perjalanan pengemudi
            </div>
          </div>
          <Pill tone={placements.length > 0 ? "success" : "warning"}>
            {placements.length > 0 ? "Sudah ditempatkan" : "Belum ditempatkan"}
          </Pill>
        </header>

        <div className="admin-table-wrap">
          <table className="admin-table admin-table-compact">
            <thead>
              <tr>
                <th scope="col"><AdminCopy value="Arah" /></th>
                <th scope="col"><AdminCopy value="Rute" /></th>
                <th scope="col"><AdminCopy value="Titik" /></th>
                <th scope="col"><AdminCopy value="Tindakan" /></th>
              </tr>
            </thead>
            <tbody>
              {placements.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="table-empty">
                      <strong><AdminCopy value="Siswa belum ditempatkan pada rute" /></strong>
                      <p>
                        Tanpa penempatan, siswa tidak muncul pada daftar jemput pengemudi dan riwayat perjalanan wali.
                        Pilih titik jemput di bawah.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                placements.map((placement) => (
                  <tr key={placement.id}>
                    <td>{routeDirectionLabel(placement.direction)}</td>
                    <td>{placement.routes?.route_name ?? "—"}</td>
                    <td>
                      {placement.route_stops?.stop_order}. {placement.route_stops?.stop_name}
                    </td>
                    <td>
                      <form action={removeStudentFromRoute}>
                        <input type="hidden" name="id" value={placement.id} />
                        <input type="hidden" name="return_to" value={`/admin/siswa/${student.id}`} />
                        <ConfirmSubmit message="Keluarkan siswa dari rute aktif ini? Riwayat penempatan tetap tersimpan.">
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

        <form className="inline-form roster-form" action={assignStudentToStop}>
          <input type="hidden" name="student_id" value={student.id} />
          <input type="hidden" name="return_to" value={`/admin/siswa/${student.id}`} />
          <label>
            Titik jemput
            <select name="stop_id" required defaultValue="">
              <option value="" disabled>
                {allStops.length === 0 ? "Belum ada titik jemput pada rute mana pun" : "Pilih titik jemput"}
              </option>
              {allStops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.routes?.route_name ?? "Rute"} · {stop.stop_order}. {stop.stop_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Arah
            <select name="direction" defaultValue="morning">
              <option value="morning">Pagi</option>
              <option value="afternoon">Sore</option>
            </select>
          </label>
          <button className="btn btn-primary" type="submit" disabled={allStops.length === 0}>
            Simpan penempatan
          </button>
          {allStops.length === 0 && (
            <p className="form-note roster-form-note" role="status">
              Penempatan dapat disimpan setelah Pengelola menambahkan titik jemput pada rute yang sesuai.
            </p>
          )}
        </form>
        <p className="detail-footnote">
          Satu siswa hanya memiliki satu titik aktif per arah. Memilih titik baru pada arah yang sama akan memindahkan
          penempatan sebelumnya tanpa menghapus riwayatnya.
        </p>
      </section>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title"><AdminCopy value="Riwayat status layanan" /></h2>
            <div className="panel-subtitle">Catatan tetap, tidak dapat diubah atau dihapus</div>
          </div>
        </header>

        {historyError && <div className="form-body"><Notice kind="error">Riwayat status belum dapat dimuat.</Notice></div>}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col"><AdminCopy value="Waktu" /></th>
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
