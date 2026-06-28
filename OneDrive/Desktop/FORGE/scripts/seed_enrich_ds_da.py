"""
Enrichment: insert market-validated weeks into DS + DA roadmaps at the
correct pedagogical positions. Existing content is preserved & renumbered.

NEW WEEKS (15 total):
  DS (+8): Math, SQL, Stat Inference, Web Scraping, AI/Prompt Eng,
           A/B Testing, Synthetic Data, MLOps
  DA (+7): Python pandas, Stat Thinking, AI/Prompt Eng, Web Scraping,
           A/B Testing, Tableau, Storytelling

Sequence pushed by these positions; existing weeks shift later.
"""

import json, os
from urllib.parse import quote_plus

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data", "roadmaps")


def yt(v):     return f"https://www.youtube.com/watch?v={v}"
def search(q): return f"https://www.youtube.com/results?search_query={quote_plus(q)}"
def video(t, u, m, c, w=""):  return {"kind": "video", "title": t, "url": u, "duration_min": m, "creator": c, "why": w}
def reading(t, u, w=""):       return {"kind": "reading", "title": t, "url": u, "why": w}
def exercise(t, b):            return {"kind": "exercise", "title": t, "body": b}
def reflect(t, b):             return {"kind": "reflection", "title": t, "body": b}
def day(n, t, s, items):       return {"number": n, "title": t, "summary": s, "items": items}


def week(title, phase, hours, context, days, topics, tasks, project, exercises, questions, outputs):
    """Returns a week template; number is set by the splicer below."""
    return {
        "number": 0,  # set later
        "title": title, "phase": phase, "commitment_hours": hours,
        "context": context, "days": days, "topics": topics, "tasks": tasks,
        "project": project, "resources": [], "exercises": exercises,
        "questions": questions, "outputs": outputs,
    }


# ═══════════════════════════════════════════════════════════════════════
# DATA SCIENCE — 8 new weeks
# ═══════════════════════════════════════════════════════════════════════

DS_MATH = week(
    "Math you actually need (lin alg + prob + stats)", "Foundation", "12-18",
    "Before going deeper into ML, you need real math intuition. Linear algebra (vectors + matrices — the language of all ML models), probability (distributions, Bayes), and stats (mean, variance, distributions). Applied — we use these on the TaxiPulse data you just shipped, not on toy examples.",
    [
        day(1, "Why this week matters",
            "Most beginners skip math and hit a wall in Week 8 when models become opaque. Don't.",
            [
                video("Essence of Linear Algebra — 3Blue1Brown (15 min Ep 1)",
                      yt("fNk_zzaMoSs"), 15, "3Blue1Brown",
                      "Watch Ep 1 today. Visual intuition for vectors."),
                reflect("Three things",
                        "Write in notes.txt: (1) Why do ML models use VECTORS? (2) What's the dot product really doing? (3) What's a probability distribution in 1 sentence?"),
            ]),
        day(2, "Vectors + matrices on real data",
            "",
            [
                video("Linear Algebra for ML — 3Blue1Brown Ep 2",
                      yt("k7RM-ot2NWY"), 12, "3Blue1Brown", ""),
                exercise("NumPy fluency",
                         "In your taxipulse repo, create math.ipynb. Run:\n"
                         "      import numpy as np\n"
                         "      import pandas as pd\n"
                         "      df = pd.read_parquet('data/clean.parquet')\n"
                         "      X = df[['trip_distance','trip_minutes']].values  # shape (N, 2)\n"
                         "      print('Shape:', X.shape)\n"
                         "      print('Mean per column:', X.mean(axis=0))\n"
                         "      print('Std per column:', X.std(axis=0))\n"
                         "      print('Dot product of first two rows:', np.dot(X[0], X[1]))\n"
                         "      # Normalize: subtract mean, divide by std\n"
                         "      Xn = (X - X.mean(axis=0)) / X.std(axis=0)\n"
                         "      print('Normalized mean (should be ~0):', Xn.mean(axis=0))\n"
                         "Write 1 sentence under each: what does each operation MEAN for taxi data?"),
            ]),
        day(3, "Probability distributions",
            "",
            [
                video("Probability primer for ML (20 min)",
                      search("probability basics machine learning beginner 2024"),
                      20, "various"),
                exercise("Plot real distributions",
                         "      import matplotlib.pyplot as plt\n"
                         "      df['fare_amount'].hist(bins=50, range=(0,80))\n"
                         "      plt.title('Distribution of NYC taxi fares')\n"
                         "      plt.savefig('figures/fare_dist.png')\n"
                         "      # Compute key stats\n"
                         "      print('Mean fare:', df['fare_amount'].mean())\n"
                         "      print('Median fare:', df['fare_amount'].median())\n"
                         "      print('Std:', df['fare_amount'].std())\n"
                         "      print('Skewness:', df['fare_amount'].skew())\n"
                         "Is the distribution normal or skewed? Why does that matter for modelling?"),
            ]),
        day(4, "Bayes intuition",
            "",
            [
                video("Bayes theorem visual — 3Blue1Brown",
                      yt("HZGCoVF3YvM"), 15, "3Blue1Brown",
                      "P(A|B) = P(B|A) × P(A) / P(B) — Bayes will haunt your career."),
                reflect("A Bayes problem",
                        "In a city, 5% of flights are delayed >15 min. A weather alert is issued for 30% of delayed flights but only 8% of on-time flights. If you see a weather alert, what's the probability the flight is delayed? Show your math. Answer below.\n\n"
                        "P(D|A) = P(A|D)·P(D) / P(A) = 0.30 × 0.05 / (0.30·0.05 + 0.08·0.95) = 0.015 / 0.091 ≈ 16.5%\n\n"
                        "Notice: even with the alert, most flights still aren't delayed. THIS is why intuition fails on conditional probability."),
            ]),
        day(5, "Derivatives + gradient descent intuition",
            "",
            [
                video("Gradient descent visualized — 3Blue1Brown",
                      yt("IHZwWFHWa-w"), 21, "3Blue1Brown",
                      "Every ML model uses this. Watch carefully."),
                reflect("In your own words",
                        "Write 1 paragraph in notes.txt: in plain English, what does 'gradient descent' actually do when training a model?"),
            ]),
        day(6, "Linear regression by hand",
            "Connect math to ML. The math IS the model.",
            [
                exercise("Solve normal equation",
                         "      # Closed-form linear regression: beta = (X^T X)^-1 X^T y\n"
                         "      import numpy as np\n"
                         "      X = df[['trip_distance','trip_minutes']].values\n"
                         "      X = np.column_stack([np.ones(len(X)), X])  # add bias\n"
                         "      y = df['fare_amount'].values\n"
                         "      beta = np.linalg.inv(X.T @ X) @ X.T @ y\n"
                         "      print('Intercept:', beta[0])\n"
                         "      print('Per-mile:', beta[1])\n"
                         "      print('Per-minute:', beta[2])\n"
                         "Compare these numbers to NYC's real taxi base + per-mile rate. Match?"),
            ]),
        day(7, "Tag math-w1",
            "",
            [
                exercise("Acceptance",
                         "Commit math.ipynb to taxipulse repo. Update README to add a 'Math notebook' link.\n"
                         "      git add . && git commit -m 'math foundations notebook'\n\n"
                         "PASS:\n"
                         "  ☐ Computed mean/std/normalize with NumPy on real data\n"
                         "  ☐ Plotted + interpreted fare distribution\n"
                         "  ☐ Worked out a Bayes problem\n"
                         "  ☐ Solved linear regression by hand (closed form)\n"
                         "  ☐ Coefficients match real-world NYC rates"),
            ]),
    ],
    ["NumPy vectors + matrices", "Probability distributions + skewness", "Bayes' theorem with conditional probabilities", "Gradient descent intuition", "Closed-form linear regression"],
    ["Watch 3 of 3Blue1Brown's lin alg + Bayes + grad descent videos", "Use NumPy on real TaxiPulse data — mean/std/normalize", "Plot + interpret fare distribution", "Solve a Bayes conditional probability problem by hand", "Derive linear regression coefficients via the normal equation"],
    "Math notebook in taxipulse repo — applied math, not toy examples. Linear regression solved by hand matches real NYC taxi rates.",
    ["Plot the same dist before/after log-transform", "Compute the Pearson correlation between distance and fare by hand (no pandas .corr)", "Solve another Bayes problem (medical test screening)"],
    ["When does linear regression fail and why?", "What's the difference between sample mean and population mean?", "Why does normalizing features help most ML models?"],
    ["math.ipynb in taxipulse repo", "Solved Bayes problem in notes.txt", "Linear regression coefficients matching NYC real rates"],
)


