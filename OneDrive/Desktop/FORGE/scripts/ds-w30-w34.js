// Rebuild DS W30-W34 to the teach->swipe->project standard.
// W30 Capstone v1.0 ship + roadmap retro
// W31 Portfolio + interview prep
// W32 LLM fine-tuning with LoRA / PEFT
// W33 RAG systems
// W34 Computer Vision (CNN + ViT)
const fs = require('fs');
const FILE = 'C:/Users/Abdoulie Balisa/OneDrive/Desktop/FORGE/data/roadmaps/data-science.json';
const ds = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const L = (title, body) => ({ kind: 'lesson', title, body });
const V = (title, url, dm, creator, why) => ({ kind: 'video', title, url, duration_min: dm, creator, why });
const S = (cards) => ({ kind: 'swipe', title: 'Quick check — swipe to answer', cards });
const E = (title, body) => ({ kind: 'exercise', title, body });
const D = (number, title, summary, items) => ({ number, title, summary, items });

/* ════ W30 Capstone v1.0 Ship + retro ════ */
const W30 = {
  number: 30, title: "Capstone v1.0: Ship + roadmap done",
  phase: "Capstone", commitment_hours: "15-20",
  context: ds.weeks[29].context,
  concept_check: [
    { q: "Why ship the capstone the same way you shipped Energy Forecast (demo + blog + video + readers + retro)?",
      choices: ["Habit","The shipping ritual hardens the work, exposes blind spots through outside readers, and produces the public artifacts a recruiter can actually evaluate",
        "Tradition","More git commits"],
      correct: 1, explain: "Building the model is half the project. The other half is making it legible. Demo + blog + video + readers + retro is the proven loop that turns a notebook into something a recruiter can act on. Skipping it leaves the value invisible." },
    { q: "Why FIVE outside readers for the capstone post (vs three for previous projects)?",
      choices: ["Bigger projects need more eyes","Capstone is your portfolio's centerpiece — three is the floor for signal; five gives you confidence the post lands AND surfaces patterns three readers might miss",
        "Random","You'll ignore most of them"],
      correct: 1, explain: "Three readers gives signal but can be noisy. Five gives you stable consensus — if 4/5 stumble at the same paragraph, you know with high confidence. The capstone is the single project your portfolio leads with; one extra round of readers is cheap insurance." },
    { q: "The 'roadmap retro' is different from previous project retros because…",
      choices: ["It's longer","It looks back at 30 weeks of work — extracting durable lessons about the PROCESS that compound into your next year of growth, not just one project",
        "It's shorter","It's optional"],
      correct: 1, explain: "Project retros extract lessons about that project. The roadmap retro extracts lessons about HOW YOU WORK — which weeks felt high-leverage, which kinds of tasks slowed you down, what process patterns to keep and which to abandon. Those meta-lessons carry into every project after." }
  ],
  days: [
    D(1,"Build the demo","Streamlit app around the capstone-v0.2 model. Same shape as Energy Forecast W27.",[
      L("The capstone demo",
"## What it is\n" +
"A single-page Streamlit app around your frozen v0.2 model. Same shape as the Energy Forecast dashboard from W27, scaled to your capstone's specifics:\n\n" +
"- Loads the main model from disk (or S3 if you put it there in W26)\n" +
"- Takes user input that maps to your model's features (sliders, dropdowns, text)\n" +
"- Shows the prediction + uncertainty if applicable\n" +
"- Shows the components / explanation if the model supports it (SHAP, feature importance, attention)\n\n" +
"## The pattern\n" +
"```python\n" +
"import streamlit as st\n" +
"import joblib\n" +
"\n" +
"@st.cache_resource\n" +
"def get_model():\n" +
"    return joblib.load('models/main.pkl')\n" +
"\n" +
"st.title('<Your capstone>')\n" +
"st.write('<one-sentence what it does>')\n" +
"\n" +
"# Input widgets that map to your features\n" +
"feature_a = st.slider('Feature A', ...)\n" +
"feature_b = st.selectbox('Feature B', [...])\n" +
"\n" +
"model = get_model()\n" +
"if st.button('Predict'):\n" +
"    pred = model.predict([[feature_a, feature_b, ...]])\n" +
"    st.metric('Predicted', f'{pred[0]:.2f}')\n" +
"```\n\n" +
"## Why one page, not many\n" +
"For a portfolio demo with no real users, one page that does one thing well > five pages that each do something half. Reviewers see the working thing in 5 seconds; they don't navigate."
      ),
      V("Streamlit in 100 Seconds","https://www.youtube.com/watch?v=R2nr1uZ8ffc",2,"Fireship","Refresher on what Streamlit is and how fast it ships. Same tool as W27."),
      L("Polish that pays off",
"## Three small touches that make the demo feel finished\n" +
"\n" +
"### 1. A title and one-line description at the top\n" +
"Visitors land knowing what it does in 2 seconds. Don't make them read the blog post first.\n" +
"\n" +
"### 2. Sensible defaults on every input\n" +
"On first load the demo should already show A prediction. Empty defaults = blank screen = nobody clicks Predict.\n" +
"\n" +
"### 3. A link to the blog post and the GitHub repo\n" +
"In the sidebar or footer. The demo proves the model works; the post explains it; the repo lets them check your code. Three artifacts, three links, one journey."
      ),
      S([
        { prompt: "One-page Streamlit > five-page Streamlit for a capstone demo.", answer: true, whenRight: "Right — one focused page that works > a sprawl that loads slowly. Demo proves; depth lives in the repo.", whenWrong: "Yes — focus beats sprawl. One page that loads + works is more convincing than a museum of half-finished tabs." },
        { prompt: "@st.cache_resource on the model loader keeps the app fast across user interactions.", answer: true, whenRight: "Right — model loads once per session, not on every slider change.", whenWrong: "Yes — without it Streamlit reloads the model on every rerun. Cache once; serve fast." },
        { prompt: "A blank-by-default demo (no values until user clicks) is fine for a portfolio.", answer: false, whenRight: "Right — no. Sensible defaults so the demo SHOWS a prediction on first paint. Empty defaults discourage clicks.", whenWrong: "Defaults should produce a prediction. Visitors who land on an empty screen leave." }
      ]),
      E("Your turn — build it","[CODE] In `capstone/app/streamlit_app.py`:\n1. Load main.pkl with @st.cache_resource.\n2. Add input widgets for the features your model uses.\n3. Sensible defaults on every input.\n4. Show prediction + (if applicable) feature contributions.\n5. Link to blog (will exist Day 3) + GitHub repo in sidebar.\n6. `streamlit run capstone/app/streamlit_app.py` — confirm it works locally.")
    ]),
    D(2,"Deploy","Streamlit Community Cloud (free, no card). Public URL.",[
      L("Going live",
"## The path\n" +
"Same as W27:\n" +
"1. Push `capstone/app/` + `requirements.txt` to your GitHub repo.\n" +
"2. share.streamlit.io → New app → point at `capstone/app/streamlit_app.py`.\n" +
"3. Add secrets (AWS keys if loading model from S3, API keys if needed) in Streamlit's secrets UI.\n" +
"4. Deploy.\n\n" +
"## Test in incognito\n" +
"Open the public URL in an incognito window. No cookies, no cached creds. Confirm:\n" +
"- It loads in <10 seconds (cold start is OK)\n" +
"- Default values produce a prediction\n" +
"- Each input updates the prediction\n" +
"- Links to blog + repo work\n\n" +
"## Save the URL\n" +
"Paste it into the README + into `capstone/LINKS.md`. This is the link that goes into the blog post tomorrow and on your portfolio site next week."
      ),
      S([
        { prompt: "Streamlit Cloud needs a credit card to deploy a free portfolio demo.", answer: false, whenRight: "Right — no. Free tier, no card. Same as W27.", whenWrong: "Free, no card. Streamlit Community Cloud generously hosts learner / portfolio apps." },
        { prompt: "Testing the public URL in incognito mimics a recruiter's first experience.", answer: true, whenRight: "Right — cookies-clean, no auto-fill, no cache. That's the demo experience.", whenWrong: "Yes — incognito = reviewer's experience. If it works there, it works for anyone." },
        { prompt: "AWS keys go in `streamlit_app.py` for the deploy.", answer: false, whenRight: "Right — never. Streamlit's secrets UI; never in code.", whenWrong: "Never in code. Streamlit secrets store keeps the repo clean and rotation painless." }
      ]),
      E("Your turn — deploy","[PRODUCE] 1. Push capstone/app + requirements.txt to repo.\n2. share.streamlit.io → New app.\n3. Add secrets.\n4. Deploy. Wait for URL.\n5. Test in incognito. Save URL to capstone/LINKS.md.")
    ]),
    D(3,"Write the blog post","1,500 words. Same 10-part structure as Energy Forecast.",[
      L("The capstone blog",
"## What it is\n" +
"~1,500 words on dev.to. Same 10-part structure as W27. The capstone version IS the post recruiters land on — make it the clearest one you've written.\n\n" +
"## The structure (reuse from W27)\n" +
"```text\n" +
"1. Hook — one paragraph: the headline finding\n" +
"2. The question — why does anyone care\n" +
"3. The data — source, shape, why this is the right dataset\n" +
"4. EDA / discovery — the one surprise that shapes the rest\n" +
"5. Baseline — the bar to beat\n" +
"6. The main model — what you trained and why\n" +
"7. Iteration — what residuals taught you, which features moved the metric\n" +
"8. Final evaluation — headline metric + improvement % over baseline\n" +
"9. Live demo — link to the Streamlit URL\n" +
"10. What I'd do differently — 2-3 honest weaknesses\n" +
"```\n\n" +
"## Hook discipline\n" +
"Your opening paragraph is the entire post for 70% of readers. It must:\n" +
"- State the question in one sentence\n" +
"- State the answer (the result) in one sentence\n" +
"- Promise what the rest of the post explains\n\n" +
"NOT: 'In this exhaustive comparison I investigate…' YES: '<Question>. Turns out the answer is X with magnitude Y — here's why and how I built it.'"
      ),
      L("Reusable assets from the project",
"## What goes in the post directly\n" +
"- 1 EDA chart (the one that shows the surprise)\n" +
"- 1 baseline-vs-main comparison chart\n" +
"- 1 feature-importance or interpretability chart\n" +
"- 1 screenshot of the live demo\n\n" +
"## What goes in a snippet, NOT a screenshot\n" +
"- 1 short code snippet showing the model interface (≤10 lines)\n" +
"- Headline metrics in a markdown table\n" +
"\n" +
"## What stays in the repo (link only)\n" +
"- Full training notebook\n" +
"- Full cleaning logic\n" +
"- Any model alternatives you tried\n" +
"\n" +
"## Honest about scope\n" +
"In the 'what I'd do differently' section: name the features you wanted but couldn't get, the experiments you ran out of time for, the limitation of the test set. That credibility transfers to the rest of the post."
      ),
      S([
        { prompt: "The hook should state both the question AND the answer in the first paragraph.", answer: true, whenRight: "Right — 70% of readers leave after paragraph 1. Front-load the value.", whenWrong: "Yes — hook = question + answer. Readers who bounce get value; readers who stay want the how." },
        { prompt: "Putting limitations / weaknesses in the post makes it look weaker.", answer: false, whenRight: "Right — no. Named limitations build credibility. Unnamed ones get caught by reviewers and destroy it.", whenWrong: "Honesty hardens the post. Reviewers who spot un-named weaknesses lose all trust; named ones earn it." },
        { prompt: "Code snippets longer than 10 lines should still go in the post.", answer: false, whenRight: "Right — no. Long snippets break reading flow. Link to the GitHub file for the full thing.", whenWrong: "Long blocks break flow. Cap at 10 lines in-post; link to the full file in the repo." }
      ]),
      E("Your turn — write the post","[WRITE] 1. Open `capstone/docs/blog.md`.\n2. Follow the 10-part structure.\n3. Embed 4 reusable charts + 1 short code snippet.\n4. Include the live demo URL prominently.\n5. Publish on dev.to.\n6. Save published URL to LINKS.md.")
    ]),
    D(4,"Demo video","90 seconds. Read a script. Unlisted YouTube.",[
      L("The video",
"## What it is\n" +
"60-90 second screen recording. Script it. Read it. Don't iterate more than twice.\n\n" +
"## The capstone script\n" +
"```text\n" +
"[0:00-0:10]  'This is <project name>, a <what it does>. I built it from\n" +
"              <data source> over the last three weeks as my data-science\n" +
"              capstone.'\n" +
"[0:10-0:30]  Walk through the demo. Drag inputs. Show the prediction\n" +
"              respond. Point out the headline metric.\n" +
"[0:30-0:55]  Show ONE component / chart that explains the prediction.\n" +
"              'The model leans most heavily on X because Y.'\n" +
"[0:55-1:15]  Switch to the dev.to post. 'Full write-up here. Three weeks\n" +
"              of building; main result is <one number>.'\n" +
"[1:15-1:30]  Switch to the GitHub repo. 'Code, notebooks, blog, all here.'\n" +
"```\n\n" +
"## Upload + embed\n" +
"YouTube, Unlisted. Embed in dev.to post and link from the README.\n\n" +
"## Don't perfect it\n" +
"Two takes max. The video is a tool, not a film. A working 75% video that ships > a polished 95% video you keep promising yourself."
      ),
      S([
        { prompt: "Scripting the demo video before recording produces tighter takes than improvising.", answer: true, whenRight: "Right — short scripts = no rambling. Read it the first time; you're done.", whenWrong: "Yes — script first. Improvised demos meander and re-shoot. Script + one read = done." },
        { prompt: "More than three takes means the script is too long, not that you need more practice.", answer: true, whenRight: "Right — fix the script (cut), not the delivery. Three takes = script problem; 10 = script broken.", whenWrong: "Yes — if take #4 is needed, cut the script. Short scripts read clean first try." },
        { prompt: "Unlisted YouTube is enough for a portfolio video.", answer: true, whenRight: "Right — link-only access; doesn't compete with public videos in search. Perfect for your one purpose.", whenWrong: "Yes — unlisted serves the portfolio link. Public adds nothing for a one-purpose video." }
      ]),
      E("Your turn — record","[PRODUCE] 1. Write the 5-line script.\n2. Open the demo.\n3. Record 60-90s (Loom / OBS / QuickTime).\n4. Upload YouTube Unlisted.\n5. Embed in the dev.to post; link from README.")
    ]),
    D(5,"Update your portfolio","Make the new artifacts findable.",[
      L("Portfolio surface",
"## What it is\n" +
"For now, your 'portfolio' is your GitHub profile + your dev.to posts + your LinkedIn. Tomorrow (W31) you'll build the proper single-page site, but today the existing surfaces need the capstone added.\n\n" +
"## GitHub profile README\n" +
"At the top, after a 1-line intro, add the capstone:\n" +
"```markdown\n" +
"## Latest project\n" +
"**<Capstone name>** — <one-sentence what it does>.\n" +
"[Live demo](<url>) · [Blog post](<url>) · [Code](<url>) · [Video](<url>)\n" +
"```\n" +
"Four links in one line. That's all most reviewers need.\n\n" +
"## Pinned repos on GitHub\n" +
"Pin: TaxiPulse, Reddit Sentiment, Energy Forecast, Capstone. In that order. The capstone is most recent but the four together tell a progression.\n\n" +
"## LinkedIn featured section\n" +
"Add the blog post URL to LinkedIn's 'Featured' section. Don't waste it on the GitHub repo — LinkedIn previews of blog posts look much better than repo previews.\n\n" +
"## Dev.to profile\n" +
"Make sure your bio mentions the four projects and links to your GitHub. Dev.to is increasingly a search-engine target for technical recruiters."
      ),
      S([
        { prompt: "GitHub profile README is the right place for a 'latest project' banner with all four links.", answer: true, whenRight: "Right — first thing reviewers see when they click your handle. Use the real estate.", whenWrong: "Yes — profile README is your front door. Pin the capstone there with the four links." },
        { prompt: "Pinned repos should show the capstone alone — older projects look amateur.", answer: false, whenRight: "Right — no. Pin all four. They show a progression; absence of older work makes the capstone look isolated.", whenWrong: "Pin all four. Reviewers want to see the trajectory. One isolated repo reads as one-off; four reads as practitioner." },
        { prompt: "LinkedIn's 'Featured' section is better for the blog URL than the GitHub URL.", answer: true, whenRight: "Right — LinkedIn renders blog previews beautifully and repos as a tiny logo. Featured the post.", whenWrong: "Yes — blog previews render rich (image + summary); repos preview as a generic icon. Featured = blog URL." }
      ]),
      E("Your turn — update profiles","[WRITE] 1. Update GitHub profile README with 'Latest project' + four links.\n2. Pin the four repos in order: TaxiPulse, Reddit, Energy, Capstone.\n3. Add the blog URL to LinkedIn 'Featured' section.\n4. Update dev.to bio.\n5. Push.")
    ]),
    D(6,"Get 5 readers","Wider than W27's 3. Capstone deserves the extra signal.",[
      L("Why 5 readers for the capstone",
"## What it is\n" +
"Send the dev.to post to FIVE people who aren't data scientists. Ask the same single question:\n\n" +
"> 'Where did you get lost?'\n\n" +
"## Why five (not three)\n" +
"- Three is the floor for signal\n" +
"- Five is the level where convergence becomes hard to ignore\n" +
"- The capstone is the project that LEADS your portfolio — extra signal is cheap insurance\n\n" +
"## Who to ask\n" +
"- 2-3 from your existing W27 reader list (they've now seen 2 posts — they'll catch progression)\n" +
"- 2-3 NEW readers (fresh eyes catch what familiar ones miss)\n\n" +
"## The email template (reuse from W27)\n" +
"```text\n" +
"Subject: 5 minutes — where did you get lost?\n" +
"\n" +
"I wrote up my data-science capstone: <link>. Could you read it (~5 min)\n" +
"and tell me where you FIRST got lost or bored? That's the most useful\n" +
"thing I can hear right now. Thanks!\n" +
"```\n\n" +
"## What to do with the feedback\n" +
"- All 5 lost at the same paragraph → rewrite that paragraph first thing tomorrow\n" +
"- 3+ lost at the same → rewrite tomorrow\n" +
"- 5 different paragraphs → post is roughly clear, light edits\n" +
"\n" +
"## Don't defend\n" +
"Same rule as W27. If a reader was confused, the post is unclear at that spot. Edit, don't explain back."
      ),
      S([
        { prompt: "5 readers for the capstone gives stronger consensus than 3.", answer: true, whenRight: "Right — extra signal is cheap insurance on the project your portfolio leads with.", whenWrong: "Yes — 5 readers reduces single-reader noise. Capstone justifies the extra round." },
        { prompt: "If a reader was confused, you should explain in a reply rather than edit the post.", answer: false, whenRight: "Right — no. Their confusion IS the data. Edit the post; conversations don't scale.", whenWrong: "Don't defend. The next 100 readers will hit the same spot. Edit." },
        { prompt: "Mixing readers who saw W27's post with fresh readers gives broader signal than only one group.", answer: true, whenRight: "Right — repeat readers catch trajectory; fresh ones catch first-impression issues.", whenWrong: "Yes — repeats catch progression issues; fresh ones catch first-impression issues. Mix both." }
      ]),
      E("Your turn — 5 readers","[WRITE] 1. Pick 5 (2-3 from W27 list, 2-3 new).\n2. Send the email.\n3. Log responses in `capstone/docs/reader_feedback.md`.\n4. Identify the priority edit (where 3+ converged).")
    ]),
    D(7,"Tag v1.0 + roadmap retro","Finish the capstone. Finish the roadmap.",[
      L("The roadmap retro — 30 weeks looking back",
"## What it is\n" +
"At the bottom of your capstone README — separately, after the capstone retro — a section reflecting on the entire 30-week roadmap. This is different from project retros: you're extracting lessons about HOW YOU WORK that compound into the next year.\n\n" +
"## The structure\n" +
"```markdown\n" +
"# Roadmap retro (30 weeks)\n" +
"\n" +
"## The 3 weeks that felt highest-leverage\n" +
"<which weeks taught you the most and why>\n" +
"\n" +
"## The 3 weeks that felt slow\n" +
"<which weeks dragged and what would have helped>\n" +
"\n" +
"## Habits I kept\n" +
"<things you started doing during the roadmap that you'll carry forward>\n" +
"\n" +
"## Habits I dropped\n" +
"<things you tried that didn't work or didn't stick>\n" +
"\n" +
"## What I'd do differently if I were starting Week 1 today\n" +
"<advice to yourself, written from the other side>\n" +
"\n" +
"## Where I'm going next\n" +
"<the next concrete step — applying for jobs, a specific specialty, etc.>\n" +
"```\n\n" +
"## Why this matters\n" +
"Most learners finish a structured curriculum and immediately start the next one without integration. The roadmap retro is where you decide what STAYS with you. Those persistent habits are 80% of why some learners keep growing and others plateau.\n\n" +
"## The tag\n" +
"```bash\n" +
"git add capstone/ docs/\n" +
"git commit -m \"Capstone v1.0: <one-line headline finding>\"\n" +
"git tag capstone-v1.0\n" +
"git tag roadmap-done\n" +
"git push && git push --tags\n" +
"```\n\n" +
"Two tags. `capstone-v1.0` marks the project; `roadmap-done` marks the 30-week milestone.\n\n" +
"## What you've actually built\n" +
"- 4 shipped projects: TaxiPulse + Reddit Sentiment + Energy Forecast + Capstone\n" +
"- 4 live demos at public URLs\n" +
"- 4 blog posts on dev.to\n" +
"- 4 GitHub repos with full code + READMEs\n" +
"- 1 audited GitHub profile + LinkedIn presence\n" +
"- 30 weeks of documented work showing month-over-month growth\n\n" +
"This is a portfolio. Most learners trying to break into DS don't have one — they have notebooks. You're past that.\n\n" +
"## Next week\n" +
"W31 — Portfolio + interview prep. Make the four projects findable + practiceable. After that, the structured roadmap is done; specialties (LLM, RAG, CV, MLOps) are optional dives."
      ),
      S([
        { prompt: "The roadmap retro is about HOW you work, not about any single project.", answer: true, whenRight: "Right — meta-lessons that compound into the next year of growth. Different from project retros.", whenWrong: "Yes — process lessons, not project lessons. Process compounds; project lessons don't." },
        { prompt: "Tagging capstone-v1.0 + roadmap-done as separate tags makes both milestones recoverable.", answer: true, whenRight: "Right — two milestones, two tags. Anyone can check out either point cleanly.", whenWrong: "Two tags = two recoverable points. The capstone tag for the project; roadmap-done for the 30-week milestone." },
        { prompt: "Finishing the roadmap means W31 is unnecessary — go straight to applying.", answer: false, whenRight: "Right — no. W31 makes the work findable. Without it, recruiters can't easily reach what you built.", whenWrong: "W31 is the conversion step. Without it, the projects exist but recruiters don't see them efficiently." }
      ]),
      E("Your turn — tag v1.0 + roadmap retro","[PRODUCE] 1. Write roadmap retro section in README.\n2. Commit + double tag:\n`git add . && git commit -m 'Capstone v1.0 + roadmap done'`\n`git tag capstone-v1.0 && git tag roadmap-done`\n`git push && git push --tags`\n\nPASS:\n[x] Live demo URL works\n[x] Blog published\n[x] Video on YouTube + embedded\n[x] 5 readers gave feedback\n[x] Capstone + roadmap retros written\n[x] capstone-v1.0 + roadmap-done tags pushed\n3. Take the day off. 30 weeks. Earned it.")
    ])
  ]
};

