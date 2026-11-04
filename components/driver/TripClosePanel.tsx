import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
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
 * Validasi keselamatan tidak diubah: kedatangan wajib dikonfirmasi, semua siswa
 * wajib dicatat, dan pemeriksaan kabin wajib dicentang sebelum perjalanan ditutup.
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
  const inProgress = trip?.status === "in_progress";
  const completed = trip?.status === "completed";

  return (
    <section className="panel ops-close" aria-label="Perjalanan dan keselamatan">
      <header className="panel-head">
        <div>
          <h2 className="panel-title">Perjalanan &amp; keselamatan</h2>
          <div className="panel-subtitle">
            {completed
              ? "Perjalanan sudah ditutup dan tersimpan sebagai riwayat."
              : "Catat semua siswa, lalu selesaikan pemeriksaan sebelum menutup perjalanan."}
          </div>
        </div>
      </header>

      <div className="task-action-body">
        {trip && trip.status !== "scheduled" && (
          <dl className="task-times">
            <div>
              <dt>Mulai</dt>
              <dd>{formatTime(trip.started_at)}</dd>
            </div>
            <div>
              <dt>Tiba di sekolah</dt>
              <dd>{trip.arrived_at ? formatTime(trip.arrived_at) : "Belum dikonfirmasi"}</dd>
            </div>
            <div>
              <dt>Selesai</dt>
              <dd>{trip.completed_at ? formatTime(trip.completed_at) : "—"}</dd>
            </div>
          </dl>
        )}

        {inProgress && trip && (
          <div className="task-action-row">
            {!trip.arrived_at && (
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

            <form className="task-end-form" action={endTrip}>
              <input type="hidden" name="trip_id" value={trip.id} />
              <input type="hidden" name="assignment_id" value={assignmentId} />

              {unclearStudents > 0 && (
                <div className="close-warning">
                  <strong>Masih ada {unclearStudents} siswa berstatus naik atau belum dicatat.</strong>
                  <p>
                    Periksa kabin dan pastikan status setiap siswa benar. Siswa tanpa catatan tetap wajib dicatat
                    terlebih dahulu.
                  </p>
                  <label className="close-check">
                    <input type="checkbox" name="acknowledge_open" value="1" required />
                    <span>Saya sudah memeriksa kabin dan memastikan status siswa tersebut benar.</span>
                  </label>
                </div>
              )}

              <fieldset className="safety-checks">
                <legend>Pemeriksaan keselamatan wajib</legend>
                {SAFETY_CHECKS.map((check) => (
                  <label key={check.name} className="safety-check">
                    <input type="checkbox" name={check.name} required />
                    <span>{check.label}</span>
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
                </p>
              )}

              <ConfirmSubmit
                className="btn btn-primary btn-lg"
                message="Akhiri perjalanan ini? Status perjalanan akan menjadi selesai dan tidak dapat dimulai ulang."
                pendingLabel="Mengakhiri…"
                disabled={!canEndTrip}
              >
                Akhiri perjalanan
              </ConfirmSubmit>
              <p className="ops-close-note">
                {totalStudents} siswa pada rute ini harus tercatat sebelum perjalanan dapat ditutup.
              </p>
            </form>
          </div>
        )}

        {completed && trip && (
          <p className="task-completed">
            Perjalanan sudah selesai pada {formatTime(trip.completed_at)}. Catatan kehadiran tersimpan sebagai riwayat
            dan tidak dapat diubah lagi.
            {trip.safety_checked_at && <> Pemeriksaan keselamatan dicatat {formatTime(trip.safety_checked_at)}</>}
            {typeof trip.student_count_confirmed === "number" && (
              <> untuk {trip.student_count_confirmed} siswa pada rute ini.</>
            )}
          </p>
        )}
      </div>
    </section>
  );
}
