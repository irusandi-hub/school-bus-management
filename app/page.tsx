import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import "./landing.css";

const HERO_IMAGE = {
  src: "/assets/landing/hero-bus.webp",
  width: 1408,
  height: 768,
};

export const metadata: Metadata = {
  title: "School Bus Management | Perjalanan Sekolah Terpantau",
  description:
    "Pantau perjalanan anak, bantu pengemudi menjalankan rute, dan kelola armada bus sekolah dalam satu aplikasi.",
  icons: {
    icon: "/assets/landing/favicon.svg",
  },
};

const HOME_LINKS = [
  { label: "Buka pilihan peran", href: "/pilih-peran" },
  { label: "Masuk", href: "/pilih-peran" },
];

const STRIP_ITEMS = [
  {
    label: (
      <>
        Perjalanan
        <br />
        Lebih Aman
      </>
    ),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3l7 3.2v4.6c0 4.6-3 8.1-7 9.7-4-1.6-7-5.1-7-9.7V6.2L12 3z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M9.2 11.8l2 2 3.6-3.9"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: (
      <>
        Lokasi Bus
        <br />
        Real-Time
      </>
    ),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 21c0-6.2 5-8.4 5-12a5 5 0 10-10 0c0 3.6 5 5.8 5 12z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="9" r="1.9" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: (
      <>
        Notifikasi
        <br />
        Instan
      </>
    ),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6.5 9.5a5.5 5.5 0 1111 0c0 3.4 1.4 5.1 2.2 6.1.4.5 0 1.4-.7 1.4H5c-.7 0-1.1-.9-.7-1.4.8-1 2.2-2.7 2.2-6.1z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M9.8 19.4a2.4 2.4 0 004.4 0"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const ROLE_CARDS = [
  {
    id: "parent",
    title: "Untuk Orang Tua",
    description: "Pantau perjalanan anak secara langsung, kapan saja.",
    image: { src: "/assets/landing/role-orang-tua.webp", width: 1376, height: 768 },
    badge: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="9.2" cy="8.4" r="3.3" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16.4" cy="9.6" r="2.6" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M3.4 19.4c0-3.1 2.6-5.2 5.8-5.2s5.8 2.1 5.8 5.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M16.2 14.4c2.4.2 4.4 2.1 4.4 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    chips: [
      <svg key="pin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 20c0-5 4-6.8 4-9.8a4 4 0 10-8 0C8 13.2 12 15 12 20z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="10" r="1.5" fill="currentColor" />
      </svg>,
      <svg key="camera" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="7"
          width="13"
          height="10"
          rx="2.4"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M16 11.4l4.3-2.3v5.8L16 12.6z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>,
      <svg key="shield" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3.6l6.6 2.9v4.3c0 4.2-2.8 7.4-6.6 8.9-3.8-1.5-6.6-4.7-6.6-8.9V6.5L12 3.6z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9.3 11.6l1.9 1.9 3.4-3.7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>,
      <svg key="more" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="6" cy="12" r="1.7" />
        <circle cx="12" cy="12" r="1.7" />
        <circle cx="18" cy="12" r="1.7" />
      </svg>,
    ],
  },
  {
    id: "driver",
    title: "Untuk Pengemudi",
    description: "Dapatkan tugas dan navigasi rute dengan mudah.",
    image: { src: "/assets/landing/role-pengemudi.webp", width: 1408, height: 768 },
    badge: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 3.9v5.5M5 15.6l4.8-2.8M19 15.6l-4.8-2.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    chips: [
      <svg key="nav" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20.5 3.5L3.8 10.4l7 2.6 2.6 7 5.4-16.5z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>,
      <svg key="clipboard" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="5"
          y="4.6"
          width="14"
          height="15.8"
          rx="2.4"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M9.6 4.6V3.4h4.8v1.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M8.8 13.2l2.1 2.1 4-4.4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>,
      <svg key="bus" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="4"
          y="4.4"
          width="16"
          height="12.6"
          rx="2.6"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M4 9.6h16M8.2 17v2.2M15.8 17v2.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="8.4" cy="13.9" r="1" fill="currentColor" />
        <circle cx="15.6" cy="13.9" r="1" fill="currentColor" />
      </svg>,
      <svg key="more" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="6" cy="12" r="1.7" />
        <circle cx="12" cy="12" r="1.7" />
        <circle cx="18" cy="12" r="1.7" />
      </svg>,
    ],
  },
  {
    id: "operator",
    title: "Untuk Operator",
    description: "Kelola armada, pengemudi, dan jadwal perjalanan.",
    image: { src: "/assets/landing/role-operator.webp", width: 1408, height: 768 },
    badge: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 2.8l1.5 2.4 2.7-.7.6 2.8 2.6 1.2-1.4 2.5 1.4 2.5-2.6 1.2-.6 2.8-2.7-.7L12 21.2l-1.5-2.4-2.7.7-.6-2.8-2.6-1.2L6 13l-1.4-2.5 2.6-1.2.6-2.8 2.7.7L12 2.8z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
    chips: [
      <svg key="bus" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="4"
          y="4.4"
          width="16"
          height="12.6"
          rx="2.6"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M4 9.6h16M8.2 17v2.2M15.8 17v2.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="8.4" cy="13.9" r="1" fill="currentColor" />
        <circle cx="15.6" cy="13.9" r="1" fill="currentColor" />
      </svg>,
      <svg key="users" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="9.2" cy="8.4" r="3.3" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16.4" cy="9.6" r="2.6" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M3.4 19.4c0-3.1 2.6-5.2 5.8-5.2s5.8 2.1 5.8 5.2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M16.2 14.4c2.4.2 4.4 2.1 4.4 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>,
      <svg key="chart" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 19.4V13M12 19.4V6M19 19.4v-8.6"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
      </svg>,
      <svg key="more" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="6" cy="12" r="1.7" />
        <circle cx="12" cy="12" r="1.7" />
        <circle cx="18" cy="12" r="1.7" />
      </svg>,
    ],
  },
];

