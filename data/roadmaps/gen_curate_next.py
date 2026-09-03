#!/usr/bin/env python3
"""
gen_curate_next.py — build CURATE_NEXT.csv: exactly the video gaps to take EVERY
week to >=3 videos, plus a weak-week report grouped by track.

For each week with <3 videos: need = 3 - current. Emit `need` rows drawn from the
week's concept days that DON'T already have a video (so we never re-request a covered
concept). If a week has fewer uncovered concepts than it needs (single-concept weeks),
repeat the week's primary concept so you can paste DISTINCT URLs for it.

Output columns are import_videos.py-compatible. Weak tracks / biggest gaps first.
Run: python gen_curate_next.py
"""
import csv
import json
import re
import urllib.parse
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "CURATE_NEXT.csv"

# weak-first priority (matches coverage_report ordering intent)
TRACKS = [
    ('ai-engineering', 'ai-engineering-enriched.json'),
    ('cybersecurity', 'cybersecurity-enriched.json'),
    ('ai-automation', 'ai-automation-enriched.json'),
    ('data-engineering', 'data-engineering.json'),
    ('mobile-engineering', 'mobile-engineering-enriched.json'),
    ('full-stack-web', 'full-stack-web-enriched.json'),
    ('devops-cloud', 'devops-cloud-enriched.json'),
    ('bi-analytics', 'bi-analytics-enriched.json'),
    ('ml-engineering', 'ml-engineering-enriched.json'),
    ('data-analysis', 'data-analysis.json'),
    ('data-science', 'data-science.json'),
]
TARGET = 3

_PREFIX = re.compile(r'^\s*Day\s*\d+\s*[-–—]\s*', re.I)
_SKIP = re.compile(r'^(ship\b|see it in|your turn|deeper dive|orient\b|verify your setup|'
                   r'set up your tooling|zero-cost path|dataset:|project\b|tag v)', re.I)


def concept_of(title):
    return _PREFIX.sub('', (title or '').strip()).strip(' .–—-')


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:48] or 'concept'


def search_url(concept):
    return "https://www.youtube.com/results?search_query=" + urllib.parse.quote_plus(f"{concept} tutorial explained")


def main():
    rows = []
    report = []  # (track, week, title, current, need)
    for track, fn in TRACKS:
        p = HERE / fn
        if not p.exists():
            continue
        d = json.loads(p.read_text(encoding='utf-8'))
        weeks = d['weeks'] if isinstance(d, dict) else d
        for w in weeks:
            days = w.get('days', [])
            current = sum(1 for day in days for it in day.get('items', []) if it.get('kind') == 'video')
            if current >= TARGET:
                continue
            need = TARGET - current
            report.append((track, w['number'], w.get('title', ''), current, need))

            # concept days WITHOUT a video, in order
            uncovered = []
            for day in days:
                if day.get('number', 0) < 1:
                    continue
                if any(it.get('kind') == 'video' for it in day.get('items', [])):
                    continue
                title = day.get('title', '') or ''
                if _SKIP.search(title.strip()):
                    continue
                c = concept_of(title)
                if len(c) >= 4 and c not in uncovered:
                    uncovered.append(c)

            chosen = uncovered[:need]
            # single-concept / not-enough-distinct weeks: repeat the primary concept
            primary = uncovered[0] if uncovered else concept_of(w.get('title', '')) or w.get('title', 'concept')
            while len(chosen) < need:
                chosen.append(primary)

            for i, c in enumerate(chosen):
                rows.append({
                    'priority': len(report), 'track': track, 'week': w['number'],
                    'concept': c, 'concept_key': slug(c), 'search_url': search_url(c),
                    'status': '', 'video_id': '', 'duration_min': '', 'creator': '', 'why': '',
                })

    cols = ['priority', 'track', 'week', 'concept', 'concept_key', 'search_url',
            'status', 'video_id', 'duration_min', 'creator', 'why']
    with open(OUT, 'w', newline='', encoding='utf-8') as f:
        wr = csv.DictWriter(f, fieldnames=cols)
        wr.writeheader()
        for r in rows:
            wr.writerow({c: r.get(c, '') for c in cols})

    # summary
    by_track = {}
    for t, wn, title, cur, need in report:
        by_track.setdefault(t, []).append((wn, cur, need))
    print("=" * 74)
    print("WEAK WEEKS (<3 videos) — gap to fill, by track")
    print("=" * 74)
    for t, _ in TRACKS:
        ws = by_track.get(t, [])
        if not ws:
            continue
        gap = sum(n for _, _, n in ws)
        print(f"\n{t}  ({len(ws)} weak weeks, {gap} videos needed):")
        print("  " + ", ".join(f"W{wn}({cur}/3)" for wn, cur, _ in ws))
    print("\n" + "-" * 74)
    print(f"Wrote {OUT.name}: {len(rows)} rows (one per missing video) across {len(report)} weak weeks.")
    print("Paste 1 URL per row into the video_id column (a row = one needed video).")
    print("Then: python import_videos.py CURATE_NEXT.csv && python enrich_track.py --all")


if __name__ == '__main__':
    main()
