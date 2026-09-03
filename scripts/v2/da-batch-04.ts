/**
 * v2 rewrite batch 4: data-analysis Weeks 16-20
 *  W16: Olist Funnel v0.2 — Cohorts + repeat purchase
 *  W17: Olist A/B test — planning a marketing experiment
 *  W18: Olist Funnel v0.3 — Memo + dashboard
 *  W19: Olist Funnel v1.0 — Ship + retro
 *  W20: Tableau — the other half of the BI market
 */

import { rewriteWeek } from "../rewrite-week";

// ─── W16 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 16, {
  context: `Last week you found that delivery time correlates with review score. This week you move to a different marketing question: do Olist customers come back, and if so, what predicts whether they will?

Cohort analysis is the analyst's tool for measuring retention. A cohort is a group of customers who made their first purchase in the same time period -- the January 2017 cohort, the Q2 2017 cohort. By tracking each cohort through time, you can see whether customers acquired in different periods retained at different rates, and whether the business is getting better or worse at keeping customers over time.

The repeat purchase rate for Olist is surprisingly low. In most marketplaces, 30-40% of customers make a second purchase within 12 months. Olist is a B2C marketplace where many purchases are one-time (furniture, specific electronics, gifts) rather than recurring (groceries, consumables). The repeat rate you compute will probably be below 10%, and that is not necessarily a failure -- it is the nature of the product category mix. Knowing this matters for the marketing memo, because strategies optimised for repeat purchase (loyalty programmes, subscription offers) are less relevant for a low-repeat-purchase marketplace than strategies optimised for acquisition and first-purchase satisfaction.

The behavioral comparison between one-time and repeat buyers is where the interesting signal lives. Do repeat buyers rate deliveries higher? Do they come from different product categories? Do they have faster delivery times? These questions connect the delivery-review analysis from week 15 to the retention question.

By Sunday: a cohort retention matrix showing month-1 and month-3 retention by acquisition cohort, the overall repeat purchase rate computed correctly, the behavioral comparison table, and a one-paragraph write-up of the key finding for the marketing funnel memo.`,

  pre_flight: `Before building cohorts, answer one question from the raw data: how many unique customer_id values appear more than once in the orders table? In Olist, each order has a unique customer_id that is not the same as the customer's actual identity -- one real person can have multiple customer_ids. This is a data quality quirk you need to know before interpreting repeat purchase rates. Write down how you determined this from the data dictionary.`,

  mastery_questions: [
    `Identify the first order date for each customer_unique_id (the actual person identifier, which is in the customers table). Use groupby('customer_unique_id')['order_purchase_timestamp'].min(). Assign each customer to an acquisition cohort: the year-month of their first purchase. Paste the first 5 rows of the cohort assignment and the count of customers per cohort. Which month had the most acquisitions?`,
    `Compute the repeat purchase rate: the percentage of customers who made at least one additional purchase after their first. Paste the overall rate and the rate broken down by acquisition cohort (i.e., do customers who joined in Q4 2016 repeat more often than those who joined in Q2 2017?). If the rate differs across cohorts, write one hypothesis about why.`,
    `Build the cohort retention matrix. Rows: acquisition cohort (year-month). Columns: months since first purchase (0, 1, 2, 3, 6, 12). Cell values: percentage of the original cohort still active (having placed at least one order) in that month. Paste the matrix or its most informative rows. The month-1 column tells you how quickly customers come back; the month-12 column tells you which cohorts have the highest long-term retention.`,
    `Compare one-time buyers to repeat buyers on three behavioral dimensions: mean review score, mean delivery time, and most common product category. Paste the comparison table. Write one sentence about whether repeat buyers have better delivery experiences, or whether they repeat despite similar delivery times. The direction matters for the marketing recommendation.`,
    `Write the key finding paragraph for the marketing memo. One paragraph, specific numbers. Example shape: "Olist's repeat purchase rate is 3.2% within 90 days of first purchase. Customers who repeat are not distinguishable by delivery time or product category, but do rate their first purchase significantly higher (mean 4.4 versus 3.8 for one-time buyers, p < 0.001), suggesting that first-purchase satisfaction -- particularly around product quality and seller communication -- is the primary driver of repeat behaviour." Paste the paragraph.`,
  ],

  common_mistakes: [
    `Using customer_id instead of customer_unique_id for cohort analysis. Olist generates a new customer_id for each order, so one real person can appear with multiple customer_ids. Always join through the customers table to get customer_unique_id, which represents the actual individual.`,
    `Computing the cohort matrix on cohorts that are too recent to have meaningful 6 or 12-month retention data. A cohort from November 2018 cannot have 12-month retention data if the dataset ends in December 2018. Filter out cohorts where the follow-up window is incomplete before building the matrix.`,
    `Reporting the "repeat purchase rate" as the fraction of orders (not customers) that are repeat purchases. The rate should be (number of customers who placed 2+ orders) / (total customers). Make sure the denominator is unique customers, not total orders.`,
    `Treating low repeat rate as a product failure without considering the category mix. A marketplace selling mattresses and wedding gifts will naturally have lower repeat rates than one selling coffee or office supplies. The context determines whether 3% repeat rate is concerning or expected.`,
    `Not computing statistical significance for the behavioural comparison. If the repeat buyer group has only 50 customers, the mean review score difference may not be significant. Always check the group size and compute a p-value before stating a finding.`,
  ],

  debug_help: `The cohort retention matrix calculation breaks down if a customer places multiple orders in the same month and is counted more than once. Group to the customer-month level first (keep only the first order per customer per month), then count active customers per cohort per month. If your retention matrix shows retention rates above 100%, you have counted a customer more than once in a cohort-month cell.`,

  ai_assist: `Use Claude to generate the pandas code for the cohort retention matrix -- it is a pivot_table with percentage calculations and requires a specific sequence of merges and groupbys. Verify the output for one cohort manually: pick the January 2017 cohort, count how many customers it has, and manually check how many of those made a second purchase in February 2017. The manual check should match the matrix cell. Do NOT use Claude to write the key finding paragraph -- that paragraph requires synthesising the specific numbers from your analysis with domain knowledge about e-commerce, which requires your judgment.`,

  stretch: [
    `Compute time-to-repeat for customers who did repeat: how many days elapsed between their first and second purchase? Plot the distribution. The peak of the distribution is the "sweet spot" for a follow-up marketing email -- if most repeaters come back within 60 days, a 30-day email campaign makes sense.`,
    `Test whether review score on the first purchase predicts repeat purchase using a logistic regression (from sklearn.linear_model import LogisticRegression). Use review score as the only feature. Report the coefficient and the pseudo-R². Does first-purchase satisfaction predict repeat purchase? If yes, how strongly?`,
    `Compare Olist's repeat purchase rate to published benchmarks for Brazilian e-commerce or general marketplace retail. Adjust.com and similar analytics companies publish category benchmarks annually. Contextualising your finding against industry benchmarks converts an observation into an assessment.`,
  ],
});

