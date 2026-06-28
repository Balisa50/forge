"""
Seed Week 1 v2 — hand-curated, project-based.

For every one of the 9 disciplines, this script writes a Week 1 that:
  - Breaks into 7 day cards, each with 2-4 items (video / reading / exercise / reflect)
  - Uses real YouTube watch URLs where the ID is verified, else a YouTube search
    URL (which the app opens in a new tab — never an embed error)
  - Ends in a UNIQUE "passport" project the learner picks the context for
    (their language, their country's data, their local business — never a
    generic Titanic / Iris / MovieLens reuse)

Run once with:
    PYTHONIOENCODING=utf-8 python scripts/seed_week1_v2.py
Idempotent — re-running overwrites Week 1 only.
"""

import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data", "roadmaps")


# ── helpers ────────────────────────────────────────────────────────────
def yt(video_id: str) -> str:
    return f"https://www.youtube.com/watch?v={video_id}"

def search(query: str) -> str:
    # Opens YouTube search in a new tab — the learner picks the best top result.
    from urllib.parse import quote_plus
    return f"https://www.youtube.com/results?search_query={quote_plus(query)}"

def video(title, url, minutes, creator, why=""):
    return {"kind": "video", "title": title, "url": url,
            "duration_min": minutes, "creator": creator, "why": why}

def reading(title, url, why=""):
    return {"kind": "reading", "title": title, "url": url, "why": why}

def exercise(title, body):
    return {"kind": "exercise", "title": title, "body": body}

def reflect(title, body):
    return {"kind": "reflection", "title": title, "body": body}

def day(n, title, summary, items):
    return {"number": n, "title": title, "summary": summary, "items": items}


# ─────────────────────────────────────────────────────────────────────
# AI ENGINEERING — Week 1
# ─────────────────────────────────────────────────────────────────────
AI_ENG = {
    "context": (
        "AI Engineering is the craft of shipping products that use LLMs. "
        "Week 1 isn't about math — it's about getting Python ready, getting an OpenAI "
        "key working, and making your first real API call. By Sunday you'll ship a "
        "translator for a language YOU pick — your mother tongue, a regional dialect, "
        "anything underserved. Something nobody else's portfolio has."
    ),
    "days": [
        day(1, "What is an AI Engineer, really?",
            "Less hype. More mental model. You're a software engineer who happens to call an API that thinks.",
            [
                video("Intro to Large Language Models (1 hr) — Andrej Karpathy",
                      yt("zjkBMFhNj_g"), 60, "Andrej Karpathy",
                      "The single best explanation of what an LLM actually is. Worth every minute."),
                reflect("Write 3 sentences",
                        "In your own words: (1) What is an LLM? (2) What can it NOT do? (3) Name 3 problems you'd want to solve with one. No googling."),
            ]),
        day(2, "Set up Python the right way",
            "If your Python is broken, nothing else this week will work. Get it solid.",
            [
                video("Python in 100 Seconds — Fireship", yt("x7X9w_GIm1s"), 2, "Fireship",
                      "60-second mental refresh on what Python is and isn't."),
                video("Install Python + VSCode + venv (any OS)", search("install python 3.12 vscode venv windows mac linux 2025"),
                      15, "various", "Pick a video that matches your OS."),
                exercise("Create your project folder",
                         "Make a folder called `forge-ai-week1/`. Inside, run `python -m venv .venv`, activate it, and `pip install openai python-dotenv`. Commit a README.md to GitHub with one sentence: what you plan to build."),
            ]),
        day(3, "Your first API call",
            "The moment AI stops being magic and becomes a function call.",
            [
                video("OpenAI API: Quickstart in 10 minutes",
                      search("openai api python quickstart 2025"), 10, "various",
                      "Pick a 2024 or 2025 video — the SDK changed."),
                reading("OpenAI Quickstart — official docs",
                        "https://platform.openai.com/docs/quickstart",
                        "Bookmark this. You'll come back to it 50 times."),
                exercise("Hello, AI",
                         "Get an OpenAI API key (free tier is fine). Store it in a `.env` file. Write `hello.py` that asks GPT-4o-mini 'What is 2+2 in haiku form?' and prints the answer. Commit it."),
            ]),
        day(4, "Prompting — the only skill that compounds",
            "A bad prompt with GPT-5 is worse than a great prompt with GPT-3.5. Learn the shape.",
            [
                video("Prompt Engineering for Devs (full course)",
                      search("prompt engineering for developers deeplearning.ai"),
                      60, "DeepLearning.AI",
                      "Free official course. Skim, don't binge."),
                exercise("System prompt vs user prompt",
                         "Write a script that takes a sentence in English and translates it to a language YOU pick (Spanish, Wolof, Tagalog, Yoruba, anything). Use a system prompt that says 'You are a professional translator for [language]. Reply with ONLY the translation, no explanation.' Test with 5 sentences."),
                reflect("What broke?",
                        "Where did the translation get weird? Slang? Idioms? Tone? Write 3 specific examples in your README."),
            ]),
        day(5, "Structured output — making the LLM speak JSON",
            "Real apps don't read paragraphs. They read JSON. This is the unlock.",
            [
                video("Structured outputs with OpenAI",
                      search("openai structured outputs json mode tutorial"),
                      15, "various", "Look for a video from late 2024 or 2025."),
                exercise("Translator v2 — return JSON",
                         "Modify your translator so the output is `{\"translation\": \"...\", \"confidence\": \"high|medium|low\", \"notes\": \"...\"}`. Print only the JSON. Parse it with `json.loads` and access fields."),
            ]),
        day(6, "Error handling, costs, and rate limits",
            "What separates a toy from a product: it doesn't crash, doesn't bankrupt you.",
            [
                video("OpenAI rate limits + cost optimization",
                      search("openai api rate limits cost tutorial python"),
                      12, "various", "Real engineering, not hype."),
                exercise("Make it production-shaped",
                         "Wrap your translator in try/except. Print the cost per call (use `response.usage`). If the user enters >500 chars, refuse. Commit."),
            ]),
        day(7, "Ship your passport project",
            "Today you build the thing you'll show in interviews.",
            [
                exercise("Build the translator app",
                         "Pick ONE language you actually care about. Build a command-line translator that:\n  1. Loads a language list from a JSON file (English, your language, optionally 1-2 more)\n  2. Lets the user paste a sentence\n  3. Returns a structured JSON response with translation + confidence + cultural notes\n  4. Has a `--help` flag\n  5. Has a 1-paragraph README explaining WHY you chose this language\nCommit to GitHub. Tag the release v1.0. The README is half the project — explain who you're building for."),
                reflect("What would you charge for this?",
                        "If you sold this as a $5/month app, who would buy it? What feature would they pay $20 for?"),
            ]),
    ],
    "topics": [
        "Python venvs and dotenv",
        "OpenAI Python SDK 1.x",
        "System prompts, user prompts, few-shot examples",
        "Structured outputs (JSON mode)",
        "Cost tracking with response.usage",
        "Error handling for API failures and rate limits",
        "Choosing the right model (4o-mini vs 4o vs other vendors)",
    ],
    "tasks": [
        "Install Python 3.12+ and create a clean venv with openai + python-dotenv installed",
        "Get an OpenAI API key, store it in .env, and verify it works with a hello.py",
        "Build a translator script that takes English and outputs your chosen target language",
        "Refactor v1 to return structured JSON (translation + confidence + notes)",
        "Add error handling, length limits, and per-call cost printing",
        "Write a README that explains who the app is for and why this language",
    ],
    "project": (
        "Build a CLI translator for a language YOU care about — your mother tongue, "
        "a regional dialect, a creole, anything underserved by Google Translate. "
        "Spec: JSON config of supported languages, structured JSON output (translation + "
        "confidence + cultural notes), error handling, cost-per-call printed, README that "
        "explains the WHY behind your language choice. This is your portfolio piece — "
        "if you pick a language with 50M speakers and no good translator, this app is a "
        "real product, not a toy."
    ),
    "exercises": [
        "Translate the same English sentence 5 times — what's identical, what drifts?",
        "Add a 'tone' parameter — formal / casual / poetic — and test the difference",
        "Compare GPT-4o-mini vs GPT-4o cost and quality on 10 sentences",
        "Add a fallback: if confidence is 'low', also return the original English",
    ],
    "questions": [
        "Why did you pick this language? Who specifically would use this?",
        "Where does the model fail — slang, idioms, profanity, technical terms?",
        "What does it cost per 1000 translations at GPT-4o-mini prices?",
        "If you had 1 hour to make this app 10x more useful, what would you add?",
    ],
    "outputs": [
        "GitHub repo with the translator script + JSON config + README",
        "Working `.env.example` so others can clone-and-run",
        "10 example translations committed as test fixtures",
        "A README paragraph explaining WHY this language",
    ],
}


