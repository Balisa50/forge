import fs from "fs";
import path from "path";

function rewriteWeek(slug: string, weekNumber: number, patch: Record<string, unknown>) {
  const filePath = path.join(process.cwd(), "data/roadmaps", `${slug}.json`);
  const roadmap = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const week = roadmap.weeks.find((w: { week?: number; number?: number }) => (w.week ?? w.number) === weekNumber);
  if (!week) throw new Error(`Week ${weekNumber} not found in ${slug}`);
  Object.assign(week, patch);
  fs.writeFileSync(filePath, JSON.stringify(roadmap, null, 2));
  console.log(`✓ ${slug} W${weekNumber} (${week.title}) — fields updated: ${Object.keys(patch).join(", ")}`);
}

// W6: Advanced Power BI and DAX
rewriteWeek("bi-analytics", 6, {
  context: `Advanced DAX is the difference between a BI analyst who builds reports and one who builds data products. The features this week — variables, iterator functions, and advanced CALCULATE patterns — are what you need to express complex business logic that no visual configuration can handle.

Variables in DAX (VAR / RETURN) are not just a code style preference — they change evaluation. A variable captures the current filter context at the point it is declared, which prevents a common class of DAX bugs where the context changes unexpectedly inside a complex expression.

Iterator functions (SUMX, AVERAGEX, MAXX, RANKX) evaluate an expression row by row and then aggregate. They are essential when your calculation requires a per-row computation before summing — like calculating profit margin per order and then averaging those margins, rather than dividing total profit by total sales.`,
  pre_flight: `**Advanced DAX patterns — copy and study each:**

Variables:
\`\`\`dax
Profit Margin Safe =
VAR TotalSales = [Total Sales]
VAR TotalProfit = [Total Profit]
RETURN
    DIVIDE(TotalProfit, TotalSales, 0)
\`\`\`

RANKX (rank products by sales):
\`\`\`dax
Product Sales Rank =
RANKX(
    ALL(Products[ProductName]),
    [Total Sales],
    ,
    DESC,
    Dense
)
\`\`\`

SUMX (row-by-row profit margin then sum):
\`\`\`dax
Avg Order Margin =
AVERAGEX(
    Orders,
    DIVIDE(Orders[Profit], Orders[Sales], 0)
)
\`\`\`

Top N with TOPN:
\`\`\`dax
Top 5 Products Sales =
CALCULATE(
    [Total Sales],
    TOPN(5, ALL(Products[ProductName]), [Total Sales])
)
\`\`\`

Selected measure pattern (dynamic measure switching):
\`\`\`dax
Selected Measure =
VAR SelectedValue = SELECTEDVALUE(MeasureSelector[Measure])
RETURN
    SWITCH(
        SelectedValue,
        "Sales", [Total Sales],
        "Profit", [Total Profit],
        "Margin", [Profit Margin],
        [Total Sales]
    )
\`\`\``,
  mastery_questions: [
    "What is the difference between SUMX and SUM? When does using SUM give you a wrong answer that SUMX fixes?",
    "Explain how VAR captures filter context in DAX. Why can a VAR give a different result from evaluating the same expression twice inline?",
    "Write a DAX measure that ranks each product by sales within its category (not across all products).",
    "What is the SWITCH() pattern for dynamic measure selection? How does it work with a disconnected table slicer?",
    "Explain the difference between ALL(), ALLEXCEPT(), and REMOVEFILTERS() in DAX. Give a use case for each.",
  ],
  common_mistakes: [
    "Nesting CALCULATE inside CALCULATE without understanding the filter accumulation — inner CALCULATE arguments add to, not replace, outer filters unless you explicitly clear them with ALL().",
    "Using COUNTROWS on the wrong table — COUNTROWS(Orders) counts all orders; COUNTROWS(DISTINCT Orders[CustomerID]) does not exist. Use DISTINCTCOUNT(Orders[CustomerID]) instead.",
    "Writing RANKX without ALL() — without ALL(), RANKX only sees the current filtered context and all products rank as 1.",
    "Using TOPN for a table but forgetting it returns a table, not a scalar — wrap it in CALCULATE or use SUMX over it.",
    "Not using VAR for expensive sub-expressions that appear multiple times — DAX evaluates each expression separately unless you capture it in a VAR.",
  ],
  debug_help: `**RANKX showing all 1s?**
\`\`\`dax
-- Add ALL() to rank across the full list
Product Sales Rank =
RANKX(
    ALL(Products[ProductName]),  -- must use ALL()
    [Total Sales],
    ,
    DESC,
    Dense
)
\`\`\`

**SWITCH measure not responding to slicer?**
-- The slicer must be connected to the same table as MeasureSelector
-- Verify SELECTEDVALUE() returns the expected value using a card visual
-- Check for spaces or case mismatches in the SWITCH conditions

**AVERAGEX showing wrong average?**
\`\`\`dax
-- Confirm the iterator table is correct
-- AVERAGEX(Orders, ...) iterates individual order rows
-- AVERAGEX(SUMMARIZE(Orders, Orders[OrderID], ...), ...) iterates order-level groups
\`\`\``,
  ai_assist: `**Prompts that work:**
- "I want to show the top 5 customers by revenue and group all others as 'Other'. Write the DAX measure that does this."
- "Explain the difference between CALCULATE([Sales], FILTER(ALL(Products), Products[Category]='Technology')) and CALCULATE([Sales], Products[Category]='Technology')."
- "Write a DAX measure that shows the running total of sales across months using DATESINPERIOD."
- "What is a disconnected slicer table in Power BI? How do I build one and use SELECTEDVALUE to drive a SWITCH measure?"`,
  stretch: [
    "Build a dynamic comparison report: a slicer lets users choose Current Year vs Previous Year, and all visuals update to compare those two periods.",
    "Implement a 'What-if' parameter in Power BI (Modelling → New Parameter) and use it to model a discount scenario on total revenue.",
    "Complete the SQLBI DAX patterns book free samples: https://www.daxpatterns.com/ — work through the ABC Classification and Pareto patterns.",
    "Build a RANKX leaderboard that shows rank within category, with conditional formatting that highlights the top 3 in green.",
  ],
});

