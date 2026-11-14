import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/messages";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Icon } from "@/components/ui/Icon";
import { LocalizedText } from "@/components/i18n/LocaleProvider";
import { signOutAction } from "@/lib/auth-actions";
import type { TripProgress } from "@/lib/driver/trip-progress";

/** Dua baris operasional; detail sekunder di profil, sumber progres dan CTA tetap. */
export async function DriverOpsHeader({
  driverName,
  driverId,
  routeName,
  schoolName,
  direction,
  serviceDate,
  tripStatus,
  startedAt,
  arrivedAt,
  completedAt,
  fleetCode,
  plateNumber,
  capacity,
  progress,
  children,
  activeTab = "dashboard",
}: {
  driverName: string;
  driverId: string;
  routeName: string;
  schoolName: string;
  direction: string;
  serviceDate: string;
  tripStatus: string;
  startedAt: string | null;
  arrivedAt: string | null;
  completedAt: string | null;
  fleetCode: string;
  plateNumber: string | null;
  capacity: number;
  progress: TripProgress;
  children?: ReactNode;
  activeTab?: "dashboard" | "riwayat";
}) {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("sbm_locale")?.value;
  const locale = isLocale(savedLocale) ? savedLocale : defaultLocale;
  const shortId = driverId.slice(0, 8).toUpperCase();
  const date = new Date(`${serviceDate}T12:00:00Z`);
  const shortDate = Number.isNaN(date.getTime()) ? serviceDate : new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory" : locale === "en" ? "en-GB" : "id-ID", {
    day: "numeric", month: "short", timeZone: "UTC",
  }).format(date);

  return (
    <section className="ops-head" aria-label={locale === "ar" ? "ملف السائق والمهام وتقدم الرحلة" : locale === "en" ? "Driver profile, tasks and trip progress" : "Profil pengemudi, tugas, dan progres perjalanan"}>
      {/* Baris 1: identitas brand, rute terpotong, dan profil. */}
      <div className="compact-identity-row">
        <div className="compact-brand-route">
          <BrandLogo href="/pengemudi" size="sm" />
          <h1 className="compact-route" title={`${routeName} • ${shortDate}`}>
            <span>{routeName || <LocalizedText k="route" />}</span><time dateTime={serviceDate}> • {shortDate}</time>
          </h1>
        </div>
        <div className="compact-driver-identity">
          <strong>{driverName || <LocalizedText k="driver" />}</strong>
          <span>ID {shortId} • {plateNumber || <LocalizedText k="plateNotRecorded" />}</span>
        </div>
        <form action={signOutAction} className="compact-logout-form">
          <button className="compact-logout" type="submit" aria-label={translate(locale, "signOut")} title={translate(locale, "signOut")}>
            <Icon name="logout" size={17} />
          </button>
        </form>
      </div>

      <nav className="portal-nav compact-driver-tabs" aria-label={locale === "ar" ? "قائمة السائق" : locale === "en" ? "Driver navigation" : "Navigasi Pengemudi"}>
        <Link href="/pengemudi" aria-current={activeTab === "dashboard" ? "page" : undefined}><LocalizedText k="driverData" /></Link>
        <Link href="/pengemudi?tab=riwayat" aria-current={activeTab === "riwayat" ? "page" : undefined}><LocalizedText k="history" /></Link>
      </nav>
      {/* Baris 2: angka tetap berasal dari TripProgress; handler CTA tetap children. */}
      <div className="compact-action-row">
        <div className="compact-counters" aria-live="polite" aria-label={`Progres ${progress.kindLabel.toLowerCase()}`}>
          <span className="compact-counter"><LocalizedText k="total" />: <b>{progress.total}</b></span>
          <span className="compact-counter" aria-label={`${progress.doneLabel}: ${progress.done}`}>
            {progress.kind === "dropoff" ? <LocalizedText k="droppedOff" /> : <LocalizedText k="pickedUp" />}: <b>{progress.done}</b>
          </span>
          <span className="compact-counter" aria-label={`${progress.waitingLabel}: ${progress.waiting}`}><LocalizedText k="remaining" />: <b>{progress.waiting}</b></span>
          <span className="compact-counter compact-onboard"><LocalizedText k="onBus" />: <b>{progress.onboard}</b></span>
        </div>
        {children && <div className="ops-head-action">{children}</div>}
      </div>
    </section>
  );
}
