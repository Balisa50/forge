/**
 * One-shot password reset — runs locally against the prod DB.
 *
 * Usage:
 *   npx tsx scripts/admin-reset-password.ts <email> <newPassword>
 *
 * Example:
 *   npx tsx scripts/admin-reset-password.ts you@example.com "MyNewPass!"
 *
 * Prereq: .env.local must have DATABASE_URL pointing at the prod DB.
 * This script bypasses email — use only on accounts you own.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function main() {
  const [, , email, newPass] = process.argv;
  if (!email || !newPass) {
    console.error("Usage: npx tsx scripts/admin-reset-password.ts <email> <newPassword>");
    process.exit(1);
  }
  if (newPass.length < 8) {
    console.error("Password must be at least 8 chars.");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const normalised = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalised } });
  if (!user) {
    console.error(`No user with email '${normalised}'.`);
    process.exit(1);
  }
  console.log(`Found user: ${user.name} (${user.id})`);

  const hash = await bcrypt.hash(newPass, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hash },
  });

  // Also wipe all their existing sessions so they must re-login
  const wiped = await prisma.session.deleteMany({ where: { userId: user.id } });
  console.log(`✓ Password updated. Wiped ${wiped.count} active session(s).`);
  console.log(`  Email: ${normalised}`);
  console.log(`  New password works at /login now.`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