// ─── W17 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 17, {
  context: `Most analysts consume A/B test results. They look at the dashboard, read the p-value, and write up the finding. The senior analyst can also design the experiment before it runs -- which means catching the flaws before $200,000 of marketing spend is committed to an underpowered test.

This week you design a real A/B test for the Olist marketing funnel. The specific question: does a follow-up email at day 30 after first purchase increase repeat purchase rates? You will specify the hypothesis, the primary metric, the minimum detectable effect, the required sample size, the experiment duration, and the randomisation strategy. You will not run the experiment -- the data is historical -- but you will produce a product spec document that a marketing analyst could hand to an engineer and actually run.

The most common A/B testing mistake that analysts make (not researchers -- analysts who set up experiments in production) is choosing a minimum detectable effect that is too ambitious. "We expect to increase repeat purchase rates from 3% to 6%" sounds reasonable. It is actually a 100% relative lift. Most real experiments that work at all produce 10-20% relative lifts. Expecting 100% means either the baseline is very wrong or the treatment is very strong -- and it usually means the analyst has not thought carefully about what is realistic.

Sample size calculation comes before everything else. If you need 50,000 users to detect a 10% relative lift at 80% power, and you have 5,000 new customers per month, the experiment needs to run for 10 months. That is too long -- the market will have changed. The fix is to either increase the MDE (accept that you can only detect larger effects reliably), increase the metric sensitivity (use a more sensitive variant of the metric), or accept lower statistical power. All three are legitimate tradeoffs, and documenting which you chose and why is the job.

By Sunday: an A/B test spec document (AB-TEST-SPEC.md) committed to the repo, with all six required sections filled in with specific numbers.`,

  pre_flight: `Before writing the spec, compute the current baseline from the Olist data: what is the 30-day repeat purchase rate (percentage of customers who place a second order within 30 days of their first)? This is the control group rate you are trying to improve. Without this number, every part of the spec is guesswork. Compute it now and write it down.`,

  mastery_questions: [
    `Compute the baseline 30-day repeat purchase rate from the Olist data. Paste the calculation and the rate. This is the control proportion (p1) for the sample size calculation. Now specify your hypothesis: the follow-up email will increase 30-day repeat rate from p1 to p2, where p2 = p1 * (1 + MDE) and MDE is the minimum detectable effect you choose. Write down your MDE choice and your reasoning for it.`,
    `Compute the required sample size using the two-proportion z-test formula or statsmodels.stats.proportion.proportion_effectsize + statsmodels.stats.power.NormalIndPower. Use alpha=0.05 and power=0.80. Paste the required sample size per group. Now compute the experiment duration: if Olist acquires approximately N new customers per month (compute from the data), how many months will the experiment run? Write one sentence about whether the duration is practical.`,
    `Specify the randomisation strategy. How will customers be assigned to control and treatment? Describe: the randomisation unit (customer, not order -- one customer should not receive both treatments), the randomisation mechanism (hash of customer_unique_id modulo 2, or a random assignment at the point of first purchase), and why customer-level randomisation is correct for this experiment (order-level randomisation would allow the same customer to receive both emails for different orders).`,
    `Write the experiment success criteria. Primary metric: 30-day repeat purchase rate. Secondary metrics (at least two): 60-day repeat rate, first repeat order value, unsubscribe rate. Define what "win" looks like: primary metric improves significantly (p < 0.05), secondary metrics do not significantly worsen. Write down what action you would recommend if the primary metric improves but the unsubscribe rate also significantly increases.`,
    `Write the full AB-TEST-SPEC.md. Six sections: Hypothesis (one sentence), Primary Metric and Baseline (with computed value), MDE and Reasoning, Required Sample Size and Duration, Randomisation Strategy, Success Criteria and Decision Rules. Paste the file. A complete spec that a marketing engineer could implement without asking you clarifying questions is the correct level of detail.`,
  ],

  common_mistakes: [
    `Choosing an MDE based on what would make the result look impressive rather than what is realistic given the treatment. A 30-day email that increases repeat purchase rate by 10% relative is a strong result for a low-intent marketplace. Choosing 50% relative lift means the experiment will be underpowered unless you increase sample size to compensate.`,
    `Randomising at the order level instead of the customer level. If a customer places three orders and gets assigned to different groups for each, their data contaminates both groups. Always randomise at the customer level for customer-behavior experiments.`,
    `Not accounting for the duration of the measurement window in the experiment duration. If the primary metric is 30-day repeat purchase rate, the experiment must run for sample-acquisition-period + 30 days, not just the sample acquisition period. The last customers enrolled need 30 days to potentially repeat.`,
    `Ignoring multiple testing. If you check the primary metric every week and declare victory when it first crosses p=0.05, you will declare many false victories due to random fluctuation. Pre-specify the single analysis date (at the end of the planned duration) or use sequential testing methods.`,
    `Not specifying a "guardrail" metric. Any A/B test that improves the primary metric by harming a guardrail metric (unsubscribe rate, first-repeat NPS) is not a win. Define the guardrail metrics and their acceptable ranges before running the experiment.`,
  ],

  debug_help: `Sample size calculation confusion: the two-proportion z-test formula is sample_size_per_group = 2 * (z_alpha/2 + z_beta)^2 * p_bar * (1 - p_bar) / (p1 - p2)^2, where p_bar = (p1 + p2) / 2. Statsmodels handles this more cleanly: effect = proportion_effectsize(p2, p1); result = NormalIndPower().solve_power(effect, power=0.8, alpha=0.05, ratio=1). The required sample size is the per-group number. Double it for total experiment participants. If the total is more than 2x your monthly acquisition volume, the experiment is too long for a practical setting.`,

  ai_assist: `Use Claude to generate the statsmodels sample size calculation code. It is a standard statistics API and Claude writes it correctly. Run the code and verify the output is in the right order of magnitude (for a baseline of 3% and MDE of 10% relative, the sample size should be in the tens of thousands, not hundreds or millions). Do NOT use Claude to choose the MDE or write the success criteria -- those are business decisions that depend on the Olist context and the marketing budget, which only you understand from reading the data.`,

  stretch: [
    `Compute the expected revenue impact of the experiment if it succeeds. If the follow-up email increases 30-day repeat rate by 10% relative, and each repeat purchase has a mean value of X (compute from the data), the total revenue impact at current acquisition scale is approximately: monthly new customers × 0.10 × baseline_repeat_rate × mean_order_value × 12 months. Paste the calculation. This number justifies the cost of running the experiment.`,
    `Design a multi-armed bandit alternative to the standard A/B test: instead of a fixed 50/50 split, the algorithm gradually shifts traffic toward the better-performing variant as data accumulates. Write a one-paragraph comparison of when a bandit approach is better than a fixed A/B test (answer: when the experiment is long and the cost of showing customers the inferior treatment is high).`,
    `Read "Trustworthy Online Controlled Experiments" by Kohavi, Tang, and Xu (buy or borrow the first three chapters). The book covers every mistake listed in common_mistakes and adds ten more. The chapter on p-hacking and HARKing is directly relevant to the success criteria you defined this week.`,
  ],
});

