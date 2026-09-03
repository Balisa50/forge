"""
Lighten 4 weeks so they fit comfortably in 7 days for a beginner with a day job.

1. DS W2 Math — redistribute heavy video load away from Days 1-2
2. DS W8 Web Scraping — Selenium + Scrapy become OPTIONAL, BS4 mandatory
3. DS W16 SHAP — drop the transformer SHAP requirement; LinearExplainer is core
4. DA W21 dbt — drop dbt docs from required acceptance; keep as optional
"""

import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data", "roadmaps")


def find_week(data, n):
    for w in data["weeks"]:
        if w["number"] == n:
            return w
    return None


def find_day(week, n):
    for d in week.get("days", []):
        if d["number"] == n:
            return d
    return None


# ── DS W2 Math: redistribute ────────────────────────────────────────────
def lighten_ds_math(data):
    w = find_week(data, 2)
    if not w:
        return
    # Day 1: just intro video + reflect (already light — leave it)
    # Day 2: was heavy with 2 videos + exercise. Move 1 video to Day 3.
    d2 = find_day(w, 2)
    d3 = find_day(w, 3)
    if d2 and d3 and len(d2["items"]) >= 3:
        # Move the second video from Day 2 to Day 3 (front of items)
        moved_video = d2["items"].pop(1)  # the 3Blue1Brown Ep 2 video
        d3["items"].insert(0, moved_video)
        d3["summary"] = "Vectors + dot products + probability distributions, on real fare data."
    print("  OK DS W2 Math: redistributed video load (Day 2 → Day 3)")


# ── DS W8 Web Scraping: Selenium + Scrapy optional ──────────────────────
def lighten_ds_scraping(data):
    w = find_week(data, 8)
    if not w or "scraping" not in w["title"].lower():
        return
    # Day 4 = Selenium → mark OPTIONAL
    d4 = find_day(w, 4)
    if d4:
        d4["title"] = "When BS4 fails (OPTIONAL) — JS-rendered sites"
        d4["summary"] = "Optional. Only do this if you finish Day 3 with time left or want to learn it."
        # Make the exercise prefix clear
        for it in d4["items"]:
            if it["kind"] == "exercise":
                it["body"] = "(OPTIONAL — skip if short on time)\n\n" + it["body"]
    # Day 5 = Scrapy → mark OPTIONAL
    d5 = find_day(w, 5)
    if d5:
        d5["title"] = "Scrapy for scale (OPTIONAL)"
        d5["summary"] = "Optional. BS4 handles 80% of real scraping. Scrapy is for industrial scale — try it if curious."
        for it in d5["items"]:
            if it["kind"] == "exercise":
                it["body"] = "(OPTIONAL — skip if short on time)\n\n" + it["body"]
    # Drop the Selenium + Scrapy requirements from acceptance (Day 7)
    d7 = find_day(w, 7)
    if d7:
        for it in d7["items"]:
            if it["kind"] == "exercise":
                it["body"] = (
                    "Create new repo `hn-scraper`. Push the BS4 scraper + README.\n\n"
                    "PASS:\n"
                    "  ☐ BS4 scraper pulls 5 pages of HN\n"
                    "  ☐ Saves to hn.csv with rate limiting\n"
                    "  ☐ Sentiment-tagged sample of titles\n"
                    "  ☐ README documents ethics rules\n"
                    "  ☐ Repo pushed\n\n"
                    "OPTIONAL bonus (skip if short on time):\n"
                    "  ☐ Selenium hello world\n"
                    "  ☐ Scrapy version with jsonl output"
                )
    # Trim tasks list to remove "must do Selenium/Scrapy"
    w["tasks"] = [
        "Read robots.txt + write your scraping ethics rules",
        "BS4 scraper for HN front page",
        "Multi-page scraping with rate limit",
        "Sentiment-tag the scraped titles with a pretrained model",
        "Push hn-scraper repo",
        "OPTIONAL: try Selenium / Scrapy if time permits",
    ]
    print("  OK DS W8 Scraping: Selenium + Scrapy marked OPTIONAL")


# ── DS W16 SHAP: drop transformer SHAP from required ────────────────────
def lighten_ds_shap(data):
    # After splicing, SHAP is at W16 in DS now
    w = find_week(data, 16)
    if not w or "shap" not in w["title"].lower() and "interpret" not in w["title"].lower():
        # Try W17 in case numbering shifted
        for n in (17, 18, 15):
            ww = find_week(data, n)
            if ww and ("shap" in ww["title"].lower() or "interpret" in ww["title"].lower()):
                w = ww
                break
    if not w:
        return
    # Day 5 = transformer SHAP → mark OPTIONAL
    d5 = find_day(w, 5)
    if d5:
        d5["title"] = "Explain the transformer (OPTIONAL — slow on CPU)"
        d5["summary"] = "Optional. Computing SHAP on DistilBERT takes 30+ min per run without a GPU. Skip if your machine is slow — the LogReg version from Days 3-4 is enough."
        for it in d5["items"]:
            if it["kind"] == "exercise":
                it["body"] = "(OPTIONAL — slow on CPU, skip if needed)\n\n" + it["body"]
    # Drop the transformer requirement from acceptance (Day 7)
    d7 = find_day(w, 7)
    if d7:
        for it in d7["items"]:
            if it["kind"] == "exercise":
                it["body"] = it["body"].replace(
                    "PASS:\n",
                    "PASS:\n  (transformer SHAP from Day 5 is OPTIONAL — not required)\n"
                )
    print("  OK DS W16 SHAP: transformer SHAP marked OPTIONAL")


# ── DA W21 dbt: docs day becomes optional ───────────────────────────────
def lighten_da_dbt(data):
    w = find_week(data, 21)
    if not w or "dbt" not in w["title"].lower():
        return
    # Day 6 = tests + docs → split: tests required, docs optional
    d6 = find_day(w, 6)
    if d6:
        d6["title"] = "Add tests (docs OPTIONAL)"
        d6["summary"] = "Tests are required — that's what makes dbt powerful. Docs generation is great-to-see but optional this week."
        for it in d6["items"]:
            if it["kind"] == "exercise":
                # Mark the docs step optional in the body
                it["body"] = it["body"].replace(
                    "STEP 3 — Generate docs:",
                    "STEP 3 — (OPTIONAL) Generate docs:"
                )
    # Day 7: drop docs from acceptance
    d7 = find_day(w, 7)
    if d7:
        for it in d7["items"]:
            if it["kind"] == "exercise":
                it["body"] = it["body"].replace(
                    "  ☐ dbt docs work locally\n",
                    "  ☐ (OPTIONAL) dbt docs generated locally\n"
                )
    print("  OK DA W21 dbt: docs marked OPTIONAL")


# ── Apply ───────────────────────────────────────────────────────────────
for slug, fixers in [
    ("data-science", [lighten_ds_math, lighten_ds_scraping, lighten_ds_shap]),
    ("data-analysis", [lighten_da_dbt]),
]:
    path = os.path.join(DATA_DIR, f"{slug}.json")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    for fixer in fixers:
        fixer(data)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
