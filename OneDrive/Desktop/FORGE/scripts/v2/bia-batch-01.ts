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

// W1: Excel — the BI analyst's foundation
rewriteWeek("bi-analytics", 1, {
  context: `Excel is where most BI work still happens in the real world. Even if your team uses Power BI or Tableau, you will get raw data in a spreadsheet, do quick analysis in Excel, and communicate findings in Excel before they ever reach a dashboard. Every BI analyst who thinks they are "above Excel" eventually hits a deadline where it is the fastest tool and they are slow because they never learned it properly.

This week you learn the Excel features that matter for data analysis: PivotTables, VLOOKUP/XLOOKUP, dynamic arrays (FILTER, SORT, UNIQUE), and conditional formatting. These are the building blocks for every BI task that follows.

The mindset shift: Excel is not a spreadsheet app for numbers — it is a data transformation and presentation tool. A well-structured Excel workbook with a data tab, a calculations tab, and a charts tab is a legitimate BI artefact that a business user can open and trust.`,
  pre_flight: `**Download the sample dataset:**
Superstore Sales data — this is the industry-standard BI training dataset.
Download from: https://community.tableau.com/s/question/0D54T00000CWeX8SAL/sample-superstore-sales-excelxls

**Excel skills to practise this week:**

PivotTable (insert → PivotTable):
- Drag Region to Rows, Sales to Values → profit by region
- Add a slicer (PivotTable Analyze → Insert Slicer) for Category

XLOOKUP (replaces VLOOKUP):
\`\`\`excel
=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])
\`\`\`

Dynamic arrays (Excel 365/2019+):
\`\`\`excel
=FILTER(A2:D100, C2:C100="West")     -- filter rows by condition
=SORT(A2:D100, 3, -1)                -- sort by column 3 descending
=UNIQUE(B2:B100)                     -- unique values from a column
\`\`\`

SUMIFS:
\`\`\`excel
=SUMIFS(Sales, Region, "West", Category, "Technology")
\`\`\``,
  mastery_questions: [
    "What is the difference between VLOOKUP and XLOOKUP? When does VLOOKUP fail and how does XLOOKUP handle that case?",
    "You have sales data with columns: Date, Region, Category, Sales, Profit. How do you build a PivotTable showing total profit by Region and Category?",
    "What is a dynamic array in Excel 365? How does FILTER differ from using a PivotTable to filter data?",
    "Explain the difference between SUMIF and SUMIFS. Write a formula that sums sales where Region is 'West' AND Category is 'Technology'.",
    "When should you use a PivotTable versus a formula-based approach for data summarisation?",
  ],
  common_mistakes: [
    "Hardcoding values in formulas instead of referencing cells — '=SUMIFS(Sales, Region, \"West\")' makes the formula unmaintainable. Reference a cell that contains 'West' instead.",
    "Not converting raw data to an Excel Table (Ctrl+T) — Tables auto-expand when you add rows, making formulas and PivotTables much more reliable.",
    "Using merged cells — merged cells break sorting, filtering, and PivotTables. Never merge cells in a data range.",
    "Storing data in a formatted report layout — a BI data source should be flat: one row per record, one column per attribute. Format for presentation separately.",
    "Not using named ranges — a formula referencing 'SalesData[Sales]' is readable; one referencing 'C2:C10000' is not.",
  ],
  debug_help: `**PivotTable not refreshing after data change?**
Right-click the PivotTable → Refresh. Or: Data tab → Refresh All.

**XLOOKUP returning #N/A?**
\`\`\`excel
-- Add a fallback value
=XLOOKUP(A2, LookupTable[ID], LookupTable[Name], "Not Found")
\`\`\`

**FILTER returning a spill error (#SPILL!)?**
-- The cells below the formula are not empty. Clear them.
-- Or wrap in INDEX to return just one value:
\`\`\`excel
=INDEX(FILTER(A2:D100, C2:C100="West"), 1, 1)
\`\`\`

**Data mixed with text and numbers in the same column?**
-- Excel treats text-numbers differently. Use VALUE() to convert:
\`\`\`excel
=SUMIFS(VALUE(C2:C100), D2:D100, "West")
\`\`\``,
  ai_assist: `**Prompts that work:**
- "I have a sales spreadsheet with columns: Date, Region, Salesperson, Product, Revenue, Cost. What Excel formulas and PivotTables would give me the top 5 insights a manager would want to see?"
- "Explain the difference between an Excel Table, a named range, and a regular cell range — and why it matters for PivotTables."
- "Write an Excel formula that calculates the 3-month rolling average of weekly sales."
- "How do I create a dynamic dashboard in Excel where a dropdown changes which region's data is shown?"`,
  stretch: [
    "Build a one-page Excel dashboard for the Superstore dataset with: sales by region (bar chart), profit trend (line chart), category comparison (pie or donut), and a slicer for year.",
    "Learn Power Query in Excel (Data → Get & Transform): import the Superstore CSV, clean column types, and load it into an Excel Table.",
    "Recreate a VLOOKUP using XLOOKUP and confirm the results match — then delete the VLOOKUP.",
    "Explore the LAMBDA function in Excel 365 — create a custom named function that calculates gross margin percentage.",
  ],
});

