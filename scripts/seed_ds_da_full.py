"""
Finish Data Science (W5-W20) and Data Analysis (W5-W18).
Plain-English, project-arc-driven content for every week.

Data Science arc:
  P1 TaxiPulse NYC (W1-6) → P2 Reddit Sentiment (W7-12)
  → P3 Time Series Forecasting (W13-17) → P4 Capstone (W18-20)

Data Analysis arc:
  P1 Superstore (W1-6) → P2 HR Attrition (W7-10)
  → P3 Marketing Funnel (W11-14) → P4 Executive Dashboard Capstone (W15-18)
"""

import json, os
from urllib.parse import quote_plus

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data", "roadmaps")


def yt(v):     return f"https://www.youtube.com/watch?v={v}"
def search(q): return f"https://www.youtube.com/results?search_query={quote_plus(q)}"
def video(t, u, m, c, w=""):  return {"kind": "video", "title": t, "url": u, "duration_min": m, "creator": c, "why": w}
def reading(t, u, w=""):       return {"kind": "reading", "title": t, "url": u, "why": w}
def exercise(t, b):            return {"kind": "exercise", "title": t, "body": b}
def reflect(t, b):             return {"kind": "reflection", "title": t, "body": b}
def day(n, t, s, items):       return {"number": n, "title": t, "summary": s, "items": items}


def week(num, title, phase, hours, context, days, topics, tasks, project, exercises, questions, outputs):
    return {
        "number": num, "title": title, "phase": phase, "commitment_hours": hours,
        "context": context, "days": days, "topics": topics, "tasks": tasks,
        "project": project, "resources": [], "exercises": exercises,
        "questions": questions, "outputs": outputs,
    }


# ═══════════════════════════════════════════════════════════════════════
# DATA SCIENCE — Weeks 5 through 20
# ═══════════════════════════════════════════════════════════════════════

# Week 5: Finish TaxiPulse — interactive Streamlit explorer
DS_W5 = week(
    5, "TaxiPulse v0.5: Streamlit explorer", "Foundation", "12-18",
    "Last week your fare API went live. This week you put a UI on top — a Streamlit explorer where anyone can pick a route and see the predicted fare + Q4 trends.",
    [
        day(1, "Plan the explorer", "Sketch the UI before you code.",
            [
                reading("Streamlit docs",
                        "https://docs.streamlit.io/library/get-started",
                        "Click 'Open' to bookmark for this week."),
                reflect("UI sketch",
                        "Sketch on paper:\n  - Title: 'TaxiPulse NYC Explorer'\n  - Sidebar: borough dropdown, hour slider, distance slider\n  - Main: predicted fare card + Q4 trend chart + a map of NYC borough boundaries"),
            ]),
        day(2, "Set up Streamlit", "Install + Hello world.",
            [
                exercise("First app",
                         "STEP 1 — In your taxipulse folder, terminal:\n"
                         "      pip install streamlit\n\n"
                         "STEP 2 — Create explorer.py:\n"
                         "      import streamlit as st\n"
                         "      st.title('TaxiPulse NYC Explorer')\n"
                         "      st.write('Q4 2023 yellow taxi data + fare prediction')\n\n"
                         "STEP 3 — Run:\n"
                         "      streamlit run explorer.py\n"
                         "  YOU SHOULD SEE: localhost:8501 with your title."),
            ]),
        day(3, "Sidebar controls", "",
            [
                exercise("Sidebar widgets",
                         "Add to explorer.py:\n"
                         "      borough = st.sidebar.selectbox('Pickup borough', ['Manhattan','Brooklyn','Queens','Bronx','Staten Island'])\n"
                         "      hour = st.sidebar.slider('Pickup hour', 0, 23, 14)\n"
                         "      distance = st.sidebar.slider('Trip distance (mi)', 0.5, 50.0, 5.0)\n"
                         "      duration = st.sidebar.slider('Duration (min)', 1, 120, 18)\n\n"
                         "      st.write(f'Selected: {borough}, hour {hour}, {distance} mi, {duration} min')"),
            ]),
        day(4, "Load model + predict",
            "",
            [
                exercise("Wire the predictor",
                         "Copy fare_model.pkl from Week 4 into this folder.\n\n"
                         "      import joblib\n"
                         "      m = joblib.load('fare_model.pkl')\n"
                         "      pred = m.predict([[distance, duration, hour]])[0]\n"
                         "      st.metric('Predicted fare', f'${pred:.2f}')"),
            ]),
        day(5, "Add Q4 trend chart",
            "",
            [
                exercise("Trend",
                         "      import pandas as pd\n"
                         "      df = pd.read_parquet('data/q4_2023.parquet')\n"
                         "      df = df[df['pickup_borough'] == borough]\n"
                         "      daily = df.groupby(df['tpep_pickup_datetime'].dt.date).size()\n"
                         "      st.line_chart(daily, height=240)\n"
                         "      st.caption(f'Daily trips from {borough} in Q4 2023')"),
            ]),
        day(6, "Deploy to Streamlit Cloud",
            "",
            [
                reading("Streamlit Community Cloud",
                        "https://streamlit.io/cloud", "Free hosting."),
                exercise("Deploy",
                         "Trim q4_2023.parquet to a sample so it fits in GitHub (under 50MB):\n"
                         "      df.sample(500000).to_parquet('data/q4_sample.parquet')\n"
                         "Update explorer.py to load q4_sample.parquet.\n"
                         "Commit + push.\n"
                         "Sign up at Streamlit Cloud → New app → pick your repo → file: explorer.py → Deploy.\n"
                         "Get a *.streamlit.app URL."),
            ]),
        day(7, "Tag v0.5", "",
            [
                exercise("Acceptance v0.5",
                         "Update README with the live URL.\n"
                         "      git add . && git commit -m 'v0.5: Streamlit explorer'\n"
                         "      git tag v0.5 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Streamlit explorer live\n"
                         "  ☐ Sidebar filters work\n"
                         "  ☐ Predicted fare updates as you slide\n"
                         "  ☐ Daily trend chart per borough\n"
                         "  ☐ v0.5 tag"),
            ]),
    ],
    ["Streamlit sidebar widgets", "st.metric + st.line_chart", "Streamlit Cloud deploy", "Sampling large parquets for git limits"],
    ["Install Streamlit", "Build sidebar with 4 controls", "Wire the fare model into the UI", "Add Q4 daily trend chart per borough", "Deploy on Streamlit Cloud"],
    "TaxiPulse v0.5 — interactive explorer with sidebar controls, predicted fare, and per-borough Q4 trend chart. Live on Streamlit Cloud.",
    ["Add a heatmap of trips by hour × day-of-week", "Add a 'compare 2 boroughs' mode side-by-side", "Cache the parquet load with @st.cache_data"],
    ["Why @st.cache_data?", "Why does Streamlit re-run the whole script on every interaction?", "What's the size limit on a free Streamlit Cloud app?"],
    ["Live Streamlit URL", "v0.5 tag", "Updated README"],
)

# Week 6: TaxiPulse final polish + retro
DS_W6 = week(
    6, "TaxiPulse v1.0: Ship + retro", "Foundation", "10-15",
    "Last week of Project 1. Polish everything. Write a real retro. Get one stranger to read your notebook and report back.",
    [
        day(1, "What 'polish' means", "",
            [
                reflect("List the rough edges",
                        "Walk through your project. List 10 small things that are 'good enough' but could be better:\n  - Typos in README\n  - Charts without axis labels\n  - Cells that take too long to run\n  - Variables named df, df2, df3\n  - Cells with import statements halfway through")
            ]),
        day(2, "Fix half of them", "",
            [
                exercise("Polish pass 1",
                         "Pick the 5 most obvious. Fix them. Commit each as its own small commit (clean history)."),
            ]),
        day(3, "Add docstrings + comments", "",
            [
                exercise("Document the code",
                         "Every function in your notebooks: add a docstring saying what it does, what it returns.\n"
                         "Every non-obvious cell: 1-sentence markdown above explaining WHY."),
            ]),
        day(4, "Profile slow cells", "",
            [
                exercise("Speed it up",
                         "Find the slowest cell with %%time:\n"
                         "      %%time\n"
                         "      ...your code...\n\n"
                         "If anything takes > 30 seconds, find a way to make it faster (use parquet not csv, filter rows earlier, use vectorized pandas not Python loops)."),
            ]),
        day(5, "Show a stranger", "",
            [
                exercise("Get one reader",
                         "Send your final notebook GitHub URL to one person who knows nothing about NYC taxis. Ask: 'Can you read this and tell me ONE thing that confused you?' Note their answer."),
            ]),
        day(6, "Fix what confused them",
            "",
            [
                exercise("Apply feedback",
                         "Fix whatever the reader flagged. Real readers are gold."),
            ]),
        day(7, "Tag v1.0 + write the retro",
            "",
            [
                exercise("Retro + v1.0",
                         "Add RETRO.md to the repo:\n"
                         "      # TaxiPulse Retro\n"
                         "      ## What worked\n"
                         "      - ...\n"
                         "      ## What didn't\n"
                         "      - ...\n"
                         "      ## What I'd do differently\n"
                         "      - ...\n"
                         "      ## What I learned\n"
                         "      - ...\n\n"
                         "      git add . && git commit -m 'v1.0: ship Project 1'\n"
                         "      git tag v1.0 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ All cells have markdown context\n"
                         "  ☐ All functions have docstrings\n"
                         "  ☐ Slow cells profiled + fixed\n"
                         "  ☐ One stranger read the notebook + their feedback addressed\n"
                         "  ☐ RETRO.md committed\n"
                         "  ☐ v1.0 tag\n\n"
                         "PROJECT 1 DONE. Next week: Project 2 — Reddit Sentiment."),
            ]),
    ],
    ["Polishing notebooks for portfolio", "Docstrings", "Profiling with %%time", "Soliciting + applying outside feedback", "Writing a retrospective"],
    ["List 10 rough edges in your project", "Fix at least 5 of them", "Add docstrings + markdown context", "Profile + speed up slow cells", "Get one stranger to read + give feedback", "Write RETRO.md"],
    "TaxiPulse v1.0 — Project 1 fully polished. Notebook reads like an article. Stranger-tested. Real retro committed.",
    ["Add a single 'How I made this' blog post (Medium / Dev.to) linking the repo", "Make a 3-minute screen recording walking through the analysis", "Add a profile photo + bio to the notebook header"],
    ["What's the difference between 'done' and 'shippable'?", "Why is outside feedback worth more than self-review?", "What's the smallest unit of 'polish' that moves the needle?"],
    ["v1.0 tag — PROJECT 1 COMPLETE", "RETRO.md", "Cleaner repo", "One stranger's verified feedback"],
)


# Week 7: Start Project 2 — Reddit Sentiment Analysis
DS_W7 = week(
    7, "Project 2 — Reddit Sentiment v0.1", "NLP", "15-20",
    "New project. You'll build a sentiment classifier that reads Reddit posts and labels them positive / negative / neutral. Specific subreddit: r/MachineLearning. By W12 it'll be deployed and live.",
    [
        day(1, "What is sentiment analysis?",
            "",
            [
                video("Sentiment analysis explained (10 min)",
                      search("sentiment analysis nlp beginner explained"),
                      10, "various"),
                reflect("Why r/MachineLearning?",
                        "Why this subreddit?\n  - Real text, technical vocabulary\n  - Mixed tone (snark + excitement + frustration)\n  - We can scrape it free + legally\n  - 4M subscribers — real signal"),
            ]),
        day(2, "Set up the project",
            "",
            [
                exercise("New repo",
                         "      cd Desktop\n"
                         "      mkdir reddit-sentiment\n"
                         "      cd reddit-sentiment\n"
                         "      conda create -n sentiment python=3.11 pandas requests jupyter -y\n"
                         "      conda activate sentiment\n"
                         "      pip install praw transformers torch\n\n"
                         "Create GitHub repo `reddit-sentiment` (public). git init + push."),
            ]),
        day(3, "Get Reddit API credentials",
            "",
            [
                reading("Reddit — create app",
                        "https://www.reddit.com/prefs/apps",
                        "Click 'Open' → scroll down → 'Create app' → choose 'script' → name it 'forge-sentiment' → note client_id + secret."),
                exercise("PRAW setup",
                         "Create .env:\n"
                         "      REDDIT_CLIENT_ID=...\n"
                         "      REDDIT_SECRET=...\n"
                         "      REDDIT_USER_AGENT=forge-sentiment by /u/yourname\n\n"
                         "Test in scrape.py:\n"
                         "      import praw, os\n"
                         "      from dotenv import load_dotenv\n"
                         "      load_dotenv()\n"
                         "      r = praw.Reddit(client_id=os.getenv('REDDIT_CLIENT_ID'),\n"
                         "                      client_secret=os.getenv('REDDIT_SECRET'),\n"
                         "                      user_agent=os.getenv('REDDIT_USER_AGENT'))\n"
                         "      for s in r.subreddit('MachineLearning').hot(limit=5):\n"
                         "          print(s.title)\n\n"
                         "YOU SHOULD SEE: 5 post titles."),
            ]),
        day(4, "Scrape 1000 posts",
            "",
            [
                exercise("Bulk scrape",
                         "Update scrape.py:\n"
                         "      import praw, os, csv\n"
                         "      from dotenv import load_dotenv\n"
                         "      load_dotenv()\n"
                         "      r = praw.Reddit(...)\n"
                         "      rows = []\n"
                         "      for s in r.subreddit('MachineLearning').new(limit=1000):\n"
                         "          rows.append({\n"
                         "              'id': s.id, 'title': s.title, 'selftext': s.selftext,\n"
                         "              'score': s.score, 'num_comments': s.num_comments,\n"
                         "              'created_utc': s.created_utc\n"
                         "          })\n"
                         "      with open('data/posts.csv','w',newline='',encoding='utf-8') as f:\n"
                         "          w = csv.DictWriter(f, fieldnames=rows[0].keys())\n"
                         "          w.writeheader(); w.writerows(rows)\n"
                         "      print(f'Saved {len(rows)} posts')\n\n"
                         "Run: python scrape.py. Takes ~3 minutes."),
            ]),
        day(5, "Use a pretrained sentiment model",
            "",
            [
                exercise("Hugging Face zero-shot",
                         "Create label.py:\n"
                         "      from transformers import pipeline\n"
                         "      import pandas as pd\n"
                         "      df = pd.read_csv('data/posts.csv')\n"
                         "      classifier = pipeline('sentiment-analysis', model='distilbert-base-uncased-finetuned-sst-2-english')\n"
                         "      texts = df['title'].fillna('').tolist()[:100]\n"
                         "      results = classifier(texts)\n"
                         "      for t, r in zip(texts[:5], results[:5]):\n"
                         "          print(f'{r[\"label\"]} ({r[\"score\"]:.2f}): {t}')\n\n"
                         "First run downloads the model (~250MB)."),
            ]),
        day(6, "Score all 1000",
            "",
            [
                exercise("Full pipeline",
                         "Apply to all 1000:\n"
                         "      results = classifier(df['title'].fillna('').tolist(), batch_size=16)\n"
                         "      df['sentiment'] = [r['label'] for r in results]\n"
                         "      df['confidence'] = [r['score'] for r in results]\n"
                         "      df.to_csv('data/labeled.csv', index=False)\n"
                         "      print(df['sentiment'].value_counts())"),
            ]),
        day(7, "Tag v0.1",
            "",
            [
                exercise("Acceptance v0.1",
                         "Make .gitignore exclude data/, .env. Write a short README.\n"
                         "      git add . && git commit -m 'reddit-sentiment v0.1: scrape + label 1000 posts'\n"
                         "      git tag v0.1 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ PRAW credentials configured (key not committed)\n"
                         "  ☐ scrape.py pulls 1000 posts to data/posts.csv\n"
                         "  ☐ label.py applies pretrained sentiment\n"
                         "  ☐ data/labeled.csv contains sentiment + confidence\n"
                         "  ☐ v0.1 tag"),
            ]),
    ],
    ["Reddit API via PRAW", "Storing secrets in .env", "Hugging Face pipeline API", "Pretrained sentiment models (DistilBERT)", "Batch inference"],
    ["Create reddit-sentiment repo", "Get Reddit API credentials", "Scrape 1000 r/MachineLearning posts", "Label them with a pretrained model", "Save labeled.csv"],
    "Reddit Sentiment v0.1 — 1000 r/MachineLearning posts scraped and sentiment-labelled with a pretrained Hugging Face model.",
    ["Also scrape comments (top 5 per post)", "Try a different subreddit", "Compare sentiment distribution between r/ML and r/learnmachinelearning"],
    ["Why use a pretrained model first instead of training your own?", "What's a 'zero-shot' classifier?", "How does Reddit's rate limit affect scraping?"],
    ["v0.1 tag", "data/labeled.csv with 1000 labelled posts", "scrape.py + label.py committed"],
)

