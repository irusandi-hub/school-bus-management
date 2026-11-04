import { ServiceStatusPill } from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";
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
 * Kartu anak yang ringkas: status perjalanan menjadi fokus, identitas dan
 * layanan tetap terlihat, sedangkan bus/pengemudi/rute disusun sebagai fakta
 * pendukung. Kamera hanya dapat dibuka saat anak tercatat berada di bus.
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
    ? `${trip.plateNumber}${trip.busCapacity ? ` · ${trip.busCapacity} kursi` : ""}`
    : "Plat dan kapasitas belum tercatat";
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
  const updated = journey.updatedAt ? `Diperbarui ${formatTime(journey.updatedAt)}` : "Belum ada pembaruan";
  const cameraOpenable = liveVideo.state === "on-board-camera-off" || liveVideo.state === "live";
  const cameraCopy =
    journey.key === "no-trip"
      ? "Belum ada perjalanan hari ini."
      : liveVideo.state === "live"
        ? "Siaran kamera bus tersedia."
        : liveVideo.state === "on-board-camera-off"
          ? "Anak di bus · kamera belum terhubung."
          : liveVideo.state === "ended"
            ? "Akses ditutup setelah anak turun."
            : "Tersedia setelah anak tercatat naik bus.";

  return (
    <article className="child-card guardian-child" id={`anak-${student.id}`}>
      <header className="child-card-head">
        <span className="child-avatar" aria-hidden="true">
          {student.full_name.slice(0, 1).toUpperCase()}
        </span>
        <div>
          <h2>{student.full_name}</h2>
          <small>
            {student.admissions_number} · {school}
          </small>
        </div>
        <ServiceStatusPill status={student.service_status} />
      </header>

      <div className={`guardian-journey tone-${journey.tone}`} role="status">
        <span className="guardian-journey-icon" aria-hidden="true">
          <Icon name={journey.icon} size={19} />
        </span>
        <div className="guardian-journey-copy">
          <strong>{journey.label}</strong>
          <p>{journey.detail}</p>
        </div>
        <span className="guardian-journey-time">
          <Icon name="clock" size={12} />
          {updated}
        </span>
      </div>

      <dl className="guardian-facts">
        <div>
          <dt>Bus</dt>
          <dd>{bus}</dd>
          <small>{busDetail}</small>
        </div>
        <div>
          <dt>Pengemudi</dt>
          <dd>{driver}</dd>
          <small>{driverDetail}</small>
        </div>
        <div>
          <dt>Sekolah</dt>
          <dd>{school}</dd>
          <small>{direction} · tujuan perjalanan</small>
        </div>
        <div>
          <dt>Rute &amp; titik</dt>
          <dd>{route}</dd>
          <small>{stop}</small>
        </div>
      </dl>

      {directionStatuses.length > 1 && (
        <div className="guardian-directions" aria-label="Status perjalanan per arah">
          <span className="guardian-directions-label">Per arah</span>
          {directionStatuses.map((status) => (
            <span className={`guardian-direction tone-${status.tone}`} key={status.direction}>
              <small>{routeDirectionLabel(status.direction)}</small>
              <strong>{status.label}</strong>
            </span>
          ))}
        </div>
      )}

      <div className="guardian-child-actions">
        <a className="guardian-action-card" href={`#lokasi-${student.id}`}>
          <span className="guardian-action-icon" aria-hidden="true">
            <Icon name="pin" size={16} />
          </span>
          <span className="guardian-action-copy">
            <strong>Lokasi bus</strong>
            <small>GPS belum tersedia · belum ada pembaruan</small>
          </span>
          <span className="guardian-action-cta">
            Lihat
            <Icon name="chevronRight" size={13} />
          </span>
        </a>

        {cameraOpenable ? (
          <details className="guardian-camera">
            <summary className="guardian-action-card">
              <span className="guardian-action-icon" aria-hidden="true">
                <Icon name="camera" size={16} />
              </span>
              <span className="guardian-action-copy">
                <strong>Kamera bus</strong>
                <small>{cameraCopy}</small>
              </span>
              <span className="guardian-action-cta">
                {liveVideo.state === "live" ? "Tonton" : "Lihat status"}
                <Icon name="chevronRight" size={13} />
              </span>
            </summary>
            <div className="guardian-camera-body">
              <ParentLiveVideo
                childName={student.full_name}
                state={liveVideo.state}
                tripLabel={liveVideo.tripLabel}
                busLabel={liveVideo.busLabel}
                streamUrl={liveVideo.streamUrl}
                streamMimeType={liveVideo.streamMimeType}
                updatedAt={liveVideo.updatedAt}
                simulated={simulated}
                compact
              />
            </div>
          </details>
        ) : (
          <div className="guardian-action-card is-muted">
            <span className="guardian-action-icon" aria-hidden="true">
              <Icon name="cameraOff" size={16} />
            </span>
            <span className="guardian-action-copy">
              <strong>Kamera bus</strong>
              <small>{cameraCopy}</small>
            </span>
            <span className="guardian-action-cta">Tidak tersedia</span>
          </div>
        )}
      </div>
    </article>
  );
}
