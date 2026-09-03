/**
 * v2 rewrite batch 1: data-analysis Weeks 1-5
 *  W1: Excel, like a real analyst
 *  W2: Python pandas for analysts
 *  W3: Superstore v0.2 — Discount-vs-Profit deep dive
 *  W4: Superstore v0.3 — Customer lifetime value
 *  W5: Superstore v0.4 — SQL version
 */

import { rewriteWeek } from "../rewrite-week";

// ─── W1 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 1, {
  context: `There is a dataset called Sample Superstore that ships with every copy of Tableau. It is a fictional office supply retailer -- desks, chairs, binders, pens -- with four years of order data across the United States. It is not exciting. It is also the dataset that more analysts have used to demonstrate their first real pivot table than any other dataset in existence, which means the interviewers who look at your work will know it on sight and will be able to tell immediately whether you answered real questions or just coloured some cells.

This week you use it to build something a real analyst would actually hand to a manager: a one-page Excel or Google Sheets dashboard and a one-page PDF memo that answers three specific questions about the business. Not "I explored the data and found some things." Three specific questions with specific numbers in the answers.

The questions that matter at Superstore are the ones any retail executive would ask first: which product category drives the most profit, which region is underperforming, and is the discount policy working? You will compute year-over-year growth, profit margin by segment, and the answer to at least one of those questions using SUMIFS, pivot tables, and a calculated field you define yourself. The mechanics of SUMIFS are less important than the habit of checking your formula output against a manual spot calculation before trusting it.

The memo is the part most people skip. A memo is not a list of what you did -- it is a short document that states a finding, supports it with a number, and tells the reader what to do with the information. One page. Three findings. Each finding has a number. The Bloomberg Terminal has been open at the desk of every serious equity analyst since 1981; every one of those analysts learned to write a memo with a finding and a recommendation, not a finding and a description.

By Sunday: a GitHub repo named superstore-analysis with your Excel file, the one-page dashboard as a PDF export, the one-page memo as a PDF, and a README that states the three questions and the three answers. A stranger who reads the README should know what you found without opening the files.`,

  pre_flight: `Before opening Excel, download the Sample Superstore CSV from Kaggle (search "Sample Superstore"). Open it in a text editor and look at the columns. Write down the three questions you will answer this week. Write the answer you expect before you look at the data. The discipline of writing a prior prediction before running the analysis is the single habit that separates a thoughtful analyst from one who finds whatever the data seems to show.`,

  mastery_questions: [
    `Build a pivot table showing total Sales and total Profit by Category and Sub-Category. Add a calculated field for Profit Margin (Profit / Sales). Paste the top 5 and bottom 5 Sub-Categories by Profit Margin. Which Sub-Category has the worst margin? Is it negative? Write one sentence about what a negative margin means for a product line -- it means the company would lose less money by not selling it than by selling it at the current price.`,
    `Compute year-over-year revenue growth for each year in the dataset using SUMIFS: =SUMIFS(Sales, OrderDate, ">="&DATE(year,1,1), OrderDate, "<="&DATE(year,12,31)). Paste the four yearly totals and the YoY growth rate for each year. Is growth accelerating or decelerating? Write one sentence. Year-over-year growth is the first number every retail executive looks at on the morning earnings call.`,
    `Build a pivot table showing Profit by Region and Segment. Add conditional formatting to colour negative values red. Paste the table. Which Region-Segment combination has the worst profit? Write one sentence about whether that combination is a revenue problem (low sales) or a margin problem (high discounts or costs) -- and check the data to confirm your hypothesis before writing it.`,
    `Write the one-page analyst memo. Header: To, From, Date, Re: (the three questions). Body: three findings, each with a specific number and one sentence of interpretation. Footer: two recommendations -- specific actions the business could take based on what you found. Paste the memo text. A memo that says "Sales have been increasing" is not a finding. "Sales grew 12.3% in 2017 but only 4.1% in 2018, driven by a 22% decline in the Technology segment" is a finding.`,
    `Push the repo to GitHub. Confirm the README states all three questions and all three numeric answers at the top. Open the repo in an incognito tab and read it as a stranger. Can you understand what the project found in 60 seconds? If not, fix the README before calling this week done. The README is the first thing a recruiter or hiring manager will read -- it is the memo for the project.`,
  ],

  common_mistakes: [
    `Building a dashboard that has 12 charts instead of the 4 that actually answer the questions. More charts is not more analysis -- it is less clarity. Every chart should answer a specific question stated in the README.`,
    `Using a calculated field for Profit Margin as Profit / Sales * 100 without confirming the result is in percentage format. Excel will happily show 0.12 instead of 12% if the cell format is set to General instead of Percentage.`,
    `Writing a memo that lists what you did ("I created pivot tables and calculated margins") instead of what you found. The reader does not care what you did. They care what the data says.`,
    `Not checking SUMIFS results against a manual spot calculation. SUMIFS with date criteria are easy to get wrong (off-by-one on year boundaries, date format mismatches). Always verify one cell manually.`,
    `Committing the raw Excel file with pivot table refresh turned off. The GitHub viewer will show a static snapshot. Make sure your pivot tables are refreshed and your calculated fields show values before exporting the PDF.`,
  ],

  debug_help: `SUMIFS with date criteria fails silently when the date column is stored as text rather than Excel dates. Run a quick test: in an empty cell, type =ISNUMBER(A2) where A2 is a date cell. If it returns FALSE, the dates are text and SUMIFS will return 0. Fix: select the column, Data > Text to Columns, set delimiter to None, and set the column format to Date. That converts text-dates to real dates. Pivot table "Calculated field is wrong": calculated fields in pivot tables operate on the sum of the underlying data, not on the individual rows. Profit Margin as a calculated field computes (sum of Profit) / (sum of Sales), which is the correct margin. Do not add a column to the source data and then sum that -- that averages the margins, which is wrong.`,

  ai_assist: `Use Claude to generate SUMIFS formulas for specific conditions you are not sure how to write -- "write a SUMIFS that sums Sales where Category is 'Technology' and Order Date is in 2017" is a legitimate prompt. Paste the formula into Excel and verify the result manually against a filter. Do NOT ask Claude to interpret the findings. The interpretation of why Technology margins declined is yours to make, based on the data, not Claude's.`,

  stretch: [
    `Add a sparkline column to the pivot table showing monthly revenue trend for each product category. Sparklines in Excel are a one-click addition that add significant visual information density with no extra chart real estate.`,
    `Compute the Pareto distribution of revenue: which 20% of products drive 80% of revenue? Sort by revenue descending, add a cumulative revenue column, and find the row where it crosses 80%. The answer is almost always surprising and is usually the first question a category manager asks.`,
    `Write the XLOOKUP version of the analysis: build a lookup table of State to Region, and use XLOOKUP to add a Region column to the orders data rather than relying on a pivot to handle it. The ability to add derived columns with lookup functions is the difference between an analyst who knows Excel and one who can work with messy real-world data.`,
  ],
});

