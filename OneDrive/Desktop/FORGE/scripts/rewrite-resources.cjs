/**
 * Curriculum resource overhaul. Every week's `resources` array gets rewritten
 * with SPECIFIC YouTube video URLs (no channel pages, no search queries),
 * hand-holding prerequisites for assumed skills, and friendly notes that
 * tell the student WHY each resource matters and WHEN to use it.
 *
 * Run from repo root:  node scripts/rewrite-resources.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "data", "roadmaps");

// Re-used hand-holding resources for skills we assume across weeks.
const PREREQ = {
  gitFirstTime: {
    label: "Git and GitHub for Beginners - freeCodeCamp",
    url: "https://www.youtube.com/watch?v=RGOj5yH7evk",
    note: "1 hour. If you have never used Git before, watch this FIRST before doing anything else. Covers install, your first repo, commit, push.",
  },
  gitDailyCommands: {
    label: "Git Tutorial for Beginners by Kevin Stratvert",
    url: "https://www.youtube.com/watch?v=tRZGeaHPoaw",
    note: "30 minutes. The five commands you use daily: clone, add, commit, push, pull. Bookmark and rewatch when stuck.",
  },
  githubAccount: {
    label: "How to Create a GitHub Account (3 min)",
    url: "https://www.youtube.com/watch?v=QUtk-Uuq9nE",
    note: "Sign up here: https://github.com/join - takes 2 minutes. Username matters - use your real name where possible, this becomes your public portfolio.",
  },
  pushToGithub: {
    label: "How to push your code to GitHub - step by step",
    url: "https://www.youtube.com/watch?v=pBy1zgt0XPc",
    note: "Use this every time a week asks you to 'push to GitHub'. The 4 commands: git init, git add ., git commit -m, git push.",
  },
  writeReadme: {
    label: "How to write a good README - freeCodeCamp",
    url: "https://www.youtube.com/watch?v=E6NO0rgFub4",
    note: "Your README is the FIRST thing a recruiter sees on your repo. This shows you the 7 sections every project README should have.",
  },
  terminalBasics: {
    label: "Terminal / Command Line Crash Course - Traversy Media",
    url: "https://www.youtube.com/watch?v=uwAqEzhyjtw",
    note: "20 minutes. cd, ls, mkdir, rm - the commands every single tutorial assumes you know. Watch BEFORE Week 2 if you have never used a terminal.",
  },
  installAnaconda: {
    label: "Anaconda Install + First Jupyter Notebook in 10 min",
    url: "https://www.youtube.com/watch?v=WUeBzT43JyY",
    note: "Anaconda gives you Python + Jupyter + 100+ data libraries in one install. Do not install Python separately, this is easier.",
  },
  vscodeInstall: {
    label: "VS Code Setup for Python in 10 min",
    url: "https://www.youtube.com/watch?v=06I63_p-2A4",
    note: "When you outgrow notebooks and want to write real .py scripts, VS Code is the standard. Install the Python extension first thing.",
  },
};

// =====================================================================
// DATA ANALYSIS - 27 weeks
// =====================================================================
const DA = {
  1: [
    PREREQ.githubAccount,
    {
      label: "What does a Data Analyst actually do? - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=foO9phUDPM8",
      note: "12 min. A real working analyst walks you through his actual day. Watch first - sets the tone for everything ahead.",
    },
    {
      label: "Excel for Beginners - Full Course by Kevin Stratvert",
      url: "https://www.youtube.com/watch?v=Vl0H-qTclOg",
      note: "2 hours. Open Excel on the side and follow along. By the end you can navigate, format cells, and write basic formulas.",
    },
    {
      label: "Excel SUMIFS, COUNTIFS, AVERAGEIFS in 12 minutes - Leila Gharani",
      url: "https://www.youtube.com/watch?v=BfsfwIvlfQI",
      note: "The three formulas you will use every single day as an analyst. Drill them until you can write SUMIFS without looking.",
    },
    {
      label: "Excel Pivot Tables Complete Tutorial - Leila Gharani",
      url: "https://www.youtube.com/watch?v=m0wI61ahfLc",
      note: "30 min. Pivot tables are the single most useful Excel feature for an analyst. Watch this BEFORE building your Q1/Q2/Q3 pivots.",
    },
    {
      label: "XLOOKUP - the lookup function that replaced VLOOKUP - Leila",
      url: "https://www.youtube.com/watch?v=O--RVxQRRsk",
      note: "10 min. XLOOKUP is what modern analysts use. Old tutorials show VLOOKUP, skip those.",
    },
    {
      label: "Sample Superstore dataset (free download)",
      url: "https://community.tableau.com/s/question/0D54T00000CWeX8SAL/sample-superstore-sales-excelxls",
      note: "Click Open to download Sample-Superstore.xls. If it asks for Tableau login, sign up free. This is the file you analyze all week.",
    },
    PREREQ.pushToGithub,
    PREREQ.writeReadme,
  ],
  2: [
    PREREQ.installAnaconda,
    PREREQ.terminalBasics,
    {
      label: "Python for Beginners - Full Course by freeCodeCamp",
      url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
      note: "4.5 hours. Watch sections 1-6 (lists, dicts, loops, functions). You do not need the rest yet. Pause and code along.",
    },
    {
      label: "Pandas Tutorial - Read CSV, filter, group, plot by Corey Schafer",
      url: "https://www.youtube.com/watch?v=ZyhVh-qRZPA",
      note: "Part 1 of Corey's pandas series. Pandas is what replaces Excel when datasets get big. Most-loved teacher for pandas, full stop.",
    },
    {
      label: "Pandas groupby tutorial - Corey Schafer",
      url: "https://www.youtube.com/watch?v=txMdrV1Ut64",
      note: "30 min. groupby is the pandas equivalent of an Excel pivot table. Practice with your Superstore data.",
    },
    {
      label: "matplotlib basics in 20 minutes - Corey Schafer",
      url: "https://www.youtube.com/watch?v=UO98lJQ3QGI",
      note: "Plotting in Python. Save your first chart as PNG with plt.savefig('chart.png').",
    },
    {
      label: "How to schedule a Python script on Windows (Task Scheduler)",
      url: "https://www.youtube.com/watch?v=Y4lTtNVeb-Y",
      note: "Set monthly_report.py to run automatically. On Mac/Linux use cron - same concept.",
    },
    PREREQ.pushToGithub,
  ],
  3: [
    {
      label: "Pandas scatter plots and correlations - Keith Galli",
      url: "https://www.youtube.com/watch?v=eMOA1pPVUc4",
      note: "Real-world pandas walkthrough. Skip to the visualization section if you only need scatter plots.",
    },
    {
      label: "Excel scatter plot tutorial - Leila Gharani",
      url: "https://www.youtube.com/watch?v=qHQDfzS-AZA",
      note: "5 minutes. Build the Discount-vs-Profit scatter in Excel if pandas feels too heavy this week.",
    },
    {
      label: "Correlation does NOT mean causation - Veritasium",
      url: "https://www.youtube.com/watch?v=8B271L3NtAw",
      note: "12 min. The MOST important concept in analysis. Before reading too much into the discount/profit number, watch this.",
    },
    {
      label: "Binning continuous data - Excel + pandas - StatQuest",
      url: "https://www.youtube.com/watch?v=fLgojNo9JI8",
      note: "Why we bucket numbers (5 discount ranges) instead of treating each value separately.",
    },
    {
      label: "Git tagging tutorial - how to tag releases",
      url: "https://www.youtube.com/watch?v=8cnaPgklP3w",
      note: "How to tag v0.2 on your repo. 5 minutes. Every time a week says 'tag vX.Y', run these commands.",
    },
  ],
  4: [
    {
      label: "Customer Lifetime Value Explained - The CLV Show",
      url: "https://www.youtube.com/watch?v=h7QhcBp6Sps",
      note: "10 min. Why CLV matters and what it actually measures. Watch BEFORE you compute it.",
    },
    {
      label: "RFM Analysis (Recency, Frequency, Monetary) tutorial",
      url: "https://www.youtube.com/watch?v=GjPYlovEqRk",
      note: "The professional way to segment customers. Apply to Superstore: who comes back, who spends, who churned.",
    },
    {
      label: "Pandas pivot_table tutorial - Corey Schafer",
      url: "https://www.youtube.com/watch?v=xPzr3sCwhQw",
      note: "Build the CLV-per-customer pivot in pandas. Faster than Excel for 10k rows.",
    },
    {
      label: "Quantile / quartile segmentation explained",
      url: "https://www.youtube.com/watch?v=IFKQLDmRK0Y",
      note: "How to define VIP/Regular/Casual thresholds. Use pandas .quantile() or Excel PERCENTILE.",
    },
    {
      label: "How to compute churn rate properly - Data School",
      url: "https://www.youtube.com/watch?v=cFFTDXcESxA",
      note: "Churn = customers who stopped buying. The trick is defining 'stopped'. This shows you 3 ways.",
    },
  ],
  5: [
    {
      label: "SQL Tutorial - Full Course for Beginners by Mike Dane (freeCodeCamp)",
      url: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
      note: "4 hours. The single best free SQL course on YouTube. Watch in 30-min chunks, run every query along the way.",
    },
    {
      label: "SQL CTEs explained in 10 min - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=K1WeoKxLZ5o",
      note: "CTEs are how you break a complex query into readable steps. Every Q2 YoY analysis uses one.",
    },
    {
      label: "SQL Window Functions tutorial - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=Ww71knvhQ-s",
      note: "Window functions = compute medians, running totals, top-N-per-group. Essential for analyst interviews.",
    },
    {
      label: "SQLite Online - free browser SQL editor",
      url: "https://sqliteonline.com/",
      note: "Zero install. Upload Orders.csv, run SQL right in the browser. Bookmark this.",
    },
    {
      label: "How to import CSV into SQL - 3 min walkthrough",
      url: "https://www.youtube.com/watch?v=koJv6w_LzZw",
      note: "The literal 3-click process for importing Superstore into SQLiteOnline.",
    },
  ],
  6: [
    {
      label: "Confidence Intervals - StatQuest",
      url: "https://www.youtube.com/watch?v=TqOeMYtOc1w",
      note: "10 min. The clearest explanation of what a 95% CI actually means. Watch BEFORE you compute one.",
    },
    {
      label: "p-values clearly explained - StatQuest",
      url: "https://www.youtube.com/watch?v=vemZtEM63GY",
      note: "10 min. Most analysts misinterpret p-values. Do not be one of them.",
    },
    {
      label: "t-test explained - StatQuest",
      url: "https://www.youtube.com/watch?v=pTmLQvMM-1M",
      note: "When to use a t-test, how it works, what its assumptions are. Bookmark this video.",
    },
    {
      label: "Simpson's Paradox explained - MinutePhysics",
      url: "https://www.youtube.com/watch?v=ebEkn-BiW5k",
      note: "8 min. The thing that humbles every junior analyst at some point. Catch it before it catches you.",
    },
    {
      label: "Spurious correlations gallery",
      url: "https://www.tylervigen.com/spurious-correlations",
      note: "Reference site. Per capita cheese consumption correlates with deaths from bedsheet entanglement. Hilarious AND instructive.",
    },
    {
      label: "Bonferroni correction - StatQuest (multiple testing)",
      url: "https://www.youtube.com/watch?v=K8LQSvtjcEo",
      note: "When you run 10 t-tests, you WILL get a false positive. This is the fix.",
    },
  ],
  7: [
    {
      label: "Prompt Engineering Crash Course - Andrew Ng (DeepLearning.AI)",
      url: "https://www.youtube.com/watch?v=_ZvnD73m40o",
      note: "1.5 hours. THE prompt engineering course. Skip if you watched this for a previous week.",
    },
    {
      label: "ChatGPT for Data Analysts - DataCamp",
      url: "https://www.youtube.com/watch?v=-NMOyEVHsi8",
      note: "How working analysts actually use ChatGPT day-to-day. Real workflows, not hype.",
    },
    {
      label: "How to use Claude for SQL generation",
      url: "https://www.youtube.com/watch?v=Y9JzjcJ7LRM",
      note: "Claude is often better at SQL than ChatGPT. Compare both on the same prompt.",
    },
    {
      label: "AI hallucinations and how to catch them - DeepLearning.AI",
      url: "https://www.youtube.com/watch?v=GdJOA4XHpZ4",
      note: "Critical. AI confidently invents column names that do not exist in your data. Always sanity-check.",
    },
  ],
  8: [
    {
      label: "How to make a presentation that does not suck - Cole Knaflic",
      url: "https://www.youtube.com/watch?v=8EMW7io4rSI",
      note: "20 min. The author of 'Storytelling with Data'. The most-quoted talk in data viz.",
    },
    {
      label: "Executive Storytelling for Analysts - HBS",
      url: "https://www.youtube.com/watch?v=Hfx1X9WSGYQ",
      note: "How to present numbers to a CEO who has 4 minutes. The Pyramid Principle in action.",
    },
    {
      label: "PowerPoint Design Crash Course - Brent Dykes",
      url: "https://www.youtube.com/watch?v=BcgM1ZJTfCQ",
      note: "Stop using bullet points. Use one chart + one sentence per slide.",
    },
    {
      label: "The 1-3-1 Slide Rule for Insights",
      url: "https://www.youtube.com/watch?v=meBzPK8Bh78",
      note: "Headline. Three supporting points. One ask. Steal this structure for every deck.",
    },
  ],
  9: [
    {
      label: "How to ask for feedback on your data project - Luke Barousse",
      url: "https://www.youtube.com/watch?v=byNlhPOIVB0",
      note: "Where to find honest reviewers (Discord, Reddit, LinkedIn). The exact DM to send.",
    },
    {
      label: "How to write a project RETRO doc - Stripe Engineering blog",
      url: "https://www.youtube.com/watch?v=ARyEPnGgvCw",
      note: "What worked, what did not, what next. The pattern professional teams use.",
    },
    {
      label: "Loom - record a 2-minute project walkthrough",
      url: "https://www.youtube.com/watch?v=qFqr_dDjpkE",
      note: "Loom is free for 25 videos. Record your dashboard demo here.",
    },
    {
      label: "How to make a data project go viral on LinkedIn - Tina Huang",
      url: "https://www.youtube.com/watch?v=pndb5lr8jJI",
      note: "Real engagement playbook from someone who has done it. Includes post templates.",
    },
  ],
  10: [
    {
      label: "IBM HR Attrition dataset on Kaggle",
      url: "https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset",
      note: "Download WA_Fn-UseC_-HR-Employee-Attrition.csv. 1470 rows. Classic teaching dataset.",
    },
    {
      label: "Kaggle account setup in 2 minutes",
      url: "https://www.youtube.com/watch?v=I91kZWPlAOQ",
      note: "If you do not have a Kaggle account yet. Free, takes 90 seconds.",
    },
    {
      label: "HR Analytics 101 - Josh Bersin (industry context)",
      url: "https://www.youtube.com/watch?v=k_BBnnEPddw",
      note: "What HR pros actually care about. Tells you which findings will matter to them.",
    },
    {
      label: "Excel pivot table refresher - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=hSatU-vbLwM",
      note: "Re-watch if pivots feel rusty from Week 1.",
    },
    {
      label: "Cohort Analysis Explained - Mode Analytics",
      url: "https://www.youtube.com/watch?v=GpEX95LXY5w",
      note: "Watch before next week. Cohorts = grouping people by when they joined and watching their behavior over time.",
    },
  ],
  11: [
    {
      label: "Survival Analysis intuition - StatQuest",
      url: "https://www.youtube.com/watch?v=v1QqpG0rR1k",
      note: "The math behind 'how many months until 50% of a cohort leaves'. Bookmark for when you want to go deeper.",
    },
    {
      label: "Bucketing continuous variables in Excel",
      url: "https://www.youtube.com/watch?v=t1Y4w2bJI20",
      note: "How to turn YearsAtCompany into 0-1, 2-5, 6-10 buckets using IF or FLOOR.",
    },
    {
      label: "Cross tabulation in Excel - Leila Gharani",
      url: "https://www.youtube.com/watch?v=Lme2VlAR9hM",
      note: "Tenure × Role pivot is just a cross-tab. This shows how to build one in 3 minutes.",
    },
    {
      label: "Cumulative chart in Excel - 5-minute tutorial",
      url: "https://www.youtube.com/watch?v=fhGcL_yqJek",
      note: "Build a chart that shows attrition stacking up over years.",
    },
  ],
  12: [
    {
      label: "Excel Dashboard from Scratch - Leila Gharani",
      url: "https://www.youtube.com/watch?v=opJgMj1IUrc",
      note: "1 hour. Build a full HR-style dashboard with KPIs, slicers, charts. The most useful single video for Week 12.",
    },
    {
      label: "How to use slicers and timelines in Excel",
      url: "https://www.youtube.com/watch?v=cIaepONu5MA",
      note: "Slicers are the clickable filters on your dashboard. 5 minutes.",
    },
    {
      label: "How to design a 1-page HR memo - HBR template walkthrough",
      url: "https://www.youtube.com/watch?v=fGjE2_aaJWk",
      note: "How HBR-style memos are structured. Headline + finding + recommendation.",
    },
    {
      label: "Cost of Employee Turnover - SHRM",
      url: "https://www.youtube.com/watch?v=jB-_4Hb38xY",
      note: "Real industry numbers for replacement cost. Use $15k-$30k per employee as your dollar-impact estimate.",
    },
  ],
  13: [
    {
      label: "How to anonymize a dataset properly",
      url: "https://www.youtube.com/watch?v=YfgwGGc4D1w",
      note: "Remove names, mask emails, generalize zip codes. Why and how.",
    },
    {
      label: "Recording a software demo with OBS Studio (free)",
      url: "https://www.youtube.com/watch?v=DTk99mHDX_I",
      note: "OBS is the pro tool. Loom is easier. Pick one and record your 3-minute demo.",
    },
    {
      label: "How to ask working professionals for feedback - Tina Huang",
      url: "https://www.youtube.com/watch?v=tbBl5JcoYqU",
      note: "How to slide into someone's DMs without being annoying. Real scripts.",
    },
    {
      label: "LinkedIn project posts that worked - Luke Barousse",
      url: "https://www.youtube.com/watch?v=byNlhPOIVB0",
      note: "Re-watch. Use his post template for the HR project announcement.",
    },
  ],
  14: [
    {
      label: "Web Scraping with Python and BeautifulSoup - freeCodeCamp",
      url: "https://www.youtube.com/watch?v=XVv6mJpFOb0",
      note: "1.5 hours. Full beginner walkthrough. Pause at the 30-min mark to start your scraper.",
    },
    {
      label: "What is robots.txt and why it matters - John Watson",
      url: "https://www.youtube.com/watch?v=u3iN2lXFAk0",
      note: "Before scraping ANY site, read its /robots.txt. This video tells you what to look for.",
    },
    {
      label: "Books to Scrape - practice site",
      url: "https://books.toscrape.com/",
      note: "Built for scraping practice. Safe to hit with any rate limit. Use this, not real production sites.",
    },
    {
      label: "Quotes to Scrape - second practice site",
      url: "http://quotes.toscrape.com/",
      note: "Pagination practice. 10 pages of quotes to iterate through.",
    },
    {
      label: "Windows Task Scheduler - schedule a daily Python script",
      url: "https://www.youtube.com/watch?v=Y4lTtNVeb-Y",
      note: "Re-watch from W2. Use this to run your scraper every morning.",
    },
    {
      label: "How to send email alerts from Python - smtplib",
      url: "https://www.youtube.com/watch?v=JRCJ6RtE3xU",
      note: "20 min. Send yourself an email when a price drops >20%.",
    },
  ],
  15: [
    {
      label: "Olist E-Commerce dataset on Kaggle",
      url: "https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce",
      note: "Real anonymized data from a Brazilian marketplace. 9 CSVs. Free download.",
    },
    {
      label: "How to draw a schema diagram - dbdiagram.io tutorial",
      url: "https://www.youtube.com/watch?v=l5_RnTPdPnc",
      note: "Free tool, zero install, copy-paste your CSV columns and it draws the diagram.",
    },
    {
      label: "Funnel Analysis Explained - Reforge",
      url: "https://www.youtube.com/watch?v=BL_NkqyvxhU",
      note: "What funnels measure and where they typically leak. Reforge teaches this to growth teams.",
    },
    {
      label: "Pandas merge / join explained - Corey Schafer",
      url: "https://www.youtube.com/watch?v=iYWKfUOtGaw",
      note: "Joining 9 CSVs together. This shows you the 4 join types with real examples.",
    },
    {
      label: "Delivery time and customer satisfaction - HBR podcast",
      url: "https://www.youtube.com/watch?v=ftA3hOXFXMI",
      note: "Context: why delivery speed matters for ecommerce. 15 min.",
    },
  ],
  16: [
    {
      label: "Cohort retention curves explained - Mode Analytics",
      url: "https://www.youtube.com/watch?v=GpEX95LXY5w",
      note: "Re-watch from W10. This week you build the matrix yourself.",
    },
    {
      label: "How to build a retention cohort in pandas - Towards Data Science",
      url: "https://www.youtube.com/watch?v=Y0vlhRoGyM0",
      note: "Step-by-step pandas code to compute month-by-month retention.",
    },
    {
      label: "How to build a cohort heatmap in Excel/Sheets",
      url: "https://www.youtube.com/watch?v=4PE6mTjjOyA",
      note: "Conditional formatting is your friend. Green for high retention, red for low.",
    },
    {
      label: "Repeat purchase rate KPI explained - Shopify Plus",
      url: "https://www.youtube.com/watch?v=W2vJN-FFRlA",
      note: "Industry benchmarks: 25-30% repeat rate is healthy for ecommerce.",
    },
  ],
  17: [
    {
      label: "A/B Testing Explained - Harvard Business Review",
      url: "https://www.youtube.com/watch?v=DUNk4GPZ9bw",
      note: "10 min. Why A/B tests matter and what they actually tell you.",
    },
    {
      label: "Sample size calculation - StatQuest",
      url: "https://www.youtube.com/watch?v=Rsc5znwR5FA",
      note: "How many users you need before you can trust your result. Power = 80%, alpha = 5% by default.",
    },
    {
      label: "Free A/B test sample size calculator (Evan Miller)",
      url: "https://www.evanmiller.org/ab-testing/sample-size.html",
      note: "Plug in baseline rate + MDE + power, it tells you N per arm. Bookmark.",
    },
    {
      label: "p-value pitfalls in A/B testing - Hubspot",
      url: "https://www.youtube.com/watch?v=KEofcwHRfCo",
      note: "The 5 mistakes that make 80% of A/B tests at startups wrong.",
    },
    {
      label: "Cohen's d effect size calculator",
      url: "https://www.youtube.com/watch?v=IetVPNQrjF4",
      note: "Effect size matters MORE than p-value. A tiny effect can still be statistically significant on a huge sample.",
    },
  ],
  18: [
    {
      label: "Funnel chart in Excel - Leila Gharani",
      url: "https://www.youtube.com/watch?v=fGjE2_aaJWk",
      note: "Build the conversion funnel chart for the Olist deliveries. 5 minutes.",
    },
    {
      label: "How to write a 1-page memo executives actually read - HBS",
      url: "https://www.youtube.com/watch?v=Hfx1X9WSGYQ",
      note: "Re-watch from W8. Same Pyramid Principle, applied to marketing this time.",
    },
    {
      label: "Excel dashboard from scratch - Leila Gharani",
      url: "https://www.youtube.com/watch?v=opJgMj1IUrc",
      note: "Re-watch from W12. Apply to Olist - same dashboard pattern, different data.",
    },
    {
      label: "Pitching to executives - Y Combinator",
      url: "https://www.youtube.com/watch?v=24vrhcZraQs",
      note: "How to compress 50 hours of work into a 5-minute pitch. YC's playbook.",
    },
  ],
  19: [
    {
      label: "Kaggle Notebooks tutorial - how to publish your work",
      url: "https://www.youtube.com/watch?v=DSZ6UMI5BiE",
      note: "How to turn your Olist analysis into a public Kaggle notebook for reach.",
    },
    {
      label: "Posting on r/marketing - what works",
      url: "https://www.reddit.com/r/marketing/wiki/index/",
      note: "The community rules and what kind of posts get upvoted. Read before posting.",
    },
    {
      label: "How to write a project blog post - Tina Huang",
      url: "https://www.youtube.com/watch?v=byNlhPOIVB0",
      note: "Re-watch. Same template for Medium/Dev.to. 1500 words is the sweet spot.",
    },
  ],
  20: [
    {
      label: "Tableau Public Full Course - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=jSdLLnRHE_4",
      note: "1.5 hours. The most-watched free Tableau course. Install Tableau Public first (download.tableau.com/products/public).",
    },
    {
      label: "Tableau Public download (free)",
      url: "https://public.tableau.com/en-us/s/download",
      note: "Free forever. Different from Tableau Desktop (paid).",
    },
    {
      label: "Tableau Filters and Parameters - Andy Kriebel",
      url: "https://www.youtube.com/watch?v=8Q-K6q4lqAA",
      note: "Parameters let users pick a year/region. Essential for interactive dashboards.",
    },
    {
      label: "Tableau Stories tutorial",
      url: "https://www.youtube.com/watch?v=ZQTbfNLPSh8",
      note: "Stories let you walk a viewer through multiple dashboards in sequence. Great for presentations.",
    },
    {
      label: "Publish to Tableau Public step-by-step",
      url: "https://www.youtube.com/watch?v=lUmRPsxRJzQ",
      note: "Free hosting. Your dashboard gets a public URL you can share.",
    },
  ],
  21: [
    {
      label: "dbt for Beginners - Full Course by Coalesce",
      url: "https://www.youtube.com/watch?v=jpAp7Tt_VtY",
      note: "2 hours. dbt is the new standard for SQL transformations. Most-watched free dbt intro.",
    },
    {
      label: "BigQuery for Beginners - Google Cloud Tech",
      url: "https://www.youtube.com/watch?v=eIec0RFTFxg",
      note: "Google's official 30-min walkthrough. Free tier is 1 TB/month queries.",
    },
    {
      label: "Google Cloud Free Tier setup",
      url: "https://www.youtube.com/watch?v=7BCsK1Ke3R8",
      note: "How to create a GCP account without getting charged. Card required but no charge if you stay in free tier.",
    },
    {
      label: "dbt-bigquery setup guide",
      url: "https://www.youtube.com/watch?v=jpAp7Tt_VtY",
      note: "Same Coalesce course - skip to the 'connect dbt to BigQuery' section if you only need that part.",
    },
    {
      label: "Modern Data Stack explained - Tristan Handy (CEO of dbt Labs)",
      url: "https://www.youtube.com/watch?v=hUWUlSRJpw0",
      note: "Industry context. Why dbt + BigQuery + Fivetran is replacing old ETL.",
    },
  ],
  22: [
    {
      label: "How to scope a data project - StrataScratch",
      url: "https://www.youtube.com/watch?v=mGZsNNvJTLM",
      note: "How real teams scope projects: problem statement, success metrics, timeline.",
    },
    {
      label: "Power BI vs Excel vs Tableau - which to use - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=AGrl-H87pRU",
      note: "Pick your tool for the capstone. This week's choice locks in the next 4.",
    },
    {
      label: "How to design a multi-page dashboard - Microsoft Power BI team",
      url: "https://www.youtube.com/watch?v=2tBjvHFsxYI",
      note: "Information hierarchy: overview first, drill-down second, raw data last.",
    },
    {
      label: "Star schema vs snowflake schema - Kimball Group",
      url: "https://www.youtube.com/watch?v=PSqGKx0L0n8",
      note: "How to model your data so a dashboard is fast. Star schema almost always wins.",
    },
  ],
  23: [
    {
      label: "Excel Dashboard with slicers and timelines - Leila Gharani",
      url: "https://www.youtube.com/watch?v=opJgMj1IUrc",
      note: "Re-watch the Excel dashboard masterclass from W12.",
    },
    {
      label: "Power BI multi-page dashboard - Microsoft",
      url: "https://www.youtube.com/watch?v=2tBjvHFsxYI",
      note: "How to link filters across pages so clicking 'West' on page 1 propagates to page 2.",
    },
    {
      label: "Conditional formatting for KPIs - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=oa-iZCWMJVk",
      note: "Red/yellow/green on KPI tiles. Helps executives spot problems instantly.",
    },
    {
      label: "Micro-trend sparklines in Excel/Power BI",
      url: "https://www.youtube.com/watch?v=DkgsB8wlQYI",
      note: "Tiny inline charts inside a KPI tile. Looks pro, takes 10 minutes.",
    },
  ],
  24: [
    {
      label: "Drill-through dashboards - Power BI tutorial",
      url: "https://www.youtube.com/watch?v=zQ7QFm-cgX0",
      note: "Click a customer name on page 3, jump to a customer detail page with their full history.",
    },
    {
      label: "Alerts and what-if scenarios in dashboards - Microsoft",
      url: "https://www.youtube.com/watch?v=lz1ts2W0jBg",
      note: "How to add 'flag if below target' alerts to your operations page.",
    },
    {
      label: "Print-ready dashboard layout best practices",
      url: "https://www.youtube.com/watch?v=h2JINF4Ka1c",
      note: "How to make a dashboard that exports to a clean 1-page PDF.",
    },
    {
      label: "Dashboard branding and typography - Cole Knaflic",
      url: "https://www.youtube.com/watch?v=8EMW7io4rSI",
      note: "Re-watch from W8. Apply consistent fonts, colors, logo to your capstone.",
    },
  ],
  25: [
    {
      label: "Storytelling with Data - Cole Knaflic full talk",
      url: "https://www.youtube.com/watch?v=8EMW7io4rSI",
      note: "20 min. Most-referenced data storytelling talk. Re-watch and take notes this time.",
    },
    {
      label: "Steve Jobs presentation analysis - Nancy Duarte",
      url: "https://www.youtube.com/watch?v=1nYFpuc2Umk",
      note: "How master presenters structure every talk. Apply to your capstone pitch.",
    },
    {
      label: "Speaker notes - the right way to write them",
      url: "https://www.youtube.com/watch?v=BcgM1ZJTfCQ",
      note: "30-second beats per slide. What to say, what to skip.",
    },
    {
      label: "Self-tape your presentation - how to look natural on camera",
      url: "https://www.youtube.com/watch?v=Mh9zddNCSlk",
      note: "Sit upright. Eye-level camera. Soft front light. 10 minutes of setup matters.",
    },
  ],
  26: [
    {
      label: "How to write a CEO memo - HBR",
      url: "https://www.youtube.com/watch?v=Hfx1X9WSGYQ",
      note: "Re-watch from W8. Apply the Pyramid Principle to your capstone.",
    },
    {
      label: "Demo video best practices - Loom team",
      url: "https://www.youtube.com/watch?v=qFqr_dDjpkE",
      note: "Script first, record in 1 take, no editing. 3 minutes is the sweet spot.",
    },
    {
      label: "How to ask 3 people for project feedback - Tina Huang",
      url: "https://www.youtube.com/watch?v=tbBl5JcoYqU",
      note: "Re-watch. The DMs that get responses vs the ones that get ignored.",
    },
    {
      label: "Job application playbook for analysts - Luke Barousse",
      url: "https://www.youtube.com/watch?v=byNlhPOIVB0",
      note: "Where to find roles, how to tailor your resume, what to say in the cover letter.",
    },
  ],
  27: [
    {
      label: "Build a free portfolio site - Vercel + Next.js in 30 min",
      url: "https://www.youtube.com/watch?v=mTz0GXj8NN0",
      note: "If you can write a README you can deploy this. Free domain.",
    },
    {
      label: "GitHub Pages portfolio in 10 minutes",
      url: "https://www.youtube.com/watch?v=2MsN8gpT6jY",
      note: "Even simpler. Just HTML + CSS. Your username.github.io.",
    },
    {
      label: "LinkedIn profile optimization for analysts - Tina Huang",
      url: "https://www.youtube.com/watch?v=pndb5lr8jJI",
      note: "What to put in your About section, what keywords to use, how to get views.",
    },
    {
      label: "GitHub profile README - how to make it shine",
      url: "https://www.youtube.com/watch?v=ECuqb5Tv9qI",
      note: "The README.md that auto-appears on your GitHub profile. Recruiters check this first.",
    },
    {
      label: "Analyst interview questions you WILL be asked - StrataScratch",
      url: "https://www.youtube.com/watch?v=mGZsNNvJTLM",
      note: "30 most-asked SQL + Excel + behavioral questions. Drill until automatic.",
    },
    {
      label: "How to network on LinkedIn without being annoying - Tina Huang",
      url: "https://www.youtube.com/watch?v=tbBl5JcoYqU",
      note: "Real DM templates. The ones that actually get responses.",
    },
  ],
};

// =====================================================================
// DATA SCIENCE - 31 weeks
// =====================================================================
const DS = {
  1: [
    PREREQ.githubAccount,
    PREREQ.installAnaconda,
    {
      label: "What is Data Science? - Joma Tech (5 min, honest take)",
      url: "https://www.youtube.com/watch?v=xC-c7E5PK0Y",
      note: "A real DS at FAANG explains what the job is and is not. Honest, funny, true.",
    },
    {
      label: "Python for Data Science - Full Course by freeCodeCamp",
      url: "https://www.youtube.com/watch?v=LHBE6Q9XlzI",
      note: "12 hours. Skip the sections you know. Sections 3-6 (NumPy, pandas, matplotlib) are essential for this week.",
    },
    {
      label: "Pandas for Beginners - Keith Galli real-world walkthrough",
      url: "https://www.youtube.com/watch?v=vmEHCJofslg",
      note: "1 hour. Cleans messy data, groupby, plotting. Use this as the template for your NYC taxi notebook.",
    },
    {
      label: "NYC TLC Yellow Taxi data - October 2023 parquet",
      url: "https://www1.nyc.gov/site/tlc/about/tlc-trip-record-data.page",
      note: "Direct from NYC government. Look for 'Yellow Taxi Trip Records' and the 2023-10 parquet link.",
    },
    {
      label: "Jupyter Notebook tips and shortcuts - Corey Schafer",
      url: "https://www.youtube.com/watch?v=HW29067qVWk",
      note: "20 min. Keyboard shortcuts make you 3x faster. Markdown cells, magic commands.",
    },
    PREREQ.pushToGithub,
    PREREQ.writeReadme,
  ],
  2: [
    {
      label: "Essence of Linear Algebra - 3Blue1Brown full series",
      url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
      note: "12 short videos, ~3 hours total. The most-loved math series ever made. Watch chapters 1-5 minimum.",
    },
    {
      label: "Essence of Calculus - 3Blue1Brown",
      url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr",
      note: "Watch the first 3 episodes only. Just enough for gradient descent intuition.",
    },
    {
      label: "Bayes Theorem explained - 3Blue1Brown",
      url: "https://www.youtube.com/watch?v=HZGCoVF3YvM",
      note: "The clearest 15-minute explanation of Bayes you will ever find.",
    },
    {
      label: "Linear Regression by hand - StatQuest",
      url: "https://www.youtube.com/watch?v=nk2CQITm_eo",
      note: "Derives the equations with no jargon. Watch BEFORE you implement linear regression.",
    },
    {
      label: "Gradient Descent intuition - StatQuest",
      url: "https://www.youtube.com/watch?v=sDv4f4s2SB8",
      note: "Why we walk downhill. Why learning rate matters. Why it can get stuck.",
    },
    {
      label: "NumPy in 30 minutes - freeCodeCamp",
      url: "https://www.youtube.com/watch?v=QUT1VHiLmmI",
      note: "The library underneath pandas. Vectors and matrices in code.",
    },
  ],
  3: [
    {
      label: "Pandas merge / join - Corey Schafer",
      url: "https://www.youtube.com/watch?v=iYWKfUOtGaw",
      note: "Merging the zone lookup CSV into your trips. The 4 join types with examples.",
    },
    {
      label: "TLC Taxi Zone Lookup CSV (direct download)",
      url: "https://d37ci6vzurychx.cloudfront.net/misc/taxi+_zone_lookup.csv",
      note: "Maps PULocationID/DOLocationID to borough names. This is the file you merge.",
    },
    {
      label: "Pandas concat for multi-file datasets",
      url: "https://www.youtube.com/watch?v=hUbnyKtw5n8",
      note: "How to stack Sept + Oct + Nov parquets into one dataframe. 10 minutes.",
    },
    {
      label: "Seaborn heatmaps tutorial - Data School",
      url: "https://www.youtube.com/watch?v=cFFTDXcESxA",
      note: "Hour × day-of-week heatmap. Cleaner than matplotlib for grids.",
    },
    {
      label: "How to work with parquet files in pandas",
      url: "https://www.youtube.com/watch?v=fyxoTeqyvyU",
      note: "Parquet is 10x smaller and 10x faster than CSV for big data. Why and how.",
    },
  ],
  4: [
    {
      label: "SQL Tutorial Full Course - Mike Dane (freeCodeCamp)",
      url: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
      note: "4 hours. Watch the first 2 hours minimum: SELECT, WHERE, JOIN, GROUP BY.",
    },
    {
      label: "SQL Window Functions - Alex The Analyst",
      url: "https://www.youtube.com/watch?v=Ww71knvhQ-s",
      note: "Top-N per group, running totals, rankings. Window functions are the lever for analyst interviews.",
    },
    {
      label: "SQL CTEs (WITH clauses) explained",
      url: "https://www.youtube.com/watch?v=K1WeoKxLZ5o",
      note: "Multi-step queries that are readable instead of nested-subquery hell.",
    },
    {
      label: "BigQuery free public NYC TLC dataset",
      url: "https://www.youtube.com/watch?v=eIec0RFTFxg",
      note: "If you want to query 30M+ rows for free, BigQuery has the NYC TLC data already loaded. 1 TB/month free.",
    },
    {
      label: "SQLite Online - browser SQL with zero install",
      url: "https://sqliteonline.com/",
      note: "Bookmark. Import your TaxiPulse CSV, run queries instantly.",
    },
  ],
  5: [
    {
      label: "Linear Regression in Python with scikit-learn - StatQuest",
      url: "https://www.youtube.com/watch?v=nk2CQITm_eo",
      note: "Re-watch from W2. This week you actually code it.",
    },
    {
      label: "XGBoost Explained - StatQuest",
      url: "https://www.youtube.com/watch?v=OtD8wVaFm6E",
      note: "The model that wins most Kaggle competitions. Watch this BEFORE training one.",
    },
    {
      label: "Feature Engineering for ML - Krish Naik",
      url: "https://www.youtube.com/watch?v=6WDFfaYtN6s",
      note: "Picking the right features matters more than picking the right model.",
    },
    {
      label: "Residual plots - what they tell you - StatQuest",
      url: "https://www.youtube.com/watch?v=lqKvE6E9XAY",
      note: "Residuals show where your model is failing. Look at the pattern, not just the metric.",
    },
    {
      label: "scikit-learn LinearRegression docs (reference)",
      url: "https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html",
      note: "API reference. Use after you watch the StatQuest video.",
    },
  ],
  6: [
    {
      label: "Hypothesis Testing - StatQuest",
      url: "https://www.youtube.com/watch?v=0oc49DyA3hU",
      note: "Null vs alternative, p-values, significance levels. Foundation video. 15 min.",
    },
    {
      label: "t-tests, ANOVA, chi-square - StatQuest playlist",
      url: "https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9",
      note: "Pick the videos for the tests you use this week. Each is 10-15 minutes.",
    },
    {
      label: "Confidence Intervals - StatQuest",
      url: "https://www.youtube.com/watch?v=TqOeMYtOc1w",
      note: "What 95% CI actually means (not what most people think it means).",
    },
    {
      label: "Bootstrap method - StatQuest",
      url: "https://www.youtube.com/watch?v=Xz0x-8-cgaQ",
      note: "How to compute CIs when your distribution is weird. Resample 1000 times.",
    },
    {
      label: "Multiple testing correction (Bonferroni) - StatQuest",
      url: "https://www.youtube.com/watch?v=K8LQSvtjcEo",
      note: "Run 10 tests, expect 1 false positive. This is the math fix.",
    },
  ],
  7: [
    {
      label: "Flask in 30 minutes - Corey Schafer",
      url: "https://www.youtube.com/watch?v=MwZwr5Tvyxo",
      note: "Skip to the routes section. You only need /predict and /health for this week.",
    },
    {
      label: "Save and load ML models with joblib",
      url: "https://www.youtube.com/watch?v=KfnhNlD8WZI",
      note: "joblib > pickle for sklearn models. 5 minutes of code.",
    },
    {
      label: "Deploy Flask to Render - free hosting tutorial",
      url: "https://www.youtube.com/watch?v=Y3T6m_5UE_M",
      note: "Render is the easiest free Flask host since Heroku killed its free tier. 10 minutes start-to-deployed.",
    },
    {
      label: "Render free tier signup",
      url: "https://render.com/",
      note: "Click 'Get Started Free'. GitHub login. No card required.",
    },
    {
      label: "gunicorn vs Flask dev server - what to use in production",
      url: "https://www.youtube.com/watch?v=KDPPiNh8tHA",
      note: "Why you never deploy Flask's dev server. 5 minutes.",
    },
    {
      label: "curl command basics for testing APIs",
      url: "https://www.youtube.com/watch?v=7XUibDYw4mc",
      note: "How to hit your /predict endpoint from the terminal.",
    },
  ],
  8: [
    {
      label: "Web Scraping with Python and BeautifulSoup - freeCodeCamp",
      url: "https://www.youtube.com/watch?v=XVv6mJpFOb0",
      note: "1.5 hours. Most-watched free BS4 course. Pause at 30 min and start scraping.",
    },
    {
      label: "Scrapy vs BeautifulSoup - when to use which",
      url: "https://www.youtube.com/watch?v=ALizgnSFTwQ",
      note: "BS4 for small jobs, Scrapy for big crawls. This explains why.",
    },
    {
      label: "Hugging Face pipeline tutorial - sentiment in 5 lines",
      url: "https://www.youtube.com/watch?v=GSt00_-0ncQ",
      note: "Pretrained sentiment classification with 5 lines of code. Use on your scraped HN titles.",
    },
    {
      label: "robots.txt explained - why scrapers must respect it",
      url: "https://www.youtube.com/watch?v=u3iN2lXFAk0",
      note: "10 minutes. Required watching before scraping anything.",
    },
    {
      label: "Rate limiting in Python requests - time.sleep tutorial",
      url: "https://www.youtube.com/watch?v=7H6mTOFkSjQ",
      note: "1 second between requests is the floor. Less and you risk a ban.",
    },
  ],
  9: [
    {
      label: "Streamlit in 30 minutes - Misra Turp",
      url: "https://www.youtube.com/watch?v=ZZ4B0QUHuNc",
      note: "Streamlit turns a Python script into a web app in 10 lines. This is the fastest intro.",
    },
    {
      label: "Streamlit sidebar widgets tutorial",
      url: "https://www.youtube.com/watch?v=2siBrMsqF44",
      note: "How to build the 4 controls (borough, hour, day, cap) in the sidebar.",
    },
    {
      label: "Streamlit caching with @st.cache_data",
      url: "https://www.youtube.com/watch?v=lYDiSCDcxmc",
      note: "Without caching your app re-loads the parquet on every interaction (slow). With caching it loads once.",
    },
    {
      label: "Deploy Streamlit to Streamlit Cloud - free hosting",
      url: "https://www.youtube.com/watch?v=HKoOBiAaHGg",
      note: "Free. Connect your GitHub, paste the repo URL, app is live in 2 minutes.",
    },
    {
      label: "Loading saved ML models in Streamlit",
      url: "https://www.youtube.com/watch?v=M1uyH-DzjGE",
      note: "Wire your joblib-saved fare model into the Streamlit sidebar inputs.",
    },
  ],
  10: [
    {
      label: "How to write technical blog posts that get read - Tina Huang",
      url: "https://www.youtube.com/watch?v=byNlhPOIVB0",
      note: "Structure, hook, length. The 7 things that determine if anyone clicks.",
    },
    {
      label: "Profiling Python code with cProfile - Real Python",
      url: "https://www.youtube.com/watch?v=qiZyDLEJHh0",
      note: "Find the slow cells in your notebook. Optimize the 20% causing 80% of the time.",
    },
    {
      label: "How to ask strangers for project feedback - Tina Huang",
      url: "https://www.youtube.com/watch?v=tbBl5JcoYqU",
      note: "The DMs that get answered.",
    },
    {
      label: "Medium vs Dev.to vs Hashnode - where to post",
      url: "https://www.youtube.com/watch?v=L2u2QKlcUgU",
      note: "Dev.to is the highest-reach free option for technical posts. Cross-post to Medium.",
    },
  ],
  11: [
    {
      label: "Cursor in 15 minutes - the AI code editor",
      url: "https://www.youtube.com/watch?v=ds9oxBkSEPE",
      note: "Free tier available. Built on VS Code. The default code editor for AI-augmented work.",
    },
    {
      label: "Prompt Engineering Crash Course - Andrew Ng (DeepLearning.AI)",
      url: "https://www.youtube.com/watch?v=_ZvnD73m40o",
      note: "1.5 hours. The 4 prompt patterns that work most reliably.",
    },
    {
      label: "ChatGPT for SQL generation - real workflow",
      url: "https://www.youtube.com/watch?v=Y9JzjcJ7LRM",
      note: "Specific tactics for getting SQL that runs first try.",
    },
    {
      label: "When NOT to trust AI - hallucinations explained",
      url: "https://www.youtube.com/watch?v=GdJOA4XHpZ4",
      note: "AI invents column names, fabricates citations. Always sanity-check.",
    },
    {
      label: "Cursor download (free tier)",
      url: "https://cursor.sh/",
      note: "Click Download. Sign in with GitHub. 2000 free completions/month.",
    },
  ],
  12: [
    {
      label: "Reddit API tutorial with PRAW - Python Engineer",
      url: "https://www.youtube.com/watch?v=NRgfgtzIhBQ",
      note: "20 minutes. PRAW is the Python wrapper for Reddit's API. The fastest way to scrape Reddit.",
    },
    {
      label: "Get Reddit API credentials in 3 minutes",
      url: "https://www.youtube.com/watch?v=oUuBxqsBaOY",
      note: "How to create a Reddit app and get your client_id + secret. Free.",
    },
    {
      label: "Hugging Face pipelines for sentiment - quickstart",
      url: "https://www.youtube.com/watch?v=GSt00_-0ncQ",
      note: "5 lines of code to tag 1000 posts. distilbert-base-uncased-finetuned-sst-2-english is the default.",
    },
    {
      label: "Pandas to_csv and from_csv best practices",
      url: "https://www.youtube.com/watch?v=ELyx0wH7p8E",
      note: "Save labeled.csv with the right encoding. Avoid Unicode hell later.",
    },
  ],
  13: [
    {
      label: "TF-IDF explained - StatQuest",
      url: "https://www.youtube.com/watch?v=hgjzHCPxxV8",
      note: "Why we weight rare words higher than common ones. Foundation video.",
    },
    {
      label: "Logistic Regression for Text Classification - StatQuest",
      url: "https://www.youtube.com/watch?v=yIYKR4sgzI8",
      note: "Why logreg works on TF-IDF features. 20 min.",
    },
    {
      label: "Naive Bayes for text - StatQuest",
      url: "https://www.youtube.com/watch?v=O2L2Uv9pdDA",
      note: "The classic baseline for text classification. Often beats fancier models.",
    },
    {
      label: "Confusion Matrix explained - StatQuest",
      url: "https://www.youtube.com/watch?v=Kdsp6soqA7o",
      note: "TP, FP, FN, TN. The 4 numbers every classifier output gives you.",
    },
    {
      label: "sklearn TF-IDF vectorizer - Corey Schafer",
      url: "https://www.youtube.com/watch?v=R7YDoUf-VkA",
      note: "Vectorize text in 5 lines. Then feed into LogisticRegression.",
    },
  ],
  14: [
    {
      label: "A/B Testing for ML systems - LinkedIn Engineering",
      url: "https://www.youtube.com/watch?v=zT4kVk8O28U",
      note: "How real teams test prompts and models. The specific pitfalls.",
    },
    {
      label: "Sample size calculator - Evan Miller",
      url: "https://www.evanmiller.org/ab-testing/sample-size.html",
      note: "Bookmark. Plug in baseline accuracy + MDE, get N.",
    },
    {
      label: "Cohen's d effect size - StatQuest",
      url: "https://www.youtube.com/watch?v=IetVPNQrjF4",
      note: "Why effect size matters more than p-value. Required watching.",
    },
    {
      label: "Random seeds and reproducibility - Real Python",
      url: "https://www.youtube.com/watch?v=KzqSDvzOFNA",
      note: "np.random.seed(42). Why every notebook needs it.",
    },
  ],
  15: [
    {
      label: "Fine-tuning BERT explained - HuggingFace tutorial",
      url: "https://www.youtube.com/watch?v=GSt00_-0ncQ",
      note: "Step-by-step Colab notebook walkthrough.",
    },
    {
      label: "Google Colab for ML - intro tutorial",
      url: "https://www.youtube.com/watch?v=inN8seMm7UI",
      note: "Free T4 GPU. Change Runtime > Hardware accelerator > T4 GPU. Save your notebook to Drive.",
    },
    {
      label: "DistilBERT vs BERT - what is distilled",
      url: "https://www.youtube.com/watch?v=t45S_MwAcOw",
      note: "DistilBERT is 60% the size, 95% the performance. The right model for a small project.",
    },
    {
      label: "Git LFS tutorial - tracking large files",
      url: "https://www.youtube.com/watch?v=xPFLAAhuGy0",
      note: "Models > 100 MB need LFS. 10-min setup.",
    },
    {
      label: "Learning rate sweeps explained - Andrej Karpathy",
      url: "https://www.youtube.com/watch?v=P6sfmUTpUmc",
      note: "Why 1e-5 vs 2e-5 vs 5e-5 matters. From the OpenAI / Tesla DS lead.",
    },
  ],
  16: [
    {
      label: "SHAP values explained - StatQuest",
      url: "https://www.youtube.com/watch?v=L8_sVRhBDLU",
      note: "20 min. Why we use Shapley values to explain model predictions.",
    },
    {
      label: "SHAP TreeExplainer tutorial - notebook walkthrough",
      url: "https://www.youtube.com/watch?v=VB9uV-x0gtg",
      note: "For tree-based models (XGBoost, RandomForest). Fast and exact.",
    },
    {
      label: "SHAP LinearExplainer for logistic regression",
      url: "https://www.youtube.com/watch?v=8C0LO51hF6M",
      note: "For your TFIDF + LogReg baseline. Different explainer for different model class.",
    },
    {
      label: "Model bias - examples and how to spot them - Cassie Kozyrkov",
      url: "https://www.youtube.com/watch?v=B5MgVrXapnk",
      note: "How real models go biased. Find at least one in your own work.",
    },
  ],
  17: [
    {
      label: "Faker library tutorial - generate test data",
      url: "https://www.youtube.com/watch?v=6jHZ4F-MAd4",
      note: "Names, addresses, fake transactions. 10 minutes.",
    },
    {
      label: "SMOTE for imbalanced data - StatQuest",
      url: "https://www.youtube.com/watch?v=u-Dl1d-VuVw",
      note: "Why upsampling minority class helps (sometimes) and when it hurts (often).",
    },
    {
      label: "When synthetic data backfires - DeepLearning.AI talk",
      url: "https://www.youtube.com/watch?v=Vd5VEr_8Yks",
      note: "Real cases where synth data made models worse. Required watching.",
    },
    {
      label: "CTGAN for tabular data synthesis - tutorial",
      url: "https://www.youtube.com/watch?v=BHwTfHsxhMY",
      note: "Advanced. Generate fake transactions with realistic correlations.",
    },
  ],
  18: [
    {
      label: "Streamlit dashboard - real-time refresh tutorial",
      url: "https://www.youtube.com/watch?v=ZZ4B0QUHuNc",
      note: "Re-watch from W9. Apply to Reddit sentiment dashboard.",
    },
    {
      label: "Streamlit deployment - GitHub to live URL in 2 minutes",
      url: "https://www.youtube.com/watch?v=HKoOBiAaHGg",
      note: "Re-watch from W9. Same flow, different app.",
    },
    {
      label: "Heatmap visualizations in Streamlit",
      url: "https://www.youtube.com/watch?v=cFFTDXcESxA",
      note: "Hour-by-day sentiment heatmap. Plotly express in 5 lines.",
    },
    {
      label: "Streamlit cache_resource vs cache_data - what is the difference",
      url: "https://www.youtube.com/watch?v=lYDiSCDcxmc",
      note: "Use @st.cache_resource for the model load (it is not picklable).",
    },
  ],
  19: [
    {
      label: "FastAPI in 30 minutes - Patrick Loeber",
      url: "https://www.youtube.com/watch?v=tLKKmouUams",
      note: "FastAPI is faster, modern, with auto-generated docs. Default for new APIs.",
    },
    {
      label: "Docker for Python apps - Patrick Loeber",
      url: "https://www.youtube.com/watch?v=bi0cKgmRuiA",
      note: "Dockerfile + docker build + docker run. 20 minutes.",
    },
    {
      label: "Hugging Face Spaces deployment - free hosting",
      url: "https://www.youtube.com/watch?v=4n5g_-aHi8I",
      note: "HF Spaces hosts your Docker image FREE. Streamlit, Gradio, or Docker.",
    },
    {
      label: "JWT auth in FastAPI - tutorial",
      url: "https://www.youtube.com/watch?v=5GxQ1rLTwaU",
      note: "How to protect your /predict endpoint behind a token.",
    },
    {
      label: "slowapi rate limiting tutorial",
      url: "https://www.youtube.com/watch?v=A6gTjOjkmRA",
      note: "Add @limiter.limit('5/minute') to prevent abuse.",
    },
  ],
  20: [
    {
      label: "Technical blog post writing - Tina Huang",
      url: "https://www.youtube.com/watch?v=byNlhPOIVB0",
      note: "1000-1500 word structure that works. Re-watch from W10.",
    },
    {
      label: "Loom screen recording - best practices",
      url: "https://www.youtube.com/watch?v=qFqr_dDjpkE",
      note: "Free for 25 videos. The standard for demo videos.",
    },
    {
      label: "How to cross-post to Medium without losing SEO",
      url: "https://www.youtube.com/watch?v=L2u2QKlcUgU",
      note: "Use canonical link to your original. Reach without penalty.",
    },
    {
      label: "BibTeX citations for projects - quick reference",
      url: "https://www.bibtex.com/format/",
      note: "Add a 'cite as' snippet to your README. Researchers love this.",
    },
  ],
  21: [
    {
      label: "Time Series Analysis Full Course - Krish Naik",
      url: "https://www.youtube.com/watch?v=GE3JOFwTWVM",
      note: "2 hours. The most-watched free TS course. Cover trend / seasonality / decomposition.",
    },
    {
      label: "AEP Hourly Energy Consumption dataset on Kaggle",
      url: "https://www.kaggle.com/datasets/robikscube/hourly-energy-consumption",
      note: "Direct download. 145k+ hourly readings across 10+ years.",
    },
    {
      label: "Time Series Decomposition - StatQuest",
      url: "https://www.youtube.com/watch?v=0ar9extHObg",
      note: "Trend + seasonal + residual = signal. 15 minutes.",
    },
    {
      label: "Autocorrelation function (ACF) plots - Krish Naik",
      url: "https://www.youtube.com/watch?v=DeORzP0go5I",
      note: "How to read an ACF plot. Where the spikes are tells you the seasonality.",
    },
    {
      label: "Persistence baseline - the model you have to beat",
      url: "https://www.youtube.com/watch?v=u433nrxdf5k",
      note: "Predicting y_t = y_t-24. If your fancy model cannot beat this, your fancy model is broken.",
    },
  ],
  22: [
    {
      label: "ARIMA models explained - StatQuest",
      url: "https://www.youtube.com/watch?v=3UmyHed0iYE",
      note: "AR + I + MA in clear language. 20 minutes.",
    },
    {
      label: "auto_arima with pmdarima - tutorial",
      url: "https://www.youtube.com/watch?v=2XGSIlgUBDI",
      note: "Automatically picks p, d, q. Practical alternative to manual tuning.",
    },
    {
      label: "ADF stationarity test - Krish Naik",
      url: "https://www.youtube.com/watch?v=DeORzP0go5I",
      note: "Why differencing matters and how the ADF test tells you when to stop.",
    },
    {
      label: "SARIMAX with seasonality - tutorial",
      url: "https://www.youtube.com/watch?v=PCfQqmqfeS4",
      note: "When your data has weekly + yearly cycles, SARIMAX handles both.",
    },
    {
      label: "AIC vs AICc model selection - StatQuest",
      url: "https://www.youtube.com/watch?v=B7Y6BB1HwQI",
      note: "Lower is better. The math behind comparing model orders.",
    },
  ],
  23: [
    {
      label: "Facebook Prophet tutorial - Greg Hogg",
      url: "https://www.youtube.com/watch?v=KvLG1uTC-KU",
      note: "Prophet handles holidays + multiple seasonalities automatically. Built for business forecasting.",
    },
    {
      label: "Prophet docs - holidays and changepoints",
      url: "https://facebook.github.io/prophet/docs/seasonality,_holiday_effects,_and_regressors.html",
      note: "Reference. Use after the Greg Hogg video.",
    },
    {
      label: "Adding extra regressors to Prophet (temperature, etc)",
      url: "https://www.youtube.com/watch?v=tIfP9zoUbac",
      note: "How to add weather as a feature. NOAA has free historical weather data.",
    },
    {
      label: "NOAA historical weather data downloader",
      url: "https://www.ncei.noaa.gov/cdo-web/datatools/lcd",
      note: "Pick a station near AEP service territory. Free download.",
    },
  ],
  24: [
    {
      label: "PyTorch Tutorial - Full Course by Patrick Loeber",
      url: "https://www.youtube.com/watch?v=c36lUUr864M",
      note: "4 hours. The most-watched PyTorch intro. Skip to the LSTM section if you only have an hour.",
    },
    {
      label: "LSTM for Time Series in PyTorch - tutorial",
      url: "https://www.youtube.com/watch?v=AvKSPZ7oyVg",
      note: "Direct LSTM-for-forecasting walkthrough. Sliding windows, training loop, prediction.",
    },
    {
      label: "Why LSTMs? - StatQuest",
      url: "https://www.youtube.com/watch?v=YCzL96nL7j0",
      note: "The intuition. Why a vanilla RNN cannot remember long sequences.",
    },
    {
      label: "GRU vs LSTM - StatQuest",
      url: "https://www.youtube.com/watch?v=8HyCNIVRbSU",
      note: "GRU is simpler and often as good. The W24 exercise asks you to compare.",
    },
  ],
  25: [
    {
      label: "MLflow Tutorial - Krish Naik",
      url: "https://www.youtube.com/watch?v=qdcHHrsXA48",
      note: "1 hour. Track experiments, register models, compare runs. The standard MLOps tool.",
    },
    {
      label: "Evidently AI for drift detection - tutorial",
      url: "https://www.youtube.com/watch?v=2tt9ZE_iIWY",
      note: "Open-source drift reports. Compare two batches of data, get an HTML report.",
    },
    {
      label: "Model registry concepts - MLflow docs",
      url: "https://www.youtube.com/watch?v=ZbXEbgQVeqA",
      note: "Staging → Production → Archived. How to promote and roll back models.",
    },
    {
      label: "Slack webhook from Python - 5 min tutorial",
      url: "https://www.youtube.com/watch?v=6gHvqXrfjuo",
      note: "Send drift alerts to a Slack channel. Free webhook URL from Slack.",
    },
  ],
  26: [
    {
      label: "AWS Free Tier setup - safe limits walkthrough",
      url: "https://www.youtube.com/watch?v=WuMqXTQ4mEU",
      note: "How to set up AWS without surprise bills. Budget alerts are step 1.",
    },
    {
      label: "boto3 (AWS Python SDK) basics - tutorial",
      url: "https://www.youtube.com/watch?v=bIxBNXJ8YD8",
      note: "Upload to S3, download from S3, list buckets. Just enough for this week.",
    },
    {
      label: "BigQuery + Python tutorial - Google Cloud Tech",
      url: "https://www.youtube.com/watch?v=eIec0RFTFxg",
      note: "Run queries from Python. Use the public NYC TLC dataset for free.",
    },
    {
      label: "S3 cost optimization - 5 things to know",
      url: "https://www.youtube.com/watch?v=2zk1RNQJXcg",
      note: "Lifecycle rules, storage classes, the 'forgot a bucket exists' problem.",
    },
    {
      label: "s3fs - mount S3 as a filesystem in Python",
      url: "https://www.youtube.com/watch?v=l6T8svQ_uS8",
      note: "Treat S3 like a local folder. pandas.read_csv('s3://bucket/file.csv') just works.",
    },
  ],
  27: [
    {
      label: "Streamlit dashboard for forecasts - tutorial",
      url: "https://www.youtube.com/watch?v=ZZ4B0QUHuNc",
      note: "Re-watch from W9. Apply to energy forecast UI.",
    },
    {
      label: "Posting on Hacker News - what works",
      url: "https://www.youtube.com/watch?v=8nFI4OldOaQ",
      note: "Show HN posting rules + title patterns that get traction.",
    },
    {
      label: "How to write a 1000-word technical blog post - Tina Huang",
      url: "https://www.youtube.com/watch?v=byNlhPOIVB0",
      note: "Hook + 3 sections + takeaway. Same template, third time.",
    },
  ],
  28: [
    {
      label: "How to scope a capstone project - Andrew Ng",
      url: "https://www.youtube.com/watch?v=eg_E9hjlYP4",
      note: "The 4-step framework. Problem → data → metric → baseline.",
    },
    {
      label: "Picking a portfolio project - Luke Barousse",
      url: "https://www.youtube.com/watch?v=byNlhPOIVB0",
      note: "Real-world topic > toy dataset. Originality matters more than complexity.",
    },
    {
      label: "Writing a project SPEC.md - template walkthrough",
      url: "https://www.youtube.com/watch?v=A6cE_Q1eQyA",
      note: "Problem, scope, non-goals, success metric, timeline. 1 page.",
    },
    {
      label: "Pitching your project in 2 minutes - Y Combinator",
      url: "https://www.youtube.com/watch?v=24vrhcZraQs",
      note: "How YC startups pitch. Same pattern works for a portfolio project.",
    },
  ],
  29: [
    {
      label: "Baseline models you should always try first - StatQuest",
      url: "https://www.youtube.com/watch?v=nk2CQITm_eo",
      note: "Linear regression, mean prediction, persistence. Always benchmark against these.",
    },
    {
      label: "EDA for a new dataset - Keith Galli",
      url: "https://www.youtube.com/watch?v=eMOA1pPVUc4",
      note: "The first 30 minutes with a new dataset. What to look for, what to plot.",
    },
    {
      label: "Cross-validation explained - StatQuest",
      url: "https://www.youtube.com/watch?v=fSytzGwwBVw",
      note: "Why a single train/test split is risky. How K-fold fixes it.",
    },
    {
      label: "Why your model is worse than expected - debugging - Andrej Karpathy",
      url: "https://www.youtube.com/watch?v=zduSFxRajkE",
      note: "The 10 things you check before blaming your model.",
    },
  ],
  30: [
    {
      label: "How to deploy your capstone - Streamlit Cloud + HF Spaces options",
      url: "https://www.youtube.com/watch?v=HKoOBiAaHGg",
      note: "Pick the free host that matches your project type.",
    },
    {
      label: "Project blog post template - what to include",
      url: "https://www.youtube.com/watch?v=byNlhPOIVB0",
      note: "Re-watch. By now you have written 2 blog posts. The 3rd should be your best.",
    },
    {
      label: "Portfolio site templates - Next.js + Tailwind",
      url: "https://www.youtube.com/watch?v=mTz0GXj8NN0",
      note: "Free portfolio in 30 minutes. Vercel hosting included.",
    },
    {
      label: "Getting feedback from working DSs on LinkedIn - Tina Huang",
      url: "https://www.youtube.com/watch?v=tbBl5JcoYqU",
      note: "The right way to slide into a senior DS's DMs.",
    },
  ],
  31: [
    {
      label: "DS Interview Prep - StrataScratch full course",
      url: "https://www.youtube.com/watch?v=mGZsNNvJTLM",
      note: "Most-asked DS interview questions across SQL, stats, ML, behavioral.",
    },
    {
      label: "Behavioral interviews - the STAR method - Jeff Su",
      url: "https://www.youtube.com/watch?v=8QYJ7lI2VEs",
      note: "Situation → Task → Action → Result. The structure FAANG interviewers expect.",
    },
    {
      label: "ML System Design Interview prep - Alex Xu",
      url: "https://www.youtube.com/watch?v=DSGsa0pu8-k",
      note: "How to whiteboard an ML system in 45 minutes. Senior DS interviews focus here.",
    },
    {
      label: "LinkedIn profile for DS - Tina Huang",
      url: "https://www.youtube.com/watch?v=pndb5lr8jJI",
      note: "Headline, About, Featured. The 3 sections recruiters read.",
    },
    {
      label: "GitHub profile README for DS",
      url: "https://www.youtube.com/watch?v=ECuqb5Tv9qI",
      note: "Pinned repos + a stylish profile README. First impression for any recruiter.",
    },
    {
      label: "Negotiating your first DS offer - Levels.fyi",
      url: "https://www.youtube.com/watch?v=KCu7gQQ4yEs",
      note: "The numbers nobody tells you. Know your range before the call.",
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
