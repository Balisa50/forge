/**
 * One-shot registration of the "growth-marketing" track across the app's slug
 * maps. CRLF-aware exact-string replacement with a uniqueness guard per edit.
 * Run once: node scripts/register-growth-marketing.js   (idempotent; safe to re-run)
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

// 1) src/lib/roadmaps.ts -> META entry (append after remote-ops block)
edit(
  "src/lib/roadmaps.ts",
  ` gradient: "from-indigo-500 via-violet-500 to-purple-600",${CR} },${CR}};`,
  ` gradient: "from-indigo-500 via-violet-500 to-purple-600",${CR} },${CR} "growth-marketing": {${CR} tagline: "Grow a real business from zero to 10K followers and leads, the digital marketing skills startups and agencies hire",${CR} outcome: "Graduate with a full marketing portfolio (brand, SEO, paid ads, email, analytics, AI workflows) and 12 case studies",${CR} gradient: "from-pink-500 via-rose-500 to-orange-500",${CR} },${CR}};`,
  `"growth-marketing": {`
);

// 2) src/lib/roadmaps.ts -> PREVIEW_SLUGS
edit(
  "src/lib/roadmaps.ts",
  `"bi-analytics", "ai-automation", "remote-ops", "data-engineering",`,
  `"bi-analytics", "ai-automation", "remote-ops", "growth-marketing", "data-engineering",`,
  `"remote-ops", "growth-marketing", "data-engineering",`
);

// 3) src/lib/curated-roadmaps.ts -> ICON map
edit(
  "src/lib/curated-roadmaps.ts",
  ` "remote-ops": "Headset",${CR}};`,
  ` "remote-ops": "Headset",${CR} "growth-marketing": "Megaphone",${CR}};`,
  `"growth-marketing": "Megaphone",`
);

// 4) src/lib/curated-roadmaps.ts -> sort priority
edit(
  "src/lib/curated-roadmaps.ts",
  `"cybersecurity": 6, "remote-ops": 7 }[s] ?? 99);`,
  `"cybersecurity": 6, "remote-ops": 7, "growth-marketing": 8 }[s] ?? 99);`,
  `"growth-marketing": 8 }`
);

// 5) src/lib/curated-roadmaps-client.ts -> icon import
edit(
  "src/lib/curated-roadmaps-client.ts",
  `Workflow, Headset, type LucideIcon } from "lucide-react";`,
  `Workflow, Headset, Megaphone, type LucideIcon } from "lucide-react";`,
  `Headset, Megaphone, type LucideIcon`
);

// 6) src/lib/curated-roadmaps-client.ts -> picker entry (append after remote-ops)
edit(
  "src/lib/curated-roadmaps-client.ts",
  ` gradient: "from-indigo-500 via-violet-500 to-purple-600",${CR} },${CR}];`,
  ` gradient: "from-indigo-500 via-violet-500 to-purple-600",${CR} },${CR} {${CR} slug: "growth-marketing",${CR} title: "Growth Marketing Professional",${CR} tagline: "Grow a real business from zero to 10K followers and leads (the skills startups and agencies hire)",${CR} outcome: "Graduate with a full marketing portfolio (brand, SEO, paid ads, email, analytics, AI workflows) and 12 case studies",${CR} weeks: 12,${CR} phases: 6,${CR} Icon: Megaphone,${CR} accent: "#ec4899",${CR} gradient: "from-pink-500 via-rose-500 to-orange-500",${CR} },${CR}];`,
  `slug: "growth-marketing",`
);

// 7) src/app/api/roadmaps/from-curated/route.ts -> track color
edit(
  "src/app/api/roadmaps/from-curated/route.ts",
  ` "remote-ops": "#7c3aed",${CR}};`,
  ` "remote-ops": "#7c3aed",${CR} "growth-marketing": "#ec4899",${CR}};`,
  `"growth-marketing": "#ec4899",`
);

// 8) src/app/api/mentor/seed-roadmap/route.ts -> track color
edit(
  "src/app/api/mentor/seed-roadmap/route.ts",
  ` "remote-ops": "#7c3aed",${CR}};`,
  ` "remote-ops": "#7c3aed",${CR} "growth-marketing": "#ec4899",${CR}};`,
  `"growth-marketing": "#ec4899",`
);

// 9) src/app/api/mentor/invites/route.ts -> VALID_SLUGS
edit(
  "src/app/api/mentor/invites/route.ts",
  ` "remote-ops",${CR}]);`,
  ` "remote-ops",${CR} "growth-marketing",${CR}]);`,
  `"growth-marketing",${CR}]);`
);

// 10) src/lib/auth.ts -> TRACK_COLORS
edit(
  "src/lib/auth.ts",
  ` "bi-analytics": "#f97316", "remote-ops": "#7c3aed",${CR} };`,
  ` "bi-analytics": "#f97316", "remote-ops": "#7c3aed", "growth-marketing": "#ec4899",${CR} };`,
  `"growth-marketing": "#ec4899",`
);

// 11) src/app/dashboard/page.tsx -> CANONICAL_TITLE_TO_SLUG
edit(
  "src/app/dashboard/page.tsx",
  ` "Remote Operations Professional (Virtual Assistant)": "remote-ops",${CR}};`,
  ` "Remote Operations Professional (Virtual Assistant)": "remote-ops",${CR} "Growth Marketing Professional": "growth-marketing",${CR}};`,
  `"Growth Marketing Professional": "growth-marketing",`
);

// 12) scripts/audit-curriculum.js -> SLUGS
edit(
  "scripts/audit-curriculum.js",
  ` "bi-analytics", "ai-automation", "remote-ops",${CR}];`,
  ` "bi-analytics", "ai-automation", "remote-ops", "growth-marketing",${CR}];`,
  `"remote-ops", "growth-marketing",${CR}];`
);

console.log(failures ? `\n${failures} FAILED` : `\nAll registrations applied.`);
process.exit(failures ? 1 : 0);