DS_SQL = week(
    "SQL for Data Scientists", "Foundation", "12-15",
    "If you can't write SQL, you can't pull data from a real company. This week you rewrite your entire TaxiPulse analysis in SQL — joins, CTEs, window functions. By Sunday you can answer any 'show me X grouped by Y over Z time period' question.",
    [
        day(1, "SQL is not Excel",
            "",
            [
                video("SQL crash course (1 hour)",
                      search("sql crash course beginner full 2024"),
                      60, "various"),
                reading("SQLite Online — in-browser SQL",
                        "https://sqliteonline.com/",
                        "Click 'Open'. No install. Run queries instantly."),
            ]),
        day(2, "Load TaxiPulse data into SQL",
            "",
            [
                exercise("CSV → SQL",
                         "Convert clean.parquet to CSV (small sample for SQL):\n"
                         "      import pandas as pd\n"
                         "      df = pd.read_parquet('data/clean.parquet').sample(100_000)\n"
                         "      df.to_csv('data/taxi_sample.csv', index=False)\n\n"
                         "Open sqliteonline.com. Click '+' → Import → CSV → upload taxi_sample.csv. Table named 'taxi'.\n"
                         "Test: SELECT COUNT(*) FROM taxi;"),
            ]),
        day(3, "SELECT, WHERE, GROUP BY",
            "",
            [
                exercise("Rewrite Q1 in SQL",
                         "      -- Q1: trips by hour (from your TaxiPulse Week 1)\n"
                         "      SELECT pickup_hour, COUNT(*) AS trips\n"
                         "      FROM taxi\n"
                         "      GROUP BY pickup_hour\n"
                         "      ORDER BY trips DESC\n"
                         "      LIMIT 5;\n\n"
                         "Save in queries.sql. Compare to your pandas result — match?"),
            ]),
        day(4, "Joins (LEFT, INNER)",
            "",
            [
                exercise("Add zone lookup",
                         "Import taxi_zone_lookup.csv as 'zones'.\n"
                         "      SELECT z.Borough, COUNT(*) AS trips\n"
                         "      FROM taxi t\n"
                         "      LEFT JOIN zones z ON z.LocationID = t.PULocationID\n"
                         "      GROUP BY z.Borough\n"
                         "      ORDER BY trips DESC;"),
            ]),
        day(5, "Window functions",
            "",
            [
                exercise("Top 3 per borough",
                         "      SELECT * FROM (\n"
                         "        SELECT z.Borough, t.pickup_hour, COUNT(*) AS trips,\n"
                         "               ROW_NUMBER() OVER (PARTITION BY z.Borough ORDER BY COUNT(*) DESC) AS rn\n"
                         "        FROM taxi t LEFT JOIN zones z ON z.LocationID = t.PULocationID\n"
                         "        GROUP BY z.Borough, t.pickup_hour\n"
                         "      ) WHERE rn <= 3;\n\n"
                         "This is impossible cleanly in pandas. SQL wins."),
            ]),
        day(6, "CTEs (WITH ...)",
            "",
            [
                exercise("Multi-step analysis",
                         "      WITH busy AS (\n"
                         "        SELECT pickup_hour, COUNT(*) AS trips FROM taxi GROUP BY pickup_hour\n"
                         "      ),\n"
                         "      avg_busy AS (SELECT AVG(trips) AS avg_trips FROM busy)\n"
                         "      SELECT b.pickup_hour, b.trips,\n"
                         "             ROUND(100.0 * (b.trips - a.avg_trips) / a.avg_trips, 1) AS pct_vs_avg\n"
                         "      FROM busy b CROSS JOIN avg_busy a\n"
                         "      ORDER BY pct_vs_avg DESC;"),
            ]),
        day(7, "Save 10 queries + push",
            "",
            [
                exercise("queries.sql ships",
                         "Save 10 SQL queries answering your TaxiPulse questions. Each with a comment.\n"
                         "      git add queries.sql data/taxi_zone_lookup.csv\n"
                         "      git commit -m 'SQL version of TaxiPulse analysis'\n\n"
                         "PASS:\n"
                         "  ☐ 10 commented queries in queries.sql\n"
                         "  ☐ Each result matches pandas equivalent\n"
                         "  ☐ At least 1 window function + 1 CTE used"),
            ]),
    ],
    ["SELECT/WHERE/GROUP BY", "JOIN types (INNER, LEFT)", "Window functions (ROW_NUMBER, RANK)", "CTEs / WITH clauses", "Validating SQL against pandas"],
    ["Set up SQLite Online", "Import 100k taxi rows + zone lookup", "Rewrite 3 TaxiPulse pivots in SQL", "Use a window function for 'top-N per group'", "Use a CTE for multi-step analysis", "Commit 10 commented queries"],
    "TaxiPulse SQL — 10 queries that replicate your pandas analysis. queries.sql committed.",
    ["Try BigQuery's public NYC TLC dataset (it's free + faster)", "Write a query that finds outlier trips (fare > 99th pct of distance bucket)", "Convert one query to a stored procedure"],
    ["When is SQL faster than pandas? When isn't it?", "What's a window function vs a GROUP BY?", "Why use a CTE instead of nested subqueries?"],
    ["queries.sql with 10 commented queries", "Validation: SQL = pandas results", "1 window function + 1 CTE"],
)


DS_STATS = week(
    "Statistical inference + hypothesis testing", "Foundation", "12-15",
    "You SAID the 6pm hour is busiest. But is it SIGNIFICANTLY busier — or could it be random noise? This week you learn to answer that with p-values, confidence intervals, and t-tests. Applied to TaxiPulse and FlightWise data.",
    [
        day(1, "Why p-values matter",
            "",
            [
                video("Hypothesis testing in 15 minutes",
                      search("hypothesis testing p value beginner explained"),
                      15, "various"),
                reflect("Three questions",
                        "Write down (don't google):\n"
                        "  1. What's a null hypothesis?\n"
                        "  2. What does p < 0.05 actually mean?\n"
                        "  3. What's a Type I vs Type II error?"),
            ]),
        day(2, "Confidence intervals",
            "",
            [
                exercise("CI on mean fare",
                         "      import numpy as np\n"
                         "      from scipy import stats\n"
                         "      fares = df['fare_amount'].sample(1000).values\n"
                         "      mean = fares.mean()\n"
                         "      sem = stats.sem(fares)\n"
                         "      ci = stats.t.interval(0.95, len(fares)-1, loc=mean, scale=sem)\n"
                         "      print(f'95% CI for mean fare: [{ci[0]:.2f}, {ci[1]:.2f}]')\n\n"
                         "Now sample 100 instead of 1000. What happens to the CI width? Why?"),
            ]),
        day(3, "T-test between groups",
            "",
            [
                exercise("Manhattan vs Brooklyn fares",
                         "      from scipy import stats\n"
                         "      man = df[df['pickup_borough']=='Manhattan']['fare_amount'].sample(1000)\n"
                         "      brk = df[df['pickup_borough']=='Brooklyn']['fare_amount'].sample(1000)\n"
                         "      t, p = stats.ttest_ind(man, brk, equal_var=False)\n"
                         "      print(f't={t:.2f}, p={p:.2e}')\n"
                         "Is the difference statistically significant? What does the p-value actually tell you?"),
            ]),
        day(4, "Chi-square for categorical",
            "",
            [
                exercise("Day-of-week vs delay",
                         "Using FlightWise data:\n"
                         "      from scipy.stats import chi2_contingency\n"
                         "      ct = pd.crosstab(df['DAY_OF_WEEK'], df['delayed'])\n"
                         "      chi2, p, dof, exp = chi2_contingency(ct)\n"
                         "      print(f'chi2={chi2:.1f}, p={p:.2e}, dof={dof}')\n\n"
                         "Is day-of-week REALLY associated with delay, or random?"),
            ]),
        day(5, "Multiple comparisons + Bonferroni",
            "",
            [
                video("Why you can't run 100 t-tests",
                      search("multiple testing problem bonferroni explained"),
                      10, "various"),
                exercise("Bonferroni correction",
                         "Compare fares across all 5 NYC boroughs (10 pairwise tests). Apply Bonferroni: significance threshold = 0.05 / 10 = 0.005. Which pairs are still significant?"),
            ]),
        day(6, "Bootstrap confidence intervals",
            "",
            [
                exercise("Bootstrap is robust",
                         "      def bootstrap_ci(x, n=1000):\n"
                         "          means = [np.random.choice(x, len(x), replace=True).mean() for _ in range(n)]\n"
                         "          return np.percentile(means, [2.5, 97.5])\n"
                         "      ci = bootstrap_ci(fares)\n"
                         "      print('Bootstrap 95% CI:', ci)\n\n"
                         "Compare to your t-distribution CI from Day 2. Match? When is bootstrap better?"),
            ]),
        day(7, "Tag inference-ready",
            "",
            [
                exercise("Acceptance",
                         "Save all tests in inference.ipynb. Update TaxiPulse README with one finding: 'X is significantly different from Y (p < 0.001)'.\n\n"
                         "PASS:\n"
                         "  ☐ Computed t-distribution + bootstrap CIs\n"
                         "  ☐ Ran t-test between 2 groups\n"
                         "  ☐ Ran chi-square on categorical\n"
                         "  ☐ Applied Bonferroni for multiple tests\n"
                         "  ☐ One statistically-significant finding in README"),
            ]),
    ],
    ["Null hypothesis + p-values", "Confidence intervals (t-distribution + bootstrap)", "t-test between two groups", "Chi-square for categorical", "Multiple-testing correction (Bonferroni)"],
    ["Compute 95% CI for mean fare", "Compare 2 boroughs with a t-test", "Test categorical association with chi-square", "Apply Bonferroni to 10 comparisons", "Bootstrap CIs as a backup"],
    "TaxiPulse inference notebook — every finding now has a p-value. README claims become 'significantly different' instead of just 'different'.",
    ["Run an ANOVA across all 5 boroughs", "Test if log-fares are normally distributed (Shapiro-Wilk)", "Compute Cohen's d effect size alongside p-value"],
    ["Why is p-value misunderstood?", "When is a small p-value misleading?", "What's effect size and why does it matter alongside p?"],
    ["inference.ipynb committed", "1 statistically-significant claim in README", "Bonferroni-corrected pairwise comparisons"],
)


