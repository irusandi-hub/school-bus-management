import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/validation";

/**
 * Header satu halaman wali.
 *
 * Identitas akun dan ringkasan anak dibuat sekunder terhadap status perjalanan
 * anak di bawahnya, sehingga ponsel tidak dipenuhi header sebelum informasi
 * utama terlihat.
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
    <section className="ops-head guardian-ops-head" aria-label="Profil wali dan ringkasan hari ini">
      <div className="ops-head-top">
        <span className="ops-avatar" aria-hidden="true">
          {initial}
        </span>
        <div className="ops-ident">
          <strong>{guardianName || "Wali"}</strong>
          <small>
            {email ?? "Email akun belum tersedia"}
            {phone ? ` · ${phone}` : ""}
          </small>
        </div>
        <span className="guardian-account-tag">
          <Icon name="shield" size={13} />
          Akun wali
        </span>
      </div>

      <dl className="ops-meta">
        <div>
          <dt>Anak terhubung</dt>
          <dd>{childCount}</dd>
          <small>Layanan aktif pada akun ini</small>
        </div>
        <div>
          <dt>Perjalanan hari ini</dt>
          <dd>{tripCount}</dd>
          <small>Dari penugasan yang tersimpan</small>
        </div>
        <div>
          <dt>Di dalam bus</dt>
          <dd>{onboardCount}</dd>
          <small>Berdasarkan catatan pengemudi</small>
        </div>
        <div>
          <dt>Belum dijemput</dt>
          <dd>{waitingCount}</dd>
          <small>Terjadwal atau belum dicatat naik</small>
        </div>
      </dl>

      <div className="guardian-head-foot">
        <span>
          <Icon name="calendar" size={13} />
          {formatDate(serviceDate)}
        </span>
        <span>
          <Icon name="info" size={13} />
          Status perjalanan berasal dari catatan pengemudi, bukan GPS.
        </span>
      </div>
    </section>
  );
}
