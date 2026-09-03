import { rewriteWeek } from "../rewrite-week";

// ml-engineering W1-W5

rewriteWeek("ml-engineering", 1, {
  context: `Machine learning is the discipline of building systems that improve from data rather than from explicit rules. The rule-based alternative to a flight delay predictor would require someone to enumerate every condition that causes delays — carrier, weather, airport congestion, time of day, season — and write if-else logic for each. ML learns those relationships directly from historical records where the delays either happened or did not. Your job is to get the data, prepare it, train a model, and verify the model learned something real.

FlightWise v0.1 predicts whether a US domestic flight will be 15 or more minutes late. You train logistic regression on historical flight records from the Bureau of Transportation Statistics. The model takes departure features as input and produces a probability. The threshold at which you call a flight "will be late" is a decision, not a mathematical fact — you set it based on what costs more, false positives or false negatives.

The split between training and test data is not bureaucracy. The model has seen the training data. If you evaluate on training data, you are asking "does the model remember what it was shown?" rather than "does the model generalise?" Those are different questions with wildly different answers. Always evaluate on held-out data the model has never seen.

A confusion matrix gives you more information than accuracy alone. A model that predicts "not late" for every flight gets 80% accuracy on a dataset where 80% of flights are on time — and is completely useless. The confusion matrix shows true positives, false positives, true negatives, and false negatives separately. From it you can calculate precision (of flights it predicted late, how many were actually late) and recall (of flights that were actually late, how many did it catch). Those are the metrics that translate into product value.

Jupyter notebooks are the right environment for this week. They let you see data, run code, and visualise results incrementally. Use one notebook per iteration. By week 20, you will have moved to proper Python modules and pipelines — but starting in a notebook is correct.`,

  pre_flight: `Install Anaconda and create a conda environment with Python 3.11. Install: pandas, scikit-learn, matplotlib, seaborn, jupyter. Download the BTS On-Time Performance dataset for at least 6 months of flights. Verify the download: load it with pd.read_csv, check the shape, check for the target column (ARR_DELAY or DEP_DELAY). Know what logistic regression is at a high level before running it.`,

  mastery_questions: [
    `You train your model and get 82% accuracy. A colleague says "that's good." Is it? Check the class distribution first. If 82% of flights in your dataset are on time, a model that predicts "on time" for everything gets 82% accuracy without learning anything. Compare your model's accuracy to this baseline — called the majority class classifier. If your model beats 82% by only 1%, it has learned almost nothing. If it beats it by 8%, something real was learned. Accuracy is only meaningful relative to the baseline for your class distribution.`,

    `You want to evaluate your model beyond accuracy. Walk through the confusion matrix for your flight delay model. True positive: model predicted late, flight was late. False positive: model predicted late, flight was on time (your model over-alarms). True negative: model predicted on time, flight was on time. False negative: model predicted on time, flight was late (your model missed a delay). For an app that warns travelers: false negatives (missed delays) are more costly than false positives (unnecessary warnings). This means you want high recall, even at the cost of lower precision. The threshold controls this tradeoff.`,

    `Your logistic regression coefficient for DEP_HOUR is 0.08. What does this mean? Logistic regression outputs log-odds. A coefficient of 0.08 means that for each one-unit increase in departure hour, the log-odds of delay increase by 0.08. To convert to an odds ratio: e^0.08 ≈ 1.08. Flights departing one hour later are about 8% more likely to be delayed, holding everything else constant. This interpretability is logistic regression's greatest advantage over more complex models — you can explain the model's reasoning to a non-technical stakeholder.`,

    `You notice the model performs much better on flights from January than on flights from July. What is the likely cause and how do you investigate? Winter weather patterns (January) might be more predictable than summer thunderstorm patterns (July). Or the training data was weighted toward winter months. Or the January test set is easier by chance. Investigate by checking the class distribution separately for January and July in your training and test sets. If the training data is temporally biased, the model learned patterns from the past that do not transfer to the future. Time-aware splits (train on older data, test on newer data) are more realistic than random splits for time-series-adjacent problems.`,

    `You want to deploy your logistic regression model. What needs to happen to the model before it can serve predictions on new flight records? The model must be serialised: save it with joblib.dump(model, 'flightwise.pkl'). But the model alone is not enough — the preprocessing also needs to be saved. Any scalers, encoders, or imputers applied to the training data must be applied identically to inference data. The safest approach is to wrap the preprocessing and model in a sklearn Pipeline, then serialise the entire pipeline. Calling pipeline.predict(new_data) applies preprocessing and prediction in the same step, without any chance of the preprocessing being applied differently at inference time.`,
  ],

  common_mistakes: [
    `Fitting the scaler on the entire dataset before splitting into train and test. The scaler learns the mean and standard deviation of the features. If it sees the test data during fitting, test data information leaks into the training process. Always fit the scaler on training data only, then transform both train and test.`,

    `Using accuracy as the only metric on an imbalanced dataset. For flight delays where 20% of flights are late, a model that predicts "on time" for everything has 80% accuracy. Track precision, recall, F1, and ROC AUC alongside accuracy.`,

    `Not saving the preprocessing alongside the model. At inference time, the new data must be preprocessed identically to the training data — same column order, same encoding, same scaling. Saving only the model and re-implementing preprocessing at inference time leads to subtle bugs that are hard to detect.`,

    `Setting a random seed but not documenting it. Your results are reproducible for you but your teammate cannot reproduce them because the random seed is not in the code. Always set and document the random seed: np.random.seed(42) and sklearn's random_state=42 parameters.`,

    `Evaluating on test data before you are done iterating. Once you look at test performance, the test set is "contaminated" — you may unconsciously tune toward it. Reserve the test set for your final, single evaluation. Use a validation set or cross-validation during development.`,
  ],

  debug_help: `The most common pandas error when loading flight data is a DtypeWarning about mixed types in a column. This usually means a column that should be numeric contains some string values — often "NA" or a dash character for missing data. Fix: specify na_values=["NA", "-"] in pd.read_csv, then convert the column with pd.to_numeric(df['DEP_DELAY'], errors='coerce'). The errors='coerce' argument converts unparseable values to NaN rather than raising an exception. Always check dtypes with df.dtypes after loading and before modelling.`,

  ai_assist: `Use Claude to help you understand the logistic regression coefficients after training. Paste the feature names and their coefficients and ask it to explain what each coefficient means in plain English. This is a good use of AI — interpreting model coefficients correctly requires understanding the mathematical relationship, and Claude can help you build that understanding. Do not use Claude to write the training code. Writing model.fit(X_train, y_train) yourself is where you learn the sklearn API.`,

  stretch: [
    `Add a calibration plot (reliability diagram) to your analysis. Logistic regression is generally well-calibrated but your specific dataset and preprocessing may produce miscalibrated probabilities. A calibrated model's predicted probability of 0.7 means 70% of such flights are actually late.`,
    `Compare your logistic regression model against a random forest with default parameters. Report the ROC AUC difference. Is the complexity of random forest worth it at this stage? Document your conclusion.`,
    `Build a simple Streamlit app that takes flight details as input and returns the probability of delay. This is a preview of v0.4 — good practice for the deployment week.`,
  ],
});

