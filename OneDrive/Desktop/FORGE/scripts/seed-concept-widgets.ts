/**
 * Seed `concept_widget` refs onto the best-matching week of each roadmap.
 *
 * For each path we list the widgets that belong to it, each with keywords and
 * a caption. The script scans the path's weeks in order and attaches the
 * widget to the first week whose title/phase/context/topics match a keyword
 * and doesn't already carry a widget. Distinctive widgets are listed first so
 * they claim their week before broader ones.
 *
 * Run: npx tsx scripts/seed-concept-widgets.ts
 */
import * as fs from "fs";
import * as path from "path";

type Placement = { id: string; kw: string[]; caption: string };

const DIR = path.join(process.cwd(), "data", "roadmaps");

const PLAN: Record<string, Placement[]> = {
  "data-science": [
    { id: "df-inspector", kw: ["pandas", "dataframe", "data frame", "filter", "series", "selecting", "indexing"], caption: "Click each expression to see exactly what pandas returns — and why a mask isn't a filter yet." },
    { id: "regression-slider", kw: ["linear regression", "regression", "line of best fit", "slope", "least squares"], caption: "Drag the slope and intercept by hand, then let least-squares snap the line into place." },
    { id: "distribution-stats", kw: ["distribution", "descriptive", "central tendency", "mean", "median", "summary statistic", "spread", "variance"], caption: "Shift and skew a distribution and watch the mean get pulled while the median holds." },
    { id: "correlation-scatter", kw: ["correlation", "scatter", "relationship between variables"], caption: "Drag r from −1 to +1 and watch the cloud tighten, flip, and flatten." },
    { id: "groupby-aggregator", kw: ["groupby", "group by", "aggregat", "pivot"], caption: "Pick an aggregation and watch many rows collapse into one per group." },
    { id: "join-visualiser", kw: ["join", "merge", "relational", "combining data"], caption: "Switch join types and watch which rows survive and where NULLs appear." },
  ],
  "data-analysis": [
    { id: "df-inspector", kw: ["pandas", "dataframe", "data frame", "filter", "series", "selecting", "spreadsheet"], caption: "Click each expression to see exactly what pandas returns — and why a mask isn't a filter yet." },
    { id: "sql-query", kw: ["sql", "query", "select", "database"], caption: "Toggle WHERE, ORDER BY and LIMIT and watch the result set — and the query — change." },
    { id: "join-visualiser", kw: ["join", "merge", "relational"], caption: "Switch join types and watch which rows survive and where NULLs appear." },
    { id: "groupby-aggregator", kw: ["groupby", "group by", "aggregat", "pivot"], caption: "Pick an aggregation and watch many rows collapse into one per group." },
    { id: "distribution-stats", kw: ["distribution", "descriptive", "mean", "median", "statistic"], caption: "Shift and skew a distribution and watch the mean get pulled while the median holds." },
    { id: "correlation-scatter", kw: ["correlation", "scatter", "relationship"], caption: "Drag r from −1 to +1 and watch the cloud tighten and flip." },
    { id: "dashboard-filter", kw: ["dashboard", "visualiz", "visualis", "chart", "report"], caption: "Click a region and watch every chart recompute from the same filtered data." },
  ],
  "ml-engineering": [
    { id: "ml-task-types", kw: ["what is machine learning", "supervised", "types of", "fundamentals", "intro to ml", "landscape"], caption: "Same dots, three questions — see how regression, classification and clustering differ." },
    { id: "kmeans-stepper", kw: ["k-means", "kmeans", "clustering", "unsupervised"], caption: "Click Step to alternate assign → re-centre until the clusters lock in." },
    { id: "knn-boundary", kw: ["knn", "k-nearest", "nearest neighbor", "nearest neighbour"], caption: "Move the query point and change k to watch the vote flip near the border." },
    { id: "train-test-overfit", kw: ["overfit", "train/test", "train test", "generaliz", "bias", "variance", "validation", "cross-validation"], caption: "Crank model complexity and watch test error turn back up — the overfitting U." },
    { id: "gradient-descent", kw: ["gradient descent", "optimization", "optimisation", "loss function", "training loop", "backprop"], caption: "Set a learning rate and watch the ball roll to the minimum — or overshoot." },
    { id: "confusion-matrix", kw: ["confusion matrix", "precision", "recall", "evaluation metric", "f1", "classification metric"], caption: "Slide the threshold and watch precision trade off against recall." },
  ],
  "ai-engineering": [
    { id: "tokenizer", kw: ["token", "tokeniz"], caption: "Type anything and watch it split into the chunks a model actually bills and reads." },
    { id: "temperature-sampling", kw: ["temperature", "sampling", "decoding", "generation parameter", "top-p", "top_p"], caption: "Slide temperature and watch the model go from confident to chaotic." },
    { id: "embedding-space", kw: ["embedding", "vector", "semantic search"], caption: "Click two words and see how 'closeness' is literally distance." },
    { id: "rag-flow", kw: ["rag", "retrieval", "retrieval-augmented", "vector database", "vector db"], caption: "Ask a question and watch retrieval rank chunks and feed only the best into the prompt." },
    { id: "context-window", kw: ["context window", "context length", "prompt engineering", "prompting"], caption: "Add chat turns and watch the oldest messages fall out of the window." },
  ],
  "full-stack-web": [
    { id: "box-model", kw: ["css", "box model", "styling", "html and css"], caption: "Slide margin, border, and padding to see the four nested layers." },
    { id: "flexbox-playground", kw: ["flexbox", "flex", "layout", "responsive"], caption: "Flip the flex properties and watch the boxes — and the CSS — react." },
    { id: "http-inspector", kw: ["http", "request", "rest", "api", "fetch"], caption: "Pick a method and read the real request and response, line by line." },
    { id: "react-state-flow", kw: ["react", "state", "usestate", "component", "hooks"], caption: "Change state and watch exactly which parts of the UI re-run." },
    { id: "sql-query", kw: ["sql", "database", "query", "postgres", "prisma"], caption: "Toggle WHERE, ORDER BY and LIMIT and watch the result set change." },
  ],
  "mobile-engineering": [
    { id: "rn-flexbox", kw: ["layout", "flex", "style", "styling"], caption: "See why React Native stacks vertically by default and what flex:1 really does." },
    { id: "component-lifecycle", kw: ["lifecycle", "useeffect", "hooks", "state", "effect"], caption: "Drive a component through mount → update → unmount and see when effects fire." },
    { id: "nav-stack", kw: ["navigation", "navigat", "routing", "screens", "stack"], caption: "Push and pop screens to feel how back-navigation is just a stack." },
  ],
  "devops-cloud": [
    { id: "container-vs-vm", kw: ["container", "docker", "virtual machine", "containeriz"], caption: "Toggle between the two stacks to see what each one duplicates." },
    { id: "load-balancer", kw: ["load balanc", "horizontal scal", "high availability"], caption: "Fire requests and watch round-robin fan them across backends — then kill one." },
    { id: "cicd-pipeline", kw: ["ci/cd", "cicd", "pipeline", "continuous integration", "continuous deployment", "github actions"], caption: "Run the pipeline and watch a failing test halt the deploy." },
    { id: "autoscaling", kw: ["autoscal", "auto-scal", "kubernetes", "scaling", "orchestrat"], caption: "Crank the traffic and watch instances spin up to hold latency steady." },
    { id: "dns-resolution", kw: ["dns", "domain", "networking", "name resolution"], caption: "Step a lookup through resolver → root → TLD → authoritative." },
  ],
  "cybersecurity": [
    { id: "cia-triad", kw: ["cia", "confidentiality", "security fundamentals", "security principles", "intro", "foundations"], caption: "Pick a breach and see which security pillar it actually violates." },
    { id: "sql-injection", kw: ["sql injection", "injection", "owasp", "web vulnerab", "web app"], caption: "Type into a login field and watch unsanitised input rewrite the query." },
    { id: "xss-sandbox", kw: ["xss", "cross-site", "scripting"], caption: "Toggle escaping and see why raw HTML insertion is dangerous." },
    { id: "hashing-vs-encryption", kw: ["hash", "encrypt", "cryptograph", "crypto"], caption: "Type a secret and see why one transform is reversible and one isn't." },
    { id: "tls-handshake", kw: ["tls", "ssl", "https", "certificate", "pki"], caption: "Step through how two strangers agree on a secret over an open wire." },
  ],
  "bi-analytics": [
    { id: "dashboard-filter", kw: ["dashboard", "filter", "interactiv", "report", "visualiz", "visualis"], caption: "Click a region and watch every chart on the page recompute." },
    { id: "star-schema", kw: ["star schema", "data model", "dimension", "fact table", "warehouse", "modeling", "modelling"], caption: "Click a foreign key in the fact table and see it light up its dimension." },
    { id: "kpi-threshold", kw: ["kpi", "metric", "threshold", "scorecard", "rag status"], caption: "Drag the metric and watch it cross red / amber / green bands." },
    { id: "cohort-retention", kw: ["cohort", "retention", "churn"], caption: "Read a retention heatmap down a column to compare cohorts at the same age." },
  ],
  "ai-automation": [
    { id: "workflow-builder", kw: ["workflow", "automation", "trigger", "n8n", "zapier", "make.com", "first automation"], caption: "Fire a trigger and watch data flow node-to-node down the chain." },
    { id: "webhook-transform", kw: ["webhook", "api", "integrat", "transform", "data mapping"], caption: "Toggle field mappings and watch the output JSON rebuild live." },
    { id: "branch-sim", kw: ["conditional", "logic", "branch", "routing", "if/else", "if else", "decision"], caption: "Change the input and watch the workflow take a different path." },
  ],
};

