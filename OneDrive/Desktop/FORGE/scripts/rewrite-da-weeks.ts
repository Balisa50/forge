/**
 * Rewrites context + mastery_questions for data-analysis.json
 * Run: npx tsx scripts/rewrite-da-weeks.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const FILE = resolve(process.cwd(), "data/roadmaps/data-analysis.json");
const roadmap = JSON.parse(readFileSync(FILE, "utf-8"));

const UPDATES: Record<number, { context: string; mastery_questions: string[] }> = {

  1: {
    context: `Every business in the world runs on spreadsheets. Somewhere right now, a VP of Sales is staring at a pivot table trying to figure out why the South region keeps missing targets. A product manager is arguing with Finance about which sub-categories to kill. A new analyst — maybe exactly like you — is about to tell them the answer.\n\nThis week you are that analyst. You will dig into Sample Superstore — four years of real sales data for a fictional retailer — and answer three questions that a real VP might actually act on. By Sunday you will have a dashboard they could read in thirty seconds and a one-page memo that leads with the recommendation.\n\nYou do not need to know Excel. Every step is shown. But pay attention to the business logic, not just the clicks — because the skill you are building is not "press this button", it is "tell me what the data means."`,
    mastery_questions: [
      "You opened the Superstore file. Run =COUNTA(Orders!A:A)-1 in an empty cell. How many orders are in this dataset? Paste the number. This is the entire history you are analysing.",
      "Build the margin pivot: Sub-Category in rows, SUM of Profit as value, sorted descending. Paste the top 3 Sub-Categories and their total profits. These are the crown jewels of this business.",
      "Now find the worst. Which Sub-Category has the largest total loss? Paste the name and the loss amount. If you were the VP of Merchandising, would you kill this product line?",
      "Do higher discounts actually kill profit? Build a SUMIF-based comparison of average margin at 0% discount vs 30%+ discount. Paste both numbers. This is one of the most important questions in retail analytics.",
      "Year-over-year: which Region grew Sales the most from 2022 to 2023? Paste the region name and the growth percentage. This tells leadership where to invest.",
      "Furniture paradox: Chairs profit, Tables lose money. Paste the total profit for each Furniture sub-category. Which single sub-category is dragging the whole Furniture category into the red?",
      "Top customer hunt: use SUMIF to total Sales per Customer ID. Paste the name of the #1 customer and their total spending. What fraction of total company revenue do they represent?",
      "Your dashboard is live. Paste a screenshot showing Total Sales, Total Profit, and Profit Margin %. Is the margin healthy for a retailer — 5%, 20%, 50%? What is typical?",
      "Read your memo's Recommendation section aloud. Is it specific enough to act on tomorrow? Paste your top recommendation in one sentence. Does it include a specific action and a specific number?",
      "Push the superstore-analysis repo to GitHub. Paste the URL. You just shipped your first analyst deliverable."
    ]
  },

  2: {
    context: `You just spent a week clicking through pivot tables. Now imagine doing that exact same analysis on 100,000 rows — on next month's data — on a hundred different clients — automatically, at 2am, without touching a single cell.\n\nThat is Python.\n\nThis week you rebuild your entire Superstore analysis from scratch in pandas. Same questions, same answers — but in code that runs in seconds and can be rerun on any new data file with zero extra work. By Friday you will have a monthly_report.py that your fictional boss could run on the 1st of every month.\n\nIf you just finished the Excel version, the pivot tables will look familiar. That familiarity is the point — the thinking is the same. Python is just a much faster pen.`,
    mastery_questions: [
      "You loaded the Superstore file with pandas. Paste df.shape. Does the row count match what you saw in Excel? What does each column represent?",
      "You rebuilt the margin pivot in pandas. Paste the top 5 Sub-Categories by profit margin. Do the rankings match your Excel pivot EXACTLY? If not — why not?",
      "In one groupby chain, compute year-over-year Sales growth by Region. Paste the result table. How many lines of Python vs how many clicks in Excel?",
      "pandas revealed something: run df.groupby('Sub-Category')['Profit'].sum().sort_values(). Paste the bottom 3. Does Tables still appear? Is the exact loss amount the same as in Excel?",
      "You built monthly_report.py. Run it: python monthly_report.py. Paste the 3-line summary it prints. How long would the manual Excel version of this report take each month?",
      "Find one question Excel made hard but pandas made easy. Paste your code and the result. A good example: top 10 customers by total Sales, sorted, in 2 lines.",
      "Save the margin bar chart as a PNG. Paste the filename. This chart can now be dropped into any report, email, or Slack message automatically — no screenshot needed.",
      "Convert the Excel file to parquet: df.to_parquet('superstore.parquet'). Paste both file sizes. Which format is smaller? Why does this matter for large datasets?",
      "Push the pandas version to your superstore-analysis repo. Paste the commit URL. You now have an automated analysis pipeline — that is a meaningful upgrade to your analyst toolkit.",
      "When would you choose Python over Excel? Write 2 sentences — think about data size, repetition, and collaboration. When would you still choose Excel?"
    ]
  },

  3: {
    context: `Last week you answered three broad questions about the Superstore. This week you dig into one of the most important questions in all of retail analytics: does discounting actually grow profit, or eat it alive?\n\nIntuitively, discounts seem like a good deal. Lower prices drive more sales, more sales drive more revenue, more revenue drives more profit. But in your Superstore data, that logic falls apart above a certain discount level — and finding exactly where it falls apart is the kind of analysis that changes a company's pricing strategy.\n\nBy Sunday you will have the "tipping point" — the discount percentage above which profit reliably goes negative — for each product category. That finding is worth a PowerPoint slide in a real boardroom.`,
    mastery_questions: [
      "Run =CORREL(Discount_column, Profit_column) on the full Orders dataset. Paste the correlation value. Now filter to just Furniture and run it again. Paste both. Did the relationship change?",
      "You found the discount tipping point: the bucket where average profit crosses from positive to negative. Paste the exact discount bucket and which category it applies to first.",
      "Discover the smart-discount sub-category: is there ANY Sub-Category where giving higher discounts came with higher profit margin? Paste your finding — name it if yes, write 'none found' if no.",
      "Build the cross-section pivot: Category × Discount Bucket, values = SUM Profit. Apply red conditional formatting where profit is negative. Paste a screenshot. Which category is most destroyed by discounts?",
      "Find the single worst order in the dataset by total Profit. Paste the Order ID, Customer Name, Sub-Category, Discount level, and Profit amount. What happened here?",
      "Compare 2020 vs 2023: run the CORREL between Discount and Profit for each year separately. Paste both values. Did the discount-profit relationship get worse over time?",
      "For each Category, compute the average margin at 0% discount vs 30%+ discount. Paste the 3-row comparison table. Which category is most sensitive to discounting?",
      "Your tipping point finding: write ONE recommendation in one sentence with one specific number. This is the sentence you would say in a meeting before showing any charts.",
      "Push memo v2 PDF — with the discount scatter chart and your tipping-point recommendation. Paste the GitHub URL.",
      "Push a v0.2 tag. Paste the release URL. You just turned a dataset observation into a business recommendation."
    ]
  },

  4: {
    context: `10% of your customers generate 60% of your revenue. This is not a guess — it is Pareto's principle, and it is remarkably consistent across almost every business on earth.\n\nThis week you find YOUR 10% in the Superstore data. You will compute customer lifetime value, segment customers by total spending, and answer the question that every marketing team wants answered: what makes a VIP customer different from a casual one?\n\nCustomer analysis is one of the highest-impact things an analyst does. It tells sales where to focus, marketing who to target, and product which features to build. After this week, you will have the skills to do it for any business with a transaction history.`,
    mastery_questions: [
      "You computed CLV for each customer. Paste the top 5 customers by total lifetime Sales with their names and amounts. How much more does the #1 customer spend than the #50 customer?",
      "You segmented customers into VIP (>$5k), Regular ($1k-$5k), and Casual (<$1k). Paste the count and percentage of customers in each bucket. Does the Pareto principle hold — does the top 10% drive ~60% of sales?",
      "VIPs are different. Build a Sub-Category pivot for VIPs only vs Casuals only. Paste both top-3 Sub-Categories. What do VIPs buy that Casuals do not?",
      "Retention decay: what percentage of first-time buyers came back for a second order? What percentage reached 5 orders? Paste the decay table. What does this curve tell the business about loyalty?",
      "Find one VIP customer with NEGATIVE total profit across all their orders. Paste their name and total profit. What does this mean — should the business fire this customer?",
      "Compute the average discount given to VIPs vs Casuals. Paste both. Is the business discounting more to its best customers — and is that helping or hurting?",
      "Which Region has the highest proportion of VIP customers? Paste the Region name and the VIP percentage. What would you recommend the business do differently in the other regions?",
      "Build a CLV forecast: if VIPs continue at their historical rate, what will each tier contribute to next year's Sales? Paste the 3-row forecast table.",
      "Write the memo section on customer segmentation — 3 bullet points, each with a specific number and a specific recommendation. Paste it.",
      "Push a v0.3 tag to superstore-analysis. Paste the release URL. Customer segmentation is now in your portfolio."
    ]
  },

  5: {
    context: `Your Excel pivots answer questions. But they are locked in a file on your laptop. Real business data lives in databases — and to get it out, you write SQL.\n\nThis week you rewrite your entire Superstore analysis in SQL. Every pivot, every calculation, every sub-category ranking — rebuilt as a query. You will discover something interesting: some things that were easy in Excel become very elegant in SQL, and some things that were one click in a pivot table require a window function in SQL.\n\nUnderstanding both is what makes you a complete analyst. By Sunday you will have a file of 10 queries that tell the Superstore story entirely in SQL.`,
    mastery_questions: [
      "You loaded the Superstore data into SQLite. Run SELECT COUNT(*) FROM orders. Paste the result. Does it match your Excel row count?",
      "Rewrite the margin-by-sub-category analysis in SQL. Paste the query and the top 5 results. Does it match your Excel/pandas pivot exactly?",
      "Rewrite the regional YoY growth query. Paste the SQL. How many lines vs the Excel version?",
      "Use ROW_NUMBER() OVER (PARTITION BY ...) to get the top 2 most profitable Sub-Categories per Region. Paste the query. This is impossible in a single Excel pivot.",
      "Write a CTE that first computes total sales per customer, then ranks customers by tier (VIP/Regular/Casual). Paste the query and 5 sample rows.",
      "Find the discount tipping point in SQL: average profit by discount bucket. Paste the query and result. Does it match your Excel finding from Week 3?",
      "Write a query that finds customers who ordered in 2022 but NOT in 2023 (lost customers). Paste the query and the count. What should the business do with this list?",
      "Validate: run the same profitability analysis in SQL and pandas. Do the results match exactly? Paste both outputs and yes/no.",
      "Write a query that finds the Sub-Categories with the highest STANDARD DEVIATION of profit across orders. Paste the query and top 3 results. What does high variance mean for pricing?",
      "Commit queries.sql with 10 commented queries to your superstore-analysis repo. Paste the file URL on GitHub."
    ]
  },

  6: {
    context: `You have been making claims all month. "The West region grew fastest." "Tables lose money." "VIP customers buy more technology." These claims feel true because the numbers support them. But could they be random noise?\n\nThis week you learn to answer that question with statistical rigour. Confidence intervals, p-values, t-tests, and chi-square tests — applied directly to your Superstore data. By Sunday every claim in your analysis will either be supported by a significance test or will be qualified with "this trend is too small to be conclusive."\n\nAnalysts who include statistical tests in their findings are trusted more than analysts who do not. This is the difference between "I think" and "the data shows."`,
    mastery_questions: [
      "Compute the 95% confidence interval for mean profit per order. Paste [low, high]. If you ran this analysis on next year's data, should you expect the mean to fall in this range?",
      "Run a t-test comparing profit per order in the West vs East regions. Paste the p-value. Is the difference statistically significant? What does p < 0.05 mean in plain English?",
      "Compute Cohen's d for the same West vs East comparison. Paste the value and whether it is a small, medium, or large effect. Why does effect size matter alongside p-value?",
      "Run a chi-square test: is Segment (Consumer/Corporate/Home Office) associated with Ship Mode choice? Paste the chi2 and p-value. Are they independent?",
      "Apply Bonferroni correction to 6 pairwise region comparisons. Which pairs remain significant after correction? Which ones were only significant before correction?",
      "Bootstrap the mean Sales per order with 1000 resamples. Paste the 95% bootstrap CI. Does it match the t-distribution CI?",
      "Run a one-way ANOVA across 3 Segments on profit per order. Paste F-statistic and p-value. What does a significant F mean — and what does it NOT tell you?",
      "Find a finding in your Superstore analysis that LOOKS meaningful but does NOT survive a significance test. Paste the claim and the p-value that invalidates it.",
      "What is the difference between practical significance and statistical significance? Give one concrete example from your data where they differ.",
      "Commit a statistics notebook to your superstore-analysis repo. Paste the URL. Your analysis is now backed by real statistical tests — that is a professional level of rigour."
    ]
  },

  7: {
    context: `An analyst who uses AI well does the same work in a fraction of the time. In 2026, that speed advantage is what gets you promoted.\n\nThis week you integrate Claude, ChatGPT, and Cursor into your analyst workflow — not as a crutch, but as a force multiplier. You will use AI to generate Excel formulas you have never seen before, explain statistical concepts in plain English, write the boring parts of your memos, and debug pandas errors in seconds.\n\nThe goal is not to let AI think for you. The goal is to spend your time on the parts that require your judgment — interpreting results, making recommendations, understanding the business — and offload the mechanical parts.`,
    mastery_questions: [
      "You described a business question to Claude and it wrote an Excel formula you did not know. Paste the formula and what it calculates. Did it work first try?",
      "Use the ROLE pattern: 'You are a senior retail analyst reviewing my Superstore memo. What are the 3 weakest recommendations?' Paste the AI's critique. Do you agree?",
      "Generate a SQL query with AI from a plain-English question about the Superstore. Paste the question, the query, and whether it returned the right result.",
      "Paste a pandas error into Claude. Paste the AI's explanation of the error and the fix. How long did this take vs googling it?",
      "prompts.md: paste your best and worst prompt of the week. What made the best one work? What went wrong with the worst one?",
      "Use AI to draft the 'Recommendations' section of your Superstore memo. Paste the draft and your edited version. What did you change — and why?",
      "Ask AI to explain p-values in plain English in 3 sentences. Paste the response. Is it accurate? Is it something you could use in a meeting?",
      "Use Cursor to write a function that automatically formats a pandas DataFrame as a Markdown table. Paste the generated code. Does it work?",
      "What is one type of analyst task where AI consistently fails or misleads? Write 2 sentences about why it fails there.",
      "What did you do 3x faster this week because of AI? Write 2 sentences. What would you NOT trust AI to do unsupervised?"
    ]
  },

  8: {
    context: `A 1-page memo works for a VP. An executive deck works for a board. And the two are completely different documents.\n\nExecutives in meetings have 5 minutes per slide, are simultaneously thinking about three other things, and will remember one thing from your presentation — if you are lucky. Your job this week is to build a 5-slide executive deck that makes your Superstore findings unavoidable.\n\nNo data on every slide. No walls of text. One chart per slide, one insight per chart, one recommendation per section. This is a harder skill than the analysis — and it is the one that gets analysts promoted.`,
    mastery_questions: [
      "Slide 1 is your 'So what' slide — the single most important finding in one sentence and one chart. Paste a screenshot. Would an executive immediately understand the problem?",
      "Slide 2 shows the evidence for your top recommendation. Paste a screenshot. Does it take more than 10 seconds to read?",
      "Slide 3 shows the second-most important finding. Paste a screenshot. Is there ANY text that could be cut without losing meaning?",
      "Slide 4 shows the action plan: 3 specific recommendations with owners and timelines. Paste a screenshot. Are the recommendations specific enough to assign to a person?",
      "Slide 5 is the appendix — the pivot tables and details for anyone who wants them. Paste a screenshot. This is where the analyst hides the complexity.",
      "You presented the deck to one person (friend, family, AI in roleplay mode). Paste their first question. Was it a question you expected?",
      "Apply their feedback. Paste the commit. What did you change and why does it make the deck more effective?",
      "What is the 'pyramid principle' in business communication? Write 3 sentences. How does it apply to your Slide 1?",
      "Export the deck as PDF. Paste the PDF URL in your GitHub repo. Does it render cleanly?",
      "Push superstore-deck.pdf to your superstore-analysis repo. Paste the commit URL. You just added an executive communication example to your portfolio."
    ]
  },

  9: {
    context: `The Superstore project is done technically. This week you make it done professionally.\n\nSame discipline as every project polish week: clean the code, write the README as if 1000 people will read it, get one external person to review it, write an honest retro, and ship with a v1.0 tag.\n\nYou have built four capabilities in the Superstore project: Excel analysis, Python automation, SQL queries, and an executive deck. Make sure the README tells that story clearly. Someone who finds your repo should understand exactly what was built, why it was built, and what they can learn from it.`,
    mastery_questions: [
      "Your README tells the complete story: what the Superstore is, what questions you answered, what tools you used, what you found. Paste the first paragraph. Does it hook a stranger in the first sentence?",
      "All Excel/Sheets calculations are reproducible from scratch. Paste the 'How to reproduce' section of your README. How many steps does it take?",
      "Every Python function has a docstring. Paste one example. Does it describe inputs, outputs, and what the function does?",
      "Profile your slowest pandas operation. Paste the before/after time. What change made it faster?",
      "One person outside the programme reviewed your repo. Paste their feedback. What was the one thing they found confusing?",
      "Fix their critique. Paste the commit. Write one sentence about why the change matters.",
      "RETRO.md is committed. Paste one thing from the 'what I learned' section. What surprised you most about doing professional data analysis?",
      "Compare your Week 1 Excel skill to your current skill. What can you do now that you could not do 9 weeks ago? Write 3 sentences.",
      "Push v1.0. PROJECT 1 (SUPERSTORE) COMPLETE. Paste the GitHub release URL.",
      "You are a data analyst. You have 4 polished project files (Excel, Python, SQL, deck) to prove it. What is the next skill you want to build?"
    ]
  },

  10: {
    context: `Superstore was a retailer. This week you move to a completely different domain: HR analytics.\n\nEmployee attrition — people leaving a company — costs organisations enormous amounts of money. Replacing a skilled employee typically costs 50-200% of their annual salary when you factor in recruiting, training, and lost productivity. HR teams that can predict who is likely to leave before they leave can intervene early and potentially retain them.\n\nYou are going to use IBM's HR Analytics Employee Attrition dataset — a real-world style dataset with demographic information, job satisfaction scores, performance ratings, and attrition labels — and build an analysis that tells a Head of HR where to focus their retention budget.`,
    mastery_questions: [
      "You loaded the HR Attrition dataset. Paste df.shape and the attrition rate (% of employees who left). Is the class imbalanced — what does that mean for analysis?",
      "Plot the attrition rate by Department. Paste the chart. Which department loses the most employees? Does anything about that surprise you?",
      "Plot attrition rate by JobRole. Paste the chart. Which role has the highest attrition? Hypothesise one reason why.",
      "Run a correlation analysis between numeric features and attrition (as 0/1). Paste the top 5 most correlated features. Do these make intuitive sense?",
      "Plot attrition rate by MonthlyIncome bucket. Paste the chart. At what income level does attrition drop significantly? What does this tell the business about pay?",
      "Compare job satisfaction scores for employees who left vs stayed. Paste the boxplot. Is the difference large enough to be practically meaningful?",
      "What are the top 3 factors associated with attrition in this dataset? Write 3 sentences with specific numbers. Could a manager act on each of these?",
      "Your baseline model: predict 'no attrition' for everyone. Paste the accuracy. Why is this a misleading metric when classes are imbalanced?",
      "Push your hr-attrition repo with an exploratory notebook. Paste the repo URL. You have moved from retail analytics to HR analytics — the same skills, a new domain.",
      "Who is the stakeholder for this analysis? Write 2 sentences describing the Head of HR and what decision your analysis helps them make."
    ]
  },

  11: {
    context: `You found the patterns in attrition last week. Now you go deeper: which employees are AT RISK right now?\n\nTenure cohort analysis — tracking what happens to groups of employees hired at the same time — is one of the most powerful tools in HR analytics. It answers questions like: "Do employees who joined in 2021 leave faster than those who joined in 2019? And does that trend hold across all departments?"\n\nBy Sunday you will have a cohort attrition chart that looks like the kind of analysis an HR analytics team at a Fortune 500 would produce.`,
    mastery_questions: [
      "You computed tenure in years from YearsAtCompany. Paste the distribution as a histogram. What is the median tenure? Does the distribution look like what you would expect?",
      "Build cohort groups by years-at-company bucket (0-2, 2-5, 5-10, 10+). Compute attrition rate per cohort. Paste the result table. At what tenure is attrition highest?",
      "Plot the attrition hazard curve: the probability of leaving at each year of tenure. Paste the chart. Is there a specific year where employees are most at risk?",
      "Break the cohort analysis by Department. Paste the resulting heatmap. Which Department × tenure combination has the highest attrition risk?",
      "Do new employees (tenure < 1 year) have different attrition drivers than veterans (tenure > 5 years)? Run separate correlation analyses. Paste both top features. Are they different?",
      "Build a 'flight risk score' per employee: a weighted sum of the top 3 attrition predictors. Paste the distribution of flight risk scores. What threshold would you use to flag someone as high-risk?",
      "How many current employees fall in the high-risk bucket? Paste the count. What is the estimated financial cost of losing them (use a rough 100% salary replacement cost)?",
      "What ethical considerations apply to building a flight-risk model for employees? Write 3 sentences. What could go wrong if the list was misused?",
      "Commit the cohort analysis notebook to hr-attrition. Paste the URL. This type of analysis is requested constantly by HR leadership.",
      "Write a 2-sentence summary of the most actionable finding from the cohort analysis. Could an HR manager act on this tomorrow?"
    ]
  },

  12: {
    context: `Exploratory analysis tells you what is happening. A memo tells the business what to DO about it.\n\nThis week you build the deliverable that the Head of HR will actually use: a one-page memo and a supporting dashboard. The memo leads with the recommendation, not the analysis. The dashboard gives them the self-service ability to explore the data themselves.\n\nThis is the pattern you will repeat in every analyst role: insight → story → recommendation → dashboard. Master the pattern here, and you can apply it to any domain.`,
    mastery_questions: [
      "Your memo opens with the headline finding — not the methodology. Paste the first paragraph. Does it state the problem, the scale, and the recommended action in 3 sentences?",
      "Memo section 2: the evidence. Paste the most compelling chart from your analysis. Does it support the recommendation on its own, without reading the surrounding text?",
      "Memo section 3: the recommendations. Paste your 3 specific, actionable bullets. Each should have a WHO, WHAT, and WHEN.",
      "Your dashboard has 3 KPIs at the top: overall attrition rate, average tenure, and flight-risk employee count. Paste a screenshot.",
      "The dashboard is filterable by Department and JobRole. Paste a screenshot filtered to the highest-attrition department. What does it reveal?",
      "You presented the memo and dashboard to one person. Paste their first question. Did your analysis answer it?",
      "Apply their feedback. Paste the commit. What did you change and why?",
      "Export the memo as PDF. Paste the GitHub URL. Can a colleague open and read this without any explanation from you?",
      "Push hr-attrition v0.3 tag. Paste the release URL.",
      "Write the one sentence that summarises the entire HR Attrition project. This is the sentence you would say in a 30-second elevator pitch."
    ]
  },

  13: {
    context: `Project 2 ships today. The HR Attrition analysis is complete: exploratory analysis, cohort breakdown, flight-risk model, memo, and dashboard.\n\nThis week is about finishing like a professional. The same discipline every time: clean the code, write the README, get external feedback, write the retro, tag v1.0.\n\nTwo polished projects on GitHub. A retail analyst, an HR analyst. The next project will be marketing. You are building a track record of domain versatility — which is exactly what hiring managers look for.`,
    mastery_questions: [
      "Your hr-attrition README is complete with a project summary, dataset description, methods, and key findings. Paste the first paragraph.",
      "The analysis pipeline runs clean from scratch. Paste the output of your main notebook's final cell.",
      "Every major function has a docstring. Paste one example with inputs, outputs, and description.",
      "Profile the slowest cell. Paste before/after time. What was the bottleneck?",
      "One person outside the programme reviewed the repo. Paste their most interesting critique.",
      "Fix the critique. Paste the commit URL and a sentence about why it mattered.",
      "RETRO.md is committed. Paste one thing from 'what I would do differently'.",
      "What was the most surprising finding across the 3 weeks of HR analysis? Write 2 sentences.",
      "Push v1.0. PROJECT 2 (HR ATTRITION) COMPLETE. Paste the release URL.",
      "Two projects shipped. You can now do retail analytics and HR analytics. Which domain interested you more, and why?"
    ]
  },

  14: {
    context: `Most data an analyst needs does not come in a pre-packaged CSV. It lives on websites — company pages, government databases, business directories, review platforms. Web scraping is how you get it.\n\nThis week you learn to collect business data from the web responsibly: company financial data, market intelligence, product pricing, public reviews. You will write a scraper, turn the raw HTML into a structured dataset, and run a basic analysis on what you collected.\n\nThe skill you build here is not just technical — it is about knowing WHERE data lives and how to get it. That instinct is one of the most valuable things an analyst can have.`,
    mastery_questions: [
      "You chose a website to scrape and read its robots.txt. Paste the relevant lines. What are you allowed to scrape?",
      "Your scraper runs without errors. Paste 5 rows of the raw data you collected. What does each row represent?",
      "You cleaned the raw scraped data. Paste df.shape before and after cleaning. What did you drop and why?",
      "You ran a basic analysis on the scraped data. Paste the most interesting finding in one sentence with one number.",
      "Plot a distribution of one numeric column from your scraped data. Paste the chart. What does the shape of this distribution tell you?",
      "You hit a scraping obstacle (rate limit, dynamic content, login wall). Describe it in 2 sentences. How did you handle it?",
      "How does the data you collected compare to an existing public dataset on the same topic — is it more recent, more detailed, or differently structured?",
      "Write ETHICS.md with 5 scraping rules. Paste it. Which rule do you think is most important?",
      "Push your scraping project to GitHub. Paste the URL. The collected CSV should be in the repo if it is small enough to commit.",
      "What business question could you answer with a weekly scrape of this data? Write 2 sentences about the ongoing analytical value."
    ]
  },

  15: {
    context: `Every product that sells online has a funnel: visitor becomes prospect, prospect becomes lead, lead becomes customer, customer becomes repeat buyer. Understanding where customers drop out of that funnel — and why — is one of the highest-value analyses in marketing.\n\nProject 3 is Marketing Funnel. You will use the Olist Brazilian E-Commerce dataset — 100,000 real orders from a marketplace — and build a funnel analysis that tells a marketing director exactly where to invest to grow revenue.\n\nOlist is real data. Real customers, real products, real payment methods, real reviews. Your analysis will surface insights that are true about a real business that existed.`,
    mastery_questions: [
      "You loaded the Olist dataset. Paste df.shape. How many orders and how many unique customers are in the dataset?",
      "Plot order volume by month. Paste the chart. Is there a seasonal trend — when is the busiest month? What business event might cause a spike?",
      "Compute the overall conversion rate: what % of customers who placed one order ever placed a second one? Paste the percentage. Is this high or low for an e-commerce business?",
      "Plot the funnel stages: number of customers at each stage (browsed, ordered once, ordered twice, ordered 3+ times). Paste the funnel chart. Where is the biggest drop-off?",
      "Build a geographic heatmap of orders by state. Paste it. Which state has the most orders? Does that match Brazil's population distribution?",
      "Compute average order value by product category. Paste the top 5 categories. Which category drives the most revenue per order?",
      "What is the average time between first and second order for repeat customers? Paste the number of days. What could the business do within that window to encourage repurchase?",
      "What percentage of orders have a review score of 1 or 2? Paste the number. What do low review scores cost the business in repeat purchases?",
      "Push an olist-funnel repo with your exploratory notebook. Paste the URL.",
      "State your 3 main hypotheses before building models: what do you think are the biggest drivers of repeat purchase? Write them down — you will test them next week."
    ]
  },

  16: {
    context: `You found the funnel last week. This week you make it predictive.\n\nCohort analysis — grouping customers by their first purchase month and tracking their behaviour over time — reveals whether your product is getting better or worse at retaining customers over the years. Did customers who joined in January 2017 behave the same as customers who joined in January 2018? If retention is improving, the business is healthy. If it is declining, there is a problem.\n\nBy Sunday you will have a retention cohort chart — the single most important visualisation in subscription and e-commerce analytics — showing the full picture of Olist customer loyalty.`,
    mastery_questions: [
      "You built a cohort analysis: cohort = month of first order, tracking repeat purchase rates in months 1, 2, 3, 6, 12. Paste the cohort heatmap. What is the Month 1 retention rate for the first cohort?",
      "Plot retention by cohort over time (line chart). Paste it. Are later cohorts retaining better or worse than earlier ones? What might explain the trend?",
      "Compute the average Customer Lifetime Value for each cohort. Paste the table. Which cohort has the highest CLV? What was happening at Olist when those customers joined?",
      "Build a repeat purchase prediction: for each customer, create features from their first order (value, category, delivery time, review score). Train a classifier to predict whether they will order again.",
      "Paste the F1 score of your repeat purchase model. What are the top 3 features for predicting repurchase?",
      "Does delivery time affect repurchase probability? Build a scatter of delivery_days vs repurchase_rate. Paste the chart. At what delivery time does repurchase probability drop significantly?",
      "A customer ordered once, gave a 5-star review, and bought in the Electronics category. What is the model's predicted probability of them ordering again? Paste the prediction.",
      "Which product categories have the highest repeat purchase rate? Paste the top 3. What do they have in common?",
      "Write a 2-sentence business recommendation based on the cohort analysis. What should the marketing team do with customers in their first 30 days?",
      "Commit the cohort analysis notebook. Paste the URL. This is one of the most requested analysis types in e-commerce roles."
    ]
  },

  17: {
    context: `The marketing team wants to run a promotion. They believe offering free shipping to new customers will increase conversion. But will it actually work — or will it attract price-sensitive customers who never come back?\n\nThe only rigorous way to answer this is an A/B test. This week you design, simulate, and analyse one — applying the same statistical tools you learned in Week 6 to a real marketing question.\n\nGood A/B testing is rare. Most businesses either do not test at all, or run tests that are too short, too small, or measure the wrong metric. After this week you will know how to design a test that actually produces a trustworthy answer.`,
    mastery_questions: [
      "State the A/B test hypothesis: H0 and H1 for the free shipping promotion. Write them in plain English AND as a statistical statement.",
      "Calculate the required sample size: 5% baseline conversion, 10% relative lift, 80% power, 0.05 significance. Paste the formula and result. How many customers per group?",
      "Simulate the experiment using historical Olist data (or synthetic data with realistic parameters). Paste the conversion rates for control and treatment.",
      "Run the significance test. Paste the p-value and confidence interval for the lift. Is the result significant?",
      "What is the minimum detectable effect (MDE) for your test design? Paste it. Why does MDE matter when communicating test results to a marketing manager?",
      "The test is significant — but is it practically meaningful? Paste the actual lift in percentage points AND in expected revenue uplift per month. Sometimes statistical significance does not mean business significance.",
      "What is a guardrail metric and why should every A/B test have one? Choose a guardrail metric for this test. What would it mean if the guardrail was violated?",
      "The test ran for only 3 days and the team wants to call it. What do you tell them? Write a 3-sentence response that is honest but actionable.",
      "Design a sequential test with an early stopping rule. How does this compare to the fixed-sample test you ran?",
      "Commit the A/B test notebook to olist-funnel. Paste the URL. You can now design and analyse marketing experiments — a skill most analysts learn on the job."
    ]
  },

  18: {
    context: `Three weeks of Olist analysis. Funnel, cohorts, A/B test. Now you make it presentable.\n\nThis week you build the deliverable that a Head of Marketing actually uses: a memo summarising the three most important findings, and a Tableau or Python dashboard that lets them explore the data themselves. The memo has three recommendations. The dashboard answers the three questions they will ask after reading it.\n\nDeliverables are what you will be evaluated on in real jobs — not the quality of the code behind them.`,
    mastery_questions: [
      "Your marketing memo opens with the headline: 'Three actions that could increase repeat purchase rate by X%.' Paste the first paragraph. Is the number realistic based on your data?",
      "Recommendation 1 is the most important finding backed by the most evidence. Paste it as: Finding + Why it matters + Specific action + Expected impact.",
      "Recommendation 2 is from the cohort analysis. Paste it in the same format.",
      "Recommendation 3 is from the A/B test. Paste it in the same format.",
      "Your dashboard has: a funnel chart, a cohort heatmap, and an order volume trend line. Paste a screenshot. Does it tell the story in under 30 seconds?",
      "The dashboard is filterable by product category and customer state. Paste screenshots for 2 different filter combinations. Do the patterns change meaningfully?",
      "You presented the memo to one person. Paste their first question. Was it covered in your memo?",
      "Fix the gap their question revealed. Paste the commit URL.",
      "Export memo as PDF and commit to olist-funnel. Paste the GitHub URL.",
      "Push a v0.3 tag. Paste the release URL. Your marketing analytics deliverable is professional-grade."
    ]
  },

  19: {
    context: `Project 3 ships today. The Olist funnel analysis is complete: exploration, cohort analysis, A/B test design, memo, and dashboard.\n\nThis is your third polished project across three different domains — retail, HR, and marketing. You can now claim genuine domain versatility as an analyst. The pattern of skills — explore, model, communicate — is the same across all three. What changes is the business context and the specific questions.\n\nVersion 1.0 of this project goes on your GitHub today. Another retro. Another milestone.`,
    mastery_questions: [
      "Your olist-funnel README tells the story of the project in 3 paragraphs. Paste it. Would a stranger know what industry, what question, and what answer within 30 seconds of reading?",
      "Every notebook runs clean from top to bottom. Paste the last cell output of your main notebook.",
      "Your pipeline is reproducible with one command. Paste the README 'Quick Start' section.",
      "Profile the slowest cell. Paste before/after time and what you changed.",
      "One external reviewer gave feedback. Paste their top observation.",
      "Fix it. Paste the commit URL and a sentence about why it made the project better.",
      "RETRO.md is committed. Paste the 'what I would do differently' section.",
      "Compare all 3 projects: Superstore, HR Attrition, Olist. Which was the hardest analytically and why?",
      "Push v1.0. PROJECT 3 (OLIST FUNNEL) COMPLETE. Paste the release URL.",
      "Three domains, three projects. Which one surprised you most with what the data revealed?"
    ]
  },

  20: {
    context: `Half the BI market uses Tableau. You have learned Excel and Python. This week you add Tableau — and discover that some visualisations that take 20 lines of matplotlib take 3 clicks in Tableau.\n\nTableau is the dominant tool for interactive dashboards in mid-to-large organisations. Being fluent in both Python (for analysis) and Tableau (for dashboards) is one of the most reliable ways to stand out as an analyst candidate.\n\nThis week you rebuild your best Superstore visualisations in Tableau and build your first fully interactive published dashboard that anyone can explore in a browser.`,
    mastery_questions: [
      "Tableau Desktop is installed and the Superstore workbook is connected. Paste a screenshot of your first chart — a simple bar chart of Sales by Sub-Category. How long did it take vs matplotlib?",
      "You built a scatter plot of Discount vs Profit coloured by Category. Paste a screenshot. Does the pattern match what you found in Week 3?",
      "You used a calculated field to compute Profit Margin. Paste the formula. How is this different from adding a calculated column in pandas?",
      "Build a map showing Sales by State (if using a US dataset) or by Region. Paste a screenshot. Which geographic area is immediately visible as the strongest?",
      "You built a Tableau dashboard combining 3 charts. Paste a screenshot. Is the story clear at a glance?",
      "Add an action filter: clicking a region on the map filters the other charts. Paste a screenshot showing the filter applied. How does this compare to a Streamlit sidebar?",
      "Publish the dashboard to Tableau Public. Paste the live URL. Can anyone interact with it from a browser without downloading Tableau?",
      "What does Tableau do better than Python/matplotlib? Write 3 concrete examples. What does Python do better than Tableau?",
      "Find one visualisation type in Tableau that you have not seen in Excel or matplotlib. Paste a screenshot. What insight does it reveal that a simpler chart would miss?",
      "Commit the Tableau workbook (.twbx) to your superstore-analysis repo. Paste the URL. You now have both Python and Tableau versions of the same analysis."
    ]
  },

  21: {
    context: `Excel and Tableau work for analysts. But when data engineers, analysts, and BI developers collaborate at scale, they use the Modern Data Stack: dbt for transforming data in the warehouse, BigQuery as the warehouse, and Looker or Tableau as the presentation layer.\n\nThis week you get hands-on with this stack. You will load data into BigQuery, write your first dbt model (a SQL transformation that is version-controlled and testable), and run it to produce a clean analytics table that Tableau or Python can query.\n\nThis is the stack at Airbnb, Spotify, Stripe, and nearly every data-driven company over 200 people. Learning it opens doors to Data Engineering roles as well as senior Analytics roles.`,
    mastery_questions: [
      "You loaded data into BigQuery. Paste SELECT COUNT(*) FROM your_table. How many rows? How long did the query take?",
      "Your first dbt model is a SQL SELECT that cleans and transforms the raw data. Paste the model file (schema.yml + the SQL). What cleaning step did you add?",
      "Run dbt run. Paste the output. How many models ran successfully? What does dbt create in the data warehouse?",
      "Run dbt test. Paste the output. What tests did you add — not null, unique, referential integrity? Why are data tests important?",
      "What is the difference between a dbt model and a regular SQL view? Write 2 sentences. What does dbt add to plain SQL?",
      "You wrote a dbt documentation comment for your model. Paste it. Who is the intended audience for dbt docs — analysts, engineers, or both?",
      "Connect Tableau (or Python) to your BigQuery dbt model output. Run one query or build one chart from the transformed table. Paste the result.",
      "What is the difference between ELT and ETL? Write 3 sentences. Which does the Modern Data Stack use, and why?",
      "What is a staging layer in dbt? Write 2 sentences. How does it differ from a mart layer?",
      "Push your dbt project to GitHub. Paste the URL. You just shipped a version-controlled data transformation pipeline — that is a Data Engineering skill."
    ]
  },

  22: {
    context: `Three projects shipped. Now you design your own.\n\nThe capstone is the most important piece of work in this programme. It should demonstrate everything: data acquisition, exploration, modelling, communication, and a domain you chose because you actually care about it.\n\nThis week you pick the domain, find the data, define the question, and scope the work so precisely that a stranger could understand exactly what you are building and why it matters. Good scoping is what separates projects that finish from projects that wander.`,
    mastery_questions: [
      "Write your capstone one-liner: 'I will use X data to answer Y question for Z audience.' Paste it. Is the audience specific — not 'businesses' but 'retail VPs in the UK'?",
      "Your primary dataset is identified and accessible. Paste df.shape or the source URL and estimated row count. What does each row represent?",
      "You need at least one additional data source to make this interesting. Paste it. How will you join it to the primary dataset?",
      "Write the scope: what you will and will NOT do in 4 weeks. Paste it. What is the one chart or table that represents the core deliverable?",
      "Define success: a specific, measurable result. Paste it as a single sentence with a number.",
      "Who is the stakeholder? Write 3 sentences describing a real type of person who would use your analysis. What decision does it help them make?",
      "List 3 existing analyses on this topic. How is yours different or more useful?",
      "Write the README introduction. Paste it. Does it hook a reader in the first sentence — does it say why the question matters?",
      "What is the biggest risk to this project completing? Write 2 sentences about the risk and your mitigation plan.",
      "Commit your capstone repo with README and scope. Paste the URL. Scoping is the hardest part — you just did it."
    ]
  },

  23: {
    context: `Week 1 of building the capstone. You have a scope and a dataset. Now you start making the pages.\n\nA 4-page analysis tells a story: Page 1 introduces the data and the question. Page 2 explores the patterns. Page 3 models or analyses the core question. Page 4 makes the business recommendations.\n\nThis week you build Pages 1 and 2. They are the foundation everything else rests on. If the data exploration is thorough, the modelling and recommendations will be credible.`,
    mastery_questions: [
      "Page 1 is complete: data overview, source, time period, key columns, and the central question. Paste a screenshot or the first notebook cell block.",
      "Your data is clean and documented. Paste df.info() output. What were the 3 biggest cleaning challenges?",
      "Page 2 has your 3 most interesting exploratory charts. Paste all 3. For each, write one sentence about what it reveals.",
      "You found an unexpected pattern in the data. Paste the visualisation and 2 sentences about what it means for your question.",
      "Descriptive statistics for your key variables are computed and interpreted. Paste one example where mean and median differ significantly. What does that distribution skew tell you?",
      "Your data has a temporal dimension (most real data does). Plot the time trend for your main variable. Paste the chart. Is there seasonality, a trend, or both?",
      "Write the narrative for Page 1 and Page 2 as if you are presenting to the stakeholder. Paste the key 3-sentence summary of what you found in exploration.",
      "What question did the exploration raise that you had not anticipated? Write 2 sentences. Will you address it in the analysis or leave it for future work?",
      "Commit Pages 1 and 2. Paste the commit URL.",
      "Is your success metric still the right one after exploring the data? If you would change it, write what you would change it to and why."
    ]
  },

  24: {
    context: `Pages 1 and 2 set the scene. Pages 3 and 4 deliver the answer.\n\nPage 3 is the heart of the analysis: the model, the statistical test, or the pivot that answers your central question with the most rigour you can bring to it. Page 4 is the business translation: what does the analysis mean, what should someone DO based on it, and what would you investigate next?\n\nThese two pages are what the stakeholder will remember. Everything before them is context. These pages are the reason for the whole project.`,
    mastery_questions: [
      "Page 3 is complete: your core analytical method is applied and the result is clearly stated. Paste the main output (model metric, statistical test result, or key pivot table).",
      "Validate your result: does it pass a sanity check? Run the same analysis on a subset of the data or a different time period. Paste the comparison. Is it consistent?",
      "What is the single most surprising finding in your analysis? Paste it with the supporting chart or number. Did it change your recommendation?",
      "Page 4 has 3 specific recommendations for your stakeholder. Paste them — each with a WHO, WHAT, and expected impact.",
      "What is the biggest limitation of your analysis? Write 3 sentences being honest about what your data cannot tell you. This honesty builds credibility.",
      "Your Page 4 has a 'next steps' section: 3 things you would do with more time or data. Paste them. Are they realistic?",
      "Write the one-sentence executive summary: 'Based on X data, I found Y, which means the business should do Z.' Paste it.",
      "Commit Pages 3 and 4. Paste the commit URL. You have answered your central question.",
      "Would you add a 5th page covering a secondary question that emerged from the analysis? Write 2 sentences about what it would cover and whether it is worth the effort.",
      "Show Pages 3 and 4 to one person. Paste their reaction. Did they immediately understand the recommendation?"
    ]
  },

  25: {
    context: `You have spent 24 weeks analysing data. This week you learn the skill that makes the analysis actually land: storytelling.\n\nData storytelling is not about making things look pretty. It is about organising information so that the audience understands the most important thing first, believes the evidence that supports it, and knows exactly what to do next.\n\nThe best analysts in the world are not the ones who find the most insights — they are the ones whose insights lead to action. This week you study the techniques that make that happen: pyramid principle, SCQA framework, data visualisation best practices, and the art of the executive briefing.`,
    mastery_questions: [
      "Write the SCQA (Situation, Complication, Question, Answer) for your capstone. Paste it. Does it create a tension that makes the reader want to see the analysis?",
      "Apply the pyramid principle to your capstone memo: answer first, then evidence, then detail. Paste the restructured outline. What moved to the front that was previously buried?",
      "Find one chart in your project that has too much information. Simplify it — fewer colours, fewer gridlines, bigger labels. Paste before/after. Which tells the story better?",
      "Write the 'data story' for your capstone in 5 sentences: hook, context, complication, finding, recommendation. Paste it.",
      "Present your capstone to one person in 3 minutes (no more). Paste a transcript or notes on what you covered. What did you skip and was that the right call?",
      "Record the 3-minute version on video (Loom or similar). Watch it back. Paste the URL. What would you change about how you spoke about the data?",
      "Choose the ONE chart from your entire project that you would use if you could only show one chart to an executive. Paste it and write one sentence explaining why it is the most powerful.",
      "What is the difference between a chart that shows data and a chart that tells a story? Write 3 sentences with a concrete before/after example from your own work.",
      "Read your memo's recommendations section. Rephrase the weakest one to be more specific, more actionable, and more connected to the data. Paste before/after.",
      "What is the most important communication lesson you learned this week? Write 2 sentences. How will you apply it in the next project?"
    ]
  },

  26: {
    context: `The capstone ships today. Everything you have learned — Excel, Python, SQL, Tableau, statistical testing, storytelling, A/B testing, cohort analysis — comes together in one polished, end-to-end project.\n\nYou have three complete projects behind you (Superstore, HR Attrition, Olist) and now a fourth capstone you designed yourself. Each one is on your GitHub. Each one tells a different analytical story.\n\nThis is what a data analyst portfolio looks like when built properly.`,
    mastery_questions: [
      "Your capstone README is the best you have ever written. Paste the first paragraph. Does it answer: what, why, who, and what did you find?",
      "The complete analysis runs reproducibly from a cloned repo. Paste the 'Quick Start' section. How many steps?",
      "Your final deliverable (memo, dashboard, or slide deck) is polished and committed. Paste the URL.",
      "One external reviewer saw the full project. Paste their most useful piece of feedback.",
      "Apply it. Paste the commit URL and a sentence about the impact of the change.",
      "RETRO.md is the most complete and honest retro of the programme. Paste the 'biggest lesson' paragraph.",
      "List all 4 projects (Superstore, HR Attrition, Olist, Capstone) and write one sentence about the most important thing each taught you.",
      "Push the final v1.0 tag. Paste the release URL.",
      "CAPSTONE COMPLETE. 4 polished projects, 4 different domains, 26 weeks. Paste your GitHub profile URL.",
      "What is the most important analytical question you want to answer next — not for a programme, but because YOU want to know the answer?"
    ]
  },

  27: {
    context: `Four polished projects. A GitHub profile that shows consistent, domain-versatile analytical work. Now you need to be able to talk about all of it in a way that gets you hired.\n\nThis week is about interview readiness: converting your project experience into STAR stories, practising the 10 most common data analyst interview questions with concrete answers from YOUR work, and presenting your portfolio so clearly that a recruiter wants to know more.\n\nMost analyst interviews are lost not because of skill gaps — they are lost because candidates cannot explain their work in plain business English. You will fix that this week.`,
    mastery_questions: [
      "Write the STAR story for the Superstore project: Situation, Task, Action, Result in 4 sentences. Is the Result specific with a number?",
      "Answer this question: 'Walk me through a time when you found an insight that changed a recommendation.' Use your best example. Paste the 3-paragraph answer.",
      "Answer: 'How would you measure the success of a marketing campaign?' Write a 5-bullet answer that mentions specific metrics and statistical methods you know.",
      "Answer: 'What is the difference between correlation and causation? Give me a real example.' Paste the answer using one of your projects.",
      "Answer: 'Tell me about a time your analysis was wrong. What happened?' Write an honest 3-paragraph answer. Interviewers respect this more than a perfect story.",
      "Build a one-page portfolio page (GitHub Pages, Notion, or Carrd). Paste the URL. Does it feature all 4 projects with links and 1-sentence descriptions?",
      "Write a LinkedIn About section in 3 sentences that mentions your 4 projects and your analytical range. Paste it. Would a recruiter want to message you?",
      "Do a mock interview with 5 technical questions, 3 minutes each. Paste the question you found hardest and your best answer.",
      "Research 3 data analyst roles you genuinely want to apply for. For each, write one question their team is probably trying to answer. Paste the list.",
      "Congratulations. You finished the Data Analysis track. What is the next skill you are taking on?"
    ]
  },

  28: {
    context: `Power BI is Microsoft's answer to Tableau — and in many industries (finance, healthcare, government, enterprise), it is the dominant tool. If you know Tableau, Power BI will feel familiar. But DAX (Data Analysis Expressions) is its own language, and the data modelling paradigm is different enough to warrant dedicated attention.\n\nThis week you learn Power BI from scratch: connecting to data, building a star schema data model, writing DAX measures, and publishing a live report. By Sunday you will have a Power BI report that replicates your best Superstore analysis, published to Power BI Service and accessible from any browser.\n\nBeing able to say you are fluent in both Tableau AND Power BI puts you in a very small category of analysts.`,
    mastery_questions: [
      "Power BI Desktop is installed and the Superstore data is connected. Paste a screenshot of the data model view. How many tables did you load?",
      "You built a star schema: a fact table (Orders) connected to dimension tables (Products, Customers, Dates). Paste a screenshot of the relationships view. What is the cardinality of the Orders → Products relationship?",
      "Write your first DAX measure: Total Sales = SUM(Orders[Sales]). Paste it. How is DAX different from a regular Excel formula?",
      "Write a DAX measure for Profit Margin %: Profit Margin % = DIVIDE(SUM(Orders[Profit]), SUM(Orders[Sales])). Paste it. Build a card visual showing this number.",
      "Write a time intelligence DAX measure: YoY Sales Growth = using SAMEPERIODLASTYEAR. Paste the DAX. Does the result match your Week 1 Excel calculation?",
      "Build a report page with: a KPI card (Total Sales), a bar chart (Sales by Region), and a line chart (Sales over time). Paste a screenshot.",
      "Add a slicer for Year. Paste a screenshot showing the report filtered to 2023. Does every visual respond to the slicer?",
      "Publish the report to Power BI Service. Paste the live URL. Can you access it from your phone?",
      "What does Power BI do better than Tableau? Write 3 concrete examples. What does Tableau do better than Power BI?",
      "Push the .pbix file to your superstore-analysis repo. Paste the URL. You are now certified fluent in Excel, Python, SQL, Tableau, AND Power BI. That is a complete analyst toolkit."
    ]
  }

};

let updated = 0;
for (const week of roadmap.weeks) {
  const u = UPDATES[week.number];
  if (u) {
    week.context = u.context;
    week.mastery_questions = u.mastery_questions;
    updated++;
  }
}

writeFileSync(FILE, JSON.stringify(roadmap, null, 2), "utf-8");
console.log(`✓ data-analysis.json updated: ${updated} weeks rewritten`);
