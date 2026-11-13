import Link from "next/link";
import type { Metadata } from "next";
import { ConfigNotice, Notice, Pill } from "@/components/admin/ui";
import { LocalizedText } from "@/components/i18n/LocaleProvider";
import { requireGuardian } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { loadChildTrips, loadChildren } from "@/lib/guardian/data";
import { formatDate, formatTime, routeDirectionLabel, tripStatusLabel } from "@/lib/validation";

export const metadata: Metadata = { title: "Riwayat Perjalanan | Portal Wali" };

function tripTone(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "in_progress") return "info" as const;
  if (status === "cancelled") return "danger" as const;
  return "neutral" as const;
}

export default async function GuardianHistoryPage() {
  const access = await requireGuardian();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const supabase = await createServerSupabase();
  if (!supabase) return <ConfigNotice />;

  const children = await loadChildren(supabase);
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
          <p className="eyebrow">RIWAYAT</p>
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
                    <td data-label="Tanggal">{formatDate(trip.serviceDate)}</td>
                    <td data-label="Anak">
                      <Link className="row-link" href={`/wali/anak/${child.student.id}`}>
                        {child.student.full_name}
                      </Link>
                    </td>
                    <td data-label="Rute">
                      <strong>{trip.routeName}</strong>
                      <small>
                        {trip.schoolName} · {routeDirectionLabel(trip.direction)}
                      </small>
                    </td>
                    <td data-label="Status">
                      <Pill tone={tripTone(trip.status)}>{tripStatusLabel(trip.status)}</Pill>
                    </td>
                    <td data-label="Waktu">
                      <small><LocalizedText k="start" /> {formatTime(trip.startedAt)}</small>
                      <small><LocalizedText k="arrive" /> {formatTime(trip.arrivedAt)}</small>
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
