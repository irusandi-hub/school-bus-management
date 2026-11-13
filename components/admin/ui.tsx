import Link from "next/link";
import { cookies } from "next/headers";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/messages";
import { translateNavigationLabel } from "@/lib/i18n/navigation";
import { UI_COPY } from "@/lib/ui/copy";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { serviceStatusLabel, tripStatusLabel } from "@/lib/validation";

export type Crumb = { href?: string; label: string };

/** Remah roti bersama: satu pola untuk semua halaman detail. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Posisi halaman">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} style={{ display: "contents" }}>
          {index > 0 && <span className="crumb-sep" aria-hidden="true">/</span>}
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export async function PageHeader({
  title,
  description,
  actions,
  crumbs,
  eyebrow,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  crumbs?: Crumb[];
  eyebrow?: string;
}) {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("sbm_locale")?.value;
  const locale = isLocale(savedLocale) ? savedLocale : defaultLocale;
  return (
    <>
      {crumbs && crumbs.length > 0 && <Breadcrumbs items={crumbs} />}
      <header className="admin-page-head">
        <div className="admin-page-head-copy">
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1>{translateNavigationLabel(title, locale)}</h1>
          <p>{description}</p>
        </div>
        {actions && <div className="admin-page-actions">{actions}</div>}
      </header>
    </>
  );
}

export function Notice({
  kind = "info",
  children,
}: {
  kind?: "info" | "success" | "error" | "warning";
  children: ReactNode;
}) {
  const message = typeof children === "string" && /^(Data|Daftar) belum dapat dimuat\./.test(children) ? UI_COPY.loadFailed : children;
  return (
    <p className={`form-alert ${kind}`} role={kind === "error" ? "alert" : "status"}>
      {message}
    </p>
  );
}

export function Pill({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  children: ReactNode;
}) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

/** Status perjalanan memakai satu pemetaan warna di seluruh area. */
export async function TripStatusPill({ status }: { status: string | null | undefined }) {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("sbm_locale")?.value;
  const locale = isLocale(savedLocale) ? savedLocale : defaultLocale;
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  if (!status || status === "scheduled") return <Pill tone="neutral">{t("notStarted")}</Pill>;
  const tone =
    status === "completed" ? "success" : status === "in_progress" ? "info" : status === "cancelled" ? "danger" : "warning";
  const statusKey = status === "in_progress" ? "inProgress" : status === "completed" ? "completed" : status === "cancelled" ? "tripCancelledLabel" : status === "delayed" ? "tripDelayed" : "status";
  return <Pill tone={tone}>{t(statusKey)}</Pill>;
}

/** Status layanan siswa: aktif, jeda, dan berakhir dibedakan jelas. */
export async function ServiceStatusPill({ status }: { status: string }) {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("sbm_locale")?.value;
  const locale = isLocale(savedLocale) ? savedLocale : defaultLocale;
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const tone = status === "active" ? "success" : status === "paused" ? "warning" : "neutral";
  const label = status === "active" ? t("statusActive") : status === "paused" ? (locale === "id" ? "Sementara tidak aktif" : locale === "en" ? "Temporarily paused" : "متوقف مؤقتاً") : (locale === "id" ? "Dihentikan" : locale === "en" ? "Ended" : "منتهية");
  return <Pill tone={tone}>{label}</Pill>;
}

export function StatCard({
  label,
  value,
  note,
  icon,
  tone,
}: {
  label: string;
  value: ReactNode;
  note?: string;
  icon: string;
  tone?: "default" | "live" | "wait" | "done";
}) {
  return (
    <article className={`stat-card ${tone && tone !== "default" ? `tone-${tone}` : ""}`}>
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon" aria-hidden="true">
          <Icon name={icon} />
        </span>
      </div>
      <div className="stat-value">{value}</div>
      {note && <div className="stat-note">{note}</div>}
    </article>
  );
}

