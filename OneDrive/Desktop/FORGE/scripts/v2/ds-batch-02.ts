/**
 * v2 rewrite batch 2: data-science Weeks 8-12
 *  W8:  Web scraping toolkit
 *  W9:  TaxiPulse v0.5 — Streamlit explorer
 *  W10: TaxiPulse v1.0 — Ship + retro
 *  W11: AI-Augmented DS workflow + Prompt Engineering
 *  W12: Project 2 — Reddit Sentiment v0.1
 */

import { rewriteWeek } from "../rewrite-week";

// ─── W8 ────────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 8, {
  context: `For seven weeks you have worked with data someone else collected. The NYC TLC publishes it as parquet files, you download it, you analyse it. That is most of data science — but it is not all of it. Sometimes the question you want to answer requires data that nobody has packaged up for you, and the only place it exists is on a website. Web scraping is the bridge.

This week you build a scraper toolkit. Three tools, in increasing order of complexity: BeautifulSoup for plain HTML pages where the data is in the source you see when you "view source." Selenium for pages that load their content with JavaScript after the page loads (most modern sites, sadly). And Scrapy for when you need to scrape millions of pages with proper rate limiting, retry logic, and politeness baked in.

Target: Hacker News. Specifically, the front page. By Friday you will have 1000 HN post titles scraped, cleaned, and saved to a JSONL file. This becomes the raw material for next week's NLP work — you will train a sentiment classifier on real text from real people on the actual internet.

One serious thing before we start. Web scraping is technically legal in most jurisdictions when done on public data, BUT — and this is a real but — it can violate a site's terms of service, hit their servers too hard, or scrape private user data you should not touch. Three rules I want you to follow all week: respect robots.txt (the file at site.com/robots.txt tells you what you may scrape), rate-limit yourself to 1 request per second (be a polite citizen, not a denial-of-service attack), and use a User-Agent string that identifies you (so if a site admin sees the traffic they can email you instead of just blocking your IP). HN is fine to scrape; please do not graduate from this week and immediately go scrape LinkedIn (their TOS is explicit and their lawyers are well funded).`,

  pre_flight: `Open Hacker News in your browser. Right-click the page and choose "View Source." Look at the raw HTML — find one post title in the source code and notice the surrounding HTML structure (it is wrapped in <span class="titleline">). Now open DevTools and look at the same title in the Elements panel. Compare the two views. Are they identical, or did the page load any content with JavaScript? This 30-second check is what determines whether you need BeautifulSoup (HTML matches source) or Selenium (page modifies itself after load). The check itself is a skill — do it on every site before scraping.`,

  mastery_questions: [
    `Open Hacker News robots.txt at https://news.ycombinator.com/robots.txt. Paste what you see. What does the Crawl-Delay directive mean and what value does HN set? Now write that into your scraper as a time.sleep() between requests. That single line is the difference between a scraper and a polite scraper.`,
    `Write a BeautifulSoup script that fetches the HN front page, parses out the post titles and URLs, and prints them. Paste the script. How many posts did you get? (Should be 30 — HN shows 30 per page.) What CSS selector did you use to find them? The CSS-selector-as-API mindset is what makes scraping feel less like magic.`,
    `Modify the scraper to paginate: page 1 (current 30), page 2 (older 30), page 3 (older still). Get 1000 total posts. Paste the line that handles pagination (HN URLs use ?p=1, ?p=2, etc.). Now save the results to a JSONL file — one JSON object per line. Why JSONL instead of one big JSON array? (Streaming: you can append to it without rewriting the whole file, and tools like jq can process it line by line.)`,
    `Write a deliberately bad scraper that fires 100 requests with no delay. Watch what happens. Did HN start returning 429 errors (rate limit) or 503 (service unavailable)? Now fix it by adding time.sleep(1). The lesson: every site has a rate limit. Even when there is no documented limit, there is an undocumented one. Be the kind of scraper that does not need to find out where it is.`,
    `Pick ONE post from your scraped data and write 2-3 sentences predicting what its sentiment will be (positive, negative, neutral) when you run it through a model next week. We will check on Tuesday of next week whether your intuition matches the model. This is how analysts develop calibration — by predicting first and being honest about misses.`,
  ],

  common_mistakes: [
    `Hardcoding the CSS selector and then watching it break when the site redesigns next month. Modern sites change. Always write scrapers with one or two fallback selectors and log a warning when neither matches — silent breakage is the worst kind.`,
    `Forgetting to set a User-Agent header. The default Python requests User-Agent is "python-requests/2.31.0" which screams "bot" and gets you blocked instantly. Set something like "Mozilla/5.0 ... YourName (your@email.com)" — identifies you as a researcher being polite.`,
    `Scraping a JavaScript-rendered site with BeautifulSoup and getting empty results, then assuming your CSS selector is wrong. The selector is fine. The HTML you downloaded does not contain the data yet — JS adds it after page load. Switch to Selenium or Playwright.`,
    `Saving scraped data as a Python pickle and then realising six months later you have no idea what the columns mean. Use JSONL or CSV with a header row. Future-you will thank present-you.`,
    `Treating scraping as a one-shot job. Scrapers break — the website changes, your IP gets blocked, your network drops. Build retry logic and SAVE PROGRESS so a crash on page 47 does not force you to restart from page 1.`,
  ],

  debug_help: `Scraping bugs are usually one of three shapes. Shape 1: "I get empty results." Either the selector is wrong (open DevTools, check) or the content is JS-loaded (try printing response.text and searching for the data — if it is not there, you need Selenium). Shape 2: "I get blocked / rate-limited / 403." Slow down (longer sleep), add a User-Agent, consider whether you are scraping faster than a human could click. Shape 3: "It worked yesterday, breaks today." The site redesigned. Open it in a browser, view source, find the new selector. Most scrapers need a monthly tune-up — budget for it. When you get truly stuck, paste the URL and your code into Claude and ask "what CSS selector finds the post titles in this HTML structure?" — that targeted use saves an hour of selector hunting.`,

  ai_assist: `Ask Claude to look at HTML source and write the CSS selector for you — that is exactly the kind of pattern-matching it is good at. Paste 200 lines of HTML and ask "what selector targets the post titles?" Do NOT ask Claude to "build me a scraper" — you will get something generic that does not handle the site's quirks. Build it yourself in 30 lines, then ask Claude "what is one edge case my scraper does not handle?" The third move: when you finish the week, paste your scraper into Claude and ask "are there any politeness or ethics issues with this scraper?" That habit catches the rate-limit bug 90% of the time.`,

  stretch: [
    `Build the same scraper in Scrapy instead of BeautifulSoup. Scrapy is overkill for HN but it is the industry tool for large-scale scraping — concurrency, rate limiting, retry logic all built in. One day of Scrapy on a toy project saves you a week of pain when you need it for real.`,
    `Scrape comments too, not just titles. Each HN post has a comments thread; the URL is /item?id=XXXX. Top-N comments per post. This is your first taste of nested scraping — the data structure becomes hierarchical, not flat.`,
    `Set up a daily cron job (GitHub Actions free tier works) that scrapes HN's front page once per day and commits the JSONL to your repo. Six months from now you will have a longitudinal dataset of what HN cared about over time. That kind of dataset does not exist anywhere else.`,
  ],
});

