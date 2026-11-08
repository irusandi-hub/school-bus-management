"use client";

import { useEffect, useRef, useState } from "react";

export function DevModeTab({ label, notice }: { label: string; notice: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div className="dev-mode-banner" ref={root} data-open={open}>
    <button type="button" className="dev-mode-tab" aria-label={label} aria-expanded={open} aria-controls="dev-mode-label" title={notice} onClick={() => setOpen(!open)}>
      <span className="dev-mode-indicator" aria-hidden="true" />
      <span className="dev-mode-short" aria-hidden="true">DEMO</span>
      <strong id="dev-mode-label" className="dev-mode-label" aria-hidden={!open}>{label}</strong>
    </button>
  </div>;
}
