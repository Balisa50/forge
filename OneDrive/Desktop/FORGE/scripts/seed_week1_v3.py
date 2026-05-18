"""
Seed Week 1 v3 — assigned projects, no learner choice.

Beginners can't pick well. They pick the easiest, the most popular, the safest.
v3 fixes that: every Week 1 has ONE specific assigned project with:
  - A fixed name
  - A fixed dataset / API / business spec (pre-chosen by us)
  - Acceptance criteria the learner must meet
  - A pointer to the 4-project arc Week 1 is the first slice of

The 4-project arc per discipline spans the full 17-24 weeks:
  Project 1 (Weeks 1-6)  : First buildable thing
  Project 2 (Weeks 7-12) : Real complexity, real deploy
  Project 3 (Weeks 13-18): Production-grade, team-grade
  Project 4 (Weeks 19-24): Capstone — a portfolio centerpiece

The learner walks away with 4 named, complete projects on their CV.
"""

import json, os
from urllib.parse import quote_plus

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data", "roadmaps")


def yt(vid):     return f"https://www.youtube.com/watch?v={vid}"
def search(q):   return f"https://www.youtube.com/results?search_query={quote_plus(q)}"
def video(title, url, mins, creator, why=""):
    return {"kind": "video", "title": title, "url": url, "duration_min": mins, "creator": creator, "why": why}
def reading(title, url, why=""):
    return {"kind": "reading", "title": title, "url": url, "why": why}
def exercise(title, body):
    return {"kind": "exercise", "title": title, "body": body}
def reflect(title, body):
    return {"kind": "reflection", "title": title, "body": body}
def day(n, title, summary, items):
    return {"number": n, "title": title, "summary": summary, "items": items}


# ═══════════════════════════════════════════════════════════════════════
# AI ENGINEERING — Project 1: "Polyglot" (English ↔ Spanish translator)
#
# Arc: P1 Polyglot (W1-6) → P2 Lexica RAG (W7-12) → P3 Agent (W13-18) → P4 SaaS (W19-24)
# ═══════════════════════════════════════════════════════════════════════
AI_ENG = {
    "context": (
        "You're building Polyglot — an English ↔ Spanish translator that ships with cost "
        "tracking, structured JSON output, and an evaluation suite. This week you take it "
        "from zero to v0.1 (working CLI). Why Spanish? Because you can verify quality "
        "easily (Google Translate as a sanity check), and the model is excellent at it — "
        "you'll learn the API, not fight the linguistics. Weeks 2-6 add a web UI, eval "
        "suite, and more languages. By Week 24 you'll have shipped 4 named portfolio "
        "projects: Polyglot → Lexica (RAG) → Agent → a deployed SaaS."
    ),
    "days": [
        day(1, "What an AI Engineer actually does",
            "You're a software engineer who calls an API that thinks. Get the mental model.",
            [
                video("Intro to Large Language Models (1 hr) — Andrej Karpathy",
                      yt("zjkBMFhNj_g"), 60, "Andrej Karpathy",
                      "The single clearest explanation of what an LLM is. Required."),
                reflect("Three sentences, no googling",
                        "(1) What is an LLM in your own words? (2) What can it NOT do reliably? (3) Why is 'temperature 0' useful for a translator?"),
            ]),
        day(2, "Python + venv setup (production-shaped)",
            "If your environment is sloppy, every bug after this is harder.",
            [
                video("Python in 100 Seconds — Fireship", yt("x7X9w_GIm1s"), 2, "Fireship", ""),
                video("Python venv + pip in 10 minutes",
                      search("python venv pip tutorial 2024 windows mac linux"),
                      10, "various", "Pick the one matching your OS."),
                exercise("Project skeleton",
                         "Create folder `polyglot/`. Inside: `python -m venv .venv` + activate. "
                         "`pip install openai python-dotenv`. Create files: `main.py`, `.env.example` "
                         "(with `OPENAI_API_KEY=`), `.gitignore` (with `.venv/` and `.env`), `README.md`. "
                         "Push the repo named `polyglot` to GitHub."),
            ]),
        day(3, "Get an OpenAI key and make your first call",
            "Magic becomes plumbing. This is the moment.",
            [
                reading("OpenAI quickstart — official",
                        "https://platform.openai.com/docs/quickstart",
                        "Bookmark this. You'll come back 50 times."),
                video("OpenAI Python SDK — first request (2024+)",
                      search("openai python sdk quickstart 2024 chat completion"),
                      10, "various"),
                exercise("hello.py",
                         "Get an OpenAI API key from platform.openai.com (Free $5 credits are plenty). "
                         "Put it in `.env`. Write `hello.py` that loads the key with `python-dotenv`, "
                         "calls `gpt-4o-mini` with the prompt 'Translate \"Hello, how are you?\" to "
                         "Spanish. Reply with ONLY the translation.', and prints the result. "
                         "Expected output: `Hola, ¿cómo estás?`. Commit `hello.py`."),
            ]),
        day(4, "System prompts — the only prompting skill you need today",
            "System prompt = the model's job description. Make it specific.",
            [
                video("System vs user prompts explained",
                      search("openai system prompt vs user prompt explained"),
                      10, "various"),
                exercise("Polyglot v0.1 — translate.py",
                         "Create `translate.py`. Define a constant `SYSTEM_PROMPT` (a Python string):\n\n"
                         "  'You are a professional English-to-Spanish translator. Translate the user'\n"
                         "  'input from English to Spanish. Reply with ONLY the Spanish translation —'\n"
                         "  'no preamble, no explanation, no English. Preserve tone (formal stays formal).'\n\n"
                         "Then `translate.py` should:\n"
                         "  1. Read the English sentence from `sys.argv[1]`\n"
                         "  2. Call gpt-4o-mini with temperature=0 (deterministic)\n"
                         "  3. Print only the Spanish result\n\n"
                         "Test: `python translate.py \"The meeting is at 3pm tomorrow.\"` should print "
                         "something like `La reunión es mañana a las 3 de la tarde.`"),
            ]),
        day(5, "Structured output — making it speak JSON",
            "Real apps consume JSON, not paragraphs. This is the unlock.",
            [
                video("OpenAI structured outputs / JSON mode",
                      search("openai structured outputs json mode 2024 python"),
                      12, "various"),
                exercise("Polyglot v0.2 — structured JSON",
                         "Modify `translate.py`. Instead of plain text, make the model return JSON of "
                         "shape:\n"
                         "  { \"translation\": \"...\", \"confidence\": \"high|medium|low\", \"notes\": \"...\" }\n\n"
                         "Use `response_format={'type': 'json_object'}` and tell the model in the system "
                         "prompt to reply with that exact JSON. Parse with `json.loads`. Print each field "
                         "on its own line. Test with: 'I want to break a leg.' (idiom — should set "
                         "confidence to medium/low and explain in notes)."),
            ]),
        day(6, "Cost tracking + error handling",
            "A toy crashes. A product handles failure and tells you what it costs.",
            [
                video("OpenAI API cost optimization for beginners",
                      search("openai api cost tracking python tutorial"),
                      10, "various"),
                exercise("Polyglot v0.3 — production-shaped",
                         "Wrap the API call in `try/except openai.APIError`. On error, print a clear "
                         "message and exit 1. After every successful call, read `response.usage` and "
                         "print: `→ cost: $0.000089 (input: 42 tok, output: 18 tok)`. Use the prices "
                         "at platform.openai.com/docs/pricing for gpt-4o-mini "
                         "(currently ~$0.15/1M input tokens, ~$0.60/1M output). Refuse inputs longer "
                         "than 500 characters with a clear error."),
            ]),
        day(7, "Ship Polyglot v0.1 + write the README",
            "Half the project is the README. Recruiters read it first.",
            [
                exercise("Final acceptance — Polyglot v0.1",
                         "Polyglot v0.1 is done when ALL of these pass:\n"
                         "  □ `python translate.py \"<English sentence>\"` returns valid Spanish JSON\n"
                         "  □ Cost line printed after every call\n"
                         "  □ Error caught and printed cleanly if API key is missing or invalid\n"
                         "  □ Inputs > 500 chars are refused\n"
                         "  □ README has: 1-paragraph intro, install steps, usage example, screenshot "
                         "    of a successful run, 'Roadmap' section listing v0.2-v1.0 features\n"
                         "  □ Repo pushed to GitHub with a v0.1 tag (`git tag v0.1 && git push --tags`)\n"
                         "  □ 10 sample English sentences in `tests/samples.txt` (committed)\n\n"
                         "Test all 10 sentences and paste the output as a code block in the README."),
                reflect("The arc ahead",
                        "Polyglot v0.1 is your first AI Engineering artifact. Weeks 2-6 will turn it into "
                        "a web app (Streamlit), add an eval suite that grades 100 translations against a "
                        "ground truth, add 4 more languages, and add prompt-injection defences. By Week 6 "
                        "you'll have a deployable v1.0."),
            ]),
    ],
    "topics": [
        "Python venv + python-dotenv + pip",
        "OpenAI Python SDK 1.x (chat.completions.create)",
        "System prompt vs user prompt — when each one matters",
        "Temperature, model selection (gpt-4o-mini for cost-sensitive)",
        "Structured outputs / JSON mode + json.loads parsing",
        "Cost tracking via response.usage",
        "Defensive error handling with try/except",
    ],
    "tasks": [
        "Create the `polyglot/` repo with venv + .env + .gitignore",
        "Get an OpenAI key and successfully run hello.py returning Spanish text",
        "Write translate.py that takes argv[1] and prints Spanish translation",
        "Upgrade to structured JSON output with confidence + notes",
        "Add cost printing + error handling + 500-char input limit",
        "Write a production-grade README with usage example + roadmap",
        "Tag the release v0.1 and push to GitHub",
    ],
    "project": (
        "Polyglot v0.1 — an English-to-Spanish CLI translator. Specific deliverables: "
        "a `translate.py` that reads `sys.argv[1]`, calls gpt-4o-mini with temperature 0, "
        "returns JSON `{translation, confidence, notes}`, prints the per-call cost, errors "
        "out cleanly on missing key / too-long input, and a README documenting all of it. "
        "Repo: `polyglot` on your GitHub, tagged v0.1. This is the foundation of a 6-week "
        "build that turns into your first AI portfolio piece."
    ),
    "exercises": [
        "Add `--language es|fr|de|ja` flag to translate to one of 4 languages (only es is required this week)",
        "Run the same sentence 5x at temperature=1.0 — does the output drift?",
        "Try the same sentence with `gpt-4o-mini` vs `gpt-4o` — compare cost and quality",
        "Add a `--explain` flag that returns the English-back-translation alongside, for verification",
    ],
    "questions": [
        "Why temperature=0 for a translator? When would you raise it?",
        "What's the cost per 1000 translations at gpt-4o-mini prices? Show your math.",
        "Where does the model still fail — slang, idioms, profanity, regional words?",
        "What's the smallest paid SaaS Polyglot could become at v1.0?",
    ],
    "outputs": [
        "GitHub repo `polyglot` with v0.1 tag",
        "Working `translate.py` + `hello.py`",
        "README with screenshot + 10 tested sentences",
        "`.env.example` so others can clone-and-run",
    ],
}