// ─── W2 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 2, {
  context: `Last week you answered three questions about Superstore in Excel. This week you answer the same questions in Python. Same data, same questions, same numbers -- but this time the analysis runs in five minutes from a blank machine, it can be scheduled to run automatically every month when new data arrives, and the results are always consistent because there is no manual drag-and-drop involved.

That last point is the reason data teams eventually outgrow spreadsheets. Not because Excel is bad -- Excel is genuinely excellent for one-time analysis and for work that needs to be done by people who do not code. But when the monthly revenue report takes 3 hours because someone has to manually update the pivot table and re-check the formulas, that is 3 hours that could be a 5-minute script run. The Python version is not smarter than the Excel version. It is repeatable.

Pandas is the tool. It is not magic -- it is NumPy with column names and a groupby method. Once that framing clicks, most of the API guesses itself: if you want to group rows by Category and sum their Sales, that is df.groupby('Category')['Sales'].sum(), and the result looks like a spreadsheet pivot table because it is the same operation. The things that are different from Excel: there is no GUI, errors show up as tracebacks rather than wrong cell values, and the output has no formatting until you add it.

The deliverable is monthly_report.py -- a script that reads the CSV, reproduces all three analyses from week 1, prints the results to the console, and saves a clean summary to a CSV. Idempotent means running it twice gives the same output. If it does not, something in the script has a side effect that depends on external state.

By Sunday: monthly_report.py committed to the superstore-analysis repo, running cleanly from a fresh terminal, producing the same numbers as the week 1 Excel analysis. If the numbers differ by more than rounding, one of them is wrong -- find which one.`,

  pre_flight: `Before writing any code, write down in plain English what steps the script needs to take, in order, to reproduce the week-1 analysis. Load data, compute X, compute Y, output Z. This pseudocode takes 5 minutes and prevents the situation where you are three hours in, the code runs, and you realise you answered a different question than week 1.`,

  mastery_questions: [
    `Load the Superstore CSV with pd.read_csv. Parse the Order Date column as a datetime: parse_dates=['Order Date']. Run df.dtypes and confirm Order Date is datetime64. Paste the output. Now add a Year column: df['Year'] = df['Order Date'].dt.year. Compute total Sales by Year using groupby. Paste the result. Confirm it matches the SUMIFS totals from week 1 -- if they differ by more than $1 (rounding), find the discrepancy.`,
    `Reproduce the Profit Margin pivot using groupby and agg. df.groupby(['Category','Sub-Category']).agg(Sales=('Sales','sum'), Profit=('Profit','sum')).assign(Margin=lambda x: x['Profit']/x['Sales']). Paste the top 5 and bottom 5 Sub-Categories by Margin. Confirm they match week 1. Write one sentence about what .assign() does that is different from creating a new column manually.`,
    `Build the Region × Segment profit table using a pandas pivot_table: pd.pivot_table(df, values='Profit', index='Region', columns='Segment', aggfunc='sum'). Paste the result. Highlight (in text) which cell matches the worst Region-Segment combination from week 1. If it does not match, debug the discrepancy -- usually a groupby aggregation difference or a segment name with trailing whitespace.`,
    `Write monthly_report.py with a clear structure: data loading, year-over-year computation, margin computation, region-segment table, CSV export. Run it from the terminal: python monthly_report.py. Paste the last 10 lines of output. Now run it a second time and confirm the output CSV is identical (same values, same row order). If it is not identical, you have a non-deterministic step -- sort the output before writing.`,
    `Add one matplotlib chart to the script: a bar chart of annual revenue with each bar labelled with the YoY growth percentage. Save it as annual_revenue.png. Paste the code for the chart. The chart should be readable without a legend -- use bar labels directly. Unlabelled charts in analyst reports are the single most common feedback "this is hard to read without context."`,
  ],

  common_mistakes: [
    `Using df['Order Date'].dt.year without first converting the column to datetime. If the column is object (string), .dt accessor fails with AttributeError. Always check dtypes after loading and convert dates explicitly.`,
    `Using groupby without reset_index and then trying to use the group columns as regular columns. After groupby().sum(), the group columns become the index. Call .reset_index() to bring them back as columns before further operations.`,
    `Rounding differences between Excel and Python. Excel sometimes stores dates differently and SUMIFS handles boundaries slightly differently than pandas boolean indexing. If your totals differ by less than $5, it is almost certainly a date boundary rounding. Check the edge cases (Dec 31 vs Jan 1) and choose one consistent rule.`,
    `Writing monthly_report.py that hardcodes the file path. Use a relative path or an argument parser so the script works from any machine without editing the source. A script with a hardcoded path like C:/Users/yourname/Desktop/superstore.csv is not portable.`,
    `Saving the CSV with df.to_csv without index=False. The default saves the row index as an unnamed column, which breaks any downstream tool that reads the CSV expecting clean column names.`,
  ],

  debug_help: `The most common pandas error this week is "KeyError: 'Sales'" after a groupby. This means the column name has a leading or trailing space in the CSV ("Sales " instead of "Sales"). Fix: df.columns = df.columns.str.strip(). Run this immediately after pd.read_csv as a defensive step. The second most common is "TypeError: can only concatenate str (not float) to str" when trying to format a number in a print statement. Use f-strings: f"Total Sales: \${total:,.0f}" -- the :, adds thousands separators and the .0f removes decimal places.`,

  ai_assist: `Use Claude to generate the matplotlib chart code -- bar chart with labelled bars is slightly verbose and mechanical. Paste the generated code, run it, and make sure the labels are positioned correctly and readable. Do NOT use Claude to write the groupby logic. Writing df.groupby('Category')['Sales'].sum() yourself is the step that builds the mental model. Copying it removes the learning.`,

  stretch: [
    `Schedule monthly_report.py to run automatically using cron (Mac/Linux) or Task Scheduler (Windows). Run it on the 1st of each month. Automating the report is the point -- doing it once proves the concept.`,
    `Add an argparse argument --year that filters the analysis to a specific year: python monthly_report.py --year 2017. The script should work with or without the flag, defaulting to all years. Parameterised scripts are more useful than hardcoded ones.`,
    `Compare pandas .groupby().agg() to pd.pivot_table on the same data. They can produce identical results -- understand when you would choose each. The pivot_table interface is closer to Excel's mental model; groupby + agg is more flexible for complex multi-step pipelines.`,
  ],
});

