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
        if (invite.expiresAt && invite.expiresAt < new Date()) return null;
        if (invite.maxUses != null && invite.usesCount >= invite.maxUses) return null;

        const providedEmail = parsed.data.email?.trim();
        // For email-less signups we mint a deterministic-but-uncrackable local email.
        const email = providedEmail || `mentee_${randomBytes(8).toString("hex")}@forge.local`;

        // If the email collides with an existing user, fall back to a random one.
        const collision = providedEmail ? await prisma.user.findUnique({ where: { email } }) : null;
        const finalEmail = collision ? `mentee_${randomBytes(8).toString("hex")}@forge.local` : email;

        const user = await prisma.user.create({
          data: {
            email: finalEmail,
            name: parsed.data.name.trim(),
            // bcrypt-hash a random 32-byte secret nobody (not even us) will ever see —
            // satisfies any future password requirement without giving anyone a way in.
            passwordHash: await bcrypt.hash(randomBytes(32).toString("hex"), 10),
            isCodeOnly: true,
            recoveryToken: randomToken(),
            // Mentees still need to pick a roadmap unless the invite is path-scoped:
            onboardingDone: false,
            role: "student",
          },
        });

        // Pair the mentee with the mentor; increment usage.
        await prisma.$transaction([
          prisma.mentorLink.create({
            data: { mentorId: invite.mentorId, menteeId: user.id, isActive: true },
          }),
          prisma.mentorInvite.update({
            where: { id: invite.id },
            data: {
              usesCount: invite.usesCount + 1,
              isActive: invite.maxUses != null && invite.usesCount + 1 >= invite.maxUses ? false : invite.isActive,
            },
          }),
        ]);

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