# Week 8: NLP basics + custom features
DS_W8 = week(
    8, "Reddit Sentiment v0.2: Hand-label + classical ML", "NLP", "12-18",
    "The pretrained model is OK. But it's general-purpose. This week we build a custom classical ML baseline trained on YOUR hand-labels for THIS subreddit.",
    [
        day(1, "Why hand-label",
            "",
            [
                reflect("Disagreement points",
                        "Look at 20 random posts where the pretrained model disagreed with what you'd say. Note: in technical subreddits, 'this is broken' might be a complaint OR neutral technical fact."),
            ]),
        day(2, "Hand-label 200",
            "",
            [
                exercise("Build your gold set",
                         "Open data/labeled.csv in Excel/Sheets. Sample 200 random rows. Add a column 'true_label' and fill it yourself with POSITIVE / NEGATIVE / NEUTRAL.\n\n"
                         "Save as data/gold.csv."),
            ]),
        day(3, "Bag-of-words + LogReg",
            "",
            [
                exercise("Classical baseline",
                         "In 01-baseline.ipynb:\n"
                         "      import pandas as pd\n"
                         "      from sklearn.feature_extraction.text import TfidfVectorizer\n"
                         "      from sklearn.linear_model import LogisticRegression\n"
                         "      from sklearn.model_selection import train_test_split\n"
                         "      from sklearn.metrics import classification_report\n"
                         "      df = pd.read_csv('data/gold.csv')\n"
                         "      X = TfidfVectorizer(max_features=2000, ngram_range=(1,2)).fit_transform(df['title'])\n"
                         "      y = df['true_label']\n"
                         "      Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42)\n"
                         "      m = LogisticRegression(max_iter=1000)\n"
                         "      m.fit(Xtr, ytr)\n"
                         "      print(classification_report(yte, m.predict(Xte)))"),
            ]),
        day(4, "Inspect what the model learned",
            "",
            [
                exercise("Top features per class",
                         "      vec = TfidfVectorizer(max_features=2000, ngram_range=(1,2))\n"
                         "      X = vec.fit_transform(df['title'])\n"
                         "      m = LogisticRegression(max_iter=1000).fit(X, y)\n"
                         "      import numpy as np\n"
                         "      feats = vec.get_feature_names_out()\n"
                         "      for i, c in enumerate(m.classes_):\n"
                         "          top = np.argsort(m.coef_[i])[-10:]\n"
                         "          print(c, [feats[j] for j in top])\n\n"
                         "Look at the words. Surprising?"),
            ]),
        day(5, "Compare baseline vs pretrained",
            "",
            [
                exercise("Side-by-side",
                         "On the same gold test set, run BOTH:\n  - Your TFIDF + LogReg\n  - The Week 7 pretrained sentiment pipeline\nReport accuracy + F1 for each. Which wins on YOUR data?"),
            ]),
        day(6, "Save the baseline",
            "",
            [
                exercise("Persist",
                         "      import joblib\n"
                         "      joblib.dump(m, 'models/baseline.pkl')\n"
                         "      joblib.dump(vec, 'models/vectorizer.pkl')"),
            ]),
        day(7, "Tag v0.2", "",
            [
                exercise("Acceptance v0.2",
                         "      git add . && git commit -m 'v0.2: hand-labeled gold + TFIDF baseline'\n"
                         "      git tag v0.2 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ 200 hand-labeled gold rows\n"
                         "  ☐ TFIDF + LogReg baseline trained\n"
                         "  ☐ Comparison vs pretrained in README\n"
                         "  ☐ baseline.pkl + vectorizer.pkl committed\n"
                         "  ☐ v0.2 tag"),
            ]),
    ],
    ["Hand-labelling a gold set", "TF-IDF vectorization", "n-gram features", "Logistic regression for text", "Feature importance for linear text models", "Comparing classical vs pretrained models"],
    ["Hand-label 200 posts as gold set", "Vectorize with TFIDF + 1-2 grams", "Train LogisticRegression baseline", "Inspect top features per class", "Compare against pretrained on same test set"],
    "Reddit Sentiment v0.2 — hand-labeled gold set + classical baseline (TFIDF + LogReg). Honest accuracy comparison against pretrained.",
    ["Add subreddit and score as features (not just title)", "Try Naive Bayes alongside LogReg", "Plot a confusion matrix"],
    ["Why hand-label instead of trusting the pretrained model?", "What does ngram_range=(1,2) mean?", "Why is TFIDF better than raw word counts?"],
    ["models/baseline.pkl + vectorizer.pkl", "Hand-labeled gold.csv", "v0.2 tag"],
)

# Week 9: Fine-tune a transformer
DS_W9 = week(
    9, "Reddit Sentiment v0.3: Fine-tune DistilBERT", "NLP", "15-20",
    "This week we fine-tune a real transformer on your gold set. Goes beyond classical ML.",
    [
        day(1, "What is fine-tuning?",
            "",
            [
                video("Fine-tuning explained (15 min)",
                      search("fine tuning transformer beginner huggingface"),
                      15, "various"),
                reflect("Compute cost",
                        "Fine-tuning needs a GPU. Free options: Google Colab. Plan for ~30 min of GPU time."),
            ]),
        day(2, "Move to Colab",
            "",
            [
                reading("Google Colab",
                        "https://colab.research.google.com",
                        "Click 'Open' → New notebook. Free tier gives you a T4 GPU."),
                exercise("Set up Colab",
                         "In Colab: Runtime → Change runtime type → T4 GPU.\n"
                         "Upload your data/gold.csv via the files panel.\n"
                         "First cell: !pip install transformers datasets accelerate -q"),
            ]),
        day(3, "Prepare data",
            "",
            [
                exercise("Tokenize",
                         "      import pandas as pd\n"
                         "      from datasets import Dataset\n"
                         "      from transformers import AutoTokenizer\n"
                         "      df = pd.read_csv('gold.csv')\n"
                         "      df['label'] = df['true_label'].map({'NEGATIVE':0,'NEUTRAL':1,'POSITIVE':2})\n"
                         "      ds = Dataset.from_pandas(df[['title','label']]).train_test_split(test_size=0.2)\n"
                         "      tok = AutoTokenizer.from_pretrained('distilbert-base-uncased')\n"
                         "      def tokenize(b): return tok(b['title'], padding='max_length', truncation=True, max_length=128)\n"
                         "      ds = ds.map(tokenize, batched=True)"),
            ]),
        day(4, "Fine-tune",
            "",
            [
                exercise("Train",
                         "      from transformers import AutoModelForSequenceClassification, TrainingArguments, Trainer\n"
                         "      model = AutoModelForSequenceClassification.from_pretrained('distilbert-base-uncased', num_labels=3)\n"
                         "      args = TrainingArguments(output_dir='out', num_train_epochs=3, per_device_train_batch_size=16, learning_rate=2e-5, eval_strategy='epoch')\n"
                         "      trainer = Trainer(model=model, args=args, train_dataset=ds['train'], eval_dataset=ds['test'])\n"
                         "      trainer.train()\n\n"
                         "Takes ~10-20 minutes on T4."),
            ]),
        day(5, "Evaluate",
            "",
            [
                exercise("Compare to baseline",
                         "      preds = trainer.predict(ds['test'])\n"
                         "      import numpy as np\n"
                         "      from sklearn.metrics import classification_report\n"
                         "      y_pred = np.argmax(preds.predictions, axis=1)\n"
                         "      print(classification_report(preds.label_ids, y_pred, target_names=['NEG','NEU','POS']))\n\n"
                         "Beat the TFIDF baseline?"),
            ]),
        day(6, "Save + download model",
            "",
            [
                exercise("Persist",
                         "      trainer.save_model('reddit-sentiment-distilbert')\n"
                         "      !zip -r model.zip reddit-sentiment-distilbert\n"
                         "Download model.zip from Colab. Unzip into your local repo at models/distilbert/.\n"
                         "WARNING: ~250MB. Use Git LFS:\n"
                         "      git lfs install\n"
                         "      git lfs track 'models/distilbert/*'\n"
                         "      git add .gitattributes models/\n"
                         "      git commit -m 'add fine-tuned model via LFS'"),
            ]),
        day(7, "Tag v0.3", "",
            [
                exercise("Acceptance v0.3",
                         "      git push\n"
                         "      git tag v0.3 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Fine-tuned in Colab on T4\n"
                         "  ☐ Beats TFIDF baseline on same test\n"
                         "  ☐ Model saved + downloaded\n"
                         "  ☐ Stored in repo via Git LFS\n"
                         "  ☐ v0.3 tag"),
            ]),
    ],
    ["Fine-tuning transformers", "Hugging Face datasets library", "Google Colab GPU usage", "Trainer API basics", "Git LFS for large model files"],
    ["Move work to Colab T4", "Tokenize gold set", "Fine-tune DistilBERT 3 epochs", "Beat TFIDF baseline", "Save + commit model via Git LFS"],
    "Reddit Sentiment v0.3 — fine-tuned DistilBERT on your hand-labeled set. Outperforms classical baseline. Stored via Git LFS.",
    ["Try a smaller model like ALBERT for faster inference", "Add a learning-rate sweep with 3 different lr values", "Plot training loss + eval accuracy over epochs"],
    ["Why does fine-tuning beat zero-shot on domain-specific text?", "What's the trade-off of more epochs?", "Why use max_length=128 instead of 512?"],
    ["Fine-tuned model committed", "v0.3 tag", "Eval results in README"],
)