// W7: SQL for BI Reporting
rewriteWeek("bi-analytics", 7, {
  context: `SQL is the lingua franca of data. Every BI tool — Power BI, Tableau, Looker, Metabase — eventually pushes a SQL query to a database. A BI analyst who cannot write SQL is dependent on an engineer to get data. A BI analyst who can write SQL gets data themselves and builds faster.

This week you learn the SQL patterns that appear constantly in BI work: aggregations with GROUP BY, filtering with WHERE and HAVING, joining multiple tables, window functions (ROW_NUMBER, RANK, LAG, LEAD, SUM OVER), and CTEs (Common Table Expressions) for readable complex queries.

Window functions are the most powerful SQL feature for BI — they let you compute things like running totals, rank within a group, and period-over-period comparisons at the SQL level, before the data even reaches your BI tool.`,
  pre_flight: `**Set up a SQL environment (choose one):**

Option A — SQLite (simplest, no server):
\`\`\`bash
# Install SQLite
brew install sqlite  # macOS
# Load Superstore CSV
sqlite3 superstore.db
.mode csv
.import superstore.csv orders
\`\`\`

Option B — PostgreSQL (industry standard):
\`\`\`bash
docker run -d --name pg -e POSTGRES_PASSWORD=pass -p 5432:5432 postgres
psql -h localhost -U postgres
\`\`\`

Option C — BigQuery sandbox (free, no credit card):
https://cloud.google.com/bigquery/docs/sandbox

**Core SQL patterns for BI:**
\`\`\`sql
-- Aggregation with GROUP BY
SELECT region, SUM(sales) as total_sales, AVG(profit) as avg_profit
FROM orders
GROUP BY region
ORDER BY total_sales DESC;

-- HAVING (filter on aggregation)
SELECT category, SUM(sales) as total_sales
FROM orders
GROUP BY category
HAVING SUM(sales) > 100000;

-- Window function: running total
SELECT order_date, sales,
       SUM(sales) OVER (ORDER BY order_date) as running_total
FROM orders;

-- Window function: rank within partition
SELECT product_name, category, sales,
       RANK() OVER (PARTITION BY category ORDER BY sales DESC) as rank_in_category
FROM orders;

-- CTE for readability
WITH regional_totals AS (
    SELECT region, SUM(sales) as total_sales
    FROM orders
    GROUP BY region
),
grand_total AS (
    SELECT SUM(sales) as total FROM orders
)
SELECT r.region, r.total_sales,
       ROUND(r.total_sales / g.total * 100, 2) as pct_of_total
FROM regional_totals r, grand_total g
ORDER BY r.total_sales DESC;
\`\`\``,
  mastery_questions: [
    "What is the difference between WHERE and HAVING? Write a query that uses both correctly.",
    "Explain window functions. What does PARTITION BY do and how is it different from GROUP BY?",
    "Write a SQL query that returns each product's sales and its rank within its category.",
    "What is a CTE? Rewrite a nested subquery using a CTE and explain why CTEs are easier to maintain.",
    "Write a SQL query that calculates month-over-month sales growth for each month in the dataset.",
  ],
  common_mistakes: [
    "Using WHERE to filter on aggregated values — WHERE runs before aggregation. Use HAVING to filter after GROUP BY.",
    "SELECT * in production queries — always specify the columns you need. SELECT * pulls unnecessary data and breaks when schema changes.",
    "Not aliasing calculated columns — 'SUM(sales)' becomes 'sum(sales)' in some databases. Always alias: 'SUM(sales) AS total_sales'.",
    "Joining on non-indexed columns — JOINs on unindexed columns are slow on large tables. Check that your JOIN keys are indexed.",
    "Using DISTINCT instead of GROUP BY to remove duplicates — DISTINCT is coarser. GROUP BY lets you aggregate while deduplicating.",
  ],
  debug_help: `**Query returns more rows than expected after a JOIN?**
\`\`\`sql
-- Check for duplicate join keys
SELECT order_id, COUNT(*) FROM orders GROUP BY order_id HAVING COUNT(*) > 1;
-- A many-to-many relationship will multiply rows
-- Use GROUP BY or DISTINCT to collapse
\`\`\`

**Window function syntax error?**
\`\`\`sql
-- Correct syntax
SUM(sales) OVER (PARTITION BY category ORDER BY order_date)
-- OVER clause is required for window functions
-- PARTITION BY is optional; ORDER BY is required for running totals
\`\`\`

**NULL values causing wrong aggregations?**
\`\`\`sql
-- NULL + any value = NULL in arithmetic
-- Use COALESCE to replace NULLs
COALESCE(profit, 0)
-- SUM ignores NULLs; COUNT(*) counts all rows including NULLs; COUNT(column) ignores NULLs
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Write a SQL query that shows for each month: total sales, total profit, profit margin %, and month-over-month sales growth using LAG()."
- "Explain the difference between ROW_NUMBER(), RANK(), and DENSE_RANK(). Give an example where they return different results."
- "I have a query that takes 30 seconds. It has three JOINs and a WHERE clause on a date range. What do I check first to optimise it?"
- "Write a SQL query that finds customers who placed their first order in 2024 and have placed at least one more order since."`,
  stretch: [
    "Write a cohort analysis query in SQL: for each month of first purchase, calculate the retention rate at months 1, 2, 3, 6, and 12.",
    "Solve 10 HackerRank SQL challenges at medium difficulty: https://www.hackerrank.com/domains/sql",
    "Set up a BigQuery sandbox and run the same Superstore queries — note the syntax differences from PostgreSQL.",
    "Build a Power BI report where all measures come from a SQL view, not Power Query transformations — compare the performance.",
  ],
});

