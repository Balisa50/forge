# FORGE — Session Handoff

**Last updated:** 2026-06-05 · this session.
**Scope:** what shipped in this run, what state the platform + curriculum are in, what the bar is, and what the next pickup can do without re-discovering anything.

> **THIS DOCUMENT IS CANONICAL.** Abdoulie treats it as the single source of truth between sessions. Any agent that codes for FORGE should:
> 1. **Read this entire doc before making any change.** Especially sections §4 (conventions), §8 (the bar), §11 (failure modes).
> 2. **Append anything important to this doc as it ships.** New convention discovered? New failure mode learned? New decision the next session must know? Add it here. Don't lose it in chat logs.
> 3. **Match the bar.** This is not Coursera, not Udemy, not a bootcamp. This platform is engineered to make those look like toys. Every word, every video, every code sample, every test — that quality. No mediocrity. No skipped concepts. No fabricated facts.

Companion docs:
- `scripts/v2/HANDOFF.md` — older v2-rewrite handoff. Still valid for that batch. Read after this one.
- `CLAUDE.md` (memory) — Abdoulie's profile, project list, persistent feedback rules.

---

## 0a · One-source-of-truth rule — page contracts

After repeated duplication bugs across dashboard / roadmap / week pages, these are the hard contracts. **Never render the same content in two places.**

| Page | Owns | Must NOT render |
|---|---|---|
| Dashboard `/dashboard` | Forge Pact card · Check-in CTA · Progress + Deadline row · **Current Focus** (title only + Resume button). | Track-progress bars (live on roadmap page). Recent Sessions (lives on Journal). Inline week lessons (live on the week page). Long `task.detail` dumps. |
| Roadmap `/dashboard/roadmap` | **Journey** node map (the vertical timeline of weeks). Clicking an unlocked node navigates to that week. | Track tabs. Phase accordion. Per-task inline `WeekPageTabs`. Per-task resource lists. Anything that duplicates the week page. |
| Week `/learn/<slug>/<week>` | Tabs (Content, Submission, optional Mentor Review). The full lesson stream. Prev/Next nav scoped to Content tab only. | Anything that belongs to the dashboard summary. |
| Journal `/dashboard/journal` | The full session record, one row per (user, task). | Anything mentor-dashboard-flavoured. |

**Navigation contract:** every "back" arrow on the week page goes to `/dashboard`. Solo + mentee both. Never back to `/learn/<slug>` (the public curriculum index) — that's for unauthenticated visitors only.

---

## 0 · Solo-learner mode — design notes (added previous session)

Solo learners are detected by **absence of any active `MentorLink` for the viewer**. When solo:
- `WeekPageTabs` drops the **Mentor Review** tab; only Content + Submission render.
- The Submission tab swaps from "submit and wait for mentor" to a `SoloCompletePanel` widget: optional Proof URL input + Mark Complete button.
- Mark Complete calls **`POST /api/me/mark-week-complete`** which: (1) verifies the user owns the task, (2) verifies no mentor link exists (else 403 — solo path is solo-only), (3) upserts a Checkin row with `evidenceType: "self_complete"`, (4) flips `Task.status = "verified"`, (5) idempotent on re-POST.
- The "Current Focus" card on the dashboard no longer dumps `task.detail` — it's a gateway, not a lesson. The Resume button now navigates **directly to `/learn/<slug>/<weekNum>`** which opens on the Content tab.
- Solo-learner UX rule: **never assume a mentor exists**. No mentor questions, no mentor ratings, no pending reviews, no send-back buttons. The platform gets out of the way.
- The mentor-and-also-learner case (`User.isAlsoLearning = true` + no inbound `MentorLink`) is treated as solo for their own learning view, which is what the dashboard layout already does.

---

## 1 · What shipped this session

In commit-order (most recent first). Every entry was pushed to `main`.

