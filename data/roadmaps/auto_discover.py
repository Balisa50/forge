#!/usr/bin/env python3
"""
auto_discover.py — fill CURATE_NEXT.csv automatically by SCRAPING YouTube search
(no API, no key, no card). For each concept it finds the best video from a TRUSTED
channel, on-topic (concept word must appear in the title), preferring shorter.

Quality guard (no off-topic ships):
  - channel must be in the trusted allow-list (video_api.TRUSTED_CHANNELS + the
    priority creators), matched against the search result's channel name;
  - the video title must share a significant word with the concept;
  - duration is read straight from the search result (lengthText).

Rows it can't fill from a trusted channel go to MANUAL_REQUIRED.csv.

Usage:
  python auto_discover.py                 # all rows in CURATE_NEXT.csv
  python auto_discover.py ai-engineering cybersecurity ai-automation   # only these tracks
"""
import csv
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

import video_api as V  # for TRUSTED_CHANNELS

HERE = Path(__file__).resolve().parent
CSV = HERE / "CURATE_NEXT.csv"
MANUAL = HERE / "MANUAL_REQUIRED.csv"

# Priority creators (preferred when several trusted options exist).
PRIORITY = ["fireship", "statquest", "3blue1brown", "networkchuck",
            "web dev simplified", "corey schafer", "dave ebbelaar", "pwnfunction"]
TRUSTED = set(V.TRUSTED_CHANNELS) | set(PRIORITY)
AUTO_MAX_MIN = 45  # auto-pick ceiling (manual curation can go longer)

_STOP = {"the", "a", "an", "of", "to", "and", "for", "with", "your", "you", "is", "in",
         "on", "how", "what", "why", "this", "intro", "introduction", "tutorial",
         "explained", "part", "vs", "using", "build", "your"}
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Accept-Language": "en-US,en;q=0.9"}


def toks(s):
    return {t for t in re.findall(r"[a-z0-9]+", (s or "").lower()) if len(t) >= 3 and t not in _STOP}


def channel_trusted(ch):
    c = (ch or "").lower().strip()
    if c in TRUSTED:
        return True
    return any(t in c for t in TRUSTED if len(t) >= 4)


def priority_rank(ch):
    c = (ch or "").lower()
    for i, p in enumerate(PRIORITY):
        if p in c:
            return i
    return len(PRIORITY)


def len_to_min(s):
    parts = (s or "").split(":")
    try:
        nums = [int(x) for x in parts]
    except ValueError:
        return None
    if len(nums) == 3:
        h, m, sec = nums
    elif len(nums) == 2:
        h, m, sec = 0, nums[0], nums[1]
    else:
        return None
    return max(1, h * 60 + m + (1 if sec else 0))


def search(concept):
    """Return ranked candidate list [(vid, channel, minutes, title)] for a concept."""
    url = "https://www.youtube.com/results?search_query=" + urllib.parse.quote_plus(f"{concept} tutorial")
    try:
        html = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20).read().decode("utf-8", "replace")
    except Exception:
        return []
    m = re.search(r'ytInitialData\s*=\s*(\{.*?\})\s*;\s*</script>', html, re.S) or re.search(r'var ytInitialData = (\{.*?\});', html, re.S)
    if not m:
        return []
    try:
        data = json.loads(m.group(1))
    except Exception:
        return []
    out = []
    seen = set()

    def walk(o):
        if isinstance(o, dict):
            if "videoRenderer" in o:
                v = o["videoRenderer"]
                vid = v.get("videoId")
                title = "".join(r.get("text", "") for r in v.get("title", {}).get("runs", []))
                ot = v.get("ownerText", {}).get("runs") or v.get("longBylineText", {}).get("runs")
                ch = ot[0].get("text", "") if ot else ""
                mins = len_to_min(v.get("lengthText", {}).get("simpleText", ""))
                if vid and vid not in seen:
                    seen.add(vid)
                    out.append((vid, ch, mins, title))
            for x in o.values():
                walk(x)
        elif isinstance(o, list):
            for x in o:
                walk(x)
    walk(data)
    ctoks = toks(concept)
    elig = []
    for vid, ch, mins, title in out:
        if mins is None or mins > AUTO_MAX_MIN:
            continue
        if not channel_trusted(ch):
            continue
        if ctoks and not (ctoks & toks(title)):
            continue
        elig.append((vid, ch, mins, title))
    elig.sort(key=lambda t: (priority_rank(t[1]), t[2]))  # priority channel, then shorter
    return elig


def main():
    only = set(a for a in sys.argv[1:] if not a.startswith("-"))
    rows = list(csv.DictReader(open(CSV, encoding="utf-8")))
    # group rows by concept (only unfilled, optionally filtered by track)
    from collections import OrderedDict, defaultdict
    groups = OrderedDict()
    for r in rows:
        if (r.get("video_id") or "").strip():
            continue
        if only and r["track"] not in only:
            continue
        groups.setdefault(r["concept"], []).append(r)

    print(f"Auto-discovering for {len(groups)} unique concepts ({sum(len(v) for v in groups.values())} rows)...")
    filled = 0
    cache = {}
    for concept, grp in groups.items():
        cands = cache.get(concept)
        if cands is None:
            cands = search(concept)
            cache[concept] = cands
            time.sleep(0.3)  # be polite
        need = len(grp)
        picks = cands[:need]
        for r, (vid, ch, mins, title) in zip(grp, picks):
            r["video_id"] = f"https://www.youtube.com/watch?v={vid}"
            r["duration_min"] = mins
            r["creator"] = ch
            filled += 1

    # write back CURATE_NEXT.csv and the manual leftovers
    cols = list(rows[0].keys())
    with open(CSV, "w", newline="", encoding="utf-8") as f:
        wr = csv.DictWriter(f, fieldnames=cols)
        wr.writeheader()
        wr.writerows(rows)
    manual = [r for r in rows if not (r.get("video_id") or "").strip() and (not only or r["track"] in only)]
    if manual:
        with open(MANUAL, "w", newline="", encoding="utf-8") as f:
            wr = csv.DictWriter(f, fieldnames=cols)
            wr.writeheader()
            wr.writerows(manual)

    print(f"Auto-filled {filled} rows. {len(manual)} rows need manual review -> {MANUAL.name if manual else '(none)'}")
    print("Next: python import_videos.py CURATE_NEXT.csv && python enrich_track.py --all")


if __name__ == "__main__":
    main()
