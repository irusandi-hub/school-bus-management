"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavItemActive } from "./nav-config";

/** Navigasi atas portal wali dengan penanda halaman aktif. */
export function PortalNav({ items, rootHref }: { items: { href: string; label: string }[]; rootHref: string }) {
  const pathname = usePathname();

  return (
    <nav className="portal-nav" aria-label="Navigasi portal wali">
      {items.map((item) => {
        const active = isNavItemActive(pathname, item.href, rootHref);
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
