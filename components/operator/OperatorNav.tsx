"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/operator", label: "Ringkasan", icon: "▦" },
  { href: "/operator/operasional", label: "Pusat Operasi", icon: "◉" },
  { href: "/operator/bus", label: "Armada Bus", icon: "▰" },
  { href: "/operator/pengemudi", label: "Pengemudi", icon: "◍" },
  { href: "/operator/siswa", label: "Siswa", icon: "♧" },
  { href: "/operator/rute", label: "Rute", icon: "⇢" },
  { href: "/operator/penugasan", label: "Penugasan", icon: "☑" },
  { href: "/operator/perjalanan", label: "Perjalanan", icon: "◷" },
  { href: "/operator/laporan", label: "Laporan", icon: "▤" },
];

export function OperatorNav() {
  const pathname = usePathname();

  return (
    <nav className="nav-list" aria-label="Menu operator">
      {items.map((item) => {
        const active = item.href === "/operator" ? pathname === "/operator" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${active ? "active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
            {active && <span className="nav-active-dot" />}
          </Link>
        );
      })}
    </nav>
  );
}
