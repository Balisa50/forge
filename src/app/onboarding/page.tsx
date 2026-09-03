"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Swords, Clock, TrendingDown, Shield, FlaskConical, CalendarDays, CalendarCheck, CalendarRange, Building2, UserCheck, User, ArrowRight, GraduationCap, Video, Target, AlertTriangle, Search, ExternalLink, Sparkles, ClipboardCheck } from "lucide-react";
import { ROADMAPSH_PATHS, ROADMAPSH_CATEGORIES, type RoadmapShPath } from "@/lib/roadmapsh-paths";
import { CURATED_ROADMAPS, type CuratedRoadmapPickerEntry } from "@/lib/curated-roadmaps-client";

type UserRole = "learner" | "student" | "mentor";

/**
 * Steps vary by role:
 * Learner (solo): role → intro → roadmap → schedule → deadline → consequences → contract
 * Mentee (joining a mentor): role → intro → roadmap → consequences → contract
 * (mentor controls cadence + deadlines, mentee just commits)
 * Mentor (also learning): role → intro → mentorLearn → roadmap → schedule → deadline → consequences → contract
 * Mentor (mentor only): role → intro → mentorLearn → consequences → contract
 */
function getStepsForRole(role: UserRole | null, isAlsoLearning: boolean) {
 if (role === "mentor") {
 if (isAlsoLearning) {
 return ["role", "intro", "mentorLearn", "roadmap", "schedule", "deadline", "consequences", "contract"] as const;
 }
 return ["role", "intro", "mentorLearn", "consequences", "contract"] as const;
 }
 if (role === "student") {
 return ["role", "intro", "roadmap", "consequences", "contract"] as const;
 }
 return ["role", "intro", "roadmap", "schedule", "deadline", "consequences", "contract"] as const;
}

const ROLES = [
 {
 id: "learner" as UserRole,
 Icon: User,
 title: "Solo Learner",
 desc: "I'm learning on my own. Hold me accountable.",
 color: "var(--accent)",
 },
 {
 id: "student" as UserRole,
 Icon: GraduationCap,
 title: "Mentee",
 desc: "I'm being mentored by someone here. I have an invite code from my mentor.",
 color: "var(--green)",
 },
 {
 id: "mentor" as UserRole,
 Icon: UserCheck,
 title: "Mentor",
 desc: "I'm guiding learners. I review their work, unlock their progress, and grant them resources.",
 color: "var(--blue)",
 },
];

