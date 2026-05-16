"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, GraduationCap, FolderOpen, UserCheck, LayoutDashboard } from "lucide-react";

const TABS = [
  { href: "/dashboard/org", label: "Overview", Icon: LayoutDashboard },
  { href: "/dashboard/org/students", label: "Students", Icon: Users },
  { href: "/dashboard/org/cohorts", label: "Cohorts", Icon: GraduationCap },
  { href: "/dashboard/org/resources", label: "Resources", Icon: FolderOpen },
  { href: "/dashboard/org/mentors", label: "Mentors", Icon: UserCheck },
];

export default function OrgNavTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 mb-6" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0" }}>
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.625rem 1rem",
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: active ? "var(--accent)" : "var(--text-secondary)",
              textDecoration: "none",
              borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
              transition: "all 0.15s",
              marginBottom: "-1px",
            }}
          >
            <Icon size={14} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
