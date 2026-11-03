"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { isNavItemActive, type NavItem } from "./nav-config";

/** Navigasi bawah bersama untuk keempat area, dengan penanda halaman aktif. */
export function BottomNav({
  items,
  rootHref,
  ariaLabel,
}: {
  items: NavItem[];
  rootHref: string;
  ariaLabel: string;
}) {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav" aria-label={ariaLabel}>
      {items.map((item) => {
        const active = isNavItemActive(pathname, item.href, rootHref);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "is-active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            <Icon name={item.icon} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
