/**
 * v2 rewrite batch 3: data-analysis Weeks 11-15
 *  W11: HR Attrition v0.2 — Tenure + cohorts
 *  W12: HR Attrition v0.3 — Memo + dashboard
 *  W13: HR Attrition v1.0 — Ship + retro
 *  W14: Web scraping for business data
 *  W15: Project 3 — Marketing Funnel v0.1
 */

import { rewriteWeek } from "../rewrite-week";

// ─── W11 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 11, {
  context: `Last week you identified which departments and roles have the highest attrition rates. This week you add the time dimension: when in an employee's tenure is the attrition risk highest?

The tenure analysis is the question that converts "who leaves" into "when do they leave" -- which is what HR needs to design interventions. If attrition is highest in the first 12 months, the intervention is better onboarding and 30-60-90 day check-ins. If it is highest at the 2-3 year mark, the intervention is promotion pipeline clarity and salary reviews at that tenure point. If it is highest after 10+ years, the pattern is usually retirement-age exits or long-tenured employees who were not promoted and eventually stopped expecting to be.

The IBM dataset has YearsAtCompany and YearsInCurrentRole. You will bucket YearsAtCompany into tenure bands (0-1 years, 2-3, 4-5, 6-10, 10+) and compute attrition rate per band. The shape of the curve tells you where risk is concentrated. In most datasets, it is highest in the first two years. But some roles are different -- high-tenure technical specialists may show a late-career spike.

The promotion gap variable is worth engineering. Employees who have been in the same role longer than their peers -- defined as YearsInCurrentRole minus the median YearsInCurrentRole for their job role -- are more likely to feel stalled and leave. This is a feature, not a raw column; you have to compute it. The feature engineering is the analysis.

The 2D interaction cross-tab between tenure band and salary band (from week 10) is the most actionable finding this week. An employee in the 2-3 year tenure band who is also in the lowest salary band has a compounding risk that neither factor alone captures.

By Sunday: tenure band attrition table, promotion gap analysis, and the tenure × salary cross-tab all committed, with a one-paragraph summary of the "danger zone" combination.`,

  pre_flight: `Before building the pivot tables, compute the median YearsAtCompany for all employees who left (Attrition = "Yes") versus all who stayed (Attrition = "No"). Paste both medians. If they are more than 1 year apart, tenure is a meaningful predictor. If they are within 0.5 years, tenure alone is not discriminating well and you will need the interaction terms to find signal.`,

  mastery_questions: [
    `Bucket YearsAtCompany into five bands using VLOOKUP or nested IF: 0-1, 2-3, 4-5, 6-10, 10+. Compute attrition rate per band. Paste the table sorted by tenure band. At which tenure band is attrition highest? Write one sentence about the intervention that makes most sense at that stage -- the intervention depends on the diagnosis (new employee confusion versus stalled career versus burnout).`,
    `Engineer the promotion gap variable: for each employee, compute (YearsInCurrentRole - median YearsInCurrentRole for their Job Role). Use AVERAGEIFS to compute the median within role (or MEDIAN with CTRL+SHIFT+ENTER in an array formula). Paste the formula. Now bucket employees into "behind peers" (gap > 1 year), "on pace" (-1 to 1 year), and "ahead" (<-1 year). Compute attrition rate per bucket. Is being "behind peers" on promotion associated with higher attrition? Paste the rates.`,
    `Build the tenure band × salary band cross-tab. Rows: tenure bands. Columns: salary bands from week 10 ($0-3K, $3K-6K, $6K-9K, $9K+). Cells: attrition rate. Add conditional formatting: red for rates above 30%, yellow for 20-30%, green below 20%. Paste the table. Write one sentence identifying the single highest-risk cell and what it means for HR prioritisation.`,
    `Compute the "survival" curve visually: what percentage of employees who started at the company are still employed at each tenure milestone (1, 2, 3, 5, 7, 10 years)? This is a simple cumulative-attrition calculation, not a Kaplan-Meier survival model. For each milestone, compute: (employees with YearsAtCompany >= milestone) / total employees. Paste the curve values. The steepest drop -- where the largest percentage of employees leave -- is the priority window.`,
    `Write a one-paragraph "danger zone" summary for the HR Director. State specifically: the tenure band with highest attrition, the salary band that amplifies it, the promotion gap pattern, and one specific actionable recommendation. Paste the paragraph. "Employees in the 2-3 year tenure band earning under $3K per month who are more than 1 year behind their peers on promotion have a 48% attrition rate versus the 16% company average. Recommend: targeted promotion reviews for this cohort at the 18-month mark." is the level of specificity needed.`,
  ],

  common_mistakes: [
    `Using arithmetic mean instead of median for the promotion gap benchmark. Salary and tenure data are often skewed by a few extreme values. The median YearsInCurrentRole for a job role is a more robust benchmark than the mean.`,
    `Counting attrition as a proportion of total company headcount instead of headcount within each tenure × salary cell. The denominator in the cross-tab must be the number of employees in that specific cell, not the total 1,470.`,
    `Building the cross-tab before checking cell sizes. Some cells in the tenure × salary grid may have fewer than 10 employees. Attrition rates computed on 3 employees are not reliable. Highlight cells with n < 10 and note them as "insufficient data."`,
    `Interpreting the promotion gap variable as causal. Employees who are "behind peers" on promotion may leave because they are being passed over, or they may be "behind peers" because they are already planning to leave and have stopped performing. The variable is a predictor, not necessarily a cause.`,
    `Not checking whether tenure band is ordinal-consistent. "2-3 years" followed by "4-5 years" should show a declining or U-shaped attrition rate in most datasets. A non-monotonic pattern (rate goes up at 4-5, down at 6-10, up again at 10+) usually means there are within-band confounders worth investigating.`,
  ],

  debug_help: `Array formulas for MEDIAN by group in Excel require pressing CTRL+SHIFT+ENTER instead of just ENTER. The formula appears in curly braces {=MEDIAN(IF(JobRole_col=A2, YearsInCurrentRole_col))}. If you just press ENTER, the formula returns the median of the whole column instead of the group median. The sign that this happened is that all job roles have the same median value. In Python, the group median is df.groupby('JobRole')['YearsInCurrentRole'].median() -- much cleaner.`,

  ai_assist: `Use Claude to generate the array formula for computing group median in Excel -- the syntax is non-obvious and Claude writes it correctly. Test it for two job roles manually. Do NOT use Claude to write the "danger zone" paragraph. That paragraph requires reading the specific numbers from your cross-tab and synthesising them into a recommendation, which requires understanding what those numbers mean in an HR context.`,

  stretch: [
    `Add the Manager relationship as a predictor. Compute attrition rate by YearsWithCurrManager (bucket into 0-1, 2-4, 5+). Do employees who have been with their current manager for less than 1 year have higher attrition? In most datasets, manager transitions are a leading indicator of attrition.`,
    `Compute a simple "attrition risk score" per employee: the sum of three binary flags (tenure in danger zone, salary in bottom band, promotion gap above 1 year). An employee with all three flags is high risk; with none, low risk. Compute the attrition rate for each score level (0, 1, 2, 3). Does the risk score discriminate well?`,
    `Research the Glassdoor employee satisfaction data for a company in the HR dataset's industry. Does the sentiment on Glassdoor align with the attrition patterns you found? This connection between internal data and external signals is the kind of analysis a senior HR analyst or people analytics team does.`,
  ],
});

