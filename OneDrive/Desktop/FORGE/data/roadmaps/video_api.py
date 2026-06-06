#!/usr/bin/env python3
"""
YouTube Data API video vetter — builds a self-auditing video_library.json.

For every candidate video (drawn from enrich_track.KNOWN_GOOD plus any URLs in
candidates.txt), this calls the YouTube Data API v3 to fetch:
  - real duration (ISO-8601 -> minutes), NOT a human estimate
  - channel title (verify the creator is on the trusted allow-list)
  - caption availability (optional signal of quality/accessibility)

A video is ACCEPTED only if its channel is trusted AND duration <= 30 min.
Results are written to video_library.json; enrich_track.py prefers that file when
present, so the curriculum's durations/creators become API-verified and the cap is
enforced on real data.

Usage:
  set YOUTUBE_API_KEY=...        (Windows)  / export YOUTUBE_API_KEY=...  (mac/linux)
  python video_api.py            # vet the built-in library
  python video_api.py more.txt   # also vet extra URLs (one per line)

No key set -> prints setup instructions and exits 0 (non-fatal); the enricher then
falls back to its oembed + title-gate verification.
"""
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "video_library.json"

API_KEY = os.environ.get("YOUTUBE_API_KEY") or os.environ.get("YT_API_KEY") or os.environ.get("GOOGLE_API_KEY")

# Trusted creators (matched case-insensitively against snippet.channelTitle).
TRUSTED_CHANNELS = {
    "fireship", "3blue1brown", "statquest with josh starmer", "statquest",
    "web dev simplified", "networkchuck", "corey schafer", "theprimeagen",
    "ibm technology", "google cloud tech", "google cloud", "microsoft",
    "microsoft power bi", "pwnfunction", "professor messer", "freecodecamp.org",
    "freecodecamp", "vercel", "netlify", "n8n", "oktadev", "techworld with nana",
    "devops toolkit", "mit opencourseware", "anthropic",
}

MAX_MIN = 30
VID_ID_RE = re.compile(r"(?:watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})")
ISO_DUR_RE = re.compile(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?")


def iso_to_minutes(iso: str) -> int:
    m = ISO_DUR_RE.fullmatch(iso or "")
    if not m:
        return 9999
    h, mi, s = (int(x) if x else 0 for x in m.groups())
    return h * 60 + mi + (1 if s else 0)  # round partial minute up


def collect_candidates(extra_files):
    import enrich_track as E
    urls = set()
    for entries in E.KNOWN_GOOD.values():
        for tup in entries:
            urls.add(tup[0])
    for f in extra_files:
        p = HERE / f
        if p.exists():
            for line in p.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line and not line.startswith("#"):
                    urls.add(line)
    ids = {}
    for u in urls:
        m = VID_ID_RE.search(u)
        if m:
            ids[m.group(1)] = u
    return ids


def api_get(endpoint, params):
    params = {**params, "key": API_KEY}
    url = f"https://www.googleapis.com/youtube/v3/{endpoint}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, timeout=15) as r:
        return json.loads(r.read().decode("utf-8"))


def fetch_videos(id_to_url):
    """videos.list in batches of 50 -> {id: {duration_min, channel, title}}."""
    out = {}
    ids = list(id_to_url)
    for i in range(0, len(ids), 50):
        batch = ids[i:i + 50]
        data = api_get("videos", {"part": "contentDetails,snippet", "id": ",".join(batch)})
        for item in data.get("items", []):
            vid = item["id"]
            out[vid] = {
                "duration_min": iso_to_minutes(item.get("contentDetails", {}).get("duration", "")),
                "channel": item.get("snippet", {}).get("channelTitle", ""),
                "title": item.get("snippet", {}).get("title", ""),
            }
    return out


def fetch_captions(video_id):
    try:
        data = api_get("captions", {"part": "snippet", "videoId": video_id})
        return len(data.get("items", [])) > 0
    except Exception:
        return None  # unknown (captions endpoint can require OAuth for some videos)


def main():
    extra_files = sys.argv[1:]
    if not API_KEY:
        print("=" * 68)
        print("YouTube Data API key not set — skipping (non-fatal).")
        print("To build a fully API-vetted library:")
        print("  1. Create a key: https://console.cloud.google.com/ -> APIs & Services")
        print("     -> enable 'YouTube Data API v3' -> Credentials -> API key")
        print("  2. set YOUTUBE_API_KEY=your_key   (or export on mac/linux)")
        print("  3. python video_api.py")
        print("The enricher already verifies videos via oembed + a title-identity gate,")
        print("so the curriculum remains correct without this step.")
        print("=" * 68)
        return 0

    id_to_url = collect_candidates(extra_files)
    print(f"Vetting {len(id_to_url)} videos via YouTube Data API...")
    meta = fetch_videos(id_to_url)

    records = []
    accepted = rejected = 0
    for vid, url in sorted(id_to_url.items()):
        info = meta.get(vid)
        if not info:
            records.append({"id": vid, "url": url, "ok": False, "reason": "not found / private / deleted"})
            rejected += 1
            continue
        channel = info["channel"]
        dur = info["duration_min"]
        trusted = channel.strip().lower() in TRUSTED_CHANNELS
        reasons = []
        if dur > MAX_MIN:
            reasons.append(f"duration {dur} > {MAX_MIN}")
        if not trusted:
            reasons.append(f"untrusted channel '{channel}'")
        ok = not reasons
        rec = {
            "id": vid, "url": url, "title": info["title"], "channel": channel,
            "duration_min": dur, "captions": fetch_captions(vid),
            "ok": ok, "reason": "; ".join(reasons) if reasons else "ok",
        }
        records.append(rec)
        accepted += int(ok)
        rejected += int(not ok)

    OUT.write_text(json.dumps({"videos": records}, indent=2), encoding="utf-8")
    print(f"  accepted={accepted}  rejected={rejected}")
    for r in records:
        if not r["ok"]:
            print(f"    [reject] {r['id']}: {r['reason']}")
    print(f"Wrote {OUT.name} ({len(records)} records).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