# ─────────────────────────────────────────────────────────────────────
# ML ENGINEERING — Week 1
# ─────────────────────────────────────────────────────────────────────
ML_ENG = {
    "context": (
        "Machine Learning Engineering is half stats, half plumbing. Week 1 you set up the "
        "stack (Python + NumPy + pandas + scikit-learn + Jupyter) and train your first "
        "real model on a dataset YOU pick — not the Titanic. By Sunday you'll have a "
        "notebook that predicts something you actually care about."
    ),
    "days": [
        day(1, "What ML actually is (no hype)",
            "Function approximation. That's it. Now build intuition.",
            [
                video("But what is a neural network? — 3Blue1Brown",
                      yt("aircAruvnKk"), 19, "3Blue1Brown",
                      "The clearest visual explanation of what a model 'learns'."),
                video("How machine learning works (no math) — Fireship",
                      search("fireship machine learning 100 seconds"), 4, "Fireship",
                      "Fast big-picture refresh."),
                reflect("What problem do YOU want to predict?",
                        "Brainstorm 3 questions you'd answer with ML. Examples: 'Will my flight be delayed?' 'Will this email be a scam?' 'What's the price of this used phone worth?' Pick one. This is your passport project."),
            ]),
        day(2, "Set up the data science stack",
            "Conda or uv — pick one and live with it. Then Jupyter.",
            [
                video("Anaconda install + Jupyter — beginner",
                      search("install anaconda jupyter notebook 2025 beginner"),
                      15, "various", "Or use uv/pip if you already know Python."),
                exercise("First notebook",
                         "Create `forge-ml-week1.ipynb`. In cell 1: `import numpy as np, pandas as pd, matplotlib.pyplot as plt`. In cell 2: `print(np.__version__, pd.__version__)`. Push to GitHub."),
            ]),
        day(3, "Pandas — the only tool you'll use every day",
            "Forget SQL, forget Excel. Pandas is where data lives.",
            [
                video("Pandas in 10 minutes — Corey Schafer",
                      search("corey schafer pandas tutorial introduction"),
                      30, "Corey Schafer", "Best pandas intro on YouTube."),
                exercise("Load + describe",
                         "Find a CSV related to YOUR chosen problem (Kaggle, data.gov, your country's stats office, GitHub awesome-public-datasets). Load it with `pd.read_csv`. Call `.head()`, `.info()`, `.describe()`. Commit the notebook with output cells saved."),
            ]),
        day(4, "Visualize before you model",
            "Never trust a model on data you haven't plotted.",
            [
                video("Matplotlib + Seaborn crash course",
                      search("matplotlib seaborn crash course python"),
                      25, "various", "Histograms, scatter, heatmap."),
                exercise("3 plots, 3 insights",
                         "Plot 3 things from your dataset: (1) the distribution of your target variable, (2) a scatter of two features you think matter, (3) a correlation heatmap. Write a sentence under each saying what you see."),
            ]),
        day(5, "scikit-learn — train your first model",
            "Two lines: fit, predict. Then we add nuance.",
            [
                video("scikit-learn for beginners",
                      search("scikit-learn tutorial beginner python 2024"),
                      30, "various", "Pick one that uses train_test_split + a linear model."),
                exercise("Baseline model",
                         "Split your data 80/20. Train a `LinearRegression` or `LogisticRegression` (depending on regression vs classification). Print accuracy or R² on the test set. Don't tune anything yet. This is your baseline."),
            ]),
        day(6, "Did it actually learn? — evaluation",
            "Accuracy lies. Use the right metric for your problem.",
            [
                video("Evaluating ML models — precision, recall, F1",
                      search("precision recall f1 explained machine learning"),
                      15, "various"),
                exercise("Confusion matrix or residuals",
                         "If classification → confusion matrix + classification_report. If regression → plot predicted vs actual + compute MAE. Write 2 sentences: where does the model fail? On what kind of inputs?"),
            ]),
        day(7, "Ship your notebook",
            "A notebook is a portfolio piece — if you treat it like one.",
            [
                exercise("Build the passport notebook",
                         "Polish your notebook into a portfolio-grade artifact:\n  1. A clear markdown title + 1-paragraph intro explaining what you're predicting and WHY\n  2. Data source link + date downloaded\n  3. EDA section with 3 plots\n  4. Model section with train/test split + baseline + 1 alternative\n  5. Results section with metric + 2-sentence honest verdict\n  6. 'What I'd do next' section (3 bullets)\nPush to GitHub. Render to HTML and link in README."),
                reflect("Honesty check",
                        "Would you trust this model to make a real decision? Why or why not?"),
            ]),
    ],
    "topics": [
        "NumPy arrays and pandas DataFrames",
        "Jupyter workflow and `%matplotlib inline`",
        "train_test_split + reproducibility (random_state)",
        "Linear / logistic regression as baselines",
        "Train vs test metrics — accuracy, MAE, R², F1",
        "Confusion matrices and residual plots",
        "Honest narration in a notebook (no overfit storytelling)",
    ],
    "tasks": [
        "Install Anaconda or uv + Jupyter",
        "Pick a real dataset relevant to a question YOU care about",
        "Run EDA — describe, plot distribution + correlations",
        "Train a baseline model with train_test_split",
        "Evaluate honestly with appropriate metric",
        "Polish notebook into a portfolio piece",
    ],
    "project": (
        "Pick a prediction problem you actually care about — flight delays in your country, "
        "rainfall, used-phone resale value, your salary by year of experience, anything. "
        "Find the dataset (Kaggle, your gov't stats office, scrape it yourself). Build a "
        "notebook that does EDA + baseline model + honest evaluation. The notebook IS the "
        "portfolio piece. Recruiters will read it. Write it like an article, not a homework."
    ),
    "exercises": [
        "Drop your top-feature column — does the model still work? Why?",
        "Train the same model with random_state=1 then random_state=42 — what changes?",
        "Try a DecisionTreeClassifier alongside the linear baseline — which wins?",
        "Compute training accuracy too — gap to test = overfit signal",
    ],
    "questions": [
        "What's your dataset's 'unfair advantage'? Why is it interesting?",
        "What does it mean if your model predicts the same thing for everyone?",
        "Where could this model do harm if deployed naively?",
        "If you got 10x more data, which feature would suddenly matter?",
    ],
    "outputs": [
        "Jupyter notebook on GitHub with all cells run + output preserved",
        "README explaining the prediction question + data source",
        "Rendered HTML or nbviewer link",
        "A 'What I learned' paragraph at the bottom",
    ],
}


