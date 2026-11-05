import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/validation";

/**
 * Profil wali versi ringkas.
 *
 * Identitas akun sengaja dibuat sebagai informasi sekunder: satu strip kecil
 * dengan avatar, nama, email, label akun, ringkasan hari ini, tanggal, dan satu
 * catatan sumber status. Fokus layar pertama tetap pada status perjalanan anak.
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
    <section className="guardian-profile" aria-label="Profil wali dan ringkasan hari ini">
      <div className="guardian-profile-main">
        <span className="guardian-profile-avatar" aria-hidden="true">
          {initial}
        </span>
        <div className="guardian-profile-ident">
          <div className="guardian-profile-name">
            <strong>{guardianName || "Wali"}</strong>
            <span className="guardian-account-tag">
              <Icon name="shield" size={11} />
              Akun wali
            </span>
          </div>
          <small>
            {email ?? "Email akun belum tersedia"}
            {phone ? ` · ${phone}` : ""}
          </small>
        </div>
      </div>

      <div className="guardian-brief" aria-label="Ringkasan hari ini">
        <span>
          <strong>{childCount}</strong> Anak
        </span>
        <span>
          <strong>{tripCount}</strong> Perjalanan
        </span>
        <span>
          <strong>{onboardCount}</strong> Di bus
        </span>
        <span>
          <strong>{waitingCount}</strong> Belum dijemput
        </span>
      </div>

      <div className="guardian-profile-foot">
        <span className="guardian-profile-date">
          <Icon name="calendar" size={12} />
          {formatDate(serviceDate)}
        </span>
        <span>
          <Icon name="info" size={12} />
          Status dari catatan pengemudi, bukan GPS.
        </span>
      </div>
    </section>
  );
}
