"""Weeks 2-4 for Data Science, Data Analysis, BI Analytics."""

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


def base_week(num, title, phase, hours, context, days, topics, tasks, project, exercises, questions, outputs):
    return {
        "number": num, "title": title, "phase": phase, "commitment_hours": hours,
        "context": context, "days": days, "topics": topics, "tasks": tasks,
        "project": project, "resources": [], "exercises": exercises,
        "questions": questions, "outputs": outputs,
    }


# ═══════════════════════════════════════════════════════════════════════
# DATA SCIENCE — TaxiPulse Weeks 2-4
# ═══════════════════════════════════════════════════════════════════════
DS_W2 = base_week(
    2, "TaxiPulse v0.2: Borough breakdown + multi-month", "Foundation", "12-18",
    "Last week was October only. This week add 2 more months of data and break results down by borough — see how patterns differ across the city.",
    [
        day(1, "What's a borough?",
            "NYC has 5: Manhattan, Brooklyn, Queens, Bronx, Staten Island. The taxi data uses pickup location IDs.",
            [
                reading("NYC TLC Taxi Zone Lookup",
                        "https://d37ci6vzurychx.cloudfront.net/misc/taxi_zone_lookup.csv",
                        "Click 'Open' to download a small CSV that maps LocationID to Borough + Zone."),
                reflect("Hypotheses",
                        "Which borough do you think:\n  1. Has the busiest hour LATEST in the day?\n  2. Has the highest average fare?\n  3. Tips the most?\nWrite your guesses."),
            ]),
        day(2, "Load the lookup",
            "",
            [
                exercise("Join zone data",
                         "Save taxi_zone_lookup.csv into your taxipulse/data/ folder.\n\n"
                         "In a new notebook 06-borough.ipynb:\n"
                         "      import pandas as pd\n"
                         "      df = pd.read_parquet('data/clean.parquet')\n"
                         "      zones = pd.read_csv('data/taxi_zone_lookup.csv')\n"
                         "      df = df.merge(zones[['LocationID','Borough']], left_on='PULocationID', right_on='LocationID')\n"
                         "      df = df.rename(columns={'Borough':'pickup_borough'})\n"
                         "      print(df['pickup_borough'].value_counts())"),
            ]),
        day(3, "Plot busy hour by borough",
            "",
            [
                exercise("Multi-borough chart",
                         "      import matplotlib.pyplot as plt\n"
                         "      for b in ['Manhattan','Brooklyn','Queens','Bronx','Staten Island']:\n"
                         "          sub = df[df['pickup_borough'] == b]\n"
                         "          by_hour = sub.groupby('pickup_hour').size()\n"
                         "          by_hour.plot(label=b)\n"
                         "      plt.title('Trips by hour, by borough')\n"
                         "      plt.legend(); plt.savefig('hour_by_borough.png'); plt.show()"),
            ]),
        day(4, "Download Sept + Nov data",
            "",
            [
                reading("Sept 2023 Yellow Taxi",
                        "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2023-09.parquet",
                        "Click 'Open' to download."),
                reading("Nov 2023 Yellow Taxi",
                        "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2023-11.parquet",
                        "Click 'Open' to download."),
                exercise("Concat 3 months",
                         "Save both to data/. In a new notebook:\n"
                         "      sept = pd.read_parquet('data/yellow_tripdata_2023-09.parquet')\n"
                         "      oct = pd.read_parquet('data/taxi.parquet')\n"
                         "      nov = pd.read_parquet('data/yellow_tripdata_2023-11.parquet')\n"
                         "      df3 = pd.concat([sept, oct, nov])\n"
                         "      print(len(df3))  # about 10M rows\n\n"
                         "Run the same cleaning steps. Save as data/q4_2023.parquet."),
            ]),
        day(5, "Trip count over 3 months",
            "",
            [
                exercise("Daily series",
                         "      df3['date'] = df3['tpep_pickup_datetime'].dt.date\n"
                         "      daily = df3.groupby('date').size()\n"
                         "      daily.plot(figsize=(12,4), title='NYC Yellow Taxi trips per day, Q4 2023')\n"
                         "      plt.savefig('daily_q4.png')\n"
                         "Look for the dip on Thanksgiving + Halloween."),
            ]),
        day(6, "Add to final report",
            "",
            [
                exercise("Update TaxiPulse-Final",
                         "Add a new section '## Borough breakdown' with the hour-by-borough chart. Add '## Q4 trend' with the daily chart. Update TL;DR to mention any cross-month finding."),
            ]),
        day(7, "Tag v0.2",
            "",
            [
                exercise("Acceptance v0.2",
                         "      git add . && git commit -m 'v0.2: borough breakdown + 3 months'\n"
                         "      git tag v0.2 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Borough lookup joined\n"
                         "  ☐ Hour-by-borough chart saved\n"
                         "  ☐ Q4 daily series chart saved\n"
                         "  ☐ Final notebook updated\n"
                         "  ☐ v0.2 tag"),
            ]),
    ],
    ["Merging on foreign keys (LocationID → Borough)", "Multi-borough comparison plots", "Concatenating multiple parquet files", "Daily time series visualization", "Updating a publishable notebook iteratively"],
    ["Download the TLC zone lookup CSV", "Merge zone data into your trips dataframe", "Plot trips-by-hour for each borough", "Download Sept and Nov 2023 parquets and concat", "Plot daily trip volume across Q4", "Update TaxiPulse-Final.ipynb"],
    "TaxiPulse v0.2 — same analysis extended to 3 months (Q4 2023) and broken down by borough. Updated publishable notebook.",
    ["Plot tip% by borough", "Find the single day in Q4 with the fewest trips — what happened?", "Build a heatmap of trips by hour × day-of-week", "Compare weekday vs weekend traffic by borough"],
    ["What's a foreign key in a merge?", "Why concat 3 files instead of redownloading one big file?", "How big is the .parquet vs the equivalent CSV?", "When is more data NOT better?"],
    ["Updated TaxiPulse-Final.ipynb with borough section", "data/q4_2023.parquet (gitignored)", "2 new figures committed", "v0.2 tag"],
)

