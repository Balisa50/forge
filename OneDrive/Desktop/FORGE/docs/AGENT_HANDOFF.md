# FORGE — agent handoff context

For the next agent picking up where I stopped. Read this first, in order.

## What was just shipped (last 24h)

### Deploy pipeline (critical)
- `package.json` build was `prisma migrate deploy && prisma generate && next build`.
  The migrate step was acquiring a Postgres advisory lock (P1002 timeout) on
  every Vercel build — when builds queued, the whole build failed and Vercel
  kept serving the old deploy. **Every UI fix the user saw as "broken" for
  a day was actually deployed code that never made it past build.**
  Fix: build is now `prisma generate && next build`. Migrations are an
  intentional `npm run migrate:deploy` you trigger when the schema changes.
- Always run `npm run build` standalone BEFORE pushing. Twice in the last day
  a chained `tsc && git push` masked a syntax error and shipped a broken
  build. Standalone, single-purpose, then push.

### Mentoring flow (this commit)
- New `GET /api/mentee/review-state` — one round trip for the whole
  questions/answers/verdict/rating state on the student week page.
- New `<MentorReviewSection>` component renders inline on `/learn/[slug]/[week]`
  via `WeekPageTabs(taskId=…)`. Hidden when no mentor questions are authored
  (solo learners see no change).
- Journal status pill is now derived from `Interrogation.mentorReviewedAt` +
  `passed` instead of raw `Checkin.status`. AWAITING REVIEW (yellow) ⇒
  PASSED (green) or NEEDS REWORK (red). The "shows passed before review"
  bug is dead.
- `Task.mentorRating` (1–5) now flows through `POST /api/mentor/reviews` too
  — previously it was only writable via the legacy verify dialog on the
  mentee page, which is why grading from the Reviews queue never reached
  the student.
- `/dashboard/notes` now carries an anti-confusion banner pointing students
  to the week's Mentor Review section for review questions.
- DA Week 2 gained **Day 0 — Your Coding Environment — Jupyter Notebook**
  (number: 0, renders first in the day stream). Same teach → swipe →
  exercise shape as every other day.

## What's still open

### High priority — finish the user's requested rebuild
1. **Inline answering on the week page**
   The user explicitly wanted students to type answers "directly below each
   question" on the week page with a "Submit Answers" button. Currently the
   Mentor Review section shows the questions and a CTA that sends them to
   `/dashboard/checkin`. The check-in form remains the engagement gate. To
   do inline answering cleanly: either
     (a) lift the questions-and-answers UI into a shared component used by
         both the check-in form and a new week-page form, OR
     (b) carve out a new `POST /api/mentee/answers` endpoint that creates a
         lightweight Interrogation **without** requiring evidence (the
         engagement gate still applies to the proof-of-work check-in).
   Current schema has `Interrogation.checkinId @unique` so option (b) would
   need a placeholder Checkin row per answer-only submission. Talk to the
   user before picking; (a) is the architecturally cleaner choice.

2. **Cross-track environment audit**
   The user asked for Jupyter/environment teaching added *before* any coding
   in **every** track. So far only DA W2 has Day 0. The audit list to walk:
   - **Data Analysis** — Day 0 done in W2; verify every later week assumes
     the same notebook setup. Coverage gap: SQL (W5) jumps to sqliteonline
     but probably needs a "SQL environment Day 0" too.
   - **Data Science** — W1 sends them to Anaconda + Jupyter but it's mixed
     into Day 2's exercise. Carve a clean Day 0. Also: W4 (SQL), W7
     (Flask/FastAPI deploy), W15 (Colab GPU) all introduce new envs — verify
     each gives a step-by-step on first use.
   - **DevOps & Cloud** — W1 already teaches shell + AWS account + Terraform
     install. Audit whether each subsequent week introduces tools (Docker,
     K8s, GitHub Actions) with the same install-first care.
   - **AI Engineering / ML Engineering / Full-Stack / Mobile / Cybersec / BI /
     AI Automation** — same audit. Each first task in a new environment
     gets a Day 0 (or a labelled "Environment" lesson at the start of that
     day) before any code.
   The user wants exact content sent for approval each time before commit.

