"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { type User } from "next-auth";
import {
 LayoutDashboard,
 ClipboardCheck,
 Map,
 BookOpen,
 CalendarDays,
 BarChart3,
 Settings,
 LogOut,
 Building2,
 UserCheck,
 UserPlus,
 GraduationCap,
 User as UserIcon,
 Flame,
 Users,
 FolderOpen,
 Layers,
 MessageSquare,
 Bell,
 Menu,
 X,
 Award,
 Key,
 Eye,
 ChevronLeft,
} from "lucide-react";
import NotificationBell from "./NotificationBell";

import type { VisibilityMap } from "@/lib/visibility";
import { DEFAULT_VISIBILITY } from "@/lib/visibility";

interface DashboardNavProps {
 user: User;
 userRole: string;
 orgRole?: string | null;
 isAlsoLearning?: boolean;
 /** Mentor-controlled visibility flags. Filters which sections show. */
 visibility?: VisibilityMap;
 /** True if the user is a mentee (has any active MentorLink). Drives the
 * "mentor releases your weeks" mode, Roadmap nav hidden, dashboard
 * becomes the only place. */
 hasMentor?: boolean;
}

const VISIBILITY_KEYS_BY_HREF: Record<string, keyof VisibilityMap> = {
 "/dashboard/pod": "pod",
 "/dashboard/certificates": "certificates",
 "/dashboard/analytics": "analytics",
 "/dashboard/journal": "journal",
 "/dashboard/calendar": "calendar",
 "/dashboard/notes": "notes",
};

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
 learner: { label: "Solo Learner", color: "var(--accent)" },
 student: { label: "Student", color: "var(--green)" },
 mentor: { label: "Mentor", color: "var(--blue)" },
 bootcamp: { label: "Admin", color: "var(--orange, #ff7c3a)" },
};

type NavItem = { href: string; label: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }> };

