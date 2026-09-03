const fs = require('fs');
const FILE = 'C:/Users/Abdoulie Balisa/OneDrive/Desktop/FORGE/data/roadmaps/data-science.json';
const ds = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const L = (title, body) => ({ kind: 'lesson', title, body });
const V = (title, url, dm, creator, why) => ({ kind: 'video', title, url, duration_min: dm, creator, why });
const S = (cards) => ({ kind: 'swipe', title: 'Quick check — swipe to answer', cards });
const E = (title, body) => ({ kind: 'exercise', title, body });
const RD = (title, url, why) => ({ kind: 'reading', title, url, why });
const D = (number, title, summary, items) => ({ number, title, summary, items });

/* ════ WEEK 14 — A/B testing + experimentation ════ */
const W14 = {
  number: 14, title: "A/B testing + experimentation",
  phase: "Modeling", commitment_hours: "12-15",
  context: ds.weeks[13].context,
  concept_check: [
    { q: "What is the point of an A/B test, versus just comparing two numbers?",
      choices: ["It makes the result look more official","It tells you whether an observed difference is real or could be random chance, before you act on it","It always picks the bigger number","It speeds up the experiment"],
      correct: 1, explain: "Two accuracy numbers always differ a little. An A/B test with a significance check tells you whether the gap is large enough to be unlikely under chance — the difference between 'B looks better' and 'B is reliably better, ship it.'" },
    { q: "Why calculate the required sample size BEFORE running the experiment?",
      choices: ["To make the test run faster","Too few samples can't detect a real effect; too many waste resources — power analysis finds the right n",
        "Because the API requires it","To pick which prompt wins"],
      correct: 1, explain: "Power analysis tells you how many samples you need to reliably detect an effect of a given size. Under-powered tests miss real effects; over-powered ones waste time and money. You size the test to the effect you care about." },
    { q: "Your treatment prompt scores 78% vs the control's 75%, p = 0.42. What do you conclude?",
      choices: ["Ship the treatment — it's higher","Not significant — the 3-point gap could easily be chance; don't ship on this evidence","The test is broken","Run it again until it's significant"],
      correct: 1, explain: "p = 0.42 means a gap this size would occur 42% of the time even if the prompts were equally good. That's not evidence. Shipping on it — or re-running until you get a low p (p-hacking) — is exactly the mistake rigour prevents." }
  ],
  days: [
    D(1,"What an A/B test really is","Comparing two versions with enough rigour to act on the result.",[
      L("A/B testing — controlled comparison",
"## What it is\n" +
"An **A/B test** compares two versions of something — a model, a prompt, a feature, an email — by splitting subjects into a **control (A)** and a **treatment (B)**, then measuring which performs better on a metric. The statistics tell you whether the difference is **real or noise**.\n\n" +
"## Why informal comparison isn't enough\n" +
"You've been comparing models casually ('XGBoost beat linear'). But two numbers *always* differ slightly. The question that matters is: would this gap appear by chance even if the two were truly equal? An A/B test answers that with the hypothesis-testing tools from Week 6 — a difference is only a 'win' if it's **statistically significant**.\n\n" +
"## The structure of a sound experiment\n" +
"1. **Hypothesis** — stated before you look ('strict-mode prompt improves accuracy')\n" +
"2. **Metric** — one number you'll compare (classification accuracy)\n" +
"3. **Sample size** — computed up front via power analysis\n" +
"4. **Same conditions** — both arms see the *same* data, same model, fixed random seed\n" +
"5. **Significance test** — is the gap unlikely under chance?\n" +
"6. **Verdict** — ship / don't ship, with the number behind it\n\n" +
"## Where this fits\n" +
"This week you A/B test two **system prompts** for your Reddit sentiment classifier — does a stricter, sarcasm-aware prompt actually beat a plain one? You'll size the test, run both on the same posts, and write a verdict backed by a p-value."
      ),
      V("A/B testing fundamentals for data science","https://www.youtube.com/watch?v=DUNk4GPZ9bw",12,"Data Professor","What an A/B test is, control vs treatment, and reading significance."),
      L("Control vs treatment — the discipline of one change",
"## Change exactly ONE thing\n" +
"The core rule of a clean experiment: control and treatment must be **identical except for the one thing you're testing**. If prompt B is both stricter AND uses a different model, and B wins, you can't tell which change caused it. **Confounding** ruins the conclusion.\n\n" +
"For this week:\n" +
"- **A (control):** 'Classify the sentiment. Reply POSITIVE / NEGATIVE / NEUTRAL.'\n" +
"- **B (treatment):** same task, but adds strict-mode + a sarcasm rule.\n" +
"Same model (gpt-4o-mini), same 100 posts, same temperature=0. Only the prompt wording differs — so any accuracy gap is attributable to the prompt.\n\n" +
"## Why temperature=0\n" +
"A model at temperature 0 is (near) deterministic — same input, same output. That removes a source of random variation so your comparison isolates the prompt, not the model's sampling noise. Controlling every variable you can is what makes the one variable you're testing measurable."
      ),
      S([
        { prompt: "An A/B test tells you whether a difference between two versions is real or could be random chance.", answer: true, whenRight: "Right — that's its whole job: separating a real effect from noise before you act on it.", whenWrong: "That's the point of the significance test inside an A/B test: is the gap real, or would it happen by chance anyway?" },
        { prompt: "In a clean experiment, the treatment can differ from the control in several ways at once.", answer: false, whenRight: "Right — change exactly ONE thing. Multiple changes = confounding = you can't attribute the result.", whenWrong: "Change only one variable. If B differs in two ways and wins, you can't tell which change caused it (confounding).", sim: "A: plain prompt, gpt-4o-mini\nB: strict prompt, gpt-4o-mini  # only prompt differs" },
        { prompt: "Running the model at temperature=0 reduces random variation so the comparison isolates the prompt.", answer: true, whenRight: "Right — near-deterministic output removes sampling noise, so the only thing varying is the prompt you're testing.", whenWrong: "temperature=0 makes output (near) deterministic, stripping out model randomness so the prompt is the only variable." }
      ]),
      E("Your turn — define the two arms","[CODE] In your reddit-sentiment repo, create `ab/prompts.py` with two system prompts:\n- PROMPT_A (control): plain 'Classify the sentiment. Reply POSITIVE / NEGATIVE / NEUTRAL.'\n- PROMPT_B (treatment): same task + 'Be strict — sarcasm is NEGATIVE.'\nIn a markdown note, state your hypothesis (does B beat A?) and confirm what's held constant (model, data, temperature).")
    ]),
    D(2,"Define the experiment + hypothesis","Commit to what you're testing and how you'll judge it.",[
      L("Stating a falsifiable experiment",
"## What it is\n" +
"Before running anything, you write the experiment down — the same pre-registration discipline from Week 6, applied to a comparison:\n\n" +
"```text\n" +
"HYPOTHESIS: The strict/sarcasm-aware prompt (B) improves classification\n" +
"            accuracy over the plain prompt (A) on r/ML posts.\n" +
"METRIC:     Accuracy against the 100-post hand-labelled gold set.\n" +
"DECISION:   Ship B only if it beats A AND the difference is significant (p < 0.05).\n" +
"```\n\n" +
"## Why write the decision rule first\n" +
"If you decide *afterward* what counts as a win, you'll rationalise whatever you see. Committing to 'ship B only if significant at p<0.05' *before* the data removes the temptation to move the goalposts. This is the guardrail against fooling yourself — the single most important habit in experimentation.\n\n" +
"## The gold set is your judge\n" +
"You already built a 100-post hand-labelled gold set in Week 13. That's the ground truth both prompts are scored against. Reusing it means the experiment is grounded in labels you trust, not in the model's own opinions.\n\n" +
"## Where this fits\n" +
"Today you write `ab/EXPERIMENT.md` stating the hypothesis, metric, and decision rule. Tomorrow you compute how many posts you actually need."
      ),
      S([
        { prompt: "Writing the decision rule ('ship only if p<0.05') BEFORE seeing results guards against rationalising.", answer: true, whenRight: "Right — pre-committing the rule stops you moving the goalposts to fit whatever you observe.", whenWrong: "Pre-registering the decision rule is the guardrail. Decide what counts as a win before the data, not after." },
        { prompt: "It's fine to use the model's own predictions as the ground truth for scoring both prompts.", answer: false, whenRight: "Right — no. You score against the hand-labelled gold set (Week 13). Self-grading is circular.", whenWrong: "Use the gold set as ground truth. Scoring against the model's own opinions is circular and meaningless." },
        { prompt: "A hypothesis like 'B improves accuracy over A' is testable because it can be proven wrong.", answer: true, whenRight: "Right — falsifiable: if B doesn't beat A significantly, the hypothesis fails. That's what makes it scientific.", whenWrong: "It's falsifiable — a clear result (B ≤ A, or not significant) disproves it. Testability requires it can fail." }
      ]),
      E("Your turn — write the experiment spec","[WRITE] Create `ab/EXPERIMENT.md` stating:\n1. Hypothesis (one sentence).\n2. Metric (accuracy vs the gold set).\n3. Decision rule (ship B only if it beats A and p < 0.05).\n4. What's held constant across both arms.")
    ]),
    D(3,"Sample size + statistical power","How many samples to reliably detect the effect you care about.",[
      L("Power analysis — sizing the experiment",
"## What it is\n" +
"**Statistical power** is the probability your test detects a real effect when one exists. Convention: 80% power. **Power analysis** works backward from the effect you care about to the sample size you need:\n\n" +
"```python\n" +
"from statsmodels.stats.power import zt_ind_solve_power\n" +
"# Detect a moderate effect (0.2) at 80% power, 5% significance\n" +
"n = zt_ind_solve_power(effect_size=0.2, alpha=0.05, power=0.8)\n" +
"print(f'Need ~{int(n)} samples per arm')\n" +
"```\n\n" +
"## The three knobs\n" +
"- **effect_size** — how big a difference you want to be able to detect. Smaller effects need more data.\n" +
"- **alpha** — false-positive rate (0.05 = the significance threshold)\n" +
"- **power** — true-positive rate (0.8 = detect a real effect 80% of the time)\n\n" +
"## Why size up front, not after\n" +
"An **under-powered** test (too few samples) can miss a real effect and you'd wrongly conclude 'no difference.' An **over-powered** test wastes resources (real product tests cost traffic and money). And sizing afterward invites the worst sin: running until you happen to get significance (**p-hacking**). You commit to n before you start.\n\n" +
"## Where this fits\n" +
"For a large prompt effect on 100 gold posts, 100 per arm is plenty. For a real product test detecting a 1% conversion lift, you'd need tens of thousands. Today you compute and justify your n."
      ),
      V("A/B test sample size and power, explained","https://www.youtube.com/watch?v=QBbjVtXУ",10,"various","Why power analysis matters and how the effect size drives sample size."),
      L("See it in code (with output)",
"## Compute required sample size\n" +
"```python\n" +
"from statsmodels.stats.power import zt_ind_solve_power\n\n" +
"for eff in [0.1, 0.2, 0.5]:\n" +
"    n = zt_ind_solve_power(effect_size=eff, alpha=0.05, power=0.8)\n" +
"    print(f'effect {eff}: need ~{int(n)} per arm')\n" +
"# effect 0.1: need ~1570 per arm   <- small effect, lots of data\n" +
"# effect 0.2: need ~393 per arm\n" +
"# effect 0.5: need ~63 per arm     <- large effect, little data\n" +
"```\n" +
"The pattern is the lesson: **smaller effects demand dramatically more data.** Our prompt change should produce a large, obvious effect if it helps at all, so 100 posts per arm is defensible. A subtle 1% effect would need thousands."
      ),
      S([
        { prompt: "Detecting a SMALLER effect requires a LARGER sample size.", answer: true, whenRight: "Right — subtle effects hide in noise; you need more data to see them. A 0.1 effect needs ~1570/arm vs ~63 for a 0.5 effect.", whenWrong: "Smaller effects need more data. To spot a 1% lift you might need 10,000s; a huge effect shows up in dozens.", sim: "effect 0.1 -> ~1570/arm\neffect 0.5 -> ~63/arm" },
        { prompt: "80% power means the test will detect a real effect 80% of the time it exists.", answer: true, whenRight: "Right — power is the true-positive rate. 80% is the common target; higher power needs more samples.", whenWrong: "Power = P(detect a real effect). 80% means a 1-in-5 chance of missing a genuine effect. More power = more data." },
        { prompt: "If your test isn't significant, it's fine to keep collecting data until it becomes significant.", answer: false, whenRight: "Right — that's p-hacking. It inflates false positives. Fix n in advance and respect the result.", whenWrong: "Running until significant is p-hacking — it manufactures false positives. Commit to n up front and accept the outcome." }
      ]),
      E("Your turn — size the test","[CODE] In `ab/power.py`:\n1. Use zt_ind_solve_power to compute samples-per-arm for effect sizes 0.1, 0.2, and 0.5 (alpha 0.05, power 0.8).\n2. Print all three.\n3. In a comment: which effect size do you expect from a prompt change, and is 100 posts/arm enough? Justify it.")
    ]),
    D(4,"Run both arms on the same data","Score control and treatment on identical posts.",[
      L("Running the experiment cleanly",
"## What it is\n" +
"You run both prompts over the **exact same 100 gold posts**, capturing each prediction:\n\n" +
"```python\n" +
"from openai import OpenAI\n" +
"from prompts import PROMPT_A, PROMPT_B\n" +
"import pandas as pd\n\n" +
"df = pd.read_csv('data/gold.csv').sample(100, random_state=42)\n" +
"client = OpenAI()\n\n" +
"def classify(prompt, text):\n" +
"    r = client.chat.completions.create(\n" +
"        model='gpt-4o-mini', temperature=0,\n" +
"        messages=[{'role':'system','content':prompt},\n" +
"                  {'role':'user','content':text}])\n" +
"    return r.choices[0].message.content.strip().upper()\n\n" +
"df['pred_A'] = df['title'].apply(lambda t: classify(PROMPT_A, t))\n" +
"df['pred_B'] = df['title'].apply(lambda t: classify(PROMPT_B, t))\n" +
"```\n\n" +
"## Why the SAME posts (paired design)\n" +
"Both arms scoring the *identical* posts is a **paired** experiment — the strongest design. It removes 'maybe arm B just got easier posts' as an explanation. Every difference is attributable to the prompt, not to which posts each arm happened to see. The fixed `random_state=42` guarantees the same sample.\n\n" +
"## Save the raw predictions\n" +
"Store `pred_A` and `pred_B` alongside the true labels. You'll compute accuracy and significance tomorrow from this saved file — separating data collection from analysis (the same discipline as the scraping step in Week 8).\n\n" +
"## Where this fits\n" +
"Today you run both prompts and save a results CSV with each post's true label and both predictions."
      ),
      L("See it in code (with output)",
"## Run and save\n" +
"```python\n" +
"print(df[['title','true_label','pred_A','pred_B']].head(3))\n" +
"#                              title true_label pred_A   pred_B\n" +
"# 0  Show: a clean RL library    POSITIVE  POSITIVE POSITIVE\n" +
"# 1  This benchmark is a joke    NEGATIVE  POSITIVE NEGATIVE  <- B caught the sarcasm\n" +
"# 2  Ask: best optimizer?        NEUTRAL   NEUTRAL  NEUTRAL\n\n" +
"df.to_csv('ab/results.csv', index=False)\n" +
"print('Saved', len(df), 'paired predictions')\n" +
"# Saved 100 paired predictions\n" +
"```\n" +
"Row 1 shows the kind of case the strict prompt is meant to fix — 'this benchmark is a joke' is sarcasm that the plain prompt read as positive. Tomorrow's stats will tell us if that pattern is significant overall."
      ),
      S([
        { prompt: "Scoring both prompts on the SAME posts (a paired design) removes 'one arm got easier data' as an explanation.", answer: true, whenRight: "Right — identical posts means any difference is attributable to the prompt, not to which posts each arm saw.", whenWrong: "Same posts = paired design = strongest comparison. It rules out the two arms facing different difficulty.", sim: "random_state=42 -> identical 100 posts\nboth prompts score the same set" },
        { prompt: "You should save the raw predictions, then compute accuracy/significance in a separate step.", answer: true, whenRight: "Right — separate collection from analysis. Save results.csv once; analyse it repeatedly without re-calling the API.", whenWrong: "Save predictions first, analyse second. API calls are slow/costly — you don't want to re-run them to re-analyse." },
        { prompt: "It's fine if arm A scores one random sample of posts and arm B scores a different random sample.", answer: false, whenRight: "Right — no. Different samples reintroduce confounding (B might get easier posts). Use the same fixed sample for both.", whenWrong: "Different samples break the paired design. Use the identical fixed sample (random_state) for both arms." }
      ]),
      E("Your turn — run both arms","[CODE] In `ab/run.py`:\n1. Load gold.csv, sample 100 posts with random_state=42.\n2. Define classify(prompt, text) using gpt-4o-mini at temperature=0 (or your fine-tuned model if no API access).\n3. Score all 100 with PROMPT_A and PROMPT_B.\n4. Save title, true_label, pred_A, pred_B to `ab/results.csv`.")
    ]),
    D(5,"Compute accuracy + significance","Is the gap real, or could it be chance?",[
      L("Measuring the result and testing it",
"## What it is\n" +
"From the saved predictions, compute each arm's accuracy, then test whether the difference is significant:\n\n" +
"```python\n" +
"import pandas as pd\n" +
"from scipy.stats import chi2_contingency\n\n" +
"df = pd.read_csv('ab/results.csv')\n" +
"acc_A = (df['pred_A'] == df['true_label']).mean()\n" +
"acc_B = (df['pred_B'] == df['true_label']).mean()\n" +
"print(f'A: {acc_A:.1%}   B: {acc_B:.1%}')\n\n" +
"# Significance: did B get more correct than A, beyond chance?\n" +
"ct = pd.crosstab(\n" +
"    ['A']*len(df) + ['B']*len(df),\n" +
"    list(df['pred_A']==df['true_label']) + list(df['pred_B']==df['true_label']))\n" +
"chi2, p, _, _ = chi2_contingency(ct)\n" +
"print(f'p = {p:.3f}')\n" +
"```\n\n" +
"## Reading the verdict\n" +
"- B's accuracy > A's **and** p < 0.05 → the improvement is real; ship B.\n" +
"- B higher but p ≥ 0.05 → not enough evidence; the gap could be chance; **don't ship**.\n" +
"- B not higher → the hypothesis failed; keep A.\n\n" +
"## The honest outcomes\n" +
"All three are valid results. 'B didn't significantly beat A' is a real, publishable finding — it saved you from shipping a change that doesn't actually help. The willingness to report a null result is what makes your significant results trustworthy. **A well-run experiment that disproves your hypothesis is a success, not a failure.**\n\n" +
"## Where this fits\n" +
"Today you compute both accuracies and the p-value, and read off which of the three outcomes you got."
      ),
      L("See it in code (with output)",
"## The result\n" +
"```python\n" +
"# A: 75.0%   B: 81.0%\n" +
"# p = 0.039\n" +
"# B beats A by 6 points, p < 0.05 -> significant -> ship B\n" +
"#\n" +
"# (If it had been A: 75% B: 77%, p = 0.61 -> NOT significant -> keep A)\n" +
"```\n" +
"This run: the strict prompt's 6-point gain is significant (p=0.039), so the decision rule says ship B. Note how the verdict follows mechanically from the rule you wrote on Day 2 — no rationalising, just applying the pre-committed criterion."
      ),
      S([
        { prompt: "If B beats A but p = 0.61, the right call is to NOT ship B.", answer: true, whenRight: "Right — p=0.61 means the gap is very likely chance. Higher ≠ better when it's not significant.", whenWrong: "p=0.61 is not significant — the difference could easily be noise. Don't ship on that; keep the control.", sim: "B 77% > A 75%, but p=0.61\n-> not significant -> keep A" },
        { prompt: "A result that disproves your hypothesis (B did NOT beat A) is a failed, worthless experiment.", answer: false, whenRight: "Right — it's a success. Knowing a change doesn't help saved you from shipping it. Null results are real findings.", whenWrong: "A clean null result is valuable — it stopped a useless change. Disproving your hypothesis is a win, not a failure." },
        { prompt: "The ship/no-ship verdict should follow mechanically from the decision rule you set before the data.", answer: true, whenRight: "Right — that's the whole point of pre-registering: apply the rule, don't reinterpret to fit your hopes.", whenWrong: "Apply the pre-committed rule mechanically. Reinterpreting the threshold after seeing results is how rigour dies." }
      ]),
      E("Your turn — compute the result","[CODE] In `ab/analyze.py`:\n1. Load results.csv. Compute accuracy for pred_A and pred_B vs true_label.\n2. Run a chi-square test on correct/incorrect counts across the two arms; print the p-value.\n3. Apply your Day-2 decision rule: ship B or not? State which of the three outcomes you got.")
    ]),
    D(6,"Write the experiment report","Communicate the result like a professional.",[
      L("The experiment report",
"## What it is\n" +
"A short, structured report turns your experiment into something a teammate or manager can act on:\n\n" +
"```text\n" +
"# A/B Test — Sentiment Prompt: plain (A) vs strict (B)\n" +
"## Hypothesis\n" +
"The strict/sarcasm-aware prompt improves accuracy on r/ML posts.\n" +
"## Setup\n" +
"- 100 hand-labelled gold posts (paired design, random_state=42)\n" +
"- Same model (gpt-4o-mini), temperature 0\n" +
"## Results\n" +
"- A: 75.0%   B: 81.0%   (+6.0 pts)\n" +
"- chi-square p = 0.039\n" +
"## Verdict\n" +
"Significant at p<0.05. SHIP prompt B.\n" +
"## Caveat\n" +
"Small sample (100); a larger gold set would tighten the estimate.\n" +
"```\n\n" +
"## Why every section matters\n" +
"- **Hypothesis + Setup** let a reader judge whether the test was fair (was it confounded? big enough?).\n" +
"- **Results** give the numbers, not adjectives ('better' is useless; '+6 pts, p=0.039' is actionable).\n" +
"- **Verdict** states the decision plainly.\n" +
"- **Caveat** shows you know the limits — the mark of someone who can be trusted with bigger experiments.\n\n" +
"## Why it matters\n" +
"At a real company, A/B test reports drive decisions worth real money. The ability to write one that's honest, reproducible, and clear is a senior skill. Hiding a caveat or overstating a result destroys trust the first time someone checks your work.\n\n" +
"## Where this fits\n" +
"Today you write `ab/REPORT.md` with all five sections, grounded in your actual numbers."
      ),
      S([
        { prompt: "An experiment report should give numbers ('+6 pts, p=0.039'), not adjectives ('much better').", answer: true, whenRight: "Right — numbers are actionable and checkable; adjectives are noise. State the effect size and the p-value.", whenWrong: "Use numbers. 'Better' is meaningless; '+6 pts at p=0.039' lets a reader judge and act. Quantify everything." },
        { prompt: "Including a 'caveat' section that names the test's limitations weakens your report.", answer: false, whenRight: "Right — the opposite. Naming limits (small sample) builds trust and shows judgment. Hiding them destroys it.", whenWrong: "Caveats strengthen credibility. Acknowledging the small sample shows you understand the result's limits — a senior trait." },
        { prompt: "A/B test reports at real companies drive decisions with real financial stakes.", answer: true, whenRight: "Right — which is exactly why honesty and reproducibility in the report are non-negotiable skills.", whenWrong: "They do — these reports steer product and spend. That's why writing them honestly is a high-value, senior skill." }
      ]),
      E("Your turn — write the report","[WRITE] Create `ab/REPORT.md` with five sections: Hypothesis, Setup, Results (with your real accuracies + p-value), Verdict (ship/don't), and a Caveat about the sample size. Keep it under one page.")
    ]),
    D(7,"Ship the A/B experiment","Commit the experiment as a portfolio artifact.",[
      L("Shipping a reproducible experiment",
"## What it is\n" +
"A committed `ab/` folder — prompts, run script, results, analysis, and report — is a portfolio artifact that proves you can run a controlled experiment, not just train a model. Closing it:\n\n" +
"```bash\n" +
"git add ab/\n" +
"git commit -m 'A/B prompt experiment: strict prompt beats plain (+6pts, p=0.039)'\n" +
"git push && git tag ab-tested && git push --tags\n" +
"```\n\n" +
"## Why this is rarer (and more valuable) than it looks\n" +
"Most people who 'know data science' can train a model. Far fewer can design a clean experiment — control the variables, size it correctly, test for significance, and report it honestly. That experimental rigour is exactly what separates someone who *runs* the analytics function from someone who just builds models. A committed, reproducible experiment is direct evidence you have it.\n\n" +
"## Reproducibility is the proof\n" +
"Because you fixed the random seed, saved the raw predictions, and documented the setup, anyone can re-run your experiment and get your numbers. That reproducibility is what makes it science rather than an anecdote — and it's what a reviewer checks.\n\n" +
"## Where this fits\n" +
"Today you commit and tag the experiment. Next week you push past the classical-model ceiling by fine-tuning a transformer (Reddit Sentiment v0.3)."
      ),
      S([
        { prompt: "Designing and reporting a clean experiment is a rarer skill than training a model.", answer: true, whenRight: "Right — many can fit a model; far fewer can run rigorous experiments. That's what marks senior judgment.", whenWrong: "Experimental design is the rarer, higher-value skill. Anyone can call .fit(); few can run a sound A/B test." },
        { prompt: "Fixing the random seed and saving raw predictions makes your experiment reproducible.", answer: true, whenRight: "Right — anyone can re-run and get your numbers. Reproducibility is what makes it science, not an anecdote.", whenWrong: "Those are exactly what make it reproducible: same seed + saved data = anyone can verify your result." },
        { prompt: "A committed experiment folder adds nothing to a portfolio beyond what a trained model shows.", answer: false, whenRight: "Right — it adds a lot: it proves experimental rigour, a distinct and rarer skill than model-fitting.", whenWrong: "It shows a different, scarcer skill — controlled experimentation — which model-training alone doesn't demonstrate." }
      ]),
      E("Your turn — ship the experiment","[PRODUCE] Commit the full `ab/` folder (prompts, run, analyze, results.csv, REPORT.md):\n`git add ab/ && git commit -m 'A/B prompt experiment'`\n`git tag ab-tested && git push && git push --tags`\n\nPASS:\n[x] 2 prompts defined (one variable changed)\n[x] Sample size justified via power analysis\n[x] Same 100 posts scored with both (paired)\n[x] Accuracy + p-value computed\n[x] REPORT.md with an honest verdict + caveat\n[x] Committed and tagged")
    ])
  ]
};