DS_W3 = base_week(
    3, "TaxiPulse v0.3: Predict the fare", "Foundation", "12-18",
    "You've described the data. Now predict from it. This week you train your first regression model to predict trip fare from distance + duration.",
    [
        day(1, "Regression vs classification",
            "",
            [
                video("Linear regression in 15 minutes",
                      search("linear regression beginner 15 minutes"), 15, "various"),
                reflect("Pick predictors",
                        "To predict fare_amount, which features do you think matter most?\n"
                        "  - trip_distance (obviously)\n"
                        "  - trip_minutes (yes — time-based pricing)\n"
                        "  - pickup_hour (peak hours?)\n"
                        "  - pickup_borough\n"
                        "  - passenger_count?"),
            ]),
        day(2, "Build training data",
            "",
            [
                exercise("Prep X and y",
                         "In new notebook 07-fare-model.ipynb:\n"
                         "      import pandas as pd\n"
                         "      from sklearn.model_selection import train_test_split\n"
                         "      df = pd.read_parquet('data/clean.parquet')\n"
                         "      # Drop obvious leakers\n"
                         "      df = df.dropna(subset=['fare_amount','trip_distance','trip_minutes'])\n"
                         "      y = df['fare_amount']\n"
                         "      X = df[['trip_distance','trip_minutes','pickup_hour']]\n"
                         "      X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)"),
            ]),
        day(3, "Train linear regression",
            "",
            [
                exercise("First model",
                         "      from sklearn.linear_model import LinearRegression\n"
                         "      from sklearn.metrics import mean_absolute_error, r2_score\n"
                         "      m = LinearRegression()\n"
                         "      m.fit(X_train, y_train)\n"
                         "      pred = m.predict(X_test)\n"
                         "      print('MAE:', mean_absolute_error(y_test, pred))\n"
                         "      print('R2:', r2_score(y_test, pred))\n"
                         "      print('Coefficients:')\n"
                         "      for c, v in zip(X.columns, m.coef_):\n"
                         "          print(f'  {c}: {v:.3f}')"),
            ]),
        day(4, "Interpret coefficients",
            "",
            [
                exercise("What do the numbers say?",
                         "In a markdown cell write:\n"
                         "  - The model says each mile adds $X to the fare.\n"
                         "  - Each minute adds $Y.\n"
                         "  - Hour-of-day adds/subtracts $Z (probably ~0 — linear regression sees this as continuous).\n\n"
                         "Is this consistent with the real NYC taxi rate? (Look up the official base + per-mile rates.)"),
            ]),
        day(5, "Try gradient boosting",
            "",
            [
                exercise("XGBoost regression",
                         "      from xgboost import XGBRegressor\n"
                         "      m2 = XGBRegressor(n_estimators=100, max_depth=5)\n"
                         "      m2.fit(X_train, y_train)\n"
                         "      print('XGB MAE:', mean_absolute_error(y_test, m2.predict(X_test)))\n"
                         "Which is better — linear or XGBoost?"),
            ]),
        day(6, "Plot residuals",
            "",
            [
                exercise("Where is the model wrong?",
                         "      import matplotlib.pyplot as plt\n"
                         "      resid = y_test - m.predict(X_test)\n"
                         "      plt.scatter(y_test, resid, alpha=0.05)\n"
                         "      plt.axhline(0, color='red')\n"
                         "      plt.xlabel('Actual fare'); plt.ylabel('Residual')\n"
                         "      plt.title('Residuals — linear model'); plt.savefig('residuals.png')\n"
                         "Are residuals symmetric around 0? Heteroscedastic (variance grows with fare)?"),
            ]),
        day(7, "Tag v0.3",
            "",
            [
                exercise("Acceptance v0.3",
                         "Add a '## Fare model' section to the final notebook. Save the better model.\n"
                         "      git add . && git commit -m 'v0.3: fare regression model'\n"
                         "      git tag v0.3 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Linear + XGBoost both trained\n"
                         "  ☐ MAE < $5 on test\n"
                         "  ☐ Coefficients interpreted\n"
                         "  ☐ Residual plot saved\n"
                         "  ☐ v0.3 tag"),
            ]),
    ],
    ["Regression vs classification", "Linear regression with sklearn", "Mean Absolute Error + R²", "Interpreting linear coefficients", "XGBoost regressor", "Residual analysis"],
    ["Pick features for fare prediction", "Train LinearRegression baseline", "Interpret coefficients against real NYC rates", "Train XGBoost regressor for comparison", "Plot residuals to spot where the model fails"],
    "TaxiPulse v0.3 — predicts trip fare from distance + duration + hour. Linear and XGBoost compared. MAE < $5 on test set.",
    ["Add passenger_count as a feature — does it help?", "Build a model just for trips inside Manhattan", "Try predicting tip_amount instead of fare_amount", "Find 5 test rows the model is hugely wrong on and inspect why"],
    ["Why is fare easier to predict than delay?", "What does R² of 0.85 mean?", "Why are residuals heteroscedastic for fares?", "How would a regulator misuse a fare model?"],
    ["Two models trained + compared", "Residual plot in figures/", "Fare model section in the publishable notebook", "v0.3 tag"],
)

