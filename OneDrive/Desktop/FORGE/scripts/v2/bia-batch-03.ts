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

// W11: KPIs, Metrics Design, and Data Storytelling
rewriteWeek("bi-analytics", 11, {
  context: `A KPI (Key Performance Indicator) is a metric that measures progress toward a specific business objective. Most companies have too many KPIs, and most of them are vanity metrics — numbers that look good but don't tell you whether the business is healthy or how to improve it.

Good metrics have three properties: they are actionable (someone can change their behaviour based on them), they are comparable (you can tell if this week's number is good or bad by comparing to something), and they are understandable (the person being measured understands how the number is calculated).

Data storytelling is the practice of presenting data in a narrative that leads to a decision. The best BI analysts don't just produce charts — they answer "so what?" and "now what?". This week you learn both: how to design metrics that matter, and how to present them in a way that drives action.`,
  pre_flight: `**The HEART framework (Google's UX metrics):**
- Happiness: user satisfaction scores
- Engagement: depth of usage (sessions, features used)
- Adoption: new user activation, feature adoption rate
- Retention: percentage of users returning
- Task Success: completion rate, error rate

**The North Star Metric concept:**
One metric that best captures the core value your product delivers to users.
Examples:
- Airbnb: Nights booked
- Spotify: Time spent listening
- Slack: Messages sent within a team

**Data storytelling structure (Barbara Minto's Pyramid):**
1. Situation: what is the context?
2. Complication: what has changed or is the problem?
3. Resolution: what should we do?
Present the resolution first (executive summary), then the supporting data.

**Dashboard critique framework:**
For every dashboard you review, ask:
- What decision does this dashboard enable?
- Who is the audience?
- What is the primary metric?
- What action should the viewer take if the metric is red?`,
  mastery_questions: [
    "What is the difference between a metric, a KPI, and a North Star metric? Give an example of each for a SaaS company.",
    "What makes a metric a 'vanity metric'? Give 3 examples of vanity metrics and explain what a better alternative would be for each.",
    "Explain the difference between a leading indicator and a lagging indicator. Give a business example of each.",
    "You have 5 minutes to present this month's sales results to the CEO. Structure your presentation using the pyramid principle.",
    "A dashboard has 20 different charts on one page. What are the problems with this and how would you redesign it?",
  ],
  common_mistakes: [
    "Tracking activity metrics instead of outcome metrics — 'number of emails sent' is an activity. 'Revenue per email' is an outcome. Track what matters.",
    "No benchmark or target on dashboards — a number without context is meaningless. Always show target, last period, or industry benchmark alongside the metric.",
    "Presenting data without a recommendation — a BI analyst who says 'sales are down 10%' without saying 'and here is what I think we should do' is only doing half the job.",
    "Using charts without titles that state the insight — a chart titled 'Sales by Region' tells you nothing. 'West Region Leads in Sales but Has Lowest Margin' tells you the story.",
    "Overwhelming the audience with precision — 12.3456% is not more useful than 12.3%. Match precision to the decision being made.",
  ],
  debug_help: `**Dashboard feels cluttered but you can't remove anything?**
Apply this test: for each visual, ask 'what decision does this enable that the other visuals don't?'
If the answer is 'none', remove it.

**Executive can't understand a chart?**
Replace the chart title with a sentence that states the insight:
- Bad: "Monthly Revenue by Category"
- Good: "Technology Revenue Grew 32% in Q4, Outpacing All Other Categories"

**KPI doesn't seem actionable?**
Ask: "If this metric drops 20% next week, who is responsible for fixing it and what do they do?"
If nobody has a clear answer, the metric is not actionable.`,
  ai_assist: `**Prompts that work:**
- "Help me design a KPI framework for an e-commerce company. What should the CEO, Head of Marketing, and Head of Operations each track?"
- "What is the AARRR (pirate metrics) framework? Design a metrics stack for a SaaS product using AARRR."
- "Review this dashboard layout: [describe your dashboard]. What would you remove, add, or rearrange to make it more decision-focused?"
- "I need to present declining customer retention to the board. Structure this as a pyramid principle narrative."`,
  stretch: [
    "Audit an existing dashboard you have built — apply the decision-enablement test to every visual and remove or improve those that fail.",
    "Write a one-page data story (with visuals) about a trend you found in the Superstore data — executive summary, supporting data, recommendation.",
    "Read 'Storytelling with Data' by Cole Nussbaumer Knaflic — at minimum read Chapters 1-3 (the core design principles).",
    "Design a North Star metric and supporting metrics tree for a hypothetical product you care about — document the calculation and data source for each metric.",
  ],
});

