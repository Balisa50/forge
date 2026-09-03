/**
 * v2 rewrite batch 6: data-science Weeks 28-32
 *  W28: Capstone v0.1 — Pick + scope
 *  W29: Capstone v0.2 — Build
 *  W30: Capstone v1.0 — Ship + roadmap done
 *  W31: Portfolio + interview prep
 *  W32: LLM Era — Fine-tuning with LoRA + PEFT
 */

import { rewriteWeek } from "../rewrite-week";

// ─── W28 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 28, {
  context: `You have shipped two complete projects. TaxiPulse proved you can load and analyse a large public dataset. Reddit Sentiment proved you can build a full NLP pipeline from labelling to production API. Energy Forecast proved you can do time series work end to end. Three projects, three domains, a real skill stack. The capstone is the fourth -- the one you choose entirely yourself.

Choosing is the hard part. Not because there are no good ideas, but because the instinct is to choose the most impressive-sounding one. Resist that. The right capstone topic is the intersection of three things: a domain where you have genuine curiosity, a publicly available dataset that you have already downloaded and confirmed contains real signal, and a problem where you can define "done" in a sentence. A capstone on climate data sounds better than a capstone on Airbnb pricing until you realise climate data requires domain expertise you do not have, and three weeks in you are still arguing with netCDF files.

The spec document is the week's main deliverable. Not code. A SPEC.md that states the question in one sentence, names the dataset and where you got it, defines the baseline you will beat, lists what is explicitly out of scope, and describes what the v1.0 output will look like. The out-of-scope list is the one most people skip and the one that most determines whether the project finishes on time. If you write "I will not build a real-time API" and "I will not train on data after 2022" before you start, you cannot scope-creep past them without noticing.

The prototype is the other deliverable. Before committing to three weeks of work, you run a 2-hour proof of concept: load the dataset, run one basic model, check whether there is detectable signal. If the naive baseline and a simple model produce identical results, either the dataset is wrong, the question is wrong, or the task is harder than it looks. Finding that out in 2 hours costs nothing. Finding it out in week 2 of the capstone costs you the capstone.

By Sunday: a SPEC.md that a stranger could read and understand, a prototype notebook with at least one real result showing detectable signal, and a written paragraph stating why you chose this topic over the other two you considered.`,

  pre_flight: `Write down three capstone ideas before you evaluate any of them. For each, write the question in one sentence and name the dataset. Then, for each idea, spend 15 minutes finding the actual data file and opening it. The idea that survives contact with the actual data -- real column names, real file size, real format -- is the one worth building. Ideas that cannot survive 15 minutes of data inspection should not survive 3 weeks of capstone.`,

  mastery_questions: [
    `Write SPEC.md. Required sections: Question (one sentence), Dataset (source URL, file size, time range, licence), Baseline (the dumbest model that knows the domain -- what is it and what metric does it produce?), Out of scope (at least 3 explicit exclusions), Definition of done (what does v1.0 look like -- a notebook? a dashboard? an API? a blog post?), Why this topic (one paragraph, honest). Paste the file. A spec that takes more than 5 minutes to read is too long. A spec that leaves the baseline undefined is not a spec.`,
    `Download the dataset and open it. Run df.shape, df.dtypes, df.describe(), and df.isna().sum(). Paste all four outputs. Write one sentence for each suspicious thing you see: a column with 40% nulls, a max value that is 100x the mean, a date column that is stored as object instead of datetime. These are the issues that will bite you in week 29 -- document them now while you are still in exploration mode and not under pressure to ship.`,
    `Implement the baseline. It should be the simplest thing that knows about the domain: mean prediction, most-frequent-class, persistence, or a one-feature linear regression. Compute the baseline's metric on a proper train/test split. Paste the metric. This number is the floor. Every model you build in week 29 is only interesting if it beats it. If it does not beat the baseline, the baseline is what you deploy.`,
    `Run the prototype: load the data, run one real model (not the baseline), evaluate it on the test set, paste the metric. Is there a gap between the baseline and the model? If the gap is less than 1%, write one sentence about whether that is a data problem, a feature engineering problem, or a genuinely hard task. If the gap is 20%+, write one sentence about whether that improvement is real or a sign of data leakage.`,
    `Write a one-paragraph "why this topic over the alternatives" section in your SPEC. Name the two ideas you did NOT choose, and for each write one honest sentence about why you passed. "The climate data was 50GB and required domain expertise I do not have" is an honest reason. "I thought it was not impressive enough" is also an honest reason and worth writing -- it helps you notice if you are choosing based on appearance rather than tractability.`,
  ],

  common_mistakes: [
    `Choosing a capstone topic based on how it sounds rather than whether the data is tractable. "Predicting stock prices" sounds impressive and has infinite public data. It also has the lowest signal-to-noise ratio of any domain in data science, and a model that beats random chance on stock returns is genuinely rare. Choose a domain where the signal is real and findable.`,
    `Skipping the prototype and going straight to building. The prototype exists to validate that the task is solvable in 3 weeks. Finding out in week 29 that the data does not contain the signal you assumed is a project-ending discovery. Finding it out in the prototype is a 2-hour lesson.`,
    `Writing a spec without an explicit baseline. Without a baseline, you cannot know whether your model is doing anything useful. "I will build a classifier" without "the majority-class baseline is 73%" means you have no floor and no way to evaluate success.`,
    `Leaving the out-of-scope section blank or vague. "I will not do anything too complicated" is not an out-of-scope list. "I will not train on data after 2021, I will not build a real-time API, I will not handle multi-label classification" is. Explicit exclusions are the mechanism that keeps capstones from expanding until they never finish.`,
    `Choosing a dataset you cannot get. Some datasets require institutional access, data sharing agreements, or payment. Confirm the data is downloadable and usable before writing the spec. A spec built around a dataset you cannot access is just planning fiction.`,
  ],

  debug_help: `The most common stuck point this week is choosing the topic. If you have been going back and forth for more than 2 hours, use this rule: pick the idea where you have already found the data file and can describe what the first row looks like. Everything else is imagination. The second most common stuck point is a prototype that produces no signal. Before concluding the task is too hard, check three things: are you using the right metric (accuracy on an imbalanced dataset looks fine while the model fails on the minority class), is your train/test split correct (no future leakage), and have you tried at least one feature beyond the raw input (interaction terms, lag features, time-based features). If all three are correct and there is still no signal, that is real information -- consider a different question or a different dataset.`,

  ai_assist: `Use Claude to stress-test your spec. Paste the SPEC.md and ask "what assumptions am I making that could be wrong, and what would I discover in week 29 that would invalidate this spec?" The answers will surface the risks you have not thought about. Do NOT use Claude to generate capstone ideas for you. The ideas it generates will be technically valid and personally meaningless -- a capstone built on genuine curiosity produces a better blog post and a more convincing interview answer than one picked for technical impressiveness.`,

  stretch: [
    `Find one person who has built a similar project (check Kaggle, GitHub, or Medium) and read their write-up. Note one thing they did that you plan to do differently and why. Knowing the existing work in your domain is what separates a project from a contribution.`,
    `Write a risk register for your capstone: three things that could go wrong, how likely each is (low/medium/high), and what you would do if they happened. This is not pessimism -- it is the planning discipline that makes projects finish on time.`,
    `Check whether your chosen dataset has a Kaggle competition associated with it. If it does, look at the top public kernel approaches. You are not copying -- you are scoping: now you know what is possible at the ceiling, and you can plan your effort accordingly.`,
  ],
});

