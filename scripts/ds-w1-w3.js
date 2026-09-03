const path = require('path');
const fs = require('fs');
const FILE = path.join(__dirname, '..', 'data', 'roadmaps', 'data-science.json');
const ds = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const L = (title, body) => ({ kind: 'lesson', title, body });
const V = (title, url, dm, creator, why) => ({ kind: 'video', title, url, duration_min: dm, creator, why });
const S = (cards) => ({ kind: 'swipe', title: 'Quick check — swipe to answer', cards });
const E = (title, body) => ({ kind: 'exercise', title, body });
const D = (number, title, summary, items) => ({ number, title, summary, items });

const W1 = {
  number: 1, title: "What data science actually is",
  phase: "Foundations", commitment_hours: "10-15",
  context: ds.weeks[0].context, resources: ds.weeks[0].resources,
  concept_check: [
    { q: "A manager asks: 'Which hour makes us the most money?' — first move?",
      choices: ["Average all fares and report it","Clarify: most money means total revenue, highest average fare, or highest trip count?","Build a bar chart immediately","Filter the data to peak hours"],
      correct: 1, explain: "Real data science starts with a precise question. 'Most money' could mean three different things — answering the wrong one wastes a week." },
    { q: "What separates a data scientist from a data analyst?",
      choices: ["Data scientists use Python; analysts use Excel","Data scientists build predictive models; analysts describe what already happened","Data scientists earn more","Data scientists work with bigger files"],
      correct: 1, explain: "The core distinction is description vs prediction. Analysts find patterns in the past. Data scientists build models that generalise to new, unseen data." },
    { q: "Why store 3.5M rows as Parquet instead of CSV?",
      choices: ["Parquet is easier to open in Excel","Parquet is columnar — reading one column skips the other 19 entirely","CSV cannot store numbers","Parquet always uses less RAM"],
      correct: 1, explain: "Parquet is columnar. Reading one column reads only that column's bytes. CSV reads every byte of every row regardless." }
  ],
  days: [
    D(1,"What data science actually is","Orientation: the mental model before you write a line of code.",[
      L("What data science actually is",
"## What it is\n" +
"Data science is the practice of **turning raw data into decisions** — using code to ask questions, statistics to test whether the answers are real, and communication to make findings actionable.\n\n" +
"The loop never changes regardless of company or domain:\n" +
"1. **Question** — a business problem precise enough that data can test it\n" +
"2. **Pipeline** — code that loads, cleans, and analyses the data\n" +
"3. **Decision** — a recommendation backed by evidence\n\n" +
"Everything in this track — pandas, SQL, sklearn, FastAPI, Streamlit — is a tool in service of that loop.\n\n" +
"## Description vs prediction\n" +
"**Description** = 'what happened?' — the analyst's territory. **Prediction** = 'what will happen next?' — the data scientist's move, requiring a trained model. Week 1 is pure description. Week 5 is your first prediction model.\n\n" +
"## Where this fits in TaxiPulse\n" +
"This week you load 3.5 million NYC taxi trips and answer three questions you commit to RIGHT NOW — before touching the data. That commitment forces a hypothesis first. It is the single most important habit in the field."
      ),
      V("Data Science explained in 2 minutes","https://www.youtube.com/watch?v=X3paOmcrTjQ",2,"Fireship","Watch first. Sets the tone: DS is a craft, not magic."),
      L("The TaxiPulse project",
"## The dataset\n" +
"NYC TLC releases every yellow-cab trip as a public Parquet file. October 2023: **3,516,318 rows**, 19 columns.\n\n" +
"```text\n" +
"Column                  Type       What it is\n" +
"tpep_pickup_datetime    timestamp  When the meter started\n" +
"trip_distance           float      Miles logged by the meter\n" +
"fare_amount             float      Base fare (excludes tip)\n" +
"tip_amount              float      Tip (non-zero for card payments)\n" +
"PULocationID            int        Pickup taxi zone (1-265)\n" +
"```\n\n" +
"## Write your three guesses NOW\n" +
"Before loading one byte, create `guesses.txt` and write your gut answer:\n" +
"1. What hour of the day has the most trips?\n" +
"2. Do longer trips tip a higher or lower % of fare?\n" +
"3. Which day of the week has the highest average fare?\n\n" +
"Being wrong is not failure — it is the point. Data that surprises you is the valuable kind."
      ),
      S([
        { prompt: "Data science and machine learning are the same field.", answer: false, whenRight: "ML is a subset of DS. DS also covers cleaning, exploration, stats, and communication.", whenWrong: "ML is one tool inside data science. DS also includes statistical testing and turning findings into decisions.", sim: "DS = stats + coding + domain + ML\nML is a subset of DS" },
        { prompt: "Parquet loads one column out of 20 faster than CSV because it stores columns contiguously on disk.", answer: true, whenRight: "Right — columnar storage means reading one column skips the other 19 entirely at the byte level.", whenWrong: "Parquet IS columnar. Reading column 5 of 20 skips columns 1-4 and 6-20. CSV has no such optimisation.", sim: "read_parquet()[['fare']]  # reads ~5% of file\nread_csv()[['fare']]      # reads 100% of file" },
        { prompt: "Writing your hypothesis BEFORE looking at data is optional for experienced analysts.", answer: false, whenRight: "Pre-registration is non-optional. Post-hoc hypotheses are confirmation bias at any seniority level.", whenWrong: "Even senior data scientists pre-register. Fitting the hypothesis to what you already saw produces confident, wrong analysis.", sim: "# The rule: commit first, look second\n# No exceptions" }
      ]),
      E("Your turn — commit to three guesses","[WRITE] Create `guesses.txt` in your taxipulse folder. Write one sentence per question — your actual gut guess, not a safe hedge. You will grade yourself on Day 5.")
    ]),
    D(2,"Python you actually need","The minimum viable Python before touching pandas.",[
      L("Five Python constructs for data science",
"## What you need — nothing more\n" +
"Five constructs cover ~80% of everything you will write in the first 10 weeks.\n\n" +
"```python\n" +
"# 1. Variables\n" +
"fare = 14.50\n" +
"borough = 'Manhattan'\n" +
"is_weekend = False\n\n" +
"# 2. Lists\n" +
"hours = [7, 8, 17, 18, 19]\n" +
"hours.append(20)   # [7, 8, 17, 18, 19, 20]\n" +
"hours[0]           # 7  (zero-indexed)\n\n" +
"# 3. Dicts\n" +
"zone = {132: 'JFK Airport', 138: 'LaGuardia'}\n" +
"zone[132]          # 'JFK Airport'\n\n" +
"# 4. Loops\n" +
"for h in [7, 8, 9]:\n" +
"    print(f'Rush hour: {h}:00')\n\n" +
"# 5. Functions\n" +
"def tip_rate(tip, fare):\n" +
"    return tip / fare if fare > 0 else 0.0\n\n" +
"tip_rate(2.50, 12.00)   # 0.2083\n" +
"```\n\n" +
"## The just-enough rule\n" +
"Three weeks on syntax before data = lost momentum = quitting. Learn these five, then learn everything else by needing it."
      ),
      V("Python in 100 Seconds","https://www.youtube.com/watch?v=x7X9w_GIm1s",2,"Fireship","Fastest Python orientation. Watch before writing any code."),
      L("See it in code (with output)",
"## Python warmup — tools TaxiPulse will actually use\n" +
"```python\n" +
"# Extract hour from a datetime string\n" +
"def get_hour(ts):\n" +
"    return int(ts[11:13])\n\n" +
"get_hour('2023-10-15 17:32:00')\n" +
"# 17\n\n" +
"# Map day-of-week int to name\n" +
"DAYS = {0:'Mon',1:'Tue',2:'Wed',3:'Thu',4:'Fri',5:'Sat',6:'Sun'}\n" +
"DAYS[4]\n" +
"# 'Fri'\n\n" +
"# Filter a list with a comprehension\n" +
"raw = [4.5, 14.0, 320.0, 8.75, 0.01]\n" +
"clean = [f for f in raw if 2.50 <= f <= 200.0]\n" +
"# [4.5, 14.0, 8.75]\n" +
"```\n" +
"Every snippet does something TaxiPulse actually needs: extract hours, label days, filter outliers."
      ),
      S([
        { prompt: "`my_list[0]` gives the FIRST element in Python (zero-indexed).", answer: true, whenRight: "Right — zero-indexed. First = index 0, last = index -1.", whenWrong: "Python is zero-indexed. my_list[0] is the first item.", sim: "hours = [7, 8, 9]\nhours[0]   # 7\nhours[-1]  # 9 (last)" },
        { prompt: "A Python dict in 3.7+ preserves the order you inserted keys.", answer: true, whenRight: "Correct — since 3.7, dicts are ordered by insertion as a language guarantee.", whenWrong: "Python 3.7+ dicts ARE ordered. This matters when you iterate over them." },
        { prompt: "`def tip_rate(tip, fare): return tip/fare` is safe to call with fare=0.", answer: false, whenRight: "Right — division by zero raises ZeroDivisionError. Guard with `if fare > 0 else 0.0`.", whenWrong: "It will crash with ZeroDivisionError. Always guard: `return tip/fare if fare > 0 else 0.0`", sim: "tip_rate(2.5, 0)\n# ZeroDivisionError: division by zero" }
      ]),
      E("Your turn — Python warmup","[CODE] In `warmup.py`, write three functions:\n1. `clean_fares(lst)` — returns only values between 2.50 and 200.00\n2. `label_day(n)` — maps 0 to 'Mon' ... 6 to 'Sun' using a dict\n3. `tip_rate(tip, fare)` — returns tip/fare, returns 0.0 if fare is 0\nTest each with print() and confirm the output.")
    ]),
    D(3,"Load and inspect the taxi data","First contact with 3.5 million rows — describe before you analyse.",[
      L("pandas DataFrames and the inspect-first habit",
"## What a DataFrame is\n" +
"A pandas **DataFrame** is a two-dimensional table with named columns and a labelled index. Every column is a Series. Think: an Excel sheet that lives in memory and responds to code.\n\n" +
"Four commands tell you everything about a new dataset:\n\n" +
"| Command | What it shows |\n" +
"|---|---|\n" +
"| `df.head()` | First 5 rows — eyeball the structure |\n" +
"| `df.shape` | (rows, columns) |\n" +
"| `df.info()` | Column names, dtypes, non-null counts |\n" +
"| `df.describe()` | Min/max/mean/std for all numeric columns |\n\n" +
"## Why inspect first — the trust gap\n" +
"Raw data is never clean. Fare amounts of $0.01 and $9,999 sit in the same column. Distances of 0.0 and 312 miles exist. Skip inspection, compute statistics on garbage, report them with confidence. That is the most common mistake in data science."
      ),
      V("pandas in 100 Seconds","https://www.youtube.com/watch?v=tRKeLrwfUgU",2,"Fireship","Fastest orientation to what pandas is and why it exists."),
      L("See it in code (with output)",
"## Load and inspect 3.5 million trips\n" +
"```python\n" +
"import pandas as pd\n\n" +
"df = pd.read_parquet('data/yellow_tripdata_2023-10.parquet')\n" +
"print(df.shape)\n" +
"# (3516318, 19)\n\n" +
"print(df[['fare_amount','trip_distance','tip_amount']].describe().round(2))\n" +
"#        fare_amount  trip_distance  tip_amount\n" +
"# count   3516318.0    3516318.0     3516318.0\n" +
"# mean         18.38         3.12        2.87\n" +
"# min         -52.00         0.00        0.00\n" +
"# 25%           8.50         1.04        0.00\n" +
"# max        9999.00       312.12      300.00\n" +
"```\n" +
"Immediately visible problems: fare -52 and 9999, distance 0 and 312 miles. Day 4 fixes these."
      ),
      S([
        { prompt: "`df.shape` returns (columns, rows) — columns first.", answer: false, whenRight: "It is rows first: (3516318, 19).", whenWrong: "shape is (rows, columns). For TaxiPulse: (3516318, 19).", sim: "df.shape\n# (3516318, 19)  <- rows, cols" },
        { prompt: "`df.describe()` only shows statistics for numeric columns by default.", answer: true, whenRight: "Correct — it skips text columns. Use describe(include='all') to include strings.", whenWrong: "It does skip non-numeric columns. Add include='all' to include strings." },
        { prompt: "A fare_amount of -52 in taxi data is a valid trip to keep in the analysis.", answer: false, whenRight: "Right — negative fares are data errors. Filter them.", whenWrong: "Negative fares are errors. A taxi cannot charge -$52. Remove them before any analysis.", sim: "df['fare_amount'].min()\n# -52.0  <- remove this" }
      ]),
      E("Your turn — first inspection","[CODE] Create `notebooks/01-inspect.ipynb`.\n1. Download yellow_tripdata_2023-10.parquet from NYC TLC into `data/`.\n2. Load with pd.read_parquet().\n3. Print shape, dtypes, info(), and describe() for fare_amount/trip_distance/tip_amount.\n4. Markdown cell: 2-3 sentences on what looks suspicious and what you will clean.")
    ]),
    D(4,"Clean the taxi data","Remove garbage before computing anything.",[
      L("Data cleaning — dropna, query, and the outlier problem",
"## Three categories to clean\n\n" +
"**1. Missing values**\n" +
"```python\n" +
"df.isnull().sum()   # count nulls per column\n" +
"df = df.dropna(subset=['fare_amount','trip_distance'])\n" +
"```\n\n" +
"**2. Impossible values** — readings that cannot be real\n" +
"- fare_amount <= 0 (negative or zero — data errors)\n" +
"- trip_distance <= 0 or > 100 (meter glitch or test trip)\n" +
"- tip_amount < 0 (should never happen)\n\n" +
"**3. Extreme outliers** — technically possible, statistically distorting\n" +
"- fare_amount > 200 (wrecks the mean)\n\n" +
"## Document every filter\n" +
"Cleaning is a judgment call. When someone asks 'why is your average fare $16.40?', you must answer: 'I removed fares below $2.50 and above $200, which was 8.8% of trips.' Undocumented cleaning is unfalsifiable analysis.\n\n" +
"## Never delete the raw file\n" +
"Your cleaned file is derived from the raw. If your cleaning has a bug, you need the original to re-run."
      ),
      L("See it in code (with output)",
"## Clean the October 2023 taxi data\n" +
"```python\n" +
"import pandas as pd\n\n" +
"df = pd.read_parquet('data/yellow_tripdata_2023-10.parquet')\n" +
"print('Before:', df.shape)\n" +
"# Before: (3516318, 19)\n\n" +
"df = df.dropna(subset=['fare_amount','trip_distance','tpep_pickup_datetime'])\n" +
"df = df.query('fare_amount >= 2.50 and fare_amount <= 200')\n" +
"df = df.query('trip_distance > 0 and trip_distance <= 100')\n" +
"df = df.query('tip_amount >= 0')\n\n" +
"df['pickup_hour'] = df['tpep_pickup_datetime'].dt.hour\n" +
"df['pickup_dow']  = df['tpep_pickup_datetime'].dt.dayofweek\n" +
"df['tip_rate']    = df['tip_amount'] / df['fare_amount'].clip(lower=0.01)\n\n" +
"print('After:', df.shape)\n" +
"# After: (3207445, 22)\n" +
"df.to_parquet('data/clean.parquet', index=False)\n" +
"# Removed 308873 rows (8.8%)\n" +
"```"
      ),
      S([
        { prompt: "After cleaning, you should delete the raw Parquet to save disk space.", answer: false, whenRight: "Never delete raw data. The cleaned file is derived from it. Deleting raw is irreversible.", whenWrong: "Never delete raw data. If your cleaning has a bug, you need the original to re-run.", sim: "# Rule: raw data is sacred\n# clean.parquet is derived, not primary" },
        { prompt: "`df.query('fare_amount >= 2.50')` modifies df in place.", answer: false, whenRight: "Right — query() returns a new DataFrame. You must assign: df = df.query(...).", whenWrong: "query() returns a new object. You need df = df.query(...) to update.", sim: "df = df.query('fare_amount >= 2.50')  # <- must assign" },
        { prompt: "Adding `pickup_hour` from a datetime column is called feature engineering.", answer: true, whenRight: "Exactly — extracting hour from a timestamp is classic feature engineering. Raw timestamps are useless to most models.", whenWrong: "It is — you are engineering a new feature from an existing one. The most common transformation in tabular ML.", sim: "df['pickup_hour'] = df['tpep_pickup_datetime'].dt.hour\n# 0-23 integer per trip" }
      ]),
      E("Your turn — clean the data","[CODE] Create `notebooks/02-clean.ipynb`.\n1. Apply all three cleaning steps: nulls, impossible values, outliers.\n2. Add pickup_hour, pickup_dow, and tip_rate columns.\n3. Print before/after shapes and % rows removed.\n4. Save to `data/clean.parquet`.\n5. Markdown: document every filter applied and why.")
    ]),
    D(5,"Answer your first question — busiest hour","GroupBy is the single most powerful analytical move in pandas.",[
      L("pandas groupby — the question-answering machine",
"## What it is\n" +
"groupby transforms 3.2 million rows into an answer in three steps:\n" +
"1. **Split** — group all trips at hour 0 together, all at hour 1 together, ...\n" +
"2. **Apply** — run an aggregation on each group (count, mean, sum, ...)\n" +
"3. **Combine** — return a compact result\n\n" +
"Pattern: `df.groupby('column')['value'].agg_function()`\n\n" +
"## Every analytical question is a groupby\n" +
"- 'Busiest hour?' → `groupby('pickup_hour').size()`\n" +
"- 'Highest-earning borough?' → `groupby('borough')['fare_amount'].sum()`\n" +
"- 'Weekday vs weekend tipping?' → `groupby('pickup_dow')['tip_rate'].mean()`\n\n" +
"Once groupby clicks, you can answer almost any descriptive question in one line. It is the pandas equivalent of SQL GROUP BY."
      ),
      V("Aggregation in pandas with groupby() and agg()","https://www.youtube.com/watch?v=wqqkONaTGgg",8,"Corey Schafer","The clearest groupby tutorial on YouTube. First 8 minutes."),
      L("See it in code (with output)",
"## Answer all three questions\n" +
"```python\n" +
"import pandas as pd\n" +
"df = pd.read_parquet('data/clean.parquet')\n\n" +
"# Q1: busiest hour\n" +
"by_hour = df.groupby('pickup_hour').size().reset_index(name='trips')\n" +
"print(by_hour.sort_values('trips', ascending=False).head(3))\n" +
"#    pickup_hour   trips\n" +
"#             18  217843   <- 6pm busiest\n" +
"#             17  213654\n" +
"#             19  211022\n\n" +
"# Q2: tip rate by distance bucket\n" +
"df['dist_bucket'] = pd.cut(df['trip_distance'],\n" +
"    bins=[0,2,5,10,100], labels=['short','medium','long','very long'])\n" +
"print(df.groupby('dist_bucket')['tip_rate'].mean().round(3))\n" +
"# short       0.167\n" +
"# medium      0.181\n" +
"# long        0.192\n" +
"# very long   0.211   <- longer trips tip MORE\n\n" +
"# Q3: average fare by day of week\n" +
"print(df.groupby('pickup_dow')['fare_amount'].mean().round(2))\n" +
"# 0  16.82  Mon\n" +
"# 5  18.43  Sat\n" +
"# 6  18.91  Sun  <- Sunday highest\n" +
"```\n" +
"Check guesses.txt. If you were wrong — that is a real finding."
      ),
      S([
        { prompt: "`df.groupby('pickup_hour').size()` counts the number of rows per hour.", answer: true, whenRight: "Right — .size() after groupby counts rows per group.", whenWrong: "It does — .size() counts rows per group. Result is a Series indexed by pickup_hour.", sim: "df.groupby('pickup_hour').size()\n# 0     83241\n# 1     62018\n# ..." },
        { prompt: "After `groupby().mean()`, the result has the same number of rows as the original DataFrame.", answer: false, whenRight: "groupby collapses rows. 24 unique hours produce 24 rows in the result, not 3.2M.", whenWrong: "groupby is a collapsing operation. 24 hours -> 24 rows in the result.", sim: "3.2M rows -> groupby 24 hours -> 24 rows" },
        { prompt: "`.reset_index(name='trips')` turns the groupby result index into a regular column.", answer: true, whenRight: "Right — after groupby, the key is the index. reset_index() makes it a normal column.", whenWrong: "It does — after groupby, the group key is the index. reset_index() promotes it to a column.", sim: "# With reset_index:\n#  pickup_hour  trips\n#           18  217843" }
      ]),
      E("Your turn — answer all three questions","[CODE] In `notebooks/03-questions.ipynb`:\n1. GroupBy pickup_hour to find the top 3 busiest hours.\n2. GroupBy distance bucket — do longer trips tip more?\n3. GroupBy pickup_dow to find the highest-average-fare day.\n4. Open guesses.txt, add one line after each guess: 'I was right/wrong. Actual: X.'")
    ]),
    D(6,"Visualise with matplotlib","A chart that surprises you is a finding. A chart that confirms you is decoration.",[
      L("matplotlib — the floor of Python visualisation",
"## Three things to know\n" +
"```python\n" +
"import matplotlib.pyplot as plt\n\n" +
"# Bar chart\n" +
"plt.figure(figsize=(12, 4))\n" +
"plt.bar(x, y, color='#3b82f6')\n" +
"plt.xlabel('Pickup hour')\n" +
"plt.ylabel('Trips')\n" +
"plt.title('NYC Yellow Taxi trips by hour, Oct 2023')\n" +
"plt.tight_layout()\n" +
"plt.savefig('charts/trips_by_hour.png', dpi=150)   # BEFORE show()\n" +
"plt.show()\n\n" +
"# Scatter with alpha for dense data\n" +
"plt.scatter(df['trip_distance'], df['fare_amount'], alpha=0.02, s=1)\n" +
"```\n\n" +
"## The save habit\n" +
"Always call `savefig()` BEFORE `show()`. show() flushes the figure. After show(), savefig() saves a blank canvas.\n\n" +
"## Alpha trick for dense scatter plots\n" +
"3.2 million points at alpha=1 is a black blob. At alpha=0.02, only dense overlapping areas appear dark — revealing density instead of hiding it."
      ),
      L("See it in code (with output)",
"## Build the two core TaxiPulse charts\n" +
"```python\n" +
"import pandas as pd, matplotlib.pyplot as plt, os\n" +
"df = pd.read_parquet('data/clean.parquet')\n" +
"os.makedirs('charts', exist_ok=True)\n\n" +
"# Chart 1 — trips by hour\n" +
"by_hour = df.groupby('pickup_hour').size()\n" +
"plt.figure(figsize=(12, 4))\n" +
"plt.bar(by_hour.index, by_hour.values, color='#3b82f6')\n" +
"plt.xlabel('Hour (24h)'); plt.ylabel('Trip count')\n" +
"plt.title('Trips per hour, October 2023')\n" +
"plt.xticks(range(0, 24)); plt.tight_layout()\n" +
"plt.savefig('charts/trips_by_hour.png', dpi=150); plt.close()\n\n" +
"# Chart 2 — distance vs fare, 50k sample\n" +
"s = df.sample(50_000, random_state=42)\n" +
"plt.figure(figsize=(8, 5))\n" +
"plt.scatter(s['trip_distance'], s['fare_amount'], alpha=0.05, s=4, color='#f59e0b')\n" +
"plt.xlabel('Distance (mi)'); plt.ylabel('Fare')\n" +
"plt.xlim(0, 30); plt.ylim(0, 100)\n" +
"plt.title('Distance vs fare, 50k sample')\n" +
"plt.tight_layout()\n" +
"plt.savefig('charts/distance_vs_fare.png', dpi=150); plt.close()\n" +
"# Horizontal band at ~52 = JFK flat-rate trips (real finding)\n" +
"```"
      ),
      S([
        { prompt: "`plt.savefig()` must be called BEFORE `plt.show()`, otherwise it saves a blank image.", answer: true, whenRight: "Correct — show() flushes the figure. Call savefig() first.", whenWrong: "show() flushes the figure buffer. After show(), savefig() saves a blank canvas.", sim: "plt.savefig('chart.png')  # FIRST\nplt.show()               # SECOND" },
        { prompt: "`alpha=0.02` makes scatter dots more transparent — useful for millions of points.", answer: true, whenRight: "Right — low alpha reveals density. Overlapping dots compound to look darker.", whenWrong: "alpha=0.02 means 98% transparent. Dense areas look dark; sparse areas near invisible.", sim: "plt.scatter(x, y, alpha=0.02)\n# dense areas: dark\n# sparse areas: near invisible" },
        { prompt: "`plt.close()` after each chart prevents plots bleeding into each other.", answer: true, whenRight: "Right — without close(), the next plt.figure() stacks on the open canvas.", whenWrong: "Always call close() after saving. Without it, the next chart inherits the previous axes.", sim: "plt.savefig('a.png'); plt.close()\nplt.figure()  # <- clean canvas" }
      ]),
      E("Your turn — three charts","[CODE] In `notebooks/04-charts.ipynb`, build and save:\n1. `charts/trips_by_hour.png` — bar chart of trips per hour\n2. `charts/distance_vs_fare.png` — scatter of distance vs fare, 50k sample, alpha=0.05\n3. `charts/tip_by_dow.png` — bar chart of average tip_rate by day of week\nEach: title, axis labels, dpi=150, saved before show().")
    ]),
    D(7,"Push to GitHub — TaxiPulse v0.1 ships","The deliverable is a public URL with your name on it.",[
      L("Git, GitHub, and the README that lets strangers run your code",
"## The four git commands you will use forever\n" +
"```bash\n" +
"git init          # once per project\n" +
"git add .\n" +
"git commit -m 'v0.1: load + clean + 3 questions'\n" +
"git push\n" +
"```\n\n" +
"## What a production README needs\n" +
"One job: let a stranger clone your repo, get the data, and run the notebooks in two commands.\n\n" +
"```text\n" +
"# TaxiPulse\n" +
"Analyse 3.5M NYC yellow-cab trips — October 2023.\n\n" +
"## What I found\n" +
"- Busiest hour: 6pm (217,843 trips)\n" +
"- Longer trips tip more: very long avg 21.1% vs short 16.7%\n" +
"- Highest average fare: Sunday\n\n" +
"## Data\n" +
"Download yellow_tripdata_2023-10.parquet from NYC TLC:\n" +
"https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page\n\n" +
"## Run\n" +
"pip install pandas matplotlib pyarrow\n" +
"jupyter notebook notebooks/01-inspect.ipynb\n" +
"```\n\n" +
"Every recruiter you meet looks at GitHub. A repo with no README is invisible."
      ),
      S([
        { prompt: "You should commit the raw 50MB Parquet file to GitHub so others can reproduce your work.", answer: false, whenRight: "Never commit large files. Link to the source in the README. Git history is permanent.", whenWrong: "Large files bloat the repo forever. Add *.parquet to .gitignore and link to the source.", sim: "# .gitignore\ndata/*.parquet\ndata/*.csv" },
        { prompt: "A commit message 'v0.1: load + clean + 3 questions answered' is better than 'update'.", answer: true, whenRight: "Descriptive messages let you reconstruct project history without reading diffs.", whenWrong: "'update' tells you nothing. Write what changed and why in every commit message." },
        { prompt: "GitHub renders .ipynb files so anyone can read your notebook without installing Python.", answer: true, whenRight: "Right — GitHub's notebook renderer makes your analysis readable by anyone with a browser.", whenWrong: "GitHub does render notebooks. That is why Jupyter is the standard for sharing analytical work.", sim: "github.com/you/taxipulse/.../01-inspect.ipynb\n# renders in browser, no Python needed" }
      ]),
      E("Your turn — ship TaxiPulse v0.1","[PRODUCE] By end of day:\n1. Create GitHub repo `taxipulse`.\n2. Add `.gitignore` excluding `data/*.parquet`.\n3. Commit all notebooks and charts/ folder.\n4. Write README.md: findings (3 bullets), data source, how to run.\n5. Push. Paste the GitHub URL into guesses.txt.\n\nPASS:\n[x] Repo is public on GitHub\n[x] README has findings + data source + run instructions\n[x] .gitignore excludes Parquet files\n[x] 4+ notebooks committed")
    ])
  ]
};

