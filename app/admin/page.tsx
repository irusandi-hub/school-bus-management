import Link from "next/link";
import { cookies } from "next/headers";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/messages";
import type { Metadata } from "next";
import { ConfigNotice, MetricStrip, PageHeader, Pill } from "@/components/admin/ui";
import { ProjectAreaTabs } from "@/components/admin/ProjectAreaTabs";
import { adminReadContext } from "@/lib/admin/read";
import { getProjectAreaContext, loadProjectAreaScope } from "@/lib/project-areas/context";
import { serviceDateInTimeZone } from "@/lib/validation";

export const metadata: Metadata = { title: "Ringkasan | Operator" };

export default async function AdminHomePage() {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("sbm_locale")?.value;
  const locale = isLocale(savedLocale) ? savedLocale : defaultLocale;
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const dateLocale = locale === "ar" ? "ar-SA-u-ca-gregory" : locale === "en" ? "en-GB" : "id-ID";
  const formatLocalDate = (value: string) => new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Riyadh" }).format(new Date(`${value.slice(0, 10)}T12:00:00+03:00`));
  const supabase = await adminReadContext();
  if (!supabase) return <ConfigNotice />;

  const areaContext = await getProjectAreaContext(supabase);
  const scope = await loadProjectAreaScope(supabase, areaContext.selectedId);
  const selectedId = areaContext.selectedId;
  const date = serviceDateInTimeZone();

  let schoolsQuery = supabase.from("schools").select("id", { count: "exact", head: true }).eq("active", true);
  if (selectedId) schoolsQuery = schoolsQuery.eq("project_area_id", selectedId);

  let studentsQuery = supabase.from("students").select("id", { count: "exact", head: true }).eq("service_status", "active");
  if (selectedId) studentsQuery = studentsQuery.in("school_id", scope.schoolIds);

  let busesQuery = supabase.from("buses").select("id", { count: "exact", head: true }).eq("active", true);
  if (selectedId) busesQuery = busesQuery.eq("project_area_id", selectedId);

  let driversQuery = supabase.from("drivers").select("id", { count: "exact", head: true }).eq("active", true);
  if (selectedId) driversQuery = driversQuery.eq("project_area_id", selectedId);

  let assignmentQuery = supabase
    .from("trip_assignments")
    .select("id, trips(id, status)")
    .eq("service_date", date);
  if (selectedId) assignmentQuery = assignmentQuery.in("route_id", scope.routeIds);

  const [schoolRows, studentRows, busRows, driverRows, assignmentRows] = await Promise.all([
    schoolsQuery,
    studentsQuery,
    busesQuery,
    driversQuery,
    assignmentQuery,
  ]);

  const assignments = (assignmentRows.data ?? []) as unknown as {
    id: string;
    trips?: { id: string; status: string }[] | null;
  }[];
  const trips = assignments.flatMap((assignment) => assignment.trips ?? []);
  const running = trips.filter((trip) => trip.status === "in_progress").length;
  const completed = trips.filter((trip) => trip.status === "completed").length;
  const waiting = Math.max(assignments.length - running - completed, 0);
  const contextLabel = areaContext.selected?.name ?? t("allAreas");

  return (
    <>
      <PageHeader
        title={t("overview")}
        description={`${t("operatorControl")} ${contextLabel}.`}
        actions={<Pill tone="info">{formatLocalDate(date)}</Pill>}
      />

      <ProjectAreaTabs areas={areaContext.activeAreas} selectedId={selectedId} nextPath="/admin" compact />

      <MetricStrip
        label={`${t("activeData")} ${contextLabel}`}
        items={[
          { label: t("schoolLabel"), value: schoolRows.count ?? 0, note: t("active"), icon: "school" },
          { label: t("studentsLabel"), value: studentRows.count ?? 0, note: t("activeService"), icon: "students" },
          { label: t("busesLabel"), value: busRows.count ?? 0, note: t("fleetActive"), icon: "bus" },
          { label: t("driversLabel"), value: driverRows.count ?? 0, note: t("activeAccountLabel"), icon: "driver" },
          { label: t("areaContext"), value: areaContext.activeAreas.length, note: t("activeArea"), icon: "operator" },
        ]}
      />

      <section className="panel admin-today">
        <header className="panel-head">
          <div>
            <h2 className="panel-title">{t("todayOperations")}</h2>
            <div className="panel-subtitle">
              {assignments.length} penugasan · {contextLabel}
            </div>
          </div>
          <Link className="btn btn-secondary btn-sm" href="/admin/penugasan">
            {t("manageAssignments")}
          </Link>
        </header>
        <div className="today-counts">
          <div className="today-count tone-live">
            <span>{t("inProgress")}</span>
            <strong>{running}</strong>
          </div>
          <div className="today-count tone-wait">
            <span>{t("waiting")}</span>
            <strong>{waiting}</strong>
          </div>
          <div className="today-count tone-done">
            <span>{t("completed")}</span>
            <strong>{completed}</strong>
          </div>
          <p className="today-note">
            {assignmentRows.error
              ? t("assignmentDataUnavailable")
              : assignments.length === 0
                ? t("noAssignmentsToday")
                : `${running} ${t("tripsRunningOf")} ${assignments.length} ${t("assignments")}.`}
          </p>
        </div>
      </section>
    </>
  );
}