# ─────────────────────────────────────────────────────────────────────
# FULL STACK WEB — Week 1
# ─────────────────────────────────────────────────────────────────────
FS_WEB = {
    "context": (
        "Full-stack means: you can ship a real, live website by yourself. Week 1 is "
        "HTML, CSS, and one deploy. By Sunday you'll have a public URL for a real small "
        "business — a friend's shop, your cousin's tutoring service, anything real. Real "
        "prices, real contact, mobile-first. No Lorem Ipsum."
    ),
    "days": [
        day(1, "How the web actually works",
            "Browser ↔ DNS ↔ server. Understand the picture before the syntax.",
            [
                video("How the web works in 8 minutes — Fireship",
                      search("fireship how does the internet work"), 8, "Fireship", ""),
                video("HTML in 100 seconds — Fireship",
                      yt("ok-plXXHlWw"), 2, "Fireship", ""),
                reflect("Pick the business",
                        "Pick ONE real small business you'll build for: your friend's bakery, a tailor, a tutor, a beauty salon, anything. Get permission. Note their actual: name, services, prices, phone, location."),
            ]),
        day(2, "HTML — the structure",
            "Forget div soup. Use real semantic tags.",
            [
                video("HTML full course for beginners",
                      search("html crash course beginner web dev simplified"),
                      45, "Web Dev Simplified", "Pick a 30-60min one."),
                exercise("Skeleton",
                         "Create `index.html`. Use `<header>`, `<main>`, `<section>`, `<footer>`. Sections: Hero, Services, Pricing, About, Contact. Fill with the real info you collected. NO styling yet."),
            ]),
        day(3, "CSS — the look",
            "Modern CSS is good. You don't need a framework.",
            [
                video("Modern CSS — Kevin Powell",
                      search("kevin powell modern css 2024 beginner"),
                      45, "Kevin Powell", "The best CSS teacher alive."),
                exercise("Style it",
                         "Add `style.css`. Use a 2-color palette + 1 accent. Flexbox or grid for the layout. Real photos of the business (or stock that fits). Mobile-first — start at 360px wide."),
            ]),
        day(4, "Responsive design",
            "Most users are on phones. Build for them first.",
            [
                video("Responsive design — media queries + clamp()",
                      search("responsive web design 2024 mobile first"),
                      30, "various"),
                exercise("Phone → tablet → desktop",
                         "Open Chrome DevTools, toggle device mode. Make sure your site looks great at 360px, 768px, 1280px. Use `clamp()` for font sizes."),
            ]),
        day(5, "Forms + WhatsApp/email contact",
            "A small business site is useless without a way to contact.",
            [
                video("HTML forms in 10 minutes",
                      search("html forms tutorial beginner"), 10, "various"),
                exercise("Click-to-contact",
                         "Add a contact section with: tel: link (clickable on phones), mailto: link, and a `wa.me/<number>` WhatsApp link. No backend needed yet. Add a small contact form (action=mailto: works for now)."),
            ]),
        day(6, "Git + GitHub + Netlify deploy",
            "If it's not live, it doesn't exist.",
            [
                video("Git and GitHub for beginners — freeCodeCamp",
                      search("git and github for beginners freecodecamp"),
                      30, "freeCodeCamp"),
                video("Deploy a static site to Netlify",
                      search("deploy static site netlify drag and drop 2024"),
                      8, "various"),
                exercise("Go live",
                         "`git init`, push to a new GitHub repo, drag-and-drop the folder into Netlify, get a *.netlify.app URL. Share it in your notes."),
            ]),
        day(7, "Ship + polish",
            "Real polish: favicon, meta tags, performance.",
            [
                exercise("Final polish",
                         "Add: (1) a favicon, (2) `<meta name='description'>` so Google can index it, (3) Open Graph tags so it looks good shared on WhatsApp, (4) a Lighthouse score (Chrome DevTools → Lighthouse) of 90+ on Performance. Push. Show the live URL to the business owner. Get their feedback."),
                reflect("What would they pay for?",
                        "If you charged them $50 for this site, what feature would make them say yes immediately? Online booking? Photo gallery? Reviews?"),
            ]),
    ],
    "topics": [
        "Semantic HTML5",
        "Modern CSS — flexbox, grid, clamp(), custom properties",
        "Mobile-first responsive design",
        "Forms and contact patterns (tel:, mailto:, wa.me)",
        "Git basics — init, add, commit, push",
        "GitHub + Netlify static deploy",
        "Meta tags, OG tags, favicons, Lighthouse",
    ],
    "tasks": [
        "Pick a real small business and get their info",
        "Build a 5-section semantic HTML page with their real data",
        "Style with mobile-first CSS, 2-color palette",
        "Make it responsive at 360 / 768 / 1280px",
        "Add tel/mailto/WhatsApp click-to-contact",
        "Deploy to Netlify with a public URL",
        "Score 90+ on Lighthouse Performance",
    ],
    "project": (
        "Build a live 1-page site for a real small business in your area — a friend's "
        "tailor shop, a tutor, a bakery, anyone. Real name, real prices, real contact. "
        "Mobile-first. Click-to-WhatsApp. Public URL. The owner sees it before Sunday "
        "night. This is your first real client work — even if they don't pay."
    ),
    "exercises": [
        "Add a dark-mode toggle using `prefers-color-scheme`",
        "Make the hero image lazy-loaded with `loading=\"lazy\"`",
        "Add a 'Get directions' button that opens Google Maps to their address",
        "Write `<meta>` tags so the site preview on WhatsApp shows a photo + name",
    ],
    "questions": [
        "Whose site is this? What's their actual problem? (Be specific.)",
        "What 1 thing on the page would make a customer DM them?",
        "Why did you choose flexbox vs grid for each section?",
        "What would break if a customer used a 5-year-old Android phone?",
    ],
    "outputs": [
        "Public live URL on Netlify",
        "GitHub repo with the source",
        "Lighthouse Performance score ≥ 90",
        "Screenshot of the owner's reaction or feedback in your README",
    ],
}


