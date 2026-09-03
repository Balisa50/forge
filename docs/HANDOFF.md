# FORGE — Rules

**This is the rulebook. State + history live in companion docs.**

| | What it is | When to open |
|---|---|---|
| **HANDOFF.md** (this file) | Rules. The bar. Voice. Failure modes. Conventions. Page + nav contracts. | Before any change. Re-grep specific sections by heading. |
| **STATE.md** | Live state. Curriculum status, platform map, repo geometry, ranked next steps. | Picking what to work on, orienting in the code. |
| **CHANGELOG.md** | Session-by-session "what shipped". Newest first. | Auditing the trail. Optional reading. |

> **Treat this doc as canonical.** Append a new rule only when one is actually discovered or contradicted. Don't dump session narrative here — that's CHANGELOG. Don't dump state — that's STATE. Keep this file at ~250 lines forever.

---

## §A · Table of contents

| § | Section | One line |
|---|---|---|
| §1 | Conventions | Behavioural rules every session inherits. |
| §2 | Page + nav contracts | One source of truth per piece of content. |
| §3 | Solo learner mode | What's hidden / swapped when no MentorLink exists. |
| §4 | The bar (curriculum quality) | Per-week + per-day + per-item requirements. |
| §5 | The voice | How lesson bodies are written. |
| §6 | Video discipline | Real URLs only. Hard cap 15 min. KNOWN_GOOD allowlist. |
| §7 | Failure modes | Concrete don'ts compiled from real mistakes. |
| §8 | Working agreement | Standard order for any session. |
| §9 | Living-doc rule | How this file is kept tight. |

Read §1 + §8 always. Grep §2-§7 by topic.

Companion: `scripts/v2/HANDOFF.md` (older v2-rewrite arc, scoped). `CLAUDE.md` memory file holds Abdoulie's persistent preferences.

---

## §1 · Conventions

1. **Check first, then build.** Search the codebase for the feature before assuming it doesn't exist. Don't duplicate.
2. **No new days.** All curriculum patches add items inside existing day arrays. Day counts per week never change.
3. **No mediocrity.** Lessons teach from zero; videos are real; URLs aren't fabricated.
4. **Always push.** Commit AND push by default. No asking first. No `Co-Authored-By: Claude` lines.
5. **Read context fields before extending structure.** Roadmap weeks have `context` strings that encode intent. Read them before asking the user how things connect.
6. **Audit before claiming done.** Run `scripts/audit-prerequisites.js` (must be 0 / 0) and `npx tsc --noEmit` (must be clean) after every change.
7. **Don't write `data/roadmaps/*.json` by hand.** Use an idempotent script. Scripts are committed and re-runnable; hand-edits aren't auditable.
8. **Don't pre-commit secrets.** `.env`, API keys, AWS creds — never staged. Check `.gitignore` before adding credential-bearing files.
9. **No screenshots, no Loom in summaries.** Abdoulie cannot provide them and explicitly doesn't want them. Plain-text summaries only.
10. **Don't trust agent summaries blindly.** When delegating to an Agent tool, verify the actual file diff.
11. **Don't claim done without receipts.** Audit output, tsc output, file diff — show them.

---

## §2 · Page + nav contracts

**Never render the same content in two places.** Hard contracts:

| Page | Owns | Must NOT render |
|---|---|---|
| Dashboard `/dashboard` | Forge Pact · **Current Focus** (title + Resume button) · Check-in CTA · Progress + Deadline row. Order: Pact → Returning → Current Focus → Check-in → Progress. | Track-progress bars (live on roadmap). Recent Sessions (lives on Journal). Inline week lessons. Long `task.detail` dumps. |
| Roadmap `/dashboard/roadmap` | **Journey** node map only — vertical timeline. Unlocked nodes link to `/learn/<slug>/<weekNumber>`. | Track tabs. Phase accordion. Per-task inline `WeekPageTabs`. Per-task resource lists. |
| Week `/learn/<slug>/<week>` | Tabs (Content · Submission · optional Mentor Review). Lesson stream. Prev/Next pager scoped to Content tab only. | Anything that belongs to the dashboard summary. |
| Journal `/dashboard/journal` | Permanent session record. One row per (user, task), deduped. | Mentor-dashboard widgets. |

