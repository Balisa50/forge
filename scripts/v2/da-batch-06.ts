/**
 * v2 rewrite batch 6: data-analysis Weeks 26-28
 *  W26: Capstone v1.0 — Ship + roadmap retro
 *  W27: Portfolio + interview prep
 *  W28: Power BI Mastery — DAX, modeling, deployment
 */

import { rewriteWeek } from "../rewrite-week";

// ─── W26 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 26, {
  context: `The capstone ships this week. The pattern is the same as weeks 9, 13, and 19 -- demo video, polished deliverables, retrospective -- but this close is different from the previous three in two ways. It is the last project on the roadmap, and it is the most ambitious project you built. Both facts warrant more deliberate reflection.

The CEO memo is a deliverable this week that is different from the analyst memos you have written before. The previous memos went to a VP of Sales, an HR Director, and a Marketing Director -- functional leaders who understand their domain well and need data to make a specific decision. A CEO memo is different. The CEO does not know the specific details of your analytical choices. The memo must give them the situation, the finding, the recommendation, and the business case without requiring them to understand what a cohort retention matrix is. One page. No charts -- charts are for the appendix or the deck. Words and numbers only.

The board deck is another deliverable that appears here and almost nowhere else in an analyst portfolio. A board deck is typically 10-15 slides, presented quarterly to board members who see the company once every three months and need a complete picture in 45 minutes. The analytical standards are high (every number must be defensible), the density is controlled (never more than one finding per slide), and the tone is different from an internal management deck -- boards see patterns across many companies and will ask whether your numbers compare favourably to public benchmarks.

The roadmap-level retrospective answers the question that the weekly retros cannot: across 28 weeks, across four projects, what changed? The analyst who started week 1 and the analyst at week 26 are measurably different -- in speed, in the sharpness of findings, in how they structure a memo. Name what specifically changed. That named change is the evidence of learning.

By Sunday: capstone fully shipped with demo video and public URL, CEO memo committed as a PDF, board deck committed as a PDF, and the roadmap-level RETRO.md reflecting honestly on all 28 weeks.`,

  pre_flight: `Before writing anything, open the README from week 1's Superstore project and read it. Then read your most recent project's README. The gap between the two -- in clarity, in specificity of findings, in the quality of the out-of-scope decisions -- is the evidence of 25 weeks of deliberate practice. Write down two specific things that are better in the current README. Those are your week 1-to-26 improvements.`,

  mastery_questions: [
    `Ship the capstone. Confirm all four pages of the dashboard work with the cross-page slicer. Export the dashboard as a PDF (this requires Print Area configuration for each page). Link the public dashboard, the CEO memo PDF, the board deck PDF, and the demo video in the README. Paste the README links section. Every link should open in under 5 seconds.`,
    `Write the CEO memo. One page. Structure: situation (two sentences describing the business context and why this analysis was needed), finding (two sentences with the most important finding and the specific numbers), recommendation (three bullets, each with an action and an expected impact), and next step (one sentence describing what the CEO should do in the next 30 days). Paste the memo. A CEO memo that requires the reader to know what "cohort retention" means is not written for a CEO.`,
    `Build the board deck. 10-12 slides. Slide 1: executive summary (the finding and recommendation in two sentences). Slides 2-9: supporting evidence, one finding per slide, with context that a board member who sees the company once per quarter can follow. Slide 10-12: appendix with the detailed tables and methodology. Paste the 10 slide headlines. If any headline is longer than one sentence, it is two findings and needs to be split or simplified.`,
    `Record the demo video. Three to four minutes. Open the dashboard, demonstrate all four pages and the cross-page slicer, call out the two most important findings with specific numbers, and close with the top recommendation. Paste the URL. Watch it back and write one sentence about the single improvement you would make if you recorded it again.`,
    `Write the roadmap-level RETRO.md. Required sections: most improved skill across all four projects (specific, with evidence -- "my memos went from 3 pages with no specific recommendations to 2 pages with 3 specific recommendations each"), biggest surprise across the roadmap (what was harder than expected? what was easier?), the repeatable analytical process you now have (the three-step or four-step framework), and what you would do in weeks 29 and 30 if the roadmap continued. Paste the file.`,
  ],

  common_mistakes: [
    `Writing a CEO memo that starts with methodology ("We analysed the dataset using Excel and SQL..."). The CEO does not care about the tools. Start with the situation and the finding.`,
    `Building a board deck that is 20 slides because "there is a lot to cover." A board deck that is 20 slides suggests the presenter could not decide what was important. Cut to 12 slides maximum. If 12 slides does not fit the content, the content needs to be simplified.`,
    `Recording the demo video before the dashboard is polished. A demo where you say "ignore that formatting issue" or "this number is a bit off" is worse than no demo -- it draws attention to the problems you hoped the viewer would overlook.`,
    `Writing a roadmap retro that only covers what went well. The roadmap retro is the most important retro you will write because it covers the longest period. The honest version -- what was genuinely hard, what you would change about the roadmap design itself -- is the version that helps you plan the next 6 months of learning.`,
    `Not submitting a job application this week. The capstone is the last project. The application is overdue. Apply to at least one role this week -- any role where the four projects are relevant to at least 60% of the job description.`,
  ],

  debug_help: `PDF export from Excel dashboard pages is the most common final-week blocker. The issue is usually that charts or shapes extend beyond the print area boundary. Fix: for each dashboard page, set the print area (Page Layout > Print Area > Set Print Area) to exactly the dashboard range, then File > Export as PDF. If the PDF shows only part of the dashboard, the print area is too narrow. If it shows blank pages, the print area includes blank rows below the dashboard. Adjust and re-export until the PDF matches what you see on screen.`,

  ai_assist: `Use Claude to review the CEO memo for language that assumes analytical background knowledge. Paste the memo and ask "identify any sentence that requires the reader to know what a specific analytical technique or data term means." Replace each identified term with plain language or a parenthetical definition. The CEO memo should be readable by a board member with an MBA and no data background.`,

  stretch: [
    `Submit the capstone project to a relevant Kaggle discussion or a relevant LinkedIn group. Getting external feedback on a finished project from practitioners in the domain is the fastest way to identify gaps in the analysis that you cannot see from the inside.`,
    `Create a 3-minute "case study" version of the capstone project: the business problem, the analytical approach, the key finding, and the recommendation, without the dashboard. This is the version you use in interviews when the interviewer says "tell me about a project you've done." Write it down and practise it until it is 3 minutes.`,
    `Read the most recent annual report of a public company in your capstone's domain. Compare the KPIs they report publicly to the KPIs you built in your dashboard. The comparison reveals which metrics the company considers most important and whether your dashboard would be relevant to their actual management reporting.`,
  ],
});

