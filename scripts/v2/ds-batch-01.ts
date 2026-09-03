/**
 * v2 rewrite batch 1: data-science Weeks 3-7
 *  W3: TaxiPulse v0.2 — Borough breakdown + multi-month
 *  W4: SQL for Data Scientists
 *  W5: TaxiPulse v0.3 — Predict the fare
 *  W6: Statistical inference + hypothesis testing
 *  W7: TaxiPulse v0.4 — Deploy a fare-predictor API
 */

import { rewriteWeek } from "../rewrite-week";

// ─── W3 ────────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 3, {
  context: `Last week you proved the math underneath pandas was not magic. This week you go back to the data and make the analysis bigger in two directions at once: more time (three months instead of one) and more geography (broken down by borough instead of treated as one undifferentiated New York).

Both are the same skill, dressed differently. You are learning to compare. The first time most beginners see "October busiest hour is 6pm," they nod and move on. The analyst's instinct is different — they immediately want to know: was September the same? Is Manhattan the same as Queens? Was Q4 weird because of holidays? The interesting answer is never a single number. It is a number IN CONTEXT.

You are also going to meet your first real JOIN this week. Your taxi data has a column called PULocationID — that is a number from 1 to 263 that means nothing on its own. The NYC TLC publishes a separate lookup table that maps each LocationID to a borough name (Manhattan, Brooklyn, Queens, Bronx, Staten Island, EWR, Newark). Joining those two tables together is how you turn "247" into "Astoria, Queens" — and that exact mental move (linking a code to its meaning) is what 80% of professional data work actually is. Customers to subscriptions. Orders to products. User IDs to demographic segments. Same pattern, different industries.

By Sunday TaxiPulse v0.2 will show three months of data broken down by borough, with a chart that compares boroughs against each other, and a one-paragraph paragraph at the top of the notebook calling out one finding that surprised you.`,

  pre_flight: `Before you load anything: write down your prediction for which borough has the highest average tip percentage. Manhattan? Staten Island? You probably have an intuition — most people guess Manhattan because it has tourists. Write the guess down. Also predict: did total trip volume go UP or DOWN between October and December 2023? (Holidays, weather, conference season — there are reasons either way.) On Sunday, check both. Wrong predictions are not embarrassing — they are how you learn the actual shape of the city you are studying.`,

  mastery_questions: [
    `Load the TLC zone lookup CSV. Run lookup.head() and paste the columns. Now JOIN your taxi data to the lookup on LocationID. Paste your merge() line. The number of rows BEFORE and AFTER the merge should be almost identical — if it changed by more than 1% you probably did an inner join when you wanted a left join. Explain in one sentence which kind of join you used and why.`,
    `Group trips by borough and compute the mean tip percentage for each. Paste the result. Did Manhattan come out highest? If not — what borough did, and what is your hypothesis for why? (Higher fare? Different rider demographics? Tourism patterns? Suburb-to-city longer rides?) The number is the easy part; the explanation is the analyst skill.`,
    `Concatenate three months (Oct + Nov + Dec 2023) into one dataframe. Paste df.shape before and after. Then plot total trips per day across the three months. Are there visible dips? Mark December 25, January 1, and Thanksgiving on the chart. Holidays, weather events, and one-off shutdowns are visible in volume data — train your eye to spot them now, because every business dashboard you ever look at will have them.`,
    `Make a single chart that compares ALL FIVE boroughs on the SAME axis (e.g., average fare by hour, one line per borough). This is harder than it sounds — small multiples vs single chart is a real design decision. Paste the chart code. Which borough's pattern surprised you most?`,
    `Update your TaxiPulse README with one paragraph titled "What changed from v0.1." It should describe: what new data you added, what new question you can now answer that you could not answer with one month, and one finding you did not expect. Paste the paragraph. This is how real analysts communicate iteration to non-technical readers — they tell a story about what NEW now exists.`,
  ],

  common_mistakes: [
    `Using pd.concat without ignore_index=True. Your row numbers will reset weirdly and any .iloc[42] you do later will give a confusing result.`,
    `Joining on LocationID but forgetting that the lookup table has it as integer while your taxi data has it as string (or vice versa). The join silently produces zero matches. Always check df['LocationID'].dtype on both sides before merging.`,
    `Plotting all five boroughs on one chart without different colors or a legend. The reader has to guess which line is which. Use df.plot() with hue= or pass each borough explicitly with a label.`,
    `Computing "tip percentage" as tip_amount / fare_amount and not dividing by total_amount. There is no single right answer — but you have to pick one and stick to it, and tell the reader which definition you used. Same metric name, different formulas, is the source of half of all corporate-dashboard arguments.`,
  ],

  debug_help: `Merge problems are the #1 thing that breaks this week. The symptom is usually "my row count exploded" or "my row count collapsed to almost nothing." Both mean your join keys are not matching the way you thought. Run this diagnostic: df['LocationID'].isin(lookup['LocationID']).mean() — that tells you the fraction of taxi rows whose location key actually exists in the lookup. If that number is below 95%, the lookup is missing rows or your dtypes do not match. Print three sample keys from each side: print(df['LocationID'].head(3), lookup['LocationID'].head(3)). Look at them. The mismatch is almost always visible to the naked eye once you stop staring at the error.`,

  ai_assist: `Use Claude to translate between SQL and pandas — give it your merge() line and ask "what would this look like as a SQL JOIN?" Seeing the same operation in two languages locks the concept in. Do NOT ask Claude to "improve my plot." Ask it instead "what is one thing about this chart that a critical reader would call out?" Forcing AI to critique rather than rewrite is how you grow taste. And when you write the README paragraph, draft it yourself first, then ask Claude "is there anything in this paragraph that sounds like AI wrote it? Be brutal." Most students never do that step — that is why their portfolios all sound the same.`,

  stretch: [
    `Add a fourth month (September 2023) and see if your seasonality story changes. Three months of data feels solid until you look at four and realise you were over-interpreting noise.`,
    `Plot trips per day per borough as five small-multiple charts (one per borough) instead of one combined chart. Compare the two visualisations side by side. Which is more honest? Which is more dramatic? Designers fight about this constantly.`,
    `Find the day with the LOWEST trip count across all three months. Look up what happened in NYC on that day. Real-world events show up in time-series data, and learning to read them is a senior-analyst skill.`,
  ],
});

