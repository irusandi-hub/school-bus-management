"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { useLocale } from "@/components/i18n/LocaleProvider";

type Notice = { id: string; message: string } | null;
const NoticeContext = createContext<{ active: Notice; show: (notice: Notice) => void }>({ active: null, show: () => {} });

export function LandingControls({ children }: { children: ReactNode }) {
  const [active, show] = useState<Notice>(null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => show(null), 2500);
    const dismiss = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !root.current?.contains(target) || !target.closest(`[data-landing-notice="${active.id}"]`)) show(null);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") show(null); };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { clearTimeout(timer); document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); };
  }, [active]);
  return <NoticeContext.Provider value={{ active, show }}><div ref={root} className="landing-controls"><div className="landing-locale"><LocaleSwitcher /></div>{children}</div></NoticeContext.Provider>;
}

// Tooltip absolut tidak ikut menentukan tinggi wrapper tombol.
function NoticeButton({ id, message, className, label, children, tooltip = true }: { id: string; message: string; className: string; label?: string; children: ReactNode; tooltip?: boolean }) {
  const { active, show } = useContext(NoticeContext);
  return <span className={`landing-notice-anchor ${id.startsWith("role-") ? "landing-notice-role" : ""}`} data-landing-notice={id}>
    <button type="button" className={className} aria-label={label} onClick={() => show({ id, message })}>{children}</button>
    {tooltip && <span className="landing-tooltip" role="status" aria-live="polite" aria-atomic="true">{active?.id === id ? message : ""}</span>}
  </span>;
}

export function LandingDownloads() {
  const { active } = useContext(NoticeContext);
  return <div className="landing-actions">
    {/* Tautan toko belum tersedia. Ganti dengan URL App Store/Google Play saat aplikasi dirilis. */}
    <NoticeButton tooltip={false} id="store-apple" message={t("downloadUnavailable")} className="landing-btn landing-btn-primary">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 2c.1 1.6-.7 3.1-1.7 4-1 .9-2.3 1.3-3.4 1.2-.1-1.5.7-3 1.7-3.9C14.1 2.4 15.5 2 16.5 2ZM20 17.3c-.5 1.2-.8 1.8-1.5 2.9-1 1.4-2.3 3.1-3.9 3.1-1.4 0-1.8-.9-3.7-.9s-2.3.9-3.7.9c-1.6 0-2.8-1.6-3.8-3C.7 16.4.2 11.7 1.9 9.2c1.2-1.8 3.2-2.8 5-2.8 1.5 0 2.5.9 3.8.9 1.2 0 2-.9 3.8-.9 1.5 0 3 .8 4.2 2.1-3.7 2-3.1 7.1 1.3 8.8Z" transform="translate(2 0) scale(.85 1)" /></svg>
      <span>{t("storeApp")}</span>
    </NoticeButton>
    <NoticeButton tooltip={false} id="store-google" message="Unduh aplikasi belum tersedia" className="landing-btn landing-btn-outline">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 2l12 10L3 22V2Z" fill="#4285f4"/><path d="m3 2 15 8-3 2L3 2Z" fill="#34a853"/><path d="m3 22 15-8-3-2L3 22Z" fill="#ea4335"/><path d="m15 12 3-2 4 2-4 2-3-2Z" fill="#fbbc04"/></svg>
      <span>{t("googlePlay")}</span>
    </NoticeButton>
    <span className="landing-tooltip landing-download-tooltip" role="status" aria-live="polite" aria-atomic="true">{active?.id.startsWith("store-") ? active.message : ""}</span>
  </div>;
}

export function LandingRoleArrow({ enabled, href, label }: { enabled: boolean; href: string; label: string }) {
  const icon = <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 12h14M13 6.2l5.8 5.8L13 17.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  return enabled ? <Link href={href} className="landing-role-arrow" aria-label={localizedLabel || label}>{icon}</Link> : <NoticeButton id={`role-${href.slice(1)}`} message={t("accessAfterLogin")} className="landing-role-arrow landing-role-arrow-muted" label={localizedLabel || label}>{icon}</NoticeButton>;
}