# Week 10: Inference + dashboard
DS_W10 = week(
    10, "Reddit Sentiment v0.4: Live dashboard", "NLP", "12-18",
    "Build a Streamlit dashboard that scrapes r/MachineLearning live and shows current sentiment.",
    [
        day(1, "Plan it",
            "",
            [
                reflect("Dashboard sketch",
                         "What does the dashboard show?\n  - 'Refresh' button → scrape latest 50 posts\n  - Pie chart: sentiment breakdown\n  - List: most negative posts (warnings)\n  - List: most positive (good news)\n  - Time series of last 7 days if cached"),
            ]),
        day(2, "Inference function",
            "",
            [
                exercise("predict.py",
                         "      import torch\n"
                         "      from transformers import AutoTokenizer, AutoModelForSequenceClassification\n"
                         "      MODEL = 'models/distilbert'\n"
                         "      tok = AutoTokenizer.from_pretrained(MODEL)\n"
                         "      model = AutoModelForSequenceClassification.from_pretrained(MODEL)\n"
                         "      LABELS = ['NEGATIVE','NEUTRAL','POSITIVE']\n"
                         "      def predict(texts):\n"
                         "          inputs = tok(texts, padding=True, truncation=True, max_length=128, return_tensors='pt')\n"
                         "          with torch.no_grad():\n"
                         "              outputs = model(**inputs)\n"
                         "          probs = torch.softmax(outputs.logits, dim=-1)\n"
                         "          preds = probs.argmax(dim=-1)\n"
                         "          return [(LABELS[p], probs[i, p].item()) for i, p in enumerate(preds)]"),
            ]),
        day(3, "Streamlit dashboard skeleton",
            "",
            [
                exercise("dash.py",
                         "      import streamlit as st\n"
                         "      from scrape import fetch_latest  # extract scraping logic into a function\n"
                         "      from predict import predict\n"
                         "      st.title('r/ML Sentiment — Live')\n"
                         "      if st.button('Refresh'):\n"
                         "          with st.spinner('Scraping + scoring...'):\n"
                         "              posts = fetch_latest(50)\n"
                         "              labels = predict([p['title'] for p in posts])\n"
                         "              for (lab, conf), p in zip(labels, posts):\n"
                         "                  p['sentiment'] = lab; p['confidence'] = conf\n"
                         "              st.session_state['posts'] = posts"),
            ]),
        day(4, "Add charts",
            "",
            [
                exercise("Visualize sentiment",
                         "      posts = st.session_state.get('posts', [])\n"
                         "      if posts:\n"
                         "          import pandas as pd\n"
                         "          df = pd.DataFrame(posts)\n"
                         "          counts = df['sentiment'].value_counts()\n"
                         "          st.bar_chart(counts)\n"
                         "          \n"
                         "          col1, col2 = st.columns(2)\n"
                         "          with col1:\n"
                         "              st.subheader('Most negative')\n"
                         "              for _, r in df[df['sentiment']=='NEGATIVE'].nlargest(5,'confidence').iterrows():\n"
                         "                  st.write(r['title'])\n"
                         "          with col2:\n"
                         "              st.subheader('Most positive')\n"
                         "              for _, r in df[df['sentiment']=='POSITIVE'].nlargest(5,'confidence').iterrows():\n"
                         "                  st.write(r['title'])"),
            ]),
        day(5, "Cache + history",
            "",
            [
                exercise("Save snapshots",
                         "Save each refresh as a row in history.csv with timestamp + counts. Show a line chart of negative-count over time."),
            ]),
        day(6, "Deploy",
            "",
            [
                exercise("Deploy on Streamlit Cloud",
                         "Add the model files via Git LFS to a fresh push.\n"
                         "Add Reddit secrets to Streamlit Cloud secrets manager.\n"
                         "Deploy. Note: Streamlit Cloud has a 1GB RAM limit; if DistilBERT is too heavy, fall back to scikit baseline."),
            ]),
        day(7, "Tag v0.4", "",
            [
                exercise("Acceptance v0.4",
                         "      git tag v0.4 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Dashboard scrapes + scores live\n"
                         "  ☐ Bar chart + most pos/neg lists\n"
                         "  ☐ History chart\n"
                         "  ☐ Live URL works\n"
                         "  ☐ v0.4 tag"),
            ]),
    ],
    ["PyTorch inference from a saved transformer", "Streamlit columns + session_state", "Caching API calls", "Time-series snapshots in a CSV"],
    ["Write a predict() function for inference", "Build a Streamlit dashboard with refresh button", "Add sentiment bar chart + most positive/negative lists", "Save history snapshots", "Deploy live"],
    "Reddit Sentiment v0.4 — live dashboard. One click pulls latest 50 posts, scores them with your fine-tuned model, shows sentiment distribution + the most strongly opinionated posts.",
    ["Add a sentiment-by-hour heatmap of the past day", "Subreddit picker (compare 3 subs)", "Add sound alert when negativity spikes above a threshold"],
    ["Why @st.cache_resource for the model?", "Where does the bottleneck sit — scraping or inference?", "What's the trade-off of running inference in Streamlit vs a separate worker?"],
    ["Live dashboard URL", "v0.4 tag", "history.csv tracked"],
)

# Week 11: API + Docker
DS_W11 = week(
    11, "Reddit Sentiment v0.5: REST API + Docker", "Production", "12-18",
    "Separate the inference from the UI. Wrap the model in a FastAPI server, dockerize it, deploy.",
    [
        day(1, "Why split the stack",
            "",
            [
                reflect("Architecture",
                         "Reasons to separate API from UI:\n  - Model heavy → wants its own machine\n  - UI lightweight → cheap hosting\n  - API reusable by other clients"),
            ]),
        day(2, "FastAPI hello",
            "",
            [
                exercise("FastAPI",
                         "      pip install fastapi uvicorn\n\n"
                         "Create api.py:\n"
                         "      from fastapi import FastAPI\n"
                         "      from pydantic import BaseModel\n"
                         "      from predict import predict\n"
                         "      app = FastAPI()\n"
                         "      class Req(BaseModel):\n"
                         "          texts: list[str]\n"
                         "      @app.post('/predict')\n"
                         "      def p(req: Req):\n"
                         "          out = predict(req.texts)\n"
                         "          return {'predictions': [{'label':l, 'confidence':c} for l,c in out]}\n"
                         "      @app.get('/health')\n"
                         "      def health(): return {'ok': True}\n\n"
                         "Run: uvicorn api:app --reload"),
            ]),
        day(3, "Test",
            "",
            [
                exercise("Curl",
                         "      curl -X POST localhost:8000/predict -H 'Content-Type: application/json' -d '{\"texts\":[\"This paper is amazing\",\"Reproducibility is broken again\"]}'"),
            ]),
        day(4, "Dockerfile",
            "",
            [
                exercise("Package it",
                         "Create Dockerfile:\n"
                         "      FROM python:3.11-slim\n"
                         "      WORKDIR /app\n"
                         "      COPY requirements.txt .\n"
                         "      RUN pip install -r requirements.txt\n"
                         "      COPY api.py predict.py models/ ./\n"
                         "      EXPOSE 8000\n"
                         "      CMD [\"uvicorn\", \"api:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]\n\n"
                         "Build:\n"
                         "      docker build -t reddit-sentiment-api .\n"
                         "      docker run -p 8000:8000 reddit-sentiment-api"),
            ]),
        day(5, "Deploy to Hugging Face Spaces",
            "",
            [
                reading("Hugging Face Spaces",
                        "https://huggingface.co/new-space",
                        "Click 'Open'. Free GPU CPU hosting for model APIs."),
                exercise("Deploy",
                         "Create a Space with Docker SDK. Push your Dockerfile + code. Get a URL like reddit-sentiment-api.hf.space"),
            ]),
        day(6, "Point Streamlit at the API",
            "",
            [
                exercise("Slim the dashboard",
                         "Remove model loading from Streamlit. Replace predict() with a requests call:\n"
                         "      import requests\n"
                         "      r = requests.post(API_URL + '/predict', json={'texts': titles})\n"
                         "      results = r.json()['predictions']\n\n"
                         "Re-deploy Streamlit — it's now lightweight."),
            ]),
        day(7, "Tag v0.5", "",
            [
                exercise("Acceptance v0.5",
                         "      git tag v0.5 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ FastAPI app works locally\n"
                         "  ☐ Dockerfile builds\n"
                         "  ☐ Live API endpoint on HF Spaces or Render\n"
                         "  ☐ Streamlit calls the API\n"
                         "  ☐ v0.5 tag"),
            ]),
    ],
    ["FastAPI basics", "Pydantic request validation", "Dockerfile for ML services", "Hugging Face Spaces deployment", "Splitting frontend and backend"],
    ["Build FastAPI /predict endpoint", "Dockerize it", "Deploy to HF Spaces", "Update Streamlit to call the API"],
    "Reddit Sentiment v0.5 — production split. FastAPI + Docker on Hugging Face Spaces. Streamlit talks to it via HTTP.",
    ["Add JWT auth on the API", "Add rate limiting (slowapi)", "Add a /batch endpoint that takes 1000 texts efficiently"],
    ["Why FastAPI over Flask for ML?", "What does the Docker layer order matter for?", "What's the cold-start cost on HF Spaces?"],
    ["Live API URL", "Docker image", "v0.5 tag"],
)

# Week 12: Ship Project 2 + retro
DS_W12 = week(
    12, "Reddit Sentiment v1.0: Ship + retro", "Production", "10-15",
    "Polish, write the readme, write a blog post about what you built. Project 2 complete.",
    [
        day(1, "What's left", "",
            [
                reflect("Final list",
                         "List every rough edge. Pick the top 5."),
            ]),
        day(2, "Fix them", "",
            [exercise("Polish", "Same as TaxiPulse Week 6 — fix the rough edges, polish notebooks, clean READMEs.")]),
        day(3, "Write a blog post", "",
            [
                reading("dev.to — write a post",
                        "https://dev.to/new",
                        "Free blog platform. Click 'Open' to write."),
                exercise("Write the post",
                         "Title: 'How I built a live Reddit sentiment dashboard with a fine-tuned DistilBERT'.\n"
                         "Sections: problem, data, classical baseline, fine-tuning, dashboard, deployment, lessons.\n"
                         "Word count: 1000-1500. Include a screenshot.\n"
                         "Publish on dev.to."),
            ]),
        day(4, "Add a demo video", "",
            [
                exercise("Screen recording",
                         "Record a 90-second walkthrough of the live dashboard. Upload to YouTube unlisted. Embed in README."),
            ]),
        day(5, "Get 3 readers", "",
            [
                exercise("External feedback",
                         "Send the blog post + repo URL to 3 people. Ask: 'Where did I lose you?' Note answers."),
            ]),
        day(6, "Address feedback", "",
            [exercise("Fix it", "Apply the 3 readers' feedback to the post + README.")]),
        day(7, "Tag v1.0 + retro", "",
            [
                exercise("Project 2 complete",
                         "Write RETRO.md (same shape as TaxiPulse's).\n"
                         "      git tag v1.0 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Dev.to post published\n"
                         "  ☐ Demo video on YouTube\n"
                         "  ☐ 3 readers' feedback applied\n"
                         "  ☐ RETRO.md committed\n"
                         "  ☐ v1.0 tag\n\n"
                         "PROJECT 2 DONE. Next: Project 3 — Time Series Forecasting."),
            ]),
    ],
    ["Writing a project blog post", "Recording demo videos", "Feedback cycles", "Polishing for portfolio"],
    ["Polish project", "Write 1000-1500 word blog post", "Record + upload demo video", "Get 3 readers + apply feedback", "Write retro"],
    "Reddit Sentiment v1.0 — Project 2 complete. Published blog post. Demo video. Stranger-verified.",
    ["Cross-post on Medium", "Submit to a r/MachineLearning weekly thread for feedback", "Add a 'cite as' BibTeX snippet to the README"],
    ["What makes a portfolio piece beat a coding-bootcamp project?", "Why post about it publicly?", "What feedback are you most afraid of?"],
    ["Blog post URL", "Demo video URL", "v1.0 tag", "PROJECT 2 COMPLETE"],
)


# Week 13: Start Project 3 — Time Series Forecasting (electricity demand)
DS_W13 = week(
    13, "Project 3 — Energy Forecast v0.1", "Time Series", "15-20",
    "New project: forecast hourly electricity demand. Dataset: AEP_hourly.csv from PJM Interconnection — a real US power grid operator. 10 years of hourly data. Goal by W17: predict next 24h.",
    [
        day(1, "Why time series matters",
            "",
            [
                video("Time series forecasting in 10 min",
                      search("time series forecasting beginner 10 minutes"),
                      10, "various"),
                reflect("Mental model",
                        "Time series has 3 things classical regression doesn't:\n  1. Order matters (yesterday → today)\n  2. Seasonality (winter vs summer demand)\n  3. Autocorrelation (today is like yesterday)"),
            ]),
        day(2, "Get the dataset",
            "",
            [
                reading("PJM Energy Consumption — Kaggle",
                        "https://www.kaggle.com/datasets/robikscube/hourly-energy-consumption",
                        "Click 'Open' → download AEP_hourly.csv. ~120K rows, ~3MB."),
                exercise("New repo",
                         "      cd Desktop\n"
                         "      mkdir energy-forecast\n"
                         "      cd energy-forecast\n"
                         "      conda create -n energy python=3.11 pandas numpy matplotlib statsmodels prophet -y\n"
                         "      conda activate energy\n"
                         "Save AEP_hourly.csv in data/."),
            ]),
        day(3, "Load + plot",
            "",
            [
                exercise("First look",
                         "In 01-explore.ipynb:\n"
                         "      import pandas as pd, matplotlib.pyplot as plt\n"
                         "      df = pd.read_csv('data/AEP_hourly.csv', parse_dates=['Datetime'], index_col='Datetime').sort_index()\n"
                         "      print(df.shape, df.index.min(), df.index.max())\n"
                         "      df['AEP_MW'].plot(figsize=(14,4), title='AEP hourly demand (MW)')\n"
                         "      plt.savefig('figures/full_series.png')\n\n"
                         "Notice the yearly seasonality."),
            ]),
        day(4, "Decompose",
            "",
            [
                exercise("Trend / seasonal / residual",
                         "      from statsmodels.tsa.seasonal import seasonal_decompose\n"
                         "      # Resample to daily to make decomp tractable\n"
                         "      daily = df['AEP_MW'].resample('D').mean()\n"
                         "      decomp = seasonal_decompose(daily.dropna(), period=365)\n"
                         "      fig = decomp.plot(); fig.set_size_inches(12,8)\n"
                         "      plt.savefig('figures/decomp.png')"),
            ]),
        day(5, "Hourly + weekly patterns",
            "",
            [
                exercise("Multi-seasonal",
                         "      df['hour'] = df.index.hour\n"
                         "      df['dow'] = df.index.dayofweek\n"
                         "      pivot = df.pivot_table('AEP_MW', index='hour', columns='dow', aggfunc='mean')\n"
                         "      import seaborn as sns\n"
                         "      sns.heatmap(pivot, cmap='YlOrRd'); plt.savefig('figures/hour_dow.png')"),
            ]),
        day(6, "Split + persistence baseline",
            "",
            [
                exercise("'Tomorrow == yesterday'",
                         "Hold out last 30 days as test.\n"
                         "Baseline forecast: y_pred(t) = y(t-24).\n"
                         "      from sklearn.metrics import mean_absolute_error\n"
                         "      test = df.last('30D')['AEP_MW']\n"
                         "      pred = df.shift(24).last('30D')['AEP_MW']\n"
                         "      print('MAE baseline:', mean_absolute_error(test, pred))"),
            ]),
        day(7, "Tag v0.1", "",
            [
                exercise("Acceptance v0.1",
                         "Push the repo. Tag v0.1.\n\n"
                         "PASS:\n"
                         "  ☐ Data loaded\n"
                         "  ☐ Full series chart\n"
                         "  ☐ STL decomposition saved\n"
                         "  ☐ Hour×DOW heatmap\n"
                         "  ☐ Persistence baseline MAE recorded\n"
                         "  ☐ v0.1 tag"),
            ]),
    ],
    ["Time series core concepts: trend / seasonality / autocorrelation", "Pandas DatetimeIndex + resample", "STL decomposition", "Hour × day-of-week heatmaps", "Train/test split for time series (held-out tail)", "Persistence baseline"],
    ["Get AEP_hourly.csv from Kaggle", "Set up energy-forecast repo", "Plot the full 10-year series", "Decompose into trend/seasonal/residual", "Build hour × DOW heatmap", "Compute persistence baseline MAE"],
    "Energy Forecast v0.1 — exploratory analysis of AEP hourly demand. Persistence baseline as benchmark for upcoming models.",
    ["Try the COMED, DUQ, or PJM_East series alongside AEP", "Plot just summer 2023 vs winter 2023 to see seasonality", "Compute the autocorrelation function (acf) plot"],
    ["Why does time-series train/test split need to keep the tail held out?", "What's 'persistence' and why is it the right baseline?", "Why is decomposition useful before modelling?"],
    ["v0.1 tag", "5 figures in figures/", "Baseline MAE in README"],
)

