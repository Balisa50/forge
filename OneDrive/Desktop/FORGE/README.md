# FORGE

Accountability lock-screen. Won't let you in until you have logged something real.

An AI interrogator reads what you say you did today and cross-examines you on it. Generic answers get rejected. Only a specific, convincing answer unlocks the machine. Built this because I kept skipping days and lying to myself about it.

## How it works

1. You hit the lock screen
2. Log what you actually did today
3. The interrogator grills you — specific questions, uncomfortable, hard to fake
4. Convince it and you're in
5. Skip a day and the streak is gone

PIN-locked settings so you can't disable it when things get hard. Consequence mechanisms for skips.

## Stack

- Next.js (App Router) + TypeScript
- Prisma + PostgreSQL
- NextAuth v5
- OpenRouter (LLM interrogator)

## Setup

```bash
npm install
cp .env.example .env.local
npx prisma migrate dev
npm run dev
```

Required env vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `OPENROUTER_API_KEY`

## Live

[the-forge-coral-mu.vercel.app](https://the-forge-coral-mu.vercel.app)
