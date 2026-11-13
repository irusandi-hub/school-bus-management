import { Icon } from "@/components/ui/Icon";
import { LIVE_STATE_COPY, type LiveVideoState } from "@/lib/guardian/live";
import { getRequestLocale } from "@/lib/i18n/server";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

/**
 * Penjelasan aturan akses Live Video. Ditampilkan bersama pemutar agar wali
 * memahami kapan akses dibuka, ditutup, dan apa yang tidak disimpan.
 */
export async function VideoAccessNotice({
  state,
  childName,
}: {
  state: LiveVideoState;
  childName?: string;
}) {
  const locale = await getRequestLocale();
  const translateCopy = (value: string) => translateAdminCopy(value, locale) ?? value;
  const stateCopy = LIVE_STATE_COPY[state];
  const tone = state === "live" ? "success" : state === "ended" ? "neutral" : "info";
  const icon = state === "live" ? "shield" : state === "ended" ? "clock" : "info";

  return (
    <div className={`video-access ${tone}`} role="note">
      <span className="video-access-icon" aria-hidden="true">
        <Icon name={icon} size={16} />
      </span>
      <div>
        <strong>{translateCopy(stateCopy.title)}</strong>
        <p>{translateCopy(stateCopy.detail)}</p>
        <ul className="video-access-rules">
          <li>{translateCopy("Hanya wali yang terhubung dengan")} {childName ?? translateCopy("Siswa")} {translateCopy("ini yang dapat membuka area ini.")}</li>
          <li>{translateCopy("Akses dibuka saat anak berada di dalam bus dan berakhir ketika anak turun.")}</li>
          <li>{translateCopy("Tidak ada rekaman video yang disimpan oleh aplikasi.")}</li>
        </ul>
      </div>
    </div>
  );
}
