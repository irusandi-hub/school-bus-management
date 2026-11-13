import type { Metadata } from "next";
import { AdminCopy } from "@/components/i18n/AdminCopy";
import { RecordForm, type FieldDef } from "@/components/admin/RecordForm";
import { ProjectAreaTabs } from "@/components/admin/ProjectAreaTabs";
import { ConfigNotice, EmptyRow, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { adminReadContext } from "@/lib/admin/read";
import { getProjectAreaContext, loadProjectAreaScope } from "@/lib/project-areas/context";
import type { TripAssignmentRow } from "@/lib/types";
import { formatDate, routeDirectionLabel, serviceDateInTimeZone, tripStatusLabel } from "@/lib/validation";
import { saveAssignment } from "./actions";

export const metadata: Metadata = { title: "Penugasan | Operator" };

export default async function AssignmentsPage() {
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const areaContext = await getProjectAreaContext(supabase);
  const scope = await loadProjectAreaScope(supabase, areaContext.selectedId);
  const selectedId = areaContext.selectedId;

  let assignmentsQuery = supabase
    .from("trip_assignments")
    .select(
      "id, route_id, driver_id, bus_id, service_date, routes(route_name, school_name, direction, project_areas(name)), buses(fleet_code, plate_number), drivers(full_name), trips(id, status, started_at, completed_at, arrived_at)",
    )
    .order("service_date", { ascending: false })
    .limit(60);
  if (selectedId) assignmentsQuery = assignmentsQuery.in("route_id", scope.routeIds);

  let routesQuery = supabase
    .from("routes")
    .select("id, route_name, school_name, direction, project_area_id, project_areas(name)")
    .eq("active", true)
    .order("route_name");
  if (selectedId) routesQuery = routesQuery.eq("project_area_id", selectedId);

  let driversQuery = supabase
    .from("drivers")
    .select("id, full_name, project_area_id")
    .eq("active", true)
    .order("full_name");
  if (selectedId) driversQuery = driversQuery.eq("project_area_id", selectedId);

  let busesQuery = supabase
    .from("buses")
    .select("id, fleet_code, plate_number, capacity, project_area_id")
    .eq("active", true)
    .order("fleet_code");
  if (selectedId) busesQuery = busesQuery.eq("project_area_id", selectedId);

  const [assignmentsResult, routesResult, driversResult, busesResult] = await Promise.all([
    assignmentsQuery,
    routesQuery,
    driversQuery,
    busesQuery,
  ]);

  const assignments = (assignmentsResult.data ?? []) as unknown as (TripAssignmentRow & {
    routes: { project_areas: { name: string } | null } | null;
  })[];
  const routes = (routesResult.data ?? []) as unknown as {
    id: string;
    route_name: string;
    school_name: string;
    direction: string;
    project_areas: { name: string } | null;
  }[];
  const drivers = (driversResult.data ?? []) as { id: string; full_name: string }[];
  const buses = (busesResult.data ?? []) as {
    id: string;
    fleet_code: string;
    plate_number: string | null;
    capacity: number;
  }[];

  const ready = routes.length > 0 && drivers.length > 0 && buses.length > 0;

  const fields: FieldDef[] = [
    {
      name: "route_id",
      label: "Rute",
      type: "select",
      required: true,
      defaultValue: "",
      options: [
        { value: "", label: routes.length === 0 ? "Belum ada rute aktif di konteks ini" : "Pilih rute" },
        ...routes.map((route) => ({
          value: route.id,
          label: `${route.route_name} · ${route.school_name} (${routeDirectionLabel(route.direction)})${
            selectedId ? "" : ` · ${route.project_areas?.name ?? "Tanpa area"}`
          }`,
        })),
      ],
      help: selectedId ? "Rute pada Area Operasional aktif." : "Pada tampilan Semua Area, rute, bus, dan pengemudi harus dari area yang sama.",
    },
    {
      name: "service_date",
      label: "Tanggal layanan",
      type: "date",
      required: true,
      defaultValue: serviceDateInTimeZone(),
    },
    {
      name: "driver_id",
      label: "Pengemudi",
      type: "select",
      required: true,
      defaultValue: "",
      options: [
        { value: "", label: drivers.length === 0 ? "Belum ada pengemudi aktif di konteks ini" : "Pilih pengemudi" },
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
        { value: "", label: buses.length === 0 ? "Belum ada bus aktif di konteks ini" : "Pilih bus" },
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
        description="Tugaskan rute, pengemudi, dan bus dari area yang sama pada tanggal layanan."
      />

      <ProjectAreaTabs areas={areaContext.activeAreas} selectedId={selectedId} nextPath="/admin/penugasan" compact />

      {assignmentsResult.error && (
        <Notice kind="error">Daftar penugasan belum dapat dimuat. Coba lagi.</Notice>
      )}
      {!ready && (
        <Notice kind="warning">
          Penugasan memerlukan minimal satu rute aktif, satu pengemudi aktif, dan satu bus aktif pada konteks ini.
          Lengkapi data tersebut terlebih dahulu.
        </Notice>
      )}

      <div className="admin-split">
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2 className="panel-title"><AdminCopy value="Daftar penugasan" /></h2>
              <div className="panel-subtitle">60 penugasan terbaru · {areaContext.selected?.name ?? "Semua Area"}</div>
            </div>
          </header>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col"><AdminCopy value="Tanggal" /></th>
                  <th scope="col"><AdminCopy value="Rute" /></th>
                  <th scope="col"><AdminCopy value="Pengemudi &amp; bus" /></th>
                  <th scope="col"><AdminCopy value="Perjalanan" /></th>
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
                            {assignment.routes?.project_areas?.name ? ` · ${assignment.routes.project_areas.name}` : ""}
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
              <h2 className="panel-title"><AdminCopy value="Tambah penugasan" /></h2>
              <div className="panel-subtitle">Satu pengemudi dan satu bus tidak dapat dipakai dua kali pada tanggal yang sama</div>
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
                  : "Penugasan dapat dibuat setelah tersedia rute, pengemudi, dan bus aktif pada Area Operasional yang sama."
              }
              note="Data dari area berbeda ditolak oleh aplikasi dan database. Penugasan tidak membuat perjalanan sebelum pengemudi menekan Mulai Perjalanan."
            />
          </div>
        </section>
      </div>
    </>
  );
}
