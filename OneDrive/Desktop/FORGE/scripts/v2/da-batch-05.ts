/**
 * v2 rewrite batch 5: data-analysis Weeks 21-25
 *  W21: Modern Data Stack — dbt + BigQuery
 *  W22: Capstone v0.1 — Multi-source dashboard scope
 *  W23: Capstone v0.2 — Pages 1 + 2
 *  W24: Capstone v0.3 — Pages 3 + 4
 *  W25: Storytelling masterclass
 */

import { rewriteWeek } from "../rewrite-week";

// ─── W21 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 21, {
  context: `The analytics tools you have used so far -- Excel, pandas, SQL, Tableau -- are the tools every analyst uses. This week you learn the tool that the data engineering layer uses to prepare data before analysts touch it, and that is appearing in more and more analyst job descriptions every year.

dbt (data build tool) is a framework for transforming data inside a data warehouse using SQL. The core idea: instead of writing ad-hoc queries, you write SQL models that are version-controlled, testable, and documented. Each model is a SELECT statement. dbt compiles the models, resolves dependencies between them, runs them in the right order, and tests the outputs. The tests are not optional -- dbt baked in the concept of data quality assertions from day one, which is why analytics teams who use dbt catch data quality issues before they reach the dashboard layer.

BigQuery is the data warehouse. Google's BigQuery free tier gives you 1TB of query processing per month and 10GB of storage, which is more than enough for the Superstore analysis you will rebuild this week. Every query you have written in SQLite or pandas translates directly to BigQuery with minor syntax adjustments (DATE_TRUNC instead of strftime, SAFE_DIVIDE instead of manually handling divide-by-zero). The scale is the difference -- a BigQuery query that takes 3 seconds on a 100MB file would take the same 3 seconds on a 100GB file, because BigQuery distributes the compute.

The Superstore dbt project is the deliverable. You will upload the Superstore CSV to BigQuery, write three dbt models (staging, intermediate, marts), add at least two dbt tests (not_null on key columns, unique on primary keys), and generate dbt docs. The documentation is the feature -- a stranger who clones your repo and runs dbt docs generate and dbt docs serve gets an interactive data catalogue showing all your models, their dependencies, and their tests.

By Sunday: the superstore-dbt repo live on GitHub, dbt docs published, and the README explaining the model structure and how to run the project from scratch.`,

  pre_flight: `Create a Google Cloud account (free tier) and a BigQuery project before writing any code. Upload the Superstore CSV to a BigQuery dataset using the BigQuery console's import feature. Run SELECT * FROM your_dataset.superstore LIMIT 5 in the BigQuery console to confirm the data loaded correctly. Note any column names that changed during import (BigQuery may modify column names with spaces or special characters). Write down any name changes -- you will reference them in the dbt source configuration.`,

  mastery_questions: [
    `Create a dbt project (dbt init superstore_dbt). Configure the BigQuery connection in profiles.yml. Write the source definition in models/sources.yml: name the source "superstore_raw" and the table "superstore." Run dbt debug to confirm the connection works. Paste the last 5 lines of dbt debug output. A successful connection shows "Connection test: OK."`,
    `Write the staging model (stg_orders.sql): SELECT order_id, PARSE_DATE('%m/%d/%Y', order_date) as order_date, customer_id, customer_name, segment, country, region, category, sub_category, SAFE_CAST(sales AS FLOAT64) as sales, SAFE_CAST(profit AS FLOAT64) as profit, SAFE_CAST(discount AS FLOAT64) as discount FROM {{ source('superstore_raw', 'superstore') }}. Run dbt run --select stg_orders. Paste the row count from the BigQuery console. Confirm it matches the original CSV row count.`,
    `Write the intermediate model (int_customer_metrics.sql): aggregate from stg_orders to the customer level -- total sales, total profit, order count. Write the mart model (mart_category_margins.sql): compute Profit Margin by Category and Sub-Category. Run dbt run. Paste the results of SELECT * FROM mart_category_margins ORDER BY margin DESC LIMIT 5. Confirm it matches the week-1 Excel analysis.`,
    `Add two dbt tests in models/schema.yml: unique and not_null on order_id in stg_orders. Add at least one custom test: a range check that profit margin is between -1 and 1 (a margin outside that range indicates a data error). Run dbt test. Paste the test results. If a test fails, investigate -- do any orders have a profit margin outside the expected range?`,
    `Generate dbt docs (dbt docs generate) and start the documentation server (dbt docs serve). Navigate to the lineage graph in the browser. Paste a screenshot description or the URL if you have deployed it. The lineage graph shows stg_orders → int_customer_metrics and stg_orders → mart_category_margins, with the source node upstream. Write one sentence about what the lineage graph communicates that a plain SQL file does not.`,
  ],

  common_mistakes: [
    `Using direct BigQuery table references (project.dataset.table) inside dbt models instead of the {{ source() }} or {{ ref() }} Jinja macros. Hardcoded references bypass dbt's dependency resolution and break the lineage graph. Always use {{ source() }} for raw tables and {{ ref() }} for other dbt models.`,
    `Writing dbt models that include both transformation logic and business logic in the same file. The staging model should handle only type casting, column renaming, and basic filtering. Business logic (computing margins, aggregating to customer level) belongs in intermediate or mart models. This separation makes debugging much faster.`,
    `Running dbt run without first running dbt compile to check for syntax errors. dbt compile generates the SQL that will be executed without actually running it -- a fast way to catch Jinja or SQL syntax errors before they run against BigQuery.`,
    `Not setting the materialisation strategy. By default, dbt models are views, not tables. For the mart layer, set materialized='table' in the model config so downstream users query a pre-computed table rather than a view that re-runs the full query on every access.`,
    `Committing the profiles.yml file that contains BigQuery credentials. profiles.yml contains your service account credentials and must never be committed. Add it to .gitignore immediately after creation.`,
  ],

  debug_help: `The most common dbt BigQuery connection error is "google.auth.exceptions.DefaultCredentialsError." This means the BigQuery connection is not authenticated. Fix: run gcloud auth application-default login from the terminal (requires the gcloud CLI installed), then re-run dbt debug. The second most common error is "dbt.exceptions.CompilationException: Found a cycle." This means one of your {{ ref() }} calls creates a circular dependency between models. Draw the dependency graph on paper to find the cycle.`,

  ai_assist: `Use Claude to generate the schema.yml file for your dbt models -- the structure of columns, tests, and descriptions is mechanical and Claude writes it correctly. Verify that the column names in schema.yml match the actual column names in your SQL models exactly (case-sensitive). Do NOT use Claude to write the mart model SQL. Writing the profit margin aggregation in BigQuery SQL yourself is the step that proves you can translate between the Excel, pandas, and SQL versions of the same analysis.`,

  stretch: [
    `Add a dbt snapshot to track slowly-changing dimensions (e.g., if a customer's segment changes over time, the snapshot captures the history). Snapshots are an advanced dbt feature that appear in production data warehouses at companies like GitLab and Shopify.`,
    `Deploy the dbt docs to a static site (GitHub Pages or Netlify). The hosted documentation makes your data catalogue publicly browsable -- recruiters who see a link to a hosted dbt data catalogue in your README notice it.`,
    `Add a dbt package (from hub.getdbt.com): dbt_utils is the most useful first package, adding helper macros for surrogate keys, date spines, and safe division. Add it to packages.yml, run dbt deps, and use one macro from dbt_utils in a model.`,
  ],
});