// ─── W18 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 18, {
  context: `Three weeks of Olist analysis is now ready to become deliverables. The audience this time is a marketing team, and marketing teams consume data differently from HR Directors and retail executives.

Marketing teams are comfortable with conversion rates, funnel charts, and cohort heatmaps. They speak in terms of CAC (customer acquisition cost), LTV (lifetime value), and churn. The specific visual that works best for a marketing audience is the funnel chart -- a visual that shows each stage of the purchase journey with the percentage of customers who move from one stage to the next. The drop at each stage is immediately visible and immediately actionable.

The cohort retention heatmap is the second marketing-specific visual. Rows are acquisition cohorts (month of first purchase), columns are months since acquisition, and the colour of each cell represents the percentage of the original cohort still active. The pattern a marketing team looks for: are recent cohorts retaining better or worse than older ones? If the heatmap shows that 2018 cohorts retain better at month-3 than 2016 cohorts, the marketing investment in customer experience is working. If the pattern goes the other way, something has degraded.

The memo for marketing has a different framing than the HR memo. The HR memo led with cost (attrition costs $X million). The marketing memo leads with opportunity (increasing retention by 1 pp would generate $Y in additional revenue). The business case for a marketing investment is always forward-looking -- what will change if we do this? -- whereas the HR case was backward-looking -- what has this cost us?

By Sunday: a marketing-targeted Excel dashboard with a funnel chart and a cohort retention heatmap, a two-page marketing memo with the opportunity framing, and the five-slide deck.`,

  pre_flight: `Before building the funnel chart, write down the five stages of the Olist funnel as you will define them, with the count of orders at each stage. The stages must be sequential (each stage is a subset of the previous). If any stage count is larger than the previous, the funnel is upside down and your stage definitions are wrong.`,

  mastery_questions: [
    `Build the order status funnel chart. Stages: order placed → order approved → order shipped → order delivered → 5-star review. Count orders at each stage. Compute the conversion rate from each stage to the next. Paste the five-row table: stage, count, conversion from previous stage. Build the funnel chart in Excel using a stacked bar or a declining bar chart. Paste a description of the chart and the two stages with the lowest conversion rates.`,
    `Build the cohort retention heatmap. Rows: acquisition month (first purchase month). Columns: months since acquisition (0, 1, 3, 6). Cell values: percentage of original cohort who made at least one additional purchase by that month. Use conditional formatting: green for >5%, yellow for 2-5%, red for <2%. Paste the heatmap data table. Are later cohorts retaining better or worse at month-3 than earlier cohorts?`,
    `Write the opportunity calculation for the memo. If Olist's current 30-day repeat rate is R%, and a targeted follow-up email campaign increases it to R+2%, and each repeat purchase has a mean value of V (compute from the data), and Olist acquires M customers per month (compute from the data), the annual additional revenue is: 12 months × M customers × 0.02 increase × V per order. Paste the calculation with your specific numbers. This is the ROI case for the recommended email campaign.`,
    `Write the two-page marketing memo. Page 1: the funnel analysis -- where is the biggest drop, what causes it, and what the opportunity framing looks like (the additional revenue from improving the worst conversion stage by 20%). Page 2: the retention analysis -- the cohort pattern, the repeat rate, and the three recommended actions with opportunity calculations. Paste the first three sentences of the memo -- they should state the situation, the key finding, and the opportunity, in that order.`,
    `Build the five-slide deck using the same structure as weeks 8 and 12. Slide 1: the marketing situation and primary recommendation. Slides 2-4: the three supporting findings (funnel conversion, cohort retention, repeat buyer behavior). Slide 5: three recommended actions with opportunity estimates and difficulty ratings. Paste the five headline sentences.`,
  ],

  common_mistakes: [
    `Building a funnel chart where the stages are not logically sequential. "Order placed" and "order delivered" are sequential; "5-star review" is a separate event, not a stage in the same sequence. Make clear in the chart whether the funnel includes reviews or stops at delivery.`,
    `Using absolute counts instead of percentages in the cohort heatmap. A cohort with 500 customers showing 25 repeaters (5%) looks very different from a cohort with 50 customers showing 3 repeaters (6%) when shown as raw counts. Always use percentages in the heatmap.`,
    `Framing the memo as "Olist has low retention" rather than "improving retention by X% would generate $Y." The backward-looking frame is accurate but not actionable. The forward-looking frame with a specific revenue number is what gets budget approved.`,
    `Forgetting to account for email unsubscribe rates in the opportunity calculation. If 20% of customers unsubscribe after receiving the email, the effective reach of the campaign is 80% of the cohort, and the opportunity calculation must use 80% not 100%.`,
    `Using funnel stages that are not mutually exclusive. An order can be both "shipped" and then "delivered" -- these are not mutually exclusive states but sequential ones. The funnel must show each stage as a cumulative subset of the previous.`,
  ],

  debug_help: `Excel funnel charts (available in newer versions as a dedicated chart type) require the data in a single column sorted from largest to smallest. If the funnel chart shows bars of equal width instead of a true funnel shape, check that the data is sorted correctly and that the chart type is set to "Funnel" not "Bar." For older Excel versions, simulate a funnel with a stacked bar where invisible bars create the funnel effect -- Claude can generate the helper column formula for this.`,

  ai_assist: `Use Claude to generate the opportunity calculation template -- the formula that converts an improvement in repeat rate to an annual revenue figure. Verify each assumption in the calculation against the data (customer count, mean order value) rather than accepting Claude's generated numbers. Do NOT use Claude to write the first three sentences of the memo. Those sentences require synthesising the specific Olist findings in a way that would resonate with a marketing director, and that synthesis is the analyst's job.`,

  stretch: [
    `Add a "LTV by acquisition cohort" chart: for each monthly cohort, compute the total revenue generated per customer across their entire order history. Later cohorts may have lower LTV simply because they have been customers for less time -- normalise by the number of months since acquisition to get a fair comparison.`,
    `Compute the payback period for a $5 email campaign: if the email costs $0.50 per send (design + platform + management) and the average repeat order value is V, the payback threshold is V × (repeat rate increase) > $0.50. Does the math work? Paste the calculation. If the payback period is longer than 6 months, the email campaign needs a higher MDE or a lower cost to make business sense.`,
    `Research what conversion rate benchmarks look like for the Brazilian e-commerce market specifically. Statista and McKinsey publish regional e-commerce benchmarks annually. Contextualising Olist's funnel conversion against Brazilian benchmarks converts an internal observation into a competitive assessment.`,
  ],
});

