"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { isNavItemActive, operatorGroups } from "@/components/ui/nav-config";

export function OperatorNav() {
  const pathname = usePathname();

  return (
    <nav className="nav-list" aria-label="Menu pengelola">
      {operatorGroups.map((group) => (
        <div className="nav-section" key={group.label}>
          <div className="workspace-label nav-section-label">{group.label}</div>
          {group.items.map((item) => {
            const active = isNavItemActive(pathname, item.href, "/operator");
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