// W12: Python for BI Analysts
rewriteWeek("bi-analytics", 12, {
  context: `Python is not a replacement for Power BI — it is what you use when Power BI is not enough. Complex data transformations, custom visualisations, machine learning features, and automation are all significantly easier in Python than in any BI tool.

For a BI analyst, the Python toolkit is: pandas for data manipulation, matplotlib/seaborn/plotly for visualisation, and Jupyter notebooks for exploratory analysis and shareable reports. You are not writing production software — you are writing data analysis scripts that can be reviewed, rerun, and modified.

This week you learn the pandas operations that show up constantly in BI work: groupby, merge, pivot_table, apply, and time series resampling. These are the Python equivalents of SQL GROUP BY, JOIN, PIVOT, and window functions.`,
  pre_flight: `**Install the BI Python stack:**
\`\`\`bash
pip install pandas numpy matplotlib seaborn plotly openpyxl jupyter
jupyter notebook  # open in browser
\`\`\`

**Core pandas patterns for BI:**
\`\`\`python
import pandas as pd

df = pd.read_csv('superstore.csv', parse_dates=['Order Date'])

# GroupBy — equivalent to SQL GROUP BY
region_sales = df.groupby('Region').agg(
    total_sales=('Sales', 'sum'),
    avg_profit=('Profit', 'mean'),
    order_count=('Order ID', 'nunique')
).reset_index().sort_values('total_sales', ascending=False)

# Pivot table
pivot = df.pivot_table(
    values='Sales',
    index='Region',
    columns='Category',
    aggfunc='sum',
    fill_value=0
)

# Merge (like SQL JOIN)
customers = pd.read_csv('customers.csv')
merged = df.merge(customers, on='Customer ID', how='left')

# Time series resampling
df['Order Date'] = pd.to_datetime(df['Order Date'])
df = df.set_index('Order Date')
monthly = df['Sales'].resample('M').sum()

# Apply custom function
df['Margin'] = df.apply(
    lambda row: row['Profit'] / row['Sales'] if row['Sales'] > 0 else 0,
    axis=1
)
\`\`\``,
  mastery_questions: [
    "What is the difference between groupby().agg() and pivot_table() in pandas? When would you choose each?",
    "Explain the difference between merge() with how='left', 'right', 'inner', and 'outer'. Give a use case for each.",
    "How do you handle missing values in a pandas DataFrame? When would you fill vs drop vs flag?",
    "Write pandas code to calculate month-over-month sales growth as a percentage.",
    "What is the difference between apply(), map(), and applymap() in pandas? When is each appropriate?",
  ],
  common_mistakes: [
    "Using apply() where a vectorised operation exists — apply() is slow because it runs Python for each row. Use pandas built-in operations (which run in NumPy C code) instead.",
    "Not resetting the index after groupby — groupby().agg() returns a DataFrame with the grouped column as the index. Call .reset_index() to make it a regular column.",
    "Modifying a slice of a DataFrame directly — this causes a SettingWithCopyWarning. Always use .loc[] for assignment or work on a copy with .copy().",
    "Loading CSV with wrong data types — always check df.dtypes after loading. Date columns default to object (string) unless you pass parse_dates=[].",
    "Not documenting your Jupyter notebooks — a notebook that runs top-to-bottom but has no explanatory text is hard to review and reuse. Add markdown cells for context.",
  ],
  debug_help: `**SettingWithCopyWarning?**
\`\`\`python
# Wrong
df[df['Region']=='West']['Sales'] = 0

# Right
df.loc[df['Region']=='West', 'Sales'] = 0
\`\`\`

**Merge creating unexpected duplicate rows?**
\`\`\`python
# Check for duplicates in the join key before merging
print(df.duplicated(subset='Customer ID').sum())
# If duplicates exist in the 'many' table, a left join will fan out rows
\`\`\`

**Date parsing not working?**
\`\`\`python
# Specify the format explicitly
df['Order Date'] = pd.to_datetime(df['Order Date'], format='%m/%d/%Y')
# Or use errors='coerce' to turn unparseable dates into NaT
df['Order Date'] = pd.to_datetime(df['Order Date'], errors='coerce')
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Write pandas code that reads a CSV, calculates the 7-day rolling average of daily sales, and plots it with matplotlib."
- "I have a DataFrame with columns: Date, Product, Sales. Write code to calculate month-over-month growth for each product."
- "How do I export a styled pandas DataFrame to Excel with conditional formatting on the Profit column?"
- "What is the difference between pd.concat() and pd.merge()? When do I use each?"`,
  stretch: [
    "Build a complete EDA notebook for the Superstore dataset — 10+ insights with supporting visualisations and markdown explanations.",
    "Automate a weekly Excel report generation in Python: read from CSV, calculate 5 KPIs, write to a formatted Excel file using openpyxl.",
    "Learn plotly for interactive charts — rebuild your top 3 Superstore Power BI visuals as interactive Plotly charts in a Jupyter notebook.",
    "Connect Python to Power BI using the Python visual — run a pandas aggregation inside Power BI and display the output as a chart.",
  ],
});

