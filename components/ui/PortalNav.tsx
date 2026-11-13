"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavItemActive } from "./nav-config";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { translateNavigationLabel } from "@/lib/i18n/navigation";

/** Navigasi atas portal wali dengan penanda halaman aktif. */
export function PortalNav({ items, rootHref }: { items: { href: string; label: string }[]; rootHref: string }) {
  const pathname = usePathname();
  const { locale } = useLocale();

  return (
    <nav className="portal-nav" aria-label={translateNavigationLabel("Anak saya", locale)}>
      {items.map((item) => {
        const active = isNavItemActive(pathname, item.href, rootHref);
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
            {translateNavigationLabel(item.label, locale)}
          </Link>
        );
      })}
    </nav>
  );
}
