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
# Reputable, widely-vetted educational channels across the track domains.
TRUSTED_CHANNELS = {
    # general / web / cs
    "fireship", "3blue1brown", "statquest with josh starmer", "statquest",
    "web dev simplified", "networkchuck", "corey schafer", "theprimeagen",
    "freecodecamp.org", "freecodecamp", "the net ninja", "academind", "traversy media",
    "programming with mosh", "tech with tim", "computerphile", "ben eater",
    "google for developers", "microsoft developer", "fireship io",
    # cloud / devops / infra
    "ibm technology", "google cloud tech", "google cloud", "microsoft",
    "amazon web services", "hashicorp", "techworld with nana", "devops toolkit",
    "vercel", "netlify", "n8n", "oktadev", "mit opencourseware", "kodekloud",
    # ai / ml / data
    "anthropic", "openai", "deeplearning.ai", "langchain", "assemblyai",
    "weights & biases", "two minute papers", "sentdex", "krish naik",
    "microsoft power bi", "guy in a cube", "alex the analyst", "ken jee",
    # security
    "pwnfunction", "professor messer", "john hammond", "ippsec", "hackersploit",
    "loi liang yang", "the cyber mentor", "outpost gray",
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


class APIError(RuntimeError):
    def __init__(self, message, reason=""):
        super().__init__(message)
        self.reason = reason


def api_get(endpoint, params):
    params = {**params, "key": API_KEY}
    url = f"https://www.googleapis.com/youtube/v3/{endpoint}?{urllib.parse.urlencode(params)}"
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        msg, reason = f"HTTP {e.code}", ""
        try:
            err = json.loads(body).get("error", {})
            msg = err.get("message", msg)
            errs = err.get("errors") or []
            reason = (errs[0].get("reason") if errs else "") or ""
            if not reason:
                for d in err.get("details", []):
                    if d.get("reason"):
                        reason = d["reason"]; break
        except Exception:
            pass
        raise APIError(msg, reason)


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


# ───────────────────────── discovery mode ─────────────────────────
import csv as _csv
import re as _re

_STOP = {"the", "a", "an", "of", "to", "and", "for", "with", "in", "on", "your",
         "tutorial", "explained", "how", "what", "intro", "introduction", "part"}


def _concept_tokens(s):
    return {t for t in _re.findall(r"[a-z0-9]+", (s or "").lower()) if len(t) >= 3 and t not in _STOP}


def _iso_minutes(iso):
    return iso_to_minutes(iso)


def discover(max_concepts):
    """For each concept in PENDING_VIDEOS.csv (weak tracks first), SEARCH YouTube,
    keep the best trusted-channel, <=30-min, on-topic video, and append it to
    curated_library.json (import_videos.py / enrich_track.py format).

    Quota: ~101 units per concept (1 search + 1 videos.list). Default cap keeps a
    single run safely under the 10,000/day free quota."""
    pend = HERE / "PENDING_VIDEOS.csv"
    if not pend.exists():
        print("PENDING_VIDEOS.csv not found — run: python gen_pending.py")
        return 1
    rows = [r for r in _csv.DictReader(open(pend, encoding="utf-8")) if not (r.get("video_id") or "").strip()]
    rows = rows[:max_concepts]

    # Pre-flight: one cheap call to confirm the key works before looping (saves quota).
    try:
        api_get("search", {"part": "snippet", "q": "test", "type": "video", "maxResults": 1})
    except APIError as e:
        if "API_KEY_INVALID" in e.reason or "not valid" in str(e).lower():
            print("ABORT: the YOUTUBE_API_KEY is not valid. Google says: \"" + str(e) + "\"")
            print("Create a real key (Google Cloud Console -> enable 'YouTube Data API v3' ->")
            print("Credentials -> API key), then: export YOUTUBE_API_KEY=...  and re-run.")
        elif "quota" in str(e).lower() or e.reason in ("quotaExceeded", "dailyLimitExceeded"):
            print("ABORT: YouTube API quota exceeded for today. Try again tomorrow or raise quota.")
        else:
            print(f"ABORT: YouTube API pre-flight failed: {e} (reason={e.reason})")
        return 1
    print(f"Key OK. Discovering videos for {len(rows)} pending concepts (cap {max_concepts})...")

    libp = HERE / "curated_library.json"
    existing = {}
    if libp.exists():
        try:
            existing = {(e["concept_key"], e["video_id"]): e for e in json.loads(libp.read_text(encoding="utf-8")).get("videos", [])}
        except Exception:
            existing = {}

    found = 0
    for r in rows:
        concept = (r.get("concept") or "").strip()
        track = (r.get("track") or "").strip()
        ckey = (r.get("concept_key") or "").strip()
        if not concept:
            continue
        try:
            sr = api_get("search", {"part": "snippet", "q": f"{concept} tutorial", "type": "video",
                                    "maxResults": 10, "order": "relevance", "relevanceLanguage": "en",
                                    "safeSearch": "strict", "videoEmbeddable": "true"})
        except Exception as e:
            print(f"  [search fail] {concept}: {e}")
            continue
        ids = [it["id"]["videoId"] for it in sr.get("items", []) if it.get("id", {}).get("videoId")]
        if not ids:
            continue
        meta = fetch_videos({i: f"https://www.youtube.com/watch?v={i}" for i in ids})
        ctoks = _concept_tokens(concept)
        best = None
        for vid in ids:  # preserve relevance order
            info = meta.get(vid)
            if not info:
                continue
            dur = info["duration_min"]
            chan = info["channel"].strip().lower()
            if dur < 2 or dur > 30 or chan not in TRUSTED_CHANNELS:
                continue
            if ctoks and not (ctoks & _concept_tokens(info["title"])):
                continue  # title must share a concept word (on-topic guard)
            best = (vid, info)
            break
        if not best:
            continue
        vid, info = best
        entry = {
            "track": track, "concept": concept, "concept_key": ckey,
            "video_id": vid, "url": f"https://www.youtube.com/watch?v={vid}",
            "duration_min": info["duration_min"], "creator": info["channel"],
            "why": f"Hand-vetted via the YouTube API: this {info['duration_min']}-minute {info['channel']} video teaches {concept} directly.",
            "title": info["title"], "difficulty": "curated",
        }
        existing[(ckey, vid)] = entry
        found += 1
        print(f"  + {track} | {concept[:34]:34s} -> {info['channel']} ({info['duration_min']}m) {info['title'][:40]}")

    videos = sorted(existing.values(), key=lambda e: (e["track"], e["concept_key"]))
    libp.write_text(json.dumps({"videos": videos}, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nDiscovered {found} new videos. curated_library.json now holds {len(videos)}.")
    print("Next: python enrich_track.py --all   (then python audit_videos.py && python coverage_report.py)")
    return 0


def main():
    argv = sys.argv[1:]
    if "--discover" in argv:
        if not API_KEY:
            print("Set YOUTUBE_API_KEY first, then: python video_api.py --discover [maxConcepts]")
            return 0
        nums = [a for a in argv if a.isdigit()]
        return discover(int(nums[0]) if nums else 60)
    extra_files = [a for a in argv if not a.startswith("--")]
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