// ─── W19 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 19, {
  context: `Project 3 wraps up the same way Projects 1 and 2 did: demo video, SQL version, retrospective, and a polished public repo. By now the pattern should be familiar enough that you spend less time figuring out what to do and more time doing it well.

The SQL version of the Olist analysis is the most complex SQL you have written so far. The cohort analysis requires window functions: the ROW_NUMBER() or RANK() function to identify each customer's first purchase, and a date difference calculation to assign each subsequent purchase to a cohort-month. The repeat purchase rate requires a self-join or a window function to identify whether a customer_unique_id appears more than once. These are production-grade SQL patterns, used daily by analytics engineers at companies like Airbnb, Spotify, and Shopify.

The project retrospective has a specific question this time: across all three projects, what skill has improved the most? If the answer is "writing memos," note what changed (shorter, more specific, better use of numbers). If the answer is "SQL," note when the click happened. If the answer is "none of them have improved," that is also a valid and useful observation -- it means the learning is happening but not consolidating yet, and the fix is deliberate practice rather than more projects.

The roadmap-level pattern is also worth naming by week 19. You have now shipped three complete analyses with memos, dashboards, and decks. The pattern -- explore, quantify, communicate -- is repeatable. The next person who asks you "can you analyse our customer data?" should hear the same three questions in return: what are the specific questions we are trying to answer, what does the memo need to say, and who is the audience?

By Sunday: demo video committed, queries.sql with the cohort SQL and repeat purchase rate SQL, RETRO.md, and the README updated to its final state.`,

  pre_flight: `Re-read the retrospective documents from weeks 9 and 13. Pick one specific improvement you made in Project 3 that was driven by those retros. Write it down before starting any other work this week. If you cannot name one specific improvement, the retros are not informing your practice -- which is the most important thing to fix before starting Project 4.`,

  mastery_questions: [
    `Write the SQL for identifying each customer's first purchase using a window function: WITH first_purchases AS (SELECT customer_unique_id, order_id, order_purchase_timestamp, ROW_NUMBER() OVER (PARTITION BY customer_unique_id ORDER BY order_purchase_timestamp) as purchase_rank FROM orders JOIN customers USING(customer_id)) SELECT * FROM first_purchases WHERE purchase_rank = 1. Paste the query and the result row count. Does it match the number of unique customers you computed in week 15?`,
    `Write the SQL for the repeat purchase rate: join the first_purchases CTE to all subsequent orders (purchase_rank > 1 or join back on customer_unique_id where there are multiple orders), and compute the percentage of customers in first_purchases who appear in subsequent_orders. Paste the query and the rate. Does it match the Python/pandas rate from week 16? If not, debug the discrepancy.`,
    `Write the SQL for the cohort retention matrix. This requires: (1) a CTE that assigns each customer to an acquisition cohort (year-month of first purchase), (2) a JOIN to all orders for that customer, (3) a DATEDIFF (or strftime difference) between the order date and the cohort start date to assign each order to a cohort-month. Group by cohort and cohort-month to get counts. Paste the query structure (it does not need to be complete, but the join logic must be correct).`,
    `Record the demo video. Two to three minutes. Open the dashboard, show the funnel chart and call out the biggest drop, switch to the cohort heatmap and describe the pattern, briefly show the A/B test spec and explain its purpose. Paste the URL. This project has three components -- the funnel, the cohort, and the experiment design -- and the demo should make clear that all three are connected.`,
    `Write RETRO.md. Include the cross-project improvement question: what improved most across the three projects? Paste the file. Also write the answer to "what is the repeatable three-step process you now have for a business analysis project?" -- define it in your own words. That process is your framework for Project 4 and every client engagement after it.`,
  ],

  common_mistakes: [
    `Writing the ROW_NUMBER() window function with the wrong ORDER BY. Ordering by order_purchase_timestamp ASC gives the earliest order as rank 1 (correct for identifying the first purchase). Ordering DESC gives the most recent order as rank 1, which is wrong for cohort analysis.`,
    `Joining customers to orders without accounting for the fact that customer_id is per-order, not per-person. Always join through customer_unique_id from the customers table to identify the same person across multiple orders.`,
    `Recording a demo video that is too long because you try to explain every pivot table and every query. The video is a proof, not a tutorial. Show the outputs, name the findings, explain the most important insight. The code is in the repo for anyone who wants it.`,
    `Not running queries.sql end-to-end one more time before committing. A query that worked in interactive mode may have a CTE dependency issue when run in sequence. Test the full file before the final commit.`,
    `Writing a retrospective that identifies an improvement that actually happened in week 17 or 18, not across the three projects. The cross-project retro is about patterns over time -- specific habits that changed between Project 1 and Project 3.`,
  ],

  debug_help: `Window function syntax differs between SQLite and BigQuery/PostgreSQL. SQLite supports ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...) from version 3.25 (2018). If you are on an older SQLite version, upgrade or use a subquery approach instead: SELECT *, (SELECT COUNT(*) FROM orders o2 WHERE o2.customer_unique_id = o1.customer_unique_id AND o2.order_purchase_timestamp <= o1.order_purchase_timestamp) as purchase_rank FROM orders o1. The subquery approach is slower but universally compatible.`,

  ai_assist: `Use Claude to write the cohort SQL query -- it is a multi-step CTE pattern that is mechanical but error-prone to write from scratch. Verify the output against the Python cohort matrix for one cohort row. Do NOT use Claude to write the retrospective -- it is honest self-assessment that requires memory of three real projects.`,

  stretch: [
    `Add a "revenue per cohort per month" SQL query to queries.sql: for each acquisition cohort, compute the total revenue generated in months 0, 1, 3, 6, and 12 since acquisition. This is the SQL version of the LTV-by-cohort analysis from the week-18 stretch goal.`,
    `Write a one-paragraph answer to the interview question "describe a time you turned an analysis into a business recommendation." Use the Olist A/B test spec as the example -- specifically, the sample size calculation that revealed the experiment would take 10 months, and how you changed the MDE to make it practical. That specific example is the kind of answer that distinguishes a junior analyst ("I built a dashboard") from a senior one ("I designed an experiment and caught the underpowered sample size before we ran it").`,
    `Calculate the value of the Olist dataset if you were a marketing consultant billing $200/hour. How many hours did the three-week project represent? What is the total billing? Does the analysis justify its cost at that rate, assuming the email campaign recommendation is adopted? This exercise in project valuation is the beginning of knowing how to price analytical work.`,
  ],
});

