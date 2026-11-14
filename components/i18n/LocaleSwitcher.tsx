"use client";

import { useEffect, useRef } from "react";
import { localeDisplayNames, locales, type Locale } from "@/lib/i18n/config";
import { useRouter } from "next/navigation";
import { useLocale } from "./LocaleProvider";

const languageMeta: Record<Locale, { flag: string; code: string }> = {
  id: { flag: "🇮🇩", code: "ID" },
  en: { flag: "🇬🇧", code: "EN" },
  ar: { flag: "🇸🇦", code: "AR" },
};

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
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", dismiss); };
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
        className="flex h-9 min-w-9 cursor-pointer list-none items-center justify-center gap-1.5 rounded-lg border border-current/15 bg-white/90 px-2.5 text-xs font-bold shadow-sm outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-emerald-700 [&::-webkit-details-marker]:hidden"
      >
        <span aria-hidden="true" className="text-base leading-none">{languageMeta[locale].flag}</span>
        <span className="ms-1 text-[10px] tracking-wide">{languageMeta[locale].code}</span>
      </summary>
      <div
        role="group"
        aria-label={locale === "ar" ? "اللغات" : locale === "en" ? "Languages" : "Pilihan bahasa"}
        className="absolute right-0 top-[calc(100%+6px)] z-[101] min-w-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-slate-800 shadow-xl"
      >
        {locales.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            aria-current={locale === option ? "true" : undefined}
            className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 text-start text-xs font-semibold hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 aria-[current=true]:bg-emerald-50"
          >
            <span aria-hidden="true" className="text-base">{languageMeta[option].flag}</span>
            <span className="flex-1">{localeDisplayNames[option]}</span>
            {locale === option && <span aria-hidden="true" className="text-emerald-700">✓</span>}
          </button>
        ))}
      </div>
    </details>
  );
}
