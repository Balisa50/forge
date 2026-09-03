import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

(async () => {
  const [, , email] = process.argv;
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });
  const r = await prisma.user.deleteMany({ where: { email: email.toLowerCase() } });
  console.log(`Deleted ${r.count} user(s) with email ${email}`);
  await prisma.$disconnect();
})();
