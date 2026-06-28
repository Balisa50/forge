/**
 * One-shot registration of the "remote-ops" track across the app's slug maps.
 * CRLF-aware exact-string replacement with a uniqueness guard per edit.
 * Run once: node scripts/register-remote-ops.js   (safe to re-run; idempotent)
 */
const fs = require("fs");

let failures = 0;
function edit(file, find, replace, alreadyMarker) {
  let s = fs.readFileSync(file, "utf8");
  if (alreadyMarker && s.includes(alreadyMarker)) {
    console.log(`SKIP (already done)  ${file}`);
    return;
  }
  const n = s.split(find).length - 1;
  if (n !== 1) {
    console.error(`FAIL  ${file}  (${n} matches, expected 1)`);
    failures++;
    return;
  }
  fs.writeFileSync(file, s.replace(find, replace));
  console.log(`OK    ${file}`);
}

const CR = "\r\n";

// 1) src/lib/roadmaps.ts  -> META entry
edit(
  "src/lib/roadmaps.ts",
  `"bi-analytics": {${CR} tagline: "From clean data models to BI dashboards that drive million-dollar decisions",${CR} outcome: "Own the analytics layer for a whole business unit, Power BI, modelling, automation",${CR} gradient: "from-amber-500 via-orange-500 to-rose-600",${CR} },${CR}};`,
  `"bi-analytics": {${CR} tagline: "From clean data models to BI dashboards that drive million-dollar decisions",${CR} outcome: "Own the analytics layer for a whole business unit, Power BI, modelling, automation",${CR} gradient: "from-amber-500 via-orange-500 to-rose-600",${CR} },${CR} "remote-ops": {${CR} tagline: "Become the remote operator startups, founders and agencies hire, virtual assistant skills and beyond",${CR} outcome: "Graduate with 10 real projects, a service package, and the skills to land paid remote work before you finish",${CR} gradient: "from-indigo-500 via-violet-500 to-purple-600",${CR} },${CR}};`,
  `"remote-ops": {`
);

// 2) src/lib/roadmaps.ts  -> PREVIEW_SLUGS
edit(
  "src/lib/roadmaps.ts",
  `"bi-analytics", "ai-automation", "data-engineering",`,
  `"bi-analytics", "ai-automation", "remote-ops", "data-engineering",`,
  `"remote-ops", "data-engineering",`
);

// 3) src/lib/curated-roadmaps.ts  -> ICON map
edit(
  "src/lib/curated-roadmaps.ts",
  `"ai-automation": "Zap",${CR}};`,
  `"ai-automation": "Zap",${CR} "remote-ops": "Headset",${CR}};`,
  `"remote-ops": "Headset",`
);

// 4) src/lib/curated-roadmaps.ts  -> sort priority
edit(
  "src/lib/curated-roadmaps.ts",
  `"devops-cloud": 5, "cybersecurity": 6 }[s] ?? 99);`,
  `"devops-cloud": 5, "cybersecurity": 6, "remote-ops": 7 }[s] ?? 99);`,
  `"remote-ops": 7 }`
);

// 5) src/lib/curated-roadmaps-client.ts  -> icon import
edit(
  "src/lib/curated-roadmaps-client.ts",
  `import { Bot, BrainCircuit, Globe, Smartphone, Cloud, Shield, FlaskConical, TrendingUp, PieChart, Workflow, type LucideIcon } from "lucide-react";`,
  `import { Bot, BrainCircuit, Globe, Smartphone, Cloud, Shield, FlaskConical, TrendingUp, PieChart, Workflow, Headset, type LucideIcon } from "lucide-react";`,
  `Workflow, Headset, type LucideIcon`
);

// 6) src/lib/curated-roadmaps-client.ts  -> picker entry (appended after ai-automation)
edit(
  "src/lib/curated-roadmaps-client.ts",
  `gradient: "from-lime-400 via-green-500 to-emerald-600",${CR} },${CR}];`,
  `gradient: "from-lime-400 via-green-500 to-emerald-600",${CR} },${CR} {${CR} slug: "remote-ops",${CR} title: "Remote Operations Professional",${CR} tagline: "The remote operator startups, founders and agencies hire (virtual assistant, and beyond)",${CR} outcome: "Graduate with 10 real projects, a service package, and the skills to land paid remote work before you finish",${CR} weeks: 13,${CR} phases: 12,${CR} Icon: Headset,${CR} accent: "#a78bfa",${CR} gradient: "from-indigo-500 via-violet-500 to-purple-600",${CR} },${CR}];`,
  `slug: "remote-ops",`
);

// 7) src/app/api/roadmaps/from-curated/route.ts  -> track color
edit(
  "src/app/api/roadmaps/from-curated/route.ts",
  `"bi-analytics": "#f97316",${CR}};`,
  `"bi-analytics": "#f97316",${CR} "remote-ops": "#7c3aed",${CR}};`,
  `"remote-ops": "#7c3aed",`
);

// 8) src/app/api/mentor/seed-roadmap/route.ts  -> track color
edit(
  "src/app/api/mentor/seed-roadmap/route.ts",
  `"bi-analytics": "#f97316",${CR}};`,
  `"bi-analytics": "#f97316",${CR} "remote-ops": "#7c3aed",${CR}};`,
  `"remote-ops": "#7c3aed",`
);

// 9) src/app/api/mentor/invites/route.ts  -> VALID_SLUGS (mentoring on this track)
edit(
  "src/app/api/mentor/invites/route.ts",
  `"bi-analytics",${CR}]);`,
  `"bi-analytics",${CR} "remote-ops",${CR}]);`,
  `"remote-ops",${CR}]);`
);

// 10) src/lib/auth.ts  -> TRACK_COLORS (mentee invite redemption)
edit(
  "src/lib/auth.ts",
  `"bi-analytics": "#f97316",${CR} };`,
  `"bi-analytics": "#f97316", "remote-ops": "#7c3aed",${CR} };`,
  `"remote-ops": "#7c3aed",`
);

// 11) src/app/dashboard/page.tsx  -> CANONICAL_TITLE_TO_SLUG
edit(
  "src/app/dashboard/page.tsx",
  `"AI Automation": "ai-automation",${CR}};`,
  `"AI Automation": "ai-automation",${CR} "Remote Operations Professional": "remote-ops",${CR}};`,
  `"Remote Operations Professional": "remote-ops",`
);

// 12) scripts/audit-curriculum.js  -> SLUGS (so the track is audited)
edit(
  "scripts/audit-curriculum.js",
  `"bi-analytics", "ai-automation",${CR}];`,
  `"bi-analytics", "ai-automation", "remote-ops",${CR}];`,
  `"remote-ops",${CR}];`
);

console.log(failures ? `\n${failures} FAILED` : `\nAll registrations applied.`);
process.exit(failures ? 1 : 0);
