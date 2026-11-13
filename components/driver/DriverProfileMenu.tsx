"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { signOutAction } from "@/lib/auth-actions";

export function DriverProfileMenu({ name, children }: { name: string; children?: ReactNode }) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div className="compact-profile" ref={root} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
    }}>
      <button ref={trigger} className="compact-profile-trigger" type="button"
        aria-label="Profil pengemudi" aria-expanded={open} aria-controls={panelId}
        onClick={() => setOpen(!open)}>
        <span aria-hidden="true">{(name || "P").slice(0, 1).toUpperCase()}</span>
        <Icon name="chevronRight" size={12} style={{ transform: "rotate(90deg)" }} />
      </button>
      {open && <div id={panelId} className="compact-profile-panel">
        <strong>{name || "Pengemudi"}</strong>
        {children}
        <form action={signOutAction}>
          <button className="compact-logout" type="submit"><Icon name="logout" size={16} /> Keluar</button>
        </form>
      </div>}
    </div>
  );
}
