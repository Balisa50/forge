/* Week 9 - Analytics and Data (Phase: Retention, Data and AI) */
module.exports = {
  number: 9,
  title: "Analytics and Data",
  phase: "Retention, Data and AI",
  commitment_hours: "7, 11",
  context:
    "You have built a lot: strategy, content, social, SEO, ads, email. But how do you *know* what is working? This week is the skill that turns a marketer from a guesser into a professional: analytics. 'Half my marketing budget is wasted, I just don't know which half' is the old joke, analytics is the answer to it. Measuring what happens, understanding why, and using the data to decide what to do next is what separates marketers who get results (and get hired) from those who just post and hope.\n\n" +
    "For Adwoa's Kitchen, analytics answers the questions that actually matter: Which channel brings the most customers? Which content converts? Are the ads profitable? Where do people drop off? Without data, every decision is a guess. With it, you double down on what works and cut what does not, and you can *prove* the value of your marketing to Adwoa (or to a future employer).\n\n" +
    "By Sunday you will have set up measurement (Google Analytics 4), built an executive marketing dashboard (in Looker Studio), and written an insights report that turns the numbers into clear recommendations. That dashboard + report is case study #9, and it is the skill that makes all your other work measurable and defensible.",
  concept_check: [
    {
      q: "Adwoa asks 'is our marketing working?'. Why is 'we got 10,000 followers' an incomplete answer?",
      choices: [
        "10,000 is too few",
        "Followers is a vanity metric, it does not show whether marketing drove leads, sales, or revenue. You need metrics tied to business outcomes",
        "She should not ask about results",
        "Followers always equal sales",
      ],
      correct: 1,
      explain: "Vanity metrics (followers, likes, impressions) feel good but do not prove business impact. Actionable metrics tie to outcomes: leads, orders, revenue, cost per acquisition, conversion rate. 'Working' means driving business results, not just attention.",
    },
    {
      q: "What does 'conversion rate' measure, and why is it so useful?",
      choices: [
        "How many followers you have",
        "The percentage of people who take a desired action (e.g. of website visitors, how many order), it reveals how effectively traffic turns into results",
        "The total number of website visits",
        "How much you spent on ads",
      ],
      correct: 1,
      explain: "Conversion rate = (people who converted / total people) x 100. If 100 visit and 3 order, that is a 3% conversion rate. It tells you how well you turn attention into action, and improving it multiplies results without needing more traffic.",
    },
    {
      q: "What is the point of an 'executive dashboard' versus just looking at each tool's analytics?",
      choices: [
        "It looks fancier",
        "It pulls the key metrics from all channels into ONE clear view focused on what matters, so anyone can see performance at a glance and make decisions, without digging through five tools",
        "It hides the bad numbers",
        "It is only for big companies",
      ],
      correct: 1,
      explain: "Data scattered across Instagram, GA4, Ads Manager, and email is hard to act on. A dashboard consolidates the few metrics that matter into one clear, regularly-updated view, turning raw data into something a busy decision-maker can actually use. Clarity drives action.",
    },
  ],
  topics: [
    "Why measurement matters (guessing vs knowing)",
    "Vanity vs actionable metrics",
    "Key marketing metrics (traffic, conversion rate, CAC, ROI, CLV)",
    "Google Analytics 4 (GA4) basics",
    "Tracking across channels (where customers come from)",
    "Building a dashboard (Looker Studio)",
    "Turning data into insights and recommendations",
    "Reporting to stakeholders",
  ],
  tasks: [
    "Set up Google Analytics 4 and key events",
    "Identify the metrics that matter for Adwoa",
    "Connect data sources into a dashboard",
    "Build an executive marketing dashboard in Looker Studio",
    "Write an insights and recommendations report",
  ],
  project:
    "Build an executive marketing dashboard for Adwoa's Kitchen (in Looker Studio, pulling key metrics across channels) and write an insights report that interprets the data and gives clear, prioritised recommendations. Define the KPIs, what is working, what is not, and what to do next. Portfolio case study #9.",
  exercises: [
    "List Adwoa's true KPIs (and the vanity metrics to ignore)",
    "Set up GA4 and a key conversion event",
    "Design a one-screen dashboard layout (what goes on it and why)",
    "Write 3 data-driven insights, each with a recommendation",
  ],
  questions: [
    "Which channel actually drives the most leads/sales?",
    "Where are people dropping off in the journey?",
    "What should we do more of, and less of, based on the data?",
  ],
  outputs: [
    "A GA4 setup with key events tracked",
    "An executive marketing dashboard (Looker Studio)",
    "A defined KPI framework",
    "An insights and recommendations report",
  ],
  mastery_questions: [
    "Distinguish vanity from actionable metrics with examples",
    "Define conversion rate, CAC, ROI, and CLV",
    "Explain what GA4 tracks and why it matters",
    "Describe what belongs on an executive dashboard",
    "Turn a data point into an insight and a recommendation",
  ],
  ai_assist:
    "Use AI to interpret data and draft reports: paste your metrics and ask 'what insights and recommendations would a senior marketer draw from this data?' Or 'explain what a 1.5% conversion rate on a food website suggests and how to improve it.' AI is strong at pattern-spotting and structuring an analysis, you provide the real numbers and apply business judgement. Never let it invent data; feed it the actual figures.",
  pre_flight: [
    "Adwoa's website (for GA4) or the analytics from her channels",
    "A Google account (for GA4 and Looker Studio, both free)",
    "Data from your earlier weeks (social insights, ad results, email metrics)",
  ],
  common_mistakes: [
    "Tracking vanity metrics and ignoring business outcomes",
    "Drowning in data with no clear KPIs or focus",
    "Reporting numbers with no interpretation or recommendation",
    "Not tracking where customers actually come from (attribution)",
  ],
  debug_help: [
    "Overwhelmed by metrics? Start from the business goal and pick the 3-5 KPIs that prove it.",
    "Dashboard cluttered? One screen, the key numbers + trends, remove anything you would not act on.",
    "Numbers but no story? For each metric ask: is this good or bad, why, and what do we do about it?",
  ],
  stretch: [
    "Add UTM tracking to links so you can see exactly which post/ad/email drove each visit",
    "Build a simple funnel visualisation (visitors → leads → customers) and find the biggest drop",
  ],
  resources: [
    "Google Analytics 4 (free)",
    "Google Looker Studio (free dashboards)",
    "Your channels' built-in insights (Meta, email, Ads)",
  ],
  days: [
    {
      number: 0,
      title: "Why measure, and set up GA4",
      summary:
        "Today you'll learn why measurement separates pros from guessers, and set up Google Analytics 4 to track what happens.",
      items: [
        {
          kind: "lesson",
          title: "Stop guessing, start knowing",
          body:
            "## The marketer's superpower\n" +
            "There is an old marketing joke: 'Half my budget is wasted, I just don't know which half.' Analytics is the answer. Measuring what actually happens, and *understanding* it, is the single biggest difference between a marketer who guesses (and eventually fails) and one who *knows* (and improves, and gets hired). Every channel you built has data; this week you learn to read it, consolidate it, and act on it. Data-driven marketing is not a nice-to-have, it is the foundation of doing this professionally.\n\n" +
            "## What good measurement gives you\n" +
            "With analytics, you can finally answer the questions that decide where to put effort and money:\n\n" +
            "- *Which channel* brings the most customers (social, SEO, ads, email)? Double down there.\n" +
            "- *Which content/ad/email* converts best? Do more of it.\n" +
            "- *Where do people drop off* (visit but do not order)? Fix that leak.\n" +
            "- *Are the ads profitable* (ROI)? Scale or stop.\n" +
            "- And crucially, you can *prove* your marketing's value to Adwoa (or an employer), with numbers, not opinions.\n\n" +
            "Without data, all of this is guesswork. With it, you make decisions that compound, cutting waste and scaling winners, week after week.\n\n" +
            "## The mindset: measure what matters\n" +
            "The goal is *not* to track everything (that drowns you in noise). It is to track the few things that prove business results, and to turn those numbers into *decisions*. Data with no decision attached is just trivia. This week you will define what matters for Adwoa, set up the tracking, build a clear view of it, and, most importantly, practise turning numbers into recommendations.\n\n" +
            "Today: set up Google Analytics 4, the free, standard tool for measuring website and marketing performance.",
        },
        {
          kind: "lesson",
          title: "Set up Google Analytics 4",
          body:
            "## What GA4 is\n" +
            "**Google Analytics 4 (GA4)** is Google's free analytics platform, the industry standard for measuring website (and app) performance. It tracks who visits, where they came from (which channel/campaign), what they do on the site, and whether they convert (order, sign up). For any business with a website, GA4 is the foundation of measurement. Even if Adwoa's sales close on WhatsApp, GA4 still tracks the website traffic that feeds those sales and where it comes from.\n\n" +
            "## Set it up\n" +
            "1. **Create a GA4 property** at analytics.google.com (free, with Adwoa's Google account).\n" +
            "2. **Install the tracking** on the website, GA4 gives a snippet or a 'tag'; most site builders (Wix, Shopify, WordPress) have a simple field or app to paste the GA4 Measurement ID. (Google Tag Manager is the more advanced route, optional.)\n" +
            "3. **Verify it works:** GA4's Realtime report should show your own visit when you open the site. Seeing yourself appear confirms tracking is live.\n\n" +
            "## Track key events (conversions)\n" +
            "GA4 tracks basic things automatically (page views, sessions), but the gold is **events/conversions**, the actions that matter. Mark the key actions as conversions: a completed order, a 'click to WhatsApp' / 'click to order' button, an email signup, a menu view. This is what lets you measure *results*, not just traffic. (For Adwoa: the 'Order on WhatsApp' click is a vital event to track, it is the closest signal to a sale that the website can capture.)\n\n" +
            "## Channels = where customers come from\n" +
            "GA4's most useful view for a marketer is *acquisition*, it shows which **channel** brought each visitor (organic search/SEO, social, paid ads, direct, email, referral). This answers 'which of my channels actually works?'. To make it precise, you will use UTM tags (a stretch goal) so every link is labelled. Today you get GA4 tracking live and key events set up, the measurement foundation for the dashboard you build this week.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "The goal of analytics is to track as many metrics as possible.",
              answer: false,
              whenRight: "Right, track the FEW that prove business results and turn them into decisions. Tracking everything drowns you in noise.",
              whenWrong: "No, measure what matters. A few outcome-tied metrics that drive decisions beat a flood of numbers nobody acts on.",
            },
            {
              prompt: "GA4 can show which channel (SEO, social, ads, email) brought each website visitor.",
              answer: true,
              whenRight: "Yes. GA4's acquisition view answers 'which channel actually works?', so you can double down on winners and cut losers.",
              whenWrong: "It can. GA4 attributes visitors to channels, the key to knowing where your customers come from.",
            },
            {
              prompt: "For Adwoa, tracking a 'click to order on WhatsApp' event in GA4 is worthwhile even though the sale closes off-site.",
              answer: true,
              whenRight: "Yes. The WhatsApp-click is the closest sale signal the site can capture, track it as a key event to measure results.",
              whenWrong: "It is worthwhile. The order-click is the best on-site proxy for a sale; tracking it makes your marketing measurable.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, set up GA4",
          body:
            "Get measurement live:\n\n" +
            "- [ ] Create a GA4 property and install tracking on the site (verify in Realtime)\n" +
            "- [ ] Mark key events as conversions (order, WhatsApp-click, email signup)\n" +
            "- [ ] Find the acquisition (channels) report and note where current traffic comes from\n" +
            "- [ ] (If no website exists, note this and plan to gather channel data from each platform's insights instead)\n\n" +
            "Then write one sentence: what is the ONE business outcome (orders? leads?) all of Adwoa's marketing should drive? That anchors your KPIs tomorrow.",
        },
      ],
    },
    {
      number: 1,
      title: "Orient, KPIs and what to measure",
      summary:
        "Today you'll define the metrics that actually matter for Adwoa, separating vanity from actionable, the foundation of useful analytics.",
      items: [
        {
          kind: "lesson",
          title: "Vanity vs actionable metrics",
          body:
            "## The trap of vanity metrics\n" +
            "**Vanity metrics** look impressive but do not inform a decision or tie to real value: follower count, likes, impressions, page views. They feel good (the number goes up!) but a business can have huge vanity numbers and make no money. The danger: vanity metrics create an illusion of success while the business stalls. They are not *useless*, reach matters, but they are means, not ends.\n\n" +
            "**Actionable metrics** tie to business outcomes and inform decisions: leads, orders, revenue, conversion rate, cost per acquisition, return on ad spend, repeat-purchase rate. When these move, the business moves. A good marketer leads with these.\n\n" +
            "## The metrics that matter (define your KPIs)\n" +
            "**KPIs (Key Performance Indicators)** are the few metrics you judge success by. For Adwoa, the KPI set likely includes:\n\n" +
            "- **Leads / orders** (the headline, the Week 1 primary metric): how many people ordered or enquired?\n" +
            "- **Conversion rate:** of the people reached/visiting, what % became leads/customers? (efficiency)\n" +
            "- **Traffic by channel:** where are customers coming from? (so you know what to invest in)\n" +
            "- **Cost per acquisition (CAC):** for paid channels, what does one customer cost? (profitability)\n" +
            "- **Customer lifetime value (CLV):** what is a customer worth over time? (from Week 8, justifies acquisition spend)\n" +
            "- **Revenue** (the ultimate): is marketing driving money?\n\n" +
            "A good KPI is *actionable* (you can change behaviour based on it), *comparable* (you can tell if it is good vs a target or last period), and *tied to the goal*.\n\n" +
            "## The north-star and supporting metrics\n" +
            "Pick ONE *north-star* metric that best captures success (for Adwoa, likely *orders/leads*), supported by a handful of others that explain it. This avoids the two failure modes: tracking nothing, and drowning in everything. A focused KPI set keeps everyone aimed at what matters.\n\n" +
            "## Why this comes first\n" +
            "You define KPIs *before* building the dashboard, because the dashboard should show your KPIs, not random data the tools happen to offer. Decide what matters, then measure it. Today you define Adwoa's KPI framework, the spec for the dashboard you will build.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Followers, likes, and impressions are vanity metrics, they look good but may not prove business value.",
              answer: true,
              whenRight: "Yes. They are means, not ends. Lead with actionable metrics (leads, orders, conversion rate, revenue) that tie to outcomes.",
              whenWrong: "They are vanity. A business can have huge reach and no money. Judge by outcome metrics, not feel-good numbers.",
            },
            {
              prompt: "A good KPI is actionable, comparable, and tied to the business goal.",
              answer: true,
              whenRight: "Yes. You can act on it, judge it against a target/period, and it reflects the goal. That is what makes a metric a true KPI.",
              whenWrong: "It is. Actionable, comparable, goal-tied, those three tests separate real KPIs from vanity numbers.",
            },
            {
              prompt: "You should build the dashboard first, then decide which metrics matter.",
              answer: false,
              whenRight: "Right, reverse it. Define KPIs first, then build a dashboard that shows them. Otherwise you display random data the tools offer.",
              whenWrong: "Define KPIs first. The dashboard should reflect your chosen metrics, not whatever the tools happen to surface.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, define the KPIs",
          body:
            "Start your `Analytics + Dashboard` doc:\n\n" +
            "- [ ] List Adwoa's KPIs (the few actionable metrics that matter)\n" +
            "- [ ] List the vanity metrics you will NOT lead with (but may note as context)\n" +
            "- [ ] Choose ONE north-star metric and the supporting metrics around it\n" +
            "- [ ] Confirm each KPI is actionable, comparable, and tied to the goal\n\n" +
            "Tomorrow: the core marketing metrics defined precisely, so you can interpret them.",
        },
      ],
    },
    {
      number: 2,
      title: "The core marketing metrics, defined",
      summary:
        "Today you'll learn exactly what the key marketing metrics mean and how to read them, the literacy that lets you interpret any campaign.",
      items: [
        {
          kind: "lesson",
          title: "Speak the language of numbers\n",
          body:
            "## Why definitions matter\n" +
            "You cannot interpret data you do not understand. A marketer must read these core metrics fluently, they are the vocabulary of the whole profession, and they appear across every channel (social, ads, email, web). Learn them once, use them forever.\n\n" +
            "## The essential metrics\n" +
            "**Conversion rate** = (people who took the desired action / total people) x 100. If 100 visit the site and 3 order, that is a 3% conversion rate. *Why it is gold:* improving conversion rate multiplies results *without more traffic*. Doubling a 1% rate to 2% doubles sales from the same visitors. It is often the cheapest growth lever.\n\n" +
            "**CAC (Customer Acquisition Cost)** = total spent to acquire customers / number of customers acquired. If GHS 300 of ads brought 10 customers, CAC = GHS 30. *Why it matters:* it tells you what a customer costs, essential for knowing if paid marketing is profitable.\n\n" +
            "**CLV (Customer Lifetime Value)** = the total a customer spends over their whole relationship (Week 8). *Why it matters:* CAC only makes sense against CLV. If a customer costs GHS 30 (CAC) but spends GHS 400 over time (CLV), acquisition is hugely profitable. CLV > CAC is the test of a healthy business.\n\n" +
            "**ROI / ROAS (Return on Investment / Ad Spend)** = revenue generated / amount spent. Spend GHS 100, earn GHS 400 = 4x ROAS. *The ultimate test:* did the marketing make money?\n\n" +
            "**Traffic & sources:** how many people, and from where (channel attribution). **Engagement rate:** interactions / reach (a content-quality signal). **Bounce / drop-off:** where people leave (a leak indicator).\n\n" +
            "## The relationships between them\n" +
            "These metrics tell a *story* together: traffic (how many come) × conversion rate (how many act) = leads/sales; CAC vs CLV = is acquisition profitable; ROAS = did spend pay off. A good analyst reads them as a connected picture, not isolated numbers. E.g. 'lots of traffic but low conversion' points to a website/offer problem, not a traffic problem, the metrics *diagnose* where to focus.\n\n" +
            "## Benchmarks and context\n" +
            "A number alone is meaningless, '3% conversion' is only good or bad versus a benchmark, a target, or last month. Always interpret metrics *in context*: compared to your goal, your past, or industry norms. Today you make sure you can define and read each metric, the literacy you will use to interpret Adwoa's data and every future campaign.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Improving conversion rate increases results without needing more traffic.",
              answer: true,
              whenRight: "Yes. If the same 100 visitors convert at 2% instead of 1%, you double sales with zero extra traffic. Often the cheapest growth lever.",
              whenWrong: "It does. Conversion rate squeezes more results from existing traffic, a powerful, low-cost lever.",
            },
            {
              prompt: "CAC (cost to acquire a customer) is only meaningful when compared to CLV (what a customer is worth).",
              answer: true,
              whenRight: "Yes. A GHS 30 CAC is great if CLV is GHS 400, bad if CLV is GHS 20. CLV > CAC is the test of profitable acquisition.",
              whenWrong: "It is. CAC alone says little; against CLV it reveals whether acquisition is profitable. CLV must exceed CAC.",
            },
            {
              prompt: "A single metric like '3% conversion rate' is meaningful on its own without any context.",
              answer: false,
              whenRight: "Right, you need context, a target, last period, or a benchmark. A number is only good or bad relative to something.",
              whenWrong: "It needs context. Interpret every metric against a goal, your past, or industry norms. Numbers alone do not judge themselves.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, master the metrics",
          body:
            "Build your metric literacy:\n\n" +
            "- [ ] Write the definition and formula for conversion rate, CAC, CLV, and ROI/ROAS in your own words\n" +
            "- [ ] For each of Adwoa's channels, note which metrics best judge it\n" +
            "- [ ] Practise: invent sample numbers and calculate conversion rate, CAC, and ROAS\n" +
            "- [ ] Note the benchmark/context you would compare each KPI against\n\n" +
            "Tomorrow: pulling the data together into a dashboard.",
        },
      ],
    },
    {
      number: 3,
      title: "Tracking across channels and connecting data",
      summary:
        "Today you'll learn to see which channels actually drive results, and pull the scattered data toward one place.",
      items: [
        {
          kind: "lesson",
          title: "Where do customers actually come from?",
          body:
            "## The attribution question\n" +
            "Adwoa is doing social, SEO, ads, and email. The crucial question: *which of these actually brings customers?* This is **attribution**, knowing which channel/campaign gets credit for a result. Without it, you might pour effort into Instagram while Google search quietly drives most orders, or keep ads running that produce nothing. Attribution tells you where your results truly come from, so you invest in winners and cut losers. It is one of the highest-value things analytics provides.\n\n" +
            "## Channels in GA4\n" +
            "GA4's acquisition reports group visitors by **channel**: Organic Search (SEO), Organic Social, Paid Search (Google Ads), Paid Social (Meta ads), Direct, Email, Referral. You can see how many visitors, and how many *conversions*, each channel produced. That answers 'which channel drives orders?' directly. Pair it with the conversions you set up (Day 0) and you can see, e.g., 'SEO brings fewer visitors than social but converts twice as well', the kind of insight that redirects strategy.\n\n" +
            "## UTM tags: precise tracking\n" +
            "For precision, use **UTM tags**, small labels added to your links that tell GA4 exactly where a click came from. A link in an Instagram bio tagged `?utm_source=instagram&utm_medium=social&utm_campaign=jollof_launch` shows up in GA4 labelled exactly that. Tag your links (Google's free Campaign URL Builder makes them) so you can see which *specific* post, ad, or email drove each visit and conversion, not just 'social' but 'the launch reel'. This is how pros measure precisely.\n\n" +
            "## Pulling the data together\n" +
            "Your data lives in several places: GA4 (website), Meta (social + ads), Google Ads, your email tool, and order records. For a complete picture, you gather the key numbers from each. The dashboard (tomorrow) is where you *consolidate* them. For now, identify your data sources and which KPI each provides: GA4 (traffic, channels, web conversions), Meta/Ads (reach, ad spend, ad results), email tool (list, opens, clicks, email conversions), and Adwoa's order records (actual sales, the ground truth). Knowing where each number lives is step one of consolidation.\n\n" +
            "Today you set up channel tracking (and UTMs) and map your data sources, ready to build the dashboard.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Attribution tells you which channel or campaign deserves credit for a result.",
              answer: true,
              whenRight: "Yes. It reveals where your customers truly come from, so you invest in what works and cut what does not. High-value insight.",
              whenWrong: "It does. Attribution answers 'which channel actually drives orders?', essential for allocating effort and budget.",
            },
            {
              prompt: "UTM tags let you see exactly which specific post, ad, or email drove a visit, not just the broad channel.",
              answer: true,
              whenRight: "Yes. UTMs label links so GA4 shows the precise source ('the launch reel'), enabling precise measurement. Pros tag their links.",
              whenWrong: "They do. UTMs add labels so you can attribute results to a specific link/campaign, not just 'social' in general.",
            },
            {
              prompt: "Adwoa's actual order records are irrelevant to marketing analytics.",
              answer: false,
              whenRight: "Wrong, order records are the ground truth (real sales). The dashboard should reconcile platform metrics with actual orders.",
              whenWrong: "They are vital, the real sales data. Platform metrics estimate; orders are the truth the dashboard should include.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, set up cross-channel tracking",
          body:
            "Map and tag your data:\n\n" +
            "- [ ] In GA4, review the channels report (which channels drive visits/conversions)\n" +
            "- [ ] Build UTM-tagged links for at least your bio link and an ad/email (use the URL Builder)\n" +
            "- [ ] Map your data sources and which KPI each provides (GA4, Meta/Ads, email, orders)\n" +
            "- [ ] Note one question the channel data already answers (e.g. best-converting channel)\n\n" +
            "Tomorrow: build the executive dashboard that brings it all together.",
        },
      ],
    },
    {
      number: 4,
      title: "Building the executive dashboard",
      summary:
        "Today you'll build a clear, one-screen marketing dashboard in Looker Studio that turns scattered data into decisions.",
      items: [
        {
          kind: "lesson",
          title: "One screen, the truth at a glance",
          body:
            "## Why a dashboard\n" +
            "Data scattered across five tools is hard to act on, nobody logs into GA4, Meta, Google Ads, and the email tool every day to mentally stitch it together. A **dashboard** consolidates the few metrics that matter into *one clear view*, updated automatically, so anyone (Adwoa, a manager, you) can see performance at a glance and make decisions. Turning messy data into a clear picture is a core, valued marketing skill, it is how you make data *usable*.\n\n" +
            "## Looker Studio (free and powerful)\n" +
            "**Google Looker Studio** (lookerstudio.google.com, free) builds dashboards that connect *directly* to data sources, especially GA4 (one-click connection) and Google Ads, and can pull from Google Sheets (where you can put Meta, email, and order data manually or via export). You drag in charts, scorecards, and tables; it updates automatically as the data changes. No coding. It is the standard free tool for marketing dashboards and worth knowing for your CV.\n\n" +
            "## What goes on an executive dashboard\n" +
            "An *executive* dashboard shows the KPIs (Day 1), not everything. Design principles:\n\n" +
            "- **The headline KPIs as big 'scorecards':** total leads/orders, revenue, conversion rate, the numbers that matter most, instantly visible.\n" +
            "- **Trends over time:** a line chart of orders/leads or traffic, is it growing? (a single number hides the trend).\n" +
            "- **Channel breakdown:** which channels drive results (a bar/pie), so investment decisions are clear.\n" +
            "- **A few supporting metrics:** ad spend/ROAS, email performance, top content, only if you would act on them.\n" +
            "- **Clarity over clutter:** one screen, clean labels, no chart you would not use. If a number does not drive a decision, leave it off.\n\n" +
            "## Design for the reader\n" +
            "Remember who reads it: a busy decision-maker who wants the answer in ten seconds (the same audience as the executive summary from your reports). Lead with the most important numbers, make 'is it working?' answerable at a glance, and put detail below or in secondary views. A cluttered dashboard nobody understands is worse than no dashboard. Today you build Adwoa's dashboard in Looker Studio, connecting GA4 (and Sheets for other data) into one clear view.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "An executive dashboard should display every available metric to be thorough.",
              answer: false,
              whenRight: "Right, show the KPIs only, on one clear screen. If a number would not drive a decision, leave it off. Clarity over clutter.",
              whenWrong: "No, less is more. Show the few KPIs that matter, clearly. A cluttered dashboard nobody reads is worse than none.",
            },
            {
              prompt: "Looker Studio can connect directly to GA4 and update automatically, with no coding.",
              answer: true,
              whenRight: "Yes. It pulls from GA4/Ads/Sheets and refreshes automatically, the free, standard, no-code marketing dashboard tool.",
              whenWrong: "It can. Looker Studio connects to GA4 and others and auto-updates, no code needed. Great for your CV too.",
            },
            {
              prompt: "A dashboard should be designed for a busy decision-maker who wants the answer in seconds.",
              answer: true,
              whenRight: "Yes. Lead with the headline KPIs, make 'is it working?' answerable at a glance, detail below. Same audience as an executive summary.",
              whenWrong: "It should. Design for a glance, big KPIs first, trends and channels visible, detail secondary.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build the dashboard",
          body:
            "Build the executive dashboard in Looker Studio:\n\n" +
            "- [ ] Connect GA4 (and a Google Sheet for Meta/email/order data) to a new Looker Studio report\n" +
            "- [ ] Add headline KPI scorecards (leads/orders, conversion rate, revenue)\n" +
            "- [ ] Add a trend chart (over time) and a channel breakdown chart\n" +
            "- [ ] Keep it to one clean screen, remove anything you would not act on\n\n" +
            "(If you lack live data, build it with realistic sample data clearly labelled, the dashboard *design* is the skill.) Tomorrow: turning the dashboard into insights.",
        },
      ],
    },
    {
      number: 5,
      title: "From data to insights and recommendations",
      summary:
        "Today you'll learn the skill that makes analytics valuable, turning numbers into insights and clear recommendations.",
      items: [
        {
          kind: "lesson",
          title: "Data is not insight",
          body:
            "## The gap most people never cross\n" +
            "Anyone can read a number off a dashboard ('we got 2,000 visits'). Almost no one turns it into an *insight* ('most visits come from Instagram, but Google search visitors convert 3x better, so we are under-investing in SEO') and a *recommendation* ('shift more effort to SEO and test a Google ad on our best buy-keyword'). That leap, data → insight → recommendation, is the entire value of analytics, and the skill that makes a marketer indispensable. A report of numbers with no interpretation is almost worthless; the *so what* and *now what* are everything.\n\n" +
            "## The insight formula\n" +
            "For any metric, ask three questions:\n\n" +
            "1. **What does the data say?** (the fact: 'conversion rate is 1%')\n" +
            "2. **So what, why does it matter / what does it mean?** (the insight: 'that is low, we get traffic but the website/offer is not converting, lots of leaks')\n" +
            "3. **Now what, what should we do?** (the recommendation: 'simplify the ordering path and add reviews; aim to lift conversion to 2%')\n\n" +
            "Every good insight follows this shape: fact → meaning → action. Practise it on every number until it is automatic.\n\n" +
            "## Look for the story in the data\n" +
            "Insights often come from *comparisons and patterns*, not single numbers:\n\n" +
            "- **Compare channels:** which converts best vs which gets the most traffic? (often a mismatch, the opportunity)\n" +
            "- **Compare over time:** what changed, and what did we do that might explain it?\n" +
            "- **Find the leak:** where in the funnel (visit → lead → order) is the biggest drop-off? That is where a fix has the most impact.\n" +
            "- **Find the winner:** what is your single best-performing content/ad/channel? Do more of it.\n\n" +
            "The data *diagnoses* where to focus. A marketer who reads the story (not just the numbers) knows exactly where the next effort should go.\n\n" +
            "## Be honest and prioritised\n" +
            "Good analysis is honest, if something is not working, say so (that is valuable, it stops waste). And it is *prioritised*: not ten weak observations, but the 2-3 insights that matter most, each with a clear recommendation. Today you practise turning Adwoa's dashboard into a handful of sharp insights and recommendations, the heart of the report you ship.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A report of numbers with no interpretation is almost as valuable as one with insights and recommendations.",
              answer: false,
              whenRight: "Wrong, the interpretation (so what) and recommendation (now what) ARE the value. Raw numbers without them are nearly worthless.",
              whenWrong: "No, insight and recommendation are everything. Numbers alone do not help anyone decide. The 'so what / now what' is the value.",
            },
            {
              prompt: "The insight formula is: what does the data say, so what does it mean, now what should we do.",
              answer: true,
              whenRight: "Yes. Fact → meaning → action. Run every metric through it and numbers become decisions.",
              whenWrong: "That is it. Fact, then meaning, then recommendation. Apply it to every number you report.",
            },
            {
              prompt: "Comparing channels (which converts best vs which gets most traffic) often reveals the biggest opportunity.",
              answer: true,
              whenRight: "Yes. A mismatch (most traffic from one channel, best conversion from another) points straight to where to reinvest. Insights live in comparisons.",
              whenWrong: "It does. Patterns and comparisons, not single numbers, surface the real opportunities and leaks.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, generate insights",
          body:
            "Practise the core skill:\n\n" +
            "- [ ] From your dashboard, write 3 insights using the formula (fact → meaning → recommendation)\n" +
            "- [ ] Include at least one comparison (channels, or over time) and one 'leak' or 'winner'\n" +
            "- [ ] Be honest, include something that is NOT working and what to do about it\n" +
            "- [ ] Prioritise: which recommendation would have the biggest impact?\n\n" +
            "Tomorrow you assemble the dashboard + insights into the full report.",
        },
      ],
    },
    {
      number: 6,
      title: "Assemble the dashboard + insights report",
      summary:
        "Today you'll combine the dashboard and your insights into a clear, professional report a decision-maker could act on.",
      items: [
        {
          kind: "lesson",
          title: "The report that proves marketing works",
          body:
            "## What the report contains\n" +
            "Combine your work into one professional **insights report** built around the dashboard:\n\n" +
            "1. **The dashboard** (the at-a-glance KPI view, the headline).\n" +
            "2. **An executive summary:** 3-4 sentences, is marketing working, the single most important finding, and the top recommendation. (For the busy reader who reads nothing else.)\n" +
            "3. **Key insights:** your prioritised 2-3 insights (fact → meaning → recommendation), the heart of the report.\n" +
            "4. **What is working / what is not:** an honest split, double down here, fix or cut there.\n" +
            "5. **Recommendations + next steps:** clear, prioritised actions for the coming period.\n\n" +
            "## Lead with the answer (the pyramid principle)\n" +
            "A busy reader (Adwoa, an employer) wants the bottom line first: *is it working, and what should we do?* Lead with that executive summary, then provide the supporting insights and detail for those who want it. Do not bury the conclusion under a pile of charts, that is the rookie mistake. The report's job is to drive *decisions*, so make the decision obvious and well-supported.\n\n" +
            "## Make it a regular rhythm\n" +
            "Reporting is not a one-off, it is a *cadence* (weekly or monthly). The real value of analytics comes from the *loop*: measure → insight → act → measure again, and see if the action worked. Note in the report how often it should be produced and that recommendations will be checked against next period's data. This closes the loop and shows you understand analytics as an ongoing practice, not a single snapshot.\n\n" +
            "## The professional signal\n" +
            "This report demonstrates the most valuable thing a marketer can do: *prove and improve*. It shows you measure results (not vanity), interpret them honestly, and drive decisions with data. That is exactly what makes marketing defensible to leadership and what separates a strategic marketer from a 'poster'. Today you assemble it; tomorrow you ship case study #9.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "An insights report should lead with the bottom line (is it working, what to do), not bury it under charts.",
              answer: true,
              whenRight: "Yes. Pyramid principle, executive summary first, supporting detail after. Make the decision obvious for the busy reader.",
              whenWrong: "It should lead with the answer. Bury the conclusion and the report fails its busy reader. Summary first, detail below.",
            },
            {
              prompt: "The value of analytics comes from the loop: measure, insight, act, then measure again.",
              answer: true,
              whenRight: "Yes. Reporting is a cadence, not a one-off. Acting and re-measuring is how marketing actually improves over time.",
              whenWrong: "It does. The measure-act-remeasure loop is the point. A single snapshot does not improve anything; the rhythm does.",
            },
            {
              prompt: "A good report honestly includes what is NOT working, not just the wins.",
              answer: true,
              whenRight: "Yes. Honest 'this is not working, here is the fix' stops waste and builds trust, more valuable than spin.",
              whenWrong: "It should. Honesty about what is failing (with a fix) is valuable and professional; hiding it wastes money.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, assemble the report",
          body:
            "Build the insights report:\n\n" +
            "- [ ] Lead with an executive summary (working? top finding? top recommendation?)\n" +
            "- [ ] Include the dashboard and your prioritised insights (fact → meaning → action)\n" +
            "- [ ] Add an honest 'what's working / what's not' and prioritised next steps\n" +
            "- [ ] Note the reporting cadence (how often) and the measure-act-remeasure loop\n\n" +
            "Tomorrow you ship case study #9.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship it, dashboard + insights report (case study #9)",
      summary:
        "Today you'll package the executive dashboard and insights report into case study #9.",
      items: [
        {
          kind: "lesson",
          title: "Ship it, the proof-and-improve skill",
          body:
            "## Package case study #9\n" +
            "Present **Adwoa's Kitchen, Marketing Dashboard + Insights Report**, with:\n\n" +
            "- A **challenge/approach** opener (Adwoa could not tell what was working; you set up measurement, built a dashboard, and turned the data into decisions)\n" +
            "- The **executive dashboard** (a screenshot/embed of the Looker Studio view)\n" +
            "- The **KPI framework** (what you measure and why)\n" +
            "- The **insights report** (executive summary, prioritised insights, what's working/not, recommendations)\n\n" +
            "## Why this is one of your most valuable case studies\n" +
            "Analytics is the skill that *underpins everything else* and that many marketers fear. It is the difference between 'I made some posts' and 'I measured performance across channels, found that SEO converted 3x better than social, and reallocated effort to grow orders by X%'. Employers prize marketers who are *data-driven*, who can prove ROI and make decisions with evidence. This case study shows you can measure, interpret, and *improve*, the mark of a strategic, senior-track marketer, not a tactician.\n\n" +
            "## You can now prove your own value\n" +
            "There is a personal payoff: analytics is how *you* will prove *your* impact in any job. 'I grew orders 40% by reallocating budget based on conversion data' is a career-making line, and it is only possible because you measured. The skill you built this week is what lets you demonstrate results for the rest of your career. Save case study #9.\n\n" +
            "Next week: AI for marketing. You will learn to use AI tools to do everything you have learned faster and better, content, research, analysis, the modern marketer's force-multiplier, and exactly what makes you stand out in the job market right now.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Analytics underpins every other marketing skill and is what lets you prove ROI.",
              answer: true,
              whenRight: "Yes. It turns 'I posted' into 'I measured, found what worked, and improved results'. Data-driven marketers are prized.",
              whenWrong: "It does. Measurement makes all other channels improvable and provable. It is the foundation of professional marketing.",
            },
            {
              prompt: "Analytics is also how you prove YOUR personal impact in a job.",
              answer: true,
              whenRight: "Yes. 'I grew orders 40% by reallocating based on conversion data' is a career-making line, only possible because you measured.",
              whenWrong: "It is. Your ability to show results (with numbers) is how you prove your value. Analytics makes that possible.",
            },
            {
              prompt: "A dashboard + insights case study mainly shows you can make pretty charts.",
              answer: false,
              whenRight: "Right, it shows you can MEASURE, INTERPRET, and IMPROVE, the strategic, data-driven thinking employers want, not just chart-making.",
              whenWrong: "It shows decision-making, not decoration. The insights and recommendations (proving and improving) are the real signal.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Ship it",
          body:
            "Package and ship case study #9:\n\n" +
            "- [ ] One document titled `Adwoa's Kitchen, Marketing Dashboard + Insights Report`\n" +
            "- [ ] Challenge/approach framing\n" +
            "- [ ] Dashboard (screenshot/embed), KPI framework, and insights report, all present\n" +
            "- [ ] Saved in your `Week 09 Analytics` portfolio folder\n\n" +
            "Nine case studies done. Next week: AI for marketing, the modern force-multiplier.",
        },
      ],
    },
  ],
};
