#!/usr/bin/env python3
"""
gen_theme_pending.py — week-THEME worklist for weeks still under 3 videos.

gen_pending.py searches each empty DAY's hyper-specific concept (e.g. "Transport"),
which is often unsearchable. This script instead targets the WEEK as a whole: a week
sitting at 1-2 videos just needs one more ON-THEME video, and the week title
("Theming, Dark Mode, and Design Systems") is far more findable.

For each week with < 3 videos it emits `need = 3 - current` rows, all sharing:
  concept     = the FULL week title  -> its lowercase form is the placement keyword
                (a guaranteed substring of the enricher's match_topic = day+week title,
                 and unique to this week), so the found video lands on a video-less day
                of THIS week and no other.
  concept_key = theme-<track>-w<n>   -> one library bucket per week; multiple finds
                distribute across that week's video-less days.
  search      = a cleaned theme       -> what auto_fill_videos.py --broad searches for.

Pipeline:
  python gen_theme_pending.py
  python ../../scripts/auto_fill_videos.py --input THEME_PENDING.csv --output THEME_FILLED.csv --broad
  python import_videos.py THEME_FILLED.csv --no-enrich
  python enrich_track.py --all
  python coverage_report.py
"""
import csv
import json
import re
import urllib.parse
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "THEME_PENDING.csv"

# Same files coverage_report / enrich operate on (weak tracks first).
TRACKS = [
    ('mobile-engineering', 'mobile-engineering-enriched.json'),
    ('data-analysis', 'data-analysis.json'),
    ('ai-engineering', 'ai-engineering-enriched.json'),
    ('full-stack-web', 'full-stack-web-enriched.json'),
    ('ml-engineering', 'ml-engineering-enriched.json'),
    ('data-engineering', 'data-engineering.json'),
    ('bi-analytics', 'bi-analytics-enriched.json'),
    ('ai-automation', 'ai-automation-enriched.json'),
    ('data-science', 'data-science.json'),
    ('devops-cloud', 'devops-cloud-enriched.json'),
    ('cybersecurity', 'cybersecurity-enriched.json'),
]


def clean_theme(title: str) -> str:
    """A findable search phrase from a week title: drop a leading 'Project N —'
    label and a 'Codename vX.Y:' project prefix, and any trailing '— explanation'
    clause, leaving the conceptual heart of the week."""
    t = (title or "").strip()
    t = re.sub(r'^project\s+\d+\s*[—–\-]\s*', '', t, flags=re.I)         # "Project 2 — "
    t = re.sub(r'^[A-Za-z][\w ]*\bv\d+(?:\.\d+)?\s*:\s*', '', t)          # "Hydra v0.3: "
    t = re.split(r'\s[—–]\s|\s-\s', t)[0]                                 # trailing clause
    return t.strip(' .,:;')


def slug(s: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:48] or 'theme'


def main():
    rows = []
    by = {}
    for track, fn in TRACKS:
        p = HERE / fn
        if not p.exists():
            continue
        d = json.loads(p.read_text(encoding='utf-8'))
        weeks = d['weeks'] if isinstance(d, dict) else d
        for w in weeks:
            vids = sum(1 for day in w['days'] for it in day['items'] if it.get('kind') == 'video')
            if vids >= 3:
                continue
            need = 3 - vids
            title = w.get('title', '') or ''
            theme = clean_theme(title)
            if len(theme) < 3:
                continue
            for _ in range(need):
                q = urllib.parse.quote_plus(f"{theme} tutorial")
                rows.append({
                    'track': track, 'week': w['number'],
                    'concept': title,                       # placement keyword = title.lower()
                    'concept_key': f"theme-{track}-w{w['number']}",
                    'search': theme,                        # discovery query
                    'search_url': f"https://www.youtube.com/results?search_query={q}",
                    'status': '', 'video_id': '', 'duration_min': '', 'creator': '', 'why': '',
                })
            by[track] = by.get(track, 0) + need

    cols = ['track', 'week', 'concept', 'concept_key', 'search', 'search_url',
            'status', 'video_id', 'duration_min', 'creator', 'why']
    with open(OUT, 'w', newline='', encoding='utf-8') as f:
        wr = csv.DictWriter(f, fieldnames=cols)
        wr.writeheader()
        wr.writerows(rows)

    print(f"Wrote {OUT.name}: {len(rows)} video slots needed across {len(by)} tracks (gap to >=3/week).")
    for t, n in sorted(by.items(), key=lambda kv: -kv[1]):
        print(f"  {t:20s} {n}")
    print("\nNext: python ../../scripts/auto_fill_videos.py --input data/roadmaps/THEME_PENDING.csv "
          "--output data/roadmaps/THEME_FILLED.csv --broad")


if __name__ == '__main__':
    main()