# Week 14: ARIMA
DS_W14 = week(
    14, "Energy Forecast v0.2: ARIMA model", "Time Series", "12-18",
    "Classical time series model. Today: ARIMA — the workhorse of forecasting before deep learning.",
    [
        day(1, "What is ARIMA",
            "",
            [
                video("ARIMA explained simply (15 min)",
                      search("arima time series forecasting beginner"),
                      15, "various"),
                reflect("Three knobs",
                        "ARIMA(p,d,q):\n  p = AR (auto-regressive lag)\n  d = differencing (to remove trend)\n  q = MA (moving average of errors)\nGuess (p,d,q) for a strongly seasonal hourly demand series."),
            ]),
        day(2, "Stationarity check",
            "",
            [
                exercise("ADF test",
                         "      from statsmodels.tsa.stattools import adfuller\n"
                         "      daily = df['AEP_MW'].resample('D').mean()\n"
                         "      print(adfuller(daily.dropna()))\n"
                         "      # p-value > 0.05 → not stationary → need differencing\n"
                         "      diff = daily.diff().dropna()\n"
                         "      print(adfuller(diff))"),
            ]),
        day(3, "Fit auto-ARIMA",
            "",
            [
                exercise("pmdarima",
                         "      pip install pmdarima\n"
                         "      from pmdarima import auto_arima\n"
                         "      train = daily[:-30]\n"
                         "      test = daily[-30:]\n"
                         "      model = auto_arima(train, seasonal=True, m=7, stepwise=True, suppress_warnings=True)\n"
                         "      print(model.summary())\n\n"
                         "Takes ~5 min."),
            ]),
        day(4, "Forecast + evaluate",
            "",
            [
                exercise("30-day forecast",
                         "      preds = model.predict(n_periods=30)\n"
                         "      from sklearn.metrics import mean_absolute_error\n"
                         "      print('ARIMA MAE:', mean_absolute_error(test, preds))\n"
                         "      ax = train[-90:].plot(label='Train')\n"
                         "      test.plot(ax=ax, label='Actual')\n"
                         "      pd.Series(preds, index=test.index).plot(ax=ax, label='ARIMA')\n"
                         "      plt.legend(); plt.savefig('figures/arima_forecast.png')"),
            ]),
        day(5, "Add confidence intervals",
            "",
            [
                exercise("CI",
                         "      preds, conf = model.predict(n_periods=30, return_conf_int=True)\n"
                         "      plt.fill_between(test.index, conf[:,0], conf[:,1], alpha=0.2)"),
            ]),
        day(6, "Compare to baseline",
            "",
            [
                exercise("Side-by-side",
                         "Make a table in README:\n"
                         "  | Model | MAE on last 30 days |\n"
                         "  | Persistence | X |\n"
                         "  | ARIMA | Y |\n"
                         "  | Improvement | Z% |"),
            ]),
        day(7, "Tag v0.2", "",
            [
                exercise("Acceptance v0.2",
                         "Save model: model.save('arima.pkl'). Tag v0.2.\n\n"
                         "PASS:\n"
                         "  ☐ ADF stationarity test run\n"
                         "  ☐ auto_arima fit\n"
                         "  ☐ ARIMA forecast MAE recorded\n"
                         "  ☐ Forecast chart with CI\n"
                         "  ☐ v0.2 tag"),
            ]),
    ],
    ["Stationarity + ADF test", "Differencing for trend removal", "Auto-ARIMA + seasonal m parameter", "Forecast intervals (CI)", "Comparing classical baselines"],
    ["Run ADF stationarity test", "Difference until stationary", "Fit auto_arima on daily data", "Forecast 30 days + compute MAE", "Plot forecast with CI"],
    "Energy Forecast v0.2 — ARIMA model fitted on daily series. Beats persistence baseline. Confidence intervals on the forecast.",
    ["Try SARIMAX with weekly + yearly seasonality", "Use AICc to compare model orders", "Forecast on hourly directly (computationally expensive — careful)"],
    ["What's the difference between AR and MA terms?", "When does differencing too many times hurt?", "Why limit ARIMA to daily not hourly here?"],
    ["arima.pkl saved", "MAE comparison table", "v0.2 tag"],
)

# Week 15: Prophet
DS_W15 = week(
    15, "Energy Forecast v0.3: Prophet model", "Time Series", "10-15",
    "Facebook's Prophet handles multiple seasonalities + holidays out of the box. This week we apply it.",
    [
        day(1, "What is Prophet",
            "",
            [
                video("Facebook Prophet in 10 min",
                      search("facebook prophet time series tutorial"),
                      10, "various"),
                reading("Prophet docs",
                        "https://facebook.github.io/prophet/", ""),
                reflect("When to use it",
                        "Prophet shines when: multiple seasonalities, missing data, holidays matter. Why are these all true for power demand?"),
            ]),
        day(2, "Install + format data",
            "",
            [
                exercise("Prophet format",
                         "Prophet needs columns named 'ds' (date) and 'y' (value).\n"
                         "      from prophet import Prophet\n"
                         "      daily = df['AEP_MW'].resample('D').mean()\n"
                         "      pdf = daily.reset_index().rename(columns={'Datetime':'ds','AEP_MW':'y'})\n"
                         "      train = pdf.iloc[:-30]\n"
                         "      test = pdf.iloc[-30:]"),
            ]),
        day(3, "Fit",
            "",
            [
                exercise("First Prophet",
                         "      m = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False)\n"
                         "      m.fit(train)\n"
                         "      future = m.make_future_dataframe(periods=30)\n"
                         "      forecast = m.predict(future)\n"
                         "      fig = m.plot(forecast); fig.savefig('figures/prophet.png')\n"
                         "      fig2 = m.plot_components(forecast); fig2.savefig('figures/prophet_components.png')"),
            ]),
        day(4, "Add holidays",
            "",
            [
                exercise("US holidays",
                         "      from prophet.make_holidays import make_holidays_df\n"
                         "      hols = make_holidays_df(year_list=range(2002,2025), country='US')\n"
                         "      m = Prophet(holidays=hols, yearly_seasonality=True, weekly_seasonality=True)\n"
                         "      m.fit(train)\n"
                         "      # Re-evaluate MAE"),
            ]),
        day(5, "Evaluate",
            "",
            [
                exercise("Prophet MAE",
                         "      from sklearn.metrics import mean_absolute_error\n"
                         "      pred_30 = forecast['yhat'].iloc[-30:].values\n"
                         "      print('Prophet MAE:', mean_absolute_error(test['y'].values, pred_30))\n\n"
                         "Update your model-comparison table in the README."),
            ]),
        day(6, "Inspect components",
            "",
            [
                exercise("What does the model see?",
                         "Look at the components plot. What's the trend doing? When are the seasonal peaks? Which holidays impact demand most? Write 3 observations."),
            ]),
        day(7, "Tag v0.3", "",
            [
                exercise("Acceptance v0.3",
                         "      git tag v0.3 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Prophet fit + forecast\n"
                         "  ☐ US holidays included\n"
                         "  ☐ Components chart saved\n"
                         "  ☐ MAE in comparison table\n"
                         "  ☐ v0.3 tag"),
            ]),
    ],
    ["Prophet's piecewise-linear trend", "Prophet's multiplicative vs additive seasonality", "Adding holiday effects", "make_holidays_df helper", "Components plot interpretation"],
    ["Format data as ds/y", "Fit baseline Prophet", "Add US holidays", "Evaluate on 30-day test", "Plot components + interpret"],
    "Energy Forecast v0.3 — Prophet model with holidays. Compared against persistence + ARIMA in the README table.",
    ["Add temperature as an extra regressor (download from NOAA)", "Try the changepoint_prior_scale parameter", "Forecast 90 days instead of 30"],
    ["When would Prophet lose to ARIMA?", "Why is Prophet popular in industry?", "What's a 'changepoint' and why does it matter?"],
    ["prophet model saved", "Components plot in figures/", "v0.3 tag"],
)

# Week 16: LSTM / Neural net for time series
DS_W16 = week(
    16, "Energy Forecast v0.4: LSTM (PyTorch)", "Time Series", "15-20",
    "Deep learning for time series. We build a small LSTM in PyTorch — see if it beats Prophet.",
    [
        day(1, "What's an LSTM",
            "",
            [
                video("LSTM explained (15 min)",
                      search("lstm long short term memory explained beginner"),
                      15, "various"),
                reflect("Honest expectation",
                        "LSTMs sometimes lose to Prophet on simple univariate forecasting. Set your expectation: we're learning the tooling, not necessarily winning."),
            ]),
        day(2, "Prepare windowed data",
            "",
            [
                exercise("Sliding windows",
                         "Use 30 days of history to predict the next day:\n"
                         "      import numpy as np\n"
                         "      vals = daily.values\n"
                         "      mean, std = vals.mean(), vals.std()\n"
                         "      norm = (vals - mean) / std\n"
                         "      WINDOW = 30\n"
                         "      X = np.array([norm[i:i+WINDOW] for i in range(len(norm)-WINDOW-1)])\n"
                         "      y = norm[WINDOW+1:WINDOW+1+len(X)]\n"
                         "      print(X.shape, y.shape)"),
            ]),
        day(3, "Build LSTM",
            "",
            [
                exercise("PyTorch model",
                         "      import torch\n"
                         "      import torch.nn as nn\n"
                         "      class Forecaster(nn.Module):\n"
                         "          def __init__(self):\n"
                         "              super().__init__()\n"
                         "              self.lstm = nn.LSTM(input_size=1, hidden_size=32, num_layers=1, batch_first=True)\n"
                         "              self.linear = nn.Linear(32, 1)\n"
                         "          def forward(self, x):\n"
                         "              out, _ = self.lstm(x)\n"
                         "              return self.linear(out[:, -1, :]).squeeze(-1)\n"
                         "      model = Forecaster()"),
            ]),
        day(4, "Train",
            "",
            [
                exercise("Training loop",
                         "      X_train = X[:-30]; y_train = y[:-30]\n"
                         "      X_test = X[-30:]; y_test = y[-30:]\n"
                         "      Xtr = torch.tensor(X_train.reshape(-1, WINDOW, 1), dtype=torch.float32)\n"
                         "      ytr = torch.tensor(y_train, dtype=torch.float32)\n"
                         "      opt = torch.optim.Adam(model.parameters(), lr=1e-3)\n"
                         "      loss_fn = nn.MSELoss()\n"
                         "      for epoch in range(50):\n"
                         "          opt.zero_grad()\n"
                         "          pred = model(Xtr)\n"
                         "          loss = loss_fn(pred, ytr)\n"
                         "          loss.backward(); opt.step()\n"
                         "          if epoch % 10 == 0:\n"
                         "              print(f'epoch {epoch}: loss {loss.item():.4f}')"),
            ]),
        day(5, "Evaluate",
            "",
            [
                exercise("MAE",
                         "      Xte = torch.tensor(X_test.reshape(-1, WINDOW, 1), dtype=torch.float32)\n"
                         "      with torch.no_grad():\n"
                         "          preds = model(Xte).numpy()\n"
                         "      # Denormalize\n"
                         "      preds_real = preds * std + mean\n"
                         "      true_real = y_test * std + mean\n"
                         "      from sklearn.metrics import mean_absolute_error\n"
                         "      print('LSTM MAE:', mean_absolute_error(true_real, preds_real))"),
            ]),
        day(6, "Plot vs others",
            "",
            [
                exercise("Final comparison chart",
                         "Plot all 3 models (Persistence, ARIMA, Prophet, LSTM) on the same chart against actuals. Save as figures/all_models.png."),
            ]),
        day(7, "Tag v0.4", "",
            [
                exercise("Acceptance v0.4",
                         "      git tag v0.4 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ LSTM trained 50 epochs\n"
                         "  ☐ LSTM MAE recorded\n"
                         "  ☐ Comparison chart with all 4 models\n"
                         "  ☐ Updated MAE table in README\n"
                         "  ☐ v0.4 tag"),
            ]),
    ],
    ["LSTM intuition + use cases", "Sliding-window data prep", "PyTorch nn.Module + training loop", "Normalization + denormalization for forecasting", "Comparing models on a single test set"],
    ["Build sliding windows of length 30", "Define + train a small LSTM", "Predict next-day demand for 30 days", "Compare to all previous models"],
    "Energy Forecast v0.4 — LSTM forecasting model. Honest comparison against Prophet and ARIMA — sometimes loses, that's a fact you document.",
    ["Increase WINDOW to 60 days", "Add a second LSTM layer", "Try a GRU instead of LSTM"],
    ["Why must you normalize before training a neural net?", "Why is LSTM not always the answer?", "Why 50 epochs and not 500?"],
    ["LSTM model saved", "4-model comparison chart", "v0.4 tag"],
)

