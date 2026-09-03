"""
Replace Week 1 of each curated roadmap with a beginner-respecting,
day-by-day version. Resources are mostly YouTube videos handpicked for
clarity and brevity. This is the new format that the WeekPageTabs UI
shows as the default "Day by day" experience.

Run once after schema edits. Idempotent — replaces the Week 1 object.
"""
from __future__ import annotations
import json
from pathlib import Path

ROADMAPS_DIR = Path(__file__).resolve().parent.parent / "data" / "roadmaps"

# ── Helpers ────────────────────────────────────────────────────────
def video(title, url, duration_min, creator, why=""):
    return {"kind": "video", "title": title, "url": url, "duration_min": duration_min, "creator": creator, "why": why}

def reading(title, url, why=""):
    return {"kind": "reading", "title": title, "url": url, "why": why}

def exercise(title, body):
    return {"kind": "exercise", "title": title, "body": body}

def reflection(title, body):
    return {"kind": "reflection", "title": title, "body": body}

def day(number, title, items, summary=""):
    return {"number": number, "title": title, "summary": summary, "items": items}


# ── AI ENGINEERING — Week 1: What even IS AI engineering? ──────────
AI_ENGINEERING_W1 = {
    "number": 1,
    "title": "Meet the field — what AI engineering actually is",
    "phase": "Foundations",
    "commitment_hours": "5–8",
    "context": (
        "Forget code for a second. This week you'll understand what AI engineers actually do, talk to an AI for the first time, "
        "and write your very first program. No prior knowledge assumed — just curiosity and a laptop."
    ),
    "days": [
        day(1, "What is AI engineering?", [
            video(
                "But what is a neural network?",
                "https://www.youtube.com/watch?v=aircAruvnKk",
                19, "3Blue1Brown",
                "The clearest visual explanation of what powers modern AI."
            ),
            video(
                "What is an LLM (Large Language Model)? in plain English",
                "https://www.youtube.com/watch?v=5sLYAQS9sWQ",
                7, "IBM Technology",
                "Short, no-jargon — exactly what ChatGPT actually is."
            ),
            reflection(
                "Write down what you think AI is",
                "Just one paragraph in a note. We'll come back to this in Week 8 — you'll laugh at how much your view changes."
            ),
        ], summary="No coding today. Just understand the field."),
        day(2, "Install Python — the language of AI", [
            video(
                "How to install Python in 2026 (Windows / Mac / Linux)",
                "https://www.youtube.com/results?search_query=how+to+install+python+2026+beginner",
                10, "Programming with Mosh",
                "Pick the video matching your OS, follow exactly."
            ),
            exercise(
                "Run your first Python program",
                "Open Terminal (Mac) or Command Prompt (Windows). Type `python --version` — you should see Python 3.12 or higher. Then `python` to open the interactive shell. Type `print('Hello, world')` and press Enter. You just ran your first program."
            ),
            reading(
                "What is Python, really?",
                "https://www.python.org/about/gettingstarted/",
                "Bookmark this — short, official, beginner-friendly."
            ),
        ], summary="Get a working Python on your laptop."),
        day(3, "What is an API?", [
            video(
                "What is an API? In 4 minutes",
                "https://www.youtube.com/watch?v=OVvTv9Hy91Q",
                4, "MuleSoft",
                "An API is how programs talk to each other — including AI."
            ),
            video(
                "API explained for beginners with examples",
                "https://www.youtube.com/results?search_query=api+for+beginners+explained+with+examples",
                12, "Tech With Tim",
                "Slightly longer, more concrete. Watch if the 4-min one moved too fast."
            ),
            reflection(
                "Three apps you use that probably use APIs",
                "Examples: Uber uses Google Maps' API for routing. WhatsApp uses APIs to send your message. Spotify uses an API to fetch song lyrics. Name three of your own."
            ),
        ], summary="Understand how AI is delivered to apps."),
        day(4, "Talk to your first AI", [
            reading(
                "Sign up for Anthropic (free Claude account)",
                "https://console.anthropic.com/",
                "Free tier is plenty for this week. Save your API key — you'll need it tomorrow."
            ),
            exercise(
                "Have a conversation with Claude",
                "Open https://claude.ai and chat. Try: 'Explain APIs to me like I'm 10.' Then: 'Now explain them assuming I'm an engineer.' Notice the difference. Same model, different responses. That's prompting."
            ),
            reflection(
                "What surprised you about the AI's answers?",
                "Write 3 things. We're building your intuition for what these systems CAN and CANNOT do."
            ),
        ], summary="Today you actually use AI."),
        day(5, "Your first AI script in Python", [
            video(
                "Hello world with the Anthropic API in 10 minutes",
                "https://www.youtube.com/results?search_query=anthropic+api+python+tutorial+beginner",
                10, "AssemblyAI",
                "Follow along exactly. Don't worry if you don't understand every line."
            ),
            exercise(
                "Send your first API request",
                "Install with `pip install anthropic`. Create a file `hello_ai.py`. Paste the example from the video. Replace the API key with yours. Run `python hello_ai.py`. Watch the AI respond — from your code."
            ),
            reading(
                "Anthropic API quickstart",
                "https://docs.anthropic.com/en/docs/get-started",
                "Reference doc. The video is the tutorial; this is the cheat sheet."
            ),
        ], summary="Today you write code that talks to AI."),
        day(6, "Tinker — make it do something fun", [
            exercise(
                "Build a haiku generator",
                "Change yesterday's script. Instead of asking 'Hello', ask 'Write me a haiku about [your favourite topic]'. Run it 5 times. Different haiku every time. That's the AI being non-deterministic."
            ),
            exercise(
                "Now make it ask the user",
                "Use `input()` in Python to ask the user for a topic. Pass that to the AI. Build a tiny CLI: `python haiku.py` → prompts → prints a haiku."
            ),
        ], summary="Make it yours."),
        day(7, "Ship + reflect", [
            exercise(
                "Push to GitHub",
                "Create a free GitHub account. Make a new repo called `week-1-ai`. Push your haiku script with a README explaining what it does. This is your first public artifact as an AI engineer."
            ),
            reflection(
                "What's the smallest useful AI tool you can imagine?",
                "Now that you've sent prompts and gotten responses, dream a little. What's the silliest, simplest, most useful AI tool you could build with 20 lines of code? We'll come back to your idea in Week 4."
            ),
        ], summary="You did it. Real check-in at the end."),
    ],
    "topics": [
        "What AI engineering actually is", "What an LLM is", "What an API is", "Installing Python",
        "Sending your first request to Claude", "Reading API responses", "Building a tiny CLI",
        "Pushing your first repo to GitHub",
    ],
    "tasks": [
        "Install Python 3.12+ on your laptop",
        "Create a free Anthropic account and get your API key",
        "Run your first Python program that prints 'Hello, world'",
        "Send your first API request to Claude — get a real AI response",
        "Build a haiku generator that asks the user for a topic",
        "Push the week's code to a public GitHub repo",
    ],
    "project": (
        "A haiku generator. Python script that asks the user for a topic, calls Claude, and prints a haiku. "
        "20 lines of code max. Polish it, push to GitHub with a README, share the link."
    ),
    "resources": [
        {"label": "3Blue1Brown — But what is a neural network?", "url": "https://www.youtube.com/watch?v=aircAruvnKk", "note": "YouTube · 19 min · best visual intro to AI"},
        {"label": "IBM — What is an LLM, plain English", "url": "https://www.youtube.com/watch?v=5sLYAQS9sWQ", "note": "YouTube · 7 min"},
        {"label": "Python.org — Getting started", "url": "https://www.python.org/about/gettingstarted/", "note": "Official, short, beginner-safe"},
        {"label": "Anthropic — Getting Started", "url": "https://docs.anthropic.com/en/docs/get-started", "note": "Official cheat sheet for your first API call"},
        {"label": "Claude (free chat)", "url": "https://claude.ai", "note": "Talk to an AI before you write any code"},
    ],
    "questions": [
        "What did 3Blue1Brown's neural network video click for you that no article ever did?",
        "Run your haiku script 5 times with the same topic. Are the haikus identical? Different? Why?",
        "Compare asking Claude in chat vs from your script. What's the difference in the experience? What's the same?",
        "If your friend asked 'is this AI thing for me?', what would you say after Week 1?",
    ],
    "exercises": [
        "Change your haiku generator to output 3 haiku per topic, not 1",
        "Add a 'style' parameter — funny, sad, formal — that changes the AI's prompt",
        "Print the number of words in the AI's response",
        "Save every haiku to a file `haikus.txt` so you build a collection over time",
    ],
    "outputs": [
        "Working Python install on your laptop",
        "Working API key from Anthropic",
        "A GitHub repo with your haiku generator + README",
        "A reflection note: what AI is, what surprised you this week",
    ],
}


