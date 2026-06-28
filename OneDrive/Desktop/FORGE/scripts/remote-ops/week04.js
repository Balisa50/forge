/* Week 4 - Online research (Phase: Research) */
module.exports = {
  number: 4,
  title: "Online research",
  phase: "Research",
  commitment_hours: "6, 10",
  context:
    "Founders constantly need answers: who are our competitors, who could we sell to, is this supplier legitimate, what does the market actually look like. A research specialist turns vague questions into clear, sourced answers fast, and that is a service you can sell on its own. This week you learn advanced search, source verification, market and competitor analysis, and lead generation.\n\n" +
    "You will deliver three real research assets for Kola: a market report on West African handmade goods, a competitor analysis of five similar brands, and a prospect database of 25 potential wholesale buyers, every claim sourced. By Friday you can take a one-line question from a founder and come back with an answer they can act on, with the receipts to prove it.\n\n" +
    "The skill that separates a good researcher from someone who just googles: a healthy suspicion. You check who said it, when, and whether anyone independent agrees, before you repeat it as fact.",
  concept_check: [
    {
      q: "Ama asks 'who are our main competitors and how do they price?' What makes this a good research brief versus a bad one?",
      choices: [
        "It is fine as is; just google 'competitors'",
        "It needs to be sharpened into a specific question, e.g. 'which five brands sell similar handmade baskets to West African diaspora buyers, and what do they charge?'",
        "Research questions do not need to be specific",
        "You should answer from memory to save time",
      ],
      correct: 1,
      explain: "Vague research wastes hours. Sharpen the question into something specific and answerable first; a precise question is half the work done.",
    },
    {
      q: "You find a striking statistic on a random blog with no author and no date. What should you do before putting it in your report?",
      choices: [
        "Use it; it is on the internet so it is probably fine",
        "Verify it against at least one independent, credible source, and cite that source",
        "Reword it so no one can trace it",
        "Use it but add 'approximately'",
      ],
      correct: 1,
      explain: "Unsourced, undated, anonymous claims are not facts yet. Verify against an independent credible source and cite it, so the reader can trust and trace every claim.",
    },
    {
      q: "You ask an AI chatbot for five competitors and their funding. It gives confident answers. What is the risk?",
      choices: [
        "No risk; AI is always accurate",
        "AI can invent (hallucinate) companies, numbers, and sources, so each claim must be verified independently",
        "The risk is only that it is slow",
        "AI cannot do research at all",
      ],
      correct: 1,
      explain: "AI is a fast intern that sometimes makes things up confidently. Use it to accelerate, but verify every fact and source it gives before you rely on it.",
    },
  ],
  days: [
    {
      number: 0,
      title: "The researcher's mindset, and search like a pro",
      summary: "Understand what a research specialist delivers, then learn to search far better than the average person.",
      items: [
        {
          kind: "lesson",
          title: "From 'googling' to research",
          body:
            "## What a founder is really buying\n" +
            "Anyone can type a question into Google. What a founder pays a researcher for is a *trustworthy answer*: the right question asked, credible sources checked, the noise filtered out, and the result organised so they can act. The job is judgement, not typing.\n\n" +
            "## The two halves of good research\n" +
            "1. **Finding** information efficiently (search skills, knowing where to look).\n" +
            "2. **Trusting** information correctly (is this source credible? does anyone independent agree? how old is it?).\n\n" +
            "Most beginners only do the first half and repeat whatever they find. The second half, a healthy suspicion, is what makes you reliable. A confident wrong answer is worse than no answer, because the founder acts on it.\n\n" +
            "## Start with the question, not the search box\n" +
            "Before you search anything, write the exact question and what a useful answer looks like. \"Research competitors\" is a time sink. \"Which five brands sell handmade West African home goods to diaspora buyers in the UK/US, and how do they price a medium basket?\" is answerable in an afternoon. A sharp question is half the work.\n\n" +
            "## This week's destination\n" +
            "You will produce three sourced assets for Kola: a market report, a competitor analysis, and a 25-row prospect database. Every claim will be traceable to a source, because that is what makes research worth paying for.",
        },
        {
          kind: "video",
          title: "How to Google with Advanced Search Operators (9 Actionable Tips)",
          url: "https://www.youtube.com/watch?v=yWLD9139Ipc",
          duration_min: 14,
          creator: "Ahrefs",
          difficulty: "beginner",
          why: "Ahrefs is a respected research and SEO company. This walks through the exact search operators (quotes, site:, minus, filetype:) you will use all week to find precise answers fast. Watch it, then try the operators in the exercise.",
        },
        {
          kind: "lesson",
          title: "Search operators, in practice",
          body:
            "## The operators that 10x your search\n" +
            "Most people type a few words and scroll. A few operators turn Google into a precision tool. Try each one now in a real search:\n\n" +
            "- **\"exact phrase\"** in quotes forces an exact match. `\"handmade baskets\" wholesale Ghana` finds that phrase, not loose synonyms.\n" +
            "- **site:** searches within one site. `site:linkedin.com \"procurement manager\" home goods` finds people on LinkedIn. `site:gov.gh export` searches a government domain.\n" +
            "- **-minus** excludes a word. `baskets supplier -pinterest` drops the noise.\n" +
            "- **filetype:** finds documents. `West Africa handicraft market filetype:pdf` surfaces reports and studies, often the most credible sources.\n" +
            "- **OR** widens. `(stockist OR retailer OR distributor) \"African home goods\"`.\n" +
            "- **intitle: / inurl:** match words in the page title or URL, useful for finding specific page types.\n\n" +
            "## Combine them\n" +
            "The real power is stacking: `\"wholesale\" (baskets OR textiles) site:.co.uk -alibaba filetype:pdf` is a laser. Combining operators is how you find the page everyone else misses.\n\n" +
            "## Beyond Google\n" +
            "Different questions live in different places: LinkedIn for people and companies, Google Scholar for credible studies, company 'About' and 'Press' pages for facts straight from the source, and industry-specific directories. Knowing where the answer lives saves more time than any operator.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Putting a phrase in \"quotation marks\" tells Google to match that exact phrase.",
              answer: true,
              whenRight: "Yes. Quotes force an exact-phrase match instead of loose, synonym-filled results, which sharpens almost any search.",
              whenWrong: "It does. Quotes lock the exact phrase. Without them Google loosens your words into synonyms and related terms, adding noise.",
            },
            {
              prompt: "A confident answer from a single unverified source is good enough to put in a client report.",
              answer: false,
              whenRight: "Correct. One unverified source is a claim, not a fact. Verify against an independent credible source and cite it before it goes in a report.",
              whenWrong: "Not good enough. A client acts on your report; a single unchecked source can be wrong. Corroborate and cite before you commit it.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, search like a pro",
          body:
            "Run these and capture what you find.\n\n" +
            "- [ ] Use \"exact phrase\" to find a specific fact about the handmade-goods or e-commerce market and note the source\n" +
            "- [ ] Use `site:` to find two potential stockists or buyers on a retailer or LinkedIn domain\n" +
            "- [ ] Use `filetype:pdf` to find one credible industry report or study\n" +
            "- [ ] Combine at least two operators in a single search and note how the results improved\n\n" +
            "Deliverable: the four searches you ran and one useful, sourced finding from each.",
        },
      ],
    },
    {
      number: 1,
      title: "Source evaluation and verification",
      summary: "Tell a credible source from a worthless one, and verify before you repeat.",
      items: [
        {
          kind: "lesson",
          title: "Is this source actually trustworthy?",
          body:
            "## The skill that protects the founder\n" +
            "The internet is full of confident nonsense: outdated stats, marketing dressed as fact, AI-generated filler, and plain errors. Your value is a filter. Before any claim goes in a report, run it through a credibility check.\n\n" +
            "## The CRAAP-style checklist\n" +
            "- **Currency:** when was it published? A 2015 market size for a fast-moving sector is misleading. Look for a date; if there is none, be suspicious.\n" +
            "- **Authority:** who wrote it, and do they have standing? A government statistics office, an established research firm, a recognised publication, or the company itself for its own facts, beats an anonymous blog.\n" +
            "- **Accuracy/corroboration:** does at least one independent credible source agree? If only one site says it, treat it as unconfirmed.\n" +
            "- **Purpose/bias:** why does this exist? A vendor's page claiming 'the market is booming' is selling something. Marketing and research are not the same.\n\n" +
            "## Primary beats secondary\n" +
            "Whenever you can, go to the primary source. If a blog says 'a study found X', find the actual study and check what it really said, summaries often distort. Company facts (founding year, locations, products) are most reliable straight from the company. Numbers are most reliable from the body that collected them.\n\n" +
            "## Verify, then state confidence\n" +
            "For each important claim: find it, corroborate it, cite it. And be honest about certainty. \"The market is estimated at roughly X (Source, 2024); figures vary, so treat as directional\" is far more professional than a false-precise number you cannot defend. A founder trusts a researcher who flags uncertainty more than one who pretends everything is solid.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A vendor's own marketing page is a reliable, unbiased source for whether their market is growing.",
              answer: false,
              whenRight: "Correct. A vendor is selling something, so their 'the market is booming' has a built-in bias. Use independent sources for market claims.",
              whenWrong: "It is biased. The vendor benefits from the claim, so it is marketing, not neutral research. Corroborate market claims with independent sources.",
            },
            {
              prompt: "Flagging uncertainty ('estimated, figures vary') is more professional than stating a false-precise number.",
              answer: true,
              whenRight: "Yes. Honest confidence levels build trust. A defensible 'roughly X, directional' beats a precise number you cannot back up.",
              whenWrong: "It is more professional. Founders trust a researcher who is honest about uncertainty over one who fakes precision and gets caught.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Verify three claims",
          body:
            "Find three claims relevant to Kola (e.g. a market size, a shipping cost, a competitor's price). For each:\n" +
            "1. State the claim and where you first found it.\n" +
            "2. Run the credibility checklist (currency, authority, corroboration, bias).\n" +
            "3. Verify against a second independent source, or mark it unconfirmed.\n" +
            "4. Write the claim as you would put it in a report, with its source and a confidence note.\n\n" +
            "Deliverable: the three claims with their verification and final sourced wording.",
        },
      ],
    },
    {
      number: 2,
      title: "Market research",
      summary: "Size up a market and turn scattered facts into a clear picture.",
      items: [
        {
          kind: "lesson",
          title: "Understanding a market",
          body:
            "## What market research answers\n" +
            "When a founder considers a new product, region, or channel, they need a picture of the landscape: how big is the opportunity, who buys, what do they pay, what are the trends, and what stands in the way. You assemble that picture from public information.\n\n" +
            "## What to actually gather\n" +
            "- **The customer:** who buys this, where, and why? For Kola: diaspora buyers, gift shoppers, interior decorators? Their location, budget, and motivation shape everything.\n" +
            "- **Size and demand signals:** rough market size if a credible figure exists, plus demand signals you *can* verify, search trends, marketplace listings and reviews, the number of competitors (a crowded market means real demand).\n" +
            "- **Price points:** what do similar products sell for, and at what range? This is concrete and findable, just look at what is on sale.\n" +
            "- **Trends:** is interest rising or falling? Sustainability, 'shop small', diaspora pride, these narratives matter and are visible in press and search.\n" +
            "- **Barriers:** shipping costs, import rules, payment friction, competition.\n\n" +
            "## Estimate honestly when exact data is missing\n" +
            "For many African and niche markets, precise figures do not exist. That is normal. A good researcher triangulates: combine the signals you *can* find (listing counts, price ranges, review volumes, related-market data) into a reasoned, clearly-labelled estimate. \"No official figure exists; based on X listings at Y price and Z reviews, demand appears solid and growing, treat as directional\" is honest and useful. Made-up precision is not.\n\n" +
            "## End with a 'so what'\n" +
            "Facts are not the deliverable; the implication is. Every market report should end with what it means for the founder: an opportunity, a risk, a recommendation. \"The diaspora gift segment is underserved at the mid-price point, which is where Kola could win\" is what Ama actually wants.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "If no official market-size figure exists, the research is impossible and you should give up.",
              answer: false,
              whenRight: "Correct. You triangulate from signals you can verify (listings, prices, reviews, trends) into a clearly-labelled estimate. That is normal, real research.",
              whenWrong: "Not impossible. When exact figures are missing, you combine verifiable signals into an honest, directional estimate. Most niche-market research works this way.",
            },
            {
              prompt: "A market report should end with what the findings mean for the founder, not just a pile of facts.",
              answer: true,
              whenRight: "Yes. The 'so what', the opportunity, risk, or recommendation, is the actual value. Facts without implication leave the founder to do the thinking.",
              whenWrong: "It should. Founders want the implication: what to do about it. End with the opportunity or risk, not just raw data.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Sketch a market picture",
          body:
            "For Kola's market (handmade West African home goods sold to diaspora and gift buyers), gather and write up:\n" +
            "1. Who the customer is (location, budget, motivation), with any sources.\n" +
            "2. Three demand signals you could verify (e.g. listing counts, review volumes, search interest).\n" +
            "3. A price range for a comparable product, from real listings.\n" +
            "4. One trend and one barrier.\n" +
            "5. A one-sentence 'so what' for Ama.\n\n" +
            "Deliverable: a one-page market sketch with sources and the 'so what'.",
        },
      ],
    },
    {
      number: 3,
      title: "Competitor analysis",
      summary: "Map the competition into a table a founder can act on.",
      items: [
        {
          kind: "lesson",
          title: "Reading the competition",
          body:
            "## Why founders need this constantly\n" +
            "Competitors reveal what works. Their prices, products, messaging, and reviews are a free market study. A good competitor analysis tells Ama where she fits, where the gaps are, and what to charge.\n\n" +
            "## Pick the right competitors\n" +
            "Choose five or so genuine competitors, businesses chasing the same customer, not just anyone in the category. For Kola, that is other brands selling handmade West African goods to similar buyers, not a giant generic homeware site.\n\n" +
            "## Compare on consistent criteria\n" +
            "The value comes from a *consistent* comparison, the same columns for every competitor, so differences jump out. Useful columns:\n" +
            "- Product range and quality\n" +
            "- Price points (a comparable item)\n" +
            "- Shipping (cost, regions, speed)\n" +
            "- Brand and messaging (what story do they tell?)\n" +
            "- Social presence and engagement\n" +
            "- Reviews: what customers praise and, crucially, complain about\n\n" +
            "## Mine the reviews\n" +
            "Competitor reviews are gold. Recurring complaints ('shipping took forever', 'colours not as pictured') are openings, things Ama can do better. Recurring praise tells you the table stakes. Spend real time here; it is where the actionable insight hides.\n\n" +
            "## End with positioning\n" +
            "The analysis should conclude with where Kola can win: an underserved price point, a gap in service, a story no one else tells. \"All five competitors ship slowly and have weak Instagram; Kola could own fast shipping and strong visual content\" is the kind of conclusion that changes what a founder does.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A competitor table is most useful when each competitor is compared on the same set of criteria.",
              answer: true,
              whenRight: "Yes. Consistent columns make differences and gaps visible at a glance. A jumble of different facts per competitor cannot be compared.",
              whenWrong: "Consistency is the point. The same columns for every competitor is what lets the founder spot patterns, gaps, and where they can win.",
            },
            {
              prompt: "Competitor reviews are a distraction; focus only on their prices and products.",
              answer: false,
              whenRight: "Correct. Reviews are gold: recurring complaints are openings and recurring praise is table stakes. They reveal what to do better.",
              whenWrong: "Reviews are some of the most valuable data. Customer complaints and praise show exactly where the founder can differentiate.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Build a competitor table",
          body:
            "Find five real or realistic competitors for Kola and build a comparison table with consistent columns: product range, price (comparable item), shipping, brand/messaging, social presence, and a 'reviews note' (one praise, one complaint each).\n" +
            "Then write a two-to-three sentence positioning conclusion: where could Kola win?\n\n" +
            "Deliverable: the five-competitor table plus the positioning conclusion, with sources.",
        },
      ],
    },
    {
      number: 4,
      title: "Lead generation and prospect research",
      summary: "Build a clean, usable list of people worth reaching out to.",
      items: [
        {
          kind: "lesson",
          title: "Finding prospects worth contacting",
          body:
            "## What lead generation is\n" +
            "Lead generation is building a list of potential customers, partners, or buyers, with enough information to reach out. For Kola that might be wholesale buyers, boutique stockists, interior designers, or gift retailers. A clean prospect list is something businesses pay real money for.\n\n" +
            "## Define the ideal prospect first\n" +
            "Before hunting, define who qualifies: \"independent home-goods boutiques in the UK that stock African or artisan brands.\" A sharp definition keeps your list relevant. A list of 200 random shops is worthless; a list of 25 genuine fits is gold.\n\n" +
            "## Where to find them\n" +
            "- **LinkedIn** for people and companies (use `site:linkedin.com` plus a role and industry).\n" +
            "- **Google Maps and directories** for local businesses of a type in a place.\n" +
            "- **Instagram** for boutiques and the buyers behind them.\n" +
            "- **Competitor stockist lists** (who already sells similar brands?).\n\n" +
            "## Capture clean, structured data\n" +
            "A prospect list is only useful if it is structured. One row per prospect, consistent columns: Name, Company, Role, Why they fit, Contact (email or the best channel), Source, and a Notes field. Messy data cannot be used for outreach later, so the discipline of clean rows is the job.\n\n" +
            "## Finding contact details, ethically\n" +
            "Look for publicly listed business emails (a shop's 'contact' page, a 'wholesale enquiries' address). Note the best public channel if no email is listed. The aim is legitimate business outreach, so use information people have published for that purpose, and record where you found each one in the Source column.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A list of 200 random businesses is more valuable than 25 carefully-qualified prospects.",
              answer: false,
              whenRight: "Correct. Relevance beats volume. 25 genuine fits the founder can actually approach is worth far more than 200 random names.",
              whenWrong: "Quality wins. A big unqualified list wastes outreach effort. A smaller list of real fits, with reasons, is what gets results.",
            },
            {
              prompt: "Recording the source of each prospect and a 'why they fit' note makes a list more usable.",
              answer: true,
              whenRight: "Yes. Structured rows with source and reasoning let the founder trust and act on the list, and let you defend why each name is there.",
              whenWrong: "It does. Source and fit-reasoning turn a raw list into something usable and credible, instead of a pile of names no one trusts.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Build a 25-row prospect list",
          body:
            "1. Write a one-line definition of Kola's ideal prospect (type of business, place).\n" +
            "2. Build a spreadsheet of at least 25 prospects with columns: Name, Company, Role, Why they fit, Contact, Source, Notes.\n" +
            "3. Make sure every contact is a publicly available business channel and the source is recorded.\n\n" +
            "Deliverable: the 25-row prospect spreadsheet (link or screenshot).",
        },
      ],
    },
    {
      number: 5,
      title: "Organising and presenting findings",
      summary: "Turn research into a report a busy founder reads in two minutes.",
      items: [
        {
          kind: "lesson",
          title: "The report that gets read",
          body:
            "## Research nobody reads is wasted research\n" +
            "You can do brilliant research and still fail if the founder cannot quickly absorb it. Presentation is part of the job. The same BLUF principle from Week 1 applies: lead with the answer.\n\n" +
            "## The structure of a research report\n" +
            "1. **The headline finding / recommendation, first.** One or two sentences: the answer to the question they asked. \"The mid-price diaspora gift segment is underserved; Kola should target it. Detail below.\"\n" +
            "2. **Key findings**, as a short bulleted list, the three to five things that matter.\n" +
            "3. **The detail**, organised by theme (market, competitors, prospects), for anyone who wants to go deeper.\n" +
            "4. **Sources**, so every claim is traceable.\n\n" +
            "## Make it scannable\n" +
            "Headings, short paragraphs, bullet points, and a simple table beat a wall of text. A founder should grasp the answer in the first ten seconds and be able to dig in if they want. Bold the few numbers or facts that matter most.\n\n" +
            "## Cite as you go\n" +
            "Citing is not bureaucracy, it is what makes the research trustworthy. A claim with a source can be checked and believed; a claim without one is just your opinion. Keep a running source list as you research so you are not reconstructing it at the end. A simple '(Source name, year, link)' after each claim is enough.\n\n" +
            "## A reusable template\n" +
            "Build this structure once as a template and every future report is faster and consistent. Clients notice when your reports always look clean and land the same way, it signals a professional, not an amateur who reinvents the format each time.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A research report should open with the headline finding or recommendation, not save it for the end.",
              answer: true,
              whenRight: "Yes. BLUF again: lead with the answer so a busy founder gets it in ten seconds, with detail underneath for anyone who wants it.",
              whenWrong: "Lead with the answer. Burying the recommendation makes the founder hunt for it. Headline first, detail below.",
            },
            {
              prompt: "Citing sources is optional busywork if you are confident the research is right.",
              answer: false,
              whenRight: "Correct. Citations are what make research trustworthy and checkable. A claim without a source is just an opinion the founder cannot verify.",
              whenWrong: "Not optional. Sources let the reader trust and trace each claim. Without them, even correct research reads as unverifiable opinion.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Write a one-page research report",
          body:
            "Take your market sketch and competitor table from earlier and write them into a single one-page report with: a headline finding/recommendation, three to five key findings as bullets, a short detail section, and a sources list.\n" +
            "Then save the structure as a reusable Research Report template.\n\n" +
            "Deliverable: the one-page report plus the blank template.",
        },
      ],
    },
    {
      number: 6,
      title: "Research with AI, safely",
      summary: "Use AI to go faster without letting it invent your facts.",
      items: [
        {
          kind: "lesson",
          title: "AI as a fast intern you always check",
          body:
            "## The opportunity and the trap\n" +
            "AI can collapse hours of research into minutes: summarising long documents, brainstorming search angles, structuring a report, drafting a competitor framework. But it has one dangerous habit, it invents things confidently. Fake companies, made-up statistics, citations to studies that do not exist. Treat it as a brilliant, fast intern who sometimes lies, useful, but never trusted blindly.\n\n" +
            "## Where AI genuinely helps research\n" +
            "- **Summarising:** paste a long article or report and ask for the three key points. (Then check them against the original.)\n" +
            "- **Structuring:** ask it to draft the columns for a competitor table, or an outline for a market report.\n" +
            "- **Search angles:** ask 'what are 10 ways to find wholesale buyers for handmade goods?' to spark ideas you then execute yourself.\n" +
            "- **Sourced search tools:** Perplexity and similar tools cite their sources, which makes verification easier, but you still click through and confirm.\n\n" +
            "## Where AI is dangerous\n" +
            "- **Facts and numbers:** never put an AI-generated statistic in a report without finding the real source. If you cannot find it, it may not exist.\n" +
            "- **Citations:** AI famously invents plausible-looking sources. Always click the link and confirm it says what AI claims.\n" +
            "- **Contact details:** verify any email or company AI gives you; it may be wrong or fabricated.\n\n" +
            "## The rule\n" +
            "Use AI to go faster on the work, then verify every fact and source yourself before it reaches the founder. The founder is paying for *your* judgement and reliability, and 'the AI told me' is never a defence for a wrong answer.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "If an AI tool gives you a statistic with a citation, you can trust the citation without clicking it.",
              answer: false,
              whenRight: "Correct. AI famously invents plausible-looking sources. Always click through and confirm the source exists and says what AI claims.",
              whenWrong: "You cannot. AI fabricates citations that look real. Click every link and verify before relying on the stat.",
            },
            {
              prompt: "AI is genuinely useful for summarising a long document or brainstorming where to search.",
              answer: true,
              whenRight: "Yes. Those are great uses: it accelerates the work. Just verify the summary against the original and execute the search angles yourself.",
              whenWrong: "It is useful for exactly those. Summarising and idea-generation are AI's strengths; the rule is to verify the output, not avoid the tool.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Accelerate, then verify",
          body:
            "1. Use an AI tool to summarise a long article relevant to Kola's market into three points, then verify each against the original and note any drift.\n" +
            "2. Ask AI for five potential competitors or prospects, then independently verify which actually exist and fit (and flag any it invented).\n" +
            "3. Write one sentence on what AI did well and where it would have misled you.\n\n" +
            "Deliverable: the verified summary, the checked AI list with any fabrications flagged, and your one-sentence reflection.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship: the research package",
      summary: "Deliver three sourced assets a founder can act on. Portfolio artefact #4.",
      items: [
        {
          kind: "lesson",
          title: "A package that proves you can be trusted with questions",
          body:
            "## The week's deliverable\n" +
            "Today you assemble everything into a research package for Kola: a market report, a competitor analysis, and a prospect database, each sourced and ending in a clear 'so what'. This is portfolio artefact number four, and it proves a specific, sellable thing: a founder can hand you a vague question and get back a trustworthy, actionable answer.\n\n" +
            "## The standard\n" +
            "Three tests for each asset:\n" +
            "1. **Sourced:** every claim is traceable to a credible source.\n" +
            "2. **Actionable:** it ends with what it means for the founder, not just facts.\n" +
            "3. **Clean:** scannable, structured, BLUF-first, the kind of document Ama reads in two minutes and trusts.\n\n" +
            "## Why this is valuable\n" +
            "Research is one of the most common and best-paid remote tasks, because it directly informs decisions founders are nervous about: where to sell, what to charge, who to approach. An operator who delivers reliable, sourced research becomes the person a founder turns to before every big move. That package in your portfolio says exactly that.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A strong research deliverable ends with what the findings mean for the founder, not just the raw data.",
              answer: true,
              whenRight: "Yes. The 'so what', the recommendation or implication, is the value. Founders pay for direction, not a data dump.",
              whenWrong: "It should end with the implication. Raw facts leave the founder to do the analysis; your job is to deliver the 'so what'.",
            },
            {
              prompt: "Because you did the research carefully, you can skip listing sources in the final package.",
              answer: false,
              whenRight: "Correct. Sources are what let the founder trust and check the work. Careful research without citations still reads as unverifiable.",
              whenWrong: "Never skip sources. They are the proof. A package without citations cannot be trusted or defended, no matter how careful you were.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Final build: the research package",
          body:
            "This is the Week 4 portfolio deliverable. Assemble three sourced assets for Kola:\n" +
            "1. **Market report** (one page): customer, demand signals, price range, trend, barrier, and a 'so what', all sourced.\n" +
            "2. **Competitor analysis**: a five-competitor table on consistent criteria, with a positioning conclusion.\n" +
            "3. **Prospect database**: 25 qualified rows with source and fit notes.\n\n" +
            "Every claim cited. Export the reports as a PDF and keep the prospect sheet shareable. This is portfolio artefact #4.",
        },
      ],
    },
  ],
  topics: [
    "The researcher's mindset: find and trust information",
    "Advanced search operators",
    "Source evaluation and verification (currency, authority, bias)",
    "Market research and honest estimation",
    "Competitor analysis on consistent criteria",
    "Lead generation and prospect research",
    "Organising and presenting findings (BLUF, citations)",
    "Using AI for research safely",
  ],
  tasks: [
    "Use search operators to answer specific questions",
    "Verify claims against independent credible sources",
    "Sketch a market picture with a 'so what'",
    "Build a five-competitor comparison table",
    "Compile a 25-row qualified prospect database",
    "Write a one-page sourced research report",
    "Use AI to accelerate research and verify its output",
  ],
  project:
    "Deliver three research assets for Kola: a sourced market report on West African handmade goods, a competitor analysis of five similar brands with a positioning conclusion, and a prospect database of 25 potential wholesale buyers with contacts and notes. Every claim cited. Portfolio artefact #4.",
  exercises: [
    "Run four searches using operators and capture a sourced finding from each",
    "Verify three claims with the credibility checklist and a second source",
    "Build a five-competitor table on consistent criteria with a positioning conclusion",
    "Compile a 25-row prospect list with source and fit notes",
    "Use AI to summarise and brainstorm, then verify and flag any fabrications",
  ],
  questions: [
    "How do you tell a reliable source from an unreliable one?",
    "What belongs in a competitor analysis?",
    "What makes a prospect list actually usable for outreach?",
  ],
  outputs: [
    "A sourced market/startup research report",
    "A competitor analysis table with a positioning conclusion",
    "A 25-row prospect database",
    "A reusable research-report template",
  ],
  mastery_questions: [
    "Use at least three search operators (quotes, site:, filetype:, minus) to find a precise answer",
    "Evaluate a source for currency, authority, corroboration, and bias",
    "Verify one fact against two independent sources and cite both",
    "Build a competitor comparison with consistent columns and a positioning conclusion",
    "Compile a 25-row prospect list with name, role, contact, source, and fit note",
    "Triangulate a market estimate from verifiable signals when no official figure exists",
    "Summarise a long article into three sourced bullet points",
    "Catch and flag a fabricated AI 'fact' or citation",
    "Write a BLUF-first research report that ends with a 'so what'",
    "Cite every claim so a reader can trace it back",
  ],
  ai_assist:
    "Use AI to accelerate, never to author your facts. Good uses: summarising long documents (then checking against the original), structuring a report or competitor table, brainstorming search angles, and using sourced tools like Perplexity. Dangerous uses: trusting AI-generated statistics, citations, or contact details, it invents them confidently. The rule: go faster with AI, then verify every fact and source yourself. 'The AI said so' is never a defence for a wrong answer to a founder.",
  pre_flight:
    "Before researching anything, write the exact question you are answering and what a useful answer looks like. A vague brief ('research competitors') wastes hours; a specific one ('which five brands sell similar baskets to UK diaspora buyers and how do they price?') gets answered. Keep the question in front of you so you do not drift.",
  common_mistakes: [
    "Trusting the first result without checking the source",
    "Copying AI-generated facts, citations, or contacts without verifying",
    "Collecting data with no consistent structure, so it cannot be used",
    "Researching endlessly without ever writing the sourced answer down",
    "Delivering facts with no 'so what' for the founder",
  ],
  debug_help:
    "If research is taking forever, your question is too broad or you are perfectionist-collecting, set a timebox, answer the specific question with the best sourced evidence you have, and clearly note what is uncertain. If you cannot find an official figure, that is normal: triangulate from verifiable signals and label it directional. A clear, honest 80% answer delivered today beats a perfect one next week.",
  stretch: [
    "Build a reusable research-report template and a prospect-list template",
    "Learn one tool for finding and verifying business emails",
    "Create a source-credibility checklist you apply to every claim",
  ],
  resources: [
    { label: "Google Search operators guide", url: "https://support.google.com/websearch/answer/2466433", note: "Free, official" },
    { label: "Google Scholar", url: "https://scholar.google.com/", note: "Free, credible studies" },
    { label: "Perplexity", url: "https://www.perplexity.ai/", note: "Free tier, sourced search" },
  ],
};