# ─────────────────────────────────────────────────────────────────────
# MOBILE ENGINEERING — Week 1
# ─────────────────────────────────────────────────────────────────────
MOBILE = {
    "context": (
        "Mobile is HARD because phones are HARD — limited memory, flaky network, weird "
        "screen sizes, app stores that gate-keep. Week 1 you learn React Native + Expo and "
        "ship a real app to YOUR OWN phone by Sunday. No emulator-only nonsense."
    ),
    "days": [
        day(1, "Why React Native + Expo",
            "Build once, run on iOS and Android. Save your sanity.",
            [
                video("React Native in 100 seconds — Fireship",
                      yt("gvkqT_Uoahw"), 2, "Fireship", ""),
                video("Expo vs bare React Native — which to use 2025",
                      search("expo vs react native cli 2025"), 8, "various"),
                reflect("What will you build?",
                        "Pick ONE useful tool for YOUR life: a habit tracker, a workout timer, a daily journal, a price-watch list, a class schedule. Must be something YOU would open every day."),
            ]),
        day(2, "Set up Expo + run on your phone",
            "If it doesn't run on your phone today, the rest of the week is wasted.",
            [
                video("Expo Go quickstart — 2024/2025",
                      search("expo go quickstart 2025 react native tutorial"),
                      20, "various"),
                exercise("Hello phone",
                         "Install Node.js + Expo Go on your phone. Run `npx create-expo-app forge-mobile-week1`. Run `npx expo start`. Scan the QR with Expo Go. See 'Open up App.js to start working on your app!' on your phone screen."),
            ]),
        day(3, "React + JSX fundamentals",
            "If you've never seen React, this is the day.",
            [
                video("React in 100 seconds — Fireship",
                      yt("Tn6-PIqc4UM"), 2, "Fireship", ""),
                video("React fundamentals — components, props, state",
                      search("react native components props state tutorial 2024"),
                      30, "various"),
                exercise("Components",
                         "Make a `Header.js` component that takes a `title` prop and renders it. Import it in App.js. Pass 3 different titles."),
            ]),
        day(4, "useState — the only hook you need this week",
            "State is the heartbeat of any app.",
            [
                video("useState explained — Web Dev Simplified",
                      search("usestate hook react explained"), 12, "Web Dev Simplified"),
                exercise("Counter or toggle",
                         "Build a button that, when tapped, increments a number on screen. Then add a 'Reset' button. Then style the buttons with `TouchableOpacity` + StyleSheet."),
            ]),
        day(5, "Lists, navigation, persistence",
            "Real apps have screens and remember things.",
            [
                video("React Navigation — Stack navigator",
                      search("react navigation stack navigator expo tutorial"),
                      20, "various"),
                video("AsyncStorage in Expo — save data on device",
                      search("async storage expo tutorial save data"),
                      12, "various"),
                exercise("List + storage",
                         "Build a list screen with `FlatList`. Render 3 hard-coded items. Add a button that adds a new item to the list. Save the list to AsyncStorage so it survives app restart."),
            ]),
        day(6, "Style it like a real app",
            "Buttons should feel like buttons. Animations matter.",
            [
                video("React Native styling — flexbox + StyleSheet",
                      search("react native styling flexbox stylesheet 2024"),
                      20, "various"),
                exercise("Polish",
                         "Make your app look intentional: a real color palette, real font sizes, padding that feels right on a phone. Use `SafeAreaView`. Test on both phone orientations."),
            ]),
        day(7, "Ship — APK / TestFlight",
            "It's not done until it's installed on a phone other than yours.",
            [
                video("Expo EAS Build — first build",
                      search("expo eas build android apk 2024"), 20, "various"),
                exercise("Build the passport app",
                         "Polish your app into one finished thing. Push to GitHub. Run `eas build` for Android (free) and get an APK link. Send it to a friend over WhatsApp. Have them install it and use it for a day. Get their feedback."),
                reflect("What did they actually do?",
                        "Did your friend open the app? Use it once? Use it twice? Never open it? What does that tell you about the value of what you built?"),
            ]),
    ],
    "topics": [
        "JavaScript ES2020+ refresher (arrow fn, async, destructuring)",
        "React components, props, state",
        "JSX, TouchableOpacity, FlatList, SafeAreaView",
        "useState (rest of hooks later)",
        "React Navigation — Stack",
        "AsyncStorage for local persistence",
        "Expo Go workflow + EAS build basics",
    ],
    "tasks": [
        "Install Node.js + Expo CLI + Expo Go on your phone",
        "Initialize a new Expo app and run it on your actual phone",
        "Build a 2-screen app with navigation",
        "Persist data with AsyncStorage so it survives restart",
        "Style with flexbox + StyleSheet to look real",
        "Build an APK with EAS and install it on a friend's phone",
        "Get one real user's feedback by Sunday",
    ],
    "project": (
        "Pick something YOU would use every day — a habit tracker, water reminder, "
        "expense logger, anything. Build it in Expo, install it on your phone, install "
        "it on one friend's phone. Get their reaction. The 'app store' part doesn't "
        "matter yet — a real APK on a real phone IS a portfolio piece."
    ),
    "exercises": [
        "Add a delete-item button to your list with a confirmation dialog",
        "Add light/dark mode using `useColorScheme()`",
        "Use the device's haptic feedback on button press (`expo-haptics`)",
        "Show today's date at the top of the home screen, formatted nicely",
    ],
    "questions": [
        "What would make your friend actually open the app tomorrow without you nagging?",
        "What breaks if they have no internet? Should it work offline?",
        "What's the smallest version of this app a stranger would pay $1/mo for?",
        "If iOS people use your app, what looks wrong vs Android?",
    ],
    "outputs": [
        "GitHub repo with the Expo app source",
        "Working APK link (from EAS build)",
        "Screenshot of app running on your phone + a friend's phone",
        "Written feedback from one real user",
    ],
}


