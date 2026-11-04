import { EmptyState, Pill } from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";
import {
  STOP_STATUS_LABEL,
  STOP_STATUS_TONE,
  type NavigationPlan,
} from "@/lib/driver/navigation";
import { CoordinateLine, DriverNavigationButton } from "./DriverNavigationButton";

/**
 * Daftar titik jemput dengan status dan tombol navigasi per titik.
 * Status tidak berasal dari GPS: "menuju lokasi" hanya menandai titik berikutnya
 * pada urutan rute yang belum seluruh siswanya dicatat.
 */
export function NavigationStopList({ plan }: { plan: NavigationPlan }) {
  if (plan.stops.length === 0) {
    return (
      <EmptyState
        icon="route"
        title="Belum ada titik jemput"
        detail="Admin Pusat belum menambahkan titik pada rute ini. Navigasi tidak dapat dibuka tanpa titik yang tersimpan."
      />
    );
  }

  return (
    <ol className="nav-stop-list">
      {plan.stops.map((stop) => (
        <li
          key={stop.id}
          className={`nav-stop${stop.isSchool ? " is-school" : ""}${stop.status === "heading" ? " is-next" : ""}`}
        >
          <span className="nav-stop-order" aria-hidden="true">
            {stop.status === "done" ? <Icon name="check" size={15} /> : stop.order}
          </span>

          <div className="nav-stop-body">
            <div className="nav-stop-head">
              <div>
                <strong>{stop.name}</strong>
                <small>
                  {stop.isSchool ? "Gerbang sekolah" : "Titik jemput"} · {stop.order} dari {plan.stops.length}
                  {stop.students.length > 0
                    ? ` · ${stop.students.length} siswa`
                    : " · belum ada siswa"}
                </small>
              </div>
              <Pill tone={STOP_STATUS_TONE[stop.status]}>{STOP_STATUS_LABEL[stop.status]}</Pill>
            </div>

            {stop.students.length > 0 && (
              <p className="nav-stop-students">
                {stop.students.map((student) => student.name).join(", ")}
              </p>
            )}

            <CoordinateLine destination={stop} />

            <DriverNavigationButton
              destination={stop}
              destinationName={stop.name}
              label="Navigasi"
              size="sm"
              variant="secondary"
              disabledMessage={`Titik ${stop.order} belum memiliki koordinat tersimpan, sehingga rute ke titik ini tidak dapat dibuka.`}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