# ═══════════════════════════════════════════════════════════════════════
# ML ENGINEERING — Project 1: "FlightWise" — US Flight Delay Predictor
#
# Arc: P1 FlightWise (W1-6) → P2 Churn (W7-12) → P3 Vision (W13-18) → P4 MLOps (W19-24)
# Dataset: BTS On-Time Performance (US Bureau of Transportation Statistics), 2023 subset
# ═══════════════════════════════════════════════════════════════════════
ML_ENG = {
    "context": (
        "You're building FlightWise — a model that predicts whether a US domestic flight "
        "will be delayed > 15 min. Dataset: a specific cleaned BTS On-Time slice from 2023 "
        "(we point you to the exact file). Why this? It's real (millions of flights), it's "
        "imbalanced (most flights are on time — like real fraud/churn data), and it has rich "
        "features (carrier, origin, dest, scheduled time, day of week). By Week 6 you'll "
        "have a deployable model with a Flask API. Then Week 7 starts Project 2."
    ),
    "days": [
        day(1, "ML is function approximation. That's it.",
            "Strip the mystery. Build the mental model.",
            [
                video("But what is a neural network — 3Blue1Brown",
                      yt("aircAruvnKk"), 19, "3Blue1Brown",
                      "The clearest visual primer. Worth every minute."),
                video("Machine Learning explained — Fireship",
                      search("machine learning 100 seconds fireship"), 3, "Fireship", ""),
                reflect("Predict the delay",
                        "If you had ONE feature to predict if a flight is delayed > 15min, what would "
                        "you pick — carrier, departure hour, origin airport, day of week? Write down "
                        "your guess. We'll find out on Day 5 if you were right."),
            ]),
        day(2, "Python data stack setup",
            "Anaconda or uv. Either works. Pick one and stop deliberating.",
            [
                video("Anaconda install + first notebook",
                      search("anaconda install jupyter notebook beginner 2024"),
                      15, "various"),
                exercise("FlightWise repo + first notebook",
                         "Create folder `flightwise/`. Run `conda create -n flightwise python=3.11 "
                         "pandas numpy scikit-learn matplotlib seaborn jupyter` "
                         "(or use venv + pip). Activate. Open Jupyter. Create "
                         "`01_setup.ipynb`. Cell 1: `import pandas as pd, numpy as np, "
                         "sklearn; print(pd.__version__, np.__version__, sklearn.__version__)`. "
                         "Push to a GitHub repo named `flightwise`."),
            ]),
        day(3, "Get the FlightWise dataset",
            "Specific dataset. No 'pick your own'. Real BTS data, ~5M rows.",
            [
                reading("BTS On-Time Performance — Kaggle 2023 mirror",
                        "https://www.kaggle.com/datasets/patrickzel/flight-delay-and-cancellation-dataset-2019-2023",
                        "Download `flights_sample_3m.csv` (3M rows, ~250MB). If Kaggle gives you "
                        "trouble, search 'BTS on time 2023 flight delay sample CSV' and grab any mirror."),
                exercise("Load it",
                         "Place the CSV in `flightwise/data/raw.csv` (gitignore the data/ folder — too "
                         "big to commit). In `02_load.ipynb`: `df = pd.read_csv('data/raw.csv')`. "
                         "Run `df.shape`, `df.head()`, `df.info()`. Add a markdown cell answering: "
                         "How many rows? How many columns? Which columns look most useful for predicting "
                         "delay?"),
            ]),
        day(4, "Define the target + clean the columns",
            "Modelling is 80% data prep. Today is the prep day.",
            [
                video("pandas data cleaning crash course",
                      search("pandas data cleaning tutorial python 2024"),
                      25, "various"),
                exercise("Create the target column",
                         "In `03_clean.ipynb`:\n"
                         "  1. Create binary target: `df['delayed'] = (df['ARR_DELAY'] > 15).astype(int)`\n"
                         "  2. Drop rows where ARR_DELAY is null (cancelled flights — exclude for now)\n"
                         "  3. Pick these features only: `CARRIER`, `ORIGIN`, `DEST`, `CRS_DEP_TIME`, "
                         "     `DAY_OF_WEEK`, `MONTH`, `DISTANCE`. Plus target `delayed`.\n"
                         "  4. Save the clean subset as `data/clean.parquet` (gitignored).\n"
                         "  5. Print: how many rows are delayed vs on time? What % is delayed? "
                         "     (This is your class imbalance.)"),
            ]),
        day(5, "EDA — find what predicts delay",
            "Before you model, you look. Three plots.",
            [
                video("Seaborn for EDA — beginner",
                      search("seaborn data visualization tutorial python"),
                      20, "various"),
                exercise("3 plots, 3 findings",
                         "In `04_eda.ipynb`, produce:\n"
                         "  Plot 1: Delay rate by HOUR of scheduled departure (bar chart, x=hour, "
                         "    y=% delayed). Use `CRS_DEP_TIME // 100` to extract the hour.\n"
                         "  Plot 2: Delay rate by carrier (horizontal bar, sorted)\n"
                         "  Plot 3: Delay rate by day of week\n"
                         "Under each plot, write 1 sentence: what's the strongest signal you see? "
                         "Compare to your Day 1 guess — were you right?"),
            ]),
        day(6, "Train your first model",
            "Logistic regression baseline. Don't tune yet. Just get a number.",
            [
                video("scikit-learn beginner tutorial",
                      search("scikit-learn tutorial beginner logistic regression"),
                      25, "various"),
                exercise("Baseline model",
                         "In `05_model.ipynb`:\n"
                         "  1. Load `data/clean.parquet`\n"
                         "  2. One-hot encode CARRIER, ORIGIN, DEST (use `pd.get_dummies` — TOP 20 "
                         "     airports + carriers only, group the rest as 'OTHER' to keep dimensionality "
                         "     sane)\n"
                         "  3. `train_test_split(X, y, test_size=0.2, random_state=42)`\n"
                         "  4. Train `LogisticRegression(max_iter=1000, class_weight='balanced')`\n"
                         "  5. Evaluate: `classification_report(y_test, model.predict(X_test))`\n"
                         "  6. Print the confusion matrix\n"
                         "Save the model: `joblib.dump(model, 'model.pkl')`. Commit `model.pkl` "
                         "(it should be < 5MB)."),
            ]),
        day(7, "Ship FlightWise v0.1 + README",
            "A notebook nobody can run is a sketch. Make it runnable.",
            [
                exercise("Final acceptance — FlightWise v0.1",
                         "Pass criteria:\n"
                         "  □ 5 notebooks: 01_setup, 02_load, 03_clean, 04_eda, 05_model — all run "
                         "    top to bottom without errors\n"
                         "  □ Recall on the 'delayed' class is ≥ 50% (use `class_weight='balanced'` to "
                         "    get there — naive accuracy is misleading)\n"
                         "  □ `model.pkl` committed\n"
                         "  □ README has: project description, dataset source link, how to download "
                         "    data, how to run notebooks in order, your test set performance, a "
                         "    'What's next' section listing Weeks 2-6 plans\n"
                         "  □ `requirements.txt` committed (use `pip freeze > requirements.txt`)\n"
                         "  □ A 1-paragraph 'Honest verdict' in the README: would you trust this model "
                         "    to make a real decision? Why or why not?\n\n"
                         "Tag the release v0.1."),
                reflect("The 6-week arc",
                        "Week 1: baseline. Week 2: feature engineering + cross-validation. Week 3: "
                        "XGBoost + LightGBM. Week 4: hyperparameter tuning with Optuna. Week 5: "
                        "Flask API + Docker. Week 6: deployed to Render or Fly.io with a public URL. "
                        "Project 1 done."),
            ]),
    ],
    "topics": [
        "Anaconda / venv + jupyter workflow",
        "pandas — read_csv, dropna, get_dummies, parquet",
        "Defining binary classification targets",
        "Class imbalance — class_weight='balanced'",
        "train_test_split with random_state",
        "Logistic regression baselines",
        "classification_report (precision, recall, F1) — why accuracy lies",
    ],
    "tasks": [
        "Set up Python data stack + create `flightwise` repo",
        "Download BTS On-Time 2023 CSV from Kaggle",
        "Clean: define target (ARR_DELAY > 15), pick 7 features, save clean parquet",
        "Run EDA — plot delay rate by hour, carrier, day-of-week",
        "Train a LogisticRegression baseline with class_weight='balanced'",
        "Evaluate with classification_report — recall on 'delayed' ≥ 50%",
        "Polish 5 notebooks + README + requirements.txt, tag v0.1",
    ],
    "project": (
        "FlightWise v0.1 — a binary classifier predicting if a US domestic flight will be "
        "delayed > 15 min. Specific dataset: BTS On-Time 2023 (Kaggle mirror). Specific "
        "features: carrier, origin, dest, scheduled departure hour, day of week, month, "
        "distance. Specific model: balanced LogisticRegression baseline. Specific target: "
        "recall ≥ 50% on the 'delayed' class. Repo: `flightwise` on GitHub. 5 numbered "
        "notebooks + model.pkl + README. Tagged v0.1."
    ),
    "exercises": [
        "Plot a baseline 'always predict on-time' classifier — what's its accuracy? Its recall?",
        "Re-train without `class_weight='balanced'` — what changes? Why is balanced fairer here?",
        "Drop CARRIER from features. Does accuracy fall? Why or why not?",
        "Save your X_test predictions to CSV. Open in Excel. Hunt for patterns in the misclassifications.",
    ],
    "questions": [
        "Why is accuracy a misleading metric for this problem?",
        "If your model predicts 'delayed' for every flight, what's its recall? Its precision?",
        "Which feature do you suspect leaks information (data leakage risk)?",
        "If American Airlines uses your model to decide which flights to overbook, what could go wrong?",
    ],
    "outputs": [
        "`flightwise` GitHub repo with 5 notebooks + model.pkl + README + requirements.txt",
        "Recall on 'delayed' class ≥ 50% (documented in README)",
        "EDA plots committed in `figures/`",
        "v0.1 git tag",
    ],
}