// W2: Superstore BI v0.2 — Drillthrough + tooltips
rewriteWeek("bi-analytics", 2, {
  context: `Drillthrough is one of the most powerful features in Power BI and Tableau — it lets a user click on a data point and navigate to a detail page scoped to exactly that item. Instead of building 10 separate reports for 10 regions, you build one drillthrough page and every region gets its own contextual detail view.

Tooltips extend the base visualisation by showing additional information when a user hovers over a data point — without cluttering the main chart. Used well, they surface secondary metrics (like profit margin when hovering over a sales bar) that would otherwise need a separate chart.

This week you build these features in Power BI Desktop (free) using the Superstore dataset. The underlying skill being practised is information hierarchy: what is the primary view, what is the detail, and when should each be shown.`,
  pre_flight: `**Power BI Desktop (free download):**
https://powerbi.microsoft.com/en-us/desktop/

**Load Superstore data:**
- Home → Get data → Excel → select your Superstore file
- Load Orders table
- Verify data types: Date as Date, Sales/Profit as Decimal Number

**Drillthrough setup:**
1. Create a new page called "Product Detail"
2. On that page: right panel → Drillthrough → drag "Product Name" into the drillthrough field
3. Build product-level charts on this page
4. On your main page: right-click a bar in a chart → Drillthrough → Product Detail

**Custom tooltip setup:**
1. Create a new page, set page size to "Tooltip" in Format → Page Information
2. Build a small chart on it
3. On your main visual: Format → Tooltip → Type = Report page → Page = your tooltip page`,
  mastery_questions: [
    "What is the difference between drillthrough and drill-down in Power BI? When would you use each?",
    "How does a drillthrough page know which data to show? What mechanism filters the detail page?",
    "You have a sales by Region bar chart. A user clicks 'West' and wants to see product-level detail for the West region. Walk me through building this drillthrough.",
    "What is a custom tooltip page in Power BI? How is it different from a default tooltip?",
    "What information hierarchy principle guides when to use a tooltip versus a drillthrough versus a separate report page?",
  ],
  common_mistakes: [
    "Building drillthrough pages that are too complex — a drillthrough page should answer one specific question about the selected item. Limit to 3-4 visuals.",
    "Not testing drillthrough with multiple context values — test by right-clicking different bars, different categories, different time periods. Filters must work for all cases.",
    "Tooltip pages that are too large — tooltip pages should be small (set page size to Tooltip preset) or they overflow the visual boundary.",
    "Forgetting to set the drillthrough field — if you don't drag a field into the Drillthrough section, the page won't appear as an option when right-clicking.",
    "Not adding a back button to drillthrough pages — users need a way to return. Power BI has a built-in back button button for drillthrough pages.",
  ],
  debug_help: `**Drillthrough option not appearing in right-click menu?**
- Verify the drillthrough field is set in the drillthrough destination page's Format panel
- The field must match exactly — if you drilled from "Category", the drillthrough page must have "Category" in its drillthrough field
- Check that the visual on the source page has a field that matches

**Tooltip page too large / overflowing?**
- Page settings → Canvas settings → Type → Tooltip
- This changes the page to 320×240px by default
- Adjust visual sizes to fit within this canvas

**Custom tooltip not showing?**
- Select the source visual → Format pane → Tooltip section
- Set Type to "Report page" (not "Default")
- Select your tooltip page from the dropdown`,
  ai_assist: `**Prompts that work:**
- "Explain how Power BI drillthrough filters work. What DAX function can I use inside the drillthrough page to confirm which filter context is active?"
- "I want to build a tooltip that shows sparkline trend + YTD total when a user hovers over a bar chart. Walk me through the steps."
- "What is the difference between drill-down (hierarchy drill) and drillthrough (page navigation) in Power BI?"
- "How do I pass multiple fields to a drillthrough page? Can I drill through from a matrix with both Region and Category selected?"`,
  stretch: [
    "Build a complete Superstore report with 3 pages: Summary, Category Drillthrough, and Product Drillthrough — with navigation between all three.",
    "Create a custom tooltip that shows a sparkline (monthly trend) when hovering over a region's total sales bar.",
    "Explore Power BI's 'Decomposition Tree' visual — build one that lets users explore Profit drivers interactively.",
    "Read the Power BI documentation on drillthrough with cross-report filtering — understand how it enables navigation between separate .pbix files.",
  ],
});

