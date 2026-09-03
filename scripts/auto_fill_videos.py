#!/usr/bin/env python3
"""
auto_fill_videos.py — one command to auto-fill a video-curation CSV (no API, no card).

Reads a CSV with `concept` (and `concept_key`, `track`) columns, and for each row that
isn't filled it scrapes YouTube search for the best TRUSTED-channel, on-topic video
(via video_api.auto_discover_video) and writes back video_id / duration_min / creator.
Rows it can't fill from a trusted channel are written to a MANUAL_REQUIRED.csv.

Usage:
  python scripts/auto_fill_videos.py --input data/roadmaps/CURATE_NEXT.csv \
                                     --output data/roadmaps/CURATE_FILLED.csv
  python scripts/auto_fill_videos.py --input <csv> --tracks ai-engineering cybersecurity
"""
import argparse
import csv
import json
import re
import sys
import time
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROADMAPS = ROOT / "data" / "roadmaps"
sys.path.insert(0, str(ROADMAPS))          # so we can import the curation modules
import video_api as V                       # noqa: E402  (canonical auto_discover_video lives here)

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

_VIDID = re.compile(r'(?:youtu\.be/|[?&]v=|/embed/|/shorts/)([A-Za-z0-9_-]{11})')

# track slug -> roadmap json (enriched preferred; raw for the three that have no enriched file)
_TRACK_FILES = {
    'ai-engineering': 'ai-engineering-enriched.json', 'cybersecurity': 'cybersecurity-enriched.json',
    'ai-automation': 'ai-automation-enriched.json', 'mobile-engineering': 'mobile-engineering-enriched.json',
    'full-stack-web': 'full-stack-web-enriched.json', 'devops-cloud': 'devops-cloud-enriched.json',
    'bi-analytics': 'bi-analytics-enriched.json', 'ml-engineering': 'ml-engineering-enriched.json',
    'data-analysis': 'data-analysis.json', 'data-engineering': 'data-engineering.json',
    'data-science': 'data-science.json',
}


def _library_video_ids():
    """All video ids already in curated_library.json (so we never re-pick one)."""
    lib = ROADMAPS / "curated_library.json"
    if not lib.exists():
        return set()
    try:
        data = json.loads(lib.read_text(encoding="utf-8"))
    except Exception:
        return set()
    return {e.get("video_id", "") for e in data.get("videos", []) if e.get("video_id")}


def _week_title_lookup():
    """(track, week_number_str) -> week title, used as broad-discovery context."""
    out = {}
    for track, fn in _TRACK_FILES.items():
        p = ROADMAPS / fn
        if not p.exists():
            continue
        try:
            d = json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            continue
        weeks = d["weeks"] if isinstance(d, dict) else d
        for w in weeks:
            out[(track, str(w.get("number")))] = w.get("title", "") or ""
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="CSV with concept/concept_key/track columns")
    ap.add_argument("--output", help="where to write the filled CSV (default: overwrite input)")
    ap.add_argument("--manual", help="where to write rows that need manual review")
    ap.add_argument("--tracks", nargs="*", default=None, help="only process these tracks")
    ap.add_argument("--broad", action="store_true",
                    help="use week-context-aware broad discovery for hyper-specific micro-concepts")
    args = ap.parse_args()

    inp = Path(args.input)
    if not inp.is_absolute():
        inp = ROOT / inp
    if not inp.exists():
        print(f"Input CSV not found: {inp}")
        return 1
    out = Path(args.output) if args.output else inp
    if not out.is_absolute():
        out = ROOT / out
    manual = Path(args.manual) if args.manual else (out.parent / "MANUAL_REQUIRED.csv")

    rows = list(csv.DictReader(open(inp, encoding="utf-8")))
    only = set(args.tracks) if args.tracks else None

    # video ids already committed (in the CSV or the live library) so we never repeat one
    used = set()
    for r in rows:
        used |= set(_VIDID.findall(r.get("video_id") or ""))
    used |= _library_video_ids()

    todo = [r for r in rows
            if not (r.get("video_id") or "").strip()
            and not (only and r.get("track") not in only)]

    filled = 0
    if args.broad:
        # week-context-aware: each row searched with its own week theme; row-by-row.
        week_titles = _week_title_lookup()
        print(f"Auto-filling {len(todo)} rows (BROAD, week-context aware)...")
        for r in todo:
            # Prefer an explicit `search` term (e.g. a clean week theme) over the
            # `concept` field, which may be a full week title kept for placement.
            concept = (r.get("search") or "").strip() or r.get("concept", "")
            if not concept:
                continue
            ctx = week_titles.get((r.get("track", ""), str(r.get("week", "")).strip()), "")
            for p in V.auto_discover_video_broad(concept, week_context=ctx, count=8):
                if p["video_id"] in used:
                    continue
                r["video_id"] = p["url"]
                r["duration_min"] = p["duration_min"]
                r["creator"] = p["creator"]
                used.add(p["video_id"])
                filled += 1
                break
            time.sleep(0.3)  # polite scraping
    else:
        groups = OrderedDict()
        for r in todo:
            groups.setdefault(r.get("concept", ""), []).append(r)
        print(f"Auto-filling {sum(len(v) for v in groups.values())} rows across {len(groups)} concepts...")
        for concept, grp in groups.items():
            if not concept:
                continue
            picks = [p for p in V.auto_discover_video(concept, count=len(grp) + 4)
                     if p["video_id"] not in used]
            for r, p in zip(grp, picks):
                r["video_id"] = p["url"]
                r["duration_min"] = p["duration_min"]
                r["creator"] = p["creator"]
                used.add(p["video_id"])
                filled += 1
            time.sleep(0.3)  # polite scraping

    cols = list(rows[0].keys())
    with open(out, "w", newline="", encoding="utf-8") as f:
        wr = csv.DictWriter(f, fieldnames=cols)
        wr.writeheader()
        wr.writerows(rows)
    leftovers = [r for r in rows if not (r.get("video_id") or "").strip() and (not only or r.get("track") in only)]
    if leftovers:
        with open(manual, "w", newline="", encoding="utf-8") as f:
            wr = csv.DictWriter(f, fieldnames=cols)
            wr.writeheader()
            wr.writerows(leftovers)

    print(f"Filled {filled} rows -> {out.name}. {len(leftovers)} need manual review -> "
          f"{manual.name if leftovers else '(none)'}")
    print("Next: python data/roadmaps/import_videos.py " + str(out) +
          " && python data/roadmaps/enrich_track.py --all")
    return 0


if __name__ == "__main__":
    sys.exit(main())
