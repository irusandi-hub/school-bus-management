import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-page-head">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="admin-page-actions">{actions}</div>}
    </header>
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
        <span aria-hidden="true">⌕</span>
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
      <td colSpan={colSpan}>
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
        <h1>Database belum dikonfigurasi</h1>
        <p>
          Modul Admin Pusat memerlukan koneksi Supabase. Hubungi pengelola sistem untuk mengisi variabel lingkungan
          <code> NEXT_PUBLIC_SUPABASE_URL </code> dan <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>, lalu terapkan
          migrasi yang tersedia di repository.
        </p>
        <Link className="btn btn-primary" href="/">
          Kembali ke beranda
        </Link>
      </section>
    </main>
  );
}