# ── ML ENGINEERING — Week 1: What is data + machine learning ────────
ML_ENGINEERING_W1 = {
    "number": 1,
    "title": "What machine learning actually is",
    "phase": "Foundations",
    "commitment_hours": "5–8",
    "context": (
        "ML is just pattern-finding with maths. This week you'll watch the core idea click, install Python, "
        "and run your first model — without understanding every line. Don't worry, we'll go back to it."
    ),
    "days": [
        day(1, "What is machine learning?", [
            video("Machine Learning Explained in 100 seconds", "https://www.youtube.com/watch?v=PeMlggyqz0Y", 2, "Fireship", "Fast, funny, accurate"),
            video("But what is a neural network?", "https://www.youtube.com/watch?v=aircAruvnKk", 19, "3Blue1Brown", "The canonical visual explainer"),
            reflection("Name three real-world ML applications", "Email spam filters, Netflix recommendations, your phone's camera. What are 3 more you use weekly?"),
        ], summary="Get the vibe before any code"),
        day(2, "Install Python + Jupyter", [
            video("How to install Anaconda + Jupyter Notebook", "https://www.youtube.com/results?search_query=install+anaconda+jupyter+notebook+beginner+2026", 10, "Programming with Mosh", "Anaconda bundles everything you need"),
            exercise("Open your first notebook", "After installing Anaconda, launch Jupyter Notebook. Create a new Python 3 notebook. In the first cell, type `print('hello ML')` and press Shift+Enter."),
        ], summary="Get a working data-science setup"),
        day(3, "NumPy — the foundation of all ML in Python", [
            video("NumPy in 5 minutes", "https://www.youtube.com/watch?v=xECXZ3tyONo", 5, "Patrick Loeber", "What it is + why every ML library uses it"),
            exercise("Make a NumPy array", "In your notebook: `import numpy as np`, then `a = np.array([1, 2, 3, 4])`, then `print(a * 2)`. Look — every number doubled, no loop needed."),
        ], summary="Today you meet the workhorse"),
        day(4, "Your first data file", [
            video("Pandas in 10 minutes", "https://www.youtube.com/watch?v=tRKeLrwfUgU", 10, "Keith Galli", "Loading and exploring real data"),
            exercise("Load the Iris dataset", "Run `from sklearn.datasets import load_iris; iris = load_iris(); print(iris.data[:5])`. Five rows of real flower measurements. Welcome to data."),
        ], summary="Real data, in your hands"),
        day(5, "Train your first model", [
            video("scikit-learn in 15 minutes (your first model)", "https://www.youtube.com/results?search_query=scikit+learn+first+model+iris+beginner", 15, "freeCodeCamp", "Train + predict on Iris"),
            exercise("Train an Iris classifier", "Follow the video. Train a `DecisionTreeClassifier`. Predict on one flower. Print accuracy. You just trained an ML model."),
        ], summary="Today you train AI"),
        day(6, "Make it yours", [
            exercise("Try another model", "Replace `DecisionTreeClassifier` with `KNeighborsClassifier`. Same data, different algorithm. Is the accuracy different? Try `RandomForestClassifier` too."),
            reflection("Which model performed best?", "Why might that be? Don't worry if you can't answer — write your guess."),
        ], summary="Compare approaches"),
        day(7, "Ship + reflect", [
            exercise("Push your notebook to GitHub", "Create a repo `week-1-ml`. Push the notebook + a short README. First public ML artifact."),
            reflection("What's one thing that surprised you?", "ML felt mysterious last Sunday. What feels less mysterious now?"),
        ], summary="Public artifact + reflection"),
    ],
    "topics": ["What machine learning is", "Installing Anaconda + Jupyter", "NumPy basics", "Loading datasets with pandas", "Training your first classifier", "Comparing model accuracy"],
    "tasks": ["Install Anaconda", "Open Jupyter Notebook", "Create your first NumPy array", "Load the Iris dataset", "Train a DecisionTreeClassifier", "Push the notebook to GitHub"],
    "project": "A Jupyter notebook that loads the Iris dataset, trains 3 different classifiers, prints each one's accuracy, and writes one paragraph explaining which won and why you think so.",
    "resources": [
        {"label": "Fireship — ML in 100 seconds", "url": "https://www.youtube.com/watch?v=PeMlggyqz0Y", "note": "YouTube · 2 min"},
        {"label": "3Blue1Brown — Neural networks", "url": "https://www.youtube.com/watch?v=aircAruvnKk", "note": "YouTube · 19 min · best visual intro"},
        {"label": "Patrick Loeber — NumPy in 5 minutes", "url": "https://www.youtube.com/watch?v=xECXZ3tyONo", "note": "YouTube · 5 min"},
        {"label": "Keith Galli — Pandas in 10 minutes", "url": "https://www.youtube.com/watch?v=tRKeLrwfUgU", "note": "YouTube · 10 min"},
        {"label": "scikit-learn — Getting Started", "url": "https://scikit-learn.org/stable/getting_started.html", "note": "Official, beginner-friendly"},
    ],
    "questions": [
        "Why does the same dataset give different accuracy with different models?",
        "What's the smallest piece of code that did real ML this week — just one line?",
        "If you had to explain ML to your grandma, what's your 30-second pitch?",
        "What's a real dataset YOU would want to train a model on?",
    ],
    "exercises": [
        "Predict on a flower you make up (4 random numbers). What does the model say?",
        "Print the model's accuracy on different train/test splits (80/20, 70/30, 60/40)",
        "Add `print(iris.feature_names)` and `print(iris.target_names)` — see what the model is actually learning",
    ],
    "outputs": ["Working Anaconda + Jupyter setup", "A trained ML model in a notebook", "Notebook pushed to a public GitHub repo", "A reflection note on what ML feels like now"],
}


