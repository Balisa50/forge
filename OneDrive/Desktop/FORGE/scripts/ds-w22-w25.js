// Rebuild DS W22-W25 to the teach -> swipe -> project standard. Carries the
// Energy Forecast project arc forward (v0.2 ARIMA -> v0.3 Prophet -> v0.4 LSTM)
// and lands W25 on MLOps + drift monitoring.
const fs = require('fs');
const FILE = 'C:/Users/Abdoulie Balisa/OneDrive/Desktop/FORGE/data/roadmaps/data-science.json';
const ds = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const L = (title, body) => ({ kind: 'lesson', title, body });
const V = (title, url, dm, creator, why) => ({ kind: 'video', title, url, duration_min: dm, creator, why });
const S = (cards) => ({ kind: 'swipe', title: 'Quick check — swipe to answer', cards });
const E = (title, body) => ({ kind: 'exercise', title, body });
const D = (number, title, summary, items) => ({ number, title, summary, items });

/* ════ WEEK 22 — Energy Forecast v0.2: ARIMA model ════ */
const W22 = {
  number: 22, title: "Energy Forecast v0.2: ARIMA model",
  phase: "Time Series", commitment_hours: "12-18",
  context: ds.weeks[21].context,
  concept_check: [
    { q: "What does the I in ARIMA stand for, and why does it matter?",
      choices: ["Iterative","Integrated — the model differences the series until it's stationary, which it requires","Inverse","Interpolated"],
      correct: 1, explain: "ARIMA = AutoRegressive Integrated Moving Average. The 'I' (Integrated) is differencing — subtracting yesterday from today, or this week from last — to remove trends/seasonality and make the series stationary. ARIMA only works on stationary input." },
    { q: "Why does ARIMA require a stationary series?",
      choices: ["So the trainer runs faster","Because its coefficients only describe stable patterns; on a series with a trend, today's relationships don't predict tomorrow's",
        "Because Python requires it","To save memory"],
      correct: 1, explain: "ARIMA fits one set of coefficients that should describe the relationship between past and future. On a non-stationary series, that relationship shifts over time — what fits 2010 won't fit 2020. Differencing makes the series stationary so a single set of coefficients applies throughout." },
    { q: "auto-ARIMA finds (p, d, q) for you. What is it doing internally?",
      choices: ["Magic","Grid-searching (p, d, q) combinations and picking the one with the lowest AIC (a fit + complexity score)",
        "Asking ChatGPT","Using neural networks"],
      correct: 1, explain: "auto-ARIMA grid-searches (p, d, q) — and seasonal (P, D, Q) for SARIMA — and picks the combination that minimises AIC (Akaike Information Criterion), which rewards good fit and penalises complexity. You skip the manual ACF/PACF inspection, but you still need to verify the result on a held-out period." }
  ],
  days: [
    D(1,"What ARIMA actually is","AR + I + MA — three ideas, one stationary model.",[
      L("ARIMA — three letters, one model",
"## What it is\n" +
"**ARIMA** (AutoRegressive Integrated Moving Average) is the classical statistical model for forecasting a single time series. Three ideas stacked:\n\n" +
"- **AR(p) — AutoRegressive.** Today's value is a weighted sum of the *p* most recent past values plus noise. `y_t = c + a1*y_{t-1} + a2*y_{t-2} + ... + e_t`.\n" +
"- **I(d) — Integrated.** Difference the series *d* times before modelling, so the trend and seasonality disappear and we're left with a stationary signal.\n" +
"- **MA(q) — Moving Average.** Today's value is also a weighted sum of the *q* most recent *errors* the model made, not just the values.\n\n" +
"You write the model as `ARIMA(p, d, q)`. A SARIMA extension adds the seasonal `(P, D, Q, m)` quadruple for a known repeating cycle (m=24 for hourly daily seasonality, m=7 for daily weekly).\n\n" +
"## Why before anything else this week\n" +
"Last week you built a chronological split + a persistence baseline (`tomorrow = today`). Persistence is the bar. This week your first real model — ARIMA — must beat it. If it can't, you don't ship it.\n\n" +
"## What you'll do today\n" +
"Read what ARIMA actually models (today). Test stationarity (Day 2). Fit auto-ARIMA on the daily-resampled AEP series (Day 3). Forecast + MAE (Day 4). Confidence intervals (Day 5). Compare to baseline + write the finding (Day 6). Ship v0.2 (Day 7)."
      ),
      V("Time Series Talk: ARIMA Models for Forecasting","https://www.youtube.com/watch?v=3UmyHed0iYE",12,"Aric LaBarr","Watch first. Clearly explains the AR, I, MA pieces and why differencing matters before modelling."),
      L("Reading the (p, d, q) notation",
"## What each value controls\n" +
"```text\n" +
"ARIMA(2, 1, 1)\n" +
"        ^  ^  ^\n" +
"        |  |  └── MA(q=1): weighted sum of the LAST 1 model error\n" +
"        |  └───── I(d=1): difference the series ONCE before fitting\n" +
"        └──────── AR(p=2): weighted sum of the LAST 2 actual values\n" +
"```\n\n" +
"## Practical defaults you'll see\n" +
"- `(0, 1, 1)` — simple exponential smoothing flavour. Good when trend exists but seasonality is mild.\n" +
"- `(1, 1, 0)` — short-memory AR with one diff. Common for stable economic series.\n" +
"- `(p, 0, q)` with no differencing — only if the series is already stationary.\n\n" +
"Don't try to pick (p, d, q) by hand on Day 3. `auto_arima` (pmdarima) grid-searches and reports the best AIC for you. Your job is to validate its choice against a held-out set, not to be a statistician."
      ),
      S([
        { prompt: "The 'I' in ARIMA stands for Integrated and refers to differencing the series.", answer: true, whenRight: "Right — d differences before fitting. That's how ARIMA handles trends.", whenWrong: "Integrated = differencing. d=1 differences once, d=2 twice. ARIMA needs stationary input." },
        { prompt: "If your series already looks stationary, you should still difference it to be safe.", answer: false, whenRight: "Right — no. Over-differencing introduces unnecessary noise and worsens forecasts.", whenWrong: "Over-differencing adds noise. If stationary, use d=0. Differencing is a tool, not insurance." },
        { prompt: "auto-ARIMA replaces the need to choose (p, d, q) by hand.", answer: true, whenRight: "Right — it grid-searches and picks the lowest-AIC combination. You verify on held-out data.", whenWrong: "Yes — auto-ARIMA does the grid search. Don't tune by hand; verify the chosen model out-of-sample." }
      ]),
      E("Your turn — frame ARIMA","[WRITE] In a `notebooks/02-arima.ipynb` (just markdown for today):\n1. Define ARIMA(p, d, q) in your own words.\n2. State your hypothesis: 'ARIMA can beat the persistence baseline because ___.'\n3. State the bar to beat: persistence MAE from Week 21.")
    ]),
    D(2,"Stationarity check — ADF test","Difference until the series stops drifting.",[
      L("Stationarity and the Augmented Dickey-Fuller test",
"## What 'stationary' means\n" +
"A series is **stationary** when its **mean and variance don't change over time** — no trend, no growing volatility, the same statistical behaviour at every window. ARIMA's coefficients only describe a stable joint distribution; on a non-stationary input they describe one snapshot that doesn't generalise.\n\n" +
"## The ADF test\n" +
"**Augmented Dickey-Fuller** tests the null hypothesis 'the series has a unit root' (i.e. is non-stationary). A small **p-value (< 0.05)** rejects the null → the series IS stationary, no differencing needed.\n\n" +
"```python\n" +
"from statsmodels.tsa.stattools import adfuller\n" +
"stat, p, *_ = adfuller(daily['demand'])\n" +
"print(f'ADF stat={stat:.2f}, p={p:.4f}')\n" +
"# Small p (< 0.05) -> reject null -> series is stationary\n" +
"# Large p           -> can't reject -> difference and retest\n" +
"```\n\n" +
"## Practical loop\n" +
"```text\n" +
"adfuller(series)        -> p > 0.05?  not stationary, difference once\n" +
"adfuller(diff(series))  -> p > 0.05?  difference once more (rare)\n" +
"adfuller(diff(diff(s))) -> p < 0.05?  stop. d = number of diffs you took.\n" +
"```\n\n" +
"Most real series stationarise with d=1 (one differencing). Energy demand usually does. If you find yourself at d=3+, something else is wrong."
      ),
      L("See it in code (with output)",
"## ADF on the AEP daily series\n" +
"```python\n" +
"import pandas as pd, numpy as np\n" +
"from statsmodels.tsa.stattools import adfuller\n\n" +
"daily = pd.read_parquet('data/aep_daily.parquet')['demand']\n" +
"def adf(s, label):\n" +
"    stat, p, *_ = adfuller(s.dropna())\n" +
"    print(f'{label:20s} stat={stat:6.2f}  p={p:.4f}')\n\n" +
"adf(daily,                 'level')\n" +
"adf(daily.diff(),          'd=1 (first diff)')\n" +
"# level             stat=-1.83  p=0.3641   <- not stationary\n" +
"# d=1 (first diff)  stat=-17.50 p=0.0000   <- stationary\n" +
"# Conclusion: d = 1\n" +
"```\n" +
"One differencing is enough. From here you can fit ARIMA(p, 1, q) with a clean conscience."
      ),
      S([
        { prompt: "A p-value < 0.05 from the ADF test means the series IS stationary.", answer: true, whenRight: "Right — small p rejects the 'has a unit root' (non-stationary) null. Series is stationary; no differencing needed.", whenWrong: "Small p = reject null = stationary. Counter-intuitive, but you reject the non-stationary hypothesis with low p." },
        { prompt: "If d=1 makes the series stationary, you should difference further (d=2) just to be safe.", answer: false, whenRight: "Right — over-differencing introduces spurious negative autocorrelation and hurts forecasts.", whenWrong: "Stop at d=1 once stationary. Going further adds noise and shifts coefficients in unhelpful ways." },
        { prompt: "Most real-world series stationarise with d=1 (one differencing).", answer: true, whenRight: "Right — single differencing handles linear trends. d=2 is rare; d=3+ is a red flag.", whenWrong: "Yes — d=1 covers most cases. If you're at d=3, your seasonal or transformation is probably what's missing." }
      ]),
      E("Your turn — ADF on AEP","[CODE] In `notebooks/02-arima.ipynb`:\n1. Load the daily AEP demand series from Week 21.\n2. Run adfuller on the level, then on the first difference.\n3. Print stat + p for each.\n4. Conclude with d=? in a markdown cell.")
    ]),
    D(3,"Fit auto-ARIMA","Let the algorithm grid-search (p, d, q) for you.",[
      L("auto-ARIMA — picking (p, d, q) automatically",
"## What auto-ARIMA does\n" +
"Grid-searches (p, d, q) (and seasonal (P, D, Q, m) if you ask) and reports the model with the **lowest AIC** — a score that rewards good fit and penalises extra parameters.\n\n" +
"```python\n" +
"from pmdarima import auto_arima\n" +
"model = auto_arima(\n" +
"    train,\n" +
"    seasonal=True, m=7,        # weekly seasonality on daily data\n" +
"    d=1, D=1,                  # we know d=1 from ADF; D=1 for weekly diff\n" +
"    start_p=0, max_p=3,\n" +
"    start_q=0, max_q=3,\n" +
"    trace=True,                # print the search trail\n" +
"    error_action='ignore', suppress_warnings=True,\n" +
"    stepwise=True,             # smart search, not exhaustive\n" +
")\n" +
"print(model.order, model.seasonal_order)\n" +
"# Example: (1, 1, 1) x (1, 1, 1, 7)\n" +
"```\n\n" +
"## What to actually trust\n" +
"The AIC winner is a *starting point*, not gospel. Always check:\n" +
"1. Residuals look like white noise (no obvious pattern in `model.plot_diagnostics()`)\n" +
"2. The model beats persistence on a real held-out period (Day 4-6)\n\n" +
"If the residuals show structure, the model missed something — add seasonality, transform the series (log), or use Prophet next week.\n\n" +
"## Why stepwise=True\n" +
"`stepwise=False` is exhaustive — every combination of (p, d, q, P, D, Q). That can take hours. `stepwise=True` uses a smarter heuristic that finds the same or near-best model in seconds. Default on for any series longer than a few hundred points."
      ),
      L("See it in code (with output)",
"## Fit and inspect\n" +
"```python\n" +
"from pmdarima import auto_arima\n\n" +
"split = int(len(daily) * 0.8)\n" +
"train, test = daily.iloc[:split], daily.iloc[split:]\n\n" +
"model = auto_arima(train, seasonal=True, m=7, d=1, D=1,\n" +
"                   max_p=3, max_q=3, max_P=2, max_Q=2,\n" +
"                   stepwise=True, suppress_warnings=True)\n\n" +
"print(model.order, model.seasonal_order)\n" +
"# (1, 1, 1) (1, 1, 1, 7)\n" +
"print('AIC:', round(model.aic(), 1))\n" +
"# AIC: 23842.3\n" +
"```\n" +
"The auto-search lands on `ARIMA(1,1,1)x(1,1,1,7)` — one non-seasonal AR + MA, one seasonal AR + MA on a 7-day cycle. That's a sane shape for weekly-seasonal energy demand."
      ),
      S([
        { prompt: "auto-ARIMA picks the (p, d, q) combination with the LOWEST AIC.", answer: true, whenRight: "Right — AIC rewards fit and penalises extra parameters. Lower is better.", whenWrong: "Lower AIC = better. The 'best' is the lowest-AIC combination the search finds." },
        { prompt: "stepwise=True is exhaustive and tries every combination of (p, d, q).", answer: false, whenRight: "Right — stepwise is a SMART (faster) search, not exhaustive. stepwise=False is exhaustive.", whenWrong: "stepwise=True is the FAST heuristic. stepwise=False is exhaustive and slow. Default to True." },
        { prompt: "The model with the lowest AIC always beats persistence on real held-out data.", answer: false, whenRight: "Right — not guaranteed. AIC ranks fit + complexity in-sample. You must verify on a held-out set (Day 4-6).", whenWrong: "AIC is an in-sample score. The model could still lose to persistence out-of-sample. Always verify." }
      ]),
      E("Your turn — auto-ARIMA","[CODE] In `notebooks/02-arima.ipynb`:\n1. `pip install pmdarima` if you haven't.\n2. Chronologically split daily 80/20.\n3. Run auto_arima on train, seasonal=True, m=7, stepwise=True, d=1, D=1.\n4. Print model.order and model.seasonal_order.\n5. Markdown: which (p, d, q)(P, D, Q, m) won?")
    ]),
    D(4,"Forecast + evaluate","Predict the held-out period, compute MAE vs persistence.",[
      L("Forecasting and the MAE comparison",
"## What it is\n" +
"With a fitted model, you forecast the next `len(test)` steps and compute the **Mean Absolute Error** against the actual values. Then you compare to the **persistence baseline** MAE you computed in Week 21.\n\n" +
"```python\n" +
"from sklearn.metrics import mean_absolute_error\n\n" +
"forecast = model.predict(n_periods=len(test))\n" +
"mae_arima = mean_absolute_error(test.values, forecast)\n" +
"print(f'ARIMA MAE: {mae_arima:.0f} MW')\n" +
"```\n\n" +
"## Why MAE, not RMSE or R²\n" +
"- **MAE** is in the **same units** as your series (MW here). 'My forecast is off by ~720 MW on average' is plainly interpretable.\n" +
"- **RMSE** punishes large errors more (squared). Useful when big misses are unusually costly.\n" +
"- **R²** is misleading on time-series forecasts because the baseline (predicting the mean) is rarely meaningful.\n\n" +
"Pick MAE for the user-facing number; report RMSE as a secondary if outliers matter.\n\n" +
"## The forecast-vs-actual plot\n" +
"Always **plot the forecast against the actual held-out values**. A single MAE number hides whether the model captures peaks or whether it just rides the seasonal mean. The plot tells you which.\n\n" +
"```python\n" +
"import matplotlib.pyplot as plt\n" +
"plt.plot(test.index, test.values, label='actual')\n" +
"plt.plot(test.index, forecast, label='ARIMA')\n" +
"plt.legend(); plt.savefig('charts/arima_forecast.png')\n" +
"```"
      ),
      L("See it in code (with output)",
"## Forecast + compare\n" +
"```python\n" +
"from sklearn.metrics import mean_absolute_error\n\n" +
"forecast = model.predict(n_periods=len(test))\n\n" +
"# Persistence baseline = today equals yesterday (the bar from Week 21)\n" +
"baseline = test.shift(1).dropna()\n" +
"mae_arima       = mean_absolute_error(test.values,      forecast)\n" +
"mae_persistence = mean_absolute_error(test.values[1:], baseline.values)\n\n" +
"print(f'ARIMA MAE:       {mae_arima:.0f} MW')\n" +
"print(f'Persistence MAE: {mae_persistence:.0f} MW')\n" +
"# ARIMA MAE:       706 MW\n" +
"# Persistence MAE: 868 MW\n" +
"# ARIMA beats persistence by ~19%\n" +
"```\n" +
"ARIMA wins. The structure it learned (weekly seasonality + short autoregressive memory) genuinely helps over `tomorrow = today`."
      ),
      S([
        { prompt: "MAE is in the SAME units as the original series, which makes it directly interpretable.", answer: true, whenRight: "Right — 'off by 706 MW' is plainly meaningful. RMSE is in squared-then-rooted units, also meaningful but punishes outliers more.", whenWrong: "MAE keeps the original units. RMSE is also in original units (after the root), but emphasises large errors via the square." },
        { prompt: "If ARIMA's MAE is higher than the persistence baseline, you should still ship it.", answer: false, whenRight: "Right — no. Persistence is the bar. A worse-than-persistence model is dead weight. Either improve it or ship persistence.", whenWrong: "Don't ship a model that loses to the baseline. Persistence is the floor; anything below it is worse than guessing 'tomorrow = today'." },
        { prompt: "You should ALWAYS plot the forecast vs the actual held-out series, not just report MAE.", answer: true, whenRight: "Right — the plot shows whether peaks are captured or just smoothed. MAE alone hides that.", whenWrong: "Plot it. MAE can look fine while the model misses every peak. The plot tells the real story." }
      ]),
      E("Your turn — forecast and evaluate","[CODE] In `notebooks/02-arima.ipynb`:\n1. `forecast = model.predict(n_periods=len(test))`.\n2. Compute MAE for ARIMA and for persistence (`test.shift(1)`).\n3. Print both, plus the % improvement.\n4. Plot actual vs forecast over the test period. Save to `charts/arima_forecast.png`.")
    ]),
    D(5,"Confidence intervals","Forecasts are uncertain — quantify it.",[
      L("Prediction intervals from ARIMA",
"## What they are\n" +
"A **prediction interval** is a band around the forecast that contains the true value with some probability — typically 95%. Wider intervals later in the horizon, because uncertainty grows.\n\n" +
"```python\n" +
"forecast, conf = model.predict(n_periods=len(test), return_conf_int=True, alpha=0.05)\n" +
"lower, upper = conf[:, 0], conf[:, 1]\n" +
"```\n\n" +
"## Why intervals matter more than the point forecast\n" +
"A point forecast of '17,400 MW for next Tuesday' is technically wrong. The truth is **a distribution**. Reporting the interval communicates:\n" +
"- How sure the model is\n" +
"- How that uncertainty grows over the horizon (always widening)\n" +
"- Where the *plausible worst case* sits — critical for capacity planning where 'we MIGHT need 19,500 MW' is the actionable number\n\n" +
"A grid operator can't act on '17,400 MW.' They can act on '17,400 with 95% chance between 16,100 and 18,700.' Intervals turn a number into a decision.\n\n" +
"## What 95% actually means\n" +
"If the model's assumptions hold (stationary residuals, no major regime change), the true value will fall inside the 95% interval ~95% of the time across many forecasts. It does NOT mean 'I am 95% sure for THIS specific forecast.'"
      ),
      L("See it in code (with output)",
"## Plot the interval band\n" +
"```python\n" +
"import matplotlib.pyplot as plt\n\n" +
"forecast, conf = model.predict(n_periods=len(test), return_conf_int=True, alpha=0.05)\n" +
"lower, upper = conf[:, 0], conf[:, 1]\n\n" +
"plt.figure(figsize=(12, 4))\n" +
"plt.plot(test.index, test.values, label='actual', color='#3b82f6')\n" +
"plt.plot(test.index, forecast,    label='ARIMA forecast', color='#f59e0b')\n" +
"plt.fill_between(test.index, lower, upper, color='#f59e0b', alpha=0.18, label='95% interval')\n" +
"plt.legend(); plt.tight_layout()\n" +
"plt.savefig('charts/arima_intervals.png', dpi=150); plt.close()\n\n" +
"coverage = ((test.values >= lower) & (test.values <= upper)).mean()\n" +
"print(f'Empirical 95% interval coverage: {coverage:.1%}')\n" +
"# Empirical 95% interval coverage: 94.2%   <- close to nominal\n" +
"```\n" +
"94.2% coverage on a 95% interval is healthy — the model's uncertainty estimate matches reality. A coverage of 60% would mean the model is overconfident; 99% would mean the intervals are too wide."
      ),
      S([
        { prompt: "A 95% prediction interval gets WIDER the further out you forecast.", answer: true, whenRight: "Right — uncertainty compounds. The interval at h=30 is wider than at h=1.", whenWrong: "Wider over time — uncertainty grows. Compounding errors and accumulating noise widen the band." },
        { prompt: "Reporting a confidence interval alongside the point forecast helps decision-makers more than the point alone.", answer: true, whenRight: "Right — a grid operator needs 'plausible worst case' for capacity planning. Intervals turn a number into a decision.", whenWrong: "Yes — point forecasts hide uncertainty; intervals expose it. Operators plan against the worst plausible case, not the mean." },
        { prompt: "If your 95% interval has empirical coverage of 60% on the held-out set, your model's uncertainty estimate is accurate.", answer: false, whenRight: "Right — no. 60% coverage on a nominally 95% interval means the model is overconfident. You'd want ~95% coverage.", whenWrong: "60% coverage means overconfidence. Calibrated 95% intervals should contain the truth ~95% of the time. Big gap = problem." }
      ]),
      E("Your turn — confidence intervals","[CODE] In `notebooks/02-arima.ipynb`:\n1. Re-predict with return_conf_int=True, alpha=0.05.\n2. Plot the actual + forecast + 95% interval band. Save to `charts/arima_intervals.png`.\n3. Compute empirical coverage: what fraction of actual values fall inside the band?\n4. Markdown: is the model well-calibrated?")
    ]),
    D(6,"Beat the baseline — write the finding","Compare ARIMA to persistence with numbers + a chart.",[
      L("Writing the comparison",
"## What the v0.2 finding looks like\n" +
"```text\n" +
"## v0.2 — ARIMA(1,1,1)x(1,1,1,7) on AEP daily demand\n" +
"- Test set: last 20% of daily means (chronological split, no shuffle)\n" +
"- Persistence baseline MAE: 868 MW\n" +
"- ARIMA MAE:                706 MW   ← 19% better than baseline\n" +
"- 95% prediction-interval coverage on test: 94.2%\n" +
"- Where it fails: under-predicts the August heatwave by ~9% — the model\n" +
"  has only one summer of training data covering that level.\n" +
"```\n\n" +
"## Why this is the right shape of finding\n" +
"- **One sentence per number** so a recruiter scans and gets it.\n" +
"- **Honest weakness** — the heatwave under-prediction is real and worth naming. Hiding it would be lying with confidence intervals.\n" +
"- **Method enough to be checkable** — chronological split, MAE, coverage. Anyone with the data can repeat your number.\n\n" +
"## What you ship in v0.2\n" +
"`notebooks/02-arima.ipynb` with the four sections (ADF, fit, forecast, intervals), the `charts/` PNGs, and the finding above in the README. The fitted model goes to `models/arima.pkl` so v0.3 (Prophet) can be benchmarked against it next week."
      ),
      S([
        { prompt: "It's fine to omit the weakness ('under-predicts heatwaves') from the README if the headline MAE looks good.", answer: false, whenRight: "Right — don't hide weaknesses. Naming them builds trust and shapes how the model gets used downstream.", whenWrong: "Always state weaknesses. Hiding them is how 'great offline metrics, surprise outage' happens in real ops." },
        { prompt: "Reporting the test methodology (chronological split + MAE) alongside the number lets anyone reproduce your finding.", answer: true, whenRight: "Right — reproducible is the bar. Without the split rule, the number is unverifiable.", whenWrong: "Yes — reproducibility is what makes a finding more than an anecdote. Always state the test setup." },
        { prompt: "v0.2 ships a saved model file so v0.3 (Prophet next week) can benchmark against it directly.", answer: true, whenRight: "Right — joblib.dump the fitted ARIMA and keep it. Next week's comparison reuses it without retraining.", whenWrong: "Save the model. Reusing it next week makes the Prophet vs ARIMA comparison instant and consistent." }
      ]),
      E("Your turn — write the finding","[WRITE] 1. Save your ARIMA model: `joblib.dump(model, 'models/arima.pkl')`.\n2. Add a v0.2 section to the Energy Forecast README using the shape above.\n3. Include MAE, % improvement vs persistence, 95% coverage, and ONE honest weakness.")
    ]),
    D(7,"Ship v0.2","Tag the release, commit clean.",[
      L("Shipping the ARIMA milestone",
"## What you tag\n" +
"```bash\n" +
"git add notebooks/02-arima.ipynb charts/arima_forecast.png charts/arima_intervals.png models/arima.pkl README.md\n" +
"git commit -m \"Energy Forecast v0.2: ARIMA(1,1,1)x(1,1,1,7) beats baseline by 19%\"\n" +
"git tag v0.2\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## Why this milestone matters\n" +
"You've now done the full classical workflow on a real series:\n" +
"1. Decompose the signal (W21)\n" +
"2. Test for stationarity (D2)\n" +
"3. Fit an automated grid-search model (D3)\n" +
"4. Forecast + evaluate with the right metric (D4)\n" +
"5. Quantify uncertainty (D5)\n" +
"6. Honestly compare to a baseline (D6)\n\n" +
"That's the durable shape. Whatever model you reach for next — Prophet, LSTM, Transformer — the workflow stays. Only the fit step changes.\n\n" +
"## What's next\n" +
"Week 23: **Prophet**. Same data, different tool. Prophet is built specifically for messy, holiday-interrupted, multi-seasonal business series — exactly the case where pure ARIMA struggles. You'll compare them head-to-head on the same test set."
      ),
      S([
        { prompt: "Tagging v0.2 marks a known-good state you can return to even after later experiments break things.", answer: true, whenRight: "Right — tags are immutable pointers to a working commit. Insurance for the rest of the project.", whenWrong: "Yes — tags pin a known-good state. Future you (or a reviewer) can always check out v0.2 cleanly." },
        { prompt: "The next week (Prophet) will retrain ARIMA from scratch to compare.", answer: false, whenRight: "Right — no. You saved `models/arima.pkl`. Next week just loads and benchmarks. Saves time, keeps numbers consistent.", whenWrong: "You saved the model. Load it; don't retrain. Re-fitting can give slightly different coefficients run-to-run." },
        { prompt: "The classical forecasting workflow (decompose -> stationarity -> fit -> evaluate -> intervals -> compare) is reusable across nearly any time series.", answer: true, whenRight: "Right — the steps are durable. Only the fit method changes when you swap models.", whenWrong: "Yes — the workflow generalises. You'll reuse this exact arc for Prophet, LSTM, and any future time-series project." }
      ]),
      E("Your turn — ship v0.2","[PRODUCE] 1. Confirm models/arima.pkl exists.\n2. Update README with the v0.2 section.\n3. Commit + tag:\n`git add . && git commit -m 'v0.2: ARIMA + persistence comparison'`\n`git tag v0.2 && git push --tags`\n\nPASS:\n[x] ADF test in notebook\n[x] auto-ARIMA fit + (p,d,q)(P,D,Q,m) noted\n[x] Forecast vs actual chart\n[x] 95% interval chart + coverage number\n[x] MAE vs persistence in README\n[x] v0.2 tag pushed")
    ])
  ]
};

