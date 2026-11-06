import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, Notice, PageHeader, Pill, StatCard } from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";
import { adminReadContext } from "@/lib/admin/read";
import { formatDate } from "@/lib/validation";

export const metadata: Metadata = { title: "Ringkasan | Admin Pusat" };

function localToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export default async function AdminHomePage() {
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const date = localToday();

  // Every figure below is a real database count. With an empty database the values are
  // genuinely 0 rather than placeholder data.
  const [
    schoolRows,
    operatorRows,
    studentRows,
    activeStudentRows,
    busRows,
    driverRows,
    guardianRows,
    pendingGuardianRows,
    routeRows,
    assignmentRows,
  ] = await Promise.all([
    supabase.from("schools").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("operators").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("service_status", "active"),
    supabase.from("buses").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("drivers").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("guardians").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("guardians").select("id", { count: "exact", head: true }).eq("active", true).is("profile_id", null),
    supabase.from("routes").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("trip_assignments").select("id, trips(id, status)").eq("service_date", date),
  ]);

  const schools = schoolRows.count ?? 0;
  const operators = operatorRows.count ?? 0;
  const students = studentRows.count ?? 0;
  const activeStudents = activeStudentRows.count ?? 0;
  const buses = busRows.count ?? 0;
  const drivers = driverRows.count ?? 0;
  const guardians = guardianRows.count ?? 0;
  const pendingGuardians = pendingGuardianRows.count ?? 0;
  const routes = routeRows.count ?? 0;

  const assignments = (assignmentRows.data ?? []) as unknown as {
    id: string;
    trips?: { id: string; status: string }[] | null;
  }[];
  const trips = assignments.flatMap((assignment) => assignment.trips ?? []);
  const running = trips.filter((trip) => trip.status === "in_progress").length;
  const completed = trips.filter((trip) => trip.status === "completed").length;
  const waiting = assignments.length - running - completed;

  const pausedOrEnded = Math.max(students - activeStudents, 0);

  const shortcuts = [
    { href: "/admin/sekolah", label: "Sekolah", note: "Tambah, ubah, nonaktifkan", icon: "school" },
    { href: "/admin/operator", label: "Operator", note: "Perusahaan transportasi", icon: "operator" },
    { href: "/admin/siswa", label: "Data siswa", note: "Identitas, wali, titik rumah", icon: "students" },
    { href: "/admin/wali", label: "Akun wali", note: "Pra-pendaftaran email wali", icon: "guardian" },
    { href: "/admin/bus", label: "Bus", note: "Armada dan kapasitas", icon: "bus" },
    { href: "/admin/pengemudi", label: "Pengemudi", note: "Data pengemudi & operator", icon: "driver" },
    { href: "/admin/rute", label: "Rute", note: "Urutan titik jemput", icon: "route" },
    { href: "/admin/penugasan", label: "Penugasan", note: "Jadwal pengemudi dan bus", icon: "assignment" },
    { href: "/admin/laporan", label: "Laporan", note: "Rekap dan ekspor data", icon: "report" },
  ];

  return (
    <>
      <PageHeader
        title="Ringkasan data"
        description="Angka di bawah ini berasal langsung dari database. Belum ada data contoh: nilai 0 berarti memang belum ada catatan."
        actions={<Pill tone="info">{formatDate(date)}</Pill>}
      />

      <section className="stats" aria-label="Ringkasan data induk">
        <StatCard label="Sekolah aktif" value={schools} note="Terhubung ke layanan bus" icon="school" />
        <StatCard label="Operator aktif" value={operators} note="Perusahaan transportasi" icon="operator" />
        <StatCard
          label="Siswa layanan aktif"
          value={activeStudents}
          note={`${students} siswa tercatat seluruhnya`}
          icon="students"
        />
        <StatCard label="Bus aktif" value={buses} note={`${drivers} pengemudi aktif`} icon="bus" />
      </section>

      <div className="admin-overview-grid">
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Operasional hari ini</h2>
              <div className="panel-subtitle">Status penugasan dan perjalanan pada {formatDate(date)}</div>
            </div>
            <Pill tone={running > 0 ? "info" : assignments.length > 0 ? "warning" : "neutral"}>
              {assignments.length} penugasan
            </Pill>
          </header>
          <div className="stats stats-3" style={{ padding: 16, margin: 0 }}>
            <StatCard label="Berlangsung" value={running} note="Perjalanan aktif" icon="trip" tone="live" />
            <StatCard label="Menunggu" value={waiting} note="Belum dimulai" icon="clock" tone="wait" />
            <StatCard label="Selesai" value={completed} note="Ditutup pengemudi" icon="check" tone="done" />
          </div>
          {assignments.length === 0 ? (
            <div style={{ padding: "0 20px 18px" }}>
              <p className="ops-note">
                Belum ada penugasan untuk hari ini. Buat penugasan agar pengemudi menerima tugas dan perjalanan dapat
                dipantau. Lihat <Link className="row-link" href="/admin/penugasan">penugasan</Link> atau{" "}
                <Link className="row-link" href="/admin/rute">rute aktif</Link> ({routes} rute).
              </p>
            </div>
          ) : (
            <div style={{ padding: "0 20px 18px" }}>
              <p className="ops-note">
                {running > 0
                  ? `${running} perjalanan sedang berjalan. Status berasal dari catatan pengemudi, bukan perkiraan posisi GPS (belum aktif).`
                  : "Semua penugasan hari ini belum dimulai pengemudi. Status berubah setelah pengemudi memulai perjalanan."}
              </p>
            </div>
          )}
        </section>

        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Kesiapan data</h2>
              <div className="panel-subtitle">Relasi yang dibutuhkan modul perjalanan</div>
            </div>
            <Pill tone="info">Tahap data induk</Pill>
          </header>
          <ul className="check-list">
            <li>
              <strong>Siswa aktif</strong>
              <span>{activeStudents}</span>
              <small>Hanya siswa aktif yang dapat diakses akun wali.</small>
            </li>
            <li>
              <strong>Siswa jeda / berakhir</strong>
              <span>{pausedOrEnded}</span>
              <small>Riwayat layanan tetap tersimpan dan tidak dihapus.</small>
            </li>
            <li>
              <strong>Email wali menunggu aktivasi</strong>
              <span>{pendingGuardians}</span>
              <small>Dari {guardians} akun wali aktif. Wali membuat kata sandi sendiri setelah verifikasi email.</small>
            </li>
            <li>
              <strong>Rute aktif</strong>
              <span>{routes}</span>
              <small>Rute tanpa titik jemput tidak dapat dipakai membuat penugasan yang lengkap.</small>
            </li>
          </ul>
        </section>
      </div>

      <section className="panel" style={{ marginBottom: 18 }}>
        <header className="panel-head">
          <div>
            <h2 className="panel-title">Pintasan pengelolaan</h2>
            <div className="panel-subtitle">Seluruh tombol membuka modul yang sudah aktif</div>
          </div>
        </header>
        <div className="quick-grid" style={{ padding: "0 18px 18px", margin: 0 }}>
          {shortcuts.map((item) => (
            <Link className="quick-tile" href={item.href} key={item.href}>
              <span aria-hidden="true">
                <Icon name={item.icon} />
              </span>
              <strong>{item.label}</strong>
              <small>{item.note}</small>
            </Link>
          ))}
        </div>
      </section>

      <Notice kind="info">
        Posisi bus langsung (GPS) dan estimasi kedatangan belum tersedia. Kamera bus belum terintegrasi; kamera
        perjalanan hanya dibuka pengemudi pada perjalanan aktif dan untuk wali yang berhak. Halaman ini tidak
        menampilkan lokasi atau status perjalanan yang tidak benar-benar tercatat di database.
      </Notice>
    </>
  );
}
