import { loadRoadmap } from "../src/lib/roadmaps";
import { weekToTaskDetail } from "../src/lib/curated-roadmaps";

const [slug, n] = process.argv.slice(2);
const r = loadRoadmap(slug);
if (!r) { console.error("no roadmap", slug); process.exit(1); }
const w = r.weeks.find((x) => x.number === parseInt(n, 10));
if (!w) { console.error("no week", n); process.exit(1); }
console.log(weekToTaskDetail(w));