// ─── W29 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 29, {
  context: `The spec is signed. The prototype showed signal. This week you build the real thing.

"Build" means something specific here. It does not mean running every model in sklearn until one wins. It means: clean the data properly and document every decision, engineer the features that your domain knowledge says matter, train a baseline first and record the number, then try one or two more complex models and compare them honestly. The pipeline should be a sequence of reproducible steps -- a stranger who clones your repo should be able to run it top-to-bottom and get your exact numbers.

The most common way capstones fail at this stage is scope expansion. The data reveals something interesting that is adjacent to the original question, the curiosity pulls you toward it, and by Thursday you are 60% through a different project than the one in the spec. The spec exists to resist this. When the adjacent thing looks interesting, write it in the stretch section and keep building the thing you committed to. If the adjacent thing is actually more interesting, change the spec explicitly and document the pivot -- do not just drift.

Honest evaluation is the non-negotiable. The comparison table must include: your baseline metric (from last week), at least one more complex model's metric, and a written sentence for each model about where it fails. A table that only shows accuracy on a balanced test set, for a project that matters because of its imbalanced minority class, is not honest evaluation. The metric you report should be the one that measures the thing the stakeholder actually cares about.

By Sunday: a clean, commented notebook with data cleaning, feature engineering, and model comparison documented. A comparison table with at least two models plus the baseline, with honest interpretation. And a written paragraph -- in the notebook -- about what you would do differently with two more weeks.`,

  pre_flight: `Before writing any code, re-read your SPEC.md and confirm that your definition of done is still achievable by Sunday. If the data cleaning is taking longer than expected (it almost always does), decide now which part of the modelling you will simplify to compensate. Making that trade-off decision on Monday is better than discovering on Saturday that you ran out of time.`,

  mastery_questions: [
    `Complete the data cleaning pipeline. For each column, document the decision: kept as-is, transformed (how and why), or dropped (why). Paste the summary as a markdown table with columns: column_name, action, reason. The reason for dropping a column should be more specific than "it was not useful" -- "dropped because 65% null and imputation would introduce more noise than signal" is a defensible sentence.`,
    `Engineer at least two features that your domain knowledge suggests matter. If this is a time series project, lag features and rolling averages. If this is a text project, length, punctuation density, or topic-specific keyword counts. If it is tabular, interaction terms or binned continuous variables. Paste the feature engineering code and explain in one sentence per feature why you expected it to help.`,
    `Train the baseline and at least one more complex model. For each: the model type, the hyperparameters (even if defaults -- record them), the train-set metric, and the test-set metric. Paste the comparison table. If your more complex model scores lower on the test set than the baseline, do not delete the result -- document it and write one sentence about why (overfit? wrong model class? feature engineering issue?).`,
    `Find one specific case where your best model fails. A false negative, a large prediction error, a category it systematically misclassifies. Paste that case. Write one sentence about what the model missed and one sentence about whether that failure mode matters for the real-world use case. If the failure mode is "it cannot predict demand during unprecedented heat waves," that is a meaningful limitation. If it is "it occasionally mispredicts by 0.5%," that is probably acceptable.`,
    `Write the "what I would do with two more weeks" paragraph. It should name at least two specific things: one that would improve accuracy (a feature you did not have time to engineer, a model you did not have time to try), and one that would improve the deployment (an API, a monitoring layer, a scheduled retraining job). This paragraph is not padding -- it is the honest roadmap that makes the capstone a professional artefact instead of a finished homework assignment.`,
  ],

  common_mistakes: [
    `Reporting train-set accuracy instead of test-set accuracy. A model with 99% train accuracy and 62% test accuracy is an overfit model, not a good model. Always report test-set metrics in the comparison table, and always report train-set metrics alongside them so the gap is visible.`,
    `Using accuracy as the only metric for an imbalanced classification task. If 5% of your rows are the minority class, a model that always predicts majority gets 95% accuracy. Report precision, recall, and F1 for each class, and make the minority-class metrics the headline numbers.`,
    `Not committing the cleaned data or the intermediate artifacts to the repo. If your notebook requires 4 hours of cleaning before you can run the model, the repo is not reproducible. Either commit the cleaned data (if it is small enough) or write a documented cleaning script that can be re-run.`,
    `Scope-expanding midweek without updating the spec. If you pivoted the question, update SPEC.md to reflect it. A spec that no longer matches the notebook is a sign that the project lost discipline, and that disconnect is visible to anyone reviewing the repo.`,
    `Skipping the failure-case analysis. A capstone that only shows the wins is less convincing than one that shows the wins and honestly names where it fails. Every production model at every company has known failure modes. Knowing yours is a sign of maturity.`,
  ],

  debug_help: `The most common blocker midweek is a model that will not train -- usually a data type issue (a string column in a numeric pipeline), a dimensionality issue (too many one-hot encoded categories for the available data), or a memory issue (the full dataset does not fit in RAM). For data type issues: run df.dtypes and trace each non-numeric column through your pipeline. For dimensionality: use low-cardinality encoding or drop rare categories. For memory: sample the data for exploration, then run the full training on a cloud machine or overnight. Do not let any of these blockers eat more than 90 minutes before asking for help.`,

  ai_assist: `Use Claude as a code reviewer for your feature engineering. Paste each new feature and ask "is there a data leakage risk here?" -- for example, if your feature uses information from the future that would not be available at prediction time, Claude will usually catch it. Do NOT ask Claude to do the feature engineering. The insight that "average demand from the previous 7 days predicts tomorrow's demand" needs to come from your understanding of electricity consumption, not from a language model generating plausible-sounding features.`,

  stretch: [
    `Write an automated pipeline that runs the full notebook end-to-end in a single command (make run or python pipeline.py). Reproducibility is not a nice-to-have -- it is what separates a project from a script.`,
    `Try one model you have never used before -- XGBoost, CatBoost, or a Bayesian model -- and add its results to the comparison table. New models are most instructive when you read the documentation for the key hyperparameters before tuning, rather than grid-searching blindly.`,
    `Calculate the Shapley values for your best model's predictions (SHAP, as in week 16). The global importance plot for your capstone's feature set should tell you something surprising about which features actually matter. If it does not surprise you, the result is still useful confirmation.`,
  ],
});