// W3: Superstore BI v0.3 — Row-level security
rewriteWeek("bi-analytics", 3, {
  context: `Row-level security (RLS) is what makes a BI report multi-tenant — the same report shows different data to different users based on their identity. A regional sales manager sees only their region. A product manager sees only their product category. The CEO sees everything.

Without RLS, sharing a Power BI report means sharing all the data in it. With RLS, you can publish one report to an entire organisation and each person sees only what they are authorised to see. This is not optional in enterprise BI — it is required any time data access needs to be restricted by role.

This week you implement RLS in Power BI Desktop using static roles, then learn how dynamic RLS works using USERPRINCIPALNAME() — the function that returns the logged-in user's email address and enables automatic filtering based on identity.`,
  pre_flight: `**RLS in Power BI Desktop:**

Step 1: Create a role
- Modelling tab → Manage Roles → Create
- Name the role (e.g. "West Region")
- Select the table with the filtering column
- Enter a DAX filter: [Region] = "West"

Step 2: Test the role
- Modelling tab → View as → select your role
- The report should now show only West region data

**Dynamic RLS with USERPRINCIPALNAME():**
You need a mapping table: email → region.
\`\`\`
| Email                  | Region |
|------------------------|--------|
| alice@company.com      | West   |
| bob@company.com        | East   |
\`\`\`

Create a role with this DAX filter on the Orders table:
\`\`\`dax
[Region] = LOOKUPVALUE(
    UserMapping[Region],
    UserMapping[Email],
    USERPRINCIPALNAME()
)
\`\`\`

This automatically filters each user's data based on their login email.`,
  mastery_questions: [
    "What is the difference between static RLS and dynamic RLS in Power BI? When do you need each?",
    "A company has 50 regional managers, each seeing only their region's data. Would you use static or dynamic RLS? Why?",
    "What does USERPRINCIPALNAME() return in Power BI? What happens when you test a report in Desktop using 'View as'?",
    "You have a role that filters Orders by [Region] = 'West'. Does this automatically filter related tables too? How does RLS propagate through relationships?",
    "What is the difference between RLS in Power BI Desktop and RLS in the Power BI Service? Which is enforced when a report is published?",
  ],
  common_mistakes: [
    "Testing RLS only in Desktop and not in the Service — 'View as role' in Desktop simulates RLS but USERPRINCIPALNAME() returns empty. Test by sharing with a test account in the Service.",
    "Not creating a role for admin users — if you create a role that filters data and an admin is assigned to it, they also see filtered data. Create an explicit 'All Data' role with no filter for admins.",
    "RLS filter on the wrong table — if your role filters the Date table instead of the Orders table, the filter may not propagate correctly through relationships.",
    "Assuming RLS protects the underlying dataset — RLS protects report views, not the dataset itself. Users with Build access to a dataset can query it directly via Analyse in Excel.",
    "Not testing with a real user email — always test dynamic RLS by logging into Power BI Service as the actual user, not just with 'View as'.",
  ],
  debug_help: `**RLS not filtering data in Desktop?**
- Modelling → View as → confirm you selected the role and it shows as active
- Check your DAX filter syntax — DAX is case-sensitive for column names
- Verify the column name in the filter matches exactly: [Region] not [region]

**USERPRINCIPALNAME() returning blank in Desktop?**
- This is expected — Desktop has no logged-in user
- Test by replacing USERPRINCIPALNAME() with a hardcoded email temporarily:
\`\`\`dax
[Region] = LOOKUPVALUE(UserMapping[Region], UserMapping[Email], "alice@company.com")
\`\`\`

**RLS not propagating to related tables?**
- Check relationship direction in the Model view
- For RLS to propagate from Orders to Products, the relationship must flow in that direction
- Use bidirectional cross-filtering only when necessary (it has performance implications)`,
  ai_assist: `**Prompts that work:**
- "Write the DAX filter expression for a dynamic RLS role that restricts a salesperson to see only orders they created, using a UserMapping table with columns [Email] and [SalespersonID]."
- "Explain how RLS filter propagation works through Power BI relationships. If I filter the Orders table, which related tables are automatically filtered?"
- "What is the difference between 'Member' and 'Admin' workspace roles in Power BI, and how do they interact with RLS?"
- "How do I test dynamic RLS in Power BI Service without creating a separate test account?"`,
  stretch: [
    "Implement object-level security (OLS) in Power BI — hide a sensitive column (e.g. Profit) from a specific role entirely.",
    "Build a dynamic RLS model for a hierarchy: Regional Managers see their region, Directors see all regions in their division, CEO sees everything.",
    "Read the Microsoft documentation on RLS with Analysis Services — understand how RLS is enforced at the dataset level vs the report level.",
    "Explore Power BI Embedded — understand how RLS works when embedding reports in a third-party application using service principal auth.",
  ],
});

