"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { dictionaries, resolveLanguage, trustMetrics, type Language } from "./landing-copy";

const languages = [["id", "Indonesia"], ["en", "English"], ["ar", "العربية"]] as const;
const roleImages = ["role-orang-tua.webp", "role-pengemudi.webp", "role-operator.webp"];
const rolePaths = ["/wali", "/pengemudi", "/operator"];
function Arrow() { return <svg className="landing-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function StoreIcon({ apple }: { apple: boolean }) { return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{apple ? <path d="M16 2c0 2-1 4-4 4 0-2 1-4 4-4ZM19 17c-1 3-3 5-4 5s-2-1-3-1-2 1-3 1c-3 0-6-6-6-10 0-3 2-5 5-5 2 0 3 1 4 1s2-1 4-1c2 0 3 1 4 2-4 2-4 6-1 8Z" /> : <><path d="m4 3 12 9L4 21V3Z" /><path d="m6 2 15 9-3 1L6 2Zm0 20 15-9-3-1L6 22Z" /></>}</svg>; }
function FeatureIcon({ index }: { index: number }) { const paths = ["M12 3 4 6v6c0 4 4 7 8 9 4-2 8-5 8-9V6l-8-3Zm-4 9 3 3 5-6", "M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M5 17h14l-2-4V9a5 5 0 0 0-10 0v4l-2 4Zm5 3h4"]; return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={paths[index]} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>; }

export function LandingRedesign({ roleEntryEnabled }: { roleEntryEnabled: boolean }) {
  const [language, setLanguage] = useState<Language>("id");
  const [menu, setMenu] = useState(false);
  const [ios, setIos] = useState(false);
  const [notice, setNotice] = useState<{ id: string; text: string } | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const languageButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const t = dictionaries[language];
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("schoolbus-language"); } catch {}
    setLanguage(resolveLanguage(saved || navigator.language));
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
  }, []);
  useEffect(() => {
    const html = document.documentElement;
    html.lang = language; html.dir = language === "ar" ? "rtl" : "ltr";
    window.dispatchEvent(new CustomEvent("schoolbus-language", { detail: language }));
    return () => { html.lang = "id"; html.dir = "ltr"; };
  }, [language]);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      if (!event.target.closest(".landing-language")) setMenu(false);
      if (!event.target.closest("[data-landing-notice]")) setNotice(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(null), 2500); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => { if (menu) root.current?.querySelector<HTMLButtonElement>('[role="menuitemradio"][aria-checked="true"]')?.focus(); }, [menu]);
  useEffect(() => { if (info) dialog.current?.showModal(); }, [info]);
  function choose(code: Language) { setLanguage(code); setMenu(false); setNotice(null); setInfo(null); try { localStorage.setItem("schoolbus-language", code); } catch {} languageButton.current?.focus(); }
  function menuKeys(event: KeyboardEvent) {
    const buttons = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? []);
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) { event.preventDefault(); buttons[event.key === "Home" ? 0 : event.key === "End" ? 2 : (index + (event.key === "ArrowUp" ? 2 : 1)) % 3]?.focus(); }
    if (event.key === "Escape") { setMenu(false); languageButton.current?.focus(); }
  }
  function downloads(primary: boolean) { const apple = primary ? ios : !ios; return <button type="button" className={primary ? "landing-pill landing-primary" : "landing-store-secondary"} data-landing-notice="store" onClick={() => setNotice({ id: "store", text: t.unavailable })}><StoreIcon apple={apple} /><span>{apple ? t.apple : t.google}</span></button>; }
  return <div className="landing" ref={root} dir={language === "ar" ? "rtl" : "ltr"} lang={language}>
    <div className="landing-shell">
      <header className="landing-header">
        <span className="landing-brand" aria-label="SchoolBus"><svg viewBox="0 0 40 32" aria-hidden="true"><path d="M4 5h25l7 8v14H4V5Z" fill="currentColor"/><path d="M9 10h18v7H9z" fill="#fff"/><path d="M9 22h9" stroke="#F5C518" strokeWidth="3"/></svg><span>SchoolBus</span></span>
        <div className="landing-language"><button ref={languageButton} type="button" className="landing-language-trigger" aria-label={t.language} aria-haspopup="menu" aria-expanded={menu} aria-controls={menu ? "landing-language-menu" : undefined} onClick={() => setMenu(!menu)} onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setMenu(true); } }}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/></svg><span>{language.toUpperCase()}</span><span aria-hidden="true">⌄</span></button>
          {menu && <div id="landing-language-menu" className="landing-language-menu" role="menu" aria-label={t.language} onKeyDown={menuKeys}>{languages.map(([code, label]) => <button key={code} role="menuitemradio" aria-checked={language === code} lang={code} type="button" onClick={() => choose(code)}><span>{label}</span><span aria-hidden="true">{language === code ? "✓" : ""}</span></button>)}</div>}
        </div>
      </header>
      <main>
        <section className="landing-hero" aria-labelledby="landing-title"><h1 id="landing-title">{t.headline}</h1><p className="landing-lead">{t.lead}</p>
          <div className="landing-downloads">{downloads(true)}{downloads(false)}<span className="landing-plain-notice" role="status" aria-live="polite">{notice?.id === "store" ? notice.text : ""}</span></div>
          <Image className="landing-hero-image" src="/assets/landing/hero-bus.webp" alt={t.busAlt} width={1408} height={768} sizes="(max-width: 768px) 100vw, 1120px" priority />
        </section>
        <p className="landing-trust"><span>{t.trust}:</span> <strong>{trustMetrics.schools}</strong> {t.schools}<span aria-hidden="true"> · </span><strong>{trustMetrics.trips}</strong> {t.trips}</p>
        <section className="landing-features" aria-label={t.rolesTitle}>{t.features.map((label, index) => <div key={index}><FeatureIcon index={index}/><h2>{label}</h2></div>)}</section>
        <section className="landing-roles" aria-labelledby="landing-roles-title"><h2 id="landing-roles-title">{t.rolesTitle}</h2><div className="landing-role-grid">{t.roles.map((title, index) => {
          const body = <><Image src={`/assets/landing/${roleImages[index]}`} alt={t.roleAlt[index]} width={1408} height={768} sizes="(max-width: 767px) 90vw, 32vw"/><div className="landing-role-copy"><div className="landing-role-heading"><h3>{title}</h3><span className="landing-role-arrow"><Arrow/></span></div><p>{t.descriptions[index]}</p><ul>{t.chips[index].map((chip) => <li key={chip}>{chip}</li>)}</ul></div></>;
          return <div className="landing-role-wrap" key={rolePaths[index]}>{roleEntryEnabled ? <Link className="landing-role-card" href={rolePaths[index]} aria-label={`${t.enter} ${title}`}>{body}</Link> : <button type="button" data-landing-notice={`role-${index}`} className="landing-role-card" aria-label={`${t.enter} ${title}`} onClick={() => setNotice({ id: `role-${index}`, text: t.access })}>{body}</button>}<span className="landing-plain-notice" role="status" aria-live="polite">{notice?.id === `role-${index}` ? notice.text : ""}</span></div>;
        })}</div></section>
        <section className="landing-signin" aria-labelledby="landing-signin-title"><h2 id="landing-signin-title">{t.cta}</h2><div><Link className="landing-pill landing-primary" href="/pilih-peran">{t.signIn}<Arrow/></Link><Link className="landing-pill landing-white-outline" href="/daftar">{t.register}</Link></div><p>{t.newAccount} <Link href="/daftar">{t.registerHere}</Link></p></section>
      </main>
      <footer className="landing-footer"><p>{t.copyright}</p><nav aria-label={t.help}>{[t.privacy, t.terms, t.help].map((label, index) => <a href={`#landing-info-${index}`} key={label} onClick={(event) => { event.preventDefault(); setInfo(label); }}>{label}</a>)}</nav></footer>
      <dialog ref={dialog} className="landing-info-dialog" onClose={() => setInfo(null)} aria-labelledby="landing-info-title"><h2 id="landing-info-title">{info}</h2><p>{t.pending}</p><button className="landing-pill landing-primary" type="button" onClick={() => dialog.current?.close()}>{t.close}</button></dialog>
    </div>
  </div>;
}
