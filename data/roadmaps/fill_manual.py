#!/usr/bin/env python3
"""
fill_manual.py — broadened auto-discovery for the hyper-specific micro-concepts in
MANUAL_REQUIRED.csv. Uses each row's WEEK TITLE as extra context to widen the search,
and accepts a trusted-channel video that is on-topic for the concept OR the week theme.

Writes filled rows back to MANUAL_REQUIRED.csv (and a copy to FILLED.csv); concepts
where no trusted, on-topic video exists go to ZERO_VIDEO_FOUND.csv (those days keep
their lesson + swipe + exercise — they are taught, just without a video).

Run: python fill_manual.py
"""
import csv
import json
import sys
import time
from collections import OrderedDict
from pathlib import Path

import video_api as V

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

HERE = Path(__file__).resolve().parent
SRC = HERE / "MANUAL_REQUIRED.csv"
FILLED = HERE / "FILLED.csv"
ZERO = HERE / "ZERO_VIDEO_FOUND.csv"

TRACK_FILE = {
    'ai-engineering': 'ai-engineering-enriched.json', 'cybersecurity': 'cybersecurity-enriched.json',
    'ai-automation': 'ai-automation-enriched.json', 'data-engineering': 'data-engineering.json',
    'mobile-engineering': 'mobile-engineering-enriched.json', 'full-stack-web': 'full-stack-web-enriched.json',
    'devops-cloud': 'devops-cloud-enriched.json', 'bi-analytics': 'bi-analytics-enriched.json',
    'ml-engineering': 'ml-engineering-enriched.json', 'data-analysis': 'data-analysis.json',
    'data-science': 'data-science.json',
}


def week_titles():
    """(track, week_number) -> week title, for search context."""
    out = {}
    for track, fn in TRACK_FILE.items():
        p = HERE / fn
        if not p.exists():
            continue
        d = json.loads(p.read_text(encoding="utf-8"))
        for w in (d['weeks'] if isinstance(d, dict) else d):
            out[(track, str(w.get('number')))] = w.get('title', '')
    return out


def main():
    if not SRC.exists():
        print("MANUAL_REQUIRED.csv not found.")
        return 1
    rows = list(csv.DictReader(open(SRC, encoding="utf-8")))
    ctx = week_titles()
    cols = list(rows[0].keys())

    # group unfilled rows by (concept, track, week) so repeats get DISTINCT videos
    groups = OrderedDict()
    for r in rows:
        if (r.get("video_id") or "").strip():
            continue
        groups.setdefault((r.get("concept", ""), r.get("track", ""), r.get("week", "")), []).append(r)

    print(f"Broad discovery for {len(groups)} concept-weeks ({sum(len(v) for v in groups.values())} rows)...")
    filled = 0
    for (concept, track, week), grp in groups.items():
        if not concept:
            continue
        wt = ctx.get((track, str(week)), "")
        picks = V.auto_discover_video_broad(concept, week_context=wt, count=len(grp))
        for r, p in zip(grp, picks):
            r["video_id"] = p["url"]
            r["duration_min"] = p["duration_min"]
            r["creator"] = p["creator"]
            filled += 1
        time.sleep(0.3)

    with open(SRC, "w", newline="", encoding="utf-8") as f:
        wr = csv.DictWriter(f, fieldnames=cols); wr.writeheader(); wr.writerows(rows)
    got = [r for r in rows if (r.get("video_id") or "").strip()]
    zero = [r for r in rows if not (r.get("video_id") or "").strip()]
    if got:
        with open(FILLED, "w", newline="", encoding="utf-8") as f:
            wr = csv.DictWriter(f, fieldnames=cols); wr.writeheader(); wr.writerows(got)
    if zero:
        with open(ZERO, "w", newline="", encoding="utf-8") as f:
            wr = csv.DictWriter(f, fieldnames=cols); wr.writeheader(); wr.writerows(zero)

    print(f"Broad-filled {filled} rows -> FILLED.csv ({len(got)} total). "
          f"{len(zero)} still have no trusted on-topic video -> ZERO_VIDEO_FOUND.csv")
    print("Next: python import_videos.py FILLED.csv && python enrich_track.py --all")
    return 0


if __name__ == "__main__":
    sys.exit(main())
