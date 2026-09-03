/* Week 4 - SEO Fundamentals (Phase: Search) */
module.exports = {
  number: 4,
  title: "SEO Fundamentals",
  phase: "Search",
  commitment_hours: "7, 11",
  context:
    "Social media reaches people while they scroll. SEO reaches people the moment they go looking. When someone in Accra types 'best jollof delivery near me' or 'where to buy jollof spice mix Ghana' into Google, you want Adwoa's Kitchen to be the answer. SEO (Search Engine Optimisation) is the practice of getting your business to show up in Google's free (organic) search results, and unlike a post that dies in a day, a page that ranks keeps bringing customers for months or years. It is the closest thing in marketing to a machine that works while you sleep.\n\n" +
    "This week you learn how search actually works, how to find the exact words your customers type (keyword research), and how to audit a website and set up the free tools that show you the truth. For Adwoa, SEO opens two huge doors: local search (people nearby looking for food now) and product search (people across Ghana looking for a spice mix to buy).\n\n" +
    "By Sunday you will have produced a complete SEO audit of Adwoa's web presence plus a keyword strategy: the priority search terms to target and the pages to build or fix. That audit + strategy is case study #4, and the brief for the technical and link work in Week 5.",
  concept_check: [
    {
      q: "Someone searches 'jollof spice mix Ghana' and Adwoa's page is result #9. Why does ranking position matter so much?",
      choices: [
        "It does not, all results get equal clicks",
        "The top few results get the vast majority of clicks; page 2 and beyond are almost never seen",
        "Position only matters for paid ads",
        "Lower positions actually get more clicks",
      ],
      correct: 1,
      explain: "Clicks drop off steeply, the top 3 organic results capture most clicks, and almost nobody scrolls to page 2. Moving from #9 to the top three can multiply traffic many times over. Ranking position is everything in SEO.",
    },
    {
      q: "What is 'search intent' and why does it matter for keywords?",
      choices: [
        "The number of times a word is searched",
        "What the searcher actually wants (to learn, to find a local shop, to buy); your page must match that intent to rank and convert",
        "The price of the keyword",
        "Whether the keyword has a hashtag",
      ],
      correct: 1,
      explain: "'Jollof recipe' (wants to learn) and 'buy jollof spice mix' (wants to purchase) are very different intents. Matching your page to the searcher's intent is what makes it rank and convert. Targeting high-volume words with the wrong intent wastes effort.",
    },
    {
      q: "Adwoa is a local Accra business. Why should she care most about 'local SEO'?",
      choices: [
        "Local SEO is cheaper",
        "Most food and 'near me' searches are local; appearing in the local map results and 'near me' searches drives nearby customers ready to buy",
        "Local SEO does not require a website",
        "It only matters for big chains",
      ],
      correct: 1,
      explain: "A huge share of searches have local intent ('near me', 'in Accra'). For a food business, ranking in Google's local map pack and for local terms reaches people physically able to order now, the highest-intent customers there are.",
    },
  ],
  topics: [
    "How search engines crawl, index, and rank",
    "Why ranking position matters (the click curve)",
    "Keyword research and search volume",
    "Search intent (informational, navigational, transactional, local)",
    "On-page SEO basics (titles, headings, content)",
    "Local SEO and Google Business Profile",
    "Free SEO tools (Search Console, Keyword tools)",
    "Running an SEO audit",
  ],
  tasks: [
    "Set up Google Search Console and Google Business Profile",
    "Do keyword research and build a keyword map",
    "Classify keywords by search intent",
    "Audit Adwoa's current web presence",
    "Produce an SEO audit + keyword strategy",
  ],
  project:
    "Produce an SEO audit and keyword strategy for Adwoa's Kitchen: an audit of her current web presence (site, Google Business Profile, on-page basics), a researched keyword map (priority terms grouped by intent: local, transactional, informational), and a prioritised list of pages to create or fix to rank for those terms. Portfolio case study #4.",
  exercises: [
    "Build a keyword list of 20-30 terms and tag each by intent and difficulty",
    "Audit a homepage for on-page SEO basics (title, headings, content)",
    "Set up and optimise a Google Business Profile",
    "Map keywords to specific pages (a keyword-to-page plan)",
  ],
  questions: [
    "How does Google decide what to rank?",
    "What exact words do Adwoa's customers type?",
    "Which pages should exist to capture that search demand?",
  ],
  outputs: [
    "A Google Search Console + Google Business Profile setup",
    "A keyword map grouped by intent",
    "An SEO audit of the current presence",
    "A prioritised keyword-to-page strategy",
  ],
  mastery_questions: [
    "Explain crawl, index, rank in one sentence each",
    "Classify five keywords by intent",
    "Name three on-page SEO essentials",
    "Explain why local SEO matters for a food business",
    "Turn a keyword list into a page plan",
  ],
  ai_assist:
    "AI is great for keyword expansion and intent classification: 'List 30 search terms a Ghanaian customer might type to find or buy jollof and a jollof spice mix; group them by intent (local, buy, learn).' Then VERIFY real demand and difficulty in a keyword tool, AI guesses words but does not know real search volume. Also useful: 'Draft an SEO-friendly title and meta description for a page about [topic], under 60/155 characters.'",
  pre_flight: [
    "A Google account (for Search Console and Business Profile)",
    "Adwoa's website (even a simple one) or a plan to make one",
    "A free keyword tool account (e.g. Ubersuggest free, or Google Keyword Planner)",
  ],
  common_mistakes: [
    "Chasing high-volume keywords with the wrong intent (traffic that never buys)",
    "Ignoring local SEO and the Google Business Profile (huge for a local business)",
    "Stuffing keywords unnaturally instead of writing for humans",
    "No measurement, never setting up Search Console to see real data",
  ],
  debug_help: [
    "Keyword research overwhelming? Start with how YOU would search for Adwoa's food, then expand.",
    "Not sure which keywords to target? Favour lower-competition, high-intent, local terms first.",
    "Site not in Google? Check it is indexed (search 'site:yourdomain.com') and submit it in Search Console.",
  ],
  stretch: [
    "Research competitor websites and note which keywords they rank for",
    "Plan a blog content cluster (recipes) to capture informational searches",
  ],
  resources: [
    "Google Search Console (free)",
    "Google Business Profile (free)",
    "A free keyword tool (Ubersuggest free tier, Google Keyword Planner, or Keywords Everywhere)",
  ],
  days: [
    {
      number: 0,
      title: "How search works, and set up the free tools",
      summary:
        "Today you'll learn how Google finds and ranks pages, then set up the two free tools that reveal the truth: Search Console and Google Business Profile.",
      items: [
        {
          kind: "lesson",
          title: "Crawl, index, rank",
          body:
            "## How Google works in three words\n" +
            "Google does three things. **Crawl:** automated bots follow links across the web and discover pages. **Index:** it stores and understands those pages in a giant library. **Rank:** when someone searches, it picks the pages from its index it thinks best answer that query, and orders them. SEO is the craft of helping Google (1) find your pages, (2) understand them, and (3) decide they are the best answer. Everything in SEO maps to one of those three jobs.\n\n" +
            "## What Google ranks on (simplified)\n" +
            "Google's exact formula is secret and complex, but the big factors are clear:\n\n" +
            "- **Relevance:** does the page match what the searcher wants (intent + keywords)?\n" +
            "- **Quality/authority:** is the page genuinely good, and do other sites link to it (links = votes of trust, Week 5)?\n" +
            "- **Experience:** is the site fast, mobile-friendly, and easy to use?\n" +
            "- **For local:** proximity, the Google Business Profile, and reviews.\n\n" +
            "You cannot trick Google for long. The durable strategy is simple: genuinely be the best, most relevant answer for the searches your customers make, and make sure Google can find and understand you.\n\n" +
            "## Why this beats social, sometimes\n" +
            "A social post is a flash, it reaches people once and fades. A page that ranks is *evergreen*, it keeps appearing in search and bringing customers for months or years, with no ongoing cost. SEO is slower to build than social (it can take weeks or months to rank) but compounds beautifully. For Adwoa, it captures the people actively *looking* to buy, the highest-intent customers, exactly when they want her.\n\n" +
            "This week you find those searchers' words and build the plan to be their answer.",
        },
        {
          kind: "lesson",
          title: "Set up Search Console and Business Profile",
          body:
            "## Two free tools that change everything\n" +
            "**1. Google Search Console (GSC).** This free tool shows you the *truth* about how Adwoa's site performs in Google: which searches show her site, how many clicks she gets, her average ranking position, and any technical problems. Without it, you are guessing. Set it up at search.google.com/search-console: add the website, verify ownership (Google walks you through it), and submit the sitemap. If Adwoa has no site yet, note this and set GSC up the moment she does, the audit this week will recommend building one.\n\n" +
            "**2. Google Business Profile (GBP).** For a *local* business this is arguably more important than the website. It is the free listing that makes Adwoa appear in Google Maps and in the 'local pack' (the map + three businesses) when people search 'jollof near me' or 'food delivery Accra'. Set it up at business.google.com: add the business name, category (Restaurant / Caterer), location/service area, hours, phone, photos, and the menu. A complete, photo-rich, well-reviewed GBP is one of the highest-ROI SEO actions a local business can take, and it is free.\n\n" +
            "## Why GBP is a quick win\n" +
            "Most local searches end in the local pack, not the blue links. A great GBP (complete info + lots of real photos + steady reviews) can win local customers *even before* the website ranks. For Adwoa, optimising GBP is the fastest SEO win available. Today you set up both tools, the eyes and the local engine of your SEO work.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Google's three core jobs are crawl (find pages), index (store/understand), and rank (order results).",
              answer: true,
              whenRight: "Yes. SEO is helping Google find, understand, and choose your pages as the best answer. Everything maps to those three.",
              whenWrong: "Those are the three: crawl, index, rank. SEO works on all three, be findable, understandable, and the best answer.",
            },
            {
              prompt: "A page that ranks keeps bringing visitors for months, unlike a social post that fades in a day.",
              answer: true,
              whenRight: "Yes. SEO is evergreen and compounding, slower to build than social, but it keeps working with no ongoing cost.",
              whenWrong: "It is. Ranking pages are durable assets; social posts are flashes. SEO compounds over time.",
            },
            {
              prompt: "For a local food business, the Google Business Profile is a low-value extra.",
              answer: false,
              whenRight: "Wrong, it is one of the highest-ROI SEO actions. A great GBP wins local pack and map customers, often before the website even ranks.",
              whenWrong: "It is high-value. GBP puts Adwoa in the local map pack for 'near me' searches, the fastest local SEO win there is.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, set up the SEO tools",
          body:
            "Get the SEO foundation in place:\n\n" +
            "- [ ] Google Search Console set up (or noted as next-step if there is no site yet)\n" +
            "- [ ] Google Business Profile created/claimed and filled in (category, location, hours, phone)\n" +
            "- [ ] At least 5 real photos and the menu added to the GBP\n" +
            "- [ ] A plan to gather reviews (the GBP review signal)\n\n" +
            "Then write one sentence: what would YOU type into Google to find or buy Adwoa's food? That instinct is the start of keyword research.",
        },
      ],
    },
    {
      number: 1,
      title: "Orient, the SEO audit and keyword strategy",
      summary:
        "Today you'll see the full deliverable, an SEO audit plus a keyword strategy, and why it is the foundation of everything search-related.",
      items: [
        {
          kind: "lesson",
          title: "Audit first, then strategy",
          body:
            "## Why audit before you act\n" +
            "You cannot improve what you have not measured. An **SEO audit** is an honest assessment of where Adwoa stands today: Does she have a website? Is it in Google's index? Is it mobile-friendly and fast? Does it use the right titles and headings? Is the Google Business Profile complete and reviewed? Where is she losing search visibility? The audit reveals the gaps, and the gaps become your to-do list. Skipping the audit means guessing.\n\n" +
            "## The two halves of this week\n" +
            "1. **The audit (Days 2 + 6):** assess the current presence, on-page basics, technical basics, local presence, and what is missing.\n" +
            "2. **The keyword strategy (Days 3-5):** find the exact terms customers search, classify them by intent, judge their difficulty, and map them to pages, the plan for what to rank for and how.\n\n" +
            "Together they answer: *where are we, where do we want to rank, and what must we build or fix to get there?*\n\n" +
            "## Two opportunities for Adwoa\n" +
            "Keyword research will reveal two distinct search markets:\n\n" +
            "- **Local intent:** 'jollof delivery Accra', 'food near me', 'caterer East Legon', people ready to order food now. Won mainly through GBP + local pages.\n" +
            "- **Product intent:** 'buy jollof spice mix', 'best jollof seasoning Ghana', 'jollof recipe', people across Ghana who could buy her shippable products. Won through product pages and helpful content (recipes).\n\n" +
            "A smart strategy serves both. Today you frame the audit + strategy you will build, and confirm the goal: capture the people actively searching for what Adwoa sells.\n\n" +
            "## SEO is patient money\n" +
            "Manage expectations: SEO is a medium-to-long game. A new page may take weeks or months to rank. But once it does, it pays back indefinitely. This week you build the *foundation and plan*; the results compound over the coming months. It is the patient, durable counterpart to social's fast, fading reach.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "An SEO audit is worth doing because the gaps it finds become your prioritised to-do list.",
              answer: true,
              whenRight: "Yes. Audit first, you cannot improve what you have not measured. The gaps are the work.",
              whenWrong: "It is. The audit reveals where you stand and what is missing, which becomes the action plan.",
            },
            {
              prompt: "SEO usually delivers results within a day or two, like a social post.",
              answer: false,
              whenRight: "Right, SEO is a medium-to-long game (weeks to months to rank), but the results then compound and last. It is patient money.",
              whenWrong: "No, SEO is slower to build than social, weeks or months, but durable. Set expectations accordingly.",
            },
            {
              prompt: "Adwoa has two distinct search markets: local food searches and shippable-product searches.",
              answer: true,
              whenRight: "Yes. Local intent (food near me) and product intent (buy spice mix) are different markets; a smart strategy serves both.",
              whenWrong: "She does, local food demand and Ghana-wide product demand. The keyword strategy should address both.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, frame the deliverable",
          body:
            "Start your `SEO Audit + Strategy` doc:\n\n" +
            "- [ ] List the audit areas you will assess (site/index, on-page, technical, local/GBP)\n" +
            "- [ ] Note the two search markets (local + product) you will target\n" +
            "- [ ] Write the goal in one line (capture high-intent searchers for Adwoa's food + products)\n" +
            "- [ ] Set a realistic expectation note (SEO compounds over months)\n\n" +
            "Tomorrow you do the heart of SEO: keyword research.",
        },
      ],
    },
    {
      number: 2,
      title: "Keyword research, the words customers type",
      summary:
        "Today you'll find the exact search terms Adwoa's customers use, the single most important SEO skill.",
      items: [
        {
          kind: "lesson",
          title: "Rank for what people actually search",
          body:
            "## SEO starts with the customer's words, not yours\n" +
            "The most common SEO mistake is optimising for words *you* use, not words *customers* type. Adwoa might call it 'artisanal West African seasoning blend'; customers type 'jollof spice mix' or 'jollof seasoning'. **Keyword research** is finding the real words, the actual phrases people type into Google, so you can build pages that match. Get this wrong and you rank for things nobody searches; get it right and you meet customers exactly where they are looking.\n\n" +
            "## How to find keywords (free)\n" +
            "1. **Start with your own instinct:** how would you search for Adwoa's food and products? Write a seed list.\n" +
            "2. **Google autocomplete + 'People also ask' + 'related searches':** type a seed term into Google and harvest the suggestions, these are real queries people make. Free and gold.\n" +
            "3. **A keyword tool:** Google Keyword Planner (free with a Google Ads account), Ubersuggest (limited free), or Keywords Everywhere show *search volume* (how many people search a term) and *difficulty* (how hard to rank). This turns guesses into data.\n" +
            "4. **Competitors and local accounts:** what terms do other food businesses target?\n\n" +
            "## Volume vs difficulty vs intent (the trade-off)\n" +
            "Each keyword has three attributes you weigh:\n\n" +
            "- **Volume:** how many search it. Higher is more potential traffic, but...\n" +
            "- **Difficulty:** how hard to rank (high-volume terms are usually competitive). A new small site cannot win '#food'.\n" +
            "- **Intent:** what the searcher wants (covered tomorrow).\n\n" +
            "The sweet spot for a small business is often **long-tail keywords**: longer, more specific phrases ('where to buy jollof spice mix in Accra') that have *lower* volume but *much* lower difficulty and *higher* intent. Ten long-tail terms you can actually rank for beat one giant term you never will. Go after winnable, high-intent terms first.\n\n" +
            "Today you build a keyword list of 20-30 real terms with their rough volume and difficulty.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "You should optimise for the words YOU use to describe the product, not the words customers type.",
              answer: false,
              whenRight: "Flip it. Use the customer's actual words ('jollof spice mix'), not your internal jargon. Keyword research finds the real terms.",
              whenWrong: "No, use the customer's words. Optimising for your own jargon means ranking for things nobody searches.",
            },
            {
              prompt: "Google autocomplete and 'People also ask' are free sources of real customer search terms.",
              answer: true,
              whenRight: "Yes. Those suggestions are real queries people make. Harvesting them is free, fast keyword research.",
              whenWrong: "They are. Autocomplete, 'People also ask', and related searches reveal real terms, no paid tool needed.",
            },
            {
              prompt: "A new small site should usually target long-tail, lower-competition keywords first.",
              answer: true,
              whenRight: "Yes. Long-tail terms ('buy jollof spice mix in Accra') are winnable and high-intent. Ten you can rank for beat one giant term you cannot.",
              whenWrong: "It should. Specific long-tail terms are lower difficulty and higher intent, exactly what a small site can win.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, research keywords",
          body:
            "Build Adwoa's keyword list:\n\n" +
            "- [ ] Write a seed list of 10 terms from your own instinct\n" +
            "- [ ] Expand using Google autocomplete, 'People also ask', and related searches\n" +
            "- [ ] Pull rough volume/difficulty from a free keyword tool\n" +
            "- [ ] Build a list of 20-30 real terms, flagging the long-tail, winnable ones\n\n" +
            "Tomorrow you classify them by what the searcher actually wants, intent.",
        },
      ],
    },
    {
      number: 3,
      title: "Search intent, matching the page to the need",
      summary:
        "Today you'll classify keywords by intent, the key to choosing terms that actually convert, not just attract traffic.",
      items: [
        {
          kind: "lesson",
          title: "Volume is vanity, intent is sales",
          body:
            "## The same word, different needs\n" +
            "'Jollof' could mean someone wants a recipe, the history of the dish, a restaurant near them, or to buy a spice mix. If your page does not match what the searcher *wants*, you will not rank (Google matches intent) and even if you do, they will not convert. **Search intent** is the *why* behind a query, and matching it is what separates traffic that buys from traffic that bounces.\n\n" +
            "## The four intents\n" +
            "1. **Informational** (wants to learn): 'how to make jollof', 'jollof recipe'. Huge volume, low buying intent now, but builds trust and audience (a recipe blog can attract Akosua, then convert her later). Match with helpful content/blog posts.\n" +
            "2. **Navigational** (looking for a specific brand/site): 'Adwoa's Kitchen Accra'. You want to own your brand search.\n" +
            "3. **Transactional** (wants to buy now): 'buy jollof spice mix', 'order jollof delivery Accra'. Lower volume, *highest* value, these people are ready to spend. Match with product/order pages. Prioritise these.\n" +
            "4. **Local** (wants something nearby): 'food near me', 'caterer in Osu'. Very high intent for a local business, win with GBP + local pages.\n\n" +
            "## Match the page to the intent\n" +
            "Each keyword should map to a page *designed for its intent*. 'Buy jollof spice mix' → a product page with price, photos, and an order button. 'Jollof recipe' → a recipe blog post (with a soft nudge to buy the mix). 'Food delivery Accra' → a clear local landing page + GBP. Putting a recipe where someone wants to buy (or a sales page where someone wants to learn) fails both Google and the customer.\n\n" +
            "## The smart mix for Adwoa\n" +
            "Prioritise **transactional + local** terms (they convert directly), use **informational** content (recipes) to attract and build trust at the top of the funnel, and own your **navigational** brand term. Today you tag every keyword from yesterday with its intent and value, turning a raw list into a strategic one.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "'Buy jollof spice mix' and 'jollof recipe' have the same search intent.",
              answer: false,
              whenRight: "Right, different intents: one wants to BUY (transactional), one wants to LEARN (informational). They need different pages.",
              whenWrong: "They differ, buy vs learn. Matching the page to the right intent is what makes it rank and convert.",
            },
            {
              prompt: "Transactional keywords have lower volume but higher value because the searcher is ready to buy.",
              answer: true,
              whenRight: "Yes. Fewer people search 'buy X', but those who do are ready to spend. Prioritise these high-intent terms.",
              whenWrong: "True. 'Buy' searches are lower volume but the highest value, ready-to-purchase intent. Prioritise them.",
            },
            {
              prompt: "Informational content like recipes is useless because those searchers are not ready to buy.",
              answer: false,
              whenRight: "Wrong, recipes attract and build trust with future buyers (like Akosua), then gently nudge them to the product. Top-of-funnel SEO.",
              whenWrong: "It is valuable, recipe content attracts and warms up future customers, then soft-sells the spice mix. It feeds the funnel.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, classify by intent",
          body:
            "Turn your keyword list into a strategy:\n\n" +
            "- [ ] Tag every keyword with its intent (informational / navigational / transactional / local)\n" +
            "- [ ] Mark the high-value transactional and local terms as priorities\n" +
            "- [ ] Note which informational terms could become trust-building content\n" +
            "- [ ] Confirm you own your brand (navigational) term\n\n" +
            "Tomorrow you turn this into on-page SEO: how a single page is built to rank.",
        },
      ],
    },
    {
      number: 4,
      title: "On-page SEO, building a page that ranks",
      summary:
        "Today you'll learn the on-page basics that tell Google what a page is about and make it rank for its target keyword.",
      items: [
        {
          kind: "lesson",
          title: "Help Google understand the page",
          body:
            "## On-page SEO in plain terms\n" +
            "On-page SEO is optimising the elements *on* a page so Google understands what it is about and ranks it for the right keyword. It is the most controllable part of SEO, you own these elements completely. The principle: each page should target *one* primary keyword (and its close variations) and signal that clearly, while genuinely being the best answer for it.\n\n" +
            "## The on-page essentials\n" +
            "1. **Title tag:** the clickable headline in search results and the strongest on-page signal. Put the target keyword near the front, keep it under ~60 characters, and make it compelling. E.g. *'Jollof Spice Mix, Restaurant Taste in 20 Minutes | Adwoa's Kitchen'.*\n" +
            "2. **Meta description:** the snippet under the title. Not a direct ranking factor, but it drives clicks, write a benefit-led ~155-character summary with the keyword and a reason to click.\n" +
            "3. **URL:** short, readable, keyword-included: `/jollof-spice-mix` not `/product?id=4821`.\n" +
            "4. **Headings (H1, H2):** one clear H1 (the page's main heading, includes the keyword), then H2s structuring the content. Headings help Google (and readers) understand structure.\n" +
            "5. **Body content:** genuinely useful, thorough content that covers the topic and naturally includes the keyword and related terms, written for *humans first*. Thin or duplicate content does not rank.\n" +
            "6. **Images:** real photos with descriptive file names and alt text (e.g. alt='jollof spice mix jar Adwoa's Kitchen'), which also helps accessibility and image search.\n" +
            "7. **Internal links:** link between your pages (the recipe blog links to the product page), helping Google crawl and passing relevance.\n\n" +
            "## Write for humans, signal for Google\n" +
            "The golden rule: write genuinely helpful content for people, then make sure the keyword is clearly present in the title, URL, H1, and naturally in the body. Do *not* keyword-stuff (cramming the keyword 50 times), Google penalises it and humans hate it. A page that truly answers the query, with clean on-page signals, is what ranks. Today you audit/plan a page against these essentials.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "The title tag is one of the strongest on-page signals and should include the target keyword near the front.",
              answer: true,
              whenRight: "Yes. The title is the headline in search and a top signal. Keyword near the front, under ~60 chars, compelling.",
              whenWrong: "It is. The title tag is a major signal and the clickable headline. Lead with the keyword, keep it tight.",
            },
            {
              prompt: "Repeating the keyword 50 times on a page ('keyword stuffing') boosts rankings.",
              answer: false,
              whenRight: "Right, it backfires. Google penalises stuffing and humans hate it. Write naturally for people; signal clearly in title/H1/URL.",
              whenWrong: "No, stuffing hurts you. Write for humans and place the keyword naturally in the key spots. Quality content ranks.",
            },
            {
              prompt: "Each page should target one primary keyword and signal it clearly while being the best answer for it.",
              answer: true,
              whenRight: "Yes. One page, one primary keyword (plus variations), clearly signalled and genuinely the best answer. That is on-page SEO.",
              whenWrong: "It should. Focus each page on one primary keyword, signal it in the key elements, and make the content truly the best answer.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, plan the pages",
          body:
            "Apply on-page SEO to Adwoa's priority keywords:\n\n" +
            "- [ ] For your top 3 priority keywords, draft the title tag, meta description, URL, and H1\n" +
            "- [ ] Outline the content each page needs to genuinely be the best answer\n" +
            "- [ ] If a page already exists, audit it against the seven essentials and note fixes\n" +
            "- [ ] Plan internal links between the pages (e.g. recipe blog → product page)\n\n" +
            "Tomorrow: local SEO, the biggest opportunity for a food business.",
        },
      ],
    },
    {
      number: 5,
      title: "Local SEO, winning the map and 'near me'",
      summary:
        "Today you'll focus on local SEO, the highest-ROI search opportunity for Adwoa, getting found by nearby customers ready to order.",
      items: [
        {
          kind: "lesson",
          title: "Be the answer to 'near me'",
          body:
            "## Why local SEO is Adwoa's biggest win\n" +
            "When someone searches 'jollof near me', 'food delivery Accra', or 'caterer in East Legon', Google shows a *local pack*: a map plus three local businesses, above the normal results. For a food business, these searches are pure gold, the searcher is nearby and ready to order *now*. Winning local SEO often matters more than ranking a website, and it is faster to achieve. This is where Adwoa should focus first.\n\n" +
            "## What drives local rankings\n" +
            "Google's local results weigh three things:\n\n" +
            "1. **Relevance:** does the business match the search? (Right category, services, keywords in the profile and site.)\n" +
            "2. **Distance:** how close is the business to the searcher? (You cannot change location, but you set your service area.)\n" +
            "3. **Prominence:** how well-known/trusted is the business? Driven heavily by **reviews** (quantity, quality, recency) and a complete, active profile.\n\n" +
            "## The local SEO checklist\n" +
            "1. **A complete Google Business Profile** (set up Day 0): correct name, category, address/service area, hours, phone, website, and a full description with local keywords.\n" +
            "2. **Lots of real photos**, regularly added, food, the kitchen, packaging. Photos drive engagement and trust.\n" +
            "3. **Reviews, reviews, reviews.** Actively ask happy customers to leave a Google review (a simple link, a gentle ask after an order). Reply to every review. Reviews are the single biggest local-ranking and trust lever. A steady stream of recent 5-star reviews beats almost anything.\n" +
            "4. **NAP consistency:** the business Name, Address, Phone must be *identical* everywhere online (website, profile, social, directories). Inconsistency confuses Google.\n" +
            "5. **Local keywords on the website:** mention the areas served ('jollof delivery in East Legon, Osu, and Cantonments').\n" +
            "6. **Posts and updates** on the GBP (specials, new dishes), it keeps the profile active.\n\n" +
            "## The review engine\n" +
            "If Adwoa does one local SEO thing, it is *systematically collecting reviews*. Build a simple habit: after every order, send the customer a friendly message with a direct review link. Even 20-30 genuine recent reviews can transform local visibility and trust. Today you build the local SEO plan and a review-collection system.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "For 'jollof near me' searches, Google shows a local pack (map + nearby businesses) above the normal results.",
              answer: true,
              whenRight: "Yes. The local pack is prime real estate for high-intent nearby searchers. Winning it is a top priority for a food business.",
              whenWrong: "It does. The local pack sits above the blue links for 'near me' searches, the gold spot for a local business.",
            },
            {
              prompt: "Reviews are one of the biggest levers for local ranking and trust.",
              answer: true,
              whenRight: "Yes. Quantity, quality, and recency of reviews heavily drive local prominence. Systematically collecting reviews is the #1 local SEO habit.",
              whenWrong: "They are. Reviews are a top local-ranking and trust factor. Build a habit of asking every happy customer.",
            },
            {
              prompt: "It is fine if the business name, address, and phone differ slightly across the website, profile, and social.",
              answer: false,
              whenRight: "Wrong, NAP must be identical everywhere. Inconsistency confuses Google and weakens local ranking. Keep it exactly consistent.",
              whenWrong: "It is not fine, Name/Address/Phone must match exactly everywhere. Inconsistency hurts local SEO.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build the local SEO plan",
          body:
            "Create Adwoa's local SEO plan:\n\n" +
            "- [ ] Complete the GBP optimisation checklist (category, description with local keywords, photos)\n" +
            "- [ ] Design a review-collection system (a direct review link + an after-order ask)\n" +
            "- [ ] Confirm NAP consistency across all of Adwoa's online presence\n" +
            "- [ ] List the local keywords and service areas to feature on the site\n\n" +
            "Tomorrow you assemble the full audit + strategy.",
        },
      ],
    },
    {
      number: 6,
      title: "Run the audit, assemble the strategy",
      summary:
        "Today you'll complete the SEO audit and combine it with your keyword work into one prioritised strategy.",
      items: [
        {
          kind: "lesson",
          title: "From findings to a prioritised plan",
          body:
            "## Complete the audit\n" +
            "Pull together an honest assessment of Adwoa's current search presence across four areas:\n\n" +
            "- **Website/index:** Is there a site? Is it in Google (search `site:domain.com`)? Is it mobile-friendly and reasonably fast? (Check in Search Console / on a phone.)\n" +
            "- **On-page:** Do key pages have good titles, headings, content, and image alt text? Or are they thin/missing?\n" +
            "- **Local:** Is the GBP complete, photo-rich, and reviewed? Is NAP consistent?\n" +
            "- **Gaps:** What high-intent searches have *no page* to capture them? (e.g. no product page for 'jollof spice mix', no local landing page.)\n\n" +
            "Each finding is either a *fix* (improve what exists) or a *build* (create what is missing).\n\n" +
            "## Prioritise by impact and effort\n" +
            "You cannot do everything at once. Prioritise the actions that are *high impact and low effort* first:\n\n" +
            "- **Quick wins:** optimise the GBP, start collecting reviews, fix titles/meta on key pages, ensure indexing. (High impact, fast.)\n" +
            "- **Medium:** build the priority pages (product page for the spice mix, local landing pages) targeting transactional/local keywords.\n" +
            "- **Longer-term:** a recipe blog to capture informational searches and build authority; link building (Week 5).\n\n" +
            "A great strategy is a *prioritised* list, not a wish-list. It tells someone exactly what to do first, second, third, and why.\n\n" +
            "## Map keywords to pages\n" +
            "The heart of the strategy is the keyword-to-page map: for each priority keyword, the page that will target it (existing or to-build), its intent, and its title/H1. This is the blueprint, it turns research into a concrete build plan. Anyone could pick it up and execute.\n\n" +
            "Today you finish the audit and assemble the prioritised strategy. Tomorrow you ship it.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A good SEO strategy is a prioritised list of actions, not an unordered wish-list.",
              answer: true,
              whenRight: "Yes. Prioritise by impact and effort, quick wins first (GBP, reviews, titles), then builds, then long-term. Order is the strategy.",
              whenWrong: "It should be prioritised. Tell someone what to do first (high-impact, low-effort), not just a pile of tasks.",
            },
            {
              prompt: "Optimising the Google Business Profile and collecting reviews are quick, high-impact wins.",
              answer: true,
              whenRight: "Yes. For a local food business, GBP + reviews deliver fast, large gains, do them first.",
              whenWrong: "They are. GBP optimisation and reviews are the fastest, highest-ROI SEO actions for a local business.",
            },
            {
              prompt: "The keyword-to-page map turns research into a concrete build plan anyone could execute.",
              answer: true,
              whenRight: "Yes. Mapping each priority keyword to a specific page (with intent and title) is the blueprint that makes the strategy actionable.",
              whenWrong: "It does. The keyword-to-page map is the executable heart of the strategy, research becomes a build list.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, finish audit + strategy",
          body:
            "Complete the deliverable:\n\n" +
            "- [ ] Finish the four-area audit (website/index, on-page, local, gaps)\n" +
            "- [ ] Mark each finding as a fix or a build\n" +
            "- [ ] Prioritise actions into quick wins / medium / long-term\n" +
            "- [ ] Build the keyword-to-page map (keyword → page → intent → title/H1)\n\n" +
            "Tomorrow you package it as case study #4.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship it, SEO audit + keyword strategy (case study #4)",
      summary:
        "Today you'll package the SEO audit and keyword strategy into case study #4 of your portfolio.",
      items: [
        {
          kind: "lesson",
          title: "Ship it, the SEO blueprint",
          body:
            "## Package case study #4\n" +
            "Present a clean document titled **Adwoa's Kitchen, SEO Audit + Keyword Strategy**, with:\n\n" +
            "- A **challenge/approach** opener (Adwoa was invisible in search; you audited her presence and built a keyword-driven plan to capture high-intent searchers)\n" +
            "- The **audit findings** (website/index, on-page, local, gaps), clearly summarised\n" +
            "- The **keyword strategy**: the keyword map grouped by intent, with priorities marked\n" +
            "- The **keyword-to-page plan** (what to build/fix to rank)\n" +
            "- The **prioritised action list** (quick wins → medium → long-term)\n\n" +
            "## Why this is a serious portfolio piece\n" +
            "SEO is one of the most valued (and well-paid) marketing skills, and most people find it intimidating. A clear audit + keyword strategy proves you can do the analytical, technical-leaning side of marketing, not just create content. It shows an employer you understand how customers find businesses through search and how to capture that demand systematically. This case study sets you apart from 'social media only' marketers.\n\n" +
            "## The evergreen value\n" +
            "Remind yourself (and note in the case study) what makes SEO special: unlike ads or social, a ranking page keeps delivering customers for months and years with no ongoing spend. By building Adwoa an SEO foundation, you have given her a compounding asset. That long-term, systems thinking is exactly what senior marketers bring.\n\n" +
            "Save case study #4. Next week: SEO Advanced, the technical SEO and link building that turn this foundation into actual rankings.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "An SEO audit + keyword strategy proves you can do the analytical side of marketing, not just content.",
              answer: true,
              whenRight: "Yes. SEO is a valued, intimidating-to-many skill. A clear audit + strategy sets you apart from 'social only' marketers.",
              whenWrong: "It does. SEO demonstrates analytical, systematic marketing thinking, a strong, well-paid differentiator.",
            },
            {
              prompt: "A ranking page keeps delivering customers for months with no ongoing ad spend.",
              answer: true,
              whenRight: "Yes, that compounding, evergreen value is what makes SEO a long-term asset. Note it in the case study.",
              whenWrong: "It does. SEO is a durable, compounding asset, unlike ads that stop when payment stops.",
            },
            {
              prompt: "The keyword strategy is only theory and will not guide the next week's work.",
              answer: false,
              whenRight: "Wrong, it is the brief for Week 5's technical SEO and link building. Live, forward-feeding work.",
              whenWrong: "It feeds forward, next week's technical and link work executes against this exact strategy.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Ship it",
          body:
            "Package and ship case study #4:\n\n" +
            "- [ ] One document titled `Adwoa's Kitchen, SEO Audit + Keyword Strategy`\n" +
            "- [ ] Challenge/approach framing\n" +
            "- [ ] Audit findings, keyword map, keyword-to-page plan, prioritised actions, all present\n" +
            "- [ ] Saved in your `Week 04 SEO` portfolio folder\n\n" +
            "Four case studies done. Next week: SEO Advanced, technical SEO + link building.",
        },
      ],
    },
  ],
};
