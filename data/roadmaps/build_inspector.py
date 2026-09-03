#!/usr/bin/env python3
"""
build_inspector.py — bundle all roadmaps + validation flags into roadmap-data.js
for the standalone Roadmap Inspector (roadmap-inspector.html).

Slims the 11MB of JSON down to what the inspector needs (lesson previews, video
meta, concept-check shape, exercise labels) and PRECOMPUTES the validation each
track/week/day passes or fails — including video on-topic (track domain) and
liveness (from .video-cache.json), which a file:// browser page can't check itself.

Run:  python build_inspector.py   then open roadmap-inspector.html
"""
import json
import re
from pathlib import Path

import enrich_track as E  # top-level import only — no network calls

HERE = Path(__file__).resolve().parent

TRACKS = [
    ('data-science', 'data-science.json'),
    ('data-analysis', 'data-analysis.json'),
    ('ai-engineering', 'ai-engineering-enriched.json'),
    ('ml-engineering', 'ml-engineering-enriched.json'),
    ('devops-cloud', 'devops-cloud-enriched.json'),
    ('full-stack-web', 'full-stack-web-enriched.json'),
    ('mobile-engineering', 'mobile-engineering-enriched.json'),
    ('cybersecurity', 'cybersecurity-enriched.json'),
    ('bi-analytics', 'bi-analytics-enriched.json'),
    ('ai-automation', 'ai-automation-enriched.json'),
    ('data-engineering', 'data-engineering.json'),
]

EX_LABEL = re.compile(r'^\s*\[(CODE|WRITE|PRODUCE)\]')
YT = re.compile(r'(?:watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})')

# url -> library key (for on-topic check)
E.load_curated_library()  # merge curated videos so their URLs are recognised as on-topic
URL2KEY = {}        # first key (for display)
URL2KEYS = {}       # all keys a url belongs to (a video can serve several concepts)
for key, entries in E.KNOWN_GOOD.items():
    for tup in entries:
        URL2KEY.setdefault(tup[0], key)
        URL2KEYS.setdefault(tup[0], set()).add(key)


def load_cache():
    p = HERE / '.video-cache.json'
    if not p.exists():
        return {}
    try:
        return json.loads(p.read_text(encoding='utf-8'))
    except Exception:
        return {}


CACHE = load_cache()


def alive_of(url):
    rec = CACHE.get(url)
    if isinstance(rec, dict):
        return bool(rec.get('alive'))
    if isinstance(rec, bool):
        return rec
    return None  # unknown


