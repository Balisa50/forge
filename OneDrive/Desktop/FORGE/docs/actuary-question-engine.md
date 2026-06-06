# Actuary Question Engine

A difficulty-tiered, parameterized, non-repeating question generator for the
Actuary exam tracks. Lives in `src/lib/examQuestionGen.ts`; audited by
`scripts/audit-actuary.ts`.

## What it does

- **Four difficulty tiers per concept**: `easy → medium → hard → superhard`
  (mapped to the `MasteryQuestion.difficulty` enum `warmup/core/exam/stretch`).
  - *easy*: one formula, one step, no trap.
  - *medium*: two steps / combine two ideas.
  - *hard*: multi-step, integrates 3+ ideas, contains a classic trap.
  - *superhard*: exam-level-and-beyond. **Every sitting of ≥6 questions includes one.**
- **Infinite variety**: each concept registers multiple parameterized templates;
  every parameter is resampled per call, so the numbers and the correct answer
  change every attempt.
- **No repeats**: a per-concept ring buffer (last 220 stems) rejects any stem
  already seen; `genOne` retries up to 80× before giving up. Audited at 120
  attempts/concept with **zero repeats**.
- **Algorithmic distractors**: wrong answers are built from the real mistakes a
  candidate makes — forgetting to subtract one, using the with-replacement
  formula, dropping a binomial coefficient, confusing PV (`aₙ`) with AV (`sₙ`),
  reporting the joint instead of the posterior, off-by-one on a deferral exponent.
- **Per-student adaptive progression**: a passed sitting bumps the student's tier
  up; a fail bumps it down (persisted in `localStorage`). `generateForStudent`
  centres the sitting on that tier but always opens with a warm-up and ends on a
  super-hard. Wired into `MasteryQuiz` (`recordTierResult` on finish).

## Public API

```ts
hasGenerator(conceptId): boolean
tiersAvailable(conceptId): Tier[]
generateQuestions(conceptId, count): MasteryQuestion[]          // balanced ladder
generateForStudent(slug, conceptId, count): MasteryQuestion[]   // centred on student tier
generateByTier(conceptId, tier, count): MasteryQuestion[]       // targeted drill
currentTier(slug, conceptId): Tier
recordTierResult(slug, conceptId, passed): Tier
```

## Coverage (this milestone)

Fully tiered + audited (4 tiers each, zero repeats over 120 attempts):

- **Exam P** (8 concepts): sample-spaces-and-events, counting-and-axioms,
  conditional-probability, bayes-theorem, independence, expectation-and-variance,
  common-discrete-distributions, common-continuous-distributions.
- **Exam FM** (4 concepts): interest-and-accumulation, level-annuities,
  loan-amortization, bond-pricing.

Concepts without a generator fall back to their static `mastery.questions`, so
nothing regresses. Adding a concept is purely additive: register templates under
its id in `GENERATORS`.

### Verified super-hard examples (real exam reasoning)

- **Conditional**: "draw without replacement until first red" → expected draws
  `(R+B+1)/(R+1)` via the gaps argument; trap is the with-replacement `1/p`.
- **Expectation**: prize-halving die game → `2M/7` (both the win-probability and
  the prize decay geometrically, ratio `5/12`).
- **Bond pricing**: callable premium bond → yield-to-worst = **minimum** price
  across call/maturity dates.

## Honest status on the other exams

Only **Exam P** and **Exam FM** exist as exam-path content in the app
(`data/exam-paths/`). **IFM, LTAM, and STAM have no content files yet** — they
require full syllabus authoring (corporate finance/derivatives; life contingencies
& Markov chains; frequency/severity & risk theory). They were deliberately **not**
stubbed with thin or unverified math: a wrong super-hard question is worse than
none. The engine is ready for them — each new exam just registers tiered templates
under its concept ids, and `audit-actuary.ts` extends by adding the concept list.

## Audit

```
npx tsx scripts/audit-actuary.ts
```

Checks per concept: (1) 120 attempts → zero exact-stem repeats; (2) all four tiers
present; (3) a default 7-question sitting contains a super-hard; (4) every question
is structurally valid (5 choices, correct index in range). Stable across repeated
runs (5/5 PASS).
