# FORGE — Changelog

Append one entry per session that ships. Newest first. Mirrors `git log` but with human framing and file mappings.

Rules live in `HANDOFF.md`. Current state lives in `STATE.md`.

---

## 2026-06-05 — Cloud/DevOps W3-W7 enriched to bar

5 weeks rebuilt to teach→swipe→project standard via `scripts/cloud-w3-w7.js`. Factory pattern matches `scripts/ai-eng-w1-w5.js`. Edge Portfolio project arc extended (v0.3 CI/CD → v0.4 monitoring) then pivot into Docker (W5 fundamentals → W6 Compose → W7 hardening + Trivy + SBOM).

- W3 — GitHub Actions CI/CD for the static site (IAM least-priv, secrets, htmlhint gate, S3 sync + CloudFront invalidation).
- W4 — Monitoring + alarms (BetterUptime probe, CloudWatch billing alarm, 5xx alarm, status page, CloudFront access logs + Athena).
- W5 — Docker from first principles (kernel-features mental model, first Dockerfile, multi-stage, volumes, Docker Hub push). Uses KNOWN_GOOD `Gjnup-PuquQ` Fireship Docker in 100 Seconds.
- W6 — Compose + inner loop (compose.yml, bind-mount source for hot reload, .env discipline, healthchecks, when-to-graduate-to-K8s).
- W7 — Image hardening (distroless, non-root, digest-pinned bases, Trivy CI gate, SBOM via syft, optional cosign).

W4 D6 Athena example triggered a new prereq finding (SQL used in devops-cloud W4 with no prior teach). Added `['devops-cloud', 'SQL', 4]` to `scripts/fix-all-prereq-gaps.js` and re-ran — SQL teach lesson + Fireship SQL 100s video + SQLBolt reading prepended to W1 D1. Audit clean: 0 / 0.

STATE.md track table updated: devops-cloud W1-W7 bar-quality; W8-W24 stub. Remaining cross-track work: ~157 weeks (down from 174).

## 2026-06-05 — CodeBlock flex rows + bulletproof 1200 px cap — `bf46967` / `ab0053e`

Two real bugs that had survived multiple "fix attempts" — both root-caused, fixed, and added to HANDOFF §7 (failure modes).

**Bug 1 — bizarre per-block code indentation.** `CodeBlock` used `<table width="100%">` with no `table-layout: fixed`. Browser auto-layout sized the line-number column and code column based on content. Multi-line blocks: code column wide, content left-aligned (correct). Single-line blocks (`1360`, `print(df["sales"].sum())`): browser collapsed the row toward centre, so identical components rendered at different x-positions depending on data inside. Replaced the table with `display: flex` per line: gutter at `width: 2.5rem flexShrink: 0`, code column at `flex: 1 minWidth: 0`. Every line of every block now agrees on x-position.

**Bug 2 — 1200 px container cap wasn't reaching live.** `/learn/<slug>/<week>` used Tailwind arbitrary value `max-w-[1200px]`; dashboard used the `.dashboard-content` CSS class. Both can fail silently on a given Vercel build (JIT class miss; stale CSS bundle). Replaced with inline `style={{ maxWidth: 1200, marginLeft: "auto", marginRight: "auto", ... }}` on the React tree itself — guaranteed every build.

HANDOFF §7 (codebase failure modes) gained two rules: don't use `<table width=100%>` for gutter+content layouts; don't rely on Tailwind arbitrary values for critical layout caps without a CSS-class or inline backup.

## 2026-06-05 — three-doc split (HANDOFF / STATE / CHANGELOG)

The single `HANDOFF.md` had grown past 600 lines, defeating the token-saving point. Split into three files:
- `HANDOFF.md` (this commit, ~250 lines) — rules only. Stable.
- `STATE.md` (new) — live curriculum + platform state, ranked next steps, repo geometry.
- `CHANGELOG.md` (this file) — session history.

