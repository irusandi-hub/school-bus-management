import Link from "next/link";

/**
 * Logo bersama untuk seluruh area. Bentuk, warna, dan wordmark mengikuti logo
 * header landing: lambang bus kuning + "School" navy dan "Bus" kuning.
 *
 * Komponen ini tidak menambahkan tautan sendiri. Bila `href` diberikan, tautan
 * itu hanya mempertahankan tujuan yang sudah ada di halaman tersebut.
 */
export function BrandLogo({
  href,
  subtitle,
  size = "md",
  ariaLabel,
  className,
}: {
  href?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  ariaLabel?: string;
  className?: string;
}) {
  const classes = ["brand-logo", `brand-logo-${size}`, className].filter(Boolean).join(" ");

  const content = (
    <>
      <span className="brand-logo-mark" aria-hidden="true">
        <svg viewBox="0 0 40 34" fill="none">
          <rect x="3" y="4" width="34" height="22" rx="6" fill="currentColor" />
          <path d="M7.5 8h7v6h-7zM17.5 8h7v6h-7zM27.5 8h5v6h-5z" fill="#FFFFFF" />
          <path d="M7.5 17h7v5h-7zM17.5 17h7v5h-7zM27.5 17h5v5h-5z" fill="#FFFFFF" />
          <circle cx="11" cy="28" r="4" fill="#101B3B" />
          <circle cx="29" cy="28" r="4" fill="#101B3B" />
        </svg>
      </span>
      <span className="brand-logo-text">
        <span className="brand-logo-word">
          School<span>Bus</span>
        </span>
        {subtitle ? <span className="brand-logo-sub">{subtitle}</span> : null}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return <span className={classes}>{content}</span>;
}
