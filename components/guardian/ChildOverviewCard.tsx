import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ChildBusLocationPanel } from "@/components/guardian/ChildBusLocationPanel";
import { ParentLiveVideo } from "@/components/guardian/ParentLiveVideo";
import type { ChildOverview, Placement, TodayTrip } from "@/lib/guardian/data";
import type { ChildLiveVideoView } from "@/lib/guardian/live-view";
import type { JourneyStatus, JourneyTone } from "@/lib/guardian/journey";
import { formatTime, routeDirectionLabel } from "@/lib/validation";

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
  journey,
  trip,
  placement,
  directionStatuses,
  liveVideo,
  simulated,
}: {
  child: ChildOverview;
  journey: JourneyStatus;
  trip: TodayTrip | null;
  placement: Placement | null;
  directionStatuses: DirectionStatus[];
  liveVideo: ChildLiveVideoView;
  simulated: boolean;
}) {
  const student = child.student;
  const school = student.schools?.name ?? "Sekolah belum ditetapkan";
  const bus = trip?.busCode ? `Bus ${trip.busCode}` : "Belum ditetapkan";
  const busDetail = trip?.plateNumber
    ? `Pelat ${trip.plateNumber}${trip.busCapacity ? ` · ${trip.busCapacity} kursi` : ""}`
    : "Nomor pelat dan kapasitas belum tercatat";
  const driver = trip
    ? trip.driverAssigned
      ? "Sudah ditugaskan"
      : "Belum ditugaskan"
    : "Belum ditugaskan";
  const driverDetail = trip?.driverAssigned
    ? "Nama pengemudi belum dibagikan ke portal wali"
    : "Operator belum menautkan pengemudi";
  const route = placement?.routeName ?? "Rute belum diatur";
  const stop = placement
    ? `${placement.stopOrder}. ${placement.stopName}`
    : "Titik jemput belum diatur";
  const direction = routeDirectionLabel(trip?.direction ?? placement?.direction ?? "");
  const updated = journey.updatedAt
    ? `Status diperbarui ${formatTime(journey.updatedAt)}`
    : "Belum ada pembaruan status";

  return (
    <article className="child-card guardian-child" id={`anak-${student.id}`}>
      <div className="guardian-child-layout">
        <section className="guardian-child-info" aria-label={`Informasi perjalanan ${student.full_name}`}>
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
                Detail anak
                <Icon name="arrowRight" size={13} />
              </Link>
            </div>
          </header>

          <div className={`guardian-journey tone-${journey.tone}`} role="status">
            <span className="guardian-journey-icon" aria-hidden="true">
              <Icon name={journey.icon} size={24} />
            </span>
            <div className="guardian-journey-copy">
              <small className="guardian-journey-eyebrow">Status saat ini</small>
              <strong>{journey.label}</strong>
              <p>{journey.detail}</p>
              <span className="guardian-journey-time">
                <Icon name="clock" size={12} />
                {updated}
              </span>
            </div>
          </div>

          <div className="guardian-directions" aria-label="Status keberangkatan pagi dan kepulangan">
            {directionStatuses.map((status) => (
              <div className={`guardian-direction tone-${status.tone}`} key={status.direction}>
                <span className="guardian-direction-label">{routeDirectionLabel(status.direction)}</span>
                <strong>{status.label}</strong>
              </div>
            ))}
          </div>

          <dl className="guardian-facts" aria-label="Detail perjalanan">
            <div className="guardian-fact">
              <dt>
                <Icon name="bus" size={17} />
                <span>Bus</span>
              </dt>
              <dd>
                <strong>{bus}</strong>
                <small>{busDetail}</small>
              </dd>
            </div>
            <div className="guardian-fact">
              <dt>
                <Icon name="route" size={17} />
                <span>Rute</span>
              </dt>
              <dd>
                <strong>{route}</strong>
                <small>{direction ? `Arah ${direction.toLowerCase()}` : "Arah belum tercatat"}</small>
              </dd>
            </div>
            <div className="guardian-fact">
              <dt>
                <Icon name="pin" size={17} />
                <span>Titik jemput</span>
              </dt>
              <dd>
                <strong>{stop}</strong>
              </dd>
            </div>
            <div className="guardian-fact">
              <dt>
                <Icon name="driver" size={17} />
                <span>Pengemudi</span>
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
          <ChildBusLocationPanel childId={student.id} />
        </div>
      </div>
    </article>
  );
}