// ─── W4 ────────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 4, {
  context: `Pandas is a language about a dataframe in your laptop's memory. SQL is a language about data in a database somewhere else — usually a much larger somewhere else than your laptop could hold. Almost every data science job you will ever interview for assumes you can write SQL. Most beginners learn pandas first and SQL never, and then get caught flat in interviews when the question is "write a query that finds the top 3 customers per region."

You already know how to answer that question in pandas. This week you learn to say the same thing in SQL.

The two languages are mostly the same shape, with different verbs:

  pandas: df.groupby('region').agg({'sales': 'sum'})
  SQL:    SELECT region, SUM(sales) FROM df GROUP BY region

That is the joke. SQL is just pandas with the keywords in capitals. The week is short because the lesson is short — but the muscle memory matters. By Friday you will write 10 queries against a local SQLite copy of your TaxiPulse data, each one replicating something you already did in pandas. Then you will validate them: the SQL result and the pandas result must match exactly. That cross-check is how you know you actually understand both.

One more thing: window functions are the part of SQL that intimidates people the most, and they are also the part that comes up in every senior-analyst interview. We will spend day three on them specifically. By Friday you will be able to write "rank customers by sales within each region" without Googling.`,

  pre_flight: `Before writing any SQL, pick ONE pandas analysis you did in week 1 or week 3 — your favourite, the one you understood best. Write it out as a sentence first: "I want to find the average fare for each borough, sorted highest to lowest." Now translate that sentence to SQL in your head before you write it. You will be surprised how often the SQL writes itself once you have the English sentence clear. The translation step (English → query) is half the skill.`,

  mastery_questions: [
    `Load your TaxiPulse parquet into SQLite using pandas: df.to_sql('trips', conn). Run a SELECT COUNT(*) FROM trips. Paste the count. It should match the df.shape from week 1 (3.5M). You just put 3.5 million rows into a real database. Now you can query them with SQL.`,
    `Write a SQL query that gives the average fare per borough. Run the same calculation in pandas. Paste both results side by side. They should match to multiple decimal places. If they do not — find the bug. Usually it is a NULL handling difference (SQL ignores NULLs in AVG, pandas does too, but only after you decide what to do with them).`,
    `Write a query using a CTE (WITH clause) that finds the top 5 pickup locations by trip count for each borough. Use ROW_NUMBER() OVER (PARTITION BY borough ORDER BY trips DESC) and filter to row_num <= 5. Paste the query. This is the canonical "top N per group" interview question and you will see it again at every level of every interview process.`,
    `Write a LEFT JOIN between trips and the zone lookup table. Now count rows where the borough is NULL. If there are any, that means there are LocationIDs in your trip data that do NOT exist in the lookup. Paste the count. What does that tell you about the data quality? (And what should you do about those rows — drop them silently, flag them, or investigate them?)`,
    `Validate: pick any three queries you wrote this week, run them in SQL and again in pandas, and paste the side-by-side numbers. They MUST match. If you find a mismatch you cannot explain, that is one of the most valuable bugs you will hit this month — it almost always reveals a hidden assumption you were making about NULLs, types, or implicit casting.`,
  ],

  common_mistakes: [
    `Forgetting that GROUP BY needs to include EVERY non-aggregated column you SELECT. SELECT borough, hour, AVG(fare) requires GROUP BY borough, hour — not just GROUP BY borough.`,
    `Using = NULL instead of IS NULL. NULL is not equal to anything, including itself. WHERE col = NULL returns zero rows always.`,
    `Aliasing a column with AS and then trying to reference the alias in WHERE. WHERE runs before SELECT — you cannot use the alias there. Use HAVING (which runs after) or wrap in a subquery.`,
    `Joining on the wrong key by accident. Always check the result row count before celebrating a successful query. A "successful" join that silently returned 10x too many rows is worse than one that errored.`,
    `Trying to write the perfect query in one shot. Write it ugly first, run it, see the wrong answer, then refine. SQL is iterative — even seniors write garbage first drafts.`,
  ],

  debug_help: `SQL error messages are short and unhelpful by tradition. "Syntax error near GROUP" tells you almost nothing. The trick: when a query errors, isolate. Comment out the GROUP BY and ORDER BY and see if the bare SELECT works. Then add them back one at a time. If a query runs but returns wrong numbers, run it against a tiny subset (LIMIT 10) and check by hand. The mistake is almost always either (1) wrong join key, (2) NULL behaviour you forgot about, or (3) you grouped by the wrong column. When you cannot find it after 20 minutes, paste the query AND the table schemas AND the expected vs actual result into Claude. Most of the time it spots the bug instantly.`,

  ai_assist: `SQL is the field where AI is most useful and most dangerous at the same time. Most dangerous: copying a generated query that runs without error but returns subtly wrong numbers. The fix is the validation habit — every AI-generated query gets cross-checked against pandas this week. Most useful: asking "explain this query line by line" on a complex one (especially window functions). The third move that nobody talks about: when you write a query yourself, paste it into Claude and ask "is there a more idiomatic way to write this?" — that is how you absorb professional patterns without anyone teaching you.`,

  stretch: [
    `Set up a free Postgres database (Supabase or Neon — both free tier) and upload your TaxiPulse data to it. Re-run your queries against the real Postgres. Postgres is what every job uses; SQLite is what you learn on.`,
    `Write a CTE-based query that calculates the day-over-day change in trip volume. (Hint: LAG() window function.) This pattern shows up in every business dashboard you will ever see — sales today vs sales yesterday.`,
    `Write the same "top N per group" query (mastery #3) using a correlated subquery instead of a window function. Both work. The window function version is faster and more readable, but knowing both lets you read old codebases.`,
  ],
});

