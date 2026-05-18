"""
4 bonus weeks across DS + DA. Inserted at correct pedagogical positions.

1. DS: SHAP / interpretability (after Reddit fine-tune)
2. DS: Cloud + BigQuery (after MLOps)
3. DA: dbt + Modern Data Stack (after Tableau)
4. DS + DA: Portfolio + interview prep (final week of each — applied to whatever
   the learner has shipped)
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


def week(title, phase, hours, context, days, topics, tasks, project, exercises, questions, outputs):
    return {
        "number": 0, "title": title, "phase": phase, "commitment_hours": hours,
        "context": context, "days": days, "topics": topics, "tasks": tasks,
        "project": project, "resources": [], "exercises": exercises,
        "questions": questions, "outputs": outputs,
    }


# ═══════════════════════════════════════════════════════════════════════
# DS: SHAP / interpretability — slotted between modelling + shipping
# ═══════════════════════════════════════════════════════════════════════
DS_SHAP = week(
    "Model interpretability with SHAP", "Modeling", "10-12",
    "A model that's 95% accurate is useless if you can't explain WHY it predicted what it did. Hiring managers in 2026 expect this. This week we use SHAP — the industry-standard tool — to explain your Reddit Sentiment model's predictions. By Sunday you'll know exactly which words drove every classification.",
    [
        day(1, "Why interpretability matters", "Watch and read — no coding today.",
            [
                video("SHAP explained simply (15 min)",
                      search("shap values explained beginner machine learning"),
                      15, "various",
                      "The clearest beginner intro on YouTube."),
                reflect("Where would explainability matter?",
                        "Write 3 real cases in notes.txt where a wrong prediction without explanation would cause big problems:\n"
                        "  1. A loan-approval model rejects someone — they have the legal right to know why\n"
                        "  2. A fraud-detection model flags a transaction — the bank needs to defend the flag\n"
                        "  3. A medical model predicts disease — doctors must know what feature drove it"),
            ]),
        day(2, "Install SHAP", "Set up the tool. No prior install needed.",
            [
                reading("SHAP documentation",
                        "https://shap.readthedocs.io/en/latest/",
                        "Click 'Open' to bookmark."),
                exercise("Install + verify",
                         "STEP 1 — Open the terminal where your reddit-sentiment project lives. (If you're new — that's Anaconda Prompt on Windows or Terminal on Mac.)\n\n"
                         "STEP 2 — Type these one at a time:\n"
                         "      cd Desktop/reddit-sentiment\n"
                         "      pip install shap\n"
                         "  YOU SHOULD SEE: 'Successfully installed shap-...' after about 30 seconds.\n\n"
                         "STEP 3 — Open Jupyter:\n"
                         "      jupyter notebook\n"
                         "  Create a new notebook called 08-interpret.ipynb.\n\n"
                         "STEP 4 — Test:\n"
                         "      import shap\n"
                         "      print('SHAP version:', shap.__version__)\n"
                         "  Press Shift+Enter.\n"
                         "  YOU SHOULD SEE: 'SHAP version: 0.x.x' (any 0.40+ works)."),
            ]),
        day(3, "Explain a simple classical model first", "Build intuition on TFIDF + LogReg before transformers.",
            [
                exercise("SHAP on your TFIDF baseline",
                         "In 08-interpret.ipynb:\n\n"
                         "CELL 1 — Load + retrain the baseline:\n"
                         "      import pandas as pd, joblib\n"
                         "      from sklearn.feature_extraction.text import TfidfVectorizer\n"
                         "      from sklearn.linear_model import LogisticRegression\n"
                         "      df = pd.read_csv('data/gold.csv')\n"
                         "      vec = TfidfVectorizer(max_features=500)\n"
                         "      X = vec.fit_transform(df['title'])\n"
                         "      m = LogisticRegression(max_iter=1000).fit(X, df['true_label'])\n\n"
                         "CELL 2 — Compute SHAP values:\n"
                         "      import shap\n"
                         "      explainer = shap.LinearExplainer(m, X)\n"
                         "      shap_values = explainer.shap_values(X[:50])\n"
                         "      print('Shape of SHAP values:', shap_values[0].shape)\n"
                         "  YOU SHOULD SEE: (50, 500) — one row per post, one column per word.\n\n"
                         "CELL 3 — Plot:\n"
                         "      import matplotlib.pyplot as plt\n"
                         "      shap.summary_plot(shap_values, X[:50].toarray(),\n"
                         "                        feature_names=vec.get_feature_names_out(),\n"
                         "                        plot_type='bar', max_display=15, show=False)\n"
                         "      plt.savefig('figures/shap_baseline.png', dpi=150, bbox_inches='tight')\n"
                         "      plt.show()\n"
                         "  YOU SHOULD SEE: a bar chart of the top 15 words driving predictions.\n\n"
                         "STEP — Write 2 sentences below the chart: which words push toward POSITIVE? toward NEGATIVE?"),
            ]),
        day(4, "Explain ONE prediction at a time", "The hiring-manager money question: WHY this single prediction?",
            [
                exercise("Force plot for one post",
                         "      idx = 5   # pick any row index\n"
                         "      print('Post:', df.iloc[idx]['title'])\n"
                         "      print('True label:', df.iloc[idx]['true_label'])\n"
                         "      print('Predicted:', m.predict(X[idx])[0])\n"
                         "      shap.initjs()\n"
                         "      shap.force_plot(explainer.expected_value[0], shap_values[0][idx],\n"
                         "                      vec.get_feature_names_out(), matplotlib=True, show=False)\n"
                         "      plt.savefig('figures/shap_single.png', dpi=150, bbox_inches='tight')\n"
                         "  YOU SHOULD SEE: a horizontal force plot — red words pushed toward the prediction, blue words pushed away.\n\n"
                         "Pick a post the model got WRONG. Explain why it failed using the force plot."),
            ]),
        day(5, "Explain the transformer (advanced)", "SHAP on your fine-tuned DistilBERT.",
            [
                video("SHAP for Transformers (10 min)",
                      search("shap transformers nlp tutorial"),
                      10, "various"),
                exercise("Transformer explanations",
                         "Note: this needs your fine-tuned model from Week 15.\n\n"
                         "      from transformers import pipeline\n"
                         "      clf = pipeline('text-classification', model='models/distilbert', return_all_scores=True)\n"
                         "      explainer = shap.Explainer(clf)\n"
                         "      texts = df['title'].head(10).tolist()\n"
                         "      shap_vals = explainer(texts)\n"
                         "      shap.plots.text(shap_vals[0])  # interactive HTML\n\n"
                         "If your computer is slow, skip the transformer part and stick with the LogReg version. That's enough for v0.1."),
            ]),
        day(6, "Find ONE bias your model has", "Honesty — every model is biased somewhere.",
            [
                exercise("Bias hunt",
                         "Look at your top SHAP words. Find ONE that's a proxy for something the model SHOULDN'T be using.\n\n"
                         "Examples of what to look for:\n"
                         "  - Words specific to one subreddit pushing a sentiment\n"
                         "  - Profanity flagged as NEGATIVE even when it's playful\n"
                         "  - Technical jargon being misread as NEGATIVE\n\n"
                         "Document ONE bias finding in BIASES.md with:\n"
                         "  - The biased feature/word\n"
                         "  - 2 example posts where it caused a wrong prediction\n"
                         "  - A proposed fix (data augmentation? feature removal? prompt change?)"),
            ]),
        day(7, "Tag interpret-w1 + ship", "Half of explainability is documentation.",
            [
                exercise("Acceptance — interpretability v0.1",
                         "STEP 1 — Add a section to your reddit-sentiment README called 'Explainability'. Include:\n"
                         "  - The SHAP summary plot (from Day 3)\n"
                         "  - The force plot (Day 4)\n"
                         "  - A 3-sentence summary of which features drive each class\n\n"
                         "STEP 2 — Push:\n"
                         "      git add . && git commit -m 'add SHAP interpretability + bias notes'\n"
                         "      git push\n\n"
                         "PASS:\n"
                         "  ☐ shap installed + working\n"
                         "  ☐ Global summary plot saved\n"
                         "  ☐ Single-prediction force plot saved\n"
                         "  ☐ One documented bias finding in BIASES.md\n"
                         "  ☐ README updated with explainability section\n"
                         "  ☐ Anyone reading the repo can see WHY the model decided"),
            ]),
    ],
    ["What model interpretability means + why it matters", "Installing SHAP", "Global feature importance with summary plots", "Per-prediction force plots", "Finding bias in real models", "Documenting explainability for non-technical readers"],
    ["Install SHAP + verify", "Run LinearExplainer on TFIDF baseline", "Generate summary bar plot", "Generate single-prediction force plot", "Find + document 1 model bias", "Push explainability artifacts to repo"],
    "Reddit-sentiment with explainability — every prediction now has a SHAP-backed 'why'. BIASES.md documents one real bias the learner found.",
    ["Try SHAP on FlightWise's XGBoost model too (TreeExplainer is faster)", "Compute SHAP for the 20 worst misclassifications", "Build a Streamlit page that shows SHAP per user input"],
    ["Why is SHAP better than just looking at feature importance from the model?", "When are SHAP values misleading?", "What's the trade-off between interpretable models and accurate ones?"],
    ["Updated README with explainability section", "BIASES.md", "2 SHAP plots committed (summary + force)"],
)


# ═══════════════════════════════════════════════════════════════════════
# DS: Cloud + BigQuery — slotted after MLOps
# ═══════════════════════════════════════════════════════════════════════
DS_CLOUD = week(
    "Cloud + BigQuery for Data Scientists", "Production", "10-12",
    "Real DS work moves to the cloud. AWS for storage, BigQuery for huge SQL queries. This week: get an AWS account, store your model + data on S3, then query the public NYC TLC dataset on BigQuery (it's free up to 1TB/month). By Sunday you've run SQL on a multi-billion-row dataset.",
    [
        day(1, "Why the cloud", "No installs today — just understand the picture.",
            [
                video("AWS in 10 minutes — Fireship",
                      yt("Z4AmZSm5OTI"), 10, "Fireship", ""),
                video("BigQuery explained (5 min)",
                      search("bigquery beginner 5 minutes"), 5, "various"),
                reflect("Two reasons",
                        "Why does real DS work need the cloud?\n"
                        "  1. Data too big for your laptop (NYC TLC = 50GB+, your laptop has limited RAM)\n"
                        "  2. Models too slow on your laptop (training + serving need GPUs/many CPUs)\n"
                        "Write your answer in notes.txt."),
            ]),
        day(2, "Set up AWS Free Tier (safely)", "The careful steps. Skip nothing.",
            [
                reading("AWS Free Tier signup",
                        "https://portal.aws.amazon.com/billing/signup",
                        "Click 'Open'. You need a credit card. Cost this week: $0 if you stay in free tier."),
                video("AWS account setup with MFA + billing alarm",
                      search("aws free tier safe setup mfa billing alarm 2024"),
                      15, "various",
                      "Watch BEFORE signing up. Important."),
                exercise("Safe AWS setup",
                         "STEP 1 — Sign up. Real email, real card. Choose 'Basic Support — Free'.\n\n"
                         "STEP 2 — Enable MFA (multi-factor authentication) on the root user.\n"
                         "  AWS Console → your name (top right) → Security credentials → MFA → Add.\n"
                         "  Use Google Authenticator or Authy on your phone.\n\n"
                         "STEP 3 — Set a billing alarm at $5.\n"
                         "  Console search 'CloudWatch' → Alarms → Create alarm → Billing → Total Estimated Charge → $5 threshold → notify your email.\n\n"
                         "STEP 4 — Create an IAM user for daily use (NEVER use root again).\n"
                         "  Console search 'IAM' → Users → Create user.\n"
                         "  Name: forge-dev. Attach policy: 'AmazonS3FullAccess' for this week.\n"
                         "  Create access key. Save Access Key ID + Secret Key in a password manager."),
            ]),
        day(3, "Upload your model to S3", "Cloud storage you control.",
            [
                exercise("Install AWS CLI + upload",
                         "STEP 1 — Install the AWS CLI on your computer:\n"
                         "  MAC: brew install awscli\n"
                         "  WINDOWS: download installer from https://aws.amazon.com/cli/\n"
                         "  LINUX: sudo apt install awscli OR follow official instructions\n\n"
                         "STEP 2 — Verify:\n"
                         "      aws --version\n"
                         "  YOU SHOULD SEE: 'aws-cli/2.x.x ...'\n\n"
                         "STEP 3 — Configure your IAM user:\n"
                         "      aws configure\n"
                         "  Paste your Access Key ID + Secret. Region: us-east-1. Output: json.\n\n"
                         "STEP 4 — Create a bucket (replace YOUR-NAME):\n"
                         "      aws s3 mb s3://YOUR-NAME-models-2026\n"
                         "  YOU SHOULD SEE: 'make_bucket: YOUR-NAME-models-2026'\n\n"
                         "STEP 5 — Upload your reddit-sentiment model:\n"
                         "      cd Desktop/reddit-sentiment\n"
                         "      aws s3 cp models/baseline.pkl s3://YOUR-NAME-models-2026/baseline.pkl\n"
                         "      aws s3 ls s3://YOUR-NAME-models-2026/\n"
                         "  YOU SHOULD SEE: your file listed."),
            ]),
        day(4, "Load model FROM S3 in code", "The whole point: anywhere your code runs, it can reach the model.",
            [
                exercise("boto3 load",
                         "      pip install boto3 joblib\n\n"
                         "      import boto3, joblib, tempfile\n"
                         "      s3 = boto3.client('s3')\n"
                         "      with tempfile.NamedTemporaryFile() as f:\n"
                         "          s3.download_file('YOUR-NAME-models-2026', 'baseline.pkl', f.name)\n"
                         "          model = joblib.load(f.name)\n"
                         "      print('Loaded model:', model)\n\n"
                         "Now your Flask/Streamlit/HF Spaces deployment can pull the model from S3 instead of bundling it in the container."),
            ]),
        day(5, "Set up BigQuery (free, no credit card)", "Google's serverless data warehouse.",
            [
                reading("Google Cloud Console",
                        "https://console.cloud.google.com",
                        "Click 'Open'. Sign in with a Google account. Create a new project named 'forge-bq'."),
                exercise("First BigQuery query",
                         "STEP 1 — In Google Cloud Console, search 'BigQuery'. Open it.\n\n"
                         "STEP 2 — Run your first query. Click 'New query', paste:\n"
                         "      SELECT COUNT(*) AS total_trips\n"
                         "      FROM `bigquery-public-data.new_york_taxi_trips.tlc_yellow_trips_2023`;\n\n"
                         "STEP 3 — Click Run.\n"
                         "  YOU SHOULD SEE: a count of ~38 million trips. You just queried 38M rows in 3 seconds.\n\n"
                         "Your laptop can never do this with pandas + a CSV. The cloud just did it in 3 seconds."),
            ]),
        day(6, "Run your TaxiPulse analysis at full scale", "All 38M rows, not just 3M sample.",
            [
                exercise("Full-scale Q1",
                         "Re-run your TaxiPulse 'busiest hour' question on the ENTIRE 2023 dataset:\n\n"
                         "      SELECT\n"
                         "        EXTRACT(HOUR FROM pickup_datetime) AS hour,\n"
                         "        COUNT(*) AS trips\n"
                         "      FROM `bigquery-public-data.new_york_taxi_trips.tlc_yellow_trips_2023`\n"
                         "      WHERE pickup_datetime IS NOT NULL\n"
                         "      GROUP BY hour\n"
                         "      ORDER BY trips DESC\n"
                         "      LIMIT 5;\n\n"
                         "Compare to your local sample answer. Same hour? Different?\n\n"
                         "Cost: ~$0.01 of your $300 free credits."),
            ]),
        day(7, "Tag cloud-aware + document", "Push proof you can work in production conditions.",
            [
                exercise("Acceptance — cloud v0.1",
                         "STEP 1 — Add CLOUD.md to your reddit-sentiment repo:\n"
                         "      # Cloud Setup\n"
                         "      \n"
                         "      ## S3 model storage\n"
                         "      Bucket: s3://YOUR-NAME-models-2026/\n"
                         "      Models: baseline.pkl, distilbert/\n"
                         "      \n"
                         "      ## BigQuery TaxiPulse at scale\n"
                         "      Re-ran the busiest-hour query on 38M rows. Result: hour XX:00 with YY,YYY,YYY trips.\n"
                         "      Cost: ~$0.01 in BigQuery.\n"
                         "      \n"
                         "      ## How to fork this work\n"
                         "      [step-by-step for someone reading your CV]\n\n"
                         "STEP 2 — Push:\n"
                         "      git add . && git commit -m 'add cloud setup notes + BigQuery scale-up'\n\n"
                         "PASS:\n"
                         "  ☐ AWS account with MFA + billing alarm + IAM dev user\n"
                         "  ☐ S3 bucket with at least 1 model uploaded\n"
                         "  ☐ Code that loads the model FROM S3 (not local)\n"
                         "  ☐ BigQuery project created\n"
                         "  ☐ Re-ran TaxiPulse Q1 on full 38M-row dataset\n"
                         "  ☐ CLOUD.md committed"),
            ]),
    ],
    ["Why DS needs the cloud", "AWS account hygiene (MFA, IAM, billing alarms)", "AWS CLI install + configure", "S3 bucket + uploading models", "Loading models from S3 in Python with boto3", "Google Cloud + BigQuery basics", "Querying public datasets at scale"],
    ["Sign up for AWS Free Tier safely", "Install + configure AWS CLI", "Upload a model to S3", "Load model from S3 in Python code", "Create a Google Cloud project + open BigQuery", "Re-run TaxiPulse Q1 on 38M-row public dataset", "Document setup in CLOUD.md"],
    "Cloud v0.1 — model in S3, code that pulls it down, BigQuery analysis at full data scale. Real production muscle on your CV.",
    ["Mount S3 as a fake filesystem with s3fs and load it like a local file", "Save your final FlightWise predictions to BigQuery", "Compute BigQuery cost for 3 different query patterns"],
    ["What's the difference between S3 (object storage) and a database?", "When does BigQuery beat your laptop's pandas?", "What's the AWS Free Tier cliff — when do you start paying?"],
    ["S3 bucket with model uploaded", "BigQuery project + 1 working query at scale", "CLOUD.md documenting setup"],
)


# ═══════════════════════════════════════════════════════════════════════
# DA: dbt + Modern Data Stack — slotted after Tableau
# ═══════════════════════════════════════════════════════════════════════
DA_DBT = week(
    "Modern Data Stack — dbt + BigQuery", "Modern Tools", "10-12",
    "Big companies don't run SQL queries from notebooks. They use dbt — a tool that turns SQL into version-controlled, tested, reusable models. Plus BigQuery as the warehouse. This week you set both up (free tier) and rebuild your Superstore analysis as dbt models. Modern analyst skill, +$20k on your CV.",
    [
        day(1, "What is dbt and why do analysts use it", "Watch and understand. No setup yet.",
            [
                video("dbt explained in 10 minutes",
                      search("dbt data build tool beginner 10 minutes"),
                      10, "various"),
                video("Modern data stack overview",
                      search("modern data stack 2024 explained"),
                      10, "various"),
                reflect("Three problems dbt solves",
                        "Write in notes.txt:\n"
                        "  1. 'I have 100 SQL queries in random files' — dbt makes them versioned + tested\n"
                        "  2. 'I copy-paste the same JOIN everywhere' — dbt lets you DEFINE a model once and reuse\n"
                        "  3. 'I don't know if my changes broke yesterday's reports' — dbt runs tests automatically"),
            ]),
        day(2, "Set up BigQuery (free)", "Google's data warehouse. No credit card needed.",
            [
                reading("Google Cloud Console",
                        "https://console.cloud.google.com",
                        "Click 'Open'. Sign in with any Google account. Free tier includes $300 in credits and 1TB/month of BigQuery queries forever."),
                exercise("Create a BigQuery project",
                         "STEP 1 — Sign in to console.cloud.google.com.\n\n"
                         "STEP 2 — Click the project dropdown (top, next to 'Google Cloud') → New Project.\n"
                         "  Name: forge-analytics. Click Create.\n\n"
                         "STEP 3 — Search 'BigQuery' in the top search bar. Open it.\n\n"
                         "STEP 4 — Run a free test query:\n"
                         "      SELECT 'Hello BigQuery' AS greeting;\n"
                         "  Click Run. YOU SHOULD SEE: 'Hello BigQuery' in 1 second."),
            ]),
        day(3, "Upload Superstore to BigQuery", "Your familiar data, now in the cloud.",
            [
                exercise("Convert + upload",
                         "STEP 1 — Convert your Superstore Excel to CSV.\n"
                         "  Open Sample - Superstore.xls. File → Save As → CSV. Save as orders.csv.\n\n"
                         "STEP 2 — In BigQuery, click the 3 dots next to your project name → Create dataset.\n"
                         "  Dataset ID: superstore. Location: US. Click Create.\n\n"
                         "STEP 3 — Click 3 dots next to your dataset → Create table.\n"
                         "  Source: Upload. File: orders.csv. Format: CSV. Table name: orders. Schema: Auto-detect. Create.\n"
                         "  Takes 10 seconds.\n\n"
                         "STEP 4 — Test:\n"
                         "      SELECT COUNT(*) FROM `forge-analytics.superstore.orders`;\n"
                         "  YOU SHOULD SEE: ~10000 rows."),
            ]),
        day(4, "Install dbt locally", "The tool itself, set up step by step.",
            [
                reading("dbt installation docs",
                        "https://docs.getdbt.com/docs/core/pip-install",
                        "Click 'Open'. Reference page."),
                exercise("Install dbt-bigquery",
                         "STEP 1 — Open your terminal (Anaconda Prompt on Windows, Terminal on Mac).\n\n"
                         "STEP 2 — Install (this includes the BigQuery adapter):\n"
                         "      pip install dbt-bigquery\n"
                         "  Takes ~1 minute.\n\n"
                         "STEP 3 — Verify:\n"
                         "      dbt --version\n"
                         "  YOU SHOULD SEE: 'Core: 1.x.x  Plugins: bigquery 1.x.x'.\n\n"
                         "STEP 4 — Initialize a new dbt project:\n"
                         "      cd Desktop\n"
                         "      dbt init forge_analytics\n"
                         "  It asks: which adapter? Type 1 (BigQuery).\n"
                         "  Project name: forge_analytics. Method: oauth.\n"
                         "  Project ID: forge-analytics (the one from BigQuery).\n"
                         "  Dataset: superstore. Threads: 1. Location: US. Job execution timeout: 300.\n\n"
                         "STEP 5 — Verify the connection:\n"
                         "      cd forge_analytics\n"
                         "      dbt debug\n"
                         "  YOU SHOULD SEE: 'All checks passed!'\n"
                         "  IF YOU SEE: 'authentication errors' — run 'gcloud auth application-default login' in a new tab, then retry."),
            ]),
        day(5, "Build your first dbt model", "SQL that's now tested + version-controlled.",
            [
                exercise("Margin model",
                         "STEP 1 — Open the forge_analytics folder in VS Code.\n"
                         "  Open models/example/. Delete the 2 sample files inside.\n\n"
                         "STEP 2 — Create a new file: models/example/sub_category_margin.sql\n"
                         "  Type:\n"
                         "      SELECT\n"
                         "        `Sub-Category` AS subcategory,\n"
                         "        SUM(Sales) AS total_sales,\n"
                         "        SUM(Profit) AS total_profit,\n"
                         "        SAFE_DIVIDE(SUM(Profit), SUM(Sales)) AS margin\n"
                         "      FROM {{ source('superstore', 'orders') }}\n"
                         "      GROUP BY 1\n\n"
                         "STEP 3 — Tell dbt where the source is. Create models/example/sources.yml:\n"
                         "      version: 2\n"
                         "      sources:\n"
                         "        - name: superstore\n"
                         "          tables:\n"
                         "            - name: orders\n\n"
                         "STEP 4 — Run:\n"
                         "      dbt run\n"
                         "  YOU SHOULD SEE: 'Completed successfully' and a new table in BigQuery.\n\n"
                         "STEP 5 — Verify in BigQuery console:\n"
                         "      SELECT * FROM `forge-analytics.superstore.sub_category_margin` ORDER BY margin DESC LIMIT 5;\n"
                         "  YOU SHOULD SEE: 5 rows of top-margin sub-categories."),
            ]),
        day(6, "Add tests + documentation", "What separates dbt from a script: tests that auto-run.",
            [
                exercise("Schema tests",
                         "STEP 1 — Create models/example/schema.yml:\n"
                         "      version: 2\n"
                         "      models:\n"
                         "        - name: sub_category_margin\n"
                         "          description: 'Profit margin per sub-category'\n"
                         "          columns:\n"
                         "            - name: subcategory\n"
                         "              tests:\n"
                         "                - unique\n"
                         "                - not_null\n"
                         "            - name: margin\n"
                         "              description: 'Profit / Sales'\n\n"
                         "STEP 2 — Run the tests:\n"
                         "      dbt test\n"
                         "  YOU SHOULD SEE: '2 tests passed'.\n\n"
                         "STEP 3 — Generate docs:\n"
                         "      dbt docs generate\n"
                         "      dbt docs serve\n"
                         "  Browser opens with a navigable diagram of your data + tests. This is what real analyst teams use."),
            ]),
        day(7, "Tag dbt-ready + commit", "Your modern stack project is shipped.",
            [
                reading("GitHub — create repository",
                        "https://github.com/new",
                        "Click 'Open'. Name: superstore-dbt. Public."),
                exercise("Acceptance — dbt v0.1",
                         "STEP 1 — Add a README.md at the top of forge_analytics/:\n"
                         "      # Superstore on the Modern Data Stack\n"
                         "      Same analysis as my Excel/Sheets Superstore project — now powered by BigQuery + dbt.\n"
                         "      \n"
                         "      ## Stack\n"
                         "      - Warehouse: BigQuery\n"
                         "      - Transformation: dbt\n"
                         "      - Models: 1 (sub_category_margin)\n"
                         "      - Tests: 2 passing (unique + not_null on subcategory)\n"
                         "      \n"
                         "      ## How to run\n"
                         "      pip install dbt-bigquery\n"
                         "      gcloud auth application-default login\n"
                         "      dbt run && dbt test\n\n"
                         "STEP 2 — Push:\n"
                         "      git init && git add . && git commit -m 'dbt v0.1: superstore on modern data stack'\n"
                         "      git remote add origin https://github.com/YOUR-USERNAME/superstore-dbt.git\n"
                         "      git push -u origin main\n\n"
                         "PASS:\n"
                         "  ☐ BigQuery project + dataset created\n"
                         "  ☐ Superstore data uploaded to BigQuery\n"
                         "  ☐ dbt installed + dbt debug passes\n"
                         "  ☐ At least 1 dbt model that runs successfully\n"
                         "  ☐ At least 2 tests passing\n"
                         "  ☐ dbt docs work locally\n"
                         "  ☐ Public GitHub repo named superstore-dbt"),
            ]),
    ],
    ["What dbt is + why modern teams use it", "BigQuery basics (free tier)", "Uploading CSV to BigQuery", "Installing dbt-bigquery", "dbt project structure (models, sources, schema)", "Writing testable SQL models", "Generating dbt docs"],
    ["Sign up for Google Cloud + create project", "Upload Superstore to BigQuery", "Install dbt-bigquery", "Initialize a dbt project", "Build one SQL model + run it", "Add unique + not_null tests", "Push to GitHub"],
    "superstore-dbt repo — same Superstore analysis rebuilt on a modern stack (BigQuery + dbt). Working tests + docs. Recruiters will know what this means.",
    ["Add a second model: regional_yoy_growth (using the SAME source)", "Add a custom test (margin must be between -1 and 1)", "Add docs + descriptions for every column"],
    ["Why is dbt different from just writing SQL scripts?", "Why do tests matter for analyst work?", "What's the relationship between dbt models and BigQuery tables?"],
    ["GitHub repo named superstore-dbt", "BigQuery dataset with the dbt-built table", "Tests passing", "Local dbt docs renderable"],
)


# ═══════════════════════════════════════════════════════════════════════
# SHARED: Portfolio + interview prep (final week — applied to whatever shipped)
# ═══════════════════════════════════════════════════════════════════════
def make_portfolio_week(discipline_name, project_names_csv):
    return week(
        "Portfolio + interview prep", "Wrap", "10-12",
        f"Final week. You've built {project_names_csv}. Now we package it for hiring managers. Polished portfolio site, LinkedIn-ready posts, interview answers practiced. By Sunday: you can hand someone your portfolio URL and they can see your work in 60 seconds.",
        [
            day(1, "Audit what you have",
                "Inventory everything before polishing.",
                [
                    exercise("Inventory list",
                             "Create PORTFOLIO.md at the top of your main work folder. List every project you shipped this roadmap:\n\n"
                             f"For {discipline_name}, that's:\n"
                             f"  {project_names_csv}\n\n"
                             "For each project, write 3 lines:\n"
                             "  1. One sentence: what does it do?\n"
                             "  2. One sentence: technologies used\n"
                             "  3. One sentence: who it would help / why it matters\n\n"
                             "Print this. Look at it. This is your CV section."),
                ]),
            day(2, "Buy a domain (optional but recommended)",
                "Real portfolios live on real domains. ~$10-15/year.",
                [
                    reading("Namecheap (cheap registrar)",
                            "https://www.namecheap.com",
                            "Click 'Open'. .com = ~$10/yr, .dev = ~$15/yr. Brand your domain like yourname.com or yourname-data.dev."),
                    exercise("Pick + buy",
                             "STEP 1 — Brainstorm 5 candidates with your name.\n"
                             "STEP 2 — Check availability on Namecheap.\n"
                             "STEP 3 — Buy ONE. If you can't afford it this week, skip — use a Netlify *.netlify.app subdomain for now."),
                ]),
            day(3, "Build a 1-page portfolio site",
                "Steal from your Edge Portfolio (DevOps Week 1) or use a free template.",
                [
                    reading("Astro portfolio templates (free)",
                            "https://astro.build/themes/?categories%5B%5D=portfolio",
                            "Click 'Open'. Pick one you like. Free."),
                    exercise("Build it",
                             "STEP 1 — Pick a template. Click 'Try It' → 'Open in Stackblitz' to see it live.\n"
                             "  Or download the template ZIP and extract it.\n\n"
                             "STEP 2 — Edit src/pages/index.astro (or equivalent). Replace placeholder content with YOUR:\n"
                             "  - Name + title (e.g. 'Data Scientist')\n"
                             "  - 2-paragraph bio\n"
                             "  - Each project: name, 1-line description, link to GitHub, link to live demo if any\n"
                             "  - Contact: GitHub link, email, LinkedIn\n\n"
                             "STEP 3 — Deploy on Netlify (drag the project folder onto netlify.app/drop).\n"
                             "  Get a URL.\n\n"
                             "STEP 4 — Point your custom domain if you bought one (Netlify → Site settings → Domain → Add)."),
                ]),
            day(4, "Write 3 LinkedIn posts about your projects",
                "One per project. Schedule them across 2 weeks.",
                [
                    exercise("3 posts",
                             f"For each of your top 3 projects in {discipline_name}, write a LinkedIn post:\n\n"
                             "STRUCTURE (~150 words):\n"
                             "  - Hook line: 'I just shipped [project name].'\n"
                             "  - 2-3 sentences on what it does + tech\n"
                             "  - 1 finding or surprising result (with a number)\n"
                             "  - Link to the repo + live demo\n"
                             "  - Question for engagement: 'What would you build next?'\n\n"
                             "Save all 3 in PORTFOLIO.md. Post one immediately. Schedule the others 5-7 days apart."),
                ]),
            day(5, "Update LinkedIn + GitHub profiles",
                "These will get checked before any interview.",
                [
                    exercise("Profile polish",
                             "LINKEDIN:\n"
                             f"  Headline: '{discipline_name} | Building [your domain interest] tools with [your top stack]'\n"
                             "  About: 2 paragraphs. What you build, what you're learning, what you want.\n"
                             "  Featured: pin the 4 project repos with screenshots.\n"
                             "  Experience: add 'Personal Projects' role with bullet points per project.\n\n"
                             "GITHUB:\n"
                             "  Profile README — clone github.com/yourname/yourname repo, write a clean README listing 4 projects.\n"
                             "  Pin the 4 project repos so they appear first on your profile.\n"
                             "  Make sure each repo has a working README + screenshot."),
                ]),
            day(6, "Practice 3 interview questions",
                "Aloud. To a recording.",
                [
                    exercise("Practice + record",
                             "Record yourself answering these 3 standard interview questions. 2 minutes each:\n\n"
                             "  1. 'Walk me through your favorite project — what did you build and why?'\n"
                             f"  2. 'What's the hardest problem you hit while learning {discipline_name}?'\n"
                             "  3. 'How would you approach a problem you've never solved before?'\n\n"
                             "Watch yourself back. List 3 verbal habits to fix. Re-record. Watch again."),
                ]),
            day(7, "Ship + apply",
                "Final acceptance — and a real application.",
                [
                    exercise("Apply to one job",
                             "STEP 1 — Find one entry-level job posting that matches your roadmap. Sites: LinkedIn, Indeed, Wellfound (formerly AngelList).\n\n"
                             "STEP 2 — Apply. Use your new portfolio URL + LinkedIn. Tailor the cover note in 3 sentences.\n\n"
                             "STEP 3 — Add the application to APPLICATIONS.md so you track responses.\n\n"
                             "PASS — Portfolio v1.0 ships when:\n"
                             "  ☐ PORTFOLIO.md with inventory of all your projects\n"
                             "  ☐ Live portfolio site at a URL (own domain or netlify.app)\n"
                             "  ☐ 3 LinkedIn posts written (at least 1 posted)\n"
                             "  ☐ LinkedIn profile updated with Featured projects\n"
                             "  ☐ GitHub profile README + pinned repos\n"
                             "  ☐ 3 interview questions practiced + recorded\n"
                             "  ☐ At least 1 real job application submitted"),
                    reflect("What's next",
                            "Write 2 sentences in notes.txt:\n"
                            "  1. What's the next skill you want to learn after this roadmap?\n"
                            "  2. What's your ideal first job in 6 months?"),
                ]),
        ],
        ["Portfolio site basics", "LinkedIn optimization for analysts/data scientists", "GitHub profile + pinned repos", "Writing LinkedIn posts about projects", "Interview answer practice", "Submitting real applications"],
        ["Inventory all your shipped projects", "Set up a portfolio site (free or custom domain)", "Write 3 LinkedIn posts (one per top project)", "Update LinkedIn + GitHub profiles", "Practice 3 interview questions on video", "Submit at least 1 real job application"],
        "Portfolio v1.0 — live portfolio site, polished LinkedIn + GitHub, 3 prepared posts, recorded practice answers, 1 application submitted. Career runway built.",
        ["Reach out to 3 working professionals on LinkedIn for 15-min chats", "Submit one project to /r/dataisbeautiful or /r/MachineLearning", "Schedule a mock interview with a friend"],
        ["What's the difference between a hobbyist and a hireable candidate?", "Why does sending applications matter even when you're not 'ready'?", "What's your honest weakest project — and what would make it stronger?"],
        ["Live portfolio URL", "Polished LinkedIn + GitHub profiles", "3 LinkedIn posts written", "Practice interview video", "At least 1 job application submitted"],
    )


DS_PORTFOLIO = make_portfolio_week(
    "Data Science",
    "TaxiPulse NYC, Reddit Sentiment, Energy Forecast, your Capstone"
)

DA_PORTFOLIO = make_portfolio_week(
    "Data Analysis",
    "Sample Superstore, HR Attrition, Olist Funnel, ForgeRetail Capstone"
)


# ═══════════════════════════════════════════════════════════════════════
# Splice the 4 bonus weeks
# ═══════════════════════════════════════════════════════════════════════

def splice(slug, plan):
    """Apply a sequence plan that mixes existing + new weeks."""
    path = os.path.join(DATA_DIR, f"{slug}.json")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    existing = {w["number"]: w for w in data.get("weeks", [])}

    new_weeks = []
    for new_num, (kind, ref) in enumerate(plan, start=1):
        if kind == "existing":
            w = existing.get(ref)
            if not w:
                print(f"  -- skip {slug}: existing W{ref} missing")
                continue
            w["number"] = new_num
            new_weeks.append(w)
        else:
            w = dict(ref)
            w["number"] = new_num
            new_weeks.append(w)

    data["weeks"] = new_weeks
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  OK {slug}: now {len(new_weeks)} weeks")


# DS current: 28 weeks. Inserting SHAP after W15 (Reddit fine-tune), Cloud after
# MLOps (W24), Portfolio as final. Result: 31 weeks.
DS_PLAN = (
    [("existing", i) for i in range(1, 16)] +   # W1-W15: unchanged
    [("new", DS_SHAP)] +                          # NEW W16: SHAP interpretability
    [("existing", i) for i in range(16, 25)] +   # was W16-W24
    [("new", DS_CLOUD)] +                         # NEW W25: Cloud + BigQuery
    [("existing", i) for i in range(25, 29)] +   # was W25-W28
    [("new", DS_PORTFOLIO)]                       # NEW W31: Portfolio + interview prep
)

# DA current: 25 weeks. Inserting dbt after W20 (Tableau), Portfolio as final.
DA_PLAN = (
    [("existing", i) for i in range(1, 21)] +   # W1-W20: unchanged
    [("new", DA_DBT)] +                           # NEW W21: dbt + BigQuery
    [("existing", i) for i in range(21, 26)] +   # was W21-W25
    [("new", DA_PORTFOLIO)]                       # NEW W27: Portfolio + interview prep
)


if __name__ == "__main__":
    splice("data-science", DS_PLAN)
    splice("data-analysis", DA_PLAN)