// ─── W3 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 3, {
  context: `The Superstore analysis from week 1 found that some Sub-Categories have negative profit margins. This week you go deeper on one specific hypothesis: is the discount policy causing the losses?

The hypothesis is intuitive. Superstore lets salespeople offer discounts of up to 80% on some products. A 70% discount on a product with a 40% gross margin produces a sale at a 30% loss before any other costs. But correlation is not causation -- maybe the products that get discounted are the ones that were already selling poorly, and the discount is an attempt to clear inventory rather than the cause of the loss. Your job this week is to determine which story the data actually supports.

Scatter plots are the right tool for this question. You will plot Discount on the x-axis and Profit Margin on the y-axis, one point per order line. If the relationship is linear and negative (more discount = worse margin), that is the simplest version of the story. If there is a threshold (profit is fine up to 20% discount, then crashes), that is more interesting and more actionable. If there is no relationship at all, the hypothesis is wrong and you need a different explanation for the losses.

Bucketing the discount into ranges (0%, 1-10%, 11-20%, 21-40%, 40%+) and computing average margin per bucket is the way to find the threshold if one exists. This is a cross-tabulation and it is one of the most useful analytical moves in the analyst toolkit -- collapsing a continuous variable into categories to find where behaviour changes.

By Sunday: an updated Superstore repo with a Discount analysis sheet, a scatter plot, a bucketed cross-tabulation, and an updated two-page memo that states the specific finding -- which category's margin collapses at which discount threshold, with the specific numbers.`,

  pre_flight: `Before building any charts, compute the correlation between Discount and Profit for each Category using a formula (Pearson r in Excel: =CORREL(discount_range, profit_range)). Write down the three numbers. A strong negative correlation (below -0.4) means discount and profit move in opposite directions. If the correlation is near zero for one category, that category's losses have a different explanation. Start the analysis knowing which categories to focus on.`,

  mastery_questions: [
    `Create a scatter plot with Discount on the x-axis and Profit Margin on the y-axis. Colour the points by Category. Paste the chart. Does the relationship look linear? Is there a threshold? Write one sentence describing the visual pattern. The scatter plot is the hypothesis-generating step -- the bucketed analysis below is the hypothesis-testing step.`,
    `Bucket the Discount column into ranges using nested IF: =IF(D2=0,"0%",IF(D2<=0.1,"1-10%",IF(D2<=0.2,"11-20%",IF(D2<=0.4,"21-40%","40%+")))). Build a pivot table of average Profit Margin by Discount Bucket and Category. Paste the table. At which discount bucket does average margin first go negative for the worst-performing Category? That bucket is the policy threshold you are looking for.`,
    `Add conditional formatting to the bucketed table: green for margins above 10%, yellow for 0-10%, red for negative. Paste the formatted table. Write one sentence about which Category is most sensitive to discounting -- the one where margin goes from positive to negative at the lowest discount level.`,
    `Reproduce the scatter plot and bucketed table in Python using matplotlib and pandas. Paste the Python code for the scatter (df.plot.scatter) and the pivot table. Confirm the numbers match the Excel version. If they do not, write which version you trust and why.`,
    `Update the analyst memo to two pages. Page 1: the three findings from week 1 (unchanged, since the numbers have not changed). Page 2: the discount finding specifically -- which category, which discount threshold, what the margin is above and below the threshold, and one specific recommendation (e.g., "cap furniture discounts at 20%"). Paste the recommendation sentence. A recommendation that says "reduce discounts" is not actionable. "Cap Furniture discounts at 20% -- above that threshold, average margin is -18%" is actionable.`,
  ],

  common_mistakes: [
    `Computing correlation across the entire dataset without separating by Category. The correlation across all products mixes categories with very different cost structures and obscures the category-level patterns that drive the policy recommendation.`,
    `Using average margin by discount bucket when some buckets have very few orders. If the "40%+" bucket has only 12 orders, the average margin there is noisy. Always check the count alongside the average: report "average margin of -31% across 847 orders" not just "-31%."`,
    `Plotting Discount as a decimal (0.2) instead of a percentage (20%) on the chart axis. Always format axis labels so a reader who did not build the chart can interpret it immediately.`,
    `Writing the recommendation without specifying which category. "Reduce discounts" applies to all three categories and is unactionable. The analysis shows that Technology and Office Supplies handle discounts differently from Furniture -- the recommendation must be category-specific.`,
    `Treating a correlation of -0.35 as "strong." For business analysis, -0.35 means discounts explain about 12% of the variance in profit (r² = 0.12). That is a real signal but not a complete explanation. Acknowledge what else might be driving the pattern.`,
  ],

  debug_help: `Scatter plots in Excel with coloured series by Category require creating three separate data series -- one per Category -- rather than using the single-series scatter with a colour variable. Excel does not support "colour by a column" the way Tableau does. The workaround: build a helper table that separates the Discount and Profit Margin columns by Category (using IF formulas or FILTER), then add each as a separate series on the same chart. In pandas, the separation is easier: df.groupby('Category').plot.scatter() or a loop over categories adding one scatter per iteration.`,

  ai_assist: `Use Claude to generate the nested IF formula for the discount bucketing -- the syntax for five nested IFs is tedious to get right on the first try. Paste the formula into Excel, verify it produces the correct bucket for five spot-check orders, then use it. Do NOT ask Claude to interpret whether the scatter plot shows a linear or threshold relationship. That interpretation requires looking at the chart, which requires your eyes.`,

  stretch: [
    `Compute the profit impact of your recommended cap: if all orders above the 20% Furniture discount threshold had been capped at 20%, what would the change in total Furniture profit be? This calculation -- "how much does the recommendation change the outcome?" -- is the analysis that makes a memo a business case.`,
    `Plot a line chart of average margin by discount bucket for all three categories on the same axes. The visual separation between how Furniture and Technology respond to discounting makes the category-specific policy recommendation obvious.`,
    `Run a simple linear regression of Profit Margin on Discount in Python (from scipy.stats import linregress). Report the slope, intercept, and R². The slope is the most interpretable number: "each additional percentage point of discount is associated with a X percentage point reduction in margin."`,
  ],
});