/* ════ WEEK 23 — Energy Forecast v0.3: Prophet model ════ */
const W23 = {
  number: 23, title: "Energy Forecast v0.3: Prophet model",
  phase: "Time Series", commitment_hours: "10-15",
  context: ds.weeks[22].context,
  concept_check: [
    { q: "Prophet is built around a decomposable model: y(t) = ...",
      choices: ["trend + ARMA + noise","trend + seasonality + holidays + noise — three interpretable components plus a residual",
        "neural network output","exponential weighted average"],
      correct: 1, explain: "Prophet models a series as trend(t) + sum of seasonality components + holiday effects + a residual. Each piece is interpretable — you can plot the contribution of weekly seasonality alone, or see exactly how much a holiday shifted the forecast." },
    { q: "Why does Prophet expect columns named 'ds' and 'y'?",
      choices: ["For aesthetics","Hard-coded by the library — ds is the datestamp, y is the value. Renaming saves you arguing with the API",
        "For SQL compatibility","To match pandas defaults"],
      correct: 1, explain: "Prophet was built at Facebook with this convention. Every Prophet tutorial, every example, every error message assumes `ds` (datestamp) and `y` (value). Rename your columns once on input, then everything just works." },
    { q: "What does adding the US Federal Holidays dataframe to Prophet do?",
      choices: ["Nothing — it's a placebo","Tells Prophet which dates are holidays so it learns a holiday-specific effect (e.g. demand drops on Thanksgiving)",
        "Removes those days from training","Skips forecasting on those days"],
      correct: 1, explain: "Holidays go into a separate component of the model. Prophet learns an effect size per holiday (Christmas: -2000 MW, July 4: -1500 MW) and bakes it into both training and forecasts so the holiday-driven dip is predicted, not treated as noise." }
  ],
  days: [
    D(1,"What Prophet is","Decomposable forecasting built for real business series.",[
      L("Prophet — Facebook's pragmatic forecaster",
"## What it is\n" +
"**Prophet** is Facebook's open-source forecaster, designed for the kind of messy series real businesses actually have: multi-seasonal, holiday-interrupted, missing data, sudden trend changes. It models a series as:\n\n" +
"```text\n" +
"y(t) = g(t)        # trend (piecewise linear or logistic)\n" +
"     + s(t)        # seasonality (yearly, weekly, daily, custom)\n" +
"     + h(t)        # holiday effects\n" +
"     + noise\n" +
"```\n\n" +
"Each component is **interpretable** — you can plot trend on its own, or see how big the Christmas effect is. ARIMA shoves everything into one set of coefficients; Prophet keeps them separate.\n\n" +
"## When Prophet beats ARIMA\n" +
"- Multiple overlapping seasonalities (yearly + weekly + daily — exactly the AEP case)\n" +
"- Holiday effects matter (energy, retail, travel)\n" +
"- Trend changes at known dates (a policy shift, a new product)\n" +
"- You want a model a non-statistician can read\n\n" +
"## When ARIMA wins\n" +
"- Pure short-memory series with no obvious calendar pattern\n" +
"- You need the full statistical apparatus (significance tests on coefficients)\n" +
"- Strict stationarity assumptions matter\n\n" +
"## Where this fits\n" +
"This week: same AEP data, fit Prophet, add holidays, compare to ARIMA. By Sunday you have a head-to-head — and Prophet will likely win because energy demand is a textbook holiday-heavy multi-seasonal series."
      ),
      V("Time Series Forecasting with Prophet (intro)","https://www.youtube.com/watch?v=KvLG1uTC-KU",10,"various","Watch first. Shows the trend + seasonality + holidays decomposition in action and how Prophet's components plot tells the story."),
      L("Prophet's data contract",
"## ds, y, and that's it\n" +
"Prophet was built with a hard convention:\n" +
"- **`ds`** — a datestamp column (datetime or string Prophet parses)\n" +
"- **`y`** — the value to forecast (float)\n\n" +
"```python\n" +
"df = (\n" +
"    daily\n" +
"      .rename_axis('ds').reset_index()       # date index -> ds column\n" +
"      .rename(columns={'demand': 'y'})\n" +
"      [['ds', 'y']]\n" +
")\n" +
"```\n\n" +
"## Don't fight it\n" +
"Every Prophet tutorial, every error message, every Stack Overflow answer assumes ds/y. Rename once on input; everything else just works. Trying to use your own column names doubles your debugging time for zero benefit."
      ),
      S([
        { prompt: "Prophet models a series as trend + seasonality + holidays + noise, with each piece interpretable.", answer: true, whenRight: "Right — decomposable design. You can plot the contribution of any one component on its own.", whenWrong: "Yes — that's the model. Each component is separately readable. ARIMA is opposite (all coefficients tangled)." },
        { prompt: "You can keep your usual 'date' and 'demand' column names with Prophet — it figures them out automatically.", answer: false, whenRight: "Right — no. Prophet requires `ds` and `y` literally. Rename once on input.", whenWrong: "Hard-coded ds/y. Rename. Trying alternative names is pointless friction." },
        { prompt: "Prophet tends to beat ARIMA on series with multiple seasonalities and holiday effects.", answer: true, whenRight: "Right — exactly its design point. Energy / retail / travel series are Prophet's sweet spot.", whenWrong: "Yes — Prophet's decomposed model fits multi-seasonal holiday-heavy series better than vanilla ARIMA." }
      ]),
      E("Your turn — frame Prophet vs ARIMA","[WRITE] In a `notebooks/03-prophet.ipynb`:\n1. Define Prophet's components y(t) = g(t) + s(t) + h(t) + noise.\n2. State your hypothesis: 'Prophet will outperform ARIMA because ___.'\n3. Bar to beat: ARIMA MAE from v0.2.")
    ]),
    D(2,"Install + format data","ds, y, and you're ready.",[
      L("Setup",
"## Install\n" +
"```bash\n" +
"pip install prophet\n" +
"```\n\n" +
"On older Python versions you might see `pystan` build errors — that's the old version. The new Prophet (`pip install prophet`, not `fbprophet`) uses CmdStan and installs cleanly on 3.9+.\n\n" +
"## Load + reshape\n" +
"```python\n" +
"import pandas as pd\n" +
"daily = pd.read_parquet('data/aep_daily.parquet')\n" +
"# daily has a DatetimeIndex named 'date' and a 'demand' column\n\n" +
"df = (\n" +
"    daily.rename_axis('ds').reset_index()\n" +
"         .rename(columns={'demand': 'y'})\n" +
"         [['ds', 'y']]\n" +
")\n" +
"split = int(len(df) * 0.8)\n" +
"train, test = df.iloc[:split], df.iloc[split:]\n" +
"print(train.tail(2))\n" +
"#             ds       y\n" +
"# 4032 2017-09-25  16210.6\n" +
"# 4033 2017-09-26  16104.2\n" +
"```\n\n" +
"## Same chronological split, every model\n" +
"Reuse the **exact same split** as ARIMA (Week 22). That's how the comparison stays fair: both models forecast the identical held-out period."
      ),
      S([
        { prompt: "The same chronological train/test split must be used for ARIMA and Prophet for a fair comparison.", answer: true, whenRight: "Right — different splits = unfair comparison. Same dates, same target, only model differs.", whenWrong: "Always identical splits across model comparisons. Otherwise MAE differences are confounded by data, not model." },
        { prompt: "On modern Python, you install Prophet with `pip install fbprophet`.", answer: false, whenRight: "Right — that's the old name. New is `pip install prophet`. fbprophet hits pystan build errors.", whenWrong: "New name is `prophet`. fbprophet is the legacy package with build pain on modern Python." },
        { prompt: "You should keep your original column names (date, demand) and pass them to Prophet directly.", answer: false, whenRight: "Right — rename to ds/y first. Prophet is hard-coded to those names.", whenWrong: "Rename once on input. Prophet requires ds, y. Trying to use your own names is wasted debugging." }
      ]),
      E("Your turn — set up","[CODE] 1. `pip install prophet`.\n2. Load daily AEP. Reshape to ds/y columns.\n3. Chronological 80/20 split — SAME dates as v0.2 ARIMA.\n4. Print train.shape and test.shape.")
    ]),
    D(3,"Fit Prophet","Three lines to a fitted multi-seasonal model.",[
      L("Fitting Prophet",
"## The minimal fit\n" +
"```python\n" +
"from prophet import Prophet\n" +
"m = Prophet(weekly_seasonality=True, yearly_seasonality=True, daily_seasonality=False)\n" +
"m.fit(train)\n" +
"```\n\n" +
"Three lines. Prophet detects the time scale (daily here) and auto-fits trend + weekly + yearly seasonality.\n\n" +
"## What `daily_seasonality=False` means\n" +
"Our series is **daily** (one value per day). Daily seasonality would mean a within-day cycle — which we don't have at this resolution. If you ever fit Prophet on hourly data, you'd flip `daily_seasonality=True`.\n\n" +
"## Forecasting\n" +
"```python\n" +
"future = m.make_future_dataframe(periods=len(test), freq='D')\n" +
"forecast = m.predict(future)\n" +
"print(forecast[['ds','yhat','yhat_lower','yhat_upper']].tail(3))\n" +
"```\n" +
"`yhat` is the point forecast; `yhat_lower/yhat_upper` are the 80% interval (Prophet's default — change with `interval_width=0.95` on the Prophet() constructor).\n\n" +
"## Why a future dataframe?\n" +
"Prophet wants you to be explicit about *which* future dates you're forecasting. `make_future_dataframe(periods=n)` extends the training timeline by n periods at the right frequency. Then `predict()` returns yhat for every row — historical *and* future."
      ),
      L("See it in code (with output)",
"## Fit, forecast, peek\n" +
"```python\n" +
"from prophet import Prophet\n" +
"m = Prophet(weekly_seasonality=True, yearly_seasonality=True, daily_seasonality=False, interval_width=0.95)\n" +
"m.fit(train)\n" +
"# INFO:prophet: ... using approximate sampling\n\n" +
"future = m.make_future_dataframe(periods=len(test), freq='D')\n" +
"forecast = m.predict(future)\n" +
"print(forecast.tail(2)[['ds','yhat','yhat_lower','yhat_upper']].round(0))\n" +
"#             ds     yhat  yhat_lower  yhat_upper\n" +
"# 5039 2018-04-02  16920       15410       18440\n" +
"# 5040 2018-04-03  17105       15580       18640\n" +
"```\n" +
"Prophet returns a fully populated forecast dataframe — yhat for every date past and future, plus 95% intervals."
      ),
      S([
        { prompt: "Prophet's `yhat` column is the point forecast; `yhat_lower` and `yhat_upper` are the interval bounds.", answer: true, whenRight: "Right — these three columns are what you'll plot. Default 80% interval; set `interval_width=0.95` for 95%.", whenWrong: "yhat = point; yhat_lower/upper = the interval. Adjust width with interval_width on Prophet()." },
        { prompt: "On a series with one value per day, you should set `daily_seasonality=True`.", answer: false, whenRight: "Right — no. Daily seasonality models a within-day cycle; on daily data there's no within-day cycle to model.", whenWrong: "daily_seasonality models a within-day cycle. Daily data has none of that resolution. Set it to False." },
        { prompt: "`make_future_dataframe(periods=n)` extends the training timeline by n periods at the given frequency.", answer: true, whenRight: "Right — it builds the date range Prophet then predicts over. Required input to predict().", whenWrong: "Yes — it generates the future dates. predict() then returns yhat for both history and future." }
      ]),
      E("Your turn — fit Prophet","[CODE] In `notebooks/03-prophet.ipynb`:\n1. `from prophet import Prophet`. Construct with weekly+yearly seasonality, daily=False, interval_width=0.95.\n2. m.fit(train).\n3. make_future_dataframe(periods=len(test), freq='D').\n4. m.predict(future).\n5. Inspect the tail of forecast[['ds','yhat','yhat_lower','yhat_upper']].")
    ]),
    D(4,"Add holidays","Tell Prophet about US Federal Holidays.",[
      L("Holiday effects in Prophet",
"## Why holidays matter for energy\n" +
"Electricity demand drops on Thanksgiving, Christmas, July 4. Without telling Prophet, the model treats those drops as noise and over-predicts demand on every holiday. With them, it learns 'Thanksgiving day demand = baseline minus ~1700 MW' as an explicit effect.\n\n" +
"## Adding a built-in country's holidays\n" +
"```python\n" +
"m = Prophet(weekly_seasonality=True, yearly_seasonality=True, daily_seasonality=False)\n" +
"m.add_country_holidays(country_name='US')\n" +
"m.fit(train)\n" +
"```\n\n" +
"One line. Prophet loads the holiday calendar from the bundled `holidays` package — federal holidays for the US, GB, FR, etc.\n\n" +
"## Inspecting what it learned\n" +
"```python\n" +
"forecast = m.predict(future)\n" +
"print(forecast[forecast['holidays'].abs() > 0][['ds','holidays']].tail(5))\n" +
"#             ds  holidays\n" +
"# 2017-11-23   -1670.4   ← Thanksgiving\n" +
"# 2017-12-25   -2310.2   ← Christmas\n" +
"```\n" +
"Now you can quote: 'Prophet learned Christmas reduces demand by 2,310 MW.' That's a number a grid operator can plan with.\n\n" +
"## Custom holidays\n" +
"For non-federal events (a sports final, a local event), you pass a dataframe of `{holiday, ds, lower_window, upper_window}` rows. Same mechanism — Prophet learns an effect size for each."
      ),
      L("See it in code (with output)",
"## Fit with holidays + inspect effects\n" +
"```python\n" +
"from prophet import Prophet\n\n" +
"m = Prophet(weekly_seasonality=True, yearly_seasonality=True,\n" +
"             daily_seasonality=False, interval_width=0.95)\n" +
"m.add_country_holidays(country_name='US')\n" +
"m.fit(train)\n\n" +
"future = m.make_future_dataframe(periods=len(test), freq='D')\n" +
"forecast = m.predict(future)\n\n" +
"# Show learned holiday effects (negative = demand drop)\n" +
"holiday_effects = forecast[['ds','holidays']]\\\n" +
"    .loc[forecast['holidays'].abs() > 0]\\\n" +
"    .groupby(forecast['ds'].dt.strftime('%m-%d'))['holidays'].mean()\\\n" +
"    .sort_values().head()\n" +
"print(holiday_effects.round(0))\n" +
"# ds\n" +
"# 12-25   -2310   <- Christmas: biggest drop\n" +
"# 11-23   -1670   <- Thanksgiving\n" +
"# 07-04   -1320   <- July 4\n" +
"# 01-01   -1180\n" +
"```"
      ),
      S([
        { prompt: "`m.add_country_holidays(country_name='US')` is enough for US federal holidays — no custom DataFrame needed.", answer: true, whenRight: "Right — one line, Prophet loads the bundled US holiday calendar.", whenWrong: "Yes — one method call. Prophet pulls holidays from the `holidays` package for the country code." },
        { prompt: "Without holidays declared, Prophet treats Thanksgiving's demand drop as noise and over-predicts that day.", answer: true, whenRight: "Right — without telling the model, it has no way to learn the holiday is special. Result: systematic over-prediction.", whenWrong: "Yes — undeclared holidays look like noise. Declared, they get a learned effect." },
        { prompt: "Custom holidays (local events, sports finals) can't be added — only built-in country lists work.", answer: false, whenRight: "Right — you can pass a DataFrame of {holiday, ds, lower_window, upper_window} for custom events.", whenWrong: "Custom holidays are supported — pass a DataFrame. Built-in country lists are just a convenience." }
      ]),
      E("Your turn — add holidays","[CODE] 1. Refit Prophet with `m.add_country_holidays(country_name='US')` before .fit.\n2. Predict.\n3. Show the top 5 holiday effects (most negative first).\n4. Markdown: which holiday drops demand the most, and by how much?")
    ]),
    D(5,"Evaluate vs ARIMA","Head-to-head on the same test set.",[
      L("Comparing Prophet to ARIMA",
"## The comparison\n" +
"Same test period, same MAE metric, same actual values.\n\n" +
"```python\n" +
"import joblib\n" +
"from sklearn.metrics import mean_absolute_error\n\n" +
"# Load v0.2 ARIMA (don't retrain — it could drift)\n" +
"arima = joblib.load('models/arima.pkl')\n" +
"arima_forecast = arima.predict(n_periods=len(test))\n\n" +
"# Prophet on the test slice\n" +
"prophet_forecast = forecast.loc[forecast['ds'].isin(test['ds']), 'yhat'].values\n\n" +
"actual = test['y'].values\n" +
"mae_arima   = mean_absolute_error(actual, arima_forecast)\n" +
"mae_prophet = mean_absolute_error(actual, prophet_forecast)\n" +
"print(f'ARIMA   MAE: {mae_arima:.0f} MW')\n" +
"print(f'Prophet MAE: {mae_prophet:.0f} MW')\n" +
"# ARIMA   MAE: 706 MW\n" +
"# Prophet MAE: 612 MW   ← Prophet wins by ~13%\n" +
"```\n\n" +
"## Why the gap\n" +
"Prophet captures the holiday drops (Thanksgiving, Christmas) that ARIMA treated as residual noise. On weeks containing a holiday, Prophet is dramatically better. On normal weeks the two are close.\n\n" +
"## Don't conclude 'Prophet always wins'\n" +
"It wins HERE because energy demand is heavily holiday-influenced and multi-seasonal — Prophet's home turf. On a series with no calendar effects (a financial return), ARIMA can equal or beat it.\n\n" +
"## The plot that tells the story\n" +
"Plot ARIMA, Prophet, and actual together over the test period. The visible holiday weeks are where Prophet pulls ahead — you can literally see it."
      ),
      L("See it in code (with output)",
"## Three-way chart\n" +
"```python\n" +
"import matplotlib.pyplot as plt\n\n" +
"plt.figure(figsize=(12, 4))\n" +
"plt.plot(test['ds'], actual,           label='actual',  color='#3b82f6', lw=1.5)\n" +
"plt.plot(test['ds'], arima_forecast,   label='ARIMA',   color='#ef4444', lw=1)\n" +
"plt.plot(test['ds'], prophet_forecast, label='Prophet', color='#22c55e', lw=1)\n" +
"plt.title('AEP daily demand — ARIMA vs Prophet on the test period')\n" +
"plt.legend(); plt.tight_layout()\n" +
"plt.savefig('charts/prophet_vs_arima.png', dpi=150); plt.close()\n" +
"```"
      ),
      S([
        { prompt: "Loading the saved ARIMA from v0.2 (instead of refitting) keeps the comparison consistent.", answer: true, whenRight: "Right — fitted-once-then-reused beats fit-again-and-hope-the-RNG-agrees.", whenWrong: "Reuse the saved model. Refitting can give slightly different coefficients and muddies the comparison." },
        { prompt: "Prophet winning on AEP energy demand means it always beats ARIMA on every time series.", answer: false, whenRight: "Right — no. Prophet wins HERE because of heavy calendar effects. On financial returns ARIMA can equal it.", whenWrong: "Wins are domain-specific. Energy/retail favour Prophet; clean stationary series can favour ARIMA." },
        { prompt: "The three-line chart (actual + ARIMA + Prophet) makes the holiday-driven advantage visible.", answer: true, whenRight: "Right — you literally see Prophet hug the actual on Thanksgiving / Christmas while ARIMA over-predicts.", whenWrong: "Yes — the plot is more convincing than the MAE number alone. Always include it." }
      ]),
      E("Your turn — head-to-head","[CODE] 1. Load models/arima.pkl from v0.2.\n2. Predict both ARIMA and Prophet on the same test period.\n3. Print both MAEs.\n4. Plot actual + ARIMA + Prophet together. Save to charts/prophet_vs_arima.png.")
    ]),
    D(6,"Inspect components","Plot trend, seasonality, holidays separately.",[
      L("The components plot — Prophet's superpower",
"## What it is\n" +
"```python\n" +
"fig = m.plot_components(forecast)\n" +
"fig.savefig('charts/prophet_components.png', dpi=150)\n" +
"```\n\n" +
"Prophet plots each component on its own axis: **trend**, **weekly seasonality**, **yearly seasonality**, **holidays**. You see exactly what the model thinks each is contributing.\n\n" +
"## Why this matters more than the forecast itself\n" +
"A grid operator asking 'why is demand higher in summer?' gets an actionable answer: 'Trend is flat; the yearly seasonality plot shows +1800 MW between July and September because of cooling.' That's a finding, not a number.\n\n" +
"## What to look for\n" +
"- **Trend**: smooth, no obvious sudden jumps mid-series\n" +
"- **Weekly**: a clear weekday > weekend gap (industrial load)\n" +
"- **Yearly**: peaks in summer (AC) and winter (heating), troughs in spring/autumn\n" +
"- **Holidays**: negative spikes on the big federal holidays\n\n" +
"If something looks weird (e.g. weekly seasonality says Sunday > Wednesday), the model has learned wrong — investigate before trusting any forecast.\n\n" +
"## The interpretability moat\n" +
"ARIMA gives you `(p, d, q)` coefficients you can't intuitively read. Prophet gives you four labelled charts. For communicating to a non-technical stakeholder, this is the whole game."
      ),
      L("See it in code (with output)",
"## Plot + read the components\n" +
"```python\n" +
"fig = m.plot_components(forecast)\n" +
"fig.savefig('charts/prophet_components.png', dpi=150)\n\n" +
"# Quick numeric readouts you can quote:\n" +
"weekly = forecast.groupby(forecast['ds'].dt.day_name())['weekly'].mean().round(0)\n" +
"print('Weekly effect (MW):'); print(weekly)\n" +
"# Monday      +560\n" +
"# Tuesday     +680\n" +
"# ...\n" +
"# Saturday    -1280\n" +
"# Sunday      -1450\n" +
"# Industrial load tails off on weekends -> Sat/Sun are negative\n" +
"```"
      ),
      S([
        { prompt: "`m.plot_components(forecast)` shows trend, weekly, yearly, and holiday contributions on separate axes.", answer: true, whenRight: "Right — Prophet's interpretability win. Each component plotted alone.", whenWrong: "Yes — that's the function. Four separate plots, one per component, instantly readable." },
        { prompt: "If the weekly seasonality plot shows Sunday > Wednesday, the model is broken or the data is wrong.", answer: true, whenRight: "Right — that's the wrong direction for industrial energy. Investigate before trusting any forecast.", whenWrong: "Yes — suspicious. Energy demand should be weekday > weekend. If the model says otherwise, find the bug." },
        { prompt: "Components plots are mostly aesthetic — they don't actually help anyone understand the model.", answer: false, whenRight: "Right — they're load-bearing. They turn the model into an explanation a non-technical stakeholder can act on.", whenWrong: "They're the interpretability win. A grid operator can read the chart; they can't read ARIMA coefficients." }
      ]),
      E("Your turn — components","[CODE] 1. `fig = m.plot_components(forecast); fig.savefig('charts/prophet_components.png')`.\n2. Print the average weekly effect by day name.\n3. Markdown: name the highest-demand day, lowest-demand day, and the dollar/MW size of the weekend dip.")
    ]),
    D(7,"Ship v0.3","Tag the Prophet milestone with the head-to-head.",[
      L("Shipping v0.3",
"## The README finding\n" +
"```text\n" +
"## v0.3 — Prophet (US holidays + weekly + yearly seasonality)\n" +
"- Same chronological 80/20 split as v0.2.\n" +
"- ARIMA MAE:   706 MW   (v0.2 baseline)\n" +
"- Prophet MAE: 612 MW   ← 13% better than ARIMA\n" +
"- Largest learned holiday effects: Christmas (-2310 MW), Thanksgiving (-1670 MW), July 4 (-1320 MW)\n" +
"- Weekly seasonality: weekday demand ~+650 MW above weekend\n" +
"- Components plot: charts/prophet_components.png\n" +
"```\n\n" +
"```bash\n" +
"git add notebooks/03-prophet.ipynb charts/ models/prophet.pkl README.md\n" +
"git commit -m \"Energy Forecast v0.3: Prophet beats ARIMA by 13% on holiday weeks\"\n" +
"git tag v0.3\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## Save the model\n" +
"```python\n" +
"import joblib\n" +
"joblib.dump(m, 'models/prophet.pkl')\n" +
"```\n" +
"Week 24 (LSTM) compares its results against both ARIMA and Prophet. Both fitted models need to be on disk to make the head-to-head trivial.\n\n" +
"## Why this milestone matters\n" +
"You've now compared a classical statistical model (ARIMA) to a decomposable component model (Prophet) on real data with honest methodology. Next week (LSTM) brings deep learning to the same series — the third leg of the comparison."
      ),
      S([
        { prompt: "Saving the fitted Prophet to models/prophet.pkl lets next week's LSTM week compare against it without refitting.", answer: true, whenRight: "Right — joblib.dump, reload next week. Consistent comparison, zero refit cost.", whenWrong: "Save it. Refits drift between runs; saved models keep numbers identical." },
        { prompt: "Reporting BOTH MAE numbers (ARIMA AND Prophet) is more useful than reporting only the winner.", answer: true, whenRight: "Right — the COMPARISON is the finding, not the absolute number. Both numbers + the gap is the story.", whenWrong: "Yes — the gap matters as much as the winner. Report both, name the improvement %." },
        { prompt: "v0.3 closes the project — no more weeks needed on Energy Forecast.", answer: false, whenRight: "Right — no. Week 24 (LSTM) and Week 27 (v1.0 ship + retro) are still ahead.", whenWrong: "Project continues: W24 LSTM, W25 MLOps, W26 cloud, W27 v1.0 ship. v0.3 is a milestone, not a finish line." }
      ]),
      E("Your turn — ship v0.3","[PRODUCE] 1. Save the model: joblib.dump(m, 'models/prophet.pkl').\n2. README v0.3 section with both MAEs, % improvement, top holiday effects, components chart link.\n3. Commit + tag:\n`git add . && git commit -m 'v0.3: Prophet + US holidays + ARIMA comparison'`\n`git tag v0.3 && git push --tags`\n\nPASS:\n[x] Prophet fitted with holidays\n[x] ARIMA reloaded, same test set\n[x] Three-line comparison chart saved\n[x] Components chart saved\n[x] models/prophet.pkl on disk\n[x] v0.3 tag pushed")
    ])
  ]
};