rewriteWeek("ml-engineering", 2, {
  context: `Raw data almost never has the features that make a model useful. The departure hour, airline code, and origin airport are in the data but the patterns that predict delays live at a higher level of abstraction: is this a rush-hour flight? Is it a long-haul route? Is it early morning when delays tend to propagate from overnight disruptions? Feature engineering is the process of creating those higher-level representations from the raw columns.

FlightWise v0.2 adds five engineered features. Each one encodes domain knowledge that the model cannot learn directly from raw hour values or route strings. The is_weekend flag captures the change in passenger mix and operational intensity between weekdays and weekends. The morning_rush and evening_rush flags capture peak departure congestion windows. The long_haul flag separates routes where minor delays compound versus short routes where recovery is easy. The red_eye flag identifies overnight flights with different staffing and disruption patterns.

The comparison between logistic regression and XGBoost is instructive at this stage. Logistic regression is linear — it can only learn additive combinations of features. XGBoost is a gradient-boosted tree ensemble that captures nonlinear interactions: the combination of morning_rush and a congested hub airport may be more predictive than either alone. Feature engineering partially compensates for logistic regression's linearity. Adding is_morning_rush_at_congested_hub as a feature gives logistic regression access to an interaction it cannot discover on its own.

Overfitting is the central ML engineering concern. XGBoost without constraints can memorise training data precisely and generalise poorly. The model learns the training set's noise along with its signal. Regularisation parameters (max_depth, min_child_weight, subsample) control how aggressively the model fits the training data. Cross-validation is how you measure whether the complexity is being paid back in generalisation.

Feature engineering decisions should be documented. Write a FEATURES.md that explains each feature, why you believe it is predictive, and the empirical evidence from your training run. This becomes the institutional knowledge of your model.`,

  pre_flight: `Have FlightWise v0.1 running with a baseline logistic regression ROC AUC. Install xgboost. Understand what the DEP_TIME column contains (format: HHMM as an integer). Know how to derive hour from DEP_TIME. Know what cross-validation is: splitting training data into k folds, training on k-1 folds, evaluating on the kth, repeating k times and averaging.`,

  mastery_questions: [
    `You create the is_weekend feature by checking whether the DAY_OF_WEEK column equals 6 or 7. Your training data uses 1-7 for Monday-Sunday. What value does Saturday get? Saturday is 6 and Sunday is 7 in the BTS encoding. Your feature is_weekend = df['DAY_OF_WEEK'].isin([6, 7]) produces True for those days. But before you ship this: verify the encoding by checking known dates in the data against the DAY_OF_WEEK value. One wrong assumption about encoding can silently invert the feature's signal. Always verify encodings against ground truth before trusting them.`,

    `You run cross-validation and get: fold scores [0.71, 0.69, 0.73, 0.68, 0.72]. What does the variance between folds tell you? The standard deviation of roughly 0.02 indicates a reasonably stable model — the performance does not swing wildly between different subsets of the training data. If fold scores were [0.55, 0.82, 0.61, 0.79, 0.64], the high variance would indicate the model is sensitive to which data it sees, suggesting either a small dataset, highly variable class distributions across folds, or overfitting. Report both the mean and standard deviation of CV scores, not just the mean.`,

    `After adding the 5 engineered features, your XGBoost ROC AUC improves from 0.71 to 0.74 over the logistic regression baseline. Which of the 5 features contributed most? Use feature importance: xgb_model.feature_importances_ gives a score per feature. But XGBoost's default feature importance (by split count) can be misleading — a feature used in many shallow splits may be less important than a feature used in fewer but more impactful splits. Use SHAP values for a more reliable importance estimate: they account for feature interactions and are consistent across models. A feature with high SHAP importance has a large average impact on the model output.`,

    `You add a feature that is the actual historical delay rate for the departing airport, computed from the training data. This feature improves your model significantly in cross-validation. What is the risk when deploying? This is a leaky feature if computed incorrectly. The airport's historical delay rate must be computed from training data only, then applied as a lookup to both training and test data. If you compute it from the entire dataset (including test), the test data's actual delays inform the feature, creating data leakage. In production, this feature requires a continuously updated lookup table of recent historical delay rates per airport — that infrastructure must be built and maintained.`,

    `You compare logistic regression with your 5 new features against XGBoost with the same features. LR: ROC AUC 0.73. XGB: ROC AUC 0.74. Is the 0.01 difference meaningful enough to justify using XGBoost? Statistical significance: run bootstrap confidence intervals on both. If the confidence intervals overlap, the difference may be noise. Operational considerations: XGBoost takes longer to train, is harder to interpret, and has more hyperparameters to maintain. For a 0.01 ROC AUC gain, many teams would stay with logistic regression for the interpretability and operational simplicity. If the gain were 0.05+, the calculus changes. Always make model selection decisions with both performance and operational cost in mind.`,
  ],

  common_mistakes: [
    `Creating features that look at future data from the model's perspective. If you include ACTUAL_ARRIVAL_TIME as a feature predicting ARRIVAL_DELAY, you are using the delay to predict the delay. Every feature must represent information available at the time of prediction — at departure, before the flight lands.`,

    `Applying feature engineering transformations differently at training time and inference time. If you compute the rush-hour flag using different hour cutoffs at training versus inference, the model's learned patterns will not transfer. Use a single FeatureEngineer class or function that is called identically in both contexts.`,

    `Adding every possible feature and not evaluating each one's contribution. Adding noise features can degrade model performance. After adding each new feature, measure whether cross-validation performance improved. Keep features that help, drop features that do not. Feature engineering is iterative.`,

    `Not checking for highly correlated features. If morning_rush and DEP_HOUR are highly correlated (0.95+), including both in a logistic regression introduces multicollinearity that inflates coefficient standard errors. For tree models, redundant features are less harmful but still waste model capacity. Compute the correlation matrix and flag pairs above 0.85.`,

    `Engineering features in the notebook without extracting them into a reusable function. If your feature engineering code is scattered across notebook cells, it cannot be easily applied to new data. Extract it into a single transform(df) function before the end of this week.`,
  ],

  debug_help: `The most confusing XGBoost error is "feature names mismatch": the model was trained with a specific set of column names and the inference data has a different set or order. XGBoost is strict about this. Fix: always pass data as a pandas DataFrame with named columns (not a numpy array) to XGBoost. Use pd.get_dummies() or an encoder that stores the expected columns and reindexes the inference DataFrame to match. The error message will tell you which column is unexpected or missing.`,

  ai_assist: `Use Claude to brainstorm additional feature ideas beyond your initial 5. Describe the flight data columns available to you and ask it to suggest domain-motivated features. Evaluate each suggestion critically — some will be data-leaky, some will be impractical, some will be genuinely useful. This is a good use of AI for ideation, followed by your own judgment for selection.`,

  stretch: [
    `Add a carrier historical on-time rate feature: for each airline, compute the average on-time rate in the training data and merge it as a feature. Verify it is computed on training data only and applied as a static lookup.`,
    `Build a feature importance dashboard using SHAP: plot the SHAP summary plot showing the contribution of each feature to individual predictions. Identify which features push predictions toward "late" and which push toward "on time."`,
    `Test whether your feature engineering helps more on logistic regression (which cannot capture interactions) than on XGBoost (which discovers interactions automatically). Write a 3-sentence interpretation of what the comparison tells you about when feature engineering matters most.`,
  ],
});

