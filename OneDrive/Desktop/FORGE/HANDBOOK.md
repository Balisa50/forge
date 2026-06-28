# FORGE — Operations Handbook

Run the whole curriculum system without asking anyone. Every command is copy-paste.
(For the *rules/voice* see `HANDOFF.md`; for *live status* see `STATE.md`; for the
*history* see `CHANGELOG.md`. This file is **how to operate**.)

All curriculum tooling lives in `data/roadmaps/`. Run commands from the repo root.

---

## 1. What's where

| Path | What |
|------|------|
| `data/roadmaps/{slug}.json` / `{slug}-enriched.json` | The 11 track roadmaps (raw + enriched) |
| `data/roadmaps/data-{science,analysis,engineering}.json` | Gold tracks (enriched written in place; raw in `*.json.bak`) |
| `data/exam-paths/exam-{p,fm}.json` | Actuary exam content (Exam P, Exam FM) |
| `data/roadmaps/enrich_track.py` | The enricher — builds enriched roadmaps from raw |
| `src/lib/roadmaps.ts` | App loader. `loadRoadmap()` prefers `{slug}-enriched.json` |
| `src/lib/examQuestionGen.ts` | Actuary tiered question engine |
| `src/app/dev/roadmaps/` | In-app dev preview (gated by `NEXT_PUBLIC_DEV_MODE=true`) |

## 2. Regenerate every roadmap from scratch

```bash
cd data/roadmaps
python gen_data_engineering.py        # rebuild data-engineering-src.json (DE only)
python enrich_track.py --all          # enrich ALL 11 tracks (gold tracks read from *.json.bak)
```
`enrich_track.py --all` validates the video library (oembed title-gate), merges the
curated library, and writes every `*-enriched.json` (and gold `*.json`). One track:
`python enrich_track.py ai-engineering`.

The app serves the result automatically — `loadRoadmap(slug)` prefers the enriched
file and merges raw task-detail fields on top, so students get the enriched experience
and task generation keeps its richness.

## 3. Add videos (no API key, no credit card)

See `docs/VIDEO_CURATION.md` for detail. Short version:

```bash
cd data/roadmaps
python gen_curate_next.py                                   # worklist: every week <3 videos
python ../../scripts/auto_fill_videos.py --input CURATE_NEXT.csv --output CURATE_NEXT.csv
python import_videos.py CURATE_NEXT.csv                     # verify + fetch metadata
python enrich_track.py --all                                # place them
# paste URLs into MANUAL_REQUIRED.csv for what auto-discovery missed, then import again
```
- Discovery = scraping YouTube search for the best TRUSTED-channel, on-topic, ≤45-min video.
- Add trusted channels: edit `TRUSTED_CHANNELS` / `PRIORITY_CHANNELS` in `data/roadmaps/video_api.py`.
- Curated videos have **no duration cap**; length is noted in the `why`.

## 4. Auto-discover videos for a brand-new track

1. Add the track's enriched/raw JSON to `data/roadmaps/`.
2. Add its slug to `PREVIEW_SLUGS` (`src/lib/roadmaps.ts`) and to the track lists in
   `enrich_track.py` (`ALL_TRACKS`, `TRACK_VIDEO_KEYS`, `TRACK_PREREQUISITES`).
3. `python gen_curate_next.py` → `auto_fill_videos.py` → `import_videos.py` → `enrich_track.py --all`.

## 5. Run all the audits

```bash
cd data/roadmaps
python audit_final.py     # 6 parts × 11 tracks: structure, videos, exercises, Day 0, concept checks, DE
python audit_videos.py    # every video on-topic, concept-matched, in-budget (curated exempt), alive
python audit_paid.py      # every paid service has a documented zero-cost path
cd ../.. && npx tsx scripts/audit-actuary.ts   # Actuary engine: tiers + zero repeats over 120 attempts
```
All must end in PASS. `audit_final.py` exits non-zero on any failure (CI-friendly).

## 6. The Roadmap Inspector (visual spot-check)

```bash
cd data/roadmaps && python build_inspector.py      # bundles data + validation -> roadmap-data.js
# then double-click data/roadmaps/roadmap-inspector.html  (offline, no server)
```
Sidebar of tracks (green/red), per-track 7-check dashboard with click-to-jump-to-failure,
collapsible weeks, per-day previews + playable video thumbnails, export-report button.

In-app preview (experience mode): set `NEXT_PUBLIC_DEV_MODE=true`, visit `/dev/roadmaps`.

## 7. Coverage status

```bash
cd data/roadmaps && python coverage_report.py      # videos per track vs targets, weak weeks
```

## 8. Actuary engine

- Code: `src/lib/examQuestionGen.ts`; wired into `src/components/exam/MasteryQuiz.tsx`.
- Tiered (easy→medium→hard→super-hard), parameterized, non-repeating; per-student tier
  progression in localStorage. Covers **Exam P + Exam FM** (IFM/LTAM/STAM not built).
- Verify: `npx tsx scripts/audit-actuary.ts`.

## 9. Ship

```bash
npx tsc --noEmit            # typecheck
git add -A && git commit -m "..." && git push origin main   # Vercel auto-deploys from main
```
Tags mark milestones: `forge-v1.0-final`, `forge-v2.0-actuary`, `forge-v3.0-complete`.

## 10. Honest invariants (do not break)

- **Never fabricate a video id.** Discovery scrapes + the oembed title-gate verifies; a
  wrong id is pruned, not shipped.
- **No off-topic videos.** A video is only placed via a concept keyword in the day/week
  title that maps to a trusted, verified library entry.
- **No forced videos.** If no on-topic video exists, the day gets a second lesson block.
- **No paid requirement without a free path** (`audit_paid.py` enforces 0 uncovered).
- **Re-run the audits before pushing.** Green means green.