// ─── W4 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 4, {
  context: `The previous two weeks answered questions about products and discounts. This week the question is about customers. Specifically: who are the most valuable customers, and what do they buy?

Customer lifetime value (CLV) is one of the most-cited metrics in retail and e-commerce analysis. The basic version is simple: total revenue or profit from a customer over their history with the company. The more interesting version asks: what separates the top 20% of customers (who in most retail businesses drive 80% of profit) from the bottom 60%? Is it what they buy, how often they buy, or how long they have been customers?

You will segment the Superstore customer base into four groups by total profit contribution: VIPs (top 10%), High Value (next 20%), Medium (next 40%), and Low (bottom 30%). For each segment, you will compute the average order count, average order value, average discount received, and the Category mix. The pattern that almost always emerges: VIPs order more often, receive lower discounts, and skew toward higher-margin categories. If you find this pattern in Superstore, you can articulate why it matters for discount policy -- the customers who are least profitable are the ones receiving the most discounts.

The Pareto principle (80% of profit from 20% of customers) is worth verifying as a quantitative claim, not just repeating as a rule of thumb. Compute the cumulative profit curve sorted by customer total profit, and find the exact percentile where cumulative profit crosses 80%. In Superstore it will be close to 80/20 but probably not exact, and the exact number is more interesting than the rule of thumb.

By Sunday: an updated Superstore repo with a customer segmentation sheet, the Pareto curve computed and charted, the segment profile table, and a section added to the analyst memo naming the three specific characteristics that distinguish VIP customers from Low Value customers.`,

  pre_flight: `Before building the segmentation, compute the total number of unique customers in the dataset and the total profit. Then estimate: if the 80/20 rule holds exactly, how many customers are in the top 20% and what is their aggregate profit? Write those two numbers down. The comparison between your estimate and the actual Pareto calculation is informative -- most datasets are more unequal than 80/20, and a few are less.`,

  mastery_questions: [
    `Aggregate the data to the customer level: for each Customer ID, compute total Sales, total Profit, order count, and average discount. Paste the first 5 rows and the row count. Now rank customers by total Profit descending and assign segments: VIP (top 10%), High Value (next 20%), Medium (next 40%), Low (bottom 30%). Use PERCENTRANK or NTILE logic. Paste the segment count and aggregate profit for each segment.`,
    `Compute the Pareto curve. Sort customers by total profit descending. Add a cumulative profit column (running sum). Add a cumulative percentage of total profit column (cumulative / grand total). Add a cumulative percentage of customers column (row number / total customers). Find the row where cumulative profit percentage first exceeds 80%. Paste that row. What percentage of customers does it represent? Is it above or below 80/20?`,
    `Build the segment profile table: for each segment, compute average order count, average order value (Sales / order count), average discount received, and Category mix (percentage of orders in each Category). Paste the table. Write two sentences comparing VIPs to Low Value customers on at least two dimensions -- specifically, do VIPs receive lower or higher average discounts? This connection between segmentation and discount policy is the finding that ties weeks 3 and 4 together.`,
    `Build the Pareto chart: a combination chart with cumulative customer percentage on the x-axis, a bar chart showing each customer's profit contribution, and a line showing the cumulative profit percentage. The 80% line on the y-axis is the key visual reference. Paste the chart. A reader should be able to identify the 80/20 point from the chart without reading the underlying table.`,
    `Write the memo update: one new paragraph stating the three specific characteristics that distinguish VIP customers from Low Value customers, with numbers for each. Do not write "VIPs spend more" -- write "VIP customers place an average of 14 orders per year versus 2 for Low Value customers, at an average order value of $847 versus $312, and receive an average discount of 8% versus 24%." Paste the paragraph.`,
  ],

  common_mistakes: [
    `Computing customer total profit at the order level instead of the customer level. A customer with 20 orders appears 20 times in the raw data -- aggregate to the customer level first with a SUMIF or groupby before segmenting.`,
    `Using revenue instead of profit for CLV segmentation in a dataset where margins vary widely. A customer who buys heavily discounted Furniture may have high revenue and negative profit contribution. Profit-based segmentation gives a more accurate picture of true customer value.`,
    `Assigning segment labels that overlap (top 10%, top 20%, etc.) instead of non-overlapping ranges (top 10%, 10-30%, 30-70%, 70-100%). Double-check that every customer appears in exactly one segment and the segment percentages sum to 100%.`,
    `Charting the Pareto curve with profit on the x-axis instead of cumulative customer count. The convention is customers on the x-axis, cumulative profit on the y-axis -- the curve bends toward the top-left, showing that the left portion of customers drives a disproportionate share of profit.`,
    `Ignoring the Low Value segment in the analysis. The finding about VIPs is interesting. The finding about the Low Value segment -- specifically whether they are loss-making at high discounts -- is actionable.`,
  ],

  debug_help: `The PERCENTRANK-based segmentation fails if you are using PERCENTRANK on the profit column directly, because PERCENTRANK assigns the same rank to ties. For customer segmentation, you want RANK.EQ or RANK.AVG on the sorted profit column, then divide by total customers. The cleaner Excel approach: sort by profit descending, add a rank column (=ROW()-1, adjusted for header), then use IF nested on the rank fraction. In Python: df['percentile'] = df['profit'].rank(pct=True) and cut into segments with pd.qcut or pd.cut.`,

  ai_assist: `Use Claude to write the SUMIF formula for aggregating order-level data to the customer level. It is a multi-column SUMIF with customer ID as the criteria and multiple columns to aggregate -- mechanical but error-prone to write manually. Verify the output for 3 spot-check customers. Do NOT ask Claude to write the memo paragraph comparing VIPs to Low Value customers -- that comparison requires reading the actual numbers from your segment table, not generating plausible-sounding ones.`,

  stretch: [
    `Compute the retention rate by segment: of customers who placed an order in 2016, what percentage placed at least one order in 2017? Compute separately for VIPs and Low Value customers. The retention rate difference by segment is one of the strongest arguments for differential treatment of customer groups.`,
    `Map the VIP customers by State using a geographic pivot table. Are the VIP customers concentrated in specific states? If so, does the regional concentration match the high-performing regions from week 1? Connecting the customer analysis to the geographic analysis is the kind of multi-dimensional insight that distinguishes a senior analyst's work.`,
    `Compute RFM scores (Recency, Frequency, Monetary) for the customer base as an alternative segmentation approach. Score each customer 1-5 on each dimension, then combine the scores. Compare the RFM segments to the profit-based segments. Where do they agree and where do they disagree? The disagreements are the most instructive cases.`,
  ],
});