function weekText(w: any): string {
  return [w.title, w.phase, w.context, ...(w.topics || []), ...(w.tasks || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

let totalPlaced = 0;
for (const [slug, placements] of Object.entries(PLAN)) {
  const file = path.join(DIR, `${slug}.json`);
  if (!fs.existsSync(file)) {
    console.log(`SKIP ${slug} (no file)`);
    continue;
  }
  const r = JSON.parse(fs.readFileSync(file, "utf8"));
  const used = new Set<number>();
  const placed: string[] = [];
  for (const p of placements) {
    let target: any = null;
    for (const w of r.weeks) {
      if (used.has(w.number)) continue;
      if (w.concept_widget) continue;
      const txt = weekText(w);
      if (p.kw.some((k) => txt.includes(k.toLowerCase()))) {
        target = w;
        break;
      }
    }
    // Fallback: if nothing matched, drop it on the earliest week without one.
    if (!target) {
      target = r.weeks.find((w: any) => !used.has(w.number) && !w.concept_widget) || null;
    }
    if (target) {
      target.concept_widget = { id: p.id, caption: p.caption };
      used.add(target.number);
      placed.push(`w${target.number}→${p.id}`);
      totalPlaced++;
    } else {
      placed.push(`(no slot)→${p.id}`);
    }
  }
  fs.writeFileSync(file, JSON.stringify(r, null, 2) + "\n", "utf8");
  console.log(`${slug}: ${placed.join(", ")}`);
}
console.log(`\nDone — ${totalPlaced} widgets placed across ${Object.keys(PLAN).length} paths.`);