**Navigation contract:** every "back" arrow on the week page goes to `/dashboard`. Solo + mentee alike. Never to `/learn/<slug>` (public curriculum index).

---

## §3 · Solo learner mode

Detected by **absence of any active `MentorLink` where the viewer is `menteeId`**. Includes the mentor-who-also-learns case (`isAlsoLearning = true` with no inbound mentor).

When solo:
- `WeekPageTabs` hides the **Mentor Review** tab. Only Content + Submission render.
- Submission tab swaps to a `SoloCompletePanel` widget: optional Proof URL input + **Mark Complete** button.
- Mark Complete calls `POST /api/me/mark-week-complete` → verifies task ownership → refuses if any active MentorLink exists (mentor path is the only legitimate verifier when one exists) → upserts the Checkin (`evidenceType: "self_complete"`) → flips `Task.status = "verified"`. Idempotent.
- **Never assume a mentor exists.** No mentor questions, no mentor ratings, no pending reviews, no send-back buttons. The platform gets out of the way.

---

## §4 · The bar — what "enriched" means

**Not Coursera. Not Udemy. Not a bootcamp.** Those are the floor.

### Per-week structure
| Field | Requirement |
|---|---|
| `number` | sequential int |
| `title` | concrete + specific. "Polyglot v0.3: Build an eval set" — not "Week 3: Evaluation". |
| `phase` | high-level grouping (`Foundations`, `Building with LLMs`, etc.) |
| `commitment_hours` | honest range, e.g. `"12-18"`. Don't lie about effort. |
| `context` | 4-6 paragraphs. Mentor's framing. **Preserve when patching** — it encodes intent. |
| `concept_check` | **exactly 3** entries. Each: `{ q, choices: [4 strings], correct: 0-3, explain: 2-4 sentences }`. The `explain` teaches WHY, not just the answer. |
| `days` | **exactly 7** entries. No exceptions. No "Day 0" inserts. |

### Per-day structure
- `number` 1-7. `title` sharp. `summary` optional one-liner. `items` array of 3-6.
- Standard rhythm: **lesson → (optional video) → (optional reading) → swipe → exercise**.

### The factory (canonical pattern — `scripts/ai-eng-w1-w5.js`)
```js
const L  = (title, body) => ({ kind: 'lesson', title, body });
const V  = (title, url, dm, creator, why) => ({ kind: 'video', title, url, duration_min: dm, creator, why });
const R  = (title, url, why) => ({ kind: 'reading', title, url, why });
const S  = (cards) => ({ kind: 'swipe', title: 'Quick check — swipe to answer', cards });
const E  = (title, body) => ({ kind: 'exercise', title, body });
const Re = (title, body) => ({ kind: 'reflection', title, body });
const D  = (number, title, summary, items) => ({ number, title, summary, items });
```

### Per-item requirements
| Kind | Required |
|---|---|
| `lesson` | Markdown body. Sub-headings: `## What it is` / `## Why it matters` / `## See it in code` / `## When you'll see this next`. Code blocks runnable with expected output as comments. Teach **from zero** — assume nothing. |
| `video` | Real URL. Real creator. Real duration. `why` field tells the student when to watch + what to listen for. See §6. |
| `reading` | Canonical docs URL. Not blogspam. `why` field tells skim vs skip. |
| `swipe` | Exactly **3 cards**. Each: `{ prompt, answer: bool, whenRight, whenWrong }`. Both feedback strings teach. |
| `exercise` | Body starts with tag: `[CODE]`, `[WRITE]`, or `[PRODUCE]`. Include `PASS:` checklist when applicable. |
| `reflection` | Open prompt. 2-5 sentences asked. Used for retros + self-audits. |