| Commit | Title | What changed |
|---|---|---|
| `edfa27d` | Close every prerequisite-audit gap to zero (24 → 0) | 9 track JSONs + `scripts/fix-all-prereq-gaps.js`. Single parameterised script with a shared 9-tool teach library (lesson + Fireship "100 Seconds" video where confident + canonical docs reading). |
| `5f7e467` | Add 5-min NumPy intro video to DS W2 D1 alongside lesson + docs | `data-science.json` + `scripts/ds-w2-numpy-video.js`. Python Programmer 5-min video inserted between the NumPy lesson and the docs reading. |
| `a828e2e` | Reclaim card width on phone + YouTube fullscreen everywhere | `WeekPageTabs.tsx` lesson-item split into header + full-width body row (frees ~66 px from the body's left edge on phones). `VideoEmbed.tsx` and `ResourceViewer.tsx` get `fs=1` in YouTube URLs + `fullscreen` in iframe `allow=` attribute. |
| `673ca0b` | Critical platform fixes: recent-sessions cap, NumPy prereq, code CSS, audit | Mentor card "Recent Sessions" → single deduped row. DS W2 D1 gains NumPy lesson + numpy.org reading + swipe (no new day). `ForgeMarkdown` code block: `.forge-code-block` class + mobile wrap rule. New `scripts/audit-prerequisites.js`. |
| `49cd985` | Fix 10 mentor/student flow issues + audit | Check-in upsert by (userId, taskId) — no more duplicates on reopen. Review form button overflow fix. Prev/Next nav scoped to Content tab only. Submit-work button removed from dashboard week card. Mentor card hover affordance. Submission tab context-aware label + prior-submission preview. Journal NEEDS-REVISION pill. |

---

## 2 · Platform state

### 2.1 Backend (Prisma)
- Active schema: `prisma/schema.prisma`. Provider: postgres.
- Key models touched recently: `Checkin` (now upserted by `(userId, taskId)`; legacy duplicates collapsed by the Journal page query). `Interrogation` (one per checkin, status flips back to needs-revision on mentor reopen). `Task`, `MentorLink`, `Notification`, `MentorComment`, `MentorQuestion`.
- **No new migrations this session.** The check-in upsert behaviour change is application-layer only (no schema change needed because `attemptNum` already existed).

### 2.2 Critical components
| File | Role |
|---|---|
| `src/components/WeekPageTabs.tsx` | Student week view — tabs (Content / Submission / Mentor Review), lesson stream, prev/next pager. |
| `src/components/ForgeMarkdown.tsx` | Lesson body renderer. Owns the `CodeBlock` table layout. |
| `src/components/VideoEmbed.tsx` | YouTube + Loom inline player with lazy thumbnail + fullscreen support. |
| `src/components/ResourceViewer.tsx` | Modal viewer for non-video resources + YouTube fallback. |
| `src/app/dashboard/mentor/page.tsx` | Mentor home — mentee cards, single "latest session" row. |
| `src/app/dashboard/mentor/reviews/page.tsx` | Pending-review queue + grading form. |
| `src/app/dashboard/journal/page.tsx` | Student session record. Dedupes by `taskId`; surfaces `NEEDS REVISION` pill. |
| `src/app/api/checkins/route.ts` | Proof-of-work submission. Upserts. |
| `src/app/api/mentee/review-answers/route.ts` | Answer-question submission. Upserts. |
| `src/app/api/mentor/tasks/[id]/route.ts` | Mentor lifecycle actions including `reopen` — resets interrogation in place. |
| `src/app/api/mentor/reviews/route.ts` | Grading endpoint. Fires `mentor-action` notification. |

### 2.3 CSS surface
- `src/app/globals.css` carries:
  - `.forge-panel-link` hover affordance (used by mentor card + org students table).
  - `.forge-code-block` + `.forge-code-line` + `.forge-code-gutter` — mobile wrap + tightened gutter for code blocks rendered inside `ForgeMarkdown`.
  - Existing mobile responsive block (≤768px).

---

## 3 · Curriculum state

### 3.1 Track totals
| Track | Weeks | Status |
|---|---|---|
| data-science | 43 | enriched + audited clean |
| data-analysis | 28 | base content + prereqs added at W1 D1 |
| ai-engineering | 24 | W1-W5 enriched (Polyglot arc + SDK depth); W6+ stale |
| ml-engineering | 24 | base content + prereqs added at W1 D1 |
| full-stack-web | 24 | base content + Git/SQL prereqs added |
| mobile-engineering | 24 | base content + Git/SQL prereqs added |
| devops-cloud | 24 | W1-W2 enriched; W3-W7 paused mid-pivot; only track that was audit-clean from the start |
| cybersecurity | 24 | base content + Git prereq added |
| bi-analytics | 17 | base content + Git prereq added |
| ai-automation | 20 | base content + 4 prereqs added (NumPy, Docker, Git, SQL) |

### 3.2 Audit status
```
$ node scripts/audit-prerequisites.js
Totals: 0 CRITICAL · 0 HIGH across all 10 tracks.
```
Both audit scripts are idempotent and meant to run repeatedly:
- `scripts/audit-week-alignment.ts` — checks context-vs-topic keyword overlap per week.
- `scripts/audit-prerequisites.js` — checks every tracked tool has a teach lesson before its first use.

### 3.3 Recent curriculum batches
| Script | Touched |
|---|---|
| `scripts/ds-w1-w3.js` … `ds-w42-w43.js` | DS rebuilt to teach→swipe→project standard, all 43 weeks |
| `scripts/ai-eng-w1-w5.js` | AI Engineering W1-W5 enriched (Polyglot v0.1-v0.4 + SDK depth) |
| `scripts/ds-w2-numpy-prereq.js` | NumPy lesson + reading + swipe into DS W2 D1 |
| `scripts/ds-w2-numpy-video.js` | NumPy 5-min video into the same day |
| `scripts/fix-all-prereq-gaps.js` | One-shot closer for the 24 audit findings |

---

## 4 · Constraints + conventions

These are repeated throughout the session and survive into the next pickup:

1. **Check first, then build.** Search the codebase for the feature before assuming it doesn't exist. Don't duplicate.
2. **No new days.** All curriculum patches add items inside existing day arrays.
3. **No mediocrity.** Lessons teach from zero; videos are real; URLs aren't fabricated.
4. **Videos ≤ 15 min hard cap, ≤ 10 min preferred.** When no confident short URL exists, lesson + docs reading carry the teach load.
5. **Always push.** Commit and push by default; no asking first (memory rule).
6. **NEVER add Co-Authored-By Claude lines** to any commit in Abdoulie's repos (memory rule).
7. **Read existing context fields before extending structure.** Roadmap weeks have `context` strings that already encode intent — read them before writing replacements.
8. **Audit before claiming "done".** Run `scripts/audit-prerequisites.js` and `scripts/audit-week-alignment.ts` after curriculum changes.
9. **Honesty on tool-output.** If an agent's summary differs from reality, surface it.

---

## 5 · Possible next steps (ranked)

Pick by your priority. Each has a rough cost estimate so you can size the session.

### A. Spread W1 D1 prereqs out (cosmetic, ~30 min)
**Why:** Some W1 D1s now hold 15-19 items because all prereqs cluster there. ml-engineering and DS are the worst.
**How:** Change one line in `scripts/fix-all-prereq-gaps.js` so the insertion target becomes `W(firstUseWeek - 1) Dlast` instead of `W1 D1`. Re-run; re-audit.
**Tradeoff:** Reads more naturally pedagogically but bloats different weeks. Reasonable people pick either.

### B. Resume Cloud / DevOps W3-W7 enrichment (active task, ~3-4 hours)
**Why:** Started but explicitly paused so the critical platform fixes shipped first. Task `#8` in the task list is still `pending`.
**How:** Follow the AI-eng W1-W5 script pattern (`scripts/ai-eng-w1-w5.js`). Reuse the L / V / S / E / D factory. Content already context-fielded in `devops-cloud.json` for W3-W7.
**Topics:** Edge Portfolio v0.3 (GitHub Actions CI/CD) → v0.4 (monitoring) → Docker fundamentals (W5-W7).

### C. Enrich AI-eng W6-W24 (large, ~12-15 hours)
**Why:** AI-eng has the same outline-only weeks problem DevOps did before W1-W2 were rebuilt. W1-W5 are enriched (Polyglot arc); W6+ are still stub-shaped.
**How:** Same factory pattern. Group into 5-week batches.

### D. Enrich the remaining 6 tracks (very large, ~50+ hours)
ML-eng, Full-stack, Mobile, Cyber, BI, AI-automation. Each ~24 weeks. Do in 5-week batches per track. Audit clean now but content quality is uneven.

### E. Build the prerequisite-LOCKING system (medium, ~6-8 hours)
**Why:** The audit catches gaps at curriculum-edit time. The next layer is a real RUNTIME check that prevents students from opening lesson N before prerequisite lesson M is done.
**How:**
- New Prisma model `ConceptPrerequisite { conceptId, prerequisiteConceptId, trackId }`.
- Migration.
- Concept IDs: derive from week + day + item index OR add explicit `conceptId` to lesson items.
- In `WeekPageTabs.tsx`: query completion status of prerequisites for each lesson; lock + show "Complete X first" message if not done.
- Reseed prereqs from `scripts/audit-prerequisites.js`'s detection logic.
**Notes:** The user explicitly asked for this earlier. I held off because it's a big feature build that needs schema migration; the audit was the cheaper, immediate win. This is the natural next step once content debt is paid down.

### F. Build a "resource library → lesson" auto-matcher (medium, ~4-6 hours)
**Why:** The user mentioned providing NumPy videos as resources that the platform did not surface in lessons. There's currently NO matching logic between `MentorResource` / `Task.resources[]` and lesson item slots in the curriculum JSON.
**How:**
- Schema: add a "concept tag" field to `MentorResource` or `OrgResource`.
- API: when rendering a lesson, query resources tagged with the lesson's concept; surface them as additional video / reading items.
- UI: render the matched resource alongside the curated items in `WeekPageTabs`.
- Caveat: this conflicts with the JSON-as-source-of-truth design of the curriculum. Decide first whether resources should LIVE in the JSON (current) or be DB-overlay (this feature).

### G. Cleanup: scripts/v2/ vs. scripts/ root
**Why:** Curriculum scripts are now scattered: `scripts/v2/` (older), `scripts/ds-w*.js`, `scripts/ai-eng-w1-w5.js`, `scripts/ds-w2-numpy-*.js`, `scripts/fix-all-prereq-gaps.js`. Convention is unclear.
**How:** Move all per-track / per-week scripts to `scripts/curriculum/<track>/` and rename for consistency. Keep one-shot audits at `scripts/` root.

### H. Unused imports + small audit cleanup (~30 min)
`npx tsc --noEmit` is clean as of `edfa27d`, but `eslint` may flag dead imports left behind from the W1 D1 prepend refactor. Quick pass.

---

## 6 · Repo geometry (quick reference)

```
OneDrive/Desktop/FORGE/
├── HANDOFF.md                          ← you are here
├── prisma/schema.prisma                ← all models
├── src/
│   ├── app/
│   │   ├── dashboard/                  ← mentor + student dashboards
│   │   ├── learn/[slug]/[week]/        ← student week view (uses WeekPageTabs)
│   │   ├── api/
│   │   │   ├── checkins/route.ts       ← submission upsert
│   │   │   ├── mentee/review-answers/  ← answer submission upsert
│   │   │   ├── mentor/tasks/[id]/      ← reopen / verify / etc.
│   │   │   └── mentor/reviews/         ← grading
│   │   └── globals.css                 ← .forge-panel-link, .forge-code-* rules
│   └── components/
│       ├── WeekPageTabs.tsx            ← lesson stream + tabs + pager
│       ├── ForgeMarkdown.tsx           ← lesson body renderer + code blocks
│       ├── VideoEmbed.tsx              ← YouTube/Loom player
│       └── ResourceViewer.tsx          ← modal viewer + YouTube fallback
├── data/roadmaps/
│   ├── data-science.json               ← 43 weeks, enriched
│   ├── ai-engineering.json             ← 24 weeks (W1-W5 enriched)
│   ├── devops-cloud.json               ← 24 weeks (W1-W2 enriched)
│   └── ... 7 more tracks
└── scripts/
    ├── audit-week-alignment.ts         ← context-vs-topics audit
    ├── audit-prerequisites.js          ← prereq audit (this session)
    ├── fix-all-prereq-gaps.js          ← one-shot closer (this session)
    ├── ds-w*.js                        ← DS week builds
    ├── ai-eng-w1-w5.js                 ← AI-eng W1-W5 build
    ├── ds-w2-numpy-prereq.js           ← DS W2 NumPy lesson prepend
    ├── ds-w2-numpy-video.js            ← DS W2 NumPy video insertion
    └── v2/                             ← older handoff + v2 rewrite scripts
```

---

## 7 · Working agreement (pick up here)

When resuming any of A-H:

1. Read this file's "Constraints + conventions" section (§4).
2. `git pull` to be sure you're on `edfa27d` or later.
3. Run `npx tsc --noEmit` to confirm a clean baseline.
4. Run `node scripts/audit-prerequisites.js` to confirm 0 / 0.
5. Pick a numbered next step. Do not duplicate work — check existing scripts and components before writing new ones.
6. After any curriculum edit, re-run both audits before declaring done.
7. Commit + push. No `Co-Authored-By: Claude` lines (memory rule).

That's the boilerplate. The next four sections are the **bar** — read them before touching curriculum.

---

## 8 · The bar — what "enriched" actually means

This is the non-negotiable standard for every week shipped on every track. If a week does not pass this rubric, it is not done. **Coursera, Udemy, freeCodeCamp, every bootcamp — they are the floor, not the target. The Forge is what those wished they could be.**

### 8.1 Per-week structure
Every enriched week is exactly:

| Field | Requirement |
|---|---|
| `number` | sequential int |
| `title` | concrete + specific. "Polyglot v0.3: Build an eval set" — not "Week 3: Evaluation". |
| `phase` | the high-level grouping (`Foundations`, `Building with LLMs`, `Causal ML`, etc.) |
| `commitment_hours` | honest range, e.g. `"12-18"`. Don't lie about effort. |
| `context` | 4-6 paragraphs. The mentor's framing — why this week, what changes, what's at stake. **Preserve existing context fields** when patching — they're intentional design. |
| `concept_check` | **exactly 3 entries**. Each is `{ q, choices: [4 strings], correct: 0-3, explain: 2-4 sentences }`. The `explain` must teach the WHY, not just the answer. |
| `days` | **exactly 7 entries**. NO exceptions. NO "Day 0" inserts. NO extension to 8 days. If a track has W1 D0 today (some legacy weeks) that's grandfathered, but new builds are 7 days. |

### 8.2 Per-day structure
Every day:

| Field | Requirement |
|---|---|
| `number` | 1-7 |
| `title` | sharp. "Build the dual-call function" — not "More API stuff". |
| `summary` | one-line setup. What does this day accomplish? Optional but encouraged. |
| `items` | array of 3-6 items. The teach→reinforce→ship rhythm. |

### 8.3 Item kinds + the teach pattern
Every day uses some mix of these kinds. The standard rhythm per day is: **lesson → (optional video) → (optional reading) → swipe → exercise**. The factory in `scripts/ai-eng-w1-w5.js` is the canonical pattern:

```js
const L  = (title, body) => ({ kind: 'lesson', title, body });
const V  = (title, url, dm, creator, why) => ({ kind: 'video', title, url, duration_min: dm, creator, why });
const R  = (title, url, why) => ({ kind: 'reading', title, url, why });
const S  = (cards) => ({ kind: 'swipe', title: 'Quick check — swipe to answer', cards });
const E  = (title, body) => ({ kind: 'exercise', title, body });
const Re = (title, body) => ({ kind: 'reflection', title, body });
const D  = (number, title, summary, items) => ({ number, title, summary, items });
```

Item-level requirements:

| Kind | What's required |
|---|---|
| `lesson` | Markdown body. Sub-headings via `## What it is` / `## Why it matters` / `## See it in code`. Code blocks are real, runnable, with expected output. Teach FROM ZERO — assume nothing. |
| `video` | Real, verifiable URL. Real creator name. Real duration. `why` field explains when in the day to watch + what it adds. **Hard cap: 15 min. Strongly preferred: ≤10 min. Sweet spot: 5 min.** Fireship "X in 100 Seconds" is the gold standard. |
| `reading` | Canonical docs URL. Not blogspam. `why` field explains where in the day to read + what to skim vs skip. |
| `swipe` | Array of **3 cards**. Each card: `{ prompt: string, answer: boolean, whenRight: string, whenWrong: string }`. Both feedback strings teach — they don't just say "yes" or "no". |
| `exercise` | Body uses tag-prefix: `[CODE]` for write-code tasks, `[WRITE]` for documents/markdown, `[PRODUCE]` for ship-it asks. Includes `PASS:` checklist when applicable. |
| `reflection` | Open prompt, 2-5 sentences asked. For end-of-week retros or self-audits. |

### 8.4 Project arc
Every track has a continuous **project arc** that ships incrementally:
- DS: TaxiPulse → Reddit Sentiment → Energy Forecast → Capstone (v0.1 → v1.0 → v1.0-extended)
- AI-eng: Polyglot v0.1 → v0.2 → v0.3 → v0.4, then dual-console v1.0
- DevOps: Edge Portfolio v0.1 → v0.2 → v0.3 → v0.4
- Each version shipped: a real public URL or repo with a tag.
- Every project ends with a written **retro** (what worked / what didn't / what next).

### 8.5 Video rules — non-negotiable
1. **Real videos only.** If you are not sure the URL works, **don't include the video.** Replace with a richer text lesson + a canonical docs reading. This session removed 33 unverified video URLs across DS and AI-eng — see §11.5 for the lesson.
2. **No fabrications.** Don't invent creators. Don't invent durations. Don't invent titles.
3. **Hard cap: 15 minutes.** Preferred ≤10. Best ≤5.
4. **No crash courses.** No "freeCodeCamp 4-hour tutorial". Short, sharp, focused — the antithesis of bootcamp video walls.
5. **No YouTube search-URL videos.** A `youtube.com/results?search_query=...` URL is not a video — it's a search page. The VideoEmbed component falls back to "Open" link card for these, which functions but is a poor student experience. Use a real video or skip the video entirely.
6. **Confident video URL library** (the `KNOWN_GOOD` set in `scripts/audit-videos.js` — use these freely):
   - Fireship — "X in 100 Seconds" series: **Git** `hwP7WQkmECE`, **SQL** `zsjvFFKOm3c`, **Docker** `Gjnup-PuquQ`, **Pandas** `dcqPhpY7tWk`. Always ≤2 min. URL pattern checked.
   - 3Blue1Brown — Essence of Linear Algebra Ep 1: **Vectors** `fNk_zzaMoSs`. ~15 min. Visual gold.
   - Python Programmer (Giles McMullen-Klein) — **Learn NumPy in 5 minutes** `xECXZ3tyONo`. ~5 min.
7. **If no confident URL exists for a tool** (scikit-learn, matplotlib, OpenAI SDK currently fall here), DON'T add a video. Write the lesson rich enough that no video is needed, link the official docs.
8. **Two audit + cleanup scripts** live in `scripts/`:
   - `audit-videos.js` — lists every video URL across all tracks and flags any YouTube ID not in `KNOWN_GOOD` as "REVIEW". Spot-check those in a browser before declaring them safe.
   - `remove-videos-by-id.js` — takes a list of YouTube IDs and removes those video items from every track in one pass. Use this whenever you find a dead URL.

### 8.6 The teach-from-zero rule
Before any concept appears in code, the student must have been taught it. This is enforced by `scripts/audit-prerequisites.js`. If you reference `np.dot` in a code block, NumPy must have been taught earlier (same week or prior week — same week is acceptable if the teach lesson comes BEFORE the using lesson in the items array). Currently audit-clean at 0 / 0; **keep it that way.**

### 8.7 Honest weakness rule
Every project, every retro, every blog post in the curriculum content includes a "what didn't work / what I'd do differently" section. We teach honest engineering, not marketing.

### 8.8 What we are NOT
- We are not a tutorial site. Tutorials teach syntax; we teach engineering.
- We are not a video platform. Video is a tool, not the spine. The spine is the lesson + the project.
- We are not a bootcamp. Bootcamps are graded on completion; we are graded on whether the student can ship the project, defend it, and write about it credibly.
- We are not Coursera-with-better-design. Coursera is broad-and-shallow. We are narrow-and-deep — 30-43 weeks per track, deep enough to make a hire.

---

## 9 · Track enrichment status — granular

The audit (`scripts/audit-prerequisites.js`) is clean at 0 / 0. That tells you tools are in place; it does **not** tell you whether the week's *content* is at §8 bar yet.

Status per track (as of 2026-06-05):

### data-science (43 weeks) — ENRICHED, ABOVE THE BAR
- W1-W43 all rebuilt to teach→swipe→project standard in this session and prior.
- 4 shipped projects across the arc: TaxiPulse · Reddit Sentiment · Energy Forecast · Capstone (v1.0 + v1.0-extended).
- 4 specialty deep-dives: RL (W40), Recsys (W41), Distributed ML (W42), Privacy/DP (W43).
- Senior-DS layer: Causal Inference (W35), ML Fairness (W36), Capstone Extended (W37-W39).
- **Status: production-quality. Reference for what "enriched" looks like.**

### ai-engineering (24 weeks) — PARTIAL
- W1-W5 enriched this session (`scripts/ai-eng-w1-w5.js`):
  - W1 Polyglot v0.1 (terminal translator + env discipline + cost tracking)
  - W2 Polyglot v0.2 (Streamlit + multi-language + deploy)
  - W3 Polyglot v0.3 (20-case eval set + LLM-as-judge)
  - W4 Polyglot v0.4 (prompt-injection defence + THREAT_MODEL.md)
  - W5 Side-by-side OpenAI + Anthropic console
- **W6-W24 STILL STUB-SHAPED.** Context fields exist; days exist; but item bodies are short / placeholder. Same enrichment effort as DevOps W1-W2 took.
- Topics for W6+: Structured Outputs (W6), Streaming + Cost (W7), Embeddings, RAG, Agents, MCP, Voice, Vision, Fine-tuning, Evals at scale, Production ops.

### devops-cloud (24 weeks) — PARTIAL, ABOVE-BAR W1-W2 ONLY
- W1 ("What a server actually is") — enriched, 8 days, 9 lessons.
- W2 ("Edge Portfolio v0.2: Custom domain + HTTPS") — enriched, 7 days, 7 lessons.
- **W3-W24 stub-shaped.** W3-W7 explicitly paused mid-session (task #8) to let the platform fixes ship first.
- Topics that need real enrichment: W3 GitHub Actions CI/CD, W4 Monitoring + logs, W5 Docker fundamentals, W6 Docker Compose + inner loop, W7 Image hardening + Trivy + SBOM, W8+ Terraform / IaC, Kubernetes basics, EKS/GKE, secrets, observability, SRE patterns.

### data-analysis (28 weeks) — ENRICHED, ABOVE THE BAR
- W1-W28 all rebuilt to teach→swipe→project standard (Abdoulie confirmed in this session).
- Project arc: Superstore v0.1 → v1.0 across W1-W17 (Excel → pandas → SQL → dashboards), then capstone weeks.
- W1 D1 prereqs (NumPy, matplotlib, Git, SQL) prepended in this session to satisfy the prereq audit; the rest of the track was already enriched.
- **Status: production-quality. Same reference tier as data-science.**

### ml-engineering (24 weeks) — STUB + PREREQS
- This session added W1 D1 prereqs (pandas, scikit-learn, matplotlib, PyTorch, Git).
- **W1-W24 lessons need §8 enrichment.**
- Project arc to design: from sklearn baseline → distributed training → MLOps platform with monitoring + retraining.

### full-stack-web (24 weeks) — STUB + PREREQS
- This session added W1 D1 prereqs (Git, SQL).
- **W1-W24 lessons need §8 enrichment.**
- Project arc to design: probably a SaaS scaffolding (Next.js + Postgres + auth) shipped weekly to v1.0.

### mobile-engineering (24 weeks) — STUB + PREREQS
- This session added W1 D1 prereqs (Git, SQL).
- **W1-W24 lessons need §8 enrichment.**
- Project arc to design: cross-platform (React Native / Expo) app shipped to TestFlight + Play Console.

### cybersecurity (24 weeks) — STUB + PREREQS
- This session added W1 D1 prereq (Git).
- **W1-W24 lessons need §8 enrichment.**
- Project arc to design: from network scanning → web app pentest → blue-team detection → published security report.

### bi-analytics (17 weeks) — STUB + PREREQS
- This session added W1 D1 prereq (Git).
- **W1-W17 lessons need §8 enrichment.**
- Project arc to design: Power BI / Tableau / Looker dashboards from a real public dataset shipped weekly.

### ai-automation (20 weeks) — STUB + PREREQS
- This session added W1 D1 prereqs (NumPy, Docker, Git, SQL).
- **W1-W20 lessons need §8 enrichment.**
- Project arc to design: end-to-end automation pipeline (n8n / Zapier / custom) ending in a shipped agent.

### Track enrichment summary
| Track | Bar-quality | Stub + prereqs | Roughly to do |
|---|---|---|---|
| data-science | W1-W43 (all 43) | — | 0 weeks |
| data-analysis | W1-W28 (all 28) | — | 0 weeks |
| ai-engineering | W1-W5 | W6-W24 | **19 weeks** |
| devops-cloud | W1-W2 | W3-W24 | **22 weeks** |
| ml-engineering | — | W1-W24 | **24 weeks** |
| full-stack-web | — | W1-W24 | **24 weeks** |
| mobile-engineering | — | W1-W24 | **24 weeks** |
| cybersecurity | — | W1-W24 | **24 weeks** |
| bi-analytics | — | W1-W17 | **17 weeks** |
| ai-automation | — | W1-W20 | **20 weeks** |
| **TOTAL REMAINING** | | | **~174 weeks** |

At a steady 5-week-per-script-batch cadence: ~35 batches. Plan accordingly. This is the work.

---

## 10 · The voice — match this, not that

The lesson body voice is **a mentor talking to a friend over coffee.** Read `scripts/v2/ds-w01.ts`, `scripts/ds-w26-w29.js`, `scripts/ai-eng-w1-w5.js` (the W1 Polyglot week is a clean reference) before writing anything new.

**Do this:**
- Direct address. "You will" / "Don't do X" / "Here's why."
- Concrete numbers. "MAE 612 vs 868" — not "improved significantly".
- Named tradeoffs. "Prophet costs interpretability for X; we accept that."
- Honest weakness. "The model still under-predicts on heatwaves" — not "future work needed".
- Real code with expected output as comments.
- One idea per sub-section. `## What it is` / `## Why it matters` / `## See it in code` / `## When you'll see this next`.
- Short paragraphs. 2-4 sentences max.

**Don't do this:**
- "In this lesson we will learn how to…" (passive academic voice)
- "Leveraging cutting-edge AI" (marketing buzzwords)
- "It's important to note that…" (filler)
- Code without expected output
- "Further research is needed" (vague non-conclusions)
- Long Coursera-style paragraphs with one idea per page
- "Crash course on X" (the antithesis of our standard)
- Emojis. None. Ever. (Forbidden in code per the system prompt.)

**Specific rules baked into the bar:**
- Every code block compiles or runs. Show expected output as a comment.
- Every numeric claim has a source. "$0.15 / 1M input + $0.60 / 1M output" not "cheap".
- Every retro names what didn't work, not just wins.
- Every video item's `why` field tells the student when to watch + what to listen for.

---

## 11 · Failure modes — things every session MUST know

Compiled from real mistakes this and prior sessions. Don't repeat any of these.

### 11.1 Curriculum failure modes
1. **Don't fabricate URLs.** Especially YouTube URLs. If you are not confident a URL works, leave the video out. The user repeatedly emphasised this: "you will not lie about video length."
2. **Don't invent creator names or durations.** Same reason.
3. **Don't assume the student knows a tool.** Teach from zero. The NumPy gap in DS W2 was a real student-confusion event that drove this rule.
4. **Don't add new days.** Items can grow inside an existing day; the count of days per week never changes. "ONE THING, NO CREATION OF ADDITIONAL DAYS" — direct quote.
5. **Don't skip the audit.** Run `node scripts/audit-prerequisites.js` after every curriculum patch. Should print `0 CRITICAL · 0 HIGH`.
6. **Don't drop concept_check entries.** Every enriched week has exactly 3.
7. **Don't use crash-course videos.** 4-hour freeCodeCamp specials are the opposite of our bar. ≤15 min hard cap.
8. **Don't lose existing context fields.** When patching a week, preserve `week.context` (it encodes intent). Same for `phase`, `commitment_hours`.

### 11.2 Codebase failure modes
1. **Check for existing components before building.** Don't duplicate. `ForgeMarkdown`, `VideoEmbed`, `ResourceViewer`, `WeekPageTabs`, `forge-panel-link` — all exist; use them.
2. **Don't pre-commit secrets.** `.env` files, API keys, AWS credentials — never staged. Check `.gitignore` before adding a credential-bearing file.
3. **Don't write to `data/roadmaps/*.json` by hand.** Use a script. Scripts are committed and rerunnable; hand-edits are not auditable.
4. **Don't break idempotency.** Every patch script must skip on re-run. The check is usually "does the marker title/lesson already exist?"
5. **Don't add `Co-Authored-By: Claude` lines** to any commit. Memory rule, repeated.
6. **Don't push without `npx tsc --noEmit`** clean. This caught real bugs in this session.
7. **Don't use inline styles for things CSS classes already handle.** `.forge-panel-link`, `.forge-code-block`, `.forge-code-line`, `.forge-code-gutter` exist for this. Use them.
8. **Don't break the upsert invariant.** `Checkin` is one row per `(userId, taskId)`. Submission endpoints upsert; reopen resets in place. Adding a code path that inserts new Checkins re-introduces the duplication bug we already fixed.

### 11.3 Process failure modes
1. **Don't trust agent summaries blindly.** When you delegate to an Agent tool, the summary describes intent — not necessarily reality. Verify the actual files.
2. **Don't ask questions the context already answers.** The roadmap `week.context` field encodes intent. Read it before asking the user how things connect (memory rule: "Read context fields first").
3. **Don't commit without pushing.** Abdoulie's rule: commit AND push by default. No asking first.
4. **Don't claim "done" without receipts.** The audit output, the tsc output, the file diff — show them.
5. **Don't paste literal Loom / screenshot requests at Abdoulie.** "You will not send me screenshots. You will not send me Loom videos. I cannot provide those and I do not want them. You will write a clear summary of what you changed." Direct quote.

### 11.5 Video failure modes — the dead-URL lesson
1. **Don't fabricate YouTube IDs from memory.** This session shipped 33 video items with URLs picked from memory; a student found at least one dead one. All 33 were removed by `scripts/remove-videos-by-id.js` and the trust cost was real. Lesson: only ship a video URL after viewing it in a browser.
2. **A YouTube search URL is not a video.** `youtube.com/results?search_query=...` opens a search page. Don't paper over a missing video with a search link.
3. **Use the `KNOWN_GOOD` allowlist.** It is in `scripts/audit-videos.js`. Adding to that list is a deliberate act — only after viewing the URL.
4. **Run `node scripts/audit-videos.js` after any video-adding patch.** Any REVIEW count > 0 means you have unverified URLs in the curriculum.
5. **When asked to "replace" a removed video — be honest.** If you don't have a confident URL, DO NOT invent one to look responsive. Thicken the lesson body (the in-text material a video would carry: diagrams in ASCII, contrast examples, mental models) and add a canonical docs reading. See `scripts/ai-eng-w1-d1-thicken.js` for the exact pattern. The student gets the same content; the curriculum stays truthful.

### 11.4 Voice failure modes
1. **Don't bury the lead.** First sentence of every lesson says what's in it.
2. **Don't write academic prose.** "In this lesson we will explore the foundations of…" — no.
3. **Don't write marketing.** "Leveraging the power of…" — no.
4. **Don't lie about tool quality.** If a model is mediocre at a task, say so. Honest engineering > polish.
5. **Don't pad weeks to hit a target length.** A 5-day enriched week is better than a 7-day padded one. (That said, current bar IS 7 days; the point is don't pad each day with filler items.)

---

## 12 · Living-doc rule

> **Anything important shipped in any session goes here.** New convention, new failure mode, new decision the next session must inherit, new tool added to the audit, new track section completed.
>
> Edit this doc in the same commit. Don't lose the knowledge in chat logs.
>
> If the doc grows past ~600 lines, split — but never duplicate. Move older sections to `HANDOFF-archive-<date>.md` and link from the top of the canonical one.

---

That's the doc. Hand it to the next session and they can continue without re-asking what's done.
