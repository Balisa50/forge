const fs = require('fs');
const FILE = 'C:/Users/Abdoulie Balisa/OneDrive/Desktop/FORGE/data/roadmaps/data-science.json';
const ds = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const L = (title, body) => ({ kind: 'lesson', title, body });
const V = (title, url, dm, creator, why) => ({ kind: 'video', title, url, duration_min: dm, creator, why });
const S = (cards) => ({ kind: 'swipe', title: 'Quick check — swipe to answer', cards });
const E = (title, body) => ({ kind: 'exercise', title, body });
const RD = (title, url, why) => ({ kind: 'reading', title, url, why });
const D = (number, title, summary, items) => ({ number, title, summary, items });

/* ════ WEEK 10 — TaxiPulse v1.0: Ship + retro ════ */
const W10 = {
  number: 10, title: "TaxiPulse v1.0: Ship + retro",
  phase: "Foundations", commitment_hours: "10-15",
  context: ds.weeks[9].context,
  concept_check: [
    { q: "This is a 'polish week' with no new features. What does polish actually mean here?",
      choices: ["Adding more models and charts","Taking something 80% finished and pushing it to 100% — fixing rough edges, clarity, docs","Rewriting everything from scratch","Deploying to more platforms"],
      correct: 1, explain: "Polish is the unglamorous last 20%: clear docstrings, readable markdown, fast cells, no confusing bits. It's what separates a portfolio piece that gets you an interview from one that almost does." },
    { q: "Why send your notebook to someone who knows nothing about NYC taxis?",
      choices: ["To get a compliment","A confused outsider reveals exactly where your explanation fails — feedback you can't get from yourself","To prove it works","To find code bugs"],
      correct: 1, explain: "You can't see your own blind spots — you already know the context. A real reader who gets confused at a specific point shows you precisely what to clarify. Outside readers are gold for finding unclear writing." },
    { q: "What belongs in a project retrospective (RETRO.md)?",
      choices: ["Only the things that went well","What worked, what didn't, what you'd do differently, and what you learned","A list of every commit","Marketing copy for the project"],
      correct: 1, explain: "A retro is honest reflection: wins, failures, changes for next time, and lessons. The 'what didn't work' and 'what I'd do differently' sections are the most valuable — they show growth and self-awareness." }
  ],
  days: [
    D(1,"What 'polish' means","The last 20% that separates a portfolio piece from an almost-one.",[
      L("The discipline of finishing",
"## What it is\n" +
"Ten weeks ago you couldn't load a CSV. Now TaxiPulse has three months of data, a fare model, a live API, a live dashboard, and analysis notebooks. This week adds **nothing new** — it's pure polish: taking something 80% done and pushing it to 100%.\n\n" +
"## Why the last 20% is the hardest and most valuable\n" +
"The first 80% — the features — is the fun part. The last 20% is unglamorous: fixing the confusing chart label, writing the docstring you skipped, deleting the dead cell, making the README read cleanly. Almost everyone skips it. That's exactly why doing it sets you apart.\n\n" +
"A portfolio piece that's 80% polished gets a recruiter to *almost* call you. The 100% version — where every notebook reads like an article, every function is documented, nothing confuses a first-time reader — is the one that gets the interview. The gap between those two outcomes is this week's work.\n\n" +
"## How to find what needs polish\n" +
"Make a punch list. Open every notebook as if you're a stranger and write down everything rough: unclear variable names, missing context, a chart with no title, a cell that takes 2 minutes, a paragraph that assumes knowledge the reader lacks. The list IS the week's plan.\n\n" +
"## Where this fits\n" +
"Today you audit the whole project and build the punch list. The rest of the week works through it."
      ),
      L("Building the punch list",
"## What to look for\n" +
"Walk every artifact (notebooks, README, API repo, Streamlit app) and note:\n\n" +
"```text\n" +
"[ ] Cells with no markdown explaining WHY they exist\n" +
"[ ] Functions with no docstring\n" +
"[ ] Charts missing titles or axis labels\n" +
"[ ] Variable names like df2, temp, x that don't say what they hold\n" +
"[ ] Cells that take > 30 seconds to run\n" +
"[ ] Dead code / commented-out experiments left lying around\n" +
"[ ] README sections that are stale or assume too much\n" +
"[ ] Anything a first-time reader would stumble on\n" +
"```\n\n" +
"## The mindset shift\n" +
"Stop being the author (who knows everything) and become the reader (who knows nothing). Every place you have to *remember* context the notebook doesn't state is a place to add it. Polish is empathy for the reader made concrete."
      ),
      S([
        { prompt: "The last 20% of polish is what most people skip, which is exactly why doing it makes you stand out.", answer: true, whenRight: "Right — features are the easy, fun 80%. The unglamorous finishing is rare, and rare is valuable.", whenWrong: "Polish is the part almost everyone skips. Finishing the last 20% is precisely what separates you from the pack." },
        { prompt: "A polish week is the right time to add a second model and a few more charts.", answer: false, whenRight: "Right — no. Polish means NO new features. You're finishing what exists, not extending it.", whenWrong: "Polish week adds nothing new. Resist new features — the job is to perfect what's already built." },
        { prompt: "Auditing your project as if you were a first-time reader helps you find what needs polishing.", answer: true, whenRight: "Right — shifting from author to reader exposes the unstated context and rough edges you can't see otherwise.", whenWrong: "Reading as a stranger is the technique: every spot where you must supply context the notebook doesn't is a polish target." }
      ]),
      E("Your turn — build the punch list","[WRITE] Open every TaxiPulse artifact (notebooks, README, API, Streamlit app) as if you're a stranger. In `POLISH.md`, list every rough edge you find — unclear cells, missing docstrings, unlabelled charts, slow cells, stale README bits. Aim for at least 10 items.")
    ]),
    D(2,"Fix the top issues","Work the punch list — small, clean commits.",[
      L("Working a punch list with clean commits",
"## What it is\n" +
"Take your punch list and fix the most impactful items first. The discipline this week is **one fix per commit** — small, focused commits with clear messages:\n\n" +
"```bash\n" +
"git commit -m 'Add axis labels to the discount scatter'\n" +
"git commit -m 'Rename df2 to clean_q4 throughout notebook 06'\n" +
"git commit -m 'Add markdown context above the CLV groupby'\n" +
"```\n\n" +
"## Why small commits matter\n" +
"A commit history of 'update', 'fixes', 'more changes' tells a reviewer nothing. A history of small, descriptive commits reads like a changelog — anyone can see exactly what improved and why. Clean git history is itself a signal of professionalism that recruiters notice when they browse your repo.\n\n" +
"## Prioritise by reader impact\n" +
"Not all fixes are equal. An unlabelled chart on your headline finding matters more than a slightly-awkward variable name in a helper cell. Fix the things a reader hits *first* and *hardest* before the cosmetic details. Triage by impact, not by what's easiest.\n\n" +
"## Why it matters\n" +
"This is where the project visibly levels up. Each fix is small, but together they transform 'a notebook that works' into 'a notebook that communicates'.\n\n" +
"## Where this fits\n" +
"Today you fix the 5 highest-impact items from your punch list, each as its own clean commit."
      ),
      S([
        { prompt: "One focused fix per commit, with a descriptive message, makes your git history read like a changelog.", answer: true, whenRight: "Right — small descriptive commits let anyone see what improved and why. Clean history signals professionalism.", whenWrong: "Small, single-purpose commits create a readable history. 'update, fixes, more' tells a reviewer nothing." },
        { prompt: "When working a punch list, you should fix the cosmetic details first and the high-impact issues last.", answer: false, whenRight: "Right — reverse it. Fix what a reader hits first and hardest (headline chart) before minor cosmetics.", whenWrong: "Triage by impact: the unlabelled headline chart beats a slightly awkward helper variable. Big-impact first." },
        { prompt: "Clean, descriptive git history is something recruiters actually notice when browsing a repo.", answer: true, whenRight: "Right — it's a visible professionalism signal. Reviewers do scroll the commit log.", whenWrong: "Recruiters do look at commit history. A clean, descriptive log reads as care and discipline." }
      ]),
      E("Your turn — fix the top 5","[CODE] From your POLISH.md punch list:\n1. Pick the 5 highest-impact items (reader hits them first/hardest).\n2. Fix each one.\n3. Commit each fix separately with a clear, descriptive message.\n4. Confirm `git log --oneline` reads like a clean changelog.")
    ]),
    D(3,"Add docstrings + comments","Make every function and cell self-explaining.",[
      L("Docstrings and the WHY comment",
"## What it is\n" +
"Two documentation habits make code self-explaining:\n\n" +
"**Docstrings** — every function states what it does, its inputs, and its output:\n" +
"```python\n" +
"def bootstrap_ci(x, stat=np.mean, n=2000):\n" +
"    \"\"\"Estimate a 95% CI for `stat` of array `x` via bootstrap.\n" +
"    Args:  x: 1-D array. stat: function to apply. n: resamples.\n" +
"    Returns: (low, high) — the 2.5th and 97.5th percentiles.\n" +
"    \"\"\"\n" +
"    ...\n" +
"```\n\n" +
"**WHY comments** — above non-obvious cells, a one-line markdown explaining the *reason*, not the mechanics:\n" +
"```text\n" +
"## Sample 50k for the scatter — 3.2M points render as a black blob\n" +
"```\n\n" +
"## Comment the WHY, not the WHAT\n" +
"`# loop over rows` is noise — the code already says that. `# rate-limit so we don't get IP-banned` is gold — it explains a decision the code can't convey. Good comments answer the question a reader would ask, not narrate the obvious. This distinction is what separates documentation that helps from documentation that clutters.\n\n" +
"## Why it matters\n" +
"Six months from now, you are the stranger reading this code. Docstrings and WHY-comments are a letter to your future self — and to any reviewer deciding whether you write maintainable code.\n\n" +
"## Where this fits\n" +
"Today you add a docstring to every function and a WHY-comment above every non-obvious cell across the TaxiPulse notebooks."
      ),
      S([
        { prompt: "A good comment explains WHY the code does something, not WHAT it does (which the code already shows).", answer: true, whenRight: "Right — '# rate-limit to avoid a ban' beats '# loop over rows'. Comment the reasoning, not the mechanics.", whenWrong: "Comment the WHY. The code already shows the what; the valuable comment explains the decision behind it.", sim: "# BAD:  loop over rows\n# GOOD: sample 50k — 3.2M renders as a blob" },
        { prompt: "A docstring should state what a function does, its inputs, and what it returns.", answer: true, whenRight: "Right — those three (purpose, args, return) let anyone use the function without reading its body.", whenWrong: "A docstring covers purpose, arguments, and return value — enough to use the function without reading its internals." },
        { prompt: "Documentation is wasted effort because you'll always remember why you wrote your own code.", answer: false, whenRight: "Right — you won't. In six months you're the stranger. Docs are a letter to your future self.", whenWrong: "You will forget. Future-you reads this code cold. Docstrings and WHY-comments are how present-you helps them." }
      ]),
      E("Your turn — document everything","[CODE] Across your TaxiPulse notebooks:\n1. Add a docstring (purpose, args, returns) to every function.\n2. Add a one-line markdown WHY-comment above every non-obvious cell.\n3. Check: does each comment explain a reason, not just narrate the code? Delete any that only state the obvious.")
    ]),
    D(4,"Profile slow cells","Find and fix anything that drags.",[
      L("Profiling with %%time and common speedups",
"## What it is\n" +
"A notebook that takes minutes to run is a notebook nobody re-runs. Find the slow cells with `%%time` (or `%timeit`):\n\n" +
"```python\n" +
"%%time\n" +
"df = pd.read_csv('data/taxi.csv')   # ... your code ...\n" +
"# Wall time: 47.2 s   <- too slow, investigate\n" +
"```\n\n" +
"## The usual culprits and fixes\n" +
"- **CSV instead of Parquet** — `read_csv` on millions of rows is slow; `read_parquet` is 10-50x faster. Convert once.\n" +
"- **Filtering late** — filter rows *before* heavy work, not after, so you process less data.\n" +
"- **Python loops over rows** — `for i, row in df.iterrows()` is brutally slow. Replace with **vectorised** pandas/NumPy operations on whole columns.\n\n" +
"## The vectorisation principle\n" +
"```python\n" +
"# SLOW: Python-level loop (seconds on big data)\n" +
"df['tip_rate'] = [t/f for t, f in zip(df.tip, df.fare)]\n" +
"# FAST: vectorised, runs in compiled C (milliseconds)\n" +
"df['tip_rate'] = df.tip / df.fare\n" +
"```\n" +
"Vectorised operations push the loop down into optimised C code. On millions of rows this is the difference between 30 seconds and 0.1 seconds — the single highest-leverage speedup in pandas.\n\n" +
"## Why it matters\n" +
"A fast notebook is one you (and a reviewer) will actually re-run. Slow cells also signal you don't know the idiomatic fast path — fixing them shows you do.\n\n" +
"## Where this fits\n" +
"Today you profile your notebooks, find any cell over ~30s, and speed it up (Parquet, earlier filtering, or vectorisation)."
      ),
      L("See it in code (with output)",
"## Profile and fix\n" +
"```python\n" +
"%%time\n" +
"# BEFORE: row-loop tip rate on 3.2M rows\n" +
"rates = []\n" +
"for _, r in df.iterrows():\n" +
"    rates.append(r['tip_amount'] / r['fare_amount'])\n" +
"# Wall time: 38.4 s\n" +
"\n" +
"%%time\n" +
"# AFTER: vectorised\n" +
"df['tip_rate'] = df['tip_amount'] / df['fare_amount'].clip(lower=0.01)\n" +
"# Wall time: 0.06 s   <- ~600x faster\n" +
"```\n" +
"Same result, 600x faster — purely by replacing a Python row-loop with a vectorised column operation. That's the speedup that makes a notebook re-runnable."
      ),
      S([
        { prompt: "Vectorised pandas operations (df.a / df.b) are far faster than looping over rows with iterrows().", answer: true, whenRight: "Right — vectorised ops run in compiled C over whole columns; iterrows() runs slow Python per row. Often 100x+ faster.", whenWrong: "Vectorisation wins big. iterrows() is a Python-level loop; df.a/df.b runs in C across the whole column at once.", sim: "iterrows loop: 38 s\nvectorised:    0.06 s" },
        { prompt: "Reading data from Parquet is typically much faster than from CSV for large files.", answer: true, whenRight: "Right — Parquet is columnar and binary; read_parquet is often 10-50x faster than read_csv on big data.", whenWrong: "Parquet beats CSV substantially on large files. Convert once and reads get dramatically faster.", sim: "read_csv:     47 s\nread_parquet: 1.2 s" },
        { prompt: "%%time at the top of a cell measures how long that cell takes to run.", answer: true, whenRight: "Right — it reports wall time for the cell, so you can spot the slow ones and target them.", whenWrong: "%%time profiles the cell's runtime. Use it to find which cells are slow before optimising.", sim: "%%time\n...code...\n# Wall time: 47.2 s" }
      ]),
      E("Your turn — profile and fix","[CODE] 1. Add %%time to the top of each substantial cell in your notebooks.\n2. Find any cell taking > 30 seconds.\n3. Speed it up: switch CSV->Parquet, filter earlier, or vectorise a loop.\n4. Re-run and confirm the new wall time. Note the before/after in a markdown cell.")
    ]),
    D(5,"Show a stranger","Real reader feedback you can't get from yourself.",[
      L("The outside-reader test",
"## What it is\n" +
"Send your final notebook's GitHub URL to **one person who knows nothing about NYC taxis** (or data science). Ask them exactly one question:\n\n" +
"> 'Can you read this and tell me ONE thing that confused you?'\n\n" +
"## Why an outsider, and why just one thing\n" +
"You cannot see your own blind spots — you already hold all the context, so every explanation looks clear *to you*. A genuine outsider hits the exact spots where your writing assumes knowledge they don't have. That's information you literally cannot generate alone.\n\n" +
"Asking for **one** thing (not 'any feedback') gets you a real, specific answer instead of a polite 'looks great!'. It lowers the effort barrier and forces them to name the single biggest stumbling block — usually the most important fix.\n\n" +
"## Receiving feedback well\n" +
"When they tell you what confused them, the only correct response is 'thank you' and a note. Do not explain, defend, or argue — if they were confused, the notebook was confusing, full stop. Their confusion is data about your communication, not a debate to win. This non-defensiveness is a genuine professional skill.\n\n" +
"## Why it matters\n" +
"Every reader who bounces off a confusing section is a recruiter who stops reading. One outsider's confusion, fixed, can be worth more than another feature.\n\n" +
"## Where this fits\n" +
"Today you send the notebook to one outside reader and write down the one thing that confused them. Tomorrow you fix it."
      ),
      S([
        { prompt: "An outside reader can find blind spots in your explanation that you literally cannot see yourself.", answer: true, whenRight: "Right — you hold all the context, so it looks clear to you. An outsider hits the unstated assumptions.", whenWrong: "You can't see your own blind spots — you know too much. A fresh reader exposes where your writing assumes context." },
        { prompt: "Asking 'tell me ONE thing that confused you' gets better feedback than 'any thoughts?'.", answer: true, whenRight: "Right — the specific ask gets a real answer instead of a polite 'looks great'. It surfaces the biggest stumbling block.", whenWrong: "A specific question beats an open one. 'One confusing thing' forces a concrete answer; 'any thoughts' invites politeness." },
        { prompt: "If a reader says a section confused them, you should explain why it's actually clear.", answer: false, whenRight: "Right — never defend. If they were confused, it was confusing. Say thanks and note it; their confusion is the data.", whenWrong: "Don't argue with feedback. Their confusion proves the section is unclear, regardless of your intent. Thank them and fix it." }
      ]),
      E("Your turn — show a stranger","[WRITE] 1. Send your final notebook's GitHub URL to one person outside data science.\n2. Ask: 'Can you read this and tell me ONE thing that confused you?'\n3. Write their answer verbatim in POLISH.md — no defending, no explaining. Just record it.")
    ]),
    D(6,"Fix what confused them","Turn the feedback into a concrete improvement.",[
      L("Acting on real feedback",
"## What it is\n" +
"Yesterday a real reader told you the one thing that tripped them up. Today you fix exactly that — and fixing one named, real confusion is worth more than ten improvements you imagined.\n\n" +
"## Why real feedback beats imagined polish\n" +
"Left alone, you'd polish the things *you* think matter — which are biased by what you already understand. The reader's confusion is **ground truth**: a real human actually got lost there. Fixing a confirmed problem always beats guessing at hypothetical ones.\n\n" +
"## How to fix a 'confusion'\n" +
"Confusion usually means missing context, not wrong code. The fix is almost always *words*, not logic:\n" +
"- Add a markdown sentence stating the context you assumed\n" +
"- Rename a cryptic variable to something self-describing\n" +
"- Add a chart title or annotation that names the takeaway\n" +
"- Break a dense paragraph into a clear lead sentence + detail\n\n" +
"## The compounding effect\n" +
"If one outside reader was confused at that spot, many will be — you just can't survey them all. Fixing the one confusion you *did* surface removes a stumbling block for every future reader. That's leverage.\n\n" +
"## Why it matters\n" +
"Closing the loop — get feedback, act on it — is the core skill of iterative improvement. It's how every good product, and every good portfolio, actually gets good.\n\n" +
"## Where this fits\n" +
"Today you fix the confusion your reader flagged, then re-read that section as if seeing it fresh."
      ),
      S([
        { prompt: "Fixing one confusion a real reader flagged is more valuable than fixing several you only imagined.", answer: true, whenRight: "Right — the reader's confusion is ground truth; your imagined issues are biased by what you already know.", whenWrong: "Real feedback beats guesses. A confirmed confusion is worth fixing over hypothetical ones you invented." },
        { prompt: "Reader confusion is usually fixed by changing words/context, not by rewriting the code logic.", answer: true, whenRight: "Right — confusion = missing context. A markdown sentence, a clearer name, a chart title usually fixes it.", whenWrong: "Confusion is typically a communication gap, not a code bug. The fix is words: context, naming, a title — not logic." },
        { prompt: "If only one reader was confused at a spot, it's safe to assume no one else will be.", answer: false, whenRight: "Right — the opposite. One surfaced confusion implies many silent ones. Fixing it helps every future reader.", whenWrong: "One confused reader signals many you didn't survey. Fix it — the benefit compounds across all future readers." }
      ]),
      E("Your turn — fix the confusion","[CODE] 1. Take the confusion your reader flagged in POLISH.md.\n2. Fix it — usually by adding context, renaming, or annotating (not rewriting logic).\n3. Re-read that section fresh. Is it now clear to a newcomer?\n4. Commit with a message naming what you clarified.")
    ]),
    D(7,"Tag v1.0 + write the retro","Ship Project 1 and reflect on it honestly.",[
      L("Shipping v1.0 and the retrospective",
"## What it is\n" +
"TaxiPulse v1.0 ships today — the first complete project of the track. Two deliverables close it:\n\n" +
"**1. The v1.0 tag** — marking the project as done:\n" +
"```bash\n" +
"git add . && git commit -m 'v1.0: ship Project 1'\n" +
"git tag v1.0 && git push && git push --tags\n" +
"```\n\n" +
"**2. RETRO.md** — an honest retrospective:\n" +
"```text\n" +
"# TaxiPulse Retro\n" +
"## What worked\n" +
"## What didn't\n" +
"## What I'd do differently\n" +
"## What I learned\n" +
"```\n\n" +
"## Why the retro matters most\n" +
"The 'what didn't work' and 'what I'd do differently' sections are the valuable ones. Anyone can list wins. Naming your own failures and what you'd change shows **self-awareness and growth** — exactly the traits that make someone coachable and senior-track. A retro full of only successes is a retro nobody believes.\n\n" +
"Writing it also cements the learning: articulating 'I spent too long on X, next time I'd timebox it' turns a vague feeling into a concrete rule you'll actually apply on Project 2.\n\n" +
"## The milestone\n" +
"Ten weeks ago: couldn't load a CSV. Today: a shipped data product with analysis, a validated finding, a live API, and a live dashboard. That arc — start to shipped — is the single most convincing thing in a portfolio. You've now done it once; the next three projects are variations on a process you own.\n\n" +
"## Where this fits\n" +
"Today you write RETRO.md, tag v1.0, and close Project 1. Next week starts the AI-augmented workflow, then Project 2 (Reddit Sentiment)."
      ),
      S([
        { prompt: "The most valuable parts of a retro are 'what didn't work' and 'what I'd do differently'.", answer: true, whenRight: "Right — naming failures and changes shows growth and self-awareness. Anyone can list wins.", whenWrong: "The failure and change sections carry the value. They demonstrate coachability and reflection — wins alone don't.", sim: "## What didn't work\n## What I'd do differently\n# <- the sections that show growth" },
        { prompt: "Writing the retro helps cement the learning by turning vague feelings into concrete rules.", answer: true, whenRight: "Right — 'I'd timebox X next time' becomes an actual rule you apply on Project 2. Articulation locks it in.", whenWrong: "Articulating lessons makes them stick. 'Next time I'd timebox X' is a rule you'll actually use — vague regret isn't." },
        { prompt: "A retrospective should only list the things that went well, to keep it positive.", answer: false, whenRight: "Right — no. A wins-only retro is one nobody believes and that teaches you nothing. The failures are the point.", whenWrong: "Honesty is the point. A retro of only successes is hollow — the failures and changes are what make it useful and credible." }
      ]),
      E("Your turn — ship v1.0 + retro","[PRODUCE] 1. Write RETRO.md with four honest sections: what worked, what didn't, what you'd do differently, what you learned.\n2. Commit + tag:\n`git add . && git commit -m 'v1.0: ship Project 1'`\n`git tag v1.0 && git push && git push --tags`\n\nPASS:\n[x] All cells have markdown context\n[x] All functions have docstrings\n[x] Slow cells profiled + fixed\n[x] One stranger read it; their confusion fixed\n[x] RETRO.md written honestly\n[x] v1.0 tag pushed — Project 1 shipped")
    ])
  ]
};

