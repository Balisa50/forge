/* Week 1 - Marketing Foundations (Phase: Strategy and Foundations) */
module.exports = {
  number: 1,
  title: "Marketing Foundations",
  phase: "Strategy and Foundations",
  commitment_hours: "6, 10",
  context:
    "Most people think marketing is posting on Instagram and running ads. That is the visible 10%. The invisible 90%, the part that decides whether the posts and ads work at all, is strategy: knowing exactly who you are selling to, what they want, why they should pick you over the next seller, and the path they take from never having heard of you to handing over their money. Skip this and you spend twelve weeks shouting into the void.\n\n" +
    "You are the new growth marketer for Adwoa Owusu, founder of Adwoa's Kitchen, an Accra food business. Adwoa cooks the best jollof in her neighbourhood and sells grilled food, plus she bottles her own jollof spice mix and pepper sauces to ship across Ghana. She is brilliant in the kitchen and invisible online: no followers, almost no website traffic, no steady stream of orders. Your mission across this track is to take Adwoa's Kitchen from zero to 10,000 followers and leads in twelve weeks.\n\n" +
    "This week you build the strategic foundation everything else stands on. By Sunday you will have a positioning statement (one sentence that says who Adwoa's Kitchen is for and why it wins) and a customer journey map (the step-by-step path a stranger walks to become a paying, repeat customer). These two documents are case study #1 in your portfolio, and the brief you will execute against for the next eleven weeks.",
  concept_check: [
    {
      q: "Adwoa says 'my food is for everyone who likes good food.' Why is that a weak target market?",
      choices: [
        "It is too expensive to reach everyone",
        "'Everyone' is not a market, you cannot write a message that moves a person you have not pictured",
        "Good food is not a real selling point",
        "It should be 'everyone in Accra' instead",
      ],
      correct: 1,
      explain: "When you target everyone you speak to no one. A specific person (a busy Accra office worker who misses home-cooked lunch) lets you write a message that actually lands. Niche down to scale up.",
    },
    {
      q: "A customer sees Adwoa's jollof on Instagram, visits the website, but does not buy. Where did the journey break?",
      choices: [
        "The product is bad",
        "Somewhere between awareness and purchase, often the website did not make it easy or trustworthy to act",
        "Instagram is the wrong channel",
        "She should have run ads instead",
      ],
      correct: 1,
      explain: "Interest without action means a gap in the journey, usually a missing trust signal, an unclear next step, or friction at checkout. Mapping the journey is how you find and fix that gap.",
    },
    {
      q: "What is the difference between a feature and a benefit for Adwoa's spice mix?",
      choices: [
        "There is no difference",
        "Feature = '12 hand-ground spices'; benefit = 'restaurant-taste jollof in 20 minutes, no measuring'",
        "Benefit is the price, feature is the size",
        "Features sell better than benefits",
      ],
      correct: 1,
      explain: "A feature is what it IS; a benefit is what it DOES for the customer's life. People buy benefits. 'Restaurant jollof in 20 minutes' sells; 'twelve spices' is just trivia until you connect it to the outcome.",
    },
  ],
  topics: [
    "What marketing actually is (and is not)",
    "Target market and the ideal customer (persona)",
    "Positioning and differentiation",
    "Features vs benefits, and the value proposition",
    "The marketing funnel and the customer journey",
    "The four Ps as a sanity check",
    "Setting a goal and the one metric that matters",
  ],
  tasks: [
    "Write an ideal customer persona for Adwoa's Kitchen",
    "Draft and refine a one-sentence positioning statement",
    "Turn three product features into customer benefits",
    "Map the full customer journey from stranger to repeat buyer",
    "Define the 12-week goal and the primary metric",
  ],
  project:
    "Produce the strategic brief for Adwoa's Kitchen: a one-page document containing (1) an ideal customer persona, (2) a positioning statement, (3) a value proposition with three benefit-led selling points, and (4) a customer journey map across awareness, consideration, purchase, and loyalty, noting the channel and the goal for each stage. This brief is the plan you execute for the rest of the track. Portfolio case study #1.",
  exercises: [
    "Interview-style notes: describe one real person who is the perfect Adwoa's Kitchen customer",
    "Write three versions of the positioning statement and pick the sharpest",
    "Convert a feature list into a benefit list",
    "Draw the journey map and mark where the current biggest drop-off is",
  ],
  questions: [
    "Who exactly is Adwoa's Kitchen for, and who is it not for?",
    "Why would someone choose Adwoa over the next jollof seller?",
    "What is the path from never-heard-of-us to repeat customer?",
  ],
  outputs: [
    "An ideal customer persona document",
    "A one-sentence positioning statement",
    "A benefit-led value proposition",
    "A customer journey map with stages, channels, and goals",
  ],
  mastery_questions: [
    "State Adwoa's Kitchen target customer in one specific sentence",
    "Write a positioning statement using the for / who / is / that / unlike formula",
    "Turn any feature into a benefit",
    "Name the four journey stages and one goal for each",
    "Name the single metric you will judge the next 12 weeks by",
  ],
  ai_assist:
    "Use an AI assistant (ChatGPT, Claude, or Gemini) as a brainstorming partner, never as the final author. Good prompts this week: 'Act as a marketing strategist. Here is my business [paste details]. Help me draft 3 ideal-customer personas, then critique them for being too vague.' Always pressure-test the output against reality, you know the Ghanaian market and the AI does not.",
  pre_flight: [
    "A free Google account (for Google Docs)",
    "A notebook or doc to capture ideas",
    "Curiosity about real businesses around you",
  ],
  common_mistakes: [
    "Targeting 'everyone', which means targeting no one",
    "Listing features (12 spices) instead of benefits (restaurant jollof in 20 minutes)",
    "Copying a competitor's positioning instead of finding a real point of difference",
    "Treating the journey as a single step (see ad, buy) instead of a path with stages",
  ],
  debug_help: [
    "Stuck on the persona? Picture ONE real person you know who would love this, and describe them.",
    "Positioning feels generic? Add the 'unlike [alternative]' clause, it forces a real difference.",
    "Journey map feels empty? Walk it yourself: how would YOU find, judge, and buy from a new food brand?",
  ],
  stretch: [
    "Map a SECOND persona (e.g. corporate catering buyer) and note how the message changes",
    "Find three real competitors and write one sentence on how each positions itself",
  ],
  resources: [
    "Google Docs (free) for all documents",
    "Your own observation of food businesses in your city",
  ],
  days: [
    {
      number: 0,
      title: "What marketing really is, and set up your workspace",
      summary:
        "Today you'll learn what marketing actually is beneath the noise, then set up the free workspace and portfolio folder you will use for all twelve weeks.",
      items: [
        {
          kind: "lesson",
          title: "Marketing is not posting, it is matching",
          body:
            "## The one-line definition\n" +
            "Marketing is **getting the right message, to the right person, at the right time, so they take an action**. That is it. Posting, ads, emails, SEO, those are just *channels*, the pipes the message travels through. Beginners obsess over the pipes (which app, which post). Professionals obsess over the *match*: who is this for, what do they need to hear, and what do we want them to do.\n\n" +
            "## Why strategy comes before tactics\n" +
            "Imagine Adwoa spends GHS 500 on Instagram ads for her spice mix. If she does not know *who* it is for, the ad says 'buy my spice mix' to random people, and almost nobody buys. Same GHS 500, but aimed at *busy Accra office workers who miss home-cooked food and cannot cook jollof properly*, with the message *'restaurant jollof in 20 minutes, no measuring'*, and now it converts. The money did not change. The **strategy** did. This week is that strategy.\n\n" +
            "## The three questions every marketer answers first\n" +
            "Before a single post goes out, you must be able to answer:\n\n" +
            "1. **Who exactly are we selling to?** (Not 'everyone'. A specific person.)\n" +
            "2. **Why should they pick us over the alternatives?** (Our positioning.)\n" +
            "3. **What path do we walk them down, from stranger to repeat buyer?** (The journey.)\n\n" +
            "If you cannot answer these, no amount of pretty posts will save the business. If you *can*, even average posts perform, because they are aimed.\n\n" +
            "## What you are building this week\n" +
            "By Sunday: a **positioning statement** (one sharp sentence) and a **customer journey map** (the path). Together they are the brief you will execute for eleven more weeks. Every later skill, content, social, SEO, ads, email, is just *delivering this strategy through a channel*. Get the strategy right and the rest is execution.",
        },
        {
          kind: "lesson",
          title: "Set up your marketing workspace and portfolio",
          body:
            "## Do this now, before any lessons\n" +
            "You will produce twelve case studies over this track. Set up where they live, once, today.\n\n" +
            "**1. A Google account + Google Drive.** If you do not have one, create a free Gmail account (use `firstname.lastname@gmail.com` if you can, this is the address you will put on your marketing CV). Google Drive, Docs, Sheets, and Slides are all free and are what most marketing teams actually use.\n\n" +
            "**2. Your portfolio folder.** In Google Drive, create a folder named `Adwoa's Kitchen - Marketing Portfolio`. Inside it, create twelve sub-folders: `Week 01 Strategy` through `Week 12 Career`. Every week's deliverable goes in its folder. By Week 12 this folder *is* your portfolio.\n\n" +
            "**3. Your strategy doc.** In the Week 01 folder, create a Google Doc titled `Adwoa's Kitchen - Strategic Brief`. Paste in four headings now, each on its own line: `Ideal Customer`, `Positioning Statement`, `Value Proposition`, `Customer Journey Map`. You will fill these across the week.\n\n" +
            "**4. A swipe file.** Create one more doc: `Swipe File - good marketing I see`. Whenever you spot an ad, caption, or email that grabs you, screenshot it here with one line on *why* it worked. Top marketers all keep a swipe file. Start yours today.\n\n" +
            "Everything here is free. No paid tools this week, or for most of this track.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Marketing is mainly about choosing the right app to post on.",
              answer: false,
              whenRight: "Correct. The app is just a pipe. Marketing is the MATCH: right message, right person, right time. Strategy beats tool choice every time.",
              whenWrong: "Not quite. The channel (app) is just delivery. Marketing is matching the right message to the right person, the strategy under the posts.",
            },
            {
              prompt: "A specific target customer ('busy Accra office worker who misses home food') beats a broad one ('everyone who likes food').",
              answer: true,
              whenRight: "Yes. A specific person lets you write a message that actually lands. 'Everyone' forces vague messaging that moves no one.",
              whenWrong: "Look again. Specific wins. You can only write a message that moves someone if you can picture exactly who they are.",
            },
            {
              prompt: "If an ad fails, the first thing to blame is the budget being too small.",
              answer: false,
              whenRight: "Right. Usually it is the STRATEGY, wrong person or wrong message, not the budget. The same money aimed correctly converts.",
              whenWrong: "Usually not the budget. A failing ad most often has the wrong audience or message. Fix the aim before adding money.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build your workspace",
          body:
            "Set up your foundation. Tick each only when it is actually done.\n\n" +
            "- [ ] Google account created or confirmed, with a clean address\n" +
            "- [ ] `Adwoa's Kitchen - Marketing Portfolio` folder created in Drive\n" +
            "- [ ] Twelve weekly sub-folders created (Week 01 to Week 12)\n" +
            "- [ ] `Strategic Brief` doc created with the four headings\n" +
            "- [ ] `Swipe File` doc created, with at least ONE example added today\n\n" +
            "Then write two sentences at the top of your Strategic Brief: *What does Adwoa's Kitchen sell, and what is the 12-week goal (zero to 10,000 followers and leads)?* You now have a home for everything that follows.",
        },
      ],
    },
    {
      number: 1,
      title: "Orient, what you are building this week",
      summary:
        "Today you'll see the full picture of the strategic brief you are producing this week, and why these two documents decide the success of the next eleven.",
      items: [
        {
          kind: "lesson",
          title: "The brief that drives everything",
          body:
            "## Why this week matters more than any other\n" +
            "Every later week, content, social, SEO, ads, email, analytics, executes a *decision you make this week*. Choose the wrong customer and you will write content nobody wants, target ads at the wrong people, and optimise a website for the wrong buyer. The strategic brief is the steering wheel. Bad strategy executed brilliantly still drives off a cliff.\n\n" +
            "## The four pieces of the brief\n" +
            "1. **Ideal customer persona** (Day 2): one specific person who is the perfect buyer, their situation, problem, and what they care about.\n" +
            "2. **Positioning statement** (Day 3): one sentence, for whom, what we are, and why we win.\n" +
            "3. **Value proposition** (Day 4): three benefit-led reasons to buy, the actual words you will use in posts and ads.\n" +
            "4. **Customer journey map** (Day 5): the path from stranger to repeat buyer, stage by stage, with the channel and goal for each.\n\n" +
            "## A goal needs a number\n" +
            "'Grow Adwoa's Kitchen' is a wish, not a goal. A goal has a number and a deadline: *reach 10,000 combined followers and leads in twelve weeks.* And you need **one primary metric** to judge progress, here, total *leads* (people who give us their contact, follow, or order), because followers without leads do not pay the bills. Everything you build gets judged against that number.\n\n" +
            "## The mindset shift\n" +
            "Stop thinking 'what should I post?' Start thinking 'what does my specific customer need to see, at this stage of their journey, to take the next step?' That single reframe is the difference between a hobbyist who posts and a marketer who grows a business. This week you build the map; the rest of the track you follow it.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "'Grow Adwoa's Kitchen' is a proper marketing goal.",
              answer: false,
              whenRight: "Right. It has no number and no deadline. A real goal: 'reach 10,000 followers and leads in 12 weeks.' Numbers make progress measurable.",
              whenWrong: "It is a wish, not a goal. Add a NUMBER and a DEADLINE: '10,000 followers and leads in 12 weeks.' Then you can measure it.",
            },
            {
              prompt: "Followers matter more than leads for a business that needs to make money.",
              answer: false,
              whenRight: "Correct. Followers are nice; LEADS (contacts, orders) pay the bills. The primary metric should track value, not vanity.",
              whenWrong: "Flip it. Followers can be a vanity metric. Leads, people who give contact or buy, are what fund the business.",
            },
            {
              prompt: "The strategic brief is the plan every later week executes against.",
              answer: true,
              whenRight: "Yes. Content, social, SEO, ads, email, all deliver the strategy you set this week. The brief is the steering wheel.",
              whenWrong: "It is. Every later channel just executes this week's strategy. Get the brief right and the rest is delivery.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, commit to the goal",
          body:
            "In your Strategic Brief doc, write the goal and primary metric clearly at the top:\n\n" +
            "- [ ] **Goal:** a specific 12-week target (e.g. '10,000 combined followers + leads across channels')\n" +
            "- [ ] **Primary metric:** the ONE number you will judge progress by (recommend: total leads)\n" +
            "- [ ] **Why this metric:** one sentence on why it matters more than vanity numbers\n\n" +
            "Then list the four pieces of the brief you will complete this week, so future-you knows the plan. You have now framed the whole week.",
        },
      ],
    },
    {
      number: 2,
      title: "Know your customer, the ideal persona",
      summary:
        "Today you'll build a specific, vivid picture of the one person Adwoa's Kitchen is perfect for, the foundation of every message you will ever write.",
      items: [
        {
          kind: "lesson",
          title: "Niche down to scale up",
          body:
            "## Why one person beats everyone\n" +
            "The biggest beginner mistake is 'my product is for everyone.' It feels safe, more people, more sales, right? Wrong. When you write for everyone, you write generic messages that move no one. When you write for *one specific person*, your message becomes sharp, and, surprisingly, it attracts *more* people, because it actually resonates with someone. This is the niche-to-scale paradox: get specific to grow big.\n\n" +
            "## What an ideal customer persona is\n" +
            "A persona is a detailed, semi-fictional portrait of your perfect customer, built from real observation. Not a demographic ('women 25-40'), a *person*. Give them a name, a life, a problem. For Adwoa's Kitchen, one strong persona:\n\n" +
            "> **Akosua, 29, Accra.** Works a busy 9-to-5 in a bank in Osu. Misses her mum's cooking but gets home at 8pm exhausted. Cannot cook jollof that tastes 'right'. Has money but no time. Scrolls Instagram on her commute. Cares about taste, convenience, and food that feels like home. Would happily pay for a spice mix that makes restaurant jollof in 20 minutes, or order a fresh grilled meal for the weekend.\n\n" +
            "Now you can *picture* her. You know what to say, what photo to show, what time to post (her commute), and what she will pay for.\n\n" +
            "## The persona questions\n" +
            "Build yours by answering: Who are they (name, age, location, work)? What is their *day* like? What problem do they have that you solve? What do they care about when buying food? Where do they spend time online? What would make them hesitate (price? trust? delivery?)? The more vivid, the more useful.\n\n" +
            "## One product can have a few personas\n" +
            "Adwoa's Kitchen might serve Akosua (busy office worker, buys spice mix + weekend meals) AND a corporate catering buyer (orders for office events). Different people, different messages. Start with the ONE who is most common and most profitable, that is your primary persona, the hero of your strategy.\n\n" +
            "Today you make Akosua (or your version) real on paper. Every future post, ad, and email is written *to her*.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "'Women aged 25 to 40' is a strong customer persona.",
              answer: false,
              whenRight: "Right, that is a demographic, not a person. A persona has a name, a life, a problem you can picture and write to.",
              whenWrong: "Too broad. That is a demographic. A persona is a specific person, Akosua, 29, busy banker, misses home food, with a life you can picture.",
            },
            {
              prompt: "Knowing your persona scrolls Instagram on her commute tells you WHEN to post.",
              answer: true,
              whenRight: "Exactly. A vivid persona reveals timing, message, photo style, and price tolerance, all the practical decisions.",
              whenWrong: "It does. Her commute is your posting window. A rich persona answers the practical questions for you.",
            },
            {
              prompt: "Targeting one specific persona will shrink your total audience and hurt growth.",
              answer: false,
              whenRight: "Correct, the opposite. Specific messages resonate and attract MORE people. Niche down to scale up.",
              whenWrong: "It is the reverse. Specific, resonant messaging attracts more people than vague 'for everyone' messaging. Niche to scale.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build the persona",
          body:
            "In your Strategic Brief under `Ideal Customer`, write a full persona for Adwoa's Kitchen:\n\n" +
            "- [ ] Name, age, location, job\n" +
            "- [ ] A paragraph on their typical day\n" +
            "- [ ] The specific problem Adwoa's Kitchen solves for them\n" +
            "- [ ] What they care about most when buying food (taste? time? trust? price?)\n" +
            "- [ ] Where they spend time online, and when\n" +
            "- [ ] Their #1 hesitation before buying\n\n" +
            "Make it vivid enough that a stranger could read it and picture a real person. Tip: base it loosely on someone you actually know. This persona is the reader of everything you write from now on.",
        },
      ],
    },
    {
      number: 3,
      title: "Positioning, why you and not them",
      summary:
        "Today you'll write the single most important sentence in marketing: the positioning statement that says who you are for and why you win.",
      items: [
        {
          kind: "lesson",
          title: "The one sentence that decides everything",
          body:
            "## What positioning is\n" +
            "Positioning is the place your brand occupies in the customer's mind, the answer to *'why should I pick you over the alternatives?'* Akosua has options: cook herself, buy from a chop bar, order from a competitor, use a different spice. Positioning is the reason she picks Adwoa's Kitchen. Without it, you are just 'another jollof seller', competing on price (a race to the bottom).\n\n" +
            "## The positioning formula\n" +
            "A classic, reliable template:\n\n" +
            "> **For** [target customer] **who** [need or situation], **[brand]** **is** [category] **that** [key benefit / point of difference], **unlike** [main alternative].\n\n" +
            "Filled in for Adwoa's Kitchen:\n\n" +
            "> *For busy Accra professionals who miss real home-cooked food but have no time to cook, Adwoa's Kitchen is a homemade-food brand that delivers restaurant-quality jollof and grills (and a spice mix that does it in 20 minutes), unlike fast food that fills you up but never tastes like home.*\n\n" +
            "Read it again. It names *who* (busy pros), the *need* (home food, no time), the *category* (homemade food), the *difference* (restaurant-quality, fast), and the *alternative it beats* (soulless fast food). That one sentence now guides every photo, caption, and ad.\n\n" +
            "## The 'unlike' clause is the magic\n" +
            "Most brands skip the 'unlike' and end up generic ('we sell great food'). The *unlike* forces you to name a real point of difference against a real alternative. If you cannot finish the 'unlike' clause, you have not found your edge yet, keep digging. Adwoa's edge might be *taste of home*, *speed*, *consistency*, or *the spice mix nobody else sells*. Pick the one that is true and that Akosua cares about most.\n\n" +
            "## Positioning is a choice, and a sacrifice\n" +
            "Strong positioning means *not* being for everyone. By positioning as 'home-cooked food for busy professionals', you give up the 'cheapest street food' crowd, on purpose. That focus is what makes the message powerful. Trying to be everything to everyone is how brands become invisible.\n\n" +
            "Today you write three versions and pick the sharpest. This sentence is the spine of your whole strategy.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Good positioning tries to appeal to as many different customers as possible.",
              answer: false,
              whenRight: "Right. Strong positioning means choosing who you are NOT for. Focus is what makes the message land. Be everything to everyone and you are invisible.",
              whenWrong: "The opposite. Positioning is a choice and a sacrifice, you focus on a specific customer and edge, and deliberately give up the rest.",
            },
            {
              prompt: "The 'unlike [alternative]' clause forces you to name a real point of difference.",
              answer: true,
              whenRight: "Yes. If you cannot finish 'unlike...', you have not found your edge. That clause is what stops positioning from being generic.",
              whenWrong: "It does. The 'unlike' clause is the magic, it forces a real, specific difference against a real alternative.",
            },
            {
              prompt: "Without positioning, a food brand usually ends up competing mainly on price.",
              answer: true,
              whenRight: "Correct. No clear reason to pick you = a race to the bottom on price. Positioning gives a reason beyond 'cheapest'.",
              whenWrong: "It is true. With no point of difference, the only lever left is price, a race to the bottom. Positioning escapes that.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, write the positioning",
          body:
            "In your Strategic Brief under `Positioning Statement`:\n\n" +
            "- [ ] Write THREE versions using the formula: For [who] who [need], [brand] is [category] that [difference], unlike [alternative]\n" +
            "- [ ] For each, make sure the 'unlike' names a real alternative and a real edge\n" +
            "- [ ] Read all three aloud, pick the sharpest, and mark it as the final\n" +
            "- [ ] Write one sentence on what you are deliberately NOT (who Adwoa's Kitchen is not for)\n\n" +
            "The final statement should make Akosua nod and think 'that is exactly what I need.' If it could describe any food seller, it is not sharp enough yet.",
        },
      ],
    },
    {
      number: 4,
      title: "Features vs benefits, the value proposition",
      summary:
        "Today you'll learn the single most important copywriting skill, turning what a product IS into what it DOES for the customer, and build Adwoa's value proposition.",
      items: [
        {
          kind: "lesson",
          title: "Nobody buys features, they buy better lives",
          body:
            "## The most expensive mistake in marketing\n" +
            "Beginners describe their product: '12 hand-ground spices, 200g jar, locally sourced.' Those are **features**, facts about the product. Customers do not care about features. They care about what the features *do for them*. Akosua does not want '12 spices'; she wants *restaurant-taste jollof in 20 minutes without measuring anything*. That is a **benefit**, the outcome in her life. People buy benefits. Always.\n\n" +
            "## Feature to benefit, the 'so what?' test\n" +
            "Take any feature and ask 'so what?' until you reach the human outcome:\n\n" +
            "- '12 hand-ground spices' → so what? → 'perfectly balanced flavour' → so what? → **'jollof that tastes like a top restaurant made it, every time'**\n" +
            "- 'pre-measured mix' → so what? → 'no guessing, no measuring' → so what? → **'cook confidently even if you have never made good jollof'**\n" +
            "- 'ships across Ghana, frozen' → so what? → 'arrives fresh anywhere' → so what? → **'taste of home delivered to your door, wherever you are'**\n\n" +
            "The bolded endpoints are what you put in captions and ads. The features become *supporting proof*, not the headline.\n\n" +
            "## The value proposition\n" +
            "Your **value proposition** is the short, benefit-led answer to 'why should I buy this?', usually a headline plus two or three benefit points. For Adwoa's spice mix:\n\n" +
            "> **Restaurant jollof in 20 minutes.**\n" +
            "> - Tastes like a top Accra restaurant, every single time (no skill needed)\n" +
            "> - Pre-measured, no guessing, just add rice and follow three steps\n" +
            "> - Made in Accra from real spices, the taste of home in a jar\n\n" +
            "Notice the features (real spices, pre-measured) appear, but *attached to a benefit*. That is the formula: benefit first, feature as proof.\n\n" +
            "## Why this skill pays for itself\n" +
            "Every caption, ad, email subject line, and product page lives or dies on benefit-led copy. The same product, described as features, gets ignored; described as benefits, sells. You will use this 'so what?' test every single week of this track. Master it now.\n\n" +
            "Today you turn Adwoa's product features into benefits and assemble her value proposition.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "'200g jar, 12 spices, locally sourced' is benefit-led copy that will sell well.",
              answer: false,
              whenRight: "Right, those are features. They sell only once you connect them to a benefit: 'restaurant jollof in 20 minutes, no skill needed.'",
              whenWrong: "Those are features (facts about the product). They sell when turned into benefits, what they DO for the customer's life.",
            },
            {
              prompt: "The 'so what?' test turns a feature into the human outcome a customer actually wants.",
              answer: true,
              whenRight: "Exactly. Keep asking 'so what?' until you reach the benefit in their life. That endpoint is your headline.",
              whenWrong: "It does. Ask 'so what?' of any feature, repeatedly, until you reach the real-life outcome. That is the benefit.",
            },
            {
              prompt: "In good copy, features should still appear, but attached to a benefit as proof.",
              answer: true,
              whenRight: "Yes. Benefit first ('cook confidently'), feature as proof ('pre-measured'). Features support, benefits sell.",
              whenWrong: "Correct, they should. Lead with the benefit, then use the feature as supporting proof. Not features alone.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build the value proposition",
          body:
            "In your Strategic Brief under `Value Proposition`:\n\n" +
            "- [ ] List 4-5 real features of Adwoa's products (spice mix and/or meals)\n" +
            "- [ ] Run each through the 'so what?' test until you reach a human benefit\n" +
            "- [ ] Write a one-line value-proposition headline (benefit-led, like 'Restaurant jollof in 20 minutes')\n" +
            "- [ ] Write three benefit points underneath, each with the feature attached as proof\n\n" +
            "Read it as Akosua would. Does it make her want it? If it reads like a product spec sheet, you are still in feature-land, push each line through 'so what?' again.",
        },
      ],
    },
    {
      number: 5,
      title: "The customer journey, stranger to superfan",
      summary:
        "Today you'll map the full path a customer walks from never hearing of Adwoa's Kitchen to becoming a loyal repeat buyer, the master plan for the whole track.",
      items: [
        {
          kind: "lesson",
          title: "Nobody buys on the first touch",
          body:
            "## The journey, not the leap\n" +
            "Marketing beginners imagine a single moment: person sees ad, person buys. Reality is a *journey* of many touches. Akosua might see a reel, follow the account, read a few posts over a week, click to the website, read reviews, leave, come back, then finally order. Your job is to understand and smooth every step of that path. This is the **customer journey** (or marketing funnel), and mapping it is how you find exactly where people drop off.\n\n" +
            "## The four stages\n" +
            "1. **Awareness** (top of funnel): they discover you exist. Goal: get seen by the right people. Channels: social reels, SEO, word of mouth, ads. Here you do not sell, you attract and earn attention.\n" +
            "2. **Consideration** (middle): they are interested and judging you. Goal: build trust and desire. Channels: helpful content, reviews, behind-the-scenes, email. Here you prove you are worth it.\n" +
            "3. **Purchase** (bottom): they are ready to buy. Goal: make buying easy and safe. Channels: website, WhatsApp order, a clear offer, a smooth checkout. Here you remove friction.\n" +
            "4. **Loyalty** (post-purchase): they bought, now keep them. Goal: turn buyers into repeat customers and advocates. Channels: email, follow-up, loyalty perks, asking for reviews. The cheapest sale is to someone who already trusts you.\n\n" +
            "## A different message for each stage\n" +
            "The mistake is using the same 'BUY NOW' message everywhere. You would not propose marriage on a first date. At *awareness*, a hard sell scares people off, give value (a recipe tip, a mouth-watering reel). At *purchase*, being shy and not asking for the order loses the sale. Match the message to the stage. The journey map tells you which message goes where.\n\n" +
            "## Find the leak\n" +
            "Most businesses have one stage that leaks badly. Adwoa might get *lots* of awareness (people see her food) but lose them at consideration (no website, no reviews, no easy way to order, no trust). Mapping the journey makes the leak obvious, and that leak is exactly where the next eleven weeks of work should focus. For Adwoa, weeks 2-3 fix awareness and consideration (content + social), weeks 4-7 widen awareness (SEO + ads), week 8 builds loyalty (email).\n\n" +
            "Today you draw the full map and mark the biggest current leak. This map is your campaign plan.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Most customers buy the first time they see a brand.",
              answer: false,
              whenRight: "Right. Buying is a journey of many touches, discover, follow, consider, trust, then buy. Plan for the path, not a single leap.",
              whenWrong: "Rarely. People take many touches to buy. Your job is to map and smooth the whole journey, not expect a one-touch sale.",
            },
            {
              prompt: "You should use a hard 'BUY NOW' message at every stage of the journey.",
              answer: false,
              whenRight: "Correct. Match message to stage. At awareness, give value, do not hard-sell. Save the strong ask for the purchase stage.",
              whenWrong: "No, match the message to the stage. A hard sell at awareness scares people off. Give value early, ask for the order later.",
            },
            {
              prompt: "Mapping the journey helps you find the single stage where you are losing the most people.",
              answer: true,
              whenRight: "Yes. Every business has a leaky stage. The map exposes it, and that leak is where your effort should focus.",
              whenWrong: "It does. The map reveals your biggest leak, the stage losing the most people, so you know where to focus.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, map the journey",
          body:
            "In your Strategic Brief under `Customer Journey Map`, build the map for Adwoa's Kitchen:\n\n" +
            "- [ ] For each of the four stages (Awareness, Consideration, Purchase, Loyalty): write the customer's mindset, the goal, the channel(s), and the kind of message that fits\n" +
            "- [ ] Mark where you believe the biggest current LEAK is (where Adwoa loses the most people)\n" +
            "- [ ] Write one sentence connecting that leak to the upcoming weeks that will fix it\n\n" +
            "You now have the master plan: a persona, a position, a value prop, and the path. Tomorrow you assemble and polish it into the finished brief.",
        },
      ],
    },
    {
      number: 6,
      title: "Assemble and pressure-test the strategy",
      summary:
        "Today you'll combine the four pieces into one coherent strategic brief and stress-test it, making sure every part points at the same customer and goal.",
      items: [
        {
          kind: "lesson",
          title: "A strategy is only as strong as its alignment",
          body:
            "## The coherence test\n" +
            "You have four pieces: persona, positioning, value proposition, journey. A strong strategy is not four good pieces, it is four pieces that *point the same direction*. The persona (Akosua), the positioning (home food for busy pros), the value prop (restaurant jollof in 20 minutes), and the journey (where Akosua is and what she needs) must all describe the *same customer* solving the *same problem*. If your persona is a busy professional but your value prop talks about 'cheapest food in town', they are fighting each other. Today you align them.\n\n" +
            "## Pressure-test with these questions\n" +
            "Walk your brief through each:\n\n" +
            "- **Is the persona one specific person, not 'everyone'?** If still vague, sharpen it.\n" +
            "- **Does the positioning name a real difference (the 'unlike')?** If it could describe any seller, dig deeper.\n" +
            "- **Is the value prop benefit-led, not a feature list?** Run any feature-y line through 'so what?' again.\n" +
            "- **Does the journey have a different goal and message per stage?** And is the biggest leak identified?\n" +
            "- **Do all four describe the SAME customer and problem?** This is the big one.\n\n" +
            "## The 'so what would you actually do?' check\n" +
            "A strategy must be *actionable*. For each journey stage, you should be able to name a concrete thing you will build in the coming weeks. Awareness → reels and SEO (weeks 2-7). Consideration → helpful content and reviews. Purchase → a clean website and easy ordering. Loyalty → email follow-ups (week 8). If a stage has no plan, your map has a gap. The brief should read like a campaign you could hand to someone and they would know exactly what to do.\n\n" +
            "## Use AI to critique, not to create\n" +
            "Paste your brief into an AI assistant with the prompt: *'You are a sharp marketing strategist. Critique this brief for vagueness, misalignment, and any stage missing a plan. Be tough.'* The AI will not know the Ghanaian market like you do, so judge its feedback, but it is excellent at spotting where you have been lazy or generic. Fix what it correctly flags.\n\n" +
            "Today you produce the finished, aligned, pressure-tested brief, your first portfolio case study.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A strong strategy just needs four good pieces; they do not have to connect.",
              answer: false,
              whenRight: "Right. Alignment is everything. Persona, positioning, value prop, and journey must all describe the SAME customer and problem.",
              whenWrong: "Coherence matters most. Four pieces that point in different directions cancel out. They must all describe the same customer.",
            },
            {
              prompt: "Every journey stage in your brief should have a concrete plan for what you will build.",
              answer: true,
              whenRight: "Yes. A strategy that is not actionable is just a poster. Each stage needs a real, upcoming action attached.",
              whenWrong: "It should. If a stage has no plan, the brief has a gap. A good strategy reads like an executable campaign.",
            },
            {
              prompt: "AI is best used this week to write your final brief for you.",
              answer: false,
              whenRight: "Correct. Use AI to CRITIQUE (spot vagueness and gaps), not to author. You know the market; the AI does not.",
              whenWrong: "Use AI as a critic, not the author. It is great at spotting lazy, generic lines, but you make the real decisions.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, align and finalise",
          body:
            "Pressure-test and finalise your Strategic Brief:\n\n" +
            "- [ ] Run the brief through all five pressure-test questions; fix anything weak\n" +
            "- [ ] Confirm all four pieces describe the SAME customer and problem\n" +
            "- [ ] Confirm every journey stage has a concrete planned action\n" +
            "- [ ] Paste it into an AI assistant for a tough critique; apply the fair feedback\n" +
            "- [ ] Tidy formatting so it reads like a clean one-page document\n\n" +
            "Tomorrow you ship it as case study #1. The brief should now read like a plan you would confidently hand to a client.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship it, your strategic brief (case study #1)",
      summary:
        "Today you'll finalise, present, and ship the Adwoa's Kitchen strategic brief as the first case study in your marketing portfolio.",
      items: [
        {
          kind: "lesson",
          title: "Ship it, and make it presentable",
          body:
            "## From working doc to portfolio piece\n" +
            "Your brief is done; now make it *showable*. A portfolio piece is not just the work, it is the work *presented so a stranger (or employer, or client) instantly gets it*. The difference between 'I did strategy' and a clean, titled, well-formatted one-pager is the difference between getting hired and getting skipped. Spend the last hour on presentation.\n\n" +
            "## What case study #1 must contain\n" +
            "A single clean document (Google Doc, or a one-page Canva/Slides layout) titled **Adwoa's Kitchen, Marketing Strategy Brief**, with:\n\n" +
            "- A one-line **context**: what Adwoa's Kitchen is and the 12-week goal\n" +
            "- The **ideal customer persona** (the vivid one)\n" +
            "- The **positioning statement** (the final, sharp sentence)\n" +
            "- The **value proposition** (headline + three benefit points)\n" +
            "- The **customer journey map** (four stages, each with goal, channel, message; leak marked)\n" +
            "- A closing line: the primary metric you will judge success by\n\n" +
            "## Write the 'case study' framing\n" +
            "At the very top, add two sentences a future employer reads first: *'The challenge: Adwoa's Kitchen had a great product but no strategy, no clear customer, position, or plan. The approach: I built a full strategic brief, persona, positioning, value proposition, and a customer journey map, to guide a 12-week growth campaign.'* That framing turns a document into a *story of what you did*, which is what gets you hired.\n\n" +
            "## Commit it to your portfolio\n" +
            "Save the finished brief in your `Week 01 Strategy` folder. This is permanent, it is case study #1 of twelve, and it is the plan every later week executes. You have not 'learned strategy'; you have *produced a real strategic asset* for a real-shaped business. That is the portfolio-first mindset that will define this whole track.\n\n" +
            "Next week: content marketing. You will take this strategy and turn it into a month of content that attracts Akosua, the awareness and consideration stages of your journey, made real.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A portfolio piece is just the work itself; presentation does not matter much.",
              answer: false,
              whenRight: "Right. Presentation is half the value. A clean, titled, well-framed one-pager is what gets you hired over someone with the same work, messily shown.",
              whenWrong: "Presentation matters a lot. The same work, presented clearly with a case-study framing, is what an employer actually responds to.",
            },
            {
              prompt: "Adding a 'challenge / approach' framing at the top turns a document into a story of what you did.",
              answer: true,
              whenRight: "Yes. 'The challenge was X, my approach was Y' is the case-study framing that makes your work hireable, not just present.",
              whenWrong: "It does. That challenge/approach framing is exactly what turns a deliverable into a portfolio case study.",
            },
            {
              prompt: "This week produced theory you will set aside, not an asset the rest of the track uses.",
              answer: false,
              whenRight: "Correct. The brief is the live plan every later week executes, and case study #1 in your portfolio. It is a real asset.",
              whenWrong: "It is a real, reusable asset, the campaign plan for the whole track and your first portfolio case study, not throwaway theory.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Ship it",
          body:
            "Finalise and ship case study #1:\n\n" +
            "- [ ] One clean document titled `Adwoa's Kitchen, Marketing Strategy Brief`\n" +
            "- [ ] A 'challenge / approach' framing at the top\n" +
            "- [ ] All four pieces present, aligned, and well-formatted\n" +
            "- [ ] The primary success metric stated at the end\n" +
            "- [ ] Saved in your `Week 01 Strategy` portfolio folder\n\n" +
            "Then write one honest sentence in your own notes: what is the single biggest leak in Adwoa's journey that the next weeks must fix? You have shipped your first marketing asset. Next week: content marketing, you turn this strategy into a month of content that attracts your customer.",
        },
      ],
    },
  ],
};