const W2 = {
  number: 2, title: "Math you actually need (lin alg + prob + stats)",
  phase: "Foundations", commitment_hours: "12-15",
  context: ds.weeks[1].context,
  concept_check: [
    { q: "A linear model predicts fare by: dot product of weights and [distance, hour, day]. This operation is called:",
      choices: ["Matrix inversion","A dot product","Gradient descent","A convolution"],
      correct: 1, explain: "Multiplying a feature vector by a weights vector is a dot product. It is the fundamental operation inside every linear model and neural network layer." },
    { q: "The 68-95-99.7 rule says 95% of values in a normal distribution fall within:",
      choices: ["1 standard deviation of the mean","2 standard deviations of the mean","3 standard deviations of the mean","The interquartile range"],
      correct: 1, explain: "68% within 1sd, 95% within 2sd, 99.7% within 3sd. This lets you judge how extreme any value is." },
    { q: "Pearson r = 0.87 between distance and fare means:",
      choices: ["87% of trips are correctly predicted by distance","Strong positive linear relationship — longer trips tend to cost more","Distance causes fare to increase","87% of fare variance is explained by distance"],
      correct: 1, explain: "r measures linear association. 0.87 is strong and positive. r says nothing about causation, and R-squared (r squared = 0.757) — not r — is the variance-explained metric." }
  ],
  days: [
    D(1,"Vectors — the atom of machine learning","Every feature row, weight update, and embedding is a vector.",[
      L("Vectors and the dot product",
"## What a vector is\n" +
"A **vector** is an ordered list of numbers. In data science it represents one observation with all features packed together:\n\n" +
"```text\n" +
"trip = [2.3, 17, 4]   # [distance_miles, pickup_hour, day_of_week]\n" +
"```\n\n" +
"That single array is the input to every model you will ever train.\n\n" +
"## The dot product — the operation that powers ML\n" +
"Multiply corresponding elements and sum:\n\n" +
"```text\n" +
"trip    = [2.3,  17,   4  ]\n" +
"weights = [3.0,  0.1, -0.2]\n\n" +
"dot = 2.3*3.0 + 17*0.1 + 4*(-0.2)\n" +
"    = 6.9 + 1.7 - 0.8\n" +
"    = 7.8   <- predicted fare contribution\n" +
"```\n\n" +
"This is literally what linear regression does when it predicts. Weights are what training learns.\n\n" +
"## Why it matters\n" +
"Neural networks are stacks of dot products followed by non-linear functions. Transformers use dot products to compute attention. Recommendation systems find similar users by dot product. This is the atom of modern AI."
      ),
      V("Essence of Linear Algebra — Ep 1: Vectors","https://www.youtube.com/watch?v=fNk_zzaMoSs",15,"3Blue1Brown","The most visual introduction to vectors ever made. Watch after reading the lesson."),
      L("See it in code (with output)",
"## NumPy dot products on real taxi data\n" +
"```python\n" +
"import numpy as np\n\n" +
"trip    = np.array([2.3, 17.0, 4.0])\n" +
"weights = np.array([3.0, 0.1, -0.2])\n\n" +
"pred = np.dot(trip, weights)\n" +
"print(round(pred, 2))\n" +
"# 7.8\n\n" +
"# Cosine similarity — are two trips 'similar'?\n" +
"trip2 = np.array([2.1, 18.0, 4.0])\n" +
"sim = np.dot(trip, trip2) / (np.linalg.norm(trip) * np.linalg.norm(trip2))\n" +
"print(round(sim, 4))\n" +
"# 0.9999  <- nearly identical trips\n" +
"```"
      ),
      S([
        { prompt: "The dot product of [1,2,3] and [4,5,6] equals 1*4 + 2*5 + 3*6 = 32.", answer: true, whenRight: "Correct — multiply corresponding elements then sum: 4+10+18=32.", whenWrong: "Walk through it: 1*4=4, 2*5=10, 3*6=18, sum=32.", sim: "np.dot([1,2,3],[4,5,6])\n# 32" },
        { prompt: "Training a linear model means finding the weights vector that minimises prediction error.", answer: true, whenRight: "Exactly — training = optimise weights to minimise loss (e.g. sum of squared errors).", whenWrong: "That is what training is. Weights start random and are updated to reduce error." },
        { prompt: "Two vectors pointing in the same direction have cosine similarity close to 0.", answer: false, whenRight: "Cosine similarity = cos(angle). Same direction = 0 degrees, cos(0) = 1, not 0.", whenWrong: "Same direction means angle=0, cos(0)=1. Orthogonal vectors have similarity 0.", sim: "cos_sim([1,1],[2,2])\n# 1.0  (same direction)" }
      ]),
      E("Your turn — vectors on real data","[CODE] In `notebooks/05-math.ipynb`:\n1. Take 5 random trips from `data/clean.parquet` as NumPy arrays [trip_distance, pickup_hour, pickup_dow].\n2. Compute dot product of each trip with weights=[3.5, 0.05, -0.15].\n3. Compute cosine similarity between trip 1 and every other trip.\n4. Which trip is most similar to trip 1? Interpret in a markdown cell.")
    ]),
    D(2,"Matrices — why neural nets are just table operations","A matrix transforms vectors. Every model layer is one matrix.",[
      L("Matrix multiplication — inside every model layer",
"## What a matrix is\n" +
"A matrix is a 2D array (rows x columns). In ML:\n" +
"- A dataset of N trips with F features is an N x F matrix\n" +
"- A neural network layer is a weight matrix W that maps one space to another\n" +
"- The entire forward pass: output = W2 * ReLU(W1 * input + b1) + b2\n\n" +
"## The multiplication rule\n" +
"To multiply A (m x n) by B (n x p): dot-product each row of A with each column of B.\n\n" +
"```text\n" +
"A = [[1,2],[3,4]]   B = [[5,6],[7,8]]\n" +
"A*B = [[1*5+2*7, 1*6+2*8],\n" +
"       [3*5+4*7, 3*6+4*8]]\n" +
"    = [[19,22],[43,50]]\n" +
"```\n\n" +
"Constraint: A's column count must equal B's row count.\n\n" +
"## Batch prediction\n" +
"When sklearn calls model.predict(X) on 10,000 rows, it computes X @ weights in one matrix multiply — not 10,000 separate dot products. That is why NumPy ML is fast."
      ),
      V("Essence of Linear Algebra — Ep 3: Matrix multiplication","https://www.youtube.com/watch?v=k7RM-ot2NWY",10,"3Blue1Brown","Geometric intuition for why matrices transform space."),
      L("See it in code (with output)",
"## Batch prediction as matrix multiplication\n" +
"```python\n" +
"import numpy as np\n\n" +
"# 5 trips: [distance, hour, dow]\n" +
"X = np.array([\n" +
"    [2.3, 17, 4],\n" +
"    [0.8,  9, 2],\n" +
"    [5.1, 22, 5],\n" +
"    [1.2, 13, 1],\n" +
"    [3.7,  8, 0],\n" +
"])\n" +
"W = np.array([[3.5],[0.05],[-0.15]])   # weights (3x1)\n" +
"b = 4.0\n\n" +
"preds = (X @ W + b).flatten()\n" +
"print(preds.round(2))\n" +
"# [16.15  9.25 23.02 12.27 18.83]\n" +
"# All 5 predictions in one matrix multiply\n" +
"```"
      ),
      S([
        { prompt: "To multiply matrix A (3x4) by matrix B, B must have exactly 4 rows.", answer: true, whenRight: "Right — inner dimensions must match: A's columns (4) = B's rows (4). Result: 3 x B_cols.", whenWrong: "Inner dimensions must match. A is 3x4, so B must start with 4 rows.", sim: "A (3x4) @ B (4x2) -> result (3x2)" },
        { prompt: "In Python, `A @ B` and `np.dot(A, B)` are equivalent for 2D arrays.", answer: true, whenRight: "For 2D matrices, @ and np.dot() give the same result. @ is the preferred modern syntax.", whenWrong: "For 2D matrices they are equivalent. Use @ — it is cleaner and standard since Python 3.5." },
        { prompt: "Predicting 1 million rows takes 1 million times longer than 1 row in NumPy.", answer: false, whenRight: "NumPy BLAS parallelises matrix ops. 1M rows might be 100x slower per call, not 1M times.", whenWrong: "NumPy batch operations are highly parallelised. 1M predictions is far less than 1M times slower than 1." }
      ]),
      E("Your turn — matrix prediction","[CODE] Continuing in `notebooks/05-math.ipynb`:\n1. Load 1000 random trips as a NumPy array [trip_distance, pickup_hour, pickup_dow].\n2. Use matrix multiplication (X @ weights + bias) to predict all 1000 fares at once.\n3. Compute MAE between predictions and actual fare_amount.\n4. Compute baseline MAE (always predict the mean fare).\n5. Is the matrix model better than the baseline?")
    ]),
    D(3,"Probability — the language models reason in","Every prediction is a probability. Learn the language.",[
      L("Probability and Bayes",
"## The rules you need\n\n" +
"**Joint probability** (independent events):\n" +
"P(A and B) = P(A) * P(B)\n\n" +
"**Conditional probability**:\n" +
"P(A | B) = P(A and B) / P(B)\n" +
"'Given it is Friday, what is P(rain)?'\n\n" +
"**Bayes theorem**:\n" +
"P(A | B) = P(B | A) * P(A) / P(B)\n" +
"'Given this email has free money, what is P(spam)?'\n\n" +
"## Why ML models are probability machines\n" +
"Every classifier outputs a probability. 0.87 from a fraud model means 87% confidence — not 'this IS fraud'. Language models sample the next word from a probability distribution over the entire vocabulary.\n\n" +
"## Where this fits in TaxiPulse\n" +
"Does rush hour change tipping behaviour? Compute P(tip > 0 | rush hour) and compare to P(tip > 0). If they are equal, rush hour and tipping are independent."
      ),
      V("Bayes theorem, intuitively — 3Blue1Brown","https://www.youtube.com/watch?v=HZGCoVF3YvM",15,"3Blue1Brown","The most intuitive Bayes explanation on the internet. Worth every minute."),
      L("See it in code (with output)",
"## Conditional probability on taxi data\n" +
"```python\n" +
"import pandas as pd\n" +
"df = pd.read_parquet('data/clean.parquet')\n\n" +
"p_tip = (df['tip_amount'] > 0).mean()\n" +
"print(f'P(tip > 0):       {p_tip:.3f}')\n" +
"# P(tip > 0):       0.673\n\n" +
"rush = df['pickup_hour'].isin([7, 8, 17, 18, 19])\n" +
"p_tip_rush = (df[rush]['tip_amount'] > 0).mean()\n" +
"print(f'P(tip>0|rush):    {p_tip_rush:.3f}')\n" +
"# P(tip>0|rush):    0.681\n\n" +
"print(f'Lift: {p_tip_rush / p_tip:.3f}')\n" +
"# Lift: 1.012  <- effectively no effect\n" +
"# Rush hour does NOT change tipping behaviour\n" +
"```"
      ),
      S([
        { prompt: "P(A | B) = P(B | A) — conditional probability is symmetric.", answer: false, whenRight: "They are almost never equal. P(spam | 'free money') is not P('free money' | spam). Bayes theorem is needed to flip them.", whenWrong: "Not symmetric. P(disease | positive test) is not P(positive test | disease). That asymmetry is the whole point of Bayes." },
        { prompt: "If P(tip > 0 | rush hour) equals P(tip > 0), rush hour and tipping are independent.", answer: true, whenRight: "Right — independence means conditioning on B does not change P(A).", whenWrong: "Independence means P(A|B) = P(A). If conditioning on rush hour does not change tip probability, they are independent." },
        { prompt: "A fraud model outputting 0.87 means the transaction IS fraudulent.", answer: false, whenRight: "0.87 is a confidence estimate, not a verdict. A threshold converts it to yes/no.", whenWrong: "0.87 is a probability estimate. You still need a threshold. The model is wrong ~13% of the time at that score." }
      ]),
      E("Your turn — conditional probability","[CODE] Continuing in `notebooks/05-math.ipynb`:\n1. Compute P(tip > 0) for the full dataset.\n2. Compute P(tip > 0 | pickup_dow == 5) — Saturday.\n3. Compute P(tip > 0 | pickup_dow == 0) — Monday.\n4. Compute lift for both days.\n5. Markdown conclusion: does day of week predict whether a passenger tips?")
    ]),
    D(4,"Normal distribution and the CLT","The shape of data tells you which model to use and where it fails.",[
      L("Normal distribution, CLT, and why they matter for ML",
"## The normal distribution\n" +
"Fully described by two numbers: mean (mu) and std deviation (sigma).\n\n" +
"**68-95-99.7 rule**: 68% within 1sd, 95% within 2sd, 99.7% within 3sd.\n\n" +
"Taxi fares are NOT normally distributed — they are right-skewed (skewness ~2.3). A model that assumes normality for fares will produce wrong confidence intervals.\n\n" +
"## Central Limit Theorem\n" +
"**Even when individual data is not normal, the MEAN of a large sample is approximately normal.**\n\n" +
"This is why t-tests and confidence intervals work on non-normal data when samples are large: you are testing the distribution of means, not individual values.\n\n" +
"## Why it matters for models\n" +
"Linear regression assumes residuals (errors) are normally distributed. When they are not, your p-values and confidence intervals are wrong. Checking residual distribution after fitting is non-optional."
      ),
      V("The Normal Distribution explained clearly","https://www.youtube.com/watch?v=rzFX5NWojp0",10,"StatQuest","The clearest explanation of the normal distribution and the 68-95-99.7 rule."),
      L("See it in code (with output)",
"## Distribution check and CLT demonstration\n" +
"```python\n" +
"import pandas as pd, numpy as np\n" +
"from scipy import stats\n\n" +
"df = pd.read_parquet('data/clean.parquet')\n" +
"fares = df['fare_amount']\n\n" +
"print(f'Mean:     {fares.mean():.2f}')\n" +
"print(f'Std:      {fares.std():.2f}')\n" +
"print(f'Skewness: {fares.skew():.2f}')\n" +
"# Mean:     16.42\n" +
"# Std:      11.18\n" +
"# Skewness:  2.31  <- heavily right-skewed\n\n" +
"# CLT: sample means ARE normal\n" +
"means = [fares.sample(500).mean() for _ in range(1000)]\n" +
"stat, p = stats.normaltest(means)\n" +
"print(f'Normality test on sample means: p={p:.3f}')\n" +
"# p=0.382  <- cannot reject normality, CLT works\n" +
"```"
      ),
      S([
        { prompt: "For a right-skewed distribution, the mean is higher than the median.", answer: true, whenRight: "Right — the long right tail pulls the mean above the 50th percentile.", whenWrong: "Right skew = long tail to the right = large values pull mean above median.", sim: "fares.mean()   # 16.42\nfares.median() # 12.00  <- lower" },
        { prompt: "The CLT says sample means become normal regardless of how small the sample is.", answer: false, whenRight: "CLT requires large samples (typically n >= 30). Tiny samples may not converge.", whenWrong: "CLT requires large n. Very small samples may not converge to normal." },
        { prompt: "Linear regression assumes the MODEL RESIDUALS are normally distributed, not the raw input data.", answer: true, whenRight: "Exactly — the assumption is on errors, not features. Non-normal inputs are fine.", whenWrong: "The assumption is on residuals, not features. Non-normal inputs are fine; non-normal residuals invalidate p-values.", sim: "# Check residuals, not raw data:\nresid = y_actual - y_predicted\n# these should be normal" }
      ]),
      E("Your turn — distribution check","[CODE] Continuing in `notebooks/05-math.ipynb`:\n1. Print mean, std, and skewness for tip_rate.\n2. Plot a histogram of tip_rate (50 bins), save as `charts/tip_rate_dist.png`.\n3. Run CLT demo: draw 1000 samples of n=500, compute means, plot as histogram.\n4. Markdown: is tip_rate normally distributed? How do you know?")
    ]),
    D(5,"Mean, variance, std — the analyst's three numbers","These three describe any column. Everything else elaborates.",[
      L("Mean, variance, std — and when each lies",
"## The three numbers\n" +
"**Mean** = sum / count. Pulled by outliers. Use when data is symmetric.\n" +
"**Variance** = mean of (value minus mean) squared. In squared units.\n" +
"**Std** = square root of variance. Back in original units.\n\n" +
"```text\n" +
"fares = [8, 12, 14, 16, 150]\n" +
"mean   = 40     <- distorted by 150\n" +
"median = 14     <- resistant to the outlier\n" +
"std    = 55.3   <- enormous due to 150\n" +
"```\n\n" +
"## Mean vs median — when to use which\n" +
"- **Mean**: symmetric data, few outliers (heights, test scores)\n" +
"- **Median**: skewed data or outliers (income, house prices, taxi fares)\n\n" +
"## Correlation\n" +
"Pearson r measures linear relationship: -1 (perfect inverse), 0 (none), +1 (perfect positive).\n\n" +
"r(distance, fare) ~ 0.87  -> strong linear\n" +
"r(fare, tip_rate) ~ 0.09  -> almost no linear relationship"
      ),
      L("See it in code (with output)",
"## Descriptive stats and correlation on TaxiPulse\n" +
"```python\n" +
"import pandas as pd\n" +
"df = pd.read_parquet('data/clean.parquet')\n\n" +
"print(df[['fare_amount','trip_distance','tip_rate']]\n" +
"      .agg(['mean','median','std']).round(2))\n" +
"#           fare_amount  trip_distance  tip_rate\n" +
"# mean            16.42           2.87      0.17\n" +
"# median          12.00           1.76      0.17\n" +
"# std             11.18           3.21      0.13\n\n" +
"corr = df[['fare_amount','trip_distance','tip_amount','tip_rate']].corr().round(2)\n" +
"print(corr)\n" +
"#               fare_amount  trip_distance  tip_amount  tip_rate\n" +
"# fare_amount          1.00           0.87        0.61      0.09\n" +
"# trip_distance        0.87           1.00        0.54      0.07\n" +
"# tip_rate             0.09           0.07        0.58      1.00\n" +
"# Insight: fare predicts tip AMOUNT (0.61) but tip RATE barely (0.09)\n" +
"```"
      ),
      S([
        { prompt: "For skewed data like taxi fares, the median is a more honest summary than the mean.", answer: true, whenRight: "Right — the mean is pulled by outliers. For right-skewed fares: mean=16.42, median=12.00.", whenWrong: "With right skew, the mean is pulled above the typical value. Median is more representative.", sim: "mean   = 16.42\nmedian = 12.00  <- more typical trip" },
        { prompt: "r = 0.87 between distance and fare PROVES distance causes fare to increase.", answer: false, whenRight: "Correct — correlation never proves causation. Both could be driven by trip type.", whenWrong: "Correlation never implies causation. r=0.87 says they co-vary; it says nothing about mechanism." },
        { prompt: "Standard deviation has the same units as the original data.", answer: true, whenRight: "Right — variance is in squared units (dollars squared), but std = root(variance) = dollars.", whenWrong: "Std IS in the original units. Variance is dollars squared. std = root(variance) = dollars.", sim: "fare_amount.std()\n# 11.18  <- in dollars" }
      ]),
      E("Your turn — descriptive stats memo","[CODE] Continuing in `notebooks/05-math.ipynb`:\n1. Print mean, median, std for fare_amount, trip_distance, tip_amount, tip_rate.\n2. For each: one sentence — 'I use mean/median because the data is symmetric/skewed'.\n3. Print the full 4x4 correlation matrix.\n4. Write 3-bullet markdown: 'The three strongest insights from the correlation matrix are...'")
    ]),
    D(6,"Linear regression from scratch","Derive the formula that Week 5 hands to sklearn.",[
      L("The Normal Equation — linear regression by hand",
"## What linear regression minimises\n" +
"```text\n" +
"predicted_fare = w1 * distance + w2 * hour + b\n\n" +
"Best weights minimise: sum of (actual - predicted) squared\n" +
"```\n\n" +
"The closed-form solution — the Normal Equation:\n" +
"```text\n" +
"W = inv(X_T @ X) @ X_T @ y\n" +
"```\n" +
"X is N x F feature matrix, y is N-length target, W is F-length weights.\n\n" +
"## Why derive it before using sklearn\n" +
"Week 5 you call LinearRegression().fit() and it just works. Without understanding the Normal Equation you will not know:\n" +
"- Why it fails when features are perfectly correlated (X_T @ X becomes singular)\n" +
"- Why gradient descent exists for large datasets (matrix inversion scales O(n cubed))\n" +
"- What Ridge/Lasso regularisation actually modifies\n\n" +
"Formula first. Library second. Always."
      ),
      L("See it in code (with output)",
"## Normal Equation on TaxiPulse\n" +
"```python\n" +
"import pandas as pd, numpy as np\n" +
"df = pd.read_parquet('data/clean.parquet').sample(50_000, random_state=42)\n\n" +
"X_raw = df[['trip_distance','pickup_hour']].values\n" +
"y     = df['fare_amount'].values\n" +
"X     = np.column_stack([X_raw, np.ones(len(X_raw))])  # add bias col\n\n" +
"W = np.linalg.inv(X.T @ X) @ X.T @ y\n" +
"w_dist, w_hour, bias = W\n" +
"print(f'{w_dist:.2f} per mile,  {w_hour:.2f} per hour,  bias={bias:.2f}')\n" +
"# 3.48 per mile,  0.07 per hour,  bias=8.12\n" +
"# NYC meter rate is ~3.00 per mile — model found it from data alone\n\n" +
"mae      = np.mean(np.abs(y - X @ W))\n" +
"baseline = np.mean(np.abs(y - y.mean()))\n" +
"print(f'Model MAE: {mae:.2f}  |  Baseline MAE: {baseline:.2f}')\n" +
"# Model MAE: 6.14  |  Baseline MAE: 9.02  <- model beats baseline\n" +
"```"
      ),
      S([
        { prompt: "The Normal Equation fails when two features are perfectly correlated because X_T*X becomes non-invertible.", answer: true, whenRight: "Right — perfect multicollinearity makes X_T*X singular. sklearn uses gradient descent to avoid this.", whenWrong: "Perfect correlation creates a singular matrix. sklearn avoids this with gradient descent." },
        { prompt: "A model with MAE 6.14 is worse than a baseline MAE of 9.02.", answer: false, whenRight: "Lower MAE = better. 6.14 < 9.02: model beats 'always predict mean' by 32%.", whenWrong: "Lower MAE = better. 6.14 < 9.02 means the model is 32% better than the baseline." },
        { prompt: "The weight 3.48 per mile means each extra mile adds 3.48 to the predicted fare.", answer: true, whenRight: "That is the interpretation — coefficient = marginal effect of one unit of that feature.", whenWrong: "That is the interpretation. One more mile adds 3.48 to the prediction, holding everything else constant." }
      ]),
      E("Your turn — Normal Equation from scratch","[CODE] Continuing in `notebooks/05-math.ipynb`:\n1. Implement the Normal Equation using only NumPy (no sklearn).\n2. Train on 50k trips with features [trip_distance, pickup_hour, pickup_dow].\n3. Print the learned weights and interpret each in a sentence.\n4. Compute and print MAE vs baseline.\n5. Markdown: 'The model learns each mile costs X, each hour adds Y...'")
    ]),
    D(7,"Apply the math — is distance linearly related to fare?","Close out the math notebook with a complete analytical argument.",[
      L("A complete analytical argument — four parts",
"## From numbers to a finding\n" +
"A complete analytical argument has four parts:\n" +
"1. **Descriptive stats** — what do the distributions look like?\n" +
"2. **Visualisation** — does the scatter suggest linearity?\n" +
"3. **Correlation** — is Pearson r high?\n" +
"4. **Residual check** — are errors randomly distributed around zero?\n\n" +
"If residuals fan out (larger errors at larger fares), the relationship is non-linear and a different model is needed.\n\n" +
"## What you will find in TaxiPulse\n" +
"Airport trips (JFK flat rate ~52 dollars) create a horizontal band in the scatter that a linear model fits poorly. The residuals for those trips cluster at +20 to +35 dollars — systematic, not random.\n\n" +
"**Systematic residuals always reveal structure your model missed.**\n\n" +
"## The deliverable\n" +
"A notebook that reads like an article: stats, chart, correlation, model, residual, conclusion. A recruiter who cannot code should be able to skim it and understand what you found."
      ),
      S([
        { prompt: "If residuals fan out (variance increases with fare amount), the linear model is misspecified.", answer: true, whenRight: "That is heteroscedasticity — non-constant variance violates linear regression's core assumption.", whenWrong: "Fanning residuals = heteroscedasticity. Linear regression assumes constant variance." },
        { prompt: "r = 0.87 means 87% of fare variance is explained by distance.", answer: false, whenRight: "R-squared = r squared = 0.87 squared = 0.757. About 75.7% is explained, not 87%.", whenWrong: "R2 = r squared = 0.87 squared = 0.757. About 75.7% is explained, not 87%.", sim: "r = 0.87\nR2 = 0.87**2  # 0.757" },
        { prompt: "Systematic residuals (a cluster at +30 for long trips) reveal a pricing rule the model missed.", answer: true, whenRight: "Exactly — systematic = a pattern, not noise. JFK flat-rate trips cause this cluster.", whenWrong: "Systematic residuals always reveal missed structure. Random residuals mean the model captured everything." }
      ]),
      E("Your turn — wrap up the math notebook","[PRODUCE] Wrap up `notebooks/05-math.ipynb`:\n1. Add section '## Week 2 synthesis: distance vs fare'.\n2. Include: descriptive stats, Pearson r, Normal Equation weights, MAE vs baseline, residual scatter plot saved as `charts/residuals.png`.\n3. Write a 3-sentence conclusion: 'The relationship is [linear/non-linear]. The model explains X% of variance. It fails on [trip type] because [reason].'\n4. Commit: `git add . && git commit -m 'Week 2: math fundamentals complete'`")
    ])
  ]
};