# ─────────────────────────────────────────────────────────────────────
# DEVOPS & CLOUD — Week 1
# ─────────────────────────────────────────────────────────────────────
DEVOPS = {
    "context": (
        "DevOps is the discipline of shipping code reliably and cheaply. Week 1 is Linux + "
        "Git + your first cloud deploy. By Sunday you'll have a live static site running on "
        "AWS S3 + CloudFront for under $1/month, served from a domain edge near every "
        "continent."
    ),
    "days": [
        day(1, "The Linux shell — the cloud's UI",
            "Every cloud server is a Linux box. Get comfortable in it.",
            [
                video("Linux for hackers — NetworkChuck (Ep 1)",
                      search("networkchuck linux for hackers episode 1"),
                      30, "NetworkChuck", "The most addictive Linux intro on YouTube."),
                exercise("Pick your environment",
                         "If on Windows → install WSL2 + Ubuntu. If on Mac → just open Terminal. If on Linux → you're set. Verify: `uname -a`, `whoami`, `pwd`, `ls -la`."),
            ]),
        day(2, "Shell commands you'll use forever",
            "20 commands cover 95% of daily work.",
            [
                video("Bash basics — full crash course",
                      search("bash shell crash course beginner 2024"),
                      30, "various"),
                exercise("The big 20",
                         "Practice each: `cd`, `ls`, `mkdir`, `touch`, `cat`, `less`, `grep`, `find`, `cp`, `mv`, `rm`, `chmod`, `chown`, `ps`, `kill`, `df`, `du`, `curl`, `wget`, `ssh`. Write a 1-line note next to each in a `shell-notes.md` file."),
            ]),
        day(3, "Git the right way",
            "It's not a backup tool. It's how teams ship.",
            [
                video("Git + GitHub for beginners — freeCodeCamp",
                      search("git github freecodecamp full course"),
                      60, "freeCodeCamp"),
                exercise("Branching basics",
                         "Create a repo. Make a `main` branch with a README. Create a `feature/add-info` branch. Make a change. Open a PR (Pull Request) to merge it into main. Self-merge. This is the workflow you'll use forever."),
            ]),
        day(4, "What 'the cloud' actually is",
            "EC2, S3, IAM, regions. Get the mental model.",
            [
                video("AWS in 10 minutes — Fireship",
                      yt("Z4AmZSm5OTI"), 10, "Fireship", ""),
                video("Set up an AWS Free Tier account safely",
                      search("aws free tier account setup billing alerts 2024"),
                      15, "various", "MFA + billing alerts on day one."),
                exercise("Sign up + safety net",
                         "Create an AWS account. Enable MFA on root. Set a billing alarm at $5 so a misconfig doesn't bankrupt you. Create an IAM user named `forge-dev` with `AdministratorAccess` and use IT, not root, for everything from here on."),
            ]),
        day(5, "Static hosting on S3 + CloudFront",
            "The cheapest way to put a real site on a real domain.",
            [
                video("Host a static site on S3 + CloudFront — full tutorial",
                      search("aws s3 cloudfront static website hosting tutorial"),
                      40, "various", "Pick one from 2023+ — the console changed."),
                exercise("Deploy a real file",
                         "Make a folder with `index.html` that says 'Hello from <your name>'. Create an S3 bucket. Upload. Put a CloudFront distribution in front. Visit the *.cloudfront.net URL — your file is now served from edge locations worldwide."),
            ]),
        day(6, "Infrastructure as Code (Terraform intro)",
            "Click-ops dies on day 30. Code it.",
            [
                video("Terraform in 100 seconds — Fireship",
                      yt("tomUWcQ0P3k"), 2, "Fireship", ""),
                video("Terraform AWS first project",
                      search("terraform aws beginner tutorial 2024"),
                      30, "various"),
                exercise("Re-create your bucket with Terraform",
                         "Write a `main.tf` that creates an S3 bucket. Run `terraform init`, `terraform plan`, `terraform apply`. Destroy with `terraform destroy`. Commit the .tf file (NOT the state)."),
            ]),
        day(7, "Ship the passport project",
            "A live, edge-served site, fully coded.",
            [
                exercise("Static portfolio at the edge",
                         "Build a 1-page personal portfolio (your name, your story, your projects so far). Write Terraform that provisions: S3 + CloudFront + an Origin Access Identity. `terraform apply`. Upload `index.html`. Visit the CloudFront URL — you're live. Push the Terraform code to GitHub with a README explaining each resource. Cost: < $1/month."),
                reflect("What did you skip?",
                        "List 3 things a real production site needs that yours doesn't yet — HTTPS cert, CI/CD pipeline, monitoring, etc. These are weeks 2-4."),
            ]),
    ],
    "topics": [
        "Linux shell — file ops, processes, permissions",
        "Bash basics + understanding $PATH",
        "Git — branches, PRs, conflicts",
        "AWS account hygiene — MFA, IAM, billing alerts",
        "S3 buckets + static hosting",
        "CloudFront edge distribution",
        "Terraform fundamentals — init, plan, apply, destroy",
    ],
    "tasks": [
        "Get a working Linux shell (WSL on Windows, Terminal on Mac/Linux)",
        "Practice the 20 essential shell commands",
        "Create a Git repo, branch, commit, merge a PR",
        "Set up an AWS account with MFA + billing alert",
        "Deploy a static file to S3 + CloudFront via the console",
        "Re-deploy the same site using Terraform code",
        "Commit the Terraform code to GitHub",
    ],
    "project": (
        "Deploy your own portfolio page to AWS S3 + CloudFront, provisioned entirely with "
        "Terraform — no console clicks. Push the .tf files to GitHub with a README explaining "
        "what each resource does. Cost target: < $1/month at AWS Free Tier limits. The "
        "infrastructure code IS the portfolio piece."
    ),
    "exercises": [
        "Add a `terraform output` block that prints the CloudFront URL",
        "Add S3 bucket versioning and test by re-uploading the same file",
        "Compare cost: S3 + CloudFront vs Netlify free tier — when does each win?",
        "Run `terraform plan` after a small console change — what diff appears?",
    ],
    "questions": [
        "Why does CloudFront sit in front of S3 — why not just S3?",
        "What's the difference between `terraform apply` and `terraform import`?",
        "How would you give a friend read-only access to the bucket without sharing your account?",
        "If your AWS bill hit $50, what's the FIRST place you'd look?",
    ],
    "outputs": [
        "Live CloudFront URL serving your page",
        "GitHub repo with the Terraform code + README",
        "Monthly cost projection in your README (it should say <$1)",
        "Screenshot of `terraform apply` output committed as proof",
    ],
}