// ─── W9 ────────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 9, {
  context: `A notebook is for you. A dashboard is for everyone else. Your TaxiPulse work has lived inside Jupyter for eight weeks — which is fine for analysis, but invisible to anyone who does not know how to open a notebook. This week you turn it into an interactive web app that a non-technical person can use without ever seeing your code.

Streamlit is the tool. It is genuinely magical the first time you see it: you write a Python file, you call st.line_chart(my_dataframe), and a real interactive chart appears in a browser. No HTML, no CSS, no JavaScript. Just Python. Streamlit is what every data scientist reaches for when they need to ship something interactive in an afternoon — internal tools, model demos, exploratory dashboards. It is not the right tool for a customer-facing product (use React for that), but for the "I need to put this in front of stakeholders by Friday" problem, nothing is faster.

By Sunday, TaxiPulse v0.5 will be a live Streamlit Cloud URL with: a sidebar where users select a borough and an hour range, a live-updating chart that responds to their choices, a "predicted fare" calculator that uses your model from week 5, and the per-borough Q4 trend chart from week 3. Anyone with the link will be able to play with your data.

One real-world note: this is the kind of week where a senior analyst at a company gets pulled in for "can you build me a quick dashboard?" — and the person asking has no idea they could do it themselves with Streamlit in two hours. After this week, you can too. That is a real superpower for the rest of your career.`,

  pre_flight: `Open the Streamlit gallery (streamlit.io/gallery). Spend 5 minutes clicking around 3-5 apps. Pick the one you find most useful and write down ONE design choice the author made that you want to copy. (Sidebar layout? Use of st.metric? A specific chart type?) Borrowing taste from existing good work is how design skill grows — much faster than inventing from scratch.`,

  mastery_questions: [
    `Write the shortest possible Streamlit app that loads a small CSV and shows it as a table. Three lines (import streamlit, read_csv, st.dataframe). Run it locally with streamlit run app.py. Paste the URL it gives you. Open it. You just made a web app in 3 lines of code. Sit with that for a moment.`,
    `Add a sidebar with st.sidebar.selectbox('Borough', ['Manhattan', 'Brooklyn', ...]). Use the selected value to filter your dataframe before displaying it. Paste the code. Reload the app and change the selectbox. The page should update instantly. That reactivity-for-free is what makes Streamlit feel like magic.`,
    `Add a st.metric('Avg fare', f'\${avg:.2f}') at the top showing the average fare for the currently-selected borough. Paste the line. Compare two boroughs side by side using three columns: col1, col2, col3 = st.columns(3) and put a metric in each. That layout pattern is what every executive dashboard you will ever see is built from.`,
    `Load your model from week 5 (joblib.load) and add a "predict a fare" section where the user enters distance/duration/hour and gets back a prediction. Paste the prediction section. This is the bridge between your ML model and a non-technical user — they cannot install Python or read a Jupyter notebook, but they can use a web app.`,
    `Deploy to Streamlit Cloud (free, connects to GitHub). Paste the live URL. Open it on your phone. Does it work on mobile? (Probably mostly yes — Streamlit handles responsive layout decently.) Now share the URL with one non-technical friend or family member and ask them to use it without explanation. Watch where they hesitate. Their confusion is the most valuable feedback you will get this month.`,
  ],

  common_mistakes: [
    `Loading the full 3.5M-row dataframe at the top of the script. Streamlit re-runs the whole script on every interaction — every time the user moves a slider, your app reloads 3.5M rows. Use @st.cache_data on your data-loading function so it loads once and stays cached.`,
    `Putting a parquet file >100MB into a GitHub repo for Streamlit Cloud to find. GitHub has a 100MB file limit and Streamlit Cloud has limited disk space. Sample your data first — 10,000 rows is plenty for a demo. Save the sampled version to a smaller file.`,
    `Forgetting requirements.txt. Streamlit Cloud installs from it; if you forget xgboost is in there, the app errors on import. pip freeze > requirements.txt before every push.`,
    `Hard-coding paths like /Users/yourname/file.csv. Use relative paths and put data files inside your repo (or load from a URL).`,
    `Designing the app for yourself instead of for the user. You know what every chart means. The user does not. Add a one-sentence explanation under each chart. Most "this app is confusing" feedback comes from missing labels.`,
  ],

  debug_help: `Streamlit's main failure mode is "the app loads but nothing updates when I change a control." That is usually a caching bug — you cached a function whose output should depend on a user input. Remove @st.cache_data temporarily, see if the bug goes away, then add caching back only on functions whose output truly does not depend on inputs (like loading the raw data). Second common bug: import errors on deploy. Always check Streamlit Cloud's logs (there's a "manage app" button) — the error is usually visible there. Third: the app is slow because every interaction re-runs the whole script. Cache aggressively, especially data loading and model inference.`,

  ai_assist: `Streamlit's documentation is excellent — but the SHAPE of the question matters. Instead of "build me a Streamlit dashboard for taxi data," ask Claude "what is the cleanest way to add a multi-select filter in Streamlit that updates a chart?" Specific questions get specific answers; vague questions get tutorials you have to wade through. When you deploy and something breaks, paste the full Streamlit Cloud error log into Claude AND your requirements.txt. The fix is almost always a missing package or a version pin issue, and Claude can spot it instantly.`,

  stretch: [
    `Add a download button (st.download_button) that lets users download the filtered data as a CSV. Real users always want this. Adding it shows you thought about them.`,
    `Add a map showing pickup density by location using st.map() or a folium chart. Maps are crowd-pleasers and Streamlit makes them trivial.`,
    `Look at three real production Streamlit apps from companies (you'll find them on the Streamlit blog) and write one paragraph in your notebook about what they did well. Studying good UI you cannot build yet is how you grow your design ceiling.`,
  ],
});