function getNavItems(userRole: string, isAlsoLearning: boolean): NavItem[] {
 switch (userRole) {
 case "learner":
 return [
 { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
 { href: "/dashboard/checkin", label: "Check In", Icon: ClipboardCheck },
 { href: "/dashboard/roadmap", label: "Roadmap", Icon: Map },
 { href: "/dashboard/pod", label: "My Pod", Icon: Users },
 { href: "/dashboard/journal", label: "Journal", Icon: BookOpen },
 { href: "/dashboard/notes", label: "Mentor Notes", Icon: MessageSquare },
 { href: "/dashboard/calendar", label: "Calendar", Icon: CalendarDays },
 { href: "/dashboard/analytics", label: "Analytics", Icon: BarChart3 },
 { href: "/dashboard/certificates", label: "Certificates", Icon: Award },
 { href: "/dashboard/settings", label: "Settings", Icon: Settings },
 ];

 case "student":
 return [
 { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
 { href: "/dashboard/checkin", label: "Check In", Icon: ClipboardCheck },
 { href: "/dashboard/roadmap", label: "Roadmap", Icon: Map },
 { href: "/dashboard/pod", label: "My Pod", Icon: Users },
 { href: "/dashboard/journal", label: "Journal", Icon: BookOpen },
 { href: "/dashboard/notes", label: "Mentor Notes", Icon: MessageSquare },
 { href: "/dashboard/calendar", label: "Calendar", Icon: CalendarDays },
 { href: "/dashboard/analytics", label: "Analytics", Icon: BarChart3 },
 { href: "/dashboard/certificates", label: "Certificates", Icon: Award },
 { href: "/dashboard/settings", label: "Settings", Icon: Settings },
 ];

 case "mentor":
 return isAlsoLearning
 ? [
 { href: "/dashboard", label: "Overview", Icon: LayoutDashboard },
 { href: "/dashboard/mentor", label: "My Mentees", Icon: Users },
 { href: "/dashboard/mentor/applications", label: "Applications", Icon: UserPlus },
 { href: "/dashboard/mentor/invite", label: "Invite mentee", Icon: UserPlus },
 { href: "/dashboard/checkin", label: "Check In", Icon: ClipboardCheck },
 { href: "/dashboard/roadmap", label: "Roadmap", Icon: Map },
 { href: "/dashboard/pod", label: "My Pod", Icon: Users },
 { href: "/dashboard/journal", label: "Journal", Icon: BookOpen },
 { href: "/dashboard/calendar", label: "Calendar", Icon: CalendarDays },
 { href: "/dashboard/analytics", label: "Analytics", Icon: BarChart3 },
 { href: "/dashboard/certificates", label: "Certificates", Icon: Award },
 { href: "/dashboard/settings", label: "Settings", Icon: Settings },
 ]
 : [
 { href: "/dashboard/mentor", label: "Overview", Icon: LayoutDashboard },
 { href: "/dashboard/mentor/applications", label: "Applications", Icon: UserPlus },
 { href: "/dashboard/mentor/invite", label: "Invite mentee", Icon: UserPlus },
 { href: "/dashboard/mentor/reviews", label: "Reviews", Icon: ClipboardCheck },
 { href: "/dashboard/settings", label: "Settings", Icon: Settings },
 ];

 case "bootcamp":
 return [
 { href: "/dashboard/org", label: "Overview", Icon: LayoutDashboard },
 { href: "/dashboard/org/students", label: "Students", Icon: GraduationCap },
 { href: "/dashboard/org/mentors", label: "Mentors", Icon: UserCheck },
 { href: "/dashboard/org/cohorts", label: "Cohorts", Icon: Layers },
 { href: "/dashboard/org/resources", label: "Resources", Icon: FolderOpen },
 { href: "/dashboard/settings", label: "Settings", Icon: Settings },
 ];

 default:
 return [
 { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
 { href: "/dashboard/settings", label: "Settings", Icon: Settings },
 ];
 }
}

export default function DashboardNav({ user, userRole, orgRole, isAlsoLearning = false, visibility, hasMentor = false }: DashboardNavProps) {
 const pathname = usePathname();
 const [mobileOpen, setMobileOpen] = useState(false);
 const [signingOut, setSigningOut] = useState(false);

 // Pending-review count for mentors, polled so the Reviews nav item carries a
 // live badge (and the mobile hamburger shows a dot when the sidebar is shut).
 const isMentor = userRole === "mentor";
 const [pendingReviews, setPendingReviews] = useState(0);
 useEffect(() => {
 if (!isMentor) return;
 let cancelled = false;
 const loadCount = async () => {
 try {
 const res = await fetch("/api/mentor/reviews?count=1");
 if (!res.ok) return;
 const data = await res.json();
 if (!cancelled) setPendingReviews(data.count ?? 0);
 } catch { /* silent */ }
 };
 loadCount();
 const id = setInterval(loadCount, 45_000);
 return () => { cancelled = true; clearInterval(id); };
 }, [isMentor]);

 // Robust sign-out. The default next-auth flow waits on a server round-trip
 // (CSRF fetch -> POST -> redirect); if the function is cold or the DB is
 // under pressure that round-trip can stall for minutes with NO visual
 // feedback, so the user thinks the button is dead and clicks again. Here we
 // (1) show an immediate "Signing out…" state and (2) force navigation to the
 // public landing page after a short ceiling, so the user is always out within
 // ~2.5s regardless of how slow the backend is.
 const handleSignOut = useCallback(() => {
 if (signingOut) return;
 setSigningOut(true);
 const escape = () => { window.location.href = "/"; };
 const fallback = setTimeout(escape, 2500);
 signOut({ redirect: false })
 .catch(() => {})
 .finally(() => { clearTimeout(fallback); escape(); });
 }, [signingOut]);
 const vis = visibility ?? DEFAULT_VISIBILITY;
 const NAV_ITEMS = getNavItems(userRole, isAlsoLearning).filter((item) => {
 // Mentees don't navigate the Roadmap, mentor releases weeks directly to dashboard.
 if (hasMentor && item.href === "/dashboard/roadmap") return false;
 const key = VISIBILITY_KEYS_BY_HREF[item.href];
 if (!key) return true;
 return vis[key] !== false;
 });
 const roleInfo = ROLE_LABELS[userRole] ?? ROLE_LABELS.learner;

 const closeMobile = () => setMobileOpen(false);

 // Contextual nav: when the mentor is on a specific mentee's drilldown,
 // surface the per-mentee tools (Recovery, Visibility) here instead of as
 // stacked cards on the page itself. Active tool is reflected via ?tool=...
 //, the page only renders the matching panel. Active state highlights in the bar.
 const menteeMatch = pathname.match(/^\/dashboard\/mentor\/([^/]+)(?:\/.*)?$/);
 const menteeId = menteeMatch && !["applications", "invite", "reviews"].includes(menteeMatch[1])
 ? menteeMatch[1]
 : null;
 const searchParams = useSearchParams();
 const activeTool = searchParams?.get("tool") ?? null;

 const navContent = (
 <>
 {/* Logo + Bell (desktop) / Close (mobile) */}
 <div style={{ padding: "0 1.5rem", marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
 <Link href="/dashboard" style={{ textDecoration: "none", flex: 1, minWidth: 0 }} onClick={closeMobile}>
 <span
 style={{
 fontFamily: "var(--font-headline)",
 color: "var(--accent)",
 fontSize: "1.375rem",
 fontWeight: 700,
 letterSpacing: "0.05em",
 display: "flex",
 alignItems: "center",
 gap: "0.5rem",
 }}
 >
 <Flame size={20} /> THE FORGE
 </span>
 </Link>
 {/* Desktop-only Messages + bell, sit next to the logo so each panel
 can open downward into the empty space below. Hidden on mobile
 because the mobile top-bar carries its own pair. */}
 <span className="nav-bell-desktop" style={{ alignItems: "center", gap: "0.125rem" }}>
 <NotificationBell view="messages" icon={MessageSquare} title="Messages" emptyText="No messages yet" align="left" direction="down" />
 <NotificationBell view="events" icon={Bell} title="Notifications" align="left" direction="down" />
 </span>
 {/* Close button on mobile */}
 <button
 onClick={closeMobile}
 className="nav-close-btn"
 style={{
 display: "none",
 background: "none",
 border: "none",
 color: "var(--text-dim)",
 cursor: "pointer",
 padding: "0.25rem",
 }}
 >
 <X size={20} />
 </button>
 </div>

 {/* Nav items */}
 <div className="flex flex-col gap-0.5 px-3" style={{ flex: 1, overflowY: "auto" }}>
 {NAV_ITEMS.map(({ href, label, Icon }) => {
 const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
 return (
 <Link
 key={href}
 href={href}
 onClick={closeMobile}
 style={{
 display: "flex",
 alignItems: "center",
 gap: "0.625rem",
 padding: "0.5rem 0.75rem",
 borderRadius: "6px",
 fontFamily: "var(--font-body)",
 fontWeight: 500,
 fontSize: "0.875rem",
 color: active ? "var(--text-primary)" : "var(--text-secondary)",
 background: active ? "rgba(245,158,11,0.08)" : "transparent",
 borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
 transition: "all 0.15s",
 textDecoration: "none",
 }}
 >
 <Icon size={16} strokeWidth={active ? 2.5 : 2} />
 {label}
 {href === "/dashboard/mentor/reviews" && pendingReviews > 0 && (
 <span
 aria-label={`${pendingReviews} awaiting review`}
 style={{
 marginLeft: "auto",
 minWidth: 18,
 height: 18,
 padding: "0 5px",
 borderRadius: 9,
 background: "var(--red)",
 color: "#fff",
 fontSize: "0.625rem",
 fontWeight: 700,
 fontFamily: "var(--font-mono)",
 display: "inline-flex",
 alignItems: "center",
 justifyContent: "center",
 lineHeight: 1,
 }}
 >
 {pendingReviews > 99 ? "99+" : pendingReviews}
 </span>
 )}
 </Link>
 );
 })}

 {/* ── Contextual: mentee drilldown tools ── */}
 {menteeId && (
 <>
 <div style={{
 marginTop: "1rem",
 padding: "0 0.75rem 0.4rem",
 fontFamily: "var(--font-mono)",
 fontSize: "0.625rem",
 letterSpacing: "0.22em",
 textTransform: "uppercase",
 color: "var(--text-dim)",
 display: "flex",
 alignItems: "center",
 gap: "0.4rem",
 }}>
 <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
 <span>Mentee tools</span>
 <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
 </div>

 {/* Back to mentees */}
 <Link
 href="/dashboard/mentor"
 onClick={closeMobile}
 style={{
 display: "flex",
 alignItems: "center",
 gap: "0.625rem",
 padding: "0.5rem 0.75rem",
 borderRadius: 6,
 fontFamily: "var(--font-body)",
 fontSize: "0.8125rem",
 color: "var(--text-dim)",
 textDecoration: "none",
 }}
 >
 <ChevronLeft size={14} /> Back to all mentees
 </Link>

 {/* Tool: Roadmap (default view) */}
 <Link
 href={`/dashboard/mentor/${menteeId}`}
 onClick={closeMobile}
 style={{
 display: "flex",
 alignItems: "center",
 gap: "0.625rem",
 padding: "0.5rem 0.75rem",
 borderRadius: 6,
 fontFamily: "var(--font-body)",
 fontWeight: 500,
 fontSize: "0.875rem",
 color: !activeTool ? "var(--text-primary)" : "var(--text-secondary)",
 background: !activeTool ? "rgba(245,158,11,0.08)" : "transparent",
 borderLeft: !activeTool ? "2px solid var(--accent)" : "2px solid transparent",
 textDecoration: "none",
 }}
 >
 <Map size={16} strokeWidth={!activeTool ? 2.5 : 2} />
 Roadmap
 </Link>

 {/* Tool: Recovery */}
 <Link
 href={`/dashboard/mentor/${menteeId}?tool=recovery`}
 onClick={closeMobile}
 style={{
 display: "flex",
 alignItems: "center",
 gap: "0.625rem",
 padding: "0.5rem 0.75rem",
 borderRadius: 6,
 fontFamily: "var(--font-body)",
 fontWeight: 500,
 fontSize: "0.875rem",
 color: activeTool === "recovery" ? "var(--text-primary)" : "var(--text-secondary)",
 background: activeTool === "recovery" ? "rgba(245,158,11,0.08)" : "transparent",
 borderLeft: activeTool === "recovery" ? "2px solid var(--accent)" : "2px solid transparent",
 textDecoration: "none",
 }}
 >
 <Key size={16} strokeWidth={activeTool === "recovery" ? 2.5 : 2} />
 Personal ID Recovery
 </Link>

 {/* Tool: Visibility */}
 <Link
 href={`/dashboard/mentor/${menteeId}?tool=visibility`}
 onClick={closeMobile}
 style={{
 display: "flex",
 alignItems: "center",
 gap: "0.625rem",
 padding: "0.5rem 0.75rem",
 borderRadius: 6,
 fontFamily: "var(--font-body)",
 fontWeight: 500,
 fontSize: "0.875rem",
 color: activeTool === "visibility" ? "var(--text-primary)" : "var(--text-secondary)",
 background: activeTool === "visibility" ? "rgba(245,158,11,0.08)" : "transparent",
 borderLeft: activeTool === "visibility" ? "2px solid var(--accent)" : "2px solid transparent",
 textDecoration: "none",
 }}
 >
 <Eye size={16} strokeWidth={activeTool === "visibility" ? 2.5 : 2} />
 What they can see
 </Link>

 {/* Tool: Certificate */}
 <Link
 href={`/dashboard/mentor/${menteeId}?tool=certificate`}
 onClick={closeMobile}
 style={{
 display: "flex",
 alignItems: "center",
 gap: "0.625rem",
 padding: "0.5rem 0.75rem",
 borderRadius: 6,
 fontFamily: "var(--font-body)",
 fontWeight: 500,
 fontSize: "0.875rem",
 color: activeTool === "certificate" ? "var(--text-primary)" : "var(--text-secondary)",
 background: activeTool === "certificate" ? "rgba(245,158,11,0.08)" : "transparent",
 borderLeft: activeTool === "certificate" ? "2px solid var(--accent)" : "2px solid transparent",
 textDecoration: "none",
 }}
 >
 <Award size={16} strokeWidth={activeTool === "certificate" ? 2.5 : 2} />
 Certificate
 </Link>
 </>
 )}
 </div>

 {/* User + Role + Sign Out */}
 <div style={{ padding: "1.25rem 1.5rem 0", borderTop: "1px solid var(--border)" }}>
 <div style={{ marginBottom: "0.75rem" }}>
 <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
 {user.name}
 </div>
 <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
 {user.email}
 </div>
 <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5625rem", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: "0.375rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
 <span style={{ color: roleInfo.color, display: "flex", alignItems: "center", gap: "0.25rem" }}>
 {userRole === "student" && <GraduationCap size={10} />}
 {userRole === "mentor" && <UserCheck size={10} />}
 {userRole === "bootcamp" && <Building2 size={10} />}
 {userRole === "learner" && <UserIcon size={10} />}
 {roleInfo.label}
 </span>
 </div>
 </div>
 <button
 onClick={handleSignOut}
 disabled={signingOut}
 style={{
 display: "flex", alignItems: "center", gap: "0.375rem",
 fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "0.8125rem",
 color: signingOut ? "var(--accent)" : "var(--text-dim)",
 background: "none", border: "none",
 cursor: signingOut ? "default" : "pointer", padding: 0, transition: "color 0.15s",
 opacity: signingOut ? 0.85 : 1,
 }}
 onMouseEnter={(e) => { if (!signingOut) e.currentTarget.style.color = "var(--red)"; }}
 onMouseLeave={(e) => { if (!signingOut) e.currentTarget.style.color = "var(--text-dim)"; }}
 >
 <LogOut size={14} style={signingOut ? { animation: "forge-spin 0.8s linear infinite" } : undefined} />
 {signingOut ? "Signing out…" : "Sign Out"}
 </button>
 </div>
 </>
 );

 return (
 <>
 {/* Mobile hamburger */}
 {/* Mobile top bar, fixed strip across the full width so it never floats over content */}
 <div
 className="nav-hamburger-bar"
 style={{
 display: "none",
 position: "fixed",
 top: 0,
 left: 0,
 right: 0,
 height: "3.5rem",
 background: "var(--bg-panel)",
 borderBottom: "1px solid var(--border)",
 zIndex: 50,
 alignItems: "center",
 padding: "0 1rem",
 gap: "0.75rem",
 }}
 >
 <button
 onClick={() => setMobileOpen(true)}
 aria-label={pendingReviews > 0 ? `Open navigation — ${pendingReviews} awaiting review` : "Open navigation"}
 style={{
 position: "relative",
 background: "none",
 border: "none",
 padding: "0.25rem",
 cursor: "pointer",
 color: "var(--text-primary)",
 display: "flex",
 alignItems: "center",
 }}
 >
 <Menu size={22} />
 {/* Sidebar's closed on mobile, so surface the review count here too. */}
 {isMentor && pendingReviews > 0 && (
 <span
 style={{
 position: "absolute",
 top: -2,
 right: -4,
 minWidth: 16,
 height: 16,
 padding: "0 4px",
 borderRadius: 8,
 background: "var(--red)",
 color: "#fff",
 fontSize: "0.5625rem",
 fontWeight: 700,
 fontFamily: "var(--font-mono)",
 display: "inline-flex",
 alignItems: "center",
 justifyContent: "center",
 lineHeight: 1,
 }}
 >
 {pendingReviews > 9 ? "9+" : pendingReviews}
 </span>
 )}
 </button>
 <span style={{ fontFamily: "var(--font-headline)", color: "var(--accent)", fontSize: "1.125rem", letterSpacing: "0.08em", flex: 1 }}>
 THE FORGE
 </span>
 <NotificationBell view="messages" icon={MessageSquare} title="Messages" emptyText="No messages yet" />
 <NotificationBell view="events" icon={Bell} title="Notifications" />
 </div>

 {/* Mobile overlay */}
 {mobileOpen && (
 <div
 onClick={closeMobile}
 className="nav-overlay"
 style={{
 display: "none",
 position: "fixed",
 inset: 0,
 background: "rgba(0,0,0,0.6)",
 zIndex: 44,
 }}
 />
 )}

 {/* Sidebar */}
 <nav
 className={`dashboard-sidebar ${mobileOpen ? "open" : ""}`}
 style={{
 position: "fixed",
 left: 0,
 top: 0,
 bottom: 0,
 width: "280px",
 background: "var(--bg-panel)",
 borderRight: "1px solid var(--border)",
 display: "flex",
 flexDirection: "column",
 padding: "1.5rem 0",
 zIndex: 45,
 transition: "transform 0.25s ease",
 }}
 >
 {navContent}
 </nav>

 <style>{`
 @keyframes forge-spin { to { transform: rotate(360deg); } }
 .nav-bell-desktop { display: inline-flex; }
 @media (max-width: 768px) {
 .nav-hamburger-bar { display: flex !important; }
 .nav-overlay { display: block !important; }
 .nav-close-btn { display: block !important; }
 .nav-bell-desktop { display: none !important; }
 .dashboard-sidebar {
 transform: translateX(-100%);
 }
 .dashboard-sidebar.open {
 transform: translateX(0);
 }
 }
 `}</style>
 </>
 );
}