DS_SCRAPING = week(
    "Web scraping toolkit", "NLP Prep", "12-18",
    "Real DS jobs need data nobody has packaged for you. This week you scrape — BeautifulSoup for static, Selenium for JS, Scrapy for scale. Build a side-project: scrape headlines from a real news site (Hacker News) into a CSV.",
    [
        day(1, "Ethics + robots.txt",
            "",
            [
                reading("Hacker News robots.txt",
                        "https://news.ycombinator.com/robots.txt",
                        "Click 'Open'. Read what's allowed."),
                video("Web scraping ethics (10 min)",
                      search("web scraping ethics legal robots txt 2024"),
                      10, "various"),
                reflect("Rules",
                        "Write 3 rules for ethical scraping:\n"
                        "  1. Respect robots.txt\n"
                        "  2. Rate-limit (≤ 1 req/sec on small sites)\n"
                        "  3. Identify yourself in User-Agent"),
            ]),
        day(2, "BeautifulSoup basics",
            "",
            [
                video("BeautifulSoup tutorial (20 min)",
                      search("beautifulsoup python tutorial beginner 2024"),
                      20, "various"),
                exercise("Hacker News scraper",
                         "      pip install requests beautifulsoup4\n\n"
                         "Create scraper.py:\n"
                         "      import requests, time\n"
                         "      from bs4 import BeautifulSoup\n"
                         "      headers = {'User-Agent': 'forge-learning scraper'}\n"
                         "      r = requests.get('https://news.ycombinator.com', headers=headers)\n"
                         "      soup = BeautifulSoup(r.text, 'html.parser')\n"
                         "      for row in soup.select('tr.athing'):\n"
                         "          title = row.select_one('.titleline a')\n"
                         "          print(title.text)"),
            ]),
        day(3, "Scrape 5 pages, save to CSV",
            "",
            [
                exercise("Multi-page",
                         "      import csv, time\n"
                         "      data = []\n"
                         "      for page in range(1, 6):\n"
                         "          url = f'https://news.ycombinator.com/news?p={page}'\n"
                         "          r = requests.get(url, headers=headers)\n"
                         "          soup = BeautifulSoup(r.text, 'html.parser')\n"
                         "          for row in soup.select('tr.athing'):\n"
                         "              title = row.select_one('.titleline a')\n"
                         "              data.append({'title': title.text, 'url': title.get('href')})\n"
                         "          time.sleep(1)  # rate limit\n"
                         "      with open('hn.csv','w',newline='',encoding='utf-8') as f:\n"
                         "          w = csv.DictWriter(f, fieldnames=['title','url']); w.writeheader(); w.writerows(data)\n"
                         "      print(f'Saved {len(data)} stories')"),
            ]),
        day(4, "When BS4 fails: JS-rendered sites",
            "",
            [
                video("Selenium vs BeautifulSoup (10 min)",
                      search("selenium vs beautifulsoup javascript rendered"),
                      10, "various"),
                exercise("Try Selenium",
                         "      pip install selenium webdriver-manager\n\n"
                         "      from selenium import webdriver\n"
                         "      from selenium.webdriver.chrome.options import Options\n"
                         "      opt = Options(); opt.add_argument('--headless')\n"
                         "      driver = webdriver.Chrome(options=opt)\n"
                         "      driver.get('https://quotes.toscrape.com/js/')\n"
                         "      print(driver.page_source[:500])\n"
                         "      driver.quit()"),
            ]),
        day(5, "Scrapy for production scale",
            "",
            [
                exercise("First Scrapy spider",
                         "      pip install scrapy\n"
                         "      scrapy startproject hn_spider\n"
                         "Create hn_spider/spiders/hn.py:\n"
                         "      import scrapy\n"
                         "      class HNSpider(scrapy.Spider):\n"
                         "          name = 'hn'\n"
                         "          start_urls = ['https://news.ycombinator.com']\n"
                         "          def parse(self, response):\n"
                         "              for row in response.css('tr.athing'):\n"
                         "                  yield {'title': row.css('.titleline a::text').get()}\n"
                         "Run: scrapy crawl hn -o hn.jsonl"),
            ]),
        day(6, "Sentiment-tag your scrape (preview of next project)",
            "",
            [
                exercise("Quick sentiment",
                         "Use a pretrained model to label HN titles:\n"
                         "      from transformers import pipeline\n"
                         "      clf = pipeline('sentiment-analysis')\n"
                         "      import pandas as pd\n"
                         "      df = pd.read_csv('hn.csv')\n"
                         "      results = clf(df['title'].tolist()[:50])\n"
                         "      for t, r in zip(df['title'][:5], results[:5]):\n"
                         "          print(r['label'], '-', t)"),
            ]),
        day(7, "Ship hn-scraper repo",
            "",
            [
                exercise("Acceptance",
                         "Create new repo `hn-scraper`. Push the BS4 scraper + Scrapy version + README.\n\n"
                         "PASS:\n"
                         "  ☐ BS4 scraper pulls 5 pages of HN\n"
                         "  ☐ Saves to hn.csv with rate limiting\n"
                         "  ☐ Scrapy version produces hn.jsonl\n"
                         "  ☐ README documents ethics rules + when to use each tool\n"
                         "  ☐ Repo pushed"),
            ]),
    ],
    ["Ethics + robots.txt", "BeautifulSoup for static HTML", "Rate limiting + User-Agent", "Selenium for JS-rendered pages", "Scrapy for production scale", "CSV / JSONL output formats"],
    ["Read robots.txt + write your scraping ethics rules", "BS4 scraper for HN front page", "Multi-page scraping with rate limit", "Selenium hello-world on a JS site", "Scrapy spider that outputs JSONL", "Push hn-scraper repo"],
    "hn-scraper repo — 3 working scrapers (BS4, Selenium, Scrapy) collecting Hacker News titles into structured data. Side-project that becomes a foundation for next week's NLP work.",
    ["Add comment count scraping", "Compare scrape speed: BS4 vs Scrapy on 10 pages", "Try ProtonVPN to rotate IPs (advanced — only if you control the source)"],
    ["When is Scrapy overkill?", "What's the legal grey zone around scraping?", "Why does rate-limiting protect both you and the site?"],
    ["hn-scraper repo public on GitHub", "3 working scrapers", "ETHICS.md committed"],
)


DS_AI_PROMPT = week(
    "AI-Augmented DS workflow + Prompt Engineering", "Modern DS", "10-15",
    "In 2026, the best data scientists use AI as a copilot. This week you learn to make Cursor / GitHub Copilot / ChatGPT do 80% of the grunt work — fast SQL generation, debugging, drafting findings, code reviews. Speed = career advantage.",
    [
        day(1, "Why this matters NOW",
            "",
            [
                video("AI coding tools changed everything",
                      search("github copilot cursor ai pair programming 2024"),
                      15, "various"),
                reflect("Honest assessment",
                        "What's the LAST data analysis task that took you 4+ hours? Write it down. By Sunday you'll do something similar in 30 minutes."),
            ]),
        day(2, "Cursor / Copilot setup",
            "",
            [
                reading("Cursor (free AI code editor)",
                        "https://cursor.sh",
                        "Click 'Open'. Drop-in VS Code replacement with AI built in. Free tier is plenty for this week."),
                exercise("First AI-assisted code",
                         "Install Cursor. Open your taxipulse repo.\n"
                         "Press Cmd/Ctrl+K. Type: 'add a function that computes the median tip percentage for each pickup borough and plots a bar chart'.\n"
                         "AI generates the code. Review BEFORE accepting. Run it. Does it work?"),
            ]),
        day(3, "Prompt patterns that work",
            "",
            [
                reading("OpenAI Prompt Engineering Guide",
                        "https://platform.openai.com/docs/guides/prompt-engineering",
                        "Click 'Open'. The canonical reference."),
                exercise("4 prompt patterns",
                         "Try each pattern in ChatGPT (chatgpt.com) on a TaxiPulse question:\n\n"
                         "1. ROLE: 'You are a senior data scientist. Critique this approach: [paste]'\n"
                         "2. EXAMPLES: 'Convert these pandas snippets to SQL. Here's an example:\\n[pandas] → [SQL]\\nNow do: [your query]'\n"
                         "3. STEP-BY-STEP: 'Think step by step. How would you find anomalies in this taxi data?'\n"
                         "4. CONSTRAINTS: 'Write a function in <10 lines that... '\n\n"
                         "Save the BEST and WORST output to prompts.md."),
            ]),
        day(4, "Using AI to write SQL fast",
            "",
            [
                exercise("Schema-aware SQL",
                         "Open ChatGPT. Paste your taxi table schema:\n"
                         "      Table: taxi(pickup_datetime, dropoff_datetime, pickup_hour, trip_distance, trip_minutes, fare_amount, tip_amount, pickup_borough)\n\n"
                         "Ask: 'Write a SQL query that finds the 3 boroughs with the LARGEST gap between weekday and weekend average fares. Use a CTE.'\n\n"
                         "Run the result in SQLite Online. Did it work first try? If not — fix it WITH the AI's help (paste the error)."),
            ]),
        day(5, "Code review by AI",
            "",
            [
                exercise("Critique your code",
                         "Open one of your TaxiPulse notebooks. Pick a function. In ChatGPT, paste it and ask: 'Review this for: bugs, edge cases, performance, naming, and pythonic style. Be brutal.'\n\n"
                         "Apply the BEST 2 suggestions. Reject the rest with reasoning."),
            ]),
        day(6, "AI for explaining + summarising findings",
            "",
            [
                exercise("Draft a blog paragraph",
                         "Paste your TaxiPulse final notebook into ChatGPT and ask:\n"
                         "  'Draft 3 paragraphs that I could publish on dev.to about this analysis. Target audience: data analysts. Tone: confident but humble.'\n\n"
                         "Edit. Publish 1 paragraph as a LinkedIn post WITH a screenshot of your chart."),
            ]),
        day(7, "Tag AI-aware",
            "",
            [
                exercise("Acceptance — prompts.md ships",
                         "Save prompts.md in your taxipulse repo with:\n"
                         "  - 5 prompts that worked well\n"
                         "  - 2 that failed (and why)\n"
                         "  - Your 'AI workflow notes' — 3 rules for when to trust AI vs verify\n\n"
                         "PASS:\n"
                         "  ☐ Cursor installed + tested\n"
                         "  ☐ 4 prompt patterns tested\n"
                         "  ☐ AI-generated SQL run successfully\n"
                         "  ☐ AI code review applied to 1 function\n"
                         "  ☐ AI-drafted paragraph published on LinkedIn or dev.to\n"
                         "  ☐ prompts.md committed"),
                reflect("AI vs you",
                        "Where did AI help most? Where did it confidently produce nonsense?"),
            ]),
    ],
    ["Cursor / GitHub Copilot setup", "4 prompt patterns: role, examples, step-by-step, constraints", "Using AI for SQL generation", "AI code review", "AI for drafting communication"],
    ["Install Cursor + first AI-assisted code", "Test 4 prompt patterns", "Generate working SQL via AI prompt", "Apply AI code review to one function", "Publish an AI-drafted paragraph"],
    "AI workflow notebook + prompts.md — your personal cheatsheet for using AI as a DS multiplier. 5 working prompts + 2 failures documented.",
    ["Try a different AI tool (Claude, Perplexity) on the same task", "Use AI to generate UNIT TESTS for your code", "Have AI explain a paper from arxiv.org"],
    ["When does AI confidently fabricate code?", "What's the 'verify before trust' rule?", "What kinds of work will AI replace within 2 years?"],
    ["prompts.md committed", "1 LinkedIn/dev.to post", "Cursor configured + used in real work"],
)


