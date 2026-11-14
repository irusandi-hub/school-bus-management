import type { Metadata } from "next";
import { cookies } from "next/headers";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/messages";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";
import { ConfigNotice, EmptyState, Notice } from "@/components/admin/ui";
import { ChildOverviewCard } from "@/components/guardian/ChildOverviewCard";
import { GuardianOpsHeader } from "@/components/guardian/GuardianOpsHeader";
import { requireGuardian } from "@/lib/auth";
import { isDevOpenAccess } from "@/lib/dev-open-access";
import { liveEventKey, loadChildren, loadTodayStudentEvents, todayDate } from "@/lib/guardian/data";
import { resolveChildJourney } from "@/lib/guardian/journey";
import { buildChildLiveVideo } from "@/lib/guardian/live-view";
import { selectLiveTrip } from "@/lib/guardian/live";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Anak Saya | Portal Wali" };

export default async function GuardianHomePage() {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("sbm_locale")?.value;
  const locale = isLocale(savedLocale) ? savedLocale : defaultLocale;
  const c = (value: string) => translateAdminCopy(value, locale) ?? value;
  const access = await requireGuardian();
  if (access.status === "unconfigured") return <ConfigNotice />;

  const supabase = await createServerSupabase();
  if (!supabase) return <ConfigNotice />;

  const children = await loadChildren(supabase, access.guardianId);
  const liveEvents = await loadTodayStudentEvents(supabase, children);
  const simulated = isDevOpenAccess();
  const guardianName = access.viewer.profile?.full_name || access.viewer.email || c("Wali");

  const cards = children.map((child) => {
    const trip = selectLiveTrip(child.todayTrips);
    const event = trip?.tripId
      ? liveEvents.get(liveEventKey(trip.tripId, child.student.id)) ?? null
      : null;
    const journey = resolveChildJourney({
      trip,
      event: event ? { event_type: event.eventType, occurred_at: event.occurredAt } : null,
    }, locale);
    const placement =
      child.placements.find((entry) => entry.direction === trip?.direction) ??
      child.placements.find((entry) => entry.direction === "morning") ??
      child.placements[0] ??
      null;

    const directionStatuses = ["morning", "afternoon"].map((direction) => {
      const directionTrip = child.todayTrips.find((row) => row.direction === direction) ?? null;
      if (!directionTrip) {
        return { direction, label: translate(locale, "notScheduled"), tone: "neutral" as const };
      }
      const directionEvent = directionTrip.tripId
        ? liveEvents.get(liveEventKey(directionTrip.tripId, child.student.id)) ?? null
        : null;
      const status = resolveChildJourney({
        trip: directionTrip,
        event: directionEvent
          ? { event_type: directionEvent.eventType, occurred_at: directionEvent.occurredAt }
          : null,
      }, locale);
      return { direction, label: status.label, tone: status.tone };
    });

    return {
      child,
      trip,
      journey,
      placement,
      directionStatuses,
      liveVideo: buildChildLiveVideo(child, liveEvents, { simulated }),
    };
  });

  const onboardCount = cards.filter(
    (card) => card.journey.key === "on-board" || card.journey.key === "arrived",
  ).length;
  const waitingCount = cards.filter(
    (card) => card.journey.key === "scheduled" || card.journey.key === "waiting",
  ).length;
  const tripCount = children.reduce((total, child) => total + child.todayTrips.length, 0);

  return (
    <>
      <GuardianOpsHeader
        guardianName={guardianName}
        locale={locale}
        email={access.viewer.email}
        phone={access.viewer.profile?.phone ?? null}
        serviceDate={todayDate()}
        childCount={children.length}
        tripCount={tripCount}
        onboardCount={onboardCount}
        waitingCount={waitingCount}
      />

      <section className="guardian-children" aria-labelledby="guardian-children-title">
        <h1 className="guardian-visually-hidden" id="guardian-children-title">
          {translate(locale, "childJourneyStatus")}
        </h1>

        {children.length === 0 ? (
          <>
            <section className="panel guardian-empty">
              <EmptyState
                icon="guardian"
                title={translate(locale, "noActiveChild")}
                detail={translate(locale, "noActiveChildDetail")}
              />
            </section>
            <Notice kind="info">
              {translate(locale, "noSampleData")}
            </Notice>
          </>
        ) : (
          <>
            <div className={`child-grid guardian-child-grid ${children.length === 1 ? "single" : ""}`}>
              {cards.map(({ child, trip, journey, placement, directionStatuses, liveVideo }) => (
                <ChildOverviewCard
                  key={child.student.id}
                  child={child}
                  locale={locale}
                  trip={trip}
                  journey={journey}
                  placement={placement}
                  directionStatuses={directionStatuses}
                  liveVideo={liveVideo}
                  simulated={simulated}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