const SCHEDULES = [
 { id: "daily", Icon: CalendarDays, title: "Every Day", desc: "Check in daily. Maximum accountability.", commitDays: [0, 1, 2, 3, 4, 5, 6] },
 { id: "weekday", Icon: CalendarCheck, title: "Weekdays Only", desc: "Monday through Friday. Weekends off.", commitDays: [1, 2, 3, 4, 5] },
 { id: "custom", Icon: CalendarRange, title: "Custom Days", desc: "Pick which days you commit to.", commitDays: [] },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function OnboardingPage() {
 const { update: updateSession } = useSession();
 const [step, setStep] = useState<string>("role");
 const [role, setRole] = useState<UserRole | null>(null);
 const [isAlsoLearning, setIsAlsoLearning] = useState(false);
 const [roadmapTitle, setRoadmapTitle] = useState("");
 const [selectedPath, setSelectedPath] = useState<RoadmapShPath | null>(null);
 const [selectedCurated, setSelectedCurated] = useState<CuratedRoadmapPickerEntry | null>(null);
 const [pathSearch, setPathSearch] = useState("");
 const [activeCategory, setActiveCategory] = useState<string>("all");
 const [journeyType, setJourneyType] = useState<"learn" | "project">("learn");
 const [scheduleId, setScheduleId] = useState("daily");
 const [customDays, setCustomDays] = useState<number[]>([]);
 const [agreed, setAgreed] = useState(false);
 const [targetDate, setTargetDate] = useState("");
 const [loading, setLoading] = useState(false);
 const [loadingMessage, setLoadingMessage] = useState("");
 const [error, setError] = useState("");

 // Org creation fields (for bootcamp role)
 const [orgName, setOrgName] = useState("");
 const [orgDesc, setOrgDesc] = useState("");

 // Invite code (mentee redeeming mentor code; mentor optionally joining via legacy org)
 const [inviteCode, setInviteCode] = useState("");
 const [orgError, setOrgError] = useState("");
 const [invitePreview, setInvitePreview] = useState<{ valid: boolean; mentor?: { name: string | null; email: string }; roadmapSlug?: string | null; error?: string } | null>(null);

 const selectedSchedule = SCHEDULES.find((s) => s.id === scheduleId)!;
 const commitDays = scheduleId === "custom" ? customDays : selectedSchedule.commitDays;

 // Steps depend on role + mentor learning preference
 const steps = getStepsForRole(role, isAlsoLearning);
 const currentIndex = (steps as readonly string[]).indexOf(step);
 const needsRoadmap = role === "learner" || role === "student" || (role === "mentor" && isAlsoLearning);

 const toggleDay = (day: number) => {
 setCustomDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
 };

 const handleRoleSelect = (r: UserRole) => {
 setRole(r);
 setStep("intro");
 };

 // Navigate to next step in the role-specific flow
 const nextStep = () => {
 const idx = (steps as readonly string[]).indexOf(step);
 if (idx < steps.length - 1) setStep(steps[idx + 1]);
 };

 const prevStep = () => {
 const idx = (steps as readonly string[]).indexOf(step);
 if (idx > 0) setStep(steps[idx - 1]);
 };

 /**
 * Mentee redeems a mentor's invite code → creates MentorLink + returns
 * the roadmap the mentor scoped it to (so we can pre-select it).
 * Mentor role no longer needs any code at signup, they just generate
 * their own from the dashboard.
 */
 const redeemMentorCodeIfNeeded = async (): Promise<string | null | "fail"> => {
 setOrgError("");
 if (role !== "student" || !inviteCode.trim()) return null;

 const res = await fetch("/api/mentor/invites/redeem", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ code: inviteCode.trim() }),
 });
 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 setOrgError(data.error ?? "Couldn't redeem that code. Ask your mentor for a fresh one.");
 return "fail";
 }
 const data = await res.json();
 return (data.roadmapSlug as string | null) ?? null;
 };

 const handleComplete = async () => {
 if (!agreed || !role) return;
 setLoading(true);
 setError("");

 try {
 // Mentee role: redeem the mentor's code first (mandatory if they entered one)
 let mentorRoadmapSlug: string | null = null;
 if (role === "student") {
 const result = await redeemMentorCodeIfNeeded();
 if (result === "fail") { setLoading(false); return; }
 mentorRoadmapSlug = result;
 }

 // Mentee's own pick takes priority; if they didn't pick but the
 // mentor's invite was scoped to a roadmap, use that.
 let effectiveCurated = selectedCurated;
 if (mentorRoadmapSlug && !effectiveCurated) {
 const { CURATED_ROADMAPS } = await import("@/lib/curated-roadmaps-client");
 effectiveCurated = CURATED_ROADMAPS.find((r) => r.slug === mentorRoadmapSlug) ?? null;
 if (effectiveCurated) setSelectedCurated(effectiveCurated);
 }

 // Seed the user's roadmap from the curated mastery JSON. The roadmap
 // picker forces a curated selection, there is no AI-generated path.
 if (needsRoadmap) {
 if (!effectiveCurated) {
 setError("Pick a learning path before continuing.");
 setLoading(false);
 return;
 }
 setLoadingMessage(`Loading the ${effectiveCurated.title} mastery roadmap...`);
 const res = await fetch("/api/roadmaps/from-curated", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 slug: effectiveCurated.slug,
 commitDays,
 targetDate: targetDate || undefined,
 }),
 });
 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 console.error("[ONBOARDING] Curated roadmap seed failed:", res.status, data);
 setError(data.error || "Couldn't load the roadmap. Try again.");
 setLoading(false);
 setLoadingMessage("");
 return;
 }
 setLoadingMessage("");
 }

 // Save role + mark onboarding complete
 const onboardRes = await fetch("/api/user/onboarding", {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ role, isAlsoLearning: role === "mentor" ? isAlsoLearning : false }),
 });

 if (!onboardRes.ok) {
 const errData = await onboardRes.json().catch(() => ({}));
 console.error("[ONBOARDING] Save failed:", onboardRes.status, errData);
 setError(errData.error || `Failed to save onboarding (${onboardRes.status}). Please try again.`);
 setLoading(false);
 return;
 }

 // Refresh the JWT so proxy knows onboarding is done
 await updateSession();

 // Use window.location (not router.push) to force full reload
 // This ensures the proxy picks up the updated JWT
 if (role === "mentor") {
 window.location.href = "/dashboard/mentor";
 } else {
 // Send learners straight to check-in, first interrogation is the product
 window.location.href = "/dashboard/checkin";
 }
 } catch {
 setError("Something went wrong. Please try again.");
 setLoading(false);
 }
 };

 const canContinueSchedule = scheduleId !== "custom" || customDays.length >= 1;

 const scheduleText = needsRoadmap
 ? scheduleId === "daily"
 ? "every day"
 : scheduleId === "weekday"
 ? "every weekday"
 : `on my chosen days (${customDays.sort((a, b) => a - b).map((d) => DAY_NAMES[d]).join(", ")})`
 : "";

 const checkinDesc = scheduleId === "daily"
 ? "On each committed day, you submit proof of work (live URL or GitHub repo)."
 : `On your committed days (${scheduleId === "weekday" ? "Mon-Fri" : "your chosen days"}), you submit proof of work (live URL or GitHub repo).`;

 return (
 <div style={{ background: "var(--bg-base)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
 <div style={{ width: "100%", maxWidth: "640px" }}>
 {/* Progress dots */}
 <div className="flex justify-center gap-2 mb-8">
 {steps.map((s, i) => (
 <div key={s} style={{ width: "8px", height: "8px", borderRadius: "50%", background: currentIndex >= i ? "var(--accent)" : "var(--border)", transition: "background 0.3s" }} />
 ))}
 </div>

 <AnimatePresence mode="wait">
 {/* ─── Step: Role Selection ──────────────────────────────── */}
 {step === "role" && (
 <motion.div key="role" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
 <div className="text-center" style={{ marginBottom: "2.5rem" }}>
 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2.5rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>Who Are You?</h1>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
 This shapes your experience. You can always change it later.
 </p>
 </div>

 <div className="flex flex-col gap-4">
 {/* Solo Learner ("learner") is gated behind SOLO_MODE_ENABLED.
 While off, FORGE is mentor-required: only Mentee + Mentor. */}
 {ROLES.filter(
 (r) => r.id !== "learner" || process.env.NEXT_PUBLIC_SOLO_MODE_ENABLED === "true",
 ).map((r) => (
 <button
 key={r.id}
 onClick={() => handleRoleSelect(r.id)}
 className="forge-panel"
 style={{
 padding: "1.5rem",
 textAlign: "left",
 cursor: "pointer",
 border: "1px solid var(--border)",
 background: "var(--bg-panel)",
 transition: "border-color 0.15s, box-shadow 0.15s",
 display: "flex",
 alignItems: "flex-start",
 gap: "1rem",
 }}
 onMouseEnter={(e) => { e.currentTarget.style.borderColor = r.color; e.currentTarget.style.boxShadow = `0 0 20px ${r.color}15`; }}
 onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
 >
 <div style={{
 width: "44px", height: "44px", borderRadius: "10px",
 background: `${r.color}12`,
 border: `1px solid ${r.color}30`,
 display: "flex", alignItems: "center", justifyContent: "center",
 flexShrink: 0,
 }}>
 <r.Icon size={22} color={r.color} strokeWidth={1.5} />
 </div>
 <div style={{ flex: 1 }}>
 <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", marginBottom: "0.25rem" }}>{r.title}</div>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>{r.desc}</p>
 </div>
 <ArrowRight size={16} color="var(--text-dim)" style={{ marginTop: "0.25rem", flexShrink: 0 }} />
 </button>
 ))}
 </div>
 </motion.div>
 )}

 {/* ─── Step: Intro ──────────────────────────────────────── */}
 {step === "intro" && (
 <motion.div key="intro" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="text-center">
 <div style={{ marginBottom: "1rem", color: "var(--accent)", display: "flex", justifyContent: "center" }}><Flame size={56} strokeWidth={1.5} /></div>
 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "3rem", color: "var(--text-primary)", marginBottom: "1rem" }}>Welcome to The Forge</h1>
 <p style={{ color: "var(--text-secondary)", fontSize: "1.0625rem", lineHeight: 1.6, maxWidth: "440px", margin: "0 auto 1.5rem", textAlign: "center" }}>
 {role === "mentor"
 ? "You guide. They build. You decide when they're ready to move forward."
 : role === "student"
 ? "Enter the code your mentor gave you, then pick what you're learning."
 : "You set the pace. The Forge holds you to it."
 }
 </p>

 {/* Mentee enters their mentor's pairing code */}
 {role === "student" && (
 <div className="forge-panel" style={{ padding: "1.5rem", textAlign: "left", marginBottom: "1.5rem" }}>
 <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1rem", marginBottom: "0.5rem" }}>Pair with your mentor</h3>
 <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", marginBottom: "1rem" }}>
 Enter the code your mentor gave you. It looks like <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>XXXX-XXXX</span>.
 If they scoped it to a specific path, that path will be auto-selected for you.
 </p>
 <input
 type="text"
 className="forge-input"
 placeholder="ABCD-EFGH"
 value={inviteCode}
 onChange={(e) => {
 const v = e.target.value.toUpperCase();
 setInviteCode(v);
 setInvitePreview(null);
 }}
 onBlur={async () => {
 const code = inviteCode.trim();
 if (!code) { setInvitePreview(null); return; }
 try {
 const res = await fetch(`/api/mentor/invites/redeem?code=${encodeURIComponent(code)}`);
 const data = await res.json();
 setInvitePreview(data);
 } catch {
 setInvitePreview({ valid: false, error: "Couldn't verify code" });
 }
 }}
 style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.15em", textAlign: "center", fontSize: "1.25rem", padding: "1rem", textTransform: "uppercase" }}
 />
 {invitePreview?.valid && invitePreview.mentor && (
 <div style={{ marginTop: "0.625rem", padding: "0.625rem 0.875rem", borderRadius: 8, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
 <p style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--green)", fontSize: "0.8125rem" }}>
 <UserCheck size={14} style={{ flexShrink: 0 }} /> Pairing with <strong>{invitePreview.mentor.name ?? invitePreview.mentor.email}</strong>
 {invitePreview.roadmapSlug && <span style={{ color: "var(--text-secondary)" }}> on the <strong>{invitePreview.roadmapSlug.replace(/-/g, " ")}</strong> path</span>}
 </p>
 </div>
 )}
 {invitePreview && invitePreview.valid === false && (
 <div style={{ marginTop: "0.5rem", color: "var(--red)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)" }}>
 {invitePreview.error ?? "Code not valid"}
 </div>
 )}
 {orgError && <div style={{ color: "var(--red)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", marginTop: "0.5rem" }}>{orgError}</div>}
 </div>
 )}

 {/* Mentor onboarding: no code needed at signup, they generate their own from the dashboard */}
 {role === "mentor" && (
 <div className="forge-panel" style={{ padding: "1rem 1.25rem", textAlign: "left", marginBottom: "1.5rem" }}>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.5 }}>
 You&apos;ll generate pairing codes from your dashboard. One per learner. Each code can be scoped to a path.
 </p>
 </div>
 )}

 <div className="flex gap-3 justify-center">
 <button onClick={() => setStep("role")} className="forge-btn forge-btn-ghost">Back</button>
 <button
 onClick={nextStep}
 className="forge-btn forge-btn-primary"
 style={{ padding: "0.875rem 2.5rem", fontSize: "1rem" }}
 disabled={role === "student" && !inviteCode.trim()}
 >
 {role === "learner" ? "I'm Ready" : "Continue"}
 </button>
 </div>
 </motion.div>
 )}

 {/* ─── Step: Mentor Also Learning? ────────────────────────── */}
 {step === "mentorLearn" && role === "mentor" && (
 <motion.div key="mentorLearn" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
 <div className="text-center" style={{ marginBottom: "2.5rem" }}>
 <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "2.5rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
 Are You Also Learning?
 </h1>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", maxWidth: "480px", margin: "0 auto" }}>
 Some mentors are also on their own learning journey. If that&apos;s you, we&apos;ll set up your roadmap and accountability too.
 </p>
 </div>

 <div className="flex flex-col gap-4 mb-6">
 <button
 onClick={() => { setIsAlsoLearning(true); setStep("roadmap"); }}
 className="forge-panel"
 style={{
 padding: "1.5rem", textAlign: "left", cursor: "pointer",
 border: "1px solid var(--border)", background: "var(--bg-panel)",
 transition: "border-color 0.15s, box-shadow 0.15s",
 display: "flex", alignItems: "flex-start", gap: "1rem",
 }}
 onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--green)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(34,197,94,0.1)"; }}
 onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
 >
 <div style={{
 width: "44px", height: "44px", borderRadius: "10px",
 background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
 display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
 }}>
 <GraduationCap size={22} color="var(--green)" strokeWidth={1.5} />
 </div>
 <div style={{ flex: 1 }}>
 <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", marginBottom: "0.25rem" }}>Yes, I&apos;m Learning Too</div>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
 I want my own roadmap, check-ins, and accountability, alongside mentoring.
 </p>
 </div>
 <ArrowRight size={16} color="var(--text-dim)" style={{ marginTop: "0.25rem", flexShrink: 0 }} />
 </button>

 <button
 onClick={() => { setIsAlsoLearning(false); setStep("consequences"); }}
 className="forge-panel"
 style={{
 padding: "1.5rem", textAlign: "left", cursor: "pointer",
 border: "1px solid var(--border)", background: "var(--bg-panel)",
 transition: "border-color 0.15s, box-shadow 0.15s",
 display: "flex", alignItems: "flex-start", gap: "1rem",
 }}
 onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(59,130,246,0.1)"; }}
 onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
 >
 <div style={{
 width: "44px", height: "44px", borderRadius: "10px",
 background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
 display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
 }}>
 <UserCheck size={22} color="var(--blue)" strokeWidth={1.5} />
 </div>
 <div style={{ flex: 1 }}>
 <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.125rem", marginBottom: "0.25rem" }}>No, Just Mentoring</div>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
 I only want to guide students, track their progress, review their work, hold them accountable.
 </p>
 </div>
 <ArrowRight size={16} color="var(--text-dim)" style={{ marginTop: "0.25rem", flexShrink: 0 }} />
 </button>
 </div>

 <button onClick={prevStep} className="forge-btn forge-btn-ghost" style={{ width: "100%" }}>Back</button>
 </motion.div>
 )}

 {/* ─── Step: Roadmap browser ──────────────────────────────── */}
 {step === "roadmap" && needsRoadmap && (
 <RoadmapBrowser
 selectedCurated={selectedCurated}
 setSelectedCurated={(c) => {
 setSelectedCurated(c);
 if (c) { setSelectedPath(null); setRoadmapTitle(""); }
 }}
 selectedPath={selectedPath}
 setSelectedPath={(p) => { setSelectedPath(p); if (p) { setRoadmapTitle(""); setSelectedCurated(null); } }}
 pathSearch={pathSearch}
 setPathSearch={setPathSearch}
 activeCategory={activeCategory}
 setActiveCategory={setActiveCategory}
 roadmapTitle={roadmapTitle}
 setRoadmapTitle={(t) => { setRoadmapTitle(t); if (t) { setSelectedPath(null); setSelectedCurated(null); } }}
 journeyType={journeyType}
 setJourneyType={setJourneyType}
 onBack={prevStep}
 onNext={nextStep}
 />
 )}

 {/* ─── Step: Schedule (Learner + Student only) ────────────── */}
 {step === "schedule" && needsRoadmap && (
 <motion.div key="schedule" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", marginBottom: "0.5rem" }}>Set Your Schedule</h2>
 <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9375rem" }}>How often will you commit to checking in? You can change this later.</p>

 <div className="flex flex-col gap-3 mb-4">
 {SCHEDULES.map((s) => (
 <button
 key={s.id}
 onClick={() => setScheduleId(s.id)}
 className="forge-card"
 style={{
 padding: "1rem 1.25rem", textAlign: "left", width: "100%", cursor: "pointer",
 border: scheduleId === s.id ? "1px solid var(--accent)" : "1px solid var(--border)",
 background: scheduleId === s.id ? "rgba(245,158,11,0.05)" : "var(--bg-card)",
 transition: "all 0.15s",
 }}
 >
 <div className="flex items-center gap-3">
 <s.Icon size={20} strokeWidth={1.5} style={{ color: scheduleId === s.id ? "var(--accent)" : "var(--text-dim)", flexShrink: 0 }} />
 <div>
 <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.0625rem", letterSpacing: "0.05em" }}>{s.title}</div>
 <div style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "0.125rem" }}>{s.desc}</div>
 </div>
 </div>
 </button>
 ))}
 </div>

 {scheduleId === "custom" && (
 <div style={{ marginBottom: "1.5rem" }}>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>Select at least 1 day:</p>
 <div className="flex gap-2 flex-wrap">
 {DAY_NAMES.map((name, i) => (
 <button
 key={i}
 type="button"
 onClick={() => toggleDay(i)}
 style={{
 padding: "0.5rem 0.875rem", borderRadius: "6px", cursor: "pointer",
 fontFamily: "var(--font-mono)", fontSize: "0.8125rem", fontWeight: 600,
 border: customDays.includes(i) ? "1px solid var(--accent)" : "1px solid var(--border)",
 background: customDays.includes(i) ? "rgba(245,158,11,0.1)" : "transparent",
 color: customDays.includes(i) ? "var(--accent)" : "var(--text-secondary)",
 transition: "all 0.15s",
 }}
 >
 {name}
 </button>
 ))}
 </div>
 </div>
 )}

 <div className="flex gap-3">
 <button onClick={prevStep} className="forge-btn forge-btn-ghost" style={{ flex: 1 }}>Back</button>
 <button
 onClick={nextStep}
 className="forge-btn forge-btn-primary"
 style={{ flex: 2 }}
 disabled={!canContinueSchedule}
 >
 Continue
 </button>
 </div>
 </motion.div>
 )}

 {/* ─── Step: Deadline ────────────────────────────────────── */}
 {step === "deadline" && needsRoadmap && (
 <motion.div key="deadline" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
 <div style={{ color: "var(--accent)", display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
 <Target size={48} strokeWidth={1.5} />
 </div>
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", marginBottom: "0.5rem", textAlign: "center" }}>Set Your Deadline</h2>
 <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9375rem", textAlign: "center", maxWidth: "440px", margin: "0 auto 2rem" }}>
 When do you want to finish? A deadline keeps you honest. The Forge will calculate your pace and warn you if you fall behind.
 </p>

 <div className="forge-panel" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
 <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-dim)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem", display: "block" }}>
 Target Completion Date
 </label>
 <input
 type="date"
 value={targetDate}
 onChange={(e) => setTargetDate(e.target.value)}
 min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
 className="forge-input"
 style={{ fontSize: "1.125rem", padding: "0.875rem 1rem", textAlign: "center", fontFamily: "var(--font-mono)" }}
 />
 {targetDate && (
 <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
 {(() => {
 const days = Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
 const weeks = Math.round(days / 7);
 return (
 <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", color: days < 14 ? "var(--red)" : days < 30 ? "var(--yellow)" : "var(--green)" }}>
 {days} days ({weeks} weeks) from now
 </span>
 );
 })()}
 </div>
 )}
 </div>

 <button
 type="button"
 onClick={() => { setTargetDate(""); nextStep(); }}
 style={{ width: "100%", textAlign: "center", color: "var(--text-dim)", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", background: "none", border: "none", cursor: "pointer", marginBottom: "1.5rem", padding: "0.5rem" }}
 >
 Skip, I&apos;ll set a deadline later
 </button>

 <div className="flex gap-3">
 <button onClick={prevStep} className="forge-btn forge-btn-ghost" style={{ flex: 1 }}>Back</button>
 <button
 onClick={nextStep}
 className="forge-btn forge-btn-primary"
 style={{ flex: 2 }}
 >
 {targetDate ? "Lock It In" : "Continue"}
 </button>
 </div>
 </motion.div>
 )}

 {/* ─── Step: Consequences ───────────────────────────────── */}
 {step === "consequences" && (
 <motion.div key="consequences" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", marginBottom: "0.5rem", color: "var(--red)" }}>
 {needsRoadmap ? "Read This Carefully" : "How It Works"}
 </h2>
 <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9375rem" }}>
 {needsRoadmap
 ? "These are the consequences of failing. They are real and cannot be disabled."
 : role === "mentor"
 ? "Your students will face these consequences. As their mentor, you should understand them."
 : "Your students will face these consequences. As the admin, you enforce this system."
 }
 </p>

 <div className="flex flex-col gap-3 mb-6">
 {([
 { Icon: Clock, title: "Real Projects, Real Proof", desc: needsRoadmap ? "Every committed day you submit a live GitHub repo or deployed URL. The system verifies it exists, is not empty, and was recently updated. No fake links." : "Students submit a verified GitHub repo or live URL every committed day. The system checks it's real, no fake links pass.", color: "var(--red)" },
 { Icon: ClipboardCheck, title: "Day-by-Day Learning", desc: "Every week breaks into 7 day-cards. Each day has hand-picked videos, exercises, and reflections. Days unlock one at a time, no overwhelm, no jumping ahead.", color: "var(--green)" },
 { Icon: UserCheck, title: "Mentor Review (Optional)", desc: "If you're paired with a mentor, they review your check-ins and unlock weeks when you're ready. Otherwise it's on the honor system, your repo is the proof.", color: "var(--blue)" },
 { Icon: TrendingDown, title: "Verified Certificate", desc: "Complete your roadmap and earn a cryptographically verified certificate with your pass rate, hours logged, and task count. Shareable with employers. Cannot be faked.", color: "var(--green)" },
 ] as const).map((item) => (
 <div key={item.title} className="forge-card" style={{ padding: "0.875rem 1.125rem", display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
 <item.Icon size={18} strokeWidth={2} style={{ color: item.color, flexShrink: 0, marginTop: "0.15rem" }} />
 <div>
 <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{item.title}</div>
 <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{item.desc}</div>
 </div>
 </div>
 ))}
 </div>

 <div className="flex gap-3">
 <button onClick={prevStep} className="forge-btn forge-btn-ghost" style={{ flex: 1 }}>Back</button>
 <button onClick={nextStep} className="forge-btn forge-btn-primary" style={{ flex: 2 }}>I Understand</button>
 </div>
 </motion.div>
 )}

 {/* ─── Step: Contract ───────────────────────────────────── */}
 {step === "contract" && (
 <motion.div key="contract" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="text-center">
 <div style={{ marginBottom: "1rem", color: "var(--accent)", display: "flex", justifyContent: "center" }}><Swords size={56} strokeWidth={1.5} /></div>
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "2.5rem", marginBottom: "1rem" }}>The Contract</h2>
 <div className="forge-panel" style={{ padding: "1.5rem", textAlign: "left", marginBottom: "2rem" }}>
 <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.8 }}>
 {role === "mentor" && !isAlsoLearning
 ? "I commit to guiding my mentees with integrity. I will review their work honestly, hold them to the standard, and never let them slide. I am here to forge, not to coddle."
 : role === "mentor" && isAlsoLearning
 ? <>I commit to guiding my mentees with integrity while also holding myself accountable. I will show up {scheduleText}, complete my check-ins honestly, and face the consequences when I fail. I mentor and I learn, no exceptions.</>
 : <>I commit to showing up {scheduleText}. I will complete my check-ins honestly. I will face the consequences when I fail. I will not cheat, skip, or make excuses. I am here to be forged, not coddled.{role === "student" && " I will show up, do the work, and prove it to my mentor."}</>
 }
 </p>
 </div>

 {error && (
 <div style={{ background: "rgba(255,45,45,0.1)", border: "1px solid var(--red)", borderRadius: "4px", padding: "0.75rem 1rem", marginBottom: "1.5rem", color: "var(--red)", fontSize: "0.875rem" }}>
 {error}
 </div>
 )}

 <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "center", cursor: "pointer", marginBottom: "2rem" }}>
 <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ width: "18px", height: "18px", accentColor: "var(--accent)", cursor: "pointer" }} />
 <span style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)", fontWeight: 600 }}>I commit to this</span>
 </label>

 <div className="flex gap-3">
 <button onClick={prevStep} className="forge-btn forge-btn-ghost" style={{ flex: 1 }}>Back</button>
 <button onClick={handleComplete} className="forge-btn forge-btn-primary" style={{ flex: 2 }} disabled={!agreed || loading}>
 {loading
 ? (loadingMessage ? "Generating Roadmap..." : "Forging...")
 : role === "mentor"
 ? "START MENTORING"
 : "FORGE MY PATH"
 }
 </button>
 </div>

 {loading && loadingMessage && (
 <div style={{
 marginTop: "1.5rem",
 padding: "1.25rem",
 background: "rgba(245,158,11,0.06)",
 border: "1px solid rgba(245,158,11,0.15)",
 borderRadius: "10px",
 textAlign: "center",
 }}>
 <div style={{
 width: "32px", height: "32px", margin: "0 auto 0.75rem",
 border: "3px solid var(--border)", borderTopColor: "var(--accent)",
 borderRadius: "50%", animation: "spin 0.8s linear infinite",
 }} />
 <p style={{ color: "var(--accent)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>
 {loadingMessage}
 </p>
 <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem" }}>
 This takes 15-30 seconds. The AI is building something great.
 </p>
 </div>
 )}
 <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 );
}

