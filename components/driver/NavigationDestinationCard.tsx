import { Icon } from "@/components/ui/Icon";
import { getRequestLocale } from "@/lib/i18n/server";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";
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
export async function NavigationDestinationCard({
  plan,
  compact = false,
}: {
  plan: NavigationPlan;
  compact?: boolean;
}) {
  const locale = await getRequestLocale();
  const c = (value: string) => translateAdminCopy(value, locale) ?? value;
  const destination = navigationDestination(plan);
  const coordinates = destination ? formatCoordinates(destination) : null;
  const targetLabel = !destination
    ? c(plan.stops.length === 0 ? "Rute belum memiliki titik" : "Perjalanan selesai")
    : plan.target
      ? `${c("Tujuan berikutnya")} · ${c("titik")} ${destination.order}`
      : `${c("Titik pertama")} · ${destination.order} ${c("dari")} ${plan.stops.length}`;

  if (compact) {
    return (
      <div className="nav-compact">
        <div className="nav-compact-main">
          <span className="nav-compact-kicker">
            <Icon name="navigation" size={13} />
            {targetLabel}
          </span>
          <strong>{destination ? destination.name : plan.completed ? c("Perjalanan selesai") : c("Rute belum memiliki titik")}</strong>
          <small>
            {destination
              ? `${studentList(destination.students.map((student) => student.name)) ?? c("Tidak ada siswa")}`
              : plan.completed
                ? c("Akses navigasi ditutup untuk perjalanan ini.")
                : c("Titik jemput belum dibuat Operator Utama.")}
          </small>
          {destination && <CoordinateLine destination={destination} />}
        </div>

        {destination && (
          <DriverNavigationButton
            destination={destination}
            destinationName={destination.name}
            label={c("Navigasi")}
            size="sm"
            variant="secondary"
            disabledMessage={`${c("Titik")} ${destination.order} ${c("belum memiliki koordinat tersimpan.")}`}
          />
        )}
      </div>
    );
  }

  return (
    <section className="nav-destination" aria-label={c("Navigasi perjalanan")}>
      <header className="nav-dest-head">
        <div>
          <p className="eyebrow">{c("NAVIGASI")}</p>
          <h2 className="nav-dest-title">{targetLabel}</h2>
        </div>
        {destination ? (
          <Pill tone={STOP_STATUS_TONE[destination.status]}>{c(STOP_STATUS_LABEL[destination.status])}</Pill>
        ) : (
          <Pill tone={plan.completed ? "success" : "neutral"}>
            {plan.completed ? c("Selesai") : c("Belum ada tujuan")}
          </Pill>
        )}
      </header>

      <div className="nav-route">
        <div className="nav-point nav-origin">
          <span className="nav-dot" aria-hidden="true">
            <Icon name="bus" size={14} />
          </span>
          <div>
            <small>{c("Lokasi awal")}</small>
            <strong>{c(plan.origin.label)}</strong>
            <span>{c(plan.origin.detail)}</span>
          </div>
        </div>

        <div className="nav-connector" aria-hidden="true" />

        <div className="nav-point nav-target">
          <span className="nav-dot" aria-hidden="true">
            <Icon name="pin" size={14} />
          </span>
          <div>
            <small>{c("Tujuan berikutnya")}</small>
            {destination ? (
              <>
                <strong>
                  {destination.order}. {destination.name}
                </strong>
                <span>
                  {destination.isSchool ? c("Gerbang sekolah") : c("Titik jemput")} · titik {destination.order} dari{" "}
                  {plan.stops.length}
                </span>
                {destination.students.length > 0 && (
                  <span>{c("Siswa:")} {studentList(destination.students.map((student) => student.name))}</span>
                )}
                {destination.addresses.length > 0 && (
                  <span>
                    {c("Alamat:")} {destination.addresses.join("; ")}
                    <small className="nav-data-note"> {c("dari data induk siswa")}</small>
                  </span>
                )}
                {destination.students.some((student) => student.pickupNotes) && (
                  <span>
                    {c("Patokan:")}{" "}
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
                <strong>{plan.completed ? c("Perjalanan sudah selesai") : c("Belum ada titik tujuan")}</strong>
                <span>
                  {plan.completed
                    ? c("Navigasi ditutup karena perjalanan sudah ditutup pengemudi.")
                    : c("Rute ini belum memiliki titik jemput. Hubungi Operator Utama.")}
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
            disabledMessage={`${destination.name} ${c("belum memiliki koordinat tersimpan, sehingga rute tidak dapat dibuka. Minta Operator Utama melengkapi koordinat titik ini — alamat tidak boleh ditebak.")}`}
          />
        </div>
      ) : (
        <p className="nav-hint">
          {plan.completed
            ? c("Perjalanan selesai tetap tersimpan. Status ini berasal dari catatan pengemudi, bukan dari GPS.")
            : c("Tidak ada tujuan yang dapat dibuka.")}
        </p>
      )}

      <footer className="nav-dest-foot">
        <Icon name="info" size={13} />
        <span>
          {c("Status titik berasal dari urutan rute dan catatan kehadiran siswa. Posisi bus belum dilacak karena integrasi GPS belum aktif, dan navigasi eksternal tidak mengubah status siswa.")}
        </span>
      </footer>
    </section>
  );
}
