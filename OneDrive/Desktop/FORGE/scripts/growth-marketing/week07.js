/* Week 7 - Paid Advertising: Google (Phase: Paid Acquisition) */
module.exports = {
  number: 7,
  title: "Paid Advertising (Google)",
  phase: "Paid Acquisition",
  commitment_hours: "7, 11",
  context:
    "Meta ads (last week) interrupt people based on their interests, you reach someone who might want jollof while they scroll. Google Ads is the opposite and complementary: you reach people at the exact moment they are *actively searching* for what you sell. When someone types 'jollof spice mix Ghana' or 'food delivery Accra' into Google, that is the highest-intent moment there is, they want it now, and a Google ad puts Adwoa at the top of the results instantly (above even the organic listings you are slowly building with SEO).\n\n" +
    "This is the power of search advertising: intent. A person searching 'buy jollof spice mix' has their wallet half-out. The skill is capturing that intent profitably, choosing the right keywords, writing ads that match the search, sending people to a page that converts, and not paying for the wrong clicks. Google Ads can be the most profitable channel of all because the intent is so high, or a money pit if you bid on the wrong terms.\n\n" +
    "By Sunday you will have built a complete Google Search ad campaign for Adwoa's Kitchen and an optimisation plan/report. That campaign + plan is case study #7, completing your paid-acquisition expertise across both giants, Meta (interest) and Google (intent).",
  concept_check: [
    {
      q: "What is the fundamental difference between a Google Search ad and a Meta ad?",
      choices: [
        "Google ads are cheaper",
        "Google Search ads reach people actively SEARCHING for something (high intent, demand capture); Meta ads reach people by interest while they scroll (demand creation)",
        "Meta ads are only images, Google ads are only text",
        "There is no real difference",
      ],
      correct: 1,
      explain: "Google = capturing existing demand (someone already wants it and is searching). Meta = creating/stimulating demand (interrupting someone who was not actively looking). Both are valuable; Google's high-intent searchers often convert at higher rates, which is why search ads can be so profitable.",
    },
    {
      q: "Adwoa bids on the broad keyword 'food' and pays for clicks from people searching 'free food', 'food poisoning', 'dog food'. What concept would have prevented this waste?",
      choices: [
        "Bidding higher",
        "Keyword match types and negative keywords, controlling exactly which searches trigger the ad and excluding irrelevant ones",
        "Using more keywords",
        "Switching to Meta",
      ],
      correct: 1,
      explain: "Broad, untargeted keywords waste money on irrelevant searches. Match types (broad/phrase/exact) control how closely a search must match, and negative keywords (e.g. 'free', 'dog', 'jobs') exclude searches you do NOT want. This precision is the core skill of profitable search ads.",
    },
    {
      q: "Why does the landing page matter so much for a Google Search ad?",
      choices: [
        "It does not, the ad does all the work",
        "A high-intent searcher who clicks must land on a relevant page that lets them act immediately; a mismatched or slow page wastes the click and the money",
        "Google does not look at the landing page",
        "Landing pages only matter for Meta",
      ],
      correct: 1,
      explain: "Someone searching 'buy jollof spice mix' must land on the spice mix product/order page, not the homepage. A relevant, fast, conversion-focused landing page turns the expensive high-intent click into a sale. Google also rewards relevant landing pages with lower costs (Quality Score). Mismatch = wasted spend.",
    },
  ],
  topics: [
    "Search ads vs interest ads (intent vs interest)",
    "How Google Ads and the search auction work",
    "Keywords and match types",
    "Negative keywords",
    "Writing search ad copy (responsive search ads)",
    "Landing pages and Quality Score",
    "Budgets, bids, and conversion tracking",
    "Reading results and optimising",
  ],
  tasks: [
    "Set up a Google Ads account",
    "Build a keyword list with match types",
    "Create a negative keyword list",
    "Write responsive search ad copy",
    "Build a campaign + optimisation plan/report",
  ],
  project:
    "Build a complete Google Search ad campaign for Adwoa's Kitchen: targeted keywords with match types, a negative keyword list, responsive search ad copy, the right landing page, a budget, and conversion tracking, plus an optimisation plan/report (real metrics from a small test if possible, or a projected analysis). Portfolio case study #7.",
  exercises: [
    "Build a keyword list grouped by theme, with chosen match types",
    "Write a negative keyword list of 15+ terms",
    "Write a responsive search ad (headlines + descriptions)",
    "Map each keyword group to the right landing page",
  ],
  questions: [
    "What is the searcher's intent, and how do you match it?",
    "Which searches should trigger the ad, and which must be excluded?",
    "Did the high-intent clicks convert profitably?",
  ],
  outputs: [
    "A keyword list with match types and negative keywords",
    "Responsive search ad copy",
    "A landing-page mapping",
    "A campaign + optimisation report",
  ],
  mastery_questions: [
    "Explain intent (Google) vs interest (Meta) advertising",
    "Define broad, phrase, and exact match",
    "Explain negative keywords with an example",
    "Explain Quality Score and why landing pages matter",
    "Read a search campaign report and decide what to optimise",
  ],
  ai_assist:
    "Use AI to build keyword groups, negatives, and ad copy: 'Group these keywords into tight themed ad groups', 'Suggest 20 negative keywords for a jollof spice mix campaign (exclude jobs, free, recipes if selling)', 'Write 12 headlines and 4 descriptions for a responsive search ad selling jollof spice mix, benefit-led, under the character limits.' Verify match to real search intent and edit for the local market. AI is fast at the structured, list-heavy parts of search ads.",
  pre_flight: [
    "Your Week 4 keyword research (directly reusable here)",
    "A Google account and a landing page (product/order page) for clicks to land on",
    "Week 6 understanding of campaign structure and metrics",
    "A small test budget is optional but valuable",
  ],
  common_mistakes: [
    "Bidding on broad keywords with no negatives (paying for irrelevant clicks)",
    "Sending all clicks to the homepage instead of a matching landing page",
    "Ignoring search intent (bidding on 'jollof recipe' when you sell a product)",
    "Not tracking conversions, so you cannot tell which keywords make money",
  ],
  debug_help: [
    "Wasting money? Check the Search Terms report for the actual queries triggering your ad, add negatives.",
    "Clicks but no sales? The landing page likely does not match the search or has friction.",
    "High costs? Tighten match types, improve ad relevance and the landing page (raises Quality Score, lowers cost).",
  ],
  stretch: [
    "Plan a Google Business Profile / local search ad angle for 'near me' searches",
    "Sketch a remarketing concept (show display ads to people who visited but did not buy)",
  ],
  resources: [
    "Google Ads (free to use; you pay for clicks)",
    "Your Week 4 keyword research",
    "Google Ads Keyword Planner",
  ],
  days: [
    {
      number: 0,
      title: "Intent vs interest, and set up Google Ads",
      summary:
        "Today you'll learn why search ads capture the highest-intent moment in marketing, and set up a Google Ads account.",
      items: [
        {
          kind: "lesson",
          title: "Catch them at the moment of wanting",
          body:
            "## Demand capture vs demand creation\n" +
            "There are two kinds of paid advertising, and understanding the difference makes you choose the right tool:\n\n" +
            "- **Meta (demand creation/stimulation):** you interrupt someone scrolling, who was *not* actively looking for jollof, and create the want. Great for awareness and impulse, but you are persuading.\n" +
            "- **Google Search (demand capture):** you reach someone who is *already* searching, 'buy jollof spice mix', 'food delivery Accra', at the exact moment they want it. You are not creating the want; you are *capturing* it. The person has high intent, often wallet-out.\n\n" +
            "Because the intent is so high, search ads often convert at higher rates than interest ads, someone searching 'order jollof Accra' is far closer to buying than someone who merely 'likes cooking'. This is why Google Ads can be the single most profitable channel: you pay to be the answer at the moment of maximum intent.\n\n" +
            "## Google complements your SEO\n" +
            "Google Ads and SEO target the same searchers, but ads put you at the *top instantly* (paid results sit above organic), while SEO earns the spot slowly and freely. Smart businesses use both: ads for instant presence on high-value searches *while* SEO builds the free, long-term ranking. Your Week 4 keyword research feeds *directly* into this, the same keywords, now used to buy clicks immediately. Nothing is wasted.\n\n" +
            "## The double-edged sword\n" +
            "High intent means high value, but search ads punish carelessness. You pay *per click*, so if your keywords are too broad, you pay for irrelevant searches; if your landing page does not match, you pay for clicks that bounce. The skill this week is *precision*, bidding only on the right searches, excluding the wrong ones, and converting the click. Done right, profitable; done carelessly, a money pit. Today you set up the account.",
        },
        {
          kind: "lesson",
          title: "Set up your Google Ads account",
          body:
            "## Get the account ready\n" +
            "**1. Create a Google Ads account** at ads.google.com with Adwoa's Google account. Google will try to push you into the simplified 'Smart' mode during signup, look for the option to switch to **Expert mode** (sometimes 'Create an account without a campaign'), which gives you full control (the proper tool, like Ads Manager vs boosting last week). The simplified mode is the 'boosting' of Google, avoid it for real work.\n\n" +
            "**2. Understand you pay per click (CPC).** Unlike a flat fee, you pay when someone *clicks* your ad. So every click should be worth more than it costs, which is why targeting the right searches is everything.\n\n" +
            "**3. Set up conversion tracking.** This is critical: a *conversion* is the action you care about (an order, a form submit, a call, a WhatsApp click). Set up conversion tracking (Google walks you through it, often a tag on the site, or tracking calls/clicks) so you can see *which keywords actually produce sales*, not just clicks. Without conversion tracking you are flying blind, you will know what you spent but not what it earned. If sales close on WhatsApp, track the click-to-WhatsApp as a conversion proxy and ask customers how they found you.\n\n" +
            "**4. Have a landing page ready.** Clicks must go somewhere relevant, the product/order page, not a generic homepage. Note your landing page (you will map keywords to pages on Day 4).\n\n" +
            "## Budget discipline (same as Meta)\n" +
            "Set a daily budget you can afford to learn with. Search clicks can be more expensive than Meta impressions, but they are higher-intent. Start small, find the keywords that convert, then scale. Today: set up the account and conversion tracking. Tomorrow: keywords.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Google Search ads capture existing demand (people already searching), while Meta ads create demand (interrupting by interest).",
              answer: true,
              whenRight: "Yes. Google = demand capture at the moment of intent; Meta = demand creation by interest. High intent is why search ads convert so well.",
              whenWrong: "That is the split. Google catches active searchers (capture); Meta interrupts by interest (creation). Different, complementary.",
            },
            {
              prompt: "You should use Google's simplified 'Smart' mode for serious campaigns.",
              answer: false,
              whenRight: "Right, switch to Expert mode for full control. Smart mode is the 'boosting' of Google, fine for hobbyists, not for real work.",
              whenWrong: "Use Expert mode. The simplified Smart mode removes the controls you need; it is Google's blunt beginner tool.",
            },
            {
              prompt: "Without conversion tracking, you can still tell which keywords actually make money.",
              answer: false,
              whenRight: "Wrong, conversion tracking is essential. Without it you see spend and clicks but not sales-per-keyword. Set it up first.",
              whenWrong: "You cannot. Conversion tracking is what reveals which keywords produce orders. Without it, you are flying blind.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, set up Google Ads",
          body:
            "Get the search-ads foundation ready:\n\n" +
            "- [ ] Google Ads account created in Expert mode\n" +
            "- [ ] Conversion tracking set up (or a clear plan to track WhatsApp/call/order results)\n" +
            "- [ ] A relevant landing page identified for clicks to land on\n" +
            "- [ ] A test budget decided\n\n" +
            "Then write one sentence: which Week 4 keyword has the highest BUY intent? That is where search ads will be most profitable.",
        },
      ],
    },
    {
      number: 1,
      title: "Orient, the search campaign and intent",
      summary:
        "Today you'll see the full search campaign you are building and why matching keyword intent is the heart of profitable search ads.",
      items: [
        {
          kind: "lesson",
          title: "Profit lives in intent matching",
          body:
            "## What you are building\n" +
            "A complete Google Search campaign for Adwoa's Kitchen with: tightly themed keyword groups (with match types), a negative keyword list, responsive search ad copy that matches each search, the right landing page for each group, conversion tracking, a budget, and an optimisation plan. Plus a results/analysis report. By Sunday it is launch-ready (and ideally test-run).\n\n" +
            "## Intent is the whole game\n" +
            "The single most important idea in search advertising: **match the ad to the searcher's intent.** Your Week 4 work already classified keywords by intent, that pays off now:\n\n" +
            "- **Transactional/buy intent** ('buy jollof spice mix', 'order jollof Accra'): the gold. These people want to purchase. Bid here, send them to a product/order page.\n" +
            "- **Local intent** ('food delivery near me', 'caterer Accra'): high value for the local business. Send to a local/order page.\n" +
            "- **Informational intent** ('jollof recipe', 'how to cook jollof'): usually NOT worth paying for if you sell a product, these people want to learn, not buy, so a paid click often wastes money. (Capture them for free with SEO content instead, Week 4.) Occasionally worth it if you have a strong path from content to product, but be cautious.\n\n" +
            "Matching intent means: bid on the searches where the person wants what you sell, write an ad that speaks to that exact search, and land them on a page that lets them act. Mismatch at any step wastes the click.\n\n" +
            "## Why precision beats volume here\n" +
            "Unlike SEO (where more traffic is generally good because it is free), in paid search *every click costs money*, so you want *fewer, better* clicks. A campaign tightly focused on high-intent buy/local keywords, with negatives excluding the rest, will be far more profitable than a broad one chasing every 'jollof' search. This week is an exercise in disciplined precision. Today you frame the campaign and confirm the high-intent focus.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Matching the ad to the searcher's intent is the most important idea in search advertising.",
              answer: true,
              whenRight: "Yes. Bid on searches that want what you sell, write an ad for that exact search, land them where they can act. Mismatch wastes money.",
              whenWrong: "It is. Intent matching, the right keyword, ad, and landing page for the searcher's goal, is the heart of profitable search ads.",
            },
            {
              prompt: "If Adwoa sells a spice-mix product, paying for clicks on 'jollof recipe' is usually a good idea.",
              answer: false,
              whenRight: "Right, those searchers want to LEARN, not buy, so paid clicks often waste money. Capture them free with SEO content instead.",
              whenWrong: "Usually no. 'Recipe' is informational intent, low buying readiness. Do not pay for it; earn it with SEO content.",
            },
            {
              prompt: "In paid search, fewer high-intent clicks are better than lots of broad, cheap clicks.",
              answer: true,
              whenRight: "Yes. Every click costs money, so precision (high-intent searches + negatives) beats volume. Profit lives in focus.",
              whenWrong: "It is. Unlike free SEO traffic, paid clicks cost money, so you want fewer, better, higher-intent ones.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, frame the campaign",
          body:
            "Start your search campaign plan:\n\n" +
            "- [ ] List the high-intent keyword themes to target (buy + local), pulled from Week 4\n" +
            "- [ ] Note which informational keywords you will NOT pay for (and will do via SEO)\n" +
            "- [ ] Confirm the landing page each theme should point to\n" +
            "- [ ] Write the campaign goal in one line (profitable orders from high-intent searchers)\n\n" +
            "Tomorrow: keywords and match types, the precision controls.",
        },
      ],
    },
    {
      number: 2,
      title: "Keywords and match types",
      summary:
        "Today you'll build the keyword list and learn match types, the controls that decide exactly which searches trigger your ad.",
      items: [
        {
          kind: "lesson",
          title: "Control which searches trigger your ad",
          body:
            "## Keywords are triggers, not exact searches\n" +
            "In Google Ads, the keywords you add are *triggers*, they tell Google which searches should show your ad. But a keyword is not a single exact search; *how broadly it matches* is controlled by **match types**. Getting match types right is what stops you paying for irrelevant clicks. This is the precision lever.\n\n" +
            "## The three match types\n" +
            "1. **Broad match** (`jollof spice mix`): triggers on a *wide* range of related searches, including loosely related ones (and Google interprets generously). Most reach, *least* control, can trigger on searches you never intended ('jollof recipe', 'spice shop'). Use cautiously, and only with strong negative keywords and conversion data.\n" +
            "2. **Phrase match** (`\"jollof spice mix\"`): triggers when the search *contains that phrase* (in order), with words possibly before/after ('best jollof spice mix Accra'). A good balance of reach and control.\n" +
            "3. **Exact match** (`[jollof spice mix]`): triggers only on that search and very close variants. *Most* control, least reach, you know exactly what you are paying for. Best for your proven, high-intent buy keywords.\n\n" +
            "## Structure: tight themed ad groups\n" +
            "Do not dump all keywords into one group. Organise keywords into *tight, themed ad groups*, each group around one intent/theme (e.g. one ad group for 'jollof spice mix' terms, another for 'food delivery Accra' terms). Why? Because then you can write an ad that *exactly matches* each group's searches (relevance = better Quality Score = lower cost = more conversions). One ad group, one theme, one closely-matched ad, one matching landing page. That tight structure is the hallmark of a professional, profitable campaign.\n\n" +
            "## Start controlled, expand with data\n" +
            "For a new campaign, favour *phrase and exact* match on your high-intent keywords, you want control while you learn what converts. Once you have conversion data, you can carefully expand with broad match (which relies on Google's optimisation) backed by strong negatives. Today you build the keyword list, grouped into tight themes with chosen match types.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Match types control how broadly a keyword triggers your ad (broad = wide, exact = precise).",
              answer: true,
              whenRight: "Yes. Broad reaches widely but loosely; exact triggers only on that search. Match types are your precision lever.",
              whenWrong: "They do. Broad/phrase/exact set how closely a search must match. Use them to control what you pay for.",
            },
            {
              prompt: "For a brand-new campaign, broad match on everything is the safest starting choice.",
              answer: false,
              whenRight: "Right, start with phrase/exact for control while you learn. Broad match without data and negatives can waste money fast.",
              whenWrong: "No, broad is risky early. Favour phrase/exact for control first; expand to broad later with data and negatives.",
            },
            {
              prompt: "Tightly themed ad groups (one theme, one matching ad, one landing page) improve relevance and lower cost.",
              answer: true,
              whenRight: "Yes. Tight groups let the ad exactly match the search, raising Quality Score, lowering cost, and lifting conversions.",
              whenWrong: "They do. Tight theming = higher relevance = better Quality Score = cheaper, better-converting clicks.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build keywords + match types",
          body:
            "Build the keyword structure:\n\n" +
            "- [ ] Pull your high-intent Week 4 keywords into 2-3 tight themed ad groups\n" +
            "- [ ] Assign match types (favour phrase/exact for control to start)\n" +
            "- [ ] Note the matching ad angle and landing page for each group\n" +
            "- [ ] Use Google Keyword Planner to check rough cost/volume per keyword\n\n" +
            "Tomorrow: negative keywords, excluding the searches you do NOT want.",
        },
      ],
    },
    {
      number: 3,
      title: "Negative keywords, plugging the money leaks",
      summary:
        "Today you'll build a negative keyword list, the single most important habit for not wasting money in search ads.",
      items: [
        {
          kind: "lesson",
          title: "Tell Google what NOT to show your ad on",
          body:
            "## The biggest money leak in search ads\n" +
            "Even with good match types, your ad can trigger on searches you do not want, and every irrelevant click costs money. **Negative keywords** are terms you *exclude*: searches that should *never* trigger your ad. They are the single most important habit for a profitable search campaign, and the one beginners skip, then wonder why they wasted their budget.\n\n" +
            "## Examples for Adwoa\n" +
            "If Adwoa sells a jollof spice mix and food, she does *not* want to pay for clicks from:\n\n" +
            "- **'free'** ('free jollof', 'free food'), people wanting free things will not buy.\n" +
            "- **'recipe' / 'how to'** (if she sells the product, not teaching), informational intent, no purchase.\n" +
            "- **'jobs' / 'salary'** ('catering jobs Accra'), job-seekers, not customers.\n" +
            "- **'wholesale' / 'supplier'** (if she sells retail), wrong customer.\n" +
            "- Irrelevant meanings ('jollof rice nutrition facts', 'jollof history') depending on goal.\n\n" +
            "Each negative keyword plugs a leak, money that would have drained on a click that could never convert.\n\n" +
            "## The Search Terms report: your leak detector\n" +
            "Once a campaign runs, Google's **Search Terms report** shows the *actual searches* that triggered your ad (not just your keywords). This is gold, you will see surprising, irrelevant queries you paid for, and you add them as negatives. Checking the Search Terms report and adding negatives is an *ongoing* optimisation habit; it continuously tightens the campaign and improves profitability over time. A campaign without regular negative-keyword maintenance slowly leaks money.\n\n" +
            "## Build a starting negative list now\n" +
            "Before launch, build a starting negative list from obvious irrelevant terms (free, jobs, recipe-if-selling, etc.). Then expand it from real data. Today you build that starting list, a small task with an outsized impact on whether the campaign makes or loses money.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Negative keywords exclude searches that should never trigger your ad, plugging money leaks.",
              answer: true,
              whenRight: "Yes. Excluding 'free', 'jobs', 'recipe' (if selling), etc. stops you paying for clicks that can never convert. The #1 profit habit.",
              whenWrong: "They do. Negatives prevent irrelevant clicks. Skipping them is how budgets quietly drain.",
            },
            {
              prompt: "The Search Terms report shows the actual searches that triggered your ad, so you can add new negatives.",
              answer: true,
              whenRight: "Yes. It reveals the real (often surprising, irrelevant) queries you paid for. Mining it for negatives is ongoing optimisation gold.",
              whenWrong: "It does. The Search Terms report is your leak detector, check it regularly and add the junk as negatives.",
            },
            {
              prompt: "Negative keywords are a one-time setup you never need to revisit.",
              answer: false,
              whenRight: "Wrong, it is ongoing. New irrelevant searches appear; regularly mining the Search Terms report and adding negatives keeps the campaign profitable.",
              whenWrong: "It is ongoing maintenance. Keep adding negatives from the Search Terms report or the campaign slowly leaks money.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build the negative list",
          body:
            "Plug the leaks before they start:\n\n" +
            "- [ ] Build a starting negative keyword list of 15+ terms (free, jobs, recipe-if-selling, wholesale, etc.)\n" +
            "- [ ] Think through irrelevant meanings/intents for each of your keyword themes\n" +
            "- [ ] Note the plan to check the Search Terms report regularly and add negatives\n\n" +
            "Tomorrow: writing the search ad copy and matching the landing page.",
        },
      ],
    },
    {
      number: 4,
      title: "Ad copy and landing pages",
      summary:
        "Today you'll write search ads that match the query and ensure clicks land on a page that converts, with Quality Score as the reward.",
      items: [
        {
          kind: "lesson",
          title: "Match the ad and the page to the search",
          body:
            "## Responsive search ads\n" +
            "Google's modern search ad is the **Responsive Search Ad (RSA)**: you provide multiple *headlines* (up to 15, ~30 characters each) and *descriptions* (up to 4, ~90 characters each), and Google mixes and tests combinations to find what performs best. Your job is to give it strong, varied assets. The ad shows as text at the top of search results, so the *words* are everything (no images here).\n\n" +
            "## Writing search ad copy\n" +
            "1. **Match the search:** include the keyword/intent in a headline. If someone searches 'jollof spice mix', a headline like 'Jollof Spice Mix, Delivered' confirms 'yes, this is what you searched', it dramatically lifts clicks and relevance. Relevance is rewarded.\n" +
            "2. **Lead with benefits** (Week 1/4): 'Restaurant Jollof in 20 Minutes', 'Made in Accra, Shipped Nationwide'.\n" +
            "3. **Include a clear CTA:** 'Order Now', 'Shop the Mix', 'Get Yours Today'.\n" +
            "4. **Use the space:** strong differentiators, social proof ('Loved by 500+ Accra Foodies'), offers, and trust signals (free/fast delivery). Vary the headlines so Google has good combinations to test.\n" +
            "5. **Ad extensions/assets:** add sitelinks, callouts, location, and call assets, they make the ad bigger and more useful (and lift performance) at no extra cost.\n\n" +
            "## The landing page: where the money is made or lost\n" +
            "A search ad's job is to earn the click; the *landing page* converts it. The rule: **the page must match the search and let the person act immediately.** Someone who searched and clicked 'buy jollof spice mix' must land on the *spice mix product/order page* (with price, photos, and an order button), NOT the generic homepage where they have to hunt. A mismatched or slow landing page wastes the expensive high-intent click. Match the page to the search; remove friction; make the next step obvious (the Week 3 conversion principles, applied to paid clicks).\n\n" +
            "## Quality Score: relevance lowers your cost\n" +
            "Google rewards relevance with **Quality Score** (a rating of your keyword, ad, and landing-page relevance). A high Quality Score means Google charges you *less per click* and ranks your ad higher, because relevant ads give searchers a good experience. So the tight keyword-to-ad-to-landing-page match is not just good UX, it literally *lowers your costs*. Relevance is the cheat code of profitable search ads. Today you write the RSAs and map landing pages.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Including the searched keyword in a headline lifts clicks because it confirms 'this is what you searched for'.",
              answer: true,
              whenRight: "Yes. Matching the search in the ad raises relevance, clicks, and Quality Score. Mirror the searcher's intent in the copy.",
              whenWrong: "It does. Echoing the search term signals relevance, lifting click-through and lowering cost via Quality Score.",
            },
            {
              prompt: "It is fine to send all search-ad clicks to the homepage rather than a matching page.",
              answer: false,
              whenRight: "Wrong, a 'buy spice mix' click must land on the spice-mix page, not a generic homepage. Mismatch wastes the high-intent click.",
              whenWrong: "Not fine. Match the landing page to the search. A homepage makes them hunt; you lose the expensive click.",
            },
            {
              prompt: "A high Quality Score (relevant keyword + ad + landing page) can lower your cost per click.",
              answer: true,
              whenRight: "Yes. Google charges relevant ads less, relevance is the cheat code that lowers costs and lifts position simultaneously.",
              whenWrong: "It can. Quality Score rewards relevance with cheaper clicks and better placement. Tight matching pays off directly.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, write ads + map pages",
          body:
            "Create the ad and landing-page match:\n\n" +
            "- [ ] Write a Responsive Search Ad per ad group (8-12 headlines, 3-4 descriptions)\n" +
            "- [ ] Echo the search/keyword in at least one headline per group, benefit-led, with a CTA\n" +
            "- [ ] Map each ad group to a matching, conversion-focused landing page\n" +
            "- [ ] Note ad extensions/assets to add (sitelinks, callouts, location, call)\n\n" +
            "Tomorrow: budgets, bidding, launch, and reading the results.",
        },
      ],
    },
    {
      number: 5,
      title: "Budget, launch, and optimise",
      summary:
        "Today you'll set the budget and bidding, launch (or finalise) the campaign, and learn to optimise toward profitable conversions.",
      items: [
        {
          kind: "lesson",
          title: "Spend, measure, and tighten",
          body:
            "## Budget and bidding\n" +
            "Set a **daily budget** you can afford to learn with (search clicks may cost more than Meta impressions, but the intent is higher). For *bidding* (how much you pay per click and how Google optimises), start simple: a beginner-friendly automated strategy like 'Maximise Clicks' (with a cap) to gather data, or 'Maximise Conversions' once conversion tracking has data. You do not need manual bidding to start, let Google optimise while you control the budget and keywords. As with Meta: start small, learn, scale the winners.\n\n" +
            "## Launch (or finalise) the campaign\n" +
            "Assemble it: campaign settings (location: Accra/Ghana as appropriate; budget), tight ad groups (keywords + match types), negative keywords, RSAs, landing pages, and conversion tracking. Review and launch a small test (best, for real data) or finalise as launch-ready. Note: Google will show a 'low search volume' or recommendations, ignore the pushy auto-suggestions that broaden your targeting unless you have decided they help.\n\n" +
            "## Read the results, diagnose the issue\n" +
            "Once data arrives, the metrics tell you what to fix (like Meta, but search-specific):\n\n" +
            "- **Search Terms report:** the actual queries, add negatives for the junk (ongoing, Day 3).\n" +
            "- **Low CTR on a keyword?** The ad is not matching that search well, improve the ad's relevance to it (or the keyword is wrong-fit).\n" +
            "- **Clicks but no conversions?** The landing page does not match/convert, fix the page (relevance, friction, clarity).\n" +
            "- **High cost per conversion?** Tighten keywords/negatives, improve Quality Score (relevance), pause keywords that cost a lot and never convert.\n" +
            "- **Which keywords convert profitably?** Put more budget there.\n\n" +
            "## Optimise toward conversions, not clicks\n" +
            "The core loop: identify the keywords/ads that produce *conversions* at an acceptable cost, scale them; pause the ones that spend without converting. Clicks are a means; *profitable conversions* are the goal. With conversion tracking, you can see cost-per-order per keyword, the truth of what is working. Today you launch/finalise and analyse; tomorrow you write the optimisation report.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Beginners must set manual bids for every keyword before launching.",
              answer: false,
              whenRight: "Right, start with an automated strategy (Maximise Clicks/Conversions) while you control budget and keywords. Manual bidding is not required to start.",
              whenWrong: "Not required. Use a simple automated bid strategy to begin; focus your effort on keywords, negatives, ads, and landing pages.",
            },
            {
              prompt: "Clicks but no conversions usually points to a landing-page (or fit) problem, not the keyword's match.",
              answer: true,
              whenRight: "Yes. If people click but do not convert, the issue is after the click, the page does not match or convert. Fix the page.",
              whenWrong: "It does. Conversions fail after the click, so look at the landing page (relevance, friction), not just the keyword.",
            },
            {
              prompt: "The optimisation goal is to maximise clicks regardless of whether they convert.",
              answer: false,
              whenRight: "Wrong, optimise toward profitable CONVERSIONS. Scale keywords that produce orders affordably; pause those that spend without converting.",
              whenWrong: "No, conversions (orders) at an acceptable cost are the goal. Clicks that never convert are wasted spend to cut.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, launch and analyse",
          body:
            "Run or finalise and analyse:\n\n" +
            "- [ ] Set the daily budget and a starting (automated) bid strategy\n" +
            "- [ ] Assemble the full campaign (location, ad groups, negatives, RSAs, landing pages, tracking)\n" +
            "- [ ] Launch a small test if possible, or finalise as launch-ready\n" +
            "- [ ] Analyse results (or explain what each metric would tell you and your fixes)\n\n" +
            "Tomorrow: the optimisation plan/report.",
        },
      ],
    },
    {
      number: 6,
      title: "Build the campaign + optimisation report",
      summary:
        "Today you'll write a clear report on the search campaign with metric interpretation and an optimisation plan.",
      items: [
        {
          kind: "lesson",
          title: "Report the intent channel professionally",
          body:
            "## The report structure (search-specific)\n" +
            "Like the Meta report, but tuned to search:\n\n" +
            "1. **The setup:** the campaign, ad groups, keywords + match types, negatives, ads, landing pages, budget.\n" +
            "2. **The results:** key metrics, impressions, CTR, average CPC, conversions, cost per conversion, and (if known) ROAS / cost per order. Plus notable findings from the Search Terms report.\n" +
            "3. **The interpretation:** what the numbers mean. 'Exact-match buy keywords converted at GHS X/order, profitable; broad terms wasted spend and were paused.' 'Adding 12 negatives cut wasted clicks by Y%.'\n" +
            "4. **The verdict:** did the high-intent clicks convert profitably? Honest assessment.\n" +
            "5. **The optimisation plan:** the ongoing actions, mine Search Terms for negatives, scale converting keywords, improve the landing page, raise Quality Score, test new ad copy. Search campaigns are *tuned continuously*; the plan shows you understand that.\n\n" +
            "## Emphasise the intent advantage\n" +
            "In your interpretation, highlight what makes search special: these were people *actively searching* to buy, the highest-intent traffic, captured at the decisive moment. If the campaign converted well, that is the power of intent. If not, the diagnosis (wrong keywords? landing page? intent mismatch?) is itself valuable insight. Show that you understand *why* search behaves differently from Meta.\n\n" +
            "## Real or projected, be clear\n" +
            "As with Meta: if you ran a real test, use the real numbers, the strongest case study. If not, build a clearly-labelled projection: the campaign you built, the metrics you would track, the targets, and how you would optimise based on each outcome. Either way, you demonstrate the full skill: precise targeting, intent matching, conversion focus, and ongoing optimisation.\n\n" +
            "Today you write the report; tomorrow you ship case study #7.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A search-campaign report should include the Search Terms findings and an ongoing optimisation plan.",
              answer: true,
              whenRight: "Yes. Search campaigns are tuned continuously, mining negatives, scaling winners, improving pages. The plan shows you get that.",
              whenWrong: "It should. The Search Terms report and an ongoing optimisation plan are central to professional search-ad reporting.",
            },
            {
              prompt: "Cost per conversion (cost per order) is more meaningful than clicks for judging the campaign.",
              answer: true,
              whenRight: "Yes. Clicks are a means; cost per conversion (and ROAS) tells you if the high-intent traffic actually paid off.",
              whenWrong: "It is. Judge by conversions and their cost, not raw clicks. Profit is the point of capturing intent.",
            },
            {
              prompt: "A good report highlights WHY search behaves differently from Meta (intent capture).",
              answer: true,
              whenRight: "Yes. Showing you understand intent capture vs interest interruption demonstrates real channel knowledge.",
              whenWrong: "It does. Explaining the intent advantage (or diagnosing the mismatch) proves you understand the channel deeply.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, write the report",
          body:
            "Build the optimisation report:\n\n" +
            "- [ ] Document the setup (ad groups, keywords/match types, negatives, ads, pages, budget)\n" +
            "- [ ] Present the search metrics (CTR, CPC, conversions, cost per conversion)\n" +
            "- [ ] Interpret the results and give an honest verdict\n" +
            "- [ ] Write the ongoing optimisation plan (negatives, scaling, landing page, Quality Score)\n\n" +
            "Tomorrow you ship case study #7.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship it, Google Ads campaign + plan (case study #7)",
      summary:
        "Today you'll package the Google Search campaign and optimisation plan into case study #7.",
      items: [
        {
          kind: "lesson",
          title: "Ship it, paid acquisition mastered",
          body:
            "## Package case study #7\n" +
            "Present **Adwoa's Kitchen, Google Search Ad Campaign + Optimisation Plan**, with:\n\n" +
            "- A **challenge/approach** opener (Adwoa needed to capture people actively searching to buy; you built a precise, intent-matched search campaign)\n" +
            "- The **campaign**: keyword themes + match types, negative keywords, RSAs, landing-page mapping, budget, tracking\n" +
            "- The **results/optimisation report**: metrics, interpretation, verdict, ongoing plan\n" +
            "- A note on the **intent advantage** and how Google complements both Meta (interest) and SEO (free intent capture)\n\n" +
            "## Why this completes a powerful skill set\n" +
            "With Weeks 6 and 7, you now cover *both* giants of paid acquisition: **Meta** (interest-based demand creation) and **Google** (intent-based demand capture). Together they are the core of performance marketing, the most directly revenue-linked, well-paid marketing discipline. Two paid-ads case studies, showing precise targeting, converting creative/copy, budget discipline, and results interpretation across both platforms, make you genuinely employable as a paid-media or growth marketer. This is a serious portfolio.\n\n" +
            "## The complete acquisition picture\n" +
            "Step back and see what you have built for Adwoa across the track so far: *organic* awareness (content, social), *earned* intent capture (SEO), and now *paid* acceleration on both interest (Meta) and intent (Google). That is a full-funnel acquisition system, multiple channels feeding the journey you mapped in Week 1. Few marketers can show command of all of it. Save case study #7.\n\n" +
            "Next week: email marketing. You shift from *acquiring* customers to *keeping* them, building the email funnel and automation that turn one-time buyers into loyal, repeat customers, the highest-ROI channel in all of marketing.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Weeks 6 and 7 give you both giants of paid acquisition: Meta (interest) and Google (intent).",
              answer: true,
              whenRight: "Yes. Together they are the core of performance marketing, the most revenue-linked, well-paid discipline. Two strong case studies.",
              whenWrong: "They do. Meta + Google = the heart of paid media. Command of both is a serious, employable skill set.",
            },
            {
              prompt: "Google Ads complements SEO by buying the top spot instantly while SEO earns it slowly and free.",
              answer: true,
              whenRight: "Yes. Same searchers, paid (instant) and organic (slow, free) results. Smart businesses use both, reusing the same keyword research.",
              whenWrong: "It does. Ads = instant paid presence; SEO = slow free ranking, on the same searches. They work together.",
            },
            {
              prompt: "After this week, Adwoa has a full-funnel acquisition system across organic, earned, and paid channels.",
              answer: true,
              whenRight: "Yes. Content/social (organic) + SEO (earned intent) + Meta/Google (paid) feed the Week 1 journey. A complete acquisition picture.",
              whenWrong: "She does. Organic + earned + paid channels now feed the funnel. Next, email turns acquired customers into loyal ones.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Ship it",
          body:
            "Package and ship case study #7:\n\n" +
            "- [ ] One document titled `Adwoa's Kitchen, Google Search Ad Campaign + Optimisation Plan`\n" +
            "- [ ] Challenge/approach framing\n" +
            "- [ ] Campaign (keywords/match types, negatives, RSAs, landing pages) + report, all present\n" +
            "- [ ] Saved in your `Week 07 Google Ads` portfolio folder\n\n" +
            "Seven case studies done, paid acquisition mastered. Next week: email marketing, keeping customers and the highest-ROI channel there is.",
        },
      ],
    },
  ],
};