/** State kosong yang dipakai di luar tabel (panel, kartu, halaman). */
export function MetricStrip({
  label,
  items,
}: {
  label: string;
  items: { label: string; value: ReactNode; note?: string; icon: string }[];
}) {
  return (
    <section className="metric-strip" aria-label={label}>
      {items.map((item) => (
        <div className="metric-item" key={item.label}>
          <span className="metric-icon" aria-hidden="true">
            <Icon name={item.icon} size={16} />
          </span>
          <div className="metric-copy">
            <span className="metric-label">{item.label}</span>
            <strong className="metric-value">{item.value}</strong>
            {item.note && <small>{item.note}</small>}
          </div>
        </div>
      ))}
    </section>
  );
}

export function EmptyState({
  icon = "inbox",
  title,
  detail,
  action,
  tone = "default",
}: {
  icon?: string;
  title: string;
  detail?: string;
  action?: { href: string; label: string };
  tone?: "default" | "error";
}) {
  return (
    <div className={`state-panel ${tone === "error" ? "error" : ""}`}>
      <span className="state-icon" aria-hidden="true">
        <Icon name={icon} size={22} />
      </span>
      <strong>{title}</strong>
      {detail && <p>{detail}</p>}
      {action && (
        <Link className="btn btn-secondary btn-sm" href={action.href}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

/**
 * Search and filter are a plain GET form: they work without JavaScript, keep the URL
 * shareable and never mix client-side filtering with server-side pagination.
 */
export async function ListToolbar({
  action,
  q,
  placeholder,
  filters,
  total,
  resetHref,
}: {
  action: string;
  q: string;
  placeholder: string;
  filters?: ReactNode;
  total: number;
  resetHref?: string;
}) {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("sbm_locale")?.value;
  const locale = isLocale(savedLocale) ? savedLocale : defaultLocale;
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <form className="list-toolbar" method="get" action={action}>
      <div className="list-search">
        <Icon name="search" size={15} />
        <input type="search" name="q" defaultValue={q} placeholder={placeholder} aria-label={placeholder} />
      </div>
      {filters}
      <button className="btn btn-secondary" type="submit">
        Terapkan
      </button>
      {resetHref && (
        <Link className="toolbar-reset" href={resetHref}>
          Reset
        </Link>
      )}
      <span className="toolbar-count">{total} {t("dataCount")}</span>
    </form>
  );
}

export async function Pagination({
  page,
  total,
  pageSize,
  prevHref,
  nextHref,
}: {
  page: number;
  total: number;
  pageSize: number;
  prevHref?: string;
  nextHref?: string;
}) {
  if (total === 0) return null;
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get("sbm_locale")?.value;
  const locale = isLocale(savedLocale) ? savedLocale : defaultLocale;
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <nav className="pagination" aria-label={t("dataNavigation")}>
      {prevHref ? <Link href={prevHref}>‹ {t("previous")}</Link> : <span className="pagination-disabled">‹ Sebelumnya</span>}
      <span>
        {t("page")} {page} {t("of")} {totalPages}
      </span>
      {nextHref ? <Link href={nextHref}>{t("next")} ›</Link> : <span className="pagination-disabled">Berikutnya ›</span>}
    </nav>
  );
}

export function EmptyRow({
  colSpan,
  title,
  detail,
}: {
  colSpan: number;
  title: string;
  detail: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan} data-label="">
        <div className="table-empty">
          <strong>{title}</strong>
          <p>{detail}</p>
        </div>
      </td>
    </tr>
  );
}

export function ConfigNotice() {
  return (
    <main className="config-page">
      <section className="panel config-card">
        <EmptyState
          icon="alert"
          title="Database belum dikonfigurasi"
          detail="Modul ini memerlukan koneksi Supabase. Hubungi pengelola sistem untuk mengisi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, lalu terapkan migrasi yang tersedia di repository."
        />
        <Link className="btn btn-primary" href="/">
          Kembali ke beranda
        </Link>
      </section>
    </main>
  );
}