DS_AB = week(
    "A/B testing + experimentation", "Modeling", "12-15",
    "Every product company runs A/B tests. This week you design + analyse one — applied to your Reddit Sentiment project. Compare 2 system prompts on the same 100 posts. Which one wins? Is the difference real?",
    [
        day(1, "What is an A/B test really",
            "",
            [
                video("A/B testing fundamentals (15 min)",
                      search("a b testing fundamentals data science 2024"),
                      15, "various"),
                reflect("Three questions",
                        "1. What's a randomized control trial?\n"
                        "2. Why split RANDOMLY (vs by user_id mod 2)?\n"
                        "3. What's a 'minimum detectable effect'?"),
            ]),
        day(2, "Two system prompts for Reddit sentiment",
            "",
            [
                exercise("Define the experiment",
                         "Open your reddit-sentiment repo. Define 2 system prompts:\n"
                         "  A (control): 'Classify the sentiment of this Reddit post. Reply: POSITIVE / NEGATIVE / NEUTRAL.'\n"
                         "  B (treatment): 'You are a moderator on r/MachineLearning. For each post, judge the OVERALL TONE. Be strict — sarcasm is NEGATIVE. Reply with only one word: POSITIVE / NEGATIVE / NEUTRAL.'\n\n"
                         "Save these in ab/prompts.py."),
            ]),
        day(3, "Sample size + power",
            "",
            [
                video("Sample size calculator explained (10 min)",
                      search("a b test sample size power calculation"),
                      10, "various"),
                exercise("Compute n",
                         "      from statsmodels.stats.power import zt_ind_solve_power\n"
                         "      # Detect a 10% lift in accuracy with 80% power, alpha 0.05\n"
                         "      n = zt_ind_solve_power(effect_size=0.2, alpha=0.05, power=0.8)\n"
                         "      print(f'Need ~{int(n)} samples per arm')\n\n"
                         "For our case, 100 samples per arm is enough for a large effect. For real product tests, this can be 10,000+."),
            ]),
        day(4, "Run both prompts on the same 100 posts",
            "",
            [
                exercise("ab/run.py",
                         "      from openai import OpenAI\n"
                         "      from prompts import PROMPT_A, PROMPT_B\n"
                         "      import pandas as pd\n"
                         "      df = pd.read_csv('data/gold.csv').sample(100, random_state=42)\n"
                         "      client = OpenAI()\n"
                         "      def classify(prompt, text):\n"
                         "          r = client.chat.completions.create(model='gpt-4o-mini', messages=[\n"
                         "              {'role':'system','content': prompt},\n"
                         "              {'role':'user','content': text}], temperature=0)\n"
                         "          return r.choices[0].message.content.strip()\n"
                         "      df['pred_A'] = df['title'].apply(lambda t: classify(PROMPT_A, t))\n"
                         "      df['pred_B'] = df['title'].apply(lambda t: classify(PROMPT_B, t))\n"
                         "      df.to_csv('ab/results.csv', index=False)\n\n"
                         "Run it. Takes ~2 min and ~$0.05."),
            ]),
        day(5, "Compute accuracy + significance",
            "",
            [
                exercise("Did B beat A?",
                         "      from scipy.stats import chi2_contingency\n"
                         "      acc_A = (df['pred_A'] == df['true_label']).mean()\n"
                         "      acc_B = (df['pred_B'] == df['true_label']).mean()\n"
                         "      print(f'A: {acc_A:.2%}, B: {acc_B:.2%}')\n"
                         "      # Test significance\n"
                         "      ct = pd.crosstab(\n"
                         "          ['A'] * len(df) + ['B'] * len(df),\n"
                         "          list(df['pred_A'] == df['true_label']) + list(df['pred_B'] == df['true_label'])\n"
                         "      )\n"
                         "      chi2, p, _, _ = chi2_contingency(ct)\n"
                         "      print(f'p = {p:.3f}')"),
            ]),
        day(6, "Write the experiment report",
            "",
            [
                exercise("ab/REPORT.md",
                         "      # A/B Test — Sentiment Prompt v1 vs v2\n"
                         "      ## Hypothesis\n  Adding 'strict mode + sarcasm flag' improves classification accuracy.\n"
                         "      ## Setup\n  - 100 hand-labelled r/ML posts\n  - Same model: gpt-4o-mini\n  - Random seed 42 for reproducibility\n"
                         "      ## Results\n  - A: X%\n  - B: Y%\n  - p = Z\n"
                         "      ## Verdict\n  Significant / Not significant. Ship / Don't ship. Why."),
            ]),
        day(7, "Tag AB-tested",
            "",
            [
                exercise("Acceptance",
                         "      git add ab/ && git commit -m 'A/B prompt experiment'\n\n"
                         "PASS:\n"
                         "  ☐ 2 prompts defined\n"
                         "  ☐ Sample size justified\n"
                         "  ☐ Same 100 posts scored with both\n"
                         "  ☐ Accuracy + p-value computed\n"
                         "  ☐ REPORT.md with verdict"),
            ]),
    ],
    ["Hypothesis + null hypothesis for A/B", "Sample size + statistical power", "Random assignment", "Computing lift + significance", "Writing experiment reports"],
    ["Design hypothesis", "Compute sample size needed", "Run both prompts on same 100 posts", "Compute accuracy lift + p-value", "Write decision: ship or kill"],
    "Reddit Sentiment v0.x — first A/B experiment. Two prompts compared on identical test set. Statistically-defensible verdict.",
    ["Add a 3rd prompt variant (one-shot example)", "Test on 200 posts — does the verdict change?", "Compute Cohen's d effect size alongside p-value"],
    ["Why random assignment over deterministic?", "When is p < 0.05 misleading in A/B?", "What's a peeking problem?"],
    ["ab/ directory with prompts, results, report", "REPORT.md with verdict", "Reproducible random seed"],
)


DS_SYNTH = week(
    "Synthetic data generation", "Modeling", "12-15",
    "By 2026 public data ran out. Real ML teams generate synthetic data — to balance classes (SMOTE), fill rare events (Faker), or replace sensitive PII (CTGAN). This week applied to your Reddit Sentiment (highly imbalanced) and FlightWise.",
    [
        day(1, "Why synthetic data",
            "",
            [
                video("Synthetic data in ML (15 min)",
                      search("synthetic data generation ml beginner 2024"),
                      15, "various"),
                reflect("When to use it",
                        "Three real use cases:\n  1. Severe class imbalance (only 5% positives)\n  2. Privacy: replace real PII with realistic fakes\n  3. Rare events (fraud, churn): expand training set"),
            ]),
        day(2, "Faker for realistic fakes",
            "",
            [
                exercise("Generate fake users",
                         "      pip install faker\n\n"
                         "      from faker import Faker\n"
                         "      fake = Faker()\n"
                         "      import pandas as pd\n"
                         "      users = [{'name': fake.name(), 'email': fake.email(), 'city': fake.city(), 'age': fake.random_int(18, 80)} for _ in range(100)]\n"
                         "      df = pd.DataFrame(users)\n"
                         "      df.to_csv('data/fake_users.csv', index=False)\n"
                         "      print(df.head())"),
            ]),
        day(3, "SMOTE for class imbalance",
            "",
            [
                video("SMOTE explained (10 min)",
                      search("smote class imbalance machine learning"),
                      10, "various"),
                exercise("Balance FlightWise data",
                         "Open flightwise:\n"
                         "      pip install imbalanced-learn\n"
                         "      from imblearn.over_sampling import SMOTE\n"
                         "      from sklearn.linear_model import LogisticRegression\n"
                         "      X = pd.get_dummies(df.drop(columns=['delayed','CRS_DEP_TIME']), drop_first=True)\n"
                         "      y = df['delayed']\n"
                         "      X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\n"
                         "      sm = SMOTE(random_state=42)\n"
                         "      X_res, y_res = sm.fit_resample(X_train, y_train)\n"
                         "      print('Before:', y_train.value_counts().to_dict())\n"
                         "      print('After SMOTE:', pd.Series(y_res).value_counts().to_dict())"),
            ]),
        day(4, "Train + compare with/without SMOTE",
            "",
            [
                exercise("Does balancing help?",
                         "      m_raw = LogisticRegression(max_iter=1000).fit(X_train, y_train)\n"
                         "      m_smote = LogisticRegression(max_iter=1000).fit(X_res, y_res)\n"
                         "      from sklearn.metrics import classification_report\n"
                         "      print('Without SMOTE:'); print(classification_report(y_test, m_raw.predict(X_test)))\n"
                         "      print('With SMOTE:'); print(classification_report(y_test, m_smote.predict(X_test)))\n\n"
                         "Recall on delayed class — does it go up? Precision — does it drop? Document the trade-off."),
            ]),
        day(5, "Augment small text datasets",
            "",
            [
                exercise("Paraphrase with LLM",
                         "For your Reddit sentiment imbalance:\n"
                         "      from openai import OpenAI\n"
                         "      client = OpenAI()\n"
                         "      def paraphrase(text):\n"
                         "          r = client.chat.completions.create(model='gpt-4o-mini', messages=[\n"
                         "              {'role':'system','content':'Rewrite this Reddit title to mean the same thing in different words. Keep the same sentiment.'},\n"
                         "              {'role':'user','content': text}], temperature=0.7)\n"
                         "          return r.choices[0].message.content\n"
                         "      # Take 10 NEGATIVE posts, paraphrase 3x each → 30 new NEGATIVE samples\n"
                         "      neg = df[df['true_label']=='NEGATIVE'].head(10)\n"
                         "      synth = []\n"
                         "      for _, row in neg.iterrows():\n"
                         "          for _ in range(3):\n"
                         "              synth.append({'title': paraphrase(row['title']), 'true_label': 'NEGATIVE', 'synthetic': True})\n"
                         "      print(synth[:3])"),
            ]),
        day(6, "When synthetic data HURTS",
            "",
            [
                video("Pitfalls of synthetic data",
                      search("synthetic data pitfalls bias overfitting"),
                      10, "various"),
                reflect("Be honest",
                        "Three risks:\n  1. Synthetic data can amplify bias\n  2. Model overfits to synthetic patterns that don't exist in real data\n  3. Always validate on REAL test set, never synthetic"),
            ]),
        day(7, "Tag synth-aware",
            "",
            [
                exercise("Acceptance",
                         "Save synth.ipynb. Update FlightWise + Reddit READMEs with the synth experiments.\n\n"
                         "PASS:\n"
                         "  ☐ Faker generated 100 fake user records\n"
                         "  ☐ SMOTE applied to FlightWise\n"
                         "  ☐ Compared with/without SMOTE — documented trade-off\n"
                         "  ☐ LLM paraphrasing for Reddit imbalance\n"
                         "  ☐ Notes on when synthetic data hurts"),
            ]),
    ],
    ["Synthetic data use cases (imbalance, privacy, scarcity)", "Faker for realistic placeholders", "SMOTE for tabular class imbalance", "LLM paraphrasing for text augmentation", "Risks: bias amplification, overfitting"],
    ["Generate 100 fake users with Faker", "Apply SMOTE to FlightWise — observe class rebalance", "Train+compare with/without SMOTE — quantify trade-off", "LLM-paraphrase Reddit minority class", "Document when synth data is dangerous"],
    "Synth notebook in flightwise + reddit-sentiment repos. Real before/after numbers showing SMOTE's effect on recall vs precision.",
    ["Try ADASYN instead of SMOTE", "Generate fake transactions with CTGAN (advanced)", "Compare bootstrap resampling vs SMOTE"],
    ["When does SMOTE leak information across train/test?", "Why does synthetic data amplify bias?", "When is 'just collect more real data' the right answer?"],
    ["synth.ipynb committed", "Quantified SMOTE trade-off", "Augmented Reddit dataset committed"],
)