// W13: Cloud BI — Google Looker Studio and BigQuery
rewriteWeek("bi-analytics", 13, {
  context: `Cloud BI tools — Google Looker Studio, AWS QuickSight, Tableau Cloud — have a different architecture from desktop tools like Power BI Desktop. Data lives in a cloud warehouse (BigQuery, Redshift, Snowflake), queries run in the cloud, and reports are web-based and collaborative. There is no .pbix file to email — the report is a URL.

BigQuery is Google's managed data warehouse and one of the best places to learn cloud BI because it has a free tier with 1TB of query processing per month. Looker Studio (formerly Google Data Studio) connects to BigQuery natively and is free. Together they give you a production-grade cloud BI stack at zero cost.

The key difference from desktop BI: in cloud BI, your data stays in the warehouse and you query it live (DirectQuery equivalent). This means SQL skills matter more — every visualisation is a SQL query under the hood.`,
  pre_flight: `**Set up the free stack:**

1. Google Cloud account (free): https://cloud.google.com/free
2. Create a BigQuery project (no billing required for sandbox)
3. Load Superstore data to BigQuery:
\`\`\`sql
-- In BigQuery console, create a dataset called 'superstore'
-- Upload your CSV: Console → BigQuery → your-project → Create Dataset → Upload CSV
\`\`\`

4. Looker Studio (free): https://lookerstudio.google.com/
   - New Report → Add Data → BigQuery → select your dataset

**BigQuery SQL (standard SQL, slightly different from SQLite/PostgreSQL):**
\`\`\`sql
-- Date functions
SELECT
  FORMAT_DATE('%Y-%m', PARSE_DATE('%m/%d/%Y', Order_Date)) as month,
  SUM(Sales) as total_sales
FROM \`your-project.superstore.orders\`
GROUP BY month
ORDER BY month;

-- Window function for running total
SELECT
  Order_Date,
  Sales,
  SUM(Sales) OVER (ORDER BY Order_Date) as running_total
FROM \`your-project.superstore.orders\`;
\`\`\`

**Looker Studio key features:**
- Data blending: combine multiple data sources in one chart
- Calculated fields: SQL-like expressions in the UI
- Community connectors: GA4, Search Console, Ads, Sheets`,
  mastery_questions: [
    "What is the difference between Looker Studio and Looker (the enterprise product)? Why did Google keep both?",
    "BigQuery charges by bytes scanned, not by query count. How does this change how you write queries compared to a traditional database?",
    "What is a Looker Studio 'calculated field'? How does it differ from a DAX measure in Power BI?",
    "Explain BigQuery's partitioned and clustered tables. How do they reduce query cost?",
    "What is data blending in Looker Studio? When would you use it instead of joining in BigQuery?",
  ],
  common_mistakes: [
    "Running SELECT * on a large BigQuery table — BigQuery charges per bytes scanned. SELECT * on a 1TB table costs money. Always SELECT only the columns you need.",
    "Not partitioning BigQuery tables by date — a date-partitioned table lets queries skip irrelevant partitions. Without partitioning, every query scans the full table.",
    "Using Looker Studio calculated fields for complex logic — calculated fields are evaluated at query time and slow down reports. Pre-compute complex metrics in BigQuery views instead.",
    "Not caching results — BigQuery caches query results for 24 hours. Identical queries within 24 hours are free. Use this to your advantage for dashboard refreshes.",
    "Not setting up data freshness expectations — cloud BI reports query live data. If your BigQuery table loads once per day, your report is only as fresh as that load.",
  ],
  debug_help: `**BigQuery query over budget?**
\`\`\`sql
-- Check query cost before running (BigQuery shows estimate in top right)
-- Use a WHERE clause on the partition column to limit scan
WHERE DATE(Order_Date) >= '2023-01-01'

-- Dry run to check bytes without running
-- In bq CLI:
bq query --dry_run --use_legacy_sql=false 'SELECT ...'
\`\`\`

**Looker Studio report slow?**
- Check if you are using live connection vs extracted data
- Switch to data extract for non-real-time data
- Pre-aggregate in a BigQuery view instead of aggregating in Looker Studio

**Looker Studio calculated field not working?**
- Field types must match — cannot compare a date field to a text string
- Use CAST() to convert types
- Check parentheses — Looker Studio expressions are not SQL but have similar syntax`,
  ai_assist: `**Prompts that work:**
- "Write a BigQuery SQL query that calculates customer lifetime value (total revenue per customer) ranked from highest to lowest."
- "What is the difference between a BigQuery view and a materialised view? When should I use each?"
- "How do I optimise a Looker Studio report that is slow because it queries BigQuery live? What are my options?"
- "Walk me through setting up a Looker Studio report that shows Google Analytics 4 and BigQuery data side by side."`,
  stretch: [
    "Build a complete Looker Studio dashboard connected to BigQuery using the Superstore data — replicate your Power BI Superstore report.",
    "Create a BigQuery scheduled query that refreshes an aggregate table daily — connect Looker Studio to the aggregate table instead of the raw data.",
    "Load a public BigQuery dataset (e.g. NYC taxi trips or GitHub archive) and build a dashboard with 5 meaningful insights.",
    "Explore dbt Cloud's free tier — connect it to BigQuery and build a simple dbt model that pre-aggregates Superstore data for reporting.",
  ],
});

