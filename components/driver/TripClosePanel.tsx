"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { SAFETY_CHECKS } from "@/lib/driver/trip-end";
import { confirmArrival, endTrip } from "@/app/pengemudi/actions";
import { Icon } from "@/components/ui/Icon";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

type TripView = { id: string; status: string; arrived_at: string | null };

/** Pemeriksaan akhir ditampilkan sebagai overlay agar tidak menggeser dashboard operasional. */
export function TripClosePanel({
  assignmentId, trip, canEndTrip, unrecordedNames, unclearStudents, initialOpen = false,
}: {
  assignmentId: string;
  trip: TripView | null;
  initialOpen?: boolean;
  canEndTrip: boolean;
  unrecordedNames: string[];
  unclearStudents: number;
}) {
  const router = useRouter();
  const { locale, t } = useLocale();
  const copy = (value: string) => translateAdminCopy(value, locale) ?? value;
  const [isOpen, setIsOpen] = useState(false);
  const [confirmedChecks, setConfirmedChecks] = useState<Record<string, boolean>>({});
  const allRequiredChecksConfirmed = SAFETY_CHECKS.every(
    (check) => !check.required || confirmedChecks[check.name],
  );
  const inProgress = trip?.status === "in_progress";
  const requirementsMet = canEndTrip && allRequiredChecksConfirmed && unclearStudents === 0;

  // Setiap pergantian sesi/status mengosongkan checklist dan menutup overlay lama.
  // Jika URL memang meminta panel keselamatan, buka kembali setelah state direset.
  useEffect(() => {
    setConfirmedChecks({});
    setIsOpen(initialOpen);
  }, [trip?.id, trip?.status, initialOpen]);

  function closePanel() {
    setConfirmedChecks({});
    setIsOpen(false);
    router.replace(`/pengemudi?tugas=${encodeURIComponent(assignmentId)}`, { scroll: false });
  }

  useEffect(() => {
    const openPanel = () => setIsOpen(true);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };
    window.addEventListener("schoolbus:open-trip-safety", openPanel);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("schoolbus:open-trip-safety", openPanel);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [assignmentId, router]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  function syncConfirmations(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    setConfirmedChecks(Object.fromEntries(SAFETY_CHECKS.map((check) => {
      const field = form.elements.namedItem(check.name);
      return [check.name, field instanceof HTMLInputElement && field.checked];
    })));
  }

  if (!inProgress || !trip || !isOpen) return null;

  let blockingReason = "";
  if (!trip.arrived_at) {
    blockingReason = copy("Belum bisa diakhiri: gunakan tombol di atas untuk menuntaskan status seluruh penumpang.");
  } else if (unrecordedNames.length > 0) {
    blockingReason = locale === "en" ? `Cannot end yet: record the status of ${unrecordedNames.length} unrecorded students.` : locale === "ar" ? `لا يمكن الإنهاء بعد: سجّل حالة ${unrecordedNames.length} طالباً لم تُسجل حالتهم.` : `Belum bisa diakhiri: catat status ${unrecordedNames.length} siswa yang belum tercatat.`;
  } else if (unclearStudents > 0) {
    blockingReason = locale === "en" ? `Cannot end yet: ${unclearStudents} passengers have not been confirmed off the bus.` : locale === "ar" ? `لا يمكن الإنهاء بعد: لم يتم التأكد من نزول ${unclearStudents} من الركاب.` : `Belum bisa diakhiri: ${unclearStudents} penumpang belum dipastikan turun dari bus.`;
  } else if (!allRequiredChecksConfirmed) {
    blockingReason = copy("Belum bisa diakhiri: checklist pemeriksaan kabin wajib dicentang.");
  }

  return (
    <div className="ops-safety-overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget) closePanel();
    }}>
      <section
        className="panel ops-close ops-close-compact ops-safety-dialog"
        id="perjalanan-keselamatan"
        role="dialog"
        aria-modal="true"
        aria-labelledby="perjalanan-keselamatan-title"
      >
        <header className="ops-safety-dialog-head">
          <h2 id="perjalanan-keselamatan-title">{copy("Akhiri Perjalanan")}</h2>
          <button type="button" className="ops-safety-close" aria-label={t("close")} onClick={closePanel}>
            <Icon name="x" size={20} />
          </button>
        </header>

        <form action={confirmArrival} className="ops-passengers-down">
          <input type="hidden" name="trip_id" value={trip.id} />
          <input type="hidden" name="assignment_id" value={assignmentId} />
          <ConfirmSubmit
            className="btn btn-secondary"
            message={copy("Pastikan seluruh penumpang sudah turun dan tidak ada yang tertinggal di dalam bus.")}
            pendingLabel={copy("Memeriksa…")}
            disabled={unclearStudents === 0 && Boolean(trip.arrived_at)}
          >
            {copy("Semua penumpang sudah turun")}
          </ConfirmSubmit>
          <small>{trip.arrived_at ? copy("Status seluruh penumpang sudah dituntaskan.") : copy("Satu kali tekan akan mencatat Turun untuk semua siswa, kecuali yang berstatus Tidak Ikut.")}</small>
        </form>

        <form className="task-end-form ops-end-compact" action={endTrip} onChange={syncConfirmations}>
          <input type="hidden" name="trip_id" value={trip.id} />
          <input type="hidden" name="assignment_id" value={assignmentId} />
          <fieldset className="safety-checks">
            <legend>{copy("Pemeriksaan keselamatan")}</legend>
            {SAFETY_CHECKS.map((check) => (
              <label key={check.name} className="safety-check">
                <input type="checkbox" name={check.name} required={check.required} />
                <span>{copy(check.label)}</span>
              </label>
            ))}
          </fieldset>
          {blockingReason && <p className="safety-blocked" role="status">{blockingReason}</p>}
          <ConfirmSubmit
            className="btn btn-primary btn-lg ops-end-action"
            message={copy("Akhiri perjalanan setelah memastikan seluruh penumpang sudah turun dan kabin kosong?")}
            pendingLabel={copy("Mengakhiri…")}
            disabled={!requirementsMet}
          >
            <Icon name="bus" size={16} style={{ color: "#F5C542" }} /> {copy("Akhiri")}
          </ConfirmSubmit>
        </form>
      </section>
    </div>
  );
}