DS_MLOPS = week(
    "MLOps — MLflow + drift monitoring", "Production", "12-18",
    "Real models in production drift. Demand patterns change, vocabularies evolve, weather shifts. This week we add MLflow experiment tracking to your Energy Forecast model + monitor for drift after deployment.",
    [
        day(1, "Why MLOps",
            "",
            [
                video("What is MLOps? (10 min)",
                      search("mlops explained beginner 2024"),
                      10, "various"),
                reflect("Three problems",
                        "Real MLOps solves:\n  1. 'Which model is in prod?' (no versioning)\n  2. 'Why did it suddenly do worse?' (no drift detection)\n  3. 'I lost the experiment notes' (no tracking)"),
            ]),
        day(2, "Install + start MLflow",
            "",
            [
                reading("MLflow docs",
                        "https://mlflow.org/docs/latest/index.html",
                        "Click 'Open'. Bookmark."),
                exercise("First run",
                         "      pip install mlflow\n"
                         "Start the UI:\n"
                         "      mlflow ui --port 5000\n"
                         "Open localhost:5000. Empty dashboard."),
            ]),
        day(3, "Track Prophet experiments",
            "",
            [
                exercise("Log a run",
                         "In your energy-forecast repo, create train.py:\n"
                         "      import mlflow, pandas as pd\n"
                         "      from prophet import Prophet\n"
                         "      from sklearn.metrics import mean_absolute_error\n\n"
                         "      mlflow.set_experiment('energy-prophet')\n"
                         "      df = pd.read_csv('data/AEP_hourly.csv', parse_dates=['Datetime'])\n"
                         "      daily = df.set_index('Datetime')['AEP_MW'].resample('D').mean().reset_index()\n"
                         "      pdf = daily.rename(columns={'Datetime':'ds','AEP_MW':'y'})\n"
                         "      train, test = pdf[:-30], pdf[-30:]\n\n"
                         "      with mlflow.start_run():\n"
                         "          mlflow.log_param('seasonality_mode', 'multiplicative')\n"
                         "          m = Prophet(seasonality_mode='multiplicative', yearly_seasonality=True)\n"
                         "          m.fit(train)\n"
                         "          forecast = m.predict(test[['ds']])\n"
                         "          mae = mean_absolute_error(test['y'], forecast['yhat'])\n"
                         "          mlflow.log_metric('mae', mae)\n"
                         "          print(f'MAE: {mae:.1f}')\n\n"
                         "Run it. Refresh localhost:5000 — you see the run."),
            ]),
        day(4, "Compare multiple runs",
            "",
            [
                exercise("Hyperparameter sweep",
                         "Loop over 3 changepoint_prior_scale values:\n"
                         "      for cps in [0.05, 0.1, 0.5]:\n"
                         "          with mlflow.start_run():\n"
                         "              mlflow.log_param('cps', cps)\n"
                         "              m = Prophet(changepoint_prior_scale=cps)\n"
                         "              m.fit(train)\n"
                         "              ...\n"
                         "              mlflow.log_metric('mae', mae)\n\n"
                         "In MLflow UI, sort by MAE. Pick the winner. Tag it 'prod'."),
            ]),
        day(5, "Detect data drift",
            "",
            [
                exercise("Drift check with evidently",
                         "      pip install evidently\n"
                         "      from evidently.report import Report\n"
                         "      from evidently.metric_preset import DataDriftPreset\n"
                         "      ref = daily.head(1000)['AEP_MW']  # historical\n"
                         "      cur = daily.tail(100)['AEP_MW']    # recent\n"
                         "      r = Report(metrics=[DataDriftPreset()])\n"
                         "      r.run(reference_data=pd.DataFrame({'val': ref}), current_data=pd.DataFrame({'val': cur}))\n"
                         "      r.save_html('drift.html')\n"
                         "Open drift.html. Drifted? Why might that be?"),
            ]),
        day(6, "Trigger alert on drift",
            "",
            [
                exercise("Simple alarm",
                         "      summary = r.as_dict()\n"
                         "      drifted = summary['metrics'][0]['result']['dataset_drift']\n"
                         "      if drifted:\n"
                         "          print('ALARM: data drift detected — consider retraining')\n"
                         "          # In prod: send Slack/email here\n"
                         "Write a cron-like script that does this check daily."),
            ]),
        day(7, "Tag mlops-w1",
            "",
            [
                exercise("Acceptance",
                         "      git add . && git commit -m 'MLflow tracking + drift monitoring'\n\n"
                         "PASS:\n"
                         "  ☐ MLflow UI works locally\n"
                         "  ☐ 3+ tracked experiments visible\n"
                         "  ☐ Best model tagged 'prod'\n"
                         "  ☐ Evidently drift report generated\n"
                         "  ☐ Drift alarm script committed"),
            ]),
    ],
    ["MLflow basics (params/metrics/tags)", "Experiment comparison + selection", "Data drift definition", "Evidently for drift reports", "Simple alert pipelines"],
    ["Install MLflow + start UI", "Track a baseline Prophet run", "Sweep 3 hyperparameter values", "Tag the prod model", "Run Evidently drift report", "Build a daily drift-alarm script"],
    "Energy Forecast MLOps layer — MLflow experiment tracking + Evidently drift monitoring. Tagged 'prod' model + automated drift alarms.",
    ["Add a model registry stage transition (Staging → Production)", "Send drift alerts to a Slack webhook", "Track model artifacts (the .pkl file itself)"],
    ["Why is a metric-only view of model quality dangerous?", "What's the difference between data drift and concept drift?", "When should drift trigger automatic retraining vs human review?"],
    ["MLflow tracking working", "Drift report HTML", "Daily alarm script committed"],
)


# ═══════════════════════════════════════════════════════════════════════
# DATA ANALYSIS — 7 new weeks
# ═══════════════════════════════════════════════════════════════════════

DA_PYTHON = week(
    "Python pandas for analysts", "Foundation", "12-15",
    "Most 2026 analyst job ads list Python alongside SQL. This week you bring pandas into your toolkit — fast loops over data Excel can't handle, automatable reports, and a runway into ML for your career.",
    [
        day(1, "Why analysts need Python too",
            "",
            [
                video("Python for data analysts (15 min)",
                      search("python for data analysts beginner 2024"),
                      15, "various"),
                reflect("Excel pain points",
                        "Three things Excel does badly that pandas does well:\n  1. >1M rows — Excel crashes; pandas yawns\n  2. Repeating an analysis on next month's data — Excel: re-do; pandas: re-run\n  3. Joining 5+ tables — Excel: VLOOKUP hell; pandas: 1 line"),
            ]),
        day(2, "Install + first notebook",
            "",
            [
                reading("Anaconda download",
                        "https://www.anaconda.com/download",
                        "Click 'Open'. If you did Data Science Week 2 already, you have this."),
                exercise("Hello pandas",
                         "Open Jupyter. Create superstore-py.ipynb in your superstore-analysis repo:\n"
                         "      import pandas as pd\n"
                         "      df = pd.read_excel('Sample - Superstore.xls', sheet_name='Orders')\n"
                         "      print(df.shape, df.columns.tolist())"),
            ]),
        day(3, "Re-do Q1 (margins) in pandas",
            "",
            [
                exercise("Margin pivot in pandas",
                         "      df['margin'] = df['Profit'] / df['Sales']\n"
                         "      out = df.groupby('Sub-Category').agg(\n"
                         "          sales=('Sales','sum'),\n"
                         "          profit=('Profit','sum'),\n"
                         "          margin=('margin','mean'),\n"
                         "      ).sort_values('margin', ascending=False)\n"
                         "      print(out)\n\n"
                         "Match your Excel pivot? Should be the same."),
            ]),
        day(4, "Filter + group by multiple",
            "",
            [
                exercise("Region YoY",
                         "      df['Year'] = pd.to_datetime(df['Order Date']).dt.year\n"
                         "      out = df.groupby(['Region','Year'])['Sales'].sum().unstack()\n"
                         "      out['yoy'] = (out[2023] - out[2022]) / out[2022]\n"
                         "      print(out)\n\n"
                         "1 line for 2-D pivot. Excel needs 5 clicks."),
            ]),
        day(5, "Charts with matplotlib",
            "",
            [
                exercise("Plot the margin pivot",
                         "      import matplotlib.pyplot as plt\n"
                         "      out['margin'].plot(kind='barh', figsize=(10,6), title='Margin by Sub-Category')\n"
                         "      plt.tight_layout()\n"
                         "      plt.savefig('margin.png', dpi=150)"),
            ]),
        day(6, "Automate the monthly report",
            "",
            [
                exercise("monthly_report.py",
                         "Create a script that:\n"
                         "  1. Loads the latest Excel from data/\n"
                         "  2. Computes top 5 / bottom 5 sub-categories by margin\n"
                         "  3. Saves a chart\n"
                         "  4. Prints a 3-line summary\n\n"
                         "Run: python monthly_report.py. Imagine running this on the 1st of every month — 5 minutes vs 2 hours in Excel."),
            ]),
        day(7, "Tag pandas-ready",
            "",
            [
                exercise("Acceptance",
                         "      git add . && git commit -m 'Python pandas version of Superstore analysis'\n\n"
                         "PASS:\n"
                         "  ☐ pandas matches your Excel pivots exactly\n"
                         "  ☐ At least 3 grouping operations done\n"
                         "  ☐ 1 chart saved as PNG\n"
                         "  ☐ monthly_report.py runs end-to-end"),
            ]),
    ],
    ["pandas DataFrame basics", "groupby + aggregations", "Multi-dimensional pivots (unstack)", "matplotlib for analysts", "Automating recurring reports"],
    ["Install Anaconda + Jupyter", "Re-do margin pivot in pandas", "Region YoY with groupby + unstack", "Save 1 chart", "Build monthly_report.py automation"],
    "Superstore in Python — same analysis as Excel, automated. monthly_report.py runs in 5 minutes, idempotent.",
    ["Add a 'Profit by Discount Bucket' chart in 5 lines", "Use pd.read_sql to query SQLite directly", "Schedule the script with cron / Windows Task Scheduler"],
    ["When does pandas slow down vs Excel?", "Why use pd.read_excel vs converting to CSV first?", "What's the gap between 'analyst with Python' and 'data scientist'?"],
    ["pandas notebook + script committed", "Chart PNG", "Automation pattern documented"],
)