// W8: Data Modelling and Warehouse Concepts
rewriteWeek("bi-analytics", 8, {
  context: `Data warehousing is the backend of BI. When a company scales beyond Excel and Power BI files, they build a data warehouse — a centralised repository of integrated, historical data designed for analysis rather than transactions.

The key concepts: OLTP vs OLAP (transactional databases optimised for writes vs analytical databases optimised for reads), dimensional modelling (star and snowflake schemas), slowly changing dimensions (how to handle data that changes over time, like a customer's address), and fact table granularity (what exactly one row represents).

Modern data warehouses (Snowflake, BigQuery, Redshift, Databricks) have largely replaced traditional on-premise warehouses. They are columnar, massively parallel, and can query petabytes in seconds. Understanding how they differ from row-based databases explains why your SQL performance patterns are different.`,
  pre_flight: `**Dimensional modelling concepts to understand:**

Fact table:
- Contains measurable, numeric data (sales amount, quantity, profit)
- Each row = one business event at a specific grain (one order line item)
- Has foreign keys to dimension tables

Dimension table:
- Contains descriptive attributes (product name, category, customer name, city)
- Changes rarely (or uses SCD to track changes)
- Has a surrogate key (auto-incremented ID)

Star schema vs Snowflake:
- Star: dimensions are flat (one table each)
- Snowflake: dimensions are normalised into sub-dimensions (Category → Sub-category split into separate tables)
- Power BI prefers star schema for performance

Slowly Changing Dimensions (SCD):
- Type 1: Overwrite old value (lose history)
- Type 2: Add new row with effective dates (keep full history)
- Type 3: Add new column for old/new value (limited history)

**Free tool: dbt Core (data transformation framework):**
\`\`\`bash
pip install dbt-postgres
dbt init myproject
\`\`\``,
  mastery_questions: [
    "What is the difference between OLTP and OLAP? Give a specific example of a query that runs fast on OLAP but slow on OLTP.",
    "What is the grain of a fact table? Why is defining grain one of the first steps in dimensional modelling?",
    "Explain SCD Type 2. If a customer moves from London to Paris, how does SCD Type 2 preserve the history of their orders?",
    "What is a degenerate dimension? Give an example from the Superstore dataset.",
    "Why does Power BI recommend star schema over snowflake schema? What are the DAX performance implications?",
  ],
  common_mistakes: [
    "Putting too much in the fact table — facts contain measures and foreign keys only. Descriptive attributes belong in dimensions.",
    "Not defining grain before building — if your fact table has one row per order sometimes and one row per order line item other times, aggregations are wrong.",
    "Using SCD Type 1 for dimensions where history matters — overwriting a customer's region when they move makes historical regional analysis impossible.",
    "Building a snowflake schema in Power BI — normalising dimensions into sub-tables requires extra JOINs and slows DAX filter propagation. Denormalise into flat dimensions instead.",
    "Not creating surrogate keys — using natural business keys (like product codes) as dimension keys makes it harder to handle SCD and source system changes.",
  ],
  debug_help: `**dbt model not running?**
\`\`\`bash
# Test connection
dbt debug
# Run a specific model
dbt run --select my_model
# Run tests
dbt test --select my_model
# See compiled SQL
cat target/compiled/myproject/models/my_model.sql
\`\`\`

**Fact table has wrong totals after joining dimension?**
\`\`\`sql
-- Check for fan-out (one-to-many join inflating fact rows)
SELECT COUNT(*) FROM fact_orders;
SELECT COUNT(*) FROM fact_orders JOIN dim_products USING (product_key);
-- If the join result has more rows, you have a many-to-many relationship
\`\`\`

**SCD Type 2 date range query:**
\`\`\`sql
-- Get the dimension record as of a specific date
SELECT * FROM dim_customer
WHERE customer_id = 123
  AND effective_date <= '2023-06-01'
  AND (expiry_date > '2023-06-01' OR expiry_date IS NULL)
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Design a dimensional model for an e-commerce company with orders, products, customers, and promotions. List the fact table and all dimension tables with their columns."
- "Explain why a fact table should only contain foreign keys and numeric measures. What happens if you put text attributes in a fact table?"
- "What is the difference between a fact table and an aggregate table? When would you create an aggregate table?"
- "How does dbt implement SCD Type 2? What does the dbt snapshot feature do?"`,
  stretch: [
    "Design a complete star schema for the Superstore dataset in a diagram tool (draw.io) — show all tables, keys, and relationships.",
    "Implement a dbt project that transforms Superstore CSV data into a star schema — at minimum: fact_orders, dim_products, dim_customers, dim_dates.",
    "Set up a free Snowflake trial (30-day) and load your star schema — run OLAP queries and observe columnar query performance.",
    "Read 'The Data Warehouse Toolkit' by Ralph Kimball — Chapter 1 is freely available and essential foundational reading.",
  ],
});