DS_W4 = base_week(
    4, "TaxiPulse v0.4: Deploy a fare-predictor API", "Foundation", "12-18",
    "Last week's model lives in a notebook. This week wrap it in a tiny Flask API and deploy on Render. Anyone can hit POST /predict.",
    [
        day(1, "Why deploy",
            "",
            [
                video("Flask in 100 seconds — Fireship",
                      search("flask 100 seconds fireship"), 3, "Fireship", ""),
                reflect("API contract",
                        "What does POST /predict look like?\n"
                        "  Body: { distance, duration_min, hour }\n"
                        "  Response: { predicted_fare: 24.50 }"),
            ]),
        day(2, "Save the model",
            "",
            [
                exercise("Persist with joblib",
                         "In your notebook:\n"
                         "      import joblib\n"
                         "      joblib.dump(m2, 'fare_model.pkl')  # save XGBoost\n\n"
                         "      # Quick test loading it:\n"
                         "      loaded = joblib.load('fare_model.pkl')\n"
                         "      print(loaded.predict([[5.2, 18, 14]]))  # 5.2 miles, 18 min, 2pm"),
            ]),
        day(3, "Flask app",
            "",
            [
                exercise("app.py",
                         "Create app.py in your project root:\n"
                         "      from flask import Flask, request, jsonify\n"
                         "      import joblib\n"
                         "      app = Flask(__name__)\n"
                         "      m = joblib.load('fare_model.pkl')\n\n"
                         "      @app.route('/predict', methods=['POST'])\n"
                         "      def predict():\n"
                         "          d = request.get_json()\n"
                         "          try:\n"
                         "              pred = float(m.predict([[d['distance'], d['duration_min'], d['hour']]])[0])\n"
                         "              return jsonify({'predicted_fare': round(pred, 2)})\n"
                         "          except Exception as e:\n"
                         "              return jsonify({'error': str(e)}), 400\n\n"
                         "      if __name__ == '__main__':\n"
                         "          app.run(debug=True, port=5000)\n\n"
                         "Run: python app.py. Test:\n"
                         "      curl -X POST localhost:5000/predict -H 'Content-Type: application/json' \\\n"
                         "        -d '{\"distance\":5.2,\"duration_min\":18,\"hour\":14}'"),
            ]),
        day(4, "Add /health endpoint",
            "",
            [
                exercise("Health check",
                         "      @app.route('/health')\n"
                         "      def health():\n"
                         "          return jsonify({'status':'ok'})\n\n"
                         "Test: curl localhost:5000/health"),
            ]),
        day(5, "Requirements + gunicorn",
            "",
            [
                exercise("Production-ready",
                         "      pip freeze | grep -E 'flask|xgboost|scikit|joblib|gunicorn' > requirements.txt\n"
                         "      pip install gunicorn\n"
                         "      # Test gunicorn:\n"
                         "      gunicorn app:app --bind 0.0.0.0:5000\n"
                         "      curl localhost:5000/health"),
            ]),
        day(6, "Deploy on Render",
            "",
            [
                reading("Render — sign up",
                        "https://render.com", "Free tier hosting."),
                exercise("Deploy",
                         "Push the project to a NEW GitHub repo `taxipulse-api`. Include app.py, fare_model.pkl, requirements.txt.\n\n"
                         "On Render → New Web Service → connect repo. Build: pip install -r requirements.txt. Start: gunicorn app:app.\n\n"
                         "Deploy. You get a URL. Test:\n"
                         "      curl -X POST https://taxipulse-xxx.onrender.com/predict -H 'Content-Type: application/json' -d '{\"distance\":5,\"duration_min\":15,\"hour\":12}'"),
            ]),
        day(7, "Tag v0.4",
            "",
            [
                exercise("Acceptance v0.4",
                         "      git add . && git commit -m 'v0.4: fare API on Render'\n"
                         "      git tag v0.4 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Flask API works locally\n"
                         "  ☐ Live Render URL responds to POST /predict\n"
                         "  ☐ /health returns 200\n"
                         "  ☐ README of the new repo documents the API\n"
                         "  ☐ v0.4 tag"),
            ]),
    ],
    ["Saving sklearn/xgboost models with joblib", "Flask app structure", "JSON request handling", "Health check endpoints", "Gunicorn production server", "Deploying to Render"],
    ["Save fare model with joblib", "Write Flask app with /predict and /health", "Add gunicorn + requirements.txt", "Deploy to Render with a live URL"],
    "TaxiPulse v0.4 — fare-predictor wrapped in a Flask API, gunicorn-served, deployed to Render. Live POST /predict endpoint.",
    ["Add input validation: distance must be positive, hour must be 0-23", "Add a /batch endpoint that takes a list of trips", "Log every prediction with timestamp", "Add API key auth"],
    ["Why use gunicorn instead of just flask run?", "Why does Render spin down free apps?", "What happens if the model file is missing on startup?", "Why is JSON better than form-data for this API?"],
    ["Live Render URL", "taxipulse-api repo public", "v0.4 tag"],
)


