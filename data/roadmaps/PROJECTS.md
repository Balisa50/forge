# The Forge — Project Roster & Mediocre-Project Purge

Every track is anchored by a real, deployable, portfolio-grade project. This file
documents the project for each track and records the Mission 1 replacements that
removed bootcamp-tier projects (todo apps, generic blogs, calculators).

## Rule (no exceptions)

No project may be a todo app, weather app, calculator, generic blog, or any
"tutorial project that exists in every bootcamp." Every project must: solve a real
problem, have demonstrable user/business value, be deployable to a public URL, and
produce an artifact a recruiter respects.

## Replacements made (Mission 1)

| Track | Week | Was (mediocre) | Now (portfolio-grade) | Why it's better |
|-------|------|----------------|------------------------|-----------------|
| full-stack-web | 5 | **Todo App "Beyond Todos"** | **Split** — a group expense tracker (Splitwise-lite) | Real problem (splitting shared costs), derived state (minimal settle-up / who-owes-whom), client-side React + localStorage. Same teaching (components, props, state, lists) with genuine utility. |
| full-stack-web | 6 | **Build a Blog with CMS** | **Atlas** — a programmatic-SEO resource directory | A blog is banned bootcamp fare. Atlas teaches the identical skills (App Router, MDX/structured data, `generateStaticParams`, `generateMetadata`, dynamic routes, sitemaps, OG images) but builds a directory of hundreds of statically-generated pages that can actually rank and pull organic traffic. |
| full-stack-web | 16 | collaborative **todo list** (Yjs) | collaborative **Kanban board** (Yjs + Postgres) | Same CRDT / real-time / network-partition / persistence teaching, but a genuinely useful multiplayer app instead of a todo. |
| full-stack-web | 7 | (stale refs "your blog from week 6") | references updated to "your Atlas directory" | Consistency after the W6 swap. |

The Bean Forge `/blog` page (W4) is intentionally kept: it is a content section of a
real small-business website (the progressive capstone), not a standalone blog
project. Likewise "blog schema" (W10 Prisma) and "blog API" (W11 REST) remain as
standard data-modelling teaching examples, and the resource note citing a real
developer's blog is left untouched.

## Full project roster (all 11 tracks pass the rule)

| Track | Anchor project(s) | Real-world value |
|-------|-------------------|------------------|
| full-stack-web | Bean Forge (real small-business site → custom domain, forms, Astro) → **Split**, **Atlas**, auth, Stripe, real-time **Kanban**, SaaS capstone | Ships a revenue-capable SaaS with real users. |
| devops-cloud | **Edge Portfolio** — real domain, HTTPS/HSTS, CI/CD, containers, K8s, Helm, monitoring | Production infrastructure on a live URL. |
| mobile-engineering | **Hydra** — habit/water tracker with local persistence + sync → camera, maps, push, EAS store builds | Shipped to both app stores. |
| cybersecurity | **Vuln Reports** — a real security portfolio (Juice Shop, TryHackMe, Burp, chained exploits) | Hireable pentest portfolio. |
| ml-engineering | **FlightWise** — delay predictor (feature eng → XGBoost → Flask API → Docker) + loan-default & MLOps | Deployed ML system with monitoring. |
| ai-engineering | Invoice parser, semantic search, hybrid RAG, paper assistant, agents | Production AI features. |
| ai-automation | Real client automation pipelines (n8n, scraping, doc processing, agents) | Sellable automation services. |
| bi-analytics | **Superstore BI** — published Power BI w/ RLS, refresh, DAX, time intelligence | Stakeholder-grade dashboards. |
| data-science | **TaxiPulse** — load → analyse → predict → deploy API → dashboard | End-to-end DS portfolio. |
| data-engineering | **End-to-end pipeline** — ingest → lake → warehouse → dbt → orchestration → streaming → quality → governance → dashboard | A complete, operated data platform. |
| data-analysis | Real analyses across SQL/Excel/Power BI/Tableau/BigQuery + capstone | Decision-driving analyst work. |

## Verification

- `mediocre-project hits` across `full-stack-web.json` and `full-stack-web-enriched.json`: **0**
  (regex: `todo app | build a blog | build a todo | collaborative todo | blog from week 6 | on your blog`).
- Full 6-part roadmap audit (`audit_final.py`): **all 11 tracks PASS**.
