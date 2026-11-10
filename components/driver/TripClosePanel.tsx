"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
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

function EndSubmit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button className="btn ops-end-submit" type="submit" disabled={pending || disabled}>
      {pending ? "Mengakhiri…" : "Akhiri"}
    </button>
  );
}

/**
 * Satu tombol akhir perjalanan yang membuka menu pemeriksaan keselamatan.
 *
 * Tombol utama tidak memisahkan "Periksa Keselamatan" dari "Akhiri Perjalanan".
 * Validasi server tetap sama: kedatangan wajib dikonfirmasi, siswa tanpa catatan
 * harus dicatat, dan seluruh checklist wajib dicentang sebelum sesi selesai.
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
  const [open, setOpen] = useState(false);
  const inProgress = trip?.status === "in_progress";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!inProgress || !trip) return null;

  return (
    <>
      <button
        className="btn ops-primary-action ops-start-action ops-end-action drive-main-action"
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <Icon name="shield" size={17} /> Akhiri Perjalanan
      </button>

      {open && (
        <div className="drive-dialog-layer">
          <button type="button" className="drive-dialog-backdrop" aria-label="Tutup pengecekan keselamatan" onClick={() => setOpen(false)} />
          <section className="drive-dialog" role="dialog" aria-modal="true" aria-labelledby="safety-dialog-title">
            <header className="drive-dialog-head">
              <div>
                <span className="eyebrow">Langkah terakhir sesi</span>
                <h2 id="safety-dialog-title">Pengecekan keselamatan</h2>
              </div>
              <button type="button" className="drive-dialog-close" onClick={() => setOpen(false)} aria-label="Tutup pengecekan keselamatan">
                <Icon name="close" size={18} />
              </button>
            </header>

            <div className="drive-dialog-body">
              <dl className="task-times">
                <div>
                  <dt>Mulai</dt>
                  <dd>{trip.started_at ? formatTime(trip.started_at) : "Belum dimulai"}</dd>
                </div>
                <div>
                  <dt>Tiba</dt>
                  <dd>{trip.arrived_at ? formatTime(trip.arrived_at) : "Belum dicatat"}</dd>
                </div>
                <div>
                  <dt>Selesai</dt>
                  <dd>Setelah checklist</dd>
                </div>
              </dl>

              {trip.arrived_at ? (
                <p className="drive-arrival-ok">
                  <Icon name="check" size={14} /> Kedatangan di sekolah tercatat pukul {formatTime(trip.arrived_at)}.
                </p>
              ) : (
                <form action={confirmArrival} className="drive-arrival-form">
                  <input type="hidden" name="trip_id" value={trip.id} />
                  <input type="hidden" name="assignment_id" value={assignmentId} />
                  <ConfirmSubmit
                    className="btn btn-secondary"
                    message="Konfirmasi bus sudah tiba di sekolah?"
                    pendingLabel="Menyimpan…"
                  >
                    Konfirmasi tiba di sekolah
                  </ConfirmSubmit>
                  <small>Kedatangan wajib dicatat sebelum sesi dapat diakhiri.</small>
                </form>
              )}

              <form className="task-end-form" action={endTrip}>
                <input type="hidden" name="trip_id" value={trip.id} />
                <input type="hidden" name="assignment_id" value={assignmentId} />

                {unclearStudents > 0 && (
                  <div className="close-warning">
                    <strong>Masih ada {unclearStudents} siswa berstatus naik atau belum dicatat.</strong>
                    <p>Periksa kabin dan pastikan status setiap siswa benar sebelum mengakhiri sesi.</p>
                    <label className="close-check">
                      <input type="checkbox" name="acknowledge_open" value="1" required />
                      <span>Saya sudah memeriksa kabin dan memastikan status siswa tersebut benar.</span>
                    </label>
                  </div>
                )}

                <fieldset className="safety-checks">
                  <legend>Checklist wajib</legend>
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

                <p className="drive-dialog-note">
                  {totalStudents} siswa pada rute ini harus tercatat. Setelah ditekan <b>Akhiri</b>, sesi ini selesai
                  dan tidak dimulai ulang otomatis.
                </p>

                <div className="drive-dialog-actions">
                  <button className="btn btn-secondary" type="button" onClick={() => setOpen(false)}>
                    Batal
                  </button>
                  <EndSubmit disabled={!canEndTrip} />
                </div>
              </form>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
