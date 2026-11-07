import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Bus Management | Perjalanan Sekolah Terpantau",
  description:
    "Pantau perjalanan anak, bantu pengemudi menjalankan rute, dan kelola armada bus sekolah dalam satu aplikasi.",
  icons: {
    icon: "/assets/landing/favicon.svg",
  },
};

const FEATURE_ITEMS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 12l2 2 4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Perjalanan Lebih Aman",
    sub: "Setiap perjalanan anak didampingi informasi yang jelas.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 21s-7-6.5-7-11a7 7 0 0114 0c0 4.5-7 11-7 11z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 7v.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Lokasi Bus Real-Time",
    sub: "Posisi bus dapat dilihat saat perangkat dan jaringan tersedia.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M18 8a6 6 0 00-12 0c0 7-4 11-4 11s1.5 2 4 2c2.5 0 4-1 4-2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M12 14v-2M9 17h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Notifikasi Instan",
    sub: "Pemberitahuan penting langsung sampai ke yang berhak.",
  },
];

const ROLE_CARDS = [
  {
    id: "parent",
    accent: " Untuk Orang Tua",
    accentBg: "#FFF9E6",
    accentBorder: "#F3D97A",
    badge: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="9" cy="8" r="3.4" stroke="currentColor" strokeWidth="2" />
        <circle cx="16" cy="7.5" r="4" stroke="currentColor" strokeWidth="2" />
        <path
          d="M3 21c0-4 3-6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M21 21c0-3-2.2-5.5-5-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M7 13c0-2 1.6-3 4-3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Untuk Orang Tua",
    subtitle: "Pantauan perjalanan anak secara langsung, kapan saja.",
    chips: ["Lokasi", "Kamera", "Perisai", "•••"],
    imageUrl: "/assets/landing/role-orang-tua.webp",
  },
  {
    id: "driver",
    accent: " Untuk Pengemudi",
    accentBg: "#E6F0FF",
    accentBorder: "#8AB4FF",
    badge: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Untuk Pengemudi",
    subtitle: "Dapatkan tugas dan navigasi rute dengan mudah.",
    chips: ["Navigasi", "Daftar", "Bus", "•••"],
    imageUrl: "/assets/landing/role-pengemudi.webp",
  },
  {
    id: "operator",
    accent: " Untuk Operator",
    accentBg: "#E9EEFF",
    accentBorder: "#9A9CFF",
    badge: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 7a5 5 0 100 10 5 5 0 000-10z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12 3v4M12 17v4M3 12h4M17 12h4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Untuk Operator",
    subtitle: "Kelola armada, pengemudi, dan jadwal perjalanan.",
    chips: ["Bus", "Orang", "Grafik", "•••"],
    imageUrl: "/assets/landing/role-operator.webp",
  },
];

function Brand() {
  return (
    <Link
      href="/pilih-peran"
      className="landing-brand"
      aria-label="School Bus Management, halaman pemilihan peran"
    >
      <span className="landing-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none">
          <rect x="5" y="6" width="30" height="25" rx="5" fill="currentColor" />
          <path d="M9 11h22v11H9z" fill="#fff" />
          <path d="M8 26h24" stroke="#172b35" strokeWidth="2" />
          <circle cx="12" cy="32" r="3" fill="#172b35" />
          <circle cx="28" cy="32" r="3" fill="#172b35" />
        </svg>
      </span>
      <span>
        School
        <span className="landing-brand-word">Bus</span>
      </span>
    </Link>
  );
}