# ═══════════════════════════════════════════════════════════════════════
# DATA ANALYSIS — Superstore Weeks 2-4
# ═══════════════════════════════════════════════════════════════════════
DA_W2 = base_week(
    2, "Superstore v0.2: Discount-vs-Profit deep dive", "Foundation", "10-15",
    "Last week you answered 3 broad questions. This week dig into ONE: does discounting actually grow profit, or eat it? Build a real scatter + segment table.",
    [
        day(1, "What's the discount-profit relationship?",
            "",
            [
                reflect("Hypothesis",
                        "Before you look — do you think more discount = more profit, or less? Think: discount drives sales, but it cuts margins. Write your guess."),
            ]),
        day(2, "Scatter plot — Discount vs Profit",
            "",
            [
                exercise("Excel/Sheets scatter",
                         "On the Orders sheet, with all rows visible:\n"
                         "  Select two columns: Discount and Profit.\n"
                         "  Insert → Chart → Scatter (X-Y).\n"
                         "  YOU SHOULD SEE: a cloud of points. Most are clustered around 0% discount with small profits.\n"
                         "  Save as chart in a sheet called Scatter."),
            ]),
        day(3, "Bin discount into buckets",
            "",
            [
                exercise("Discount buckets",
                         "In a helper column on Orders, add 'Discount Bucket':\n"
                         "      =IF(O2=0, \"0%\", IF(O2<=0.1, \"0-10%\", IF(O2<=0.2, \"10-20%\", IF(O2<=0.4, \"20-40%\", \"40%+\"))))\n\n"
                         "Pivot: Rows = Discount Bucket. Values = SUM Profit, COUNT, AVG Discount, AVG Profit.\n"
                         "What pattern do you see? Where does profit go negative?"),
            ]),
        day(4, "Break down by Category",
            "",
            [
                exercise("Cross-section",
                         "New pivot. Rows = Category, Columns = Discount Bucket, Values = SUM Profit.\n"
                         "Color-code red where the value is negative.\n"
                         "Which category tolerates discounts? Which is destroyed by them?"),
            ]),
        day(5, "Find the 'tipping point' discount",
            "",
            [
                exercise("Sweet spot",
                         "Plot a line chart: x = Discount Bucket (in order), y = AVG Profit. Where does the line cross zero? That's the danger zone."),
            ]),
        day(6, "Update the memo",
            "",
            [
                exercise("Memo v2",
                         "Add a 4th section to your Superstore Memo PDF:\n"
                         "      ## Discount strategy\n"
                         "      Headline: Discounts above XX% destroy profit in [Category Y].\n"
                         "      Recommendation: Cap discounts at XX% for Category Y.\n"
                         "Re-export PDF."),
            ]),
        day(7, "Tag v0.2",
            "",
            [
                exercise("Acceptance v0.2",
                         "      git add . && git commit -m 'v0.2: discount-profit deep dive'\n"
                         "      git tag v0.2 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Scatter plot saved\n"
                         "  ☐ Discount bucket pivot built\n"
                         "  ☐ Category × Bucket cross-pivot built\n"
                         "  ☐ Memo PDF v2 includes discount strategy section\n"
                         "  ☐ v0.2 tag"),
            ]),
    ],
    ["Scatter plots for correlation", "Bucketing continuous variables with nested IF", "Cross-tabulation pivots", "Conditional formatting for sign (red/green)", "Identifying tipping points in line charts", "Iterating analyst memos"],
    ["Build Discount-vs-Profit scatter plot", "Bucket Discount into 5 ranges", "Cross-tab Category × Discount Bucket", "Find the discount tipping point", "Update memo PDF with the discount section"],
    "Superstore v0.2 — Discount-vs-Profit analysis. Specific finding: which category dies at what discount level. Updated 2-page memo.",
    ["Re-run the analysis for just the latest year — has the relationship changed?", "Plot a 3D scatter: Discount × Profit × Quantity", "Identify the worst single order by Profit — what happened?"],
    ["What's the difference between correlation and causation here?", "Why bucket discount instead of using raw %?", "Which test would prove a tipping point statistically?", "Where could your memo be wrong?"],
    ["Memo v2 PDF", "New pivots + scatter", "v0.2 tag"],
)

