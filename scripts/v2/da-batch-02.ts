/**
 * v2 rewrite batch 2: data-analysis Weeks 6-10
 *  W6: Statistical thinking for analysts
 *  W7: AI-Augmented analyst + Prompt Engineering
 *  W8: Superstore v0.5 — Executive deck
 *  W9: Superstore v1.0 — Ship + retro
 *  W10: Project 2 — HR Attrition v0.1
 */

import { rewriteWeek } from "../rewrite-week";

// ─── W6 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 6, {
  context: `Everything you found in weeks 1 through 5 is a pattern. Patterns are not findings. A finding is a pattern with evidence that it is real and not noise. "Furniture margins are lower than Technology margins" is a pattern. "Furniture margins are 7.2 percentage points lower than Technology margins (95% CI: 5.8 to 8.6 pp, p < 0.001)" is a finding you can defend.

Most business analysts never learn this distinction formally, which means most business analyses are underpowered. Someone presents "the West region grew 4% faster than the East" without asking whether 4% is a real difference or whether it would disappear with a different time window. Statisticians call this the file-drawer problem -- the analyses that do not show a significant result get quietly put away, and the ones that show a positive result get presented, regardless of how noisy the signal is.

This week you upgrade every finding from weeks 1 through 5 with appropriate statistical support. Confidence intervals around mean profit margin by Category. A t-test comparing VIP customer order values to Low Value customer order values. The Pearson correlation between Discount and Profit with a p-value. And a check for Simpson's paradox -- whether an aggregate finding reverses when you break it down by a subgroup.

Simpson's paradox is worth a specific example. If Technology has the best overall margin but the worst margin in the West region, the aggregate finding is misleading for the West region sales team. Any recommendation based on "Technology is our best category" could lead the West team to push the exact subcategory where they are losing money. Checking for reversal is not optional when regional or segment breakdowns exist.

By Sunday: every key finding in the Superstore analysis upgraded with a confidence interval or p-value, Simpson's paradox check documented for at least one finding, and the analyst memo updated to reflect the statistical framing.`,

  pre_flight: `For each of the three main findings from weeks 1-3, write down your confidence in the finding on a scale of 1-5 before running any statistical tests. After running the tests, update the scores. The gap between your prior confidence and the statistical evidence is calibration -- the analysts who are well-calibrated are the ones who can be trusted to say "I am not sure" when they are not sure.`,

  mastery_questions: [
    `Compute a 95% confidence interval for the mean Profit Margin by Category. In Excel: =CONFIDENCE.T(0.05, STDEV(profit_margins), COUNT(profit_margins)) gives the margin of error; the CI is mean ± that value. Paste the CI for each Category. Write one sentence about whether the CIs for Technology and Furniture overlap -- if they do, the difference in sample means may not be statistically reliable.`,
    `Run a two-sample t-test comparing order profit between VIP customers and Low Value customers. In Excel: =T.TEST(vip_profits, low_profits, 2, 3) (two-tailed, two-sample unequal variance). Paste the p-value. Is p < 0.05? Write one sentence interpreting the result in plain English: not "p < 0.05 so it is significant" but "there is less than a 5% probability of observing a difference this large if VIPs and Low Value customers had identical average order profits."`,
    `Compute the Pearson correlation between Discount and Profit, and its p-value, using Excel's =CORREL() and =PEARSON(). For the p-value: =T.DIST.2T(r*SQRT(n-2)/SQRT(1-r^2), n-2) where r is the correlation and n is the count. Paste r and p. Is the correlation statistically significant? Write one sentence about practical versus statistical significance -- a significant correlation of -0.12 means discounts reliably decrease profit, but the effect explains only 1.4% of the variance.`,
    `Check for Simpson's paradox in the Discount-Margin relationship. Overall, higher discounts correlate with lower margins. Now compute the correlation separately for each Category. Is the direction consistent across all three? Write the three category-specific correlations. If one category has a positive correlation (more discount = better margin, perhaps because high-discount orders in that category are large bulk orders with better per-unit economics), that is Simpson's paradox and it changes the policy recommendation.`,
    `Update the analyst memo to add statistical framing to every key number. Replace "Furniture margins are lower" with "Furniture margins are 7.2 pp lower (95% CI: 5.8 to 8.6 pp)." Replace "VIP customers order more often" with "VIP customers place 14.2 orders per year versus 2.1 for Low Value customers (t=8.4, p<0.001)." Paste three revised sentences. A memo that says "significantly lower" without a number is a memo that has borrowed statistical authority it has not earned.`,
  ],

  common_mistakes: [
    `Reporting p < 0.05 without reporting the effect size. A tiny effect can be statistically significant with enough data. A large effect can be statistically insignificant with too little data. Always report both: the correlation and the p-value, or the mean difference and the confidence interval.`,
    `Interpreting a confidence interval as "the true value is definitely in this range." A 95% CI means that if you ran this analysis 100 times with different random samples, 95 of the resulting CIs would contain the true value. The one CI you computed may be one of the 5 that does not.`,
    `Reporting "correlation = 0.35 (p < 0.05)" without noting that r² = 0.12 -- discounts explain only 12% of the variance in profit. The percentage of variance explained is the most intuitive measure of practical importance for a correlation.`,
    `Not checking assumptions before running a t-test. The two-sample t-test assumes approximately normal distributions in each group. For profit data with extreme values (the $400K fare equivalent in retail is a very large bulk order), the normality assumption is violated. Note this as a limitation if sample sizes are small.`,
    `Using the same data to discover a finding and to test it. If you found the Furniture-margin pattern by exploring the data, testing it on the same data produces an inflated p-value. Ideally, you would reserve a holdout portion of the data for confirmatory testing. Acknowledging this limitation in the memo is the honest thing to do.`,
  ],

  debug_help: `Excel's T.TEST function arguments are easy to confuse: the third argument is tails (1 = one-tailed, 2 = two-tailed) and the fourth is type (1 = paired, 2 = two-sample equal variance, 3 = two-sample unequal variance). For comparing VIP and Low Value profits, use type=3 (Welch's t-test) because the variances are likely different. Using type=2 when variances differ produces an inflated p-value. Check: if the standard deviations of the two groups differ by more than a factor of 2, use type=3.`,

  ai_assist: `Use Claude to write the p-value formula for a Pearson correlation in Excel -- it is derived from the t-distribution and is not built in as a single function. Paste the formula, verify it produces a plausible p-value (should be very small for a correlation of -0.4 with 5000 observations), and document it in queries.sql as a comment. Do NOT ask Claude whether a finding is statistically significant. That determination requires the actual data and the actual test result, not a language model's assessment.`,

  stretch: [
    `Run a one-way ANOVA to test whether mean Profit Margin differs significantly across the four Regions. Excel's Data Analysis ToolPak has a built-in ANOVA function. Report the F-statistic and p-value. If significant, run Tukey post-hoc tests to identify which specific pairs of regions differ significantly.`,
    `Compute the Spearman rank correlation between Discount and Profit as a robustness check on the Pearson correlation. If Spearman and Pearson give very different results, the outliers in the data are driving the Pearson correlation and the Spearman result is more reliable.`,
    `Read "Statistics Done Wrong" by Alex Reinhart (free online, 3 hours). Chapter 4 on p-values and Chapter 5 on data snooping are the two most relevant to business analysis. The book makes the case that most published statistics are overstated, and the reasons are exactly the errors listed in common mistakes above.`,
  ],
});

