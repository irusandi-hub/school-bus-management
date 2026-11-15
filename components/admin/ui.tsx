import Link from "next/link";
import { getRequestLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/messages";
import { translateNavigationLabel } from "@/lib/i18n/navigation";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";


export type Crumb = { href?: string; label: string };

/** Remah roti bersama: satu pola untuk semua halaman detail. */
export async function Breadcrumbs({ items }: { items: Crumb[] }) {
  const locale = await getRequestLocale();
  return (
    <nav className="crumbs" aria-label={translate(locale, "pagePosition")}>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} style={{ display: "contents" }}>
          {index > 0 && <span className="crumb-sep" aria-hidden="true">/</span>}
          {item.href ? (
            <Link href={item.href}>{translateNavigationLabel(item.label, locale)}</Link>
          ) : (
            <span aria-current="page">{translateNavigationLabel(item.label, locale)}</span>
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
  const locale = await getRequestLocale();
  return (
    <>
      {crumbs && crumbs.length > 0 && <Breadcrumbs items={crumbs} />}
      <header className="admin-page-head">
        <div className="admin-page-head-copy">
          {eyebrow && <div className="eyebrow">{translateAdminCopy(eyebrow, locale) ?? eyebrow}</div>}
          <h1>{translateNavigationLabel(title, locale)}</h1>
          <p>{description.startsWith("Ringkasan data operasional dan jejak aktivitas platform. Konteks: ") ? `${translateAdminCopy("Ringkasan data operasional dan jejak aktivitas platform. Konteks:", locale)} ${description.slice("Ringkasan data operasional dan jejak aktivitas platform. Konteks: ".length)}` : translateAdminCopy(description, locale) ?? description}</p>
        </div>
        {actions && <div className="admin-page-actions">{actions}</div>}
      </header>
    </>
  );
}

export async function Notice({
  kind = "info",
  children,
}: {
  kind?: "info" | "success" | "error" | "warning";
  children: ReactNode;
}) {
  const locale = await getRequestLocale();
  const message = typeof children === "string" && /^(Data|Daftar) belum dapat dimuat\./.test(children) ? translate(locale, "loadFailed") : typeof children === "string" ? translateAdminCopy(children, locale) ?? children : children;
  return (
    <p className={`form-alert ${kind}`} role={kind === "error" ? "alert" : "status"}>
      {message}
    </p>
  );
}

export async function Pill({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  children: ReactNode;
}) {
  const locale = await getRequestLocale();
  const content = typeof children === "string" ? translateAdminCopy(children, locale) ?? children : children;
  return <span className={`pill ${tone}`}>{content}</span>;
}

/** Status perjalanan memakai satu pemetaan warna di seluruh area. */
export async function TripStatusPill({ status }: { status: string | null | undefined }) {
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  if (!status || status === "scheduled") return <Pill tone="neutral">{t("notStarted")}</Pill>;
  const tone =
    status === "completed" ? "success" : status === "in_progress" ? "info" : status === "cancelled" ? "danger" : "warning";
  const statusKey = status === "in_progress" ? "inProgress" : status === "completed" ? "completed" : status === "cancelled" ? "tripCancelledLabel" : status === "delayed" ? "tripDelayed" : "status";
  return <Pill tone={tone}>{t(statusKey)}</Pill>;
}

/** Status layanan siswa: aktif, jeda, dan berakhir dibedakan jelas. */
export async function ServiceStatusPill({ status }: { status: string }) {
  const locale = await getRequestLocale();
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
export async function MetricStrip({
  label,
  items,
}: {
  label: string;
  items: { label: string; value: ReactNode; note?: string; icon: string }[];
}) {
  const locale = await getRequestLocale();
  return (
    <section className="metric-strip" aria-label={translateAdminCopy(label, locale) ?? label}>
      {items.map((item) => (
        <div className="metric-item" key={item.label}>
          <span className="metric-icon" aria-hidden="true">
            <Icon name={item.icon} size={16} />
          </span>
          <div className="metric-copy">
            <span className="metric-label">{translateAdminCopy(item.label, locale) ?? item.label}</span>
            <strong className="metric-value">{item.value}</strong>
            {item.note && <small>{translateAdminCopy(item.note, locale) ?? item.note}</small>}
          </div>
        </div>
      ))}
    </section>
  );
}

export async function EmptyState({
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
  const locale = await getRequestLocale();
  return (
    <div className={`state-panel ${tone === "error" ? "error" : ""}`}>
      <span className="state-icon" aria-hidden="true">
        <Icon name={icon} size={22} />
      </span>
      <strong>{translateAdminCopy(title, locale) ?? title}</strong>
      {detail && <p>{translateAdminCopy(detail, locale) ?? detail}</p>}
      {action && (
        <Link className="btn btn-secondary btn-sm" href={action.href}>
          {translateAdminCopy(action.label, locale) ?? action.label}
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
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <form className="list-toolbar" method="get" action={action}>
      <div className="list-search">
        <Icon name="search" size={15} />
        <input type="search" name="q" defaultValue={q} placeholder={translateAdminCopy(placeholder, locale) ?? placeholder} aria-label={translateAdminCopy(placeholder, locale) ?? placeholder} />
      </div>
      {filters}
      <button className="btn btn-secondary" type="submit">
        {t("apply")}
      </button>
      {resetHref && (
        <Link className="toolbar-reset" href={resetHref}>
          {t("reset")}
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
  const locale = await getRequestLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <nav className="pagination" aria-label={t("dataNavigation")}>
      {prevHref ? <Link href={prevHref}>‹ {t("previous")}</Link> : <span className="pagination-disabled">‹ {t("previous")}</span>}
      <span>
        {t("page")} {page} {t("of")} {totalPages}
      </span>
      {nextHref ? <Link href={nextHref}>{t("next")} ›</Link> : <span className="pagination-disabled">{t("next")} ›</span>}
    </nav>
  );
}

export async function EmptyRow({
  colSpan,
  title,
  detail,
}: {
  colSpan: number;
  title: string;
  detail: string;
}) {
  const locale = await getRequestLocale();
  return (
    <tr>
      <td colSpan={colSpan} data-label="">
        <div className="table-empty">
          <strong>{translateAdminCopy(title, locale) ?? title}</strong>
          <p>{translateAdminCopy(detail, locale) ?? detail}</p>
        </div>
      </td>
    </tr>
  );
}

export async function ConfigNotice() {
  return (
    <main className="config-page">
      <section className="panel config-card">
        <EmptyState
          icon="alert"
          title={translate(await getRequestLocale(), "databaseNotConfigured")}
          detail={translate(await getRequestLocale(), "supabaseRequired")}
        />
        <Link className="btn btn-primary" href="/">
          {translate(await getRequestLocale(), "backHome")}
        </Link>
      </section>
    </main>
  );
}