// ─── W30 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 30, {
  context: `This is the last week of the structured roadmap. You have done 30 weeks of deliberate practice -- three complete projects, a skill stack that covers the full pipeline from data loading to production deployment, and a set of instincts about when results smell wrong that only come from having been wrong before.

The capstone ships this week. Same pattern as weeks 20 and 27: blog post, demo video, public dashboard or API or notebook -- whatever your definition of done from the spec says. The difference is that this post covers the full arc, not just one project. Three projects, three domains, three deployments. The narrative that connects them is worth writing: what is the through-line? What did you learn in project 1 that changed how you approached project 3?

The roadmap-level retrospective is different from the weekly retros. It is longer, more honest, and more useful for what comes next. The questions worth answering: which week surprised you the most (in either direction)? Which skill turned out to be harder than you expected? Which one turned out to be more useful than you expected? What would you tell someone starting this roadmap tomorrow? That last question is the hardest to answer honestly, because the honest answer is not motivational -- it is specific about the parts that are slow and frustrating and worth pushing through anyway.

The four named projects on your CV are not the product of this roadmap. They are the evidence of it. The product is the instinct you built -- the slightly suspicious relationship with data, the habit of checking results against priors, the reflex to ask "compared to what?" every time someone shows you a metric. That is not something you can put on a resume. It shows up in how you work, and it shows up quickly to anyone watching you work.

By Sunday: capstone fully shipped, all three project blog posts linked from a central README or portfolio page, roadmap-level RETRO.md written and committed, and one real job application submitted.`,

  pre_flight: `Before writing anything, re-read the week-20 retro (Reddit Sentiment) and the week-27 retro (Energy Forecast). Note what appears in both. The recurring pattern -- the thing that slowed you down on project 2 and still slowed you down on project 3 -- is the one worth changing before you start applying for roles.`,

  mastery_questions: [
    `Ship the capstone: deploy the model (Streamlit dashboard, FastAPI endpoint, or polished public notebook -- whatever the spec promised), publish the blog post, record the demo video. Paste all three URLs. The definition of shipped is "a stranger can use it without you in the room." Test that definition by sending the URL to someone who has not seen the project and watching what they do.`,
    `Write the roadmap-level RETRO.md. Required sections: most surprising week (and why), hardest skill (specifically -- not "ML was hard" but "getting SHAP to work on a transformer was harder than expected because..."), most useful skill in hindsight (the thing you thought was boring that turned out to matter constantly), and what you would tell someone starting this roadmap tomorrow. Paste the file. Vague is not useful here. Specific is.`,
    `Update the central README or portfolio page to link all four projects: TaxiPulse, Reddit Sentiment, Energy Forecast, Capstone. For each project, one sentence of description and one sentence of the most interesting finding. A stranger should be able to read this page in 3 minutes and have an accurate picture of what you built and why it matters. Paste the README.`,
    `Submit one real job application. Not a wishlist application -- a real one, for a role where you meet at least 70% of the listed requirements. Paste the company name and role title (not the full application, just the reference). The first application is the hardest. The habit of applying is the only thing that produces interviews.`,
    `Write a one-paragraph answer to the interview question "walk me through a project you're proud of." Use one of your four projects. The answer should cover: what the question was, what the data was, what you tried that did not work and why, what you shipped, and what you would do differently. Time yourself reading it aloud. It should be 90 seconds, not 4 minutes. Paste the paragraph.`,
  ],

  common_mistakes: [
    `Not submitting the job application because the portfolio is not quite polished enough. The portfolio will never be perfectly polished. Applications submitted today with an 85% polished portfolio produce more interviews than applications submitted next month with a 95% polished one.`,
    `Writing a roadmap retro that only covers the wins. The retrospective is for you, and the useful information is in what was hard. A retro that only celebrates completion is a missed opportunity to calibrate for the next 30 weeks.`,
    `Describing your projects on the portfolio page in technical terms without stating what they found. "Built a Prophet time series model" is less useful than "Built a time series model that predicted AEP electricity demand with 14% lower MAE than the classical baseline." The specific finding is what makes someone want to read more.`,
    `Treating "done" as the end. The capstone shipping is the beginning -- of applications, of conversations, of the next phase. The roadmap completing is not an arrival, it is a baseline.`,
    `Not practicing the 90-second project summary out loud. Reading it in your head and saying it in an interview are completely different experiences. Say it out loud, to a wall if necessary, at least three times before the first interview.`,
  ],

  debug_help: `The most common blocker this week is the job application. "I am not ready" is rarely accurate -- it is almost always a conflict between what you know you can do and what the job listing says they want. Most job listings describe the perfect candidate, not the minimum viable one. If you can do 70% of the listed tasks, you are a reasonable candidate. The way you find out whether the other 30% is a dealbreaker is by applying, not by waiting until you have learned it. The application is the experiment.`,

  ai_assist: `Use Claude to review your 90-second project summary. Ask it: "Does this answer the question 'walk me through a project you're proud of' in a way that would satisfy a hiring manager at a data science role?" Then ask it to flag any jargon that a non-technical hiring manager would not understand. The goal is an answer that is technically honest and humanly accessible -- not an answer that impresses another data scientist.`,

  stretch: [
    `Set up a simple portfolio website (GitHub Pages, Vercel, or any static host) that lists the four projects with screenshots and links. A URL you can put in your email signature is worth more than a polished README that nobody visits unprompted.`,
    `Write a cold outreach message to one person whose career trajectory matches where you want to be in 3 years. Ask one specific question -- not "can you help me" but "I'm curious how you approached X when you were starting out." The response rate on specific questions to real people is much higher than you expect.`,
    `Read "Cracking the Data Science Interview" or the equivalent resource for your target role type. The interview formats (case studies, take-home assignments, SQL tests, ML design rounds) are predictable. Knowing the format in advance is the difference between being surprised and being prepared.`,
  ],
});

