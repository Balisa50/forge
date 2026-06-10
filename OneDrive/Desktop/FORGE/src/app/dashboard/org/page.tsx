import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users, GraduationCap, Shield, Layers, UserCheck, AlertTriangle, TrendingUp } from "lucide-react";
import OrgInviteCode from "@/components/OrgInviteCode";
import OrgSetup from "@/components/OrgSetup";

export default async function OrgOverviewPage() {
 const session = await auth();
 const userId = session!.user!.id!;

 const membership = await prisma.orgMembership.findFirst({
 where: { userId },
 include: {
 org: {
 include: {
 _count: { select: { members: true, cohorts: true } },
 members: {
 include: { user: { select: { integrityScore: true } } },
 where: { role: "student" },
 },
 },
 },
 },
 });

 // ─── No org: show create/join ───────────────────────────────────────
 if (!membership) {
 return <OrgSetup />;
 }

 const org = membership.org;
 const isAdmin = ["owner", "admin"].includes(membership.role);
 const studentCount = org.members.length;
 const avgIntegrity = studentCount > 0
 ? Math.round(org.members.reduce((s, m) => s + m.user.integrityScore, 0) / studentCount)
 : 0;

 // Mentor count
 const mentorCount = await prisma.orgMembership.count({
 where: { orgId: org.id, role: "mentor" },
 });

 // Active cohorts
 const activeCohorts = await prisma.cohort.findMany({
 where: { orgId: org.id, isActive: true },
 include: { _count: { select: { enrollments: true } } },
 orderBy: { deadline: "asc" },
 });

 // Students at risk (integrity < 60)
 const atRiskStudents = org.members.filter((m) => m.user.integrityScore < 60).length;

 // Recent checkins across all students in org
 const studentIds = org.members.map((m) => m.userId);
 const recentCheckins = studentIds.length > 0
 ? await prisma.checkin.findMany({
 where: { userId: { in: studentIds } },
 orderBy: { createdAt: "desc" },
 take: 10,
 include: {
 user: { select: { name: true } },
 interrogation: { select: { passed: true, overallScore: true } },
 },
 })
 : [];

 // Checkins today
 const todayStart = new Date();
 todayStart.setHours(0, 0, 0, 0);
 const checkinsToday = studentIds.length > 0
 ? await prisma.checkin.count({
 where: { userId: { in: studentIds }, createdAt: { gte: todayStart } },
 })
 : 0;

 return (
 <div>
 {/* At-risk alert */}
 {atRiskStudents > 0 && isAdmin && (
 <div className="forge-panel" style={{ padding: "1rem 1.5rem", marginBottom: "1rem", borderColor: "var(--red)", background: "rgba(255,45,45,0.05)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
 <AlertTriangle size={18} color="var(--red)" />
 <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, color: "var(--red)", fontSize: "0.9375rem" }}>
 {atRiskStudents} student{atRiskStudents !== 1 ? "s" : ""} at risk
 </span>
 <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>, integrity below 60. Consider assigning mentors or reaching out.
 </span>
 </div>
 )}

 {/* Stats row */}
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
 {[
 { label: "Students", value: studentCount, icon: GraduationCap, color: "var(--accent)" },
 { label: "Mentors", value: mentorCount, icon: UserCheck, color: "var(--blue)" },
 { label: "Cohorts", value: activeCohorts.length, icon: Layers, color: "var(--green)" },
 { label: "Avg Integrity", value: avgIntegrity, icon: Shield, color: avgIntegrity >= 80 ? "var(--green)" : avgIntegrity >= 50 ? "var(--yellow)" : "var(--red)" },
 { label: "Active Today", value: checkinsToday, icon: TrendingUp, color: checkinsToday > 0 ? "var(--green)" : "var(--text-dim)" },
 { label: "Seats Used", value: `${org._count.members}/${org.maxSeats}`, icon: Users, color: org._count.members >= org.maxSeats ? "var(--red)" : "var(--text-secondary)" },
 ].map((stat) => (
 <div key={stat.label} className="forge-panel" style={{ padding: "1.25rem 1.5rem" }}>
 <div className="flex items-center gap-2 mb-2">
 <stat.icon size={14} color={stat.color} />
 <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase" }}>{stat.label}</div>
 </div>
 <div style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", color: stat.color, lineHeight: 1 }}>{stat.value}</div>
 </div>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Invite Code */}
 {isAdmin && (
 <div className="forge-panel" style={{ padding: "1.25rem" }}>
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", letterSpacing: "0.05em", marginBottom: "1rem" }}>Invite Code</h2>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1rem" }}>
 Share this code with students or staff to join your organization.
 </p>
 <OrgInviteCode code={org.inviteCode} />
 <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", marginTop: "0.75rem" }}>
 {org._count.members} / {org.maxSeats} seats used
 </div>
 </div>
 )}

 {/* Active Cohorts */}
 <div className="forge-panel" style={{ padding: "1.25rem" }}>
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", letterSpacing: "0.05em", marginBottom: "1rem" }}>Active Cohorts</h2>
 {activeCohorts.length === 0 ? (
 <p style={{ color: "var(--text-dim)", fontSize: "0.875rem" }}>No active cohorts. Create one to start managing students.</p>
 ) : (
 <div className="flex flex-col gap-3">
 {activeCohorts.map((c) => {
 const daysLeft = Math.ceil((new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
 return (
 <div key={c.id} style={{ padding: "0.75rem", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
 <div className="flex items-center justify-between mb-1">
 <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.9375rem" }}>{c.name}</span>
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>{c._count.enrollments} enrolled</span>
 </div>
 <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: daysLeft > 7 ? "var(--text-dim)" : daysLeft > 0 ? "var(--yellow)" : "var(--red)" }}>
 {daysLeft > 0 ? `${daysLeft} days remaining` : "Deadline passed"}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>

 {/* Recent Activity Feed */}
 <div className="forge-panel lg:col-span-2" style={{ padding: "1.25rem" }}>
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", letterSpacing: "0.05em", marginBottom: "1rem" }}>Recent Student Activity</h2>
 {recentCheckins.length === 0 ? (
 <p style={{ color: "var(--text-dim)", fontSize: "0.875rem" }}>No student activity yet.</p>
 ) : (
 <div className="flex flex-col gap-2">
 {recentCheckins.map((c) => (
 <div key={c.id} className="flex items-center justify-between" style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
 <div className="flex items-center gap-3">
 <div style={{
 width: "28px", height: "28px", borderRadius: "50%",
 background: "var(--bg-card)", border: "1px solid var(--border)",
 display: "flex", alignItems: "center", justifyContent: "center",
 fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)",
 }}>
 {c.user.name.charAt(0)}
 </div>
 <div>
 <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem" }}>{c.user.name}</span>
 <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
 {c.description.slice(0, 50)}...
 </div>
 </div>
 </div>
 <div className="flex items-center gap-3">
 {c.interrogation && (
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: c.interrogation.passed ? "var(--green)" : "var(--red)" }}>
 {c.interrogation.overallScore.toFixed(1)}
 </span>
 )}
 <div style={{
 fontFamily: "var(--font-mono)", fontSize: "0.6875rem",
 padding: "0.125rem 0.5rem", borderRadius: "4px",
 background: c.status === "passed" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
 color: c.status === "passed" ? "var(--green)" : "var(--red)",
 textTransform: "uppercase",
 }}>
 {c.status}
 </div>
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
 {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
 </span>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
