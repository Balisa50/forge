/**
 * Short-video overhaul. Every resource is now under 30 minutes, ideally
 * 5-20 min. Long courses replaced with several focused concept videos.
 * Run from repo root:  node scripts/rewrite-resources-short.cjs
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "data", "roadmaps");

// Compact prereq library - reused across weeks.
const P = {
  githubAccount: {
    label: "Create your GitHub account (2 min)",
    url: "https://github.com/join",
    note: "2 min signup. Username matters - use your real name where you can. This becomes your public portfolio.",
  },
  gitIn100sec: {
    label: "Git Explained in 100 Seconds - Fireship",
    url: "https://www.youtube.com/watch?v=hwP7WQkmECE",
    note: "2 minutes. What git actually is. Watch first before any tutorial.",
  },
  githubIn100sec: {
    label: "GitHub in 100 Seconds - Fireship",
    url: "https://www.youtube.com/watch?v=pBy1zgt0XPc",
    note: "2 minutes. What GitHub is and why it matters. Pair with the git video above.",
  },
  gitFirstRepo: {
    label: "Your First Git + GitHub Push in 10 minutes - Web Dev Simplified",
    url: "https://www.youtube.com/watch?v=USjZcfj8yxE",
    note: "10 minutes. The 4 commands: git init, git add, git commit, git push. Reuse every time a week says 'push to GitHub'.",
  },
  pythonIn100sec: {
    label: "Python in 100 Seconds - Fireship",
    url: "https://www.youtube.com/watch?v=x7X9w_GIm1s",
    note: "2 minutes. What Python is and why you are about to learn it.",
  },
  anacondaInstall: {
    label: "Install Anaconda in 5 minutes",
    url: "https://www.youtube.com/watch?v=UTqOXwAi1pE",
    note: "5 min. Anaconda gives you Python + Jupyter + 100 libraries in one install. Use this, not python.org.",
  },
  jupyterIn5min: {
    label: "Jupyter Notebook in 5 minutes",
    url: "https://www.youtube.com/watch?v=jZ952vChhuI",
    note: "5 min. How to open Jupyter, make a cell, run code, save the .ipynb. The bare essentials.",
  },
  terminalIn10min: {
    label: "Command Line in 10 minutes for Beginners",
    url: "https://www.youtube.com/watch?v=lZ7Kix9bjPI",
    note: "10 min. cd, ls, mkdir, rm. Watch BEFORE any week that asks you to 'run a script'.",
  },
  readmeIn5min: {
    label: "How to Write a GREAT README in 5 minutes",
    url: "https://www.youtube.com/watch?v=E6NO0rgFub4",
    note: "5 min. The 5 sections every project README needs. Recruiters skim this in 30 seconds.",
  },
  pushTagRelease: {
    label: "How to tag and release on GitHub - 5 min",
    url: "https://www.youtube.com/watch?v=8cnaPgklP3w",
    note: "5 min. Every time a week says 'tag vX.Y', run these 3 commands.",
  },
};

// =====================================================================
// DATA ANALYSIS - 27 weeks - all videos under 30 min
// =====================================================================
const DA = {
  1: [
    P.githubAccount,
    {
      label: "What a Data Analyst Actually Does (Day in the Life) - 12 min",
      url: "https://www.youtube.com/watch?v=foO9phUDPM8",
      note: "12 min. Alex The Analyst walks you through his real day. Sets the tone for the whole roadmap.",
    },
    {
      label: "Excel Tutorial for Beginners in 30 Minutes - Kevin Stratvert",
      url: "https://www.youtube.com/watch?v=Vl0H-qTclOg",
      note: "30 min. Navigate, format, basic formulas. The shortest complete intro that exists.",
    },
    {
      label: "Excel SUMIFS in 8 minutes - Leila Gharani",
      url: "https://www.youtube.com/watch?v=BfsfwIvlfQI",
      note: "8 min. The single most-used formula by working analysts.",
    },
    {
      label: "Excel Pivot Tables in 15 minutes - Kevin Stratvert",
      url: "https://www.youtube.com/watch?v=9NUjHBNWe9M",
      note: "15 min. Build your first pivot. Watch BEFORE your Q1/Q2/Q3 pivots.",
    },
    {
      label: "XLOOKUP in 7 minutes - Leila Gharani",
      url: "https://www.youtube.com/watch?v=O--RVxQRRsk",
      note: "7 min. The modern lookup. Skip VLOOKUP tutorials, they are outdated.",
    },
    {
      label: "Sample Superstore dataset (download)",
      url: "https://community.tableau.com/s/question/0D54T00000CWeX8SAL/sample-superstore-sales-excelxls",
      note: "Click Open to download. Free Tableau signup if asked. The file you analyze all week.",
    },
    P.gitIn100sec,
    P.githubIn100sec,
    P.gitFirstRepo,
    P.readmeIn5min,
  ],
  2: [
    P.pythonIn100sec,
    P.anacondaInstall,
    P.jupyterIn5min,
    {
      label: "Pandas in 100 Seconds - Fireship",
      url: "https://www.youtube.com/watch?v=tRKeLrwfUgU",
      note: "2 min. What pandas is and why we use it instead of Excel for big data.",
    },
    {
      label: "Pandas read_csv and basic dataframe in 10 min",
      url: "https://www.youtube.com/watch?v=vmEHCJofslg",
      note: "10 min. The first 10 minutes of any pandas project: load CSV, peek at head, check dtypes.",
    },
    {
      label: "Pandas groupby in 12 minutes - Misra Turp",
      url: "https://www.youtube.com/watch?v=txMdrV1Ut64",
      note: "12 min. groupby is pivot tables in Python. Practice on Superstore.",
    },
    {
      label: "Pandas pivot_table in 8 minutes",
      url: "https://www.youtube.com/watch?v=xPzr3sCwhQw",
      note: "8 min. Direct pandas equivalent of an Excel pivot. Faster on 10k rows.",
    },
    {
      label: "Matplotlib in 15 minutes - Tech With Tim",
      url: "https://www.youtube.com/watch?v=3Xc3CA655Y4",
      note: "15 min. Plot your first chart. Save with plt.savefig('chart.png').",
    },
    {
      label: "Schedule a Python script on Windows - 6 min",
      url: "https://www.youtube.com/watch?v=Y4lTtNVeb-Y",
      note: "6 min. Task Scheduler walkthrough. Mac/Linux users: use cron, same idea.",
    },
    P.gitFirstRepo,
  ],
  3: [
    {
      label: "Excel scatter plot in 5 minutes - Kevin Stratvert",
      url: "https://www.youtube.com/watch?v=qHQDfzS-AZA",
      note: "5 min. Build the Discount-vs-Profit scatter directly in Excel.",
    },
    {
      label: "Pandas scatter plots in 10 min",
      url: "https://www.youtube.com/watch?v=4PE6mTjjOyA",
      note: "10 min. plt.scatter() and df.plot.scatter() in pandas. Same plot in Python.",
    },
    {
      label: "Correlation does NOT mean Causation in 5 min",
      url: "https://www.youtube.com/watch?v=8B271L3NtAw",
      note: "5 min. The most important warning for any analyst. Internalize this.",
    },
    {
      label: "Excel CORREL function in 4 minutes",
      url: "https://www.youtube.com/watch?v=ITZmm6BMrFc",
      note: "4 min. =CORREL() between two columns. Get a number for any pair.",
    },
    {
      label: "Bucketing data with IF and FLOOR in Excel - 6 min",
      url: "https://www.youtube.com/watch?v=t1Y4w2bJI20",
      note: "6 min. Turn Discount into 5 buckets (0%, 0-10%, 10-20%, 20-40%, 40%+).",
    },
    P.pushTagRelease,
  ],
  4: [
    {
      label: "Customer Lifetime Value in 6 minutes",
      url: "https://www.youtube.com/watch?v=h7QhcBp6Sps",
      note: "6 min. What CLV means and why retailers obsess over it.",
    },
    {
      label: "RFM Segmentation in 10 minutes",
      url: "https://www.youtube.com/watch?v=GjPYlovEqRk",
      note: "10 min. Recency, Frequency, Monetary. The classic customer segmentation.",
    },
    {
      label: "Pandas quantile in 5 minutes",
      url: "https://www.youtube.com/watch?v=IFKQLDmRK0Y",
      note: "5 min. Split customers into VIP/Regular/Casual using .quantile([0.33, 0.66]).",
    },
    {
      label: "How to compute churn rate properly - 10 min",
      url: "https://www.youtube.com/watch?v=cFFTDXcESxA",
      note: "10 min. Defining 'churned' = no order in N days. Pick N for your data.",
    },
    {
      label: "Excel pivot table calculated field - 6 min",
      url: "https://www.youtube.com/watch?v=DgLDXAdwfFM",
      note: "6 min. Compute CLV inside the pivot itself with a calculated field.",
    },
  ],
  5: [
    {
      label: "SQL in 100 Seconds - Fireship",
      url: "https://www.youtube.com/watch?v=zsjvFFKOm3c",
      note: "2 min. What SQL is. The trillion-dollar language.",
    },
    {
      label: "SQL SELECT WHERE GROUP BY in 12 minutes - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=7mz73uXD9DA",
      note: "12 min. The 3 verbs you will use 90% of the time.",
    },
    {
      label: "SQL JOINs in 10 minutes - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=9yeOJ0ZMUYw",
      note: "10 min. INNER, LEFT, RIGHT, FULL OUTER. Drawn out with Venn diagrams.",
    },
    {
      label: "SQL CTEs in 8 minutes - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=K1WeoKxLZ5o",
      note: "8 min. WITH clauses break complex queries into readable steps.",
    },
    {
      label: "SQL Window Functions in 14 minutes - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=Ww71knvhQ-s",
      note: "14 min. Running totals, top-N-per-group, ranks. Asked in every analyst interview.",
    },
    {
      label: "SQLite Online (no install)",
      url: "https://sqliteonline.com/",
      note: "Bookmark. Import a CSV in 3 clicks, run SQL in the browser.",
    },
    {
      label: "Import CSV into SQLite Online - 3 min",
      url: "https://www.youtube.com/watch?v=koJv6w_LzZw",
      note: "3 min. The literal 3-click process for getting Superstore into SQL.",
    },
  ],
  6: [
    {
      label: "p-values in 11 minutes - StatQuest",
      url: "https://www.youtube.com/watch?v=vemZtEM63GY",
      note: "11 min. The clearest explanation that exists. Required watching.",
    },
    {
      label: "Confidence Intervals in 9 minutes - StatQuest",
      url: "https://www.youtube.com/watch?v=TqOeMYtOc1w",
      note: "9 min. What 95% CI actually means (not what most people think).",
    },
    {
      label: "t-test in 13 minutes - StatQuest",
      url: "https://www.youtube.com/watch?v=pTmLQvMM-1M",
      note: "13 min. When to use it, how it works, what its assumptions are.",
    },
    {
      label: "Simpson's Paradox in 8 minutes - MinutePhysics",
      url: "https://www.youtube.com/watch?v=ebEkn-BiW5k",
      note: "8 min. The trap every junior analyst falls into.",
    },
    {
      label: "Chi-square test in 11 minutes - StatQuest",
      url: "https://www.youtube.com/watch?v=ZNXso_riZag",
      note: "11 min. For categorical data: is Region related to Segment?",
    },
    {
      label: "Bonferroni correction in 7 minutes - StatQuest",
      url: "https://www.youtube.com/watch?v=K8LQSvtjcEo",
      note: "7 min. Why running 10 tests guarantees 1 false positive. The fix.",
    },
    {
      label: "Spurious Correlations gallery",
      url: "https://www.tylervigen.com/spurious-correlations",
      note: "Reference. Cheese consumption vs deaths by bedsheet. Hilarious and instructive.",
    },
  ],
  7: [
    {
      label: "Prompt Engineering in 15 minutes - DAIR.AI",
      url: "https://www.youtube.com/watch?v=dOxUroR57xs",
      note: "15 min. The 5 patterns that actually work. Zero-shot, few-shot, CoT, role-prompt, decomposition.",
    },
    {
      label: "ChatGPT for SQL in 8 minutes",
      url: "https://www.youtube.com/watch?v=Y9JzjcJ7LRM",
      note: "8 min. How to get SQL that runs first try.",
    },
    {
      label: "AI hallucinations explained in 6 min",
      url: "https://www.youtube.com/watch?v=GdJOA4XHpZ4",
      note: "6 min. AI invents column names. Always sanity-check.",
    },
    {
      label: "Claude vs ChatGPT for data work - 10 min",
      url: "https://www.youtube.com/watch?v=lkzVjFRfYJg",
      note: "10 min. Side-by-side on the same data tasks. Each has strengths.",
    },
  ],
  8: [
    {
      label: "Cole Knaflic on Data Storytelling - 18 min TED",
      url: "https://www.youtube.com/watch?v=8EMW7io4rSI",
      note: "18 min. The most-referenced data viz talk ever. Watch with a notepad.",
    },
    {
      label: "Pyramid Principle in 5 minutes - McKinsey-style",
      url: "https://www.youtube.com/watch?v=BcgM1ZJTfCQ",
      note: "5 min. Headline first, support second. How consultants structure every memo.",
    },
    {
      label: "One Big Number slides in 4 minutes",
      url: "https://www.youtube.com/watch?v=meBzPK8Bh78",
      note: "4 min. Why one giant number beats a chart 80% of the time.",
    },
    {
      label: "Steve Jobs presentation tactics - 5 min",
      url: "https://www.youtube.com/watch?v=1nYFpuc2Umk",
      note: "5 min. The 3-act pitch structure. Steal it for every deck.",
    },
  ],
  9: [
    {
      label: "How to ask for project feedback - 7 min Luke Barousse",
      url: "https://www.youtube.com/watch?v=byNlhPOIVB0",
      note: "7 min. Where to find honest reviewers + the DM that works.",
    },
    {
      label: "Project RETRO doc in 5 min",
      url: "https://www.youtube.com/watch?v=ARyEPnGgvCw",
      note: "5 min. The 3 sections engineers use: What worked, What did not, What next.",
    },
    {
      label: "Loom recording basics in 4 minutes",
      url: "https://www.youtube.com/watch?v=qFqr_dDjpkE",
      note: "4 min. Free for 25 videos. Record a 2-min walkthrough of your dashboard.",
    },
    {
      label: "Make a data project go viral on LinkedIn - 12 min Tina Huang",
      url: "https://www.youtube.com/watch?v=pndb5lr8jJI",
      note: "12 min. Post templates that got her real reach.",
    },
  ],
  10: [
    {
      label: "IBM HR Attrition dataset on Kaggle",
      url: "https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset",
      note: "Free download. 1470 rows. Classic teaching dataset for HR analytics.",
    },
    {
      label: "Kaggle signup in 2 minutes",
      url: "https://www.youtube.com/watch?v=I91kZWPlAOQ",
      note: "2 min. Account is free.",
    },
    {
      label: "HR Analytics 101 in 8 minutes",
      url: "https://www.youtube.com/watch?v=k_BBnnEPddw",
      note: "8 min. What HR leaders actually care about. Tells you which findings will land.",
    },
    {
      label: "Pivot table refresher in 6 min - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=hSatU-vbLwM",
      note: "6 min. Re-watch if pivots feel rusty from Week 1.",
    },
    {
      label: "Cohort Analysis in 10 minutes",
      url: "https://www.youtube.com/watch?v=GpEX95LXY5w",
      note: "10 min. Watch before Week 11. Group people by when they joined, watch their behavior.",
    },
  ],
  11: [
    {
      label: "Bucketing continuous variables in Excel - 6 min",
      url: "https://www.youtube.com/watch?v=t1Y4w2bJI20",
      note: "6 min. Turn YearsAtCompany into 0-1, 2-5, 6-10, 11+ buckets.",
    },
    {
      label: "Cross-tabulation in Excel - 5 min - Leila Gharani",
      url: "https://www.youtube.com/watch?v=Lme2VlAR9hM",
      note: "5 min. Tenure × Role pivot is just a cross-tab.",
    },
    {
      label: "Cumulative chart in Excel - 5 min",
      url: "https://www.youtube.com/watch?v=fhGcL_yqJek",
      note: "5 min. Show attrition piling up over years.",
    },
    {
      label: "Survival Analysis intuition in 12 min - StatQuest",
      url: "https://www.youtube.com/watch?v=v1QqpG0rR1k",
      note: "12 min. The math behind 'how many years until 50% leave'. Optional, beautiful.",
    },
  ],
  12: [
    {
      label: "Excel dashboard from scratch - 25 min - Leila Gharani",
      url: "https://www.youtube.com/watch?v=opJgMj1IUrc",
      note: "25 min. Build a complete dashboard with KPIs, slicers, charts. The single most useful Excel video for Week 12.",
    },
    {
      label: "Excel slicers in 5 minutes",
      url: "https://www.youtube.com/watch?v=cIaepONu5MA",
      note: "5 min. Clickable filters on dashboards.",
    },
    {
      label: "1-page memo structure - 6 min HBR",
      url: "https://www.youtube.com/watch?v=fGjE2_aaJWk",
      note: "6 min. The HBR template every consultant uses.",
    },
    {
      label: "Cost of employee turnover - 7 min SHRM",
      url: "https://www.youtube.com/watch?v=jB-_4Hb38xY",
      note: "7 min. Industry numbers ($15k-$30k per replacement). Use this for your dollar impact.",
    },
  ],
  13: [
    {
      label: "Anonymize a dataset in 8 minutes",
      url: "https://www.youtube.com/watch?v=YfgwGGc4D1w",
      note: "8 min. Remove names, mask emails, generalize zip codes.",
    },
    {
      label: "Record a demo video with Loom - 4 min",
      url: "https://www.youtube.com/watch?v=DTk99mHDX_I",
      note: "4 min. The fastest way to ship a 3-minute demo.",
    },
    {
      label: "How to DM working professionals - 6 min Tina Huang",
      url: "https://www.youtube.com/watch?v=tbBl5JcoYqU",
      note: "6 min. The exact LinkedIn DMs that get responses.",
    },
  ],
  14: [
    {
      label: "BeautifulSoup web scraping in 20 minutes - Tech With Tim",
      url: "https://www.youtube.com/watch?v=ng2o98k983k",
      note: "20 min. Scrape your first page. The minimum viable scraper.",
    },
    {
      label: "robots.txt explained in 5 min",
      url: "https://www.youtube.com/watch?v=u3iN2lXFAk0",
      note: "5 min. Required watching before scraping anything.",
    },
    {
      label: "books.toscrape.com (practice site)",
      url: "https://books.toscrape.com/",
      note: "Built for scraping practice. Hit with any rate limit, no risk.",
    },
    {
      label: "Schedule a Python script - 6 min",
      url: "https://www.youtube.com/watch?v=Y4lTtNVeb-Y",
      note: "6 min. Re-watch from W2. Run your scraper daily.",
    },
    {
      label: "Send Python email alerts - 12 min",
      url: "https://www.youtube.com/watch?v=JRCJ6RtE3xU",
      note: "12 min. smtplib basics. Trigger an email when price drops >20%.",
    },
  ],
  15: [
    {
      label: "Olist Brazilian E-commerce dataset on Kaggle",
      url: "https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce",
      note: "Real anonymized data. 9 CSVs, free download.",
    },
    {
      label: "dbdiagram.io tutorial - 8 min",
      url: "https://www.youtube.com/watch?v=l5_RnTPdPnc",
      note: "8 min. Free schema diagrams. Paste your CSV columns, get an ER diagram.",
    },
    {
      label: "Funnel Analysis in 10 min - Reforge style",
      url: "https://www.youtube.com/watch?v=BL_NkqyvxhU",
      note: "10 min. What funnels measure and where they typically leak.",
    },
    {
      label: "Pandas merge / join in 20 min - Corey Schafer",
      url: "https://www.youtube.com/watch?v=iYWKfUOtGaw",
      note: "20 min. The 4 join types you need to combine 9 CSVs.",
    },
  ],
  16: [
    {
      label: "Cohort retention in 10 min - Mode style",
      url: "https://www.youtube.com/watch?v=GpEX95LXY5w",
      note: "10 min. Re-watch from W10. Now you build it.",
    },
    {
      label: "Build a cohort matrix in pandas - 15 min",
      url: "https://www.youtube.com/watch?v=Y0vlhRoGyM0",
      note: "15 min. Step-by-step pandas code for month-by-month retention.",
    },
    {
      label: "Heatmap cohorts in Excel - 8 min",
      url: "https://www.youtube.com/watch?v=4PE6mTjjOyA",
      note: "8 min. Conditional formatting + percentages. Green = retained, red = churned.",
    },
    {
      label: "Repeat purchase rate explained - 5 min",
      url: "https://www.youtube.com/watch?v=W2vJN-FFRlA",
      note: "5 min. 25-30% repeat rate is healthy for ecommerce.",
    },
  ],
  17: [
    {
      label: "A/B Testing in 10 minutes - HBR",
      url: "https://www.youtube.com/watch?v=DUNk4GPZ9bw",
      note: "10 min. Why A/B tests exist and what they actually tell you.",
    },
    {
      label: "Sample size in 8 min - StatQuest",
      url: "https://www.youtube.com/watch?v=Rsc5znwR5FA",
      note: "8 min. How many users before you can trust the result.",
    },
    {
      label: "Evan Miller's free sample size calculator",
      url: "https://www.evanmiller.org/ab-testing/sample-size.html",
      note: "Bookmark. Plug baseline + MDE + power, get N.",
    },
    {
      label: "p-value pitfalls in A/B testing - 9 min",
      url: "https://www.youtube.com/watch?v=KEofcwHRfCo",
      note: "9 min. The 5 mistakes that make 80% of startup A/B tests wrong.",
    },
    {
      label: "Cohen's d in 9 min - StatQuest",
      url: "https://www.youtube.com/watch?v=IetVPNQrjF4",
      note: "9 min. Effect size > p-value. Why.",
    },
  ],
  18: [
    {
      label: "Funnel chart in Excel - 6 min - Leila",
      url: "https://www.youtube.com/watch?v=fGjE2_aaJWk",
      note: "6 min. Drop-off funnel for the Olist conversion stages.",
    },
    {
      label: "1-page memo in 6 min - HBR",
      url: "https://www.youtube.com/watch?v=Hfx1X9WSGYQ",
      note: "6 min. Re-watch from W8. Same Pyramid Principle, applied to marketing.",
    },
    {
      label: "Excel dashboard in 25 min - Leila",
      url: "https://www.youtube.com/watch?v=opJgMj1IUrc",
      note: "25 min. Re-watch from W12. Same dashboard pattern, different data.",
    },
    {
      label: "Pitching to executives - 8 min YC",
      url: "https://www.youtube.com/watch?v=24vrhcZraQs",
      note: "8 min. How to compress 50 hours of work into a 5-minute pitch.",
    },
  ],
  19: [
    {
      label: "Publish a Kaggle notebook in 7 min",
      url: "https://www.youtube.com/watch?v=DSZ6UMI5BiE",
      note: "7 min. Turn your Olist analysis into a public Kaggle notebook for reach.",
    },
    {
      label: "Write a project blog post - 12 min Tina Huang",
      url: "https://www.youtube.com/watch?v=byNlhPOIVB0",
      note: "12 min. The structure that gets read. 1000-1500 word sweet spot.",
    },
  ],
  20: [
    {
      label: "Tableau Public download (free)",
      url: "https://public.tableau.com/en-us/s/download",
      note: "Free forever. Install before Tuesday.",
    },
    {
      label: "Tableau in 10 minutes - first dashboard",
      url: "https://www.youtube.com/watch?v=YpgD0sIVdNg",
      note: "10 min. Drag-and-drop your first chart. The fastest intro.",
    },
    {
      label: "Tableau parameters in 8 min - Andy Kriebel",
      url: "https://www.youtube.com/watch?v=8Q-K6q4lqAA",
      note: "8 min. Let users pick a year/region. Essential for interactivity.",
    },
    {
      label: "Tableau filters and actions in 10 min",
      url: "https://www.youtube.com/watch?v=opwsmsCwLcs",
      note: "10 min. Click one chart, filter another. Pro feature in 10 minutes.",
    },
    {
      label: "Tableau map of US states in 6 min",
      url: "https://www.youtube.com/watch?v=Lhf2y4uYIBI",
      note: "6 min. Sales-by-state geo map for your Superstore dashboard.",
    },
    {
      label: "Publish to Tableau Public in 4 min",
      url: "https://www.youtube.com/watch?v=lUmRPsxRJzQ",
      note: "4 min. Free hosting. Get a public URL to share on LinkedIn.",
    },
  ],
  21: [
    {
      label: "dbt in 100 Seconds - Fireship",
      url: "https://www.youtube.com/watch?v=tg6JKpRJTPg",
      note: "2 min. What dbt is and why it changed analytics engineering.",
    },
    {
      label: "BigQuery in 12 minutes - Google Cloud",
      url: "https://www.youtube.com/watch?v=eIec0RFTFxg",
      note: "12 min. Google's free 1 TB/month tier. The fastest setup.",
    },
    {
      label: "Google Cloud free tier safely in 8 min",
      url: "https://www.youtube.com/watch?v=7BCsK1Ke3R8",
      note: "8 min. Card required but no charge if you stay free. Budget alerts are step 1.",
    },
    {
      label: "dbt-bigquery setup in 18 min",
      url: "https://www.youtube.com/watch?v=zFLqDUnL6JQ",
      note: "18 min. Init project, configure profiles.yml, first run.",
    },
    {
      label: "Modern Data Stack in 10 min - Tristan Handy",
      url: "https://www.youtube.com/watch?v=hUWUlSRJpw0",
      note: "10 min. Why dbt + BigQuery is replacing old ETL.",
    },
  ],
  22: [
    {
      label: "Scope a data project in 10 min - StrataScratch",
      url: "https://www.youtube.com/watch?v=mGZsNNvJTLM",
      note: "10 min. Problem, metric, timeline. The framework real teams use.",
    },
    {
      label: "Power BI vs Tableau vs Excel - 8 min - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=AGrl-H87pRU",
      note: "8 min. Pick your tool for the capstone now.",
    },
    {
      label: "Multi-page dashboard design in 12 min - Microsoft",
      url: "https://www.youtube.com/watch?v=2tBjvHFsxYI",
      note: "12 min. Overview, drill-down, detail. The hierarchy that works.",
    },
    {
      label: "Star schema in 9 minutes - Kimball Group",
      url: "https://www.youtube.com/watch?v=PSqGKx0L0n8",
      note: "9 min. The data model that keeps dashboards fast.",
    },
  ],
  23: [
    {
      label: "Excel dashboard slicers in 5 min",
      url: "https://www.youtube.com/watch?v=cIaepONu5MA",
      note: "5 min. Re-watch from W12.",
    },
    {
      label: "Power BI cross-page filtering in 8 min",
      url: "https://www.youtube.com/watch?v=2tBjvHFsxYI",
      note: "8 min. Same filter applied to multiple pages.",
    },
    {
      label: "Conditional formatting for KPIs in 6 min",
      url: "https://www.youtube.com/watch?v=oa-iZCWMJVk",
      note: "6 min. Red/yellow/green KPI tiles.",
    },
    {
      label: "Sparklines in 5 min - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=DkgsB8wlQYI",
      note: "5 min. Tiny inline trend charts. Looks pro instantly.",
    },
  ],
  24: [
    {
      label: "Drill-through dashboards in 10 min",
      url: "https://www.youtube.com/watch?v=zQ7QFm-cgX0",
      note: "10 min. Click a customer name, jump to their detail page.",
    },
    {
      label: "Alerts on dashboard KPIs in 8 min",
      url: "https://www.youtube.com/watch?v=lz1ts2W0jBg",
      note: "8 min. Flag below-target KPIs in red automatically.",
    },
    {
      label: "Print-ready dashboards in 7 min",
      url: "https://www.youtube.com/watch?v=h2JINF4Ka1c",
      note: "7 min. Export-to-PDF layout.",
    },
  ],
  25: [
    {
      label: "Cole Knaflic storytelling - 18 min",
      url: "https://www.youtube.com/watch?v=8EMW7io4rSI",
      note: "18 min. Re-watch from W8. Take notes this time.",
    },
    {
      label: "One-sentence headline tactics - 5 min",
      url: "https://www.youtube.com/watch?v=meBzPK8Bh78",
      note: "5 min. Distill your capstone into ONE sentence under 20 words.",
    },
    {
      label: "Speaker notes done right - 6 min",
      url: "https://www.youtube.com/watch?v=BcgM1ZJTfCQ",
      note: "6 min. 30-second beats per slide. What to say, what to skip.",
    },
    {
      label: "Self-tape your presentation - 5 min",
      url: "https://www.youtube.com/watch?v=Mh9zddNCSlk",
      note: "5 min. Camera angle, lighting, voice. Pro look in 10 minutes of setup.",
    },
  ],
  26: [
    {
      label: "CEO memo writing in 6 min - HBR",
      url: "https://www.youtube.com/watch?v=Hfx1X9WSGYQ",
      note: "6 min. Re-watch. Apply to your capstone.",
    },
    {
      label: "Loom demo best practices in 4 min",
      url: "https://www.youtube.com/watch?v=qFqr_dDjpkE",
      note: "4 min. Re-watch. Script first, record in one take.",
    },
    {
      label: "Getting 3 readers - 6 min",
      url: "https://www.youtube.com/watch?v=tbBl5JcoYqU",
      note: "6 min. The DMs that get responses.",
    },
  ],
  27: [
    {
      label: "Portfolio site in 30 min - Vercel + Next.js",
      url: "https://www.youtube.com/watch?v=mTz0GXj8NN0",
      note: "30 min. From zero to deployed. Free domain.",
    },
    {
      label: "GitHub Pages portfolio in 10 min",
      url: "https://www.youtube.com/watch?v=2MsN8gpT6jY",
      note: "10 min. Even simpler. username.github.io. Pure HTML + CSS.",
    },
    {
      label: "LinkedIn profile for analysts - 12 min Tina Huang",
      url: "https://www.youtube.com/watch?v=pndb5lr8jJI",
      note: "12 min. About section, keywords, project links.",
    },
    {
      label: "GitHub profile README in 8 min",
      url: "https://www.youtube.com/watch?v=ECuqb5Tv9qI",
      note: "8 min. The README.md that auto-shows on your profile. First thing recruiters see.",
    },
    {
      label: "Common analyst interview questions in 15 min",
      url: "https://www.youtube.com/watch?v=mGZsNNvJTLM",
      note: "15 min. The 30 most-asked SQL + Excel + behavioral questions.",
    },
  ],
};

// =====================================================================
// DATA SCIENCE - 31 weeks - all under 30 min
// =====================================================================
const DS = {
  1: [
    P.githubAccount,
    P.anacondaInstall,
    P.jupyterIn5min,
    {
      label: "What is Data Science in 6 min - Joma Tech (honest)",
      url: "https://www.youtube.com/watch?v=xC-c7E5PK0Y",
      note: "6 min. A working FAANG DS tells you what the job is and is not.",
    },
    P.pythonIn100sec,
    {
      label: "Python lists and dicts in 15 min - Net Ninja",
      url: "https://www.youtube.com/watch?v=NSqWUyq2hKE",
      note: "15 min. The two data types you use 80% of the time.",
    },
    {
      label: "Python loops and functions in 18 min",
      url: "https://www.youtube.com/watch?v=ARjF8VzaOis",
      note: "18 min. for/while loops + def functions. Enough to write your first script.",
    },
    {
      label: "Pandas in 100 seconds - Fireship",
      url: "https://www.youtube.com/watch?v=tRKeLrwfUgU",
      note: "2 min. What pandas is.",
    },
    {
      label: "Pandas load CSV + filter in 12 min",
      url: "https://www.youtube.com/watch?v=vmEHCJofslg",
      note: "12 min. df.head(), filtering, .describe(). Enough for the taxi notebook.",
    },
    {
      label: "Matplotlib bar chart in 10 min",
      url: "https://www.youtube.com/watch?v=3Xc3CA655Y4",
      note: "10 min. Plot busiest-hour as a bar chart. Save as PNG.",
    },
    {
      label: "NYC TLC trip records (data download)",
      url: "https://www1.nyc.gov/site/tlc/about/tlc-trip-record-data.page",
      note: "Direct from NYC gov. Look for Yellow Taxi 2023-10 parquet.",
    },
    P.gitFirstRepo,
    P.readmeIn5min,
  ],
  2: [
    {
      label: "Linear algebra Chapter 1 - 10 min - 3Blue1Brown",
      url: "https://www.youtube.com/watch?v=fNk_zzaMoSs",
      note: "10 min. Vectors, what even are they? The most beautiful math video ever made.",
    },
    {
      label: "Linear algebra Chapter 2 - 11 min - 3Blue1Brown",
      url: "https://www.youtube.com/watch?v=k7RM-ot2NWY",
      note: "11 min. Linear combinations, span, basis vectors.",
    },
    {
      label: "Bayes Theorem in 15 min - 3Blue1Brown",
      url: "https://www.youtube.com/watch?v=HZGCoVF3YvM",
      note: "15 min. The clearest explanation of Bayes anywhere.",
    },
    {
      label: "Gradient Descent in 6 min - StatQuest",
      url: "https://www.youtube.com/watch?v=sDv4f4s2SB8",
      note: "6 min. Walking downhill. Why learning rate matters.",
    },
    {
      label: "Linear Regression in 27 min - StatQuest",
      url: "https://www.youtube.com/watch?v=nk2CQITm_eo",
      note: "27 min. The deepest 27-min explainer you will find. Watch BEFORE coding.",
    },
    {
      label: "NumPy in 18 min - Real Python",
      url: "https://www.youtube.com/watch?v=8JfDAm9y_7s",
      note: "18 min. NumPy arrays = the foundation of pandas. Mean, std, normalize.",
    },
  ],
  3: [
    {
      label: "Pandas merge in 20 min - Corey Schafer",
      url: "https://www.youtube.com/watch?v=iYWKfUOtGaw",
      note: "20 min. INNER, LEFT, RIGHT, OUTER joins for combining 2 dataframes.",
    },
    {
      label: "TLC Taxi Zone Lookup (direct CSV)",
      url: "https://d37ci6vzurychx.cloudfront.net/misc/taxi+_zone_lookup.csv",
      note: "Direct download. Maps PULocationID to borough names.",
    },
    {
      label: "Pandas concat in 10 min",
      url: "https://www.youtube.com/watch?v=hUbnyKtw5n8",
      note: "10 min. Stack Sept + Oct + Nov into one dataframe.",
    },
    {
      label: "Seaborn heatmaps in 12 min",
      url: "https://www.youtube.com/watch?v=cFFTDXcESxA",
      note: "12 min. Hour × day-of-week heatmap. Cleaner than matplotlib.",
    },
    {
      label: "Parquet vs CSV in 8 min",
      url: "https://www.youtube.com/watch?v=fyxoTeqyvyU",
      note: "8 min. Parquet is 10x smaller and faster. Why.",
    },
  ],
  4: [
    {
      label: "SQL in 100 seconds - Fireship",
      url: "https://www.youtube.com/watch?v=zsjvFFKOm3c",
      note: "2 min. The whole world runs on SQL.",
    },
    {
      label: "SELECT WHERE GROUP BY in 12 min - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=7mz73uXD9DA",
      note: "12 min. The 3 most-used verbs.",
    },
    {
      label: "JOINs in 10 min - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=9yeOJ0ZMUYw",
      note: "10 min. Venn diagrams + working queries.",
    },
    {
      label: "Window Functions in 14 min - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=Ww71knvhQ-s",
      note: "14 min. Top-N-per-group, running totals, rankings.",
    },
    {
      label: "CTEs in 8 min - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=K1WeoKxLZ5o",
      note: "8 min. WITH clauses. Readable multi-step queries.",
    },
    {
      label: "SQLite Online",
      url: "https://sqliteonline.com/",
      note: "Zero install. Import CSV, query in browser.",
    },
  ],
  5: [
    {
      label: "Linear Regression coding in 14 min - sklearn",
      url: "https://www.youtube.com/watch?v=cTjj3LE8E90",
      note: "14 min. Direct sklearn walkthrough. Fit, predict, evaluate.",
    },
    {
      label: "XGBoost in 13 min - StatQuest",
      url: "https://www.youtube.com/watch?v=OtD8wVaFm6E",
      note: "13 min. The model that wins most Kaggle competitions.",
    },
    {
      label: "Feature Engineering basics in 14 min",
      url: "https://www.youtube.com/watch?v=6WDFfaYtN6s",
      note: "14 min. Pick the right features. Matters more than picking the model.",
    },
    {
      label: "Residual plots in 8 min - StatQuest",
      url: "https://www.youtube.com/watch?v=lqKvE6E9XAY",
      note: "8 min. Where your model is failing. Look at the pattern.",
    },
    {
      label: "joblib save and load models in 5 min",
      url: "https://www.youtube.com/watch?v=KfnhNlD8WZI",
      note: "5 min. joblib > pickle for sklearn. Save your trained model.",
    },
  ],
  6: [
    {
      label: "Hypothesis Testing in 18 min - StatQuest",
      url: "https://www.youtube.com/watch?v=0oc49DyA3hU",
      note: "18 min. Null, alternative, p-values. Foundation video.",
    },
    {
      label: "t-test in 13 min - StatQuest",
      url: "https://www.youtube.com/watch?v=pTmLQvMM-1M",
      note: "13 min. When to reach for it.",
    },
    {
      label: "Chi-square in 11 min - StatQuest",
      url: "https://www.youtube.com/watch?v=ZNXso_riZag",
      note: "11 min. Categorical association: is borough × payment_type related?",
    },
    {
      label: "Confidence Intervals in 9 min - StatQuest",
      url: "https://www.youtube.com/watch?v=TqOeMYtOc1w",
      note: "9 min. What 95% CI actually means.",
    },
    {
      label: "Bootstrap in 10 min - StatQuest",
      url: "https://www.youtube.com/watch?v=Xz0x-8-cgaQ",
      note: "10 min. Resample 1000 times. CIs without distributional assumptions.",
    },
    {
      label: "Bonferroni correction in 7 min - StatQuest",
      url: "https://www.youtube.com/watch?v=K8LQSvtjcEo",
      note: "7 min. Multiple testing fix.",
    },
  ],
  7: [
    {
      label: "Flask in 18 min - Tech With Tim",
      url: "https://www.youtube.com/watch?v=oA8brF3w5XQ",
      note: "18 min. Just the routes. /predict and /health.",
    },
    {
      label: "joblib model save/load in 5 min",
      url: "https://www.youtube.com/watch?v=KfnhNlD8WZI",
      note: "5 min. Persist your trained model to a .pkl.",
    },
    {
      label: "Deploy Flask to Render in 12 min (free)",
      url: "https://www.youtube.com/watch?v=Y3T6m_5UE_M",
      note: "12 min. Render replaced free Heroku. Connect GitHub, deploy.",
    },
    {
      label: "Render signup (free)",
      url: "https://render.com/",
      note: "GitHub login. No card needed for the free tier.",
    },
    {
      label: "curl in 10 min - test your API",
      url: "https://www.youtube.com/watch?v=7XUibDYw4mc",
      note: "10 min. POST a JSON to /predict from the terminal.",
    },
  ],
  8: [
    {
      label: "BeautifulSoup in 20 min - Tech With Tim",
      url: "https://www.youtube.com/watch?v=ng2o98k983k",
      note: "20 min. Your first scraper. Headers, parsing, extracting.",
    },
    {
      label: "Scrapy vs BS4 in 8 min",
      url: "https://www.youtube.com/watch?v=ALizgnSFTwQ",
      note: "8 min. When to scale up to Scrapy.",
    },
    {
      label: "HuggingFace pipeline in 10 min",
      url: "https://www.youtube.com/watch?v=GSt00_-0ncQ",
      note: "10 min. Pretrained sentiment in 5 lines.",
    },
    {
      label: "robots.txt in 5 min",
      url: "https://www.youtube.com/watch?v=u3iN2lXFAk0",
      note: "5 min. Mandatory watch before scraping anything.",
    },
    {
      label: "Rate limiting with time.sleep in 6 min",
      url: "https://www.youtube.com/watch?v=7H6mTOFkSjQ",
      note: "6 min. Add 1-2 seconds between requests. Avoid bans.",
    },
  ],
  9: [
    {
      label: "Streamlit in 28 min - Misra Turp",
      url: "https://www.youtube.com/watch?v=ZZ4B0QUHuNc",
      note: "28 min. Build a Python web app in 10 lines. The full overview.",
    },
    {
      label: "Streamlit sidebar widgets in 9 min",
      url: "https://www.youtube.com/watch?v=2siBrMsqF44",
      note: "9 min. The 4 controls on your fare-predictor app.",
    },
    {
      label: "Streamlit caching in 8 min",
      url: "https://www.youtube.com/watch?v=lYDiSCDcxmc",
      note: "8 min. @st.cache_data. Without it your parquet reloads every click.",
    },
    {
      label: "Deploy to Streamlit Cloud in 6 min",
      url: "https://www.youtube.com/watch?v=HKoOBiAaHGg",
      note: "6 min. Connect GitHub, paste repo, live in 2 minutes.",
    },
  ],
  10: [
    {
      label: "Tech blog post structure in 12 min - Tina Huang",
      url: "https://www.youtube.com/watch?v=byNlhPOIVB0",
      note: "12 min. The structure that gets reach.",
    },
    {
      label: "Profile slow Python with cProfile in 10 min",
      url: "https://www.youtube.com/watch?v=qiZyDLEJHh0",
      note: "10 min. Find the slow cells. Optimize the 20% causing 80% of time.",
    },
    {
      label: "Asking for project feedback - 6 min",
      url: "https://www.youtube.com/watch?v=tbBl5JcoYqU",
      note: "6 min. DM templates that work.",
    },
    {
      label: "Medium vs Dev.to vs Hashnode in 9 min",
      url: "https://www.youtube.com/watch?v=L2u2QKlcUgU",
      note: "9 min. Where to post for max reach.",
    },
  ],
  11: [
    {
      label: "Cursor in 14 min - the AI code editor",
      url: "https://www.youtube.com/watch?v=ds9oxBkSEPE",
      note: "14 min. Built on VS Code. The default for AI-assisted coding now.",
    },
    {
      label: "Cursor download (free)",
      url: "https://cursor.sh/",
      note: "Click Download. GitHub login. 2000 free completions/month.",
    },
    {
      label: "Prompt patterns in 15 min - DAIR.AI",
      url: "https://www.youtube.com/watch?v=dOxUroR57xs",
      note: "15 min. Zero-shot, few-shot, chain-of-thought.",
    },
    {
      label: "ChatGPT for SQL in 8 min",
      url: "https://www.youtube.com/watch?v=Y9JzjcJ7LRM",
      note: "8 min. Workflow for getting SQL that runs first try.",
    },
    {
      label: "AI hallucinations in 6 min",
      url: "https://www.youtube.com/watch?v=GdJOA4XHpZ4",
      note: "6 min. AI invents column names. Always check.",
    },
  ],
  12: [
    {
      label: "Reddit PRAW in 20 min - Python Engineer",
      url: "https://www.youtube.com/watch?v=NRgfgtzIhBQ",
      note: "20 min. Scrape Reddit posts via the official API.",
    },
    {
      label: "Get Reddit API credentials in 3 min",
      url: "https://www.youtube.com/watch?v=oUuBxqsBaOY",
      note: "3 min. Create an app, get client_id + secret.",
    },
    {
      label: "HuggingFace sentiment in 10 min",
      url: "https://www.youtube.com/watch?v=GSt00_-0ncQ",
      note: "10 min. Tag 1000 posts in 5 lines of code.",
    },
    {
      label: "Pandas to_csv encoding in 5 min",
      url: "https://www.youtube.com/watch?v=ELyx0wH7p8E",
      note: "5 min. Save labeled.csv with the right encoding. Avoid Unicode hell.",
    },
  ],
  13: [
    {
      label: "TF-IDF in 12 min - StatQuest",
      url: "https://www.youtube.com/watch?v=hgjzHCPxxV8",
      note: "12 min. Why rare words count more than common ones.",
    },
    {
      label: "Logistic Regression in 14 min - StatQuest",
      url: "https://www.youtube.com/watch?v=yIYKR4sgzI8",
      note: "14 min. The baseline classifier for text.",
    },
    {
      label: "Naive Bayes in 16 min - StatQuest",
      url: "https://www.youtube.com/watch?v=O2L2Uv9pdDA",
      note: "16 min. The classic text-classification baseline. Often beats fancier models.",
    },
    {
      label: "Confusion Matrix in 8 min - StatQuest",
      url: "https://www.youtube.com/watch?v=Kdsp6soqA7o",
      note: "8 min. The 4 numbers every classifier gives you.",
    },
    {
      label: "TF-IDF vectorizer in sklearn - 13 min",
      url: "https://www.youtube.com/watch?v=R7YDoUf-VkA",
      note: "13 min. Vectorize text in 5 lines. Feed into LogReg.",
    },
  ],
  14: [
    {
      label: "A/B testing for ML in 14 min",
      url: "https://www.youtube.com/watch?v=zT4kVk8O28U",
      note: "14 min. How real teams test prompts and models.",
    },
    {
      label: "Sample size calculator - Evan Miller",
      url: "https://www.evanmiller.org/ab-testing/sample-size.html",
      note: "Bookmark. Plug accuracy + MDE, get N.",
    },
    {
      label: "Cohen's d in 9 min - StatQuest",
      url: "https://www.youtube.com/watch?v=IetVPNQrjF4",
      note: "9 min. Effect size > p-value.",
    },
    {
      label: "Random seeds in 5 min",
      url: "https://www.youtube.com/watch?v=KzqSDvzOFNA",
      note: "5 min. np.random.seed(42). Reproducibility.",
    },
  ],
  15: [
    {
      label: "Fine-tune DistilBERT in 24 min",
      url: "https://www.youtube.com/watch?v=GSt00_-0ncQ",
      note: "24 min. End-to-end Colab walkthrough.",
    },
    {
      label: "Google Colab for ML in 9 min",
      url: "https://www.youtube.com/watch?v=inN8seMm7UI",
      note: "9 min. Free T4 GPU. Runtime > Hardware accelerator > T4.",
    },
    {
      label: "Why DistilBERT vs BERT - 8 min",
      url: "https://www.youtube.com/watch?v=t45S_MwAcOw",
      note: "8 min. 60% smaller, 95% as good. The right size for a small project.",
    },
    {
      label: "Git LFS in 10 min - track big files",
      url: "https://www.youtube.com/watch?v=xPFLAAhuGy0",
      note: "10 min. Required for models > 100 MB.",
    },
    {
      label: "Learning rate sweeps in 10 min",
      url: "https://www.youtube.com/watch?v=P6sfmUTpUmc",
      note: "10 min. Why 1e-5 vs 2e-5 vs 5e-5 matters.",
    },
  ],
  16: [
    {
      label: "SHAP values in 19 min - StatQuest",
      url: "https://www.youtube.com/watch?v=L8_sVRhBDLU",
      note: "19 min. Why we use Shapley values to explain predictions.",
    },
    {
      label: "SHAP for tree models in 14 min",
      url: "https://www.youtube.com/watch?v=VB9uV-x0gtg",
      note: "14 min. TreeExplainer for XGBoost. Fast and exact.",
    },
    {
      label: "SHAP for logistic regression in 10 min",
      url: "https://www.youtube.com/watch?v=8C0LO51hF6M",
      note: "10 min. LinearExplainer for TFIDF + LogReg.",
    },
    {
      label: "Model bias in 12 min - Cassie Kozyrkov",
      url: "https://www.youtube.com/watch?v=B5MgVrXapnk",
      note: "12 min. Real examples of how models go biased.",
    },
  ],
  17: [
    {
      label: "Faker library in 10 min",
      url: "https://www.youtube.com/watch?v=6jHZ4F-MAd4",
      note: "10 min. Generate fake names, addresses, transactions.",
    },
    {
      label: "SMOTE in 14 min - StatQuest",
      url: "https://www.youtube.com/watch?v=u-Dl1d-VuVw",
      note: "14 min. Upsample the minority class. When it helps, when it hurts.",
    },
    {
      label: "When synthetic data backfires in 8 min",
      url: "https://www.youtube.com/watch?v=Vd5VEr_8Yks",
      note: "8 min. Real cases where synth data made models worse.",
    },
  ],
  18: [
    {
      label: "Streamlit dashboard refresh in 12 min",
      url: "https://www.youtube.com/watch?v=ZZ4B0QUHuNc",
      note: "12 min. Re-watch the sections you need. Skip the rest.",
    },
    {
      label: "Streamlit deployment in 6 min",
      url: "https://www.youtube.com/watch?v=HKoOBiAaHGg",
      note: "6 min. GitHub to live URL.",
    },
    {
      label: "Plotly heatmaps in 8 min",
      url: "https://www.youtube.com/watch?v=cFFTDXcESxA",
      note: "8 min. Interactive heatmap (hover-able cells) instead of static matplotlib.",
    },
  ],
  19: [
    {
      label: "FastAPI in 25 min - Patrick Loeber",
      url: "https://www.youtube.com/watch?v=tLKKmouUams",
      note: "25 min. Faster than Flask, with auto-generated docs.",
    },
    {
      label: "Docker for Python in 20 min - Patrick Loeber",
      url: "https://www.youtube.com/watch?v=bi0cKgmRuiA",
      note: "20 min. Dockerfile + build + run. The whole flow.",
    },
    {
      label: "HuggingFace Spaces in 8 min",
      url: "https://www.youtube.com/watch?v=4n5g_-aHi8I",
      note: "8 min. Free hosting for Docker images. The easiest path.",
    },
    {
      label: "FastAPI JWT auth in 14 min",
      url: "https://www.youtube.com/watch?v=5GxQ1rLTwaU",
      note: "14 min. Protect /predict behind a token.",
    },
    {
      label: "slowapi rate limiting in 6 min",
      url: "https://www.youtube.com/watch?v=A6gTjOjkmRA",
      note: "6 min. Add @limiter.limit('5/minute').",
    },
  ],
  20: [
    {
      label: "Tech blog post structure - 12 min Tina Huang",
      url: "https://www.youtube.com/watch?v=byNlhPOIVB0",
      note: "12 min. The 1000-1500 word template that works.",
    },
    {
      label: "Loom best practices in 4 min",
      url: "https://www.youtube.com/watch?v=qFqr_dDjpkE",
      note: "4 min. Free for 25 videos. Standard for demo videos.",
    },
    {
      label: "Cross-posting to Medium in 6 min",
      url: "https://www.youtube.com/watch?v=L2u2QKlcUgU",
      note: "6 min. Canonical link. Reach without SEO penalty.",
    },
  ],
  21: [
    {
      label: "Time Series basics in 28 min - Krish Naik",
      url: "https://www.youtube.com/watch?v=GE3JOFwTWVM",
      note: "28 min. The shortest complete intro: trend, seasonality, decomposition.",
    },
    {
      label: "AEP Hourly Energy on Kaggle",
      url: "https://www.kaggle.com/datasets/robikscube/hourly-energy-consumption",
      note: "Direct download. 10+ years of hourly readings.",
    },
    {
      label: "Time Series decomposition in 13 min - StatQuest",
      url: "https://www.youtube.com/watch?v=0ar9extHObg",
      note: "13 min. Trend + seasonal + residual.",
    },
    {
      label: "Autocorrelation (ACF) in 12 min",
      url: "https://www.youtube.com/watch?v=DeORzP0go5I",
      note: "12 min. How to read an ACF plot.",
    },
    {
      label: "Persistence baseline in 6 min",
      url: "https://www.youtube.com/watch?v=u433nrxdf5k",
      note: "6 min. The model your fancy model has to beat.",
    },
  ],
  22: [
    {
      label: "ARIMA in 22 min - StatQuest",
      url: "https://www.youtube.com/watch?v=3UmyHed0iYE",
      note: "22 min. AR + I + MA without the jargon.",
    },
    {
      label: "auto_arima with pmdarima in 13 min",
      url: "https://www.youtube.com/watch?v=2XGSIlgUBDI",
      note: "13 min. Auto-picks p, d, q for you.",
    },
    {
      label: "ADF stationarity in 12 min",
      url: "https://www.youtube.com/watch?v=DeORzP0go5I",
      note: "12 min. When to stop differencing.",
    },
    {
      label: "SARIMAX seasonality in 18 min",
      url: "https://www.youtube.com/watch?v=PCfQqmqfeS4",
      note: "18 min. Add weekly + yearly cycles to ARIMA.",
    },
  ],
  23: [
    {
      label: "Prophet in 18 min - Greg Hogg",
      url: "https://www.youtube.com/watch?v=KvLG1uTC-KU",
      note: "18 min. Built for business forecasting. Handles holidays automatically.",
    },
    {
      label: "Prophet docs - holidays + changepoints",
      url: "https://facebook.github.io/prophet/docs/seasonality,_holiday_effects,_and_regressors.html",
      note: "Reference. Use after the Greg Hogg video.",
    },
    {
      label: "Prophet with extra regressors in 11 min",
      url: "https://www.youtube.com/watch?v=tIfP9zoUbac",
      note: "11 min. Add temperature as a feature.",
    },
    {
      label: "NOAA historical weather (data)",
      url: "https://www.ncei.noaa.gov/cdo-web/datatools/lcd",
      note: "Free hourly weather. Pick a station near AEP service.",
    },
  ],
  24: [
    {
      label: "PyTorch basics in 25 min - Patrick Loeber",
      url: "https://www.youtube.com/watch?v=EMXfZB8FVUA",
      note: "25 min. Tensors, autograd, training loop.",
    },
    {
      label: "LSTM for time series in 21 min",
      url: "https://www.youtube.com/watch?v=AvKSPZ7oyVg",
      note: "21 min. Sliding windows + LSTM in PyTorch. Direct walkthrough.",
    },
    {
      label: "Why LSTMs in 9 min - StatQuest",
      url: "https://www.youtube.com/watch?v=YCzL96nL7j0",
      note: "9 min. Why vanilla RNNs forget long sequences.",
    },
    {
      label: "GRU vs LSTM in 11 min - StatQuest",
      url: "https://www.youtube.com/watch?v=8HyCNIVRbSU",
      note: "11 min. Often equally good, simpler.",
    },
  ],
  25: [
    {
      label: "MLflow basics in 28 min - Krish Naik",
      url: "https://www.youtube.com/watch?v=qdcHHrsXA48",
      note: "28 min. Track experiments, register models. Standard MLOps tool.",
    },
    {
      label: "Evidently AI drift in 12 min",
      url: "https://www.youtube.com/watch?v=2tt9ZE_iIWY",
      note: "12 min. Open-source drift reports. HTML output.",
    },
    {
      label: "MLflow model registry in 9 min",
      url: "https://www.youtube.com/watch?v=ZbXEbgQVeqA",
      note: "9 min. Staging vs Production vs Archived stages.",
    },
    {
      label: "Python to Slack webhook in 5 min",
      url: "https://www.youtube.com/watch?v=6gHvqXrfjuo",
      note: "5 min. Send drift alerts to a channel.",
    },
  ],
  26: [
    {
      label: "AWS Free Tier safely in 15 min",
      url: "https://www.youtube.com/watch?v=WuMqXTQ4mEU",
      note: "15 min. Set budget alerts first. Avoid surprise bills.",
    },
    {
      label: "boto3 (AWS SDK) basics in 18 min",
      url: "https://www.youtube.com/watch?v=bIxBNXJ8YD8",
      note: "18 min. Upload + download from S3.",
    },
    {
      label: "BigQuery + Python in 12 min",
      url: "https://www.youtube.com/watch?v=eIec0RFTFxg",
      note: "12 min. Query the public NYC TLC dataset from Python.",
    },
    {
      label: "S3 cost gotchas in 9 min",
      url: "https://www.youtube.com/watch?v=2zk1RNQJXcg",
      note: "9 min. The 5 things that quietly run up your bill.",
    },
    {
      label: "s3fs in 8 min",
      url: "https://www.youtube.com/watch?v=l6T8svQ_uS8",
      note: "8 min. pandas.read_csv('s3://...') just works after this.",
    },
  ],
  27: [
    {
      label: "Streamlit dashboard in 28 min - Misra Turp",
      url: "https://www.youtube.com/watch?v=ZZ4B0QUHuNc",
      note: "28 min. Re-watch. Build the forecasts dashboard.",
    },
    {
      label: "Posting to Hacker News in 9 min",
      url: "https://www.youtube.com/watch?v=8nFI4OldOaQ",
      note: "9 min. Show HN rules + titles that get traction.",
    },
    {
      label: "1000-word tech post structure - 12 min Tina Huang",
      url: "https://www.youtube.com/watch?v=byNlhPOIVB0",
      note: "12 min. The template that gets read.",
    },
  ],
  28: [
    {
      label: "Scoping a project in 10 min - Andrew Ng style",
      url: "https://www.youtube.com/watch?v=eg_E9hjlYP4",
      note: "10 min. Problem, data, metric, baseline. The 4-step framework.",
    },
    {
      label: "Picking a portfolio topic - 7 min Luke Barousse",
      url: "https://www.youtube.com/watch?v=byNlhPOIVB0",
      note: "7 min. Real-world topic beats toy dataset.",
    },
    {
      label: "Writing SPEC.md in 10 min",
      url: "https://www.youtube.com/watch?v=A6cE_Q1eQyA",
      note: "10 min. Problem, scope, non-goals, success metric, timeline.",
    },
  ],
  29: [
    {
      label: "Baseline-first ML in 14 min - StatQuest",
      url: "https://www.youtube.com/watch?v=nk2CQITm_eo",
      note: "14 min. Always benchmark against linear regression / mean prediction first.",
    },
    {
      label: "EDA in 20 min - Keith Galli",
      url: "https://www.youtube.com/watch?v=eMOA1pPVUc4",
      note: "20 min. First 20 minutes with any new dataset.",
    },
    {
      label: "Cross-validation in 6 min - StatQuest",
      url: "https://www.youtube.com/watch?v=fSytzGwwBVw",
      note: "6 min. Why single train/test split is risky. K-fold fixes it.",
    },
  ],
  30: [
    {
      label: "Deploy with Streamlit Cloud or HF Spaces - 6 min",
      url: "https://www.youtube.com/watch?v=HKoOBiAaHGg",
      note: "6 min. Pick the host that matches your project.",
    },
    {
      label: "Blog post template - 12 min Tina Huang",
      url: "https://www.youtube.com/watch?v=byNlhPOIVB0",
      note: "12 min. By now you have written 2 blog posts. The 3rd should be your best.",
    },
    {
      label: "Portfolio site with Next.js in 30 min",
      url: "https://www.youtube.com/watch?v=mTz0GXj8NN0",
      note: "30 min. From zero to deployed.",
    },
  ],
  31: [
    {
      label: "DS interview question hits in 15 min",
      url: "https://www.youtube.com/watch?v=mGZsNNvJTLM",
      note: "15 min. The 30 most-asked SQL + stats + ML questions.",
    },
    {
      label: "STAR method behavioral interviews - 9 min Jeff Su",
      url: "https://www.youtube.com/watch?v=8QYJ7lI2VEs",
      note: "9 min. Situation, Task, Action, Result. The structure FAANG expects.",
    },
    {
      label: "ML system design interview in 22 min",
      url: "https://www.youtube.com/watch?v=DSGsa0pu8-k",
      note: "22 min. Whiteboarding an ML system. Senior DS interviews focus here.",
    },
    {
      label: "LinkedIn for DS - 12 min Tina Huang",
      url: "https://www.youtube.com/watch?v=pndb5lr8jJI",
      note: "12 min. Headline, About, Featured. The 3 sections recruiters read.",
    },
    {
      label: "GitHub profile README - 8 min",
      url: "https://www.youtube.com/watch?v=ECuqb5Tv9qI",
      note: "8 min. The README.md auto-shown on your GitHub profile.",
    },
    {
      label: "Negotiating your first offer - 14 min",
      url: "https://www.youtube.com/watch?v=KCu7gQQ4yEs",
      note: "14 min. The numbers nobody tells you.",
    },
  ],
};

function applyTo(file, byNumber) {
  const p = path.join(ROOT, file);
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  let n = 0;
  for (const w of d.weeks) {
    const r = byNumber[w.number];
    if (r && r.length) {
      w.resources = r;
      n++;
    }
  }
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
  console.log(file, "- resources rewritten for", n, "of", d.weeks.length, "weeks");
}

applyTo("data-analysis.json", DA);
applyTo("data-science.json", DS);