rewriteWeek("ml-engineering", 3, {
  context: `Every model has hyperparameters — settings that control the learning algorithm rather than being learned from data. XGBoost has dozens: learning rate, tree depth, regularisation terms, subsampling rates, column sampling rates. The difference between default hyperparameters and well-tuned ones is often 5-15% in model quality on a real dataset. This week you find better settings for FlightWise using Optuna's Bayesian search.

Grid search is the naive approach: enumerate all combinations of hyperparameter values and evaluate each. For 4 hyperparameters with 5 values each, that is 625 trials. Most are wasted because the search does not learn from prior results. Random search is better: sample random combinations and you cover the hyperparameter space more efficiently than a grid with the same number of trials.

Bayesian optimisation (what Optuna uses by default) is better still. It builds a probabilistic model of which hyperparameter regions are promising based on results so far, and samples new trials to maximise the expected improvement. After 30-50 trials, it has usually found a region close to the optimum. You get 80% of the benefit of exhaustive search in 5% of the trials.

Cross-validation inside the objective function is non-negotiable. If you use a single train/validation split inside Optuna's objective, you may tune toward the noise in that particular split. Using 5-fold cross-validation inside the objective means each hyperparameter combination is evaluated on 5 different subsets of the training data. The score is more stable, and the tuned hyperparameters generalise better to held-out test data.

The danger of hyperparameter tuning is overfitting to the test set. If you run 200 Optuna trials and evaluate the test set after each one to pick the winner, the "best" trial may simply be the one that got lucky on the test set. Tune on the training/validation split only. Evaluate on the test set once, at the very end, as a final confirmation.`,

  pre_flight: `Install optuna. Understand the Optuna trial object: \`trial.suggest_float("learning_rate", 0.01, 0.3, log=True)\` samples a learning rate on a log scale. Know that Optuna minimises by default — if your metric is ROC AUC (higher is better), return its negative. Know what cross-validation returns from sklearn: cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='roc_auc').`,

  mastery_questions: [
    `You run 30 Optuna trials. The best trial achieves ROC AUC 0.768 in cross-validation. How do you know whether to run more trials or stop? Plot the optimization history: Optuna provides optuna.visualization.plot_optimization_history(study). If the best value stopped improving after trial 15 and the last 15 trials have been within 0.002 of each other, you have converged. If the best value is still improving at trial 30, run more. Also check the hyperparameter importance plot: if one hyperparameter dominates and you have not fully explored its range, run a focused search in that range.`,

    `Your Optuna objective function runs 5-fold cross-validation on XGBoost for each trial. Each trial takes 90 seconds. 30 trials takes 45 minutes. How do you speed this up? Three approaches: (1) Use early stopping in XGBoost — set eval_set and early_stopping_rounds so the model stops adding trees when validation performance plateaus, reducing the number of trees trained per trial, (2) Use a smaller subsample of training data (50%) for the Optuna search, then retrain the final model on full data with the best hyperparameters, (3) Parallelize Optuna trials with n_jobs=-1 in the study (requires careful handling of XGBoost's own threading). The first approach is most practical without additional infrastructure.`,

    `You tune max_depth over range [3, 10]. The best trial uses max_depth=9. What does this tell you and what do you do? A very deep tree suggests the model may be overfitting — it needs depth to memorise the training data. This is suspicious. Check the gap between training ROC AUC and cross-validation ROC AUC for the best trial. If training AUC is 0.95 and CV AUC is 0.77, the model is overfitting. The regularisation hyperparameters (min_child_weight, gamma, lambda, alpha) are not constraining it enough. Re-run the search with regularisation parameters in the sweep and expand their ranges.`,

    `After Optuna finds the best hyperparameters, you retrain the model on the full training set and evaluate on the held-out test set. The test ROC AUC is 0.762, compared to 0.768 in cross-validation. Is this expected? A small drop (0.006 in this case) from cross-validation to test is normal and expected. Cross-validation averages over 5 folds; the test set is one particular data split. If the drop were large (0.768 CV to 0.700 test), that would indicate the tuning overfit to the cross-validation splits — you ran too many trials relative to your training size and found hyperparameters that exploit the specific CV folds rather than generalising. More splits (10-fold), or nested cross-validation, addresses this.`,

    `You want to add early stopping to your XGBoost training inside the Optuna objective. Walk through the implementation. Create a validation set from the training data: X_tr, X_val, y_tr, y_val = train_test_split(X_train, y_train, test_size=0.15). Train with: model.fit(X_tr, y_tr, eval_set=[(X_val, y_val)], early_stopping_rounds=20, verbose=False). The model stops adding trees when validation loss does not improve for 20 rounds. The best iteration is model.best_iteration. The objective function returns the CV score of this best model. The number of trees is now determined by early stopping rather than a fixed n_estimators hyperparameter — you remove n_estimators from the search space.`,
  ],

  common_mistakes: [
    `Evaluating the test set inside the Optuna objective. Every time you look at the test set, you use up some of its statistical power. If 200 Optuna trials each peek at the test set, the "best" result is partly just luck on the test data. Tune on train/validation only. Look at the test set once, when tuning is done.`,

    `Using very wide hyperparameter ranges without domain knowledge. Searching learning_rate from 0.0001 to 1.0 is too wide — almost all of that range produces poor results. Start with reasonable defaults and narrow the range based on what you know about XGBoost. Focused searches find better results faster.`,

    `Not setting a random seed on the Optuna study. Without a seed, you cannot reproduce your best hyperparameters. Set: \`optuna.create_study(sampler=optuna.samplers.TPESampler(seed=42))\`.`,

    `Treating the tuned hyperparameters as globally optimal. Hyperparameters optimised for one dataset and one time period may not be optimal if the data distribution shifts. Re-tune when you retrain on significantly updated data.`,

    `Reporting the cross-validation score from Optuna as the model's test performance. The CV score was used for tuning — it is not an unbiased estimate of test performance. Always report the held-out test set score as the final performance number.`,
  ],

  debug_help: `The most confusing Optuna error is a trial that completes but returns a value of None or raises a TrialPruned exception. A None return means your objective function hit a code path that did not return a value — usually an unhandled exception in the model training that was silently caught somewhere. Add a try/except in your objective function that explicitly logs the error and returns a very bad score (0.0) rather than None. This keeps Optuna running while giving you visibility into which hyperparameter combinations cause errors.`,

  ai_assist: `Use Claude to help you choose the right hyperparameter ranges for your Optuna search. Describe the XGBoost hyperparameters you are tuning and ask it to suggest reasonable ranges based on common practice for tabular classification with your dataset size. This saves you from searching ranges that are theoretically possible but practically never optimal. Then run the search yourself.`,

  stretch: [
    `Implement pruning in Optuna: use the XGBoostPruningCallback to report intermediate validation scores and prune unpromising trials early. Measure how much faster the search becomes with pruning versus without.`,
    `Compare TPE sampler (Optuna default) against Random sampler on the same 50-trial budget. Plot both optimization histories. Document which converges faster and whether they find the same best hyperparameters.`,
    `Add the hyperparameter importance visualization after the study completes. Which hyperparameter has the highest importance? Does this match your intuition about what drives XGBoost performance on this dataset?`,
  ],
});