// ─── W7 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 7, {
  context: `Every analyst you will compete with for jobs has access to Claude, ChatGPT, and Copilot. The ones who use AI well will be more productive. The ones who use it carelessly will produce confident-sounding wrong answers that are embarrassing to defend. This week you learn to be the first kind.

The discipline is verification. AI is genuinely excellent at generating SQL, writing formula syntax, drafting memo templates, and suggesting chart types. It is unreliable at interpreting data it cannot see, making business judgements that require domain knowledge, and catching subtle errors in analysis. Knowing which tasks to outsource and which to keep is the skill -- and it is a skill you practise by deliberately testing AI outputs against your own analysis this week.

The specific workflows you will build: a schema-aware SQL prompt (you paste the CREATE TABLE statement plus a question, AI generates the query, you run it and verify the output), a memo draft-and-critique loop (you paste your findings in bullet points, AI drafts a memo, you edit for accuracy and voice), and a formula generation prompt (you describe the logic in plain English, AI generates the Excel formula, you verify with spot checks).

The prompts.md file is the deliverable. Not the analysis -- you have already done the analysis. The deliverable is a documented set of prompts that work reliably for your analytical workflow, with notes on what each prompt is good for and where it fails. This is your personal AI cheatsheet, and it compounds over time: the better you get at prompting for analysis tasks, the more you can outsource the mechanical parts and spend your time on the parts that require actual thinking.

By Sunday: prompts.md committed to the Superstore repo with at least five working prompts, each with a "use for / not for" annotation, and one documented example where AI produced a wrong answer and you caught it.`,

  pre_flight: `Choose three analysis tasks from weeks 1-5 that you found tedious. Write them down. These are your first three AI outsourcing candidates. Then write down one task from those weeks where you are certain the answer is correct and the reasoning is clear. That task is your verification anchor -- you will use it to check whether AI produces the correct analysis.`,

  mastery_questions: [
    `Write a schema-aware SQL prompt: paste your Superstore table schema (the column names and types) followed by the question "write a query that shows monthly revenue and profit for 2017, with year-over-year growth versus 2016." Paste the AI-generated query. Run it. Does it produce the correct numbers? If not, paste the error or the discrepancy. Write one sentence about what the AI got wrong and what you had to fix.`,
    `Write a memo draft prompt: paste your three main Superstore findings as bullet points with specific numbers. Ask the AI to "draft a one-page analyst memo to the Superstore CEO with these findings, using a headline-first structure, no jargon, and a specific recommendation for each finding." Paste the draft. Now compare it to your own week-1 memo. Which sentences would you keep? Which would you rewrite? Make at least five edits and paste the edited version.`,
    `Write a formula generation prompt: "In Google Sheets, write a formula that returns 'VIP' if the value in column B is in the top 10% of all values in column B:B, 'High' if it is in the 10-30th percentile, 'Medium' if 30-70th, and 'Low' otherwise." Paste the AI formula. Test it on 5 rows against the segment logic you built in week 4. Does it match? If not, identify the error.`,
    `Find one case where AI produces a wrong answer. Strategies: ask it to calculate the year-over-year growth rate using a prompt that does not include the actual numbers, then paste the result and compare to your known-correct answer. Or ask it to "interpret what the Superstore Furniture margin trend means" without pasting the actual data -- note where it invents plausible-sounding but unverifiable claims. Paste the wrong output and your correction.`,
    `Write the prompts.md file. Five prompts minimum. For each: the prompt text, what it is good for (specific use cases), what it is not good for (failure modes you found), and one example output with a verification note. Paste the file. The "not good for" section is the most valuable part -- it is the information that prevents the dangerous use of AI (confident wrong answers without verification).`,
  ],

  common_mistakes: [
    `Accepting AI-generated SQL without running it. SQL that looks correct can be subtly wrong -- wrong join condition, wrong date function, wrong aggregation level. Always run the query and check the output against a known-correct number before using it in a deliverable.`,
    `Using AI to interpret data the AI cannot see. "What does a 12% profit margin tell us about Superstore?" asked without the actual data produces a plausible-sounding generic answer. The interpretation requires the actual numbers in context, which the AI does not have.`,
    `Not documenting prompts that work. A prompt that generates a correct SUMIFS formula for a complex condition is worth writing down. Prompts are reusable; rediscovering an effective prompt every time is waste.`,
    `Over-editing the AI memo draft until it sounds like you wrote it from scratch. The value of the AI draft is the structure and the first pass. Over-editing it costs more time than writing it yourself. The right ratio: AI for the first 60%, you for the last 40%.`,
    `Not testing the formula generation output on edge cases. AI-generated formulas often handle the typical case correctly and fail on edge cases (empty cells, negative values, ties). Always test with at least one edge case from each direction.`,
  ],

  debug_help: `When AI generates a SQL query that fails, paste the exact error message back to AI along with the query: "This query produced the following error: [error]. Fix it." AI is very good at debugging its own output given the error message. But verify the fix -- sometimes the fix introduces a new error. If you are on a third round of fixes, step back and write the query yourself using the week-5 patterns as a template. The AI is not always the faster path.`,

  ai_assist: `This week the entire content is about AI assistance, so the ai_assist field applies differently: use this week's work as the opportunity to calibrate your trust. For any analytical result from weeks 1-5, ask Claude to produce it using only a description of the question (no pasting your answer). Compare the result to your known-correct answer. The tasks where Claude matches your answer are good AI candidates. The tasks where it diverges are tasks to keep doing yourself.`,

  stretch: [
    `Build a two-turn prompt loop for memo critique: first turn generates the draft, second turn critiques it ("identify any claims in this memo that are not supported by the numbers provided"). The second turn often catches overstatements that the first turn confidently wrote.`,
    `Test whether AI can identify Simpson's paradox from a description. Describe a scenario where the overall correlation reverses within subgroups, without calling it Simpson's paradox. Ask AI to diagnose the pattern. Note whether it correctly identifies the reversal and uses the correct terminology.`,
    `Write a "verification checklist" prompt: "Given this analyst memo, list five specific claims that should be verified against the underlying data." Use it on a memo you wrote. Does it surface the claims you would have flagged yourself? Add the useful items to prompts.md.`,
  ],
});

