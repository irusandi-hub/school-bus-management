"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { translateAdminCopy } from "@/lib/i18n/admin-copy";

const areas = [["/", "Beranda"], ["/wali", "Orang Tua"], ["/pengemudi", "Pengemudi"], ["/operator", "Pengelola"]] as const;

// Panel ini hanya untuk masa pengembangan.
export function DevModeTab({ environment, sha, branch }: { environment: string; sha?: string; branch?: string }) {
  const { locale } = useLocale();
  const c = (value: string) => translateAdminCopy(value, locale) ?? value;
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  if (pathname !== "/") return null;
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const area = (pathname === "/admin" || pathname.startsWith("/admin/")) ? "Pengelola" : areas.find(([href]) => href === pathname || (href !== "/" && pathname.startsWith(`${href}/`)))?.[1] ?? "Beranda";
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
      <header><h2 id="dev-mode-title">{c("Mode demo")}</h2><button ref={close} type="button" aria-label={c("Tutup informasi mode demo")} onClick={() => { setOpen(false); trigger.current?.focus({ preventScroll: true }); }}>×</button></header>
      <p>{c("Ini versi uji coba. Akses dibuka tanpa login dan data yang tampil adalah data contoh.")}</p>
      <dl><div><dt>{c("Lingkungan")}</dt><dd>{environment}</dd></div><div><dt>{c("Akses")}</dt><dd>{c("Dibuka")}</dd></div><div><dt>{c("Data")}</dt><dd>{c("Contoh")}</dd></div><div><dt>{c("Area saat ini")}</dt><dd>{c(area)}</dd></div>
        {(sha || branch) && <div><dt>{c("Versi")}</dt><dd>{[sha?.slice(0, 7), branch].filter(Boolean).join(" · ")}</dd></div>}
      </dl>
      <nav aria-label={c("Pintasan area demo")}>{areas.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{c(label)}</Link>)}</nav>
      <p>{c("Akses demo hanya tersedia di lingkungan pengembangan. Pada layanan normal, masuk dan hak akses mengikuti akun Anda.")}</p>
    </section>}
  </div>;
}
