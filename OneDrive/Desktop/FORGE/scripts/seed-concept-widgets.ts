/**
 * Seed `concept_widget` refs onto specific weeks of each roadmap.
 *
 * Placement is EXPLICIT and WEEK-LEVEL. Each widget is pinned by week NUMBER to
 * the week where its concept is actually introduced — never a project-iteration
 * week ("v0.2", "v0.3") that merely name-drops a tool, and never an intro week
 * that mentions a technology the learner hasn't met yet.
 *
 * Why not keyword matching? The earlier auto-matcher scanned week text for
 * keywords and stamped widgets onto the first week that mentioned them. That
 * dropped a *pandas* DataFrame sim onto the Excel week (it matched "spreadsheet"
 * / "PivotTables" / "filter"), a SQL sim onto a React week, a JOIN sim onto a
 * LoRA fine-tuning week, and so on — jargon before introduction, in widget form.
 * Explicit placement is the only thing that guarantees the sim matches the week.
 *
 * The widget renders at the top of the week, before the day-by-day plan: the
 * learner plays with the concept first, then goes day-by-day to get their hands
 * dirty. The daily items are for doing; the week-top sim is the conceptual anchor.
 *
 * Idempotent: a cleanup pass first strips every script-managed widget — both
 * week-level `concept_widget` and any leftover `kind:"widget"` day items from an
 * earlier day-level experiment — so re-running never duplicates.
 *
 * Run: npx tsx scripts/seed-concept-widgets.ts
 */
import * as fs from "fs";
import * as path from "path";

type Placement = { week: number; id: string; caption: string };

const DIR = path.join(process.cwd(), "data", "roadmaps");