// ─── W8 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 8, {
  context: `You have five weeks of Superstore analysis. Now you compress it into five slides that a CEO can read in 10 minutes and act on. That compression is harder than the analysis.

The instinct when building an executive deck is to show everything you found, arranged roughly in the order you found it. This instinct produces a 20-slide deck where the recommendation is on slide 19. By slide 15, the CEO has moved on to email. An executive deck starts with the answer, then uses the subsequent slides as evidence. This is the Pyramid Principle: conclusion first, then the three or four arguments that support it, then the data that supports each argument.

Each slide has one headline. Not a title that says what the slide is about ("Profitability Analysis"), but a headline that states the finding ("Furniture margins are 7.2 pp below Technology, driven by discounts above 20%"). The difference matters because the title deck requires the reader to derive the insight from the chart; the headline deck gives them the insight and uses the chart as proof. Senior audiences -- the kind who review 15 decks a week -- always prefer the headline deck.

The five slides are: (1) the overall situation and recommendation, (2) the profitability finding, (3) the discount finding, (4) the customer segmentation finding, (5) the three specific recommended actions with estimated impact. Slide 5 is the most important slide in the deck. A deck that ends on "here are the findings" is an analysis report dressed as a deck. A deck that ends on "here are three specific actions and here is what they will change" is a business case.

By Sunday: a five-slide deck in Google Slides or PowerPoint, exported as PDF and committed to the repo, and a rehearsed two-minute version you can deliver from memory.`,

  pre_flight: `Write the five slide headlines before opening Slides or PowerPoint. A headline should be a full sentence stating a specific finding or recommendation with a number. If you cannot write the headline as a full sentence with a number, the finding is not sharp enough yet. Revise the finding until the headline writes itself.`,

  mastery_questions: [
    `Write all five slide headlines as complete sentences. Paste them. Each headline should contain at least one number ("7.2 pp lower," "top 20% of customers drive 78% of profit"). Headlines that contain words like "significant," "major," or "notable" without a number are placeholder headlines -- replace the qualitative word with the number it is hedging around.`,
    `Build Slide 2 (the profitability finding). One chart (the Category margin bar chart from week 1, or the Sub-Category margin chart). The chart title IS the headline. One call-out box flagging the most important data point. No more than three words of body text. Paste a description of the slide layout or the slide itself as an image. If you needed more than 30 seconds to locate the most important number, the chart is too complex.`,
    `Build Slide 5 (the three recommended actions). Format: each recommendation is one bullet. Each bullet has three parts: Action (what to do), Metric (what changes), and Estimate (by how much). Example: "Cap Furniture discounts at 20% | Metric: Furniture profit margin | Estimate: +4-6 pp improvement based on orders currently above the cap." Paste all three bullets. A recommendation without an estimate of impact is a wish, not a recommendation.`,
    `Practice the two-minute deck walkthrough out loud. Start with Slide 1 (situation and recommendation), move through the evidence slides quickly, land on Slide 5 (actions). Time yourself. If it takes more than 2.5 minutes, cut content from the evidence slides -- they exist to support the recommendation, not to demonstrate effort. Paste the spoken script for Slide 1 (one to two sentences).`,
    `Get feedback from one person who has not seen the Superstore analysis. Share the PDF and ask them to read it alone for 5 minutes, then tell you what the three recommended actions are. If they cannot name all three without looking at the deck, the deck is not clear enough. Write what feedback you received and one change you made based on it.`,
  ],

  common_mistakes: [
    `Slide titles that describe what the chart shows instead of what it means. "Profit Margin by Category" is a description. "Furniture Margins Are Structurally Below Technology and Office Supplies" is a finding.`,
    `Charts with more than five data series. A bar chart with 17 Sub-Categories is a data table dressed as a chart. If you need to show Sub-Category detail, use a sorted bar chart with the top and bottom three highlighted, not all 17.`,
    `Putting the recommendation on slide 5 without any estimate of impact. "Cap discounts at 20%" tells the CEO what to do but not why it is worth doing. The estimate of impact ("+$X in annual profit based on current order distribution") is what converts a suggestion into a decision.`,
    `Reading from the slides during the presentation. The slides are for the audience. The script is in your head. If you need to read the slide, the slide has too many words. Reduce the text until you can speak the slide without looking at it.`,
    `Not exporting to PDF before committing. A .pptx file requires the audience to have PowerPoint and to open it. A PDF requires nothing and looks identical on every device. Always export and commit the PDF alongside the source file.`,
  ],

  debug_help: `The most common deck feedback is "it is too long" and the second most common is "the recommendation is unclear." Both have the same fix: start with the recommendation on slide 1, cut slides 2-4 to one chart each, and make slide 5 the most detailed slide in the deck. If you cut the deck from 10 to 5 slides and the recommendation is clearer, you have done it correctly. If the CEO cannot act on your recommendation without seeing the slides you cut, those slides were necessary and you need to make your recommendation more specific.`,

  ai_assist: `Use Claude to write the speaker notes for each slide. Paste the slide headline and the one chart description, and ask "write two to three sentences of speaker notes for a CEO audience, using plain language and referencing the specific numbers." Review each set of notes for accuracy against your actual numbers. Speaker notes that reference correct numbers are reusable; speaker notes that say "approximately" or "around" are hedging and need to be fixed with the actual value.`,

  stretch: [
    `Add an appendix slide with the full Sub-Category margin table, the customer segment profile, and the discount bucket analysis. Appendix slides exist for the detailed follow-up questions. Separating them from the main deck keeps the main deck clean while making the detail available.`,
    `Record a 2-minute Loom video walkthrough of the deck. Watch it back and identify one slide where your verbal explanation added information that is not on the slide -- that information probably belongs on the slide.`,
    `Read "Slide:ology" by Nancy Duarte or watch her 18-minute TED talk "The Secret Structure of Great Talks." The Pyramid Principle and the headline-first structure are the two most transferable concepts for analyst-to-stakeholder communication.`,
  ],
});