// ─── W12 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 12, {
  context: `Two weeks of HR attrition analysis is now ready to be packaged into deliverables. This week follows the same pattern as weeks 8 and 9 of the Superstore project, but the audience is different and the difference matters.

The Superstore analysis went to a retail executive who cares about revenue and margin. The HR attrition analysis goes to an HR Director who cares about retention, wellbeing, and culture -- and who is sensitive to how findings are framed. An analysis that says "the Sales department has a 35% attrition rate" lands differently than "35% of the Sales team left last year, costing approximately $2.1M in replacement costs." The second framing connects the attrition data to a business number the HR Director can bring to the CFO.

The dashboard for HR analysis has a different design pattern from a retail dashboard. The headline KPI is not revenue or margin -- it is the overall attrition rate, the number of at-risk employees, and the estimated annual cost. The filter-driven design is more important here because HR Directors typically need to slice by Department, Role, and Manager separately. A slicer that lets them click on "Sales" and see all the charts update is more useful than six charts for six departments.

The recommendations this week must be specific and paired with difficulty-and-impact ratings. "Increase salaries" is a recommendation but not a useful one because it conflicts with "reduce costs" that the CFO will bring to the same meeting. "Conduct mandatory 18-month tenure reviews for employees in the Sales role earning under $3K per month" is specific enough to schedule, budget, and evaluate.

By Sunday: a one-page filter-driven Excel dashboard, the HR Director memo (two pages, with the cost framing), and the five-slide deck with recommendations rated by difficulty and impact.`,

  pre_flight: `Before building the dashboard, write the three numbers that belong on the KPI banner at the top: overall attrition rate, number of employees currently in the "danger zone" combination, and estimated annual replacement cost for that cohort. You need these numbers to be exact, not estimated, before you build the dashboard. Compute them now from the pivot tables.`,

  mastery_questions: [
    `Build the KPI banner: three cells in the dashboard header, formatted as large numbers with labels. Overall attrition rate, count of employees in the danger zone, and annual replacement cost (danger zone count × attrition rate × 1.5 × median salary). Paste the three values. These three numbers are the "executive summary" of the dashboard -- a VP who sees only the KPI banner should understand whether this is an emergency or a manageable situation.`,
    `Add a Department slicer connected to all charts. When the HR Director selects "Sales," every chart updates to show Sales-only data. Confirm the slicer works by selecting one department and checking that the attrition rate shown matches the week-10 pivot table for that department. Paste the confirmed rate. A dashboard with a broken filter is a dashboard the HR Director will stop using after the second mistake.`,
    `Write the HR Director memo. Two pages. Page 1: the overall attrition picture and the most important finding (the danger zone combination with the estimated cost). Page 2: three specific recommendations, each with: Action (what HR should do), Timing (when), Cost (rough estimate), and Expected Impact (reduction in attrition rate for the target cohort, with basis). Paste the three recommendations in the Page 2 format. Each recommendation should be implementable with a budget conversation and a calendar invite.`,
    `Build the five-slide deck using the same Pyramid Principle structure as the Superstore deck. Slide 1: the situation (attrition rate, cost) and the recommendation summary. Slides 2-4: the three supporting findings (department/role finding, tenure finding, danger zone finding). Slide 5: the three recommendations with difficulty and impact ratings (High/Medium/Low on each axis). Paste the five headline sentences. If any headline does not contain a number, it is not specific enough.`,
    `Rate the three recommendations on a 2x2 difficulty-impact matrix (Low-Medium-High for each axis). Paste the matrix. The recommendations that are Low Difficulty / High Impact are the ones the HR Director should do first. If all three are High Difficulty / High Impact, you have identified the real problem (the interventions that would work are expensive) and that is itself a finding worth stating in the deck.`,
  ],

  common_mistakes: [
    `Building the dashboard before agreeing on the three KPI banner numbers. If the KPI numbers are wrong, the rest of the dashboard is built on a wrong foundation. Always compute the key numbers first, validate them, then build the visual.`,
    `Writing recommendations that are not actionable by the HR Director alone. "Fix the company culture" is not a recommendation an HR Director can implement with a quarterly budget. "Add one skip-level meeting per quarter for employees in their first two years" is.`,
    `Making the deck longer than five slides because the analysis is complex. The analysis being complex is not a reason to make the deck longer. It is a reason to be more selective about what goes on each slide. The appendix handles complexity; the main deck handles clarity.`,
    `Rating all recommendations as "High Impact" without evidence. The impact estimate for each recommendation should be grounded in data: "Promotion reviews at 18 months should reduce 2-3 year attrition by approximately 8-12 pp, based on the observed attrition rate in employees who received promotion within this period versus those who did not."`,
    `Not testing the slicer on all departments before the deliverable. A slicer that works for Sales but breaks for R&D (because R&D has a different data structure or fewer rows) is a broken dashboard. Test every filter option.`,
  ],

  debug_help: `Excel slicers require that all charts and pivot tables using the slicer share the same data source (the same named table or PivotCache). If adding the slicer only affects some charts, right-click the slicer, select "Report Connections," and confirm all relevant pivot tables are checked. Charts built directly from ranges (not from pivot tables) cannot be connected to slicers -- they must be rebuilt as pivot charts connected to the pivot table.`,

  ai_assist: `Use Claude to generate the speaker notes for the HR Director deck. Paste each slide headline and the supporting data point, and ask for two to three sentences of speaker notes pitched to an HR Director who has not seen the analysis. Review the notes for accuracy -- Claude will occasionally generate plausible HR context that does not match your specific data. Flag any note that makes a claim you cannot support with your analysis.`,

  stretch: [
    `Add a "manager risk report" tab to the dashboard: a list of managers whose direct reports have above-average attrition rates, sorted by the magnitude. The most useful version of an attrition analysis for an HR Director is not company-wide patterns but the specific managers and teams where intervention is most urgent.`,
    `Compute the total three-year cost of attrition if no action is taken: (danger zone employees × current attrition rate × replacement cost) summed over three years, assuming the population stays constant. This number, alongside the cost of the interventions, makes the business case for the recommended actions.`,
    `Read McKinsey's "The State of People Analytics" report (usually published annually, findable with a search). Note which attrition metrics the most advanced companies track and compare to what you built this week. The gap is the next analytical capability to develop.`,
  ],
});

