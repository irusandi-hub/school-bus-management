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
 * Kartu anak dengan urutan prioritas: status perjalanan, status kamera (siaran
 * hanya bila aksesnya sah), lokasi bus, lalu informasi pendukung. Identitas dan
 * sekolah tetap di header kartu, sedangkan bus/rute/pengemudi diringkas dalam
 * satu blok pendukung agar tidak mengalahkan status. Kamera dan GPS masing-
 * masing hanya punya satu blok di kartu ini.
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
  const cameraCopy =
    journey.key === "no-trip"
      ? "Belum ada perjalanan hari ini."
      : liveVideo.state === "on-board-camera-off"
        ? "Anak di bus · kamera belum terhubung."
        : liveVideo.state === "ended"
          ? "Akses ditutup setelah anak turun."
          : "Tersedia setelah anak tercatat naik bus.";
  const cameraBadge =
    liveVideo.state === "on-board-camera-off"
      ? "Belum tersedia"
      : liveVideo.state === "ended"
        ? "Nonaktif"
        : "Belum aktif";

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
          <Icon name={journey.icon} size={21} />
        </span>
        <div className="guardian-journey-copy">
          <strong>{journey.label}</strong>
          <p>{journey.detail}</p>
          <span className="guardian-journey-time">
            <Icon name="clock" size={12} />
            {updated}
          </span>
        </div>
      </div>

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

      {liveVideo.state === "live" ? (
        <div className="guardian-live-feature">
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
      ) : (
        <div className="guardian-camera-feature" role="status">
          <span className="guardian-camera-feature-icon" aria-hidden="true">
            <Icon name="cameraOff" size={18} />
          </span>
          <div>
            <strong>Kamera bus</strong>
            <small>{cameraCopy}</small>
          </div>
          <span className="guardian-camera-feature-state">{cameraBadge}</span>
        </div>
      )}

      <div className="guardian-location-inline" role="note">
        <span className="guardian-location-inline-icon" aria-hidden="true">
          <Icon name="pin" size={16} />
        </span>
        <span className="guardian-location-inline-copy">
          <strong>Lokasi bus</strong>
          <small>GPS belum tersedia · belum ada posisi aktual</small>
        </span>
      </div>

      <div className="guardian-support" aria-label="Detail perjalanan">
        <div className="guardian-support-item">
          <Icon name="bus" size={14} />
          <div>
            <span>Bus</span>
            <strong>{bus}</strong>
            <small>{busDetail}</small>
          </div>
        </div>
        <div className="guardian-support-item">
          <Icon name="route" size={14} />
          <div>
            <span>Rute &amp; titik</span>
            <strong>{route}</strong>
            <small>{direction ? `${direction} · ${stop}` : stop}</small>
          </div>
        </div>
        <div className="guardian-support-item">
          <Icon name="driver" size={14} />
          <div>
            <span>Pengemudi</span>
            <strong>{driver}</strong>
            <small>{driverDetail}</small>
          </div>
        </div>
      </div>
    </article>
  );
}
