import { Icon } from "@/components/ui/Icon";
import { LocalizedText } from "@/components/i18n/LocaleProvider";
import { formatDate } from "@/lib/validation";

/**
 * Profil wali versi strip ringkas.
 *
 * Identitas akun berada di kiri, tanggal layanan di kanan, dan ringkasan hari
 * ini menjadi chip terpisah satu baris. Tidak ada panel statistik besar atau
 * informasi per anak yang diulang di bagian atas halaman.
 */
export function GuardianOpsHeader({
  guardianName,
  email,
  phone,
  serviceDate,
  childCount,
  tripCount,
  onboardCount,
  waitingCount,
}: {
  guardianName: string;
  email: string | null;
  phone: string | null;
  serviceDate: string;
  childCount: number;
  tripCount: number;
  onboardCount: number;
  waitingCount: number;
}) {
  const initial = (guardianName || "W").slice(0, 1).toUpperCase();

  return (
    <>
      <section className="guardian-profile" aria-label="Profil wali">
        <div className="guardian-profile-main">
          <span className="guardian-profile-avatar" aria-hidden="true">
            {initial}
          </span>
          <div className="guardian-profile-ident">
            <div className="guardian-profile-name">
              <strong>{guardianName || "Wali"}</strong>
              <span className="guardian-account-tag"><LocalizedText k="guardianRole" /></span>
            </div>
            <small>
              {email ?? <LocalizedText k="guardianEmailMissing" />}
              {phone ? ` · ${phone}` : ""}
            </small>
          </div>
        </div>

        <div className="guardian-profile-date">
          <span className="guardian-profile-date-icon" aria-hidden="true">
            <Icon name="calendar" size={16} />
          </span>
          <span>
            <strong>{formatDate(serviceDate)}</strong>
            <small><LocalizedText k="today" /></small>
          </span>
        </div>
      </section>

      <div className="guardian-stat-chips" aria-label="Ringkasan hari ini">
        <span className="guardian-stat-chip">
          <span className="guardian-stat-chip-icon" aria-hidden="true">
            <Icon name="users" size={15} />
          </span>
          <strong>{childCount}</strong> <LocalizedText k="childrenCount" />
        </span>
        <span className="guardian-stat-chip">
          <span className="guardian-stat-chip-icon" aria-hidden="true">
            <Icon name="route" size={15} />
          </span>
          <strong>{tripCount}</strong> <LocalizedText k="tripsCount" />
        </span>
        <span className="guardian-stat-chip tone-bus">
          <span className="guardian-stat-chip-icon" aria-hidden="true">
            <Icon name="bus" size={15} />
          </span>
          <strong>{onboardCount}</strong> <LocalizedText k="onboard" />
        </span>
        <span className="guardian-stat-chip tone-wait">
          <span className="guardian-stat-chip-icon" aria-hidden="true">
            <Icon name="clock" size={15} />
          </span>
          <strong>{waitingCount}</strong> <LocalizedText k="awaitingPickup" />
        </span>
      </div>
    </>
  );
}