// ─── W13 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 13, {
  context: `Three weeks of HR attrition analysis ends this week the same way the Superstore project ended: with a deliberate close, a retrospective, and a demo video that proves the project works.

The demo video is two to three minutes. Open the dashboard, click the Department slicer to show Sales, call out the attrition rate and the cost number, click to R&D and note the contrast. Switch to the deck and walk through the three recommendations. That is the demo. It is not a tutorial, not a presentation -- it is a record that the thing works, that you can speak intelligently about what it shows, and that a stranger watching can follow the logic without you in the room to explain.

The SQL version of the HR analysis is the second deliverable this week. Every pivot table and calculated metric from weeks 10 through 12 should be expressible as a SQL query. The attrition rate by department is a GROUP BY with a CASE-based COUNTIF equivalent. The tenure bucketing is a CASE statement. The cross-tabulation is a conditional aggregation. Adding these queries to queries.sql completes the pattern established in week 5 -- every analysis exists in both the spreadsheet and the SQL layer.

The retrospective this time should note what you did differently in Project 2 based on the week-9 retro from Project 1. If you wrote "I will write slide headlines before building charts" in the week-9 retro and you actually did that this time, note it. If you wrote it and reverted to the old habit, note that too -- the honest version is more useful than the flattering version.

By Sunday: demo video committed or linked, SQL version of all key metrics in queries.sql, RETRO.md written and committed, and the repo README updated to reflect the final Project 2 state.`,

  pre_flight: `Re-read the week-9 RETRO.md from the Superstore project. Identify one specific thing you said you would do differently in Project 2. Did you do it? Write the answer before starting any other work this week -- it takes 5 minutes and sets the honest framing for this week's retrospective.`,

  mastery_questions: [
    `Write the SQL query for attrition rate by Department: SELECT Department, COUNT(CASE WHEN Attrition='Yes' THEN 1 END) as attrited, COUNT(*) as total, ROUND(COUNT(CASE WHEN Attrition='Yes' THEN 1 END) * 1.0 / COUNT(*), 3) as attrition_rate FROM hr_attrition GROUP BY Department ORDER BY attrition_rate DESC. Paste the query and the result. Does it match the week-10 pivot table? Write one sentence about the CASE WHEN pattern -- it is the SQL equivalent of COUNTIFS with a "Yes" criterion.`,
    `Write the SQL query for the tenure band cross-tab using multiple CASE WHEN columns: one column per salary band, each containing the attrition rate for that salary band within each tenure group. Paste the query structure (it uses conditional aggregation). This is the SQL equivalent of the week-11 cross-tab and it is one of the more advanced SQL patterns -- but it is the pattern that appears in every data warehouse reporting layer.`,
    `Record the demo video. Two to three minutes. Open the dashboard, use the slicer, call out two findings by name with their numbers, switch to the deck, walk through one recommendation. Paste the URL or the file path. Watch it back once. Write one sentence about the single thing you would change if you recorded it again.`,
    `Write RETRO.md for HR Attrition. Required sections: what you did differently from Project 1 (based on the week-9 retro), what took longer than expected in this project (specific), what you would change if you started over, and what you are taking into Project 3. Paste the file.`,
    `Update the repo README to its final state. Link to the dashboard, memo, deck, and video. State the overall attrition rate, the danger zone finding with its rate and cost estimate, and the three recommended actions. A recruiter who reads only the README should understand the project's business value. Paste the updated README.`,
  ],

  common_mistakes: [
    `Recording a 10-minute demo video instead of a 2-3 minute one. A 10-minute demo is a tutorial. A 2-3 minute demo is a proof. The proof is what you need for a portfolio -- the recruiter will watch 3 minutes, not 10.`,
    `Writing a retrospective that compares to a hypothetical ideal rather than to what you actually did in Project 1. "I could have built the dashboard better" is not a retro entry. "I built the dashboard before writing the KPI numbers, same as Project 1, because I was excited to see the visual -- next time I will write the KPI numbers first" is.`,
    `SQL queries that produce slightly different numbers than the pivot tables, with no investigation. Any discrepancy between the SQL and the spreadsheet is a bug in one of them. Find it, fix it, and note in comments which version had the error.`,
    `Not updating the README after the video is recorded. The README should link to the video. A project that exists but is not linked from the README might as well not exist for anyone browsing your GitHub profile.`,
    `Marking the project as "done" before the SQL version is complete. The SQL version is not optional -- it is the demonstration that the analysis is portable beyond the spreadsheet, which is the point.`,
  ],

  debug_help: `Conditional aggregation SQL (the cross-tab pattern) fails silently when the CASE WHEN criterion does not match any rows -- it returns 0 or NULL, which looks like a legitimate result. Always validate the conditional aggregation against the simple GROUP BY for one group before trusting the cross-tab output. If the cross-tab shows 0 attrition in a cell that you know has attritions from the pivot table, the CASE criterion is wrong (wrong capitalisation, wrong column name, wrong data type).`,

  ai_assist: `Use Claude to generate the conditional aggregation SQL for the cross-tab. This is a complex but mechanical pattern, and Claude writes it correctly. Validate the output for two cells against your pivot table before trusting the full query. Do NOT use Claude to write the retrospective -- the retrospective is honest self-assessment and requires the actual memory of what happened during the project.`,

  stretch: [
    `Add a "People Analytics Dashboard" to your LinkedIn profile using the three key outputs from this project as bullet points: overall attrition rate identified, danger zone population and cost quantified, three specific HR recommendations with estimated impact. The specific numbers convert a generic "data analysis project" into an evidence-based portfolio piece.`,
    `Compute the predicted first-year impact of implementing the top recommendation, using the data. If "18-month promotion reviews" would affect 45 employees and the base rate for that cohort is 40%, and similar interventions in the literature reduce attrition by 30%, the estimated impact is 45 × 0.40 × 0.30 = 5.4 fewer attritions, saving approximately 5.4 × 1.5 × $60K = $486K. This back-of-envelope ROI calculation is what makes the recommendation fundable.`,
    `Find the original IBM HR Analytics research context (the dataset was generated for a machine learning tutorial). Compare what you found with your analytical approach to what the dataset designers intended it to demonstrate. The comparison reveals how exploratory data analysis and machine learning answer the same question differently.`,
  ],
});

