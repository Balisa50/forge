// Rebuild DS W37-W39 to the teach->swipe->project standard.
// W37-W39 = Capstone Extended: return to the W28-W30 capstone with senior-DS rigor.
//   W37 v0.2 — Reproducibility + rigorous evaluation
//   W38 v0.3 — Refactor + tests + Docker + deploy
//   W39 v1.0 — Story + readers + interview-ready ship
const fs = require('fs');
const FILE = 'C:/Users/Abdoulie Balisa/OneDrive/Desktop/FORGE/data/roadmaps/data-science.json';
const ds = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const L = (title, body) => ({ kind: 'lesson', title, body });
const V = (title, url, dm, creator, why) => ({ kind: 'video', title, url, duration_min: dm, creator, why });
const S = (cards) => ({ kind: 'swipe', title: 'Quick check — swipe to answer', cards });
const E = (title, body) => ({ kind: 'exercise', title, body });
const D = (number, title, summary, items) => ({ number, title, summary, items });

/* ════ WEEK 37 — Capstone v0.2: Build (extended) ════ */
const W37 = {
  number: 37, title: "Capstone v0.2 - Build (extended)",
  phase: "Capstone Extended", commitment_hours: "10-15",
  context: ds.weeks[36].context,
  concept_check: [
    { q: "Why return to the capstone in W37 instead of starting a new project?",
      choices: ["Easier","The same project deepened to senior-DS quality (reproducible pipeline, rigorous evaluation, multi-metric, decisions doc) is a stronger portfolio piece than two thinner projects",
        "Tradition","Required"],
      correct: 1, explain: "Depth beats breadth on a portfolio. A capstone you've shipped at v1.0, retro'd, and then returned to with senior-DS rigor demonstrates the iteration cycle real ML teams run. Two thinner projects look like 'I tried things'; one project shipped THREE times with documented improvements looks like 'I do this for a living'." },
    { q: "What's the difference between a 'reproducible pipeline' and 'I ran the notebooks in order'?",
      choices: ["None","A reproducible pipeline runs end-to-end with a single command (Make / DVC / Snakemake), pinned dependencies, and a deterministic random seed — anyone can recreate your results exactly",
        "Speed","File names"],
      correct: 1, explain: "A reproducible pipeline means: clone the repo, run one command, get the same numbers. Notebooks in order is fragile — cells get re-run, kernels die, environments drift. A Makefile or DVC config encodes the dependency graph + commands + data hashes so the build is deterministic. Without it, your 'results' are an artifact of your local machine, not a defensible claim." },
    { q: "Why k-fold cross-validation instead of just one train/test split?",
      choices: ["Habit","A single split's accuracy depends on WHICH random rows landed in test — k-fold averages over k splits to give you a more honest estimate of out-of-sample performance, with an uncertainty bound",
        "Faster","Better-sounding"],
      correct: 1, explain: "One train/test split gives one accuracy number. Run the same split 100 times with different random seeds and you'll see that number wobble by several percentage points. k-fold (typically k=5) does k splits, trains k models, averages — the mean is your point estimate; the std-dev is your uncertainty. That's the difference between 'my model is 87% accurate' and 'my model is 87% ± 2% accurate' — only the second is defensible." }
  ],
  days: [
    D(1,"Reproducible pipeline","Makefile or DVC. One command, end-to-end.",[
      L("From notebooks to pipeline",
"## What it is\n" +
"Right now your capstone runs as a sequence of notebooks: `01_ingest.ipynb`, `02_clean.ipynb`, ..., `06_evaluate.ipynb`. To reproduce your results, someone has to:\n" +
"1. Clone the repo\n" +
"2. Install the right dependency versions\n" +
"3. Open Jupyter\n" +
"4. Run each notebook in order\n" +
"5. Hope nothing in the environment drifted\n\n" +
"That's fragile. Today you replace it with a **pipeline**: one command, end-to-end, deterministic. The same input always produces the same output.\n\n" +
"## Two viable tools\n\n" +
"### Makefile (simplest, no extra deps)\n" +
"```makefile\n" +
".PHONY: all clean ingest preprocess train evaluate\n\n" +
"all: evaluate\n\n" +
"data/raw.parquet: src/ingest.py\n" +
"\tpython src/ingest.py\n\n" +
"data/clean.parquet: data/raw.parquet src/clean.py\n" +
"\tpython src/clean.py\n\n" +
"models/main.pkl: data/clean.parquet src/train.py\n" +
"\tpython src/train.py\n\n" +
"reports/metrics.json: models/main.pkl src/evaluate.py\n" +
"\tpython src/evaluate.py\n\n" +
"evaluate: reports/metrics.json\n\n" +
"clean:\n" +
"\trm -rf data/*.parquet models/*.pkl reports/*.json\n" +
"```\n\n" +
"Run: `make` — only rebuilds what needs rebuilding (Make checks file timestamps).\n\n" +
"### DVC (data-versioning + pipeline)\n" +
"```bash\n" +
"pip install dvc\n" +
"dvc init\n" +
"dvc stage add -n ingest -d src/ingest.py -o data/raw.parquet python src/ingest.py\n" +
"dvc stage add -n clean -d src/clean.py -d data/raw.parquet -o data/clean.parquet python src/clean.py\n" +
"dvc stage add -n train -d src/train.py -d data/clean.parquet -o models/main.pkl python src/train.py\n" +
"dvc stage add -n eval  -d src/evaluate.py -d models/main.pkl -m reports/metrics.json python src/evaluate.py\n\n" +
"dvc repro\n" +
"```\n\n" +
"DVC tracks data file HASHES (not just timestamps), and metrics are first-class. Heavier than Make; better when datasets are big or pinned to S3.\n\n" +
"## Convert your notebooks to scripts FIRST\n" +
"```bash\n" +
"jupyter nbconvert --to script notebooks/01_ingest.ipynb --output ../src/ingest\n" +
"# repeat for the rest, then clean up the auto-generated cruft\n" +
"```\n\n" +
"Notebooks stay for exploration; scripts run the pipeline.\n\n" +
"## Pin dependency versions\n" +
"```bash\n" +
"pip freeze > requirements.txt\n" +
"```\n\n" +
"Or better: `pyproject.toml` with pinned versions. The point is reproducibility — `pandas` works differently in 1.5 vs 2.0; pin it.\n\n" +
"## Pin the random seed\n" +
"In every place randomness matters (train/test split, model init, sample weights):\n" +
"```python\n" +
"import numpy as np, random, torch\n" +
"SEED = 42\n" +
"np.random.seed(SEED); random.seed(SEED); torch.manual_seed(SEED)\n" +
"```\n\n" +
"## What you'll have by end of day\n" +
"- Notebooks → scripts in `src/`\n" +
"- Makefile (or `dvc.yaml`) that runs the whole pipeline\n" +
"- Pinned `requirements.txt`\n" +
"- One global SEED in `src/config.py`\n" +
"- `make clean && make` reproduces all metrics exactly"
      ),
      V("Make for ML pipelines","https://www.youtube.com/watch?v=lcnxdmkU3RM",10,"various","Watch first. Make basics applied to data pipelines — the patterns transfer to any project."),
      S([
        { prompt: "A reproducible pipeline means anyone can clone the repo, run one command, and get the same numbers.", answer: true, whenRight: "Right — that's the bar. 'Run the notebooks in order' isn't reproducible; it's a hope.", whenWrong: "Yes — one command, deterministic output. Anything less is environment-dependent." },
        { prompt: "Pinning the random seed is paranoid — modern ML is robust to it.", answer: false, whenRight: "Right — no. Different seeds produce different splits, different inits, different metrics. Without a pinned seed, results aren't reproducible.", whenWrong: "Pinning is required for reproducibility. Seed differences move accuracy by percentage points; without a pin, results drift." },
        { prompt: "DVC tracks data file hashes; Make tracks timestamps. Both are valid reproducibility tools.", answer: true, whenRight: "Right — pick based on dataset size and team. Make for small projects; DVC when data is huge or pinned to remote storage.", whenWrong: "Yes — both work. DVC is heavier and better for big data + teams; Make is lighter and fine for solo / small data." }
      ]),
      E("Your turn — pipeline","[CODE] 1. Convert notebooks to scripts in `src/`.\n2. Write a Makefile (or `dvc.yaml`) for ingest → clean → train → evaluate.\n3. Pin a global SEED in `src/config.py`; use it everywhere randomness matters.\n4. `pip freeze > requirements.txt`.\n5. `make clean && make` — confirm it runs end-to-end and metrics match your W30 v1.0 numbers.\n6. Commit.")
    ]),
    D(2,"Baseline first — done properly","The simplest model, fairly evaluated.",[
      L("The baseline as a contract",
"## What it is\n" +
"In W28-W30 you built a baseline. Today you tighten it: a STRONG, fair, well-evaluated baseline is the bar your main model has to clear. The honest comparison is the spine of the audit.\n\n" +
"## Strong baselines by problem type\n" +
"```text\n" +
"Regression:\n" +
"  Ridge regression on engineered features. NOT 'predict the mean'.\n" +
"  Engineering matters: include interactions, polynomial terms.\n" +
"\n" +
"Classification:\n" +
"  Logistic regression on engineered features, class-weighted if imbalanced.\n" +
"  NOT 'majority class predictor' — that's a sanity check, not a baseline.\n" +
"\n" +
"Time series:\n" +
"  ETS or SARIMA, properly cross-validated with time-aware splits.\n" +
"  Persistence is a sanity check; ETS is the real baseline.\n" +
"\n" +
"Recommendation:\n" +
"  Item popularity + per-user popularity bias. NOT 'random recommend'.\n" +
"```\n\n" +
"## Why the baseline matters more in v0.2 than v0.1\n" +
"In W28-W30 a weak baseline was fine; the goal was 'something works'. In v0.2 the goal is 'something works AND we know exactly how much better than the simplest defensible alternative'. If your fancy model is 2% better than a properly-tuned linear regression, you have a different story than if it's 30% better.\n\n" +
"## Tune the baseline the same way you tune the main model\n" +
"A common cheat: under-tune the baseline so the main model looks better. Don't. Cross-validated hyperparameter search for the baseline too.\n\n" +
"```python\n" +
"from sklearn.linear_model import LogisticRegressionCV\n" +
"baseline = LogisticRegressionCV(\n" +
"    Cs=10, cv=5, class_weight='balanced', max_iter=2000,\n" +
"    scoring='roc_auc', random_state=SEED,\n" +
")\n" +
"baseline.fit(X_train, y_train)\n" +
"```\n\n" +
"## Document the baseline\n" +
"```markdown\n" +
"## Baseline\n" +
"\n" +
"- Model: LogisticRegressionCV (10 C values, 5-fold inner CV)\n" +
"- Features: <list>\n" +
"- Class weighting: balanced (target is imbalanced 7:1)\n" +
"- Cross-validated 5-fold AUC: 0.812 ± 0.011\n" +
"- Single train/test AUC: 0.819 (test set)\n" +
"```\n\n" +
"Both numbers — the CV mean ± std AND the single test number — go in the report. Different audiences read each."
      ),
      S([
        { prompt: "A properly-tuned linear baseline is more useful than a 'majority class' predictor.", answer: true, whenRight: "Right — majority-class is a sanity check; a tuned linear model is a real benchmark. Beat the linear one or rethink the model.", whenWrong: "Yes — tuned linear is the baseline. Majority-class is the floor below which your code is broken." },
        { prompt: "Under-tuning the baseline to make the main model look better is acceptable for a portfolio.", answer: false, whenRight: "Right — no. Reviewers spot it instantly; trust collapses. Tune the baseline the same way you tune the main model.", whenWrong: "Equal tuning effort. An under-tuned baseline = an inflated improvement claim = caught in review = trust gone." },
        { prompt: "For class-imbalanced classification, class-weighted logistic regression is a stronger baseline than uniform logistic.", answer: true, whenRight: "Right — class weighting changes the loss to pay attention to the minority class. Standard for imbalanced data.", whenWrong: "Yes — class_weight='balanced' (or explicit weights). Imbalanced classification ALWAYS needs weighting; otherwise the model just predicts the majority." }
      ]),
      E("Your turn — strong baseline","[CODE] 1. Replace your W30 baseline with a properly-tuned linear / boosted-stump / ETS / etc., depending on task.\n2. Hyperparameter search with cross-validation.\n3. Run on test set; record metrics in `reports/baseline.json`.\n4. Document in `BASELINE.md` (model, features, tuning, CV score, test score).\n5. Commit.")
    ]),
    D(3,"k-fold cross-validation","Proper splits, no leakage, honest uncertainty.",[
      L("Cross-validation that doesn't lie",
"## What it is\n" +
"A single train/test split gives you one number. k-fold CV gives you k numbers + their mean and standard deviation. The std-dev is the honest uncertainty around the point estimate.\n\n" +
"## The standard pattern\n" +
"```python\n" +
"from sklearn.model_selection import KFold, cross_val_score\n" +
"import numpy as np\n\n" +
"kf = KFold(n_splits=5, shuffle=True, random_state=SEED)\n" +
"scores = cross_val_score(model, X, y, cv=kf, scoring='roc_auc', n_jobs=-1)\n" +
"print(f'AUC: {scores.mean():.3f} ± {scores.std():.3f}')\n" +
"# AUC: 0.871 ± 0.014\n" +
"```\n\n" +
"That ± is the honest report. 'AUC 0.871' alone is half a sentence.\n\n" +
"## Stratified k-fold for classification\n" +
"```python\n" +
"from sklearn.model_selection import StratifiedKFold\n" +
"skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)\n" +
"```\n\n" +
"Preserves class proportions across folds. Required for imbalanced classification — without it, some folds might have very few minority-class examples.\n\n" +
"## Time-series cross-validation\n" +
"For temporal data, standard k-fold LEAKS — it lets the model train on future and predict past. Use `TimeSeriesSplit`:\n" +
"```python\n" +
"from sklearn.model_selection import TimeSeriesSplit\n" +
"tscv = TimeSeriesSplit(n_splits=5)\n" +
"for fold, (tr_idx, te_idx) in enumerate(tscv.split(X)):\n" +
"    # tr_idx is always earlier than te_idx\n" +
"    ...\n" +
"```\n\n" +
"## The leakage traps to know\n" +
"```text\n" +
"1. Feature engineering BEFORE the split — fit your StandardScaler on the\n" +
"   train fold, apply to test. NOT on the full dataset.\n" +
"\n" +
"2. Target encoding leakage — encoding categorical features using statistics\n" +
"   that include the test fold's outcomes. Use within-fold encoding only.\n" +
"\n" +
"3. Time leakage — using features that wouldn't have been known at\n" +
"   prediction time (next-day temperature when forecasting tomorrow).\n" +
"\n" +
"4. Group leakage — same patient / user / customer in both train and test.\n" +
"   Use GroupKFold to ensure groups don't span the split.\n" +
"```\n\n" +
"## Pipeline-aware CV (no leakage by construction)\n" +
"```python\n" +
"from sklearn.pipeline import Pipeline\n" +
"from sklearn.preprocessing import StandardScaler\n\n" +
"pipe = Pipeline([\n" +
"    ('scaler', StandardScaler()),\n" +
"    ('clf', LogisticRegression(max_iter=2000)),\n" +
"])\n\n" +
"scores = cross_val_score(pipe, X, y, cv=skf, scoring='roc_auc')\n" +
"# Each fold: scaler fits on train fold only, transforms test fold\n" +
"# No leakage by construction.\n" +
"```\n\n" +
"This is the move. Wrap everything pre-modeling into a `Pipeline`; cross-validate the pipeline; leakage is impossible because each fold gets its own fit.\n\n" +
"## Update reports\n" +
"```python\n" +
"import json\n" +
"json.dump({\n" +
"    'cv_auc_mean': float(scores.mean()),\n" +
"    'cv_auc_std':  float(scores.std()),\n" +
"    'cv_folds':    [float(s) for s in scores],\n" +
"}, open('reports/cv_metrics.json', 'w'), indent=2)\n" +
"```"
      ),
      S([
        { prompt: "k-fold CV gives you both a point estimate AND an uncertainty estimate for out-of-sample performance.", answer: true, whenRight: "Right — mean is the point estimate; std-dev is the uncertainty. Together they're the honest report.", whenWrong: "Yes — mean + std. Single-split accuracy hides the uncertainty; k-fold makes it explicit." },
        { prompt: "Using standard k-fold on time-series data introduces leakage by letting the model train on future and predict past.", answer: true, whenRight: "Right — temporal data demands TimeSeriesSplit. Standard k-fold leaks unless splits respect time order.", whenWrong: "Yes — TimeSeriesSplit for temporal data. Standard k-fold breaks the 'no future data in training' rule." },
        { prompt: "Fitting a StandardScaler on the full dataset before splitting into folds is a sensible optimization.", answer: false, whenRight: "Right — no. That leaks information about the test fold into training. Fit the scaler INSIDE each fold (use a Pipeline).", whenWrong: "Leakage. Always fit transforms inside each fold via Pipeline. Outside-fold fitting biases the score upward." }
      ]),
      E("Your turn — cross-validate","[CODE] In `src/cv.py`:\n1. Wrap preprocessing + model in a sklearn `Pipeline`.\n2. Use Stratified (classification) / TimeSeriesSplit (time) / GroupKFold (grouped) as appropriate.\n3. Run 5-fold CV; save metrics to `reports/cv_metrics.json`.\n4. Compare CV score to single-split test score in `reports/CV.md`.\n5. Markdown: is the single-split score within 1 std-dev of the CV mean? If not, you got lucky/unlucky.")
    ]),
    D(4,"Multi-metric evaluation","Beyond accuracy.",[
      L("Why one metric is never enough",
"## What it is\n" +
"Accuracy alone hides too much. The senior move is to report a small set of complementary metrics that together tell the whole story.\n\n" +
"## The metrics that pair well\n\n" +
"### Classification\n" +
"```text\n" +
"Always:    ROC AUC + PR AUC (for imbalanced)\n" +
"Often:     Per-class precision / recall / F1\n" +
"Often:     Confusion matrix at chosen threshold\n" +
"For ops:   Calibration curve (do predicted probabilities match reality?)\n" +
"```\n\n" +
"### Regression\n" +
"```text\n" +
"Always:    MAE + RMSE\n" +
"Often:     R²\n" +
"For ops:   Residual plot (do errors have structure?)\n" +
"For $:     MAPE or sMAPE (% error)\n" +
"```\n\n" +
"### Time series\n" +
"```text\n" +
"Always:    MAE + RMSE on the test horizon\n" +
"Often:     Per-horizon error (1-day, 7-day, 30-day)\n" +
"For ops:   Coverage of 95% prediction intervals\n" +
"```\n\n" +
"## The code (classification example)\n" +
"```python\n" +
"from sklearn.metrics import (\n" +
"    roc_auc_score, average_precision_score,\n" +
"    classification_report, confusion_matrix,\n" +
")\n" +
"from sklearn.calibration import calibration_curve\n" +
"import matplotlib.pyplot as plt\n\n" +
"proba = model.predict_proba(X_test)[:, 1]\n" +
"pred  = (proba >= 0.5).astype(int)\n\n" +
"metrics = {\n" +
"    'roc_auc': roc_auc_score(y_test, proba),\n" +
"    'pr_auc':  average_precision_score(y_test, proba),\n" +
"    'report':  classification_report(y_test, pred, output_dict=True),\n" +
"    'cm':      confusion_matrix(y_test, pred).tolist(),\n" +
"}\n\n" +
"# Calibration plot\n" +
"frac_pos, mean_pred = calibration_curve(y_test, proba, n_bins=10)\n" +
"plt.plot(mean_pred, frac_pos, 'o-')\n" +
"plt.plot([0,1], [0,1], '--', color='gray')\n" +
"plt.xlabel('predicted probability'); plt.ylabel('fraction positive')\n" +
"plt.savefig('reports/calibration.png')\n" +
"```\n\n" +
"## What 'beyond accuracy' lets you see\n" +
"- **AUC 0.87, PR AUC 0.41** on a 5% positive rate → model is great at ranking but bad at predicting the actual probability. You'd use this for top-N selection, not for risk scoring.\n" +
"- **Accuracy 0.91, but recall for the positive class 0.35** → the model is failing on the thing you cared about. The 91% comes from correctly labelling negatives.\n" +
"- **MAE 12, but residuals systematically positive at the high end** → the model under-predicts where stakes are highest. Different fix than a uniform MAE problem.\n\n" +
"Each of these stories is invisible from accuracy alone.\n\n" +
"## What goes in reports/metrics.json\n" +
"```json\n" +
"{\n" +
"  \"model\": \"main_v0.2\",\n" +
"  \"cv\": {\"roc_auc_mean\": 0.871, \"roc_auc_std\": 0.014},\n" +
"  \"test\": {\n" +
"    \"roc_auc\": 0.879,\n" +
"    \"pr_auc\": 0.413,\n" +
"    \"per_class\": {...},\n" +
"    \"confusion_matrix\": [[8401, 122], [185, 412]],\n" +
"    \"calibration\": {\"bin_centers\": [...], \"observed\": [...]}\n" +
"  },\n" +
"  \"baseline\": {\"roc_auc\": 0.812}\n" +
"}\n" +
"```"
      ),
      S([
        { prompt: "On imbalanced classification, ROC AUC alone can hide that the model is bad at the minority class.", answer: true, whenRight: "Right — ROC AUC weights both classes equally in ranking. PR AUC + per-class recall expose minority-class weakness.", whenWrong: "Yes — ROC can mislead on imbalance. Always pair with PR AUC and per-class recall." },
        { prompt: "A calibration plot tells you whether predicted probabilities match observed frequencies.", answer: true, whenRight: "Right — predicted 0.3 should mean 30% positive in that bin. Miscalibration = predictions can't be used as probabilities.", whenWrong: "Yes — calibration = probability honesty. Miscalibrated models can still rank well but can't be used for thresholding decisions." },
        { prompt: "Reporting a single metric (accuracy or AUC) is enough for a senior-DS audit.", answer: false, whenRight: "Right — no. A small SET of complementary metrics tells the story; one number hides too much. Multi-metric is the senior move.", whenWrong: "One number hides. Multi-metric = honest. Senior reports name 4-6 metrics and what each catches that the others miss." }
      ]),
      E("Your turn — multi-metric","[CODE] In `src/evaluate.py`:\n1. Compute ALL relevant metrics for your problem (5-7 numbers).\n2. Save to `reports/metrics.json`.\n3. Generate diagnostic plots: confusion matrix (classification) / residual plot (regression) / calibration plot.\n4. Save plots to `reports/`.\n5. Markdown summary in `reports/METRICS.md`.")
    ]),
    D(5,"Pick the winner","Not always the highest accuracy.",[
      L("'Best' is contextual",
"## What it is\n" +
"You have two or three model candidates with multi-metric evaluations. Today you pick the one that ships — using criteria broader than a single metric.\n\n" +
"## The criteria that matter\n" +
"```text\n" +
"1. Accuracy on the metric that matches the use case\n" +
"2. Latency (inference time per prediction)\n" +
"3. Size (memory + disk)\n" +
"4. Interpretability (can you explain a prediction to a stakeholder?)\n" +
"5. Retraining cost (how often + how expensive)\n" +
"6. Robustness (degradation on out-of-distribution inputs)\n" +
"7. Calibration (probabilities usable as probabilities)\n" +
"```\n\n" +
"## A decision matrix\n" +
"```markdown\n" +
"| Criterion              | Linear  | XGBoost | NeuralNet |\n" +
"|------------------------|---------|---------|-----------|\n" +
"| ROC AUC                | 0.812   | **0.871** | 0.864   |\n" +
"| Latency (ms/predict)   | **0.1** | 1.4     | 12.3      |\n" +
"| Size (MB)              | **0.1** | 11.0    | 87.0      |\n" +
"| Interpretable          | **Yes** | Partial | No        |\n" +
"| Retrain cost           | **Sec** | Min     | Hour      |\n" +
"| OOD degradation        | Gentle  | Cliff   | Cliff     |\n" +
"| Calibration            | **Good**| Fair    | Poor      |\n" +
"```\n\n" +
"On AUC, XGBoost wins. On EVERYTHING else, the linear baseline wins. Whether XGBoost is the right pick depends on whether the 5.9 AUC points are worth the cost.\n\n" +
"## Pick + justify in writing\n" +
"```markdown\n" +
"## Production model: XGBoost\n" +
"\n" +
"Reasoning:\n" +
"- AUC gap (0.871 vs 0.812) is meaningful for the use case — ranking the\n" +
"  top 1000 customers means catching ~60 more true positives.\n" +
"- Latency at 1.4ms easily fits the 50ms SLO.\n" +
"- Interpretability is partial (SHAP works on XGBoost); for stakeholder\n" +
"  conversations we'll lean on SHAP per-customer explanations.\n" +
"- Retrain cost (minutes) is acceptable given monthly cadence.\n" +
"- OOD risk is real — we'll monitor input drift in production (see DRIFT.md).\n" +
"\n" +
"Alternatives:\n" +
"- Linear model remains in the repo. If interpretability becomes hard-required\n" +
"  by a future stakeholder, swap is one config line.\n" +
"- NeuralNet did not justify its size or its calibration cost.\n" +
"```\n\n" +
"## What this writeup demonstrates\n" +
"That you didn't pick the highest-AUC model by default. You PICKED, with reasons. That's the senior move."
      ),
      S([
        { prompt: "Picking the model with the highest accuracy is always the right move.", answer: false, whenRight: "Right — no. Accuracy is one of seven dimensions: latency, size, interpretability, retrain cost, robustness, calibration. Pick by the WHOLE picture.", whenWrong: "Highest accuracy is one factor among many. The 'best' model is contextual; pick on the use-case-matched mix." },
        { prompt: "Writing out the decision matrix + the reasoning makes the choice defensible to a reviewer.", answer: true, whenRight: "Right — implicit picks read as 'I picked the trendy one'. Explicit reasoning reads as 'I PICKED, here's why'.", whenWrong: "Yes — explicit reasoning. Reviewers can't argue with a documented tradeoff; they can argue with an opaque pick." },
        { prompt: "Keeping the rejected alternatives in the repo with notes on when to swap is overkill.", answer: false, whenRight: "Right — no. Documented alternatives = optionality. If the chosen model fails in production, swap is one config line.", whenWrong: "Alternatives = optionality. Future-you might need to swap; documented alternatives make that trivial." }
      ]),
      E("Your turn — pick + justify","[WRITE] 1. Build the decision matrix for your candidates.\n2. Pick ONE production model.\n3. Write the justification (4-5 sentences) in `DECISIONS.md`.\n4. Document the alternatives + when you'd swap.\n5. Commit.")
    ]),
    D(6,"Save artifacts","Models, predictions, plots — everything reviewable.",[
      L("The artifact discipline",
"## What it is\n" +
"After today, EVERY number in your reports has a saved artifact behind it. Anyone reviewing the audit can pull the actual model, the actual predictions, the actual plot data — and re-verify.\n\n" +
"## The artifact list\n" +
"```text\n" +
"models/\n" +
"  baseline.pkl           the tuned baseline\n" +
"  main.pkl               the production pick\n" +
"  alternatives/          rejected candidates\n" +
"\n" +
"reports/\n" +
"  metrics.json           all numbers in one file\n" +
"  cv_metrics.json        per-fold scores\n" +
"  baseline_metrics.json  baseline-only numbers\n" +
"  predictions.parquet    held-out predictions for audit\n" +
"  calibration.png\n" +
"  confusion_matrix.png\n" +
"  residual_plot.png      (regression)\n" +
"  shap_summary.png       (interpretability)\n" +
"\n" +
"data/\n" +
"  raw.parquet            (or DVC-tracked)\n" +
"  clean.parquet\n" +
"  splits/\n" +
"    train_idx.npy        the exact rows used in train\n" +
"    test_idx.npy         the exact rows used in test\n" +
"```\n\n" +
"## Why save the split indices\n" +
"Anyone re-running your code with the same seed should get the same split. Saving the indices is belt-and-braces: they can verify the split without trusting the seed.\n\n" +
"## Save the predictions\n" +
"```python\n" +
"import pandas as pd\n" +
"pred_df = pd.DataFrame({\n" +
"    'index':  X_test.index,\n" +
"    'y_true': y_test,\n" +
"    'y_pred': model.predict(X_test),\n" +
"    'y_proba': model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else None,\n" +
"})\n" +
"pred_df.to_parquet('reports/predictions.parquet', index=False)\n" +
"```\n\n" +
"Reviewers can recompute any metric from this file. They can spot-check the worst predictions. They can find subgroup disparities you missed.\n\n" +
"## Add SHAP for interpretability\n" +
"```python\n" +
"import shap\n" +
"explainer = shap.TreeExplainer(xgb_model)\n" +
"shap_values = explainer.shap_values(X_test)\n" +
"shap.summary_plot(shap_values, X_test, show=False)\n" +
"plt.savefig('reports/shap_summary.png', bbox_inches='tight')\n" +
"```\n\n" +
"One SHAP plot in the report is the difference between 'opaque model' and 'I know which features drive predictions'.\n\n" +
"## The repo .gitattributes for big files\n" +
"For models > 10MB, use Git LFS or DVC-tracked storage. Don't commit binary blobs straight to git.\n" +
"```text\n" +
"# .gitattributes\n" +
"models/*.pkl filter=lfs diff=lfs merge=lfs -text\n" +
"data/*.parquet filter=lfs diff=lfs merge=lfs -text\n" +
"```\n\n" +
"Or for DVC: `dvc add models/main.pkl` and commit only the `.dvc` pointer."
      ),
      S([
        { prompt: "Saving the held-out predictions in a parquet file lets reviewers recompute any metric from your data.", answer: true, whenRight: "Right — predictions + truth = any metric. Reviewers don't have to trust your numbers; they can re-derive them.", whenWrong: "Yes — predictions.parquet = audit trail. Anyone can re-derive your numbers." },
        { prompt: "Saving split indices is redundant if you have a pinned random seed.", answer: false, whenRight: "Right — no. Belt-and-braces: indices let reviewers verify the split without re-running and trusting the seed.", whenWrong: "Seed + indices = double protection. Indices let reviewers verify directly, no re-run needed." },
        { prompt: "Committing 50MB model files directly to git is the right pattern.", answer: false, whenRight: "Right — no. Use Git LFS or DVC for binaries. Straight git history is for source code, not binary blobs.", whenWrong: "Use LFS or DVC. Binary blobs in git bloat the repo and slow clones for everyone." }
      ]),
      E("Your turn — artifacts","[CODE] 1. Save all the models (baseline + main + alternatives).\n2. Save predictions.parquet.\n3. Save split indices (npy or csv).\n4. Generate SHAP summary plot (or feature_importances if SHAP doesn't apply).\n5. Set up Git LFS or DVC for files > 10MB.\n6. Commit.")
    ]),
    D(7,"DECISIONS.md + tag v0.2","Track tradeoffs; ship the rigor milestone.",[
      L("The DECISIONS log",
"## What it is\n" +
"A single document that records the non-obvious choices you made during the extended build, with one-line reasoning each. Anyone returning to the project — including you in six months — needs this to understand why the code looks the way it does.\n\n" +
"## The format\n" +
"```markdown\n" +
"# DECISIONS\n" +
"\n" +
"## 2026-06-10 — Pipeline tool: Makefile, not DVC\n" +
"Project is solo, dataset is small (~50MB). Make's timestamp-based\n" +
"reproducibility is enough; DVC's data hashing would add overhead without\n" +
"a matching benefit.\n" +
"\n" +
"## 2026-06-10 — Random seed: 42\n" +
"Pinned in `src/config.py`, used everywhere randomness matters.\n" +
"Reproducibility > the marginal gain of varying it.\n" +
"\n" +
"## 2026-06-11 — Baseline: LogisticRegressionCV with class_weight='balanced'\n" +
"Target is imbalanced 7:1. Unweighted logistic just predicts the majority.\n" +
"CV picks C from 10 options on inner 5-fold AUC; produces a fair benchmark.\n" +
"\n" +
"## 2026-06-12 — CV strategy: StratifiedKFold(5, shuffle=True)\n" +
"Classification problem; need class balance per fold. 5 folds chosen over 10\n" +
"because the dataset is large enough that 5 gives stable estimates and the\n" +
"compute cost matters for the iteration speed.\n" +
"\n" +
"## 2026-06-13 — Eval metrics: ROC AUC primary, PR AUC + per-class recall secondary\n" +
"PR AUC and minority-class recall surface the imbalance behaviour that ROC\n" +
"hides. Calibration plot included because predicted probabilities are used\n" +
"downstream in the threshold decision.\n" +
"\n" +
"## 2026-06-14 — Production model: XGBoost (not the neural net)\n" +
"AUC gap to baseline (0.871 vs 0.812) is meaningful. NN was 0.864 — within\n" +
"noise of XGBoost — at 8× the size, 10× the inference latency, and no SHAP.\n" +
"Not worth it. NN stays in the repo as a documented alternative.\n" +
"\n" +
"## 2026-06-15 — Predictions + split indices committed via LFS\n" +
"Anyone can verify any metric from `reports/predictions.parquet` without\n" +
"re-running the pipeline. Split indices in `data/splits/` are belt-and-\n" +
"braces in case seed-based reproduction differs across environments.\n" +
"```\n\n" +
"## Why this document is the v0.2 deliverable\n" +
"Every senior-DS code review eventually asks 'why did you do X?'. Most projects don't have an answer because the reasoning is in the author's head (or gone). DECISIONS.md is the answer pre-written. It's the artifact that turns a project from 'I wrote some code' into 'I made deliberate choices, here they are'.\n\n" +
"## Tag v0.2\n" +
"```bash\n" +
"git add src/ Makefile requirements.txt reports/ models/ DECISIONS.md \\\n" +
"        BASELINE.md CV.md METRICS.md\n" +
"git commit -m \"Capstone v0.2: reproducible pipeline + rigorous evaluation + DECISIONS.md\"\n" +
"git tag capstone-v0.2-extended\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## What v0.2 (extended) is, versus W29's v0.2\n" +
"- W29 v0.2 — 'I trained a main model + baseline + iterated'\n" +
"- W37 v0.2 — 'The pipeline is reproducible. CV is rigorous. Metrics are honest. The pick is justified. Every choice is documented.'\n\n" +
"Same project, senior-DS depth. Next week: polish + deploy."
      ),
      S([
        { prompt: "DECISIONS.md captures non-obvious choices + reasoning so future-you (and reviewers) understand WHY the code is the way it is.", answer: true, whenRight: "Right — reasoning evaporates without a written log. DECISIONS.md is the cheapest way to preserve it.", whenWrong: "Yes — write it down. Six-months-later-you will not remember why you picked XGBoost over the NN." },
        { prompt: "Tagging v0.2-extended preserves the rigorous state before next week's refactor + deploy work.", answer: true, whenRight: "Right — tags are recovery points. If next week's refactor breaks something, you can compare diffs against v0.2.", whenWrong: "Yes — tags = checkpoints. Refactor week is high-risk; the tag protects the working state." },
        { prompt: "The DECISIONS log is most valuable when it includes ONLY the wins and skips the rejected alternatives.", answer: false, whenRight: "Right — no. The rejected alternatives + reasons are the most valuable entries; they show you considered and rejected, not just defaulted.", whenWrong: "Rejected alternatives matter most. They prove you considered options. 'I picked XGBoost because NN was within noise but 8× larger' = real reasoning." }
      ]),
      E("Your turn — DECISIONS + tag","[PRODUCE] 1. Write `DECISIONS.md` with EVERY non-obvious choice from W37.\n2. Each entry: ~3 sentences max, with reasoning.\n3. Commit + tag:\n`git add . && git commit -m 'capstone v0.2 extended: rigor pass'`\n`git tag capstone-v0.2-extended && git push --tags`\n\nPASS:\n[x] Makefile (or dvc.yaml) runs end-to-end\n[x] requirements.txt pinned\n[x] SEED used everywhere\n[x] BASELINE.md with tuned baseline\n[x] CV.md with k-fold methodology\n[x] METRICS.md with multi-metric\n[x] DECISIONS.md with reasoning\n[x] predictions.parquet + models/ committed (LFS if needed)\n[x] capstone-v0.2-extended tag pushed")
    ])
  ]
};