// ─── W5 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 5, {
  context: `You have done the Superstore analysis twice: once in Excel, once in Python. This week you do it in SQL -- the language that runs every serious data organisation's analytical infrastructure. Redshift, BigQuery, Snowflake, Databricks, and every other data warehouse accepts SQL as input. Pandas is useful when you can fit the data in memory on your laptop. SQL is what you use when the data lives somewhere else and you cannot.

The SQL version of the Superstore analysis has a specific goal: every pivot table and calculated metric from weeks 1 through 4 should be expressible as a SQL query that you can run against a database. You will load the Superstore CSV into a local SQLite database and write queries.sql with at least eight queries -- one for each of the main analytical questions. The queries should be readable: comments above each one, clear aliases, formatted with line breaks.

CTEs (Common Table Expressions, the WITH ... AS clause) are the SQL equivalent of naming an intermediate result in Excel. Instead of a formula that references a formula that references another formula, you name each step: WITH customer_totals AS (...), then segment_ranks AS (...), then SELECT FROM segment_ranks. CTEs make complex SQL readable and debuggable, and they are the standard pattern in every modern analytics SQL style guide.

Self-joins are how you compute year-over-year comparisons in SQL. You join the orders table to itself, matching on Category and the year, and compute the ratio between the two year's values. It is not intuitive until you see it once, and once you see it it is the natural way to express "compare this year to last year."

By Sunday: queries.sql committed to the Superstore repo with at least eight queries, every query producing a result that matches the corresponding Excel or Python output, and a brief comment above each query explaining what question it answers.`,

  pre_flight: `Install DB Browser for SQLite (free, cross-platform) and import the Superstore CSV into a new SQLite database. Run SELECT * FROM superstore LIMIT 5 and paste the output. Confirm the column names match what you expect from the CSV. If the column names have spaces (they do -- "Order Date", "Customer Name"), you will need to quote them with backticks or brackets in every query. Write that reminder at the top of queries.sql.`,

  mastery_questions: [
    `Write Query 1: total Sales, Profit, and Profit Margin by Category. Use a CTE to compute the aggregates first: WITH cat_totals AS (SELECT Category, SUM(Sales) as total_sales, SUM(Profit) as total_profit FROM superstore GROUP BY Category) SELECT *, ROUND(total_profit * 1.0 / total_sales, 4) as margin FROM cat_totals ORDER BY margin DESC. Paste the result. Does it match the week-1 Excel pivot? If not, write which cells differ and why.`,
    `Write Query 2: annual revenue with year-over-year growth using a self-join. WITH annual AS (SELECT strftime('%Y', "Order Date") as year, SUM(Sales) as revenue FROM superstore GROUP BY 1) SELECT a.year, a.revenue, ROUND((a.revenue - b.revenue) * 1.0 / b.revenue, 4) as yoy_growth FROM annual a LEFT JOIN annual b ON CAST(a.year AS INT) = CAST(b.year AS INT) + 1 ORDER BY a.year. Paste the result. Does the YoY growth match weeks 1 and 2? Write one sentence about what the LEFT JOIN handles that an INNER JOIN would not.`,
    `Write Query 3: customer lifetime value -- total Profit, order count, and average order value per customer, sorted by total Profit descending, with LIMIT 10. Paste the top 10 customers and confirm the top customer's profit matches the week-4 customer aggregation. Now write Query 4: the segment distribution using a CASE statement to assign VIP/High/Medium/Low based on the NTILE(10) window function. Paste the query and the segment counts.`,
    `Write Query 5: the discount bucket analysis using a CASE statement equivalent to the nested IF from week 3. Add a GROUP BY on the bucket and Category. Paste the result confirming the margin at each discount bucket matches the week-3 analysis. Write one sentence about when you would use a CASE statement versus a lookup table join for binning a continuous variable.`,
    `Add a validation query for each of the four main queries: a simpler aggregation that checks the grand total. For example: SELECT SUM(total_profit) FROM (your margin query) should equal SELECT SUM(Profit) FROM superstore. Write and run all four validation queries. Paste their output. Validation queries are the SQL equivalent of the manual spot-check you did in week 1 -- every analyst who works in SQL should have this as a reflex.`,
  ],

  common_mistakes: [
    `Using integer division in SQLite. In SQLite, 1/3 returns 0, not 0.333. Always cast at least one operand to float: 1.0/3 or CAST(numerator AS REAL) / denominator. The most common manifestation: computing margin as Profit/Sales returns 0 for all rows because both are stored as integers.`,
    `Forgetting to quote column names with spaces. "Order Date" without quotes fails with "no such column: Order". Use backticks in SQLite: \`Order Date\`. Include a comment at the top of queries.sql reminding yourself of this -- it will save 20 minutes of debugging when you return to the file.`,
    `Writing SELECT * in production-style queries. SELECT * is fine for exploration, but every query in queries.sql should name its output columns explicitly. A query that returns unknown columns is a query that breaks silently when the source schema changes.`,
    `Not testing each query result against the corresponding Excel or Python output. The point of the SQL version is reproducibility -- if the numbers differ, you have a bug in one of the three versions and you need to find it.`,
    `Using subqueries where CTEs would be clearer. A query with three levels of nested subqueries is correct but unreadable. Refactor to CTEs before committing. Code that nobody can read in six months -- including you -- is technical debt.`,
  ],

  debug_help: `If a query returns unexpected results, use SELECT COUNT(*) to check row counts at each intermediate step. If a JOIN produces more rows than you expect, you probably have a many-to-many join -- check that the join key is unique on at least one side. If a GROUP BY returns fewer rows than you expect, you might have NULLs in the group column -- SQLite groups NULLs together as a single group, which can surprise you. Run SELECT "column_name", COUNT(*) FROM superstore GROUP BY 1 ORDER BY 2 for any suspicious column and check whether NULL appears in the output.`,

  ai_assist: `Use Claude to generate the self-join year-over-year query -- the syntax for joining a table to itself with a year offset is mechanical and Claude writes it correctly. Verify the output against weeks 1 and 2. Do NOT use Claude to debug wrong query results. Debugging SQL requires understanding what data each clause produces -- use SELECT to inspect intermediate CTEs one at a time.`,

  stretch: [
    `Translate the queries to BigQuery SQL syntax (free tier available). The main differences: backtick quoting is the same, but date functions use DATE_TRUNC instead of strftime, and CAST uses a different syntax. Running the same queries in BigQuery proves they work against a production-grade engine.`,
    `Write a query that identifies customers who placed orders in 2016 but not in 2017 (churned customers) using a NOT EXISTS or LEFT JOIN ... WHERE IS NULL pattern. Churn identification in SQL is a standard analyst skill and this dataset is a clean example.`,
    `Write one stored view: CREATE VIEW customer_segments AS (your segment query). Then write a query on top of the view: SELECT * FROM customer_segments WHERE segment = 'VIP'. Views are the SQL equivalent of a named range in Excel -- they hide complexity and make downstream queries readable.`,
  ],
});
