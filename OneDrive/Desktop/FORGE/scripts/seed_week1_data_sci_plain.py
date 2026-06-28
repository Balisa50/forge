"""
Plain-English rewrite of Data Science Week 1 — TaxiPulse NYC.

Pattern (per step):
  WHAT to do (one short sentence, no jargon)
  COPY-PASTE this exact text (in a code block)
  EXPECTED — what you should see when it worked
  IF IT BREAKS — common error + the fix

When this works as a template, the same shape gets applied to the other
8 disciplines.
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
# DATA SCIENCE — Week 1 — TaxiPulse NYC (plain-English version)
# ═══════════════════════════════════════════════════════════════════════
DATA_SCI = {
    "context": (
        "This week you are going to build TaxiPulse — a small data analysis of "
        "real New York City taxi trips from October 2023. Nothing fancy yet. By "
        "Sunday you will have a Jupyter notebook that answers three simple "
        "questions and tells a real story with numbers and charts. If you have "
        "never written Python before, that is fine — we walk you through every "
        "single command. Read slowly. Type things exactly as shown."
    ),
    "days": [
        day(1, "What is data science?",
            "Today is mostly watching and writing down what you think. No coding yet.",
            [
                video("Data Science explained simply (2 minutes)",
                      yt("X3paOmcrTjQ"), 2, "Fireship",
                      "Watch this first. It is fast and clear."),
                video("Data Science vs Machine Learning vs Analytics (10 min)",
                      search("data science vs machine learning vs analytics beginner"),
                      10, "various",
                      "Helps you understand what your future job actually looks like."),
                reflect("Write three guesses",
                        "By Sunday you will answer these three questions about NYC taxi trips in October 2023. Before you look at any data, write down your guess for each one — just a sentence each. Put your guesses in a file called `guesses.txt`. You will check them on Day 6 and see if you were right.\n\n"
                        "Question 1: What hour of the day are the most taxi trips? (Midnight? 8am? 5pm?)\n\n"
                        "Question 2: Do people tip more when the ride is longer, or less?\n\n"
                        "Question 3: Which day of the week has the highest average fare? (Friday night fares? Sunday mornings?)"),
            ]),

        day(2, "Install Python and Jupyter",
            "Today we set up the tools. This is the boring but important day. Do not skip.",
            [
                reading("Anaconda download page (official)",
                        "https://www.anaconda.com/download",
                        "Click 'Open' to go to the page. Download the version for your computer (Windows, Mac, or Linux)."),
                video("How to install Anaconda on Windows / Mac / Linux",
                      search("install anaconda 2024 windows mac linux beginner"),
                      15, "various",
                      "Pick the video that matches YOUR computer (Windows or Mac)."),
                exercise("Step-by-step setup",
                         "Follow each step in order. Do not skip ahead.\n\n"
                         "STEP 1 — Download Anaconda.\n"
                         "  Go to https://www.anaconda.com/download\n"
                         "  Click the big download button for your operating system (Windows, Mac, or Linux).\n"
                         "  Run the installer when it finishes downloading. Click 'Next' on every screen — the defaults are fine.\n"
                         "  This takes about 5-10 minutes.\n\n"
                         "STEP 2 — Open the terminal.\n"
                         "  WINDOWS: Press the Windows key, type 'Anaconda Prompt', press Enter.\n"
                         "  MAC: Press Cmd+Space, type 'Terminal', press Enter.\n"
                         "  LINUX: Open your usual terminal.\n"
                         "  A black or white window with text appears. This is where you type commands.\n\n"
                         "STEP 3 — Check Python works.\n"
                         "  Type this and press Enter:\n"
                         "      python --version\n"
                         "  YOU SHOULD SEE: something like 'Python 3.11.5' (any 3.10+ is fine).\n"
                         "  IF YOU SEE 'command not found': close the terminal, reopen it, try again. If still broken, watch the install video again.\n\n"
                         "STEP 4 — Make a folder for the project.\n"
                         "  Type these one at a time, pressing Enter after each:\n"
                         "      cd Desktop\n"
                         "      mkdir taxipulse\n"
                         "      cd taxipulse\n"
                         "  Your prompt should now end with 'taxipulse'.\n"
                         "  This is now your project home.\n\n"
                         "STEP 5 — Start Jupyter Notebook.\n"
                         "  Type this and press Enter:\n"
                         "      jupyter notebook\n"
                         "  YOU SHOULD SEE: your web browser opens to a page showing files in the taxipulse folder. The page address starts with 'localhost:8888'.\n"
                         "  This is Jupyter. It is where you will write Python and see results.\n\n"
                         "STEP 6 — Create your first notebook.\n"
                         "  In the browser, click the 'New' button (top right) → choose 'Python 3'.\n"
                         "  A new tab opens with an empty notebook called 'Untitled'.\n"
                         "  Click the word 'Untitled' at the top and rename it to '01-setup'.\n\n"
                         "STEP 7 — Test that everything works.\n"
                         "  In the first empty cell, type this exactly:\n"
                         "      import pandas\n"
                         "      import numpy\n"
                         "      import matplotlib\n"
                         "      print('All good — pandas is', pandas.__version__)\n"
                         "  Press Shift+Enter to run the cell.\n"
                         "  YOU SHOULD SEE: 'All good — pandas is 2.x.x' (any 2.x is fine).\n"
                         "  IF YOU SEE 'ModuleNotFoundError': pandas isn't installed. In the terminal (not Jupyter), type 'conda install pandas numpy matplotlib' and press Enter. Then re-run the cell.\n\n"
                         "STEP 8 — Save.\n"
                         "  Press Ctrl+S (or Cmd+S on Mac) in the Jupyter tab.\n\n"
                         "If you got here without errors — you have Python + Jupyter working. That alone is a win. Stop for today."),
            ]),

        day(3, "Download the real NYC taxi data",
            "Today you get the actual data file. One specific file. Do not look for others.",
            [
                reading("NYC Taxi data — official page (NYC.gov)",
                        "https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page",
                        "Open this in your browser so you know where the data comes from. It is published by the NYC government."),
                reading("Direct download link — yellow_tripdata_2023-10.parquet (50 MB)",
                        "https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2023-10.parquet",
                        "This is the exact file we will use this week. Click 'Open' to download it — or follow the terminal steps below."),
                exercise("Get the data file",
                         "STEP 1 — Open your terminal where 'taxipulse' is.\n"
                         "  WINDOWS: Anaconda Prompt. Make sure your prompt ends with 'taxipulse'.\n"
                         "  MAC/LINUX: Terminal in the taxipulse folder.\n"
                         "  If unsure, type 'pwd' and press Enter — you should see a path ending in '/taxipulse'.\n\n"
                         "STEP 2 — Make a folder called 'data' inside taxipulse.\n"
                         "      mkdir data\n\n"
                         "STEP 3 — Download the dataset. This is a 50MB file with about 3 million taxi trips.\n"
                         "  WINDOWS (Anaconda Prompt):\n"
                         "      curl -o data/taxi.parquet https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2023-10.parquet\n"
                         "  MAC / LINUX:\n"
                         "      curl -o data/taxi.parquet https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2023-10.parquet\n"
                         "  IF curl IS NOT FOUND: copy the URL into your browser. The file will download. Move it to taxipulse/data/ and rename it to 'taxi.parquet'.\n"
                         "  YOU SHOULD SEE: a progress bar that fills up over 30-60 seconds.\n\n"
                         "STEP 4 — Verify the file is there.\n"
                         "      dir data            (Windows)\n"
                         "      ls -lh data         (Mac / Linux)\n"
                         "  YOU SHOULD SEE: 'taxi.parquet' listed, around 47 MB in size.\n\n"
                         "STEP 5 — Open Jupyter and load it.\n"
                         "  In the taxipulse folder, type 'jupyter notebook' if it isn't already open.\n"
                         "  Open '01-setup.ipynb' (or make a new notebook called '02-load').\n"
                         "  In a new cell, type exactly this:\n\n"
                         "      import pandas as pd\n"
                         "      df = pd.read_parquet('data/taxi.parquet')\n"
                         "      print('Rows:', len(df))\n"
                         "      print('Columns:', list(df.columns))\n"
                         "      df.head()\n\n"
                         "  Press Shift+Enter to run.\n"
                         "  YOU SHOULD SEE:\n"
                         "    Rows: about 3,500,000\n"
                         "    Columns: a list with 'tpep_pickup_datetime', 'tpep_dropoff_datetime', 'passenger_count', 'trip_distance', 'fare_amount', 'tip_amount', and others\n"
                         "    A table showing the first 5 rows of real taxi trips.\n\n"
                         "  IF YOU SEE 'FileNotFoundError': you are not in the taxipulse folder, OR the file is named differently. Re-check Step 4.\n\n"
                         "STEP 6 — Save the notebook. You're done for today.\n"
                         "  You just loaded 3.5 MILLION real taxi rides into Python. That is a real data scientist move."),
            ]),

        day(4, "Clean the data",
            "Real data has weird rows — negative fares, trips that take 0 seconds, trips that started before October. We remove them today.",
            [
                video("pandas filtering for beginners (15 min)",
                      search("pandas filter rows beginner tutorial"),
                      15, "various",
                      "Watch this once before you start the exercise."),
                exercise("Remove the impossible trips",
                         "Open a new notebook called '03-clean.ipynb'. In each cell below, type the code and press Shift+Enter to run it.\n\n"
                         "CELL 1 — Load the data again.\n"
                         "      import pandas as pd\n"
                         "      df = pd.read_parquet('data/taxi.parquet')\n"
                         "      print('Starting rows:', len(df))\n"
                         "  YOU SHOULD SEE: 'Starting rows: 3,500,000' or similar.\n\n"
                         "CELL 2 — Remove trips with no distance or no fare.\n"
                         "      df = df[df['trip_distance'] > 0]\n"
                         "      df = df[df['fare_amount'] > 0]\n"
                         "      print('After removing 0-distance and 0-fare trips:', len(df))\n"
                         "  YOU SHOULD SEE the row count drops a little.\n\n"
                         "CELL 3 — Remove super-long trips that are probably errors.\n"
                         "      df = df[df['trip_distance'] < 100]\n"
                         "      print('After removing 100+ mile trips:', len(df))\n\n"
                         "CELL 4 — Keep only October 2023 trips. Some rows have wrong dates.\n"
                         "      df = df[(df['tpep_pickup_datetime'] >= '2023-10-01') & (df['tpep_pickup_datetime'] < '2023-11-01')]\n"
                         "      print('After fixing dates:', len(df))\n\n"
                         "CELL 5 — Add two useful columns we will need later.\n"
                         "      df['trip_minutes'] = (df['tpep_dropoff_datetime'] - df['tpep_pickup_datetime']).dt.total_seconds() / 60\n"
                         "      df['tip_percent'] = (df['tip_amount'] / df['fare_amount']) * 100\n"
                         "      df['pickup_hour'] = df['tpep_pickup_datetime'].dt.hour\n"
                         "      df['pickup_dayofweek'] = df['tpep_pickup_datetime'].dt.day_name()\n"
                         "      print('Added 4 new columns:', list(df.columns)[-4:])\n\n"
                         "CELL 6 — Remove super short or super long trips by time.\n"
                         "      df = df[(df['trip_minutes'] >= 1) & (df['trip_minutes'] <= 180)]\n"
                         "      print('Final rows after cleaning:', len(df))\n\n"
                         "CELL 7 — Save the cleaned data.\n"
                         "      df.to_parquet('data/clean.parquet')\n"
                         "      print('Saved data/clean.parquet — final size:', len(df), 'rows')\n\n"
                         "  YOU SHOULD SEE: 'Saved data/clean.parquet — final size: 3,400,000 rows' or close.\n"
                         "  You just cleaned 3.5M rows of real data. Save the notebook."),
            ]),

        day(5, "Answer Question 1: busiest hour",
            "Today we make our first chart. By the end of today you will know what hour the most taxis run in October 2023.",
            [
                video("Make a bar chart with pandas (10 min)",
                      search("pandas plot bar chart beginner tutorial"),
                      10, "various"),
                exercise("Count trips by hour and plot them",
                         "Make a new notebook '04-busiest-hour.ipynb'.\n\n"
                         "CELL 1 — Load the cleaned data.\n"
                         "      import pandas as pd\n"
                         "      import matplotlib.pyplot as plt\n"
                         "      df = pd.read_parquet('data/clean.parquet')\n"
                         "      print('Working with', len(df), 'trips')\n\n"
                         "CELL 2 — Count how many trips started in each hour.\n"
                         "      trips_per_hour = df.groupby('pickup_hour').size()\n"
                         "      print(trips_per_hour)\n"
                         "  YOU SHOULD SEE: 24 lines, one for each hour 0 to 23, with a count next to each.\n\n"
                         "CELL 3 — Plot it as a bar chart.\n"
                         "      trips_per_hour.plot(kind='bar', figsize=(12, 5), color='steelblue')\n"
                         "      plt.title('NYC Yellow Taxi trips by hour of day — October 2023')\n"
                         "      plt.xlabel('Hour of day (0 = midnight, 23 = 11pm)')\n"
                         "      plt.ylabel('Number of trips')\n"
                         "      plt.tight_layout()\n"
                         "      plt.savefig('busiest_hour.png', dpi=150)\n"
                         "      plt.show()\n"
                         "  YOU SHOULD SEE: a bar chart inside the notebook. The tallest bar is your busiest hour.\n\n"
                         "CELL 4 — Print the answer in plain English.\n"
                         "      busiest = trips_per_hour.idxmax()\n"
                         "      busiest_count = trips_per_hour.max()\n"
                         "      print(f'The busiest hour is {busiest}:00, with {busiest_count:,} trips.')\n\n"
                         "  Write down the answer in a markdown cell below the chart:\n"
                         "      # Answer to Q1: The busiest hour in October 2023 was XX:00, with about XXX,XXX trips.\n"
                         "  Compare with your guess from Day 1. Were you right?"),
            ]),

        day(6, "Answer Questions 2 and 3",
            "Two more charts, two more answers. By tonight you have everything for Sunday's polish.",
            [
                exercise("Tip percentage vs trip distance",
                         "Make a new notebook '05-tips-and-fares.ipynb'.\n\n"
                         "CELL 1 — Load data.\n"
                         "      import pandas as pd\n"
                         "      import matplotlib.pyplot as plt\n"
                         "      df = pd.read_parquet('data/clean.parquet')\n\n"
                         "CELL 2 — Group trips by distance bucket and average the tip percent.\n"
                         "      df['distance_bucket'] = pd.cut(df['trip_distance'], bins=[0, 1, 3, 5, 10, 100], labels=['0-1 mi', '1-3 mi', '3-5 mi', '5-10 mi', '10+ mi'])\n"
                         "      tip_by_distance = df.groupby('distance_bucket')['tip_percent'].mean()\n"
                         "      print(tip_by_distance)\n"
                         "  YOU SHOULD SEE: 5 lines, one for each distance bucket, with an average tip percent.\n\n"
                         "CELL 3 — Plot it.\n"
                         "      tip_by_distance.plot(kind='bar', figsize=(10, 5), color='seagreen')\n"
                         "      plt.title('Average tip % by trip distance — NYC Yellow Taxi, Oct 2023')\n"
                         "      plt.xlabel('Trip distance')\n"
                         "      plt.ylabel('Average tip (% of fare)')\n"
                         "      plt.tight_layout()\n"
                         "      plt.savefig('tip_by_distance.png', dpi=150)\n"
                         "      plt.show()\n\n"
                         "CELL 4 — Now the day-of-week fare question.\n"
                         "      days_in_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']\n"
                         "      fare_by_day = df.groupby('pickup_dayofweek')['fare_amount'].mean().reindex(days_in_order)\n"
                         "      print(fare_by_day)\n\n"
                         "CELL 5 — Plot day-of-week fares.\n"
                         "      fare_by_day.plot(kind='bar', figsize=(10, 5), color='tomato')\n"
                         "      plt.title('Average fare by day of week — NYC Yellow Taxi, Oct 2023')\n"
                         "      plt.xlabel('Day of week')\n"
                         "      plt.ylabel('Average fare ($)')\n"
                         "      plt.xticks(rotation=45)\n"
                         "      plt.tight_layout()\n"
                         "      plt.savefig('fare_by_day.png', dpi=150)\n"
                         "      plt.show()\n\n"
                         "CELL 6 — Write the answers.\n"
                         "  In a markdown cell at the bottom, write your three answers in plain English:\n"
                         "      ## Answers\n"
                         "      Q1 — Busiest hour: ... (from yesterday)\n"
                         "      Q2 — Tip vs distance: short trips tip about XX%. Long trips tip about XX%. (So tips go up / down with distance — pick one.)\n"
                         "      Q3 — Day with highest average fare: ... with $XX.XX average.\n\n"
                         "  Now compare ALL THREE with your Day 1 guesses. How many did you get right?"),
            ]),

        day(7, "Polish the notebook and ship it",
            "Today you turn the messy notebooks into one clean story anyone could read. This is the artifact you put on your CV.",
            [
                reading("GitHub — sign up (free)",
                        "https://github.com/signup",
                        "Click 'Open' to make a free GitHub account if you don't have one. You will push your project here today."),
                reading("Create a new GitHub repo",
                        "https://github.com/new",
                        "Click 'Open' when you're ready to make a new public repo. Name it: taxipulse-nyc"),
                exercise("Final acceptance — TaxiPulse v0.1",
                         "Make ONE final notebook called 'TaxiPulse-Final.ipynb'. Copy your best cells from the earlier notebooks into this one. Use the structure below exactly.\n\n"
                         "Use markdown cells (in Jupyter: change cell type from 'Code' to 'Markdown' in the dropdown at the top) for the text sections.\n\n"
                         "───────── STRUCTURE ─────────\n\n"
                         "MARKDOWN CELL 1:\n"
                         "      # TaxiPulse NYC — What 3 million taxi trips tell us about October 2023\n"
                         "      Your Name · Today's date\n"
                         "      \n"
                         "      ## TL;DR\n"
                         "      - The busiest hour is XX:00 with ~XXX,XXX trips.\n"
                         "      - Short trips tip ~XX% — long trips tip ~XX%. (Tips go up / down with distance.)\n"
                         "      - The day with the highest average fare is XXX at $XX.XX.\n"
                         "      \n"
                         "      ## The data\n"
                         "      All NYC Yellow Taxi trips from October 2023.  \n"
                         "      Source: https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page  \n"
                         "      Downloaded: [your date]  \n"
                         "      Cleaned to about 3.4M rows after removing 0-distance, 0-fare, wrong-month, and impossibly-long trips.\n\n"
                         "CODE CELL — Load + clean (one cell).\n\n"
                         "MARKDOWN CELL: '## Finding 1: The busiest hour'\n"
                         "  Then your hour bar chart code cell.  \n"
                         "  Then a markdown cell with a 2-sentence finding.\n\n"
                         "MARKDOWN CELL: '## Finding 2: Tipping vs distance'\n"
                         "  Then your tip code cell.  \n"
                         "  Then a markdown 2-sentence finding.\n\n"
                         "MARKDOWN CELL: '## Finding 3: Fares by day of week'\n"
                         "  Then your fare code cell.  \n"
                         "  Then a 2-sentence finding.\n\n"
                         "MARKDOWN CELL: '## What I would do next'\n"
                         "  Three bullets — e.g. compare to other months, break down by borough, predict fare from distance.\n\n"
                         "───────── PUSH TO GITHUB ─────────\n\n"
                         "STEP 1 — Make a free GitHub account at github.com if you don't have one.\n\n"
                         "STEP 2 — On github.com, click '+' (top right) → 'New repository'. Name it: taxipulse-nyc. Make it public. Click 'Create repository'.\n\n"
                         "STEP 3 — In your terminal, inside the taxipulse folder, type these one by one:\n"
                         "      git init\n"
                         "      echo 'data/' > .gitignore\n"
                         "      git add .\n"
                         "      git commit -m \"TaxiPulse v0.1 — answered 3 questions about NYC taxis Oct 2023\"\n"
                         "      git branch -M main\n"
                         "      git remote add origin https://github.com/YOUR-USERNAME/taxipulse-nyc.git\n"
                         "      git push -u origin main\n\n"
                         "  (Replace YOUR-USERNAME with your actual GitHub username.)\n"
                         "  When asked, log in to GitHub.\n\n"
                         "STEP 4 — Open your repo on github.com. You should see your notebooks listed. Click 'TaxiPulse-Final.ipynb' — GitHub renders Jupyter notebooks beautifully.\n\n"
                         "STEP 5 — Add a README.\n"
                         "  On github.com, click 'Add a README'.\n"
                         "  Paste:\n"
                         "      # TaxiPulse NYC\n"
                         "      A small data-science analysis of NYC Yellow Taxi trips in October 2023.\n"
                         "      \n"
                         "      ## Findings\n"
                         "      1. Busiest hour: XX:00\n"
                         "      2. Tips: short trips tip XX%, long trips tip XX%\n"
                         "      3. Highest-fare day: XXX ($XX.XX average)\n"
                         "      \n"
                         "      ## Open the notebook\n"
                         "      [TaxiPulse-Final.ipynb](TaxiPulse-Final.ipynb)\n"
                         "      \n"
                         "      ## Data\n"
                         "      https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page\n"
                         "  Commit.\n\n"
                         "───────── PASS CRITERIA ─────────\n"
                         "  ☐ All three questions answered with specific numbers\n"
                         "  ☐ TaxiPulse-Final.ipynb has the structure shown above\n"
                         "  ☐ Three charts saved as PNG files\n"
                         "  ☐ Repo pushed to GitHub, public\n"
                         "  ☐ README written with the three findings\n"
                         "  ☐ You can send the GitHub URL to a friend and they can read the notebook in their browser\n\n"
                         "Share the GitHub URL in your forge dashboard check-in. You shipped your first real data-science project."),
                reflect("Be honest with yourself",
                        "Look at your three findings. Could a NYC reporter or a taxi company actually use any of this? If yes — which one and how? If no — what else would you need to add to make it useful?"),
            ]),
    ],
    "topics": [
        "Installing Python (Anaconda)",
        "Opening and using a terminal",
        "Using Jupyter notebooks",
        "Loading data with pandas",
        "Cleaning real-world messy data",
        "Group-by and aggregations in pandas",
        "Making bar charts with matplotlib",
        "Pushing a project to GitHub",
    ],
    "tasks": [
        "Install Anaconda and verify Python works",
        "Open Jupyter and create your first notebook",
        "Download the NYC Yellow Taxi October 2023 dataset",
        "Clean the data (remove impossible trips)",
        "Answer Q1 — find the busiest hour with a bar chart",
        "Answer Q2 and Q3 — tipping by distance and fares by day",
        "Polish into one final notebook and push to GitHub",
    ],
    "project": (
        "TaxiPulse NYC v0.1 — a Jupyter notebook that answers three specific "
        "questions about real NYC Yellow Taxi trips in October 2023. Busiest hour, "
        "tip percentage vs trip distance, and average fare by day of week. The "
        "notebook is pushed to a public GitHub repo called taxipulse-nyc, with a "
        "README that lists the three findings. This is your first data-science "
        "project on your CV."
    ),
    "exercises": [
        "Add a fourth chart of your choice — anything interesting you spotted in the data",
        "Group the busiest-hour chart by pickup borough — does the busy hour change by location?",
        "Plot trip_minutes as a histogram — what shape does it have?",
        "Find one trip that surprised you (very long, very expensive, very tipped) and write one sentence about it",
    ],
    "questions": [
        "Why did we drop trips with fare_amount of 0?",
        "What's the difference between mean and median tip — which is more honest here?",
        "Where did you make a choice that another analyst might disagree with?",
        "If you had weather data for October 2023 in NYC too, what new question could you ask?",
    ],
    "outputs": [
        "Public GitHub repo named taxipulse-nyc",
        "TaxiPulse-Final.ipynb with three answered questions",
        "Three saved chart PNGs",
        "A README listing the three findings",
    ],
}


def apply():
    path = os.path.join(DATA_DIR, "data-science.json")
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
            preserved.update(DATA_SCI)
            weeks[i] = preserved
            break
    data["weeks"] = weeks
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("  OK data-science: Week 1 rewritten in plain English")


if __name__ == "__main__":
    apply()
