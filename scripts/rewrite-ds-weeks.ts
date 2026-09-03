/**
 * Rewrites context + mastery_questions for data-science.json
 * Run: npx tsx scripts/rewrite-ds-weeks.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const FILE = resolve(process.cwd(), "data/roadmaps/data-science.json");
const roadmap = JSON.parse(readFileSync(FILE, "utf-8"));

// ─── NEW CONTENT ───────────────────────────────────────────────────────────────

const UPDATES: Record<number, { context: string; mastery_questions: string[] }> = {

  1: {
    context: `Somewhere in New York City right now, a yellow taxi is making a turn. That trip — the exact fare, the distance, the minute it started — will be logged and eventually published as open government data. Three and a half million of those trips from October 2023 are sitting on a NYC government server right now, waiting for someone to ask them a question.\n\nThis week, that someone is you.\n\nYou are going to build TaxiPulse — your first real data science project. You will load 3.5 million actual taxi trips into Python, clean out the junk rows, and surface three patterns no one told you the answers to in advance. By Sunday you will have pushed a Jupyter notebook to GitHub that any hiring manager can open in their browser.\n\nIf you have never written Python, that is fine. Everything is shown step by step. The goal this week is not perfection — it is your first real win.`,
    mastery_questions: [
      "You just ran your first Python. In a Jupyter cell, run `import pandas as pd; print(pd.__version__)` and paste the version number. You are a data scientist now.",
      "You loaded 3.5 million real NYC taxi trips. Run `df.shape` and paste both numbers. Think about what you are actually holding — millions of real human journeys, right there in memory.",
      "Run `df.columns.tolist()` and paste the output. Which column tells you exactly when each trip started? You will use it constantly this week.",
      "Real data is always dirty. Run `df.isnull().sum()` and paste the column with the most missing values and its count. This is what analysts spend 80% of their time on — welcome to the job.",
      "You just cleaned a massive dataset. After removing impossible trips (fare <= 0, distance <= 0, wrong month), how many rows survived? Paste the number. That is how many real trips you are working with.",
      "Run `df['trip_distance'].describe()` and paste the mean. What is the average NYC taxi ride in miles? Does it match your intuition about the city?",
      "Here is your first real finding: what hour of the day sees the most taxi pickups in October 2023? Paste the hour and the trip count. A city planner would genuinely pay for this number.",
      "Do short trips get tipped more or less? Compute the median tip percentage for trips over 5 miles vs under 1 mile. Paste both. You just discovered a real pattern in human tipping behaviour.",
      "Which day of the week has the highest average fare? Paste the day name and the dollar amount. Friday night? Monday morning? Let the data answer — not your guess.",
      "You shipped your first data project to the world. Paste your taxipulse-nyc GitHub repo URL. This is now on your CV."
    ]
  },

  2: {
    context: `Last week you answered questions about taxis. This week you are going to understand WHY the tools you used actually work.\n\nEvery time you call df['fare_amount'].mean(), you are computing a dot product. Every time a model trains, it is rolling downhill on a loss surface — that is gradient descent. These ideas are not magic. They are things you can write in ten lines of NumPy.\n\nThis week you use your own TaxiPulse data as the playground. You will compute vectors, visualize probability distributions, reason through Bayes' theorem by hand, and solve the linear regression normal equation from scratch — then watch your coefficients match NYC's real metered taxi rate.\n\nAfter this week, ML models will never be black boxes to you again. You will know exactly what they are doing underneath the code.`,
    mastery_questions: [
      "You now know that every ML model is matrix math underneath. Load fare_amount into a NumPy array. Compute the mean and std. Paste both. How much variation is there in NYC fares — does a $5 std feel large or small to you?",
      "You computed a z-score normalization. Paste your one-liner. After normalizing, what is the mean and std? (Only one correct answer — check before pasting.)",
      "Plot fare_amount as a histogram BEFORE and AFTER log-transform. In one sentence, describe what changes. Is the log version closer to a bell curve? Real models care about this shape.",
      "Compute the Pearson correlation between trip_distance and fare_amount — without using .corr(). Paste the value to 4 decimal places. Is distance a strong predictor? Would you trust a model built only on it?",
      "A taxi trip is flagged as suspicious (extreme fare for its distance). 2% of trips are genuinely suspicious. The flag catches 80% of real bad trips but also fires on 10% of normal ones. If a trip IS flagged — what is the probability it is actually suspicious? Show your working. This is Bayes in the real world.",
      "You solved linear regression the real way — the normal equation. Paste your three coefficients: intercept, per-mile, per-minute. NYC's real metered rate is roughly $3 base + $2.50/mile. How close did 3.5 million trips get you?",
      "Take 3 actual trips from your data. Build a 3x3 feature matrix X (distance, hour, passenger_count). Compute X^T @ X with NumPy. Paste the result. You just built the foundation of every linear model in existence.",
      "What is gradient descent doing when a neural network trains? Write 2 sentences in plain English — no math notation, just the idea. What would happen if the learning rate was 10x too high?",
      "The fare distribution is right-skewed. Name one thing this means for a model trained on raw fares. What transformation fixes it?",
      "Commit math.ipynb to your taxipulse-nyc repo. Paste the commit URL. You just proved to any future employer that you understand what models actually do, not just how to call .fit()."
    ]
  },

  3: {
    context: `You built something real in Week 1. Now you are going to make it deeper.\n\nNew York City has five boroughs, and each one has a completely different rhythm. Manhattan never sleeps. Brooklyn tips differently. The Bronx runs on its own schedule. Your October dataset only saw one slice of time — what happens when you add September and November?\n\nThis week you will join a geographic lookup table to your taxi data (your first real-world merge), split your analysis by borough, and concatenate three months of data into a single Q4 picture. By Sunday you will have charts that show not just when taxis are busiest — but WHERE, and whether that changes across the autumn.\n\nThis is how professional data scientists think: always asking "does this pattern hold everywhere, or only in one slice?"`,
    mastery_questions: [
      "You just did your first real table merge. Paste df.shape BEFORE the zone join and AFTER. How many rows were matched? How many trips did not join to a known borough — and what does that tell you?",
      "Plot trips-by-hour for each of the 5 NYC boroughs on one chart. Which borough has the LATEST peak hour? Which has the EARLIEST? Does it match your intuition about each neighbourhood?",
      "You concatenated 3 months of data. Paste the total row count for the Q4 dataset. You are now working with roughly 10 million taxi trips.",
      "Plot daily trip volume across all of Q4 2023. Find the day with the biggest dip. Paste the date and trip count. What do you think happened that day?",
      "Which borough tips the highest percentage on average? Paste the borough name and the median tip %. Does it surprise you — why or why not?",
      "Build a heatmap of trips by hour x day-of-week. Paste the image. What is the single most interesting cell in the heatmap — what does it mean in plain English?",
      "Find the busiest single hour of the entire Q4 period (across all 3 months). Paste the exact datetime, borough, and trip count. This is the peak of NYC taxi culture in autumn 2023.",
      "Compare weekday vs weekend trip counts per borough. Paste the comparison table. Which borough shows the BIGGEST weekday-vs-weekend swing? What kind of neighbourhood does that suggest?",
      "Run the same cleaning steps on the multi-month data. How many rows did you lose to cleaning? Is the percentage similar to Week 1, or different?",
      "Update TaxiPulse-Final.ipynb with a Borough Breakdown section and a Q4 Trend section. Push a v0.2 tag. Paste the release URL."
    ]
  },

  4: {
    context: `Here is the truth about real data science jobs: you will spend more time in SQL than in Python. Before any data reaches your notebook, it lives in a database. To pull it out, you write SQL.\n\nThis week you rewrite your entire TaxiPulse analysis in SQL — and you will notice something surprising: some questions that took 10 lines of pandas take 3 lines of SQL. Others that took 1 line of pandas become genuinely hard. Understanding both is what makes you dangerous.\n\nYou will work through SELECT, WHERE, GROUP BY, JOINs, window functions, and CTEs — all on the same taxi data you know deeply. By Sunday you will have a file of 10 commented, working SQL queries that answer the same questions you answered in Python.\n\nThis is not starting over. This is seeing your work from a new angle.`,
    mastery_questions: [
      "You loaded 100,000 taxi trips into SQLite. Paste SELECT COUNT(*) FROM taxi — does it match? Also paste the zone lookup row count.",
      "Rewrite your Week 1 busiest-hour finding in SQL. Paste the query and the top 5 hours. Does the SQL answer match your pandas answer exactly?",
      "Rewrite the tip-percentage-by-borough query in SQL. Paste the query and the result table. How many lines of SQL vs the pandas version?",
      "You used ROW_NUMBER() OVER (PARTITION BY ...). Paste the query that finds the top 3 highest-fare trips per borough. This is impossible cleanly in a single pandas operation — SQL wins here.",
      "Write a CTE (WITH ...) that first aggregates daily trips, then computes a 7-day rolling average. Paste the query. This is the kind of analysis a real analyst writes at 9am on a Monday.",
      "Find outliers in SQL: trips where the fare is above the 99th percentile for their distance bucket. Paste the query and 5 example rows.",
      "Validate your work: does your SQL row count for October 2023 trips match the pandas count exactly? Paste both numbers and yes/no. Trust but verify.",
      "Write a window function that computes cumulative daily trips across Q4. Paste the query and the first 10 rows of output.",
      "How many trips have a NULL value in the store_and_fwd_flag column? Write the query. Paste the count. What does a NULL mean here — is it data quality or a real business meaning?",
      "Commit queries.sql with your 10 commented queries to the taxipulse-nyc repo. Paste the file URL on GitHub."
    ]
  },

  5: {
    context: `You have described the data. You have queried it six ways. Now you are going to PREDICT from it.\n\nThis is the moment data science stops being analytics and starts being machine learning. You are going to train a model that takes a trip's distance, duration, and pickup hour — and predicts what the fare will be. Then you are going to compare two models side by side and understand why one beats the other.\n\nHere is the part nobody tells beginners: the most important work is not choosing the model. It is building the training data correctly and understanding what the coefficients actually mean. A linear regression that you can explain is worth more than an XGBoost model you cannot.\n\nBy Sunday you will have two trained models, a residual analysis that shows exactly where they fail, and your coefficients will confirm what NYC's actual taxi meter is doing.`,
    mastery_questions: [
      "You chose your features. Paste the feature list (X columns) with a one-line justification for each. Why did you exclude certain columns that might seem useful?",
      "You trained LinearRegression. Paste the test MAE. In plain English — on average, how many dollars off is your model?",
      "Paste the coefficient for trip_distance. NYC's real per-mile rate is roughly $2.50. How close is your model? If it is very different, what might explain that gap?",
      "You trained XGBoost. Paste its test MAE. Which model won? By how many dollars on average?",
      "Plot the residuals (actual minus predicted) on a scatter chart. Paste it. Are the residuals random, or do you see a pattern — like the model being more wrong on expensive trips? What does that pattern mean?",
      "Add passenger_count as a feature. Does the MAE improve? Paste before-and-after MAE. What does this tell you about whether passenger count matters to fare pricing?",
      "Build a model trained ONLY on Manhattan trips. Paste its MAE. Better or worse than the city-wide model? What does that difference mean?",
      "Find 5 test rows where the model's prediction is more than $20 wrong. Paste the rows. Look at the distance and duration — what do these outlier trips have in common?",
      "Save your best model with joblib. Paste the filename and file size in KB. Why is saving the model important — what would happen if you just re-ran the notebook instead?",
      "Add a section called '## Fare Model' to TaxiPulse-Final.ipynb with the key findings. Push a v0.3 tag. Paste the release URL."
    ]
  },

  6: {
    context: `Last week you said the 6pm hour was the busiest. But is it SIGNIFICANTLY busier — or could that pattern be random noise in the data?\n\nThis week you learn to answer that question properly. You are going to replace "I think X" with "X is statistically significant at p < 0.001" — and understand what that actually means.\n\nP-values, confidence intervals, t-tests, chi-square tests, Bonferroni correction — these sound intimidating, but they are just tools for deciding whether a pattern is real or a coincidence. Every analyst who makes claims without them is one bad dataset away from embarrassing themselves in a meeting.\n\nBy Sunday every finding in your TaxiPulse README will have a p-value behind it. That is a level of rigour most junior data scientists skip entirely — and it will show in interviews.`,
    mastery_questions: [
      "Compute the 95% confidence interval for mean fare amount. Paste [low, high]. Now shrink your sample from 1000 to 100 and re-run. How does the interval width change — and why?",
      "Run a two-sample t-test comparing Manhattan vs Brooklyn fares. Paste the t-statistic and p-value. Is the difference statistically significant? What does p < 0.001 actually mean in plain English?",
      "Compute Cohen's d for the Manhattan vs Brooklyn comparison. Paste the value. Is the effect size large, medium, or small? Why does effect size matter ALONGSIDE the p-value?",
      "Run a chi-square test between pickup borough and payment type (cash vs card). Paste the chi2 value and p-value. Is borough associated with payment method?",
      "Apply Bonferroni correction to 10 pairwise borough fare comparisons. Which pairs REMAIN statistically significant after the correction? Which ones do not survive — and why?",
      "Bootstrap the mean fare with 1000 resamples. Paste the 95% bootstrap CI. Does it match the t-distribution CI from checkpoint 1? When would you prefer the bootstrap?",
      "Run a one-way ANOVA across all 5 boroughs. Paste the F-statistic and p-value. What does a significant F mean — and what does it NOT tell you?",
      "Run the Shapiro-Wilk normality test on log(fare_amount). Paste the result. Is it normal? Should you care, given your sample size?",
      "Find one pattern in your data that looks real but might be Simpson's Paradox — a trend that reverses when you split by a third variable. Describe it in 3 sentences.",
      "Commit inference.ipynb to your taxipulse-nyc repo. Update the README with one claim that now reads 'statistically significant (p < 0.001)'. Paste the commit URL."
    ]
  },

  7: {
    context: `Your fare prediction model lives in a Jupyter notebook. Right now only you can use it — you have to open the notebook and run the cells manually.\n\nThis week you fix that. You are going to wrap the model in a Flask API, add a health endpoint, serve it with gunicorn, and deploy it to Render. By Sunday, anyone in the world can send a POST request to your URL and get a fare prediction back in milliseconds.\n\nThis is the step that separates data scientists who produce insights from data scientists who ship products. When an interviewer asks "have you ever deployed a model in production?", your answer will be yes — with a live URL to prove it.\n\nThe work is real. The URL will be real. Everything you do this week is exactly what a DS team does when moving a model from notebook to production.`,
    mastery_questions: [
      "You saved the model with joblib. Paste the filename and size. Load it back in a fresh Python session and run one prediction. Paste the predicted fare. This proves the model is truly portable.",
      "Your Flask app is running locally. Paste the full app.py code (it should be under 25 lines). Read it — do you understand every line? Ask Claude about any line you do not.",
      "Send a POST request to localhost:5000/predict with distance=5.2, duration_min=18, hour=14. Paste the full curl command AND the JSON response.",
      "Your /health endpoint returns 200 OK. Paste the curl command and the JSON it returns. Every production service has this — it is how load balancers know you are alive.",
      "Your requirements.txt is complete and gunicorn is in it. Paste the contents of requirements.txt. Why gunicorn instead of just `flask run`?",
      "Your app is live on Render. Paste the full public URL. How long did deployment take?",
      "Send a curl POST to your LIVE Render URL. Paste the command and the response. You just queried a model running on a real cloud server.",
      "Add input validation: return a 400 error if distance <= 0 or hour is not 0-23. Paste the validation code. What happens if you send hour=25? Paste the error response.",
      "Add a /batch endpoint that accepts a list of trips and returns a list of predictions. Paste one example request and its response.",
      "Push the final version of taxipulse-api to GitHub. Paste the repo URL and the live Render URL. Share these in your check-in — you shipped a real API."
    ]
  },

  8: {
    context: `Most real datasets are not waiting for you in a clean CSV. They live on websites, behind pagination, in HTML tables, scattered across dozens of pages. The skill of getting that data yourself is called web scraping — and it opens up thousands of datasets that nobody else has packaged.\n\nThis week you will scrape Hacker News — the daily aggregator of what the tech world is reading and talking about. You will get 100+ stories, save them to a CSV, and run a pretrained sentiment model over the titles. By the end of the week you have a pipeline that could run every morning and tell you what the tech community is excited about vs worried about.\n\nYou will also read the ethics. Scraping responsibly — respecting robots.txt, rate-limiting, identifying yourself — is not optional. It is what separates professional data acquisition from being a bad actor online.`,
    mastery_questions: [
      "You read Hacker News's robots.txt. Paste the relevant lines that tell you what is and is not allowed. What is the rule about delaying requests?",
      "Your scraper pulls the HN front page. Paste 5 story titles with their scores. Did any surprise you — what is the tech world talking about today?",
      "You scraped 5 pages with a 1-second rate limit. Paste the total story count. Why is the rate limit there — what would happen to HN if thousands of people scraped without it?",
      "You ran HuggingFace sentiment on 50 titles. Paste 3 POSITIVE and 3 NEGATIVE examples. Do the labels feel correct to you — or does the model make any obvious mistakes?",
      "Plot the sentiment distribution (count of POSITIVE vs NEGATIVE titles). Paste the chart. What does the ratio tell you about the mood of the tech community today?",
      "Find the highest-scoring story and the lowest-scoring story in your dataset. Paste both titles and scores. Is the sentiment model's label for each one accurate?",
      "You wrote ETHICS.md with your scraping rules. Paste the 5 rules. Which rule do you think is most important — and why?",
      "Compare BeautifulSoup speed vs Scrapy on 10 pages. Paste both runtimes. When would you choose Scrapy over BeautifulSoup in a real project?",
      "Add the comment count to each scraped story. Paste a sample 5-row table with title, score, and comment count. Which story has the highest comment-to-score ratio — what might that mean?",
      "Push hn-scraper to GitHub as a public repo. Paste the URL. This is now a real data acquisition project on your profile."
    ]
  },

  9: {
    context: `Your fare prediction model is live as an API. But most non-technical people will never type a curl command. They need a UI.\n\nThis week you build one with Streamlit — the fastest way to turn a Python script into a real web app. In about 50 lines of code you will have a dashboard where anyone can move sliders, pick a borough, and watch the predicted fare update in real time. Then you will deploy it to Streamlit Cloud so the world can use it.\n\nThis is a milestone. By Sunday you will have a live URL that demonstrates three of the most valuable skills in modern data science: building a model, wrapping it in an API, and giving it a face anyone can use. That is the full product loop — data to insight to interface to deployment.`,
    mastery_questions: [
      "Streamlit is installed and your first app runs. Paste the first line of your explorer.py and the localhost URL. What did Streamlit show you without writing any HTML?",
      "Your sidebar has 4 widgets: borough dropdown, hour slider, distance slider, duration slider. Paste a screenshot. What happens in the main panel when you change the borough?",
      "The fare model is wired in. Paste a screenshot showing a predicted fare. Move the distance slider from 2 miles to 20 miles — does the predicted fare change in the direction you would expect?",
      "The Q4 daily trend chart is filtering by borough. Paste screenshots for Manhattan and Brooklyn side-by-side. What is the most visible difference between the two trends?",
      "You added @st.cache_data to the parquet load. Paste the before/after load time. Why does caching matter here — what would happen on every slider click without it?",
      "Add a heatmap of trips by hour × day-of-week. Paste a screenshot. What single cell in the heatmap surprises you most?",
      "Add a compare-2-boroughs mode. Paste a screenshot showing two boroughs side by side. Which pair tells the most interesting story?",
      "Your app is live on Streamlit Cloud. Paste the full public URL. Open it on your phone — does it work on mobile?",
      "Send the Streamlit URL to one person and ask them to use it for 2 minutes. What was the first thing they clicked? Paste their reaction.",
      "Push a v0.5 tag to taxipulse-nyc. Paste the release URL. You have a live interactive data product — that is a real portfolio piece."
    ]
  },

  10: {
    context: `You have spent 9 weeks building TaxiPulse. You have a notebook, an API, a dashboard, and several versions on GitHub. This week you do something harder than building: you make it worth showing to strangers.\n\nPolishing a project is a professional skill. It means making the README so clear that someone who has never heard of NYC taxis can understand what you found. It means making the code readable enough that a stranger can follow it. It means writing a retro that is honest about what went well and what you would do differently.\n\nBy Sunday, Project 1 is done — not just technically complete, but genuinely shareable. Get one real person to read the notebook and tell you what confused them. Apply the feedback. Then tag v1.0 and move on.\n\nThis is how professionals ship.`,
    mastery_questions: [
      "You listed 10 rough edges in your project. Paste the list. Which one embarrasses you the most — that is the one to fix first.",
      "You fixed at least 5 of them. Paste the commit URLs for each fix. Small, clean commits are a professional habit — each one should say exactly what changed.",
      "Every function now has a docstring. Paste one example docstring. Does it say WHAT the function returns, or just what it does? Both matter.",
      "Profile your slowest cell with %%time. Paste the before/after runtime. What change made it faster — vectorized pandas, earlier filtering, or something else?",
      "Add a profile photo and your name to the notebook header. Paste a screenshot. This is your work — put your name on it.",
      "One real person read your notebook. Paste their exact words about the one thing that confused them. External feedback is always more honest than self-review.",
      "You applied their feedback. Paste the commit. What did you change, and do you agree the change made it clearer?",
      "RETRO.md is committed. Paste one thing from the 'what I would do differently' section. Honesty in retros is the fastest way to grow.",
      "You wrote a 'How I built this' blog post on Medium or Dev.to. Paste the URL. This post will be indexed by search engines — it is your first piece of public writing as a data scientist.",
      "Push v1.0. PROJECT 1 COMPLETE. Paste the GitHub release URL. You just shipped your first end-to-end data science project."
    ]
  },

  11: {
    context: `In 2026, the data scientists getting hired fastest are not the ones who know the most algorithms — they are the ones who can move the fastest. AI tools have changed the workflow permanently.\n\nThis week you learn to use Cursor, GitHub Copilot, and Claude as a genuine copilot — not just for autocomplete, but for generating SQL from a plain-English question, debugging errors in seconds, drafting README sections, and getting code reviews in real time.\n\nThe goal is not to let AI think for you. It is to spend your energy on the parts that require your brain — problem framing, interpreting results, making judgment calls — and offload the mechanical parts to AI. That combination is what makes a data scientist extraordinary in 2026.`,
    mastery_questions: [
      "Open Cursor on your taxipulse repo. Press Cmd/Ctrl+K and type 'add a function that finds the 3 boroughs with the largest weekday-vs-weekend fare gap'. Paste the generated code. Did it work first try — or did you need to fix something?",
      "Use the ROLE prompt pattern: 'You are a senior data scientist reviewing this analysis. What are the 3 biggest weaknesses?' Paste the question and the response. Do you agree with the AI's critique?",
      "Generate a SQL query with AI: give it your taxi table schema and ask for 'the 3 boroughs with the largest gap between weekday and weekend average fares, using a CTE'. Paste the query. Run it — does it work?",
      "Use the STEP-BY-STEP pattern: 'Think step by step. How would you detect anomalous taxi trips?' Paste the prompt and the best idea it gives you. Implement it in pandas.",
      "You pasted an error into AI and got a fix in under 30 seconds. Paste the error, the AI's fix, and whether it worked. This is the daily superpower.",
      "prompts.md: paste your best prompt and your worst prompt from this week. What made the best one work? What made the worst one fail?",
      "Generate docstrings for 3 functions in your codebase using AI. Paste before/after for one example. Is the AI's writing better than your own?",
      "Use AI to draft a README section you have been avoiding. Paste the draft. What did you change before publishing it?",
      "Time yourself: do one analysis task WITHOUT AI help, then the same type of task WITH AI help. Paste both times and what was different about the experience.",
      "What is one thing AI cannot do in your data science workflow? Write 2 sentences about where human judgment is irreplaceable."
    ]
  },

  12: {
    context: `Taxis have numbers. Reddit has opinions — millions of them, updated every minute, on every topic imaginable.\n\nText data is the most abundant data on earth. Every tweet, review, comment, and news headline is a signal waiting to be decoded. This week you start Project 2: building a Reddit sentiment analyser that tracks how the tech community talks about three companies over time.\n\nYou will use the Reddit API to pull real posts, run a pretrained HuggingFace model to score each one positive or negative, and build a time-series chart that shows sentiment shifting over days and weeks. By Sunday you will have a live notebook that could tell a hedge fund analyst what the internet thinks about a stock before the market opens.`,
    mastery_questions: [
      "You got your Reddit API credentials and pulled your first posts. Paste the first 3 post titles from r/technology. How many posts can you pull per request?",
      "Run the pretrained sentiment model on 10 Reddit post titles. Paste the titles and their labels. Does the model get any of them obviously wrong?",
      "Plot daily sentiment score (% positive posts) for one subreddit over 30 days. Paste the chart. Is there any clear trend, or does it look random?",
      "Compare sentiment across 3 companies/topics in the same chart. Paste it. Which topic has the most volatile sentiment — and what might explain that?",
      "Run `df.groupby('company')['sentiment'].value_counts(normalize=True)`. Paste the result. Which company has the highest positive rate? Lowest?",
      "You hit the Reddit API rate limit. Paste the error. How did you handle it — sleep, retry, or cache? What is the responsible rate for the Reddit API?",
      "Find a post that the model scored incorrectly (you can tell because you read it). Paste the title, the model's label, and what you think the correct label is. Why did the model fail here?",
      "You pushed reddit-sentiment to GitHub. Paste the repo URL and the first 3 lines of your README. Does the README tell a stranger what the project does?",
      "What is the difference between sentiment analysis and opinion mining? Write 2 sentences. When would you use each?",
      "What would a hedge fund analyst need to make this useful — what is missing from your current analysis? List 3 specific improvements."
    ]
  },

  13: {
    context: `Pretrained models are powerful but they are generic. They do not know that on Reddit, "this stonks" means something different from "this is good investment advice."\n\nThis week you make the model yours. You will hand-label 200 posts yourself — actually reading them and deciding positive/negative/neutral — then train a classical ML classifier on that labelled data. The result will be a model that knows YOUR definition of sentiment, tuned to YOUR use case.\n\nThis is the real discipline of supervised learning: not picking an algorithm, but building the right training data. The labelling you do this week is more important than any hyperparameter you will tune later.`,
    mastery_questions: [
      "You labelled 200 Reddit posts. Paste your class distribution (how many positive, negative, neutral). Is it balanced? What would imbalance do to a classifier?",
      "You trained a logistic regression on the labelled data. Paste the classification report (precision, recall, F1 for each class). Which class performs worst and why?",
      "Compare your hand-tuned classifier vs the pretrained model on 20 posts you labelled. Paste a confusion table. Which model is more accurate on YOUR domain?",
      "You tried TF-IDF features. Paste the top 10 features by weight for the POSITIVE class. Do these words make sense to you?",
      "You tried a Naive Bayes baseline. Paste its F1 score. Is it better or worse than logistic regression? What does that tell you about the data?",
      "Compute inter-annotator agreement: give 20 posts to a friend or AI and compare labels. Paste the agreement percentage. What does low agreement mean for your training data?",
      "Find 3 posts where your classifier is confidently WRONG (high probability but wrong label). Paste them. What do these failure cases have in common?",
      "Add a 'not sure' or 'neutral' class to your labels. How does adding a third class change the F1 scores? Paste the new classification report.",
      "What is the bias-variance tradeoff in your current model? Write 2 sentences connecting it to your actual results.",
      "Push the labelled dataset and the trained model to your reddit-sentiment repo. Paste the commit URL. You just created a custom training dataset — that is real data science work."
    ]
  },

  14: {
    context: `A product team tells you: "We changed the homepage button from blue to green. Did it increase sign-ups?" Your instinct says yes — sign-ups went up 8%. But was that the button, or was it a holiday weekend, or a marketing campaign, or just random noise?\n\nA/B testing is the tool that answers this question rigorously. It is one of the most valuable skills a data scientist can have, because it is the only way to establish causation from observational data.\n\nThis week you design and simulate a full A/B test from scratch: hypothesis, sample size calculation, randomisation, running the test, and analysing the results. You will also learn when A/B tests fail — and why "statistical significance" is not the same as "business significance".`,
    mastery_questions: [
      "State your null and alternative hypothesis for a button-colour A/B test in formal notation. Write H0 and H1 in plain English AND as mathematical statements.",
      "Calculate the required sample size for 80% power, significance level 0.05, and a 2% baseline conversion rate with a 10% relative lift. Paste the formula and the number. How many users do you need per group?",
      "Simulate the A/B test: generate synthetic conversion data for control and treatment groups. Paste the conversion rates for each group.",
      "Run a two-proportion z-test. Paste the z-statistic and p-value. Is your simulated result significant?",
      "What is a Type I error in this context? What is a Type II error? Which is more damaging in a business A/B test — and why does the answer depend on the situation?",
      "Run the test again but with only 100 users per group. Paste the p-value. Is it still significant? What does this tell you about underpowered tests?",
      "Compute the confidence interval for the lift (treatment rate minus control rate). Paste it. Is the CI consistent with the p-value?",
      "Design a SEQUENTIAL test using a stopping rule. What is the advantage over running a fixed-sample test?",
      "Find one example of a famous A/B test that went wrong — paste a 2-sentence summary. What was the mistake?",
      "Write a 3-bullet 'results summary' for your simulated test that you could send to a product manager. Paste it. Did you include effect size and CI, not just p-value?"
    ]
  },

  15: {
    context: `Your classical ML classifier from Week 13 knows sentiment. But it does not understand language — it sees bag-of-words, not meaning.\n\nThis week you fine-tune DistilBERT, a transformer model that actually reads sentences the way a human does. You will take a pretrained language model and adapt it to your specific Reddit labelling task in a few hours of GPU training — no PhD required.\n\nFine-tuning is one of the most powerful techniques in modern NLP. It lets you get near-human performance on a custom classification task using 200 labelled examples instead of millions. After this week, you will understand why GPT, BERT, and every modern language model works the way it does.`,
    mastery_questions: [
      "You loaded DistilBERT from HuggingFace. Paste the model.num_parameters() output. How many parameters does a 'small' transformer have?",
      "You tokenised your first Reddit post. Paste the token IDs for a 10-word sentence. What does the [CLS] token do — why is it special?",
      "Fine-tuning is running. Paste the training loss at epoch 1 and epoch 3. Is it decreasing? What would a flat loss curve tell you?",
      "Evaluate on your hold-out set. Paste the F1 score. How does it compare to your Week 13 logistic regression? What accounts for the difference?",
      "Find 3 examples where DistilBERT is correct but your logistic regression was wrong. Paste the posts. What feature of the text helps BERT but not bag-of-words?",
      "Plot the confusion matrix for the fine-tuned model. Paste it. Which class still causes the most errors?",
      "What is transfer learning? Write 2 sentences using the DistilBERT fine-tuning as your concrete example. Why does it require so much less labelled data than training from scratch?",
      "Run inference on 50 NEW posts the model has never seen. Paste 5 examples with predictions. Do you trust the outputs?",
      "Compare inference speed: DistilBERT vs logistic regression on 1000 posts. Paste both times. When would you choose the faster model despite lower accuracy?",
      "Push the fine-tuned model to your reddit-sentiment repo. Paste the commit URL. You just fine-tuned a transformer — that is a skill most ML engineers do not have until year 2 of their career."
    ]
  },

  16: {
    context: `Your model predicts. But WHY does it predict what it predicts?\n\nInterpretability is not optional in data science. It is the difference between a model that gets used and a model that gets shelved because nobody trusts it. A healthcare model that says "high risk" and cannot explain why will never be deployed. A fraud model that flags a transaction without a reason will face regulatory scrutiny.\n\nThis week you learn SHAP — the gold standard for model explanations. You will apply it to your fare prediction model and your sentiment model, and build visualisations that show exactly which features are driving each prediction. By Sunday you will be able to answer the hardest question in machine learning: "why did the model decide that?"`,
    mastery_questions: [
      "You computed SHAP values for your fare prediction model. Paste the summary plot. What are the top 3 most important features — does the ranking match your intuition?",
      "Pick one specific fare prediction. Paste the SHAP waterfall plot for it. In plain English, what is this chart saying about WHY the model predicted that fare?",
      "Which feature has the most non-linear SHAP dependence plot? Paste it. What does the shape of the relationship tell you?",
      "Compute SHAP for your sentiment model on one POSITIVE and one NEGATIVE post. Paste both explanations. Which words are most responsible for each prediction?",
      "Find a prediction where SHAP reveals the model is using a spurious feature — something that correlates with the label but should not cause it. Paste the example. What is the business risk?",
      "What is the difference between global feature importance (averaged over all predictions) and local feature importance (for one prediction)? When would you show each to a stakeholder?",
      "Build a SHAP beeswarm plot for your fare model. Paste it. What does the spread of dots for trip_distance tell you about consistency?",
      "Explain SHAP in one paragraph to a non-technical manager. No equations, no code — just the idea. Paste your explanation.",
      "What is the difference between SHAP and LIME? Write 2 sentences. When would you choose one over the other?",
      "Commit a SHAP analysis notebook to your taxipulse-nyc repo. Paste the URL. This is now the most sophisticated part of your portfolio."
    ]
  },

  17: {
    context: `Your training data is limited. Sometimes the data you need simply does not exist — patients with rare diseases, financial fraud events that only happen once a year, customer segments too small to train on.\n\nSynthetic data generation is how you solve this. This week you will learn to create realistic fake data using statistical methods and generative models, then validate that the synthetic data is actually useful for training.\n\nThis is a surprisingly powerful skill. It is used in healthcare, finance, and autonomous vehicles — anywhere real data is scarce, private, or expensive. After this week you will never be blocked by "I don't have enough training data" again.`,
    mastery_questions: [
      "You generated synthetic taxi trips using random sampling from the original distributions. Paste df.describe() for real vs synthetic data side by side. Are the distributions similar?",
      "Run a Kolmogorov-Smirnov test between the real and synthetic fare distributions. Paste the statistic and p-value. What does the p-value tell you here — does the synthetic data fool the test?",
      "Train your fare model on synthetic data only, then evaluate on real data. Paste the MAE. How much worse is it than training on real data?",
      "Use CTGAN or SDV to generate a synthetic version of the taxi dataset. Paste the generation code and the time it took. What makes this approach better than simple random sampling?",
      "Build a 'train on synthetic, test on real' experiment. Paste the F1 or MAE. How useful is synthetic data as a training source?",
      "Visualise the synthetic vs real distributions for 3 columns on one chart. Paste it. Which feature was hardest to replicate synthetically?",
      "What is the privacy risk of synthetic data? Write 2 sentences about how a bad synthetic generator can leak real records.",
      "Use synthetic data to augment your labelled Reddit sentiment dataset (double its size). Paste the F1 score before and after augmentation. Did it help?",
      "What is the difference between interpolation augmentation (like SMOTE) and full generative synthetic data? Write 3 sentences.",
      "Commit a synthetic-data notebook to one of your repos. Paste the URL. This is a skill that appears on maybe 5% of data science GitHub profiles."
    ]
  },

  18: {
    context: `Your Reddit sentiment analysis is running in notebooks. But the tech world does not read Jupyter notebooks — it uses dashboards.\n\nThis week you build a live dashboard that pulls new Reddit data every hour, runs it through your fine-tuned model, and displays the sentiment trend in real time. Users can pick a topic, see the last 7 days of sentiment, and watch it update.\n\nThis is the production version of your NLP work. By Sunday your dashboard will be live, refreshing automatically, and showing real patterns in how the internet talks about tech companies right now. That is a genuinely impressive live system.`,
    mastery_questions: [
      "Your Streamlit app pulls fresh Reddit data. Paste a screenshot showing live data from the last 24 hours. How often does it refresh?",
      "The sentiment trend chart updates automatically. Paste a screenshot for one topic. What is the trend over the last 7 days — and what news event might explain it?",
      "You added @st.cache_data with a TTL. Paste the code. What happens if you refresh the page after the TTL expires? What happens before it?",
      "Users can compare 3 topics side by side. Paste a screenshot. Which topic has the most volatile sentiment — and does that make sense given what you know about it?",
      "You handle Reddit API failures gracefully (rate limits, downtime). Paste the error-handling code. What does the dashboard show when the API is unavailable?",
      "Add a 'most positive post' and 'most negative post' card for the selected topic. Paste a screenshot. Are the highlighted posts actually the most extreme examples?",
      "The dashboard shows a post that the model misclassifies. You can tell because you read it. Paste the post and explain why the model got it wrong. What would you do to fix it?",
      "Measure dashboard load time from click to display. Paste the time. What is the single biggest bottleneck — API call, model inference, or data loading?",
      "Deploy the dashboard to Streamlit Cloud. Paste the live URL. Open it from a different device — does it work?",
      "Share the live URL in your check-in. You have a working NLP product running on real data. Paste the URL and one finding from today's data."
    ]
  },

  19: {
    context: `Streamlit is great for demos. But production services need more: containerisation, proper HTTP APIs, health checks, logging, and the ability to scale.\n\nThis week you wrap your Reddit sentiment model in a FastAPI service, containerise it with Docker, and deploy the container. Anyone can now query your model via a real REST API — no Python environment required on their end.\n\nDocker is the skill that unlocks DevOps conversations, makes you a better collaborator with engineers, and is listed in nearly every senior data scientist job description. After this week you will understand why.`,
    mastery_questions: [
      "Your FastAPI app is running. Paste the /docs page URL (FastAPI generates this automatically). Send one POST request via the Swagger UI — paste the response.",
      "Your Dockerfile is written. Paste it. What does each line do — can you explain FROM, RUN, COPY, CMD without looking it up?",
      "Build the Docker image. Paste the docker build command and the image size. Why is image size important for production deployments?",
      "Run the container locally. Paste the docker run command and one successful API call to /predict inside the container.",
      "Your container handles errors gracefully. Send a malformed request. Paste the error response. Is it informative enough for the caller to fix their request?",
      "You added structured logging to the FastAPI app. Paste 3 example log lines from a real request. What fields should every log line have?",
      "Push the Docker image to Docker Hub or GitHub Container Registry. Paste the image URL. Why push the image rather than just the Dockerfile?",
      "Deploy the container to a cloud host (Render, Railway, or Fly.io). Paste the live URL. Run one prediction against the live container.",
      "What is the difference between a Docker container and a Docker image? Write 3 sentences. Use a concrete analogy (like recipe vs cake, or class vs object).",
      "Push the v0.5 tag to reddit-sentiment. Paste the release URL. Your NLP project now has a real production API."
    ]
  },

  20: {
    context: `Project 2 is done in terms of features. This week you make it done in terms of quality.\n\nYou are going to do the same thing you did with TaxiPulse v1.0: polish everything until it reads cleanly, write an honest retro, get external feedback, and ship with a v1.0 tag. But this project is more sophisticated — it involves NLP, fine-tuning, a live API, and a dashboard. Your retro will be richer.\n\nAfter this week, you will have two polished, end-to-end projects on your GitHub profile. That is the portfolio of a data scientist who ships things, not just someone who takes courses.`,
    mastery_questions: [
      "List 10 rough edges across the reddit-sentiment project (code quality, README, API docs, error handling, test coverage). Paste the list.",
      "Fix the 5 most important. Paste commit URLs. Each should be a focused, well-named commit.",
      "Your README tells the complete story: what the project does, how to run it, what you found. Paste the first 10 lines of your README. Does a stranger immediately know what they are looking at?",
      "You wrote tests for the API. Paste the test file. What is the minimum set of tests every ML API should have?",
      "One real person used your dashboard and gave feedback. Paste their reaction. Did they find it useful, or did something confuse them?",
      "Apply their feedback. Paste the commit. Write one sentence about why the change matters.",
      "RETRO.md is committed. Paste one thing from 'what I would do differently'. What did you learn from building an NLP project end to end?",
      "What was the biggest technical challenge of Project 2? Write 3 sentences. How did you solve it?",
      "Write a blog post or LinkedIn post about your Reddit sentiment project. Paste the URL. What part of the project are you most proud of?",
      "Push v1.0. PROJECT 2 COMPLETE. Paste the release URL. Two projects shipped. You are building something real."
    ]
  },

  21: {
    context: `Time series data is different from everything you have worked with so far. The order matters. The past predicts the future. And the patterns — seasonality, trends, cycles — repeat in ways you can model and forecast.\n\nProject 3 is Energy Forecast. You are going to use real hourly electricity demand data from a national grid — tens of thousands of timestamped observations — and build models that predict tomorrow's demand. By Sunday you will have your first working baseline model and understand the fundamental patterns in the data.\n\nEnergy forecasting is not an academic exercise. Grid operators use models exactly like yours to decide how much power to generate, which plants to spin up, and how to price electricity in real time. Your model will run on the same kind of data.`,
    mastery_questions: [
      "You loaded the energy demand time series. Paste df.head() and df.dtypes. Is the datetime column parsed correctly? Run df.index.freq — what is the frequency of the data?",
      "Plot the full time series. Paste the chart. Describe 3 patterns you see: a long-term trend, a seasonal cycle, and a shorter weekly pattern.",
      "Decompose the series into trend, seasonality, and residual. Paste the decomposition plot. What percentage of the variance does the seasonal component explain?",
      "Compute the autocorrelation function (ACF). Paste the plot. At which lag does autocorrelation become insignificant? What does that lag mean in real-world terms (hours? days?)?",
      "Your baseline model is a naive forecast (tomorrow = today). Paste the MAE and RMSE. This is your benchmark — every model you build must beat this.",
      "What is stationarity and why does it matter for time series models? Run the Augmented Dickey-Fuller test on your data. Paste the result.",
      "Plot demand by hour of day and by day of week as box plots. Paste both. Which hour and which day have the highest median demand? Does this match real-world intuition?",
      "Find the anomaly: there is at least one day in the dataset where demand was dramatically different from the surrounding days. Paste the date and the demand value. What do you think caused it?",
      "Split the data into training (80%) and test (last 20%) sets. Why do you use the LAST 20% for testing — not a random 20%?",
      "Push your energy-forecast repo with an exploratory notebook. Paste the repo URL. You are now working with professional-grade time series data."
    ]
  },

  22: {
    context: `You found the patterns in the energy data last week. Now you are going to exploit them to make predictions.\n\nARIMA is the classical workhorse of time series forecasting. It models three things: how the series relates to its own past (AR), how to handle non-stationarity (I), and how the error terms relate to past errors (MA). Together they give you a principled, interpretable forecast.\n\nARIMA has been running inside energy companies, central banks, and supply chain systems for decades. Learning it properly means you can look at any time series — electricity, stock prices, website traffic, product demand — and know exactly where to start.`,
    mastery_questions: [
      "You fit an ARIMA model. Paste the model summary (the key lines: AIC, AR coefficients, MA coefficients). What does the AIC tell you and why do lower values indicate a better model?",
      "Plot the ARIMA forecast vs actual demand for the test period. Paste the chart. Does the model capture the daily cycle?",
      "Paste the RMSE of your ARIMA model. Compare it to the naive baseline from Week 21. How much better is ARIMA?",
      "You searched for the best (p, d, q) parameters. Paste the search results (top 5 combinations by AIC). Which combination won?",
      "Plot the residuals of your ARIMA model. Paste the chart. Are they white noise (random around zero), or is there still a pattern the model missed?",
      "Run the Ljung-Box test on the residuals. Paste the p-value. What does a significant result mean about your model's fit?",
      "What is the difference between AR and MA components in plain English? Write one sentence for each — no equations, just the idea.",
      "The model struggles on weekends. Hypothesise why, and describe one change you would make to the model to handle it better.",
      "Forecast the next 48 hours with your ARIMA model. Paste the forecasted values and the confidence intervals. Are the confidence intervals narrow or wide — what does that tell you?",
      "Commit the ARIMA notebook to energy-forecast. Paste the commit URL. You just trained a model that real energy analysts use."
    ]
  },

  23: {
    context: `ARIMA requires careful parameter selection and assumes the seasonal pattern is stable. Prophet — built by Facebook's data science team and open-sourced — handles both of these problems automatically.\n\nProphet was designed for analysts, not ML engineers. You feed it a DataFrame with two columns (ds for date, y for value), call .fit(), call .predict(), and get a forecast with decomposed components and uncertainty intervals. It handles holidays, missing data, and multiple seasonalities out of the box.\n\nThis week you will compare Prophet against your ARIMA baseline and see where each one wins. Understanding WHY models perform differently on the same data is one of the most valuable skills in time series work.`,
    mastery_questions: [
      "You fit Prophet to your energy data. Paste the 5 lines of code that did it. What is the simplest thing about Prophet compared to ARIMA?",
      "Plot the Prophet forecast vs actual demand. Paste the chart. How well does it capture the daily seasonality?",
      "Paste the RMSE of Prophet vs ARIMA. Which is better? Is the improvement consistent across all hours of the day?",
      "Plot the Prophet component breakdown (trend, weekly, daily). Paste it. What does the daily component tell you about when electricity demand peaks?",
      "Add the national holidays of your energy dataset's country to Prophet. Paste the code. Does adding holidays improve RMSE?",
      "Prophet gives you uncertainty intervals. Paste the forecast chart with the shaded interval. Are the intervals reasonable — do they widen appropriately as you forecast further into the future?",
      "Run a cross-validation using Prophet's built-in tools. Paste the MAE by forecast horizon (1h, 6h, 24h, 48h). At which horizon does accuracy degrade the most?",
      "What type of seasonality does your energy data have — daily, weekly, yearly? Paste the evidence from the Prophet components plot.",
      "In which specific scenarios does ARIMA outperform Prophet in your data? Write 2 sentences with specific evidence.",
      "Commit the Prophet notebook. Paste the commit URL. You have now compared two professional-grade forecasting approaches."
    ]
  },

  24: {
    context: `ARIMA and Prophet are powerful but they are essentially regression models over time. They cannot capture complex non-linear patterns across long sequences.\n\nLSTMs (Long Short-Term Memory networks) are a class of neural network designed specifically for sequences. They have a memory — they can learn that what happened 48 hours ago matters more than what happened 2 hours ago. They are used in speech recognition, language models, and state-of-the-art time series forecasting.\n\nThis week you build your first PyTorch neural network from scratch. No sklearn shortcuts — you will write the model class, the training loop, and the evaluation yourself. By Sunday you will understand exactly how a neural network learns, because you will have written every step by hand.`,
    mastery_questions: [
      "You defined your LSTM model class in PyTorch. Paste the __init__ and forward methods. How many trainable parameters does your model have?",
      "Your training loop is running. Paste the training loss at epoch 1, 5, and 10. Is it decreasing? At what point does it plateau?",
      "Plot training loss vs validation loss across epochs. Paste the chart. Do you see overfitting — where validation loss starts increasing while training loss keeps decreasing?",
      "Paste the test RMSE for your LSTM. How does it compare to ARIMA and Prophet? Where in the forecast horizon (1h, 6h, 24h) does LSTM perform best?",
      "What is the vanishing gradient problem and why were LSTMs designed to solve it? Write 3 sentences. How does the cell state help?",
      "You added dropout to your LSTM. Paste the before/after RMSE on the validation set. Did regularisation help?",
      "Forecast 48 hours with your LSTM. Paste the forecast chart. Do you see any artefacts — like the forecast drifting toward the mean or oscillating unrealistically?",
      "What hyperparameters matter most for your LSTM's performance? Test at least 2 (e.g., hidden size, number of layers). Paste the results.",
      "Run all 3 models (ARIMA, Prophet, LSTM) on the same test period. Paste a single chart comparing all 3 forecasts vs actual. Which one would you choose for production and why?",
      "Commit the PyTorch LSTM notebook. Paste the commit URL. You just wrote a neural network from scratch — that is a level of understanding most data scientists lack."
    ]
  },

  25: {
    context: `Building a model is 20% of a data scientist's job. Making sure it keeps working in production is the other 80%.\n\nThis week you learn MLOps — the practices that turn a notebook experiment into a reliable, monitored, version-controlled production system. You will use MLflow to track experiments (never lose a run again), detect data drift (when the world changes and your model stops working), and build an alert when your model's performance degrades.\n\nEvery model degrades over time. The energy patterns you trained on six months ago are different from today's patterns. The question is not IF your model will drift — it is WHEN you will notice.`,
    mastery_questions: [
      "MLflow is tracking your experiments. Paste a screenshot of the MLflow UI showing at least 3 runs. What information does it automatically log?",
      "Compare two runs in MLflow: one with ARIMA and one with Prophet. Paste the comparison table. What metric are you using to compare them?",
      "You logged a model artifact to MLflow. Paste the code that logs and loads it. Why is version-controlling models as important as version-controlling code?",
      "Compute Population Stability Index (PSI) between your training energy distribution and a more recent holdout period. Paste the PSI value. Is drift detected?",
      "Build a simple alert: if the model's hourly MAE exceeds a threshold for 3 consecutive hours, print a warning. Paste the code. What threshold did you choose and why?",
      "What is concept drift vs data drift? Write 2 sentences for each with a concrete energy forecasting example of each type.",
      "You retrained your model on more recent data. Did the RMSE improve? Paste before/after. How often should a production energy model retrain?",
      "What is a model card and why does it matter? Write the model card for your energy forecast model (4 fields: intended use, training data, limitations, performance metrics).",
      "What would a CI/CD pipeline for an ML model look like? Write 5 steps. How is it different from a software CI/CD pipeline?",
      "Commit the MLflow experiment tracking setup to energy-forecast. Paste the URL. You just added professional MLOps practices to your project."
    ]
  },

  26: {
    context: `Your laptop can handle 3.5 million taxi rows. What about 350 million? Or a continuous stream of data arriving every second from 10,000 smart meters?\n\nThis week you learn to work at scale. BigQuery is Google's fully-managed cloud data warehouse that can query terabytes in seconds. You will run your TaxiPulse SQL analysis on the FULL NYC TLC dataset — all years, all trips, hundreds of millions of rows — directly in BigQuery's public dataset, for free.\n\nCloud data tools are not optional for senior data scientists. After this week you will have BigQuery on your resume, understand the difference between OLAP and OLTP, and have queried a dataset that would crash pandas.`,
    mastery_questions: [
      "You connected to BigQuery's public NYC TLC dataset. Run SELECT COUNT(*) FROM `bigquery-public-data.new_york_tlc.trips`. Paste the row count. How many total NYC taxi trips are in this dataset?",
      "Run the equivalent of your Week 1 busiest-hour query on the FULL dataset (all years, not just October 2023). Paste the query and results. Does the peak hour change when you have all the data?",
      "Query cost: paste the bytes scanned by your last query. How much would this cost at BigQuery's on-demand pricing? How does partitioning reduce cost?",
      "Use a window function in BigQuery to compute the running total of trips by month. Paste the query and first 10 rows of output.",
      "What is the difference between OLAP and OLTP? Write 2 sentences. Give one example of each from your data science experience.",
      "Connect BigQuery to Python with the bigquery client library. Run a query and load the result into a pandas DataFrame. Paste the 3-line code.",
      "Export your energy forecast results to BigQuery. Paste the table schema. Why might you store model predictions in a data warehouse?",
      "What is a partitioned table and why does it matter for query cost? Partition the TLC trips by pickup month. Paste the DDL.",
      "Run the same analytical query from Week 4 (borough × hour analysis) in BigQuery. How does query time compare to SQLite on your laptop?",
      "Paste your BigQuery project ID and the URL of the public dataset you queried. You just ran analytics on a dataset that would take hours to download."
    ]
  },

  27: {
    context: `Three weeks of time series. ARIMA, Prophet, LSTM, MLflow, BigQuery. Now you make it all presentable.\n\nThis is the polish week for Project 3. The same discipline as TaxiPulse v1.0 and Reddit Sentiment v1.0, but applied to a more technically complex project. Your energy forecast repo will have three notebooks, a comparison table, a deployment pipeline, and a retro.\n\nEnergy forecasting is a domain where your work could genuinely make an impact — better forecasts mean less wasted generation, lower emissions, lower prices. Your retro this week should reflect on that context.`,
    mastery_questions: [
      "Your final model comparison table is in the README. Paste it (model name, RMSE, MAE, training time). Which model would you deploy and why?",
      "Every notebook has a clear narrative structure: setup, exploration, modelling, evaluation. Paste the first 5 lines of your best notebook's markdown. Does it tell a story?",
      "You profiled the slowest operation. Paste the before/after time. What was the bottleneck?",
      "One person reviewed your energy-forecast repo. Paste their top question or critique. Did you expect it?",
      "Fix their critique. Paste the commit. What does this change make clearer?",
      "RETRO.md is committed. Paste one thing from 'what I would do differently'. Was the LSTM worth the complexity for the improvement it gave?",
      "What would make this model production-ready? List 5 specific gaps between your current repo and what a real grid operator would need.",
      "Write a 2-sentence business case for deploying your energy forecast model. What decisions would it improve and what is the estimated value?",
      "Push v1.0 of energy-forecast. Paste the release URL. Three complete projects now live on your GitHub profile.",
      "PROJECT 3 COMPLETE. You have now built a time series forecasting pipeline from data exploration to LSTM to deployment monitoring. What was the hardest part?"
    ]
  },

  28: {
    context: `Three projects shipped. Now you get to decide what you build next.\n\nThe capstone is your most important piece of work. It should demonstrate everything you have learned — data acquisition, exploration, modelling, evaluation, deployment, and communication — in a domain you genuinely care about. This week you pick the topic, scope the project, and define what success looks like.\n\nGood capstones are specific. Not "analyse social media data" but "track how sentiment about climate change shifts on Reddit after major weather events." Not "predict prices" but "forecast Gambia's fuel import costs using CBG exchange rates and Brent crude prices."\n\nThe more specific your scope, the more impressive the result.`,
    mastery_questions: [
      "Write your capstone one-liner: 'I will use X data to answer Y question for Z audience.' Paste it. Is it specific enough that a stranger immediately knows what you are building?",
      "List 3 potential datasets and their sources. For each, explain how you would get the data and whether it is truly available. Paste the list.",
      "Your chosen dataset is downloaded or accessible. Paste df.shape or the equivalent. What is the first thing that surprised you about the raw data?",
      "Write the project scope: what you will and will NOT do in 3 weeks. Paste it. What is the one core question your model will answer?",
      "Define success: what is the specific metric that would make this capstone pass? Paste it as a measurable statement (e.g. 'RMSE below X' or 'F1 above Y').",
      "Who is the audience for this project? Write 3 sentences describing a specific person who would use your results. What decision would your analysis help them make?",
      "List 3 related papers or existing projects on this topic. How is your approach different or better?",
      "Write the project README introduction (first 3 paragraphs). Paste it. Does it hook a reader in the first sentence?",
      "What is the biggest risk to this project completing successfully? Write 2 sentences about the risk and your mitigation plan.",
      "Commit your capstone repo with README, scope document, and raw data. Paste the repo URL. The scoping is the hardest part — you are past it."
    ]
  },

  29: {
    context: `Last week was planning. This week is building.\n\nYour capstone will not go perfectly. Something will take longer than expected. A model will underperform. The data will be messier than the README suggested. That is normal — it is what the retro is for.\n\nThe discipline this week is: keep moving. Write messy code first, then clean it up. Get a working end-to-end pipeline before optimising any part of it. A working model with 70% accuracy is infinitely better than a 95%-accurate model you never finish.`,
    mastery_questions: [
      "Your data pipeline is end-to-end: raw data in, cleaned data out, ready for modelling. Paste the final row count and the list of columns in the cleaned dataset.",
      "You ran a baseline model. Paste the metric. Does it beat a naive baseline (e.g. predicting the mean, or the most common class)? If not — why not, and what do you do next?",
      "You hit one major unexpected obstacle this week. Describe it in 3 sentences. How did you get past it?",
      "Your most important visualisation is committed. Paste the chart. What single insight does it convey?",
      "You tried at least 2 different modelling approaches. Paste both metrics. Which is ahead and why?",
      "What did you throw away this week — an idea, a feature, or a model approach that seemed promising but did not work? Paste one example.",
      "What is the current biggest gap between your current results and your success criteria? Write 2 sentences.",
      "Commit everything that is working. Paste the commit URL. Even messy progress should be saved — you may need to go back.",
      "Write a 3-bullet mid-project status update: what is done, what is in progress, what is blocked. Paste it.",
      "What would you cut from the scope if you had to ship in 48 hours? Being able to answer this question cleanly is a professional skill."
    ]
  },

  30: {
    context: `Your capstone is shipped. You have built, from scratch, a complete data science project in a domain you chose, with data you found, answering a question that matters.\n\nThis week is about finishing like a professional. Polish the code, write the README as if 1000 people will read it, record a walkthrough, and write the most honest retro of the programme.\n\nYou have come from "never written Python" to "shipped 4 end-to-end data science projects." The capstone is the proof. Make sure it is worth showing.`,
    mastery_questions: [
      "Your capstone README is complete: title, dataset, method, results, how to reproduce. Paste the first paragraph. Would a stranger know exactly what you built?",
      "Your results section clearly states the answer to the question you set out to answer. Paste the 3-sentence results summary. Is the number specific and honest?",
      "Every notebook runs clean from top to bottom with a fresh kernel. Paste the output of the final cell in your main notebook.",
      "You recorded a 3-minute screen walkthrough of the project. Paste the YouTube or Loom URL. Can a non-technical person follow it?",
      "One real person (not a classmate) reviewed the repo. Paste their feedback. What surprised them — positively or negatively?",
      "RETRO.md is the most complete one you have written. Paste the 'what I learned' section. What is the most important technical lesson?",
      "Compare all 4 projects (TaxiPulse, Reddit Sentiment, Energy Forecast, Capstone) on one axis: which did you learn the most from? Write 3 sentences.",
      "Push the final v1.0 tag. Paste the GitHub release URL with the tag.",
      "Update your GitHub profile README to feature all 4 projects. Paste the URL to your profile. This is your public portfolio.",
      "CAPSTONE COMPLETE. You are a data scientist. You have the GitHub repos to prove it. What do you do next?"
    ]
  },

  31: {
    context: `You have 4 polished projects, real deployed models, and a GitHub profile that demonstrates end-to-end data science. Now you need to be able to talk about all of it.\n\nThis week is about converting your project experience into interview-ready stories. You will practise the STAR format for behavioural questions, work through 10 common technical interview questions with concrete answers from YOUR projects, and build the one-page portfolio site that makes every recruiter look twice.\n\nMost data science interviews are lost not because of technical gaps — they are lost because candidates cannot explain what they did in plain English. You will fix that this week.`,
    mastery_questions: [
      "Write the STAR story for TaxiPulse: Situation, Task, Action, Result in 4 sentences. Paste it. Is the Result specific — does it include numbers?",
      "Answer this question as if in an interview: 'Tell me about a time when your model underperformed. What did you do?' Paste the 3-paragraph answer using one of your projects.",
      "Answer: 'What is the difference between variance and bias? Give me an example from your own work.' Paste the answer.",
      "Answer: 'Walk me through how you would build a fraud detection model for a bank, start to finish.' Paste a 5-step answer.",
      "Answer: 'What metrics would you use to evaluate a recommendation system — and why not just accuracy?' Paste the answer.",
      "Build a one-page portfolio site (GitHub Pages, Notion, or simple HTML). Paste the URL. Does it have a bio, 4 project cards, and your contact info?",
      "Write a LinkedIn 'About' section that mentions your 4 projects in 3 sentences. Paste it. Would a recruiter want to know more after reading it?",
      "Do a mock interview with a friend or AI: 5 technical questions, timed, 3 minutes each. Paste the question you found hardest and your answer.",
      "Research 3 companies you would genuinely want to work at. For each, write one question their DS team is probably trying to answer. Paste the list.",
      "Congratulations. You finished the Data Science track. What is the next step you are taking tomorrow?"
    ]
  },

  32: {
    context: `Large language models changed data science. Not just as tools — but as subjects of study. Fine-tuning a language model is now a core skill for advanced data scientists, and LoRA makes it accessible even on a single GPU.\n\nThis week you will fine-tune a real language model (Mistral 7B or LLaMA 3 8B) using LoRA (Low-Rank Adaptation) and PEFT (Parameter-Efficient Fine-Tuning). You will adapt the model to a specific task — summarising research papers, classifying support tickets, or generating code in a specific style — using a few hundred training examples.\n\nThis is the cutting edge. Most ML engineers at top companies only recently learned these techniques. You are learning them now.`,
    mastery_questions: [
      "You loaded the base model. Paste model.num_parameters() and the LoRA configuration. How many parameters are actually trainable with LoRA vs the full model?",
      "Your fine-tuning is running. Paste the training loss at step 1, 50, and 200. Is it decreasing steadily? At what point does the loss curve flatten?",
      "Run inference with the base model and the fine-tuned model on the same prompt. Paste both outputs. What changed?",
      "What is the difference between full fine-tuning and LoRA? Write 3 sentences. Why does LoRA work — what is the mathematical intuition?",
      "Evaluate your fine-tuned model on a hold-out set. Paste the metric (BLEU, ROUGE, or F1 depending on your task). How much better is it than the base model?",
      "The model hallucinates on one example. Paste the prompt and the output. What does the model get wrong — and why is this failure mode common in fine-tuned models?",
      "Push the LoRA weights to HuggingFace Hub. Paste the model URL. Why is it enough to share the LoRA weights rather than the full model?",
      "What is catastrophic forgetting? Write 2 sentences. Did your fine-tuned model lose any general capability?",
      "Compare the inference cost of the fine-tuned model vs a full fine-tuned model of the same base. What is the advantage of PEFT at inference time?",
      "Commit your fine-tuning code and share the HuggingFace model link in your check-in. You just fine-tuned a 7B+ parameter language model."
    ]
  },

  33: {
    context: `Fine-tuning changes what a model knows. But it is expensive and slow to update. What if you need the model to answer questions about documents that change every day — a new legal filing, a fresh research paper, the latest company report?\n\nRAG (Retrieval-Augmented Generation) solves this by combining a retrieval system (a vector database that finds relevant documents) with a language model (that generates the answer). The model does not need to know the answer — it retrieves the relevant context and reasons from it.\n\nThis is how most production LLM applications work. This week you build one from scratch: load your documents, embed them, store them in a vector database, and wire up a language model that can answer questions about them accurately.`,
    mastery_questions: [
      "You embedded a set of documents. Paste the embedding shape for one document. How many dimensions does your embedding model produce?",
      "You stored embeddings in a vector database. Run a semantic search query. Paste the top 3 retrieved documents and their similarity scores.",
      "Your RAG pipeline answers a question. Paste the question, the retrieved context, and the generated answer. Is the answer grounded in the retrieved context?",
      "Ask the system a question it CANNOT answer from the documents. Paste the response. Does it hallucinate, or does it correctly say 'I don't know'?",
      "What is the difference between keyword search and semantic search? Give one concrete example where semantic search wins.",
      "Measure the latency of your RAG pipeline: time from question to answer. Paste the breakdown (retrieval time vs generation time). Where is the bottleneck?",
      "Add a re-ranking step: after initial retrieval, re-rank the top 10 by relevance. Paste the before/after quality for 3 examples. Did re-ranking help?",
      "What is the chunk size you used for your documents? Paste it. Experiment with a smaller chunk size — does retrieval quality improve or degrade?",
      "Deploy the RAG system as a FastAPI endpoint. Paste the /ask endpoint URL and one successful response.",
      "Push the RAG project to GitHub. Paste the repo URL. This is one of the most in-demand skills in the 2026 job market."
    ]
  },

  34: {
    context: `Computers cannot see. But they can learn to recognise patterns in pixel arrays — and that is effectively what vision is.\n\nThis week you build computer vision models that can classify images. You will start with a CNN (Convolutional Neural Network), then use transfer learning to adapt a pretrained Vision Transformer to your specific task. By Sunday you will have a model that can classify images in a domain you choose — medical images, satellite photos, product quality checks — with professional-grade accuracy.\n\nComputer vision is one of the most impactful subfields of AI. It reads X-rays, drives cars, monitors factories, and identifies crops from space. After this week you will understand how it works.`,
    mastery_questions: [
      "You built a CNN. Paste the model summary (layers, parameter count). What does a convolutional layer actually do to an image — describe it in 2 sentences without equations?",
      "Your CNN is training. Paste the train/val accuracy at epoch 1 and epoch 5. Are you seeing overfitting? How can you tell?",
      "You applied transfer learning with a pretrained ViT or ResNet. Paste the test accuracy. How much better is transfer learning vs training from scratch?",
      "Plot the confusion matrix for your classifier. Paste it. Which class is most confused with which other class — and why might that be?",
      "Visualise the convolutional filters from the first layer. Paste the image. What patterns are the filters detecting?",
      "What is the difference between a CNN and a Vision Transformer? Write 3 sentences. When does each architecture tend to perform better?",
      "Apply data augmentation (rotation, flip, colour jitter). Paste the before/after test accuracy. Did augmentation help?",
      "Find a prediction the model is very wrong about. Paste the image and the model's confidence. What does the image look like — why did the model fail?",
      "Use Grad-CAM to visualise which parts of the image the model focuses on for one prediction. Paste the heatmap. Does it focus on the right region?",
      "Push your vision model repo to GitHub. Paste the URL. You now have a computer vision project on your profile."
    ]
  },

  35: {
    context: `Correlation is everywhere. Causation is rare and precious.\n\nMost data scientists stop at "X is correlated with Y." Causal inference asks the harder question: "Does X cause Y, and if I change X, what happens to Y?" The difference matters enormously when you are trying to make decisions, not just describe patterns.\n\nThis week you learn the tools of causal inference: potential outcomes framework, randomised experiments, difference-in-differences, propensity score matching, and instrumental variables. These are the tools economists use to evaluate policies and tech companies use to understand the true effect of product changes.`,
    mastery_questions: [
      "Define the average treatment effect (ATE) in plain English using one of your datasets as an example. No equations — just the idea and a concrete scenario.",
      "Build a difference-in-differences estimate for a treatment in your data. Paste the code and the estimated effect. What assumptions does DiD require?",
      "Use propensity score matching to estimate a causal effect. Paste the matched sample balance table. Is covariate balance good after matching?",
      "What is the fundamental problem of causal inference? Write 2 sentences. Why can we never directly observe the counterfactual?",
      "Find an example of a study that claimed causation but only had correlation. Paste a 2-sentence summary of the confounding variable that explained away the effect.",
      "Build a DAG (Directed Acyclic Graph) for one of your analysis questions. Paste it (draw it in ASCII or describe it). What are the backdoor paths?",
      "What is an instrumental variable? Give one concrete example from economics or business. Write 3 sentences.",
      "Estimate the CATE (Conditional Average Treatment Effect) — does the treatment effect differ across subgroups? Paste the results for 2 subgroups.",
      "What is the difference between internal validity and external validity in a study? Give one example of each type of threat from your own data.",
      "Commit your causal inference notebook. Paste the URL. Most data scientists cannot do causal inference — you can."
    ]
  },

  36: {
    context: `Your models make predictions. But predictions can discriminate.\n\nA hiring algorithm that rejects candidates based on zip code is effectively discriminating by race. A loan model trained on historical data will perpetuate historical inequalities. A facial recognition system that works well on light skin and poorly on dark skin has a literal safety implication.\n\nML fairness is not optional. It is increasingly regulated and it is deeply human. This week you learn to audit a model for bias — measuring it, understanding where it comes from, and applying practical mitigations. You will run a real audit on one of your own models.`,
    mastery_questions: [
      "Choose a sensitive attribute in one of your datasets (borough, gender, age, race proxy). Compute the model's accuracy separately for each group. Paste the table. Is there a gap?",
      "What is demographic parity? Compute it for your model. Does your model satisfy it? Write 2 sentences about what demographic parity means and when it is the right fairness criterion.",
      "What is equalised odds? Compute false positive rate and false negative rate by group. Paste the table. Which group has the higher false negative rate — and what does that mean in your domain?",
      "Apply re-weighting to balance the training data across groups. Re-train and re-evaluate. Paste the fairness metrics before and after. Did balance improve?",
      "What is Fairness Through Unawareness and why does it often fail? Write 3 sentences with a concrete example.",
      "Read the AI Act or EEOC guidelines (whichever is relevant to your use case). Paste one specific legal requirement that your model must meet. Does it currently meet it?",
      "Find 5 examples in your training data where the label seems wrong or biased. Describe the pattern. What could you do about it?",
      "What is the accuracy-fairness tradeoff? Paste a concrete example from your model. What is the cost (in accuracy points) of making your model fairer?",
      "Write a model card for your model that includes the fairness audit results. Paste the fairness section.",
      "Commit the bias audit notebook. Paste the URL. Very few junior data scientists know how to audit models for fairness — you do."
    ]
  },

  37: {
    context: `More time, deeper work. Your capstone is extended — not just because the work takes longer, but because the best projects are never done at first pass.\n\nThis week you are adding depth: a second modelling approach for comparison, a real deployment pipeline, and the analysis that goes beyond the obvious question. The best capstone projects do not just answer the question they set out to answer — they surface the question they DID NOT expect to find.`,
    mastery_questions: [
      "You added a second modelling approach. Paste both metrics side by side. Which is better — and is the difference practically meaningful or just statistical noise?",
      "You found an unexpected pattern in the data. Paste the visualisation and a 2-sentence description. Did this change how you think about the problem?",
      "Your data pipeline is reproducible: someone can clone the repo and run it end-to-end. Paste the README section that explains how. Are there any manual steps left?",
      "You refactored the most complex function in your codebase. Paste before/after. What made the original hard to understand?",
      "You wrote a failing test for a data transformation. Paste the test. Why do data scientists need to test their pipelines — not just their models?",
      "Your model is deployed to a real URL. Paste it. Does it accept requests from a browser or curl? Paste one example call and response.",
      "What is the one chart in your project that tells the story best? Paste it. Could a stranger understand it without reading any of the text?",
      "You hit a wall this week. Describe what it was and how you got through it. Be specific — vague answers do not help you learn from it.",
      "Commit this week's progress. Paste the URL. How many commits do you have on this project now?",
      "Write 3 bullet points about what this extended work taught you that the first build did not."
    ]
  },

  38: {
    context: `The code works. Now make it beautiful — not for aesthetic reasons, but because beautiful code is readable code, and readable code is maintainable code.\n\nPolish week for the extended capstone. Every rough edge in the pipeline, every vague variable name, every README section that makes a stranger say "wait, what?" — fix it this week. Then deploy the full pipeline and record a 5-minute video walking through the project.`,
    mastery_questions: [
      "Your project passes a complete cold-start test: delete all generated files, run the pipeline from scratch. Paste the final output. How long did it take?",
      "You renamed all unclear variable names. Paste 5 before/after pairs. What rule do you follow now for naming variables?",
      "Your README has a 'Quick Start' section. Paste it. Can someone with your project requirements run it in under 10 minutes?",
      "You wrote a 5-minute video walkthrough. Paste the Loom or YouTube URL. Did you explain the problem, the data, the method, and the result?",
      "You added input validation to every function that reads external data. Paste one example. What does it do when the input is malformed?",
      "Your requirements.txt or pyproject.toml is pinned to specific versions. Paste it. Why does version pinning matter for reproducibility?",
      "You tested the API with a load test (10 concurrent requests). Paste the results. What is the p99 latency?",
      "Every section of the README answers one of: What? Why? How? Paste the contents table. Is anything missing?",
      "One person outside the program reviewed your project. Paste their written feedback. What was their biggest suggestion?",
      "Commit all polish changes. Paste the final commit URL before v1.0."
    ]
  },

  39: {
    context: `This is the end of the road — and the beginning of everything else.\n\nYour extended capstone ships today. You have a polished end-to-end project that demonstrates real skills: data acquisition, exploration, multiple modelling approaches, deployment, monitoring, and communication. You have a story about it. You know what worked and what did not.\n\nThe data science journey does not end here. It never ends. But from today, you stop being someone who is learning data science and start being someone who DOES data science. The work proves it.`,
    mastery_questions: [
      "Paste the final project README URL. Does it open cleanly on a fresh GitHub window with no broken images or links?",
      "Paste the live deployed URL. Send a request to it right now. Is it responding?",
      "The RETRO.md is your most complete reflection yet. Paste the 'biggest lesson of the full programme' paragraph.",
      "Compare your Week 1 Python to your current code. Paste a code snippet from each. What is the biggest difference in how you write code?",
      "Write a 280-character tweet announcing your capstone project. Paste it. Does it say what you built, what data you used, and what you found?",
      "Your GitHub profile now shows 4-5 active repos with meaningful commit history. Paste your profile URL. Would a recruiter take you seriously?",
      "Answer this interview question: 'Tell me about your most ambitious project.' Use the capstone. Paste the 4-sentence answer.",
      "What is the next data science topic you want to learn, and why? Write 2 sentences. You now have the foundation to learn anything.",
      "Push the final v1.0 tag. Paste the release URL.",
      "EXTENDED CAPSTONE COMPLETE. You are a data scientist. You shipped the proof."
    ]
  },

  40: {
    context: `Most machine learning is supervised — you give it labelled examples and it learns to predict. Reinforcement learning is different. There are no labels. There is only an agent, an environment, and a reward signal.\n\nThe agent takes actions. The environment responds. The reward tells the agent if it did well. Over millions of tries, the agent learns a policy — a mapping from situations to actions — that maximises long-term reward.\n\nRL is behind AlphaGo, game-playing AIs, and increasingly, real-world robotic control. This week you build your first RL agent using OpenAI Gym — and you will see the moment when a policy that starts by doing random things begins to consistently win.`,
    mastery_questions: [
      "Your first RL agent is running in OpenAI Gym. Paste the environment name and the action space. What does a random policy score on average?",
      "After training with Q-learning or DQN, paste the average reward at episode 1, 100, and 500. Is it improving? At what episode does it noticeably change?",
      "What is the explore-exploit tradeoff? Write 3 sentences using your specific environment as the example. What epsilon value did you use and why?",
      "Plot the learning curve (episode vs reward). Paste the chart. Is learning stable, or does it oscillate? What causes oscillation in RL training?",
      "What is the Bellman equation? Write it in plain English without notation. What does it say about the value of being in a state?",
      "Your agent learned a policy. Paste a GIF or screenshot of it playing the game. What strategy did it converge on — does it look intelligent?",
      "Train the same agent with a lower learning rate. Paste the learning curve vs the original. What is the effect on convergence speed?",
      "What is the credit assignment problem in RL? Write 2 sentences with a concrete example from your environment.",
      "What is the difference between model-free and model-based RL? Write 3 sentences. Which did you implement?",
      "Push your RL project to GitHub. Paste the URL. You have now touched one of the most intellectually challenging subfields of ML."
    ]
  },

  41: {
    context: `Every time you open Netflix, Spotify, or Amazon, a recommender system decides what to show you. These systems are not simple — they balance your individual taste, popularity, freshness, diversity, and business rules simultaneously.\n\nThis week you build one from scratch. You will start with collaborative filtering (the most foundational algorithm), implement matrix factorisation, and then build a content-based system. By Sunday you will have a recommendation engine running on a real dataset, and you will understand why Netflix has hundreds of engineers working on this problem.`,
    mastery_questions: [
      "You built a user-item interaction matrix. Paste its shape. What percentage of entries are non-zero — is this typical for recommender systems?",
      "Compute user-user similarity with cosine similarity. For User 1, paste the top 5 most similar users. Do they share any common items?",
      "Train a collaborative filtering model. Paste the RMSE on a held-out test set. What does RMSE mean in the context of rating prediction?",
      "Implement matrix factorisation (SVD or ALS). Paste the RMSE improvement over collaborative filtering. Why does factorisation work better for sparse matrices?",
      "What is the cold start problem? Write 2 sentences. How does your current system handle a new user with no history?",
      "Build a content-based recommender for items with features. Paste 3 recommendations for one item. Do they make sense?",
      "Compute precision@K and recall@K for your best model. Paste both at K=5 and K=10. Which matters more for a music recommender vs an e-commerce recommender?",
      "What is the diversity-relevance tradeoff in recommenders? Give one concrete example from your dataset of a recommendation that is very relevant but decreases diversity.",
      "Add a popularity baseline: recommend the top-K most popular items to everyone. Paste its precision@10. Does your personalised system beat it significantly?",
      "Push your recommender project to GitHub. Paste the URL. You now understand the core algorithm behind every personalised feed."
    ]
  },

  42: {
    context: `Your laptop has 16GB of RAM. A real production dataset has 16TB. At some point, the tools you know — pandas, scikit-learn, a single Python process — stop working.\n\nDistributed ML is the answer. This week you learn to use Spark (the industry standard for large-scale data processing) and Dask (the pandas-compatible distributed computing library). You will run your existing analyses on datasets too large to fit in memory and understand how the same logic scales from a laptop to a cluster of 1000 machines.`,
    mastery_questions: [
      "You loaded 100M+ rows into Spark. Paste the schema and count. How long did this take compared to pandas on a smaller dataset?",
      "Rewrite your Week 1 busiest-hour query in Spark SQL. Paste the query. What is the Spark execution plan — which operations are most expensive?",
      "What is lazy evaluation in Spark? Write 2 sentences. What does it mean that .count() triggers execution?",
      "Run a groupby aggregation in Dask on a dataset larger than your RAM. Paste the code and time. Did dask.compute() work without memory errors?",
      "What is a Spark shuffle and why is it expensive? Write 3 sentences. How would you rewrite a query to avoid an unnecessary shuffle?",
      "Train a logistic regression model using Spark MLlib. Paste the model summary. How does the syntax compare to sklearn?",
      "What is the difference between Spark and Dask? Write 3 sentences. When would you choose each in a real project?",
      "Run your analysis on a 10x larger dataset than before. Paste the wall-clock time. How does it scale — linearly? Sub-linearly?",
      "What is data skew in distributed computing and why is it a problem? Give one concrete example from your dataset.",
      "Commit your distributed computing notebook. Paste the URL. You can now work with data that does not fit on a laptop."
    ]
  },

  43: {
    context: `You have learned to build powerful models. Now you need to understand what they are not allowed to do with individual people's data.\n\nPrivacy-preserving machine learning is a senior data scientist topic — the kind of thing that gets you from mid-level to senior, or gets you into companies working on sensitive data (healthcare, finance, government). This week you learn differential privacy: the mathematically rigorous definition of "this algorithm does not leak information about any individual person."\n\nYou will add noise to your models in principled ways, implement k-anonymity on a dataset, and understand why "we removed names and IDs" is almost never enough to truly anonymise data.`,
    mastery_questions: [
      "What is the formal definition of epsilon-differential privacy? Write it in plain English. What does a smaller epsilon guarantee?",
      "Apply differential privacy to your fare prediction model using Google's DP library or TensorFlow Privacy. Paste the epsilon value and the model's accuracy. What is the accuracy cost?",
      "Run a k-anonymity check on one of your datasets. Paste the minimum k-value you find. Which combination of attributes creates the smallest anonymity set?",
      "Attempt a linkage attack: can you re-identify individuals in your 'anonymised' dataset by joining to a public dataset? Describe your attempt and what you found.",
      "What is the composition theorem of differential privacy? Write 2 sentences. What does it say about running two DP queries on the same dataset?",
      "What is the difference between local and global differential privacy? Give one real-world example of each from a tech company you know.",
      "Apply the Laplace mechanism to aggregate a sensitive statistic (mean fare by borough). Paste the noise-added result vs the true value. Is the result still useful?",
      "What is synthetic data's relationship to privacy? Write 3 sentences. When does synthetic data provide formal privacy guarantees and when does it not?",
      "Read Apple's or Google's public documentation on their DP implementation. Paste one design choice they made and why they made it.",
      "Commit your privacy notebook to one of your repos. Paste the URL. You now know something most senior data scientists do not — congratulations on finishing the Data Science track."
    ]
  }

};

// ─── APPLY UPDATES ─────────────────────────────────────────────────────────────

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
console.log(`✓ data-science.json updated: ${updated} weeks rewritten`);