/* ════ W31 Portfolio + interview prep ════ */
const W31 = {
  number: 31, title: "Portfolio + interview prep",
  phase: "Wrap", commitment_hours: "10-12",
  context: ds.weeks[30].context,
  concept_check: [
    { q: "A recruiter spends 30 seconds on your portfolio. What MUST they get in those 30 seconds?",
      choices: ["Your full resume","Who you are + 3-4 projects shown as cards with live demos + a clear contact",
        "A picture of you","A long bio"],
      correct: 1, explain: "30 seconds means: name + one-line positioning + 3-4 project cards with clickable demo links + how to reach you. Anything else is wasted real estate. The bio paragraph, the long skills list, the awards — none of those are read." },
    { q: "Why buy a domain instead of relying on github.io / yourname.dev?",
      choices: ["Status symbol","A real domain (yourname.com) is short, memorable, easier to put on a resume, and signals you care enough about your presence to invest $12/year",
        "Required for jobs","Better SEO"],
      correct: 1, explain: "Domain ownership signals seriousness for ~$12/year — a trivial spend with disproportionate signal. It's also shorter on a resume (yourname.com vs yourname.github.io) and survives platform changes. Worth it." },
    { q: "Practicing interview questions out loud (vs reading them silently) matters because…",
      choices: ["It's just a tradition","The cognitive load of speaking exposes gaps that silent reading masks — you'll discover you can't actually explain something you 'know'",
        "Companies require it","Faster"],
      correct: 1, explain: "Reading silently activates recognition memory; speaking activates recall + generation + sequencing. Many concepts you 'know' silently fall apart the moment you try to explain them. The only way to find the gaps is to actually say the explanation out loud. Do it before the real interview, not during." }
  ],
  days: [
    D(1,"Audit what you have","Inventory everything before building the new site.",[
      L("The portfolio audit",
"## What it is\n" +
"Before building anything new, take stock of what already exists. Most learners over-build because they don't realize the assets they already have. The audit is 30 minutes that saves 3 hours of unnecessary work.\n\n" +
"## What to list in `portfolio/INVENTORY.md`\n" +
"```markdown\n" +
"# Inventory\n" +
"\n" +
"## Live demos\n" +
"- TaxiPulse: <url>\n" +
"- Reddit Sentiment: <url>\n" +
"- Energy Forecast: <url>\n" +
"- Capstone: <url>\n" +
"\n" +
"## Blog posts\n" +
"- TaxiPulse on dev.to: <url>\n" +
"- Reddit Sentiment on dev.to: <url>\n" +
"- Energy Forecast on dev.to: <url>\n" +
"- Capstone on dev.to: <url>\n" +
"\n" +
"## Demo videos\n" +
"- Reddit (YouTube unlisted): <url>\n" +
"- Energy Forecast (YouTube unlisted): <url>\n" +
"- Capstone (YouTube unlisted): <url>\n" +
"\n" +
"## Code\n" +
"- TaxiPulse repo: <url>\n" +
"- Reddit Sentiment repo: <url>\n" +
"- Energy Forecast repo: <url>\n" +
"- Capstone repo: <url>\n" +
"\n" +
"## Profiles\n" +
"- GitHub: <url>\n" +
"- LinkedIn: <url>\n" +
"- Dev.to: <url>\n" +
"```\n\n" +
"## What's missing\n" +
"After the inventory, identify gaps:\n" +
"- Any project missing a live demo? Add one (Streamlit Cloud, ~30 min).\n" +
"- Any project missing a blog post? Mark it 'to-write' for later.\n" +
"- Profile bios stale? Update.\n" +
"\n" +
"## What you'll build this week\n" +
"A single-page portfolio site that brings all of this together at yourname.com. The site is the 'one URL' that you put on every job application + LinkedIn. Each project gets a card; each card links to the live demo + blog + repo."
      ),
      S([
        { prompt: "The inventory step prevents over-building because most assets already exist.", answer: true, whenRight: "Right — 30 minutes of listing prevents 3 hours of building duplicate things.", whenWrong: "Yes — list first. Most 'I need to build X' melts away when you realize you already have it." },
        { prompt: "Every project should have a live demo before you build the portfolio site.", answer: true, whenRight: "Right — the portfolio's job is to surface demos. A 'card with no demo' breaks the site's premise.", whenWrong: "Yes — demos first. The portfolio assumes every card links to a live URL. Fill gaps before building." },
        { prompt: "The portfolio site is the SINGLE URL that goes on every application.", answer: true, whenRight: "Right — one URL = one source of truth. yourname.com on the resume; everything else branches from there.", whenWrong: "Yes — one URL. Recruiters can't track 6 separate links; they can click one." }
      ]),
      E("Your turn — audit","[WRITE] 1. Create `portfolio/INVENTORY.md`.\n2. List every demo, blog, video, repo, profile.\n3. Mark gaps.\n4. Fix anything you can fix in 30 minutes (e.g., update LinkedIn featured links).\n5. Leave bigger gaps as 'next' items.")
    ]),
    D(2,"Buy a domain","yourname.com or yourname.dev for ~$12/year.",[
      L("Why a real domain",
"## What it is\n" +
"$12/year on yourname.com or yourname.dev gives you a short, memorable URL you control forever. Disproportionately valuable for the price.\n\n" +
"## Why it matters\n" +
"- **Shorter on resume**: 'yourname.com' (12 chars) vs 'yourname.github.io' (18) vs 'yourname.vercel.app' (19)\n" +
"- **Survives platform changes**: if you switch from Vercel to Netlify, the URL doesn't change\n" +
"- **Signals you care**: $12/year says you took your presence seriously. Most learners don't.\n" +
"- **Email** (eventually): you can set up you@yourname.com for serious-looking job applications\n\n" +
"## Where to buy\n" +
"- **Namecheap** — cheap, reasonable UX, no marketing spam\n" +
"- **Cloudflare Registrar** — at-cost pricing (cheapest), great if you also use Cloudflare for DNS\n" +
"- **Porkbun** — also cheap, no upsell pressure\n\n" +
"## Avoid\n" +
"- **GoDaddy** — pricier renewals; aggressive upsells\n" +
"- **Anyone offering 'free' domain** — usually $0 year 1, then $40+/year\n\n" +
"## TLD choice\n" +
"- **.com** if available — most trusted\n" +
"- **.dev** — developer-friendly, fine\n" +
"- **.io** — common but pricier (~$30/year)\n" +
"- Avoid **.net**, **.info**, **.xyz** for portfolios — looks dated or untrusted\n\n" +
"## What you'll do today\n" +
"1. Check availability for yourname.com on Namecheap.\n" +
"2. If taken: try yourname.dev or firstinitial-lastname.com.\n" +
"3. Buy.\n" +
"4. Don't bother setting up DNS today — that's tomorrow when the site is ready."
      ),
      S([
        { prompt: "$12/year for yourname.com is worth it for a portfolio.", answer: true, whenRight: "Right — disproportionate signal for the price. One coffee a year.", whenWrong: "Yes — cheapest professional upgrade you'll make. ~$1/month for a permanent URL you control." },
        { prompt: "GitHub Pages (yourname.github.io) is just as good as a custom domain.", answer: false, whenRight: "Right — close, but the custom domain is shorter on a resume and survives if you ever leave GitHub. Worth $12.", whenWrong: "Custom domain wins on resume length + platform-independence. $12 is the cheapest professional upgrade." },
        { prompt: "GoDaddy is the best place to buy domains.", answer: false, whenRight: "Right — no. Pricier renewals + upsells. Namecheap, Cloudflare, or Porkbun are cheaper and quieter.", whenWrong: "Avoid GoDaddy. Renewals jump; constant marketing. Namecheap / Cloudflare / Porkbun are calmer + cheaper." }
      ]),
      E("Your turn — buy","[CODE] 1. Check yourname.com on Namecheap.\n2. If not available, try yourname.dev or firstinitial-lastname.com.\n3. Buy.\n4. Don't configure DNS yet — that's tomorrow.")
    ]),
    D(3,"Build a 1-page portfolio site","Next.js + Tailwind on Vercel. Free.",[
      L("The portfolio site",
"## What it is\n" +
"A single-page site at yourname.com that shows:\n" +
"1. **Header**: your name + one-line positioning (e.g., 'Data scientist focused on time series + NLP. Shipping projects since 2026.')\n" +
"2. **4 project cards**: thumbnail + name + one-line description + Live demo + Blog + Repo links\n" +
"3. **Brief about**: 2-3 sentences max. Who you are, what you've done.\n" +
"4. **Contact**: email + LinkedIn + GitHub\n\n" +
"That's it. 4 sections. ~400 words total.\n\n" +
"## Tech: Next.js + Tailwind on Vercel\n" +
"You already know how to deploy Next.js (FORGE-relevant stack). One npx command, one push, live in 2 minutes.\n\n" +
"```bash\n" +
"npx create-next-app@latest portfolio --typescript --tailwind --app\n" +
"cd portfolio\n" +
"# edit src/app/page.tsx\n" +
"git add . && git commit -m 'initial portfolio'\n" +
"git push to a new GitHub repo\n" +
"# Vercel: New Project → import the repo → deploy\n" +
"```\n\n" +
"## DNS\n" +
"On Vercel: Project → Settings → Domains → Add `yourname.com`. Vercel gives you DNS records to paste into Namecheap. ~10 minutes propagation.\n\n" +
"## Inspiration without theft\n" +
"Look at 5-10 DS / engineering portfolios for layout ideas:\n" +
"- brittanychiang.com\n" +
"- chrisachard.com\n" +
"- raycast.com (overkill but shows the pattern)\n\n" +
"Steal layout patterns; write your own copy.\n\n" +
"## Don't over-design\n" +
"The portfolio's job is to surface the projects. Animations + 3D backgrounds + complex grids distract. Recruiters spend 30 seconds. Make sure the 4 cards are clickable in those 30 seconds."
      ),
      V("Next.js in 100 Seconds","https://www.youtube.com/watch?v=Sklc_fQBmcs",3,"Fireship","Refresher on what Next.js gives you for free."),
      S([
        { prompt: "Recruiters spend ~30 seconds on a portfolio.", answer: true, whenRight: "Right — design for that. 4 clickable project cards above the fold; everything else is bonus.", whenWrong: "Yes — design for 30 seconds. Bury nothing important; surface the cards." },
        { prompt: "Complex 3D backgrounds + animations help a portfolio stand out.", answer: false, whenRight: "Right — no. They distract from the cards. Recruiters bounce. The work is the differentiation, not the chrome.", whenWrong: "Chrome distracts. The projects are the differentiation. Plain layout + working demos > flashy + nothing to click." },
        { prompt: "Vercel + Next.js gives you a deployable site in ~5 minutes after the GitHub push.", answer: true, whenRight: "Right — same pattern as everything else on this stack. Connect repo, click deploy, live.", whenWrong: "Yes — minutes. Connect, deploy, live. Same Vercel flow you've used before." }
      ]),
      E("Your turn — build the site","[CODE] 1. `npx create-next-app@latest portfolio --typescript --tailwind --app`.\n2. Edit `src/app/page.tsx` with: header + 4 cards + brief about + contact.\n3. Push to GitHub.\n4. Connect repo to Vercel; deploy.\n5. Add yourname.com domain in Vercel; configure DNS at Namecheap.\n6. Wait for propagation. Open yourname.com in incognito.")
    ]),
    D(4,"Write 3 LinkedIn posts about your projects","One post per major project.",[
      L("LinkedIn distribution",
"## What it is\n" +
"3 LinkedIn posts, one per major project (Reddit, Energy, Capstone). Each post:\n" +
"- 150-200 words\n" +
"- One screenshot or chart\n" +
"- A link to the blog post (NOT the GitHub repo — LinkedIn previews blog URLs much better)\n" +
"- 3-5 relevant hashtags\n" +
"- Posted on different days (spread = more impressions)\n\n" +
"## The structure that gets engagement\n" +
"```text\n" +
"[Hook in 1-2 lines that promise something specific]\n" +
"\n" +
"I built <project> — <one-sentence what it does>.\n" +
"\n" +
"3 things I learned:\n" +
"1. <specific lesson with a number>\n" +
"2. <specific lesson with a number>\n" +
"3. <specific lesson with a number>\n" +
"\n" +
"Live demo: <url>\n" +
"Full write-up: <blog url>\n" +
"\n" +
"#DataScience #MachineLearning #<project-domain>\n" +
"```\n\n" +
"## What gets engagement on LinkedIn DS posts\n" +
"- Specific numbers ('reduced MAE by 13%') > vague claims ('improved performance')\n" +
"- Honest lessons > 'everything went smoothly'\n" +
"- ONE chart > multiple\n" +
"- A clear question at the end invites comments\n\n" +
"## What kills engagement\n" +
"- 'I'm excited to share' opener (LinkedIn algorithm dislikes it; readers skim past)\n" +
"- Buzzword soup ('leveraged cutting-edge AI to disrupt')\n" +
"- No link or vague link\n" +
"- 12+ hashtags (looks spammy; 3-5 is the sweet spot)\n\n" +
"## Posting cadence\n" +
"Post one today, one in 3 days, one in 7 days. Spreading them out gets each one its own moment in the feed."
      ),
      S([
        { prompt: "Specific numbers (\"reduced MAE 13%\") get more engagement than vague claims (\"better performance\").", answer: true, whenRight: "Right — numbers stop the scroll. Vague claims read as noise.", whenWrong: "Yes — specifics earn clicks. 'Reduced MAE 13%' beats 'improved performance' every time." },
        { prompt: "12+ hashtags makes a LinkedIn post more discoverable.", answer: false, whenRight: "Right — no. Looks spammy; LinkedIn de-ranks. 3-5 relevant hashtags is the sweet spot.", whenWrong: "Spam signal. 3-5 hashtags max. More looks like keyword stuffing." },
        { prompt: "Spreading the 3 posts over a week beats publishing all 3 in one day.", answer: true, whenRight: "Right — each post gets its own moment in the feed. Same-day posts cannibalize each other.", whenWrong: "Yes — space them. Same-day posts compete for the same audience window." }
      ]),
      E("Your turn — write 3 posts","[WRITE] 1. Draft 3 LinkedIn posts (one per major project) following the structure.\n2. Post #1 today.\n3. Calendar reminder: post #2 in 3 days, #3 in 7 days.\n4. Save drafts to `portfolio/linkedin_drafts.md` for the future-you.")
    ]),
    D(5,"Update LinkedIn + GitHub profiles","Tune the surfaces recruiters land on.",[
      L("LinkedIn polish",
"## The 4 things that matter\n" +
"\n" +
"### Headline\n" +
"Not 'Aspiring data scientist'. Not 'Learning ML'. Specific:\n" +
"```text\n" +
"Data scientist · Time series + NLP · 4 shipped projects at <yourname.com>\n" +
"```\n" +
"That single line is what shows up in every search result, comment, message preview. Make it specific.\n\n" +
"### About section\n" +
"3 short paragraphs:\n" +
"1. **Who** you are + what you focus on\n" +
"2. **What** you've shipped (4 projects with results)\n" +
"3. **Where** to find them (yourname.com)\n" +
"\n" +
"NO 'self-driven learner who loves solving problems'. Specific or skip.\n\n" +
"### Featured section\n" +
"Add the capstone blog post + the portfolio site URL. Maximum 4 features; pick the strongest.\n\n" +
"### Skills (the right 10, not 50)\n" +
"```text\n" +
"Python · pandas · scikit-learn · PyTorch · SQL · Prophet · MLflow · \n" +
"AWS · Streamlit · FastAPI\n" +
"```\n" +
"10 specific skills you can defend in an interview > 50 vague keywords. LinkedIn surfaces the top 5 most-endorsed; ask 3 friends to endorse your top 5.\n\n" +
"## GitHub polish\n" +
"\n" +
"### Profile README\n" +
"You did this in W30. Confirm it's current.\n" +
"\n" +
"### Pinned repos\n" +
"4 projects pinned in chronological order.\n" +
"\n" +
"### Contribution graph\n" +
"Don't worry about it. Recruiters who actually look at it know it's a weak signal. Don't game it.\n" +
"\n" +
"### Each project repo's README\n" +
"Each top-level README should have:\n" +
"- One-sentence what it does\n" +
"- Live demo link\n" +
"- Blog post link\n" +
"- 'How to run' section (3-5 commands)"
      ),
      S([
        { prompt: "A specific LinkedIn headline ('DS · time series + NLP · 4 projects at site') beats a generic one ('aspiring DS').", answer: true, whenRight: "Right — specific = differentiation. Generic = invisible in search.", whenWrong: "Yes — specific headlines stop scrolls; generic ones don't. Differentiate." },
        { prompt: "Listing 50 skills on LinkedIn is better than listing 10.", answer: false, whenRight: "Right — no. 10 you can defend > 50 you can't. Top 5 most-endorsed surface; pick yours.", whenWrong: "Quality > quantity. Pick 10 you can defend; LinkedIn surfaces the top 5." },
        { prompt: "Each project's GitHub README should have a 'how to run' section in 3-5 commands.", answer: true, whenRight: "Right — recruiters who DO clone want to run it fast. 5 commands or fewer.", whenWrong: "Yes — short runbook. Anything that takes 10+ commands to run reads as fragile." }
      ]),
      E("Your turn — polish profiles","[WRITE] 1. Rewrite LinkedIn headline.\n2. Rewrite About (3 short paragraphs).\n3. Add 4 features.\n4. Refine to 10 skills.\n5. Confirm GitHub profile README + pinned repos.\n6. Add 'how to run' to each project README (3-5 commands).")
    ]),
    D(6,"Practice 3 interview questions out loud","The ones that always come up.",[
      L("Why practice out loud",
"## What it is\n" +
"Three questions that come up in 80% of DS interviews. Practice each ONE TIME, out loud, on camera. Watch the playback.\n\n" +
"## Why out loud + camera\n" +
"- **Out loud**: silent reading uses recognition memory; speaking uses recall + sequencing. Many concepts you 'know' silently fall apart when you try to explain them.\n" +
"- **On camera**: you'll see filler words ('um', 'like'), how long you actually take (longer than you think), where you trail off.\n\n" +
"This single afternoon catches 70% of what would otherwise blow up in a real interview.\n\n" +
"## The three questions\n" +
"```text\n" +
"1. 'Walk me through your favorite project.'\n" +
"   - 2-3 minutes max\n" +
"   - Structure: Problem → data → approach → result → what I'd do differently\n" +
"   - Use a CONCRETE number (MAE, accuracy, % improvement)\n" +
"\n" +
"2. 'Explain bias-variance trade-off.'\n" +
"   - 2 minutes max\n" +
"   - Plain English: high bias = underfitting; high variance = overfitting\n" +
"   - Mention how you'd detect each (train vs test error)\n" +
"   - Mention one technique for each (more data / regularization)\n" +
"\n" +
"3. 'Why are you switching to data science?' (or: 'Tell me about yourself.')\n" +
"   - 1-2 minutes max\n" +
"   - Past → present → future structure\n" +
"   - End with WHY this company / role specifically (or generic if practicing)\n" +
"```\n\n" +
"## The recording process\n" +
"1. Set up your phone or laptop camera.\n" +
"2. Hit record.\n" +
"3. Imagine an interviewer in front of you and answer Q1.\n" +
"4. Stop recording.\n" +
"5. Watch the playback ONCE. Note 2-3 things to fix.\n" +
"6. Re-record once. Stop.\n" +
"7. Move to Q2. Repeat.\n" +
"8. Move to Q3. Repeat.\n" +
"\n" +
"Two takes per question, max. The goal is calibration, not perfection.\n\n" +
"## What you'll notice\n" +
"- You take longer than you think (most people are at 3-4 min when they think they're at 1-2)\n" +
"- You use filler words you don't notice in conversation\n" +
"- You miss obvious points under pressure\n" +
"\n" +
"All three are fixable once you've seen them. Saved you in a real interview."
      ),
      S([
        { prompt: "Speaking answers out loud catches gaps that silent reading misses.", answer: true, whenRight: "Right — recognition memory ≠ recall memory. Many 'I know this' concepts fall apart when you try to explain them.", whenWrong: "Yes — out loud forces recall + generation. Silent reading only checks recognition." },
        { prompt: "Recording yourself on camera is excessive — you can practice without it.", answer: false, whenRight: "Right — no. Camera catches filler words and timing that you can't catch from inside your head.", whenWrong: "Camera catches things internal feedback can't (filler words, length, where you trail off). Worth it." },
        { prompt: "Two takes per question is enough; the goal is calibration not perfection.", answer: true, whenRight: "Right — perfection isn't useful; calibration is. Two takes find the gaps; more is procrastination.", whenWrong: "Yes — two takes max. More is procrastination. Calibrated > perfect." }
      ]),
      E("Your turn — practice","[PRODUCE] 1. Set up your laptop/phone camera.\n2. Record each of the 3 questions, twice each (6 recordings).\n3. Watch the playbacks (skim, not study).\n4. Note 2-3 fixes per question in `portfolio/interview_notes.md`.\n5. Re-record any answer that was over 4 minutes.")
    ]),
    D(7,"Ship + apply","Site live, applications going out.",[
      L("The 'apply' part",
"## What it is\n" +
"You've built the surface; now use it. Apply to 5 jobs today. Not 50; not 1. Five.\n\n" +
"## Where to find DS roles\n" +
"- **LinkedIn Jobs** (most volume, often noisy)\n" +
"- **AngelList / Wellfound** (early-stage companies; faster pipelines)\n" +
"- **WeWorkRemotely** (remote-only)\n" +
"- **Hacker News 'Who is hiring?'** (monthly thread; high-quality startups)\n" +
"- **Company career pages directly** (often better than LinkedIn for the same role)\n\n" +
"## How to apply (the 5-job version)\n" +
"For each role:\n" +
"1. Read the job description carefully. Note 1-2 specifics they want.\n" +
"2. Customize a 2-line cover note: 'I built X (your demo URL) which used Y (their tech). Open to talking.'\n" +
"3. Submit.\n" +
"4. Log it in `portfolio/applications.md`.\n\n" +
"## Why 5 not 50\n" +
"- 5 carefully-targeted applications get more responses than 50 mass-applied ones\n" +
"- 5 lets you track which signals worked\n" +
"- 50 is procrastination disguised as effort\n\n" +
"## What 'shipping the site' means\n" +
"Confirm one last time:\n" +
"- [ ] yourname.com resolves (incognito, fresh device)\n" +
"- [ ] All 4 project cards have working live-demo links\n" +
"- [ ] All 4 cards have working blog links\n" +
"- [ ] All 4 cards have working GitHub repo links\n" +
"- [ ] Contact methods (email, LinkedIn) are clickable\n" +
"\n" +
"Anything that fails — fix today. Otherwise the applications point at broken assets.\n\n" +
"## Tag the milestone\n" +
"```bash\n" +
"git tag portfolio-live\n" +
"git push --tags\n" +
"```\n\n" +
"## What's next\n" +
"W32+ are specialty weeks: LoRA fine-tuning, RAG, computer vision. These are optional but recommended for staying current. The structured DS roadmap is officially done."
      ),
      S([
        { prompt: "5 carefully-targeted applications get more responses than 50 mass-applied ones.", answer: true, whenRight: "Right — quality > volume. Customized 2-line notes referencing their stack beat templated mass sends.", whenWrong: "Yes — targeted > volume. 5 reads, 5 customized notes, 5 submits. Track the signals." },
        { prompt: "You should test the live demos in incognito before applying.", answer: true, whenRight: "Right — cookies-clean test mimics the recruiter's experience. Broken demos = wasted applications.", whenWrong: "Yes — broken demos waste applications. Incognito + fresh device = the test." },
        { prompt: "The W32+ specialty weeks are required to be 'roadmap done'.", answer: false, whenRight: "Right — no. The 30-week structured roadmap is done. Specialties are bonus dives.", whenWrong: "Specialties are optional. The roadmap milestone was last week; W32+ are bonus depth." }
      ]),
      E("Your turn — ship + apply","[PRODUCE] 1. Final checks on yourname.com (incognito, fresh device).\n2. `git tag portfolio-live && git push --tags`.\n3. Pick 5 DS job postings. Apply with customized 2-line notes.\n4. Log them in `portfolio/applications.md`.\n5. Celebrate. You went from no portfolio to applied-to-5-jobs in 31 weeks.")
    ])
  ]
};