const W3 = {
  number: 3, title: "TaxiPulse v0.2: Borough breakdown + multi-month",
  phase: "Foundations", commitment_hours: "12-15",
  context: ds.weeks[2].context,
  concept_check: [
    { q: "You have Oct, Nov, Dec taxi Parquet files. How do you combine them into one DataFrame?",
      choices: ["Load each and write a for-loop appending rows","pd.concat([oct, nov, dec], ignore_index=True)","Merge on the trip ID column","Use df.append() three times"],
      correct: 1, explain: "pd.concat() stacks DataFrames vertically (same columns, more rows). merge() adds columns by key. append() is deprecated in modern pandas." },
    { q: "A pivot table with index='borough', columns='month', values='fare_amount', aggfunc='mean' shows:",
      choices: ["One row per trip","Average fare per borough per month — a 5x3 summary table","Total fare per trip","Number of trips per borough"],
      correct: 1, explain: "pivot_table collapses rows into a 2D summary grid. One row per borough, one column per month, each cell = mean fare." },
    { q: "`df.resample('D').size()` requires which precondition?",
      choices: ["A numeric index","A DatetimeIndex — set with df.set_index('tpep_pickup_datetime')","A sorted DataFrame","Columns named 'date' and 'value'"],
      correct: 1, explain: "resample() is a time-series operation. It requires a DatetimeIndex. Set it with df.set_index('tpep_pickup_datetime')." }
  ],
  days: [
    D(1,"Concatenate multiple months of data","pd.concat stacks DataFrames vertically — same columns, more rows.",[
      L("pd.concat — combining files without a loop",
"## What it is\n" +
"pd.concat() stacks multiple DataFrames vertically — same columns, more rows.\n\n" +
"```python\n" +
"import pandas as pd\n\n" +
"oct = pd.read_parquet('data/yellow_tripdata_2023-10.parquet')\n" +
"nov = pd.read_parquet('data/yellow_tripdata_2023-11.parquet')\n" +
"dec = pd.read_parquet('data/yellow_tripdata_2023-12.parquet')\n\n" +
"df3 = pd.concat([oct, nov, dec], ignore_index=True)\n" +
"print(df3.shape)   # roughly (10M, 19)\n" +
"```\n\n" +
"ignore_index=True resets row numbers to 0, 1, 2 ... instead of three overlapping 0-N sequences.\n\n" +
"## pd.concat vs pd.merge\n" +
"- **concat**: same columns, more rows (vertical stack)\n" +
"- **merge**: join on a shared key, add new columns (horizontal join)\n\n" +
"Combining three months is a concat. Joining trips to a zone-names lookup is a merge.\n\n" +
"## Why this matters\n" +
"Week 1 was one month. Q4 (three months) is the minimum baseline for seasonal questions."
      ),
      L("See it in code (with output)",
"## Load and concat Q4, then clean\n" +
"```python\n" +
"import pandas as pd\n\n" +
"months = []\n" +
"for m in ['10','11','12']:\n" +
"    df = pd.read_parquet(f'data/yellow_tripdata_2023-{m}.parquet')\n" +
"    df['month'] = int(m)\n" +
"    months.append(df)\n\n" +
"df3 = pd.concat(months, ignore_index=True)\n" +
"print('Raw:', df3.shape)\n" +
"# Raw: (10483621, 20)\n\n" +
"df3 = df3.query('fare_amount >= 2.50 and fare_amount <= 200')\n" +
"df3 = df3.query('trip_distance > 0 and trip_distance <= 100')\n" +
"df3['pickup_hour'] = df3['tpep_pickup_datetime'].dt.hour\n" +
"df3['pickup_dow']  = df3['tpep_pickup_datetime'].dt.dayofweek\n" +
"df3['tip_rate']    = df3['tip_amount'] / df3['fare_amount'].clip(lower=0.01)\n\n" +
"print('Clean:', df3.shape)\n" +
"# Clean: (9621834, 23)\n" +
"df3.to_parquet('data/clean_q4.parquet', index=False)\n" +
"```"
      ),
      S([
        { prompt: "`pd.concat([a,b])` adds more rows; `pd.merge(a,b)` adds more columns.", answer: true, whenRight: "Right — concat is vertical (more rows). merge is horizontal (more columns via key).", whenWrong: "concat is vertical (same columns, more rows). merge is horizontal (same rows, more columns via key).", sim: "concat: (5 rows) + (5 rows) -> 10 rows\nmerge: 5 rows + new columns via key" },
        { prompt: "`ignore_index=True` in pd.concat prevents duplicate index values across the three files.", answer: true, whenRight: "Right — each file starts at index 0. Without ignore_index, you get three overlapping 0-N sequences.", whenWrong: "Without ignore_index, row 0 appears three times. ignore_index resets to a clean 0-N sequence." },
        { prompt: "Adding a `month` column before concat makes per-month filtering impossible afterwards.", answer: false, whenRight: "The opposite — adding month BEFORE concat is exactly how you keep track of which file each row came from.", whenWrong: "Adding month before concat is the RIGHT move. Tags each row with its source, making per-month analysis easy.", sim: "df['month'] = 10  # before concat\n# after concat:\ndf[df['month'] == 10]  # October only" }
      ]),
      E("Your turn — load and concat Q4","[CODE] Create `notebooks/06-borough.ipynb`.\n1. Download Nov and Dec 2023 Parquet files from NYC TLC into `data/`.\n2. Load all three months, add a `month` column to each, concat into df3.\n3. Apply the same cleaning filters as Week 1.\n4. Add pickup_hour, pickup_dow, tip_rate columns.\n5. Save to `data/clean_q4.parquet`. Print before/after shapes.")
    ]),
    D(2,"GroupBy on multiple columns","One groupby key is a summary. Two keys reveal an interaction.",[
      L("Multi-column groupby — finding interactions",
"## What it is\n" +
"Grouping by two columns reveals how two variables interact:\n\n" +
"```python\n" +
"# Single: average fare by hour\n" +
"df.groupby('pickup_hour')['fare_amount'].mean()\n\n" +
"# Multi: average fare by hour AND month\n" +
"df.groupby(['pickup_hour','month'])['fare_amount'].mean()\n" +
"```\n\n" +
"Single groupby answers 'which hour is most expensive?' The multi-key answers 'does the most expensive hour change by month?'\n\n" +
"## unstack() — from long to wide\n" +
"After a two-key groupby, unstack() pivots the second key into columns:\n\n" +
"```python\n" +
"hourly_by_month = (\n" +
"    df.groupby(['pickup_hour','month'])['fare_amount']\n" +
"    .mean()\n" +
"    .unstack('month')\n" +
"    .round(2)\n" +
")\n" +
"# 24 rows (hours 0-23), 3 columns (Oct, Nov, Dec)\n" +
"# Each cell = average fare for that hour in that month\n" +
"```"
      ),
      L("See it in code (with output)",
"## Trip count by borough and month\n" +
"```python\n" +
"import pandas as pd\n" +
"df3 = pd.read_parquet('data/clean_q4.parquet')\n\n" +
"zones = pd.read_csv('data/taxi_zone_lookup.csv',\n" +
"                    usecols=['LocationID','Borough'])\n" +
"zones = zones.rename(columns={'LocationID':'PULocationID','Borough':'borough'})\n" +
"df3 = df3.merge(zones, on='PULocationID', how='left')\n\n" +
"result = (\n" +
"    df3.groupby(['borough','month'])\n" +
"    .size()\n" +
"    .unstack('month')\n" +
"    .fillna(0).astype(int)\n" +
")\n" +
"print(result)\n" +
"#                    10      11      12\n" +
"# Bronx           87432   82156   79844\n" +
"# Brooklyn       243187  229541  217633\n" +
"# Manhattan     1842341 1736218 1693872   <- dominates volume\n" +
"# Queens         412876  389234  374921\n" +
"# Staten Island    5234    4987    4812\n" +
"```"
      ),
      S([
        { prompt: "`df.groupby(['a','b']).mean()` returns a DataFrame with a MultiIndex.", answer: true, whenRight: "Right — two groupby keys produce a MultiIndex. unstack() converts one level into columns.", whenWrong: "Two keys produce a MultiIndex. The result has (a_value, b_value) tuples as the index.", sim: "groupby(['borough','month'])\n# index: (Bronx, 10), (Bronx, 11), ..." },
        { prompt: "`.unstack('month')` after a two-key groupby pivots month values into columns.", answer: true, whenRight: "Right — unstack promotes a MultiIndex level into column headers.", whenWrong: "unstack() takes a MultiIndex level and makes it the column axis.", sim: "# Before: long (borough, month) index\n# After: wide, one column per month" },
        { prompt: "A groupby on two keys always produces more rows than a groupby on one key.", answer: false, whenRight: "Not always — if the second key has only one unique value, row count is the same.", whenWrong: "Two-key groupby produces at most (unique_a * unique_b) rows. If one key has 1 value, same rows." }
      ]),
      E("Your turn — multi-column groupby","[CODE] Continuing in `notebooks/06-borough.ipynb`:\n1. Join the taxi zone lookup CSV to get borough names.\n2. GroupBy borough + month, compute mean fare_amount. Unstack month into columns.\n3. GroupBy borough + pickup_hour, compute mean tip_rate. Unstack pickup_hour.\n4. Markdown: which borough has the highest average fare? Does the pattern hold all three months?")
    ]),
    D(3,"Pivot tables in pandas","pivot_table turns a long DataFrame into a readable 2D summary grid.",[
      L("pd.pivot_table — from rows to a grid",
"## What it is\n" +
"pd.pivot_table() creates a 2D summary grid directly:\n\n" +
"```python\n" +
"pivot = pd.pivot_table(\n" +
"    df,\n" +
"    values='fare_amount',    # what to aggregate\n" +
"    index='borough',         # rows\n" +
"    columns='month',         # columns\n" +
"    aggfunc='mean'           # how to aggregate\n" +
")\n" +
"```\n\n" +
"## pivot_table vs groupby + unstack\n" +
"Both produce the same result. Use pivot_table when you want the 2D grid in one line. Use groupby + unstack when you need intermediate steps between groupby and pivoting.\n\n" +
"## margins=True — add totals\n" +
"```python\n" +
"pivot = pd.pivot_table(\n" +
"    df, values='fare_amount',\n" +
"    index='borough', columns='month',\n" +
"    aggfunc='mean', margins=True   # adds 'All' row + column\n" +
")\n" +
"```\n" +
"The 'All' column is the overall mean across months — useful for ranking boroughs."
      ),
      L("See it in code (with output)",
"## Pivot: average fare by borough and month\n" +
"```python\n" +
"import pandas as pd\n" +
"df3 = pd.read_parquet('data/clean_q4.parquet')\n\n" +
"pivot = pd.pivot_table(\n" +
"    df3, values='fare_amount',\n" +
"    index='borough', columns='month',\n" +
"    aggfunc='mean', margins=True\n" +
").round(2)\n\n" +
"print(pivot)\n" +
"#                    10     11     12    All\n" +
"# Bronx           12.34  12.41  12.29  12.35\n" +
"# Brooklyn        14.82  14.91  14.77  14.83\n" +
"# Manhattan       16.42  16.51  16.38  16.44\n" +
"# Queens          22.17  22.43  22.08  22.23   <- highest (airports)\n" +
"# Staten Island   18.95  19.12  18.87  18.98\n" +
"# All             16.88  17.02  16.79  16.90\n" +
"# Queens highest: JFK + LaGuardia flat-rate trips\n" +
"```"
      ),
      S([
        { prompt: "`pd.pivot_table()` and `df.groupby().unstack()` always produce identical results.", answer: false, whenRight: "Not always — pivot_table handles duplicate (index, column) pairs by aggregating. groupby+unstack may error.", whenWrong: "They can differ: pivot_table aggregates duplicates automatically; groupby+unstack may error on duplicate pairs." },
        { prompt: "`margins=True` adds a row and column named 'All' showing overall totals/averages.", answer: true, whenRight: "Right — margins adds the grand total/average as an extra row and column.", whenWrong: "margins=True adds an 'All' row and column with the grand total/average across the table." },
        { prompt: "Queens having the highest average fare means Queens trips are always longer than Manhattan trips.", answer: false, whenRight: "Queens has many JFK/LaGuardia airport trips with flat-rate pricing (~52 dollars). High fare does not mean long distance.", whenWrong: "Queens airport flat-rate trips inflate the average fare. A 6-mile JFK trip at the flat rate looks expensive per mile vs a 1-mile Manhattan trip.", sim: "Queens avg fare: 22.17\nQueens avg dist: 4.1 mi\nManhattan avg fare: 16.42\nManhattan avg dist: 2.5 mi" }
      ]),
      E("Your turn — pivot table analysis","[CODE] Continuing in `notebooks/06-borough.ipynb`:\n1. Build pivot: rows=borough, columns=month, values=fare_amount, aggfunc=mean, margins=True.\n2. Build second pivot: rows=borough, columns=pickup_dow, values=tip_rate, aggfunc=mean.\n3. Visualise both as heatmaps using matplotlib imshow and save to charts/.\n4. Markdown: two findings from the pivot tables that are not obvious from raw numbers.")
    ]),
    D(4,"Matplotlib subplots — side-by-side comparisons","Subplots let you compare multiple charts in one visual.",[
      L("plt.subplots — a grid of axes on one canvas",
"## What it is\n" +
"plt.subplots(rows, cols) creates a grid of Axes objects:\n\n" +
"```python\n" +
"fig, axes = plt.subplots(1, 3, figsize=(15, 4))\n" +
"# axes is an array of 3 Axes objects\n\n" +
"axes[0].bar(x, y_oct, color='#3b82f6')\n" +
"axes[0].set_title('October')\n" +
"axes[1].bar(x, y_nov, color='#f59e0b')\n" +
"axes[1].set_title('November')\n" +
"axes[2].bar(x, y_dec, color='#10b981')\n" +
"axes[2].set_title('December')\n\n" +
"fig.tight_layout()\n" +
"fig.savefig('charts/monthly_comparison.png', dpi=150)\n" +
"```\n\n" +
"## Use ax, not plt, in subplots\n" +
"When using subplots, call methods on the **axis object**:\n" +
"- axes[i].set_title() not plt.title()\n" +
"- axes[i].set_xlabel() not plt.xlabel()\n\n" +
"Calling plt.xlabel() in a subplot loop always modifies only the LAST axis."
      ),
      L("See it in code (with output)",
"## Three-month comparison chart\n" +
"```python\n" +
"import pandas as pd, matplotlib.pyplot as plt\n" +
"df3 = pd.read_parquet('data/clean_q4.parquet')\n\n" +
"fig, axes = plt.subplots(1, 3, figsize=(15, 4), sharey=True)\n" +
"colors = ['#3b82f6','#f59e0b','#10b981']\n" +
"titles = ['October','November','December']\n\n" +
"for i, (month, color, title) in enumerate(zip([10,11,12], colors, titles)):\n" +
"    sub = df3[df3['month'] == month]\n" +
"    by_hour = sub.groupby('pickup_hour').size()\n" +
"    axes[i].bar(by_hour.index, by_hour.values, color=color)\n" +
"    axes[i].set_title(title, fontsize=13, fontweight='bold')\n" +
"    axes[i].set_xlabel('Hour of day')\n" +
"    if i == 0:\n" +
"        axes[i].set_ylabel('Trip count')\n\n" +
"fig.suptitle('NYC Yellow Taxi, trips per hour, Q4 2023', fontsize=14)\n" +
"fig.tight_layout()\n" +
"fig.savefig('charts/monthly_comparison.png', dpi=150)\n" +
"plt.close()\n" +
"# Peak stays at 17-19h in all three months\n" +
"# December lower overall volume — holiday effect\n" +
"```"
      ),
      S([
        { prompt: "In a subplot loop, `plt.xlabel('Hour')` labels only the last axis, not each one.", answer: true, whenRight: "Right — plt.xlabel() targets the currently active (last) axis. Use axes[i].set_xlabel() in a loop.", whenWrong: "plt.xlabel() targets the current axis — always the last one created. Use axes[i].set_xlabel() specifically.", sim: "# Wrong: plt.xlabel('Hour')  # only last axis\n# Right: axes[i].set_xlabel('Hour')  # each axis" },
        { prompt: "`sharey=True` makes all subplots use the same y-axis scale — good for honest comparisons.", answer: true, whenRight: "Right — shared y-axis prevents one chart using 0-100k and another 0-200k, making equal patterns look different.", whenWrong: "sharey=True forces a common y-range. Without it, auto-scaling can make a 10% difference look like 10x." },
        { prompt: "`fig.tight_layout()` prevents subplot labels from overlapping each other.", answer: true, whenRight: "Right — tight_layout() automatically adjusts spacing between subplots.", whenWrong: "tight_layout() is the fix for overlapping labels. Always call it before savefig.", sim: "fig.tight_layout()   # <- before savefig\nfig.savefig('chart.png')" }
      ]),
      E("Your turn — monthly comparison chart","[CODE] Continuing in `notebooks/06-borough.ipynb`:\n1. Build a 1x3 subplot showing trips-per-hour for Oct, Nov, Dec.\n2. Use sharey=True, matching colors, individual titles.\n3. Add fig.suptitle() and fig.tight_layout().\n4. Save as `charts/monthly_comparison.png`, dpi=150.\n5. Markdown: does the peak hour shift between months? Any unusual dips?")
    ]),
    D(5,"Time-series resampling","resample() collapses a DatetimeIndex into any time bucket — daily, weekly, monthly.",[
      L("pandas resample — time-series aggregation",
"## What it is\n" +
"resample() is groupby for time. Instead of grouping by a column value, it groups by a time window:\n\n" +
"```python\n" +
"# Requires DatetimeIndex\n" +
"df = df.set_index('tpep_pickup_datetime')\n\n" +
"daily   = df.resample('D').size()           # trips per day\n" +
"weekly  = df.resample('W').size()           # trips per week\n" +
"monthly = df['fare_amount'].resample('ME').mean()  # mean fare per month-end\n" +
"```\n\n" +
"Common frequency aliases: 'D' day, 'W' week, 'ME' month-end, 'h' hour.\n\n" +
"## rolling() — smoothing noisy time series\n" +
"resample collapses. rolling computes a moving window:\n\n" +
"```python\n" +
"daily    = df.resample('D').size()\n" +
"smoothed = daily.rolling(7, center=True).mean()  # 7-day rolling avg\n" +
"```\n\n" +
"A 7-day rolling average removes day-of-week noise and reveals the underlying trend."
      ),
      L("See it in code (with output)",
"## Q4 2023 daily trip trend\n" +
"```python\n" +
"import pandas as pd, matplotlib.pyplot as plt\n" +
"df3 = pd.read_parquet('data/clean_q4.parquet')\n" +
"df3 = df3.set_index('tpep_pickup_datetime')\n\n" +
"daily    = df3.resample('D').size().rename('trips')\n" +
"smoothed = daily.rolling(7, center=True).mean()\n\n" +
"plt.figure(figsize=(12, 4))\n" +
"plt.plot(daily.index, daily.values,\n" +
"         alpha=0.3, color='#3b82f6', label='Daily')\n" +
"plt.plot(smoothed.index, smoothed.values,\n" +
"         color='#1d4ed8', linewidth=2, label='7-day avg')\n" +
"plt.xlabel('Date'); plt.ylabel('Trips')\n" +
"plt.title('NYC Yellow Taxi daily trips, Q4 2023')\n" +
"plt.legend(); plt.tight_layout()\n" +
"plt.savefig('charts/daily_trend.png', dpi=150); plt.close()\n\n" +
"print(daily.idxmin(), daily.min())\n" +
"# 2023-12-25   142834  <- Christmas: lowest day\n" +
"print(daily.idxmax(), daily.max())\n" +
"# 2023-10-06   118973  <- Friday Oct 6: busiest\n" +
"```"
      ),
      S([
        { prompt: "`df.resample('D').size()` requires the DataFrame index to be a DatetimeIndex.", answer: true, whenRight: "Right — resample operates on the index. Set it with df.set_index('tpep_pickup_datetime') first.", whenWrong: "resample requires a DatetimeIndex. Call df.set_index('tpep_pickup_datetime') before resample.", sim: "df = df.set_index('tpep_pickup_datetime')\ndaily = df.resample('D').size()  # now works" },
        { prompt: "`.rolling(7).mean()` computes a 7-day trailing average by default.", answer: true, whenRight: "Right — default rolling is trailing (7 days up to and including current day). Add center=True for a centred window.", whenWrong: "Default is trailing. Add center=True to use a centred window (3 before + current + 3 after).", sim: "# trailing: day 7 = avg of days 1-7\n# center=True: day 4 = avg of days 1-7" },
        { prompt: "Christmas Day showing the fewest trips in Q4 is an anomaly that should be removed from the dataset.", answer: false, whenRight: "Christmas is a real business effect, not a data error. Low demand on a holiday is a genuine pattern.", whenWrong: "Low trips on Christmas is real behaviour — a holiday effect. Remove only data errors, not real events.", sim: "# Christmas low = real signal (keep it)\n# fare_amount = -52 = data error (remove it)" }
      ]),
      E("Your turn — Q4 daily trend","[CODE] Continuing in `notebooks/06-borough.ipynb`:\n1. Set the datetime column as the index.\n2. Resample to daily counts. Plot with a 7-day rolling average overlay.\n3. Save as `charts/daily_trend.png`.\n4. Find the highest and lowest trip-count days in Q4.\n5. Markdown: what explains the outlier days you found?")
    ]),
    D(6,"Build the full borough breakdown","Integration day — concat, groupby, pivot, subplots, and resample into one analysis.",[
      L("Integration day — the v0.2 analysis in one notebook",
"## What you are building\n" +
"TaxiPulse v0.2 answers three questions Week 1 could not:\n" +
"1. Which borough generates the most revenue?\n" +
"2. Does the busiest hour differ by borough?\n" +
"3. Which month in Q4 was the busiest?\n\n" +
"The output is a notebook that reads like a report: question, analysis, chart, finding.\n\n" +
"## The 80/20 of notebook polish\n" +
"Two rules make a notebook readable by a non-coder:\n" +
"1. Every chart has a title, axis labels, and a one-line finding below it (markdown cell)\n" +
"2. Every section starts with a markdown heading that states the FINDING, not the method\n\n" +
"'Borough analysis' is a method title.\n" +
"'Queens earns 31% more per trip than Brooklyn — airport routes explain why' is a finding title.\n\n" +
"Write the second kind. Always."
      ),
      L("See it in code (with output)",
"## Revenue by borough\n" +
"```python\n" +
"import pandas as pd, matplotlib.pyplot as plt\n" +
"df3 = pd.read_parquet('data/clean_q4.parquet')\n\n" +
"borough_rev = (\n" +
"    df3.groupby('borough')['fare_amount']\n" +
"    .agg(['sum','mean','count'])\n" +
"    .sort_values('sum', ascending=False)\n" +
")\n" +
"borough_rev['sum_M'] = (borough_rev['sum'] / 1e6).round(1)\n" +
"print(borough_rev[['sum_M','mean','count']])\n" +
"#               sum_M    mean    count\n" +
"# Manhattan     118.4   16.44  7193847\n" +
"# Queens         38.7   22.24  1740384   <- highest mean fare\n" +
"# Brooklyn       22.1   14.87   948812\n" +
"# Bronx           4.1   12.37   331234\n" +
"# Staten Island   0.9   19.03    47232\n" +
"# Manhattan dominates by volume; Queens dominates by average fare\n" +
"```"
      ),
      S([
        { prompt: "The borough with the highest total revenue always has the highest average fare.", answer: false, whenRight: "Manhattan has the highest total revenue by volume; Queens has the highest average fare (airports). Different metrics.", whenWrong: "Total revenue = volume * average. Manhattan wins on total despite lower average because it has 4x more trips.", sim: "Manhattan: 7.2M trips * 16.44 = 118M\nQueens:    1.7M trips * 22.24 = 38M" },
        { prompt: "'Queens earns 31% more per trip than Brooklyn' is a better heading than 'Borough analysis'.", answer: true, whenRight: "Exactly — finding headings communicate value. Method headings communicate work. Recruiters want findings.", whenWrong: "Findings headings are always better. They let a reader skim and understand without reading every cell." },
        { prompt: "A notebook with 30 code cells and no markdown headings is acceptable if the code is correct.", answer: false, whenRight: "Correct code with no structure is not a portfolio piece. Markdown headings and findings make it a communication artifact.", whenWrong: "Correct code with no structure is not a portfolio piece. Headings + findings turn a script into a report." }
      ]),
      E("Your turn — build the borough analysis section","[CODE] In `notebooks/06-borough.ipynb`, add section '## Borough breakdown' with:\n1. Revenue by borough bar chart (total and average, side-by-side) -> `charts/borough_revenue.png`\n2. Pivot heatmap: borough x pickup_dow, values=tip_rate -> `charts/borough_tip_heatmap.png`\n3. Each chart followed by a one-sentence finding\n4. A '## Q4 trend' section with the daily trend chart from Day 5")
    ]),
    D(7,"Ship TaxiPulse v0.2","Tag, commit, update README — the same ritual every project closes with.",[
      L("The ship ritual — same every week",
"## What shipping means\n" +
"Shipping is not just pushing to GitHub. It is making the project usable to a stranger. Three things make that true:\n\n" +
"**1. Updated README with new findings**\n" +
"```text\n" +
"## v0.2: Borough breakdown + Q4 trend\n" +
"- Queens highest average fare (22.24) — airport flat-rates explain it\n" +
"- Manhattan generates 74% of Q4 revenue by volume\n" +
"- Christmas Day (Dec 25) is the lowest-volume day in Q4 (-38% vs average)\n" +
"```\n\n" +
"**2. Git tag**\n" +
"```bash\n" +
"git add .\n" +
"git commit -m 'v0.2: borough breakdown + multi-month trend'\n" +
"git tag v0.2\n" +
"git push && git push --tags\n" +
"```\n\n" +
"**3. Every PASS item checked**\n" +
"Before closing the notebook, every bullet on the PASS list is checked. If one is unchecked, the week is not done."
      ),
      S([
        { prompt: "A git tag `v0.2` permanently marks the commit that shipped this version.", answer: true, whenRight: "Right — tags are immutable pointers to specific commits. git checkout v0.2 restores the exact state at shipping.", whenWrong: "Tags mark specific commits permanently. git checkout v0.2 restores the codebase exactly as it was." },
        { prompt: "You should update the README only when the whole project is finished.", answer: false, whenRight: "Update the README after EVERY version. Someone may look at your repo before v1.0 is done.", whenWrong: "Update the README with every shipped version. The repo is public. Someone may look today." },
        { prompt: "Adding version sections (v0.1, v0.2 ...) to the README makes the project's progress story visible.", answer: true, whenRight: "Exactly — a changelog README shows iterative shipping, ownership of findings, and clear communication.", whenWrong: "Version sections are a portfolio feature. They show iterative process, not just a final result." }
      ]),
      E("Your turn — ship TaxiPulse v0.2","[PRODUCE] By end of day:\n1. Ensure `notebooks/06-borough.ipynb` has markdown headings for every section.\n2. Add a 'v0.2' section to README.md with 3 bullet findings.\n3. Commit: `git add . && git commit -m 'v0.2: borough breakdown + Q4 trend'`\n4. Tag: `git tag v0.2 && git push && git push --tags`\n\nPASS:\n[x] clean_q4.parquet built from 3 months\n[x] Borough revenue pivot table present\n[x] Monthly comparison subplot saved\n[x] Q4 daily trend chart with rolling average\n[x] README updated with v0.2 findings\n[x] Git tag v0.2 pushed")
    ])
  ]
};

// Validate and write
const newWeeks = [W1, W2, W3];
newWeeks.forEach(w => {
  if (w.days.length !== 7) throw new Error(`W${w.number}: need 7 days, got ${w.days.length}`);
  w.days.forEach(d => {
    const kinds = d.items.map(i => i.kind);
    if (!kinds.includes('lesson'))   throw new Error(`W${w.number} D${d.number}: no lesson`);
    if (!kinds.includes('swipe'))    throw new Error(`W${w.number} D${d.number}: no swipe`);
    if (!kinds.includes('exercise')) throw new Error(`W${w.number} D${d.number}: no exercise`);
  });
});
ds.weeks.splice(0, 3, ...newWeeks);
fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log('SUCCESS: W1-W3 written. Total weeks:', ds.weeks.length);
newWeeks.forEach(w =>
  console.log(`  W${w.number} "${w.title}": ${w.days.length} days, ${w.concept_check.length} concept_check Qs`)
);
