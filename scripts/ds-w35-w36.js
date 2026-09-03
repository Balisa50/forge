// Rebuild DS W35-W36 to the teach->swipe->project standard.
// W35 Causal Inference - going beyond correlation
// W36 ML Fairness and Bias - the audit you actually run
const path = require('path');
const fs = require('fs');
const FILE = path.join(__dirname, '..', 'data', 'roadmaps', 'data-science.json');
const ds = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const L = (title, body) => ({ kind: 'lesson', title, body });
const V = (title, url, dm, creator, why) => ({ kind: 'video', title, url, duration_min: dm, creator, why });
const S = (cards) => ({ kind: 'swipe', title: 'Quick check — swipe to answer', cards });
const E = (title, body) => ({ kind: 'exercise', title, body });
const D = (number, title, summary, items) => ({ number, title, summary, items });

/* ════ WEEK 35 — Causal Inference: going beyond correlation ════ */
const W35 = {
  number: 35, title: "Causal Inference - going beyond correlation",
  phase: "Causal ML", commitment_hours: "8-10",
  context: ds.weeks[34].context,
  concept_check: [
    { q: "Why does 'correlation is not causation' matter for a data scientist who ships models?",
      choices: ["Trivia","Decisions made on correlational evidence (raise the price because high-priced products sell more) flip predictably when you act on them — causation is what survives intervention",
        "Required by law","Pure theory"],
      correct: 1, explain: "A correlational model says 'when X is high, Y is high'. A causal claim says 'if I CHANGE X, Y will change in this direction by this much'. Acting on correlation when the underlying mechanism is reversed or confounded produces predictable failure: you raise the price, sales drop, you blame the model. The model wasn't wrong — you asked it the wrong question. Every model that influences decisions needs at least a thought about causation, even if you don't run a full RCT." },
    { q: "What is a 'confounder' in plain terms?",
      choices: ["A bad data point","A third variable that affects BOTH the supposed cause and the supposed effect — making them look correlated even when there's no causal link",
        "Missing data","An outlier"],
      correct: 1, explain: "Ice cream sales correlate with drowning deaths. Neither causes the other. Summer heat causes both — that's the confounder. Confounders are the silent killer of causal claims; if you don't draw a DAG and ask 'what else could be moving both X and Y?', you'll mistake correlations for mechanisms regularly." },
    { q: "What does propensity score matching (PSM) actually do?",
      choices: ["Magic","For each treated unit, find an untreated unit with similar pre-treatment characteristics, then compare outcomes — approximating a randomised experiment with observational data",
        "Trains a model","Cleans data"],
      correct: 1, explain: "PSM is the workhorse of causal inference on observational data. You model the probability of receiving treatment (the propensity score) using pre-treatment covariates, then match treated and untreated units with similar scores. The matched pairs are 'as if' randomised on the covariates you observed, so a difference in outcomes is your causal effect estimate. The catch: it only adjusts for confounders you OBSERVE; unobserved ones still bias the estimate. That's what sensitivity analysis is for." }
  ],
  days: [
    D(1,"Mindset shift","Correlation vs causation. No code today.",[
      L("Why every DS eventually hits this wall",
"## What it is\n" +
"You've spent 34 weeks building predictive models. They answer: 'given these features, what's the most likely outcome?' That's correlation — it's enough for ranking, recommendation, anomaly detection, demand forecasting.\n\n" +
"But every model that influences a DECISION eventually gets asked a different question: **'if we CHANGE this, what will happen?'**\n\n" +
"- Pricing team: 'if we raise the price 10%, what happens to revenue?'\n" +
"- Marketing: 'if we send this email, will conversions go up?'\n" +
"- Product: 'if we add this feature, will retention improve?'\n" +
"- Policy: 'if we offer this benefit, will employee turnover drop?'\n\n" +
"None of these are answerable from a correlational model. The features that correlate with the outcome might not be the features that CAUSE the outcome.\n\n" +
"## The classic example\n" +
"Ice cream sales correlate strongly with drowning deaths. Both are higher in summer. Neither causes the other.\n\n" +
"```text\n" +
"  Ice cream sales ←─── SUMMER HEAT ───→ Drowning deaths\n" +
"                       (confounder)\n" +
"```\n\n" +
"A predictive model that includes 'ice cream sales' will gladly tell you they 'predict' drowning. A causal model will tell you they don't cause it. Banning ice cream won't save lives. Building beaches with lifeguards will.\n\n" +
"## What this week is for\n" +
"Three tools that let you go from correlational claim to defensible causal claim on OBSERVATIONAL data (no A/B test required):\n" +
"1. **DAGs** (directed acyclic graphs) — draw your assumed causal structure before you analyse\n" +
"2. **Propensity Score Matching** — approximate randomisation with observational data\n" +
"3. **Sensitivity analysis** — quantify how much an unobserved confounder would have to bias the result to overturn your conclusion\n\n" +
"Plus difference-in-differences if you have a treatment-moment in time-series data.\n\n" +
"## Why this hires\n" +
"Senior DS roles increasingly ask causal questions. Junior candidates who can only build predictive models compete for the same jobs; candidates who can speak to causation move into different conversations entirely — pricing, growth, policy, experimentation."
      ),
      V("Correlation vs Causation explained","https://www.youtube.com/watch?v=8B271L3NtAw",4,"various","Watch first. Plain-English explanation of why correlation is not causation, with classic examples."),
      V("Causal Inference Crash Course (15 min)","https://www.youtube.com/watch?v=gRkUhg9Wb-I",15,"various","Watch second. Visual overview of DAGs, confounders, and what causal inference actually does. Frames the rest of the week."),
      S([
        { prompt: "A model that predicts X well can always answer 'what happens if I CHANGE X' questions reliably.", answer: false, whenRight: "Right — no. Prediction and causation answer different questions. A model that uses 'time of day' to predict traffic can't tell you what happens if you BAN driving at noon.", whenWrong: "Prediction ≠ causation. Models that predict well from correlated features can fail badly when those features are manipulated." },
        { prompt: "A confounder is a third variable that affects both X and Y, creating a correlation that doesn't reflect causation.", answer: true, whenRight: "Right — ice cream + drowning + summer is the classic example. Both move together because of the confounder, not because of each other.", whenWrong: "Yes — confounder = common cause. Heat causes both ice cream and drowning; they look related but aren't causally linked." },
        { prompt: "Predictive models are inferior to causal models — you should always do causal inference.", answer: false, whenRight: "Right — no. They answer different questions. Prediction is fine for ranking, scoring, forecasting; causation is needed when you're going to ACT on the model's output.", whenWrong: "Different tools for different jobs. Predictive models are correct for predictive tasks. Causal models are for intervention decisions." }
      ]),
      E("Your turn — frame causation","[WRITE] In `causal/INTRO.md`:\n1. Pick ONE model from your portfolio (TaxiPulse, Reddit, Energy, Capstone).\n2. Write the predictive question it answers.\n3. Write a different, CAUSAL question someone might ask about the same domain.\n4. Name one plausible confounder for the causal question.\n5. End with: 'This week I'll build a causal analysis around <topic>.'")
    ]),
    D(2,"DAGs","Draw one. Identify confounders.",[
      L("Directed Acyclic Graphs — the simplest causal tool",
"## What it is\n" +
"A **DAG** is a diagram of variables with arrows showing assumed causal direction. It's the cheapest tool in causal inference and the most undervalued.\n\n" +
"```text\n" +
"     SUMMER HEAT\n" +
"        ↓    ↓\n" +
"   ice cream  drowning\n" +
"```\n\n" +
"That diagram says: heat causes ice cream sales; heat causes drowning; ice cream does NOT cause drowning. You've now committed to assumptions a reader can challenge. That's the point.\n\n" +
"## Why drawing it matters\n" +
"- It forces you to NAME the confounders you can think of\n" +
"- It surfaces the variables you'd need to measure (but maybe didn't)\n" +
"- A reader can disagree with an arrow — that's a productive conversation\n" +
"- It tells you which variables to control for in the analysis (the 'backdoor' set)\n\n" +
"## The three patterns to recognise\n" +
"```text\n" +
"1. CHAIN          X → M → Y\n" +
"   (M mediates X's effect on Y)\n" +
"   e.g.  Education → Income → Health\n" +
"   Controlling for M BLOCKS X's effect on Y\n\n" +
"2. FORK           X ← C → Y\n" +
"   (C is a confounder of X and Y)\n" +
"   e.g.  Heat → Ice cream;  Heat → Drowning\n" +
"   Controlling for C is REQUIRED to estimate X→Y\n\n" +
"3. COLLIDER       X → Z ← Y\n" +
"   (Z is caused by both X and Y)\n" +
"   e.g.  Talent → Job offer;  Connections → Job offer\n" +
"   Controlling for Z CREATES a spurious correlation\n" +
"```\n\n" +
"That last one is the most-missed trap. Controlling for a collider INTRODUCES bias rather than removing it. If you have a sample of people who got job offers and you analyse Talent vs Connections within that sample, you'll find them anti-correlated even if they're independent in the population — because you've conditioned on the collider.\n\n" +
"## Drawing yours\n" +
"For your chosen topic from Day 1:\n" +
"1. List variables (treatment, outcome, plausible confounders, plausible mediators)\n" +
"2. Draw arrows for relationships you BELIEVE exist\n" +
"3. For each arrow, write one sentence justifying it\n" +
"4. Note any arrows you're uncertain about — those are your research questions\n\n" +
"Tools: pen + paper. Or daft (Python). Or dagitty.net (free, browser-based, exports SVG)."
      ),
      L("See it in code — daft for Python DAGs",
"## Minimal daft example\n" +
"```python\n" +
"import daft\n\n" +
"pgm = daft.PGM(observed_style='inner')\n" +
"pgm.add_node('heat', 'Heat', 1, 2)\n" +
"pgm.add_node('icecream', 'Ice cream', 0, 1)\n" +
"pgm.add_node('drowning', 'Drowning', 2, 1)\n" +
"pgm.add_edge('heat', 'icecream')\n" +
"pgm.add_edge('heat', 'drowning')\n" +
"pgm.render()\n" +
"import matplotlib.pyplot as plt\n" +
"plt.savefig('causal/dag.png', dpi=150, bbox_inches='tight')\n" +
"```\n\n" +
"The image is what goes in your README. It's the single most credible thing you can put on a causal analysis: 'here are the assumptions I committed to before running the numbers.'"
      ),
      S([
        { prompt: "Controlling for a COLLIDER (a variable caused by both X and Y) removes confounding bias.", answer: false, whenRight: "Right — no. Controlling for a collider INTRODUCES spurious correlation between X and Y. The talent-vs-connections-among-hired example.", whenWrong: "Opposite. Colliders create bias when controlled for. You only control for confounders (forks), not colliders." },
        { prompt: "A DAG forces you to commit to the causal assumptions a reader can challenge.", answer: true, whenRight: "Right — that's the whole point. Without a DAG, your assumptions are implicit; with one, they're auditable.", whenWrong: "Yes — DAGs externalize assumptions. They're how you move from 'I think' to 'here is what I assume, dispute it'." },
        { prompt: "If two variables are causally independent in the population, conditioning on a common effect (collider) keeps them independent in the conditioned sample.", answer: false, whenRight: "Right — no. Conditioning on a collider induces a correlation even between truly independent causes (Berkson's paradox).", whenWrong: "Conditioning on a collider creates correlation. That's why you don't control for them. Berkson's paradox." }
      ]),
      E("Your turn — draw your DAG","[CODE] 1. Draw a DAG for your chosen topic. Pen + paper is fine, or use daft / dagitty.net.\n2. List every confounder (FORK) you can think of.\n3. Mark which confounders you have data for and which you don't.\n4. Mark any colliders — make sure you do NOT control for them.\n5. Save as `causal/dag.png`. Commit it.\n6. Add 2-3 paragraphs in `causal/DAG.md` explaining each arrow.")
    ]),
    D(3,"Propensity Score Matching","Approximate randomisation with observational data.",[
      L("PSM — the workhorse of observational causal inference",
"## The problem PSM solves\n" +
"Randomised controlled trials (RCTs) are the gold standard for causal claims because randomisation BREAKS confounding — the treated and untreated groups are statistically identical at baseline, so any post-treatment difference IS the causal effect.\n\n" +
"In observational data you don't get randomisation. People SELECT into treatment based on characteristics that also affect the outcome. If you naively compare the treated to the untreated, you're comparing apples to oranges.\n\n" +
"**PSM** approximates randomisation: it matches each treated unit with an untreated unit that LOOKS the same on all the pre-treatment characteristics you observed. The matched pairs are 'as if' randomised on those covariates.\n\n" +
"## The four-step procedure\n" +
"```text\n" +
"1. MODEL the propensity score:\n" +
"     P(treated | covariates) using logistic regression\n" +
"     → each row gets a propensity (0 to 1)\n\n" +
"2. MATCH treated to untreated on propensity:\n" +
"     for each treated unit, find the untreated unit with closest score\n" +
"     (nearest-neighbour matching; can also do caliper, stratification)\n\n" +
"3. CHECK BALANCE:\n" +
"     after matching, distributions of covariates should look identical\n" +
"     across treated and untreated. If not, the match failed.\n\n" +
"4. COMPARE outcomes in the matched sample:\n" +
"     difference in means = ATT (Average Treatment effect on the Treated)\n" +
"```\n\n" +
"## The Python pattern\n" +
"```python\n" +
"import pandas as pd\n" +
"from sklearn.linear_model import LogisticRegression\n" +
"from sklearn.neighbors import NearestNeighbors\n" +
"import numpy as np\n\n" +
"df = pd.read_csv('causal/data.csv')   # your data\n" +
"treated_mask = df['treated'] == 1\n" +
"covariates = ['age', 'income', 'education', 'prior_outcome']\n\n" +
"# 1. Propensity score\n" +
"lr = LogisticRegression(max_iter=1000)\n" +
"lr.fit(df[covariates], df['treated'])\n" +
"df['ps'] = lr.predict_proba(df[covariates])[:, 1]\n\n" +
"# 2. Nearest-neighbour matching on propensity\n" +
"treated = df[treated_mask].copy()\n" +
"untreated = df[~treated_mask].copy()\n\n" +
"nn = NearestNeighbors(n_neighbors=1)\n" +
"nn.fit(untreated[['ps']].values)\n" +
"dist, idx = nn.kneighbors(treated[['ps']].values)\n" +
"matched_untreated = untreated.iloc[idx.flatten()].reset_index(drop=True)\n\n" +
"# 3. Balance check (post-match)\n" +
"for c in covariates:\n" +
"    print(f'{c}: treated mean {treated[c].mean():.2f} | matched ctrl {matched_untreated[c].mean():.2f}')\n\n" +
"# 4. ATT\n" +
"att = treated['outcome'].mean() - matched_untreated['outcome'].mean()\n" +
"print(f'ATT (average treatment effect on the treated) = {att:.3f}')\n" +
"```\n\n" +
"## The honest caveat\n" +
"PSM adjusts for confounders YOU OBSERVE. If a relevant confounder is unobserved (motivation, latent ability, an unmeasured exposure), PSM does NOT fix it. That's tomorrow's lesson: sensitivity analysis.\n\n" +
"## A real public dataset to practice on\n" +
"Try the **Lalonde (1986) NSW** dataset — a classic causal-inference benchmark where a real RCT exists, so you can check your observational estimate against the true experimental answer. Available via `from causalinference.utils.tools import dataset` or many GitHub mirrors.\n\n" +
"```python\n" +
"# Lalonde NSW + observational control (PSID)\n" +
"import pandas as pd\n" +
"url = 'https://users.nber.org/~rdehejia/data/nsw_dw.dta'\n" +
"df = pd.read_stata(url)\n" +
"```\n\n" +
"The exercise: estimate the effect of a job training program on 1978 earnings. The experimental answer is ~$1,794. PSM done well gets close; naive comparison gets it badly wrong."
      ),
      S([
        { prompt: "PSM approximates randomisation by matching treated and untreated units with similar pre-treatment characteristics.", answer: true, whenRight: "Right — that's the whole trick. After matching, the two groups look statistically identical on observed covariates.", whenWrong: "Yes — match on propensity, compare on outcome. The matched sample is 'as if' randomised on the matched-on covariates." },
        { prompt: "PSM removes the bias from unobserved confounders.", answer: false, whenRight: "Right — no. PSM only adjusts for confounders you observe. Unobserved ones still bias the estimate. That's what sensitivity analysis quantifies.", whenWrong: "Only observed confounders. Unobserved ones survive matching. That's the fundamental limitation; sensitivity analysis quantifies the risk." },
        { prompt: "After matching, you should CHECK that covariate distributions look identical across the matched groups.", answer: true, whenRight: "Right — balance check. If covariates still differ after matching, the match failed and the analysis is suspect.", whenWrong: "Yes — never skip the balance check. Unbalanced matches don't approximate randomisation; the estimate is biased." }
      ]),
      E("Your turn — run a PSM","[CODE] In `causal/01_psm.ipynb`:\n1. Load a dataset (Lalonde NSW is recommended; or your own observational data).\n2. Define treatment, outcome, covariates.\n3. Fit a propensity model (logistic regression).\n4. Match with NearestNeighbors (k=1).\n5. Print balance: mean of each covariate, treated vs matched-control.\n6. Compute ATT (difference in outcome means).\n7. Compare to NAIVE comparison (treated minus untreated, no matching).\n8. Markdown: how big is the bias from skipping PSM?")
    ]),
    D(4,"Sensitivity analysis","What if there's an unobserved confounder?",[
      L("Sensitivity analysis — the honesty layer",
"## What it is\n" +
"PSM gives you an effect estimate IF all confounders are observed. Sensitivity analysis answers: 'how strong would an unobserved confounder have to be to overturn my conclusion?'\n\n" +
"That single question is the difference between a defensible causal claim and a fragile one.\n\n" +
"## The intuition (Rosenbaum bounds, simplified)\n" +
"Imagine an unobserved confounder U that you didn't measure. Suppose U doubles the odds of receiving treatment AND U doubles the odds of a positive outcome. Would your observed ATT still be significant if U existed?\n\n" +
"- If the answer is 'no, even a weak U overturns the result' → your conclusion is fragile\n" +
"- If the answer is 'a U strong enough to overturn would be implausible' → your conclusion is robust\n\n" +
"## A simple sensitivity report\n" +
"For each plausible strength of an unobserved confounder Γ (gamma), recompute whether the effect is still significant. Γ=1 means no confounder; Γ=2 means a strong confounder; Γ=3 means a very strong one.\n\n" +
"```python\n" +
"# Conceptual — there are R packages (sensitivitymw, rbounds) that do this rigorously\n" +
"# For Python, the `causalinference` library has tools too.\n" +
"# At minimum: report at what Γ the conclusion flips.\n\n" +
"print('Γ = 1.0 (no confounder):   p < 0.001, effect = $1,794')\n" +
"print('Γ = 1.5 (mild confounder):  p < 0.05,  effect = $1,200')\n" +
"print('Γ = 2.0 (strong confounder): p = 0.08,  effect = $700')\n" +
"print('Γ = 2.5 (very strong):       p = 0.34,  not significant')\n\n" +
"# Conclusion: effect is robust to mild-to-strong unobserved confounding,\n" +
"# but a confounder that doubles odds of both treatment and outcome\n" +
"# would push us out of statistical significance.\n" +
"```\n\n" +
"## A simpler alternative: 'E-value'\n" +
"VanderWeele's E-value (2017) — single number summarising sensitivity. The E-value is the minimum strength of association that an unobserved confounder would need with BOTH treatment and outcome to fully explain away the observed effect.\n\n" +
"- **E-value = 1.5** → even a weak confounder could explain the result. Fragile.\n" +
"- **E-value = 4** → only an implausibly strong confounder could overturn. Robust.\n\n" +
"```python\n" +
"# Simple E-value calculation for a risk ratio RR > 1\n" +
"def e_value(rr):\n" +
"    return rr + ((rr * (rr - 1)) ** 0.5)\n\n" +
"# Example: observed RR = 1.5\n" +
"print(f'E-value: {e_value(1.5):.2f}')\n" +
"# E-value: 2.37  → confounder would need RR≥2.37 with both treatment and outcome to overturn\n" +
"```\n\n" +
"## What goes in the memo\n" +
"```markdown\n" +
"## Sensitivity to unobserved confounding\n" +
"\n" +
"Our estimated ATT is $1,794. The E-value is 2.37. That means an unobserved\n" +
"confounder would have to be associated with BOTH treatment assignment AND\n" +
"the outcome at a relative-risk of at least 2.37 to fully explain away the\n" +
"effect.\n" +
"\n" +
"In context: the strongest OBSERVED confounder in our dataset (prior earnings)\n" +
"has an RR of 1.6 with the outcome. An unobserved confounder strong enough\n" +
"to overturn the result would need to exceed our strongest observed one by\n" +
"~50%. Possible but not trivial.\n" +
"\n" +
"Conclusion: the result is moderately robust. We would not claim 'causal\n" +
"proof', but we have a defensible estimate.\n" +
"```\n\n" +
"## Why this is the senior move\n" +
"Junior analysts present a point estimate and stop. Senior analysts present an estimate AND quantify how badly it could be wrong. The latter gets believed; the former gets dismissed."
      ),
      S([
        { prompt: "An E-value of 4 means the estimate is more robust to unobserved confounding than an E-value of 1.5.", answer: true, whenRight: "Right — bigger E-value = a stronger confounder would be needed to overturn the result. More robust.", whenWrong: "Yes — higher E-value = harder to overturn. 1.5 means a weak confounder could flip you; 4 means only an implausibly strong one." },
        { prompt: "Sensitivity analysis assumes the unobserved confounder definitely exists.", answer: false, whenRight: "Right — no. It asks 'what would have to be true for the result to overturn?'. The honest report says how robust the conclusion is to a hypothetical confounder.", whenWrong: "It's a conditional: IF a confounder of strength Γ existed, would the conclusion still hold? You're not asserting one exists." },
        { prompt: "Reporting only the point estimate without sensitivity analysis is the senior move.", answer: false, whenRight: "Right — no. Junior analysts report point estimates; senior analysts quantify how badly they could be wrong. Sensitivity = credibility.", whenWrong: "Opposite. Senior analysts always quantify robustness. Point estimates alone read as overclaiming on observational data." }
      ]),
      E("Your turn — sensitivity check","[CODE] In the same notebook from Day 3:\n1. Compute an E-value for your PSM result (use the formula above if you have a risk ratio; or use rough Γ-style sensitivity if you have a continuous effect).\n2. Compare the E-value to the strength of your strongest OBSERVED confounder.\n3. Write 1-2 paragraphs in `causal/SENSITIVITY.md`: 'how robust is the result?'.\n4. Be honest. If the E-value is 1.5, say so.")
    ]),
    D(5,"Difference-in-Differences","Time-series + a treatment moment.",[
      L("Diff-in-Diff — the cleanest natural-experiment design",
"## When it applies\n" +
"You have **time-series data** and **a moment in time when treatment was applied to one group but not another**. Classic examples:\n" +
"- A new minimum wage law in one state but not the neighbouring state\n" +
"- A platform feature rolled out to one region first\n" +
"- A school reform applied to some districts and not others\n\n" +
"## The intuition\n" +
"```text\n" +
"             pre-treatment        post-treatment\n" +
"Treated:        A           ─→         B\n" +
"Control:        C           ─→         D\n" +
"\n" +
"Naive comparison post-treatment:  B − D\n" +
"Naive change in treated:           B − A\n" +
"\n" +
"Difference-in-differences:    (B − A) − (D − C)\n" +
"                              ─────────  ─────────\n" +
"                              treated     control\n" +
"                              change      change\n" +
"```\n\n" +
"DiD assumes that, in the ABSENCE of treatment, the treated group's outcome would have changed by the same amount as the control group's. So whatever extra the treated group did (or didn't do) is attributable to treatment. The 'parallel trends' assumption.\n\n" +
"## Why it beats simple before/after\n" +
"Before/after on the treated group alone could be confounded by anything happening at the same time. DiD subtracts out whatever was happening to the control group during the same period — which absorbs most time-varying confounders.\n\n" +
"## A minimal example\n" +
"```python\n" +
"import pandas as pd\n" +
"import statsmodels.formula.api as smf\n\n" +
"# data with columns: state, year, outcome\n" +
"df = pd.read_csv('causal/state_panel.csv')\n\n" +
"df['post']    = (df['year'] >= 2020).astype(int)\n" +
"df['treated'] = (df['state'] == 'CA').astype(int)\n" +
"df['post_x_treated'] = df['post'] * df['treated']\n\n" +
"# DiD as a regression\n" +
"model = smf.ols('outcome ~ post + treated + post_x_treated', data=df).fit()\n" +
"print(model.summary())\n\n" +
"# The coefficient on `post_x_treated` IS the DiD estimate\n" +
"```\n\n" +
"## Check parallel trends BEFORE the treatment\n" +
"The whole assumption is that the treated and control groups were on parallel paths PRE-treatment. Plot the outcome over time for both groups, with a vertical line at the treatment moment. If the pre-treatment slopes look parallel, you have a defensible DiD. If they diverge before treatment, your assumption is broken.\n\n" +
"```python\n" +
"import matplotlib.pyplot as plt\n\n" +
"for label, sub in df.groupby('treated'):\n" +
"    means = sub.groupby('year')['outcome'].mean()\n" +
"    plt.plot(means.index, means.values, label=f'treated={label}')\n" +
"plt.axvline(2020, ls='--', color='gray', label='treatment')\n" +
"plt.legend()\n" +
"plt.savefig('causal/parallel_trends.png')\n" +
"```\n\n" +
"## When DiD doesn't apply\n" +
"- You only have post-treatment data → can't check parallel trends\n" +
"- The 'control' group was also affected by spillover → DiD biased toward zero\n" +
"- The treatment was rolled out gradually with no clean before/after moment\n\n" +
"DiD is one of the cleanest causal designs you can apply to observational data — but only when the conditions hold."
      ),
      S([
        { prompt: "The parallel trends assumption says that the treated and control groups would have changed at the same rate IF treatment hadn't happened.", answer: true, whenRight: "Right — that's the identifying assumption. Pre-treatment trends are the only way to assess whether it's plausible.", whenWrong: "Yes — DiD identifies the effect by assuming parallel counterfactual trends. Check pre-treatment trends to support it." },
        { prompt: "DiD just compares treated vs control AFTER treatment — the 'before' data isn't needed.", answer: false, whenRight: "Right — no. The whole point of DiD is using PRE-treatment data to subtract out time-varying confounders. Without 'before', it's just a cross-sectional comparison.", whenWrong: "DiD requires both pre AND post. Without pre, you can't difference out the baseline gap; without post, there's no treatment effect to measure." },
        { prompt: "The coefficient on the post×treated interaction in the DiD regression IS the causal estimate.", answer: true, whenRight: "Right — that's why DiD is so often expressed as `outcome ~ post + treated + post*treated`. The interaction coefficient is the effect.", whenWrong: "Yes — the interaction term. Linear DiD reduces to a single regression coefficient that captures the differential change." }
      ]),
      E("Your turn — DiD (if applicable)","[CODE] IF you have time-series with a treatment moment:\n1. Plot pre-treatment trends for treated vs control. Save `causal/parallel_trends.png`.\n2. Run the DiD regression.\n3. Report the coefficient on the interaction term + its standard error.\n4. Be honest about whether parallel trends holds.\n\nIF you DON'T have time-series with a treatment moment:\n[WRITE] in `causal/WHY_NO_DID.md`: explain why DiD doesn't apply to your topic, and what alternative design (RDD, instrumental variables, synthetic control) might.")
    ]),
    D(6,"Write the memo","One page. Honest about uncertainty.",[
      L("The causal memo — what real analysts ship",
"## What it is\n" +
"A single-page document that anyone in the org can read in 5 minutes and walk away with a defensible understanding of what you concluded, how strongly, and what could overturn it.\n\n" +
"## The template\n" +
"```markdown\n" +
"# Causal memo: <Question>\n" +
"\n" +
"## Question\n" +
"<One sentence. Specific, actionable.>\n" +
"e.g.: Does the job training program increase 1978 earnings?\n" +
"\n" +
"## Data\n" +
"<One paragraph: source, sample size, time period, treatment + outcome>\n" +
"\n" +
"## DAG\n" +
"![DAG](dag.png)\n" +
"<Two sentences explaining your assumed structure + the key confounder>\n" +
"\n" +
"## Method\n" +
"<One sentence: PSM / DiD / IV / what>\n" +
"<One sentence: why this is appropriate for the design>\n" +
"\n" +
"## Result\n" +
"**Estimated effect: +$1,794 in 1978 earnings (95% CI: $456 to $3,132)**\n" +
"\n" +
"<One sentence interpretation in plain English>\n" +
"\n" +
"## Sensitivity\n" +
"E-value: 2.37. An unobserved confounder would have to be associated with\n" +
"both treatment and outcome at a relative-risk ≥ 2.37 to fully explain away\n" +
"the result. Our strongest observed confounder has RR of 1.6, so this is\n" +
"possible but would require a stronger unobserved factor than any observed one.\n" +
"\n" +
"## Limitations\n" +
"- <One specific weakness>\n" +
"- <Another specific weakness>\n" +
"- <Where the result might NOT generalise>\n" +
"\n" +
"## What this implies\n" +
"<One sentence: what a decision-maker should do with this result>\n" +
"```\n\n" +
"## Why one page\n" +
"- Decision-makers don't read longer\n" +
"- Forces you to be specific\n" +
"- The honesty (limitations, sensitivity) sits ABOVE the conclusion — not buried at the bottom of a deck\n\n" +
"## What separates this from junior analyses\n" +
"- A DAG that shows what you assumed\n" +
"- Sensitivity analysis that quantifies how badly you could be wrong\n" +
"- Limitations named SPECIFICALLY, not 'further research is needed'\n" +
"- A single estimate with a confidence interval, not a wall of regression tables\n\n" +
"## The one-page rule\n" +
"If you can't fit it on a page, the analysis isn't done yet. Cut until it fits."
      ),
      S([
        { prompt: "A causal memo is more credible when it includes a specific E-value or sensitivity bound, not just a point estimate.", answer: true, whenRight: "Right — sensitivity quantifies how robust the result is. Without it, the estimate looks overconfident.", whenWrong: "Yes — sensitivity = credibility. Point estimate alone reads as 'I picked one number'; with sensitivity, it reads as 'I quantified the uncertainty'." },
        { prompt: "If you can't fit the analysis on a single page, you should write a longer memo.", answer: false, whenRight: "Right — no. If it doesn't fit on a page, the analysis isn't done. Cut until it fits.", whenWrong: "One page or it's not done. Cutting clarifies thinking; longer memos go unread." },
        { prompt: "Naming specific limitations is more credible than writing 'further research is needed'.", answer: true, whenRight: "Right — vague limitations read as cargo-cult science. Specific ones read as 'I know exactly where this could be wrong'.", whenWrong: "Yes — specifics earn trust. 'Further research' is a phrase that signals nothing was actually examined." }
      ]),
      E("Your turn — write the memo","[WRITE] 1. Open `causal/MEMO.md`.\n2. Fill EVERY section of the template above.\n3. Reference your DAG image, your PSM/DiD result, your sensitivity number.\n4. The Limitations section is mandatory and must name AT LEAST 2 specific weaknesses.\n5. Keep it under 1 page printed (≈ 500 words).")
    ]),
    D(7,"Tag causal-shipped","Ship the work + a short EVAL post.",[
      L("Shipping the causal milestone",
"## What goes in the repo\n" +
"```text\n" +
"causal/\n" +
"  INTRO.md             # framing from Day 1\n" +
"  DAG.md               # arrows + justifications\n" +
"  dag.png              # the diagram itself\n" +
"  01_psm.ipynb         # PSM analysis\n" +
"  SENSITIVITY.md       # E-value report\n" +
"  parallel_trends.png  # only if you did DiD\n" +
"  MEMO.md              # the one-pager\n" +
"```\n\n" +
"## Short post (dev.to)\n" +
"~600 words. Focus on the ONE most surprising thing you found by going causal vs correlational.\n\n" +
"```text\n" +
"1. Hook — 'My correlational model said X. After a proper causal analysis, the answer is Y.'\n" +
"2. The naive view — what the correlational analysis would have concluded\n" +
"3. The DAG — image + 1 paragraph on the confounder you found\n" +
"4. The PSM (or DiD) — 1 paragraph on the method + the result\n" +
"5. Sensitivity — 1 paragraph on how robust the result is\n" +
"6. Implication — 1 paragraph on what this changes about the decision\n" +
"7. Link to the full memo + notebook\n" +
"```\n\n" +
"## Tag and ship\n" +
"```bash\n" +
"git add causal/\n" +
"git commit -m \"Causal analysis: <topic> (ATT estimate + sensitivity)\"\n" +
"git tag causal-shipped\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## Why this is the credibility week\n" +
"You're now one of the few entry-to-mid DS candidates who can speak to causation, not just prediction. Most learners don't know what a DAG is. You've shipped one with a defensible PSM result and a sensitivity bound. That's a senior-DS conversation starter on its own."
      ),
      S([
        { prompt: "Shipping a causal analysis with a DAG + PSM + sensitivity bound puts you ahead of most entry-DS candidates.", answer: true, whenRight: "Right — most learners stop at predictive modeling. Causal work is rarer and more senior-coded.", whenWrong: "Yes — rare in entry candidates. Even one shipped causal artifact moves you into senior-DS conversations." },
        { prompt: "The EVAL post should focus on the ONE most surprising finding from going causal vs correlational.", answer: true, whenRight: "Right — one clean story beats a comprehensive walkthrough. The contrast is the hook.", whenWrong: "Yes — one story. Comprehensive walkthroughs lose readers; the correlation-vs-causation contrast lands." },
        { prompt: "After this week, you should call yourself a 'causal inference expert'.", answer: false, whenRight: "Right — no. One shipped analysis is the start. Honest framing: 'I've applied PSM + DiD + sensitivity analysis to real data'.", whenWrong: "Frame honestly. 'Applied causal methods to one analysis' is true and credible; 'expert' overclaims and gets caught." }
      ]),
      E("Your turn — tag causal-shipped","[PRODUCE] 1. Final check: every file in causal/ exists and is committed.\n2. Write the EVAL post (`causal/post.md`); publish on dev.to.\n3. Commit + tag:\n`git add causal/ && git commit -m 'causal-shipped' && git tag causal-shipped && git push --tags`\n\nPASS:\n[x] DAG image committed + explained\n[x] PSM notebook with ATT + balance check\n[x] Sensitivity analysis (E-value or Γ bound)\n[x] One-page MEMO.md with all sections\n[x] EVAL post published\n[x] causal-shipped tag pushed")
    ])
  ]
};

