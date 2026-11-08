"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { dictionaries, resolveLanguage, type Language } from "./landing-copy";

// Panel informasi hanya untuk masa pengembangan; tidak memiliki tautan atau tombol di dalamnya.
export function DevModeTab({ environment, sha, branch }: { environment: string; sha?: string; branch?: string }) {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("id");
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const t = dictionaries[language];
  const environmentText = environment.toLowerCase().includes("preview") ? t.preview : environment.toLowerCase().includes("lokal") ? t.local : environment;
  useEffect(() => {
    const sync = () => setLanguage(resolveLanguage(document.documentElement.lang));
    sync(); const observer = new MutationObserver(sync); observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div className="dev-info" ref={root} dir={language === "ar" ? "rtl" : "ltr"} data-open={open}>
    <button ref={trigger} className="dev-info-tab" type="button" aria-label={t.demoOpen} aria-expanded={open} aria-controls={open ? "dev-info-panel" : undefined} title={t.demoGrip}
      onPointerDown={(event) => { start.current = { x: event.clientX, y: event.clientY }; dragged.current = false; event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerUp={(event) => { if (!start.current) return; const dx = (event.clientX - start.current.x) * (language === "ar" ? -1 : 1); const dy = Math.abs(event.clientY - start.current.y); if (Math.abs(dx) > 25 && Math.abs(dx) > dy) { setOpen(dx > 0); dragged.current = true; } start.current = null; }}
      onPointerCancel={() => { start.current = null; }} onClick={() => { if (!dragged.current) setOpen(!open); dragged.current = false; }}>
      <span aria-hidden="true" className="dev-info-grip">⋮</span><span className="dev-info-word">{t.demo}</span><span aria-hidden="true" className="dev-info-chevron">{open ? "‹" : "›"}</span>
    </button>
    {open && <section id="dev-info-panel" className="dev-info-panel" aria-labelledby="dev-info-heading" role="status"><h2 id="dev-info-heading">{t.demoTitle}</h2><dl><div><dt>{t.environment}</dt><dd>{environmentText}</dd></div>{(sha || branch) && <div><dt>{t.version}</dt><dd dir="ltr">{[sha?.slice(0,7), branch].filter(Boolean).join(" · ")}</dd></div>}</dl><p>{t.demoNote}</p></section>}
  </div>;
}