def preview(body, n=120):
    t = re.sub(r'```.*?```', ' [code] ', body or '', flags=re.S)
    t = re.sub(r'[#*`>\-]+', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t[:n]


def main():
    tracks_out = []
    for slug, fn in TRACKS:
        p = HERE / fn
        if not p.exists():
            continue
        d = json.loads(p.read_text(encoding='utf-8'))
        weeks_raw = d['weeks'] if isinstance(d, dict) else d
        allowed = set(E._allowed_keys(slug)) if hasattr(E, '_allowed_keys') else set(E.TRACK_VIDEO_KEYS.get(slug, []))

        weeks_out, failures = [], []
        for w in weeks_raw:
            wn = w.get('number')
            days_raw = w.get('days', [])
            cc = w.get('concept_check', []) or []
            days_out = []
            wk_video_ct = 0
            for day in days_raw:
                dn = day.get('number')
                items = day.get('items', [])
                counts = {'lesson': 0, 'video': 0, 'swipe': 0, 'exercise': 0}
                lesson_preview = ''
                vid = None
                for it in items:
                    k = it.get('kind')
                    if k in counts:
                        counts[k] += 1
                    if k == 'lesson' and not lesson_preview:
                        lesson_preview = preview(it.get('body', ''))
                    if k == 'video' and vid is None:
                        url = it.get('url', '')
                        key = URL2KEY.get(url)
                        vid = {
                            'title': it.get('title', ''), 'creator': it.get('creator', ''),
                            'duration_min': it.get('duration_min'), 'why': it.get('why', ''),
                            'url': url, 'vidid': (YT.search(url).group(1) if YT.search(url) else ''),
                            'alive': alive_of(url), 'onTopic': bool(URL2KEYS.get(url, set()) & allowed),
                            'key': key or '?', 'curated': it.get('difficulty') == 'curated',
                        }
                        wk_video_ct += 1
                    # exercise label failure
                    if k == 'exercise' and not EX_LABEL.match(it.get('body', '') or ''):
                        failures.append({'week': wn, 'day': dn, 'kind': 'exercise-label',
                                         'msg': f'exercise missing [CODE]/[WRITE]/[PRODUCE]'})
                # video checks
                if vid:
                    if vid['onTopic'] is False:
                        failures.append({'week': wn, 'day': dn, 'kind': 'video-offtopic',
                                         'msg': f"off-topic video (key={vid['key']}) {vid['title']}"})
                    if (isinstance(vid['duration_min'], (int, float)) and vid['duration_min'] > 30
                            and not vid['curated']):
                        failures.append({'week': wn, 'day': dn, 'kind': 'video-long',
                                         'msg': f"video {vid['duration_min']}min > 30"})
                    if vid['alive'] is False:
                        failures.append({'week': wn, 'day': dn, 'kind': 'video-dead',
                                         'msg': f"dead video {vid['url']}"})
                first_cc = None
                days_out.append({
                    'number': dn, 'title': day.get('title', ''), 'counts': counts,
                    'lessonPreview': lesson_preview, 'video': vid,
                })
            # concept-check shape
            cc_shape_ok = len(cc) == 3
            for ci, q in enumerate(cc):
                ch = q.get('choices', [])
                ok = (isinstance(ch, list) and len(ch) == 4 and all(isinstance(x, str) and x.strip() for x in ch)
                      and isinstance(q.get('correct'), int) and 0 <= q.get('correct') <= 3
                      and isinstance(q.get('explain'), str) and len(q.get('explain')) >= 20
                      and isinstance(q.get('q'), str) and q.get('q').strip().endswith('?'))
                if not ok:
                    cc_shape_ok = False
                    failures.append({'week': wn, 'day': 0, 'kind': 'cc-shape',
                                     'msg': f'concept_check[{ci}] malformed'})
            day_nums = sorted(x.get('number') for x in days_raw)
            has8 = day_nums == list(range(8))
            if not has8:
                failures.append({'week': wn, 'day': 0, 'kind': 'days', 'msg': f'days={day_nums} (need 0..7)'})
            if len(cc) != 3:
                failures.append({'week': wn, 'day': 0, 'kind': 'cc-count', 'msg': f'{len(cc)} concept checks (need 3)'})

            first_q = cc[0].get('q', '')[:90] if cc else ''
            weeks_out.append({
                'number': wn, 'title': w.get('title', ''), 'nDays': len(days_raw),
                'nCC': len(cc), 'nVideos': wk_video_ct, 'firstCC': first_q,
                'days': days_out,
                'badges': {
                    'days8': has8, 'cc3': len(cc) == 3, 'ccShape': cc_shape_ok,
                    'noDead': not any(f['week'] == wn and f['kind'] == 'video-dead' for f in failures),
                    'onTopic': not any(f['week'] == wn and f['kind'] == 'video-offtopic' for f in failures),
                    'exLabels': not any(f['week'] == wn and f['kind'] == 'exercise-label' for f in failures),
                },
            })

        track_checks = {
            'all8days': all(w['badges']['days8'] for w in weeks_out),
            'all3cc': all(w['badges']['cc3'] for w in weeks_out),
            'ccShape': all(w['badges']['ccShape'] for w in weeks_out),
            'videosOnTopic': not any(f['kind'] == 'video-offtopic' for f in failures),
            'videosUnder30': not any(f['kind'] == 'video-long' for f in failures),
            'exLabels': not any(f['kind'] == 'exercise-label' for f in failures),
            'noDead': not any(f['kind'] == 'video-dead' for f in failures),
        }
        tracks_out.append({
            'slug': slug, 'title': d.get('title', slug) if isinstance(d, dict) else slug,
            'nWeeks': len(weeks_out), 'weeks': weeks_out,
            'checks': track_checks, 'failures': failures,
        })

    out = HERE / 'roadmap-data.js'
    out.write_text('window.ROADMAPS = ' + json.dumps(tracks_out, ensure_ascii=False) + ';\n', encoding='utf-8')
    total_fail = sum(len(t['failures']) for t in tracks_out)
    kb = out.stat().st_size // 1024
    print(f"Wrote {out.name} ({kb} KB): {len(tracks_out)} tracks, {total_fail} total flagged items.")
    for t in tracks_out:
        bad = [k for k, v in t['checks'].items() if not v]
        print(f"  {t['slug']:20s} weeks={t['nWeeks']:<3} failures={len(t['failures']):<4} {'OK' if not bad else 'FAIL:'+','.join(bad)}")


if __name__ == '__main__':
    main()
