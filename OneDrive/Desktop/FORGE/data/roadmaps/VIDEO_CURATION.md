# Video Curation Pipeline (no API key required)

Hand-pick high-quality, on-topic videos for any concept and have them placed
automatically. Three steps.

## 1. Generate the worklist
```bash
python curate_videos.py
```
Writes `video_candidates.csv` — one row per teachable concept across all 11 tracks
(scaffold days excluded), each with a ready-made YouTube search URL. ~1,840 rows;
fill in as many as you like.

## 2. Curate (your part)
Open each `search_url`, pick the best video **under 30 minutes**, and fill these
columns in `video_candidates.csv`:

| Column | What to put |
|--------|-------------|
| `video_id` | the 11-char YouTube id (the `v=` part) |
| `duration_min` | the real length in minutes (1–30) |
| `creator` | channel name (Fireship, 3Blue1Brown, StatQuest, …) |
| `why` | one line: why this video, what to focus on |
| `status` | leave blank to import; put `skip` to ignore a row |

Leave `concept_key` as generated — it wires the video to its concept.

## 3. Import + place
```bash
python import_videos.py
```
- Verifies every filled video resolves on YouTube (rejects dead ids, anything > 30 min).
- Writes `curated_library.json`.
- Re-runs the enricher, which merges curated videos into `KNOWN_GOOD`, the keyword
  map, and the track allow-list, and places each on its concept day.

Use `python import_videos.py --no-enrich` to import without re-enriching.

## Guarantees
- Every curated video is identity-checked (oembed) on import **and** on every
  enricher run (title gate), so a changed/removed video is caught.
- The 30-minute hard cap is enforced at import and in the enricher.
- Curated videos are first-class: they sit alongside the built-in library and obey
  the same on-topic, concept-match, and budget rules (`audit_videos.py` covers them).

## Optional: full API vetting
If you have a free YouTube Data API key, `python video_api.py` adds real durations +
channel verification on top of this (`video_library.json`). Not required.