export default function LandingPage() {
  return (
    <div className="landing">
      <div className="landing-inner">
        <nav className="landing-nav" aria-label="Navigasi utama">
          <Brand />
          <div className="landing-nav-actions">
            <Link href="/pilih-peran" className="landing-link">
              Buka pilihan peran
            </Link>
            <Link href="/pilih-peran" className="landing-cta">
              Masuk
            </Link>
          </div>
        </nav>

        <section
          className="landing-hero"
          aria-labelledby="hero-title"
        >
          <div className="hero-copy">
            <span className="hero-kicker">
              <span className="hero-kicker-dot" aria-hidden="true" />
              TRANSPORTASI SEKOLAH
            </span>
            <h1 id="hero-title" className="hero-title">
              Your Child’s
              <br />
              Safety,
              <br />
              Tracked in
              <br />
              Real-Time.
              <span className="hero-title-emphasis" aria-hidden="true">
                Real-Time.
              </span>
            </h1>
            <p className="hero-sub">
              Perjalanan sekolah lebih aman dengan pantauan langsung dan
              informasi yang akurat.
            </p>
            <div className="hero-actions">
              <Link href="/pilih-peran" className="btn btn-primary btn-lg">
                Mulai Sekarang
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="btn-icon"
                >
                  <path
                    d="M5 12h12M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="btn btn-outline"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="btn-icon"
                >
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M10.5 9.5l3 2-3 2z"
                    fill="currentColor"
                  />
                </svg>
                Lihat Cara Kerjanya
              </a>
            </div>
            <p className="hero-note">
              Informasi perjalanan anak, panduan bagi pengemudi, dan
              pengelolaan armada bus sekolah dalam satu aplikasi.
            </p>
          </div>

          <div className="hero-art" aria-hidden="true">
            <Image
              src="/assets/landing/hero-bus.webp"
              alt="Bus sekolah di jalan"
              priority
              width={640}
              height={360}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="hero-art-img"
              fetchPriority="high"
            />
            <div className="hero-art-shade" />
            <div className="hero-art-label">
              <span className="lp-label-icon" aria-hidden="true">
                ⌖
              </span>
              <span>
                <b>Perjalanan lebih terarah</b>
                <small>Informasi dalam satu aplikasi</small>
              </span>
            </div>
            <div className="hero-art-index">
              <b>01</b>
              <span>TRANSPORTASI<br />SEKOLAH</span>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="landing-section"
          aria-labelledby="section-title"
        >
          <div className="section-head">
            <span className="hero-kicker">SATU APLIKASI, TIGA PERAN</span>
            <h2 id="section-title">
              Informasi yang dibutuhkan,
              <br />
              <em>lebih mudah dijangkau.</em>
            </h2>
          </div>

          <div className="feature-grid">
            {FEATURE_ITEMS.map((item, i) => (
              <div
                key={i}
                className={`feature-card ${i > 0 ? "feature-card-sep" : ""}`}
              >
                <div className="feature-top">
                  <span className="feature-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.sub}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="landing-section"
          aria-labelledby="roles-title"
        >
          <div className="section-head">
            <span className="hero-kicker">SATU APLIKASI, TIGA PERAN</span>
            <h2 id="roles-title">
              Pilih peran untuk melihat informasi yang relevan.
            </h2>
          </div>

          <div className="role-grid">
            {ROLE_CARDS.map((role) => (
              <article
                key={role.id}
                className={`role-card role-card-${role.id}`}
              >
                <div
                  className="role-accent"
                  style={{
                    backgroundColor: role.accentBg,
                    borderColor: role.accentBorder,
                  }}
                  aria-hidden="true"
                />
                <div className="role-image-wrap">
                  <Image
                    src={role.imageUrl}
                    alt={`Ilustrasi ${role.title}`}
                    loading="lazy"
                    width={220}
                    height={160}
                    className="role-image"
                  />
                </div>
                <div className="role-body">
                  <div className="role-top">
                    <span className="role-badge" aria-hidden="true">
                      {role.badge}
                    </span>
                    <div className="role-info">
                      <span className="role-title">{role.title}</span>
                      <span className="role-sub">{role.subtitle}</span>
                    </div>
                    <Link
                      href="/pilih-peran"
                      className="role-cta"
                      aria-label={`Pilih ${role.title}`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </div>
                  <div className="role-chips" role="list">
                    {role.chips.map((chip, i) => (
                      <span key={i} className="role-chip" role="listitem">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="landing-cta-section"
          aria-labelledby="cta-title"
        >
          <div className="landing-cta-inner">
            <span className="landing-cta-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h2 id="cta-title" className="landing-cta-title">
              Bring Safety and Peace of Mind
              <br />
              to{" "}
              <span className="landing-cta-emphasis">Your School.</span>
            </h2>
            <p className="landing-cta-note">
              Masuk untuk membuka halaman sesuai peran dan hak akses akun Anda.
            </p>
            <div className="landing-cta-form">
              <label className="landing-email-label" htmlFor="lp-email">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="6"
                    width="18"
                    height="13"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M3 7l9 6 9-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  id="lp-email"
                  name="email"
                  type="email"
                  className="landing-email-input"
                  placeholder="Masukkan email Anda"
                  aria-label="Email"
                  autoComplete="email"
                  readOnly
                />
                <span className="landing-email-note">
                  UI saja. Disiapkan untuk integrasi sign-in sesuai peran akun
                  (profiles.role). Saat ini akses dibuka untuk keperluan
                  pengembangan.
                </span>
              </label>
              <Link href="/pilih-peran" className="btn btn-primary btn-lg">
                Masuk Akun
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="btn-icon"
                >
                  <path
                    d="M5 12h12M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <footer className="landing-footer">
          <Brand />
          <div>
            <span>© 2026 School Bus Management</span>
            <span className="landing-footer-loc">
              Dammam, Saudi Arabia
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