// ─── W27 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 27, {
  context: `The roadmap is complete. Four projects are shipped. The analytical process is repeatable. This week the work shifts entirely to making the evidence visible and converting it into interviews.

The portfolio site is the central URL. It does not need to be beautiful -- it needs to load, link to all four projects with one sentence each, and have a contact method. A GitHub Pages site built from a template takes two hours. Spending a week on the portfolio site instead of applying is the wrong trade-off. Ship the minimum viable portfolio and start applying.

LinkedIn matters more for data analysts than for most roles because business stakeholders (not just technical recruiters) search LinkedIn for analysts. A VP of Finance looking for a business analyst will often search LinkedIn before posting a job. A profile that is specific ("Data Analyst with 4 completed projects in retail, HR, e-commerce, and BI") is findable; a profile that says "Data Analysis | Excel | SQL | Python" is not.

The specific interview preparation this week is for the three types of questions data analyst interviews include: technical SQL questions, business case questions ("how would you analyse X?"), and behavioural questions about past projects. SQL questions require practice, not knowledge -- the patterns (GROUP BY, CTEs, window functions, self-joins) are in your queries.sql files from four projects. Business case questions require the three-step framework from week 26's retro. Project questions require the 90-second pitch for each of your four projects.

One application is the minimum this week. Not a stretch application -- a real one, for a role where you meet at least 70% of the listed requirements.`,

  pre_flight: `Before building the portfolio site, write the one-sentence description for each of the four projects. The sentence should state: the dataset, the main finding, and the specific recommendation that came out of the analysis. If you cannot write the sentence without looking at the project README, the project is not ready to be in a portfolio -- you need to be able to describe it from memory.`,

  mastery_questions: [
    `Build and deploy the portfolio site. Required content: name, one-sentence summary of what you do, links to all four projects with one-sentence descriptions, and a contact method. Paste the URL. Open it in an incognito tab on a phone. If it loads in under 5 seconds and the four projects are visible without scrolling, it passes the minimum bar.`,
    `Update the LinkedIn profile. Summary: four sentences covering what you do, what you have built, the tools you use fluently (Excel, SQL, Python, Tableau, Power BI, dbt), and what you are looking for. Featured section: link to portfolio site. Projects section: all four projects with one bullet each and the specific finding. Skills section: ranked skills backed by the project evidence. Paste your profile URL.`,
    `Write the SQL practice answer for this question: "Given a table of monthly customer orders, write a query that returns each customer's total orders, total revenue, average order value, and whether they are in the top 10% of customers by revenue." This combines GROUP BY, window functions, and a CASE or NTILE. Paste the query. Time yourself -- if it takes more than 15 minutes, do 30 minutes of SQL practice daily before interviews.`,
    `Write the spoken answer to the business case question: "Our e-commerce company has seen a drop in checkout conversion rate over the last quarter. How would you analyse this?" Use the three-step framework: clarify the metric and the context (what counts as conversion? which part of the funnel?), describe the data you would pull and the analysis you would run (funnel breakdown by device, browser, user segment, time of day), and state what findings would change your recommendation. Time the answer -- aim for 90 seconds. Paste the written version.`,
    `Submit one job application. Paste the company name and role title. In the cover letter or application notes, reference one specific project that is directly relevant to the role. A referenced project with a live URL is the single most effective thing you can add to a data analyst application -- it proves you can do the work, not just that you know the tools.`,
  ],

  common_mistakes: [
    `Spending the week building a beautiful portfolio site instead of applying. The portfolio site is done when it is live and links to the projects. The application is the action that produces interviews.`,
    `LinkedIn profiles that list tools without projects. "Excel, SQL, Python, Tableau, Power BI" as skills without any linked projects makes you look identical to thousands of other candidates who list the same tools. The four projects are what differentiate you.`,
    `Practising SQL by reading solutions instead of writing them. SQL interview preparation requires solving problems yourself, timing yourself, and checking your solution. Reading solutions without attempting the problem is not practice.`,
    `Business case answers that describe a generic analysis without referencing your actual experience. "I would build a funnel analysis" is generic. "I built a funnel analysis on the Olist e-commerce dataset -- the biggest drop was between order shipped and delivered, and a 3-day delivery delay reduced review scores by 0.8 points. I would approach your checkout analysis similarly, starting with the biggest conversion drop by segment" is specific and credible.`,
    `Not submitting the application because "I am not ready." The moment of maximum readiness is now -- you have four projects, a working portfolio, and 28 weeks of analytical practice. Applications submitted now produce interviews. Applications deferred to "when I am more ready" produce nothing.`,
  ],

  debug_help: `The SQL business case question that most analysts struggle with in interviews is not the syntax -- it is the framing. Interviewers do not want a query. They want to hear you think. Structure your answer: first state what data you need (name the tables and columns), then describe the analytical question the query answers (the GROUP BY logic), then state what you would do with the result (the interpretation and recommendation). The query itself comes last and is almost secondary to the thinking.`,

  ai_assist: `Use Claude to generate 10 SQL practice questions at increasing difficulty (GROUP BY, CASE WHEN, window functions, CTEs, self-joins). Solve each one yourself before reading Claude's solution. After solving, ask Claude to critique your solution for readability and efficiency. The critique often catches an unnecessary subquery that could be a CTE, or a GROUP BY on too many columns that could be simplified.`,

  stretch: [
    `Apply to three more roles this week. Track them in a spreadsheet: company, role, date applied, response date (update as it arrives). Ten applications is the minimum useful sample for calibrating response rate. Under five is too few to learn anything.`,
    `Do one mock technical interview with a friend who is also in the job market. Ask them to give you one SQL problem and one business case question. Do the reverse for them. The peer review surfaces the explanations that make sense in your head but not to someone who hears it for the first time.`,
    `Research the data analyst hiring process at two companies you want to work for. Check Glassdoor interview reviews (filter by "data analyst" and last 12 months). What SQL topics appear? What case study frameworks do they use? Knowing the specific format before you see it is a preparation advantage.`,
  ],
});

