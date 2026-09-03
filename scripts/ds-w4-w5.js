const path = require('path');
const fs = require('fs');
const FILE = path.join(__dirname, '..', 'data', 'roadmaps', 'data-science.json');
const ds = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const L = (title, body) => ({ kind: 'lesson', title, body });
const V = (title, url, dm, creator, why) => ({ kind: 'video', title, url, duration_min: dm, creator, why });
const S = (cards) => ({ kind: 'swipe', title: 'Quick check — swipe to answer', cards });
const E = (title, body) => ({ kind: 'exercise', title, body });
const D = (number, title, summary, items) => ({ number, title, summary, items });

/* ── WEEK 4 — SQL for Data Scientists ─────────────────────── */
const W4 = {
  number: 4, title: "SQL for Data Scientists",
  phase: "Foundations", commitment_hours: "12-15",
  context: ds.weeks[3].context,
  concept_check: [
    { q: "In pandas you write df.groupby('region')['sales'].sum(). What is the SQL equivalent?",
      choices: ["SELECT region FROM sales WHERE sum > 0","SELECT region, SUM(sales) FROM t GROUP BY region","GROUP region BY SUM(sales)","SELECT SUM(region) FROM sales"],
      correct: 1, explain: "GROUP BY region + SUM(sales) is the SQL twin of pandas groupby+sum. Same operation, different verbs: SELECT the group key and the aggregate, GROUP BY the key." },
    { q: "Why do data science jobs assume SQL even when you know pandas?",
      choices: ["SQL is faster to type","Production data lives in databases too large for a laptop's memory; SQL queries it in place","pandas is being deprecated","SQL produces prettier charts"],
      correct: 1, explain: "pandas operates on data already loaded into RAM. SQL runs against databases holding far more than a laptop could hold — the query runs on the server, returning only the result. That is most real-world data." },
    { q: "Which SQL feature finds the top 3 trips per borough — something awkward to do in pandas?",
      choices: ["A WHERE clause","A window function with ROW_NUMBER() OVER (PARTITION BY ...)","A LEFT JOIN","SELECT DISTINCT"],
      correct: 1, explain: "Window functions compute a ranking WITHIN each group without collapsing rows. ROW_NUMBER() OVER (PARTITION BY borough ORDER BY trips DESC) numbers rows per borough so you can filter to rn <= 3." }
  ],
  days: [
    D(1,"SQL is not Excel — the relational mental model","Tables, rows, columns, and declaring WHAT you want, not HOW.",[
      L("What SQL is and how it differs from pandas",
"## What it is\n" +
"**SQL (Structured Query Language)** is the language for querying **relational databases** — data organised into tables of rows and columns, with relationships between tables. You describe the result you want; the database engine figures out how to compute it.\n\n" +
"That last point is the key difference from pandas. pandas is **imperative** — you spell out each step (filter, then group, then sum). SQL is **declarative** — you state the shape of the answer and the engine plans the execution:\n\n" +
"```sql\n" +
"SELECT pickup_hour, COUNT(*) AS trips\n" +
"FROM taxi\n" +
"WHERE fare_amount > 0\n" +
"GROUP BY pickup_hour\n" +
"ORDER BY trips DESC;\n" +
"```\n\n" +
"## pandas → SQL, same shape, different verbs\n" +
"| pandas | SQL |\n" +
"|---|---|\n" +
"| `df[df.fare > 0]` | `WHERE fare > 0` |\n" +
"| `df.groupby('hour')` | `GROUP BY hour` |\n" +
"| `.sum()` / `.mean()` | `SUM()` / `AVG()` |\n" +
"| `.sort_values()` | `ORDER BY` |\n" +
"| `.head(5)` | `LIMIT 5` |\n\n" +
"## Why it matters\n" +
"Almost every DS interview includes a SQL question. You already know how to answer 'top 3 customers per region' in pandas — this week you learn to say the same thing in SQL, the language production data actually lives in."
      ),
      V("SQL in 100 Seconds","https://www.youtube.com/watch?v=zsjvFFKOm3c",2,"Fireship","The fastest orientation to what SQL is and why every data job uses it."),
      L("See it in code (with output)",
"## The same TaxiPulse question, in both languages\n" +
"```python\n" +
"# pandas (Week 1)\n" +
"df.groupby('pickup_hour').size().sort_values(ascending=False).head(3)\n" +
"# pickup_hour\n" +
"# 18    217843\n" +
"# 17    213654\n" +
"# 19    211022\n" +
"```\n\n" +
"```sql\n" +
"-- SQL (this week) — identical result\n" +
"SELECT pickup_hour, COUNT(*) AS trips\n" +
"FROM taxi\n" +
"GROUP BY pickup_hour\n" +
"ORDER BY trips DESC\n" +
"LIMIT 3;\n" +
"-- pickup_hour | trips\n" +
"-- 18          | 217843\n" +
"-- 17          | 213654\n" +
"-- 19          | 211022\n" +
"```\n" +
"Same answer, same shape of thinking. The verbs differ; the logic is the one you already learned."
      ),
      S([
        { prompt: "SQL is declarative — you describe the result you want, and the engine decides how to compute it.", answer: true, whenRight: "Right — you state the WHAT; the query planner handles the HOW. pandas is the opposite (imperative).", whenWrong: "SQL is declarative. You write the shape of the answer; the database engine plans the execution steps.", sim: "-- you write WHAT:\nSELECT hour, COUNT(*) FROM taxi GROUP BY hour;\n-- engine decides HOW to run it" },
        { prompt: "`GROUP BY` in SQL is the direct equivalent of `.groupby()` in pandas.", answer: true, whenRight: "Right — same operation, different verb. Pair it with an aggregate (COUNT, SUM, AVG) just like pandas.", whenWrong: "GROUP BY is the SQL twin of pandas .groupby(). Both collapse rows into one per group.", sim: "df.groupby('hour').size()\n# ==\nSELECT hour, COUNT(*) FROM t GROUP BY hour" },
        { prompt: "SQL can only query data that already fits in your laptop's RAM, just like pandas.", answer: false, whenRight: "Right — the opposite. SQL runs on the database server, querying data far larger than your RAM.", whenWrong: "That's pandas' limit, not SQL's. SQL runs server-side against datasets far bigger than a laptop holds." }
      ]),
      E("Your turn — map pandas to SQL","[WRITE] In a file `sql_notes.md`, write the SQL equivalent of each pandas operation (don't run them yet, just translate):\n1. `df[df['fare_amount'] > 50]`\n2. `df.groupby('pickup_dow')['tip_rate'].mean()`\n3. `df.sort_values('trip_distance', ascending=False).head(10)`\nCheck each against the pandas→SQL table in the lesson.")
    ]),
    D(2,"Load TaxiPulse data into SQL","Get a real table you can query — the foundation for the week.",[
      L("Databases, tables, and loading a CSV into SQLite",
"## What it is\n" +
"A **database** holds one or more **tables**. A table is exactly what you'd expect: named columns, typed values, many rows. To practise SQL you need real data in a real table.\n\n" +
"**SQLite** is the simplest possible database — a single file, no server to install. `sqliteonline.com` runs it in your browser, so you can import a CSV and start querying in two minutes. (The SQL you write here is the same SQL that runs on BigQuery, Postgres, and Snowflake — you learn the language once.)\n\n" +
"## Why a sample, not the full 3.2M rows\n" +
"Browser SQLite handles ~100k rows comfortably; 3.2 million would choke it. You export a 100k random sample from `clean.parquet` to CSV. A random sample preserves the distributions, so your query *answers* will closely match the full-data pandas results — close enough to verify correctness.\n\n" +
"## Where this fits\n" +
"Today you create the `taxi` table from a sample of your cleaned data. Every query the rest of the week runs against it. Tomorrow you'll confirm each SQL answer matches the pandas answer you already trust."
      ),
      L("See it in code (with output)",
"## Export a sample, then load it\n" +
"```python\n" +
"import pandas as pd\n" +
"df = pd.read_parquet('data/clean.parquet').sample(100_000, random_state=42)\n" +
"df.to_csv('data/taxi_sample.csv', index=False)\n" +
"print(df.shape)\n" +
"# (100000, 22)\n" +
"```\n\n" +
"```sql\n" +
"-- In sqliteonline.com: + -> Import -> CSV -> taxi_sample.csv -> table 'taxi'\n" +
"SELECT COUNT(*) FROM taxi;\n" +
"-- 100000\n\n" +
"SELECT * FROM taxi LIMIT 3;\n" +
"-- eyeball the columns: fare_amount, trip_distance, pickup_hour, ...\n" +
"```\n" +
"`SELECT COUNT(*)` is the SQL 'did it load?' check — the equivalent of `df.shape` after a read."
      ),
      S([
        { prompt: "A random 100k sample preserves the data's distributions, so SQL answers closely match full-data pandas answers.", answer: true, whenRight: "Right — random sampling keeps proportions intact, so averages and rankings stay close. Good enough to verify your SQL is correct.", whenWrong: "A random sample keeps the shape of the data. Means and top-N rankings will closely match the full dataset.", sim: "full mean fare: 16.42\n100k sample mean: ~16.4\n# close enough to verify" },
        { prompt: "The SQL you write in browser SQLite is fundamentally different from SQL on BigQuery or Postgres.", answer: false, whenRight: "Right — core SQL (SELECT/WHERE/GROUP BY/JOIN) is the same everywhere. You learn the language once.", whenWrong: "Core SQL is portable. SELECT, WHERE, GROUP BY, JOIN, window functions work the same across SQLite, Postgres, BigQuery." },
        { prompt: "`SELECT COUNT(*) FROM taxi;` is a good first check that your data loaded correctly.", answer: true, whenRight: "Right — it's the SQL equivalent of checking df.shape. Confirms the row count before you trust any query.", whenWrong: "COUNT(*) is the load check — it tells you how many rows made it in. Run it right after importing.", sim: "SELECT COUNT(*) FROM taxi;\n-- 100000  -> loaded correctly" }
      ]),
      E("Your turn — load the data","[CODE] 1. Export a 100k random sample of `data/clean.parquet` to `data/taxi_sample.csv` (random_state=42).\n2. Open sqliteonline.com, import the CSV as a table named `taxi`.\n3. Run `SELECT COUNT(*) FROM taxi;` — confirm 100000.\n4. Run `SELECT * FROM taxi LIMIT 5;` and note the column names you'll query this week.")
    ]),
    D(3,"SELECT, WHERE, GROUP BY","The three clauses that answer 80% of analytical questions.",[
      L("The core query — SELECT / WHERE / GROUP BY / ORDER BY",
"## What it is\n" +
"Four clauses, always in this order, answer most analytical questions:\n\n" +
"```sql\n" +
"SELECT   pickup_hour, COUNT(*) AS trips   -- which columns + aggregates\n" +
"FROM     taxi                             -- which table\n" +
"WHERE    fare_amount > 0                   -- filter rows BEFORE grouping\n" +
"GROUP BY pickup_hour                       -- collapse into one row per hour\n" +
"ORDER BY trips DESC                         -- sort the result\n" +
"LIMIT    5;                                 -- keep the top 5\n" +
"```\n\n" +
"## The execution order that trips people up\n" +
"You *write* SELECT first, but the engine *runs* it almost last. The logical order is: **FROM → WHERE → GROUP BY → SELECT → ORDER BY → LIMIT**. That's why you can't use a `SELECT` alias inside `WHERE` (the alias doesn't exist yet) but you can in `ORDER BY` (it does by then).\n\n" +
"## Aggregates\n" +
"`COUNT(*)`, `SUM(col)`, `AVG(col)`, `MIN(col)`, `MAX(col)` collapse a group into one number. Every non-aggregated column in SELECT must appear in GROUP BY — the engine needs to know how to fold the rest.\n\n" +
"## Where this fits\n" +
"Today you rewrite your Week 1 TaxiPulse findings (busiest hour, fare by day) as SQL, and confirm each result matches the pandas version. Matching answers = you've learned the translation."
      ),
      V("SQL SELECT, WHERE, GROUP BY explained","https://www.youtube.com/watch?v=H-dDf3of04s",10,"Socratica","Clear walkthrough of the core query clauses with real examples."),
      L("See it in code (with output)",
"## Answer Week 1 questions in SQL\n" +
"```sql\n" +
"-- Busiest hours (matches pandas Week 1)\n" +
"SELECT pickup_hour, COUNT(*) AS trips\n" +
"FROM taxi\n" +
"GROUP BY pickup_hour\n" +
"ORDER BY trips DESC\n" +
"LIMIT 5;\n" +
"-- 18 | 6189   17 | 6071   19 | 6004 ...  (per 100k sample)\n\n" +
"-- Average fare by day of week, weekdays only\n" +
"SELECT pickup_dow, ROUND(AVG(fare_amount), 2) AS avg_fare\n" +
"FROM taxi\n" +
"WHERE pickup_dow < 5\n" +
"GROUP BY pickup_dow\n" +
"ORDER BY avg_fare DESC;\n" +
"-- 4 | 16.51   3 | 16.40 ...\n" +
"```\n" +
"Note `WHERE pickup_dow < 5` filters rows *before* grouping — only weekdays enter the averages."
      ),
      S([
        { prompt: "WHERE filters rows BEFORE they are grouped by GROUP BY.", answer: true, whenRight: "Right — WHERE runs before GROUP BY in execution order. To filter AFTER aggregating, you use HAVING.", whenWrong: "WHERE filters pre-grouping. (HAVING filters post-aggregation.) Execution order: FROM, WHERE, GROUP BY, SELECT.", sim: "WHERE fare > 0      -- before grouping\nGROUP BY hour\nHAVING COUNT(*) > 5 -- after grouping" },
        { prompt: "Every non-aggregated column in SELECT must also appear in GROUP BY.", answer: true, whenRight: "Right — the engine needs to know how to fold the other columns. Aggregates (COUNT, AVG) are the exception.", whenWrong: "Any column you SELECT but don't aggregate must be in GROUP BY, or the engine can't collapse the rows.", sim: "SELECT borough, hour, COUNT(*)\nGROUP BY borough, hour  -- both non-aggregates listed" },
        { prompt: "`ORDER BY trips DESC` sorts the result with the largest trip count first.", answer: true, whenRight: "Right — DESC = descending (largest first). ASC (or omitting) sorts smallest first.", whenWrong: "DESC sorts high-to-low. Pair with LIMIT to get a 'top N' result.", sim: "ORDER BY trips DESC LIMIT 5\n-- top 5 busiest" }
      ]),
      E("Your turn — SELECT/WHERE/GROUP BY","[CODE] In `queries.sql`, write and run:\n1. Trips by pickup_hour, sorted busiest-first, top 5.\n2. Average fare by pickup_dow for weekends only (pickup_dow >= 5).\n3. Count of trips where tip_amount = 0 (cash trips with no recorded tip).\nFor each, add a `-- comment` and confirm the answer matches your pandas result from Weeks 1-3.")
    ]),
    D(4,"Joins — combining tables on a key","LEFT and INNER joins connect taxi trips to borough names.",[
      L("JOINs — the relational superpower",
"## What it is\n" +
"Real databases split data across tables to avoid repetition. Your `taxi` table has `PULocationID` (a number); a separate `zones` table maps each ID to a borough name. A **JOIN** stitches them together on the shared key:\n\n" +
"```sql\n" +
"SELECT z.Borough, COUNT(*) AS trips\n" +
"FROM taxi t\n" +
"LEFT JOIN zones z ON z.LocationID = t.PULocationID\n" +
"GROUP BY z.Borough;\n" +
"```\n\n" +
"## INNER vs LEFT — the difference that causes bugs\n" +
"- **INNER JOIN** keeps only rows that match in *both* tables. A trip with a `PULocationID` not in `zones` vanishes.\n" +
"- **LEFT JOIN** keeps *every* row from the left (taxi) table; unmatched rows get NULL for the zone columns.\n\n" +
"This matters: if you INNER JOIN and some location IDs are missing from your lookup, you silently lose trips and your counts come out wrong. LEFT JOIN surfaces the gap instead of hiding it (you'll see NULL boroughs).\n\n" +
"## Table aliases\n" +
"`taxi t` and `zones z` give short nicknames so you can write `t.PULocationID` and `z.Borough`. Standard practice in every real query.\n\n" +
"## Where this fits\n" +
"Today you join trips to zones to get the borough breakdown — the same analysis you did in pandas with `.merge()` in Week 3, now in SQL."
      ),
      L("See it in code (with output)",
"## Borough breakdown via JOIN\n" +
"```sql\n" +
"-- Import taxi_zone_lookup.csv as table 'zones' first\n" +
"SELECT z.Borough, COUNT(*) AS trips,\n" +
"       ROUND(AVG(t.fare_amount), 2) AS avg_fare\n" +
"FROM taxi t\n" +
"LEFT JOIN zones z ON z.LocationID = t.PULocationID\n" +
"GROUP BY z.Borough\n" +
"ORDER BY trips DESC;\n" +
"-- Borough    | trips | avg_fare\n" +
"-- Manhattan  | 71938 | 16.44\n" +
"-- Queens     | 17404 | 22.24\n" +
"-- Brooklyn   |  9488 | 14.87\n" +
"-- (NULL)     |   210 | 13.10   <- IDs missing from the lookup\n" +
"```\n" +
"That `(NULL)` row is the LEFT JOIN earning its keep — it shows you trips whose location wasn't in the lookup. An INNER JOIN would have silently dropped them."
      ),
      S([
        { prompt: "An INNER JOIN keeps only rows that have a match in BOTH tables.", answer: true, whenRight: "Right — unmatched rows from either side are dropped. Use it when you only want confirmed matches.", whenWrong: "INNER = intersection. Rows without a match on either side disappear. LEFT keeps all left-table rows.", sim: "taxi INNER JOIN zones\n# trips with no matching zone: dropped" },
        { prompt: "A LEFT JOIN can silently drop rows from the taxi table when a location ID is missing from zones.", answer: false, whenRight: "Right — LEFT JOIN KEEPS all taxi rows; missing matches become NULL. It's INNER JOIN that drops them.", whenWrong: "LEFT JOIN never drops left-table rows — that's its purpose. Unmatched rows get NULL columns, visible to you.", sim: "LEFT JOIN: trip kept, Borough = NULL\nINNER JOIN: trip dropped entirely" },
        { prompt: "Table aliases like `taxi t` let you write `t.column` instead of the full table name.", answer: true, whenRight: "Right — a nickname that keeps multi-table queries readable. Standard in every real-world query.", whenWrong: "Aliases are shorthand: `FROM taxi t` lets you say `t.fare_amount`. Essential once you join two+ tables." }
      ]),
      E("Your turn — joins","[CODE] In `queries.sql`:\n1. Import `taxi_zone_lookup.csv` as a table `zones`.\n2. LEFT JOIN taxi to zones to get trips + avg_fare per Borough, sorted by trips.\n3. Run the same query with INNER JOIN. How many rows differ? What happened to the unmatched trips?\n4. Add a comment explaining which join you'd use for a revenue report and why.")
    ]),
    D(5,"Window functions — ranking within groups","ROW_NUMBER() does what pandas can't do cleanly: top-N per group.",[
      L("Window functions — compute across rows without collapsing them",
"## What it is\n" +
"A **window function** computes a value across a set of rows **related to the current row**, without collapsing them into one. Unlike GROUP BY (which folds many rows into one), a window function adds a computed column while keeping every row.\n\n" +
"```sql\n" +
"ROW_NUMBER() OVER (PARTITION BY borough ORDER BY trips DESC) AS rn\n" +
"```\n\n" +
"Read it right to left:\n" +
"- **PARTITION BY borough** — restart the numbering for each borough\n" +
"- **ORDER BY trips DESC** — within a borough, rank busiest first\n" +
"- **ROW_NUMBER()** — assign 1, 2, 3, … in that order\n\n" +
"## Why it matters — the 'top N per group' problem\n" +
"'Top 3 busiest hours *per borough*' is genuinely awkward in pandas (groupby + apply + nlargest gymnastics). In SQL it's one window function: number the rows per borough, then filter to `rn <= 3`. This is a classic interview question precisely because window functions are the clean answer.\n\n" +
"## Other window functions\n" +
"`RANK()` (ties share a rank, leaving gaps), `DENSE_RANK()` (ties share, no gaps), `SUM(...) OVER (...)` (running totals), `LAG()`/`LEAD()` (previous/next row — great for month-over-month change).\n\n" +
"## Where this fits\n" +
"Today you answer 'top 3 hours per borough' — a question that shows off exactly the SQL skill interviewers probe for."
      ),
      L("See it in code (with output)",
"## Top 3 busiest hours per borough\n" +
"```sql\n" +
"SELECT * FROM (\n" +
"  SELECT z.Borough, t.pickup_hour, COUNT(*) AS trips,\n" +
"         ROW_NUMBER() OVER (\n" +
"           PARTITION BY z.Borough ORDER BY COUNT(*) DESC\n" +
"         ) AS rn\n" +
"  FROM taxi t\n" +
"  LEFT JOIN zones z ON z.LocationID = t.PULocationID\n" +
"  GROUP BY z.Borough, t.pickup_hour\n" +
")\n" +
"WHERE rn <= 3;\n" +
"-- Borough   | pickup_hour | trips | rn\n" +
"-- Manhattan | 18          | 4821  | 1\n" +
"-- Manhattan | 17          | 4760  | 2\n" +
"-- Manhattan | 19          | 4655  | 3\n" +
"-- Queens    | 15          | 1102  | 1   <- airport afternoon peak, different!\n" +
"-- Queens    | 14          | 1071  | 2\n" +
"```\n" +
"Queens peaks in the afternoon (airport arrivals), Manhattan in the evening. The window function surfaced a per-borough pattern that a global 'busiest hour' would have hidden."
      ),
      S([
        { prompt: "A window function adds a computed column while keeping every original row (unlike GROUP BY).", answer: true, whenRight: "Right — GROUP BY collapses; a window function annotates. Every row survives, with a new ranking/total alongside.", whenWrong: "Window functions don't collapse rows. They compute across a 'window' of rows but return one value per row.", sim: "GROUP BY: 100 rows -> 5 rows\nWINDOW:   100 rows -> 100 rows + rank col" },
        { prompt: "`PARTITION BY borough` restarts the row numbering separately for each borough.", answer: true, whenRight: "Right — PARTITION BY is like GROUP BY for the window: numbering resets at each new borough.", whenWrong: "PARTITION BY defines the window's groups. ROW_NUMBER() restarts at 1 for each partition.", sim: "Manhattan: 1,2,3...\nQueens:    1,2,3...  <- restarted" },
        { prompt: "Finding the top 3 rows per group is easier in pandas than with a SQL window function.", answer: false, whenRight: "Right — it's the reverse. SQL's ROW_NUMBER + filter is the clean way; pandas needs groupby+apply gymnastics.", whenWrong: "Top-N-per-group is where window functions shine and pandas gets awkward. SQL wins here decisively." }
      ]),
      E("Your turn — window functions","[CODE] In `queries.sql`:\n1. Write a query using ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...) to find the top 3 busiest pickup_hours per Borough.\n2. Wrap it in an outer query filtering to rn <= 3.\n3. In a comment, note one borough whose peak hour differs from Manhattan's — and your hypothesis for why.")
    ]),
    D(6,"CTEs — readable multi-step queries","WITH clauses break a complex query into named, legible steps.",[
      L("Common Table Expressions (CTEs) — name your intermediate steps",
"## What it is\n" +
"A **CTE (Common Table Expression)** is a named temporary result you define with `WITH`, then reference like a table. It turns a tangled nested query into readable, sequential steps:\n\n" +
"```sql\n" +
"WITH busy AS (\n" +
"  SELECT pickup_hour, COUNT(*) AS trips\n" +
"  FROM taxi GROUP BY pickup_hour\n" +
"),\n" +
"avg_busy AS (\n" +
"  SELECT AVG(trips) AS avg_trips FROM busy\n" +
")\n" +
"SELECT b.pickup_hour, b.trips,\n" +
"       ROUND(100.0 * (b.trips - a.avg_trips) / a.avg_trips, 1) AS pct_vs_avg\n" +
"FROM busy b CROSS JOIN avg_busy a\n" +
"ORDER BY pct_vs_avg DESC;\n" +
"```\n\n" +
"## Why it matters — readability is correctness\n" +
"The alternative to a CTE is nesting subqueries inside subqueries — quickly unreadable, and unreadable queries hide bugs. A CTE reads top-to-bottom like a recipe: 'first compute `busy`, then `avg_busy`, then compare them.' Each step is named, testable, and reusable within the query.\n\n" +
"On a team, the query someone else can read and modify six months later is the correct one, even if a clever nested version is shorter.\n\n" +
"## Where this fits\n" +
"Today you express 'how does each hour compare to the average hour?' as a clean two-CTE query — a multi-step calculation that would be ugly nested."
      ),
      L("See it in code (with output)",
"## Each hour vs the average hour\n" +
"```sql\n" +
"WITH busy AS (\n" +
"  SELECT pickup_hour, COUNT(*) AS trips\n" +
"  FROM taxi GROUP BY pickup_hour\n" +
"),\n" +
"avg_busy AS (\n" +
"  SELECT AVG(trips) AS avg_trips FROM busy\n" +
")\n" +
"SELECT b.pickup_hour, b.trips,\n" +
"       ROUND(100.0 * (b.trips - a.avg_trips) / a.avg_trips, 1) AS pct_vs_avg\n" +
"FROM busy b CROSS JOIN avg_busy a\n" +
"ORDER BY pct_vs_avg DESC;\n" +
"-- pickup_hour | trips | pct_vs_avg\n" +
"-- 18          | 6189  | +48.6\n" +
"-- 17          | 6071  | +45.8\n" +
"-- 4           | 612   | -85.3   <- 4am is 85% below the average hour\n" +
"```\n" +
"Reads like a recipe: compute per-hour counts (`busy`), compute their average (`avg_busy`), then express each hour as a % deviation. Try writing that nested — it gets ugly fast."
      ),
      S([
        { prompt: "A CTE (WITH clause) lets you name an intermediate result and reference it later in the same query.", answer: true, whenRight: "Right — WITH name AS (...) defines a named step you can SELECT from, like a temporary table.", whenWrong: "That's exactly a CTE: a named, reusable intermediate result defined with WITH at the top of the query.", sim: "WITH busy AS (...)\nSELECT * FROM busy  -- reference it" },
        { prompt: "CTEs mainly exist to make queries run faster than the equivalent nested subqueries.", answer: false, whenRight: "Right — their main value is READABILITY, not speed. Most engines optimise both similarly.", whenWrong: "CTEs are about readability and maintainability, not performance. They make multi-step logic legible." },
        { prompt: "You can define multiple CTEs in one query, separated by commas, each able to reference earlier ones.", answer: true, whenRight: "Right — chain them: WITH a AS (...), b AS (... from a ...). Each step builds on the last.", whenWrong: "You can chain CTEs with commas, and later ones can reference earlier ones — a clean pipeline of steps.", sim: "WITH a AS (...),\n     b AS (SELECT ... FROM a)\nSELECT ... FROM b" }
      ]),
      E("Your turn — CTEs","[CODE] In `queries.sql`, write a query using at least two CTEs that answers: 'Which borough's average fare is furthest above the city-wide average fare, in percent?'\n1. CTE 1: average fare per borough (join to zones).\n2. CTE 2: the city-wide average fare.\n3. Final SELECT: each borough's % deviation, sorted descending. Comment each step.")
    ]),
    D(7,"Save 10 queries + push","Ship the SQL version of TaxiPulse as a portfolio artifact.",[
      L("Packaging a query file as a deliverable",
"## What it is\n" +
"A `queries.sql` file with 10 well-commented queries that reproduce your TaxiPulse analysis is a genuine portfolio artifact. Recruiters filter for SQL; a clean query file that demonstrably matches your pandas results is concrete proof you have the skill.\n\n" +
"## What makes a query file professional\n" +
"1. **Every query has a comment** stating the business question it answers\n" +
"2. **Queries are ordered** simple → complex (SELECT/WHERE/GROUP BY first, then JOINs, then window functions and CTEs)\n" +
"3. **Results are verified** against your pandas equivalents — same answer, two languages\n" +
"4. At least **one window function and one CTE** appear, proving you're past beginner SQL\n\n" +
"## Why it matters\n" +
"'I know SQL' is a claim. A public `queries.sql` that answers real questions on real data — and whose answers you can show match your pandas notebooks — is evidence. Evidence is what gets you past the screening round.\n\n" +
"## Where this fits\n" +
"Today you assemble the 10 queries from this week into one committed, commented file and push it. The SQL version of TaxiPulse is now part of the repo recruiters will read."
      ),
      S([
        { prompt: "A queries.sql file where each query has a comment stating its business question is more valuable than bare queries.", answer: true, whenRight: "Right — the comment turns a query into a documented answer a reviewer can follow without reverse-engineering it.", whenWrong: "Comments make the file readable and reviewable. A bare query forces the reader to reverse-engineer intent." },
        { prompt: "Verifying that your SQL answers match your pandas answers is a waste of time once the query runs without errors.", answer: false, whenRight: "Right — running without error is NOT the same as correct. A wrong JOIN runs fine but gives wrong numbers. Verify against pandas.", whenWrong: "A query can run cleanly and still be wrong (e.g. an INNER JOIN that drops rows). Cross-checking pandas catches that." },
        { prompt: "Including at least one window function and one CTE signals you're past beginner SQL.", answer: true, whenRight: "Right — those two features are the line between 'can SELECT' and 'can actually query'. Interviewers look for them.", whenWrong: "Window functions and CTEs are the intermediate-skill markers. Demonstrating both shows real fluency." }
      ]),
      E("Your turn — ship the SQL version","[PRODUCE] Assemble `queries.sql` with 10 commented queries reproducing your TaxiPulse analysis. Then:\n`git add queries.sql data/taxi_zone_lookup.csv`\n`git commit -m 'SQL version of TaxiPulse analysis'`\n`git push`\n\nPASS:\n[x] 10 commented queries in queries.sql\n[x] Each result verified against its pandas equivalent\n[x] At least 1 window function used\n[x] At least 1 CTE used\n[x] Pushed to GitHub")
    ])
  ]
};