# ═══════════════════════════════════════════════════════════════════════
# FULL STACK WEB — Project 1: "Bean Forge Café" — fictional café 1-pager
#
# Arc: P1 Bean Forge static site (W1-4) → P2 Link-aggregator SaaS (W5-12)
#      → P3 Habit-tracker Next.js app (W13-20) → P4 Capstone (W21-24)
# ═══════════════════════════════════════════════════════════════════════
FS_WEB = {
    "context": (
        "You're building beanforge.cafe — a 1-page website for a fictional specialty coffee "
        "shop named Bean Forge. We give you the menu, prices, hours, address, photos. Your "
        "job: ship it as a live HTML+CSS site on Netlify by Sunday. Why fictional? Because "
        "you finish in 1 week, not 6 — no waiting for a real owner to email back specs. "
        "Weeks 5-12 turn into a real SaaS clone. By Week 24 you have 4 named, live projects."
    ),
    "days": [
        day(1, "How the web works — 8-minute mental model",
            "Browser ↔ DNS ↔ server. Get the picture before the syntax.",
            [
                video("How the internet works — Fireship",
                      search("fireship how internet works 100 seconds"), 8, "Fireship", ""),
                video("HTML in 100 Seconds — Fireship", yt("ok-plXXHlWw"), 2, "Fireship", ""),
                reading("Bean Forge spec — copy into your repo",
                        "https://raw.githubusercontent.com/forge-ab/forge-specs/main/beanforge.md",
                        "If this URL 404s, just use the spec below: Name: Bean Forge. Tagline: "
                        "'Coffee, sharpened.' Menu: Espresso $3, Cortado $4, Pour Over $5, Cold Brew "
                        "$5, Croissant $4. Hours: Mon-Fri 7am-6pm, Sat-Sun 8am-4pm. Address: "
                        "42 Anvil Street. Phone: +1 555-0142. Use Unsplash for photos."),
            ]),
        day(2, "HTML — the structure (semantic, not div soup)",
            "Real tags: header, main, section, footer. Not 50 divs.",
            [
                video("HTML crash course — Web Dev Simplified",
                      search("html crash course web dev simplified beginner"),
                      35, "Web Dev Simplified"),
                exercise("Build the skeleton",
                         "Create folder `beanforge/`. Create `index.html`. Build these sections with "
                         "semantic tags (NO css yet):\n"
                         "  - `<header>` with nav links (Menu, Hours, Visit)\n"
                         "  - `<section id='hero'>` with the name + tagline + a Visit button\n"
                         "  - `<section id='menu'>` with the 5 menu items + prices as a `<ul>`\n"
                         "  - `<section id='hours'>` with the hours table (use `<table>`)\n"
                         "  - `<section id='visit'>` with address + phone + a map link\n"
                         "  - `<footer>` with © Bean Forge 2026\n"
                         "View in browser — should render readable text with no styling. Push to "
                         "GitHub as repo `beanforge`."),
            ]),
        day(3, "CSS — the look (no framework)",
            "Modern CSS is good. Custom properties + flexbox cover 90%.",
            [
                video("Modern CSS — Kevin Powell",
                      search("kevin powell modern css beginner 2024"),
                      40, "Kevin Powell", "Best CSS teacher on YouTube."),
                exercise("Style Bean Forge",
                         "Create `style.css`. Required:\n"
                         "  - Custom properties at :root: `--coffee: #3b2418; --cream: #f5ead7; "
                         "    --copper: #b87333;`\n"
                         "  - System font stack (no Google Fonts yet)\n"
                         "  - Hero: full-viewport, centered text, cream background, espresso photo as "
                         "    a CSS background-image with overlay\n"
                         "  - Menu: 2-column grid on desktop, 1-column on mobile\n"
                         "  - Hours table: striped rows, centered\n"
                         "  - Buttons: copper background, cream text, hover lifts 2px\n"
                         "Use real Unsplash coffee photos (https://unsplash.com/s/photos/coffee — pick "
                         "any). Inspect each image's hosted URL and hotlink (Unsplash allows this for "
                         "free)."),
            ]),
        day(4, "Responsive — mobile FIRST",
            "70% of traffic is on phones. Don't make it an afterthought.",
            [
                video("Responsive design — mobile first",
                      search("responsive web design mobile first 2024"),
                      25, "various"),
                exercise("Test at 3 widths",
                         "Add media queries:\n"
                         "  - Base styles (≤ 600px): single column, full-width buttons\n"
                         "  - `@media (min-width: 600px)`: 2-column menu, max-width: 1100px on main\n"
                         "  - `@media (min-width: 1024px)`: hero with 2-column (text + image)\n"
                         "Open Chrome DevTools → toggle device mode. Test at iPhone 13 (390px), "
                         "iPad (768px), Desktop (1280px). Each should look intentional, not broken."),
            ]),
        day(5, "Click-to-call + Maps + favicon",
            "Real customers tap, they don't type.",
            [
                video("HTML forms + tel/mailto links",
                      search("html tel mailto links tutorial"),
                      8, "various"),
                exercise("Make Bean Forge contactable",
                         "In the Visit section:\n"
                         "  - Phone is a clickable `<a href='tel:+15550142'>+1 555-0142</a>`\n"
                         "  - Email `<a href='mailto:hello@beanforge.cafe'>hello@beanforge.cafe</a>`\n"
                         "  - 'Get Directions' button opens Google Maps: "
                         "    `<a href='https://www.google.com/maps/search/?api=1&query=42+Anvil+Street' "
                         "    target='_blank'>Get Directions</a>`\n"
                         "Add a favicon: a coffee bean emoji as a 32×32 PNG. Use favicon.io to generate "
                         "from text. Drop it in the repo root, link in `<head>`."),
            ]),
        day(6, "Git + GitHub + Netlify deploy",
            "If it's not live, it doesn't exist.",
            [
                video("Git + GitHub for beginners — freeCodeCamp",
                      search("git github crash course freecodecamp"),
                      40, "freeCodeCamp"),
                video("Deploy static site to Netlify in 5 min",
                      search("deploy static site netlify 2024"), 8, "various"),
                exercise("Go live",
                         "Push the latest to GitHub. Go to netlify.com → New site from Git → connect "
                         "GitHub → pick `beanforge` repo → Deploy. You get a *.netlify.app URL. "
                         "Custom subdomain: in Netlify site settings → Domain → change to "
                         "`yourname-beanforge.netlify.app`. Open the live URL on your phone. Tap the "
                         "phone link — it should open the dialer."),
            ]),
        day(7, "Performance + SEO + ship",
            "Lighthouse ≥ 90 on Performance. That's the job.",
            [
                exercise("Final polish — pass criteria",
                         "□ Add meta description and Open Graph tags to `<head>`:\n"
                         "    <meta name='description' content='Bean Forge — specialty coffee, sharpened.'>\n"
                         "    <meta property='og:title' content='Bean Forge'>\n"
                         "    <meta property='og:image' content='[hero photo URL]'>\n"
                         "□ All images have `loading='lazy'` and width/height attrs (prevents layout shift)\n"
                         "□ Run Chrome DevTools → Lighthouse → Mobile → Performance ≥ 90, Accessibility ≥ 90,\n"
                         "    Best Practices ≥ 90, SEO ≥ 90. Screenshot the score.\n"
                         "□ README has: live URL at the top, Lighthouse screenshot, screenshot of the site\n"
                         "    on a phone, your name, 'Built for Bean Forge — Week 1 of FORGE Full-Stack Web'\n"
                         "□ Tag git release v0.1\n"
                         "□ Paste the live URL into a WhatsApp message to yourself — verify the OG preview\n"
                         "    shows the coffee photo + 'Bean Forge'"),
                reflect("The 4-week arc",
                        "Week 2: JavaScript fundamentals + add an interactive menu filter. Week 3: "
                        "add a contact form (Netlify Forms). Week 4: refactor into Astro for "
                        "components + a /blog page. Project 1 ships at end of W4. Then Project 2 "
                        "(W5-12) is a Next.js + Stripe SaaS."),
            ]),
    ],
    "topics": [
        "Semantic HTML5 (header, main, section, footer, table)",
        "Modern CSS — custom properties, flexbox, grid, media queries",
        "Mobile-first responsive design",
        "Click-to-call (tel:), email (mailto:), Maps deeplinks",
        "Favicons + Open Graph tags",
        "Git basics — init, add, commit, push",
        "Netlify deploy + Lighthouse performance",
    ],
    "tasks": [
        "Build the semantic HTML skeleton with all 5 Bean Forge sections",
        "Style with custom properties, no framework, coffee-shop palette",
        "Make responsive at 390px / 768px / 1280px",
        "Add tel:, mailto:, Maps directions, favicon",
        "Push to GitHub repo `beanforge`",
        "Deploy to Netlify with a custom subdomain",
        "Score ≥ 90 on all 4 Lighthouse categories",
    ],
    "project": (
        "Bean Forge Café — a live 1-page website for the fictional Bean Forge coffee shop. "
        "Spec is provided (name, tagline, menu, prices, hours, address, phone). Tech: "
        "vanilla HTML + CSS, no JS yet, no framework. Live on a `yourname-beanforge.netlify.app` "
        "URL. Lighthouse ≥ 90 on all four categories. Repo: `beanforge` on GitHub, tagged v0.1."
    ),
    "exercises": [
        "Add a `prefers-color-scheme: dark` rule — site goes dark at night",
        "Replace one image with a Unsplash photo you actually like better",
        "Add a small SVG coffee-bean icon next to each menu item",
        "Run `npx pa11y https://yoursite.netlify.app` — fix any reported a11y issues",
    ],
    "questions": [
        "Why is mobile-first easier than desktop-first in CSS?",
        "What's the trade-off of hotlinking Unsplash vs hosting images yourself?",
        "What does `loading='lazy'` do and why does Lighthouse reward it?",
        "If Bean Forge added 50 menu items, what would break first?",
    ],
    "outputs": [
        "Live Netlify URL (yourname-beanforge.netlify.app)",
        "`beanforge` GitHub repo tagged v0.1",
        "Lighthouse screenshot ≥ 90 on all 4 categories in README",
        "Phone-screen screenshot in README",
    ],
}