// ─── W22 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 22, {
  context: `The capstone is the fourth and final project in the data analysis roadmap. Unlike the previous three (Superstore, HR Attrition, Olist), this one uses data you find yourself -- ideally data from a domain you find genuinely interesting or that is relevant to a role you are targeting.

The specific deliverable this week is a scoped spec and a working data model. The capstone is a four-page Excel dashboard that tells a coherent story using data from at least three different sources. "At least three sources" means you need to merge tables you did not design -- the real-world analyst problem is that the data relevant to a business question is never conveniently in one table.

The multi-source merge is the analytical challenge. A retail capstone might merge: public store transaction data, publicly scraped competitor prices, and economic indicator data from the World Bank. A healthcare capstone might merge: hospital outcome data, publicly available demographic census data, and published insurance enrollment figures. A football (soccer) capstone might merge: match result data, player transfer fee data, and league attendance figures. The merge is where you build the star schema: one central "facts" table (orders, matches, outcomes) joined to multiple "dimension" tables (stores, players, hospitals).

The Power Pivot approach in Excel handles this without writing code. Power Pivot is Excel's in-memory analytics engine -- it lets you define relationships between tables (like SQL JOINs) and then use DAX formulas to create measures that span the relationships. For analysts who live in Excel, Power Pivot is the bridge to the same analytical capabilities that SQL offers without leaving the spreadsheet.

By Sunday: a scoped SPEC.md, all three data sources downloaded and inspected, the star schema drawn on paper and digitised, and the first KPI computed across at least two sources (proving the merge works).`,

  pre_flight: `Choose the capstone domain before opening Excel. Write three candidate domains and for each: the central question, the three data sources (with URLs confirming the data is publicly downloadable), and the KPI you will compute on the first page of the dashboard. The domain where you can name all three data sources with specific URLs is the one to build. The domain where you say "I think there is data for this" is not ready.`,

  mastery_questions: [
    `Download all three data sources. For each, run: row count, column names, key join column, and any data quality issues you notice immediately (nulls, format inconsistencies, date format mismatches). Paste a three-row table: source name, rows, key column, one data quality note. The data quality note prevents the surprise that arrives in week 23 when the merge fails because the join key is formatted differently across sources.`,
    `Draw the star schema: one central facts table, connected to dimension tables via foreign keys. Digitise it as a markdown table or an image. For each relationship, specify: which column in the facts table joins to which column in the dimension table, and whether it is a one-to-many relationship (one store, many transactions) or a many-to-one. Paste the schema.`,
    `Load all three sources into Excel and define the relationships in Power Pivot (Data > Manage Data Model > Create Relationship). Paste the relationship definitions. Now write one DAX measure that uses values from two different tables: for example, SUM([sales]) / RELATED(target[monthly_target]) for a sales-vs-target KPI. Run the measure in a pivot table. Paste the output.`,
    `Compute the first headline KPI that requires the multi-source merge. This should be the KPI that could not be computed from any single source alone. Paste the computation and the value. Write one sentence about why this KPI requires the merge -- what does each source contribute that the other does not have?`,
    `Write SPEC.md. Required: the central question, the three data sources with URLs, the star schema description, four dashboard page titles (one per page you will build in weeks 23 and 24), the headline KPI for each page, and the out-of-scope list. Paste the file. A complete spec prevents the scope creep that derails most capstone projects.`,
  ],

  common_mistakes: [
    `Choosing data sources that cannot be merged because they have no common join key. A public sales dataset and a weather dataset can be merged on date. A sales dataset and a demographic dataset can be merged on geographic code. Before finalising the domain choice, confirm the join key exists in all sources.`,
    `Using a many-to-many relationship in the star schema without an intermediate bridge table. Power Pivot handles one-to-many and many-to-one relationships cleanly but requires a bridge table for many-to-many. If your schema has a many-to-many relationship, add a bridge table before building the data model.`,
    `Downloading data but not checking its licence. Some public datasets are licensed for research use only, not for commercial publication. Check the licence before committing the data to a public GitHub repo. Link to the source rather than committing the file if the licence is unclear.`,
    `Setting up the star schema in Power Pivot before confirming the join key values match between tables. If the customer_id in the facts table uses a different format than in the customers dimension table (integer vs string, upper vs lower case), the relationship will be silently inactive and measures will return unexpected values.`,
    `Treating the capstone scope as fixed once the spec is written. The spec is a living document until week 24. If week 23 reveals that one of the data sources is unusable, update the spec and note the change. An honest updated spec is better than continuing to build against a known-broken assumption.`,
  ],

  debug_help: `Power Pivot relationships fail silently when the join key has duplicates on both sides (many-to-many). The symptom is a pivot table that shows the same value for every row or that returns BLANK for measures. Fix: check whether the dimension table's key column is unique (one row per key value). If it is not, aggregate the dimension table to the correct grain before defining the relationship. Also check that both columns are the same data type -- a text customer_id on one side and an integer customer_id on the other side will not match.`,

  ai_assist: `Use Claude to generate the DAX measure syntax for your first headline KPI. DAX is a language with enough quirks (context transitions, CALCULATE vs FILTER, ALL vs ALLEXCEPT) that the first few measures are faster to write with Claude's help. Read the generated measure and understand what each function does before using it. Do NOT use Claude to design the star schema -- the schema design requires understanding what questions you are trying to answer, which requires domain knowledge of your chosen capstone domain.`,

  stretch: [
    `Import the data model from Excel Power Pivot into Power BI Desktop. Power BI reads the Excel data model directly. Note whether the relationships you defined in Power Pivot transfer correctly, and whether the DAX measures produce the same values. This cross-tool compatibility is useful to document because many employers use both Excel and Power BI.`,
    `Add a date dimension table to the data model: a table with one row per day, with columns for year, quarter, month, week, and day-of-week. Join it to the facts table on the date column. A proper date dimension enables time intelligence DAX functions (YTD, MTD, same-period-last-year) that require a contiguous date spine.`,
    `Write a one-paragraph "data sourcing" section for the SPEC.md that explains how the data was obtained, any transformations applied before loading, and the data quality limitations of each source. Transparency about data quality is what separates a credible analysis from an unexamined one.`,
  ],
});