/* ════ WEEK 15 — Reddit Sentiment v0.3: Fine-tune DistilBERT ════ */
const W15 = {
  number: 15, title: "Reddit Sentiment v0.3: Fine-tune DistilBERT",
  phase: "NLP", commitment_hours: "15-20",
  context: ds.weeks[14].context,
  concept_check: [
    { q: "Why do classical models (TF-IDF + LogReg) hit an accuracy ceiling on text?",
      choices: ["They use too much memory","They treat text as a bag of words — losing word order and context, so 'not good' looks like 'good not'","They are too slow","They can't read CSVs"],
      correct: 1, explain: "Bag-of-words throws away order and context. 'This is not good at all' and 'good' share words but mean opposites. Transformers read text *in sequence with context*, which is how they break past the classical ceiling." },
    { q: "What is fine-tuning a pretrained model like DistilBERT?",
      choices: ["Training a model from scratch on your data","Taking a model that already learned language, and continuing its training on your labelled task so it specialises",
        "Deleting layers to make it smaller","Running it without any training"],
      correct: 1, explain: "Fine-tuning starts from a model that already learned general language from billions of words, then nudges its weights on your (much smaller) labelled dataset. You get the model's language understanding + your task's specifics — far better than training from scratch on 200 examples." },
    { q: "Why fine-tune on Colab with a GPU rather than your laptop?",
      choices: ["Colab has better internet","Transformer training is matrix-heavy; a GPU does it 10-100x faster than a CPU, turning hours into minutes",
        "Laptops can't run Python","Colab is the only place transformers work"],
      correct: 1, explain: "Training updates millions of weights via huge matrix operations — exactly what GPUs are built for. A free Colab T4 GPU finishes in minutes what could take hours on a CPU, which is why it's the standard for fine-tuning." }
  ],
  days: [
    D(1,"What fine-tuning is","Standing on a pretrained model's shoulders.",[
      L("Transfer learning and fine-tuning",
"## What it is\n" +
"Classical models (your TF-IDF + LogReg) hit a ceiling — maybe 75% — because **bag-of-words throws away order and context**. 'This is not good' and 'good' share the word 'good'; the model can't tell them apart. To break past that, you need a model that reads language *as language*.\n\n" +
"**Transformers** do exactly that. And **fine-tuning** is how you adapt one to your task:\n\n" +
"```text\n" +
"Pretrained DistilBERT  (learned general English from billions of words)\n" +
"         + your 200 labelled gold posts\n" +
"         = a model specialised for r/ML sentiment\n" +
"```\n\n" +
"## Why fine-tuning beats training from scratch\n" +
"Training a language model from zero needs billions of words and enormous compute. Fine-tuning starts from a model that **already understands language** and just nudges its weights on your small labelled set. You inherit all that language knowledge for free and specialise it cheaply. This is **transfer learning** — the single most important idea in modern applied ML.\n\n" +
"## DistilBERT specifically\n" +
"DistilBERT is a smaller, faster distillation of BERT — ~40% smaller, ~60% faster, keeping ~97% of the performance. It's the standard choice when you want transformer quality without the full compute cost. Perfect for fine-tuning on a free GPU.\n\n" +
"## Where this fits\n" +
"This week you fine-tune DistilBERT on your gold set in Colab and see if it beats the classical baseline from Week 13. By Sunday: a specialised model saved in your repo."
      ),
      V("What is fine-tuning? (Hugging Face transformers)","https://www.youtube.com/watch?v=eC6Hd1hFvos",10,"HuggingFace","How fine-tuning adapts a pretrained transformer to your task."),
      L("Why context beats bag-of-words",
"## The example that says it all\n" +
"```text\n" +
"Bag-of-words view (TF-IDF):\n" +
"  'not good at all'  ->  {not, good, at, all}   # order lost\n" +
"  'good'             ->  {good}\n" +
"  These look SIMILAR (both contain 'good') -> model confused\n\n" +
"Transformer view:\n" +
"  reads 'not good at all' in sequence, attention links 'not' to 'good'\n" +
"  -> understands NEGATION -> labels it NEGATIVE\n" +
"```\n\n" +
"## Attention is the mechanism\n" +
"Transformers use **attention** (the dot-product idea from Week 2, at scale) to let each word 'look at' every other word and weigh their relationships. That's how it knows 'not' flips 'good', that 'fire' is positive in 'this is fire', that sarcasm bends meaning. Bag-of-words has no mechanism for any of this.\n\n" +
"This is *why* fine-tuning a transformer can leap past the classical ceiling: it's not a bigger bag of words, it's a fundamentally richer representation of language."
      ),
      S([
        { prompt: "Classical bag-of-words models struggle because they discard word order and context.", answer: true, whenRight: "Right — '{not, good}' and '{good}' look similar to them. Order/context loss is the ceiling.", whenWrong: "Bag-of-words throws away order. 'not good' and 'good' share tokens, so the model can't tell them apart. That's the ceiling." },
        { prompt: "Fine-tuning trains a transformer from scratch on your 200 labelled posts.", answer: false, whenRight: "Right — no. It STARTS from a model that already learned language, then nudges it on your data. From-scratch needs billions of words.", whenWrong: "Fine-tuning continues training a PRETRAINED model. Training from scratch on 200 examples would fail badly.", sim: "pretrained (billions of words)\n+ your 200 posts -> specialised model" },
        { prompt: "Transformers use attention to let each word weigh its relationship to every other word.", answer: true, whenRight: "Right — attention is how it links 'not' to 'good' and captures context bag-of-words can't.", whenWrong: "Attention is the mechanism: every word attends to every other, capturing negation, sarcasm, and context." }
      ]),
      E("Your turn — frame the upgrade","[WRITE] In your reddit-sentiment repo, add to PROJECT2.md:\n1. In your own words, why does TF-IDF + LogReg hit a ceiling on sentiment?\n2. What does fine-tuning reuse from the pretrained model, and what does it add?\n3. One sentence: what accuracy would beating your Week-13 baseline require?")
    ]),
    D(2,"Move to Colab + GPU","Get the compute fine-tuning needs.",[
      RD("Google Colab","https://colab.research.google.com","Click 'Open'. Free notebooks with GPU access — where you'll fine-tune. Runtime → Change runtime type → T4 GPU."),
      L("Why a GPU, and Colab setup",
"## What it is\n" +
"Fine-tuning updates millions of weights through huge matrix multiplications every step. That's exactly what **GPUs** are built for — they do thousands of multiplications in parallel. On a CPU, fine-tuning DistilBERT might take hours; on a GPU, minutes.\n\n" +
"**Google Colab** gives you a free GPU (a T4) in a hosted notebook:\n" +
"```text\n" +
"1. Runtime -> Change runtime type -> T4 GPU\n" +
"2. Upload data/gold.csv via the files panel\n" +
"3. First cell:\n" +
"   !pip install transformers datasets accelerate -q\n" +
"```\n\n" +
"## Why this is the standard workflow\n" +
"Almost nobody fine-tunes on their laptop. The pattern is: **develop locally, train on a GPU in the cloud (Colab/cloud VM), bring the trained model back.** Colab is the free on-ramp to GPU training — the same mental model you'd use with a paid cloud GPU later, just free for learning.\n\n" +
"## Verify the GPU is active\n" +
"```python\n" +
"import torch\n" +
"print(torch.cuda.is_available())   # True = GPU ready\n" +
"print(torch.cuda.get_device_name(0))  # Tesla T4\n" +
"```\n" +
"If this prints False, you forgot to switch the runtime to GPU — fix it before training or you'll wait hours.\n\n" +
"## Where this fits\n" +
"Today you open Colab, enable the T4 GPU, upload your gold set, and install the libraries. Tomorrow you prepare the data."
      ),
      S([
        { prompt: "GPUs fine-tune transformers far faster than CPUs because they parallelise the matrix math.", answer: true, whenRight: "Right — thousands of multiplications at once. Hours on CPU become minutes on a GPU.", whenWrong: "Training is matrix-heavy, and GPUs do parallel matrix math. That's the 10-100x speedup over a CPU.", sim: "CPU: ~hours\nT4 GPU: ~minutes" },
        { prompt: "`torch.cuda.is_available()` returning False means the GPU runtime is active and ready.", answer: false, whenRight: "Right — False means NO GPU. You forgot Runtime -> Change runtime type -> T4. True means it's ready.", whenWrong: "False = no GPU attached. Switch the Colab runtime to T4 GPU; you want it to print True before training.", sim: "torch.cuda.is_available()\n# True  -> GPU ready\n# False -> fix the runtime!" },
        { prompt: "The standard workflow is to develop locally but train large models on a cloud GPU.", answer: true, whenRight: "Right — develop local, train on GPU (Colab/cloud), bring the model back. Colab is the free on-ramp.", whenWrong: "That's the pattern: local dev, cloud GPU for training, retrieve the model. Almost nobody fine-tunes on a laptop." }
      ]),
      E("Your turn — set up Colab","[CODE] 1. Open a new Colab notebook; set Runtime -> Change runtime type -> T4 GPU.\n2. Upload data/gold.csv.\n3. Run `!pip install transformers datasets accelerate -q`.\n4. Verify the GPU: print torch.cuda.is_available() (should be True) and the device name.")
    ]),
    D(3,"Prepare the data","Tokenize and split for the transformer.",[
      L("Tokenization and the Dataset format",
"## What it is\n" +
"A transformer doesn't read text — it reads **token IDs**. Preparing data means three steps: map labels to integers, split train/test, and tokenize:\n\n" +
"```python\n" +
"import pandas as pd\n" +
"from datasets import Dataset\n" +
"from transformers import AutoTokenizer\n\n" +
"df = pd.read_csv('gold.csv')\n" +
"df['label'] = df['true_label'].map({'NEGATIVE':0, 'NEUTRAL':1, 'POSITIVE':2})\n" +
"ds = Dataset.from_pandas(df[['title','label']]).train_test_split(test_size=0.2)\n\n" +
"tok = AutoTokenizer.from_pretrained('distilbert-base-uncased')\n" +
"def tokenize(b): return tok(b['title'], truncation=True, padding='max_length')\n" +
"ds = ds.map(tokenize, batched=True)\n" +
"```\n\n" +
"## What tokenization does\n" +
"The **tokenizer** splits text into subword units and maps each to an integer ID the model knows. 'reproducibility' might become ['repro', '##duc', '##ibility'] → [1234, 5678, 9012]. `truncation=True` caps long posts; `padding` makes every sequence the same length so they batch together. **Crucially, you must use the SAME tokenizer the model was pretrained with** — a mismatch produces garbage IDs.\n\n" +
"## Labels must be integers\n" +
"The model outputs class indices (0/1/2), not strings. You map NEGATIVE/NEUTRAL/POSITIVE → 0/1/2 now and map back after prediction. Keep that mapping consistent — swapping it silently scrambles every result.\n\n" +
"## Where this fits\n" +
"Today you load the gold set, map labels to integers, split 80/20, and tokenize with DistilBERT's tokenizer."
      ),
      L("See it in code (with output)",
"## Prepare and inspect\n" +
"```python\n" +
"print(ds)\n" +
"# DatasetDict({\n" +
"#   train: Dataset({features: ['title','label','input_ids','attention_mask'], num_rows: 160})\n" +
"#   test:  Dataset({num_rows: 40})\n" +
"# })\n" +
"print(tok('this paper is fire')['input_ids'][:8])\n" +
"# [101, 2023, 3259, 2003, 2543, 102, 0, 0]   <- token IDs (101=[CLS], 102=[SEP])\n" +
"```\n" +
"The text is now integer IDs with an attention mask. `input_ids` and `attention_mask` are what the model actually consumes — the original text is along for the ride."
      ),
      S([
        { prompt: "You must use the same tokenizer the model was pretrained with, not an arbitrary one.", answer: true, whenRight: "Right — a mismatched tokenizer produces token IDs the model never learned. Always match tokenizer to model.", whenWrong: "Tokenizer and model are a matched pair. The wrong tokenizer gives IDs the model can't interpret — garbage out.", sim: "AutoTokenizer.from_pretrained('distilbert-base-uncased')\n# must match the model you fine-tune" },
        { prompt: "Transformers consume token IDs (integers), not raw text strings.", answer: true, whenRight: "Right — the tokenizer converts text to input_ids; that's what the model reads. Text is just the source.", whenWrong: "Models read integer token IDs. Tokenization (text -> input_ids) is the required conversion before training." },
        { prompt: "Labels can stay as strings ('POSITIVE') when training the classifier.", answer: false, whenRight: "Right — no. Map them to integers (0/1/2); the model outputs class indices. Keep the mapping consistent.", whenWrong: "Labels must be integers. Map NEGATIVE/NEUTRAL/POSITIVE -> 0/1/2 and map back after prediction.", sim: "{'NEGATIVE':0,'NEUTRAL':1,'POSITIVE':2}" }
      ]),
      E("Your turn — prepare the data","[CODE] In Colab:\n1. Load gold.csv; map true_label to integers 0/1/2 in a 'label' column.\n2. Build a Dataset and train_test_split(test_size=0.2).\n3. Load distilbert-base-uncased tokenizer; tokenize with truncation + padding.\n4. Print the DatasetDict and one tokenized example's input_ids.")
    ]),
    D(4,"Fine-tune the model","Run the training loop with the Trainer.",[
      L("The Trainer and training arguments",
"## What it is\n" +
"Hugging Face's `Trainer` runs the whole training loop for you — you supply the model, the data, and the hyperparameters:\n\n" +
"```python\n" +
"from transformers import (AutoModelForSequenceClassification,\n" +
"                          TrainingArguments, Trainer)\n\n" +
"model = AutoModelForSequenceClassification.from_pretrained(\n" +
"    'distilbert-base-uncased', num_labels=3)\n\n" +
"args = TrainingArguments(\n" +
"    output_dir='out', num_train_epochs=3,\n" +
"    per_device_train_batch_size=16, learning_rate=2e-5,\n" +
"    eval_strategy='epoch')\n\n" +
"trainer = Trainer(model=model, args=args,\n" +
"    train_dataset=ds['train'], eval_dataset=ds['test'])\n" +
"trainer.train()\n" +
"```\n\n" +
"## The hyperparameters that matter\n" +
"- **num_labels=3** — three sentiment classes. Get this wrong and the model can't even represent your task.\n" +
"- **learning_rate=2e-5** — small, because you're *nudging* a pretrained model, not training from scratch. A large LR would wreck the language knowledge it already has (catastrophic forgetting).\n" +
"- **num_train_epochs=3** — passes over the data. Too few underfits; too many overfits a small gold set.\n" +
"- **batch_size=16** — how many examples per step; bounded by GPU memory.\n\n" +
"## Why a SMALL learning rate is the key insight\n" +
"The pretrained weights already encode language. Fine-tuning should adjust them gently. 2e-5 is ~100x smaller than a typical from-scratch LR — it specialises the model without erasing what it knows. This single number is the difference between fine-tuning that works and fine-tuning that destroys the model.\n\n" +
"## Where this fits\n" +
"Today you load DistilBERT with 3 labels, set training arguments, and run `trainer.train()` on the T4 — a few minutes for a small gold set."
      ),
      L("See it in code (with output)",
"## Training output\n" +
"```python\n" +
"trainer.train()\n" +
"# Epoch  Training Loss  Validation Loss\n" +
"# 1      0.842          0.611\n" +
"# 2      0.498          0.512\n" +
"# 3      0.301          0.498   <- val loss still falling = learning, not overfit yet\n" +
"```\n" +
"Watch the **validation loss**: falling across epochs means the model is genuinely learning to generalise. If training loss kept dropping while validation loss rose, that would be overfitting — the cue to use fewer epochs."
      ),
      S([
        { prompt: "Fine-tuning uses a much smaller learning rate than training from scratch.", answer: true, whenRight: "Right — ~2e-5. You're nudging pretrained weights gently; a big LR would erase the language knowledge (catastrophic forgetting).", whenWrong: "Small LR (2e-5) is the key. The model already knows language; you adjust gently, not aggressively.", sim: "from scratch: LR ~1e-3\nfine-tune:    LR ~2e-5  (100x smaller)" },
        { prompt: "num_labels must match your number of classes (3 for POS/NEG/NEUTRAL).", answer: true, whenRight: "Right — it sets the output layer size. Wrong value and the model can't represent your classes.", whenWrong: "num_labels=3 sets the classification head to 3 outputs. Mismatch it and the task is misconfigured.", sim: "num_labels=3  # POSITIVE/NEGATIVE/NEUTRAL" },
        { prompt: "If validation loss rises while training loss keeps falling, the model is generalising well.", answer: false, whenRight: "Right — that's OVERFITTING (memorising train, failing on val). The fix: fewer epochs or more data.", whenWrong: "That divergence is overfitting, not good generalisation. Falling val loss is what you want; rising means stop sooner." }
      ]),
      E("Your turn — fine-tune","[CODE] In Colab:\n1. Load distilbert-base-uncased with num_labels=3.\n2. Set TrainingArguments (3 epochs, batch 16, lr 2e-5, eval per epoch).\n3. Build the Trainer with your train/test datasets and run trainer.train().\n4. Watch the validation loss across epochs — note whether it's still falling.")
    ]),
    D(5,"Evaluate vs the baseline","Did the transformer beat TF-IDF?",[
      L("Evaluating the fine-tuned model",
"## What it is\n" +
"Score the fine-tuned model on the held-out test set and compare to your Week-13 baseline on the SAME data:\n\n" +
"```python\n" +
"import numpy as np\n" +
"from sklearn.metrics import classification_report\n\n" +
"preds = trainer.predict(ds['test'])\n" +
"y_pred = np.argmax(preds.predictions, axis=1)\n" +
"print(classification_report(preds.label_ids, y_pred,\n" +
"      target_names=['NEG','NEU','POS']))\n" +
"```\n\n" +
"## The comparison that matters\n" +
"The only meaningful question: **does the transformer beat the TF-IDF + LogReg baseline on the same test set?** You did the work to build that baseline in Week 13 precisely so you'd have an honest bar here. If DistilBERT scores 85% vs the baseline's 75%, the fine-tuning earned its complexity. If it's 76% vs 75%, the transformer's extra weight (250MB, GPU training) may not be worth it for this task.\n\n" +
"## Read per-class, not just overall\n" +
"`classification_report` shows precision/recall/F1 **per class**. Overall accuracy can hide that the model is great at POSITIVE but terrible at NEUTRAL (often the hardest, fuzziest class). The per-class view tells you *where* it's strong and weak — far more actionable than one number.\n\n" +
"## Why honest comparison matters\n" +
"It's tempting to assume the fancy model won. Measure it. Sometimes the transformer wins big; sometimes the gain is marginal and not worth the deployment cost. Reporting that honestly — even when it deflates the cool new model — is the same rigour from the A/B week.\n\n" +
"## Where this fits\n" +
"Today you evaluate the fine-tuned model, read the per-class report, and state plainly whether it beat the baseline and by how much."
      ),
      L("See it in code (with output)",
"## Transformer vs baseline\n" +
"```python\n" +
"#               precision  recall  f1   support\n" +
"# NEG              0.88     0.85   0.86    14\n" +
"# NEU              0.71     0.69   0.70    13   <- NEUTRAL hardest, as expected\n" +
"# POS              0.92     0.93   0.92    13\n" +
"#         accuracy                 0.83    40\n" +
"#\n" +
"# Week-13 baseline (TF-IDF+LogReg) on same test: 0.75\n" +
"# Fine-tuned DistilBERT: 0.83  -> +8 points. The transformer earned it.\n" +
"```\n" +
"+8 points overall — and the per-class view confirms the gain is real across classes, with NEUTRAL still the weakest (the genuinely ambiguous middle). The transformer's complexity is justified here."
      ),
      S([
        { prompt: "The key evaluation question is whether the transformer beats the Week-13 baseline on the same test set.", answer: true, whenRight: "Right — that baseline is the honest bar. Beating it justifies the transformer's added complexity.", whenWrong: "Compare to the baseline on identical data. That's the only way to know if fine-tuning was worth it." },
        { prompt: "Per-class precision/recall can reveal weaknesses that overall accuracy hides.", answer: true, whenRight: "Right — 83% overall might hide that NEUTRAL is at 70%. Per-class shows where the model actually struggles.", whenWrong: "Overall accuracy averages away class-specific failures. Per-class metrics expose the weak class (often NEUTRAL)." },
        { prompt: "If the transformer only beats the baseline by 1 point, its extra cost is automatically justified.", answer: false, whenRight: "Right — a 1-point gain may NOT justify 250MB + GPU training. Marginal wins need a cost/benefit call.", whenWrong: "A tiny gain might not be worth the deployment cost. Marginal improvements require judging if the complexity pays off." }
      ]),
      E("Your turn — evaluate","[CODE] In Colab:\n1. trainer.predict on the test set; argmax the logits to get predicted classes.\n2. Print classification_report with target_names ['NEG','NEU','POS'].\n3. Compare overall accuracy to your Week-13 TF-IDF baseline.\n4. Markdown: did it beat the baseline? By how much? Which class is weakest?")
    ]),
    D(6,"Save + download the model","Get the trained weights into your repo (Git LFS).",[
      L("Saving a large model with Git LFS",
"## What it is\n" +
"Save the fine-tuned model and bring it back to your local repo:\n\n" +
"```python\n" +
"trainer.save_model('reddit-sentiment-distilbert')\n" +
"!zip -r model.zip reddit-sentiment-distilbert\n" +
"# Download model.zip, unzip into local repo at models/distilbert/\n" +
"```\n\n" +
"## The problem: the model is ~250MB\n" +
"Git is built for text, not big binaries. Committing a 250MB model the normal way bloats your repo permanently (git history keeps every version forever) and may exceed GitHub's file-size limit. The solution is **Git LFS (Large File Storage)**:\n\n" +
"```bash\n" +
"git lfs install\n" +
"git lfs track 'models/distilbert/*'\n" +
"git add .gitattributes models/\n" +
"git commit -m 'add fine-tuned model via LFS'\n" +
"```\n\n" +
"## How Git LFS works\n" +
"LFS stores the big file separately and puts a small **pointer** in your git history instead. The repo stays lightweight; the model is fetched on demand. This is the standard way to version large model artifacts. Knowing to reach for LFS (instead of either committing a huge binary or leaving the model out of version control entirely) is a real practical skill.\n\n" +
"## Why version the model at all\n" +
"A model is the *output* of your work — versioning it means you can always reproduce exactly which model produced which results, and your deployment (next weeks) can pull a known version. Models are artifacts worth tracking, just with the right tool.\n\n" +
"## Where this fits\n" +
"Today you save the model in Colab, download it, and store it in your repo via Git LFS."
      ),
      S([
        { prompt: "Git LFS stores large files separately and keeps only a small pointer in git history.", answer: true, whenRight: "Right — the repo stays lightweight; the big model is fetched on demand. That's what LFS is for.", whenWrong: "LFS swaps the big binary for a pointer in history, storing the file separately. Keeps the repo small.", sim: "git lfs track 'models/distilbert/*'\n# pointer in git, model in LFS store" },
        { prompt: "Committing a 250MB model the normal way is fine and has no downside.", answer: false, whenRight: "Right — no. It bloats history permanently and may hit GitHub's limits. Use Git LFS for large binaries.", whenWrong: "Big binaries bloat git history forever and can exceed limits. That's exactly why Git LFS exists." },
        { prompt: "Versioning the trained model lets you reproduce which model produced which results.", answer: true, whenRight: "Right — the model is an artifact; tracking it ties results to a specific version and lets deploys pull a known one.", whenWrong: "Tracking the model (via LFS) keeps results reproducible and lets deployment pull a known version." }
      ]),
      E("Your turn — save + LFS","[CODE] 1. In Colab: trainer.save_model('reddit-sentiment-distilbert'); zip and download it.\n2. Unzip into your local repo at models/distilbert/.\n3. Set up Git LFS: `git lfs install`, `git lfs track 'models/distilbert/*'`, commit .gitattributes + models/.\n4. Confirm `git lfs ls-files` lists the model files.")
    ]),
    D(7,"Ship Reddit Sentiment v0.3","Tag the fine-tuned model milestone.",[
      L("Shipping v0.3 — the transformer milestone",
"## What it is\n" +
"v0.3 ships the fine-tuned model and the evidence it beat the baseline. Closing it:\n\n" +
"```bash\n" +
"git push   # pushes LFS objects too\n" +
"git tag v0.3 && git push --tags\n" +
"```\n\n" +
"## The README finding\n" +
"```text\n" +
"## v0.3 — Fine-tuned DistilBERT\n" +
"Fine-tuned distilbert-base-uncased on the 200-post gold set (Colab T4).\n" +
"Test accuracy 83% vs the TF-IDF+LogReg baseline's 75% — +8 points.\n" +
"The transformer's contextual understanding (negation, sarcasm) explains\n" +
"the gain; NEUTRAL remains the hardest class. Model versioned via Git LFS.\n" +
"```\n\n" +
"## Why this is a portfolio centrepiece\n" +
"Fine-tuning a transformer is the skill that signals you've crossed from 'can use sklearn' into modern deep-learning ML. Doing it end to end — data prep, GPU training, honest baseline comparison, LFS-versioned artifact — is exactly the workflow real ML teams use. And because you measured it against a baseline rather than assuming the transformer won, it shows judgment, not just tool use.\n\n" +
"## The project arc so far\n" +
"v0.1 pretrained baseline → v0.2 hand-labelled gold + classical ML → v0.3 fine-tuned transformer. Each version made the model better *and* taught you to measure the improvement. That iterative, evidence-driven progression is the story your portfolio tells.\n\n" +
"## Where this fits\n" +
"Today you tag v0.3. Next week you make the black-box transformer explainable with SHAP — because a model you can't explain is a model you can't fully trust."
      ),
      S([
        { prompt: "Fine-tuning a transformer end-to-end signals you've moved beyond classical-only ML.", answer: true, whenRight: "Right — it's the modern deep-learning workflow: data prep, GPU training, baseline comparison, versioned artifact.", whenWrong: "It marks the jump into modern ML. Doing the full workflow (not just .fit()) is the portfolio signal." },
        { prompt: "Measuring the transformer against a baseline (not assuming it won) demonstrates judgment.", answer: true, whenRight: "Right — evidence over assumption. Comparing to the baseline shows you don't cargo-cult the fancy model.", whenWrong: "Comparing to the baseline is the judgment part — it proves the gain is real, not assumed." },
        { prompt: "v0.3 should hide the NEUTRAL-class weakness to make the model look better.", answer: false, whenRight: "Right — no. Report it. Naming the weak class is honest and shows you understand the model's limits.", whenWrong: "Report weaknesses honestly. Hiding the weak NEUTRAL class would be the opposite of the rigour you've built." }
      ]),
      E("Your turn — ship v0.3","[PRODUCE] 1. Add a 'v0.3 — Fine-tuned DistilBERT' section to the README with accuracy vs baseline and the per-class note.\n2. Push (LFS objects included) and tag:\n`git push && git tag v0.3 && git push --tags`\n\nPASS:\n[x] Fine-tuned in Colab on a T4 GPU\n[x] Beats the TF-IDF baseline on the same test set\n[x] Per-class report read (weakest class noted)\n[x] Model saved + stored via Git LFS\n[x] README finding written\n[x] v0.3 tag pushed")
    ])
  ]
};

