/* Week 3 - Social Media Marketing (Phase: Content and Social) */
module.exports = {
  number: 3,
  title: "Social Media Marketing",
  phase: "Content and Social",
  commitment_hours: "7, 11",
  context:
    "You have content. This week you learn to make it grow an actual audience. Social media marketing is the craft of using platforms (Instagram, TikTok, Facebook, WhatsApp) to reach, engage, and convert your customer, working WITH each platform's algorithm instead of against it. The same content can reach 50 people or 50,000 depending on whether you understand how these platforms decide who sees what.\n\n" +
    "For Adwoa's Kitchen, social is where the awareness and consideration stages happen at scale. Food is built for social, it is visual, emotional, and shareable, so Adwoa has a real advantage if she plays it right. This week you learn the algorithm basics, which platforms matter for her, how hashtags and engagement actually work, and how to turn followers into leads (people who order or join the email list).\n\n" +
    "By Sunday you will have a complete 30-day social media growth plan: which platforms, what to post when, how to engage daily, hashtag strategy, and the specific tactics to move from zero toward the 10K goal. That plan is case study #3, and it is what you would actually execute to grow the account.",
  concept_check: [
    {
      q: "Why does the Instagram or TikTok algorithm show some posts to thousands of people and others to almost no one?",
      choices: [
        "It is random",
        "It tests each post on a small group; if they engage (watch, like, save, share, comment), it shows it to more people",
        "It only shows posts from accounts that pay",
        "It favours accounts with the most followers only",
      ],
      correct: 1,
      explain: "Algorithms test content on a small audience first. Strong early engagement (especially watch time, saves, and shares) signals 'this is good', so the platform shows it to more people. Weak engagement caps the reach.",
    },
    {
      q: "Adwoa has 100 followers and posts a beautiful photo, but it gets almost no reach. What is the most likely fix?",
      choices: [
        "Buy followers",
        "Post more often and engage, plus use formats the algorithm pushes (like reels) and a strong hook",
        "Delete the account and start over",
        "Only post on weekends",
      ],
      correct: 1,
      explain: "Small accounts grow through reach-friendly formats (reels/short video), strong hooks, consistency, and active engagement. Buying followers is fake growth that hurts the algorithm and never converts.",
    },
    {
      q: "What is the difference between a follower and a lead?",
      choices: [
        "Nothing, they are the same",
        "A follower watches your content; a lead has taken a step toward buying (ordered, joined your list, or messaged to enquire)",
        "A lead is someone who unfollowed",
        "A follower is more valuable than a lead",
      ],
      correct: 1,
      explain: "Followers are reach; leads are intent. The goal is to convert followers into leads (orders, enquiries, email signups). Ten thousand followers with no leads do not pay the bills, the plan must turn attention into action.",
    },
  ],
  topics: [
    "How social algorithms decide reach",
    "Choosing the right platforms for the business",
    "Reels and short video (the reach engine)",
    "Hashtags and discoverability",
    "Engagement: comments, DMs, community",
    "Turning followers into leads (CTAs, link in bio, WhatsApp)",
    "Posting frequency and best times",
    "Building a 30-day growth plan",
  ],
  tasks: [
    "Choose Adwoa's primary and secondary platforms",
    "Build a hashtag strategy (broad, niche, local)",
    "Plan a daily engagement routine",
    "Design a follower-to-lead conversion path",
    "Write a full 30-day social media growth plan",
  ],
  project:
    "Produce a 30-day social media growth plan for Adwoa's Kitchen: chosen platforms and why, a posting schedule built on Week 2's content, a hashtag strategy, a daily engagement routine, a follower-to-lead conversion path (link in bio + WhatsApp ordering), and the growth tactics to move toward 10K. Include the metrics you will track. Portfolio case study #3.",
  exercises: [
    "Research and group 30 hashtags (broad, niche, local) for Adwoa",
    "Write a daily 20-minute engagement routine",
    "Design the link-in-bio and WhatsApp ordering flow",
    "Lay out a 30-day calendar of posts + engagement",
  ],
  questions: [
    "How does the algorithm decide who sees a post?",
    "Which platforms should Adwoa focus on, and why?",
    "How do you turn a follower into a paying lead?",
  ],
  outputs: [
    "A platform strategy (primary + secondary)",
    "A hashtag strategy document",
    "A daily engagement routine",
    "A full 30-day social media growth plan",
  ],
  mastery_questions: [
    "Explain how the algorithm tests and scales a post",
    "Pick Adwoa's best platform and justify it",
    "Build a 3-tier hashtag set (broad, niche, local)",
    "Describe a follower-to-lead conversion path",
    "Name the 3 metrics you would track weekly",
  ],
  ai_assist:
    "Use AI for research and ideation: 'Suggest 30 hashtags for a Ghanaian home-food brand, grouped into broad, niche, and local.' Then verify them yourself in the app (check they are active, not banned, and right-sized). Also good: 'Write 7 days of engagement prompts (questions/polls) to boost comments.' AI accelerates the grunt work; you apply local knowledge and judgement.",
  pre_flight: [
    "Your Week 2 content (10 pieces + calendar)",
    "An Instagram and/or TikTok account for Adwoa (business account)",
    "A WhatsApp number for orders/enquiries",
  ],
  common_mistakes: [
    "Spreading thin across every platform instead of winning one",
    "Buying followers (fake growth that hurts reach and never converts)",
    "Posting and ghosting, no engagement, so the community never forms",
    "Growing followers but never converting them into leads",
  ],
  debug_help: [
    "Low reach? Lean into reels/short video and sharper hooks; the algorithm rewards watch time.",
    "No engagement? Ask questions, reply to every comment fast, and spend time engaging on OTHER accounts.",
    "Followers but no orders? Your link-in-bio and ordering path may be unclear, simplify the next step.",
  ],
  stretch: [
    "Plan a micro-collaboration with a local food influencer or nearby business",
    "Design a simple giveaway to spike followers and leads",
  ],
  resources: [
    "Meta Business Suite (free) for scheduling and insights",
    "The platforms' native insights/analytics",
    "Your Week 2 content calendar and pieces",
  ],
  days: [
    {
      number: 0,
      title: "How algorithms work, and set up the accounts",
      summary:
        "Today you'll understand how social algorithms decide reach, then set up Adwoa's business accounts and free scheduling tools.",
      items: [
        {
          kind: "lesson",
          title: "The algorithm is a taste-tester",
          body:
            "## What an algorithm actually does\n" +
            "An algorithm is just the platform's system for deciding *who sees what*. There are billions of posts; it cannot show everyone everything, so it predicts what each user will most want to see and shows them that. Understanding this one idea changes how you post.\n\n" +
            "## The test-and-scale model\n" +
            "When you post, the platform shows it to a *small* sample of your audience first, a taste-test. It watches how they react: do they watch to the end? Like? Save? Share? Comment? If that small group engages strongly, the platform thinks 'this is good content' and shows it to a bigger group, then a bigger one. If they scroll past, reach stops. This is why two posts from the same account can reach 50 or 50,000 people, the difference is *early engagement*.\n\n" +
            "## What the algorithm rewards (in rough order of power)\n" +
            "1. **Watch time / completion** (for video), did they watch the whole reel?\n" +
            "2. **Shares and saves**, the strongest 'this is valuable' signals.\n" +
            "3. **Comments**, especially genuine conversation.\n" +
            "4. **Likes**, weakest but still counts.\n\n" +
            "Notice: a strong *hook* (Week 2) drives watch time, value content drives saves, and a question drives comments. Your content choices directly feed the signals the algorithm rewards. You are not gaming it, you are giving it what it (and your audience) wants.\n\n" +
            "## What hurts you\n" +
            "Buying followers (fake accounts do not engage, which *lowers* your average engagement and tanks reach), posting and disappearing, and content with no hook. Real growth comes from real engagement. There are no shortcuts that last.\n\n" +
            "This week you build a plan that works *with* this system: reach-friendly formats, strong hooks, consistency, and active engagement.",
        },
        {
          kind: "lesson",
          title: "Set up business accounts and free tools",
          body:
            "## Get the accounts right\n" +
            "**1. Business accounts.** Convert Adwoa's Instagram and Facebook to *Business/Professional* accounts (free, in settings). This unlocks **Insights** (analytics: reach, engagement, follower data) and the ability to add a contact button and run ads later. A personal account hides all of this. On TikTok, switch to a Business account too. Without analytics you are flying blind.\n\n" +
            "**2. Meta Business Suite.** Go to business.facebook.com and connect Adwoa's Facebook + Instagram. Meta Business Suite (free) lets you *schedule* posts in advance, see insights across both, and manage messages in one place. Scheduling is what makes a calendar sustainable, plan a week, schedule it, done.\n\n" +
            "**3. A clear bio.** Each profile bio must do three jobs in one glance: say *what* (Homemade jollof, grills + spice mix, Accra), *who for* (a hint of the customer), and *what to do next* (the link / 'Order on WhatsApp'). The bio is prime real estate, it is where followers become leads.\n\n" +
            "**4. WhatsApp for orders.** Set up a WhatsApp number (ideally WhatsApp Business, free) as the ordering channel. In Ghana, WhatsApp is where many small-business sales actually close. Add the 'Message' button to the profiles.\n\n" +
            "Today is setup. The rest of the week is strategy and the 30-day plan.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "The algorithm shows your post to everyone at once and then stops.",
              answer: false,
              whenRight: "Right, it tests on a small group first, then scales reach based on their engagement. Strong early engagement = more reach.",
              whenWrong: "It test-and-scales: a small sample first, then wider only if they engage. Early engagement decides total reach.",
            },
            {
              prompt: "Saves and shares are stronger 'this is valuable' signals than likes.",
              answer: true,
              whenRight: "Yes. Saves and shares carry the most weight, then comments, then likes. Make content worth saving and sharing.",
              whenWrong: "They are. Saves and shares are the top signals (someone valued it enough to keep or pass on). Likes are the weakest.",
            },
            {
              prompt: "Buying followers is a smart shortcut to trigger the algorithm.",
              answer: false,
              whenRight: "Right, it backfires. Fake followers do not engage, which lowers your engagement rate and reduces reach. It is fake, harmful growth.",
              whenWrong: "It hurts you. Bought followers never engage, dragging down your engagement rate and your reach. Avoid it entirely.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, set up the accounts",
          body:
            "Get Adwoa social-ready:\n\n" +
            "- [ ] Instagram (and Facebook/TikTok) switched to Business accounts\n" +
            "- [ ] Meta Business Suite connected for scheduling and insights\n" +
            "- [ ] Each bio rewritten to say what, who for, and what to do next\n" +
            "- [ ] WhatsApp set up as the ordering channel, with a Message button on profiles\n\n" +
            "Then write one sentence: based on the algorithm, which content format should Adwoa lean into most? (Hint: what drives watch time and shares for food?)",
        },
      ],
    },
    {
      number: 1,
      title: "Orient, pick the right platforms",
      summary:
        "Today you'll decide which platforms Adwoa should focus on, because winning one beats being mediocre on five.",
      items: [
        {
          kind: "lesson",
          title: "Win one platform before adding another",
          body:
            "## Do not spread thin\n" +
            "The biggest social mistake small businesses make is trying to be everywhere, Instagram, TikTok, Facebook, X, LinkedIn, Pinterest, all at once, and doing all of them badly. Each platform takes real effort to win. Pick ONE primary platform to dominate and maybe one secondary, and ignore the rest until those are working. Depth beats breadth.\n\n" +
            "## How to choose (match platform to customer and content)\n" +
            "Two questions decide it: *Where is Akosua?* and *What content does this platform reward?*\n\n" +
            "- **Instagram** (Reels + feed + Stories): huge in Ghana for food, visual, strong for both reach (reels) and trust (stories/feed). Akosua scrolls it on her commute. **Strong primary candidate for Adwoa.**\n" +
            "- **TikTok**: fastest organic reach right now, short video, great for going viral with food content; younger-skewing but growing fast in Ghana. **Strong for reach (awareness).**\n" +
            "- **Facebook**: still massive in Ghana, especially for community groups, local selling, and an older audience; great for Marketplace and local reach. **Useful secondary, especially for local orders.**\n" +
            "- **WhatsApp**: not for discovery, but where sales *close* and where you can run a 'broadcast'/status to existing contacts. **The conversion layer, not the growth layer.**\n\n" +
            "## A sensible stack for Adwoa\n" +
            "Primary: **Instagram** (reels for reach, stories/feed for trust). Secondary: **TikTok** (reach via short video, repurpose the same reels). Conversion: **WhatsApp** (where orders close). Facebook as a light third for local groups. This focuses effort where the customer is and the content fits, and lets you repurpose one reel across IG and TikTok for double the reach with the same work.\n\n" +
            "Today you choose Adwoa's platforms and justify each. A clear choice now saves wasted effort all month.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A small business should be active on as many platforms as possible from day one.",
              answer: false,
              whenRight: "Right, win one (maybe two) first. Spreading across five means doing all badly. Depth beats breadth.",
              whenWrong: "No, focus. Dominate one primary platform, add a secondary, ignore the rest until those work.",
            },
            {
              prompt: "You should pick platforms based on where your customer is and what content the platform rewards.",
              answer: true,
              whenRight: "Yes. Match platform to the persona's habits and to your content type. For visual food, Instagram and TikTok fit naturally.",
              whenWrong: "Those are the two right questions: where is your customer, and what content wins there. Match both.",
            },
            {
              prompt: "WhatsApp is mainly a discovery platform for finding new customers.",
              answer: false,
              whenRight: "Right, it is a CONVERSION layer where orders close, not a discovery engine. Use IG/TikTok to find people, WhatsApp to sell.",
              whenWrong: "It is for closing, not discovery. New customers come from IG/TikTok; WhatsApp is where they place the order.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, choose the platforms",
          body:
            "Start your 30-day plan doc with the platform strategy:\n\n" +
            "- [ ] Choose a PRIMARY platform and write why (customer + content fit)\n" +
            "- [ ] Choose a SECONDARY platform and how you will repurpose content to it\n" +
            "- [ ] Name the CONVERSION channel (where orders close)\n" +
            "- [ ] List the platforms you will deliberately IGNORE for now, and why\n\n" +
            "A focused choice is a strategic decision, write it down so the month's effort goes where it counts.",
        },
      ],
    },
    {
      number: 2,
      title: "Reels and short video, the reach engine",
      summary:
        "Today you'll learn why short video is the fastest path to reach, and how to make reels that the algorithm pushes.",
      items: [
        {
          kind: "lesson",
          title: "Short video is how small accounts get found",
          body:
            "## Why reels and TikToks win reach\n" +
            "Both Instagram and TikTok are pushing short video hard because it keeps users on the app. For a *small* account, this is the great opportunity: a single reel can reach far beyond your follower count and put you in front of thousands of strangers, exactly the awareness stage of your journey. Photos mostly reach your existing followers; reels reach *new* people. For growth from zero, short video is the engine.\n\n" +
            "## The anatomy of a reel that performs\n" +
            "1. **The hook (first 1-2 seconds):** show the payoff and tease the value. For food: open on the *finished, glistening jollof*, then 'the mistake that ruins 90% of jollof'. Do not open with a logo or a slow intro, you will lose them.\n" +
            "2. **Fast value/story:** deliver quickly, keep it moving. Short reels (7-20 seconds) often outperform long ones for reach because completion rate is higher.\n" +
            "3. **A reason to rewatch or share:** a satisfying result, a surprising tip, a relatable moment. Saves and shares supercharge reach.\n" +
            "4. **A caption + CTA:** so engaged viewers know the next step (follow, comment, order).\n\n" +
            "## Food is reel gold\n" +
            "Adwoa has an unfair advantage: food content is inherently engaging, the sizzle, the colour, the steam, the plating. Simple winning formats: a quick recipe/tip, a satisfying cooking process (chop, stir, plate), a before/after, a 'mistakes' reveal, a behind-the-scenes of a busy order day. Filmed on a phone in good light. You do not need fancy gear, you need a strong hook and good food (which she has).\n\n" +
            "## Consistency compounds\n" +
            "One reel rarely changes everything; a *habit* of reels does. The accounts that grow post short video consistently, learning what works from the data. Plan reels as the backbone of Adwoa's reach. Today you script a few from your Week 2 content.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Photos generally reach new strangers better than reels do.",
              answer: false,
              whenRight: "Right, reels reach new people (the algorithm pushes them to non-followers); photos mostly reach existing followers. For growth, lead with reels.",
              whenWrong: "Reversed. Reels reach NEW people; photos mostly hit current followers. Short video is the growth engine.",
            },
            {
              prompt: "A reel should open on the most striking payoff and a hook, not a logo or slow intro.",
              answer: true,
              whenRight: "Yes. Show the glistening jollof and a hook immediately. A slow intro or logo loses viewers in the first second.",
              whenWrong: "It should. Lead with the payoff + hook instantly. Logos and slow intros kill the all-important first seconds.",
            },
            {
              prompt: "Shorter reels often beat longer ones for reach because more people watch to the end.",
              answer: true,
              whenRight: "Yes, higher completion rate is a strong signal. 7-20 second reels often outperform long ones for reach.",
              whenWrong: "True, completion rate matters. Tight, short reels get watched fully, which the algorithm rewards with reach.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, script reels",
          body:
            "Plan Adwoa's reach engine:\n\n" +
            "- [ ] Script 3 reels from your Week 2 content (hook + fast value + CTA)\n" +
            "- [ ] For each, write the opening visual (the payoff frame) and the first spoken line\n" +
            "- [ ] Keep each under ~20 seconds of content\n" +
            "- [ ] Note which can be reposted to TikTok with no changes\n\n" +
            "Reels are the backbone of reach. Tomorrow you make sure new people can find them, with hashtags.",
        },
      ],
    },
    {
      number: 3,
      title: "Hashtags and discoverability",
      summary:
        "Today you'll build a hashtag strategy that helps the right people discover Adwoa, using the broad-niche-local tiers.",
      items: [
        {
          kind: "lesson",
          title: "Hashtags are a discovery tool, used right",
          body:
            "## What hashtags actually do\n" +
            "Hashtags help the platform *categorise* your content and surface it to people interested in that topic, in search, in hashtag feeds, and as a signal of what your post is about. They are less powerful than they once were (the algorithm now understands your content directly), but used well they still help the *right* people discover you, especially as a small account. Used badly (50 random tags, banned tags), they do nothing or hurt.\n\n" +
            "## The three-tier strategy\n" +
            "Do not just use the biggest hashtags, on #food (hundreds of millions of posts), a small account is invisible in seconds. Mix three tiers:\n\n" +
            "- **Broad (large):** #JollofRice #GhanaFood, big reach but huge competition. A few of these.\n" +
            "- **Niche (medium):** #AccraFoodie #GhanaianRecipes #HomemadeJollof, smaller, more targeted, easier to rank in. The workhorse tier.\n" +
            "- **Local (small/specific):** #AccraEats #OsuFood #EastLegonFood #GhanaSpiceMix, low competition, highly relevant, the people most likely to actually order. Gold for a local business.\n\n" +
            "A good set is ~10-20 mixed across tiers, leaning toward niche and local where a small account can actually be seen.\n\n" +
            "## Find and vet your hashtags\n" +
            "Search candidate tags in the app: see how many posts use each (size) and whether the top posts are like yours (relevance). Avoid 'banned' or spammy tags (a quick search shows if a tag is restricted). Check what competitors and local food accounts use. Build a saved list grouped by tier so you can mix-and-match per post, not retype every time.\n\n" +
            "## Beyond hashtags\n" +
            "Discoverability also comes from: a *keyword-rich* caption and profile (platforms now read your words, e.g. 'Accra jollof delivery'), geotags (tag the location, huge for local), and trending audio on reels (using a trending sound boosts reach). Hashtags are one lever among several. Today you build the hashtag set and note the others.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Using only the biggest hashtags (#food, #jollof) is the best strategy for a small account.",
              answer: false,
              whenRight: "Right, on huge tags a small account vanishes instantly. Mix broad, niche, and especially local tags where you can actually be seen.",
              whenWrong: "No, you disappear on giant tags. Lean into niche and local tags, where a small account can rank and the right people look.",
            },
            {
              prompt: "Local hashtags (#AccraEats, #OsuFood) are valuable because they reach people likely to actually order.",
              answer: true,
              whenRight: "Yes. Low competition + high relevance + local intent = the people most likely to buy. Gold for a local business.",
              whenWrong: "They are gold, low competition, highly relevant, and reaching nearby people who can actually order.",
            },
            {
              prompt: "Geotags and keyword-rich captions also help people discover your content, not just hashtags.",
              answer: true,
              whenRight: "Yes. Platforms read your words and location now. Geotags (great for local) and keywords in captions boost discovery alongside hashtags.",
              whenWrong: "They do. Discoverability is more than hashtags, geotags and keywords in your caption/profile matter a lot, especially locally.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build the hashtag strategy",
          body:
            "In your plan doc, create a hashtag strategy:\n\n" +
            "- [ ] Research and list ~30 hashtags grouped into broad, niche, and local tiers\n" +
            "- [ ] Vet each for size and relevance in the app; drop any banned/spammy ones\n" +
            "- [ ] Build 2-3 ready-to-use mixed sets (10-15 tags each) for different post types\n" +
            "- [ ] Note your geotag and 3 keywords to weave into captions/profile\n\n" +
            "Discovery is set up. Tomorrow: engagement, the other half of growth.",
        },
      ],
    },
    {
      number: 4,
      title: "Engagement, building a community",
      summary:
        "Today you'll learn that growth is two-way, and build a daily engagement routine that turns reach into a real community and leads.",
      items: [
        {
          kind: "lesson",
          title: "Posting is half the job",
          body:
            "## The 'post and ghost' mistake\n" +
            "Most small businesses post content and then disappear until the next post. They treat social as a billboard. But social is *social*, a conversation. The accounts that grow *engage*: they reply to comments, answer DMs fast, ask questions, and spend time interacting on *other* accounts. Engagement does two things: it builds a real community that buys and refers, and it feeds the algorithm (comments and conversation are strong signals).\n\n" +
            "## Engagement that grows you\n" +
            "1. **Reply to every comment**, fast and like a human. A reply invites more comments (good algorithm signal) and shows you care. Ask a follow-up question to keep the conversation going.\n" +
            "2. **Answer DMs quickly**, especially order enquiries. A slow reply on WhatsApp/DM is a lost sale. Speed is a competitive advantage for a small business.\n" +
            "3. **Invite engagement in your content:** ask questions ('which jollof side is best, salad or kelewele?'), use Story polls and quizzes, run 'comment X for the recipe'. You are *designing* engagement, not hoping for it.\n" +
            "4. **Engage outward:** spend 15-20 minutes a day commenting genuinely on local food accounts, customers, and nearby businesses. This puts Adwoa in front of relevant people and builds relationships (and the algorithm notices active accounts).\n\n" +
            "## Turn engagement into leads\n" +
            "Engagement is not just nice, it is the bridge to sales. Someone who comments or DMs is *warm*. Reply, build rapport, and gently guide them to the next step ('we deliver in Accra, want me to send the menu?'). A friendly, fast DM conversation closes more orders than any clever caption. This is how followers become *leads*.\n\n" +
            "## A daily routine beats sporadic bursts\n" +
            "Set a simple daily routine (~20 minutes): reply to all comments/DMs, post or check the scheduled post, engage on 5-10 other accounts, respond to any Story interactions. Consistent small effort compounds. Today you design Adwoa's daily engagement routine.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Posting content and not engaging ('post and ghost') is fine as long as the content is good.",
              answer: false,
              whenRight: "Right, social is a conversation. Replying, asking questions, and engaging outward builds community AND feeds the algorithm. Ghosting wastes the content.",
              whenWrong: "It is not enough. Engagement (replies, questions, outward commenting) is half of growth and a strong algorithm signal.",
            },
            {
              prompt: "Someone who comments or DMs is a warm lead worth guiding toward an order.",
              answer: true,
              whenRight: "Yes. Engagement is the bridge to sales. A fast, friendly DM conversation converts warm followers into orders.",
              whenWrong: "They are warm. Replying and gently guiding them to the next step is exactly how followers become paying leads.",
            },
            {
              prompt: "A slow reply to an order DM has little effect on sales.",
              answer: false,
              whenRight: "Wrong, speed matters a lot. A slow DM reply is a lost sale; fast replies are a real competitive edge for a small business.",
              whenWrong: "Speed is critical. Slow replies lose orders. Fast, friendly responses close sales and build loyalty.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, design the engagement routine",
          body:
            "Add an engagement routine to your plan:\n\n" +
            "- [ ] Write a ~20-minute DAILY routine (reply to comments/DMs, post, engage outward)\n" +
            "- [ ] Write 5 engagement prompts (questions/polls) to use in content this month\n" +
            "- [ ] Draft a friendly DM script that guides an enquiry toward an order\n" +
            "- [ ] List 10 local accounts Adwoa should engage with regularly\n\n" +
            "Community is a growth and conversion engine. Tomorrow: making sure followers actually become leads.",
        },
      ],
    },
    {
      number: 5,
      title: "Followers to leads, the conversion path",
      summary:
        "Today you'll build the path that turns attention into action, so 10,000 followers actually translate into orders and signups.",
      items: [
        {
          kind: "lesson",
          title: "Followers are not the goal, leads are",
          body:
            "## The vanity trap\n" +
            "It is easy to chase followers and feel successful while the business makes no money. Followers are *reach*; **leads** are *intent*, someone who ordered, enquired, or joined the email list. The goal of all this growth is to convert followers into leads and leads into customers. A clear conversion path is what makes the 10K goal *matter*.\n\n" +
            "## The follower-to-lead path\n" +
            "Map the steps a follower takes to become a lead, and remove friction at each:\n\n" +
            "1. **The bio + link:** the bio must tell them the next step and give one clear link. Use a single 'link in bio' (a free tool like Linktree, or a direct WhatsApp link) leading to: order on WhatsApp, see the menu, or join the list. Do not make them hunt.\n" +
            "2. **The CTA in content:** every few posts should point somewhere ('order via the link', 'DM us MENU', 'comment to get the recipe'). Attention with no instruction is wasted.\n" +
            "3. **The conversion channel:** for Adwoa, mostly WhatsApp. A 'Message us to order' button + a saved menu/catalogue so the conversation is fast. WhatsApp Business 'catalogue' lets people browse products in-chat, a powerful, free tool.\n" +
            "4. **Capture contacts:** beyond orders, get followers onto an email list (Week 8) or a WhatsApp broadcast list, so you can reach them again without the algorithm. A simple lead magnet ('comment RECIPE and join our list for a free jollof guide') converts followers into owned contacts.\n\n" +
            "## Make the next step obvious and easy\n" +
            "The single biggest conversion killer is friction: an unclear link, a slow reply, too many steps, a confusing way to order. Every extra step loses people. Audit the path as if you were Akosua, hungry and on her phone, *how many taps to order?* Fewer is better. The brand that makes ordering effortless wins.\n\n" +
            "## Track leads, not just followers\n" +
            "From now on, the headline metric is *leads* (orders, enquiries, signups), with followers as a supporting metric. Today you design the conversion path and decide how you will count leads.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "10,000 followers is a success even if none of them ever order or enquire.",
              answer: false,
              whenRight: "Right, that is a vanity win. Followers without leads do not pay the bills. The conversion path turns reach into orders.",
              whenWrong: "Followers alone are vanity. The point is LEADS, orders, enquiries, signups. Reach must convert to action.",
            },
            {
              prompt: "Friction (unclear link, too many steps, slow replies) is the biggest conversion killer.",
              answer: true,
              whenRight: "Yes. Every extra step loses people. Make the next step obvious and the ordering path as short as possible.",
              whenWrong: "It is. Friction kills conversion. Audit the path as a hungry customer, how many taps to order? Cut every one you can.",
            },
            {
              prompt: "Getting followers onto an email or WhatsApp list lets you reach them without depending on the algorithm.",
              answer: true,
              whenRight: "Yes. Owned contacts (email/WhatsApp list) are reachable anytime, no algorithm gatekeeper. That is why lead capture matters.",
              whenWrong: "It does. An owned list reaches people directly, unlike social where the algorithm controls who sees you. Capture contacts.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build the conversion path",
          body:
            "Design Adwoa's follower-to-lead path:\n\n" +
            "- [ ] Set up a single link-in-bio leading to the clearest next step (order/menu/list)\n" +
            "- [ ] Write the bio CTA and 3 content CTAs that drive to it\n" +
            "- [ ] Set up the WhatsApp ordering flow (Message button + a saved menu/catalogue)\n" +
            "- [ ] Design a simple lead magnet to capture contacts (e.g. a free jollof guide for joining the list)\n" +
            "- [ ] Define how you will count 'leads' each week\n\n" +
            "Now the growth has a destination. Tomorrow you assemble the full 30-day plan.",
        },
      ],
    },
    {
      number: 6,
      title: "Build the 30-day growth plan",
      summary:
        "Today you'll assemble everything into a complete, executable 30-day social media growth plan with metrics.",
      items: [
        {
          kind: "lesson",
          title: "From tactics to a real plan",
          body:
            "## What a 30-day plan contains\n" +
            "A plan is not a wish, it is a schedule of specific actions someone could execute. Pull together everything from this week into one document:\n\n" +
            "1. **Platforms** (primary, secondary, conversion) and why.\n" +
            "2. **Posting schedule:** what to post each day for 30 days, by pillar and format, built on Week 2's content (e.g. 4 reels, 4 carousels, daily stories, 2 offers per week). Best-effort 'best times' based on when Akosua is online (commutes, lunch, evening).\n" +
            "3. **Hashtag sets** ready to apply.\n" +
            "4. **Daily engagement routine** (~20 min).\n" +
            "5. **Conversion path** (bio link, CTAs, WhatsApp, lead magnet).\n" +
            "6. **A growth tactic or two:** e.g. a small giveaway, a collaboration with a local food account, or a content series, to spike growth.\n" +
            "7. **Metrics to track** weekly.\n\n" +
            "## Choose the metrics that matter\n" +
            "Track a small set, weekly: **reach** (awareness), **engagement rate** (are people interacting?), **follower growth**, and most importantly **leads** (DMs/orders/signups). Vanity-only tracking (just follower count) hides whether the business is actually growing. Leads is the headline. Set up a simple tracking sheet (you will go deep on analytics in Week 9).\n\n" +
            "## Build in learning\n" +
            "A plan is a hypothesis, not a guarantee. Build in a weekly check: which posts reached/engaged most? Do *more* of what works, less of what does not. The accounts that grow fastest are the ones that *learn* from their data weekly and adjust. Note this review step in the plan.\n\n" +
            "## Realistic, not heroic\n" +
            "Make the plan sustainable, something Adwoa (or you on her behalf) can actually keep up for 30 days and beyond. Over-promising (daily reels + 2 hours engagement) leads to burnout and silence. A consistent, moderate plan beats an unsustainable sprint. Today you assemble the full, realistic 30-day plan.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A 30-day plan should be a clear schedule of specific actions, not a vague set of goals.",
              answer: true,
              whenRight: "Yes. A plan is executable, someone could follow it day by day. Vague goals are not a plan.",
              whenWrong: "It should be concrete and executable, specific posts, engagement, and tactics by day, not just aspirations.",
            },
            {
              prompt: "Tracking only follower count is enough to know if the social strategy is working.",
              answer: false,
              whenRight: "Right, track reach, engagement, follower growth, AND leads. Leads (orders/enquiries) is the headline; follower count alone can hide failure.",
              whenWrong: "Not enough. Followers can rise while leads stay zero. Track engagement and especially LEADS as the headline metric.",
            },
            {
              prompt: "The best-growing accounts review their data weekly and do more of what works.",
              answer: true,
              whenRight: "Yes. A plan is a hypothesis; weekly learning and adjustment is what compounds growth. Build the review step in.",
              whenWrong: "They do. Growth comes from reviewing weekly and doubling down on what performs. Bake that learning loop into the plan.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, assemble the plan",
          body:
            "Build the full 30-day growth plan:\n\n" +
            "- [ ] Combine platforms, posting schedule, hashtags, engagement routine, and conversion path into one doc\n" +
            "- [ ] Lay out 30 days of specific posts (pillar + format + topic) using Week 2's content\n" +
            "- [ ] Add 1-2 growth tactics (giveaway, collab, or series)\n" +
            "- [ ] Define the weekly metrics (reach, engagement, followers, LEADS) and a weekly review step\n" +
            "- [ ] Sanity-check that it is sustainable, not heroic\n\n" +
            "Tomorrow you package it as case study #3.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship it, 30-day social growth plan (case study #3)",
      summary:
        "Today you'll package your social media strategy and 30-day plan into case study #3 of your portfolio.",
      items: [
        {
          kind: "lesson",
          title: "Ship it, a plan a client could run",
          body:
            "## Package case study #3\n" +
            "Present your work as a clean strategy document titled **Adwoa's Kitchen, 30-Day Social Media Growth Plan**, with:\n\n" +
            "- A **challenge/approach** opener (Adwoa had a near-zero following and no system; you built a complete growth plan)\n" +
            "- The **platform strategy** and rationale\n" +
            "- The **30-day posting schedule** (a clean calendar)\n" +
            "- The **hashtag strategy**, **engagement routine**, and **conversion path**\n" +
            "- The **growth tactics** and the **metrics** you will track\n\n" +
            "Make it look like something you would hand a paying client, because that is exactly what it is.\n\n" +
            "## Why this is a strong portfolio piece\n" +
            "Anyone can say 'I do social media'. Few can show a *complete, strategic, metrics-driven growth plan*, built on an algorithm understanding, with a clear path from follower to lead. This case study proves you think like a growth marketer, not a 'poster'. It demonstrates you understand reach, engagement, conversion, AND measurement, the full picture.\n\n" +
            "## The honest note on results\n" +
            "Because this is a learning project, you may not run all 30 days live, and that is fine, the *plan and the thinking* are the portfolio asset. If you DO execute even part of it on a real account (yours or a willing local business), capture the before/after numbers; real results make the case study far stronger. Either way, frame it as 'here is the strategy I designed and how I would measure it'.\n\n" +
            "Save case study #3. You now have three: strategy, content, and social, the entire top of the funnel (awareness and consideration) covered.\n\n" +
            "Next week: SEO. You will learn how customers find Adwoa through Google search, a completely different, evergreen channel that works while she sleeps.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A strong social case study shows a complete, metrics-driven plan, not just 'I can make posts'.",
              answer: true,
              whenRight: "Yes. The strategy, the algorithm understanding, the conversion path, and the metrics are what prove you think like a growth marketer.",
              whenWrong: "It does. A full, strategic, measurable plan is the portfolio asset, far more than 'I post nicely'.",
            },
            {
              prompt: "If you execute part of the plan on a real account, real before/after numbers strengthen the case study.",
              answer: true,
              whenRight: "Yes. Real results are the strongest proof. Even a small real test with captured numbers beats a plan alone.",
              whenWrong: "They do. Live results, even partial, make a case study much stronger. Capture the numbers if you run any of it.",
            },
            {
              prompt: "After this week, Adwoa's awareness and consideration stages are now addressed.",
              answer: true,
              whenRight: "Yes. Content (W2) + social (W3) cover the top of the funnel. Next, SEO adds an evergreen discovery channel.",
              whenWrong: "They are. Content and social fill awareness and consideration. SEO (next) adds search-based discovery.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Ship it",
          body:
            "Package and ship case study #3:\n\n" +
            "- [ ] One document titled `Adwoa's Kitchen, 30-Day Social Media Growth Plan`\n" +
            "- [ ] Challenge/approach framing at the top\n" +
            "- [ ] Platforms, 30-day schedule, hashtags, engagement, conversion, metrics, all present\n" +
            "- [ ] (Optional but powerful) any real numbers if you tested it live\n" +
            "- [ ] Saved in your `Week 03 Social` portfolio folder\n\n" +
            "Three case studies done. Next week: SEO, getting found on Google.",
        },
      ],
    },
  ],
};
