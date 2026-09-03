const path = require('path');
const fs = require('fs');
const FILE = path.join(__dirname, '..', 'data', 'roadmaps', 'data-science.json');
const ds = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const L = (title, body) => ({ kind: 'lesson', title, body });
const V = (title, url, dm, creator, why) => ({ kind: 'video', title, url, duration_min: dm, creator, why });
const S = (cards) => ({ kind: 'swipe', title: 'Quick check — swipe to answer', cards });
const E = (title, body) => ({ kind: 'exercise', title, body });
const RD = (title, url, why) => ({ kind: 'reading', title, url, why });
const D = (number, title, summary, items) => ({ number, title, summary, items });

/* ════ WEEK 6 — Statistical inference + hypothesis testing ════ */
const W6 = {
  number: 6, title: "Statistical inference + hypothesis testing",
  phase: "Foundations", commitment_hours: "12-15",
  context: ds.weeks[5].context,
  concept_check: [
    { q: "Manhattan tips 18%, Brooklyn 16% in your sample. What does a hypothesis test tell you?",
      choices: ["Which borough is better to drive in","Whether the 2-point gap is real signal or could be random sampling noise","The exact true tip rate of each borough","How to increase tips"],
      correct: 1, explain: "A hypothesis test answers exactly one question: is the observed difference large enough that it's unlikely to be a fluke of which rows you happened to sample? It separates 'I noticed a pattern' from 'there is evidence the pattern is real.'" },
    { q: "A t-test returns p = 0.002. What does that p-value mean?",
      choices: ["There's a 0.2% chance the difference is real","If there were truly NO difference, there's a 0.2% chance of seeing a gap this big by random chance","The effect size is 0.002","The model is 99.8% accurate"],
      correct: 1, explain: "A p-value is P(data this extreme | null hypothesis is true). p=0.002 means: if the groups were truly identical, you'd see a gap this large only 0.2% of the time. Small p = the 'no difference' story is hard to believe." },
    { q: "You run 10 pairwise t-tests at p<0.05. Why is a Bonferroni correction needed?",
      choices: ["To make the tests run faster","Because with 10 tests, the chance of at least one false positive is ~40%, not 5%","Because t-tests are inaccurate","To increase statistical power"],
      correct: 1, explain: "Each test at p<0.05 has a 5% false-positive rate. Run 10 and the chance of at least one false alarm balloons to ~40%. Bonferroni divides the threshold (0.05/10=0.005) to keep the overall error rate at 5%." }
  ],
  days: [
    D(1,"Why p-values matter — signal vs noise","The discipline that separates 'I noticed a pattern' from 'it's real.'",[
      L("Hypothesis testing, the null, and the p-value",
"## What it is\n" +
"**Statistical inference** is how you decide whether a pattern in your data is real or just an artifact of which rows you happened to sample. Every test has the same logic:\n\n" +
"1. State a **null hypothesis** (H0): 'there is no real difference / no effect'\n" +
"2. Compute how surprising your data would be *if H0 were true*\n" +
"3. That surprise, as a probability, is the **p-value**\n\n" +
"## What a p-value actually is\n" +
"p = P(seeing data this extreme | H0 is true). A small p-value means your data would be very unlikely under 'no difference' — so you doubt the null. The convention p < 0.05 means 'less than 5% chance this is a fluke; call it significant.'\n\n" +
"**What p is NOT**: it is not the probability the difference is real, and it is not the size of the effect. A tiny, meaningless difference can have a tiny p-value if your sample is huge. Significance ≠ importance.\n\n" +
"## Why it matters\n" +
"This is the difference between a junior who breathlessly announces every wiggle in a chart and a senior who quietly says 'let me check if that's significant first.' Every finding in TaxiPulse — Manhattan vs Brooklyn tips, month-over-month trends, model A vs model B — needs this gate before you put it in a README.\n\n" +
"## Where this fits\n" +
"This week you learn to test your TaxiPulse findings honestly: confidence intervals, t-tests, chi-square, multiple-comparison correction, and the bootstrap. By Sunday, one finding in your README carries a real p-value."
      ),
      V("Hypothesis testing and p-values, clearly explained","https://www.youtube.com/watch?v=0oc49DyA3hU",11,"StatQuest","What a p-value is, what it isn't, and why 0.05 is just a convention."),
      L("The asymmetry of evidence",
"## You never 'prove' the null\n" +
"Hypothesis testing is deliberately asymmetric. You can **reject** the null ('there's evidence of a difference') but you can never **accept** it ('there's no difference'). A large p-value means 'not enough evidence to conclude a difference' — not 'the groups are identical.'\n\n" +
"```text\n" +
"p < 0.05   -> reject H0: 'evidence of a real difference'\n" +
"p >= 0.05  -> fail to reject: 'insufficient evidence' (NOT 'no difference')\n" +
"```\n\n" +
"## Why this framing protects you\n" +
"Absence of evidence is not evidence of absence. A small sample can fail to detect a real difference simply because it lacks **statistical power**. Saying 'we found no significant difference' is honest; saying 'we proved they're the same' is a claim the math does not support.\n\n" +
"This humility is exactly what makes a senior analyst trusted: they state precisely what the data can and cannot support."
      ),
      S([
        { prompt: "A p-value of 0.03 means there is a 3% chance the difference you found is real.", answer: false, whenRight: "Right — p is P(data this extreme | NO real difference), not P(difference is real). 0.03 = 3% chance of this data if the null were true.", whenWrong: "Common trap. p = P(data | null true), NOT P(null). p=0.03 means: if there were no difference, this data would occur 3% of the time.", sim: "p = 0.03\n# NOT 'difference is 97% real'\n# IS 'this data is unlikely if H0 true'" },
        { prompt: "With a large enough sample, even a tiny, meaningless difference can be 'statistically significant'.", answer: true, whenRight: "Right — significance ≠ importance. Huge n shrinks p-values; always check the effect SIZE too, not just p.", whenWrong: "True — p-values shrink with sample size. A trivial 0.1-cent fare gap can hit p<0.001 with millions of rows. Report effect size alongside p.", sim: "n=5M: 0.1% gap -> p<0.001\n# significant but meaningless" },
        { prompt: "A p-value above 0.05 proves the two groups are identical.", answer: false, whenRight: "Right — you can never prove the null. p>0.05 = 'insufficient evidence of a difference', not 'they're the same'.", whenWrong: "You never prove the null. High p means not enough evidence to claim a difference — the groups could still differ (low power)." }
      ]),
      E("Your turn — frame a testable claim","[WRITE] In a new notebook `08-inference.ipynb`, write a markdown cell:\n1. Pick one TaxiPulse difference you found (e.g. Manhattan vs Brooklyn tip rate).\n2. State the null hypothesis (H0) in one sentence.\n3. State in your own words what a p-value of 0.01 would mean for this claim — and what it would NOT mean.")
    ]),
    D(2,"Confidence intervals","A range, not a point — and why it shrinks with more data.",[
      L("Confidence intervals — quantifying uncertainty",
"## What it is\n" +
"A point estimate ('mean fare = $16.42') hides its own uncertainty. A **confidence interval (CI)** reports a range: 'the true mean fare is between $16.18 and $16.66 (95% CI).' It turns a single number into an honest statement about precision.\n\n" +
"```python\n" +
"from scipy import stats\n" +
"mean = fares.mean()\n" +
"sem  = stats.sem(fares)                 # standard error of the mean\n" +
"ci   = stats.t.interval(0.95, len(fares)-1, loc=mean, scale=sem)\n" +
"```\n\n" +
"## What '95% confidence' means\n" +
"If you repeated your sampling many times and built a CI each time, ~95% of those intervals would contain the true mean. The width comes from the **standard error**, which shrinks as sample size grows (SE = sd/√n).\n\n" +
"## Why it matters — the √n law\n" +
"More data = a tighter interval, but with diminishing returns: to halve the CI width you need **4x** the data (because of the square root). This is why a sample of 100 gives a wide, mushy estimate and 1000 gives a crisp one — and why going from 10,000 to 40,000 barely helps. Knowing this stops you from over-collecting.\n\n" +
"## Where this fits\n" +
"Today you compute a CI for mean fare at n=1000 and n=100, and watch the interval widen as data shrinks."
      ),
      L("See it in code (with output)",
"## CI width vs sample size\n" +
"```python\n" +
"import numpy as np\n" +
"from scipy import stats\n\n" +
"def ci_for(n):\n" +
"    x = df['fare_amount'].sample(n, random_state=1).values\n" +
"    sem = stats.sem(x)\n" +
"    lo, hi = stats.t.interval(0.95, len(x)-1, loc=x.mean(), scale=sem)\n" +
"    return lo, hi, hi-lo\n\n" +
"for n in [100, 1000, 10000]:\n" +
"    lo, hi, w = ci_for(n)\n" +
"    print(f'n={n:5d}: [{lo:.2f}, {hi:.2f}]  width={w:.2f}')\n" +
"# n=  100: [14.98, 18.21]  width=3.23\n" +
"# n= 1000: [15.92, 16.94]  width=1.02\n" +
"# n=10000: [16.26, 16.58]  width=0.32\n" +
"# 10x the data -> ~3x tighter (sqrt(10) ~ 3.16)\n" +
"```\n" +
"The width drops by roughly √10 each time n grows 10x — the diminishing-returns law in action."
      ),
      S([
        { prompt: "A 95% confidence interval gets NARROWER as you increase the sample size.", answer: true, whenRight: "Right — width depends on standard error = sd/√n. Bigger n -> smaller SE -> tighter interval.", whenWrong: "More data -> smaller standard error -> narrower CI. The interval tightens as n grows.", sim: "n=100:  width 3.23\nn=10000: width 0.32" },
        { prompt: "To make a confidence interval half as wide, you roughly need to double your sample size.", answer: false, whenRight: "Right — you need 4x the data, not 2x. Width scales with 1/√n, so halving width needs quadrupling n.", whenWrong: "Because of the √n in the denominator, halving the width requires 4x the data, not 2x. Diminishing returns.", sim: "width ~ 1/sqrt(n)\nhalf width -> 4x the n" },
        { prompt: "A 95% CI means there's a 95% probability the true value is in this specific interval.", answer: false, whenRight: "Right — the technically-correct reading: 95% of intervals built this way contain the truth. Any single interval either does or doesn't.", whenWrong: "Subtle: the 95% refers to the long-run procedure, not this one interval. 95% of such intervals capture the truth." }
      ]),
      E("Your turn — confidence intervals","[CODE] In `08-inference.ipynb`:\n1. Compute a 95% CI for mean fare_amount using a sample of 1000 trips.\n2. Repeat with a sample of 100. How much wider is the interval?\n3. Markdown: explain why the n=100 interval is wider, using the √n idea.")
    ]),
    D(3,"T-test between two groups","Is the Manhattan vs Brooklyn tip gap real?",[
      L("The two-sample t-test",
"## What it is\n" +
"A **two-sample t-test** asks: are the means of two groups different by more than sampling noise would explain? It's the right tool for 'Manhattan tips vs Brooklyn tips' — two groups, one numeric measure.\n\n" +
"```python\n" +
"from scipy import stats\n" +
"man = df[df.pickup_borough=='Manhattan']['tip_rate'].sample(1000)\n" +
"brk = df[df.pickup_borough=='Brooklyn']['tip_rate'].sample(1000)\n" +
"t, p = stats.ttest_ind(man, brk, equal_var=False)   # Welch's t-test\n" +
"```\n\n" +
"## Reading the output\n" +
"- **t-statistic** — how many standard errors apart the means are. Bigger magnitude = more separated.\n" +
"- **p-value** — probability of a gap this large if the true means were equal.\n\n" +
"## Use equal_var=False (Welch's test)\n" +
"The classic Student's t-test assumes both groups have equal variance — often false in real data. **Welch's t-test** (`equal_var=False`) drops that assumption and is the safer default. There is almost never a good reason to assume equal variance with messy real-world data.\n\n" +
"## Why it matters\n" +
"This is the workhorse test for A/B results, before/after comparisons, and group differences. Almost every 'did X change Y?' question in a data role is, underneath, a t-test.\n\n" +
"## Where this fits\n" +
"Today you test whether the borough tip-rate difference you spotted in Week 3 is statistically significant."
      ),
      V("The two-sample t-test, clearly explained","https://www.youtube.com/watch?v=pTmLQvMM-1M",9,"StatQuest","What the t-statistic measures and how it becomes a p-value."),
      L("See it in code (with output)",
"## Test the borough tip-rate gap\n" +
"```python\n" +
"from scipy import stats\n\n" +
"man = df[df.pickup_borough=='Manhattan']['tip_rate'].sample(1000, random_state=1)\n" +
"brk = df[df.pickup_borough=='Brooklyn']['tip_rate'].sample(1000, random_state=1)\n\n" +
"print(f'Manhattan mean: {man.mean():.3f}')\n" +
"print(f'Brooklyn  mean: {brk.mean():.3f}')\n" +
"t, p = stats.ttest_ind(man, brk, equal_var=False)\n" +
"print(f't = {t:.2f},  p = {p:.2e}')\n" +
"# Manhattan mean: 0.182\n" +
"# Brooklyn  mean: 0.164\n" +
"# t = 6.41,  p = 1.7e-10\n" +
"# p far below 0.05 -> the 1.8-point gap is statistically significant\n" +
"```\n" +
"p = 1.7e-10 means: if the two boroughs truly tipped the same, you'd see a gap this big essentially never. The difference is real — now you can put it in the README with a p-value behind it."
      ),
      S([
        { prompt: "A two-sample t-test is the right tool for comparing the mean tip rate of two boroughs.", answer: true, whenRight: "Right — two groups, one numeric measure, comparing means: that's exactly the t-test's job.", whenWrong: "Two groups + a numeric outcome + comparing means = two-sample t-test. This is its core use case." },
        { prompt: "Welch's t-test (equal_var=False) is usually the safer default than assuming equal variance.", answer: true, whenRight: "Right — real groups rarely have equal variance. Welch's drops that assumption and is the robust default.", whenWrong: "Welch's (equal_var=False) is safer because it doesn't assume equal spread, which real data rarely has.", sim: "stats.ttest_ind(a, b, equal_var=False)\n# Welch's: robust default" },
        { prompt: "A t-test p-value of 1.7e-10 means the difference is almost certainly just random noise.", answer: false, whenRight: "Right — the opposite. A p that tiny means the gap is extremely UNlikely to be noise. The difference is real.", whenWrong: "1.7e-10 is far below 0.05 — the gap is highly significant, not noise. Such data would basically never occur if the means were equal." }
      ]),
      E("Your turn — t-test","[CODE] In `08-inference.ipynb`:\n1. Run a Welch's t-test comparing tip_rate between two boroughs (1000 each).\n2. Print the means, t-statistic, and p-value.\n3. Markdown: is the difference significant at p<0.05? State in plain English what the p-value tells you here.")
    ]),
    D(4,"Chi-square for categorical data","Is payment type associated with whether a rider tips?",[
      L("The chi-square test of independence",
"## What it is\n" +
"The t-test compares *numeric* means. When both variables are **categorical**, you use the **chi-square test of independence**: are two categorical variables related, or independent?\n\n" +
"For TaxiPulse: is **payment_type** (card vs cash) associated with **whether the rider tipped** (yes/no)? You build a contingency table (a crosstab of counts) and test it:\n\n" +
"```python\n" +
"from scipy.stats import chi2_contingency\n" +
"df['tipped'] = df['tip_amount'] > 0\n" +
"ct = pd.crosstab(df['payment_type'], df['tipped'])\n" +
"chi2, p, dof, expected = chi2_contingency(ct)\n" +
"```\n\n" +
"## How it works\n" +
"Chi-square compares the **observed** counts to the counts you'd **expect** if the two variables were independent. A big gap between observed and expected = a big chi-square statistic = a small p-value = the variables are associated.\n\n" +
"## Why it matters\n" +
"Tons of real questions are categorical-vs-categorical: does device type relate to conversion? Does region relate to churn? Does day-of-week relate to whether a trip is a no-tip trip? The chi-square test is the standard tool, and it appears constantly in product analytics.\n\n" +
"## Where this fits\n" +
"Today you test whether payment type and tipping are independent in your taxi data — a categorical relationship the t-test can't touch."
      ),
      L("See it in code (with output)",
"## Chi-square: payment type vs tipping\n" +
"```python\n" +
"import pandas as pd\n" +
"from scipy.stats import chi2_contingency\n\n" +
"df['tipped'] = df['tip_amount'] > 0\n" +
"ct = pd.crosstab(df['payment_type'], df['tipped'])\n" +
"print(ct)\n" +
"# tipped         False    True\n" +
"# payment_type\n" +
"# 1 (card)       41203  1893477   <- card riders almost always tip\n" +
"# 2 (cash)      987612     2104   <- cash trips: tip rarely recorded\n\n" +
"chi2, p, dof, expected = chi2_contingency(ct)\n" +
"print(f'chi2 = {chi2:.0f},  p = {p:.2e},  dof = {dof}')\n" +
"# chi2 = 2410338,  p = 0.0,  dof = 1\n" +
"# Massive association: payment type strongly predicts whether a tip is recorded\n" +
"```\n" +
"The data exposes a real quirk: cash tips usually aren't logged by the meter, so 'tipped' is almost entirely a card phenomenon. The chi-square test makes this dependency undeniable — and warns you not to model tips on cash trips."
      ),
      S([
        { prompt: "The chi-square test is for two CATEGORICAL variables, where the t-test is for comparing numeric means.", answer: true, whenRight: "Right — chi-square: category vs category. t-test: numeric mean vs numeric mean. Match the test to the data type.", whenWrong: "Chi-square handles categorical-vs-categorical (payment type vs tipped). The t-test compares numeric group means.", sim: "t-test:  tip_rate (number) by borough\nchi-sq:  payment_type vs tipped (both categories)" },
        { prompt: "Chi-square works by comparing observed counts to the counts expected if the variables were independent.", answer: true, whenRight: "Right — big observed-vs-expected gaps drive a big statistic and a small p-value.", whenWrong: "That's the mechanism: observed vs expected-under-independence. Large discrepancy = significant association.", sim: "observed != expected  -> high chi2  -> low p\n# variables ARE associated" },
        { prompt: "A chi-square test can tell you the strength and direction of a numeric correlation.", answer: false, whenRight: "Right — that's Pearson's job. Chi-square only tests categorical association (yes/no), not numeric correlation direction.", whenWrong: "Chi-square tests categorical independence — it doesn't give a correlation coefficient or direction. Use Pearson r for numeric relationships." }
      ]),
      E("Your turn — chi-square","[CODE] In `08-inference.ipynb`:\n1. Create a categorical column (e.g. tipped = tip_amount > 0).\n2. Build a crosstab of payment_type vs tipped.\n3. Run chi2_contingency. Print chi2, p, dof.\n4. Markdown: are the two variables independent? What real-world quirk does the result reveal about cash tips?")
    ]),
    D(5,"Multiple comparisons + Bonferroni","Run 10 tests and you'll 'find' something even in random data.",[
      L("The multiple comparisons problem",
"## What it is\n" +
"Each test at p<0.05 carries a 5% false-positive rate. Run **many** tests and those 5%s compound. With 10 independent tests, the chance of at least one false positive is:\n\n" +
"```text\n" +
"1 - (0.95)^10 = 0.40   ->  ~40% chance of a false alarm\n" +
"```\n\n" +
"Comparing fares across all 5 boroughs means 10 pairwise tests — so even if no borough truly differed, you'd likely 'find' a significant pair anyway. This is how data dredging manufactures fake findings.\n\n" +
"## The Bonferroni correction\n" +
"The simplest fix: divide your threshold by the number of tests.\n\n" +
"```text\n" +
"adjusted threshold = 0.05 / 10 = 0.005\n" +
"```\n\n" +
"Only call a pair significant if its p-value is below 0.005. This keeps the overall (family-wise) error rate at ~5%. Bonferroni is conservative (it can miss real effects) but it is simple, defensible, and the right instinct: more tests demand more stringent thresholds.\n\n" +
"## Why it matters\n" +
"This is one of the most common ways analysts fool themselves. The senior move is to count your tests and adjust *before* announcing the winner.\n\n" +
"## Where this fits\n" +
"Today you run all 10 borough-pair fare tests and apply Bonferroni to see which differences survive honest scrutiny."
      ),
      V("The multiple testing problem and Bonferroni","https://www.youtube.com/watch?v=K8LQSvtjcEo",8,"StatQuest","Why running many tests inflates false positives, and how correction fixes it."),
      L("See it in code (with output)",
"## All borough pairs, with Bonferroni\n" +
"```python\n" +
"from itertools import combinations\n" +
"from scipy import stats\n\n" +
"boroughs = ['Manhattan','Brooklyn','Queens','Bronx','Staten Island']\n" +
"pairs = list(combinations(boroughs, 2))   # 10 pairs\n" +
"threshold = 0.05 / len(pairs)             # 0.005\n\n" +
"for a, b in pairs:\n" +
"    fa = df[df.pickup_borough==a]['fare_amount'].sample(1000, random_state=1)\n" +
"    fb = df[df.pickup_borough==b]['fare_amount'].sample(1000, random_state=1)\n" +
"    t, p = stats.ttest_ind(fa, fb, equal_var=False)\n" +
"    flag = 'SIGNIFICANT' if p < threshold else 'ns'\n" +
"    print(f'{a:13s} vs {b:13s}: p={p:.4f}  {flag}')\n" +
"# Manhattan     vs Queens       : p=0.0000  SIGNIFICANT\n" +
"# Brooklyn      vs Bronx        : p=0.0123  ns   <- would pass at 0.05, fails at 0.005\n" +
"# ...\n" +
"```\n" +
"That Brooklyn-vs-Bronx pair (p=0.012) looked significant at the naive 0.05 line but fails the corrected 0.005 bar — exactly the false positive Bonferroni is designed to catch."
      ),
      S([
        { prompt: "Running 10 independent tests at p<0.05 gives roughly a 40% chance of at least one false positive.", answer: true, whenRight: "Right — 1-(0.95)^10 ≈ 0.40. The more tests, the more likely a fluke 'significant' result.", whenWrong: "1-(0.95)^10 ≈ 0.40. Each test risks a 5% false alarm; ten tests compound to ~40%.", sim: "1 test:  5% false-positive risk\n10 tests: ~40% risk of >=1 false alarm" },
        { prompt: "Bonferroni correction makes the significance threshold STRICTER as you run more tests.", answer: true, whenRight: "Right — threshold = 0.05/n. More tests -> smaller threshold -> harder to claim significance.", whenWrong: "Bonferroni divides 0.05 by the number of tests. 10 tests -> 0.005. More tests = stricter bar.", sim: "10 tests -> threshold 0.05/10 = 0.005" },
        { prompt: "Bonferroni is anti-conservative — it makes you MORE likely to declare false positives.", answer: false, whenRight: "Right — it's the opposite. Bonferroni is conservative: it guards against false positives, sometimes at the cost of missing real effects.", whenWrong: "Bonferroni is conservative — it reduces false positives. Its trade-off is occasionally missing a true effect (lower power)." }
      ]),
      E("Your turn — Bonferroni","[CODE] In `08-inference.ipynb`:\n1. Run all 10 pairwise fare t-tests across the 5 boroughs.\n2. Apply a Bonferroni threshold of 0.05/10 = 0.005.\n3. Markdown: which pairs are significant after correction? Did any pair pass at 0.05 but fail at 0.005?")
    ]),
    D(6,"Bootstrap confidence intervals","Resampling: a CI for anything, with no formula required.",[
      L("The bootstrap — confidence intervals by simulation",
"## What it is\n" +
"The t-distribution CI from Day 2 assumes your statistic follows a known distribution. The **bootstrap** assumes nothing: it estimates uncertainty by **resampling your data with replacement** thousands of times and watching how the statistic varies.\n\n" +
"```python\n" +
"import numpy as np\n" +
"def bootstrap_ci(x, n=1000):\n" +
"    means = [np.random.choice(x, len(x), replace=True).mean() for _ in range(n)]\n" +
"    return np.percentile(means, [2.5, 97.5])\n" +
"```\n\n" +
"Each iteration draws a new sample (same size, with replacement) and recomputes the mean. The middle 95% of those 1000 means *is* your confidence interval.\n\n" +
"## Why it matters — it works for ANY statistic\n" +
"The t-interval has a clean formula for the *mean*. But what's the CI for a **median**? A **90th percentile**? A **correlation**? Those have ugly or nonexistent formulas — but the bootstrap handles all of them identically: resample, recompute, take percentiles. It's a single technique that replaces a shelf of formulas.\n\n" +
"It also shines when your data is skewed or small, where the t-distribution's normality assumption is shaky.\n\n" +
"## Where this fits\n" +
"Today you bootstrap a CI for mean fare, confirm it matches the Day-2 t-interval, then bootstrap something the t-test can't easily give you — a CI for the median."
      ),
      L("See it in code (with output)",
"## Bootstrap vs t-interval\n" +
"```python\n" +
"import numpy as np\n" +
"from scipy import stats\n\n" +
"fares = df['fare_amount'].sample(1000, random_state=1).values\n\n" +
"def bootstrap_ci(x, stat=np.mean, n=2000):\n" +
"    vals = [stat(np.random.choice(x, len(x), replace=True)) for _ in range(n)]\n" +
"    return np.percentile(vals, [2.5, 97.5])\n\n" +
"print('Bootstrap mean CI:', bootstrap_ci(fares).round(2))\n" +
"# Bootstrap mean CI: [15.93 16.95]\n\n" +
"sem = stats.sem(fares)\n" +
"t_ci = stats.t.interval(0.95, len(fares)-1, loc=fares.mean(), scale=sem)\n" +
"print('t-distribution  CI:', np.round(t_ci, 2))\n" +
"# t-distribution  CI: [15.92 16.94]   <- matches the bootstrap\n\n" +
"print('Bootstrap MEDIAN CI:', bootstrap_ci(fares, np.median).round(2))\n" +
"# Bootstrap MEDIAN CI: [11.50 12.50]  <- no clean t-formula for this!\n" +
"```\n" +
"The bootstrap mean-CI matches the t-interval (validation), then delivers a median CI the t-test simply can't give you. One technique, any statistic."
      ),
      S([
        { prompt: "The bootstrap estimates a confidence interval by resampling the data with replacement many times.", answer: true, whenRight: "Right — resample, recompute the statistic, repeat thousands of times, take the middle 95% of results.", whenWrong: "That's the bootstrap: many resamples-with-replacement, recompute the stat each time, read off the percentiles.", sim: "for i in range(2000):\n  resample with replacement\n  record the mean\n# middle 95% = the CI" },
        { prompt: "A key advantage of the bootstrap is that it works for statistics with no clean formula, like the median or 90th percentile.", answer: true, whenRight: "Right — same procedure for any statistic. That generality is why it's so loved.", whenWrong: "That's its superpower: the t-interval needs a formula per statistic; the bootstrap handles median, percentiles, correlation — all identically." },
        { prompt: "Resampling 'with replacement' means each bootstrap sample must contain entirely different rows from the original.", answer: false, whenRight: "Right — with replacement means rows CAN repeat. The same row may appear several times in one resample; that's the point.", whenWrong: "With replacement = rows can be drawn more than once. Each resample is the same size as the original but with repeats." }
      ]),
      E("Your turn — bootstrap","[CODE] In `08-inference.ipynb`:\n1. Write a bootstrap_ci(x, stat, n) function.\n2. Bootstrap a 95% CI for mean fare; confirm it matches your Day-2 t-interval.\n3. Bootstrap a 95% CI for the MEDIAN fare.\n4. Markdown: when would you reach for the bootstrap over the t-distribution formula?")
    ]),
    D(7,"Ship inference-ready TaxiPulse","One finding in the README now carries a real p-value.",[
      L("Putting a p-value behind your claim",
"## What it is\n" +
"This week converts TaxiPulse claims from 'I noticed' to 'I tested.' Shipping means your README's headline finding now carries statistical backing:\n\n" +
"```text\n" +
"## Statistically validated finding\n" +
"Manhattan trips tip 1.8 points higher than Brooklyn (18.2% vs 16.4%),\n" +
"a difference significant at p < 0.001 (Welch's t-test, n=1000/group).\n" +
"```\n\n" +
"## Why this raises the bar\n" +
"Most portfolio projects state findings with no idea whether they're real. Adding 'p < 0.001' signals you know the difference between a pattern and an artifact — exactly the judgment that separates a junior who reports every wiggle from a senior who validates first. It's a small phrase that demonstrates a whole discipline.\n\n" +
"## The honesty clause\n" +
"Report what you tested, the test you used, and the n. If a finding *failed* to reach significance, say so plainly ('no significant difference between X and Y, p=0.21') — that's a real result too, and the willingness to report it is what makes the significant findings credible.\n\n" +
"## Where this fits\n" +
"Today you assemble `08-inference.ipynb`, pick your most defensible significant finding, and write it into the README with its p-value and test."
      ),
      S([
        { prompt: "Adding 'p < 0.001 (Welch's t-test)' to a README finding signals statistical maturity to a reviewer.", answer: true, whenRight: "Right — it shows you validate before you announce. That judgment is exactly what employers screen for.", whenWrong: "It's a small phrase that demonstrates a whole discipline: you separate real signal from noise before claiming a finding." },
        { prompt: "A finding that FAILED to reach significance (p=0.21) should be hidden from the write-up.", answer: false, whenRight: "Right — report it honestly. A non-significant result is a real result; reporting it is what makes your significant claims trustworthy.", whenWrong: "Hiding null results is a form of p-hacking. State non-significant findings plainly — honesty is what makes the rest credible." },
        { prompt: "Reporting the test used and the sample size alongside the p-value is part of a credible claim.", answer: true, whenRight: "Right — test + n + p together let a reader judge the claim. A bare 'significant!' is not reproducible or checkable.", whenWrong: "Always report test, n, and p. Those three let someone evaluate (and reproduce) your conclusion." }
      ]),
      E("Your turn — ship inference-ready","[PRODUCE] 1. Finalise `08-inference.ipynb` containing: a CI, a t-test, a chi-square, a Bonferroni-corrected multi-test, and a bootstrap CI.\n2. Pick your most defensible significant finding and add it to the TaxiPulse README with its p-value, test, and n.\n3. Commit: `git add . && git commit -m 'Week 6: statistical inference'` and push.\n\nPASS:\n[x] t-distribution + bootstrap CIs computed\n[x] Two-group t-test run\n[x] Chi-square on categorical data\n[x] Bonferroni applied to multiple tests\n[x] One p-value-backed finding in the README")
    ])
  ]
};