# ── FULL STACK WEB — Week 1: What even is a website? ────────────────
FULL_STACK_W1 = {
    "number": 1,
    "title": "What a website actually is",
    "phase": "Foundations",
    "commitment_hours": "5–8",
    "context": "By Sunday you'll have built a real webpage you can show anyone. No frameworks yet. Just HTML — the bones of every site you've ever used.",
    "days": [
        day(1, "How the web actually works", [
            video("How the web works in 5 minutes", "https://www.youtube.com/watch?v=hJHvdBlSxug", 5, "Code.org", "Clearest possible explanation"),
            video("HTML in 100 seconds", "https://www.youtube.com/watch?v=ok-plXXHlWw", 2, "Fireship", "What HTML is, fast"),
            reflection("Open dev tools on your favourite website", "Right-click → Inspect. You're looking at the HTML. Try changing a heading. Notice nothing breaks — it's local to you. That's the web."),
        ], summary="Today you peek behind the curtain"),
        day(2, "Install VS Code + Live Server", [
            video("Install VS Code + Live Server", "https://www.youtube.com/results?search_query=install+vs+code+live+server+extension+beginner", 8, "Coder Coder", "Your code editor + auto-refresh"),
            exercise("Create your first HTML file", "Make a folder `my-site`. Inside, create `index.html`. Paste: `<h1>Hello, web</h1><p>I am building this.</p>`. Open with Live Server. It works."),
        ], summary="Your dev environment, ready"),
        day(3, "HTML — every tag that matters", [
            video("Learn HTML in 12 minutes", "https://www.youtube.com/watch?v=salY_Sm6mv4", 12, "Web Dev Simplified", "Every tag you need for week 1"),
            exercise("Make a personal page", "Headings (h1-h3), paragraphs, a list, an image, a link to your favourite site. Use Live Server to see it live."),
        ], summary="Today HTML clicks"),
        day(4, "CSS — make it not ugly", [
            video("CSS in 100 seconds", "https://www.youtube.com/watch?v=OEV8gMkCHXQ", 2, "Fireship", "What CSS is"),
            video("Learn CSS in 20 minutes", "https://www.youtube.com/watch?v=1PnVor36_40", 20, "Web Dev Simplified", "Selectors, colours, fonts, layout"),
            exercise("Style your personal page", "Pick a colour palette from coolors.co. Use a Google Font. Centre your name. Make it look intentional."),
        ], summary="From plain to polished"),
        day(5, "Layout — make it look like a real site", [
            video("Flexbox in 20 minutes", "https://www.youtube.com/watch?v=fYq5PXgSsbE", 20, "Web Dev Simplified", "The layout system every site uses"),
            exercise("Build a navbar", "Top of your page: a row with your name on the left + 3 links (About, Projects, Contact) on the right. Use flexbox. Match a real site's vibe."),
        ], summary="Today you build like a pro"),
        day(6, "Deploy it — it lives on the internet", [
            video("Deploy any site to GitHub Pages free", "https://www.youtube.com/results?search_query=deploy+to+github+pages+beginner+2026", 10, "James Q Quick", "Your site, live, free"),
            exercise("Push + deploy", "GitHub account → create repo `your-name.github.io` → push your `my-site` files. Within 60 seconds your site is live at `your-name.github.io`."),
        ], summary="Your first real URL"),
        day(7, "Ship + reflect", [
            exercise("Share with someone", "Send the link to a friend. Tell them you built it from scratch in 7 days. Save what they say."),
            reflection("What's one thing harder than you expected?", "And one thing easier?"),
        ], summary="You're a builder now"),
    ],
    "topics": ["How the web works", "HTML tags", "CSS basics", "Flexbox layout", "VS Code + Live Server", "Deploying with GitHub Pages"],
    "tasks": ["Install VS Code + Live Server", "Create your first HTML page", "Style it with CSS", "Build a flexbox navbar", "Push to GitHub", "Deploy to GitHub Pages"],
    "project": "A personal homepage hosted at `your-name.github.io`. Your name as h1, a 2-paragraph bio, a list of 3 things you want to build, and a flexbox navbar. Styled to feel intentional.",
    "resources": [
        {"label": "Code.org — How the web works", "url": "https://www.youtube.com/watch?v=hJHvdBlSxug", "note": "YouTube · 5 min"},
        {"label": "Web Dev Simplified — HTML in 12 min", "url": "https://www.youtube.com/watch?v=salY_Sm6mv4", "note": "YouTube · 12 min"},
        {"label": "Web Dev Simplified — CSS in 20 min", "url": "https://www.youtube.com/watch?v=1PnVor36_40", "note": "YouTube · 20 min"},
        {"label": "Web Dev Simplified — Flexbox", "url": "https://www.youtube.com/watch?v=fYq5PXgSsbE", "note": "YouTube · 20 min"},
        {"label": "MDN — HTML basics", "url": "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics", "note": "Reference"},
    ],
    "questions": [
        "Why do you think CSS is separate from HTML?",
        "What's the difference between block and inline elements? Open dev tools and inspect a button vs a div.",
        "Your site is now public — what's one thing on it you don't want a future employer to see? Fix it.",
        "If you had to explain to your grandma how websites work, what's your 30-second pitch?",
    ],
    "exercises": [
        "Make your navbar links change colour on hover (use :hover)",
        "Add a profile photo (any image) styled as a circle",
        "Make the page look good on a phone — open it on your phone via the GitHub Pages URL",
        "Add a footer with the year auto-filled (hint: you'll need JavaScript later — for now hardcode it)",
    ],
    "outputs": ["A live personal site at your-name.github.io", "Source code in a public GitHub repo", "Working VS Code + Live Server setup", "Reflection on what you learned"],
}