// ── Roadmap Browser sub-component ──────────────────────────────────────────

interface RoadmapBrowserProps {
 selectedCurated: CuratedRoadmapPickerEntry | null;
 setSelectedCurated: (c: CuratedRoadmapPickerEntry | null) => void;
 selectedPath: RoadmapShPath | null;
 setSelectedPath: (p: RoadmapShPath | null) => void;
 pathSearch: string;
 setPathSearch: (s: string) => void;
 activeCategory: string;
 setActiveCategory: (c: string) => void;
 roadmapTitle: string;
 setRoadmapTitle: (t: string) => void;
 journeyType: "learn" | "project";
 setJourneyType: (t: "learn" | "project") => void;
 onBack: () => void;
 onNext: () => void;
}

function RoadmapBrowser({
 selectedCurated, setSelectedCurated,
 selectedPath, setSelectedPath,
 pathSearch, setPathSearch,
 activeCategory, setActiveCategory,
 roadmapTitle, setRoadmapTitle,
 journeyType, setJourneyType,
 onBack, onNext,
}: RoadmapBrowserProps) {
 const filtered = useMemo(() => {
 const q = pathSearch.toLowerCase();
 return ROADMAPSH_PATHS.filter((p) => {
 const matchCat = activeCategory === "all" || p.category === activeCategory;
 const matchQ = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
 return matchCat && matchQ;
 });
 }, [pathSearch, activeCategory]);

 const canContinue = !!selectedCurated;

 return (
 <motion.div key="roadmap" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
 <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "2rem", marginBottom: "0.25rem" }}>
 Choose Your Path
 </h2>
 <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9375rem" }}>
 Start with a mastery roadmap, or pick a roadmap.sh path, or describe your own.
 </p>

 {/* ─── Curated mastery roadmaps (the only roadmap-list option) ─── */}
 <div style={{ marginBottom: "1.25rem" }}>
 {selectedCurated ? (
 <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "1rem 1.125rem", background: "rgba(245,158,11,0.08)", border: "1px solid var(--accent)", borderRadius: "10px" }}>
 <div
 style={{
 width: 44, height: 44, borderRadius: 10,
 background: `${selectedCurated.accent}1a`,
 color: selectedCurated.accent,
 display: "grid", placeItems: "center", flexShrink: 0,
 }}
 >
 <selectedCurated.Icon size={22} strokeWidth={1.75} />
 </div>
 <div style={{ flex: 1 }}>
 <div style={{ fontFamily: "var(--font-headline)", fontSize: "1.0625rem" }}>{selectedCurated.title}</div>
 <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "0.125rem", lineHeight: 1.4 }}>{selectedCurated.tagline}</div>
 <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6875rem", color: "var(--text-dim)", marginTop: "0.375rem" }}>
 {selectedCurated.weeks} weeks · {selectedCurated.phases} phases
 </div>
 </div>
 <button onClick={() => setSelectedCurated(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", fontSize: "1.5rem", padding: "0.25rem", lineHeight: 1 }}>×</button>
 </div>
 ) : (
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
 {CURATED_ROADMAPS.filter((c) => !c.hidden).map((c) => (
 <button
 key={c.slug}
 type="button"
 onClick={() => setSelectedCurated(c)}
 style={{
 padding: "1rem", borderRadius: "10px", textAlign: "left", cursor: "pointer",
 border: "1px solid var(--border)",
 background: "var(--bg-card)",
 transition: "all 0.12s",
 display: "flex", alignItems: "flex-start", gap: "0.75rem",
 }}
 onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.accent; }}
 onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
 >
 <div
 style={{
 width: 36, height: 36, borderRadius: 8,
 background: `${c.accent}1a`,
 color: c.accent,
 display: "grid", placeItems: "center", flexShrink: 0,
 }}
 >
 <c.Icon size={18} strokeWidth={1.75} />
 </div>
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.125rem" }}>{c.title}</div>
 <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.45, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{c.tagline}</div>
 <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "var(--text-dim)", marginTop: "0.375rem" }}>{c.weeks} weeks · {c.phases} phases</div>
 </div>
 </button>
 ))}
 </div>
 )}
 </div>

 {!selectedCurated && (
 <p style={{ color: "var(--text-dim)", fontSize: "0.8125rem", textAlign: "center", marginBottom: "1.25rem", fontFamily: "var(--font-mono)" }}>
 Pick one to continue. You can switch later from the dashboard.
 </p>
 )}

 <div className="flex gap-3">
 <button onClick={onBack} className="forge-btn forge-btn-ghost" style={{ flex: 1 }}>Back</button>
 <button onClick={onNext} className="forge-btn forge-btn-primary" style={{ flex: 2 }} disabled={!canContinue}>
 Continue
 </button>
 </div>
 </motion.div>
 );
}