// ─── W20 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 20, {
  context: `Every BI tool evaluation you will encounter in the first five years of your career will come down to Tableau versus Power BI. They are the two dominant platforms with over 60% combined market share according to Gartner's Magic Quadrant. Companies that chose Tableau in 2015 are mostly still on Tableau. Companies that chose Power BI (especially those already in the Microsoft ecosystem with Azure and Office 365) are mostly on Power BI. You need fluency in both.

Tableau's particular strengths are the drag-and-drop exploration experience and the visual flexibility. A Tableau worksheet can produce a scatter plot, a treemap, a Gantt chart, and a custom geographical map with the same few drag operations, without writing any code. The trade-off is that deeper customisation (specific calculated fields, complex table calculations) requires learning Tableau's expression language, which is different from SQL and from Python.

Tableau Public is the free version that writes to a public cloud gallery. Everything you publish is public. For this week, that is exactly what you want -- you are rebuilding the Superstore analysis from week 1 in Tableau, publishing it at a public URL, and demonstrating that you can produce the same analysis in two different BI tools.

The rebuilding exercise is more instructive than a clean-sheet Tableau project because you already know what the analysis should show. If the Tableau version produces a different number for Sub-Category profit margin, one of the two is wrong and you will find it. If the chart types you chose in Excel do not work as well in Tableau, you will discover which Tableau chart type communicates the same information more clearly.

By Sunday: a Tableau Public workbook with at least four worksheets (Category margin, Year-over-Year growth, Region-Segment profit, Customer segmentation), a published dashboard combining the four sheets with a filter, and the public URL committed to the Superstore repo README.`,

  pre_flight: `Install Tableau Public (free download from tableau.com/products/public). Open it and connect to the Superstore CSV. Spend 15 minutes dragging fields around without any specific goal -- discover where the data fields live, how to change chart types, how to add a filter. This unstructured exploration is faster than reading the documentation and gives you the spatial memory of where things are before the pressure of building a specific chart.`,

  mastery_questions: [
    `Build the Category Profit Margin worksheet. Drag Category to Rows, Sales and Profit to the Columns shelf as measures (Sum). Add a calculated field: Profit Margin = SUM([Profit]) / SUM([Sales]). Drag Profit Margin to Columns and sort by it. Paste the margin values for each category. Confirm they match the week-1 Excel values within 0.1 percentage points. If they differ more, check whether your Excel formula was using total Profit / total Sales (correct) or average of row-level margins (wrong).`,
    `Build the YoY Growth worksheet. Use DATEPART('year', [Order Date]) as a dimension. Add Sales as a measure. Add a Table Calculation for Year-over-Year growth: right-click the Sales pill > Quick Table Calculation > Year over Year Growth. Paste the YoY growth percentages for each year. Confirm they match weeks 1 and 2. If Tableau shows "2015: no previous year," that is expected -- the first year in the data cannot have YoY growth.`,
    `Build the Region-Segment heatmap worksheet. Rows: Region. Columns: Segment. Mark type: Square. Colour: SUM([Profit]) with a diverging colour palette (negative = red, positive = blue). Paste a description of which cells are red. Confirm the worst Region-Segment combination matches week 1. Write one sentence about which visualisation type communicates this finding more clearly -- the heatmap in Tableau or the conditional-formatted table in Excel.`,
    `Combine all four worksheets into a dashboard. Add a Segment filter that applies to all four sheets simultaneously. Publish to Tableau Public. Paste the URL. Open it in an incognito tab and confirm it loads within 5 seconds. If it takes longer, the dataset is too large and you may need to aggregate before publishing.`,
    `Write a one-paragraph comparison of Tableau and Excel for the Superstore analysis: where was Tableau faster, where was Excel faster, and which one would you recommend for a marketing analyst who needs to build similar dashboards monthly. The answer is not "Tableau is always better" -- it depends on the audience, the update frequency, and whether the analyst needs to share the output with people who do not have Tableau licenses.`,
  ],

  common_mistakes: [
    `Using AVERAGE([Profit Margin]) as a calculated field instead of SUM([Profit]) / SUM([Sales]). Tableau averages the row-level margin across orders, which weights each order equally regardless of size. The correct blended margin weights by sales volume.`,
    `Publishing a Tableau Public workbook that contains confidential data. Tableau Public is public -- the entire data source is visible to anyone who downloads the workbook. The Superstore dataset is fictional and safe to publish; your own employer's data is not.`,
    `Building a dashboard with more than six sheets. Six sheets on one dashboard is the visual equivalent of a 20-slide deck -- too much information competing for attention. Pick the four most important worksheets and build the dashboard around them.`,
    `Not setting a null handler for the YoY growth calculation. The first year in the dataset returns null for YoY growth. In Tableau, null values can cause the axis to scale unexpectedly. Use ISNULL([YoY Growth]) to display a placeholder or exclude the null year from the axis.`,
    `Not testing the cross-filter functionality before publishing. A dashboard filter that applies to three sheets but not the fourth (because the fourth uses a different data source connection) produces inconsistent results that are confusing to users. Test every filter on every sheet before publishing.`,
  ],

  debug_help: `Tableau calculated fields that reference aggregations (SUM, AVG) cannot be placed on the Rows or Columns shelf as a dimension -- only as a measure. If Tableau throws "Cannot mix aggregate and non-aggregate arguments," your calculated field is trying to use an aggregated expression in a non-aggregated context. Wrap the expression in an aggregation or move it to a measure shelf. For the YoY table calculation specifically: if the quick table calculation produces all nulls, check that the date dimension has at least two years of data and that it is a continuous date type (right-click the date pill, set to "Exact Date" or "Year").`,

  ai_assist: `Use Claude to explain the difference between Tableau's LOD (Level of Detail) expressions and SQL subqueries. LOD expressions are the Tableau equivalent of a SQL aggregation at a different grain than the view -- they are powerful but confusing at first. Understanding them conceptually before you need them prevents the frustration of trying to solve a problem in Tableau that is straightforward in SQL. Do NOT use Claude to build the Tableau worksheets -- Tableau is a GUI tool and the learning is in the drag-and-drop interaction, not in having a model describe what to click.`,

  stretch: [
    `Add a Parameter to the dashboard: a slider that lets the user set the minimum profit margin threshold for highlighting. Any Sub-Category below the threshold turns red. Parameters in Tableau are the equivalent of input cells in a financial model -- they make the dashboard interactive for scenario analysis.`,
    `Rebuild one of the Tableau worksheets using a Calculated Field that uses FIXED LOD: [Profit Margin by Category] = {FIXED [Category]: SUM([Profit]) / SUM([Sales])}. This computes the category margin for every row, regardless of the current view filter. Understanding FIXED LOD is the single most useful advanced Tableau skill.`,
    `Compare the Tableau dashboard load time to the Excel dashboard load time for the same user task (finding the worst Sub-Category by margin). Measure the time from opening the file to having the answer. For a local Excel file with a user who knows Excel well, Excel usually wins for simple lookups. For a remote shared Tableau dashboard accessible by a non-technical stakeholder, Tableau wins. Document your observation.`,
  ],
});