const PLAN: Record<string, Placement[]> = {
  "data-science": [
    { week: 1, id: "df-inspector", caption: "Click each expression to see exactly what pandas returns — and why a mask isn't a filter yet." },
    { week: 2, id: "distribution-stats", caption: "Shift and skew a distribution and watch the mean get pulled while the median holds." },
    { week: 3, id: "groupby-aggregator", caption: "Pick an aggregation and watch many rows collapse into one per group — the borough breakdown, live." },
    { week: 4, id: "join-visualiser", caption: "Switch join types and watch which rows survive and where NULLs appear." },
    { week: 5, id: "regression-slider", caption: "Drag the slope and intercept by hand, then let least-squares snap the line into place." },
    { week: 6, id: "correlation-scatter", caption: "Drag r from −1 to +1 and watch the cloud tighten, flip, and flatten." },
  ],
  "data-analysis": [
    { week: 2, id: "df-inspector", caption: "Click each expression to see exactly what pandas returns — and why a mask isn't a filter yet." },
    { week: 3, id: "correlation-scatter", caption: "Drag r from −1 to +1 and watch the cloud tighten, flip, and flatten — discount vs profit, live." },
    { week: 4, id: "join-visualiser", caption: "Switch join types and watch which rows survive and where NULLs appear." },
    { week: 5, id: "sql-query", caption: "Toggle WHERE, ORDER BY and LIMIT and watch the result set — and the query — change." },
    { week: 6, id: "distribution-stats", caption: "Shift and skew a distribution and watch the mean get pulled while the median holds." },
    { week: 11, id: "groupby-aggregator", caption: "Pick an aggregation and watch many rows collapse into one per cohort." },
    { week: 20, id: "dashboard-filter", caption: "Click a region and watch every chart recompute from the same filtered data." },
  ],
  "ml-engineering": [
    { week: 1, id: "ml-task-types", caption: "Same dots, three questions — see how regression, classification and clustering differ." },
    { week: 3, id: "train-test-overfit", caption: "Crank model complexity and watch test error turn back up — the overfitting U that tuning has to dodge." },
    { week: 5, id: "gradient-descent", caption: "Set a learning rate and watch the ball roll to the minimum — or overshoot." },
    { week: 6, id: "confusion-matrix", caption: "Slide the threshold and watch precision trade off against recall." },
    { week: 7, id: "kmeans-stepper", caption: "Click Step to alternate assign → re-centre until the clusters lock in." },
  ],
  "ai-engineering": [
    { week: 1, id: "tokenizer", caption: "Type anything and watch it split into the chunks a model actually bills and reads." },
    { week: 5, id: "temperature-sampling", caption: "Slide temperature and watch the model go from confident to chaotic." },
    { week: 7, id: "context-window", caption: "Add chat turns and watch the oldest messages fall out of the window — and the bill climb." },
    { week: 9, id: "embedding-space", caption: "Click two words and see how 'closeness' is literally distance." },
    { week: 11, id: "rag-flow", caption: "Ask a question and watch retrieval rank chunks and feed only the best into the prompt." },
  ],
  "full-stack-web": [
    { week: 1, id: "box-model", caption: "Slide margin, border, and padding to see the four nested layers." },
    { week: 5, id: "react-state-flow", caption: "Change state and watch exactly which parts of the UI re-run." },
    { week: 7, id: "flexbox-playground", caption: "Flip the flex properties and watch the boxes — and the CSS — react." },
    { week: 9, id: "http-inspector", caption: "Pick a method and read the real request and response, line by line." },
    { week: 10, id: "sql-query", caption: "Toggle WHERE, ORDER BY and LIMIT and watch the result set change." },
  ],
  "mobile-engineering": [
    { week: 1, id: "rn-flexbox", caption: "See why React Native stacks vertically by default and what flex:1 really does." },
    { week: 2, id: "component-lifecycle", caption: "Drive a component through mount → update → unmount and see when effects fire." },
    { week: 3, id: "nav-stack", caption: "Push and pop screens to feel how back-navigation is just a stack." },
  ],
  "devops-cloud": [
    { week: 1, id: "container-vs-vm", caption: "Toggle between the two stacks to see what each one duplicates." },
    { week: 2, id: "dns-resolution", caption: "Step a lookup through resolver → root → TLD → authoritative." },
    { week: 9, id: "load-balancer", caption: "Fire requests and watch round-robin fan them across backends — then kill one." },
    { week: 10, id: "autoscaling", caption: "Crank the traffic and watch instances spin up to hold latency steady." },
    { week: 17, id: "cicd-pipeline", caption: "Run the pipeline and watch a failing test halt the deploy." },
  ],
  "cybersecurity": [
    { week: 1, id: "cia-triad", caption: "Pick a breach and see which security pillar it actually violates." },
    { week: 5, id: "xss-sandbox", caption: "Toggle escaping and see why raw HTML insertion is dangerous." },
    { week: 6, id: "sql-injection", caption: "Type into a login field and watch unsanitised input rewrite the query." },
    { week: 7, id: "tls-handshake", caption: "Step through how two strangers agree on a secret over an open wire." },
    { week: 20, id: "hashing-vs-encryption", caption: "Type a secret and see why one transform is reversible and one isn't." },
  ],
  "bi-analytics": [
    { week: 5, id: "dashboard-filter", caption: "Click a region and watch every chart on the page recompute." },
    { week: 8, id: "star-schema", caption: "Click a foreign key in the fact table and see it light up its dimension." },
    { week: 9, id: "cohort-retention", caption: "Read a retention heatmap down a column to compare cohorts at the same age." },
    { week: 11, id: "kpi-threshold", caption: "Drag the metric and watch it cross red / amber / green bands." },
  ],
  "ai-automation": [
    { week: 1, id: "workflow-builder", caption: "Fire a trigger and watch data flow node-to-node down the chain." },
    { week: 2, id: "webhook-transform", caption: "Toggle field mappings and watch the output JSON rebuild live." },
    { week: 3, id: "branch-sim", caption: "Change the input and watch the workflow take a different path." },
  ],
};

let totalPlaced = 0;
for (const [slug, placements] of Object.entries(PLAN)) {
  const file = path.join(DIR, `${slug}.json`);
  if (!fs.existsSync(file)) {
    console.log(`SKIP ${slug} (no file)`);
    continue;
  }
  const r = JSON.parse(fs.readFileSync(file, "utf8"));

  // Cleanup — strip every script-managed widget so re-runs don't duplicate,
  // including any leftover day-level widget items from the day-level experiment.
  for (const w of r.weeks) {
    delete w.concept_widget;
    if (Array.isArray(w.days)) {
      for (const d of w.days) {
        d.items = (d.items || []).filter((it: any) => it.kind !== "widget");
      }
    }
  }

  const placed: string[] = [];
  for (const p of placements) {
    const target = r.weeks.find((w: any) => w.number === p.week);
    if (!target) {
      placed.push(`(MISSING w${p.week})→${p.id}`);
      continue;
    }
    if (target.concept_widget) {
      placed.push(`(w${p.week} TAKEN)→${p.id}`);
      continue;
    }
    target.concept_widget = { id: p.id, caption: p.caption };
    placed.push(`w${p.week}→${p.id}`);
    totalPlaced++;
  }
  fs.writeFileSync(file, JSON.stringify(r, null, 2) + "\n", "utf8");
  console.log(`${slug}: ${placed.join(", ")}`);
}
console.log(`\nDone — ${totalPlaced} widgets placed across ${Object.keys(PLAN).length} paths.`);
