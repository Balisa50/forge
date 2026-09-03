import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Shield, Award, ExternalLink, Globe, CheckCircle2 } from "lucide-react";

function normalizeProfileUrl(value: string, hostPath: string): string {
 const v = value.trim();
 if (/^https?:\/\//i.test(v)) return v;
 if (v.startsWith(hostPath.split("/")[0])) return `https://${v.replace(/^\/+/, "")}`;
 return `https://${hostPath}/${v.replace(/^\/+/, "")}`;
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;

 const user = await prisma.user.findUnique({
 where: { id },
 select: {
 id: true,
 name: true,
 bio: true,
 github: true,
 linkedin: true,
 image: true,
 integrityScore: true,
 isPublic: true,
 createdAt: true,
 certificates: { orderBy: { issuedAt: "desc" } },
 roadmaps: {
 include: {
 tracks: { include: { phases: { include: { tasks: { select: { status: true } } } } } },
 },
 orderBy: { createdAt: "desc" },
 },
 },
 });

 if (!user || !user.isPublic) notFound();

 let totalVerified = 0;
 let totalTasks = 0;

 for (const r of user.roadmaps) {
 const tasks = r.tracks.flatMap((t) => t.phases.flatMap((p) => p.tasks));
 totalTasks += tasks.length;
 totalVerified += tasks.filter((t) => t.status === "verified").length;
 }

 const completedRoadmaps = user.roadmaps.filter((r) => {
 const tasks = r.tracks.flatMap((t) => t.phases.flatMap((p) => p.tasks));
 return tasks.length > 0 && tasks.every((t) => t.status === "verified");
 });

 return (
 <div style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
 <div style={{ maxWidth: "700px", margin: "0 auto", padding: "3rem 1.5rem" }}>
 <Link href="/" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)", textDecoration: "none", display: "inline-block", marginBottom: "2rem" }}>
 ← The Forge
 </Link>

 {/* Profile header */}
 <div className="forge-panel" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
 <div className="flex items-start gap-4" style={{ flexWrap: "wrap" }}>
 <div style={{
 width: "72px", height: "72px", borderRadius: "50%",
 background: "rgba(245,158,11,0.1)", border: "3px solid var(--accent)",
 display: "flex", alignItems: "center", justifyContent: "center",
 fontFamily: "var(--font-headline)", fontSize: "1.75rem", color: "var(--accent)",
 flexShrink: 0,
 }}>
 {user.name.charAt(0)}
 </div>
 <div style={{ flex: 1 }}>
 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>{user.name}</h1>
 <div className="flex items-center gap-3 mb-2">
 <span className="flex items-center gap-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: user.integrityScore >= 20 ? "var(--green)" : "var(--yellow)" }}>
 <Shield size={12} /> Integrity +{user.integrityScore}
 </span>
 </div>
 {user.bio && <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "0.75rem" }}>{user.bio}</p>}
 <div className="flex items-center gap-3">
 {user.github && (
 <a href={normalizeProfileUrl(user.github, "github.com")} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontFamily: "var(--font-mono)", textDecoration: "none" }}>
 <Globe size={14} /> GitHub
 </a>
 )}
 {user.linkedin && (
 <a href={normalizeProfileUrl(user.linkedin, "linkedin.com/in")} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontFamily: "var(--font-mono)", textDecoration: "none" }}>
 <ExternalLink size={14} /> LinkedIn
 </a>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 gap-3 mb-6">
 {[
 { label: "Tasks Verified", value: `${totalVerified}/${totalTasks}`, color: "var(--green)" },
 { label: "Roadmaps Done", value: completedRoadmaps.length, color: "var(--blue)" },
 ].map((s) => (
 <div key={s.label} className="forge-card" style={{ padding: "1rem", textAlign: "center" }}>
 <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5625rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.375rem" }}>{s.label}</div>
 <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", color: s.color }}>{s.value}</div>
 </div>
 ))}
 </div>

 {/* Certificates */}
 {user.certificates.length > 0 && (
 <div className="forge-panel" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", letterSpacing: "0.05em", marginBottom: "1rem" }}>
 <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Award size={18} strokeWidth={1.5} color="var(--accent)" /> Verified Certificates</span>
 </h2>
 <div className="flex flex-col gap-3">
 {user.certificates.map((c) => (
 <Link key={c.id} href={`/verify/cert/${c.verifyCode}`} style={{
 display: "flex", alignItems: "center", justifyContent: "space-between",
 padding: "0.75rem 1rem", background: "var(--bg-card)", border: "1px solid var(--border)",
 borderRadius: "8px", textDecoration: "none", color: "inherit",
 }}>
 <div className="flex items-center gap-3">
 <CheckCircle2 size={18} color="var(--green)" />
 <div>
 <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.9375rem" }}>{c.title}</div>
 <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
 {c.totalTasks} tasks · {Math.round(c.passRate * 100)}% pass rate · {new Date(c.issuedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
 </div>
 </div>
 </div>
 <ExternalLink size={14} color="var(--text-dim)" />
 </Link>
 ))}
 </div>
 </div>
 )}

 {/* Roadmap progress */}
 {user.roadmaps.length > 0 && (
 <div className="forge-panel" style={{ padding: "1.5rem" }}>
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", letterSpacing: "0.05em", marginBottom: "1rem" }}>Learning Paths</h2>
 <div className="flex flex-col gap-3">
 {user.roadmaps.map((r) => {
 const tasks = r.tracks.flatMap((t) => t.phases.flatMap((p) => p.tasks));
 const done = tasks.filter((t) => t.status === "verified").length;
 const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
 const isComplete = done === tasks.length && tasks.length > 0;
 return (
 <div key={r.id}>
 <div className="flex items-center justify-between mb-1">
 <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.9375rem" }}>
 {r.title}
 {isComplete && <CheckCircle2 size={14} color="var(--green)" style={{ display: "inline", marginLeft: "0.375rem", verticalAlign: "middle" }} />}
 </span>
 <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)" }}>{pct}%</span>
 </div>
 <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px" }}>
 <div style={{ height: "100%", width: `${pct}%`, background: isComplete ? "var(--green)" : "var(--accent)", borderRadius: "2px" }} />
 </div>
 </div>
 );
 })}
 </div>
 </div>
 )}

 <div style={{ textAlign: "center", marginTop: "2rem" }}>
 <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)" }}>
 Verified by The Forge, AI-Powered Accountability Platform
 </p>
 </div>
 </div>
 </div>
 );
}
