/* Week 8 - Email Marketing (Phase: Retention, Data and AI) */
module.exports = {
  number: 8,
  title: "Email Marketing",
  phase: "Retention, Data and AI",
  commitment_hours: "7, 11",
  context:
    "Every channel so far, social, SEO, ads, depends on a gatekeeper (an algorithm, Google, an ad auction) and mostly *acquires* new customers. Email is different on both counts. It is an *owned* channel: your list is yours, you can reach people directly, no algorithm deciding who sees you. And it is the king of *retention*: turning one-time buyers into loyal, repeat customers. This is why email consistently delivers the highest return on investment of any marketing channel, often many times that of social or ads.\n\n" +
    "For Adwoa's Kitchen, email (and its cousin, WhatsApp broadcasts) is how a customer who ordered jollof once becomes someone who orders every month, buys the spice mix, and refers friends. The cheapest sale is to someone who already trusts you, and email is how you keep that relationship alive. This week you build the list, the welcome funnel, and the automated sequences that do this on autopilot.\n\n" +
    "By Sunday you will have built an email funnel and an automation sequence for Adwoa: a lead magnet to grow the list, a welcome sequence, and a repeat-purchase flow, set up in a real email tool (Mailchimp or MailerLite, free tiers). That funnel + sequence is case study #8, the loyalty stage of your Week 1 journey made real.",
  concept_check: [
    {
      q: "Why is email often called the highest-ROI marketing channel?",
      choices: [
        "Because it is free to send unlimited emails",
        "It is an OWNED channel (no algorithm gatekeeper) and targets people who already know you, so it converts cheaply and drives repeat purchases",
        "Because everyone reads every email",
        "Because it reaches new strangers best",
      ],
      correct: 1,
      explain: "Email reaches people who already opted in and trust you, directly, with no algorithm deciding reach. Selling to existing, warm contacts is far cheaper and higher-converting than acquiring strangers, which is why email's ROI is the highest of any channel.",
    },
    {
      q: "What is a 'lead magnet' and why does Adwoa need one?",
      choices: [
        "A magnet-shaped fridge advert",
        "Something valuable offered free in exchange for an email address (e.g. a free jollof recipe guide), it is how you grow the email list",
        "A paid ad campaign",
        "A type of email subject line",
      ],
      correct: 1,
      explain: "People will not give their email for nothing. A lead magnet, a free, valuable thing (a recipe guide, a discount, a cooking checklist), gives them a reason to subscribe. It is the engine that turns followers and visitors into owned email contacts.",
    },
    {
      q: "What is the difference between an email broadcast (campaign) and an automation (sequence)?",
      choices: [
        "Nothing",
        "A broadcast is a one-off email sent to the list now; an automation is a pre-built sequence triggered automatically by an action (e.g. a welcome series when someone subscribes)",
        "Automations cost money, broadcasts are free",
        "Broadcasts are only for sales",
      ],
      correct: 1,
      explain: "A broadcast/campaign is sent manually to everyone now (e.g. 'this week's special'). An automation runs by itself: triggered by a behaviour (subscribed, bought, abandoned cart), it sends the right email at the right time forever, without you touching it. Automations are marketing that works while you sleep.",
    },
  ],
  topics: [
    "Why email is the highest-ROI, owned channel",
    "Building a list ethically (permission and lead magnets)",
    "Email service providers (Mailchimp, MailerLite)",
    "Broadcasts/campaigns vs automations",
    "The welcome sequence",
    "Repeat-purchase and re-engagement flows",
    "Writing emails that get opened and clicked (subject lines, body, CTA)",
    "Deliverability, segmentation, and key metrics",
  ],
  tasks: [
    "Set up a free email tool and a signup form",
    "Create a lead magnet to grow the list",
    "Build a welcome automation sequence",
    "Build a repeat-purchase/re-engagement flow",
    "Produce an email funnel + automation sequence",
  ],
  project:
    "Build an email marketing funnel for Adwoa's Kitchen in a real tool (Mailchimp or MailerLite): a lead magnet + signup form to grow the list, a multi-email welcome automation sequence, and a repeat-purchase or re-engagement automation, with the emails written (subject lines, body, CTAs). Document the funnel logic and the metrics you would track. Portfolio case study #8.",
  exercises: [
    "Design a lead magnet and the signup form/landing copy",
    "Write a 3-email welcome sequence",
    "Map a repeat-purchase automation (triggers and timing)",
    "Write 5 subject lines and pick the strongest",
  ],
  questions: [
    "How do you grow an email list ethically?",
    "What automated emails turn a buyer into a repeat customer?",
    "What makes an email get opened, read, and clicked?",
  ],
  outputs: [
    "A lead magnet + signup form",
    "A welcome automation sequence (written)",
    "A repeat-purchase/re-engagement automation",
    "An email funnel document with metrics",
  ],
  mastery_questions: [
    "Explain why email is the highest-ROI owned channel",
    "Design a lead magnet for a food business",
    "Explain broadcast vs automation",
    "Outline a 3-email welcome sequence",
    "Name the key email metrics (open, click, conversion, unsubscribe)",
  ],
  ai_assist:
    "AI is excellent for drafting email sequences and subject lines: 'Write a 3-email welcome sequence for a Ghanaian food brand: email 1 welcome + deliver the free recipe guide, email 2 the founder story, email 3 a first-order offer. Warm, human tone.' And 'Write 10 subject lines for [email], curiosity-driven, under 50 characters.' Then edit for Adwoa's authentic voice. AI gives the structure and drafts fast; you make it sound human and local.",
  pre_flight: [
    "A free Mailchimp or MailerLite account",
    "Your Week 1 persona and brand voice",
    "Your Week 3 lead-capture idea (lead magnet) and conversion path",
  ],
  common_mistakes: [
    "Buying email lists (illegal/unethical, kills deliverability, never converts)",
    "Only ever sending sales emails (people unsubscribe; give value too)",
    "No welcome sequence (the highest-engagement moment, wasted)",
    "Weak subject lines, so great emails never get opened",
  ],
  debug_help: [
    "List not growing? Strengthen the lead magnet and make the signup obvious everywhere (bio, site, after orders).",
    "Low open rates? The subject line is the lever, and a clean, permission-based list helps deliverability.",
    "Low clicks? One clear CTA per email; make the value obvious; do not bury the link.",
  ],
  stretch: [
    "Design an abandoned-enquiry flow (followed up the people who asked but did not order)",
    "Plan a simple monthly newsletter to keep the list warm",
  ],
  resources: [
    "Mailchimp or MailerLite (free tiers)",
    "Canva (for the lead magnet and email graphics)",
    "Your Week 1 persona and Week 2 content",
  ],
  days: [
    {
      number: 0,
      title: "Why email wins, and set up the tool",
      summary:
        "Today you'll learn why email is the highest-ROI, owned channel, and set up a free email service provider.",
      items: [
        {
          kind: "lesson",
          title: "The channel you actually own",
          body:
            "## Borrowed audiences vs owned audiences\n" +
            "Here is a hard truth about social, SEO, and ads: you do *not* own those audiences. Instagram could change its algorithm tomorrow and your reach vanishes. Google could re-rank you. The ad auction could get expensive. You are renting attention from a gatekeeper. **Email (and a WhatsApp list) is different: you OWN it.** Your subscribers are yours; you can reach them directly, anytime, no algorithm deciding who sees you. That ownership is priceless, it is the one audience nobody can take away.\n\n" +
            "## Why email is the ROI king\n" +
            "Email consistently delivers the *highest return on investment* of any marketing channel, studies repeatedly find it returns many times more per cedi than social or ads. Why? Two reasons: (1) it is nearly free to send, and (2) it reaches people who *already opted in and trust you*. Selling to a warm, existing contact converts far better and cheaper than acquiring a cold stranger. Email is where acquisition (the last seven weeks) turns into *retention and repeat revenue*, the loyalty stage of your Week 1 journey.\n\n" +
            "## Retention is where the profit is\n" +
            "Acquiring a new customer is expensive (ads, effort). Getting an *existing* customer to buy again is cheap, they already know and trust you. A business that only acquires and never retains is a leaky bucket, pouring money into the top while customers fall out the bottom. Email plugs the leak: it turns Adwoa's one-time jollof buyer into a monthly regular who also buys the spice mix and refers friends. The lifetime value of a retained customer dwarfs a single sale.\n\n" +
            "## This week's build\n" +
            "By Sunday: a lead magnet and signup form (to grow the list), a welcome automation (to start the relationship right), and a repeat-purchase flow (to drive loyalty), all in a real tool. You are building Adwoa a customer-retention machine that runs on autopilot. Today: set up the tool.",
        },
        {
          kind: "lesson",
          title: "Set up Mailchimp or MailerLite",
          body:
            "## Choose a free email tool\n" +
            "An **Email Service Provider (ESP)** is the platform that stores your list, sends emails, and runs automations (you cannot do this properly from a normal Gmail account, you need deliverability, unsubscribe handling, and automation). Two beginner-friendly options with free tiers:\n\n" +
            "- **MailerLite:** clean, simple, generous free tier, great automations even on free. A great choice for beginners and small businesses.\n" +
            "- **Mailchimp:** the best-known, free tier available, widely used (so worth knowing for your CV), though its free tier is more limited than it once was.\n\n" +
            "Pick one (MailerLite is often the smoother free experience) and create a free account. The skills transfer between all ESPs.\n\n" +
            "## Set up the basics\n" +
            "1. **Create your audience/list.** This is where subscribers live. Set it up with Adwoa's branding (from name, reply-to email).\n" +
            "2. **Create a signup form / landing page.** The ESP gives you a form (embeddable on the website, or a hosted landing page link you can put in the Instagram bio). This is how people join, connect it to the lead magnet (Day 2).\n" +
            "3. **Explore campaigns vs automations.** Find where you send a one-off *campaign* (broadcast) and where you build an *automation* (triggered sequence). You will use both.\n" +
            "4. **Compliance basics.** The tool automatically adds an unsubscribe link (legally required) and handles permission, never disable these. Only email people who opted in.\n\n" +
            "## Permission is the foundation\n" +
            "One rule above all: **only email people who gave you permission** (signed up, or are customers who agreed). Never buy a list or add people without consent, it is unethical, often illegal (data laws), destroys your deliverability (spam complaints), and never converts. A small list of people who *want* to hear from you beats a huge list of strangers every time. Today you set up the tool and form, ready to grow the list ethically.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Email is an owned channel, you can reach your subscribers directly without an algorithm deciding reach.",
              answer: true,
              whenRight: "Yes. Unlike social/SEO/ads (rented from gatekeepers), your email list is yours. That ownership is what makes it so valuable.",
              whenWrong: "It is owned. Social and search are borrowed audiences; your email list you control directly, no algorithm in between.",
            },
            {
              prompt: "Buying a big email list is a fast, smart way to grow.",
              answer: false,
              whenRight: "Right, never. Bought lists are unethical/often illegal, trigger spam complaints that wreck deliverability, and never convert. Grow with permission only.",
              whenWrong: "No, bought lists are a disaster, illegal/unethical, harm deliverability, and do not convert. Only email people who opted in.",
            },
            {
              prompt: "Getting an existing customer to buy again is usually cheaper than acquiring a new one.",
              answer: true,
              whenRight: "Yes. Retention is where profit lives, existing customers already trust you. Email is the engine of cheap repeat revenue.",
              whenWrong: "It is. Repeat customers are far cheaper to sell to than new strangers. That is why email's retention power is so profitable.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, set up the email tool",
          body:
            "Get the email foundation ready:\n\n" +
            "- [ ] Free MailerLite or Mailchimp account created\n" +
            "- [ ] An audience/list set up with Adwoa's from-name and reply-to\n" +
            "- [ ] A signup form or hosted landing page created (to put in the bio/site)\n" +
            "- [ ] Located where to build campaigns (broadcasts) and automations (sequences)\n\n" +
            "Then write one sentence: what free, valuable thing could Adwoa offer to make someone want to subscribe? That is your lead magnet, tomorrow.",
        },
      ],
    },
    {
      number: 1,
      title: "Orient, the email funnel",
      summary:
        "Today you'll see the full email funnel you are building, list growth, welcome, and repeat-purchase, and how it serves the loyalty stage.",
      items: [
        {
          kind: "lesson",
          title: "The funnel: grow, welcome, retain",
          body:
            "## What an email funnel is\n" +
            "An email *funnel* is the system that turns a stranger into a subscriber, a subscriber into a customer, and a customer into a loyal repeat buyer, mostly on autopilot. It has three core parts, and you will build all three:\n\n" +
            "1. **List growth (the top):** a *lead magnet* + signup form that converts followers and visitors into email subscribers. No list, no email marketing, so growing it ethically is step one.\n" +
            "2. **The welcome sequence (the start):** an automated series of emails that fires the moment someone subscribes, delivering the lead magnet, introducing Adwoa, building trust, and gently leading to a first purchase. The welcome moment is when engagement is *highest*, people just chose to hear from you, so it is the most valuable sequence you will build.\n" +
            "3. **Retention/repeat flows (the engine):** automated emails that turn buyers into repeat customers, a thank-you and re-order nudge after a purchase, a re-engagement email for people who have gone quiet, regular value (recipes, offers) to stay top-of-mind.\n\n" +
            "## Broadcasts and automations together\n" +
            "You will use two kinds of email: **automations** (the always-on sequences above, triggered by behaviour, built once, run forever) and **broadcasts/campaigns** (one-off sends to the whole list, 'this month's special', 'new flavour launched'). Automations do the heavy lifting on autopilot; broadcasts keep the list warm and drive timely offers. A good email strategy uses both.\n\n" +
            "## This is the loyalty stage made real\n" +
            "Remember your Week 1 customer journey: awareness → consideration → purchase → *loyalty*. Email is the loyalty engine. Everything before this week was mostly about the first three stages (getting and converting customers); email is how you *keep* them and maximise their lifetime value. It completes the funnel. Today you frame the email funnel you will build; the rest of the week you build each part.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "The welcome sequence is valuable because engagement is highest right after someone subscribes.",
              answer: true,
              whenRight: "Yes. People just chose to hear from you, peak interest. The welcome series builds trust and leads to a first purchase. Build it well.",
              whenWrong: "It is. The moment after subscribing is peak engagement. A strong welcome sequence capitalises on it; no welcome wastes it.",
            },
            {
              prompt: "A good email strategy uses both always-on automations and one-off broadcasts.",
              answer: true,
              whenRight: "Yes. Automations (welcome, repeat) run on autopilot; broadcasts (specials, launches) keep the list warm with timely sends. Use both.",
              whenWrong: "It does. Automations do the heavy lifting; broadcasts add timely offers. Together they cover the whole job.",
            },
            {
              prompt: "Email mainly serves the awareness stage of the customer journey.",
              answer: false,
              whenRight: "Right, email is the LOYALTY engine, keeping and repeat-selling to people you already acquired. It completes the funnel after acquisition.",
              whenWrong: "It serves loyalty/retention, turning existing customers into repeat buyers. Acquisition was the earlier channels' job.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, frame the funnel",
          body:
            "Start your `Email Funnel` doc:\n\n" +
            "- [ ] Sketch the three funnel parts (list growth, welcome, retention) for Adwoa\n" +
            "- [ ] Note which will be automations and where broadcasts fit\n" +
            "- [ ] Connect it to the Week 1 loyalty stage in one line\n" +
            "- [ ] Define the goal (grow the list + drive repeat orders)\n\n" +
            "Tomorrow: the lead magnet, the engine of list growth.",
        },
      ],
    },
    {
      number: 2,
      title: "The lead magnet, growing the list",
      summary:
        "Today you'll design a lead magnet that gives people a real reason to subscribe, the engine of list growth.",
      items: [
        {
          kind: "lesson",
          title: "Give value to earn the email",
          body:
            "## Why nobody subscribes to 'newsletter'\n" +
            "'Sign up for our newsletter' converts almost no one, it offers the subscriber nothing. People guard their inbox; they need a *reason* to let you in. A **lead magnet** is that reason: something genuinely valuable, offered free, in exchange for an email address. It flips the ask from 'give me your email' to 'here is something great, want it?'. A good lead magnet can multiply your signup rate many times over.\n\n" +
            "## What makes a great lead magnet\n" +
            "1. **Genuinely valuable** to your persona, something Akosua actually wants.\n" +
            "2. **Quick to consume and deliver:** a guide, checklist, or discount, not a 100-page book. Instant gratification.\n" +
            "3. **Relevant to what you sell:** it should attract *future customers*, not random freebie-seekers. The lead magnet should naturally lead toward the product.\n\n" +
            "## Lead magnet ideas for Adwoa\n" +
            "- **A free recipe guide:** 'The Perfect Jollof: 5 Secrets + My Spice Blend Guide' (PDF, made in Canva). Attracts people who love jollof, exactly her customers, and naturally showcases her spice mix.\n" +
            "- **A discount:** '10% off your first order, join our list.' Direct, drives a first purchase. Great for the buy-ready.\n" +
            "- **A checklist:** 'The Stress-Free Party Catering Checklist' (for the catering side).\n" +
            "- **Exclusive access:** 'Be first to know about new flavours and specials.'\n\n" +
            "The recipe guide is ideal: it gives real value, attracts the right people, builds Adwoa's authority as a great cook, and leads naturally to 'want it even easier? get the spice mix'. You can make it in Canva in an hour.\n\n" +
            "## Promote the lead magnet everywhere\n" +
            "A lead magnet only works if people see it. Put it: in the Instagram/social bio link, on the website (a popup or banner), in content CTAs ('comment RECIPE for my free jollof guide'), and offer it after orders. Every touchpoint becomes a chance to grow the owned list. Today you design the lead magnet and its signup offer.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "'Sign up for our newsletter' is an effective way to grow an email list.",
              answer: false,
              whenRight: "Right, it offers nothing, so few subscribe. A lead magnet (free valuable thing) gives a real reason and multiplies signups.",
              whenWrong: "It barely works. People need a reason, a lead magnet (free guide/discount). 'Newsletter' alone is not a reason.",
            },
            {
              prompt: "A lead magnet should be relevant to what you sell, so it attracts future customers, not random freebie-seekers.",
              answer: true,
              whenRight: "Yes. A jollof recipe guide attracts jollof lovers (her customers) and leads to the spice mix. Relevance keeps the list valuable.",
              whenWrong: "It should. Relevance ensures the people who join are likely buyers, and the magnet points naturally to the product.",
            },
            {
              prompt: "A great lead magnet is best when it is long and comprehensive, like a 100-page ebook.",
              answer: false,
              whenRight: "Right, quick to consume wins. A short guide/checklist/discount gives instant value. Huge documents feel like work and reduce signups.",
              whenWrong: "Shorter is better. Quick, instantly-useful magnets convert best; a 100-page tome feels like a chore.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, design the lead magnet",
          body:
            "Create Adwoa's lead magnet:\n\n" +
            "- [ ] Choose and outline a lead magnet (recommend: a free jollof recipe/secrets guide)\n" +
            "- [ ] Design it (a simple Canva PDF) or fully outline its content\n" +
            "- [ ] Write the signup offer copy (the promise that makes people subscribe)\n" +
            "- [ ] List where you will promote it (bio, site, content CTAs, after orders)\n\n" +
            "Tomorrow: the welcome sequence that greets every new subscriber.",
        },
      ],
    },
    {
      number: 3,
      title: "The welcome sequence",
      summary:
        "Today you'll build the automated welcome sequence, the highest-value emails you will ever send, that turns a new subscriber into a customer.",
      items: [
        {
          kind: "lesson",
          title: "Make a great first impression, automatically",
          body:
            "## Why the welcome sequence matters most\n" +
            "When someone subscribes, they are at *peak interest*, they just raised their hand and said 'I want to hear from you'. Welcome emails get the highest open and click rates of any email, by far. Yet most businesses send nothing, or a single dull 'thanks for subscribing'. A proper **welcome sequence** (an automation of 2-4 emails over the first days) capitalises on that peak moment to deliver value, build trust, tell your story, and lead to a first purchase. It is the single highest-ROI automation you will build.\n\n" +
            "## A welcome sequence for Adwoa (3 emails)\n" +
            "**Email 1, immediately (Deliver + Welcome):** delivers the lead magnet they signed up for (the recipe guide), warmly welcomes them, and sets expectations ('I'll share recipes, tips, and the occasional treat'). The most important email, it confirms the value and starts the relationship. Send instantly on signup.\n\n" +
            "**Email 2, day 2 (Story + Trust):** Adwoa's story, why she started, her passion for real home cooking, the family recipe behind the spice mix. People buy from people; this builds the emotional connection that turns a subscriber into a fan. No hard sell.\n\n" +
            "**Email 3, day 4 (Soft Offer):** now that there is value and trust, a gentle first-purchase nudge, introduce the spice mix or a popular meal, with a first-order discount or a clear, easy way to order. Earned by the value of emails 1-2.\n\n" +
            "Notice the structure: *value first, trust second, ask third* (the 80/20 principle from Week 2, applied to email). You earn the sale by giving first.\n\n" +
            "## Build it as an automation\n" +
            "In your ESP, this is an **automation** triggered by 'subscribes to the list': you build the three emails once, set the timing (immediate, +2 days, +4 days), turn it on, and it runs *forever* for every new subscriber, no manual work. This is the magic of automation: marketing that works while Adwoa sleeps, greeting and converting every new subscriber perfectly, every time.\n\n" +
            "Today you write and build the welcome sequence.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Welcome emails get the highest open and click rates because the subscriber is at peak interest.",
              answer: true,
              whenRight: "Yes. They just opted in, peak engagement. The welcome sequence is the highest-ROI automation; do not waste it on a dull one-liner.",
              whenWrong: "They do. Peak interest right after signup makes welcome emails the most-opened. Capitalise with a real sequence.",
            },
            {
              prompt: "A good welcome sequence goes straight to a hard sell in email one.",
              answer: false,
              whenRight: "Right, value first, trust second, ask third. Deliver the magnet, tell the story, then softly offer. Hard-selling immediately breaks trust.",
              whenWrong: "No, lead with value and story, then a soft offer. An immediate hard sell wastes the goodwill of a new subscriber.",
            },
            {
              prompt: "Once built, a welcome automation runs by itself for every new subscriber forever.",
              answer: true,
              whenRight: "Yes. Build it once, set the timing, turn it on, it greets and converts every new subscriber automatically. Marketing on autopilot.",
              whenWrong: "It does. That is the power of automation, build once, runs forever for each new subscriber with no manual work.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build the welcome sequence",
          body:
            "Create the welcome automation:\n\n" +
            "- [ ] Write Email 1 (deliver the lead magnet + welcome + set expectations)\n" +
            "- [ ] Write Email 2 (Adwoa's story, build trust, no hard sell)\n" +
            "- [ ] Write Email 3 (soft first-purchase offer with an easy next step)\n" +
            "- [ ] Build it as an automation in your ESP (trigger: subscribes; timing: 0, +2d, +4d)\n\n" +
            "Tomorrow: the repeat-purchase and re-engagement flows that drive loyalty.",
        },
      ],
    },
    {
      number: 4,
      title: "Repeat-purchase and re-engagement flows",
      summary:
        "Today you'll build the automations that turn one-time buyers into loyal repeat customers and win back those who go quiet.",
      items: [
        {
          kind: "lesson",
          title: "Automate loyalty",
          body:
            "## The retention automations\n" +
            "The welcome sequence turns a subscriber into a first-time buyer. Now you build the flows that turn a *buyer* into a *repeat* buyer, where the real profit is. These run automatically, triggered by behaviour:\n\n" +
            "**1. Post-purchase / re-order flow.** After someone orders, an automation: a warm thank-you (builds delight and trust), then, after a sensible delay (say, when they would be running low on spice mix or due for another treat), a gentle re-order nudge ('time to restock? here's an easy re-order link', maybe with a loyalty perk). This single flow can dramatically lift repeat orders, you are reminding a happy customer to come back, at the right moment, automatically.\n\n" +
            "**2. Re-engagement / win-back flow.** Subscribers go quiet over time, they stop opening. A re-engagement automation targets people who have not engaged in a while: a 'we miss you' email, a special offer to come back, or a 'still want to hear from us?' check. It wins back some, and cleans the list of the truly disengaged (which actually *helps* deliverability, see Day 5).\n\n" +
            "**3. Review/referral ask.** After a positive experience, an automated nudge to leave a review (great for local SEO, Week 4) or refer a friend. Turning happy customers into advocates is free growth.\n\n" +
            "## The lifetime-value mindset\n" +
            "Each of these flows increases **customer lifetime value (CLV)**, the total a customer spends over their whole relationship with the business. A customer who buys once is worth one order; the same customer, nurtured by email into ordering monthly for two years, is worth dozens. Retention automations are how you multiply CLV without spending more on acquisition. This is the most profitable marketing there is, and it runs on autopilot once built.\n\n" +
            "## Triggers and timing\n" +
            "The skill is choosing the right *trigger* (purchased, went quiet, etc.) and *timing* (when would a re-order nudge be welcome, not annoying?). Thoughtful timing makes these feel helpful, not spammy. Today you design (and, where your tool allows, build) the repeat-purchase and re-engagement flows.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A post-purchase re-order automation reminds a happy customer to come back at the right moment, automatically.",
              answer: true,
              whenRight: "Yes. A thank-you then a well-timed re-order nudge lifts repeat orders with zero manual effort. Retention on autopilot.",
              whenWrong: "It does. Triggered by a purchase, it nudges a re-order when timely, one of the highest-ROI automations there is.",
            },
            {
              prompt: "Customer lifetime value (CLV) is the total a customer spends over their whole relationship, not just one order.",
              answer: true,
              whenRight: "Yes. Retention multiplies CLV, a once-buyer is worth one order; a nurtured regular is worth dozens, without new acquisition cost.",
              whenWrong: "It is. CLV is the whole-relationship value. Email retention multiplies it cheaply, the most profitable marketing there is.",
            },
            {
              prompt: "Re-engagement emails (and removing the truly disengaged) can actually help your deliverability.",
              answer: true,
              whenRight: "Yes. A list of engaged people signals quality to inbox providers; pruning dead contacts improves deliverability (more on Day 5).",
              whenWrong: "It can. Keeping the list engaged (winning back or removing dead contacts) improves inbox placement. Quality over size.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build the retention flows",
          body:
            "Design the loyalty automations:\n\n" +
            "- [ ] Build/outline a post-purchase flow (thank-you + timed re-order nudge)\n" +
            "- [ ] Design a re-engagement/win-back flow for quiet subscribers\n" +
            "- [ ] Add a review/referral ask after a positive experience\n" +
            "- [ ] For each, define the trigger and the timing\n\n" +
            "Tomorrow: writing emails that actually get opened and clicked, plus deliverability.",
        },
      ],
    },
    {
      number: 5,
      title: "Emails that get opened, clicked, and delivered",
      summary:
        "Today you'll learn the craft of writing emails people open and act on, and the deliverability basics that get you into the inbox.",
      items: [
        {
          kind: "lesson",
          title: "Subject line, body, CTA, inbox",
          body:
            "## The subject line: the gatekeeper\n" +
            "An email's success starts with whether it gets *opened*, and that is decided by the **subject line** (and preview text). The best email in the world is worthless if the subject is boring. Subject lines work like hooks (Week 2): curiosity ('The jollof mistake you're probably making'), benefit ('Your free recipe guide is inside'), or personal/relevant. Keep them short (they get cut off on phones), avoid spammy words and ALL CAPS and excessive emojis (they hurt deliverability and trust). Write several, pick the strongest. Test subject lines over time, it is the highest-leverage email lever.\n\n" +
            "## The body: one message, easy to scan\n" +
            "Once opened: respect their time. Emails should be *scannable* (short paragraphs, white space), focused on *one main message/goal*, written in a warm, human voice (Adwoa's, not corporate). Lead with the value or point quickly. People skim email even more than social, do not bury the message.\n\n" +
            "## One clear CTA\n" +
            "Every email needs *one* clear call to action, the single thing you want them to do (read the recipe, order now, leave a review). Multiple competing CTAs reduce action (Week 2's lesson again). Make the button/link obvious. The whole email should funnel toward that one click.\n\n" +
            "## Deliverability: getting into the inbox\n" +
            "It does not matter how good the email is if it lands in spam. **Deliverability** is getting into the inbox, and it depends on:\n\n" +
            "- **Permission:** only emailing people who opted in (the foundation, low spam complaints).\n" +
            "- **List hygiene:** removing dead/disengaged contacts (Day 4), inbox providers reward lists that engage.\n" +
            "- **Engagement:** opens and clicks signal 'wanted mail'; spam complaints and ignores signal the opposite. Sending valuable, wanted email *is* the best deliverability strategy.\n" +
            "- **Technical basics:** your ESP handles most (authentication like SPF/DKIM), and avoiding spammy content/subject lines helps.\n\n" +
            "Mostly, deliverability comes down to one thing: *send wanted email to people who opted in.* Do that and the inbox opens. Today you write strong emails and apply the deliverability basics across your sequences.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "The subject line is the most important factor in whether an email gets opened.",
              answer: true,
              whenRight: "Yes. No open, no anything. Subject lines are hooks, write several, pick the strongest, keep them short and non-spammy.",
              whenWrong: "It is the gatekeeper. A great email with a dull subject never gets opened. Treat subject lines like hooks.",
            },
            {
              prompt: "An email should have one clear call to action, not several competing ones.",
              answer: true,
              whenRight: "Yes. One CTA focuses action; multiple competing asks reduce clicks. The whole email funnels to one click.",
              whenWrong: "One CTA. Competing asks split attention and lower action, just like in social content.",
            },
            {
              prompt: "The best deliverability strategy is mostly sending wanted email to people who opted in.",
              answer: true,
              whenRight: "Yes. Permission + engagement + list hygiene = inbox placement. Wanted email that gets opened is the core of deliverability.",
              whenWrong: "It is. Inbox providers reward permission-based, engaged lists. Send wanted email and you reach the inbox.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, sharpen the emails",
          body:
            "Polish your sequences and apply the craft:\n\n" +
            "- [ ] Write 5 subject lines for one of your emails; pick the strongest\n" +
            "- [ ] Make every email scannable, one message, one clear CTA\n" +
            "- [ ] Edit for Adwoa's warm, human voice (not corporate or raw AI)\n" +
            "- [ ] Confirm deliverability basics (permission-based list, unsubscribe link present)\n\n" +
            "Tomorrow: assemble the full funnel and the metrics.",
        },
      ],
    },
    {
      number: 6,
      title: "Assemble the funnel and the metrics",
      summary:
        "Today you'll connect the lead magnet, welcome, and retention flows into one coherent funnel and define the metrics that matter.",
      items: [
        {
          kind: "lesson",
          title: "One coherent funnel, measured",
          body:
            "## Connect the pieces\n" +
            "You have a lead magnet, a welcome sequence, and retention flows. Now make them one *coherent funnel*, a clear path: stranger → (lead magnet) → subscriber → (welcome sequence) → first-time buyer → (post-purchase flow) → repeat customer → (re-engagement/referral) → loyal advocate. Map this flow visually so it is obvious how someone moves through it and where each automation fires. A funnel diagram is both a planning tool and a great portfolio visual.\n\n" +
            "## The email metrics that matter\n" +
            "Track a focused set:\n\n" +
            "- **List growth rate:** is the list growing? (driven by the lead magnet + promotion)\n" +
            "- **Open rate:** are subjects working / is the list engaged? (deliverability + subject lines)\n" +
            "- **Click rate (CTR):** are emails compelling people to act? (body + CTA)\n" +
            "- **Conversion:** the business outcome, orders/revenue driven by email. The headline.\n" +
            "- **Unsubscribe/spam rate:** is something turning people off? (a warning signal if it spikes)\n\n" +
            "Open and click rates are means; *conversions and revenue* are the goal. A small, engaged list that buys beats a big, dead one. Note your ESP shows all of these automatically.\n\n" +
            "## Broadcasts keep it alive\n" +
            "Beyond the automations, plan a simple *broadcast* rhythm to keep the list warm, e.g. a monthly value email (a recipe + a soft offer) or timely sends (new flavour, festive special). The automations convert and retain on autopilot; broadcasts maintain the relationship and drive periodic spikes. Together they form a complete, living email programme.\n\n" +
            "## Connect to the journey and CLV\n" +
            "Tie it back: this funnel *is* the loyalty stage of your Week 1 journey, and it is the engine of customer lifetime value. In your documentation, make this explicit, show that you understand email is not random sending but a *system* that maximises the value of every customer you worked so hard (in Weeks 1-7) to acquire. Today you assemble the funnel and metrics; tomorrow you ship it.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Conversions and revenue, not open rates, are the headline metric for email.",
              answer: true,
              whenRight: "Yes. Opens and clicks are means; orders/revenue are the goal. A small engaged list that buys beats a big dead one.",
              whenWrong: "Conversions are the headline. Opens/clicks matter as signals, but email's job is to drive orders and repeat revenue.",
            },
            {
              prompt: "A funnel diagram (stranger to advocate, showing where each automation fires) is a useful planning and portfolio tool.",
              answer: true,
              whenRight: "Yes. Mapping the path makes the system clear and makes a strong case-study visual. It shows you think in systems.",
              whenWrong: "It is. The diagram clarifies the flow and demonstrates systems thinking, great for planning and the portfolio.",
            },
            {
              prompt: "Automations and broadcasts do the same job, so you only need one.",
              answer: false,
              whenRight: "Right, they complement: automations convert/retain on autopilot; broadcasts keep the list warm with timely sends. Use both.",
              whenWrong: "They differ. Automations run by themselves; broadcasts add timely, manual sends. A complete programme uses both.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, assemble funnel + metrics",
          body:
            "Bring it together:\n\n" +
            "- [ ] Draw the full funnel flow (stranger → subscriber → buyer → repeat → advocate) with automations marked\n" +
            "- [ ] Define the email metrics you will track (growth, open, click, conversion, unsubscribe)\n" +
            "- [ ] Plan a simple broadcast rhythm (e.g. monthly value email)\n" +
            "- [ ] Connect the funnel to the Week 1 loyalty stage and CLV in writing\n\n" +
            "Tomorrow you ship case study #8.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship it, email funnel + automation (case study #8)",
      summary:
        "Today you'll package the email funnel and automation sequences into case study #8.",
      items: [
        {
          kind: "lesson",
          title: "Ship it, the retention engine",
          body:
            "## Package case study #8\n" +
            "Present **Adwoa's Kitchen, Email Funnel + Automation**, with:\n\n" +
            "- A **challenge/approach** opener (Adwoa was acquiring customers but not keeping them; you built an owned-channel email funnel to drive loyalty and repeat revenue)\n" +
            "- The **funnel diagram** (stranger → advocate, automations marked)\n" +
            "- The **lead magnet** and signup offer\n" +
            "- The **welcome sequence** and **retention flows** (the written emails + the automation logic)\n" +
            "- The **metrics** you would track, and how it serves CLV and the Week 1 loyalty stage\n\n" +
            "Screenshots of the automations built in your ESP make it tangible and credible.\n\n" +
            "## Why this is a standout portfolio piece\n" +
            "Email marketing and automation are highly valued, in-demand skills (email/CRM/lifecycle marketers are well paid precisely because email drives so much revenue). Many marketers can post on social but cannot build an automated email funnel. A case study showing you can grow a list ethically, build behaviour-triggered automations, write converting emails, and think in lifetime value proves you understand the *most profitable* part of marketing. It is a serious differentiator.\n\n" +
            "## The system that works while she sleeps\n" +
            "Emphasise what you have actually built: a *system*. Once live, Adwoa's funnel grows her list, welcomes and converts every new subscriber, and nudges repeat orders, automatically, forever, with no daily effort. You have given her a retention engine that compounds the value of every customer. That systems-and-lifetime-value thinking is exactly what senior marketers bring. Save case study #8.\n\n" +
            "Next week: analytics and data. You will learn to measure *everything* you have built across all channels, and turn the numbers into an executive dashboard and insights, the skill that proves marketing actually works.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Email/automation skills are in demand and well paid because email drives so much revenue.",
              answer: true,
              whenRight: "Yes. Lifecycle/CRM marketers are valued precisely because the channel is so profitable. An email-funnel case study stands out.",
              whenWrong: "They are. Email's revenue power makes the skill valuable. Few marketers can build automated funnels, so it differentiates you.",
            },
            {
              prompt: "Once built, the email funnel keeps growing the list and driving repeat orders automatically.",
              answer: true,
              whenRight: "Yes. It is a system, build once, runs forever, compounding every customer's lifetime value with no daily effort.",
              whenWrong: "It does. The automations run on autopilot, welcoming, converting, and retaining, the retention engine that works while she sleeps.",
            },
            {
              prompt: "Email completes the funnel by serving acquisition, the same job as ads and SEO.",
              answer: false,
              whenRight: "Right, email serves RETENTION/loyalty, keeping and repeat-selling to customers the other channels acquired. It completes the funnel at the bottom.",
              whenWrong: "It serves loyalty/retention, not acquisition. It maximises the value of customers already won. That completes the funnel.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Ship it",
          body:
            "Package and ship case study #8:\n\n" +
            "- [ ] One document titled `Adwoa's Kitchen, Email Funnel + Automation`\n" +
            "- [ ] Challenge/approach framing\n" +
            "- [ ] Funnel diagram, lead magnet, welcome + retention sequences (written), metrics, all present\n" +
            "- [ ] Screenshots of the automations built in your ESP\n" +
            "- [ ] Saved in your `Week 08 Email` portfolio folder\n\n" +
            "Eight case studies done. Next week: analytics, proving it all works with data.",
        },
      ],
    },
  ],
};
