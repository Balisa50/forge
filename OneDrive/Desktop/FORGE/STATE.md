# FORGE — Live State

**This is the state map.** What exists right now, what's done, what's next. Updated (not appended) each session that changes something. Rules live in `HANDOFF.md`; history lives in `CHANGELOG.md`.

> **Update discipline:** if a section here is wrong, fix it in the same commit that made it wrong. Don't let state drift.

---

## §1 · Curriculum enrichment status

Track-by-track. "Bar-quality" = passes every check in `HANDOFF.md §4`. "Stub + prereqs" = base outline + Day-1 prerequisite lessons inserted (audit-clean) but week bodies still need §4 enrichment.

| Track | Weeks | Status | Notes |
|---|---|---|---|
| data-science | 43 | **Bar-quality**, W1-W43 | Reference for what "enriched" looks like. |
| data-analysis | 28 | **Bar-quality**, W1-W28 | Superstore v0.1 → v1.0 arc through W17, then capstone. |
| ai-engineering | 24 | Partial — W1-W5 bar-quality | Polyglot v0.1 → v0.4 + dual-console v1.0. W6-W24 stub. |
| devops-cloud | 24 | Partial — W1-W2 bar-quality | Edge Portfolio v0.1 → v0.2. W3-W24 stub. |
| ml-engineering | 24 | Stub + prereqs | Prereqs at W1 D1: pandas, sklearn, matplotlib, PyTorch, Git. |
| full-stack-web | 24 | Stub + prereqs | Prereqs at W1 D1: Git, SQL. |
| mobile-engineering | 24 | Stub + prereqs | Prereqs at W1 D1: Git, SQL. |
| cybersecurity | 24 | Stub + prereqs | Prereqs at W1 D1: Git. |
| bi-analytics | 17 | Stub + prereqs | Prereqs at W1 D1: Git. |
| ai-automation | 20 | Stub + prereqs | Prereqs at W1 D1: NumPy, Docker, Git, SQL. |

**Audit status:** `node scripts/audit-prerequisites.js` → 0 CRITICAL · 0 HIGH across all 10 tracks.

**Weeks remaining to enrich to bar:**
- ai-engineering W6-W24 — 19 weeks
- devops-cloud W3-W24 — 22 weeks
- ml-engineering — 24 weeks
- full-stack-web — 24 weeks
- mobile-engineering — 24 weeks
- cybersecurity — 24 weeks
- bi-analytics — 17 weeks
- ai-automation — 20 weeks
- **Total: ~174 weeks** at ~35 5-week-batch script runs.

**Project arcs (canonical):**
- DS: TaxiPulse → Reddit Sentiment → Energy Forecast → Capstone (v0.1 → v1.0 → v1.0-extended).
- AI-eng: Polyglot v0.1 → v0.2 → v0.3 → v0.4, then dual-console v1.0.
- DevOps: Edge Portfolio v0.1 → v0.2 → v0.3 → v0.4.
- DA: Superstore v0.1 → v1.0 (Excel → pandas → SQL → dashboards).

---

## §2 · Platform state

### Backend (Prisma)
- Schema: `prisma/schema.prisma`. Provider: postgres.
- Critical invariants:
  - **`Checkin` is upserted by `(userId, taskId)`.** Submission endpoints (`/api/checkins`, `/api/mentee/review-answers`, `/api/me/mark-week-complete`) all upsert; mentor `reopen` resets in place. Inserting a new Checkin re-introduces a duplication bug — don't.
  - `Interrogation` is 1-per-checkin via `@unique` on `checkinId`.
  - `Task.status = "verified"` is the gate for "week complete" — used by lock logic and roadmap rendering.
- No outstanding migrations.

### Critical components (don't duplicate — extend)
| File | Role |
|---|---|
| `src/components/WeekPageTabs.tsx` | Student week view: tabs (Content / Submission / optional Mentor Review), lesson stream, prev/next pager. Accepts `hasMentor` to gate solo behavior. |
| `src/components/ForgeMarkdown.tsx` | Lesson body renderer. Owns `CodeBlock` table layout. |
| `src/components/VideoEmbed.tsx` | YouTube + Loom inline player. Has `allowFullScreen` + `allow="fullscreen"` + `fs=1` in URLs. |
| `src/components/ResourceViewer.tsx` | Modal for non-video resources + YouTube fallback. |
| `src/components/RoadmapNodeMap.tsx` | The Journey vertical timeline. Accepts `slugForLinks` to make unlocked nodes clickable. |
| `src/components/RoadmapView.tsx` | Renders Journey only on `/dashboard/roadmap`. `LegacyTracksAccordion` preserved in the file but unused. |
| `src/app/dashboard/page.tsx` | Student dashboard. Card order: Pact → Returning → Current Focus → Check-in → Progress. |
| `src/app/dashboard/mentor/page.tsx` | Mentor home — mentee cards, single "latest session" row. |
| `src/app/dashboard/mentor/reviews/page.tsx` | Pending-review queue + grading form. |
| `src/app/dashboard/journal/page.tsx` | Permanent session record. Dedupes by `taskId`; surfaces `NEEDS REVISION` pill. |
| `src/app/api/checkins/route.ts` | Proof-of-work submission. Upserts. |
| `src/app/api/mentee/review-answers/route.ts` | Answer submission. Upserts. |
| `src/app/api/mentor/tasks/[id]/route.ts` | Mentor lifecycle (release / extend / close / verify / reopen). |
| `src/app/api/mentor/reviews/route.ts` | Grading endpoint. Fires `mentor-action` notification. |
| `src/app/api/me/mark-week-complete/route.ts` | Solo-learner self-verify. Refuses if any active MentorLink. |