// W14: AI-Assisted BI Workflows
rewriteWeek("bi-analytics", 14, {
  context: `AI tools are now embedded in every major BI platform. Power BI Copilot, Tableau Pulse, Google Looker AI, and standalone tools like Julius.ai and Hex can generate charts, write DAX, explain data, and answer natural-language questions about your data. Ignoring these tools costs you productivity.

The skill is not using AI to replace your analysis — it is using AI to accelerate the mechanical parts (writing DAX, writing SQL, formatting charts) so you can spend more time on the parts that require human judgment (interpreting results, designing experiments, communicating to stakeholders).

This week you build an AI-assisted workflow: using Claude or ChatGPT to generate and debug DAX and SQL, using Power BI Copilot (if you have Pro access) for natural language report generation, and understanding where AI analysis should be verified and where it can be trusted.`,
  pre_flight: `**AI-assisted BI tools to explore:**

Power BI Copilot (Pro/Premium required):
- Report view → Home → Copilot button
- Natural language: "Show me monthly sales trend with a forecast"
- DAX generation: describe a measure in plain English

Claude / ChatGPT for DAX and SQL:
- Best prompt pattern: include the table schema, what you want to calculate, and any constraints
- Always verify generated DAX against sample data — AI makes subtle logical errors

Julius.ai (data analysis via chat, free tier):
https://julius.ai/
- Upload your CSV → ask questions in plain English → get charts + code

Jupyter AI (AI in notebooks, free, open-source):
\`\`\`bash
pip install jupyter-ai
# Adds %%ai magic to Jupyter cells
\`\`\`

**AI verification checklist:**
For any AI-generated DAX or SQL:
1. Does it use the correct table and column names?
2. Does it handle NULL correctly?
3. Does the total row make sense?
4. Does it respond correctly to slicers?
5. Spot-check 3 specific values against source data`,
  mastery_questions: [
    "What types of BI tasks are well-suited to AI assistance and which require human judgment? Give 3 examples of each.",
    "You ask Claude to write a DAX measure for 'sales growth vs last year'. It gives you a measure using DATEADD(). How do you verify it is correct?",
    "What is the risk of using AI-generated SQL queries against a production database without review?",
    "How do you prompt an AI to generate useful DAX? What information must you include in the prompt?",
    "Describe the 'AI as co-pilot' workflow for data analysis. What does a human do that AI cannot?",
  ],
  common_mistakes: [
    "Trusting AI output without verification — AI writes plausible-looking but wrong DAX regularly. Always test against known values.",
    "Not including schema in AI prompts — 'write a DAX measure for profit margin' produces a generic answer. Include: table name, column names, relationship structure.",
    "Using AI to answer business questions directly instead of as a tool — AI doesn't know your business context. Use it to generate code, not to make decisions.",
    "Not understanding what the AI generated — if you cannot explain why the generated DAX works, you cannot debug it when it breaks. Read every generated formula.",
    "Overusing AI for exploration and underusing it for automation — AI is excellent at automating repetitive code tasks (formatting, boilerplate). Use it there too.",
  ],
  debug_help: `**AI-generated DAX returns wrong results?**
Debug systematically:
1. Create a simple measure that just returns [Total Sales] with no extra logic
2. Add one component of the AI formula at a time
3. Test each addition against known values
4. Identify the exact component that breaks

**Julius.ai giving a wrong chart?**
- Be more specific in your question
- "Show monthly sales" → "Show total Sales summed by month, as a line chart, with months on the x-axis sorted chronologically"
- Upload a small sample of your data first to verify it parsed correctly

**Power BI Copilot generating wrong measure?**
- Correct it in plain English: "That measure counts orders, but I need it to sum sales revenue"
- Review the generated DAX before applying`,
  ai_assist: `**Prompts that work:**
- "I have a Power BI model with tables: Orders (OrderID, CustomerID, ProductID, OrderDate, Sales, Profit), Products (ProductID, ProductName, Category), Customers (CustomerID, CustomerName, Region). Write a DAX measure for YTD Sales Growth vs same period last year."
- "Review this DAX measure for errors: [paste measure]. Explain what it does, identify any bugs, and suggest improvements."
- "Write a SQL query for BigQuery that calculates the customer churn rate for each month — churn defined as customers active in month N-1 but not in month N."
- "I have monthly sales data. Generate Python code to decompose it into trend, seasonality, and residual components using statsmodels."`,
  stretch: [
    "Build a complete AI-assisted analysis workflow: CSV → Julius.ai for exploration → Claude for DAX generation → Power BI for the final dashboard.",
    "Write a prompt template you can reuse for generating DAX measures — include all the schema information and constraints an AI needs.",
    "Explore Microsoft Fabric Copilot (if you have access) — compare its capabilities to Power BI Copilot.",
    "Use Claude or ChatGPT to generate a full data cleaning script for a messy CSV dataset — then validate every step of the output.",
  ],
});

