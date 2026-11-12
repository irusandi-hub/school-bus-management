"use client";

import { useState, type FormEvent } from "react";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { SAFETY_CHECKS } from "@/lib/driver/trip-end";
import { confirmArrival, endTrip } from "@/app/pengemudi/actions";

type TripView = { id: string; status: string; arrived_at: string | null };

/** Papan penutupan ringkas: dua checklist dan alasan singkat bila belum dapat diakhiri. */
export function TripClosePanel({
  assignmentId, trip, canEndTrip, unrecordedNames, unclearStudents,
}: {
  assignmentId: string;
  trip: TripView | null;
  canEndTrip: boolean;
  unrecordedNames: string[];
  unclearStudents: number;
}) {
  const [confirmedChecks, setConfirmedChecks] = useState<Record<string, boolean>>({});
  const allRequiredChecksConfirmed = SAFETY_CHECKS.every(
    (check) => !check.required || confirmedChecks[check.name],
  );
  const inProgress = trip?.status === "in_progress";
  const requirementsMet = canEndTrip && allRequiredChecksConfirmed && unclearStudents === 0;

  function syncConfirmations(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    setConfirmedChecks(Object.fromEntries(SAFETY_CHECKS.map((check) => {
      const field = form.elements.namedItem(check.name);
      return [check.name, field instanceof HTMLInputElement && field.checked];
    })));
  }

  if (!inProgress || !trip) return null;

  let blockingReason = "";
  if (!trip.arrived_at) {
    blockingReason = "Belum bisa diakhiri: gunakan tombol di atas untuk menuntaskan status seluruh penumpang.";
  } else if (unrecordedNames.length > 0) {
    blockingReason = `Belum bisa diakhiri: catat status ${unrecordedNames.length} siswa yang belum tercatat.`;
  } else if (unclearStudents > 0) {
    blockingReason = `Belum bisa diakhiri: ${unclearStudents} penumpang belum dipastikan turun dari bus.`;
  } else if (!allRequiredChecksConfirmed) {
    blockingReason = "Belum bisa diakhiri: checklist pemeriksaan kabin wajib dicentang.";
  }

  return (
    <section className="panel ops-close ops-close-compact" id="perjalanan-keselamatan" aria-label="Pemeriksaan akhir perjalanan">
      <form action={confirmArrival} className="ops-passengers-down">
        <input type="hidden" name="trip_id" value={trip.id} />
        <input type="hidden" name="assignment_id" value={assignmentId} />
        <ConfirmSubmit
          className="btn btn-secondary"
          message="Pastikan seluruh penumpang sudah turun dan tidak ada yang tertinggal di dalam bus."
          pendingLabel="Memeriksa…"
          disabled={Boolean(trip.arrived_at)}
        >
          Semua penumpang sudah turun
        </ConfirmSubmit>
        <small>{trip.arrived_at ? "Status seluruh penumpang sudah dituntaskan." : "Satu kali tekan akan mencatat Turun untuk semua siswa, kecuali yang berstatus Tidak Ikut."}</small>
      </form>

      <form className="task-end-form ops-end-compact" action={endTrip} onChange={syncConfirmations}>
        <input type="hidden" name="trip_id" value={trip.id} />
        <input type="hidden" name="assignment_id" value={assignmentId} />
        <fieldset className="safety-checks">
          <legend>Pemeriksaan keselamatan</legend>
          {SAFETY_CHECKS.map((check) => (
            <label key={check.name} className="safety-check">
              <input type="checkbox" name={check.name} required={check.required} />
              <span>{check.label}</span>
            </label>
          ))}
        </fieldset>
        {blockingReason && <p className="safety-blocked" role="status">{blockingReason}</p>}
        <ConfirmSubmit
          className="btn btn-primary btn-lg ops-end-action"
          message="Akhiri perjalanan setelah memastikan seluruh penumpang sudah turun dan kabin kosong?"
          pendingLabel="Mengakhiri…"
          disabled={!requirementsMet}
        >
          Akhiri
        </ConfirmSubmit>
      </form>
    </section>
  );
}
