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

// W16: Capstone Project — Week 1: Design and Build
rewriteWeek("bi-analytics", 16, {
  context: `The capstone is a complete, end-to-end BI project using a real dataset of your choice. Not Superstore — you have been building with that for 15 weeks. This week you choose a domain you care about (sports, finance, health, your own business data, public government data), source the data, design the data model, and build the first version of the report.

The deliverable is not a finished dashboard — it is a working prototype with a clear analytical question at its centre. Good BI projects start with a question: "What drives customer churn?", "Which products are dragging down overall margin?", "Where in the funnel are we losing users?" Every visual in the report should answer part of that question.

This week is design-heavy. Before you open Power BI, you sketch the report layout on paper or in Figma, define your measures, and verify your data model is correct. Skipping the design phase produces dashboards that look like they were assembled by someone clicking around — because they were.`,
  pre_flight: `**Dataset sources (choose one you care about):**
- Kaggle datasets: https://www.kaggle.com/datasets (filter by CSV, 10k-500k rows)
- Our World in Data: https://ourworldindata.org/ (public health, development)
- Sports Reference: https://www.sports-reference.com/ (football, basketball, etc.)
- Your own business data: export from a tool you use (Shopify, Stripe, Google Analytics)
- World Bank Open Data: https://data.worldbank.org/

**Capstone design checklist (complete before touching Power BI):**
\`\`\`markdown
## Capstone Design Doc

### Analytical Question
[One sentence: "What question does this report answer?"]

### Target Audience
[Who will use this? What decisions do they make?]

### Data Sources
- Source 1: [name, format, rows, date range]
- Source 2: [if applicable]

### Data Model
- Fact table: [name, grain, key measures]
- Dimension tables: [list with key attributes]

### Report Pages (sketch each on paper)
- Page 1: [title, 3-4 visuals planned]
- Page 2: [drillthrough or detail page]

### Key Measures (list DAX measures you will write)
- [Measure 1]: [plain English description]
- [Measure 2]: ...
\`\`\``,
  mastery_questions: [
    "What analytical question is your capstone answering? How will you know if the report successfully answers it?",
    "Describe your data model: what is the fact table, what is its grain, and what are the dimension tables?",
    "What are the 3 most important measures in your report? Write the DAX for each before building.",
    "How have you designed the report for your target audience? What did you include or exclude based on who will use it?",
    "What is the biggest data quality issue in your dataset and how are you handling it?",
  ],
  common_mistakes: [
    "Starting with the visuals instead of the question — if you don't know what question you're answering, every visual decision is arbitrary.",
    "Choosing a dataset that is too clean — real data has nulls, duplicates, type mismatches, and inconsistent naming. Cleaning it is part of the project.",
    "Building a model with too many tables before validating the relationships — start with 2-3 tables, verify relationships work, then add more.",
    "Not defining measures before building — writing measures after placing visuals leads to workarounds. Define your core measures first and build visuals around them.",
    "Trying to include everything — scope down. A focused report that answers one question well is better than a sprawling report that answers nothing clearly.",
  ],
  debug_help: `**Data cleaning issues in Power Query:**
\`\`\`
- Inconsistent date formats: Transform → Date → Parse
- Duplicate rows: Home → Remove Duplicates
- Null handling: Replace Values → replace null with 0 or 'Unknown'
- Text case inconsistency: Transform → Format → UPPERCASE / Capitalize Each Word
- Extra spaces: Transform → Format → Trim
\`\`\`

**Relationship not working as expected?**
- Open Model view and verify cardinality (1:*, *:1, 1:1)
- Check that the join key has no duplicates on the 'one' side
- Check data types match exactly (whole number vs text)

**Measure returning blank instead of 0?**
\`\`\`dax
-- Wrap with COALESCE or IF
Total Sales = COALESCE(SUM(Orders[Sales]), 0)
-- Or use + 0
Total Sales = SUM(Orders[Sales]) + 0
\`\`\``,
  ai_assist: `**Prompts that work:**
- "I am building a BI report using [dataset description]. Here is my draft design doc: [paste doc]. Review it and tell me what is missing or unclear."
- "My capstone dataset has [describe columns]. What are the 5 most insightful questions I could answer with this data?"
- "Write the DAX measures I need for: [describe your key metrics]. Include the table and column names: [paste schema]."
- "I want to clean this column in Power Query: [describe the mess]. What steps should I apply?"`,
  stretch: [
    "Conduct a stakeholder interview (even with a friend or family member in the relevant domain) to validate your analytical question before building.",
    "Build a data dictionary for your capstone dataset — define every column, its data type, example values, and any known quality issues.",
    "Create a wireframe for your report in Figma or on paper before opening Power BI — share it for feedback.",
    "Write unit tests for your key DAX measures: create a test page with matrix visuals that verify each measure against manually-calculated expected values.",
  ],
});