# ── MOBILE ENGINEERING — Week 1: What is a mobile app? ──────────────
MOBILE_W1 = {
    "number": 1,
    "title": "Your first mobile app",
    "phase": "Foundations",
    "commitment_hours": "6–9",
    "context": "By the end of this week you'll have an app you wrote running on your own phone. No fancy stack — React Native (the same tech that powers Instagram, Discord, Pinterest).",
    "days": [
        day(1, "What makes mobile different?", [
            video("React Native in 100 seconds", "https://www.youtube.com/watch?v=gvkqT_Uoahw", 2, "Fireship", "What it is, why it exists"),
            video("Native vs cross-platform: which to choose", "https://www.youtube.com/results?search_query=react+native+vs+flutter+vs+native+beginner+2026", 8, "ByteByteGo", "The 3 paths, honest take"),
            reflection("Three apps on your phone you love", "Open each. Notice what they do well: speed, feel, animation. We'll learn how that's built."),
        ], summary="Pick a side: React Native it is"),
        day(2, "Install Node + Expo", [
            video("Setup Expo + React Native from scratch", "https://www.youtube.com/results?search_query=expo+react+native+setup+beginner+2026", 12, "Catalin Miron", "Expo is the easiest start"),
            exercise("Create your first app", "Run `npx create-expo-app HelloMobile`. `cd HelloMobile`. `npx expo start`. Scan the QR code with the Expo Go app on your phone. **Your code is on your phone.**"),
        ], summary="From zero to running on a real phone"),
        day(3, "Edit the screen, see it change", [
            video("React Native components in 15 min", "https://www.youtube.com/watch?v=ZBCUegTZF7M", 15, "Programming with Mosh", "View, Text, Image — the core 3"),
            exercise("Make it say your name", "Open `App.js`. Find the Text component. Change it to your name. Save — your phone updates instantly. **That's hot reload.**"),
        ], summary="Today the magic clicks"),
        day(4, "Styling — making it look real", [
            video("React Native styling for beginners", "https://www.youtube.com/results?search_query=react+native+styling+stylesheet+beginner", 12, "Net Ninja", "Styles work like CSS — but for native"),
            exercise("Make a profile card", "A card with your name (big), one-line bio, and a circular photo. Use StyleSheet."),
        ], summary="Polish the screen"),
        day(5, "Buttons + interactivity", [
            video("Button + state in React Native", "https://www.youtube.com/results?search_query=react+native+button+useState+beginner", 10, "PedroTech", "useState — the heart of React"),
            exercise("Add a tap counter", "Below your profile card, add a button. Below the button, show how many times it's been tapped. Use `useState`."),
        ], summary="It responds to you"),
        day(6, "Make it yours", [
            exercise("Personalise it", "Spend an hour. Add your favourite quote. Add 3 buttons that show different facts about you. Use real colours. Show your phone to a friend."),
            video("How to add an icon set in Expo", "https://www.youtube.com/results?search_query=expo+vector+icons+beginner", 6, "Code with Beto", "Icons make any app look 10x more real"),
        ], summary="It feels like an app"),
        day(7, "Ship + reflect", [
            exercise("Push to GitHub", "Make repo `week-1-mobile`. Push your app code. README explains what it does + screenshots from your phone."),
            reflection("What surprised you?", "How does mobile dev feel vs other code you've written? What's harder? What's easier?"),
        ], summary="First mobile artifact"),
    ],
    "topics": ["What React Native is", "Native vs cross-platform", "Expo setup", "View / Text / Image", "StyleSheet", "useState + buttons", "Hot reload"],
    "tasks": ["Install Node + Expo CLI", "Install Expo Go on your phone", "Create + run your first React Native app", "Make a styled profile card", "Add a tap counter with useState", "Push to GitHub"],
    "project": "A personal profile app running on your phone. Profile card + 3 fact buttons that show/hide info on tap. Pushed to GitHub with screenshots in the README.",
    "resources": [
        {"label": "Fireship — React Native in 100s", "url": "https://www.youtube.com/watch?v=gvkqT_Uoahw", "note": "YouTube · 2 min"},
        {"label": "Programming with Mosh — RN components", "url": "https://www.youtube.com/watch?v=ZBCUegTZF7M", "note": "YouTube · 15 min"},
        {"label": "Expo docs — Get Started", "url": "https://docs.expo.dev/get-started/create-a-project/", "note": "Official, beginner-safe"},
        {"label": "React Native docs — Core Components", "url": "https://reactnative.dev/docs/intro-react-native-components", "note": "Reference"},
    ],
    "questions": [
        "Why does Expo make this so much easier than installing Xcode + Android Studio?",
        "When you change a colour and your phone updates instantly — what's actually happening?",
        "What's something your app CAN do that a website can't?",
        "Show your friend the app on your phone. What was their reaction? What part surprised them?",
    ],
    "exercises": [
        "Add a third screen (use React Navigation or just hide/show with state)",
        "Add a long-press handler — tap = small action, long-press = big action",
        "Use the device's date/time so the app says 'Good morning' / 'Good evening' based on the actual hour",
        "Add haptic feedback on button tap (Expo Haptics) — feel the vibration on your phone",
    ],
    "outputs": ["Expo dev environment working", "App running on your physical phone", "GitHub repo with code + phone screenshots in README", "Reflection note"],
}