/* ── WEEK 5 — TaxiPulse v0.3: Predict the fare ────────────── */
const W5 = {
  number: 5, title: "TaxiPulse v0.3: Predict the fare",
  phase: "Foundations", commitment_hours: "12-18",
  context: ds.weeks[4].context,
  concept_check: [
    { q: "What is the core difference between regression and classification?",
      choices: ["Regression uses more data","Regression predicts a continuous number (a fare); classification predicts a category (a label)","Regression is always more accurate","Classification cannot use sklearn"],
      correct: 1, explain: "Regression outputs a continuous value — a fare of $14.32. Classification outputs a discrete label — 'will tip' vs 'won't tip'. Predicting the fare amount is a regression problem." },
    { q: "Why split data into train and test sets before fitting a model?",
      choices: ["To make training faster","To measure performance on data the model has never seen — the only honest estimate of real-world accuracy","Because sklearn requires it","To reduce the file size"],
      correct: 1, explain: "A model can memorise the data it trained on, scoring perfectly there while failing on new data (overfitting). Holding out a test set the model never sees is the only honest measure of how it will perform in production." },
    { q: "Your linear model has MAE $4.20; the 'always predict the mean' baseline has MAE $8.00. What does this tell you?",
      choices: ["The model is broken","The model learned real signal — it roughly halves the average error vs guessing the mean","MAE is meaningless","The model overfit"],
      correct: 1, explain: "The baseline (always guess the average fare) is the bar any model must beat. MAE $4.20 vs $8.00 means the model's predictions are about twice as close to reality as guessing — it learned a real relationship between the features and fare." }
  ],
  days: [
    D(1,"Regression vs classification — and the ML workflow","The describe-to-predict leap, and the workflow every model follows.",[
      L("Supervised learning: regression, classification, and the train/test split",
"## What it is\n" +
"**Supervised learning** trains a model on examples where you know the answer (the 'label'), so it can predict the answer for new examples. Two flavours:\n\n" +
"- **Regression** — predict a continuous *number*. 'What will this trip's fare be?' → $14.32\n" +
"- **Classification** — predict a discrete *category*. 'Will this rider tip?' → yes/no\n\n" +
"This week is regression: predict `fare_amount` from `trip_distance`, `trip_minutes`, and `pickup_hour`.\n\n" +
"## The workflow that never changes\n" +
"Every supervised model follows the same five steps:\n" +
"```text\n" +
"1. SPLIT   data into train (80%) and test (20%)\n" +
"2. FIT     the model on the training set only\n" +
"3. PREDICT on the test set\n" +
"4. EVALUATE predictions vs the true answers (MAE, R2)\n" +
"5. INSPECT where it fails (residuals)\n" +
"```\n\n" +
"## Why the split is sacred\n" +
"If you evaluate on the same data you trained on, the model can simply memorise it and look perfect — while failing on real new trips. That's **overfitting**. The held-out test set is the only honest estimate of real-world performance. Never let test data touch training.\n\n" +
"## Where this fits\n" +
"This week TaxiPulse stops describing and starts predicting. By Sunday: a trained fare model with MAE under $5 and an honest residual analysis showing exactly where it's wrong."
      ),
      V("Machine Learning Fundamentals: Bias and Variance / overfitting","https://www.youtube.com/watch?v=EuBBz3bI-aA",7,"StatQuest","Why the train/test split exists, and what overfitting actually looks like."),
      L("See it in code (with output)",
"## The describe vs predict distinction, in one screen\n" +
"```python\n" +
"# DESCRIBE (Weeks 1-4): what happened?\n" +
"df['fare_amount'].mean()\n" +
"# 16.42  — a summary of the past\n\n" +
"# PREDICT (this week): what WILL this trip cost?\n" +
"from sklearn.linear_model import LinearRegression\n" +
"model.predict([[2.3, 11, 18]])   # distance, minutes, hour\n" +
"# array([14.07])  — an estimate for a trip that hasn't happened\n" +
"```\n" +
"Same data, a fundamentally different question. Everything from here is variations on 'train a model to predict something.'"
      ),
      S([
        { prompt: "Predicting a trip's fare amount (a dollar value) is a regression problem, not classification.", answer: true, whenRight: "Right — a continuous number = regression. A category (tip / no-tip) would be classification.", whenWrong: "Fare is a continuous number, so it's regression. Classification predicts discrete labels.", sim: "fare = $14.32   -> regression\n'will tip?' yes/no -> classification" },
        { prompt: "It's fine to evaluate your model on the same data you trained it on, as long as you have a lot of data.", answer: false, whenRight: "Right — never. The model can memorise training data and look perfect while failing on new trips. Always hold out a test set.", whenWrong: "Evaluating on training data hides overfitting. The model may have memorised it. You need unseen test data for an honest score.", sim: "train on 80% -> fit\ntest on held-out 20% -> honest MAE" },
        { prompt: "Overfitting is when a model performs great on training data but poorly on new, unseen data.", answer: true, whenRight: "Right — it memorised the training set instead of learning the general pattern. The test set exposes it.", whenWrong: "That's the definition of overfitting: low training error, high test error. The model memorised rather than generalised." }
      ]),
      E("Your turn — frame the problem","[WRITE] In a markdown cell at the top of a new notebook `07-fare-model.ipynb`, write:\n1. Is predicting fare a regression or classification problem? Why?\n2. Which 3 columns will you use as features, and which is the target?\n3. In one sentence, why must the test set stay separate from training?")
    ]),
    D(2,"Build the training data","Features, target, and the train_test_split.",[
      L("Preparing X and y, and splitting honestly",
"## What it is\n" +
"sklearn expects two objects:\n" +
"- **X** — the feature matrix: the columns the model learns *from* (distance, minutes, hour)\n" +
"- **y** — the target vector: the column you're predicting (fare_amount)\n\n" +
"```python\n" +
"y = df['fare_amount']\n" +
"X = df[['trip_distance', 'trip_minutes', 'pickup_hour']]\n" +
"```\n\n" +
"## Avoiding leakage\n" +
"A **leaky feature** is one that secretly contains the answer. `total_amount` (which includes the fare) would let the model 'predict' fare by basically reading it — perfect score in training, useless in production where you don't yet know the total. Drop anything that wouldn't be known *before* the trip's fare is set.\n\n" +
"## The split\n" +
"```python\n" +
"from sklearn.model_selection import train_test_split\n" +
"X_train, X_test, y_train, y_test = train_test_split(\n" +
"    X, y, test_size=0.2, random_state=42)\n" +
"```\n" +
"`test_size=0.2` holds out 20% for honest evaluation. `random_state=42` makes the split reproducible — you and a reviewer get the identical partition.\n\n" +
"## Where this fits\n" +
"Today you build X, y, and the four split objects. Tomorrow you fit the model on the training half only."
      ),
      L("See it in code (with output)",
"## Build training data for the fare model\n" +
"```python\n" +
"import pandas as pd\n" +
"from sklearn.model_selection import train_test_split\n\n" +
"df = pd.read_parquet('data/clean.parquet')\n" +
"df = df.dropna(subset=['fare_amount','trip_distance','trip_minutes'])\n\n" +
"y = df['fare_amount']\n" +
"X = df[['trip_distance', 'trip_minutes', 'pickup_hour']]\n\n" +
"X_train, X_test, y_train, y_test = train_test_split(\n" +
"    X, y, test_size=0.2, random_state=42)\n\n" +
"print(X_train.shape, X_test.shape)\n" +
"# (2565956, 3) (641490, 3)\n" +
"print('Train fare mean:', round(y_train.mean(), 2))\n" +
"print('Test  fare mean:', round(y_test.mean(), 2))\n" +
"# Train fare mean: 16.42\n" +
"# Test  fare mean: 16.41   <- splits are representative\n" +
"```\n" +
"The near-identical train/test means confirm the random split didn't accidentally bias one side."
      ),
      S([
        { prompt: "X is the feature matrix (what the model learns from); y is the target (what it predicts).", answer: true, whenRight: "Right — X = inputs (distance, minutes, hour), y = output (fare). The model learns the mapping X -> y.", whenWrong: "X holds the features the model reads; y is the answer it predicts. Convention across all of sklearn.", sim: "X = df[['distance','minutes','hour']]\ny = df['fare_amount']" },
        { prompt: "Including `total_amount` (which contains the fare) as a feature would cause data leakage.", answer: true, whenRight: "Right — it secretly contains the answer. The model would 'cheat' in training and fail in production.", whenWrong: "That's leakage: total_amount includes the fare. The model reads the answer instead of learning it. Drop it.", sim: "# LEAKY: total_amount = fare + tip + tolls\n# model just subtracts -> fake accuracy" },
        { prompt: "`random_state=42` in train_test_split makes the split reproducible across runs and machines.", answer: true, whenRight: "Right — fixing the seed gives you and any reviewer the identical partition every time.", whenWrong: "random_state pins the random seed, so the split is reproducible. Essential for comparable results.", sim: "random_state=42\n# same split every run, every machine" }
      ]),
      E("Your turn — build the split","[CODE] In `07-fare-model.ipynb`:\n1. Load clean.parquet, drop nulls in fare_amount/trip_distance/trip_minutes.\n2. Build y = fare_amount and X = [trip_distance, trip_minutes, pickup_hour].\n3. train_test_split with test_size=0.2, random_state=42.\n4. Print the train/test shapes and confirm the train and test fare means are close (representative split).")
    ]),
    D(3,"Train linear regression","Fit, predict, and read MAE + R2.",[
      L("Fitting your first model and reading the metrics",
"## What it is\n" +
"Three lines train a linear regression — the same Normal Equation you derived by hand in Week 2, now handed to sklearn:\n\n" +
"```python\n" +
"from sklearn.linear_model import LinearRegression\n" +
"model = LinearRegression()\n" +
"model.fit(X_train, y_train)        # learn the weights\n" +
"pred = model.predict(X_test)       # predict held-out trips\n" +
"```\n\n" +
"## Two metrics to read\n" +
"- **MAE (Mean Absolute Error)** — the average dollars your prediction is off by. MAE $4.20 means 'on average, my fare estimate is $4.20 from the truth.' Same units as the target, so it's directly interpretable.\n" +
"- **R² (R-squared)** — the fraction of fare variance the model explains, 0 to 1. R² 0.85 means the features account for 85% of why fares differ.\n\n" +
"## Always compare to a baseline\n" +
"A metric alone is meaningless — meaningful *relative to what?* The baseline is 'always predict the mean fare'. If that baseline has MAE $8 and your model has MAE $4.20, the model halved the error: it learned something real. A model that can't beat the mean has learned nothing.\n\n" +
"## Where this fits\n" +
"Today you fit the model, predict on the test set, and read MAE + R² — your first honest measurement of a model you built."
      ),
      V("Linear Regression, clearly explained","https://www.youtube.com/watch?v=nk2CQITm_eo",10,"StatQuest","What fitting a line actually optimises, and how to read R-squared."),
      L("See it in code (with output)",
"## Fit and evaluate\n" +
"```python\n" +
"from sklearn.linear_model import LinearRegression\n" +
"from sklearn.metrics import mean_absolute_error, r2_score\n" +
"import numpy as np\n\n" +
"model = LinearRegression()\n" +
"model.fit(X_train, y_train)\n" +
"pred = model.predict(X_test)\n\n" +
"mae = mean_absolute_error(y_test, pred)\n" +
"r2  = r2_score(y_test, pred)\n" +
"print(f'MAE: ${mae:.2f}')\n" +
"print(f'R2:  {r2:.3f}')\n" +
"# MAE: $3.98\n" +
"# R2:  0.842\n\n" +
"# Baseline: always predict the mean\n" +
"baseline_mae = mean_absolute_error(y_test, np.full(len(y_test), y_train.mean()))\n" +
"print(f'Baseline MAE: ${baseline_mae:.2f}')\n" +
"# Baseline MAE: $8.01  <- model nearly halves it\n" +
"```\n" +
"MAE $3.98 vs baseline $8.01: the model's fare estimates are about twice as close to reality as guessing the average. R² 0.842: the three features explain 84% of fare variation."
      ),
      S([
        { prompt: "MAE is in the same units as the target — an MAE of $3.98 means predictions are off by ~$3.98 on average.", answer: true, whenRight: "Right — that direct interpretability is why MAE is a favourite. $3.98 = average dollars of error.", whenWrong: "MAE is in the target's units (dollars here). $3.98 means your fare estimate is, on average, $3.98 from the truth.", sim: "MAE = $3.98\n# avg prediction error = $3.98" },
        { prompt: "An R-squared of 0.842 means the model's features explain about 84% of the variation in fare.", answer: true, whenRight: "Right — R2 is the fraction of target variance explained. 0.842 = 84.2%.", whenWrong: "R2 = fraction of variance explained. 0.842 means the features account for ~84% of why fares differ.", sim: "R2 = 0.842\n# 84.2% of fare variance explained" },
        { prompt: "A model's MAE is meaningful on its own, without comparing it to any baseline.", answer: false, whenRight: "Right — meaningful relative to WHAT? Always compare to the 'predict the mean' baseline to know if you learned anything.", whenWrong: "MAE needs a reference. $4 sounds fine — but if the mean-baseline is also $4, your model learned nothing. Always compare." }
      ]),
      E("Your turn — train linear regression","[CODE] In `07-fare-model.ipynb`:\n1. Fit a LinearRegression on X_train, y_train.\n2. Predict on X_test, print MAE and R2.\n3. Compute the baseline MAE (always predict y_train.mean()).\n4. Markdown: state your MAE, R2, and how much you beat the baseline by. Did you hit MAE < $5?")
    ]),
    D(4,"Interpret the coefficients","A model you can't explain is a model you can't trust.",[
      L("Reading regression coefficients as dollars",
"## What it is\n" +
"A fitted linear regression gives you one **coefficient** per feature. Each is the marginal effect: how much the prediction changes per one-unit increase in that feature, holding the others fixed.\n\n" +
"```python\n" +
"for col, coef in zip(X.columns, model.coef_):\n" +
"    print(f'{col}: {coef:.3f}')\n" +
"# trip_distance: 2.78    -> each mile adds $2.78\n" +
"# trip_minutes:  0.31    -> each minute adds $0.31\n" +
"# pickup_hour:  -0.02    -> hour barely matters (treated as linear)\n" +
"```\n\n" +
"## Why interpretation matters\n" +
"A model that predicts well but that you can't explain is a liability. Interpreting coefficients lets you (a) **sanity-check** against reality and (b) **explain the model to a stakeholder** who'll never read your code.\n\n" +
"The sanity check here is powerful: NYC's actual yellow-cab rate is ~$3.00/mile plus ~$0.70/minute in slow traffic. Your model learned ~$2.78/mile from data alone, with no knowledge of the rate card. When a model independently rediscovers a real-world rule, that's strong evidence it learned genuine structure, not noise.\n\n" +
"## The pickup_hour caveat\n" +
"Linear regression treats `pickup_hour` as a continuous number, so its tiny coefficient doesn't mean 'hour is irrelevant' — it means hour's effect isn't *linear* (hour 23 isn't '23x' anything). A tree model (tomorrow) handles that better.\n\n" +
"## Where this fits\n" +
"Today you extract and interpret each coefficient, then compare to the official NYC taxi rate."
      ),
      L("See it in code (with output)",
"## Interpret the model\n" +
"```python\n" +
"print(f'Intercept (base fare): ${model.intercept_:.2f}')\n" +
"for col, coef in zip(X.columns, model.coef_):\n" +
"    print(f'  {col}: ${coef:.3f} per unit')\n" +
"# Intercept (base fare): $4.81\n" +
"#   trip_distance: $2.78 per mile\n" +
"#   trip_minutes:  $0.31 per minute\n" +
"#   pickup_hour:  -$0.02 per hour\n\n" +
"# Real NYC rate card: $3.00 base + $0.70/mile (+ time in traffic)\n" +
"# Model's $4.81 base + $2.78/mile is the same SHAPE, learned from data\n" +
"```\n" +
"The model reconstructed the meter's logic — a base fare plus a per-mile rate — without ever being told the rules. That's the model earning your trust."
      ),
      S([
        { prompt: "A linear regression coefficient of 2.78 on trip_distance means each extra mile adds ~$2.78 to the predicted fare.", answer: true, whenRight: "Right — a coefficient is the marginal effect: per one-unit increase in that feature, holding others fixed.", whenWrong: "That's the interpretation: +1 mile -> +$2.78 predicted, all else equal. Coefficients are marginal effects.", sim: "coef(distance) = 2.78\n# +1 mile -> +$2.78 fare" },
        { prompt: "A model that predicts accurately but can't be explained is just as good as one you can interpret.", answer: false, whenRight: "Right — an unexplainable model is a liability. You can't sanity-check it or defend it to a stakeholder.", whenWrong: "Interpretability matters. You must be able to sanity-check the model and explain it to non-coders. A black box you can't defend is risky." },
        { prompt: "The model learning ~$2.78/mile, close to NYC's real ~$3.00/mile rate, is evidence it captured genuine structure.", answer: true, whenRight: "Right — independently rediscovering a real-world rule is strong evidence the model learned signal, not noise.", whenWrong: "When a model reconstructs a known real rule from data alone, that's a powerful sign it learned true structure." }
      ]),
      E("Your turn — interpret coefficients","[CODE] In `07-fare-model.ipynb`:\n1. Print the intercept and each feature's coefficient.\n2. In a markdown cell: 'Each mile adds $X, each minute adds $Y, hour adds/subtracts $Z.'\n3. Look up the official NYC yellow-cab base fare and per-mile rate. Is your model consistent with it?\n4. Explain in one sentence why pickup_hour's coefficient is near zero (hint: linearity).")
    ]),
    D(5,"Try gradient boosting (XGBoost)","A stronger model — and the accuracy-vs-interpretability trade-off.",[
      L("Gradient boosting and the accuracy/explainability trade-off",
"## What it is\n" +
"**XGBoost** is a gradient-boosted tree model — the workhorse of tabular ML and most Kaggle winners. Instead of fitting one straight line, it builds many small decision trees, each correcting the previous one's errors. This lets it capture **non-linear** patterns and **interactions** a linear model can't — like 'hour matters, but only for airport trips.'\n\n" +
"```python\n" +
"from xgboost import XGBRegressor\n" +
"model2 = XGBRegressor(n_estimators=100, max_depth=5)\n" +
"model2.fit(X_train, y_train)\n" +
"```\n\n" +
"## The trade-off you'll navigate forever\n" +
"XGBoost will almost always beat linear regression on accuracy. But you lose easy interpretability: there's no single '$2.78 per mile' coefficient — the prediction emerges from 100 interacting trees. So:\n\n" +
"- **Linear regression**: lower accuracy, total transparency. Great when you must *explain*.\n" +
"- **XGBoost**: higher accuracy, opaque. Great when you must *predict well* and can tolerate a black box.\n\n" +
"This **accuracy vs explainability** tension is real and permanent. A bank rejecting a loan must explain why (favours linear/interpretable). A system bidding on ad impressions just needs to be right (favours XGBoost). Choosing deliberately is the skill.\n\n" +
"## Where this fits\n" +
"Today you train XGBoost, compare its MAE to the linear model, and decide which one v0.3 ships with — and why."
      ),
      V("Gradient Boost, clearly explained","https://www.youtube.com/watch?v=3CC4N4z3GJc",12,"StatQuest","How boosting builds trees that fix each other's mistakes."),
      L("See it in code (with output)",
"## Linear vs XGBoost, head to head\n" +
"```python\n" +
"from xgboost import XGBRegressor\n" +
"from sklearn.metrics import mean_absolute_error\n\n" +
"model2 = XGBRegressor(n_estimators=100, max_depth=5, random_state=42)\n" +
"model2.fit(X_train, y_train)\n" +
"mae_xgb = mean_absolute_error(y_test, model2.predict(X_test))\n\n" +
"print(f'Linear  MAE: $3.98')\n" +
"print(f'XGBoost MAE: ${mae_xgb:.2f}')\n" +
"# Linear  MAE: $3.98\n" +
"# XGBoost MAE: $3.12   <- 22% lower error\n\n" +
"# Feature importance (XGBoost's version of 'coefficients')\n" +
"for col, imp in zip(X.columns, model2.feature_importances_):\n" +
"    print(f'  {col}: {imp:.2f}')\n" +
"#   trip_distance: 0.71   trip_minutes: 0.26   pickup_hour: 0.03\n" +
"```\n" +
"XGBoost cut MAE from $3.98 to $3.12 by capturing non-linear structure. The cost: 'feature importance' tells you distance matters most, but not a clean '$X per mile' you can quote to a regulator."
      ),
      S([
        { prompt: "XGBoost can capture non-linear patterns and feature interactions that a single linear regression cannot.", answer: true, whenRight: "Right — many trees model curves and 'X matters only when Y' interactions a straight line misses.", whenWrong: "That's its strength: boosted trees fit non-linearities and interactions linear regression can't represent.", sim: "linear: one straight line\nXGBoost: 100 trees -> curves + interactions" },
        { prompt: "XGBoost gives you the same clean, single coefficient per feature that linear regression does.", answer: false, whenRight: "Right — it doesn't. You get 'feature importance' (relative), not an interpretable '$2.78/mile' coefficient.", whenWrong: "XGBoost has no single coefficient — the prediction comes from 100 interacting trees. You trade interpretability for accuracy.", sim: "linear:  $2.78 per mile (explainable)\nXGBoost: distance importance 0.71 (relative)" },
        { prompt: "A loan-approval system that must legally explain each decision favours an interpretable model over a black box.", answer: true, whenRight: "Right — regulation requires explainability, so a transparent model (or explainability tooling) is needed despite lower accuracy.", whenWrong: "When you must explain every decision (lending, hiring), interpretability outweighs raw accuracy. That drives model choice." }
      ]),
      E("Your turn — train XGBoost","[CODE] In `07-fare-model.ipynb`:\n1. Train an XGBRegressor (n_estimators=100, max_depth=5, random_state=42).\n2. Print its test MAE next to the linear model's MAE.\n3. Print feature_importances_.\n4. Markdown: which model is more accurate? Which would you ship if you had to explain every prediction to a regulator? State your choice for v0.3 and why.")
    ]),
    D(6,"Plot residuals — where the model fails","The 'where it's wrong' analysis that separates real ML from a tutorial.",[
      L("Residual analysis — diagnosing your model honestly",
"## What it is\n" +
"A **residual** is the error on one prediction: `actual - predicted`. Plotting residuals against the actual fare reveals *where* and *how* the model is wrong — information a single MAE number hides.\n\n" +
"```python\n" +
"resid = y_test - model.predict(X_test)\n" +
"plt.scatter(y_test, resid, alpha=0.05)\n" +
"plt.axhline(0, color='red')\n" +
"```\n\n" +
"## What to look for\n" +
"- **Symmetric around 0** — good. The model over- and under-predicts equally; errors are unbiased.\n" +
"- **A pattern (curve, fan)** — bad. Structure in the residuals = signal the model failed to capture.\n" +
"- **Heteroscedasticity** (residuals fan out as fare grows) — the model is reliable for cheap trips but increasingly uncertain for expensive ones.\n" +
"- **Clusters** — e.g. a band of large residuals around $52 = the JFK flat-rate airport trips the model systematically misses, because they don't follow the per-mile rule.\n\n" +
"## Why it matters\n" +
"Anyone can print an MAE. Showing *where* the model fails — and naming the cause — is what separates a real ML notebook from a copied tutorial. It's also honest: it tells a stakeholder exactly when to trust the model and when not to.\n\n" +
"## Where this fits\n" +
"Today you plot residuals, identify the failure pattern (look for the airport-trip cluster), and write the honest 'here's where it breaks' note that closes the analysis."
      ),
      L("See it in code (with output)",
"## Residual plot\n" +
"```python\n" +
"import matplotlib.pyplot as plt\n\n" +
"resid = y_test - model.predict(X_test)\n" +
"plt.figure(figsize=(8, 5))\n" +
"plt.scatter(y_test, resid, alpha=0.05, s=4)\n" +
"plt.axhline(0, color='red', linewidth=1)\n" +
"plt.xlabel('Actual fare ($)'); plt.ylabel('Residual ($)')\n" +
"plt.title('Residuals — linear fare model')\n" +
"plt.xlim(0, 80); plt.ylim(-30, 30)\n" +
"plt.tight_layout(); plt.savefig('charts/residuals.png', dpi=150); plt.close()\n\n" +
"print('Residual std:', round(resid.std(), 2))\n" +
"# Residual std: 5.10\n" +
"# Visible: fan-out above $40 (heteroscedastic) + a cluster near $52 (JFK flat rate)\n" +
"```\n" +
"The plot tells the story the MAE can't: the model is tight for normal trips but unreliable for expensive/airport ones. Now you can say *exactly* when to trust it."
      ),
      S([
        { prompt: "A residual is actual minus predicted — the error on a single prediction.", answer: true, whenRight: "Right — residual = y_actual - y_predicted. Positive means the model under-predicted that trip.", whenWrong: "Residual = actual - predicted. It's the per-row error. Plotting them reveals where the model struggles.", sim: "actual $20, predicted $17\nresidual = +$3 (under-predicted)" },
        { prompt: "Residuals that fan out as the fare grows (heteroscedasticity) mean the model is equally reliable at all fares.", answer: false, whenRight: "Right — the opposite. Fanning means error grows with fare: reliable for cheap trips, shaky for expensive ones.", whenWrong: "Fanning residuals = growing uncertainty. The model is tight on small fares but increasingly off on large ones.", sim: "small fares: residuals ±$2\nlarge fares: residuals ±$15  <- fan-out" },
        { prompt: "A cluster of large residuals near $52 likely reflects JFK flat-rate trips the model systematically misses.", answer: true, whenRight: "Right — flat-rate airport trips don't follow the per-mile rule, so the model mis-predicts them in a tell-tale band.", whenWrong: "Those are the airport flat-rate trips. They break the per-mile assumption, so the model misses them in a cluster." }
      ]),
      E("Your turn — residual analysis","[CODE] In `07-fare-model.ipynb`:\n1. Compute residuals (y_test - prediction) for your chosen model.\n2. Scatter residuals vs actual fare, with a red line at 0. Save `charts/residuals.png`.\n3. Markdown: Are residuals symmetric around 0? Do they fan out? Can you spot the airport-trip cluster?\n4. Write one honest sentence: 'This model is reliable for ___ but should not be trusted for ___.'")
    ]),
    D(7,"Ship TaxiPulse v0.3","Save the model, write up the finding, tag the release.",[
      L("Closing v0.3 — model, write-up, and tag",
"## What it is\n" +
"v0.3 turns TaxiPulse from a description project into a prediction project. Shipping it means three things are done:\n\n" +
"1. **The model is saved** — serialise the better model so it can be loaded without retraining (you'll deploy it in Week 7):\n" +
"```python\n" +
"import joblib\n" +
"joblib.dump(model2, 'models/fare_model.pkl')\n" +
"```\n\n" +
"2. **The notebook reads as a write-up** — a '## Fare model' section stating the question, the two models compared, the MAE/R² result, and the honest residual finding.\n\n" +
"3. **The release is tagged** — `v0.3` marks the model milestone in git history.\n\n" +
"## Why save the model now\n" +
"A trained model is an artifact. Saving it (joblib/pickle) means Week 7 can load `fare_model.pkl` and serve predictions from an API without ever re-running the notebook. Re-training to deploy is the amateur move; saving the artifact is the professional one.\n\n" +
"## Why it matters\n" +
"v0.3 is the moment your portfolio shows you can *build a model that works* — trained honestly, evaluated against a baseline, and diagnosed for failure. That's a complete ML story, not a tutorial fragment.\n\n" +
"## Where this fits\n" +
"Today you save the model, write the '## Fare model' section, and tag v0.3. Week 7 will wrap this saved model in a deployed API."
      ),
      S([
        { prompt: "Saving the trained model to disk (joblib/pickle) lets you deploy it later without retraining.", answer: true, whenRight: "Right — the model is an artifact. Save it once, load it anywhere (the API in Week 7) without re-running the notebook.", whenWrong: "Save the model with joblib. Week 7's API loads fare_model.pkl directly — no retraining needed to deploy.", sim: "joblib.dump(model, 'models/fare_model.pkl')\n# later: joblib.load(...) -> predict" },
        { prompt: "A v0.3 that reports MAE but never compares two models or inspects residuals is a complete ML write-up.", answer: false, whenRight: "Right — it's incomplete. A real write-up compares models, beats a baseline, and shows where it fails.", whenWrong: "A bare MAE isn't the story. The complete version: baseline comparison, two models, and an honest residual analysis." },
        { prompt: "Tagging v0.3 marks the model milestone so the repo's history shows the project's progression.", answer: true, whenRight: "Right — v0.1 described, v0.2 was custom domain (DevOps) / SQL, v0.3 predicts. Tags tell the growth story.", whenWrong: "The tag pins the model milestone. Anyone reading the repo sees the iterative progression v0.1 -> v0.2 -> v0.3." }
      ]),
      E("Your turn — ship v0.3","[PRODUCE] 1. Save the better model: `joblib.dump(model, 'models/fare_model.pkl')`.\n2. Add a '## Fare model' section to your final notebook: question, two models compared, MAE/R2, residual finding.\n3. Commit + tag:\n`git add . && git commit -m 'v0.3: fare prediction model'`\n`git tag v0.3 && git push && git push --tags`\n\nPASS:\n[x] Linear + XGBoost both trained\n[x] MAE < $5 on the test set\n[x] Coefficients interpreted vs the real NYC rate\n[x] Residual plot saved\n[x] Model saved to models/fare_model.pkl\n[x] v0.3 tag pushed")
    ])
  ]
};

// Validate and write
const newWeeks = [W4, W5];
newWeeks.forEach(w => {
  if (w.days.length !== 7) throw new Error(`W${w.number}: need 7 days, got ${w.days.length}`);
  if (!w.concept_check || w.concept_check.length !== 3) throw new Error(`W${w.number}: concept_check must be 3`);
  w.days.forEach(d => {
    const kinds = d.items.map(i => i.kind);
    if (!kinds.includes('lesson'))   throw new Error(`W${w.number} D${d.number}: no lesson`);
    if (!kinds.includes('swipe'))    throw new Error(`W${w.number} D${d.number}: no swipe`);
    if (!kinds.includes('exercise')) throw new Error(`W${w.number} D${d.number}: no exercise`);
  });
});
ds.weeks.splice(3, 2, ...newWeeks);  // replace index 3,4 (W4,W5)
fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log('SUCCESS: W4-W5 written. Total weeks:', ds.weeks.length);
newWeeks.forEach(w =>
  console.log(`  W${w.number} "${w.title}": ${w.days.length} days, ${w.concept_check.length} concept_check Qs`)
);
