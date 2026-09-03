/* Week 5 - SEO Advanced (Phase: Search) */
module.exports = {
  number: 5,
  title: "SEO Advanced",
  phase: "Search",
  commitment_hours: "7, 11",
  context:
    "Last week you found the keywords and built the strategy. This week you make pages actually rank, through the two halves of advanced SEO: technical SEO (making sure Google can crawl, understand, and trust your site, and that the site is fast and works on mobile) and link building (earning links from other websites, which act as votes of trust that lift your rankings). These are the levers that move a page from invisible to page one.\n\n" +
    "Do not be intimidated by the word 'technical'. The high-impact technical SEO checks are things any marketer can do with free tools: is the site fast, mobile-friendly, indexed, and free of obvious errors? And link building, often seen as a dark art, is mostly about earning genuine mentions and listings: local directories, partnerships, press, and content good enough that people link to it.\n\n" +
    "By Sunday you will have produced a technical SEO checklist (audited against real tools) and a link-building plan for Adwoa's Kitchen, the practical actions to turn last week's strategy into rankings. That is case study #5, and it completes your search expertise.",
  concept_check: [
    {
      q: "Adwoa's website takes 9 seconds to load on a phone. Why is this an SEO and business problem?",
      choices: [
        "It is not a problem if the content is good",
        "Slow sites rank worse (page speed is a ranking factor) AND most visitors abandon a slow page before it loads, so you lose rankings and customers",
        "Speed only matters on desktop",
        "Google ignores load time",
      ],
      correct: 1,
      explain: "Page speed is both a ranking factor and a conversion factor. A large share of mobile visitors leave if a page takes more than a few seconds. A slow site loses rankings AND the customers who do find it. Most of Adwoa's customers are on phones.",
    },
    {
      q: "What does a link from another reputable website to Adwoa's site do for her SEO?",
      choices: [
        "Nothing",
        "It acts as a 'vote of trust', backlinks from quality sites are a major ranking factor that signals to Google the site is credible",
        "It only sends traffic, never helps ranking",
        "It hurts her ranking",
      ],
      correct: 1,
      explain: "Backlinks are like votes, when a reputable site links to you, Google reads it as an endorsement of your credibility. Quality backlinks are one of the strongest ranking factors. A few good links beat many spammy ones.",
    },
    {
      q: "A 'link building agency' offers Adwoa 5,000 backlinks for GHS 200. Why should she refuse?",
      choices: [
        "It is too cheap",
        "Mass low-quality/spammy links are a 'black-hat' tactic that Google penalises, they can get a site demoted or removed. Quality and relevance beat quantity",
        "5,000 is too few to matter",
        "Links never help anyway",
      ],
      correct: 1,
      explain: "Buying thousands of spammy links violates Google's guidelines and can trigger a penalty that tanks rankings. Good link building is slow and genuine: relevant, reputable sources. A handful of real links is worth more than thousands of fake ones.",
    },
  ],
  topics: [
    "Technical SEO: crawlability and indexing",
    "Page speed and Core Web Vitals",
    "Mobile-friendliness",
    "Site structure, URLs, and sitemaps",
    "Structured data basics",
    "What backlinks are and why they matter",
    "White-hat link building tactics",
    "Local citations and directories",
  ],
  tasks: [
    "Run a technical audit with free tools (PageSpeed Insights, mobile test)",
    "Build a technical SEO fix checklist",
    "Identify realistic link-building opportunities",
    "Plan a local citations/directory campaign",
    "Produce a technical SEO checklist + link-building plan",
  ],
  project:
    "Produce an advanced SEO action plan for Adwoa's Kitchen: a technical SEO checklist audited against real free tools (speed, mobile, indexing, structure) with prioritised fixes, plus a realistic link-building and local-citations plan (directories, partnerships, content, outreach). Portfolio case study #5.",
  exercises: [
    "Run PageSpeed Insights and the mobile-friendly test; record the findings",
    "Build a prioritised technical fix list",
    "List 15 realistic link/citation opportunities for a Ghanaian food business",
    "Draft an outreach message to earn a link or feature",
  ],
  questions: [
    "Can Google crawl, index, and load Adwoa's site well?",
    "Where can Adwoa earn genuine, relevant backlinks?",
    "Which fixes give the biggest ranking gain for the least effort?",
  ],
  outputs: [
    "A technical SEO audit and prioritised fix checklist",
    "A link-building and local-citations plan",
    "An outreach template",
    "A combined advanced SEO action plan",
  ],
  mastery_questions: [
    "Name three high-impact technical SEO checks and the free tool for each",
    "Explain why page speed affects both rankings and sales",
    "Describe two white-hat link-building tactics",
    "Explain why buying mass backlinks is dangerous",
    "List five local citation sources for a Ghanaian business",
  ],
  ai_assist:
    "Use AI to draft outreach and explain technical findings: 'Write a short, friendly outreach email asking a Ghanaian food blogger to feature our spice mix.' Or paste a PageSpeed Insights result and ask 'explain these issues in plain English and which to fix first.' AI is excellent at turning technical jargon into a clear action list, you decide the priorities and do the outreach personally (personalised beats templated).",
  pre_flight: [
    "Your Week 4 SEO audit + keyword strategy",
    "Adwoa's website (or a test site to audit)",
    "Google Search Console (from Week 4)",
  ],
  common_mistakes: [
    "Ignoring mobile speed when most customers are on phones",
    "Chasing backlinks before fixing crawl/index/speed basics",
    "Buying spammy links (a penalty risk that can tank the site)",
    "Treating technical SEO as too hard and skipping the easy, high-impact checks",
  ],
  debug_help: [
    "Site slow? Compress images first, oversized photos are the #1 cause of slow food sites.",
    "Page not ranking after weeks? Check it is indexed and the on-page basics (Week 4) are right before chasing links.",
    "No idea where to get links? Start with local directories and your existing relationships (suppliers, partners, customers).",
  ],
  stretch: [
    "Add basic structured data (LocalBusiness / Product) to help Google display rich results",
    "Plan a 'linkable asset' (a great recipe guide) designed to attract links",
  ],
  resources: [
    "Google PageSpeed Insights (free)",
    "Google's Mobile-Friendly Test and Search Console (free)",
    "Local Ghanaian business directories and food blogs",
  ],
  days: [
    {
      number: 0,
      title: "Technical SEO demystified, and set up the tools",
      summary:
        "Today you'll see that technical SEO is mostly simple, high-impact checks, and set up the free tools to run them.",
      items: [
        {
          kind: "lesson",
          title: "Technical SEO is not scary",
          body:
            "## What technical SEO really is\n" +
            "Technical SEO sounds intimidating but it boils down to one goal: *make sure Google can crawl, understand, and trust your site, and that the site works well for people.* You do not need to be a developer. The highest-impact technical checks, can Google find and index the pages? is the site fast? does it work on mobile? are there broken links or errors?, are all checkable with free tools and fixable with basic actions (mostly: compress images, fix titles, submit a sitemap). The 20% of technical SEO that any marketer can do delivers 80% of the benefit.\n\n" +
            "## The technical priorities (in order)\n" +
            "1. **Crawlable and indexed:** Google must be able to reach your pages and they must be in the index. (Check in Search Console; search `site:domain.com`.) A page Google cannot index cannot rank, this is foundational.\n" +
            "2. **Mobile-friendly:** most customers (and most of Google's ranking, via mobile-first indexing) are on phones. The site must work and read well on a small screen.\n" +
            "3. **Fast:** speed is a ranking and conversion factor. Slow = lost rankings and lost customers.\n" +
            "4. **Sound structure:** logical site structure, clean URLs, a sitemap, internal links, and no broken links or major errors.\n\n" +
            "## The free toolkit\n" +
            "- **Google PageSpeed Insights** (pagespeed.web.dev): paste a URL, get a speed score and a plain-language list of what to fix (the biggest one is almost always 'compress/resize images').\n" +
            "- **Google's Mobile-Friendly Test / your own phone:** does the page work on mobile?\n" +
            "- **Google Search Console** (from Week 4): indexing status, coverage errors, and real performance data.\n\n" +
            "## The 80/20 of technical SEO\n" +
            "Do not get lost in advanced details. For a small business, the wins are: ensure pages are indexed, make the site mobile-friendly, compress images to make it fast, fix obvious errors, and submit a sitemap. Today you set up the tools and run the first checks. Tomorrow you turn findings into a fix list.",
        },
        {
          kind: "lesson",
          title: "Run your first technical checks",
          body:
            "## Get baseline numbers today\n" +
            "You cannot improve what you have not measured. Run these now on Adwoa's site (or a test site if she has none yet, the audit will recommend building one):\n\n" +
            "**1. PageSpeed Insights.** Go to pagespeed.web.dev, paste the URL, run it for *Mobile* (most important). Note the score (0-100) and read the 'Opportunities' and 'Diagnostics', it tells you in plain language what is slowing the page (usually oversized images, then scripts). Record the top 3 issues.\n\n" +
            "**2. Mobile check.** Open the site on your phone. Is text readable without zooming? Are buttons tappable? Does it load reasonably? Note anything broken or awkward.\n\n" +
            "**3. Indexing check.** In Google, search `site:adwoaskitchen.com` (use the real domain). The results show what Google has indexed. Few or no results = an indexing problem. In Search Console, check the 'Pages' / coverage report for errors.\n\n" +
            "**4. Quick crawl scan (optional).** A free tool like the Screaming Frog SEO Spider (free up to 500 URLs) can crawl the whole site and list broken links, missing titles, and errors, useful but optional for a small site.\n\n" +
            "## Write down the numbers\n" +
            "Record the baseline: mobile speed score, mobile-friendliness, index status, and any errors. These numbers are your 'before' picture, and improving them is concrete, demonstrable work for your case study. Today you gather the data; the rest of the week you act on it and plan the links.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Technical SEO requires being a developer; a marketer cannot do the high-impact parts.",
              answer: false,
              whenRight: "Right, the highest-impact checks (indexing, mobile, speed via image compression) are doable by any marketer with free tools.",
              whenWrong: "Not true. The 80/20 of technical SEO, indexing, mobile, speed, is checkable and fixable without being a developer.",
            },
            {
              prompt: "A page Google cannot index can still rank if the content is excellent.",
              answer: false,
              whenRight: "Right, no. Indexing is foundational: if it is not in Google's index, it cannot appear in results at all. Fix indexing first.",
              whenWrong: "It cannot rank. Indexing comes first, an unindexed page is invisible to search no matter how good it is.",
            },
            {
              prompt: "PageSpeed Insights gives a plain-language list of what is slowing a page, usually led by oversized images.",
              answer: true,
              whenRight: "Yes. It scores speed and lists fixes in order. For food sites, big unoptimised photos are almost always the top issue.",
              whenWrong: "It does. It tells you what to fix in plain terms; compressing/resizing images is usually the #1 win.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, run the technical baseline",
          body:
            "Gather the technical baseline:\n\n" +
            "- [ ] Run PageSpeed Insights (Mobile) and record the score + top 3 issues\n" +
            "- [ ] Check the site on your phone and note any mobile problems\n" +
            "- [ ] Check indexing with `site:domain.com` and Search Console\n" +
            "- [ ] Record the 'before' numbers in your audit doc\n\n" +
            "(If there is no site yet, note that as the #1 finding and audit a comparable competitor instead.) Tomorrow you turn these into a prioritised fix list.",
        },
      ],
    },
    {
      number: 1,
      title: "Orient, technical checklist + link plan",
      summary:
        "Today you'll see the two deliverables, a technical SEO checklist and a link-building plan, and how they turn last week's strategy into rankings.",
      items: [
        {
          kind: "lesson",
          title: "The two levers that move rankings",
          body:
            "## From strategy to rankings\n" +
            "Last week you decided *what* to rank for. This week is *how to actually rank*, and ranking is driven by two big levers beyond good on-page content:\n\n" +
            "1. **Technical health** (this is on your own site): Google must be able to crawl, index, and load your pages well. Technical problems (not indexed, slow, broken on mobile) cap your rankings no matter how good the content. Fixing them removes the ceiling.\n" +
            "2. **Authority via backlinks** (this comes from other sites): when reputable sites link to you, Google treats it as a vote of trust, a major ranking factor. More quality votes = higher rankings. This is how you compete with bigger, older sites.\n\n" +
            "## Why both, in this order\n" +
            "Fix the technical basics *first*, there is no point earning links to a site Google cannot index or that visitors abandon for being slow. Once the foundation is sound, links amplify it. Many small businesses waste effort chasing links while a basic technical problem holds them back. Audit and fix, then build authority.\n\n" +
            "## The two deliverables this week\n" +
            "- **Technical SEO checklist:** the prioritised list of technical fixes (from the audit), so the site is crawlable, indexed, fast, mobile-friendly, and error-free.\n" +
            "- **Link-building plan:** the realistic, white-hat ways Adwoa can earn authority, local directories and citations, partnerships, press/blog features, and content worth linking to, plus an outreach approach.\n\n" +
            "## Manage expectations again\n" +
            "Both levers take time to show results, technical fixes can help within days to weeks; links and authority build over months. SEO rewards patience. But these are exactly the actions that move Adwoa from invisible to page one over time. Today you frame the two deliverables. Tomorrow you tackle the highest-impact technical fix: speed.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "You should fix technical basics (indexing, speed, mobile) before chasing backlinks.",
              answer: true,
              whenRight: "Yes. No point earning links to a site Google cannot index or visitors abandon. Fix the foundation, then build authority.",
              whenWrong: "Fix technical first. Links to a broken/slow/unindexed site are wasted. Foundation, then authority.",
            },
            {
              prompt: "Backlinks from reputable sites act as votes of trust and are a major ranking factor.",
              answer: true,
              whenRight: "Yes. Quality links are endorsements that lift rankings, how a small site competes with bigger, older ones.",
              whenWrong: "They are. Reputable backlinks are trust votes and one of the strongest ranking levers.",
            },
            {
              prompt: "Technical fixes and link building both deliver instant results within a day.",
              answer: false,
              whenRight: "Right, technical fixes help within days-to-weeks; authority builds over months. SEO rewards patience.",
              whenWrong: "Not instant. Technical fixes take days-to-weeks; links build authority over months. SEO is patient money.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, frame the week",
          body:
            "Set up your `Advanced SEO Action Plan` doc:\n\n" +
            "- [ ] Note the two levers (technical health on your site; authority via links)\n" +
            "- [ ] List the technical areas to fix (from Day 0's baseline)\n" +
            "- [ ] List the link/authority areas to explore (directories, partners, press, content)\n" +
            "- [ ] Write the realistic-timeline expectation in one line\n\n" +
            "Tomorrow: speed and mobile, the highest-impact technical wins.",
        },
      ],
    },
    {
      number: 2,
      title: "Speed and mobile, the make-or-break basics",
      summary:
        "Today you'll fix the two technical factors that matter most for a food business: page speed and mobile experience.",
      items: [
        {
          kind: "lesson",
          title: "Fast and mobile, or lose the customer",
          body:
            "## Why speed is non-negotiable\n" +
            "Page speed affects *both* rankings *and* sales. Google uses speed as a ranking factor, and humans are impatient: a large share of mobile visitors abandon a page that takes more than about three seconds to load. So a slow site is a double loss, it ranks lower *and* loses the visitors who do arrive. For Adwoa, whose customers are hungry and on phones, speed directly costs orders.\n\n" +
            "## The biggest speed fix: images\n" +
            "For a food site, the number-one cause of slowness is almost always **huge, unoptimised images**. A 5MB photo straight from a phone camera can be reduced to under 200KB with no visible quality loss, that is 25x faster to load. The fixes (in order of impact):\n\n" +
            "1. **Compress and resize images** before uploading (free tools: TinyPNG, Squoosh, or Canva's download settings). Resize to the size actually displayed, do not upload a 4000px image into a 600px slot.\n" +
            "2. **Use modern formats** (WebP) where possible.\n" +
            "3. **Enable lazy loading** (images load as you scroll), most modern site builders do this automatically.\n\n" +
            "PageSpeed Insights will confirm images as the top issue for most food sites. Fixing them often jumps the score dramatically.\n\n" +
            "## Other speed wins\n" +
            "Beyond images: remove unused plugins/scripts, use a decent host, and keep the page simple. But for a small business, *image optimisation alone* usually solves most of the problem. Do not over-engineer.\n\n" +
            "## Mobile-first is the reality\n" +
            "Google ranks based on the *mobile* version of your site (mobile-first indexing), and most of Adwoa's customers are on phones. So mobile is not optional. Check: Is text readable without zooming? Are buttons big enough to tap? Does the layout work on a narrow screen? Is the order/WhatsApp button easy to reach? A modern site builder (Wix, Squarespace, Shopify) is mobile-responsive by default, the main job is making sure the *content and ordering path* work well on a small screen.\n\n" +
            "Today you fix (or plan the fixes for) speed and mobile, the highest-leverage technical work there is.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "For a food website, oversized unoptimised images are usually the #1 cause of slow loading.",
              answer: true,
              whenRight: "Yes. Compressing/resizing images (often from MBs to KBs) is the single biggest speed win for most small sites.",
              whenWrong: "It is. Big photos straight from a camera are the top culprit. Compress and resize, the score jumps.",
            },
            {
              prompt: "Google ranks based on the desktop version of your site, so mobile is secondary.",
              answer: false,
              whenRight: "Wrong, Google uses mobile-first indexing. The mobile version is what is ranked, and most customers are on phones anyway.",
              whenWrong: "It is mobile-first. Google ranks the mobile version; mobile is primary, not secondary, especially for a food business.",
            },
            {
              prompt: "A slow site loses both rankings and the visitors who do arrive.",
              answer: true,
              whenRight: "Yes, a double loss: lower rankings AND abandoned visits. Speed is a ranking and a conversion factor.",
              whenWrong: "It is a double hit, worse rankings and people leaving before it loads. Speed matters twice.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, fix speed and mobile",
          body:
            "Tackle the highest-impact technical fixes:\n\n" +
            "- [ ] Compress/resize the heaviest images (or document the plan if you do not own the site)\n" +
            "- [ ] Re-run PageSpeed Insights and note the improvement\n" +
            "- [ ] Audit the mobile experience: readable text, tappable buttons, easy ordering path\n" +
            "- [ ] List any mobile fixes needed\n\n" +
            "Tomorrow: indexing, structure, and the rest of the technical checklist.",
        },
      ],
    },
    {
      number: 3,
      title: "Indexing, structure, and the technical checklist",
      summary:
        "Today you'll ensure Google can find and understand every important page, and finalise the technical SEO checklist.",
      items: [
        {
          kind: "lesson",
          title: "Make every page findable and clear",
          body:
            "## Crawlable and indexed\n" +
            "Google can only rank pages it can *find* (crawl) and *store* (index). Make this airtight:\n\n" +
            "- **Submit a sitemap** in Search Console (a sitemap is a list of your pages; most site builders generate one automatically at /sitemap.xml). This helps Google discover everything.\n" +
            "- **Check the index:** in Search Console's Pages report, confirm your important pages are indexed and fix any 'not indexed' errors.\n" +
            "- **No accidental blocking:** make sure key pages are not blocked by robots.txt or a 'noindex' tag (a common, silent killer where a setting hides pages from Google).\n\n" +
            "## Clean site structure\n" +
            "A logical structure helps both Google and users:\n\n" +
            "- **Simple, readable URLs:** /jollof-spice-mix, /menu, /about, not /page?id=482.\n" +
            "- **Shallow hierarchy:** important pages reachable in a couple of clicks from the homepage.\n" +
            "- **Internal links:** link related pages together (the recipe blog links to the product page; the menu links to ordering). This spreads authority and helps crawling.\n" +
            "- **No broken links (404s):** broken links frustrate users and waste crawl budget. A crawl tool or Search Console flags them.\n\n" +
            "## Structured data (a bonus lever)\n" +
            "Structured data (schema markup) is code that tells Google extra detail about your content, e.g. that a page is a *LocalBusiness* (with hours, location, rating) or a *Product* (with price, availability) or a *Recipe*. It can earn 'rich results' (star ratings, prices, recipe cards shown right in search), which boost clicks. Many site builders add basic schema automatically, or a plugin can. For a food business, LocalBusiness, Product, and Recipe schema are worth having. Note it as a 'nice to have' if the basics are not done yet.\n\n" +
            "## Finalise the checklist\n" +
            "Pull all technical findings into one prioritised **technical SEO checklist**: each item with its status (done/to-fix), priority, and the action. This is half of case study #5, and a clear, professional deliverable. Today you complete the technical side; tomorrow you turn to link building.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Submitting a sitemap in Search Console helps Google discover all your pages.",
              answer: true,
              whenRight: "Yes. A sitemap lists your pages so Google can find and index them. Most site builders generate one automatically.",
              whenWrong: "It does. The sitemap is a map of your pages for Google. Submit it in Search Console to aid discovery.",
            },
            {
              prompt: "A page accidentally set to 'noindex' or blocked in robots.txt can silently stay out of Google.",
              answer: true,
              whenRight: "Yes, a common silent killer. Always check key pages are not accidentally blocked from indexing.",
              whenWrong: "It can. A stray noindex/robots block hides pages from Google entirely. Check for it when a page will not rank.",
            },
            {
              prompt: "Structured data can earn rich results (stars, prices, recipe cards) that boost clicks.",
              answer: true,
              whenRight: "Yes. LocalBusiness, Product, and Recipe schema can produce eye-catching rich results, more clicks for the same ranking.",
              whenWrong: "It can. Schema markup powers rich results that stand out in search and lift click-through. A worthwhile bonus lever.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, finalise the technical checklist",
          body:
            "Complete the technical SEO checklist:\n\n" +
            "- [ ] Confirm sitemap submitted and key pages indexed (or note the fix)\n" +
            "- [ ] Check for accidental noindex/robots blocking\n" +
            "- [ ] Review URL structure, internal links, and broken links\n" +
            "- [ ] Note structured data opportunities (LocalBusiness, Product, Recipe)\n" +
            "- [ ] Compile a prioritised technical checklist (item, status, priority, action)\n\n" +
            "Half the deliverable done. Tomorrow: link building, earning authority.",
        },
      ],
    },
    {
      number: 4,
      title: "Link building, earning authority",
      summary:
        "Today you'll learn how backlinks lift rankings and the white-hat ways a small business can earn them genuinely.",
      items: [
        {
          kind: "lesson",
          title: "Links are votes, earn the real ones",
          body:
            "## Why links matter\n" +
            "A **backlink** is a link from another website to yours. Google reads links as *votes of trust*: when a reputable site links to you, it is endorsing your credibility. Authority built from quality backlinks is one of the strongest ranking factors, it is largely how Google decides which of many relevant pages deserves the top spot. A small new site with good content but no links struggles to outrank established sites; earning genuine links is how you build the authority to compete.\n\n" +
            "## Quality and relevance over quantity\n" +
            "Not all links are equal. **One link from a respected, relevant site** (a popular Ghanaian food blog, a local news site, a well-known directory) is worth more than *thousands* of links from spammy, irrelevant sites. In fact, mass spammy links are dangerous (Day 0's lesson, they can trigger a Google penalty). The rule: pursue links that are **relevant** (food/local/Ghana) and from **trustworthy** sources. Quality, relevance, and genuineness, always.\n\n" +
            "## White-hat link-building tactics (realistic for Adwoa)\n" +
            "1. **Local citations and directories:** get listed in reputable directories, business listings, food directories, local Ghana business sites, and (crucially) Google Business Profile. These are easy, legitimate links and citations that also help local SEO.\n" +
            "2. **Partnerships and relationships:** suppliers, complementary local businesses, a venue Adwoa caters for, partners often link to each other. Ask.\n" +
            "3. **Press and features:** pitch local food bloggers, community pages, and small media to feature or review Adwoa's food/spice mix. A genuine story (a local cook bottling her family recipe) is pitchable.\n" +
            "4. **Linkable content:** create something genuinely worth linking to, a great 'how to cook perfect jollof' guide, a recipe collection, that bloggers and forums naturally reference. The best long-term link strategy is content too good to ignore.\n" +
            "5. **Be where customers leave reviews/mentions:** food groups, review sites, community forums.\n\n" +
            "## The slow, honest game\n" +
            "Good link building is slow and relationship-based, there is no instant shortcut that does not risk a penalty. But each genuine link compounds. A handful of relevant, quality links over a few months can meaningfully lift Adwoa's rankings. Today you build a realistic link/citation opportunity list and an outreach approach.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "One link from a respected, relevant site is worth more than thousands of spammy links.",
              answer: true,
              whenRight: "Yes. Quality and relevance beat quantity. Mass spammy links can even trigger a penalty. Pursue genuine, relevant sources.",
              whenWrong: "It is. A few quality, relevant links outweigh thousands of junk ones, which are dangerous, not helpful.",
            },
            {
              prompt: "Creating content too good to ignore is a strong long-term link-building strategy.",
              answer: true,
              whenRight: "Yes. A great guide or recipe collection earns links naturally as people reference it. The best links are earned by quality.",
              whenWrong: "It is. 'Linkable assets', genuinely excellent content, attract links over time. The durable strategy.",
            },
            {
              prompt: "Local directory listings and a Google Business Profile are spammy and should be avoided.",
              answer: false,
              whenRight: "Wrong, reputable local citations/directories are legitimate, easy links that also boost local SEO. Avoid only spammy link farms.",
              whenWrong: "They are legitimate and valuable. Reputable directories and GBP are good citations; only spammy link farms are the danger.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build the link plan",
          body:
            "Create the link-building plan:\n\n" +
            "- [ ] List 15 realistic link/citation opportunities (directories, partners, blogs, press, content)\n" +
            "- [ ] Mark each as easy/medium/hard and relevant/very-relevant\n" +
            "- [ ] Identify 3 'linkable content' ideas (e.g. a jollof guide) worth creating\n" +
            "- [ ] Note the local citations that also help local SEO\n\n" +
            "Tomorrow you write the outreach and assemble the plan.",
        },
      ],
    },
    {
      number: 5,
      title: "Outreach and citations, making it happen",
      summary:
        "Today you'll write effective outreach and plan the local citations campaign that earns Adwoa's first real links.",
      items: [
        {
          kind: "lesson",
          title: "Ask well, and get listed everywhere",
          body:
            "## Local citations: the easy wins first\n" +
            "Start with **local citations**, mentions of Adwoa's business Name, Address, Phone (NAP) on other sites, especially directories. These are the lowest-effort, most legitimate links/signals, and they directly boost *local* SEO. Get Adwoa listed (consistently, exact NAP) on: Google Business Profile (done), Facebook, local Ghana business directories, food/restaurant directories, relevant community pages, and any chamber/association sites. Consistency is key, the same NAP everywhere. This alone strengthens local visibility. Build a checklist of citation sources and work through it.\n\n" +
            "## Outreach that works\n" +
            "For partnerships, features, and blogger outreach, the message matters. A good outreach message is:\n\n" +
            "- **Personal:** address the person by name, reference their work ('I loved your post on Accra street food'). Generic blasts get ignored.\n" +
            "- **Brief:** respect their time, a few short lines.\n" +
            "- **Value-first:** offer something (a free spice mix to try, a guest recipe, an exclusive story) rather than just asking for a favour.\n" +
            "- **Clear ask:** one specific request ('would you be open to trying and featuring our jollof spice mix?').\n\n" +
            "A genuine, personalised ask with something in it for them works far better than a templated 'please link to my site'. Quality outreach is relationship-building, not spam.\n\n" +
            "## The pitchable story\n" +
            "Adwoa has a *story*: a home cook in Accra bottling her family jollof recipe to share across Ghana. Stories get featured; product pitches get ignored. When pitching bloggers or local press, lead with the human angle. Marketers who can find and tell the story earn the features (and the links).\n\n" +
            "## Track it\n" +
            "Link building is a campaign: keep a simple tracker of targets, status (contacted/listed/featured), and results. It turns a vague 'get some links' into a managed process, and gives you concrete proof of work. Today you write an outreach template (to personalise per target) and the citations checklist, completing the link plan.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A personalised, value-first outreach message works better than a generic 'please link to me' blast.",
              answer: true,
              whenRight: "Yes. Personal, brief, value-first (offer something), one clear ask. Generic blasts get ignored.",
              whenWrong: "It does. Personalise, lead with value, make one clear ask. Templated spam fails.",
            },
            {
              prompt: "Local citations require the exact same Name, Address, Phone across every listing.",
              answer: true,
              whenRight: "Yes. NAP consistency is essential, inconsistency confuses Google and weakens local SEO. Same details everywhere.",
              whenWrong: "They do. Identical NAP across all citations is the rule; inconsistency undermines the benefit.",
            },
            {
              prompt: "Leading a press pitch with the human story works better than just describing the product.",
              answer: true,
              whenRight: "Yes. Stories get featured; product specs get ignored. Adwoa's home-cook-bottling-her-recipe story is pitchable gold.",
              whenWrong: "It does. Media want stories, not product pitches. Lead with the human angle to earn features and links.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, write outreach + citations plan",
          body:
            "Complete the link-building execution plan:\n\n" +
            "- [ ] Build a local citations checklist (10+ directory/listing sources, exact NAP)\n" +
            "- [ ] Write a personalised outreach template (to adapt per target)\n" +
            "- [ ] Write Adwoa's pitchable story in 3 sentences\n" +
            "- [ ] Set up a simple link-building tracker (target, status, result)\n\n" +
            "Tomorrow you assemble the full advanced SEO action plan.",
        },
      ],
    },
    {
      number: 6,
      title: "Assemble the advanced SEO action plan",
      summary:
        "Today you'll combine the technical checklist and link-building plan into one prioritised, executable action plan.",
      items: [
        {
          kind: "lesson",
          title: "One plan, prioritised by impact",
          body:
            "## Bring the two halves together\n" +
            "You have a technical SEO checklist and a link-building plan. Combine them into one **Advanced SEO Action Plan** that someone could pick up and execute. The structure:\n\n" +
            "1. **Technical fixes** (prioritised): each item, its status, priority, and the action, with the before/after numbers you captured (e.g. mobile speed score improved from X to Y).\n" +
            "2. **Link/authority plan:** the citations checklist, the outreach targets and template, the linkable-content ideas, and the tracker.\n" +
            "3. **Priority order:** what to do first (this month), next (this quarter), and ongoing.\n\n" +
            "## Prioritise by impact vs effort (again)\n" +
            "Lead with high-impact, low-effort actions:\n\n" +
            "- **Now:** fix speed (compress images), ensure indexing, complete local citations, start review collection. (Fast, high impact.)\n" +
            "- **This quarter:** build/optimise the priority pages (Week 4), begin outreach for features and partnerships.\n" +
            "- **Ongoing:** create linkable content (recipe guides), keep earning reviews and links, monitor in Search Console.\n\n" +
            "## Connect it back to the strategy\n" +
            "Tie the plan explicitly to Week 4's keyword strategy: these technical fixes and links exist to help the priority pages rank for the priority keywords. The whole search effort now hangs together, strategy (W4) → execution (W5). That coherence is what makes it a professional plan, not a random checklist.\n\n" +
            "## Show the thinking\n" +
            "Where you made trade-offs (e.g. 'focused on local SEO first because it is the fastest win for a food business'), say so. Explaining *why* you prioritised as you did is what demonstrates real marketing judgement. Today you finish the plan; tomorrow you ship it.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "The action plan should be prioritised (now / this quarter / ongoing), not a flat list.",
              answer: true,
              whenRight: "Yes. Sequence by impact and effort: quick wins now, builds next, content/links ongoing. Order is the strategy.",
              whenWrong: "It should be sequenced. Quick high-impact wins first, then builds, then ongoing. Prioritisation is the value.",
            },
            {
              prompt: "Capturing before/after numbers (e.g. speed score X to Y) strengthens the case study.",
              answer: true,
              whenRight: "Yes. Concrete improvement (a better speed score) is real, demonstrable proof of your work.",
              whenWrong: "It does. Before/after metrics turn 'I optimised the site' into provable results. Capture them.",
            },
            {
              prompt: "The advanced plan should connect back to Week 4's keyword strategy.",
              answer: true,
              whenRight: "Yes. Technical fixes and links serve the priority pages and keywords. That coherence makes it a real strategy.",
              whenWrong: "It should. Tying execution (W5) to strategy (W4) shows the search effort hangs together professionally.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, assemble the plan",
          body:
            "Build the combined plan:\n\n" +
            "- [ ] Combine the technical checklist and link plan into one document\n" +
            "- [ ] Sequence everything: now / this quarter / ongoing\n" +
            "- [ ] Include before/after numbers where you have them\n" +
            "- [ ] Tie the plan back to the Week 4 keyword strategy and explain key priority choices\n\n" +
            "Tomorrow you ship case study #5.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship it, advanced SEO action plan (case study #5)",
      summary:
        "Today you'll package the technical SEO checklist and link-building plan into case study #5.",
      items: [
        {
          kind: "lesson",
          title: "Ship it, complete your search expertise",
          body:
            "## Package case study #5\n" +
            "Present **Adwoa's Kitchen, Advanced SEO Action Plan**, with:\n\n" +
            "- A **challenge/approach** opener (the site was slow, hard to find, and had no authority; you audited the technical health and built a plan to fix it and earn links)\n" +
            "- The **technical SEO checklist** with before/after numbers and prioritised fixes\n" +
            "- The **link-building and citations plan** (opportunities, outreach, linkable content, tracker)\n" +
            "- The **prioritised roadmap** (now / quarter / ongoing) tied to the Week 4 strategy\n\n" +
            "## Why this completes a rare skill set\n" +
            "Together, Weeks 4 and 5 give you full-stack SEO: strategy, keywords, on-page, technical, local, and links. SEO is consistently one of the most in-demand and well-paid marketing skills, and one many marketers avoid because it feels technical. Having two solid SEO case studies makes you genuinely valuable, you can do what most 'content/social' marketers cannot. This is a real differentiator on your CV.\n\n" +
            "## The compounding asset, again\n" +
            "Note the long game: the technical fixes and link building you have planned will, over the coming months, move Adwoa's pages up the rankings and bring a steady stream of high-intent, free traffic, customers actively searching to buy. You have built her a search engine that works while she sleeps. Save case study #5 in your portfolio.\n\n" +
            "Next week: paid advertising on Meta (Facebook and Instagram ads). You shift from earning attention slowly to *buying* it fast, learning to run and measure ad campaigns that put Adwoa's food in front of exactly the right people for a budget.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Weeks 4 and 5 together give you full-stack SEO (strategy, keywords, on-page, technical, local, links).",
              answer: true,
              whenRight: "Yes. Two solid SEO case studies make you valuable, you can do what most content/social-only marketers cannot.",
              whenWrong: "They do. You now cover the whole SEO stack, a rare, well-paid, in-demand skill set.",
            },
            {
              prompt: "SEO is a skill many marketers avoid because it feels technical, which makes it a strong differentiator for you.",
              answer: true,
              whenRight: "Yes. Because many shy away from SEO, doing it well genuinely sets you apart on a CV.",
              whenWrong: "It is. SEO's perceived difficulty means fewer marketers do it, so your two SEO case studies stand out.",
            },
            {
              prompt: "Paid ads (next week) are the same slow-burn channel as SEO.",
              answer: false,
              whenRight: "Right, paid ads BUY attention fast (results in hours/days), the opposite of SEO's slow compounding. Different, complementary channels.",
              whenWrong: "They differ. Ads are fast, paid reach; SEO is slow, earned reach. Next week you learn the fast lever.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Ship it",
          body:
            "Package and ship case study #5:\n\n" +
            "- [ ] One document titled `Adwoa's Kitchen, Advanced SEO Action Plan`\n" +
            "- [ ] Challenge/approach framing\n" +
            "- [ ] Technical checklist (with before/after), link plan, prioritised roadmap, all present\n" +
            "- [ ] Saved in your `Week 05 SEO Advanced` portfolio folder\n\n" +
            "Five case studies done, your search expertise is complete. Next week: paid advertising on Meta.",
        },
      ],
    },
  ],
};
