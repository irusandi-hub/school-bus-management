"use client";

import { useEffect, useRef, useState } from "react";
import { LANGUAGES, type Lang } from "./translations";
import { CheckIcon, ChevronDownIcon, GlobeIcon } from "./icons";

type Props = {
  lang: Lang;
  label: string;
  onChange: (lang: Lang) => void;
};

/**
 * Pill language picker. The menu is a real menu widget: arrow keys, Home/End,
 * Escape and Tab all behave as expected, and the active language is exposed
 * with aria-checked.
 */
export default function LanguageSwitcher({ lang, label, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusedIndex = useRef(0);
  const activeIndex = LANGUAGES.findIndex((item) => item.code === lang);
  const current = LANGUAGES[activeIndex] ?? LANGUAGES[0];

  function closeMenu(returnFocus = false) {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }

  function openMenu(index = activeIndex) {
    focusedIndex.current = index;
    setOpen(true);
    // Focus after React has mounted the menu items.
    window.requestAnimationFrame(() => itemRefs.current[(index + LANGUAGES.length) % LANGUAGES.length]?.focus());
  }

  function moveFocus(index: number) {
    const next = (index + LANGUAGES.length) % LANGUAGES.length;
    focusedIndex.current = next;
    itemRefs.current[next]?.focus();
  }

  // Close when tapping/clicking elsewhere.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function choose(code: Lang) {
    onChange(code);
    closeMenu(true);
  }

  return (
    <div className="lp-lang" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="lp-lang-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.preventDefault();
            closeMenu(true);
          } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openMenu(activeIndex + (event.key === "ArrowDown" ? 1 : -1));
          }
        }}
      >
        <GlobeIcon />
        <span className="lp-lang-code">{current.short}</span>
        <ChevronDownIcon className={open ? "lp-lang-chevron is-open" : "lp-lang-chevron"} />
      </button>

      {open && (
        <div
          className="lp-lang-menu"
          role="menu"
          aria-label={label}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              closeMenu(true);
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              moveFocus(focusedIndex.current + 1);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              moveFocus(focusedIndex.current - 1);
            } else if (event.key === "Home") {
              event.preventDefault();
              itemRefs.current[0]?.focus();
            } else if (event.key === "End") {
              event.preventDefault();
              itemRefs.current[LANGUAGES.length - 1]?.focus();
            } else if (event.key === "Tab") {
              // Let focus leave naturally, but keep the menu from staying open behind it.
              setOpen(false);
            }
          }}
        >
          {LANGUAGES.map((item, index) => {
            const selected = item.code === lang;
            return (
              <button
                key={item.code}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                className="lp-lang-item"
                lang={item.code}
                onFocus={() => {
                  focusedIndex.current = index;
                }}
                onClick={() => choose(item.code)}
              >
                <span className="lp-lang-name">{item.label}</span>
                {selected && (
                  <span className="lp-lang-check">
                    <CheckIcon />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