DA_STATS = week(
    "Statistical thinking for analysts", "Foundation", "10-12",
    "Analysts who say 'this looks like a trend' but can't say 'p < 0.001' get pushed back by senior managers. This week — sampling, confidence intervals, correlation vs causation. Real-world traps you'll see daily.",
    [
        day(1, "Sampling + selection bias",
            "",
            [
                video("Sampling explained for analysts (15 min)",
                      search("sampling bias data analyst beginner"),
                      15, "various"),
                reflect("Three biases",
                        "When does Sample Superstore data MISLEAD?\n  1. Only customers who already bought\n  2. Only successful orders\n  3. Only 4 regions, not all possible"),
            ]),
        day(2, "Confidence intervals in Excel",
            "",
            [
                exercise("CI for mean",
                         "On Superstore data, pick 100 random orders:\n"
                         "      = AVERAGE(N2:N101) - 1.96 * STDEV(N2:N101) / SQRT(100)  (lower)\n"
                         "      = AVERAGE(N2:N101) + 1.96 * STDEV(N2:N101) / SQRT(100)  (upper)\n\n"
                         "Now pick 30 instead of 100. What happens to the CI? Why?"),
            ]),
        day(3, "Correlation in Excel",
            "",
            [
                exercise("CORREL function",
                         "      =CORREL(Discount column, Profit column)\n\n"
                         "Result is between -1 and +1. What does -0.4 mean? -0.9? +0.1?\n"
                         "Now visualize as a scatter plot. Eyeball confirms?"),
            ]),
        day(4, "Correlation != causation",
            "",
            [
                video("Spurious correlations (5 min)",
                      yt("8B271L3NtAw"), 5, "various", "Best visual on this topic."),
                reflect("Three spurious correlations in Superstore",
                        "Pretend a junior analyst claims:\n"
                        "  1. 'Higher Discount causes lower Profit' (probably right but think...)\n"
                        "  2. 'Customer Segment = Corporate causes higher Sales' (right? wrong?)\n"
                        "  3. 'Region = West causes worse profit margin' (?)\n\n"
                        "For each, write what's REALLY happening + the confound."),
            ]),
        day(5, "Hypothesis tests in Excel",
            "",
            [
                exercise("T-test in Excel",
                         "      =T.TEST(consumer_sales_range, corporate_sales_range, 2, 3)\n\n"
                         "(2 = two-tailed, 3 = unequal variances)\n"
                         "Result: a p-value. If <0.05 the two segments have significantly different average sales.\n"
                         "Run for 3 region pairs. Document."),
            ]),
        day(6, "Simpson's paradox in Superstore",
            "",
            [
                video("Simpson's Paradox (10 min)",
                      search("simpson's paradox explained data"),
                      10, "various"),
                exercise("Find it",
                         "Pivot: Discount Bucket × Region → AVG Profit. Compare WITHIN one region vs OVERALL. Sometimes a trend in subgroups REVERSES when aggregated. Find one example in Superstore."),
            ]),
        day(7, "Tag stats-aware",
            "",
            [
                exercise("Acceptance",
                         "Add to your superstore memo: every finding now has a CI or p-value attached.\n\n"
                         "PASS:\n"
                         "  ☐ Computed CIs on 2 metrics\n"
                         "  ☐ Computed correlation + scatter plot\n"
                         "  ☐ Ran t-test on 3 segment pairs\n"
                         "  ☐ Identified 1 Simpson's paradox in data\n"
                         "  ☐ Memo updated with stats-supported claims"),
            ]),
    ],
    ["Sampling + selection bias", "Confidence intervals for means", "Pearson correlation", "Correlation vs causation traps", "T-test in Excel", "Simpson's paradox"],
    ["Compute CI for mean fare/sale", "Compute + interpret correlations", "List 3 spurious correlations", "Run t-test on 3 segment pairs", "Find Simpson's paradox example"],
    "Superstore memo upgraded — every finding has a p-value or CI. No 'I think there's a trend' — only 'X is significantly Y (p<Z)'.",
    ["Compute CIs for ALL pivot rows", "Plot a confidence band on the monthly trend chart", "Find one Simpson's paradox in HR data too"],
    ["Why isn't a correlation of 0.8 enough to claim causation?", "What's a confound?", "When does a junior analyst confuse association with causation?"],
    ["Stats-supported memo PDF", "Simpson's paradox example documented", "t-test results table"],
)


DA_AI_PROMPT = week(
    "AI-Augmented analyst + Prompt Engineering", "Modern Analysis", "10-12",
    "The biggest analyst-productivity unlock in 2026 is AI. This week you learn to make ChatGPT write SQL, draft memos, critique your work, and generate summary slides. The analyst who masters this owns the team.",
    [
        day(1, "Why this matters",
            "",
            [
                video("AI for analysts (10 min)",
                      search("ai tools for data analysts chatgpt 2024"),
                      10, "various"),
                reflect("Honest assessment",
                         "What's the LAST analyst task that took you 4+ hours? By Sunday you'll do similar in 30 minutes."),
            ]),
        day(2, "ChatGPT for SQL generation",
            "",
            [
                reading("ChatGPT",
                        "https://chatgpt.com", "Free tier is plenty."),
                exercise("Schema-aware prompts",
                         "Paste your Superstore table schema:\n"
                         "      Table orders(Order Date, Region, Segment, Category, Sub-Category, Sales, Profit, Discount, Customer ID)\n\n"
                         "Ask: 'Write a SQL query that finds the 3 sub-categories with the WORST profit margin in the West region, only for orders in 2023.'\n\n"
                         "Run the result in sqliteonline.com. Did it work first try?"),
            ]),
        day(3, "AI as memo drafter",
            "",
            [
                exercise("Auto-draft a memo",
                         "Paste your top 3 Superstore findings (the numbers, not pretty prose). Ask:\n"
                         "  'Draft a 1-page memo to a CEO summarising these 3 findings. Format: headline, 3 sections (1 per finding), recommendations. Tone: confident, concise.'\n\n"
                         "Compare to your Week 5 hand-written memo. Which is better? Why?"),
            ]),
        day(4, "AI critiques YOUR memo",
            "",
            [
                exercise("Sharper feedback",
                         "Paste your hand-written memo. Ask:\n"
                         "  'Critique this memo for a senior data leader. Point out: weak claims, missing numbers, vague recommendations, places where I should push back.'\n\n"
                         "Apply the 3 best critiques. Reject the rest."),
            ]),
        day(5, "AI for slide content",
            "",
            [
                exercise("Speaker notes per slide",
                         "Paste your 5-slide deck content. Ask:\n"
                         "  'Write speaker notes for each slide. 30 seconds of speaking per slide. Tone: confident.'\n\n"
                         "Paste into your deck's Notes panel."),
            ]),
        day(6, "Excel formula generation",
            "",
            [
                exercise("Hard formulas",
                         "Try these prompts:\n"
                         "  1. 'Excel formula to compute year-over-year growth in a pivot table'\n"
                         "  2. 'Excel formula for rolling 30-day average of column B'\n"
                         "  3. 'Excel formula to flag rows where Profit < 0 and Discount > 0.4'\n\n"
                         "Test each. Save the working ones in a formulas.md."),
            ]),
        day(7, "Tag AI-aware",
            "",
            [
                exercise("Acceptance — prompts.md ships",
                         "Save prompts.md in your superstore-analysis repo:\n"
                         "  - 5 prompts that worked\n"
                         "  - 2 that failed (and why)\n"
                         "  - 'AI workflow rules' — when to trust, when to verify\n\n"
                         "PASS:\n"
                         "  ☐ Generated working SQL from schema prompt\n"
                         "  ☐ AI-drafted memo compared to hand-written\n"
                         "  ☐ AI critique applied to your memo\n"
                         "  ☐ Speaker notes generated for deck\n"
                         "  ☐ prompts.md committed"),
            ]),
    ],
    ["Schema-aware SQL prompts", "Memo drafting + critique loops", "Slide speaker notes", "Excel formula generation", "Verification discipline"],
    ["Generate working SQL from schema", "Draft + critique a memo with AI", "Get speaker notes for your deck", "Generate 3 hard Excel formulas", "Document AI workflow rules"],
    "prompts.md in superstore-analysis — your personal cheatsheet. 5 working prompts + clear rules for when to trust AI.",
    ["Have AI generate a 1-paragraph LinkedIn post about your finding", "Try a different AI (Claude, Perplexity) on the same prompts", "Have AI write unit tests for your formulas"],
    ["When does AI confidently produce wrong SQL?", "What's the 'verify before trust' rule for an analyst?", "Will AI replace junior analysts? When?"],
    ["prompts.md committed", "AI-supported deck speaker notes", "1 AI-generated post published"],
)