# ── DEVOPS / CLOUD — Week 1: What is a server? ──────────────────────
DEVOPS_W1 = {
    "number": 1,
    "title": "What a server actually is",
    "phase": "Foundations",
    "commitment_hours": "5–8",
    "context": "Servers feel mythical until you've SSH'd into one. This week you'll rent a real Linux server for ~$0, log into it, install a web server, and serve a page from it. Welcome to the cloud.",
    "days": [
        day(1, "What is a server?", [
            video("What is a server? (in 4 minutes)", "https://www.youtube.com/watch?v=u3JZnSrkbhU", 4, "Tonio Liebrand", "Plain English — no jargon"),
            video("How the cloud works", "https://www.youtube.com/watch?v=AluPzytlEXY", 8, "Tom Scott", "Real-world tour"),
            reflection("Trace a request you made today", "When you opened forge-ab.vercel.app, what physical computer served the page? Where in the world is it? (Hint: AWS us-east-1 probably.)"),
        ], summary="Demystify the cloud"),
        day(2, "Linux basics — the OS of every server", [
            video("Learn Linux in 5 minutes", "https://www.youtube.com/watch?v=ROjZy1WbCIA", 5, "ThePrimeagen", "Fast, hilarious, useful"),
            video("20 Linux commands every developer should know", "https://www.youtube.com/watch?v=gd7BXuUQ91w", 15, "freeCodeCamp", "ls, cd, mkdir, cat, pwd, vim..."),
            exercise("Open a terminal", "Mac: Cmd+Space → Terminal. Windows: install WSL (search YouTube). Run: `ls`, `cd ~`, `mkdir test`, `cd test`, `pwd`. That's Linux on your machine."),
        ], summary="Today you learn the language servers speak"),
        day(3, "Rent your first server", [
            video("Get a free Oracle Cloud VM in 10 minutes", "https://www.youtube.com/results?search_query=oracle+cloud+free+vm+ubuntu+beginner+2026", 12, "NetworkChuck", "Free forever, real Linux server"),
            exercise("Create + SSH in", "Follow the video. Get a free Oracle Cloud / DigitalOcean trial / AWS free tier VM. Download the SSH key. Run `ssh -i key.pem ubuntu@your-ip`. You're inside a real server, anywhere in the world."),
        ], summary="Your own server, anywhere"),
        day(4, "Install Nginx — serve your first page", [
            video("Install Nginx + serve HTML on Ubuntu", "https://www.youtube.com/results?search_query=install+nginx+ubuntu+serve+html+beginner", 10, "Tutorialspoint", "From scratch"),
            exercise("Serve your name", "On the server: `sudo apt update && sudo apt install nginx -y`. Visit your server's IP in a browser. You'll see Nginx's welcome page. Now edit `/var/www/html/index.html` to say your name. Refresh. Your name is now served from a real server."),
        ], summary="It's serving. From the cloud. By you."),
        day(5, "Buy a domain — or use a free one", [
            video("Connect a domain to a server in 5 minutes", "https://www.youtube.com/results?search_query=point+domain+to+server+a+record+beginner", 8, "DigitalOcean", "DNS basics"),
            reading("Free subdomain via DuckDNS", "https://www.duckdns.org/", "If you don't want to buy a domain ($10 cheapest)"),
            exercise("Point a domain at your IP", "Get a free subdomain (duckdns.org). Point its A record to your server's IP. In ~10 minutes, your-name.duckdns.org serves your page."),
        ], summary="From IP to domain"),
        day(6, "HTTPS — make it secure", [
            video("Free HTTPS with Let's Encrypt", "https://www.youtube.com/results?search_query=lets+encrypt+nginx+certbot+beginner", 10, "Learn Linux TV", "Free SSL in 5 commands"),
            exercise("Add HTTPS", "Install certbot. Run `sudo certbot --nginx`. Visit https://your-domain. Browser shows the green padlock. You did SSL."),
        ], summary="A real, secure URL — yours"),
        day(7, "Ship + reflect", [
            exercise("Document what you built", "Write a README in a GitHub repo. Include: server provider, distro, what you installed, what URL serves your page, screenshots. This is your first DevOps artifact."),
            reflection("What's still scary?", "Logging into a server felt like sneaking into the Matrix. What part still feels mythical? We'll go there in Week 4."),
        ], summary="You operate cloud infrastructure now"),
    ],
    "topics": ["What a server is", "Cloud providers", "Linux basics", "SSH", "Installing Nginx", "Serving HTML", "DNS basics", "HTTPS via Let's Encrypt"],
    "tasks": ["Install a terminal (Mac) or WSL (Windows)", "Get a free cloud VM (Oracle / DO / AWS)", "SSH in", "Install Nginx", "Serve an HTML page that says your name", "Point a free subdomain at your server", "Add free HTTPS with Let's Encrypt"],
    "project": "A real Linux server, accessible at a real HTTPS URL, serving your HTML page. README on GitHub documenting every step. This is the first thing a DevOps engineer can show.",
    "resources": [
        {"label": "Tonio Liebrand — What is a server?", "url": "https://www.youtube.com/watch?v=u3JZnSrkbhU", "note": "YouTube · 4 min"},
        {"label": "ThePrimeagen — Linux in 5 min", "url": "https://www.youtube.com/watch?v=ROjZy1WbCIA", "note": "YouTube · 5 min"},
        {"label": "NetworkChuck — Free Oracle VM", "url": "https://www.networkchuck.com/", "note": "Channel full of free-cloud tutorials"},
        {"label": "DigitalOcean Community", "url": "https://www.digitalocean.com/community/tutorials", "note": "Highest-quality DevOps tutorials anywhere"},
        {"label": "Let's Encrypt", "url": "https://letsencrypt.org/getting-started/", "note": "Free SSL certificates"},
    ],
    "questions": [
        "When you SSH'd in, what physical machine were you on? Where in the world? Look it up.",
        "When you typed `sudo apt install nginx`, what actually happened? Trace the steps in your head.",
        "Visit your domain. Open dev tools → Network. See the headers. Find `Server: nginx`. You set that.",
        "What did installing HTTPS feel like? Was it harder or easier than you expected?",
    ],
    "exercises": [
        "Add a /about page on your server",
        "Use `htop` on the server — what's running? Watch CPU spike when you refresh the page",
        "Set up `ufw` (uncomplicated firewall) — only allow ports 22, 80, 443",
        "Add a custom 404 page in Nginx",
    ],
    "outputs": ["A working free cloud VM you own", "Nginx serving HTML at https://your-domain", "GitHub repo with step-by-step README", "A reflection note on what cloud feels like now"],
}


