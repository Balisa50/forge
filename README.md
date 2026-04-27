# VANTAGE

AI-synthesised tech intelligence feed. Pick what you care about, get a scored stream of what is actually happening.

Covers startups, policy, big tech, markets, infrastructure, and AI across six regions. Each story gets a signal score so you can skim what matters and skip the noise.

## What it does

- Pulls from sources across six geographic regions
- AI layer synthesises and scores each piece by relevance and signal quality
- Filterable by category: startups, policy, big tech, markets, infra, AI
- Clean reading interface — no algorithmic trap

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind v4
- Groq for AI synthesis
- Deployed on Vercel

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Runs at `http://localhost:3000`.

## Live

[vantage-three-chi.vercel.app](https://vantage-three-chi.vercel.app)
