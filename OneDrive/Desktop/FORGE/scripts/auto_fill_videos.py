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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="CSV with concept/concept_key/track columns")
    ap.add_argument("--output", help="where to write the filled CSV (default: overwrite input)")
    ap.add_argument("--manual", help="where to write rows that need manual review")
    ap.add_argument("--tracks", nargs="*", default=None, help="only process these tracks")
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

    groups = OrderedDict()
    for r in rows:
        if (r.get("video_id") or "").strip():
            continue
        if only and r.get("track") not in only:
            continue
        groups.setdefault(r.get("concept", ""), []).append(r)

    print(f"Auto-filling {sum(len(v) for v in groups.values())} rows across {len(groups)} concepts...")
    filled = 0
    for concept, grp in groups.items():
        if not concept:
            continue
        picks = V.auto_discover_video(concept, count=len(grp))
        for r, p in zip(grp, picks):
            r["video_id"] = p["url"]
            r["duration_min"] = p["duration_min"]
            r["creator"] = p["creator"]
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
