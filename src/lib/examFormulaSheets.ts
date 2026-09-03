/**
 * Canonical formula sheets for the actuarial exam paths (Exam P + Exam FM).
 *
 * Authored to mirror the SOA syllabus reference set a candidate is expected to
 * have memorized, grouped the way you actually reach for them on the exam. The
 * `tex` field is RAW LaTeX (no $ delimiters) rendered by <Tex block>; using
 * String.raw keeps single backslashes readable. `note` is rich text and may
 * contain $inline$ math, **bold**, and `code`.
 *
 * Pure data + a slug lookup, server-safe. Surfaced at /learn/exam/[slug]/formulas
 * and linked from the exam landing page.
 */

const r = String.raw;

export interface FormulaItem {
  name: string;
  tex: string;
  note?: string;
}
export interface FormulaGroup {
  heading: string;
  blurb?: string;
  items: FormulaItem[];
}
export interface FormulaSheet {
  exam: string;
  title: string;
  intro: string;
  groups: FormulaGroup[];
}

/* ───────────────────────────── EXAM P ───────────────────────────── */
const EXAM_P: FormulaSheet = {
  exam: "P",
  title: "Exam P — Probability formula sheet",
  intro:
    "Everything the SOA expects in your head for Exam P, grouped by where you reach for it. Set identities first, then conditioning, counting, the moment toolkit, and every named distribution with its mean and variance.",
  groups: [
    {
      heading: "Set theory & axioms",
      blurb: "Every General-Probability question is a set question in disguise.",
      items: [
        { name: "Inclusion–exclusion (2 sets)", tex: r`P(A\cup B)=P(A)+P(B)-P(A\cap B)` },
        { name: "Inclusion–exclusion (3 sets)", tex: r`P(A\cup B\cup C)=\sum P(A)-\sum P(A\cap B)+P(A\cap B\cap C)` },
        { name: "Complement", tex: r`P(A^{c})=1-P(A)` },
        { name: "De Morgan", tex: r`(A\cup B)^{c}=A^{c}\cap B^{c}\qquad (A\cap B)^{c}=A^{c}\cup B^{c}` },
        { name: "Difference (only A)", tex: r`P(A\cap B^{c})=P(A)-P(A\cap B)` },
        { name: "Exactly one of two", tex: r`P(A)+P(B)-2P(A\cap B)` },
        { name: "Exactly one of three", tex: r`S-2P+3T`, note: "with $S=\\sum$ singles, $P=\\sum$ full pairwise overlaps, $T=$ triple. Exactly two $=P-3T$." },
      ],
    },
    {
      heading: "Conditional probability & independence",
      items: [
        { name: "Conditional", tex: r`P(A\mid B)=\frac{P(A\cap B)}{P(B)}` },
        { name: "Multiplication rule", tex: r`P(A\cap B)=P(A\mid B)\,P(B)` },
        { name: "Law of total probability", tex: r`P(A)=\sum_{i} P(A\mid B_{i})\,P(B_{i})` },
        { name: "Bayes' theorem", tex: r`P(B_{k}\mid A)=\frac{P(A\mid B_{k})P(B_{k})}{\sum_{i}P(A\mid B_{i})P(B_{i})}` },
        { name: "Independence", tex: r`P(A\cap B)=P(A)P(B)\;\Longleftrightarrow\;P(A\mid B)=P(A)` },
      ],
    },
    {
      heading: "Combinatorics",
      items: [
        { name: "Permutations", tex: r`{}_{n}P_{k}=\frac{n!}{(n-k)!}` },
        { name: "Combinations", tex: r`\binom{n}{k}=\frac{n!}{k!\,(n-k)!}` },
        { name: "Multinomial", tex: r`\binom{n}{n_{1},\dots,n_{r}}=\frac{n!}{n_{1}!\,n_{2}!\cdots n_{r}!}` },
        { name: "Binomial theorem", tex: r`(x+y)^{n}=\sum_{k=0}^{n}\binom{n}{k}x^{k}y^{n-k}` },
      ],
    },
    {
      heading: "Random variables — general",
      items: [
        { name: "Expectation (discrete / continuous)", tex: r`E[X]=\sum_{x}x\,p(x)=\int_{-\infty}^{\infty}x\,f(x)\,dx` },
        { name: "LOTUS", tex: r`E[g(X)]=\sum g(x)p(x)=\int g(x)f(x)\,dx` },
        { name: "Variance", tex: r`\operatorname{Var}(X)=E[X^{2}]-(E[X])^{2}` },
        { name: "Linear transform", tex: r`E[aX+b]=aE[X]+b,\quad \operatorname{Var}(aX+b)=a^{2}\operatorname{Var}(X)` },
        { name: "CDF & density", tex: r`F(x)=P(X\le x),\qquad f(x)=F'(x)` },
        { name: "Survival / tail mean", tex: r`S(x)=1-F(x),\qquad E[X]=\int_{0}^{\infty}S(x)\,dx\ (X\ge 0)` },
        { name: "Percentile", tex: r`F(\pi_{p})=p`, note: "the $100p$-th percentile $\\pi_p$ solves $F(\\pi_p)=p$; median is $p=0.5$." },
      ],
    },
    {
      heading: "Joint & multivariate",
      items: [
        { name: "Covariance", tex: r`\operatorname{Cov}(X,Y)=E[XY]-E[X]E[Y]` },
        { name: "Correlation", tex: r`\rho_{XY}=\frac{\operatorname{Cov}(X,Y)}{\sigma_{X}\sigma_{Y}}\in[-1,1]` },
        { name: "Variance of a sum", tex: r`\operatorname{Var}(aX+bY)=a^{2}\sigma_{X}^{2}+b^{2}\sigma_{Y}^{2}+2ab\operatorname{Cov}(X,Y)` },
        { name: "Marginal density", tex: r`f_{X}(x)=\int f(x,y)\,dy` },
        { name: "Conditional density", tex: r`f_{Y\mid X}(y\mid x)=\frac{f(x,y)}{f_{X}(x)}` },
        { name: "Double expectation", tex: r`E[X]=E\big[E[X\mid Y]\big]` },
        { name: "Law of total variance", tex: r`\operatorname{Var}(X)=E\big[\operatorname{Var}(X\mid Y)\big]+\operatorname{Var}\big(E[X\mid Y]\big)` },
      ],
    },
    {
      heading: "Moment generating functions",
      items: [
        { name: "Definition", tex: r`M_{X}(t)=E[e^{tX}]` },
        { name: "Moments", tex: r`E[X^{n}]=M_{X}^{(n)}(0)` },
        { name: "Independent sum", tex: r`M_{X+Y}(t)=M_{X}(t)\,M_{Y}(t)` },
        { name: "Linear transform", tex: r`M_{aX+b}(t)=e^{bt}M_{X}(at)` },
      ],
    },
    {
      heading: "Discrete distributions",
      blurb: "pmf, then mean and variance.",
      items: [
        { name: "Bernoulli(p)", tex: r`p(1)=p;\quad E=p,\ \operatorname{Var}=p(1-p)` },
        { name: "Binomial(n,p)", tex: r`\binom{n}{k}p^{k}(1-p)^{n-k};\quad E=np,\ \operatorname{Var}=np(1-p)` },
        { name: "Geometric(p) — # trials", tex: r`(1-p)^{k-1}p;\quad E=\tfrac{1}{p},\ \operatorname{Var}=\tfrac{1-p}{p^{2}}`, note: "memoryless. Some texts count failures before the first success; then $E=\\tfrac{1-p}{p}$." },
        { name: "Negative binomial(r,p)", tex: r`\binom{k-1}{r-1}p^{r}(1-p)^{k-r};\quad E=\tfrac{r}{p},\ \operatorname{Var}=\tfrac{r(1-p)}{p^{2}}` },
        { name: "Poisson(λ)", tex: r`\frac{e^{-\lambda}\lambda^{k}}{k!};\quad E=\operatorname{Var}=\lambda` },
        { name: "Hypergeometric(N,K,n)", tex: r`\frac{\binom{K}{k}\binom{N-K}{n-k}}{\binom{N}{n}};\quad E=\tfrac{nK}{N}` },
        { name: "Discrete uniform on 1..n", tex: r`E=\tfrac{n+1}{2},\ \operatorname{Var}=\tfrac{n^{2}-1}{12}` },
      ],
    },
    {
      heading: "Continuous distributions",
      items: [
        { name: "Uniform(a,b)", tex: r`f=\tfrac{1}{b-a};\quad E=\tfrac{a+b}{2},\ \operatorname{Var}=\tfrac{(b-a)^{2}}{12}` },
        { name: "Exponential(λ)", tex: r`f=\lambda e^{-\lambda x};\quad E=\tfrac1\lambda,\ \operatorname{Var}=\tfrac1{\lambda^{2}}`, note: "memoryless: $P(X>s+t\\mid X>s)=P(X>t)$." },
        { name: "Gamma(α,θ)", tex: r`E=\alpha\theta,\ \operatorname{Var}=\alpha\theta^{2}`, note: "sum of $\\alpha$ iid Exponential($1/\\theta$) when $\\alpha$ integer." },
        { name: "Normal(μ,σ²)", tex: r`f=\frac{1}{\sigma\sqrt{2\pi}}e^{-(x-\mu)^{2}/2\sigma^{2}};\quad Z=\frac{X-\mu}{\sigma}` },
        { name: "Beta(a,b)", tex: r`E=\frac{a}{a+b}` },
        { name: "Lognormal", tex: r`\ln X\sim N(\mu,\sigma^{2})\Rightarrow E[X]=e^{\mu+\sigma^{2}/2}` },
      ],
    },
    {
      heading: "Sums & approximation",
      items: [
        { name: "Central limit theorem", tex: r`\bar X\ \dot\sim\ N\!\left(\mu,\tfrac{\sigma^{2}}{n}\right),\qquad \textstyle\sum X_i\ \dot\sim\ N(n\mu,\,n\sigma^{2})` },
        { name: "Continuity correction", tex: r`P(X\le k)\approx P\!\left(Z\le \tfrac{k+0.5-\mu}{\sigma}\right)`, note: "when approximating a discrete (e.g. Binomial) by the Normal." },
        { name: "Closure under addition", tex: r`\sum \text{Poisson}(\lambda_i)=\text{Poisson}\!\big(\textstyle\sum\lambda_i\big);\quad \sum \text{Normal}=\text{Normal}` },
      ],
    },
  ],
};

