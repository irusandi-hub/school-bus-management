"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DemoTab from "@/components/landing/DemoTab";
import LanguageSwitcher from "@/components/landing/LanguageSwitcher";
import { BusScene, RoleArt } from "@/components/landing/art";
import {
  AppleIcon,
  ArrowRightIcon,
  BellIcon,
  ExternalArrowIcon,
  MapPinIcon,
  MonitorIcon,
  PlayStoreIcon,
  ShieldIcon,
} from "@/components/landing/icons";
import { detectLanguage, dictionaries, saveLanguage, type Lang } from "@/components/landing/translations";

type Platform = "android" | "ios" | "other";

// Replace with the live store listings when the apps are published.
const DOWNLOAD_LINKS = {
  android: "https://play.google.com/store",
  ios: "https://www.apple.com/app-store/",
  web: "/login",
};

const ROLE_ART = ["parent", "driver", "admin"] as const;
const FEATURE_ICONS = [MapPinIcon, BellIcon, ShieldIcon];

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("id");
  const [ready, setReady] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");
  const t = dictionaries[lang];

  // Detect the device language once on the client (keeps server HTML deterministic).
  useEffect(() => {
    setLang(detectLanguage());
    setReady(true);

    const ua = navigator.userAgent;
    if (/android/i.test(ua)) setPlatform("android");
    else if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) setPlatform("ios");
  }, []);

  // Keep <html lang/dir> in sync so RTL, fonts and assistive tech follow the choice.
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    const previousTitle = document.title;
    root.lang = lang;
    root.dir = t.dir;
    document.title = t.pageTitle;
    saveLanguage(lang);
    return () => {
      root.lang = "id";
      root.dir = "ltr";
      document.title = previousTitle;
    };
  }, [lang, ready, t.dir, t.pageTitle]);

  const primaryKey = platform === "android" ? "android" : platform === "ios" ? "ios" : "web";
  const stores = {
    android: { label: t.hero.android, href: DOWNLOAD_LINKS.android, icon: <PlayStoreIcon /> },
    ios: { label: t.hero.ios, href: DOWNLOAD_LINKS.ios, icon: <AppleIcon /> },
    web: { label: t.hero.web, href: DOWNLOAD_LINKS.web, icon: <MonitorIcon /> },
  } as const;
  const primary = stores[primaryKey];
  const secondary = (["android", "ios", "web"] as const).filter((key) => key !== primaryKey);

  return (
    <div className="lp" lang={lang} dir={t.dir}>
      <a className="lp-skip" href="#main">{t.a11y.skip}</a>

      <header className="lp-header">
        <div className="lp-container lp-header-inner">
          <a className="lp-brand" href="/" aria-label={t.brandAria}>
            {/* Geometric bus mark: one solid shape, no round wheels, yellow only as accent. */}
            <svg className="lp-brand-mark" viewBox="0 0 40 40" width="36" height="36" aria-hidden focusable={false}>
              <rect x="2" y="5" width="36" height="28" rx="9" fill="#0F1B3D" />
              <rect x="8" y="12" width="9" height="8" rx="2" fill="#F7F9FC" />
              <rect x="20" y="12" width="9" height="8" rx="2" fill="#F7F9FC" />
              <rect x="8" y="24" width="21" height="3" rx="1.5" fill="#F5C518" />
              <rect x="31" y="12" width="3" height="15" rx="1.5" fill="#7E8CB2" />
            </svg>
            <span className="lp-wordmark">SchoolBus</span>
          </a>

          <LanguageSwitcher lang={lang} label={t.a11y.language} onChange={setLang} />
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="lp-hero" aria-labelledby="lp-hero-title">
          <div className="lp-container">
            <p className="lp-eyebrow">{t.hero.eyebrow}</p>
            <h1 className="lp-hero-title" id="lp-hero-title">{t.hero.title}</h1>
            <p className="lp-hero-sub">{t.hero.subtitle}</p>

            <div className="lp-downloads">
              <a
                className="lp-store-btn"
                href={primary.href}
                {...(primary.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                <span className="lp-store-icon">{primary.icon}</span>
                <span className="lp-store-copy">
                  {primaryKey !== "web" && <small>{t.hero.downloadVia}</small>}
                  <strong>{primary.label}</strong>
                </span>
              </a>

              <div className="lp-download-alt">
                {secondary.map((key) => {
                  const store = stores[key];
                  return (
                    <a
                      key={key}
                      href={store.href}
                      {...(store.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                    >
                      {store.label}
                      <ExternalArrowIcon />
                    </a>
                  );
                })}
              </div>
            </div>

            <figure className="lp-hero-figure">
              <BusScene label={t.hero.imageAlt} />
            </figure>
          </div>
        </section>

        <section className="lp-trust-section" aria-label={t.trust.aria}>
          <div className="lp-container">
            <ul className="lp-trust">
              {t.trust.items.map((item) => (
                <li key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="lp-section" aria-label={t.features.map((feature) => feature.title).join(" · ")}>
          <div className="lp-container">
            <ul className="lp-features">
              {t.features.map((feature, index) => {
                const Icon = FEATURE_ICONS[index];
                return (
                  <li key={feature.title}>
                    <span className="lp-feature-icon"><Icon /></span>
                    <div>
                      <h2 className="lp-feature-title">{feature.title}</h2>
                      <p className="lp-feature-desc">{feature.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="lp-section" aria-labelledby="lp-roles-title">
          <div className="lp-container">
            <div className="lp-section-head">
              <p className="lp-eyebrow">{t.roles.eyebrow}</p>
              <h2 className="lp-section-title" id="lp-roles-title">{t.roles.title}</h2>
            </div>

            <ul className="lp-role-grid">
              {t.roles.items.map((role, index) => (
                <li key={role.title}>
                  <Link className="lp-role-card" href="/login">
                    <figure className="lp-role-art">
                      <RoleArt kind={ROLE_ART[index]} />
                    </figure>
                    <div className="lp-role-body">
                      <div className="lp-chips">
                        {role.chips.map((chip) => <span className="lp-chip" key={chip}>{chip}</span>)}
                      </div>
                      <div className="lp-role-foot">
                        <h3 className="lp-role-title">{role.title}</h3>
                        <span className="lp-arrow" aria-hidden>
                          <ArrowRightIcon />
                        </span>
                      </div>
                      <p className="lp-role-desc">{role.description}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="lp-section" aria-labelledby="lp-access-title">
          <div className="lp-container">
            <div className="lp-access">
              <h2 className="lp-access-title" id="lp-access-title">{t.access.title}</h2>
              <div className="lp-access-actions">
                <Link className="lp-btn lp-btn-accent" href="/login">{t.access.signIn}</Link>
                <Link className="lp-btn lp-btn-outline" href="/login?mode=daftar">{t.access.signUp}</Link>
              </div>
              <p className="lp-access-note">
                {t.access.note} <Link href="/login?mode=daftar">{t.access.noteLink}</Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <p>{t.footer.copyright}</p>
          <ul className="lp-footer-links">
            {/* Placeholder anchors: point these at the final legal/help pages. */}
            <li><a href="#privacy">{t.footer.privacy}</a></li>
            <li><a href="#terms">{t.footer.terms}</a></li>
            <li><a href="#help">{t.footer.help}</a></li>
          </ul>
        </div>
      </footer>

      <DemoTab copy={t.demo} dir={t.dir} />
    </div>
  );
}