// ─── W23 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 23, {
  context: `The data model is built. This week you build the first two pages of the capstone dashboard and confirm that the cross-page filter architecture works before building pages 3 and 4.

Multi-page dashboards in Excel have a specific design pattern that is different from single-page dashboards. Each page answers a different level of question: page 1 is the executive summary (the three KPIs a CEO would check every Monday morning), page 2 is the operational detail for one department or function, page 3 is a deeper dive on the most important finding from page 2, and page 4 is the cohort or trend analysis that gives the time dimension. Every page connects to the others through shared slicers.

The KPI band design is the visual pattern for the executive summary page. A KPI band has three elements: the current value (large, prominent), the change from a reference period (green up-arrow or red down-arrow with a percentage), and a small sparkline showing the trend. Three KPI bands, arranged horizontally across the top of page 1, give a CEO everything they need to know in 10 seconds: is the business up or down on the three metrics that matter, and are the trends consistent with the numbers?

Cross-page slicer architecture means that when the user clicks "Q3 2024" on the slicer, every chart on every page updates. This requires all pivot tables to share the same PivotCache in Excel. Setting this up before building any charts saves the frustration of rebuilding them later.

By Sunday: pages 1 and 2 built, cross-page slicers working for at least one slicer, and the visual style consistent (same font, same colour palette, same border style on every chart) across both pages.`,

  pre_flight: `Before building anything, define the three KPIs for page 1 with exact formulas. For each KPI: the current-period value formula, the reference-period value formula, the change calculation, and the threshold that turns it red (below X%) or green (above Y%). Write these down. Building KPI bands without pre-defined thresholds produces KPI bands that are always green (optimistic but uninformative) or always red (alarming but useless).`,

  mastery_questions: [
    `Build the KPI band for the first headline metric. Three cells formatted in a wide rectangle: the large current-period value, the change arrow and percentage (using an IF formula for the arrow character and conditional formatting for the colour), and the sparkline. Paste the formulas for the change cell and the threshold formatting rule. Confirm the arrow changes direction and colour when you change the reference period.`,
    `Build the second KPI band and confirm the three KPI bands are visually consistent: same font size, same border, same colour for the change arrows. Add a "as of" date label below each band so a reader knows which period is current. Paste the layout description. Consistency is the property that makes a dashboard look professional rather than assembled.`,
    `Build the first chart on page 2 (the operational detail page). It should show a breakdown of the headline metric from page 1 by one dimension (product category, department, geography). Paste the chart type and the finding it reveals. The finding on page 2 should add information beyond the page 1 KPI -- not "sales are up" (that is on page 1) but "sales are up in the North, down in the South" (that is the page 2 value add).`,
    `Connect the slicer to all charts on both pages. In Excel: right-click the slicer, select Report Connections, and check all pivot tables that the slicer should control. Test by clicking a filter value and confirming both page 1 KPI bands and the page 2 chart update simultaneously. If any chart does not update, its pivot table is not connected to the slicer -- fix before proceeding to pages 3 and 4.`,
    `Apply the visual style guide to both pages. Define: the primary colour (hex code), the secondary colour, the font (name and sizes for titles, axis labels, and body text), and the chart border style. Paste the style guide as a bulleted list. Apply it consistently to every element on pages 1 and 2. A dashboard where every chart looks like it was built by a different person is a dashboard that feels unreliable, regardless of the quality of the analysis.`,
  ],

  common_mistakes: [
    `Building page 2 before confirming the page 1 KPIs are correct. Page 2 is the drill-down of page 1 -- if page 1 has a wrong number, page 2 amplifies the error. Always validate the KPI band values against the raw data before adding detail pages.`,
    `Using more than three KPI bands on page 1. The CEO summary page should have three metrics, not seven. More than three means "we could not decide what matters most," which is an editorial failure. Choose the three that the relevant executive checks first.`,
    `Not testing the cross-page slicer until page 4 is built. If the slicer architecture is wrong, you will discover it on page 4 and have to rebuild the connection for all charts. Test after page 1 is done, before starting page 2.`,
    `Using absolute cell references in KPI band formulas that break when the page is moved or the reference period is changed. Use named ranges (Insert > Name Manager) for the current period and reference period dates. Named ranges make the formulas readable and resilient to layout changes.`,
    `Forgetting to hide the gridlines, row/column headers, and formula bar on the dashboard sheets. A dashboard should look like a dashboard, not like a spreadsheet. View > Uncheck Gridlines, Headings, and Formula Bar converts a spreadsheet into a dashboard in 30 seconds.`,
  ],

  debug_help: `Cross-page slicers fail when one of the pivot tables uses a different data source connection than the others. In Excel, all pivot tables connected to the same slicer must share the same PivotCache (the same underlying data connection). Check this: right-click any pivot table, select PivotTable Options, and look at the "Data" tab -- the "Save source data with file" option indicates the cache is embedded. All connected pivot tables must reference the same cache. If one pivot table was created from a different data range, rebuild it from the same data source as the others.`,

  ai_assist: `Use Claude to generate the sparkline formula for the KPI trend line -- Excel sparklines are configured through the chart wizard, not formulas, so Claude's help is less useful here. For the KPI change formula (the arrow and percentage), Claude can write the IF formula that displays up-arrow, down-arrow, or neutral based on the direction and magnitude of the change. Verify the formula logic with three test cases: positive change, negative change, and zero change.`,

  stretch: [
    `Add a "period selector" user control: a data validation dropdown that lets the user switch between "This Quarter," "This Year," and "Last 12 Months" without using the slicer. The dropdown drives a CHOOSE or SWITCH formula that changes the reference period for all KPI band calculations simultaneously.`,
    `Add a KPI "threshold editor" -- a small table on a hidden "settings" sheet where the green/red thresholds are defined. Reference those cells in the conditional formatting rules. This way, the KPI thresholds can be updated without editing the conditional formatting formulas on the dashboard page.`,
    `Write a short "user guide" tab in the workbook explaining what each page shows, what the slicers do, and what the alert colours mean. A dashboard without documentation assumes the reader understands your design choices, which is rarely true for someone who did not build it.`,
  ],
});