Convention: next-agent reads HANDOFF + STATE for orientation, ignores CHANGELOG unless auditing the trail.

## 2026-06-05 — card swap + sanctioned deep-dive video — `922c484`

Dashboard card order: Current Focus moved ABOVE Check-in Required so learners see what they're doing before the alarm to do it. New order: Pact → Returning → Current Focus → Check-in → Progress.

Added Andrej Karpathy "Intro to Large Language Models" (`zjkBMFhNj_g`, 60 min) to AI-Eng W1 D1 as a sanctioned deep-dive exception. Added the ID to `KNOWN_GOOD` in `scripts/audit-videos.js`. HANDOFF §6 (video discipline) documents the exception with explicit "don't expand" guard.

Files: `src/app/dashboard/page.tsx`, `data/roadmaps/ai-engineering.json`, `scripts/ai-eng-w1-d1-karpathy.js`, `scripts/audit-videos.js`.

## 2026-06-05 — one-source-of-truth pass — `7743851`

Removed duplications:
- Roadmap page (`/dashboard/roadmap`) trimmed to Journey card only. Track tabs + phase accordion + per-task inline `WeekPageTabs` removed. `LegacyTracksAccordion` preserved in `RoadmapView.tsx` (unused).
- `RoadmapNodeMap` got a `slugForLinks` prop — unlocked nodes are now clickable Links to `/learn/<slug>/<week>`.
- Week page back arrow goes to `/dashboard` for every authed user (was: solo got bounced to `/learn/<slug>`).
- Dashboard: Track Progress + Recent Sessions cards removed (both duplicated content that lives elsewhere).
- AI-Eng W1 D1 lesson body thickened with the visual content the removed video would have carried (ASCII flow + 2 contrast examples) + OpenAI Quickstart reading added. NO fabricated video URL.

HANDOFF added §0a "One-source-of-truth rule — page contracts" table.

Files: `src/components/RoadmapView.tsx`, `src/components/RoadmapNodeMap.tsx`, `src/app/dashboard/page.tsx`, `src/app/learn/[slug]/[week]/page.tsx`, `data/roadmaps/ai-engineering.json`, `scripts/ai-eng-w1-d1-thicken.js`.

## 2026-06-05 — solo learner mode + dead-video purge — `cf913e1`

Solo learner mode is first-class:
- `WeekPageTabs` accepts `hasMentor`; when false, Mentor Review tab hidden.
- Submission tab swaps to `SoloCompletePanel`: optional Proof URL + Mark Complete.
- New `POST /api/me/mark-week-complete` — verifies task ownership, refuses if MentorLink exists, upserts Checkin, flips Task to `verified`. Idempotent.

Dashboard "Current Focus" stripped of `task.detail` dump. Resume button navigates to `/learn/<slug>/<weekNum>` directly. Same de-bloat for the mentee released-week card. Week page bumped from `max-w-5xl` to `max-w-[1200px]` matching the dashboard.

Video honesty pass: removed 33 unverified YouTube URLs across AI-eng W1-W5, DS W26-W34, ml-eng W1, devops-cloud W1, ai-automation W14. New `scripts/audit-videos.js` (lists every video with KNOWN_GOOD allowlist) + `scripts/remove-videos-by-id.js` (one-shot removal across all tracks).

HANDOFF gained §0 (solo mode design notes), §8.5 (video rules rewritten), §11.5 (video failure modes).

Files: `src/components/WeekPageTabs.tsx`, `src/components/VideoEmbed.tsx`, `src/components/ResourceViewer.tsx`, `src/app/api/me/mark-week-complete/route.ts`, `src/app/dashboard/page.tsx`, `src/app/learn/[slug]/[week]/page.tsx`, `scripts/audit-videos.js`, `scripts/remove-videos-by-id.js`, 5 track JSONs.

## 2026-06-05 — HANDOFF.md grew to v1 bar + state — `3a17361`