/* ───────────────────────────── EXAM FM ───────────────────────────── */
const EXAM_FM: FormulaSheet = {
  exam: "FM",
  title: "Exam FM — Financial Mathematics formula sheet",
  intro:
    "The interest-theory toolkit, from one accumulation factor up through annuities, loans, bonds, and the immunization/term-structure ideas. Draw the cash-flow timeline, then pick the matching line below.",
  groups: [
    {
      heading: "Interest measurement",
      items: [
        { name: "Accumulation / amount", tex: r`A(t)=A(0)\,a(t),\qquad i=\frac{a(1)-a(0)}{a(0)}` },
        { name: "Discount factor", tex: r`v=\frac{1}{1+i},\qquad d=iv=1-v=\frac{i}{1+i}` },
        { name: "Nominal rates", tex: r`\left(1+\tfrac{i^{(m)}}{m}\right)^{m}=1+i=\left(1-\tfrac{d^{(m)}}{m}\right)^{-m}` },
        { name: "Force of interest", tex: r`\delta=\ln(1+i),\qquad a(t)=e^{\int_{0}^{t}\delta_{s}\,ds}` },
      ],
    },
    {
      heading: "Annuities",
      blurb: "Level payments of 1 per period at rate i.",
      items: [
        { name: "PV immediate", tex: r`a_{\overline{n}|}=\frac{1-v^{n}}{i}` },
        { name: "PV due", tex: r`\ddot a_{\overline{n}|}=\frac{1-v^{n}}{d}=(1+i)\,a_{\overline{n}|}` },
        { name: "AV immediate / due", tex: r`s_{\overline{n}|}=\frac{(1+i)^{n}-1}{i},\qquad \ddot s_{\overline{n}|}=(1+i)\,s_{\overline{n}|}` },
        { name: "Perpetuity", tex: r`a_{\overline{\infty}|}=\frac{1}{i},\qquad \ddot a_{\overline{\infty}|}=\frac{1}{d}` },
        { name: "Increasing / decreasing", tex: r`(Ia)_{\overline{n}|}=\frac{\ddot a_{\overline{n}|}-n v^{n}}{i},\qquad (Da)_{\overline{n}|}=\frac{n-a_{\overline{n}|}}{i}` },
        { name: "Geometric (growth g)", tex: r`PV=\frac{1-\left(\frac{1+g}{1+i}\right)^{n}}{i-g}`, note: "first payment 1 at $t=1$, growing by $g$; for $i=g$ the PV is $\\tfrac{n}{1+i}$." },
      ],
    },
    {
      heading: "Loans",
      items: [
        { name: "Outstanding balance (prospective)", tex: r`B_{t}=R\,a_{\overline{n-t}|}`, note: "PV of the remaining payments $R$." },
        { name: "Outstanding balance (retrospective)", tex: r`B_{t}=L(1+i)^{t}-R\,s_{\overline{t}|}` },
        { name: "Interest / principal split", tex: r`I_{t}=i\,B_{t-1},\qquad P_{t}=R-I_{t}` },
        { name: "Sinking fund", tex: r`R = L\!\cdot\! i \;+\; \frac{L}{s_{\overline{n}|}^{\,j}}`, note: "service interest at $i$ to the lender; replace principal via a fund earning $j$." },
      ],
    },
    {
      heading: "Bonds",
      items: [
        { name: "Price (basic)", tex: r`P=Fr\,a_{\overline{n}|}+C v^{n}`, note: "$F$ face, $r$ coupon rate, $C$ redemption, $i$ yield." },
        { name: "Premium / discount", tex: r`P-C=(Fr-Ci)\,a_{\overline{n}|}` },
        { name: "Book value & write-up", tex: r`B_{t}=Fr\,a_{\overline{n-t}|}+Cv^{n-t}` },
        { name: "Callable", tex: r`\text{premium bond} \Rightarrow \text{price at the EARLIEST call; discount} \Rightarrow \text{LATEST.}`, note: "price to the worst case for the investor (yield-to-worst)." },
      ],
    },
    {
      heading: "Yield, term structure & immunization",
      items: [
        { name: "NPV / IRR", tex: r`NPV=\sum_{t}CF_{t}\,v^{t},\qquad IRR:\ \ NPV=0` },
        { name: "Dollar- vs time-weighted", tex: r`i_{DW}\ \text{(money-weighted, solves the equation of value)};\quad 1+i_{TW}=\prod(1+i_{k})` },
        { name: "Spot & forward", tex: r`(1+f_{[t,t+1]})=\frac{(1+s_{t+1})^{t+1}}{(1+s_{t})^{t}}` },
        { name: "Macaulay / modified duration", tex: r`D_{Mac}=\frac{\sum t\,v^{t}CF_{t}}{\sum v^{t}CF_{t}},\qquad D_{mod}=\frac{D_{Mac}}{1+i}` },
        { name: "Redington immunization", tex: r`PV_{A}=PV_{L},\quad D_{A}=D_{L},\quad C_{A}>C_{L}`, note: "match present value and duration; assets more convex than liabilities." },
      ],
    },
  ],
};

const SHEETS: Record<string, FormulaSheet> = {
  "exam-p": EXAM_P,
  "exam-fm": EXAM_FM,
};

export function loadFormulaSheet(slug: string): FormulaSheet | null {
  return SHEETS[slug] ?? null;
}