rewriteWeek("ml-engineering", 4, {
  context: `A model sitting in a Jupyter notebook is not serving predictions to anyone. This week you wrap FlightWise in a Flask API, containerise it with Docker, and deploy it to a live public URL. From that point, any application — a mobile app, a browser extension, a chatbot — can call your model with a flight description and get a delay probability back.

A REST API for model serving follows a simple contract. The client sends a POST request with a JSON body containing the flight features. The server loads the model, runs predict_proba on the input, and returns a JSON response containing the delay probability and optionally the prediction confidence or feature importances. The API is stateless — every request is independent.

Flask is the right choice for a first serving deployment. It is lightweight, well-documented, and removes all the complexity of asynchronous frameworks. The limitation is throughput: Flask under default settings handles one request at a time per worker. For a portfolio project with occasional requests, this is fine. Production deployments use multiple workers (gunicorn) or switch to FastAPI for async support.

Docker is what makes your deployment reproducible. Without Docker, your model works on your laptop because of the specific versions of Python, sklearn, and XGBoost installed in your environment. On a different machine — a cloud server, a colleague's laptop, a CI container — the dependencies may differ and the model may not load. Docker packages your application and its exact dependencies into a container image that runs identically everywhere.

Deploying to Render is straightforward: push the Docker image (or connect the GitHub repo) and Render handles the rest. The deployment gives you a public HTTPS URL. For the first time in this roadmap, your model is accessible to anyone with an internet connection.`,

  pre_flight: `Install Docker Desktop. Understand what a Dockerfile is: a recipe for building a container image. Know the key instructions: FROM (base image), WORKDIR, COPY, RUN (install dependencies), CMD (start the server). Understand the difference between building an image and running a container. Have a Render account. Know that joblib.load loads a serialised sklearn model.`,

  mastery_questions: [
    `Your Flask API loads the model on every request with \`model = joblib.load('flightwise.pkl')\` inside the prediction function. What is wrong with this? Loading the model on every request is expensive — it reads from disk and deserialises the model object on each call. For a 50MB XGBoost model, this adds hundreds of milliseconds per request. Fix: load the model once at startup, outside the request handler, in the global scope or in an app factory function. The loaded model object stays in memory and is reused across requests. Flask is single-threaded by default, so there are no threading concerns with a shared model object.`,

    `You receive a POST request with JSON body \`{"DEP_HOUR": 8, "IS_WEEKEND": 1}\` but your model expects 12 features. What should your API return? A 400 Bad Request response with a descriptive error message: \`{"error": "Missing required features", "missing": ["CARRIER", "ORIGIN", "DEST", ...]}\`. Do not return a 500 Internal Server Error — that reveals a stack trace and implies a server bug. A missing feature is a client error (they sent an invalid request). Validate the input at the API layer before passing it to the model. Use a schema validation library or explicit field checking.`,

    `You Dockerize your Flask app. The Dockerfile starts with FROM python:3.11-slim. Why slim specifically? The slim variant is a minimal Debian image without unnecessary tools (gcc, git, man pages, etc.). The full python:3.11 image is ~900MB. The slim image is ~150MB. A smaller base image means faster pull times in deployment, less attack surface, and lower storage costs in a container registry. The tradeoff: some Python packages that require compilation (certain C extensions) may fail to install without build tools. For XGBoost and sklearn pre-built wheels, slim is sufficient.`,

    `Your deployed API on Render works when you test it. A colleague tests it from Japan and gets a 30-second timeout. What do you investigate? The first requests after the Render free tier app idles (after 15 minutes of no traffic) take 30+ seconds to "wake up." This is a cold start. The model loads from disk, the Python interpreter starts, and the dependencies initialise — on first request. Solutions: switch to a paid plan that keeps the container always running, implement a keep-alive pinger that hits the health endpoint every 10 minutes, or accept cold starts and show a loading state in the client for 30 seconds.`,

    `You want to add input feature validation to your Flask API. What is the right approach? Define the expected schema explicitly: a dict mapping feature names to their expected type and valid range. On each request, check that all required features are present, the types match, and values are within the expected range (DEP_HOUR should be 0-23, not -1 or 25). Return specific error messages for each violation. This validation layer protects the model from receiving garbage inputs that produce confident but meaningless predictions.`,
  ],

  common_mistakes: [
    `Not setting a port in the Flask app that matches the Docker EXPOSE instruction and the deployment platform's port configuration. Flask defaults to port 5000. Docker's EXPOSE is documentation only — the actual binding happens with -p in docker run. Render expects the app to listen on the PORT environment variable: \`port = int(os.environ.get("PORT", 5000))\`.`,

    `Including your model file in the Docker image instead of loading it from object storage. A 200MB model inside a Docker image makes the image large, slow to push, and hard to update without rebuilding the entire image. Store the model in S3 or GCS and load it at startup. The Docker image contains only the application code and dependencies.`,

    `Not testing the Docker container locally before deploying. The container environment may behave differently from your local environment — different Python version, different file paths, different environment variables. Always run \`docker build -t flightwise . && docker run -p 5000:5000 flightwise\` and test the running container before pushing.`,

    `Not adding a health check endpoint. A GET /health route that returns \`{"status": "ok", "model_loaded": true}\` takes 5 minutes to add and is required by load balancers and container orchestrators. Add it before your first deployment.`,

    `Returning the raw numpy prediction array without converting to Python types. \`np.float32\` is not JSON-serialisable. Always convert predictions: float(model.predict_proba(X)[0][1]) before returning in a JSON response.`,
  ],

  debug_help: `The most common Docker build failure is a package that installs on your MacOS or Windows machine but fails inside the Linux container because it requires system libraries not present in the slim base image. Symptoms: "error: Microsoft Visual C++ 14.0 or greater is required" on Windows local install translating to a libstdc++ error on Linux. Fix: add \`RUN apt-get update && apt-get install -y build-essential\` to your Dockerfile before the pip install step, or switch to pre-built wheels. Run \`docker build --no-cache\` to reproduce the issue without cached layers hiding it.`,

  ai_assist: `Use Claude to help you write the Dockerfile for your Flask application. Describe: the base image you want, the Python version, the files to copy, and the command to start the server. Ask it to generate a Dockerfile with layer caching optimised (dependencies installed before application code, so dependency layers are cached and only application code layers are rebuilt on code changes). Review and understand every line before using it.`,

  stretch: [
    `Add a /explain endpoint that returns the top 3 most influential features for the prediction using SHAP values. This turns your black-box prediction into an explanation: "This flight is 73% likely to be late because: (1) it departs during evening rush, (2) the carrier has a high historical delay rate, (3) the origin airport is congested."`,
    `Implement request logging: log every prediction request with timestamp, input features, prediction, and latency. Write to a rotating log file inside the container. This is the first step toward production monitoring.`,
    `Add a /batch endpoint that accepts a list of flight records and returns predictions for all of them in a single request. Batch endpoints are more efficient than many single-record calls when you need to score multiple flights at once.`,
  ],
});

