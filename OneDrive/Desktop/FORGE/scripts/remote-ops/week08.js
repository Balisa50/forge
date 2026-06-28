/* Week 8 - Social media management (Phase: Content Operations) */
module.exports = {
  number: 8,
  title: "Social media management",
  phase: "Content Operations",
  commitment_hours: "6, 10",
  context:
    "Many founders need someone to run their social presence, and it is a service you can sell entirely on its own. A small business with a consistent, on-brand feed and someone replying to comments looks alive and trustworthy; one that posts twice a year looks abandoned. This week you learn content operations: planning a content calendar, designing branded graphics in Canva, writing captions that get read, scheduling, community management, and reporting on what worked.\n\n" +
    "You will manage Kola's social media for a month on paper: a 30-day content calendar, eight branded posts, captions, a scheduling workflow, a brand-voice guide, and an analytics report template. By Friday you can take a business with a dead feed and give it a month of professional content ready to go.\n\n" +
    "The job is not 'posting'. It is running a small content engine: a plan, a consistent voice, and a habit of looking at what worked and doing more of it.",
  concept_check: [
    {
      q: "Kola posts randomly whenever someone remembers, sometimes three times a week, sometimes nothing for a month. What is the single biggest fix?",
      choices: [
        "Post more often, every single day",
        "A content calendar: plan posts ahead so the feed is consistent and on-purpose",
        "Buy followers",
        "Only post when there is a sale",
      ],
      correct: 1,
      explain: "Consistency, driven by a calendar planned in advance, beats sporadic bursts. A plan turns random posting into a reliable presence the audience can count on.",
    },
    {
      q: "What decides whether someone stops scrolling on a post?",
      choices: [
        "The number of hashtags",
        "The hook, the first line or first second, which must grab attention immediately",
        "How long the caption is",
        "The time of day only",
      ],
      correct: 1,
      explain: "The hook is everything. People decide in a fraction of a second whether to stop. A weak first line means the rest of the post is never seen.",
    },
    {
      q: "At the end of the month, which metric is most useful for a small product business?",
      choices: [
        "Total likes across all posts",
        "What actually moved the business: reach, saves/shares, profile visits, link clicks, and sales from social",
        "Number of posts published",
        "Follower count alone",
      ],
      correct: 1,
      explain: "Likes are a vanity metric. Useful reporting connects social activity to business outcomes (reach, engagement that signals intent, clicks, sales) and names what to do more of.",
    },
  ],
  days: [
    {
      number: 0,
      title: "Content operations, and set up your design tool",
      summary: "Understand what running social really means, then set up Canva and a brand kit.",
      items: [
        {
          kind: "lesson",
          title: "Running a content engine",
          body:
            "## More than posting\n" +
            "Social media management is not 'making posts'. It is running a small engine with several parts: a strategy (what are we trying to achieve and for whom), a plan (a calendar), production (graphics and captions), distribution (scheduling), community (replying and engaging), and measurement (what worked). A business pays you to run that whole loop so their presence is consistent and purposeful instead of random.\n\n" +
            "## Start with the goal\n" +
            "Every account exists for a reason: sales, awareness, community, or a mix. Kola's social goal might be 'drive store sales and build a community of people who love handmade West African goods'. The goal shapes everything, what you post, how you measure. Posting with no goal produces busy work that does not move the business.\n\n" +
            "## Consistency beats intensity\n" +
            "A feed that posts three good times a week, every week, beats one that posts daily for a fortnight then goes silent. Consistency is what an audience (and the algorithm) rewards. Your calendar exists to make consistency easy: plan and create in batches, schedule ahead, and the feed runs even on busy weeks.\n\n" +
            "## This week's destination\n" +
            "You will produce a month of professional content for Kola: a 30-day calendar, eight branded graphics, captions, a scheduling workflow, a brand-voice guide, and a reporting template. That package is portfolio artefact number eight, and 'I can run your social media' is a service founders pay for monthly, often as a recurring retainer.",
        },
        {
          kind: "video",
          title: "Canva for Social Media: Tutorial for Beginners",
          url: "https://www.youtube.com/watch?v=JEOMk9wePtg",
          duration_min: 7,
          creator: "Maggie Stara",
          difficulty: "beginner",
          why: "Maggie Stara is a well-known Canva educator. This concise tutorial shows the exact moves (templates, brand colours, resizing) you will use to make Kola's posts. Watch it, then design your first graphics in the exercise.",
        },
        {
          kind: "lesson",
          title: "Set up Canva and a brand kit, step by step",
          body:
            "## Canva is the operator's design tool\n" +
            "You do not need to be a designer. Canva (canva.com, free) gives you templates, drag-and-drop editing, and a library of images and fonts. With it, a non-designer produces clean, on-brand graphics fast.\n\n" +
            "**1. Sign up** free at canva.com.\n\n" +
            "**2. Learn the basics:** search a template (e.g. 'Instagram post'), pick one, and edit, click any element to change text, colour, or image; drag to move; use the resize option to turn one design into other sizes (a post into a story). Spend ten minutes just clicking around; it is intuitive.\n\n" +
            "**3. Define the brand basics.** A brand looks consistent when it reuses the same few elements. For Kola, decide: two or three brand colours (note their hex codes), one or two fonts, and the logo. On Canva's free plan you keep these in a simple reference doc (the paid Brand Kit feature stores them, but a doc works fine). Every graphic uses these, so the feed looks like one brand, not a random collage.\n\n" +
            "**4. Make one test graphic** using a template, swapped to Kola's colours, with a real product photo and a short headline. That is the workflow you will repeat all week.\n\n" +
            "## Why consistency in design matters\n" +
            "When every post shares the same colours, fonts, and feel, the feed becomes instantly recognisable, a customer scrolling sees a Kola post and knows it is Kola before reading a word. That visual consistency is a huge part of looking like a real, established brand rather than a hobby.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Posting daily for two weeks then going silent for a month is better than posting three times a week consistently.",
              answer: false,
              whenRight: "Correct. Consistency beats intensity. A steady three-times-a-week rhythm builds audience and algorithm trust; bursts then silence loses both.",
              whenWrong: "The other way. Steady consistency wins. Bursts followed by silence make an account look abandoned and lose momentum with the audience and the algorithm.",
            },
            {
              prompt: "Reusing the same few brand colours and fonts across posts makes a feed look more professional.",
              answer: true,
              whenRight: "Yes. Visual consistency makes the brand instantly recognisable, a Kola post looks like Kola before you read it, which signals an established business.",
              whenWrong: "It does. Consistent colours and fonts make the feed cohesive and recognisable. A random mix of styles looks like a hobby, not a brand.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, set up the design system",
          body:
            "- [ ] Sign up for Canva (free)\n" +
            "- [ ] Define Kola's brand basics in a doc: 2 to 3 colours (with hex codes), 1 to 2 fonts, and where the logo lives\n" +
            "- [ ] Make one test Instagram post from a template, swapped to Kola's colours, with a product photo and a short headline\n" +
            "- [ ] Resize that design into a second format (e.g. a story) to see the resize feature\n\n" +
            "Deliverable: your brand-basics doc and the test graphic (exported as an image).",
        },
      ],
    },
    {
      number: 1,
      title: "Content strategy and the calendar",
      summary: "Plan a month of posts on purpose, not on a whim.",
      items: [
        {
          kind: "lesson",
          title: "The content calendar",
          body:
            "## Plan, then create\n" +
            "Trying to think of a post in the moment, every day, is exhausting and produces weak content. The professional move is to plan a batch ahead (a week or a month) in a content calendar, then create and schedule in focused sessions. The calendar removes the daily 'what do I post?' panic.\n\n" +
            "## Content pillars\n" +
            "A feed of nothing but 'buy our product' is boring and people tune out. Strong accounts rotate a few content pillars, recurring themes that serve the audience. For Kola, pillars might be:\n" +
            "- **Product:** showcase items, new arrivals, details.\n" +
            "- **Behind the scenes:** the makers, the craft, the story (huge for a handmade brand).\n" +
            "- **Educational/value:** how to style a piece, the meaning behind a pattern, care tips.\n" +
            "- **Social proof:** customer photos, reviews, testimonials.\n" +
            "- **Community/culture:** celebrations, heritage, the people behind the brand.\n\n" +
            "Rotating pillars keeps the feed varied and gives the audience reasons to follow beyond just buying.\n\n" +
            "## Build the calendar\n" +
            "A content calendar is a simple table (Sheet or Notion): one row per post, with the date, the pillar, the format (image, carousel, reel, story), the topic, the caption, the graphic status, and where it links. Plan a realistic cadence (e.g. four posts a week) and assign each a pillar so the mix stays balanced. Now you can see the month at a glance and the feed has intention.\n\n" +
            "## Plan around the calendar that matters\n" +
            "Anchor content to real events: a holiday sale (December, Week 6), a restock, a cultural celebration, a product launch. Planning ahead means the launch posts are ready before the launch, not scrambled the night before.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A strong feed rotates a few content pillars rather than only posting 'buy our product'.",
              answer: true,
              whenRight: "Yes. Pillars (product, behind-the-scenes, value, social proof, community) keep the feed varied and give people reasons to follow beyond buying.",
              whenWrong: "Pillars win. An all-sales feed gets tuned out. Rotating themes serves the audience and keeps them engaged between purchases.",
            },
            {
              prompt: "Planning content in a calendar ahead of time produces better posts than improvising daily.",
              answer: true,
              whenRight: "Yes. Batch planning removes the daily panic and lets you create thoughtfully and consistently, which shows in the quality.",
              whenWrong: "It does. A calendar lets you plan and batch-create, which is calmer and better than scrambling for an idea every single day.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Build a 2-week content calendar",
          body:
            "1. Define Kola's social goal in one sentence and list 4 to 5 content pillars.\n" +
            "2. Build a content-calendar table (date, pillar, format, topic, caption, graphic status, link).\n" +
            "3. Fill two weeks (e.g. 8 posts) with a balanced mix of pillars and at least one tied to an event (a restock or sale).\n\n" +
            "Deliverable: the two-week content calendar.",
        },
      ],
    },
    {
      number: 2,
      title: "Designing graphics in Canva",
      summary: "Produce clean, on-brand visuals that stop the scroll.",
      items: [
        {
          kind: "lesson",
          title: "Design that works on a feed",
          body:
            "## You are not making art, you are stopping a scroll\n" +
            "A social graphic has one job: make someone pause. It competes in a fast-moving feed, so clarity and contrast beat clever and busy. A few principles take a non-designer a long way:\n\n" +
            "- **One message per graphic.** Do not cram. One clear idea, one focal point. If you have three things to say, that is three posts or a carousel.\n" +
            "- **Readable text.** Big enough to read on a phone, high contrast against the background, short. If a headline does not fit in a glance, cut it.\n" +
            "- **Strong focal image.** A great product photo does most of the work. Good light, clean background. Poor photos sink good design.\n" +
            "- **Breathing room.** White space makes a design feel premium. Cramped designs feel cheap.\n" +
            "- **On-brand always.** Your colours and fonts on every graphic (Day 0). Consistency over novelty.\n\n" +
            "## Work from templates\n" +
            "Do not start from a blank canvas. Pick a Canva template close to what you want and adapt it, swap colours to your brand, replace the image, rewrite the text. Templates carry good design choices (balance, hierarchy) you do not have to invent. This is how non-designers produce professional-looking work fast.\n\n" +
            "## Formats\n" +
            "Know the main shapes: a square/portrait feed post, a vertical story, a carousel (multiple swipeable images, great for teaching or showing a range), and a reel cover. Canva resizes between them. A carousel that teaches something (e.g. 'how to style a Kola basket, 5 ways') often gets saved and shared, which the algorithm loves.\n\n" +
            "## Batch it\n" +
            "Make a week or month of graphics in one focused session, reusing your template and brand elements. Batching is far faster than making one at a time and keeps the look consistent.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Cramming several messages and lots of text onto one graphic makes it more effective.",
              answer: false,
              whenRight: "Correct. One message per graphic. A busy, text-heavy design loses people; clarity and a single focal point stop the scroll.",
              whenWrong: "It backfires. Crammed graphics get skipped. One clear idea, readable text, and breathing room is what works in a fast feed.",
            },
            {
              prompt: "Starting from a Canva template is a smart way for a non-designer to produce professional graphics.",
              answer: true,
              whenRight: "Yes. Templates carry good design choices you adapt (brand colours, your photo, your text), so you get professional results fast without designing from scratch.",
              whenWrong: "It is smart. Templates bake in balance and hierarchy. Adapting one to your brand beats a blank canvas every time for a non-designer.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Design three on-brand graphics",
          body:
            "Using Canva and Kola's brand basics, design three graphics for your calendar:\n" +
            "1. A product feature post.\n" +
            "2. A behind-the-scenes or story-of-the-maker post.\n" +
            "3. A carousel that teaches something (e.g. '5 ways to style this piece') with at least 3 slides.\n\n" +
            "Apply the principles: one message each, readable text, on-brand colours. Deliverable: the three exported graphics.",
        },
      ],
    },
    {
      number: 3,
      title: "Captions and hooks",
      summary: "Write the words that make people stop, read, and act.",
      items: [
        {
          kind: "lesson",
          title: "The hook is everything",
          body:
            "## The first line decides the rest\n" +
            "People scroll fast. The first line of a caption (and the first second of a video) decides whether they stop. A weak opener means the best caption in the world goes unread. So the hook gets your sharpest effort.\n\n" +
            "Weak openers: 'We're excited to announce...', 'Check out our new...'. Strong hooks create curiosity, name a benefit, ask a real question, or start a story:\n" +
            "- 'This basket took three weeks and four generations of skill to make.'\n" +
            "- 'The mistake everyone makes when styling woven decor (and the easy fix).'\n" +
            "- 'We almost didn't restock this one. Here's why we did.'\n\n" +
            "## Caption structure\n" +
            "After the hook: deliver on it (the story, the value, the detail), then a clear **call to action (CTA)**, the one thing you want the reader to do. 'Shop the link in bio.' 'Comment your favourite.' 'Save this for later.' 'Tag someone who'd love this.' A caption with no CTA is a missed chance; every post should ask for one specific action.\n\n" +
            "## Voice and length\n" +
            "Write in the brand's voice (warm and a little playful for Kola), like a person, not a press release. Length depends on the goal: short and punchy for a quick product post, longer and story-driven for behind-the-scenes or value content (longer captions that genuinely engage can boost reach). Either way, make the first line earn the read.\n\n" +
            "## Hashtags and details, briefly\n" +
            "Hashtags help discovery; use a handful of relevant ones (a mix of broad and niche), not thirty. They are a minor lever, the content and hook matter far more. Put them at the end or in a first comment to keep the caption clean.\n\n" +
            "## Repurpose one idea many ways\n" +
            "A single idea ('the story of our weavers') becomes a feed post, a carousel, a story, and a reel, each with a tailored hook. Repurposing is how you fill a calendar without inventing endless new ideas.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "'We're excited to announce our new product!' is a strong opening hook.",
              answer: false,
              whenRight: "Correct. That is a weak, generic opener. Strong hooks spark curiosity, name a benefit, ask a real question, or start a story.",
              whenWrong: "It is weak. 'Excited to announce' is forgettable. Lead with curiosity, a benefit, or a story so people actually stop scrolling.",
            },
            {
              prompt: "Every post should include a clear call to action telling the reader one thing to do.",
              answer: true,
              whenRight: "Yes. A CTA (shop, comment, save, tag) turns passive scrolling into action. A post with no CTA wastes the attention it earned.",
              whenWrong: "It should. The CTA is how a post does work, shop, comment, save, share. Without it you got attention and asked for nothing.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Write five captions with hooks",
          body:
            "For five posts in your calendar, write full captions, each with:\n" +
            "1. A scroll-stopping first line (hook).\n" +
            "2. The body that delivers on the hook, in Kola's voice.\n" +
            "3. One clear call to action.\n\n" +
            "Then take ONE idea and write three different hooks for it (for a post, a carousel, and a reel). Deliverable: the five captions plus the three hooks for one idea.",
        },
      ],
    },
    {
      number: 4,
      title: "Scheduling and workflow",
      summary: "Set posts to publish on their own so the feed runs without you live.",
      items: [
        {
          kind: "lesson",
          title: "Schedule ahead, free your time",
          body:
            "## Why schedule\n" +
            "Posting manually at the 'right' time every day chains you to your phone and breaks the moment you are busy or offline. Scheduling tools let you load a week or month of posts in one session and have them publish automatically. This is what makes managing social for several clients possible, and what keeps a feed consistent through holidays and busy weeks.\n\n" +
            "## The tools\n" +
            "- **Meta Business Suite** (free) schedules posts and stories to Facebook and Instagram, and is the native, reliable option for those platforms. It also holds the analytics and the unified inbox for comments and DMs.\n" +
            "- **Buffer** (free tier) schedules across multiple platforms from one place, with a simple calendar view. Good when a client is on several networks.\n" +
            "- Others (Later, Hootsuite) do similar things. Learn one; the concepts transfer.\n\n" +
            "## The workflow\n" +
            "1. Plan in your content calendar (Day 1).\n" +
            "2. Batch-create graphics (Day 2) and captions (Day 3).\n" +
            "3. Load everything into the scheduler with dates and times.\n" +
            "4. Review the scheduled queue (right post, right caption, right time, link working).\n" +
            "5. Let it publish, and spend your live time on community, not posting.\n\n" +
            "## Timing, lightly\n" +
            "Post when your audience is active; the platform's analytics will tell you when that is. But do not obsess, consistency and content quality matter far more than hitting a 'perfect' minute. Pick reasonable times, stay consistent, and let the data refine it over a few weeks.\n\n" +
            "## Always review before it goes out\n" +
            "Scheduled does not mean unchecked. A typo, a wrong link, or a post that lands badly on a sensitive day can go out automatically if you do not review the queue. Glance over what is scheduled, especially around real-world events, so nothing tone-deaf publishes on its own.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Scheduling posts in advance lets the feed stay consistent even when you are busy or offline.",
              answer: true,
              whenRight: "Yes. Batch-load a week or month and it publishes itself, which is how you keep consistency and manage social for multiple clients.",
              whenWrong: "It does. Scheduling decouples posting from your live availability, so the feed runs through busy weeks and holidays without you.",
            },
            {
              prompt: "Once posts are scheduled you never need to look at the queue again.",
              answer: false,
              whenRight: "Correct. Always review the queue: a typo, broken link, or a post landing on a sensitive day can publish automatically. Scheduled is not unchecked.",
              whenWrong: "You do need to review. Auto-publishing means mistakes (or tone-deaf timing) go out on their own unless you glance over the queue, especially around real events.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Set up a scheduling workflow",
          body:
            "1. Set up Meta Business Suite or Buffer (free) and connect a test/sample account, or document the steps if you cannot connect a live account.\n" +
            "2. Schedule (or mock-schedule) your week of posts with dates, times, captions, and links.\n" +
            "3. Write your batching workflow as a short checklist (plan, create graphics, write captions, schedule, review).\n\n" +
            "Deliverable: a screenshot of the scheduled queue (or the documented steps) plus your workflow checklist.",
        },
      ],
    },
    {
      number: 5,
      title: "Community management",
      summary: "Reply, engage, and turn followers into a community.",
      items: [
        {
          kind: "lesson",
          title: "The conversation is half the job",
          body:
            "## Posting is half; engaging is the other half\n" +
            "An account that posts but never replies is a billboard, not a community. The accounts people love feel alive: comments get answered, DMs get warm replies, the brand acts like a person. Community management, the engagement side, is what turns followers into customers and customers into advocates.\n\n" +
            "## What it involves\n" +
            "- **Reply to comments**, warmly and in brand voice. Even a quick 'thank you!' or a real answer to a question makes people feel seen and signals an active brand. Questions in comments are buying signals, answer them fast.\n" +
            "- **Handle DMs**, which are often support or sales in disguise ('is this in stock?', 'do you ship to X?'). Treat them with the same care as support tickets (Week 7).\n" +
            "- **Engage outward.** Like and thoughtfully comment on customers' and partners' posts. A brand that engages with its community gets engagement back.\n" +
            "- **Encourage and reshare user content.** When a customer posts your product, thank them and (with permission) reshare it. This social proof is the most persuasive content you have, and it costs nothing.\n\n" +
            "## Tone and speed\n" +
            "Match the platform's casual energy while staying on-brand. And speed matters: a comment or DM answered within hours keeps momentum (and can close a sale); one answered three days later is a missed opportunity. Build a habit of checking and clearing the social inbox daily, like email.\n\n" +
            "## Handle negativity calmly\n" +
            "Public criticism happens. The Week 7 de-escalation skills apply: acknowledge, do not get defensive, and offer to take it to DM to resolve ('So sorry to hear this, can you DM us your order number? We'll make it right.'). Handled well in public, a complaint becomes a demonstration that the brand cares. Never argue publicly.\n\n" +
            "## Watch for the line\n" +
            "Engagement is genuine relationship-building, not spam. Real, specific replies beat copy-pasted emojis. The goal is a community that feels personally connected to the brand, which is something no ad can buy.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A brand should argue back publicly when it receives a critical comment.",
              answer: false,
              whenRight: "Correct. Never argue publicly. Acknowledge calmly, avoid defensiveness, and offer to resolve it in DMs. Handled well, a complaint shows the brand cares.",
              whenWrong: "No. Public arguments damage the brand. Acknowledge, stay calm, and move it to DM to fix, the Week 7 de-escalation approach.",
            },
            {
              prompt: "A question in the comments or DMs is often a buying signal worth answering fast.",
              answer: true,
              whenRight: "Yes. 'Is this in stock?' is a customer ready to buy. A fast, warm reply can close the sale; a slow one loses it.",
              whenWrong: "It usually is. Questions about stock, shipping, or price are interest signals. Answering quickly and warmly often converts; delay loses the moment.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Practise community management",
          body:
            "Write replies (in Kola's voice) to:\n" +
            "1. A comment: 'This is gorgeous! Do you ship to the UK?'\n" +
            "2. A DM: 'Is the large basket back in stock?'\n" +
            "3. A customer who posted a photo of their Kola purchase.\n" +
            "4. A public negative comment: 'Ordered weeks ago, still nothing. Disappointed.'\n\n" +
            "Then write a one-line daily community-management routine (what you check and do each day). Deliverable: the four replies and the routine.",
        },
      ],
    },
    {
      number: 6,
      title: "Analytics and reporting",
      summary: "Measure what matters and turn it into next month's plan.",
      items: [
        {
          kind: "lesson",
          title: "Reading the numbers, and acting on them",
          body:
            "## Measure what matters, not vanity\n" +
            "Likes feel good but rarely move a business. Useful social measurement connects activity to outcomes:\n" +
            "- **Reach / impressions:** how many people saw it (awareness).\n" +
            "- **Engagement that signals intent:** saves and shares (people found it valuable enough to keep or pass on) matter more than likes; comments show real interest.\n" +
            "- **Profile visits and link clicks:** people moving toward buying.\n" +
            "- **Follower growth:** slow and steady from good content beats spikes from giveaways.\n" +
            "- **Sales attributed to social:** the ultimate metric, tracked via link clicks, discount codes, or 'how did you hear about us'.\n\n" +
            "The native analytics (Meta Business Suite, Instagram Insights) give you these for free.\n\n" +
            "## The real skill: so what\n" +
            "Numbers alone are not a report. The value is interpretation: which posts performed best and why, and what to do more of. 'The behind-the-scenes weaver post got 3x the saves and shares of our product posts, people connect with the story, so next month we'll do more maker content' is a real, actionable finding. That is what a founder wants, not a screenshot of likes.\n\n" +
            "## The monthly report\n" +
            "Pull it together monthly (BLUF, like every report this course): a headline (growth and what drove it), the key numbers, the top posts and why they worked, and one or two recommendations for next month. Keep it to a page. A consistent monthly report makes you look like a strategist, not just a poster, and it justifies the retainer.\n\n" +
            "## Let data feed the calendar\n" +
            "The loop closes here: what worked this month shapes next month's content pillars and calendar. Double down on the formats and topics that performed; quietly drop what did not. Over a few months this data-driven adjustment compounds into real growth, which is the difference between busy posting and effective social management.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Saves and shares are often more meaningful than likes for a small business.",
              answer: true,
              whenRight: "Yes. A save means someone wanted to keep it; a share means they passed it on. Both signal real value and reach far more than a like.",
              whenWrong: "They are. Likes are easy and shallow; saves and shares show people found the content valuable enough to keep or spread, which matters more.",
            },
            {
              prompt: "A good monthly report is just a screenshot of the follower count and total likes.",
              answer: false,
              whenRight: "Correct. The value is interpretation: which posts worked, why, and what to do next month. Raw vanity numbers with no 'so what' are not a report.",
              whenWrong: "Not enough. A report explains what worked and why and recommends next steps. Screenshots of likes leave the founder with no decision to make.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Build a monthly report template",
          body:
            "1. Build a one-page monthly social report template with sections: headline (growth + driver), key metrics (reach, engagement, saves/shares, clicks, followers), top 3 posts and why they worked, and 2 recommendations for next month.\n" +
            "2. Fill it with realistic invented numbers for Kola and write a genuine 'so what' for the top post.\n\n" +
            "Deliverable: the filled report and the blank reusable template.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship: a month of social media",
      summary: "Deliver a complete content package for Kola. Portfolio artefact #8.",
      items: [
        {
          kind: "lesson",
          title: "A content engine, packaged",
          body:
            "## The week's deliverable\n" +
            "Today you package a full month of social media management for Kola: a 30-day content calendar, eight branded graphics, captions, a scheduling workflow, a brand-voice guide, and a monthly report template. This is portfolio artefact number eight, and it is the kind of work clients pay a monthly retainer for.\n\n" +
            "## Why this is sellable on its own\n" +
            "Social media management is one of the most common standalone services a remote operator sells, because almost every small business needs it, knows they are bad at it, and would happily pay someone to take it off their plate. A complete month of content, planned, designed, captioned, scheduled, and measured, is concrete proof you can run a brand's presence. Show this package and 'can you run our Instagram?' becomes an easy yes.\n\n" +
            "## The standard\n" +
            "Three tests: the feed looks like one consistent brand (same colours, fonts, voice across every post); the content has variety and purpose (pillars, not all sales); and there is a measurement loop (a report that turns numbers into next month's plan). Hit those and you are not a poster, you are a social media manager.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Social media management is commonly sold as a standalone monthly retainer service.",
              answer: true,
              whenRight: "Yes. Most small businesses need it, know they neglect it, and will pay monthly for someone to run it well. It is a strong standalone offering.",
              whenWrong: "It is. Recurring social management is a classic operator service, businesses pay a monthly retainer because they need consistency they cannot keep themselves.",
            },
            {
              prompt: "A complete content package needs a measurement loop, not just nice posts.",
              answer: true,
              whenRight: "Yes. The report that turns results into next month's plan is what separates a social media manager from someone who just posts. Measurement is the strategist's part.",
              whenWrong: "It does. Pretty posts without measurement is guessing. The loop, measure, learn, adjust the calendar, is what makes the management strategic and effective.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Final build: the month of content",
          body:
            "This is the Week 8 portfolio deliverable. Assemble for Kola:\n" +
            "1. **A 30-day content calendar** with balanced pillars and event-tied posts.\n" +
            "2. **Eight branded graphics** designed in Canva (including one carousel).\n" +
            "3. **Captions** for those posts, each with a hook and a CTA.\n" +
            "4. **A brand-voice guide** (3 to 5 adjectives with do/don't examples and the brand basics).\n" +
            "5. **A scheduling workflow** and a **monthly report template**.\n\n" +
            "Keep the calendar shareable and export the graphics + guide as a PDF. This is portfolio artefact #8.",
        },
      ],
    },
  ],
  topics: [
    "Content operations: the full social loop",
    "Brand basics and consistent design in Canva",
    "Content strategy, pillars, and the calendar",
    "Designing scroll-stopping graphics",
    "Captions, hooks, and calls to action",
    "Scheduling (Meta Business Suite, Buffer) and workflow",
    "Community management and engagement",
    "Analytics, reporting, and the data loop",
  ],
  tasks: [
    "Set up Canva and define brand basics",
    "Build a content calendar with pillars",
    "Design on-brand graphics including a carousel",
    "Write captions with hooks and CTAs",
    "Set up a scheduling workflow",
    "Manage community: comments, DMs, negativity",
    "Build a monthly analytics report",
  ],
  project:
    "Manage Kola's social media for a month: a 30-day content calendar, eight branded Canva graphics, captions with hooks and CTAs, a scheduling workflow, a brand-voice guide, and a monthly report template. Portfolio artefact #8.",
  exercises: [
    "Define a social goal and pillars, and build a 2-week calendar",
    "Design three on-brand graphics including a teaching carousel",
    "Write five captions with hooks and CTAs, plus three hooks for one idea",
    "Set up and review a scheduling queue and write a batching checklist",
    "Build and fill a monthly report template with a real 'so what'",
  ],
  questions: [
    "What makes a content calendar useful rather than just a list?",
    "What is a 'hook' and why does the first line decide everything?",
    "Which metrics actually matter for a small business?",
  ],
  outputs: [
    "A 30-day content calendar",
    "Eight branded Canva graphics",
    "Captions and a brand-voice guide",
    "A scheduling workflow and a monthly report template",
  ],
  mastery_questions: [
    "Build a content calendar with dates, pillars, formats, topics, and captions",
    "Define brand basics (colours, fonts) and design an on-brand graphic in Canva",
    "Design a teaching carousel with a clear single message per slide",
    "Write a caption with a scroll-stopping hook and a clear CTA",
    "Write three different hooks for one content idea",
    "Set up and review a scheduling queue in Buffer or Meta Business Suite",
    "Reply to a comment, a DM, and a public complaint in brand voice",
    "Read analytics and name the best post and why it worked",
    "Write a monthly report with a headline, metrics, and a recommendation",
    "Define a brand voice in 3 to 5 adjectives with do/don't examples",
  ],
  ai_assist:
    "Use AI to brainstorm content ideas against your pillars, draft caption variations and hooks, and turn one idea into a week of posts across formats. Ask it for 10 hook options for a post, then pick and sharpen the best. Keep the client's real voice and facts, feed it the brand-voice guide so drafts come out on-brand, and always do a human pass so captions sound like a person, not generic AI. AI drafts; you make it true, specific, and in Kola's voice.",
  pre_flight:
    "Before planning any content, write Kola's social goal in one sentence and who the audience is. Posting without a goal produces busy work. Then look at the existing feed (or a competitor's): what gets engagement, what falls flat? Let that shape your pillars before you fill the calendar.",
  common_mistakes: [
    "Posting with no plan, so content is inconsistent and last-minute",
    "Generic captions with a weak or missing first line",
    "Cramming multiple messages and too much text onto one graphic",
    "Ignoring comments and DMs, so the community goes cold and sales are missed",
    "Reporting vanity metrics (likes) with no 'so what' or recommendation",
  ],
  debug_help:
    "If engagement is flat, look at hooks and consistency first, the first line and first second decide whether anyone stops, and an erratic feed loses momentum. Fix the hook and the cadence before anything else. If posts look amateur, you are probably starting from blank, use templates and apply your brand basics. If you cannot tell what is working, you are not reading analytics, check saves/shares and which pillar performs, then do more of it.",
  stretch: [
    "Create a reusable Canva brand kit and a set of post templates",
    "Plan a full product-launch campaign across feed, stories, and reels",
    "Set up trackable links (UTMs or a discount code) to attribute sales to social",
  ],
  resources: [
    { label: "Canva Design School", url: "https://www.canva.com/designschool/", note: "Free, official tutorials" },
    { label: "Buffer resources", url: "https://buffer.com/resources/", note: "Free, social strategy" },
    { label: "Meta Business Suite", url: "https://business.facebook.com/", note: "Free, scheduling and analytics" },
  ],
};