function Brand() {
  return (
    <Link
      href="/pilih-peran"
      className="landing-brand"
      aria-label="School Bus Management, halaman pemilihan peran"
    >
      <span className="landing-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 40 34" fill="none">
          <rect x="3" y="4" width="34" height="22" rx="6" fill="currentColor" />
          <path d="M7.5 8h7v6h-7zM17.5 8h7v6h-7zM27.5 8h5v6h-5z" fill="#FFFFFF" />
          <path d="M7.5 17h7v5h-7zM17.5 17h7v5h-7zM27.5 17h5v5h-5z" fill="#FFFFFF" />
          <circle cx="11" cy="28" r="4" fill="#101B3B" />
          <circle cx="29" cy="28" r="4" fill="#101B3B" />
        </svg>
      </span>
      <span className="landing-brand-word">
        School<span>Bus</span>
      </span>
    </Link>
  );
}

export default function LandingPage() {
  return (
    <div className="landing">
      <div className="landing-shell">
        <header className="landing-header">
          <Brand />
          <details className="landing-menu">
            <summary aria-label="Buka menu navigasi">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </summary>
            <div className="landing-menu-panel">
              {HOME_LINKS.map((link) => (
                <Link key={link.label} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
        </header>

        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-copy">
            <h1 id="landing-title" className="landing-title">
              Your Child’s
              <br />
              Safety,
              <br />
              Tracked in
              <br />
              <span className="landing-title-accent">
                Real-Time.
                <svg
                  className="landing-title-underline"
                  viewBox="0 0 240 14"
                  fill="none"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3 9.5C60 3.6 150 2.4 236 6.5"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="landing-lead">
              Perjalanan sekolah lebih aman dengan pantauan langsung dan
              informasi yang akurat.
            </p>
            <div className="landing-actions">
              <Link href="/pilih-peran" className="landing-btn landing-btn-primary">
                Mulai Sekarang
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4.5 12h14M13 6.2l5.8 5.8L13 17.8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <a href="#how-it-works" className="landing-btn landing-btn-outline">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9.4" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M10.2 8.6l5.3 3.4-5.3 3.4z" fill="currentColor" />
                </svg>
                Lihat Cara Kerjanya
              </a>
            </div>
          </div>

          <div className="landing-hero-visual" aria-hidden="true">
            <div className="landing-phone">
              <div className="landing-phone-screen">
                <svg
                  className="landing-phone-map"
                  viewBox="0 0 200 400"
                  fill="none"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <rect width="200" height="400" fill="#eef1f3" />
                  <g stroke="#e2e7ea" strokeWidth="11" strokeLinecap="round">
                    <path d="M-10 86h220M-10 206h220M-10 320h220M52 -10v420M142 -10v420" />
                  </g>
                  <g stroke="#ffffff" strokeWidth="4" strokeLinecap="round">
                    <path d="M-10 86h220M-10 206h220M-10 320h220M52 -10v420M142 -10v420" />
                  </g>
                  <path
                    d="M96 396c0-44-2-62 9-88 9-22 28-34 41-58 8-15 11-34 11-56"
                    stroke="#2f7cf6"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <g transform="translate(112 234) rotate(-38)">
                    <rect
                      x="-14"
                      y="-9"
                      width="28"
                      height="18"
                      rx="5"
                      fill="#f6c51c"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <circle cx="-7" cy="10" r="2.6" fill="#101b3b" />
                    <circle cx="7" cy="10" r="2.6" fill="#101b3b" />
                  </g>
                  <circle cx="80" cy="332" r="14" fill="#2f7cf6" fillOpacity="0.16" />
                  <circle cx="80" cy="332" r="6.5" fill="#2f7cf6" stroke="#ffffff" strokeWidth="3" />
                </svg>
                <div className="landing-phone-card landing-phone-card-top">
                  <span className="landing-phone-title">Bus 04</span>
                  <span className="landing-phone-meta">Dalam perjalanan • 5 mnt lagi</span>
                </div>
                <div className="landing-phone-card landing-phone-card-bottom">
                  <span className="landing-phone-label">ETA</span>
                  <span className="landing-phone-value">5 min</span>
                </div>
              </div>
            </div>

            <div className="landing-hero-bus">
              <div className="landing-hero-bus-fade">
                <Image
                  src={HERO_IMAGE.src}
                  alt=""
                  width={HERO_IMAGE.width}
                  height={HERO_IMAGE.height}
                  priority
                  sizes="(min-width: 768px) 70vw, 150vw"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="landing-strip" aria-label="Keunggulan layanan">
          {STRIP_ITEMS.map((item, index) => (
            <div className="landing-strip-item" key={index}>
              <span className="landing-strip-icon">{item.icon}</span>
              <span className="landing-strip-text">{item.label}</span>
            </div>
          ))}
        </section>

        <section className="landing-roles" aria-label="Pilihan peran pengguna">
          {ROLE_CARDS.map((role) => (
            <article className={`landing-role landing-role-${role.id}`} key={role.id}>
              <div className="landing-role-media" aria-hidden="true">
                <Image
                  src={role.image.src}
                  alt=""
                  width={role.image.width}
                  height={role.image.height}
                  loading="lazy"
                  sizes="(min-width: 768px) 22vw, 38vw"
                />
              </div>
              <div className="landing-role-body">
                <div className="landing-role-head">
                  <span className="landing-role-badge" aria-hidden="true">
                    {role.badge}
                  </span>
                  <h2 className="landing-role-title">{role.title}</h2>
                </div>
                <p className="landing-role-desc">{role.description}</p>
                <div className="landing-chips" aria-hidden="true">
                  {role.chips.map((chip, index) => (
                    <span className="landing-chip" key={index}>
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href="/pilih-peran"
                className="landing-role-arrow"
                aria-label={`Buka pilihan peran untuk ${role.title}`}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4.5 12h14M13 6.2l5.8 5.8L13 17.8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </article>
          ))}
        </section>

        <section className="landing-cta" aria-labelledby="landing-cta-title">
          <div className="landing-cta-top" aria-hidden="true">
            <span className="landing-cta-line" />
            <span className="landing-cta-badge">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2.6l7.4 3.2v5c0 4.8-3.2 8.6-7.4 10.3-4.2-1.7-7.4-5.5-7.4-10.3v-5L12 2.6z"
                  fill="currentColor"
                />
                <path
                  d="M8.7 11.7l2.4 2.4 4.3-4.7"
                  stroke="#101B3B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="landing-cta-line" />
          </div>

          <h2 id="landing-cta-title" className="landing-cta-title">
            Bring Safety and Peace of Mind
            <br />
            to <span>Your School.</span>
          </h2>

          <div className="landing-cta-row">
            <label className="landing-email-field">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect
                  x="2.6"
                  y="5.4"
                  width="18.8"
                  height="13.2"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M3.6 7.2l8.4 5.6 8.4-5.6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* UI saja. Disiapkan untuk integrasi sign-in sesuai peran akun (profiles.role). Saat ini akses dibuka untuk keperluan pengembangan. */}
              <input
                type="email"
                name="email"
                className="landing-email-input"
                placeholder="Masukkan email Anda"
                aria-label="Email"
              />
            </label>
            <Link href="/pilih-peran" className="landing-btn landing-btn-primary landing-btn-cta">
              Masuk Akun
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4.5 12h14M13 6.2l5.8 5.8L13 17.8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </section>

        <footer className="landing-footer">
          <Brand />
          <div className="landing-footer-meta">
            <span>© 2026 School Bus Management</span>
            <span>Dammam, Saudi Arabia</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