DA_SCRAPING = week(
    "Web scraping for business data", "Data Acquisition", "10-15",
    "Real business data isn't always in your CRM. Sometimes it's on a competitor's pricing page, in a public review site, or buried in PDFs. This week: scrape competitor prices, build a dashboard.",
    [
        day(1, "Why scraping for analysts",
            "",
            [
                reflect("Three real business uses",
                         "  1. Competitor price monitoring (track 10 competitors weekly)\n"
                         "  2. Review sentiment (Trustpilot, G2)\n"
                         "  3. Public stats data (your government's open data portal)"),
            ]),
        day(2, "Ethics + robots.txt",
            "",
            [
                reading("Books-to-scrape (practice site)",
                        "https://books.toscrape.com",
                        "Built for scraping practice. Legal + safe."),
                video("Web scraping ethics (10 min)",
                      search("web scraping ethics legal robots"),
                      10, "various"),
                reflect("Rules",
                        "Three you'll always follow:\n  1. Robots.txt\n  2. Rate limit (≤ 1 req/sec)\n  3. Identify yourself in User-Agent"),
            ]),
        day(3, "BeautifulSoup hello world",
            "",
            [
                exercise("Scrape book prices",
                         "      pip install requests beautifulsoup4 pandas\n\n"
                         "Create scraper.py:\n"
                         "      import requests, time, pandas as pd\n"
                         "      from bs4 import BeautifulSoup\n"
                         "      headers = {'User-Agent':'forge-analyst scraper'}\n"
                         "      books = []\n"
                         "      for page in range(1, 6):\n"
                         "          url = f'https://books.toscrape.com/catalogue/page-{page}.html'\n"
                         "          r = requests.get(url, headers=headers)\n"
                         "          soup = BeautifulSoup(r.text, 'html.parser')\n"
                         "          for art in soup.select('article.product_pod'):\n"
                         "              title = art.select_one('h3 a').get('title')\n"
                         "              price = art.select_one('.price_color').text.replace('£','')\n"
                         "              books.append({'title': title, 'price': float(price)})\n"
                         "          time.sleep(1)\n"
                         "      pd.DataFrame(books).to_csv('books.csv', index=False)"),
            ]),
        day(4, "Schedule the scraper",
            "",
            [
                exercise("Run it weekly",
                         "Add a timestamp column:\n"
                         "      from datetime import date\n"
                         "      books_df['scraped_on'] = date.today().isoformat()\n"
                         "      books_df.to_csv('books_history.csv', mode='a', header=False, index=False)\n\n"
                         "Set up to run every Monday (Windows Task Scheduler / cron). Over time you'll have a time series of prices."),
            ]),
        day(5, "Analyze price changes",
            "",
            [
                exercise("Diff over time",
                         "After running 2x (simulate by editing dates):\n"
                         "      df = pd.read_csv('books_history.csv')\n"
                         "      changes = df.pivot_table('price', 'title', 'scraped_on').dropna()\n"
                         "      changes['change'] = (changes.iloc[:,-1] - changes.iloc[:,0]) / changes.iloc[:,0]\n"
                         "      print(changes.sort_values('change').head(10))"),
            ]),
        day(6, "Build a Sheets dashboard",
            "",
            [
                exercise("Visualize price trends",
                         "Upload books_history.csv to Google Sheets. Build:\n"
                         "  - 1 line chart per top-10 book showing price over time\n"
                         "  - 1 table flagging books with > 10% price change\n"
                         "  - 1 KPI: 'average price drop this month'"),
            ]),
        day(7, "Tag scraping-ready",
            "",
            [
                exercise("Acceptance",
                         "New repo: competitor-price-tracker. Push scraper + sample data + dashboard screenshot.\n\n"
                         "PASS:\n"
                         "  ☐ BS4 scraper pulls 5 pages\n"
                         "  ☐ Saves with timestamp column\n"
                         "  ☐ Rate-limited + User-Agent set\n"
                         "  ☐ Diff analysis works\n"
                         "  ☐ Sheets dashboard committed (screenshot in README)"),
            ]),
    ],
    ["Ethical scraping basics", "BeautifulSoup for static HTML", "Rate limiting + User-Agent", "Timestamped append-only CSVs", "Sheets dashboards for scraped data"],
    ["Read robots.txt + write ethics rules", "Scrape 5 pages of practice site", "Add timestamps + schedule", "Compute price-change deltas", "Build a Sheets dashboard"],
    "competitor-price-tracker repo — working BS4 scraper, append-only history, simple Sheets dashboard.",
    ["Scrape a different practice site (quotes.toscrape.com)", "Add product reviews to the scrape", "Build an email alert when price drops > 20%"],
    ["When is scraping illegal?", "Why is timestamping every scrape critical?", "When do you need Selenium (vs BS4)?"],
    ["competitor-price-tracker repo", "Sheets dashboard screenshot", "ETHICS.md"],
)


DA_AB = week(
    "A/B testing for product analysts", "Modern Analysis", "10-12",
    "Product analyst roles ALWAYS ask: 'design an A/B test.' This week you do — applied to Olist. Test whether a 'free shipping over $50' rule lifts average order value. Compute lift, p-value, decision.",
    [
        day(1, "What product A/B tests look like",
            "",
            [
                video("A/B testing in product analytics (15 min)",
                      search("ab testing product analyst beginner"),
                      15, "various"),
                reflect("Three real tests",
                        "Product A/Bs you'd run at Olist:\n  1. 'Free shipping over $50' (this week)\n  2. 'Show product reviews above the fold'\n  3. 'Send abandoned-cart email at 1hr vs 24hr'"),
            ]),
        day(2, "Simulate the test in Excel",
            "",
            [
                exercise("Set up A and B groups",
                         "From your Olist orders.csv: filter to delivered orders only.\n"
                         "Add a helper column: =IF(MOD(ROW(),2)=0, \"A\", \"B\") to randomly split.\n"
                         "Pretend the B group saw 'free shipping over $50' rule that boosted their order value by 8%. Add: =IF(group=\"B\", payment_value * 1.08, payment_value) as 'order_value_in_test'."),
            ]),
        day(3, "Compute lift",
            "",
            [
                exercise("Group A vs B",
                         "Pivot: Rows = group (A/B), Values = AVG order_value_in_test, COUNT.\n"
                         "Compute lift: (B - A) / A.\n"
                         "Is it ~8%? Should be close (random noise will shift it slightly)."),
            ]),
        day(4, "P-value with t-test",
            "",
            [
                exercise("Test it",
                         "      =T.TEST(A_group_values, B_group_values, 2, 3)\n\n"
                         "Result < 0.05? Significant. Document."),
            ]),
        day(5, "Compute required sample size",
            "",
            [
                exercise("How many do you need?",
                         "Use evanmiller.org/ab-testing/sample-size.html or compute:\n"
                         "  Baseline mean: $150\n"
                         "  Minimum detectable lift: 3%\n"
                         "  Power: 80%\n"
                         "  Significance: 0.05\n"
                         "  → ~? users per arm\n\n"
                         "Document. This is exactly what product analysts compute weekly."),
            ]),
        day(6, "Write the test plan",
            "",
            [
                exercise("AB-PLAN.md",
                         "      # A/B Test — Free Shipping Threshold\n"
                         "      ## Hypothesis\n  Free shipping over $50 increases AOV by ≥ 3%\n"
                         "      ## Setup\n  - Random 50/50 split on new visitors\n  - Run for 14 days\n  - Primary metric: AOV\n  - Secondary: conversion rate\n"
                         "      ## Sample size\n  ~N per arm to detect 3% lift\n"
                         "      ## Decision criteria\n  Ship if p<0.05 AND lift > 3%"),
            ]),
        day(7, "Tag AB-ready",
            "",
            [
                exercise("Acceptance",
                         "Push AB-PLAN.md + simulated results into your olist-funnel repo.\n\n"
                         "PASS:\n"
                         "  ☐ A/B simulation in Excel\n"
                         "  ☐ Lift computed\n"
                         "  ☐ P-value computed\n"
                         "  ☐ Sample size justified\n"
                         "  ☐ AB-PLAN.md committed"),
            ]),
    ],
    ["A/B test design (hypothesis, metric, MDE, duration)", "Random group assignment", "Computing lift", "T-test for significance", "Sample size calculation"],
    ["Hypothesize a real product A/B", "Simulate A/B in Excel", "Compute lift", "Compute p-value", "Justify sample size", "Write AB-PLAN.md"],
    "Olist AB-PLAN.md — a full product test design ready to defend in any analyst interview. Plus a simulated result.",
    ["Add a secondary metric (e.g., conversion rate)", "Plan a 2x2 factorial test instead of A/B", "What happens to your power if MDE drops to 1%?"],
    ["What's a guardrail metric?", "Why never peek at A/B results early?", "What's a 'novelty effect' in product experiments?"],
    ["AB-PLAN.md", "Simulated lift + p-value", "Sample-size justification"],
)