# ─────────────────────────────────────────────────────────────────────
# CYBERSECURITY — Week 1
# ─────────────────────────────────────────────────────────────────────
CYBERSEC = {
    "context": (
        "Cybersecurity is offence and defence on real systems. Week 1 you set up Kali + "
        "TryHackMe + your first vuln lab. By Sunday you'll have completed a real OWASP "
        "Top 10 walkthrough against an intentionally vulnerable site (NOT a live one!) and "
        "written a CVE-style report. The report IS your passport."
    ),
    "days": [
        day(1, "What hacking actually is (ethics first)",
            "If you're going to learn this, you sign the contract: you only attack what you own or have permission to attack.",
            [
                video("Cybersecurity in 100 seconds — Fireship",
                      search("fireship cybersecurity 100 seconds"), 2, "Fireship", ""),
                video("How hackers think — John Hammond",
                      search("john hammond how to think like a hacker"),
                      20, "John Hammond"),
                reflect("Sign the ethics contract",
                        "Write in your README: 'I will only attack systems I own or have explicit written permission to test. I will report vulnerabilities responsibly.' Date it. Sign it (digitally). This is non-negotiable."),
            ]),
        day(2, "Set up Kali Linux (in a VM, not bare metal)",
            "Kali is the practitioner's OS. Run it in a sandbox.",
            [
                video("Install Kali in VirtualBox — step by step",
                      search("install kali linux virtualbox 2024 tutorial"),
                      30, "various"),
                exercise("Bring up Kali",
                         "Install VirtualBox, download Kali, boot it in a VM. Open a terminal in Kali. Run `nmap --version` and `sqlmap --version`. You're ready."),
            ]),
        day(3, "Networking fundamentals you actually need",
            "If you can't read a TCP handshake you can't read an exploit.",
            [
                video("Networking for hackers — NetworkChuck",
                      search("networkchuck networking basics tcpip"),
                      45, "NetworkChuck"),
                exercise("nmap your own laptop",
                         "From Kali, run `nmap -sV 127.0.0.1`. What ports are open on YOUR machine? Why is each one open? Don't scan anyone else."),
            ]),
        day(4, "OWASP Top 10 — the syllabus of web hacking",
            "10 vuln categories cover 90% of real-world breaches.",
            [
                video("OWASP Top 10 explained 2024",
                      search("owasp top 10 2024 explained"), 20, "various"),
                reading("OWASP Top 10 — official",
                        "https://owasp.org/www-project-top-ten/", "Bookmark for life."),
                exercise("Pick your favourite",
                         "Read the 10. Write 1 sentence per item explaining it in plain English. Pick the one that scares you most — that's the one you'll exploit tomorrow."),
            ]),
        day(5, "TryHackMe — your first room",
            "Real targets in a sandboxed playground.",
            [
                video("TryHackMe walkthrough — Introduction to OWASP Top 10",
                      search("tryhackme owasp top 10 walkthrough"),
                      30, "various"),
                exercise("Complete the OWASP Top 10 room",
                         "Sign up on tryhackme.com (free tier). Complete the 'OWASP Top 10' room. Take screenshots of each step. Don't skip — even if you've seen it before."),
            ]),
        day(6, "Find an actual bug in a deliberately vulnerable app",
            "DVWA / Juice Shop are practice ranges. Use them.",
            [
                video("OWASP Juice Shop — 5 challenges",
                      search("juice shop owasp tutorial challenges beginner"),
                      30, "various"),
                exercise("Solve 3 Juice Shop challenges",
                         "Spin up OWASP Juice Shop (Docker `docker run --rm -p 3000:3000 bkimminich/juice-shop`). Solve the 3 easiest challenges (look in the score board for the green ones). Screenshot each."),
            ]),
        day(7, "Write the CVE-style report",
            "Finding a bug is half. Writing it up is the other half.",
            [
                exercise("Passport — vulnerability report",
                         "Pick ONE bug you found this week (in Juice Shop, DVWA, or a THM room). Write a report in this exact format:\n  1. **Title** (e.g. 'Reflected XSS in /search query parameter')\n  2. **Severity** (Low / Medium / High / Critical) — justify it\n  3. **Affected component** (the URL + parameter)\n  4. **Steps to reproduce** — numbered, exact, copy-pasteable\n  5. **Impact** — what could an attacker do?\n  6. **Suggested fix** — concrete code or config change\n  7. **Screenshots** — proof\nPush to GitHub. Format like a real CVE — this is what every bug bounty submission looks like."),
                reflect("Could you submit this?",
                        "If Juice Shop was a real company on HackerOne, would this report earn a bounty? Why or why not?"),
            ]),
    ],
    "topics": [
        "Ethics of security testing — written consent only",
        "VM-based hacking lab setup with Kali + VirtualBox",
        "Networking basics — TCP/IP, ports, services",
        "nmap basic usage",
        "OWASP Top 10 vulnerability categories",
        "TryHackMe + Juice Shop practice ranges",
        "Writing a CVE-style report",
    ],
    "tasks": [
        "Set up Kali in a VM",
        "Sign and commit your ethics contract to GitHub",
        "Run nmap against your own machine — understand the output",
        "Read OWASP Top 10 and summarize each item",
        "Complete the TryHackMe OWASP Top 10 room",
        "Solve 3 Juice Shop challenges",
        "Write 1 polished CVE-style vulnerability report",
    ],
    "project": (
        "Write your first vulnerability report. Pick one bug from a deliberately "
        "vulnerable app (Juice Shop, DVWA, or a TryHackMe room). Format it like a real "
        "HackerOne submission — title, severity, repro, impact, fix, screenshots. Push "
        "to a GitHub repo titled `vuln-reports`. This becomes the spine of your security "
        "portfolio. Future real reports go in the same repo."
    ),
    "exercises": [
        "nmap a docker container you spun up — what ports show?",
        "Read 3 public HackerOne reports and note the pattern in their writeups",
        "Set up Burp Suite Community and intercept one request from Juice Shop",
        "Look up a recent CVE (cvedetails.com) and read the technical detail",
    ],
    "questions": [
        "What's the difference between a black-box and a white-box test?",
        "Why is XSS in /search worse than XSS in /admin-only-page?",
        "What's a 'proof of concept' and why is it required in any report?",
        "Who legally owns the bugs you find on a CTF? On a bug bounty? On your employer's app?",
    ],
    "outputs": [
        "Working Kali VM",
        "Signed ethics contract in your repo",
        "TryHackMe profile showing OWASP Top 10 room complete",
        "GitHub repo with a polished CVE-style report",
    ],
}


# ─────────────────────────────────────────────────────────────────────
# DATA SCIENCE — Week 1
# ─────────────────────────────────────────────────────────────────────
DATA_SCI = {
    "context": (
        "Data Science is statistics + storytelling. Week 1 you set up Python + Jupyter and "
        "do your first real analysis on a dataset YOU pick — something specific to a place "
        "or industry you care about. By Sunday you'll have a polished notebook that answers "
        "a real question with a real chart."
    ),
    "days": [
        day(1, "What is data science vs ML vs analytics?",
            "These overlap but they're different jobs. Know the difference.",
            [
                video("Data Science in 100 seconds — Fireship",
                      yt("X3paOmcrTjQ"), 2, "Fireship", ""),
                video("DS vs ML vs Analytics — clear breakdown",
                      search("data science vs machine learning vs analytics"),
                      10, "various"),
                reflect("Pick your question",
                        "What's a question YOU want to answer with data? 'Are flights from my city getting more delayed?' 'Is rainfall in my region trending up?' 'Are women's wages catching up to men's in my country?' Pick one. Specific. Answerable."),
            ]),
        day(2, "Python + Jupyter setup",
            "If your tools aren't smooth, your analysis won't be either.",
            [
                video("Install Anaconda + Jupyter for data science",
                      search("install anaconda jupyter data science 2024"),
                      15, "various"),
                exercise("Sanity check notebook",
                         "Open Jupyter. Create `forge-ds-week1.ipynb`. Import pandas, numpy, matplotlib, seaborn. Print versions. Commit to a fresh GitHub repo."),
            ]),
        day(3, "Find a real dataset (not Titanic, not Iris)",
            "Half the job is finding good data.",
            [
                video("Where to find real datasets — open data sources",
                      search("best open data sources data science 2024"),
                      15, "various"),
                reading("Awesome Public Datasets — GitHub",
                        "https://github.com/awesomedata/awesome-public-datasets",
                        "Bookmark it forever."),
                exercise("Get your data",
                         "Find a CSV (or scrape one) that lets you answer your Day 1 question. Options: your country's stats office, World Bank Open Data, Kaggle Datasets, data.gov, UN data. Save it to `data/raw.csv` and commit."),
            ]),
        day(4, "Clean it — most of the job",
            "Real data is messy. Cleaning is the work.",
            [
                video("Pandas data cleaning crash course",
                      search("pandas data cleaning tutorial 2024"),
                      30, "various"),
                exercise("Clean it up",
                         "Load `data/raw.csv`. Handle missing values (dropna or fillna — justify your choice). Fix column types (strings to dates, strings to numbers). Drop duplicates. Save the clean version as `data/clean.csv`. Add a 'Cleaning' markdown section to your notebook explaining EVERY decision."),
            ]),
        day(5, "Explore — find the story",
            "EDA is detective work.",
            [
                video("Exploratory Data Analysis — full walkthrough",
                      search("exploratory data analysis python tutorial"),
                      30, "various"),
                exercise("3 plots, 3 surprises",
                         "Plot 3 things about your cleaned data. For each, write 1 sentence: what surprised you? What did you expect that wasn't true?"),
            ]),
        day(6, "Stats — the minimum you must know",
            "Mean, median, distribution, correlation. That's the floor.",
            [
                video("Statistics for data science — crash course",
                      search("statistics data science crash course"),
                      45, "various"),
                exercise("Stats on your data",
                         "Compute: mean, median, std, range of your KEY variable. Compute the correlation between 2 variables you think are related. Was the correlation what you expected?"),
            ]),
        day(7, "Polish the passport notebook",
            "A notebook nobody reads is wasted work.",
            [
                exercise("Write it like a story",
                         "Restructure your notebook into a publishable piece:\n  1. **Title + 1-line summary** ('Are flights from Lagos getting more delayed? Yes — 18% more in 2024 than 2020.')\n  2. **The question** — why does it matter?\n  3. **The data** — source link, date, what's in it\n  4. **The cleaning** — what you fixed, what assumptions you made\n  5. **3 charts that tell the story** — each with a caption\n  6. **The answer** — direct, honest, qualified\n  7. **What I'd do next** — 3 follow-ups\nRender to HTML. Link in the README. Push."),
                reflect("Who should read this?",
                        "If you sent this notebook to 1 specific journalist, policy maker, or business owner, who would it be — and why would they care?"),
            ]),
    ],
    "topics": [
        "Anaconda + Jupyter workflow",
        "pandas — load, clean, transform",
        "Handling missing data — dropna, fillna, when to use each",
        "Type coercion + date parsing",
        "EDA — distributions, scatter, correlation",
        "Basic stats — mean, median, std, correlation, percentiles",
        "Storytelling in a notebook — captions, narration, structure",
    ],
    "tasks": [
        "Pick a specific, answerable question you care about",
        "Find a non-generic dataset that lets you answer it",
        "Clean the data with documented decisions",
        "Explore visually with 3+ charts",
        "Compute basic statistics on key variables",
        "Polish notebook into a story-shaped artifact",
        "Push everything to GitHub with a rendered HTML link",
    ],
    "project": (
        "Pick a question that matters to you — about your city, your industry, your "
        "country, your family — anything specific. Find data nobody else's portfolio uses. "
        "Clean it, plot it, answer it. The notebook is the deliverable: a publishable piece "
        "of analysis that a stranger could read and understand the answer."
    ),
    "exercises": [
        "Add a 5-year vs 1-year comparison chart for your KEY metric",
        "Compute a simple linear trend line and report its slope",
        "Find an outlier in your data and explain WHY it's an outlier",
        "Plot the same data 3 different ways — which conveys the story best?",
    ],
    "questions": [
        "What's the source's incentive to publish this data — and what might they hide?",
        "What would change the answer to your question if you had 10x more data?",
        "Where does correlation NOT imply causation in your finding?",
        "Who could (mis)use your analysis to support a wrong conclusion?",
    ],
    "outputs": [
        "Jupyter notebook on GitHub with cells run",
        "Cleaned CSV committed under `data/clean.csv`",
        "Rendered HTML or nbviewer link in the README",
        "1-paragraph 'What I found' summary in the README",
    ],
}