### CSS surface (`src/app/globals.css`)
- `.forge-panel-link` — hover affordance for whole-card Links.
- `.forge-code-block` / `.forge-code-line` / `.forge-code-gutter` — mobile wrap + tightened gutter for code blocks rendered inside `ForgeMarkdown`.
- `.dashboard-content` — max-width 1200px centered on desktop.
- Mobile responsive block at `@media (max-width: 768px)`.

---

## §3 · Possible next steps (ranked)

Pick by priority. Costs are rough.

### A · Spread W1 D1 prereqs out (cosmetic) — ~30 min
W1 D1 of many tracks now holds 15-19 items because prereqs cluster there. Change one line in `scripts/fix-all-prereq-gaps.js` so insertion target becomes `W(firstUseWeek - 1) Dlast` instead of `W1 D1`. Re-run; re-audit.

### B · Resume Cloud / DevOps W3-W7 enrichment — ~3-4 hr
Started but paused so the platform fixes shipped first. Follow `scripts/ai-eng-w1-w5.js` factory pattern. Topics: Edge Portfolio v0.3 (GitHub Actions CI/CD) → v0.4 (monitoring) → Docker fundamentals (W5-W7). Context fields already in `devops-cloud.json`.

### C · Enrich AI-eng W6-W24 — ~12-15 hr
W6-W24 are stub-shaped. Topics: Structured Outputs (W6), Streaming + Cost (W7), Embeddings, RAG, Agents, MCP, Voice, Vision, Fine-tuning, Evals at scale, Production ops. Group into 5-week batches.

### D · Enrich the remaining 6 tracks — ~50+ hr
ML-eng, Full-stack, Mobile, Cyber, BI, AI-automation. ~24 weeks each. Audit clean now but content uneven. 5-week batches per track.

### E · Runtime prerequisite-locking system — ~6-8 hr
The audit catches gaps at curriculum-edit time. The runtime check that prevents opening lesson N before prerequisite M is done doesn't exist yet. Needs:
- Prisma model `ConceptPrerequisite { conceptId, prerequisiteConceptId, trackId }` + migration.
- Concept IDs derived from `<week>-<day>-<itemIndex>` or explicit `conceptId` on lesson items.
- `WeekPageTabs.tsx` queries completion + locks with a "Complete X first" message.
- Reseed prereqs from `scripts/audit-prerequisites.js`'s detection logic.

### F · Resource library → lesson auto-matcher — ~4-6 hr
There's no matching between `MentorResource` / `Task.resources[]` and curated curriculum items. To wire:
- Schema: add "concept tag" to `MentorResource`.
- API: when rendering a lesson, query resources tagged with the concept; surface as additional items.
- Caveat: conflicts with JSON-as-source-of-truth. Decide first.

### G · Cleanup: scripts/v2 vs scripts root — quick
Curriculum scripts scattered. Move per-track scripts to `scripts/curriculum/<track>/`; keep audits at `scripts/` root.

### H · Lint / dead-import pass — ~30 min
`tsc` clean; `eslint` may flag dead imports left behind by recent refactors.

---

## §4 · Repo geometry

```
OneDrive/Desktop/FORGE/
├── HANDOFF.md                          ← rules
├── STATE.md                            ← you are here
├── CHANGELOG.md                        ← session history
├── prisma/schema.prisma                ← all models
├── src/
│   ├── app/
│   │   ├── dashboard/                  ← mentor + student dashboards
│   │   ├── learn/[slug]/[week]/        ← student week view (uses WeekPageTabs)
│   │   ├── api/
│   │   │   ├── checkins/route.ts                    ← submission upsert
│   │   │   ├── me/mark-week-complete/route.ts       ← solo self-verify
│   │   │   ├── mentee/review-answers/route.ts       ← answer upsert
│   │   │   ├── mentor/tasks/[id]/route.ts           ← reopen / verify / etc.
│   │   │   └── mentor/reviews/route.ts              ← grading
│   │   └── globals.css                              ← .forge-* CSS classes
│   └── components/
│       ├── WeekPageTabs.tsx            ← lesson stream + tabs + pager
│       ├── ForgeMarkdown.tsx           ← body renderer + code blocks
│       ├── VideoEmbed.tsx              ← YouTube/Loom inline player
│       ├── ResourceViewer.tsx          ← modal + YouTube fallback
│       ├── RoadmapNodeMap.tsx          ← Journey timeline (clickable)
│       └── RoadmapView.tsx             ← /dashboard/roadmap renderer
├── data/roadmaps/
│   ├── data-science.json               ← 43 weeks, bar-quality
│   ├── data-analysis.json              ← 28 weeks, bar-quality
│   ├── ai-engineering.json             ← 24 weeks (W1-W5 bar)
│   ├── devops-cloud.json               ← 24 weeks (W1-W2 bar)
│   └── ... 6 more tracks
└── scripts/
    ├── audit-prerequisites.js          ← prereq audit (must run after curriculum edits)
    ├── audit-week-alignment.ts         ← context-vs-topics audit
    ├── audit-videos.js                 ← video URL audit; KNOWN_GOOD allowlist lives here
    ├── remove-videos-by-id.js          ← one-shot video removal by ID
    ├── fix-all-prereq-gaps.js          ← one-shot prereq closer
    ├── ds-w*.js                        ← DS week-build scripts
    ├── ai-eng-w1-w5.js                 ← AI-eng W1-W5 build (canonical factory)
    ├── ai-eng-w1-d1-thicken.js         ← lesson-thickening pattern (replaces removed videos)
    ├── ai-eng-w1-d1-karpathy.js        ← Karpathy video insertion
    ├── ds-w2-numpy-prereq.js / -video.js  ← DS W2 NumPy patches
    └── v2/                             ← older v2-rewrite handoff + scripts
```