# Week 17: Ship Project 3
DS_W17 = week(
    17, "Energy Forecast v1.0: Ship + retro", "Time Series", "10-15",
    "Polish, ship, retro. Project 3 done.",
    [
        day(1, "Pick the winner", "",
            [
                reflect("Which model ships?",
                         "Based on MAE: which model do you ship as 'the' model? Document the trade-off: simplicity vs accuracy."),
            ]),
        day(2, "Build a small dashboard", "",
            [
                exercise("Streamlit forecast viewer",
                         "Create app.py — Streamlit page that shows:\n  - The chosen model's 30-day forecast\n  - Past 90 days of actuals\n  - MAE comparison table\n  - 'Refresh' button (no live data, just for demo)"),
            ]),
        day(3, "Deploy", "",
            [exercise("Streamlit Cloud", "Deploy the app. Free.")]),
        day(4, "Blog post", "",
            [exercise("'Forecasting energy demand with Prophet vs LSTM'", "Write 1000-1500 words. Be honest about what didn't work.")]),
        day(5, "Demo video", "",
            [exercise("90-second walkthrough", "Record. Upload. Embed in README.")]),
        day(6, "Get 3 readers", "",
            [exercise("Feedback", "3 readers. Apply 1 piece of feedback from each.")]),
        day(7, "Tag v1.0 + retro", "",
            [
                exercise("Acceptance v1.0 — PROJECT 3 DONE",
                         "Write RETRO.md.\n"
                         "      git tag v1.0 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Live Streamlit URL\n"
                         "  ☐ Blog post published\n"
                         "  ☐ Demo video\n"
                         "  ☐ 3 readers + feedback addressed\n"
                         "  ☐ RETRO.md\n"
                         "  ☐ v1.0 tag\n\n"
                         "PROJECT 3 COMPLETE."),
            ]),
    ],
    ["Choosing a production model based on trade-offs", "Streamlit deployment", "Writing honest project posts", "Soliciting feedback at scale"],
    ["Pick the winning model", "Build dashboard", "Deploy", "Write blog post + video", "Get feedback + retro"],
    "Energy Forecast v1.0 — Project 3 complete. Best model deployed in a Streamlit dashboard. Blog post + demo video published.",
    ["Submit the blog to Hacker News", "Send the post to the PJM data team", "Make a Kaggle notebook version"],
    ["What's the cost of choosing the simpler model in production?", "What questions do readers still have?", "What would you do next week if you had to keep working on this?"],
    ["v1.0 tag", "PROJECT 3 COMPLETE", "Blog + video URLs"],
)


# Week 18: Project 4 — Capstone
DS_W18 = week(
    18, "Capstone v0.1: Pick + scope", "Capstone", "10-15",
    "Final project. You pick the question. Apply everything: NLP + time series + deployment + storytelling. This week is just scoping.",
    [
        day(1, "Capstone options",
            "",
            [
                reflect("Pick ONE",
                         "Pick one of these 3 capstones:\n"
                         "  A. Stock news sentiment → returns: scrape financial news, label sentiment, correlate with next-day stock return\n"
                         "  B. Weather → energy demand: combine your energy model with NOAA weather, predict demand from weather forecast\n"
                         "  C. GitHub trending: predict which repos will trend in 7 days from their week-1 commit + star pattern\n\n"
                         "Pick the one that excites you most. The other 2 die."),
            ]),
        day(2, "Write the spec",
            "",
            [
                exercise("SPEC.md",
                         "Make a new repo: forge-capstone. Inside, SPEC.md:\n"
                         "      # Capstone Spec\n"
                         "      ## Question\n  (one sentence)\n"
                         "      ## Data sources\n  (with URLs)\n"
                         "      ## Method\n  (3 bullets)\n"
                         "      ## Definition of success\n  (specific metric + threshold)\n"
                         "      ## Definition of done\n  (deliverables list)\n"
                         "      ## What's out of scope\n  (3 bullets — what you're NOT doing)"),
            ]),
        day(3, "Find datasets",
            "",
            [
                exercise("Verify access",
                         "Click through every dataset URL. Download a sample. Confirm it's free + accessible. If anything's blocked or paid, revise SPEC.md."),
            ]),
        day(4, "Plan 3 weeks",
            "",
            [
                exercise("ROADMAP.md",
                         "      # Capstone Roadmap\n"
                         "      ## W19\n  - Data collection + cleaning\n  - EDA\n  ## W20\n  - Modeling\n  - Evaluation\n  - Final dashboard + blog post"),
            ]),
        day(5, "Build a tiny prototype",
            "",
            [
                exercise("Prove it's possible",
                         "Pull JUST ENOUGH data to verify the idea has signal. 100 rows, the simplest model, the laziest evaluation. If the signal isn't there with 100 rows, no amount of scaling will save it."),
            ]),
        day(6, "Adjust scope",
            "",
            [
                exercise("Be honest",
                         "If the prototype was disappointing, what's the smaller, more achievable version of the question? Edit SPEC.md."),
            ]),
        day(7, "Tag v0.1", "",
            [
                exercise("Acceptance v0.1",
                         "      git tag v0.1 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ SPEC.md committed\n"
                         "  ☐ Datasets verified accessible\n"
                         "  ☐ ROADMAP.md for W19 + W20\n"
                         "  ☐ Prototype run with real data\n"
                         "  ☐ v0.1 tag"),
            ]),
    ],
    ["Scoping a project", "Writing a SPEC", "Prototype-first to validate signal", "Definition of done", "Out-of-scope explicit lists"],
    ["Pick capstone topic", "Write SPEC.md", "Verify data sources", "Plan W19-20", "Build a 100-row prototype", "Adjust scope based on what you saw"],
    "Capstone v0.1 — scoped, datasets verified, prototype proves there's signal, roadmap for the next 2 weeks.",
    ["Pitch your spec to one friend in 2 minutes", "Search for similar projects on GitHub — what did they NOT do?", "Pick the metric you'll be most embarrassed if it's bad"],
    ["Why prototype-first?", "How is your spec falsifiable?", "What's the smallest version that's still interesting?"],
    ["SPEC.md + ROADMAP.md", "Prototype notebook", "v0.1 tag"],
)

# Week 19: Build it
DS_W19 = week(
    19, "Capstone v0.2: Build", "Capstone", "15-20",
    "Heads-down building. Follow your roadmap.",
    [
        day(1, "Full data collection",
            "",
            [
                exercise("Scrape / download everything",
                         "Pull all the data you need. Save it raw to data/raw/. Document each source's URL + download date in README."),
            ]),
        day(2, "Clean",
            "",
            [
                exercise("01-clean.ipynb",
                         "Apply the same cleaning patterns from TaxiPulse: drop impossible rows, type-correct, derive features, save clean.parquet."),
            ]),
        day(3, "EDA",
            "",
            [
                exercise("3-5 charts",
                         "Make charts that answer the most basic version of your question. Verify the signal is still there at full scale."),
            ]),
        day(4, "Baseline model",
            "",
            [
                exercise("Simplest model first",
                         "Whatever your problem is, the simplest baseline:\n  - Classification → LogisticRegression\n  - Regression → LinearRegression\n  - Time series → persistence\n  - Sentiment → pretrained model\n\nGet a number. Even if it's bad."),
            ]),
        day(5, "Iterate",
            "",
            [
                exercise("Better model",
                         "ONE more model. Could be: XGBoost, fine-tuned transformer, Prophet, LSTM. Pick the one most relevant to your problem."),
            ]),
        day(6, "Evaluation",
            "",
            [
                exercise("Honest evaluation",
                         "Compute every metric that matters. Write a table comparing the 2 models. If neither hits your SPEC's success threshold, revise: did the question need to be smaller?"),
            ]),
        day(7, "Tag v0.2", "",
            [
                exercise("Acceptance v0.2",
                         "      git tag v0.2 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ All data collected + cleaned\n"
                         "  ☐ EDA done\n"
                         "  ☐ Baseline + 1 better model\n"
                         "  ☐ Evaluation table\n"
                         "  ☐ v0.2 tag"),
            ]),
    ],
    ["Full-scale data collection", "Pipeline-driven notebook structure", "Baseline-first modeling", "Honest evaluation tables", "Scope-cutting when results are weak"],
    ["Collect all data", "Clean everything", "Run EDA", "Train baseline + better model", "Build comparison table"],
    "Capstone v0.2 — actual model trained, evaluated, comparison table written, real numbers.",
    ["Try a 3rd model just for sport", "Document one wrong path you took today", "Save predictions for inspection later"],
    ["Where did the actual data disappoint vs the prototype?", "What's the gap between your model and a great model?", "What would you need to close that gap?"],
    ["Trained models in models/", "Eval table", "v0.2 tag"],
)

# Week 20: Ship + Capstone retro
DS_W20 = week(
    20, "Capstone v1.0: Ship + roadmap done", "Capstone", "15-20",
    "Final week of 20. Ship the capstone. Write the retro. Look back at the whole roadmap.",
    [
        day(1, "Build the demo",
            "",
            [
                exercise("Streamlit or web app",
                         "Whatever shows your model best: a Streamlit explorer, a static dashboard, a video walkthrough. Pick one. Build it."),
            ]),
        day(2, "Deploy",
            "",
            [exercise("Get it live", "Push to Streamlit Cloud / HF Spaces / Render. Get a URL.")]),
        day(3, "Write the blog post", "",
            [exercise("1500-2000 words", "The biggest post yet. Cover the spec, the data, the journey, the results, what didn't work.")]),
        day(4, "Demo video", "",
            [exercise("3-minute walkthrough", "Longer than previous videos — this is your capstone.")]),
        day(5, "Update your portfolio", "",
            [
                exercise("Portfolio update",
                         "If you have a personal site (Edge Portfolio from DevOps), add the 4 projects:\n  1. TaxiPulse (Project 1)\n  2. Reddit Sentiment (Project 2)\n  3. Energy Forecast (Project 3)\n  4. [Capstone name]\n\nIf you don't have a personal site, add them to your LinkedIn 'Featured' section."),
            ]),
        day(6, "Get 5 readers",
            "",
            [exercise("Feedback at scale", "Send blog post URL to 5 people. Apply common feedback.")]),
        day(7, "Tag v1.0 + ROADMAP RETRO",
            "",
            [
                exercise("Final acceptance — Roadmap complete",
                         "Write RETRO.md for the capstone.\n"
                         "Write ROADMAP_RETRO.md at the top level — your retro on the WHOLE 20 weeks:\n"
                         "      # Forge Data Science Roadmap — Retro\n"
                         "      ## 4 projects shipped\n  1. TaxiPulse\n  2. Reddit Sentiment\n  3. Energy Forecast\n  4. [Capstone]\n"
                         "      ## What I learned\n  ...\n"
                         "      ## What I'd do differently\n  ...\n"
                         "      ## Hardest week\n  ...\n"
                         "      ## Proudest moment\n  ...\n"
                         "      ## What's next\n  ...\n\n"
                         "      git tag v1.0 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Capstone live demo\n"
                         "  ☐ Blog post + video\n"
                         "  ☐ Portfolio updated with all 4 projects\n"
                         "  ☐ 5 readers' feedback applied\n"
                         "  ☐ RETRO.md + ROADMAP_RETRO.md\n"
                         "  ☐ v1.0 tag\n\n"
                         "DATA SCIENCE ROADMAP COMPLETE. 4 named projects on your CV."),
            ]),
    ],
    ["Capstone deployment", "Portfolio building", "Roadmap-level retrospectives", "Long-form blog writing"],
    ["Build + deploy capstone demo", "Write capstone blog post + video", "Update portfolio with all 4 projects", "Get 5 readers", "Write capstone retro + roadmap retro"],
    "Capstone v1.0 — full project shipped. Roadmap complete. 4 named projects on your CV. Real retrospective written.",
    ["Apply to one job using the portfolio", "Post the capstone on /r/datascience for feedback", "Schedule a 30-min portfolio review with a working DS"],
    ["Of the 4 projects, which one would you trust to defend in an interview?", "Which week of the roadmap stretched you most?", "If you started over, what would you change?"],
    ["v1.0 tag + ROADMAP COMPLETE", "4 projects in portfolio", "ROADMAP_RETRO.md"],
)


# ═══════════════════════════════════════════════════════════════════════
# DATA ANALYSIS — Weeks 5 through 18
# ═══════════════════════════════════════════════════════════════════════

# Week 5: Finish Superstore — executive presentation
DA_W5 = week(
    5, "Superstore v0.5: Executive deck", "Foundation", "10-15",
    "Last week you wrote a 1-page memo. This week you turn it into a 5-slide executive deck — the format leadership actually consumes.",
    [
        day(1, "Why decks", "",
            [
                video("How analysts communicate to leadership (10 min)",
                      search("data analyst executive communication slides"),
                      10, "various"),
                reflect("Audience",
                         "If the CEO has 5 minutes and only looks at 1 slide of your deck, which slide should it be?"),
            ]),
        day(2, "Build slide 1 — headline",
            "",
            [
                exercise("Title slide",
                         "Open Google Slides or PowerPoint. New deck named 'Superstore Q4 Review'.\n"
                         "Slide 1:\n"
                         "  Big headline (40pt font): 'Furniture profitability is at risk — tables losing $X/qtr'\n"
                         "  Subhead: 'And 3 other findings from 4 years of sales data'\n"
                         "  Footer: Your name + date"),
            ]),
        day(3, "Slides 2-4 — findings",
            "",
            [
                exercise("One finding per slide",
                         "Slide 2: Q1 — Margin leaders/laggards. Chart on left, 3 bullets on right.\n"
                         "Slide 3: Q2 — Regional YoY. Chart on left, 1 recommendation.\n"
                         "Slide 4: Q3 — Furniture deep dive. Chart with the failing sub-category highlighted in red."),
            ]),
        day(4, "Slide 5 — recommendations",
            "",
            [
                exercise("So what?",
                         "Slide 5:\n"
                         "  Title: 'Recommendations'\n"
                         "  3 bullets, each with a specific action + expected impact:\n"
                         "    - 'Cap discounts at 20% on Furniture → save ~$X profit annually'\n"
                         "    - 'Discontinue or redesign Tables sub-category → free up $X capital'\n"
                         "    - 'Replicate West region strategy in Central → +$X revenue at run rate'"),
            ]),
        day(5, "Design pass",
            "",
            [
                exercise("Visual consistency",
                         "Apply a consistent color palette (2 colors + grey). Make every chart label readable from across a room (min 14pt). Strip every gridline that doesn't help."),
            ]),
        day(6, "Practice the 5-minute pitch",
            "",
            [
                exercise("Record yourself",
                         "Use your phone. Pretend you're presenting to the CEO. 5 minutes max. Listen back. What's confusing? Which words are filler?"),
            ]),
        day(7, "Tag v0.5", "",
            [
                exercise("Acceptance v0.5",
                         "Export deck as PDF. Add to your superstore-analysis repo as deck.pdf.\n"
                         "      git add deck.pdf && git commit -m 'v0.5: executive deck'\n"
                         "      git tag v0.5 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ 5-slide deck exists\n"
                         "  ☐ Each slide has 1 main idea\n"
                         "  ☐ Recommendations are specific with numbers\n"
                         "  ☐ Practiced 5-minute pitch\n"
                         "  ☐ deck.pdf committed\n"
                         "  ☐ v0.5 tag"),
            ]),
    ],
    ["Executive communication", "Slide design fundamentals", "Headline-first slides", "Practicing pitches", "Translating analysis into actions"],
    ["Draft headline slide", "Build 3 finding slides (1 chart + 1 takeaway each)", "Build recommendations slide", "Polish visuals", "Practice 5-minute pitch", "Export and commit deck.pdf"],
    "Superstore v0.5 — 5-slide executive deck with specific recommendations. Practiced and exported as PDF.",
    ["Rebuild the deck without ANY chart — only big numbers and text. Compare effectiveness.", "Make a 'CFO-version' that's all about money saved", "Make an 'ops-version' that's all about discount caps"],
    ["Why do executives consume slides not memos?", "Why is one-idea-per-slide a rule?", "What's the difference between a chart label and a chart title?"],
    ["deck.pdf committed", "v0.5 tag"],
)

