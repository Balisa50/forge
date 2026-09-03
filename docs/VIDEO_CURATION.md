# Video Curation — no API, no card, no manual pasting

How videos get onto roadmap days. Every video is **identity-verified** (oembed title
gate) before it ships, so nothing off-topic or dead is ever placed.

## One command to auto-fill most videos

```bash
python scripts/auto_fill_videos.py --input data/roadmaps/CURATE_NEXT.csv \
                                   --output data/roadmaps/CURATE_NEXT.csv
```

This **scrapes YouTube search results** (no API key, no billing), picks the best video
from a **trusted channel** that is **on-topic** (the concept word must appear in the
title) and **≤45 min**, and writes `video_id`, `duration_min`, `creator` back to the CSV.
Rows it can't fill from a trusted channel are written to `MANUAL_REQUIRED.csv`.

Then place them:

```bash
python data/roadmaps/import_videos.py data/roadmaps/CURATE_NEXT.csv   # oembed-verify + metadata
python data/roadmaps/enrich_track.py --all                            # place on concept days
python data/roadmaps/audit_videos.py                                  # confirm 0 off-topic
python data/roadmaps/coverage_report.py                               # new numbers
```

## Generate the worklist first (if you don't have one)

```bash
python data/roadmaps/gen_curate_next.py   # CURATE_NEXT.csv: every week under 3 videos
# or, focused core concepts:
python data/roadmaps/gen_curate_top.py    # CURATE_TOP.csv: ~24 high-leverage concepts
```

## For the remaining hyper-specific concepts (the ~10–50% auto-discovery can't find)

Open `data/roadmaps/MANUAL_REQUIRED.csv`, paste a YouTube URL into the `video_id`
column of each row you care about (single URL, `?si=` is fine, or 2–3 separated by
"and"), then:

```bash
python data/roadmaps/import_videos.py data/roadmaps/MANUAL_REQUIRED.csv
python data/roadmaps/enrich_track.py --all
```

`import_videos.py` auto-fetches the title + creator (oembed) and scrapes the real
duration — you only paste URLs. It writes a length-aware `why` (e.g. "this 47-minute
deep dive is long but worth it — watch the first ~20 minutes for the core idea").

## Trusted channels (priority order)

Defined in `data/roadmaps/video_api.py` → `PRIORITY_CHANNELS` (preference) and
`TRUSTED_CHANNELS` (the full allow-list).

| # | Channel | Best for |
|---|---------|----------|
| 1 | Fireship | 2–5 min quick intros |
| 2 | StatQuest | 5–12 min ML / stats intuition |
| 3 | 3Blue1Brown | 10–20 min math / ML deep dives |
| 4 | NetworkChuck | 10–20 min security / DevOps |
| 5 | Web Dev Simplified | 5–15 min web dev |
| 6 | Corey Schafer | 10–20 min Python / pandas |
| 7 | Dave Ebbelaar | 10–20 min LLM / AI engineering |
| 8 | PwnFunction | 5–10 min security exploits |

…plus IBM Technology, freeCodeCamp, Computerphile, Traversy Media, John Hammond,
The Cyber Mentor, and more (see `TRUSTED_CHANNELS`).

### Add a new trusted channel
Edit `TRUSTED_CHANNELS` (and optionally `PRIORITY_CHANNELS`) in
`data/roadmaps/video_api.py`. Names are matched case-insensitively against the
channel name YouTube returns.

## Duration policy

- **Library videos**: tiered budget — core 15 (20 for AI/ML), deep 20–27, capstone 25,
  Day 0 30. Hard cap 30.
- **Curated/hand-vetted videos**: **no cap** (quality > length); the length is disclosed
  in the `why`. The audits and inspector exempt `difficulty: "curated"` from the cap.

## Why this is safe

- No API key, no credit card, no manual metadata entry.
- Trusted-channel + title-on-topic check at discovery time.
- oembed title-gate on import **and** on every enricher run prunes any dead or
  wrong-but-alive id (it has caught several — e.g. an `n8n` link that became a 2-hour
  course). `audit_videos.py` then re-confirms every placed video is on-topic & verified.
