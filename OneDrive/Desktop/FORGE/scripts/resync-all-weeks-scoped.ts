/**
 * Roadmap-SCOPED resync of every week's task.detail.
 *
 * The old resync script (resync-week-detail.ts) used
 *   where: { title: { startsWith: "Week N:" } }
 * which updates EVERY mentee's Week N task across EVERY roadmap.
 * That's how DA's Excel content overwrote DS's TaxiPulse content.
 *
 * This version walks: Roadmap (matched by title) -> Track -> Phase -> Task
 * and only updates tasks belonging to the correct roadmap.
 *
 * DRY RUN: npx tsx scripts/resync-all-weeks-scoped.ts
 * APPLY:   npx tsx scripts/resync-all-weeks-scoped.ts --apply
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { loadRoadmap } from "../src/lib/roadmaps";
import { weekToTaskDetail } from "../src/lib/curated-roadmaps";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const APPLY = process.argv.includes("--apply");

const TRACKS = [
  "data-science",
  "data-analysis",
  "ai-engineering",
  "ml-engineering",
  "full-stack-web",
  "mobile-engineering",
  "devops-cloud",
  "cybersecurity",
  "bi-analytics",
  "ai-automation",
];

async function main() {
  console.log(APPLY ? "🟢 APPLY MODE — will write to DB" : "🟡 DRY RUN — no writes (pass --apply to commit)");

  let totalTasks = 0;
  let totalRoadmaps = 0;

  for (const slug of TRACKS) {
    const roadmap = loadRoadmap(slug);
    if (!roadmap) {
      console.log(`\n✗ ${slug}: roadmap JSON not found`);
      continue;
    }

    // Find ALL Roadmap rows in DB whose title matches this JSON roadmap's title.
    // (Multiple mentees can each own a Roadmap row with the same curated title.)
    const dbRoadmaps = await prisma.roadmap.findMany({
      where: { title: roadmap.title },
      select: {
        id: true,
        userId: true,
        tracks: {
          select: {
            phases: {
              select: {
                tasks: { select: { id: true, title: true } },
              },
            },
          },
        },
      },
    });

    if (dbRoadmaps.length === 0) {
      console.log(`\n— ${slug} ("${roadmap.title}"): no mentee roadmaps in DB`);
      continue;
    }

    console.log(`\n=== ${slug} ("${roadmap.title}") → ${dbRoadmaps.length} mentee roadmap(s) ===`);
    totalRoadmaps += dbRoadmaps.length;

    // Pre-build the new detail for each week number
    const detailByWeek = new Map<number, string>();
    for (const w of roadmap.weeks) {
      detailByWeek.set(w.number, weekToTaskDetail(w));
    }

    // Walk every task in every matching mentee roadmap
    const taskIdsByWeek = new Map<number, string[]>();
    for (const r of dbRoadmaps) {
      for (const tr of r.tracks) {
        for (const ph of tr.phases) {
          for (const t of ph.tasks) {
            const m = t.title.match(/^Week\s+(\d+)\s*[:.]/i);
            if (!m) continue;
            const wn = parseInt(m[1], 10);
            if (!detailByWeek.has(wn)) continue;
            if (!taskIdsByWeek.has(wn)) taskIdsByWeek.set(wn, []);
            taskIdsByWeek.get(wn)!.push(t.id);
          }
        }
      }
    }

    let updatedThisTrack = 0;
    for (const [wn, ids] of [...taskIdsByWeek.entries()].sort((a, b) => a[0] - b[0])) {
      if (APPLY) {
        const res = await prisma.task.updateMany({
          where: { id: { in: ids } },
          data: { detail: detailByWeek.get(wn)! },
        });
        console.log(`   ✓ Week ${wn}: updated ${res.count} task(s)`);
        updatedThisTrack += res.count;
      } else {
        console.log(`   · Week ${wn}: would update ${ids.length} task(s)`);
        updatedThisTrack += ids.length;
      }
    }
    totalTasks += updatedThisTrack;
  }

  console.log(`\n========================================`);
  console.log(`${APPLY ? "UPDATED" : "WOULD UPDATE"} ${totalTasks} task(s) across ${totalRoadmaps} mentee roadmap(s)`);
  console.log(`========================================`);
  if (!APPLY) console.log(`\nRe-run with --apply to commit.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
