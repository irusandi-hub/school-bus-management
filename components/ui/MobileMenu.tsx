"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { isNavItemActive, type NavGroup } from "./nav-config";

/**
 * Drawer menu untuk layar kecil. Sidebar disembunyikan di ponsel, jadi seluruh menu
 * harus tetap bisa dijangkau dari sini — bukan hanya empat item di navigasi bawah.
 */
export function MobileMenu({
  groups,
  rootHref,
  areaLabel,
  note,
}: {
  groups: NavGroup[];
  rootHref: string;
  areaLabel: string;
  note?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="menu-trigger"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="menu-sheet"
        aria-label="Buka menu navigasi"
      >
        <Icon name="menu" />
        <span>Menu</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="menu-backdrop"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
          />
          <div className="menu-sheet" id="menu-sheet" role="dialog" aria-modal="true" aria-label={`Menu ${areaLabel}`}>
            <div className="menu-sheet-head">
              <div>
                <div className="brand-name">School Bus</div>
                <div className="brand-sub">{areaLabel}</div>
              </div>
              <button type="button" className="menu-close" onClick={() => setOpen(false)} aria-label="Tutup menu">
                <Icon name="close" />
              </button>
            </div>

            <div className="menu-sheet-body">
              {groups.map((group) => (
                <div key={group.label}>
                  <div className="menu-section-label">{group.label}</div>
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
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            {note && <div className="menu-sheet-foot">{note}</div>}
          </div>
        </>
      )}
    </>
  );
}
