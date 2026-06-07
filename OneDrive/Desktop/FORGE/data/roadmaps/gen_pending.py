#!/usr/bin/env python3
"""
gen_pending.py — targeted curation worklist for the GAP only.

Unlike curate_videos.py (every concept), this lists only the concept DAYS that are
currently MISSING a video inside weeks with fewer than 3 videos — i.e. exactly what
must be filled to hit the coverage targets. Output PENDING_VIDEOS.csv uses the same
columns as import_videos.py, so once you fill video_id/duration_min/creator/why you
can run `python import_videos.py PENDING_VIDEOS.csv` directly.

Weak tracks are listed first (AI-engineering, cybersecurity, ai-automation).
Run: python gen_pending.py
"""
import csv
import json
import re
import urllib.parse
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "PENDING_VIDEOS.csv"

# weak-first priority order
TRACKS = [
    ('ai-engineering', 'ai-engineering-enriched.json'),
    ('cybersecurity', 'cybersecurity-enriched.json'),
    ('ai-automation', 'ai-automation-enriched.json'),
    ('mobile-engineering', 'mobile-engineering-enriched.json'),
    ('full-stack-web', 'full-stack-web-enriched.json'),
    ('devops-cloud', 'devops-cloud-enriched.json'),
    ('bi-analytics', 'bi-analytics-enriched.json'),
    ('data-analysis', 'data-analysis.json'),
    ('data-engineering', 'data-engineering.json'),
    ('ml-engineering', 'ml-engineering-enriched.json'),
    ('data-science', 'data-science.json'),
]

_PREFIX = re.compile(r'^\s*Day\s*\d+\s*[-–—]\s*', re.I)
_SKIP = re.compile(r'^(ship\b|see it in|your turn|deeper dive|orient\b|verify your setup|'
                   r'set up your tooling|zero-cost path|project\b|tag v)', re.I)


def concept_of(title):
    t = _PREFIX.sub('', (title or '').strip())
    return t.strip(' .–—-')


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:48] or 'concept'


def main():
    rows = []
    for track, fn in TRACKS:
        p = HERE / fn
        if not p.exists():
            continue
        d = json.loads(p.read_text(encoding='utf-8'))
        weeks = d['weeks'] if isinstance(d, dict) else d
        for w in weeks:
            vids = sum(1 for day in w['days'] for it in day['items'] if it.get('kind') == 'video')
            if vids >= 3:
                continue  # week already meets the bar
            need = 3 - vids
            added = 0
            for day in w['days']:
                if added >= need:
                    break
                if day['number'] == 0:
                    continue
                if any(it.get('kind') == 'video' for it in day['items']):
                    continue  # day already has a video
                title = day.get('title', '') or ''
                if _SKIP.search(title.strip()):
                    continue
                concept = concept_of(title)
                if len(concept) < 4:
                    continue
                q = urllib.parse.quote_plus(f"{concept} tutorial explained")
                rows.append({
                    'track': track, 'concept': concept, 'concept_key': slug(concept),
                    'search_url': f"https://www.youtube.com/results?search_query={q}",
                    'status': '', 'video_id': '', 'duration_min': '', 'creator': '', 'why': '',
                    'week': w['number'],
                })
                added += 1

    cols = ['track', 'week', 'concept', 'concept_key', 'search_url', 'status',
            'video_id', 'duration_min', 'creator', 'why']
    with open(OUT, 'w', newline='', encoding='utf-8') as f:
        wr = csv.DictWriter(f, fieldnames=cols)
        wr.writeheader()
        for r in rows:
            wr.writerow({c: r.get(c, '') for c in cols})

    by = {}
    for r in rows:
        by[r['track']] = by.get(r['track'], 0) + 1
    print(f"Wrote {OUT.name}: {len(rows)} concept days needing a video (gap to >=3/week).")
    for t, n in by.items():
        print(f"  {t:20s} {n}")
    print("\nFill video_id/duration_min/creator/why, then: python import_videos.py PENDING_VIDEOS.csv")


if __name__ == '__main__':
    main()