rewriteWeek("ml-engineering", 5, {
  context: `Logistic regression and XGBoost are powerful, but using them correctly requires understanding the mathematical principles behind them. This week you step back from FlightWise and build a loan default predictor using the Home Credit dataset — with a focus on interpretability. The goal is to produce a model where you can explain every coefficient, every decision boundary, and every prediction in terms a loan officer would understand.

Ordinary least squares regression minimises the sum of squared residuals. The closed-form solution — the normal equation — gives you the exact optimal coefficients in one matrix operation. Gradient descent arrives at the same place iteratively, which is the only option when the dataset is too large to invert the covariance matrix directly. Understanding both forms gives you intuition about when each is appropriate and what "optimal" actually means.

Logistic regression is OLS adapted for binary classification. The sigmoid function squeezes the linear combination of features into the range (0, 1), giving you a probability. The coefficients are no longer interpretable as direct effects on the outcome — they are log-odds. A coefficient of 0.5 on annual income means that a one-unit increase in income multiplies the odds of default by e^0.5 ≈ 1.65. Converting log-odds to odds ratios and then to plain language is the interpretability skill this week develops.

Regularisation prevents overfitting by penalising large coefficients. L1 (Lasso) penalty drives small coefficients to exactly zero, effectively performing feature selection. L2 (Ridge) penalty shrinks all coefficients toward zero but keeps them all non-zero. Elastic Net is a linear combination of both. For the loan predictor, where you need to explain which features matter, L1 is attractive because it produces a sparse, interpretable model. The regularisation strength (the alpha parameter) controls the tradeoff between fit and simplicity.

The interpretability requirement drives every modelling decision this week: coefficient interpretation, regularisation choice, feature scaling (you must scale features before logistic regression for coefficients to be comparable), and the final report format that presents the model to a non-technical audience.`,

  pre_flight: `Download the Home Credit Default Risk dataset (application_train.csv from Kaggle). It has 307k rows and 122 columns. Start with a subset: select 15-20 features that are likely predictive from the data dictionary. Install scipy for stats tests. Understand what log-odds means: log(p / (1-p)) where p is the probability of the positive class.`,

  mastery_questions: [
    `Your logistic regression model has a coefficient of -2.3 on the DAYS_EMPLOYED feature (the number of days the applicant has been employed). What does this mean in practical terms? First, check the sign convention: negative DAYS_EMPLOYED means employed for many days (longer employment period). A coefficient of -2.3 means that for each one-unit increase in DAYS_EMPLOYED (one more day of employment), the log-odds of default decrease by 2.3. Converting: the odds of default are multiplied by e^(-2.3) ≈ 0.10 per additional day of employment. In plain language: people with longer employment histories are dramatically less likely to default. But you must check the scale — if DAYS_EMPLOYED is in days and ranges from -18000 to 0, a one-unit change is tiny. Scale the feature to years or use a standardised feature so the coefficient has a more interpretable magnitude.`,

    `You compare L1 and L2 regularisation on your loan predictor. L1 produces a model with 12 non-zero coefficients out of 20 features. L2 produces a model with all 20 non-zero coefficients. How do you choose? Start with the use case: a loan officer explaining a decision to an applicant benefits from a sparse model — "these 12 factors drive your score" is clearer than 20 small effects. L1 is better for interpretability. For prediction accuracy alone, run cross-validation on both and compare. L2 often performs marginally better than L1 because it keeps all information rather than zeroing out small signals. L1 + L2 (Elastic Net) often beats both. Run all three and report the comparison.`,

    `Your model receives a feature called DAYS_BIRTH (days since birth, negative for past dates, e.g., -12000 means 12000 days old = roughly 33 years). Before training, how do you handle this? Convert it to a more interpretable feature: age_years = -df['DAYS_BIRTH'] / 365. The negative sign makes DAYS_BIRTH confusing — people with large negative values are older, not younger. Converting to age_years with a positive value is more interpretable and avoids sign errors when reading coefficients. Always transform raw date-as-days features into interpretable units before training an interpretable model.`,

    `You train the model and it achieves ROC AUC 0.74 on validation. A black-box gradient boosted model achieves 0.79. Your stakeholder wants the logistic regression for regulatory compliance (a model that must be explainable). How do you present this tradeoff? The regulatory requirement frames the decision: in credit, interpretability is not optional — it is required by regulation (GDPR, ECOA, Fair Credit). The 0.05 ROC AUC gap translates to: the black-box model correctly classifies X more loans per 1000. Present that number concretely. Then present the risk: a model that cannot be explained cannot be defended in a regulatory audit. The interpretable model may cost some predictive accuracy but it is the model you can operate legally. Most financial institutions choose interpretable models for exactly this reason.`,

    `You want to perform a statistical test to determine whether the logistic regression coefficients are significantly different from zero. What test is appropriate and what does the result tell you? Use the Wald test: for each coefficient, compute the z-score as coefficient / standard_error. Convert to a p-value from the standard normal distribution. A p-value below 0.05 (or your chosen significance threshold) suggests the coefficient is statistically different from zero — the feature has a detectable relationship with the outcome. Features with high p-values may be noise or may have multicollinearity with other features. Note: statistical significance and practical significance are different. A tiny coefficient with p=0.001 may be statistically significant but have negligible effect on predictions.`,
  ],

  common_mistakes: [
    `Not scaling features before logistic regression. Logistic regression with unscaled features produces coefficients that are on wildly different scales — a coefficient of 0.001 on INCOME (in dollars) and 0.8 on IS_EMPLOYED (binary) cannot be directly compared. Use StandardScaler before training. Report coefficients in standard deviation units for comparison.`,

    `Interpreting logistic regression coefficients as probabilities rather than log-odds. The coefficient is the change in log-odds per unit change in the feature, not the change in probability. The relationship between log-odds and probability is nonlinear — a 1-unit change in log-odds corresponds to different probability changes depending on the baseline probability.`,

    `Not checking for multicollinearity before reporting coefficients. If two features are highly correlated (INCOME and INCOME_PER_PERSON), their coefficients become unstable — one may be inflated, the other deflated. Compute VIF (Variance Inflation Factor). Drop or combine features with VIF above 5-10.`,

    `Using the full 122-column dataset without feature selection. Training logistic regression on 122 features with L1 regularisation will work, but interpreting 122 coefficients is impractical. Apply feature selection first: use domain knowledge, correlation analysis, or a quick random forest importance screen to reduce to 20-30 features before training the interpretable model.`,

    `Reporting model performance without a calibration check. Logistic regression probabilities should be calibrated — a predicted probability of 0.3 should mean roughly 30% of applicants with that score default. Check calibration with a reliability diagram. Miscalibrated models make poor business decisions even if their rankings (ROC AUC) are good.`,
  ],

  debug_help: `The most confusing logistic regression failure is a model that trains without errors but has wildly large coefficients (values of 100+ instead of 1-5). This indicates perfect separation: one feature perfectly predicts the outcome in the training data, causing the optimizer to push the coefficient toward infinity. Symptoms: the model gives probability 1.0 or 0.0 to almost every training example. Fix: remove the perfectly separating feature (it is likely data-leaky or represents the target), add stronger regularisation, or check for identical rows in train and test.`,

  ai_assist: `Use Claude to help you write the stakeholder-facing interpretability report for your loan predictor. Paste the top 10 coefficients (with feature names and values) and ask it to write a 3-paragraph plain-English explanation of what the model learned. Review the explanation critically — is the causal language appropriate (correlation does not imply causation), are the magnitude descriptions accurate, is the audience-appropriate vocabulary used? This is a legitimate communication assistance use case.`,

  stretch: [
    `Build a SHAP explanation for a single loan applicant: given their features, show a waterfall chart of how each feature pushed the prediction toward or away from default. Compare the SHAP explanation against the logistic regression coefficient interpretation — do they tell the same story?`,
    `Implement a fairness check: measure the model's performance (accuracy, false positive rate, false negative rate) separately for different demographic groups in the dataset. Document any disparate impact. This is required for regulatory compliance in credit.`,
    `Add confidence intervals to your logistic regression coefficients using bootstrapping: resample the training data 1000 times, fit the model each time, and compute the 2.5th and 97.5th percentile of each coefficient. Present coefficients with their confidence intervals in the report.`,
  ],
});