/* ════ WEEK 16 — Model interpretability with SHAP ════ */
const W16 = {
  number: 16, title: "Model interpretability with SHAP",
  phase: "Modeling", commitment_hours: "10-12",
  context: ds.weeks[15].context,
  concept_check: [
    { q: "Why does interpretability matter more for some predictions than others?",
      choices: ["It doesn't — all models need the same explanation","High-stakes decisions (loans, moderation, hiring) demand a defensible 'why'; low-stakes ones (a movie rec) don't",
        "Only deep models need explaining","Interpretability is only for debugging"],
      correct: 1, explain: "A wrong Netflix recommendation costs nothing. A wrongly-denied loan or wrongly-flagged post can cause real harm and may be legally challengeable. The higher the stakes, the more you must be able to explain — and defend — why the model decided what it did." },
    { q: "What does SHAP tell you about a single prediction?",
      choices: ["The model's overall accuracy","How much each feature pushed THIS specific prediction toward or away from each class",
        "Whether the model is overfit","The training time"],
      correct: 1, explain: "SHAP attributes a prediction to its inputs: for one post, it shows which words pushed it toward NEGATIVE and which toward POSITIVE, and by how much. It turns a black-box output into a per-feature breakdown you can inspect." },
    { q: "You find your model leans NEGATIVE whenever a post mentions a certain subreddit. Why is that a problem?",
      choices: ["It isn't — more signal is good","The subreddit name is a proxy the model shouldn't use to judge sentiment — it's learned a bias, not the actual tone",
        "Subreddit names are always negative","It makes the model slower"],
      correct: 1, explain: "Sentiment should come from the post's tone, not from which community it's in. If the model keys off the subreddit name, it's encoding a bias that will systematically mislabel posts from that community — a fairness and correctness problem SHAP helped you surface." }
  ],
  days: [
    D(1,"Why interpretability matters","A prediction you can't explain is one you can't defend.",[
      L("The black-box problem",
"## What it is\n" +
"Your fine-tuned DistilBERT predicts 'NEGATIVE' for a post. **Why?** You don't know — the decision lives in millions of opaque weights. **Interpretability** is the discipline of opening that box: explaining *why* a model made a specific prediction.\n\n" +
"## Why the stakes determine the need\n" +
"- **Low-stakes** (recommend a movie, suggest a playlist): a wrong call costs nothing. A black box is fine.\n" +
"- **High-stakes** (deny a loan, flag a post for moderation, screen a CV): a wrong call causes real harm and may be **legally challengeable**. You *must* be able to explain and defend the decision.\n\n" +
"Sentiment moderation sits on the high-stakes side: if your model flags posts, the people affected (and your boss, and possibly a regulator) will ask 'why was MY post flagged?' 'The neural net said so' is not an acceptable answer.\n\n" +
"## What interpretability buys you\n" +
"1. **Trust** — stakeholders accept a model they can understand\n" +
"2. **Debugging** — you find where the model reasons wrongly\n" +
"3. **Bias detection** — you catch the model keying off something it shouldn't (a subreddit name, profanity, a demographic proxy)\n\n" +
"## Where this fits\n" +
"This week you use **SHAP** to explain your sentiment model's predictions — first a simple classical model, then (optionally) the transformer — and you'll find at least one real bias your model has."
      ),
      V("SHAP values explained for beginners","https://www.youtube.com/watch?v=VB9uV-x0gtg",13,"various","What SHAP is, the game-theory intuition, and how to read its plots."),
      L("How SHAP attributes a prediction",
"## The core idea\n" +
"**SHAP (SHapley Additive exPlanations)** borrows from game theory: it treats each feature as a 'player' and fairly distributes 'credit' for the prediction among them. For one prediction it answers: *how much did each feature push the output toward (or away from) each class?*\n\n" +
"```text\n" +
"Post: 'this benchmark is a joke'   -> predicted NEGATIVE\n" +
"SHAP word contributions toward NEGATIVE:\n" +
"  'joke'      +0.41   <- biggest push to negative\n" +
"  'benchmark' +0.08\n" +
"  'this'      -0.02\n" +
"```\n\n" +
"## Local vs global\n" +
"- **Local** explanation: why THIS one prediction (the example above)\n" +
"- **Global** explanation: which features matter most across ALL predictions\n\n" +
"SHAP does both, but the **local, one-prediction-at-a-time** view is where interpretability becomes concrete — you can point at exactly which words drove a specific decision and judge whether that reasoning is sound.\n\n" +
"## Why this is trustworthy\n" +
"SHAP's contributions are **additive**: they sum to the difference between this prediction and the average. That mathematical guarantee is why it's the standard — the explanation is faithful to the model, not a plausible-sounding guess."
      ),
      S([
        { prompt: "Interpretability matters more for high-stakes decisions (loans, moderation) than low-stakes ones (movie recs).", answer: true, whenRight: "Right — a wrong rec costs nothing; a wrong loan denial causes real, possibly legally-challengeable harm.", whenWrong: "Stakes drive the need. Harmful, contestable decisions demand a defensible 'why'; trivial ones don't." },
        { prompt: "SHAP can explain why a model made one specific prediction, not just its overall behaviour.", answer: true, whenRight: "Right — local explanations are SHAP's strength: which features drove THIS prediction, and by how much.", whenWrong: "SHAP does per-prediction (local) attribution — exactly which words pushed this post toward NEGATIVE." },
        { prompt: "'The neural network said so' is an acceptable explanation for flagging someone's post.", answer: false, whenRight: "Right — it isn't, especially at moderation stakes. You need to show which signals drove the decision.", whenWrong: "Not acceptable for high-stakes calls. People (and regulators) will ask why; you must be able to answer." }
      ]),
      E("Your turn — frame interpretability","[WRITE] In a `INTERPRETABILITY.md`:\n1. Why is your sentiment model 'high-stakes' if used for moderation?\n2. Name the three things interpretability buys you (trust, debugging, bias detection) with a one-line example of each for your project.\n3. What's the difference between a local and a global explanation?")
    ]),
    D(2,"Install SHAP + set up","Get the tooling ready on the classical model.",[
      L("Setting up SHAP",
"## What it is\n" +
"SHAP is a Python library that works with sklearn, XGBoost, and transformers. Install and set up on your project:\n\n" +
"```bash\n" +
"cd reddit-sentiment\n" +
"pip install shap\n" +
"```\n" +
"```python\n" +
"# In 08-interpret.ipynb\n" +
"import shap\n" +
"shap.initjs()   # enables the interactive plots\n" +
"```\n\n" +
"## Why start with the classical model, not the transformer\n" +
"SHAP on a transformer is **slow on a CPU** (it perturbs the input many times and re-runs the model for each). SHAP on your TF-IDF + LogReg baseline is **fast and instant**. So you learn SHAP on the simple model first — same concepts, same plots, no waiting — then optionally apply it to the transformer once you understand the output.\n\n" +
"This 'learn the technique on the cheap model first' move is the same pedagogy as the whole project: master the idea where it's fast, then scale to where it's expensive. Don't fight tooling latency while you're still learning what the plots mean.\n\n" +
"## What you'll produce\n" +
"A `figures/` folder of SHAP plots and a documented bias finding. The plots are the evidence; the written interpretation is the deliverable.\n\n" +
"## Where this fits\n" +
"Today you install SHAP and set up the notebook. Tomorrow you explain your first prediction on the fast classical model."
      ),
      S([
        { prompt: "It's smart to learn SHAP on the fast classical model before applying it to the slow transformer.", answer: true, whenRight: "Right — same concepts and plots, no waiting. Master the technique where it's cheap, then scale up.", whenWrong: "Start on the cheap model. SHAP on a CPU transformer is slow; learn what the plots mean on the fast LogReg first." },
        { prompt: "SHAP on a transformer running on a CPU is fast and instant.", answer: false, whenRight: "Right — it's slow: SHAP perturbs inputs and re-runs the model many times. That's why you start with the classical model.", whenWrong: "It's slow on CPU — many perturbed re-runs. The classical model is the fast place to learn SHAP.", sim: "LogReg + SHAP: instant\ntransformer + SHAP on CPU: minutes per example" },
        { prompt: "SHAP only works with deep learning models, not classical sklearn ones.", answer: false, whenRight: "Right — it works across sklearn, XGBoost, and transformers. You'll use it on LogReg first.", whenWrong: "SHAP is model-agnostic — sklearn, XGBoost, transformers all work. You start with the classical model." }
      ]),
      E("Your turn — install SHAP","[CODE] 1. `cd reddit-sentiment` and `pip install shap`.\n2. Create `08-interpret.ipynb`; import shap and call shap.initjs().\n3. Reload your Week-13 TF-IDF + LogReg baseline (or retrain it quickly on gold.csv).\n4. Create a `figures/` folder for the plots you'll save.")
    ]),
    D(3,"Explain the classical model","SHAP on TF-IDF + LogReg — fast and clear.",[
      L("Computing SHAP values for a text classifier",
"## What it is\n" +
"Build a SHAP explainer for your classical model and compute the word contributions:\n\n" +
"```python\n" +
"import shap, pandas as pd\n" +
"from sklearn.feature_extraction.text import TfidfVectorizer\n" +
"from sklearn.linear_model import LogisticRegression\n\n" +
"df = pd.read_csv('data/gold.csv')\n" +
"vec = TfidfVectorizer(max_features=500)\n" +
"X = vec.fit_transform(df['title'])\n" +
"model = LogisticRegression(max_iter=1000).fit(X, df['true_label'])\n\n" +
"explainer = shap.LinearExplainer(model, X)\n" +
"shap_values = explainer.shap_values(X)\n" +
"```\n\n" +
"## The global summary plot\n" +
"```python\n" +
"shap.summary_plot(shap_values, X, feature_names=vec.get_feature_names_out())\n" +
"```\n" +
"This shows, across all posts, which words push hardest toward each sentiment. It's the **global** view — your first read on what the model learned. You should see sensible words: 'love'/'great' driving POSITIVE, 'broken'/'fails' driving NEGATIVE. Nonsense here = a problem to investigate.\n\n" +
"## Why LinearExplainer\n" +
"For a linear model, SHAP has an exact, fast solution (`LinearExplainer`) — no approximation needed. Matching the explainer to the model type is part of using SHAP well; the generic explainer works too but is slower.\n\n" +
"## Where this fits\n" +
"Today you compute SHAP values for the classical model and produce the global summary plot — confirming the model learned sensible words before you zoom into single predictions."
      ),
      L("See it in code (with output)",
"## Global summary — top words per class\n" +
"```python\n" +
"# (from the summary plot, top contributors)\n" +
"# POSITIVE: great, love, clean, elegant, thanks, awesome\n" +
"# NEGATIVE: broken, fails, error, wrong, slow, disappointing\n" +
"# NEUTRAL : question, how, anyone, thoughts, vs\n" +
"```\n" +
"These are sensible — the model keys on genuine sentiment words, and NEUTRAL keys on question-like words ('how', 'anyone', 'thoughts'). That's a green light: the model's global reasoning is sound, so it's worth drilling into individual predictions next."
      ),
      S([
        { prompt: "A SHAP summary plot gives a GLOBAL view — which features matter most across all predictions.", answer: true, whenRight: "Right — it's the across-all-posts view. Single-prediction (local) plots come next.", whenWrong: "The summary plot is global: top features overall. Force/waterfall plots give the local, single-prediction view." },
        { prompt: "Seeing sensible top words (love->POSITIVE, broken->NEGATIVE) confirms the model's global reasoning is sound.", answer: true, whenRight: "Right — a green light. Nonsense top words would signal a broken model or bad data.", whenWrong: "Sensible top words validate the model. Garbage there would be a red flag worth investigating before going further." },
        { prompt: "Using LinearExplainer for a linear model gives an exact, fast SHAP result.", answer: true, whenRight: "Right — linear models have a closed-form SHAP solution, so LinearExplainer is exact and fast.", whenWrong: "For linear models, LinearExplainer is exact and fast. Match the explainer to the model type for best results." }
      ]),
      E("Your turn — explain the classical model","[CODE] In 08-interpret.ipynb:\n1. Fit TF-IDF (max_features=500) + LogReg on gold.csv.\n2. Build a shap.LinearExplainer and compute shap_values.\n3. Produce a summary_plot with the feature names; save to figures/.\n4. Markdown: do the top words per class make sense? Any surprises?")
    ]),
    D(4,"Explain one prediction at a time","The local view — why THIS post got THIS label.",[
      L("Local explanations with force plots",
"## What it is\n" +
"The most concrete interpretability move: take one post and show exactly which words drove its prediction:\n\n" +
"```python\n" +
"import matplotlib.pyplot as plt\n" +
"idx = 5\n" +
"print('Post:', df.iloc[idx]['title'])\n" +
"print('True:', df.iloc[idx]['true_label'], '| Pred:', model.predict(X[idx])[0])\n\n" +
"shap.force_plot(explainer.expected_value[0], shap_values[0][idx],\n" +
"                vec.get_feature_names_out(), matplotlib=True, show=False)\n" +
"plt.savefig('figures/shap_single.png', dpi=150, bbox_inches='tight')\n" +
"```\n\n" +
"## Reading a force plot\n" +
"A force plot shows the prediction as a tug-of-war: words pushing **toward** the class in one colour, words pushing **away** in another, with the size of each push proportional to its SHAP value. You can literally see 'this post was labelled NEGATIVE mostly because of the word *joke*, despite *interesting* pulling slightly positive.'\n\n" +
"## Why examine wrong predictions especially\n" +
"Pick posts the model got **wrong** and explain those. The force plot reveals *why* it erred — maybe it over-weighted one word, or missed a negation. Misclassifications explained are where you learn the model's actual failure modes, which is far more useful than admiring its correct calls. This is debugging through interpretability.\n\n" +
"## Where this fits\n" +
"Today you produce force plots for several individual predictions — including at least one the model got wrong — and read off what drove each."
      ),
      S([
        { prompt: "A force plot shows a single prediction as a tug-of-war between words pushing toward and away from a class.", answer: true, whenRight: "Right — you see exactly which words drove THIS prediction and how strongly. The local view made visible.", whenWrong: "That's a force plot: per-word pushes for one prediction, sized by SHAP value. The concrete local explanation." },
        { prompt: "Explaining predictions the model got WRONG is especially useful for finding its failure modes.", answer: true, whenRight: "Right — wrong predictions reveal where the model reasons badly (over-weighted word, missed negation). Debugging gold.", whenWrong: "Wrong predictions are the most informative to explain — they expose the model's actual failure modes." },
        { prompt: "Once the global summary looks fine, there's no value in explaining individual predictions.", answer: false, whenRight: "Right — no. Local explanations reveal per-case reasoning and failures that the global average hides.", whenWrong: "Local explanations add a lot — they show why specific (especially wrong) predictions happened, which globals can't." }
      ]),
      E("Your turn — explain single predictions","[CODE] In 08-interpret.ipynb:\n1. Produce a force plot for one CORRECT prediction; save to figures/.\n2. Produce a force plot for one WRONG prediction; save it.\n3. Markdown for the wrong one: which word(s) drove the mistake? Did it miss a negation or over-weight a term?")
    ]),
    D(5,"Explain the transformer (optional)","SHAP on DistilBERT — same idea, more compute.",[
      L("SHAP on a transformer",
"## What it is\n" +
"SHAP can explain your fine-tuned transformer too — the output is even richer because it works at the word level on real language:\n\n" +
"```python\n" +
"from transformers import pipeline\n" +
"import shap\n\n" +
"clf = pipeline('text-classification', model='models/distilbert',\n" +
"               return_all_scores=True)\n" +
"explainer = shap.Explainer(clf)\n" +
"shap_values = explainer(df['title'].head(10).tolist())\n" +
"shap.plots.text(shap_values[0])   # interactive word-level highlight\n" +
"```\n\n" +
"## The payoff: word-level highlighting\n" +
"`shap.plots.text` highlights the actual sentence, colouring each word by its contribution. You see, in the real post, which words the transformer leaned on. Because the transformer understands context, you can observe it correctly weighting 'not' before 'good', or catching sarcasm a bag-of-words model missed — interpretability confirming the capability you fine-tuned for.\n\n" +
"## Why this is optional\n" +
"On a CPU, SHAP re-runs the transformer many times per example — it's **slow** (minutes per post). That's fine for explaining a handful of posts, painful for hundreds. If your compute is limited, skip it; the classical-model SHAP already taught you the technique. If you have a GPU or patience, the transformer explanations are worth seeing once.\n\n" +
"## Where this fits\n" +
"Today (optional) you run SHAP on ~10 transformer predictions and view the word-level highlights. Skip without guilt if it's too slow — the concepts are already yours from Days 3-4."
      ),
      V("SHAP for transformers / NLP","https://www.youtube.com/watch?v=L8_sVRhBDLU",10,"various","Word-level SHAP explanations for transformer text models."),
      S([
        { prompt: "shap.plots.text highlights each word in the real sentence by its contribution to the prediction.", answer: true, whenRight: "Right — word-level colouring on the actual post. You see exactly what the transformer leaned on.", whenWrong: "It colours the sentence word-by-word by SHAP value — the richest, most concrete transformer explanation." },
        { prompt: "SHAP on a transformer is fast enough on CPU to explain hundreds of posts comfortably.", answer: false, whenRight: "Right — it's slow on CPU (minutes per post). Fine for a handful; painful for hundreds. This day is optional for that reason.", whenWrong: "It's slow on CPU — many re-runs per example. Good for ~10 posts, not hundreds without a GPU.", sim: "10 posts: doable\nhundreds on CPU: too slow" },
        { prompt: "Skipping the transformer SHAP day means you missed the core interpretability concepts.", answer: false, whenRight: "Right — no. Days 3-4 on the classical model already taught the technique. This day just scales it up.", whenWrong: "The concepts came from the classical-model SHAP. This optional day only applies them to a slower model." }
      ]),
      E("Your turn — transformer SHAP (optional)","[CODE] (OPTIONAL — skip if too slow.)\n1. Build a shap.Explainer around a text-classification pipeline on your fine-tuned model.\n2. Explain ~10 posts; render shap.plots.text for one.\n3. Markdown: did the transformer correctly weight a negation or sarcasm that the bag-of-words model would miss?")
    ]),
    D(6,"Find one real bias","Use SHAP to catch the model keying off something it shouldn't.",[
      L("Bias detection through interpretability",
"## What it is\n" +
"This is interpretability's highest-value use: finding where your model has learned a **bias** — keying off a feature that's a proxy for something it shouldn't use to judge sentiment. From your SHAP top-words, look for a feature that's wrong-by-association:\n\n" +
"- A **subreddit name** pushing a sentiment (tone should come from the post, not the community)\n" +
"- **Profanity** flagged NEGATIVE even when it's playful ('this is f***ing brilliant')\n" +
"- **Technical jargon** misread as NEGATIVE because it co-occurred with complaints in your small sample\n\n" +
"## Why small datasets breed bias\n" +
"Your gold set is 200 posts. If, by chance, most posts mentioning a certain library happened to be negative, the model 'learns' that library name = negative — a **spurious correlation**, not real sentiment. SHAP surfaces these because you can see the model leaning on a word that has no business carrying sentiment. The smaller the data, the more of these creep in.\n\n" +
"## Why documenting it matters\n" +
"Finding a bias and writing it down ('the model treats mentions of X as negative; here are 2 posts it got wrong because of it') is a senior-level deliverable. It shows you don't just ship models — you audit them. In a real role, an undocumented bias that surfaces in production is a crisis; one you found and flagged is diligence.\n\n" +
"## Where this fits\n" +
"Today you identify ONE concrete bias in your model from the SHAP analysis and document it in `BIASES.md` with two example posts it mislabelled because of it."
      ),
      S([
        { prompt: "A model keying off a subreddit name to judge sentiment has learned a bias, not real tone.", answer: true, whenRight: "Right — sentiment should come from the post's words, not which community it's in. That's a spurious proxy.", whenWrong: "The subreddit name is a proxy it shouldn't use. Keying off it = learned bias that mislabels that community's posts." },
        { prompt: "Small datasets are MORE prone to spurious correlations (accidental biases) than large ones.", answer: true, whenRight: "Right — in 200 posts, chance associations (library X happened to appear in negative posts) get learned as 'rules'.", whenWrong: "Small data breeds spurious correlations: accidental patterns get mistaken for signal. More of them creep in." },
        { prompt: "Finding and documenting a model bias is a weakness to hide from your portfolio.", answer: false, whenRight: "Right — the opposite. An audited, documented bias shows diligence and senior judgment. Hiding it is the real risk.", whenWrong: "Documenting a bias is a strength — it proves you audit models, not just ship them. That's a senior-level signal." }
      ]),
      E("Your turn — find a bias","[WRITE] 1. From your SHAP top-words, identify ONE feature that's a proxy the model shouldn't use (subreddit name, playful profanity, jargon).\n2. Find 2 posts where it caused a wrong prediction.\n3. Document it in `BIASES.md`: the biased feature, the 2 example posts, and one sentence on how you'd mitigate it (more data, remove the feature, etc.).")
    ]),
    D(7,"Ship the interpretability work","Add explainability to the project and tag it.",[
      L("Shipping interpretability as a deliverable",
"## What it is\n" +
"Add an 'Explainability' section to your README and commit the SHAP figures + bias finding:\n\n" +
"```text\n" +
"## Explainability (SHAP)\n" +
"- Global: the model keys on genuine sentiment words (love/broken/etc.) — see figures/.\n" +
"- Local: force plots explain individual predictions, including failures.\n" +
"- Bias found: the model treats mentions of [X] as negative regardless of tone\n" +
"  (2 mislabelled examples in BIASES.md). Mitigation: more balanced data.\n" +
"```\n" +
"```bash\n" +
"git add 08-interpret.ipynb figures/ BIASES.md INTERPRETABILITY.md README.md\n" +
"git commit -m 'SHAP interpretability + documented bias'\n" +
"git tag interpret && git push --tags\n" +
"```\n\n" +
"## Why this elevates the whole project\n" +
"Most ML portfolios stop at 'I trained a model that scores X%.' Adding interpretability — explaining predictions and auditing for bias — signals you understand that a model isn't done when it's accurate; it's done when it's accurate **and** trustworthy. That maturity is exactly what separates a model-builder from someone you'd trust to deploy a model that affects real people.\n\n" +
"## The trust through-line\n" +
"Week 13 you compared models with evidence. Week 14 you ran a controlled experiment. Week 16 you made the model explainable and audited it. Every one of these is the same value: **don't just build it — prove it's right, and know where it isn't.** That's the professional core of the whole track.\n\n" +
"## Where this fits\n" +
"Today you ship the interpretability work. Next week: synthetic data — handling the imbalanced datasets that quietly break naive models."
      ),
      S([
        { prompt: "Adding interpretability signals that a model isn't done when accurate — it's done when accurate AND trustworthy.", answer: true, whenRight: "Right — that maturity separates a model-builder from someone trusted to deploy models affecting real people.", whenWrong: "Accuracy isn't the finish line; trustworthiness is. Interpretability is how you demonstrate the second." },
        { prompt: "Most ML portfolios already include bias audits, so this adds little differentiation.", answer: false, whenRight: "Right — the opposite. Most stop at an accuracy number. An audited, explained model genuinely stands out.", whenWrong: "Few portfolios audit for bias — most just report accuracy. Doing it is a real differentiator." },
        { prompt: "Interpretability shares the same core value as the model-comparison and A/B weeks: prove it's right, know where it isn't.", answer: true, whenRight: "Right — that through-line (evidence over assumption, audit your own work) is the professional core of the track.", whenWrong: "It's the same discipline: don't just build it — validate it and surface its limits. The track's central value." }
      ]),
      E("Your turn — ship interpretability","[PRODUCE] 1. Add an 'Explainability' section to the README (global finding, local plots, the documented bias).\n2. Commit the notebook, figures/, BIASES.md, and INTERPRETABILITY.md.\n3. `git tag interpret && git push && git push --tags`\n\nPASS:\n[x] SHAP set up on the classical model\n[x] Global summary plot saved\n[x] Force plots for correct + wrong predictions\n[x] One bias documented with 2 examples in BIASES.md\n[x] README 'Explainability' section\n[x] Tagged and pushed")
    ])
  ]
};