// W15: BI Portfolio and Interview Preparation
rewriteWeek("bi-analytics", 15, {
  context: `A BI portfolio is your proof of work. Anyone can list Power BI and SQL on a CV — very few people can show a dashboard, explain the design decisions, and walk through the DAX or SQL behind it. Those people get the interviews.

Your BI portfolio should demonstrate three things: technical skills (can you build a complete, well-structured Power BI report or SQL pipeline?), analytical thinking (can you find interesting insights and explain why they matter?), and communication (can you present data in a way that drives decisions?).

This week you package everything you have built into a portfolio, prepare for common interview question types (technical SQL/DAX questions, case study analysis, stakeholder communication scenarios), and practise until the answers are fluent.`,
  pre_flight: `**Portfolio structure:**

Option A — Power BI Service portfolio:
- Publish 2-3 reports to Power BI Service
- Set them to public and share the URL
- Each report: cover page with overview, 2-3 insight pages

Option B — GitHub + screenshots portfolio:
- Create a GitHub repo: "bi-portfolio"
- For each project: README.md with context, screenshots, DAX/SQL code snippets
- Include the .pbix file if the data is not sensitive

**What to include:**
1. Superstore Sales Analysis: your complete Superstore report with RLS, drillthrough, and DAX measures
2. SQL Analysis: your most complex SQL query (cohort analysis, churn calculation) + results
3. Python EDA: your Jupyter notebook as an exported HTML file
4. Bonus: a real-world dataset (Kaggle, government open data) with an original insight

**Common BI interview question types:**
1. Technical: "Write SQL to find the top 3 customers by revenue in each region"
2. DAX: "How would you write a measure for YOY growth that handles missing prior-year data?"
3. Case study: "Here is sales data showing a 20% drop in Region X. Walk me through how you would investigate this."
4. Stakeholder: "A manager disagrees with your analysis. How do you handle it?"
5. Design: "Design a dashboard for the Head of Sales — what metrics would you show and why?"`,
  mastery_questions: [
    "Walk me through your most complex DAX measure. Explain what it calculates, why you used CALCULATE, and how you tested it.",
    "You are given a dataset and 48 hours to build a dashboard for a job interview. Walk me through your process from raw data to finished report.",
    "Write SQL that returns for each region: total sales, total profit, profit margin %, and rank by profit margin.",
    "A stakeholder says 'our conversion rate went from 5% to 6% — that's a 1% increase.' How do you respond?",
    "What would you do if you discovered the data in a report you built has been wrong for the past 3 months?",
  ],
  common_mistakes: [
    "Not explaining the 'so what' in portfolio projects — a dashboard screenshot with no description of the insight or decision it enables is just a picture.",
    "Showing only clean, simple examples — hiring managers want to see complexity. Show the report with RLS, drillthrough, and non-trivial DAX.",
    "Not practising SQL interviews under time pressure — SQL questions in interviews are timed. Practise on LeetCode or StrataScratch with a timer.",
    "Using jargon without checking understanding — 'I used SUMX to iterate the row context' means nothing to a non-technical interviewer. Know your audience.",
    "Not researching the company's data stack before the interview — if the job uses Tableau and you only know Power BI, prepare to explain how your skills transfer.",
  ],
  debug_help: `**Portfolio report too complex to explain quickly?**
Prepare a 60-second elevator pitch for each report:
- "This report shows X for audience Y"
- "The most interesting insight is Z"
- "The hardest technical challenge was W"
- "The business decision it enabled was V"

**Stuck on a SQL interview question?**
1. State your approach before writing code
2. Start simple and add complexity
3. Mention edge cases even if you don't have time to handle them
4. A partially correct answer with good explanation beats a wrong silent answer

**Power BI report too slow to demo?**
- Pre-cache the report by loading it in Service before the interview
- Use Import mode, not DirectQuery, for demo datasets
- Keep the dataset under 50MB for fast load times`,
  ai_assist: `**Prompts that work:**
- "I'm preparing for a BI analyst interview. Ask me a SQL question at medium difficulty and then critique my answer."
- "Review my portfolio project description and tell me what a hiring manager would think is missing: [paste your project description]"
- "What are the 5 most common BI analyst interview mistakes? How do I avoid each one?"
- "Help me write a STAR-format answer for: 'Tell me about a time you found an insight that changed a business decision.'"`,
  stretch: [
    "Publish your complete Superstore Power BI report to Power BI Service and share the URL publicly — this is your portfolio piece.",
    "Solve 10 StrataScratch SQL problems at medium difficulty: https://platform.stratascratch.com/",
    "Do a mock case study interview: ask Claude to give you a data scenario and 20 minutes to respond with a structured analysis.",
    "Apply for 3 BI analyst roles this week — junior/associate level. Use the application as a forcing function to finalise your portfolio.",
  ],
});

console.log("\nAll done — bi-analytics W11-W15 applied.");
