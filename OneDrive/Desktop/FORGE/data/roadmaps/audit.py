#!/usr/bin/env python3
"""Exhaustive audit of all 10 roadmap files against the bar-quality checklist."""
import json
import re
import sys
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

HERE = Path(__file__).resolve().parent

TRACKS = [
    'ai-automation-enriched',
    'ai-engineering-enriched',
    'bi-analytics-enriched',
    'cybersecurity-enriched',
    'data-analysis',
    'data-science',
    'devops-cloud-enriched',
    'full-stack-web-enriched',
    'ml-engineering-enriched',
    'mobile-engineering-enriched',
]

YT_URL_RE = re.compile(
    r'^https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[A-Za-z0-9_-]{11}'
)
YT_SEARCH_RE = re.compile(r'youtube\.com/results')
EXERCISE_LABEL_RE = re.compile(r'\[(CODE|WRITE|PRODUCE)\]', re.IGNORECASE)
GENERIC_FALLBACK_RE = re.compile(
    r'Implement the core concept demonstrated in the lesson', re.IGNORECASE
)


def load_track(slug):
    p = HERE / f'{slug}.json'
    with open(p, encoding='utf-8') as f:
        d = json.load(f)
    return d['weeks'] if isinstance(d, dict) else d


def iter_items(weeks):
    for wi, w in enumerate(weeks, 1):
        for d in w.get('days', []):
            for it in d.get('items', []):
                yield wi, d.get('number'), it


# ---------- Phase 1: structural audit ----------
def audit_track(slug):
    weeks = load_track(slug)
    results = {
        'structure': [],          # failures
        'concept_check': [],
        'no_search_urls': [],
        'real_yt_urls': [],
        'video_meta': [],          # missing duration/creator/why
        'duration_under_15': [],
        'day0_present': [],
        'day0_verification': [],
        'exercise_label': [],
        'generic_fallback': [],
        'video_diversity': [],
        'devops_w1_d1_sql': [],
    }

    # 1. Structure: 8 days per week, numbered 0-7
    for w in weeks:
        wn = w.get('number')
        days = w.get('days', [])
        if len(days) != 8:
            results['structure'].append(f'W{wn}: {len(days)} days (expected 8)')
        nums = sorted(d.get('number') for d in days)
        if nums != list(range(0, 8)):
            results['structure'].append(f'W{wn}: day numbers {nums} (expected 0-7)')

    # 2. concept_check shape
    for w in weeks:
        wn = w.get('number')
        cc = w.get('concept_check', [])
        if len(cc) != 3:
            results['concept_check'].append(f'W{wn}: {len(cc)} entries (expected 3)')
            continue
        for ci, q in enumerate(cc):
            if not isinstance(q.get('q'), str) or not q['q'].strip():
                results['concept_check'].append(f'W{wn}.cc[{ci}]: missing/empty q')
            ch = q.get('choices', [])
            if not (isinstance(ch, list) and len(ch) == 4 and all(isinstance(x, str) for x in ch)):
                results['concept_check'].append(f'W{wn}.cc[{ci}]: choices not 4 strings (got {len(ch) if isinstance(ch,list) else type(ch).__name__})')
            corr = q.get('correct')
            if not isinstance(corr, int) or not (0 <= corr <= 3):
                results['concept_check'].append(f'W{wn}.cc[{ci}]: correct not int 0-3 (got {corr!r})')
            ex = q.get('explain', '')
            if not isinstance(ex, str) or len(ex) < 20:
                results['concept_check'].append(f'W{wn}.cc[{ci}]: explain too short ({len(ex) if isinstance(ex,str) else 0} chars)')

    # 3. No YouTube search URLs anywhere; real YT urls for videos; video meta
    for wn, dn, it in iter_items(weeks):
        url = it.get('url', '') or ''
        if YT_SEARCH_RE.search(url):
            results['no_search_urls'].append(f'W{wn} D{dn} ({it.get("kind")}): {url}')
        if it.get('kind') == 'video':
            if not YT_URL_RE.match(url):
                results['real_yt_urls'].append(f'W{wn} D{dn}: bad video URL {url!r}')
            for fld in ('duration_min', 'creator', 'why'):
                if not it.get(fld):
                    results['video_meta'].append(f'W{wn} D{dn}: video missing {fld}')
            dur = it.get('duration_min')
            if isinstance(dur, (int, float)) and dur >= 15:
                results['duration_under_15'].append(f'W{wn} D{dn}: duration_min={dur}')

    # 4. Day 0 presence + verification exercise
    for w in weeks:
        wn = w.get('number')
        d0 = next((d for d in w.get('days', []) if d.get('number') == 0), None)
        if not d0:
            results['day0_present'].append(f'W{wn}: no Day 0')
            continue
        verify_text_re = re.compile(r'--version|version --|verify|check that|pass:|sts get-caller-identity|--client|run hello-world|connect to|prints', re.IGNORECASE)
        has_verify_ex = False
        for it in d0.get('items', []):
            if it.get('kind') == 'exercise':
                body = it.get('body', '') or ''
                if verify_text_re.search(body):
                    has_verify_ex = True
                    break
        if not has_verify_ex:
            results['day0_verification'].append(f'W{wn}: D0 has no verification-style exercise')

    # 5. Every day has an exercise with action label; no generic fallback
    for w in weeks:
        wn = w.get('number')
        for d in w.get('days', []):
            dn = d.get('number')
            exercises = [it for it in d.get('items', []) if it.get('kind') == 'exercise']
            if not exercises:
                results['exercise_label'].append(f'W{wn} D{dn}: no exercise')
                continue
            # at least one exercise must carry a [CODE]/[WRITE]/[PRODUCE] label
            if not any(EXERCISE_LABEL_RE.search(ex.get('body', '') or '') for ex in exercises):
                results['exercise_label'].append(f'W{wn} D{dn}: no [CODE]/[WRITE]/[PRODUCE] label on any exercise')
            for ex in exercises:
                body = ex.get('body', '') or ''
                if GENERIC_FALLBACK_RE.search(body):
                    results['generic_fallback'].append(f'W{wn} D{dn}: generic fallback present')

    # 6. Video diversity: at least 5 unique URLs per week
    for w in weeks:
        wn = w.get('number')
        urls = [it['url'] for d in w.get('days', []) for it in d.get('items', []) if it.get('kind') == 'video' and it.get('url')]
        unique = len(set(urls))
        if unique < 5:
            results['video_diversity'].append(f'W{wn}: {unique} unique videos (need >=5)')

    # 7. DevOps W1 D1 SQL fix (only meaningful for DevOps)
    if 'devops' in slug:
        d1 = next((d for d in weeks[0].get('days', []) if d.get('number') == 1), None)
        if d1:
            for it in d1.get('items', []):
                if it.get('kind') == 'lesson':
                    body = it.get('body', '') or ''
                    title = it.get('title', '') or ''
                    if re.search(r'\bSQL\b', title) or 'What SQL is' in body[:200]:
                        results['devops_w1_d1_sql'].append(f"W1 D1 lesson '{title}' still SQL-themed")
                    break

    return results