/* ════ WEEK 7 — TaxiPulse v0.4: Deploy a fare-predictor API ════ */
const W7 = {
  number: 7, title: "TaxiPulse v0.4: Deploy a fare-predictor API",
  phase: "Foundations", commitment_hours: "12-18",
  context: ds.weeks[6].context,
  concept_check: [
    { q: "Your model lives in a Jupyter notebook. Why isn't that a 'product'?",
      choices: ["Notebooks are slow","To use it, someone must clone the repo, install Python, and run cells — no one else can actually call it","Jupyter is deprecated","Notebooks can't hold models"],
      correct: 1, explain: "A notebook is a lab environment for one person. A product is something others can use without your setup. Wrapping the model in an API behind a public URL turns 'runs on my machine' into 'anyone can call it'." },
    { q: "What does a REST API endpoint like POST /predict do?",
      choices: ["Stores data in a database","Receives a JSON request, runs your code, and returns a JSON response over HTTP","Renders a web page","Trains the model"],
      correct: 1, explain: "An API endpoint is a URL that accepts a request (here, JSON with trip features), runs server-side logic (load model, predict), and returns a structured response (the predicted fare). It's how software talks to software." },
    { q: "Why save the model with joblib instead of retraining it inside the API?",
      choices: ["joblib models are smaller","Retraining on every request would be enormously slow; you load the trained artifact once and serve instant predictions","joblib is required by Flask","It improves accuracy"],
      correct: 1, explain: "Training takes seconds to minutes; you can't do it per request. You serialise the trained model once (joblib.dump), then the API loads it at startup and each prediction is a millisecond-scale .predict() call." }
  ],
  days: [
    D(1,"Why deploy — from notebook to product","The leap that separates building models from shipping them.",[
      L("APIs, endpoints, and what 'deployment' means",
"## What it is\n" +
"Your Week 5 fare model works — but only for you, in your notebook. **Deployment** means putting it somewhere others can use it without your laptop, your environment, or any knowledge of Python. The vehicle is a **REST API**.\n\n" +
"An **API (Application Programming Interface)** is a contract: send a request to a URL, get a structured response back. A **REST API** uses HTTP, the same protocol as websites:\n\n" +
"```text\n" +
"POST https://taxipulse.onrender.com/predict\n" +
"Body: {\"distance\": 5, \"duration_min\": 15, \"hour\": 14}\n" +
"  ->  {\"predicted_fare\": 18.42}\n" +
"```\n\n" +
"## Why it matters\n" +
"This is the line between a data scientist who *builds* models and one who *ships* them. A model behind a public URL can power a mobile app, a website, another team's service. A model in a notebook can power a screenshot. The skill of turning the second into the first is what makes you a force-multiplier on a team.\n\n" +
"## The plan for the week\n" +
"Save the model (Day 2) → wrap it in a Flask API (Day 3) → add a health check (Day 4) → make it production-runnable with gunicorn (Day 5) → deploy to a public URL on Render (Day 6) → tag v0.4 (Day 7).\n\n" +
"## Where this fits\n" +
"By Sunday, anyone in the world can POST trip details to your URL and get a fare prediction back in milliseconds."
      ),
      V("Flask in 100 Seconds","https://www.youtube.com/watch?v=lj4I_CvBnt0",3,"Fireship","What Flask is — the micro-framework you'll use to wrap the model."),
      L("Request and response — the mental model",
"## The whole interaction\n" +
"```text\n" +
"CLIENT (browser, app, curl)        SERVER (your Flask app)\n" +
"   |                                   |\n" +
"   |  POST /predict                    |\n" +
"   |  {distance, duration, hour}  -->  | 1. parse JSON\n" +
"   |                                   | 2. model.predict([...])\n" +
"   |  <-- {predicted_fare: 18.42}      | 3. return JSON\n" +
"```\n\n" +
"## Stateless and synchronous\n" +
"Each request is independent — the server doesn't remember the last one. It receives input, computes, responds, forgets. That statelessness is what lets an API serve thousands of users at once and scale across multiple servers.\n\n" +
"## Why JSON\n" +
"JSON is the lingua franca of APIs: human-readable, language-agnostic, native to JavaScript and trivially parsed in Python. Your request and response are both JSON, so any client in any language can talk to your model."
      ),
      S([
        { prompt: "A REST API lets other programs use your model over HTTP without installing Python or your dependencies.", answer: true, whenRight: "Right — the client just sends an HTTP request. All the Python lives on your server, invisible to them.", whenWrong: "That's the point of an API: the model runs server-side; clients send HTTP and get JSON, in any language.", sim: "curl -X POST .../predict -d '{...}'\n# no Python needed on the caller's side" },
        { prompt: "A model deployed behind a public URL is more useful as a product than the same model in a notebook.", answer: true, whenRight: "Right — a URL can power apps and other services; a notebook can power a screenshot. Deployment is the value multiplier.", whenWrong: "A public endpoint is callable by anyone/anything. The notebook requires your setup. Deployment is what makes it a product." },
        { prompt: "REST APIs are stateful — each request depends on remembering the previous one.", answer: false, whenRight: "Right — they're stateless. Each request is independent, which is exactly what lets the API scale.", whenWrong: "REST is stateless: each request stands alone. That independence is what enables scaling across many servers." }
      ]),
      E("Your turn — design the contract","[WRITE] In a `API.md` file, design your endpoint contract:\n1. The URL path and HTTP method (e.g. POST /predict).\n2. The exact JSON request shape (which keys, what types).\n3. The exact JSON response shape.\n4. One sentence: why is a public API more useful than the notebook?")
    ]),
    D(2,"Save the model","Serialise the trained model so the API can load it instantly.",[
      L("Model serialisation with joblib",
"## What it is\n" +
"A trained model is an object in memory — weights, trees, configuration. **Serialisation** writes that object to a file so you can reload it later without retraining:\n\n" +
"```python\n" +
"import joblib\n" +
"joblib.dump(model, 'fare_model.pkl')      # save\n" +
"loaded = joblib.load('fare_model.pkl')    # reload, ready to predict\n" +
"```\n\n" +
"**joblib** is the standard for sklearn/XGBoost models — it's like pickle but optimised for the large NumPy arrays inside ML models.\n\n" +
"## Why save instead of retrain in the API\n" +
"Training takes seconds to minutes and needs the full dataset. You cannot do that on every API request. Instead you train **once**, save the artifact, and the API **loads it once at startup**. Each prediction is then a millisecond `.predict()` call. Train-once / serve-many is the fundamental shape of every ML deployment.\n\n" +
"## Verify the round-trip\n" +
"Always test that the reloaded model predicts identically to the original before you build on it — a corrupted save discovered now is cheap; discovered in production, expensive.\n\n" +
"## Where this fits\n" +
"Today you save your Week 5 model to `fare_model.pkl` and confirm the loaded copy predicts correctly. The API will load this exact file."
      ),
      L("See it in code (with output)",
"## Save and verify\n" +
"```python\n" +
"import joblib\n\n" +
"# Save the better model from Week 5 (XGBoost)\n" +
"joblib.dump(model2, 'fare_model.pkl')\n" +
"print('Saved fare_model.pkl')\n\n" +
"# Verify the round-trip\n" +
"loaded = joblib.load('fare_model.pkl')\n" +
"test_trip = [[5.2, 18, 14]]   # 5.2 mi, 18 min, 2pm\n" +
"print('Original:', model2.predict(test_trip)[0].round(2))\n" +
"print('Loaded:  ', loaded.predict(test_trip)[0].round(2))\n" +
"# Original: 19.84\n" +
"# Loaded:   19.84   <- identical: save is good\n" +
"```\n" +
"Matching predictions confirm the serialised model is intact. The API in Day 3 will `joblib.load('fare_model.pkl')` exactly like this."
      ),
      S([
        { prompt: "joblib.dump saves a trained model to a file so it can be reloaded later without retraining.", answer: true, whenRight: "Right — serialise once, reload anywhere. The API loads the .pkl at startup instead of retraining.", whenWrong: "joblib.dump serialises the trained object to disk. Reloading it skips retraining entirely.", sim: "joblib.dump(model, 'fare_model.pkl')\nloaded = joblib.load('fare_model.pkl')" },
        { prompt: "It's fine for an API to retrain the model on every incoming request.", answer: false, whenRight: "Right — never. Training is too slow for per-request. Load the saved model once; predict per request.", whenWrong: "Retraining per request would make each call take seconds-to-minutes. Load once at startup; serve fast predictions.", sim: "startup:  load fare_model.pkl  (once)\nrequest:  model.predict(...)    (ms)" },
        { prompt: "Verifying that the reloaded model predicts the same as the original is a worthwhile check.", answer: true, whenRight: "Right — a corrupt save caught now is cheap; caught in production it's an outage. Always round-trip test.", whenWrong: "Always verify the round-trip. Matching predictions confirm the serialisation didn't corrupt the model." }
      ]),
      E("Your turn — save the model","[CODE] 1. In your Week 5 notebook, joblib.dump your better model to `fare_model.pkl`.\n2. Reload it with joblib.load.\n3. Predict on one test trip [[5.2, 18, 14]] with both the original and loaded model.\n4. Confirm the predictions match exactly.")
    ]),
    D(3,"Build the Flask app","Wrap the model in a /predict endpoint.",[
      L("Flask routes, requests, and JSON responses",
"## What it is\n" +
"**Flask** is a minimal Python web framework. A few lines turn your model into a live endpoint:\n\n" +
"```python\n" +
"from flask import Flask, request, jsonify\n" +
"import joblib\n\n" +
"app = Flask(__name__)\n" +
"model = joblib.load('fare_model.pkl')   # load ONCE at startup\n\n" +
"@app.route('/predict', methods=['POST'])\n" +
"def predict():\n" +
"    d = request.get_json()\n" +
"    pred = float(model.predict([[d['distance'], d['duration_min'], d['hour']]])[0])\n" +
"    return jsonify({'predicted_fare': round(pred, 2)})\n" +
"```\n\n" +
"## The pieces\n" +
"- **`@app.route('/predict', methods=['POST'])`** — registers the URL + method\n" +
"- **`request.get_json()`** — parses the incoming JSON body into a dict\n" +
"- **`jsonify(...)`** — turns your dict into a proper JSON HTTP response\n\n" +
"## Handle bad input\n" +
"Real clients send malformed requests — missing keys, wrong types. Wrap the prediction in a try/except and return a clear error with a 400 status, rather than letting the server 500-crash. Graceful failure is part of a professional API.\n\n" +
"## Where this fits\n" +
"Today you write `app.py`, run it locally, and get your first fare prediction back over HTTP from your own server."
      ),
      L("See it in code (with output)",
"## app.py + a local test\n" +
"```python\n" +
"from flask import Flask, request, jsonify\n" +
"import joblib\n\n" +
"app = Flask(__name__)\n" +
"model = joblib.load('fare_model.pkl')\n\n" +
"@app.route('/predict', methods=['POST'])\n" +
"def predict():\n" +
"    d = request.get_json()\n" +
"    try:\n" +
"        x = [[d['distance'], d['duration_min'], d['hour']]]\n" +
"        pred = float(model.predict(x)[0])\n" +
"        return jsonify({'predicted_fare': round(pred, 2)})\n" +
"    except (KeyError, TypeError) as e:\n" +
"        return jsonify({'error': f'bad input: {e}'}), 400\n\n" +
"if __name__ == '__main__':\n" +
"    app.run(port=5000, debug=True)\n" +
"```\n" +
"```bash\n" +
"# terminal 1: python app.py\n" +
"# terminal 2:\n" +
"curl -X POST localhost:5000/predict -H 'Content-Type: application/json' \\\n" +
"     -d '{\"distance\":5,\"duration_min\":15,\"hour\":12}'\n" +
"# {\"predicted_fare\": 17.93}\n" +
"```\n" +
"That JSON response is your model serving its first real HTTP prediction. The malformed-input guard returns a clean 400 instead of crashing."
      ),
      S([
        { prompt: "The model should be loaded ONCE at app startup, not inside the predict function on every request.", answer: true, whenRight: "Right — load at startup (module level). Loading per request would re-read the file every call: slow and wasteful.", whenWrong: "Load once at startup. Putting joblib.load inside predict() re-loads on every request — needless I/O on each call.", sim: "model = joblib.load(...)  # module level, once\n\n@app.route('/predict')\ndef predict(): model.predict(...)" },
        { prompt: "`request.get_json()` parses the incoming JSON body into a Python dict.", answer: true, whenRight: "Right — it turns the raw request body into a dict you can index, e.g. d['distance'].", whenWrong: "get_json() parses the JSON request body into a dict. Then you read d['distance'], d['hour'], etc." },
        { prompt: "Wrapping prediction in try/except and returning a 400 on bad input is over-engineering for an API.", answer: false, whenRight: "Right — it's essential. Real clients send malformed requests; graceful 400s beat 500 crashes.", whenWrong: "Input validation is core to a professional API. A missing key shouldn't crash the server — return a clear 400." }
      ]),
      E("Your turn — Flask app","[CODE] 1. Create `app.py` that loads fare_model.pkl and exposes POST /predict.\n2. Parse JSON for distance, duration_min, hour; return predicted_fare as JSON.\n3. Add a try/except returning a 400 with an error message on bad input.\n4. Run locally and test with curl. Confirm you get a fare back, and that bad input returns a clean error.")
    ]),
    D(4,"Add a /health endpoint","The endpoint every production service needs.",[
      L("Health checks and why every service has one",
"## What it is\n" +
"A **health-check endpoint** is a trivial route that returns 200 OK to prove the service is alive:\n\n" +
"```python\n" +
"@app.route('/health')\n" +
"def health():\n" +
"    return jsonify({'status': 'ok'})\n" +
"```\n\n" +
"## Why every production service needs one\n" +
"Hosting platforms (Render, AWS, Kubernetes) **continuously ping** your health endpoint. If it stops returning 200, the platform knows your service is down and can restart it, stop sending it traffic, or alert you. Without a health check, the platform can't tell a hung server from a healthy one.\n\n" +
"It's also your own first diagnostic: when something breaks, you `curl /health` first. If health is fine but `/predict` errors, the problem is in your model logic, not the server. If health itself is down, the whole app failed to start. That split-second triage saves real debugging time.\n\n" +
"## The convention\n" +
"Keep it dependency-free — health should NOT load the model or hit a database. It answers one question: 'is the process running and able to respond?' Anything heavier defeats the purpose.\n\n" +
"## Where this fits\n" +
"Today you add `/health` to `app.py`. Render (Day 6) will use it to confirm your deploy succeeded."
      ),
      L("See it in code (with output)",
"## Add health and test both endpoints\n" +
"```python\n" +
"@app.route('/health')\n" +
"def health():\n" +
"    return jsonify({'status': 'ok'})\n" +
"```\n" +
"```bash\n" +
"curl localhost:5000/health\n" +
"# {\"status\": \"ok\"}\n\n" +
"# Triage logic:\n" +
"#   /health 200 + /predict 500  -> bug in model code\n" +
"#   /health down                -> app failed to start\n" +
"```\n" +
"A two-line endpoint, but it's the difference between a platform that can self-heal your service and one that's flying blind."
      ),
      S([
        { prompt: "Hosting platforms ping a /health endpoint to know whether your service is alive and should receive traffic.", answer: true, whenRight: "Right — if health stops returning 200, the platform can restart the service or stop routing to it.", whenWrong: "Platforms poll /health continuously. A non-200 tells them the service is unhealthy — restart or reroute.", sim: "Render -> GET /health every 30s\n200 -> healthy | non-200 -> restart" },
        { prompt: "A health endpoint should load the model and run a full prediction to be thorough.", answer: false, whenRight: "Right — keep it dependency-free. Health answers 'is the process up?' — not 'does prediction work?'. Heavy checks defeat the purpose.", whenWrong: "Health should stay light: no model load, no DB. It just confirms the process can respond. Keep it instant.", sim: "@app.route('/health')\ndef health(): return {'status':'ok'}  # nothing heavy" },
        { prompt: "If /health returns 200 but /predict returns 500, the problem is likely in your prediction logic, not the server itself.", answer: true, whenRight: "Right — health up means the server runs; the 500 isolates the fault to /predict's code. Fast triage.", whenWrong: "That split is the diagnostic value: server's alive (health ok), so the 500 points at your predict logic specifically." }
      ]),
      E("Your turn — health check","[CODE] 1. Add a GET /health route to app.py returning {'status':'ok'} with a 200.\n2. Test with `curl localhost:5000/health`.\n3. Markdown note in API.md: explain how you'd use /health vs /predict to triage a future outage.")
    ]),
    D(5,"Requirements + gunicorn","Make it reproducible and production-runnable.",[
      L("requirements.txt and the gunicorn production server",
"## What it is\n" +
"Two things stand between 'runs on my machine' and 'runs on a server':\n\n" +
"**1. requirements.txt** — the exact list of packages your app needs, so the server can recreate your environment:\n" +
"```bash\n" +
"pip freeze | grep -iE 'flask|xgboost|scikit|joblib|gunicorn' > requirements.txt\n" +
"```\n\n" +
"**2. gunicorn** — a production-grade web server. Flask's built-in `app.run()` is a *development* server: single-threaded, not built for real traffic, and it literally warns you not to use it in production. **Gunicorn** runs your app with multiple worker processes that handle concurrent requests:\n" +
"```bash\n" +
"gunicorn app:app --bind 0.0.0.0:5000\n" +
"```\n\n" +
"## Why this matters\n" +
"- **requirements.txt** is reproducibility: without it, the server has no idea which packages (or versions) to install, and 'works on my machine' becomes 'broken on the server.'\n" +
"- **gunicorn** is capacity: the dev server handles one request at a time; gunicorn workers handle many. Real users arrive concurrently.\n\n" +
"`app:app` means 'in the file app.py, use the variable named app.' That's the entry point Render will run.\n\n" +
"## Where this fits\n" +
"Today you freeze your dependencies and run your app under gunicorn locally — exactly how Render will run it in production."
      ),
      L("See it in code (with output)",
"## Freeze deps, run under gunicorn\n" +
"```bash\n" +
"pip install gunicorn\n" +
"pip freeze | grep -iE 'flask|xgboost|scikit|joblib|gunicorn' > requirements.txt\n" +
"cat requirements.txt\n" +
"# flask==3.0.0\n" +
"# gunicorn==21.2.0\n" +
"# joblib==1.3.2\n" +
"# scikit-learn==1.4.0\n" +
"# xgboost==2.0.3\n\n" +
"gunicorn app:app --bind 0.0.0.0:5000\n" +
"# [INFO] Starting gunicorn 21.2.0\n" +
"# [INFO] Booting worker with pid: 12841\n\n" +
"curl localhost:5000/health\n" +
"# {\"status\": \"ok\"}   <- same app, production server\n" +
"```\n" +
"Same endpoints, but now served by a multi-worker production server with a pinned dependency list — the deploy-ready state."
      ),
      S([
        { prompt: "Flask's built-in app.run() server is fine for handling real production traffic.", answer: false, whenRight: "Right — it's a DEV server (single-threaded) and even warns against production use. Use gunicorn for real traffic.", whenWrong: "app.run() is for development only — it says so itself. Production needs gunicorn (multiple workers, concurrency).", sim: "dev:  python app.py  (1 request at a time)\nprod: gunicorn app:app (many workers)" },
        { prompt: "requirements.txt lets the server recreate your exact Python environment, avoiding 'works on my machine'.", answer: true, whenRight: "Right — it pins the packages (and versions) so the server installs exactly what you used.", whenWrong: "That's its job: a reproducible dependency list. Without it the server can't know which packages to install.", sim: "pip freeze > requirements.txt\n# server: pip install -r requirements.txt" },
        { prompt: "In `gunicorn app:app`, the second `app` refers to the Flask variable inside app.py.", answer: true, whenRight: "Right — module:variable. 'app.py file, app variable'. That's gunicorn's entry point.", whenWrong: "It's module:variable — the file app.py and the Flask object named app inside it.", sim: "gunicorn app:app\n#         ^file ^variable" }
      ]),
      E("Your turn — gunicorn","[CODE] 1. `pip install gunicorn`.\n2. Freeze your deps to requirements.txt (flask, xgboost, scikit-learn, joblib, gunicorn).\n3. Run `gunicorn app:app --bind 0.0.0.0:5000`.\n4. curl /health to confirm it works under gunicorn. This is exactly how Render will run it.")
    ]),
    D(6,"Deploy on Render","Push to a public URL the world can call.",[
      RD("Render — free web service hosting","https://render.com","Click 'Open'. Sign up (free tier). You'll connect your GitHub repo and Render builds + hosts it."),
      L("Deploying a Flask API to Render",
"## What it is\n" +
"**Render** is a platform-as-a-service: connect a GitHub repo, tell it how to build and start your app, and it gives you a public HTTPS URL. No servers to manage.\n\n" +
"The flow:\n" +
"1. Push `app.py`, `fare_model.pkl`, and `requirements.txt` to a new repo `taxipulse-api`\n" +
"2. Render → New Web Service → connect the repo\n" +
"3. **Build command**: `pip install -r requirements.txt`\n" +
"4. **Start command**: `gunicorn app:app`\n" +
"5. Deploy → Render builds, starts gunicorn, and hands you a public URL\n\n" +
"## Why commit the model file here\n" +
"Earlier you gitignored data and state files. But `fare_model.pkl` (a few MB) is a **deploy artifact** the server genuinely needs — the API can't run without it. Small model files are committed; huge ones would go to object storage and be downloaded at startup. Knowing which files are artifacts vs noise is part of the craft.\n\n" +
"## Why it matters\n" +
"This is the moment the project becomes real: a URL you can text to anyone, that responds from a server you don't own, scaling without your laptop. 'It's live at taxipulse-api.onrender.com' is a sentence that changes how recruiters read your resume.\n\n" +
"## Where this fits\n" +
"Today you deploy and test the live endpoint with curl. The free tier may cold-start (first request after idle takes ~30s) — that's expected."
      ),
      L("See it in code (with output)",
"## Test the live endpoint\n" +
"```bash\n" +
"# After Render shows 'Live', test the public URL:\n" +
"curl -X POST https://taxipulse-api.onrender.com/predict \\\n" +
"     -H 'Content-Type: application/json' \\\n" +
"     -d '{\"distance\":5,\"duration_min\":15,\"hour\":12}'\n" +
"# {\"predicted_fare\": 17.93}\n\n" +
"curl https://taxipulse-api.onrender.com/health\n" +
"# {\"status\": \"ok\"}\n" +
"```\n" +
"That response came from a server in a data centre, not your laptop. Anyone, anywhere, can now call your model. (First call after idle may take ~30s on the free tier — the cold start.)"
      ),
      S([
        { prompt: "fare_model.pkl should be committed to the API repo because the deployed server needs it to run.", answer: true, whenRight: "Right — it's a deploy artifact the app can't run without. Small model files belong in the repo; huge ones go to object storage.", whenWrong: "The API loads fare_model.pkl at startup, so the server needs it. A few-MB model file is committed (unlike data/state).", sim: "repo: app.py + fare_model.pkl + requirements.txt\n# all needed to run" },
        { prompt: "On Render, the start command for a gunicorn-served Flask app is `gunicorn app:app`.", answer: true, whenRight: "Right — same command you tested locally. Render runs it to boot your service.", whenWrong: "That's the start command: gunicorn app:app. Build command installs requirements; start command boots the server." },
        { prompt: "A ~30 second delay on the first request after the service was idle means your deployment is broken.", answer: false, whenRight: "Right — that's a free-tier cold start. The service spun down when idle and takes a moment to wake. Normal.", whenWrong: "That's a cold start: free tiers sleep when idle and take ~30s to wake on the next request. Expected, not broken." }
      ]),
      E("Your turn — deploy","[PRODUCE] 1. Push app.py, fare_model.pkl, requirements.txt to a new public repo `taxipulse-api`.\n2. On Render: New Web Service → connect repo → build `pip install -r requirements.txt`, start `gunicorn app:app`.\n3. Deploy. Test the live URL with curl POST /predict and GET /health.\n4. Confirm both respond correctly from the public URL.")
    ]),
    D(7,"Ship TaxiPulse v0.4","Document the API and tag the release.",[
      L("Documenting and tagging a deployed API",
"## What it is\n" +
"v0.4 ships when the API is live, documented, and tagged. The README of `taxipulse-api` must let a stranger call your endpoint without reading your code:\n\n" +
"```text\n" +
"# TaxiPulse Fare API\n" +
"Predict NYC taxi fares from distance, duration, and pickup hour.\n\n" +
"## Live endpoint\n" +
"POST https://taxipulse-api.onrender.com/predict\n\n" +
"## Request\n" +
"{\"distance\": 5, \"duration_min\": 15, \"hour\": 12}\n\n" +
"## Response\n" +
"{\"predicted_fare\": 17.93}\n\n" +
"## Try it\n" +
"curl -X POST https://taxipulse-api.onrender.com/predict \\\n" +
"  -H 'Content-Type: application/json' \\\n" +
"  -d '{\"distance\":5,\"duration_min\":15,\"hour\":12}'\n" +
"```\n\n" +
"## Why API docs matter most of all\n" +
"An undocumented API is unusable — no one can guess your JSON shape. A README with a copy-pasteable curl example is the difference between 'here's a URL' and 'here's a product anyone can use in 10 seconds.' For an API, the docs ARE the interface.\n\n" +
"## Where this fits\n" +
"Today you write the API README with a runnable curl example, then tag v0.4. TaxiPulse now has a live, documented, callable model — the centrepiece of the project."
      ),
      S([
        { prompt: "An API README should include a copy-pasteable curl example showing the exact request and response.", answer: true, whenRight: "Right — for an API, the docs are the interface. A runnable example lets anyone use it in seconds.", whenWrong: "A curl example is the most useful thing in API docs — it shows the exact contract and works on first paste." },
        { prompt: "Tagging v0.4 marks the milestone where TaxiPulse gained a live, deployed model endpoint.", answer: true, whenRight: "Right — v0.1 described, v0.3 modelled, v0.4 deployed. The tag records the deployment milestone.", whenWrong: "The tag pins the deployment milestone. The repo history now shows analysis -> model -> live API." },
        { prompt: "Documentation matters less for an API than for a notebook, since APIs are 'self-explanatory'.", answer: false, whenRight: "Right — the opposite. An API is invisible without docs; no one can guess your JSON shape. Docs ARE the interface.", whenWrong: "APIs need docs MORE — there's no code to read, just a URL. Without the request/response spec, it's unusable." }
      ]),
      E("Your turn — ship v0.4","[PRODUCE] 1. Write the `taxipulse-api` README with the live URL, request/response shapes, and a runnable curl example.\n2. Commit + tag:\n`git add . && git commit -m 'v0.4: fare API deployed on Render'`\n`git tag v0.4 && git push && git push --tags`\n\nPASS:\n[x] Flask API works locally\n[x] Live Render URL responds to POST /predict\n[x] /health returns 200\n[x] README documents the API with a curl example\n[x] v0.4 tag pushed")
    ])
  ]
};