// ─── W5 ────────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 5, {
  context: `You have spent four weeks describing the data. Now you train your first real machine learning model and ask the data a different kind of question — not "what is the average fare?" but "given a trip's distance and pickup hour, can I PREDICT its fare?"

That distinction — describe vs predict — is the whole field, in a sentence. Last week you did description. This week you start prediction. Everything from here on out is variations on this theme.

You will train two models and compare them. First a plain linear regression — the same equation you derived by hand in week 2, but this time sklearn does it for you and you focus on the workflow: split your data into train and test, fit on train, evaluate on test, look at the residuals. Then XGBoost — a tree-based model that is the workhorse of every Kaggle competition and most tabular ML in production. You will see XGBoost win on accuracy and lose on interpretability. That trade-off (accuracy vs. explainability) is a real one you will navigate forever.

Your goal: a model that predicts fare within $5 on average (MAE < 5). The baseline of just guessing the mean fare gives you MAE around $8. Anything below $5 means your model has actually learned something about the relationship between distance, time, and price. By Sunday TaxiPulse v0.3 will have a working model + an honest evaluation + one chart showing where the model fails (residuals analysis). The "where it fails" part is what separates a real ML notebook from a tutorial.`,

  pre_flight: `Before training anything, write down a number: what do you think the average error (MAE) of a "just predict the average fare for every trip" model would be? Take a guess. We will check on Tuesday after the baseline runs. Knowing your baseline before you build the fancy model is what stops you from being impressed by mediocre results. Many beginners proudly post "my model got 70% accuracy!" — and a class-balanced random model would have gotten 50%. You start with the dumb baseline first, always.`,

  mastery_questions: [
    `Split your data into 80% train, 20% test using train_test_split with random_state=42. Paste the train and test shapes. Why do we hold out test data and never look at it during training? (Hint: if you train and evaluate on the same data, the model can memorize instead of learn. You are testing whether it generalises.)`,
    `Train a LinearRegression on three features: trip_distance, trip_duration_minutes, pickup_hour. Compute MAE on the test set. Paste your MAE. Also paste the coefficients. The coefficient on trip_distance should be roughly $3 — the NYC per-mile rate. Coefficients you can interpret like that are the superpower of linear models, and the reason every senior analyst still uses them as a baseline.`,
    `Train an XGBoost regressor on the same features. Paste the test MAE. It should be lower (better) than the linear model — usually by $0.50–$1.50 on this dataset. Why? Because XGBoost can capture nonlinear patterns (rush hour multiplier, JFK flat rate, etc.) that linear regression cannot. But — and this is the catch — you cannot read the XGBoost coefficients the way you read the linear ones. You traded interpretability for accuracy.`,
    `Plot the residuals (y_true - y_pred) on the test set. Are they centred on zero? Is the spread the same for cheap trips and expensive trips? If the spread grows with the predicted value (a funnel shape), that is called heteroscedasticity and it means the model is more wrong on expensive trips than cheap ones. Paste the chart and one sentence describing what you see. Reading residuals is the skill that separates "I built a model" from "I know whether my model is any good."`,
    `Pick the 10 trips where your model was MOST WRONG (highest absolute residual). What do they have in common? Are they all JFK trips? All very long trips? All super short? This is called "error analysis" and it is the most underrated skill in ML. The pattern in your model's biggest mistakes tells you exactly what feature to add next. Paste your findings.`,
  ],

  common_mistakes: [
    `Forgetting to drop the actual fare column (y) from your X features. Easy to do, and the model gets perfect accuracy because it is literally being told the answer. If your MAE is suspiciously close to zero, this is the bug.`,
    `Training on data that includes the test rows. random_state matters; calling train_test_split twice without setting it can give you a different split each time and pollute your evaluation.`,
    `Comparing two models using different test sets. Always evaluate both models on the EXACT same X_test, y_test. Otherwise the comparison is meaningless.`,
    `Reporting only the mean error and ignoring the distribution. MAE = $4 with most errors near zero and a few enormous outliers is very different from MAE = $4 with consistent $4 errors everywhere. Plot the histogram of errors, do not just report the mean.`,
    `Calling XGBoost a "neural network." It is not. It is a gradient-boosted decision tree ensemble. The wrong term in an interview is a tell.`,
  ],

  debug_help: `The most common bug this week is feature/target leakage — your model is somehow seeing the answer. Symptoms: MAE near zero, R² near 1, you feel suspicious because it seems too good. Check your X.columns and make sure 'fare_amount' is not in there. Also check for columns that are derived from fare (total_amount, tip_amount calculated from fare — anything correlated almost perfectly with the target). If the model uses a feature that would not be available at PREDICTION time, that is leakage. The rule of thumb: at the moment you would need to predict, what do you actually know? Drop everything else.`,

  ai_assist: `Ask Claude to explain the difference between MAE, MSE, and RMSE — and which one to use when. (Hint: MAE if you care about being off by the same dollar amount regardless of trip price; MSE/RMSE if you want to penalise large errors more heavily.) Do NOT ask Claude to "build me an XGBoost model." Build it yourself, then paste the working code and ask "what is one thing I could improve about how I split the data?" Specific, scoped questions teach. Open-ended "do my work" prompts do not.`,

  stretch: [
    `Add a one-hot encoded "borough" feature and retrain XGBoost. Did MAE improve? By how much? Each feature you add should be justified by a measurable accuracy gain.`,
    `Use sklearn's GridSearchCV to tune XGBoost's max_depth and n_estimators. Show the test MAE before and after tuning. Hyperparameter tuning is a real skill and worth seeing it in action once.`,
    `Pick a single trip from the test set, print its features, then walk through (by hand if necessary) how the linear regression model arrived at its prediction. Being able to do this for at least the linear model is what makes ML stop being a black box for you.`,
  ],
});