DA_TABLEAU = week(
    "Tableau — the other half of the BI market", "BI Tools", "12-15",
    "Power BI is ~50% of the BI market. Tableau is ~30%. Adding Tableau to your CV doubles the jobs you can apply for. This week you rebuild your Superstore dashboard in Tableau Public (free).",
    [
        day(1, "Why both Power BI + Tableau",
            "",
            [
                video("Power BI vs Tableau in 2026 (10 min)",
                      search("power bi vs tableau 2024 comparison"),
                      10, "various"),
                reflect("Job ad mix",
                        "Check 10 data analyst job ads on LinkedIn. How many list Tableau? Power BI? Both? Note ratios."),
            ]),
        day(2, "Install Tableau Public",
            "",
            [
                reading("Tableau Public (free)",
                        "https://www.tableau.com/products/public/download",
                        "Click 'Open'. Sign up + download. ~500MB."),
                exercise("First connection",
                         "Open Tableau Public. Connect to your Sample - Superstore.xls file. Drag 'Orders' to the data pane."),
            ]),
        day(3, "Build the same 4 KPIs",
            "",
            [
                exercise("KPI cards",
                         "New worksheet 'Total Sales'. Drag Sales → Text. Right-click → Format → big font.\n"
                         "Repeat for: Total Profit, Profit Margin (Profit / Sales — Tableau makes this 'measure name + Aggregation'), YoY Growth.\n"
                         "Combine into a single Dashboard 'Overview'."),
            ]),
        day(4, "Charts: trend + region",
            "",
            [
                exercise("2 charts",
                         "New worksheet 'Sales Trend'. Drag Order Date → Columns (month). Drag Sales → Rows. Line chart.\n"
                         "New worksheet 'Sales by Region'. Drag Region → Rows. Sales → Columns. Bar chart, sort desc."),
            ]),
        day(5, "Matrix + conditional color",
            "",
            [
                exercise("Sub-Category margin",
                         "Drag Sub-Category → Rows. Profit/Sales as calculated field → Columns. Format as %.\n"
                         "Click the bar color → Edit Colors → red-green diverging at 0."),
            ]),
        day(6, "Build the dashboard + filters",
            "",
            [
                exercise("Assemble",
                         "New Dashboard. Drag in: 4 KPI sheets, Trend, Bar, Matrix.\n"
                         "Add a Date filter. Set it to apply to all sheets.\n"
                         "Add a Region filter too."),
            ]),
        day(7, "Publish to Tableau Public",
            "",
            [
                exercise("Acceptance",
                         "Server → Tableau Public → Save. Sign in.\n"
                         "Get a public URL like public.tableau.com/profile/yourname/viz/SuperstoreDashboard.\n\n"
                         "PASS:\n"
                         "  ☐ 4 KPI cards built\n"
                         "  ☐ Trend + bar + matrix charts\n"
                         "  ☐ Date + Region filters applied to all\n"
                         "  ☐ Published to Tableau Public\n"
                         "  ☐ URL in superstore-analysis README"),
            ]),
    ],
    ["Tableau Public installation", "Tableau worksheet vs dashboard", "Calculated fields", "Conditional color formatting", "Filters that apply globally", "Publishing to Tableau Public"],
    ["Install Tableau Public", "Connect to Superstore", "Build 4 KPI worksheets", "Build trend + bar + matrix charts", "Assemble dashboard with global filters", "Publish public URL"],
    "Superstore dashboard in Tableau Public — live public URL anyone can open. Same data as your Power BI version, alternative tool mastered.",
    ["Add a parameter (let user pick a year)", "Build a story (sequence of dashboards with annotations)", "Use a map: sales by State"],
    ["When is Tableau better than Power BI?", "What's the 'show me' panel for?", "Why do enterprise teams have both?"],
    ["Public Tableau URL", "Same insights as Power BI version", "Dashboard screenshot in repo"],
)


DA_STORY = week(
    "Storytelling masterclass", "Communication", "10-12",
    "The most technically brilliant analyst who cannot explain findings to a CEO loses to someone with half the skill and twice the storytelling. This week: narrative structure, slide design, presentation practice. Applied to your capstone.",
    [
        day(1, "Why storytelling beats analysis",
            "",
            [
                video("Storytelling with data (15 min)",
                      search("storytelling with data cole nussbaumer beginner"),
                      15, "various"),
                reading("Storytelling with Data — free chapter",
                        "https://www.storytellingwithdata.com",
                        "Click 'Open'. The book that defined the field."),
                reflect("Pyramid principle",
                        "Top: ONE clear answer.\nMiddle: 3 supporting findings.\nBottom: the data behind each.\n\nThis is how executives think — top-down. Build slides this way."),
            ]),
        day(2, "Distill capstone into ONE sentence",
            "",
            [
                exercise("The headline",
                         "Take your ForgeRetail Capstone. Write ONE sentence (≤ 20 words) that captures the most important thing you learned.\n\n"
                         "Examples:\n"
                         "  'Tables sub-category lost $X annually — exit or redesign within 90 days.'\n"
                         "  'Sales > $50k correlate with 3x repeat rate — invest in big-account onboarding.'\n\n"
                         "Hard. Iterate until it FITS on one slide."),
            ]),
        day(3, "Slide as visual hierarchy",
            "",
            [
                exercise("Re-design slide 1",
                         "Old slide 1: 'ForgeRetail Q4 Review'. Charts everywhere.\n"
                         "NEW slide 1: just the headline. 48pt font. White space. ONE subtle accent color.\n\n"
                         "If they only see this slide, they get the message."),
            ]),
        day(4, "Show the numbers — but ONLY the ones that matter",
            "",
            [
                exercise("Kill 3 charts",
                         "Look at your deck. For each chart, ask: 'If this disappeared, would the audience LOSE understanding?' If no — kill it.\n"
                         "End deck should have ≤ 5 charts. Maximum."),
            ]),
        day(5, "Speaker notes that work",
            "",
            [
                exercise("Notes per slide",
                         "For each slide, write 30 seconds of spoken text. Pattern:\n"
                         "  - Tell them what you'll tell them (5 sec)\n"
                         "  - Tell them (20 sec)\n"
                         "  - Tell them what you told them (5 sec)\n\n"
                         "Paste into the deck's Notes pane."),
            ]),
        day(6, "Record + practice",
            "",
            [
                exercise("Self-tape",
                         "Use your phone. Record yourself presenting the full deck. Maximum 5 minutes.\n"
                         "Watch back. List 3 things you'd improve. Re-record. Watch again."),
            ]),
        day(7, "Tag storyteller",
            "",
            [
                exercise("Acceptance",
                         "Final polished deck PDF + practice video (unlisted YouTube) committed.\n\n"
                         "PASS:\n"
                         "  ☐ One-sentence headline for capstone\n"
                         "  ☐ Slide 1 redesigned to JUST the headline\n"
                         "  ☐ Killed ≥ 3 unnecessary charts\n"
                         "  ☐ Speaker notes per slide\n"
                         "  ☐ Self-recorded ≤ 5 min presentation\n"
                         "  ☐ Practice video URL in README"),
            ]),
    ],
    ["Pyramid principle (answer-first)", "Distilling findings to one sentence", "Visual hierarchy in slides", "Killing unnecessary charts", "Speaker notes structure", "Self-recording + iteration"],
    ["Watch storytelling fundamentals", "Distill capstone to 1 sentence", "Redesign slide 1 around headline only", "Kill 3 charts from deck", "Write 30-sec speaker notes per slide", "Self-tape full presentation"],
    "ForgeRetail Capstone deck v2 — half the charts, twice the impact. One-sentence headline. Practiced + recorded.",
    ["Try the deck in front of an actual person — get feedback", "Replace one chart with a single big number", "Find an example of 'bad' chart design and remake it"],
    ["What's the difference between a chart that's pretty and a chart that's persuasive?", "Why do executives skim slides not read them?", "What kills credibility fastest in a presentation?"],
    ["Polished deck PDF", "Practice video URL", "One-sentence headline in repo README"],
)


# ═══════════════════════════════════════════════════════════════════════
# SPLICE: insert new weeks at correct positions + renumber
# ═══════════════════════════════════════════════════════════════════════

# For each discipline: [(insert_position_in_new_sequence, new_week)]
# Existing weeks shift to fill remaining slots in order.
#
# DS new sequence (27 weeks):
#  1=existing1, 2=MATH, 3=existing2, 4=SQL, 5=existing3, 6=STATS,
#  7=existing4, 8=SCRAPING, 9=existing5, 10=existing6, 11=AI_PROMPT,
#  12=existing7, 13=existing8, 14=AB, 15=existing9, 16=SYNTH,
#  17=existing10, 18=existing11, 19=existing12, 20=existing13,
#  21=existing14, 22=existing15, 23=existing16, 24=MLOPS,
#  25=existing17, 26=existing18, 27=existing19, 28=existing20
# Actually 28. Let me trim by combining: skip insertion of MLOPS as
# separate week and slot it where existing17 was. Final: 27 weeks.

DS_PLAN = [
    ("existing", 1),
    ("new", DS_MATH),
    ("existing", 2),
    ("new", DS_SQL),
    ("existing", 3),
    ("new", DS_STATS),
    ("existing", 4),
    ("new", DS_SCRAPING),
    ("existing", 5),
    ("existing", 6),
    ("new", DS_AI_PROMPT),
    ("existing", 7),
    ("existing", 8),
    ("new", DS_AB),
    ("existing", 9),
    ("new", DS_SYNTH),
    ("existing", 10),
    ("existing", 11),
    ("existing", 12),
    ("existing", 13),
    ("existing", 14),
    ("existing", 15),
    ("existing", 16),
    ("new", DS_MLOPS),
    ("existing", 17),
    ("existing", 18),
    ("existing", 19),
    ("existing", 20),
]

# DA new sequence (25 weeks):
DA_PLAN = [
    ("existing", 1),
    ("new", DA_PYTHON),
    ("existing", 2),
    ("existing", 3),
    ("existing", 4),
    ("new", DA_STATS),
    ("new", DA_AI_PROMPT),
    ("existing", 5),
    ("existing", 6),
    ("existing", 7),
    ("existing", 8),
    ("existing", 9),
    ("existing", 10),
    ("new", DA_SCRAPING),
    ("existing", 11),
    ("existing", 12),
    ("new", DA_AB),
    ("existing", 13),
    ("existing", 14),
    ("new", DA_TABLEAU),
    ("existing", 15),
    ("existing", 16),
    ("existing", 17),
    ("new", DA_STORY),
    ("existing", 18),
]


def apply_plan(slug, plan):
    path = os.path.join(DATA_DIR, f"{slug}.json")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    existing = {w["number"]: w for w in data.get("weeks", [])}

    new_weeks = []
    for new_num, (kind, ref) in enumerate(plan, start=1):
        if kind == "existing":
            w = existing.get(ref)
            if not w:
                print(f"  -- skip {slug}: existing W{ref} missing")
                continue
            w["number"] = new_num
            new_weeks.append(w)
        else:
            w = dict(ref)
            w["number"] = new_num
            new_weeks.append(w)

    data["weeks"] = new_weeks
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  OK {slug}: {len(new_weeks)} weeks ({sum(1 for k,_ in plan if k=='new')} new)")


if __name__ == "__main__":
    apply_plan("data-science", DS_PLAN)
    apply_plan("data-analysis", DA_PLAN)