# ═══════════════════════════════════════════════════════════════════════
# MOBILE ENG — Project 1: "Hydra" — water tracker
#
# Arc: P1 Hydra (W1-5) → P2 Notes app w/ auth (W6-12)
#      → P3 Location app (W13-18) → P4 Play Store capstone (W19-24)
# ═══════════════════════════════════════════════════════════════════════
MOBILE = {
    "context": (
        "You're building Hydra — a water-intake tracker. Tap a glass icon, it fills. 8 "
        "glasses = day complete. Saves to local storage. Runs on YOUR phone by Sunday. "
        "Why a water tracker? Because it's small enough to ship in 1 week, useful enough "
        "that YOU'LL use it, and it teaches every Expo + React Native fundamental. "
        "Weeks 2-5 add reminders, history, streaks. Then Project 2 starts."
    ),
    "days": [
        day(1, "Why React Native + Expo (not Swift / Kotlin)",
            "One codebase, two stores. Save your weekends.",
            [
                video("React Native in 100 Seconds — Fireship", yt("gvkqT_Uoahw"), 2, "Fireship", ""),
                video("Expo vs bare React Native — which to use",
                      search("expo vs react native cli 2024"), 8, "various"),
                reflect("Your daily flow",
                        "How many glasses of water do you drink a day? Open your phone. Imagine an app "
                        "with 8 glass icons. You tap one when you drink. That's Hydra. Sketch the screen "
                        "on paper. 3 mins. Take a photo. You'll attach it to your README later."),
            ]),
        day(2, "Install Node, Expo CLI, Expo Go on your phone",
            "If it's not running on your phone tonight, this week is wasted.",
            [
                video("Expo Go quickstart 2024",
                      search("expo go quickstart react native 2024"),
                      20, "various"),
                exercise("Hello phone",
                         "1. Install Node.js 20+ from nodejs.org\n"
                         "2. Install Expo Go on your phone (Play Store or App Store)\n"
                         "3. In your terminal: `npx create-expo-app@latest hydra --template blank`\n"
                         "4. `cd hydra && npx expo start`\n"
                         "5. Scan the QR code with Expo Go (Android) or the camera app (iOS)\n"
                         "6. See 'Open up App.js to start working on your app!' on your phone\n"
                         "Push the `hydra` folder to GitHub."),
            ]),
        day(3, "React fundamentals (just enough)",
            "Components, props, JSX. You don't need everything yet.",
            [
                video("React in 100 Seconds — Fireship", yt("Tn6-PIqc4UM"), 2, "Fireship", ""),
                video("React Native components + props",
                      search("react native components props tutorial 2024"),
                      25, "various"),
                exercise("Build a Glass component",
                         "Create `components/Glass.js`. It's a `<TouchableOpacity>` showing a glass "
                         "icon. Takes 2 props: `filled` (bool) and `onPress` (function). When filled "
                         "is true, show a blue droplet emoji 💧. When false, show an empty circle ⚪. "
                         "Use it 8 times in App.js with hard-coded `filled={false}` for all 8. Save. "
                         "Your phone hot-reloads — you should see 8 empty circles in a row."),
            ]),
        day(4, "useState — making things change",
            "State is the heartbeat of an app. Tap → fill.",
            [
                video("useState — Web Dev Simplified",
                      search("usestate react hook explained beginner"),
                      12, "Web Dev Simplified"),
                exercise("Tap to fill",
                         "In App.js: `const [glasses, setGlasses] = useState([false, false, false, "
                         "false, false, false, false, false])`. Render 8 Glass components, each "
                         "passing `filled={glasses[i]}` and `onPress={() => { const next = "
                         "[...glasses]; next[i] = !next[i]; setGlasses(next); }}`. Test: tap a glass "
                         "→ it fills. Tap again → it empties."),
            ]),
        day(5, "Style it — feels like a real app",
            "Padding, colors, fonts. The 'design' difference.",
            [
                video("React Native styling — flexbox + StyleSheet",
                      search("react native styling stylesheet flexbox 2024"),
                      20, "various"),
                exercise("Polish",
                         "Add real styling:\n"
                         "  - SafeAreaView wrapper\n"
                         "  - Big title: 'Hydra' (font size 36, bold)\n"
                         "  - Subtitle: 'X / 8 glasses today' that updates with state\n"
                         "  - Glasses arranged as a 4x2 grid (flexWrap: 'wrap')\n"
                         "  - Soft blue background (#e0f2fe)\n"
                         "  - When all 8 are filled, show: '✨ You hit 8 today.'\n"
                         "  - A reset button at the bottom that empties all glasses"),
            ]),
        day(6, "AsyncStorage — survive the restart",
            "An app that forgets is useless.",
            [
                video("AsyncStorage in Expo — save state to device",
                      search("async storage expo tutorial save state"),
                      15, "various"),
                exercise("Persist Hydra",
                         "`npx expo install @react-native-async-storage/async-storage`\n"
                         "On app load (useEffect with empty deps array): read 'hydra-glasses' from "
                         "AsyncStorage. If found, parse JSON and setGlasses. If not, do nothing.\n"
                         "Every time setGlasses runs: write the new array back as JSON to "
                         "'hydra-glasses'.\n"
                         "Test: tap 3 glasses → close Expo Go app fully → reopen → glasses are still "
                         "filled. That's persistence."),
            ]),
        day(7, "Ship Hydra v0.1 + APK",
            "Build a real APK, install it on your phone, send to a friend.",
            [
                video("EAS Build — first APK from Expo",
                      search("expo eas build apk android 2024"),
                      15, "various"),
                exercise("Final acceptance — Hydra v0.1",
                         "□ App runs in Expo Go on your phone — 8 glasses, tap to fill\n"
                         "□ State persists across app closes (AsyncStorage works)\n"
                         "□ 'X / 8 glasses today' counter updates live\n"
                         "□ Reset button works\n"
                         "□ All-filled celebration message appears\n"
                         "□ Run `eas build --platform android --profile preview` — get a free APK URL\n"
                         "    (you'll need to sign up for an Expo account; free tier is fine)\n"
                         "□ Download the APK to your phone, install it (you'll need 'unknown sources' "
                         "    enabled), open it — it should run standalone (no Expo Go needed)\n"
                         "□ README has: app screenshot, APK download link, install instructions, "
                         "    'Weeks 2-5 roadmap' section\n"
                         "□ Tag v0.1, push to GitHub"),
                reflect("Did it survive your day?",
                        "Did you actually use Hydra to track your water today? If yes — what's "
                        "annoying? If no — why not?"),
            ]),
    ],
    "topics": [
        "Expo + React Native workflow with Expo Go",
        "JSX, components, props",
        "useState for local component state",
        "TouchableOpacity, View, Text, SafeAreaView",
        "Flexbox in React Native (it's slightly different from web)",
        "AsyncStorage for persistence",
        "EAS Build basics — Android APK",
    ],
    "tasks": [
        "Install Node, Expo CLI, Expo Go on phone",
        "Create the `hydra` Expo project, run on your phone",
        "Build a Glass component with filled prop + onPress",
        "Wire 8 glasses to a state array with tap-to-fill",
        "Style with SafeAreaView, title, counter, grid, reset",
        "Persist state to AsyncStorage so restart survives",
        "Build an APK with EAS, install on your phone",
    ],
    "project": (
        "Hydra v0.1 — a single-screen water tracker. 8 glass icons, tap to fill, reset "
        "button, '✨ You hit 8' message at full, persists via AsyncStorage. Runs on your "
        "phone as a real installed APK (not just Expo Go). Repo: `hydra` on GitHub. "
        "Tagged v0.1."
    ),
    "exercises": [
        "Add haptic feedback on glass tap (`expo-haptics`)",
        "Show today's date at the top, formatted nicely",
        "Make the glass icon a custom SVG instead of an emoji",
        "Replace 8 hard-coded glasses with a configurable goal (4-12)",
    ],
    "questions": [
        "What happens to your state if AsyncStorage fails to read?",
        "Why use SafeAreaView and not a plain View at the root?",
        "What's the difference between an Expo Go preview and an EAS-built APK?",
        "If you released Hydra to the Play Store tomorrow, what's the first thing reviewers would reject?",
    ],
    "outputs": [
        "`hydra` GitHub repo tagged v0.1",
        "Working APK link from EAS Build",
        "App screenshot in README",
        "Screen recording (10-15 sec) of you tapping glasses — embed link in README",
    ],
}


