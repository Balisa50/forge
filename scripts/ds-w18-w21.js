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

/* ════ WEEK 18 — Reddit Sentiment v0.4: Live dashboard ════ */
const W18 = {
  number: 18, title: "Reddit Sentiment v0.4: Live dashboard",
  phase: "NLP", commitment_hours: "12-18",
  context: ds.weeks[17].context,
  concept_check: [
    { q: "What makes a dashboard different from the notebooks you've been working in?",
      choices: ["Dashboards are faster","A dashboard is for OTHER people — non-technical users interact with your model without seeing code",
        "Dashboards can't show charts","Notebooks can't load models"],
      correct: 1, explain: "A notebook is your workspace. A dashboard is a product: someone who can't code clicks a button, your model runs, and they see results. It turns your work from 'I can do this' into 'anyone can use this.'" },
    { q: "Why extract your scraping and prediction logic into separate functions/modules?",
      choices: ["It looks neater","So both the notebook AND the dashboard can import and reuse the same code — no copy-paste, one source of truth",
        "Streamlit requires it","To make the model smaller"],
      correct: 1, explain: "If scrape and predict live in importable modules, the dashboard calls the exact same functions your notebooks use. Copy-pasting logic into the app means two versions that drift apart. One source of truth keeps them consistent." },
    { q: "Why cache the live results and keep a history file?",
      choices: ["To use more disk","So you can show a trend over time (e.g. negative-sentiment rising) and avoid re-scoring on every interaction",
        "Caching is required by Reddit","History makes the model more accurate"],
      correct: 1, explain: "Caching avoids re-running the model on every rerun (Streamlit reruns the whole script per interaction). A history file lets the dashboard show change over time — far more insightful than a single snapshot." }
  ],
  days: [
    D(1,"Plan the live dashboard","From offline notebooks to a one-button live tool.",[
      L("Taking the model live",
"## What it is\n" +
"Everything in Project 2 so far has been **offline** — static files, local notebooks, results only you can see. This week the model goes **live**: one button pulls the 50 newest r/ML posts, scores each with your fine-tuned model, and shows the sentiment breakdown. A non-technical person can use it without ever seeing your code.\n\n" +
"## Plan before you build (same as TaxiPulse's explorer)\n" +
"Decide the user's experience first:\n" +
"- **The action:** click 'Refresh' → scrape + score the latest posts\n" +
"- **The outputs:** a sentiment bar chart, the most positive/negative posts, and a trend over time\n" +
"- **The one job:** 'see the live mood of r/ML at a glance'\n\n" +
"## Why this is a different kind of deliverable\n" +
"A fine-tuned model in a repo proves you *can* build. A live dashboard proves you can put a model in front of real users and make it useful. Those are different skills, and the second is rarer. It's also what makes the project *demoable* — you can screen-share it, link it, show it in an interview.\n\n" +
"## The architecture decision (today's real work)\n" +
"To build this cleanly, your scraping and prediction logic must live in **importable functions**, not buried in notebook cells. The dashboard will `from scrape import fetch_latest` and `from predict import predict`. Planning that module split now saves you copy-pasting (and later, drift) — it's the foundation the rest of the week builds on.\n\n" +
"## Where this fits\n" +
"Today you sketch the dashboard (inputs, outputs, one job) and plan how to extract scrape/predict into reusable modules."
      ),
      L("Designing for reuse — extract the logic",
"## The module split\n" +
"```text\n" +
"scrape.py    -> def fetch_latest(n) -> list[post]   # the Week-12 scraping logic\n" +
"predict.py   -> def predict(texts)  -> list[label]  # loads the fine-tuned model\n" +
"app.py       -> imports both, renders the UI\n" +
"```\n\n" +
"## Why this matters beyond tidiness\n" +
"Right now your scraping code is probably inside `scrape.py` as a script and your prediction inside a notebook. If you copy-paste those into the Streamlit app, you now have **two copies** that will drift — you'll fix a bug in one and forget the other. Extracting them into functions that *both* the notebook and the app import gives you **one source of truth**.\n\n" +
"This is a real engineering habit (DRY — Don't Repeat Yourself), and it's the difference between a project that stays maintainable and one that rots. The dashboard is the forcing function that makes you do it.\n\n" +
"## Where this fits\n" +
"Plan the function signatures today; you'll implement `predict()` tomorrow and wire the app on Day 3."
      ),
      S([
        { prompt: "A dashboard's purpose is to let non-technical people use your model without seeing the code.", answer: true, whenRight: "Right — a notebook is your workspace; a dashboard is a product others operate. Different, rarer skill.", whenWrong: "That's the point of a dashboard: a usable product for non-coders, not a workspace for you." },
        { prompt: "Copy-pasting your scrape/predict logic into the app is fine for a small project.", answer: false, whenRight: "Right — no. Two copies drift. Extract into importable functions so the notebook and app share one source of truth.", whenWrong: "Copy-paste creates drift (fix one, forget the other). Import shared functions — one source of truth (DRY).", sim: "scrape.py: fetch_latest()\npredict.py: predict()\napp.py: imports both" },
        { prompt: "Planning the inputs, outputs, and one job before coding keeps the dashboard focused.", answer: true, whenRight: "Right — same lesson as the TaxiPulse explorer. Decide the user experience first, then build.", whenWrong: "Plan first. Deciding the one job ('live mood of r/ML') stops the app sprawling into a mess of widgets." }
      ]),
      E("Your turn — plan the dashboard","[WRITE] In `DASHBOARD.md`:\n1. The action, the outputs, and the one-sentence job of the dashboard.\n2. The function signatures you'll extract: fetch_latest(n) and predict(texts).\n3. One sentence: why does extracting these into modules (vs copy-paste) matter?")
    ]),
    D(2,"Build the inference function","A clean predict() that loads the model once.",[
      L("Wrapping the model in a reusable predict()",
"## What it is\n" +
"Extract your prediction logic into `predict.py` — a function that takes a list of texts and returns labels, loading the model once at import:\n\n" +
"```python\n" +
"import torch\n" +
"from transformers import AutoTokenizer, AutoModelForSequenceClassification\n\n" +
"MODEL = 'models/distilbert'\n" +
"tok = AutoTokenizer.from_pretrained(MODEL)\n" +
"model = AutoModelForSequenceClassification.from_pretrained(MODEL)\n" +
"LABELS = ['NEGATIVE', 'NEUTRAL', 'POSITIVE']\n\n" +
"def predict(texts):\n" +
"    inputs = tok(texts, return_tensors='pt', truncation=True, padding=True)\n" +
"    with torch.no_grad():\n" +
"        logits = model(**inputs).logits\n" +
"    return [LABELS[i] for i in logits.argmax(dim=1).tolist()]\n" +
"```\n\n" +
"## Two things that matter here\n" +
"1. **Load the model at module level (once)** — not inside `predict()`. Importing the module loads the model a single time; every `predict()` call reuses it. Loading per-call would re-read 250MB from disk every time.\n" +
"2. **`torch.no_grad()`** — tells PyTorch you're only doing inference, not training, so it skips tracking gradients. This makes prediction faster and uses less memory. Forgetting it works but wastes resources.\n\n" +
"## Why a clean function pays off\n" +
"`predict(texts) -> labels` is a tiny, testable interface. The notebook can import it, the dashboard can import it, and next week the API can wrap it. One well-shaped function serves every consumer — the reuse you planned yesterday, realised.\n\n" +
"## Where this fits\n" +
"Today you build and test `predict.py`. Tomorrow the dashboard imports it."
      ),
      L("See it in code (with output)",
"## Test the inference function\n" +
"```python\n" +
"from predict import predict\n\n" +
"print(predict([\n" +
"    'this library is beautifully designed',\n" +
"    'reproducibility is broken again',\n" +
"    'anyone know a good optimizer?',\n" +
"]))\n" +
"# ['POSITIVE', 'NEGATIVE', 'NEUTRAL']\n" +
"```\n" +
"A clean batch interface: a list of texts in, a list of labels out. The model loaded once when the module was imported; these three predictions reused it. This same function will power the dashboard and, next week, the API."
      ),
      S([
        { prompt: "The model should be loaded once at module level, not inside the predict() function.", answer: true, whenRight: "Right — import loads it once; every predict() reuses it. Loading per-call re-reads 250MB each time.", whenWrong: "Load at module level. Inside predict() it would reload the model on every call — needlessly slow.", sim: "model = ...from_pretrained(MODEL)  # module level\ndef predict(texts): model(...)     # reuses it" },
        { prompt: "torch.no_grad() during inference makes prediction faster and use less memory.", answer: true, whenRight: "Right — it skips gradient tracking (only needed for training), saving compute and memory.", whenWrong: "no_grad() tells PyTorch not to track gradients during inference — faster, lighter. Always use it for prediction." },
        { prompt: "A clean predict(texts) -> labels function can be reused by the notebook, the dashboard, and the API.", answer: true, whenRight: "Right — one well-shaped interface serves every consumer. That reuse is exactly the DRY payoff.", whenWrong: "That tiny interface is reusable everywhere: notebook, dashboard, and next week's API all call the same predict()." }
      ]),
      E("Your turn — build predict()","[CODE] Create `predict.py`:\n1. Load your fine-tuned model + tokenizer at module level.\n2. Write predict(texts) that returns a list of labels, using torch.no_grad().\n3. Test it on 3 sentences and confirm sensible labels.\n4. Confirm the model loads only once (add a print at module level and import twice).")
    ]),
    D(3,"Build the Streamlit dashboard skeleton","One button: scrape + score live.",[
      L("The dashboard skeleton",
"## What it is\n" +
"Wire the reusable functions into a Streamlit app with a single Refresh button:\n\n" +
"```python\n" +
"import streamlit as st\n" +
"from scrape import fetch_latest\n" +
"from predict import predict\n\n" +
"st.title('r/ML Sentiment — Live')\n\n" +
"if st.button('Refresh'):\n" +
"    with st.spinner('Scraping + scoring...'):\n" +
"        posts = fetch_latest(50)\n" +
"        labels = predict([p['title'] for p in posts])\n" +
"        for p, lab in zip(posts, labels):\n" +
"            p['sentiment'] = lab\n" +
"        st.session_state['posts'] = posts\n" +
"    st.success(f'Scored {len(posts)} posts')\n" +
"```\n\n" +
"## Two Streamlit patterns at work\n" +
"1. **`st.spinner`** — shows a loading indicator during the slow scrape+score, so the user knows it's working rather than frozen. Always wrap a slow operation in a spinner.\n" +
"2. **`st.session_state`** — Streamlit reruns the whole script on every interaction (the model from Week 9). Without saving results to `session_state`, the scored posts would vanish on the next rerun. session_state is how you persist data across reruns.\n\n" +
"## Why the import pays off immediately\n" +
"Notice the app is tiny — it imports `fetch_latest` and `predict` and just orchestrates them. All the real logic lives in the reusable modules. The dashboard is pure presentation. That clean separation (logic in modules, presentation in the app) is exactly what made the day-1 planning worth it.\n\n" +
"## Where this fits\n" +
"Today you build the skeleton: a button that scrapes, scores, and stores the results in session_state. Tomorrow you add the charts."
      ),
      L("See it in code (with output)",
"## The skeleton running\n" +
"```text\n" +
"streamlit run app.py\n" +
"# Click 'Refresh':\n" +
"#   [spinner] Scraping + scoring...\n" +
"#   ✓ Scored 50 posts\n" +
"# 50 posts with sentiment now in st.session_state['posts']\n" +
"```\n" +
"The slow work (scrape + 50 model predictions) runs behind a spinner, and the results persist in session_state so the charts you add tomorrow can read them without re-scoring."
      ),
      S([
        { prompt: "st.session_state is needed because Streamlit reruns the whole script on every interaction.", answer: true, whenRight: "Right — without saving to session_state, the scored posts vanish on the next rerun. It persists data across reruns.", whenWrong: "Streamlit reruns top-to-bottom each interaction. session_state is how results survive between reruns.", sim: "st.session_state['posts'] = posts\n# survives the next rerun" },
        { prompt: "st.spinner shows the user a loading indicator during a slow operation.", answer: true, whenRight: "Right — wrap slow work (scrape + score) in a spinner so the app looks busy, not frozen.", whenWrong: "st.spinner signals work-in-progress. Without it, a slow scrape looks like a frozen app." },
        { prompt: "The dashboard should contain the full scraping and model code inline, not imports.", answer: false, whenRight: "Right — no. It imports fetch_latest and predict and just orchestrates. Logic in modules, presentation in the app.", whenWrong: "Keep the app thin: import the logic, orchestrate it. Inlining everything recreates the copy-paste drift problem." }
      ]),
      E("Your turn — build the skeleton","[CODE] Create `app.py`:\n1. Import fetch_latest and predict.\n2. Add a Refresh button that, inside st.spinner, scrapes 50 posts, scores them, and stores them in st.session_state['posts'].\n3. Run it and confirm the button scrapes + scores live.")
    ]),
    D(4,"Add the charts","Turn scored posts into an at-a-glance view.",[
      L("Visualising the live sentiment",
"## What it is\n" +
"Read the scored posts from session_state and render the breakdown:\n\n" +
"```python\n" +
"import pandas as pd\n" +
"posts = st.session_state.get('posts', [])\n" +
"if posts:\n" +
"    df = pd.DataFrame(posts)\n" +
"    st.bar_chart(df['sentiment'].value_counts())\n\n" +
"    col1, col2 = st.columns(2)\n" +
"    with col1:\n" +
"        st.subheader('Most negative')\n" +
"        for _, r in df[df['sentiment']=='NEGATIVE'].head(5).iterrows():\n" +
"            st.write('•', r['title'])\n" +
"    with col2:\n" +
"        st.subheader('Most positive')\n" +
"        for _, r in df[df['sentiment']=='POSITIVE'].head(5).iterrows():\n" +
"            st.write('•', r['title'])\n" +
"```\n\n" +
"## Why show examples, not just the chart\n" +
"The bar chart gives the *summary* (15 negative, 25 neutral, 10 positive). But a chart alone is abstract. Showing the actual most-negative and most-positive **post titles** makes it concrete and credible — the user can read a flagged post and judge whether your model got it right. Summary + examples is far more convincing than either alone.\n\n" +
"## st.columns for layout\n" +
"`st.columns(2)` puts the negative and positive lists side by side — a small touch that makes the dashboard scannable. Good layout is part of making a tool people actually want to use.\n\n" +
"## The `if posts:` guard\n" +
"On first load (before any Refresh), session_state is empty. The `if posts:` guard prevents the charts from erroring on no data — the app shows just the button until the user clicks it. Handling the empty state is basic but essential UX.\n\n" +
"## Where this fits\n" +
"Today you add the bar chart and the most-positive/negative lists, guarded for the empty state."
      ),
      S([
        { prompt: "Showing the actual most-positive/negative post titles (not just a chart) makes the dashboard more credible.", answer: true, whenRight: "Right — examples let the user read a flagged post and judge the model. Summary + examples beats either alone.", whenWrong: "Concrete examples make it credible — the user can verify the model's calls. A bare chart is abstract." },
        { prompt: "The `if posts:` guard prevents the charts from erroring before the user has clicked Refresh.", answer: true, whenRight: "Right — session_state is empty on first load; the guard shows just the button until there's data.", whenWrong: "It handles the empty state. Without it, the charts try to render no data and error on first load." },
        { prompt: "st.columns lets you place the positive and negative lists side by side.", answer: true, whenRight: "Right — a small layout touch that makes the breakdown scannable. Good layout makes a tool people use.", whenWrong: "st.columns(2) creates side-by-side panels. Layout matters for a usable, scannable dashboard." }
      ]),
      E("Your turn — add charts","[CODE] In app.py:\n1. Read posts from session_state (guard with `if posts:`).\n2. Render a bar chart of sentiment value_counts.\n3. Use st.columns(2) to show the top 5 most-negative and most-positive titles side by side.\n4. Confirm the empty state (before Refresh) doesn't error.")
    ]),
    D(5,"Cache + history","Avoid re-scoring; show a trend over time.",[
      L("Caching and a history trend",
"## What it is\n" +
"Two upgrades that make the dashboard fast and insightful:\n\n" +
"**1. Cache the model load** (the Week-9 lesson) so it doesn't reload on every rerun:\n" +
"```python\n" +
"@st.cache_resource\n" +
"def get_predict():\n" +
"    from predict import predict\n" +
"    return predict\n" +
"```\n\n" +
"**2. Append each refresh to a history file** so you can show change over time:\n" +
"```python\n" +
"import pandas as pd, datetime\n" +
"counts = df['sentiment'].value_counts().to_dict()\n" +
"row = {'time': datetime.datetime.now().isoformat(), **counts}\n" +
"hist = pd.concat([_load_history(), pd.DataFrame([row])])\n" +
"hist.to_csv('history.csv', index=False)\n" +
"st.line_chart(hist.set_index('time')['NEGATIVE'])\n" +
"```\n\n" +
"## Why a trend beats a snapshot\n" +
"A single refresh tells you the mood *right now*. A history of refreshes tells you the mood is *changing* — 'negative sentiment is climbing this week' is a finding; '30% negative right now' is just a number. Tracking change over time turns a status display into something that surfaces patterns. That's a meaningful step up in analytical value.\n\n" +
"## The caching reminder\n" +
"Every interaction reruns the whole script (Streamlit's model). Without `@st.cache_resource`, your 250MB model would reload from disk on every button click — the app would crawl. Caching the model load is what keeps it responsive.\n\n" +
"## Where this fits\n" +
"Today you cache the model and add a history file + trend chart. Tomorrow you deploy."
      ),
      S([
        { prompt: "A trend over time (history) is more insightful than a single live snapshot.", answer: true, whenRight: "Right — 'negative sentiment is climbing' is a finding; '30% negative now' is just a number. Change reveals patterns.", whenWrong: "Tracking over time surfaces patterns a snapshot can't. A trend is an analytical step up from a status display." },
        { prompt: "Without @st.cache_resource, the 250MB model reloads on every button click, making the app crawl.", answer: true, whenRight: "Right — every interaction reruns the script. Caching loads the model once and reuses it across reruns.", whenWrong: "Yes — uncached, the rerun model reloads the 250MB model each click. Cache it to stay responsive.", sim: "@st.cache_resource -> model loads once" },
        { prompt: "Appending each refresh's counts to history.csv lets you render a sentiment-over-time line chart.", answer: true, whenRight: "Right — accumulate timestamped counts, then line_chart the trend. Change over time, visualised.", whenWrong: "That's how you build the trend: log counts per refresh, then chart the column over time." }
      ]),
      E("Your turn — cache + history","[CODE] In app.py:\n1. Cache the model/predict load with @st.cache_resource.\n2. On each refresh, append a timestamped row of sentiment counts to history.csv.\n3. Render a line chart of NEGATIVE count over time.\n4. Confirm repeated refreshes build the trend and the app stays responsive.")
    ]),
    D(6,"Deploy the dashboard","Put it on a public URL.",[
      L("Deploying the live dashboard",
"## What it is\n" +
"Deploy to Streamlit Community Cloud (same as TaxiPulse v0.5), with the wrinkles a model-backed app brings:\n\n" +
"1. Push `app.py`, `scrape.py`, `predict.py`, `models/` (via Git LFS), and `requirements.txt`\n" +
"2. Add your **Reddit API secrets** to Streamlit Cloud's secrets manager (never commit them)\n" +
"3. Deploy → public `.streamlit.app` URL\n\n" +
"## The model-size constraint\n" +
"Streamlit Cloud's free tier has ~1GB RAM. Your DistilBERT model (~250MB loaded, more in memory during inference) may be tight. Two mitigations:\n" +
"- If it fits: great, the fine-tuned model serves live.\n" +
"- If it OOMs (out-of-memory): **fall back to the lighter scikit baseline** for the deployed version. A slightly-less-accurate model that's actually live beats a better model that crashes the app.\n\n" +
"That trade-off — shipping the model that *fits the constraints* over the theoretically-best one — is a real production decision you'll make constantly.\n\n" +
"## Secrets management\n" +
"Your scraper needs Reddit credentials. They go in Streamlit Cloud's **secrets manager** (a secure key-value store), read via `st.secrets`, never in the committed code. Same discipline as `.env` locally — the platform just provides the secure store for you.\n\n" +
"## Where this fits\n" +
"Today you deploy the dashboard, configure secrets, and handle the model-size constraint. The result: a live, linkable sentiment tool."
      ),
      RD("Streamlit secrets management","https://docs.streamlit.io/develop/concepts/connections/secrets-management","Click 'Open'. How to store API keys securely in Streamlit Cloud (read via st.secrets), never committed."),
      S([
        { prompt: "If the fine-tuned model OOMs on the free tier, shipping the lighter baseline that actually runs is a valid call.", answer: true, whenRight: "Right — a live, slightly-less-accurate model beats a better one that crashes. Fit the constraints.", whenWrong: "Shipping what fits is a real production trade-off. A working baseline beats a crashing transformer.", sim: "DistilBERT OOMs -> fall back to scikit baseline\n# live > theoretically-best-but-down" },
        { prompt: "Reddit API secrets should go in Streamlit Cloud's secrets manager, not the committed code.", answer: true, whenRight: "Right — same discipline as .env locally. Read via st.secrets; never commit credentials.", whenWrong: "Secrets go in the platform's secrets manager (st.secrets), never in git. Same rule as .env." },
        { prompt: "The model files can be pushed normally to GitHub for the deploy, ignoring Git LFS.", answer: false, whenRight: "Right — no. The ~250MB model needs Git LFS (from Week 15). Normal commit bloats the repo and may hit limits.", whenWrong: "Large model files need Git LFS. You set that up in Week 15 — the deploy pushes the LFS objects." }
      ]),
      E("Your turn — deploy","[PRODUCE] 1. Push app.py, scrape.py, predict.py, models/ (LFS), requirements.txt.\n2. On Streamlit Cloud: add Reddit secrets to the secrets manager; deploy.\n3. If it OOMs, switch the deployed predict() to the scikit baseline and redeploy.\n4. Confirm the live URL scrapes + scores. Note which model you shipped and why.")
    ]),
    D(7,"Ship Reddit Sentiment v0.4","Tag the live-dashboard milestone.",[
      L("Shipping v0.4 — a live, demoable product",
"## What it is\n" +
"v0.4 ships a live sentiment dashboard. Update the README and tag:\n\n" +
"```text\n" +
"## v0.4 — Live dashboard\n" +
"Live: https://reddit-sentiment.streamlit.app\n" +
"One click scrapes the 50 newest r/ML posts, scores them with the fine-tuned\n" +
"DistilBERT, and shows the sentiment breakdown + a trend over time.\n" +
"```\n" +
"```bash\n" +
"git add . && git commit -m 'v0.4: live sentiment dashboard'\n" +
"git tag v0.4 && git push && git push --tags\n" +
"```\n\n" +
"## Why a live demo is worth disproportionately more\n" +
"A recruiter or interviewer can *click your link and use your model* in ten seconds. That experience lands harder than any amount of code. 'Here's my live r/ML sentiment dashboard' is a sentence that ends with them nodding, not squinting at a notebook. The live link is the single highest-leverage thing in the project.\n\n" +
"## The clean-architecture payoff, realised\n" +
"Because you extracted `scrape.py` and `predict.py` into reusable modules (Day 1), next week's API can import the *exact same* `predict()` — no rewrite. The dashboard and the API will share one inference function. That foresight is about to pay off directly.\n\n" +
"## Where this fits\n" +
"Today you tag v0.4. Next week you split the stack — moving the model behind a proper REST API + Docker (v0.5), so multiple frontends can share it."
      ),
      S([
        { prompt: "A live, clickable demo lands harder with recruiters than the same work shown as a notebook.", answer: true, whenRight: "Right — they use your model in ten seconds. The experience beats reading code every time.", whenWrong: "A live link is the highest-leverage artifact: they interact with your work instead of squinting at code." },
        { prompt: "Because predict() lives in a reusable module, next week's API can import the exact same function.", answer: true, whenRight: "Right — the Day-1 module split pays off: dashboard and API share one inference function, no rewrite.", whenWrong: "That's the payoff of clean architecture: the API reuses the same predict() the dashboard uses." },
        { prompt: "v0.4 represents the same skill as v0.3 (fine-tuning), just repackaged.", answer: false, whenRight: "Right — no. v0.3 was modelling; v0.4 is productization (live, usable by non-coders). Different, complementary skills.", whenWrong: "Different skill: v0.3 built the model, v0.4 ships it as a live product. Both matter, separately." }
      ]),
      E("Your turn — ship v0.4","[PRODUCE] 1. Add a 'v0.4 — Live dashboard' README section with the live link and one-line description.\n2. Commit + tag:\n`git add . && git commit -m 'v0.4: live sentiment dashboard'`\n`git tag v0.4 && git push && git push --tags`\n\nPASS:\n[x] Dashboard scrapes + scores live\n[x] Bar chart + most pos/neg lists\n[x] History trend chart\n[x] Deployed to a public URL\n[x] README links the live app\n[x] v0.4 tag pushed")
    ])
  ]
};