Top banner + TOC. §8 "The bar — what enriched means". §9 track-by-track granular enrichment status. §10 voice rules. §11 failure modes. §12 living-doc rule.

This was the doc that grew past 600 lines and triggered the three-doc split above.

## 2026-06-05 — first session-level HANDOFF.md — `5f74421`

7 sections covering: what shipped, platform state, curriculum state, conventions, next steps, repo geometry, working agreement.

## 2026-06-05 — close every prerequisite-audit gap — `edfa27d`

One parameterised script with a shared 9-tool teach library (Git / SQL / Docker / NumPy / pandas / sklearn / matplotlib / PyTorch / OpenAI SDK). Prepended teach content into W1 D1 of each affected track. Audit went from 24 findings (13 CRITICAL + 11 HIGH) to **0 / 0** across all 10 tracks. Idempotent.

Files: 9 roadmap JSONs + `scripts/fix-all-prereq-gaps.js`.

## 2026-06-05 — NumPy video added to DS W2 D1 — `5f7e467`

Python Programmer's 5-min NumPy intro (`xECXZ3tyONo`) inserted between the lesson and the docs reading. `scripts/ds-w2-numpy-video.js`. Idempotent.

## 2026-06-05 — phone-card width + YouTube fullscreen — `a828e2e`

Lesson-item layout split into header row + full-width body row in `WeekPageTabs`. Frees ~66 px from the body's left edge on phones; code blocks now use the card's full width.

YouTube fullscreen: `VideoEmbed.tsx` + `ResourceViewer.tsx` got `fs=1` in YouTube URLs + `fullscreen` in iframe `allow=` attribute. `allowFullScreen` was already set; the missing pieces were the URL flag and the Permissions-Policy directive (which Chrome on Android requires).

## 2026-06-05 — critical platform fixes — `673ca0b`

- Mentor card "Recent Sessions" → single deduped row (was: 5 rows that grew indefinitely).
- DS W2 D1 gains NumPy lesson + numpy.org reading + 3-card swipe (no new day).
- `ForgeMarkdown` code blocks: `.forge-code-block` class + mobile wrap rule (`.forge-code-line { white-space: pre-wrap }` under `@media (max-width: 768px)`).
- New `scripts/audit-prerequisites.js` — checks every tool USED in code (NumPy, pandas, sklearn, Docker, Git, SQL, matplotlib, PyTorch, OpenAI/Anthropic SDK, Streamlit, React, Next.js, Terraform, TensorFlow) has a teach lesson in an earlier-or-equal week. First run: 24 issues found.

## 2026-06-05 — 10 mentor / student flow fixes — `49cd985`

- **Checkin upsert by `(userId, taskId)`.** Submission endpoints upsert; mentor `reopen` resets the interrogation in place. Kills the duplication bug. Journal also dedupes by taskId for legacy rows.
- Review form: button overflow fixed on mobile (flex-wrap row + `flex: 1 1 200px` + `minWidth: 0`).
- Prev/Next week nav moved into `WeekPageTabs` and conditioned on Content tab.
- "Submit work" button removed from dashboard released-week card.
- Mentor card hover affordance via new `.forge-panel-link` class.
- Submission tab: context-aware button label ("Submit" / "Update submission" / "Resubmit your work") + prior submission preview.
- Journal: new `NEEDS REVISION` pill distinct from `AWAITING REVIEW`.

## Earlier — curriculum enrichment batches

Pre-handoff curriculum work, summarised:
- **DS W1-W43** rebuilt to teach→swipe→project standard across multiple script batches (`scripts/ds-w1-w3.js` … `ds-w42-w43.js`).
- **DA W1-W28** rebuilt to the same bar.
- **AI-eng W1-W5** rebuilt (`scripts/ai-eng-w1-w5.js`) — Polyglot arc + SDK depth.
- **DevOps-cloud W1-W2** rebuilt.

See `git log --oneline` for individual commit IDs.
