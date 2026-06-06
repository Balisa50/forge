# Rendering & Off-Topic-Video Fixes — Report

Two defects fixed: (A) lesson bodies rendering as scattered/cut-off fragments,
(B) off-topic videos (e.g. a Linux video in Data Analysis).

---

## A. Rendering — root cause was the renderer, not the content

The lesson JSON is correct markdown. The bug was in `src/components/ForgeMarkdown.tsx`,
the custom renderer (no react-markdown/remark in the project).

### The bug
List items (`ul`, `ol`, `checklist`, and the `pass` checklist) are laid out with
`display: flex` (bullet marker + text). The text was rendered by `<InlineText>`,
which returns **multiple** inline elements (one per `**bold**`, `*italic*`,
`` `code` `` fragment). Dropped directly into a flex container, **each fragment
became its own flex item**, so a long formatted bullet did not wrap as a sentence —
it exploded into pieces spread across the row and overflowed/clipped at the edges.
Short bullets happened to fit on one row, which is why some looked fine and others
(the long Series/DataFrame bullets in the screenshots) scattered with words cut off
("…share one ind", "…never really le", "…and a Data").

### The fix (renderer)
1. Wrapped `<InlineText>` in every flex list item in a single flex child:
   `<span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>` — now the
   whole bullet is one item that wraps as normal prose. (Fixed in `ul`, `ol`,
   `checklist`, and `pass`.)
2. Added a **markdown table renderer** (`TableBlock`): a header row followed by a
   `|---|---|` separator now renders as a real, horizontally-scrollable `<table>`
   instead of flattened text. 10 lessons contained real tables
   (ai-engineering, data-science × several) that previously rendered scrambled.
3. Root container now sets `overflowWrap: "anywhere"` as a safety net so no long
   token can overflow the card.

Pipes that are **not** tables (absolute value `|r|`, shell `… | grep …`, ASCII
dashboard mock-ups inside ``` fences) are correctly left alone — the table parser
requires a real `|---|` separator row, and code fences/headings are matched first.

### Lessons affected
No source JSON was changed for rendering — the content was already valid markdown.
Every lesson with inline-formatted bullets (the large majority across all 11 tracks)
and the 10 lessons with markdown tables now render correctly. Verified by `tsc`
(clean) and by the full content audit (`audit_final.py`) still passing.

---

## B. Off-topic videos — systematic purge

### Root cause
`pick_video_for_day()` matched a keyword to the day title, but its **fallback**
(when no keyword matched) grabbed *any* verified video from the whole library —
including cross-domain ones. That is how a pandas-aggregation day in Data Analysis
received "Linux in 5 minutes".

### Scale of the problem (previous committed build)
**952 off-topic videos across all 11 tracks** — not an isolated incident:

| Track | Off-topic (before) | Example |
|-------|-------------------:|---------|
| data-science | 193 | Linux, Docker in DS days |
| data-analysis | 121 | Linux in pandas aggregation |
| mobile-engineering | 109 | Linux, RAG in a mobile app |
| ai-engineering | 105 | Linux, Docker |
| full-stack-web | 103 | Linux, Docker |
| cybersecurity | 90 | Docker, Auth in recon days |
| ai-automation | 84 | Linux, Docker |
| bi-analytics | 74 | Linux, Docker in Power BI days |
| ml-engineering | 38 | Linux |
| data-engineering | 27 | Linux |
| devops-cloud | 8 | Python/SQL on infra days |
| **TOTAL** | **952** | |

### The fix (enrichment script)
`data/roadmaps/enrich_track.py`:
1. Added `TRACK_VIDEO_KEYS` — a per-track allow-list of on-topic library keys
   (e.g. Data Analysis → `pandas, python, jupyter, sql, powerbi, dax, bigquery, git`;
   never `linux`/`docker`/`react`).
2. Rewrote `pick_video_for_day(day_topic, used, cache, track_slug)` so **every pass
   — keyword match, diversity fallback, and last-resort — only ever selects from the
   track's allowed keys.** It can no longer return a cross-domain video.
3. Threaded `track_slug` through `synth_day_zero`, `pad_day`, and
   `enforce_video_diversity`.

### Result
Re-enriched all 11 tracks. A cross-topic validation (every video's library key must
be in its track's allowed domain) now reports **0 off-topic videos**.

### Diversity rule, honestly adjusted
Narrow analyst/mobile domains legitimately have only 6–7 distinct on-topic videos,
but a week has 8 video slots. Rather than inject an off-topic video to hit "8
distinct", **on-topic correctness wins**: the audit now requires each week to be
maximally diverse *up to the track's on-topic pool size* (and still ≥5 distinct, or
the whole pool if smaller). All 11 tracks pass `audit_final.py` (6/6 parts).

---

---

## C. No forced videos (follow-up)

The track-domain allow-list still left a gap: when no concept-specific video
matched, the picker fell back to the *least-wrong allowed* video — so a pandas
**aggregation/groupby** day in Data Analysis got a 10-minute **Git** tutorial. A
tangential video is still the wrong video.

### New rule — a video is attached ONLY if it directly matches the day's concept
`pick_video_for_day()` now returns a video **only** on a real concept-keyword match
to a library video that is (a) in the track's domain, (b) **under 10 minutes**, and
(c) verified alive. Otherwise it returns `None`, and `pad_day()` adds a **second
"deeper dive" lesson block** (worked-example scaffold) instead of forcing a video.
The `enforce_video_diversity` pass (which existed to hit a video count) was removed —
counting videos is exactly what caused tangential picks.

### Result
- **226 videos remain**, every one concept-matched, on-topic, and < 10 min.
- **1,817 days are now taught without a video** (a second lesson block instead).
- Data Analysis W2 D4 "Aggregation and groupby": **no video** (Git removed); three
  lesson blocks + a quick-check swipe + an exercise. The Jupyter *setup* day keeps
  its on-topic "Jupyter in 100 Seconds" video.
- `audit_final.py` Part 2 no longer requires a per-week video count; it validates
  that any video present is on-topic/short/alive and that every non-setup day has a
  video **or** ≥2 lesson blocks.

New deliverable: `data/roadmaps/audit_videos.py` — confirms every video is on-topic,
concept-matched, and < 10 minutes (RESULT: PASS, 0 issues).

---

## Verification

- `npx tsc --noEmit` — clean.
- `python data/roadmaps/audit_videos.py` — **0 issues**; every video on-topic & concept-matched, < 10 min.
- `python data/roadmaps/audit_final.py` — all 6 parts PASS for all 11 tracks.
