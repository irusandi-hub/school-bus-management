"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  {
    label: "Data induk",
    items: [
      { href: "/admin", label: "Ringkasan", icon: "▦" },
      { href: "/admin/sekolah", label: "Sekolah", icon: "⌂" },
      { href: "/admin/operator", label: "Operator", icon: "⛟" },
      { href: "/admin/siswa", label: "Data Siswa", icon: "♧" },
      { href: "/admin/wali", label: "Akun Wali", icon: "☎" },
      { href: "/admin/bus", label: "Bus", icon: "▰" },
      { href: "/admin/pengemudi", label: "Pengemudi", icon: "◍" },
    ],
  },
  {
    label: "Operasional",
    items: [
      { href: "/admin/rute", label: "Rute & Titik Jemput", icon: "⇢" },
      { href: "/admin/penugasan", label: "Penugasan", icon: "☑" },
      { href: "/admin/perjalanan", label: "Perjalanan", icon: "◷" },
      { href: "/admin/laporan", label: "Laporan & Audit", icon: "▤" },
    ],
  },
];

export const adminNavItems = groups.flatMap((group) => group.items);

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="nav-list" aria-label="Menu Admin Pusat">
      {groups.map((group) => (
        <div className="nav-section" key={group.label}>
          <div className="workspace-label nav-section-label">{group.label}</div>
          {group.items.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {active && <span className="nav-active-dot" />}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