/* ════ WEEK 24 — Energy Forecast v0.4: LSTM (PyTorch) ════ */
const W24 = {
  number: 24, title: "Energy Forecast v0.4: LSTM (PyTorch)",
  phase: "Time Series", commitment_hours: "15-20",
  context: ds.weeks[23].context,
  concept_check: [
    { q: "What core problem does an LSTM solve that a plain RNN doesn't?",
      choices: ["Vanishing gradients — LSTMs use gates to preserve information across long sequences",
        "Faster training","Smaller models","Better at images"],
      correct: 0, explain: "Vanilla RNNs lose information over long sequences because gradients vanish. LSTMs add a CELL STATE plus FORGET / INPUT / OUTPUT gates that explicitly choose what to keep, add, and emit. That's how they learn long-range temporal dependencies." },
    { q: "Why do we need windowed (sequence) input for an LSTM forecaster?",
      choices: ["It's required by PyTorch","The model takes a SEQUENCE of past N values and outputs the next value(s) — you slide a window across the series to make (X, y) training pairs",
        "It saves memory","To handle missing data"],
      correct: 1, explain: "LSTMs are sequence-to-sequence. You decide a lookback (e.g. 14 days) and a horizon (e.g. 1 day). Every row of X is a 14-day sequence; the matching y is the value on day 15. Sliding the window across the series generates thousands of training pairs from one series." },
    { q: "Why scale (normalise) the inputs before feeding them to the LSTM?",
      choices: ["Pretty plots","Neural networks train MUCH better on inputs near 0-1; raw MW values in the thousands make gradients explode or vanish",
        "PyTorch requires it","To make the model smaller"],
      correct: 1, explain: "Gradients on raw values in the thousands become huge; tanh/sigmoid activations saturate; training stalls. MinMax or Standard scaling brings inputs near 0-1, gradients stay healthy, the model converges. ALWAYS scale time-series inputs to a neural network, and remember to inverse-scale the predictions back to original units before reporting MAE." }
  ],
  days: [
    D(1,"What an LSTM is","Memory cells with gates that learn what to remember.",[
      L("LSTM — Long Short-Term Memory in one read",
"## What it is\n" +
"An **LSTM** is a recurrent neural network designed to learn from sequences. Where ARIMA writes explicit equations for `y_t = f(y_{t-1}, ..., y_{t-p})`, the LSTM **learns** that function from the data.\n\n" +
"The key mechanism is the **cell state** — a memory line that flows through the sequence, modified by three **gates**:\n\n" +
"- **Forget gate** — decides which parts of the cell state to drop\n" +
"- **Input gate** — decides which new information to write\n" +
"- **Output gate** — decides what to emit at this time step\n\n" +
"Each gate is a small neural network with a sigmoid (0 = drop / closed, 1 = keep / open). Training learns the gates' weights so the network keeps useful memory across long sequences.\n\n" +
"## Why LSTM (not a plain RNN)\n" +
"Vanilla RNNs suffer **vanishing gradients** — useful signal from far in the past fades to noise during backprop. LSTMs preserve it via the cell state, which is why they handle long sequences (hundreds of steps) where RNNs fail.\n\n" +
"## When LSTMs beat ARIMA / Prophet\n" +
"- Non-linear dynamics (saturation, threshold effects)\n" +
"- Multiple input features (e.g. demand + temperature + day-of-week)\n" +
"- Very long history matters (RNN/LSTM remembers further back than ARIMA's small p)\n\n" +
"## When they don't\n" +
"- Small series (<1000 points) — overfits easily\n" +
"- Clean seasonal/holiday data — Prophet wins on interpretability + speed\n" +
"- You need uncertainty intervals — much harder with neural nets than ARIMA/Prophet\n\n" +
"## Where this fits\n" +
"This week: build an LSTM in PyTorch on the AEP daily series. Compare to ARIMA and Prophet. By Sunday you have a three-model head-to-head."
      ),
      V("Illustrated Guide to LSTMs and GRUs","https://www.youtube.com/watch?v=8HyCNIVRbSU",10,"Michael Phi","Watch first. The clearest visual explanation of gates and the cell state. The animations make the gating concept click."),
      L("Why scale and window",
"## Two things you must do before training\n\n" +
"### 1. Scale the inputs\n" +
"Raw electricity demand is in thousands of MW. Plug those directly into an LSTM and gradients explode or saturate tanh/sigmoid. Always scale first:\n\n" +
"```python\n" +
"from sklearn.preprocessing import MinMaxScaler\n" +
"scaler = MinMaxScaler()\n" +
"train_scaled = scaler.fit_transform(train[['y']].values)\n" +
"# values now between 0 and 1\n" +
"```\n" +
"And invert the scaler when reporting MAE so you're back in MW.\n\n" +
"### 2. Window the data\n" +
"```text\n" +
"raw:   [d1, d2, d3, d4, d5, d6, d7, ...]\n" +
"\n" +
"with lookback=3:\n" +
"X[0] = [d1, d2, d3]   y[0] = d4\n" +
"X[1] = [d2, d3, d4]   y[1] = d5\n" +
"X[2] = [d3, d4, d5]   y[2] = d6\n" +
"```\n" +
"You slide a window of length `lookback` across the series. Each window is one training example. With ~4000 days and lookback=14, you get ~3986 training pairs.\n\n" +
"## Lookback choice\n" +
"- Too short (1-3 days) — model can't see the weekly cycle\n" +
"- Too long (200 days) — too many noisy inputs, hard to learn\n" +
"- Sweet spot for daily data with weekly seasonality: **14-30 days**\n\n" +
"You'll start with `lookback=14` (two weeks) so the model sees two complete weekly cycles per example."
      ),
      S([
        { prompt: "An LSTM's cell state + gates are what let it preserve information across long sequences (avoiding vanishing gradients).", answer: true, whenRight: "Right — the cell state is the memory line; the gates control what's kept, added, and emitted.", whenWrong: "Yes — that's exactly the LSTM's mechanism. The cell state survives backprop where a plain RNN's hidden state doesn't." },
        { prompt: "You can feed raw electricity demand values (in thousands of MW) directly into an LSTM.", answer: false, whenRight: "Right — no. Always scale first. Raw values blow up gradients and saturate activations.", whenWrong: "Always scale. Raw values in thousands make sigmoids saturate and gradients vanish or explode. MinMax or Standard scaling first." },
        { prompt: "Windowing turns a flat time series into many (X, y) training pairs where X is a fixed-length sequence.", answer: true, whenRight: "Right — slide a lookback-length window across the series. Each window = one training example.", whenWrong: "Yes — windowing is how you build training data from a single series. Lookback length is the window size." }
      ]),
      E("Your turn — frame the LSTM","[WRITE] In `notebooks/04-lstm.ipynb`:\n1. State why we use LSTM (not vanilla RNN).\n2. Choose your lookback (suggest: 14 days). Justify briefly.\n3. State the bar: ARIMA + Prophet MAEs from v0.2 and v0.3.")
    ]),
    D(2,"Prepare windowed data","Scale, window, batch.",[
      L("Building (X, y) tensors",
"## The full preparation\n" +
"```python\n" +
"import numpy as np, torch\n" +
"from sklearn.preprocessing import MinMaxScaler\n\n" +
"# 1. Scale on TRAIN ONLY, then transform train and test with the same scaler\n" +
"scaler = MinMaxScaler()\n" +
"train_arr = scaler.fit_transform(train[['y']].values).flatten()\n" +
"test_arr  = scaler.transform(test[['y']].values).flatten()\n\n" +
"# 2. Window into (X, y) pairs\n" +
"LOOKBACK = 14\n" +
"def make_windows(series, lookback):\n" +
"    X, y = [], []\n" +
"    for i in range(len(series) - lookback):\n" +
"        X.append(series[i:i + lookback])\n" +
"        y.append(series[i + lookback])\n" +
"    return np.array(X), np.array(y)\n\n" +
"X_train, y_train = make_windows(train_arr, LOOKBACK)\n" +
"X_test,  y_test  = make_windows(test_arr,  LOOKBACK)\n\n" +
"# 3. To PyTorch tensors. LSTM expects (batch, seq_len, features).\n" +
"X_train = torch.tensor(X_train, dtype=torch.float32).unsqueeze(-1)  # add feature dim\n" +
"y_train = torch.tensor(y_train, dtype=torch.float32).unsqueeze(-1)\n" +
"X_test  = torch.tensor(X_test,  dtype=torch.float32).unsqueeze(-1)\n" +
"y_test  = torch.tensor(y_test,  dtype=torch.float32).unsqueeze(-1)\n" +
"print(X_train.shape)\n" +
"# torch.Size([4019, 14, 1])   <- 4019 sequences, 14 days each, 1 feature\n" +
"```\n\n" +
"## Critical: scale on train only\n" +
"`scaler.fit_transform(train)`, then `scaler.transform(test)`. Fitting on the full series leaks future statistics into training — a subtle but common mistake.\n\n" +
"## Shape conventions PyTorch expects\n" +
"`(batch_size, sequence_length, n_features)`. For a univariate forecaster, n_features=1. `unsqueeze(-1)` adds that trailing dimension."
      ),
      L("See it in code (with output)",
"## Output shapes you should see\n" +
"```python\n" +
"print('Train X:', X_train.shape, 'y:', y_train.shape)\n" +
"print('Test  X:', X_test.shape,  'y:', y_test.shape)\n" +
"# Train X: torch.Size([4019, 14, 1]) y: torch.Size([4019, 1])\n" +
"# Test  X: torch.Size([1006, 14, 1]) y: torch.Size([1006, 1])\n\n" +
"# Sanity: first training example\n" +
"print(X_train[0].squeeze().numpy().round(3))\n" +
"# [0.421 0.412 0.398 0.385 0.367 0.340 0.349 ...]   <- 14 scaled values\n" +
"print(y_train[0].item())\n" +
"# 0.358   <- the next day, scaled\n" +
"```\n" +
"~4000 training sequences from one series. That's enough for an LSTM to learn structure without overfitting."
      ),
      S([
        { prompt: "You should fit the scaler on the train set ONLY, then transform both train and test with the same scaler.", answer: true, whenRight: "Right — fitting on all data leaks future statistics into training. Train-only fit + apply to test is the correct pattern.", whenWrong: "Always fit on train only. Fitting on all data leaks future info; the model 'cheats' on test." },
        { prompt: "PyTorch LSTM expects input shape (batch, seq_len, features).", answer: true, whenRight: "Right — three-dim tensor with batch first (default). For univariate forecasting features=1.", whenWrong: "Yes — three dims: batch first, then seq, then features. unsqueeze(-1) adds the trailing feature dim." },
        { prompt: "A lookback of 1 day works as well as 14 days for energy demand.", answer: false, whenRight: "Right — no. With lookback=1, the model can't see the weekly cycle. 14 is two complete weeks of context.", whenWrong: "Lookback=1 is essentially the persistence baseline. 14 gives the model enough history to see the weekly pattern." }
      ]),
      E("Your turn — prepare data","[CODE] In `notebooks/04-lstm.ipynb`:\n1. Fit MinMaxScaler on train['y'] only. Transform both train and test.\n2. Window with LOOKBACK=14.\n3. Convert to PyTorch tensors with shape (N, 14, 1) for X and (N, 1) for y.\n4. Print all four shapes.")
    ]),
    D(3,"Build the LSTM","One LSTM layer + a Linear head.",[
      L("The model architecture",
"## Minimal forecasting LSTM\n" +
"```python\n" +
"import torch.nn as nn\n\n" +
"class LSTMForecaster(nn.Module):\n" +
"    def __init__(self, input_size=1, hidden_size=32, num_layers=1):\n" +
"        super().__init__()\n" +
"        self.lstm = nn.LSTM(input_size, hidden_size,\n" +
"                            num_layers=num_layers, batch_first=True)\n" +
"        self.head = nn.Linear(hidden_size, 1)\n\n" +
"    def forward(self, x):\n" +
"        # x: (batch, seq_len, input_size)\n" +
"        out, _ = self.lstm(x)              # (batch, seq_len, hidden_size)\n" +
"        last  = out[:, -1, :]              # take final time step only\n" +
"        return self.head(last)             # (batch, 1)\n\n" +
"model = LSTMForecaster(hidden_size=32)\n" +
"print(sum(p.numel() for p in model.parameters()))\n" +
"# ~4385 parameters — small, won't overfit easily\n" +
"```\n\n" +
"## Why take only the last time step\n" +
"`out` has shape `(batch, seq_len, hidden_size)` — one hidden representation per time step in the sequence. For one-step-ahead forecasting, the most relevant representation is the LAST one (it has seen the entire sequence). Take `out[:, -1, :]` and project to 1 output.\n\n" +
"## Why batch_first=True\n" +
"PyTorch's default LSTM expects `(seq_len, batch, features)` which is counter-intuitive. `batch_first=True` makes it `(batch, seq_len, features)` — the same as your data tensors. Set this and stop fighting axis order.\n\n" +
"## hidden_size and num_layers\n" +
"- `hidden_size=32` — small. Enough capacity for a single-variable forecast with ~4000 examples. Bigger isn't always better.\n" +
"- `num_layers=1` — start here. Stacking more layers helps on big datasets, not small ones.\n\n" +
"## The parameter count check\n" +
"Print the parameter count. ~4k is right; if you see 400k, you've over-sized for this data and will overfit fast."
      ),
      L("See it in code (with output)",
"## Build + sanity check\n" +
"```python\n" +
"model = LSTMForecaster(input_size=1, hidden_size=32, num_layers=1)\n" +
"print(model)\n" +
"# LSTMForecaster(\n" +
"#   (lstm): LSTM(1, 32, batch_first=True)\n" +
"#   (head): Linear(in_features=32, out_features=1, bias=True)\n" +
"# )\n\n" +
"# Forward pass smoke test\n" +
"with torch.no_grad():\n" +
"    yhat = model(X_train[:4])\n" +
"print(yhat.shape)\n" +
"# torch.Size([4, 1])   <- batch of 4 inputs -> 4 predictions\n" +
"```"
      ),
      S([
        { prompt: "batch_first=True makes PyTorch's LSTM expect (batch, seq_len, features) instead of the default (seq_len, batch, features).", answer: true, whenRight: "Right — turns the counter-intuitive default into the natural shape. Use it always.", whenWrong: "Yes — set batch_first=True. Otherwise you spend hours flipping axes for no reason." },
        { prompt: "For one-step-ahead forecasting, you take the LAST time step's hidden state and project it to the output.", answer: true, whenRight: "Right — out[:, -1, :] then Linear -> 1. The last hidden has seen the whole sequence.", whenWrong: "Yes — last step output. It has the full sequence context. Earlier steps haven't seen the whole window yet." },
        { prompt: "Bigger hidden_size always means better forecasts.", answer: false, whenRight: "Right — no. Bigger model + small dataset = overfit. Start small (32-64), grow only if needed.", whenWrong: "Capacity > data = overfit. With ~4000 windows, hidden_size=32 is plenty. Don't start at 256." }
      ]),
      E("Your turn — build it","[CODE] In `notebooks/04-lstm.ipynb`:\n1. Define LSTMForecaster as above. hidden_size=32, num_layers=1.\n2. Instantiate the model.\n3. Print the model.\n4. Forward pass on X_train[:4] to confirm output shape (4, 1).")
    ]),
    D(4,"Train","Loss = MSE, optimiser = Adam, watch for overfit.",[
      L("The training loop",
"## Loop\n" +
"```python\n" +
"loss_fn  = nn.MSELoss()\n" +
"optim    = torch.optim.Adam(model.parameters(), lr=1e-3)\n" +
"epochs   = 30\n" +
"batch    = 64\n\n" +
"from torch.utils.data import DataLoader, TensorDataset\n" +
"loader = DataLoader(TensorDataset(X_train, y_train), batch_size=batch, shuffle=True)\n\n" +
"history = {'train': [], 'test': []}\n" +
"for ep in range(epochs):\n" +
"    model.train()\n" +
"    running = 0.0\n" +
"    for xb, yb in loader:\n" +
"        optim.zero_grad()\n" +
"        loss = loss_fn(model(xb), yb)\n" +
"        loss.backward()\n" +
"        optim.step()\n" +
"        running += loss.item() * len(xb)\n" +
"    train_loss = running / len(X_train)\n\n" +
"    model.eval()\n" +
"    with torch.no_grad():\n" +
"        test_loss = loss_fn(model(X_test), y_test).item()\n\n" +
"    history['train'].append(train_loss)\n" +
"    history['test'].append(test_loss)\n" +
"    if ep % 5 == 0:\n" +
"        print(f'ep {ep:2d}  train {train_loss:.5f}  test {test_loss:.5f}')\n" +
"```\n\n" +
"## What loss should look like\n" +
"Both train and test loss drop together for the first ~10 epochs. Then test loss flattens or starts rising while train loss keeps falling — that's **overfit**. Stop there (early stopping).\n\n" +
"```text\n" +
"ep  0  train 0.04212  test 0.04501\n" +
"ep  5  train 0.00890  test 0.00921\n" +
"ep 10  train 0.00604  test 0.00643   <- still improving\n" +
"ep 15  train 0.00521  test 0.00638   <- test stalling\n" +
"ep 20  train 0.00482  test 0.00645   <- test rising -> overfit\n" +
"```\n\n" +
"## Why shuffle=True on the loader\n" +
"Within a training epoch, batch order should be random — gradients become less correlated, generalisation improves. The CHRONOLOGICAL split (train = early dates, test = late dates) stays intact; only batches WITHIN train are shuffled."
      ),
      L("See it in code (with output)",
"## Train + watch the curves\n" +
"```python\n" +
"# After the loop\n" +
"import matplotlib.pyplot as plt\n" +
"plt.plot(history['train'], label='train')\n" +
"plt.plot(history['test'],  label='test')\n" +
"plt.xlabel('epoch'); plt.ylabel('MSE')\n" +
"plt.legend(); plt.tight_layout()\n" +
"plt.savefig('charts/lstm_loss.png', dpi=150); plt.close()\n" +
"print('Final test MSE:', round(history['test'][-1], 6))\n" +
"# Final test MSE: 0.00642\n" +
"```"
      ),
      S([
        { prompt: "MSE is the standard loss for regression-style LSTM forecasting.", answer: true, whenRight: "Right — predict a real-valued next step, minimise (y - yhat)^2. Standard choice.", whenWrong: "Yes — MSE for continuous targets. MAE works too but MSE has nicer gradients." },
        { prompt: "Shuffling batches within an epoch breaks the chronological order of the underlying time series.", answer: false, whenRight: "Right — no. The chronological train/test SPLIT stays. Only the order batches are SAMPLED within train is shuffled. Each batch still contains complete windowed examples in proper order.", whenWrong: "Shuffle is fine — the windows are self-contained. The chronological split between train and test is what matters; batch order within train doesn't break causality." },
        { prompt: "If test loss flattens while train loss keeps falling, you're overfitting and should stop training.", answer: true, whenRight: "Right — the textbook overfit signature. Save the model from the epoch where test loss was lowest.", whenWrong: "Yes — that divergence is overfit. Stop, or use early stopping to roll back to the best epoch automatically." }
      ]),
      E("Your turn — train","[CODE] In `notebooks/04-lstm.ipynb`:\n1. Build loss_fn = MSELoss, optim = Adam(lr=1e-3).\n2. Wrap (X_train, y_train) in DataLoader(batch_size=64, shuffle=True).\n3. Train 30 epochs, recording train + test loss per epoch.\n4. Plot the two curves to charts/lstm_loss.png.\n5. Note the epoch where test loss bottoms out.")
    ]),
    D(5,"Evaluate + inverse-scale","Back to MW and compare to ARIMA / Prophet.",[
      L("Predicting + inverse scaling",
"## The full eval\n" +
"```python\n" +
"model.eval()\n" +
"with torch.no_grad():\n" +
"    preds_scaled = model(X_test).numpy().flatten()\n\n" +
"# Inverse-scale BOTH predictions and actuals back to MW\n" +
"preds_mw  = scaler.inverse_transform(preds_scaled.reshape(-1, 1)).flatten()\n" +
"actual_mw = scaler.inverse_transform(y_test.numpy().reshape(-1, 1)).flatten()\n\n" +
"from sklearn.metrics import mean_absolute_error\n" +
"mae_lstm = mean_absolute_error(actual_mw, preds_mw)\n" +
"print(f'LSTM MAE: {mae_lstm:.0f} MW')\n" +
"# LSTM MAE: 654 MW\n" +
"```\n\n" +
"## Forgetting to inverse-scale is the #1 bug here\n" +
"If you compute MAE on scaled values (0-1), you get a misleadingly tiny number that's not comparable to ARIMA's MAE (706 MW) or Prophet's (612 MW). Always inverse-transform predictions AND ground truth back to original units before reporting MAE.\n\n" +
"## What the LSTM number actually means\n" +
"```text\n" +
"Persistence:  868 MW\n" +
"ARIMA:        706 MW\n" +
"Prophet:      612 MW\n" +
"LSTM:         654 MW   <- close to Prophet, beats ARIMA\n" +
"```\n" +
"LSTM is competitive with Prophet but doesn't dominate. That's typical for a small dataset where Prophet's domain priors (holidays + seasonality) hard-encoded carry it past a model that has to learn everything from data."
      ),
      L("See it in code (with output)",
"## Side-by-side\n" +
"```python\n" +
"import joblib\n" +
"from sklearn.metrics import mean_absolute_error\n\n" +
"# Load v0.2 and v0.3 models\n" +
"arima  = joblib.load('models/arima.pkl')\n" +
"prophet = joblib.load('models/prophet.pkl')\n\n" +
"# Test slice aligned for all three\n" +
"# (Each model produces a forecast for the same dates.)\n" +
"comparison = pd.DataFrame({\n" +
"    'date':     test['ds'].iloc[LOOKBACK:].values,\n" +
"    'actual':   actual_mw,\n" +
"    'arima':    arima.predict(n_periods=len(test))[LOOKBACK:],\n" +
"    'prophet':  prophet.predict(prophet.make_future_dataframe(periods=len(test), freq='D')).iloc[-len(test) + LOOKBACK:]['yhat'].values,\n" +
"    'lstm':     preds_mw,\n" +
"})\n" +
"for col in ['arima', 'prophet', 'lstm']:\n" +
"    print(f'{col:8s} MAE: {mean_absolute_error(comparison.actual, comparison[col]):.0f}')\n" +
"# arima    MAE: 706\n" +
"# prophet  MAE: 612\n" +
"# lstm     MAE: 654\n" +
"```"
      ),
      S([
        { prompt: "Computing MAE on scaled (0-1) values gives a number directly comparable to ARIMA's MAE in MW.", answer: false, whenRight: "Right — no. Scaled MAE is in scaled units, not MW. Always inverse-transform before reporting.", whenWrong: "Inverse-scale first. MAE on 0-1 values is meaningless next to ARIMA's MW units. Apples-to-apples means all in MW." },
        { prompt: "An LSTM doesn't always beat Prophet — especially on small datasets with strong calendar effects.", answer: true, whenRight: "Right — Prophet's hard-coded priors carry it past models that have to learn everything from scratch.", whenWrong: "Yes — LSTMs need more data than Prophet on calendar-heavy series. Small data + strong priors = Prophet wins." },
        { prompt: "Always call `model.eval()` and wrap inference in `torch.no_grad()` for prediction speed and to avoid building a backward graph.", answer: true, whenRight: "Right — eval() turns off dropout/batchnorm-training behaviour; no_grad() skips gradient bookkeeping. Faster + lighter.", whenWrong: "Yes — eval() + no_grad() for inference. Saves memory and avoids accidentally training during forecasting." }
      ]),
      E("Your turn — evaluate","[CODE] In `notebooks/04-lstm.ipynb`:\n1. Predict with model.eval() and torch.no_grad().\n2. Inverse-transform predictions AND actuals back to MW.\n3. Compute LSTM MAE.\n4. Load arima.pkl and prophet.pkl; compute their MAEs on the same test period.\n5. Print all three MAEs.")
    ]),
    D(6,"Three-way plot","ARIMA vs Prophet vs LSTM, on one chart.",[
      L("The head-to-head visualisation",
"## What it is\n" +
"```python\n" +
"import matplotlib.pyplot as plt\n\n" +
"plt.figure(figsize=(13, 4.5))\n" +
"plt.plot(comparison.date, comparison.actual,  label='actual',  color='#1f2937', lw=1.5)\n" +
"plt.plot(comparison.date, comparison.arima,   label='ARIMA',   color='#ef4444', lw=1)\n" +
"plt.plot(comparison.date, comparison.prophet, label='Prophet', color='#22c55e', lw=1)\n" +
"plt.plot(comparison.date, comparison.lstm,    label='LSTM',    color='#3b82f6', lw=1)\n" +
"plt.title('AEP daily demand — three models on the same test period')\n" +
"plt.ylabel('MW'); plt.legend(); plt.tight_layout()\n" +
"plt.savefig('charts/three_way.png', dpi=150); plt.close()\n" +
"```\n\n" +
"## What the chart should show\n" +
"- Actual (dark line) is the ground truth.\n" +
"- Around weekly cycles, all three should track closely.\n" +
"- Around holidays, **Prophet leans further down** because it learned the holiday effect explicitly.\n" +
"- During heatwaves or unusual stretches, **LSTM can adapt** because it learned non-linear dynamics.\n" +
"- **ARIMA tends to smooth** — close on average, but misses extremes.\n\n" +
"## The honest framing\n" +
"No model dominates everywhere. The chart turns 'which is best?' into 'where does each excel?' That's the answer a senior data scientist gives — not 'LSTM won.'"
      ),
      L("The findings table",
"## What you'll quote in the README\n" +
"```text\n" +
"Model        Test MAE    Strength                             Weakness\n" +
"-----------  ---------   -----------------------------------  ----------------------------------\n" +
"Persistence  868 MW      Free, no model                       Misses every trend or seasonal swing\n" +
"ARIMA        706 MW      Captures weekly cycle + short memory  Treats holidays as noise\n" +
"Prophet      612 MW      Explicit holidays + components        Linear assumptions on trend\n" +
"LSTM         654 MW      Learns non-linear dynamics            Needs more data; opaque to stakeholders\n" +
"```\n\n" +
"## Why all four matter\n" +
"Showing the **whole ladder** (including the worst model) is more convincing than just showing the winner. It demonstrates you ran a fair comparison and have a defensible reason to ship the model you chose.\n\n" +
"## What you ship\n" +
"For this project, **Prophet** is the model that goes to production (smallest MAE on holiday-heavy energy series, interpretable for the grid operator audience). LSTM goes in the repo as a documented alternative.\n\n" +
"Reality check: in some industries (high-stakes finance, where uncertainty intervals matter most), ARIMA wins despite worse MAE. Don't pick on MAE alone."
      ),
      S([
        { prompt: "On a head-to-head chart, no single model usually wins everywhere — each has a regime where it excels.", answer: true, whenRight: "Right — that's the honest framing. The chart turns 'best' into 'best for what'.", whenWrong: "Yes — different models excel in different regimes. Honest comparison shows that, not 'this one wins'." },
        { prompt: "You should ship the model with the lowest MAE without considering stakeholder needs.", answer: false, whenRight: "Right — no. MAE matters; so do uncertainty intervals, interpretability, latency, retraining cost. Pick on the whole picture.", whenWrong: "MAE is one factor. Audience, interpretability, intervals, retraining cost matter too. Pick by all of them." },
        { prompt: "Showing ARIMA, Prophet, and LSTM in one chart is more convincing than reporting only the winner.", answer: true, whenRight: "Right — the full ladder demonstrates a fair comparison and defensible pick. Hiding losers looks suspicious.", whenWrong: "Yes — full ladder = honest. Hiding the runners-up makes a reviewer wonder what you're omitting." }
      ]),
      E("Your turn — three-way chart","[CODE] 1. Build the comparison DataFrame (date, actual, arima, prophet, lstm).\n2. Plot all four lines on one chart. Save to `charts/three_way.png`.\n3. Write a findings table (Model, MAE, Strength, Weakness) in a markdown cell.")
    ]),
    D(7,"Ship v0.4","Save the LSTM, write the comparison, tag.",[
      L("Shipping v0.4",
"## What goes in the README\n" +
"```text\n" +
"## v0.4 — LSTM (PyTorch) and three-way comparison\n" +
"All on the same chronological 80/20 split:\n" +
"  Persistence: 868 MW\n" +
"  ARIMA:       706 MW\n" +
"  Prophet:     612 MW   ← shipping this one\n" +
"  LSTM:        654 MW\n\n" +
"Why Prophet for production:\n" +
"  - Lowest MAE on this holiday-heavy series\n" +
"  - Interpretable components plot for the grid-operator audience\n" +
"  - Explicit uncertainty intervals\n" +
"  - LSTM is in the repo as a documented alternative\n\n" +
"Charts: charts/three_way.png, charts/prophet_components.png, charts/lstm_loss.png\n" +
"```\n\n" +
"## Save the LSTM\n" +
"```python\n" +
"torch.save(model.state_dict(), 'models/lstm.pt')\n" +
"# scaler too — predictions need it to inverse-transform later\n" +
"import joblib; joblib.dump(scaler, 'models/lstm_scaler.pkl')\n" +
"```\n" +
"Save BOTH the model weights AND the scaler. Loading the model later without the scaler is useless — the predictions come out scaled and you can't recover the MW units.\n\n" +
"```bash\n" +
"git add notebooks/04-lstm.ipynb charts/ models/lstm.pt models/lstm_scaler.pkl README.md\n" +
"git commit -m \"Energy Forecast v0.4: LSTM + three-way comparison; shipping Prophet\"\n" +
"git tag v0.4\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## What this milestone proves\n" +
"You can fit a deep-learning model on a time series, evaluate it honestly against classical baselines, and make a defensible production choice. That sequence — frame, model, compare, choose, ship — is exactly the workflow a senior data scientist runs."
      ),
      S([
        { prompt: "You must save BOTH the LSTM weights AND the fitted scaler — predictions are useless without inverse-scaling.", answer: true, whenRight: "Right — joblib.dump(scaler), torch.save(model.state_dict()). Lose the scaler, lose the ability to report MW.", whenWrong: "Yes — both. The scaler is part of the model effectively. Predictions inverse-transform through it." },
        { prompt: "Shipping Prophet (not the lowest-MAE possible model in absolute terms) is acceptable when interpretability + intervals matter more.", answer: true, whenRight: "Right — pick by the whole story. Prophet's intervals + components plot earn it the production slot here.", whenWrong: "Yes — you pick by full requirements, not just MAE. Interpretability and intervals are real production needs." },
        { prompt: "v0.4 ships the LSTM as the production model.", answer: false, whenRight: "Right — no. The README explicitly picks Prophet for production. LSTM stays in repo as a documented alternative.", whenWrong: "Prophet wins on this dataset; LSTM is a documented alternative. The repo holds both; production runs Prophet." }
      ]),
      E("Your turn — ship v0.4","[PRODUCE] 1. torch.save(model.state_dict(), 'models/lstm.pt') and joblib.dump(scaler, 'models/lstm_scaler.pkl').\n2. README v0.4 with the full ladder (Persistence/ARIMA/Prophet/LSTM MAEs), the production pick + reasoning, chart links.\n3. Commit + tag:\n`git add . && git commit -m 'v0.4: LSTM + three-way comparison'`\n`git tag v0.4 && git push --tags`\n\nPASS:\n[x] Windowed data + scaling done correctly (train-only fit)\n[x] LSTM trained, loss curves saved\n[x] LSTM MAE in MW (after inverse-scaling)\n[x] Three-way comparison chart saved\n[x] Production-model choice + reasoning in README\n[x] v0.4 tag pushed")
    ])
  ]
};