# Week 6: Ship + Project 1 retro
DA_W6 = week(
    6, "Superstore v1.0: Ship + retro", "Foundation", "10-15",
    "Final polish, retro, hand off Project 1.",
    [
        day(1, "Final polish list", "",
            [reflect("Rough edges", "List 10 things in the repo + memo + deck that could be slightly better.")]),
        day(2, "Fix them", "", [exercise("Polish pass", "Fix the top 5.")]),
        day(3, "Reformat memo as Word doc", "",
            [
                reading("Microsoft Word / Google Docs",
                        "https://docs.google.com",
                        "Click 'Open' to access Google Docs free."),
                exercise("Polished memo",
                         "Move your memo into Google Docs with proper formatting: title page, headers in a brand color, page numbers, footer.\n"
                         "Export as PDF. Save as memo-final.pdf in the repo."),
            ]),
        day(4, "Add anonymized public dataset version", "",
            [
                exercise("Public-safe",
                         "Sample Superstore IS public — but in real work you'd anonymize. As practice: rename Customer Name + Customer ID columns with fake names (Faker library or manually). Save as orders-public.csv."),
            ]),
        day(5, "Get one reader", "",
            [exercise("Stranger review", "Send the deck + memo to one person. Get their honest 'what was confusing' answer.")]),
        day(6, "Fix what confused them", "", [exercise("Apply feedback", "Fix it.")]),
        day(7, "Tag v1.0 + retro", "",
            [
                exercise("Project 1 DONE",
                         "Write RETRO.md.\n"
                         "      git tag v1.0 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Memo + deck + dashboard all in repo\n"
                         "  ☐ Anonymized version available\n"
                         "  ☐ 1 reader's feedback applied\n"
                         "  ☐ RETRO.md\n"
                         "  ☐ v1.0 tag\n\n"
                         "PROJECT 1 DONE. Next: Project 2 — HR analytics."),
            ]),
    ],
    ["Polishing analytical artifacts", "Anonymizing data for sharing", "Memo formatting in Docs/Word", "Outside-reader feedback", "Project retrospectives"],
    ["Fix 5 rough edges", "Reformat memo as polished PDF", "Create anonymized public dataset version", "Get one stranger's feedback", "Apply feedback", "Write RETRO.md"],
    "Superstore v1.0 — Project 1 done. Polished memo PDF, deck PDF, dashboard sheet, anonymized data, retro all committed.",
    ["Make a 2-minute Loom video walkthrough of the dashboard", "Post a screenshot on LinkedIn", "Add the repo to your GitHub pinned repos"],
    ["What's the smallest unit of analyst polish that makes a real difference?", "How does anonymization change trust?", "What feedback hurt the most?"],
    ["v1.0 tag — PROJECT 1 COMPLETE", "Polished deliverables", "RETRO.md"],
)

# Week 7: Start Project 2 — HR Attrition
DA_W7 = week(
    7, "Project 2 — HR Attrition v0.1", "HR Analytics", "12-18",
    "New project. IBM HR Attrition dataset — 1470 employee records with whether they left. Goal by W10: a dashboard + memo for the HR director on who leaves and why.",
    [
        day(1, "Why HR analytics",
            "",
            [
                reading("IBM HR Attrition dataset — Kaggle",
                        "https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset",
                        "Click 'Open' → download. CSV, ~225KB."),
                reflect("Three questions",
                        "Before you look at the data, write 3 questions HR would care about:\n  1. Who is most likely to leave?\n  2. Which department / role / tenure has worst attrition?\n  3. What predicts attrition — salary? overtime? distance from home?"),
            ]),
        day(2, "Load + first look",
            "",
            [
                exercise("Set up",
                         "Make folder hr-attrition/. Save the CSV in data/.\n"
                         "In Excel/Sheets: open the file. ~1470 rows, ~35 columns. Note: Attrition (Yes/No), Age, Department, MonthlyIncome, OverTime, YearsAtCompany, DistanceFromHome.\n\n"
                         "Headline: =COUNTIF(Attrition column, \"Yes\") / COUNT(...)\n"
                         "What's the overall attrition rate?"),
            ]),
        day(3, "Attrition by department",
            "",
            [
                exercise("Department pivot",
                         "Pivot: Rows = Department, Values = COUNT Yes / COUNT All * 100% = Attrition rate.\n"
                         "Sort. Which department has worst attrition?"),
            ]),
        day(4, "Attrition by role",
            "",
            [
                exercise("Job role pivot",
                         "Pivot: Rows = JobRole, Values = attrition rate.\n"
                         "Sort. Top 3 most-leaving roles?"),
            ]),
        day(5, "Salary effect",
            "",
            [
                exercise("Bucketed salary",
                         "Add column: Salary Bucket = nested IF on MonthlyIncome:\n"
                         "  <3000 = Low; 3000-7000 = Mid; 7000-15000 = High; >15000 = Top\n"
                         "Pivot: rate by bucket. Where's the cliff?"),
            ]),
        day(6, "Overtime effect",
            "",
            [
                exercise("OverTime pivot",
                         "Pivot: Rows = OverTime (Yes/No), Values = attrition rate.\n"
                         "Document: by what factor does overtime increase attrition?"),
            ]),
        day(7, "Tag v0.1",
            "",
            [
                exercise("Acceptance v0.1",
                         "Create GitHub repo hr-attrition. Commit Excel/Sheets file + 4 pivots + a README listing what you found.\n"
                         "      git tag v0.1 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Data loaded\n"
                         "  ☐ Overall attrition rate documented\n"
                         "  ☐ 4 pivots (department, role, salary, overtime)\n"
                         "  ☐ One-paragraph 'first findings' note in README\n"
                         "  ☐ v0.1 tag"),
            ]),
    ],
    ["HR analytics fundamentals", "Calculating attrition rate from Yes/No", "Multi-dimensional pivot tables", "Bucketing continuous variables (salary)", "Identifying biggest-effect features"],
    ["Download IBM HR dataset", "Compute overall attrition rate", "Pivots by Department, JobRole, Salary bucket, OverTime", "Note biggest effects in README"],
    "HR Attrition v0.1 — initial exploration. 4 pivots identifying which departments, roles, salary bands, and overtime status have the worst attrition.",
    ["Add pivots for DistanceFromHome buckets", "Compare attrition by Education level", "Look at Gender (note: be careful with interpretation)"],
    ["Why is overall attrition rate the wrong KPI to focus on?", "What's the difference between attrition and turnover?", "Where could correlation mislead a recommendation?"],
    ["Excel file + 4 pivots", "v0.1 tag", "First findings paragraph"],
)

# Week 8: Tenure + cohort analysis
DA_W8 = week(
    8, "HR Attrition v0.2: Tenure + cohorts", "HR Analytics", "12-18",
    "Most people leave in their first 2 years. This week we prove it — and find which tenure buckets HR should worry about.",
    [
        day(1, "What is tenure analysis",
            "",
            [
                reflect("Sketch hypothesis",
                        "Draw a chart on paper of attrition rate vs YearsAtCompany. What shape do you expect — flat? J-shape? Bathtub curve?"),
            ]),
        day(2, "Attrition by tenure bucket",
            "",
            [
                exercise("Bucket pivot",
                         "Add column YearsBucket: nested IF on YearsAtCompany:\n"
                         "  =IF(A2<=1, \"0-1\", IF(A2<=3, \"2-3\", IF(A2<=5, \"4-5\", IF(A2<=10, \"6-10\", \"10+\"))))\n"
                         "Pivot: Rows = YearsBucket, Values = attrition rate, COUNT.\n"
                         "What's the shape?"),
            ]),
        day(3, "Time-since-promotion",
            "",
            [
                exercise("YearsSinceLastPromotion",
                         "Pivot: Rows = YearsSinceLastPromotion (cap at 8+), Values = attrition rate.\n"
                         "Where's the danger zone?"),
            ]),
        day(4, "Cross-tab tenure × role",
            "",
            [
                exercise("2-D pivot",
                         "Rows = YearsBucket, Columns = JobRole, Values = attrition rate.\n"
                         "Conditional formatting (red high, green low). Which combos are worst?"),
            ]),
        day(5, "Years × salary",
            "",
            [
                exercise("Tenure-salary interaction",
                         "Rows = YearsBucket, Columns = Salary Bucket, Values = attrition rate.\n"
                         "Findings: do high-tenure low-salary employees leave more?"),
            ]),
        day(6, "Plot a 'survival curve'",
            "",
            [
                exercise("Cumulative leave rate by tenure",
                         "Compute % of all leavers who had ≤ N years tenure. Plot as a step chart. This is your 'cumulative attrition by tenure'."),
            ]),
        day(7, "Tag v0.2", "",
            [
                exercise("Acceptance v0.2",
                         "Update README with findings.\n"
                         "      git tag v0.2 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Tenure bucket pivot\n"
                         "  ☐ Promotion gap pivot\n"
                         "  ☐ Cross-tab tenure × role\n"
                         "  ☐ Cross-tab tenure × salary\n"
                         "  ☐ Cumulative attrition step chart\n"
                         "  ☐ v0.2 tag"),
            ]),
    ],
    ["Tenure bucketing", "Promotion-gap as a signal", "2-D pivots with conditional formatting", "Interaction effects (tenure × salary)", "Cumulative / survival-curve visuals"],
    ["Bucket YearsAtCompany into ranges", "Pivot tenure → attrition", "Pivot promotion gap → attrition", "Cross-tab tenure × role", "Cross-tab tenure × salary", "Build cumulative-attrition chart"],
    "HR Attrition v0.2 — tenure analysis. Specific finding: at what tenure HR should intervene. Cross-tabs identify danger combinations.",
    ["Add interaction with OverTime — does overtime hurt new hires more?", "Compare tenure curves by Department side-by-side", "Find the single ROLE × TENURE combo with the highest attrition"],
    ["What's a survival curve?", "Why does promotion gap predict attrition?", "How would you validate that tenure×salary interaction is real and not noise?"],
    ["Pivots + chart in Excel", "v0.2 tag", "README updated"],
)

# Week 9: HR memo + dashboard
DA_W9 = week(
    9, "HR Attrition v0.3: Memo + dashboard", "HR Analytics", "10-15",
    "Time to ship findings. Build the dashboard. Write the memo.",
    [
        day(1, "What HR needs",
            "",
            [
                reflect("Audience",
                         "Imagine you're presenting to the HR Director. They want to know:\n  - Who do we lose?\n  - Why?\n  - What 1 thing should we do this quarter?"),
            ]),
        day(2, "Build the dashboard sheet",
            "",
            [
                exercise("4 KPIs + 3 charts",
                         "On a Dashboard sheet:\n"
                         "  TOP ROW (4 KPI cards):\n"
                         "    - Total employees\n"
                         "    - Overall attrition rate\n"
                         "    - Worst-department attrition rate\n"
                         "    - Highest-risk tenure bucket\n"
                         "  MIDDLE:\n"
                         "    - Bar chart: attrition by department\n"
                         "    - Line/step chart: attrition by tenure\n"
                         "  BOTTOM:\n"
                         "    - Table: top 5 most-at-risk role × tenure combos"),
            ]),
        day(3, "Filters",
            "",
            [
                exercise("Slicer / dropdown",
                         "Add a Department filter — let the viewer focus on one department and see all KPIs for just that team."),
            ]),
        day(4, "Write the memo",
            "",
            [
                exercise("HR-Memo.docx",
                         "1 page. Structure:\n"
                         "      # IBM HR Attrition — Memo to HR Director\n"
                         "      ## Headline\n  Sales Reps in 0-3 years are leaving at 3x company rate.\n"
                         "      ## Findings\n  Q1. Overall attrition: 16%. Sales: 21%. Research: 14%.\n"
                         "      Q2. Tenure 0-1 yr has 37% attrition.\n"
                         "      Q3. Overtime DOUBLES attrition rate from 10% to 30%.\n"
                         "      ## Recommendations\n  - Year-1 retention program for sales reps\n  - Audit overtime exposure\n  - Promotion review for employees > 4 yrs without promotion\n"
                         "      ## What's next\n  - 3 bullets"),
            ]),
        day(5, "Export as PDF",
            "",
            [exercise("PDF", "Export the memo as HR-Memo.pdf.")]),
        day(6, "Build a 4-slide exec deck",
            "",
            [exercise("Same as Superstore W5", "Headline slide + 3 finding slides. Practice the 5-minute pitch.")]),
        day(7, "Tag v0.3", "",
            [
                exercise("Acceptance v0.3",
                         "      git tag v0.3 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Dashboard sheet built\n"
                         "  ☐ Department filter works\n"
                         "  ☐ HR-Memo.pdf 1-page\n"
                         "  ☐ 4-slide deck\n"
                         "  ☐ v0.3 tag"),
            ]),
    ],
    ["HR-targeted dashboard design", "Filter-driven dashboards", "Specific, actionable recommendations", "Re-using the executive deck pattern"],
    ["Build 4-KPI + 3-chart dashboard", "Add department filter", "Write 1-page HR memo", "Export as PDF", "Build 4-slide exec deck"],
    "HR Attrition v0.3 — full deliverable set. Dashboard, memo PDF, deck PDF. Specific recommendations to the HR Director.",
    ["Add a 'manager' filter (column ManagerID isn't in the dataset but you could simulate it)", "Add overtime hours estimate", "Quantify dollar impact: cost of replacing one employee × attrition count = X"],
    ["What's 'cost of attrition' and how would you estimate it?", "Why is 'overall attrition rate' a weak headline?", "Where could your recommendations backfire?"],
    ["Dashboard + memo + deck", "v0.3 tag"],
)