# ── CYBERSECURITY — Week 1: How attackers think ─────────────────────
CYBERSEC_W1 = {
    "number": 1,
    "title": "How attackers actually think",
    "phase": "Foundations",
    "commitment_hours": "6–9",
    "context": "Security is not a tool, it's a mindset. By Sunday you'll have legally hacked your first machine on TryHackMe — and you'll understand why a strong password isn't enough.",
    "days": [
        day(1, "The mindset", [
            video("How hackers think (mindset)", "https://www.youtube.com/watch?v=8orZqW3MJyk", 12, "John Hammond", "From a real hacker"),
            video("OWASP Top 10 in 8 minutes", "https://www.youtube.com/results?search_query=owasp+top+10+explained+beginner", 8, "Loi Liang Yang", "The 10 most common ways apps get hacked"),
            reflection("How could YOUR most-used app get hacked?", "Pick one. Brainstorm 3 weaknesses. We're starting to think like an attacker."),
        ], summary="Today the mindset starts"),
        day(2, "Linux for hackers", [
            video("Linux essentials for hacking", "https://www.youtube.com/watch?v=U25dBe75BMA", 18, "NetworkChuck", "Terminal basics through a security lens"),
            exercise("Practice 10 commands", "ls, cd, pwd, cat, grep, find, ps, kill, ssh, scp. Use them on your laptop until they feel natural."),
        ], summary="Tools of the trade"),
        day(3, "TryHackMe — sign up", [
            reading("Create your TryHackMe account", "https://tryhackme.com/signup", "Free tier is enough for week 1"),
            video("TryHackMe walkthrough — getting started", "https://www.youtube.com/results?search_query=tryhackme+intro+to+cyber+security+walkthrough", 15, "John Hammond", "First steps on the platform"),
            exercise("Complete 'Intro to Cyber Security' room", "On TryHackMe, find 'Intro to Cyber Security'. Free, ~30 min. Do it."),
        ], summary="Your platform for the next 24 weeks"),
        day(4, "Network basics", [
            video("Networking for hackers (everything you need)", "https://www.youtube.com/watch?v=7N9Pq16zCwA", 25, "David Bombal", "Ports, IPs, protocols — fast"),
            exercise("Run nmap on yourself", "Install nmap. Run `nmap 127.0.0.1`. What ports are open on your laptop? Why is each one open?"),
        ], summary="Today networks click"),
        day(5, "Your first 'attack' (legally)", [
            video("TryHackMe — Try Hack Me first hack", "https://www.youtube.com/results?search_query=tryhackme+blue+walkthrough+beginner", 20, "InsiderPhD", "Real machine, real exploit"),
            exercise("Complete TryHackMe 'Pickle Rick' room", "Free, beginner. Capture all 3 flags. You're legally hacking a real machine."),
        ], summary="You hack today"),
        day(6, "Defence — the other side", [
            video("How to think like a defender", "https://www.youtube.com/results?search_query=how+to+think+like+a+defender+blue+team+beginner", 15, "13Cubed", "Same skill, opposite direction"),
            reflection("Your laptop — defended?", "Is your laptop password strong? Disk encrypted? Auto-updates on? Firewall? Fix 2 weaknesses tonight."),
        ], summary="The defender mind"),
        day(7, "Ship + reflect", [
            exercise("Write a 'first hack' blog post", "Push a GitHub repo `week-1-cybersec` with a markdown post. What you learned. Screenshot of your captured flag. Your reflections on offensive vs defensive."),
            reflection("Where do you want to go?", "Pentester? Defender? Security engineer? AppSec? It's all open. What pulled you in this week?"),
        ], summary="First public artifact"),
    ],
    "topics": ["The attacker mindset", "OWASP Top 10", "Linux command-line", "TryHackMe platform", "Basic networking", "nmap basics", "Your first capture-the-flag", "Defensive thinking"],
    "tasks": ["Watch the mindset videos", "Practice 10 Linux commands until they feel native", "Sign up for TryHackMe", "Complete 'Intro to Cyber Security'", "Run nmap on your laptop", "Complete 'Pickle Rick' on TryHackMe", "Fix 2 security weaknesses on your laptop"],
    "project": "A markdown writeup on GitHub: your first week, your first capture-the-flag, screenshots, reflections. Title it 'Week 1: How I think about security now'.",
    "resources": [
        {"label": "John Hammond YouTube", "url": "https://www.youtube.com/c/JohnHammond010", "note": "The best free security education on YouTube"},
        {"label": "TryHackMe", "url": "https://tryhackme.com/", "note": "Where you'll spend the next 24 weeks"},
        {"label": "NetworkChuck — Linux for hackers", "url": "https://www.youtube.com/watch?v=U25dBe75BMA", "note": "YouTube · 18 min"},
        {"label": "OWASP Top 10", "url": "https://owasp.org/www-project-top-ten/", "note": "Industry's #1 web vulnerability list"},
        {"label": "HackTheBox (alternative)", "url": "https://www.hackthebox.com/", "note": "More advanced than TryHackMe"},
    ],
    "questions": [
        "Of the OWASP Top 10, which would you find on a real production website if you looked? Make a guess.",
        "What does nmap tell you about your own laptop? Are you surprised by what's running?",
        "After Pickle Rick — what was the moment something clicked?",
        "Offence or defence? Why? It's OK if you don't know yet.",
    ],
    "exercises": [
        "Find the version of nginx your favourite website runs (use `curl -I https://site.com`)",
        "Use TryHackMe's 'Linux Fundamentals' module — 3 short rooms",
        "Set up a long passphrase (4+ random words) on your Gmail account if you haven't",
        "Turn on 2FA on every important account — use Authy or Google Authenticator",
    ],
    "outputs": ["TryHackMe account with 2+ rooms completed", "Working nmap install + scan results", "GitHub repo with your week-1 writeup", "Your laptop measurably more secure"],
}


# ── DATA SCIENCE — Week 1: What is data science? ────────────────────
DATA_SCIENCE_W1 = {
    "number": 1,
    "title": "What data science actually is",
    "phase": "Foundations",
    "commitment_hours": "5–8",
    "context": "Data science is detective work: messy data goes in, clear answers come out. This week you set up your tools, get your hands on real data, and answer your first question with code.",
    "days": [
        day(1, "What does a data scientist do?", [
            video("Data Science in 100 seconds", "https://www.youtube.com/watch?v=X3paOmcrTjQ", 2, "Fireship", "Fast, accurate"),
            video("A day in the life of a data scientist", "https://www.youtube.com/results?search_query=day+in+the+life+data+scientist+real+job", 10, "Tina Huang", "The real job, not the hype"),
            reflection("What question do YOU want data to answer?", "Doesn't have to be deep. 'Do I sleep more on weekends?' counts. Write yours down."),
        ], summary="See the field clearly"),
        day(2, "Install Anaconda + open Jupyter", [
            video("Install Anaconda for data science", "https://www.youtube.com/results?search_query=install+anaconda+beginner+2026", 8, "Programming with Mosh", "One install, everything you need"),
            exercise("Your first cell", "Launch Jupyter Notebook. New Python 3 notebook. Type `import pandas as pd; print(pd.__version__)`. Shift+Enter."),
        ], summary="Your data lab, ready"),
        day(3, "Pandas — the spreadsheet on steroids", [
            video("Pandas in 10 minutes", "https://www.youtube.com/watch?v=tRKeLrwfUgU", 10, "Keith Galli", "Reading + exploring data"),
            exercise("Load a real dataset", "Download a CSV (Kaggle has thousands free). Use `pd.read_csv()`. Run `.head()`, `.info()`, `.describe()`. You're looking at real data."),
        ], summary="Real data, in your hands"),
        day(4, "Your first chart", [
            video("Matplotlib in 15 minutes", "https://www.youtube.com/results?search_query=matplotlib+for+beginners+15+minutes", 15, "Corey Schafer", "Bar, line, scatter — the basics"),
            exercise("Plot something interesting", "Find one column in your dataset worth plotting. Make a chart. Save it as PNG."),
        ], summary="See your data, not just read it"),
        day(5, "Answer your question with code", [
            video("Data analysis with pandas — solve a problem", "https://www.youtube.com/results?search_query=pandas+data+analysis+real+world+example", 20, "Keith Galli", "End-to-end mini-investigation"),
            exercise("Answer your day-1 question", "Use pandas + matplotlib to answer the question you wrote down on day 1. The answer doesn't have to be deep. The process is the point."),
        ], summary="From question to answer, with code"),
        day(6, "Polish the notebook", [
            exercise("Add markdown narration", "Between every code cell, add a markdown cell explaining what you're about to do. Your future self should understand the notebook in 6 months."),
            video("Notebook best practices", "https://www.youtube.com/results?search_query=jupyter+notebook+best+practices+beginner", 10, "Sentdex", "Make it readable"),
        ], summary="A notebook tells a story"),
        day(7, "Ship + reflect", [
            exercise("Push to GitHub", "Make a repo `week-1-ds`. Include the notebook, the CSV, a README. GitHub renders notebooks beautifully — visit your repo to confirm."),
            reflection("What did the data tell you that you didn't expect?", "Surprise is the best signal in data science. Note one surprise."),
        ], summary="Your first public DS artifact"),
    ],
    "topics": ["What data science actually is", "Anaconda + Jupyter setup", "pandas basics", "Loading CSVs", "First chart with matplotlib", "Answering a question with code", "Telling a story in a notebook"],
    "tasks": ["Install Anaconda", "Open Jupyter Notebook", "Download a CSV from Kaggle", "Load it with pandas", "Make your first chart", "Answer your day-1 question", "Push to GitHub"],
    "project": "A Jupyter notebook that loads a real dataset, asks a clear question in markdown, answers it with pandas + matplotlib, ends with a 'what I learned' cell. Pushed to GitHub.",
    "resources": [
        {"label": "Fireship — Data Science in 100s", "url": "https://www.youtube.com/watch?v=X3paOmcrTjQ", "note": "YouTube · 2 min"},
        {"label": "Keith Galli — Pandas in 10 min", "url": "https://www.youtube.com/watch?v=tRKeLrwfUgU", "note": "YouTube · 10 min · canonical"},
        {"label": "Corey Schafer — Matplotlib for beginners", "url": "https://www.youtube.com/c/Coreyms", "note": "Channel · cleanest tutorials"},
        {"label": "Kaggle — Find a dataset", "url": "https://www.kaggle.com/datasets", "note": "Thousands of real datasets, free"},
        {"label": "pandas docs — Getting Started", "url": "https://pandas.pydata.org/docs/getting_started/index.html", "note": "Official reference"},
    ],
    "questions": [
        "What was the messiest thing about your dataset? (missing values? weird dates?)",
        "Did the chart reveal something the numbers alone didn't?",
        "What's a follow-up question your data CANNOT answer? Why?",
        "Why is markdown narration in a notebook so important for data science work?",
    ],
    "exercises": [
        "Use `.value_counts()` on a categorical column — what's the most common value?",
        "Use `.groupby()` to find the average of one column grouped by another",
        "Try a different chart type (boxplot, histogram) — pick the one that best fits your data",
        "Add a markdown title + author + date at the top of your notebook",
    ],
    "outputs": ["Anaconda + Jupyter working", "A notebook that answers a real question on real data", "Public GitHub repo", "A reflection on what surprised you"],
}


