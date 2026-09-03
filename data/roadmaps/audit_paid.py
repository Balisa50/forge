#!/usr/bin/env python3
"""
audit_paid.py — flag anything that could force a student to pay, and propose a free
alternative. A student with $0, no credit card, and no crypto must finish every track.

Distinguishes:
  - REQUIRES: the text tells the student to sign up / get an API key / use a card.
  - mention:  the paid tool is only discussed/taught (allowed — we teach the standard).

Writes paid_services_report.json and prints a per-track summary.
Run: python audit_paid.py
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
TRACKS = [
    'ai-automation-enriched.json', 'ai-engineering-enriched.json', 'bi-analytics-enriched.json',
    'cybersecurity-enriched.json', 'data-analysis.json', 'data-engineering.json', 'data-science.json',
    'devops-cloud-enriched.json', 'full-stack-web-enriched.json', 'ml-engineering-enriched.json',
    'mobile-engineering-enriched.json',
]

# keyword (regex) -> (label, free alternative)
PAID = [
    (r'openai', 'OpenAI API (paid)', 'Ollama (local Llama 3) or Hugging Face free Inference API — no card'),
    (r'\bgpt-?[345]\b|\bgpt\b', 'GPT models (paid API)', 'Ollama local models (llama3, mistral, phi3)'),
    (r'anthropic|claude', 'Anthropic/Claude API (paid)', 'Ollama local model; same chat shape, swap the endpoint'),
    (r'\baws\b|amazon web services|\bs3\b|\bec2\b|cloudfront|sts get-caller', 'AWS (needs card)', 'LocalStack (mocks AWS) + MinIO (local S3); teach the concept locally'),
    (r'azure', 'Azure (needs card)', 'LocalStack / local tools'),
    (r'\bgcp\b|google cloud|gcloud', 'Google Cloud (needs card)', 'LocalStack / local Postgres / DuckDB'),
    (r'bigquery|\bbq\b', 'BigQuery (paid beyond free quota)', 'DuckDB (local, fast, same SQL) or Postgres'),
    (r'redshift', 'Redshift (paid)', 'DuckDB or Postgres locally'),
    (r'snowflake', 'Snowflake (paid)', 'DuckDB or Postgres locally'),
    (r'datadog', 'Datadog (paid)', 'Prometheus + Grafana (free, local)'),
    (r'sentry', 'Sentry (paid tier)', 'Self-hosted GlitchTip, or Sentry free dev tier (no card)'),
    (r'vercel', 'Vercel (Pro paid)', 'Vercel Hobby (free, no card) / Netlify / GitHub Pages'),
    (r'netlify', 'Netlify (paid tiers)', 'Netlify free tier / GitHub Pages — no card'),
    (r'\beas\b|expo application services', 'Expo EAS (paid build minutes)', 'Local builds (expo run:android / Xcode) — free'),
    (r'pinecone', 'Pinecone (paid)', 'Chroma or Qdrant (local, free)'),
    (r'fivetran|airbyte cloud', 'Managed ELT (paid)', 'Airbyte OSS (self-host) or plain Python'),
    (r'stripe', 'Stripe (live needs business)', 'Stripe TEST mode — free, no card needed for test keys'),
    (r'twilio|sendgrid|resend|postmark', 'Messaging/email SaaS (paid)', 'Mailpit/MailHog (local SMTP capture) for learning'),
]
REQUIRE_CUES = re.compile(
    r'\b(sign up|signup|create an? account|get an? (api )?key|api key|free trial|credit card|'
    r'billing|subscribe|upgrade|paid plan|enter your card|add a card)\b', re.I)


def scan_text(t):
    hits = []
    low = (t or '').lower()
    for pat, label, alt in PAID:
        for m in re.finditer(pat, low):
            i = m.start()
            ctx = (t[max(0, i - 60):i + 60] or '').replace('\n', ' ')
            requires = bool(REQUIRE_CUES.search(ctx))
            hits.append((label, alt, requires, ctx.strip()))
    return hits


def main():
    report = {'requires': [], 'mentions_count': {}, 'by_track': {}}
    for fn in TRACKS:
        p = HERE / fn
        if not p.exists():
            continue
        d = json.loads(p.read_text(encoding='utf-8'))
        slug = fn.replace('-enriched.json', '').replace('.json', '')
        weeks = d['weeks'] if isinstance(d, dict) else d
        req = 0
        ment = 0
        uncovered = 0
        for w in weeks:
            # Is this week's Day 0 covered by a free-path note?
            d0 = next((x for x in w.get('days', []) if x.get('number') == 0), None)
            covered = bool(d0 and any(it.get('kind') == 'lesson' and 'zero-cost path' in (it.get('body', '') or '').lower()
                                      for it in d0.get('items', [])))
            blobs = [('context', w.get('context', '')), ('project', str(w.get('project', '')))]
            for day in w.get('days', []):
                for it in day.get('items', []):
                    blobs.append((f"D{day.get('number')}:{it.get('kind')}", (it.get('title', '') or '') + ' ' + (it.get('body', '') or '')))
            for where, text in blobs:
                for label, alt, requires, ctx in scan_text(text):
                    if requires:
                        req += 1
                        if not covered:
                            uncovered += 1
                        report['requires'].append({'track': slug, 'week': w.get('number'), 'covered': covered,
                                                    'where': where, 'service': label, 'free_alt': alt, 'context': ctx})
                    else:
                        ment += 1
                        report['mentions_count'][label] = report['mentions_count'].get(label, 0) + 1
        report['by_track'][slug] = {'requires_payment': req, 'mentions': ment, 'uncovered': uncovered}

    (HERE / 'paid_services_report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
    print("=" * 70)
    print("PAID-SERVICES AUDIT")
    print("=" * 70)
    print(f"{'track':22s} requires  uncovered  mentions(teaching, ok)")
    total_uncovered = 0
    for slug, c in report['by_track'].items():
        total_uncovered += c['uncovered']
        flag = '  <-- UNCOVERED' if c['uncovered'] else ''
        print(f"  {slug:20s} {c['requires_payment']:>6}    {c['uncovered']:>6}     {c['mentions']:>5}{flag}")
    print("-" * 70)
    print(f"TOTAL requires-payment flags: {len(report['requires'])}  |  UNCOVERED (no free path): {total_uncovered}")
    print("RESULT:", "PASS — every paid requirement has a documented zero-cost path" if total_uncovered == 0 else f"FAIL — {total_uncovered} uncovered")
    print("Top required services to neutralise with a free path:")
    from collections import Counter
    top = Counter(r['service'] for r in report['requires'])
    for s, n in top.most_common(10):
        print(f"   {n:>4}  {s}")
    print("Full detail -> paid_services_report.json")


if __name__ == '__main__':
    main()