# ═══════════════════════════════════════════════════════════════════════
# DEVOPS & CLOUD — Project 1: "Edge Portfolio" — portfolio on S3+CloudFront via Terraform
#
# Arc: P1 Edge (W1-5) → P2 3-tier app on K8s (W6-12)
#      → P3 GitOps + IaC pipeline (W13-18) → P4 Multi-region capstone (W19-24)
# ═══════════════════════════════════════════════════════════════════════
DEVOPS = {
    "context": (
        "You're building Edge Portfolio — a 1-page personal portfolio served from AWS S3 + "
        "CloudFront, provisioned ENTIRELY with Terraform. No console clicks for the "
        "infra. Why this? It's the smallest piece of real production cloud infra: storage "
        "+ a CDN + IAM. Total cost: under $1/month. Tagged v0.1 by Sunday. Weeks 2-5 add "
        "HTTPS via ACM + a custom domain + GitHub Actions CI/CD."
    ),
    "days": [
        day(1, "The shell — every cloud server is a Linux box",
            "Get comfortable in terminal. Today is just shell.",
            [
                video("Linux for hackers — NetworkChuck Ep 1",
                      search("networkchuck linux for hackers ep 1"),
                      30, "NetworkChuck"),
                exercise("Set up your shell",
                         "Windows → install WSL2 + Ubuntu (Microsoft has a guide). Mac → just open "
                         "Terminal. Linux → you're set.\n"
                         "Run and verify: `uname -a`, `whoami`, `pwd`, `ls -la`, `cat /etc/os-release`. "
                         "Take a screenshot, save as `screenshots/01-shell.png` for your README."),
            ]),
        day(2, "Git the right way (branches, PRs)",
            "Not a backup tool. The team's shipping protocol.",
            [
                video("Git + GitHub for beginners — freeCodeCamp",
                      search("git github crash course freecodecamp"),
                      45, "freeCodeCamp"),
                exercise("PR workflow",
                         "Create GitHub repo `edge-portfolio`. Clone locally. On main, create README.md. "
                         "Create branch `feature/index-html`. Create `index.html` (we'll write it "
                         "tomorrow). Push the branch. Open a Pull Request on GitHub. Merge it yourself "
                         "after reviewing. This is the workflow you'll use forever."),
            ]),
        day(3, "Write the portfolio HTML",
            "The actual content you'll be serving — write it now.",
            [
                exercise("Build index.html",
                         "Single-file HTML. Sections required:\n"
                         "  - Hero: 'Your Name — DevOps Engineer in training'\n"
                         "  - About: 2-paragraph blurb about why you're learning DevOps\n"
                         "  - Projects: empty `<ul>` (you'll fill this over 24 weeks)\n"
                         "  - Contact: GitHub link + email link\n"
                         "Inline CSS (no separate file yet — this isn't web week). Make it readable "
                         "and not ugly. Commit `index.html` on the feature branch, merge PR."),
            ]),
        day(4, "AWS account safety net",
            "Before you spin up resources, set the bill alarm.",
            [
                video("AWS in 10 minutes — Fireship", yt("Z4AmZSm5OTI"), 10, "Fireship", ""),
                video("AWS Free Tier — set up safely with MFA + billing alerts",
                      search("aws free tier mfa billing alarm 2024"),
                      20, "various"),
                exercise("AWS account hygiene",
                         "1. Create AWS account at aws.amazon.com (real credit card needed; Free Tier "
                         "costs $0)\n"
                         "2. Enable MFA on the root user (Authenticator app)\n"
                         "3. Set CloudWatch billing alarm at $5 — if your bill ever hits $5, you get "
                         "an email\n"
                         "4. Create an IAM user `forge-dev` with `AdministratorAccess`. Generate access "
                         "keys for it. Save the keys in a password manager.\n"
                         "5. Run `aws configure` locally — use the IAM user keys, region `us-east-1`. "
                         "Test: `aws sts get-caller-identity` should return your IAM user ARN.\n"
                         "From here on you NEVER log in as root."),
            ]),
        day(5, "Terraform — the IaC language",
            "Click-ops dies on day 30. Code it.",
            [
                video("Terraform in 100 Seconds — Fireship", yt("tomUWcQ0P3k"), 2, "Fireship", ""),
                video("Terraform AWS beginner project",
                      search("terraform aws first project beginner 2024"),
                      30, "various"),
                exercise("First .tf file",
                         "Install Terraform (terraform.io/downloads). Verify: `terraform version`.\n"
                         "In `edge-portfolio/infra/main.tf`:\n\n"
                         "  terraform {\n"
                         "    required_providers {\n"
                         "      aws = { source = \"hashicorp/aws\", version = \"~> 5.0\" }\n"
                         "    }\n"
                         "  }\n"
                         "  provider \"aws\" { region = \"us-east-1\" }\n"
                         "  resource \"aws_s3_bucket\" \"portfolio\" {\n"
                         "    bucket = \"yourname-edge-portfolio-2026\"  # must be globally unique\n"
                         "  }\n\n"
                         "Run `terraform init`, then `terraform plan`, then `terraform apply`. "
                         "Verify in AWS console that the bucket exists. Commit `main.tf` "
                         "(NOT .terraform/, NOT .tfstate — gitignore both)."),
            ]),
        day(6, "Static hosting + CloudFront via Terraform",
            "Now wire S3 + CloudFront together as code.",
            [
                video("S3 + CloudFront static hosting — Terraform",
                      search("terraform s3 cloudfront static website tutorial"),
                      35, "various"),
                exercise("Full stack as code",
                         "Extend `infra/main.tf` to add:\n"
                         "  - `aws_s3_bucket_website_configuration` pointing to index.html\n"
                         "  - `aws_s3_bucket_public_access_block` (configured properly — see ref tutorial)\n"
                         "  - `aws_cloudfront_origin_access_identity` and bucket policy granting it read\n"
                         "  - `aws_cloudfront_distribution` with the S3 bucket as origin, default root "
                         "    object = index.html, viewer protocol = redirect-to-https\n"
                         "  - `output \"url\"` printing the CloudFront domain name\n"
                         "Run `terraform apply` again. Wait ~5 min for CloudFront to deploy globally.\n"
                         "Upload `index.html` to the bucket manually for now: "
                         "`aws s3 cp index.html s3://yourname-edge-portfolio-2026/`\n"
                         "Visit the `xxx.cloudfront.net` URL — your portfolio is live, globally."),
            ]),
        day(7, "Ship Edge Portfolio v0.1",
            "Documented, reproducible, under $1/month.",
            [
                exercise("Final acceptance",
                         "□ `infra/main.tf` provisions S3 + CloudFront + OAI + bucket policy from scratch\n"
                         "□ `terraform apply` works on a clean clone (someone could fork your repo and "
                         "    deploy a copy of your portfolio)\n"
                         "□ Your CloudFront URL serves your portfolio over HTTPS\n"
                         "□ `terraform destroy` cleanly removes everything (test it — then re-apply)\n"
                         "□ README contains: live URL, architecture diagram (use draw.io or excalidraw "
                         "    — even a hand sketch photo works), Terraform install + apply instructions, "
                         "    monthly cost estimate (it should say < $1), 'Weeks 2-5 roadmap'\n"
                         "□ `.gitignore` excludes .terraform/, *.tfstate, *.tfvars\n"
                         "□ Tag v0.1 + push"),
                reflect("What you skipped",
                        "Your site doesn't yet have: HTTPS on a custom domain, automated deploy via CI, "
                        "monitoring, backups. List 3 of those as Week 2 work. They're all 1-day each."),
            ]),
    ],
    "topics": [
        "Linux shell basics — file ops, processes, env vars",
        "Git branches + Pull Requests",
        "AWS account hygiene — MFA, IAM, billing alarms",
        "AWS CLI install + configuration",
        "Terraform syntax: provider, resource, output, variable",
        "S3 buckets + bucket policies",
        "CloudFront + Origin Access Identity",
    ],
    "tasks": [
        "Set up a working Linux shell (WSL on Win, Terminal on Mac, native on Linux)",
        "Practice the git PR workflow on your own repo",
        "Write a 4-section portfolio index.html (you'll grow it over 24 weeks)",
        "Create AWS account with MFA + $5 billing alarm + IAM dev user",
        "Write Terraform that creates an S3 bucket",
        "Extend Terraform to also create CloudFront + bucket policy + OAI",
        "Verify the CloudFront URL serves your portfolio over HTTPS",
    ],
    "project": (
        "Edge Portfolio v0.1 — your personal portfolio page (HTML) deployed to AWS S3 + "
        "CloudFront, provisioned end-to-end with Terraform. The .tf code IS the deliverable. "
        "`terraform apply` from a clean clone of your repo deploys a working portfolio. "
        "Monthly cost < $1. Repo: `edge-portfolio` on GitHub, tagged v0.1."
    ),
    "exercises": [
        "Run `terraform plan` after manually changing a CloudFront setting in the console — what diff appears?",
        "Add a Terraform variable `bucket_name` so the name isn't hardcoded",
        "Add an S3 versioning resource — upload a new index.html, then roll back to the old one",
        "Compare cost: S3+CloudFront vs Netlify free tier vs Vercel free tier — when does each win?",
    ],
    "questions": [
        "Why put CloudFront in front of S3 — why not just S3?",
        "What does Origin Access Identity prevent that public bucket access doesn't?",
        "What's the difference between `terraform apply` and `terraform import`?",
        "If you accidentally `terraform destroy` in production, what's the recovery plan?",
    ],
    "outputs": [
        "Live CloudFront URL serving your portfolio",
        "`edge-portfolio` GitHub repo tagged v0.1",
        "Architecture diagram + README + cost estimate",
        "`terraform apply` output committed as `apply-log.txt`",
    ],
}


# ═══════════════════════════════════════════════════════════════════════
# CYBERSECURITY — Project 1: "Juice Shop Five" — 5 specific challenges + reports
#
# Arc: P1 Juice Shop Five (W1-4) → P2 HTB starter boxes (W5-12)
#      → P3 Bug bounty pipeline (W13-18) → P4 Red/blue team capstone (W19-24)
# ═══════════════════════════════════════════════════════════════════════
CYBERSEC = {
    "context": (
        "You're attacking OWASP Juice Shop — the canonical deliberately-vulnerable web app "
        "that EVERY pentester practices on. Your job by Sunday: solve 5 SPECIFIC challenges "
        "and write a HackerOne-style report for each. Why these 5? They cover the most "
        "common bug classes in real-world bug bounties: XSS, broken auth, IDOR, injection, "
        "misconfiguration. Weeks 2-4 expand to 20 more challenges + your first TryHackMe "
        "rooms. Project 2 (W5+) moves to HackTheBox real boxes."
    ),
    "days": [
        day(1, "The ethics contract — non-negotiable",
            "You only attack what you own or have permission to attack. Sign it today.",
            [
                video("Cybersecurity ethics 101 — John Hammond",
                      search("john hammond cybersecurity ethics beginner"),
                      15, "John Hammond"),
                exercise("Sign and commit your contract",
                         "Create repo `vuln-reports`. Create `ETHICS.md` containing:\n\n"
                         "  # Ethics Contract\n"
                         "  I, [your full name], commit to:\n"
                         "  1. Only test systems I own or have explicit written permission to test.\n"
                         "  2. Report any vulnerabilities I find through responsible disclosure channels.\n"
                         "  3. Never exfiltrate or modify user data beyond minimal proof-of-concept.\n"
                         "  4. Document every test for transparency.\n\n"
                         "  Signed: [your name]\n"
                         "  Date: [today]\n\n"
                         "Commit it. Push it. This is the contract you'll uphold for life."),
            ]),
        day(2, "Set up Kali Linux in a VM",
            "Kali in a VM, not bare metal. The right way.",
            [
                video("Install Kali in VirtualBox — 2024 walkthrough",
                      search("install kali linux virtualbox 2024"),
                      30, "various"),
                exercise("Boot Kali",
                         "Install VirtualBox (free). Download Kali Linux ISO (kali.org/get-kali/). "
                         "Create a VM with 4GB RAM, 30GB disk. Install. Boot. Open a terminal. Run "
                         "`nmap --version`, `sqlmap --version`, `curl --version` — all should work. "
                         "Take a screenshot of Kali running."),
            ]),
        day(3, "OWASP Top 10 — the syllabus of web hacking",
            "10 vuln categories cover 90% of real-world breaches.",
            [
                video("OWASP Top 10 explained 2024",
                      search("owasp top 10 2024 explained"), 25, "various"),
                reading("OWASP Top 10 — official",
                        "https://owasp.org/www-project-top-ten/",
                        "Bookmark for life."),
                exercise("One-liner per category",
                         "In `vuln-reports/owasp-notes.md`, write 1 sentence per category explaining "
                         "what it means in plain English. Example for A03:Injection — 'When user input "
                         "is treated as code (SQL, OS commands, etc.) instead of as data.'"),
            ]),
        day(4, "Spin up Juice Shop locally",
            "Your target for the week. Sandboxed. Safe.",
            [
                video("Run OWASP Juice Shop with Docker",
                      search("run juice shop docker tutorial"),
                      8, "various"),
                exercise("Get Juice Shop running",
                         "Install Docker. Run:\n"
                         "  `docker run --rm -p 3000:3000 bkimminich/juice-shop`\n"
                         "Open http://localhost:3000 in your browser. You should see a fake e-commerce "
                         "site. Browse it. Open the score board: click the little anchor in the page "
                         "source HTML (`<a href='#/score-board'>`) — that itself is the first challenge."),
            ]),
        day(5, "Solve challenges 1, 2, 3",
            "XSS + broken auth + score board access.",
            [
                video("Juice Shop walkthrough — first 5 challenges",
                      search("juice shop walkthrough beginner challenges"),
                      30, "various"),
                exercise("Knock out 3",
                         "Solve these 3 (consult walkthroughs ONLY when fully stuck):\n"
                         "  1. Score Board (find the hidden score-board page)\n"
                         "  2. DOM XSS (perform an XSS via the search box — payload: "
                         "     `<iframe src=\"javascript:alert('xss')\">` — see what gets reflected)\n"
                         "  3. Login Admin (broken auth — try classic SQLi: `' OR 1=1--`)\n"
                         "Screenshot each success. Save screenshots as `screenshots/01.png`, `02.png`, `03.png`."),
            ]),
        day(6, "Solve challenges 4 + 5",
            "IDOR + sensitive data exposure.",
            [
                exercise("Two more",
                         "Solve:\n"
                         "  4. View Basket (IDOR — change the userId in the basket request from your "
                         "     own to another user's; use browser DevTools network tab + replay)\n"
                         "  5. Confidential Document (find a hidden /ftp/ path with leaked docs — "
                         "     try directory enumeration via gobuster or just guess common paths)\n"
                         "Screenshot success. You now have 5 wins."),
            ]),
        day(7, "Write the 5 reports — your passport",
            "Every report is a HackerOne-style submission. This is what real bounty hunters do.",
            [
                reading("How to write a great vulnerability report — HackerOne",
                        "https://docs.hackerone.com/hackers/quality-reports.html",
                        "The bar to aim for."),
                exercise("Five CVE-style reports",
                         "In `vuln-reports/reports/`, create 5 markdown files, one per challenge. Format:\n\n"
                         "  # [Vulnerability name] — Juice Shop\n"
                         "  **Severity:** Low/Medium/High/Critical (with justification)\n"
                         "  **Affected component:** URL + parameter + HTTP method\n"
                         "  **Steps to reproduce:**\n"
                         "    1. ...\n"
                         "    2. ...\n"
                         "  **Impact:** What can an attacker do? (be concrete)\n"
                         "  **Suggested fix:** Specific code or config change\n"
                         "  **Screenshots:** ![POC](../screenshots/01.png)\n\n"
                         "Update the repo README to list all 5 reports with severity badges.\n"
                         "Tag v0.1.\n\n"
                         "Pass criteria:\n"
                         "  □ ETHICS.md signed and committed\n"
                         "  □ 5 challenges solved with screenshots\n"
                         "  □ 5 reports written in HackerOne format\n"
                         "  □ README links each report\n"
                         "  □ owasp-notes.md committed"),
                reflect("Could you submit this for real?",
                        "If Juice Shop were a real company on HackerOne, would your XSS report earn a "
                        "bounty? Your IDOR? What's missing — proof of impact?"),
            ]),
    ],
    "topics": [
        "Security ethics — written permission required",
        "Kali Linux in VirtualBox",
        "OWASP Top 10 categories explained",
        "OWASP Juice Shop — running locally via Docker",
        "Reflected & DOM XSS basics",
        "SQL injection in login forms",
        "IDOR (Insecure Direct Object Reference)",
        "Writing HackerOne-style vulnerability reports",
    ],
    "tasks": [
        "Sign and commit ETHICS.md to the `vuln-reports` repo",
        "Install Kali in VirtualBox; verify nmap + sqlmap work",
        "Write 1-line summaries of each OWASP Top 10 category",
        "Run Juice Shop via Docker locally",
        "Solve 5 specific Juice Shop challenges with screenshots",
        "Write 5 HackerOne-style vulnerability reports",
        "Push the report repo with README + linked reports, tagged v0.1",
    ],
    "project": (
        "Vuln Reports v0.1 — your security portfolio repo, seeded with 5 polished "
        "HackerOne-style reports for 5 specific Juice Shop challenges (Score Board, DOM XSS, "
        "Login Admin, View Basket IDOR, Confidential Document). Plus signed ETHICS.md. "
        "Repo: `vuln-reports` on GitHub. This same repo grows for the next 24 weeks — real "
        "boxes, real bounties go in `reports/` over time."
    ),
    "exercises": [
        "Read 3 public HackerOne reports (h1.com/hacktivity) — note the structure",
        "Set up Burp Suite Community + intercept a Juice Shop login request",
        "Try the same SQL injection from challenge 3 against your own (local!) Postgres — does it fire?",
        "Look up the latest CVEs for any tool on your laptop — patch if you find anything",
    ],
    "questions": [
        "Why is XSS in /search worse than XSS in an admin-only page?",
        "What's a Proof of Concept? Why is it required in any real report?",
        "What's the difference between a black-box test and a white-box test?",
        "If you found a real CVE in production software today, who do you tell first?",
    ],
    "outputs": [
        "`vuln-reports` GitHub repo with v0.1 tag",
        "Signed ETHICS.md",
        "5 reports in `reports/` (markdown)",
        "5 screenshots in `screenshots/`",
        "OWASP Top 10 notes in `owasp-notes.md`",
    ],
}


