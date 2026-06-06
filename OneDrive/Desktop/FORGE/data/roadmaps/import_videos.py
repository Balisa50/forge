#!/usr/bin/env python3
"""
import_videos.py — ingest the human-curated CSV into the live video library.

Reads video_candidates.csv (the rows you filled), verifies each pick is real and
under 30 minutes, and writes curated_library.json. enrich_track.py loads that file
at startup and merges every entry into KNOWN_GOOD, KEYWORD_VIDEO_MAP, and the track
allow-list — so curated videos are first-class and get placed on their concept days.

Each filled row must have: video_id, duration_min (1–30), creator, why.
Verification: the video_id must resolve via YouTube oembed (alive); its title is
stored so the enricher's identity gate keeps verifying it on every run.

Run:
  python import_videos.py                 # read video_candidates.csv, then re-enrich
  python import_videos.py rows.csv        # use a different CSV
  python import_videos.py --no-enrich     # import only, skip re-enrichment
"""
import csv
import json
import re
import subprocess
import sys
import urllib.parse
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
LIB = HERE / "curated_library.json"
MAX_MIN = 30
VID_RE = re.compile(r'^[A-Za-z0-9_-]{11}$')


def oembed(video_id):
    url = f"https://www.youtube.com/watch?v={video_id}"
    req = urllib.request.Request(
        f'https://www.youtube.com/oembed?url={urllib.parse.quote(url, safe="")}&format=json',
        headers={'User-Agent': 'Mozilla/5.0 import-bot'})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            if r.status != 200:
                return (False, '', '')
            data = json.loads(r.read().decode('utf-8'))
            return (True, data.get('title', '') or '', data.get('author_name', '') or '')
    except Exception:
        return (False, '', '')


def load_existing():
    if LIB.exists():
        try:
            return {(e['concept_key'], e['video_id']): e for e in json.loads(LIB.read_text(encoding='utf-8')).get('videos', [])}
        except Exception:
            return {}
    return {}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    flags = {a for a in sys.argv[1:] if a.startswith('--')}
    csv_path = HERE / (args[0] if args else "video_candidates.csv")
    if not csv_path.exists():
        print(f"CSV not found: {csv_path}. Run curate_videos.py first.")
        return 1

    existing = load_existing()
    added = updated = skipped_empty = rejected = 0
    reasons = []

    with open(csv_path, encoding='utf-8') as f:
        for row in csv.DictReader(f):
            vid = (row.get('video_id') or '').strip()
            status = (row.get('status') or '').strip().lower()
            if status == 'skip':
                continue
            if not vid:
                skipped_empty += 1
                continue
            concept_key = (row.get('concept_key') or '').strip()
            concept = (row.get('concept') or '').strip()
            track = (row.get('track') or '').strip()
            creator = (row.get('creator') or '').strip()
            why = (row.get('why') or '').strip()
            dur_raw = (row.get('duration_min') or '').strip()

            if not VID_RE.match(vid):
                rejected += 1; reasons.append(f"{concept_key}: bad video_id '{vid}'"); continue
            try:
                dur = int(round(float(dur_raw)))
            except ValueError:
                rejected += 1; reasons.append(f"{concept_key}: duration_min not a number '{dur_raw}'"); continue
            if not (1 <= dur <= MAX_MIN):
                rejected += 1; reasons.append(f"{concept_key}: duration {dur} outside 1..{MAX_MIN}"); continue
            if not creator:
                rejected += 1; reasons.append(f"{concept_key}: missing creator"); continue

            alive, title, author = oembed(vid)
            if not alive:
                rejected += 1; reasons.append(f"{concept_key}: video {vid} not reachable (dead/private)"); continue

            entry = {
                'track': track, 'concept': concept, 'concept_key': concept_key,
                'video_id': vid, 'url': f"https://www.youtube.com/watch?v={vid}",
                'duration_min': dur, 'creator': creator or author,
                'why': why or f"Hand-picked: this {dur}-minute {creator or author} video teaches {concept} directly.",
                'title': title, 'difficulty': 'curated',
            }
            k = (concept_key, vid)
            if k in existing:
                updated += 1
            else:
                added += 1
            existing[k] = entry

    videos = sorted(existing.values(), key=lambda e: (e['track'], e['concept_key']))
    LIB.write_text(json.dumps({"videos": videos}, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"Imported: {added} new, {updated} updated, {skipped_empty} blank rows skipped, {rejected} rejected.")
    for r in reasons[:20]:
        print(f"   [reject] {r}")
    print(f"Library now holds {len(videos)} curated videos -> {LIB.name}")

    if '--no-enrich' not in flags and videos:
        print("\nRe-running enricher to place curated videos...")
        subprocess.run([sys.executable, str(HERE / "enrich_track.py")], cwd=str(HERE))
    return 0


if __name__ == '__main__':
    sys.exit(main())
