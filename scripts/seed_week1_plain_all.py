"""
Plain-English Week 1 for ALL 9 disciplines.

Pattern per day:
  - reading() cards at the top for any external page (clickable "Open")
  - video() card(s) — opens YouTube in new tab
  - exercise() with step-by-step plain English (do this / type this / you should see / if broken)
  - reflect() prompt where useful

Every Day 7 ends with a "ship to GitHub" path and acceptance checkboxes.
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
# 1. AI ENGINEERING — Polyglot v0.1 — English ↔ Spanish translator
# ═══════════════════════════════════════════════════════════════════════
AI_ENG = {
    "context": (
        "This week you are going to build Polyglot — a small English to Spanish "
        "translator that runs in your terminal. It uses the OpenAI API (the same "
        "company that makes ChatGPT). By Sunday you will have a real working "
        "program on your computer that you can show to anyone. If you have never "
        "written Python before, that is fine — every command is given to you "
        "exactly. Just read slowly and type things exactly as shown."
    ),
    "days": [
        day(1, "What is AI Engineering?",
            "Today is mostly watching. Build the mental picture of what you will be doing.",
            [
                video("Intro to Large Language Models — Andrej Karpathy (1 hour)",
                      yt("zjkBMFhNj_g"), 60, "Andrej Karpathy",
                      "The clearest explanation of what ChatGPT / GPT-4 actually is. Worth the hour."),
                reflect("Write three sentences",
                        "Without googling, write three short sentences in a file called notes.txt:\n"
                        "1. In your own words — what is a 'large language model'?\n"
                        "2. Name one thing it can do well.\n"
                        "3. Name one thing it does badly.\n"
                        "Save the file. You will look back at this in 6 weeks."),
            ]),
        day(2, "Install Python",
            "We need Python on your computer. Today we install it.",
            [
                reading("Python download (official)",
                        "https://www.python.org/downloads/",
                        "Click 'Open' to go to the official Python download page."),
                video("How to install Python on Windows / Mac",
                      search("install python 3.12 windows mac beginner 2024"),
                      12, "various",
                      "Pick the video for YOUR computer."),
                exercise("Install Python and check it works",
                         "STEP 1 — Download Python.\n"
                         "  Click the 'Open' button on the card above to go to python.org/downloads.\n"
                         "  Click the big yellow 'Download Python 3.12' button.\n"
                         "  Run the installer.\n"
                         "  WINDOWS: tick the box that says 'Add Python to PATH' before clicking Install. This is important.\n"
                         "  MAC: just click through.\n\n"
                         "STEP 2 — Open the terminal.\n"
                         "  WINDOWS: press the Windows key, type 'cmd', press Enter. A black window opens.\n"
                         "  MAC: press Cmd+Space, type 'Terminal', press Enter.\n\n"
                         "STEP 3 — Check Python is installed.\n"
                         "  Type this and press Enter:\n"
                         "      python --version\n"
                         "  YOU SHOULD SEE: 'Python 3.12.x' (or any 3.10+).\n"
                         "  IF YOU SEE 'command not found' on Mac, try: python3 --version\n"
                         "  IF still broken: close the terminal, reopen, try again."),
            ]),
        day(3, "Get an OpenAI API key",
            "Today you sign up with OpenAI and get a special key. The key is what lets your Python code talk to GPT.",
            [
                reading("OpenAI — sign up",
                        "https://platform.openai.com/signup",
                        "Click 'Open' to make a free account. The first $5 of usage is free, more than enough for this week."),
                reading("OpenAI — API keys page",
                        "https://platform.openai.com/api-keys",
                        "After signing up, click 'Open' to come here. This is where you create your API key."),
                exercise("Get and save your API key",
                         "STEP 1 — Sign up.\n"
                         "  Open the 'OpenAI — sign up' card above. Make an account with your email.\n"
                         "  You get $5 in free credits when you sign up.\n\n"
                         "STEP 2 — Get the key.\n"
                         "  Open the 'API keys page' card. Click 'Create new secret key'. Name it 'polyglot'. Copy the key (it starts with sk-...).\n"
                         "  IMPORTANT: this is the ONLY time you will see the full key. Copy it now.\n\n"
                         "STEP 3 — Save the key safely.\n"
                         "  Open Notepad (Windows) or TextEdit (Mac). Paste the key. Save the file to your Desktop as 'openai-key.txt' for now.\n"
                         "  NEVER share this file with anyone. NEVER push it to GitHub.\n\n"
                         "STEP 4 — Make the project folder.\n"
                         "  Back in the terminal, type:\n"
                         "      cd Desktop\n"
                         "      mkdir polyglot\n"
                         "      cd polyglot\n"
                         "  Your prompt should end with 'polyglot' now.\n\n"
                         "STEP 5 — Install the OpenAI library.\n"
                         "      pip install openai python-dotenv\n"
                         "  YOU SHOULD SEE: 'Successfully installed openai-...' after about 30 seconds."),
            ]),
        day(4, "Your first Python program that talks to AI",
            "Today the magic happens. Your computer asks GPT a question and gets an answer.",
            [
                reading("OpenAI Quickstart (official docs)",
                        "https://platform.openai.com/docs/quickstart",
                        "Bookmark this. You will come back here often."),
                exercise("Write hello.py",
                         "STEP 1 — Open a code editor.\n"
                         "  We recommend VS Code: https://code.visualstudio.com (it is free).\n"
                         "  Install it. Open VS Code. File → Open Folder → pick your 'polyglot' folder.\n\n"
                         "STEP 2 — Make a file called .env\n"
                         "  In VS Code: File → New File. Save as '.env' (yes, just .env, no name before the dot).\n"
                         "  In the file, type ONE line:\n"
                         "      OPENAI_API_KEY=sk-paste-your-key-here\n"
                         "  Replace 'sk-paste-your-key-here' with the key you saved yesterday. Save.\n\n"
                         "STEP 3 — Make hello.py\n"
                         "  File → New File. Save as 'hello.py'. Type this exactly:\n\n"
                         "      from openai import OpenAI\n"
                         "      from dotenv import load_dotenv\n"
                         "      load_dotenv()\n"
                         "      client = OpenAI()\n"
                         "      response = client.chat.completions.create(\n"
                         "          model='gpt-4o-mini',\n"
                         "          messages=[\n"
                         "              {'role': 'user', 'content': 'Translate \"Hello, how are you?\" to Spanish. Reply with ONLY the translation.'}\n"
                         "          ],\n"
                         "      )\n"
                         "      print(response.choices[0].message.content)\n\n"
                         "STEP 4 — Run it.\n"
                         "  In your terminal (still in the polyglot folder), type:\n"
                         "      python hello.py\n"
                         "  YOU SHOULD SEE: 'Hola, ¿cómo estás?' (or similar Spanish).\n"
                         "  IF YOU SEE an authentication error: your .env file is wrong. Open it, check the key, save again.\n"
                         "  IF YOU SEE a quota error: you used all $5. Add $5 of credit at platform.openai.com/account/billing."),
            ]),
        day(5, "Make it a real translator",
            "Today we turn hello.py into a proper translator that takes ANY English sentence and translates it.",
            [
                video("System prompt vs user prompt — 10 min",
                      search("openai system prompt vs user prompt beginner"),
                      10, "various"),
                exercise("Write translate.py",
                         "STEP 1 — Make a new file: translate.py\n"
                         "  In VS Code, File → New File, save as 'translate.py'. Type this:\n\n"
                         "      import sys\n"
                         "      from openai import OpenAI\n"
                         "      from dotenv import load_dotenv\n\n"
                         "      load_dotenv()\n"
                         "      client = OpenAI()\n\n"
                         "      SYSTEM_PROMPT = (\n"
                         "          'You are a professional English-to-Spanish translator. '\n"
                         "          'Translate the user input from English to Spanish. '\n"
                         "          'Reply with ONLY the Spanish translation — no preamble, no explanation.'\n"
                         "      )\n\n"
                         "      if len(sys.argv) < 2:\n"
                         "          print('Usage: python translate.py \"Your English sentence here\"')\n"
                         "          sys.exit(1)\n\n"
                         "      english = sys.argv[1]\n"
                         "      response = client.chat.completions.create(\n"
                         "          model='gpt-4o-mini',\n"
                         "          temperature=0,\n"
                         "          messages=[\n"
                         "              {'role': 'system', 'content': SYSTEM_PROMPT},\n"
                         "              {'role': 'user', 'content': english},\n"
                         "          ],\n"
                         "      )\n"
                         "      print(response.choices[0].message.content)\n\n"
                         "STEP 2 — Test with 3 sentences.\n"
                         "  In your terminal:\n"
                         "      python translate.py \"The meeting is at 3pm tomorrow.\"\n"
                         "      python translate.py \"I love coffee.\"\n"
                         "      python translate.py \"Where is the bathroom?\"\n"
                         "  YOU SHOULD SEE: each one prints a Spanish translation.\n\n"
                         "STEP 3 — Save and stop for today."),
            ]),
        day(6, "Make it print cost and handle errors",
            "Today we make the program production-shaped — it shows what each translation costs, and it does not crash.",
            [
                exercise("Add cost printing and error handling",
                         "STEP 1 — Open translate.py in VS Code.\n\n"
                         "STEP 2 — Add error handling. Wrap the API call in a try/except. Replace the call block with this:\n\n"
                         "      try:\n"
                         "          response = client.chat.completions.create(\n"
                         "              model='gpt-4o-mini',\n"
                         "              temperature=0,\n"
                         "              messages=[\n"
                         "                  {'role': 'system', 'content': SYSTEM_PROMPT},\n"
                         "                  {'role': 'user', 'content': english},\n"
                         "              ],\n"
                         "          )\n"
                         "      except Exception as e:\n"
                         "          print(f'Error talking to OpenAI: {e}')\n"
                         "          sys.exit(1)\n\n"
                         "STEP 3 — Print the cost. After the print(response... line, add:\n\n"
                         "      usage = response.usage\n"
                         "      cost = (usage.prompt_tokens * 0.15 + usage.completion_tokens * 0.60) / 1_000_000\n"
                         "      print(f'(input: {usage.prompt_tokens} tok, output: {usage.completion_tokens} tok, cost: ${cost:.6f})')\n\n"
                         "STEP 4 — Refuse long inputs. Right after `english = sys.argv[1]`, add:\n\n"
                         "      if len(english) > 500:\n"
                         "          print('Sentence too long. Keep it under 500 characters.')\n"
                         "          sys.exit(1)\n\n"
                         "STEP 5 — Test.\n"
                         "      python translate.py \"Good morning!\"\n"
                         "  YOU SHOULD SEE: Spanish translation + a line like '(input: 35 tok, output: 5 tok, cost: $0.000008)'."),
            ]),
        day(7, "Ship Polyglot v0.1 to GitHub",
            "Today you push your project online so anyone can see it. This is what goes on your CV.",
            [
                reading("GitHub — sign up (free)",
                        "https://github.com/signup",
                        "Click 'Open' to make a free GitHub account if you don't have one."),
                reading("GitHub — create new repository",
                        "https://github.com/new",
                        "Click 'Open' when ready. Name your repo: polyglot. Make it Public."),
                exercise("Final acceptance — Polyglot v0.1",
                         "STEP 1 — Write a README.md\n"
                         "  In VS Code, create a new file 'README.md' in the polyglot folder. Type:\n\n"
                         "      # Polyglot v0.1\n"
                         "      An English-to-Spanish translator that runs in the terminal, powered by GPT-4o-mini.\n"
                         "      \n"
                         "      ## How to use\n"
                         "      1. Clone this repo.\n"
                         "      2. Copy .env.example to .env and add your OpenAI key.\n"
                         "      3. Run: pip install openai python-dotenv\n"
                         "      4. Run: python translate.py \"Your English sentence\"\n"
                         "      \n"
                         "      ## Example\n"
                         "      python translate.py \"Hello, how are you?\"\n"
                         "      Hola, ¿cómo estás?\n"
                         "      (input: 35 tok, output: 5 tok, cost: $0.000008)\n"
                         "      \n"
                         "      ## Roadmap\n"
                         "      - v0.2: web UI with Streamlit\n"
                         "      - v0.3: more languages (French, German, Japanese)\n"
                         "      - v0.4: evaluation suite\n\n"
                         "STEP 2 — Create .env.example\n"
                         "  New file: .env.example. One line:\n"
                         "      OPENAI_API_KEY=put-your-key-here\n\n"
                         "STEP 3 — Create .gitignore\n"
                         "  New file: .gitignore. Two lines:\n"
                         "      .env\n"
                         "      __pycache__/\n\n"
                         "STEP 4 — Push to GitHub.\n"
                         "  Open the 'create new repository' card above, name it polyglot, make it public, click 'Create repository'.\n"
                         "  Then in your terminal (still in the polyglot folder):\n"
                         "      git init\n"
                         "      git add .\n"
                         "      git commit -m \"Polyglot v0.1 — English to Spanish translator\"\n"
                         "      git branch -M main\n"
                         "      git remote add origin https://github.com/YOUR-USERNAME/polyglot.git\n"
                         "      git push -u origin main\n"
                         "  Replace YOUR-USERNAME with your GitHub username.\n\n"
                         "PASS CRITERIA — Polyglot v0.1 ships when:\n"
                         "  ☐ python translate.py works for any English sentence\n"
                         "  ☐ Cost line prints after every call\n"
                         "  ☐ Errors are caught and printed cleanly\n"
                         "  ☐ Inputs over 500 chars are refused\n"
                         "  ☐ README.md is on GitHub\n"
                         "  ☐ .env is NOT on GitHub (your key stays secret)\n"
                         "  ☐ Anyone can clone the repo and run it after adding their own key"),
                reflect("What did you actually learn?",
                        "Without looking at the code, write 3 sentences in notes.txt:\n"
                        "1. What does a 'system prompt' do?\n"
                        "2. Why do we set temperature to 0?\n"
                        "3. How much does one translation cost with gpt-4o-mini?"),
            ]),
    ],
    "topics": [
        "Installing Python",
        "Opening and using a terminal",
        "Getting an OpenAI API key safely",
        "Storing secrets in a .env file",
        "Writing your first Python script",
        "System prompts vs user prompts",
        "Tracking API cost from response.usage",
        "Pushing a project to GitHub",
    ],
    "tasks": [
        "Install Python and verify it works",
        "Sign up for OpenAI and create an API key",
        "Create the polyglot project folder",
        "Write hello.py that returns Spanish text",
        "Upgrade to translate.py with a real system prompt",
        "Add cost tracking and error handling",
        "Push the repo to GitHub with a README",
    ],
    "project": (
        "Polyglot v0.1 — a working English to Spanish translator in your terminal. "
        "Built with the OpenAI API. Tracks cost per call. Handles errors. Refuses "
        "inputs over 500 chars. Pushed to a public GitHub repo called 'polyglot' "
        "with a README that explains how anyone can clone and run it."
    ),
    "exercises": [
        "Try the same sentence 5 times at temperature 1.0 instead of 0 — does it change?",
        "Try gpt-4o (not gpt-4o-mini) — is it better? Is it more expensive?",
        "Add a --formal flag that uses 'usted' instead of 'tú' for politeness",
        "Translate an idiom like 'It's raining cats and dogs' — does it translate literally or correctly?",
    ],
    "questions": [
        "Why is temperature 0 for a translator? When would you raise it?",
        "What's the cost per 1000 translations at gpt-4o-mini prices?",
        "Why do we use a .env file instead of putting the key directly in the code?",
        "What would happen if your API key leaked on GitHub?",
    ],
    "outputs": [
        "Public GitHub repo named 'polyglot'",
        "Working translate.py with cost printing and error handling",
        "README explaining how to install and use",
        ".env.example so others can clone and run",
    ],
}


# ═══════════════════════════════════════════════════════════════════════
# 2. ML ENGINEERING — FlightWise v0.1 — flight delay predictor
# ═══════════════════════════════════════════════════════════════════════
ML_ENG = {
    "context": (
        "This week you are going to build FlightWise — a small machine learning "
        "model that predicts whether a US flight will be delayed by more than 15 "
        "minutes. By Sunday you will have a working Jupyter notebook and a saved "
        "model file you can show to anyone. If you have never trained a model "
        "before, that is fine — every step is given to you exactly."
    ),
    "days": [
        day(1, "What does ML actually do?",
            "Watch and think. No coding today.",
            [
                video("But what is a neural network? — 3Blue1Brown (19 min)",
                      yt("aircAruvnKk"), 19, "3Blue1Brown",
                      "The clearest visual primer on what a model 'learns'."),
                video("Machine Learning in 100 Seconds — Fireship",
                      search("fireship machine learning 100 seconds"), 3, "Fireship", ""),
                reflect("One feature, one guess",
                        "By Sunday you will train a model to predict if a flight will be DELAYED (more than 15 min late). Before you see any data — what ONE feature do you think would predict delays best? Examples: the airline? the time of day? the departure airport? the day of the week? Write your guess in notes.txt. You will find out on Friday if you were right."),
            ]),
        day(2, "Install Python and Anaconda",
            "Set up the tools today. Boring but essential.",
            [
                reading("Anaconda download (official)",
                        "https://www.anaconda.com/download",
                        "Click 'Open' to go download Anaconda. Pick the version for your computer."),
                video("How to install Anaconda on Windows / Mac",
                      search("install anaconda windows mac beginner 2024"),
                      15, "various"),
                exercise("Install + first notebook",
                         "STEP 1 — Open the Anaconda card. Download. Install (click Next on every screen).\n\n"
                         "STEP 2 — Open the terminal.\n"
                         "  WINDOWS: Start menu → 'Anaconda Prompt' → press Enter.\n"
                         "  MAC: Cmd+Space → 'Terminal' → press Enter.\n\n"
                         "STEP 3 — Make the project folder.\n"
                         "      cd Desktop\n"
                         "      mkdir flightwise\n"
                         "      cd flightwise\n\n"
                         "STEP 4 — Start Jupyter Notebook.\n"
                         "      jupyter notebook\n"
                         "  YOU SHOULD SEE: your browser opens to localhost:8888 showing the flightwise folder.\n\n"
                         "STEP 5 — Make a test notebook.\n"
                         "  In the browser, click 'New' (top right) → 'Python 3'. Rename to '01-setup'.\n"
                         "  In the first cell, type:\n"
                         "      import pandas, sklearn, matplotlib\n"
                         "      print('All good:', pandas.__version__, sklearn.__version__)\n"
                         "  Press Shift+Enter.\n"
                         "  YOU SHOULD SEE: 'All good: 2.x.x 1.x.x'.\n"
                         "  Save the notebook (Ctrl+S)."),
            ]),
        day(3, "Download the flight data",
            "Today you get the real dataset. A specific file from Kaggle.",
            [
                reading("Kaggle — Flight Delay and Cancellation Dataset 2019-2023",
                        "https://www.kaggle.com/datasets/patrickzel/flight-delay-and-cancellation-dataset-2019-2023",
                        "Click 'Open' to go to the dataset. You will need to sign up for Kaggle (free)."),
                reading("Kaggle — sign up",
                        "https://www.kaggle.com/account/login",
                        "If you do not have a Kaggle account yet, sign up here first."),
                exercise("Download and load the data",
                         "STEP 1 — Sign up for Kaggle (free).\n"
                         "  Open the 'Kaggle sign up' card. Make an account with your email or Google.\n\n"
                         "STEP 2 — Download the dataset.\n"
                         "  Open the 'Flight Delay' card. Click the big 'Download' button on the right.\n"
                         "  You get a .zip file. Unzip it. Inside, find a file called 'flights_sample_3m.csv' (or similar — it is about 250MB).\n\n"
                         "STEP 3 — Put the file in your project.\n"
                         "  In the flightwise folder, make a sub-folder called 'data'.\n"
                         "  Move the CSV into flightwise/data/ and rename it to flights.csv\n\n"
                         "STEP 4 — Load it in Jupyter.\n"
                         "  In Jupyter, make a new notebook '02-load'. In the first cell:\n"
                         "      import pandas as pd\n"
                         "      df = pd.read_csv('data/flights.csv')\n"
                         "      print('Rows:', len(df))\n"
                         "      print('Columns:', list(df.columns))\n"
                         "      df.head()\n"
                         "  Press Shift+Enter.\n"
                         "  YOU SHOULD SEE: about 3 million rows, columns like AIRLINE, ORIGIN, DEST, CRS_DEP_TIME, ARR_DELAY.\n\n"
                         "  IF YOU SEE 'FileNotFoundError': the CSV is not in flightwise/data/. Check the path."),
            ]),
        day(4, "Clean the data and create the target",
            "Today we pick the columns we need and make a 'delayed yes/no' column.",
            [
                exercise("Clean the data",
                         "Make a new notebook '03-clean'. In each cell, type the code and press Shift+Enter.\n\n"
                         "CELL 1 — Load the data.\n"
                         "      import pandas as pd\n"
                         "      df = pd.read_csv('data/flights.csv')\n"
                         "      print('Starting rows:', len(df))\n\n"
                         "CELL 2 — Drop rows where the delay is missing (cancelled flights).\n"
                         "      df = df.dropna(subset=['ARR_DELAY'])\n"
                         "      print('After dropping missing delays:', len(df))\n\n"
                         "CELL 3 — Make the target column.\n"
                         "      df['delayed'] = (df['ARR_DELAY'] > 15).astype(int)\n"
                         "      print('Delayed:', df['delayed'].sum(), '/', len(df))\n"
                         "      print('Percent delayed:', round(df['delayed'].mean() * 100, 1), '%')\n"
                         "  YOU SHOULD SEE: about 15-20% delayed.\n\n"
                         "CELL 4 — Keep only the columns we need.\n"
                         "      keep = ['AIRLINE', 'ORIGIN', 'DEST', 'CRS_DEP_TIME', 'DAY_OF_WEEK', 'MONTH', 'DISTANCE', 'delayed']\n"
                         "      df = df[keep]\n"
                         "      print('Shape now:', df.shape)\n\n"
                         "CELL 5 — Add a 'hour of departure' column. CRS_DEP_TIME is like 1430 meaning 14:30.\n"
                         "      df['dep_hour'] = df['CRS_DEP_TIME'] // 100\n\n"
                         "CELL 6 — Save the clean data.\n"
                         "      df.to_csv('data/clean.csv', index=False)\n"
                         "      print('Saved data/clean.csv —', len(df), 'rows')"),
            ]),
        day(5, "Look at the data — find what predicts delay",
            "Today you make 3 charts to see what features matter.",
            [
                exercise("EDA — three charts",
                         "Make a new notebook '04-eda'.\n\n"
                         "CELL 1 — Load + setup.\n"
                         "      import pandas as pd\n"
                         "      import matplotlib.pyplot as plt\n"
                         "      df = pd.read_csv('data/clean.csv')\n\n"
                         "CELL 2 — Delay rate by hour of day.\n"
                         "      by_hour = df.groupby('dep_hour')['delayed'].mean() * 100\n"
                         "      by_hour.plot(kind='bar', figsize=(12, 5), title='% Delayed by hour of day')\n"
                         "      plt.ylabel('% delayed')\n"
                         "      plt.tight_layout()\n"
                         "      plt.savefig('delays_by_hour.png')\n"
                         "      plt.show()\n"
                         "  Write under the chart (markdown cell): which hour has the most delays?\n\n"
                         "CELL 3 — Delay rate by airline (top 10).\n"
                         "      by_airline = df.groupby('AIRLINE')['delayed'].mean().sort_values(ascending=False) * 100\n"
                         "      by_airline.head(10).plot(kind='barh', figsize=(10, 6), title='% Delayed by airline (worst 10)')\n"
                         "      plt.xlabel('% delayed')\n"
                         "      plt.tight_layout()\n"
                         "      plt.savefig('delays_by_airline.png')\n"
                         "      plt.show()\n\n"
                         "CELL 4 — Delay rate by day of week.\n"
                         "      by_dow = df.groupby('DAY_OF_WEEK')['delayed'].mean() * 100\n"
                         "      by_dow.plot(kind='bar', figsize=(8, 5), title='% Delayed by day of week (1=Mon, 7=Sun)')\n"
                         "      plt.ylabel('% delayed')\n"
                         "      plt.tight_layout()\n"
                         "      plt.savefig('delays_by_dow.png')\n"
                         "      plt.show()\n\n"
                         "Compare your guess from Day 1 to what you see. Were you right?"),
            ]),
        day(6, "Train your first model",
            "Today you train a model. Two lines of code. It is shockingly simple.",
            [
                video("Logistic Regression for beginners (15 min)",
                      search("logistic regression scikit-learn beginner tutorial"),
                      15, "various"),
                exercise("Train and evaluate",
                         "Make a new notebook '05-model'.\n\n"
                         "CELL 1 — Load.\n"
                         "      import pandas as pd\n"
                         "      from sklearn.model_selection import train_test_split\n"
                         "      from sklearn.linear_model import LogisticRegression\n"
                         "      from sklearn.metrics import classification_report\n"
                         "      import joblib\n"
                         "      df = pd.read_csv('data/clean.csv')\n\n"
                         "CELL 2 — One-hot encode the text columns.\n"
                         "      # Keep top 20 airlines and airports so the model isn't huge\n"
                         "      top_airlines = df['AIRLINE'].value_counts().head(20).index\n"
                         "      df['AIRLINE'] = df['AIRLINE'].where(df['AIRLINE'].isin(top_airlines), 'OTHER')\n"
                         "      top_origins = df['ORIGIN'].value_counts().head(20).index\n"
                         "      df['ORIGIN'] = df['ORIGIN'].where(df['ORIGIN'].isin(top_origins), 'OTHER')\n"
                         "      top_dests = df['DEST'].value_counts().head(20).index\n"
                         "      df['DEST'] = df['DEST'].where(df['DEST'].isin(top_dests), 'OTHER')\n"
                         "      X = pd.get_dummies(df.drop(columns=['delayed', 'CRS_DEP_TIME']), drop_first=True)\n"
                         "      y = df['delayed']\n\n"
                         "CELL 3 — Split into train and test.\n"
                         "      X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n"
                         "      print('Train rows:', len(X_train), 'Test rows:', len(X_test))\n\n"
                         "CELL 4 — Train.\n"
                         "      model = LogisticRegression(max_iter=1000, class_weight='balanced')\n"
                         "      model.fit(X_train, y_train)\n"
                         "      print('Trained!')\n"
                         "  This takes about 30 seconds.\n\n"
                         "CELL 5 — Test it.\n"
                         "      preds = model.predict(X_test)\n"
                         "      print(classification_report(y_test, preds))\n"
                         "  YOU SHOULD SEE: a table with precision, recall, f1 for class 0 and class 1.\n"
                         "  Recall for class 1 (delayed) should be around 0.50-0.60.\n\n"
                         "CELL 6 — Save the model.\n"
                         "      joblib.dump(model, 'model.pkl')\n"
                         "      joblib.dump(X.columns.tolist(), 'features.pkl')\n"
                         "      print('Saved model.pkl and features.pkl')"),
            ]),
        day(7, "Ship FlightWise v0.1 to GitHub",
            "Today you push the whole project online.",
            [
                reading("GitHub — sign up (free)",
                        "https://github.com/signup",
                        "Click 'Open' if you don't have an account."),
                reading("GitHub — create new repository",
                        "https://github.com/new",
                        "Click 'Open'. Name: flightwise. Public."),
                exercise("Push and document",
                         "STEP 1 — Write a README.md in the flightwise folder.\n"
                         "  Use VS Code or any text editor:\n\n"
                         "      # FlightWise v0.1\n"
                         "      A binary classifier predicting whether a US flight will be delayed by 15+ minutes.\n"
                         "      Trained on Kaggle's Flight Delay 2019-2023 dataset.\n"
                         "      \n"
                         "      ## Notebooks\n"
                         "      1. 01-setup — verify environment\n"
                         "      2. 02-load — load the raw CSV\n"
                         "      3. 03-clean — pick columns, create target, save clean.csv\n"
                         "      4. 04-eda — three charts of what predicts delay\n"
                         "      5. 05-model — train a logistic regression baseline\n"
                         "      \n"
                         "      ## Result\n"
                         "      Recall on delayed flights: ~55%\n"
                         "      Model size: ~50KB (model.pkl)\n"
                         "      \n"
                         "      ## Honest verdict\n"
                         "      Good enough to be useful (better than 50/50 guess). Not good enough to deploy.\n"
                         "      Next week: feature engineering, tree models, hyperparameter tuning.\n\n"
                         "STEP 2 — Save a requirements.txt.\n"
                         "  In the terminal:\n"
                         "      pip freeze > requirements.txt\n\n"
                         "STEP 3 — Make .gitignore.\n"
                         "  New file. Two lines:\n"
                         "      data/\n"
                         "      .ipynb_checkpoints/\n\n"
                         "STEP 4 — Make the repo and push.\n"
                         "  Open the 'create new repository' card, name it flightwise, public, click Create.\n"
                         "  In your terminal:\n"
                         "      git init\n"
                         "      git add .\n"
                         "      git commit -m \"FlightWise v0.1 — baseline flight delay classifier\"\n"
                         "      git branch -M main\n"
                         "      git remote add origin https://github.com/YOUR-USERNAME/flightwise.git\n"
                         "      git push -u origin main\n\n"
                         "PASS CRITERIA — FlightWise v0.1 ships when:\n"
                         "  ☐ 5 notebooks run top to bottom without errors\n"
                         "  ☐ Recall for class 1 (delayed) is at least 50% in the classification_report\n"
                         "  ☐ model.pkl is committed (it should be under 5MB)\n"
                         "  ☐ README explains what the project does and how it scored\n"
                         "  ☐ requirements.txt is committed\n"
                         "  ☐ The data/ folder is in .gitignore (CSV is too big for git)"),
                reflect("What surprised you?",
                        "Write 2 sentences in notes.txt:\n"
                        "1. What was the strongest predictor of delay you saw?\n"
                        "2. Did your model do better or worse than you expected?"),
            ]),
    ],
    "topics": [
        "Anaconda + Jupyter setup",
        "Loading CSV data with pandas",
        "Binary classification targets",
        "Dropping nulls + selecting columns",
        "EDA: groupby + bar charts",
        "One-hot encoding (pd.get_dummies)",
        "Train/test split",
        "Logistic regression with class_weight='balanced'",
        "Evaluating with classification_report",
    ],
    "tasks": [
        "Install Anaconda + open Jupyter",
        "Sign up for Kaggle + download the flight delay CSV",
        "Clean: drop missing, make target, pick 7 features",
        "EDA: 3 bar charts of delay rate by hour, airline, day-of-week",
        "Train a LogisticRegression baseline",
        "Get recall ≥ 50% on the 'delayed' class",
        "Push everything to GitHub with README",
    ],
    "project": (
        "FlightWise v0.1 — a logistic-regression model that predicts if a US "
        "flight will be 15+ minutes late. Trained on Kaggle's 2019-2023 flight "
        "delay dataset (~3M rows). 5 notebooks + saved model + README. Recall on "
        "delayed flights ≥ 50%. Public GitHub repo named flightwise."
    ),
    "exercises": [
        "Train without class_weight='balanced' — what happens to recall?",
        "Drop AIRLINE from features and retrain. Does accuracy fall? Why?",
        "Predict on a single hand-crafted flight: 7am, Monday, AA, JFK → LAX",
        "Find one test row where the model was very wrong and look at why",
    ],
    "questions": [
        "Why is accuracy a bad metric for this problem?",
        "What's the difference between precision and recall?",
        "Why do we one-hot encode AIRLINE instead of using the text directly?",
        "If American Airlines used your model to overbook flights, what could go wrong?",
    ],
    "outputs": [
        "Public GitHub repo named flightwise",
        "5 notebooks committed",
        "model.pkl + features.pkl",
        "README with the result and honest verdict",
    ],
}


# ═══════════════════════════════════════════════════════════════════════
# 3. FULL STACK WEB — Bean Forge Café — fictional café 1-pager
# ═══════════════════════════════════════════════════════════════════════
FS_WEB = {
    "context": (
        "This week you are going to build a real, live website for a fictional "
        "coffee shop called Bean Forge. We give you the name, menu, prices, hours "
        "— everything. By Sunday it will be online with a public URL anyone can "
        "visit on their phone. If you have never written HTML before, that is "
        "fine. Every line of code is given to you exactly."
    ),
    "days": [
        day(1, "How the web works",
            "Today you watch and write. No coding yet.",
            [
                video("HTML in 100 Seconds — Fireship", yt("ok-plXXHlWw"), 2, "Fireship", ""),
                video("How the Internet works (8 min)",
                      search("how the internet works 8 minutes beginner"),
                      8, "various"),
                reflect("Bean Forge spec",
                        "Bean Forge is a fictional specialty coffee shop. Tagline: 'Coffee, sharpened.' Menu:\n"
                        "  - Espresso $3\n  - Cortado $4\n  - Pour Over $5\n  - Cold Brew $5\n  - Croissant $4\n"
                        "Hours: Mon-Fri 7am-6pm, Sat-Sun 8am-4pm.\n"
                        "Address: 42 Anvil Street.\n"
                        "Phone: +1 555-0142.\n\n"
                        "Save these details in a file called spec.txt in a new folder called 'beanforge' on your Desktop. We'll use it all week."),
            ]),
        day(2, "Install VS Code and write the HTML skeleton",
            "Today you write your first HTML page.",
            [
                reading("VS Code (free code editor)",
                        "https://code.visualstudio.com",
                        "Click 'Open' to download VS Code. We will use it all week."),
                video("HTML for absolute beginners",
                      search("html crash course beginner web dev simplified"),
                      30, "Web Dev Simplified"),
                exercise("Write the structure",
                         "STEP 1 — Install VS Code from the card above. Open it.\n\n"
                         "STEP 2 — Open the beanforge folder.\n"
                         "  File → Open Folder → pick the 'beanforge' folder on your Desktop.\n\n"
                         "STEP 3 — Create index.html.\n"
                         "  File → New File. Save as 'index.html' in the beanforge folder.\n"
                         "  Type this exactly:\n\n"
                         "      <!DOCTYPE html>\n"
                         "      <html lang='en'>\n"
                         "      <head>\n"
                         "        <meta charset='utf-8'>\n"
                         "        <meta name='viewport' content='width=device-width, initial-scale=1'>\n"
                         "        <title>Bean Forge — Coffee, sharpened.</title>\n"
                         "      </head>\n"
                         "      <body>\n"
                         "        <header>\n"
                         "          <h1>Bean Forge</h1>\n"
                         "          <p>Coffee, sharpened.</p>\n"
                         "        </header>\n"
                         "        <section id='menu'>\n"
                         "          <h2>Menu</h2>\n"
                         "          <ul>\n"
                         "            <li>Espresso — $3</li>\n"
                         "            <li>Cortado — $4</li>\n"
                         "            <li>Pour Over — $5</li>\n"
                         "            <li>Cold Brew — $5</li>\n"
                         "            <li>Croissant — $4</li>\n"
                         "          </ul>\n"
                         "        </section>\n"
                         "        <section id='hours'>\n"
                         "          <h2>Hours</h2>\n"
                         "          <p>Mon-Fri: 7am - 6pm</p>\n"
                         "          <p>Sat-Sun: 8am - 4pm</p>\n"
                         "        </section>\n"
                         "        <section id='visit'>\n"
                         "          <h2>Visit</h2>\n"
                         "          <p>42 Anvil Street</p>\n"
                         "          <p>+1 555-0142</p>\n"
                         "        </section>\n"
                         "      </body>\n"
                         "      </html>\n\n"
                         "STEP 4 — View it in your browser.\n"
                         "  Right-click index.html in VS Code → 'Reveal in File Explorer' (Win) or 'Reveal in Finder' (Mac).\n"
                         "  Double-click index.html.\n"
                         "  YOU SHOULD SEE: the page open in your browser with the Bean Forge text. No styling yet — that's tomorrow."),
            ]),
        day(3, "Style it with CSS",
            "Today you make it look like a real coffee shop.",
            [
                video("Modern CSS — Kevin Powell",
                      search("kevin powell modern css beginner 2024"),
                      35, "Kevin Powell"),
                exercise("Add CSS",
                         "STEP 1 — Make a new file: style.css in the beanforge folder. Type:\n\n"
                         "      :root {\n"
                         "        --coffee: #3b2418;\n"
                         "        --cream: #f5ead7;\n"
                         "        --copper: #b87333;\n"
                         "      }\n"
                         "      * { box-sizing: border-box; margin: 0; padding: 0; }\n"
                         "      body {\n"
                         "        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n"
                         "        background: var(--cream);\n"
                         "        color: var(--coffee);\n"
                         "        line-height: 1.6;\n"
                         "      }\n"
                         "      header {\n"
                         "        background: var(--coffee);\n"
                         "        color: var(--cream);\n"
                         "        padding: 4rem 1.5rem;\n"
                         "        text-align: center;\n"
                         "      }\n"
                         "      header h1 { font-size: 3rem; margin-bottom: 0.5rem; }\n"
                         "      header p { color: var(--copper); font-size: 1.25rem; }\n"
                         "      section { padding: 3rem 1.5rem; max-width: 800px; margin: 0 auto; }\n"
                         "      section h2 {\n"
                         "        color: var(--copper);\n"
                         "        font-size: 1.5rem;\n"
                         "        margin-bottom: 1rem;\n"
                         "        border-bottom: 2px solid var(--copper);\n"
                         "        padding-bottom: 0.5rem;\n"
                         "      }\n"
                         "      ul { list-style: none; }\n"
                         "      li {\n"
                         "        padding: 0.75rem 0;\n"
                         "        border-bottom: 1px dashed rgba(59,36,24,0.2);\n"
                         "        font-size: 1.0625rem;\n"
                         "      }\n\n"
                         "STEP 2 — Link the CSS to your HTML.\n"
                         "  Open index.html. Inside <head>, after the <title>, add:\n"
                         "      <link rel='stylesheet' href='style.css'>\n\n"
                         "STEP 3 — Reload your browser.\n"
                         "  Refresh the page. YOU SHOULD SEE: cream background, dark brown header, copper accent. Looks like a coffee shop."),
            ]),
        day(4, "Make it work on phones",
            "Most visitors will be on a phone. Today we make it look good there.",
            [
                exercise("Mobile-first responsive",
                         "STEP 1 — Open Chrome (or Edge). Open your Bean Forge page.\n"
                         "  Press F12 to open DevTools.\n"
                         "  Click the small phone icon (top-left of DevTools) — 'Toggle device toolbar'.\n"
                         "  Pick 'iPhone 13' from the dropdown at top.\n"
                         "  See how the page looks on a phone. Is anything too wide or too cramped?\n\n"
                         "STEP 2 — Open style.css. At the bottom, add this for bigger screens:\n\n"
                         "      @media (min-width: 600px) {\n"
                         "        header { padding: 6rem 2rem; }\n"
                         "        header h1 { font-size: 4rem; }\n"
                         "        section { padding: 4rem 2rem; }\n"
                         "      }\n"
                         "      @media (min-width: 900px) {\n"
                         "        #menu ul {\n"
                         "          display: grid;\n"
                         "          grid-template-columns: 1fr 1fr;\n"
                         "          gap: 0 2rem;\n"
                         "        }\n"
                         "      }\n\n"
                         "STEP 3 — In DevTools, test these widths:\n"
                         "  iPhone 13 (390px) — single column\n"
                         "  iPad (768px) — single column, bigger padding\n"
                         "  Desktop (1280px) — menu in 2 columns\n\n"
                         "  Looks right? Move on. Looks broken? Tweak the CSS and try again."),
            ]),
        day(5, "Add click-to-call and map link",
            "Real customers tap, they don't type. Make the phone and address clickable.",
            [
                exercise("Make it tappable",
                         "STEP 1 — Open index.html.\n\n"
                         "STEP 2 — In the #visit section, replace the plain text with these clickable links:\n\n"
                         "      <p><a href='tel:+15550142'>+1 555-0142</a></p>\n"
                         "      <p><a href='https://www.google.com/maps/search/?api=1&query=42+Anvil+Street' target='_blank'>42 Anvil Street — Get directions</a></p>\n"
                         "      <p><a href='mailto:hello@beanforge.cafe'>hello@beanforge.cafe</a></p>\n\n"
                         "STEP 3 — Style the links. In style.css, add:\n\n"
                         "      a {\n"
                         "        color: var(--copper);\n"
                         "        text-decoration: none;\n"
                         "        border-bottom: 1px solid var(--copper);\n"
                         "      }\n"
                         "      a:hover { background: var(--copper); color: var(--cream); }\n\n"
                         "STEP 4 — Test on your phone.\n"
                         "  Email yourself the index.html (or open the live page after deploying tomorrow).\n"
                         "  Tap the phone number — your phone's dialer opens.\n"
                         "  Tap the address — Google Maps opens."),
            ]),
        day(6, "Push to GitHub and deploy on Netlify",
            "Today you put it ONLINE. A real public URL.",
            [
                reading("GitHub — sign up (free)",
                        "https://github.com/signup",
                        "Click 'Open' if you don't have an account yet."),
                reading("GitHub — create new repository",
                        "https://github.com/new",
                        "Click 'Open'. Name: beanforge. Public."),
                reading("Netlify — sign up (free)",
                        "https://app.netlify.com/signup",
                        "Click 'Open'. Sign up with GitHub for the easiest setup."),
                exercise("Push and deploy",
                         "STEP 1 — Install Git (if you haven't).\n"
                         "  Open the terminal (Anaconda Prompt on Win, Terminal on Mac).\n"
                         "  Type: git --version\n"
                         "  If you see 'command not found', install Git from https://git-scm.com\n\n"
                         "STEP 2 — Push to GitHub.\n"
                         "  Open the 'create new repository' card above. Name: beanforge. Public. Create.\n"
                         "  In your terminal:\n"
                         "      cd Desktop/beanforge\n"
                         "      git init\n"
                         "      git add .\n"
                         "      git commit -m \"Bean Forge cafe site v0.1\"\n"
                         "      git branch -M main\n"
                         "      git remote add origin https://github.com/YOUR-USERNAME/beanforge.git\n"
                         "      git push -u origin main\n\n"
                         "STEP 3 — Deploy on Netlify.\n"
                         "  Open the Netlify sign up card. Sign up with your GitHub account (easiest).\n"
                         "  In the dashboard, click 'Add new site' → 'Import an existing project' → GitHub → pick the 'beanforge' repo → click 'Deploy'.\n"
                         "  After about 30 seconds you get a URL like 'unusual-cookie-1234.netlify.app'.\n"
                         "  YOU SHOULD SEE: your Bean Forge site live at that URL.\n\n"
                         "STEP 4 — Rename the URL.\n"
                         "  In Netlify, go to Site settings → Domain management → click the random subdomain → change to 'yourname-beanforge'.\n"
                         "  New URL: yourname-beanforge.netlify.app\n\n"
                         "  Open the URL on your phone. Tap the phone link. Tap the address. Everything should work."),
            ]),
        day(7, "Polish and document",
            "Today you make it look professional and write the README.",
            [
                exercise("Final polish",
                         "STEP 1 — Add a favicon (the tiny icon in browser tabs).\n"
                         "  Go to https://favicon.io/emoji-favicons/hot-beverage and download.\n"
                         "  Unzip the file. Move the 'favicon.ico' into your beanforge folder.\n"
                         "  In index.html <head>, add: <link rel='icon' href='favicon.ico'>\n\n"
                         "STEP 2 — Add Open Graph tags (for nice WhatsApp / Twitter previews).\n"
                         "  In <head>, add:\n"
                         "      <meta name='description' content='Bean Forge — Coffee, sharpened.'>\n"
                         "      <meta property='og:title' content='Bean Forge'>\n"
                         "      <meta property='og:description' content='Specialty coffee, sharpened.'>\n\n"
                         "STEP 3 — Run Lighthouse.\n"
                         "  In Chrome on your live Netlify URL, press F12 → 'Lighthouse' tab → click 'Analyze page load'.\n"
                         "  YOU SHOULD SEE: scores for Performance, Accessibility, Best Practices, SEO. Aim for 90+ on all.\n"
                         "  Take a screenshot. Save as 'lighthouse.png' in your folder.\n\n"
                         "STEP 4 — Write README.md.\n"
                         "  In VS Code, new file: README.md. Type:\n\n"
                         "      # Bean Forge\n"
                         "      A 1-page site for a fictional specialty coffee shop.\n"
                         "      \n"
                         "      ## Live URL\n"
                         "      https://yourname-beanforge.netlify.app\n"
                         "      \n"
                         "      ## Tech\n"
                         "      Plain HTML + CSS. No framework. Deployed on Netlify.\n"
                         "      \n"
                         "      ## Lighthouse\n"
                         "      ![Lighthouse scores](lighthouse.png)\n\n"
                         "STEP 5 — Push everything.\n"
                         "      git add .\n"
                         "      git commit -m \"Add favicon, OG tags, Lighthouse, README\"\n"
                         "      git push\n\n"
                         "  Netlify auto-redeploys in 30 seconds.\n\n"
                         "PASS CRITERIA — Bean Forge v0.1 ships when:\n"
                         "  ☐ Live URL works on phone and desktop\n"
                         "  ☐ Phone number is tappable on mobile\n"
                         "  ☐ Map link opens Google Maps\n"
                         "  ☐ Lighthouse 90+ on all 4 categories\n"
                         "  ☐ README has the live URL at the top\n"
                         "  ☐ Favicon shows in the browser tab"),
                reflect("Show somebody",
                        "Send the live URL to one friend over WhatsApp. What was their reaction? Write 1 sentence."),
            ]),
    ],
    "topics": [
        "Semantic HTML (header, section, footer)",
        "CSS custom properties + responsive design",
        "Mobile-first media queries",
        "tel: and Maps deep links",
        "Git basics — init, add, commit, push",
        "Netlify deploy from GitHub",
        "Favicons + Open Graph tags",
        "Lighthouse performance audit",
    ],
    "tasks": [
        "Install VS Code",
        "Write the HTML skeleton for Bean Forge",
        "Style it with CSS using the coffee palette",
        "Make it responsive at phone / tablet / desktop widths",
        "Add tel: and Maps link, make them tappable",
        "Push to GitHub and deploy on Netlify",
        "Add favicon, OG tags, score ≥ 90 on Lighthouse",
    ],
    "project": (
        "Bean Forge v0.1 — a fictional coffee shop's 1-page website. Plain HTML + "
        "CSS, no framework. Mobile-first responsive. Clickable phone + map. Live on "
        "Netlify at yourname-beanforge.netlify.app. Lighthouse ≥ 90. Public GitHub "
        "repo named beanforge."
    ),
    "exercises": [
        "Add a dark-mode by using @media (prefers-color-scheme: dark)",
        "Add a 'Today's special' section that changes copy based on day of week (you'll need JS — try it!)",
        "Replace the menu list with a CSS grid that has 3 columns on desktop",
        "Add a fade-in animation on the header (CSS @keyframes)",
    ],
    "questions": [
        "Why does mobile-first CSS use min-width instead of max-width?",
        "What does the tel: link do that a normal phone number doesn't?",
        "Why do search engines reward Open Graph tags?",
        "If Bean Forge added online ordering tomorrow, what would you need to build?",
    ],
    "outputs": [
        "Live URL on Netlify",
        "Public GitHub repo named beanforge",
        "Lighthouse screenshot in the repo",
        "README pointing to the live URL",
    ],
}


# ═══════════════════════════════════════════════════════════════════════
# 4. MOBILE — Hydra v0.1 — water tracker
# ═══════════════════════════════════════════════════════════════════════
MOBILE = {
    "context": (
        "This week you are going to build Hydra — a small water-tracking app. "
        "8 glass icons on the screen. Tap one to mark it filled. By Sunday it "
        "will run on YOUR phone as a real installed app, not just a preview. "
        "If you have never built an app before, that is fine. Every step is given."
    ),
    "days": [
        day(1, "Why Expo + React Native?",
            "Today is mostly watching. Get the picture.",
            [
                video("React Native in 100 Seconds — Fireship", yt("gvkqT_Uoahw"), 2, "Fireship", ""),
                video("What is Expo? — 8 min",
                      search("what is expo react native beginner 2024"),
                      8, "various"),
                reflect("Sketch Hydra",
                        "Hydra is a water tracker. 8 glass icons on screen. Tap a glass — it fills. Tap again — it empties. There's a counter saying 'X / 8 glasses today'. When you hit 8, a small '✨ You hit 8' message appears.\n\n"
                        "On a piece of paper or in a notes app, sketch what this looks like. 1 minute. Just so you have the picture in mind."),
            ]),
        day(2, "Install Node.js and Expo Go",
            "Today we install the tools and get a Hello World running on your actual phone.",
            [
                reading("Node.js — download (official)",
                        "https://nodejs.org/en/download",
                        "Click 'Open' to download Node.js. Pick the LTS version for your computer."),
                reading("Expo Go (your phone)",
                        "https://expo.dev/client",
                        "Click 'Open' to learn about Expo Go. Then install it from the App Store (iPhone) or Play Store (Android) — search for 'Expo Go'."),
                exercise("Hello, phone",
                         "STEP 1 — Install Node.js. Open the Node.js card, download LTS, install (click Next on every screen).\n\n"
                         "STEP 2 — Install Expo Go on your phone (App Store or Play Store).\n\n"
                         "STEP 3 — Open a terminal (Anaconda Prompt on Win, Terminal on Mac).\n"
                         "      cd Desktop\n"
                         "      npx create-expo-app@latest hydra --template blank\n"
                         "  This downloads about 100MB. Takes 2-3 minutes. When done you have a 'hydra' folder.\n\n"
                         "STEP 4 — Start the app.\n"
                         "      cd hydra\n"
                         "      npx expo start\n"
                         "  YOU SHOULD SEE: a big QR code in your terminal.\n\n"
                         "STEP 5 — Scan the QR code.\n"
                         "  ANDROID: open Expo Go on your phone, tap 'Scan QR code', point at the terminal.\n"
                         "  IPHONE: open the Camera app, point at the QR code, tap the notification.\n"
                         "  YOU SHOULD SEE on your phone: 'Open up App.js to start working on your app!'\n"
                         "  Your computer and your phone must be on the same WiFi for this to work."),
            ]),
        day(3, "React basics — make a Glass component",
            "Today you write your first piece of UI code.",
            [
                video("React in 100 Seconds — Fireship", yt("Tn6-PIqc4UM"), 2, "Fireship", ""),
                exercise("Glass component",
                         "STEP 1 — Open VS Code on the 'hydra' folder.\n\n"
                         "STEP 2 — Open App.js. Replace EVERYTHING in it with this:\n\n"
                         "      import { StatusBar } from 'expo-status-bar';\n"
                         "      import { StyleSheet, Text, View } from 'react-native';\n"
                         "\n"
                         "      function Glass({ filled }) {\n"
                         "        return (\n"
                         "          <View style={styles.glass}>\n"
                         "            <Text style={styles.glassEmoji}>{filled ? '💧' : '⚪'}</Text>\n"
                         "          </View>\n"
                         "        );\n"
                         "      }\n"
                         "\n"
                         "      export default function App() {\n"
                         "        return (\n"
                         "          <View style={styles.container}>\n"
                         "            <Text style={styles.title}>Hydra</Text>\n"
                         "            <View style={styles.row}>\n"
                         "              <Glass filled={true} />\n"
                         "              <Glass filled={false} />\n"
                         "              <Glass filled={false} />\n"
                         "              <Glass filled={false} />\n"
                         "            </View>\n"
                         "            <StatusBar style='auto' />\n"
                         "          </View>\n"
                         "        );\n"
                         "      }\n"
                         "\n"
                         "      const styles = StyleSheet.create({\n"
                         "        container: { flex: 1, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },\n"
                         "        title: { fontSize: 36, fontWeight: 'bold', color: '#0c4a6e', marginBottom: 40 },\n"
                         "        row: { flexDirection: 'row', gap: 10 },\n"
                         "        glass: { width: 60, height: 80, borderWidth: 2, borderColor: '#0284c7', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },\n"
                         "        glassEmoji: { fontSize: 28 },\n"
                         "      });\n\n"
                         "STEP 3 — Save.\n"
                         "  Your phone should AUTOMATICALLY reload (Expo hot-reload).\n"
                         "  YOU SHOULD SEE: 'Hydra' title + 4 small boxes, first one with a 💧, rest with ⚪."),
            ]),
        day(4, "Tap to fill — useState",
            "Today you make the glasses tappable.",
            [
                video("useState in 10 minutes",
                      search("usestate react hook beginner 10 minutes"),
                      10, "various"),
                exercise("Tappable glasses",
                         "STEP 1 — Open App.js. Replace the entire file with this:\n\n"
                         "      import { useState } from 'react';\n"
                         "      import { StatusBar } from 'expo-status-bar';\n"
                         "      import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';\n"
                         "\n"
                         "      function Glass({ filled, onPress }) {\n"
                         "        return (\n"
                         "          <TouchableOpacity style={styles.glass} onPress={onPress}>\n"
                         "            <Text style={styles.glassEmoji}>{filled ? '💧' : '⚪'}</Text>\n"
                         "          </TouchableOpacity>\n"
                         "        );\n"
                         "      }\n"
                         "\n"
                         "      export default function App() {\n"
                         "        const [glasses, setGlasses] = useState([false, false, false, false, false, false, false, false]);\n"
                         "        const count = glasses.filter(g => g).length;\n"
                         "\n"
                         "        const toggle = (i) => {\n"
                         "          const next = [...glasses];\n"
                         "          next[i] = !next[i];\n"
                         "          setGlasses(next);\n"
                         "        };\n"
                         "\n"
                         "        return (\n"
                         "          <View style={styles.container}>\n"
                         "            <Text style={styles.title}>Hydra</Text>\n"
                         "            <Text style={styles.counter}>{count} / 8 glasses today</Text>\n"
                         "            <View style={styles.grid}>\n"
                         "              {glasses.map((filled, i) => (\n"
                         "                <Glass key={i} filled={filled} onPress={() => toggle(i)} />\n"
                         "              ))}\n"
                         "            </View>\n"
                         "            {count === 8 && <Text style={styles.celebrate}>✨ You hit 8 today.</Text>}\n"
                         "            <StatusBar style='auto' />\n"
                         "          </View>\n"
                         "        );\n"
                         "      }\n"
                         "\n"
                         "      const styles = StyleSheet.create({\n"
                         "        container: { flex: 1, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', padding: 20 },\n"
                         "        title: { fontSize: 36, fontWeight: 'bold', color: '#0c4a6e', marginBottom: 10 },\n"
                         "        counter: { fontSize: 18, color: '#075985', marginBottom: 30 },\n"
                         "        grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, maxWidth: 320 },\n"
                         "        glass: { width: 60, height: 80, borderWidth: 2, borderColor: '#0284c7', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },\n"
                         "        glassEmoji: { fontSize: 28 },\n"
                         "        celebrate: { marginTop: 30, fontSize: 18, color: '#16a34a', fontWeight: 'bold' },\n"
                         "      });\n\n"
                         "STEP 2 — Save. Phone auto-reloads.\n"
                         "  Test on your phone — tap each glass. They fill and empty.\n"
                         "  Tap all 8 — '✨ You hit 8 today.' appears."),
            ]),
        day(5, "Save progress — AsyncStorage",
            "Right now if you close the app, progress is lost. Today we fix that.",
            [
                exercise("Persist with AsyncStorage",
                         "STEP 1 — Install AsyncStorage.\n"
                         "  In your terminal (in the hydra folder):\n"
                         "      npx expo install @react-native-async-storage/async-storage\n\n"
                         "STEP 2 — Open App.js. Add at the top with the other imports:\n"
                         "      import { useEffect } from 'react';\n"
                         "      import AsyncStorage from '@react-native-async-storage/async-storage';\n\n"
                         "STEP 3 — Inside the App() function, right after the useState line, add:\n\n"
                         "      // Load saved state when the app opens\n"
                         "      useEffect(() => {\n"
                         "        AsyncStorage.getItem('hydra-glasses').then(saved => {\n"
                         "          if (saved) setGlasses(JSON.parse(saved));\n"
                         "        });\n"
                         "      }, []);\n\n"
                         "STEP 4 — Update the toggle function to also save:\n\n"
                         "      const toggle = (i) => {\n"
                         "        const next = [...glasses];\n"
                         "        next[i] = !next[i];\n"
                         "        setGlasses(next);\n"
                         "        AsyncStorage.setItem('hydra-glasses', JSON.stringify(next));\n"
                         "      };\n\n"
                         "STEP 5 — Test on your phone.\n"
                         "  Tap 3 glasses. Close Expo Go FULLY (swipe up).\n"
                         "  Reopen Expo Go, scan the QR again.\n"
                         "  YOU SHOULD SEE: the 3 glasses are STILL filled. State survived the close."),
            ]),
        day(6, "Polish the look",
            "Today we make it feel like a real app.",
            [
                exercise("Make it pretty",
                         "STEP 1 — Add SafeAreaView so content doesn't go under the iPhone notch.\n"
                         "  At the top of App.js, change the react-native import to:\n"
                         "      import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';\n\n"
                         "STEP 2 — In the JSX, replace the OUTER <View style={styles.container}> with <SafeAreaView style={styles.container}>. Match the closing tag too.\n\n"
                         "STEP 3 — Add a reset button. After the celebrate Text, before </SafeAreaView>, add:\n\n"
                         "      <TouchableOpacity style={styles.resetBtn} onPress={() => { setGlasses([false,false,false,false,false,false,false,false]); AsyncStorage.removeItem('hydra-glasses'); }}>\n"
                         "        <Text style={styles.resetText}>Reset</Text>\n"
                         "      </TouchableOpacity>\n\n"
                         "STEP 4 — Add styles for the reset button. Add to StyleSheet.create:\n\n"
                         "      resetBtn: { marginTop: 40, paddingHorizontal: 30, paddingVertical: 12, borderWidth: 1, borderColor: '#0284c7', borderRadius: 8 },\n"
                         "      resetText: { color: '#0284c7', fontSize: 14, fontWeight: '600' },\n\n"
                         "STEP 5 — Test the reset button. Fill some glasses, tap Reset, all empty."),
            ]),
        day(7, "Build the APK and ship",
            "Today you make a real installable app file and push to GitHub.",
            [
                reading("Expo account — sign up (free)",
                        "https://expo.dev/signup",
                        "Click 'Open' to sign up. Needed to build an APK."),
                reading("GitHub — create new repository",
                        "https://github.com/new",
                        "Click 'Open'. Name: hydra. Public."),
                exercise("Build APK and push",
                         "STEP 1 — Sign up for Expo (free).\n"
                         "  Open the Expo signup card. Make an account.\n\n"
                         "STEP 2 — Log in from the terminal.\n"
                         "      npx expo login\n"
                         "  Enter your Expo email + password.\n\n"
                         "STEP 3 — Build an APK (Android installable file).\n"
                         "      npx eas build --platform android --profile preview\n"
                         "  It asks a few questions — accept the defaults.\n"
                         "  It takes 10-15 minutes (build runs in the cloud — free tier).\n"
                         "  When done, you get a URL ending in .apk\n\n"
                         "STEP 4 — Install the APK on your phone.\n"
                         "  Open the build URL on your phone. Download the .apk.\n"
                         "  Android: tap to install. You may need to allow 'unknown sources' in Settings.\n"
                         "  Open the app — it runs standalone, no Expo Go needed.\n\n"
                         "STEP 5 — Push to GitHub.\n"
                         "  Open the 'create new repository' card. Name: hydra. Public.\n"
                         "  In your terminal (in hydra folder):\n"
                         "      git init\n"
                         "      git add .\n"
                         "      git commit -m \"Hydra v0.1 — water tracker\"\n"
                         "      git branch -M main\n"
                         "      git remote add origin https://github.com/YOUR-USERNAME/hydra.git\n"
                         "      git push -u origin main\n\n"
                         "STEP 6 — README.\n"
                         "  Add a README.md to the repo with:\n"
                         "    - The APK download URL\n"
                         "    - A screenshot of the app on your phone (take one!)\n"
                         "    - 'Install instructions'\n"
                         "  Push again.\n\n"
                         "PASS CRITERIA — Hydra v0.1 ships when:\n"
                         "  ☐ App runs on your phone, 8 glasses tap to fill\n"
                         "  ☐ Reset button works\n"
                         "  ☐ State survives app close (AsyncStorage)\n"
                         "  ☐ '✨ You hit 8 today.' appears at 8\n"
                         "  ☐ Real APK file exists from EAS build\n"
                         "  ☐ GitHub repo has the code + README + screenshot"),
                reflect("Try using it",
                        "Tomorrow, try to actually use Hydra to track your water. Did you remember? At what time of day did you forget? Write 2 sentences."),
            ]),
    ],
    "topics": [
        "Node.js + Expo + Expo Go setup",
        "React components and props (JSX)",
        "useState for component state",
        "TouchableOpacity for tappable items",
        "Flexbox in React Native",
        "AsyncStorage for persistence",
        "SafeAreaView for iPhone notch",
        "EAS Build — making a real APK",
    ],
    "tasks": [
        "Install Node.js + Expo Go on phone",
        "Create the hydra Expo project + run on your phone",
        "Build a Glass component with filled prop",
        "Wire 8 glasses with useState + tap to fill",
        "Persist state with AsyncStorage",
        "Add SafeAreaView + reset button",
        "Build an APK with EAS + push to GitHub",
    ],
    "project": (
        "Hydra v0.1 — a water tracker app. One screen, 8 glasses, tap to fill, "
        "AsyncStorage persistence, reset button, celebration at 8. Built with Expo "
        "and React Native. Real APK installed on your phone. Public GitHub repo "
        "named hydra."
    ),
    "exercises": [
        "Add haptic vibration on tap (npx expo install expo-haptics)",
        "Show today's date at the top of the screen",
        "Change goal from 8 glasses to a configurable number (4-12)",
        "Use a real water-drop SVG instead of the emoji",
    ],
    "questions": [
        "What's the difference between TouchableOpacity and Pressable?",
        "Why does flexbox work slightly differently in React Native than the web?",
        "What happens if AsyncStorage.getItem returns null?",
        "What's the difference between running in Expo Go vs an EAS-built APK?",
    ],
    "outputs": [
        "Public GitHub repo named hydra",
        "Working APK from EAS Build",
        "App screenshot in the README",
        "AsyncStorage state survives app close",
    ],
}


# ═══════════════════════════════════════════════════════════════════════
# 5. DEVOPS & CLOUD — Edge Portfolio — portfolio on S3+CloudFront via Terraform
# ═══════════════════════════════════════════════════════════════════════
DEVOPS = {
    "context": (
        "This week you are going to deploy your own personal portfolio page to "
        "AWS — Amazon's cloud — using a tool called Terraform. By Sunday it will "
        "be live at a real URL, served from data centers around the world, "
        "costing less than $1/month. If you have never touched the cloud before, "
        "that is fine. Every command is given."
    ),
    "days": [
        day(1, "What is the cloud?",
            "Watch and write today.",
            [
                video("AWS in 10 minutes — Fireship", yt("Z4AmZSm5OTI"), 10, "Fireship", ""),
                video("What is Terraform? — 100 seconds", yt("tomUWcQ0P3k"), 2, "Fireship", ""),
                reflect("Why infrastructure-as-code?",
                        "In notes.txt write 2 sentences:\n"
                        "1. What does 'infrastructure as code' mean in your own words?\n"
                        "2. Why is clicking around the AWS website a bad way to manage real infrastructure?"),
            ]),
        day(2, "Set up a working shell + write your portfolio HTML",
            "Today we get the terminal ready and write the page we will host.",
            [
                video("Linux terminal for beginners",
                      search("linux terminal beginner crash course"),
                      20, "various",
                      "Pick the one for your OS."),
                exercise("Shell + HTML",
                         "STEP 1 — Make sure you have a working terminal.\n"
                         "  WINDOWS: install WSL2 (Microsoft has an official guide at learn.microsoft.com/wsl).\n"
                         "  MAC: open Terminal.app.\n"
                         "  LINUX: you're set.\n\n"
                         "STEP 2 — Practice basic commands.\n"
                         "      pwd       (where am I?)\n"
                         "      ls        (what's here?)\n"
                         "      cd Desktop\n"
                         "      mkdir edge-portfolio\n"
                         "      cd edge-portfolio\n\n"
                         "STEP 3 — Write index.html.\n"
                         "  In VS Code, File → Open Folder → edge-portfolio.\n"
                         "  New file: index.html. Type:\n\n"
                         "      <!DOCTYPE html>\n"
                         "      <html lang='en'>\n"
                         "      <head>\n"
                         "        <meta charset='utf-8'>\n"
                         "        <title>YOUR NAME — DevOps Engineer</title>\n"
                         "        <style>\n"
                         "          body { font-family: system-ui; max-width: 700px; margin: 4rem auto; padding: 0 1.5rem; color: #1a1a1a; }\n"
                         "          h1 { font-size: 2.5rem; }\n"
                         "          .tag { color: #b87333; font-family: monospace; }\n"
                         "          ul { list-style: none; padding: 0; }\n"
                         "          li { padding: 0.5rem 0; border-bottom: 1px dashed #ccc; }\n"
                         "          a { color: #b87333; }\n"
                         "        </style>\n"
                         "      </head>\n"
                         "      <body>\n"
                         "        <h1>YOUR NAME</h1>\n"
                         "        <p class='tag'>DevOps engineer in training</p>\n"
                         "        <p>I'm learning to ship real production infrastructure on AWS.</p>\n"
                         "        <h2>Projects</h2>\n"
                         "        <ul><li>Edge Portfolio (this page)</li></ul>\n"
                         "        <h2>Contact</h2>\n"
                         "        <p><a href='mailto:you@example.com'>you@example.com</a></p>\n"
                         "      </body>\n"
                         "      </html>\n\n"
                         "  Replace YOUR NAME with your real name. Save."),
            ]),
        day(3, "Sign up for AWS (safely)",
            "Today we get an AWS account ready. Important: do this carefully so you don't get billed.",
            [
                reading("AWS — sign up (free tier)",
                        "https://portal.aws.amazon.com/billing/signup",
                        "Click 'Open'. You'll need a credit card BUT we will only use the free tier — total cost this month is under $1."),
                video("How to set up AWS Free Tier safely (15 min)",
                      search("aws free tier setup billing alarm mfa 2024"),
                      15, "various",
                      "Watch the WHOLE video before signing up. Important."),
                exercise("Safe AWS setup",
                         "STEP 1 — Sign up.\n"
                         "  Open the AWS signup card. Use a real email + real card. Pick 'Basic Support — Free'.\n\n"
                         "STEP 2 — Turn on MFA (multi-factor auth) on the root user.\n"
                         "  In AWS console, click your name (top right) → Security credentials → MFA → Add.\n"
                         "  Use an authenticator app (Google Authenticator or Authy).\n\n"
                         "STEP 3 — Set a billing alarm at $5.\n"
                         "  In console search bar, type 'CloudWatch' → Alarms → Create alarm → Billing → Total Estimated Charge → set threshold $5 → notify your email.\n"
                         "  Now if your bill ever hits $5 you get an email.\n\n"
                         "STEP 4 — Create an IAM user for daily use (NEVER use root again).\n"
                         "  In console search bar: 'IAM' → Users → Create user.\n"
                         "  Username: forge-dev. Attach policy: AdministratorAccess.\n"
                         "  After creating, click the user → Security credentials → Create access key → 'Command line interface' → save the Access Key ID + Secret Access Key in a password manager.\n\n"
                         "STEP 5 — Install AWS CLI.\n"
                         "  Mac: brew install awscli\n"
                         "  Win: download from https://aws.amazon.com/cli/\n"
                         "  Linux: sudo apt install awscli\n"
                         "  Then: aws configure\n"
                         "  Paste your Access Key + Secret. Region: us-east-1. Output: json.\n\n"
                         "STEP 6 — Verify.\n"
                         "      aws sts get-caller-identity\n"
                         "  YOU SHOULD SEE: your IAM user ARN (not root)."),
            ]),
        day(4, "Install Terraform",
            "Today we install Terraform and write our first .tf file.",
            [
                reading("Terraform download (official)",
                        "https://developer.hashicorp.com/terraform/install",
                        "Click 'Open' to download. Pick your OS."),
                exercise("First Terraform resource",
                         "STEP 1 — Install Terraform.\n"
                         "  Mac: brew install terraform\n"
                         "  Win: download zip, unzip, add to PATH (or use Chocolatey)\n"
                         "  Linux: follow the official Linux instructions\n"
                         "  Verify: terraform version → should print 1.x.x.\n\n"
                         "STEP 2 — Make an infra folder.\n"
                         "      cd Desktop/edge-portfolio\n"
                         "      mkdir infra\n"
                         "      cd infra\n\n"
                         "STEP 3 — Write your first main.tf.\n"
                         "  In VS Code, new file: edge-portfolio/infra/main.tf. Type:\n\n"
                         "      terraform {\n"
                         "        required_providers {\n"
                         "          aws = { source = \"hashicorp/aws\", version = \"~> 5.0\" }\n"
                         "        }\n"
                         "      }\n"
                         "      provider \"aws\" {\n"
                         "        region = \"us-east-1\"\n"
                         "      }\n"
                         "      resource \"aws_s3_bucket\" \"portfolio\" {\n"
                         "        bucket = \"YOUR-NAME-edge-portfolio-2026\"\n"
                         "      }\n\n"
                         "  Replace YOUR-NAME with your real name (lowercase, no spaces). S3 bucket names are GLOBALLY unique — yours must not exist anywhere.\n\n"
                         "STEP 4 — Run Terraform.\n"
                         "      terraform init\n"
                         "  YOU SHOULD SEE: 'Terraform has been successfully initialized!'\n"
                         "      terraform plan\n"
                         "  YOU SHOULD SEE: 'Plan: 1 to add, 0 to change, 0 to destroy.'\n"
                         "      terraform apply\n"
                         "  Type 'yes' when asked.\n"
                         "  YOU SHOULD SEE: 'Apply complete! Resources: 1 added'\n\n"
                         "STEP 5 — Verify in AWS.\n"
                         "  In the AWS console, search 'S3'. You see your bucket. Your first cloud resource."),
            ]),
        day(5, "Add CloudFront in front of S3",
            "Today we add a CDN so your site loads fast from anywhere in the world.",
            [
                exercise("Full Terraform: S3 + CloudFront",
                         "STEP 1 — Open main.tf. Replace the entire file with this:\n\n"
                         "      terraform {\n"
                         "        required_providers { aws = { source = \"hashicorp/aws\", version = \"~> 5.0\" } }\n"
                         "      }\n"
                         "      provider \"aws\" { region = \"us-east-1\" }\n"
                         "\n"
                         "      resource \"aws_s3_bucket\" \"portfolio\" {\n"
                         "        bucket = \"YOUR-NAME-edge-portfolio-2026\"\n"
                         "      }\n"
                         "\n"
                         "      resource \"aws_cloudfront_origin_access_identity\" \"oai\" {\n"
                         "        comment = \"OAI for edge-portfolio\"\n"
                         "      }\n"
                         "\n"
                         "      data \"aws_iam_policy_document\" \"s3_policy\" {\n"
                         "        statement {\n"
                         "          actions   = [\"s3:GetObject\"]\n"
                         "          resources = [\"${aws_s3_bucket.portfolio.arn}/*\"]\n"
                         "          principals {\n"
                         "            type        = \"AWS\"\n"
                         "            identifiers = [aws_cloudfront_origin_access_identity.oai.iam_arn]\n"
                         "          }\n"
                         "        }\n"
                         "      }\n"
                         "\n"
                         "      resource \"aws_s3_bucket_policy\" \"portfolio\" {\n"
                         "        bucket = aws_s3_bucket.portfolio.id\n"
                         "        policy = data.aws_iam_policy_document.s3_policy.json\n"
                         "      }\n"
                         "\n"
                         "      resource \"aws_cloudfront_distribution\" \"portfolio\" {\n"
                         "        enabled             = true\n"
                         "        default_root_object = \"index.html\"\n"
                         "        origin {\n"
                         "          domain_name = aws_s3_bucket.portfolio.bucket_regional_domain_name\n"
                         "          origin_id   = \"s3-portfolio\"\n"
                         "          s3_origin_config {\n"
                         "            origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path\n"
                         "          }\n"
                         "        }\n"
                         "        default_cache_behavior {\n"
                         "          target_origin_id       = \"s3-portfolio\"\n"
                         "          viewer_protocol_policy = \"redirect-to-https\"\n"
                         "          allowed_methods        = [\"GET\", \"HEAD\"]\n"
                         "          cached_methods         = [\"GET\", \"HEAD\"]\n"
                         "          forwarded_values { query_string = false; cookies { forward = \"none\" } }\n"
                         "        }\n"
                         "        restrictions { geo_restriction { restriction_type = \"none\" } }\n"
                         "        viewer_certificate { cloudfront_default_certificate = true }\n"
                         "      }\n"
                         "\n"
                         "      output \"cloudfront_url\" {\n"
                         "        value = \"https://${aws_cloudfront_distribution.portfolio.domain_name}\"\n"
                         "      }\n\n"
                         "  Replace YOUR-NAME with your name (same as before).\n\n"
                         "STEP 2 — Apply.\n"
                         "      terraform apply\n"
                         "  Type 'yes'. CloudFront takes 5-10 minutes to deploy globally.\n"
                         "  YOU SHOULD SEE at the end: cloudfront_url = \"https://xxxxxxxx.cloudfront.net\"\n\n"
                         "STEP 3 — Upload index.html.\n"
                         "      aws s3 cp ../index.html s3://YOUR-NAME-edge-portfolio-2026/\n"
                         "  YOU SHOULD SEE: 'upload: ../index.html to s3://...'\n\n"
                         "STEP 4 — Visit your CloudFront URL.\n"
                         "  Wait 5 minutes for CloudFront to fully deploy. Then open the URL.\n"
                         "  YOU SHOULD SEE: your portfolio page, served over HTTPS, from a global CDN."),
            ]),
        day(6, "Push to GitHub",
            "Today the .tf code itself becomes the portfolio piece.",
            [
                reading("GitHub — create new repository",
                        "https://github.com/new",
                        "Click 'Open'. Name: edge-portfolio. Public."),
                exercise("Push the IaC",
                         "STEP 1 — Make a .gitignore in edge-portfolio/.\n"
                         "  New file: .gitignore. Type:\n"
                         "      .terraform/\n"
                         "      *.tfstate\n"
                         "      *.tfstate.backup\n"
                         "      .terraform.lock.hcl\n\n"
                         "STEP 2 — Write a README.md.\n"
                         "      # Edge Portfolio\n"
                         "      My personal portfolio, deployed on AWS S3 + CloudFront, provisioned with Terraform.\n"
                         "      \n"
                         "      ## Live URL\n"
                         "      https://xxxxxxxx.cloudfront.net  (paste yours)\n"
                         "      \n"
                         "      ## Cost\n"
                         "      < $1 / month at free-tier S3 + CloudFront usage.\n"
                         "      \n"
                         "      ## How to deploy (someone forking this repo)\n"
                         "      1. Install AWS CLI + Terraform.\n"
                         "      2. Configure AWS: aws configure\n"
                         "      3. Edit infra/main.tf — change the bucket name to something unique.\n"
                         "      4. cd infra && terraform init && terraform apply\n"
                         "      5. aws s3 cp ../index.html s3://YOUR-BUCKET/\n"
                         "      6. Wait 5 min for CloudFront. Visit the URL from terraform output.\n\n"
                         "STEP 3 — Push.\n"
                         "  Open the 'create new repository' card. Name: edge-portfolio. Public. Create.\n"
                         "  In your terminal:\n"
                         "      cd Desktop/edge-portfolio\n"
                         "      git init\n"
                         "      git add .\n"
                         "      git commit -m \"Edge Portfolio v0.1 — IaC for S3 + CloudFront\"\n"
                         "      git branch -M main\n"
                         "      git remote add origin https://github.com/YOUR-USERNAME/edge-portfolio.git\n"
                         "      git push -u origin main"),
            ]),
        day(7, "Test the destroy + redeploy",
            "Today you test what real engineers test: can you wipe and rebuild from scratch?",
            [
                exercise("Destroy and redeploy",
                         "STEP 1 — Take down everything.\n"
                         "      cd Desktop/edge-portfolio/infra\n"
                         "      terraform destroy\n"
                         "  Type 'yes'. All AWS resources are deleted.\n\n"
                         "STEP 2 — Verify the site is GONE.\n"
                         "  Visit your CloudFront URL — it should now error.\n\n"
                         "STEP 3 — Rebuild from scratch.\n"
                         "      terraform apply\n"
                         "  Type 'yes'. Wait 10 minutes for CloudFront.\n"
                         "  Re-upload index.html: aws s3 cp ../index.html s3://YOUR-BUCKET/\n\n"
                         "STEP 4 — Site is BACK.\n"
                         "  Open the new CloudFront URL (it changed!). Update your README with the new URL.\n"
                         "  Push the README update:\n"
                         "      git add README.md && git commit -m \"Update CloudFront URL after redeploy\" && git push\n\n"
                         "PASS CRITERIA — Edge Portfolio v0.1 ships when:\n"
                         "  ☐ main.tf creates S3 + CloudFront + OAI + bucket policy\n"
                         "  ☐ Live CloudFront URL serves your portfolio over HTTPS\n"
                         "  ☐ terraform destroy + terraform apply works clean (reproducible)\n"
                         "  ☐ Public GitHub repo named edge-portfolio\n"
                         "  ☐ README has the live URL + how-to-fork instructions\n"
                         "  ☐ .gitignore excludes .terraform/ and *.tfstate"),
                reflect("What you skipped",
                        "List 3 things a real production portfolio needs that yours doesn't yet:\n"
                        "1. ...\n2. ...\n3. ...\n"
                        "These become next week's work."),
            ]),
    ],
    "topics": [
        "Linux shell basics",
        "Git PR workflow",
        "AWS account hygiene — MFA, IAM, billing alarms",
        "AWS CLI installation + configuration",
        "Terraform: provider, resource, output",
        "S3 buckets + bucket policies",
        "CloudFront + Origin Access Identity",
        "terraform destroy + reproducibility",
    ],
    "tasks": [
        "Get a working terminal (WSL on Win, Terminal on Mac)",
        "Write a portfolio index.html",
        "Sign up for AWS + set MFA + billing alarm + create IAM user",
        "Install Terraform + create your first .tf file",
        "Write S3 + CloudFront + OAI + bucket policy in Terraform",
        "Deploy + upload index.html + verify it loads",
        "Push to GitHub + test destroy/redeploy cycle",
    ],
    "project": (
        "Edge Portfolio v0.1 — your personal portfolio served from AWS S3 + "
        "CloudFront, provisioned entirely by Terraform. Live HTTPS URL. Public "
        "GitHub repo named edge-portfolio with the .tf code. Cost under $1/month. "
        "Verified reproducible by destroying + reapplying from a clean checkout."
    ),
    "exercises": [
        "Add a Terraform variable bucket_name so it's not hardcoded",
        "Add S3 versioning. Upload index.html twice. Roll back to v1.",
        "Add an aws_cloudfront_function for a 301 redirect from / to /index.html",
        "Compare S3+CloudFront cost vs Netlify free tier — write 2 sentences in README",
    ],
    "questions": [
        "Why put CloudFront in front of S3 — why not just S3?",
        "What does Origin Access Identity prevent?",
        "What's the difference between terraform apply and terraform import?",
        "If terraform destroy ran in production tomorrow, what's your recovery plan?",
    ],
    "outputs": [
        "Live CloudFront URL serving your portfolio",
        "Public GitHub repo named edge-portfolio",
        "main.tf in infra/ folder",
        "README with live URL + fork instructions",
    ],
}


# ═══════════════════════════════════════════════════════════════════════
# 6. CYBERSECURITY — Vuln Reports — 5 Juice Shop reports
# ═══════════════════════════════════════════════════════════════════════
CYBERSEC = {
    "context": (
        "This week you are going to find 5 real security bugs in a practice "
        "website called OWASP Juice Shop, and write up each bug as a "
        "professional report (the same format real hackers use to earn bug "
        "bounties). By Sunday you'll have a GitHub repo called vuln-reports "
        "with 5 polished writeups — the seed of your security portfolio. "
        "Important: we ONLY attack the practice site running on YOUR computer."
    ),
    "days": [
        day(1, "The ethics contract — non-negotiable",
            "Today you sign a contract. You only attack what you own.",
            [
                video("Cybersecurity ethics for beginners",
                      search("cybersecurity ethics beginner john hammond"),
                      15, "John Hammond"),
                exercise("Sign and commit your ethics contract",
                         "STEP 1 — Make the folder.\n"
                         "      cd Desktop\n"
                         "      mkdir vuln-reports\n"
                         "      cd vuln-reports\n\n"
                         "STEP 2 — Create ETHICS.md.\n"
                         "  In VS Code, new file ETHICS.md. Type:\n\n"
                         "      # Ethics Contract\n"
                         "      I, [YOUR FULL NAME], commit to:\n"
                         "      1. Only test systems I own or have explicit written permission to test.\n"
                         "      2. Report any vulnerabilities I find through responsible disclosure channels.\n"
                         "      3. Never exfiltrate or modify user data beyond minimal proof-of-concept.\n"
                         "      4. Document every test for transparency.\n"
                         "      \n"
                         "      Signed: [YOUR NAME]\n"
                         "      Date: [TODAY'S DATE]\n\n"
                         "  Replace [YOUR FULL NAME] and [TODAY'S DATE]. Save.\n\n"
                         "STEP 3 — In notes.txt write 3 sentences:\n"
                         "  Why does ethical hacking matter? Why do real security companies require this contract?"),
            ]),
        day(2, "Install Docker and run Juice Shop",
            "Today we run the practice target on your computer.",
            [
                reading("Docker Desktop (free)",
                        "https://www.docker.com/products/docker-desktop/",
                        "Click 'Open' to download. Pick your OS."),
                video("Install Docker on Windows / Mac",
                      search("install docker desktop beginner windows mac 2024"),
                      12, "various"),
                exercise("Run OWASP Juice Shop locally",
                         "STEP 1 — Install Docker Desktop from the card. Open it after install.\n"
                         "  Verify: open a terminal and type:\n"
                         "      docker --version\n"
                         "  YOU SHOULD SEE: 'Docker version 27.x.x' or similar.\n\n"
                         "STEP 2 — Run Juice Shop.\n"
                         "      docker run --rm -p 3000:3000 bkimminich/juice-shop\n"
                         "  First time this downloads ~200MB. Takes 2-3 minutes.\n"
                         "  YOU SHOULD SEE: lots of logs ending with 'Server listening on port 3000'.\n\n"
                         "STEP 3 — Open it.\n"
                         "  In your browser: http://localhost:3000\n"
                         "  YOU SHOULD SEE: a fake fruit-juice e-commerce site. This is your practice target for the week."),
            ]),
        day(3, "Find the Score Board (challenge 1)",
            "Juice Shop has a hidden scoreboard that tracks which bugs you've found. Day 1 challenge: find it.",
            [
                reading("OWASP Top 10 — official",
                        "https://owasp.org/www-project-top-ten/",
                        "Click 'Open' to bookmark. The big 10 vulnerability categories."),
                exercise("Score Board challenge",
                         "Your first 'bug': finding the hidden score board page that Juice Shop hides on purpose.\n\n"
                         "STEP 1 — In the browser at localhost:3000, right-click anywhere → 'View Page Source'.\n"
                         "  Or press Ctrl+U (Cmd+U on Mac).\n\n"
                         "STEP 2 — Read the HTML. Scroll. Look for anything mentioning 'score-board'.\n"
                         "  HINT: there's a comment near the top.\n\n"
                         "STEP 3 — Found a hint? Try the URL: http://localhost:3000/#/score-board\n"
                         "  YOU SHOULD SEE: a big page with hundreds of challenge cards. One of them (Score Board) is now lit up green.\n\n"
                         "STEP 4 — Screenshot.\n"
                         "  Take a screenshot of the green 'Score Board' card.\n"
                         "  Save it in vuln-reports/screenshots/01-scoreboard.png\n"
                         "  (Make the screenshots folder if you don't have it.)"),
            ]),
        day(4, "Find a DOM XSS bug (challenge 2)",
            "Cross-site scripting — injecting code into a web page.",
            [
                video("DOM XSS explained simply",
                      search("dom xss explained beginner tutorial"),
                      10, "various"),
                exercise("DOM XSS in the search bar",
                         "Juice Shop's search bar reflects whatever you type into the page WITHOUT properly cleaning it. We exploit that.\n\n"
                         "STEP 1 — Go to the home page (click the Juice Shop logo).\n\n"
                         "STEP 2 — In the search bar at the top, type this exactly:\n"
                         "      <iframe src=\"javascript:alert(`xss`)\">\n"
                         "  Press Enter.\n\n"
                         "STEP 3 — YOU SHOULD SEE: a browser popup that says 'xss'. That's you successfully running JavaScript on the page — XSS achieved.\n\n"
                         "STEP 4 — Check the score-board page. The 'DOM XSS' challenge is now green.\n\n"
                         "STEP 5 — Take a screenshot of the alert popup.\n"
                         "  Save as vuln-reports/screenshots/02-domxss.png"),
            ]),
        day(5, "Find broken auth and IDOR (challenges 3 + 4)",
            "Two more bugs today: logging in as admin without a password, and viewing someone else's basket.",
            [
                exercise("Login Admin via SQL injection",
                         "STEP 1 — Open the login page (top right account icon).\n\n"
                         "STEP 2 — In the email field, type:\n"
                         "      ' OR 1=1--\n"
                         "  In the password field, type anything (e.g. 'abc').\n"
                         "  Click Log in.\n\n"
                         "STEP 3 — YOU SHOULD SEE: you are logged in as admin@juice-sh.op.\n"
                         "  Check the top right corner — your account icon shows the admin email.\n"
                         "  The 'Login Admin' challenge is green on the score board.\n\n"
                         "STEP 4 — Screenshot showing the admin email at top right.\n"
                         "  Save as 03-loginadmin.png\n\n"
                         "Now challenge 4: View someone else's basket.\n\n"
                         "STEP 5 — Log out. Register a new normal account (email: test@test.com, any password).\n"
                         "  Add 1 item to your basket. Go to your basket.\n\n"
                         "STEP 6 — In Chrome DevTools (F12), Network tab. Reload the basket page.\n"
                         "  Find the request to /rest/basket/N (where N is a number, your basket ID).\n"
                         "  Look at the response — that's your basket data.\n\n"
                         "STEP 7 — Change N. In the URL bar, go to:\n"
                         "  http://localhost:3000/rest/basket/1\n"
                         "  YOU SHOULD SEE: a different user's basket (admin's, in this case). That's IDOR — Insecure Direct Object Reference.\n\n"
                         "STEP 8 — Screenshot the raw JSON of someone else's basket.\n"
                         "  Save as 04-idor.png"),
            ]),
        day(6, "Find a confidential document (challenge 5)",
            "Today: find leaked files the site forgot to protect.",
            [
                exercise("Hidden /ftp/ path",
                         "STEP 1 — Try this URL in your browser:\n"
                         "      http://localhost:3000/ftp\n"
                         "  YOU SHOULD SEE: a file listing — Juice Shop accidentally exposes an FTP-style folder.\n\n"
                         "STEP 2 — Look for a file ending in .md (markdown). Open it.\n"
                         "  You're reading internal company documents that shouldn't be public.\n"
                         "  Find one specifically called 'acquisitions.md' — that's the target file.\n\n"
                         "STEP 3 — Score Board: 'Confidential Document' challenge is now green.\n\n"
                         "STEP 4 — Screenshot.\n"
                         "  Save as 05-confidential.png"),
            ]),
        day(7, "Write the 5 reports + push to GitHub",
            "Today you turn your 5 wins into professional vulnerability reports.",
            [
                reading("HackerOne — quality reports guide",
                        "https://docs.hackerone.com/hackers/quality-reports.html",
                        "Click 'Open' to read what real bounty submissions look like."),
                reading("GitHub — create new repository",
                        "https://github.com/new",
                        "Click 'Open'. Name: vuln-reports. Public."),
                exercise("Write reports and push",
                         "STEP 1 — Make a reports/ folder.\n"
                         "      cd Desktop/vuln-reports\n"
                         "      mkdir reports\n\n"
                         "STEP 2 — Write reports/01-scoreboard.md.\n"
                         "  Use this template for ALL 5 reports:\n\n"
                         "      # Score Board access via hidden route\n"
                         "      \n"
                         "      **Severity:** Low — informational, but reveals the developer's intent\n"
                         "      **Affected component:** Front-end SPA route `/#/score-board`\n"
                         "      \n"
                         "      ## Steps to reproduce\n"
                         "      1. Navigate to http://localhost:3000\n"
                         "      2. View page source (Ctrl+U)\n"
                         "      3. Find the comment hinting at the route\n"
                         "      4. Navigate to /#/score-board\n"
                         "      \n"
                         "      ## Impact\n"
                         "      Hidden admin/dev pages can leak sensitive information.\n"
                         "      \n"
                         "      ## Suggested fix\n"
                         "      Don't ship hints in comments. Gate the route behind an admin role.\n"
                         "      \n"
                         "      ## Proof\n"
                         "      ![scoreboard](../screenshots/01-scoreboard.png)\n\n"
                         "STEP 3 — Write the other 4 the same way:\n"
                         "  02-domxss.md (Medium severity — code execution in browser)\n"
                         "  03-loginadmin.md (Critical — full admin compromise via SQLi)\n"
                         "  04-idor.md (High — viewing other users' data)\n"
                         "  05-confidential.md (Medium — leaked internal docs)\n\n"
                         "STEP 4 — Write README.md.\n"
                         "      # vuln-reports\n"
                         "      My security writeups. Practice begins with OWASP Juice Shop.\n"
                         "      \n"
                         "      ## Ethics\n"
                         "      See ETHICS.md — I only test systems I own or have permission to.\n"
                         "      \n"
                         "      ## Reports\n"
                         "      1. [Score Board access](reports/01-scoreboard.md) — Low\n"
                         "      2. [DOM XSS in search](reports/02-domxss.md) — Medium\n"
                         "      3. [Login Admin via SQLi](reports/03-loginadmin.md) — Critical\n"
                         "      4. [IDOR in /rest/basket](reports/04-idor.md) — High\n"
                         "      5. [Leaked acquisitions doc](reports/05-confidential.md) — Medium\n\n"
                         "STEP 5 — Push.\n"
                         "  Open the 'create new repository' card. Name: vuln-reports. Public. Create.\n"
                         "      git init\n"
                         "      git add .\n"
                         "      git commit -m \"vuln-reports v0.1 — 5 Juice Shop writeups\"\n"
                         "      git branch -M main\n"
                         "      git remote add origin https://github.com/YOUR-USERNAME/vuln-reports.git\n"
                         "      git push -u origin main\n\n"
                         "PASS CRITERIA — Vuln Reports v0.1 ships when:\n"
                         "  ☐ ETHICS.md signed and committed\n"
                         "  ☐ 5 challenges solved with screenshots\n"
                         "  ☐ 5 reports written in the HackerOne template\n"
                         "  ☐ README links each report with severity\n"
                         "  ☐ Public GitHub repo named vuln-reports"),
                reflect("Would they pay?",
                        "If Juice Shop was a real company on HackerOne, which of your 5 reports would earn the biggest bounty? Why? Write 2 sentences."),
            ]),
    ],
    "topics": [
        "Security ethics — written consent only",
        "Docker basics — running containerized apps",
        "OWASP Top 10 vulnerability categories",
        "OWASP Juice Shop practice range",
        "DOM XSS (cross-site scripting)",
        "SQL injection in login forms",
        "IDOR — viewing other users' data",
        "Information disclosure via exposed paths",
        "Writing HackerOne-style reports",
    ],
    "tasks": [
        "Sign and commit ETHICS.md",
        "Install Docker, run Juice Shop locally",
        "Find the hidden Score Board",
        "Exploit DOM XSS in the search bar",
        "Log in as admin via SQL injection",
        "View another user's basket via IDOR",
        "Find leaked /ftp/ documents",
        "Write 5 reports + push to GitHub",
    ],
    "project": (
        "Vuln Reports v0.1 — your security portfolio. 5 specific Juice Shop bugs "
        "(Score Board, DOM XSS, Login Admin SQLi, IDOR basket, FTP leak) each "
        "written up as a HackerOne-style report with screenshots. Signed ETHICS.md. "
        "Public GitHub repo named vuln-reports."
    ),
    "exercises": [
        "Set up Burp Suite Community and intercept one Juice Shop request",
        "Read 3 real reports on hackerone.com/hacktivity",
        "Find one more Juice Shop challenge (Easy difficulty) and add a 6th report",
        "Try the same SQLi against a local Postgres of your own — does it work? Why or why not?",
    ],
    "questions": [
        "Why is the IDOR bug rated higher severity than the FTP one?",
        "What's a proof-of-concept (POC) and why is it required?",
        "What's the difference between black-box and white-box testing?",
        "If you found a real CVE in production software today, who do you tell first?",
    ],
    "outputs": [
        "Public GitHub repo named vuln-reports",
        "ETHICS.md signed",
        "5 reports in reports/",
        "5 screenshots in screenshots/",
        "README linking each report",
    ],
}


# ═══════════════════════════════════════════════════════════════════════
# 7. DATA ANALYSIS — Superstore Sales Memo
# ═══════════════════════════════════════════════════════════════════════
DATA_AN = {
    "context": (
        "This week you are going to analyze Sample Superstore — the classic "
        "dataset every analyst learns on. It's 4 years of sales for a "
        "fictional retailer. By Sunday you'll have a 1-page Excel/Sheets "
        "dashboard plus a 1-page PDF memo answering 3 specific questions. "
        "If you have never used Excel formulas or pivot tables before, that "
        "is fine. Every step is shown."
    ),
    "days": [
        day(1, "What does a data analyst do?",
            "Watch and think. No spreadsheet today.",
            [
                video("Day in the life of a Data Analyst (12 min)",
                      search("day in the life data analyst real 2024"),
                      12, "various"),
                reflect("The 3 questions",
                        "By Sunday you'll answer these about Sample Superstore (a fake retailer):\n\n"
                        "Q1. Which sub-category (Phones? Chairs? Tables?) has the highest profit MARGIN? Which has the lowest?\n"
                        "Q2. Which region (West? East? Central? South?) grew sales the most year-over-year in the latest year?\n"
                        "Q3. Is Furniture overall a profitable category? Where does its profit come from?\n\n"
                        "Write your guess for each in guesses.txt. Check on Day 6."),
            ]),
        day(2, "Get the Superstore data",
            "Today you download the file.",
            [
                reading("Sample Superstore — Tableau (free download)",
                        "https://community.tableau.com/s/question/0D54T00000CWeX8SAL/sample-superstore-sales-excelxls",
                        "Click 'Open' to download. If the page asks for a Tableau login, sign up — free. The file is 'Sample - Superstore.xls'."),
                exercise("Open and explore",
                         "STEP 1 — Make the project folder.\n"
                         "  Make a folder on your Desktop called 'superstore-analysis'.\n\n"
                         "STEP 2 — Download the file from the card above. Move it into the folder.\n\n"
                         "STEP 3 — Open it.\n"
                         "  Right-click → Open with → Excel (or Google Sheets — upload via drive.google.com).\n\n"
                         "STEP 4 — Look at the sheets.\n"
                         "  YOU SHOULD SEE 3 sheets at the bottom: Orders, Returns, People.\n"
                         "  Click Orders. Scroll through. You see ~10,000 rows. Look at the columns: Order Date, Region, Segment, Category, Sub-Category, Sales, Quantity, Discount, Profit.\n\n"
                         "STEP 5 — Take a quick total.\n"
                         "  In a new cell anywhere: =SUM(Orders!N:N)\n"
                         "  (N is the Sales column — adjust the letter if yours is different.)\n"
                         "  YOU SHOULD SEE: about $2.3 million in total Sales. That's the size of the dataset.\n\n"
                         "Save the file. Done for today."),
            ]),
        day(3, "Practice the 7 essential formulas",
            "Today you learn the formulas every analyst uses daily.",
            [
                video("Excel essentials — Leila Gharani (45 min)",
                      search("leila gharani excel beginner tutorial 2024"),
                      45, "Leila Gharani",
                      "The best Excel teacher on YouTube."),
                exercise("Drill the formulas",
                         "Make a new sheet in the same workbook called 'Drills'.\n\n"
                         "STEP 1 — In A1 type 'Total sales 2023:', in B1 type:\n"
                         "      =SUMIFS(Orders!N:N, Orders!C:C, \">=2023-01-01\", Orders!C:C, \"<=2023-12-31\")\n"
                         "  (Adjust column letters if yours are different. N=Sales, C=Order Date.)\n"
                         "  YOU SHOULD SEE: ~$700k.\n\n"
                         "STEP 2 — In A2 type 'Orders in West:', in B2 type:\n"
                         "      =COUNTIFS(Orders!I:I, \"West\")\n"
                         "  (I = Region column)\n"
                         "  YOU SHOULD SEE: ~3,000 orders.\n\n"
                         "STEP 3 — In A3 type 'Average discount:', in B3 type:\n"
                         "      =AVERAGE(Orders!O:O)\n"
                         "  (O = Discount)\n\n"
                         "STEP 4 — In A4 type 'XLOOKUP for customer CG-12520:', in B4 type:\n"
                         "      =XLOOKUP(\"CG-12520\", Orders!E:E, Orders!F:F)\n"
                         "  YOU SHOULD SEE: that customer's name.\n\n"
                         "STEP 5 — In A5 type 'High-margin orders:', in B5 type a header. Then in row 6+ for the first 100 rows, add a new column 'Margin Bucket' next to Profit. Use:\n"
                         "      =IF(R2/N2 > 0.2, \"Healthy\", IF(R2/N2 > 0.05, \"Thin\", \"Loss\"))\n"
                         "  (R = Profit, N = Sales)\n\n"
                         "Save."),
            ]),
        day(4, "Pivot table for Q1 (margin leaders)",
            "Pivot tables — the most useful tool an analyst has.",
            [
                video("Pivot tables in 20 minutes — Leila Gharani",
                      search("leila gharani pivot tables tutorial"),
                      20, "Leila Gharani"),
                exercise("Build the margin pivot",
                         "STEP 1 — Click anywhere in the Orders sheet.\n"
                         "  Insert → PivotTable → New worksheet → OK.\n\n"
                         "STEP 2 — Build the pivot.\n"
                         "  ROWS area: drag Sub-Category\n"
                         "  VALUES area: drag Sales (Sum), drag Profit (Sum)\n"
                         "  You should now see ~17 sub-categories with their Sales and Profit totals.\n\n"
                         "STEP 3 — Add Margin as a calculated field.\n"
                         "  PivotTable Analyze tab → Fields, Items, & Sets → Calculated Field.\n"
                         "  Name: Margin. Formula: = Profit / Sales\n"
                         "  Click OK.\n\n"
                         "STEP 4 — Format Margin as a percentage.\n"
                         "  Right-click any Margin number → Number Format → Percentage → 1 decimal → OK.\n\n"
                         "STEP 5 — Sort by Margin descending.\n"
                         "  Click the dropdown next to 'Sub-Category' → More Sort Options → Sort by Margin → Largest to Smallest.\n\n"
                         "STEP 6 — Write the answer to Q1.\n"
                         "  In a new cell: highest margin sub-category = ?\n"
                         "  Lowest margin sub-category = ?\n"
                         "  Save."),
            ]),
        day(5, "Pivot for Q2 (regional growth)",
            "Today: year-over-year growth by region.",
            [
                exercise("Region YoY pivot",
                         "STEP 1 — New pivot from Orders → new sheet.\n\n"
                         "STEP 2 — Build it.\n"
                         "  ROWS: Region\n"
                         "  COLUMNS: Order Date — Excel will offer to group by Year. Accept.\n"
                         "  VALUES: Sum of Sales\n"
                         "  You see a 4x4 table: each region's sales for each year.\n\n"
                         "STEP 3 — Add a YoY growth column.\n"
                         "  Outside the pivot (next column), for the latest year:\n"
                         "      = (Sales latest year - Sales previous year) / Sales previous year\n"
                         "  Format as percentage.\n\n"
                         "STEP 4 — Which region grew most? Write the answer to Q2 in a cell."),
            ]),
        day(6, "Pivot for Q3 (Furniture profitability)",
            "Is Furniture profitable? Drill in.",
            [
                exercise("Furniture deep-dive",
                         "STEP 1 — New pivot from Orders.\n"
                         "  Filter: Category = Furniture\n"
                         "  ROWS: Sub-Category\n"
                         "  VALUES: Sum of Profit\n\n"
                         "STEP 2 — Look at the result.\n"
                         "  YOU SHOULD SEE: Tables loses big money. Bookcases barely break even. Chairs make decent profit. Furnishings make the most.\n\n"
                         "STEP 3 — Add Region.\n"
                         "  Drag Region to COLUMNS.\n"
                         "  Now you see Furniture profit broken down by region AND sub-category.\n"
                         "  Which region is best for Furniture? Worst?\n\n"
                         "STEP 4 — Write the answer to Q3.\n"
                         "  Is Furniture overall profitable? (Add all the numbers — what's the total?)\n"
                         "  Where does the profit come from?"),
            ]),
        day(7, "Build the dashboard + write the memo",
            "Today you ship.",
            [
                reading("GitHub — create new repository",
                        "https://github.com/new",
                        "Click 'Open'. Name: superstore-analysis. Public."),
                exercise("Dashboard + Memo + Push",
                         "STEP 1 — Make a new sheet called 'Dashboard'.\n\n"
                         "STEP 2 — Top row: 4 KPI cells.\n"
                         "  Total Sales: =SUM(Orders!N:N)\n"
                         "  Total Profit: =SUM(Orders!R:R)\n"
                         "  Profit Margin: =SUM(Orders!R:R) / SUM(Orders!N:N) (format as %)\n"
                         "  YoY Growth (latest year): use the formula from Day 5\n"
                         "  Style: make each cell big — font 20, bold, with a colored border.\n\n"
                         "STEP 3 — Middle: 2 charts.\n"
                         "  Chart 1: monthly sales trend (line). Source: a small pivot of Sales by month.\n"
                         "  Chart 2: sales by region (bar). Source: pivot of Sales by Region.\n\n"
                         "STEP 4 — Bottom: top 5 / bottom 5 sub-categories by margin (paste from Day 4 pivot).\n\n"
                         "STEP 5 — Write the memo.\n"
                         "  Open Word or Google Docs. Make a 1-page document. Use this exact structure:\n\n"
                         "      # Sample Superstore — Memo to leadership\n"
                         "      \n"
                         "      ## Headline\n"
                         "      (one sentence summarising everything)\n"
                         "      \n"
                         "      ## Q1. Margin leaders & laggards\n"
                         "      Highest margin: [name] at [%]\n"
                         "      Lowest margin: [name] at [%]\n"
                         "      Recommendation: [1 sentence — drop the laggard? double down on the leader?]\n"
                         "      \n"
                         "      ## Q2. Regional growth\n"
                         "      Fastest-growing region: [name] at [%] YoY\n"
                         "      Recommendation: [1 sentence]\n"
                         "      \n"
                         "      ## Q3. Furniture profitability\n"
                         "      Furniture total profit: $[X]\n"
                         "      Where the profit comes from: [Furnishings + Chairs mostly; Tables loses money]\n"
                         "      Recommendation: [1 sentence — discontinue Tables?]\n"
                         "      \n"
                         "      ## What I'd do next\n"
                         "      - [bullet 1]\n"
                         "      - [bullet 2]\n"
                         "      - [bullet 3]\n\n"
                         "  Export as PDF. Save as superstore-memo.pdf in the project folder.\n\n"
                         "STEP 6 — Push to GitHub.\n"
                         "  Open the 'create new repository' card. Name: superstore-analysis. Public.\n"
                         "  In your terminal:\n"
                         "      cd Desktop/superstore-analysis\n"
                         "      git init\n"
                         "      git add .\n"
                         "      git commit -m \"Sample Superstore analysis v0.1\"\n"
                         "      git branch -M main\n"
                         "      git remote add origin https://github.com/YOUR-USERNAME/superstore-analysis.git\n"
                         "      git push -u origin main\n\n"
                         "STEP 7 — Take a screenshot of the dashboard and add to README.\n\n"
                         "PASS CRITERIA — Superstore v0.1 ships when:\n"
                         "  ☐ Dashboard sheet with 4 KPIs + 2 charts + 1 table\n"
                         "  ☐ All 3 questions answered with specific numbers\n"
                         "  ☐ 1-page memo exported as PDF\n"
                         "  ☐ Public GitHub repo named superstore-analysis\n"
                         "  ☐ README has dashboard screenshot + link to memo PDF"),
                reflect("Would your boss act on this?",
                        "Read your memo as if you were the VP receiving it. Would you take any action tomorrow? If yes, what? If no, your recommendations need to be sharper."),
            ]),
    ],
    "topics": [
        "Excel/Sheets essentials — SUMIFS, COUNTIFS, AVERAGEIFS, XLOOKUP, IF",
        "Pivot tables + calculated fields",
        "Computing profit margin",
        "Year-over-year growth math",
        "Multi-dimensional pivots (rows + columns)",
        "1-page dashboard layout",
        "Writing 1-page analyst memos",
    ],
    "tasks": [
        "Download Sample Superstore Excel file",
        "Build a Drills sheet practicing 5+ essential formulas",
        "Pivot for Q1 (sub-category margin)",
        "Pivot for Q2 (regional YoY growth)",
        "Pivot for Q3 (Furniture by sub-category and region)",
        "Build a 1-page Dashboard sheet",
        "Write + export a 1-page memo PDF + push to GitHub",
    ],
    "project": (
        "Sample Superstore Analysis v0.1 — a 1-page Excel/Sheets dashboard plus "
        "a 1-page PDF memo answering 3 specific questions about a fictional "
        "retailer. Public GitHub repo named superstore-analysis."
    ),
    "exercises": [
        "Add a 'Discount vs Profit' scatter plot — does discount eat profit?",
        "Compute customer lifetime value: sum of Sales per Customer ID. Top 10.",
        "Build a pivot of repeat-buyer % by Segment. Who comes back?",
        "Reformat your memo as a 5-slide deck — same content, exec-friendly",
    ],
    "questions": [
        "Why use profit MARGIN instead of raw profit to spot problems?",
        "What's the unit of 'growth' — orders, revenue, or customers?",
        "Where did you make a judgment call another analyst might disagree with?",
        "If Sample Superstore is fake, what real datasets have the same shape?",
    ],
    "outputs": [
        "Public GitHub repo named superstore-analysis",
        "Excel/Sheets file with Drills, Pivots, Dashboard sheets",
        "superstore-memo.pdf (1 page)",
        "Dashboard screenshot in README",
    ],
}


# ═══════════════════════════════════════════════════════════════════════
# 8. BI ANALYTICS — Superstore Power BI
# ═══════════════════════════════════════════════════════════════════════
BI = {
    "context": (
        "This week you are going to build the same Sample Superstore analysis "
        "as Data Analysis Week 1 — but in Power BI, the tool BI analysts use at "
        "real companies. By Sunday it will be PUBLISHED online at a shareable "
        "URL anyone can open in their browser. Power BI Desktop is free and "
        "Windows-only. (Mac users: use Power BI Service in browser, or run "
        "Windows in a free VM via VirtualBox.)"
    ),
    "days": [
        day(1, "What is Power BI?",
            "Watch + plan today.",
            [
                video("What is Power BI? (10 min beginner)",
                      search("what is power bi beginner explained 2024"),
                      10, "various"),
                reflect("Who reads this dashboard?",
                        "Imagine the Sample Superstore is a real retailer. Three people open this dashboard every Monday: the CEO, the regional VP, the category manager. Write 3 KPIs each persona would care about most. 9 KPIs total. We'll use this to pick the right 4 for the dashboard."),
            ]),
        day(2, "Install Power BI Desktop",
            "Get the tool.",
            [
                reading("Power BI Desktop (free)",
                        "https://www.microsoft.com/store/productid/9NTXR16HNW1T",
                        "Click 'Open' to install from Microsoft Store. Windows only. If you don't have Windows, see the Mac note in this week's intro."),
                video("Power BI Desktop install + interface tour (15 min)",
                      search("power bi desktop install tour 2024"),
                      15, "various"),
                exercise("Install + open",
                         "STEP 1 — Install Power BI Desktop from the card above (Microsoft Store, free).\n  Mac users: install Windows in a VirtualBox VM (free) or use app.powerbi.com directly with reduced features.\n\n"
                         "STEP 2 — Open Power BI Desktop.\n"
                         "  YOU SHOULD SEE: a welcome page. Click 'Get data' → 'Excel workbook'.\n\n"
                         "STEP 3 — Download Sample Superstore (same file as Data Analysis Week 1) from this URL:\n"
                         "  https://community.tableau.com/s/question/0D54T00000CWeX8SAL/sample-superstore-sales-excelxls\n"
                         "  Save it to your Desktop in a folder called superstore-bi.\n\n"
                         "STEP 4 — Import.\n"
                         "  In Power BI Desktop, point Get Data to your Sample - Superstore.xls.\n"
                         "  Check Orders, Returns, People. Click Transform Data → Power Query opens."),
            ]),
        day(3, "Clean in Power Query",
            "Today we clean the data BEFORE we model.",
            [
                video("Power Query for beginners — Guy in a Cube",
                      search("guy in a cube power query beginner"),
                      30, "Guy in a Cube"),
                exercise("Power Query clean",
                         "Power Query is open from yesterday. You see 3 tables on the left.\n\n"
                         "STEP 1 — Click the Orders table.\n\n"
                         "STEP 2 — Set column types.\n"
                         "  Click Order Date column → change type to Date.\n"
                         "  Click Ship Date column → Date.\n"
                         "  Click Sales, Profit, Discount → Decimal Number.\n\n"
                         "STEP 3 — Remove Row ID.\n"
                         "  Right-click Row ID column → Remove.\n\n"
                         "STEP 4 — Add Profit Margin column.\n"
                         "  Add Column tab → Custom Column.\n"
                         "  Name: Margin\n"
                         "  Formula: = [Profit] / [Sales]\n"
                         "  OK. Set the new column type to Percentage.\n\n"
                         "STEP 5 — Rename Sub-Category to Subcategory (consistency).\n"
                         "  Right-click → Rename.\n\n"
                         "STEP 6 — Click 'Close & Apply' (top left).\n"
                         "  Power BI Desktop reopens with your data loaded.\n\n"
                         "STEP 7 — Save the file.\n"
                         "  File → Save As → superstore.pbix → in your superstore-bi folder."),
            ]),
        day(4, "Build a date dimension table",
            "BI works best with a separate calendar table. Today we make one.",
            [
                video("Star schema in Power BI",
                      search("power bi star schema beginner"),
                      20, "various"),
                exercise("Create DimDate",
                         "STEP 1 — In Power BI Desktop, Modeling tab → New table.\n\n"
                         "STEP 2 — In the formula bar, type:\n"
                         "      DimDate = CALENDAR(DATE(2020,1,1), DATE(2024,12,31))\n"
                         "  Press Enter.\n"
                         "  YOU SHOULD SEE: a new table called DimDate with one column 'Date'.\n\n"
                         "STEP 3 — Add columns. With DimDate selected, Modeling tab → New column.\n"
                         "      Year = YEAR(DimDate[Date])\n"
                         "  New column again:\n"
                         "      Month = FORMAT(DimDate[Date], \"MMM\")\n"
                         "  New column:\n"
                         "      Quarter = \"Q\" & QUARTER(DimDate[Date])\n\n"
                         "STEP 4 — Connect to Orders.\n"
                         "  Click the Model view (middle icon on the left sidebar).\n"
                         "  Drag DimDate[Date] onto Orders[Order Date].\n"
                         "  YOU SHOULD SEE: a line connecting them. Cardinality should be One-to-Many.\n\n"
                         "STEP 5 — Save."),
            ]),
        day(5, "Write 6 DAX measures",
            "DAX = the formula language of Power BI. Today: 6 measures.",
            [
                video("DAX in 30 minutes — SQLBI",
                      search("sqlbi dax beginner 30 minutes"),
                      30, "SQLBI"),
                exercise("DAX measures",
                         "STEP 1 — In Power BI Desktop, click the Orders table on the right.\n"
                         "  Modeling tab → New measure.\n\n"
                         "STEP 2 — Type these one at a time. After each, press Enter and Modeling → New measure again:\n\n"
                         "      Total Sales = SUM(Orders[Sales])\n\n"
                         "      Total Profit = SUM(Orders[Profit])\n\n"
                         "      Profit Margin = DIVIDE([Total Profit], [Total Sales])\n\n"
                         "      Sales LY = CALCULATE([Total Sales], SAMEPERIODLASTYEAR(DimDate[Date]))\n\n"
                         "      YoY Growth = DIVIDE([Total Sales] - [Sales LY], [Sales LY])\n\n"
                         "      Sales YTD = TOTALYTD([Total Sales], DimDate[Date])\n\n"
                         "STEP 3 — Test in a card.\n"
                         "  Click the Report view (top icon on left sidebar).\n"
                         "  In the Visualizations pane, click the 'Card' icon.\n"
                         "  Drag [Total Sales] into Fields.\n"
                         "  YOU SHOULD SEE: $2,297,200 (or similar) in a big card. Your first DAX measure rendered."),
            ]),
        day(6, "Build the dashboard page",
            "Today you arrange everything into a 1-page dashboard.",
            [
                exercise("Lay it out",
                         "STEP 1 — In Report view, you have a blank canvas. Plan the layout:\n"
                         "  TOP (4 cards): Total Sales | Total Profit | Profit Margin | YoY Growth\n"
                         "  MIDDLE LEFT: line chart of Sales over time\n"
                         "  MIDDLE RIGHT: bar chart of Sales by Region\n"
                         "  BOTTOM: matrix of Subcategory + Margin\n"
                         "  LEFT SIDE: date slicer\n\n"
                         "STEP 2 — 4 KPI cards.\n"
                         "  Click Card visual. Drag Total Sales. Resize to ~200x100. Place top-left.\n"
                         "  Repeat for Total Profit, Profit Margin, YoY Growth — 4 cards in a row.\n\n"
                         "STEP 3 — Line chart.\n"
                         "  Click Line chart. Axis = DimDate[Year-Month] (or just Date). Values = Total Sales.\n"
                         "  Place in middle-left, sized ~500x300.\n\n"
                         "STEP 4 — Bar chart.\n"
                         "  Click Clustered bar chart. Axis = Region. Values = Total Sales.\n"
                         "  Middle-right, ~400x300.\n\n"
                         "STEP 5 — Matrix.\n"
                         "  Click Matrix. Rows = Subcategory. Values = Profit Margin.\n"
                         "  Click the dropdown next to Margin → Conditional Formatting → Background → set up:\n"
                         "    > 20% green, 5-20% yellow, < 5% red.\n"
                         "  Place at the bottom.\n\n"
                         "STEP 6 — Date slicer.\n"
                         "  Click Slicer. Drag DimDate[Date]. Change type to 'Between' or 'Relative date'.\n"
                         "  Place on the left side.\n\n"
                         "STEP 7 — Use colors consistently. Format the canvas. Add a title at the top.\n"
                         "  Save."),
            ]),
        day(7, "Publish + share + GitHub",
            "Today the dashboard goes ONLINE with a real URL.",
            [
                reading("Power BI Service — sign up (free)",
                        "https://app.powerbi.com/signupredirect?pbi_source=web",
                        "Click 'Open' to sign up. Use a work or school email if you have one. Otherwise: see Step 1 below for free Microsoft account."),
                reading("GitHub — create new repository",
                        "https://github.com/new",
                        "Click 'Open'. Name: superstore-bi. Public."),
                exercise("Publish + push",
                         "STEP 1 — Sign up for Power BI Service.\n"
                         "  Open the Power BI signup card. If it complains about your email — get a free Microsoft 365 Developer account: developer.microsoft.com/microsoft-365/dev-program. Use the email it gives you.\n\n"
                         "STEP 2 — Publish from Desktop.\n"
                         "  In Power BI Desktop: Home tab → Publish → My workspace.\n"
                         "  Wait 30-60 seconds. YOU SHOULD SEE: 'Success!' with a link.\n\n"
                         "STEP 3 — Open the published report.\n"
                         "  Click the link. Power BI Service opens in your browser. Your report is live.\n"
                         "  Copy the URL.\n\n"
                         "STEP 4 — Make it shareable (optional — requires Pro/free trial).\n"
                         "  In Service, click your report → Share → choose 'People with the link'.\n"
                         "  Or: File → Embed report → Publish to web (only if your account allows it).\n\n"
                         "STEP 5 — Push to GitHub.\n"
                         "  Open the 'create new repository' card. Name: superstore-bi. Public.\n"
                         "  In your terminal:\n"
                         "      cd Desktop/superstore-bi\n"
                         "      git init\n"
                         "      git add .\n"
                         "      git commit -m \"Superstore Power BI v0.1\"\n"
                         "      git branch -M main\n"
                         "      git remote add origin https://github.com/YOUR-USERNAME/superstore-bi.git\n"
                         "      git push -u origin main\n\n"
                         "STEP 6 — README.\n"
                         "  Add README.md:\n"
                         "      # Superstore Power BI v0.1\n"
                         "      Sample Superstore in Power BI with a date dimension, 6 DAX measures, 1-page dashboard.\n"
                         "      \n"
                         "      ## Live\n"
                         "      [Open in Power BI Service](paste-your-url-here)\n"
                         "      \n"
                         "      ## Measures\n"
                         "      - Total Sales\n"
                         "      - Total Profit\n"
                         "      - Profit Margin\n"
                         "      - Sales LY\n"
                         "      - YoY Growth\n"
                         "      - Sales YTD\n"
                         "      \n"
                         "      ## Screenshot\n"
                         "      ![Dashboard](dashboard.png)\n"
                         "  Take a screenshot of your dashboard, save as dashboard.png in the repo.\n"
                         "  Push again.\n\n"
                         "PASS CRITERIA — Superstore BI v0.1 ships when:\n"
                         "  ☐ superstore.pbix saved locally\n"
                         "  ☐ DimDate table connected to Orders[Order Date]\n"
                         "  ☐ 6 DAX measures created and working\n"
                         "  ☐ 1-page dashboard with 4 cards + 2 charts + matrix + slicer\n"
                         "  ☐ Published to Power BI Service\n"
                         "  ☐ Public GitHub repo named superstore-bi with .pbix + screenshot + README"),
                reflect("Would the CEO open this Monday morning?",
                        "If yes — what's the ONE follow-up they'd ask for? If no — what's missing?"),
            ]),
    ],
    "topics": [
        "Power BI Desktop installation + interface",
        "Power Query — type changes, custom columns, renames",
        "Star schema — fact + dimension tables",
        "CALENDAR for date dimensions",
        "DAX — SUM, DIVIDE, CALCULATE, TOTALYTD, SAMEPERIODLASTYEAR",
        "Relationships in Model view",
        "Dashboard layout: cards, charts, slicers, matrices",
        "Conditional formatting in matrices",
        "Publishing to Power BI Service",
    ],
    "tasks": [
        "Install Power BI Desktop",
        "Import Sample Superstore via Power Query",
        "Clean data + add Margin column in Power Query",
        "Create DimDate calendar table",
        "Connect DimDate to Orders",
        "Write 6 DAX measures",
        "Build a 1-page dashboard with 4 cards + 2 charts + matrix + slicer",
        "Publish to Power BI Service + push to GitHub",
    ],
    "project": (
        "Superstore Power BI v0.1 — published Power BI dashboard with a star "
        "schema (DimDate + Orders), 6 DAX measures, and a 1-page report live on "
        "Power BI Service. Public GitHub repo named superstore-bi with the .pbix "
        "and a screenshot."
    ),
    "exercises": [
        "Add a What-If parameter so users can simulate +/- 10% discount and see profit impact",
        "Add a drill-through page from any region in the bar chart → that region detail",
        "Switch the line chart to multi-line by Category — does the story change?",
        "Add a simple row-level security role 'WestVP' that only sees West data",
    ],
    "questions": [
        "Why is a star schema faster than a flat table at scale?",
        "What's an implicit measure vs explicit measure?",
        "If Orders had 100M rows, where would your dashboard slow first?",
        "What's the difference between a calculated column and a measure?",
    ],
    "outputs": [
        "Published Power BI URL in README",
        "Public GitHub repo named superstore-bi",
        ".pbix file committed",
        "Dashboard screenshot in README",
    ],
}


# ═══════════════════════════════════════════════════════════════════════
# Apply all
# ═══════════════════════════════════════════════════════════════════════
ROADMAPS = {
    "ai-engineering": AI_ENG,
    "ml-engineering": ML_ENG,
    "full-stack-web": FS_WEB,
    "mobile-engineering": MOBILE,
    "devops-cloud": DEVOPS,
    "cybersecurity": CYBERSEC,
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
        print(f"  OK {slug}: Week 1 rewritten in plain English")


if __name__ == "__main__":
    apply()
