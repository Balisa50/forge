import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

(async () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  console.log(`\n${users.length} users total:\n`);
  for (const u of users) {
    console.log(`  ${u.role.padEnd(10)} ${u.email.padEnd(40)} ${u.name ?? ""}`);
  }
  await prisma.$disconnect();
})();