/* ════ WEEK 19 — Reddit Sentiment v0.5: REST API + Docker ════ */
const W19 = {
  number: 19, title: "Reddit Sentiment v0.5: REST API + Docker",
  phase: "Production", commitment_hours: "12-18",
  context: ds.weeks[18].context,
  concept_check: [
    { q: "Why split the model out into its own API instead of loading it inside the Streamlit app?",
      choices: ["APIs are trendier","So multiple frontends (web, mobile, scheduled jobs) can share ONE model service instead of each loading their own copy",
        "Streamlit can't load models","APIs are always faster"],
      correct: 1, explain: "When the model lives in the Streamlit process, anything else that wants predictions must import the model too. A standalone API means the model runs in one place and any client — the dashboard, a mobile app, a cron job — calls it over HTTP. One model, many consumers." },
    { q: "What problem does Docker solve for deploying your API?",
      choices: ["It makes the model more accurate","It packages your code + dependencies + environment into one image that runs identically anywhere — no 'works on my machine'",
        "It replaces Python","It speeds up training"],
      correct: 1, explain: "A Docker image bundles your app, its libraries, and the OS-level environment into one reproducible unit. The same image runs on your laptop, a teammate's machine, and the cloud — eliminating environment drift that breaks deployments." },
    { q: "Why is FastAPI a common choice for serving ML models?",
      choices: ["It's the only option","It's fast, has automatic request validation (Pydantic) and auto-generated docs — ideal for typed JSON ML endpoints",
        "It trains models for you","It requires no code"],
      correct: 1, explain: "FastAPI validates incoming JSON against a typed schema (Pydantic) automatically, generates interactive docs, and is high-performance. For an ML endpoint taking structured input and returning predictions, that validation + docs combination is a strong fit." }
  ],
  days: [
    D(1,"Why split the stack","One model service, many consumers.",[
      L("Separating the model from the UI",
"## What it is\n" +
"Last week your Streamlit app loaded the 250MB model **inside the same process** that rendered the UI. That's fine for one app with one user. It breaks the moment you want a *second* consumer — a mobile app, a scheduled job, another team's tool. Each would have to import your model too, or copy it.\n\n" +
"The fix is **separation of concerns**: the model gets its own **API service**, and any frontend calls it over HTTP:\n\n" +
"```text\n" +
"BEFORE:  [Streamlit + model in one process]\n\n" +
"AFTER:   [Model API service]  <--HTTP--  [Streamlit dashboard]\n" +
"                              <--HTTP--  [mobile app]\n" +
"                              <--HTTP--  [scheduled job]\n" +
"```\n\n" +
"## Why this is the production pattern\n" +
"One model, loaded once, behind one endpoint — every client shares it. You can scale the model service independently, update the model without touching the frontends, and let any language/platform consume it (HTTP is universal). This **client/server split** is how real ML systems are built; the model is a service, not a library each app embeds.\n\n" +
"## The week's plan\n" +
"FastAPI endpoint (Day 2) → test it (Day 3) → Dockerize it (Day 4) → deploy to Hugging Face Spaces (Day 5) → point the Streamlit dashboard at the API instead of loading the model itself (Day 6). The dashboard becomes lightweight; the model lives in one place.\n\n" +
"## Where this fits\n" +
"Today you plan the split and articulate why a standalone model service beats embedding the model in every app."
      ),
      L("The reuse you set up is about to pay off",
"## predict() becomes the API's core\n" +
"Because you extracted `predict(texts) -> labels` into a reusable module in Week 18, the API is almost trivial — it just wraps that function in an HTTP endpoint:\n\n" +
"```text\n" +
"predict.py (already exists)  ->  api.py wraps it in POST /predict\n" +
"```\n\n" +
"You're not rewriting inference; you're exposing the function you already have over HTTP. That's the dividend of the clean architecture you built last week. Had you inlined the model into the Streamlit app, you'd be untangling it now.\n\n" +
"## The mental model: thin API over reused logic\n" +
"A good API endpoint is thin — parse the request, call your existing logic, return the response. The intelligence lives in `predict()`; the API is just the HTTP doorway to it. Keeping that boundary clean means the same `predict()` serves the dashboard (last week), the API (this week), and anything future."
      ),
      S([
        { prompt: "Putting the model in its own API lets multiple frontends share one model service.", answer: true, whenRight: "Right — model loaded once, behind one endpoint; dashboard, mobile, and jobs all call it over HTTP.", whenWrong: "That's the win: one model service, many consumers. Each client calls HTTP instead of embedding the model." },
        { prompt: "The API can reuse the predict() function you extracted in Week 18 rather than reimplementing inference.", answer: true, whenRight: "Right — the API just wraps the existing predict() in an HTTP endpoint. That's the clean-architecture dividend.", whenWrong: "You wrap the existing predict() — no rewrite. The Week-18 module split makes the API nearly trivial." },
        { prompt: "Embedding the model in every frontend is the standard, scalable way to build ML systems.", answer: false, whenRight: "Right — no. The standard is a model SERVICE that clients call over HTTP. Embedding it in each app doesn't scale.", whenWrong: "The production pattern is a shared model service, not embedding it in every app. One model, many HTTP consumers." }
      ]),
      E("Your turn — plan the split","[WRITE] In `API.md`:\n1. Draw the before (model-in-Streamlit) vs after (model service + clients) architecture.\n2. Name two consumers besides the dashboard that could call the API.\n3. One sentence: how does reusing predict() make the API simpler?")
    ]),
    D(2,"FastAPI endpoint","Wrap predict() in a typed HTTP endpoint.",[
      L("FastAPI + Pydantic",
"## What it is\n" +
"**FastAPI** turns your `predict()` into an HTTP endpoint with automatic request validation:\n\n" +
"```python\n" +
"from fastapi import FastAPI\n" +
"from pydantic import BaseModel\n" +
"from predict import predict\n\n" +
"app = FastAPI()\n\n" +
"class Req(BaseModel):\n" +
"    texts: list[str]\n\n" +
"@app.post('/predict')\n" +
"def p(req: Req):\n" +
"    labels = predict(req.texts)\n" +
"    return {'predictions': [{'text': t, 'label': l}\n" +
"                            for t, l in zip(req.texts, labels)]}\n" +
"```\n\n" +
"## What Pydantic gives you for free\n" +
"The `Req(BaseModel)` class declares the expected request shape: a `texts` field that's a list of strings. FastAPI **automatically validates** incoming requests against it — send the wrong shape (a number, a missing field) and the client gets a clear 422 error with details, *before* your code runs. You never write manual `if 'texts' not in body` checks. Typed validation is built in.\n\n" +
"## Auto-generated interactive docs\n" +
"FastAPI generates live API docs at `/docs` from your type hints — a clickable page where anyone can try the endpoint. That's documentation you get for free, always in sync with the code. It's a big reason FastAPI is the default for ML services.\n\n" +
"## Why this fits ML serving\n" +
"ML endpoints take structured input (texts, features) and return structured output (predictions). FastAPI's typed request/response model maps perfectly onto that, and the validation catches malformed inputs that would otherwise crash inference.\n\n" +
"## Where this fits\n" +
"Today you write `api.py` wrapping predict() in a POST /predict endpoint and run it with uvicorn."
      ),
      V("FastAPI in 100 Seconds","https://www.youtube.com/watch?v=7t2alSnE2-I",3,"Fireship","What FastAPI is and why it's the default for Python APIs and ML serving."),
      L("See it in code (with output)",
"## Run it locally\n" +
"```bash\n" +
"pip install fastapi uvicorn\n" +
"uvicorn api:app --reload --port 8000\n" +
"# INFO: Uvicorn running on http://127.0.0.1:8000\n" +
"# Interactive docs auto-generated at http://127.0.0.1:8000/docs\n" +
"```\n" +
"Open `/docs` and you get a clickable form to test `/predict` — no curl needed. FastAPI built that page from your `Req` type hints, and it validates every request against the schema automatically."
      ),
      S([
        { prompt: "FastAPI auto-validates requests against a Pydantic model, returning a clear error before your code runs.", answer: true, whenRight: "Right — wrong shape -> automatic 422 with details. No manual 'if field missing' checks needed.", whenWrong: "Pydantic validation is automatic. Malformed requests get rejected with a clear error before inference runs.", sim: "class Req(BaseModel): texts: list[str]\n# bad input -> 422 automatically" },
        { prompt: "FastAPI generates interactive API docs at /docs from your type hints, for free.", answer: true, whenRight: "Right — a clickable test page, always in sync with the code. A big reason FastAPI is the ML-serving default.", whenWrong: "It auto-generates /docs from your types — free, always-current, clickable documentation." },
        { prompt: "A good API endpoint reimplements the model logic rather than calling your existing predict().", answer: false, whenRight: "Right — no. Keep the endpoint thin: parse, call predict(), return. Logic stays in the reused function.", whenWrong: "Thin endpoint, reused logic. The API wraps predict(); it doesn't reimplement inference." }
      ]),
      E("Your turn — build the API","[CODE] 1. `pip install fastapi uvicorn`.\n2. Create api.py: a Pydantic Req model (texts: list[str]) and a POST /predict that calls predict() and returns labels.\n3. Run `uvicorn api:app --reload`.\n4. Open /docs and test the endpoint from the browser form.")
    ]),
    D(3,"Test the API","Hit the endpoint and verify the contract.",[
      L("Testing an HTTP endpoint",
"## What it is\n" +
"Verify the API behaves correctly by sending real requests:\n\n" +
"```bash\n" +
"curl -X POST localhost:8000/predict \\\n" +
"  -H 'Content-Type: application/json' \\\n" +
"  -d '{\"texts\":[\"This paper is amazing\",\"Reproducibility is broken again\"]}'\n" +
"# {\"predictions\":[\n" +
"#   {\"text\":\"This paper is amazing\",\"label\":\"POSITIVE\"},\n" +
"#   {\"text\":\"Reproducibility is broken again\",\"label\":\"NEGATIVE\"}]}\n" +
"```\n\n" +
"## Test the unhappy paths too\n" +
"A real test suite checks more than the happy case:\n" +
"- **Valid input** → correct predictions (above)\n" +
"- **Malformed input** (`{\"wrong\": 1}`) → FastAPI returns 422 with a clear validation error\n" +
"- **Empty list** (`{\"texts\": []}`) → should return an empty predictions list, not crash\n\n" +
"Testing the failure cases is what separates a robust API from a demo. Clients *will* send bad input; your API should reject it cleanly, not 500.\n\n" +
"## Why test with curl (or the /docs page)\n" +
"`curl` (and the auto-generated `/docs` form) test the API exactly as a real client would — over HTTP, with real JSON. That's more meaningful than calling `predict()` in Python, because it exercises the full request → validation → inference → response path, including the serialization that a real client depends on.\n\n" +
"## Where this fits\n" +
"Today you test the endpoint with valid input, malformed input, and an empty list — confirming it handles all three correctly before you containerize it."
      ),
      S([
        { prompt: "A robust API should be tested with malformed input, not just the happy path.", answer: true, whenRight: "Right — clients send bad input. A robust API rejects it cleanly (422), never 500s. Test the unhappy paths.", whenWrong: "Test failure cases too. Bad input is inevitable; the API must reject it gracefully, not crash." },
        { prompt: "Testing via curl/the /docs form exercises the full HTTP path a real client uses.", answer: true, whenRight: "Right — it tests request -> validation -> inference -> response, including serialization. More meaningful than calling predict() directly.", whenWrong: "curl hits the real HTTP path end-to-end, unlike calling predict() in Python. That's what a client actually does." },
        { prompt: "Sending {\"wrong\": 1} to the endpoint should crash the server with a 500.", answer: false, whenRight: "Right — no. Pydantic returns a clean 422 validation error. A 500 would mean the API mishandled bad input.", whenWrong: "It should return a 422 (validation error), not crash. FastAPI handles the malformed shape gracefully." }
      ]),
      E("Your turn — test the API","[CODE] With the API running, test three cases:\n1. Valid: POST two texts, confirm correct labels.\n2. Malformed: POST {\"wrong\": 1}, confirm a 422 error.\n3. Empty: POST {\"texts\": []}, confirm an empty predictions list (no crash).\nSave the curl commands in API.md.")
    ]),
    D(4,"Dockerize the API","Package it to run identically anywhere.",[
      L("Docker — reproducible deployment",
"## What it is\n" +
"**Docker** packages your app, its dependencies, and the OS environment into a single **image** that runs identically anywhere. A `Dockerfile` is the recipe:\n\n" +
"```dockerfile\n" +
"FROM python:3.11-slim\n" +
"WORKDIR /app\n" +
"COPY requirements.txt .\n" +
"RUN pip install -r requirements.txt\n" +
"COPY api.py predict.py models/ ./\n" +
"EXPOSE 8000\n" +
"CMD [\"uvicorn\", \"api:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]\n" +
"```\n" +
"```bash\n" +
"docker build -t reddit-sentiment-api .\n" +
"docker run -p 8000:8000 reddit-sentiment-api\n" +
"```\n\n" +
"## What each line does\n" +
"- **FROM** — start from a minimal Python base image\n" +
"- **COPY requirements + RUN pip install** — install deps (done before copying code so Docker caches this layer; code changes don't re-install everything)\n" +
"- **COPY** the code + model\n" +
"- **EXPOSE / CMD** — declare the port and the start command\n\n" +
"## Why Docker solves 'works on my machine'\n" +
"The #1 deployment headache is environment drift — different Python version, missing system library, OS difference. A Docker image **freezes the entire environment**, so the image that runs on your laptop runs byte-for-byte the same on the cloud server. No 'but it worked locally.' This reproducibility is why Docker is the universal unit of deployment.\n\n" +
"## The layer-caching detail\n" +
"Copying `requirements.txt` and installing *before* copying your code is a deliberate optimization: Docker caches layers, so when you change `api.py` (but not the deps), the rebuild skips the slow pip install. Small ordering choice, big speed difference on rebuilds.\n\n" +
"## Where this fits\n" +
"Today you write the Dockerfile, build the image, and run the containerized API locally."
      ),
      V("Docker in 100 Seconds","https://www.youtube.com/watch?v=Gjnup-PuquQ",3,"Fireship","What Docker is and why containers solve environment drift."),
      S([
        { prompt: "A Docker image freezes the whole environment so it runs identically on your laptop and the cloud.", answer: true, whenRight: "Right — that reproducibility kills 'works on my machine'. Same image, same behaviour everywhere.", whenWrong: "Docker bundles code + deps + OS env into one image that runs the same anywhere. That's the whole point." },
        { prompt: "Copying requirements.txt and installing deps BEFORE copying your code speeds up rebuilds.", answer: true, whenRight: "Right — Docker caches that layer; changing api.py doesn't trigger a slow re-install. Deliberate layer ordering.", whenWrong: "Layer caching: deps install once and is cached, so code-only changes rebuild fast. Order it deps-first." },
        { prompt: "Docker makes your model more accurate.", answer: false, whenRight: "Right — no. Docker is about reproducible packaging/deployment, not accuracy. The model is unchanged inside it.", whenWrong: "Docker doesn't touch accuracy — it packages the app reproducibly. Same model, portable environment." }
      ]),
      E("Your turn — Dockerize","[CODE] 1. Write a Dockerfile (python:3.11-slim base, install requirements, copy api.py/predict.py/models, EXPOSE 8000, uvicorn CMD).\n2. `docker build -t reddit-sentiment-api .`\n3. `docker run -p 8000:8000 reddit-sentiment-api`\n4. curl the containerized endpoint and confirm it responds.")
    ]),
    D(5,"Deploy to Hugging Face Spaces","Put the containerized API on a public URL.",[
      RD("Hugging Face Spaces","https://huggingface.co/spaces","Click 'Open'. Free hosting for ML demos and APIs — supports a Docker SDK for your containerized service."),
      L("Deploying a Docker API to HF Spaces",
"## What it is\n" +
"**Hugging Face Spaces** hosts ML apps free, including Docker-based services. The flow:\n" +
"1. Create a new Space with the **Docker SDK**\n" +
"2. Push your `Dockerfile` + `api.py`, `predict.py`, `models/` (Git LFS)\n" +
"3. Spaces builds the image and runs it → public URL like `reddit-sentiment-api.hf.space`\n\n" +
"## Why HF Spaces for an ML API\n" +
"Spaces is built for ML — it handles model files well (it's where models live), offers more generous memory than some free tiers, and the Docker SDK means it runs the exact image you tested locally. Because you containerized in Day 4, deployment is 'push the same Dockerfile' — the image that worked on your laptop works here, no surprises. That's the Docker reproducibility paying off directly.\n\n" +
"## The deploy checklist\n" +
"- Model files tracked via Git LFS (from Week 15)\n" +
"- requirements.txt complete (the #1 deploy-failure cause, as in TaxiPulse)\n" +
"- The Dockerfile EXPOSEs the port Spaces expects (check their docs — often 7860)\n\n" +
"## Why a deployed API is a portfolio milestone\n" +
"A **live, callable model API** is a different and stronger artifact than a notebook or even a dashboard. It says: 'my model runs as a real service that any application can use.' That's the shape of how ML is actually deployed in industry, and showing you've done it end-to-end — model → API → container → live URL — is genuinely senior-level evidence.\n\n" +
"## Where this fits\n" +
"Today you deploy the Docker API to Spaces and test the live endpoint. Tomorrow you point the dashboard at it."
      ),
      S([
        { prompt: "Because you containerized the API, deploying to Spaces means running the same image you tested locally.", answer: true, whenRight: "Right — Docker's reproducibility pays off: the local image runs identically on Spaces. No surprises.", whenWrong: "The same Dockerfile/image runs on Spaces as on your laptop. That portability is exactly Docker's value." },
        { prompt: "An incomplete requirements.txt is a common cause of deploy failures.", answer: true, whenRight: "Right — same as TaxiPulse/Streamlit: a missing package builds then crashes on import. Keep it complete.", whenWrong: "Missing dependencies are the classic deploy failure. The build succeeds, then a missing import crashes it." },
        { prompt: "A live, callable model API is essentially the same portfolio artifact as a Jupyter notebook.", answer: false, whenRight: "Right — no. A live API is a stronger, more industry-realistic artifact: a model running as a real service.", whenWrong: "A live API is a step up — it shows your model deployed as a real service any app can call, not just analysis." }
      ]),
      E("Your turn — deploy to Spaces","[PRODUCE] 1. Create a HF Space with the Docker SDK.\n2. Push your Dockerfile, api.py, predict.py, models/ (LFS).\n3. Let it build; if it fails, check requirements.txt and the exposed port.\n4. curl the live `.hf.space/predict` endpoint and confirm it returns predictions.")
    ]),
    D(6,"Point the dashboard at the API","Make the frontend lightweight.",[
      L("Decoupling the dashboard from the model",
"## What it is\n" +
"Now complete the split: remove the model from the Streamlit app and have it **call the API** instead:\n\n" +
"```python\n" +
"import requests\n" +
"API_URL = 'https://reddit-sentiment-api.hf.space'\n\n" +
"# Was: labels = predict(titles)   (model loaded in Streamlit)\n" +
"# Now: call the API\n" +
"r = requests.post(f'{API_URL}/predict', json={'texts': titles})\n" +
"results = r.json()['predictions']\n" +
"```\n\n" +
"## What this changes\n" +
"The Streamlit app no longer imports the 250MB model, no longer needs `models/`, no longer needs torch/transformers in its requirements. It becomes a **thin frontend** — it scrapes, calls the API, and renders. Result:\n" +
"- The dashboard deploys faster and uses far less memory (the OOM risk from Week 18 disappears)\n" +
"- The model lives in exactly one place (the API)\n" +
"- A mobile app or any other client could call the same API\n\n" +
"## The architecture is now correct\n" +
"```text\n" +
"[HF Spaces: model API]  <--HTTP--  [Streamlit: thin UI]\n" +
"```\n" +
"This is the production shape: a model service and a separate, lightweight presentation layer. The dashboard from last week still looks the same to the user — but underneath, it's now a proper client of a real API. Same UX, far better architecture.\n\n" +
"## Why this is the satisfying payoff\n" +
"Everything connects: the `predict()` you extracted in Week 18 now powers the API; the dashboard you built then now consumes that API. The clean boundaries you set up turned a monolith into a proper client/server system with minimal rework.\n\n" +
"## Where this fits\n" +
"Today you strip the model out of the Streamlit app, repoint it at the API, and redeploy the now-lightweight dashboard."
      ),
      S([
        { prompt: "After pointing the dashboard at the API, the Streamlit app no longer needs the 250MB model or torch/transformers.", answer: true, whenRight: "Right — it becomes a thin frontend: scrape, call API, render. The OOM risk disappears.", whenWrong: "The model moves to the API. The dashboard just makes HTTP calls — no model, no heavy deps, no OOM." },
        { prompt: "Splitting the stack means the model now lives in exactly one place (the API), shared by all clients.", answer: true, whenRight: "Right — one model service, any number of clients. The dashboard is just the first consumer.", whenWrong: "Yes — the model is centralized in the API; the dashboard and any future client call it over HTTP." },
        { prompt: "Repointing the dashboard at the API changes what the user sees and breaks the existing UI.", answer: false, whenRight: "Right — no. The UX is identical; only the architecture underneath changed (model now remote). Same look, better design.", whenWrong: "The user sees the same dashboard. Only the plumbing changed — it's now a client of the API instead of a monolith." }
      ]),
      E("Your turn — repoint the dashboard","[CODE] 1. In app.py, replace the local predict() call with a requests.post to your live API.\n2. Remove the model import and model files from the Streamlit app's deploy (and torch/transformers from its requirements).\n3. Redeploy the now-lightweight dashboard.\n4. Confirm it still works end-to-end — and note the smaller memory footprint.")
    ]),
    D(7,"Ship Reddit Sentiment v0.5","Tag the production-architecture milestone.",[
      L("Shipping v0.5 — a real client/server ML system",
"## What it is\n" +
"v0.5 ships the split stack: a Dockerized model API + a thin dashboard client. Update the README and tag:\n\n" +
"```text\n" +
"## v0.5 — REST API + Docker\n" +
"Model served as a containerized FastAPI service on HF Spaces:\n" +
"  POST https://reddit-sentiment-api.hf.space/predict\n" +
"The Streamlit dashboard is now a thin client calling this API.\n" +
"Architecture: [model API] <--HTTP-- [dashboard] (and any future client).\n" +
"```\n" +
"```bash\n" +
"git tag v0.5 && git push && git push --tags\n" +
"```\n\n" +
"## Why this is the most 'senior' artifact in the project\n" +
"Anyone can train a model. Fewer can deploy it. Far fewer can architect it correctly — model as a containerized service, decoupled from a lightweight frontend, callable by any client. That's the actual shape of production ML, and showing you built it end-to-end (model → API → Docker → live, with the frontend as a proper client) is strong evidence you can operate at a production level, not just a notebook level.\n\n" +
"## The full v0.1 → v0.5 arc\n" +
"pretrained baseline → gold set + classical → fine-tuned transformer → live dashboard → **production API + Docker**. Each version added a real capability AND taught the discipline to do it well. That progression — from analysis to a deployed, well-architected service — is a complete, compelling portfolio story.\n\n" +
"## Where this fits\n" +
"Today you tag v0.5. Next week (v1.0) you ship Project 2 for real: blog post, demo video, outside readers, and a retrospective — the polish that turns a strong project into a portfolio centrepiece."
      ),
      S([
        { prompt: "Architecting a model as a containerized service decoupled from a thin frontend is production-level evidence.", answer: true, whenRight: "Right — it's the real shape of production ML. Building it end-to-end signals you operate beyond notebook level.", whenWrong: "That architecture (model service + thin client, containerized) is how production ML works. Doing it is senior-level proof." },
        { prompt: "Deploying a model is rarer than training one, and architecting it correctly is rarer still.", answer: true, whenRight: "Right — train < deploy < architect-correctly in rarity. v0.5 demonstrates the rarest of the three.", whenWrong: "The pyramid: many can train, fewer deploy, fewest architect well. v0.5 shows the top of it." },
        { prompt: "v0.5's architecture work is less valuable than v0.3's fine-tuning because it doesn't improve accuracy.", answer: false, whenRight: "Right — no. Production architecture is a distinct, highly valued skill. Not everything valuable is about accuracy.", whenWrong: "Architecture is its own high-value skill. v0.5 doesn't raise accuracy — it makes the model deployable and shareable, which matters enormously." }
      ]),
      E("Your turn — ship v0.5","[PRODUCE] 1. Add a 'v0.5 — REST API + Docker' README section with the architecture diagram and live API URL.\n2. Tag:\n`git tag v0.5 && git push && git push --tags`\n\nPASS:\n[x] FastAPI app works locally\n[x] Dockerfile builds and runs\n[x] Live API endpoint on HF Spaces\n[x] Streamlit dashboard calls the API (model removed from frontend)\n[x] README documents the architecture\n[x] v0.5 tag pushed")
    ])
  ]
};