/* ════ WEEK 11 — AI-Augmented DS workflow + Prompt Engineering ════ */
const W11 = {
  number: 11, title: "AI-Augmented DS workflow + Prompt Engineering",
  phase: "Modern DS", commitment_hours: "10-15",
  context: ds.weeks[10].context,
  concept_check: [
    { q: "What's the realistic premise about AI and data science jobs?",
      choices: ["AI will replace all data scientists","AI won't replace data scientists, but data scientists who use AI well will replace those who don't","AI is a fad that will pass","AI can't help with real DS work"],
      correct: 1, explain: "AI is a multiplier, not a replacement. The data scientist who uses AI to move faster — drafting code, SQL, explanations — outproduces one who doesn't. The skill is using it well: directing it, then verifying its output." },
    { q: "When AI generates code for you, what's the non-negotiable step?",
      choices: ["Accept it immediately to save time","Review and verify it before accepting — AI confidently produces plausible-but-wrong code","Never read it","Run it only in production"],
      correct: 1, explain: "AI generates confident, plausible code that is sometimes subtly wrong. You must read it, understand it, and verify it does what you intended. 'Trust but verify' — you remain responsible for every line you ship." },
    { q: "Which prompt is more likely to get a useful answer?",
      choices: ["'fix my code'","'You are a senior data scientist. This function should compute median tip per borough but returns NaN. Here's the code and a sample row. What's wrong?'","'help'","'is this good?'"],
      correct: 1, explain: "Good prompts give a role, the goal, the actual code/data, and a specific question. Context and specificity are what turn a vague AI response into an actionable one. Garbage-in, garbage-out applies to prompts too." }
  ],
  days: [
    D(1,"Why this matters NOW","AI as a multiplier on work you already know how to do.",[
      L("The AI-augmented data scientist",
"## What it is\n" +
"Every week so far had a small 'AI assist' note. This week AI is the whole topic: how to use it, deliberately and with structure, as a multiplier on the data science you already do.\n\n" +
"## The honest premise\n" +
"AI is not going to replace data scientists. AI is going to replace data scientists **who don't know how to use AI well.** The person who uses AI to draft boilerplate, translate pandas to SQL, explain an error, and summarise findings — while keeping their own judgment in charge — simply outproduces someone who types everything by hand.\n\n" +
"## Multiplier, not autopilot\n" +
"The key word is *multiplier*. AI amplifies what you already understand; it doesn't replace understanding. You still decide what to build, judge whether the output is right, and own every line you ship. AI handles the typing and the recall; you handle the thinking and the verification. That division is the whole skill.\n\n" +
"## Why you're ready for this now, not in Week 1\n" +
"You needed ten weeks of doing the work by hand first. Now you know enough to **direct** the AI and to **catch it when it's wrong** — both of which require real competence. Handing AI to a total beginner produces confident nonsense they can't evaluate. You're past that.\n\n" +
"## Where this fits\n" +
"This week: AI tools (Cursor/Copilot), prompt patterns, AI for SQL, AI code review, and AI for explaining findings — applied to your real TaxiPulse work, not toy examples."
      ),
      V("AI pair programming with Cursor / Copilot","https://www.youtube.com/watch?v=ocMOZpuAMw4",10,"various","What AI coding assistants do and how working with one actually feels."),
      L("Trust, but verify — always",
"## The one rule that governs everything\n" +
"AI generates **confident, fluent, plausible** output that is **sometimes wrong** — and the wrongness is often subtle (a flipped condition, a wrong column, an off-by-one). It never says 'I'm not sure.' So:\n\n" +
"```text\n" +
"AI writes it  ->  YOU read it  ->  YOU verify it  ->  THEN accept\n" +
"```\n\n" +
"## Why verification is non-negotiable\n" +
"You remain responsible for every line you ship, regardless of who (or what) typed it. 'The AI wrote it' is not a defence for a bug in production. Accepting AI output you don't understand is how subtle errors slip into real analysis — and you can't debug what you never read.\n\n" +
"## The healthy mindset\n" +
"Treat AI like a fast, knowledgeable junior who is occasionally confidently wrong. You'd never merge a junior's PR unread; don't accept AI's code unread either. Direct it, review it, verify it. That stance keeps AI a multiplier instead of a liability."
      ),
      S([
        { prompt: "AI is best understood as a multiplier on skills you already have, not a replacement for understanding.", answer: true, whenRight: "Right — it amplifies your competence. You still decide what to build and judge if it's correct.", whenWrong: "AI multiplies what you already understand. It handles typing/recall; you keep the thinking and judgment.", sim: "you: what + is-it-right?\nAI:  the typing + the recall" },
        { prompt: "Because AI output is confident and fluent, you can safely accept it without reading it.", answer: false, whenRight: "Right — fluency is NOT correctness. AI is confidently wrong sometimes. Always read and verify before accepting.", whenWrong: "Confidence isn't correctness. AI produces plausible-but-wrong code. You must read and verify every time.", sim: "AI writes -> you read -> you verify -> accept" },
        { prompt: "Ten weeks of doing the work by hand first is what lets you direct AI and catch its mistakes.", answer: true, whenRight: "Right — you need competence to evaluate AI's output. A total beginner can't tell confident nonsense from truth.", whenWrong: "Your hard-won skills are what let you judge AI. Without them, you can't catch the subtle errors it makes." }
      ]),
      E("Your turn — your AI stance","[WRITE] In `AI_NOTES.md`, write your personal rules:\n1. One sentence on why AI is a multiplier, not a replacement.\n2. Three things you will ALWAYS do before accepting AI-generated code.\n3. One task you're excited to speed up with AI this week.")
    ]),
    D(2,"Cursor / Copilot setup","An AI assistant inside your editor.",[
      RD("Cursor (AI code editor)","https://cursor.com","Click 'Open'. Download Cursor — a VS Code fork with AI built in. (GitHub Copilot in VS Code is an alternative.)"),
      L("AI coding assistants in practice",
"## What it is\n" +
"**Cursor** (an AI-native editor) and **GitHub Copilot** (an extension) put an AI assistant directly in your editor. Instead of copy-pasting to a chat window, you describe what you want *in context* and it writes code that fits your file:\n\n" +
"```text\n" +
"Cmd/Ctrl + K  ->  'add a function that computes the median tip\n" +
"                   percentage per pickup borough and plots a bar chart'\n" +
"```\n" +
"It generates the code inline, using your existing variables and imports.\n\n" +
"## The in-context advantage\n" +
"Because the assistant sees your open files, it knows your DataFrame is called `df`, that you've imported pandas as `pd`, and what columns exist. Its suggestions fit your code instead of being generic snippets you have to adapt. That context is what makes editor-integrated AI faster than chat.\n\n" +
"## Review before accepting — every time\n" +
"The generated code appears as a diff you accept or reject. **Read it before accepting.** Does it use the right column? Handle the empty case? Match your style? The accept/reject gate is exactly where your judgment lives — never reflexively accept.\n\n" +
"## Why it matters\n" +
"For boilerplate (a groupby + plot, a docstring, a test), AI in the editor removes the typing so you spend your attention on the analysis. The speedup is real — but only if you keep reviewing.\n\n" +
"## Where this fits\n" +
"Today you install Cursor, open your TaxiPulse repo, and generate one function with Cmd/Ctrl+K — reviewing before you accept."
      ),
      S([
        { prompt: "An editor-integrated AI assistant can use your existing variables and imports because it sees your open files.", answer: true, whenRight: "Right — that context is the advantage. It knows your df is 'df' and writes code that fits, not generic snippets.", whenWrong: "In-context is the point: it reads your open files, so its code matches your variables and imports.", sim: "Cmd+K: 'plot median tip per borough'\n# uses your existing df, pd import" },
        { prompt: "AI-generated code in the editor should be reviewed in the diff before you accept it.", answer: true, whenRight: "Right — the accept/reject gate is where your judgment lives. Read it: right column? edge cases? style?", whenWrong: "Always review the diff before accepting. The gate is exactly where you verify — never reflex-accept.", sim: "AI shows diff -> you read it -> accept or reject" },
        { prompt: "The main benefit of AI in the editor is for novel research problems no one has solved before.", answer: false, whenRight: "Right — it shines on BOILERPLATE (groupby+plot, docstrings, tests), freeing your attention for the actual analysis.", whenWrong: "It's best at boilerplate and routine code, not novel research. It removes typing so you focus on the thinking." }
      ]),
      E("Your turn — Cursor/Copilot","[CODE] 1. Install Cursor (or enable Copilot in VS Code). Open your taxipulse repo.\n2. Cmd/Ctrl+K: 'add a function that computes the median tip percentage per pickup borough and plots a bar chart'.\n3. REVIEW the generated code before accepting — does it use the right columns?\n4. Run it. Did it work? Note in AI_NOTES.md what you had to fix.")
    ]),
    D(3,"Prompt patterns that work","Four reusable structures for better AI answers.",[
      L("The four prompt patterns",
"## What it is\n" +
"Vague prompts get vague answers. Four structured patterns reliably get better output:\n\n" +
"**1. ROLE** — assign expertise:\n" +
"```text\n" +
"You are a senior data scientist. Critique this approach: [paste]\n" +
"```\n\n" +
"**2. EXAMPLES (few-shot)** — show the format you want:\n" +
"```text\n" +
"Convert these pandas snippets to SQL. Example:\n" +
"  df.groupby('x').size()  ->  SELECT x, COUNT(*) FROM t GROUP BY x\n" +
"Now do: [your query]\n" +
"```\n\n" +
"**3. STEP-BY-STEP** — force reasoning:\n" +
"```text\n" +
"Think step by step. How would you find anomalies in this taxi data?\n" +
"```\n\n" +
"**4. CONSTRAINTS** — bound the output:\n" +
"```text\n" +
"Write a function in under 10 lines that... \n" +
"```\n\n" +
"## Why structure beats vagueness\n" +
"'Fix my code' gives the model nothing to work with. A prompt with a role, the goal, the actual code, and a specific question gives it everything it needs. **Garbage-in, garbage-out applies to prompts.** The quality of your answer is largely set by the quality of your prompt.\n\n" +
"## These compose\n" +
"The best prompts combine patterns: a ROLE + an EXAMPLE + a CONSTRAINT in one. 'You are a senior DS. Convert this pandas to SQL like [example]. Keep it under 5 lines.' Stacking them stacks the quality.\n\n" +
"## Where this fits\n" +
"Today you try each of the four patterns on a real TaxiPulse question and save the ones that worked best."
      ),
      RD("Prompt engineering guide","https://www.promptingguide.ai","Click 'Open'. A concise reference for prompt patterns beyond the four core ones."),
      S([
        { prompt: "'Fix my code' is a weaker prompt than one giving a role, the goal, the code, and a specific question.", answer: true, whenRight: "Right — garbage-in, garbage-out. Context and specificity drive answer quality. 'Fix my code' gives nothing to work with.", whenWrong: "Specific beats vague. A role + goal + code + question gives the model what it needs; 'fix my code' doesn't." },
        { prompt: "The few-shot (EXAMPLES) pattern works by showing the model the exact output format you want.", answer: true, whenRight: "Right — one or two examples teach the format implicitly. The model mirrors the pattern you demonstrated.", whenWrong: "Few-shot shows the desired format via examples. The model imitates the input->output pattern you gave it.", sim: "pandas -> SQL example, then:\n'Now do: [your query]'" },
        { prompt: "Prompt patterns can't be combined — you must pick exactly one per prompt.", answer: false, whenRight: "Right — they compose. ROLE + EXAMPLE + CONSTRAINT in one prompt stacks the quality.", whenWrong: "They combine well. 'You are a senior DS [role]. Convert like [example]. Under 5 lines [constraint].' Stack them." }
      ]),
      E("Your turn — prompt patterns","[CODE] On a real TaxiPulse question, try each pattern in ChatGPT:\n1. ROLE: 'You are a senior DS. Critique this approach: [paste].'\n2. EXAMPLES: convert a pandas snippet to SQL with one example shown.\n3. STEP-BY-STEP: 'Think step by step. How would you find anomalies in this data?'\n4. CONSTRAINTS: 'Write a function in <10 lines that...'\nSave the best prompt + answer in prompts.md.")
    ]),
    D(4,"Using AI to write SQL fast","Schema in, working query out — then verify.",[
      L("AI-assisted SQL with schema context",
"## What it is\n" +
"AI is excellent at SQL — *if* you give it your schema. Paste the table structure, then ask for the query in plain English:\n\n" +
"```text\n" +
"Table: taxi(pickup_datetime, pickup_hour, trip_distance,\n" +
"            trip_minutes, fare_amount, tip_amount, pickup_borough)\n\n" +
"Write a SQL query that finds the 3 boroughs with the LARGEST gap\n" +
"between weekday and weekend average fares. Use a CTE.\n" +
"```\n\n" +
"## Why the schema is the key input\n" +
"Without your schema, the AI guesses column names and you get a query that references `fare` when yours is `fare_amount`. With the schema, it uses your exact columns and the query often runs first try. **The schema is the context that turns a generic guess into a usable query.**\n\n" +
"## Verify by running, not by reading alone\n" +
"AI SQL can be subtly wrong — a missing GROUP BY column, a join that double-counts, a window frame that's off. Don't just eyeball it: **run it** in SQLite Online and check the result against what you expect (e.g. does the row count look sane? do the numbers match a pandas spot-check?). If it errors, paste the error back to the AI — it's good at fixing its own mistakes when you show it the message.\n\n" +
"## Why it matters\n" +
"Complex SQL (multi-CTE, window functions) is exactly the tedious-but-mechanical work AI accelerates well. You still own correctness, but the first draft arrives in seconds.\n\n" +
"## Where this fits\n" +
"Today you give AI your taxi schema, ask for a non-trivial CTE query, run it, and fix it *with* the AI if needed."
      ),
      S([
        { prompt: "Pasting your table schema before asking for SQL makes the AI use your exact column names.", answer: true, whenRight: "Right — the schema is the key context. Without it the AI guesses column names and the query won't run.", whenWrong: "The schema is what makes the query usable. With it, the AI uses fare_amount (not 'fare') and it runs first try.", sim: "Table: taxi(fare_amount, pickup_borough, ...)\n# AI now uses YOUR column names" },
        { prompt: "AI-generated SQL should be run and checked against expected results, not just read once and trusted.", answer: true, whenRight: "Right — subtle errors (missing GROUP BY, double-counting joins) hide in plausible SQL. Run it and sanity-check.", whenWrong: "Always run it and verify. AI SQL can be subtly wrong in ways reading alone misses. Check the result is sane." },
        { prompt: "If the AI's SQL throws an error, the best move is to abandon it and write the query by hand.", answer: false, whenRight: "Right — instead, paste the error back to the AI. It's very good at fixing its own mistakes when shown the message.", whenWrong: "Don't abandon it — paste the error back. AI fixes its own errors well when you give it the message to work from." }
      ]),
      E("Your turn — AI for SQL","[CODE] 1. Paste your taxi table schema into ChatGPT.\n2. Ask: 'Write a SQL query finding the 3 boroughs with the largest gap between weekday and weekend average fares. Use a CTE.'\n3. Run it in SQLite Online. Did it work first try?\n4. If not, paste the error back and fix it WITH the AI. Save the final working query in prompts.md.")
    ]),
    D(5,"Code review by AI","A brutal second pair of eyes on your functions.",[
      L("AI as a code reviewer",
"## What it is\n" +
"AI makes a tireless code reviewer. Paste a function and ask for a brutal review:\n\n" +
"```text\n" +
"Review this for: bugs, edge cases, performance, naming, and\n" +
"pythonic style. Be brutal.\n" +
"[paste your function]\n" +
"```\n\n" +
"It will surface things you missed: an unhandled empty-input case, a slow row-loop, a misleading variable name, a more idiomatic one-liner.\n\n" +
"## The crucial skill: filter the suggestions\n" +
"AI review gives you a *list*, and not every item is worth taking. Some suggestions are genuine improvements; some are stylistic nitpicks; some are wrong for your context. **Your job is to apply the best and reject the rest — with reasoning.** 'Apply the top 2, reject the others because...' is the senior move. Blindly applying everything an AI suggests is as bad as ignoring it.\n\n" +
"## Why this builds judgment\n" +
"Deciding which feedback to accept *is* the skill. The AI surfaces options; you exercise the judgment about what actually improves the code. Over time, seeing what AI flags also trains your own eye — you start catching those issues before you even ask.\n\n" +
"## Why it matters\n" +
"A second reviewer catches bugs and bad habits early. Having one available 24/7, for any function, is a genuine quality multiplier — as long as you stay the one deciding.\n\n" +
"## Where this fits\n" +
"Today you get an AI review of one TaxiPulse function, apply the best 2 suggestions, and reject the rest with stated reasons."
      ),
      S([
        { prompt: "When AI reviews your code, your job is to apply the best suggestions and reject the rest with reasoning.", answer: true, whenRight: "Right — the AI surfaces options; you exercise judgment. Apply the genuine wins, reject nitpicks knowingly.", whenWrong: "You filter the list. Take the real improvements, reject the rest with reasons. That judgment is the skill." },
        { prompt: "Blindly applying every suggestion an AI code review makes is a good default.", answer: false, whenRight: "Right — no. Some suggestions are wrong for your context. Blind acceptance is as bad as ignoring the review.", whenWrong: "Don't apply everything. Some suggestions are nitpicks or wrong for your case. Filter with judgment." },
        { prompt: "Seeing what an AI reviewer repeatedly flags can train your own eye to catch those issues earlier.", answer: true, whenRight: "Right — over time you internalise the patterns and start catching them before you even ask. The review teaches.", whenWrong: "It does build your eye: recurring flags (edge cases, slow loops) become things you spot yourself over time." }
      ]),
      E("Your turn — AI code review","[CODE] 1. Pick one function from your TaxiPulse notebooks.\n2. In ChatGPT: 'Review this for bugs, edge cases, performance, naming, and pythonic style. Be brutal. [paste]'.\n3. Apply the BEST 2 suggestions.\n4. Reject the rest — and write one sentence per rejection explaining WHY, in prompts.md.")
    ]),
    D(6,"AI for explaining + summarising findings","Turn analysis into writing others read.",[
      L("AI for communication",
"## What it is\n" +
"AI is strong at turning dense analysis into readable prose. Paste your notebook's findings and ask for a draft aimed at a specific audience:\n\n" +
"```text\n" +
"Draft 3 paragraphs I could publish on dev.to about this analysis.\n" +
"Audience: data analysts. Tone: confident but humble.\n" +
"[paste your findings]\n" +
"```\n\n" +
"## Draft, then edit — the AI writes 0th draft, you write the final\n" +
"AI gives you a fast first draft to react to, which is far easier than facing a blank page. But the output is a **starting point, not a finished product**. You edit it: fix anything inaccurate, cut the generic filler AI loves ('In today's data-driven world...'), and inject your specific numbers and voice. The published version is yours; AI just got you past the blank page.\n\n" +
"## Why your edit is non-negotiable\n" +
"AI prose is often vague, slightly inflated, and occasionally states things your analysis didn't actually show. Publishing it unedited risks claiming findings you can't back up — and it reads generic. Your edit is where accuracy and authenticity get restored. **You are responsible for every claim you publish**, AI-drafted or not.\n\n" +
"## Why it matters\n" +
"Communication is half of data science. A finding nobody reads has no impact. AI lowering the cost of writing means you actually publish — which is how your work becomes visible to employers and peers.\n\n" +
"## Where this fits\n" +
"Today you AI-draft a short write-up of your TaxiPulse analysis, edit it for accuracy and voice, and publish one paragraph (with a chart) on LinkedIn or dev.to."
      ),
      S([
        { prompt: "AI-drafted prose about your findings is a starting point you must edit, not a finished product to publish as-is.", answer: true, whenRight: "Right — AI gets you past the blank page; you fix accuracy, cut filler, and add your voice and numbers.", whenWrong: "It's a 0th draft. Edit for accuracy, strip the generic filler, add your specifics. The published version is yours.", sim: "AI: fast first draft\nYou: accuracy + voice + real numbers" },
        { prompt: "You are responsible for the accuracy of a finding you publish, even if AI drafted the text.", answer: true, whenRight: "Right — AI may state things your analysis didn't show. You own every published claim and must verify it.", whenWrong: "You own every claim you publish. AI sometimes overstates — your edit must ensure the text matches your actual results." },
        { prompt: "The main risk of publishing AI prose unedited is that it's too short.", answer: false, whenRight: "Right — the real risks are generic filler and claims your analysis didn't support. Length isn't the issue; accuracy and voice are.", whenWrong: "The risk isn't length — it's vague filler and unsupported claims. Edit for accuracy and authenticity before publishing." }
      ]),
      E("Your turn — AI for communication","[CODE/WRITE] 1. Paste your TaxiPulse findings into ChatGPT: 'Draft 3 paragraphs for dev.to. Audience: data analysts. Tone: confident but humble.'\n2. EDIT the draft: fix any inaccuracy, cut generic filler, add your real numbers.\n3. Publish ONE edited paragraph (with a chart screenshot) on LinkedIn or dev.to.\n4. Save the prompt + your edits in prompts.md.")
    ]),
    D(7,"Tag AI-aware","Codify your AI workflow as a reusable asset.",[
      L("Capturing your AI workflow",
"## What it is\n" +
"This week's lasting deliverable is `prompts.md` — your personal, reusable AI playbook, committed to the TaxiPulse repo:\n\n" +
"```text\n" +
"# My AI Workflow\n" +
"## Prompts that worked (5)\n" +
"## Prompts that failed (2) — and why\n" +
"## Rules: when to trust AI vs verify (3)\n" +
"```\n\n" +
"## Why document the failures too\n" +
"The two prompts that *failed* are as valuable as the five that worked. Knowing what doesn't work — 'asking for SQL without the schema gives unusable queries' — saves you from repeating dead ends. Documented failures are compressed experience.\n\n" +
"## Why your 'when to trust vs verify' rules matter most\n" +
"After a week of real use, you've developed instincts: AI is reliable for boilerplate and explanations, risky for novel logic and exact numbers. Writing those instincts as explicit rules turns a vague feeling into a checklist you (and teammates) can apply. That judgment — knowing *when* to lean on AI and when to be skeptical — is the actual expertise this week built.\n\n" +
"## Why it matters\n" +
"Anyone can use AI. Having a deliberate, documented workflow — with patterns that work, failures to avoid, and clear verification rules — is what separates someone who uses AI *well* from someone who just pastes prompts and hopes. That's a hireable distinction in 2026.\n\n" +
"## Where this fits\n" +
"Today you finalise prompts.md and commit it. Next week starts Project 2 (Reddit Sentiment) — and you'll bring this whole AI workflow to it."
      ),
      S([
        { prompt: "Documenting the prompts that FAILED is as valuable as documenting the ones that worked.", answer: true, whenRight: "Right — knowing what doesn't work saves you repeating dead ends. Documented failures are compressed experience.", whenWrong: "Failures are gold: 'SQL without schema = unusable' stops you repeating it. Record what didn't work, not just what did." },
        { prompt: "Explicit 'when to trust AI vs verify' rules turn vague instincts into a checklist you can reliably apply.", answer: true, whenRight: "Right — writing the instincts down makes them reusable and shareable. That judgment is the week's real expertise.", whenWrong: "Codifying the instincts (reliable for boilerplate, risky for exact numbers) makes them an actual usable checklist." },
        { prompt: "Since everyone has access to AI, having a documented AI workflow gives you no real advantage.", answer: false, whenRight: "Right — access is universal, but a deliberate documented workflow is rare. It's what separates using AI well from just pasting prompts.", whenWrong: "Access is common; skilled, documented use is not. A real workflow is exactly the hireable distinction." }
      ]),
      E("Your turn — ship prompts.md","[PRODUCE] 1. Write `prompts.md` in your taxipulse repo with: 5 prompts that worked, 2 that failed (and why), and 3 rules for when to trust AI vs verify.\n2. Commit + tag:\n`git add prompts.md AI_NOTES.md && git commit -m 'AI-augmented workflow + prompt playbook'`\n`git tag ai-aware && git push && git push --tags`\n\nPASS:\n[x] Cursor/Copilot tested on real code\n[x] 4 prompt patterns tried\n[x] AI-generated SQL run successfully\n[x] AI code review applied to 1 function\n[x] AI-drafted paragraph published on LinkedIn or dev.to\n[x] prompts.md committed")
    ])
  ]
};

