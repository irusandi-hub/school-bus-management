"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "./LocaleProvider";
import type { Locale } from "@/lib/i18n/config";

const languageOptions: { locale: Locale; flag: string; label: string }[] = [
  { locale: "en", flag: "🇬🇧", label: "English" },
  { locale: "ar", flag: "🇸🇦", label: "العربية" },
  { locale: "id", flag: "🇮🇩", label: "Bahasa Indonesia" },
];

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
        className="absolute right-0 top-[calc(100%+6px)] z-[101] flex min-w-0 items-center gap-1 rounded-xl border border-slate-200 bg-white p-1.5 text-slate-800 shadow-xl"
      >
        {languageOptions.map((option) => (
          <button
            key={option.locale}
            type="button"
            onClick={() => choose(option.locale)}
            aria-label={option.label}
            aria-current={locale === option.locale ? "true" : undefined}
            title={option.label}
            className="relative grid h-9 w-10 place-items-center rounded-lg text-[21px] leading-none hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 aria-[current=true]:bg-emerald-50"
          >
            <span aria-hidden="true">{option.flag}</span>
            {locale === option.locale && <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-emerald-700 text-[9px] font-bold text-white">✓</span>}
          </button>
        ))}
      </div>
    </details>
  );
}