### The teach-from-zero rule
Before any concept appears in code, the student has been taught it. Enforced by `scripts/audit-prerequisites.js` (must remain at 0 / 0).

### Honest weakness
Every project, every retro, every blog post includes a "what didn't work / what I'd do differently". We teach honest engineering, not marketing.

### What we are NOT
Not a tutorial site (we teach engineering, not syntax). Not a video platform (lesson + project are the spine). Not a bootcamp (we're graded on ship + defend + write credibly, not completion). Not "Coursera with better design" (we're narrow-and-deep — 17–43 weeks per track, deep enough to make a hire).

---

## §5 · The voice

**A mentor talking to a friend over coffee.** Reference files: `scripts/v2/ds-w01.ts`, `scripts/ds-w26-w29.js`, `scripts/ai-eng-w1-w5.js` (W1 Polyglot is a clean read).

**Do:**
- Direct address. "You will" / "Don't do X" / "Here's why."
- Concrete numbers. "MAE 612 vs 868" — not "improved significantly".
- Named tradeoffs. "Prophet costs interpretability for X; we accept that."
- Honest weakness. "The model still under-predicts on heatwaves" — not "future research".
- Real code with expected output as comments.
- One idea per sub-section. Short paragraphs, 2-4 sentences max.

**Don't:**
- "In this lesson we will learn how to…" (academic passive)
- "Leveraging cutting-edge AI" (marketing)
- "It's important to note that…" (filler)
- Code without expected output
- "Further research is needed" (vague non-conclusion)
- Long Coursera-style paragraphs
- "Crash course on X"
- Emojis. None. Ever.

**Also:**
- Every numeric claim has a source ("$0.15 / 1M input + $0.60 / 1M output", not "cheap").
- Every retro names what didn't work.
- Every video item's `why` field says when to watch + what to listen for.

---

## §6 · Video discipline

1. **Real videos only.** Not sure a URL works? Don't include the video. Thicken the lesson body + link the canonical docs instead.
2. **No fabrications.** No invented creators, durations, or titles.
3. **Hard cap: 15 minutes.** Preferred ≤10. Best ≤5. **Single sanctioned exception:** Andrej Karpathy's "Intro to Large Language Models" (60 min, `zjkBMFhNj_g`) — canonical field overview, first ~20 min covers essentials, `why` field tells student to chapter-watch. **Don't expand this exception.**
4. **No crash courses.** No "freeCodeCamp 4-hour tutorial". Short, sharp, focused.
5. **No YouTube search-URL videos.** `youtube.com/results?search_query=...` is a search page, not a video. Use a real video or skip.
6. **KNOWN_GOOD allowlist** lives in `scripts/audit-videos.js`. Add to it ONLY after viewing the URL in a browser. Current set:
   - Fireship "X in 100 Seconds": **Git** `hwP7WQkmECE`, **SQL** `zsjvFFKOm3c`, **Docker** `Gjnup-PuquQ`, **Pandas** `dcqPhpY7tWk`.
   - 3Blue1Brown — Essence of Linear Algebra Ep 1: **Vectors** `fNk_zzaMoSs`.
   - Python Programmer — **NumPy in 5 minutes** `xECXZ3tyONo`.
   - Karpathy — **Intro to LLMs** `zjkBMFhNj_g` (the 60-min exception).
7. **Audit/cleanup scripts:**
   - `scripts/audit-videos.js` — lists every video URL across all tracks; flags any ID not in KNOWN_GOOD as REVIEW.
   - `scripts/remove-videos-by-id.js` — drops video items by YouTube ID across every track in one pass. Idempotent, supports `--dry-run`.

When asked to "replace" a removed video, **don't invent one to look responsive.** Thicken the lesson (ASCII diagrams, contrast examples, mental models) + add a canonical docs reading. Pattern: `scripts/ai-eng-w1-d1-thicken.js`.

