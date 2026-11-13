import { canOpenRouteNavigation } from "@/lib/driver/navigation-availability";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/messages";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";
import { nextPickupMessage } from "@/lib/ui/copy";
import { Icon } from "@/components/ui/Icon";
import type { FullRoute, NavigationPlan } from "@/lib/driver/navigation";
import type { NextStopResult } from "@/lib/driver/trip-progress";
import { NavigationStopList } from "./NavigationStopList";

/**
 * Blok navigasi utama halaman pengemudi.
 *
 * Satu tombol membuka SATU rute berisi seluruh titik yang masih harus dilalui.
 * Urutan tidak pernah diubah di sini, siswa yang tidak ikut dilewati tanpa
 * menggeser titik lain, dan titik tanpa koordinat tidak dikirim maupun ditebak.
 *
 * Panel dibuat ringkas agar dapat berdampingan dengan tindakan siswa pada
 * ponsel. Daftar titik dan catatan rinci tersedia lewat area yang dapat dibuka.
 */
export async function FullRouteNavigator({
  plan,
  route,
  mapUrl,
  direction,
  tripStatus,
  nextStop,
}: {
  plan: NavigationPlan;
  route: FullRoute;
  mapUrl: string | null;
  direction: string;
  tripStatus: string;
  nextStop: NextStopResult;
}) {
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const c = (value: string) => translateAdminCopy(value, locale) ?? value;
  const directionLabel = direction === "morning" ? t("morningDirection") : direction === "afternoon" ? t("afternoonDirection") : t("directionNotRecorded");
  const completed = plan.completed;
  const navigationEnabled = canOpenRouteNavigation(tripStatus, mapUrl);
  const activeCount = route.activeStops.length;
  const hasStudents = plan.stops.some((stop) => stop.students.length > 0);
  const showNextStudent = tripStatus === "in_progress" && Boolean(nextStop.target);
  const noTargetTitle = c(nextPickupMessage(tripStatus, hasStudents, direction) ?? "");
  const skipReasons = Object.fromEntries(
    route.stops
      .filter((entry) => entry.skipReason)
      .map((entry) => [entry.stop.id, entry.skipReason as string]),
  );
  const ctaReason = completed
    ? c("Perjalanan selesai.")
    : tripStatus !== "in_progress"
      ? c("Mulai perjalanan untuk membuka navigasi.")
    : activeCount === 0
      ? c("Tidak ada titik tersisa.")
      : !mapUrl
        ? c("Koordinat titik belum lengkap.")
        : `${activeCount} ${locale === "en" ? "stops" : locale === "ar" ? "نقاط" : "titik"} · ${route.pendingStudents} ${t("studentCountLabel")}`;

  return (
    <section className="route-card ops-nav-panel" aria-label={c("Navigasi rute lengkap")}>
      <header className="route-head">
        <div className="route-head-top">
          <span className="ops-panel-eyebrow">
            <Icon name="navigation" size={13} /> {c("Navigasi rute")}
          </span>
          <span className="route-direction">{directionLabel}</span>
        </div>
        <h2>
          {completed ? c("Rute sudah selesai") : `${activeCount} ${locale === "en" ? "active stops" : locale === "ar" ? "نقاط نشطة" : "titik aktif"}`}
          <span className="ops-panel-count">{route.pendingStudents} {t("studentCountLabel")}</span>
        </h2>
        <p className="route-lock" title={route.locked ? c("Urutan titik terkunci sejak perjalanan dimulai.") : c("Urutan titik ditetapkan sistem sebelum perjalanan dimulai.")}>
          <Icon name={route.locked ? "shield" : "route"} size={12} />
          {route.locked ? (locale === "en" ? "Order locked." : locale === "ar" ? "الترتيب ثابت." : "Urutan terkunci.") : (locale === "en" ? "System-defined order." : locale === "ar" ? "الترتيب محدد من النظام." : "Urutan ditetapkan sistem.")}
        </p>
      </header>

      {tripStatus !== "in_progress" ? (
        <button className="route-cta route-cta-disabled" type="button" disabled>
          <span className="route-cta-icon" aria-hidden="true">
            <Icon name="check" size={19} />
          </span>
          <span className="route-cta-copy">
            <strong>{c("Buka Navigasi")}</strong>
            <small>{ctaReason}</small>
          </span>
        </button>
      ) : navigationEnabled && mapUrl ? (
        <a className="route-cta" href={mapUrl} target="_blank" rel="noopener noreferrer">
          <span className="route-cta-icon" aria-hidden="true">
            <Icon name="navigation" size={19} />
          </span>
          <span className="route-cta-copy">
            <strong>{c("Buka Navigasi")}</strong>
            <small>{ctaReason}</small>
          </span>
          <Icon name="arrowRight" size={17} />
        </a>
      ) : (
        <button className="route-cta route-cta-disabled" type="button" disabled>
          <span className="route-cta-icon" aria-hidden="true">
            <Icon name="gpsOff" size={19} />
          </span>
          <span className="route-cta-copy">
            <strong>Buka Navigasi</strong>
            <small>{ctaReason}</small>
          </span>
        </button>
      )}

      <section
        className={`ops-next${showNextStudent ? " is-active" : " is-complete"}${nextStop.closedReason ? " is-closed" : ""}`}
        aria-live="polite"
        aria-label={locale === "en" ? "Next student information" : locale === "ar" ? "معلومات الطالب التالي" : "Informasi siswa berikutnya"}
      >
        {showNextStudent && nextStop.target ? (
          <>
            <span className="ops-next-eyebrow"><Icon name="pin" size={12} />{nextStop.target.kindLabel}</span>
            <div className="ops-next-heading">
              <strong>{nextStop.target.students.map((student) => `${student.name} • ${student.admissionsNumber ?? c("Nomor induk belum tercatat")}`).join(", ")}</strong>
            </div>
          </>
        ) : (
          <div className="ops-next-empty">
            <strong>{noTargetTitle}</strong>
          </div>
        )}
      </section>

      {route.missingCoordinateStops.length > 0 && (
        <details className="route-warn" role="alert">
          <summary>
            <Icon name="alert" size={14} />
            <strong>{route.missingCoordinateStops.length} {locale === "en" ? "stops without coordinates" : locale === "ar" ? "نقاط بلا إحداثيات" : "titik tanpa koordinat"}</strong>
          </summary>
          <p>
            {route.missingCoordinateStops.map((stop) => `${stop.order}. ${stop.name}`).join(", ")}. {c("Titik ini tidak dikirim ke aplikasi peta; lengkapi koordinat lewat Operator Utama.")}
          </p>
        </details>
      )}

      {route.omittedStops.length > 0 && (
        <details className="route-warn" role="alert">
          <summary>
            <Icon name="info" size={14} />
            <strong>{route.omittedStops.length} {locale === "en" ? "stops not sent to the map" : locale === "ar" ? "نقاط لم تُرسل إلى الخريطة" : "titik tidak dikirim ke peta"}</strong>
          </summary>
          <p>
            {locale === "en" ? `The map app receives ${route.mapStops.length} of ${activeCount} stops in this demo. Other stops remain in order in the app and are not claimed as sent.` : locale === "ar" ? `يستقبل تطبيق الخرائط ${route.mapStops.length} من أصل ${activeCount} نقطة في هذا العرض. وتظل النقاط الأخرى مرتبة في التطبيق دون الادعاء بإرسالها.` : `Aplikasi peta menerima ${route.mapStops.length} dari ${activeCount} titik pada demo ini. Titik lain tetap tampil berurutan di aplikasi dan tidak diklaim sudah terkirim.`}
          </p>
        </details>
      )}

      <details className="route-stops">
        <summary>
          <span>
            <Icon name="pin" size={14} /> {c("Titik pemberhentian")}
          </span>
          <span>{route.stops.length}</span>
        </summary>
        <div className="route-stops-scroll">
          <NavigationStopList plan={plan} skipReasons={skipReasons} />
        </div>
      </details>

      <details className="route-note">
        <summary>{c("Catatan rute dan aplikasi peta")}</summary>
        <ul>
          <li>
            {locale === "en" ? `The route opens in Google Maps as one link containing ${route.mapStops.length} stops in this demo: up to 3 intermediate stops in route order, plus the final destination. Other stops remain visible in the app and are not claimed as sent.` : locale === "ar" ? `يفتح المسار في خرائط Google كرابط واحد يتضمن ${route.mapStops.length} نقطة في هذا العرض: حتى 3 نقاط وسيطة حسب ترتيب المسار، بالإضافة إلى الوجهة النهائية. وتظل النقاط الأخرى ظاهرة في التطبيق دون الادعاء بإرسالها.` : `Rute dibuka di Google Maps sebagai satu tautan berisi ${route.mapStops.length} titik pada demo ini: maksimal 3 titik antara sesuai urutan rute, ditambah tujuan akhir. Titik lain tetap tampil berurutan di aplikasi dan tidak diklaim sudah terkirim.`}
          </li>
          <li>
            {c("Aplikasi peta hanya menghitung jalur jalan antartitik. Urutan relatif titik yang tersisa tidak boleh berubah, dan rute belum diverifikasi untuk ukuran bus — ikuti rambu dan kondisi jalan.")}
          </li>
          <li>
            {c("Status titik berasal dari urutan rute dan catatan pengemudi, bukan GPS. Membuka navigasi tidak mengubah status siswa maupun menyelesaikan titik.")}
          </li>
        </ul>
      </details>

      <p className="route-foot">
        <Icon name="info" size={12} /> {tripStatus === "scheduled" ? (locale === "en" ? "Navigation is active after the trip starts. " : locale === "ar" ? "تُفعّل الملاحة بعد بدء الرحلة. " : "Navigasi aktif setelah perjalanan dimulai. ") : ""}
        {c("GPS HP aktif selama perjalanan; jarak dan ETA belum tersedia.")}
      </p>
    </section>
  );
}