# ─────────────────────────────────────────────────────────────────────
# DATA ANALYSIS — Week 1
# ─────────────────────────────────────────────────────────────────────
DATA_AN = {
    "context": (
        "Data Analysis is the daily-driver job: SQL, Excel/Sheets, dashboards. Week 1 you "
        "get fluent in spreadsheets, learn the SQL that covers 80% of real queries, and "
        "produce one polished one-page dashboard. The skill: turning a table into a "
        "decision."
    ),
    "days": [
        day(1, "What does an analyst actually do all day?",
            "Pulling numbers, answering questions, fighting bad assumptions.",
            [
                video("Day in the life — Data Analyst",
                      search("day in the life data analyst real"), 12, "various"),
                reflect("Pick your domain",
                        "What domain do you want to analyze? E-commerce sales, healthcare, sports, finance, education, climate, music? Pick one. Stick with it Week 1."),
            ]),
        day(2, "Excel / Google Sheets like a pro",
            "Spreadsheets are the universal language of business.",
            [
                video("Excel essentials — Leila Gharani",
                      search("leila gharani excel beginner tutorial"),
                      45, "Leila Gharani"),
                exercise("The big formulas",
                         "Practice: SUMIF, COUNTIF, AVERAGEIF, VLOOKUP (or XLOOKUP), INDEX/MATCH, IF, IFS. Build a tiny tracker for something you do this week (workouts, expenses, hours studied)."),
            ]),
        day(3, "Pivot tables — the analyst's superpower",
            "1000 rows → 1 actionable insight in 30 seconds.",
            [
                video("Pivot tables in 20 minutes — Leila Gharani",
                      search("leila gharani pivot tables"),
                      20, "Leila Gharani"),
                exercise("Pivot on your data",
                         "Find a CSV in your chosen domain (Kaggle, your gov't stats office). Load into Sheets/Excel. Build 3 different pivot tables answering 3 different questions."),
            ]),
        day(4, "SQL — the language of data",
            "If you can write 10 SQL queries you can do 90% of analyst work.",
            [
                video("SQL crash course — 1 hour",
                      search("sql crash course beginner full"),
                      60, "various"),
                exercise("SQL on real data",
                         "Use sqlite-online.com or DB Browser for SQLite. Import your dataset. Write: SELECT, WHERE, GROUP BY, JOIN, ORDER BY, LIMIT, AVG, SUM. Save 10 queries to `queries.sql` and commit."),
            ]),
        day(5, "Visualize for non-technical people",
            "Beautiful chart < clear chart. Clear chart < truthful chart.",
            [
                video("Data viz principles — Storytelling with Data",
                      search("storytelling with data viz tutorial"),
                      30, "various"),
                exercise("3 charts that don't lie",
                         "Make 3 charts answering 3 questions from your data. For each, force yourself to write a 1-sentence caption explaining what a non-analyst should take away."),
            ]),
        day(6, "Dashboards — the deliverable",
            "Slack messages get lost. Dashboards live forever.",
            [
                video("Build a Sheets dashboard from scratch",
                      search("google sheets dashboard tutorial 2024"),
                      30, "various"),
                exercise("Dashboard v1",
                         "Build a one-page dashboard in Sheets or Excel. 4 KPIs at the top (big numbers). 3 charts below. 1 data table at the bottom. Period filter (this month / last month) using a dropdown. Lock the layout."),
            ]),
        day(7, "Ship the passport report",
            "An analyst's portfolio piece is a single page that drives a decision.",
            [
                exercise("The one-pager",
                         "Take your dashboard and write a 1-page memo above it. Title: 'What I found in [your dataset]'. Format:\n  - **The question** (1 sentence)\n  - **The answer** (1 sentence, direct)\n  - **3 key numbers** with brief context\n  - **3 charts** with captions\n  - **Recommendation** (what should somebody DO based on this?)\nExport as PDF. Commit the source + the PDF to GitHub. This is a real analyst deliverable."),
                reflect("Would your boss act on this?",
                        "Pretend you're a manager who just got this PDF. Would you change anything tomorrow? If no — your insight isn't strong enough. Why?"),
            ]),
    ],
    "topics": [
        "Excel/Sheets essentials — SUMIF, VLOOKUP/XLOOKUP, IF, INDEX/MATCH",
        "Pivot tables and slicers",
        "SQL — SELECT, WHERE, GROUP BY, JOIN, aggregates",
        "Visualization principles — clarity over decoration",
        "Building dashboards in Sheets/Excel",
        "Writing 1-page analyst memos",
        "Choosing the right chart for the question",
    ],
    "tasks": [
        "Practice 7+ essential Excel/Sheets formulas",
        "Build 3 pivot tables on a real dataset",
        "Set up a SQL playground (SQLite browser or sqlite-online)",
        "Write 10 SQL queries against your dataset",
        "Produce 3 clear charts with captions",
        "Build a one-page dashboard",
        "Write + export a 1-page PDF analyst memo",
    ],
    "project": (
        "Pick a domain you care about (sports, e-commerce, climate, education). Find a "
        "real dataset. Build a 1-page dashboard + 1-page memo that someone could USE to "
        "make a decision. The PDF is the portfolio piece — name it well, format it well, "
        "commit it to GitHub. This is exactly what an interviewer will ask you to do."
    ),
    "exercises": [
        "Add a year-over-year comparison row to your dashboard",
        "Find one number that contradicts your headline finding — explain it",
        "Rewrite your headline 5 different ways — which is the most honest?",
        "Pretend the dataset is missing 30% of rows — would your answer change?",
    ],
    "questions": [
        "Who's the decision-maker reading this memo?",
        "What's the one action they could take after reading it?",
        "Where did you cherry-pick? Be honest with yourself.",
        "What would a skeptical analyst ask you to defend?",
    ],
    "outputs": [
        "GitHub repo with the dataset + queries + dashboard file",
        "1-page PDF memo committed",
        "10 SQL queries in `queries.sql`",
        "Screenshot of the dashboard in the README",
    ],
}


