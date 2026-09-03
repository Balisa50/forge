/**
 * Mastery checks rewrite v2 - data-analyst-interview-style puzzles.
 * Every question forces creative application of the week's concepts on the
 * real dataset. No "paste the number you already have" busywork - each one
 * is a "hunt / compare / spot the surprise / predict" puzzle.
 *
 *   "They should feel like smiling when doing the thing."
 *
 * Run from repo root:  node scripts/rewrite-mastery-puzzles.cjs
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "data", "roadmaps");

const DA = {
  1: [
    "Hunt for your top customer of 2023: who spent the most? Paste their Customer Name and total Sales.",
    "Q4 2023 versus Q4 2022 - which quarter was better in Sales? By how many dollars AND what percent?",
    "Find the surprise: is there ANY Sub-Category where giving HIGHER average discount came with HIGHER profit margin? Name it if yes, write 'none found' if no.",
    "The bad-customer puzzle: find ONE customer with 5+ orders but NEGATIVE total profit. Paste their name and total profit number.",
    "Median test: what is the median Sales-per-order in the West vs the East? Which median is higher and by how many dollars?",
    "The Sub-Category race: which Sub-Category grew its Sales the most from 2020 to 2023 in dollars? Paste the 2020 and 2023 totals.",
    "Saturday vs Wednesday: use =WEEKDAY() to extract day-of-week. Is average Profit per order higher on weekends or weekdays? Paste both averages.",
    "First Class is supposed to be premium. But which Ship Mode actually has the highest profit margin? Was it the one you expected?",
    "2024 projection: if 2024 Sales grew at the same compound rate that 2020-2023 did, what would 2024 Sales be? Paste your formula and the answer.",
    "The 30-second test: show your dashboard to one real person without explaining anything. What was the FIRST insight they spotted? Did it match yours?"
  ],
  2: [
    "Re-run W1's top-2023-customer hunt in pandas. Same answer? Paste the one-liner you used: df.groupby(...) ...",
    "In pandas, find the Sub-Category with the BEST profit margin (Profit/Sales) and the WORST. Paste both with percentages to 2 decimals.",
    "Using pandas, what percent of total Sales comes from the West region? Compute it in one line. Paste line + answer.",
    "Plot monthly Sales for 2023 as a line chart. Which calendar MONTH is the worst? Paste the PNG GitHub URL and name the month.",
    "Using df.groupby and df.agg, build a table showing Sales, Profit, Margin per Category for ALL years. Paste the table.",
    "Speed test: time the pandas version of your Region YoY analysis vs Excel. Paste both seconds. Which is faster on 10k rows?",
    "Write monthly_report.py so that running 'python monthly_report.py' prints the top 5 Sub-Categories by Profit for the latest month. Paste the script URL.",
    "Schedule monthly_report.py to run on the 1st of every month. Paste a screenshot of the Task Scheduler entry (Windows) or your crontab line (Mac/Linux).",
    "Pandas catch: count how many rows have Profit < 0. Then count Sales < 0 (returns). What is the dollar value of returns?",
    "Push notebook + script + monthly report PNG to GitHub. Paste the commit URL that contains all three files."
  ],
  3: [
    "Run =CORREL(Discount, Profit) on the FULL dataset. Now filter to just Office Supplies and re-run. Paste both numbers - did the relationship change?",
    "Find the discount tipping point: at what discount % does AVERAGE Profit go from positive to negative? Paste the exact bucket.",
    "Discover the smart-discount Sub-Category: find one Sub-Category where 20%+ discount actually INCREASED order volume enough to offset margin loss. Or prove none exists.",
    "Build a 3D scatter (or 2D with size=Quantity) showing Discount vs Profit vs Quantity. Paste the PNG URL.",
    "Find the single worst order in the dataset by Profit. Paste Order ID, Customer, Sub-Category, Discount, Quantity, Profit.",
    "The category split: for EACH Category, what was the average margin at 0% discount vs 30%+ discount? Paste the 3-row comparison.",
    "Predict the cap: based on your tipping point, write ONE recommendation to the business in 1 sentence with 1 number.",
    "Compare 2023 vs 2020: did the discount-profit relationship get worse over time? Paste both correlation values.",
    "Push memo v2 PDF that includes a chart + the recommendation + the data behind it. Paste the GitHub URL.",
    "Tag v0.2 and paste the GitHub release URL."
  ],
  4: [
    "Find your VIP: the single highest-CLV customer across all 4 years. Paste name + total Sales + their favorite Category.",
    "Build the VIP/Regular/Casual split using the 33rd and 66th percentiles. Paste the 3 thresholds.",
    "Compare what each segment buys: what % of VIP spend goes to Technology vs Office Supplies vs Furniture? Paste the 9-cell breakdown.",
    "The repeat-buyer puzzle: what percent of customers placed 2+ orders? What about 5+? Paste both numbers.",
    "Find the 3 customers who lost you the MOST money (largest negative total Profit). Paste names and losses.",
    "Days-between-orders: for customers with 2+ orders, what is the MEDIAN gap between their 1st and 2nd order in days?",
    "The churn definition: how many customers placed an order in 2020-2022 but NOT in 2023? Paste the count and one likely reason.",
    "VIP comparison: do VIPs have BETTER or WORSE profit margins than Casual customers? Paste both margins.",
    "Push memo v3 with the customer section. Paste the GitHub link.",
    "Tag v0.3 and paste the release URL."
  ],
  5: [
    "Write a SQL query that returns the top 5 customers of 2023 by total Sales. Paste query + result.",
    "Rewrite the Sub-Category margin pivot in SQL. Do your top 3 and bottom 3 match Excel exactly? Paste the query.",
    "Use a CTE to compute YoY growth per Region. Paste the query.",
    "Use a window function to rank customers by Sales WITHIN each Region. Paste the query and the top 1 per region.",
    "Compute MEDIAN Sales per order using a window function. Paste the query and the value.",
    "Write a running-total query: cumulative Sales by Order Date. Paste the first 10 rows.",
    "Find customers who bought in every single quarter of 2023. Paste the count.",
    "Catch the duplicates: write a query to find Order IDs that appear more than once. Paste count + first 5 examples.",
    "Validate: does your SQL Sales total match your Excel total to the dollar? Yes or no, and the difference if any.",
    "Push queries.sql with all 10 commented queries. Tag v0.4 and paste the release URL."
  ],
  6: [
    "Compute the 95% confidence interval for average Profit per order. Paste [low, high].",
    "Compare Consumer vs Corporate segment average Sales: run a t-test, paste the p-value AND Cohen's d.",
    "Find your Simpson's paradox: an aggregated trend that flips when you split by another column. Describe it in 3 lines.",
    "Compute Pearson r between Quantity and Profit. Now Quantity and Margin. Are they the same direction? Why or why not.",
    "Bootstrap the median Sales with 1000 resamples. Paste the 95% bootstrap CI.",
    "Run a chi-square: is Segment independent of Region? Paste p-value and your one-line interpretation.",
    "Apply Bonferroni to 3 pairwise segment comparisons (Consumer vs Corporate, Consumer vs Home Office, Corporate vs Home Office). Which stay significant?",
    "List 2 correlations in your data that are almost certainly spurious (correlated but unrelated). One sentence each.",
    "Add a 95% confidence band to your monthly trend chart. Paste the PNG URL.",
    "Update README with one statistically-supported claim citing the test + p-value. Paste the URL."
  ],
  7: [
    "Ask AI to generate SQL for: 'top 5 customers in West region by 2023 profit'. Paste the prompt + the SQL it gave. Did it run first try? If not, what did you fix?",
    "Ask AI to critique your W1 memo PDF. Paste the top 3 critiques and which one you'll act on.",
    "Have AI generate 3 Excel formulas that solve real Superstore puzzles you have not solved. Test each. Paste the formulas + the answers.",
    "Have AI write speaker notes for your 5-slide deck. Paste 2 sets (slide 1 + slide 5). Are they better than yours?",
    "Test the same SQL prompt in 2 AIs (ChatGPT + Claude or Perplexity). Which gave the better SQL? Why?",
    "Have AI explain Simpson's paradox in 100 words to a non-technical person. Paste the explanation. Would your aunt understand?",
    "Find one case where AI hallucinated. Paste the prompt + the wrong answer + what you caught.",
    "Have AI draft a 100-word LinkedIn post about your Superstore finding. Edit it. Publish. Paste the post URL.",
    "Write prompts.md with the 5 prompts you would re-use weekly. Paste the GitHub URL.",
    "Add 3 rules for when NOT to trust AI to prompts.md. Paste the rules."
  ],
  8: [
    "Distill your 9-week Superstore work into ONE headline sentence under 20 words. Paste it.",
    "Slide 1: that headline + ONE big number. Paste the slide screenshot.",
    "Slides 2-4: one chart + one takeaway sentence each. Paste the 3 takeaway sentences.",
    "Slide 5 must be a SPECIFIC recommendation with a dollar impact estimate. Paste the recommendation and the number.",
    "Time yourself pitching all 5 slides cold. Paste your time. Goal: under 5 minutes.",
    "Make the CFO-version: same deck, all about money saved. Paste the GitHub link.",
    "Make the OPS-version: same deck, all about discount caps and ship mode changes. Paste the link.",
    "Kill the chart on slide 3 and replace it with one giant number. Compare effectiveness in 2 lines.",
    "Have one real person watch the pitch. Paste their single biggest critique.",
    "Tag v0.5 and post the headline insight + a key chart on LinkedIn. Paste the post URL."
  ],
  9: [
    "List the 5 cosmetic edges you fixed before v1.0. One line each.",
    "Reformat the memo as a polished 1-page PDF (proper margins, no markdown leaks). Paste the link.",
    "Create an anonymized public dataset (remove customer names, mask postal codes). Paste the file URL.",
    "Recruit one stranger (Discord, Reddit, classmate) to read the project. Paste their single biggest critique.",
    "Apply the feedback. Paste the commit URL that fixes it.",
    "Write RETRO.md: what worked, what failed, what you would do differently. Paste the URL.",
    "Add the repo to your GitHub PINNED repos. Paste a screenshot.",
    "Record a 2-minute Loom walkthrough of the dashboard. Paste the Loom URL.",
    "Post a dashboard screenshot on LinkedIn with a 1-sentence finding. Paste the post URL.",
    "Tag v1.0. PROJECT 1 COMPLETE. Paste the release URL."
  ],
  10: [
    "Hunt for the worst department: which Department has the highest attrition rate? Paste the rate.",
    "Find the most-at-risk job: which JobRole has the highest attrition?",
    "The OverTime puzzle: how many TIMES more likely is an OverTime employee to leave vs a non-OverTime one? Paste the ratio.",
    "Salary effect: bucket MonthlyIncome into thirds. Paste attrition rate per third. Linear, U-shaped, or something else?",
    "Distance trap: at what DistanceFromHome bucket does attrition first jump above 25%? Paste the bucket.",
    "Education paradox: which Education level has the HIGHEST attrition? Was that what you expected?",
    "Gender check: paste the attrition rate by Gender. Be careful with interpretation - in 1 line, what would you NOT conclude from this?",
    "The young-employee story: among employees under 30, what is the biggest predictor of leaving? Show numbers.",
    "Compare HR analytics findings to industry context (from the HR 101 video). Which finding is most surprising vs the standard literature?",
    "Push the dataset + first findings paragraph in README. Tag v0.1 and paste the release URL."
  ],
  11: [
    "Cliff hunting: at which exact YearsAtCompany bucket does attrition DROP the most sharply? Paste the before/after rates.",
    "The 0-1 year crisis: what percent of all 0-1 year employees leave? Paste the rate.",
    "Promotion neglect: among employees with YearsSinceLastPromotion = 5+, what is attrition? Compare to those with 0-1 year. Paste both.",
    "Find the worst combo: which JobRole × TenureBucket cell has the highest attrition? Paste the cell + rate.",
    "Income × Tenure interaction: does low income hurt more for 0-1 year or 6-10 year employees? Show the numbers.",
    "Cumulative attrition: by year 5, what percent of the original cohort is gone? Year 10? Paste both.",
    "Department deep-dive: pick the highest-attrition department. What is its CLIFF tenure (the year with the biggest jump)? Paste the year + the rate jump.",
    "OverTime poison check: among 0-1 year employees, does OverTime double or triple attrition? Paste the ratio.",
    "Find the surprise: a JobRole where MORE tenure goes with MORE attrition (counterintuitive). Or prove none exists.",
    "Update README with the tenure findings + cumulative-attrition chart. Tag v0.2 and paste the release URL."
  ],
  12: [
    "Build 4 KPI tiles: Overall attrition, Top-risk department rate, OverTime attrition rate, Average tenure of leavers. Paste all 4 numbers.",
    "Add 3 supporting charts: attrition by tenure, by JobRole, by income bucket. Paste the dashboard screenshot URL.",
    "Add a Department slicer. Confirm: when you click Sales, do the KPIs update? Paste a screenshot of 2 different departments selected.",
    "Estimate the DOLLAR impact: cost per replacement * total annual attritions. Use $15k-$30k from the SHRM video. Paste your number and the assumption.",
    "Write a 1-page HR memo with the headline + 3 findings + 2 specific recommendations. Paste the PDF URL.",
    "Build a 4-slide exec deck: Problem, Top Finding, Recommendation, Cost of Inaction. Paste the deck PDF.",
    "Time yourself pitching the deck. Paste your time. Goal: under 4 minutes.",
    "Find one quote from a real HR pro (LinkedIn, podcast, article) that supports your top recommendation. Paste it + source.",
    "Have one person read the memo silently. Paste their first question after reading.",
    "Tag v0.3 and paste the release URL."
  ],
  13: [
    "Polish: list the top 3 cosmetic fixes you made before v1.0.",
    "Anonymize the dataset properly (no IDs, no names, no exact dates). Paste the file URL.",
    "Add a SQL version of your top 5 queries used in the dashboard. Paste queries.sql URL.",
    "Record a 3-min demo video. Paste the Loom/YouTube URL.",
    "Find one HR professional or experienced person and get them to read the project. Paste their top critique.",
    "Apply the feedback. Paste the commit URL.",
    "Write RETRO.md: what worked, what didn't, lessons for next project. Paste the URL.",
    "Post a screenshot of one finding on LinkedIn with a 1-sentence hook. Paste the post URL.",
    "Add the project to your GitHub pinned repos. Paste a screenshot.",
    "Tag v1.0. PROJECT 2 COMPLETE. Paste the release URL."
  ],
  14: [
    "Pick books.toscrape.com. Paste robots.txt contents.",
    "Write ETHICS.md with 5 rules you'll follow. Paste the file URL.",
    "Scrape 5 pages with a 1-second rate limit. Paste row count + first 3 rows.",
    "Add a timestamp column. Paste the first 3 rows with timestamps.",
    "Run the scraper TWICE 1 hour apart. Compute price-change deltas. Paste 5 example deltas.",
    "Schedule the scraper to run daily. Paste the Task Scheduler screenshot OR the cron expression.",
    "Detect a price drop: write code that triggers an alert when any product drops more than 20% in price. Paste the alert function.",
    "Build a 1-page Google Sheets dashboard from the scraped data. Paste the public Sheet URL.",
    "Compute time-on-shelf: for products that disappeared, what was their median days-on-site before disappearing?",
    "Push competitor-price-tracker to GitHub with ETHICS.md, scraper, scheduled script, and one screenshot. Paste the repo URL."
  ],
  15: [
    "Compute the order-status funnel: created -> approved -> delivered -> reviewed. Paste counts at each step.",
    "Find the BIGGEST drop-off in the funnel. Paste the stage and the drop percentage.",
    "Median delivery time: how many days from purchase to delivery? Paste the number.",
    "Compute correlation between delivery_time_days and review_score. Paste r value + interpret in 1 line.",
    "Find the worst-rated city: which Brazilian city has the lowest average review score (min 50 orders)? Paste city + score.",
    "Revenue loss puzzle: what's the dollar value of CANCELED orders? Paste the number.",
    "Compare São Paulo vs Rio de Janeiro funnel: any difference? Paste both funnels.",
    "Draw the schema diagram. Paste the diagram image URL.",
    "Find the seller star: which seller has the highest review score (min 50 sales)? Paste seller_id + score.",
    "Push v0.1 with findings paragraph in README. Paste the release URL."
  ],
  16: [
    "Compute the cohort × month retention matrix for all 12 months. Paste the matrix image URL.",
    "Overall repeat-buyer rate: what % of customers placed 2+ orders? Paste the number.",
    "Plot days-to-second-purchase histogram. Median days? Paste the number.",
    "Compare AOV: repeat customers vs one-time customers. Paste both numbers + the ratio.",
    "Best cohort: which month's cohort had the HIGHEST month-3 retention? Paste month + rate.",
    "Cohort by state: which Brazilian state has the best retention? Paste state + month-3 rate.",
    "Cohort by category: which first-purchase Category drives the BEST repeat rate? Paste category + rate.",
    "Hunt for super-customers: how many customers placed 3+ orders? What's their average lifetime spend?",
    "Find the surprise: a category that has LOW first-purchase volume but HIGH retention. Or prove none.",
    "Update README and tag v0.2. Paste the release URL."
  ],
  17: [
    "Pick a real product change to A/B test. Write the hypothesis in one sentence with a specific MDE.",
    "Compute required sample size (80% power, 5% alpha, 5% MDE). Paste the number.",
    "Simulate variant + control in Excel with a true 2% lift. Paste 10 example rows.",
    "Compute the observed lift in your simulation. Paste it.",
    "Compute the p-value via z-test on conversion rates. Paste it to 4 decimals.",
    "Compute Cohen's d for your test. Interpret in 1 sentence.",
    "What happens to sample size if MDE drops to 1%? Paste the new N. Is that feasible?",
    "Add a secondary metric (e.g. revenue per user). What if primary wins but secondary loses?",
    "Write the ship/kill decision. Paste it in AB-PLAN.md and link the file.",
    "Add one paragraph: 3 real-world A/B tests that famously went wrong. Paste it."
  ],
  18: [
    "Build 4 KPI tiles for Olist: overall conversion, repeat rate, avg delivery days, avg review score. Paste all 4 numbers.",
    "Build the funnel chart with drop-offs labeled. Paste the chart URL.",
    "Add 3 supporting charts to the dashboard. Paste the dashboard URL.",
    "Write a 1-page memo with the 3 most-actionable findings. Paste the PDF URL.",
    "Build a 5-slide deck: Funnel, Cohorts, Delivery problem, Seller variation, Recommendation. Paste the deck.",
    "Time your 5-minute pitch. Paste your time.",
    "Estimate dollar value of a 1pp improvement in repeat rate. Paste the calculation.",
    "Add a sellers view: which 3 sellers have the WORST funnel? Paste seller IDs.",
    "Add a by-state view to the dashboard. Worst state for conversion? Paste state + rate.",
    "Tag v0.3 and paste the release URL."
  ],
  19: [
    "Polish: list 3 cosmetic edges you fixed before v1.0.",
    "Add a SQL version of your 5 key queries. Paste queries.sql.",
    "Record a 3-min demo video. Paste the URL.",
    "Find one experienced person to review the project. Paste their top critique.",
    "Apply the critique. Paste the commit URL.",
    "Write RETRO.md. Paste the URL.",
    "Post the funnel chart on LinkedIn with a 1-sentence finding. Paste the post URL.",
    "Make a Kaggle notebook version. Paste the Kaggle URL.",
    "Add to GitHub pinned repos. Paste screenshot.",
    "Tag v1.0. PROJECT 3 COMPLETE. Paste the release URL."
  ],
  20: [
    "Install Tableau Public. Paste the version number.",
    "Connect to Superstore. Paste the row count Tableau reports.",
    "Build 4 KPI worksheets (Total Sales, Total Profit, Avg Margin, Top Region). Paste a screenshot of all 4.",
    "Build a monthly trend chart. Paste screenshot.",
    "Build a profit-by-state US map. Which state is most profitable? Paste screenshot + state name.",
    "Build a profit by Category × Region matrix. Paste screenshot.",
    "Assemble a dashboard with a Year filter that applies to ALL charts. Confirm with 2 screenshots (2020 vs 2023).",
    "Add a parameter that lets users switch the main metric (Sales vs Profit vs Margin). Paste screenshot showing each state.",
    "Build a Tableau Story with 3 sequenced dashboards (Overview -> Discount problem -> Recommendation). Paste screenshot.",
    "Publish to Tableau Public. Paste the live URL. Tableau version of your Superstore project is now public."
  ],
  21: [
    "Sign up for Google Cloud Free Tier. Paste your project ID.",
    "Upload Superstore.csv to BigQuery. Paste the table reference (project.dataset.table).",
    "Run SELECT COUNT(*) on the loaded table. Paste the count.",
    "Install dbt-bigquery. Paste 'dbt --version' output.",
    "Initialize a dbt project. Paste profiles.yml with credentials redacted.",
    "Build model 1: monthly_sales_by_region. Paste the SQL.",
    "Run 'dbt run' + 'dbt test'. Paste the test pass output.",
    "Add a unique test on order_id and not_null on order_date. Paste the schema.yml snippet.",
    "Build model 2: regional_yoy_growth. Paste the SQL.",
    "Push superstore-dbt repo and paste the URL."
  ],
  22: [
    "Pick your capstone scenario in one sentence. Paste it.",
    "Write SPEC.md (problem, data sources, success metric, timeline). Paste the URL.",
    "Build a synthetic 3-source dataset (e.g. orders + products + customers). Paste 3 file URLs.",
    "Draw the schema diagram (3 tables joined). Paste the diagram URL.",
    "Build the data model with relationships in your chosen tool. Paste a screenshot.",
    "Compute 3 KPIs that REQUIRE joining 2+ sources. Paste formulas + values.",
    "Add a 4th data source (weather, holidays, prices). Paste the file URL.",
    "Write the audience section: who reads each future dashboard page? Paste bullets.",
    "Pitch the spec to one real person in 2 minutes. Paste their top critique.",
    "Adjust the spec based on critique. Tag v0.1 and paste the release URL."
  ],
  23: [
    "Build Page 1 (Executive Overview): 4 KPIs + 1 trend chart. Paste the screenshot.",
    "Build Page 2 (Sales Detail): breakdowns by product, region, time. Paste the screenshot.",
    "Link a Region filter across both pages. Confirm with 2 screenshots (West vs East).",
    "Add micro-trend arrows (up/down indicators) to each KPI on Page 1. Paste screenshot.",
    "Add conditional formatting that flags below-target KPIs in red. Paste screenshot.",
    "Add a notes column to the top-orders table on Page 2. Paste screenshot.",
    "Time yourself navigating Page 1 -> Page 2 with the filter. Under 2 seconds? If not, optimize.",
    "Export both pages as PDF and commit them. Paste the GitHub link.",
    "Get one person to click around for 1 minute. Paste their first piece of feedback.",
    "Tag v0.2 and paste the release URL."
  ],
  24: [
    "Build Page 3 (Customer/Segment) with a cohort matrix. Paste the screenshot.",
    "Build Page 4 (Operations) with operational KPIs. Paste the screenshot.",
    "Add an alerts section to Page 1 that flags 3 KPIs in red when below target. Paste screenshot.",
    "Build a unified filter panel (Year, Region, Segment) across all 4 pages. Confirm.",
    "Polish branding: pick one font, one color palette, add a logo. Paste before/after.",
    "Add Page 5: drill into ONE customer's lifetime view. Paste screenshot.",
    "Add a print-ready / 1-page summary export layout. Paste the PDF.",
    "Add scenario comparison (this quarter vs target). Paste screenshot.",
    "Get one stranger to read all 4 pages. Paste their biggest 'confusing' moment.",
    "Tag v0.3 and paste the release URL."
  ],
  25: [
    "Distill your capstone into ONE sentence under 20 words. Paste it.",
    "Redesign slide 1: that headline only. No chart. Paste the slide screenshot.",
    "Kill 3 charts from the deck. Paste before/after slide counts.",
    "Write 30-second speaker notes for every remaining slide. Paste 3 samples.",
    "Self-record the full presentation. Paste the video URL.",
    "Show the recording to 1 person. Paste their first reaction in 1 line.",
    "Replace one chart with a single big number, formatted big and bold. Paste before/after.",
    "Find one example of BAD chart design online and remake it cleaner. Paste before/after.",
    "Practice the pitch in front of a mirror twice without notes. Paste your final time.",
    "Commit the polished deck PDF and paste the link."
  ],
  26: [
    "Write a 1-page CEO memo summarizing findings + recommendations. Paste the PDF URL.",
    "Build an 8-slide board deck PDF. Paste the URL.",
    "Record a 3-minute demo video. Paste the URL.",
    "Add a SQL version of every key KPI. Paste sql/ folder URL.",
    "Get 3 readers and paste each top critique.",
    "Apply the most-common critique. Paste the commit URL.",
    "Write capstone-specific RETRO.md. Paste the URL.",
    "Write ROADMAP_RETRO.md covering all 4 projects. Paste the URL.",
    "Apply to ONE real analyst job using the portfolio. Paste the company name.",
    "Tag v1.0. ROADMAP COMPLETE. Paste the release URL."
  ],
  27: [
    "Inventory all 4 shipped projects. Paste a README-style summary of each.",
    "Set up a portfolio site (Vercel/Netlify/GitHub Pages). Paste the live URL.",
    "Write LinkedIn post 1 (Superstore). Paste the URL.",
    "Write LinkedIn post 2 (HR Attrition). Paste the URL.",
    "Write LinkedIn post 3 (Marketing Funnel or Capstone). Paste the URL.",
    "Update your LinkedIn About + Experience to mention all 4 projects. Paste the profile URL.",
    "Update GitHub profile README + pin top repos. Paste a screenshot.",
    "Record yourself answering 3 analyst interview questions (Tell me about a project / SQL / dashboarding). Paste the video URL.",
    "Submit ONE real job application. Paste the company name + role.",
    "Send 3 DMs to working analysts on LinkedIn asking for 15-min chats. Paste the 3 messages."
  ]
};

const DS = {
  1: [
    "Hunt for the busiest hour: what is the peak hour for taxi pickups in October 2023? Paste the hour and the trip count.",
    "Tip behavior: what is the median tip percentage on trips over 5 miles vs under 1 mile? Paste both. Which is higher?",
    "Find the priciest day: what day of week has the highest AVERAGE fare? Paste the day and the average.",
    "Outlier hunt: find ONE trip that is clearly an outlier (very long, very expensive, or both). Paste the row.",
    "Borough check: does the busy hour change by pickup borough? Paste the busy hour per borough.",
    "Plot trip_minutes distribution. Describe the shape in 1 sentence (skewed left? right? bimodal?).",
    "Build a NEW chart not in the spec: trips by month-of-day weekday vs weekend. Paste the PNG URL.",
    "Speed test: how many trips were faster than 5 minutes? How many longer than 1 hour? Paste both counts.",
    "Money question: what is total revenue (sum of total_amount) for the month? Paste the dollar figure.",
    "Push the notebook + 3 charts + README to taxipulse-nyc. Paste the GitHub URL."
  ],
  2: [
    "Compute mean and std of fare_amount with NumPy. Paste both.",
    "Normalize fare with z-score (NumPy only, no sklearn). Paste the line of code.",
    "Plot fare distribution BEFORE and AFTER log-transform. Paste both PNGs. Describe the change in 1 sentence.",
    "Compute Pearson correlation between distance and fare manually (no .corr()). Paste the value to 4 decimals.",
    "Solve this Bayes problem by hand: 1% of trips are 'suspicious'. Flag system: 90% sensitivity, 5% false positive. What's P(suspicious | flagged)? Paste your work.",
    "Compute the normal equation: coefficients for fare = a*distance + b. Paste a and b. Do they roughly match NYC's real per-mile fare?",
    "Solve a second Bayes problem (medical: 0.5% prevalence, 95% sensitivity, 4% FP). Paste your work.",
    "Run linear algebra: take 3 trips, build a feature matrix X (distance, hour, passenger_count). Compute X^T @ X with NumPy. Paste the 3x3 matrix.",
    "When would you use Bayes vs frequentist? Paste 1 sentence with a real example from taxi data.",
    "Commit math.ipynb to taxipulse-nyc. Paste the commit URL."
  ],
  3: [
    "Merge the zone CSV. Paste df.shape before and after merge.",
    "Plot trips-by-hour for each of 5 boroughs. Paste the figure URL.",
    "Concat Sept + Oct + Nov 2023 parquets. Paste total row count.",
    "Plot daily trip volume across Q4. Paste the chart.",
    "Find the quietest day in Q4. Paste date + trip count. Guess one reason in 1 line.",
    "Plot tip% by borough. Which borough tips the most? Paste rate.",
    "Build hour × day-of-week heatmap. Paste the URL.",
    "Compare weekday vs weekend trips per borough. Paste the comparison table.",
    "Find the busiest single hour of Q4 (across all 3 months). Paste the hour and trip count.",
    "Update TaxiPulse-Final.ipynb and tag v0.2. Paste the release URL."
  ],
  4: [
    "Import 100k taxi rows + zone lookup. Paste both row counts.",
    "Rewrite the busiest-hour query in SQL. Paste query + top 5 hours.",
    "Rewrite tip% by borough in SQL. Paste query + result.",
    "Use ROW_NUMBER() to get top 3 highest-fare trips per borough. Paste query + result.",
    "Write a CTE that aggregates daily trips first, then ranks them. Paste query.",
    "Find outliers: trips where fare > 99th percentile of their distance bucket. Paste query + 5 examples.",
    "Validate: does your SQL count of trips match pandas exactly? Yes/no.",
    "Write a window function for cumulative daily trips. Paste query + first 10 rows.",
    "Use NULLs query: how many trips have NULL store_and_fwd_flag? Paste count + query.",
    "Commit queries.sql with 10 commented queries. Paste the URL."
  ],
  5: [
    "Pick 5 features for fare prediction. Paste the list with 1-line justification each.",
    "Train LinearRegression baseline. Paste test MAE.",
    "Paste the coefficient for distance. Does it match NYC's real per-mile rate ($3-4)? If not, why?",
    "Train XGBoost. Paste test MAE.",
    "Which won on MAE? Paste both numbers + the winner.",
    "Plot residuals. Where does the model fail? Paste the URL and 1-sentence diagnosis.",
    "Add passenger_count as a feature. Does it improve MAE? Paste before/after.",
    "Build a Manhattan-only model. Paste its MAE. Better or worse than the general model?",
    "Find 5 test rows where prediction is hugely wrong. Paste them. Guess one reason for each.",
    "Save the winning model with joblib. Tag v0.3. Paste the model file URL."
  ],
  6: [
    "Compute 95% CI for mean fare. Paste [low, high].",
    "Two-sample t-test: average fare in Manhattan vs Brooklyn. Paste p-value.",
    "Cohen's d for the same comparison. Paste value + interpretation.",
    "Chi-square: borough × payment_type. Paste p-value.",
    "Apply Bonferroni to 10 pairwise borough fare comparisons. Which remain significant?",
    "Bootstrap mean fare with 1000 resamples. Paste 95% bootstrap CI.",
    "ANOVA across all 5 boroughs on fare. Paste F-statistic + p-value.",
    "Shapiro-Wilk on log(fare). Is it normal? Paste the result.",
    "Find one Simpson's paradox in this data. Describe in 3 lines.",
    "Commit inference.ipynb with one statistically-supported claim cited in README. Paste the URL."
  ],
  7: [
    "Save fare model with joblib. Paste filename + size.",
    "Write Flask app with /predict and /health. Paste app.py URL.",
    "curl POST /predict locally. Paste the response.",
    "Add gunicorn + requirements.txt. Paste requirements.txt.",
    "Deploy to Render. Paste the live URL.",
    "curl your LIVE /predict endpoint. Paste the response.",
    "Add input validation: distance > 0, hour 0-23. Paste the validation code.",
    "Add a /batch endpoint that takes a list of trips. Paste 1 example.",
    "Log every prediction with timestamp. Paste 3 example log lines.",
    "Tag v0.4 and paste the release URL."
  ],
  8: [
    "Pick HN as target. Paste robots.txt contents.",
    "Write ETHICS.md (5 rules). Paste the URL.",
    "Scrape HN front page. Paste 5 stories with title + score + comment count.",
    "Add pagination (5 pages, 1-second rate limit). Paste row count.",
    "Use HuggingFace pipeline to sentiment-tag the titles. Paste 10 sample rows.",
    "Plot sentiment distribution. Paste the PNG.",
    "Compare BS4 speed vs Scrapy on 10 pages. Paste both times.",
    "Find the most-positive title and most-negative title of the day. Paste both.",
    "Push hn-scraper repo with all of the above. Paste URL.",
    "Write a README paragraph on why you respect robots.txt. Paste the README link."
  ],
  9: [
    "Install Streamlit. Paste version.",
    "Build sidebar (borough, hour range, day-of-week, fare cap). Paste screenshot.",
    "Wire fare model: user inputs distance + hour, app predicts. Paste screenshot of prediction.",
    "Add Q4 daily trend chart, filterable by borough. Paste screenshot.",
    "Add a heatmap of trips by hour × day-of-week. Paste screenshot.",
    "Add compare-2-boroughs side-by-side mode. Paste screenshot.",
    "Cache parquet load with @st.cache_data. Paste before/after load time.",
    "Deploy to Streamlit Cloud. Paste live URL.",
    "Get one person to use the app. Paste their first reaction.",
    "Tag v0.5 and paste the release URL."
  ],
  10: [
    "List 10 rough edges in your project. One line each.",
    "Fix at least 5. Paste the diff or commit URLs.",
    "Add docstrings + markdown context to every notebook section. Paste 1 polished section screenshot.",
    "Profile your slowest cell. Paste before/after time.",
    "Add a profile photo + bio to notebook header. Paste the screenshot.",
    "Get 1 stranger to read the notebook. Paste their top critique.",
    "Apply the critique. Paste commit URL.",
    "Write RETRO.md. Paste URL.",
    "Write a 1-paragraph 'How I made this' blog post (Medium or Dev.to). Paste URL.",
    "Tag v1.0. PROJECT 1 COMPLETE. Paste the release URL."
  ],
  11: [
    "Install Cursor. Paste version.",
    "Test 4 prompt patterns (zero-shot, few-shot, chain-of-thought, role). Paste examples + outputs.",
    "Generate SQL: 'top 5 boroughs by avg tip% in 2023'. Paste prompt + SQL.",
    "Run the generated SQL. Paste the result.",
    "Apply AI code review to one function. Paste function + critique.",
    "Try same prompt in 2 AIs. Which gave better output? Why?",
    "Use AI to write 3 unit tests. Paste tests + confirm they pass.",
    "Use AI to explain a recent ML paper in 100 words. Paste it.",
    "Write prompts.md with 5 reusable prompts. Paste URL.",
    "Publish 1 AI-drafted paragraph as a LinkedIn or Dev.to post. Paste live URL."
  ],
  12: [
    "Create reddit-sentiment repo. Paste URL.",
    "Get Reddit API credentials. Paste client_id (no secret).",
    "Scrape 1000 r/MachineLearning posts. Paste row count.",
    "Label them with a pretrained sentiment model. Paste labeled.csv first 5 rows.",
    "Plot sentiment distribution. Paste PNG.",
    "Scrape r/learnmachinelearning too. Paste both distributions side by side.",
    "Scrape top 5 comments per post. Paste 3 example rows.",
    "Find the most-positive post of the week. Paste title + score.",
    "Find the most-negative post. Paste title + score.",
    "Tag v0.1 and paste release URL."
  ],
  13: [
    "Hand-label 200 posts (positive/neutral/negative). Paste 20 samples with labels.",
    "Split into 160 train + 40 test. Paste sizes.",
    "Vectorize with TF-IDF + 1-2 grams. Paste config.",
    "Train LogisticRegression. Paste test accuracy.",
    "Print top 10 features per class. Paste them.",
    "Run the pretrained model on same test set. Paste its accuracy.",
    "Baseline vs pretrained: which won? Paste both numbers.",
    "Try Naive Bayes alongside LogReg. Paste accuracy.",
    "Plot confusion matrix for your best model. Paste URL.",
    "Save vectorizer.pkl + baseline.pkl. Tag v0.2."
  ],
  14: [
    "Write A/B hypothesis (e.g. 'few-shot beats zero-shot by 5pp'). Paste it.",
    "Compute required sample size (80% power, 5% MDE). Paste N.",
    "Run both prompts on 100 posts. Paste 10 rows with both predictions.",
    "Compute accuracy lift. Paste percentage.",
    "Compute p-value. Paste to 4 decimals.",
    "Compute Cohen's d. Paste value.",
    "Run on 200 posts. Does the verdict change? Paste new p-value.",
    "Try a 3rd variant (one-shot example). Paste accuracy + ranking.",
    "Write ship-or-kill decision in 1 line. Paste it.",
    "Commit ab/REPORT.md. Paste URL."
  ],
  15: [
    "Move to Colab T4. Paste nvidia-smi screenshot.",
    "Tokenize gold set with DistilBERT tokenizer. Paste the line.",
    "Train 3 epochs. Paste final eval accuracy.",
    "Beat TFIDF baseline. Paste both numbers + improvement.",
    "Save model with Git LFS. Paste LFS file URL.",
    "Try ALBERT or distilroberta. Paste accuracy + inference time.",
    "Run learning-rate sweep (1e-5, 2e-5, 5e-5). Paste 3 results.",
    "Plot training loss + eval accuracy over epochs. Paste URL.",
    "Update README with eval table. Paste URL.",
    "Tag v0.3 and paste the release URL."
  ],
  16: [
    "Install SHAP. Paste shap.__version__.",
    "Run LinearExplainer on TFIDF baseline. Paste 3 lines of code.",
    "Generate SHAP summary bar plot. Paste URL.",
    "Generate force plot for ONE prediction. Paste URL.",
    "Find ONE bias in the model (a feature it relies on that it shouldn't). Document in BIASES.md.",
    "Compute SHAP for the 20 worst misclassifications. Paste aggregated plot.",
    "If you have a tree model, run TreeExplainer. Paste plot.",
    "Build a small Streamlit page that shows SHAP per user input. Paste URL.",
    "Write explainability section in README. Paste URL.",
    "Commit both SHAP plots + BIASES.md. Paste commit URL."
  ],
  17: [
    "Generate 100 fake users with Faker. Paste 5 examples.",
    "Apply SMOTE to one imbalanced dataset. Paste class counts before/after.",
    "Train with and without SMOTE. Paste both accuracies AND F1 for minority class.",
    "Quantify the trade-off in 1 sentence: did SMOTE help on real held-out data?",
    "Try ADASYN. Paste comparison.",
    "Compare bootstrap resampling vs SMOTE. Which gave more honest results?",
    "LLM-paraphrase 50 minority-class posts. Paste 3 original + paraphrased.",
    "Retrain with augmented data. Paste new accuracy.",
    "Document one case when synthetic data is dangerous. Paste into synth.ipynb.",
    "Commit synth.ipynb. Paste URL."
  ],
  18: [
    "Write predict() that takes raw text and returns label + score. Paste function.",
    "Build Streamlit dashboard with refresh button. Paste live URL.",
    "Show sentiment bar chart + most-positive + most-negative posts. Paste screenshot.",
    "Save snapshots to history.csv. Paste 5 example rows.",
    "Add a sentiment-by-hour heatmap. Paste screenshot.",
    "Add subreddit picker (3+ subs). Confirm switching works. Paste 2 screenshots.",
    "Add a visual or sound alert when negativity spikes. Describe trigger.",
    "Cache model load with @st.cache_resource. Paste before/after refresh time.",
    "Deploy to Streamlit Cloud. Paste live URL.",
    "Tag v0.4. Paste release URL."
  ],
  19: [
    "Build FastAPI app with POST /predict taking a list of texts. Paste main.py URL.",
    "curl POST locally. Paste response.",
    "Write Dockerfile. Paste it.",
    "Build image, run locally. Paste docker ps output.",
    "Push image to Docker Hub or HF Spaces. Paste image URL.",
    "Deploy to HF Spaces. Paste live API URL.",
    "Update Streamlit dashboard to call this API. Paste screenshot.",
    "Add JWT auth on the API. Paste example request with auth.",
    "Add rate limiting (slowapi). Paste config.",
    "Add /batch endpoint for 1000 texts. Paste timing comparison."
  ],
  20: [
    "Polish: list top 3 fixes.",
    "Write 1000-1500 word blog post. Paste live URL.",
    "Record demo video. Paste URL.",
    "Get 3 readers. Paste each top critique.",
    "Apply most-common critique. Paste commit URL.",
    "Write RETRO.md. Paste URL.",
    "Add 'cite as' BibTeX to README. Paste it.",
    "Cross-post blog to Medium. Paste URL.",
    "Submit to r/MachineLearning weekly thread. Paste URL.",
    "Tag v1.0. PROJECT 2 COMPLETE. Paste release URL."
  ],
  21: [
    "Download AEP_hourly.csv. Paste row count + date range.",
    "Set up energy-forecast repo. Paste URL.",
    "Plot the full 10-year series. Paste PNG.",
    "Decompose into trend/seasonal/residual. Paste 3-panel plot URL.",
    "Build hour × day-of-week heatmap. Paste URL.",
    "Compute persistence baseline MAE (predict y_t = y_t-24). Paste value.",
    "Try a 2nd series (COMED, DUQ). Paste comparison plot.",
    "Plot summer 2023 vs winter 2023. Paste both PNGs.",
    "ACF plot. At what lag does autocorrelation peak? Paste lag.",
    "Tag v0.1 and paste release URL."
  ],
  22: [
    "Run ADF stationarity test. Paste p-value.",
    "Difference until stationary. How many differences? Paste new ADF p-value.",
    "Fit auto_arima on daily data. Paste chosen (p,d,q).",
    "Forecast 30 days. Paste test MAE.",
    "Plot forecast with CI. Paste URL.",
    "Compare ARIMA MAE vs persistence. Winner?",
    "Try SARIMAX with weekly + yearly seasonality. Paste seasonal order + MAE.",
    "Use AICc to compare 3 candidate models. Paste table.",
    "Save arima.pkl. Paste URL.",
    "Tag v0.2 and paste release URL."
  ],
  23: [
    "Format as ds/y for Prophet. Paste df.head().",
    "Fit baseline Prophet. Paste training time.",
    "Add US holidays. MAE before/after?",
    "Evaluate on 30-day test. Paste MAE.",
    "Plot components (trend + weekly + yearly). Paste URL. Strongest seasonal pattern?",
    "Add temperature as regressor (from NOAA). Paste new MAE.",
    "Try changepoint_prior_scale 0.01/0.05/0.5. Paste 3 MAEs.",
    "Forecast 90 days. Paste MAE.",
    "Compare Prophet vs ARIMA. Winner?",
    "Save model + components plot. Tag v0.3."
  ],
  24: [
    "Build sliding windows of 30 days. Paste X.shape + y.shape.",
    "Define small LSTM in PyTorch. Paste model class.",
    "Train 50 epochs. Paste final train + val loss.",
    "Predict next-day demand for 30 days. Paste MAE.",
    "Compare LSTM vs Prophet vs ARIMA vs persistence. Paste 4-model table.",
    "Increase window to 60 days. Paste new MAE.",
    "Add a second LSTM layer. Paste new MAE.",
    "Try GRU instead. Paste MAE.",
    "Save best LSTM with torch.save. Paste URL.",
    "Tag v0.4 and paste release URL."
  ],
  25: [
    "Install MLflow. Paste startup output.",
    "Track a baseline Prophet run. Paste run URL.",
    "Sweep 3 hyperparameter values. Paste comparison table.",
    "Promote best model to Production stage. Paste screenshot.",
    "Track the model artifact (.pkl). Confirm it's in MLflow UI.",
    "Install Evidently. Run drift report on 2 months. Paste HTML report URL.",
    "Build daily drift-alarm script (fire when KS p-value < 0.05). Paste script.",
    "Send alerts to Slack webhook. Paste webhook code.",
    "Document MLOps setup in MLOPS.md. Paste URL.",
    "Tag v0.6 (MLOps milestone). Paste release URL."
  ],
  26: [
    "Sign up for AWS Free Tier with IAM user. Paste screenshot.",
    "Install + configure AWS CLI. Paste 'aws sts get-caller-identity' output.",
    "Upload model.pkl to S3. Paste bucket URI.",
    "Load model from S3 with boto3 in Python. Paste 5 lines.",
    "Create GCP project + open BigQuery. Paste project ID.",
    "Run busiest-hour query on 38M-row public NYC TLC dataset. Paste query + runtime.",
    "Compare BigQuery runtime vs pandas on local 1-month file. Paste both times.",
    "Estimate BigQuery cost for 3 query patterns. Paste your numbers.",
    "Document the setup in CLOUD.md. Paste URL.",
    "Save final FlightWise predictions to BigQuery. Paste table name."
  ],
  27: [
    "Pick winning model. Paste model name + final MAE.",
    "Build Streamlit dashboard for forecasts. Paste live URL.",
    "Deploy publicly. Paste URL.",
    "Write 1000-word blog. Paste URL.",
    "Record demo video. Paste URL.",
    "Get 3 readers. Paste each top critique.",
    "Apply feedback. Paste commit URL.",
    "Write RETRO.md. Paste URL.",
    "Submit blog to Hacker News or PJM community. Paste URL.",
    "Tag v1.0. PROJECT 3 COMPLETE. Paste release URL."
  ],
  28: [
    "Pick capstone topic. Paste 1-sentence description.",
    "Write SPEC.md (problem, data, success metric). Paste URL.",
    "Verify every data source is accessible. Paste 3 source URLs.",
    "Plan W29-30 in ROADMAP.md. Paste URL.",
    "Build a 100-row prototype. Paste notebook URL.",
    "Pitch the spec to one friend in 2 min. Paste their top critique.",
    "Search GitHub for 3 similar projects. Paste URLs + what each did NOT do.",
    "Pick the metric you'd be most embarrassed by if it's bad. Paste it.",
    "Adjust spec based on feedback. Paste commit URL.",
    "Tag v0.1 and paste release URL."
  ],
  29: [
    "Collect all data. Paste total row count across sources.",
    "Clean everything. Paste rows-removed count + reasons.",
    "Run EDA. Paste 5 plots PNG URLs.",
    "Train baseline. Paste main eval metric.",
    "Train better model. Paste eval metric.",
    "Build comparison table (baseline vs better). Paste it.",
    "Try a 3rd model. Paste result.",
    "Document one wrong path you took. 1 paragraph in NOTES.md. Paste URL.",
    "Save predictions to CSV. Paste file URL.",
    "Tag v0.2 and paste release URL."
  ],
  30: [
    "Build capstone demo (notebook / app / API). Paste live URL.",
    "Deploy where applicable. Paste public URL.",
    "Write 1500-2000 word blog post. Paste URL.",
    "Record 3-5 min demo video. Paste URL.",
    "Update portfolio site with this project. Paste portfolio URL.",
    "Confirm all 4 projects listed on portfolio. Paste screenshot.",
    "Get 5 readers. Paste 5 single-line critiques.",
    "Write capstone-specific RETRO.md. Paste URL.",
    "Write ROADMAP_RETRO.md covering all 4 projects. Paste URL.",
    "Tag v1.0. ROADMAP COMPLETE. Paste release URL."
  ],
  31: [
    "Inventory all 4 shipped projects. Paste README-style summary.",
    "Set up portfolio site. Paste live URL.",
    "Write LinkedIn post 1 (TaxiPulse). Paste URL.",
    "Write LinkedIn post 2 (Reddit Sentiment). Paste URL.",
    "Write LinkedIn post 3 (Energy Forecast or Capstone). Paste URL.",
    "Update LinkedIn About + Experience. Paste profile URL.",
    "Update GitHub pinned repos. Paste screenshot.",
    "Record yourself answering 3 DS interview questions on video. Paste URL.",
    "Submit 1 real DS job application. Paste company + role.",
    "Send 3 DMs to working data scientists for 15-min chats. Paste the 3 DMs."
  ]
};

function applyTo(file, byNumber) {
  const p = path.join(ROOT, file);
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  let n = 0;
  for (const w of d.weeks) {
    const r = byNumber[w.number];
    if (r && r.length === 10) {
      w.mastery_questions = r;
      n++;
    }
  }
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
  console.log(file, "- mastery puzzles written to", n, "of", d.weeks.length, "weeks");
}

applyTo("data-analysis.json", DA);
applyTo("data-science.json", DS);