/* ════ WEEK 38 — Capstone v0.3: Polish + deploy ════ */
const W38 = {
  number: 38, title: "Capstone v0.3 - Polish + deploy",
  phase: "Capstone Extended", commitment_hours: "10-15",
  context: ds.weeks[37].context,
  concept_check: [
    { q: "Why refactor before tests, and tests before Docker?",
      choices: ["Alphabetical","Refactoring without tests is dangerous; tests without working code are theatre; Docker without tested code packages your bugs deterministically — the order minimises risk",
        "Tradition","Faster"],
      correct: 1, explain: "Refactor first because the messiest module is the one tests can't be written against until it's coherent. Tests next because they let you refactor more aggressively AND certify the working state before containerization. Docker last because it deterministically packages whatever code state you have — package buggy code, you ship buggy containers; package tested code, you ship a known-good artifact." },
    { q: "Why 5 tests, not 50?",
      choices: ["Lazy","Five tests covering the critical paths (the main inference function, the cleaning step, the metric calculation) catch 80% of regressions; 50 tests on the wrong things gives false confidence without the catch",
        "Time","Cost"],
      correct: 1, explain: "Test coverage is a vanity metric. What matters is whether your tests catch the bugs that would actually ship. 5 tests on the critical inference path, the metric computation, the cleaning logic, and the model loading is more valuable than 50 tests on getters/setters and trivial branches. Pick the 5 places where breakage would hurt most." },
    { q: "What does 'presentable, not beautiful' mean for the v0.3 milestone?",
      choices: ["Lower the bar","Beautiful takes weeks of polish; presentable means: working deploy, clean README, hero image, one stranger says 'I get it'. Ship that. Beautiful is the wrong target for a portfolio milestone",
        "Bug-tolerant","Skip steps"],
      correct: 1, explain: "Pixel-perfect design, custom animations, exhaustive docs — those are weeks of polish that don't change the recruiter's verdict. Working deploy + clean README + one hero image + one stranger confirming they understood is the bar. Ship at that level; beautiful is a different project." }
  ],
  days: [
    D(1,"Refactor the worst module","Pick the messiest. Make it coherent.",[
      L("The targeted refactor",
"## What it is\n" +
"Not a top-to-bottom rewrite — a targeted attack on the ONE module that's hardest to read. Every project has this module: the one you scroll past with a grimace. Today you fix it.\n\n" +
"## Identifying the worst module\n" +
"Three signals:\n" +
"- You've had to re-read it more than twice to remember what it does\n" +
"- You've made a 'small change' there that broke something far away\n" +
"- It has the most TODO / FIXME / 'this is ugly' comments\n" +
"\n" +
"Pick that one.\n\n" +
"## The refactor playbook\n" +
"```text\n" +
"1. RENAME variables and functions to say what they do.\n" +
"   `process_data` → `clean_and_winsorize_outliers`\n" +
"   `tmp` → `cleaned_df`\n" +
"\n" +
"2. EXTRACT functions: any block longer than ~20 lines becomes a function.\n" +
"   Inline comments that explain WHAT → function names. Comments that\n" +
"   explain WHY stay.\n" +
"\n" +
"3. REMOVE dead code: cells you ran once for debugging, commented-out\n" +
"   alternatives 'in case', unused imports. Delete them. Git remembers.\n" +
"\n" +
"4. TYPE-HINT public functions: `def predict(X: pd.DataFrame) -> np.ndarray`\n" +
"   Forces you to think about what goes in/out.\n" +
"\n" +
"5. DOCSTRING public functions: ONE line explaining the WHY. Not 'returns\n" +
"   the prediction' — 'compute calibrated probabilities, capping above\n" +
"   the 99th percentile to limit influence of training-set outliers'.\n" +
"```\n\n" +
"## Before / after example\n" +
"```python\n" +
"# BEFORE\n" +
"def process(d, t=0.5, x=None):\n" +
"    # do the thing\n" +
"    out = d.copy()\n" +
"    out = out[out['v'] > 0]\n" +
"    out['v'] = out['v'].clip(upper=out['v'].quantile(0.99))\n" +
"    if x:\n" +
"        out = out[out['cat'].isin(x)]\n" +
"    out['p'] = model.predict_proba(out[FEATS])[:, 1]\n" +
"    return out[out['p'] >= t]\n" +
"```\n\n" +
"```python\n" +
"# AFTER\n" +
"def score_and_filter_customers(\n" +
"    customers: pd.DataFrame,\n" +
"    score_threshold: float = 0.5,\n" +
"    categories: list[str] | None = None,\n" +
") -> pd.DataFrame:\n" +
"    \"\"\"Score customers, return those above threshold; optionally filter by category.\n\n" +
"    Winsorises `value` at the 99th percentile to limit outlier influence on the\n" +
"    learned ranking — the production score uses the same capping.\n" +
"    \"\"\"\n" +
"    eligible = customers[customers['value'] > 0].copy()\n" +
"    eligible['value'] = eligible['value'].clip(upper=eligible['value'].quantile(0.99))\n" +
"    if categories is not None:\n" +
"        eligible = eligible[eligible['category'].isin(categories)]\n" +
"    eligible['propensity'] = model.predict_proba(eligible[FEATURES])[:, 1]\n" +
"    return eligible[eligible['propensity'] >= score_threshold]\n" +
"```\n\n" +
"Same logic; readable by someone who's never seen the project.\n\n" +
"## What you DON'T do today\n" +
"- A second module (focus matters; pick the worst, fix it well)\n" +
"- Architecture rewrites (too risky without tests, which arrive tomorrow)\n" +
"- Performance optimisation (premature; not a v0.3 concern)\n\n" +
"## Commit at the end of the day\n" +
"```bash\n" +
"git add src/<module>.py\n" +
"git commit -m \"Refactor <module>: rename + extract + type-hint\"\n" +
"```\n\n" +
"Small, targeted commits. If something breaks after the refactor, the diff is small and easy to revert."
      ),
      S([
        { prompt: "Picking ONE messy module and fixing it well beats fixing five modules halfway.", answer: true, whenRight: "Right — focused fix completes; scattered fix half-completes everywhere. Pick the worst.", whenWrong: "Yes — focus. One clean module is auditable; five half-done are noise." },
        { prompt: "Comments that explain WHAT the code does should stay; comments that explain WHY should be removed.", answer: false, whenRight: "Right — REVERSED. WHAT-comments become function names. WHY-comments stay because the why isn't in the code.", whenWrong: "Opposite. WHAT goes into names; WHY stays as comments. The why is the context the code can't express." },
        { prompt: "Dead code (commented-out alternatives) should stay 'just in case'.", answer: false, whenRight: "Right — no. Git remembers. Dead code rots readability and lies about intent. Delete.", whenWrong: "Delete. Git history is the 'just in case'. Dead code in current files = noise + confusion." }
      ]),
      E("Your turn — refactor","[CODE] 1. Pick the ONE messiest module in `src/`.\n2. Apply the playbook: rename, extract, dead-code removal, type-hints, one-line docstrings.\n3. Run the pipeline (`make`); confirm metrics still match v0.2.\n4. Commit with a focused message.")
    ]),
    D(2,"Write 5 tests","pytest. Cover the critical paths.",[
      L("The 5-test discipline",
"## What it is\n" +
"Five `pytest` tests, each covering ONE critical path. After today, breaking any of these tests means a real regression — you'll catch it before deploying.\n\n" +
"## The five to write\n" +
"```text\n" +
"1. test_clean_drops_null_targets()\n" +
"   The cleaning step removes rows with null target.\n" +
"   Without this, training silently includes NaN targets.\n" +
"\n" +
"2. test_split_is_deterministic()\n" +
"   Two calls to the splitter with the same SEED give identical splits.\n" +
"   Without this, reproducibility is a lie.\n" +
"\n" +
"3. test_model_loads_and_predicts()\n" +
"   Load main.pkl. Pass a sample input. Get a prediction of the expected shape.\n" +
"   Without this, deploys can break silently when the model loads but inference fails.\n" +
"\n" +
"4. test_metric_calc_handles_empty()\n" +
"   The metric calculation doesn't crash on edge cases (empty subgroups,\n" +
"   single-class predictions). It returns NaN or 0, not an exception.\n" +
"   Without this, the eval pipeline crashes on real-world weirdness.\n" +
"\n" +
"5. test_inference_round_trip()\n" +
"   Take a known-good input from the test set, push it through the\n" +
"   loaded model, assert the prediction is within 0.001 of what it was\n" +
"   on the day of training.\n" +
"   Without this, model drift in pickle format goes unnoticed.\n" +
"```\n\n" +
"## The pytest pattern\n" +
"```python\n" +
"# tests/test_critical_paths.py\n" +
"import pytest, pickle, numpy as np, pandas as pd\n" +
"from src.clean import clean\n" +
"from src.train import build_split\n" +
"from src.evaluate import compute_metrics\n" +
"from src.config import SEED\n\n" +
"@pytest.fixture\n" +
"def model():\n" +
"    with open('models/main.pkl', 'rb') as f:\n" +
"        return pickle.load(f)\n\n" +
"@pytest.fixture\n" +
"def sample():\n" +
"    return pd.read_parquet('reports/predictions.parquet').head(10)\n\n" +
"def test_clean_drops_null_targets():\n" +
"    raw = pd.DataFrame({'feature_a': [1, 2, 3], 'target': [1, None, 0]})\n" +
"    cleaned = clean(raw)\n" +
"    assert cleaned['target'].notna().all()\n" +
"    assert len(cleaned) == 2\n\n" +
"def test_split_is_deterministic():\n" +
"    X = pd.DataFrame({'a': range(100)})\n" +
"    y = pd.Series([0, 1] * 50)\n" +
"    s1 = build_split(X, y, seed=SEED)\n" +
"    s2 = build_split(X, y, seed=SEED)\n" +
"    assert (s1[0].index == s2[0].index).all()\n" +
"    assert (s1[1].index == s2[1].index).all()\n\n" +
"def test_model_loads_and_predicts(model, sample):\n" +
"    preds = model.predict(sample.drop(columns=['index','y_true','y_pred','y_proba'], errors='ignore'))\n" +
"    assert preds.shape == (10,)\n" +
"    assert np.isin(preds, [0, 1]).all()\n\n" +
"def test_metric_calc_handles_empty():\n" +
"    out = compute_metrics(y_true=np.array([]), y_pred=np.array([]))\n" +
"    assert all(np.isnan(v) or v == 0 for v in out.values())\n\n" +
"def test_inference_round_trip(model, sample):\n" +
"    feats = sample.drop(columns=['index','y_true','y_pred','y_proba'], errors='ignore')\n" +
"    fresh = model.predict_proba(feats)[:, 1]\n" +
"    stored = sample['y_proba'].values\n" +
"    np.testing.assert_allclose(fresh, stored, atol=1e-6)\n" +
"```\n\n" +
"## Run them\n" +
"```bash\n" +
"pip install pytest\n" +
"pytest tests/ -v\n" +
"```\n\n" +
"All five should pass before you go to bed.\n\n" +
"## Add to CI later (W38 D3 onward — not required today)\n" +
"GitHub Actions can run pytest on every push. Worth setting up; not the focus today."
      ),
      V("pytest in 90 seconds","https://www.youtube.com/watch?v=cHYq1MRoyI0",2,"various","Watch first. pytest patterns: fixtures, parametrize, assertions. Refresher."),
      S([
        { prompt: "5 well-chosen tests catch more real regressions than 50 tests on trivial code.", answer: true, whenRight: "Right — coverage is a vanity metric. Test the critical paths; ignore getters/setters.", whenWrong: "Yes — quality > quantity. Five on critical paths beat fifty on noise." },
        { prompt: "A round-trip test (input → pickle → load → predict → compare) catches silent model loading bugs.", answer: true, whenRight: "Right — catches pickle/version mismatches that load successfully but predict differently. Real bug class.", whenWrong: "Yes — round-trip = real protection. Pickles can load without error but predict differently after library updates." },
        { prompt: "Tests for edge cases (empty inputs, single-class predictions) are overkill for a portfolio project.", answer: false, whenRight: "Right — no. Edge-case tests are exactly the ones that catch the bugs that ship to prod. Always include one.", whenWrong: "Edge cases are where bugs hide. One test per edge case = real safety net." }
      ]),
      E("Your turn — 5 tests","[CODE] 1. Create `tests/test_critical_paths.py`.\n2. Write 5 tests covering: cleaning, split determinism, model load+predict, metric edge case, inference round-trip.\n3. `pytest tests/ -v` — all pass.\n4. Commit.")
    ]),
    D(3,"Dockerize","One Dockerfile. Working build.",[
      L("Containers, the minimal viable",
"## What it is\n" +
"A `Dockerfile` that packages your model + inference code into a portable container. Anyone with Docker installed can run your model with one command, no Python setup, no dependency hell.\n\n" +
"## The minimal Dockerfile\n" +
"```dockerfile\n" +
"# Dockerfile\n" +
"FROM python:3.11-slim\n\n" +
"WORKDIR /app\n\n" +
"# Install system deps first (cached layer)\n" +
"RUN apt-get update && apt-get install -y --no-install-recommends \\\n" +
"    build-essential \\\n" +
" && rm -rf /var/lib/apt/lists/*\n\n" +
"# Install Python deps next (cached if requirements unchanged)\n" +
"COPY requirements.txt .\n" +
"RUN pip install --no-cache-dir -r requirements.txt\n\n" +
"# Copy code + model last (changes most often)\n" +
"COPY src/ ./src/\n" +
"COPY models/main.pkl ./models/main.pkl\n" +
"COPY app/ ./app/\n\n" +
"EXPOSE 8000\n\n" +
"CMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]\n" +
"```\n\n" +
"## Layer ordering = build speed\n" +
"Docker caches each layer; if a layer's inputs don't change, it doesn't rebuild. Put slowly-changing things (apt installs) first, fast-changing things (your code) last. Rebuilds become near-instant during iteration.\n\n" +
"## The .dockerignore\n" +
"```text\n" +
"# .dockerignore\n" +
".git\n" +
"__pycache__\n" +
"*.pyc\n" +
".pytest_cache\n" +
"notebooks/\n" +
"data/raw.parquet\n" +
"reports/\n" +
".venv/\n" +
".env\n" +
".DS_Store\n" +
"```\n\n" +
"Without this, `COPY .` pulls in your git history, notebooks, raw data, virtualenv. Image bloats from 200MB to 2GB. Always have a `.dockerignore`.\n\n" +
"## Build + run\n" +
"```bash\n" +
"docker build -t capstone:v0.3 .\n" +
"docker run -p 8000:8000 capstone:v0.3\n\n" +
"# In another terminal\n" +
"curl http://localhost:8000/predict -X POST -H 'Content-Type: application/json' \\\n" +
"     -d '{\"features\": {...}}'\n" +
"# {\"prediction\": 1, \"probability\": 0.83}\n" +
"```\n\n" +
"## The 'multi-stage' upgrade (optional)\n" +
"If your image is > 500MB, split into a build stage + runtime stage. Build heavy deps in the first; copy only what's needed into a slim runtime image.\n" +
"```dockerfile\n" +
"FROM python:3.11 AS builder\n" +
"COPY requirements.txt .\n" +
"RUN pip install --user --no-cache-dir -r requirements.txt\n\n" +
"FROM python:3.11-slim AS runtime\n" +
"COPY --from=builder /root/.local /root/.local\n" +
"ENV PATH=/root/.local/bin:$PATH\n" +
"COPY src/ ./src/\n" +
"COPY models/main.pkl ./models/main.pkl\n" +
"COPY app/ ./app/\n" +
"CMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]\n" +
"```\n\n" +
"Not required for v0.3 unless your image is huge.\n\n" +
"## What this gives the reviewer\n" +
"```bash\n" +
"docker pull yourname/capstone:v0.3\n" +
"docker run -p 8000:8000 yourname/capstone:v0.3\n" +
"# instant, no Python setup, no dependency hell\n" +
"```\n\n" +
"A working Docker image is the difference between 'try to run this on your machine' (recruiter gives up) and 'one docker command, working in 30 seconds' (recruiter is impressed)."
      ),
      V("Docker in 100 Seconds","https://www.youtube.com/watch?v=Gjnup-PuquQ",3,"Fireship","Watch first. Container concepts in 100s. Refresher if you've used Docker before."),
      S([
        { prompt: "Putting fast-changing layers (your code) LAST in the Dockerfile makes rebuilds faster.", answer: true, whenRight: "Right — Docker caches each layer. Code-only changes only invalidate the last layer; everything before stays cached.", whenWrong: "Yes — layer ordering matters. Slowly-changing first, fast-changing last. Cached rebuilds become instant." },
        { prompt: "A .dockerignore file is optional — `COPY . .` is fine.", answer: false, whenRight: "Right — no. Without .dockerignore, you copy git history, virtualenvs, raw data into the image. 200MB image becomes 2GB.", whenWrong: "Always have one. Image bloat without .dockerignore is dramatic and a real ops cost." },
        { prompt: "A working Docker image makes it trivially easy for a reviewer to run your model.", answer: true, whenRight: "Right — `docker pull && docker run` = 30 seconds, no Python setup. Massive UX win for reviewers.", whenWrong: "Yes — one command, working. Beats 'set up Python 3.11, install these 47 packages, hope nothing conflicts'." }
      ]),
      E("Your turn — Dockerize","[CODE] 1. Write `Dockerfile` + `.dockerignore`.\n2. Build: `docker build -t capstone:v0.3 .`.\n3. Run: `docker run -p 8000:8000 capstone:v0.3`.\n4. Hit it with curl; confirm response.\n5. Commit Dockerfile + .dockerignore.")
    ]),
    D(4,"Deploy","Public URL. Anyone can hit it.",[
      L("Deployment paths for a containerised inference service",
"## What it is\n" +
"Take the Docker image from yesterday and host it somewhere with a public URL. By end of day: anyone with the URL can POST a JSON request and get a prediction.\n\n" +
"## Three viable hosts (free tiers)\n\n" +
"### Hugging Face Spaces (recommended for ML)\n" +
"- Free, no card\n" +
"- Native model card + readme rendering\n" +
"- Works with FastAPI + Docker, or Gradio (if you also build a UI)\n" +
"- Push to HF Spaces repo → automatic build + deploy\n" +
"- URL: `huggingface.co/spaces/yourname/capstone-api`\n\n" +
"### Fly.io\n" +
"- Free tier covers small apps (256MB-1GB RAM)\n" +
"- Real Docker deploys, real custom domain support\n" +
"- ```bash\n" +
"  fly launch\n" +
"  fly deploy\n" +
"  ```\n" +
"- URL: `your-app.fly.dev` (or custom domain)\n\n" +
"### Railway / Render\n" +
"- Both have generous free tiers\n" +
"- 'Connect repo, deploy on push' UX\n" +
"- Slight tradeoffs around cold starts vs always-on\n\n" +
"## Avoid for v0.3\n" +
"- **AWS ECS / EKS / Lambda directly** — too much infra setup for the milestone. Save for later if you go MLOps-deep.\n" +
"- **GCP Cloud Run** — viable, more setup than Fly.io. Fine if you already use GCP.\n\n" +
"## The Fly.io path (concrete)\n" +
"```bash\n" +
"# Install flyctl\n" +
"curl -L https://fly.io/install.sh | sh\n\n" +
"# In your project root\n" +
"fly auth login\n" +
"fly launch          # generates fly.toml — point at your Dockerfile\n" +
"fly deploy\n\n" +
"# Your URL\n" +
"fly status\n" +
"# https://your-capstone.fly.dev\n" +
"```\n\n" +
"## Test the public URL in incognito\n" +
"```bash\n" +
"curl https://your-capstone.fly.dev/predict -X POST \\\n" +
"     -H 'Content-Type: application/json' \\\n" +
"     -d '{\"features\": {...}}'\n" +
"# {\"prediction\": 1, \"probability\": 0.83}\n" +
"```\n\n" +
"Test from a fresh device or incognito — confirm no cookie / auth assumptions.\n\n" +
"## Secrets, the safe way\n" +
"If your service needs API keys (OpenAI, AWS S3 to fetch model), use the host's secrets store:\n" +
"```bash\n" +
"# Fly.io\n" +
"fly secrets set OPENAI_API_KEY=sk-...\n" +
"```\n\n" +
"Never commit keys. Same rule as W26 day 1.\n\n" +
"## What goes in LINKS.md\n" +
"```markdown\n" +
"## Deployments\n" +
"- API: https://your-capstone.fly.dev/predict\n" +
"- Docker image: docker pull yourname/capstone:v0.3\n" +
"- Health: https://your-capstone.fly.dev/health\n" +
"- Docs: https://your-capstone.fly.dev/docs   (FastAPI auto-docs)\n" +
"```"
      ),
      S([
        { prompt: "Hugging Face Spaces is the easiest path for a portfolio ML service with a Docker backend.", answer: true, whenRight: "Right — free, ML-native, model card + UI render together. No card, no infra setup.", whenWrong: "Yes — HF Spaces. Free, ML-native, automatic docs + model card. Easiest path for a portfolio." },
        { prompt: "Testing the deployed URL in incognito is paranoid for a portfolio project.", answer: false, whenRight: "Right — no. Cookie / cache state hides bugs. Recruiters land cookie-clean; test that way.", whenWrong: "Always incognito-test. Cookies hide auth bugs, cache hides stale-asset bugs. Test as a stranger would." },
        { prompt: "Setting API keys via the host's secrets store (not committing to git) is the only safe pattern.", answer: true, whenRight: "Right — secrets store = encrypted, rotatable, never in git. Inline keys = repo-scrape disaster.", whenWrong: "Yes — secrets store always. Inline keys get scraped within minutes of being public." }
      ]),
      E("Your turn — deploy","[PRODUCE] 1. Pick a host (Fly.io / HF Spaces / Render).\n2. Deploy the Docker image.\n3. Get the public URL.\n4. Test in incognito with curl.\n5. Document in `LINKS.md`.\n6. Update README with deploy URL.")
    ]),
    D(5,"Portfolio README","The senior-DS framing.",[
      L("The README that earns interviews",
"## What it is\n" +
"The README is the first thing a recruiter / hiring manager sees when they open the GitHub repo. For v0.3, it goes from 'project README' to 'portfolio README' — written for the audience, not the author.\n\n" +
"## The structure\n" +
"```markdown\n" +
"# <Capstone name>\n" +
"\n" +
"<One sentence: what this is + the headline result.>\n" +
"e.g.: A propensity-to-purchase model trained on the H&M dataset. XGBoost +\n" +
"5-fold CV, AUC 0.871 vs 0.812 for a tuned linear baseline.\n" +
"\n" +
"![Hero image](docs/hero.png)\n" +
"\n" +
"**[Live demo](https://...)** · **[Blog post](https://...)** · **[Live API](https://...)** · **[Notebook walkthrough](notebooks/...)**\n" +
"\n" +
"---\n" +
"\n" +
"## What this project demonstrates\n" +
"- Reproducible pipeline (Makefile + pinned deps + global SEED)\n" +
"- 5-fold cross-validation with leakage-free Pipeline\n" +
"- Multi-metric evaluation + SHAP interpretability\n" +
"- Decision log (`DECISIONS.md`) with reasoning for every non-obvious choice\n" +
"- Dockerized inference service deployed to <host>\n" +
"- 5 critical-path pytest tests\n" +
"- Honest weaknesses named\n" +
"\n" +
"## Headline result\n" +
"<2-3 sentences. The number. The improvement over baseline. The honest weakness.>\n" +
"\n" +
"## How it works (in 1 paragraph)\n" +
"<The mental model a reviewer needs to understand the rest of the README.>\n" +
"\n" +
"## How to reproduce\n" +
"```bash\n" +
"git clone https://github.com/yourname/capstone\n" +
"cd capstone\n" +
"pip install -r requirements.txt\n" +
"make all          # full pipeline; ~5 minutes\n" +
"```\n" +
"\n" +
"## How to run the API\n" +
"```bash\n" +
"docker pull yourname/capstone:v0.3\n" +
"docker run -p 8000:8000 yourname/capstone:v0.3\n" +
"curl localhost:8000/predict -X POST -d '{\"features\": {...}}'\n" +
"```\n" +
"\n" +
"## Honest limitations\n" +
"- <Specific weakness 1>\n" +
"- <Specific weakness 2>\n" +
"- <Specific weakness 3>\n" +
"\n" +
"## What I'd do with another month\n" +
"- <Concrete next step 1>\n" +
"- <Concrete next step 2>\n" +
"\n" +
"## Tech\n" +
"Python · pandas · scikit-learn · XGBoost · SHAP · FastAPI · Docker · pytest · Make · <host>\n" +
"\n" +
"## Repo map\n" +
"```\n" +
"src/             pipeline scripts\n" +
"tests/           pytest critical paths\n" +
"notebooks/       exploratory analyses\n" +
"reports/         metrics + plots\n" +
"models/          trained artefacts (LFS)\n" +
"DECISIONS.md     non-obvious choices + reasoning\n" +
"BASELINE.md      baseline rigour notes\n" +
"```\n" +
"```\n\n" +
"## What separates this from a junior README\n" +
"- The HEADLINE result above the fold\n" +
"- Four clickable links (demo / blog / API / notebook)\n" +
"- A 'What this demonstrates' list that names the rigor\n" +
"- An honest limitations section\n" +
"- A repo map so a stranger can navigate in 20 seconds\n\n" +
"## What to leave OUT\n" +
"- Long bios about yourself\n" +
"- 'Special thanks to my professor for inspiration'\n" +
"- 100-line code snippets in the README itself (link to the file)\n" +
"- Unverified buzzword chains ('cutting-edge', 'state-of-the-art')"
      ),
      S([
        { prompt: "Putting the four links (demo / blog / API / notebook) BELOW the hook is more effective than burying them in a docs folder.", answer: true, whenRight: "Right — above-the-fold = clickable in 5 seconds. Buried links = not clicked.", whenWrong: "Yes — surface clickable links. Recruiters click; they don't dig." },
        { prompt: "The 'Honest limitations' section makes the project look weaker, so it should be hidden in a separate file.", answer: false, whenRight: "Right — no. Named limitations build credibility. Hidden ones get found and destroy it.", whenWrong: "Honesty in the README. Hidden = looks like a hide. Stated = looks like a senior thought about it." },
        { prompt: "A repo map (top-level directory listing) helps strangers navigate the project in seconds.", answer: true, whenRight: "Right — 20-second navigation. Strangers without a map dig randomly and bounce.", whenWrong: "Yes — map = orientation. Without it, the repo is a maze; with it, the structure is obvious." }
      ]),
      E("Your turn — README","[WRITE] 1. Rewrite the README using the template.\n2. Headline result above the fold.\n3. Four clickable links (demo will be tomorrow's screenshots; API + blog + notebook today).\n4. Honest limitations section with 3 specific items.\n5. Repo map.\n6. Commit.")
    ]),
    D(6,"Demo screenshots","Hero image + 3 detail shots.",[
      L("The screenshots that get clicked",
"## What it is\n" +
"Four images that go in the README. Their job: communicate what the project does in 5 seconds — before anyone reads.\n\n" +
"## The four shots\n" +
"```text\n" +
"1. HERO (docs/hero.png)\n" +
"   - The 'money shot'. Usually the live demo with a clear, compelling state.\n" +
"   - Top of the README, full-width.\n" +
"\n" +
"2. RESULTS CHART (docs/results.png)\n" +
"   - The single chart that summarizes the win. Baseline vs main model.\n" +
"   - Used inline in the results section.\n" +
"\n" +
"3. INTERPRETABILITY (docs/shap.png)\n" +
"   - SHAP summary or feature-importance plot. The 'how does it work' image.\n" +
"   - Used in the 'How it works' section.\n" +
"\n" +
"4. ARCHITECTURE / FLOW (docs/architecture.png)\n" +
"   - Optional but valuable: a simple diagram of data → preprocess → model →\n" +
"     API. Draw in Excalidraw (excalidraw.com), export PNG.\n" +
"   - Used near the top, after the hero.\n" +
"```\n\n" +
"## Tools\n" +
"- **Screenshots**: macOS Cmd+Shift+4 / Windows Snipping Tool / ShareX\n" +
"- **Annotations** (arrows, callouts): Skitch, Annotate, or the built-in macOS Markup\n" +
"- **Architecture diagrams**: Excalidraw (free, hand-drawn aesthetic that works) or draw.io\n" +
"- **Chart polish**: Matplotlib with `plt.tight_layout()` and `dpi=150`\n\n" +
"## Image quality rules\n" +
"- **Resolution**: 1200-2000px wide for hero, 800-1200px for detail shots. Don't ship tiny screenshots.\n" +
"- **File size**: under 500KB each. Use PNG for screenshots, JPEG for photos. Run through tinypng.com if heavy.\n" +
"- **Crop ruthlessly**: no browser chrome, no OS-level UI, just the content.\n" +
"- **Light mode**: dark-mode screenshots look great to you, mediocre to recruiters. Default is light mode for portfolio.\n\n" +
"## Markdown to embed\n" +
"```markdown\n" +
"![Hero](docs/hero.png)\n" +
"\n" +
"<!-- For the architecture diagram with a caption -->\n" +
"<p align=\"center\">\n" +
"  <img src=\"docs/architecture.png\" alt=\"Pipeline architecture\" width=\"720\">\n" +
"  <br>\n" +
"  <em>From raw data to served predictions.</em>\n" +
"</p>\n" +
"```\n\n" +
"## Why this matters more than you think\n" +
"Most portfolio READMEs are walls of text with one screenshot somewhere. A README with FOUR carefully chosen images puts you in a different tier visually. Recruiters scroll past walls of text; they LOOK at images."
      ),
      S([
        { prompt: "Four carefully chosen screenshots are more effective than 12 random ones.", answer: true, whenRight: "Right — four images that each carry meaning > a museum of screenshots. Pick the four that tell the story.", whenWrong: "Yes — curation. Four pieces of meaning > twelve pieces of noise." },
        { prompt: "Tiny screenshots (300px wide) are fine — recruiters can zoom in.", answer: false, whenRight: "Right — no. Recruiters don't zoom; they scroll. Tiny = invisible. Use 1200-2000px for the hero.", whenWrong: "Recruiters don't zoom. Tiny screenshots get skipped. 1200-2000px hero; 800-1200px for details." },
        { prompt: "A simple architecture diagram (data → preprocess → model → API) helps reviewers understand the system in seconds.", answer: true, whenRight: "Right — diagrams compress 200 words into one image. Strong leverage for the README.", whenWrong: "Yes — visualizing the pipeline replaces a paragraph of explanation. Excalidraw makes it trivial." }
      ]),
      E("Your turn — screenshots","[PRODUCE] 1. Capture hero (live demo or main chart) — `docs/hero.png`.\n2. Capture results chart — `docs/results.png`.\n3. Capture SHAP or feature-importance — `docs/shap.png`.\n4. Draw architecture in Excalidraw — `docs/architecture.png`.\n5. Embed in README.\n6. Test the README on GitHub (incognito) — images render at the right size.\n7. Commit.")
    ]),
    D(7,"First reader + tag v0.3","Get one stranger to click and comment. Tag.",[
      L("The one-reader test",
"## What it is\n" +
"You've polished. You've deployed. You've written the README. Today: get ONE stranger to look at it, then act on their feedback.\n\n" +
"## Why one (and why not five)\n" +
"- One reader catches the BIG issues: confusing structure, missing CTAs, broken links\n" +
"- Five readers come in W39 (the bigger validation pass before v1.0)\n" +
"- Today's one reader is a SANITY check before the v1.0 validation. Quick + cheap.\n\n" +
"## Who to ask\n" +
"- Someone NOT a data scientist (catches jargon)\n" +
"- Someone you haven't already asked about this project (fresh eyes)\n" +
"- Someone who'll be honest with you\n\n" +
"## How to ask\n" +
"```text\n" +
"Subject: 90 seconds — can you tell what this project does?\n" +
"Body:\n" +
"  Looking at this README: https://github.com/yourname/capstone\n" +
"  Two questions:\n" +
"  1. Can you tell what the project does within 30 seconds of opening it?\n" +
"  2. What is the FIRST thing that's unclear?\n" +
"  No need to read past the first 'unclear' moment.\n" +
"  Thanks!\n" +
"```\n\n" +
"## What to fix based on their answer\n" +
"```text\n" +
"'Yes, I get it in 30s' + 'Nothing was unclear'\n" +
"  → You're done. Tag v0.3.\n" +
"\n" +
"'Not really' + 'I couldn't tell what the model predicts'\n" +
"  → Rewrite your hook. Specific result up top.\n" +
"\n" +
"'Yes' + 'I clicked the demo link, it 404'd'\n" +
"  → Broken link. Fix before tagging.\n" +
"\n" +
"'Yes' + 'I got lost in the metrics table'\n" +
"  → Move the table to a section further down; lead with the headline result.\n" +
"```\n\n" +
"## Apply + tag\n" +
"Fix whatever the one reader surfaced, then:\n" +
"```bash\n" +
"git add .\n" +
"git commit -m \"v0.3: polished, deployed, reviewed\"\n" +
"git tag capstone-v0.3-extended\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## What v0.3 (extended) is, versus the original W38\n" +
"- Original W38 ('Polish + deploy') — refactor + tests + Docker + deploy\n" +
"- W37→W38 of the extended capstone — adds: deploy on top of v0.2's reproducible pipeline + multi-metric eval + DECISIONS log + SHAP interpretability + portfolio README with four screenshots\n\n" +
"The same project, two iterations deeper than W30. v1.0 next week is story + readers + interview-ready ship.\n\n" +
"## What you've done in two weeks\n" +
"Returned to a shipped project and added: reproducibility, rigour, refactor, tests, container, deploy, polish. That's the iteration cycle every senior DS runs. You've now done it twice on the same project — once in W28-W30 and once in W37-W38. That's portfolio gold."
      ),
      S([
        { prompt: "One reader is enough for v0.3 because the bigger validation pass comes in W39.", answer: true, whenRight: "Right — one reader catches the structural issues; five readers come for the v1.0 pass. Right cadence.", whenWrong: "Yes — one for v0.3 sanity, five for v1.0 polish. Don't burn the reader pool too early." },
        { prompt: "If the reader says 'I couldn't tell what the model predicts', the fix is to write a longer About section.", answer: false, whenRight: "Right — no. The fix is a sharper HOOK at the top. Long About sections don't fix unclear hooks; they bury them.", whenWrong: "Sharpen the hook, not the About. Long About sections don't fix unclear leads; they hide them." },
        { prompt: "Returning to a shipped project for two rounds of iteration is a stronger portfolio signal than three separate one-shot projects.", answer: true, whenRight: "Right — depth beats breadth. Iteration shows the loop real teams run; one-shots show curiosity.", whenWrong: "Yes — iteration = senior signal. Real ML teams iterate; portfolios that show iteration look like real work." }
      ]),
      E("Your turn — first reader + tag","[PRODUCE] 1. Send the README to ONE person.\n2. Wait for response.\n3. Fix whatever was unclear.\n4. Commit + tag:\n`git add . && git commit -m 'v0.3 extended: polished + deployed + reviewed'`\n`git tag capstone-v0.3-extended && git push --tags`\n\nPASS:\n[x] Refactored worst module\n[x] 5 pytest tests, all passing\n[x] Dockerfile + .dockerignore\n[x] Deployed to public URL\n[x] Portfolio-grade README with 4 screenshots\n[x] One reader's feedback applied\n[x] capstone-v0.3-extended tag pushed")
    ])
  ]
};

