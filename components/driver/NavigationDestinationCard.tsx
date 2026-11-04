import { Icon } from "@/components/ui/Icon";
import { Pill } from "@/components/admin/ui";
import {
  STOP_STATUS_LABEL,
  STOP_STATUS_TONE,
  describeTarget,
  navigationDestination,
  type NavigationPlan,
} from "@/lib/driver/navigation";
import { formatCoordinates } from "@/lib/navigation/external";
import { CoordinateLine, DriverNavigationButton } from "./DriverNavigationButton";

function studentList(names: string[]) {
  if (names.length === 0) return null;
  return names.join(", ");
}

/**
 * Kartu tujuan navigasi.
 *
 * Versi penuh dipakai pada detail tugas: lokasi awal, tujuan berikutnya, urutan
 * titik, siswa, alamat, dan tombol MULAI NAVIGASI. Versi ringkas dipakai pada
 * dashboard dan daftar tugas agar pengemudi tetap bisa navigasi tanpa membuka
 * detail.
 */
export function NavigationDestinationCard({
  plan,
  compact = false,
}: {
  plan: NavigationPlan;
  compact?: boolean;
}) {
  const destination = navigationDestination(plan);
  const coordinates = destination ? formatCoordinates(destination) : null;

  if (compact) {
    return (
      <div className="nav-compact">
        <div className="nav-compact-main">
          <span className="nav-compact-kicker">
            <Icon name="navigation" size={13} />
            {describeTarget(plan)}
          </span>
          <strong>{destination ? destination.name : plan.completed ? "Perjalanan selesai" : "Rute belum memiliki titik"}</strong>
          <small>
            {destination
              ? `${studentList(destination.students.map((student) => student.name)) ?? "Tidak ada siswa"}`
              : plan.completed
                ? "Akses navigasi ditutup untuk perjalanan ini."
                : "Titik jemput belum dibuat Admin Pusat."}
          </small>
          {destination && <CoordinateLine destination={destination} />}
        </div>

        {destination && (
          <DriverNavigationButton
            destination={destination}
            destinationName={destination.name}
            label="Navigasi"
            size="sm"
            variant="secondary"
            disabledMessage={`Titik ${destination.order} belum memiliki koordinat tersimpan.`}
          />
        )}
      </div>
    );
  }

  return (
    <section className="nav-destination" aria-label="Navigasi perjalanan">
      <header className="nav-dest-head">
        <div>
          <p className="eyebrow">NAVIGASI</p>
          <h2 className="nav-dest-title">{describeTarget(plan)}</h2>
        </div>
        {destination ? (
          <Pill tone={STOP_STATUS_TONE[destination.status]}>{STOP_STATUS_LABEL[destination.status]}</Pill>
        ) : (
          <Pill tone={plan.completed ? "success" : "neutral"}>
            {plan.completed ? "Selesai" : "Belum ada tujuan"}
          </Pill>
        )}
      </header>

      <div className="nav-route">
        <div className="nav-point nav-origin">
          <span className="nav-dot" aria-hidden="true">
            <Icon name="bus" size={14} />
          </span>
          <div>
            <small>Lokasi awal</small>
            <strong>{plan.origin.label}</strong>
            <span>{plan.origin.detail}</span>
          </div>
        </div>

        <div className="nav-connector" aria-hidden="true" />

        <div className="nav-point nav-target">
          <span className="nav-dot" aria-hidden="true">
            <Icon name="pin" size={14} />
          </span>
          <div>
            <small>Tujuan berikutnya</small>
            {destination ? (
              <>
                <strong>
                  {destination.order}. {destination.name}
                </strong>
                <span>
                  {destination.isSchool ? "Gerbang sekolah" : "Titik jemput"} · titik {destination.order} dari{" "}
                  {plan.stops.length}
                </span>
                {destination.students.length > 0 && (
                  <span>Siswa: {studentList(destination.students.map((student) => student.name))}</span>
                )}
                {destination.addresses.length > 0 && (
                  <span>
                    Alamat: {destination.addresses.join("; ")}
                    <small className="nav-data-note"> dari data induk siswa</small>
                  </span>
                )}
                {destination.students.some((student) => student.pickupNotes) && (
                  <span>
                    Patokan:{" "}
                    {destination.students
                      .map((student) => student.pickupNotes)
                      .filter(Boolean)
                      .join("; ")}
                  </span>
                )}
                <CoordinateLine destination={destination} />
              </>
            ) : (
              <>
                <strong>{plan.completed ? "Perjalanan sudah selesai" : "Belum ada titik tujuan"}</strong>
                <span>
                  {plan.completed
                    ? "Navigasi ditutup karena perjalanan sudah ditutup pengemudi."
                    : "Rute ini belum memiliki titik jemput. Hubungi Admin Pusat atau operator."}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {destination ? (
        <div className="nav-dest-actions">
          <DriverNavigationButton
            destination={destination}
            destinationName={destination.name}
            showAlternatives
            disabledMessage={`${destination.name} belum memiliki koordinat tersimpan, sehingga rute tidak dapat dibuka. Minta Admin Pusat melengkapi koordinat titik ini — alamat tidak boleh ditebak.`}
          />
        </div>
      ) : (
        <p className="nav-hint">
          {plan.completed
            ? "Perjalanan selesai tetap tersimpan. Status ini berasal dari catatan pengemudi, bukan dari GPS."
            : "Tidak ada tujuan yang dapat dibuka."}
        </p>
      )}

      <footer className="nav-dest-foot">
        <Icon name="info" size={13} />
        <span>
          Status titik berasal dari urutan rute dan catatan kehadiran siswa. Posisi bus belum dilacak karena integrasi
          GPS belum aktif, dan navigasi eksternal tidak mengubah status siswa.
        </span>
      </footer>
    </section>
  );
}