# ═══════════════════════════════════════════════════════════════════════
# DATA SCIENCE — Project 1: "TaxiPulse NYC" — Oct 2023 Yellow Taxi analysis
#
# Arc: P1 TaxiPulse (W1-5) → P2 Sentiment Reddit (W6-12)
#      → P3 Time series forecasting (W13-18) → P4 Deployed model capstone (W19-24)
# Dataset: NYC TLC Yellow Taxi October 2023 (Parquet, ~50MB, ~3M rows, public)
# ═══════════════════════════════════════════════════════════════════════
DATA_SCI = {
    "context": (
        "You're building TaxiPulse NYC — a polished analysis of NYC Yellow Taxi trips in "
        "October 2023. Specific dataset URL provided. Specific questions to answer (we tell "
        "you which). By Sunday you'll have a publishable Jupyter notebook that a journalist "
        "could read top-to-bottom and learn something real. Why this dataset? It's real, "
        "large (3M trips), clean enough to focus on analysis (not janitorial work), and "
        "everyone in NYC has an opinion about taxis."
    ),
    "days": [
        day(1, "What data science actually is",
            "Statistics + storytelling. Today, the mental model.",
            [
                video("Data Science in 100 Seconds — Fireship", yt("X3paOmcrTjQ"), 2, "Fireship", ""),
                video("DS vs ML vs Analytics — clear breakdown",
                      search("data science vs machine learning vs analytics"),
                      10, "various"),
                reflect("The questions",
                        "By Sunday you'll answer these about NYC Yellow Taxis in October 2023:\n"
                        "  Q1. What's the busiest hour of day?\n"
                        "  Q2. Does tip percentage rise with trip distance? With trip duration?\n"
                        "  Q3. Which day of week has the highest average fare?\n"
                        "Write your hypothesis for each. We'll see if you were right by Day 6."),
            ]),
        day(2, "Python + Jupyter setup",
            "Smooth tools, smooth analysis.",
            [
                video("Install Anaconda + Jupyter",
                      search("install anaconda jupyter beginner 2024"),
                      15, "various"),
                exercise("TaxiPulse repo",
                         "Create folder `taxipulse/`. `conda create -n taxipulse python=3.11 pandas "
                         "pyarrow matplotlib seaborn jupyter` (or venv equivalent). Activate. Push "
                         "to GitHub repo `taxipulse-nyc`."),
            ]),
        day(3, "Download the dataset (this exact file)",
            "No 'pick your own'. We tell you the file.",
            [
                reading("NYC TLC Yellow Taxi data — official page",
                        "https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page",
                        "Official source, government-published."),
                exercise("Get yellow_tripdata_2023-10.parquet",
                         "Download:\n"
                         "  https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2023-10.parquet\n"
                         "Save to `taxipulse/data/yellow_2023_10.parquet` (gitignored, ~50MB). In "
                         "`01_load.ipynb`:\n"
                         "  ```python\n"
                         "  import pandas as pd\n"
                         "  df = pd.read_parquet('data/yellow_2023_10.parquet')\n"
                         "  print(df.shape)\n"
                         "  print(df.dtypes)\n"
                         "  df.head()\n"
                         "  ```\n"
                         "Document: how many rows? What columns? Add a markdown cell."),
            ]),
        day(4, "Clean — get rid of impossible trips",
            "Real data has impossible rows (negative fares, etc.). Filter them.",
            [
                video("pandas filtering + datetime",
                      search("pandas filtering datetime operations tutorial"),
                      25, "various"),
                exercise("Clean to a sane subset",
                         "In `02_clean.ipynb`:\n"
                         "  1. Drop rows where `trip_distance <= 0` or `fare_amount <= 0`\n"
                         "  2. Drop rows where `trip_distance > 100` (very long, likely glitches)\n"
                         "  3. Drop rows where `tpep_pickup_datetime` is outside October 2023\n"
                         "  4. Add column `trip_duration_min = (tpep_dropoff_datetime - "
                         "tpep_pickup_datetime).dt.total_seconds() / 60`\n"
                         "  5. Drop rows where `trip_duration_min < 1` or `> 180`\n"
                         "  6. Add column `tip_pct = (tip_amount / fare_amount) * 100` (only for "
                         "fare_amount > 0; dropna)\n"
                         "  7. Save as `data/clean.parquet`. Print: how many rows did you drop, and why?"),
            ]),
        day(5, "Answer Q1: busiest hour of day",
            "Plot it. Eyeball it. Be honest.",
            [
                video("Matplotlib + Seaborn for plots",
                      search("matplotlib seaborn plotting tutorial 2024"),
                      25, "various"),
                exercise("The hour plot",
                         "In `03_hour.ipynb`:\n"
                         "  ```python\n"
                         "  df['hour'] = df['tpep_pickup_datetime'].dt.hour\n"
                         "  by_hour = df.groupby('hour').size()\n"
                         "  by_hour.plot(kind='bar', figsize=(10,5), title='NYC Yellow Taxi trips by hour, Oct 2023')\n"
                         "  ```\n"
                         "Save the figure as `figures/by_hour.png`. Below the plot, write 2 sentences: "
                         "which hour is busiest? What does the shape look like — single peak, double peak? "
                         "Compare to your Day 1 hypothesis."),
            ]),
        day(6, "Answer Q2 + Q3",
            "Tip % vs distance, fare by weekday.",
            [
                exercise("Two more plots",
                         "Q2 — tip_pct vs trip_distance:\n"
                         "  Bin trip_distance into [0-1, 1-3, 3-5, 5-10, 10+] miles. Compute mean "
                         "tip_pct per bin. Bar chart it. Same for trip_duration_min in similar bins. "
                         "Save as `figures/tip_vs_distance.png` and `figures/tip_vs_duration.png`.\n\n"
                         "Q3 — average fare by day of week:\n"
                         "  `df['dow'] = df['tpep_pickup_datetime'].dt.day_name()`. Group by dow, take "
                         "mean of fare_amount. Bar chart sorted Mon-Sun. Save as `figures/fare_by_dow.png`.\n\n"
                         "Below each: 1 sentence finding. Compare to your Day 1 hypotheses."),
            ]),
        day(7, "Ship TaxiPulse v0.1 — the publishable notebook",
            "A notebook nobody reads is wasted work. Format like an article.",
            [
                exercise("Final acceptance — publishable notebook",
                         "Create `TaxiPulse-NYC-October-2023.ipynb` — the polished version. Structure:\n\n"
                         "  # TaxiPulse NYC — What 3 Million Trips Tell Us About October 2023\n"
                         "  [Your name] · [Date]\n\n"
                         "  ## TL;DR\n"
                         "  3 bullets — your 3 findings, one sentence each, with specific numbers.\n\n"
                         "  ## The data\n"
                         "  Source URL, download date, row count, what's a 'trip' here.\n\n"
                         "  ## Cleaning decisions\n"
                         "  What you dropped + why. Be honest about edge cases.\n\n"
                         "  ## Finding 1: Busiest hour\n"
                         "  Plot + 2-paragraph narrative + 1 caveat.\n\n"
                         "  ## Finding 2: Tip % vs distance\n"
                         "  Same.\n\n"
                         "  ## Finding 3: Fares by day of week\n"
                         "  Same.\n\n"
                         "  ## What I'd do next\n"
                         "  3 bullets — borough breakdown, weather correlation, fare prediction model.\n\n"
                         "Render to HTML: `jupyter nbconvert --to html TaxiPulse-NYC-October-2023.ipynb`. "
                         "Commit the .html in `docs/`. Add a `README.md` linking the rendered HTML.\n\n"
                         "Pass criteria:\n"
                         "  □ All 3 hypotheses answered with plots + numbers\n"
                         "  □ 4 notebooks committed (01-load, 02-clean, 03-hour, 04-tip-fare)\n"
                         "  □ 1 polished publishable notebook + rendered HTML\n"
                         "  □ README with TL;DR, link to rendered HTML, dataset source\n"
                         "  □ All 4 figures committed in `figures/`\n"
                         "  □ Tag v0.1"),
                reflect("Who reads this?",
                        "Imagine you tweeted the rendered HTML link. Who retweets it — journalists? "
                        "Other data scientists? NYC commuters? If nobody — your TL;DR isn't strong "
                        "enough. Why?"),
            ]),
    ],
    "topics": [
        "Anaconda + Jupyter setup",
        "pandas + pyarrow for parquet loading",
        "Date/time operations: pd.to_datetime, .dt accessor, hour extraction",
        "Data cleaning: dropping impossible rows + computing derived columns",
        "groupby + aggregations (size, mean)",
        "matplotlib + seaborn for bar charts",
        "Storytelling: TL;DR-first notebook structure",
    ],
    "tasks": [
        "Set up Python + Jupyter + the right libraries",
        "Download yellow_tripdata_2023-10.parquet from NYC TLC",
        "Clean impossible rows + add derived columns (trip_duration_min, tip_pct, hour, dow)",
        "Answer Q1 with a bar chart of trips by hour",
        "Answer Q2 with binned plots of tip_pct vs distance/duration",
        "Answer Q3 with bar chart of fare by day-of-week",
        "Polish into 1 publishable notebook + rendered HTML",
    ],
    "project": (
        "TaxiPulse NYC v0.1 — a published analysis of NYC Yellow Taxi trips in October 2023. "
        "Answers 3 specific assigned questions (busiest hour, tip% vs distance, fare by day "
        "of week). Polished notebook + rendered HTML + 4 figures + dataset cleaning decisions "
        "documented. Repo: `taxipulse-nyc` on GitHub, tagged v0.1."
    ),
    "exercises": [
        "Add a 4th finding YOU spot in the data — anything interesting beyond Q1/Q2/Q3",
        "Recompute Q1 grouped by pickup borough — does the busy hour vary by location?",
        "Plot the distribution of trip_duration_min — log-scale the y-axis. What jumps out?",
        "Compare your tip_pct binned plot to the same plot without log-scale — which tells the story?",
    ],
    "questions": [
        "Why did you drop trips with fare_amount <= 0? What might have caused them?",
        "What's the difference between mean tip_pct and median tip_pct here — and which is more honest?",
        "Where did you make a judgment call that another analyst might disagree with?",
        "What other dataset would amplify your TaxiPulse story — weather? events?",
    ],
    "outputs": [
        "`taxipulse-nyc` GitHub repo tagged v0.1",
        "5 notebooks (4 working + 1 polished publishable)",
        "Rendered HTML of the polished notebook in `docs/`",
        "4 figures in `figures/`",
        "README with TL;DR + link to rendered HTML",
    ],
}