// ─── W14 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 14, {
  context: `Both projects so far used clean, pre-packaged datasets. Most real-world analyst work does not. Prices change on competitor websites. Product listings appear and disappear. Public datasets are updated irregularly. The skill of pulling structured data from unstructured web pages -- web scraping -- is not a developer skill, it is an analyst skill, and it is used constantly by anyone doing competitive intelligence, market research, or pricing analysis.

The context this week is competitor price tracking. You will choose a public website that lists prices -- a retailer's product page, a job board's salary listings, a real estate listing site, or a public government data portal -- and write a BeautifulSoup scraper that extracts the relevant fields, appends a row to a CSV with a timestamp, and can be run again tomorrow to capture the new prices.

The ethics of scraping matter and they are not complicated. Do not scrape sites that explicitly forbid it in their robots.txt. Do not scrape at a rate that burdens the server (add a 1-second delay between requests). Do not scrape personal data. Public product prices, public job listings, and public government data are generally acceptable. If you are unsure, read robots.txt before writing any code.

BeautifulSoup is the tool. It parses HTML and lets you find elements by tag, class, or ID. The workflow: requests.get(url) to fetch the page, BeautifulSoup(html, 'html.parser') to parse it, soup.find_all('div', class_='price') to extract the relevant elements. The elements change when the site redesigns -- your scraper is fragile by design, and knowing that it is fragile is part of the skill.

By Sunday: a competitor-price-tracker repo with a working scraper, an append-only history.csv that has at least 2 rows (two runs on different days), and a simple Google Sheets dashboard visualising the price history.`,

  pre_flight: `Choose your target site before writing any code. Check robots.txt (add /robots.txt to the domain). Read the relevant Disallow rules. If the paths you want to scrape are disallowed, choose a different site. Write down the specific URL you will scrape and the three data fields you will extract. Opening the URL in the browser and finding the exact HTML element that contains the price (right-click > Inspect) takes 5 minutes and prevents an hour of confused Beautiful Soup debugging.`,

  mastery_questions: [
    `Fetch the target page with requests.get and parse it with BeautifulSoup. Find the HTML element containing the price (use the browser Inspector to identify the tag and class). Paste the soup.find_all() call and the first element it returns. If the first element is not the price, the selector is wrong -- try a different class or ID. Write one sentence about how you identified the correct selector.`,
    `Extract the price, product name, and timestamp from the page. Write the extracted data to history.csv using pandas with mode='a', header=not os.path.exists(). Paste the CSV row. Run the script a second time and paste both rows -- the append-only pattern should produce two rows, not overwrite the first. If the file has only one row after two runs, the mode='a' logic is wrong.`,
    `Add a rate-limiting delay (time.sleep(1)) between requests if you are scraping multiple pages. Add a User-Agent header to the requests.get call that identifies your scraper honestly: headers={'User-Agent': 'price-tracker-bot/1.0 (contact: youremail)'}. Paste the requests.get call with headers. Explain in one sentence why a User-Agent matters -- it lets the site operator identify your traffic and contact you if you are causing issues.`,
    `Build a Google Sheets dashboard connected to the history.csv data. The dashboard has two elements: a chart showing price over time (x-axis: timestamp, y-axis: price) and a KPI showing the change from the first recorded price to the most recent. Paste the Sheets URL (set sharing to "anyone with link can view"). The chart proves the scraper is collecting data across time.`,
    `Write the README for the competitor-price-tracker repo. Include: what site is being tracked and why (one sentence), how to run the scraper (one command), what fields are collected, the robots.txt check result, and a note about rate limiting. Paste the README. A README that does not mention the ethical/legal context of web scraping is an incomplete README for a scraping project.`,
  ],

  common_mistakes: [
    `Not reading robots.txt before scraping. Scraping a site that disallows it is a legal and ethical issue, not just a technical one. Some companies monitor for scrapers and send cease-and-desist letters. Read robots.txt first, always.`,
    `Not adding a delay between requests when scraping multiple pages. A scraper that hits 50 pages per second produces traffic indistinguishable from a DDoS attack. time.sleep(1) is the minimum; time.sleep(random.uniform(1, 3)) is better because it does not produce a metronomic traffic signature.`,
    `Using append mode without checking whether the CSV exists, resulting in the header row being written on every run. Use if not os.path.exists(filename) to write the header only on the first run. Or use pd.DataFrame.to_csv(mode='a', header=not os.path.exists(filename)).`,
    `Building the scraper around a specific class name that changes when the site updates its CSS. Scraper fragility is inherent -- document that the scraper targets a specific HTML structure and include the date it was written, so future debuggers know to re-inspect the page if it breaks.`,
    `Storing the scraped data only in memory and not persisting it. A scraper that prints the price but does not write to a file is not a price tracker -- it is a one-time lookup. Persistence (the append-only CSV) is the whole point.`,
  ],

  debug_help: `Two common BeautifulSoup failure modes. First: soup.find_all() returns an empty list. Either the class name is wrong (check the exact class in the Inspector -- classes often have multiple words separated by spaces, and BeautifulSoup requires a list or the exact string), or the content is loaded by JavaScript (BeautifulSoup only parses static HTML). For JavaScript-rendered pages, use playwright or selenium instead of requests. Second: the price text includes "$" and "," characters that prevent conversion to float. Use .text.strip().replace('$','').replace(',','') before float() conversion.`,

  ai_assist: `Use Claude to generate the BeautifulSoup selector for your specific target element. Paste the HTML snippet from the Inspector (right-click the element, copy outerHTML) and ask "write a BeautifulSoup expression to extract the price from this HTML." Test the generated selector on your fetched page and verify it returns the correct value. Do NOT use Claude to determine whether a site's scraping is ethically permissible -- that requires reading the actual robots.txt and terms of service, which Claude cannot access in real time.`,

  stretch: [
    `Add email alerting: if the price drops below a threshold you define, send yourself an email using smtplib. This converts the tracker from a data collection tool into an automated monitoring tool -- the kind of system a pricing analyst at an e-commerce company would build.`,
    `Schedule the scraper to run daily using cron or Task Scheduler. After one week, plot the 7-day price history. Seven days of actual price movement data is more interesting than two rows of test data.`,
    `Add a second competitor site to the tracker and compare prices side by side in the Sheets dashboard. Two-column price comparison over time is the actual output a purchasing manager or competitive intelligence analyst would use.`,
  ],
});

