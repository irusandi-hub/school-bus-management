"use client";

import { usePathname, useRouter } from "next/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useLocale } from "./LocaleProvider";

const backLabels = {
  id: "Kembali",
  en: "Back",
  ar: "رجوع",
} as const;

export function GlobalNavigationControls() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLocale();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }

  return (
    <nav className="global-navigation-controls" aria-label="Navigation controls">
      {pathname !== "/" ? (
        <button type="button" className="global-navigation-back" onClick={goBack}>
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
            <path d="M12.5 4.5 7 10l5.5 5.5M7.5 10H17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{backLabels[locale]}</span>
        </button>
      ) : null}
      <div className="global-locale-switcher">
        <LocaleSwitcher compact />
      </div>
    </nav>
  );
}