# ── DATA ANALYSIS — Week 1: Excel-first, then SQL ───────────────────
DATA_ANALYSIS_W1 = {
    "number": 1,
    "title": "Excel, like a real analyst",
    "phase": "Foundations",
    "commitment_hours": "5–8",
    "context": "Before SQL, before Python — every analyst lives in Excel. This week you'll go from blank spreadsheet to building a pivot table that answers a real business question.",
    "days": [
        day(1, "What is data analysis?", [
            video("Data Analyst vs Data Scientist — what's the difference", "https://www.youtube.com/results?search_query=data+analyst+vs+data+scientist+real+job", 8, "Tina Huang", "Honest take, not hype"),
            reflection("Pick a real-world problem that data could solve", "Examples: 'Which day of the week does my company sell the most?' 'Which products have the best margin?' Write yours."),
        ], summary="See the field"),
        day(2, "Excel basics — beyond what you know", [
            video("Excel for Analysts — top 10 functions", "https://www.youtube.com/results?search_query=excel+top+10+functions+for+data+analyst+beginner", 18, "Leila Gharani", "SUM, IF, VLOOKUP, COUNTIF — the daily 10"),
            exercise("Practice the 10", "Open Excel. Type 10 numbers in column A. Use SUM, AVERAGE, MAX, MIN, COUNT, COUNTIF, SUMIF, IF, VLOOKUP, ROUND. Each one on a separate row."),
        ], summary="Mastery starts with the basics"),
        day(3, "Sort + filter — find the signal", [
            video("Excel sorting + filtering for beginners", "https://www.youtube.com/results?search_query=excel+sort+and+filter+beginner+2026", 12, "Kevin Stratvert", "The fastest way to find what matters"),
            exercise("Sort + filter a real dataset", "Download a sample sales CSV from Kaggle. Open in Excel. Sort by date. Filter to last year. Filter to one product category. Note 1 insight."),
        ], summary="Today you find signal in noise"),
        day(4, "Pivot tables — your superpower", [
            video("Pivot tables in 15 minutes", "https://www.youtube.com/watch?v=qHc1mw3hi5I", 15, "Leila Gharani", "If you only learn one Excel thing, learn this"),
            exercise("Build your first pivot table", "Same sales data. Insert pivot table. Drag Category to rows, Sales to values. You just summarised thousands of rows in 5 seconds."),
        ], summary="The 5-second analyst"),
        day(5, "Charts that tell a story", [
            video("Excel charts for beginners — which to pick when", "https://www.youtube.com/results?search_query=excel+charts+which+to+pick+for+data+visualization", 15, "Leila Gharani", "Bar vs line vs pie — when each works"),
            exercise("Chart from your pivot", "Right-click pivot → insert chart. Pick a chart type that ANSWERS your day-1 question. Polish: title, axis labels, no chart junk."),
        ], summary="Visual answers"),
        day(6, "Build a one-page dashboard", [
            video("Excel dashboard for absolute beginners", "https://www.youtube.com/results?search_query=excel+simple+dashboard+beginner+2026", 25, "MyOnlineTrainingHub", "From data → polished dashboard"),
            exercise("Build YOUR dashboard", "One sheet. 3 KPIs at the top. 2 charts. 1 filterable pivot. Answers your day-1 question. Looks polished — like something you'd email a boss."),
        ], summary="A real deliverable"),
        day(7, "Ship + reflect", [
            exercise("Push to GitHub", "Save your dashboard as `.xlsx`. Make a repo `week-1-data-analysis`. Push the file + screenshots + a README explaining what the dashboard answers."),
            reflection("What's the 1 insight your dashboard shows?", "If your boss had 30 seconds, what's the headline?"),
        ], summary="First analyst artifact"),
    ],
    "topics": ["What data analysts do", "Excel top 10 functions", "Sorting + filtering", "Pivot tables", "Excel charts", "Building a one-page dashboard"],
    "tasks": ["Install Excel (or Google Sheets free)", "Practice the top 10 functions", "Load a sample sales CSV", "Build a pivot table", "Create a polished chart", "Combine into a one-page dashboard", "Push to GitHub"],
    "project": "A one-page Excel dashboard answering one clear business question. 3 KPIs + 2 charts + 1 pivot. Pushed to GitHub with screenshots.",
    "resources": [
        {"label": "Leila Gharani YouTube", "url": "https://www.youtube.com/c/LeilaGharani", "note": "The best Excel teacher on YouTube — full stop"},
        {"label": "Kevin Stratvert YouTube", "url": "https://www.youtube.com/c/KevinStratvert", "note": "Step-by-step, no rush"},
        {"label": "MyOnlineTrainingHub", "url": "https://www.myonlinetraininghub.com/", "note": "Free written tutorials when video is too slow"},
        {"label": "Kaggle — Find a dataset", "url": "https://www.kaggle.com/datasets", "note": "Thousands of real datasets free"},
        {"label": "Excel official documentation", "url": "https://support.microsoft.com/excel", "note": "Reference"},
    ],
    "questions": [
        "What insight did your pivot table reveal that you couldn't see in the raw rows?",
        "Which chart type best answered your day-1 question? Why?",
        "If you had to make this dashboard in PowerPoint instead, what would change?",
        "What's one Excel thing you wish you'd learned 5 years ago?",
    ],
    "exercises": [
        "Use VLOOKUP to join two sheets together",
        "Use conditional formatting to highlight the top 10% values",
        "Use SUMIFS to compute 'total sales last quarter for category X'",
        "Make the dashboard interactive: a dropdown that filters all charts",
    ],
    "outputs": ["Working Excel install", "A polished `.xlsx` dashboard", "Public GitHub repo with file + screenshots", "Reflection on the insight you found"],
}