3. **Pending Reviews UX polish**
   - Reviews route filters by `mentorReviewerId = me`. If the mentor never
     authored questions on a task (so no `mentorQuestions[0].mentorId`),
     the interrogation isn't created at all — no submission landing in the
     queue. Verify with a test: a mentee tries to submit a week without
     mentor questions, only proof of work — should that be auto-passed
     (current behaviour) or "awaiting review" too? The user's spec says
     "A student passes only when I say they pass" — which implies even
     no-question submissions should not auto-pass. Decision needed from
     the user.

4. **DS curriculum continuation**
   The DS track was being rebuilt week-by-week to the teach → swipe →
   project standard. Stopped at the end of W21. **W22–W43 still need the
   rebuild.** Next batch is W22 (ARIMA) → W29 (Capstone build).

### Medium priority
5. **Cross-link from check-in success → Mentor Review section**
   After a student submits answers, the check-in success page could link
   back to the week's Mentor Review section so they can confirm their
   answers are in the awaiting-review state.

6. **Notification deep-links**
   `sendNotification("mentor-action", …)` currently fires but isn't wired
   to a clean "open the week" link for the student.

### Low priority / known cosmetic
7. Login centering bounced around a few commits; current state uses
   `display:flex` + `justify-content:center` + `margin:auto` on the inner
   card. If a user reports it's still off, the cause is almost always
   horizontal overflow from an unconstrained child — start by inspecting
   the `<form>` widths.

## Architecture cheat-sheet — what lives where

| Concern | Source of truth | UI surface |
|---|---|---|
| Mentor questions | `MentorQuestion` table | mentor `/dashboard/mentor/<menteeId>` → `<MentorQuestionBank>` per task |
| Student answers | `Interrogation.transcript` JSON (created when check-in submits) | `/dashboard/checkin` form (answer entry) + week page Mentor Review (display) |
| Pass / fail | `Interrogation.passed` + `mentorReviewedAt` | week page Mentor Review section + Journal |
| 1–5 rating | `Task.mentorRating` | Journal + week page Mentor Review badge |
| Verdict + feedback | `Interrogation.feedback` + `overallScore` | week page Mentor Review + Journal |
| Pending review queue | `Interrogation` where `mode=mentor_async`, `mentorReviewerId=me`, `mentorReviewedAt IS NULL` | `/dashboard/mentor/reviews` |
| Mentor messages (chat) | `MentorComment` with `kind ∈ {message,note,request_unlock,action_log}` | `/dashboard/notes` (now banner-clarified) |

## Files touched in this commit
- new: `src/app/api/mentee/review-state/route.ts`
- new: `src/components/MentorReviewSection.tsx`
- changed: `src/components/WeekPageTabs.tsx` (new `taskId` prop + section mount)
- changed: `src/app/learn/[slug]/[week]/page.tsx` (look up `ownTask.id`, pass down)
- changed: `src/app/dashboard/journal/page.tsx` (derived status pill, rating, feedback)
- changed: `src/app/dashboard/page.tsx` (re-entry detector no longer filters by `status==passed`)
- changed: `src/app/dashboard/notes/page.tsx` (rename heading + banner)
- changed: `src/app/api/mentor/reviews/route.ts` (accept + persist mentorRating)
- changed: `src/app/dashboard/mentor/reviews/page.tsx` (rating selector + clearer button labels)
- new: `docs/MENTORING_FLOW.md` (end-to-end integration test)
- new: `docs/AGENT_HANDOFF.md` (this file)
- new: `data/roadmaps/data-analysis.json` (W2 Day 0)
- new: `scripts/da-w2-day0.js`

## Working pattern that works for the user

- **Always show pushed commit hash + remote HEAD after every push.**
  This user got burned multiple times by stale deploys; they need explicit
  proof.
- **Run `npm run build` standalone** before any push that touches `src/`.
  TypeScript-clean is necessary but not sufficient — the production build
  catches JSX-shape errors `tsc --noEmit` doesn't.
- **One change, one commit, one verified push.** Don't bundle a UI fix and
  a content rebuild in the same commit — if the build fails, you can't tell
  which broke it.
- The user reads every word in the long replies; sub-bulleted summaries
  are appreciated. Don't shrink the content; do shrink the prose around it.
