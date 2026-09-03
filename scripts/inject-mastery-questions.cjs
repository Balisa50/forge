/**
 * One-shot: inject 10 hands-on mastery_questions into every week of the
 * Data Analysis and Data Science curated roadmaps. Each question is tied
 * to that week's actual tasks/outputs and forces the student to paste a
 * specific number, run a command, or push an artifact URL.
 *
 * Run from repo root:  node scripts/inject-mastery-questions.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "data", "roadmaps");

const DA = {
  1: [
    "Open your Drills sheet. Paste the exact value from your Total Sales 2023 cell, rounded to the nearest dollar.",
    "From your Q1 pivot, name the sub-category with the HIGHEST profit margin and the one with the LOWEST. Give both percentages to 1 decimal place.",
    "In your Q1 pivot, how many sub-categories show a NEGATIVE profit margin? List each one by name.",
    "From your Q2 pivot, which region had the highest year-over-year sales growth in the latest year? Give the exact percentage.",
    "In your Furniture pivot from Q3, which Furniture sub-category loses the most money? Which single region is the worst region for that sub-category?",
    "Build a NEW pivot you have not built yet: Profit by Ship Mode (rows = Ship Mode, values = Sum of Profit). Which Ship Mode has the worst total profit, and what is the number?",
    "In any blank cell type: =CORREL(Orders!O:O, Orders!R:R). What number did you get (3 decimals)? Is the relationship between Discount and Profit positive or negative?",
    "Open the People sheet. How many regions are listed and which person is assigned to each? Paste the table.",
    "In your final 1-page Dashboard sheet, list the exact chart types you used (for example: bar chart of sales by region, line of monthly sales). Briefly say why you picked those two and not others.",
    "Push your superstore-analysis repo to GitHub. Paste the full public URL here so your mentor can open it."
  ],
  2: [
    "Run `python -c \"import pandas; print(pandas.__version__)\"` in your terminal. Paste the version number.",
    "Open your notebook and paste the exact line of pandas code that recreates the Q1 margin pivot (groupby + aggregate + sort).",
    "After reading the CSV, run `df.dtypes` and paste the dtype of the Sales column. If it loaded as object instead of float, paste the line that fixed it.",
    "From your pandas Q1 result, paste the top 3 sub-categories by margin with exact percentages to 1 decimal.",
    "In your Region YoY analysis, paste the `.unstack()` line you wrote. In one sentence, what does unstack() do that groupby alone does not?",
    "Run df.groupby('Region')['Sales'].sum().plot(kind='bar'); plt.savefig('region_sales.png'). Paste the GitHub raw URL of the saved PNG.",
    "Open monthly_report.py. Paste lines 1 through 15. Does the script run end-to-end from the command line without errors? Yes or no.",
    "Add one line that prints how many rows have a null Postal Code. Paste the count.",
    "Compare your pandas margin numbers to last week's Excel margin numbers for the same 3 top sub-categories. Are they identical? If not, by how much do they differ?",
    "Push the notebook and the .py script to GitHub. Paste the commit URL."
  ],
  3: [
    "Build the Discount-vs-Profit scatter (Excel or pandas) and save the PNG. Paste the GitHub raw URL.",
    "In a blank cell type =CORREL(Orders!O:O, Orders!R:R). Paste the value to 3 decimals.",
    "Bin Discount into 5 ranges (0%, 1-10%, 11-20%, 21-40%, 41%+). What is the average Profit per order in each bucket? Paste the 5 numbers.",
    "At which discount range does average Profit first turn negative? Paste the exact threshold range.",
    "Cross-tab Category × Discount Bucket on average Profit. Which Category × Bucket cell has the worst average profit?",
    "Pick a max-safe discount cap you would recommend to the business. Justify it in one sentence with one number from your analysis.",
    "Re-run the entire scatter for ONLY 2023 orders. Did the tipping point shift? By how much?",
    "Find the single worst order in the dataset by Profit. Paste Order ID, Sub-Category, Discount, Profit.",
    "Update your memo PDF to include the new discount section. Paste the GitHub link to memo v2.",
    "Tag the repo v0.2 in git and paste the release URL on GitHub."
  ],
  4: [
    "Compute CLV = SUM(Sales) per Customer ID. Paste the top 10 customers as a table (Customer ID, Name, CLV).",
    "What CLV thresholds did you use to split into VIP / Regular / Casual? Paste the three ranges.",
    "What percentage of customers are VIPs? What percentage of total revenue do they bring in? Paste both numbers.",
    "For each segment (VIP / Regular / Casual), name the top Category they buy. Paste the 3-row table.",
    "Compute repeat-buyer rate = customers with 2+ orders / total customers. Paste the percentage.",
    "How many days on average pass between a customer's 1st and 2nd order? Paste the median number.",
    "Define churn as no order in the last 180 days. How many customers are churned? Paste the count.",
    "Find the 5 customers who lost you the most money (largest negative profit total). Paste names and losses.",
    "Update your memo PDF with the customer section. Paste the link to memo v3 on GitHub.",
    "Tag the repo v0.3 and paste the release URL."
  ],
  5: [
    "Open sqliteonline.com and import Orders.csv. Run `SELECT COUNT(*) FROM Orders;` and paste the count.",
    "Rewrite Q1 margin pivot in SQL. Paste the full query.",
    "Paste the result: top 3 sub-categories by margin from the SQL query. Numbers must match your pivot from W1.",
    "Rewrite Q2 YoY using a CTE and self-join. Paste the full query.",
    "Compute median Sales using a window function. Paste the query and the median value.",
    "Write a query that returns the running total of Sales by Order Date. Paste the first 10 rows.",
    "Write a query that finds customers who bought in every quarter of 2023. Paste the count of such customers.",
    "Open queries.sql in your repo. How many queries does it contain? Each should have a one-line comment above explaining what it does.",
    "Validate: do your SQL margin numbers match your pandas and Excel numbers exactly? Yes or no, and which differ if any.",
    "Commit queries.sql and tag v0.4. Paste the release URL."
  ],
  6: [
    "Compute the 95% confidence interval for mean Sales per order. Paste the CI as [low, high].",
    "Run a two-sample t-test: average Sales for Consumer vs Corporate segment. Paste the p-value to 4 decimals.",
    "From your earlier work, list 3 correlations you found that are likely spurious (correlation does not imply causation). One sentence each.",
    "Compute Pearson r between Discount and Profit, and between Quantity and Profit. Paste both values.",
    "Find one example of Simpson's paradox in this dataset (an aggregated trend that flips when you split). Describe in 3 lines.",
    "Run a chi-square test of Region × Segment. Paste the p-value and your interpretation in one line.",
    "Bootstrap the mean Profit per order with 1000 resamples. Paste the 95% bootstrap CI.",
    "Apply Bonferroni correction across your 3+ pairwise tests. Which results stay significant after correction?",
    "Add a confidence band to your monthly sales line chart. Paste the chart PNG URL.",
    "Commit the stats notebook and update README with one statistically-supported claim. Paste the README URL."
  ],
  7: [
    "Open Cursor or ChatGPT. Generate working SQL for: 'top 5 customers by total profit in 2023'. Paste the prompt and the SQL it returned.",
    "Run the AI-generated SQL on your dataset. Did it work first try? If not, what did you have to fix?",
    "Use AI to critique your Week 1 memo PDF. Paste the AI's top 3 critiques and how you'll act on them.",
    "Generate speaker notes for your dashboard slides using AI. Paste 2 sets of speaker notes (one good, one bad).",
    "Have AI generate 3 hard Excel formulas you have not seen before. Test each one and paste both the formula and the result.",
    "Try the same 'generate SQL' prompt in 2 different AI tools (e.g. ChatGPT vs Claude). Which output was better and why?",
    "Have AI explain Simpson's paradox in 100 words for a non-technical reader. Paste the explanation.",
    "Write prompts.md with at least 5 reusable prompts you'd use weekly. Paste the GitHub link.",
    "Use AI to draft a 1-paragraph LinkedIn post about your Superstore finding. Paste the final published URL.",
    "Document 3 rules for when NOT to trust AI output. Paste the rules into prompts.md."
  ],
  8: [
    "Build your 5-slide executive deck. Paste the deck.pdf GitHub URL.",
    "Slide 1 must be a single headline insight, not a chart. Paste the exact headline sentence.",
    "Each of slides 2-4 must have exactly ONE chart and ONE takeaway sentence. Paste the 3 takeaways.",
    "Slide 5 is the recommendation. Paste your recommendation in one sentence with one supporting number.",
    "Time yourself pitching all 5 slides in under 5 minutes. Paste your total time.",
    "Have one real person watch the pitch. Paste their single biggest critique.",
    "Make a CFO-version of the deck that's all about money saved. Paste the GitHub link.",
    "Kill the chart on slide 3 and replace it with one giant number. Compare effectiveness in 2 lines.",
    "Save the deck as PDF and commit. Paste the v0.5 release URL.",
    "Post the headline insight on LinkedIn. Paste the post URL."
  ],
  9: [
    "List the 5 rough edges you fixed before v1.0. One line each.",
    "Reformat your memo as a polished PDF (proper margins, headers, no markdown leaks). Paste the link.",
    "Create an anonymized public version of the dataset (no customer names, etc). Paste the file URL.",
    "Find one stranger (Discord, Reddit, classmate) to read your project. Paste their single biggest critique.",
    "Apply the feedback to one specific thing. Paste the commit URL that addresses it.",
    "Write RETRO.md answering: what worked, what didn't, what I'll do differently next project. Paste the GitHub URL.",
    "Add your repo to your GitHub pinned repos. Paste a screenshot URL.",
    "Record a 2-minute Loom walkthrough of the dashboard. Paste the Loom URL.",
    "Post a screenshot of the dashboard on LinkedIn with a 1-sentence finding. Paste the post URL.",
    "Tag v1.0 and paste the release URL. PROJECT 1 is now COMPLETE."
  ],
  10: [
    "Download the IBM HR Attrition dataset from Kaggle. Paste the row count and column count.",
    "Compute the overall attrition rate (Attrition='Yes' / total). Paste the percentage to 1 decimal.",
    "Build a pivot of attrition rate by Department. Paste the 3-row table with rates.",
    "Build a pivot of attrition rate by JobRole. Which role has the highest? Paste the rate.",
    "Bucket MonthlyIncome into Low/Med/High thirds. Paste attrition rate per bucket.",
    "What is the attrition rate among OverTime='Yes' vs OverTime='No' employees? Paste both rates.",
    "Add a pivot for DistanceFromHome buckets (0-5, 6-15, 16+). Paste attrition per bucket.",
    "Compare attrition by Education level. Paste the table.",
    "Write the first paragraph of your README with the top 3 findings. Paste the GitHub link.",
    "Commit the file and tag v0.1. Paste the release URL."
  ],
  11: [
    "Bucket YearsAtCompany into 0-1, 2-5, 6-10, 11+ years. Build a pivot of attrition per bucket. Paste the 4 numbers.",
    "Which tenure bucket has the highest attrition? Was that surprising? Why or why not in one line.",
    "Build a pivot of YearsSinceLastPromotion buckets × attrition. Paste the table.",
    "Cross-tab tenure × JobRole on attrition rate. Which ROLE × TENURE combo is the worst?",
    "Cross-tab tenure × MonthlyIncome bucket. Paste the cell with the highest attrition rate.",
    "Build a cumulative-attrition chart: how many years until 50% of a cohort leaves? Paste the PNG URL.",
    "Add interaction: does OverTime hurt new hires (0-1 yr) more than veterans (11+ yr)? Paste the two attrition rates.",
    "Find the single ROLE × TENURE combination with the highest attrition. Paste it with the rate.",
    "Update your README with the new tenure findings. Paste the commit URL.",
    "Tag v0.2 and paste the release URL."
  ],
  12: [
    "Build a 4-KPI dashboard (Overall attrition, Top-risk department rate, OverTime rate, Avg tenure). Paste the dashboard image URL.",
    "Add 3 charts beneath the KPIs (attrition by tenure, by JobRole, by income bucket). Paste the dashboard PNG URL.",
    "Add a slicer/filter for Department. Confirm: when you click Sales, do the KPIs update? Yes or no.",
    "Write a 1-page HR memo recommending 3 concrete actions. Paste the memo PDF URL.",
    "Estimate dollar impact: cost to replace one employee × total annual attritions = X. Paste your number and the assumptions.",
    "Build a 4-slide executive deck. Paste the deck PDF URL.",
    "Time yourself pitching the deck in under 4 minutes. Paste your time.",
    "Add an 'overtime hours estimate' to your dashboard. Paste the formula or column you used.",
    "Have one person read the memo. Paste their single biggest question after reading.",
    "Tag v0.3 and paste the release URL."
  ],
  13: [
    "Polish the project. List the top 3 cosmetic fixes you made.",
    "Anonymize the dataset and commit the anonymized version. Paste the file URL.",
    "Add a SQL version of your top 5 queries. Paste queries.sql URL.",
    "Record a 3-minute demo video of the dashboard. Paste the YouTube/Loom URL.",
    "Get feedback from one HR professional or one experienced person. Paste their top critique.",
    "Apply the feedback. Paste the commit URL.",
    "Write RETRO.md (what worked, what didn't, what's next). Paste the GitHub URL.",
    "Post a screenshot on LinkedIn with one finding. Paste the post URL.",
    "Add the repo to your GitHub pinned. Paste a screenshot URL.",
    "Tag v1.0 and paste the release URL. PROJECT 2 is now COMPLETE."
  ],
  14: [
    "Pick a public practice site (books.toscrape.com or quotes.toscrape.com). Paste the URL and the contents of its robots.txt.",
    "Write a 5-line ETHICS.md for your scraping. Paste the file URL.",
    "Build a BeautifulSoup scraper for 5 pages with a 1-second rate limit. Paste the script URL.",
    "Scrape the data and save to scraped.csv. Paste the row count and the columns.",
    "Add a timestamp column to every scraped row. Paste the first 3 rows.",
    "Schedule the scraper to run daily (cron on Linux/Mac, Task Scheduler on Windows). Paste the cron expression or screenshot.",
    "Compute price-change deltas between two scrape runs. Paste 5 example deltas.",
    "Build a Google Sheets dashboard showing the price tracker output. Paste the public Sheet URL.",
    "Add an email or alert when price drops more than 20%. Paste the trigger script or rule.",
    "Push competitor-price-tracker repo to GitHub. Paste the URL."
  ],
  15: [
    "Download the Olist 9-CSV dataset from Kaggle. Paste the total row count across all 9 files.",
    "Draw a schema diagram showing how the 9 tables join. Paste the diagram image URL.",
    "Load the orders table and compute the funnel (created → approved → delivered → reviewed). Paste counts at each stage.",
    "Plot the delivery time distribution in days. Paste the PNG URL and the median delivery time.",
    "Compute Pearson r between delivery_time_days and review_score. Paste the value.",
    "What revenue (sum of price) was lost due to canceled orders? Paste the dollar figure.",
    "Build a customer-lifetime view: average orders per customer. Paste the number.",
    "Filter to São Paulo state only and recompute the funnel. Is it different? Paste both funnels side by side.",
    "Add findings paragraph to README. Paste the link.",
    "Tag v0.1 and paste the release URL."
  ],
  16: [
    "For each customer compute first-purchase month. Paste a sample of 5 rows.",
    "Build the cohort × month retention matrix (months 0 through 11). Paste the matrix image URL.",
    "What is the overall repeat-buyer rate (customers with 2+ orders / total)? Paste the percentage.",
    "Plot days-to-second-purchase histogram. Paste the PNG URL and the median days.",
    "Compare average order value: repeat vs one-time customers. Paste both numbers.",
    "Build a cohort matrix by STATE instead of month. Which state has the best retention?",
    "Build a cohort matrix by first-purchase Category. Which category drives the best repeat rate?",
    "Look at customers with 3+ orders. What is their average lifetime spend? Paste the number.",
    "Update README with the cohort findings. Paste the link.",
    "Tag v0.2 and paste the release URL."
  ],
  17: [
    "Pick a real product change to A/B test (button color, copy, layout). Write the hypothesis in one sentence.",
    "Compute required sample size for 80% power, 5% alpha, 5% MDE. Paste the number.",
    "Simulate 2 variants in Excel/pandas with a 2% true lift. Paste 10 example rows.",
    "Compute the lift (variant - control) / control. Paste the percentage.",
    "Compute the p-value via a two-sample z-test. Paste the value to 4 decimals.",
    "Justify the sample size in one short paragraph. Paste it into AB-PLAN.md and link the file.",
    "Add a secondary metric (e.g. clicks alongside conversions). What happens to your decision if primary wins but secondary loses?",
    "If MDE dropped to 1%, what is the new required sample size? Paste it.",
    "Write the ship/kill decision in one sentence based on your simulated result. Paste it.",
    "Commit AB-PLAN.md and paste the GitHub link."
  ],
  18: [
    "Build a 4-KPI dashboard for the Olist funnel project (overall conversion, repeat rate, avg delivery days, NPS proxy). Paste the dashboard PNG URL.",
    "Build a funnel chart showing drop-offs at each stage. Paste the PNG URL.",
    "Add 3 supporting charts to the dashboard. Paste the dashboard PNG URL.",
    "Write a 1-page memo summarizing the funnel insights and 2 recommendations. Paste the memo PDF URL.",
    "Build a 5-slide executive deck. Paste the deck PDF URL.",
    "Time yourself pitching the deck in under 5 minutes. Paste your time.",
    "Estimate dollar value of a 1pp improvement in repeat rate. Paste the calculation and result.",
    "Add a 'sellers' perspective dashboard view. Which 3 sellers have the worst funnel?",
    "Add a 'by-state' view. Which state has the worst funnel?",
    "Tag v0.3 and paste the release URL."
  ],
  19: [
    "Polish the project: list 3 cosmetic fixes you made.",
    "Add a SQL version of your 5 key queries. Paste queries.sql URL.",
    "Record a 3-minute demo video. Paste the URL.",
    "Get feedback from one experienced person. Paste their top critique.",
    "Apply the feedback. Paste the commit URL.",
    "Write RETRO.md (what worked, what didn't, what's next). Paste the link.",
    "Post the funnel chart on LinkedIn with a 1-sentence finding. Paste the post URL.",
    "Make a Kaggle notebook version of the analysis. Paste the Kaggle URL.",
    "Add the repo to your GitHub pinned. Paste screenshot URL.",
    "Tag v1.0 and paste the release URL. PROJECT 3 is now COMPLETE."
  ],
  20: [
    "Install Tableau Public. Paste the version number.",
    "Connect to Superstore data and confirm it loaded. Paste the row count Tableau reports.",
    "Build 4 KPI worksheets (Total Sales, Total Profit, Avg Margin, Top Region). Paste a screenshot of the 4 KPIs.",
    "Build a trend chart of monthly sales. Paste the screenshot URL.",
    "Build a bar chart of sales by sub-category. Paste the screenshot URL.",
    "Build a matrix (heatmap) of profit by Category × Region. Paste the screenshot URL.",
    "Assemble all into a single dashboard with a global Year filter. Paste the dashboard screenshot URL.",
    "Add a parameter that lets the user pick a year. Confirm it works. Paste a screenshot showing 2 different years.",
    "Build a US state map of total sales. Paste the screenshot URL.",
    "Publish to Tableau Public and paste the live URL. Same insights as your earlier Power BI version - 1 line on why both matter."
  ],
  21: [
    "Sign up for Google Cloud Free Tier. Paste your project ID.",
    "Upload Superstore Orders.csv to BigQuery. Paste the dataset.table name (e.g. superstore.orders).",
    "Run a quick query: SELECT COUNT(*) FROM your table. Paste the count.",
    "Install dbt-bigquery via pip. Paste `dbt --version` output.",
    "Initialize a new dbt project (dbt init) and configure profiles.yml to your BigQuery project. Paste the profiles.yml (with credentials redacted).",
    "Build one dbt model: monthly_sales_by_region as a SELECT from your raw orders. Paste the model SQL.",
    "Run `dbt run` and `dbt test`. Paste the test output showing pass.",
    "Add a unique test on order_id and a not_null test on order_date. Paste the schema.yml snippet.",
    "Build a second model: regional_yoy_growth using the same source. Paste the SQL.",
    "Push superstore-dbt repo to GitHub. Paste the URL."
  ],
  22: [
    "Pick your capstone scenario (e.g. ecommerce, healthcare, fintech). Write SPEC.md in 1 page. Paste the URL.",
    "Build a synthetic 3-source dataset (e.g. orders + products + customers). Paste the file URLs.",
    "Draw the schema diagram (ER style) showing how the 3 sources join. Paste the image URL.",
    "Build the data model with relationships in Excel/PowerBI/Tableau. Paste a screenshot.",
    "Compute 3 cross-source KPIs (each must touch at least 2 of the 3 sources). Paste the formulas and values.",
    "Add a 4th data source (e.g. weather, holidays, prices). Paste the file URL.",
    "Write the 'audience' section: who reads each future dashboard page and why? Paste the bullets.",
    "Pitch your spec to one real person in 2 minutes. Paste their top critique.",
    "Adjust the spec based on the critique. Paste the diff or update commit URL.",
    "Tag v0.1 and paste the release URL."
  ],
  23: [
    "Build Page 1 (Executive Overview) with 4 KPIs and 1 trend chart. Paste the screenshot URL.",
    "Build Page 2 (Sales Detail) with breakdowns by product, region, time. Paste the screenshot URL.",
    "Link a Region filter so it applies across both pages. Confirm with a screenshot of both pages filtered to one region.",
    "Add micro-trend arrows (up/down indicators) to each KPI on Page 1. Paste the screenshot.",
    "Add conditional formatting that flags any KPI below target in red. Paste the screenshot.",
    "Add a comment/notes column to the top-orders table on Page 2. Paste a screenshot.",
    "Time yourself navigating Page 1 → Page 2 with the filter. Is it under 2 seconds? If not, optimize the data.",
    "Capture both pages as PDFs and commit to the repo. Paste the GitHub link.",
    "Get one person to click around for 1 minute. Paste their feedback.",
    "Tag v0.2 and paste the release URL."
  ],
  24: [
    "Build Page 3 (Customer/Segment) with a cohort matrix. Paste the screenshot URL.",
    "Build Page 4 (Operations) with operational KPIs (avg cycle time, errors, throughput). Paste the screenshot URL.",
    "Add an alerts section to Page 1 that flags 3 KPIs in red when below target. Paste the screenshot.",
    "Build a unified filter panel (Year, Region, Segment) that applies to all 4 pages. Confirm with a screenshot.",
    "Polish branding (font, colors, logo). Paste before/after screenshots.",
    "Add a 5th page: drill into one customer's lifetime view. Paste the screenshot.",
    "Add a print-ready / export layout (1 page summary PDF). Paste the PDF URL.",
    "Add scenario comparison (this quarter vs target). Paste the screenshot.",
    "Get one stranger to read all 4 pages. Paste their biggest 'confusing' moment.",
    "Tag v0.3 and paste the release URL."
  ],
  25: [
    "Watch 1 storytelling fundamentals video (Cole Knaflic or similar, 20-30 min). Paste the URL.",
    "Distill your capstone into ONE sentence (under 20 words). Paste it.",
    "Redesign slide 1 around that headline only - no chart, just one big number or one sentence. Paste the slide screenshot.",
    "Kill 3 charts from your existing deck. Paste before/after slide counts.",
    "Write 30-second speaker notes for every remaining slide. Paste 3 sample notes.",
    "Self-record the full presentation. Paste the video URL.",
    "Show the recording to 1 person and get their first reaction (in 1 line).",
    "Replace one chart with a single big number formatted for impact. Paste before/after.",
    "Find one example of bad chart design (online) and remake it cleaner. Paste before/after images.",
    "Commit the polished deck PDF and paste the link."
  ],
  26: [
    "Write a 1-page CEO memo PDF summarizing your capstone findings + recommendations. Paste the PDF URL.",
    "Build an 8-slide board deck PDF. Paste the URL.",
    "Record a 3-minute demo video walking through the capstone. Paste the URL.",
    "Add a SQL version of every key KPI. Paste sql/ folder URL.",
    "Get 3 readers and paste their top critique each.",
    "Apply the most common critique. Paste the commit URL.",
    "Write capstone-specific RETRO.md. Paste the URL.",
    "Write ROADMAP_RETRO.md covering all 4 projects: what worked across the roadmap, what you'd do differently. Paste the URL.",
    "Apply to 1 real analyst job using the portfolio. Paste the company name (no email needed).",
    "Tag v1.0 and paste the release URL. ROADMAP COMPLETE."
  ],
  27: [
    "Inventory all your shipped projects (Superstore, HR, Marketing Funnel, Capstone). Paste the README-style summary.",
    "Set up a portfolio site (Vercel/Netlify or GitHub Pages). Paste the live URL.",
    "Write LinkedIn post #1 about Superstore. Paste the URL.",
    "Write LinkedIn post #2 about HR Attrition. Paste the URL.",
    "Write LinkedIn post #3 about Marketing Funnel or Capstone. Paste the URL.",
    "Update your LinkedIn About + Experience to mention the projects. Paste the LinkedIn profile URL.",
    "Update your GitHub README/profile pinned repos. Paste a screenshot.",
    "Practice 3 common analyst interview questions on video (Tell me about a project / SQL question / dashboarding question). Paste the video URL.",
    "Submit 1 real job application. Paste the company and role.",
    "Reach out to 3 working analysts on LinkedIn for 15-min chats. Paste the 3 messages you sent (DM-style)."
  ]
};

const DS = {
  1: [
    "Run `python --version` and `jupyter --version`. Paste both outputs.",
    "Open your TaxiPulse-Final.ipynb and paste the line of code that loads the October 2023 parquet file.",
    "After loading, run `df.shape`. Paste the row and column count.",
    "Paste the exact filter expressions you used to remove impossible trips (negative fares, zero distance, etc).",
    "From your busiest-hour chart, what is the busiest pickup hour and how many trips happened then? Paste both numbers.",
    "From your Q2 analysis, what is the average tip percentage on trips over 5 miles vs under 1 mile? Paste both.",
    "From your Q3 analysis, which day of the week has the highest average fare? Paste the day and the average.",
    "Group the busiest-hour chart by pickup borough. Does the busy hour change by borough? Yes/no + the busiest hour per borough.",
    "Plot trip_minutes as a histogram. Describe the shape in one sentence. Paste the PNG URL.",
    "Push the notebook + 3 chart PNGs + README to GitHub at repo named taxipulse-nyc. Paste the public URL."
  ],
  2: [
    "Watch 3 of 3Blue1Brown's lin alg / Bayes / grad descent videos. Paste the 3 video URLs.",
    "Load your TaxiPulse data with NumPy. Compute mean and std of fare_amount. Paste both.",
    "Normalize the fare column (mean 0, std 1) using NumPy only (no sklearn). Paste the line of code.",
    "Plot fare distribution before and after log-transform. Paste both PNG URLs and describe the change in one sentence.",
    "Compute Pearson correlation between distance and fare by hand using numpy (no .corr()). Paste the value to 4 decimals.",
    "Solve this Bayes problem by hand: 1% of trips are 'suspicious' (long, late-night). A flag system has 90% sensitivity, 5% false-positive rate. What's P(suspicious | flagged)? Paste your work in notes.txt.",
    "Compute the normal equation coefficients for fare = a*distance + b. Paste a and b. Do they match NYC's real per-mile + base fare?",
    "Solve a second Bayes problem (medical test: 0.5% prevalence, 95% sensitivity, 4% FP). Paste your worked solution.",
    "Commit math.ipynb + notes.txt to the taxipulse-nyc repo. Paste the commit URL.",
    "In one sentence, when you would use Bayes vs frequentist inference."
  ],
  3: [
    "Download the TLC zone lookup CSV. Paste the file row count.",
    "Merge zones into your trips dataframe. Paste df.shape after the merge.",
    "Plot trips-by-hour for each borough (5 subplots). Paste the figure URL.",
    "Download Sept and Nov 2023 parquets and concat with October. Paste the total row count.",
    "Plot daily trip volume across Q4 (Oct-Dec). Paste the chart URL.",
    "What day in Q4 had the fewest trips? Paste the date and count. Any guess why?",
    "Plot tip% by borough. Paste the chart and the top borough by tip%.",
    "Build a heatmap of trips by hour × day-of-week. Paste the URL.",
    "Compare weekday vs weekend traffic by borough. Paste the comparison table.",
    "Update TaxiPulse-Final.ipynb with the borough section and tag v0.2. Paste the release URL."
  ],
  4: [
    "Set up SQLite Online and import 100k taxi rows + zone lookup. Confirm with SELECT COUNT(*) on each. Paste both counts.",
    "Rewrite the busiest-hour query in SQL. Paste the query and the top 5 hours.",
    "Rewrite tip% by borough in SQL. Paste the query.",
    "Rewrite a trip-count-by-day query in SQL. Paste the query.",
    "Use ROW_NUMBER() to get top 3 highest-fare trips per borough. Paste the query and result.",
    "Write a CTE that first aggregates daily trips, then ranks them. Paste the query.",
    "Write a query that finds outlier trips (fare > 99th percentile of distance bucket). Paste the query and 5 example rows.",
    "Validate: do your SQL totals exactly match your pandas totals from W3? Yes or no.",
    "Save 10 commented queries to queries.sql. Paste the GitHub URL.",
    "In one line: when do you reach for SQL vs pandas?"
  ],
  5: [
    "Pick 5 features for fare prediction. Paste the list with one-line justification each.",
    "Train a LinearRegression baseline. Paste the test MAE.",
    "Paste the coefficient for distance. Does it look like NYC's real per-mile rate (~$3-4)? Why?",
    "Train an XGBoost regressor. Paste the test MAE.",
    "Which model wins on MAE? Paste both and the winner.",
    "Plot residuals (predicted vs actual). Paste the URL. Where does the model fail?",
    "Add passenger_count as a feature. Does it help MAE? Paste before/after.",
    "Build a model just for trips inside Manhattan. Paste the new MAE.",
    "Find 5 test rows the model is hugely wrong on. Paste them and a one-line guess why.",
    "Save the winning model with joblib and tag v0.3. Paste the model file URL."
  ],
  6: [
    "Compute 95% confidence interval for mean fare. Paste [low, high].",
    "Run a two-sample t-test on average fare in Manhattan vs Brooklyn. Paste the p-value.",
    "Compute Cohen's d effect size for the same comparison. Paste the value and your interpretation in one line.",
    "Run a chi-square test of borough × payment_type. Paste the p-value.",
    "Apply Bonferroni correction to 10 pairwise borough comparisons. Which remain significant?",
    "Bootstrap the mean fare with 1000 resamples. Paste the 95% bootstrap CI.",
    "Run an ANOVA across all 5 boroughs on fare. Paste the F-statistic and p-value.",
    "Run Shapiro-Wilk on log(fare). Is it normal? Paste the result.",
    "Add one statistically-significant claim to your README, with the test name and p-value cited.",
    "Commit inference.ipynb. Paste the URL."
  ],
  7: [
    "Save your fare model with joblib. Paste model.pkl filename and size.",
    "Write a Flask app with /predict and /health endpoints. Paste app.py URL.",
    "Test locally: curl POST /predict with a sample trip. Paste the response.",
    "Add gunicorn + requirements.txt. Paste requirements.txt contents.",
    "Deploy to Render or Railway. Paste the live URL.",
    "curl your live /predict endpoint. Paste the response.",
    "Add input validation: distance must be positive, hour must be 0-23. Paste the validation code.",
    "Add a /batch endpoint that takes a list of trips. Paste 1 example request and response.",
    "Log every prediction with timestamp. Paste 3 example log lines.",
    "Tag v0.4 and paste the release URL."
  ],
  8: [
    "Pick a target site (Hacker News, books.toscrape.com). Paste robots.txt contents.",
    "Write ETHICS.md: 5 rules you'll follow. Paste the URL.",
    "Build a BS4 scraper for HN front page. Paste the script URL and the first 5 stories.",
    "Add pagination: scrape 5 pages with a 1-second rate limit. Paste the row count.",
    "Use a pretrained sentiment model to tag the scraped titles. Paste a sample of 10 rows.",
    "Plot the sentiment distribution. Paste the PNG.",
    "Add comment counts to your scrape. Paste 5 example rows.",
    "Compare BS4 speed vs Scrapy on 10 pages. Paste both times.",
    "Push hn-scraper repo with scrape.py + ETHICS.md + sample data. Paste the URL.",
    "Write one paragraph in the README about why you respect robots.txt."
  ],
  9: [
    "Install Streamlit. Paste `streamlit --version`.",
    "Build the sidebar with 4 controls (borough, hour range, day-of-week, fare cap). Paste a screenshot.",
    "Wire your fare model in: user picks distance + hour, app shows predicted fare. Paste a screenshot of a prediction.",
    "Add the Q4 daily trend chart, filtered by borough. Paste the screenshot.",
    "Add a heatmap of trips by hour × day-of-week. Paste the screenshot.",
    "Add a compare-2-boroughs mode side by side. Paste the screenshot.",
    "Cache the parquet load with @st.cache_data. Confirm refresh time improved. Paste before/after.",
    "Deploy to Streamlit Cloud. Paste the live URL.",
    "Get one person to try the app. Paste their first reaction.",
    "Tag v0.5 and paste the release URL."
  ],
  10: [
    "List 10 rough edges in the TaxiPulse project. One line each.",
    "Fix at least 5 of them. Paste the diff or commit URLs.",
    "Add docstrings + markdown context to every notebook section. Paste a screenshot of one polished section.",
    "Profile your slowest cell. Paste the time before and after optimization.",
    "Add a profile photo + bio to the notebook header. Paste the screenshot.",
    "Get one stranger (Discord, Reddit, friend) to read the notebook. Paste their top critique.",
    "Apply the critique. Paste the commit URL.",
    "Write RETRO.md. Paste the URL.",
    "Write a 1-paragraph 'How I made this' blog post (Medium / Dev.to). Paste the URL.",
    "Tag v1.0 and paste the release URL. PROJECT 1 COMPLETE."
  ],
  11: [
    "Install Cursor (or your AI coding tool). Paste the version.",
    "Test 4 prompt patterns (zero-shot, few-shot, chain-of-thought, role-prompt). Paste examples + outputs.",
    "Generate working SQL for: 'top 5 boroughs by avg tip% in 2023'. Paste the prompt and the SQL.",
    "Run the generated SQL on TaxiPulse data. Paste the result.",
    "Apply AI code review to one of your previous functions. Paste the function + the AI critique.",
    "Try the same SQL prompt in 2 different AI tools (Claude, ChatGPT, Perplexity). Which gave the better SQL?",
    "Use AI to write 3 unit tests for one of your functions. Paste the tests and confirm they pass.",
    "Have AI explain one paper from arxiv.org in 100 words. Paste the explanation.",
    "Write prompts.md with 5 reusable prompts. Paste the URL.",
    "Publish one AI-drafted paragraph as a LinkedIn or Dev.to post. Paste the live URL."
  ],
  12: [
    "Create a public repo named reddit-sentiment. Paste the URL.",
    "Get Reddit API credentials. Paste the client_id (no secret).",
    "Write scrape.py to fetch 1000 r/MachineLearning posts. Paste the script URL.",
    "Save the raw posts to data/raw.csv. Paste the row count.",
    "Write label.py using a HuggingFace pretrained sentiment model. Paste the script URL.",
    "Save labeled.csv. Paste 5 example rows (title + label + score).",
    "Plot the sentiment distribution. Paste the PNG URL.",
    "Scrape another subreddit (r/learnmachinelearning) and compare distributions. Paste both side by side.",
    "Also scrape the top 5 comments per post. Paste 3 example rows.",
    "Tag v0.1 and paste the release URL."
  ],
  13: [
    "Hand-label 200 posts as a gold set (positive / neutral / negative). Paste a sample of 20 with your labels.",
    "Split into 160 train + 40 test. Paste the split sizes.",
    "Vectorize with TF-IDF + 1-2 grams. Paste the vectorizer config.",
    "Train LogisticRegression baseline. Paste the test accuracy.",
    "Print top 10 features per class. Paste them.",
    "Run the pretrained model on the same test set. Paste its accuracy.",
    "Which is better, baseline or pretrained? Paste both numbers and explain in one line.",
    "Try Naive Bayes alongside LogReg. Paste its accuracy.",
    "Plot a confusion matrix for your best model. Paste the URL.",
    "Save vectorizer.pkl + baseline.pkl and tag v0.2. Paste the release URL."
  ],
  14: [
    "Write your A/B hypothesis in one sentence (e.g. 'few-shot prompt vs zero-shot improves accuracy by 5pp').",
    "Compute required sample size for 80% power, 5% alpha, 5% MDE. Paste the number.",
    "Run both prompts on the same 100 posts. Paste 10 example rows with both predictions.",
    "Compute accuracy lift = (variant_acc - control_acc) / control_acc. Paste the percentage.",
    "Compute p-value via a two-sample test. Paste it to 4 decimals.",
    "Compute Cohen's d effect size. Paste the value.",
    "Run on 200 posts instead. Does the verdict change? Yes/no + the new p-value.",
    "Try a 3rd variant (one-shot example). Paste its accuracy and how it compares.",
    "Write the ship-or-kill decision in one line. Paste it.",
    "Commit ab/REPORT.md and paste the URL."
  ],
  15: [
    "Move to Colab T4 (or local GPU). Paste a screenshot of the GPU info from nvidia-smi.",
    "Tokenize the gold set with DistilBERT tokenizer. Paste the line of code.",
    "Train for 3 epochs. Paste the final eval accuracy.",
    "Beat your TFIDF baseline accuracy. Paste both numbers and the improvement.",
    "Save the fine-tuned model with Git LFS. Paste the LFS-tracked file URL.",
    "Try a smaller model (ALBERT or distilroberta). Paste its accuracy and inference time.",
    "Run a learning-rate sweep with 3 values (1e-5, 2e-5, 5e-5). Paste the 3 results.",
    "Plot training loss + eval accuracy over epochs. Paste the URL.",
    "Update README with the eval table. Paste the URL.",
    "Tag v0.3 and paste the release URL."
  ],
  16: [
    "Install SHAP. Paste `shap.__version__`.",
    "Run LinearExplainer on your TFIDF baseline. Paste 3 lines of code.",
    "Generate a SHAP summary bar plot. Paste the URL.",
    "Generate a force plot for a single prediction. Paste the URL.",
    "Find ONE bias in the model (a feature it relies on that it shouldn't). Document in BIASES.md.",
    "Compute SHAP for the 20 worst misclassifications. Paste the URL of that aggregated plot.",
    "If you have an XGBoost model from earlier, run TreeExplainer on it. Paste the summary plot.",
    "Build a small Streamlit page that shows SHAP per user input. Paste the live URL.",
    "Write an explainability section in README. Paste the URL.",
    "Commit both SHAP plots + BIASES.md. Paste the commit URL."
  ],
  17: [
    "Use Faker to generate 100 fake users. Paste 5 example rows.",
    "Apply SMOTE to one of your imbalanced datasets. Paste the class counts before and after.",
    "Train your model with and without SMOTE. Paste the two accuracies AND the change in F1 for the minority class.",
    "Quantify the trade-off in one sentence: did SMOTE help or hurt the rare class on real held-out data?",
    "Try ADASYN instead. Paste the same comparison.",
    "Compare bootstrap resampling vs SMOTE. Which approach gave more honest results?",
    "Use an LLM to paraphrase 50 minority-class posts (Reddit). Paste 3 examples of original + paraphrased.",
    "Retrain with the LLM-augmented data. Paste the new accuracy.",
    "Document one case when synthetic data is dangerous (paste into synth.ipynb).",
    "Commit synth.ipynb and paste the URL."
  ],
  18: [
    "Write a predict() function that takes raw text and returns sentiment label + score. Paste the function.",
    "Build a Streamlit dashboard with a refresh button. Paste the live URL.",
    "Show sentiment bar chart + most positive + most negative posts. Paste the screenshot.",
    "Save snapshots of sentiment per refresh to history.csv. Paste 5 example rows.",
    "Add a sentiment-by-hour heatmap for the past day. Paste the screenshot.",
    "Add a subreddit picker (3+ subs). Confirm switching works. Paste 2 screenshots.",
    "Add a sound or visual alert when negativity spikes above threshold. Describe how it triggers.",
    "Cache the model load with @st.cache_resource. Paste before/after refresh time.",
    "Deploy to Streamlit Cloud. Paste the live URL.",
    "Tag v0.4 and paste the release URL."
  ],
  19: [
    "Build a FastAPI app with POST /predict that takes a list of texts. Paste main.py URL.",
    "Test locally: curl POST with sample text. Paste the response.",
    "Write Dockerfile. Paste it.",
    "Build the image and run it locally. Paste `docker ps` output.",
    "Push the image to a public registry (Docker Hub or HF Spaces). Paste the image URL.",
    "Deploy to HF Spaces. Paste the live API URL.",
    "Update your Streamlit dashboard to call this API instead of running the model in-process. Confirm with a screenshot.",
    "Add JWT auth on the API. Paste an example request with auth header.",
    "Add rate limiting (slowapi). Paste the rate limit decorator and config.",
    "Add /batch endpoint that takes 1000 texts efficiently. Paste timing for 1000 texts vs single-shot."
  ],
  20: [
    "Polish the project: list the 3 top fixes you applied.",
    "Write a 1000-1500 word blog post about the project. Paste the live URL.",
    "Record a demo video walking through the architecture. Paste the YouTube/Loom URL.",
    "Get 3 readers and paste their top critique each.",
    "Apply the most common critique. Paste the commit URL.",
    "Write RETRO.md. Paste the URL.",
    "Add a 'cite as' BibTeX snippet to the README. Paste it.",
    "Cross-post the blog on Medium. Paste the URL.",
    "Submit to /r/MachineLearning weekly thread for feedback. Paste the post URL.",
    "Tag v1.0 and paste the release URL. PROJECT 2 COMPLETE."
  ],
  21: [
    "Download AEP_hourly.csv from Kaggle. Paste the row count and date range.",
    "Set up energy-forecast repo. Paste the URL.",
    "Plot the full 10-year series. Paste the PNG URL.",
    "Decompose into trend / seasonal / residual using seasonal_decompose. Paste the 3-panel plot URL.",
    "Build a hour × day-of-week heatmap. Paste the URL.",
    "Compute the persistence baseline MAE (predict y_t = y_t-24). Paste the value.",
    "Try a 2nd series (COMED, DUQ, or PJM_East) alongside AEP. Paste a comparison plot.",
    "Plot just summer 2023 vs winter 2023 to see seasonality. Paste both PNGs.",
    "Compute the ACF (autocorrelation function) plot. Paste the URL. At what lag does autocorrelation peak?",
    "Tag v0.1 and paste the release URL."
  ],
  22: [
    "Run the ADF stationarity test on the raw series. Paste the p-value.",
    "Difference until stationary. How many differences did you need? Paste the new ADF p-value.",
    "Fit auto_arima on daily aggregated data. Paste the chosen (p, d, q) order.",
    "Forecast 30 days ahead. Compute MAE on the test set. Paste the value.",
    "Plot the forecast with confidence intervals. Paste the URL.",
    "Compare ARIMA MAE vs persistence baseline. Which won? By how much?",
    "Try SARIMAX with weekly + yearly seasonality. Paste the seasonal order and new MAE.",
    "Use AICc to compare 3 candidate models. Paste the table.",
    "Save arima.pkl. Paste the file URL.",
    "Tag v0.2 and paste the release URL."
  ],
  23: [
    "Format your data as ds / y columns for Prophet. Paste df.head().",
    "Fit baseline Prophet (no holidays, no extra regressors). Paste training time.",
    "Add US holidays. Compare MAE before vs after. Paste both values.",
    "Evaluate on 30-day test set. Paste the MAE.",
    "Plot the components (trend + weekly + yearly). Paste the URL. Which seasonal pattern is strongest?",
    "Add temperature as an extra regressor (download from NOAA or similar). Paste the new MAE.",
    "Try changepoint_prior_scale = 0.01, 0.05, 0.5. Paste the 3 MAEs.",
    "Forecast 90 days instead of 30. Paste MAE for that horizon.",
    "Compare Prophet vs ARIMA on the same test set. Which wins on MAE?",
    "Save the prophet model + components plot. Tag v0.3 and paste the release URL."
  ],
  24: [
    "Build sliding windows of length 30 (use 30 days to predict day 31). Paste X.shape and y.shape.",
    "Define a small LSTM in PyTorch (1 layer, 32 units). Paste the model class.",
    "Train for 50 epochs. Paste the final training and validation loss.",
    "Predict next-day demand for 30 days. Compute MAE. Paste the value.",
    "Compare LSTM MAE vs Prophet vs ARIMA vs persistence. Paste the 4-model table.",
    "Increase the window to 60 days. Paste the new MAE.",
    "Add a second LSTM layer. Paste the new MAE.",
    "Try a GRU instead of LSTM. Paste its MAE.",
    "Save the best LSTM model with torch.save. Paste the file URL.",
    "Tag v0.4 and paste the release URL."
  ],
  25: [
    "Install MLflow and start the UI. Paste `mlflow ui` startup output.",
    "Track a baseline Prophet run with mlflow.log_param + mlflow.log_metric. Paste the run URL/screenshot.",
    "Sweep 3 hyperparameter values for one parameter. Paste the run comparison table.",
    "Promote the best model to a 'Production' registry stage. Paste a screenshot showing the stage.",
    "Track the model artifact (the .pkl file). Confirm it shows up in MLflow UI. Paste the screenshot.",
    "Install Evidently. Run a drift report comparing 2 different months of data. Paste the HTML report URL.",
    "Build a daily drift-alarm script that fires when KS p-value < 0.05. Paste the script.",
    "Send drift alerts to a Slack webhook (or email). Paste the webhook code.",
    "Document the entire MLOps setup in MLOPS.md. Paste the URL.",
    "Tag v0.6 (MLOps milestone) and paste the release URL."
  ],
  26: [
    "Sign up for AWS Free Tier and create an IAM user (NOT root). Paste a screenshot of the user (no keys).",
    "Install + configure AWS CLI. Paste `aws sts get-caller-identity` output.",
    "Upload your model.pkl to an S3 bucket. Paste the bucket URI.",
    "From Python, load the model back from S3 with boto3. Paste the 5 lines of code.",
    "Create a Google Cloud project + open BigQuery. Paste the project ID.",
    "Run your busiest-hour query on the 38M-row public NYC TLC dataset. Paste the query and runtime.",
    "Compare BigQuery runtime to pandas runtime on the local 1-month file. Paste both times.",
    "Estimate BigQuery cost for 3 different query patterns. Paste your numbers.",
    "Document the entire cloud setup in CLOUD.md (S3 + BigQuery). Paste the URL.",
    "Save final FlightWise predictions to BigQuery. Paste the table name."
  ],
  27: [
    "Pick the winning forecasting model. Paste the model name + final MAE.",
    "Build a dashboard (Streamlit) for forecasts. Paste the live URL.",
    "Deploy somewhere public. Paste the live URL.",
    "Write a 1000-word blog post about the project. Paste the URL.",
    "Record a demo video. Paste the URL.",
    "Get 3 readers and paste their top critique each.",
    "Apply feedback. Paste the commit URL.",
    "Write RETRO.md. Paste the URL.",
    "Submit the blog to Hacker News or to the PJM data community. Paste the post URL.",
    "Tag v1.0 and paste the release URL. PROJECT 3 COMPLETE."
  ],
  28: [
    "Pick your capstone topic. Paste a 1-sentence description.",
    "Write SPEC.md (problem, data sources, success metric). Paste the URL.",
    "Verify every data source is accessible: paste 3 source URLs and confirm you can download from each.",
    "Plan the next 2 weeks in ROADMAP.md (W29 build + W30 ship). Paste the URL.",
    "Build a 100-row prototype that proves the analysis is feasible. Paste the notebook URL.",
    "Pitch your spec to one friend in 2 minutes. Paste their top critique.",
    "Search GitHub for 3 similar projects. Paste the URLs and what each did NOT do.",
    "Pick the metric you'd be most embarrassed if it's bad. Paste it.",
    "Adjust the spec based on what you learned. Paste the commit URL.",
    "Tag v0.1 and paste the release URL."
  ],
  29: [
    "Collect all data. Paste the total row count across sources.",
    "Clean everything. Paste the rows-removed count and the reason for each filter.",
    "Run EDA. Paste 5 plots (histograms, scatters, etc) PNG URLs.",
    "Train a baseline model. Paste its main eval metric.",
    "Train a better model. Paste its main eval metric.",
    "Build a comparison table (baseline vs better). Paste it.",
    "Try a 3rd model just for sport. Paste its result.",
    "Document one wrong path you took today. One paragraph in NOTES.md. Paste the URL.",
    "Save all predictions to a CSV for later inspection. Paste the file URL.",
    "Tag v0.2 and paste the release URL."
  ],
  30: [
    "Build the capstone demo (notebook OR app OR API). Paste the live URL or notebook URL.",
    "Deploy or publish wherever applicable. Paste the public URL.",
    "Write a 1500-2000 word blog post about it. Paste the URL.",
    "Record a 3-5 minute demo video. Paste the URL.",
    "Update your portfolio site with this project. Paste the portfolio URL.",
    "Confirm all 4 projects are listed on the portfolio. Paste a screenshot.",
    "Get 5 readers. Paste 5 single-line critiques.",
    "Write capstone-specific RETRO.md. Paste the URL.",
    "Write ROADMAP_RETRO.md covering all 4 projects. Paste the URL.",
    "Tag v1.0 and paste the release URL. ROADMAP COMPLETE."
  ],
  31: [
    "Inventory all 4 shipped projects. Paste a README-style summary.",
    "Set up a portfolio site (Vercel/Netlify or GitHub Pages). Paste the live URL.",
    "Write LinkedIn post #1 about TaxiPulse. Paste the URL.",
    "Write LinkedIn post #2 about Reddit Sentiment. Paste the URL.",
    "Write LinkedIn post #3 about Energy Forecast or Capstone. Paste the URL.",
    "Update your LinkedIn About + Experience to mention the projects. Paste the LinkedIn URL.",
    "Update your GitHub pinned repos. Paste a screenshot.",
    "Practice 3 common DS interview questions on video (ML concepts / SQL / system design). Paste the video URL.",
    "Submit 1 real job application. Paste the company and role.",
    "Reach out to 3 working data scientists on LinkedIn for 15-min chats. Paste the 3 DMs."
  ]
};

function applyTo(file, byNumber) {
  const p = path.join(ROOT, file);
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  let n = 0;
  for (const w of d.weeks) {
    const q = byNumber[w.number];
    if (q && q.length === 10) {
      w.mastery_questions = q;
      n++;
    }
  }
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
  console.log(file, "- mastery_questions written to", n, "of", d.weeks.length, "weeks");
}

applyTo("data-analysis.json", DA);
applyTo("data-science.json", DS);