/* ════ W32 LLM Fine-tuning LoRA / PEFT ════ */
const W32 = {
  number: 32, title: "LLM Era - Fine-tuning with LoRA + PEFT",
  phase: "Modern ML", commitment_hours: "8-10",
  context: ds.weeks[31].context,
  concept_check: [
    { q: "Why does LoRA (Low-Rank Adaptation) make fine-tuning enormous LLMs practical?",
      choices: ["It's magic","Instead of updating all billions of weights, LoRA trains a tiny number of low-rank update matrices (~0.1% of total params) that approximate the full update",
        "It uses smaller models","It skips training"],
      correct: 1, explain: "Full fine-tuning of a 7B model requires updating 7B parameters — multi-GPU territory and 14GB+ of optimizer state. LoRA freezes the base model and trains tiny low-rank A·B matrices per layer (a few million params total). You get most of the quality gain at 0.1% of the compute and memory. That's why you can fine-tune on a single Colab T4." },
    { q: "Why fine-tune at all when you can prompt-engineer a good model?",
      choices: ["You can't prompt-engineer LLMs","Fine-tuning embeds knowledge or style into the model — for domain-specific outputs you can't reach reliably with prompts alone, or to shrink prompt length / cost",
        "Required by law","No reason"],
      correct: 1, explain: "Prompts add tokens at inference time (costing latency and money). Fine-tuning bakes the behaviour into the weights, so the model knows your domain or style without verbose prompting. Use prompting first; fine-tune when you've hit its ceiling on reliability or when prompt length is becoming a cost issue." },
    { q: "What does the 'PEFT' library specifically give you?",
      choices: ["A new model","A wrapper around HuggingFace transformers that makes LoRA + other parameter-efficient methods one-line additions to a normal training script",
        "GPU access","Free credits"],
      correct: 1, explain: "PEFT = Parameter-Efficient Fine-Tuning. The library exposes LoRA, prefix tuning, prompt tuning, etc. as drop-in wrappers around any HuggingFace model. `model = get_peft_model(model, lora_config)` is the entire integration. You then use the model in a normal training loop." }
  ],
  days: [
    D(1,"Understand LoRA","Low-rank update matrices: the why and the math intuition.",[
      L("LoRA in plain English",
"## What it is\n" +
"Fine-tuning a 7B-parameter model means updating 7 billion weights. That's expensive: gigabytes of optimizer state, multiple GPUs, hours per epoch.\n\n" +
"**LoRA** (Low-Rank Adaptation, 2021) makes a key observation: the *update* needed to specialize a pretrained model is much smaller-dimensional than the model itself. Instead of computing the full update ΔW (a huge matrix), LoRA represents it as a product of two small matrices: ΔW = A·B, where A is (d × r) and B is (r × d) with r being a tiny rank (typically 8-16).\n\n" +
"```text\n" +
"Original weight W:    d × d   (millions of params)\n" +
"LoRA decomposition:   A (d×r) · B (r×d)  with r=8\n" +
"                                          \n" +
"e.g. d=4096, r=8:\n" +
"  W is 4096×4096 = 16.7M params\n" +
"  A·B is 4096×8 + 8×4096 = 65k params  (0.4% of W)\n" +
"```\n\n" +
"Training updates only A and B. The base model W stays frozen. At inference, the effective weight is W + A·B.\n\n" +
"## Why this works\n" +
"Empirically: the *adaptations* needed to make a general model good at a specific task have low intrinsic rank. Most of the model's capacity is already-correct general knowledge; only a thin slice needs to change for specialization.\n\n" +
"## What this unlocks for you\n" +
"- Fine-tune 7B models on a single Colab T4 (16GB GPU)\n" +
"- Store the adapter as a ~50MB file (vs the 14GB base model)\n" +
"- Swap adapters at inference time — base model + adapter A for legal docs, base + adapter B for medical, etc.\n\n" +
"## This week\n" +
"Pick a small task. Fine-tune a 3B-7B model with LoRA on Colab. Evaluate. Ship the adapter to Hugging Face. Total compute: ~$0."
      ),
      V("LoRA explained (paper walkthrough)","https://www.youtube.com/watch?v=DhRoTONcyZE",15,"various","Watch first. The low-rank intuition with visuals — easier than reading the paper."),
      S([
        { prompt: "LoRA updates only A and B (small matrices), leaving the base model weights frozen.", answer: true, whenRight: "Right — that's the parameter efficiency. Base stays frozen; A·B is the only thing trained.", whenWrong: "Yes — base frozen, A·B trained. ~0.1-1% of params updated; most of the quality kept." },
        { prompt: "LoRA works because adaptations needed to specialize a model are LOW intrinsic rank.", answer: true, whenRight: "Right — empirical finding. Most adaptation lives in a thin slice; the full W doesn't need updating.", whenWrong: "Yes — low-rank update is enough. Empirical claim that's held up across many tasks." },
        { prompt: "A LoRA adapter is the same size as the base model.", answer: false, whenRight: "Right — no. Adapters are tiny (often <100MB). Base models are gigabytes.", whenWrong: "Adapters are tiny — 10-100MB typically vs 14GB+ for the base. That's the storage win." }
      ]),
      E("Your turn — frame LoRA","[WRITE] In `peft/INTRO.md`:\n1. Explain LoRA in your own words in 1 paragraph.\n2. Why is rank r=8 typical, not r=128?\n3. State the project goal: fine-tune <base model> on <task> using LoRA + PEFT on Colab T4.")
    ]),
    D(2,"Pick a task + dataset","Small, evaluable, achievable in 8 hours of training.",[
      L("Picking the right task",
"## What you want\n" +
"- **Small task**: a single, well-defined behaviour the base model is bad at\n" +
"- **Public dataset**: a HuggingFace dataset that already exists in the right format\n" +
"- **Evaluable**: accuracy / BLEU / F1 / human-judgable\n" +
"- **Achievable in <2 hours of training**: a couple thousand examples, not millions\n\n" +
"## Good task shapes for a learner project\n" +
"- **Classification on a niche domain**: medical-statement sentiment, legal clause type, etc.\n" +
"- **Style transfer**: 'rewrite this in <style>'\n" +
"- **Domain QA**: answer questions in a specific narrow domain\n" +
"- **JSON output**: 'extract these fields from this text as JSON'\n\n" +
"## Good base models to LoRA on Colab T4\n" +
"- **TinyLlama-1.1B** — fast, decent quality, easy fit\n" +
"- **Phi-2 / Phi-3-mini** — Microsoft's small but capable models\n" +
"- **Llama-3.2-1B or 3.2-3B** — recent, strong baselines\n" +
"\n" +
"Avoid 7B+ on Colab T4 unless you've already done this once — quantization + memory tuning eat the day.\n\n" +
"## Good public datasets to try\n" +
"- HuggingFace `datasets` library has thousands\n" +
"- Filter for ~10k examples (training pool) + ~1k held-out (eval)\n" +
"- 'instruction tuning' datasets are easiest to start with (input → expected output)\n\n" +
"## What you'll do today\n" +
"1. Pick ONE task you can describe in one sentence.\n" +
"2. Pick ONE dataset that fits.\n" +
"3. Sample 10 examples by hand to confirm the format makes sense.\n" +
"4. Write a 1-page brief in `peft/SPEC.md`: task, dataset, base model, success metric, baseline.\n" +
"5. Run the base model on the eval set WITHOUT training — get the baseline metric.\n" +
"\n" +
"If the baseline is already at 95%, the task is too easy — pick a harder one."
      ),
      S([
        { prompt: "TinyLlama-1.1B or Phi-2 are sensible base models for first-time LoRA on a Colab T4.", answer: true, whenRight: "Right — fit comfortably in 16GB, train fast, decent quality.", whenWrong: "Yes — small bases. 7B+ on Colab T4 needs quantization tricks; start smaller." },
        { prompt: "A baseline already at 95% accuracy means the task is too hard.", answer: false, whenRight: "Right — opposite. 95% baseline = task too easy; fine-tuning gives nothing to learn from.", whenWrong: "Too easy. If the base already nails it, LoRA can't improve much. Pick a harder task." },
        { prompt: "Sampling 10 examples by hand before training catches format issues that would waste a training run.", answer: true, whenRight: "Right — eyeballing the data is the cheapest insurance against 4-hour training failures.", whenWrong: "Yes — eyeballing 10 examples takes 5 minutes; catches format issues that would kill a 4-hour run." }
      ]),
      E("Your turn — pick","[WRITE] 1. Write `peft/SPEC.md` (task, dataset, base model, metric, baseline).\n2. Sample 10 examples by hand; confirm format.\n3. Run base model on eval set; record baseline metric.\n4. If baseline > 90%, pick a harder task TODAY.")
    ]),
    D(3,"Set up Colab T4 + PEFT","Install + load model + verify GPU.",[
      L("The setup",
"## Colab + GPU\n" +
"1. New Colab notebook.\n" +
"2. Runtime → Change runtime type → T4 GPU. Save.\n" +
"3. Confirm:\n" +
"```python\n" +
"import torch\n" +
"print(torch.cuda.is_available())\n" +
"print(torch.cuda.get_device_name(0))\n" +
"# True\n" +
"# Tesla T4\n" +
"```\n\n" +
"## Install\n" +
"```python\n" +
"!pip install -q transformers datasets peft accelerate bitsandbytes\n" +
"```\n" +
"- **transformers**: HuggingFace's model loader\n" +
"- **datasets**: HuggingFace's dataset loader\n" +
"- **peft**: LoRA + other parameter-efficient methods\n" +
"- **accelerate**: training-loop infrastructure (mixed precision, multi-GPU, etc.)\n" +
"- **bitsandbytes**: 8-bit / 4-bit quantization (so the base model fits in 16GB)\n\n" +
"## Load the base model (4-bit quantized for memory)\n" +
"```python\n" +
"from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig\n" +
"import torch\n" +
"\n" +
"MODEL = 'meta-llama/Llama-3.2-1B'  # or whatever you picked\n" +
"\n" +
"bnb = BitsAndBytesConfig(\n" +
"    load_in_4bit=True,\n" +
"    bnb_4bit_quant_type='nf4',\n" +
"    bnb_4bit_compute_dtype=torch.float16,\n" +
")\n" +
"\n" +
"tok = AutoTokenizer.from_pretrained(MODEL)\n" +
"model = AutoModelForCausalLM.from_pretrained(\n" +
"    MODEL,\n" +
"    quantization_config=bnb,\n" +
"    device_map='auto',\n" +
")\n" +
"```\n\n" +
"## Wrap with PEFT\n" +
"```python\n" +
"from peft import LoraConfig, get_peft_model, TaskType\n" +
"\n" +
"config = LoraConfig(\n" +
"    r=8,                    # rank\n" +
"    lora_alpha=16,          # scaling factor (2*r is standard)\n" +
"    target_modules=['q_proj', 'v_proj'],  # which layers to adapt\n" +
"    lora_dropout=0.05,\n" +
"    bias='none',\n" +
"    task_type=TaskType.CAUSAL_LM,\n" +
")\n" +
"\n" +
"model = get_peft_model(model, config)\n" +
"model.print_trainable_parameters()\n" +
"# trainable params: 1,572,864 || all params: 1,236,089,344 || trainable%: 0.127\n" +
"```\n\n" +
"That last line is the LoRA magic: 0.127% of params trainable. The 99.87% frozen base model is what fits in 16GB.\n\n" +
"## Sanity test\n" +
"Run one forward pass on a sample input to confirm everything works before the training loop tomorrow."
      ),
      L("Reading print_trainable_parameters",
"## What good numbers look like\n" +
"```text\n" +
"trainable params:    1,572,864     (~1.5M)\n" +
"all params:      1,236,089,344     (~1.2B base + LoRA)\n" +
"trainable%:              0.127%\n" +
"```\n" +
"- Trainable% under 1% — LoRA is doing its job\n" +
"- Trainable params in millions, not billions — fits the GPU's optimizer state\n" +
"- All params close to the base model's known size — base loaded correctly\n\n" +
"If trainable% comes out at 100%, you didn't wrap with PEFT correctly — the whole base is trainable, which won't fit on T4."
      ),
      S([
        { prompt: "4-bit quantization (bitsandbytes nf4) is what makes a 1B+ model fit in a 16GB T4 alongside LoRA adapters.", answer: true, whenRight: "Right — 4-bit weights cut memory ~4x. Base fits; gradients land on the small LoRA params.", whenWrong: "Yes — quantization is the trick. Base in 4-bit, adapters in fp16, gradients only on adapters." },
        { prompt: "After get_peft_model + print_trainable_parameters, trainable% should be UNDER 1% for typical LoRA.", answer: true, whenRight: "Right — that's LoRA's whole point. Trainable% > 10% means something went wrong.", whenWrong: "Yes — sub-1%. Higher means LoRA wasn't applied correctly or you targeted too many modules." },
        { prompt: "`device_map='auto'` lets HuggingFace place the model on whatever GPU is available.", answer: true, whenRight: "Right — handles GPU placement so you don't manually .to('cuda') every tensor.", whenWrong: "Yes — auto placement. Works for single GPU + multi-GPU; saves manual .to() calls." }
      ]),
      E("Your turn — set up","[CODE] 1. New Colab; T4 GPU.\n2. !pip install transformers datasets peft accelerate bitsandbytes.\n3. Load base model in 4-bit.\n4. Wrap with PEFT LoraConfig (r=8, alpha=16, target q_proj + v_proj).\n5. Run print_trainable_parameters; confirm <1%.\n6. One forward pass on a sample input.")
    ]),
    D(4,"Run the fine-tune","Training loop. ~1-2 hours. Watch for overfit.",[
      L("The training loop",
"## With HuggingFace Trainer (simplest)\n" +
"```python\n" +
"from transformers import TrainingArguments, Trainer, DataCollatorForLanguageModeling\n" +
"from datasets import load_dataset\n" +
"\n" +
"dataset = load_dataset('your/dataset', split='train').select(range(10_000))\n" +
"eval_dataset = load_dataset('your/dataset', split='test').select(range(1_000))\n" +
"\n" +
"def tokenize(example):\n" +
"    # Format depends on your task. For instruction-tuning:\n" +
"    text = f'Instruction: {example[\"input\"]}\\nResponse: {example[\"output\"]}'\n" +
"    return tok(text, truncation=True, max_length=512, padding='max_length')\n" +
"\n" +
"train = dataset.map(tokenize, remove_columns=dataset.column_names)\n" +
"evaln = eval_dataset.map(tokenize, remove_columns=eval_dataset.column_names)\n" +
"\n" +
"args = TrainingArguments(\n" +
"    output_dir='out',\n" +
"    per_device_train_batch_size=4,\n" +
"    gradient_accumulation_steps=4,    # effective batch = 16\n" +
"    num_train_epochs=3,\n" +
"    learning_rate=2e-4,\n" +
"    fp16=True,\n" +
"    logging_steps=10,\n" +
"    eval_strategy='epoch',\n" +
"    save_strategy='epoch',\n" +
"    report_to='none',\n" +
")\n" +
"\n" +
"trainer = Trainer(\n" +
"    model=model,\n" +
"    args=args,\n" +
"    train_dataset=train,\n" +
"    eval_dataset=evaln,\n" +
"    data_collator=DataCollatorForLanguageModeling(tok, mlm=False),\n" +
")\n" +
"\n" +
"trainer.train()\n" +
"```\n\n" +
"## What to watch\n" +
"- **train loss** should drop steadily over epochs\n" +
"- **eval loss** should drop too — if it rises while train drops, you're overfitting\n" +
"- **lr** = 2e-4 is a sensible default for LoRA (higher than full fine-tuning's 2e-5 because adapters need stronger updates)\n" +
"\n" +
"## What overfitting looks like\n" +
"```text\n" +
"epoch 1: train=2.1  eval=1.9   ✓\n" +
"epoch 2: train=1.5  eval=1.6   ✓\n" +
"epoch 3: train=1.1  eval=1.7   ✗ eval went UP — overfit\n" +
"```\n" +
"Stop at epoch 2 in that case. Save the epoch-2 checkpoint as your final.\n\n" +
"## Time\n" +
"- 10k examples × 3 epochs × Llama-3.2-1B on T4 = ~60-90 minutes\n" +
"- Keep Colab tab open; don't let runtime disconnect\n" +
"- If runtime disconnects mid-training, checkpointing every epoch means you only lose at most one epoch\n\n" +
"## Save the adapter\n" +
"```python\n" +
"model.save_pretrained('./my-lora-adapter')\n" +
"# That's it. ~10-50MB on disk.\n" +
"```"
      ),
      S([
        { prompt: "LoRA fine-tuning typically uses a higher learning rate (~2e-4) than full fine-tuning (~2e-5).", answer: true, whenRight: "Right — adapters need stronger updates because they start near zero. 2e-4 is the standard LoRA default.", whenWrong: "Yes — 10x higher than full FT. LoRA adapters start fresh; they need stronger updates to learn." },
        { prompt: "Eval loss rising while train loss falls means the model is generalizing better.", answer: false, whenRight: "Right — opposite. That's the textbook overfit signal. Stop at the epoch before eval rose.", whenWrong: "That's overfit, not generalization. Stop before eval loss starts rising; save the previous epoch." },
        { prompt: "A LoRA adapter file is typically 10-50MB on disk.", answer: true, whenRight: "Right — tiny. Easy to upload to HF, easy to swap in/out, easy to version.", whenWrong: "Yes — tiny. ~10-50MB depending on rank and target modules. That's the storage win." }
      ]),
      E("Your turn — train","[CODE] In Colab:\n1. Load + tokenize ~10k training examples and ~1k eval.\n2. TrainingArguments with eval per epoch.\n3. trainer.train(). Watch train + eval loss curves.\n4. Stop at the epoch BEFORE eval loss rises (overfit guard).\n5. model.save_pretrained('./my-lora-adapter').")
    ]),
    D(5,"Evaluate","Adapter vs base, side by side.",[
      L("Honest LoRA evaluation",
"## What you measure\n" +
"On the held-out eval set, compute the SAME metric for:\n" +
"1. **Base model alone** (your Day 2 baseline)\n" +
"2. **Base + adapter** (what you just trained)\n" +
"3. (Optional) **Base + larger model that didn't need fine-tuning**, if relevant\n\n" +
"## The pattern\n" +
"```python\n" +
"# Reload base model WITHOUT adapter\n" +
"base = AutoModelForCausalLM.from_pretrained(MODEL, ...)\n" +
"base_score = evaluate_on_eval_set(base, tok, eval_dataset)\n" +
"\n" +
"# Load base + adapter\n" +
"from peft import PeftModel\n" +
"tuned = PeftModel.from_pretrained(base, './my-lora-adapter')\n" +
"tuned_score = evaluate_on_eval_set(tuned, tok, eval_dataset)\n" +
"\n" +
"print(f'Base:  {base_score:.3f}')\n" +
"print(f'LoRA:  {tuned_score:.3f}')\n" +
"print(f'Lift:  {tuned_score - base_score:+.3f}')\n" +
"```\n\n" +
"## What success looks like\n" +
"- 5-20 percentage-point improvement on a classification task\n" +
"- Lower perplexity on held-out language modelling\n" +
"- Visibly more in-style outputs on a style transfer task (human eval)\n\n" +
"## What failure looks like\n" +
"- Adapter scores BELOW base — either dataset too small, learning rate wrong, or task mismatch\n" +
"- Adapter scores SAME as base — LoRA isn't catching the signal; try higher rank (r=16) or more modules\n" +
"- Adapter MEMORIZED the train set — eval score collapsed; you didn't catch overfit\n\n" +
"## Spot-check 10 outputs by hand\n" +
"Numbers don't always show what's wrong. Pick 10 eval inputs, run both models on them, eyeball the outputs. Often you'll see the LoRA model has clearly learned the format/style — even if the metric looks similar."
      ),
      L("Saving the comparison",
"## Document it\n" +
"```markdown\n" +
"# Fine-tune results\n" +
"\n" +
"## Task\n" +
"<one-line>\n" +
"\n" +
"## Dataset\n" +
"<source, size, split>\n" +
"\n" +
"## Base model\n" +
"<model name + size>\n" +
"\n" +
"## LoRA config\n" +
"- rank: 8\n" +
"- alpha: 16\n" +
"- target modules: [q_proj, v_proj]\n" +
"- trainable params: 1.5M (0.13% of base)\n" +
"\n" +
"## Training\n" +
"- 10k examples × 3 epochs (stopped at epoch 2 to avoid overfit)\n" +
"- batch 16 (effective), lr 2e-4, fp16\n" +
"- Total wall time on Colab T4: ~75 min\n" +
"\n" +
"## Results\n" +
"- Base accuracy: 64.2%\n" +
"- LoRA accuracy: 81.7%   (+17.5 pp)\n" +
"- 10/10 spot-checks show clearly improved format adherence\n" +
"\n" +
"## Honest weaknesses\n" +
"<what didn't work or where the model still fails>\n" +
"```"
      ),
      S([
        { prompt: "You should evaluate the LoRA model on the same eval set used for the baseline.", answer: true, whenRight: "Right — only fair comparison. Different eval sets confound the result.", whenWrong: "Yes — identical eval set. Anything else makes the comparison meaningless." },
        { prompt: "If the LoRA model scores below the base, the most common cause is learning rate too low.", answer: false, whenRight: "More commonly: dataset too small, format mismatch, or target_modules wrong. LR too low is one of several possibilities.", whenWrong: "Several causes: small data, format issues, wrong target modules, lr too high or low. Investigate each." },
        { prompt: "Spot-checking 10 outputs by hand is more revealing than a metric alone.", answer: true, whenRight: "Right — metrics summarize; eyeballing tells you what's actually different. Both matter.", whenWrong: "Yes — humans see things metrics don't. Often the model improved in ways accuracy misses." }
      ]),
      E("Your turn — evaluate","[CODE] 1. Reload base model alone; compute eval metric.\n2. Reload base + adapter; compute same metric.\n3. Print both + the lift.\n4. Spot-check 10 outputs by hand from each.\n5. Write `peft/RESULTS.md` with the comparison + honest weakness.")
    ]),
    D(6,"Ship the adapter","Hugging Face Hub. Public + reusable.",[
      L("Hugging Face Hub",
"## What it is\n" +
"HuggingFace's model hub is GitHub for ML models. Free to host adapters; built-in versioning; the standard place where anyone in the field looks.\n\n" +
"## Upload\n" +
"```python\n" +
"# In Colab\n" +
"!huggingface-cli login\n" +
"# Paste your HF token (huggingface.co/settings/tokens)\n" +
"\n" +
"model.push_to_hub('yourname/llama-3-2-1b-myproject-lora')\n" +
"tok.push_to_hub('yourname/llama-3-2-1b-myproject-lora')\n" +
"```\n\n" +
"Your adapter is now at `huggingface.co/yourname/llama-3-2-1b-myproject-lora`.\n\n" +
"## Add a model card (README)\n" +
"HuggingFace shows a README on every model page. Write it directly on the model's page → 'Edit model card':\n" +
"```markdown\n" +
"# llama-3-2-1b-myproject-lora\n" +
"\n" +
"LoRA adapter for `meta-llama/Llama-3.2-1B`, fine-tuned for <task>.\n" +
"\n" +
"## Use\n" +
"```python\n" +
"from peft import PeftModel\n" +
"from transformers import AutoModelForCausalLM, AutoTokenizer\n" +
"\n" +
"base = AutoModelForCausalLM.from_pretrained('meta-llama/Llama-3.2-1B')\n" +
"tok = AutoTokenizer.from_pretrained('yourname/llama-3-2-1b-myproject-lora')\n" +
"model = PeftModel.from_pretrained(base, 'yourname/llama-3-2-1b-myproject-lora')\n" +
"```\n" +
"\n" +
"## Training\n" +
"- Base: meta-llama/Llama-3.2-1B (4-bit)\n" +
"- LoRA: r=8, alpha=16, q_proj+v_proj\n" +
"- Dataset: <source>, 10k examples, 2 epochs\n" +
"- Eval: <metric>, +17.5 pp vs base\n" +
"\n" +
"## Limitations\n" +
"<honest weaknesses>\n" +
"```\n\n" +
"## Why publish\n" +
"- Verifiable artifact a recruiter can click\n" +
"- Reusable by anyone in the world\n" +
"- Counts as 'real ML output', not just a notebook\n" +
"- Hub page tracks downloads — early social proof"
      ),
      S([
        { prompt: "Pushing the LoRA adapter to Hugging Face Hub creates a verifiable, reusable artifact recruiters can click.", answer: true, whenRight: "Right — public link with a model card. Same idea as a public GitHub repo, but specifically for models.", whenWrong: "Yes — public artifact. HF Hub is the standard ML model registry; recruiters know where to look." },
        { prompt: "The model card (README) should include training details + honest limitations.", answer: true, whenRight: "Right — anyone using the adapter needs to know how it was trained and where it fails.", whenWrong: "Yes — training details + limitations. Without them the adapter is unauditable." },
        { prompt: "Uploading a LoRA adapter to HuggingFace requires a paid plan.", answer: false, whenRight: "Right — no. Public hosting is free. Paid is for private model storage at scale, which you don't need.", whenWrong: "Free for public models. You only pay for private hosting at team scale — not relevant for portfolio." }
      ]),
      E("Your turn — ship the adapter","[PRODUCE] 1. `huggingface-cli login` with your HF token.\n2. model.push_to_hub('yourname/...').\n3. Edit model card on HF: include training details + use snippet + limitations.\n4. Confirm the page loads at huggingface.co/yourname/...\n5. Save the URL to `peft/LINKS.md`.")
    ]),
    D(7,"Write the EVAL post","Short technical post on dev.to.",[
      L("The EVAL post",
"## What it is\n" +
"A ~800-word technical post on dev.to about the LoRA fine-tune. Shorter than your project posts; this is a technique demo, not a full project.\n\n" +
"## Structure\n" +
"```text\n" +
"1. Hook — one line: 'I fine-tuned Llama-3.2-1B on <task> with LoRA. Result: +17.5pp.'\n" +
"2. Why LoRA — 1 paragraph on the parameter-efficiency win\n" +
"3. Task + dataset — 1 paragraph\n" +
"4. Config that worked — code snippet with the LoraConfig\n" +
"5. Results table — base vs adapter, with 1-2 spot-check examples\n" +
"6. Links — HuggingFace adapter URL + Colab notebook + repo\n" +
"7. What I'd do differently — 2-3 honest weaknesses\n" +
"```\n\n" +
"## Hook discipline\n" +
"Same rule as the capstone post. State the question + answer in the first 1-2 lines. Bury nothing.\n\n" +
"## Why write this\n" +
"- Permanently links your name to a specific technique\n" +
"- Gets indexed by search engines (LoRA tutorials get steady traffic)\n" +
"- Concrete evidence of modern ML capability on your portfolio\n" +
"- Most candidates can't show this; you can"
      ),
      L("Tag and ship the week",
"## What goes in the repo\n" +
"```text\n" +
"peft/\n" +
"  SPEC.md            # the task + dataset framing\n" +
"  RESULTS.md         # base vs adapter comparison\n" +
"  LINKS.md           # HF URL, blog URL, Colab URL\n" +
"  notebook.ipynb     # the Colab notebook downloaded\n" +
"```\n\n" +
"```bash\n" +
"git add peft/\n" +
"git commit -m \"LoRA fine-tune: +17.5pp on <task> with Llama-3.2-1B\"\n" +
"git tag lora-shipped\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## Why this milestone matters\n" +
"You've now done something that ~5% of self-taught DS learners ever attempt. LoRA fine-tuning is the technique that powers most production LLM customization in 2025-2026. Having one shipped adapter + a written-up explanation puts you ahead of nearly every entry-level candidate."
      ),
      S([
        { prompt: "An EVAL post is shorter than a project post because it's a technique demo, not a full project.", answer: true, whenRight: "Right — ~800 words vs 1500. Focused on the technique + result.", whenWrong: "Yes — technique post = shorter. Project posts tell a story; technique posts demo a method." },
        { prompt: "Linking the HuggingFace adapter URL in the post lets readers reproduce your result.", answer: true, whenRight: "Right — reproducibility = credibility. A URL that just works > screenshots.", whenWrong: "Yes — the link makes it reproducible. Readers who skeptical can click and verify." },
        { prompt: "LoRA fine-tuning is too niche to mention on a portfolio.", answer: false, whenRight: "Right — opposite. It's the dominant production LLM customization technique. Most entry-level candidates can't show it.", whenWrong: "Massively in-demand. Most learner portfolios stop at 'I fine-tuned BERT'. Shipped LoRA puts you ahead." }
      ]),
      E("Your turn — write + tag","[PRODUCE] 1. Write the EVAL post (`peft/post.md`) following the structure.\n2. Publish on dev.to.\n3. Commit + tag:\n`git add peft/ && git commit -m 'LoRA shipped' && git tag lora-shipped && git push --tags`")
    ])
  ]
};