DA_W3 = base_week(
    3, "Superstore v0.3: Customer lifetime value", "Foundation", "10-15",
    "Today: who are your most valuable customers and what do they have in common?",
    [
        day(1, "What is CLV",
            "",
            [
                video("Customer lifetime value explained (10 min)",
                      search("customer lifetime value explained beginner"),
                      10, "various"),
                reflect("Why does it matter?",
                        "If 10% of customers drive 60% of revenue, what should marketing focus on?"),
            ]),
        day(2, "Compute CLV per customer",
            "",
            [
                exercise("CLV pivot",
                         "New pivot from Orders:\n"
                         "  Rows: Customer ID\n"
                         "  Values: SUM Sales, COUNT Orders, AVG Profit, SUM Profit\n"
                         "  Filter: Top 100 by SUM Sales\n"
                         "Sort by SUM Sales descending.\n"
                         "Who's #1? What do they buy?"),
            ]),
        day(3, "Segment by spend",
            "",
            [
                exercise("CLV buckets",
                         "Add a 'CLV Bucket' column for each customer:\n"
                         "  >$5000 = VIP\n"
                         "  $1000-$5000 = Regular\n"
                         "  <$1000 = Casual\n"
                         "Pivot: Rows = CLV Bucket. Values = COUNT customers, SUM Sales, SUM Profit, AVG Profit Margin.\n"
                         "Pareto check: VIPs are X% of customers but Y% of sales?"),
            ]),
        day(4, "What do VIPs buy?",
            "",
            [
                exercise("Category by segment",
                         "New pivot. Filter to VIPs only. Rows = Sub-Category. Values = SUM Sales.\n"
                         "Sort. Compare to the same pivot for Casuals — what's different?"),
            ]),
        day(5, "Retention",
            "",
            [
                exercise("Repeat-buyer rate",
                         "Add a helper column on Orders: 'Customer Order #' using COUNTIFS on the rows ABOVE (this counts how many prior orders this customer has).\n"
                         "Pivot: Rows = Customer Order # (1, 2, 3, ...). Values = COUNT of customer IDs.\n"
                         "Plot the decay — what % of buyers come back for a 2nd order? 5th?"),
            ]),
        day(6, "Update the memo",
            "",
            [
                exercise("Memo v3",
                         "Add a 5th section to your memo PDF:\n"
                         "      ## Customer analysis\n"
                         "      - VIPs are X% of customers but drive Y% of revenue\n"
                         "      - Top VIP buys mostly [categories]\n"
                         "      - Repeat-buyer rate from 1st to 2nd order is Z%\n"
                         "      Recommendation: VIP loyalty program at $5k threshold."),
            ]),
        day(7, "Tag v0.3",
            "",
            [
                exercise("Acceptance v0.3",
                         "      git add . && git commit -m 'v0.3: customer lifetime value'\n"
                         "      git tag v0.3 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ CLV pivot top 100 built\n"
                         "  ☐ CLV bucket segmentation done\n"
                         "  ☐ Repeat-buyer chart\n"
                         "  ☐ Memo v3 with customer analysis section\n"
                         "  ☐ v0.3 tag"),
            ]),
    ],
    ["Customer lifetime value basics", "Pareto principle (80/20)", "Segmentation by spend bucket", "Cohort-style retention analysis", "Cross-segment behaviour comparison"],
    ["Compute CLV per customer (top 100)", "Segment customers into VIP / Regular / Casual", "Compare what each segment buys", "Compute repeat-buyer rate", "Update memo with customer section"],
    "Superstore v0.3 — full customer segmentation. Specific finding: who the VIPs are and what they buy.",
    ["Build a churn definition: customers with no order in 6+ months", "Find the 5 customers who lost you the most money", "Plot order count distribution — is it heavily skewed?"],
    ["Why is CLV not the same as 'lifetime sales'?", "What's a cohort analysis?", "Why does retention drop sharply from 1st to 2nd order in most businesses?", "How would you use this analysis for a marketing budget?"],
    ["CLV pivot", "Segment pivots", "Memo v3 PDF", "v0.3 tag"],
)