// W9: Business Statistics for BI
rewriteWeek("bi-analytics", 9, {
  context: `BI without statistics is opinion dressed as data. Business statistics gives you the tools to separate signal from noise, quantify uncertainty, and make claims about data that can be defended when challenged.

The statistics that BI analysts actually use daily: descriptive statistics (mean, median, standard deviation, percentiles), distributions (understanding what normal looks like so you can spot anomalies), correlation (does variable A move with variable B?), and regression (can I predict Y from X?).

The most important skill this week is statistical intuition — knowing when a trend is real versus random noise, when a correlation is meaningful versus coincidental, and when your sample size is too small to make a claim. These are the moments that determine whether a BI analyst is credible or not.`,
  pre_flight: `**Install Python for statistics (if not already set up):**
\`\`\`bash
pip install pandas numpy scipy matplotlib seaborn
\`\`\`

**Statistics in Python — hands-on:**
\`\`\`python
import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

df = pd.read_csv('superstore.csv')

# Descriptive statistics
print(df['Sales'].describe())
print(f"Median: {df['Sales'].median():.2f}")
print(f"Std Dev: {df['Sales'].std():.2f}")
print(f"90th percentile: {df['Sales'].quantile(0.9):.2f}")

# Correlation
corr = df[['Sales', 'Profit', 'Discount', 'Quantity']].corr()
print(corr)

# Distribution check
from scipy.stats import normaltest
stat, p = normaltest(df['Sales'])
print(f"Normal test p-value: {p:.4f}")
# p < 0.05 = not normally distributed

# Simple linear regression
from scipy.stats import linregress
slope, intercept, r, p, se = linregress(df['Sales'], df['Profit'])
print(f"R-squared: {r**2:.4f}, Slope: {slope:.4f}")
\`\`\``,
  mastery_questions: [
    "What is the difference between mean and median? When is median a better measure of central tendency for business data?",
    "Explain standard deviation in plain English to a non-technical manager. How would you use it to detect anomalies in daily sales?",
    "You see sales are up 15% this month. How do you determine if this is statistically significant or within normal variation?",
    "What is the difference between correlation and causation? Give a real business example where a strong correlation would be misleading.",
    "Explain what a p-value means. A/B test result: p=0.03. What does this tell you and what decision do you make?",
  ],
  common_mistakes: [
    "Using mean when data is skewed — revenue data is almost always right-skewed (a few huge deals inflate the mean). Median revenue is more representative of the typical deal.",
    "Claiming causation from correlation — two metrics moving together in a dashboard does not mean one causes the other. Always ask: what else changed at the same time?",
    "Ignoring sample size when comparing percentages — '100% success rate' means nothing if it is based on 3 observations.",
    "Not visualising the distribution before reporting the average — always plot a histogram. You may have outliers that are distorting the summary statistics.",
    "Reporting too many decimal places — reporting 'conversion rate: 3.847612%' implies false precision. Round to 2 significant figures: 3.8%.",
  ],
  debug_help: `**Outliers distorting your analysis?**
\`\`\`python
# IQR-based outlier detection
Q1 = df['Sales'].quantile(0.25)
Q3 = df['Sales'].quantile(0.75)
IQR = Q3 - Q1
outliers = df[(df['Sales'] < Q1 - 1.5*IQR) | (df['Sales'] > Q3 + 1.5*IQR)]
print(f"Found {len(outliers)} outliers")

# Remove for analysis (document this decision)
df_clean = df[(df['Sales'] >= Q1 - 1.5*IQR) & (df['Sales'] <= Q3 + 1.5*IQR)]
\`\`\`

**Correlation matrix hard to read?**
\`\`\`python
import seaborn as sns
sns.heatmap(corr, annot=True, cmap='coolwarm', center=0)
plt.show()
\`\`\`

**Unsure if change is significant?**
\`\`\`python
# Two-sample t-test: is this month different from last month?
from scipy.stats import ttest_ind
t, p = ttest_ind(this_month_sales, last_month_sales)
print(f"p-value: {p:.4f} — {'significant' if p < 0.05 else 'not significant'}")
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Explain confidence intervals to a product manager who is asking if our 10% conversion improvement is real."
- "I have daily sales data for 2 years. How do I detect if a dip in month X is within normal seasonal variation or a genuine anomaly?"
- "What is the difference between Pearson correlation and Spearman correlation? When should I use each?"
- "My manager says 'sales are up 15%'. What questions should I ask to determine if this is statistically meaningful?"`,
  stretch: [
    "Perform a full exploratory data analysis (EDA) on the Superstore dataset: distributions, correlations, outlier detection, and 5 key insights with supporting charts.",
    "Calculate seasonality-adjusted growth rates for the Superstore data using month-over-month and year-over-year comparisons.",
    "Learn about control charts (statistical process control) and build one for daily sales — define upper and lower control limits.",
    "Read the StatQuest YouTube channel — watch the videos on p-values, confidence intervals, and linear regression (all under 20 minutes each).",
  ],
});

