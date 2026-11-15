"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "./LocaleProvider";
import type { Locale } from "@/lib/i18n/config";

const languageOptions: Locale[] = ["en", "ar", "id"];
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
        <LocaleFlag locale={locale} />
      </summary>
      <div
        role="group"
        aria-label={locale === "ar" ? "اللغات" : locale === "en" ? "Languages" : "Pilihan bahasa"}
        className="absolute right-0 top-[calc(100%+8px)] z-[101] flex w-[52px] min-w-[52px] flex-col gap-1 rounded-xl border border-slate-200/80 bg-white/95 p-1.5 text-slate-800 shadow-lg shadow-slate-900/8 backdrop-blur-sm"
      >
        {languageOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            aria-label={option === "ar" ? "العربية" : option === "en" ? "English" : "Bahasa"}
            aria-current={locale === option ? "true" : undefined}
            title={option === "ar" ? "العربية" : option === "en" ? "English" : "Bahasa"}
            className="flex h-9 w-full items-center justify-center rounded-lg p-1 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 aria-[current=true]:bg-emerald-50"
          >
            <LocaleFlag locale={option} />
          </button>
        ))}
      </div>
    </details>
  );
}