/* ════ W33 RAG ════ */
const W33 = {
  number: 33, title: "RAG Systems - retrieval-augmented generation in production",
  phase: "Modern ML", commitment_hours: "8-10",
  context: ds.weeks[32].context,
  concept_check: [
    { q: "What does the 'R' (Retrieval) in RAG actually do?",
      choices: ["Magic","Given a user question, find the most relevant chunks of your private documents via semantic similarity (vector search) — then feed those chunks to an LLM along with the question",
        "Trains a model","Compresses data"],
      correct: 1, explain: "Step 1: chunk your documents and embed each chunk into a vector. Step 2: at query time, embed the user's question into the same vector space; find the closest chunks. Step 3: pass those chunks + the question into an LLM. The LLM uses the chunks as context to answer. Without retrieval the LLM only knows public training data; with retrieval it can answer over YOUR documents." },
    { q: "Why chunk documents instead of feeding entire files to the LLM?",
      choices: ["LLMs are slow","Context windows are limited and costs scale with tokens — small, relevant chunks let the LLM see only what matters for the question",
        "Required by law","Easier to read"],
      correct: 1, explain: "An 8K context window can't fit a 200-page PDF. Even when it can (long context models), you're paying per token AND irrelevant text dilutes the signal. Chunking + retrieval picks only the most relevant 2-5 passages per question." },
    { q: "Why add HYBRID search (vector + keyword) rather than just vector similarity?",
      choices: ["Vector search alone is fine","Vector search nails semantic similarity but misses exact-string queries (names, IDs, acronyms); keyword search catches those — combining both is more robust",
        "Faster","Cheaper"],
      correct: 1, explain: "Vector search excels at 'find passages similar in meaning' but can completely miss a query for a specific case number, person's name, or product SKU. Keyword (BM25) catches exact matches. Hybrid search (combine both score columns) gets the best of both — robust across query types." }
  ],
  days: [
    D(1,"Understand RAG","Why every enterprise built this in 2023-2024.",[
      L("RAG in plain English",
"## What it is\n" +
"You want an LLM to answer questions over YOUR documents — contracts, support tickets, internal wiki, etc. The LLM doesn't know your stuff (it was trained on public web).\n\n" +
"**RAG = Retrieval-Augmented Generation**. The architecture:\n\n" +
"```text\n" +
"OFFLINE (once, per document update):\n" +
"  1. Split each document into chunks (~500 tokens each)\n" +
"  2. Embed each chunk: text → vector (1536 floats)\n" +
"  3. Store: { chunk_text, vector, source_metadata } in a vector DB\n" +
"\n" +
"AT QUERY TIME (per user question):\n" +
"  4. Embed the question: question → vector\n" +
"  5. Vector search: find the top-5 chunks closest to question vector\n" +
"  6. Build a prompt:\n" +
"       'Context:\\n<top-5 chunks>\\n\\nQuestion: <user question>\\nAnswer:'\n" +
"  7. Send to LLM. LLM answers using the chunks.\n" +
"  8. Show the answer + cite which chunks it came from.\n" +
"```\n\n" +
"## Why this won in 2023-2024\n" +
"Every enterprise needed 'a chatbot over our docs.' Fine-tuning was expensive and stale. RAG was cheap, kept the LLM stateless, and updated whenever the documents updated. Same playbook at every company.\n\n" +
"## Where it fails\n" +
"- **Bad chunking**: too-big chunks dilute; too-small chunks lose context\n" +
"- **Pure vector search**: misses exact-string queries (names, IDs)\n" +
"- **No citations**: model 'hallucinates' or quotes things not in the chunks\n" +
"- **Stale embeddings**: documents updated but vector DB didn't refresh\n\n" +
"## What you'll build this week\n" +
"A working RAG system over a corpus you pick (10-100 documents). Hybrid search. Citations. Evaluation. Deployed."
      ),
      V("RAG explained simply (5 min)","https://www.youtube.com/watch?v=T-D1OfcDW1M",6,"various","Watch first. The retrieve → augment → generate loop with visuals."),
      S([
        { prompt: "RAG keeps the LLM stateless — your documents stay in your vector DB, not the model weights.", answer: true, whenRight: "Right — the LLM is generic; the knowledge is in retrievable chunks. Update docs → re-embed → done. No retraining.", whenWrong: "Yes — stateless LLM + retrievable knowledge base. That's the deploy + update simplicity." },
        { prompt: "RAG and fine-tuning solve the same problem and you should pick whichever is cheaper.", answer: false, whenRight: "Right — they solve DIFFERENT problems. RAG injects knowledge at query time; fine-tuning embeds style/behaviour into weights. Often both.", whenWrong: "Different tools. RAG: knowledge access. Fine-tune: behaviour/style. Often used together." },
        { prompt: "Without citations, a RAG system loses much of its value because users can't verify answers.", answer: true, whenRight: "Right — citations are the audit trail. 'The model said X — see chunk #3 of Contract.pdf' is the demo.", whenWrong: "Yes — citations = trust. RAG without citations is just a chatbot; with citations it's auditable." }
      ]),
      E("Your turn — frame RAG","[WRITE] In `rag/INTRO.md`:\n1. Explain RAG in your own words in 1 paragraph.\n2. Name a real use case in a domain you care about (legal, medical, code, etc.).\n3. State the project: build a RAG system over <your corpus>, deploy a Streamlit demo.")
    ]),
    D(2,"Pick corpus + chunk","Sourcing + chunking strategy.",[
      L("The corpus + chunking",
"## Pick a corpus\n" +
"Pick 10-100 documents you can publicly redistribute (or that the license allows). Good options:\n" +
"- **Public papers** (arXiv on a niche topic)\n" +
"- **Open documentation** (Python docs, AWS docs, Stripe docs)\n" +
"- **Public legal corpus** (court rulings, EU regs)\n" +
"- **Open Wikipedia subsets** (one category)\n" +
"\n" +
"## The chunking pattern\n" +
"```python\n" +
"from langchain.text_splitter import RecursiveCharacterTextSplitter\n" +
"\n" +
"splitter = RecursiveCharacterTextSplitter(\n" +
"    chunk_size=500,      # ~500 chars (~125 tokens)\n" +
"    chunk_overlap=50,    # so chunks don't cut mid-sentence\n" +
"    separators=['\\n\\n', '\\n', '. ', ' '],  # try paragraphs first, then sentences\n" +
")\n" +
"\n" +
"chunks = []\n" +
"for doc_path in doc_paths:\n" +
"    text = load_text(doc_path)\n" +
"    for chunk_text in splitter.split_text(text):\n" +
"        chunks.append({\n" +
"            'text': chunk_text,\n" +
"            'source': doc_path,\n" +
"            'preview': chunk_text[:100],\n" +
"        })\n" +
"\n" +
"print(f'{len(chunks)} chunks from {len(doc_paths)} docs')\n" +
"```\n\n" +
"## Chunk size matters\n" +
"- **Too small (100 chars)**: loses context — a single sentence about X doesn't have enough surrounding info\n" +
"- **Too large (5000 chars)**: dilutes the embedding (one vector summarising 5 paragraphs is fuzzy) + wastes tokens\n" +
"- **Sweet spot**: 300-1000 chars depending on document type\n\n" +
"## Why overlap\n" +
"Chunks at hard boundaries miss context. A 50-char overlap means a sentence at the end of chunk N also lives at the start of chunk N+1. Cheap insurance against mid-sentence cuts.\n\n" +
"## Store the chunks\n" +
"```python\n" +
"import json\n" +
"with open('rag/chunks.json', 'w') as f:\n" +
"    json.dump(chunks, f)\n" +
"```"
      ),
      S([
        { prompt: "Chunks of 300-1000 chars are typically the sweet spot for RAG.", answer: true, whenRight: "Right — small enough for tight embeddings, big enough to preserve context.", whenWrong: "Yes — sweet spot. Smaller loses context; larger dilutes the embedding." },
        { prompt: "Chunk overlap (e.g., 50 chars) avoids mid-sentence cuts losing context.", answer: true, whenRight: "Right — cheap insurance. A sentence near a boundary lives in both adjacent chunks.", whenWrong: "Yes — overlap = context preservation. Pure boundary chunks lose information at the cuts." },
        { prompt: "5000-character chunks are better because they preserve more context.", answer: false, whenRight: "Right — no. Big chunks dilute the embedding (one vector summarizing 5 paragraphs is fuzzy) and waste tokens.", whenWrong: "Too big = fuzzy embeddings + token waste. The whole point of chunking is selective retrieval." }
      ]),
      E("Your turn — chunk","[CODE] 1. Pick 10-100 documents.\n2. Use RecursiveCharacterTextSplitter (chunk_size=500, overlap=50).\n3. Build the chunks list with text + source metadata.\n4. Save to `rag/chunks.json`.\n5. Print a few examples to sanity-check.")
    ]),
    D(3,"Embed + index","Vector embeddings + FAISS index.",[
      L("Embedding + indexing",
"## Embed every chunk\n" +
"Use an embedding model that's small + cheap. `sentence-transformers/all-MiniLM-L6-v2` is the standard learner choice (384-dim, runs on CPU, free).\n\n" +
"```python\n" +
"from sentence_transformers import SentenceTransformer\n" +
"import numpy as np\n" +
"\n" +
"model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')\n" +
"\n" +
"texts = [c['text'] for c in chunks]\n" +
"vectors = model.encode(texts, show_progress_bar=True, batch_size=32)\n" +
"print(vectors.shape)\n" +
"# (5000, 384)  -- 5000 chunks, 384-dim each\n" +
"```\n\n" +
"## Build the FAISS index\n" +
"FAISS is Facebook's vector similarity library. Free, fast, runs locally — perfect for a learner RAG.\n\n" +
"```python\n" +
"import faiss\n" +
"\n" +
"index = faiss.IndexFlatIP(vectors.shape[1])  # inner-product (cosine if normalized)\n" +
"faiss.normalize_L2(vectors)  # so IP becomes cosine\n" +
"index.add(vectors)\n" +
"\n" +
"print(f'Indexed {index.ntotal} chunks')\n" +
"```\n\n" +
"`IndexFlatIP` is exact search. Slow for billions; fast enough for tens of thousands. For learner-scale, that's all you need.\n\n" +
"## Save\n" +
"```python\n" +
"faiss.write_index(index, 'rag/faiss.index')\n" +
"import pickle\n" +
"with open('rag/chunks.pkl', 'wb') as f:\n" +
"    pickle.dump(chunks, f)\n" +
"```\n\n" +
"## Sanity test: search\n" +
"```python\n" +
"def search(query, k=5):\n" +
"    q_vec = model.encode([query])\n" +
"    faiss.normalize_L2(q_vec)\n" +
"    scores, idxs = index.search(q_vec, k)\n" +
"    return [{'score': float(scores[0][i]), **chunks[idxs[0][i]]} for i in range(k)]\n" +
"\n" +
"hits = search('How do I handle authentication?', k=3)\n" +
"for h in hits:\n" +
"    print(f\"[{h['score']:.3f}] {h['source']}: {h['preview']}\")\n" +
"```"
      ),
      S([
        { prompt: "FAISS IndexFlatIP with L2-normalized vectors gives you cosine similarity ranking.", answer: true, whenRight: "Right — inner product on normalized vectors = cosine similarity. Standard pattern.", whenWrong: "Yes — normalize + IP = cosine. Don't normalize and you get raw dot product (biased by magnitude)." },
        { prompt: "An embedding model with 384 dimensions is too small for production RAG.", answer: false, whenRight: "Right — no. 384-dim MiniLM is fine for most learner / smaller-prod use cases. Bigger ≠ always better; pays in compute.", whenWrong: "384-dim is plenty for learner RAG. Many production systems use 768 or 1536 but it's not required." },
        { prompt: "FAISS IndexFlatIP is fast enough for tens of thousands of chunks on a laptop.", answer: true, whenRight: "Right — exact search at that scale is sub-second. Billions of chunks needs HNSW / IVF; learner scale doesn't.", whenWrong: "Yes — exact search to tens of thousands. Fine for learner / smaller-prod use cases without HNSW tuning." }
      ]),
      E("Your turn — embed + index","[CODE] 1. Embed all chunks with sentence-transformers MiniLM.\n2. Build a FAISS IndexFlatIP. Normalize vectors first.\n3. Save index + chunks to disk.\n4. Write a search(query, k) helper.\n5. Run 3 sanity-check queries; verify top hits are relevant.")
    ]),
    D(4,"Retrieve + generate","Add an LLM to the loop.",[
      L("The RAG inference pattern",
"## The full pipeline\n" +
"```python\n" +
"def rag_answer(question: str, k: int = 5) -> str:\n" +
"    # 1. Retrieve top-k chunks\n" +
"    hits = search(question, k=k)\n" +
"\n" +
"    # 2. Build the prompt\n" +
"    context = '\\n\\n---\\n\\n'.join(\n" +
"        f\"[chunk {i+1} | source: {h['source']}]\\n{h['text']}\"\n" +
"        for i, h in enumerate(hits)\n" +
"    )\n" +
"    prompt = f'''You are a helpful assistant. Answer the question using ONLY the provided context. \n" +
"If the context doesn't contain the answer, say so. Cite the chunks you used like [chunk N].\n" +
"\n" +
"Context:\n" +
"{context}\n" +
"\n" +
"Question: {question}\n" +
"Answer:'''\n" +
"\n" +
"    # 3. Send to LLM\n" +
"    from openai import OpenAI\n" +
"    client = OpenAI()\n" +
"    response = client.chat.completions.create(\n" +
"        model='gpt-4o-mini',\n" +
"        messages=[{'role': 'user', 'content': prompt}],\n" +
"        temperature=0,\n" +
"    )\n" +
"    return response.choices[0].message.content, hits\n" +
"```\n\n" +
"## Why temperature=0\n" +
"For RAG you want deterministic, conservative answers grounded in the chunks. Higher temperature invites hallucination — the model invents content not in the context.\n\n" +
"## Why the 'ONLY' instruction\n" +
"Without it, the model will happily mix in its training knowledge. With it, the model is more likely to admit 'context doesn't say'. Not perfect; instruction-following helps but doesn't guarantee.\n\n" +
"## The citation requirement\n" +
"`Cite the chunks you used like [chunk N]` gives users a verifiable trail. When they click a citation, you show them the actual chunk text. That's the difference between 'magic chatbot' and 'searchable knowledge base.'\n\n" +
"## Sanity test\n" +
"Ask 5 questions you know the answer to. Verify:\n" +
"1. Retrieval returns relevant chunks\n" +
"2. LLM uses them\n" +
"3. Citations point to real chunks\n" +
"4. When the answer ISN'T in the corpus, the model says so (not hallucinate)"
      ),
      S([
        { prompt: "Telling the model to answer ONLY from the provided context reduces hallucination — but doesn't eliminate it.", answer: true, whenRight: "Right — instruction-following helps; models still occasionally drift. Citations + spot-checks are the safety net.", whenWrong: "Yes — reduces, doesn't eliminate. Verify with citations." },
        { prompt: "temperature=0 produces more grounded, less creative answers for RAG.", answer: true, whenRight: "Right — deterministic + conservative. Higher temp = more 'made up' content invited.", whenWrong: "Yes — temp 0 for RAG. You don't want creativity; you want grounding in the context." },
        { prompt: "Requiring the model to cite chunks gives users a verifiable audit trail.", answer: true, whenRight: "Right — citations = trust. Without them RAG is indistinguishable from a chatbot.", whenWrong: "Yes — citations are the trust mechanism. Without them, users can't verify; with them, they can." }
      ]),
      E("Your turn — RAG end-to-end","[CODE] 1. Write `rag_answer(question, k=5)`.\n2. Use gpt-4o-mini or Claude with temperature=0.\n3. Instruction: ONLY use context; cite [chunk N].\n4. Ask 5 questions you know the answer to.\n5. Verify retrieval + grounding + citations.")
    ]),
    D(5,"Add hybrid search","Combine vector + BM25 for robustness.",[
      L("Hybrid search",
"## Why hybrid\n" +
"Vector search nails semantic similarity ('how does payment processing work?') but misses exact-string queries ('what's invoice #INV-2024-001234?').\n\n" +
"**BM25** (keyword search) catches exact strings but misses synonyms ('payments' vs 'transactions').\n\n" +
"Combine both → robust across query types.\n\n" +
"## The pattern\n" +
"```python\n" +
"from rank_bm25 import BM25Okapi\n" +
"import numpy as np\n" +
"\n" +
"# Build BM25 index once\n" +
"tokenized_corpus = [c['text'].lower().split() for c in chunks]\n" +
"bm25 = BM25Okapi(tokenized_corpus)\n" +
"\n" +
"def hybrid_search(query, k=5, alpha=0.5):\n" +
"    # Vector scores\n" +
"    q_vec = model.encode([query])\n" +
"    faiss.normalize_L2(q_vec)\n" +
"    vec_scores, _ = index.search(q_vec, len(chunks))\n" +
"    vec_scores = vec_scores[0]  # shape: (n_chunks,)\n" +
"\n" +
"    # BM25 scores\n" +
"    bm25_scores = bm25.get_scores(query.lower().split())\n" +
"\n" +
"    # Normalize both to 0-1\n" +
"    vec_n = (vec_scores - vec_scores.min()) / (vec_scores.max() - vec_scores.min() + 1e-9)\n" +
"    bm25_n = (bm25_scores - bm25_scores.min()) / (bm25_scores.max() - bm25_scores.min() + 1e-9)\n" +
"\n" +
"    # Linear combination\n" +
"    final = alpha * vec_n + (1 - alpha) * bm25_n\n" +
"\n" +
"    # Top-k\n" +
"    top_idx = np.argsort(final)[::-1][:k]\n" +
"    return [{'score': float(final[i]), **chunks[i]} for i in top_idx]\n" +
"```\n\n" +
"## Tuning alpha\n" +
"- **alpha=1**: vector-only (semantic similarity)\n" +
"- **alpha=0**: BM25-only (keyword)\n" +
"- **alpha=0.5**: equal weight — sensible default\n" +
"- **alpha=0.7**: favor semantic search for natural-language queries\n" +
"\n" +
"Run a few queries with both pure vector and hybrid; compare. For most learner RAGs, hybrid wins on robustness.\n\n" +
"## When to use which\n" +
"- Heavy reliance on names/IDs → tilt toward BM25\n" +
"- Heavy reliance on conceptual questions → tilt toward vector\n" +
"- Mixed → 0.5"
      ),
      S([
        { prompt: "BM25 keyword search catches exact-string queries that vector search can miss.", answer: true, whenRight: "Right — vector excels at semantic similarity; BM25 catches exact tokens. Together = robust.", whenWrong: "Yes — different strengths. BM25 for exact tokens; vectors for meaning." },
        { prompt: "alpha=0.5 in hybrid search means equal weight to vector and BM25 scores.", answer: true, whenRight: "Right — linear combination. Tune higher for semantic, lower for exact-string.", whenWrong: "Yes — equal blend. Tune per use case but 0.5 is sensible default." },
        { prompt: "Hybrid search is always better than pure vector search.", answer: false, whenRight: "Right — usually but not always. For purely semantic corpora the BM25 component can add noise. Test both.", whenWrong: "Usually wins on robustness, occasionally adds noise. Test on YOUR corpus." }
      ]),
      E("Your turn — hybrid","[CODE] 1. `pip install rank-bm25`.\n2. Build BM25Okapi over your chunks.\n3. Write `hybrid_search(query, k, alpha)` combining vector + BM25.\n4. Compare pure-vector vs hybrid on 5 mixed queries (conceptual + name-based).\n5. Note which one wins where in `rag/HYBRID.md`.")
    ]),
    D(6,"Evaluate","Manual eval on 20 question-answer pairs.",[
      L("RAG evaluation",
"## What it is\n" +
"Build a hand-labeled eval set of 20 (question, ideal answer) pairs. Run your RAG on each. Score each output: ✓ / ✗ / partial. Compute accuracy.\n\n" +
"## The pattern\n" +
"```python\n" +
"eval_set = [\n" +
"    {'q': 'How does authentication work?', 'ideal': 'JWT tokens with refresh...'},\n" +
"    {'q': 'What is the rate limit?', 'ideal': '100 requests/minute per API key...'},\n" +
"    # ... 20 total ...\n" +
"]\n" +
"\n" +
"def grade(output, ideal):\n" +
"    # Subjective for learner project; LLM-as-judge for production.\n" +
"    print(f'Q:  {q}')\n" +
"    print(f'OUT: {output}')\n" +
"    print(f'IDEAL: {ideal}')\n" +
"    return input('Pass (y/n/p)? ')  # y=pass, n=fail, p=partial\n" +
"\n" +
"scores = []\n" +
"for item in eval_set:\n" +
"    out, _ = rag_answer(item['q'])\n" +
"    scores.append(grade(out, item['ideal']))\n" +
"\n" +
"print(f'Pass: {scores.count(\"y\") / len(scores):.0%}')\n" +
"print(f'Fail: {scores.count(\"n\") / len(scores):.0%}')\n" +
"print(f'Partial: {scores.count(\"p\") / len(scores):.0%}')\n" +
"```\n\n" +
"## Why manual eval for learner project\n" +
"- LLM-as-judge is the production move, but adds complexity\n" +
"- 20 hand-graded answers is enough to find systematic issues\n" +
"- You'll discover edge cases the automation would miss\n\n" +
"## Failure analysis\n" +
"For each ✗:\n" +
"- Was retrieval wrong? (wrong chunks returned) — improve chunking or embedding\n" +
"- Was generation wrong? (right chunks, wrong answer) — improve prompt\n" +
"- Was the question unanswerable from corpus? — model should have said so\n" +
"\n" +
"Document the failure modes; they're the headline of the EVAL post.\n\n" +
"## The honest result\n" +
"Most first RAG systems score 60-75% on the manual eval. That's normal; document it honestly. The improvement story (hybrid added 5pp; better chunks added 3pp) is what makes the project credible."
      ),
      S([
        { prompt: "Manual evaluation on 20 questions is enough to find systematic issues in a learner RAG.", answer: true, whenRight: "Right — 20 hand-graded answers reveal patterns. LLM-as-judge is the production move but adds complexity.", whenWrong: "Yes — 20 hand grades = enough signal for systematic issues. Production needs more; learner doesn't." },
        { prompt: "For each failed answer, the first question is 'was retrieval wrong or was generation wrong?'.", answer: true, whenRight: "Right — different fixes. Wrong chunks → improve embedding / chunking. Wrong answer from right chunks → improve prompt.", whenWrong: "Yes — diagnose first. Wrong chunk vs wrong reasoning are different fixes." },
        { prompt: "A 60-75% accuracy on first RAG eval is failure.", answer: false, whenRight: "Right — no. That's typical first pass. Improvement story (what added points) is what makes the project credible.", whenWrong: "60-75% is normal first-pass. The story (what improved it) is what carries the project." }
      ]),
      E("Your turn — evaluate","[CODE] 1. Build a 20-question eval set with ideal answers.\n2. Run rag_answer on each.\n3. Grade y/n/p manually.\n4. Compute pass rate.\n5. For each fail, diagnose: retrieval issue or generation issue?\n6. Write `rag/EVAL.md` with the score + 3 patterns in the failures.")
    ]),
    D(7,"Deploy + ship","Streamlit demo + dev.to post.",[
      L("Shipping",
"## Streamlit demo\n" +
"Same pattern as W27 / W30. The minimum:\n" +
"```python\n" +
"import streamlit as st\n" +
"\n" +
"@st.cache_resource\n" +
"def load_components():\n" +
"    # Load embedding model, FAISS index, BM25, chunks\n" +
"    ...\n" +
"\n" +
"st.title('RAG over <your corpus>')\n" +
"query = st.text_input('Ask a question:')\n" +
"if query:\n" +
"    answer, hits = rag_answer(query)\n" +
"    st.write(answer)\n" +
"    with st.expander('Sources used'):\n" +
"        for i, h in enumerate(hits, 1):\n" +
"            st.markdown(f'**[{i}] {h[\"source\"]}**')\n" +
"            st.text(h['text'])\n" +
"```\n\n" +
"Deploy to Streamlit Cloud as before. Public URL.\n\n" +
"## The blog post\n" +
"```text\n" +
"1. Hook — what you built + the score\n" +
"2. Why RAG (1 paragraph)\n" +
"3. Corpus + chunking choices\n" +
"4. Hybrid search — why it helped (or didn't)\n" +
"5. Eval results — pass rate + failure patterns\n" +
"6. Live demo URL\n" +
"7. What I'd improve\n" +
"```\n\n" +
"## Tag and ship\n" +
"```bash\n" +
"git add rag/\n" +
"git commit -m \"RAG system: <pass rate> on hand-eval over <corpus>\"\n" +
"git tag rag-shipped\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## Why this matters for hiring\n" +
"Every team that built an LLM application in 2023-2024 built RAG first. Showing a working RAG + hybrid search + honest eval puts you ahead of most candidates who only show 'I called the OpenAI API' projects."
      ),
      S([
        { prompt: "An honest eval section (including failure patterns) makes the RAG project more credible, not less.", answer: true, whenRight: "Right — named weaknesses = credibility. Unnamed ones = caught by reviewers = destroyed credibility.", whenWrong: "Yes — honest weaknesses build trust. Hidden ones get caught and burn it." },
        { prompt: "Showing source citations in the Streamlit demo (expandable 'Sources used' section) is the right UX for a RAG.", answer: true, whenRight: "Right — citations are the differentiator. Without them it's a chatbot; with them it's an auditable knowledge tool.", whenWrong: "Yes — citations are the trust UX. Show them by default or one click away." },
        { prompt: "RAG is too 2023 to be relevant on a 2026 portfolio.", answer: false, whenRight: "Right — opposite. Still the dominant LLM-app pattern; every team needs it. Skills hire today.", whenWrong: "Wrong — RAG is in every production LLM stack. Critical skill, not outdated." }
      ]),
      E("Your turn — ship","[PRODUCE] 1. Build Streamlit demo with citations.\n2. Deploy to Streamlit Cloud.\n3. Write the blog post; publish on dev.to.\n4. Commit + tag:\n`git tag rag-shipped && git push --tags`")
    ])
  ]
};

