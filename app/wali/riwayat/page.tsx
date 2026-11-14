import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, Notice, Pill } from "@/components/admin/ui";
import { cookies } from "next/headers";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/messages";
import { LocalizedText } from "@/components/i18n/LocaleProvider";
import { requireGuardian } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { loadChildTrips, loadChildren } from "@/lib/guardian/data";


export const metadata: Metadata = { title: "Riwayat Perjalanan | Portal Wali" };

function tripTone(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "in_progress") return "info" as const;
  if (status === "cancelled") return "danger" as const;
  return "neutral" as const;
}

export default async function GuardianHistoryPage() {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("sbm_locale")?.value;
  const locale = isLocale(savedLocale) ? savedLocale : defaultLocale;
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const dateLocale = locale === "ar" ? "ar-SA-u-ca-gregory" : locale === "en" ? "en-GB" : "id-ID";
  const formatLocalDate = (value: string) => new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Riyadh" }).format(new Date(`${value.slice(0, 10)}T12:00:00+03:00`));
  const formatLocalTime = (value: string | null) => value ? new Intl.DateTimeFormat(dateLocale, { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Riyadh" }).format(new Date(value)) : "—";
  const directionLabel = (value: string) => value === "morning" ? t("morningDirection") : value === "afternoon" ? t("afternoonDirection") : t("directionNotRecorded");
  const statusLabel = (value: string) => value === "in_progress" ? t("inProgress") : value === "completed" ? t("completed") : value === "cancelled" ? t("tripCancelledLabel") : value === "scheduled" ? t("notStarted") : t("status");
  const access = await requireGuardian();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const supabase = await createServerSupabase();
  if (!supabase) return <ConfigNotice />;

  const children = await loadChildren(supabase, access.guardianId);
  const grouped = await Promise.all(
    children.map(async (child) => ({
      child,
      trips: await loadChildTrips(
        supabase,
        child.placements.map((placement) => placement.routeId),
        5,
      ),
    })),
  );

  const rows = grouped
    .flatMap((entry) => entry.trips.map((trip) => ({ child: entry.child, trip })))
    .sort((a, b) => (a.trip.serviceDate < b.trip.serviceDate ? 1 : -1))
    .slice(0, 30);

  return (
    <>
      <section className="guardian-hero">
        <div>
          <p className="eyebrow">{t("history")}</p>
          <h1><LocalizedText k="guardianHistory" /></h1>
          <p><LocalizedText k="historyIntro" /></p>
        </div>
      </section>

      {children.length === 0 && (
        <Notice kind="info"><LocalizedText k="noActiveChild" /></Notice>
      )}

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2 className="panel-title"><LocalizedText k="recentTrips" /></h2>
            <div className="panel-subtitle"><LocalizedText k="latestFiveTrips" /></div>
          </div>
        </header>
        <div className="admin-table-wrap">
          <table className="admin-table table-stack">
            <thead>
              <tr>
                <th scope="col"><LocalizedText k="date" /></th>
                <th scope="col"><LocalizedText k="child" /></th>
                <th scope="col"><LocalizedText k="route" /></th>
                <th scope="col"><LocalizedText k="status" /></th>
                <th scope="col"><LocalizedText k="time" /></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="table-empty">
                      <strong><LocalizedText k="noTripHistory" /></strong>
                      <p><LocalizedText k="historyEmptyDetail" /></p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map(({ child, trip }) => (
                  <tr key={`${child.student.id}-${trip.id}`}>
                    <td data-label={t("date")}>{formatLocalDate(trip.serviceDate)}</td>
                    <td data-label={t("child")}>
                      <Link className="row-link" href={`/wali/anak/${child.student.id}`}>
                        {child.student.full_name}
                      </Link>
                    </td>
                    <td data-label={t("route")}>
                      <strong>{trip.routeName}</strong>
                      <small>
                        {trip.schoolName} · {directionLabel(trip.direction)}
                      </small>
                    </td>
                    <td data-label={t("status")}>
                      <Pill tone={tripTone(trip.status)}>{statusLabel(trip.status)}</Pill>
                    </td>
                    <td data-label={t("time")}>
                      <small><LocalizedText k="start" /> {formatLocalTime(trip.startedAt)}</small>
                      <small><LocalizedText k="arrive" /> {formatLocalTime(trip.arrivedAt)}</small>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Notice kind="info">
        <LocalizedText k="historyMapUnavailable" />
      </Notice>
    </>
  );
}
