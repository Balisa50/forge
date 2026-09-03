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
# Windows consoles are cp1252; video titles contain emoji. Never let a print crash import.
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass
MAX_MIN = 90          # sanity ceiling only (no real cap — long excellent videos are allowed)
VID_RE = re.compile(r'^[A-Za-z0-9_-]{11}$')
_ID_IN_URL = re.compile(r'(?:youtu\.be/|[?&]v=|/embed/|/shorts/)([A-Za-z0-9_-]{11})')


def extract_ids(field):
    """Pull every 11-char video id from a messy field: full URLs, ?si= params,
    and 2-3 videos separated by 'and', commas, or whitespace."""
    field = field or ''
    ids = _ID_IN_URL.findall(field)
    if not ids:  # maybe the field is a bare id (or several)
        ids = [tok for tok in re.split(r'[\s,]+|\band\b', field) if VID_RE.match(tok.strip())]
    # de-dupe, preserve order
    seen, out = set(), []
    for i in ids:
        if i not in seen:
            seen.add(i); out.append(i)
    return out


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


def scrape_duration(video_id):
    """Get duration in minutes by scraping the watch page (no API key). None if unknown."""
    try:
        req = urllib.request.Request(f"https://www.youtube.com/watch?v={video_id}",
                                     headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', 'replace')
        m = re.search(r'"lengthSeconds":"(\d+)"', html)
        if m:
            return max(1, (int(m.group(1)) + 59) // 60)  # round up to whole minutes
        m = re.search(r'itemprop="duration"\s+content="PT(?:(\d+)H)?(?:(\d+)M)?', html)
        if m:
            h = int(m.group(1) or 0); mi = int(m.group(2) or 0)
            return max(1, h * 60 + mi)
    except Exception:
        pass
    return None


def why_for(concept, dur, creator):
    """One-line 'why', honest about length so the student knows what to expect."""
    c = creator or "this"
    if dur is None:
        return f"Hand-picked {c} video on {concept} — covers the concept directly."
    if dur <= 15:
        return f"This {dur}-minute {c} video teaches {concept} directly — watch it end to end."
    if dur <= 25:
        return f"This {dur}-minute {c} video on {concept} — watch the first ~15 minutes for the core pattern."
    return (f"This {dur}-minute {c} deep dive on {concept} is long but excellent — watch the first "
            f"~20 minutes for the core idea, then return later for the advanced parts.")


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
            status = (row.get('status') or '').strip().lower()
            if status == 'skip':
                continue
            field = (row.get('video_id') or '').strip()
            if not field:
                skipped_empty += 1
                continue
            concept_key = (row.get('concept_key') or '').strip()
            concept = (row.get('concept') or '').strip()
            track = (row.get('track') or '').strip()

            ids = extract_ids(field)
            if not ids:
                rejected += 1; reasons.append(f"{concept_key}: no valid video id in '{field[:40]}'"); continue

            for vid in ids:  # one row may hold 2-3 videos
                alive, title, author = oembed(vid)
                if not alive:
                    rejected += 1; reasons.append(f"{concept_key}: {vid} not reachable (dead/private)"); continue
                dur = scrape_duration(vid)
                if dur is not None and dur > MAX_MIN:
                    rejected += 1; reasons.append(f"{concept_key}: {vid} is {dur}min (>{MAX_MIN}, skipping)"); continue
                entry = {
                    'track': track, 'concept': concept, 'concept_key': concept_key,
                    'video_id': vid, 'url': f"https://www.youtube.com/watch?v={vid}",
                    'duration_min': dur if dur is not None else 0, 'creator': author or 'YouTube',
                    'why': why_for(concept, dur, author), 'title': title, 'difficulty': 'curated',
                }
                k = (concept_key, vid)
                if k in existing:
                    updated += 1
                else:
                    added += 1
                existing[k] = entry
                print(f"  + {track} | {concept_key:18s} | {(dur or '?')}min | {author} | {title[:42]}")

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