// ─── W24 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 24, {
  context: `Pages 1 and 2 are built and the slicer architecture works. This week you complete pages 3 and 4 and confirm that the full four-page dashboard is visually consistent and alert-driven.

Page 3 is the deep-dive page. The chart on page 2 identified the dimension that most influences the headline KPI -- the region, product, or department with the biggest gap. Page 3 goes one level deeper into that dimension: what is driving the gap? If page 2 shows "North region is outperforming," page 3 shows which product categories within the North are driving the outperformance, and whether any categories in the North are underperforming within the overall positive picture.

Page 4 is the trend and cohort page. It answers the time-dimension question: is this getting better or worse, and how does the current cohort compare to previous cohorts? For a retail capstone, this is the monthly revenue trend with year-over-year overlay. For an HR capstone, this is the quarterly attrition rate by cohort. The cohort matrix from week 16 is the model -- rows are cohorts, columns are periods since cohort start, cells are the metric of interest.

The alert-driven design is what separates an operational dashboard from an informational one. An informational dashboard shows numbers. An operational dashboard flags numbers that require action. The alert is usually an IF formula with conditional formatting: if the metric falls below a threshold, highlight the cell red and add a text indicator. The threshold is defined by the business context (a gross margin below 20% is a warning; a gross margin below 10% requires immediate attention) and must be specified before building the dashboard.

By Sunday: all four pages complete, the alert rules defined and documented in the README, the visual style consistent across all four pages, and the dashboard reviewed by one person who has not seen it.`,

  pre_flight: `Define the alert rules before building page 3. For each metric that has an alert: the metric name, the warning threshold, the critical threshold, and the visual treatment (yellow for warning, red for critical). Write them as a bulleted list. If you cannot define the thresholds before building, you do not understand the business context well enough yet -- research what "normal" looks like for your domain and set the thresholds accordingly.`,

  mastery_questions: [
    `Build page 3 (deep-dive page). The main chart should be a breakdown of the page-2 finding by a second dimension. If page 2 shows "North region underperforms," page 3 might show "within the North, Furniture underperforms by the widest margin" using a bar chart sorted by the gap versus the company average. Paste the chart type and the specific finding it reveals. The finding on page 3 must be more specific than the finding on page 2 -- if it is not, page 3 is redundant.`,
    `Build the cohort retention matrix on page 4. Use the conditional formatting pattern from week 11: green for above-threshold retention, yellow for moderate, red for below-threshold. Add a trend line or sparkline showing whether each cohort's month-3 retention is improving over time. Paste the matrix data (the values, not the formatting). Write one sentence about whether the most recent cohorts are better or worse than the first cohorts.`,
    `Add the alert rules to page 1. For each KPI band: if the current value falls below the warning threshold, the large number cell turns yellow. If it falls below the critical threshold, it turns red. Paste the conditional formatting rule for one KPI. Test it by temporarily changing the value to below each threshold and confirming the colour changes correctly.`,
    `Review the full four-page dashboard for visual consistency. Open each page and check: same font, same colour palette, same chart border style, same spacing. Write down any inconsistencies you find. Fix them. Paste the updated consistency checklist: font name (confirmed), primary colour hex (confirmed), chart border (confirmed), slicer position (consistent across pages).`,
    `Share the dashboard with one person who has not seen it. Ask them: "Without my explanation, which page would you go to first? What does that page tell you? What question does it leave unanswered?" Write down their answers. The first question reveals your dashboard's natural entry point. The unanswered question is what goes in the appendix or becomes a next-version feature.`,
  ],

  common_mistakes: [
    `Building page 3 as a repetition of page 2 at slightly more granularity. Pages 3 should answer a different question, not the same question with more detail. If page 2 answers "which region?", page 3 answers "why that region?" or "what within that region?" -- the causal or compositional question behind the page-2 finding.`,
    `Using too many alert colours. Two alert colours (warning and critical) are enough. Three or more (info, warning, watch, critical) produce alert fatigue -- the viewer learns to ignore them because there are too many. Keep the colour vocabulary small.`,
    `Not testing the alerts on boundary conditions. The warning threshold is the boundary. Test that a value of exactly the threshold value triggers the alert (some conditional formatting rules use > versus >= differently). The business user who sees a value at exactly the threshold needs to know whether it is in or out of the warning zone.`,
    `Building a cohort matrix where the cohorts are labelled ambiguously. "2017 Q1" could mean customers who acquired in Q1 2017, or it could mean Q1 2017 performance for all customers. The label must be unambiguous. Add "(acquisition cohort)" or "(performance period)" to the axis label if there is any risk of confusion.`,
    `Calling the dashboard "done" without the outside reader review. The outside reader feedback is the quality gate. A dashboard that makes sense to the person who built it but confuses the first reader is not ready to ship.`,
  ],

  debug_help: `Cohort matrix conditional formatting in Excel applies incorrectly when the cells contain formulas that return text (e.g., a cell that says "N/A" for cohorts without enough follow-up data). Conditional formatting rules that reference numeric thresholds will not apply to text cells -- they appear unformatted, which can be confused with a "passing" result. Fix: use a separate column for the display value ("N/A" as text) and a separate hidden column for the numeric value (used for conditional formatting). Apply the formatting rules to the hidden numeric column and display the text column to the user.`,

  ai_assist: `Use Claude to generate the conditional formatting rule formula for a complex alert condition -- for example, an alert that fires when both the current metric is below threshold AND the YoY change is negative (double trigger). The syntax for nested conditions in Excel conditional formatting is non-obvious and Claude writes it correctly. Test the rule with four cases: below threshold + declining, below threshold + improving, above threshold + declining, above threshold + improving.`,

  stretch: [
    `Add a "print view" for each page: a hidden button that temporarily increases chart sizes and removes slicers, optimised for PDF export. The print view allows the dashboard to be exported as a multi-page PDF for stakeholders who will read it offline.`,
    `Build a fifth "appendix" page with the full underlying data tables, the source links, and the methodology notes. The appendix handles the "where did this number come from?" question without cluttering the main dashboard pages.`,
    `Apply the "squint test" to each dashboard page: squint at the page so that text becomes unreadable. Does the most important number still stand out visually? If the squint test fails (the most important element is not visually dominant), adjust size, colour, or position until it passes.`,
  ],
});

