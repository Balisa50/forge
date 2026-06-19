import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { prisma } from "./prisma";
import { z } from "zod";

const loginSchema = z.object({
 email: z.string().email(),
 password: z.string().min(6),
});

const joinSchema = z.object({
 code: z.string().min(4),
 name: z.string().min(1).max(80),
 email: z.string().email().optional().or(z.literal("")),
});

const recoverySchema = z.object({
 token: z.string().min(32),
});

function normaliseCode(c: string): string {
 return c.trim().toUpperCase().replace(/\s+/g, "");
}

function randomToken(): string {
 return randomBytes(24).toString("base64url");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
 adapter: PrismaAdapter(prisma),
 session: { strategy: "jwt" },
 pages: {
 signIn: "/login",
 error: "/login",
 },
 providers: [
 Google({
 clientId: process.env.GOOGLE_CLIENT_ID ?? "",
 clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
 }),
 Credentials({
 async authorize(credentials) {
 const parsed = loginSchema.safeParse(credentials);
 if (!parsed.success) return null;

 const user = await prisma.user.findUnique({
 where: { email: parsed.data.email },
 });

 if (!user || !user.passwordHash) return null;

 const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
 if (!valid) return null;

 return {
 id: user.id,
 email: user.email,
 name: user.name,
 image: user.image,
 };
 },
 }),
 // ── Mentee passwordless signup via mentor invite code ─────────────
 Credentials({
 id: "join",
 name: "Mentor invite",
 credentials: {
 code: { type: "text" },
 name: { type: "text" },
 email: { type: "text" },
 },
 async authorize(credentials) {
 const parsed = joinSchema.safeParse(credentials);
 if (!parsed.success) return null;

 const code = normaliseCode(parsed.data.code);
 const invite = await prisma.mentorInvite.findUnique({ where: { code } });
 if (!invite || !invite.isActive) return null;
 if (invite.consumedByUserId) return null; // single-use already redeemed
 if (invite.expiresAt && invite.expiresAt < new Date()) return null;
 if (invite.maxUses != null && invite.usesCount >= invite.maxUses) return null;

 // STRICT NAME MATCH against mentor's pre-registered name
 if (invite.expectedName) {
 const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
 if (norm(parsed.data.name) !== norm(invite.expectedName)) return null;
 }

 const providedEmail = parsed.data.email?.trim();
 const email = providedEmail || `mentee_${randomBytes(8).toString("hex")}@forge.local`;
 const collision = providedEmail ? await prisma.user.findUnique({ where: { email } }) : null;
 const finalEmail = collision ? `mentee_${randomBytes(8).toString("hex")}@forge.local` : email;

 // Path-scoped invite? Mark onboarding DONE, the mentor already
 // chose the path. The mentee shouldn't see role-picker or roadmap-
 // picker. They land straight on the dashboard waiting for Week 1.
 const skipOnboarding = !!invite.roadmapSlug;

 const user = await prisma.user.create({
 data: {
 email: finalEmail,
 name: invite.expectedName?.trim() || parsed.data.name.trim(),
 passwordHash: await bcrypt.hash(randomBytes(32).toString("hex"), 10),
 isCodeOnly: true,
 recoveryToken: randomToken(),
 personalId: invite.personalIdIssued ?? null,
 onboardingDone: skipOnboarding,
 role: "student",
 },
 });

 await prisma.$transaction([
 prisma.mentorLink.create({
 data: { mentorId: invite.mentorId, menteeId: user.id, isActive: true },
 }),
 prisma.mentorInvite.update({
 where: { id: invite.id },
 data: {
 usesCount: invite.usesCount + 1,
 consumedByUserId: user.id,
 isActive: false,
 },
 }),
 ]);

 // Auto-seed the curated roadmap for path-scoped invites. All weeks
 // start LOCKED so the mentor controls every release. No role-picker,
 // no roadmap-picker, no schedule step, the mentor pre-chose those.
 if (invite.roadmapSlug) {
 try {
 const { loadRoadmap, getPhaseGroups } = await import("@/lib/roadmaps");
 const curriculum = loadRoadmap(invite.roadmapSlug);
 if (curriculum) {
 const groups = getPhaseGroups(curriculum.weeks);
 const TRACK_COLORS: Record<string, string> = {
 "ai-engineering": "#a855f7", "ml-engineering": "#6366f1",
 "full-stack-web": "#00c8ff", "mobile-engineering": "#ec4899",
 "devops-cloud": "#f59e0b", "cybersecurity": "#22c55e",
 "data-science": "#3b82f6", "data-analysis": "#14b8a6",
 "bi-analytics": "#f97316", "remote-ops": "#7c3aed",
 };
 const trackColor = TRACK_COLORS[invite.roadmapSlug] ?? "#00c8ff";
 const { weekToTaskDetail, weekToTaskMilestone, weekToTaskResources, weekToTaskWhy, parseCommitmentHours } = await import("@/lib/curated-roadmaps");
 await prisma.roadmap.create({
 data: {
 userId: user.id,
 title: curriculum.title,
 tracks: {
 create: [{
 title: curriculum.title,
 color: trackColor,
 sortOrder: 0,
 phases: {
 create: groups.map((g, pi) => ({
 title: g.phase || `Phase ${pi + 1}`,
 sortOrder: pi,
 tasks: {
 create: g.weeks.map((w, wi) => ({
 title: `Week ${w.number}: ${w.title}`,
 detail: weekToTaskDetail(w),
 why: weekToTaskWhy(w),
 milestone: weekToTaskMilestone(w),
 resources: weekToTaskResources(w),
 estimatedHours: parseCommitmentHours(w.commitment_hours),
 sortOrder: wi,
 status: "locked", // every week locked, mentor must release
 })),
 },
 })),
 },
 }],
 },
 },
 });
 }
 } catch (e) {
 console.error("[join] auto-seed roadmap failed:", e);
 // Don't block sign-in if seeding fails, mentor can fix from dashboard
 }
 }

 return { id: user.id, email: user.email, name: user.name, image: user.image };
 },
 }),
 // ── Mentee return via human-typeable personal ID ──────────────────
 Credentials({
 id: "mentee-return",
 name: "Personal ID",
 credentials: { personalId: { type: "text" } },
 async authorize(credentials) {
 const raw = (credentials?.personalId as string | undefined)?.trim().toUpperCase();
 if (!raw) return null;
 const user = await prisma.user.findUnique({ where: { personalId: raw } });
 if (!user) return null;
 return { id: user.id, email: user.email, name: user.name, image: user.image };
 },
 }),
 // ── Mentee passwordless return via recovery token ─────────────────
 Credentials({
 id: "recovery",
 name: "Recovery link",
 credentials: { token: { type: "text" } },
 async authorize(credentials) {
 const parsed = recoverySchema.safeParse(credentials);
 if (!parsed.success) return null;
 const user = await prisma.user.findUnique({
 where: { recoveryToken: parsed.data.token },
 });
 if (!user) return null;
 return { id: user.id, email: user.email, name: user.name, image: user.image };
 },
 }),
 ],
 callbacks: {
 async jwt({ token, user, trigger }) {
 if (user) {
 token.id = user.id;
 }
 // Fetch onboarding status on every sign-in or when session is updated
 if (user || trigger === "update") {
 const dbUser = await prisma.user.findUnique({
 where: { id: (token.id ?? user?.id) as string },
 select: { onboardingDone: true, role: true, isGuest: true },
 });
 if (dbUser) {
 token.onboardingDone = dbUser.onboardingDone;
 token.role = dbUser.role;
 token.isGuest = dbUser.isGuest;
 }
 }
 return token;
 },
 async session({ session, token }) {
 if (token.id && session.user) {
 session.user.id = token.id as string;
 session.user.role = token.role as string | undefined;
 session.user.onboardingDone = token.onboardingDone as boolean | undefined;
 session.user.isGuest = token.isGuest as boolean | undefined;
 }
 return session;
 },
 },
});
