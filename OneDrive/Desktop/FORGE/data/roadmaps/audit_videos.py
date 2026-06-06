#!/usr/bin/env python3
"""
Video audit — enforces the "no forced / off-topic video" rule across all tracks.
For every video present, confirm:
  1. its library key is in the track's allowed domain (on-topic),
  2. the day title directly keyword-matches that concept (a real match, not forced),
  3. duration < 10 minutes,
  4. it has creator + a >=20-char 'why'.
Also reports how many days correctly have NO video (taught by a second lesson).

Run: python audit_videos.py
"""
import json
import re
import sys
import enrich_track as E

extra = E.collect_all_raw_video_urls()
E.validate_library_and_collect(extra)

url2key = {}
for key, entries in E.KNOWN_GOOD.items():
    for tup in entries:
        url2key.setdefault(tup[0], key)

TRACKS = {
    'ai-automation': 'ai-automation-enriched.json', 'ai-engineering': 'ai-engineering-enriched.json',
    'bi-analytics': 'bi-analytics-enriched.json', 'cybersecurity': 'cybersecurity-enriched.json',
    'data-analysis': 'data-analysis.json', 'data-engineering': 'data-engineering.json',
    'data-science': 'data-science.json', 'devops-cloud': 'devops-cloud-enriched.json',
    'full-stack-web': 'full-stack-web-enriched.json', 'ml-engineering': 'ml-engineering-enriched.json',
    'mobile-engineering': 'mobile-engineering-enriched.json',
}


def day_keyword_matches(day_title: str, url: str, allowed_set: set) -> bool:
    """True if a concept keyword in the day title maps to an allowed key whose
    video set INCLUDES this url. (Some keys, e.g. 'vector'/'embedding', share a
    URL — matching by url handles those synonyms correctly.)"""
    c = (day_title or '').lower()
    for keyword, k in E.KEYWORD_VIDEO_MAP:
        if keyword in c and k in allowed_set and k in E.KNOWN_GOOD:
            if any(tup[0] == url for tup in E.KNOWN_GOOD[k]):
                return True
    return False


total_off = 0
total_videos = 0
total_novideo_days = 0
print("=" * 70)
print("VIDEO AUDIT — no forced / off-topic videos")
print("=" * 70)
for slug, fn in TRACKS.items():
    allowed = set(E._allowed_keys(slug))
    d = json.load(open(fn, encoding='utf-8'))
    weeks = d['weeks'] if isinstance(d, dict) else d
    issues = []
    vids = 0
    novideo = 0
    for w in weeks:
        for day in w.get('days', []):
            dn = day.get('number')
            has_v = False
            for it in day.get('items', []):
                if it.get('kind') != 'video':
                    continue
                has_v = True
                vids += 1
                url = it.get('url', '')
                key = url2key.get(url, '?UNKNOWN?')
                if key not in allowed:
                    issues.append(f"W{w['number']}D{dn}: OFF-DOMAIN key={key}")
                elif not day_keyword_matches(day.get('title', ''), url, allowed):
                    issues.append(f"W{w['number']}D{dn}: FORCED (no concept match) key={key} title='{day.get('title','')[:40]}'")
                dur = it.get('duration_min')
                if not isinstance(dur, (int, float)) or dur >= 10:
                    issues.append(f"W{w['number']}D{dn}: duration {dur} >= 10")
                if not it.get('creator') or len(it.get('why', '') or '') < 20:
                    issues.append(f"W{w['number']}D{dn}: missing creator/why")
            if dn != 0 and not has_v:
                novideo += 1
    total_videos += vids
    total_off += len(issues)
    total_novideo_days += novideo
    flag = 'OK' if not issues else f'{len(issues)} ISSUE(S)'
    print(f"  {slug:20s} videos={vids:3d}  no-video days={novideo:3d}  -> {flag}")
    for i in issues[:4]:
        print(f"        - {i}")

print("-" * 70)
print(f"Total videos: {total_videos} | days taught without a video: {total_novideo_days} | issues: {total_off}")
print("RESULT:", "PASS — every video is on-topic, concept-matched, and <10 min" if total_off == 0 else "FAIL")
print("=" * 70)
sys.exit(0 if total_off == 0 else 1)