/* ════ WEEK 12 — Project 2: Reddit Sentiment v0.1 ════ */
const W12 = {
  number: 12, title: "Project 2 — Reddit Sentiment v0.1",
  phase: "NLP", commitment_hours: "15-20",
  context: ds.weeks[11].context,
  concept_check: [
    { q: "Why is text data a fundamentally different challenge from the numeric data of Project 1?",
      choices: ["Text is always smaller","Text is unstructured — models need numbers, so text must be converted before any ML can touch it","Text can't be analysed","Text is always in English"],
      correct: 1, explain: "Models do math on numbers. Text — reviews, posts, tickets — is unstructured and must be transformed into numeric representations before any model can process it. That conversion is the core challenge of NLP, and ~80% of the world's data is text." },
    { q: "What does a pretrained sentiment model let you do without training anything yourself?",
      choices: ["Nothing useful","Label text as positive/negative immediately, using knowledge learned from millions of prior examples","Only count words","Translate languages"],
      correct: 1, explain: "A pretrained model (like DistilBERT fine-tuned on SST-2) already learned sentiment from millions of examples. pipeline('sentiment-analysis') loads it and labels your text in three lines — a strong, instant baseline before you build anything custom." },
    { q: "Why store Reddit API credentials in a .env file that's gitignored?",
      choices: ["It makes the code run faster","Secrets must never be committed — a leaked API key in a public repo gets abused within minutes",".env files are required by PRAW","It improves the model"],
      correct: 1, explain: "API keys are secrets. Committed to a public repo, bots scrape and abuse them fast. The .env + .gitignore pattern keeps credentials out of git entirely — the same discipline as AWS keys in the DevOps track." }
  ],
  days: [
    D(1,"What is sentiment analysis?","From numbers to text — the NLP leap.",[
      L("Sentiment analysis and the NLP challenge",
"## What it is\n" +
"Eleven weeks on numeric data. Now: **text** — the messy, unstructured kind that makes up ~80% of the world's information. Support tickets, reviews, social posts, contracts. **Sentiment analysis** is the entry point: classifying a piece of text by its emotional tone (positive / negative / neutral).\n\n" +
"You're starting **Project 2: Reddit Sentiment.** By the end you'll scrape Reddit posts, label their sentiment, build your own classifier, and ship it — a complete NLP project alongside TaxiPulse.\n\n" +
"## Why text is fundamentally harder than numbers\n" +
"Models do **math**. A fare of $16.42 is already a number a model can multiply. But 'this paper is fire' is a string — meaningless to a model until it's converted into numbers. **That conversion (text -> numbers) is the central problem of NLP**, and you'll meet several ways to do it across this project (pretrained embeddings this week, bag-of-words next week, fine-tuned transformers later).\n\n" +
"## Why sentiment is the right starting point\n" +
"Sentiment is concrete (you can eyeball whether a label is right), genuinely useful (brands track it constantly), and it exposes every core NLP challenge — ambiguity, sarcasm, domain-specific language — in a simple binary frame. It's NLP with training wheels that still teaches the real lessons.\n\n" +
"## Where this fits\n" +
"This week (v0.1) you set up the project, get Reddit API access, scrape 1000 posts, and label them with a pretrained model — a fast, working baseline you'll critique and beat next week."
      ),
      V("What is sentiment analysis? (NLP basics)","https://www.youtube.com/watch?v=O_B7XLfx0ic",8,"various","Sentiment analysis explained, and where it fits in the NLP landscape."),
      L("The arc of Project 2",
"## The plan across the project\n" +
"```text\n" +
"v0.1 (this week): scrape 1000 posts + pretrained labels  <- fast baseline\n" +
"v0.2: hand-label a gold set + classical ML (TF-IDF + LogReg)\n" +
"v0.3: fine-tune DistilBERT on your data\n" +
"v0.4: live dashboard\n" +
"v0.5: REST API + Docker\n" +
"v1.0: ship + retro\n" +
"```\n\n" +
"## The pedagogical spine\n" +
"You'll deliberately build the *same* task three ways — pretrained (now), classical ML (next), fine-tuned transformer (later) — and compare them on YOUR data. That comparison teaches the real lesson: the fanciest model isn't always the best one for your specific problem. Starting with the easy pretrained baseline is what makes that comparison meaningful."
      ),
      S([
        { prompt: "Text must be converted into numbers before a machine learning model can process it.", answer: true, whenRight: "Right — models do math. text -> numbers is the central conversion problem of all NLP.", whenWrong: "Models operate on numbers. A string like 'this is great' must become numeric first. That conversion IS NLP's core challenge.", sim: "'this paper is fire' -> [0.2, -0.8, 1.1, ...]\n# then a model can use it" },
        { prompt: "A pretrained sentiment model can label text immediately, without you training anything.", answer: true, whenRight: "Right — it already learned from millions of examples. pipeline() loads it; you get instant labels as a baseline.", whenWrong: "Pretrained = ready to use. It learned sentiment elsewhere; you just run it for an immediate strong baseline." },
        { prompt: "Text data is a minor edge case in data science compared to numeric data.", answer: false, whenRight: "Right — the opposite. Text is ~80% of the world's data (reviews, tickets, posts, contracts). It's central, not edge.", whenWrong: "Text is roughly 80% of the world's information. It's a huge, central domain — not an edge case." }
      ]),
      E("Your turn — frame Project 2","[WRITE] In a `PROJECT2.md`:\n1. In your own words, why is text harder for a model than numbers?\n2. What does sentiment analysis classify, and name 3 real-world uses.\n3. The project builds the same task 3 ways (pretrained, classical, fine-tuned). Why compare them instead of just using the fanciest?")
    ]),
    D(2,"Set up the project","A clean, isolated environment for NLP work.",[
      L("Project setup and virtual environments",
"## What it is\n" +
"A new project gets its own isolated environment so its dependencies don't collide with other projects:\n\n" +
"```bash\n" +
"mkdir reddit-sentiment && cd reddit-sentiment\n" +
"conda create -n sentiment python=3.11 pandas requests jupyter -y\n" +
"conda activate sentiment\n" +
"pip install praw transformers torch python-dotenv\n" +
"```\n\n" +
"## Why isolated environments matter\n" +
"Project 2 needs `transformers` and `torch` (big, version-sensitive ML libraries). TaxiPulse needed `xgboost` and a specific pandas. Installing everything globally eventually causes a version conflict that breaks one project to satisfy another — 'dependency hell'. A separate conda env (or venv) per project keeps each one's dependencies sealed off. This is standard professional practice, not optional hygiene.\n\n" +
"## The libraries for this project\n" +
"- **praw** — the Python Reddit API Wrapper (scraping posts)\n" +
"- **transformers** — Hugging Face, for pretrained models\n" +
"- **torch** — PyTorch, the deep-learning backend transformers runs on\n" +
"- **python-dotenv** — loads secrets from a .env file\n\n" +
"## Start the repo right\n" +
"Initialise git and create the GitHub repo on day one, with a `.gitignore` ready for `.env` and `data/`. Setting up the hygiene before you write code means you never accidentally commit a secret or a huge data file.\n\n" +
"## Where this fits\n" +
"Today you create the isolated environment, install the NLP libraries, and initialise the `reddit-sentiment` repo."
      ),
      S([
        { prompt: "Each project should get its own isolated environment to avoid dependency conflicts with other projects.", answer: true, whenRight: "Right — sealed envs prevent 'dependency hell' where one project's package versions break another.", whenWrong: "Per-project envs are standard practice. They stop version conflicts between, say, this project's torch and another's.", sim: "conda create -n sentiment python=3.11\n# sealed off from other projects" },
        { prompt: "Installing all ML libraries globally (no virtual environment) is the cleanest approach.", answer: false, whenRight: "Right — no. Global installs eventually conflict (dependency hell). Isolated envs per project are the clean way.", whenWrong: "Global installs lead to version collisions across projects. Isolated environments are the clean, standard approach." },
        { prompt: "Setting up .gitignore for .env and data/ before writing code prevents accidentally committing secrets.", answer: true, whenRight: "Right — hygiene-first means you never push an API key or a huge data file by accident. Set it up day one.", whenWrong: "Prepare .gitignore upfront. It's how you avoid the classic mistake of committing a secret or a giant data file." }
      ]),
      E("Your turn — set up the project","[CODE] 1. mkdir reddit-sentiment; create a conda env (python=3.11) and activate it.\n2. pip install praw transformers torch python-dotenv pandas.\n3. git init; create a public GitHub repo reddit-sentiment.\n4. Add a .gitignore excluding .env and data/. Commit and push the empty scaffold.")
    ]),
    D(3,"Get Reddit API credentials","Authenticated access to real posts.",[
      RD("Reddit app preferences (create an app)","https://www.reddit.com/prefs/apps","Click 'Open'. Create a 'script' app to get your client_id and secret for the API."),
      L("API authentication and the .env pattern",
"## What it is\n" +
"To pull posts programmatically you need **API credentials** — a client ID and secret that authenticate your requests. You create a 'script' app in Reddit's preferences, then store the credentials in a **.env file** (never in code):\n\n" +
"```text\n" +
"# .env  (gitignored!)\n" +
"REDDIT_CLIENT_ID=xxxxx\n" +
"REDDIT_SECRET=xxxxx\n" +
"REDDIT_USER_AGENT=forge-sentiment by /u/yourname\n" +
"```\n" +
"```python\n" +
"import praw, os\n" +
"from dotenv import load_dotenv\n" +
"load_dotenv()\n" +
"reddit = praw.Reddit(\n" +
"    client_id=os.getenv('REDDIT_CLIENT_ID'),\n" +
"    client_secret=os.getenv('REDDIT_SECRET'),\n" +
"    user_agent=os.getenv('REDDIT_USER_AGENT'))\n" +
"```\n\n" +
"## Why secrets go in .env, never in code\n" +
"This is the same discipline as AWS keys in the DevOps track. A credential hard-coded in a `.py` file and pushed to a public repo is scraped and abused by bots **within minutes**. The `.env` file holds the secret, `.gitignore` keeps `.env` out of git, and `load_dotenv()` reads it at runtime. The secret never touches your source code or your commit history.\n\n" +
"## Why an API beats scraping here\n" +
"Reddit offers an official API (via PRAW), so you use it instead of scraping HTML. APIs are stabler, faster, rate-limit-friendly, and explicitly permitted — always prefer an official API over scraping when one exists.\n\n" +
"## Where this fits\n" +
"Today you create the Reddit app, put the credentials in .env, and confirm PRAW authenticates."
      ),
      S([
        { prompt: "API credentials belong in a gitignored .env file, never hard-coded in your source.", answer: true, whenRight: "Right — same rule as AWS keys. .env holds the secret, .gitignore keeps it out of git, load_dotenv reads it at runtime.", whenWrong: "Secrets go in .env (gitignored), not in code. A key in a committed .py is scraped and abused within minutes.", sim: "# .env (gitignored)\nREDDIT_SECRET=xxxxx\n# code: os.getenv('REDDIT_SECRET')" },
        { prompt: "When a site offers an official API, you should generally use it instead of scraping its HTML.", answer: true, whenRight: "Right — APIs are stabler, faster, permitted, and rate-limit-friendly. Prefer them over scraping when available.", whenWrong: "Prefer the official API. It's more stable and explicitly allowed, unlike scraping the HTML. Reddit has PRAW — use it." },
        { prompt: "Hard-coding your client secret directly in scrape.py is fine as long as the repo looks small.", answer: false, whenRight: "Right — never. Repo size is irrelevant; bots scrape public repos for keys constantly. Use .env always.", whenWrong: "Never hard-code secrets, regardless of repo size. Committed keys get abused fast. .env + .gitignore, always." }
      ]),
      E("Your turn — Reddit credentials","[CODE] 1. Create a 'script' app at reddit.com/prefs/apps; note the client_id and secret.\n2. Put them in a .env file (confirm .env is gitignored).\n3. In scrape.py, use load_dotenv() + praw.Reddit(...) to authenticate.\n4. Test: print the title of one post from r/MachineLearning. Confirm it works without the secret being in your code.")
    ]),
    D(4,"Scrape 1000 posts","Build the raw text dataset.",[
      L("Pulling structured data with PRAW",
"## What it is\n" +
"With PRAW authenticated, pulling posts is a clean loop. For each post you keep the fields you'll need for analysis:\n\n" +
"```python\n" +
"rows = []\n" +
"for s in reddit.subreddit('MachineLearning').new(limit=1000):\n" +
"    rows.append({\n" +
"        'id': s.id,\n" +
"        'title': s.title,\n" +
"        'selftext': s.selftext,\n" +
"        'score': s.score,\n" +
"        'num_comments': s.num_comments,\n" +
"        'created_utc': s.created_utc,\n" +
"    })\n" +
"import pandas as pd\n" +
"pd.DataFrame(rows).to_csv('data/posts.csv', index=False)\n" +
"```\n\n" +
"## Choosing what to keep\n" +
"You don't store everything PRAW exposes — you keep the fields that serve the project's questions. `title` and `selftext` are the text you'll classify; `score` and `num_comments` let you later ask 'does sentiment relate to engagement?'; `id` lets you dedupe and join. Deciding which fields matter upfront is a small but real data-modelling judgment.\n\n" +
"## Why save to CSV now\n" +
"Scraping hits the network and is slow + rate-limited. Save the raw pull to `data/posts.csv` **once**, then all downstream work (labelling, modelling) reads the local file. You never want to re-scrape just to re-run analysis — separate the slow acquisition step from the fast analysis steps.\n\n" +
"## Why it matters\n" +
"1000 real posts is a genuine dataset with real-world mess: emoji, code snippets, deleted posts, links. Working with that mess (not a clean toy set) is what makes this an actual NLP project.\n\n" +
"## Where this fits\n" +
"Today you scrape 1000 posts from a subreddit into `data/posts.csv`."
      ),
      L("See it in code (with output)",
"## Scrape and confirm\n" +
"```python\n" +
"import praw, os, pandas as pd\n" +
"from dotenv import load_dotenv\n" +
"load_dotenv()\n" +
"reddit = praw.Reddit(client_id=os.getenv('REDDIT_CLIENT_ID'),\n" +
"                     client_secret=os.getenv('REDDIT_SECRET'),\n" +
"                     user_agent=os.getenv('REDDIT_USER_AGENT'))\n\n" +
"rows = [{'id': s.id, 'title': s.title, 'selftext': s.selftext,\n" +
"         'score': s.score, 'num_comments': s.num_comments,\n" +
"         'created_utc': s.created_utc}\n" +
"        for s in reddit.subreddit('MachineLearning').new(limit=1000)]\n\n" +
"df = pd.DataFrame(rows)\n" +
"df.to_csv('data/posts.csv', index=False)\n" +
"print('Scraped:', len(df))\n" +
"# Scraped: 1000\n" +
"print(df['title'].head(2).tolist())\n" +
"# ['[D] Best practices for...', 'Show: I built a...']\n" +
"```\n" +
"1000 real posts saved locally. Every downstream step reads this file — no re-scraping needed."
      ),
      S([
        { prompt: "You should save the scraped data to a local CSV once, so downstream steps don't need to re-scrape.", answer: true, whenRight: "Right — separate slow acquisition from fast analysis. Save once; labelling and modelling read the local file.", whenWrong: "Save the raw pull once. Re-scraping to re-run analysis is slow and rate-limited. Local CSV decouples the steps.", sim: "scrape (slow, once) -> data/posts.csv\nlabel/model (fast) -> reads the CSV" },
        { prompt: "Keeping fields like score and num_comments (not just text) lets you later ask if sentiment relates to engagement.", answer: true, whenRight: "Right — choosing fields upfront serves future questions. Engagement metrics enable 'does mood drive upvotes?' later.", whenWrong: "Those fields enable later analysis. Storing score/num_comments lets you correlate sentiment with engagement down the line." },
        { prompt: "1000 real Reddit posts will be perfectly clean and uniform, like a textbook dataset.", answer: false, whenRight: "Right — real posts have emoji, code, deleted text, links, mixed languages. That mess is what makes it a real project.", whenWrong: "Real data is messy: emoji, code snippets, [deleted] posts, links. Handling that mess is the actual NLP work." }
      ]),
      E("Your turn — scrape 1000 posts","[CODE] In scrape.py:\n1. Loop reddit.subreddit('MachineLearning').new(limit=1000).\n2. Keep id, title, selftext, score, num_comments, created_utc.\n3. Save to data/posts.csv.\n4. Confirm ~1000 rows and print a couple of titles to eyeball the data.")
    ]),
    D(5,"Use a pretrained sentiment model","Label text with a model someone else trained.",[
      L("The transformers pipeline",
"## What it is\n" +
"Hugging Face's `pipeline` loads a pretrained model and labels text in three lines — no training:\n\n" +
"```python\n" +
"from transformers import pipeline\n" +
"clf = pipeline('sentiment-analysis',\n" +
"               model='distilbert-base-uncased-finetuned-sst-2-english')\n" +
"clf('This library is incredibly well designed')\n" +
"# [{'label': 'POSITIVE', 'score': 0.9998}]\n" +
"```\n\n" +
"## What DistilBERT is (briefly)\n" +
"**DistilBERT** is a smaller, faster version of BERT — a transformer model that reads text in context (it understands that 'not good' is negative, unlike naive word-counting). This particular one was **fine-tuned on SST-2**, a movie-review sentiment dataset. So it's strong at general sentiment but carries that movie-review flavour.\n\n" +
"## The label + score output\n" +
"Each prediction returns a **label** (POSITIVE/NEGATIVE) and a **confidence score** (0-1). Keep both: a 0.99 prediction is far more trustworthy than a 0.55 one. Low-confidence predictions are exactly the ambiguous cases worth inspecting — the score tells you where the model is unsure.\n\n" +
"## Why start here\n" +
"This is your **baseline** — the bar your own model (next week) must beat. Starting with a strong, free, instant baseline is good practice: it tells you whether building something custom is even worth it, and by how much.\n\n" +
"## Where this fits\n" +
"Today you load the pipeline and label a sample of your scraped posts, keeping label + confidence and eyeballing the results."
      ),
      L("See it in code (with output)",
"## Label a sample\n" +
"```python\n" +
"from transformers import pipeline\n" +
"import pandas as pd\n\n" +
"df = pd.read_csv('data/posts.csv')\n" +
"clf = pipeline('sentiment-analysis',\n" +
"               model='distilbert-base-uncased-finetuned-sst-2-english')\n\n" +
"sample = df['title'].fillna('').tolist()[:100]\n" +
"results = clf(sample)\n" +
"for title, r in list(zip(sample, results))[:5]:\n" +
"    print(f\"{r['label']} ({r['score']:.2f})  {title[:50]}\")\n" +
"# POSITIVE (0.99)  Show: a clean implementation of...\n" +
"# NEGATIVE (0.97)  Why does training keep diverging...\n" +
"# POSITIVE (0.56)  [D] Thoughts on the new paper?    <- low confidence\n" +
"```\n" +
"The confidence score earns its keep: that 0.56 flags an ambiguous post the model isn't sure about — exactly the kind you'd inspect."
      ),
      S([
        { prompt: "pipeline('sentiment-analysis') loads a pretrained model and labels text without any training step.", answer: true, whenRight: "Right — three lines to a working classifier. The model already learned sentiment; you just run it.", whenWrong: "It's instant: pipeline loads the pretrained model and labels text immediately. No training on your part.", sim: "clf = pipeline('sentiment-analysis')\nclf('great library')  # POSITIVE 0.99" },
        { prompt: "The confidence score (e.g. 0.56 vs 0.99) helps you spot the ambiguous cases the model is unsure about.", answer: true, whenRight: "Right — low scores flag where the model hesitates. Those are the posts worth inspecting by hand.", whenWrong: "The score signals certainty. A 0.56 is a coin-flip the model isn't sure about — exactly what to inspect.", sim: "0.99 -> confident\n0.56 -> unsure (inspect this one)" },
        { prompt: "Starting with a pretrained baseline is pointless since you'll build your own model anyway.", answer: false, whenRight: "Right — the baseline is the BAR your model must beat. It tells you if custom work is even worth it, and by how much.", whenWrong: "The baseline is the whole point of comparison — it shows whether (and how much) your custom model actually improves things." }
      ]),
      E("Your turn — pretrained labels","[CODE] In label.py:\n1. Load data/posts.csv.\n2. pipeline('sentiment-analysis', model='distilbert-base-uncased-finetuned-sst-2-english').\n3. Label the first 100 titles; print label + score for the first 10.\n4. Markdown: find one low-confidence (~0.5) prediction and one you think is wrong. Note them — they motivate next week's hand-labelling.")
    ]),
    D(6,"Score all 1000","Apply the model at scale and see the distribution.",[
      L("Batch inference and reading the distribution",
"## What it is\n" +
"Now apply the model to all 1000 posts, efficiently, and store the results:\n\n" +
"```python\n" +
"texts = df['title'].fillna('').tolist()\n" +
"results = clf(texts, batch_size=16)\n" +
"df['sentiment']  = [r['label'] for r in results]\n" +
"df['confidence'] = [r['score'] for r in results]\n" +
"df.to_csv('data/labeled.csv', index=False)\n" +
"print(df['sentiment'].value_counts())\n" +
"```\n\n" +
"## Why batch_size matters\n" +
"Passing texts in **batches** (16 at a time) lets the model process them together, which is far faster than one-at-a-time — especially on a GPU. It's the same batch-efficiency idea from the matrix-multiply lesson in Week 2. For 1000 posts the difference is noticeable; at scale it's the difference between minutes and hours.\n\n" +
"## Read the distribution critically\n" +
"`value_counts()` shows the POSITIVE/NEGATIVE split. **Look at it skeptically.** If r/MachineLearning comes out 70% negative, is that real (it's a critical, debate-heavy community) or a model artifact (it reads neutral technical questions as negative)? The distribution is a first sanity check — a wildly skewed result often signals the model is mismatched to your domain, which is precisely the problem next week solves.\n\n" +
"## Why it matters\n" +
"You now have a fully labelled dataset — and a hypothesis about where the labels are wrong. Both are needed: the labels are your v0.1 deliverable; the suspicion about their accuracy is what drives v0.2.\n\n" +
"## Where this fits\n" +
"Today you score all 1000 posts, save `labeled.csv`, and critically read the sentiment distribution."
      ),
      L("See it in code (with output)",
"## Score everything, inspect the split\n" +
"```python\n" +
"texts = df['title'].fillna('').tolist()\n" +
"results = clf(texts, batch_size=16)\n" +
"df['sentiment']  = [r['label'] for r in results]\n" +
"df['confidence'] = [r['score'] for r in results]\n" +
"df.to_csv('data/labeled.csv', index=False)\n\n" +
"print(df['sentiment'].value_counts())\n" +
"# NEGATIVE    603\n" +
"# POSITIVE    397\n" +
"print('Mean confidence:', df['confidence'].mean().round(3))\n" +
"# Mean confidence: 0.871\n" +
"```\n" +
"60% negative on a technical subreddit is suspicious — the SST-2 movie model likely reads neutral 'how do I fix X?' questions as negative. That suspicion is the seed of next week's hand-labelled gold set."
      ),
      S([
        { prompt: "Passing texts in batches (batch_size=16) is faster than classifying them one at a time.", answer: true, whenRight: "Right — batching processes texts together (great on a GPU). Same batch-efficiency idea as matrix multiplication.", whenWrong: "Batching is faster — the model processes 16 at once instead of one-by-one. Matters a lot at scale.", sim: "clf(texts, batch_size=16)\n# 16 at a time >> one at a time" },
        { prompt: "A surprising sentiment distribution (e.g. 60% negative) should be questioned, not blindly trusted.", answer: true, whenRight: "Right — a skewed result may be a model-domain mismatch, not reality. The distribution is a sanity check to interrogate.", whenWrong: "Read it skeptically. A weird split often means the model mismatches your domain — exactly what v0.2 investigates.", sim: "60% negative on a tech sub?\n# real, or movie-model misreading questions?" },
        { prompt: "Once you have labeled.csv, the labels are final and there's nothing more to question.", answer: false, whenRight: "Right — the opposite. The labels are v0.1, and your suspicion they're wrong is what drives the whole next week.", whenWrong: "The labels are a starting point, not gospel. Suspecting they're off (domain mismatch) is what motivates v0.2's gold set." }
      ]),
      E("Your turn — score all 1000","[CODE] In label.py:\n1. Run the classifier on all 1000 titles with batch_size=16.\n2. Add 'sentiment' and 'confidence' columns; save data/labeled.csv.\n3. Print value_counts() of sentiment and the mean confidence.\n4. Markdown: is the distribution believable for this subreddit, or does it hint the model is mismatched? Explain.")
    ]),
    D(7,"Tag v0.1","Ship the scrape-and-label baseline.",[
      L("Shipping the v0.1 baseline",
"## What it is\n" +
"v0.1 of Reddit Sentiment ships: a reproducible pipeline that scrapes 1000 posts and labels them with a pretrained model. Closing it:\n\n" +
"```bash\n" +
"# .gitignore already excludes data/ and .env\n" +
"git add scrape.py label.py README.md .gitignore\n" +
"git commit -m 'reddit-sentiment v0.1: scrape + label 1000 posts'\n" +
"git tag v0.1 && git push && git push --tags\n" +
"```\n\n" +
"## What goes in the README\n" +
"State what it does, how to set up credentials (point to `.env.example`, NOT real keys), and how to run it. Crucially, **note the baseline's limitation** you discovered: 'Uses a movie-review-trained model; sentiment on technical posts is unreliable — v0.2 addresses this with a hand-labelled gold set.' Documenting the known weakness is honest and shows you understand your own pipeline.\n\n" +
"## Confirm the secret never got committed\n" +
"Before pushing, double-check `.env` is gitignored and not in the commit. A quick `git log -p | grep -i secret` (finding nothing) is cheap insurance. Leaking a key in v0.1 would be a real, avoidable mistake.\n\n" +
"## Why a 'weak' baseline is the right v0.1\n" +
"It's tempting to chase the fancy model first. But shipping the simple baseline *now* gives you a working end-to-end pipeline and a concrete benchmark. Every later version is measured against this. Baseline-first is disciplined engineering, not cutting corners.\n\n" +
"## Where this fits\n" +
"Today you write the README (with its honest limitation), confirm no secret leaked, and tag v0.1. Next week: hand-label a gold set and build a classifier that beats this baseline."
      ),
      S([
        { prompt: "The v0.1 README should honestly note the pretrained baseline's limitation (movie-trained model on technical text).", answer: true, whenRight: "Right — documenting the known weakness is honest and shows you understand your pipeline. It also sets up v0.2.", whenWrong: "State the limitation plainly. Naming the baseline's weakness is honest and demonstrates real understanding.", sim: "README: 'movie-trained model — unreliable\non technical posts; v0.2 fixes this'" },
        { prompt: "Before pushing, you should confirm that .env is gitignored and no secret got into the commit.", answer: true, whenRight: "Right — cheap insurance against a leaked key. Verify .env isn't staged and no secret is in the history.", whenWrong: "Always verify the secret didn't slip in. A quick check before push prevents an avoidable, costly key leak." },
        { prompt: "Shipping a simple baseline as v0.1 (instead of jumping to the fancy model) is cutting corners.", answer: false, whenRight: "Right — it's disciplined engineering. The baseline gives a working pipeline and the benchmark every later version is measured against.", whenWrong: "Baseline-first is good practice, not corner-cutting. It establishes the end-to-end pipeline and the bar to beat." }
      ]),
      E("Your turn — ship v0.1","[PRODUCE] 1. Write the README: what it does, how to set up .env (reference .env.example, not real keys), how to run, and the baseline's known limitation.\n2. Confirm .env is gitignored and no secret is in the commit.\n3. Commit + tag:\n`git commit -m 'reddit-sentiment v0.1: scrape + label 1000 posts'`\n`git tag v0.1 && git push && git push --tags`\n\nPASS:\n[x] PRAW credentials in .env (not committed)\n[x] scrape.py pulls 1000 posts to data/posts.csv\n[x] label.py applies pretrained sentiment\n[x] data/labeled.csv has sentiment + confidence\n[x] README notes the baseline limitation\n[x] v0.1 tag pushed")
    ])
  ]
};

