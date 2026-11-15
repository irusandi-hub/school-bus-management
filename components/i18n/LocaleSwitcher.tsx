"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "./LocaleProvider";
import type { Locale } from "@/lib/i18n/config";

const languageOptions: Locale[] = ["en", "ar", "id"];
const localeDisplayNames: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  id: "Bahasa",
};
function LocaleFlag({ locale }: { locale: Locale }) {
  if (locale === "id") {
    return <svg viewBox="0 0 24 16" aria-hidden="true" className="h-4 w-6 overflow-hidden rounded-[3px]">
      <path fill="#e11d48" d="M0 0h24v8H0z" />
      <path fill="#fff" d="M0 8h24v8H0z" />
    </svg>;
  }
  if (locale === "ar") {
    return <svg viewBox="0 0 24 16" aria-hidden="true" className="h-4 w-6 overflow-hidden rounded-[3px]">
      <path fill="#166534" d="M0 0h24v16H0z" />
      <path d="M5 10.2h13" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M7 11.8h10" stroke="#fff" strokeWidth=".8" strokeLinecap="round" />
    </svg>;
  }
  return <svg viewBox="0 0 24 16" aria-hidden="true" className="h-4 w-6 overflow-hidden rounded-[3px]">
    <path fill="#1e3a8a" d="M0 0h24v16H0z" />
    <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="3.2" />
    <path d="M0 0l24 16M24 0L0 16" stroke="#dc2626" strokeWidth="1.1" />
    <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5" />
    <path d="M12 0v16M0 8h24" stroke="#dc2626" strokeWidth="2" />
  </svg>;
}

export function LocaleSwitcher({ compact: _compact = false }: { compact?: boolean } = {}) {
  const { locale, setLocale } = useLocale();
  const router = useRouter();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function dismiss(event: PointerEvent | KeyboardEvent) {
      const menu = detailsRef.current;
      if (!menu?.open) return;
      if (event instanceof KeyboardEvent) {
        if (event.key !== "Escape") return;
        menu.removeAttribute("open");
        menu.querySelector("summary")?.focus();
      } else if (event.target instanceof Node && !menu.contains(event.target)) {
        menu.removeAttribute("open");
      }
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", dismiss);
    };
  }, []);

  function choose(next: Locale) {
    setLocale(next);
    detailsRef.current?.removeAttribute("open");
    router.refresh();
  }

  return (
    <details ref={detailsRef} className="locale-menu relative z-[100]">
      <summary
        aria-label={locale === "ar" ? "اختيار اللغة" : locale === "en" ? "Choose language" : "Pilih bahasa"}
        title={locale === "ar" ? "اختيار اللغة" : locale === "en" ? "Choose language" : "Pilih bahasa"}
        className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-700 [&::-webkit-details-marker]:hidden"
      >
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
          <path d="M3.5 12h17M12 3c2.2 2.4 3.2 5.4 3.2 9s-1 6.6-3.2 9c-2.2-2.4-3.2-5.4-3.2-9S9.8 5.4 12 3Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </summary>
      <div
        role="group"
        aria-label={locale === "ar" ? "اللغات" : locale === "en" ? "Languages" : "Pilihan bahasa"}
        className="absolute right-0 top-[calc(100%+8px)] z-[101] flex w-[156px] min-w-[156px] flex-col gap-0.5 rounded-xl border border-slate-200/80 bg-white/95 p-1.5 text-slate-800 shadow-lg shadow-slate-900/8 backdrop-blur-sm"
      >
        {languageOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            aria-label={localeDisplayNames[option]}
            aria-current={locale === option ? "true" : undefined}
            title={localeDisplayNames[option]}
            className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2 text-left text-[13px] font-medium leading-none text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 aria-[current=true]:bg-emerald-50 aria-[current=true]:text-emerald-800"
          >
            <LocaleFlag locale={option} />
            <span className="min-w-0 flex-1">{localeDisplayNames[option]}</span>
            {locale === option && <span aria-hidden="true" className="text-[11px] font-semibold text-emerald-700">✓</span>}
          </button>
        ))}
      </div>
    </details>
  );
}
