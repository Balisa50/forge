#!/usr/bin/env python3
"""
coverage_report.py — video coverage per track, worst first, against targets.
Writes coverage_report.json and prints the priority order to attack.
Run: python coverage_report.py
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
TRACKS = [
    ('ai-engineering', 'ai-engineering-enriched.json', 22),
    ('cybersecurity', 'cybersecurity-enriched.json', 18),
    ('ai-automation', 'ai-automation-enriched.json', 16),
    ('ml-engineering', 'ml-engineering-enriched.json', None),
    ('data-science', 'data-science.json', None),
    ('data-analysis', 'data-analysis.json', None),
    ('data-engineering', 'data-engineering.json', None),
    ('full-stack-web', 'full-stack-web-enriched.json', None),
    ('mobile-engineering', 'mobile-engineering-enriched.json', None),
    ('devops-cloud', 'devops-cloud-enriched.json', None),
    ('bi-analytics', 'bi-analytics-enriched.json', None),
]


def main():
    report = {}
    rows = []
    for slug, fn, target in TRACKS:
        p = HERE / fn
        if not p.exists():
            continue
        d = json.loads(p.read_text(encoding='utf-8'))
        weeks = d['weeks'] if isinstance(d, dict) else d
        n = len(weeks)
        ge3 = ge1 = total = 0
        weak = []
        for w in weeks:
            v = sum(1 for day in w['days'] for it in day['items'] if it.get('kind') == 'video')
            total += v
            if v >= 1:
                ge1 += 1
            if v >= 3:
                ge3 += 1
            else:
                weak.append({'week': w['number'], 'title': w['title'], 'videos': v})
        tgt = target if target is not None else round(n * 0.8)
        report[slug] = {'weeks': n, 'videos': total, 'weeks_ge3': ge3, 'weeks_ge1': ge1,
                        'target_weeks_ge3': tgt, 'meets_target': ge3 >= tgt, 'weak_weeks': weak}
        rows.append((tgt - ge3, slug, n, ge3, ge1, total, tgt))

    (HERE / 'coverage_report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
    rows.sort(reverse=True)
    print("=" * 78)
    print("VIDEO COVERAGE — priority order (biggest gap to target first)")
    print("=" * 78)
    print(f"{'track':20s} {'weeks':>5} {'>=3vid':>7} {'>=1vid':>7} {'videos':>7} {'target>=3':>10} {'gap':>5}")
    for gap, slug, n, ge3, ge1, total, tgt in rows:
        flag = '' if ge3 >= tgt else f'  <-- need +{gap}'
        print(f"{slug:20s} {n:>5} {ge3:>7} {ge1:>7} {total:>7} {tgt:>10} {max(0, gap):>5}{flag}")
    print("-" * 78)
    print("Targets: AI-eng 22/24, Cyber 18/24, AI-automation 16/20, others >=80% of weeks with >=3.")
    print("Fill the gap with: python gen_pending.py  ->  edit PENDING_VIDEOS.csv  ->  python import_videos.py")


if __name__ == '__main__':
    main()