# ═══════════════════════════════════════════════════════════════════════
# DATA ANALYSIS — Project 1: "Superstore Sales Memo" — Sample Superstore dashboard
#
# Arc: P1 Superstore (W1-4) → P2 HR analytics (W5-12)
#      → P3 Marketing funnel (W13-18) → P4 Multi-source executive dashboard (W19-24)
# ═══════════════════════════════════════════════════════════════════════
DATA_AN = {
    "context": (
        "You're analyzing Sample Superstore — the canonical dataset every BI analyst learns "
        "on. It's a fictional retailer's 4 years of orders across 3 segments and 17 sub-"
        "categories. By Sunday you ship a 1-page Excel/Sheets dashboard + a 1-page PDF memo "
        "answering 3 specific assigned questions. Why Superstore? Because it's universal — "
        "every analyst interview uses something like this. Tableau, Power BI, Excel, and "
        "Sheets all have it as a sample. Master it and the rest is variations."
    ),
    "days": [
        day(1, "What does an analyst actually do all day?",
            "Pull numbers. Answer questions. Slay bad assumptions.",
            [
                video("Day in the life of a Data Analyst",
                      search("day in the life data analyst real 2024"),
                      12, "various"),
                reflect("The questions",
                        "By Sunday you'll answer (with Sample Superstore data):\n"
                        "  Q1. Which sub-category has the highest profit margin? Lowest?\n"
                        "  Q2. Which region had the strongest year-over-year sales growth in the latest year?\n"
                        "  Q3. Is the Furniture segment profitable overall? Where does its profit come from?"),
            ]),
        day(2, "Get the Superstore data",
            "Specific file. Specific URL. No hunting.",
            [
                reading("Sample Superstore — Excel download",
                        "https://community.tableau.com/s/question/0D54T00000CWeX8SAL/sample-superstore-sales-excelxls",
                        "Or just search 'Sample Superstore xlsx' — it's everywhere."),
                exercise("Open it up",
                         "Download `Sample - Superstore.xls` (or .xlsx). Open in Excel or Google "
                         "Sheets. Verify there are 3 sheets: Orders, Returns, People. Look at Orders "
                         "— ~10,000 rows, columns like Order Date, Region, Segment, Category, Sub-"
                         "Category, Sales, Profit, Discount."),
            ]),
        day(3, "Excel/Sheets fundamentals — the 7 formulas",
            "SUMIFS, COUNTIFS, AVERAGEIFS, XLOOKUP, IF, IFS, ROUND.",
            [
                video("Excel essentials — Leila Gharani",
                      search("leila gharani excel beginner tutorial 2024"),
                      45, "Leila Gharani"),
                exercise("Practice the 7",
                         "On a fresh sheet next to Orders, compute:\n"
                         "  - Total Sales of 2023: `=SUMIFS(Orders!Sales, Orders!OrderDate, \">=2023-01-01\", "
                         "Orders!OrderDate, \"<=2023-12-31\")`\n"
                         "  - Count of orders in 'West' region\n"
                         "  - Average Discount given\n"
                         "  - XLOOKUP a customer ID → customer name\n"
                         "Add 1 IF formula categorizing margin as 'Healthy' (>20%), 'Thin' (5-20%), "
                         "'Loss' (<5%) for each row."),
            ]),
        day(4, "Pivot tables — the superpower",
            "10000 rows → 1 insight in 30 seconds.",
            [
                video("Pivot tables in 20 minutes — Leila Gharani",
                      search("leila gharani pivot tables tutorial"),
                      20, "Leila Gharani"),
                exercise("Pivot for Q1",
                         "Q1: Which sub-category has the highest / lowest profit MARGIN?\n"
                         "Build pivot:\n"
                         "  Rows: Sub-Category\n"
                         "  Values: SUM of Sales, SUM of Profit\n"
                         "  Calculated field: Margin = Profit / Sales\n"
                         "  Sort by Margin descending.\n"
                         "Highest = ? Lowest = ? Document the answer in a notes file."),
            ]),
        day(5, "Answer Q2 — Region YoY growth",
            "Compare years. Find the leader.",
            [
                exercise("Region YoY pivot",
                         "Build pivot:\n"
                         "  Rows: Region\n"
                         "  Columns: YEAR(Order Date)  — group by year\n"
                         "  Values: SUM of Sales\n"
                         "  Add a column: latest year ÷ previous year - 1 (growth %)\n"
                         "Which region has highest growth in latest year? Document."),
            ]),
        day(6, "Answer Q3 — Furniture profitability deep-dive",
            "Sometimes the answer is 'yes but barely, because of X'.",
            [
                exercise("Furniture investigation",
                         "Q3: Is Furniture profitable overall? Where does its profit come from?\n"
                         "Filter to Category = Furniture. Pivot:\n"
                         "  Rows: Sub-Category\n"
                         "  Values: SUM of Profit\n"
                         "You'll see Tables loses money, Bookcases breaks even, Chairs makes profit, "
                         "Furnishings is the heroine. Document with numbers. Now slice by Region — "
                         "is Furniture more profitable in some regions?"),
            ]),
        day(7, "Ship — the 1-page dashboard + PDF memo",
            "The deliverable that lands you the job.",
            [
                video("Build a 1-page dashboard in Excel/Sheets",
                      search("google sheets dashboard one page tutorial"),
                      30, "various"),
                exercise("Final acceptance — Superstore v0.1",
                         "Build a single sheet called `Dashboard`:\n"
                         "  - Title row\n"
                         "  - 4 KPI cards: Total Sales (all years), Total Profit, Profit Margin, "
                         "    Year-over-Year Sales Growth\n"
                         "  - 1 chart: monthly sales trend (line chart)\n"
                         "  - 1 chart: sales by region (bar chart)\n"
                         "  - 1 table: top 5 / bottom 5 sub-categories by profit margin\n"
                         "  - A date filter at top (works via slicer or named range)\n"
                         "Then write a 1-page memo (Word/Google Doc), `Superstore-Memo.pdf`:\n"
                         "  # Sample Superstore — What the data tells leadership\n"
                         "  ## Headline\n  One sentence answer.\n"
                         "  ## Q1: Margin leaders & laggards\n  Names + numbers + 1 recommendation.\n"
                         "  ## Q2: Regional growth\n  Numbers + 1 recommendation.\n"
                         "  ## Q3: Furniture profitability\n  Honest answer + 1 recommendation.\n"
                         "  ## What I'd do next\n  3 bullets.\n\n"
                         "Pass criteria:\n"
                         "  □ Dashboard sheet built with 4 KPIs + 3 charts + filter\n"
                         "  □ Q1, Q2, Q3 all answered with specific numbers\n"
                         "  □ PDF memo exported, formatted as 1-page\n"
                         "  □ GitHub repo `superstore-analysis` with .xlsx + .pdf + screenshots of dashboard\n"
                         "  □ README links the PDF + screenshots the dashboard\n"
                         "  □ Tag v0.1"),
                reflect("What would your boss do tomorrow?",
                        "If your VP read the memo over breakfast, what's the ONE action they'd take? "
                        "If they'd take none — your recommendations aren't sharp enough. Why?"),
            ]),
    ],
    "topics": [
        "Excel/Sheets formulas — SUMIFS, COUNTIFS, AVERAGEIFS, XLOOKUP, IF, IFS",
        "Pivot tables and calculated fields",
        "Computing margin = profit / sales",
        "Year-over-year growth calculation",
        "Multi-dimensional pivots (rows + cols)",
        "Filtering and slicing within categories",
        "1-page dashboard design — KPIs, charts, filter",
        "Writing 1-page analyst memos",
    ],
    "tasks": [
        "Download Sample Superstore .xls",
        "Build a working sheet with the 7 essential formulas",
        "Build a pivot answering Q1 (margin leaders/laggards by sub-category)",
        "Build a pivot answering Q2 (regional YoY growth)",
        "Build a pivot answering Q3 (Furniture profitability breakdown)",
        "Build a 1-page Dashboard sheet (4 KPIs, 3 charts, filter)",
        "Export a 1-page PDF memo with all 3 answers + recommendations",
    ],
    "project": (
        "Sample Superstore Analysis v0.1 — a 1-page Excel/Sheets dashboard + a 1-page PDF "
        "memo answering 3 assigned questions: profit margin leaders/laggards by sub-category, "
        "regional YoY sales growth, Furniture segment profitability. Repo: `superstore-analysis` "
        "on GitHub. Tagged v0.1."
    ),
    "exercises": [
        "Add a 'Discount vs Profit' scatter plot — does discount eat profit?",
        "Build a pivot of repeat-buyer % by Segment — who comes back?",
        "Compute customer lifetime value (sum of Sales per Customer ID, top 10)",
        "Reformat your memo as a 5-slide PowerPoint deck — same content, exec-friendly",
    ],
    "questions": [
        "Why is profit MARGIN more useful than raw profit for spotting problem sub-categories?",
        "What's the unit you're measuring growth in — orders, sales, or customers? Why?",
        "Where did you make a 'reasonable' choice that another analyst might question?",
        "If Sample Superstore is fake — what real datasets would have the same shape?",
    ],
    "outputs": [
        "`superstore-analysis` GitHub repo tagged v0.1",
        ".xlsx with Orders, Pivots, Dashboard sheets",
        "Superstore-Memo.pdf (1 page)",
        "Dashboard screenshot in README",
    ],
}


