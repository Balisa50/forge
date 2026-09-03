/**
 * Audit each week's context vs its topics/tasks/project keywords.
 * Flags weeks where my rewritten context does NOT mention enough
 * of the actual topic keywords — those are mismatches to fix.
 *
 * Run: npx tsx scripts/audit-week-alignment.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";

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

// extract the meaningful nouns/phrases from topics + tasks + project
function keyTerms(week: any): string[] {
  const blob = [
    ...(week.topics ?? []),
    ...(week.tasks ?? []),
    week.project ?? "",
    week.title ?? "",
  ].join(" ").toLowerCase();

  // tokenize: keep words 3+ chars, drop common stop-words
  const stop = new Set([
    "the","and","with","for","from","this","that","into","your","you","into",
    "build","using","make","add","get","set","week","data","each","one","two",
    "three","every","first","work","plus","via","not","but","off","new","old",
    "use","run","see","why","how","what","when","where","does","then","also",
    "are","its","has","have","can","will","just","real","good","more","most",
    "all","any","out","via","over","under","across","day","days","write",
    "code","line","lines","row","rows","item","items",
  ]);
  const tokens = blob.match(/[a-z][a-z\-+0-9]{2,}/g) ?? [];
  return [...new Set(tokens.filter((t) => !stop.has(t)))];
}

function overlapScore(context: string, terms: string[]): { score: number; missing: string[]; hits: string[] } {
  const c = (context ?? "").toLowerCase();
  const hits = terms.filter((t) => c.includes(t));
  const missing = terms.filter((t) => !c.includes(t));
  return { score: terms.length ? hits.length / terms.length : 1, hits, missing };
}

// pull out the rare/specific tool/concept names — these are the smoking guns
function importantTerms(terms: string[]): string[] {
  // anything with a capital pattern, version, or known tool keywords
  const toolish = /^(numpy|pandas|sklearn|pytorch|tensorflow|sql|nginx|docker|kubernetes|terraform|prometheus|grafana|aws|gcp|azure|stripe|sentry|playwright|cypress|jwt|oauth|bayes|regression|gradient|matrix|vector|tensor|linear|logistic|kafka|redis|postgres|prisma|nextjs|react|tailwind|expo|swift|kotlin|webpack|vite|astro|jest|vitest|burp|nmap|metasploit|sqlmap|wireshark|splunk|elk|powerbi|tableau|looker|dax|excel|jupyter|anaconda|notebook|langchain|openai|anthropic|claude|n8n|zapier|selenium|scrapy|fastapi|flask|django|express|node|python|typescript|javascript|sigstore|cosign|vault|prowler|trivy|optuna|xgboost|catboost|lightgbm|hugging|llama|gemini|mistral|grpc|graphql|webhook|cdn|s3|ec2|lambda|fargate|eks|gke|aks)$/i;
  return terms.filter((t) => toolish.test(t));
}

let bad = 0;
const allFlags: string[] = [];

for (const slug of TRACKS) {
  const file = resolve(process.cwd(), `data/roadmaps/${slug}.json`);
  const roadmap = JSON.parse(readFileSync(file, "utf-8"));
  console.log(`\n=== ${slug} (${roadmap.weeks.length} weeks) ===`);

  for (const w of roadmap.weeks) {
    const terms = keyTerms(w);
    const important = importantTerms(terms);
    if (important.length === 0) continue;

    const { hits, missing } = overlapScore(w.context, important);
    const missImportant = important.filter((t) => !w.context.toLowerCase().includes(t));
    const ratio = important.length ? (important.length - missImportant.length) / important.length : 1;

    // flag if context mentions <40% of the important tool/concept names
    if (ratio < 0.4) {
      bad++;
      const msg = `  ⚠ W${String(w.number).padStart(2,"0")} ${w.title}\n     context mentions ${important.length - missImportant.length}/${important.length} key tools\n     MISSING from context: ${missImportant.slice(0,12).join(", ")}\n     PRESENT: ${(important.filter(t=>w.context.toLowerCase().includes(t))).slice(0,8).join(", ") || "(none)"}`;
      console.log(msg);
      allFlags.push(`${slug} W${w.number}: ${w.title}`);
    }
  }
}

console.log(`\n\n========================================`);
console.log(`TOTAL FLAGGED: ${bad} week(s) out of 250`);
console.log(`========================================`);
if (allFlags.length) {
  console.log(`\nList:`);
  allFlags.forEach((f) => console.log(`  - ${f}`));
}
