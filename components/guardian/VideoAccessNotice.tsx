import { Icon } from "@/components/ui/Icon";
import { LIVE_STATE_COPY, type LiveVideoState } from "@/lib/guardian/live";

/**
 * Penjelasan aturan akses Live Video. Ditampilkan bersama pemutar agar wali
 * memahami kapan akses dibuka, ditutup, dan apa yang tidak disimpan.
 */
export function VideoAccessNotice({
  state,
  childName,
}: {
  state: LiveVideoState;
  childName?: string;
}) {
  const copy = LIVE_STATE_COPY[state];
  const tone = state === "live" ? "success" : state === "ended" ? "neutral" : "info";
  const icon = state === "live" ? "shield" : state === "ended" ? "clock" : "info";

  return (
    <div className={`video-access ${tone}`} role="note">
      <span className="video-access-icon" aria-hidden="true">
        <Icon name={icon} size={16} />
      </span>
      <div>
        <strong>{copy.title}</strong>
        <p>{copy.detail}</p>
        <ul className="video-access-rules">
          <li>Hanya wali yang terhubung dengan {childName ?? "siswa"} ini yang dapat membuka area ini.</li>
          <li>Akses dibuka saat anak berada di dalam bus dan berakhir ketika anak turun.</li>
          <li>Tidak ada rekaman video yang disimpan oleh aplikasi.</li>
        </ul>
      </div>
    </div>
  );
}
