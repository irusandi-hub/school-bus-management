import type { Metadata } from "next";
import { RecordForm, type FieldDef } from "@/components/admin/RecordForm";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { adminReadContext } from "@/lib/admin/read";
import type { TripAssignmentRow } from "@/lib/types";
import { formatDate, routeDirectionLabel, tripStatusLabel } from "@/lib/validation";
import { saveAssignment } from "./actions";

export const metadata: Metadata = { title: "Penugasan | Admin Pusat" };

function today() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export default async function AssignmentsPage() {
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const [assignmentsResult, routesResult, driversResult, busesResult] = await Promise.all([
    supabase
      .from("trip_assignments")
      .select(
        "id, route_id, driver_id, bus_id, service_date, routes(route_name, school_name, direction), buses(fleet_code, plate_number), drivers(full_name), trips(id, status, started_at, completed_at, arrived_at)",
      )
      .order("service_date", { ascending: false })
      .limit(60),
    supabase.from("routes").select("id, route_name, school_name, direction").eq("active", true).order("route_name"),
    supabase.from("drivers").select("id, full_name").eq("active", true).order("full_name"),
    supabase.from("buses").select("id, fleet_code, plate_number, capacity").eq("active", true).order("fleet_code"),
  ]);

  const assignments = (assignmentsResult.data ?? []) as unknown as TripAssignmentRow[];
  const routes = (routesResult.data ?? []) as { id: string; route_name: string; school_name: string; direction: string }[];
  const drivers = (driversResult.data ?? []) as { id: string; full_name: string }[];
  const buses = (busesResult.data ?? []) as { id: string; fleet_code: string; plate_number: string | null; capacity: number }[];

  const ready = routes.length > 0 && drivers.length > 0 && buses.length > 0;

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
      label: "Pengemudi",
      type: "select",
      required: true,
      defaultValue: "",
      options: [
        { value: "", label: drivers.length === 0 ? "Belum ada pengemudi aktif" : "Pilih pengemudi" },
        ...drivers.map((driver) => ({ value: driver.id, label: driver.full_name })),
      ],
    },
    {
      name: "bus_id",
      label: "Bus",
      type: "select",
      required: true,
      defaultValue: "",
      options: [
        { value: "", label: buses.length === 0 ? "Belum ada bus aktif" : "Pilih bus" },
        ...buses.map((bus) => ({
          value: bus.id,
          label: `${bus.fleet_code}${bus.plate_number ? ` · ${bus.plate_number}` : ""} · ${bus.capacity} kursi`,
        })),
      ],
    },
  ];

  return (
    <>
      <PageHeader
        title="Penugasan"
        description="Hubungkan rute, pengemudi, dan bus untuk satu tanggal layanan. Perjalanan baru dimulai oleh pengemudi dari halaman tugasnya."
      />

      {assignmentsResult.error && (
        <Notice kind="error">Daftar penugasan belum dapat dimuat. Muat ulang halaman atau coba lagi nanti.</Notice>
      )}
      {!ready && (
        <Notice kind="warning">
          Penugasan memerlukan minimal satu rute aktif, satu pengemudi aktif, dan satu bus aktif. Lengkapi data
          tersebut terlebih dahulu.
        </Notice>
      )}

      <div className="admin-split">
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title">Daftar penugasan</h2>
              <div className="panel-subtitle">60 penugasan terbaru</div>
            </div>
          </header>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Tanggal</th>
                  <th scope="col">Rute</th>
                  <th scope="col">Pengemudi &amp; bus</th>
                  <th scope="col">Perjalanan</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <EmptyRow
                    colSpan={4}
                    title="Belum ada penugasan"
                    detail="Buat penugasan pertama melalui formulir di samping setelah rute, pengemudi, dan bus tersedia."
                  />
                ) : (
                  assignments.map((assignment) => {
                    const trip = assignment.trips?.[0];
                    return (
                      <tr key={assignment.id}>
                        <td>{formatDate(assignment.service_date)}</td>
                        <td>
                          <strong>{assignment.routes?.route_name ?? "Rute"}</strong>
                          <small>
                            {assignment.routes?.school_name} · {routeDirectionLabel(assignment.routes?.direction ?? "")}
                          </small>
                        </td>
                        <td>
                          <strong>{assignment.drivers?.full_name ?? "Pengemudi"}</strong>
                          <small>
                            {assignment.buses?.fleet_code}
                            {assignment.buses?.plate_number ? ` · ${assignment.buses.plate_number}` : ""}
                          </small>
                        </td>
                        <td>
                          {trip ? (
                            <Pill tone={trip.status === "in_progress" ? "info" : trip.status === "completed" ? "success" : "neutral"}>
                              {tripStatusLabel(trip.status)}
                            </Pill>
                          ) : (
                            <Pill tone="neutral">Belum dimulai</Pill>
                          )}
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
              <div className="panel-subtitle">Satu pengemudi tidak dapat ditugaskan dua kali pada rute dan tanggal yang sama</div>
            </div>
          </header>
          <div className="form-body">
            <RecordForm
              action={saveAssignment}
              fields={fields}
              submitLabel="Simpan penugasan"
              disabledReason={
                ready
                  ? undefined
                  : "Penugasan dapat dibuat setelah tersedia minimal satu rute aktif, satu pengemudi aktif, dan satu bus aktif. Lengkapi data tersebut terlebih dahulu."
              }
              note="Pastikan pengemudi dan bus aktif. Penugasan tidak membuat data perjalanan sebelum pengemudi menekan Mulai perjalanan."
            />
          </div>
        </section>
      </div>
    </>
  );
}
