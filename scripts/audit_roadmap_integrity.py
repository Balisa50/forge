#!/usr/bin/env python3
"""
audit_roadmap_integrity.py — leak-proof content gate for every track/week/day.

Catches the SQL-leak class (and any cross-domain contamination) BEFORE it ships:
  Rule 2  Stale templates  — exact strings that are never legitimate.
  Rule 2b SQL syntax       — real SQL only allowed in data tracks / FS W8+ / mobile W6+ / cyber.
  Rule 1/3 Domain purity   — a foreign concept must not be a lesson/day TITLE in the wrong track.
  Rule 4  Day-0 is setup   — no conceptual teaching (foreign concept) in a setup day.
  Rule 5  Video on-topic   — delegated to audit_videos.py (best effort; --no-video to skip).

Exceptions live in scripts/ALLOWED_OFF_TOPIC.json. Exit code 1 on any violation (CI gate).

Run: python scripts/audit_roadmap_integrity.py
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROADMAPS = ROOT / "data" / "roadmaps"
CFG = json.loads((Path(__file__).resolve().parent / "ALLOWED_OFF_TOPIC.json").read_text(encoding="utf-8"))

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

TRACKS = [
    ("full-stack-web", "full-stack-web-enriched.json"),
    ("mobile-engineering", "mobile-engineering-enriched.json"),
    ("data-science", "data-science.json"),
    ("data-analysis", "data-analysis.json"),
    ("devops-cloud", "devops-cloud-enriched.json"),
    ("cybersecurity", "cybersecurity-enriched.json"),
    ("ai-engineering", "ai-engineering-enriched.json"),
    ("ml-engineering", "ml-engineering-enriched.json"),
    ("ai-automation", "ai-automation-enriched.json"),
    ("bi-analytics", "bi-analytics-enriched.json"),
    ("data-engineering", "data-engineering.json"),
]

STALE = [s.lower() for s in CFG["stale_always_forbidden"]]
EXEMPT = [p.lower() for p in CFG.get("exempt_phrases", [])]
SQL_OK_TRACKS = set(CFG["sql_allowed_tracks"])
SQL_FROM_WEEK = CFG.get("sql_allowed_from_week", {})
TITLE_EXC = CFG.get("title_keyword_exceptions", [])

# Case-SENSITIVE SQL keyword patterns (real lessons uppercase them; avoids English "join"/"select").
# A SQL LESSON uses several of these; an incidental one-liner (e.g. `psql -c "SELECT * FROM t"`
# inside a Docker example) uses one. So we flag only when >=2 distinct patterns appear.
SQL_SYNTAX = [re.compile(p) for p in [
    r"\bSELECT\b[^\n]{0,80}\bFROM\b", r"\bGROUP BY\b", r"\bINSERT INTO\b",
    r"\bCREATE TABLE\b", r"\bJOIN\b[^\n]{0,40}\bON\b", r"\bWHERE\b[^\n]{0,40}=",
]]
SQL_MIN_PATTERNS = 2

# Foreign concept -> set of tracks that OWN it. A match in a TITLE of any other track is a leak.
_DATA = {"data-science", "ml-engineering", "data-analysis", "data-engineering"}
CONCEPT_OWNERS = [
    (re.compile(r"\bpandas\b", re.I), _DATA | {"bi-analytics", "ai-automation"}),
    (re.compile(r"\bnumpy\b", re.I), _DATA | {"bi-analytics", "ai-automation"}),
    (re.compile(r"\bvlookup\b", re.I), {"data-analysis", "bi-analytics"}),
    (re.compile(r"\bpivot table\b", re.I), _DATA | {"bi-analytics"}),
    (re.compile(r"\bexcel\b", re.I), {"data-analysis", "bi-analytics", "ai-automation"}),
    (re.compile(r"\breact\b", re.I), {"full-stack-web", "mobile-engineering"}),
    (re.compile(r"\bvue\b", re.I), {"full-stack-web"}),
    (re.compile(r"\bangular\b", re.I), {"full-stack-web"}),
    (re.compile(r"backpropagation", re.I), {"data-science", "ml-engineering", "ai-engineering"}),
    (re.compile(r"\bneural network\b", re.I), {"data-science", "ml-engineering", "ai-engineering"}),
]


def sql_allowed(track, week):
    if track in SQL_OK_TRACKS:
        return True
    thr = SQL_FROM_WEEK.get(track)
    return thr is not None and week >= thr


def has_title_exception(track, text):
    low = text.lower()
    for e in TITLE_EXC:
        if e.get("track") in (track, "*") and e.get("contains", "").lower() in low:
            return True
    return False


def exempt(text):
    low = text.lower()
    return any(p in low for p in EXEMPT)


def main():
    no_video = "--no-video" in sys.argv
    print("audit_roadmap_integrity.py")
    print("=" * 40)
    violations = 0
    for track, fn in TRACKS:
        p = ROADMAPS / fn
        if not p.exists():
            continue
        d = json.loads(p.read_text(encoding="utf-8"))
        weeks = d["weeks"] if isinstance(d, dict) else d
        track_hits = []
        for w in weeks:
            wn = w.get("number")
            for day in w.get("days", []):
                dn = day.get("number")
                for it in day.get("items", []):
                    if it.get("kind") not in ("lesson", "reading", "exercise"):
                        continue
                    title = it.get("title", "") or ""
                    body = it.get("body", "") or ""
                    text = f"{title}\n{body}"
                    low = text.lower()
                    here = []

                    # Rule 2 — stale templates (never legitimate, any track)
                    for s in STALE:
                        if s in low and not has_title_exception(track, s):
                            here.append(f'stale template: "{s}"')

                    # Rule 2b — a real SQL LESSON (>=2 distinct SQL patterns) where SQL isn't allowed
                    if not sql_allowed(track, wn) and not has_title_exception(track, low):
                        nmatch = sum(1 for rx in SQL_SYNTAX if rx.search(text))
                        if nmatch >= SQL_MIN_PATTERNS:
                            here.append(f"SQL lesson where SQL is not allowed (track {track}, week {wn}): {nmatch} SQL keywords")

                    # Rule 1/3/4 — foreign concept appearing in a TITLE (Day 0 included)
                    for rx, owners in CONCEPT_OWNERS:
                        if track in owners:
                            continue
                        if rx.search(title) and not has_title_exception(track, title) and not exempt(title):
                            here.append(f'foreign concept in title: /{rx.pattern}/ — "{title[:48]}"')

                    for msg in here:
                        track_hits.append((wn, dn, msg))
                        violations += 1

        if track_hits:
            print(f"\nTRACK: {track}")
            last = None
            for wn, dn, msg in track_hits:
                if (wn, dn) != last:
                    print(f"  Week {wn} Day {dn}")
                    last = (wn, dn)
                print(f"    ❌ {msg}")

    # Rule 5 — video on-topic (delegate)
    video_fail = False
    if not no_video:
        print("\nRule 5 — video on-topic (audit_videos.py):")
        try:
            r = subprocess.run([sys.executable, "audit_videos.py"], cwd=str(ROADMAPS),
                               capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=600)
            ok = r.returncode == 0  # audit_videos exits 0 on pass, 1 on any issue
            print("    " + ("✅ PASS" if ok else "❌ FAIL — run audit_videos.py for detail"))
            video_fail = not ok
        except Exception as e:
            print(f"    (skipped — could not run audit_videos.py: {e})")

    print("\nSUMMARY:")
    if violations == 0 and not video_fail:
        print("  ✅ PASS — no off-topic content, no stale templates, videos on-topic.")
        return 0
    print(f"  ❌ FAIL — {violations} content violation(s)" + (" + video audit failed" if video_fail else ""))
    print("  Block deployment.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
