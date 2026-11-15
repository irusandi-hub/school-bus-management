import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { LocalizedText } from "@/components/i18n/LocaleProvider";
import { ChildBusLocationPanel } from "@/components/guardian/ChildBusLocationPanel";
import { ParentLiveVideo } from "@/components/guardian/ParentLiveVideo";
import type { ChildOverview, Placement, TodayTrip } from "@/lib/guardian/data";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/messages";
import type { ChildLiveVideoView } from "@/lib/guardian/live-view";
import type { JourneyStatus, JourneyTone } from "@/lib/guardian/journey";


type DirectionStatus = {
  direction: string;
  label: string;
  tone: JourneyTone;
};

/**
 * Kartu utama satu anak.
 *
 * Semua viewport memakai dua kolom: identitas dan detail perjalanan di kiri,
 * kamera di kanan atas dan peta di kanan bawah. Pada ponsel hanya metadata
 * internal yang ditumpuk; kedua kolom utama tetap berdampingan.
 *
 * Status GPS hanya berada di panel peta dan status kamera hanya berada di panel
 * kamera. Tidak ada tautan menuju panel lain yang mengulang informasi tersebut.
 */
export function ChildOverviewCard({
  child,
  locale,
  journey,
  trip,
  placement,
  directionStatuses,
  liveVideo,
  simulated,
}: {
  child: ChildOverview;
  locale: Locale;
  journey: JourneyStatus;
  trip: TodayTrip | null;
  placement: Placement | null;
  directionStatuses: DirectionStatus[];
  liveVideo: ChildLiveVideoView;
  simulated: boolean;
}) {
  const student = child.student;
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const directionLabel = (value: string) => value === "morning" ? t("morningDirection") : value === "afternoon" ? t("afternoonDirection") : t("directionNotRecorded");
  const formatTime = (value: string) => new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory" : locale === "en" ? "en-GB" : "id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Riyadh" }).format(new Date(value));
  const school = student.schools?.name ?? t("schoolNotSet");
  const bus = trip?.busCode ? `${t("busLabel")} ${trip.busCode}` : t("busNotSet");
  const busDetail = trip?.plateNumber
    ? `${t("plateLabel")} ${trip.plateNumber}${trip.busCapacity ? ` · ${trip.busCapacity} ${t("seatsLabel")}` : ""}`
    : t("plateCapacityMissing");
  const driver = trip
    ? trip.driverAssigned
      ? t("driverAssigned")
      : t("driverNotAssigned")
    : t("driverNotAssigned");
  const driverDetail = trip?.driverAssigned
    ? t("driverNamePrivate")
    : t("operatorNoDriver");
  const route = placement?.routeName ?? t("routeNotSet");
  const stop = placement
    ? `${placement.stopOrder}. ${placement.stopName}`
    : t("pickupNotSet");
  const direction = directionLabel(trip?.direction ?? placement?.direction ?? "");
  const updated = journey.updatedAt
    ? `${t("statusUpdated")} ${formatTime(journey.updatedAt)}`
    : t("noStatusUpdate");

  return (
    <article className="child-card guardian-child" id={`anak-${student.id}`}>
      <div className="guardian-child-layout">
        <section className="guardian-child-info" aria-label={`${t("tripDetails")}: ${student.full_name}`}>
          <header className="guardian-child-identity">
            <span className="guardian-child-avatar" aria-hidden="true">
              {student.full_name.slice(0, 1).toUpperCase()}
            </span>
            <div className="guardian-child-ident-copy">
              <h2>{student.full_name}</h2>
              <span className="guardian-child-nis">NIS: {student.admissions_number}</span>
              <span className="guardian-child-school">
                <Icon name="school" size={14} />
                {school}
              </span>
              <Link className="guardian-child-detail" href={`/wali/anak/${student.id}`}>
                <LocalizedText k="detailChild" />
                <Icon name="arrowRight" size={13} />
              </Link>
            </div>
          </header>

          <div className={`guardian-journey tone-${journey.tone}`} role="status">
            <span className="guardian-journey-icon" aria-hidden="true">
              <Icon name={journey.icon} size={24} />
            </span>
            <div className="guardian-journey-copy">
              <small className="guardian-journey-eyebrow"><LocalizedText k="currentStatus" /></small>
              <strong>{journey.label}</strong>
              <p>{journey.detail}</p>
              <span className="guardian-journey-time">
                <Icon name="clock" size={12} />
                {updated}
              </span>
            </div>
          </div>

          <div className="guardian-directions" aria-label={t("morningAfternoonStatus")}>
            {directionStatuses.map((status) => (
              <div className={`guardian-direction tone-${status.tone}`} key={status.direction}>
                <span className="guardian-direction-label">{directionLabel(status.direction)}</span>
                <strong>{status.label}</strong>
              </div>
            ))}
          </div>

          <dl className="guardian-facts" aria-label={t("tripDetails")}>
            <div className="guardian-fact">
              <dt>
                <Icon name="bus" size={17} />
                <span><LocalizedText k="bus" /></span>
              </dt>
              <dd>
                <strong>{bus}</strong>
                <small>{busDetail}</small>
              </dd>
            </div>
            <div className="guardian-fact">
              <dt>
                <Icon name="route" size={17} />
                <span><LocalizedText k="route" /></span>
              </dt>
              <dd>
                <strong>{route}</strong>
                <small>{direction ? `${t("directionLabel")} ${direction}` : t("directionNotRecorded")}</small>
              </dd>
            </div>
            <div className="guardian-fact">
              <dt>
                <Icon name="pin" size={17} />
                <span><LocalizedText k="pickupPoint" /></span>
              </dt>
              <dd>
                <strong>{stop}</strong>
              </dd>
            </div>
            <div className="guardian-fact">
              <dt>
                <Icon name="driver" size={17} />
                <span><LocalizedText k="driver" /></span>
              </dt>
              <dd>
                <strong>{driver}</strong>
                <small>{driverDetail}</small>
              </dd>
            </div>
          </dl>
        </section>

        <div className="guardian-child-feature">
          <ParentLiveVideo
            childName={student.full_name}
            tripId={liveVideo.tripId}
            studentId={student.id}
            state={liveVideo.state}
            tripLabel={liveVideo.tripLabel}
            busLabel={liveVideo.busLabel}
            streamUrl={liveVideo.streamUrl}
            streamMimeType={liveVideo.streamMimeType}
            updatedAt={liveVideo.updatedAt}
            simulated={simulated}
            presentation="guardian-card"
          />
          <ChildBusLocationPanel
            childId={student.id}
            tripId={trip?.tripId ?? null}
            initialTripStatus={trip?.status ?? null}
          />
        </div>
      </div>
    </article>
  );
}