# Week 10: Ship Project 2 + retro
DA_W10 = week(
    10, "HR Attrition v1.0: Ship + retro", "HR Analytics", "10-15",
    "Polish, share, retro. Project 2 done.",
    [
        day(1, "Polish list", "",
            [reflect("10 rough edges", "List them.")]),
        day(2, "Fix them", "", [exercise("Polish pass", "Top 5.")]),
        day(3, "Anonymize the dataset", "",
            [exercise("Public-safe", "Even though IBM HR is public, practice: drop EmployeeID and any near-identifying combos.")]),
        day(4, "Add a SQL version", "",
            [
                exercise("queries.sql",
                         "Re-do the 3 main findings in SQLite Online. Save 5+ queries. Verify results match pivots."),
            ]),
        day(5, "Demo video", "",
            [exercise("90-sec walkthrough of the dashboard", "Upload to YouTube unlisted. Embed in README.")]),
        day(6, "Get one reader", "", [exercise("Feedback", "Apply 1 piece of feedback.")]),
        day(7, "Tag v1.0 + retro", "",
            [
                exercise("Project 2 DONE",
                         "Write RETRO.md.\n"
                         "      git tag v1.0 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Polished\n"
                         "  ☐ SQL queries.sql committed\n"
                         "  ☐ Demo video embedded\n"
                         "  ☐ RETRO.md\n"
                         "  ☐ v1.0 tag\n\n"
                         "PROJECT 2 COMPLETE. Next: Project 3 — Marketing Funnel."),
            ]),
    ],
    ["Polishing HR analytics deliverables", "SQL version of analysis", "Demo videos", "Project retros"],
    ["Polish", "Anonymize", "Add SQL", "Record demo video", "Get feedback", "Retro"],
    "HR Attrition v1.0 — Project 2 done. Full set of polished deliverables + demo video.",
    ["Post a screenshot on LinkedIn with 1 finding", "Anonymize and post as a Kaggle notebook", "Send to one HR pro for industry sanity check"],
    ["What would HR pros add that I missed?", "What sounds wrong about my recommendations?", "Where do I need to be MORE specific?"],
    ["v1.0 tag — PROJECT 2 DONE", "Demo video URL", "RETRO.md"],
)

# Week 11: Start Project 3 — Marketing Funnel
DA_W11 = week(
    11, "Project 3 — Marketing Funnel v0.1", "Marketing", "12-18",
    "New project. Olist e-commerce dataset from Brazil — 100K orders with full funnel (view → add to cart → order → review). Build a funnel analysis + recommendations for marketing.",
    [
        day(1, "What is a funnel?",
            "",
            [
                video("Marketing funnel analysis (10 min)",
                      search("marketing funnel analysis explained"), 10, "various"),
                reflect("Funnel intuition",
                        "Classic funnel: Visitors → Carts → Checkouts → Orders → Repeat customers. At each step, what % usually drops off?"),
            ]),
        day(2, "Get Olist data",
            "",
            [
                reading("Olist Brazilian E-Commerce — Kaggle",
                        "https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce",
                        "Click 'Open' → download. ~50MB zip with 9 CSVs."),
                exercise("Setup",
                         "Make repo olist-funnel/. Unzip the Kaggle dataset into data/.\n"
                         "Files: customers, orders, order_items, order_payments, order_reviews, products, sellers, geolocation, category translation."),
            ]),
        day(3, "Understand the schema",
            "",
            [
                exercise("Schema diagram",
                         "On paper or in a draw.io file: how do the 9 tables connect?\n"
                         "  orders.customer_id → customers.customer_id\n"
                         "  orders.order_id → order_items.order_id → products.product_id\n"
                         "  orders.order_id → order_payments\n"
                         "  orders.order_id → order_reviews\n\n"
                         "Save the diagram as schema.png."),
            ]),
        day(4, "Funnel step 1: orders by status",
            "",
            [
                exercise("Status pivot",
                         "Load orders.csv. Pivot: status → COUNT.\n"
                         "Olist statuses: created, approved, invoiced, shipped, delivered, canceled, unavailable.\n"
                         "What's the conversion from 'created' to 'delivered'?"),
            ]),
        day(5, "Time-to-delivery",
            "",
            [
                exercise("Lag metrics",
                         "Compute days from order_purchase_timestamp to order_delivered_customer_date for delivered orders.\n"
                         "Plot the distribution. Median? 90th percentile? What's the customer-promise gap (estimated vs actual)?"),
            ]),
        day(6, "Review scores",
            "",
            [
                exercise("Review by delivery time",
                         "Join orders + reviews. Plot avg review_score by delivery-time bucket. Late = lower review?"),
            ]),
        day(7, "Tag v0.1", "",
            [
                exercise("Acceptance v0.1",
                         "Push the repo. Tag v0.1.\n\n"
                         "PASS:\n"
                         "  ☐ Data loaded\n"
                         "  ☐ Schema diagram\n"
                         "  ☐ Order status funnel\n"
                         "  ☐ Delivery time distribution\n"
                         "  ☐ Review vs delivery analysis\n"
                         "  ☐ v0.1 tag"),
            ]),
    ],
    ["Multi-table schema understanding", "Order status funnel", "Time-lag computations (purchase → deliver)", "Joining orders + reviews", "Review-score interpretation"],
    ["Load Olist 9-CSV dataset", "Draw schema diagram", "Compute order-status funnel", "Plot delivery time distribution", "Correlate delivery time with reviews"],
    "Olist Funnel v0.1 — initial exploration. Schema diagram + order status funnel + delivery vs review correlation.",
    ["Compute revenue by status (lost revenue from cancellations)", "Build a customer-lifetime view: 1 vs repeat purchasers", "Filter to São Paulo state only — is the funnel different there?"],
    ["Why does delivery time predict review score so strongly?", "What's the gap between an 'order' and a 'delivered order'?", "How big is the data here vs Superstore?"],
    ["v0.1 tag", "Schema diagram", "Funnel pivot + delivery analysis"],
)

# Week 12: Cohorts + repeat purchase
DA_W12 = week(
    12, "Olist Funnel v0.2: Cohorts + repeat purchase", "Marketing", "12-18",
    "Most of Olist's customers buy ONCE. This week we measure cohort retention — and find the % who come back.",
    [
        day(1, "What's a cohort?",
            "",
            [
                video("Cohort analysis explained (10 min)",
                      search("cohort analysis tutorial beginner"),
                      10, "various"),
                reflect("Question",
                        "If Olist gets 1000 first-time customers in January, how many come back in February? March? August?"),
            ]),
        day(2, "First-purchase month per customer",
            "",
            [
                exercise("Identify cohort",
                         "Build a derived table: for each customer, their first order date.\n"
                         "Then for each customer, label every order with the customer's COHORT (first-purchase year-month).\n\n"
                         "In Excel: add Helper column 'is_first_order' = whether this order is the customer's earliest. Filter to is_first_order = true → that's your cohort table."),
            ]),
        day(3, "Cohort retention matrix",
            "",
            [
                exercise("Cohort × month matrix",
                         "Pivot: Rows = cohort year-month, Columns = (order month - cohort month) in months, Values = COUNT distinct customer_id.\n"
                         "Color-code with conditional formatting (green = high retention, white = low)."),
            ]),
        day(4, "Repeat-purchase rate",
            "",
            [
                exercise("Single metric",
                         "Across ALL cohorts: what % of customers bought again at any later point?\n"
                         "Spoiler: Olist's repeat rate is famously low (~3%). Confirm with your data."),
            ]),
        day(5, "Investigate: who buys again?",
            "",
            [
                exercise("Compare repeat vs one-time",
                         "Split customers into 2 groups: repeat buyers vs one-time. Compare:\n"
                         "  - average order value\n"
                         "  - average review score on first order\n"
                         "  - average delivery time on first order\n"
                         "  - product category on first order\n"
                         "Anything stand out?"),
            ]),
        day(6, "Average days to second purchase",
            "",
            [
                exercise("Second-purchase lag",
                         "For repeat customers: days between 1st and 2nd order. Plot the distribution.\n"
                         "Most repeats happen within X days — what's X?"),
            ]),
        day(7, "Tag v0.2", "",
            [
                exercise("Acceptance v0.2",
                         "      git tag v0.2 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Cohort retention matrix\n"
                         "  ☐ Overall repeat rate documented\n"
                         "  ☐ Repeat-vs-onetime comparison\n"
                         "  ☐ Days-to-second-purchase distribution\n"
                         "  ☐ v0.2 tag"),
            ]),
    ],
    ["Cohort definitions", "Cohort retention matrices", "Repeat-purchase rate", "Behavioral comparison (repeat vs one-time)", "Time-to-repeat distributions"],
    ["Compute first purchase per customer", "Build cohort × month retention matrix", "Compute overall repeat rate", "Compare repeat vs one-time customer behaviors", "Plot days-to-second-purchase"],
    "Olist Funnel v0.2 — cohort analysis. Specific finding: Olist's repeat rate + what predicts second purchases.",
    ["Cohort by state instead of month", "Cohort by product category of first purchase", "Look at 3rd, 4th, 5th purchase patterns"],
    ["Why is repeat rate the metric e-commerce optimizes for?", "What's the survivorship bias in cohort matrices?", "How would a recommendation engine change repeat rate?"],
    ["Cohort matrix", "Repeat-rate KPI", "v0.2 tag"],
)

# Week 13: Funnel memo + dashboard
DA_W13 = week(
    13, "Olist Funnel v0.3: Memo + dashboard", "Marketing", "10-15",
    "Build the deliverables for marketing.",
    [
        day(1, "Audience", "",
            [
                reflect("Marketing director needs",
                         "Who reads this? A marketing director who needs to:\n  - Know the funnel drop-offs\n  - Know the repeat rate\n  - Know what 1 action could grow repeat rate")
            ]),
        day(2, "Dashboard layout", "",
            [
                exercise("4 KPI + 3 charts",
                         "Dashboard:\n"
                         "  TOP: total customers / total orders / repeat rate / avg review score\n"
                         "  MIDDLE: funnel chart (created → delivered with drop-offs) + cohort retention heatmap\n"
                         "  BOTTOM: top 5 categories driving repeat purchases"),
            ]),
        day(3, "Funnel chart",
            "",
            [
                exercise("Build it",
                         "Excel: insert chart → Funnel (Excel 365 / Sheets has it built-in).\n"
                         "Categories: Created, Approved, Shipped, Delivered, 2nd Purchase.\n"
                         "Each: count.\n"
                         "Drop-off % between each stage shown."),
            ]),
        day(4, "Memo",
            "",
            [
                exercise("MEMO.docx",
                         "Title: 'Olist e-commerce funnel analysis'\n"
                         "Headline finding (one sentence)\n"
                         "## Funnel\n"
                         "  - X% drop from order to delivery (and Y% of those due to delivery time)\n"
                         "## Repeat purchases\n"
                         "  - 3% repeat rate. 80% of repeats happen within 30 days.\n"
                         "## Recommendations\n"
                         "  - 1. Improve delivery time on top 5 highest-revenue categories\n"
                         "  - 2. Email campaign at day 14 post-purchase\n"
                         "  - 3. Loyalty discount on 2nd purchase\n"
                         "Export PDF."),
            ]),
        day(5, "Exec deck",
            "",
            [exercise("5 slides", "Same shape as previous decks.")]),
        day(6, "Practice pitch", "", [exercise("5-minute pitch", "Record yourself.")]),
        day(7, "Tag v0.3", "",
            [
                exercise("Acceptance v0.3",
                         "      git tag v0.3 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Dashboard built\n"
                         "  ☐ Funnel chart works\n"
                         "  ☐ Memo PDF\n"
                         "  ☐ 5-slide deck PDF\n"
                         "  ☐ v0.3 tag"),
            ]),
    ],
    ["Marketing-targeted dashboards", "Excel funnel charts", "Cohort retention heatmaps", "Marketing memos", "5-slide decks"],
    ["Build 4 KPI + 3 chart dashboard", "Build funnel chart with drop-offs", "Write 1-page memo", "Build 5-slide exec deck", "Practice 5-minute pitch"],
    "Olist Funnel v0.3 — full marketing deliverable set. Funnel chart, retention heatmap, memo, deck.",
    ["Add a 'sellers' perspective dashboard (which sellers have best/worst funnel)", "Add a 'by-state' dashboard view", "Estimate $ value of a 1pp lift in repeat rate"],
    ["Why does funnel analysis lie if you ignore time?", "What's a 'last-touch' attribution vs cohort retention?", "How would a real marketing director push back on your memo?"],
    ["Dashboard + memo + deck", "v0.3 tag"],
)

# Week 14: Ship + Project 3 done
DA_W14 = week(
    14, "Olist Funnel v1.0: Ship + retro", "Marketing", "10-15",
    "Polish, share, retro. Project 3 done.",
    [
        day(1, "Polish list", "", [reflect("10 rough edges", "List them.")]),
        day(2, "Fix top 5", "", [exercise("Polish", "Fix.")]),
        day(3, "SQL version", "", [exercise("queries.sql", "Re-do all major queries in SQLite Online. 10+ queries with comments.")]),
        day(4, "Demo video", "", [exercise("90-sec walkthrough", "Upload to YouTube unlisted.")]),
        day(5, "Polish memo + deck",
            "",
            [exercise("Final polish", "Make sure every chart has axis labels, every recommendation has a number.")]),
        day(6, "Get one reader", "", [exercise("Feedback", "Apply 1 piece of feedback.")]),
        day(7, "Tag v1.0 + retro", "",
            [
                exercise("Project 3 DONE",
                         "Write RETRO.md.\n"
                         "      git tag v1.0 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Polished\n"
                         "  ☐ queries.sql committed\n"
                         "  ☐ Demo video\n"
                         "  ☐ RETRO.md\n"
                         "  ☐ v1.0 tag\n\n"
                         "PROJECT 3 COMPLETE. Next: capstone — multi-source executive dashboard."),
            ]),
    ],
    ["Polishing marketing analytics", "SQL version of analysis", "Demo videos", "Project retros"],
    ["Polish", "Add SQL", "Record demo", "Get feedback", "Retro"],
    "Olist Funnel v1.0 — Project 3 done. Full polished deliverables + demo video + SQL version.",
    ["Post the funnel chart on LinkedIn", "Submit to /r/marketing for feedback", "Make a Kaggle notebook version"],
    ["What feedback hurt most?", "What would you do differently?", "Where do real e-commerce funnels differ from this one?"],
    ["v1.0 tag — PROJECT 3 DONE", "Demo video URL", "RETRO.md"],
)