// W17: Capstone Project — Week 2: Complete and Present
rewriteWeek("bi-analytics", 17, {
  context: `The capstone is complete this week. You finish building, polish the report, and deliver a presentation. The presentation is the most important part — a BI report that nobody understands is a failed report regardless of how good the DAX is.

Your presentation has two audiences: a technical peer (who wants to know about the data model, measures, and data quality decisions) and a business stakeholder (who wants to know the answer to the analytical question and what action to take). Practise both.

The other deliverable this week is a written retrospective: what worked, what you would do differently, and what skills you want to develop next. A BI analyst who can reflect honestly on their own work and identify gaps grows faster than one who treats every project as complete.`,
  pre_flight: `**Report polish checklist:**
\`\`\`markdown
## Pre-Presentation Checklist

### Data Quality
- [ ] All nulls handled with explicit decisions (filled, dropped, flagged)
- [ ] Date column correctly typed and marked as Date table
- [ ] Relationships verified (no inadvertent many-to-many)
- [ ] All measures spot-checked against source data for 3 known values

### Report Design
- [ ] Every page has a clear title stating its purpose
- [ ] Every visual has an axis label, legend, and title
- [ ] Colour palette is consistent and accessible (test with colour blindness simulator)
- [ ] No more than 5-6 visuals per page
- [ ] Primary metric is the largest or most prominent element on the page

### Performance
- [ ] Report loads in under 5 seconds (Import mode)
- [ ] No unnecessary columns imported (remove unused columns in Power Query)
- [ ] Calculated columns moved to measures where possible

### Accessibility
- [ ] Alt text added to all visuals (Format → General → Alt text)
- [ ] No information conveyed only by colour
\`\`\`

**Presentation structure (10 minutes):**
1. Context (1 min): what question are you answering and for whom?
2. Data overview (1 min): what data did you use and what were the key quality issues?
3. Key findings (5 min): walk through 3-5 insights, one page at a time
4. Recommendation (2 min): based on the data, what should the audience do?
5. Q&A (1 min): demo the interactivity`,
  mastery_questions: [
    "What is the most important insight you found in your capstone data? How confident are you in it and what would invalidate it?",
    "Walk me through your data model — fact table, dimension tables, relationships, and the grain of each table.",
    "What data quality issues did you find and how did you handle each? What impact do they have on the validity of your analysis?",
    "What would you build next if you had another week? What question does this report not yet answer?",
    "If a stakeholder challenged one of your findings, how would you defend or update your analysis?",
  ],
  common_mistakes: [
    "Presenting data without a narrative — don't click through charts. Tell a story: 'we started by looking at X, which revealed Y, which led us to investigate Z'.",
    "Demoing a live report without testing it first — always demo with the report pre-loaded in the Service, not loading in Desktop during the presentation.",
    "Not handling challenges gracefully — 'that's a great question, I'll investigate and follow up' is a professional answer. Making up data to fill a gap is not.",
    "Skipping the recommendation — every BI presentation should end with a clear 'so, here is what I recommend'. Without it, the data just sits there.",
    "Not archiving the project — store the .pbix, data source files, and all SQL/Python code in a git repository. You will reference this project in interviews for years.",
  ],
  debug_help: `**Report too slow in Service?**
\`\`\`
- Check dataset size: Service → Dataset → Settings → Storage mode
- Remove unused columns: Power Query → select columns → Remove Other Columns
- Remove unused tables entirely
- Replace calculated columns with measures where possible
\`\`\`

**Colour blind accessibility check:**
- Use Coblis tool: https://www.color-blindness.com/coblis-color-blindness-simulator/
- Avoid red/green combinations as primary signal colours
- Use pattern + colour (not colour alone) to distinguish data series

**Presentation nerves?**
Practise the 10-minute walkthrough 3 times before the real thing.
Record yourself once — you will immediately spot things to improve.`,
  ai_assist: `**Prompts that work:**
- "Review my capstone report summary: [paste description]. What questions would a hiring manager ask that I should prepare to answer?"
- "Help me write the executive summary slide for my capstone: the analytical question is [X], the key finding is [Y], and the recommendation is [Z]."
- "What makes a BI portfolio project stand out to a hiring manager? Review my project description: [paste]."
- "Write a retrospective for my BI capstone project: what went well [list], what I'd improve [list], and what I want to learn next [list]."`,
  stretch: [
    "Present your capstone to at least one real person (friend, family member, or colleague) and collect specific feedback — written, not just 'looks good'.",
    "Publish your capstone to Power BI Service and write a LinkedIn post about the project and your key finding — link to the report.",
    "Write a 500-word retrospective: what was hard, what surprised you, what you would do differently, and what BI skill you want to develop next.",
    "Apply for at least 2 BI analyst roles this week and use your capstone as the portfolio piece — adapt your CV to highlight the skills demonstrated in it.",
  ],
});

console.log("\nAll done — bi-analytics W16-W17 applied.");
