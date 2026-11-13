"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { Icon } from "./Icon";
import { isNavItemActive, type NavItem, type NavGroup } from "./nav-config";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { translateNavigationLabel } from "@/lib/i18n/navigation";

/**
 * Navigasi bawah bersama untuk keempat area, dengan penanda halaman aktif.
 *
 * Pada area dengan banyak tujuan (Operator/Pengelola), `groups` menambahkan
 * tombol "Menu" di navigasi bawah. Tombol itu membuka daftar tujuan yang sama
 * dengan sidebar, sehingga semua menu tetap terjangkau di layar kecil tanpa
 * mengembalikan hamburger di header.
 */
export function BottomNav({
  items,
  rootHref,
  ariaLabel,
  groups,
  areaLabel = "Operator Utama",
}: {
  items: NavItem[];
  rootHref: string;
  ariaLabel: string;
  groups?: NavGroup[];
  areaLabel?: string;
}) {
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus({ preventScroll: true });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  return (
    <>
      <nav className="mobile-nav" aria-label={translateNavigationLabel(ariaLabel, locale)}>
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
        {groups ? (
          <button
            ref={triggerRef}
            type="button"
            className="mobile-nav-menu"
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-controls={open ? "operator-menu-sheet" : undefined}
            onClick={() => setOpen(true)}
          >
            <Icon name="apps" />
            {translateNavigationLabel("Menu", locale)}
          </button>
        ) : null}
      </nav>

      {groups && open ? (
        <>
          <button
            type="button"
            className="menu-backdrop"
            aria-label={t("closeMenu")}
            onClick={closeMenu}
          />
          <div
            className="menu-sheet"
            id="operator-menu-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="operator-menu-title"
          >
            <div className="menu-sheet-head">
              <BrandLogo size="sm" subtitle={areaLabel} className="menu-sheet-brand" />
              <button
                ref={closeRef}
                type="button"
                className="menu-close"
                onClick={closeMenu}
                aria-label={t("closeMenu")}
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="menu-sheet-body">
              <h2 id="operator-menu-title" className="menu-sheet-title">
                {t("allMenus")}
              </h2>
              {groups.map((group) => (
                <div key={group.label}>
                  <div className="menu-section-label">{translateNavigationLabel(group.label, locale)}</div>
                  {group.items.map((item) => {
                    const active = isNavItemActive(pathname, item.href, rootHref);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`menu-link ${active ? "is-active" : ""}`}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon name={item.icon} />
                        <span>{translateNavigationLabel(item.label, locale)}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="menu-sheet-foot">
              {areaLabel}. Semua tujuan sidebar tersedia di sini.
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