/* ════ WEEK 8 — Web scraping toolkit ════ */
const W8 = {
  number: 8, title: "Web scraping toolkit",
  phase: "NLP Prep", commitment_hours: "12-18",
  context: ds.weeks[7].context,
  concept_check: [
    { q: "Before scraping any website, what should you check first?",
      choices: ["The page's font size","robots.txt and the site's terms of service — what they permit you to access","The server's IP address","Whether the site uses HTTPS"],
      correct: 1, explain: "Ethical (and often legal) scraping starts with the site's robots.txt and terms of service. They define what you may access and how. Ignoring them risks getting blocked, banned, or worse — and it's simply the responsible default." },
    { q: "What does BeautifulSoup do with the HTML a request returns?",
      choices: ["Renders it like a browser","Parses it into a navigable tree so you can select elements by tag, class, or CSS selector","Executes its JavaScript","Screenshots the page"],
      correct: 1, explain: "BeautifulSoup parses raw HTML text into a tree structure. You then query it with .select() (CSS selectors) or .find() to extract the specific elements — titles, links, prices — you care about." },
    { q: "Why add time.sleep(1) between scraping requests?",
      choices: ["To make the code more readable","To rate-limit yourself — hammering a server with rapid requests is rude and gets you blocked","Python requires it","To save memory"],
      correct: 1, explain: "A polite scraper paces its requests so it doesn't overload the server or look like an attack. A short delay between pages is basic courtesy and the single most effective way to avoid being rate-limited or IP-banned." }
  ],
  days: [
    D(1,"Ethics + robots.txt","The rules before the code — scrape responsibly or not at all.",[
      RD("Hacker News (your scrape target)","https://news.ycombinator.com","Click 'Open'. A simple, scrape-friendly news site — your practice target this week."),
      L("The ethics and law of web scraping",
"## What it is\n" +
"**Web scraping** is extracting data from websites programmatically — fetching a page's HTML and pulling out the structured bits (titles, prices, links). It's the bridge for when the data you need exists only on a web page that nobody has packaged for you.\n\n" +
"## The rules come first\n" +
"Before a single line of code, you check two things:\n" +
"- **robots.txt** (e.g. `news.ycombinator.com/robots.txt`) — the site's machine-readable statement of which paths bots may access\n" +
"- **Terms of Service** — the legal layer; some sites explicitly forbid scraping\n\n" +
"And you follow the etiquette:\n" +
"- **Rate-limit** yourself (a delay between requests) so you don't hammer the server\n" +
"- **Identify** your scraper with a clear User-Agent string\n" +
"- **Take only what you need**, and prefer an official API if one exists\n\n" +
"## Why it matters\n" +
"Scraping sits in a genuine ethical and legal grey zone. Aggressive scraping can overload a small site (effectively a denial-of-service), violate terms, or get your IP banned. Respecting robots.txt and rate-limiting isn't just politeness — it's what separates a professional gathering data from a bot abusing a server. Getting this wrong can have real consequences.\n\n" +
"## Where this fits\n" +
"This week you build a scraper toolkit on Hacker News — a simple, scrape-friendly site — starting today by reading its robots.txt and writing down the rules you'll follow."
      ),
      V("Web scraping ethics and robots.txt","https://www.youtube.com/watch?v=8wYvDGFej3I",10,"John Watson Rooney","What robots.txt means, and how to scrape without being a problem."),
      L("Reading a robots.txt",
"## How to read it\n" +
"```text\n" +
"# news.ycombinator.com/robots.txt\n" +
"User-agent: *          # applies to all bots\n" +
"Disallow: /reply        # don't scrape reply pages\n" +
"Disallow: /vote\n" +
"Crawl-delay: 30         # wait 30s between requests\n" +
"```\n\n" +
"- **User-agent: \\*** — the rules apply to every bot\n" +
"- **Disallow: /path** — do not fetch these paths\n" +
"- **Crawl-delay** — minimum seconds between requests (respect it)\n\n" +
"Paths NOT disallowed are fair game (within the ToS). The front page and `/news?p=N` listing pages are allowed — which is exactly what you'll scrape.\n\n" +
"## The mindset\n" +
"robots.txt is a request, not a hard wall — but ignoring it is how you end up blocked or worse. Treat it as the site owner telling you their boundaries, and honour them."
      ),
      S([
        { prompt: "You should read a site's robots.txt and terms of service before writing any scraping code.", answer: true, whenRight: "Right — they define what's permitted. Checking first is the ethical (and often legal) default.", whenWrong: "robots.txt + ToS come first. They tell you what you may access and how. Skipping that step is how you get banned.", sim: "1. read news.ycombinator.com/robots.txt\n2. THEN write the scraper" },
        { prompt: "A Crawl-delay of 30 in robots.txt means you should wait ~30 seconds between requests.", answer: true, whenRight: "Right — it's the site asking you to pace your bot. Respecting it keeps you from overloading them.", whenWrong: "Crawl-delay: 30 = at least 30s between fetches. It's the server's pacing request — honour it.", sim: "Crawl-delay: 30\n# time.sleep(30) between requests" },
        { prompt: "Aggressive, rapid scraping with no delay is harmless as long as you get the data.", answer: false, whenRight: "Right — it can overload a small server (effectively a DoS), violate ToS, and get you IP-banned. Pace yourself.", whenWrong: "Hammering a server can take it down, breach the ToS, and get you blocked. Rate-limiting is non-negotiable etiquette." }
      ]),
      E("Your turn — read the rules","[WRITE] In `SCRAPING.md`:\n1. Visit news.ycombinator.com/robots.txt. Note any Disallow paths and Crawl-delay.\n2. Write 3 rules you'll follow this week (rate-limit, User-Agent, only-allowed-paths).\n3. One sentence: why does ignoring robots.txt risk real consequences?")
    ]),
    D(2,"BeautifulSoup basics","Parse HTML into a tree you can query.",[
      L("requests + BeautifulSoup — fetch and parse",
"## What it is\n" +
"Scraping is two steps: **fetch** the page (requests), then **parse** the HTML (BeautifulSoup).\n\n" +
"```python\n" +
"import requests\n" +
"from bs4 import BeautifulSoup\n\n" +
"headers = {'User-Agent': 'forge-learning scraper'}\n" +
"r = requests.get('https://news.ycombinator.com', headers=headers)\n" +
"soup = BeautifulSoup(r.text, 'html.parser')\n\n" +
"for row in soup.select('tr.athing'):\n" +
"    title = row.select_one('.titleline a')\n" +
"    print(title.text)\n" +
"```\n\n" +
"## The key methods\n" +
"- **`.select('css selector')`** — find ALL matching elements (returns a list)\n" +
"- **`.select_one('css selector')`** — find the FIRST match\n" +
"- **`.text`** — the visible text inside an element\n" +
"- **`.get('href')`** — an attribute's value (a link's URL)\n\n" +
"## Why CSS selectors\n" +
"You already know CSS selectors from HTML/CSS: `tr.athing` = `<tr>` with class `athing`; `.titleline a` = an `<a>` inside an element with class `titleline`. Reusing that knowledge is what makes BeautifulSoup quick to learn. The skill is reading a page's structure (via browser DevTools) to find the right selectors.\n\n" +
"## Set a User-Agent\n" +
"Identify your scraper with a clear User-Agent header. It's honest, and some servers reject requests that don't send one.\n\n" +
"## Where this fits\n" +
"Today you fetch the HN front page and print every story title — your first successful scrape."
      ),
      V("BeautifulSoup tutorial for beginners","https://www.youtube.com/watch?v=ng2o98k983k",18,"Corey Schafer","Fetch, parse, and extract — the full BeautifulSoup workflow."),
      L("See it in code (with output)",
"## Scrape HN front-page titles\n" +
"```python\n" +
"import requests\n" +
"from bs4 import BeautifulSoup\n\n" +
"headers = {'User-Agent': 'forge-learning scraper'}\n" +
"r = requests.get('https://news.ycombinator.com', headers=headers)\n" +
"print('Status:', r.status_code)   # 200 = success\n\n" +
"soup = BeautifulSoup(r.text, 'html.parser')\n" +
"rows = soup.select('tr.athing')\n" +
"print('Stories found:', len(rows))   # 30\n\n" +
"for row in rows[:3]:\n" +
"    title = row.select_one('.titleline a')\n" +
"    print(title.text, '->', title.get('href'))\n" +
"# A new compiler for... -> https://example.com/...\n" +
"# Show HN: I built... -> https://github.com/...\n" +
"```\n" +
"`r.status_code == 200` confirms the fetch worked; `.select('tr.athing')` finds all 30 story rows; `.text` and `.get('href')` pull the title and link from each."
      ),
      S([
        { prompt: "`.select()` returns ALL matching elements, while `.select_one()` returns just the first.", answer: true, whenRight: "Right — select for a list (all stories), select_one for a single element (one title within a row).", whenWrong: "select = all matches (a list); select_one = the first match. Use select for rows, select_one inside each row.", sim: "rows = soup.select('tr.athing')   # 30 rows\ntitle = row.select_one('.titleline a')  # 1" },
        { prompt: "BeautifulSoup CSS selectors reuse the same syntax you already know from HTML/CSS.", answer: true, whenRight: "Right — tr.athing, .titleline a, #id all work exactly as in CSS. That's why it's fast to pick up.", whenWrong: "They're the same CSS selectors: tag.class, .class descendant, #id. Your HTML/CSS knowledge transfers directly." },
        { prompt: "A status code of 200 from requests.get means the page failed to load.", answer: false, whenRight: "Right — 200 means SUCCESS. 404 = not found, 403 = forbidden, 500 = server error. Always check it's 200 first.", whenWrong: "200 = OK/success. It's 4xx and 5xx codes that signal failure. Check for 200 before parsing.", sim: "r.status_code == 200  # success\n# 403/429 -> blocked, 404 -> missing" }
      ]),
      E("Your turn — first scrape","[CODE] 1. `pip install requests beautifulsoup4`.\n2. Create `scraper.py`: fetch news.ycombinator.com with a User-Agent header.\n3. Check r.status_code == 200.\n4. Use soup.select('tr.athing') and print every story title and its URL.")
    ]),
    D(3,"Scrape multiple pages to CSV","Loop pages, rate-limit, and persist the data.",[
      L("Pagination, rate-limiting, and saving to CSV",
"## What it is\n" +
"One page is a demo; a dataset needs many. HN paginates with `?p=N`, so you loop, **sleeping between requests** to stay polite, and write the results to CSV:\n\n" +
"```python\n" +
"import csv, time, requests\n" +
"from bs4 import BeautifulSoup\n\n" +
"headers = {'User-Agent': 'forge-learning scraper'}\n" +
"data = []\n" +
"for page in range(1, 6):\n" +
"    url = f'https://news.ycombinator.com/news?p={page}'\n" +
"    soup = BeautifulSoup(requests.get(url, headers=headers).text, 'html.parser')\n" +
"    for row in soup.select('tr.athing'):\n" +
"        a = row.select_one('.titleline a')\n" +
"        data.append({'title': a.text, 'url': a.get('href')})\n" +
"    time.sleep(1)          # <-- rate limit: be polite\n\n" +
"with open('hn.csv', 'w', newline='', encoding='utf-8') as f:\n" +
"    w = csv.DictWriter(f, fieldnames=['title', 'url'])\n" +
"    w.writeheader(); w.writerows(data)\n" +
"```\n\n" +
"## The three habits\n" +
"1. **time.sleep(1)** between pages — the single most important politeness rule\n" +
"2. **encoding='utf-8'** — titles contain emoji, accents, symbols; utf-8 prevents crashes\n" +
"3. **Accumulate then write once** — collect all rows, write the CSV at the end\n\n" +
"## Why it matters\n" +
"Five pages of HN is ~150 stories — a real dataset you can analyse. The rate-limit is what keeps you a welcome guest rather than a blocked one. This loop-sleep-save pattern is the backbone of every scraper you'll ever write.\n\n" +
"## Where this fits\n" +
"Today you scrape 5 pages of HN into `hn.csv`, rate-limited and utf-8 safe."
      ),
      L("See it in code (with output)",
"## Scrape 5 pages, save, verify\n" +
"```python\n" +
"# ... (the loop above) ...\n" +
"print('Total stories:', len(data))\n" +
"# Total stories: 150\n\n" +
"import pandas as pd\n" +
"print(pd.read_csv('hn.csv').head(3))\n" +
"#                                    title                      url\n" +
"# 0   A new compiler for...          https://...\n" +
"# 1   Show HN: I built...            https://github.com/...\n" +
"# 2   Ask HN: How do you...          item?id=...\n" +
"```\n" +
"150 rows from 5 paced requests. The CSV is now a real dataset — and because you slept between pages, HN never noticed."
      ),
      S([
        { prompt: "time.sleep(1) between page requests is the single most important politeness rule when scraping multiple pages.", answer: true, whenRight: "Right — pacing prevents you from hammering the server and is what keeps you from being rate-limited or banned.", whenWrong: "Sleeping between requests is the core courtesy. Without it you flood the server and get blocked fast.", sim: "for page in range(1,6):\n  scrape(page)\n  time.sleep(1)  # be polite" },
        { prompt: "Opening the CSV with encoding='utf-8' matters because titles can contain emoji and accented characters.", answer: true, whenRight: "Right — without utf-8, a single emoji in a title can crash the write. It's the safe default for scraped text.", whenWrong: "Scraped titles have emoji/accents. utf-8 encoding handles them; the default can crash on non-ASCII characters.", sim: "open('hn.csv','w',encoding='utf-8')\n# handles 🔥, café, ™, etc." },
        { prompt: "It's more efficient to open and write the CSV file fresh inside the loop on every single row.", answer: false, whenRight: "Right — that's wasteful. Accumulate rows in a list, then write the file once at the end.", whenWrong: "Re-opening the file each row is slow and error-prone. Collect into a list, write once after the loop." }
      ]),
      E("Your turn — scrape to CSV","[CODE] In `scraper.py`:\n1. Loop pages 1-5 of news.ycombinator.com/news?p=N.\n2. Extract title + url from each story row.\n3. time.sleep(1) between pages.\n4. Save all rows to hn.csv with encoding='utf-8'.\n5. Load it back with pandas and confirm ~150 rows.")
    ]),
    D(4,"When BeautifulSoup fails — JS-rendered sites","Some pages build their content in the browser. (Optional.)",[
      L("Static vs dynamic HTML, and the Selenium escape hatch",
"## What it is\n" +
"BeautifulSoup only sees the HTML the server **sends**. But many modern sites send a near-empty shell and build the content with **JavaScript in the browser**. Scrape those with requests + BS4 and you get... almost nothing — the data isn't in the HTML yet.\n\n" +
"## The tell\n" +
"You fetch a page, `soup.select(...)` returns an empty list, but the data is clearly visible in your browser. That mismatch means the content is **JavaScript-rendered**. The HTML you got is the skeleton; the browser fills it in by running JS.\n\n" +
"## The fix: a real browser\n" +
"**Selenium** drives an actual (headless) browser — it loads the page, runs the JavaScript, *then* hands you the fully-rendered HTML:\n\n" +
"```python\n" +
"from selenium import webdriver\n" +
"from selenium.webdriver.chrome.options import Options\n" +
"opt = Options(); opt.add_argument('--headless')\n" +
"driver = webdriver.Chrome(options=opt)\n" +
"driver.get('https://quotes.toscrape.com/js/')\n" +
"html = driver.page_source   # now includes JS-rendered content\n" +
"driver.quit()\n" +
"```\n\n" +
"## The trade-off\n" +
"Selenium is powerful but heavy — it launches a whole browser, so it's much slower than requests. **Always try requests + BS4 first**; reach for Selenium only when the content is genuinely JS-rendered. Using a browser when a simple GET would do is a common beginner over-reach.\n\n" +
"## Where this fits\n" +
"Today (optional) you run a Selenium hello-world on a deliberately JS-rendered demo page to see the difference. If short on time, skip — HN doesn't need it."
      ),
      V("Selenium vs BeautifulSoup — when to use which","https://www.youtube.com/watch?v=Xjv1sY630Uc",10,"John Watson Rooney","How to tell JS-rendered sites apart and when Selenium is worth the weight."),
      S([
        { prompt: "If soup.select() returns nothing but the data is visible in your browser, the content is likely JavaScript-rendered.", answer: true, whenRight: "Right — BS4 sees only the server's HTML. If JS builds the content, the raw HTML is empty where the data should be.", whenWrong: "That mismatch is the classic JS-rendered tell: the browser runs JS to add content BS4 never receives.", sim: "soup.select('.price')  # []\nbrowser shows prices    # JS-rendered" },
        { prompt: "Selenium is slower than requests + BeautifulSoup because it launches a real browser.", answer: true, whenRight: "Right — it runs a whole browser to execute JS. Use it only when you must; requests is far lighter.", whenWrong: "Selenium drives a full browser, so it's much heavier/slower. Prefer requests+BS4; use Selenium only for JS sites.", sim: "requests: fetch text (fast)\nSelenium: launch browser, run JS (slow)" },
        { prompt: "You should always use Selenium instead of requests, since it handles every kind of site.", answer: false, whenRight: "Right — over-reach. Try requests + BS4 first; only escalate to Selenium when content is genuinely JS-rendered.", whenWrong: "Defaulting to Selenium is wasteful. Most pages work with a simple GET. Reach for the browser only when needed." }
      ]),
      E("Your turn — Selenium hello world (optional)","[CODE] (OPTIONAL — skip if short on time.)\n1. `pip install selenium webdriver-manager`.\n2. Launch a headless Chrome, driver.get('https://quotes.toscrape.com/js/').\n3. Print the first 500 chars of driver.page_source — note the JS-rendered quotes are present.\n4. driver.quit(). Markdown: why would requests+BS4 have returned nothing here?")
    ]),
    D(5,"Scrapy for scale","A framework for serious crawls. (Optional.)",[
      L("Scrapy — the production scraping framework",
"## What it is\n" +
"requests + BS4 is perfect for small scrapes. For **large, ongoing crawls** — thousands of pages, multiple sites, scheduled runs — there's **Scrapy**, a full framework that handles concurrency, retries, rate-limiting, and data export for you.\n\n" +
"```python\n" +
"import scrapy\n" +
"class HNSpider(scrapy.Spider):\n" +
"    name = 'hn'\n" +
"    start_urls = ['https://news.ycombinator.com']\n" +
"    def parse(self, response):\n" +
"        for row in response.css('tr.athing'):\n" +
"            yield {'title': row.css('.titleline a::text').get()}\n" +
"```\n" +
"```bash\n" +
"scrapy crawl hn -o hn.jsonl\n" +
"```\n\n" +
"## What Scrapy gives you for free\n" +
"- **Concurrency** — fetches many pages in parallel (with built-in throttling)\n" +
"- **Retries** — automatically retries failed requests\n" +
"- **Export** — `-o hn.jsonl` writes structured output with no CSV code\n" +
"- **Politeness** — configurable auto-throttle and per-domain delays\n\n" +
"## The trade-off\n" +
"Scrapy has a steeper learning curve and more structure (spiders, pipelines, settings). For 5 pages, requests+BS4 wins on simplicity. For 50,000 pages across daily runs, Scrapy's machinery earns its keep. Matching the tool to the scale is the judgment.\n\n" +
"## Where this fits\n" +
"Today (optional) you rewrite the HN scrape as a Scrapy spider to feel the difference. Skip if short on time — the BS4 version is your deliverable."
      ),
      S([
        { prompt: "Scrapy handles concurrency, retries, and rate-limiting for you, which matters for large crawls.", answer: true, whenRight: "Right — that built-in machinery is why Scrapy wins at scale over hand-rolled requests loops.", whenWrong: "Scrapy provides concurrency, auto-retry, throttling, and export out of the box — the things you'd hand-code with requests.", sim: "scrapy crawl hn -o hn.jsonl\n# parallel + retries + export, free" },
        { prompt: "For scraping just 5 pages, requests + BeautifulSoup is simpler than setting up a Scrapy project.", answer: true, whenRight: "Right — match tool to scale. Scrapy's structure pays off at thousands of pages, not five.", whenWrong: "For tiny scrapes, requests+BS4 is less overhead. Scrapy's spiders/pipelines shine only at large scale.", sim: "5 pages:    requests + BS4\n50k pages:  Scrapy" },
        { prompt: "`scrapy crawl hn -o hn.jsonl` requires you to write your own CSV/JSON-writing code.", answer: false, whenRight: "Right — the opposite. The -o flag exports structured output automatically; no file-writing code needed.", whenWrong: "Scrapy's -o flag handles export for you. No manual file writing — it serialises each yielded item." }
      ]),
      E("Your turn — Scrapy spider (optional)","[CODE] (OPTIONAL — skip if short on time.)\n1. `pip install scrapy`, then `scrapy startproject hn_spider`.\n2. Create a spider with start_urls = HN and a parse() that yields {title}.\n3. Run `scrapy crawl hn -o hn.jsonl`.\n4. Markdown: name two things Scrapy did for you that you'd have hand-coded with requests.")
    ]),
    D(6,"Sentiment-tag your scrape","A preview of Project 2 — label your scraped titles.",[
      L("Pretrained models — sentiment in three lines",
"## What it is\n" +
"You've collected ~150 HN titles. Now: what's the *mood* of each? A **pretrained model** lets you answer that without training anything — someone already trained a sentiment classifier on millions of examples, and Hugging Face's `pipeline` makes it a three-liner:\n\n" +
"```python\n" +
"from transformers import pipeline\n" +
"clf = pipeline('sentiment-analysis')\n" +
"clf('This new compiler is incredibly fast')\n" +
"# [{'label': 'POSITIVE', 'score': 0.9994}]\n" +
"```\n\n" +
"## Why this is a preview\n" +
"This is your first taste of **NLP** (natural language processing) and Project 2 (Reddit Sentiment). The same `pipeline('sentiment-analysis')` you use here is what you'll use — and then critically evaluate — next week. Today is the easy, magical version; next week you'll discover where these generic models get it wrong on domain-specific text.\n\n" +
"## The catch to notice now\n" +
"This model was trained on movie reviews (SST-2). HN titles are technical. Watch for mislabels: 'this paper is fire' is positive in tech but the model may not know that. Noticing these failures *today* sets up exactly why you'll hand-label a gold set next week. Pretrained models are a fast start, not a final answer.\n\n" +
"## Where this fits\n" +
"Today you sentiment-tag a sample of your HN titles and eyeball the results — spotting both the wins and the misfires."
      ),
      L("See it in code (with output)",
"## Tag scraped titles\n" +
"```python\n" +
"from transformers import pipeline\n" +
"import pandas as pd\n\n" +
"df = pd.read_csv('hn.csv')\n" +
"clf = pipeline('sentiment-analysis')\n" +
"results = clf(df['title'].tolist()[:50])\n\n" +
"for title, r in list(zip(df['title'], results))[:5]:\n" +
"    print(f\"{r['label']} ({r['score']:.2f})  {title}\")\n" +
"# POSITIVE (0.99)  Show HN: A faster build tool\n" +
"# NEGATIVE (0.96)  Why our migration failed\n" +
"# POSITIVE (0.55)  Ask HN: thoughts on Rust?   <- low confidence, ambiguous\n" +
"# NEGATIVE (0.88)  This paper is fire          <- WRONG: 'fire' = good in tech!\n" +
"```\n" +
"The model nails clear cases but misreads 'this paper is fire' — a domain-specific positive it learned as negative. That single error is the whole motivation for next week's hand-labelling."
      ),
      S([
        { prompt: "A pretrained sentiment pipeline lets you label text without training your own model first.", answer: true, whenRight: "Right — the model was already trained on millions of examples; pipeline() just loads and runs it.", whenWrong: "That's the appeal of pretrained models: instant labels, zero training. pipeline('sentiment-analysis') is three lines.", sim: "clf = pipeline('sentiment-analysis')\nclf('great work')  # POSITIVE 0.99" },
        { prompt: "A model trained on movie reviews may mislabel domain-specific text like 'this paper is fire'.", answer: true, whenRight: "Right — 'fire' is positive in tech slang but the movie-review model never learned that. Domain mismatch = errors.", whenWrong: "Generic models miss domain slang. 'Fire' = great in tech, but an SST-2 movie model may read it as negative.", sim: "'this paper is fire'\nmovie-model: NEGATIVE (wrong)\ntech reality: POSITIVE" },
        { prompt: "A pretrained model's labels are always correct, so there's no need to check them against your own data.", answer: false, whenRight: "Right — never assume. Generic models err on domain-specific text; verifying against a hand-labelled set is essential (next week).", whenWrong: "Pretrained ≠ infallible. They misread domain language. Always validate on your own data — which is exactly next week's work." }
      ]),
      E("Your turn — sentiment-tag","[CODE] 1. `pip install transformers torch`.\n2. Load hn.csv, run pipeline('sentiment-analysis') on the first 50 titles.\n3. Print label + score for the first 10.\n4. Markdown: find at least one title you think the model labelled WRONG, and explain why (domain-specific language).")
    ]),
    D(7,"Ship the hn-scraper repo","A documented scraper with its ethics rules on display.",[
      L("Packaging a scraper as a portfolio repo",
"## What it is\n" +
"Your `hn-scraper` repo is a portfolio artifact that proves three things at once: you can extract data from the web, you do it **ethically**, and you can turn raw HTML into a clean dataset. The README must make all three visible:\n\n" +
"```text\n" +
"# HN Scraper\n" +
"Scrapes Hacker News front pages into a clean CSV, with sentiment tags.\n\n" +
"## Ethics\n" +
"- Respects robots.txt (checked before building)\n" +
"- Rate-limited: 1s between requests\n" +
"- Identifies via a clear User-Agent\n\n" +
"## Run\n" +
"pip install -r requirements.txt\n" +
"python scraper.py   # -> hn.csv\n" +
"```\n\n" +
"## Why the ethics section matters\n" +
"Most scraping projects on GitHub show the code but not the conscience. Leading your README with the ethics rules signals maturity — it tells a reviewer you understand scraping is a responsibility, not just a technique. That judgment is itself a hireable trait.\n\n" +
"## Why this repo earns its place\n" +
"It demonstrates a distinct, valuable skill (data acquisition) separate from your analysis projects. And the sentiment tags are a deliberate bridge to Project 2, showing you think in project arcs, not isolated exercises.\n\n" +
"## Where this fits\n" +
"Today you push `hn-scraper` with the BS4 scraper, the sentiment-tagged sample, and a README that leads with ethics."
      ),
      S([
        { prompt: "Leading the scraper README with its ethics rules (robots.txt, rate-limiting) signals professional maturity.", answer: true, whenRight: "Right — it shows you treat scraping as a responsibility. That judgment is a hireable trait, not just decoration.", whenWrong: "Most repos skip the ethics. Leading with it tells a reviewer you understand the responsibility — a real signal." },
        { prompt: "A scraper repo demonstrates a distinct skill (data acquisition) separate from your analysis projects.", answer: true, whenRight: "Right — it broadens your portfolio: you can GET data, not just analyse data someone handed you.", whenWrong: "Scraping shows you can acquire data others can't. It's a separate, valuable skill from the analysis projects." },
        { prompt: "The README only needs the run command; documenting how the scraper respects robots.txt is unnecessary clutter.", answer: false, whenRight: "Right — the ethics section is the point. Omitting it makes the project look careless, regardless of code quality.", whenWrong: "The ethics documentation IS valuable content here. It distinguishes a responsible scraper from a reckless one." }
      ]),
      E("Your turn — ship hn-scraper","[PRODUCE] 1. Create a public repo `hn-scraper`.\n2. Include scraper.py, hn.csv (or a sample), requirements.txt, and a README that LEADS with the ethics rules.\n3. Push.\n\nPASS:\n[x] BS4 scraper pulls 5 pages of HN\n[x] Saves to hn.csv with rate-limiting (time.sleep)\n[x] Sentiment-tagged sample of titles\n[x] README documents the ethics rules\n[x] Repo pushed\n\nOptional bonus:\n[ ] Selenium hello-world\n[ ] Scrapy version with jsonl output")
    ])
  ]
};

