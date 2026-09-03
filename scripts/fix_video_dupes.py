"""
fix_video_dupes.py — Remove duplicate video URLs from roadmap JSON files.

For each track, the FIRST occurrence of a video URL is kept.
Every subsequent occurrence (a lazy paste) is removed from the day's items array.
Empty days are never produced — if removing a video makes a day have 0 items,
the video is kept anyway.

Run from FORGE root:
    python scripts/fix_video_dupes.py
"""

import json
import pathlib
import re
from collections import defaultdict

ROOT = pathlib.Path(".")

TRACK_FILES = {
    "data-science":       "data/roadmaps/data-science.json",
    "data-analysis":      "data/roadmaps/data-analysis.json",
    "data-engineering":   "data/roadmaps/data-engineering.json",
    "ai-automation":      "data/roadmaps/ai-automation-enriched.json",
    "ai-engineering":     "data/roadmaps/ai-engineering-enriched.json",
    "bi-analytics":       "data/roadmaps/bi-analytics-enriched.json",
    "cybersecurity":      "data/roadmaps/cybersecurity-enriched.json",
    "devops-cloud":       "data/roadmaps/devops-cloud-enriched.json",
    "full-stack-web":     "data/roadmaps/full-stack-web-enriched.json",
    "ml-engineering":     "data/roadmaps/ml-engineering-enriched.json",
    "mobile-engineering": "data/roadmaps/mobile-engineering-enriched.json",
}

def extract_url(item: dict) -> str | None:
    url = (item.get("url") or "").strip()
    if "youtube" in url or "youtu.be" in url or "vimeo" in url:
        return url
    return None

def dedupe_track(data: dict) -> tuple[dict, int]:
    """Remove duplicate video URLs from track data. Returns (modified_data, removed_count)."""
    seen: set[str] = set()
    removed = 0
    for week in data.get("weeks", []):
        for day in week.get("days", []):
            items = day.get("items", [])
            new_items = []
            day_removed = []
            for item in items:
                url = extract_url(item)
                if url and url in seen:
                    day_removed.append(item)
                else:
                    if url:
                        seen.add(url)
                    new_items.append(item)
            # Safety: never empty a day
            if len(new_items) == 0:
                new_items = items  # revert
            else:
                removed += len(day_removed)
                day["items"] = new_items
    return data, removed

def main():
    total_removed = 0
    for track, fpath in TRACK_FILES.items():
        p = ROOT / fpath
        if not p.exists():
            print(f"  SKIP  {fpath} (not found)")
            continue
        data = json.loads(p.read_text(encoding="utf-8"))
        data, count = dedupe_track(data)
        if count > 0:
            p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"  [{track}]  removed {count} duplicate video items  →  {fpath}")
        else:
            print(f"  [{track}]  no duplicates found")
        total_removed += count
    print(f"\nTotal duplicate video items removed: {total_removed}")

if __name__ == "__main__":
    main()