/* ════ W34 Computer Vision ════ */
const W34 = {
  number: 34, title: "Computer Vision - CNN, transfer learning, Vision Transformers",
  phase: "Vision", commitment_hours: "8-10",
  context: ds.weeks[33].context,
  concept_check: [
    { q: "Why does transfer learning (fine-tuning ResNet50 on your task) beat training from scratch for most image problems?",
      choices: ["Less code","Pretrained ResNet50 has already learned generic visual features (edges, textures, parts) from millions of ImageNet images — your task only needs to add a thin specialization on top",
        "Required by law","Faster GPUs"],
      correct: 1, explain: "Training a CNN from scratch needs millions of labeled images to learn the basic visual primitives — edge detectors, texture analyzers, shape recognizers. ResNet50 pretrained on ImageNet already has all of these. Fine-tuning just specializes the last few layers for your specific task on your (much smaller) dataset. Typical gain: 10-30x less data needed." },
    { q: "What does a Vision Transformer (ViT) do differently from a CNN?",
      choices: ["Nothing","Treats the image as a sequence of patches and uses self-attention (like an LLM) instead of convolutions — scales better with data and often matches CNN quality with enough training",
        "Faster math","Smaller models"],
      correct: 1, explain: "CNNs use spatial convolutions with built-in assumptions about locality + translation invariance. ViTs split the image into a grid of patches, embed each, and run self-attention over the sequence. Less inductive bias but more expressive — needs more data to match CNN quality, but scales further when you have it." },
    { q: "Why deploy with Gradio (vs writing a Flask app) for a CV demo?",
      choices: ["Gradio is better","Gradio gives you image-input + prediction-output widgets + a public share URL in <10 lines — purpose-built for ML demos",
        "Required by HF","Faster"],
      correct: 1, explain: "Gradio is purpose-built for ML model demos. `gr.Interface(fn=predict, inputs='image', outputs='label')` gives you a working UI + a public share URL. Flask would need 100+ lines of HTML/JS/upload-handling for the same thing. Right tool for the job." }
  ],
  days: [
    D(1,"Intuition","CNNs, transfer learning, where ViTs fit.",[
      L("CV in one read",
"## What it is\n" +
"Computer vision = teaching models to extract meaning from images. The dominant architecture for the last decade is **CNNs (Convolutional Neural Networks)**. Recently **Vision Transformers (ViTs)** have caught up and surpassed CNNs at large scale.\n\n" +
"## CNN intuition\n" +
"```text\n" +
"input image (224×224×3)\n" +
"  → conv layer 1: detects EDGES, COLOR BLOBS (low-level)\n" +
"  → pool / conv 2: detects TEXTURES, simple SHAPES\n" +
"  → conv 3-N: detects PARTS (wheels, eyes, windows)\n" +
"  → final layers: detects OBJECTS (cars, faces, buildings)\n" +
"  → output: predicted class\n" +
"```\n" +
"Each conv layer takes the previous feature maps and learns spatial filters. The filters in early layers find simple things; later layers compose them into complex things. That's it.\n\n" +
"## Transfer learning\n" +
"Training a CNN from scratch needs millions of labeled images. **Pretrained CNNs** (ResNet50, EfficientNet) have already learned the early-layer feature extractors from ImageNet (14M images, 1000 classes).\n\n" +
"When you fine-tune for YOUR task:\n" +
"- Keep the pretrained feature extractor (don't retrain the early layers — they're already good)\n" +
"- Replace the final classification head with one matching your task\n" +
"- Train only the new head (or fine-tune the last few layers gently)\n" +
"\n" +
"Result: 10-30x less data needed to match training-from-scratch quality.\n\n" +
"## Vision Transformers\n" +
"Newer architecture (2021). Instead of convolutions:\n" +
"- Split image into a grid of patches (e.g., 16×16 each)\n" +
"- Embed each patch as a vector\n" +
"- Run self-attention (like an LLM) over the sequence of patch embeddings\n" +
"- Classification head on the [CLS] token\n" +
"\n" +
"Trade-off: less inductive bias than CNNs (no built-in locality) but more expressive when you have lots of data. For learner projects, fine-tune a pretrained ViT — same pattern as CNN.\n\n" +
"## This week\n" +
"Pick an image classification task. Fine-tune ResNet50. Try ViT. Compare. Deploy with Gradio. Same shape as the LoRA / RAG weeks."
      ),
      V("Convolutional Neural Networks Explained","https://www.youtube.com/watch?v=YRhxdVk_sIs",13,"various","Watch first. CNN visuals — filters, feature maps, pooling. The intuition stays even as architectures change."),
      S([
        { prompt: "Transfer learning works because pretrained models already learned the generic visual primitives.", answer: true, whenRight: "Right — early layers stay; you just specialize the final head for your task. 10-30x less data needed.", whenWrong: "Yes — primitives transfer. The expensive learning is already done; you add a thin task-specific cap." },
        { prompt: "Vision Transformers have STRONGER inductive bias than CNNs.", answer: false, whenRight: "Right — opposite. ViTs have LESS built-in assumption about images (no locality, no translation invariance). More expressive but needs more data.", whenWrong: "ViTs are LESS biased — no locality assumption. More flexible; needs more data to match." },
        { prompt: "For image classification with limited labeled data, fine-tuning ResNet50 is a sensible first move.", answer: true, whenRight: "Right — strong, well-understood, available pretrained. Works on small datasets via transfer learning.", whenWrong: "Yes — ResNet50 transfer is the default. Strong baseline; well-documented; works on small data." }
      ]),
      E("Your turn — frame CV","[WRITE] In `cv/INTRO.md`:\n1. Explain transfer learning in your own words.\n2. State the project: classify <task> with ResNet50 fine-tune, compare against ViT.\n3. State the bar to beat: a sensible baseline (e.g., majority-class accuracy, simple feature + LogReg).")
    ]),
    D(2,"Pick dataset + preprocess","Public image set + standard augmentations.",[
      L("Picking + preprocessing",
"## Pick a dataset\n" +
"Good learner options on HuggingFace `datasets`:\n" +
"- **CIFAR-10** — 60k 32×32 color images, 10 classes (planes, cats, etc.). Classic.\n" +
"- **Oxford Flowers** — 8k images, 102 classes. Bigger images, harder task.\n" +
"- **EuroSAT** — satellite imagery, 27k images, 10 land-use classes. Domain-specific feel.\n" +
"- **A subset of ImageNet** (50-100 classes) — close to production-realistic\n" +
"\n" +
"Pick one with ~5k-50k training images. Too small → not enough signal. Too big → training is slow on Colab.\n\n" +
"## Standard preprocessing for transfer learning\n" +
"```python\n" +
"from torchvision import transforms\n" +
"\n" +
"# Training transforms (augmentation = synthetic data variety)\n" +
"train_transform = transforms.Compose([\n" +
"    transforms.RandomResizedCrop(224),         # crop random region, resize to 224\n" +
"    transforms.RandomHorizontalFlip(),          # 50% flip\n" +
"    transforms.ColorJitter(0.4, 0.4, 0.4),     # slight brightness/contrast/saturation\n" +
"    transforms.ToTensor(),\n" +
"    transforms.Normalize(\n" +
"        mean=[0.485, 0.456, 0.406],            # ImageNet stats\n" +
"        std=[0.229, 0.224, 0.225],\n" +
"    ),\n" +
"])\n" +
"\n" +
"# Eval transforms (deterministic, no augmentation)\n" +
"eval_transform = transforms.Compose([\n" +
"    transforms.Resize(256),\n" +
"    transforms.CenterCrop(224),\n" +
"    transforms.ToTensor(),\n" +
"    transforms.Normalize(\n" +
"        mean=[0.485, 0.456, 0.406],\n" +
"        std=[0.229, 0.224, 0.225],\n" +
"    ),\n" +
"])\n" +
"```\n\n" +
"## Why ImageNet normalization stats\n" +
"ResNet50 was pretrained on ImageNet with these exact normalization stats. If you use different stats, the pretrained weights produce gibberish. ALWAYS match the normalization the model expects.\n\n" +
"## Why augmentation for training but not eval\n" +
"- **Training**: augmentation = free synthetic variety, prevents overfitting\n" +
"- **Eval**: needs to be deterministic so results are comparable across runs\n\n" +
"## Sanity check\n" +
"Display 10 augmented training samples and 10 eval samples. Confirm:\n" +
"- Labels are correct\n" +
"- Images look reasonable after transforms\n" +
"- Class balance roughly matches what you expect"
      ),
      S([
        { prompt: "Using ImageNet normalization stats matters because that's what the pretrained ResNet50 expects.", answer: true, whenRight: "Right — the model was trained with these exact stats; using different ones makes the pretrained weights useless.", whenWrong: "Yes — match the pretrain stats. Get them wrong and the pretrained features become noise." },
        { prompt: "Data augmentation should be applied identically to training and evaluation.", answer: false, whenRight: "Right — no. Training: random augmentation (variety). Eval: deterministic (comparable across runs).", whenWrong: "Aug for training, deterministic for eval. Otherwise eval scores wobble across runs." },
        { prompt: "5k-50k training images is a typical sweet spot for fine-tuning a pretrained CNN on a single Colab T4.", answer: true, whenRight: "Right — enough signal for transfer learning, small enough to train fast on T4.", whenWrong: "Yes — that range fits Colab time budget and gives transfer learning enough to specialize on." }
      ]),
      E("Your turn — pick + preprocess","[CODE] 1. Pick a HuggingFace `datasets` image classification set.\n2. Set up train_transform + eval_transform (ImageNet stats).\n3. Display 10 augmented + 10 eval samples to sanity-check.\n4. Compute baseline: majority-class accuracy on eval.")
    ]),
    D(3,"Fine-tune ResNet50","Replace head, train, ~30 min on T4.",[
      L("ResNet50 transfer",
"## The model\n" +
"```python\n" +
"import torch.nn as nn\n" +
"from torchvision.models import resnet50, ResNet50_Weights\n" +
"\n" +
"weights = ResNet50_Weights.IMAGENET1K_V2\n" +
"model = resnet50(weights=weights)\n" +
"\n" +
"# Replace the final classification head\n" +
"num_classes = 10  # your number\n" +
"model.fc = nn.Linear(model.fc.in_features, num_classes)\n" +
"\n" +
"# Optional: freeze earlier layers, train only the head + last block\n" +
"for name, param in model.named_parameters():\n" +
"    if not (name.startswith('fc') or name.startswith('layer4')):\n" +
"        param.requires_grad = False\n" +
"\n" +
"# Count trainable\n" +
"trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)\n" +
"total = sum(p.numel() for p in model.parameters())\n" +
"print(f'Trainable: {trainable/1e6:.1f}M / {total/1e6:.1f}M ({100*trainable/total:.1f}%)')\n" +
"```\n\n" +
"## Why freeze earlier layers\n" +
"- Cheaper (fewer gradients to compute + store)\n" +
"- More stable (pretrained features stay good; new head adapts)\n" +
"- Smaller risk of catastrophic forgetting\n" +
"\n" +
"For your first fine-tune, freeze all but `fc` + `layer4`. For more advanced runs, unfreeze gradually.\n\n" +
"## Training loop\n" +
"```python\n" +
"import torch\n" +
"from torch.utils.data import DataLoader\n" +
"\n" +
"device = 'cuda' if torch.cuda.is_available() else 'cpu'\n" +
"model = model.to(device)\n" +
"\n" +
"loader_train = DataLoader(train_ds, batch_size=64, shuffle=True, num_workers=2)\n" +
"loader_eval  = DataLoader(eval_ds,  batch_size=128, shuffle=False, num_workers=2)\n" +
"\n" +
"optim = torch.optim.Adam(\n" +
"    [p for p in model.parameters() if p.requires_grad],\n" +
"    lr=1e-3,\n" +
")\n" +
"loss_fn = nn.CrossEntropyLoss()\n" +
"\n" +
"for epoch in range(5):\n" +
"    model.train()\n" +
"    for x, y in loader_train:\n" +
"        x, y = x.to(device), y.to(device)\n" +
"        optim.zero_grad()\n" +
"        out = model(x)\n" +
"        loss = loss_fn(out, y)\n" +
"        loss.backward()\n" +
"        optim.step()\n" +
"\n" +
"    # Eval\n" +
"    model.eval()\n" +
"    correct = 0\n" +
"    total = 0\n" +
"    with torch.no_grad():\n" +
"        for x, y in loader_eval:\n" +
"            x, y = x.to(device), y.to(device)\n" +
"            pred = model(x).argmax(dim=1)\n" +
"            correct += (pred == y).sum().item()\n" +
"            total += y.size(0)\n" +
"    print(f'epoch {epoch+1}: eval acc {correct/total:.3f}')\n" +
"```\n\n" +
"## What to expect\n" +
"- Epoch 1: eval accuracy jumps from baseline → solid first number\n" +
"- Epochs 2-3: gradual improvement\n" +
"- Epoch 4-5: small or no improvement → stop\n" +
"\n" +
"30-60 minutes on T4 for typical learner datasets."
      ),
      L("Saving",
"## Save the weights\n" +
"```python\n" +
"torch.save(model.state_dict(), 'cv/resnet50_finetuned.pt')\n" +
"```\n" +
"~100MB depending on whether you saved the full model or just the trainable params."
      ),
      S([
        { prompt: "Freezing earlier layers + only training the head + last block is a sensible first fine-tune strategy.", answer: true, whenRight: "Right — cheaper, more stable, less risk of forgetting pretrained features.", whenWrong: "Yes — freeze most + train tail. Stable, fast, safe first move." },
        { prompt: "ResNet50 pretrained weights must be paired with ImageNet normalization stats.", answer: true, whenRight: "Right — model was trained with those stats; mismatch ruins the pretrained features.", whenWrong: "Yes — match the pretrain normalization or the pretrained features become noise." },
        { prompt: "5 epochs is enough for a typical learner CV fine-tune.", answer: true, whenRight: "Right — most gain in first 2-3 epochs; flatline by 4-5. More epochs risks overfit.", whenWrong: "Yes — 5 epochs covers the gain. More risks overfit; less misses the plateau." }
      ]),
      E("Your turn — fine-tune","[CODE] In Colab:\n1. Load resnet50 with ImageNet weights; replace fc head.\n2. Freeze all but fc + layer4.\n3. Train 5 epochs on T4; eval each epoch.\n4. Save weights to disk.\n5. Print eval accuracy per epoch.")
    ]),
    D(4,"Evaluate","Honest test-set metrics + confusion matrix.",[
      L("Evaluating the CNN",
"## What to measure\n" +
"- **Overall accuracy** on held-out test set\n" +
"- **Per-class accuracy** (often more revealing than overall)\n" +
"- **Confusion matrix** (which classes get mixed up?)\n" +
"- **A few hand-picked failure cases** (show the images the model gets wrong)\n\n" +
"## The pattern\n" +
"```python\n" +
"from sklearn.metrics import classification_report, confusion_matrix\n" +
"import matplotlib.pyplot as plt\n" +
"import seaborn as sns\n" +
"\n" +
"model.eval()\n" +
"all_preds, all_labels = [], []\n" +
"with torch.no_grad():\n" +
"    for x, y in loader_eval:\n" +
"        x = x.to(device)\n" +
"        pred = model(x).argmax(dim=1).cpu().numpy()\n" +
"        all_preds.extend(pred)\n" +
"        all_labels.extend(y.numpy())\n" +
"\n" +
"print(classification_report(all_labels, all_preds, target_names=class_names))\n" +
"\n" +
"cm = confusion_matrix(all_labels, all_preds)\n" +
"plt.figure(figsize=(10, 10))\n" +
"sns.heatmap(cm, annot=True, fmt='d', xticklabels=class_names, yticklabels=class_names)\n" +
"plt.savefig('cv/confusion_matrix.png')\n" +
"```\n\n" +
"## Why per-class matters\n" +
"Overall accuracy can hide that one class is at 30% while others are at 95%. Per-class reveals where the model is weakest. That's where you'd add data, augmentation, or a class-weighted loss.\n\n" +
"## Failure cases\n" +
"Pick 5-10 images the model misclassified. Look at them. Often you'll find:\n" +
"- The model confused two visually similar classes (e.g., husky / wolf)\n" +
"- The labels themselves are ambiguous\n" +
"- Lighting / occlusion issues\n" +
"- Out-of-distribution examples\n\n" +
"Each pattern suggests a different fix. Document it for the blog post."
      ),
      S([
        { prompt: "Per-class accuracy can reveal weak spots that overall accuracy hides.", answer: true, whenRight: "Right — average can mask. One class at 30% in a 10-class problem might still leave overall above 85%.", whenWrong: "Yes — overall averages away the weak class. Per-class shows the leak." },
        { prompt: "A confusion matrix shows which classes the model tends to mix up.", answer: true, whenRight: "Right — off-diagonal cells = confusion patterns. Useful for diagnosing class-level errors.", whenWrong: "Yes — confusion matrix = which pairs get confused. Read off-diagonals for the confusing pairs." },
        { prompt: "Looking at the actual failure images is overkill — accuracy + confusion matrix are sufficient.", answer: false, whenRight: "Right — no. Eyeballing failures reveals patterns metrics miss (label noise, lighting issues, OOD).", whenWrong: "Eyeballing fails reveals what metrics don't. Patterns: label noise, OOD, visually similar classes. Worth the 5 min." }
      ]),
      E("Your turn — evaluate","[CODE] 1. Run classification_report on test set.\n2. Plot confusion matrix; save to cv/confusion_matrix.png.\n3. Find 5-10 failure cases. Display them.\n4. Document 2-3 failure patterns in `cv/EVAL.md`.")
    ]),
    D(5,"Try ViT","Same task, different architecture.",[
      L("ViT transfer learning",
"## Why this exercise\n" +
"You've built a strong CNN baseline. Now swap in a Vision Transformer to see:\n" +
"- Does ViT match / beat ResNet50 on your dataset?\n" +
"- How does training time differ?\n" +
"- Does the failure pattern change?\n\n" +
"## The pattern (HuggingFace transformers)\n" +
"```python\n" +
"from transformers import ViTImageProcessor, ViTForImageClassification\n" +
"\n" +
"processor = ViTImageProcessor.from_pretrained('google/vit-base-patch16-224')\n" +
"model = ViTForImageClassification.from_pretrained(\n" +
"    'google/vit-base-patch16-224',\n" +
"    num_labels=10,\n" +
"    ignore_mismatched_sizes=True,   # we replace the head\n" +
")\n" +
"```\n\n" +
"## Training\n" +
"Same training loop as CNN day. Two differences:\n" +
"- ViTs prefer smaller learning rate (1e-4 vs 1e-3)\n" +
"- ViTs train slightly slower (longer sequences)\n" +
"\n" +
"## What you'll likely see\n" +
"- On smaller datasets (<10k images): ResNet50 wins. CNN's inductive bias is more efficient with little data.\n" +
"- On larger datasets (>50k images): ViT matches or beats. More expressive when data is plentiful.\n" +
"- Confusion patterns differ: ViT often handles globally-distinctive classes better; CNN handles texture-driven classes better.\n\n" +
"## Honest comparison\n" +
"Don't claim ViT is 'better' just because it's newer. On YOUR dataset, the right answer is empirical. Document which won and why."
      ),
      S([
        { prompt: "On small datasets (<10k images), ResNet50 often beats ViT.", answer: true, whenRight: "Right — CNN's spatial inductive bias is more efficient with limited data. ViT shines with more.", whenWrong: "Yes — small data → CNN's bias helps. ViT needs more data to outperform." },
        { prompt: "ViTs need a lower learning rate than CNNs for fine-tuning.", answer: true, whenRight: "Right — ViTs are more sensitive; 1e-4 is the safer starting LR.", whenWrong: "Yes — start at 1e-4 for ViT. Higher LR is more likely to wreck the pretrained features." },
        { prompt: "On a portfolio post you should claim whichever architecture is 'newer' was the right choice.", answer: false, whenRight: "Right — no. Be honest about what won on YOUR data. Reviewers respect data-driven calls over hype.", whenWrong: "Be empirical. Whatever won on your data is the right answer. Defending hype over evidence fails reviewers." }
      ]),
      E("Your turn — ViT","[CODE] 1. Load ViT-base from HuggingFace.\n2. Replace head; train ~5 epochs with lr=1e-4.\n3. Eval on the same test set.\n4. Print: CNN acc, ViT acc, training time difference.\n5. Note which won + a 1-sentence guess at why in `cv/COMPARISON.md`.")
    ]),
    D(6,"FastAPI inference","Wrap the better model in a JSON API.",[
      L("FastAPI for CV",
"## What it is\n" +
"A minimal FastAPI service that takes an uploaded image and returns the predicted class + confidence. Same pattern as TaxiPulse W7, adapted for image input.\n\n" +
"## The endpoint\n" +
"```python\n" +
"from fastapi import FastAPI, UploadFile, File\n" +
"from fastapi.responses import JSONResponse\n" +
"import io\n" +
"from PIL import Image\n" +
"import torch\n" +
"\n" +
"app = FastAPI()\n" +
"\n" +
"model = ...  # load once on startup (the model that won between ResNet50 and ViT)\n" +
"model.eval()\n" +
"\n" +
"@app.post('/predict')\n" +
"async def predict(file: UploadFile = File(...)):\n" +
"    img_bytes = await file.read()\n" +
"    img = Image.open(io.BytesIO(img_bytes)).convert('RGB')\n" +
"    x = eval_transform(img).unsqueeze(0)\n" +
"    \n" +
"    with torch.no_grad():\n" +
"        logits = model(x)\n" +
"        probs = torch.softmax(logits, dim=1)[0]\n" +
"        idx = probs.argmax().item()\n" +
"        return {\n" +
"            'class': class_names[idx],\n" +
"            'confidence': float(probs[idx]),\n" +
"            'top3': [\n" +
"                {'class': class_names[i], 'prob': float(probs[i])}\n" +
"                for i in probs.topk(3).indices.tolist()\n" +
"            ],\n" +
"        }\n" +
"```\n\n" +
"## Test it locally\n" +
"```bash\n" +
"pip install fastapi uvicorn pillow python-multipart\n" +
"uvicorn cv.app:app --reload\n" +
"# New terminal:\n" +
"curl -X POST http://localhost:8000/predict -F 'file=@dog.jpg'\n" +
"# {\"class\":\"dog\",\"confidence\":0.94,\"top3\":[{\"class\":\"dog\",\"prob\":0.94},{\"class\":\"wolf\",\"prob\":0.04},{\"class\":\"cat\",\"prob\":0.01}]}\n" +
"```\n\n" +
"## Why JSON endpoint AND Gradio\n" +
"Gradio (Day 7) is the human-facing demo. The FastAPI endpoint is the machine-facing interface — mobile apps, other services, and batch pipelines call it. Showing BOTH proves you can bridge the gap between 'model trained' and 'model integrated'."
      ),
      L("The startup discipline",
"## Load once, serve forever\n" +
"```python\n" +
"from contextlib import asynccontextmanager\n\n" +
"@asynccontextmanager\n" +
"async def lifespan(app: FastAPI):\n" +
"    app.state.model = load_model()\n" +
"    app.state.model.eval()\n" +
"    app.state.transform = eval_transform\n" +
"    yield\n\n" +
"app = FastAPI(lifespan=lifespan)\n" +
"```\n\n" +
"Never load the model inside the handler — every request would take seconds instead of milliseconds. Loading once at startup is the correct pattern for every inference API you will ever write.\n\n" +
"## Don't skip `.eval()`\n" +
"Without it, BatchNorm layers track running statistics and Dropout fires randomly — both produce wrong predictions. `.eval()` is non-negotiable for inference."
      ),
      S([
        { prompt: "A FastAPI /predict endpoint that returns JSON makes your model accessible to any downstream system.", answer: true, whenRight: "Right — JSON API = machine interface. Gradio = human interface. Showing both is the full picture.", whenWrong: "Yes — JSON endpoint is what other services call. Gradio alone stops at 'demo'." },
        { prompt: "You must call model.eval() before inference to get deterministic, correct predictions.", answer: true, whenRight: "Right — eval() disables training-only Dropout and BatchNorm modes. Non-negotiable.", whenWrong: "Yes — eval() every time. Without it, predictions are wrong and vary between runs." },
        { prompt: "Loading the model inside the `/predict` handler (once per request) is fine for a portfolio API.", answer: false, whenRight: "Right — no. Load once at startup. Per-request loading adds seconds of latency to every call.", whenWrong: "Load at startup. Per-request model loading is a ~10-second penalty per call. Never the right pattern." }
      ]),
      E("Your turn — FastAPI","[CODE] In `cv/app.py`:\n1. Build the `/predict` endpoint (UploadFile → JSON with class + confidence + top3).\n2. Load the winning model once via lifespan, with .eval().\n3. `uvicorn cv.app:app --reload`.\n4. Test with a real image: `curl -X POST .../predict -F file=@test.jpg`.\n5. Confirm JSON response matches expected.")
    ]),
    D(7,"Gradio demo + ship","Public demo on HF Spaces. Blog post. Tag.",[
      L("Gradio: the ML demo standard",
"## What it is\n" +
"Gradio is purpose-built for ML demos. `gr.Interface(fn=predict, inputs='image', outputs='label')` gives you a working drag-and-drop demo UI + a public URL in under 10 lines. Native to Hugging Face Spaces.\n\n" +
"## The demo (10 lines)\n" +
"```python\n" +
"import gradio as gr\n" +
"import torch\n" +
"from PIL import Image\n\n" +
"model = load_model()   # whichever won — ResNet50 or ViT\n" +
"model.eval()\n\n" +
"def predict(img: Image.Image) -> dict:\n" +
"    x = eval_transform(img).unsqueeze(0)\n" +
"    with torch.no_grad():\n" +
"        probs = torch.softmax(model(x), dim=1)[0]\n" +
"    top3 = probs.topk(3)\n" +
"    return {\n" +
"        class_names[top3.indices[i].item()]: float(top3.values[i])\n" +
"        for i in range(3)\n" +
"    }\n\n" +
"demo = gr.Interface(\n" +
"    fn=predict,\n" +
"    inputs=gr.Image(type='pil', label='Upload image'),\n" +
"    outputs=gr.Label(num_top_classes=3, label='Prediction'),\n" +
"    title='<Your model>',\n" +
"    description='Fine-tuned ResNet50/ViT on <dataset>.',\n" +
"    examples=[['cv/samples/dog.jpg'], ['cv/samples/cat.jpg']],\n" +
")\n\n" +
"demo.launch()   # add share=True for a temp public URL locally\n" +
"```\n\n" +
"## Deploy on HF Spaces (permanent URL)\n" +
"1. New HF Space → Gradio SDK.\n" +
"2. Push `app.py` + model weights + `requirements.txt` to the Space repo.\n" +
"3. Space builds and deploys automatically.\n" +
"4. URL: `huggingface.co/spaces/yourname/your-cv-demo`.\n\n" +
"## Why HF Spaces over Streamlit Cloud for CV\n" +
"Streamlit Cloud is better for dashboards. HF Spaces is where the ML community looks — it embeds in HF Hub model pages, shows model cards natively, and is the standard venue for visual ML demos."
      ),
      L("The blog post + what you've built across W32-W34",
"## The CV blog post structure (~1000 words)\n" +
"```text\n" +
"1. Hook — '<model> classifies <task> at X% accuracy in 30 min on Colab'\n" +
"2. Architecture primer — CNN vs ViT in 2 short paragraphs\n" +
"3. Transfer learning — why it mattered for your specific dataset size\n" +
"4. Training details — epochs, LR, which layers frozen\n" +
"5. Comparison table — baseline / ResNet50 / ViT + training time\n" +
"6. Confusion matrix insight — which classes get confused and why\n" +
"7. Live demo URL (HF Spaces)\n" +
"8. FastAPI endpoint — mention it exists + GitHub link\n" +
"9. What I'd improve — 2-3 honest weaknesses\n" +
"```\n\n" +
"## What you now have across the three specialty weeks\n" +
"- **W32**: LoRA-fine-tuned LLM adapter, published on HF Hub\n" +
"- **W33**: RAG system with hybrid search + citations + Streamlit demo\n" +
"- **W34**: CNN + ViT comparison + FastAPI inference + Gradio demo\n\n" +
"Three shipped, public, modern ML artifacts. Most entry-level candidates show zero. You've shipped three.\n\n" +
"## Tag and ship\n" +
"```bash\n" +
"git add cv/\n" +
"git commit -m \"CV: ResNet50 + ViT on <dataset>, FastAPI + Gradio shipped\"\n" +
"git tag cv-shipped\n" +
"git push && git push --tags\n" +
"```"
      ),
      S([
        { prompt: "Gradio gives you a working image-upload UI + public URL in under 10 lines.", answer: true, whenRight: "Right — purpose-built. Flask would need 100+ lines of HTML/JS to match.", whenWrong: "Yes — right tool for the job. 10 lines, working demo, public URL." },
        { prompt: "HF Spaces is the better host for a CV model demo compared to Streamlit Cloud.", answer: true, whenRight: "Right — Spaces is where the ML community looks; Gradio is native there; model cards surface automatically.", whenWrong: "Yes — Spaces for model demos; Streamlit Cloud for dashboard-style apps. Different audiences." },
        { prompt: "Three specialty-week artifacts (LoRA, RAG, CV) across W32-W34 is a rare combination on a 2026 DS portfolio.", answer: true, whenRight: "Right — most candidates show none. All three cover the most-demanded modern ML skills. Rare and directly hireable.", whenWrong: "Yes — rare = differentiating. Three shipped modern-ML artifacts in a portfolio is the bar that lands interviews." }
      ]),
      E("Your turn — Gradio + ship","[PRODUCE] 1. Build `cv/app.py` (Gradio Interface: image input → top-3 label dict).\n2. Deploy to HF Spaces (Gradio SDK). Get the public URL.\n3. Write the blog post; publish on dev.to.\n4. Commit + tag:\n`git add cv/ && git commit -m 'CV shipped' && git tag cv-shipped && git push --tags`\n\nPASS:\n[x] FastAPI /predict endpoint works locally\n[x] Gradio demo live at huggingface.co/spaces/yourname/...\n[x] CNN vs ViT accuracy comparison in cv/COMPARISON.md\n[x] Confusion matrix saved to cv/confusion_matrix.png\n[x] Blog post published on dev.to\n[x] cv-shipped tag pushed")
    ])
  ]
};

/* ═══════════════════════════════════════════════════════════
   VALIDATE + WRITE
   ═══════════════════════════════════════════════════════════ */
const newWeeks = [W30, W31, W32, W33, W34];
newWeeks.forEach((w) => {
  if (w.days.length !== 7) throw new Error(`W${w.number}: need 7 days, got ${w.days.length}`);
  if (!w.concept_check || w.concept_check.length !== 3) {
    throw new Error(`W${w.number}: concept_check must have 3 entries`);
  }
  w.days.forEach((d) => {
    const k = d.items.map((i) => i.kind);
    if (!k.includes('lesson')) throw new Error(`W${w.number} D${d.number}: missing lesson`);
    if (!k.includes('swipe'))   throw new Error(`W${w.number} D${d.number}: missing swipe`);
    if (!k.includes('exercise')) throw new Error(`W${w.number} D${d.number}: missing exercise`);
  });
});

ds.weeks.splice(29, 5, ...newWeeks);

fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log(`SUCCESS — DS W30-W34 rebuilt. Total weeks: ${ds.weeks.length}`);