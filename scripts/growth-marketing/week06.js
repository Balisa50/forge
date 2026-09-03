/* Week 6 - Paid Advertising: Meta (Phase: Paid Acquisition) */
module.exports = {
  number: 6,
  title: "Paid Advertising (Meta)",
  phase: "Paid Acquisition",
  commitment_hours: "7, 11",
  context:
    "Until now you have *earned* attention, slowly, through content, social, and SEO. This week you learn to *buy* it, fast, through Meta ads (Facebook and Instagram). Paid advertising is the accelerator: where organic growth takes months, a well-built ad campaign can put Adwoa's food in front of thousands of the exact right people within hours, for a controllable budget. Meta's targeting is the most powerful and accessible for a small business, you can reach 'people in Accra, aged 25-45, interested in food and cooking' with a few clicks.\n\n" +
    "But paid ads are also where beginners waste the most money. Boosting a post with no strategy, no clear objective, no audience targeting, and no measurement is how small businesses burn cash and conclude 'ads do not work'. This week you learn to do it properly: the structure (campaign, ad set, ad), objectives, audience targeting, ad creative, budgets, and crucially how to read the results and judge whether the money made money.\n\n" +
    "By Sunday you will have built a complete, ready-to-launch Meta ad campaign for Adwoa's Kitchen AND a results/analysis report (real if you run a small test budget, or a projected analysis if not). That campaign + report is case study #6, and proof you can run paid acquisition responsibly.",
  concept_check: [
    {
      q: "Adwoa 'boosts' a post for GHS 100 with no targeting or goal, gets 5,000 views and zero orders. What went wrong?",
      choices: [
        "The budget was too small",
        "No objective, no audience targeting, and no conversion path, views are not the goal, and untargeted reach rarely converts",
        "Facebook ads do not work for food",
        "She should have spent GHS 1,000",
      ],
      correct: 1,
      explain: "Boosting for 'views' with no targeting or conversion goal is the classic money-waster. A real campaign picks an objective tied to business value (messages/orders), targets the right audience, and sends people to a clear next step. Reach without strategy is just expensive attention.",
    },
    {
      q: "What is the relationship between a campaign, an ad set, and an ad in Meta Ads Manager?",
      choices: [
        "They are the same thing",
        "Campaign = the objective (the goal); Ad set = the audience, budget, and placement; Ad = the actual creative people see",
        "Ad = the goal; Campaign = the image",
        "There is no structure, you just post",
      ],
      correct: 1,
      explain: "Meta's three-level structure: the CAMPAIGN sets the objective (e.g. messages, sales), the AD SET defines who sees it (audience), how much (budget), and where (placement), and the AD is the creative (image/video + copy). Understanding this structure is the foundation of running ads.",
    },
    {
      q: "Why is ROAS (Return On Ad Spend) the metric that ultimately matters most?",
      choices: [
        "It measures how many likes the ad got",
        "It measures revenue earned per cedi spent, telling you whether the ads actually MADE money, not just got attention",
        "It measures follower growth",
        "It is just the number of clicks",
      ],
      correct: 1,
      explain: "ROAS = revenue generated / ad spend. If you spend GHS 100 and earn GHS 400, ROAS is 4x, the ads made money. Likes, reach, and clicks are means; ROAS (or cost per lead/order) tells you if the spend was profitable. Paid advertising must ultimately pay for itself.",
    },
  ],
  topics: [
    "Why and when to use paid ads",
    "Meta Ads Manager structure (campaign, ad set, ad)",
    "Campaign objectives",
    "Audience targeting (interests, demographics, custom, lookalike)",
    "Ad creative and copy that converts",
    "Budgets, bidding, and how the auction works",
    "Key metrics (CPM, CPC, CTR, CPA, ROAS)",
    "Reading results and optimising",
  ],
  tasks: [
    "Set up Meta Ads Manager and the Pixel (if applicable)",
    "Choose the right campaign objective",
    "Build a targeted audience for Adwoa",
    "Create ad creative and copy",
    "Build a full campaign and a results/analysis report",
  ],
  project:
    "Build a complete, launch-ready Meta ad campaign for Adwoa's Kitchen: a chosen objective, a defined target audience, ad creative + copy (using Week 2 content), a budget plan, and the structure in Ads Manager, plus a results/analysis report interpreting the key metrics (real numbers from a small test budget if possible, or a clearly-labelled projection). Portfolio case study #6.",
  exercises: [
    "Define a target audience with specific interests/demographics for Adwoa",
    "Write 3 ad variations (different hooks/angles) to test",
    "Set a budget and predict the metrics you would watch",
    "Interpret a sample results report and decide what to change",
  ],
  questions: [
    "What is the campaign's objective and the business value behind it?",
    "Who exactly should see these ads?",
    "Did the ads make money (or would they), and how do you know?",
  ],
  outputs: [
    "A launch-ready Meta campaign (objective, audience, creative, budget)",
    "Ad creative and copy variations",
    "A metrics framework (what to track and the targets)",
    "A results/analysis report",
  ],
  mastery_questions: [
    "Explain the campaign / ad set / ad structure",
    "Choose the right objective for a goal (e.g. orders via WhatsApp)",
    "Build a targeted audience and a lookalike concept",
    "Define CPM, CPC, CTR, CPA, and ROAS",
    "Read a results table and decide what to scale or cut",
  ],
  ai_assist:
    "Use AI to generate ad copy variations and audience ideas: 'Write 5 Facebook ad primary texts and 5 headlines for a Ghanaian jollof spice mix, targeting busy professionals, benefit-led, with a clear CTA.' Then YOU pick, edit for local voice, and pair with real photos. Also: 'Suggest interest-targeting options for a food brand in Accra.' AI accelerates creative volume; you judge fit and handle the real account and budget.",
  pre_flight: [
    "A Facebook Page for Adwoa's Kitchen (ads run from a Page)",
    "A Meta Business account / Ads Manager access",
    "Your Week 2 content (creative) and Week 3 conversion path (WhatsApp/landing)",
    "A small test budget is optional but valuable (even GHS 50-100)",
  ],
  common_mistakes: [
    "Boosting posts with no objective, targeting, or conversion path",
    "Judging ads by likes/reach instead of cost per result and ROAS",
    "Too-broad or too-narrow audiences",
    "Sending ad clicks to a confusing destination (friction kills conversion)",
  ],
  debug_help: [
    "Ad not converting? Check the DESTINATION, clicks to a confusing page/slow site waste the spend.",
    "Costs too high? Test new creative first (creative is the biggest lever), then audience.",
    "Do not know what to optimise? Let it run long enough to gather data, then cut losers and scale winners.",
  ],
  stretch: [
    "Design an A/B test (same audience, two creatives) and define the winning criteria",
    "Plan a simple retargeting ad to people who engaged but did not order",
  ],
  resources: [
    "Meta Ads Manager (free to use; you pay only for ad spend)",
    "Meta Business Suite",
    "Your Week 2 creative and Week 3 conversion path",
  ],
  days: [
    {
      number: 0,
      title: "Why paid ads, and set up Ads Manager",
      summary:
        "Today you'll learn when paid ads make sense and the dangerous trap of boosting, then set up Meta Ads Manager properly.",
      items: [
        {
          kind: "lesson",
          title: "Buying attention, done right",
          body:
            "## What paid ads give you that organic cannot\n" +
            "Organic growth (content, social, SEO) is powerful but *slow* and *limited in reach* for a new account, you are at the mercy of algorithms and time. Paid ads give you three things instantly: **speed** (results in hours, not months), **scale** (reach thousands beyond your followers), and **precision** (target exactly who you want). For a business that needs orders *now*, or wants to accelerate growth, ads are the lever. The trade-off: you pay for every bit of reach, so it must be done efficiently or it bleeds money.\n\n" +
            "## The boosting trap\n" +
            "When you see 'Boost Post' on Facebook/Instagram, that button is Meta's simplest (and bluntest) ad tool. Beginners boost a post for views, get a big reach number, feel successful, and make zero sales. Why? Boosting optimises for cheap engagement, not business results; it usually has weak targeting and no clear conversion path. **Real advertising uses Ads Manager**, where you control the objective, audience, creative, budget, and measurement. Boosting is a blunt instrument; Ads Manager is the proper tool. This week you learn the proper tool.\n\n" +
            "## When ads make sense (and when not)\n" +
            "Ads work best when: you have a clear offer (the spice mix, a meal deal), a working conversion path (WhatsApp/landing page from Week 3), and content/creative ready (Week 2). Ads do *not* fix a broken offer or a confusing ordering process, they just bring more people to it faster, so a bad funnel loses money *faster*. The foundation you built in Weeks 1-5 is exactly what makes ads work. Ads amplify a good system; they expose a bad one.\n\n" +
            "## Start small, learn, scale\n" +
            "The smart approach: start with a *small* budget to learn what works (which audience, which creative, which message), then scale up what proves profitable. Never pour a big budget into an untested campaign. This week you build the campaign properly and, ideally, test it with a small budget to see real numbers. Today: set up the tool.",
        },
        {
          kind: "lesson",
          title: "Set up Meta Ads Manager",
          body:
            "## Get the account ready\n" +
            "**1. A Facebook Page.** Ads run from a Page, not a personal profile. Adwoa's Kitchen needs a Facebook Page (free, business.facebook.com or directly on Facebook). Connect her Instagram to it (ads can run on both from one place).\n\n" +
            "**2. Meta Business account + Ads Manager.** Go to business.facebook.com, set up a Business account, and open **Ads Manager** (adsmanager.facebook.com). This is the cockpit where you build, run, and measure all campaigns. Add a payment method (you only pay for actual ad spend; the tool is free). Set up the account *before* you need to launch.\n\n" +
            "**3. The Meta Pixel (if there is a website).** The Pixel is a small piece of code on the website that lets Meta *track conversions* (who visited, added to cart, ordered) and build smarter audiences. If Adwoa has a site, install the Pixel (most site builders make this a copy-paste or an app). If sales happen on WhatsApp (no website conversion), you will measure differently (link clicks, messages, and asking customers 'how did you find us?'), note this. The Pixel turns ads from guessing into measurable.\n\n" +
            "**4. Explore the structure.** In Ads Manager, notice the three levels: **Campaigns**, **Ad sets**, **Ads**. You will learn each this week. Just see the layout today.\n\n" +
            "## Spend rules before you spend\n" +
            "Set a clear budget cap you are comfortable losing while learning, advertising is a skill you pay tuition for. Decide the test budget now (even GHS 50-100 teaches a lot). Never spend money you cannot afford on an untested campaign. Today is setup; the rest of the week is building the campaign right.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "The 'Boost Post' button is the proper, full-featured way to run Meta ads.",
              answer: false,
              whenRight: "Right, boosting is a blunt tool optimised for cheap engagement. Real ads use Ads Manager, where you control objective, audience, and measurement.",
              whenWrong: "No, boosting is the blunt beginner tool. Ads Manager is the proper cockpit, objective, targeting, creative, budget, metrics.",
            },
            {
              prompt: "Ads amplify whatever system you have, so a confusing offer or ordering path loses money faster.",
              answer: true,
              whenRight: "Yes. Ads do not fix a broken funnel; they bring more people to it faster. The Weeks 1-5 foundation is what makes ads work.",
              whenWrong: "They do. Ads expose a bad funnel by pushing more traffic to it. Fix the offer/path first, then amplify.",
            },
            {
              prompt: "The smart approach is to test with a small budget, then scale up what proves profitable.",
              answer: true,
              whenRight: "Yes. Start small, learn which audience/creative/message works, then scale the winners. Never dump a big budget on an untested campaign.",
              whenWrong: "It is. Small test, learn, then scale winners. Big spend on an unproven campaign is how money gets burned.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, set up Ads Manager",
          body:
            "Get the ad account ready:\n\n" +
            "- [ ] Facebook Page for Adwoa's Kitchen exists and is connected to Instagram\n" +
            "- [ ] Meta Business account + Ads Manager set up (payment method added)\n" +
            "- [ ] Meta Pixel installed (if there is a website) OR a note on how you will measure WhatsApp/link results\n" +
            "- [ ] A test budget decided (an amount you are comfortable spending to learn)\n\n" +
            "Then write one sentence: what business result (orders? WhatsApp messages? signups?) should Adwoa's ads drive? That is your objective, tomorrow.",
        },
      ],
    },
    {
      number: 1,
      title: "Orient, objectives and campaign structure",
      summary:
        "Today you'll learn Meta's campaign structure and how to choose the objective that ties ads to real business value.",
      items: [
        {
          kind: "lesson",
          title: "Structure and objective decide everything",
          body:
            "## The three-level structure\n" +
            "Every Meta campaign has three levels, and knowing them is the foundation:\n\n" +
            "1. **Campaign** (the GOAL): you choose one *objective*, what you want Meta to optimise for (messages, sales, traffic, etc.). This shapes the whole campaign.\n" +
            "2. **Ad set** (the WHO, HOW MUCH, WHERE): the *audience* (targeting), the *budget* and schedule, and the *placements* (Instagram feed, Facebook, Reels, etc.). You can have multiple ad sets to test different audiences.\n" +
            "3. **Ad** (the WHAT they see): the actual *creative*, image or video plus the copy and call-to-action button. You can have multiple ads to test different creative.\n\n" +
            "Think of it as: Campaign = the destination, Ad set = the vehicle and passengers, Ad = the message on the billboard. Get all three right and the campaign works.\n\n" +
            "## Choose the objective by business value\n" +
            "The objective is the most important early decision because Meta *optimises delivery* toward whatever you choose, it will show your ad to the people most likely to do that thing. So choose the objective that matches the real business outcome:\n\n" +
            "- **Engagement/Awareness:** cheap reach and interactions. Good for building an audience, but does NOT directly drive sales. (This is essentially what 'boosting' does, why it rarely sells.)\n" +
            "- **Traffic:** sends people to a website/link. Useful if the conversion happens on a site.\n" +
            "- **Leads / Messages:** drives people to message you (great for WhatsApp-based businesses like Adwoa) or submit their details. Often the sweet spot for a small local business.\n" +
            "- **Sales/Conversions:** optimises for purchases (needs the Pixel + website checkout). The most direct, when you have e-commerce set up.\n\n" +
            "For Adwoa, whose orders close on WhatsApp, a **Messages** (or Leads) objective is likely the smart choice, Meta will find people most likely to message and order. Matching objective to outcome is what separates a campaign that sells from one that just gets likes.\n\n" +
            "Today you choose Adwoa's objective and understand the structure you will build.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Meta optimises delivery toward whatever objective you choose, so the objective must match the real business outcome.",
              answer: true,
              whenRight: "Yes. Choose 'Messages' and Meta finds likely messagers; choose 'Engagement' and it finds likely likers. Pick the objective that equals business value.",
              whenWrong: "It does. The objective tells Meta what to optimise for. Match it to the outcome (orders/messages), not vanity (likes).",
            },
            {
              prompt: "The ad set is where you define the audience, budget, and placements.",
              answer: true,
              whenRight: "Yes. Campaign = objective, AD SET = who/how-much/where, Ad = the creative. Know the three levels cold.",
              whenWrong: "It is. The ad set holds audience, budget, schedule, and placements. The campaign holds the objective; the ad holds creative.",
            },
            {
              prompt: "For a business whose orders close on WhatsApp, an Awareness objective is usually the best choice.",
              answer: false,
              whenRight: "Right, a Messages (or Leads) objective fits better, Meta will find people likely to message and order. Awareness gets reach, not orders.",
              whenWrong: "Probably not. For WhatsApp ordering, a Messages/Leads objective drives actual enquiries; Awareness just buys reach.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, choose the objective",
          body:
            "Start your campaign plan doc:\n\n" +
            "- [ ] Write out the campaign / ad set / ad structure in your own words\n" +
            "- [ ] Choose Adwoa's campaign OBJECTIVE and justify it (tie it to a business outcome)\n" +
            "- [ ] Note how the conversion will happen (WhatsApp message? website order? lead form?)\n" +
            "- [ ] Define what 'a result' means for this campaign (a message? an order? a click?)\n\n" +
            "Tomorrow: audience targeting, the superpower of Meta ads.",
        },
      ],
    },
    {
      number: 2,
      title: "Audience targeting, Meta's superpower",
      summary:
        "Today you'll learn to target exactly the right people, the capability that makes Meta ads so powerful for a small budget.",
      items: [
        {
          kind: "lesson",
          title: "Show the ad to the right people only",
          body:
            "## Why targeting is the magic\n" +
            "The reason Meta ads work so well for small businesses is *targeting*. Instead of paying to reach everyone (most of whom do not care), you pay to reach *exactly* the people most likely to buy. Adwoa can show her spice-mix ad only to 'people in Accra, 25-45, interested in cooking and Ghanaian food', not wasting a cedi on people who would never order. Precise targeting is how a tiny budget competes with big spenders, you are not outspending them, you are out-aiming them. This is where your Week 1 persona pays off directly.\n\n" +
            "## The targeting options\n" +
            "1. **Location:** essential for a local business. Target Accra (or specific areas, or a radius). For shippable products, target wider (all Ghana).\n" +
            "2. **Demographics:** age, gender, language, matched to your persona (Akosua: 25-40, Accra).\n" +
            "3. **Interests and behaviours:** Meta knows what people engage with, target 'cooking', 'Ghanaian cuisine', 'foodies', 'home cooking', etc. This finds people predisposed to care.\n" +
            "4. **Custom Audiences:** people who already know you, your customer list, website visitors (via Pixel), or people who engaged with your Instagram/Facebook. These warm audiences convert best (retargeting).\n" +
            "5. **Lookalike Audiences:** Meta finds *new* people who resemble your best existing customers/audience. Powerful for scaling, you tell Meta 'find more people like these', and it does. (Needs a source audience of existing customers/engagers.)\n\n" +
            "## Not too broad, not too narrow\n" +
            "The art is the right *size*. Too broad ('everyone in Ghana') wastes money on uninterested people. Too narrow ('vegan jollof lovers in East Legon aged 31') gives Meta too little room to optimise. Aim for a focused-but-roomy audience (Ads Manager shows an estimated size, a few hundred thousand for a city is often reasonable). Start with interest-based targeting matched to your persona; layer in retargeting and lookalikes as you build data.\n\n" +
            "## The warm-audience hierarchy\n" +
            "Generally: *retargeting* (people who know you) converts best and cheapest, *lookalikes* are strong for finding new buyers, and *cold interest* targeting is for top-of-funnel reach. For a first campaign with no data yet, start with interest + location targeting from your persona. Today you build Adwoa's target audience.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Precise targeting lets a small budget compete by out-aiming bigger spenders rather than outspending them.",
              answer: true,
              whenRight: "Yes. You reach only the people likely to buy, so every cedi works harder. Targeting is the small-budget superpower.",
              whenWrong: "It is. You cannot outspend big brands, but you can out-AIM them with precise targeting. That is the edge.",
            },
            {
              prompt: "A Lookalike Audience finds new people who resemble your existing best customers/engagers.",
              answer: true,
              whenRight: "Yes. You give Meta a source audience and it finds similar new people, powerful for scaling once you have data.",
              whenWrong: "It does. Lookalikes scale by finding new people like your current customers. Great for growth (needs a source audience).",
            },
            {
              prompt: "The narrowest possible audience is always best because it is the most targeted.",
              answer: false,
              whenRight: "Right, too narrow starves Meta's optimisation. Aim focused-but-roomy; too broad wastes money, too narrow underperforms.",
              whenWrong: "Not always. Too narrow gives the algorithm no room to optimise. Balance: focused but not tiny.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build the audience",
          body:
            "Define Adwoa's target audience(s):\n\n" +
            "- [ ] Build a primary audience from your Week 1 persona (location, age, interests)\n" +
            "- [ ] Note an estimated audience size (focused but roomy)\n" +
            "- [ ] Plan a retargeting audience (people who engaged/visited) for warm conversion\n" +
            "- [ ] Plan a lookalike concept for scaling once data exists\n\n" +
            "Tomorrow: the ad creative and copy that actually makes them act.",
        },
      ],
    },
    {
      number: 3,
      title: "Ad creative and copy that converts",
      summary:
        "Today you'll create the ad itself, the visual and copy, that stops the scroll and drives action.",
      items: [
        {
          kind: "lesson",
          title: "Creative is the biggest lever",
          body:
            "## The creative does most of the work\n" +
            "You can have a perfect objective and audience, but if the *ad itself* is boring, nothing happens. In modern Meta advertising, **creative (the image/video + copy) is the single biggest lever on performance**, more than tiny targeting tweaks. A scroll-stopping, benefit-led ad with a clear ask can outperform a dull one many times over on the same audience and budget. Good news: you already built this skill in Week 2 (hooks, benefits, captions) and have content ready.\n\n" +
            "## Anatomy of a Meta ad\n" +
            "- **The visual (image or video):** the scroll-stopper. For food, a mouth-watering photo or a short video of the sizzling, glistening result. Video (reels-style) often outperforms static images. This must grab attention in the first instant, like a reel hook.\n" +
            "- **Primary text:** the main copy above/below the visual. Lead with a benefit-led hook (Week 2/4), keep it tight, end with a clear next step. Speak to the persona's desire ('Restaurant jollof in 20 minutes, delivered across Accra').\n" +
            "- **Headline:** a short, punchy line near the button.\n" +
            "- **Call-to-action button:** Meta's built-in button (Send Message, Order Now, Shop Now, Learn More), matched to your objective. This is the action.\n\n" +
            "## Ad copy principles\n" +
            "1. **Hook first** (Week 2): the opening line/visual must stop the scroll, an ad is just sponsored content competing in the same feed.\n" +
            "2. **Benefit-led** (Week 1): sell the outcome (taste of home, no time wasted), not features.\n" +
            "3. **Speak to the persona:** address Akosua's specific situation and desire.\n" +
            "4. **One clear CTA:** tell them exactly what to do (message us to order).\n" +
            "5. **Authentic, local voice + real photos:** generic stock-y ads underperform; Adwoa's real food and warm voice win trust.\n\n" +
            "## Make variations to test\n" +
            "Never run just one ad. Create **3 variations** with different hooks/angles (e.g. one leads on speed, one on taste-of-home, one on a customer story). You will let the data tell you which the audience prefers, that is how you find the winner instead of guessing. Today you create the creative and copy variations from your Week 2 content.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "In modern Meta ads, the creative (visual + copy) is the single biggest lever on performance.",
              answer: true,
              whenRight: "Yes. A scroll-stopping, benefit-led ad beats a dull one many times over on the same audience. Creative does the heavy lifting.",
              whenWrong: "It is. Creative outweighs small targeting tweaks. A great hook + visual + clear ask is what drives results.",
            },
            {
              prompt: "You should run a single 'best' ad rather than testing variations.",
              answer: false,
              whenRight: "Right, run 3 variations with different angles and let the data pick the winner. You rarely guess the best one correctly.",
              whenWrong: "Test variations. Run 3 different hooks/angles; the audience (data) reveals the winner better than your guess.",
            },
            {
              prompt: "The ad copy should sell the outcome (taste of home, time saved), not just list features.",
              answer: true,
              whenRight: "Yes, benefit-led (Week 1), with a hook (Week 2) and one clear CTA. The skills you built feed straight into ads.",
              whenWrong: "It should. Benefit-led, hook-first, one clear CTA. Ads reuse your content and copy skills directly.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, create the ads",
          body:
            "Build the ad creative:\n\n" +
            "- [ ] Choose/create the visual(s), ideally a short video and a strong photo of the food\n" +
            "- [ ] Write 3 ad variations (different angles: speed, taste-of-home, customer story)\n" +
            "- [ ] Each with: hook-led primary text, a punchy headline, and the right CTA button\n" +
            "- [ ] Make sure each is benefit-led and speaks to the persona\n\n" +
            "Tomorrow: budgets, bidding, and how the ad auction actually works.",
        },
      ],
    },
    {
      number: 4,
      title: "Budgets, bidding, and the auction",
      summary:
        "Today you'll learn how Meta charges you, how the auction works, and how to set a budget that learns efficiently.",
      items: [
        {
          kind: "lesson",
          title: "How the money works",
          body:
            "## The ad auction (simplified)\n" +
            "You do not pay a fixed price for ads. Every time someone could see an ad, Meta runs an instant *auction* among advertisers wanting that person's attention. The winner is not just the highest bidder, Meta rewards *relevant, engaging* ads (because it wants users to have a good experience). So a great ad to the right audience can win cheaper than a dull ad with a higher bid. This is *why* good creative and targeting lower your costs: Meta literally charges you less for ads people like. You do not need to manually bid as a beginner, Meta's automatic bidding works well; focus on creative, audience, and objective.\n\n" +
            "## Budget basics\n" +
            "- **Daily vs lifetime budget:** set a *daily* budget (spend X per day) or a *lifetime* budget (spend X total over the campaign dates). Daily is simplest to start.\n" +
            "- **Start small:** a small daily budget (even a few cedis to GHS 20-50/day) is enough to *learn* which audience/creative works. You scale the winners later. Do not over-commit to an untested campaign.\n" +
            "- **The learning phase:** when a new campaign starts, Meta needs data (it is 'learning'), results are unstable for the first days/conversions. Do not panic and change everything in day one; give it time to optimise (while watching the budget).\n\n" +
            "## The cost metrics you will see\n" +
            "- **CPM** (cost per 1,000 impressions): how much to be *seen*.\n" +
            "- **CPC** (cost per click): how much per click to your link.\n" +
            "- **CTR** (click-through rate): % who click, a key creative-quality signal (low CTR = weak creative).\n" +
            "- **CPA / cost per result** (cost per action, e.g. per message or order): the practical efficiency number, how much does one lead/order cost?\n" +
            "- **ROAS** (return on ad spend): revenue / spend, did it make money?\n\n" +
            "## Budget for learning, then for profit\n" +
            "Frame the first spend as *tuition*: you are buying data about what works. Once you know your cost-per-result and that the campaign is profitable (ROAS positive), *then* you scale the budget on the winners. The discipline, start small, measure, scale winners, cut losers, is the whole game of paid acquisition. Today you set the budget plan and the metrics you will watch.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Meta's auction rewards relevant, engaging ads, so good creative can win cheaper than a dull ad with a higher bid.",
              answer: true,
              whenRight: "Yes. Meta charges less for ads people like (better user experience). Good creative + targeting literally lowers your costs.",
              whenWrong: "It does. The auction favours relevance, not just the top bid. Quality ads cost less, why creative matters so much.",
            },
            {
              prompt: "A new campaign gives stable, reliable results from the very first hour.",
              answer: false,
              whenRight: "Right, there is a 'learning phase' where results are unstable while Meta gathers data. Give it time before judging or overhauling.",
              whenWrong: "No, early results are noisy during the learning phase. Let it gather data before reacting.",
            },
            {
              prompt: "The first ad budget is best thought of as tuition, you are buying data on what works.",
              answer: true,
              whenRight: "Yes. Start small to learn cost-per-result, then scale the proven winners. That discipline is the core of paid acquisition.",
              whenWrong: "It is. Early spend buys learning. Measure cost-per-result, then scale winners and cut losers.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, plan the budget",
          body:
            "Set the budget and metrics plan:\n\n" +
            "- [ ] Choose a daily budget for a small test (an amount you are comfortable learning with)\n" +
            "- [ ] Note the learning-phase expectation (results stabilise after some data)\n" +
            "- [ ] List the metrics you will watch (CTR, CPC, cost per result, and ROAS/cost-per-order)\n" +
            "- [ ] Define your 'success' threshold (e.g. cost per order below GHS X)\n\n" +
            "Tomorrow: launch (or finalise) the campaign and read the results.",
        },
      ],
    },
    {
      number: 5,
      title: "Launch, measure, and optimise",
      summary:
        "Today you'll launch the campaign (or finalise it) and learn to read the results and optimise toward profit.",
      items: [
        {
          kind: "lesson",
          title: "The numbers tell you what to do",
          body:
            "## Launch the campaign\n" +
            "Assemble everything in Ads Manager: objective (campaign), audience + budget (ad set), and your 3 creatives (ads). Review it, then launch (if running a real test) or finalise it as launch-ready (if not spending). If you can run even a small test budget, do, real numbers make this far more instructive and make a stronger case study.\n\n" +
            "## Read the results like a marketer\n" +
            "Once data comes in, interpret it (do not just stare at it):\n\n" +
            "- **Low CTR (few clicks per view)?** Your *creative* is weak, the hook/visual is not stopping the scroll. Creative is the first thing to fix.\n" +
            "- **Good CTR but high cost per result (clicks but no orders)?** The problem is *after* the click, the destination (landing page/WhatsApp flow) has friction, or the audience is wrong-fit. Check the conversion path.\n" +
            "- **High CPM (expensive to even be seen)?** Audience may be too competitive or creative relevance low.\n" +
            "- **Which ad/audience is winning?** Meta shows results per ad and ad set. Identify the best performer.\n\n" +
            "Each metric points to a specific fix. This diagnostic skill, *the numbers tell you what to change*, is what separates a marketer from someone who just spends.\n\n" +
            "## Optimise: cut losers, scale winners\n" +
            "The core optimisation loop: after enough data, **turn off the underperforming ads/audiences** (stop wasting money on them) and **put more budget into the winners** (scale what works). Test new creative against the current winner continuously. Small, data-driven adjustments compound into a profitable campaign. Do not fiddle constantly (let data accumulate), but do act decisively on clear signals.\n\n" +
            "## Judge by ROAS / cost per result, not vanity\n" +
            "The final judgement is *business*: did the campaign make money? If GHS 100 of spend produced GHS 400 of orders (4x ROAS), scale it. If it cost GHS 50 per order on a GHS 30 product, fix it or stop. Likes and reach are means; profit is the end. Today you launch/finalise and analyse, tomorrow you write the report.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A low click-through rate (CTR) usually points to weak creative (the hook/visual is not stopping the scroll).",
              answer: true,
              whenRight: "Yes. Low CTR = creative problem; fix the hook/visual first. Each metric points to a specific fix.",
              whenWrong: "It does. Few clicks per view means the creative is not grabbing attention. Improve the hook and visual.",
            },
            {
              prompt: "Good CTR but no orders points to a problem after the click (the landing/WhatsApp flow or audience fit).",
              answer: true,
              whenRight: "Yes. Clicks but no conversion = friction or wrong-fit after the click. Check the destination and audience.",
              whenWrong: "It does. People click but do not convert, so the problem is the destination or audience, not the ad's hook.",
            },
            {
              prompt: "The right optimisation is to constantly change everything, every hour, chasing better numbers.",
              answer: false,
              whenRight: "Right, no. Let data accumulate, then act decisively, cut clear losers, scale clear winners. Constant fiddling prevents learning.",
              whenWrong: "No. Give it data, then make decisive moves (cut losers, scale winners). Hourly fiddling stops the algorithm learning.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, launch and analyse",
          body:
            "Run or finalise the campaign and analyse:\n\n" +
            "- [ ] Assemble the campaign in Ads Manager (objective, audience+budget, 3 ads)\n" +
            "- [ ] Launch a small test if possible (or finalise as launch-ready)\n" +
            "- [ ] Read the results (or, if projecting, explain what each metric would tell you)\n" +
            "- [ ] Decide what you would cut and what you would scale, and why\n\n" +
            "Tomorrow you turn this into a results/analysis report.",
        },
      ],
    },
    {
      number: 6,
      title: "Build the results and analysis report",
      summary:
        "Today you'll write a professional ad report that interprets the numbers and recommends next steps, the deliverable employers and clients actually want.",
      items: [
        {
          kind: "lesson",
          title: "Anyone can spend; few can report",
          body:
            "## Why the report is the real skill\n" +
            "Running ads is half the job; *interpreting and reporting* them is what makes a marketer valuable. A client or employer does not want to hear 'we got 5,000 impressions'. They want: *did it work, what did we learn, and what should we do next?* A clear ad report, that turns raw numbers into insight and a recommendation, is exactly what proves you can manage a budget responsibly. This is your case study #6.\n\n" +
            "## What a good ad report contains\n" +
            "1. **The setup:** objective, audience, creative, budget, and dates (what you ran and why).\n" +
            "2. **The results:** the key metrics (reach, CTR, CPC, cost per result, ROAS / cost per order), shown clearly. A simple table or a few clean numbers, not a screenshot dump.\n" +
            "3. **The interpretation:** what the numbers *mean*. 'Creative B (taste-of-home angle) had double the CTR of Creative A, the emotional angle resonates most.' 'Cost per WhatsApp message was GHS X, within target.' This is the value, insight, not just data.\n" +
            "4. **The verdict:** did it make money / hit the goal? Be honest, a clear-eyed 'not yet profitable, here is why' is more professional than spin.\n" +
            "5. **The recommendation:** what to do next, scale the winning creative, fix the landing page, test a new audience. A report without a recommendation is incomplete.\n\n" +
            "## If you ran a real test\n" +
            "Use the real numbers, even from a tiny budget. Real data (and an honest analysis of it) makes the strongest possible case study, it shows you actually executed and can interpret reality.\n\n" +
            "## If you did not spend\n" +
            "That is fine, build a *projected* analysis clearly labelled as such: 'here is the campaign I built, the metrics I would track, the targets I would aim for, and how I would interpret and optimise based on each outcome.' This still demonstrates the full skill, planning, metric literacy, and optimisation logic. Either way, the report proves you think in terms of business results, not vanity. Today you write it.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A good ad report turns raw numbers into insight and a clear recommendation, not just a data dump.",
              answer: true,
              whenRight: "Yes. Setup, results, interpretation, verdict, recommendation. The interpretation + recommendation are the real value.",
              whenWrong: "It does. Numbers alone are not a report. Insight ('the emotional angle won') and a next-step recommendation make it valuable.",
            },
            {
              prompt: "An honest 'not yet profitable, here is why and what I'd change' is more professional than spinning the results.",
              answer: true,
              whenRight: "Yes. Clear-eyed analysis builds trust. Marketers who interpret honestly and recommend fixes are the valuable ones.",
              whenWrong: "It is. Honest verdicts plus a fix beat spin. That is what a client or employer actually trusts.",
            },
            {
              prompt: "If you did not spend real money, you cannot demonstrate the paid-ads skill at all.",
              answer: false,
              whenRight: "Wrong, a clearly-labelled projected analysis (campaign built, metrics, targets, optimisation logic) still demonstrates the full skill.",
              whenWrong: "You still can. A labelled projection, the built campaign plus how you would measure and optimise, shows the skill.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, write the report",
          body:
            "Build the results/analysis report:\n\n" +
            "- [ ] Document the setup (objective, audience, creative, budget, dates)\n" +
            "- [ ] Present the key metrics clearly (real or clearly-labelled projection)\n" +
            "- [ ] Write the interpretation (what the numbers mean) and an honest verdict\n" +
            "- [ ] Write a clear recommendation (scale/fix/test what, and why)\n\n" +
            "Tomorrow you package the campaign + report as case study #6.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship it, Meta ad campaign + report (case study #6)",
      summary:
        "Today you'll package the Meta campaign and its analysis report into case study #6.",
      items: [
        {
          kind: "lesson",
          title: "Ship it, you can run paid acquisition",
          body:
            "## Package case study #6\n" +
            "Present **Adwoa's Kitchen, Meta Ad Campaign + Analysis**, with:\n\n" +
            "- A **challenge/approach** opener (Adwoa needed orders faster than organic could deliver; you designed and ran/built a targeted Meta campaign)\n" +
            "- The **campaign**: objective, audience targeting, the 3 ad creatives, and budget plan\n" +
            "- The **results/analysis report**: the metrics, interpretation, verdict, and recommendation\n" +
            "- A note tying it to the funnel (paid acceleration of awareness → consideration → purchase)\n\n" +
            "## Why this is a high-value portfolio piece\n" +
            "Paid advertising is one of the most *directly hireable* marketing skills, businesses pay well for people who can run profitable ad campaigns, because it touches revenue directly. A case study showing you can structure a campaign, target precisely, create converting ads, manage a budget, AND interpret the results responsibly is exactly what employers and clients look for. It proves you can be trusted with ad spend, a real, rare trust.\n\n" +
            "## The responsible-spender signal\n" +
            "Most importantly, your report shows you judge ads by *business results* (ROAS, cost per order), not vanity (likes, reach). That maturity, treating someone's budget as precious and optimising toward profit, is what separates a professional from someone who burns money boosting posts. Save case study #6.\n\n" +
            "Next week: Google Ads. You will learn the *other* giant of paid advertising, capturing people at the moment they search for what they want, a different and complementary kind of paid acquisition to Meta's interest-based reach.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Paid advertising is one of the most directly hireable skills because it touches revenue directly.",
              answer: true,
              whenRight: "Yes. Businesses pay well for people who can run profitable campaigns. A solid ads case study is highly valued.",
              whenWrong: "It is. Ads connect to revenue, so the skill is in demand and well paid. Your case study proves you can do it.",
            },
            {
              prompt: "The strongest signal in your report is judging ads by business results (ROAS, cost per order), not vanity metrics.",
              answer: true,
              whenRight: "Yes. Optimising toward profit and treating the budget as precious is the mark of a professional, not a post-booster.",
              whenWrong: "It is. Business-results thinking (not likes) shows you can be trusted with ad spend. That maturity is the key signal.",
            },
            {
              prompt: "Google Ads (next week) is just a duplicate of Meta ads with nothing new to learn.",
              answer: false,
              whenRight: "Right, Google captures people SEARCHING (high intent, the moment they want it); Meta reaches people by interest. Different and complementary.",
              whenWrong: "They differ. Google catches active searchers (intent); Meta interrupts by interest. Complementary paid channels.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Ship it",
          body:
            "Package and ship case study #6:\n\n" +
            "- [ ] One document titled `Adwoa's Kitchen, Meta Ad Campaign + Analysis`\n" +
            "- [ ] Challenge/approach framing\n" +
            "- [ ] Campaign (objective, audience, creatives, budget) + analysis report, all present\n" +
            "- [ ] Saved in your `Week 06 Meta Ads` portfolio folder\n\n" +
            "Six case studies done, halfway through the track. Next week: Google Ads, capturing high-intent searchers.",
        },
      ],
    },
  ],
};
