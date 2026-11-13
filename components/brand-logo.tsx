import Link from "next/link";

/**
 * Satu identitas visual untuk seluruh area.
 *
 * Lambang mengikuti referensi resmi SchoolBus: bidang navy bersudut membulat,
 * bus sekolah gold menghadap depan dengan sedikit sisi, penanda lokasi gold di
 * kanan atas, dan jalur perjalanan putih melengkung di bagian bawah. Semua
 * bentuk digambar sebagai SVG agar tajam pada ukuran favicon maupun header.
 * Wordmark selalu "SchoolBus" dengan warna navy yang sama di setiap peran.
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
        <svg viewBox="0 0 48 48" fill="none" focusable="false">
          <rect width="48" height="48" rx="8" fill="#0F1B3D" />
          {/* Jalur perjalanan putih, berada di belakang bus. */}
          <path
            d="M4.6 44.2c10.4-.4 18.6-2.9 25.2-6.6 4.6-2.6 8.5-4.1 13.6-4.5"
            stroke="#FFFFFF"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          {/* Bus sekolah gold: badan, kaca depan navy, lampu putih, spion. */}
          <path
            d="M11.2 21.4c0-3.7 2.4-6 6.2-6h7.4c3.8 0 6.2 2.3 6.2 6v15.2H11.2z"
            fill="#F5C542"
          />
          <rect x="14.2" y="18.6" width="14.6" height="8.6" rx="2" fill="#0F1B3D" />
          <path d="M12.4 30.6h5.8l1.6 3.4h-7.4z" fill="#FFFFFF" />
          <path d="M29.8 30.6h-5.8l-1.6 3.4h7.4z" fill="#FFFFFF" />
          <rect x="20" y="31" width="2.2" height="3" rx="0.7" fill="#0F1B3D" />
          <rect x="7.6" y="22.4" width="2.6" height="5.4" rx="1.1" fill="#F5C542" />
          <rect x="30.8" y="22.4" width="2.6" height="5.4" rx="1.1" fill="#F5C542" />
          {/* Penanda lokasi gold dengan lubang navy. */}
          <path
            d="M38.2 11.6c-3.3 0-6 2.7-6 6 0 4.4 6 9.4 6 9.4s6-5 6-9.4c0-3.3-2.7-6-6-6Z"
            fill="#F5C542"
          />
          <circle cx="38.2" cy="17.6" r="2.5" fill="#0F1B3D" />
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
