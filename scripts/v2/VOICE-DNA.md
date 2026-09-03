# Voice DNA — Specific rules, with examples

This file is the precise calibration of the v2 voice. Read every example.
Memorise the BAD lines so you recognise them in your own writing.

## The 12 banned patterns (auto-fail if any appear)

### 1. The "Not X. Y." rhetorical chop
- ❌ "Not a tutorial. A real artefact."
- ❌ "Not a chore. A craft."
- ❌ "Not perfection — your first real win."
- WHY BANNED: This is the single most identifiable AI-cadence tell. Read the docs of any AI-generated marketing copy and you will see it 5 times per page.
- ✅ Replace with: a single complete sentence that asserts the thing, OR delete the chop entirely.

### 2. Hiring-manager hype
- ❌ "Any hiring manager can open in their browser by Sunday"
- ❌ "Looks great on your resume"
- ❌ "Future employers will be impressed"
- WHY BANNED: condescending, marketing-flavoured, and the student is not stupid.
- ✅ Replace with: what the work actually demonstrates ("This notebook is the first piece of public evidence that you do this kind of work").

### 3. The "welcome to X" earnest sign-off
- ❌ "Welcome to having a portfolio."
- ❌ "Welcome to the field."
- ❌ "You're a data scientist now."
- WHY BANNED: cringe. Bootcamp graduation-speech energy.
- ✅ Replace with: the next concrete thing they will do.

### 4. Brochure adjectives
- ❌ "world-class," "elite," "premium," "powerful," "cutting-edge," "next-generation," "revolutionary," "game-changing"
- WHY BANNED: every Substack landing page uses these. They mean nothing.
- ✅ Replace with: a specific concrete fact ("Stripe processes over $1T per year" is fine; "powerful payment infrastructure" is not).

### 5. "Real X do this all the time" without naming the X
- ❌ "Real analysts do this constantly."
- ❌ "Engineers think about this all the time."
- WHY BANNED: empty appeal to authority.
- ✅ Replace with the specific company/role/scenario ("Netflix's recommendations team measures this for every model release").

### 6. The "magic" claim
- ❌ "Pandas is magic."
- ❌ "SQL is magic once you get it."
- WHY BANNED: it is not magic. It is mechanics, and you are supposed to be teaching mechanics.
- ✅ Replace with what it actually is ("Pandas is NumPy with column names; once that clicks, half the API guesses itself").

### 7. Em-dash overuse
- ❌ "You will learn this — really learn it — for the rest of your career."
- WHY BANNED: AI overuses em-dashes. `clean()` strips them but they signal AI cadence in the source.
- ✅ Use commas, full stops, or parentheses instead.

### 8. Numbered list disguised as a paragraph
- ❌ "This week you will: (1) load the data, (2) clean it, (3) analyse it, (4) ship it."
- WHY BANNED: brochure energy. The student already knows from the title what they will do.
- ✅ Write narrative. The list goes in `tasks`, not in the context paragraph.

### 9. "Trust me" hedges
- ❌ "Trust me, this matters."
- ❌ "Believe me, you will use this."
- ❌ "I promise this will pay off."
- WHY BANNED: trust me is what people say when they have not earned trust.
- ✅ Show the payoff with a concrete example.

### 10. The "let me tell you a secret" reveal
- ❌ "Here's a secret the bootcamps won't tell you…"
- ❌ "Here's what nobody talks about…"
- WHY BANNED: marketing voice. The thing is usually not a secret.
- ✅ Just state the thing.

### 11. Overuse of "you will" with the same verb pattern
- ❌ "You will load… You will clean… You will analyse… You will deploy…"
- WHY BANNED: rhythmic, robotic, AI-cadence.
- ✅ Vary sentence structure. Some "you will" lines, some imperative ("Run df.shape"), some narrative ("By Friday the notebook is on GitHub").

### 12. The closing-line aphorism
- ❌ "The code is the easy half. The thinking is the job."
- ❌ "Models are the easy part; the data is the hard part."
- ❌ "Theory is reading about a lockpick. Practice is picking a lock."
- WHY BANNED: too pithy, AI-essay-finish energy. One per week MAX, and only if it earns its keep.
- ✅ End paragraphs on a specific concrete sentence instead.

## Voice anchors — good lines from W1–W17 to imitate

These were left in deliberately because they earn their keep. Imitate the
rhythm, not the literal words.

- "Three and a half million strangers' trips, loaded into Python, cleaned of bad data, and turned into three observations about how the city actually moves."
- "The thing that makes someone good at this job is not pandas. It is a kind of suspicion."
- "If you cannot solve it in 15 minutes, paste the full error AND the line of code that produced it into Claude. Ask Claude to explain what is happening before you copy any fix."
- "The cleaning IS the analysis — every decision here is a small story about what you count as real."
- "Joblib is more efficient for numpy arrays, which sklearn models are full of."
- "Hand-labelling while looking at the model's previous label. You will unconsciously anchor to it and your 'ground truth' becomes 'agreement with the model.'"
- "Bootcamps test syntax. Senior interviews test whether you can recognise when a result smells wrong."

These work because: specific noun, specific verb, slight dryness, concrete
consequence. No abstractions hanging in the air.

## The calibration gate

In any new session picking up the v2 rewrite, BEFORE writing a full batch:

1. Read this file.
2. Read `scripts/v2/ds-w01.ts` end-to-end.
3. Write ONE week as a calibration sample.
4. Show the user the rendered context paragraph + 5 mastery questions.
5. Wait for user sign-off ("yes, voice matches" or "no, fix X").
6. Only then write the rest of the batch.

This 10-minute gate is the difference between a session that produces 5 great weeks and a session that produces 5 weeks the user has to throw out.

## The diff test

If you are unsure whether a sentence is in the voice, paste BOTH versions
(yours and a reference line from W1–W17) into a comparison:

- Does yours sound like it could appear in marketing copy? → cut it.
- Does yours name a specific company, file, error, dollar amount, or number? → keep it.
- Does yours use "—" anywhere? → replace with comma or full stop.
- Does yours have a "Not X. Y." pattern? → cut the chop.
- Does the line make a beginner feel smarter for reading it, or more confused? → if confused, simpler. If neither, sharper.

If you cannot decide, ASK THE USER. Better to spend 30 seconds on a vibe check than ship a week with off voice.