DA_W4 = base_week(
    4, "Superstore v0.4: SQL version", "Foundation", "12-18",
    "Everything you did in pivots can also be done in SQL — the language of every real database. Today you redo the same analysis in SQL.",
    [
        day(1, "SQL in 1 hour",
            "",
            [
                video("SQL crash course — 1 hour",
                      search("sql crash course beginner 1 hour"), 60, "various"),
                reading("SQLite Online — free in-browser SQL",
                        "https://sqliteonline.com/",
                        "Click 'Open' to use SQL right in your browser, no install."),
            ]),
        day(2, "Import the CSV",
            "",
            [
                exercise("Get Superstore into SQL",
                         "Export the Orders sheet from Excel as 'orders.csv'.\n"
                         "In sqliteonline.com: Import → CSV → upload orders.csv → create table 'orders'.\n"
                         "Run: SELECT COUNT(*) FROM orders;\n"
                         "YOU SHOULD SEE: about 10,000 rows."),
            ]),
        day(3, "Rewrite Q1 in SQL",
            "",
            [
                exercise("Margin leaders in SQL",
                         "      SELECT \n"
                         "        \"Sub-Category\",\n"
                         "        SUM(Sales) AS total_sales,\n"
                         "        SUM(Profit) AS total_profit,\n"
                         "        SUM(Profit) * 1.0 / SUM(Sales) AS margin\n"
                         "      FROM orders\n"
                         "      GROUP BY \"Sub-Category\"\n"
                         "      ORDER BY margin DESC;\n\n"
                         "Save this query in queries.sql. Compare to your pivot — same answer?"),
            ]),
        day(4, "Rewrite Q2 (YoY) in SQL",
            "",
            [
                exercise("Year-over-year in SQL",
                         "      SELECT \n"
                         "        Region,\n"
                         "        strftime('%Y', \"Order Date\") AS year,\n"
                         "        SUM(Sales) AS total_sales\n"
                         "      FROM orders\n"
                         "      GROUP BY Region, year\n"
                         "      ORDER BY Region, year;\n\n"
                         "Compute YoY growth with a CTE:\n"
                         "      WITH yearly AS (\n"
                         "        SELECT Region, strftime('%Y', \"Order Date\") AS year, SUM(Sales) AS sales\n"
                         "        FROM orders GROUP BY Region, year\n"
                         "      )\n"
                         "      SELECT a.Region, a.year, a.sales,\n"
                         "             (a.sales - b.sales) * 1.0 / b.sales AS yoy_growth\n"
                         "      FROM yearly a\n"
                         "      LEFT JOIN yearly b ON a.Region = b.Region AND a.year = CAST(b.year AS INT) + 1\n"
                         "      ORDER BY a.Region, a.year;"),
            ]),
        day(5, "CLV in SQL",
            "",
            [
                exercise("Top 10 customers",
                         "      SELECT \n"
                         "        \"Customer ID\", \"Customer Name\",\n"
                         "        SUM(Sales) AS lifetime_sales,\n"
                         "        SUM(Profit) AS lifetime_profit,\n"
                         "        COUNT(DISTINCT \"Order ID\") AS order_count\n"
                         "      FROM orders\n"
                         "      GROUP BY \"Customer ID\", \"Customer Name\"\n"
                         "      ORDER BY lifetime_sales DESC\n"
                         "      LIMIT 10;"),
            ]),
        day(6, "Save all queries",
            "",
            [
                exercise("queries.sql",
                         "Save at least 10 queries in queries.sql, each with a comment explaining what it answers:\n"
                         "  - Total Sales 2023\n"
                         "  - Margin by sub-category\n"
                         "  - YoY growth by region\n"
                         "  - Top 10 customers\n"
                         "  - Discount bucket vs avg profit\n"
                         "  - Furniture profit by sub-category\n"
                         "  - Repeat-buyer rate\n"
                         "  - VIP segmentation\n"
                         "  - Worst single order\n"
                         "  - Average days from order to ship"),
            ]),
        day(7, "Tag v0.4",
            "",
            [
                exercise("Acceptance v0.4",
                         "      git add queries.sql\n"
                         "      git commit -m 'v0.4: SQL versions of all queries'\n"
                         "      git tag v0.4 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ orders.csv imported into a SQLite DB\n"
                         "  ☐ queries.sql has 10+ commented queries\n"
                         "  ☐ Each query result matches the pivot table answer\n"
                         "  ☐ v0.4 tag"),
            ]),
    ],
    ["SQL basics — SELECT, WHERE, GROUP BY, JOIN, ORDER BY, LIMIT", "Aggregates — SUM, COUNT, AVG", "CTEs (WITH ...)", "Self-joins on year-over-year", "Date functions (strftime)", "Validating SQL results against spreadsheet pivots"],
    ["Sign up for sqliteonline.com (free)", "Import Orders CSV", "Rewrite Q1 (margin) in SQL", "Rewrite Q2 (YoY) using CTE + self-join", "Rewrite CLV in SQL", "Save 10 commented queries to queries.sql"],
    "Superstore v0.4 — every spreadsheet pivot translated to SQL queries. queries.sql committed.",
    ["Compute the median (use a window function)", "Find customers who bought in every quarter of a year", "Write a query that returns the running total of sales by date"],
    ["What's the difference between WHERE and HAVING?", "Why GROUP BY is sometimes slower than people expect", "What's a CTE — how is it different from a subquery?", "When do you reach for SQL vs pandas?"],
    ["queries.sql committed", "v0.4 tag", "Validation that SQL results match pivots"],
)


# ═══════════════════════════════════════════════════════════════════════
# BI ANALYTICS — Superstore Power BI Weeks 2-4
# ═══════════════════════════════════════════════════════════════════════
BI_W2 = base_week(
    2, "Superstore BI v0.2: Drillthrough + tooltips", "Foundation", "10-15",
    "Last week's dashboard is static. This week we make it interactive — click a region, drill into its details. Hover for rich tooltips.",
    [
        day(1, "What's drillthrough?",
            "",
            [
                video("Power BI drillthrough explained (10 min)",
                      search("power bi drillthrough beginner tutorial"),
                      10, "various"),
                reflect("Plan the detail page",
                        "When a user right-clicks a region on the bar chart and chooses 'Drillthrough', what should the detail page show? List 5 visuals."),
            ]),
        day(2, "Build the Region Detail page",
            "",
            [
                exercise("New page",
                         "In Power BI Desktop, click + to add a new page. Rename it 'Region Detail'.\n"
                         "Add visuals:\n"
                         "  - Card: Total Sales\n"
                         "  - Card: Total Profit\n"
                         "  - Line chart: Sales trend\n"
                         "  - Bar chart: Subcategory profit\n"
                         "  - Table: Top customers in this region\n\n"
                         "These are filtered by NOTHING yet."),
            ]),
        day(3, "Enable drillthrough",
            "",
            [
                exercise("Drillthrough field",
                         "On the Region Detail page, in the Visualizations pane, scroll to 'Drillthrough' section.\n"
                         "Drag Orders[Region] into 'Drill through filters'.\n"
                         "An arrow appears at top-left of the page (back button) — keep it.\n\n"
                         "Go to the main page. Right-click on a Region bar → Drill through → Region Detail.\n"
                         "YOU SHOULD SEE: the detail page filtered to that region."),
            ]),
        day(4, "Custom tooltips",
            "",
            [
                exercise("Tooltip page",
                         "Add a new page. Rename 'Tooltip — Subcategory'. In Page Settings, set Type = Tooltip, Size = Tooltip (320 x 240).\n"
                         "Add: Card with Total Sales, Card with Total Profit, small bar of monthly trend.\n\n"
                         "On the main page's bar chart of Subcategory, in Format → Tooltip → set 'Tooltip page' = 'Tooltip — Subcategory'.\n"
                         "Hover over a bar — you see your custom tooltip."),
            ]),
        day(5, "Bookmarks for views",
            "",
            [
                exercise("Filter bookmark",
                         "View tab → Bookmarks pane. Apply some filters (e.g. only Furniture, only 2023). Click 'Add' bookmark → name it 'Furniture 2023'.\n"
                         "Add another button on the main page that triggers this bookmark."),
            ]),
        day(6, "Republish",
            "",
            [
                exercise("Update Power BI Service",
                         "Save the .pbix. Home → Publish → My workspace → Replace.\n"
                         "Open the published report. Verify drillthrough + tooltips work."),
            ]),
        day(7, "Tag v0.2",
            "",
            [
                exercise("Acceptance v0.2",
                         "      git add . && git commit -m 'v0.2: drillthrough + tooltips'\n"
                         "      git tag v0.2 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Region Detail page exists with 5 visuals\n"
                         "  ☐ Drillthrough from main → Region Detail works\n"
                         "  ☐ Custom tooltip on Subcategory bars\n"
                         "  ☐ 1 bookmark with a button trigger\n"
                         "  ☐ Republished to Service\n"
                         "  ☐ v0.2 tag"),
            ]),
    ],
    ["Drillthrough pages in Power BI", "Custom tooltip pages", "Bookmarks", "Page configuration (Type = Tooltip)", "Republishing to Power BI Service"],
    ["Build a Region Detail page", "Enable drillthrough on Region", "Add a custom Subcategory tooltip", "Add a Furniture 2023 bookmark with a button", "Republish"],
    "Superstore BI v0.2 — interactive dashboard. Right-click drills into region detail. Hover shows rich tooltips. Bookmarks for saved views.",
    ["Add a second drillthrough for Subcategory", "Use a tooltip to show top 3 customers for the hovered region", "Add 3 more bookmarks (Q1, Q2, Q3, Q4)"],
    ["What's the difference between filter and drillthrough?", "Why use a tooltip page instead of the default tooltip?", "When do bookmarks become unmanageable?", "What's the performance cost of many drillthrough pages?"],
    ["3 pages in the .pbix", "Live URL still works", "v0.2 tag"],
)