# ─────────────────────────────────────────────────────────────────────
# BI ANALYTICS — Week 1
# ─────────────────────────────────────────────────────────────────────
BI = {
    "context": (
        "BI (Business Intelligence) is the discipline of building dashboards leadership "
        "lives in. Week 1 you set up Power BI (the industry standard), connect to real "
        "data, and build your first executive-grade dashboard. By Sunday you'll publish a "
        "real interactive dashboard to Power BI Service."
    ),
    "days": [
        day(1, "What is BI — really?",
            "Spreadsheets for execs. Live. Multi-source. Self-serve.",
            [
                video("What is Power BI? — Microsoft Learn",
                      search("what is power bi microsoft beginner"),
                      10, "various"),
                reflect("Pick a business",
                        "Pretend you've just been hired as the BI analyst for a hypothetical SMB — a chain of cafes, a delivery service, an online store, a clinic. Pick ONE. Note: 3-5 KPIs that owner would care about every Monday."),
            ]),
        day(2, "Install Power BI Desktop + connect",
            "Free on Windows. (Mac users: use Power BI Service in browser, or a Windows VM.)",
            [
                video("Power BI Desktop install + first import",
                      search("install power bi desktop tutorial 2024"),
                      15, "various"),
                exercise("Connect to data",
                         "Open Power BI Desktop. Import a CSV (e.g. AdventureWorks sample, or your own). Click Transform Data — get into Power Query."),
            ]),
        day(3, "Power Query — the data prep layer",
            "BI lives or dies in Power Query. Get fluent.",
            [
                video("Power Query for beginners — Guy in a Cube",
                      search("guy in a cube power query beginner"),
                      30, "Guy in a Cube"),
                exercise("Clean it",
                         "Use Power Query to: change a column type, split a column, remove duplicates, filter rows, add a calculated column. Save the .pbix file. Commit to GitHub via Git LFS or zipped."),
            ]),
        day(4, "Data modelling — the relationships",
            "Star schemas are the difference between fast and broken dashboards.",
            [
                video("Star schema explained — Power BI",
                      search("power bi star schema fact dimension"),
                      20, "various"),
                exercise("Two tables, one relationship",
                         "Get a sample sales-and-customers dataset (or split your data). Create a relationship between Customer.id and Sales.customer_id. Verify it works by dragging fields from both into a single visual."),
            ]),
        day(5, "DAX — the language of measures",
            "DAX = the formula language. 5 functions cover the basics.",
            [
                video("DAX in 30 minutes — SQLBI",
                      search("sqlbi dax beginner tutorial"),
                      30, "SQLBI"),
                exercise("First measures",
                         "Write these DAX measures: Total Sales = SUM(Sales[Amount]); Sales YTD = TOTALYTD(...); Sales vs LY = [Total Sales] - CALCULATE([Total Sales], DATEADD(...)). Test each in a card visual."),
            ]),
        day(6, "Design the dashboard",
            "Less is more. Executives skim, they don't read.",
            [
                video("Power BI dashboard design — best practices",
                      search("power bi dashboard design best practices"),
                      20, "various"),
                exercise("Layout",
                         "Build one page. Top row: 4 KPI cards (Revenue, Customers, AOV, Growth%). Middle: 1 trend line over time. Bottom: 1 table broken down by category. Add a date slicer. Use brand colors of your imagined business."),
            ]),
        day(7, "Publish — the passport",
            "A dashboard nobody can open is a static slide.",
            [
                video("Publish to Power BI Service",
                      search("publish power bi service share dashboard"),
                      10, "various"),
                exercise("Go live",
                         "Sign up for Power BI Service (free Microsoft account). Publish your .pbix. Set up auto-refresh if your source supports it. Get a shareable URL. Copy the URL into your GitHub README — this is the link recruiters will click."),
                reflect("Would the owner pay for this?",
                        "If you showed the owner of your imagined business this dashboard for $200/month, would they sign? What feature would make it a $1000/month dashboard?"),
            ]),
    ],
    "topics": [
        "Power BI Desktop installation + workspace",
        "Power Query — load, clean, type, filter, merge",
        "Data modelling — fact vs dimension, star schema",
        "Relationships, cardinality, cross-filter direction",
        "DAX basics — SUM, CALCULATE, TOTALYTD, DATEADD",
        "Dashboard design — KPI cards, trends, slicers, colour, hierarchy",
        "Publishing to Power BI Service + sharing",
    ],
    "tasks": [
        "Install Power BI Desktop (or set up Service in browser)",
        "Import a real CSV via Power Query",
        "Clean + type-correct your data in Power Query",
        "Create one relationship between 2 tables",
        "Write 3+ DAX measures",
        "Build a 1-page executive dashboard",
        "Publish to Power BI Service and get a shareable URL",
    ],
    "project": (
        "Pretend you're the new BI hire at a hypothetical SMB (a cafe chain, a delivery "
        "service, a clinic — your pick). Build a 1-page Power BI dashboard with 4 KPI "
        "cards, 1 trend chart, 1 breakdown table, and a date slicer. Publish it to Power "
        "BI Service. Put the public URL in your GitHub README. This is exactly the take-home "
        "you'll get in BI job interviews."
    ),
    "exercises": [
        "Add a What-If parameter so the user can simulate a 10% price change",
        "Create a drill-through page from the breakdown table to a single category",
        "Add conditional formatting on the KPI cards (green if above target)",
        "Make 2 versions of the same dashboard — one for the CEO, one for ops manager",
    ],
    "questions": [
        "Which 4 KPIs would the owner check FIRST every Monday?",
        "What's the difference between an implicit and explicit DAX measure?",
        "Why is your data model a star schema and not a flat table?",
        "If the data refresh fails at 6am, who sees it and who fixes it?",
    ],
    "outputs": [
        "Published Power BI dashboard URL",
        ".pbix file in a GitHub repo (zipped if needed)",
        "Screenshot of the dashboard in the README",
        "1-paragraph explanation of which business this is for and which KPIs you chose",
    ],
}


# ─────────────────────────────────────────────────────────────────────
# Apply to all roadmaps
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
        # Find week 1
        for i, week in enumerate(weeks):
            if week.get("number") == 1:
                preserved = {
                    "number": 1,
                    "title": week.get("title") or "Foundation",
                    "phase": week.get("phase") or "Foundation",
                    "commitment_hours": week.get("commitment_hours") or "15–25",
                    "resources": week.get("resources", []),
                }
                preserved.update(w1)
                weeks[i] = preserved
                break
        data["weeks"] = weeks
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  ✓ {slug}: Week 1 rewritten ({len(w1['days'])} days, project: passport-style)")


if __name__ == "__main__":
    apply()