// ─── W10 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 10, {
  context: `Ten weeks ago you did not know how to load a CSV. This week you ship TaxiPulse v1.0 — three months of NYC taxi data, a fare-prediction model, a live API, a live Streamlit dashboard, and a notebook that reads like an article a human wrote (because one did, and that human is you).

This is a polish week. No new features. No new techniques. Just the unglamorous work of taking something that is 80% finished and pushing it to 100%. That last 20% is what separates a portfolio piece that gets you an interview from one that gets ignored.

Three jobs this week. First: rewrite the notebook so that someone who has never met you can read it top-to-bottom and understand what you did, why, and what you found. That means an intro paragraph at the top, headers between sections, a 2-3 line written interpretation under every chart, and a "what I would do next" section at the end. Second: ask one real human (not me, not Claude, not your roadmap mentor — a friend, a colleague, anyone) to read it and tell you where they got lost. Apply their feedback. Third: write a retrospective. What did you learn? What surprised you? What would you do differently? That document is more valuable than the notebook itself, and it is the one thing nobody else's portfolio has.

By Sunday, TaxiPulse v1.0 is the first piece of work you can put at the top of your resume. Not "TaxiPulse - in progress." Done. Shipped. Linkable. Defensible.`,

  pre_flight: `Open your TaxiPulse notebook RIGHT NOW and scroll through it as if you were a stranger seeing it for the first time. Be brutal. Where are you lost in your own work? Which charts have no caption? Where do you jump from one analysis to another with no transition? Make a list of every rough edge — that list is your week's to-do.`,

  mastery_questions: [
    `Add a one-paragraph intro at the top of the notebook. It should answer: what is this analysis about, what data did you use, and what is the single most important thing you found. Paste the paragraph. The intro is the only thing 80% of readers will see — make it carry the whole piece on its own if it has to.`,
    `Pick the three most important charts in your notebook. Under each one, write 2-3 sentences explaining (a) what the chart shows, (b) what the reader should notice, and (c) what it means in plain English. Paste the chart captions. Charts without captions assume the reader is psychic. Real reports never assume that.`,
    `Find one friend or colleague who does NOT know your project. Send them the notebook (or live Streamlit). Ask them to read for 10 minutes and then tell you ONE thing that confused them and ONE thing they liked. Paste their feedback verbatim. Then make at least one change based on it. The change is more important than the feedback — most analysts never close that loop.`,
    `Run %%time on your three slowest cells. Paste the timings. If any are over 30 seconds, profile them — use line_profiler or just print intermediate timings — and see if you can speed them up. Notebooks that take minutes to re-run kill iteration. Investing in your own iteration speed compounds for the rest of the project.`,
    `Write a 300-word retrospective at the BOTTOM of the notebook. Sections: "what I learned," "what surprised me," "what I would do differently with hindsight," "what I would explore next." Paste it. This is the section every hiring manager actually reads, because it shows you can think about your own work — which is exactly what they are hiring for.`,
  ],

  common_mistakes: [
    `Spending the week adding features instead of polishing. You will be tempted. Resist. The work is to make what exists better, not bigger.`,
    `Writing the retro for an imaginary perfect-version-of-you. ("I learned to be more systematic." Generic.) Write it for the actual messy person who did the actual work. ("I spent 2 days on a feature that did not improve the model — I should have tested it on a smaller subset first." Specific. Honest. Useful.)`,
    `Skipping the stranger-test step because it feels awkward. The 10 minutes of discomfort buys you a year of polished portfolio. Every senior analyst learned this through embarrassment.`,
    `Leaving commented-out code in the notebook from your debugging sessions. Delete it. A clean notebook reads ten times faster than a cluttered one.`,
    `Not adding an LICENSE and a CONTRIBUTING.md to the repo. They take 5 minutes. They signal professionalism. Use MIT license unless you have a reason not to.`,
  ],

  debug_help: `The "I cannot tell if this is good enough to ship" feeling is what most people get this week. The honest answer: if a stranger can read it and tell you back what you found, it is good enough. If they cannot, it is not. That is the only test that matters. Resist the urge to keep adding "one more chart." More charts almost always make a notebook worse, not better. The discipline of stopping is harder than the discipline of building.`,

  ai_assist: `Paste your full notebook into Claude and ask "if you were a hiring manager reading this for a junior data scientist role, what is the FIRST thing that would make you stop reading?" Then fix that thing. Iterate. Do this three times. By the third iteration, the notebook reads professionally. Do NOT ask Claude to rewrite the prose for you — your voice (slightly clumsy and human) is more trustworthy than Claude's voice (smooth and forgettable). Use Claude to spot weaknesses, not to write replacements.`,

  stretch: [
    `Record a 5-minute Loom video walking through your project. Post the link in the README. Most analysts do not do this. The ones who do get remembered.`,
    `Write a blog post version of the analysis — same findings, different format (more narrative, fewer code cells). Post it to dev.to or your own site. Cross-link from the README. Now you have two assets pointing at the same work.`,
    `Translate the retrospective into a LinkedIn post. Real, honest reflection on what you learned. Most people post triumphant "I just finished X!" energy — yours posts honest "here is what was hard about X" energy. The latter gets more interviews.`,
  ],
});

