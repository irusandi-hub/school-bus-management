"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const areas = [["/", "Beranda"], ["/wali", "Orang Tua"], ["/pengemudi", "Pengemudi"], ["/operator", "Operator"]] as const;

// Panel ini hanya untuk masa pengembangan.
export function DevModeTab({ environment, sha, branch }: { environment: string; sha?: string; branch?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const area = (pathname === "/admin" || pathname.startsWith("/admin/")) ? "Operator" : areas.find(([href]) => href === pathname || (href !== "/" && pathname.startsWith(`${href}/`)))?.[1] ?? "Beranda";
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    close.current?.focus({ preventScroll: true });
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus({ preventScroll: true }); } };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div className="dev-mode-banner" ref={root} data-open={open}>
    <button ref={trigger} type="button" className="dev-mode-tab" aria-label={`DEMO · ${environment}`} aria-expanded={open} aria-controls={open ? "dev-mode-panel" : undefined} onClick={() => setOpen(!open)}>
      <span className="dev-mode-tab-face"><span className="dev-mode-indicator" aria-hidden="true" /><span className="dev-mode-short" aria-hidden="true">DEMO</span></span>
    </button>
    {open && <section className="dev-mode-panel" id="dev-mode-panel" aria-labelledby="dev-mode-title">
      <header><h2 id="dev-mode-title">Mode demo</h2><button ref={close} type="button" aria-label="Tutup informasi mode demo" onClick={() => { setOpen(false); trigger.current?.focus({ preventScroll: true }); }}>×</button></header>
      <p>Ini versi uji coba. Akses dibuka tanpa login dan data yang tampil adalah data contoh.</p>
      <dl><div><dt>Lingkungan</dt><dd>{environment}</dd></div><div><dt>Akses</dt><dd>Dibuka</dd></div><div><dt>Data</dt><dd>Contoh</dd></div><div><dt>Area saat ini</dt><dd>{area}</dd></div>
        {(sha || branch) && <div><dt>Versi</dt><dd>{[sha?.slice(0, 7), branch].filter(Boolean).join(" · ")}</dd></div>}
      </dl>
      <nav aria-label="Pintasan area demo">{areas.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}</nav>
      <p>Login dan hak akses akan diaktifkan di tahap berikutnya.</p>
    </section>}
  </div>;
}
