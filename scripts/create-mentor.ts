/**
 * One-shot: create a mentor account.
 * Usage: npx tsx scripts/create-mentor.ts <email> <name> <password>
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

(async () => {
  const [, , email, name, password] = process.argv;
  if (!email || !name || !password) {
    console.error("Usage: npx tsx scripts/create-mentor.ts <email> <name> <password>");
    process.exit(1);
  }
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });
  const e = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: e } });
  if (existing) {
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash: hash, role: "mentor", name, onboardingDone: true },
    });
    await prisma.session.deleteMany({ where: { userId: existing.id } });
    console.log(`Updated existing user → mentor: ${e}`);
  } else {
    const hash = await bcrypt.hash(password, 10);
    const u = await prisma.user.create({
      data: {
        email: e,
        name,
        passwordHash: hash,
        role: "mentor",
        onboardingDone: true,
        isAlsoLearning: false,
      },
    });
    console.log(`Created mentor: ${u.email} (${u.id})`);
  }

  // Clean up guest noise
  const wiped = await prisma.user.deleteMany({
    where: { email: { endsWith: "@forge.guest" } },
  });
  console.log(`Cleaned up ${wiped.count} stale guest accounts.`);

  await prisma.$disconnect();
})();
