import { Icon } from "@/components/ui/Icon";
import { LocalizedText } from "@/components/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/messages";

/**
 * Profil wali versi strip ringkas.
 *
 * Identitas akun berada di kiri, tanggal layanan di kanan, dan ringkasan hari
 * ini menjadi chip terpisah satu baris. Tidak ada panel statistik besar atau
 * informasi per anak yang diulang di bagian atas halaman.
 */
export function GuardianOpsHeader({
  guardianName,
  locale,
  email,
  phone,
  serviceDate,
  childCount,
  tripCount,
  onboardCount,
  waitingCount,
}: {
  guardianName: string;
  locale: Locale;
  email: string | null;
  phone: string | null;
  serviceDate: string;
  childCount: number;
  tripCount: number;
  onboardCount: number;
  waitingCount: number;
}) {
  const initial = (guardianName || "W").slice(0, 1).toUpperCase();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const dateLocale = locale === "ar" ? "ar-SA-u-ca-gregory" : locale === "en" ? "en-GB" : "id-ID";
  const formattedDate = new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Riyadh" }).format(new Date(`${serviceDate}T12:00:00+03:00`));

  return (
    <>
      <section className="guardian-profile" aria-label={locale === "ar" ? "ملف ولي الأمر" : locale === "en" ? "Guardian profile" : "Profil wali"}>
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
            <strong>{formattedDate}</strong>
            <small><LocalizedText k="today" /></small>
          </span>
        </div>
      </section>

      <div className="guardian-stat-chips" aria-label={locale === "ar" ? "ملخص اليوم" : locale === "en" ? "Today’s summary" : "Ringkasan hari ini"}>
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
