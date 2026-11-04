import Link from "next/link";
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

export function PageHeader({
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
  return (
    <>
      {crumbs && crumbs.length > 0 && <Breadcrumbs items={crumbs} />}
      <header className="admin-page-head">
        <div>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
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
  return (
    <p className={`form-alert ${kind}`} role={kind === "error" ? "alert" : "status"}>
      {children}
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
export function TripStatusPill({ status }: { status: string | null | undefined }) {
  if (!status || status === "scheduled") return <Pill tone="neutral">Belum dimulai</Pill>;
  const tone =
    status === "completed" ? "success" : status === "in_progress" ? "info" : status === "cancelled" ? "danger" : "warning";
  return <Pill tone={tone}>{tripStatusLabel(status)}</Pill>;
}

/** Status layanan siswa: aktif, jeda, dan berakhir dibedakan jelas. */
export function ServiceStatusPill({ status }: { status: string }) {
  const tone = status === "active" ? "success" : status === "paused" ? "warning" : "neutral";
  return <Pill tone={tone}>{serviceStatusLabel(status)}</Pill>;
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
export function ListToolbar({
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
      <span className="toolbar-count">{total} data</span>
    </form>
  );
}

export function Pagination({
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
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <nav className="pagination" aria-label="Navigasi halaman data">
      {prevHref ? <Link href={prevHref}>‹ Sebelumnya</Link> : <span className="pagination-disabled">‹ Sebelumnya</span>}
      <span>
        Halaman {page} dari {totalPages}
      </span>
      {nextHref ? <Link href={nextHref}>Berikutnya ›</Link> : <span className="pagination-disabled">Berikutnya ›</span>}
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