BI_W3 = base_week(
    3, "Superstore BI v0.3: Row-level security", "Foundation", "10-15",
    "This week we add RLS — Regional VPs only see their region's data when they open the dashboard.",
    [
        day(1, "What is RLS?",
            "",
            [
                video("Power BI Row-Level Security (15 min)",
                      search("power bi row level security tutorial 2024"),
                      15, "various"),
                reflect("Model the roles",
                        "How many roles do you need?\n"
                        "  - CEO: sees everything\n"
                         "  - WestVP: only West\n"
                         "  - EastVP: only East\n"
                         "  - CentralVP: only Central\n"
                         "  - SouthVP: only South"),
            ]),
        day(2, "Create roles",
            "",
            [
                exercise("Modeling tab",
                         "Modeling tab → Manage roles → Create.\n"
                         "Role: WestVP. Table: Orders. Filter: [Region] = \"West\"\n"
                         "Save. Repeat for East, Central, South."),
            ]),
        day(3, "Test as a role",
            "",
            [
                exercise("View as role",
                         "Modeling tab → View as → WestVP. The whole dashboard filters to West-only.\n"
                         "Verify the bar chart only shows West.\n"
                         "Clear → return to admin view."),
            ]),
        day(4, "Add an 'All Regions' role for CEO",
            "",
            [
                exercise("CEO role",
                         "Create role 'CEO' with NO filter — it sees everything. (Power BI's default for unrestricted is no filter clause.)"),
            ]),
        day(5, "Republish + assign",
            "",
            [
                exercise("Service-side role assignment",
                         "Publish to Power BI Service.\n"
                         "In Service → your dataset → Security → assign emails to roles. Add your own email to WestVP.\n"
                         "Open the report — you only see West."),
            ]),
        day(6, "Document",
            "",
            [
                exercise("ROLES.md",
                         "Create ROLES.md in your repo:\n"
                         "      # Superstore BI Roles\n"
                         "      | Role | Filter | Who |\n"
                         "      |------|--------|-----|\n"
                         "      | CEO | None | Full access |\n"
                         "      | WestVP | Region = West | VP for West region |\n"
                         "      | EastVP | Region = East | VP for East |\n"
                         "      | CentralVP | Region = Central | VP for Central |\n"
                         "      | SouthVP | Region = South | VP for South |"),
            ]),
        day(7, "Tag v0.3",
            "",
            [
                exercise("Acceptance v0.3",
                         "      git add . && git commit -m 'v0.3: row-level security'\n"
                         "      git tag v0.3 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ 5 roles defined in the .pbix\n"
                         "  ☐ View as WestVP shows only West data\n"
                         "  ☐ Service-side role assignment tested\n"
                         "  ☐ ROLES.md committed\n"
                         "  ☐ v0.3 tag"),
            ]),
    ],
    ["RLS fundamentals", "DAX filter expressions for roles", "View as role in Desktop", "Service-side role assignment", "Documenting RBAC"],
    ["Create 5 roles in Manage Roles", "Test each role with View As", "Publish + assign emails in Service", "Document roles in ROLES.md"],
    "Superstore BI v0.3 — proper RLS. Each VP sees only their region. CEO sees everything.",
    ["Add a Country/Segment combined role", "Build a dynamic RLS via USERPRINCIPALNAME() so users are mapped to regions in a table", "Test what happens when a user has 2 roles assigned"],
    ["What's the difference between static and dynamic RLS?", "Why is RLS enforced at the data model level, not the visual level?", "What's the auditability story when a user views a report?", "What's the gotcha with relationships and RLS?"],
    ["5 roles in .pbix", "ROLES.md", "v0.3 tag"],
)