// W4: Superstore BI v0.4 — Refresh + data gateway
rewriteWeek("bi-analytics", 4, {
  context: `A dashboard that doesn't refresh is a snapshot, not a BI tool. Data refresh is what makes Power BI a living reporting system — reports update automatically as the underlying data changes, without anyone manually re-uploading a file.

Power BI has two refresh paths: cloud data sources (SQL databases in Azure, BigQuery, Snowflake) refresh directly from the Service with stored credentials. On-premise data sources (a local SQL Server, an Excel file on a company network drive) require a Power BI Gateway — software installed on a machine in the corporate network that acts as a secure bridge between Power BI Service in the cloud and data sources on-premise.

This week you configure scheduled refresh in the Power BI Service and understand the gateway architecture. You also learn incremental refresh — the pattern that refreshes only new/changed data instead of reloading the entire dataset, which is critical for large data sources.`,
  pre_flight: `**Publish a report to Power BI Service:**
- In Power BI Desktop: Home → Publish → select your workspace
- Go to app.powerbi.com → My Workspace → find your dataset

**Configure scheduled refresh (cloud source):**
1. Click the dataset → Settings (⚙️)
2. Data source credentials → Edit credentials → enter connection details
3. Scheduled refresh → toggle On → set frequency (daily, hourly)
4. Save

**Power BI Gateway (for on-premise sources):**
Download: https://powerbi.microsoft.com/en-us/gateway/
Install on a machine that can reach both the internet and your data source.
In the Service: Settings → Manage gateways → connect your gateway

**Incremental refresh setup (requires Pro/Premium):**
\`\`\`
1. Add RangeStart and RangeEnd parameters (DateTime type) to your query
2. Filter your date column: Date.IsInRange([DateColumn], RangeStart, RangeEnd)
3. In Power BI Desktop: right-click table → Incremental refresh
4. Set: store X years, refresh last Y days
\`\`\``,
  mastery_questions: [
    "What is the difference between Import mode and DirectQuery mode in Power BI? What are the refresh implications of each?",
    "A company has a SQL Server database on their corporate network. How does Power BI Service connect to it? Walk me through the architecture.",
    "What is incremental refresh and why is it important for large datasets? What parameters does it require?",
    "A report's scheduled refresh fails at 6am every day. What are the 3 most likely causes?",
    "What is the difference between dataset refresh and report refresh in Power BI?",
  ],
  common_mistakes: [
    "Not refreshing credentials after a password change — if the data source password rotates, the gateway credential must be updated manually or the refresh fails.",
    "Setting refresh frequency too high — Power BI Pro allows 8 refreshes per day. Refreshing hourly on a dataset that changes daily wastes capacity.",
    "Not monitoring refresh history — Power BI logs every refresh attempt with success/failure status and error messages. Check Settings → Refresh history after each failure.",
    "Using Import mode for real-time dashboards — Import mode refreshes on a schedule (minimum 30-minute intervals on Pro). For real-time data, use DirectQuery or streaming datasets.",
    "Not testing gateway connectivity before setting up production refresh — always test the gateway connection manually from the Service before scheduling.",
  ],
  debug_help: `**Scheduled refresh failing?**
- Dataset → Settings → Refresh history → read the error message
- Common errors:
  - 'Credentials expired': re-enter data source credentials
  - 'Gateway not reachable': check gateway machine is on and gateway service is running
  - 'Query timeout': query takes too long — optimise the SQL or use incremental refresh

**Gateway not appearing in Service?**
\`\`\`
1. Ensure gateway is installed and running: Windows Services → 'Power BI Gateway'
2. Gateway must be signed in with the same Microsoft account as the workspace owner
3. Check firewall: gateway needs outbound HTTPS access on port 443
\`\`\`

**Incremental refresh not reducing refresh time?**
- Ensure your date filter uses RangeStart/RangeEnd parameters (exact names required)
- The filter must be applied before the data is loaded (in Power Query, not DAX)
- Publish to Premium capacity for true partition-based incremental refresh`,
  ai_assist: `**Prompts that work:**
- "Explain the Power BI Gateway architecture. What does the gateway do, where is it installed, and how does traffic flow between the gateway and Power BI Service?"
- "What is the difference between Personal Gateway and Standard (Enterprise) Gateway in Power BI?"
- "Walk me through configuring incremental refresh for a 3-year sales table where I want to keep all data but only refresh the last 7 days."
- "My Power BI refresh fails with 'Data source error: The server was not found'. What do I check first?"`,
  stretch: [
    "Set up a real incremental refresh on a dataset with at least 100k rows — measure the refresh time before and after.",
    "Configure email notifications for refresh failures: Service → Dataset → Settings → Take over → set notification preferences.",
    "Explore Power BI Dataflows — understand how they act as a managed ETL layer between data sources and datasets.",
    "Read about Power BI Premium capacity and how it changes refresh limits (48 refreshes/day vs 8 on Pro).",
  ],
});