/* ════ WEEK 20 — Reddit Sentiment v1.0: Ship + retro ════ */
const W20 = {
  number: 20, title: "Reddit Sentiment v1.0: Ship + retro",
  phase: "Production", commitment_hours: "10-15",
  context: ds.weeks[19].context,
  concept_check: [
    { q: "Why write a blog post about a project you've already built?",
      choices: ["To pad your portfolio","Writing forces you to understand it deeply AND makes your work discoverable — a post reaches people a repo never will",
        "Blogs are required","To use more words"],
      correct: 1, explain: "Explaining a project in writing exposes the gaps in your own understanding and produces a public artifact people actually find and read. A great repo nobody sees has little reach; a clear blog post with the repo linked has far more." },
    { q: "What's the most valuable feedback to get from outside readers?",
      choices: ["That it looks great","'Where did I lose you?' — the exact point your explanation became unclear, which you can't see yourself",
        "Spelling fixes only","How long they spent"],
      correct: 1, explain: "You can't see your own blind spots — you already understand the project. An outside reader who tells you exactly where they got confused gives you the one thing you can't generate alone: where your communication actually fails." },
    { q: "What does shipping v1.0 of Project 2 actually require beyond the code working?",
      choices: ["Nothing — the code is done","Communication artifacts (blog, demo video), real feedback addressed, and an honest retrospective — the 'last 20%' that makes it portfolio-grade",
        "More features","A second model"],
      correct: 1, explain: "The model and API have worked since v0.5. Shipping v1.0 is the polish: making the work understandable (blog, video), validated by real readers, and reflected on (retro). It's the difference between 'I built this' and 'here's a portfolio piece that proves it.'" }
  ],
  days: [
    D(1,"What's left to ship","The polish gap between working and portfolio-grade.",[
      L("Finishing Project 2 properly",
"## What it is\n" +
"You've been building Reddit Sentiment since Week 12: hand-labelled data (W13), statistical rigour (W14), a fine-tuned transformer (W15), interpretability (W16), synthetic data (W17), a live dashboard (W18), a production API (W19). Eight weeks. The thing **works**.\n\n" +
"This week you do what most people skip: the **last 20%** that turns a working project into a portfolio centrepiece. No new features — pure polish and communication.\n\n" +
"## What 'shipping v1.0' actually means here\n" +
"For this project, shipping means making the work **understandable, discoverable, and validated**:\n" +
"- A **blog post** explaining the journey (forces deep understanding + reaches people)\n" +
"- A **demo video** (90 seconds of the live dashboard — instant credibility)\n" +
"- **Outside readers** giving real feedback, which you address\n" +
"- A **retrospective** reflecting honestly on what you learned\n\n" +
"## Why this is the highest-ROI week of the project\n" +
"A brilliant project nobody can understand or find has almost no career value. The same project with a clear blog post, a demo video, and a polished README reaches recruiters, gets shared, and demonstrates communication — the skill that separates data scientists who get promoted from those who stay stuck. The code was necessary; the communication is what makes it *count*.\n\n" +
"## Where this fits\n" +
"Today you build the punch list of what's rough across the whole project (same as TaxiPulse W10), then spend the week closing it and adding the communication layer."
      ),
      S([
        { prompt: "Shipping v1.0 here is about communication and polish, not new features (the model already works).", answer: true, whenRight: "Right — the model's worked since v0.5. v1.0 is the last 20%: blog, video, feedback, retro.", whenWrong: "No new features. v1.0 is making the working project understandable, discoverable, and validated." },
        { prompt: "A brilliant project that nobody can understand or find has limited career value.", answer: true, whenRight: "Right — reach and clarity are what convert work into opportunity. Communication is the multiplier.", whenWrong: "Unfindable, unexplained work barely counts. The communication layer is what gives a project career value." },
        { prompt: "The 'last 20%' polish is optional fluff once the code runs.", answer: false, whenRight: "Right — no. It's the highest-ROI part: it's what makes the project legible and shareable to people who hire.", whenWrong: "The polish is where career value is created. Working code is necessary but not sufficient." }
      ]),
      E("Your turn — punch list","[WRITE] Audit the whole Reddit Sentiment project (all repos, READMEs, the live dashboard, the API). In `POLISH.md`, list everything rough — unclear cells, stale READMEs, missing docstrings, confusing bits. Aim for 10+ items. This is the week's plan.")
    ]),
    D(2,"Fix the rough edges","Work the punch list with clean commits.",[
      L("Polishing across the whole project",
"## What it is\n" +
"Work through your punch list, fixing the highest-impact items first, each as its own clean commit (same discipline as TaxiPulse W10):\n\n" +
"```bash\n" +
"git commit -m 'Add docstrings to predict.py'\n" +
"git commit -m 'Clean up the API README with a curl example'\n" +
"git commit -m 'Fix the confusing label-mapping cell in 01-baseline'\n" +
"```\n\n" +
"## What 'rough edges' look like in this project\n" +
"- Notebooks with no markdown explaining *why* a cell exists\n" +
"- A README that still describes v0.2 when you're at v0.5\n" +
"- `predict.py` or `api.py` functions with no docstrings\n" +
"- The dashboard's empty state showing an error instead of a prompt\n" +
"- Dead code from experiments left lying around\n\n" +
"## Prioritise by what a reviewer hits first\n" +
"A recruiter opens your main README and your live dashboard before anything else. Polish those first — they're the front door. A confusing helper function deep in a notebook matters less than a stale headline in the README. Triage by reader impact, not by what's easiest to fix.\n\n" +
"## Why clean commits matter\n" +
"Small, descriptive commits make your git history readable — itself a signal of professionalism a reviewer notices. 'Fix the SHAP plot axis labels' tells a story; 'updates' tells nothing.\n\n" +
"## Where this fits\n" +
"Today you fix the top items on your punch list — front door first — each as its own clean commit."
      ),
      S([
        { prompt: "You should polish the main README and live dashboard first — they're the reviewer's front door.", answer: true, whenRight: "Right — triage by what a recruiter sees first, not by what's easiest. Front door before back rooms.", whenWrong: "Front door first: README and live demo get seen before any notebook. Prioritise reader impact." },
        { prompt: "Small, descriptive commits make your git history a readable story reviewers notice.", answer: true, whenRight: "Right — 'fix SHAP axis labels' tells a story; 'updates' tells nothing. Clean history signals professionalism.", whenWrong: "Descriptive commits read like a changelog. Reviewers do scroll the log; clean history is a real signal." },
        { prompt: "A stale README describing v0.2 when you're at v0.5 is a minor issue not worth fixing.", answer: false, whenRight: "Right — it's a front-door issue: the first thing a reviewer reads is wrong. High priority to fix.", whenWrong: "A stale headline README misleads at the front door. That's high-impact — fix it early." }
      ]),
      E("Your turn — fix the top items","[CODE] From POLISH.md, fix the 5 highest-impact items (front door first: main README, dashboard, then notebooks/code). Commit each separately with a clear message. Confirm `git log --oneline` reads cleanly.")
    ]),
    D(3,"Write the blog post","Explain the journey publicly.",[
      RD("dev.to (publish your post)","https://dev.to","Click 'Open'. A developer blogging platform with good reach — where you'll publish the project write-up."),
      L("The project blog post",
"## What it is\n" +
"Write a 1000-1500 word post telling the project's story, and publish it on dev.to:\n\n" +
"```text\n" +
"Title: How I built a live Reddit sentiment dashboard with a fine-tuned DistilBERT\n" +
"Sections:\n" +
"  1. The problem (what + why)\n" +
"  2. The data (scraping, hand-labelling a gold set)\n" +
"  3. The classical baseline (and why it mattered)\n" +
"  4. Fine-tuning the transformer (the leap past the ceiling)\n" +
"  5. Making it live (dashboard + API + Docker)\n" +
"  6. Lessons learned (honest reflection)\n" +
"Include a screenshot of the live dashboard.\n" +
"```\n\n" +
"## Why writing makes you understand it better\n" +
"Explaining a project forces you to confront the parts you only *half* understand. You can build something that works without fully grasping why; you cannot *write a clear explanation* of it without filling those gaps. The act of writing is itself a learning step — you'll discover things about your own project you hadn't articulated.\n\n" +
"## Why publishing matters\n" +
"A repo is found by people who go looking. A blog post is found by people who *aren't* — it surfaces in search, gets shared, reaches an audience a repo never will. It also demonstrates **communication**, the skill that compounds over a career. A data scientist who can explain their work in writing is worth far more than one who can only do it.\n\n" +
"## The honest-story principle\n" +
"The best technical posts include what *didn't* work and what you'd do differently — not a sanitised highlight reel. 'The pretrained model failed on our domain, which is why we hand-labelled' is more compelling and more credible than 'everything worked perfectly.' Honesty is what makes a write-up trustworthy and relatable.\n\n" +
"## Where this fits\n" +
"Today you write and publish the post. Tomorrow you add a demo video to it."
      ),
      S([
        { prompt: "Writing a clear explanation of your project exposes gaps in your own understanding.", answer: true, whenRight: "Right — you can build something working without fully grasping it, but you can't clearly explain it without filling the gaps.", whenWrong: "Writing is a learning step — it forces you to articulate (and thus understand) the parts you only half-knew." },
        { prompt: "A published blog post reaches people a GitHub repo never would.", answer: true, whenRight: "Right — posts surface in search and get shared; repos are only found by people already looking. Plus it shows communication.", whenWrong: "A post reaches a passive audience (search, shares) a repo can't. And it demonstrates communication skill." },
        { prompt: "The best technical posts present a flawless highlight reel with nothing that went wrong.", answer: false, whenRight: "Right — no. Including failures and what you'd change is more credible and compelling than a sanitised story.", whenWrong: "Honest posts beat highlight reels. 'The pretrained model failed, so we hand-labelled' is more credible and engaging." }
      ]),
      E("Your turn — write the post","[WRITE] Write a 1000-1500 word dev.to post: problem, data, classical baseline, fine-tuning, going live (dashboard/API), and honest lessons. Include a dashboard screenshot. Publish it. Save the URL in the README.")
    ]),
    D(4,"Add a demo video","90 seconds of proof.",[
      L("The demo video",
"## What it is\n" +
"Record a 90-second screen walkthrough of the live dashboard, upload it (YouTube unlisted), and embed it in the README and blog post:\n\n" +
"```text\n" +
"The 90-second script:\n" +
"  0-15s: 'This is a live sentiment dashboard for r/ML.' Show the URL.\n" +
"  15-45s: Click Refresh -> it scrapes + scores 50 posts live.\n" +
"  45-70s: Walk through the bar chart + most pos/neg examples.\n" +
"  70-90s: Show the trend over time. 'Built with a fine-tuned DistilBERT\n" +
"          served via a FastAPI + Docker backend.'\n" +
"```\n\n" +
"## Why a video is disproportionately powerful\n" +
"A screenshot is static; a repo requires effort to evaluate; but a **video shows your project actually working** in 90 seconds, zero effort from the viewer. A recruiter watches it and instantly believes the thing is real and functional. It collapses 'is this person's project legit?' into 90 seconds of yes. For the effort it takes, nothing else in your portfolio has this conversion rate.\n\n" +
"## Keep it tight\n" +
"90 seconds, not 10 minutes. The discipline of a short demo forces you to show the *value* (it works, here's what it does) without rambling through implementation details. Nobody watches a 10-minute portfolio demo; everybody watches 90 seconds. Respect the viewer's time and you'll actually get watched.\n\n" +
"## Where this fits\n" +
"Today you record, upload, and embed the demo video. Tomorrow you get outside readers on the whole package."
      ),
      S([
        { prompt: "A 90-second demo video shows your project working with zero effort from the viewer.", answer: true, whenRight: "Right — it collapses 'is this legit?' into 90 seconds of yes. Highest conversion-per-effort in a portfolio.", whenWrong: "A video proves it works instantly, no effort to evaluate. That's why it's disproportionately powerful." },
        { prompt: "A tight 90-second demo gets watched where a 10-minute one doesn't.", answer: true, whenRight: "Right — short forces you to show value, not ramble, and people actually watch it through.", whenWrong: "Keep it to ~90s. Nobody finishes a 10-minute portfolio demo; a tight one gets watched and respects the viewer." },
        { prompt: "A demo video should walk through every implementation detail to be thorough.", answer: false, whenRight: "Right — no. Show the value (it works, what it does), not the implementation. Save details for the blog post.", whenWrong: "Show value, not implementation. Details belong in the post; the video proves it works, fast." }
      ]),
      E("Your turn — record the demo","[PRODUCE] 1. Record a ~90-second screen walkthrough of the live dashboard (use the script as a guide).\n2. Upload to YouTube (unlisted).\n3. Embed it in the README and the blog post.\n4. Confirm both links work.")
    ]),
    D(5,"Get 3 outside readers","Real feedback on the whole package.",[
      L("Outside-reader feedback",
"## What it is\n" +
"Send the blog post + repo URL to **3 people** and ask each one question:\n\n" +
"> 'Where did I lose you?'\n\n" +
"## Why that exact question\n" +
"Not 'what do you think?' (invites a polite 'looks great') — but 'where did I lose you?', which assumes there *was* a point of confusion and asks them to locate it. That framing gets you a specific, actionable answer instead of empty praise. It's the same technique as the TaxiPulse stranger test, applied to the whole package.\n\n" +
"## Why outsiders, why three\n" +
"- **Outsiders** see your blind spots — you understand the project too well to notice where the explanation assumes knowledge. A fresh reader hits exactly those spots.\n" +
"- **Three** (not one) reveals patterns: if all three got lost at the fine-tuning section, that section is genuinely unclear. One person might be idiosyncratic; three converging is signal.\n\n" +
"## Receive it without defending\n" +
"When they tell you where they got lost, the only correct response is 'thank you' and a note. Don't explain why it's actually clear — if they were confused, it was confusing. Their confusion is data about your communication, not a verdict to argue with. Non-defensiveness here is a genuine professional skill.\n\n" +
"## Where this fits\n" +
"Today you collect feedback from 3 readers and record exactly where each got lost. Tomorrow you fix those spots."
      ),
      S([
        { prompt: "'Where did I lose you?' gets better feedback than 'what do you think?'.", answer: true, whenRight: "Right — it presupposes a confusion point and asks them to locate it, yielding a specific, actionable answer.", whenWrong: "The targeted question gets specifics; the open one gets polite praise. Ask where they got lost." },
        { prompt: "Getting feedback from three readers (not one) helps reveal patterns in what's confusing.", answer: true, whenRight: "Right — three converging on the same confusing section is signal; one might be idiosyncratic.", whenWrong: "Three readers surface patterns. If all three stumble at the same spot, that section genuinely needs work." },
        { prompt: "If a reader says a section confused them, you should explain why it's actually clear.", answer: false, whenRight: "Right — no. Their confusion proves it's unclear. Say thanks, note it, fix it. Don't argue with feedback.", whenWrong: "Never defend. Their confusion is the data — if they were lost, it was confusing, regardless of your intent." }
      ]),
      E("Your turn — get 3 readers","[WRITE] 1. Send the blog post + repo to 3 people (ideally outside data science).\n2. Ask each: 'Where did I lose you?'\n3. Record their answers verbatim in POLISH.md — no defending. Note any spot that more than one flagged.")
    ]),
    D(6,"Address the feedback","Turn reader confusion into fixes.",[
      L("Acting on the feedback",
"## What it is\n" +
"Apply the 3 readers' feedback to the blog post and README — fixing the specific spots where they got lost. Real, confirmed confusion beats any improvement you'd imagine on your own.\n\n" +
"## Prioritise the converging feedback\n" +
"If two or three readers got lost at the same place, fix that first — it's the highest-confidence problem. A single reader's confusion might be idiosyncratic; a shared one is a real gap that's costing you every reader. Triage by how many people hit it.\n\n" +
"## How to fix 'I got lost here'\n" +
"Confusion is almost always **missing context or a leap that's too big**, not wrong content. The fixes are usually:\n" +
"- Add a sentence of context before a concept you assumed\n" +
"- Break a dense paragraph into a clear lead + detail\n" +
"- Add a concrete example where you were abstract\n" +
"- Define a term you used without explaining\n\n" +
"## Why closing the loop matters\n" +
"Getting feedback and *acting on it* is the core skill of iterative improvement — the same loop that makes products and writing actually good. Feedback you collect but ignore is wasted; feedback you apply compounds. And a reader who sees you incorporated their note becomes an advocate.\n\n" +
"## Where this fits\n" +
"Today you fix the confusing spots your readers found, prioritising what multiple people flagged, then re-read those sections fresh."
      ),
      S([
        { prompt: "Feedback that multiple readers gave (converging) should be prioritised over one-off confusion.", answer: true, whenRight: "Right — a shared confusion is high-confidence signal costing you every reader; a single one may be idiosyncratic.", whenWrong: "Fix converging feedback first — it's the highest-confidence, highest-impact problem." },
        { prompt: "Reader confusion is usually fixed by adding context or examples, not rewriting the content.", answer: true, whenRight: "Right — confusion is a communication gap (a leap too big, a term undefined), fixed with words, not new content.", whenWrong: "It's usually missing context or too-big a leap. Add a sentence, an example, a definition — not a rewrite." },
        { prompt: "Collecting feedback is valuable even if you don't act on any of it.", answer: false, whenRight: "Right — no. Unapplied feedback is wasted. The value is in closing the loop: collect, then fix.", whenWrong: "Feedback only pays off when applied. Collecting and ignoring it is wasted effort — close the loop." }
      ]),
      E("Your turn — address feedback","[CODE/WRITE] 1. Take the readers' confusion points from POLISH.md.\n2. Fix each in the blog post + README — prioritising anything 2+ readers flagged.\n3. Re-read those sections as a newcomer. Are they clear now?\n4. Note in POLISH.md what you changed.")
    ]),
    D(7,"Ship v1.0 + retro","Close Project 2 with reflection.",[
      L("Shipping v1.0 and the retrospective",
"## What it is\n" +
"Project 2 ships. Two final deliverables:\n\n" +
"**1. RETRO.md** — honest reflection (same shape as TaxiPulse):\n" +
"```text\n" +
"# Reddit Sentiment Retro\n" +
"## What worked\n" +
"## What didn't\n" +
"## What I'd do differently\n" +
"## What I learned\n" +
"```\n\n" +
"**2. The v1.0 tag:**\n" +
"```bash\n" +
"git tag v1.0 && git push && git push --tags\n" +
"```\n\n" +
"## Why the retro is worth real effort\n" +
"The 'what didn't work' and 'what I'd do differently' sections are the valuable ones. Naming your own missteps (e.g. 'I should have hand-labelled more than 200 posts' or 'I over-trusted the pretrained model at first') shows self-awareness and growth — the traits that mark someone coachable and senior-track. A retro of only wins is one nobody believes. Writing it also cements the lessons into rules you'll carry to Project 3.\n\n" +
"## What you actually built (the full arc)\n" +
"Eight weeks: scraping → hand-labelled gold set → classical baseline → A/B-tested prompts → fine-tuned DistilBERT → SHAP interpretability → synthetic data → live dashboard → production API + Docker → blog + demo + v1.0. That's not a tutorial exercise — it's a complete, deployed, documented, communicated NLP product. The kind of thing that ends an interview with an offer.\n\n" +
"## The meta-skill you've now done twice\n" +
"TaxiPulse and Reddit Sentiment both went from nothing to a shipped, polished, communicated product. You now own that *process* — the thing that's far more valuable than any single technique. Project 3 (time series) will be a third rep of the same arc, on a domain that breaks your tabular/text intuitions.\n\n" +
"## Where this fits\n" +
"Today you write the retro and tag v1.0 — Project 2 complete. Next week starts Project 3: Energy Forecast, where time series breaks the rules you've learned."
      ),
      S([
        { prompt: "The most valuable retro sections are 'what didn't work' and 'what I'd do differently'.", answer: true, whenRight: "Right — naming missteps shows growth and self-awareness. A wins-only retro is one nobody believes.", whenWrong: "The failure/change sections carry the value — they demonstrate reflection and coachability." },
        { prompt: "Across TaxiPulse and Reddit Sentiment, you've now done the full ship-a-product process twice.", answer: true, whenRight: "Right — that repeatable process (nothing -> shipped, polished, communicated) is worth more than any single technique.", whenWrong: "Two complete arcs means you own the process, not just the tools. That's the durable, transferable skill." },
        { prompt: "Writing the retro is busywork once the project is tagged and working.", answer: false, whenRight: "Right — no. It cements lessons into rules for Project 3 and demonstrates the self-awareness employers value.", whenWrong: "The retro turns experience into reusable lessons and signals growth. It's substance, not busywork." }
      ]),
      E("Your turn — ship v1.0","[PRODUCE] 1. Write RETRO.md (what worked / didn't / would do differently / learned) — be honest about the missteps.\n2. Tag:\n`git tag v1.0 && git push && git push --tags`\n\nPASS:\n[x] Dev.to blog post published\n[x] Demo video recorded + embedded\n[x] 3 readers' feedback applied\n[x] RETRO.md written honestly\n[x] v1.0 tag pushed — Project 2 complete")
    ])
  ]
};