/* ════ WEEK 17 — Synthetic data generation ════ */
const W17 = {
  number: 17, title: "Synthetic data generation",
  phase: "Modeling", commitment_hours: "12-15",
  context: ds.weeks[16].context,
  concept_check: [
    { q: "Why is 99.7% accuracy on a fraud dataset (0.3% fraud) often a useless model?",
      choices: ["Accuracy is always useless","A model predicting 'not fraud' every time scores 99.7% but catches zero fraud — accuracy hides total failure on the class you care about",
        "99.7% is too low","The data is fake"],
      correct: 1, explain: "With extreme imbalance, predicting the majority class always gives high accuracy while completely failing the rare class. Accuracy is the wrong metric for imbalanced data — you need precision/recall on the minority class, and often techniques like SMOTE to help the model learn it." },
    { q: "What does SMOTE do for an imbalanced dataset?",
      choices: ["Deletes the majority class","Generates synthetic examples of the minority class (by interpolating between real ones) so the model sees a balanced training set",
        "Makes the model bigger","Removes outliers"],
      correct: 1, explain: "SMOTE (Synthetic Minority Over-sampling Technique) creates new minority-class points by interpolating between existing ones, balancing the classes so the model has incentive to learn the rare class instead of ignoring it." },
    { q: "When can synthetic data quietly HURT your model?",
      choices: ["Never — more data always helps","When the synthetic data doesn't reflect reality (e.g. SMOTE on test data, or fakes that leak patterns), it inflates offline metrics while real-world performance drops",
        "Only when you use too little","Synthetic data is always harmful"],
      correct: 1, explain: "Synthetic data helps only if it resembles real data. Applying SMOTE before the train/test split leaks synthetic points into the test set, inflating scores. Unrealistic fakes teach the model patterns that don't exist. The metric looks great; production fails." }
  ],
  days: [
    D(1,"Why synthetic data","When the data you have isn't the data you need.",[
      L("Imbalance, scarcity, and the case for synthetic data",
"## What it is\n" +
"**Synthetic data** is artificially generated data used to supplement or stand in for real data. Two common reasons you need it:\n\n" +
"**1. Class imbalance.** Most real datasets are lopsided. Fraud is ~0.3% of transactions. The rare class — the one you usually care about — is starved of examples, so the model learns to ignore it.\n\n" +
"**2. Scarcity / privacy.** Sometimes you can't get enough real data (rare disease cases) or can't use it (private user records). Realistic fakes let you develop and test without it.\n\n" +
"## The accuracy trap with imbalance\n" +
"```text\n" +
"Fraud dataset: 0.3% fraud, 99.7% normal\n" +
"Model that ALWAYS predicts 'normal':\n" +
"  Accuracy = 99.7%   <- looks amazing\n" +
"  Fraud caught = 0   <- completely useless\n" +
"```\n" +
"This is why **accuracy is the wrong metric for imbalanced data.** A model can score 99.7% by never predicting the class you built it to catch. You need precision/recall on the minority class — and often, techniques that help the model actually learn it.\n\n" +
"## Where this fits\n" +
"This week you learn three synthetic-data tools: **Faker** (realistic fake records), **SMOTE** (synthetic minority examples for imbalance), and **LLM paraphrasing** (augmenting your small Reddit text set) — and critically, **when synthetic data quietly hurts.**"
      ),
      V("Class imbalance and why accuracy lies","https://www.youtube.com/watch?v=Kdsp6soqA7o",9,"various","Why imbalanced data breaks accuracy and what to measure instead."),
      L("The metric that survives imbalance",
"## Precision and recall, not accuracy\n" +
"For the rare class:\n" +
"- **Recall** = of all the actual fraud, what fraction did we catch? (Did we miss fraud?)\n" +
"- **Precision** = of everything we flagged as fraud, what fraction really was? (Did we cry wolf?)\n\n" +
"```text\n" +
"'Always normal' model on fraud data:\n" +
"  Accuracy:  99.7%   (meaningless)\n" +
"  Recall:    0%      (caught no fraud — the truth)\n" +
"```\n" +
"Recall instantly exposes the useless model that accuracy flattered. **Always report precision/recall (or F1) on the minority class for imbalanced problems** — it's the honest scoreboard.\n\n" +
"## Why this frames the whole week\n" +
"Synthetic techniques like SMOTE exist to *improve minority-class recall* — to help the model actually learn the rare class. You can only tell if they worked by measuring recall, not accuracy. The metric and the technique go together."
      ),
      S([
        { prompt: "On a 0.3%-fraud dataset, a model that always predicts 'normal' scores 99.7% accuracy but catches zero fraud.", answer: true, whenRight: "Right — accuracy is flattered by the majority class. The model is useless despite the great-looking number.", whenWrong: "That's the accuracy trap: 99.7% by always guessing the majority, 0% recall on fraud. Useless model, great metric.", sim: "always 'normal': acc 99.7%, recall 0%" },
        { prompt: "For imbalanced data, recall on the minority class reveals failures that accuracy hides.", answer: true, whenRight: "Right — recall=0% exposes the model that caught no fraud, which 99.7% accuracy concealed.", whenWrong: "Recall on the rare class is the honest metric. It catches the 'always majority' failure accuracy misses." },
        { prompt: "Accuracy is the right metric to optimise for a heavily imbalanced problem.", answer: false, whenRight: "Right — no. Use precision/recall/F1 on the minority class. Accuracy is misleading under imbalance.", whenWrong: "Accuracy misleads when classes are imbalanced. Optimise and report minority-class precision/recall/F1 instead." }
      ]),
      E("Your turn — frame the problem","[WRITE] In a `SYNTHETIC.md`:\n1. Explain the accuracy trap with a worked example (your own numbers).\n2. Why is recall the better metric for the rare class?\n3. Name the three synthetic tools this week and what problem each addresses.")
    ]),
    D(2,"Faker for realistic fake records","Generate believable structured data.",[
      L("Faker — synthetic structured data",
"## What it is\n" +
"**Faker** generates realistic fake structured data — names, emails, addresses, dates, companies. Useful for building demos, seeding test databases, or standing in for private data:\n\n" +
"```python\n" +
"from faker import Faker\n" +
"import pandas as pd\n\n" +
"fake = Faker()\n" +
"users = [{'name': fake.name(), 'email': fake.email(),\n" +
"          'city': fake.city(), 'age': fake.random_int(18, 80)}\n" +
"         for _ in range(100)]\n" +
"df = pd.DataFrame(users)\n" +
"df.to_csv('data/fake_users.csv', index=False)\n" +
"```\n\n" +
"## What Faker is good for — and not\n" +
"**Good for:** structurally realistic records (a valid-looking email, a plausible name + city) for demos, tests, and tutorials where you can't or shouldn't use real PII.\n\n" +
"**NOT good for:** training a model that needs to learn *real relationships*. Faker's fields are independent — there's no genuine correlation between a person's city and age, because Faker draws each independently. A model trained on Faker data learns nothing about how variables actually relate in the world. **Faker fakes the structure, not the statistics.**\n\n" +
"## The key distinction for the week\n" +
"Faker is for *plausible-looking* data (privacy, demos). SMOTE (tomorrow) is for *statistically-meaningful* synthetic data that helps a model learn a real, rare class. Knowing which problem each solves — and not confusing them — is the lesson.\n\n" +
"## Where this fits\n" +
"Today you generate 100 fake user records with Faker and note explicitly what they're suitable for (demos, tests) and what they're not (training a relational model)."
      ),
      S([
        { prompt: "Faker is good for generating structurally-realistic records for demos and tests without using real PII.", answer: true, whenRight: "Right — valid-looking names/emails/cities, perfect for seeding test data or demos privately.", whenWrong: "That's Faker's sweet spot: plausible fake records when you can't use real personal data." },
        { prompt: "A model trained on Faker data learns the real relationships between variables (e.g. city and age).", answer: false, whenRight: "Right — no. Faker draws each field independently; there are no real correlations to learn. It fakes structure, not statistics.", whenWrong: "Faker's fields are independent — no genuine relationships. A model learns nothing real from them.", sim: "Faker: city and age drawn independently\n# no real correlation exists" },
        { prompt: "Faker and SMOTE solve the same problem and are interchangeable.", answer: false, whenRight: "Right — different jobs. Faker = plausible records (privacy/demos); SMOTE = statistically-meaningful minority examples for imbalance.", whenWrong: "They're different: Faker for plausible-looking data, SMOTE for class-imbalance. Don't confuse them." }
      ]),
      E("Your turn — generate fakes","[CODE] 1. `pip install faker`.\n2. Generate 100 fake user records (name, email, city, age) into data/fake_users.csv.\n3. Print the head.\n4. Markdown: list one good use (demo/test) and one bad use (training a relational model) for this data, and why.")
    ]),
    D(3,"SMOTE for class imbalance","Synthesise minority examples the right way.",[
      L("SMOTE — synthetic minority over-sampling",
"## What it is\n" +
"**SMOTE** balances an imbalanced dataset by creating synthetic minority-class examples. Instead of just duplicating rare points (which teaches nothing new), it **interpolates** between a minority point and its nearest minority neighbours, generating plausible new points 'between' real ones:\n\n" +
"```python\n" +
"from imblearn.over_sampling import SMOTE\n" +
"from sklearn.model_selection import train_test_split\n\n" +
"X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2,\n" +
"                                                    random_state=42)\n" +
"sm = SMOTE(random_state=42)\n" +
"X_res, y_res = sm.fit_resample(X_train, y_train)   # TRAIN ONLY\n" +
"```\n\n" +
"## THE critical rule: SMOTE only the training set\n" +
"This is the mistake that silently ruins SMOTE work: **you must split first, then SMOTE only the training data.** If you SMOTE before the split, synthetic points (derived from real ones) leak into the test set. Your model then gets 'tested' on data partly synthesised from its own training data → inflated, fake scores → production disappointment.\n\n" +
"```text\n" +
"WRONG: SMOTE all data -> split    (synthetic leaks into test -> fake high score)\n" +
"RIGHT: split -> SMOTE train only  (test stays 100% real -> honest score)\n" +
"```\n\n" +
"## Why interpolation, not duplication\n" +
"Duplicating minority rows just re-shows the same points — the model memorises them (overfits). SMOTE's interpolated points are *new* plausible examples, giving the model genuine variety to learn the minority region. That's why it's the standard over-sampling method.\n\n" +
"## Where this fits\n" +
"Today you apply SMOTE — correctly, train-set only — to an imbalanced dataset, ready to compare with/without tomorrow."
      ),
      V("SMOTE for imbalanced data, explained","https://www.youtube.com/watch?v=GFTAQXdFEUg",10,"various","How SMOTE interpolates minority examples and the train-only rule."),
      L("See it in code (with output)",
"## SMOTE, applied correctly\n" +
"```python\n" +
"from collections import Counter\n" +
"print('Before SMOTE (train):', Counter(y_train))\n" +
"# Before SMOTE (train): {0: 3200, 1: 64}   <- 2% minority\n\n" +
"X_res, y_res = SMOTE(random_state=42).fit_resample(X_train, y_train)\n" +
"print('After SMOTE (train): ', Counter(y_res))\n" +
"# After SMOTE (train):  {0: 3200, 1: 3200}  <- balanced\n\n" +
"print('Test set untouched:  ', Counter(y_test))\n" +
"# Test set untouched:   {0: 800, 1: 16}     <- still real, still imbalanced\n" +
"```\n" +
"The training set is now balanced (the model gets a fair shot at the minority class), while the test set stays 100% real and imbalanced — so your evaluation reflects reality, not synthesis."
      ),
      S([
        { prompt: "You must split the data FIRST, then apply SMOTE only to the training set.", answer: true, whenRight: "Right — SMOTE before the split leaks synthetic points into the test set, faking your score. Split first, always.", whenWrong: "Split first, SMOTE train only. Otherwise synthetic points derived from real ones contaminate the test set.", sim: "RIGHT: split -> SMOTE(train)\nWRONG: SMOTE(all) -> split  # leakage" },
        { prompt: "SMOTE creates new minority examples by interpolating between existing ones, not by duplicating them.", answer: true, whenRight: "Right — interpolation gives genuinely new plausible points; duplication would just cause memorisation/overfit.", whenWrong: "SMOTE interpolates between real minority points to make new ones. Duplication (re-showing rows) doesn't help.", sim: "new point = between real minority neighbours" },
        { prompt: "After correct SMOTE, the test set should also be balanced.", answer: false, whenRight: "Right — no. The test set stays real and imbalanced. Only the TRAINING set is balanced. Test must reflect reality.", whenWrong: "Test stays untouched and real. Balancing it would mean evaluating on synthetic data — dishonest." }
      ]),
      E("Your turn — apply SMOTE","[CODE] On any imbalanced dataset (the Reddit minority class, or a public imbalanced set):\n1. Split train/test (random_state=42) BEFORE touching SMOTE.\n2. Apply SMOTE to the TRAINING set only.\n3. Print class counts before/after on train, and confirm the test set is unchanged.\n4. Markdown: explain why SMOTE-before-split would inflate your score.")
    ]),
    D(4,"Train with/without SMOTE + compare","Measure whether it actually helped.",[
      L("The controlled SMOTE comparison",
"## What it is\n" +
"Train two models — one on the raw imbalanced training set, one on the SMOTE-balanced set — and compare on the **same real test set**:\n\n" +
"```python\n" +
"from sklearn.linear_model import LogisticRegression\n" +
"from sklearn.metrics import classification_report\n\n" +
"m_raw   = LogisticRegression(max_iter=1000).fit(X_train, y_train)\n" +
"m_smote = LogisticRegression(max_iter=1000).fit(X_res, y_res)\n\n" +
"print('WITHOUT SMOTE:'); print(classification_report(y_test, m_raw.predict(X_test)))\n" +
"print('WITH SMOTE:');    print(classification_report(y_test, m_smote.predict(X_test)))\n" +
"```\n\n" +
"## What to look at — minority recall\n" +
"Ignore overall accuracy (it may even drop slightly with SMOTE). Look at **recall on the minority class**:\n" +
"```text\n" +
"WITHOUT SMOTE: minority recall = 0.06   <- catches almost no minority cases\n" +
"WITH SMOTE:    minority recall = 0.71   <- now catches most of them\n" +
"```\n" +
"SMOTE's whole purpose is to lift minority recall. If it did, it worked — even if accuracy dipped, because catching the rare class is the actual goal.\n\n" +
"## The trade-off SMOTE introduces\n" +
"Balancing usually **raises minority recall but lowers precision** (the model now flags more things as the minority class, including some false alarms). Whether that trade is worth it depends on the cost of a miss vs a false alarm — missing fraud is expensive, so high recall is worth some false positives. Naming this trade-off explicitly is the analysis.\n\n" +
"## Where this fits\n" +
"Today you train both models, compare minority recall, and document whether SMOTE helped and what it cost."
      ),
      S([
        { prompt: "After SMOTE you should focus on minority-class recall, not overall accuracy.", answer: true, whenRight: "Right — SMOTE exists to lift minority recall. Accuracy may even dip; recall is the success metric.", whenWrong: "Judge SMOTE by minority recall — its whole purpose. Overall accuracy can mislead and even fall slightly." },
        { prompt: "SMOTE typically raises minority recall but lowers precision (more false alarms).", answer: true, whenRight: "Right — the model flags more cases as the minority class, catching more real ones but also some false positives.", whenWrong: "That's the trade: higher recall, lower precision. Worth it when a miss costs more than a false alarm.", sim: "without: recall 0.06\nwith: recall 0.71, precision drops some" },
        { prompt: "Both the SMOTE and non-SMOTE models must be evaluated on the same real (un-SMOTEd) test set.", answer: true, whenRight: "Right — only the training differs. Evaluating on the real test set keeps the comparison honest and reality-grounded.", whenWrong: "Compare on the identical real test set. That isolates SMOTE's effect and reflects true performance." }
      ]),
      E("Your turn — compare","[CODE] 1. Train one model on the raw training set, one on the SMOTE-balanced set.\n2. Print classification_report for both on the SAME real test set.\n3. Compare minority-class recall and precision.\n4. Markdown: did SMOTE help recall? What did it cost in precision? Was the trade worth it for this problem?")
    ]),
    D(5,"Augment small text datasets","LLM paraphrasing for the Reddit imbalance.",[
      L("Text augmentation with LLM paraphrasing",
"## What it is\n" +
"SMOTE works on numeric features — it can't interpolate sentences. For **text** imbalance (e.g. you have few POSITIVE Reddit posts), the modern approach is **LLM paraphrasing**: ask a model to reword existing minority examples, keeping the meaning and sentiment:\n\n" +
"```python\n" +
"from openai import OpenAI\n" +
"client = OpenAI()\n\n" +
"def paraphrase(text):\n" +
"    r = client.chat.completions.create(\n" +
"        model='gpt-4o-mini',\n" +
"        messages=[{'role':'system','content':\n" +
"            'Reword this Reddit title to mean the same thing in different '\n" +
"            'words. Keep the SAME sentiment.'},\n" +
"          {'role':'user','content': text}])\n" +
"    return r.choices[0].message.content.strip()\n\n" +
"# Generate 2 paraphrases per minority post\n" +
"```\n\n" +
"## Why this works for text\n" +
"A paraphrase is a genuinely new sentence with the same label — it gives the model lexical variety (different words for the same sentiment) without you hand-writing examples. It's the text analogue of SMOTE: synthesise more of the rare class to help the model learn it.\n\n" +
"## The two risks to control\n" +
"1. **Sentiment drift** — the LLM might subtly flip the tone ('it's fine' → 'it's great'). You must spot-check that paraphrases keep the original label, or you're injecting *mislabelled* data.\n" +
"2. **Same train-only rule** — augment only the training set, never the test/gold set. Synthetic paraphrases in your evaluation set would inflate scores exactly like SMOTE leakage.\n\n" +
"## Where this fits\n" +
"Today you paraphrase your minority-class Reddit posts to balance the training set, spot-checking that the sentiment is preserved."
      ),
      L("See it in code (with output)",
"## Paraphrase + verify sentiment preserved\n" +
"```python\n" +
"original = 'this benchmark is a joke'   # NEGATIVE\n" +
"for _ in range(2):\n" +
"    print('->', paraphrase(original))\n" +
"# -> this benchmark is honestly laughable\n" +
"# -> what a worthless benchmark this is\n" +
"# both still clearly NEGATIVE -> safe to add with label NEGATIVE\n\n" +
"# Spot-check a risky one:\n" +
"# 'it works ok i guess' (NEUTRAL)\n" +
"# -> 'it works great!'   <- DRIFTED to POSITIVE — reject this paraphrase\n" +
"```\n" +
"The second example is the trap: the paraphrase drifted from NEUTRAL to POSITIVE. Adding it with the NEUTRAL label would inject mislabelled data. Spot-checking is non-optional."
      ),
      S([
        { prompt: "LLM paraphrasing is the text analogue of SMOTE — synthesising more minority-class examples.", answer: true, whenRight: "Right — SMOTE can't interpolate sentences, so you reword real minority posts to add labelled variety.", whenWrong: "For text, paraphrasing plays SMOTE's role: new sentences, same label, more minority examples to learn from." },
        { prompt: "You must spot-check paraphrases because the LLM can subtly flip the sentiment.", answer: true, whenRight: "Right — 'it's fine' -> 'it's great' drifts NEUTRAL to POSITIVE. Adding it mislabelled poisons training.", whenWrong: "Sentiment drift is real. An unchecked paraphrase can change the label, injecting wrong data. Always verify.", sim: "'works ok i guess' (NEU)\n-> 'works great!' (POS)  # drifted, reject" },
        { prompt: "Paraphrased examples can be safely added to your test/gold set as well as the training set.", answer: false, whenRight: "Right — no. Augment training only. Synthetic paraphrases in evaluation inflate scores like SMOTE leakage.", whenWrong: "Never augment the test/gold set. Keep evaluation 100% real, or your metrics lie. Training only." }
      ]),
      E("Your turn — paraphrase","[CODE] 1. Write a paraphrase(text) function (LLM or a paraphrasing library if no API).\n2. Generate 2 paraphrases for several minority-class Reddit posts.\n3. SPOT-CHECK each: does it keep the original sentiment? Reject any that drifted.\n4. Add the verified paraphrases to your TRAINING set only. Markdown: how many did you reject for drift?")
    ]),
    D(6,"When synthetic data HURTS","The failure modes that make metrics lie.",[
      L("When synthetic data quietly backfires",
"## What it is\n" +
"Synthetic data is a tool, not a free win. It helps *only when it resembles reality*. Here are the ways it quietly backfires — each makes your offline metrics look great while real-world performance drops:\n\n" +
"**1. Leakage (the most common).** SMOTE or paraphrasing applied before the train/test split puts synthetic points (derived from training data) into the test set. The model is partly tested on its own training material → inflated score → production shock.\n\n" +
"**2. Unrealistic synthesis.** If the synthetic data doesn't match the real distribution (Faker's independent fields, a paraphrase that drifted, SMOTE in a region with no real structure), the model learns patterns that don't exist. It fits the fakes, not reality.\n\n" +
"**3. Over-synthesis.** Balancing a 0.3% class up to 50% means 99%+ of the minority data is synthetic. The model is now mostly learning from invented points. A little synthetic data helps; drowning the real signal in it hurts.\n\n" +
"## The unifying principle\n" +
"```text\n" +
"Synthetic data helps  IFF  it faithfully resembles real data\n" +
"                            AND it never touches the test set\n" +
"```\n" +
"Every failure mode above is a violation of one of those two conditions. The skill isn't generating synthetic data — it's knowing when it's helping and when it's lying to you.\n\n" +
"## Why this is the most important day of the week\n" +
"It's easy to apply SMOTE and watch a number go up. It's the senior skill to ask 'is this number real, or did I just leak/over-synthesise my way to it?' The whole point of the week is the judgment, not the tools.\n\n" +
"## Where this fits\n" +
"Today you reflect on (and ideally demonstrate) at least one failure mode — e.g. deliberately SMOTE-before-split and watch the fake score inflate, then fix it — so you internalise the danger."
      ),
      V("Why synthetic data can backfire (data leakage)","https://www.youtube.com/watch?v=dvkrdgM4Z6o",8,"various","How leakage and unrealistic synthesis inflate metrics while hurting real performance."),
      S([
        { prompt: "Synthetic data helps only when it faithfully resembles real data and never touches the test set.", answer: true, whenRight: "Right — those two conditions are the whole rule. Every failure mode violates one of them.", whenWrong: "That's the unifying principle: realistic + test-set-untouched. Break either and synthetic data lies to you." },
        { prompt: "Balancing a 0.3% class up to 50% (so 99% of minority data is synthetic) is always safe.", answer: false, whenRight: "Right — over-synthesis drowns the real signal in invented points. A little helps; mostly-fake hurts.", whenWrong: "Over-synthesis is a real risk. If 99% of the minority is synthetic, the model learns mostly fakes, not reality." },
        { prompt: "The hardest, most valuable skill this week is generating synthetic data, not judging when it helps.", answer: false, whenRight: "Right — reversed. Generating is easy; the senior skill is knowing when the resulting number is real vs. a leak/over-synthesis artifact.", whenWrong: "The judgment is the skill. Anyone can call SMOTE; knowing whether it truly helped (vs leaked) is what matters." }
      ]),
      E("Your turn — demonstrate a failure mode","[CODE] 1. Deliberately apply SMOTE BEFORE the train/test split; record the (inflated) minority recall.\n2. Now do it correctly (split first, SMOTE train only); record the honest recall.\n3. Markdown: how big was the gap between the leaked and honest scores? Write one sentence on why leakage is so dangerous (the metric looks great in dev, fails in production).")
    ]),
    D(7,"Ship synth-aware","Document the experiments and the judgment.",[
      L("Shipping the synthetic-data work",
"## What it is\n" +
"This week's deliverable is less a model and more **documented judgment**: the experiments plus a clear-eyed account of when synthetic data helped and when it hurt. Commit it:\n\n" +
"```bash\n" +
"git add synth.ipynb SYNTHETIC.md\n" +
"git commit -m 'synthetic data: Faker, SMOTE, LLM augmentation + when it hurts'\n" +
"git tag synth-aware && git push --tags\n" +
"```\n\n" +
"## What goes in SYNTHETIC.md\n" +
"```text\n" +
"## Synthetic data experiments\n" +
"- Faker: 100 fake records (good for demos/tests, NOT for relational training).\n" +
"- SMOTE: lifted minority recall 0.06 -> 0.71 on [dataset]; precision dropped\n" +
"  to [x] (acceptable trade given a miss costs more than a false alarm).\n" +
"- LLM paraphrasing: balanced the Reddit minority; rejected N paraphrases for\n" +
"  sentiment drift.\n" +
"- WHEN IT HURTS: SMOTE-before-split inflated recall to [fake] vs [honest] —\n" +
"  leakage demonstrated and avoided.\n" +
"```\n\n" +
"## Why documenting the trade-offs is the point\n" +
"Anyone can run SMOTE. The thing worth showing is that you know **when it helps, what it costs, and how it can deceive you.** A write-up that says 'SMOTE helped recall but I verified no leakage and noted the precision cost' demonstrates exactly the skepticism that makes a data scientist trustworthy with real, messy, imbalanced data — which is most real data.\n\n" +
"## The recurring through-line\n" +
"Like the model-comparison, A/B, and interpretability weeks, this is the same core value once more: **measure honestly, know where your numbers come from, and report the limits.** Synthetic data is just a new place that discipline applies.\n\n" +
"## Where this fits\n" +
"Today you ship the synth-aware work. Next week you make the Reddit model live with a dashboard (v0.4) — back to the project, now with a model trained on a properly-balanced set."
      ),
      S([
        { prompt: "The main deliverable this week is documented judgment about when synthetic data helps vs hurts, not a model.", answer: true, whenRight: "Right — anyone can run SMOTE; showing you know its trade-offs and failure modes is the valuable part.", whenWrong: "It's the judgment: when it helps, what it costs, how it deceives. That write-up is the deliverable." },
        { prompt: "Documenting that SMOTE helped recall BUT noting the precision cost and verifying no leakage shows trustworthy skepticism.", answer: true, whenRight: "Right — that balanced account is exactly what makes you trustworthy with messy imbalanced data.", whenWrong: "That honest, caveated write-up is the goal — it proves you measure critically, not credulously." },
        { prompt: "This week's lesson is unrelated to the model-comparison, A/B, and interpretability weeks.", answer: false, whenRight: "Right — it's the SAME through-line: measure honestly, know where numbers come from, report limits. New tool, same value.", whenWrong: "It's the same core discipline reappearing: honest measurement and knowing your numbers' provenance. Just a new context." }
      ]),
      E("Your turn — ship synth-aware","[PRODUCE] 1. Finalise SYNTHETIC.md with all experiments: Faker, SMOTE (with the recall lift + precision cost), LLM paraphrasing (rejections for drift), and the demonstrated leakage failure.\n2. Commit and tag:\n`git add synth.ipynb SYNTHETIC.md && git commit -m 'synthetic data experiments'`\n`git tag synth-aware && git push && git push --tags`\n\nPASS:\n[x] Faker generated 100 fake records (use/misuse noted)\n[x] SMOTE applied correctly (split first) + recall compared\n[x] Trade-off (recall up, precision down) documented\n[x] LLM paraphrasing for the Reddit imbalance, drift-checked\n[x] Leakage failure mode demonstrated\n[x] Tagged synth-aware")
    ])
  ]
};

// Validate and write
const newWeeks = [W14, W15, W16, W17];
newWeeks.forEach(w => {
  if (w.days.length !== 7) throw new Error(`W${w.number}: need 7 days, got ${w.days.length}`);
  if (!w.concept_check || w.concept_check.length !== 3) throw new Error(`W${w.number}: concept_check must be 3`);
  w.days.forEach(d => {
    const kinds = d.items.map(i => i.kind);
    if (!kinds.includes('lesson'))   throw new Error(`W${w.number} D${d.number}: no lesson`);
    if (!kinds.includes('swipe'))    throw new Error(`W${w.number} D${d.number}: no swipe`);
    if (!kinds.includes('exercise')) throw new Error(`W${w.number} D${d.number}: no exercise`);
  });
});
ds.weeks.splice(13, 4, ...newWeeks);  // replace index 13,14,15,16 (W14,W15,W16,W17)
fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log('SUCCESS: W14-W17 written. Total weeks:', ds.weeks.length);
newWeeks.forEach(w =>
  console.log(`  W${w.number} "${w.title}": ${w.days.length} days, ${w.concept_check.length} concept_check Qs`)
);
