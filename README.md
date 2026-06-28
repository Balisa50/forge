# FORGE

Accountability lock-screen. It will not let you in until you have logged something real.

Built this because I kept skipping days and lying to myself about it. Streak apps and habit trackers are too easy to dismiss. This one refuses to move until you have answered for the day.

## How it works

1. Hit the lock screen
2. Log what you actually did today
3. An AI interrogator reads it and cross-examines you — specific questions, uncomfortable, hard to fake
4. Convince it and you are in
5. Skip a day and the streak is gone

Settings are PIN-locked so you cannot disable it when things get hard.

## Stack

- Next.js (App Router) + TypeScript
- Prisma + PostgreSQL (Neon)
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

[forge-ab.vercel.app](https://forge-ab.vercel.app)