// ─── W31 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 31, {
  context: `The roadmap is done and the projects are shipped. Now the work is different: making the evidence of that work visible to the people who are deciding whether to interview you.

This is not self-promotion. It is information design. A hiring manager who spends 30 seconds on your GitHub profile will form an impression whether you design it or not. A LinkedIn that says "Data Scientist" with no posts and a blank about section signals one thing. A profile that links to three live projects, has a summary that describes what you build and why, and shows posts about your actual work signals something else. You are not changing what you built. You are making it legible.

The portfolio site is the single URL that ties everything together. It does not need to be beautiful. It needs to load fast, link to all four projects with one sentence each, and have a contact method. GitHub Pages with a simple HTML template takes two hours and looks professional enough. The engineers who spend three weeks building the portfolio site instead of applying for jobs are making the wrong trade-off.

LinkedIn posts about your projects work differently than you probably expect. Data science content on LinkedIn gets more reach than almost any other technical topic because the audience for "I built a model that predicted electricity demand" extends beyond engineers -- it includes product managers, recruiters, and business leads who understand electricity but not ML. A 200-word post with one chart image gets read. A 2000-word thread does not. Three posts, one per project, scheduled over three weeks, costs less than two hours total.

By Sunday: a live portfolio URL, a polished LinkedIn profile with a summary and at least one post, pinned GitHub repos for all four projects, and a recorded answer to at least three common interview questions. And one more real application submitted.`,

  pre_flight: `Open your LinkedIn profile and your GitHub profile side by side. Read them as a stranger would -- someone who does not know you and has 30 seconds. Write down one thing that is unclear and one thing that is missing from each. Fix those four things before doing anything else this week. The quick fixes (headline, pinned repos, bio) are the highest-leverage 30 minutes of this week.`,

  mastery_questions: [
    `Build and deploy the portfolio site. It must include: your name, a one-sentence summary of what you build, links to all four projects with one-sentence descriptions, and a contact method (email or LinkedIn). Paste the URL. Open it in an incognito tab on your phone. If it loads slowly or breaks on mobile, fix it before moving on. Most recruiters open portfolio links on phones first.`,
    `Update your LinkedIn profile. Summary section: 3-4 sentences covering what you do, what you have built, and what you are looking for. Featured section: link to the portfolio site. Add all four projects to the Experience or Projects section with one bullet each describing what you built and the key result. Paste your profile URL and confirm the summary is visible without clicking "see more."`,
    `Write and publish one LinkedIn post about one of your four projects. Maximum 200 words. Include one chart or screenshot. End with one specific finding, not a question and not a call to action. ("The LSTM finished third on this dataset, behind ARIMA. More data or more time would change that -- but on 14 years of hourly readings, classical won.") Paste the post text. The post does not need to go viral. It needs to exist and be findable.`,
    `Pin the four project repos on GitHub. For each, add a README that includes: what the project does (one sentence), how to run it, and what it found. Add a screenshot or chart as the first image. Paste the URLs of all four pinned repos. A recruiter or technical interviewer who opens your GitHub and sees four well-documented repos with screenshots makes a different initial judgement than one who sees 40 unnamed repos with no READMEs.`,
    `Record yourself answering three interview questions out loud. (1) "Walk me through a project you're proud of." (2) "Tell me about a time your model produced a result that surprised you." (3) "How do you decide when a model is good enough to ship?" Time each answer -- aim for 60-90 seconds. You do not need to share the recording. Write down one thing you would change about each answer after watching it back.`,
  ],

  common_mistakes: [
    `Spending the week perfecting the portfolio site instead of applying. The portfolio site is done when it is live and links to your projects. Every hour past that point has diminishing returns. Apply first, improve the site as you go.`,
    `Writing LinkedIn posts that describe what you did instead of what you found. "I built a sentiment classifier this week" is a project update. "Reddit posts with the word 'interview' skew strongly negative -- apparently nobody enjoys them" is a finding. Findings get engagement; updates do not.`,
    `Pinning repos that do not have READMEs. An empty GitHub repo with a great project name is worse than no repo -- it wastes the 30 seconds of attention a recruiter was willing to give. Do not pin it until it has a README.`,
    `Practicing interview answers by reading them, not saying them. The answer that sounds fine in your head often runs for 4 minutes when said aloud, or stalls on a detail you thought you understood. Say the answers out loud, time them, and iterate.`,
    `Listing "Python, pandas, scikit-learn, PyTorch, Prophet, MLflow, Docker, AWS, BigQuery, Streamlit, FastAPI" as skills without linking them to specific projects. Skills without evidence are noise. Link each skill to the project where you used it ("PyTorch -- LSTM time series model, Energy Forecast v0.4").`,
  ],

  debug_help: `The interview answer that most people struggle with is "tell me about a time your model produced a result that surprised you." Most people either say nothing surprised them (wrong -- something always does) or describe a surprise that makes them sound naive rather than curious. The right structure: name the surprise, explain what you expected, explain what you found, explain what you learned from the gap. The gap between expectation and result is exactly what you practised in pre-flight every week. You have four projects worth of examples. Pick the one where the surprise was most informative.`,

  ai_assist: `Use Claude to review your LinkedIn summary. Ask it: "Does this summary tell a clear story about what this person builds and why someone should interview them? What is missing?" Then fix the gaps. Do NOT ask Claude to write the summary from scratch -- a Claude-written summary sounds like every other Claude-written LinkedIn summary, which is detectable and impersonal.`,

  stretch: [
    `Apply to three more roles this week. Track them in a spreadsheet: company, role, date applied, response (update as they come in). The spreadsheet is the feedback mechanism -- response rate by role type tells you whether you are targeting the right level and domain.`,
    `Do one mock technical interview via Pramp, Interviewing.io, or with a friend who is also job searching. Reading about interviews and doing an interview are not the same preparation. One real mock interview is worth ten hours of preparation reading.`,
    `Write a "value proposition" sentence: one sentence that explains what you offer that other candidates at your level probably do not. It might be domain knowledge (energy, healthcare, logistics), a technical combination (NLP + time series + production deployment), or a project outcome (a public-facing model that a stranger can actually use). That sentence belongs in every cover letter.`,
  ],
});