/* ════ WEEK 25 — MLOps: MLflow + drift monitoring ════ */
const W25 = {
  number: 25, title: "MLOps — MLflow + drift monitoring",
  phase: "Production", commitment_hours: "12-18",
  context: ds.weeks[24].context,
  concept_check: [
    { q: "What does MLflow give you that a notebook + saved .pkl files don't?",
      choices: ["Nothing meaningful","A tracking server that records every experiment (params, metrics, artefacts) and a model registry so any past run is reproducible and any model is loadable by name + version",
        "Faster training","Built-in models"],
      correct: 1, explain: "MLflow does four things: tracks experiments (every hyperparameter + metric of every run), stores artefacts (saved models, charts), provides a UI to compare runs, and has a model registry where production models live by name + version + stage (Staging/Production). Notebooks lose all of this when you re-run them." },
    { q: "What is 'data drift', and why does it eventually break a model?",
      choices: ["Data files get corrupted","The distribution of inputs in production diverges from the training distribution, so the model's learned relationships no longer apply",
        "The server crashes","Pandas versions change"],
      correct: 1, explain: "Models learn relationships between input distributions and outputs. When inputs shift (new customer segment, seasonal change, sensor drift), the relationships the model learned no longer match reality. The model still PRODUCES predictions; they're just systematically wrong now. Drift detection catches this BEFORE the wrong predictions cause damage." },
    { q: "Why use the KS (Kolmogorov-Smirnov) test to detect drift?",
      choices: ["It's the only available option","Non-parametric — works without assuming a distribution; compares two empirical CDFs and returns a small p-value when they differ significantly",
        "Required by MLflow","To beat ARIMA"],
      correct: 1, explain: "KS compares two distributions by their empirical cumulative distribution functions. No assumption of normality, no parameter to choose — just 'how different are these two samples?'. Small p-value = they're meaningfully different. Run KS between a sliding window of recent inputs and a fixed reference window from training data; raise an alert when p drops below a threshold." }
  ],
  days: [
    D(1,"Why MLOps","Models in notebooks are toys. Models in production rot.",[
      L("MLOps — the day-2 problem",
"## What it is\n" +
"You've built four models (persistence, ARIMA, Prophet, LSTM) and chose Prophet for production. That's Day 1 work. **MLOps is everything that happens after that** — the discipline of running the model in production reliably:\n\n" +
"- **Experiment tracking** — every run's parameters, metrics, and outputs are recorded forever, not lost when you re-run the notebook.\n" +
"- **Model registry** — production models live in one place, with a name + version + lifecycle stage (Staging / Production / Archived).\n" +
"- **Drift detection** — alarms when the distribution of inputs in production drifts away from training data.\n" +
"- **Retraining** — when drift fires, you retrain on fresh data and promote a new model version.\n" +
"- **Observability** — dashboards that show forecast accuracy, prediction latency, request volume.\n\n" +
"## Why this matters for Energy Forecast\n" +
"The Prophet model was trained on 2004-2017 data. Demand patterns in 2024 look different: more solar means daytime demand drops; more EVs means evening demand rises. A model frozen in 2017 silently mis-forecasts 2024. Drift detection is what tells you it's time to retrain.\n\n" +
"## What you'll do this week\n" +
"1. Install MLflow locally and start its tracking server.\n" +
"2. Log every Prophet experiment (params, MAE, the saved model).\n" +
"3. Compare runs in the MLflow UI.\n" +
"4. Compute drift between training-period and held-out-period demand.\n" +
"5. Wire a simple alert that fires when drift crosses a threshold.\n" +
"6. Ship as `mlops-w1`.\n\n" +
"## The shift in mindset\n" +
"Up to now: 'I built a model that scores X on the test set.' From here: 'I built a model that's monitored, versioned, and replaceable when it stops working.' That second framing is what working data scientists actually do."
      ),
      V("MLOps explained simply","https://www.youtube.com/watch?v=Z6KZBvLkroI",13,"various","Watch first. Frames why notebooks + saved files don't survive contact with production and what MLOps tools add."),
      L("MLOps in three concrete habits",
"## 1. Every experiment is logged\n" +
"When you change a hyperparameter and rerun, the old result doesn't disappear. MLflow stores every run with its parameters, metrics, and artefacts. You can answer 'what was the MAE on the run with `seasonality_prior_scale=15`?' six months later.\n\n" +
"## 2. Every production model has a version\n" +
"Models aren't files on a laptop — they're registered artefacts with names, versions, and stages. `EnergyForecast/Production` resolves to a specific version that's been promoted by you (or by CI). Rollback is a single API call.\n\n" +
"## 3. Inputs are monitored\n" +
"Drift detection runs continuously. When the distribution of recent inputs differs significantly from training distribution, an alert fires. You investigate, decide whether to retrain, and promote a new model version if needed.\n\n" +
"## Why this is hireable\n" +
"Most data scientists can train a model. Far fewer can describe what happens next. Showing MLflow tracking + drift monitoring on your portfolio answers the 'and then what?' question that separates a junior from a senior."
      ),
      S([
        { prompt: "MLOps is mainly about training better models.", answer: false, whenRight: "Right — no. MLOps is the discipline of running, monitoring, and replacing models in production. Training quality is mostly upstream.", whenWrong: "MLOps is post-training. Tracking, registry, drift, retraining — the lifecycle, not the modelling." },
        { prompt: "A model trained in 2017 will still work in 2024 if the data pipeline is unchanged.", answer: false, whenRight: "Right — no. Input distributions drift over years (EVs, solar, behaviour). The pipeline can be perfect; the model still mis-forecasts.", whenWrong: "Models age. Even with a perfect pipeline, drift in input distributions makes 2017's relationships wrong for 2024." },
        { prompt: "MLflow stores every experiment with its parameters and metrics so you can compare runs later.", answer: true, whenRight: "Right — that's exactly the experiment-tracking piece. Compare runs in the UI, find the best by metric.", whenWrong: "Yes — that's MLflow's tracking. Every run logged with params + metrics + artefacts. Compareable forever." }
      ]),
      E("Your turn — frame MLOps","[WRITE] In `notebooks/05-mlops.ipynb`:\n1. Define the three MLOps habits in your own words.\n2. List two ways the AEP Prophet model could silently mis-forecast in 2024 vs 2017.\n3. State this week's bar: 'I will be able to compare three Prophet runs side by side and detect drift in the test period.'")
    ]),
    D(2,"Install + start MLflow","Local tracking server in two commands.",[
      L("Setting up MLflow",
"## Install + start\n" +
"```bash\n" +
"pip install mlflow\n" +
"mlflow ui --port 5000\n" +
"```\n\n" +
"That opens MLflow's web UI at `http://localhost:5000`. Initially empty — no runs yet.\n\n" +
"## What gets stored where\n" +
"By default MLflow writes everything to `./mlruns/` in the current directory:\n" +
"- `mlruns/0/<run-id>/params/...` — every parameter\n" +
"- `mlruns/0/<run-id>/metrics/...` — every metric logged over time\n" +
"- `mlruns/0/<run-id>/artifacts/...` — saved files (models, charts)\n" +
"- `mlruns/0/<run-id>/meta.yaml` — run metadata\n\n" +
"For a real team you'd point at a remote tracking server (S3 / Postgres) — but local file storage is perfect for a learner project.\n\n" +
"## .gitignore the mlruns folder\n" +
"```\n" +
"# .gitignore\n" +
"mlruns/\n" +
"```\n" +
"It can grow to gigabytes with model artefacts. Keep it local; the production registry would be remote anyway.\n\n" +
"## The Python client\n" +
"```python\n" +
"import mlflow\n" +
"mlflow.set_tracking_uri('http://localhost:5000')\n" +
"mlflow.set_experiment('EnergyForecast')\n" +
"```\n" +
"From here every `with mlflow.start_run(): ...` block creates a new run, ready to log params and metrics."
      ),
      L("See it in code (with output)",
"## Smoke test — log a fake run\n" +
"```python\n" +
"import mlflow\n" +
"mlflow.set_tracking_uri('http://localhost:5000')\n" +
"mlflow.set_experiment('EnergyForecast')\n\n" +
"with mlflow.start_run(run_name='smoke-test'):\n" +
"    mlflow.log_param('changepoint_prior_scale', 0.05)\n" +
"    mlflow.log_metric('mae_mw', 612.0)\n" +
"print('Run logged — refresh http://localhost:5000')\n" +
"```\n\n" +
"Open the UI. You should see one experiment 'EnergyForecast' with one run 'smoke-test' showing param `changepoint_prior_scale=0.05` and metric `mae_mw=612.0`. If you see that, you're ready for the real runs tomorrow."
      ),
      S([
        { prompt: "By default, MLflow stores runs in a local mlruns/ folder you can .gitignore.", answer: true, whenRight: "Right — local files, easy to start, easy to ignore. Production teams swap in S3 + Postgres.", whenWrong: "Yes — local mlruns/. Add it to .gitignore (artefacts can be huge). Production uses remote storage." },
        { prompt: "`mlflow ui --port 5000` opens the experiment-tracking web UI.", answer: true, whenRight: "Right — and then you point your Python client at http://localhost:5000 with set_tracking_uri.", whenWrong: "Yes — that command runs the UI server. Your scripts log via set_tracking_uri to the same URL." },
        { prompt: "Logging a parameter and a metric is enough to make a run appear in the MLflow UI.", answer: true, whenRight: "Right — `with start_run(): log_param(...); log_metric(...)` is the minimal viable run. The UI shows it immediately.", whenWrong: "Yes — that's the minimum. Once params and metrics are logged inside a start_run block, the UI knows about it." }
      ]),
      E("Your turn — start MLflow","[CODE] 1. `pip install mlflow`.\n2. In a separate terminal: `mlflow ui --port 5000`.\n3. Add `mlruns/` to .gitignore.\n4. Log a smoke-test run with one param + one metric using set_tracking_uri + set_experiment + start_run.\n5. Refresh the UI to confirm the run appears.")
    ]),
    D(3,"Track three Prophet experiments","Sweep the prior scale, log every run.",[
      L("Tracking hyperparameter sweeps",
"## What it is\n" +
"Sweep Prophet's `changepoint_prior_scale` — the hyperparameter that controls how flexible the trend is — and log every value's MAE.\n\n" +
"```python\n" +
"import mlflow, joblib\n" +
"from prophet import Prophet\n" +
"from sklearn.metrics import mean_absolute_error\n" +
"import pandas as pd\n\n" +
"daily = pd.read_parquet('data/aep_daily.parquet')\n" +
"df = daily.rename_axis('ds').reset_index().rename(columns={'demand': 'y'})[['ds','y']]\n" +
"split = int(len(df) * 0.8)\n" +
"train, test = df.iloc[:split], df.iloc[split:]\n\n" +
"mlflow.set_experiment('EnergyForecast')\n\n" +
"for prior in [0.01, 0.05, 0.5]:\n" +
"    with mlflow.start_run(run_name=f'prophet-cps={prior}'):\n" +
"        m = Prophet(weekly_seasonality=True, yearly_seasonality=True,\n" +
"                    daily_seasonality=False, changepoint_prior_scale=prior)\n" +
"        m.add_country_holidays(country_name='US')\n" +
"        m.fit(train)\n" +
"        future = m.make_future_dataframe(periods=len(test), freq='D')\n" +
"        forecast = m.predict(future)\n" +
"        preds = forecast.loc[forecast['ds'].isin(test['ds']), 'yhat'].values\n" +
"        mae = mean_absolute_error(test['y'].values, preds)\n\n" +
"        mlflow.log_param('changepoint_prior_scale', prior)\n" +
"        mlflow.log_metric('mae_mw', mae)\n" +
"        joblib.dump(m, f'models/prophet_cps_{prior}.pkl')\n" +
"        mlflow.log_artifact(f'models/prophet_cps_{prior}.pkl', 'model')\n" +
"        print(f'cps={prior}  MAE={mae:.0f}')\n" +
"```\n\n" +
"## What `changepoint_prior_scale` does\n" +
"It's a regularisation on trend flexibility:\n" +
"- **0.01** — almost-rigid trend. Underfits sharp shifts.\n" +
"- **0.05** — Prophet's default. Good middle ground.\n" +
"- **0.5** — very flexible. Captures recent shifts but risks overfit.\n\n" +
"Sweeping shows you whether the default was correct or whether a different value beats it. With MLflow logging every run, the comparison is in the UI."
      ),
      L("See it in code (with output)",
"## What you'll see\n" +
"```text\n" +
"cps=0.01  MAE=678\n" +
"cps=0.05  MAE=612   <- default wins here\n" +
"cps=0.5   MAE=634\n" +
"```\n\n" +
"Then refresh the MLflow UI → EnergyForecast experiment → you see three runs side by side. Click 'Compare' to plot MAE vs `changepoint_prior_scale`. The flexibility sweet spot at 0.05 is visible immediately.\n\n" +
"## Why this is a real workflow win\n" +
"Without MLflow, you'd manually copy MAE numbers into a notebook cell and compare by eye. With MLflow, the sweep is in the UI forever, comparable to next month's sweep, and the saved models are downloadable by clicking the run."
      ),
      S([
        { prompt: "`mlflow.log_artifact(path)` uploads a file (e.g. a saved model) to that run's storage.", answer: true, whenRight: "Right — files attached to a run. Downloadable later by clicking the run in the UI.", whenWrong: "Yes — log_artifact stores files alongside the run. Saved models, charts, anything. Reachable from the UI." },
        { prompt: "Higher changepoint_prior_scale always means a better Prophet model.", answer: false, whenRight: "Right — no. Higher = more flexible trend, which can overfit. There's a sweet spot.", whenWrong: "More flexibility helps until it overfits. There's a U-shaped sweet spot; the sweep finds it." },
        { prompt: "MLflow's Compare view lets you plot a metric against a parameter across all logged runs.", answer: true, whenRight: "Right — select runs in the UI, hit Compare, choose metric + param axes. Instant sweep visualisation.", whenWrong: "Yes — the Compare view does sweep visualisation for free. Select runs, plot metric vs param." }
      ]),
      E("Your turn — sweep","[CODE] In `notebooks/05-mlops.ipynb`:\n1. Sweep changepoint_prior_scale in {0.01, 0.05, 0.5}.\n2. For each, fit Prophet, predict, compute MAE.\n3. Log each as its own MLflow run with the prior as a param, MAE as a metric, and the saved model as an artifact.\n4. Open the UI Compare view and screenshot the param vs MAE plot.")
    ]),
    D(4,"Compare runs in the UI","Pick the best run programmatically.",[
      L("Programmatic comparison",
"## Why programmatic\n" +
"Visual comparison in the UI is great for exploration. **Programmatic** comparison is what you use in CI/CD: 'find the lowest-MAE run for this experiment and promote it to Production.'\n\n" +
"```python\n" +
"from mlflow.tracking import MlflowClient\n" +
"client = MlflowClient()\n\n" +
"exp = client.get_experiment_by_name('EnergyForecast')\n" +
"runs = client.search_runs(\n" +
"    experiment_ids=[exp.experiment_id],\n" +
"    order_by=['metrics.mae_mw ASC'],\n" +
"    max_results=3,\n" +
")\n" +
"best = runs[0]\n" +
"print(f'Best run: {best.info.run_id}')\n" +
"print(f'  cps  = {best.data.params[\"changepoint_prior_scale\"]}')\n" +
"print(f'  MAE  = {best.data.metrics[\"mae_mw\"]:.0f}')\n" +
"# Best run: 7f1c...\n" +
"#   cps  = 0.05\n" +
"#   MAE  = 612\n" +
"```\n\n" +
"## Registering a model\n" +
"Promote the best run's model into the registry:\n" +
"```python\n" +
"mlflow.register_model(\n" +
"    model_uri=f'runs:/{best.info.run_id}/model',\n" +
"    name='EnergyForecast',\n" +
")\n" +
"```\n\n" +
"Now `EnergyForecast` is a registered model. Each registration becomes a new version (1, 2, 3...). You promote a version through stages (None → Staging → Production → Archived):\n\n" +
"```python\n" +
"client.transition_model_version_stage(\n" +
"    name='EnergyForecast', version=1, stage='Production'\n" +
")\n" +
"```\n\n" +
"## The production loadable URI\n" +
"```python\n" +
"import mlflow\n" +
"model = mlflow.pyfunc.load_model('models:/EnergyForecast/Production')\n" +
"```\n" +
"That URI doesn't change as you promote new versions. Your production code stays identical; promotion is a single API call. Rollback (revert to v1) is also one call."
      ),
      L("See it in code (with output)",
"## Build the leaderboard\n" +
"```python\n" +
"import pandas as pd\n" +
"rows = []\n" +
"for r in client.search_runs([exp.experiment_id], order_by=['metrics.mae_mw ASC']):\n" +
"    rows.append({\n" +
"        'run_id':   r.info.run_id[:8],\n" +
"        'cps':      r.data.params.get('changepoint_prior_scale'),\n" +
"        'mae_mw':   r.data.metrics.get('mae_mw'),\n" +
"        'name':     r.data.tags.get('mlflow.runName'),\n" +
"    })\n" +
"print(pd.DataFrame(rows))\n" +
"#      run_id     cps  mae_mw          name\n" +
"# 0  7f1c2d3e   0.05   612.0  prophet-cps=0.05\n" +
"# 1  a8b9c0d1    0.5   634.0  prophet-cps=0.5\n" +
"# 2  e5f6a7b8   0.01   678.0  prophet-cps=0.01\n" +
"```"
      ),
      S([
        { prompt: "MlflowClient().search_runs() with order_by lets you pull the best run programmatically.", answer: true, whenRight: "Right — sortable query in the tracking store. The basis of CI auto-promotion.", whenWrong: "Yes — programmatic search is the CI/CD primitive. You don't visually scan; you sort." },
        { prompt: "Loading from `models:/EnergyForecast/Production` returns whichever version is currently in Production stage.", answer: true, whenRight: "Right — stage-based URIs decouple production code from specific versions. Promotion = one API call.", whenWrong: "Yes — the URI binds to a stage, not a version. Promotion / rollback don't touch your production code." },
        { prompt: "Once a version is in Production, you can't roll back to an older version.", answer: false, whenRight: "Right — no. Rollback is `transition_model_version_stage(version=N-1, stage='Production')`. One call.", whenWrong: "Rollback is trivial — transition a previous version back to Production. The stage URI silently follows." }
      ]),
      E("Your turn — programmatic best","[CODE] In `notebooks/05-mlops.ipynb`:\n1. Use MlflowClient to find the lowest-MAE run.\n2. Register that run's model as 'EnergyForecast'.\n3. Transition v1 to 'Production' stage.\n4. Load with `mlflow.pyfunc.load_model('models:/EnergyForecast/Production')` and predict one point.")
    ]),
    D(5,"Detect data drift","KS test between training and held-out distributions.",[
      L("Drift detection with the KS test",
"## What you're testing\n" +
"Two samples: a **reference** (distribution from training data) and a **current** (distribution from recent production data). KS asks: are these two empirical distributions meaningfully different?\n\n" +
"```python\n" +
"from scipy.stats import ks_2samp\n\n" +
"reference = train['y'].values            # what the model learned on\n" +
"current   = test['y'].iloc[-90:].values  # last 90 days of held-out\n" +
"stat, p = ks_2samp(reference, current)\n" +
"print(f'KS stat={stat:.4f}, p={p:.4f}')\n" +
"# KS stat=0.1124, p=0.0008\n" +
"# Small p -> distributions are significantly different -> drift\n" +
"```\n\n" +
"## What the numbers mean\n" +
"- **KS stat** — the largest gap between the two empirical CDFs. Bigger = more different.\n" +
"- **p-value** — probability of seeing a gap this large if the distributions were actually the same. Small p (< 0.01 is a common alert threshold) means 'these distributions are NOT the same.'\n\n" +
"## Why KS specifically\n" +
"- **Non-parametric** — no assumption that the data is normal.\n" +
"- **Works on any continuous variable** — demand in MW, temperature, prices.\n" +
"- **Simple to explain** to non-statisticians ('the two distributions look meaningfully different').\n\n" +
"For categorical inputs you'd use a chi-square test instead — same principle, different test.\n\n" +
"## The reference window\n" +
"In production, you'd fix the reference to training-period data (or a known-good baseline period). The current window slides forward each day. When KS crosses the threshold, an alert fires."
      ),
      L("See it in code (with output)",
"## Detect drift across the test period\n" +
"```python\n" +
"import numpy as np\n" +
"from scipy.stats import ks_2samp\n\n" +
"reference = train['y'].values\n" +
"window_days = 60\n" +
"alerts = []\n" +
"for i in range(window_days, len(test)):\n" +
"    current = test['y'].iloc[i - window_days:i].values\n" +
"    stat, p = ks_2samp(reference, current)\n" +
"    if p < 0.01:\n" +
"        alerts.append({\n" +
"            'date_end': test['ds'].iloc[i],\n" +
"            'ks_stat':  round(stat, 4),\n" +
"            'p':        round(p, 5),\n" +
"        })\n\n" +
"print(f'Total alerts: {len(alerts)}')\n" +
"for a in alerts[:5]:\n" +
"    print(a)\n" +
"# Total alerts: 47\n" +
"# {'date_end': '2017-12-04', 'ks_stat': 0.142, 'p': 0.00031}\n" +
"# {'date_end': '2018-01-22', 'ks_stat': 0.171, 'p': 0.00002}\n" +
"# ...\n" +
"```\n\n" +
"## What to do with this\n" +
"Most of these will cluster around real distributional shifts (heatwaves, cold snaps). The signal is that your model's inputs have moved out of the trained range — investigate, decide whether to retrain."
      ),
      S([
        { prompt: "The KS test is non-parametric — it doesn't assume the data is normally distributed.", answer: true, whenRight: "Right — works on any distribution. Compares empirical CDFs directly.", whenWrong: "Yes — non-parametric. No normality assumption. That's exactly why it's the default for drift detection." },
        { prompt: "A small KS p-value means the two distributions ARE the same.", answer: false, whenRight: "Right — opposite. Small p = unlikely they're the same = drift detected.", whenWrong: "Small p -> reject 'same distribution' -> distributions differ. Counter-intuitive but standard hypothesis-testing logic." },
        { prompt: "In a production drift monitor, the reference window stays fixed (training data); the current window slides forward in time.", answer: true, whenRight: "Right — reference is the known-good baseline. Current is fresh data. You compare them daily.", whenWrong: "Yes — reference fixed, current slides. That's how you detect drift away from the trained baseline." }
      ]),
      E("Your turn — detect drift","[CODE] In `notebooks/05-mlops.ipynb`:\n1. Set reference = training-period demand.\n2. For each day in the test period (after a 60-day warmup), compute KS between reference and the trailing 60-day window.\n3. Record dates where p < 0.01.\n4. Print the count + first few alerts.")
    ]),
    D(6,"Trigger an alert on drift","Turn the detection into an actionable signal.",[
      L("From detection to alert",
"## What's missing\n" +
"You can DETECT drift now. You can't yet ACT on it. Production needs:\n" +
"1. A clear threshold ('p < 0.01' is fine — anything above gets ignored)\n" +
"2. A delivery channel (Slack webhook, PagerDuty, email)\n" +
"3. De-duplication — one alert per drift event, not 50 alerts in a week\n\n" +
"## A minimal alert function\n" +
"```python\n" +
"import requests, os\n\n" +
"SLACK_WEBHOOK = os.getenv('SLACK_WEBHOOK_URL')  # store in .env\n\n" +
"def alert(msg: str):\n" +
"    \"\"\"Send a Slack notification. Falls back to print if no webhook configured.\"\"\"\n" +
"    if SLACK_WEBHOOK:\n" +
"        requests.post(SLACK_WEBHOOK, json={'text': msg})\n" +
"    else:\n" +
"        print('ALERT:', msg)\n\n" +
"def check_drift_and_alert(reference, current, threshold=0.01):\n" +
"    stat, p = ks_2samp(reference, current)\n" +
"    if p < threshold:\n" +
"        alert(f'🚨 EnergyForecast drift detected: KS={stat:.3f}, p={p:.5f}. '\n" +
"              'Review model in MLflow.')\n" +
"        return True\n" +
"    return False\n" +
"```\n\n" +
"## De-duplication\n" +
"```python\n" +
"# Track last alert time to avoid spam\n" +
"from datetime import datetime, timedelta\n" +
"last_alert = None\n" +
"COOLDOWN = timedelta(days=7)  # max one alert per week per drift event\n\n" +
"if drifted and (last_alert is None or datetime.now() - last_alert > COOLDOWN):\n" +
"    alert(msg)\n" +
"    last_alert = datetime.now()\n" +
"```\n\n" +
"## The full production-style loop\n" +
"```text\n" +
"every day:\n" +
"    current = last 60 days of demand\n" +
"    if KS(reference, current).p < 0.01 AND not in cooldown:\n" +
"        send slack alert with link to MLflow run\n" +
"        log alert to MLflow\n" +
"        humans investigate and decide whether to retrain\n" +
"```\n\n" +
"## Why this completes MLOps\n" +
"You've now closed the loop: train → log → register → promote → monitor → alert. That's the lifecycle. Every production ML system has some version of these steps. Building each one yourself this week means you can recognise (and improve) any of them on the job."
      ),
      S([
        { prompt: "Alerts without de-duplication can spam the team with one notification per day for a single drift event.", answer: true, whenRight: "Right — exactly the failure mode. Cooldown windows (per-week per-event) prevent it.", whenWrong: "Yes — alert fatigue is real. De-dup with cooldown windows so one drift event = one notification." },
        { prompt: "Storing the Slack webhook URL in `.env` (gitignored) is the standard pattern.", answer: true, whenRight: "Right — same as API keys. Never commit webhooks; load from environment.", whenWrong: "Always .env + .gitignore for secrets. Webhooks, API keys, DB URLs — same rule." },
        { prompt: "A drift alert is a fully automated retrain trigger.", answer: false, whenRight: "Right — no. Drift alerts wake humans up. The decision to retrain is judgment, not automation.", whenWrong: "Drift fires alerts; humans decide whether to retrain. Auto-retrain on every alert is how bad models silently ship." }
      ]),
      E("Your turn — alert","[CODE] In `notebooks/05-mlops.ipynb`:\n1. Write a check_drift_and_alert function that prints (or Slacks) when p < 0.01.\n2. Run it over the test period.\n3. Add a 7-day cooldown so back-to-back days don't double-fire.\n4. Note: in production you'd wire this to a Slack webhook stored in .env.")
    ]),
    D(7,"Ship mlops-w1","Tag the MLOps milestone.",[
      L("Shipping the MLOps work",
"## What goes in the README\n" +
"```text\n" +
"## mlops-w1 — Tracking + drift monitoring\n" +
"- MLflow experiment 'EnergyForecast' with 3 logged Prophet runs (cps sweep)\n" +
"- Best run: cps=0.05, MAE=612 MW (registered as EnergyForecast v1, Production)\n" +
"- Drift monitor: KS test on a sliding 60-day window vs training-period reference\n" +
"- 47 drift alerts triggered across the test period (clustered around heatwaves\n" +
"  and the holiday season) — exactly the periods Prophet's MAE is worst on,\n" +
"  confirming the monitor catches real distribution shifts\n" +
"- Alert function with 7-day cooldown wired (prints locally; would Slack in prod)\n" +
"```\n\n" +
"```bash\n" +
"git add notebooks/05-mlops.ipynb README.md\n" +
"git commit -m \"MLOps: MLflow tracking + KS drift detection\"\n" +
"git tag mlops-w1\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## What this milestone proves\n" +
"You can take a model from notebook to lifecycle: tracked experiments, versioned registry, monitored production, alerts on drift. That's the senior-DS workflow translated to a real artefact on your portfolio.\n\n" +
"## What's next\n" +
"Week 26 — Cloud + BigQuery. The model goes off your laptop, onto S3, and you query data at full scale.\n\n" +
"By Week 27 you ship Energy Forecast v1.0 with a blog post, a demo dashboard, and a retro."
      ),
      S([
        { prompt: "Committing the notebook + README is enough — mlruns/ stays local and gitignored.", answer: true, whenRight: "Right — artefacts live in mlruns/. The notebook + README document the workflow. Together they're the deliverable.", whenWrong: "Yes — mlruns/ is gitignored. The notebook + README capture the workflow; the artefacts stay local (or remote in real teams)." },
        { prompt: "Pushing the mlops-w1 tag marks the milestone and lets you reference 'the state of the project when MLOps was added.'", answer: true, whenRight: "Right — tags pin known-good points in the timeline. Future reviewers can check out mlops-w1 cleanly.", whenWrong: "Yes — tags = immutable checkpoints. Anyone (you, a reviewer, CI) can refer to this exact state forever." },
        { prompt: "MLOps work is invisible to interviewers because they only care about model accuracy.", answer: false, whenRight: "Right — no. Senior interviewers care MORE about MLOps than absolute accuracy. Anyone can fit; few can monitor.", whenWrong: "Senior signal: training is table stakes; lifecycle is what separates juniors from seniors. MLOps is visible and valued." }
      ]),
      E("Your turn — ship mlops-w1","[PRODUCE] 1. README: list the three MLflow runs + their MAEs, name the production pick, summarise the drift monitor (window size, threshold, total alerts).\n2. Commit + tag:\n`git add . && git commit -m 'MLOps: MLflow + drift detection'`\n`git tag mlops-w1 && git push --tags`\n\nPASS:\n[x] MLflow UI shows 3 EnergyForecast runs\n[x] Best run promoted to Production stage\n[x] KS drift function in notebook\n[x] Drift alert count over test period in README\n[x] mlops-w1 tag pushed")
    ])
  ]
};

const newWeeks = [W22, W23, W24, W25];
newWeeks.forEach((w) => {
  if (w.days.length !== 7) throw new Error(`W${w.number}: need 7 days, got ${w.days.length}`);
  if (!w.concept_check || w.concept_check.length !== 3) throw new Error(`W${w.number}: concept_check must have 3 entries`);
  w.days.forEach((d) => {
    const k = d.items.map((i) => i.kind);
    if (!k.includes('lesson') || !k.includes('swipe') || !k.includes('exercise')) {
      throw new Error(`W${w.number} D${d.number} missing required item kinds`);
    }
  });
});

ds.weeks.splice(21, 4, ...newWeeks);

fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log(`SUCCESS — DS W22-W25 rebuilt to standard. Total weeks: ${ds.weeks.length}`);