# ---------- Phase 2: live YouTube oembed check ----------
def check_url_live(url):
    """Return (url, ok, reason). Uses YouTube oembed API."""
    req = urllib.request.Request(
        f'https://www.youtube.com/oembed?url={urllib.parse.quote(url, safe="")}&format=json',
        headers={'User-Agent': 'Mozilla/5.0 audit-bot'}
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as r:
            if r.status == 200:
                return (url, True, 'OK')
            return (url, False, f'status {r.status}')
    except urllib.error.HTTPError as e:
        return (url, False, f'HTTP {e.code}')
    except Exception as e:
        return (url, False, type(e).__name__)


def collect_unique_video_urls():
    urls = set()
    for slug in TRACKS:
        weeks = load_track(slug)
        for _, _, it in iter_items(weeks):
            if it.get('kind') == 'video' and YT_URL_RE.match(it.get('url', '') or ''):
                urls.add(it['url'])
    return urls


def live_check(urls, workers=10):
    dead = {}
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futs = {pool.submit(check_url_live, u): u for u in urls}
        for fut in as_completed(futs):
            u, ok, reason = fut.result()
            if not ok:
                dead[u] = reason
    return dead


def main():
    # Collect unique URLs first for liveness phase
    print("Phase 1: structural audit\n" + "=" * 60)
    track_reports = {}
    for slug in TRACKS:
        track_reports[slug] = audit_track(slug)

    print(f"\nPhase 2: live YouTube oembed check (this may take ~30s)\n" + "=" * 60)
    import urllib.parse
    globals()['urllib'].parse = urllib.parse  # ensure parse is accessible in worker
    unique_urls = collect_unique_video_urls()
    print(f"  Checking {len(unique_urls)} unique YouTube URLs...")
    dead = live_check(unique_urls)
    print(f"  Done. {len(dead)} dead/unavailable URLs.\n")

    # Per-track verdict
    print("=" * 60)
    print("PER-TRACK REPORT")
    print("=" * 60)
    overall_pass = True
    for slug in TRACKS:
        r = track_reports[slug]
        # Re-scan track for dead URLs
        weeks = load_track(slug)
        track_dead = []
        for wn, dn, it in iter_items(weeks):
            url = it.get('url', '') or ''
            if it.get('kind') == 'video' and url in dead:
                track_dead.append(f'W{wn} D{dn}: {url} ({dead[url]})')

        checks = [
            ('Structure (8 days, numbers 0-7)',     r['structure']),
            ('concept_check (3 with q/choices/correct/explain)', r['concept_check']),
            ('No YouTube search URLs',              r['no_search_urls']),
            ('Real YouTube video URLs',             r['real_yt_urls']),
            ('Video meta (duration_min, creator, why)', r['video_meta']),
            ('Video duration < 15 min',             r['duration_under_15']),
            ('No dead/private/deleted videos',      track_dead),
            ('Day 0 present every week',            r['day0_present']),
            ('Day 0 has verification exercise',     r['day0_verification']),
            ('Exercise has [CODE]/[WRITE]/[PRODUCE] label', r['exercise_label']),
            ('No generic fallback exercise',        r['generic_fallback']),
            ('Video diversity >= 5 unique/week',    r['video_diversity']),
        ]
        if 'devops' in slug:
            checks.append(('DevOps W1 D1 not SQL-themed', r['devops_w1_d1_sql']))

        print(f"\nTRACK: {slug}")
        track_passed = True
        for name, fails in checks:
            if not fails:
                print(f"  PASS  {name}")
            else:
                track_passed = False
                print(f"  FAIL  {name}  ({len(fails)} issue(s))")
                for f in fails[:6]:
                    print(f"        - {f}")
                if len(fails) > 6:
                    print(f"        ... and {len(fails)-6} more")
        verdict = 'PASS' if track_passed else 'FAIL'
        print(f"  FINAL VERDICT: {verdict}")
        if not track_passed:
            overall_pass = False

    print("\n" + "=" * 60)
    print(f"OVERALL: {'PASS' if overall_pass else 'FAIL'}")
    print("=" * 60)
    sys.exit(0 if overall_pass else 1)


if __name__ == '__main__':
    main()