// ─── W15 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 15, {
  context: `Project 3 uses real e-commerce data. The Olist dataset is a public Brazilian e-commerce dataset containing 100,000 orders from 2016 to 2018, with tables for orders, order items, payments, reviews, customers, sellers, and products. It is multi-table, which is meaningfully different from the single-table datasets you have worked with so far -- the analysis requires JOINs before it can answer most questions.

The marketing funnel question is: at each stage of the purchase journey, how many potential customers make it to the next stage, and where are the biggest drops? In a traditional e-commerce context the funnel is: visitor → product view → add to cart → checkout → purchase. The Olist data does not have visitor and view data, but it has order status (pending, processing, shipped, delivered, cancelled) and review data, which gives you a funnel from order placed to delivery to satisfaction.

The delivery-to-review connection is the most interesting question in this dataset. Olist is a marketplace -- sellers ship directly to customers, and delivery experience is entirely in the hands of third-party logistics. Review scores are the customer satisfaction signal. The question is whether delivery time (purchase date to delivery date) predicts review score. If it does, then late deliveries are not just an operational problem -- they are a reputation problem, and the analysis can quantify how much each day of delay costs in terms of review score.

This week is the exploration phase. You are not building the final dashboard yet -- you are understanding the schema, building the order status funnel, and computing the delivery-to-review correlation as a first signal. By the end of the week you will know whether there is a real story here, and you will have the building blocks for the deeper analysis in week 16.

By Sunday: schema diagram (a visual or written description of all seven tables and their join keys), the order status funnel computed, the delivery time distribution computed, and the delivery-review correlation with a scatter plot committed to a new olist-funnel-analysis repo.`,

  pre_flight: `Download all seven Olist CSV files from Kaggle (search "Brazilian E-Commerce Public Dataset by Olist"). Before writing any code, draw the schema on paper: which tables have foreign keys to which other tables? The central table is olist_orders_dataset -- every other table joins to it on order_id or customer_id or seller_id. Write out the join path from orders to reviews (orders → reviews on order_id) and from orders to products (orders → order_items → products on order_id then product_id). Knowing the join path before querying saves an hour of confusion.`,

  mastery_questions: [
    `Load all seven CSVs into pandas. Run df.shape for each and paste a table: table name, rows, columns, join key. Confirm the join keys are consistent: every order_id in olist_order_items appears in olist_orders. Use set(items['order_id']).issubset(set(orders['order_id'])) to check. If it returns False, you have orphaned records. Write one sentence about whether orphaned records are a data quality issue or expected behaviour in this dataset.`,
    `Build the order status funnel. The olist_orders table has order_status values including "delivered," "shipped," "canceled," "unavailable," etc. Compute the count and percentage of orders in each status. Plot as a horizontal bar chart sorted by count. Paste the chart and the top-3 status values with their percentages. Write one sentence about what "unavailable" means in this context -- is it a cancelled order, a product that went out of stock, or something else?`,
    `Compute delivery time per order: (order_delivered_customer_date - order_purchase_timestamp) in days. Exclude orders where delivery date is null (undelivered). Paste the mean, median, P25, P75, and P95 delivery time. What does the P95 delivery time (the slowest 5% of orders) suggest about the worst-case customer experience in this marketplace?`,
    `Join orders to reviews on order_id. Compute the correlation between delivery time (days) and review_score. Paste the correlation coefficient and a scatter plot (delivery days on x, review score on y). Is the correlation negative (longer delivery → lower score)? Write one sentence about the magnitude: a correlation of -0.2 explains 4% of the variance in review scores, which means delivery time is a predictor but not the dominant one.`,
    `Write the schema diagram. For each table: table name, number of rows, key columns, and the join key to the central orders table. You can write this as a markdown table or as a text-based diagram. Paste it. A clear schema diagram is the deliverable that lets future-you (or a collaborator) understand the data structure without re-reading all seven CSVs.`,
  ],

  common_mistakes: [
    `Joining tables without checking for duplicate join keys. If a single order has multiple items (which it does in Olist), joining orders to order_items produces one row per item, not per order. After a join, run .shape to check whether the row count increased -- if it did, the join multiplied rows.`,
    `Treating null delivery dates as zero delivery time. Orders that have not been delivered yet have null delivery dates. Subtracting null from a date in pandas returns NaT. Filtering to delivered orders (order_status == 'delivered') before computing delivery time prevents this.`,
    `Computing the funnel as a percentage of the total before establishing whether the statuses are mutually exclusive. In Olist, each order has one status -- they are mutually exclusive. But in other funnel datasets, a customer might appear in multiple stages. Always check the uniqueness of the group column before computing funnel percentages.`,
    `Plotting a scatter plot of 100,000 points without any transparency. A dense scatter plot is an opaque black rectangle. Use plt.scatter(alpha=0.05) to make individual points visible even when overlapping. For very large datasets, a hexbin plot (plt.hexbin) or a 2D density plot is more informative than a scatter.`,
    `Interpreting the delivery-review correlation as causal without checking other explanations. Product quality, seller reputation, price expectations, and customer demographics all affect review scores. A -0.2 correlation with delivery time is a signal, not a complete explanation.`,
  ],

  debug_help: `Datetime subtraction in pandas requires both columns to be datetime type. If order_purchase_timestamp is object (string), df['order_purchase_timestamp'] = pd.to_datetime(df['order_purchase_timestamp']) converts it. After conversion, the subtraction produces a Timedelta, not an integer -- convert to days with .dt.days. If the result has negative values, one of the date columns has data quality issues (delivered before purchased) -- filter those out and note them in a comment.`,

  ai_assist: `Use Claude to write the JOIN query that merges orders, order_items, and order_reviews into a single analysis-ready DataFrame. The join path is orders → order_items on order_id (to get product information), and orders → order_reviews on order_id (to get review scores). Paste the generated merge code and verify the resulting DataFrame has the expected number of rows and columns. Do NOT use Claude to interpret the delivery-review correlation -- that interpretation requires looking at the actual scatter plot and the domain context of a Brazilian e-commerce marketplace.`,

  stretch: [
    `Compute the delivery time distribution separately for each Brazilian state (customer_state column in the customers table). Do some states have significantly longer delivery times than others? The geographic distribution of delivery times is an operational finding that Olist's logistics team would act on.`,
    `Find the top 10 product categories by order volume. Do any categories have systematically lower review scores? A category where reviews are consistently low despite reasonable delivery times suggests a product quality or expectation-mismatch issue rather than a logistics issue.`,
    `Read Olist's publicly available blog posts about their platform (available on Medium). Compare what they say about their marketplace model and logistics partnerships to what the data shows. The combination of public narrative and internal data analysis is how business analysts build a complete picture.`,
  ],
});
