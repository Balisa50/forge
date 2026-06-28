#!/usr/bin/env python3
"""
curate_videos.py — generate a human-curation worklist of every teachable concept.

Reads every track, extracts the unique, meaningful concept (one per distinct day
title, scaffold days skipped), and writes video_candidates.csv with a ready-made
YouTube search URL per concept. A human then opens each URL, picks the best video
under 30 minutes, and fills in: video_id, duration_min, creator, why.

Columns:
  track, concept, concept_key, search_url, status,
  video_id, duration_min, creator, why          <- you fill these

`concept_key` is an auto-generated slug; import_videos.py uses it to wire the video
into KNOWN_GOOD and the keyword map. Leave it as-is.

Run:  python curate_videos.py
"""
import csv
import json
import re
import urllib.parse
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "video_candidates.csv"

TRACKS = [
    ('ai-automation', 'ai-automation-enriched.json'),
    ('ai-engineering', 'ai-engineering-enriched.json'),
    ('bi-analytics', 'bi-analytics-enriched.json'),
    ('cybersecurity', 'cybersecurity-enriched.json'),
    ('data-analysis', 'data-analysis.json'),
    ('data-engineering', 'data-engineering.json'),
    ('data-science', 'data-science.json'),
    ('devops-cloud', 'devops-cloud-enriched.json'),
    ('full-stack-web', 'full-stack-web-enriched.json'),
    ('ml-engineering', 'ml-engineering-enriched.json'),
    ('mobile-engineering', 'mobile-engineering-enriched.json'),
]

# Strip leading day scaffolding to recover the bare concept.
_PREFIX = re.compile(r'^\s*Day\s*\d+\s*[-–—]\s*', re.I)
_SETUP = re.compile(r'^\s*Setup:\s*', re.I)
# Skip pure-scaffold day titles entirely (no concept to teach with a video).
_SKIP = re.compile(
    r'^(ship\b|see it in (code|action|worked)|your turn|deeper dive|orient\b|'
    r'verify your setup|set up your tooling|project\b|ship it\b)', re.I)
_SKIP_EXACT = {'review', 'practice', 'recap', 'wrap-up', 'wrap up', 'synthesis'}


def normalize_concept(title: str) -> str:
    t = (title or '').strip()
    t = _PREFIX.sub('', t)
    t = _SETUP.sub('', t)
    # Day-0 titles look like "Your Coding Environment — <tool>"; keep the tool part.
    t = re.sub(r'^Your Coding Environment\s*[-–—]\s*', '', t, flags=re.I)
    return t.strip(' .–—-')


def slugify(s: str) -> str:
    s = re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
    return s[:48] or 'concept'


def search_url(concept: str) -> str:
    q = urllib.parse.quote_plus(f"{concept} tutorial short")
    return f"https://www.youtube.com/results?search_query={q}"


def main():
    rows = []
    seen = set()  # (track, concept_key) dedupe
    for slug, fn in TRACKS:
        p = HERE / fn
        if not p.exists():
            continue
        d = json.loads(p.read_text(encoding='utf-8'))
        weeks = d['weeks'] if isinstance(d, dict) else d
        for w in weeks:
            for day in w.get('days', []):
                title = day.get('title', '') or ''
                if _SKIP.search(title.strip()):
                    continue
                concept = normalize_concept(title)
                if len(concept) < 4 or concept.lower() in _SKIP_EXACT:
                    continue
                key = slugify(concept)
                if (slug, key) in seen:
                    continue
                seen.add((slug, key))
                rows.append({
                    'track': slug, 'concept': concept, 'concept_key': key,
                    'search_url': search_url(concept), 'status': '',
                    'video_id': '', 'duration_min': '', 'creator': '', 'why': '',
                })

    cols = ['track', 'concept', 'concept_key', 'search_url', 'status',
            'video_id', 'duration_min', 'creator', 'why']
    with open(OUT, 'w', newline='', encoding='utf-8') as f:
        wr = csv.DictWriter(f, fieldnames=cols)
        wr.writeheader()
        wr.writerows(rows)

    by_track = {}
    for r in rows:
        by_track[r['track']] = by_track.get(r['track'], 0) + 1
    print(f"Wrote {OUT.name} with {len(rows)} concept rows:")
    for t, n in sorted(by_track.items()):
        print(f"  {t:20s} {n}")
    print("\nNext: open each search_url, pick the best video <30 min, and fill in")
    print("video_id, duration_min, creator, why. Then run: python import_videos.py")


if __name__ == '__main__':
    main()
