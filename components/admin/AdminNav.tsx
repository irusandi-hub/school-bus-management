"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { adminGroups, isNavItemActive } from "@/components/ui/nav-config";

export const adminNavItems = adminGroups.flatMap((group) => group.items);

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="nav-list" aria-label="Menu Operator">
      {adminGroups.map((group) => (
        <div className="nav-section" key={group.label}>
          <div className="workspace-label nav-section-label">{group.label}</div>
          {group.items.map((item) => {
            const active = isNavItemActive(pathname, item.href, "/admin");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="nav-icon" aria-hidden="true">
                  <Icon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