// ─── W6 ────────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 6, {
  context: `You found a difference. Manhattan tips 18%, Brooklyn tips 16%. Real difference, or noise? Last month had 4% more trips than this month. Trend, or random fluctuation? Your linear model has MAE $4.20. Is that meaningfully better than a competitor's $4.40, or is it within the margin of measurement?

Every one of those questions is a hypothesis test. This week you learn to answer them honestly.

Statistical inference is the discipline that separates "I noticed a pattern" from "there is enough evidence to call it real." It is also the difference between a junior analyst who breathlessly announces every wiggle in a chart and a senior who quietly says "let me check whether that's significant first." The senior is right roughly 100% more often.

You will learn three tools this week. The t-test (comparing two numeric groups — e.g., is the average tip really different between two boroughs?). The chi-square test (comparing two categorical distributions — e.g., does the mix of payment types differ between weekdays and weekends?). And the bootstrap (a more general technique that does not assume your data is normally distributed). For each, you will compute a p-value and a confidence interval, and you will resist the urge to call p=0.06 "almost significant." It is not. There is a line; the line is at 0.05 by convention; respect the line.

By Sunday, every claim in your TaxiPulse README will be either backed by a confidence interval or removed. That single change makes the work read as if a real statistician wrote it.`,

  pre_flight: `Pick one claim from your existing TaxiPulse README — anything that says "X is higher than Y" or "X has more Y" or anything comparative. Write down whether you currently believe that claim is statistically real or whether it might be noise. Be honest. By Sunday you will know for sure, and you may have to delete or soften that claim. That is a feature, not a bug — analysts who can revise their own findings are trusted more than ones who never do.`,

  mastery_questions: [
    `Run a t-test comparing average tip percentage between Manhattan and Brooklyn. Paste your p-value. If p < 0.05, the difference is statistically significant — write one sentence interpreting what that means in plain English ("If there were really no difference, we would see a gap this big or bigger less than 5% of the time by chance alone"). If p >= 0.05, write what THAT means ("we cannot rule out random chance"). Both outcomes are valid findings.`,
    `Compute a 95% confidence interval for the average fare in October 2023. Paste the interval. Now interpret it correctly: it does NOT mean "95% of fares fall in this range" — it means "if we re-ran this experiment many times, 95% of the intervals we computed would contain the true mean." That distinction trips up almost everyone forever; getting it right is a hallmark of someone who actually studied.`,
    `Run a chi-square test on whether payment type (cash vs credit) is independent of weekday vs weekend. Paste your p-value and one sentence interpretation. Chi-square is the tool when both variables are categorical — and most business questions secretly are.`,
    `Bootstrap a confidence interval for the median trip duration. Run 1000 bootstrap samples, compute the median of each, take the 2.5th and 97.5th percentiles. Paste the interval. Why bootstrap instead of using the formula? Because the formula assumes normality and trip duration is heavily right-skewed. Bootstrap doesn't care about distribution shape — it just resamples. That makes it the most practical inference tool you will use in real work.`,
    `Go through your TaxiPulse README and for every comparative claim, either: (a) add the p-value or confidence interval that backs it up, (b) soften the language to reflect uncertainty, or (c) delete it. Paste the diff (before/after for one claim). Doing this is what makes your work feel honest. Most online tutorials never do — and that is why most online tutorials read as amateurish to working statisticians.`,
  ],

  common_mistakes: [
    `Treating p=0.06 as "almost significant." It is not. The line is 0.05 by convention. Either revise the claim or collect more data — do not weasel.`,
    `Running 20 different tests and reporting only the one with p < 0.05. That is called p-hacking and it is genuinely dishonest. If you run multiple tests, apply Bonferroni correction (divide your alpha by the number of tests).`,
    `Confusing statistical significance with practical significance. A difference of $0.01 in average fare between two boroughs can be statistically significant with 3 million rows — but who cares? Always report effect size alongside p-value.`,
    `Using a t-test on heavily skewed data without checking. T-tests assume approximate normality OR large enough sample. With 3M rows you are usually fine, but small subgroups need either a non-parametric test (Mann-Whitney U) or a bootstrap.`,
    `Saying "the null hypothesis is true" when p > 0.05. You can never prove the null — you can only "fail to reject" it. The phrasing matters. "We did not find evidence of a difference" is correct; "there is no difference" is overclaiming.`,
  ],

  debug_help: `Inference bugs are subtle because tests RUN without erroring even when they are wrong for the data. The two checks: (1) Did you assume normality without checking? Run sns.histplot on the column first. If it is heavily skewed and your sample is small, prefer bootstrap or non-parametric tests. (2) Did your test use the right two groups? Always print group sizes and group means before the test. If one group has 8 rows and the other has 800,000, the test is technically valid but your interpretation needs to acknowledge the imbalance. When in doubt, run the same comparison three ways (t-test, Mann-Whitney, bootstrap) and see if they agree. They usually do — and when they disagree, the disagreement tells you something interesting about your data.`,

  ai_assist: `Ask Claude to explain p-values using an analogy you would tell a non-technical friend. (Good test: if you cannot explain p-value to your mother, you do not understand it.) When you write a result interpretation, paste it into Claude and ask "is anything in this sentence statistically incorrect?" That habit catches the "p > 0.05 means there is no difference" mistake nine times out of ten. Do NOT let Claude write your null hypothesis for you — the act of writing it forces you to clarify what you are actually testing.`,

  stretch: [
    `Run a power analysis: how many rows of data would you need to detect a 1% difference in tipping behaviour between two boroughs with 80% power at alpha=0.05? This is what real analysts compute BEFORE running an experiment to decide if it is worth running.`,
    `Replicate one finding from your TaxiPulse on September 2023 data (a different month). Does the finding hold? If yes, that is a real pattern. If not, you over-fit to October. Out-of-sample replication is the gold standard of empirical work.`,
    `Read about the "garden of forking paths" (Andrew Gelman's term). Write 3 sentences in your notebook about why running many tests on the same data is risky even if each individual test is valid. This is a senior-level concept that almost no online course teaches.`,
  ],
});

