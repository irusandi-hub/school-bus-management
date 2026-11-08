import type { Metadata } from "next";
import { RecordForm, type FieldDef } from "@/components/admin/RecordForm";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { operatorReadContext } from "@/lib/operator/read";
import type { TripAssignmentRow } from "@/lib/types";
import { formatDate, routeDirectionLabel, tripStatusLabel } from "@/lib/validation";
import { saveOperatorAssignment } from "../actions";

export const metadata: Metadata = { title: "Penugasan | Operator" };

function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export default async function OperatorAssignmentsPage() {
  const supabase = await operatorReadContext();
  if (!supabase) return <ConfigNotice />;

  const [assignmentsResult, routesResult, driversResult, busesResult] = await Promise.all([
    supabase
      .from("trip_assignments")
      .select(
        "id, driver_id, bus_id, service_date, routes(route_name, school_name, direction), buses(fleet_code), drivers(full_name), trips(id, status, started_at, completed_at, arrived_at)",
      )
      .order("service_date", { ascending: false })
      .limit(50),
    supabase.from("routes").select("id, route_name, school_name, direction").eq("active", true).order("route_name"),
    supabase.from("drivers").select("id, full_name").eq("active", true).order("full_name"),
    supabase.from("buses").select("id, fleet_code, capacity").eq("active", true).order("fleet_code"),
  ]);

  const assignments = (assignmentsResult.data ?? []) as unknown as TripAssignmentRow[];
  const routes = (routesResult.data ?? []) as { id: string; route_name: string; school_name: string; direction: string }[];
  const drivers = (driversResult.data ?? []) as { id: string; full_name: string }[];
  const buses = (busesResult.data ?? []) as { id: string; fleet_code: string; capacity: number }[];
  const ready = routes.length > 0 && drivers.length > 0 && buses.length > 0;

  // Resources already booked on today's service date, so the form can say so before saving.
  const bookedToday = new Set<string>();
  for (const assignment of assignments) {
    if (assignment.service_date !== today()) continue;
    bookedToday.add(assignment.driver_id);
    bookedToday.add(assignment.bus_id);
  }

  const availableDrivers = drivers.filter((driver) => !bookedToday.has(driver.id));
  const availableBuses = buses.filter((bus) => !bookedToday.has(bus.id));
  const busyDrivers = drivers.filter((driver) => bookedToday.has(driver.id));
  const busyBuses = buses.filter((bus) => bookedToday.has(bus.id));

  const fields: FieldDef[] = [
    {
      name: "route_id",
      label: "Rute",
      type: "select",
      required: true,
      defaultValue: "",
      options: [
        { value: "", label: routes.length === 0 ? "Belum ada rute aktif" : "Pilih rute" },
        ...routes.map((route) => ({
          value: route.id,
          label: `${route.route_name} · ${route.school_name} (${routeDirectionLabel(route.direction)})`,
        })),
      ],
    },
    {
      name: "service_date",
      label: "Tanggal layanan",
      type: "date",
      required: true,
      defaultValue: today(),
    },
    {
      name: "driver_id",
      label: "Pengemudi organisasi Anda",
      type: "select",
      required: true,
      defaultValue: "",
      options: [
        { value: "", label: drivers.length === 0 ? "Belum ada pengemudi aktif" : "Pilih pengemudi" },
        ...drivers.map((driver) => ({
          value: driver.id,
          label: bookedToday.has(driver.id) ? `${driver.full_name} · sudah ditugaskan hari ini` : driver.full_name,
        })),
      ],
    },
    {
      name: "bus_id",
      label: "Bus organisasi Anda",
      type: "select",
      required: true,
      defaultValue: "",
      options: [
        { value: "", label: buses.length === 0 ? "Belum ada bus aktif" : "Pilih bus" },
        ...buses.map((bus) => ({
          value: bus.id,
          label: `${bus.fleet_code} · ${bus.capacity} kursi${bookedToday.has(bus.id) ? " · sudah dipakai hari ini" : ""}`,
        })),
      ],
    },
  ];

  return (
    <>
      <PageHeader
        title="Penugasan"
        description="Buat penugasan hanya dengan pengemudi dan bus milik organisasi Anda. Database menolak penugasan yang memakai armada organisasi lain."
      />

      {assignmentsResult.error && <Notice kind="error">Daftar penugasan belum dapat dimuat.</Notice>}
      {!ready && (
        <Notice kind="warning">
          Lengkapi minimal satu rute aktif (dari pengelola), satu pengemudi, dan satu bus organisasi Anda sebelum
          membuat penugasan.
        </Notice>
      )}
      {ready && (
        <Notice kind="info">
          Satu pengemudi dan satu bus hanya dapat digunakan untuk satu penugasan pada tanggal layanan yang sama.
          Sistem memeriksa benturan jadwal sebelum menyimpan penugasan.
        </Notice>
      )}

      <div className="admin-split">
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Penugasan organisasi Anda</h2>
              <div className="panel-subtitle">50 penugasan terbaru</div>
            </div>
          </header>
          <div className="admin-table-wrap">
            <table className="admin-table table-stack">
              <thead>
                <tr>
                  <th scope="col">Tanggal</th>
                  <th scope="col">Rute</th>
                  <th scope="col">Pengemudi &amp; bus</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <EmptyRow
                    colSpan={4}
                    title="Belum ada penugasan"
                    detail="Penugasan yang dibuat di sini hanya terlihat oleh organisasi Anda dan pengemudi terkait."
                  />
                ) : (
                  assignments.map((assignment) => {
                    const trip = assignment.trips?.[0];
                    return (
                      <tr key={assignment.id}>
                        <td data-label="Tanggal">{formatDate(assignment.service_date)}</td>
                        <td data-label="Rute">
                          <strong>{assignment.routes?.route_name ?? "Rute"}</strong>
                          <small>{assignment.routes?.school_name}</small>
                        </td>
                        <td data-label="Pengemudi & bus">
                          <strong>{assignment.drivers?.full_name ?? "—"}</strong>
                          <small>{assignment.buses?.fleet_code}</small>
                        </td>
                        <td data-label="Status">
                          <Pill tone={trip?.status === "in_progress" ? "info" : trip?.status === "completed" ? "success" : "neutral"}>
                            {trip ? tripStatusLabel(trip.status) : "Belum dimulai"}
                          </Pill>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel admin-form-panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Tambah penugasan</h2>
              <div className="panel-subtitle">Hanya pengemudi dan bus organisasi Anda</div>
            </div>
          </header>
          <div className="form-body">
            <div className="ops-note" style={{ marginBottom: 14 }}>
              <strong>Ketersediaan hari ini</strong>
              <div>
                Pengemudi siap ditugaskan: <strong>{availableDrivers.length}</strong> dari {drivers.length} aktif.
              </div>
              <div>
                Bus siap ditugaskan: <strong>{availableBuses.length}</strong> dari {buses.length} aktif.
              </div>
              {(busyDrivers.length > 0 || busyBuses.length > 0) && (
                <div style={{ marginTop: 6 }}>
                  Sudah terpakai hari ini:{" "}
                  {[...busyDrivers.map((driver) => driver.full_name), ...busyBuses.map((bus) => `Bus ${bus.fleet_code}`)].join(
                    ", ",
                  )}
                  . Pilih tanggal lain atau gunakan staf yang masih tersedia.
                </div>
              )}
              {availableDrivers.length === 0 && drivers.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  Semua pengemudi aktif sudah mendapat penugasan hari ini. Database akan menolak penugasan ganda pada
                  tanggal yang sama.
                </div>
              )}
            </div>
            <RecordForm
              action={saveOperatorAssignment}
              fields={fields}
              submitLabel="Simpan penugasan"
              disabledReason={
                ready
                  ? undefined
                  : "Penugasan dapat dibuat setelah ada satu rute aktif dari pengelola, satu pengemudi, dan satu bus organisasi Anda. Lengkapi data tersebut terlebih dahulu."
              }
              note="Penugasan tidak membuat perjalanan sebelum pengemudi memulainya dari area pengemudi."
            />
          </div>
        </section>
      </div>
    </>
  );
}
