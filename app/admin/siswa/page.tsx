import Link from "next/link";
import { AdminCopy } from "@/components/i18n/AdminCopy";
import type { Metadata } from "next";
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
import type { StudentRow } from "@/lib/types";
import { sanitizeSearch, serviceStatusLabel } from "@/lib/validation";
import { saveStudent } from "./actions";

export const metadata: Metadata = { title: "Data Siswa | Operator" };

const path = "/admin/siswa";
const selectColumns =
  "id, admissions_number, full_name, date_of_birth, school_id, guardian_id, home_address, home_latitude, home_longitude, pickup_notes, service_status, service_status_changed_at, schools(name), guardians(full_name, email, phone)";

function statusTone(status: string) {
  if (status === "active") return "success" as const;
  if (status === "paused") return "warning" as const;
  return "neutral" as const;
}

export default async function SiswaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const q = sanitizeSearch(firstParam(params.q));
  const status = firstParam(params.status);
  const schoolFilter = firstParam(params.sekolah);
  const editId = firstParam(params.edit);
  const page = parsePage(params.page);
  const { from, to } = pageRange(page);
  const areaContext = await getProjectAreaContext(supabase);
  const scope = await loadProjectAreaScope(supabase, areaContext.selectedId);
  const selectedId = areaContext.selectedId;

  let schoolQuery = supabase.from("schools").select("id, name, active").order("name", { ascending: true });
  if (selectedId) schoolQuery = schoolQuery.eq("project_area_id", selectedId);
  const { data: schoolRows } = await schoolQuery;
  const schools = (schoolRows ?? []) as { id: string; name: string; active: boolean }[];

  let query = supabase
    .from("students")
    .select(selectColumns, { count: "exact" })
    .order("full_name", { ascending: true })
    .range(from, to);

  if (q) query = query.or(`full_name.ilike.%${q}%,admissions_number.ilike.%${q}%`);
  if (status) query = query.eq("service_status", status);
  if (schoolFilter) query = query.eq("school_id", schoolFilter);
  if (selectedId) query = query.in("school_id", scope.schoolIds);

  const { data, count, error } = await query;
  const rows = (data ?? []) as unknown as StudentRow[];
  const total = count ?? 0;

  let editing: StudentRow | null = null;
  if (editId) {
    let editQuery = supabase.from("students").select(selectColumns).eq("id", editId);
    if (selectedId) editQuery = editQuery.in("school_id", scope.schoolIds);
    const { data: editRow } = await editQuery.maybeSingle();
    editing = (editRow as unknown as StudentRow | null) ?? null;
  }

  const { data: guardianRows } = await supabase
    .from("guardians")
    .select("id, full_name, email, active")
    .order("full_name", { ascending: true });
  const allGuardians = (guardianRows ?? []) as { id: string; full_name: string; email: string; active: boolean }[];
  const { data: allLinks } = await supabase.from("students").select("guardian_id");
  const attachedGuardians = new Set(
    ((allLinks ?? []) as { guardian_id: string | null }[]).map((row) => row.guardian_id).filter(Boolean) as string[],
  );
  const guardians = selectedId
    ? allGuardians.filter((guardian) => scope.guardianIds.includes(guardian.id) || !attachedGuardians.has(guardian.id))
    : allGuardians;

  const schoolOptions = schools
    .filter((school) => school.active || school.id === editing?.school_id)
    .map((school) => ({ value: school.id, label: school.active ? school.name : `${school.name} (nonaktif)` }));
  const guardianOptions = guardians
    .filter((guardian) => guardian.active || guardian.id === editing?.guardian_id)
    .map((guardian) => ({
      value: guardian.id,
      label: `${guardian.full_name} — ${guardian.email}${guardian.active ? "" : " (nonaktif)"}`,
    }));

  const canCreate = schoolOptions.length > 0 && guardianOptions.length > 0;
  const notice = noticeFromParams(params);
  const baseQuery = { q, status: status || undefined, sekolah: schoolFilter || undefined };

  const fields: FieldDef[] = [
    {
      name: "admissions_number",
      label: "Nomor induk siswa",
      required: true,
      maxLength: 32,
      defaultValue: editing?.admissions_number,
      placeholder: "ADM-2026-001",
      help: "Identitas siswa yang unik. Bukan username dan bukan kredensial login.",
    },
    {
      name: "full_name",
      label: "Nama lengkap siswa",
      required: true,
      maxLength: 120,
      defaultValue: editing?.full_name,
    },
    {
      name: "date_of_birth",
      label: "Tanggal lahir",
      type: "date",
      defaultValue: editing?.date_of_birth,
    },
    {
      name: "school_id",
      label: "Sekolah",
      type: "select",
      required: true,
      defaultValue: editing?.school_id ?? "",
      options: [
        { value: "", label: schoolOptions.length === 0 ? "Belum ada sekolah aktif" : "Pilih sekolah" },
        ...schoolOptions,
      ],
    },
    {
      name: "guardian_id",
      label: "Wali",
      type: "select",
      required: true,
      fullWidth: true,
      defaultValue: editing?.guardian_id ?? "",
      options: [
        { value: "", label: guardianOptions.length === 0 ? "Belum ada wali aktif" : "Pilih wali" },
        ...guardianOptions,
      ],
      help: "Satu siswa hanya memiliki satu wali. Satu akun wali dapat terhubung ke beberapa siswa.",
    },
    {
      name: "home_address",
      label: "Alamat rumah",
      type: "textarea",
      fullWidth: true,
      maxLength: 400,
      defaultValue: editing?.home_address,
    },
    {
      name: "home_latitude",
      label: "Lintang rumah",
      type: "number",
      step: "0.000001",
      defaultValue: editing?.home_latitude,
      help: "Data privat. Hanya dapat dikelola Operator; wali hanya melihat siswa yang terhubung ke akunnya.",
    },
    {
      name: "home_longitude",
      label: "Bujur rumah",
      type: "number",
      step: "0.000001",
      defaultValue: editing?.home_longitude,
      help: "Isi bersama lintang, atau kosongkan keduanya.",
    },
    {
      name: "pickup_notes",
      label: "Catatan titik jemput",
      type: "textarea",
      fullWidth: true,
      maxLength: 300,
      defaultValue: editing?.pickup_notes,
      placeholder: "Contoh: gerbang samping, jemput pukul 06.15",
    },
  ];

  return (
    <>
      <PageHeader
        title="Data Siswa"
        description="Kelola siswa, sekolah, wali, dan titik jemput. Ubah status layanan melalui detail siswa."
      />

      <ProjectAreaTabs areas={areaContext.activeAreas} selectedId={selectedId} nextPath={path} compact />

      {notice && <Notice kind={notice.kind}>{notice.message}</Notice>}
      {error && <Notice kind="error">Daftar siswa belum dapat dimuat. Coba lagi.</Notice>}
      {!canCreate && (
        <Notice kind="warning">
          Data siswa belum dapat ditambahkan karena belum ada {schoolOptions.length === 0 ? "sekolah" : "wali"} aktif.{" "}
          {schoolOptions.length === 0 ? (
            <Link href="/admin/sekolah">Tambahkan sekolah terlebih dahulu</Link>
          ) : (
            <Link href="/admin/wali">Daftarkan email wali terlebih dahulu</Link>
          )}
          .
        </Notice>
      )}

      <div className="admin-split">
        <section className="panel">
          <ListToolbar
            key={`${q}|${status}|${schoolFilter}|${page}`}
            action={path}
            q={q}
            placeholder="Cari nama atau Nomor induk siswa"
            total={total}
            resetHref={path}
            filters={
              <>
                <select name="sekolah" defaultValue={schoolFilter} aria-label="Filter sekolah">
                  <option value="">Semua sekolah</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
                <select name="status" defaultValue={status} aria-label="Filter status layanan">
                  <option value="">Semua status</option>
                  <option value="active">Aktif</option>
                  <option value="paused">Sementara tidak aktif</option>
                  <option value="ended">Dihentikan</option>
                </select>
              </>
            }
          />

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col"><AdminCopy value="Nomor induk siswa" /></th>
                  <th scope="col"><AdminCopy value="Nama siswa" /></th>
                  <th scope="col"><AdminCopy value="Sekolah" /></th>
                  <th scope="col"><AdminCopy value="Wali" /></th>
                  <th scope="col"><AdminCopy value="Status layanan" /></th>
                  <th scope="col"><AdminCopy value="Tindakan" /></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <EmptyRow
                    colSpan={6}
                    title={q || status || schoolFilter ? "Tidak ada siswa yang cocok" : "Belum ada data siswa"}
                    detail={
                      q || status || schoolFilter
                        ? "Ubah kata kunci atau filter, lalu terapkan kembali."
                        : "Tambahkan siswa pertama melalui formulir di samping setelah sekolah dan wali tersedia."
                    }
                  />
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <code>{row.admissions_number}</code>
                      </td>
                      <td>
                        <strong>{row.full_name}</strong>
                      </td>
                      <td>{row.schools?.name ?? "Belum ditetapkan"}</td>
                      <td>
                        {row.guardians?.full_name ?? "Belum ditetapkan"}
                        <small>{row.guardians?.email ?? "—"}</small>
                      </td>
                      <td>
                        <Pill tone={statusTone(row.service_status)}>{serviceStatusLabel(row.service_status)}</Pill>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Link className="row-link" href={`/admin/siswa/${row.id}`}>
                            Detail &amp; status
                          </Link>
                          <Link className="row-link" href={listHref(path, { ...baseQuery, page, edit: row.id })}>
                            Ubah
                          </Link>
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
              <h2 className="panel-title">{editing ? "Ubah data siswa" : "Tambah siswa"}</h2>
              <div className="panel-subtitle">
                {editing ? `Memperbarui ${editing.full_name}` : "Data langsung tersimpan"}
              </div>
            </div>
          </header>
          <div className="form-body">
            <RecordForm
              key={editing?.id ?? "new"}
              action={saveStudent}
              fields={fields}
              hidden={{ id: editing?.id ?? "" }}
              submitLabel={editing ? "Simpan perubahan" : "Tambah siswa"}
              disabledReason={
                canCreate
                  ? undefined
                  : `Formulir aktif setelah ada ${schoolOptions.length === 0 ? "sekolah" : "wali"} aktif. Lengkapi data tersebut agar relasi siswa dan akses wali dapat ditetapkan dengan benar.`
              }
              note={
                editing
                  ? "Status layanan tidak diubah dari formulir ini agar riwayat dan alasannya tetap tercatat."
                  : "Siswa baru dibuat dengan status layanan aktif. Perubahan status dan alasannya dicatat pada riwayat."
              }
              secondary={editing ? { href: listHref(path, baseQuery), label: "Batal" } : undefined}
            />
          </div>
        </aside>
      </div>
    </>
  );
}