// ─── W25 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 25, {
  context: `The capstone dashboard is built. This week you make it tell a story instead of displaying data.

There is a meaningful difference between a dashboard that contains correct numbers and a dashboard that communicates a finding. Both are common in analyst portfolios. Only one gets a second look from a hiring manager or a department head. The difference is usually not the analysis -- it is the presentation layer: the headline, the visual hierarchy, and the spoken narrative.

The Pyramid Principle is the analytical equivalent of "conclusion first." Every consultant, investment banker, and senior analyst learns it in their first year. The idea: lead with the answer, support it with three or four arguments, and use evidence only to support arguments that need proof. Applied to a dashboard presentation: the first sentence you say is the finding, not the methodology. "Furniture is our biggest profitability problem" comes before "I looked at profit margin by category."

Killing unnecessary charts is the hardest editorial decision in the process. Every chart you built felt necessary when you built it. Some of them are not necessary for the story -- they support the analysis but not the narrative. The test is simple: if you removed this chart, would the audience miss any information needed to understand or act on the recommendation? If no, remove it. A five-chart presentation with a clear narrative beats an eight-chart presentation where the audience stops following at chart 4.

The recorded practice is the quality gate. Most analysts can explain a dashboard clearly on the fourth try. Rarely on the first. Recording yourself forces you to hear what the audience hears: the filler words ("um," "so," "basically"), the moments where you lost the thread, and the places where you assumed the audience knew something they do not. Two recordings and two revisions is the minimum.

By Sunday: the capstone deck reduced to the minimum number of slides that tell the complete story (probably three to five), each slide with a one-sentence headline, the spoken narrative practiced and recorded at least twice, and the recording committed or linked.`,

  pre_flight: `Write the full narrative arc of the capstone in four sentences: the situation (what is true today), the complication (what problem that creates), the question (what the business needs to know), and the answer (your recommendation). This is the Barbara Minto Pyramid Principle structure at its shortest. If you cannot write all four sentences clearly, the story is not clear enough yet to present.`,

  mastery_questions: [
    `Apply the editorial cut. Look at the current deck and mark each chart as: "load-bearing" (the recommendation falls apart without this chart) or "supporting" (the chart helps but the main point survives without it). Cut all non-load-bearing charts to the appendix. Paste the new slide count (before and after) and the one finding that was hardest to cut because you thought it was important but it is not load-bearing.`,
    `Write the one-sentence headline for each slide. The headline must be a complete sentence with a specific number or comparison. Example: "Furniture's 7.2 pp margin gap from Technology explains 63% of the overall company profit shortfall." If any headline is a question ("Why is Furniture struggling?") or a vague description ("Profitability Analysis"), rewrite it as a finding. Paste all headlines.`,
    `Practice the five-minute walkthrough out loud. Record it (phone, Loom, any tool). Do not prepare a script -- narrate from the headlines. Time it. If it runs over six minutes, you have too many charts or too much explanation per chart. If it runs under three minutes, you are skipping something important. Paste the recording URL or file path.`,
    `Watch the recording. Identify: one moment where you lost the thread and had to recover, one chart you spent more than 60 seconds on (which means either the chart is too complex or the finding needs more setup), and one place where you used jargon that a non-analyst would not understand. Fix all three before recording a second take.`,
    `Record the second take. Paste the URL. Write one sentence comparing the two takes: what specifically improved between take 1 and take 2. The improvement should be nameable -- "I led with the finding on slide 2 instead of the methodology" or "I cut the explanation of the cohort matrix to 30 seconds instead of 90." Vague improvements ("it flowed better") are not improvements you can systematically replicate.`,
  ],

  common_mistakes: [
    `Keeping charts that you like because you found them interesting, not because they are necessary for the recommendation. Interesting to the analyst is not the same as load-bearing for the audience. Apply the load-bearing test ruthlessly.`,
    `Writing slide headlines that contain the word "analysis." "Profitability Analysis" is a section title, not a headline. Headlines contain findings. "Technology's 15.4% margin is 7.2 pp above Furniture's 8.2%" is a headline.`,
    `Practicing the deck by reading it silently. Reading and speaking are different cognitive tasks. A deck that reads clearly may have sentences that are hard to say aloud -- subject-verb separation too long, dependent clauses that require the audience to remember context. You only discover these problems by speaking.`,
    `Not cutting the intro slides. Most decks start with an agenda ("Today I will cover X, Y, Z") and a data source slide. These are overhead. Lead with the first finding. The audience will follow.`,
    `Recording one take and calling it done. The first take always has something to fix. The second take fixes it. Record at least twice.`,
  ],

  debug_help: `The most common narrative breakdown happens between the second and third supporting point. The first supporting argument is fresh. The third is the one the audience is still tracking when they should be focused on the recommendation. If the transition from your second to third supporting point is where you lose the thread, try: "The third reason this matters is..." as a explicit verbal transition, or cut the third point and make it an appendix reference. The recommendation is the destination -- every slide should visibly advance toward it.`,

  ai_assist: `Use Claude to critique your five slide headlines as a set. Paste all five and ask: "Do these headlines tell a coherent story with a clear finding and a logical progression? What is missing or inconsistent?" The critique will surface the slide that is doing too much (combining two arguments) or too little (restating a previous finding). Do NOT ask Claude to write the headlines -- they must reflect your specific findings from your specific analysis.`,

  stretch: [
    `Read "The Pyramid Principle: Logic in Writing and Thinking" by Barbara Minto, Chapter 1. The Pyramid Principle was developed for McKinsey consultants but applies to every analyst presentation. Chapter 1 explains the top-down structure in 30 pages -- the fastest ROI in analytical communication skills.`,
    `Show the recording to someone who does not work in data (a family member, a friend in a different field). Ask them: "What is the one thing this business should do?" If they cannot answer correctly, the recommendation is not clear enough for a mixed-technical audience. Iterate until they can answer.`,
    `Write the speaker notes for each slide: two to three sentences that you would say aloud while the slide is showing, in plain language. The speaker notes should add information not visible on the slide, not repeat it.`,
  ],
});