// ─── W28 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 28, {
  context: `You learned Tableau in week 20. This week you learn Power BI -- the other half of the market, and the tool that dominates in Microsoft-stack companies (which is to say, most large enterprises). Having fluency in both is the difference between being the analyst who can only work in the organisation's preferred tool and being the analyst who can evaluate which tool is right for the problem and use either.

Power BI's advantage over Tableau is the Microsoft ecosystem integration. Power BI pulls directly from Azure, SQL Server, SharePoint, and Excel with native connectors. If your company runs on Microsoft, the data is already where Power BI can reach it. Power BI also has a more developed enterprise governance layer -- row-level security, workspace permissions, certified datasets, and deployment pipelines are all more mature in Power BI than in Tableau.

Power BI's distinctive feature is DAX (Data Analysis Expressions). DAX is a formula language for writing measures and calculated columns. If you have used SUMIFS and AVERAGEIFS in Excel, DAX will feel familiar at first -- and then you will encounter context transitions and CALCULATE and everything will stop being familiar. Context is the thing that makes DAX hard and powerful: a DAX measure's result depends on the filter context imposed by whatever slicer, filter, or row context is currently active, and CALCULATE is the function that lets you modify that context deliberately.

The time intelligence DAX functions are the most directly useful for business analysis: TOTALYTD, SAMEPERIODLASTYEAR, and DATESINPERIOD compute the year-to-date sum, the same-period-last-year value, and any rolling window. These calculations require a properly constructed date dimension table -- which is why you spent time on the date dimension in week 22.

By Sunday: the Superstore analysis rebuilt in Power BI Desktop with four pages, proper data modeling, DAX measures for YTD and YoY growth, drill-through pages, and published to Power BI Service at a shared workspace URL.`,

  pre_flight: `Install Power BI Desktop (free from powerbi.microsoft.com). Open it and connect to the Superstore CSV using Get Data > Text/CSV. In the Power Query editor, check the column data types -- set Order Date to Date, Sales and Profit to Decimal Number. Load the data. Run a quick card visual showing total Sales. Confirm it matches the week-1 Excel total within $100. If it does not, a data type or filter is wrong.`,

  mastery_questions: [
    `Create the date dimension table in Power BI using a DAX calculated table: DateTable = CALENDAR(DATE(2014,1,1), DATE(2018,12,31)). Add columns for Year, Quarter, Month, and MonthNumber using YEAR(), QUARTER(), FORMAT(), and MONTH() DAX functions. Mark it as a Date Table (Table Tools > Mark as date table, select the Date column). Create the relationship from DateTable[Date] to Orders[Order Date]. Paste the DAX for the DateTable creation. Confirm the relationship appears as active (solid line) in Model view.`,
    `Write four DAX measures: Total Sales = SUM(Orders[Sales]), Total Profit = SUM(Orders[Profit]), Profit Margin = DIVIDE([Total Profit], [Total Sales], 0), YTD Sales = TOTALYTD([Total Sales], DateTable[Date]). Paste all four. Add them to a card visual and confirm they show the same values as the week-1 Excel analysis. Write one sentence explaining what DIVIDE(..., 0) handles that a simple division operator does not.`,
    `Write a YoY Sales Growth measure: YoY Sales Growth = DIVIDE([Total Sales] - CALCULATE([Total Sales], SAMEPERIODLASTYEAR(DateTable[Date])), CALCULATE([Total Sales], SAMEPERIODLASTYEAR(DateTable[Date])), 0). Add it to a line chart with Year on the x-axis. Paste the YoY growth for each year. Confirm it matches the week-2 Python output. Write one sentence about why CALCULATE is necessary in this formula -- what would happen if you used [Total Sales] without CALCULATE in the SAMEPERIODLASTYEAR expression?`,
    `Add a drill-through page. Create a "Sub-Category Detail" page with a table visual showing order-level data filtered to a specific Sub-Category. Right-click the Sub-Category field in the Filters pane and set it as a drill-through filter. Test the drill-through: on the main Category Margin page, right-click a bar, select Drill through > Sub-Category Detail. Confirm the detail page filters to the correct Sub-Category. Paste a description of what you see on the drill-through page.`,
    `Publish the report to Power BI Service (requires a free Power BI account, not Power BI Pro). Share the workspace URL. Confirm the report loads in under 10 seconds from the URL. Write a one-paragraph comparison of Power BI and Tableau: where Power BI is stronger, where Tableau is stronger, and which you would recommend to a mid-size company considering a BI tool switch.`,
  ],

  common_mistakes: [
    `Not marking the date table as a Date Table before using time intelligence functions. TOTALYTD and SAMEPERIODLASTYEAR require the Date Table to be marked, and they fail silently (returning blank or incorrect results) if it is not.`,
    `Using calculated columns for metrics that should be measures. A calculated column computes a value for every row in the table and is stored in memory. A measure computes a value based on the current filter context without storing per-row values. Profit Margin should be a measure (it changes with every filter), not a calculated column.`,
    `Creating a many-to-many relationship between Orders and the Date Table. Orders has one date per row; the Date Table has one row per date. The relationship should be one-to-many (one date, many orders). If Power BI shows a many-to-many warning, the Order Date column in Orders has dates that are not in the Date Table range -- extend the CALENDAR function range.`,
    `Publishing to Power BI Service without setting the correct workspace permissions. A report published to "My Workspace" is not shareable without Power BI Pro. For a portfolio, publish to a shared workspace (free tier) and copy the URL from the workspace, not from "My Workspace."`,
    `Writing DAX measures without testing them at multiple filter contexts. A measure that is correct at the total level may be wrong at the Category level or at the individual order level. Always test measures in a table visual with at least two levels of granularity before relying on them.`,
  ],

  debug_help: `Two specific DAX debugging patterns. First: a measure returns BLANK instead of a value. Usually means either the filter context has filtered out all data (check if all slicers and filters are compatible with the data), or a DIVIDE function is returning BLANK because the denominator is 0 (change the alternate result parameter: DIVIDE(numerator, denominator, 0) returns 0 instead of BLANK). Second: SAMEPERIODLASTYEAR returns the same year instead of the previous year. The Date Table is not marked as a Date Table, or the relationship between the Date Table and the Orders table is not active. Check both in the Model view.`,

  ai_assist: `Use Claude to explain the difference between row context and filter context in DAX, with a specific example using your Superstore data. Row context is the current row being iterated (in a calculated column or SUMX). Filter context is the set of filters imposed by slicers, visual filters, and CALCULATE. Understanding the difference is what makes DAX measures predictable rather than mysterious. Do NOT use Claude to write the time intelligence measures -- writing TOTALYTD and SAMEPERIODLASTYEAR yourself, understanding each function's arguments, is the skill.`,

  stretch: [
    `Implement row-level security (RLS) in Power BI: define a role that limits each Region Manager to seeing only their region's data. Test the role using the "View as" feature. RLS is an enterprise BI requirement that appears in many job descriptions for senior analyst roles.`,
    `Compare the performance of a DAX measure versus an equivalent pre-aggregated measure table for the YoY calculation. For large datasets, pre-aggregating in Power Query (M language) before loading is faster than computing YoY in DAX at query time. Document the trade-off.`,
    `Write a one-page "Tableau vs. Power BI" recommendation document for a hypothetical company that is starting a new BI tool selection process. Include: company profile (50 employees, Microsoft stack, no existing BI tool), the three most important evaluation criteria, and your recommendation with reasoning. This is an actual consulting deliverable that appears in BI tool selection projects.`,
  ],
});