// ─── W9 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 9, {
  context: `The Superstore project has been running for eight weeks. The memo is two pages, the deck is five slides, the dashboard is one sheet, queries.sql has eight queries, monthly_report.py runs in five minutes, and the GitHub repo has everything committed. This week you finish it -- properly.

"Properly" means three things. First, you get one outside reader to look at the memo or the deck and tell you what confused them. Not a friend who will tell you it looks great -- someone who will actually use it. Second, you write a project retrospective. Third, you anonymise the data for sharing and update the repo README to reflect the final state.

The outside reader is not optional. The analyst's curse is that you know what every chart means because you built it. A reader who did not build it will find the one label you forgot, the one chart that has no axis title, and the one recommendation that is not specific enough. Every team you will join as a working analyst has a "two-eyes" rule for deliverables: no analysis leaves the team without another pair of eyes. You are practising that discipline now.

The retrospective is a one-page honest document, not a celebration. Three questions: what took longer than you expected, what would you do differently if you started over, and what is the single most useful thing you learned. The answers to these questions are the learning you take into Project 2. Skipping the retrospective means carrying the same blind spots into the next project.

The Superstore dataset is fictional and does not require anonymisation, but the practice of scrubbing a dataset before sharing is good professional hygiene. Replace "Customer Name" with "Customer ID" (it already exists), confirm no personal information made it into the analysis files, and note the data source and licence in the README.

By Sunday: outside reader feedback documented in the repo, RETRO.md committed, dataset anonymisation confirmed, and the README updated to reflect the final project state with links to all four deliverables.`,

  pre_flight: `Open the Superstore repo and read the README as a stranger. Does it state what the project found? Does it link to the dashboard, memo, and deck PDFs? Does it say what data was used and where it came from? If any of those are missing, fix them before writing any new content this week.`,

  mastery_questions: [
    `Share the memo PDF with one person who has not seen this project. Ask them to read it alone for 5 minutes, then answer: "What are the three things the Superstore business should do based on this memo?" Write down their three answers. Compare to your three recommendations. If there is a mismatch, update the memo to close the gap. Paste the change you made.`,
    `Write RETRO.md. Three required sections: What took longer than expected (be specific -- "writing the memo took 4 hours, not 1, because finding the right numbers for each finding required going back to the pivot tables"), What you would do differently (specific, not generic -- "I would write the slide headlines before building any charts"), What you learned that you will use in Project 2 (the single most transferable insight). Paste the file.`,
    `Run monthly_report.py on a fresh Python environment (a new virtual environment with only the packages in requirements.txt). Confirm it runs without error. Paste the last 5 lines of output. If it fails, you have an undocumented dependency -- add it to requirements.txt and re-run. A script that only works in your environment is not a reproducible deliverable.`,
    `Review the repo for any files that should not be public: any file with real personal data (the Superstore CSV is fictional, but check for any real data you added during analysis), any credentials or API keys, any large binary files that do not need version control. Paste the output of git ls-files showing what is in the repo. Remove anything that should not be there.`,
    `Update the README to its final state. Required: project description in two sentences, the three specific findings with numbers, links to all four deliverables (dashboard PDF, memo PDF, deck PDF, queries.sql), instructions for running monthly_report.py, and the data source with licence. Paste the final README. A README that a stranger can read in 2 minutes and fully understand the project is the correct level.`,
  ],

  common_mistakes: [
    `Treating the outside reader feedback as optional because "I know it is already clear." The whole point of outside review is that you cannot reliably assess your own clarity on work you built. If the reader was confused about anything, fix it regardless of whether you think the confusion was their fault.`,
    `Writing a retro that only covers what went well. The useful information is in what was hard. "The analysis went smoothly" is not a retro entry. "I spent 6 hours on a SUMIFS formula that should have taken 20 minutes because I did not check the date format first" is.`,
    `Committing large PNG or PDF files without checking file size. GitHub has a 100MB file limit and repos with many large files are slow to clone. Compress PDFs before committing. Chart PNGs should be under 200KB.`,
    `Leaving the README un-updated after all the week-8 changes. The README should describe the current state of the project, not the state it was in when you first wrote it.`,
    `Not including a requirements.txt. A repo without requirements.txt requires the reader to guess which Python packages monthly_report.py needs. Run pip freeze > requirements.txt and commit it.`,
  ],

  debug_help: `If monthly_report.py fails in a fresh environment, the most common reason is a pandas version incompatibility -- pandas 2.x changed several API behaviours from pandas 1.x. Run pip install pandas==1.5.3 in the fresh environment and retry. If that fixes it, update requirements.txt to pin the pandas version. If it fails for a different reason, read the full traceback -- the last line is almost always the actual error, and it is almost always a missing package or a hardcoded path.`,

  ai_assist: `Use Claude to review the README for completeness. Paste the README and ask "what information is missing that a stranger would need to understand what this project found and how to run it?" The gaps it identifies are worth fixing. Do NOT use Claude to write the retrospective. The retro is honest self-assessment -- a generated retro sounds like a generated retro and helps no one.`,

  stretch: [
    `Add a GitHub Actions workflow that runs monthly_report.py on every push and confirms it exits with status 0. A one-minute CI check that catches broken scripts before they are committed is the minimum viable quality gate for a data project.`,
    `Write a one-paragraph "project summary" card that you could post on LinkedIn. It should state the question, the dataset, the finding, and what someone viewing the repo can expect to find. Under 150 words. This is the LinkedIn post version of the project, and it is also the cover letter paragraph for any role where this project is relevant.`,
    `Prepare a 90-second verbal pitch for the Superstore project. Record yourself and listen back. If you run past 90 seconds, cut the methodology section and lead with the finding. The methodology is "I analysed the Sample Superstore dataset using Excel, Python, and SQL." That is one sentence. The finding deserves the other 75 seconds.`,
  ],
});