/* ════ WEEK 13 — Reddit Sentiment v0.2: Hand-label + classical ML ════ */
const W13 = {
  number: 13, title: "Reddit Sentiment v0.2: Hand-label + classical ML",
  phase: "NLP", commitment_hours: "12-18",
  context: ds.weeks[12].context,
  concept_check: [
    { q: "Why hand-label your own 'gold set' instead of trusting the pretrained model's labels?",
      choices: ["To waste time","Because you can't measure or improve accuracy without ground truth — labels YOU know are correct","Hand-labels are always wrong","The model can't produce labels"],
      correct: 1, explain: "Without a trusted ground-truth set, you have no way to measure how accurate any model is. Hand-labelling a sample creates a 'gold standard' you can score every model against — including the pretrained one you suspect is wrong on your domain." },
    { q: "What does TF-IDF do to text before it goes into a classifier?",
      choices: ["Translates it","Converts text into numeric vectors, weighting words by how distinctive they are to a document","Corrects spelling","Removes all punctuation"],
      correct: 1, explain: "TF-IDF (Term Frequency-Inverse Document Frequency) turns text into numbers: common-everywhere words (the, is) get low weight, words distinctive to a document get high weight. It's the classic way to vectorise text for a classical ML model." },
    { q: "Why might a simple TF-IDF + Logistic Regression beat a fancy pretrained model on YOUR data?",
      choices: ["Simple models are always better","Because it's trained on YOUR domain's labels, while the pretrained model learned a different domain (movie reviews)",
        "Logistic regression is newer","It uses more parameters"],
      correct: 1, explain: "A model trained on your hand-labelled domain data learns your domain's language directly. The pretrained model learned movie-review sentiment, which transfers imperfectly. On domain-specific text, a simple model trained on the right data can beat a sophisticated one trained on the wrong data." }
  ],
  days: [
    D(1,"Why hand-label","No ground truth, no way to measure anything.",[
      L("Ground truth and the gold set",
"## What it is\n" +
"Last week a generic model labelled your 1000 posts, and you suspected some labels were wrong. This week you do what most courses skip: build a **gold set** — a sample of posts you label *by hand*, that you trust as **ground truth**.\n\n" +
"## Why ground truth is the foundation of everything\n" +
"Here's the inescapable logic: **you cannot measure a model's accuracy without labels you know are correct.** 'The model is 85% accurate' means '85% agreement with ground truth.' No ground truth -> no accuracy number -> no way to compare models or know if you're improving. The gold set is the measuring stick that makes every later claim possible.\n\n" +
"## Why the pretrained labels can't be the ground truth\n" +
"You can't measure the pretrained model against its own labels — that's circular (it would score 100%). You need an *independent* source of truth, and on your specific domain, the most reliable source is a careful human (you) reading each post. The model trained on movie reviews doesn't know 'this paper is fire' is praise; you do.\n\n" +
"## Labelling well\n" +
"Be consistent: decide your rules upfront (is a neutral technical question NEUTRAL or excluded?), and apply them the same way every time. Inconsistent labels poison the gold set. Quality over quantity — 200 carefully-labelled posts beat 1000 sloppy ones.\n\n" +
"## Where this fits\n" +
"This week (v0.2): hand-label 200 posts, train your own TF-IDF + LogReg classifier on them, and discover whether your simple model beats the fancy pretrained one on YOUR data."
      ),
      S([
        { prompt: "You cannot measure a model's accuracy without a set of labels you know are correct (ground truth).", answer: true, whenRight: "Right — 'accuracy' means agreement with ground truth. No trusted labels = no accuracy number = no way to compare models.", whenWrong: "Ground truth is the measuring stick. Without labels you trust, 'accuracy' is undefined and models can't be compared.", sim: "accuracy = % agreement with ground truth\nno ground truth -> no accuracy" },
        { prompt: "You can use the pretrained model's own labels as the ground truth to score itself.", answer: false, whenRight: "Right — that's circular; it'd score 100% against itself. You need an independent source of truth: hand labels.", whenWrong: "Scoring a model against its own labels is circular (always 100%). Ground truth must be independent — hence hand-labelling.", sim: "model vs its own labels = 100% (meaningless)\nmodel vs human gold = real accuracy" },
        { prompt: "200 carefully and consistently hand-labelled posts beat 1000 sloppily-labelled ones.", answer: true, whenRight: "Right — quality over quantity. Inconsistent labels poison the gold set and corrupt every accuracy number built on it.", whenWrong: "Consistency matters more than volume. Sloppy labels make a worthless gold set. 200 careful > 1000 careless." }
      ]),
      E("Your turn — labelling rules","[WRITE] In `LABELING.md`, define your gold-set rules BEFORE labelling:\n1. Your three classes (e.g. POSITIVE / NEGATIVE / NEUTRAL) and a one-line definition of each.\n2. Two tricky edge cases and how you'll handle them (e.g. a neutral question, a sarcastic post).\n3. One sentence: why does consistency matter more than speed here?")
    ]),
    D(2,"Hand-label 200","Create the gold standard.",[
      L("The labelling process",
"## What it is\n" +
"Take a random sample of 200 posts and label each one yourself, applying the rules you defined yesterday:\n\n" +
"```python\n" +
"import pandas as pd\n" +
"df = pd.read_csv('data/labeled.csv')\n" +
"sample = df.sample(200, random_state=42)\n" +
"sample[['id','title','selftext']].to_csv('data/to_label.csv', index=False)\n" +
"# Open to_label.csv in Excel/Sheets, add a 'true_label' column, fill it in\n" +
"# Save as data/gold.csv\n" +
"```\n\n" +
"## Why a RANDOM sample\n" +
"Random (not 'the first 200' or 'the ones I find interesting') keeps the gold set representative of the whole dataset. A biased sample gives a biased accuracy estimate. `random_state=42` makes it reproducible.\n\n" +
"## The discipline of consistent labelling\n" +
"Label without looking at the model's guess — seeing the model's label first **anchors** you toward agreeing with it, defeating the purpose. Apply your rules mechanically. When you hit a genuinely ambiguous post, note it; those edge cases are informative about the task's difficulty.\n\n" +
"## Why this is the valuable, skipped step\n" +
"Hand-labelling is tedious, so most courses hand you a pre-labelled dataset. But labelling is where you truly understand your data — you see the sarcasm, the domain slang, the ambiguity that no model handles cleanly. Doing it yourself, even just 200 rows, builds intuition no tutorial can.\n\n" +
"## Where this fits\n" +
"Today you label 200 random posts by hand into `data/gold.csv` — your ground truth for the rest of the project."
      ),
      S([
        { prompt: "The gold set should be a RANDOM sample so it represents the whole dataset.", answer: true, whenRight: "Right — random keeps it representative. Cherry-picking interesting posts biases your accuracy estimate.", whenWrong: "Random sampling keeps the gold set representative. A biased sample gives a biased accuracy number.", sim: "df.sample(200, random_state=42)\n# representative, reproducible" },
        { prompt: "You should look at the model's predicted label first, then decide your own label.", answer: false, whenRight: "Right — don't. Seeing the model's guess anchors you toward agreeing, corrupting the independent ground truth.", whenWrong: "Label blind. The model's guess would anchor your judgment, defeating the point of an independent gold set.", sim: "label WITHOUT seeing model output\n# avoid anchoring bias" },
        { prompt: "Hand-labelling, though tedious, is where you build real intuition about your data's quirks.", answer: true, whenRight: "Right — you see the sarcasm, slang, and ambiguity firsthand. That intuition is something a pre-labelled set can't give.", whenWrong: "Labelling builds data intuition no tutorial provides — you confront the real ambiguity models struggle with." }
      ]),
      E("Your turn — hand-label 200","[CODE/WRITE] 1. Take a random 200-post sample (random_state=42); export id, title, selftext to to_label.csv.\n2. In Excel/Sheets, add a 'true_label' column and label each post BY HAND using your rules — without looking at the model's guess.\n3. Save as data/gold.csv.\n4. Note any posts that were genuinely hard to label.")
    ]),
    D(3,"Bag-of-words + Logistic Regression","Your own classifier, trained on your data.",[
      L("TF-IDF vectorisation and logistic regression",
"## What it is\n" +
"To train your own classifier, you turn text into numbers with **TF-IDF**, then fit a **Logistic Regression**:\n\n" +
"```python\n" +
"from sklearn.feature_extraction.text import TfidfVectorizer\n" +
"from sklearn.linear_model import LogisticRegression\n" +
"from sklearn.model_selection import train_test_split\n\n" +
"df = pd.read_csv('data/gold.csv')\n" +
"vec = TfidfVectorizer(max_features=2000, ngram_range=(1,2))\n" +
"X = vec.fit_transform(df['title'])\n" +
"y = df['true_label']\n" +
"X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=42)\n" +
"model = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)\n" +
"```\n\n" +
"## What TF-IDF does\n" +
"**Term Frequency-Inverse Document Frequency** converts each post into a numeric vector. Words that appear *everywhere* (the, is, a) get low weight; words *distinctive* to a post get high weight. `ngram_range=(1,2)` includes single words AND two-word phrases ('not good' as a unit, which matters for sentiment). `max_features=2000` keeps the 2000 most useful terms.\n\n" +
"## Why logistic regression\n" +
"It's the classic text classifier: fast, interpretable (you can read which words push toward each class — tomorrow's lesson), and a strong baseline. For bag-of-words sentiment, it's often shockingly competitive with far heavier models.\n\n" +
"## Why this can rival the transformer\n" +
"Crucially, this model trains on **your hand-labelled domain data**. It learns *your* domain's sentiment vocabulary directly — something the movie-trained pretrained model never saw. That's the whole hypothesis you'll test.\n\n" +
"## Where this fits\n" +
"Today you vectorise your gold set with TF-IDF and train a LogReg classifier on it."
      ),
      L("See it in code (with output)",
"## Train and score the baseline\n" +
"```python\n" +
"from sklearn.metrics import classification_report\n\n" +
"pred = model.predict(X_te)\n" +
"print(classification_report(y_te, pred))\n" +
"#               precision  recall  f1-score  support\n" +
"# NEGATIVE         0.78     0.82     0.80       22\n" +
"# POSITIVE         0.80     0.76     0.78       21\n" +
"#               accuracy                  0.79    50\n" +
"```\n" +
"A simple TF-IDF + LogReg, trained on 150 of your gold posts, hits ~79% on the held-out 50. The real question (Day 5): does that beat the fancy pretrained model on this same gold test set?"
      ),
      S([
        { prompt: "TF-IDF gives low weight to words that appear everywhere (the, is) and high weight to distinctive words.", answer: true, whenRight: "Right — that's the inverse-document-frequency part: ubiquitous words are uninformative, rare-to-a-doc words carry signal.", whenWrong: "TF-IDF downweights everywhere-words and upweights distinctive ones. That's what makes the vector informative.", sim: "'the' -> low weight (everywhere)\n'brilliant' -> high weight (distinctive)" },
        { prompt: "ngram_range=(1,2) lets the model treat two-word phrases like 'not good' as a single feature.", answer: true, whenRight: "Right — bigrams capture phrases single words miss. 'not good' as a unit matters hugely for sentiment.", whenWrong: "(1,2) includes bigrams, so 'not good' is one feature. Critical for sentiment, where negation flips meaning.", sim: "ngrams (1,2): 'not', 'good', 'not good'\n# 'not good' captured as a unit" },
        { prompt: "A model trained on your hand-labelled data can't possibly compete with a sophisticated pretrained transformer.", answer: false, whenRight: "Right — it can. Training on YOUR domain often beats a fancy model trained on the WRONG domain (movie reviews).", whenWrong: "It absolutely can compete. Right-domain-simple often beats wrong-domain-sophisticated. That's this week's whole point." }
      ]),
      E("Your turn — TF-IDF + LogReg","[CODE] In `01-baseline.ipynb`:\n1. Load data/gold.csv. TfidfVectorizer(max_features=2000, ngram_range=(1,2)) on the titles.\n2. train_test_split (test_size=0.25, random_state=42).\n3. Fit LogisticRegression(max_iter=1000).\n4. Print classification_report on the test set. Note your accuracy and F1.")
    ]),
    D(4,"Inspect what the model learned","Read the words that drive each class.",[
      L("Interpreting a text classifier's coefficients",
"## What it is\n" +
"A LogReg on TF-IDF is **interpretable** — each word has a coefficient per class, so you can read exactly which words push a post toward POSITIVE vs NEGATIVE:\n\n" +
"```python\n" +
"import numpy as np\n" +
"feats = vec.get_feature_names_out()\n" +
"for i, cls in enumerate(model.classes_):\n" +
"    top = np.argsort(model.coef_[i])[-10:]\n" +
"    print(cls, '->', [feats[j] for j in top])\n" +
"# NEGATIVE -> ['error', 'fails', 'wrong', 'cant', 'broken', 'help', ...]\n" +
"# POSITIVE -> ['great', 'love', 'clean', 'elegant', 'thanks', 'awesome', ...]\n" +
"```\n\n" +
"## Why this matters — trust through transparency\n" +
"You can literally see what the model learned. If the top POSITIVE words are 'great, love, elegant', the model learned something sensible. If they're random or nonsensical, the model is broken or the data is too small. This **sanity check** — does the model's reasoning make sense? — is something the pretrained transformer can't give you nearly as easily (its 'reasoning' is buried in millions of opaque parameters).\n\n" +
"## What surprises teach you\n" +
"Sometimes a word's coefficient is surprising — maybe 'paper' leans positive (people share papers they like) or a piece of domain slang shows up strongly. These surprises reveal your domain's actual sentiment vocabulary, which is exactly the knowledge the movie-trained model lacks. Reading the coefficients is reading your data through the model's eyes.\n\n" +
"## Why it matters\n" +
"Interpretability is trust. A model whose reasoning you can inspect and validate is one you can defend and improve. This is a core advantage of classical ML that's worth appreciating before you move to opaque deep models.\n\n" +
"## Where this fits\n" +
"Today you extract the top words per class and judge whether the model learned something sensible."
      ),
      S([
        { prompt: "A LogReg on TF-IDF lets you read exactly which words push a post toward each sentiment class.", answer: true, whenRight: "Right — each word has a coefficient per class. You can list the top POSITIVE and NEGATIVE words directly.", whenWrong: "It's interpretable: per-word coefficients reveal which terms drive each class. You read the model's reasoning.", sim: "POSITIVE -> great, love, elegant\nNEGATIVE -> error, broken, fails" },
        { prompt: "If the top POSITIVE words are nonsensical or random, it's a sign the model or data has a problem.", answer: true, whenRight: "Right — sensible top words (great, love) validate the model; nonsense signals a bug or too-little data.", whenWrong: "Garbage top words = red flag. Sensible ones (great, love, clean) confirm the model learned real signal." },
        { prompt: "The pretrained transformer is just as easy to interpret word-by-word as the TF-IDF LogReg.", answer: false, whenRight: "Right — no. The transformer's reasoning is buried in millions of opaque parameters. Classical ML's transparency is a real advantage.", whenWrong: "The transformer is far harder to interpret — its logic is in millions of parameters. The LogReg's readability is a genuine edge." }
      ]),
      E("Your turn — inspect the model","[CODE] In 01-baseline.ipynb:\n1. Get the vectoriser's feature names and the model's coefficients.\n2. Print the top 10 words for each sentiment class.\n3. Markdown: do the words make sense? Find one surprising word and explain what it reveals about your domain's sentiment vocabulary.")
    ]),
    D(5,"Compare baseline vs pretrained","The head-to-head on YOUR gold set.",[
      L("The decisive comparison",
"## What it is\n" +
"This is the week's payoff: score BOTH models on the **same gold test set** and see which wins on YOUR data:\n\n" +
"```python\n" +
"from sklearn.metrics import accuracy_score, f1_score\n\n" +
"# Your TF-IDF + LogReg predictions: pred_baseline\n" +
"# Pretrained pipeline predictions on the same test posts: pred_pretrained\n" +
"# True labels: y_te\n\n" +
"print('Baseline   acc:', accuracy_score(y_te, pred_baseline))\n" +
"print('Pretrained acc:', accuracy_score(y_te, pred_pretrained))\n" +
"```\n\n" +
"## Why a FAIR comparison requires the same test set\n" +
"Both models must be judged on the *identical* held-out gold posts, against the *identical* ground-truth labels. Comparing model A on one set to model B on another is meaningless. The gold set is the level playing field that makes the comparison valid. (Note: the pretrained model never trained on your gold set, so the whole gold set is fair game for it; for your model, only use its held-out test split.)\n\n" +
"## What you might find — and why it's the lesson\n" +
"Often the simple TF-IDF model **wins** on domain-specific text, because it learned your domain while the transformer learned movie reviews. Sometimes the transformer still wins on harder posts. Either way, **you now have evidence** instead of an assumption. The headline lesson of the whole week: the fanciest model is not automatically the best one for your specific problem — and the only way to know is to measure on your own labelled data.\n\n" +
"## Why it matters\n" +
"This evidence-based model selection — test candidates on your own ground truth, pick the winner — is exactly how real ML decisions get made. Defaulting to the trendiest model without measuring is how teams ship worse products.\n\n" +
"## Where this fits\n" +
"Today you run both models on the gold test set, report accuracy + F1 for each, and declare a winner with evidence."
      ),
      L("See it in code (with output)",
"## Head-to-head\n" +
"```python\n" +
"from sklearn.metrics import accuracy_score, f1_score\n\n" +
"acc_b = accuracy_score(y_te, pred_baseline)\n" +
"acc_p = accuracy_score(y_te, pred_pretrained)\n" +
"f1_b  = f1_score(y_te, pred_baseline, average='macro')\n" +
"f1_p  = f1_score(y_te, pred_pretrained, average='macro')\n" +
"print(f'Baseline   (TF-IDF+LogReg): acc={acc_b:.2f}  f1={f1_b:.2f}')\n" +
"print(f'Pretrained (DistilBERT):    acc={acc_p:.2f}  f1={f1_p:.2f}')\n" +
"# Baseline   (TF-IDF+LogReg): acc=0.79  f1=0.78\n" +
"# Pretrained (DistilBERT):    acc=0.68  f1=0.66   <- loses on your domain!\n" +
"```\n" +
"The simple model trained on your 150 gold posts beats the sophisticated movie-trained transformer by 11 points on YOUR data. Right-domain-simple beats wrong-domain-fancy — now you have the receipts."
      ),
      S([
        { prompt: "A fair model comparison requires scoring both models on the same test set against the same ground-truth labels.", answer: true, whenRight: "Right — the identical gold test set is the level playing field. Different sets make the comparison meaningless.", whenWrong: "Same test set, same labels, or the comparison is invalid. The gold set is what makes it fair.", sim: "both models -> same gold test posts\n-> same y_true -> valid comparison" },
        { prompt: "Finding that your simple model beats the pretrained transformer on your data gives you evidence, not just an opinion.", answer: true, whenRight: "Right — a measured head-to-head on ground truth IS evidence. That's how real model selection works.", whenWrong: "It's hard evidence: a fair test on your gold labels. Evidence-based selection beats defaulting to the trendiest model." },
        { prompt: "You should always pick the most sophisticated model available, regardless of how it performs on your data.", answer: false, whenRight: "Right — no. Measure on YOUR ground truth and pick the winner. Fancy-by-default ships worse products.", whenWrong: "The week's whole lesson: measure, then choose. The fanciest model isn't automatically best for your specific problem." }
      ]),
      E("Your turn — compare the models","[CODE] In 01-baseline.ipynb:\n1. Get pretrained-model predictions on the SAME gold test posts your baseline was evaluated on.\n2. Compute accuracy + macro-F1 for both your TF-IDF+LogReg and the pretrained model.\n3. Print them side by side.\n4. Markdown: which wins on YOUR data, by how much, and why do you think that is?")
    ]),
    D(6,"Save the baseline","Persist the model and vectoriser together.",[
      L("Serialising a text model — model AND vectoriser",
"## What it is\n" +
"Save your trained classifier so later versions (and the eventual API) can load it without retraining. The catch with text models: you must save **both** the model and the vectoriser:\n\n" +
"```python\n" +
"import joblib\n" +
"joblib.dump(model, 'models/baseline.pkl')\n" +
"joblib.dump(vec,   'models/vectorizer.pkl')\n" +
"```\n\n" +
"## Why the vectoriser must be saved too\n" +
"This is the subtle, important point. Your model predicts on TF-IDF **vectors**, not raw text. The vectoriser holds the learned vocabulary and IDF weights that turn text into those exact vectors. If you save only the model, you cannot reproduce the vectors it expects — new text would be vectorised differently (or not at all). **The model and its vectoriser are a matched pair; one is useless without the other.**\n\n" +
"```text\n" +
"new text -> vectorizer.transform() -> vector -> model.predict() -> label\n" +
"           ^ MUST be the SAME fitted vectoriser\n" +
"```\n\n" +
"## The general principle: save the whole preprocessing pipeline\n" +
"This generalises beyond text. Any model that depends on a fitted transformation (a scaler, an encoder, a vectoriser) must have that transformation saved alongside it. A common production bug is saving the model but losing the preprocessing, so the deployed model silently receives differently-processed inputs. Saving them together prevents it. (sklearn's `Pipeline` object bundles them, which you'll meet later.)\n\n" +
"## Where this fits\n" +
"Today you save both baseline.pkl and vectorizer.pkl — the matched pair your v0.3+ work will load."
      ),
      L("See it in code (with output)",
"## Save and verify the pair\n" +
"```python\n" +
"import joblib, os\n" +
"os.makedirs('models', exist_ok=True)\n" +
"joblib.dump(model, 'models/baseline.pkl')\n" +
"joblib.dump(vec,   'models/vectorizer.pkl')\n\n" +
"# Verify the round-trip: load both, predict on new text\n" +
"m = joblib.load('models/baseline.pkl')\n" +
"v = joblib.load('models/vectorizer.pkl')\n" +
"x = v.transform(['this implementation is clean and fast'])\n" +
"print(m.predict(x))\n" +
"# ['POSITIVE']   <- model + vectoriser working together\n" +
"```\n" +
"The reloaded pair classifies new text correctly. Save only the model and that `v.transform` step would be impossible — the model would have no way to turn text into the vectors it expects."
      ),
      S([
        { prompt: "For a text model, you must save BOTH the classifier and the fitted vectoriser.", answer: true, whenRight: "Right — they're a matched pair. The vectoriser turns text into the exact vectors the model expects; one's useless without the other.", whenWrong: "Save both. The model predicts on vectors; only the fitted vectoriser produces them correctly. Model alone is unusable.", sim: "text -> vectorizer -> vector -> model -> label\n# need BOTH saved" },
        { prompt: "Saving only the model (not the vectoriser) is fine because you can re-fit a new vectoriser later.", answer: false, whenRight: "Right — no. A re-fit vectoriser has different vocabulary/weights, producing different vectors. The model would get wrong inputs.", whenWrong: "A new vectoriser won't match. It'd have different vocab/IDF, so the vectors differ and the model misbehaves. Save the original.", sim: "re-fit vectoriser != original\n-> different vectors -> broken predictions" },
        { prompt: "The principle 'save the preprocessing alongside the model' applies to scalers and encoders too, not just vectorisers.", answer: true, whenRight: "Right — any fitted transformation must travel with the model. Losing it is a classic production bug.", whenWrong: "It generalises: scalers, encoders, vectorisers — any fitted transform must be saved with the model. (sklearn Pipeline bundles them.)" }
      ]),
      E("Your turn — save the baseline","[CODE] 1. joblib.dump your LogReg to models/baseline.pkl and the vectoriser to models/vectorizer.pkl.\n2. Reload BOTH, vectorise a new sentence, and predict — confirm it works end to end.\n3. Markdown: in one sentence, why would saving only the model break prediction on new text?")
    ]),
    D(7,"Tag v0.2","Ship the gold set + classical baseline.",[
      L("Shipping v0.2 — evidence over assumption",
"## What it is\n" +
"v0.2 ships a hand-labelled gold set, a trained classical model, and — most importantly — **evidence** about which model is better on your domain. Closing it:\n\n" +
"```bash\n" +
"git add . && git commit -m 'v0.2: hand-labeled gold set + TF-IDF baseline'\n" +
"git tag v0.2 && git push && git push --tags\n" +
"```\n\n" +
"## The README finding that sets this project apart\n" +
"Most sentiment projects stop at 'I ran a pretrained model'. Yours states a measured result:\n" +
"```text\n" +
"## v0.2 finding\n" +
"On a 200-post hand-labelled gold set, a simple TF-IDF + Logistic\n" +
"Regression trained on this domain's data scored 79% accuracy,\n" +
"beating the pretrained DistilBERT (68%) by 11 points — because\n" +
"the pretrained model learned movie-review sentiment, not ML-community language.\n" +
"```\n" +
"That sentence demonstrates the single most valuable instinct in applied ML: **measure on your own data before trusting a model.** It shows a reviewer you don't cargo-cult the trendy choice.\n\n" +
"## Why v0.2 is the intellectual core of Project 2\n" +
"v0.1 was setup. v0.3 (fine-tuning) is fancier. But v0.2 is where the *thinking* happens — building ground truth, training a fair competitor, and letting evidence overturn the assumption that the fancy model must be best. That reasoning, not the code, is what makes you a data scientist rather than a model-runner.\n\n" +
"## Where this fits\n" +
"Today you write the evidence-based finding into the README and tag v0.2. Next week: fine-tune DistilBERT on your gold set and see if the transformer, trained on YOUR data, finally pulls ahead."
      ),
      S([
        { prompt: "v0.2's key deliverable is evidence about which model is better on your domain, not just code that runs.", answer: true, whenRight: "Right — the measured head-to-head on your gold set is the real output. The thinking is the deliverable.", whenWrong: "The evidence (which model wins on your data, and why) is the point. That reasoning is what v0.2 contributes.", sim: "v0.2 = gold set + fair test + a measured finding" },
        { prompt: "Stating a measured finding ('beat pretrained by 11 points') in the README signals strong applied-ML instinct.", answer: true, whenRight: "Right — it shows you measure before trusting a model, the opposite of cargo-culting the trendy choice.", whenWrong: "A measured finding demonstrates the core instinct: validate on your own data. It's what separates you from a model-runner." },
        { prompt: "v0.2 is just routine setup; the real intellectual work of Project 2 is the fancy fine-tuning in v0.3.", answer: false, whenRight: "Right — reversed. v0.2 (ground truth + fair comparison + evidence) is the intellectual core. v0.3 is fancier but builds on this thinking.", whenWrong: "v0.2 IS the core thinking: building ground truth and letting evidence overturn an assumption. v0.3 is fancier, not deeper." }
      ]),
      E("Your turn — ship v0.2","[PRODUCE] 1. Add a 'v0.2 finding' section to the README with your measured result (accuracy of both models, the winner, and WHY).\n2. Commit + tag:\n`git add . && git commit -m 'v0.2: hand-labeled gold set + TF-IDF baseline'`\n`git tag v0.2 && git push && git push --tags`\n\nPASS:\n[x] 200 hand-labelled gold rows in data/gold.csv\n[x] TF-IDF + LogReg trained on the gold set\n[x] Top words per class inspected\n[x] Baseline vs pretrained compared on the same test set\n[x] Both model + vectoriser saved\n[x] Evidence-based finding in the README\n[x] v0.2 tag pushed")
    ])
  ]
};

// Validate and write
const newWeeks = [W10, W11, W12, W13];
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
ds.weeks.splice(9, 4, ...newWeeks);  // replace index 9,10,11,12 (W10,W11,W12,W13)
fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log('SUCCESS: W10-W13 written. Total weeks:', ds.weeks.length);
newWeeks.forEach(w =>
  console.log(`  W${w.number} "${w.title}": ${w.days.length} days, ${w.concept_check.length} concept_check Qs`)
);