// ─── W11 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 11, {
  context: `Every week so far has had an "AI assist" section. This week, AI is the whole topic. You step back from the technical work and learn — deliberately, with structure — how to use AI as a multiplier on the work you have already been doing.

I want to be clear about the premise. AI is not going to replace data scientists. AI is going to replace data scientists who do not know how to use AI well. The people who learn to use Claude/ChatGPT/Cursor as a thinking partner are doing 2-3x the output of the people who treat it as an autocomplete or a search engine. That gap is widening every month. The goal this week is to make sure you are on the right side of it.

You will set up Cursor (the AI-first code editor) or GitHub Copilot. You will learn four prompt patterns that come up everywhere: role prompts ("you are a senior data scientist reviewing my code"), example prompts (give it 2-3 input/output pairs before asking), step-by-step prompts ("walk me through this query line by line"), and constraint prompts ("answer in 3 sentences, no code"). You will keep a personal cheatsheet (prompts.md in your repo) of the prompts that worked for you on the actual work you did weeks 1-10.

By Sunday, you will have a workflow you can defend. You will know when to use AI and when not to. You will have documented 5 prompts that genuinely sped you up and 2 cases where AI led you astray. That last part is the most important — knowing when AI is wrong is more valuable than knowing when it is right.`,

  pre_flight: `Look back over weeks 1-10. Identify the SINGLE moment where you got most stuck. Maybe a SQL query that took 2 hours. Maybe a deployment bug that ate a whole day. Write that moment down. By Sunday you will know exactly what prompt would have unstuck you in 5 minutes. The point is not to feel bad about it — it is to calibrate where AI actually helps so you reach for it next time.`,

  mastery_questions: [
    `Install Cursor or set up GitHub Copilot in VS Code. Open one of your TaxiPulse files. Make ONE edit using AI completion that you would have written yourself. Now try ONE edit you would NOT have known how to write. Paste both before/after diffs. Which felt more valuable? Both are useful — but the second one is where you grow.`,
    `Write a "role prompt" that asks Claude to act as a senior data scientist reviewing your TaxiPulse notebook. Paste the prompt. Paste the most useful piece of feedback it gave you. Now act on that feedback in your notebook. Paste the diff. That loop — review, feedback, change — is one of the highest-ROI uses of AI on personal projects.`,
    `Take a SQL query you struggled with last week (the top-N-per-group one, ideally) and write a "step-by-step" prompt asking Claude to explain it line by line. Paste the prompt and the explanation. Did anything in the explanation change your understanding of how the query works? That is what gold-standard learning with AI looks like.`,
    `Try this: give Claude an INTENTIONALLY misleading prompt about your data. Tell it "I have a column called 'price' in my taxi data" (you do not — it is fare_amount). Watch what it does. Does it hallucinate code referencing 'price', or does it push back and ask? Test 2-3 different leading prompts. Paste the results. AI confidently making things up when given bad input is the single biggest failure mode you need to recognise.`,
    `Build prompts.md in your repo. Five prompts that genuinely saved you time over the past 10 weeks (or this week), with one sentence explaining what each one is for. Plus TWO prompts that failed — where AI gave you confidently wrong answers — and what was wrong with the prompt. Paste the file. This becomes a real document you will add to for the rest of your career.`,
  ],

  common_mistakes: [
    `Copy-pasting AI output without reading it. The fastest way to spend 3 hours debugging code you do not understand. The rule: if you cannot explain every line, do not commit it.`,
    `Treating AI as a search engine for facts. AI confidently makes up function names, API endpoints, and library behaviour. Always verify against actual documentation when the answer matters.`,
    `Using AI for the easy parts (boilerplate) and not for the hard parts (architecture, debugging, code review). The leverage is exactly the other way around. Boilerplate you can write in 5 minutes; AI saves you 2. Code review you cannot do alone; AI gives you a second set of eyes for free.`,
    `Asking AI to write your retros and reflections. These are FOR YOU. The thinking is the value, and the thinking only happens if you do it. AI can polish your draft. It should not write your first draft.`,
    `Not keeping a prompt history. The good prompts you discover this month, you will forget by month three. Store them in prompts.md. Re-use them. Refine them. They are intellectual property.`,
  ],

  debug_help: `The trickiest AI failure to spot is the "confidently wrong" one — AI gives you working code that does the wrong thing. Defense: always cross-check AI's answers against either (a) the actual documentation, (b) a tiny test you write yourself, or (c) a second AI run with a different phrasing. When two different prompts disagree, you have just learned something — usually that the question is ambiguous or your data has a quirk AI cannot infer. The other common failure: AI confidently uses a library API that does not exist in the version you have installed. Always check that import statements actually work BEFORE building 100 lines on top of them.`,

  ai_assist: `This week IS the AI assist. But one meta-tip: keep a "prompt that did not work" log alongside "prompt that worked." You learn more from the failures. When a prompt fails, ask yourself: was the question vague? did I give it enough context? did I forget to mention a constraint? Refine and re-prompt. Two to three rounds of refinement gets you to a working prompt for almost any task.`,

  stretch: [
    `Use AI to translate a complex pandas chain into SQL, and vice versa. Doing this on real code (your own) is how bilingual fluency builds.`,
    `Set up an "AI code review" pre-commit hook that runs against your diff and surfaces issues before you commit. Several open-source tools exist (e.g., aider's review mode). Wiring this up once gives you a permanent quality gate.`,
    `Read Karpathy's "Software 2.0" essay and Simon Willison's blog on LLM use for data work. Write 2-3 sentences on what changed in your mental model. The senior people in this field write constantly — reading them is how you learn the taste they teach.`,
  ],
});