// ─── W10 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-analysis", 10, {
  context: `The Superstore project was a retailer. This week you start a very different domain: human resources. The IBM HR Analytics dataset contains 1,470 employees with 35 columns covering age, gender, department, job role, salary, overtime hours, tenure, satisfaction scores, and most importantly a binary column called Attrition (Yes/No) indicating whether each employee left the company.

Employee attrition costs money. A mid-level engineer who leaves costs roughly 150% of their annual salary to replace -- recruiting fees, onboarding time, lost productivity during the vacancy. For a department with 200 engineers where 15% leave per year, that is $4.5 million annually assuming $200K salaries. An analysis that identifies which employees are at highest risk of leaving -- and what predictors are associated with that risk -- can prioritise interventions that cost a fraction of that.

Your job this week is not to build a prediction model. It is to build four pivot tables, each answering a specific question about which sub-population has the highest attrition rate. The four questions: which departments have the highest attrition rates, which job roles have the highest rates, which salary bands have the highest rates, and how does overtime status interact with attrition? The answers will be specific numbers, not observations about "elevated risk."

Attrition rate is computed as: (employees who left) / (total employees in that group). In the dataset, this means counting the "Yes" values in the Attrition column divided by the total count for each group. COUNTIFS handles this directly. The denominator is total employees in the group, not total employees in the company.

By Sunday: a new GitHub repo named hr-attrition-analysis with the IBM dataset, four pivot tables with attrition rates computed correctly, and a README stating the two highest-risk combinations you found.`,

  pre_flight: `Download the IBM HR Analytics Employee Attrition dataset from Kaggle. Open it and compute the overall attrition rate manually: count the "Yes" values in the Attrition column, divide by the total row count. Write down that number. If it is not between 10% and 20%, something is wrong with your count. This overall rate is your benchmark -- every sub-group analysis should be interpreted relative to this baseline.`,

  mastery_questions: [
    `Compute the attrition rate by Department using COUNTIFS: =COUNTIFS(Department_col, department, Attrition_col, "Yes") / COUNTIFS(Department_col, department, Attrition_col, "*"). Paste the table: Department, Total Employees, Attrition Count, Attrition Rate. Which department has the highest rate? Is it more than 1.5x the company average? Write one sentence about whether that gap is operationally significant.`,
    `Build the Job Role attrition table. Paste all 9 job roles ranked by attrition rate. Write one sentence about the two job roles at the top and what they have in common (compensation level, manager-to-IC ratio, career ceiling). The most common finding in HR attrition data: roles with limited promotion paths have higher attrition than those with clear advancement trajectories.`,
    `Bucket MonthlyIncome into salary bands ($0-3K, $3K-6K, $6K-9K, $9K+) using nested IF. Compute attrition rate by band. Paste the table. Does attrition decrease monotonically with salary? If not -- if there is a band where high-salary employees also have elevated attrition -- write one sentence about what might explain it (burnout, overqualification, poaching by competitors).`,
    `Build a 2D cross-tab: Department on rows, OverTime (Yes/No) on columns. Compute attrition rate in each cell. Paste the 2D table. Which Department-OverTime combination has the highest attrition rate? Is it more than 2x the company average? This interaction effect -- the combination of department and overtime that is particularly dangerous -- is the kind of finding that a VP of HR acts on.`,
    `Write the README for the new repo. State: the dataset source, the overall attrition rate, and the two specific high-risk combinations you found with their exact attrition rates. Example: "Sales Representatives working overtime have a 53% attrition rate, versus the 16% company average." Paste the README. A stranger who reads this should understand what the project found without opening any files.`,
  ],

  common_mistakes: [
    `Computing attrition rate as (total employees who left) / (total employees in company) instead of (employees in group who left) / (employees in group). The denominator must match the numerator. A Sales department with 100 employees, 20 of whom left, has a 20% rate -- not 20/1470.`,
    `Using a pivot table COUNT of Attrition to compute the rate without separating "Yes" from "No." A COUNT of the Attrition column counts all employees; you need a COUNTIFS for "Yes" only. Verify your pivot table by comparing the pivot total to the COUNTIFS total for one group.`,
    `Reporting attrition rates without confidence intervals or noting sample size. A 50% attrition rate in a group of 4 employees is very different from 50% in a group of 200. Always report the count alongside the rate.`,
    `Not sorting the Job Role table by attrition rate. A table in alphabetical order hides the ranking. Always sort by the metric of interest to make the most important finding immediately visible.`,
    `Missing the interaction effect by looking only at univariate tables. Attrition by Department tells one story. Attrition by Department and OverTime tells a more specific story. The interaction is almost always the most actionable finding.`,
  ],

  debug_help: `COUNTIFS with "Yes" and "No" criteria fails if the Attrition column has trailing spaces or different capitalisation in some rows. Run =TRIM(Attrition_cell) on a few cells and compare to the original -- any difference means there is whitespace. Fix: select the Attrition column and run Find & Replace for "Yes " (with space) to "Yes". Also run =LEN(A2) on a few Attrition cells; if the length is 4 instead of 3, there is a trailing space.`,

  ai_assist: `Use Claude to generate the COUNTIFS formulas for the attrition rate table -- the two-criteria COUNTIFS (department + attrition = "Yes") is a common formula pattern and Claude writes it correctly. Verify the output against a manual filter for one department before applying the formula to all rows. Do NOT use Claude to generate hypotheses about why specific departments have high attrition. Those hypotheses must come from your reading of the data combined with domain knowledge, not from a model generating plausible-sounding HR narratives.`,

  stretch: [
    `Compute the revenue impact of the highest-risk combination you found. Assume average salary of $60K and replacement cost of 150% of salary. If the Sales-Overtime group has 50 employees and a 53% attrition rate, the annual replacement cost is approximately 0.53 * 50 * $90K = $2.4M. This calculation converts an attrition rate into a business number that a VP of HR can bring to a budget conversation.`,
    `Visualise the two most important findings using charts rather than tables: a sorted bar chart for Job Role attrition, and a heat map for the Department × OverTime cross-tab. Charts communicate rate differences more immediately than tables.`,
    `Compute the statistical significance of the highest-attrition sub-group's rate versus the company average using a chi-squared test of proportions. =CHISQ.TEST() in Excel, or scipy.stats.chi2_contingency in Python. A group with a 40% attrition rate that contains only 10 employees may not be statistically different from the 16% company average.`,
  ],
});