// ─── W32 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 32, {
  context: `The four projects in your portfolio cover the core pipeline: tabular analysis, NLP, time series, production deployment. This week starts the advanced track, and the first topic is the one that has reshaped the field more than anything in the last five years: fine-tuning large language models.

The honest version of "fine-tuning an LLM" is not what the blog posts make it sound like. Full fine-tuning of a 7B-parameter model requires 80GB of GPU memory and weeks of training time on hardware you do not have access to for free. LoRA (Low-Rank Adaptation) is the answer the research community converged on: instead of updating all 7 billion parameters, you add a small set of adapter matrices that are a few megabytes in total, train only those, and merge them back at inference time. The base model weights are frozen. The adapter weights are everything that makes "your" model different from the base.

QLoRA (Quantized LoRA) goes one step further: it quantizes the frozen base model weights to 4-bit precision, which cuts the memory footprint roughly in half. A 7B model that normally needs 28GB of GPU memory can run in 8GB with QLoRA. That is the difference between "requires an A100" and "runs on a consumer GPU or a free Colab instance."

The task you choose for fine-tuning matters more than which model you pick. The most instructive tasks are narrow and verifiable: converting natural language questions into SQL queries for a specific database schema, classifying Reddit posts into specific categories with your own taxonomy, or extracting structured data from a specific type of unstructured text. Wide, vague tasks ("make the model better at reasoning") are neither trainable in a week nor evaluatable at the end of it.

By Sunday: a LoRA adapter fine-tuned on a task you chose, evaluated against the base model on at least 50 held-out examples, and an honest 3-row comparison table: base model (zero-shot), base model (few-shot prompted), fine-tuned. The fine-tuned model does not always win. Document that honestly if it does not.`,

  pre_flight: `Before picking a model, check what fits in your available GPU memory. Run nvidia-smi (on Colab or locally if you have a GPU) and note the VRAM. Rule of thumb: 4-bit quantised, a 7B model needs roughly 6-8GB, a 13B needs 12-14GB. If you are on Colab free tier (15GB), a 7B model with QLoRA fits comfortably. If you are on CPU only, use a 1-3B model or accept that training will be slow. Write down your available VRAM and the model size you will use before opening any code.`,

  mastery_questions: [
    `Choose your fine-tuning task and prepare 200-500 training examples. Format them as instruction-following pairs: {"instruction": "...", "input": "...", "output": "..."}. Paste 3 sample examples. The output for each should be deterministic and verifiable -- "the correct SQL query" or "the correct label" -- not open-ended text. Open-ended tasks cannot be automatically evaluated, which means you cannot know if fine-tuning worked without reading every output by hand.`,
    `Load a base model with 4-bit quantization using BitsAndBytesConfig. Paste the config and the model load call. Run model.get_memory_footprint() before and after quantization and paste both numbers. The difference should be roughly 4x -- the model that needed 14GB now needs 3-4GB. Understanding this number is what lets you plan GPU usage instead of hoping nothing crashes mid-training.`,
    `Configure LoRA with PEFT: LoraConfig with r=16 (rank), lora_alpha=32, target_modules pointing at the attention layers. Paste the config. Now run print(model.num_parameters()) and print(model.num_parameters(only_trainable=True)). Paste both numbers. The ratio of trainable to total parameters should be around 0.1-1% -- you are training a tiny fraction of the model's weights. That fraction is the adapter.`,
    `Train for 1-3 epochs using the Trainer or SFTTrainer. Paste the training loss at epoch 1 and epoch 3. If the loss at epoch 3 is still falling steeply, run one more epoch. If it has plateaued, stop -- additional epochs on a small dataset overfit the adapter to your training examples. Save the adapter weights (not the full model) with model.save_pretrained('./my-lora-adapter'). Paste the file size. It should be 10-100MB, not 14GB.`,
    `Evaluate on 50 held-out examples: zero-shot base model, few-shot base model (3 examples in the prompt), fine-tuned. For each, compute the metric that matches your task (exact match for SQL, F1 for classification, human-rated quality for generation). Paste the 3-row comparison table. If fine-tuned loses to few-shot, write one sentence about why -- usually either too few training examples, too many epochs (overfit), or a task where the base model already had strong priors.`,
  ],

  common_mistakes: [
    `Training on the full model instead of just the LoRA adapters. If model.num_parameters(only_trainable=True) equals model.num_parameters(), the LoRA config was not applied correctly. The whole point of LoRA is that only the adapters train -- check with get_peft_model() and print_trainable_parameters().`,
    `Not freezing the base model before training. Without model.enable_input_require_grads() and the PEFT wrapping, gradients flow through the entire model. On a 7B model with 15GB of VRAM, this causes an OOM crash on the first backward pass.`,
    `Using training examples with inconsistent formatting. The model learns the pattern of your examples -- including any inconsistencies. If some examples end with a period and others do not, or use different delimiters, the model will produce outputs with unpredictable formatting. Standardise your template before training.`,
    `Evaluating only on training data. The fine-tuned adapter is very good at reproducing your training examples. It may or may not generalise to new inputs with the same task structure. The held-out evaluation is what tells you which it is.`,
    `Saving the full merged model instead of just the adapter. The merged model is 14GB. The adapter is 50MB. For almost all use cases, you load the base model and merge the adapter at runtime -- you do not need to store the merged version. Committing 14GB to Git is an uncomfortable conversation with GitHub.`,
  ],

  debug_help: `Three specific issues. First: "CUDA out of memory" during training. Reduce per_device_train_batch_size to 1 and set gradient_accumulation_steps=8 to simulate a batch size of 8 without the memory cost. Second: training loss is NaN from step 1. Almost always means your inputs contain tokens that map to padding IDs treated as labels -- check that your data collator is masking the instruction tokens (labels=-100 for the input portion so loss is only computed on the output). Third: the fine-tuned model generates incoherent outputs. Usually means the merge between base and adapter went wrong -- check that you loaded the adapter on top of the exact same base model checkpoint you trained on, not a different quantisation level.`,

  ai_assist: `Use Claude to generate the first 20 training examples for your chosen task. Give it your task description and the output format, and ask for 20 diverse examples. Then manually verify each one -- LLMs generating training data for LLMs can introduce subtle errors that become systematic biases. Check at least the first 10 by hand. After that, use the generated examples as a template to write 30 more yourself. The ratio of human-verified to AI-generated examples matters: a dataset that is 100% AI-generated trains the adapter to reproduce AI behaviour, not the target behaviour.`,

  stretch: [
    `Merge the adapter into the base model and push the merged model to Hugging Face Hub. Now anyone can load your fine-tuned model with AutoModelForCausalLM.from_pretrained("yourname/model-name"). That is a published LLM -- not a research paper, an actual artefact.`,
    `Try the same task with a different base model (Mistral vs Llama, for example) and compare fine-tuned performance. Base model choice matters more than LoRA hyperparameters for most tasks. Knowing this saves you from spending hours tuning rank when switching the base model would be the right move.`,
    `Read "LoRA: Low-Rank Adaptation of Large Language Models" (Hu et al., 2021). It is 9 pages. The math in Section 4 is worth understanding: why rank decomposition works, and why the rank hyperparameter controls the trade-off between adapter expressiveness and parameter efficiency. Knowing the paper is knowing why the defaults are the defaults.`,
  ],
});
