# v2 Rewrite — Handoff doc

Read this FIRST in any session that picks up the v2 rewrite. The voice has
already drifted twice in this project; this doc exists to stop that.

## What's done

| Track | Done | Remaining |
|---|---|---|
| data-science | W1–W43 ✅ | — |
| data-analysis | W1–W28 ✅ | — |
| ai-engineering | W1–W24 ✅ | — |
| ml-engineering | W1–W24 ✅ | — |
| full-stack-web | W1–W24 ✅ | — |
| mobile-engineering | W1–W24 ✅ | — |
| devops-cloud | W1–W24 ✅ | — |
| cybersecurity | W1–W24 ✅ | — |
| bi-analytics | W1–W17 ✅ | — |
| ai-automation | W1–W20 ✅ | — |

**ALL TRACKS COMPLETE** — every week across all 10 tracks has all 7 fields written:
`context`, `pre_flight`, `mastery_questions`, `common_mistakes`, `debug_help`, `ai_assist`, `stretch`.

Each "done" week has v2-bar content in six fields: `context`, `pre_flight`,
`mastery_questions`, `common_mistakes`, `debug_help`, `ai_assist`, `stretch`.

## Priority order

1. **DS W18–W43** (active DS mentee consuming weekly)
2. **DA W1–W28** (two active DA mentees — yes including W1; the existing W1 is v1, below the bar)
3. **AI-eng + ML-eng** (no live mentees but next-most-likely to be picked)
4. The other six tracks

## The voice — non-negotiable

Read `scripts/v2/ds-w01.ts` and `scripts/v2/ds-batch-02.ts` (W8 web scraping
is a representative one) before writing anything new. Match that tone.

**Do:**
- Mentor talking to a friend over coffee
- Slightly suspicious of the data
- Occasionally dry
- Specific concrete details ("$400,000 fare," "RatecodeID 2," "$3 per mile")
- Predict-then-check baked into mastery questions
- Common mistakes named with the SHAPE of the error ("`KeyError: 'column_name'` means…")
- Debug help written as if talking the student down from quitting
- Industry context that is REAL (Netflix tests thumbnails, Capital One breach, Bloomberg uses Excel)
- Acknowledge the previous week ("Last week you…") — narrative continuity

**Do NOT:**
- "Not X. Y." rhetorical chops repeated (the AI cadence tell)
- "Any hiring manager can open in their browser" / "your public portfolio" hype
- "Welcome to having a portfolio" / "this is the work" earnest-aphorism style
- Em-dashes (the `clean()` function strips them anyway, but write hyphens to be safe)
- Generic "real analysts do this all the time" without the SPECIFIC example
- Numbered lists in the context paragraph (it's narrative, not a brochure)
- Marketing words: "elite," "world-class," "next-generation," "powerful"

**Voice red-flag self-check:** before applying a batch, re-read each context out loud. If a sentence sounds like a LinkedIn caption, rewrite it. If a mastery question reads like a homework assignment instead of a conversation, rewrite it.

## The mechanics

```
# Per-week rewrite
scripts/v2/{track}-w{NN}.ts                    # one week, easy to review
scripts/v2/{track}-batch-{NN}.ts               # 5 weeks bundled (preferred for momentum)

# Apply to JSON
npx tsx scripts/v2/{whatever}.ts               # writes new fields into data/roadmaps/{track}.json

# Push to DB (mentees see new content immediately)
npx tsx scripts/resync-all-weeks-scoped.ts --apply
```

Both are idempotent. The resync is scoped by roadmap title — it only updates
each mentee's tasks with content from the roadmap they actually picked. The
OLD `resync-week-detail.ts` had a cross-roadmap bug; it has been deleted.
Never re-introduce a script that filters tasks by `title startsWith "Week N:"`
without scoping to the roadmap.

## Per-week recipe

For each week, get metadata first:

```
node -e "
const r = JSON.parse(require('fs').readFileSync('data/roadmaps/{slug}.json','utf-8'));
const w = r.weeks.find(x=>x.number===N);
console.log('TITLE:', w.title);
console.log('PROJECT:', w.project);
console.log('TOPICS:', (w.topics||[]).join(' | '));
"
```

Then write the patch object with the six fields. Apply via `rewriteWeek(slug, n, patch)`.

**Per-field word budgets (tested):**
- `context`: 350–500 words. 4–5 paragraphs. Last paragraph = what they'll have by Sunday.
- `pre_flight`: 60–100 words. One specific predict-or-prepare action.
- `mastery_questions`: 5 items. Each 80–120 words. Each contains: "paste X" + reasoning question + industry context.
- `common_mistakes`: 4–5 items. Each is the SHAPE of the bug, not a generic warning.
- `debug_help`: 100–200 words. Names the 2–3 specific error messages they'll see this week.
- `ai_assist`: 80–150 words. What AI is good for THIS week + one specific thing to NOT outsource.
- `stretch`: 2–3 items. Real next steps, not "do more of the same."

## Pacing across sessions

5 weeks per batch is the proven unit. Budget roughly 15% of conversation context per batch (one Write tool call + apply + resync). Plan for ~5–7 batches per session before hitting context risk.

Realistic completion: ~12–15 sessions total for the remaining 238 weeks.

## When you're picking up cold — DO THIS EXACTLY

Voice drift between sessions is the #1 risk on this project. Two previous
rewrites of this codebase failed because they assumed they knew the voice.
Do not assume.

### Mandatory order (do NOT skip steps):

1. Read `scripts/v2/HANDOFF.md` (this file).
2. Read `scripts/v2/VOICE-DNA.md` end-to-end. The 12 banned patterns are non-negotiable.
3. Read `scripts/v2/ds-w01.ts` end-to-end. This is the voice exemplar.
4. Read ONE of: `scripts/v2/ds-batch-02.ts` OR `scripts/v2/ds-batch-03.ts`. Pick one, read every line, internalise the rhythm.
5. **THE CALIBRATION GATE:** write ONE week as a sample. Show the user the rendered context paragraph AND the 5 mastery questions. Wait for explicit sign-off ("voice matches — proceed") or revision notes ("X is off — fix Y").
6. Only AFTER user signs off the calibration sample, write the rest of the batch (4 more weeks).
7. Apply via `npx tsx scripts/v2/{batch-file}.ts`.
8. Resync via `npx tsx scripts/resync-all-weeks-scoped.ts --apply`.
9. Update the "What's done" table at the top of this file BEFORE ending the session.

### Why the calibration gate exists

Without it, a fresh agent reads the docs, feels confident, writes 5 weeks
in the wrong voice, the user spots it on week 4, and we throw out a day of
work. The 10 minutes spent on the gate saves the day.

Skip the gate only if the user explicitly says "skip calibration, just go."
Default behaviour is ALWAYS to gate.

### When user says "go" without specifying a batch size

Default: ONE calibration week → wait for sign-off → batch of 4 more.
Do NOT default to bigger batches. Voice quality at week 1 of a session does
not predict voice quality at week 5 of the same session.