/* ════ WEEK 21 — Project 3: Energy Forecast v0.1 ════ */
const W21 = {
  number: 21, title: "Project 3 — Energy Forecast v0.1",
  phase: "Time Series", commitment_hours: "15-20",
  context: ds.weeks[20].context,
  concept_check: [
    { q: "Why does time series 'break' the intuitions you built on tabular and text data?",
      choices: ["It's just bigger data","The rows aren't independent — each value depends on previous ones (time order matters), so you can't shuffle or random-split",
        "It can't be plotted","It needs no cleaning"],
      correct: 1, explain: "In tabular/text data, rows are independent — you shuffle freely and random-split. In time series, order is everything: today depends on yesterday. Shuffling destroys the signal, and a random split leaks the future into training. Time series needs its own rules." },
    { q: "Why must you split time series data chronologically, not randomly?",
      choices: ["It's faster","A random split puts future data in the training set — the model 'sees the future', inflating scores and lying about real performance",
        "Random splits use more memory","Chronological is just convention"],
      correct: 1, explain: "Forecasting means predicting the future from the past. A random split would train on some future points and test on some past ones — leaking the future into training. You must train on the earlier period and test on the later one, exactly as you'd forecast in reality." },
    { q: "What is a 'persistence baseline' in forecasting?",
      choices: ["A model that never changes","Predicting the next value equals the last observed value — the naive bar any real forecast must beat",
        "A model that persists to disk","The average of all values"],
      correct: 1, explain: "The persistence (naive) forecast says 'tomorrow = today'. It's astonishingly hard to beat for many series, so it's the honest baseline: if your fancy ARIMA/LSTM can't beat 'tomorrow = today', it has learned nothing useful." }
  ],
  days: [
    D(1,"Why time series is different","Order is everything — your old intuitions break.",[
      L("What makes time series its own discipline",
"## What it is\n" +
"Project 3 is **Energy Forecast** — predicting hourly electricity demand from AEP (American Electric Power) data. It's a **time series** problem, and time series breaks almost every intuition you built on tabular and text data.\n\n" +
"## The one idea that changes everything: rows aren't independent\n" +
"In TaxiPulse and Reddit Sentiment, each row stood alone — one trip, one post. You could shuffle them, random-split them, treat each as an independent example. **Time series rows are not independent.** Each hour's electricity demand depends on the previous hours. The order *is* the signal.\n\n" +
"Two hard consequences:\n" +
"1. **You cannot shuffle** — shuffling destroys the temporal pattern you're trying to learn.\n" +
"2. **You cannot random-split** — a random split puts future points in training, leaking the future. You must split **chronologically**: train on the past, test on the future.\n\n" +
"## What you forecast, and against what bar\n" +
"The task: predict future demand from past demand. The honest bar is the **persistence baseline** — 'next value = last value.' It's shockingly hard to beat. Any real model (ARIMA in W22, Prophet in W23, LSTM in W24) must beat persistence to justify itself.\n\n" +
"## Why a third project, deliberately different\n" +
"TaxiPulse was tabular, Reddit was text, Energy is temporal. Three domains means you learn that the *process* (load → explore → baseline → model → evaluate → ship) transfers, while the *techniques* must adapt to the data's nature. That adaptability is the real skill.\n\n" +
"## Where this fits\n" +
"This week (v0.1): get the AEP data, plot it, decompose it into trend/seasonality, find the daily/weekly patterns, and set up a chronological split with a persistence baseline."
      ),
      V("Time series analysis — why it's different","https://www.youtube.com/watch?v=GE3JOFwTWVM",11,"various","Why temporal data needs its own methods: dependence, order, and no shuffling."),
      L("The two rules you must never break",
"## Rule 1: never shuffle time series\n" +
"```python\n" +
"# Tabular/text (fine):\n" +
"train_test_split(X, y, shuffle=True)   # rows independent\n\n" +
"# Time series (WRONG):\n" +
"train_test_split(X, y, shuffle=True)   # destroys order -> meaningless\n\n" +
"# Time series (RIGHT) — chronological:\n" +
"split = int(len(df) * 0.8)\n" +
"train, test = df[:split], df[split:]   # past trains, future tests\n" +
"```\n\n" +
"## Rule 2: the test set is always the LATER period\n" +
"You forecast the future from the past, so your evaluation must mimic that: train on the earlier data, test on the most recent data the model never saw. Testing on an earlier period than you trained on would be predicting the past from the future — nonsense that inflates your score.\n\n" +
"## Why this trips up everyone once\n" +
"Every instinct from the last 20 weeks says 'shuffle and random-split for an unbiased estimate.' For time series, that instinct is *exactly wrong* and produces a model that looks great offline and fails completely in production. Internalising 'order is sacred' now saves you from the most common time-series mistake."
      ),
      S([
        { prompt: "In time series, each value depends on previous ones, so rows are NOT independent.", answer: true, whenRight: "Right — order is the signal. That dependence is what separates time series from tabular/text data.", whenWrong: "Time series rows depend on their predecessors. The temporal order carries the signal you're modelling." },
        { prompt: "You should random-split time series data for an unbiased estimate, just like tabular data.", answer: false, whenRight: "Right — no. Random splits leak the future into training. Split chronologically: past trains, future tests.", whenWrong: "Never random-split time series — it leaks future into training. Split by time: earlier=train, later=test.", sim: "RIGHT: train=df[:split], test=df[split:]\nWRONG: train_test_split(shuffle=True)" },
        { prompt: "The persistence baseline ('next value = last value') is a bar any real forecast must beat.", answer: true, whenRight: "Right — it's naive but shockingly hard to beat. If ARIMA/LSTM can't beat it, they learned nothing useful.", whenWrong: "Persistence ('tomorrow = today') is the honest baseline. Beating it is the minimum bar for any real model." }
      ]),
      E("Your turn — frame time series","[WRITE] In `TIMESERIES.md`:\n1. Why are time series rows not independent? Give the energy-demand example.\n2. Why must the split be chronological, and what goes wrong with a random split?\n3. What is the persistence baseline, and why is beating it the minimum bar?")
    ]),
    D(2,"Get the dataset + set up","A fresh project for time series.",[
      RD("AEP hourly energy dataset (Kaggle)","https://www.kaggle.com/datasets/robikscube/hourly-energy-consumption","Click 'Open'. Download AEP_hourly.csv — hourly electricity demand, the dataset for this project."),
      L("Project setup for Energy Forecast",
"## What it is\n" +
"A new project, a new isolated environment, with the time-series toolkit:\n\n" +
"```bash\n" +
"mkdir energy-forecast && cd energy-forecast\n" +
"conda create -n energy python=3.11 pandas numpy matplotlib statsmodels prophet -y\n" +
"conda activate energy\n" +
"# Save AEP_hourly.csv into data/\n" +
"```\n\n" +
"## The time-series libraries\n" +
"- **statsmodels** — classical time series (decomposition, ARIMA in W22)\n" +
"- **prophet** — Facebook's forecasting tool, great with seasonality (W23)\n" +
"- **pandas** — its datetime handling and resampling (from Week 3) are central to time series\n\n" +
"## Why a separate environment again\n" +
"Same discipline as Reddit Sentiment: each project gets sealed dependencies. Prophet in particular has finicky dependencies that you do *not* want colliding with your other projects' packages. An isolated conda env keeps Energy Forecast's toolkit from breaking anything else — and vice versa.\n\n" +
"## Start the repo right\n" +
"git init, create the public repo, and add a .gitignore for `data/` (the CSV is large-ish and downloadable) on day one — the same hygiene-first habit that's saved you from committing data and secrets in the last two projects.\n\n" +
"## Where this fits\n" +
"Today you set up the environment, download the AEP data, and initialise the repo. Tomorrow you load and plot it — first contact with the time series."
      ),
      S([
        { prompt: "Each project should get its own isolated conda environment, especially with finicky deps like Prophet.", answer: true, whenRight: "Right — sealed envs stop Prophet's dependencies from colliding with your other projects. Standard practice.", whenWrong: "Isolate it. Prophet's dependencies are finicky; a separate env keeps them from breaking other projects." },
        { prompt: "statsmodels and prophet are the classical and seasonality-friendly forecasting tools for this project.", answer: true, whenRight: "Right — statsmodels for decomposition/ARIMA, prophet for seasonality-heavy forecasting. The time-series toolkit.", whenWrong: "Yes — statsmodels (ARIMA, decomposition) and Prophet (seasonal forecasting) are the week's core libraries." },
        { prompt: "pandas' datetime and resampling skills from Week 3 are irrelevant to time series forecasting.", answer: false, whenRight: "Right — the opposite. Datetime indexing and resampling are central to all time-series work. Week 3 was the groundwork.", whenWrong: "They're central — time series lives on a DatetimeIndex and uses resampling constantly. Week 3 set this up." }
      ]),
      E("Your turn — set up","[CODE] 1. mkdir energy-forecast; create a conda env with pandas, numpy, matplotlib, statsmodels, prophet.\n2. Download AEP_hourly.csv into data/.\n3. git init, create the public repo, add .gitignore excluding data/.\n4. Confirm `python -c 'import statsmodels, prophet'` runs without error.")
    ]),
    D(3,"Load + plot the series","See the shape of electricity demand over time.",[
      L("Loading and visualising a time series",
"## What it is\n" +
"Load the AEP data with a proper DatetimeIndex and plot it — the first, essential look:\n\n" +
"```python\n" +
"import pandas as pd, matplotlib.pyplot as plt\n\n" +
"df = pd.read_csv('data/AEP_hourly.csv', parse_dates=['Datetime'],\n" +
"                 index_col='Datetime').sort_index()\n" +
"df = df.rename(columns={'AEP_MW': 'demand'})\n\n" +
"plt.figure(figsize=(14, 4))\n" +
"df['demand'].plot()\n" +
"plt.title('AEP hourly electricity demand (MW)')\n" +
"plt.savefig('charts/raw_series.png', dpi=150)\n" +
"```\n\n" +
"## The two must-dos when loading time series\n" +
"1. **parse_dates + index_col** — make the timestamp a real DatetimeIndex, not a string. This unlocks resampling, slicing by date, and every time-series operation. A time series with a string index is crippled.\n" +
"2. **sort_index()** — ensure the data is in chronological order. Out-of-order timestamps silently break decomposition, plotting, and modelling. Never assume the file is sorted.\n\n" +
"## What to look for in the plot\n" +
"The raw plot of years of hourly data looks dense, but you're hunting for: an overall **trend** (rising/falling demand over years?), **seasonality** (summer/winter cycles?), and **anomalies** (sensor gaps, impossible spikes). This first look shapes every modelling decision — you don't model what you haven't looked at.\n\n" +
"## Where this fits\n" +
"Today you load the series correctly (DatetimeIndex, sorted) and plot the full history, noting trend, seasonality, and any anomalies."
      ),
      L("See it in code (with output)",
"## Load, inspect, plot\n" +
"```python\n" +
"print(df.shape)\n" +
"# (121273, 1)   <- ~14 years of hourly data\n" +
"print(df.index.min(), 'to', df.index.max())\n" +
"# 2004-10-01 01:00:00 to 2018-08-03 00:00:00\n" +
"print(df['demand'].describe()[['min','mean','max']].round(0))\n" +
"# min    9581\n" +
"# mean  15499\n" +
"# max   25695\n" +
"# Plot shows: strong yearly seasonality (summer AC + winter heating peaks),\n" +
"# fairly flat long-term trend, no obvious sensor gaps\n" +
"```\n" +
"~14 years of hourly demand. The plot's repeating yearly humps (summer cooling, winter heating) are the seasonality you'll decompose next — already visible just from looking, which is exactly why the first plot matters."
      ),
      S([
        { prompt: "Parsing the timestamp into a DatetimeIndex (not a string) is required for time-series operations.", answer: true, whenRight: "Right — a real DatetimeIndex unlocks resampling, date slicing, decomposition. A string index cripples the series.", whenWrong: "You need a DatetimeIndex. parse_dates + index_col makes the timestamp usable for all time-series ops.", sim: "pd.read_csv(..., parse_dates=['Datetime'], index_col='Datetime')" },
        { prompt: "You should call sort_index() because out-of-order timestamps silently break time-series methods.", answer: true, whenRight: "Right — never assume the file is sorted. Unsorted timestamps corrupt decomposition, plots, and models.", whenWrong: "sort_index() guarantees chronological order. Out-of-order data quietly breaks time-series operations." },
        { prompt: "The first plot of the raw series is just decoration; the real work is modelling.", answer: false, whenRight: "Right — no. The first plot reveals trend, seasonality, and anomalies that shape every modelling choice. You don't model what you haven't seen.", whenWrong: "The first look is essential — it surfaces seasonality and anomalies that drive your modelling decisions." }
      ]),
      E("Your turn — load + plot","[CODE] In `01-explore.ipynb`:\n1. Load AEP_hourly.csv with a DatetimeIndex (parse_dates, index_col) and sort_index().\n2. Print shape, date range, and demand min/mean/max.\n3. Plot the full series; save to charts/raw_series.png.\n4. Markdown: do you see a trend? Seasonality? Any anomalies?")
    ]),
    D(4,"Decompose the series","Split it into trend, seasonality, and residual.",[
      L("Time series decomposition",
"## What it is\n" +
"**Decomposition** splits a time series into three interpretable components:\n\n" +
"```python\n" +
"from statsmodels.tsa.seasonal import seasonal_decompose\n\n" +
"# Use a daily-resampled slice so the decomposition is readable\n" +
"daily = df['demand'].resample('D').mean()\n" +
"result = seasonal_decompose(daily, model='additive', period=365)\n" +
"result.plot()\n" +
"```\n\n" +
"- **Trend** — the long-term direction (is demand growing over years?)\n" +
"- **Seasonal** — the repeating cycle (yearly summer/winter pattern)\n" +
"- **Residual** — what's left after removing trend + seasonal (the 'noise', or unexplained part)\n\n" +
"## Why decomposition matters\n" +
"It tells you **what's driving your series** and therefore what a model needs to capture. If the series is mostly strong seasonality with a flat trend (likely for energy), your model's main job is learning the seasonal cycle. The residual shows how much is left unexplained — if it's small and patternless, trend+seasonality explain almost everything; if the residual still has structure, there's a pattern your decomposition missed.\n\n" +
"## additive vs multiplicative\n" +
"- **additive** (`model='additive'`): components add up; seasonal swings are roughly constant in size over time.\n" +
"- **multiplicative**: seasonal swings grow with the trend (e.g. as overall demand rises, the summer spike gets bigger too).\nChoosing the right one matters: if seasonal amplitude grows over time, additive will misfit. For energy with stable seasonal swings, additive is usually right — but you check the plot to decide.\n\n" +
"## Where this fits\n" +
"Today you decompose the series, read each component, and judge whether trend or seasonality dominates — which tells you what your forecasting model must focus on."
      ),
      V("Time series decomposition explained","https://www.youtube.com/watch?v=0ar9extHObg",9,"various","Trend, seasonality, residual — what decomposition reveals and why it guides modelling."),
      S([
        { prompt: "Decomposition splits a series into trend, seasonal, and residual components.", answer: true, whenRight: "Right — those three: long-term direction, repeating cycle, and the leftover unexplained part.", whenWrong: "Trend + seasonal + residual. Each is interpretable and tells you what your model must capture." },
        { prompt: "If the residual after decomposition still shows clear structure, there's a pattern the decomposition missed.", answer: true, whenRight: "Right — a small, patternless residual means trend+seasonal explained almost everything. Structure left over = missed pattern.", whenWrong: "Structured residuals mean unexplained pattern remains. Ideally the residual is small and patternless." },
        { prompt: "Additive vs multiplicative decomposition is an arbitrary choice with no real consequence.", answer: false, whenRight: "Right — no. If seasonal swings grow with the trend, additive misfits; you need multiplicative. Check the plot to choose.", whenWrong: "It matters: additive assumes constant seasonal amplitude; multiplicative assumes it grows with the trend. Choose by the data." }
      ]),
      E("Your turn — decompose","[CODE] In 01-explore.ipynb:\n1. Resample demand to daily means.\n2. Run seasonal_decompose (try additive, period=365); plot the components and save.\n3. Markdown: does trend or seasonality dominate? Is the residual small/patternless or does it still have structure?\n4. One sentence: what must your forecasting model focus on, based on this?")
    ]),
    D(5,"Find daily + weekly patterns","The cycles within the cycles.",[
      L("Multiple seasonalities",
"## What it is\n" +
"Energy demand has **multiple overlapping seasonal cycles** — not just the yearly one decomposition showed, but daily and weekly patterns too. You surface them by grouping on time components (the groupby skills from Week 3, applied to a DatetimeIndex):\n\n" +
"```python\n" +
"df['hour'] = df.index.hour\n" +
"df['dayofweek'] = df.index.dayofweek\n\n" +
"by_hour = df.groupby('hour')['demand'].mean()\n" +
"by_dow  = df.groupby('dayofweek')['demand'].mean()\n" +
"```\n\n" +
"## The patterns you'll find\n" +
"- **Daily**: demand dips overnight (people asleep), rises through the morning, peaks in late afternoon/evening (AC + cooking + lights). A clear within-day cycle.\n" +
"- **Weekly**: weekdays differ from weekends (business/industrial load drops on Saturday/Sunday).\n\n" +
"## Why multiple seasonalities matter for modelling\n" +
"This is what makes energy forecasting hard *and* what tells you which model to use. A simple model that captures only one cycle (e.g. yearly) will systematically miss the daily and weekly structure. **Prophet (W23) handles multiple seasonalities natively** — which is exactly why it's a strong fit here. Knowing your series has daily + weekly + yearly cycles tells you in advance that a multi-seasonal model is needed. Diagnosis drives model choice.\n\n" +
"## These ARE features\n" +
"`hour` and `dayofweek` aren't just for plotting — they're **features** a machine-learning forecaster (W24's LSTM, or a tree model) would use. Extracting calendar features from the timestamp is the time-series version of the feature engineering you did in TaxiPulse.\n\n" +
"## Where this fits\n" +
"Today you extract hour and day-of-week, plot the average demand by each, and confirm the daily + weekly cycles that tell you a multi-seasonal model is needed."
      ),
      L("See it in code (with output)",
"## Daily and weekly demand profiles\n" +
"```python\n" +
"print(by_hour.round(0))\n" +
"# hour\n" +
"# 4    12800   <- overnight trough\n" +
"# 17   17900   <- late-afternoon peak\n" +
"print(by_dow.round(0))\n" +
"# 0 (Mon) 15800 ... 5 (Sat) 14600  6 (Sun) 14200  <- weekend dip\n" +
"```\n" +
"Two clear cycles on top of the yearly one: a ~5000 MW daily swing (4am trough to 5pm peak) and a weekday-vs-weekend gap. Three seasonalities stacked — which is precisely why a multi-seasonal model (Prophet) will be the right tool in two weeks."
      ),
      S([
        { prompt: "Energy demand has multiple overlapping cycles — daily, weekly, AND yearly.", answer: true, whenRight: "Right — a within-day cycle, a weekday/weekend cycle, and a yearly cycle, all stacked. That's what makes it hard.", whenWrong: "Multiple seasonalities stack: daily + weekly + yearly. A model must capture all three to forecast well." },
        { prompt: "Knowing the series has multiple seasonalities tells you in advance a multi-seasonal model (like Prophet) is needed.", answer: true, whenRight: "Right — diagnosis drives model choice. Multiple cycles -> you need a model that handles them (Prophet does, natively).", whenWrong: "Yes — the diagnosis points to the tool. Multiple seasonalities call for a multi-seasonal model like Prophet." },
        { prompt: "hour and dayofweek are only useful for plotting, not as model features.", answer: false, whenRight: "Right — no. They're real features a forecaster uses. Extracting calendar features is time-series feature engineering.", whenWrong: "They're features too — an LSTM or tree model uses hour/dayofweek. It's the time-series version of feature engineering." }
      ]),
      E("Your turn — find the cycles","[CODE] In 01-explore.ipynb:\n1. Extract hour and dayofweek from the index.\n2. Plot average demand by hour and by day-of-week; save both charts.\n3. Markdown: describe the daily cycle (trough/peak hours) and the weekday/weekend difference.\n4. One sentence: how many seasonalities does this series have, and what model trait does that require?")
    ]),
    D(6,"Chronological split + persistence baseline","The honest split and the bar to beat.",[
      L("Splitting time series and the persistence baseline",
"## What it is\n" +
"Two non-negotiable setup steps before any forecasting model: the chronological split and the persistence baseline.\n\n" +
"**Chronological split** — train on the past, test on the future:\n" +
"```python\n" +
"split = int(len(df) * 0.8)\n" +
"train, test = df.iloc[:split], df.iloc[split:]   # NO shuffle\n" +
"```\n\n" +
"**Persistence baseline** — predict each value equals the previous one:\n" +
"```python\n" +
"from sklearn.metrics import mean_absolute_error\n" +
"naive_pred = test['demand'].shift(1).dropna()\n" +
"actual = test['demand'].iloc[1:]\n" +
"mae = mean_absolute_error(actual, naive_pred)\n" +
"print(f'Persistence MAE: {mae:.0f} MW')\n" +
"```\n\n" +
"## Why persistence is the bar every model must clear\n" +
"'The next value equals the last value' sounds trivial, but for many real series it's **shockingly hard to beat** — because consecutive values are so correlated. If your ARIMA (W22), Prophet (W23), or LSTM (W24) can't beat persistence, it has learned nothing worth the complexity. Persistence is the honest yardstick: it turns 'my MAE is 800 MW' into 'my MAE is 800 vs persistence's 1100 — a real 27% gain' (or 'vs persistence's 750 — my fancy model is *worse*').\n\n" +
"## Why the baseline-first habit recurs\n" +
"This is the same discipline as every project: establish the naive bar first, so every later model is measured against something honest. A model without a baseline comparison is an unanchored number. You built this habit in TaxiPulse (predict-the-mean) and Reddit (pretrained baseline); time series has its own naive bar, and it's a tough one.\n\n" +
"## Where this fits\n" +
"Today you make the chronological split and compute the persistence-baseline MAE — the number every model in W22-24 must beat."
      ),
      S([
        { prompt: "The persistence baseline predicts that the next value equals the previous one.", answer: true, whenRight: "Right — 'tomorrow = today'. Trivial-sounding but hard to beat because consecutive values correlate strongly.", whenWrong: "Persistence = next value is the last value. It's the naive forecast and a surprisingly tough bar.", sim: "naive_pred = demand.shift(1)\n# each prediction = previous actual" },
        { prompt: "If your ARIMA/LSTM can't beat the persistence baseline, it hasn't learned anything worth its complexity.", answer: true, whenRight: "Right — persistence is the honest yardstick. Failing to beat it means the fancy model added nothing.", whenWrong: "Beating persistence is the minimum. A complex model that can't is pure overhead with no benefit." },
        { prompt: "For the train/test split here, you should shuffle the rows first for an unbiased estimate.", answer: false, whenRight: "Right — never shuffle time series. Split chronologically (past=train, future=test) or you leak the future.", whenWrong: "No shuffling — that leaks the future. Chronological split only: train on earlier, test on later." }
      ]),
      E("Your turn — split + baseline","[CODE] In 01-explore.ipynb:\n1. Make a chronological 80/20 split (no shuffle): train = first 80%, test = last 20%.\n2. Compute the persistence baseline on the test set (predict each value = previous value).\n3. Print the persistence MAE in MW.\n4. Markdown: record this MAE — it's the number every model in the next weeks must beat.")
    ]),
    D(7,"Ship Energy Forecast v0.1","Tag the exploration + baseline milestone.",[
      L("Shipping the v0.1 foundation",
"## What it is\n" +
"v0.1 ships the exploration and the baseline — the foundation every forecasting model builds on. Commit and tag:\n\n" +
"```bash\n" +
"git add 01-explore.ipynb charts/ TIMESERIES.md README.md\n" +
"git commit -m 'Energy Forecast v0.1: EDA + persistence baseline'\n" +
"git tag v0.1 && git push && git push --tags\n" +
"```\n\n" +
"## What the README should capture\n" +
"```text\n" +
"## v0.1 — Exploration + baseline\n" +
"- 14 years of AEP hourly demand (~121k points).\n" +
"- Three seasonalities: daily (4am trough -> 5pm peak), weekly (weekend dip),\n" +
"  yearly (summer/winter peaks) -> a multi-seasonal model is needed.\n" +
"- Chronological 80/20 split (no shuffle — future never leaks into training).\n" +
"- Persistence baseline MAE: [X] MW — the bar every model must beat.\n" +
"```\n\n" +
"## Why the baseline IS the deliverable\n" +
"It's tempting to feel v0.1 is 'just exploration' with no model. But the persistence baseline and the chronological split are the most important things you'll establish in the whole project — they're the honest measuring stick and the rule that keeps every later result truthful. A forecasting project without them produces impressive-looking numbers that mean nothing. v0.1 is the foundation that makes v0.2-v1.0 trustworthy.\n\n" +
"## The third rep of the process\n" +
"Notice the arc: load → explore → understand the data's nature → establish a baseline → (then model). It's the same process as TaxiPulse and Reddit Sentiment, adapted to temporal data. You're not relearning how to run a project — you're applying a process you own to a new domain. That transfer is the mark of real competence.\n\n" +
"## Where this fits\n" +
"Today you tag v0.1. Next week you build your first real forecasting model — ARIMA — and measure it against the persistence baseline you just set."
      ),
      S([
        { prompt: "The persistence baseline and chronological split are the most important things v0.1 establishes.", answer: true, whenRight: "Right — they're the honest yardstick and the rule that keeps every later result truthful. The foundation.", whenWrong: "They are the deliverable's core: the baseline to beat and the leak-proof split. Everything later rests on them." },
        { prompt: "v0.1 is 'just exploration' and adds little since it has no forecasting model yet.", answer: false, whenRight: "Right — no. The baseline + correct split are what make every future model's number trustworthy. Essential, not filler.", whenWrong: "v0.1 sets the honest measuring stick. Without it, later models produce meaningless numbers. It's foundational." },
        { prompt: "Energy Forecast follows the same load->explore->baseline->model process as the previous two projects.", answer: true, whenRight: "Right — same process, new (temporal) domain. Applying an owned process to a new data type is real competence.", whenWrong: "It's the third rep of the same arc, adapted to time series. You own the process now; only the techniques change." }
      ]),
      E("Your turn — ship v0.1","[PRODUCE] 1. Add a 'v0.1 — Exploration + baseline' README section: the seasonalities found, the chronological split, and the persistence MAE.\n2. Commit + tag:\n`git add . && git commit -m 'Energy Forecast v0.1: EDA + persistence baseline'`\n`git tag v0.1 && git push && git push --tags`\n\nPASS:\n[x] AEP data loaded with a DatetimeIndex, sorted\n[x] Full series plotted; trend/seasonality noted\n[x] Decomposed into trend/seasonal/residual\n[x] Daily + weekly cycles found\n[x] Chronological split (no shuffle)\n[x] Persistence baseline MAE computed\n[x] v0.1 tag pushed")
    ])
  ]
};

// Validate and write
const newWeeks = [W18, W19, W20, W21];
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
ds.weeks.splice(17, 4, ...newWeeks);  // replace index 17,18,19,20 (W18,W19,W20,W21)
fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log('SUCCESS: W18-W21 written. Total weeks:', ds.weeks.length);
newWeeks.forEach(w =>
  console.log(`  W${w.number} "${w.title}": ${w.days.length} days, ${w.concept_check.length} concept_check Qs`)
);
