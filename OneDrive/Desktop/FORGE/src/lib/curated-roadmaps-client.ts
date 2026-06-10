/**
 * Client-safe list of curated mastery roadmaps for the onboarding picker.
 *
 * Mirrors data/roadmaps/{slug}.json, kept in sync by hand because the
 * full curriculum JSON is too heavy to ship in the client bundle. Only
 * the picker metadata (title, weeks, phases, tagline) is needed here.
 *
 * When you add a new roadmap JSON, add a matching entry here too.
 */

import { Bot, BrainCircuit, Globe, Smartphone, Cloud, Shield, FlaskConical, TrendingUp, PieChart, Workflow, type LucideIcon } from "lucide-react";

export interface CuratedRoadmapPickerEntry {
 slug: string;
 title: string;
 tagline: string;
 outcome: string;
 weeks: number;
 phases: number;
 Icon: LucideIcon;
 gradient: string;
 accent: string; // colour matches the gradient end, used for icon tint
}

export const CURATED_ROADMAPS: CuratedRoadmapPickerEntry[] = [
 {
 slug: "ai-engineering",
 title: "AI Engineering",
 tagline: "Build and ship real AI products people use",
 outcome: "Ship a working AI product to a public URL, with real users, real evals, real costs you understand",
 weeks: 24,
 phases: 7,
 Icon: Bot,
 accent: "#c084fc",
 gradient: "from-fuchsia-500 via-purple-500 to-violet-600",
 },
 {
 slug: "ml-engineering",
 title: "ML Engineering",
 tagline: "Train models from scratch and run them in production",
 outcome: "Train, version, deploy and monitor a real model with drift detection and proper evaluation",
 weeks: 24,
 phases: 7,
 Icon: BrainCircuit,
 accent: "#818cf8",
 gradient: "from-violet-500 via-indigo-500 to-blue-600",
 },
 {
 slug: "full-stack-web",
 title: "Full Stack Web",
 tagline: "Build the kind of websites and apps people pay for",
 outcome: "Ship a real SaaS at a custom domain with login, payments, customers paying you monthly",
 weeks: 24,
 phases: 7,
 Icon: Globe,
 accent: "#38bdf8",
 gradient: "from-cyan-500 via-blue-500 to-sky-600",
 },
 {
 slug: "mobile-engineering",
 title: "Mobile Engineering",
 tagline: "Build apps that live on real phones",
 outcome: "Ship one app to both the App Store and Play Store with real users",
 weeks: 24,
 phases: 7,
 Icon: Smartphone,
 accent: "#f472b6",
 gradient: "from-rose-500 via-pink-500 to-fuchsia-600",
 },
 {
 slug: "devops-cloud",
 title: "DevOps and Cloud",
 tagline: "Build the infrastructure software runs on",
 outcome: "Build a full production stack from scratch with servers, deploys, monitoring, all on auto-pilot",
 weeks: 24,
 phases: 7,
 Icon: Cloud,
 accent: "#fb923c",
 gradient: "from-orange-500 via-red-500 to-rose-600",
 },
 {
 slug: "cybersecurity",
 title: "Cybersecurity",
 tagline: "Find and fix the holes attackers actually exploit",
 outcome: "Earn one real security credit: a bug bounty payout, a published CVE, or a major OSS contribution",
 weeks: 24,
 phases: 7,
 Icon: Shield,
 accent: "#34d399",
 gradient: "from-lime-500 via-emerald-500 to-teal-600",
 },
 {
 slug: "data-science",
 title: "Data Science",
 tagline: "Find the story hidden in data and prove it",
 outcome: "Ship a real data project from raw data to deployed model people can actually use",
 weeks: 39,
 phases: 11,
 Icon: FlaskConical,
 accent: "#60a5fa",
 gradient: "from-sky-500 via-blue-500 to-indigo-600",
 },
 {
 slug: "data-analysis",
 title: "Data Analysis",
 tagline: "Turn raw numbers into decisions teams actually act on",
 outcome: "Become the person whose dashboards drive real business decisions",
 weeks: 28,
 phases: 10,
 Icon: TrendingUp,
 accent: "#2dd4bf",
 gradient: "from-emerald-500 via-teal-500 to-cyan-600",
 },
 {
 slug: "bi-analytics",
 title: "Business Intelligence",
 tagline: "Build the analytics layer a whole company depends on",
 outcome: "Own the analytics for a whole team or business: Power BI, modelling, automation",
 weeks: 17,
 phases: 7,
 Icon: PieChart,
 accent: "#fb923c",
 gradient: "from-amber-500 via-orange-500 to-rose-600",
 },
 {
 slug: "ai-automation",
 title: "AI Automation",
 tagline: "Build the workflows that run businesses without human hands",
 outcome: "Ship 3 production automations with Make and n8n that include real AI: clients pay you, workflows run 24/7",
 weeks: 20,
 phases: 6,
 Icon: Workflow,
 accent: "#a3e635",
 gradient: "from-lime-400 via-green-500 to-emerald-600",
 },
];