/* ════ WEEK 36 — ML Fairness and Bias: the audit you actually run ════ */
const W36 = {
  number: 36, title: "ML Fairness and Bias - the audit you actually run",
  phase: "Production ML", commitment_hours: "8-10",
  context: ds.weeks[35].context,
  concept_check: [
    { q: "What does 'group fairness' actually measure?",
      choices: ["Whether the model is accurate","Whether the model's predictions are equally good (or equally bad) across protected groups — e.g., gender, race, age — using specific disparity metrics",
        "Whether your team is diverse","Whether your code is clean"],
      correct: 1, explain: "Group fairness asks: when the model makes mistakes, does it make them more often for one group than another? Equal opportunity (true-positive rate parity), demographic parity (selection rate parity), equalised odds (both TPR and FPR parity) — each is a specific definition you can audit with a number. You can't satisfy all of them simultaneously; you have to pick which matters most for your application." },
    { q: "Why is 'just remove the protected attribute from features' NOT enough?",
      choices: ["It is enough","Proxies — features correlated with the protected attribute (zip code with race, names with gender) carry the same bias the original attribute would. The model learns the same disparity through different doors",
        "It removes accuracy","It's illegal"],
      correct: 1, explain: "Removing race / gender / age from the input feels like a fairness fix but rarely is. Zip codes correlate strongly with race in many places; names correlate with gender; tenure correlates with age. The model learns the same proxy patterns and produces the same disparate outcomes. Fairness has to be MEASURED on the output (disparity in true-positive rates, false-positive rates, etc.) — not just attempted by hiding inputs." },
    { q: "Why is 'we ran Fairlearn and the disparity number was small' NOT a complete audit?",
      choices: ["It is complete","A complete audit names the protected groups, picks a fairness metric appropriate to the context, quantifies the gap, names mitigation options, and documents the tradeoff with accuracy — a single number alone is theatre",
        "Required by law","Fairlearn is wrong"],
      correct: 1, explain: "A real fairness audit is a DOCUMENT. Which groups did you check (and which did you not — and why)? Which definition of fairness applies (TPR, FPR, selection rate)? How big is the gap? What are the mitigation options + their cost? What does the team / org decide is acceptable? Running Fairlearn is the FIRST step, not the whole thing. The BIAS.md document is the audit." }
  ],
  days: [
    D(1,"Concepts","What fairness in ML actually means.",[
      L("Fairness is plural — pick the definition that matches the context",
"## What it is\n" +
"Every model you've shipped this year made decisions. The Reddit classifier labelled posts. The Energy Forecast allocated demand-prediction attention. Your capstone classifier assigned categories.\n\n" +
"If any of those models were deployed in a real product, they would be making decisions about real people AT SCALE — and some of those decisions would be systematically WORSE for specific groups. That's not theory; that's the documented behaviour of essentially every ML system that's ever been audited.\n\n" +
"## The three core definitions of group fairness\n" +
"```text\n" +
"1. DEMOGRAPHIC PARITY\n" +
"   P(prediction=positive | group=A) = P(prediction=positive | group=B)\n" +
"   'The model selects each group at the same RATE.'\n" +
"   Use when: selection itself is the issue (e.g., hiring screening,\n" +
"             loan offers). Implies equal outcomes regardless of base rates.\n" +
"\n" +
"2. EQUAL OPPORTUNITY (TPR parity)\n" +
"   P(prediction=positive | actual=positive, group=A) = same for group=B\n" +
"   'Among people who actually deserve the positive outcome, the model\n" +
"    correctly identifies them at the same rate for each group.'\n" +
"   Use when: missing a true positive is the harm (e.g., medical diagnosis,\n" +
"             qualified candidates being filtered out).\n" +
"\n" +
"3. EQUALISED ODDS (TPR + FPR parity)\n" +
"   Both true-positive AND false-positive rates equal across groups.\n" +
"   Use when: both kinds of error matter equally (e.g., risk scoring\n" +
"             where false positives have costs too).\n" +
"```\n\n" +
"## You can't satisfy all of them at once\n" +
"Mathematical fact (Chouldechova 2017, Kleinberg et al 2017): if base rates differ across groups, you cannot simultaneously satisfy demographic parity AND equal opportunity AND calibration. You pick which one is the relevant fairness for your context, and you live with the others not being fully met.\n\n" +
"## Why this is hard\n" +
"- Different stakeholders prefer different definitions\n" +
"- Different definitions can disagree about whether the same model is fair\n" +
"- The 'right' definition depends on the social context of the decision, not just the math\n\n" +
"This is why a real audit isn't a number — it's a document that names the choice and the tradeoffs.\n\n" +
"## What you'll build this week\n" +
"Take ONE of your existing models. Pick a protected attribute. Run a Fairlearn audit. Quantify the disparity. Name three mitigation options. Write a BIAS.md document. Publish it next to the model."
      ),
      V("ML fairness explained","https://www.youtube.com/watch?v=jIXIuYdnyyk",10,"various","Watch first. Plain-English overview of fairness definitions with worked examples. Frames the rest of the week."),
      V("Why removing the sensitive attribute isn't enough","https://www.youtube.com/watch?v=fMym_BKWQzk",6,"various","Watch second. Proxy variables, why 'fairness through unawareness' fails, with concrete cases."),
      S([
        { prompt: "Demographic parity, equal opportunity, and equalised odds are all the SAME definition of fairness in different words.", answer: false, whenRight: "Right — no. They're distinct definitions that can disagree about whether the same model is fair. Pick one based on context.", whenWrong: "Distinct definitions. They can disagree on the same model. The right one depends on which kind of error is the harm." },
        { prompt: "If a model has fundamentally different base rates across groups, it CAN'T simultaneously satisfy all fairness definitions.", answer: true, whenRight: "Right — that's the Chouldechova / Kleinberg impossibility result. Mathematical, not opinion.", whenWrong: "Yes — mathematical fact. Different base rates force a tradeoff; you pick which definition matters." },
        { prompt: "Removing race or gender from the input features makes a model fair.", answer: false, whenRight: "Right — no. Proxy variables (zip code, name, tenure) carry the same information. Fairness is measured on OUTPUTS, not by hiding inputs.", whenWrong: "Proxies defeat input-side fixes. Zip code → race; name → gender. Measure fairness on outputs (TPR, FPR), not by removing inputs." }
      ]),
      E("Your turn — pick a model + group","[WRITE] In `bias/INTRO.md`:\n1. Pick ONE of your models from a previous week.\n2. Name the most likely protected attribute that could matter (age, gender, race, etc.).\n3. State which definition of fairness is most appropriate for the decision the model is making + why.\n4. Sample the data: does the protected attribute exist or is it inferable from proxies? Document both.")
    ]),
    D(2,"Pick model + sensitive attribute","Be honest about which is most at risk.",[
      L("Picking the right model + the right attribute",
"## The model\n" +
"For a meaningful audit, you want a model that:\n" +
"- Makes a DECISION (classification, ranking, allocation) — not just a forecast\n" +
"- Has held-out predictions you can analyse\n" +
"- Has sample-level features that include or proxy a protected attribute\n\n" +
"Best candidates from your portfolio:\n" +
"- **Reddit Sentiment classifier** — protected attribute proxy via username demographics\n" +
"- **Capstone classifier** — if it's a classification task\n" +
"- **Any image classifier from W34** — if the dataset has demographic metadata\n\n" +
"Avoid: pure forecasting models (no individual decisions to audit).\n\n" +
"## The attribute\n" +
"Pick the protected attribute MOST LIKELY to expose a disparity. Don't pick the 'safest' one (race in a model with no race signal — you'll find no disparity and learn nothing).\n\n" +
"Common protected attributes:\n" +
"- **Gender** (binary, ternary, or self-reported)\n" +
"- **Race / ethnicity**\n" +
"- **Age** (often binned: <25, 25-45, 45+)\n" +
"- **Disability status**\n" +
"- **Geography / nationality**\n\n" +
"For a Reddit classifier: gender proxy via name analysis. For an image classifier: dataset-provided demographic labels (FairFace, UTKFace). For a capstone: whatever attribute the data plausibly contains.\n\n" +
"## What if your data doesn't have a protected attribute?\n" +
"Two honest options:\n" +
"1. **Use a public benchmark dataset** with known protected attributes (Adult Income, COMPAS, German Credit). These are the textbook fairness datasets for a reason.\n" +
"2. **Infer the attribute from a proxy** with a clearly documented limitation. E.g., infer gender from first name via Genderize.io. Cite the inference, note the error rate.\n\n" +
"What's NOT acceptable: 'my data doesn't have protected attributes so fairness doesn't apply'. That's how disparities ship.\n\n" +
"## The Adult Income dataset (recommended for the audit)\n" +
"```python\n" +
"import pandas as pd\n" +
"url = 'https://archive.ics.uci.edu/ml/machine-learning-databases/adult/adult.data'\n" +
"cols = ['age','workclass','fnlwgt','education','education_num','marital_status',\n" +
"        'occupation','relationship','race','sex','capital_gain','capital_loss',\n" +
"        'hours_per_week','native_country','income']\n" +
"df = pd.read_csv(url, names=cols, na_values=' ?', skipinitialspace=True).dropna()\n" +
"df['income_50k'] = (df['income'] == '>50K').astype(int)\n" +
"```\n\n" +
"Adult Income: predict whether someone earns >$50k. Sensitive attributes: sex, race. Documented disparities. Classic fairness audit target."
      ),
      S([
        { prompt: "For a meaningful audit, pick a model that makes DECISIONS (classification, ranking), not pure forecasts.", answer: true, whenRight: "Right — fairness is about decisions for individuals. Forecasts about aggregates don't have group-disparity in the same sense.", whenWrong: "Yes — decisions for individuals are auditable. Forecasts (e.g., 'demand will be X') don't have a per-person decision to audit." },
        { prompt: "If your data doesn't have a protected attribute column, fairness analysis doesn't apply.", answer: false, whenRight: "Right — no. Use a public benchmark, or infer the attribute from a proxy with a documented error rate. 'No column' is not 'no disparity'.", whenWrong: "Disparities exist whether or not you measure. Public datasets exist for this; proxy inference is acceptable with documented limitations." },
        { prompt: "Adult Income, COMPAS, and German Credit are standard public benchmarks for fairness audits.", answer: true, whenRight: "Right — textbook datasets with known protected attributes and known disparities. Good targets for a learner audit.", whenWrong: "Yes — public benchmarks. Adult Income (sex, race), COMPAS (race), German Credit (age, sex). All free to download." }
      ]),
      E("Your turn — pick + load","[CODE] In `bias/01_setup.ipynb`:\n1. Load either your existing model + data, OR the Adult Income dataset.\n2. Print the distribution of the protected attribute.\n3. Print the base rate of the outcome by protected group (the disparity to be checked).\n4. Decide which fairness definition applies. Document why in `bias/SETUP.md`.")
    ]),
    D(3,"Run a Fairlearn audit","Disparity metrics across groups.",[
      L("Fairlearn — the standard auditing library",
"## Install + import\n" +
"```bash\n" +
"pip install fairlearn scikit-learn\n" +
"```\n\n" +
"## The audit workflow\n" +
"```python\n" +
"import pandas as pd\n" +
"from sklearn.model_selection import train_test_split\n" +
"from sklearn.linear_model import LogisticRegression\n" +
"from fairlearn.metrics import MetricFrame, selection_rate, true_positive_rate, false_positive_rate\n" +
"from sklearn.metrics import accuracy_score\n\n" +
"# Train a model on Adult Income\n" +
"X = pd.get_dummies(df.drop(columns=['income','income_50k']), drop_first=True)\n" +
"y = df['income_50k']\n" +
"sex = df['sex']   # protected attribute, KEEP for analysis\n\n" +
"X_tr, X_te, y_tr, y_te, s_tr, s_te = train_test_split(\n" +
"    X, y, sex, test_size=0.3, random_state=42, stratify=y)\n\n" +
"model = LogisticRegression(max_iter=2000).fit(X_tr, y_tr)\n" +
"y_hat = model.predict(X_te)\n\n" +
"# Now the audit\n" +
"frame = MetricFrame(\n" +
"    metrics={\n" +
"        'accuracy': accuracy_score,\n" +
"        'selection_rate': selection_rate,\n" +
"        'TPR': true_positive_rate,\n" +
"        'FPR': false_positive_rate,\n" +
"    },\n" +
"    y_true=y_te,\n" +
"    y_pred=y_hat,\n" +
"    sensitive_features=s_te,\n" +
")\n\n" +
"print(frame.overall)         # overall metrics\n" +
"print(frame.by_group)        # metrics for each group\n" +
"print(frame.difference())    # max - min disparity per metric\n" +
"print(frame.ratio())         # min / max ratio per metric\n" +
"```\n\n" +
"## What you'll typically see on Adult Income (sex)\n" +
"```text\n" +
"by_group:\n" +
"            accuracy  selection_rate  TPR   FPR\n" +
"Female       0.92      0.07            0.61  0.04\n" +
"Male         0.84      0.31            0.67  0.13\n" +
"\n" +
"difference():\n" +
"  selection_rate   0.24    <- women selected at 7%, men at 31%\n" +
"  TPR              0.06    <- of qualified, women hit 61%, men 67%\n" +
"  FPR              0.09    <- women's false positives 4%, men's 13%\n" +
"```\n\n" +
"Read that table out loud. Among people who DO earn >$50k, the model identifies men at 67% but women only at 61%. Among people who DON'T, it falsely flags men at 13% and women at 4%. The model is more 'eager' on men than women — partly because it's reflecting historical training-data patterns.\n\n" +
"## The 'four-fifths rule'\n" +
"US EEOC's rough thumb-rule for selection-rate disparity: the selection rate of the lower-rate group should be ≥ 4/5 (80%) of the higher. On Adult Income with sex: 0.07 / 0.31 = 0.23 → fails the four-fifths rule by a long way. That's actionable.\n\n" +
"## Save the audit\n" +
"```python\n" +
"frame.by_group.to_csv('bias/audit_by_group.csv')\n" +
"```"
      ),
      S([
        { prompt: "Fairlearn's MetricFrame returns metrics BROKEN DOWN by protected group, plus overall disparity numbers.", answer: true, whenRight: "Right — that's exactly what you need for an audit: per-group + max/min difference + min/max ratio.", whenWrong: "Yes — by-group + disparity. The standard audit output." },
        { prompt: "Equal accuracy across groups guarantees the model is fair.", answer: false, whenRight: "Right — no. Accuracy can be equal while TPR and FPR are very different. The relevant disparity depends on which errors matter.", whenWrong: "Equal accuracy ≠ equal fairness. The same accuracy can hide very different TPR/FPR breakdowns by group." },
        { prompt: "The four-fifths rule says the selection rate of the lower-rate group should be at least 80% of the higher-rate group's.", answer: true, whenRight: "Right — EEOC rule-of-thumb. Useful as a threshold even outside US employment contexts.", whenWrong: "Yes — 4/5 rule. If lower-rate group / higher-rate group < 0.8, that's an actionable disparity." }
      ]),
      E("Your turn — run the audit","[CODE] In `bias/02_audit.ipynb`:\n1. Train your model on the data from Day 2.\n2. Run a Fairlearn MetricFrame with: accuracy, selection_rate, TPR, FPR.\n3. Print by_group + difference + ratio.\n4. Save by_group to `bias/audit_by_group.csv`.\n5. Markdown: which metric shows the largest disparity?")
    ]),
    D(4,"Quantify the disparity","Put a number on the gap.",[
      L("Quantifying — the line a stakeholder cares about",
"## What it is\n" +
"Yesterday's audit gave you a table of per-group metrics. Today you turn it into a few HEADLINE numbers a stakeholder can act on.\n\n" +
"## The numbers that matter\n" +
"```text\n" +
"1. Demographic parity gap:\n" +
"   max(selection_rate) - min(selection_rate)\n" +
"\n" +
"2. Equal opportunity gap:\n" +
"   max(TPR) - min(TPR)\n" +
"\n" +
"3. Equalised odds gap (the worse of TPR diff and FPR diff)\n" +
"\n" +
"4. Four-fifths ratio:\n" +
"   min(selection_rate) / max(selection_rate)\n" +
"   < 0.8 fails the EEOC rule\n" +
"```\n\n" +
"## A clean output\n" +
"```python\n" +
"summary = {\n" +
"    'demographic_parity_gap': frame.difference()['selection_rate'],\n" +
"    'equal_opportunity_gap':  frame.difference()['TPR'],\n" +
"    'equalised_odds_gap':     max(frame.difference()['TPR'], frame.difference()['FPR']),\n" +
"    'four_fifths_ratio':      frame.ratio()['selection_rate'],\n" +
"}\n" +
"for k, v in summary.items():\n" +
"    print(f'{k:30s}: {v:.3f}')\n\n" +
"# demographic_parity_gap        : 0.241   <- 24 percentage points\n" +
"# equal_opportunity_gap         : 0.060\n" +
"# equalised_odds_gap            : 0.092\n" +
"# four_fifths_ratio             : 0.226   <- fails the 80% rule\n" +
"```\n\n" +
"## Contextualize the gap\n" +
"A 24 percentage-point selection-rate gap isn't a number; it's a description. Translate it for the audit:\n" +
"\n" +
"> 'On the held-out test set of 9,768 people, the model selects 31% of men but only 7% of women for the positive outcome. For 50 people of each sex, the model would select 15 men and 4 women on average — a 4× disparity in raw selection. This violates the EEOC four-fifths rule (ratio 0.23, threshold 0.8).'\n\n" +
"That paragraph is the line stakeholders argue about. The disparity number alone is jargon; the consequence framing is what gets discussed.\n\n" +
"## Confidence intervals on the gap\n" +
"For a small sample, your disparity number has uncertainty. Bootstrap it:\n" +
"```python\n" +
"import numpy as np\n" +
"gaps = []\n" +
"for _ in range(1000):\n" +
"    idx = np.random.choice(len(y_te), size=len(y_te), replace=True)\n" +
"    f = MetricFrame(metrics=selection_rate, y_true=y_te.iloc[idx],\n" +
"                    y_pred=y_hat[idx], sensitive_features=s_te.iloc[idx])\n" +
"    gaps.append(f.difference())\n" +
"print(f'95% CI for disparity: [{np.percentile(gaps,2.5):.3f}, {np.percentile(gaps,97.5):.3f}]')\n" +
"```\n\n" +
"## What to put in the memo\n" +
"- The headline number\n" +
"- The CONSEQUENCE translation (50-person scenario or similar)\n" +
"- The four-fifths rule comparison\n" +
"- The CI to show this isn't a fluke of the sample"
      ),
      S([
        { prompt: "A 24-percentage-point disparity number alone is more persuasive than the same number translated into a per-50-people consequence.", answer: false, whenRight: "Right — no. Stakeholders argue about consequences, not jargon. '15 men selected vs 4 women' lands; '0.24 disparity' doesn't.", whenWrong: "Translate to people. Decision-makers don't act on the number; they act on the consequence framing." },
        { prompt: "A four-fifths ratio below 0.8 is the EEOC threshold for actionable disparity.", answer: true, whenRight: "Right — < 0.8 = the lower-rate group is being selected at less than 80% of the higher rate. EEOC rule-of-thumb.", whenWrong: "Yes — < 0.8 fails the four-fifths rule. A useful threshold for triaging which disparities need action." },
        { prompt: "Bootstrapping the disparity gives you a confidence interval that shows the gap isn't just sample noise.", answer: true, whenRight: "Right — same logic as bootstrapping any statistic. Without CI, you can't distinguish a real disparity from sampling fluctuation.", whenWrong: "Yes — CI = is this real? A point estimate alone could be a fluke; the CI tells you whether to trust it." }
      ]),
      E("Your turn — quantify","[CODE] 1. Compute the four headline numbers.\n2. Translate the disparity into a per-50-people (or similar) consequence sentence.\n3. Bootstrap a 95% CI for the most-relevant disparity.\n4. Save as `bias/QUANTIFY.md`.")
    ]),
    D(5,"Mitigation options","Three approaches: data, model, post-processing.",[
      L("Three places to intervene",
"## What it is\n" +
"You've found the disparity. Now: what would you DO about it? An honest audit names three options, costs them, and lets the team / stakeholder pick.\n\n" +
"## Approach 1 — DATA-side mitigation\n" +
"Fix the disparity in the training data BEFORE training.\n" +
"- **Re-weighting**: give samples from the under-selected group higher weight in training\n" +
"- **Re-sampling**: oversample the under-selected group, undersample the over-selected one\n" +
"- **Synthetic data**: generate plausible examples for the under-represented group (SMOTE, etc.)\n\n" +
"```python\n" +
"# Re-weighting example\n" +
"from sklearn.linear_model import LogisticRegression\n" +
"weights = df.groupby('sex')['income_50k'].transform(lambda x: 1/x.mean())\n" +
"model = LogisticRegression(max_iter=2000)\n" +
"model.fit(X_tr, y_tr, sample_weight=weights[X_tr.index])\n" +
"```\n\n" +
"Pros: model-agnostic; preserves model architecture.\n" +
"Cons: doesn't address why the data was imbalanced; may not fully close the gap.\n\n" +
"## Approach 2 — MODEL-side mitigation\n" +
"Train the model with fairness as a constraint or penalty.\n\n" +
"```python\n" +
"from fairlearn.reductions import ExponentiatedGradient, DemographicParity\n" +
"constraint = DemographicParity()\n" +
"mitigator = ExponentiatedGradient(\n" +
"    estimator=LogisticRegression(max_iter=2000),\n" +
"    constraints=constraint,\n" +
")\n" +
"mitigator.fit(X_tr, y_tr, sensitive_features=s_tr)\n" +
"y_hat = mitigator.predict(X_te)\n" +
"```\n\n" +
"Pros: directly optimises for the fairness definition.\n" +
"Cons: may cost accuracy; choice of constraint matters.\n\n" +
"## Approach 3 — POST-PROCESSING\n" +
"Take a trained model's predictions and adjust them to satisfy fairness AFTER the fact.\n\n" +
"```python\n" +
"from fairlearn.postprocessing import ThresholdOptimizer\n" +
"adj = ThresholdOptimizer(\n" +
"    estimator=model,\n" +
"    constraints='equalized_odds',\n" +
"    prefit=True,\n" +
")\n" +
"adj.fit(X_tr, y_tr, sensitive_features=s_tr)\n" +
"y_hat = adj.predict(X_te, sensitive_features=s_te)\n" +
"```\n\n" +
"Pros: doesn't require retraining; easy to swap in.\n" +
"Cons: uses different thresholds for different groups (legally fraught in some jurisdictions); transparent to scrutiny.\n\n" +
"## The accuracy tradeoff\n" +
"Every mitigation costs SOMETHING — usually a percentage point or two of accuracy. The honest comparison:\n" +
"```text\n" +
"                          accuracy   disparity (selection_rate gap)\n" +
"Original model              0.85          0.241\n" +
"Re-weighted                 0.83          0.180\n" +
"Demographic-parity (model)  0.81          0.045\n" +
"Threshold-optimized (post)  0.84          0.060\n" +
"```\n\n" +
"That table is what stakeholders look at. They pick the row that matches their values — there's no math answer.\n\n" +
"## What goes in the memo\n" +
"- Each of the three approaches in a sentence\n" +
"- The accuracy / disparity table\n" +
"- Which approach you'd recommend and why (your judgment, transparently)"
      ),
      S([
        { prompt: "Every fairness mitigation typically costs some accuracy.", answer: true, whenRight: "Right — there's almost always a tradeoff. The honest audit shows the table; doesn't hide the cost.", whenWrong: "Yes — always a tradeoff. Pretending fairness is free is dishonest; quantifying the cost is the senior move." },
        { prompt: "Post-processing (different thresholds for different groups) is legally uncontroversial everywhere.", answer: false, whenRight: "Right — no. Group-specific thresholds are legally fraught in many US employment contexts (disparate-treatment risk). Document this in the memo.", whenWrong: "Legally fraught in some jurisdictions. The audit must note this; pick deliberately." },
        { prompt: "Naming three mitigation options with their costs is more credible than recommending only one.", answer: true, whenRight: "Right — three options + costs = stakeholder can choose. One recommendation = you've decided their values for them.", whenWrong: "Yes — options + costs. The audit informs; the decision belongs to the stakeholders. Three options = real choice." }
      ]),
      E("Your turn — mitigate","[CODE] In `bias/03_mitigate.ipynb`:\n1. Implement all three approaches (re-weighting, ExponentiatedGradient, ThresholdOptimizer).\n2. Build the comparison table: accuracy + headline disparity for each.\n3. Save the table as `bias/mitigation_comparison.csv`.\n4. Markdown: which would you recommend and why?")
    ]),
    D(6,"Write BIAS.md","Production-grade audit document.",[
      L("BIAS.md — the document that ships with the model",
"## What it is\n" +
"A single audit document that lives in the repo next to the model. Anyone using the model should read this BEFORE deploying it. ~1-2 pages.\n\n" +
"## The template\n" +
"```markdown\n" +
"# Fairness audit — <model name>\n" +
"\n" +
"**Audit date:** <YYYY-MM-DD>\n" +
"**Auditor:** <your name>\n" +
"**Model version:** <git tag or commit>\n" +
"\n" +
"## What the model does\n" +
"<One sentence. Decision being made, who is affected.>\n" +
"\n" +
"## Protected groups audited\n" +
"<List: sex, race, age band, etc. Explain why these and not others.>\n" +
"\n" +
"## Fairness definition\n" +
"<Which one applies + why. Demographic parity / equal opportunity / equalised odds.>\n" +
"\n" +
"## Headline disparities\n" +
"| Metric                  | Value    | Threshold | Status |\n" +
"|-------------------------|----------|-----------|--------|\n" +
"| Selection rate gap      | 0.24     | < 0.10    | FAIL   |\n" +
"| Equal opportunity gap   | 0.06     | < 0.05    | FAIL   |\n" +
"| Four-fifths ratio       | 0.23     | > 0.80    | FAIL   |\n" +
"\n" +
"95% bootstrapped CI on selection rate gap: [0.22, 0.26].\n" +
"\n" +
"## Consequence in plain language\n" +
"<Per-50-people or per-1000-decisions translation.>\n" +
"\n" +
"## Mitigation options considered\n" +
"| Approach              | Accuracy | Selection rate gap | Recommended |\n" +
"|-----------------------|----------|--------------------|-------------|\n" +
"| Original              | 0.85     | 0.24               | No          |\n" +
"| Re-weighting          | 0.83     | 0.18               | No (gap still high) |\n" +
"| ExponentiatedGradient | 0.81     | 0.045              | **Yes**     |\n" +
"| ThresholdOptimizer    | 0.84     | 0.06               | Conditional (see legal) |\n" +
"\n" +
"## Recommendation\n" +
"<One paragraph. Which mitigation + why + what the team needs to accept.>\n" +
"\n" +
"## Limitations of this audit\n" +
"- Protected groups audited: <list>. Not audited: <list>, because <reason>.\n" +
"- Sample size in smallest group: N=<number>. Below this, disparity is noisy.\n" +
"- This audit is point-in-time; rerun after retraining or data drift.\n" +
"- Fairness metrics audited: <list>. Other definitions may give different results.\n" +
"\n" +
"## Decision\n" +
"<Filled in by the stakeholder, not the auditor. 'Deploy with ExponentiatedGradient mitigation' OR 'Do not deploy until <fix>' OR 'Accept disparity given context, document for review at next audit'.>\n" +
"```\n\n" +
"## Why a document, not a notebook\n" +
"- Stakeholders don't open notebooks\n" +
"- The audit gets read by people who didn't run it\n" +
"- It needs to live next to the model forever, not get lost in `notebooks/06_audit.ipynb`\n\n" +
"## Why a 'Decision' section the auditor doesn't fill\n" +
"The auditor MEASURES + RECOMMENDS. The team / stakeholder DECIDES + DOCUMENTS. Keeping these separated keeps responsibility clear.\n\n" +
"## What separates this from junior fairness work\n" +
"- A specific fairness definition NAMED, not 'unfairness'\n" +
"- A concrete threshold per metric (you decided what 'pass' means)\n" +
"- A mitigation comparison TABLE, not 'further work needed'\n" +
"- Limitations named SPECIFICALLY (groups not audited, smallest-group N)\n" +
"- A Decision section that recognises the audit isn't the deployer's call"
      ),
      S([
        { prompt: "A fairness audit lives in BIAS.md next to the model, not in a notebook that only the auditor reads.", answer: true, whenRight: "Right — audits get read by people who didn't run them. The document lives in the repo, not in a notebook.", whenWrong: "Yes — markdown doc next to the model. Notebooks get buried; BIAS.md surfaces." },
        { prompt: "The auditor should fill in the 'Decision' section themselves to speed things up.", answer: false, whenRight: "Right — no. Auditor measures + recommends; stakeholder decides + documents. Keeping these separate keeps responsibility clear.", whenWrong: "Separation of roles. Auditor: measures, recommends. Stakeholder: decides. Conflating them muddies accountability." },
        { prompt: "Naming specific groups you did NOT audit, and why, is more credible than only listing the groups you did.", answer: true, whenRight: "Right — the omissions are part of the audit. Naming what you didn't check + why prevents 'silent' bias.", whenWrong: "Yes — name omissions. Unstated scope = hidden assumptions. Stating what wasn't audited prevents future misuse." }
      ]),
      E("Your turn — BIAS.md","[WRITE] 1. Open `bias/BIAS.md`.\n2. Fill EVERY section of the template.\n3. The 'Limitations' section must name at least 2 protected groups you did NOT audit, with reasons.\n4. The 'Decision' section stays empty (it's for the stakeholder).\n5. Commit.")
    ]),
    D(7,"Ship + update README","Point future readers to BIAS.md.",[
      L("Updating the model's README + shipping the audit",
"## What goes in the model's main README\n" +
"At the TOP of the README (above 'How to use'), a clearly visible block:\n\n" +
"```markdown\n" +
"## ⚠️ Fairness audit\n" +
"\n" +
"This model has been audited for group fairness on **sex** as a protected\n" +
"attribute. Key findings:\n" +
"\n" +
"- Selection-rate gap: 0.24 (fails EEOC four-fifths rule)\n" +
"- With ExponentiatedGradient mitigation, gap reduces to 0.045 at a cost of\n" +
"  0.04 in accuracy.\n" +
"- See [BIAS.md](BIAS.md) for the full audit and mitigation comparison.\n" +
"\n" +
"**Other protected groups (race, age) have not been audited.** Do not deploy\n" +
"in contexts where those disparities would matter without re-auditing.\n" +
"```\n\n" +
"## Why this matters at the README level\n" +
"- Anyone shallow-cloning the repo sees it on the first scroll\n" +
"- Future-you (or another engineer) is warned before deploying\n" +
"- 'No README warning' is how disparities ship — make absence-of-warning impossible\n\n" +
"## The dev.to post (~700 words)\n" +
"```text\n" +
"1. Hook — '<Model> selects men at 31% and women at 7% for the same positive\n" +
"            outcome. Here's the audit that found it.'\n" +
"2. The model + task — 1 paragraph\n" +
"3. The audit — Fairlearn table excerpt\n" +
"4. The translation — per-50-people consequence\n" +
"5. Three mitigations + table\n" +
"6. What I recommended + why\n" +
"7. Limitations honestly named\n" +
"8. Link to BIAS.md + the repo\n" +
"```\n\n" +
"## Tag and ship\n" +
"```bash\n" +
"git add bias/ BIAS.md README.md\n" +
"git commit -m \"Fairness audit: <disparity number> on <protected attribute>, mitigation recommended\"\n" +
"git tag bias-shipped\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## Why this is a hiring signal\n" +
"- Most learner ML projects don't have BIAS.md at all\n" +
"- Most senior ML candidates can't show one either\n" +
"- A clean fairness audit with a quantified gap + mitigation comparison + named limitations is rare and instantly distinguishes you\n\n" +
"## What you've built in two weeks (W35-W36)\n" +
"- A causal analysis with DAG + PSM + sensitivity (W35)\n" +
"- A fairness audit with disparity quantification + mitigation comparison (W36)\n\n" +
"Two artifacts that together demonstrate the senior-DS skill set: not just 'I trained a model' but 'I know how it could be wrong, and I have the methodology to check.'"
      ),
      S([
        { prompt: "Putting the fairness audit summary at the TOP of the README is more useful than burying it in a docs folder.", answer: true, whenRight: "Right — anyone shallow-cloning sees the warning. Burying it = future deployers miss it = disparities ship.", whenWrong: "Yes — README top. Surface the warning; never assume future readers will dig." },
        { prompt: "Naming groups you DID NOT audit is just an apology — it doesn't strengthen the work.", answer: false, whenRight: "Right — no. Named omissions prevent future misuse. They're part of what makes the audit honest.", whenWrong: "Named omissions are part of the audit. They scope what's been checked + warn against misuse." },
        { prompt: "Shipping both a causal analysis (W35) and a fairness audit (W36) puts you in the senior-DS conversation.", answer: true, whenRight: "Right — these are senior-coded skills most candidates can't show. Two shipped artifacts = a meaningful differentiator.", whenWrong: "Yes — rare combination. Most candidates show neither. You show both with shipped artifacts and writeups." }
      ]),
      E("Your turn — ship bias-shipped","[PRODUCE] 1. Update the model's main README with the ⚠️ Fairness audit block at the top.\n2. Write the dev.to post; publish.\n3. Commit + tag:\n`git add . && git commit -m 'bias-shipped: fairness audit + mitigation comparison'`\n`git tag bias-shipped && git push --tags`\n\nPASS:\n[x] bias/01_setup.ipynb\n[x] bias/02_audit.ipynb (Fairlearn MetricFrame)\n[x] bias/03_mitigate.ipynb (3 approaches + comparison table)\n[x] bias/BIAS.md (production-grade)\n[x] README updated with audit block\n[x] dev.to post published\n[x] bias-shipped tag pushed")
    ])
  ]
};

/* ═══════════════════════════════════════════════════════════
   VALIDATE + WRITE
   ═══════════════════════════════════════════════════════════ */
const newWeeks = [W35, W36];
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

ds.weeks.splice(34, 2, ...newWeeks);

fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log(`SUCCESS — DS W35-W36 rebuilt. Total weeks: ${ds.weeks.length}`);