// W5: Power BI Fundamentals
rewriteWeek("bi-analytics", 5, {
  context: `You have been using Power BI to build Superstore reports for 4 weeks. This week you close the gaps — learning the fundamentals you may have skipped over while focused on features. The fundamentals that most analysts skip and then spend years trying to fix: data modelling, DAX basics, and the semantic layer.

Power BI's architecture has three layers: data (Power Query — Extract, Transform, Load), model (relationships, hierarchies, measures), and report (visuals, interactions). Most analysts work only in the report layer and wonder why their numbers are wrong. Your numbers are wrong because of mistakes in the model layer.

DAX (Data Analysis Expressions) is the formula language for measures. Measures are not calculated columns — a measure is a formula that responds to filter context. Understanding filter context is the single most important concept in Power BI. Every wrong number you see in a report is a filter context problem.`,
  pre_flight: `**Power BI data model basics:**
- Star schema: one fact table (Orders), multiple dimension tables (Customers, Products, Dates)
- Relationships: one-to-many, from dimension to fact table
- Always have a Date table — don't rely on auto date/time

**Create a proper Date table in DAX:**
\`\`\`dax
DateTable =
ADDCOLUMNS(
    CALENDAR(DATE(2020,1,1), DATE(2025,12,31)),
    "Year", YEAR([Date]),
    "Month", MONTH([Date]),
    "MonthName", FORMAT([Date], "MMMM"),
    "Quarter", "Q" & QUARTER([Date]),
    "WeekNum", WEEKNUM([Date])
)
\`\`\`

**Core DAX measures:**
\`\`\`dax
Total Sales = SUM(Orders[Sales])
Total Profit = SUM(Orders[Profit])
Profit Margin = DIVIDE([Total Profit], [Total Sales], 0)
YTD Sales = TOTALYTD([Total Sales], DateTable[Date])
PY Sales = CALCULATE([Total Sales], SAMEPERIODLASTYEAR(DateTable[Date]))
Sales Growth = DIVIDE([Total Sales] - [PY Sales], [PY Sales], 0)
\`\`\``,
  mastery_questions: [
    "What is the difference between a measure and a calculated column in Power BI? When should you use each?",
    "Explain filter context in DAX. If a slicer is set to 'West Region', what happens inside a CALCULATE() expression?",
    "What is a star schema and why is it the preferred data model for Power BI? What problems does a flat table model cause?",
    "What does CALCULATE() do in DAX? Write a measure that calculates sales for only the 'Technology' category regardless of any category slicer.",
    "Why do you need a dedicated Date table instead of using the date column in your fact table?",
  ],
  common_mistakes: [
    "Using calculated columns instead of measures for aggregations — calculated columns compute once at load time and are stored in memory. Measures compute dynamically based on filter context. Use measures for any aggregation.",
    "Building a flat table model instead of a star schema — joining everything into one wide table makes DAX harder and reports slower. Split into fact and dimension tables.",
    "Not marking the Date table as a Date table — Power BI won't use time intelligence functions (TOTALYTD, SAMEPERIODLASTYEAR) correctly unless you mark the table: Table tools → Mark as date table.",
    "Using SUM instead of SUMX when you need row-by-row calculation — SUM adds a column; SUMX evaluates a row expression and then sums the results.",
    "Not using DIVIDE() instead of / for division — DIVIDE(numerator, denominator, 0) handles division by zero gracefully. The / operator returns an error.",
  ],
  debug_help: `**Measure returning wrong total?**
-- Add a matrix visual with the measure across rows and columns
-- The total row is calculated in a different filter context than individual cells
-- If totals are wrong, you likely need SUMX or CALCULATE to handle the aggregation correctly

**TOTALYTD not working?**
\`\`\`dax
-- Ensure DateTable is marked as Date Table
-- The date column in TOTALYTD must be from the marked Date Table
YTD Sales = TOTALYTD([Total Sales], DateTable[Date])
-- Not:
YTD Sales = TOTALYTD([Total Sales], Orders[OrderDate])  -- wrong
\`\`\`

**Relationship not filtering correctly?**
-- Check relationship direction in Model view (arrow direction)
-- Single-direction: filter flows from the 'one' side to the 'many' side
-- Check cardinality: ensure the join key is unique on the dimension side`,
  ai_assist: `**Prompts that work:**
- "Explain filter context and row context in DAX. Give a specific example where confusing the two causes a wrong result."
- "I need a DAX measure that calculates the % of total sales each product contributes, while still responding to region slicers. Write this measure and explain why it needs ALL()."
- "What is the difference between CALCULATE and CALCULATETABLE in DAX?"
- "My profit margin measure shows the correct % for individual rows but shows a wrong total in the matrix. Why does this happen and how do I fix it?"`,
  stretch: [
    "Build a complete star schema model from Superstore data: Orders fact table, plus separate Customers, Products, Dates, and Geography dimension tables.",
    "Implement a complete time intelligence set: YTD, YOY growth %, rolling 3-month average — all as DAX measures.",
    "Complete the Microsoft Learn 'Model data in Power BI' path (free): https://learn.microsoft.com/en-us/training/paths/model-power-bi/",
    "Explore context transition in DAX — understand what happens inside CALCULATE when used with SUMX.",
  ],
});

console.log("\nAll done — bi-analytics W1-W5 applied.");
