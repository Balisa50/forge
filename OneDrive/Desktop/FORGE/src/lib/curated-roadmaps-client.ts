/**
 * Client-safe list of curated mastery roadmaps for the onboarding picker.
 *
 * Mirrors data/roadmaps/{slug}.json — kept in sync by hand because the
 * full curriculum JSON is too heavy to ship in the client bundle. Only
 * the picker metadata (title, weeks, phases, tagline) is needed here.
 *
 * When you add a new roadmap JSON, add a matching entry here too.
 */

export interface CuratedRoadmapPickerEntry {
  slug: string;
  title: string;
  tagline: string;
  outcome: string;
  weeks: number;
  phases: number;
  emoji: string;
  gradient: string;
}

export const CURATED_ROADMAPS: CuratedRoadmapPickerEntry[] = [
  {
    slug: "ai-engineering",
    title: "AI Engineering",
    tagline: "Zero to shipping AI products — LLMs, RAG, agents, evals, deployment",
    outcome: "Ship a real AI product to a public URL with auth, evals, observability, real users",
    weeks: 24,
    phases: 7,
    emoji: "🤖",
    gradient: "from-fuchsia-500 via-purple-500 to-violet-600",
  },
  {
    slug: "ml-engineering",
    title: "ML Engineering",
    tagline: "From NumPy to PyTorch to MLOps — train, serve, monitor real models",
    outcome: "Train, version, deploy and monitor a production model with full eval + drift detection",
    weeks: 24,
    phases: 7,
    emoji: "📊",
    gradient: "from-violet-500 via-indigo-500 to-blue-600",
  },
  {
    slug: "full-stack-web",
    title: "Full Stack Web",
    tagline: "From HTML first principles to a paid-customer SaaS",
    outcome: "Ship a real SaaS at a custom domain — auth, Stripe, observability, real revenue",
    weeks: 24,
    phases: 7,
    emoji: "🌐",
    gradient: "from-cyan-500 via-blue-500 to-sky-600",
  },
  {
    slug: "mobile-engineering",
    title: "Mobile Engineering",
    tagline: "From React Native fundamentals to App Store + Play Store",
    outcome: "Ship one mobile app to both stores with real users and real retention data",
    weeks: 24,
    phases: 7,
    emoji: "📱",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-600",
  },
  {
    slug: "devops-cloud",
    title: "DevOps & Cloud",
    tagline: "From Linux to Kubernetes to a full production stack on AWS",
    outcome: "Build the entire production stack for one app — Terraform, K8s, GitOps, observability",
    weeks: 24,
    phases: 7,
    emoji: "☁️",
    gradient: "from-orange-500 via-red-500 to-rose-600",
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity Engineering",
    tagline: "From OWASP Top 10 to published CVE or bug bounty",
    outcome: "Earn a real security artifact — bug bounty, CVE, red team report, detection contribution",
    weeks: 24,
    phases: 7,
    emoji: "🛡️",
    gradient: "from-lime-500 via-emerald-500 to-teal-600",
  },
  {
    slug: "data-science",
    title: "Data Science",
    tagline: "From Python first principles to a deployed ML model with a portfolio",
    outcome: "Ship a capstone that uses real-world data, statistical reasoning, and a deployed model",
    weeks: 20,
    phases: 7,
    emoji: "🧪",
    gradient: "from-sky-500 via-blue-500 to-indigo-600",
  },
  {
    slug: "data-analysis",
    title: "Data Analysis",
    tagline: "From spreadsheets to SQL to dashboards that decision-makers act on",
    outcome: "Become the person whose analysis the team trusts to call shipping decisions",
    weeks: 18,
    phases: 5,
    emoji: "📈",
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
  },
  {
    slug: "bi-analytics",
    title: "BI Analytics",
    tagline: "From clean data models to BI dashboards that drive million-dollar decisions",
    outcome: "Own the analytics layer for a whole business unit — Power BI, modelling, automation",
    weeks: 17,
    phases: 7,
    emoji: "📋",
    gradient: "from-amber-500 via-orange-500 to-rose-600",
  },
];
