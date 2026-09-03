/**
 * Three improvements in one pass:
 *  1) ai_assist - threaded through every week. Tells the student EXACTLY how
 *     to use AI on THIS week's work (Cursor, Claude, ChatGPT).
 *  2) stakeholder_moment - recurring beat on weeks that produce a deliverable
 *     for a real audience. Mostly DA, lightly on DS.
 *  3) Strip the semver "Tag vX.Y" pattern out of mastery questions - analysts
 *     do not actually use git tags in their day jobs. Replaced with "Push
 *     your final commit and paste the commit URL" which IS a real workflow.
 *
 * Run from repo root:  node scripts/inject-ai-stakeholder.cjs
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "data", "roadmaps");

// =====================================================================
// AI ASSIST - every week of both tracks. Tight, 2-3 sentences max.
// =====================================================================
const AI_DA = {
  1: "Open Claude or ChatGPT on the side. Ask it to explain any Excel formula you don't recognize, generate 3 alternate ways to solve a pivot puzzle, or draft a 1-paragraph version of your memo so you have something to edit instead of staring at a blank page. NEVER trust column names or numbers it gives you - always verify against your actual file.",
  2: "Paste your pandas error into Claude with the line it failed on - 80% of the time you'll get the fix in 30 seconds. Ask it to translate one of your Excel formulas to a pandas expression so you see the pattern. Use it to write docstrings for monthly_report.py.",
  3: "Ask Claude to generate the scatter plot code in pandas (then check the output - it sometimes mixes up x and y). Use it to draft 3 alternative headlines for your discount finding. Have it critique the wording of your recommendation.",
  4: "Use AI to explain RFM segmentation in 100 words for your memo. Ask it to generate the pandas one-liner for CLV per customer. Have it help you justify your VIP/Regular/Casual cutoff thresholds.",
  5: "Cursor with Claude is the fastest way to write SQL today. Type the English question as a comment ('-- top 5 customers by 2023 profit') and let it generate. ALWAYS run the query and sanity-check the row count. Use AI to explain a complex window function someone else wrote.",
  6: "Ask AI to explain p-values in plain English for your memo. Use it to suggest WHICH statistical test fits your question. NEVER let it interpret the result for you - the interpretation must be yours, not the AI's.",
  7: "This whole week IS about AI. Treat it as the moment you formalize your AI workflow. The prompts.md you write here is the playbook for every week after.",
  8: "Use AI to draft 5 alternative one-sentence headlines for slide 1. Pick the strongest, edit it yourself. Ask it to write speaker notes for slide 3 - then rewrite them in your own voice so they sound human.",
  9: "Have Claude critique your memo PDF: 'Read this and tell me the top 3 things a CFO would still ask after reading.' Apply at least one critique.",
  10: "Ask AI to explain what HR analytics professionals actually care about. Use it to generate alternative ways to bucket DistanceFromHome. Have it draft your README opening paragraph.",
  11: "Use AI to generate the pseudocode for a survival curve calculation. Ask it to explain WHY tenure × OverTime is a meaningful interaction. Have it draft 2-3 alternative cumulative-attrition framings.",
  12: "Ask AI to draft your KPI definitions in business language. Have it critique your dashboard layout from a CFO/CEO perspective. Use it to write the 1-sentence elevator pitch for your HR finding.",
  13: "Use AI to polish the language in your memo. Ask it to generate 3 alternative titles for the demo video. Have it suggest LinkedIn post angles.",
  14: "Cursor is essential here. Type 'scrape title and price from this page' as a comment, paste the HTML, let it generate. Use AI to explain CSS selectors. Have it help you write the ETHICS.md content.",
  15: "Ask AI to explain Brazilian ecommerce context. Use it to draft the schema diagram description. Have it generate the funnel-stage interpretation paragraphs.",
  16: "Use AI to generate the cohort matrix SQL or pandas code. Ask it to explain WHY a state-level cohort might tell a different story than a month-level cohort. Use it to draft the retention narrative.",
  17: "AI is great at A/B testing math. Ask it to compute required sample size given your inputs. Have it generate the simulation code. Use it to explain what 'power' means in 100 words.",
  18: "Ask AI to draft your funnel insight paragraphs. Use it to generate alternative slide title patterns. Have it critique your dashboard from a marketing-director perspective.",
  19: "Use AI to polish the demo video script. Ask it to suggest the strongest LinkedIn hook for the funnel chart. Have it draft a 1-paragraph project summary for your Kaggle notebook.",
  20: "Ask AI to explain Tableau calculated fields. Use it to generate the formula for a parameter-driven chart title. Have it suggest 3 dashboard design patterns you haven't tried.",
  21: "Cursor + Claude write dbt models faster than anyone. Type the description as a comment, let it generate the SELECT. Use AI to write your schema.yml tests. Have it explain what 'incremental' means.",
  22: "Have AI critique your SPEC.md from 3 different audience perspectives. Use it to generate audience personas. Ask it to identify the metric you would most regret if it's bad.",
  23: "Use AI to draft KPI definitions in business language. Ask it to suggest cross-page filtering patterns. Have it critique each page's layout in one sentence.",
  24: "Ask AI to suggest alert thresholds for your KPIs based on common-sense ranges. Use it to draft drill-through page descriptions. Have it generate 3 print-layout variations.",
  25: "Have AI critique your speaker notes for clarity. Ask it to generate 3 alternative one-sentence story headlines for your capstone. Use it to identify which chart adds the LEAST value (the one to cut).",
  26: "Use AI to polish your CEO memo language. Ask it to generate 3 alternative slide structures for the board deck. Have it role-play a skeptical board member and ask you 5 hard questions.",
  27: "Ask AI to rewrite your LinkedIn About section in 3 different tones - pick the best. Use it to generate strong opening sentences for each project's portfolio page. Have it role-play an analyst interview - ask you 5 SQL + 5 behavioral questions.",
};

const AI_DS = {
  1: "Paste any pandas error into Claude with the surrounding code - you'll get the fix faster than Googling. Ask it to explain a method you don't recognize (like .resample('H')). Use it to draft your README opening paragraph.",
  2: "Ask Claude to explain a 3Blue1Brown concept in your own words. Use it to generate practice problems for Bayes. Have it walk you through normal equation math step by step until it clicks.",
  3: "Cursor is fastest for the merge code. Type 'merge zones onto trips by PULocationID' as a comment, let it generate. Use AI to debug parquet loading errors. Have it explain WHY parquet beats CSV.",
  4: "Cursor + Claude writes SQL in seconds. Type the question as an SQL comment, let it generate. ALWAYS validate by running it and checking row count. Use AI to optimize a slow query (it suggests indexes + rewrites).",
  5: "Ask AI to explain LinearRegression vs XGBoost trade-offs for THIS dataset. Use it to debug sklearn errors. Have it draft the residual interpretation in your README.",
  6: "Ask AI which statistical test fits your question, then verify against the StatQuest video. Use it to generate the inference.ipynb skeleton. Have it explain Bonferroni in 100 words.",
  7: "Cursor writes Flask boilerplate in 30 seconds. Type 'predict endpoint that takes JSON' as a comment. Use AI to debug Render deployment errors. Have it generate the input validation code.",
  8: "Cursor generates BS4 selectors fast. Paste the HTML of a sample page, ask 'extract title and score', let it generate the selector. Use AI to explain pagination logic.",
  9: "Ask AI to generate Streamlit component code (sidebar, charts, sliders). Use it to debug @st.cache_resource errors. Have it suggest 3 layout variations.",
  10: "Have AI critique your notebook for clarity: 'A junior analyst reads this on a Monday morning - what would confuse them?' Use it to draft your blog post intro and your retro.",
  11: "This week IS about AI. The prompts.md you build here is your workflow for the rest of the roadmap.",
  12: "Use AI to generate PRAW scraping code. Ask it to debug Reddit API auth (a common gotcha). Have it draft the labeling rules for your gold set.",
  13: "Ask AI to explain TF-IDF weighting in plain English. Use it to debug sklearn pipeline errors. Have it generate the confusion matrix plot code.",
  14: "Ask AI to compute required sample size given baseline accuracy + MDE. Use it to generate the simulation code. Have it explain why effect size matters more than p-value.",
  15: "Cursor + Colab is the fast path. Ask Claude for the fine-tuning loop, paste into Colab, run. Use AI to debug CUDA out-of-memory errors. Have it explain learning-rate sweep results.",
  16: "Ask AI to explain SHAP plots in plain English for your README. Use it to generate the force plot code. Have it identify which feature your model is over-relying on.",
  17: "Ask AI to generate Faker code for fake user data. Use it to debug SMOTE class imbalance errors. Have it explain when synthetic data is dangerous - in YOUR project's context, not generic.",
  18: "Use AI to refactor your predict() function for clarity. Ask it to generate Streamlit dashboard layouts. Have it suggest sentiment-spike alert thresholds.",
  19: "Cursor generates Dockerfiles correctly the first time. Type 'Dockerfile for Python FastAPI app with model.pkl', let it generate. Use AI to debug image-build errors. Have it generate the JWT auth code.",
  20: "Ask AI to critique your blog post for hook strength. Use it to generate cite-as BibTeX. Have it suggest 3 cross-posting headlines for Medium.",
  21: "Ask AI to explain ACF plot interpretation. Use it to generate the decomposition plot code. Have it suggest WHY your data has the seasonal pattern it has.",
  22: "Ask AI to explain ARIMA orders (p,d,q) in plain English. Use it to debug auto_arima errors. Have it generate the AIC comparison table code.",
  23: "Ask AI to generate the US holidays list for Prophet. Use it to debug regressor format errors. Have it explain WHY changepoint_prior_scale matters.",
  24: "Cursor writes PyTorch boilerplate fast. Type 'LSTM forecasting model with 30-day windows' as a comment. Use AI to debug training loop errors. Have it explain gradient explosion in 100 words.",
  25: "Ask AI to generate MLflow logging code. Use it to debug Evidently drift report errors. Have it generate the Slack webhook script.",
  26: "Cursor generates boto3 code first try. Type 'upload model.pkl to S3 bucket forge-models', let it generate. Use AI to debug AWS credential errors. Have it estimate BigQuery cost for 3 query patterns.",
  27: "Have AI critique your blog post: 'A hiring manager skims this in 30 seconds - what would they remember?' Use it to generate model comparison tables. Have it polish your retro.",
  28: "Have AI critique your SPEC.md from 3 perspectives (recruiter, senior DS, layperson). Use it to identify gaps in your data sources. Have it suggest 3 alternative scoping angles.",
  29: "Use AI to debug model errors fast (paste the trace + the offending code). Ask it to generate the evaluation code. Have it write the wrong-paths NOTES.md section based on your git history.",
  30: "Ask AI to critique your demo video script. Use it to generate cite-as BibTeX. Have it draft 3 LinkedIn announcement variations - pick the strongest, edit it yourself.",
  31: "Ask AI to rewrite your LinkedIn About in 3 tones. Use it to generate strong opening sentences for each project. Have it role-play a senior DS interview - 5 ML concepts + 5 behavioral + 1 system design.",
};

// =====================================================================
// STAKEHOLDER MOMENT - mostly on DA "deliverable" weeks. DS is lighter.
// =====================================================================
const SH_DA = {
  1: "Your audience for the memo is a busy retail VP with 5 minutes. They want the recommendation FIRST, the supporting data second. Lead with one sentence like 'We're losing money on Tables in the Central region - kill or rework.' The pivot tables are just proof.",
  4: "Your audience for the CLV analysis is the marketing team. They want to know: 'Who do we send the next campaign to?' Lead your memo update with 3 specific named customer segments and the action for each.",
  8: "Your audience is a busy CEO with 5 minutes. They want the recommendation FIRST, the supporting data second. Practice answering 'so what?' to every chart out loud. If you can't answer, the chart does not belong on the slide.",
  9: "Imagine your CEO reads your memo on her phone in a 2-minute Uber ride. Does the headline give her the answer? Does the recommendation come BEFORE the methodology? If she stops reading after sentence 1, did she still get the most important thing?",
  12: "Your audience is the Head of People. They want the 3 things they can change next quarter to reduce attrition by 5pp. The data is just the case. Have a recommendation. Be ready to defend assumptions on dollar impact when challenged.",
  13: "Your audience for the demo is your direct manager, who will share it up the chain. The first 30 seconds must answer: 'What was the problem? What did you find? What should we do?' Everything else is detail.",
  15: "Your audience for the funnel work is a marketing director with a $200k budget. They want to know: 'Which 2 things should I spend this on to maximize repeat purchase?' Lead with that. Method second.",
  18: "Marketing exec who reads this is rewarded on revenue, not analysis depth. Lead with the dollar impact of your recommendation. Show the funnel chart only as proof. Cut every chart that does not directly support the recommendation.",
  19: "Stakeholder for your blog post is a hiring manager skimming for 30 seconds. The first sentence must answer: 'What did you build, and what was hard?' The rest is detail they only read if hooked.",
  22: "Before writing one line of code for the capstone: who is the audience for the final deliverable, and what decision will they make differently after seeing it? If you can't answer both in one sentence each, the scope is wrong.",
  23: "Page 1 = the CEO's page. 4-6 numbers max, each tied to a business question. Page 2 = the Sales VP's page. Drill into what THEY care about (rep performance, regional trends, pipeline). Different audiences need different pages, not the same page filtered.",
  24: "Page 3 = Customer/Marketing team. Page 4 = Operations team. Each page must answer their specific job-to-be-done in 10 seconds. Run a mental test: 'If I were them, would I act on this?'",
  25: "The headline IS the insight. The chart is just proof. Cole Knaflic's rule: if you take the chart away, does the slide still convey the point? If yes, the chart is decoration. Cut it.",
  26: "Get 3 real people to read your CEO memo before shipping. Pick 1 person from the actual audience (an exec or senior person), 1 senior technical person, 1 layperson. Their critiques tell you exactly what to fix.",
};

const SH_DS = {
  7: "User of your /predict endpoint is another engineer. Their job-to-be-done: get a fare estimate from your API in under 1 second. Your README must show: example curl, example response, expected latency. Three things. No fluff.",
  10: "Hiring manager who lands on your repo skims for 30 seconds. README must answer: 'What did you build? What is the dataset? What did you find? What is hard about it?' In that order. Lead with the finding, not the methodology.",
  20: "Reader of your blog is a hiring manager. The first sentence answers: 'What did you build, and what was hard?' If they read past sentence 1, they want detail. If not, you still gave them the most important thing.",
  27: "Audience for your Energy Forecast blog is a working DS who might recommend hiring you. They look for: did you pick the right model for the right reason? Lead with the model comparison table, then the chosen model, then the why.",
  30: "Stakeholder for a capstone IS the senior DS interviewer who spends 5 minutes on it. They look for: clarity of problem statement, soundness of method, business framing of result. Optimize for those three. Drop everything else.",
};

// =====================================================================
// SEMVER TAG REMOVAL - regex find/replace in mastery_questions
// Analysts do not use git semver tags. Push commits, write release notes
// on the GitHub release page if needed - but stop pretending v0.3 is a
// thing.
// =====================================================================
function stripSemverTags(q) {
  return q
    .replace(/Tag\s+v[0-9]+\.[0-9]+\s+and\s+paste\s+the\s+(release|GitHub release)\s+URL\.?/gi,
             "Push your final commit and paste the GitHub commit URL.")
    .replace(/Tag\s+v[0-9]+\.[0-9]+\.?\s*$/gi, "Push your final commit to GitHub.")
    .replace(/Tag\s+v[0-9]+\.[0-9]+\s*\.\s*/gi, "Push your final commit. ")
    .replace(/Tag\s+v[0-9]+\.[0-9]+/gi, "Push your final commit to GitHub")
    .replace(/\(v[0-9]+\.[0-9]+ milestone\)/gi, "");
}

function applyTo(file, aiMap, shMap) {
  const p = path.join(ROOT, file);
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  let ai = 0, sh = 0, tags = 0;
  for (const w of d.weeks) {
    if (aiMap[w.number]) { w.ai_assist = aiMap[w.number]; ai++; }
    if (shMap[w.number]) { w.stakeholder_moment = shMap[w.number]; sh++; }
    if (Array.isArray(w.mastery_questions)) {
      w.mastery_questions = w.mastery_questions.map((q) => {
        const clean = stripSemverTags(q);
        if (clean !== q) tags++;
        return clean;
      });
    }
  }
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
  console.log(`${file}: ai_assist=${ai} weeks, stakeholder=${sh} weeks, tags-replaced=${tags} questions`);
}

applyTo("data-analysis.json", AI_DA, SH_DA);
applyTo("data-science.json", AI_DS, SH_DS);