BI_W4 = base_week(
    4, "Superstore BI v0.4: Refresh + data gateway", "Foundation", "10-15",
    "The Sample Superstore is static. This week we simulate a real refresh scenario — auto-refreshing data from a live source.",
    [
        day(1, "Why automatic refresh",
            "",
            [
                video("Power BI scheduled refresh (10 min)",
                      search("power bi scheduled refresh tutorial 2024"),
                      10, "various"),
                reflect("Source options",
                        "What's a realistic LIVE data source for Superstore?\n"
                        "  - A SharePoint Excel that finance updates monthly?\n"
                         "  - An Azure SQL DB?\n"
                         "  - A flat file in OneDrive?"),
            ]),
        day(2, "Move the file to OneDrive",
            "",
            [
                exercise("Put data online",
                         "Sign in to onedrive.com (free).\n"
                         "Upload Sample - Superstore.xls to a folder called 'BI Datasets'.\n"
                         "Right-click → Copy link → make sure 'Anyone with the link can view'."),
            ]),
        day(3, "Re-point Power BI to OneDrive",
            "",
            [
                exercise("Replace source",
                         "In Power BI Desktop, open superstore.pbix.\n"
                         "Transform Data → Data source settings → Change source.\n"
                         "Point to the OneDrive URL.\n"
                         "Re-apply the cleaning steps. Save."),
            ]),
        day(4, "Publish + set scheduled refresh",
            "",
            [
                exercise("Daily refresh",
                         "Publish to Service.\n"
                         "In Service → your dataset → Settings → Scheduled refresh.\n"
                         "Set: refresh daily at 6am. Save your OneDrive credentials when prompted.\n"
                         "Trigger a manual refresh to verify it works."),
            ]),
        day(5, "Simulate an update",
            "",
            [
                exercise("Test the pipeline",
                         "Edit Sample - Superstore.xls (add a fake row with today's date, big sale, weird customer name).\n"
                         "Save. Wait for the next scheduled refresh OR trigger manual.\n"
                         "Open the dashboard — your fake row should appear in totals."),
            ]),
        day(6, "Add a 'Last refreshed' indicator",
            "",
            [
                exercise("Refresh timestamp card",
                         "In Power Query, add a step:\n"
                         "      = #table({\"LastRefreshed\"}, {{DateTime.LocalNow()}})\n"
                         "Or create a calculated table in DAX:\n"
                         "      LastRefresh = ROW(\"Refreshed at\", NOW())\n"
                         "Add a card to the dashboard showing the value. Users now see when data is current."),
            ]),
        day(7, "Tag v0.4",
            "",
            [
                exercise("Acceptance v0.4",
                         "      git add . && git commit -m 'v0.4: auto-refresh from OneDrive'\n"
                         "      git tag v0.4 && git push --tags\n\n"
                         "PASS:\n"
                         "  ☐ Data source pointing to OneDrive\n"
                         "  ☐ Scheduled refresh configured (daily 6am)\n"
                         "  ☐ Manual refresh tested\n"
                         "  ☐ Fake-row test proves end-to-end refresh\n"
                         "  ☐ 'Last refreshed' card on dashboard\n"
                         "  ☐ v0.4 tag"),
            ]),
    ],
    ["Power BI data sources from OneDrive/SharePoint", "Scheduled refresh", "Replacing data sources without breaking reports", "Calculated tables for metadata", "End-to-end refresh testing"],
    ["Upload data file to OneDrive", "Re-point Power BI dataset", "Configure daily scheduled refresh", "Test by editing source + verifying dashboard updates", "Add a 'Last refreshed' indicator card"],
    "Superstore BI v0.4 — data refreshes daily from OneDrive. Edit-and-see-update pipeline works end to end. Last-refresh timestamp visible.",
    ["Add refresh failure email notifications in Service", "Set up incremental refresh (only fetch new rows)", "Add a flat fact for 'data lag' alerts (last_refresh > 36h)"],
    ["Why does scheduled refresh need a Personal Gateway for on-prem sources?", "What's the cost difference between Pro and PPU for refresh?", "Why does Power BI fail when column types change?", "What's the difference between Import mode and DirectQuery?"],
    ["Working refresh pipeline", "Last-refresh card on dashboard", "v0.4 tag"],
)


ROADMAPS = {
    "data-science": [DS_W2, DS_W3, DS_W4],
    "data-analysis": [DA_W2, DA_W3, DA_W4],
    "bi-analytics": [BI_W2, BI_W3, BI_W4],
}


def apply():
    for slug, weeks_2_4 in ROADMAPS.items():
        path = os.path.join(DATA_DIR, f"{slug}.json")
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        weeks = data.get("weeks", [])
        for new_week in weeks_2_4:
            n = new_week["number"]
            replaced = False
            for i, w in enumerate(weeks):
                if w.get("number") == n:
                    weeks[i] = new_week
                    replaced = True
                    break
            if not replaced:
                weeks.append(new_week)
        weeks.sort(key=lambda w: w.get("number", 0))
        data["weeks"] = weeks
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  OK {slug}: Weeks 2, 3, 4 rewritten")


if __name__ == "__main__":
    apply()