// ─── W12 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 12, {
  context: `Eleven weeks on numeric data. This week you start with text — the messy, unstructured, awkward kind of data that makes up 80% of the world's information. Customer support tickets. Product reviews. Social media posts. Job descriptions. Legal contracts. Every one of those is text, and every one of them has questions you can answer with the same techniques.

You are starting Project 2: Reddit Sentiment. By Sunday, you will have scraped 1000 posts from r/MachineLearning and labelled each one with a sentiment score (positive, negative, neutral) using a pretrained Hugging Face model. The deliverable is honest — it is just running someone else's model on someone else's data. But it is the foundation for the next 3 weeks: you will hand-label your own gold set, train a classical ML classifier (week 13), and finally fine-tune a real BERT model (week 15). By the end of Project 2 you will have done the full NLP arc — from "let AI do it" to "I trained the AI myself."

Two new things this week. First, the Reddit API (via PRAW, the Python wrapper). This involves getting API credentials, which means a real-world rite of passage: creating a Reddit developer app, storing secrets in a .env file, and never committing them to git. Second, Hugging Face — the GitHub of NLP models. You will use their pipeline API which lets you load a state-of-the-art sentiment model in 3 lines of code. Hugging Face is what every NLP team uses, period. Knowing it well is non-negotiable.`,

  pre_flight: `Before you scrape anything, browse r/MachineLearning manually for 5 minutes. Read 10 actual posts. For each, mentally classify it: positive, negative, or neutral. Write down: of the 10 you read, what was the split? (Probably mostly neutral — most posts are announcements or questions, not opinions.) That gut reading is your prior. When your model says 60% neutral, you should be able to nod and say "yeah, that matches what I saw." When it disagrees with your prior, that is where the interesting analysis starts.`,

  mastery_questions: [
    `Create a Reddit developer app (reddit.com/prefs/apps), get your client_id, client_secret, and user_agent. Save them in a .env file. Add .env to your .gitignore. Now load them with python-dotenv. Paste the load_dotenv() call AND the line of your .gitignore that protects them. Why is committing API keys to a public repo one of the worst things a junior engineer can do? (Search "GitHub secret scanning" for the answer — bots scan every public commit within seconds and your AWS key gets used to mine crypto on your dime.)`,
    `Use PRAW to scrape 1000 posts from r/MachineLearning (top of all time, or recent — your choice). Save title, selftext, score, num_comments, created_utc to a JSONL file. Paste the head of one record. Why JSONL not CSV for text data? (Because post bodies contain commas, newlines, and quotes — CSV escaping is fragile for prose.)`,
    `Load the Hugging Face sentiment pipeline: from transformers import pipeline; clf = pipeline('sentiment-analysis'). Run it on three of your scraped posts. Paste the inputs and outputs. Does the model's confidence make sense to you? (A confident "POSITIVE 0.99" on an announcement post should make you suspicious — most announcements are not strongly positive, the model is over-fitting to surface words.)`,
    `Run the model on all 1000 posts (batch it — don't loop one-at-a-time, that's slow). Paste the time it took. Now compute the distribution: what percentage came out positive, negative, neutral? Compare to your pre-flight prediction. If they disagree, the disagreement is the start of next week's hand-labelling exercise — you will find out who is right (you or the model).`,
    `Pick 10 posts the model labelled with high confidence (>0.95). Read them yourself. Do you agree with all 10 of the model's labels? Paste any disagreements. Pretrained models trained on generic data (movie reviews, tweets) often miss domain context — "this paper is a disaster" might be sarcasm-loving ML Twitter rather than genuinely negative. Spotting this gap is the entire reason you will hand-label next week.`,
  ],

  common_mistakes: [
    `Hitting the Reddit API without authenticating and getting 401 errors. PRAW requires real OAuth setup; do not skip it.`,
    `Committing your .env file to git on commit one. Add .env to .gitignore BEFORE you create the .env file. If you slip up, GitHub-secret-scan finds it in minutes and the credentials are compromised — rotate them immediately.`,
    `Running the Hugging Face pipeline one input at a time in a Python loop. It is 50x slower than passing the whole list at once. The model batches automatically when you pass a list.`,
    `Confusing model confidence (the 0.99 number) with model correctness. High confidence is NOT the same as right. A model can be confidently wrong; the confidence calibration is itself a thing you measure.`,
    `Using the wrong model for the domain. The default Hugging Face sentiment pipeline is trained on movie reviews. For technical posts, you get noisy results. Knowing this is the start of "do I fine-tune?" — which is exactly where this project goes in week 15.`,
  ],

  debug_help: `Two pain points this week. First: Reddit API rate limits. PRAW handles them mostly, but if you hammer the API you get banned for 10 minutes. Add small sleeps between large scrapes. Second: the Hugging Face model can fail on extremely long posts (some posts on r/ML are 5000-word essays). The pretrained sentiment models have a 512-token limit. The fix: truncate the text before passing it in, OR use a long-context model. When you see "Token indices sequence length is longer than the specified maximum sequence length," that is the bug — add truncation=True to the pipeline call.`,

  ai_assist: `Ask Claude to compare 2-3 different sentiment models from Hugging Face and recommend one for technical-domain text. (Hint: there are models fine-tuned on Reddit specifically.) Use Claude to write the regex that strips Reddit markup (links, formatting characters) from post text — that is exactly the kind of small task Claude is excellent at. Do NOT ask Claude to interpret your sentiment distribution for you — that interpretation is the analysis, and you have to do it.`,

  stretch: [
    `Scrape comments too, not just posts. Comment sentiment is often more interesting than post sentiment.`,
    `Compare the sentiment distribution from r/MachineLearning to r/MachineLearningJobs or r/datascience. Different subreddits, different sentiment profiles. That comparison itself is a small piece of analysis.`,
    `Try a second sentiment model (siebert/sentiment-roberta-large-english) and see if it agrees with the default model. Disagreement between two models on the same post is a strong signal that the post is ambiguous — exactly the post you would hand-label most carefully.`,
  ],
});