# ── BI ANALYTICS — Week 1: Excel-first, dashboards mindset ──────────
BI_ANALYTICS_W1 = {
    "number": 1,
    "title": "Excel — the BI analyst's foundation",
    "phase": "Foundations",
    "commitment_hours": "5–8",
    "context": "BI analysts live in dashboards. Before Power BI, before Tableau, you need to master Excel. This week you build a real one-page dashboard from scratch.",
    "days": [
        day(1, "What does a BI analyst do?", [
            video("What is Business Intelligence in 8 minutes", "https://www.youtube.com/results?search_query=what+is+business+intelligence+beginner", 8, "Alex The Analyst", "Honest take on the role"),
            reflection("A decision you'd make differently with data", "Big or small. Personal or work. Pick one. The whole job is making those decisions data-driven."),
        ], summary="See the role clearly"),
        day(2, "Excel — go pro", [
            video("Top 10 Excel formulas every BI analyst knows", "https://www.youtube.com/results?search_query=excel+formulas+for+bi+analyst+beginner", 18, "Leila Gharani", "VLOOKUP, INDEX/MATCH, SUMIFS, COUNTIFS"),
            exercise("Practice the 10", "Sample sales CSV (Kaggle). Build 10 formulas across rows that answer 10 different questions."),
        ], summary="Foundation locked"),
        day(3, "Pivot tables — your daily tool", [
            video("Pivot tables in 15 min", "https://www.youtube.com/watch?v=qHc1mw3hi5I", 15, "Leila Gharani", "The single highest-leverage Excel skill"),
            exercise("Three pivots", "Sales by region. Sales by month. Sales by product category × region. Three pivots in 30 minutes."),
        ], summary="The 5-second analyst"),
        day(4, "Slicers — make pivots interactive", [
            video("Excel slicers tutorial", "https://www.youtube.com/results?search_query=excel+slicers+pivot+tables+beginner", 10, "Kevin Stratvert", "Click-to-filter dashboards"),
            exercise("Add slicers", "Take yesterday's pivots. Add slicers for Region, Year, Category. Click around. Watch the data filter."),
        ], summary="It feels alive"),
        day(5, "Charts that don't suck", [
            video("Chart design for analysts — the principles", "https://www.youtube.com/results?search_query=excel+chart+design+best+practices+beginner", 15, "Leila Gharani", "Pick the right chart, avoid junk"),
            exercise("Polish your charts", "From yesterday's pivots, make 2 charts. Strip every unnecessary line, gradient, and label. Clean."),
        ], summary="Less is more"),
        day(6, "Assemble: one-page dashboard", [
            video("Excel dashboard end-to-end", "https://www.youtube.com/results?search_query=excel+dashboard+for+beginners+sales+2026", 25, "MyOnlineTrainingHub", "Step-by-step build"),
            exercise("Your first dashboard", "One sheet. 4 KPI tiles at top. 2 charts. 2 slicers. Looks like something on a CEO's monitor."),
        ], summary="A real deliverable"),
        day(7, "Ship + reflect", [
            exercise("Push to GitHub", "Repo `week-1-bi`. Push the `.xlsx` + screenshots + README explaining the dashboard's audience + question."),
            reflection("Your headline insight in 1 sentence", "If your CEO had 10 seconds — what's the one thing your dashboard says?"),
        ], summary="First BI artifact"),
    ],
    "topics": ["What BI analysts do", "Excel formulas for BI", "Pivot tables", "Slicers", "Chart design", "One-page dashboard structure"],
    "tasks": ["Install Excel", "Master 10 BI formulas", "Build 3 pivot tables", "Add slicers", "Polish charts", "Combine into a one-page dashboard", "Push to GitHub"],
    "project": "A polished one-page sales dashboard in Excel. 4 KPIs + 2 charts + 2 slicers. Answers ONE clear business question. Pushed to GitHub.",
    "resources": [
        {"label": "Leila Gharani YouTube", "url": "https://www.youtube.com/c/LeilaGharani", "note": "Best Excel teacher on YouTube"},
        {"label": "Alex The Analyst", "url": "https://www.youtube.com/c/AlexTheAnalyst", "note": "Career-focused, BI-specific"},
        {"label": "Kevin Stratvert", "url": "https://www.youtube.com/c/KevinStratvert", "note": "Slow, careful, beginner-safe"},
        {"label": "Kaggle Datasets", "url": "https://www.kaggle.com/datasets", "note": "Thousands of real datasets free"},
        {"label": "Excel official docs", "url": "https://support.microsoft.com/excel", "note": "Reference"},
    ],
    "questions": [
        "Slicers make the data feel interactive. Why is that so much more powerful than static reports?",
        "What chart did you delete because it added noise? Why was that the right call?",
        "Who is your dashboard's audience? CFO? Marketing manager? Ops lead? Same data, different framing.",
        "What's the next dashboard you'd build for yourself if you had infinite time?",
    ],
    "exercises": [
        "Use INDEX/MATCH instead of VLOOKUP — which feels cleaner?",
        "Add a sparkline (tiny inline chart) to each KPI tile",
        "Make the dashboard work on a phone-sized screen",
        "Add a 'last updated' date that auto-fills with TODAY()",
    ],
    "outputs": ["Working Excel install", "A polished one-page dashboard", "Public GitHub repo", "Reflection on the insight you found"],
}


# ── Apply ───────────────────────────────────────────────────────────
NEW_WEEK1 = {
    "ai-engineering": AI_ENGINEERING_W1,
    "ml-engineering": ML_ENGINEERING_W1,
    "full-stack-web": FULL_STACK_W1,
    "mobile-engineering": MOBILE_W1,
    "devops-cloud": DEVOPS_W1,
    "cybersecurity": CYBERSEC_W1,
    "data-science": DATA_SCIENCE_W1,
    "data-analysis": DATA_ANALYSIS_W1,
    "bi-analytics": BI_ANALYTICS_W1,
}


def main():
    for slug, new_w1 in NEW_WEEK1.items():
        f = ROADMAPS_DIR / f"{slug}.json"
        if not f.exists():
            print(f"skip {slug}: not found")
            continue
        data = json.loads(f.read_text(encoding="utf-8"))
        # Replace week 1
        replaced = False
        for i, w in enumerate(data.get("weeks", [])):
            if w.get("number") == 1:
                data["weeks"][i] = new_w1
                replaced = True
                break
        if not replaced:
            data.setdefault("weeks", []).insert(0, new_w1)
        f.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"  -> {slug}: week 1 rewritten ({len(new_w1['days'])} days)")


if __name__ == "__main__":
    main()