/* ════ WEEK 39 — Capstone v1.0: Ship + interview-ready story ════ */
const W39 = {
  number: 39, title: "Capstone v1.0 - Ship + interview-ready story",
  phase: "Capstone Extended", commitment_hours: "10-15",
  context: ds.weeks[38].context,
  concept_check: [
    { q: "Why is the STORY the conversion lever from 'good project' to 'job offer'?",
      choices: ["Marketing","The interviewer reads/clicks the project for ~3 minutes; the story you tell about it during interviews is what they remember. Same project + worse story = same offer rate as no project",
        "Pure theory","Personality"],
      correct: 1, explain: "Recruiters see ~30 portfolios per role. The 3-minute scan tells them whether to interview you. The 30-minute interview is where the offer is decided — and that's the story you tell, not the code. A polished project with a fumbled 'tell me about it' loses to a rougher project with a sharp 90-second pitch." },
    { q: "Why three pitch versions (90 seconds / 5 minutes / 30 minutes)?",
      choices: ["Random","Different situations need different lengths: 90s for elevator / phone screen / Slack DM; 5min for the standard 'walk me through' interview question; 30min for the deep technical dive — same content, different compression",
        "Tradition","Pretty number"],
      correct: 1, explain: "Each format serves a real moment. 90 seconds is the elevator pitch and the LinkedIn message hook. 5 minutes is the 'walk me through your favorite project' interview question — the most-asked question across ALL DS interviews. 30 minutes is the technical deep dive where senior interviewers test your judgment. Prepare all three; you'll use all three." },
    { q: "Why ANTICIPATE hard questions before the interview?",
      choices: ["Cheating","Predictable questions ('why didn't you try X?', 'how would this fail in production?', 'what's the weakness?') become smooth answers if you rehearsed; they become panicked rambles if you didn't",
        "Pre-baked","Required"],
      correct: 1, explain: "Senior interviewers ALWAYS ask: why didn't you try alternative X, what's the limitation, how would this fail at 10× scale, what would you do differently. These are the same questions in every interview. Listing them, writing 60-second answers, and reading them out loud once gets you 80% of the way to a confident interview." }
  ],
  days: [
    D(1,"Script the demo","3 minutes. Single take.",[
      L("The demo script — 3 minutes that earn callbacks",
"## What it is\n" +
"A 3-minute screen recording of you walking through the project. Tomorrow you record it. Today you SCRIPT it — word by word.\n\n" +
"## Why script (vs improvise)\n" +
"- Improvised demos meander. 3 minutes becomes 7 minutes.\n" +
"- Scripted demos hit the same beats every take.\n" +
"- You stop saying 'um', 'so', 'basically'.\n" +
"- You give yourself a chance to cut what's boring BEFORE recording.\n\n" +
"## The structure\n" +
"```text\n" +
"[0:00 - 0:20]  Hook + problem\n" +
"   'This is <project>. It predicts <thing> for <who> from <data>.\n" +
"    The baseline gets <X>; my model gets <Y> — that's the headline.\n" +
"    Here's how, in three minutes.'\n" +
"\n" +
"[0:20 - 0:50]  Show the live demo\n" +
"   Open the deployed URL. Show one interaction.\n" +
"   Speak to the result. 'You can see the model predicts <Z>; the\n" +
"    interpretability panel shows it's relying on <feature> because <reason>.'\n" +
"\n" +
"[0:50 - 1:30]  The data + the baseline\n" +
"   Switch to the README or notebook.\n" +
"   'The dataset is <X> rows of <thing>. The simplest defensible\n" +
"    baseline is <Y>, which gets <metric>. That's the bar to beat.'\n" +
"\n" +
"[1:30 - 2:15]  The model + the result\n" +
"   'I tried <approach 1> and <approach 2>; <approach 1> won because <X>.\n" +
"    The improvement over baseline is <Z>% — and here's why that's\n" +
"    meaningful in context: <one sentence>.'\n" +
"\n" +
"[2:15 - 2:45]  Honest weakness\n" +
"   'The model still fails on <specific subgroup or input>. That's\n" +
"    documented in BIAS.md / DECISIONS.md / LIMITATIONS.md.'\n" +
"\n" +
"[2:45 - 3:00]  Close + call to action\n" +
"   'Code is at <repo>. Live API at <url>. Happy to dive deeper.\n" +
"    Thanks for watching.'\n" +
"```\n\n" +
"## Writing tips\n" +
"- **Short sentences.** Long sentences trip you up out loud.\n" +
"- **One number per sentence.** Two numbers per sentence loses the listener.\n" +
"- **Say the JUDGMENT, not just the metric.** 'AUC 0.871, which beats the linear baseline by 6 points — that gap is large enough to be meaningful for the use case.'\n" +
"- **No buzzwords.** 'leveraged cutting-edge state-of-the-art' adds zero. Cut.\n\n" +
"## Print the script + tape it to your monitor\n" +
"Tomorrow you'll read it during recording. Print = no scrolling, no tab-switching, no missed beats."
      ),
      S([
        { prompt: "Scripting a 3-minute demo before recording produces tighter takes than improvising.", answer: true, whenRight: "Right — scripts hit consistent beats. Improvisation drifts to 7 minutes and three filler words per sentence.", whenWrong: "Yes — script first. Improvised demos meander; scripted demos land." },
        { prompt: "Including the honest weakness in the demo makes you look weaker.", answer: false, whenRight: "Right — no. Senior interviewers respect honest weakness. Hiding them reads as overclaiming.", whenWrong: "Honest weakness = credibility. Hiding = caught + dismissed. Always include the limitation." },
        { prompt: "A demo over 3 minutes risks losing the viewer.", answer: true, whenRight: "Right — recruiters skim. 3 minutes is the sweet spot for portfolio walkthrough; 7 minutes loses 70% of viewers.", whenWrong: "Yes — 3 min is the bar. Each extra minute halves retention." }
      ]),
      E("Your turn — script","[WRITE] 1. Open `docs/demo_script.md`.\n2. Write word-by-word, 3 minutes, following the structure.\n3. Read aloud, time it. Edit for tightness.\n4. Print + put it next to your computer for tomorrow.")
    ]),
    D(2,"Record the demo","Loom or OBS. Single take.",[
      L("Recording the demo",
"## What it is\n" +
"One screen recording. ~3 minutes. The script from yesterday, read with conviction. Posted unlisted on YouTube. Linked from the README + the dev.to post + your LinkedIn.\n\n" +
"## Tools\n" +
"- **Loom** (free tier, 5-min cap — perfect for you). Auto-uploads, gives a URL instantly.\n" +
"- **OBS Studio** (free, unlimited). Slightly more setup; full control.\n" +
"- **macOS QuickTime / Windows Game Bar** (built-in). Local file; upload manually.\n\n" +
"## The two-take rule\n" +
"- Take 1: stumble through, identify the worst 2-3 moments.\n" +
"- Take 2: read the script with the fixes. Done.\n" +
"\n" +
"More than two takes means the script needs editing, not the delivery. Cut.\n\n" +
"## Setup tips\n" +
"- **Close every irrelevant tab.** Notifications, chat windows, mail. They will pop up at the worst moment.\n" +
"- **One screen.** If you have two monitors, share only one.\n" +
"- **Browser at zoom 110-125%.** Easier to read in playback; looks intentional.\n" +
"- **Sound check.** 30 seconds of recording, played back. Is it clear? If not, fix mic before take 1.\n" +
"\n" +
"## What NOT to do\n" +
"- Don't say 'um, let me just find the right tab' — that's a sign the demo isn't prepared.\n" +
"- Don't apologise for anything ('sorry, this is rough'). Confidence sells, not modesty.\n" +
"- Don't do a 'thanks for watching, please subscribe' YouTube-style outro. Professional close: 'Code's at <link>. Happy to dive deeper.'\n\n" +
"## Upload + link\n" +
"```text\n" +
"YouTube: Unlisted (not Public; not Private)\n" +
"  → Anyone with the link can watch; doesn't compete with public videos in search\n" +
"\n" +
"Title:   '<Project name> — 3-minute walkthrough'\n" +
"Description:\n" +
"  - One sentence about the project\n" +
"  - Link to GitHub repo\n" +
"  - Link to live demo\n" +
"  - Link to blog post\n" +
"```\n\n" +
"## Embed everywhere\n" +
"```markdown\n" +
"<!-- README.md -->\n" +
"## Demo (3 min)\n" +
"[![Demo video](docs/hero.png)](https://youtube.com/watch?v=...)\n" +
"```\n\n" +
"The hero image becomes a clickable video link. YouTube's auto-thumbnail is usually mediocre; a custom thumbnail (your hero.png) makes the link feel intentional."
      ),
      S([
        { prompt: "Loom (5-min free tier) is enough for a 3-minute portfolio demo.", answer: true, whenRight: "Right — perfectly sized. Auto-upload, instant URL, free.", whenWrong: "Yes — Loom is the easy path. 5 minutes covers a 3-min demo with buffer." },
        { prompt: "Apologising at the start of the video ('sorry this is rough') is endearing and humble.", answer: false, whenRight: "Right — no. Confidence sells. Apologies signal the work isn't ready; cut them.", whenWrong: "Apologies undermine you. Confident close: 'happy to dive deeper'. Modesty isn't the move." },
        { prompt: "Unlisted YouTube is the right privacy setting for a portfolio video.", answer: true, whenRight: "Right — anyone with the link can watch; doesn't compete in public search.", whenWrong: "Yes — unlisted. Public competes against millions; private blocks recruiters. Unlisted is the goldilocks." }
      ]),
      E("Your turn — record","[PRODUCE] 1. Set up: close tabs, single screen, browser zoom up.\n2. Sound check + record take 1.\n3. Identify 2-3 fixes.\n4. Re-record take 2.\n5. Upload YouTube unlisted.\n6. Embed in README using a clickable thumbnail.")
    ]),
    D(3,"Write 3 pitch variants","90s / 5min / 30min. Print all three.",[
      L("Three pitches, three moments",
"## What they're for\n" +
"```text\n" +
"90 SECONDS — elevator pitch\n" +
"  Used in: LinkedIn cold outreach, networking conversations, phone screens,\n" +
"           Slack DMs, 'so what do you do' moments.\n" +
"  Goal: get them to ask one follow-up question.\n" +
"\n" +
"5 MINUTES — the 'walk me through your favorite project' interview answer\n" +
"  Used in: 80% of DS interviews. Most-asked behavioural question.\n" +
"  Goal: hit problem → approach → result → reflection in a tight arc.\n" +
"\n" +
"30 MINUTES — the technical deep-dive\n" +
"  Used in: senior-DS technical interviews, 'whiteboard your project' sessions.\n" +
"  Goal: demonstrate judgment at every decision; field hard questions.\n" +
"```\n\n" +
"## The 90-second pitch\n" +
"```text\n" +
"[0:00 - 0:15]  Problem\n" +
"  'I built a model that predicts <X> from <data>. The use case is <Y>.'\n" +
"\n" +
"[0:15 - 0:45]  Approach + result\n" +
"  'I tried <baseline> and <main model>; <main model> won at <metric> —\n" +
"   <improvement>% over baseline.'\n" +
"\n" +
"[0:45 - 1:15]  What's non-obvious about it\n" +
"  'The non-obvious thing was <one specific insight from the work>.'\n" +
"\n" +
"[1:15 - 1:30]  Honest weakness + close\n" +
"  'It still fails on <case>. Happy to walk you through it.'\n" +
"```\n\n" +
"## The 5-minute pitch (interview version)\n" +
"```text\n" +
"[0:00 - 0:30]  Context\n" +
"  - What the project is\n" +
"  - Why YOU chose it (intrinsic interest beats 'recruiter-bait')\n" +
"\n" +
"[0:30 - 1:30]  The problem\n" +
"  - Specific question\n" +
"  - Data: source, size, what makes it hard\n" +
"  - Success criterion: what 'good' meant\n" +
"\n" +
"[1:30 - 3:00]  The approach\n" +
"  - Baseline (one sentence on what + how it did)\n" +
"  - Main model (one sentence on what + why this choice)\n" +
"  - Key decision: ONE concrete trade-off you made\n" +
"\n" +
"[3:00 - 4:00]  The result\n" +
"  - Headline number + context\n" +
"  - One thing that surprised you\n" +
"  - One thing that didn't work and what you'd try next\n" +
"\n" +
"[4:00 - 5:00]  What you learned + what's next\n" +
"  - One technical lesson\n" +
"  - One process lesson\n" +
"  - 'If I had another month, I'd <X>.'\n" +
"```\n\n" +
"## The 30-minute deep dive\n" +
"Same structure as the 5-min, but EACH section gets ~5 minutes. Differences:\n" +
"- You show the actual code / notebooks\n" +
"- You walk through ONE specific tradeoff in depth (model choice, feature engineering, evaluation strategy)\n" +
"- You spend ~5 minutes on questions you anticipate they'll ask\n" +
"\n" +
"You won't memorise the 30-min version; you'll work from notes. Don't try to script it word-for-word.\n\n" +
"## Print all three\n" +
"Put them in `docs/pitches.md` with markdown headers. Print and tape inside a notebook you carry to interviews.\n\n" +
"## Why doing all three TODAY matters\n" +
"You'll use the 90s in the next LinkedIn DM. The 5-min in the next phone screen. The 30-min in the next technical interview. Writing them today means you reach for them tomorrow without scrambling."
      ),
      S([
        { prompt: "The 90-second pitch is for elevator / DM / phone-screen moments where the goal is a follow-up question.", answer: true, whenRight: "Right — 90s opens doors; 5 min walks through them; 30 min seals deals.", whenWrong: "Yes — 90s = invite further conversation. Don't try to close in 90s; just earn the follow-up." },
        { prompt: "The 5-minute pitch should be improvised in the moment to sound natural.", answer: false, whenRight: "Right — no. The 'walk me through your favorite project' question is asked in 80% of DS interviews. Have a rehearsed answer.", whenWrong: "Always prepared. The most-asked DS interview question deserves a rehearsed answer, not an improvised one." },
        { prompt: "Including ONE thing that didn't work in the pitch is more impressive than presenting everything as a win.", answer: true, whenRight: "Right — 'what didn't work' shows judgment + iteration. 'Everything worked' reads as polished marketing.", whenWrong: "Yes — failure + reflection = senior signal. All-wins pitches sound like sales decks; they don't read as real work." }
      ]),
      E("Your turn — three pitches","[WRITE] 1. Open `docs/pitches.md`.\n2. Write the 90s, the 5-min, the 30-min outline.\n3. Read each aloud, time it. Trim what doesn't fit.\n4. Print all three.")
    ]),
    D(4,"Get 3 readers","Real eyeballs on the v1.0 polish.",[
      L("Three readers — the v1.0 validation pass",
"## What it is\n" +
"Send the README + the 3-minute video to THREE people. Different from the W38 one-reader sanity check: this is the validation pass for v1.0.\n\n" +
"## Why three (not five — you're saving five for the dev.to post in W39 D5)\n" +
"- Three readers catches the medium-priority issues (clarity, flow, missing context)\n" +
"- Saves the bigger audience for the post itself, which gets more reach\n" +
"- Three is enough to catch convergence (the issue 2/3 mention is real)\n\n" +
"## Who to ask\n" +
"```text\n" +
"Reader 1: A friend who's a HIRING MANAGER (any field)\n" +
"  Catches: 'would I interview this person?' signal\n" +
"\n" +
"Reader 2: A friend who's a DATA SCIENTIST\n" +
"  Catches: technical credibility, suspect claims, jargon misuse\n" +
"\n" +
"Reader 3: A friend who's NEITHER\n" +
"  Catches: jargon, confusing structure, what's unclear at first read\n" +
"```\n\n" +
"If you don't have all three groups in your network, do your best. Even three of the same type is informative.\n\n" +
"## The ask\n" +
"```text\n" +
"Subject: 5 minutes — interview-prep feedback\n" +
"Body:\n" +
"  I'm sharpening my portfolio piece before applying.\n" +
"  Could you spend 5 minutes on:\n" +
"  1. README:  https://github.com/yourname/capstone\n" +
"  2. Video:   https://youtube.com/watch?v=...\n" +
"\n" +
"  Three questions:\n" +
"  - Within 30 seconds, what did you understand the project does?\n" +
"  - What's the FIRST thing that confused you?\n" +
"  - If you were a hiring manager, would you give the candidate an interview?\n" +
"     (Honest 'maybe' or 'no' is more useful than polite yes.)\n" +
"\n" +
"  Thanks! No need to respond formally — bullet points are perfect.\n" +
"```\n\n" +
"## What to do with the responses\n" +
"```text\n" +
"PATTERN 1: All three got lost at the same paragraph\n" +
"  → That paragraph gets rewritten tomorrow. Top priority.\n" +
"\n" +
"PATTERN 2: All three said 'yes I'd interview'\n" +
"  → You're in good shape; minor edits only.\n" +
"\n" +
"PATTERN 3: 2/3 confused; 1/3 fine\n" +
"  → The 2/3 issue gets fixed; the 1/3 outlier is noise.\n" +
"\n" +
"PATTERN 4: All polite, no real critique\n" +
"  → Ask one of them: 'be brutal — what would actually make this stronger?'\n" +
"    People often hold the real feedback back.\n" +
"```\n\n" +
"## The discipline\n" +
"Don't defend. If 2/3 readers say something is unclear, it IS unclear. Edit the README; don't explain back."
      ),
      S([
        { prompt: "If 2/3 readers say the same paragraph is confusing, the right move is to edit the paragraph (not defend it).", answer: true, whenRight: "Right — convergence is signal. The paragraph is the bug; the readers are the bug report.", whenWrong: "Yes — convergence = real issue. Edit, don't explain. The next 100 readers will hit the same wall." },
        { prompt: "Asking 'would you interview this candidate?' is more useful than 'is this good?'.", answer: true, whenRight: "Right — concrete question, concrete answer. 'Good?' invites politeness; 'would you interview?' forces honest signal.", whenWrong: "Yes — specific question = specific answer. Vague questions get vague answers; 'would you interview' is testable." },
        { prompt: "If all three readers are polite and have no critique, your project is definitely ready.", answer: false, whenRight: "Right — no. Polite without critique often means they held back. Ask one to be brutal; you'll usually get real feedback then.", whenWrong: "Polite ≠ ready. Ask one for brutal feedback; that's where the real issues surface." }
      ]),
      E("Your turn — three readers","[WRITE] 1. Identify three readers (HM, DS, non-DS).\n2. Send the email above.\n3. Log responses in `docs/readers.md`.\n4. Identify the convergence point (or note 'three different things' if no convergence).")
    ]),
    D(5,"Apply feedback","The most-common critique gets a fix.",[
      L("Acting on the convergence",
"## What it is\n" +
"Yesterday you collected feedback. Today you act on the ONE thing that converged across readers + post the result.\n\n" +
"## The fix workflow\n" +
"```text\n" +
"1. Pick the SINGLE most-converged critique\n" +
"   - If 2/3 readers mentioned it, it's worth a full revision\n" +
"   - If all 3 agreed, it's the priority fix\n" +
"\n" +
"2. WRITE the fix in markdown (or code) FIRST\n" +
"   - Don't ship a half-edit. Write the new section in full.\n" +
"\n" +
"3. RE-READ the surrounding sections\n" +
"   - One fix can leave the rest of the README dis-coordinated.\n" +
"   - Smooth the transitions.\n" +
"\n" +
"4. RUN the pipeline (make) one more time\n" +
"   - Confirm nothing in the README change accidentally broke the build.\n" +
"\n" +
"5. COMMIT with the reader's feedback in the message\n" +
"   - 'README: rewrite hook (2/3 readers found it unclear)'\n" +
"```\n\n" +
"## When the critique is about the VIDEO\n" +
"- 'the demo is too fast' → re-record at 75% of your current pace\n" +
"- 'the demo doesn't show the result' → start with the result, walk back to how\n" +
"- 'the demo is boring' → cut the parts that ARE boring; you found them\n\n" +
"## When the critique is about something STRUCTURAL\n" +
"```text\n" +
"Critique: 'I can't tell what this project IS'\n" +
"Fix: Rewrite the hook line. Hard, specific, with the headline number.\n" +
"\n" +
"Critique: 'The metrics section is confusing'\n" +
"Fix: Move it later in the README; lead with the headline result instead.\n" +
"\n" +
"Critique: 'I don't trust the result; it seems too good'\n" +
"Fix: Add a 'why this is meaningful' paragraph that contextualises the metric.\n" +
"\n" +
"Critique: 'The repo is a mess'\n" +
"Fix: Add the repo map (W38 D5) if you skipped it.\n" +
"```\n\n" +
"## When the critique is something you DISAGREE with\n" +
"Two questions:\n" +
"1. Will the next 100 readers also disagree with me? If yes — fix anyway.\n" +
"2. Is this one reader an edge case? Check with reader #4 (a fresh one). Don't argue with reader #1.\n\n" +
"## When you've made the fix\n" +
"Re-send to whichever reader gave the critique. 'I edited the hook based on your feedback — is it clearer now?' Closing the loop is a quiet professional habit; it also generates a network you can lean on for future projects."
      ),
      S([
        { prompt: "If 2/3 readers found the same thing confusing, the right response is to rewrite that section.", answer: true, whenRight: "Right — convergence is the bug report. Rewrite, don't defend.", whenWrong: "Yes — convergence = fix. The reader saying it is right; the writer saying 'but I meant' is wrong." },
        { prompt: "Closing the loop with the reader (sending the revised version) is unnecessary professional theatre.", answer: false, whenRight: "Right — no. Closing the loop builds the network you'll lean on next time. Cheap and high-leverage.", whenWrong: "Closing the loop = real relationship. The next time you need feedback, this reader engages faster." },
        { prompt: "If you disagree with a reader's critique, you should ignore it.", answer: false, whenRight: "Right — no. Test with another fresh reader. If they agree, fix anyway. One reader's disagreement is not enough to dismiss.", whenWrong: "One reader = sample of 1. Test with reader #4 before dismissing. If two now disagree with you, fix." }
      ]),
      E("Your turn — fix","[WRITE] 1. Pick the convergence-critique from yesterday.\n2. Rewrite that section IN FULL.\n3. Re-read surroundings for coherence.\n4. Run `make` to confirm pipeline still works.\n5. Commit with the reader's critique in the message.\n6. Re-send to the reader; close the loop.")
    ]),
    D(6,"Anticipate hard questions","Senior-DS interview prep.",[
      L("The hard-question rehearsal",
"## What it is\n" +
"Senior interviewers ask predictable questions about your portfolio project. Today you LIST them, write 60-second answers, and read them aloud once. After today, the hard questions get smooth answers, not panicked rambles.\n\n" +
"## The ten questions to prepare\n" +
"```text\n" +
"TECHNICAL\n" +
"  1. 'Why didn't you try <alternative model>?'\n" +
"     Answer: name the alternative + why it wasn't the right tradeoff for the\n" +
"     project (latency, interpretability, data scale, time budget).\n" +
"\n" +
"  2. 'What's the most important feature?'\n" +
"     Answer: name it + SHAP value + business interpretation. Show you\n" +
"     understand WHY it matters, not just that it's important.\n" +
"\n" +
"  3. 'How would this fail at 10× the data scale?'\n" +
"     Answer: specific failure mode (memory, training time, latency) + how\n" +
"     you'd address it (chunking, distributed, model compression).\n" +
"\n" +
"  4. 'How do you know your evaluation is honest?'\n" +
"     Answer: k-fold CV, leakage-free Pipeline, held-out test set never\n" +
"     touched until final eval, multi-metric not single-metric.\n" +
"\n" +
"  5. 'If you had one more week, what would you do?'\n" +
"     Answer: ONE specific thing + WHY it would matter (causal, fairness,\n" +
"     deployment monitoring, etc.). Specifics > 'improve the model'.\n" +
"\n" +
"PROCESS / JUDGMENT\n" +
"  6. 'What did you learn?'\n" +
"     Answer: one TECHNICAL lesson + one PROCESS lesson. Show meta-awareness.\n" +
"\n" +
"  7. 'What's the weakness of this project?'\n" +
"     Answer: name something REAL (not 'I wish I had more data' — too vague).\n" +
"     'The model under-predicts when X subgroup has Y characteristic, which\n" +
"     I'd address with <specific fix>'.\n" +
"\n" +
"  8. 'How would you deploy this in production?'\n" +
"     Answer: walk through ingestion → preprocessing → batch vs realtime →\n" +
"     monitoring (data drift, model drift) → retraining cadence.\n" +
"\n" +
"  9. 'How would you monitor it once deployed?'\n" +
"     Answer: data drift detection (PSI, KS test), prediction drift,\n" +
"     subgroup performance, business metric (the proxy for value).\n" +
"\n" +
" 10. 'Walk me through one decision where you considered two options.'\n" +
"     Answer: pull from DECISIONS.md. Name both options, the tradeoff, your\n" +
"     pick, what you'd do differently in hindsight (if anything).\n" +
"```\n\n" +
"## The 60-second answer template\n" +
"```text\n" +
"[0:00 - 0:10]  Repeat / clarify the question if needed\n" +
"               'Sure — you're asking about <X>'\n" +
"[0:10 - 0:25]  State your position\n" +
"               'I picked <Y> because <reason>'\n" +
"[0:25 - 0:50]  Give the supporting evidence\n" +
"               'Specifically, <number / detail / mechanism>'\n" +
"[0:50 - 1:00]  Honest qualifier\n" +
"               'The tradeoff was <Z>; in hindsight I'd <maybe change W>'\n" +
"```\n\n" +
"## The discipline\n" +
"- Read all 10 answers aloud ONCE today\n" +
"- Time yourself on three of them — should be 50-70 seconds each\n" +
"- Anything that runs over 90 seconds is over-scoped; cut\n\n" +
"## Why this works\n" +
"You don't need to memorise these answers verbatim. The exercise of writing them, reading them aloud, and timing them rewires the response so it COMES OUT smoothly in the interview without thinking. The structure stays; the words flow naturally."
      ),
      S([
        { prompt: "Reading the rehearsed answers aloud (not just writing them) catches gaps that silent reading misses.", answer: true, whenRight: "Right — speaking = recall + sequencing. You'll discover the answer that looked complete on paper has gaps when spoken.", whenWrong: "Yes — out-loud rehearsal. Recognition memory ≠ recall memory. Speaking exposes what reading hides." },
        { prompt: "Answers over 90 seconds are over-scoped — cut them down.", answer: true, whenRight: "Right — 60s is the target. Beyond 90s, you're rambling, and the interviewer has moved on mentally.", whenWrong: "Yes — 60s target, 90s ceiling. Long answers signal scattered thinking; tight ones signal clarity." },
        { prompt: "Memorising the answers verbatim is the goal of this exercise.", answer: false, whenRight: "Right — no. The goal is rewiring the response structure so the words flow naturally on the day. Verbatim memorisation sounds wooden.", whenWrong: "Not verbatim. Structure + practice = flow. Memorised verbatim = wooden delivery." }
      ]),
      E("Your turn — anticipate","[WRITE] 1. Open `docs/hard_questions.md`.\n2. Write a 60-second answer to EACH of the 10 questions.\n3. Read all 10 aloud, time three of them.\n4. Cut anything over 90 seconds.\n5. Print + carry in your interview prep notebook.")
    ]),
    D(7,"Ship v1.0","Tag, portfolio, LinkedIn post.",[
      L("The v1.0 ship — and the bridge to W40+",
"## The dev.to / Medium post (~1500 words)\n" +
"```text\n" +
"1. Hook — '<Headline result>. Here's how, in 1500 words.'\n" +
"2. The problem — why it matters, who cares\n" +
"3. The data — source, what makes it hard\n" +
"4. The baseline — what you had to beat\n" +
"5. The main model — pick + reasoning\n" +
"6. The iteration that mattered — ONE concrete improvement that moved the metric\n" +
"7. The honest evaluation — multi-metric + the weaknesses\n" +
"8. Live demo + API + repo links\n" +
"9. What I'd do differently — 2-3 specific items\n" +
"```\n\n" +
"## The LinkedIn post (~200 words)\n" +
"```text\n" +
"[Specific opener]\n" +
"I spent the last 12 weeks building <X>. Here's what it does + what I learned.\n" +
"\n" +
"[Three specific learnings, each with a number]\n" +
"1. <Lesson> — <number / specific detail>\n" +
"2. <Lesson> — <number / specific detail>\n" +
"3. <Lesson> — <number / specific detail>\n" +
"\n" +
"[Live links]\n" +
"Demo: <url>\n" +
"Code: <url>\n" +
"Write-up: <url>\n" +
"\n" +
"#DataScience #MachineLearning #<domain>\n" +
"```\n\n" +
"## Update the portfolio site (W31)\n" +
"Replace the old capstone card with the v1.0-extended one:\n" +
"```text\n" +
"<Capstone name>\n" +
"Reproducible pipeline + Dockerized inference + multi-metric evaluation.\n" +
"AUC 0.871 (vs 0.812 linear baseline) on <dataset>.\n" +
"[Live demo] [Blog] [API] [Code] [3-min video]\n" +
"```\n\n" +
"## Tag and ship\n" +
"```bash\n" +
"git add docs/ README.md\n" +
"git commit -m \"Capstone v1.0 extended: <one-line headline result>\"\n" +
"git tag capstone-v1.0-extended\n" +
"git tag roadmap-extended-done\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## What you've actually built (W37-W39 on top of W28-W30)\n" +
"- Reproducible pipeline + multi-metric evaluation\n" +
"- 5 critical-path tests\n" +
"- Dockerized inference deployed to a public URL\n" +
"- Portfolio README with 4 screenshots + 3-min video\n" +
"- DECISIONS.md / BASELINE.md / METRICS.md\n" +
"- Three pitch versions rehearsed + 10 hard-question answers\n" +
"\n" +
"The capstone has now been shipped TWICE. v1.0 in W30; v1.0-extended in W39. Same project, two cycles of iteration. That's what real DS teams do; you've now done it.\n\n" +
"## Bridge to W40-W43\n" +
"The structured roadmap (W1-W39) is now complete. Four shipped projects + extended capstone + two specialty wins (causal, fairness). What's left in W40-W43 are specialty deep-dives — RL, recommenders, distributed ML, privacy. Optional but each one is a +1 multiplier on the portfolio you've built.\n\n" +
"## You're hireable now\n" +
"Five shipped projects (TaxiPulse, Reddit, Energy Forecast, Capstone v1.0, Capstone v1.0-extended) + three modern-ML artifacts (LoRA, RAG, CV) + two senior-DS skills (causal, fairness) + a polished portfolio site + interview-rehearsed pitches.\n\n" +
"That's more than most working DS practitioners can show. Apply with confidence."
      ),
      S([
        { prompt: "Tagging v1.0-extended as a SEPARATE tag from v1.0 makes both iteration milestones recoverable.", answer: true, whenRight: "Right — two checkpoints, two recovery points. The diff between them IS the iteration story.", whenWrong: "Yes — both tags. The diff between v1.0 and v1.0-extended is the senior-DS rigor you added; preserve it." },
        { prompt: "Returning to a shipped project for a SECOND iteration is a stronger portfolio signal than starting a new project.", answer: true, whenRight: "Right — iteration = how real ML teams work. Second-iteration projects show maturity; new projects show only curiosity.", whenWrong: "Yes — iteration = senior signal. Real teams don't ship v1.0 and walk away; they ship v0.2, v0.3, v1.0, v1.1, v2.0." },
        { prompt: "W40-W43 are required to be 'roadmap-extended-done'.", answer: false, whenRight: "Right — no. The structured roadmap completes at W39. W40-W43 are specialty deep-dives that multiply but aren't required.", whenWrong: "Optional. The structured roadmap is complete; W40-W43 are specialty +1s, not the bar." }
      ]),
      E("Your turn — ship v1.0","[PRODUCE] 1. Write the dev.to post (~1500 words); publish.\n2. Write the LinkedIn post (~200 words); publish.\n3. Update the portfolio site with the v1.0-extended card.\n4. Commit + double-tag:\n`git add . && git commit -m 'Capstone v1.0-extended + roadmap extended done'`\n`git tag capstone-v1.0-extended`\n`git tag roadmap-extended-done`\n`git push && git push --tags`\n\nPASS:\n[x] 3-minute video live on YouTube\n[x] 1500-word dev.to post published\n[x] LinkedIn post live\n[x] Portfolio site updated\n[x] 3 reader-feedback rounds applied\n[x] 10 hard-question answers rehearsed\n[x] capstone-v1.0-extended + roadmap-extended-done tags pushed\n5. Apply to 10 jobs this week. Use the 90s pitch in cover notes; the demo URL in every application.")
    ])
  ]
};

/* ═══════════════════════════════════════════════════════════
   VALIDATE + WRITE
   ═══════════════════════════════════════════════════════════ */
const newWeeks = [W37, W38, W39];
newWeeks.forEach((w) => {
  if (w.days.length !== 7) throw new Error(`W${w.number}: need 7 days, got ${w.days.length}`);
  if (!w.concept_check || w.concept_check.length !== 3) {
    throw new Error(`W${w.number}: concept_check must have 3 entries`);
  }
  w.days.forEach((d) => {
    const k = d.items.map((i) => i.kind);
    if (!k.includes('lesson'))   throw new Error(`W${w.number} D${d.number}: missing lesson`);
    if (!k.includes('swipe'))    throw new Error(`W${w.number} D${d.number}: missing swipe`);
    if (!k.includes('exercise')) throw new Error(`W${w.number} D${d.number}: missing exercise`);
  });
});

ds.weeks.splice(36, 3, ...newWeeks);

fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log(`SUCCESS — DS W37-W39 rebuilt. Total weeks: ${ds.weeks.length}`);