// ─── W7 ────────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 7, {
  context: `Your fare-predictor model from week 5 currently lives in a Jupyter notebook on your laptop. To use it, someone would have to clone your repo, install Python, install your dependencies, open the notebook, run all cells, and call your function. That is not a product. That is a lab experiment.

This week you turn it into a product.

By Sunday, anyone in the world will be able to POST a JSON payload with {distance, duration, hour} to a public URL and get back a fare prediction in milliseconds. That single change — from "runs on my machine" to "runs at https://yourname.onrender.com" — is what makes the difference between a data scientist who builds models and a data scientist who ships them. The second one gets paid more and is in higher demand.

You will save your sklearn or XGBoost model to disk with joblib. You will wrap it in a tiny Flask app with one route: POST /predict. You will add a /health endpoint because every production service needs one. You will deploy to Render (free tier) and you will hit the live URL from your terminal with a curl command. The whole flow — train → save → serve → deploy — is what production ML looks like at every company you will ever work for. Bigger companies use fancier tools (Kubernetes, SageMaker, Vertex AI) but the underlying pattern is identical.

This is also the first week where you will write code that runs without you watching it. If the server crashes at 3am you will not know. That changes how you write the code — you add health checks, you log errors, you handle bad inputs gracefully. That defensive mindset is engineering, not data science, and you need both to ship.`,

  pre_flight: `Before writing any Flask code: open Postman or just curl, and think about what your API's input and output should look like. Write down (on paper) the JSON shape of the request and the JSON shape of the response. A good API design starts on paper. The first thing every senior backend engineer asks when reviewing API code is "let me see the request and response shape" — they want to know if you thought about the contract before you wrote the implementation.`,

  mastery_questions: [
    `Save your trained model with joblib.dump(model, 'model.joblib'). Now load it in a fresh Python process and predict on a single example. Paste the prediction. Why save with joblib instead of pickle? (Joblib is more efficient for numpy arrays, which sklearn models are full of.) The size of the file matters — if your model is >50MB, something is probably wrong (you saved the training data along with the model, usually).`,
    `Write a Flask app with two routes: GET /health returns {"status": "ok"} and POST /predict accepts {"distance": 5.0, "duration": 15, "hour": 14} and returns {"predicted_fare": 18.40}. Paste both route handlers. Start the server with python app.py and curl it locally. Paste the curl command and the response.`,
    `Add input validation: if the request is missing a field, or has a negative distance, return a 400 error with a helpful message. Test it with a deliberately broken curl. Paste the error response. Why is this important? Because once your API is public, random people on the internet will send you garbage payloads — and a crashed server is worse than a server that politely refuses bad input.`,
    `Deploy to Render. Paste the live URL. Open it in your browser — the /health endpoint should return JSON. Now curl the /predict endpoint from your laptop terminal. Paste the curl command and the response. You just turned your model into a service that anyone in the world can use. That is what shipping means.`,
    `Add a print() or proper logging.info() call inside /predict that logs each request's input and the prediction. Make a few requests, then open Render's log dashboard and find your logs. Paste a screenshot. Observability — being able to see what your service did and when — is the difference between a service that works and a service you trust.`,
  ],

  common_mistakes: [
    `Calling Flask's app.run() in production. That is the development server and it is not safe for real traffic. Render uses gunicorn instead — set the start command to "gunicorn app:app" in your Render config.`,
    `Hardcoding the path to your model file with an absolute path like /Users/yourname/.../model.joblib. That works on your laptop and fails on Render. Always use relative paths or environment variables.`,
    `Forgetting to add the model.joblib file to your git repo (it is often gitignored by default because it is binary). Render needs the file to be there. Check git status before pushing.`,
    `Returning {"prediction": 18.4} when the test expected {"predicted_fare": 18.4}. API contracts are pedantic. Your response keys must match the documented spec exactly.`,
    `Not setting requirements.txt with pinned versions. Your model was trained with sklearn 1.3, Render installs 1.5, loading the joblib file silently fails or gives different predictions. Pin your versions: sklearn==1.3.0.`,
  ],

  debug_help: `Two kinds of pain this week. First: local-vs-deployed mismatch. The app works on your laptop, the deployed version errors. The fix is almost always "I have a Python package locally that is not in requirements.txt." Run pip freeze > requirements.txt before every deploy. Second: the API loads but predictions are nonsense. That is usually a feature ordering bug — your model expects features in order [distance, duration, hour] but you sent them in order [hour, duration, distance]. Inside /predict, ALWAYS reconstruct the feature vector in the same order you trained on, with the same names. A best practice: save the feature names ALONGSIDE the model in the joblib file, so you cannot forget. When something breaks on Render, open the live logs immediately — most bugs are visible in the traceback there.`,

  ai_assist: `Ask Claude to write the Flask boilerplate, but ONLY after you have sketched the route signatures yourself. AI is great at remembering syntax (request.get_json(), jsonify, status codes) — bad at deciding what your API should do. When the deploy fails, paste the FULL Render build log into Claude, not just "it didn't work." The fix is almost always in the third-to-last line of the build output, and Claude can spot it instantly if it can see it. After you deploy, ask Claude "what are three security issues with this API as written?" — most likely answers: no rate limiting, no auth, no input validation on edge cases. Knowing those gaps exist (even if you do not fix them this week) is what makes you a thoughtful engineer.`,

  stretch: [
    `Add rate limiting (Flask-Limiter package, free tier) so a single IP cannot make more than 60 requests per minute. Real APIs need this from day one.`,
    `Add a simple HTML form at GET / that lets a human enter distance/duration/hour in a form and see the predicted fare. Turning a JSON API into a real product takes 30 minutes of HTML and makes the deliverable feel ten times more impressive.`,
    `Containerise the app with Docker — write a Dockerfile, build the image, run it locally. Render will accept a Dockerfile-based deploy. Doing it this way teaches you the container model that EVERY production service uses.`,
  ],
});