/* ════ WEEK 9 — TaxiPulse v0.5: Streamlit explorer ════ */
const W9 = {
  number: 9, title: "TaxiPulse v0.5: Streamlit explorer",
  phase: "Foundations", commitment_hours: "12-18",
  context: ds.weeks[8].context,
  concept_check: [
    { q: "What does Streamlit let you build, and for whom?",
      choices: ["A faster Jupyter notebook for yourself","An interactive web app a non-technical person can use without seeing your code","A replacement for your Flask API","A database for your data"],
      correct: 1, explain: "Streamlit turns a Python script into an interactive web app — sliders, dropdowns, charts — that anyone can use in a browser. A notebook is for you; a Streamlit app is for everyone else." },
    { q: "How does a Streamlit app respond to a user moving a slider?",
      choices: ["It updates only that one widget","It re-runs the whole script top-to-bottom with the new value","It calls a callback function only","It queries a database"],
      correct: 1, explain: "Streamlit's model is simple: any widget interaction re-runs your entire script from the top, with the widget returning its new value. This 'rerun on interaction' model is why Streamlit code reads like a linear script, not an event-callback tangle." },
    { q: "Why load your model with @st.cache_resource in a Streamlit app?",
      choices: ["It makes predictions more accurate","Without caching, the model would reload from disk on every single rerun — slow","Streamlit requires it","It encrypts the model"],
      correct: 1, explain: "Since every interaction reruns the whole script, an uncached joblib.load would re-read the model file on every slider move. @st.cache_resource loads it once and reuses it across reruns, keeping the app fast." }
  ],
  days: [
    D(1,"Plan the explorer","Design before you build — what will users actually do?",[
      RD("Streamlit gallery (inspiration)","https://streamlit.io/gallery","Click 'Open'. Browse real Streamlit apps to see what's possible and steal layout ideas."),
      L("From notebook to app — designing the explorer",
"## What it is\n" +
"A notebook is for you; a **dashboard is for everyone else**. Your TaxiPulse work has lived in Jupyter for eight weeks — invisible to anyone who can't open a notebook. **Streamlit** changes that: it turns a Python script into an interactive web app a non-technical person can use in a browser.\n\n" +
"## Plan before you code\n" +
"A good app starts with a sketch of what the user *does*, not what code you'll write. For the TaxiPulse explorer:\n" +
"- **Inputs** (what the user controls): borough, pickup hour, trip distance, duration\n" +
"- **Outputs** (what the app shows): a predicted fare (from your Week 5 model) + a relevant chart (the Q4 trend)\n" +
"- **The one job**: 'let anyone estimate a NYC taxi fare and see the data behind it'\n\n" +
"## Why planning matters\n" +
"Apps sprawl. Without a clear single job, you bolt on widgets until it's a confusing wall of controls. Deciding the inputs, outputs, and the *one thing* the app is for — before writing code — keeps it focused and usable. The best dashboards do one thing clearly, not ten things vaguely.\n\n" +
"## Why Streamlit\n" +
"It's genuinely magical the first time: you write a Python script with `st.slider(...)` and `st.write(...)`, run one command, and a real web app opens in your browser. No HTML, CSS, or JavaScript required.\n\n" +
"## Where this fits\n" +
"Today you sketch the explorer's inputs, outputs, and one-sentence purpose. The rest of the week builds it."
      ),
      L("Sketching the layout",
"## A simple wireframe\n" +
"```text\n" +
"+--------------------------------------------------+\n" +
"|  TaxiPulse NYC Explorer                           |\n" +
"+----------------+---------------------------------+\n" +
"|  SIDEBAR       |   MAIN PANEL                     |\n" +
"|                |                                  |\n" +
"|  Borough  [v]  |   Predicted fare:  $18.42        |\n" +
"|  Hour    [==]  |                                  |\n" +
"|  Distance[==]  |   [ Q4 daily trend chart ]       |\n" +
"|  Duration[==]  |                                  |\n" +
"+----------------+---------------------------------+\n" +
"```\n\n" +
"## The pattern\n" +
"**Controls on the left (sidebar), results on the right (main panel).** Users adjust inputs in the sidebar; the main panel updates. This is the standard, intuitive dashboard layout — it mirrors how people read (set up, then see result) and keeps controls from cluttering the output."
      ),
      S([
        { prompt: "A good dashboard does ONE thing clearly rather than ten things vaguely.", answer: true, whenRight: "Right — a single clear purpose keeps the app focused and usable. Feature sprawl is what makes dashboards confusing.", whenWrong: "Focus beats breadth. Decide the one job ('estimate a fare + show the data') and resist bolting on extra widgets." },
        { prompt: "Planning the inputs and outputs before coding helps prevent the app from sprawling into a confusing mess.", answer: true, whenRight: "Right — deciding what the user controls and sees, upfront, keeps the build focused.", whenWrong: "Up-front planning of inputs/outputs is what keeps the app coherent. Coding first leads to a pile of random widgets." },
        { prompt: "The standard dashboard layout puts the output charts in a sidebar and the controls in the main panel.", answer: false, whenRight: "Right — it's the reverse: CONTROLS in the sidebar, OUTPUTS in the main panel. Set up on the left, see results on the right.", whenWrong: "It's the other way around: controls go in the sidebar, results in the main panel. That's the intuitive convention." }
      ]),
      E("Your turn — plan the explorer","[WRITE] In `PLAN.md`:\n1. List the inputs (what the user controls) and outputs (what the app shows).\n2. Write the app's one-sentence purpose.\n3. Sketch a rough wireframe (sidebar controls, main-panel results).")
    ]),
    D(2,"Set up Streamlit","Your first running web app in three lines.",[
      L("Streamlit basics and the rerun model",
"## What it is\n" +
"Streamlit turns a script into an app. Install, write, run:\n\n" +
"```python\n" +
"# explorer.py\n" +
"import streamlit as st\n" +
"st.title('TaxiPulse NYC Explorer')\n" +
"st.write('Q4 2023 yellow taxi data + fare prediction')\n" +
"```\n" +
"```bash\n" +
"pip install streamlit\n" +
"streamlit run explorer.py   # opens localhost:8501\n" +
"```\n\n" +
"## The core mental model: rerun on interaction\n" +
"This is the one thing to internalise about Streamlit: **every time a user interacts with any widget, your entire script re-runs from top to bottom.** A slider doesn't fire a callback — it just returns its current value, and the whole script executes again with that new value.\n\n" +
"```text\n" +
"user moves slider -> whole script reruns -> new value flows through -> UI updates\n" +
"```\n\n" +
"## Why this design is brilliant (and a trap)\n" +
"**Brilliant**: your code reads like a normal top-to-bottom script. No event handlers, no callback spaghetti. `hour = st.slider(...)` just gives you the current hour; use it like any variable.\n\n" +
"**The trap**: anything expensive (loading a model, reading a big file) also re-runs every interaction unless you cache it. That's tomorrow's lesson — for now, just internalise that interaction = full rerun.\n\n" +
"## Where this fits\n" +
"Today you install Streamlit, write a three-line app, and see it live at localhost:8501."
      ),
      L("See it in code (with output)",
"## Hello, Streamlit\n" +
"```python\n" +
"import streamlit as st\n\n" +
"st.title('TaxiPulse NYC Explorer')\n" +
"st.write('Q4 2023 yellow taxi data + fare prediction')\n\n" +
"# Prove the rerun model to yourself:\n" +
"n = st.slider('Move me', 0, 100, 50)\n" +
"st.write(f'The whole script just reran. Slider = {n}')\n" +
"```\n" +
"```bash\n" +
"streamlit run explorer.py\n" +
"# Local URL: http://localhost:8501\n" +
"```\n" +
"Drag the slider and watch the text update — that's the entire script re-executing each time, with the slider handing you its new value."
      ),
      S([
        { prompt: "In Streamlit, moving a slider re-runs the entire script from top to bottom.", answer: true, whenRight: "Right — interaction = full rerun. The widget just returns its current value into your linear script.", whenWrong: "That's Streamlit's core model: any interaction reruns the whole script. The slider returns its value; the script re-executes.", sim: "move slider -> rerun script -> new value\nno callbacks, just top-to-bottom" },
        { prompt: "Streamlit requires you to write HTML, CSS, and JavaScript to build the web UI.", answer: false, whenRight: "Right — none of that. You write pure Python (st.slider, st.write); Streamlit renders the web UI for you.", whenWrong: "Zero front-end code. st.slider/st.write are Python; Streamlit handles all the HTML/CSS/JS rendering.", sim: "st.slider('Hour', 0, 23)\n# Streamlit renders the web widget" },
        { prompt: "`st.slider('Hour', 0, 23, 14)` returns the slider's current value as a normal Python variable.", answer: true, whenRight: "Right — it just returns the value. Assign it (hour = st.slider(...)) and use it like any variable.", whenWrong: "It returns the current value. hour = st.slider(...) gives you an int you use normally — no callback needed." }
      ]),
      E("Your turn — set up Streamlit","[CODE] 1. `pip install streamlit`.\n2. Create explorer.py with a title and a one-line description.\n3. Add one st.slider and st.write its value, to feel the rerun model.\n4. Run `streamlit run explorer.py` and confirm it opens at localhost:8501.")
    ]),
    D(3,"Sidebar controls","Give users the inputs that drive the app.",[
      L("Widgets and the sidebar",
"## What it is\n" +
"Streamlit widgets collect user input. Put them in the **sidebar** (`st.sidebar`) to keep controls separate from results:\n\n" +
"```python\n" +
"borough  = st.sidebar.selectbox('Pickup borough',\n" +
"               ['Manhattan','Brooklyn','Queens','Bronx','Staten Island'])\n" +
"hour     = st.sidebar.slider('Pickup hour', 0, 23, 14)\n" +
"distance = st.sidebar.slider('Trip distance (mi)', 0.5, 50.0, 5.0)\n" +
"duration = st.sidebar.slider('Duration (min)', 1, 120, 18)\n" +
"```\n\n" +
"## The widget pattern\n" +
"Each widget call **returns the user's current selection** — `selectbox` returns the chosen string, `slider` returns the number. Because of the rerun model, these are always up-to-date: every interaction reruns the script, and each widget hands back its latest value. You just use them as variables.\n\n" +
"## The third slider argument is the default\n" +
"`st.slider('Pickup hour', 0, 23, 14)` -> min 0, max 23, **default 14**. Sensible defaults matter: the app should show something useful on first load, before the user touches anything.\n\n" +
"## Why the sidebar\n" +
"Separating inputs (sidebar) from outputs (main panel) is the layout users expect. It also keeps a growing set of controls from pushing your results off the screen.\n\n" +
"## Where this fits\n" +
"Today you add the four input widgets to the sidebar. Tomorrow they'll feed your prediction model."
      ),
      L("See it in code (with output)",
"## Sidebar controls wired up\n" +
"```python\n" +
"import streamlit as st\n\n" +
"st.title('TaxiPulse NYC Explorer')\n\n" +
"borough  = st.sidebar.selectbox('Pickup borough',\n" +
"               ['Manhattan','Brooklyn','Queens','Bronx','Staten Island'])\n" +
"hour     = st.sidebar.slider('Pickup hour', 0, 23, 14)\n" +
"distance = st.sidebar.slider('Trip distance (mi)', 0.5, 50.0, 5.0)\n" +
"duration = st.sidebar.slider('Duration (min)', 1, 120, 18)\n\n" +
"st.write(f'You selected: {borough}, hour {hour}, '\n" +
"         f'{distance} mi, {duration} min')\n" +
"# Updates live as you move any control\n" +
"```\n" +
"Four widgets, four variables. The main panel echoes your selection and updates instantly because each change reruns the script."
      ),
      S([
        { prompt: "A Streamlit widget like st.slider returns the user's current selection as a value you can use.", answer: true, whenRight: "Right — hour = st.slider(...) gives you the chosen number. Use it directly in the rest of the script.", whenWrong: "Each widget returns its current value. Assign it and use it like any variable — the rerun keeps it current.", sim: "hour = st.sidebar.slider('Hour', 0, 23, 14)\n# hour is now an int (14 by default)" },
        { prompt: "In st.slider('Hour', 0, 23, 14), the 14 is the default value shown on first load.", answer: true, whenRight: "Right — min 0, max 23, default 14. Sensible defaults make the app useful before any interaction.", whenWrong: "The third number is the default. Good defaults mean the app shows something meaningful on first load.", sim: "st.slider('Hour', 0, 23, 14)\n#                 min max default" },
        { prompt: "Putting controls in the sidebar and results in the main panel is just a cosmetic choice with no real benefit.", answer: false, whenRight: "Right — it's functional: it matches user expectations and stops controls from crowding out your results.", whenWrong: "It's a real usability gain: inputs left, outputs right is the expected pattern and keeps the layout clean as controls grow." }
      ]),
      E("Your turn — sidebar controls","[CODE] In explorer.py, add to the sidebar:\n1. A selectbox for borough (the 5 NYC boroughs).\n2. Sliders for pickup hour (0-23, default 14), distance (0.5-50, default 5), duration (1-120, default 18).\n3. Echo the selections in the main panel with st.write. Confirm it updates live.")
    ]),
    D(4,"Load model + predict","Wire the controls to your Week 5 model.",[
      L("Caching and live prediction",
"## What it is\n" +
"Now the controls drive a real prediction. Copy `fare_model.pkl` into the app folder, load it, and feed the widget values in:\n\n" +
"```python\n" +
"import streamlit as st, joblib\n\n" +
"@st.cache_resource\n" +
"def load_model():\n" +
"    return joblib.load('fare_model.pkl')\n\n" +
"model = load_model()\n" +
"\n" +
"# ... sidebar widgets give distance, duration, hour ...\n" +
"pred = model.predict([[distance, duration, hour]])[0]\n" +
"st.metric('Predicted fare', f'${pred:.2f}')\n" +
"```\n\n" +
"## Why @st.cache_resource is essential here\n" +
"Remember: every interaction reruns the whole script. Without caching, `joblib.load('fare_model.pkl')` would **re-read the model file from disk on every single slider move** — slow and wasteful. `@st.cache_resource` loads the model **once** and reuses that same object across all reruns. It's the fix for the 'rerun trap' from Day 2.\n\n" +
"## st.metric for the headline number\n" +
"`st.metric` displays a big, prominent value — perfect for the predicted fare, the app's main output. It's the visual focal point users' eyes land on.\n\n" +
"## Why it matters\n" +
"This is the moment the app becomes useful: a non-technical user moves sliders and sees a live fare estimate from your trained model — no notebook, no code, no Python. Your Week 5 model is now genuinely usable by anyone.\n\n" +
"## Where this fits\n" +
"Today you wire the sidebar values into the model and show the predicted fare with st.metric."
      ),
      L("See it in code (with output)",
"## Live fare prediction\n" +
"```python\n" +
"import streamlit as st, joblib\n\n" +
"@st.cache_resource\n" +
"def load_model():\n" +
"    return joblib.load('fare_model.pkl')\n\n" +
"model = load_model()\n" +
"st.title('TaxiPulse NYC Explorer')\n\n" +
"hour     = st.sidebar.slider('Pickup hour', 0, 23, 14)\n" +
"distance = st.sidebar.slider('Trip distance (mi)', 0.5, 50.0, 5.0)\n" +
"duration = st.sidebar.slider('Duration (min)', 1, 120, 18)\n\n" +
"pred = float(model.predict([[distance, duration, hour]])[0])\n" +
"st.metric('Predicted fare', f'${pred:.2f}')\n" +
"# A big '$17.93' that updates the instant any slider moves\n" +
"```\n" +
"Move a slider, watch the fare update live. The @st.cache_resource means the model loads once, not on every drag."
      ),
      S([
        { prompt: "@st.cache_resource loads the model once and reuses it across reruns, instead of re-reading the file every interaction.", answer: true, whenRight: "Right — it's the fix for the rerun trap. Without it, every slider move would reload the .pkl from disk.", whenWrong: "Caching loads the model a single time. Without it, the rerun model would re-load fare_model.pkl on every interaction.", sim: "@st.cache_resource\ndef load_model(): return joblib.load(...)\n# loaded once, reused" },
        { prompt: "Without caching, the model would reload from disk on every slider movement because of the rerun model.", answer: true, whenRight: "Right — that's exactly the trap. Interaction = full rerun = joblib.load runs again, unless cached.", whenWrong: "Yes — every interaction reruns the whole script, so an uncached joblib.load fires each time. Cache it to load once." },
        { prompt: "st.metric is the wrong choice for displaying the predicted fare; it's only for tables.", answer: false, whenRight: "Right — st.metric is built for exactly this: a single big headline number like the predicted fare.", whenWrong: "st.metric is perfect for the fare — it shows one prominent value. It's not for tables; it's for headline numbers." }
      ]),
      E("Your turn — load model + predict","[CODE] 1. Copy fare_model.pkl into the explorer folder.\n2. Load it with a @st.cache_resource function.\n3. Feed the sidebar's distance, duration, hour into model.predict.\n4. Show the result with st.metric('Predicted fare', ...). Confirm it updates live as you move sliders.")
    ]),
    D(5,"Add the Q4 trend chart","Show the data behind the prediction.",[
      L("Charts in Streamlit",
"## What it is\n" +
"A prediction is more trustworthy when users can see the data behind it. Streamlit renders charts from a DataFrame in one line:\n\n" +
"```python\n" +
"import pandas as pd\n\n" +
"@st.cache_data\n" +
"def load_trend():\n" +
"    df = pd.read_parquet('data/clean_q4.parquet')\n" +
"    return df.set_index('tpep_pickup_datetime').resample('D').size()\n\n" +
"st.subheader('Q4 2023 daily trips')\n" +
"st.line_chart(load_trend())\n" +
"```\n\n" +
"## @st.cache_data vs @st.cache_resource\n" +
"Two caches, two purposes:\n" +
"- **@st.cache_resource** — for *unserializable objects* shared across users: models, DB connections (Day 4)\n" +
"- **@st.cache_data** — for *data*: DataFrames, query results, computations. Use it for the loaded/aggregated taxi data\n\n" +
"Matching the right cache decorator to the right thing is a small but real Streamlit competency. Data that's expensive to load or compute gets @st.cache_data so it's computed once, not on every rerun.\n\n" +
"## Built-in charts\n" +
"`st.line_chart`, `st.bar_chart`, and `st.area_chart` take a DataFrame or Series and render instantly — no matplotlib needed for simple cases. For full control you can still pass a matplotlib figure to `st.pyplot`.\n\n" +
"## Where this fits\n" +
"Today you add the Q4 daily-trend chart (from Week 3) below the prediction, cached with @st.cache_data so the parquet loads once."
      ),
      L("See it in code (with output)",
"## Prediction + context chart\n" +
"```python\n" +
"import streamlit as st, pandas as pd\n\n" +
"@st.cache_data\n" +
"def load_trend():\n" +
"    df = pd.read_parquet('data/clean_q4.parquet')\n" +
"    return (df.set_index('tpep_pickup_datetime')\n" +
"              .resample('D').size().rename('trips'))\n\n" +
"# ... model + st.metric prediction above ...\n\n" +
"st.subheader('Q4 2023 daily trips')\n" +
"st.line_chart(load_trend())\n" +
"# A live line chart; load_trend() runs once thanks to @st.cache_data\n" +
"```\n" +
"Now the app shows both a prediction AND the real data context — a far more convincing tool than a lone number. The cache means the parquet is read just once, not on every slider move."
      ),
      S([
        { prompt: "@st.cache_data is for caching data (DataFrames, query results), while @st.cache_resource is for objects like models.", answer: true, whenRight: "Right — data vs resource. DataFrames -> cache_data; models/connections -> cache_resource.", whenWrong: "Two caches: cache_data for DataFrames/computations, cache_resource for models/DB connections. Match them correctly.", sim: "@st.cache_data       -> df, query results\n@st.cache_resource   -> model, db conn" },
        { prompt: "st.line_chart can render a pandas Series or DataFrame directly, without writing matplotlib code.", answer: true, whenRight: "Right — pass it a Series/DataFrame and it draws the chart. matplotlib only needed for full custom control.", whenWrong: "st.line_chart takes a Series/DataFrame and renders instantly. No matplotlib needed for simple charts.", sim: "st.line_chart(daily_trips)\n# one line, full chart" },
        { prompt: "Showing the data behind a prediction makes the app less trustworthy by cluttering it.", answer: false, whenRight: "Right — the opposite. Context (the trend chart) makes the prediction more credible, not less. Transparency builds trust.", whenWrong: "Showing the underlying data builds trust — users see the prediction isn't a black box. Context strengthens the tool." }
      ]),
      E("Your turn — add the chart","[CODE] In explorer.py:\n1. Write a @st.cache_data function that loads clean_q4.parquet and resamples to daily trip counts.\n2. Add st.subheader('Q4 2023 daily trips') and st.line_chart(...).\n3. Confirm the chart renders below your prediction and the data loads only once (cached).")
    ]),
    D(6,"Deploy to Streamlit Cloud","Put the app on a public URL.",[
      RD("Streamlit Community Cloud","https://share.streamlit.io","Click 'Open'. Free hosting for Streamlit apps straight from a GitHub repo."),
      L("Deploying to Streamlit Community Cloud",
"## What it is\n" +
"**Streamlit Community Cloud** hosts your app free, straight from a GitHub repo. The flow:\n" +
"1. Push `explorer.py`, `fare_model.pkl`, `requirements.txt`, and the data to a repo\n" +
"2. share.streamlit.io → New app → pick the repo and `explorer.py`\n" +
"3. Deploy → you get a public `https://...streamlit.app` URL\n\n" +
"## requirements.txt strikes again\n" +
"Just like the Flask deploy, the cloud needs your dependency list to rebuild the environment:\n" +
"```text\n" +
"streamlit\n" +
"pandas\n" +
"scikit-learn\n" +
"xgboost\n" +
"joblib\n" +
"pyarrow\n" +
"```\n" +
"Forgetting a package here is the #1 cause of a failed Streamlit deploy — the app builds, then crashes on an import. The fix is always: add the missing package to requirements.txt and redeploy.\n\n" +
"## Data size consideration\n" +
"The free tier has limited resources. If `clean_q4.parquet` is large, commit a smaller sampled version for the cloud app (the trend chart looks the same on a sample). Knowing to slim the data for deployment is a practical deploy skill.\n\n" +
"## Why it matters\n" +
"This is the payoff: a link you can put on your resume, text to anyone, where they interact with your model and data live — no install, no notebook. 'Try my taxi fare explorer at [url]' is a portfolio sentence that lands.\n\n" +
"## Where this fits\n" +
"Today you deploy the explorer and confirm it works at its public URL."
      ),
      L("See it in code (with output)",
"## requirements.txt for the deploy\n" +
"```text\n" +
"streamlit\n" +
"pandas\n" +
"scikit-learn\n" +
"xgboost\n" +
"joblib\n" +
"pyarrow\n" +
"```\n" +
"```text\n" +
"# After deploy, the app is live at:\n" +
"https://taxipulse-explorer.streamlit.app\n" +
"# Anyone can move the sliders and get a live fare estimate.\n" +
"```\n" +
"If the build logs show ModuleNotFoundError, a package is missing from requirements.txt — add it and redeploy. That single fix resolves most first-deploy failures."
      ),
      S([
        { prompt: "A missing package in requirements.txt is a common cause of a failed Streamlit Cloud deploy.", answer: true, whenRight: "Right — the app builds then crashes on the missing import. Add the package and redeploy.", whenWrong: "That's the #1 deploy failure: an import that isn't in requirements.txt. The fix is to add it and redeploy.", sim: "ModuleNotFoundError: xgboost\n# -> add 'xgboost' to requirements.txt" },
        { prompt: "For the free tier, committing a smaller sampled data file can help a data-heavy app deploy and run.", answer: true, whenRight: "Right — slimming the data fits the resource limits, and the trend chart looks the same on a sample.", whenWrong: "On limited free resources, a sampled dataset keeps the app within limits. The charts barely change on a good sample." },
        { prompt: "Streamlit Community Cloud requires you to manage your own server to host the app.", answer: false, whenRight: "Right — no. It hosts straight from your GitHub repo; you just point it at explorer.py. Zero server management.", whenWrong: "No servers to manage — it deploys from your repo automatically. You pick the repo and file; it handles hosting." }
      ]),
      E("Your turn — deploy","[PRODUCE] 1. Push explorer.py, fare_model.pkl, a (sampled) data file, and requirements.txt to a repo.\n2. On share.streamlit.io: New app → pick the repo and explorer.py → Deploy.\n3. If it crashes on an import, add the missing package to requirements.txt and redeploy.\n4. Confirm the app works at its public .streamlit.app URL.")
    ]),
    D(7,"Ship TaxiPulse v0.5","Document the explorer and tag the release.",[
      L("Closing v0.5 — a usable app on the resume",
"## What it is\n" +
"v0.5 ships when the explorer is live, documented, and tagged. The README now points to an interactive app, not just notebooks:\n\n" +
"```text\n" +
"## v0.5 — Interactive explorer\n" +
"Live app: https://taxipulse-explorer.streamlit.app\n" +
"Move the sliders to estimate a NYC taxi fare from distance,\n" +
"duration, and pickup hour, and see the Q4 2023 trip-volume trend.\n\n" +
"Built with Streamlit, served by the Week 5 XGBoost model.\n" +
"```\n\n" +
"## Why the live link is the headline\n" +
"A recruiter skims a README in seconds. A clickable 'try it live' link is the single most powerful thing it can contain — it turns a passive reader into someone *using* your work. The notebook proves you can analyse; the live app proves you can ship something people use. The second is rarer and more valuable.\n\n" +
"## The full TaxiPulse stack so far\n" +
"By v0.5, TaxiPulse spans analysis (notebooks), SQL, a validated finding, a deployed API (v0.4), and now an interactive app (v0.5) — a complete data product, not a single notebook. That breadth is exactly what makes it a portfolio centrepiece.\n\n" +
"## Where this fits\n" +
"Today you add the live link to the README, then tag v0.5. Next week (v1.0) is pure polish — no new features, just making all of this shine.\n\n" +
"## Where this fits in the arc\n" +
"v0.5 is the last feature week of Project 1. Everything is built; Week 10 makes it portfolio-grade."
      ),
      S([
        { prompt: "A clickable 'try it live' link is one of the most powerful things a portfolio README can contain.", answer: true, whenRight: "Right — it turns a passive reader into someone using your work. A live app beats a wall of code for impact.", whenWrong: "A live link is gold in a README — it lets a recruiter experience your work in one click instead of reading code." },
        { prompt: "By v0.5, TaxiPulse spans notebooks, SQL, a deployed API, and an interactive app — a full data product.", answer: true, whenRight: "Right — that breadth (analyse + query + deploy + app) is what makes it a portfolio centrepiece, not a one-off.", whenWrong: "v0.5 makes TaxiPulse a complete stack: analysis, SQL, validated finding, live API, interactive app. That range is the point." },
        { prompt: "Once the app is deployed, documenting it in the README is unnecessary since people can just click around.", answer: false, whenRight: "Right — the README still frames what the app does and why it matters, and routes people to the link in the first place.", whenWrong: "The README is what gets people TO the link and explains the project. A live app still needs its context documented." }
      ]),
      E("Your turn — ship v0.5","[PRODUCE] 1. Add a 'v0.5 — Interactive explorer' section to the TaxiPulse README with the live .streamlit.app link and a one-line description.\n2. Commit + tag:\n`git add . && git commit -m 'v0.5: Streamlit explorer'`\n`git tag v0.5 && git push && git push --tags`\n\nPASS:\n[x] Streamlit app runs locally\n[x] Sidebar controls drive a live model prediction\n[x] Q4 trend chart displayed (cached)\n[x] Deployed to a public Streamlit URL\n[x] README links the live app\n[x] v0.5 tag pushed")
    ])
  ]
};

// Validate and write
const newWeeks = [W6, W7, W8, W9];
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
ds.weeks.splice(5, 4, ...newWeeks);  // replace index 5,6,7,8 (W6,W7,W8,W9)
fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log('SUCCESS: W6-W9 written. Total weeks:', ds.weeks.length);
newWeeks.forEach(w =>
  console.log(`  W${w.number} "${w.title}": ${w.days.length} days, ${w.concept_check.length} concept_check Qs`)
);
