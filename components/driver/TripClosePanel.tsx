"use client";

import { useState, type FormEvent } from "react";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { Icon } from "@/components/ui/Icon";
import { SAFETY_CHECKS } from "@/lib/driver/trip-end";
import { formatTime } from "@/lib/validation";
import { confirmArrival, endTrip } from "@/app/pengemudi/actions";

type TripView = {
  id: string;
  status: string;
  started_at: string | null;
  arrived_at: string | null;
  completed_at: string | null;
  safety_checked_at?: string | null;
  student_count_confirmed?: number | null;
};

/**
 * Panel perjalanan dan penutupan pada halaman yang sama.
 *
 * Ringkasan selalu terlihat agar kendali penutupan tidak hilang, sedangkan
 * formulir keselamatan dibuka saat dibutuhkan. Validasi tidak diubah:
 * kedatangan wajib dikonfirmasi, semua siswa wajib dicatat, dan konfirmasi
 * kabin kosong wajib dicentang sebelum perjalanan ditutup. Tombol final "Akhiri" baru
 * aktif setelah seluruh syarat itu terpenuhi, dan Server Action tetap
 * memvalidasi ulang semuanya di server.
 */
export function TripClosePanel({
  assignmentId,
  trip,
  canEndTrip,
  unrecordedNames,
  unclearStudents,
  totalStudents,
}: {
  assignmentId: string;
  trip: TripView | null;
  canEndTrip: boolean;
  unrecordedNames: string[];
  unclearStudents: number;
  totalStudents: number;
}) {
  // Status checkbox hanya dipakai untuk mengaktifkan tombol final; server tetap
  // menjadi penentu terakhir lewat endTrip.
  const [confirmedChecks, setConfirmedChecks] = useState<Record<string, boolean>>({});
  const allRequiredChecksConfirmed = SAFETY_CHECKS.every(
    (check) => !check.required || confirmedChecks[check.name],
  );
  const requirementsMet = canEndTrip && allRequiredChecksConfirmed && unclearStudents === 0;

  const inProgress = trip?.status === "in_progress";
  const completed = trip?.status === "completed";
  const cancelled = trip?.status === "cancelled";
  const summary = completed
    ? trip?.completed_at
      ? `Selesai pukul ${formatTime(trip.completed_at)}`
      : "Perjalanan sudah ditutup"
    : cancelled
      ? "Perjalanan dibatalkan"
      : inProgress
        ? trip?.arrived_at
          ? "Tiba di sekolah; periksa sebelum menutup"
          : "Kedatangan di sekolah belum dicatat"
        : "Belum dimulai";
  const flag =
    inProgress && unrecordedNames.length > 0
      ? `${unrecordedNames.length} siswa belum dicatat`
      : inProgress && unclearStudents > 0
        ? `${unclearStudents} siswa perlu diperiksa`
        : null;

  function syncConfirmations(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    setConfirmedChecks(
      Object.fromEntries(
        SAFETY_CHECKS.map((check) => {
          const field = form.elements.namedItem(check.name);
          return [check.name, field instanceof HTMLInputElement && field.checked];
        }),
      ),
    );
  }

  return (
    <section className={`panel ops-close ops-close-${trip?.status ?? "scheduled"}`} id="perjalanan-keselamatan">
      <details className="ops-close-details">
        <summary>
          <span className="ops-close-icon" aria-hidden="true">
            <Icon name="shield" size={16} />
          </span>
          <span className="ops-close-summary">
            <strong>Perjalanan &amp; keselamatan</strong>
            <small>{summary}</small>
          </span>
          {flag && <span className="ops-close-flag">{flag}</span>}
          <span className="ops-close-open" aria-hidden="true">
            Buka
            <Icon name="chevronRight" size={14} />
          </span>
        </summary>

        <div className="ops-close-body">
          <dl className="task-times">
            <div>
              <dt>Mulai</dt>
              <dd>{trip?.started_at ? formatTime(trip.started_at) : "Belum dimulai"}</dd>
            </div>
            <div>
              <dt>Tiba</dt>
              <dd>{trip?.arrived_at ? formatTime(trip.arrived_at) : "Belum dicatat"}</dd>
            </div>
            <div>
              <dt>Selesai</dt>
              <dd>{trip?.completed_at ? formatTime(trip.completed_at) : "—"}</dd>
            </div>
          </dl>

          {inProgress && trip && (
            <div className="task-action-row">
              {trip.arrived_at ? (
                <div className="arrival-confirmed">
                  <button className="btn btn-secondary" type="button" disabled>
                    Konfirmasi tiba di sekolah
                  </button>
                  <small>Kedatangan sudah dicatat pukul {formatTime(trip.arrived_at)}.</small>
                </div>
              ) : (
                <form action={confirmArrival}>
                  <input type="hidden" name="trip_id" value={trip.id} />
                  <input type="hidden" name="assignment_id" value={assignmentId} />
                  <ConfirmSubmit
                    className="btn btn-secondary"
                    message="Konfirmasi bus sudah tiba di sekolah?"
                    pendingLabel="Menyimpan…"
                  >
                    Konfirmasi tiba di sekolah
                  </ConfirmSubmit>
                </form>
              )}

              <form className="task-end-form" action={endTrip} onChange={syncConfirmations}>
                <input type="hidden" name="trip_id" value={trip.id} />
                <input type="hidden" name="assignment_id" value={assignmentId} />

                {unclearStudents > 0 && (
                  <div className="close-warning" role="alert">
                    <strong>Masih ada {unclearStudents} siswa yang belum dipastikan turun dari bus.</strong>
                    <p>
                      Periksa kabin dan catat status setiap siswa sampai tidak ada penumpang yang tertinggal di dalam bus.
                      Perjalanan belum dapat diakhiri selama masih ada siswa berstatus naik atau belum jelas.
                    </p>
                  </div>
                )}

                <fieldset className="safety-checks">
                  <legend>Pemeriksaan keselamatan</legend>
                  {SAFETY_CHECKS.map((check) => (
                    <label key={check.name} className="safety-check">
                      <input type="checkbox" name={check.name} required={check.required} />
                      <span>{check.label} <small>{check.required ? "Wajib" : "Opsional"}</small></span>
                    </label>
                  ))}
                  <label className="safety-notes">
                    <span>Catatan pemeriksaan (opsional)</span>
                    <textarea
                      name="safety_notes"
                      rows={2}
                      maxLength={400}
                      placeholder="Contoh: lampu kabin kanan diganti sebelum berangkat."
                    />
                  </label>
                </fieldset>

                {!canEndTrip && (
                  <p className="safety-blocked">
                    {!trip.arrived_at && <span>Konfirmasi kedatangan di sekolah belum dicatat. </span>}
                    {unrecordedNames.length > 0 && (
                      <span>
                        Catat status {unrecordedNames.length} siswa berikut sebelum mengakhiri:{" "}
                        {unrecordedNames.join(", ")}.
                      </span>
                    )}
                    {unclearStudents > 0 && (
                      <span> Pastikan seluruh penumpang sudah turun dan tidak ada yang tertinggal di dalam bus.</span>
                    )}
                  </p>
                )}

                <ConfirmSubmit
                  className="btn btn-primary btn-lg ops-end-action"
                  message="Selesaikan checklist keselamatan lalu akhiri perjalanan? Status perjalanan akan menjadi selesai dan tidak dapat dimulai ulang."
                  pendingLabel="Mengakhiri…"
                  disabled={!requirementsMet}
                >
                  Akhiri
                </ConfirmSubmit>
                <p className="ops-close-note">
                  {totalStudents} siswa pada rute ini harus tercatat sebelum perjalanan dapat ditutup.
                </p>
              </form>
            </div>
          )}

          {completed && trip && (
            <>
              <p className="task-completed">
                Perjalanan sudah selesai pada {formatTime(trip.completed_at)}. Catatan kehadiran tersimpan sebagai
                riwayat dan tidak dapat diubah lagi.
                {trip.safety_checked_at && <> Pemeriksaan keselamatan dicatat {formatTime(trip.safety_checked_at)}</>}
                {typeof trip.student_count_confirmed === "number" && (
                  <> untuk {trip.student_count_confirmed} siswa pada rute ini.</>
                )}
              </p>
              <div className="task-action-row task-action-row-ended">
                <button className="btn btn-secondary" type="button" disabled>
                  Konfirmasi tiba di sekolah
                </button>
                <button className="btn btn-primary btn-lg ops-end-action" type="button" disabled>
                  Akhiri
                </button>
                <p className="safety-blocked">
                  Kedua tindakan sudah ditutup karena perjalanan selesai. Perjalanan berikutnya mengikuti penugasan
                  baru.
                </p>
              </div>
            </>
          )}

          {!inProgress && !completed && (
            <div className="task-action-row task-action-row-ended">
              <button className="btn btn-secondary" type="button" disabled>
                Konfirmasi tiba di sekolah
              </button>
              <button className="btn btn-primary btn-lg ops-end-action" type="button" disabled>
                Akhiri
              </button>
              <p className="safety-blocked">
                {cancelled ? (
                  "Perjalanan dibatalkan. Tidak ada kedatangan atau penutupan yang dapat dicatat untuk perjalanan ini."
                ) : (
                  <>
                    Perjalanan belum dimulai. Tekan <strong>Mulai Perjalanan</strong> di header sebelum mencatat
                    kedatangan atau mengakhiri perjalanan.
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </details>
    </section>
  );
}