// W10: A/B Testing and Hypothesis Testing
rewriteWeek("bi-analytics", 10, {
  context: `A/B testing is how data-driven companies make product decisions. Instead of debating which version of a feature is better, you run both versions simultaneously, collect data, and let statistics decide. A BI analyst's job in an A/B test: design the experiment correctly, analyse the results without bias, and communicate findings clearly.

The most common A/B testing mistakes are not statistical — they are design mistakes: running the test too short, stopping when you first see significance, testing too many variants simultaneously, and not defining the primary metric before the test starts. These mistakes produce false positives that lead companies to ship worse products.

This week you learn the statistics of A/B testing (two-sample tests, power analysis, sample size calculation) and how to run and analyse experiments using Python. You also learn the business side: how to communicate results to stakeholders who don't understand p-values.`,
  pre_flight: `**A/B testing in Python:**
\`\`\`python
import numpy as np
from scipy import stats

# Simulate an A/B test
np.random.seed(42)
control_conversions = np.random.binomial(1, 0.10, 1000)   # 10% base rate
variant_conversions = np.random.binomial(1, 0.115, 1000)  # 15% lift

# Two-proportion z-test
from statsmodels.stats.proportion import proportions_ztest
count = np.array([variant_conversions.sum(), control_conversions.sum()])
nobs = np.array([len(variant_conversions), len(control_conversions)])
stat, pval = proportions_ztest(count, nobs)
print(f"Conversion A: {control_conversions.mean():.3f}")
print(f"Conversion B: {variant_conversions.mean():.3f}")
print(f"p-value: {pval:.4f}")
print(f"Result: {'Significant' if pval < 0.05 else 'Not significant'}")
\`\`\`

**Sample size calculation:**
\`\`\`python
from statsmodels.stats.power import NormalIndPower
analysis = NormalIndPower()
# How many users needed to detect a 15% lift with 80% power at 5% significance?
baseline = 0.10
effect_size = 0.015 / (baseline * (1 - baseline)) ** 0.5
n = analysis.solve_power(effect_size=effect_size, power=0.8, alpha=0.05)
print(f"Required sample size per variant: {int(n)}")
\`\`\``,
  mastery_questions: [
    "What is the difference between Type I and Type II errors in hypothesis testing? In an A/B test context, which is more costly and why?",
    "What is statistical power and why do you calculate the required sample size before running an A/B test?",
    "Explain 'peeking' at A/B test results. Why does stopping a test early when you first see p < 0.05 produce false positives?",
    "Your A/B test shows p = 0.03. Your manager wants to ship the variant immediately. What other information do you need before making a recommendation?",
    "What is the difference between a one-tailed and two-tailed test? When would you use a one-tailed test in a business context?",
  ],
  common_mistakes: [
    "Not defining the primary metric before the test starts — testing multiple metrics and reporting whichever is significant is called p-hacking. Define one primary metric in advance.",
    "Running the test until it is significant — this is 'peeking'. The false positive rate increases every time you check. Define a sample size upfront and wait until you reach it.",
    "Ignoring practical significance — p = 0.001 but the lift is 0.01%? Not worth shipping. Always report effect size alongside p-value.",
    "Not checking for novelty effects — a new feature often gets higher engagement simply because it is new. Run tests long enough to see past novelty (at least 2 weeks for consumer products).",
    "Not segmenting results — an overall non-significant result can mask a strong positive effect in a specific segment. Always analyse key segments.",
  ],
  debug_help: `**p-value unexpectedly low on a tiny dataset?**
\`\`\`python
# Check your sample sizes
print(f"Control N: {len(control_conversions)}, Variant N: {len(variant_conversions)}")
# With very small N, use Fisher's exact test instead of z-test
from scipy.stats import fisher_exact
table = [[variant_success, variant_failure], [control_success, control_failure]]
odds_ratio, p = fisher_exact(table)
\`\`\`

**Sample size calculator giving huge numbers?**
-- The smaller the effect size you want to detect, the more data you need
-- If you need 500k users per variant to detect a 0.1% lift, reconsider the minimum detectable effect
-- Most companies set MDE at 5-15% relative lift

**Experiment contamination?**
-- Users in control seeing the variant (or vice versa) pollutes results
-- Use consistent user-level assignment (hash on user_id, not session_id)
-- Analyse using ITT (Intent To Treat) — include all assigned users, not just those who were exposed`,
  ai_assist: `**Prompts that work:**
- "Explain the minimum detectable effect (MDE) to a product manager. How do I choose the right MDE for an A/B test on a checkout flow?"
- "What is a Bayesian A/B test and how does it differ from frequentist hypothesis testing? When is Bayesian preferred?"
- "My A/B test ran for 2 weeks and the p-value is 0.07. My manager wants to run it another week. What are the statistical risks of this approach?"
- "Walk me through how to set up a proper A/B test for a new homepage design — what do I define before starting?"`,
  stretch: [
    "Simulate 1,000 A/B tests in Python with no actual effect and count how many produce p < 0.05 — this demonstrates the base rate of false positives.",
    "Implement a Bayesian A/B test using PyMC or scipy — calculate the probability that variant B is better than control.",
    "Read Evan Miller's 'How Not To Run an A/B Test': https://www.evanmiller.org/how-not-to-run-an-ab-test.html",
    "Analyse a real A/B test dataset from Kaggle and write a report in your BI portfolio documenting your methodology and findings.",
  ],
});

console.log("\nAll done — bi-analytics W6-W10 applied.");