# Week 15: Capstone — multi-source executive dashboard
DA_W15 = week(
    15, "Capstone v0.1: Multi-source dashboard scope", "Capstone", "10-15",
    "Final project. Combine 3 different real data sources into one executive dashboard for a fictional company. Project 4 spans W15-W18.",
    [
        day(1, "Capstone brief",
            "",
            [
                reflect("Pick the scenario",
                         "Pick ONE fictional company:\n  A. ForgeRetail — combine sales (Superstore-like) + customer (HR-like demographics) + reviews (Olist-like)\n  B. ForgeMedia — combine subscribers + content engagement + ad revenue\n  C. ForgeHealth — combine patient visits + outcomes + costs\n\nA is recommended — you already have similar data on disk. B and C need synthetic data."),
            ]),
        day(2, "Write the SPEC",
            "",
            [
                exercise("SPEC.md",
                         "Make repo forge-da-capstone/. SPEC.md:\n"
                         "      # Capstone\n"
                         "      ## Company\n  ForgeRetail (fictional)\n"
                         "      ## Audience\n  CEO + 4 VPs (Sales, Ops, Marketing, Finance)\n"
                         "      ## Dashboard pages\n"
                         "      1. Executive overview (1 page)\n"
                         "      2. Sales detail\n"
                         "      3. Customer / segment\n"
                         "      4. Operations\n"
                         "      ## Data sources\n  - sales.csv (Superstore-style)\n  - customers.csv (HR-style)\n  - reviews.csv (Olist-style)\n"
                         "      ## Definition of done\n  4-page dashboard + 1-page memo for CEO + 1 deck for board"),
            ]),
        day(3, "Build the synthetic dataset",
            "",
            [
                exercise("Combine + augment",
                         "Combine Sample Superstore + Olist + IBM HR slices:\n"
                         "  - Take 1000 Superstore orders as 'sales'\n"
                         "  - Take 200 Olist reviews as 'reviews', randomly link to sales\n"
                         "  - Take 100 IBM employees as 'staff', randomly link some sales to a salesperson\n"
                         "Save 3 CSVs in data/."),
            ]),
        day(4, "Schema diagram",
            "",
            [exercise("schema.png", "Draw how sales / customers / reviews / staff connect. Save as schema.png.")]),
        day(5, "Build the data model in Excel",
            "",
            [
                exercise("Data Model relationships",
                         "Open Excel. Power Pivot / Data Model. Add 3 tables. Define relationships (sales.customer_id → customers.id, etc).\n"
                         "OR use Google Sheets + VLOOKUP across sheets. Power Pivot is preferred."),
            ]),
        day(6, "First KPIs",
            "",
            [
                exercise("3 KPIs",
                         "Using the data model:\n"
                         "  - Total revenue\n"
                         "  - Avg review score\n"
                         "  - % sales tied to a staff member\n"
                         "These are the foundation."),
            ]),
        day(7, "Tag v0.1", "",
            [
                exercise("Acceptance v0.1",
                         "      git tag v0.1 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ SPEC.md\n"
                         "  ☐ 3 CSVs in data/\n"
                         "  ☐ Schema diagram\n"
                         "  ☐ Data model with relationships\n"
                         "  ☐ First 3 KPIs\n"
                         "  ☐ v0.1 tag"),
            ]),
    ],
    ["Capstone scoping", "Multi-source data merging", "Star-schema design", "Excel Power Pivot", "Cross-table KPIs"],
    ["Pick scenario + write SPEC.md", "Build synthetic 3-source dataset", "Draw schema diagram", "Build data model with relationships", "Compute first 3 cross-source KPIs"],
    "Capstone v0.1 — scoped + foundations built. 3 data sources merged into a data model. First KPIs computed across sources.",
    ["Add a 4th data source (e.g. weather)", "Try moving from Excel to Power BI for this", "Practice the 'audience' speech — who reads each page?"],
    ["What's the hardest part of merging 3 sources?", "Why is a SPEC critical for multi-page dashboards?", "What's a data model vs a flat table?"],
    ["v0.1 tag", "SPEC.md + schema.png", "3 CSVs + data model"],
)

# Week 16: Build pages 1-2
DA_W16 = week(
    16, "Capstone v0.2: Pages 1 + 2", "Capstone", "15-20",
    "Build the executive overview page and the sales detail page.",
    [
        day(1, "Page 1 layout", "",
            [
                reflect("Executive Overview",
                         "What's on the CEO's single-page view?\n  - 6 KPIs (revenue, growth, customer count, avg review, NPS, ops efficiency)\n  - 1 trend chart\n  - 1 segment-of-business breakdown chart")
            ]),
        day(2, "Build the KPI band", "",
            [
                exercise("6 cards in a row",
                         "Excel: insert 6 large text boxes. Each linked to a SUMIFS/COUNTIFS that computes the KPI from the data model.\n"
                         "Style: big number top, label below, micro-trend arrow if you can."),
            ]),
        day(3, "Trend chart", "",
            [exercise("Monthly revenue", "Pivot: rows = month, value = SUM revenue. Line chart on the dashboard. Compare vs LY.")]),
        day(4, "Segment breakdown", "",
            [exercise("Donut or bar", "Revenue by Segment (Consumer / Corporate / Home Office). Compact chart at bottom right of page.")]),
        day(5, "Page 2: Sales Detail", "",
            [
                exercise("Sales page layout",
                         "New sheet 'Sales'. 3-4 KPIs (avg order value, top product, top region). 2 charts (monthly trend by segment, top 10 sub-categories by margin). 1 table (top 20 orders by profit)."),
            ]),
        day(6, "Filter linking", "",
            [exercise("Cross-page filters", "Make a 'Region' filter on Page 1 that ALSO affects Page 2. Use slicers connected to the data model.")]),
        day(7, "Tag v0.2", "",
            [
                exercise("Acceptance v0.2",
                         "      git tag v0.2 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Page 1 with 6 KPIs + trend + segment chart\n"
                         "  ☐ Page 2 with 3-4 KPIs + 2 charts + 1 table\n"
                         "  ☐ Cross-page filter works\n"
                         "  ☐ v0.2 tag"),
            ]),
    ],
    ["Multi-page Excel dashboards", "KPI band design", "Cross-sheet data flow", "Slicer-based filtering", "Year-over-year comparisons"],
    ["Build Page 1 (Executive Overview)", "Build Page 2 (Sales Detail)", "Link a Region filter across both pages"],
    "Capstone v0.2 — Pages 1 and 2 built. Cross-page filtering works.",
    ["Add micro-trend arrows to each KPI", "Add conditional formatting where green/red flags an out-of-target KPI", "Add a comment column to the top-orders table"],
    ["Why do executives skim Page 1 and rarely click further?", "What's the difference between a slicer and a filter?", "How does a data model make multi-page filtering easier?"],
    ["Two pages working", "Cross-page filter", "v0.2 tag"],
)

# Week 17: Build pages 3-4
DA_W17 = week(
    17, "Capstone v0.3: Pages 3 + 4", "Capstone", "12-18",
    "Customer/Segment page + Operations page.",
    [
        day(1, "Page 3 — Customer", "",
            [
                exercise("Customer segment layout",
                         "New sheet. KPIs: total customers, repeat rate, top segment by revenue, top customer.\n"
                         "Charts: revenue per customer histogram, top 10 customers by lifetime sales, segment × profit cross-tab."),
            ]),
        day(2, "Cohort retention mini", "",
            [exercise("Embed simplified cohort", "Smaller version of Olist Project 3's cohort matrix. Just 6 months × 6 months.")]),
        day(3, "Page 4 — Operations", "",
            [
                exercise("Ops layout",
                         "KPIs: avg fulfillment time, avg review score, % late shipments.\n"
                         "Charts: review score distribution, fulfillment time by region."),
            ]),
        day(4, "Add an 'Alerts' section to Page 1", "",
            [
                exercise("Red flags",
                         "On Page 1, add a small text box: 'Alerts'. With formulas: IF(avg_review < 4, 'Reviews are dropping', '')\n"
                         "List 3-5 alert rules. They show only when triggered."),
            ]),
        day(5, "Unified filter panel", "",
            [exercise("All filters in one place", "On Page 1 right side: stack the 3-4 most-used filters (Region, Segment, Time period). All linked.")]),
        day(6, "Polish + branding", "",
            [exercise("Brand pass", "Pick 2 colors + 1 accent. Apply across all pages. Consistent font sizes (header 14, body 11, caption 9).")]),
        day(7, "Tag v0.3", "",
            [
                exercise("Acceptance v0.3",
                         "      git tag v0.3 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ All 4 pages exist + working\n"
                         "  ☐ Filters cross-link\n"
                         "  ☐ Alerts section on Page 1\n"
                         "  ☐ Visual consistency across pages\n"
                         "  ☐ v0.3 tag"),
            ]),
    ],
    ["Multi-page dashboard architecture", "Embedded cohort matrices", "Alert-rule design with IF formulas", "Branding + visual consistency"],
    ["Build Page 3 (Customer/Segment) with cohort matrix", "Build Page 4 (Operations)", "Add alert section to Page 1", "Build unified filter panel", "Polish branding"],
    "Capstone v0.3 — all 4 dashboard pages built + visually consistent + alert-driven.",
    ["Add a 5th page: 'Drill into one customer' for the customer success team", "Add a printable export-ready layout view", "Add scenario comparison (this quarter vs target)"],
    ["What's the trade-off of having 4 pages vs 1?", "Why is a unified filter panel better than per-page filters?", "What's an alert-rule and where would you misuse it?"],
    ["4 working pages", "v0.3 tag"],
)

# Week 18: Ship capstone + roadmap retro
DA_W18 = week(
    18, "Capstone v1.0: Ship + roadmap retro", "Capstone", "12-18",
    "Final week of 18. Ship the capstone. Roadmap retro.",
    [
        day(1, "Write the CEO memo", "",
            [
                exercise("CEO-Memo.docx",
                         "1 page. Headline. 4 findings (one per dashboard page). 3 recommendations. Export PDF."),
            ]),
        day(2, "Build the board deck", "",
            [exercise("8-slide board deck", "Cover slide + 4 finding slides + 1 recommendations + 1 next-quarter plan + 1 closing. Export PDF.")]),
        day(3, "Demo video", "", [exercise("3-minute walkthrough of all 4 pages", "Upload to YouTube unlisted.")]),
        day(4, "Add a SQL version of all KPIs", "",
            [exercise("queries.sql", "Re-do all KPIs in SQLite Online. 15+ queries covering every page.")]),
        day(5, "Polish + brand", "", [exercise("Final polish", "Every chart has labels. Every page has a footer with 'as of [date]'.")]),
        day(6, "Get 3 readers", "", [exercise("Feedback", "Apply common feedback.")]),
        day(7, "Tag v1.0 + ROADMAP RETRO", "",
            [
                exercise("DATA ANALYSIS ROADMAP COMPLETE",
                         "Write RETRO.md for the capstone.\n"
                         "Write ROADMAP_RETRO.md at the top level:\n"
                         "      # Forge Data Analysis Roadmap — Retro\n"
                         "      ## 4 projects shipped\n  1. Superstore\n  2. HR Attrition\n  3. Olist Funnel\n  4. ForgeRetail Capstone\n"
                         "      ## What I learned\n  ...\n"
                         "      ## What I'd do differently\n  ...\n"
                         "      ## Hardest week\n  ...\n"
                         "      ## Proudest moment\n  ...\n"
                         "      ## What's next\n  ...\n\n"
                         "      git tag v1.0 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Capstone memo PDF + board deck PDF\n"
                         "  ☐ Demo video\n"
                         "  ☐ queries.sql\n"
                         "  ☐ 3 readers' feedback applied\n"
                         "  ☐ RETRO.md + ROADMAP_RETRO.md\n"
                         "  ☐ v1.0 tag\n\n"
                         "DATA ANALYSIS ROADMAP COMPLETE. 4 named projects + capstone on your CV."),
            ]),
    ],
    ["CEO memos", "Board deck design", "Capstone-level polish", "Roadmap-level retrospectives"],
    ["Write CEO memo PDF", "Build 8-slide board deck PDF", "Record 3-min demo video", "Add SQL version of all KPIs", "Get 3 readers + apply feedback", "Write capstone + roadmap retros"],
    "Capstone v1.0 — Data Analysis roadmap complete. 4 named projects: Superstore, HR Attrition, Olist Funnel, ForgeRetail Capstone. CEO memo + board deck + demo video + SQL.",
    ["Apply to one analyst job using the portfolio", "Post the capstone on /r/dataanalysis", "Schedule a 30-min portfolio review with a working analyst"],
    ["Of the 4 projects, which one defends best in an interview?", "Which week stretched you most?", "If you started over, what would you change?"],
    ["v1.0 tag + ROADMAP COMPLETE", "All 4 projects in portfolio", "ROADMAP_RETRO.md"],
)


# ═══════════════════════════════════════════════════════════════════════
ROADMAPS = {
    "data-science": [DS_W5, DS_W6, DS_W7, DS_W8, DS_W9, DS_W10, DS_W11, DS_W12, DS_W13, DS_W14, DS_W15, DS_W16, DS_W17, DS_W18, DS_W19, DS_W20],
    "data-analysis": [DA_W5, DA_W6, DA_W7, DA_W8, DA_W9, DA_W10, DA_W11, DA_W12, DA_W13, DA_W14, DA_W15, DA_W16, DA_W17, DA_W18],
}


def apply():
    for slug, weeks in ROADMAPS.items():
        path = os.path.join(DATA_DIR, f"{slug}.json")
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        existing = data.get("weeks", [])
        for new_week in weeks:
            n = new_week["number"]
            replaced = False
            for i, w in enumerate(existing):
                if w.get("number") == n:
                    existing[i] = new_week
                    replaced = True
                    break
            if not replaced:
                existing.append(new_week)
        existing.sort(key=lambda w: w.get("number", 0))
        data["weeks"] = existing
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  OK {slug}: {len(weeks)} weeks rewritten ({weeks[0]['number']}-{weeks[-1]['number']})")


if __name__ == "__main__":
    apply()