---

## §7 · Failure modes

Compiled from real mistakes. Don't repeat any of these.

### Curriculum
- Fabricated YouTube IDs (33 removed in one session — the trust cost was real).
- Adding new days to a week. The "ONE THING, NO CREATION OF ADDITIONAL DAYS" rule is hard.
- Assuming the student knows a tool. Audit `scripts/audit-prerequisites.js` after every change; should print 0/0.
- Dropping `concept_check` entries. Every enriched week has exactly 3.
- Crash-course videos. ≤15 min hard cap. The 60-min Karpathy exception is named in §6 and does not generalize.
- Losing existing context fields. Preserve `week.context`, `phase`, `commitment_hours` when patching.

### Codebase
- Building before checking. `ForgeMarkdown`, `VideoEmbed`, `ResourceViewer`, `WeekPageTabs`, `.forge-panel-link`, `.forge-code-block` all already exist — use them.
- Inserting new Checkin rows. **Always upsert by `(userId, taskId)`.** Submission endpoints upsert; reopen resets in place. Breaking this invariant re-introduces the duplication bug.
- Inline styles for things CSS classes already handle.
- Pushing without `npx tsc --noEmit` clean.
- **`<table width="100%">` for any "gutter + content" layout.** Browser auto-layout sizes columns by content length, so identical components render at different x-positions depending on the data inside. Use `display: flex` with a fixed-width first child instead. (Hit us on `CodeBlock` — single-line blocks centred while multi-line blocks left-aligned; fixed in `bf46967`.)
- **Critical layout via Tailwind arbitrary values (`max-w-[1200px]`) without a CSS-class backup.** JIT class generation can fail silently on a given Vercel build. For layout caps that MUST hold (the 1200 px container), use inline `style` or a defined CSS class. (Hit us twice — fixed in `ab0053e`.)

### Process
- Asking the user something the `week.context` field already answers.
- Committing without pushing.
- Trusting agent summaries blindly — verify the actual file diff.
- Adding `Co-Authored-By: Claude` to commits — never.

### Voice
- Burying the lead. First sentence of every lesson says what's in it.
- Academic prose ("we will explore the foundations of…").
- Marketing ("leveraging the power of…").
- Lying about tool quality. Honest assessment > polish.
- Padding weeks with filler items to hit a length target.

---

## §8 · Working agreement

When resuming any task:

1. Read this file's §1 (Conventions) + §2 (Page contracts) + §6 (Video discipline) + §7 (Failure modes). Grep targeted sections; don't re-read the whole doc.
2. Read `STATE.md` to know what's in play right now.
3. `git pull` to a clean tree.
4. Run `npx tsc --noEmit` — must be clean.
5. Run `node scripts/audit-prerequisites.js` — must be 0 / 0.
6. Pick a next step from `STATE.md` §3 (or ask). Don't duplicate; grep the codebase before writing new components.
7. After any curriculum edit: re-run both audits. After any code edit: re-run tsc.
8. Commit + push. No `Co-Authored-By` lines (memory rule).
9. Append a one-line entry to `CHANGELOG.md` for the session. Update `STATE.md` if state changed. Append a new rule to this file ONLY if a new convention was discovered or contradicted.

---

## §9 · Living-doc rule

> **This file is rules only.** Aim for ~250 lines forever. If a session's work doesn't reveal a new rule, don't add anything here — update `STATE.md` or `CHANGELOG.md` instead.
>
> If a section's content depends on the current state of the code or curriculum, it belongs in `STATE.md`. If it's a chronological "what shipped", it belongs in `CHANGELOG.md`.
>
> If this file ever exceeds ~350 lines, the next session must consolidate — duplicates collapse, stale rules are removed, near-identical bullets merge. Splitting deeper than this three-doc model is over-engineering; tightening is the right move.
