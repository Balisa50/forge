/**
 * Rewrites context + mastery_questions for:
 *   - bi-analytics.json    (17 weeks)
 *   - ai-automation.json   (20 weeks)
 *
 * Run: npx tsx scripts/rewrite-other-tracks-4.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

interface WeekUpdate {
  context: string;
  mastery_questions: string[];
}

function applyUpdates(filename: string, updates: Record<number, WeekUpdate>) {
  const file = resolve(process.cwd(), `data/roadmaps/${filename}`);
  const roadmap = JSON.parse(readFileSync(file, "utf-8"));
  let updated = 0;
  for (const week of roadmap.weeks) {
    const u = updates[week.number];
    if (u) {
      week.context = u.context;
      week.mastery_questions = u.mastery_questions;
      updated++;
    }
  }
  writeFileSync(file, JSON.stringify(roadmap, null, 2), "utf-8");
  console.log(`✓ ${filename} updated: ${updated} weeks rewritten`);
}

// ─── BI & ANALYTICS ────────────────────────────────────────────────────────────

const BI: Record<number, WeekUpdate> = {
  1: {
    context: `Before Power BI. Before Tableau. Before dashboards and data warehouses and business intelligence platforms — there was Excel. And there still is. Right now, more business decisions are made looking at an Excel spreadsheet than at any other tool on the planet. The CFO of a Fortune 500 company is in a meeting reviewing a financial model built in Excel. The head of operations at a logistics company is looking at a pivot table. The marketing analyst at a startup is running a VLOOKUP. Excel is not the past — it is the foundation. Every serious BI analyst who skips Excel fundamentals eventually hits a wall: a data source that only exports to CSV, a stakeholder who wants the data in a spreadsheet, a model that is more efficiently built in Excel than in any BI tool. This week you master Excel: pivot tables, VLOOKUP, XLOOKUP, INDEX/MATCH, data validation, conditional formatting. By Friday you will understand why experienced analysts keep Excel open all day.`,
    mastery_questions: [
      `Download a real dataset (try the Superstore dataset from Tableau's sample data). Build a pivot table that shows total sales by region and category. Paste a screenshot. Now add a calculated field for profit margin. What is the formula?`,
      `Write a VLOOKUP that pulls a customer's region from a lookup table by their customer ID. Now rewrite it as an XLOOKUP. Paste both formulas. What does XLOOKUP do that VLOOKUP can't?`,
      `Build a dynamic chart that updates when you change a slicer on your pivot table. Paste a screenshot. Explain what a 'slicer' is and why it's better than a dropdown filter for executives.`,
      `Use conditional formatting to highlight the top 10% of sales values in green and the bottom 10% in red. Paste the rule you wrote. How would a finance analyst use this to spot outliers instantly?`,
      `Pause and think: your pivot table has 500,000 rows. Excel is slow. You switch to Power Query to load and transform the data before pivoting. What is Power Query doing differently from Excel formulas, and why is it faster on large datasets?`,
    ],
  },
  2: {
    context: `A good dashboard is not a collection of charts. It is a conversation. It anticipates the question the viewer will ask, shows the answer, and then points to the next question. The best BI analysts do not just build what was asked for — they build what was needed. Drillthrough functionality lets a viewer click on a region total and drill into the stores that make it up. Tooltips surface additional context without cluttering the main view. These are not decorations — they are the features that make a dashboard actually useful for decision-making rather than just impressive in a meeting. This week your Superstore BI dashboard gets drillthrough pages and rich tooltips. You will test it with someone who has never seen the data and watch where they click.`,
    mastery_questions: [
      `Add a drillthrough page to your Superstore dashboard: clicking on a Region in the main view should navigate to a detail page showing that region's stores, their sales trends, and top products. Paste a screenshot of both pages.`,
      `Build a tooltip page that appears when a user hovers over a bar in your chart — it should show a mini sparkline of that category's monthly trend. Paste the tooltip configuration. Explain why tooltip pages are more powerful than simple tooltip fields.`,
      `What is the difference between a 'page-level filter', a 'report-level filter', and a 'visual-level filter' in Power BI? Give a real scenario where you'd use each.`,
      `Share your dashboard with someone who has never seen the data. Watch them interact with it for 5 minutes without coaching. Write down the first two questions they asked that the dashboard didn't answer. How would you redesign it?`,
      `Pause and think: your manager wants to add 12 more metrics to the dashboard. You know this will make it cluttered and less useful. How do you have that conversation? What principles of dashboard design would you cite?`,
    ],
  },
  3: {
    context: `Data without security is a liability. A financial dashboard that any employee can view — including salary data, deal pipeline, or customer churn rates — is a governance problem. Row-level security (RLS) is the feature that lets you build one report and have each viewer see only their own slice of the data. The regional manager in Lagos sees West Africa data. The VP of Sales sees everything. The external auditor sees only the accounts they are responsible for. You build one report. The data model enforces the filtering. This is how enterprise BI works at scale — not by building separate reports for each audience, but by building one report with intelligent data access controls. This week you implement RLS on your Superstore dashboard and understand why it changes what is possible at an organisational level.`,
    mastery_questions: [
      `Set up row-level security on your Superstore report: create a role called 'East Region Manager' that can only see rows where Region = 'East'. Test it using 'View as role' in Power BI Desktop. Paste a screenshot of the filtered result.`,
      `Add a second role for 'West Region Manager'. Create a mapping table that connects user email addresses to their allowed regions. Paste the DAX filter expression for the dynamic RLS rule.`,
      `What is 'dynamic RLS' vs 'static RLS'? Explain the difference with a real example. When would dynamic RLS be essential?`,
      `What happens to a cross-filter from a visual that a user can't see due to RLS? Does the filter still apply? Test it and explain what you found. Why does this matter for the integrity of your dashboard?`,
      `Pause and think: your company has 5 regions, 20 country managers, and 200 territory managers. Each level sees a different slice of data. Sketch the RLS architecture — how many roles, how many rules, and what table structure you would need.`,
    ],
  },
  4: {
    context: `A dashboard that only works when you are manually refreshing it is a report, not a product. Real BI infrastructure refreshes automatically: every morning before the business opens, the data warehouse has pulled the previous day's data, transformed it, and updated every report in the organisation. Power BI Service with a data gateway is the mechanism that makes this happen: the gateway sits in your corporate network, the Power BI cloud service calls it, and the data flows up on a schedule. This week you publish your Superstore report to Power BI Service, configure a data gateway to connect to a local data source, and set up a daily refresh schedule. After this week, your dashboard is live infrastructure — not a file you open in the morning.`,
    mastery_questions: [
      `Publish your Power BI Desktop report to Power BI Service. Share the URL. Now schedule a daily refresh at 6am. Paste a screenshot of the refresh schedule configuration. What would happen if the refresh failed?`,
      `Install the Power BI On-premises Data Gateway. Connect it to a local SQL Server or Excel file. Set up a Power BI dataset that uses the gateway for refresh. Paste a screenshot of the gateway status in Power BI Service.`,
      `Set up a refresh failure notification email. Trigger it deliberately (disconnect your data source) and paste the notification you received. What is in the error message and how would you diagnose the issue?`,
      `What is incremental refresh and when would you use it? Give a real example: you have a 100-million-row sales table. Full refresh takes 4 hours. How does incremental refresh reduce this to minutes?`,
      `Pause and think: your organisation has 50 Power BI reports all refreshing at 6am. They hammer your database server simultaneously. What is a 'staggered refresh strategy' and how would you implement it without manual scheduling for every report?`,
    ],
  },
  5: {
    context: `Power BI is the dominant BI tool in the enterprise market — 97% of Fortune 500 companies use Microsoft products, and Power BI is tightly integrated with the Office 365 ecosystem. Understanding Power BI at a deep level is a career accelerant for BI analysts. But Power BI's real power is not its charts — it is the data model underneath. This week you go from 'person who can make charts in Power BI' to 'person who understands the semantic model': star schema design, relationships between tables, cardinality, cross-filter direction. These concepts determine whether your DAX measures work correctly or return wrong numbers that nobody catches until an executive meeting. Get the data model right and everything else is easier.`,
    mastery_questions: [
      `Build a star schema in Power BI: a central fact table (Sales) and three dimension tables (Date, Product, Customer). Paste a screenshot of the model view showing the relationships. Explain why a star schema is better for BI than a normalised relational schema.`,
      `Set the cross-filter direction on one relationship to 'Both'. Explain what this does and give a specific example of when it is useful — and when it causes incorrect results.`,
      `What is 'cardinality' in a Power BI relationship? Give an example of a many-to-many relationship in real business data and explain why it is harder to model correctly than a one-to-many.`,
      `Create a Date table in Power BI using CALENDARAUTO() or a custom M query. Explain why a dedicated Date table is necessary for time intelligence DAX functions to work correctly.`,
      `Pause and think: your Power BI model has a relationship between Sales and Product, and another between Sales and Customer. A visual uses both Product and Customer on the same axis. Power BI shows a warning about 'ambiguous paths'. What is this and how do you fix it?`,
    ],
  },
  6: {
    context: `DAX (Data Analysis Expressions) is the language of Power BI. It looks like Excel formulas but behaves completely differently. The most powerful DAX patterns — time intelligence, running totals, period-over-period comparisons, ranked lists — are what separate a basic Power BI user from a senior BI analyst who commands a high salary. The key insight that unlocks DAX is understanding filter context: every DAX expression evaluates within a context defined by what is on the visual, what filters are applied, and what relationships exist in the model. This week you write the measures that make a dashboard actually useful for a business: Month-over-Month growth, Year-to-Date sales, Rolling 12-month average, and top N product rankings. These are the measures that appear in every serious BI interview.`,
    mastery_questions: [
      `Write a DAX measure for Month-over-Month sales growth: this month vs last month, shown as a percentage. Paste the measure. Explain why DATEADD and CALCULATE work together here — what is CALCULATE doing to the filter context?`,
      `Write a Year-to-Date sales measure using DATESYTD. Paste it. Now explain: if a user filters the report to show only 'Q3 2025', does your YTD measure still show the full year? How do you fix it if it doesn't?`,
      `Write a Rolling 12-Month average sales measure. Paste it. Explain what DATESINPERIOD does differently from DATEADD.`,
      `Write a measure that ranks products by total sales within each category, resetting the rank for each new category. Paste it. Explain what RANKX does and what the 'dense' parameter means.`,
      `Pause and think: you have a measure that gives the wrong answer when a slicer is applied. The number is correct without any filter but wrong with the region filter. Walk through how you would debug this using the DAX Studio 'Server Timings' and 'Query Plan' tools.`,
    ],
  },
  7: {
    context: `SQL is the language every data professional must speak. It is older than the internet, and it will outlive every BI tool that exists today. SQL is not primarily a programming skill — it is a thinking skill. Breaking a business question into a JOIN, understanding what a window function does, knowing when to use a subquery vs a CTE — these are analytical reasoning skills expressed in code. For a BI analyst, SQL is how you interact with the data warehouse, validate your Power BI model, debug discrepancies, and build the views and stored procedures that feed your reports. This week you write SQL that answers real business questions from the Superstore dataset — not SELECT * queries, but multi-table joins, aggregations, CTEs, and window functions that demonstrate you think analytically.`,
    mastery_questions: [
      `Write a SQL query that returns the top 5 customers by total revenue in each region, using a window function (ROW_NUMBER or RANK). Paste the query. Explain what the PARTITION BY clause does.`,
      `Write a SQL query using a CTE that calculates month-over-month revenue growth for the last 12 months. Paste the query. Explain why a CTE is more readable than a nested subquery for this problem.`,
      `Write a SQL query that finds customers who placed orders in both 2024 and 2025. Paste the query. Explain the difference between INTERSECT and an inner join for this problem.`,
      `Write a SQL query that calculates the 7-day rolling average of daily orders. Paste the query using a window frame (ROWS BETWEEN 6 PRECEDING AND CURRENT ROW). Explain what this frame means.`,
      `Pause and think: your Power BI report shows total sales of $12.4M for Q3 2025. Your SQL query of the same data source returns $12.1M. List the three most likely causes of this discrepancy and how you would diagnose each one.`,
    ],
  },
  8: {
    context: `The data you receive is almost never the data you need. Production databases are normalised for write performance, not read performance. The sales table has order IDs but no product names. The customer table has IDs but no regions. Everything needs to be joined, cleaned, aggregated, and shaped before a BI tool can use it efficiently. Data modelling is the discipline of designing that transformation: what does the final table structure look like, what relationships exist between tables, and how do you optimise it for the types of queries your dashboards will run? Star schema vs snowflake schema. Fact tables vs dimension tables. Slowly changing dimensions. Surrogate keys. These are the concepts that data warehouse engineers and senior BI analysts live in every day. This week you design a data warehouse schema from scratch.`,
    mastery_questions: [
      `Design a star schema for a retail sales data warehouse. Draw it (ASCII or a photo of a whiteboard). Your fact table should have at least 5 metrics. Your dimension tables should include Date, Product, Customer, and Store. Explain every foreign key relationship.`,
      `What is a 'slowly changing dimension' (SCD)? Give a real example: a customer moves from New York to London. How does SCD Type 1, Type 2, and Type 3 handle this change differently? Which would you use for a sales attribution analysis?`,
      `Build your star schema in a real database (PostgreSQL or SQLite). Write the CREATE TABLE statements. Paste them. Insert 100 rows of sample data into each table. Write a query that joins all tables to get total sales by product category by month.`,
      `What is the difference between a data warehouse and a data lake? Give a real example of data that belongs in a lake but not a warehouse, and data that belongs in a warehouse but not a lake.`,
      `Pause and think: your company has 5 years of transaction data — 500 million rows. Every dashboard query takes 45 seconds. List three optimisations you would apply at the data warehouse layer (not the BI tool layer) to make queries run in under 2 seconds.`,
    ],
  },
  9: {
    context: `Numbers don't speak for themselves. A 12% increase in sales means nothing without knowing: compared to what? Is that seasonal? Is it statistically significant or just noise? Business statistics is the toolkit that lets you answer those questions with confidence rather than intuition. Mean, median, standard deviation, percentiles, correlation — these are the building blocks. But the real skill is knowing which one to use and when. The mean salary in a company tells you almost nothing useful if the CEO makes 100x the median employee. The correlation between ice cream sales and drowning deaths is real and meaningless. This week you learn to describe data precisely, spot misleading statistics, and build the foundational intuition that makes you a better analyst.`,
    mastery_questions: [
      `Calculate the mean, median, and standard deviation of sales by salesperson in your dataset. Paste the results. Now explain a scenario where the median is a better summary than the mean. Give a business example from your data.`,
      `Build a box plot of product profit margins by category. Paste the chart. Identify one outlier. Explain what a box plot's whiskers represent and what 'IQR' stands for.`,
      `Calculate the correlation between advertising spend and revenue in your dataset (or a publicly available one). Paste the correlation coefficient. Interpret it: is this correlation strong, weak, or nonexistent? Does correlation imply causation here?`,
      `What is a percentile? Calculate the 90th percentile of order values in your dataset. Explain why a customer success team would care about the 90th percentile of resolution time more than the average.`,
      `Pause and think: your dashboard shows average order value increased by 8% this quarter. Your manager is happy. But when you look at the distribution, you find the increase is entirely driven by 3 unusually large orders. Is the 8% increase meaningful? How would you communicate this honestly?`,
    ],
  },
  10: {
    context: `'We changed the homepage design last week. Did it work?' This is the question that data analysts answer every day. The answer is not 'sales went up' — because sales might have gone up for a dozen other reasons. The answer is 'we ran an A/B test with 10,000 users, the treatment group converted at 4.2% vs the control group's 3.8%, and a chi-squared test confirms this difference is statistically significant with p < 0.05'. A/B testing and hypothesis testing are the tools that separate evidence-based decisions from expensive gut feelings. Airbnb, Netflix, Booking.com, and every major consumer internet company runs hundreds of A/B tests simultaneously. This week you design, analyse, and interpret a real experiment.`,
    mastery_questions: [
      `Design an A/B test for a pricing change on an e-commerce site. Write: the hypothesis, the metric (primary and guardrail), the minimum detectable effect, the required sample size, and the duration. Paste the design document.`,
      `Analyse this simulated A/B test result: Control: 5,000 visitors, 200 conversions. Treatment: 5,000 visitors, 240 conversions. Run a chi-squared test (use Python, R, or an online calculator). Paste the p-value and confidence interval. Is the result significant at alpha=0.05?`,
      `What is statistical power and why does it matter when designing an experiment? If your test has 50% power, what does that mean in plain English?`,
      `What is the 'novelty effect' in A/B testing? Give a real example of how it could make a change look better than it actually is, and how you would detect it.`,
      `Pause and think: your A/B test ran for 3 days and the treatment is winning by 15%. Your manager wants to call it and ship the change. What would you tell them? Explain 'peeking' and why stopping an experiment early inflates false positive rates.`,
    ],
  },
  11: {
    context: `A dashboard full of metrics is not a strategy. A strategy has one north star metric — the number that, if it goes up and to the right, everything else follows. Uber's north star is 'rides per day'. Airbnb's is 'nights booked'. Netflix's is 'hours of content streamed'. Every other metric is either a driver of the north star (leads to more rides, more bookings, more streaming) or a guardrail (prevents you from gaming the north star by destroying the business). Designing metrics frameworks — knowing what to measure, how to measure it, and how to tell the story that drives action — is the highest-value skill a BI analyst brings to an organisation. This week you learn to design a metrics tree and tell a data story that changes decisions.`,
    mastery_questions: [
      `Choose a real business (your company, a startup you admire, or a hypothetical e-commerce site). Design a north star metric and a metrics tree with 3 levels: north star -> input metrics -> leading indicators. Paste the tree. Justify every choice.`,
      `What is the difference between a 'vanity metric' and an 'actionable metric'? Give two examples of each from a social media platform's analytics. Explain why page views is a vanity metric and what you would use instead.`,
      `Build a one-page executive dashboard using your metrics tree. It should show: current value, trend over 90 days, and comparison to target. Paste a screenshot. What is the one insight a CEO would take from this dashboard in under 30 seconds?`,
      `Write a 200-word data story for your executive dashboard. Follow the 'situation-complication-resolution' structure: what is happening, why it is a problem, and what the data suggests doing. Paste the narrative.`,
      `Pause and think: your dashboard shows customer satisfaction score (CSAT) dropped from 4.2 to 3.9 last month. You have CSAT broken down by product line, support channel, and region. Walk through your analytical approach: what would you look at first, what hypothesis would you form, and what additional data would you need to confirm root cause?`,
    ],
  },
  12: {
    context: `Python has entered the BI stack. Not to replace Power BI or SQL — but to do the things they cannot: statistical modelling, machine learning, web scraping, API integrations, custom visualisations, and automation at scale. The best BI analysts today write Python. They use pandas to clean messy data, matplotlib and seaborn for exploratory analysis, scikit-learn for basic predictive models, and Plotly for interactive dashboards that BI tools cannot produce. This is the skill that moves a BI analyst salary from the 60th percentile to the 90th. This week you analyse the Superstore dataset with Python for the first time — and discover things in the data that Power BI never showed you.`,
    mastery_questions: [
      `Load the Superstore dataset into a pandas DataFrame. Run df.describe() and paste the output. Identify the metric with the highest coefficient of variation (std/mean). What does high coefficient of variation tell you about that metric's distribution?`,
      `Find the top 10 products by profit margin using pandas groupby. Paste the code and output. Now find the product with the highest sales but negative profit. Why would a company sell a product at a loss?`,
      `Build a seaborn heatmap showing correlation between all numeric columns in the dataset. Paste the chart. Find the strongest correlation. Does it make business sense? What drives it?`,
      `Write a Python script that reads from a real API (try the Open Meteo weather API) and combines it with your sales data to test if weather affects sales. Paste the data merge and a chart showing any relationship you find.`,
      `Pause and think: your manager asks you to 'predict next month's sales'. You have 3 years of monthly data. Walk through the analytical approach you would take — what model would you try first, what features would you include, and how would you validate the prediction?`,
    ],
  },
  13: {
    context: `Looker Studio (formerly Google Data Studio) is free, web-based, and connected natively to every Google product — Google Analytics, Google Ads, Google Sheets, BigQuery. For any organisation running on Google Workspace, Looker Studio is the fastest path to a live dashboard. BigQuery is Google's serverless data warehouse: it can query a petabyte of data in seconds and costs nothing for the first terabyte per month. Together, they form the cloud BI stack that startups and scale-ups use when they cannot afford a full data warehouse team. This week you build a Looker Studio dashboard backed by BigQuery — real cloud data, real cloud BI, zero infrastructure to manage.`,
    mastery_questions: [
      `Create a Looker Studio report connected to a BigQuery public dataset (try bigquery-public-data.chicago_taxi_trips or bigquery-public-data.usa_names). Build three charts: a trend line, a geographic map, and a table with conditional formatting. Paste a screenshot.`,
      `Write a BigQuery SQL query that aggregates your chosen dataset and costs less than 1GB of data scanned. Paste the query and the bytes billed (shown in the BigQuery console). What does BigQuery mean by 'bytes billed' and how is it relevant to cost?`,
      `Add a calculated field in Looker Studio that computes a ratio or percentage from two existing metrics. Paste the formula. Explain the difference between a Looker Studio calculated field and a BigQuery calculated column — when would you use each?`,
      `Set up a scheduled email delivery of your Looker Studio report to an email address. Paste a screenshot of the scheduled email configuration. Explain why automated report delivery is a BI governance feature.`,
      `Pause and think: your organisation has data in Google Sheets, Salesforce, and a PostgreSQL database. You want to build one Looker Studio dashboard that combines all three sources. What are the options for blending these data sources and what are the limitations of each approach?`,
    ],
  },
  14: {
    context: `AI has entered the analytics workflow. Copilot in Power BI can write DAX measures from a plain English description. ChatGPT can explain a complex SQL query, suggest optimisations, and generate Python code for data cleaning. Fabric's AI capabilities can summarise a dataset in natural language. This is not a replacement for BI analysts — it is an amplifier. The analysts who learn to use AI in their workflow produce 3x the output of those who do not. But AI-assisted analysis also introduces new failure modes: hallucinated DAX that looks correct but returns wrong numbers, SQL that runs without error but answers the wrong question. This week you integrate AI into your BI workflow and — more importantly — learn how to verify its output.`,
    mastery_questions: [
      `Use Power BI's Copilot (or ChatGPT) to generate a DAX measure for 'percentage of customers who purchased in both Q1 and Q2 2025'. Paste the generated measure. Test it against data you know the answer to. Is it correct? If not, what is wrong with it?`,
      `Give ChatGPT a complex SQL problem (e.g., 'find customers who have increased their order frequency month-over-month for 3 consecutive months'). Paste the generated SQL. Run it on your data. Is the result correct? What would you change?`,
      `Use an AI tool to analyse a dataset you have not explored before (try a Kaggle public dataset). Ask it to identify the top 3 insights. Paste the AI's response and your own assessment: did it find real insights or statistical noise?`,
      `What is 'prompt engineering for data analysis'? Write three progressively better prompts for asking an AI to clean a messy CSV file with inconsistent date formats. Explain what makes the third prompt better than the first.`,
      `Pause and think: your company's CISO says AI tools cannot process customer data due to privacy concerns. You are used to pasting data into ChatGPT to get help cleaning it. What are three alternative approaches that let you use AI assistance without sharing sensitive data?`,
    ],
  },
  15: {
    context: `You have built dashboards. You have written SQL. You have done A/B analysis and built metrics frameworks. Now you need to demonstrate this to someone who is deciding whether to hire you. The BI portfolio is not a list of tools you know — it is evidence of problems you solved. The best BI portfolios show: a dataset the analyst found or cleaned themselves, a business question they framed, an analysis they conducted, a visualisation they built, and an insight they derived. This week you build that portfolio, prepare for the technical interview, and understand how BI analyst hiring actually works at different types of organisations — startup vs enterprise vs consulting.`,
    mastery_questions: [
      `Build one portfolio project end-to-end: find a public dataset, frame a business question, clean the data, analyse it, build a dashboard, and write a one-paragraph insight. Paste the dashboard URL and the insight. This is the project you reference in every interview.`,
      `Prepare for the most common BI interview question: 'Walk me through how you would analyse a 20% drop in conversion rate.' Write your answer using the 'decomposition tree' approach: break down conversion rate into its components and explain how you would isolate the driver. Paste your answer.`,
      `What is the difference between a BI analyst role at a startup, an enterprise, and a consulting firm? For each, describe the typical data stack, the pace of work, and the skills that matter most.`,
      `Write a cold outreach message to a BI analyst at a company you want to work at, asking for a 20-minute informational interview. Paste the message. What is one insight from their public work (LinkedIn post, conference talk, GitHub) that you reference to make the outreach specific?`,
      `Paste your GitHub or portfolio URL with your BI project. What is the one thing you would change about it if you had one more day? Change it now and paste the updated link.`,
    ],
  },
  16: {
    context: `Every great project starts with a question. The capstone question for this programme is: what does the data say, and what should the business do about it? This week you begin your capstone project — a complete BI analysis of a real dataset that matters to you. You will choose the dataset, define the business context, design the data model, build the dashboard in Power BI, write the SQL, and draft the executive narrative. This is not a tutorial to follow. There is no answer key. There is a business problem, a dataset, and your skills. What you build this week will be the centrepiece of your portfolio. Choose something you actually care about — the analysis will show it.`,
    mastery_questions: [
      `State your capstone question in one sentence. Paste the dataset you chose and explain why it is the right dataset to answer your question. Where did you find it? How many rows and columns? What is the grain of the data (what does each row represent)?`,
      `Design your data model: what are the fact tables, what are the dimensions, what are the key measures? Paste a diagram or description. Explain one design decision that was not obvious and how you resolved it.`,
      `Write the SQL (or Power Query M) to transform your raw data into the model you designed. Paste the key transformation. What was the messiest data quality problem you encountered and how did you fix it?`,
      `Build the first version of your dashboard. Paste a screenshot. What is the one chart that tells the most important story? Explain what a business decision-maker would do differently based on what they see.`,
      `Pause and think: show your Week 1 draft dashboard to someone who has not seen your data. Ask them to tell you the most important insight they see in 30 seconds. Write down what they said. Does it match what you intended? If not, what does that tell you about your dashboard design?`,
    ],
  },
  17: {
    context: `A BI project is not finished when the dashboard is built. It is finished when someone uses it to make a better decision. This week you complete your capstone: you refine the dashboard based on feedback, write the executive narrative, document your methodology, present it as if you were in a real business review, and publish it to your portfolio. The presentation is as important as the analysis — a brilliant insight that is not communicated clearly is worth nothing. A clear narrative about a modest insight changes a decision. You will record a 5-minute walkthrough of your dashboard and publish it alongside your portfolio. This is the moment your BI skills become real evidence.`,
    mastery_questions: [
      `Present your capstone dashboard to at least one person as if it were a real business review. Write down every question they asked that you could not answer. What additional analysis would you do to answer the hardest question?`,
      `Write a 400-word executive summary of your capstone analysis: what question you investigated, what you found, and what you recommend. No charts — only narrative. Paste the summary.`,
      `Record a 5-minute screen recording walking through your dashboard and explaining your key insights. Upload it to YouTube or Loom and paste the link. Watch it back. What is the one thing you would redo?`,
      `Publish your capstone project to GitHub or a portfolio site: include the dashboard link, the executive summary, the data source, and the key SQL queries. Paste the link. You just shipped a real BI portfolio piece.`,
      `Write a 300-word reflection: what was the hardest part of this capstone that no tutorial prepared you for? What would you do differently in your next analysis? What question does your data leave unanswered — and why does that unanswered question matter?`,
    ],
  },
};

// ─── AI AUTOMATION ─────────────────────────────────────────────────────────────

const AI_AUTO: Record<number, WeekUpdate> = {
  1: {
    context: `In 1913, Henry Ford didn't invent the car. He invented the assembly line — and it changed everything. Today's equivalent is happening right now: AI automation is the assembly line of knowledge work. The tasks that used to take a team of people — researching competitors, drafting proposals, processing invoices, classifying support tickets, generating reports — can now be automated, partially or fully, using AI. The engineers who understand how to build these automations are the most in-demand workers in the global economy right now. This week you understand what AI automation actually is — not the hype version, not the 'AI will replace everyone' version, but the real version: AI as a component in a workflow, handling the parts of a process that involve understanding language, making judgements, and generating content. By Friday you will have mapped three real automation opportunities in a business you know.`,
    mastery_questions: [
      `Find a business process in your life or someone you know — invoicing, customer support, research, writing — that involves repetitive cognitive work. Map it: what are the steps, who does each step, how long does it take? Paste the process map.`,
      `Identify which steps in your process map could be automated with AI (understand text, make a judgement, generate content) and which require a human (empathy, accountability, physical action). Paste your breakdown.`,
      `What is the difference between 'task automation' (replacing a specific task) and 'process automation' (replacing an end-to-end workflow)? Give a real example of each using a customer support scenario.`,
      `Name three AI automation tools you have heard of (n8n, Zapier, Make, LangChain, etc.). For each, write one sentence explaining what problem it solves and who it is primarily for.`,
      `Pause and think: a business owner says 'I want to automate my entire customer service department with AI.' Write a one-paragraph honest assessment of what is actually achievable in 6 months, what the risks are, and what should still be done by humans.`,
    ],
  },
  2: {
    context: `Most of the world's business automation is built without a single line of code. Zapier connects Gmail to Slack. Make watches a form submission and creates a Notion page. n8n reads an RSS feed, summarises it with AI, and sends it to a Discord channel. No-code automation tools are the fastest path from 'I have a repetitive task' to 'it runs itself'. n8n is the most powerful open-source option: it can be self-hosted, has 400+ integrations, and handles complex logic that Zapier cannot. This week you build your first real automation in n8n: a workflow that triggers when a new form is submitted, processes it with basic logic, and sends a notification. By Friday you will have automated something that was previously manual. The first automation is always the hardest and the most satisfying.`,
    mastery_questions: [
      `Build an n8n workflow that: watches a Google Form (or Typeform) for new submissions, extracts the submitter's name and email, and sends them a personalised thank-you email. Paste a screenshot of your workflow canvas showing all nodes.`,
      `Add conditional logic to your workflow: if the submitter selected 'urgent' in the form, send a Slack notification to your team. If not, just log it to a Google Sheet. Paste the IF node configuration.`,
      `What is the difference between a 'trigger' node and an 'action' node in n8n? Give three examples of each from the n8n node library.`,
      `Add error handling to your workflow: if the email send fails, retry once after 5 minutes, and if it fails again, send a Slack alert to an admin. Paste your error handling configuration.`,
      `Pause and think: your n8n workflow runs 500 times per day. You are using n8n Cloud, which charges per execution. At what volume does self-hosting n8n on a $10/month VPS become cheaper than n8n Cloud? Do the maths and paste your calculation.`,
    ],
  },
  3: {
    context: `No-code tools are powerful until they hit their limits. The form submission automation was easy. The automation that reads a PDF invoice, extracts line items, validates them against your accounting system, and flags discrepancies — that requires code. Python is the language of automation. It is the language of every AI library (OpenAI, Anthropic, LangChain, Hugging Face all have Python SDKs). It is the language of every data tool (pandas, requests, BeautifulSoup). It is the language of every scripting task that no-code tools cannot handle. This week you write Python automation for the first time: a script that reads a CSV, processes it, and outputs a report. You are not learning Python to become a software engineer. You are learning enough Python to automate the things that matter.`,
    mastery_questions: [
      `Write a Python script that reads a CSV of sales data, calculates total revenue by product category, and writes a summary to a new CSV. Paste the script. Explain each line.`,
      `Add a function that sends the summary as an email attachment using the smtplib library. Paste the email function. What is the difference between SMTP and an email API (like Resend or SendGrid)?`,
      `Schedule your script to run at 8am every day using the schedule library or a system cron job. Paste the scheduling code. What happens if the script crashes? How would you add error logging?`,
      `What is a virtual environment in Python and why do you need one? Create a venv, install requests and pandas, and paste the commands you ran.`,
      `Pause and think: your Python script takes 3 minutes to process a 10,000-row CSV. A colleague says 'just use pandas vectorisation'. What does that mean? Rewrite your slowest loop using a pandas apply() or vectorised operation and measure the speed difference.`,
    ],
  },
  4: {
    context: `Every AI application starts with one thing: an API call. You send text in, you get text back. That simplicity is deceptive — the interesting work is everything around the call: what you send, how you handle the response, what you do when it fails, how you structure the system. The OpenAI API (and compatible APIs from Anthropic, Google, Mistral) are the building blocks of every AI product built in the last two years. GPT powers Notion AI. Claude powers Amazon Q. Gemini powers Google Workspace AI. This week you make your first API call in Python, build a simple chatbot in the terminal, and understand the message structure (system, user, assistant) that governs every conversational AI application.`,
    mastery_questions: [
      `Make your first OpenAI (or Anthropic) API call in Python. Send a message and print the response. Paste your code and the response. What is the 'model' parameter and what happens when you change it?`,
      `Build a simple chatbot loop: keep a list of messages and append each user message and assistant response. Ask a multi-turn question where the second question requires context from the first. Paste the code and a sample conversation. Explain why maintaining message history matters.`,
      `What are 'tokens' in the context of LLMs? Count the tokens in a message using the tiktoken library (for OpenAI). Paste the count. Why does token count affect both cost and the model's ability to answer?`,
      `Add a system prompt to your chatbot that gives it a persona (e.g., 'You are a professional Gambian business consultant'). Paste the system prompt and show how it changes the model's responses.`,
      `Pause and think: you are building a chatbot for a client's customer service team. They want it to 'know everything about our company'. The company has 10,000 pages of documentation. The model's context window is 128,000 tokens. Can you put all the documentation in the system prompt? What problem does this create and how would you solve it?`,
    ],
  },
  5: {
    context: `The difference between an AI that gives generic, mediocre answers and one that gives precise, useful answers is almost entirely in the prompt. Prompt engineering is not a trick or a hack — it is the skill of communicating precisely with a language model. It is analogous to writing a precise specification for a human employee: vague instructions get vague work, specific instructions with examples get specific work. The techniques — zero-shot, few-shot, chain of thought, role prompting, output format constraints — all exist because they reliably improve output quality across different tasks and models. This week you learn each technique and apply it to a real automation: a system that classifies customer support tickets with high accuracy.`,
    mastery_questions: [
      `Write a zero-shot prompt that classifies a customer support message into one of five categories (billing, technical, shipping, returns, other). Test it on 10 real messages. Paste the prompt and the accuracy rate.`,
      `Add 3 examples to your prompt (few-shot). Paste the new prompt. Test it on the same 10 messages. Did accuracy improve? By how much? Explain why few-shot examples help.`,
      `Add chain-of-thought reasoning: instruct the model to think step by step before classifying. Paste the prompt. Find one case where chain-of-thought changed the classification from wrong to right.`,
      `Add output format constraints: require the model to return only a JSON object with 'category' and 'confidence' fields. Paste the prompt and a sample response. Write the Python code that parses this JSON.`,
      `Pause and think: your classification prompt works well on English tickets. You now receive tickets in French, Mandinka, and Portuguese. Does your prompt handle them correctly? Test it. What changes would you make to handle multilingual input reliably?`,
    ],
  },
  6: {
    context: `An AI that responds to a user's message is a chatbot. An AI that decides what to do next — calls a tool, reads a file, searches the web, runs a function — is an agent. The shift from chatbot to agent is the shift from reactive to proactive: the agent takes the user's goal and figures out the steps needed to achieve it, rather than just responding to what was said. Agents are what power GitHub Copilot (which decides whether to complete code, explain a function, or run tests), Devin (which writes code, runs it, reads the error, and fixes it), and Claude's computer use capability. This week you understand the ReAct (Reasoning + Acting) agent loop and build your first agent that uses tools.`,
    mastery_questions: [
      `Build a simple agent that has access to two tools: a calculator (function) and a web search (via an API like Serper or DuckDuckGo). Give it a task that requires both tools: 'How many days until Christmas 2026 multiplied by the current Bitcoin price?' Paste the agent's reasoning chain and final answer.`,
      `What is the 'ReAct' pattern? Explain the Thought -> Action -> Observation loop with a concrete example from your agent run above.`,
      `What is 'tool calling' (function calling) in the OpenAI/Anthropic API? Write the Python code that defines a tool, passes it to the API, and executes the returned function call. Paste the code.`,
      `Add a 'memory' tool to your agent that lets it write notes to itself and read them later. Explain why an agent without memory cannot complete multi-session tasks.`,
      `Pause and think: your agent makes 15 API calls to complete a task. At $0.01 per 1000 tokens, estimate the cost of running this agent 10,000 times per day. Is this economically viable? What optimisations would you make to reduce cost by 80%?`,
    ],
  },
  7: {
    context: `The internet is the world's largest database. Right now there are prices, job listings, competitor products, academic papers, legal filings, and news articles on public web pages that no API provides access to. Web scraping is the practice of automatically extracting this data. AI makes web scraping dramatically more powerful: instead of writing brittle CSS selectors that break when the website redesigns, you can ask an LLM to extract the relevant information from raw HTML in plain English. This week you build a web scraper that extracts structured data from a real website and uses AI to clean and structure the output. This combination — scraping + AI extraction — is what powers competitive intelligence tools, price monitoring, and research automation.`,
    mastery_questions: [
      `Scrape a real job listings page (try remoteok.com or LinkedIn public pages) using requests and BeautifulSoup. Extract job title, company, and location. Paste your scraping code and the first 5 results.`,
      `Pass the raw HTML of a job listing to an LLM and ask it to extract structured data (title, salary range, required skills, location, remote/hybrid/onsite). Paste the prompt and the structured output. Compare this to writing a CSS selector — what are the trade-offs?`,
      `Handle pagination: modify your scraper to collect listings from 3 pages automatically. Paste the code. Add a 2-second delay between requests. Explain why rate limiting matters for being a respectful scraper.`,
      `Check the website's robots.txt. Paste the relevant rules. Does the site allow scraping? What is the ethical and legal position on scraping publicly visible data?`,
      `Pause and think: you are building a price monitoring tool for 500 e-commerce products. Each product page needs to be scraped daily. Some pages use JavaScript to render prices. What tools would you use for JavaScript-rendered pages that BeautifulSoup cannot handle?`,
    ],
  },
  8: {
    context: `Every organisation is drowning in documents. Contracts, invoices, reports, research papers, policy documents, meeting transcripts — unstructured text that contains valuable information but cannot be searched, compared, or analysed at scale. AI document processing changes this: you can extract specific fields from a contract, summarise a 100-page report in 3 bullet points, compare two versions of an agreement for material differences, or classify thousands of invoices by category in minutes. This week you build a document processing pipeline: upload a PDF, extract structured data, and route it based on what you find. This is the most common AI automation use case in enterprise today — the 'document intelligence' workflow.`,
    mastery_questions: [
      `Build a pipeline that takes a PDF invoice (find a sample online), extracts the vendor name, invoice number, date, line items, and total using an LLM. Paste the Python code and the extracted JSON output.`,
      `Test your extractor on 5 different invoice formats. Paste the accuracy rate. What fields were consistently extracted correctly? Which failed? What would you change in your prompt to improve the weakest field?`,
      `Add a validation step: if the line items sum does not equal the stated total, flag the invoice for human review. Paste the validation logic. This is the 'human in the loop' pattern.`,
      `What is the difference between extracting data from a PDF with a text layer (selectable text) vs a scanned image? What additional step do you need for scanned documents?`,
      `Pause and think: your document processor handles 10,000 invoices per month. Each invoice is 2-3 pages. Estimate the monthly OpenAI API cost at current pricing. Is there a way to reduce cost by 70% while maintaining accuracy? (Hint: consider smaller models or caching.)`,
    ],
  },
  9: {
    context: `Email is the most unautomated part of most businesses. Executives spend hours per day on email that could be handled with a decision tree and a well-written template. But email automation has a trust problem: one wrong auto-reply at the wrong moment causes more damage than the time saved. This week you build an intelligent email automation system that reads incoming emails, classifies them by intent, drafts a response, and routes them — either to auto-send (for high-confidence, low-stakes replies) or to human review (for sensitive, complex, or uncertain cases). You will also integrate with Slack or Teams for team notifications. This is a production-grade communication automation that real businesses pay significant money for.`,
    mastery_questions: [
      `Build a Gmail inbox monitor using the Gmail API (or IMAP) that reads new emails every 5 minutes. Paste the Python code that authenticates and reads the 10 most recent unread messages.`,
      `For each email, use an LLM to classify it: 'sales inquiry', 'support request', 'spam', 'internal', 'press/media', 'partnership'. Paste your classification prompt and test it on 5 real (anonymised) emails. What accuracy did you get?`,
      `For 'support request' emails, draft an automated response using the LLM. Add a rule: only auto-send if confidence > 90% AND the email does not contain words like 'urgent', 'legal', 'complaint'. Paste the decision logic.`,
      `Send a Slack notification for every email that goes to human review, with: sender, subject, AI classification, and a suggested response draft. Paste the Slack message format.`,
      `Pause and think: your email automation accidentally sends an unhelpful auto-reply to a potential $50,000 client. They don't respond again. Describe the safeguards you would add to prevent this, and explain the trade-off between automation confidence threshold and the volume of emails that require human review.`,
    ],
  },
  10: {
    context: `Spreadsheets and databases are where most business data lives. Manually updating a spreadsheet from another system, reconciling two databases, or generating a weekly report by copy-pasting from multiple sources — these are the most common automation requests from business users. This week you build two database/spreadsheet automations: one that syncs data between a Google Sheet and a PostgreSQL database bidirectionally, and one that generates a formatted weekly report from database queries and emails it as a PDF. These sound boring. They are the automations that businesses pay the most for, because they are the ones that currently consume the most human time.`,
    mastery_questions: [
      `Build a Python script that reads new rows from a Google Sheet (using the Sheets API) and inserts them into a PostgreSQL table. Paste the code. Handle the case where a row already exists (upsert logic).`,
      `Build the reverse: when a new row is inserted into your PostgreSQL table (use a trigger or polling), update the corresponding row in the Google Sheet. Paste the code. What is the risk of bidirectional sync and how do you prevent infinite loops?`,
      `Build a weekly report generator: query your database, format the results into a table, generate a PDF using ReportLab or WeasyPrint, and email it as an attachment every Monday at 8am. Paste the key parts of the code.`,
      `Add an AI summary section to your report: pass the data to an LLM and ask it to write a 3-sentence executive summary of what the numbers mean. Paste the prompt and a sample summary.`,
      `Pause and think: your Google Sheet has 50 editors. Any of them can change data at any time. Your sync runs every 10 minutes. What conflict resolution strategy would you implement when the same cell is changed in both the Sheet and the database between sync cycles?`,
    ],
  },
  11: {
    context: `LangChain is the framework that turned 'I can make an API call' into 'I can build a production AI application'. It provides the abstractions that every AI engineer needs: chain multiple prompts together, add memory that persists across conversations, connect to vector databases for retrieval, define and execute tools, and build multi-step agents. It is also controversial: some engineers find it too abstracted, too magical, and too hard to debug. This week you learn the fundamentals of LangChain not because you will always use it, but because understanding its patterns — chains, memory, retrieval, agents — makes you a better AI engineer even if you later write these patterns from scratch.`,
    mastery_questions: [
      `Build a LangChain chain that: takes a user's question, generates a SQL query, executes it against your database, formats the result, and returns a plain English answer. Paste the chain definition and a test run.`,
      `Add ConversationBufferMemory to your chain so it remembers the last 5 exchanges. Ask a follow-up question that requires context from the previous exchange. Paste the conversation and explain how LangChain stores and injects the memory.`,
      `What is the difference between LangChain's ConversationBufferMemory, ConversationSummaryMemory, and ConversationTokenBufferMemory? When would you choose each? Give a real-world scenario for each.`,
      `Use LangChain's OutputParser to enforce structured output from your chain: require a JSON object with 'answer' and 'sources' fields. Paste the parser definition and a sample output. What happens if the LLM returns malformed JSON?`,
      `Pause and think: LangChain has been criticised for adding complexity without adding value — some engineers say 'just use the API directly'. Write a one-paragraph defence of LangChain and a one-paragraph critique. Which view do you agree with more, and why?`,
    ],
  },
  12: {
    context: `An agent that can only think is a philosopher. An agent that can take actions is an engineer. This week you build your first autonomous agent: a system that is given a goal, breaks it down into tasks, executes each task using tools (web search, code execution, file writing), evaluates the results, and continues until the goal is complete — or until it determines the goal is impossible. This is the architecture behind Devin, AutoGPT, and every agentic AI product that has launched in the last two years. You will also experience the failure modes firsthand: agents that loop forever, agents that hallucinate facts and confidently use them in subsequent steps, agents that cannot recognise when they are stuck.`,
    mastery_questions: [
      `Build an autonomous agent with the following tools: web search, Python code execution (using a sandbox), and file write. Give it the goal: 'Research the top 5 AI companies by funding in 2025, calculate their total funding, and write a formatted report to output.md'. Paste the agent's reasoning trace and the final report.`,
      `Your agent made at least one mistake during the task. Paste the mistake. Explain why it happened: was it a hallucination, a tool error, or a reasoning failure? How would you add a verification step to catch this class of error?`,
      `Add a 'max steps' limit to your agent: if it has not completed the goal in 20 steps, stop and report what it accomplished so far. Explain why an unbounded agent is a cost and safety risk in production.`,
      `What is 'reflection' in agentic AI? Add a reflection step where the agent evaluates its own output before writing the final report and revises if necessary. Paste the reflection prompt.`,
      `Pause and think: you deploy this agent for a client who says 'let it run overnight and process 500 research tasks'. Each task takes 20 API calls. Estimate the cost. Now describe the monitoring system you would build to detect if the agent is looping, failing, or producing low-quality output.`,
    ],
  },
  13: {
    context: `The automation of last week did one thing. The automation most businesses need does many things, in sequence, with branching logic, error handling, and human checkpoints. Multi-step orchestration is the discipline of designing these workflows: what happens if step 3 fails, where does the human need to approve, how do you pass state between steps, how do you handle a step that takes 4 hours to complete? Tools like Prefect, Airflow, and Temporal handle workflow orchestration at scale. n8n and LangChain handle it at the smaller scale most automation projects need. This week you build a complex 8-step workflow that mirrors a real business process — an invoice processing pipeline with approval gates and error handling.`,
    mastery_questions: [
      `Map the 8-step invoice processing workflow: receive email -> extract PDF -> parse fields -> validate data -> check against ERP -> route for approval -> update accounting system -> send confirmation. Draw it as a flowchart. Mark which steps are automated and which require a human.`,
      `Build steps 1-4 in Python or n8n. Paste the code or workflow screenshot. What is the data structure (JSON object) that you pass from step to step?`,
      `Implement step 5 (check against ERP): query a database to verify that the vendor exists and the PO number matches. If the check fails, what happens? Paste the branching logic.`,
      `Implement the human approval gate (step 6): send a Slack message with 'Approve' and 'Reject' buttons. When the approver clicks, continue the workflow. Paste the Slack interactive component setup.`,
      `Pause and think: your workflow processes 200 invoices per day. 15% fail validation and go to human review. Your finance team says they cannot handle more than 20 manual reviews per day. How would you prioritise which failed invoices go to human review and which get automatically rejected or escalated?`,
    ],
  },
  14: {
    context: `Your AI agent knows what you told it. It does not know what is in your company's 10,000-page policy manual, your product documentation, your customer contracts, or last quarter's board meeting minutes — unless you build a system to give it access. Retrieval Augmented Generation (RAG) is the architecture that solves this: documents are chunked, embedded as vectors, stored in a vector database, and retrieved based on semantic similarity when the user asks a question. The retrieved context is injected into the prompt, and the model answers based on the actual documents rather than hallucinating an answer. This is how every document Q&A system, enterprise search tool, and knowledge base assistant works. This week you build one from scratch.`,
    mastery_questions: [
      `Build a RAG pipeline from scratch: chunk a document (try the Anthropic documentation PDF), embed each chunk using an embedding model, store in a vector database (Pinecone, Chroma, or pgvector), and retrieve the top 5 most relevant chunks for a query. Paste the code for each step.`,
      `Ask your RAG system a question that requires information from the document. Paste the query, the retrieved chunks, and the final answer. Now ask a question that is NOT in the document. How does the system respond? How should it?`,
      `What is 'chunk size' and why does it matter? Test your RAG with chunk sizes of 200, 500, and 1000 tokens. Paste the accuracy difference for 3 test questions. What chunk size worked best and why?`,
      `Add a re-ranking step: after retrieving the top 10 chunks, use a cross-encoder model (or a second LLM call) to re-rank them by relevance. Paste the re-ranking logic. Did it improve accuracy?`,
      `Pause and think: your RAG system gives a confident wrong answer. The correct information is in the document but was not retrieved. List three reasons why the correct chunk might not have been retrieved and what you would change about the pipeline to fix each.`,
    ],
  },
  15: {
    context: `The most powerful AI tool in the world is useless if it requires a developer to run it. Browser automation and computer use extend AI into the graphical interfaces that humans use every day — clicking buttons, filling forms, navigating menus, reading screen content. Playwright and Selenium automate browsers. Claude's computer use API controls desktop applications. These tools unlock the automation of legacy systems that have no API, internal tools that were never designed for integration, and any workflow that a human completes by looking at a screen. This week you build a browser automation that completes a multi-step web workflow without any human interaction — and understand where the current limits are.`,
    mastery_questions: [
      `Build a Playwright script that: opens a website, searches for a product, filters results by price range, adds the first result to a cart, and takes a screenshot of the cart. Paste the script. What is Playwright doing differently from requests + BeautifulSoup?`,
      `Handle a dynamic element in your automation: a button that only appears after a 2-second animation, or a dropdown that loads options via AJAX. Paste the Playwright code that waits for this element correctly. What is the difference between waitForSelector and waitForLoadState?`,
      `What is 'headless' mode in a browser? Run your automation in headless mode and measure the speed difference vs headful mode. Paste the timings. When would you need to use headful mode?`,
      `What is Claude's computer use feature? Describe how it differs from Playwright: one is scripted, the other is AI-directed. Give a task that Playwright would handle better and a task where computer use would handle it better.`,
      `Pause and think: your browser automation logs into a third-party website using stored credentials. The website adds a CAPTCHA. List three approaches to handling CAPTCHAs in automation and the legal/ethical considerations of each.`,
    ],
  },
  16: {
    context: `A Python script on your laptop is not a product. A deployed automation pipeline that runs on a schedule, handles failures gracefully, alerts you when something goes wrong, and can be updated without downtime — that is a product. Deployment transforms your automation from a personal tool into infrastructure that a business depends on. This week you take the most useful automation you've built and deploy it properly: containerise it with Docker, deploy to a cloud provider, configure environment variables securely, set up a health check endpoint, and configure scheduled execution. After this week, your automation runs whether your laptop is on or off.`,
    mastery_questions: [
      `Containerise your best automation script using Docker. Write a Dockerfile. Build the image and run it locally. Paste the Dockerfile and confirm the automation runs inside the container.`,
      `Deploy your container to a cloud platform (Railway, Render, Fly.io, or AWS ECS). Paste the deployment URL and confirm it is running. How do you set environment variables (API keys) securely in your chosen platform?`,
      `Add a /health endpoint to your automation service. If your automation has run successfully in the last hour, return 200. If not, return 500. Paste the endpoint code. Configure UptimeRobot to alert you if it returns 500.`,
      `Set up a scheduled run using the platform's cron syntax or a GitHub Actions scheduled workflow. Paste the cron expression for 'run at 7am every weekday'. Verify it runs and paste the execution log.`,
      `Pause and think: your deployed automation processes sensitive customer data (emails, invoices). List five security requirements for a production deployment that handles PII (Personally Identifiable Information). Which of these is hardest to implement and why?`,
    ],
  },
  17: {
    context: `Automations fail. APIs return errors. Rate limits are hit. The network drops. The input format changes without warning. A well-built automation fails gracefully — it logs what happened, alerts the right person, retries when appropriate, and stops before it causes data corruption. A poorly built automation silently does the wrong thing for three weeks before anyone notices. Monitoring and error handling are the difference between an automation you can trust and one you have to babysit. This week you add production-grade observability to your automation: structured logging, error tracking with Sentry, retry logic, and a dead-letter queue for failed jobs.`,
    mastery_questions: [
      `Add structured logging to your automation using the Python logging library. Log: start time, end time, number of items processed, number of errors, and a summary of each error. Paste a sample log output in JSON format.`,
      `Integrate Sentry for error tracking. Trigger a real error in your automation and find it in your Sentry dashboard. Paste a screenshot of the error detail. What additional context (user ID, input data, function name) did you add to the Sentry event?`,
      `Implement exponential backoff retry logic for API calls that fail with a 429 (rate limit) or 503 (service unavailable) error. Paste the retry decorator you wrote. What is the maximum number of retries and why?`,
      `Build a dead-letter queue: when a job fails 3 times, move it to a separate table or file for manual review. Send a Slack alert with the failed job's details. Paste the DLQ implementation.`,
      `Pause and think: your automation processed 10,000 invoices last month. Your logs show 47 errors but you can only find 40 in your error tracking. Where did the other 7 go? What would you add to ensure 100% error visibility?`,
    ],
  },
  18: {
    context: `You have built real automations. You have deployed them. You have made them reliable. Now comes the question that most developers never think about until it is too late: can you sell this? AI automation is one of the fastest-growing service categories in the global freelance and consulting market. Businesses are desperate for people who can take a manual process and make it run itself. The engineers who learn to price, scope, package, and deliver automation projects as a service — not just as a technical exercise — are building consulting practices that generate $5,000 to $50,000 per project. This week you learn how to sell automation, how to scope a project, and how to price it so you are not working for free.`,
    mastery_questions: [
      `Identify a business in your network (a friend's company, a local business, or a hypothetical small business) that has a clear manual process problem. Write a 200-word problem statement: what do they do manually, how long does it take, what does that time cost them per month?`,
      `Design a solution for that business. Write a one-page proposal: what you will build, how long it will take, what the technical approach is, and what they will need to provide. Paste the proposal.`,
      `Price the project. Calculate: your estimated hours x your hourly rate. Now recalculate using value-based pricing: if your automation saves them $3,000/month, what percentage of that is a fair one-time fee? Which pricing model gives you more revenue?`,
      `What is the difference between a one-time automation build and a recurring retainer? Write the pros and cons of each from your perspective as the service provider. Which model would you propose to this client?`,
      `Pause and think: you deliver the automation and 3 months later the client's API provider changes their authentication method and the automation breaks. They call you at 9pm. How do you handle this? What support agreement should you have established upfront?`,
    ],
  },
  19: {
    context: `Theory is a map. A real client project is the territory. This week you build a real automation for a real client — or a near-real scenario with real constraints, real data, and a real deliverable. The process is deliberately uncomfortable: the requirements will be vague, the data will be messy, the integration you expected to use will not work as documented, and the client will change their mind about something. All of this is normal. The skill is not knowing the perfect solution before you start. It is the ability to ask the right questions, make progress despite uncertainty, communicate clearly when you are stuck, and deliver something useful by the deadline. This is the project that goes in your portfolio.`,
    mastery_questions: [
      `State your client project in one sentence: who is the client, what manual process are you automating, and what is the deliverable. Paste it. Now list the three biggest unknowns that could derail the project and how you will resolve each.`,
      `After your first day of work, write a progress update as if you were sending it to the client: what you have done, what you have discovered, and if anything has changed in scope or timeline. Paste the update. This is professional communication.`,
      `Document one technical problem you hit that you did not anticipate. Paste the error or limitation you encountered. Walk through your debugging process: what you tried, what you learned, and how you ultimately solved it or worked around it.`,
      `Demo your automation to your client (or a mentor). Write down every question or concern they raised. Paste the list. How does this feedback change what you build in the final day?`,
      `Deliver the final automation. Paste the GitHub repo link (or the deployed URL). Write a 200-word handover document: what the automation does, how to run it, what could go wrong, and how to reach you if it breaks.`,
    ],
  },
  20: {
    context: `This is not the end. It is the beginning. You can now build automations that save businesses thousands of hours per year. You can call AI APIs, build agents, implement RAG, scrape the web, process documents, automate workflows, deploy to production, and sell your work. That is a complete skillset. The question now is: what do you do with it? This week you build your portfolio, write your positioning statement, and decide your next move. Some of you will freelance. Some will join a company as an automation engineer or AI engineer. Some will build a product. All of these paths start from the same place: a portfolio that shows you have actually built things, and a clear story about what you can do for someone else.`,
    mastery_questions: [
      `Build your automation portfolio: create a GitHub repository with your three best projects. For each, write a README that explains: what problem it solves, how it works technically, what technologies it uses, and what impact it has (time saved, cost reduced, errors eliminated). Paste the link.`,
      `Write your positioning statement in two sentences: who you help, what you help them do, and what makes your approach different. Paste it. Test it: read it to someone who doesn't know what you do. Do they understand? Revise until they do.`,
      `Set a 90-day goal. Be specific: 'Sign my first paying automation client at a minimum of $500' or 'Get hired as an AI automation engineer at a company in my target market'. Paste the goal and three specific actions you will take in the next 7 days toward it.`,
      `What is the one automation you wish existed that would make your own life significantly better? Write a product concept: the problem, the user, the automation, and how you would monetise it. Paste the concept. Could you build this in one month?`,
      `Write a 400-word reflection: what was the most surprising thing you learned about AI automation that you did not expect? What is still hard — what limitation of current AI technology frustrates you most? What will you build first with everything you now know?`,
    ],
  },
};

applyUpdates("bi-analytics.json", BI);
applyUpdates("ai-automation.json", AI_AUTO);