# ═══════════════════════════════════════════════════════════════════════
# BI ANALYTICS — Project 1: Superstore in Power BI (published to PBI Service)
#
# Arc: P1 Superstore Power BI (W1-4) → P2 Star schema modelling (W5-12)
#      → P3 Cross-source dashboards (W13-18) → P4 Multi-page workspace capstone (W19-24)
# ═══════════════════════════════════════════════════════════════════════
BI = {
    "context": (
        "You're building the Superstore Sales Dashboard in Power BI — the industry standard. "
        "Same data as Data Analysis Week 1 (Sample Superstore) but you'll model it properly "
        "with a star schema, write real DAX measures, and PUBLISH the dashboard to Power BI "
        "Service with a shareable URL. Recruiters click that URL. The .pbix is your portfolio. "
        "By Sunday it's live."
    ),
    "days": [
        day(1, "What is BI — and what's Power BI?",
            "Live, multi-source, self-serve dashboards. The lingua franca of enterprise.",
            [
                video("What is Power BI? — beginner explainer",
                      search("what is power bi beginner explained 2024"),
                      10, "various"),
                reflect("Who would use this dashboard?",
                        "Imagine the Sample Superstore is a real retailer. Who opens this dashboard "
                        "every Monday morning — the CEO, the regional VPs, the category managers? "
                        "Write down 3 KPIs each persona would care about."),
            ]),
        day(2, "Install Power BI Desktop + import data",
            "Free, Windows only. Mac users: use Power BI in browser, or a Windows VM.",
            [
                video("Power BI Desktop install + first import",
                      search("power bi desktop install tutorial 2024"),
                      15, "various"),
                exercise("Get the data in",
                         "Install Power BI Desktop (free at powerbi.microsoft.com). Download "
                         "`Sample - Superstore.xls` (same as Data Analysis Week 1). In Power BI: "
                         "Home → Get Data → Excel → select the Orders + Returns + People sheets. "
                         "Click Transform Data — Power Query opens."),
            ]),
        day(3, "Power Query — the data prep layer",
            "All BI sins are forgiven if Power Query is clean.",
            [
                video("Power Query for beginners — Guy in a Cube",
                      search("guy in a cube power query beginner"),
                      30, "Guy in a Cube"),
                exercise("Clean in Power Query",
                         "Open the Orders query. In Power Query:\n"
                         "  - Change Order Date and Ship Date to Date type\n"
                         "  - Remove the Row ID column\n"
                         "  - Add a custom column: Profit Margin = [Profit] / [Sales]\n"
                         "  - Rename Sub-Category to Subcategory (consistency)\n"
                         "Click Close & Apply. Save the .pbix as `superstore.pbix` in a fresh repo."),
            ]),
        day(4, "Build the star schema — fact + dimension tables",
            "This is what separates a BI analyst from a spreadsheet jockey.",
            [
                video("Star schema in Power BI — clear primer",
                      search("power bi star schema fact dimension tutorial"),
                      20, "various"),
                exercise("Date dimension",
                         "In Modeling → New Table:\n"
                         "  ```DAX\n"
                         "  DimDate = CALENDAR(DATE(2020,1,1), DATE(2024,12,31))\n"
                         "  ```\n"
                         "Add calculated columns on DimDate: Year, Month, MonthName, Weekday, Quarter.\n"
                         "In Model view, drag Orders[Order Date] to DimDate[Date]. Cardinality: "
                         "Many-to-One. Single-direction filter.\n"
                         "Now you can slice everything by DimDate fields without depending on raw dates."),
            ]),
        day(5, "DAX — the language of measures",
            "5 functions cover the basics. Today: SUM, CALCULATE, DIVIDE, TOTALYTD, SAMEPERIODLASTYEAR.",
            [
                video("DAX in 30 minutes — SQLBI",
                      search("sqlbi dax beginner 30 minutes"),
                      30, "SQLBI"),
                exercise("4 essential measures",
                         "In Orders table → New Measure, create:\n"
                         "  Total Sales = SUM(Orders[Sales])\n"
                         "  Total Profit = SUM(Orders[Profit])\n"
                         "  Profit Margin = DIVIDE([Total Profit], [Total Sales])\n"
                         "  Sales YTD = TOTALYTD([Total Sales], DimDate[Date])\n"
                         "  Sales LY = CALCULATE([Total Sales], SAMEPERIODLASTYEAR(DimDate[Date]))\n"
                         "  YoY Growth = DIVIDE([Total Sales] - [Sales LY], [Sales LY])\n"
                         "Test each in a card visual."),
            ]),
        day(6, "Design the 1-page dashboard",
            "Layout: cards on top, charts middle, table bottom, slicer on side.",
            [
                video("Power BI dashboard design — best practices",
                      search("power bi dashboard design 2024 best practices"),
                      25, "various"),
                exercise("Build the page",
                         "1 page. Layout (think in grid):\n"
                         "  TOP ROW (4 KPI cards): Total Sales, Total Profit, Profit Margin, YoY Growth %\n"
                         "  MID ROW (2 charts):\n"
                         "    Left: Line chart — Total Sales over time (x: Year-Month, y: Total Sales)\n"
                         "    Right: Bar chart — Total Sales by Region\n"
                         "  BOTTOM (1 table):\n"
                         "    Matrix: Subcategory rows × Profit Margin column, sorted descending, "
                         "    color-coded (green > 20%, red < 5%)\n"
                         "  LEFT SIDE (slicer):\n"
                         "    Date slicer with relative date filter (this year / last year / all)\n"
                         "Use a consistent color palette (Superstore is blue/orange/grey traditionally). "
                         "Save."),
            ]),
        day(7, "Publish to Power BI Service",
            "A .pbix on your laptop is invisible. Publish or perish.",
            [
                video("Publish to Power BI Service + share URL",
                      search("publish power bi service share dashboard 2024"),
                      10, "various"),
                exercise("Final acceptance — Superstore BI v0.1",
                         "□ Sign up for Power BI Service (free) at app.powerbi.com (needs a work or "
                         "    school email — use a free Microsoft 365 trial if needed, or a personal "
                         "    Outlook account)\n"
                         "□ In Desktop: Home → Publish → choose 'My Workspace'\n"
                         "□ In Service: open the report. Get the URL.\n"
                         "□ Make it shareable: File → Embed report → Publish to web (if allowed) OR\n"
                         "    just share the URL with view permissions to your test email\n"
                         "□ GitHub repo `superstore-bi` contains:\n"
                         "    - `superstore.pbix` (use Git LFS or zip if > 100MB; usually fine)\n"
                         "    - README with: dashboard URL, screenshot of the published dashboard, "
                         "      list of measures, list of relationships, 'How to open' instructions\n"
                         "    - `screenshots/` folder with the dashboard image\n"
                         "□ Tag v0.1"),
                reflect("Would your imagined CEO open this Monday morning?",
                        "If yes — what's the ONE follow-up they'd ask for? If no — what's missing?"),
            ]),
    ],
    "topics": [
        "Power BI Desktop installation + interface",
        "Power Query — type changes, custom columns, renames",
        "Star schema — fact tables + dimension tables",
        "CALENDAR() function for date dimensions",
        "DAX basics — SUM, DIVIDE, CALCULATE, TOTALYTD, SAMEPERIODLASTYEAR",
        "Relationships, cardinality, cross-filter direction",
        "Dashboard layout — cards, charts, slicers, matrices, conditional formatting",
        "Publishing to Power BI Service + sharing URLs",
    ],
    "tasks": [
        "Install Power BI Desktop",
        "Import Sample Superstore into Power Query",
        "Clean + type-correct + add Profit Margin column in Power Query",
        "Build a DimDate table with CALENDAR + calculated columns",
        "Create the relationship Orders[Order Date] → DimDate[Date]",
        "Write 6 DAX measures (Total Sales, Profit, Margin, YTD, LY, YoY)",
        "Design a 1-page dashboard with 4 KPI cards + 2 charts + 1 matrix + 1 slicer",
        "Publish to Power BI Service + share URL + commit .pbix",
    ],
    "project": (
        "Superstore Power BI v0.1 — a published Power BI dashboard for the Sample Superstore "
        "dataset, modelled with a proper star schema and a Date dimension, with 6 DAX "
        "measures and a 1-page dashboard live on Power BI Service. Repo: `superstore-bi` on "
        "GitHub with the .pbix + README + screenshots. Tagged v0.1."
    ),
    "exercises": [
        "Add a What-If parameter so the user can simulate +/- 10% discount and see profit impact",
        "Add a drill-through page from any region in the bar chart → that region's detail",
        "Switch the line chart to a multi-line by Category — does the story change?",
        "Add row-level security: a fake 'Manager' role that only sees their region",
    ],
    "questions": [
        "Why is a star schema faster than a flat table at scale?",
        "What's an implicit measure vs an explicit measure? Why prefer explicit?",
        "If the Orders table grew to 100M rows, where would your dashboard slow first?",
        "What's the difference between a calculated column and a measure?",
    ],
    "outputs": [
        "Published Power BI dashboard URL (in the README)",
        "`superstore-bi` GitHub repo tagged v0.1",
        ".pbix file committed (Git LFS or zipped if large)",
        "Dashboard screenshot in README + measures + relationships documented",
    ],
}


# ─────────────────────────────────────────────────────────────────────
ROADMAPS = {
    "ai-engineering": AI_ENG,
    "ml-engineering": ML_ENG,
    "full-stack-web": FS_WEB,
    "mobile-engineering": MOBILE,
    "devops-cloud": DEVOPS,
    "cybersecurity": CYBERSEC,
    "data-science": DATA_SCI,
    "data-analysis": DATA_AN,
    "bi-analytics": BI,
}


def apply():
    for slug, w1 in ROADMAPS.items():
        path = os.path.join(DATA_DIR, f"{slug}.json")
        if not os.path.exists(path):
            print(f"  -- skip {slug}: no JSON found")
            continue
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        weeks = data.get("weeks", [])
        for i, week in enumerate(weeks):
            if week.get("number") == 1:
                preserved = {
                    "number": 1,
                    "title": week.get("title") or "Foundation",
                    "phase": week.get("phase") or "Foundation",
                    "commitment_hours": week.get("commitment_hours") or "15-25",
                    "resources": week.get("resources", []),
                }
                preserved.update(w1)
                weeks[i] = preserved
                break
        data["weeks"] = weeks
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  OK {slug}: Week 1 rewritten with assigned project")


if __name__ == "__main__":
    apply()
