/* Week 10 - AI for Marketing (Phase: Retention, Data and AI) */
module.exports = {
  number: 10,
  title: "AI for Marketing",
  phase: "Retention, Data and AI",
  commitment_hours: "7, 11",
  context:
    "You now have the full marketing skill set. This week you learn the force-multiplier that makes a single marketer as productive as a small team: AI. Used well, AI tools (Claude, ChatGPT, Gemini for text; image generators for visuals) can draft a month of content in an hour, brainstorm campaign ideas, research a market, repurpose one piece into ten, analyse data, and write first drafts of almost everything you have built across this track. The marketers who thrive from here on are not the ones who resist AI, nor the ones who let it do their thinking, but the ones who *direct* it skilfully.\n\n" +
    "The key distinction this week: AI does the *mechanical* heavy lifting (drafting, ideating, summarising, repurposing) at speed and volume, while you keep the *judgement* (strategy, brand voice, what is true, what fits the Ghanaian market, what is actually good). AI raises your output and frees your time for the high-value thinking. Used badly, it produces generic, soulless, sometimes wrong content that audiences see through instantly. This week is about using it the right way.\n\n" +
    "By Sunday you will have built reusable AI workflows for Adwoa's Kitchen, prompt templates and processes for content creation, research, and repurposing, plus AI-assisted (and human-edited) deliverables. Those workflows are case study #10, and a skill that is in extremely high demand right now.",
  concept_check: [
    {
      q: "Adwoa's competitor posts raw, unedited AI-generated captions. Why do they underperform?",
      choices: [
        "AI captions are always too long",
        "Raw AI output is generic and 'soulless', it lacks brand voice, local flavour, and authentic detail, which audiences notice and ignore",
        "AI is banned on Instagram",
        "AI cannot write captions at all",
      ],
      correct: 1,
      explain: "AI gives you a fast draft, but unedited it sounds generic and same-y (everyone using it gets similar output). Audiences can tell. The winning approach is AI draft + human edit: you add the real voice, specific detail, and local authenticity that makes content actually land.",
    },
    {
      q: "What is the most important factor in getting good output from an AI tool?",
      choices: [
        "Using the most expensive AI",
        "The quality of your prompt, clear context, role, specifics, and examples produce far better results than a vague request",
        "Asking the same question many times",
        "Keeping prompts as short as possible",
      ],
      correct: 1,
      explain: "AI output quality depends heavily on the prompt. A vague prompt ('write a caption') gives generic output; a rich prompt (role + context + audience + specifics + examples + format) gives strong, usable output. Prompting well is the core skill of working with AI.",
    },
    {
      q: "Adwoa asks AI for 'the best time to post in Accra' and it gives a confident, specific answer. What must you do?",
      choices: [
        "Trust it completely, AI is always right",
        "Verify it, AI can 'hallucinate' confident but wrong facts; check claims against real data (your own analytics, real sources) before acting",
        "Ignore all AI answers",
        "Ask it again until you like the answer",
      ],
      correct: 1,
      explain: "AI can state false things with total confidence (hallucination). For anything factual, especially data, statistics, or specifics, verify against reality (your own analytics, trusted sources). Use AI for drafting and ideas; confirm facts yourself. You are accountable for what you publish.",
    },
  ],
  topics: [
    "AI as a force-multiplier (what it does well and badly)",
    "The major AI tools (Claude, ChatGPT, Gemini; image generators)",
    "Prompt engineering for marketing",
    "AI for content creation and repurposing",
    "AI for research, ideation, and strategy",
    "AI for data analysis and reporting",
    "Responsible AI use (accuracy, voice, disclosure, ethics)",
    "Building reusable AI workflows and prompt templates",
  ],
  tasks: [
    "Set up access to an AI assistant (and an image tool)",
    "Write strong marketing prompts (role + context + specifics + examples)",
    "Build an AI content-creation and repurposing workflow",
    "Build an AI research/ideation workflow",
    "Produce reusable AI workflows + prompt templates",
  ],
  project:
    "Build a set of reusable AI marketing workflows for Adwoa's Kitchen: documented prompt templates and processes for (1) content creation + repurposing, (2) research/ideation, and (3) analysis/reporting, each with example outputs that have been human-edited to Adwoa's voice. Include a responsible-use note. Portfolio case study #10.",
  exercises: [
    "Turn a vague prompt into a strong one and compare the outputs",
    "Use AI to repurpose one idea into 5 pieces, then edit them",
    "Run an AI research/ideation session for a campaign",
    "Build 5 reusable prompt templates for recurring marketing tasks",
  ],
  questions: [
    "What can AI do faster/better, and what must stay human?",
    "How do you prompt for genuinely useful marketing output?",
    "How do you keep AI-assisted work authentic, accurate, and on-brand?",
  ],
  outputs: [
    "A library of reusable marketing prompt templates",
    "An AI content + repurposing workflow",
    "An AI research/ideation workflow",
    "Human-edited example outputs + a responsible-use note",
  ],
  mastery_questions: [
    "Explain the AI 'draft, you edit' division of labour",
    "Write a strong marketing prompt with role, context, specifics, and format",
    "Use AI to repurpose one idea into multiple formats",
    "Explain hallucination and how to guard against it",
    "Describe responsible, disclosed, ethical AI use in marketing",
  ],
  ai_assist:
    "This whole week IS about AI assist, so the meta-lesson: keep a personal prompt library (a doc of your best prompts) and refine prompts iteratively (if the first output is weak, tell the AI what to fix). The best marketers treat the AI like a fast, talented junior who needs clear direction and whose work they always edit. Direct it well, verify it, and make it sound human.",
  pre_flight: [
    "Access to an AI assistant (Claude at claude.ai, ChatGPT, or Gemini, free tiers exist)",
    "Your work from earlier weeks (to speed up with AI)",
    "Your Week 1 persona, positioning, and brand voice",
  ],
  common_mistakes: [
    "Publishing raw, unedited AI output (generic and soulless)",
    "Trusting AI facts without verifying (hallucination risk)",
    "Vague prompts that produce vague output",
    "Letting AI do the strategic THINKING instead of just the drafting",
  ],
  debug_help: [
    "Output too generic? Add specifics: the persona, brand voice, real details, and 1-2 examples of the style you want.",
    "Output feels off-brand? Give the AI your brand voice and a sample of your writing to match.",
    "Not sure if a fact is real? Do not publish it until you have verified it against a trusted source or your own data.",
  ],
  stretch: [
    "Create AI-generated marketing images (food/lifestyle) and judge where they help vs where real photos win",
    "Build an AI workflow that drafts a full week's content from your pillars in one session",
  ],
  resources: [
    "Claude, ChatGPT, or Gemini (AI assistants, free tiers available)",
    "An AI image tool (where useful, but real food photos usually win)",
    "Your earlier weeks' work to accelerate",
  ],
  days: [
    {
      number: 0,
      title: "AI as force-multiplier, and set up your tools",
      summary:
        "Today you'll learn what AI does well and badly for marketing, and set up access to an AI assistant.",
      items: [
        {
          kind: "lesson",
          title: "A talented junior who needs direction",
          body:
            "## The right mental model\n" +
            "The best way to think about AI is as a *fast, talented, tireless junior assistant*: it can draft, brainstorm, summarise, and repurpose at incredible speed and volume, but it needs clear direction, it does not know your strategy or brand, and its work always needs *your* review and editing. Treated this way, AI is a force-multiplier that makes one marketer as productive as several. Treated as a magic oracle that thinks for you, it produces generic, sometimes wrong work that embarrasses you. This week you learn to direct it well.\n\n" +
            "## What AI does WELL for marketing\n" +
            "- **Drafting at speed:** captions, emails, ad copy, blog posts, scripts, first drafts in seconds.\n" +
            "- **Ideation/brainstorming:** 50 content ideas, 20 hooks, campaign angles, on demand.\n" +
            "- **Repurposing:** turn one blog post into a reel script, a carousel, 5 captions, and an email.\n" +
            "- **Research/summarising:** summarise a market, a competitor, a long document.\n" +
            "- **Analysis help:** interpret data, structure a report, explain a metric.\n" +
            "- **Overcoming the blank page:** it always gives you a starting point to react to and improve.\n\n" +
            "## What must stay HUMAN\n" +
            "- **Strategy and judgement:** what to do and why (your Week 1 thinking). AI executes; you decide.\n" +
            "- **Brand voice and authenticity:** the real, warm, local Adwoa voice; the genuine story.\n" +
            "- **Truth and accuracy:** AI can be confidently wrong (hallucinate). You verify facts.\n" +
            "- **Taste:** knowing what is actually *good* and what fits the Ghanaian market. AI does not know Akosua; you do.\n\n" +
            "## The division of labour\n" +
            "The formula for the whole week: **AI drafts and ideates (the mechanical 80%); you direct, edit, verify, and add the human 20% that makes it actually good.** This combination, AI speed + human judgement, is dramatically more powerful than either alone, and it is exactly the skill employers are scrambling for right now. Today: set up your AI tools.",
        },
        {
          kind: "lesson",
          title: "Set up your AI tools",
          body:
            "## Get access to an AI assistant\n" +
            "The core tool is a capable AI *assistant* (a large language model). The leading options, all with free tiers to start:\n\n" +
            "- **Claude** (claude.ai, by Anthropic): excellent at writing, nuanced and natural-sounding, with a large context window (you can paste long documents). Strong for marketing copy and analysis.\n" +
            "- **ChatGPT** (by OpenAI): the most widely known, very capable, huge ecosystem.\n" +
            "- **Gemini** (by Google): integrated with Google's tools, strong and improving.\n\n" +
            "Any of these works well for marketing. Pick one to learn deeply (the skills transfer); many pros use more than one and compare. Create a free account today and run a first test prompt.\n\n" +
            "## AI image tools (use with judgement)\n" +
            "For visuals, AI image generators (and AI features inside Canva, like background removal, magic edit, and text-to-image) can create graphics and concepts fast. *But* a crucial caveat for a food business: **real photos of Adwoa's actual food almost always beat AI-generated food images**, authentic, appetising, trustworthy. Use AI images for *concepts, backgrounds, abstract graphics, or lifestyle scenes*, not to fake the product. Know where AI visuals help and where real photography wins.\n\n" +
            "## A note on tool features\n" +
            "AI is increasingly built into tools you already use, Canva (design + copy), your email tool (subject-line help), ads platforms (copy suggestions), and analytics. You do not always need a separate tool; sometimes the AI is right there. The *skill* (prompting, editing, verifying) is the same everywhere.\n\n" +
            "## Start a prompt library\n" +
            "Create a doc, `AI Prompt Library`, today. Every time you find a prompt that produces great output, save it (with notes on what it is for). This library becomes one of your most valuable assets, reusable prompts that produce consistent, quality output for recurring tasks. You will fill it this week. Today: set up your assistant, test it, and start the library.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "The best mental model for AI is a fast, talented junior who needs clear direction and whose work you always edit.",
              answer: true,
              whenRight: "Yes. AI drafts and ideates at speed; you direct, verify, and edit. That partnership is the force-multiplier, not a magic oracle.",
              whenWrong: "That is the model. Direct it clearly, review its work. It is a brilliant junior, not a replacement for your judgement.",
            },
            {
              prompt: "For a food business, AI-generated images of the food are usually better than real photos.",
              answer: false,
              whenRight: "Right, real food photos win, authentic and appetising. Use AI images for concepts/backgrounds, not to fake the product.",
              whenWrong: "Real photos win for food. AI visuals help for concepts/graphics, but authentic food shots build appetite and trust.",
            },
            {
              prompt: "Strategy, brand voice, truth, and taste should stay human, even when AI does the drafting.",
              answer: true,
              whenRight: "Yes. AI does the mechanical 80%; you keep the judgement 20% (strategy, voice, accuracy, taste). That is the division of labour.",
              whenWrong: "They should. AI executes; you decide, verify, and add the authentic human layer. That is what makes the work good.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, set up AI",
          body:
            "Get your AI toolkit ready:\n\n" +
            "- [ ] Create a free account with an AI assistant (Claude, ChatGPT, or Gemini)\n" +
            "- [ ] Run a first test prompt (e.g. 'give me 10 content ideas for a Ghanaian jollof brand')\n" +
            "- [ ] Note where AI is already built into your tools (Canva, email, etc.)\n" +
            "- [ ] Start your `AI Prompt Library` doc\n\n" +
            "Then write one sentence: which recurring marketing task (captions? ideas? research?) would save you the most time if AI helped? That is where you will start tomorrow.",
        },
      ],
    },
    {
      number: 1,
      title: "Orient, AI workflows you will build",
      summary:
        "Today you'll see the reusable AI workflows you are building this week and why workflows beat one-off prompts.",
      items: [
        {
          kind: "lesson",
          title: "Workflows, not one-offs",
          body:
            "## From random prompts to repeatable workflows\n" +
            "Most people use AI randomly, a question here, a caption there. A *marketer* builds **workflows**: documented, repeatable processes (and prompt templates) for the recurring tasks they do every week. Why? Because marketing tasks repeat (write captions, brainstorm content, research, analyse), and a good workflow turns each into a fast, consistent, high-quality process you can run again and again (and hand to someone else). Workflows are how AI delivers compounding time savings, not just one lucky output.\n\n" +
            "## The three workflows you will build\n" +
            "1. **Content creation + repurposing** (Day 3): a process to generate, draft, and repurpose content fast, then human-edit it. This is where AI saves the most time for a content-heavy business.\n" +
            "2. **Research + ideation** (Day 4): a process to research the market/competitors and generate campaign ideas, hooks, and angles on demand. AI as a tireless brainstorming partner and researcher.\n" +
            "3. **Analysis + reporting** (Day 5): a process to interpret data and draft reports faster (building on Week 9). AI as an analysis assistant.\n\n" +
            "Each workflow = a documented process + reusable prompt templates + the human-edit step. Together they let one marketer produce the output of a team, the realistic, in-demand promise of AI in marketing.\n\n" +
            "## The human-edit step is non-negotiable\n" +
            "Every workflow ends with *you*: editing for voice, verifying facts, applying judgement. Build this into the process so it is never skipped. The output of a good workflow is not 'what the AI said' but 'what the AI drafted, refined by a skilled human'. That distinction is what keeps the quality high and the work authentic, and it is what separates a marketer who uses AI well from one whose feed is full of obvious, generic AI sludge.\n\n" +
            "## Why this is the hottest skill right now\n" +
            "AI is reshaping marketing fast. The marketers in demand are those who can *use it skilfully*, more productive, more capable, while keeping quality and judgement. Demonstrating real AI workflows (not just 'I use ChatGPT') is a standout signal in today's job market. Today you frame the three workflows; the rest of the week you build them.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Building reusable AI workflows beats using AI randomly for one-off tasks.",
              answer: true,
              whenRight: "Yes. Workflows (documented process + prompt templates + human edit) turn recurring tasks into fast, consistent, repeatable wins. Compounding time savings.",
              whenWrong: "They do. Random prompting is hit-or-miss; documented workflows make AI a reliable, repeatable productivity engine.",
            },
            {
              prompt: "Every AI workflow should end with a human-edit/verify step that is never skipped.",
              answer: true,
              whenRight: "Yes. Build the edit step into the process. The output is 'AI draft refined by a skilled human', that keeps quality high and authentic.",
              whenWrong: "It should. The non-negotiable final step is your editing, voice, accuracy, judgement. Skip it and you publish generic sludge.",
            },
            {
              prompt: "Demonstrating real AI workflows is a standout signal in today's marketing job market.",
              answer: true,
              whenRight: "Yes. 'I built these AI workflows' beats 'I use ChatGPT'. Skilful AI use is exactly what employers are scrambling for now.",
              whenWrong: "It is. AI fluency is in huge demand. Showing actual workflows (not just tool names) sets you apart.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, frame the workflows",
          body:
            "Start your `AI Marketing Workflows` doc:\n\n" +
            "- [ ] Note the three workflows you will build (content+repurposing, research+ideation, analysis+reporting)\n" +
            "- [ ] For each, list the recurring tasks it will speed up\n" +
            "- [ ] Build in the human-edit/verify step for each\n" +
            "- [ ] Write one line on why AI workflows are a high-demand skill\n\n" +
            "Tomorrow: the core skill, prompt engineering for marketing.",
        },
      ],
    },
    {
      number: 2,
      title: "Prompt engineering for marketing",
      summary:
        "Today you'll learn to write prompts that get genuinely useful output, the single most important AI skill.",
      items: [
        {
          kind: "lesson",
          title: "Garbage prompt, garbage output",
          body:
            "## Why the prompt is everything\n" +
            "The quality of AI output depends overwhelmingly on the quality of your *prompt* (your instruction). A vague prompt ('write a caption for my food business') gives vague, generic output. A rich, specific prompt gives strong, usable output. The same AI, wildly different results, decided by how you ask. **Prompt engineering** (writing effective prompts) is the core skill of working with AI, and it is learnable in minutes, then refined for life.\n\n" +
            "## The anatomy of a strong marketing prompt\n" +
            "Include these elements:\n\n" +
            "1. **Role:** tell the AI who to be. 'You are an expert social media marketer for African food brands.' This focuses its 'expertise'.\n" +
            "2. **Context:** the situation and the business. 'My business is Adwoa's Kitchen, an Accra home-food brand selling jollof, grills, and a jollof spice mix.'\n" +
            "3. **Audience:** the persona (Week 1!). 'Our customer is Akosua, a busy 29-year-old Accra professional who misses home cooking.'\n" +
            "4. **The task, specifically:** not 'write a caption' but 'write an Instagram caption for a reel showing our spice mix, benefit-led, with a hook and one clear CTA to order on WhatsApp.'\n" +
            "5. **Format and constraints:** 'Under 100 words, warm and natural tone, include 5 relevant hashtags.'\n" +
            "6. **Examples (powerful):** 'Here is a caption I like, match this voice: [paste].' Examples teach the AI your style better than description.\n\n" +
            "Stack these and the output transforms from generic to genuinely usable.\n\n" +
            "## Iterate, do not accept the first draft\n" +
            "A pro rarely takes the first output. You *refine*: 'make it more playful', 'shorter', 'add a Ghanaian touch', 'give me 5 variations', 'that hook is weak, try angles based on speed and on nostalgia'. Treat it as a conversation with a junior writer, direct, react, improve. This back-and-forth is where great output comes from. The AI remembers the conversation, so each instruction builds on the last.\n\n" +
            "## Give it your real materials\n" +
            "The richest prompts include *your* actual context: paste your persona, your positioning, your brand voice, a sample of your writing, your content pillars. The more real context you give, the more the output fits Adwoa specifically (not a generic food brand). Your earlier weeks' work is prompt fuel. Today you practise turning weak prompts into strong ones and feel the difference, then save the best as templates.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A strong marketing prompt includes role, context, audience, the specific task, format, and ideally an example.",
              answer: true,
              whenRight: "Yes. Stack those elements and output transforms from generic to usable. Prompting well is the core AI skill.",
              whenWrong: "It does. Role + context + audience + specific task + format + example = strong output. Vague prompts give vague results.",
            },
            {
              prompt: "You should usually accept the AI's first output as final.",
              answer: false,
              whenRight: "Right, iterate. Refine ('shorter', 'more playful', '5 variations', 'add local flavour'). The conversation is where great output comes from.",
              whenWrong: "No, refine it. Treat it as a conversation, direct and improve. The first draft is a starting point, not the finish.",
            },
            {
              prompt: "Pasting your real persona, positioning, and brand voice into the prompt makes output fit your business specifically.",
              answer: true,
              whenRight: "Yes. Real context = output tailored to Adwoa, not a generic food brand. Your earlier weeks' work is prompt fuel.",
              whenWrong: "It does. The more of your real materials you give, the more specific and on-brand the output. Feed it your context.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, master prompting",
          body:
            "Practise prompt engineering:\n\n" +
            "- [ ] Take a vague prompt ('write a caption') and rewrite it with all 6 elements; compare the two outputs\n" +
            "- [ ] Paste your real persona/positioning/voice into a prompt and note the difference\n" +
            "- [ ] Practise iterating: refine an output 3 times to make it better\n" +
            "- [ ] Save your 2 best prompts to your Prompt Library\n\n" +
            "Tomorrow: the content creation + repurposing workflow.",
        },
      ],
    },
    {
      number: 3,
      title: "AI for content creation and repurposing",
      summary:
        "Today you'll build a workflow that uses AI to create and repurpose content fast, then human-edit it to Adwoa's voice.",
      items: [
        {
          kind: "lesson",
          title: "A month of content in an hour\n",
          body:
            "## Where AI saves the most time\n" +
            "Content is the most time-consuming, repetitive marketing work, and where AI delivers the biggest productivity win. With a good workflow, what took days (planning, drafting, and repurposing a month of content) can take an hour of AI-assisted drafting plus your editing. This is the workflow that most transforms a content-heavy business like Adwoa's. The structure: AI generates and drafts at volume; you select, edit, and add authenticity.\n\n" +
            "## The content creation workflow\n" +
            "1. **Ideate:** prompt the AI (with your pillars and persona from Week 2) for a batch of ideas: '20 content ideas across my 4 pillars for Adwoa's Kitchen, aimed at [persona].' Pick the strong ones.\n" +
            "2. **Draft:** for each chosen idea, prompt for the piece: 'Write a reel script with a hook, for [idea], benefit-led, with a CTA.' Get a fast first draft.\n" +
            "3. **Vary:** ask for variations of hooks/captions so you can pick the best.\n" +
            "4. **Edit (the crucial human step):** rewrite the draft in Adwoa's real voice, add specific local detail (a real dish, a real customer, a kitchen moment), cut the generic AI phrasing, and check it actually fits. This is where you earn your keep.\n\n" +
            "## The repurposing workflow (the big multiplier)\n" +
            "AI is brilliant at *repurposing*, turning one idea into many formats (Week 2's principle, supercharged). One workflow: take a piece (say a blog post or a strong idea) and prompt: 'Turn this into (a) a reel script, (b) a 5-slide carousel, (c) 3 Instagram captions, (d) an email, (e) 5 hooks.' In seconds you have a week of content from one idea. Then you edit each for voice and fit. This is how a solo marketer fills a content calendar without burning out, AI does the format-shifting; you do the polish.\n\n" +
            "## Keep it authentic (the constant warning)\n" +
            "The risk: lazy use produces generic, soulless content that audiences scroll past (and that increasingly all looks the same as everyone uses the same tools). The defence is always the *human edit*: real voice, real specifics, real stories. AI gives you the clay; you sculpt it. Content that combines AI's speed with genuine human authenticity is the winning formula, fast AND good. Today you build and run the content + repurposing workflow, ending every piece with your edit.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "AI is especially good at repurposing one idea into many formats (reel, carousel, captions, email).",
              answer: true,
              whenRight: "Yes. One idea becomes a week of content in seconds, then you edit each for voice. The big content multiplier.",
              whenWrong: "It is. Repurposing is where AI shines, format-shift one idea into many, then polish. A solo marketer's superpower.",
            },
            {
              prompt: "The content workflow can skip the human-edit step if the AI draft looks fine.",
              answer: false,
              whenRight: "Right, never skip the edit. Even good-looking AI drafts need real voice, specifics, and a fit check, or you publish generic content.",
              whenWrong: "Do not skip it. The human edit (voice, local detail, accuracy) is what makes content land. AI gives clay; you sculpt.",
            },
            {
              prompt: "Combining AI's speed with genuine human authenticity is the winning content formula.",
              answer: true,
              whenRight: "Yes, fast AND good. AI volume + human voice beats both slow-all-human and fast-but-generic-AI. That is the formula.",
              whenWrong: "It is. Speed from AI plus authenticity from you. Neither alone wins; the combination does.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build the content workflow",
          body:
            "Build and run the content + repurposing workflow:\n\n" +
            "- [ ] Use AI to generate 20 content ideas from Adwoa's pillars + persona; pick the best\n" +
            "- [ ] Draft 3 pieces with AI, then EDIT each into Adwoa's real voice with specific detail\n" +
            "- [ ] Take 1 idea and repurpose it into 5 formats with AI; edit each\n" +
            "- [ ] Save the workflow steps + best prompts to your library\n\n" +
            "Tomorrow: the research and ideation workflow.",
        },
      ],
    },
    {
      number: 4,
      title: "AI for research, ideation, and strategy support",
      summary:
        "Today you'll build a workflow using AI as a research and brainstorming partner, while keeping the strategic judgement yours.",
      items: [
        {
          kind: "lesson",
          title: "A tireless research and ideas partner",
          body:
            "## AI as a thinking *partner* (not thinker)\n" +
            "Beyond content, AI is a powerful partner for *research* and *ideation*, the front end of marketing work. It can summarise a market, brainstorm angles, play devil's advocate, and help you think faster and broader. The key boundary: AI helps you *think*, but the *strategic decisions* stay yours (and you verify its facts). Used this way, it is like having a tireless brainstorming partner and research assistant on call.\n\n" +
            "## The research workflow\n" +
            "1. **Market/competitor research:** 'Summarise how small food brands typically market in West Africa; what works for jollof/spice products.' Or paste a competitor's content and ask 'what is their apparent positioning and content strategy?' AI gives you a fast starting analysis to build on.\n" +
            "2. **Customer understanding:** 'What are the likely pain points, desires, and objections of [persona] when buying a jollof spice mix?' Useful for messaging, then you validate against what you actually know.\n" +
            "3. **VERIFY everything factual:** this is critical, AI can *hallucinate* (state confident but false facts, fake statistics, made-up sources). For any data, statistic, or specific claim, verify against real sources or your own analytics before using it. Use AI to *generate ideas and structure*, not as a source of truth.\n\n" +
            "## The ideation workflow\n" +
            "AI excels at quantity for brainstorming: '30 campaign ideas to grow Adwoa's Kitchen toward 10K leads', '20 hooks for the spice mix', '10 angles for a festive promotion', 'play devil's advocate: why might this campaign fail?'. It overcomes blank-page paralysis and surfaces angles you would not have thought of. *You* then apply judgement, picking the ideas that fit the strategy, the market, and the brand. AI widens the funnel of ideas; you make the choices.\n\n" +
            "## Where the human judgement stays\n" +
            "AI does not know the Ghanaian market like you do, does not know Akosua, and does not own the strategy. So use it to *accelerate and broaden* your thinking, never to *replace* it. The pattern: AI generates options and rough analysis at speed; you bring local knowledge, strategic judgement, and fact-checking. A marketer who outsources *thinking* to AI produces generic strategy; one who uses it to *augment* their thinking is dramatically more effective. Today you build the research + ideation workflow, with the verify-and-decide step baked in.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "AI can confidently state false facts (hallucinate), so factual claims must be verified before use.",
              answer: true,
              whenRight: "Yes. Verify any data, statistic, or specific claim against real sources/your analytics. Use AI for ideas and structure, not as a source of truth.",
              whenWrong: "It can, and you must verify. AI sounds confident even when wrong. Check facts yourself; you are accountable for what you publish.",
            },
            {
              prompt: "AI should make the strategic decisions for you since it can analyse quickly.",
              answer: false,
              whenRight: "Right, no. AI augments your thinking (research, ideas, options); YOU decide, using local knowledge and judgement it lacks.",
              whenWrong: "No, keep strategy human. AI widens the options and speeds analysis; you make the calls. It does not know your market.",
            },
            {
              prompt: "AI is excellent for generating many ideas quickly to overcome blank-page paralysis.",
              answer: true,
              whenRight: "Yes. '30 campaign ideas', '20 hooks', devil's advocate, AI widens the idea funnel fast. You then select the ones that fit.",
              whenWrong: "It is. AI excels at idea quantity, breaking the blank page. You apply judgement to choose the winners.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build the research workflow",
          body:
            "Build the research + ideation workflow:\n\n" +
            "- [ ] Run an AI research session (market/competitor/customer) and note what you would VERIFY\n" +
            "- [ ] Run an AI ideation session (30 campaign ideas or 20 hooks); select the best with judgement\n" +
            "- [ ] Try 'play devil's advocate' on one of your campaign plans\n" +
            "- [ ] Document the workflow with the verify-and-decide step; save the prompts\n\n" +
            "Tomorrow: AI for data analysis and reporting.",
        },
      ],
    },
    {
      number: 5,
      title: "AI for analysis and reporting",
      summary:
        "Today you'll use AI to speed up data interpretation and report-writing, building on Week 9, while you stay accountable for the conclusions.",
      items: [
        {
          kind: "lesson",
          title: "Faster insights, human judgement",
          body:
            "## AI as an analysis assistant\n" +
            "In Week 9 you learned to turn data into insights. AI can *accelerate* that: feed it your real numbers and it will spot patterns, suggest interpretations, and structure a report fast. It is like a junior analyst who works in seconds, you still direct it and own the conclusions, but it removes much of the grunt work. This pairs perfectly with the analytics skills you already have.\n\n" +
            "## The analysis + reporting workflow\n" +
            "1. **Interpret data:** paste your *real* metrics and ask: 'You are a senior marketing analyst. Here is my data: [paste real numbers]. What are the key insights and what would you recommend?' AI surfaces patterns and a starting interpretation, you then apply your judgement and business context.\n" +
            "2. **Explain/learn:** 'Explain what a 1.5% conversion rate on a food site suggests, and 3 ways to improve it.' Great for understanding and for generating options.\n" +
            "3. **Draft the report:** 'Structure these insights into an executive summary + recommendations for a non-technical business owner.' AI drafts the report skeleton fast; you refine.\n" +
            "4. **YOU verify and own it:** check the AI's interpretation against reality, it can misread data or invent explanations. The conclusions and recommendations are *yours*; you are accountable for them.\n\n" +
            "## The critical rules for AI + data\n" +
            "- **Feed it REAL numbers, never let it invent data.** AI must analyse *your* actual figures, not make up plausible ones. If you ask it to 'estimate' without data, it will fabricate, do not use that as fact.\n" +
            "- **Verify its interpretations.** AI can draw a wrong conclusion confidently. Sanity-check every insight against what you know.\n" +
            "- **Mind privacy:** do not paste sensitive customer data (personal details) into a public AI tool. Use aggregated metrics, not individual customer records.\n\n" +
            "## The payoff\n" +
            "Used well, AI lets you produce sharper analysis and cleaner reports faster, turning Week 9's skill into something you can do in a fraction of the time, while keeping the human judgement that makes it trustworthy. You analyse more, report better, and free time for action. Today you build the analysis + reporting workflow, with the verify-and-own step central.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "When using AI to analyse performance, you should feed it your real numbers, not let it invent data.",
              answer: true,
              whenRight: "Yes. AI must analyse YOUR actual figures. Asked to 'estimate' without data, it fabricates, never use that as fact.",
              whenWrong: "Feed it real data. AI will happily make up plausible numbers; that is not analysis, it is fiction. Use your actual metrics.",
            },
            {
              prompt: "You are accountable for the conclusions in an AI-assisted report, so you must verify its interpretations.",
              answer: true,
              whenRight: "Yes. AI can misread data confidently. The insights and recommendations are yours, sanity-check every one against reality.",
              whenWrong: "You own them. AI drafts and suggests; you verify and are accountable. Always check its interpretations.",
            },
            {
              prompt: "It is fine to paste individual customers' personal details into a public AI tool for analysis.",
              answer: false,
              whenRight: "Right, no. Mind privacy, use aggregated metrics, not personal customer records, in public AI tools. (The data-handling discipline applies.)",
              whenWrong: "Not fine. Do not put personal customer data into public AI tools. Analyse aggregated numbers, respect privacy.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build the analysis workflow",
          body:
            "Build the analysis + reporting workflow:\n\n" +
            "- [ ] Feed AI some real (or realistic sample) metrics and ask for insights + recommendations\n" +
            "- [ ] Verify its interpretation, correct anything wrong, and add your judgement\n" +
            "- [ ] Use AI to draft a report structure, then refine it\n" +
            "- [ ] Document the workflow with the 'real data + verify + own it' rules; save the prompts\n\n" +
            "Tomorrow: responsible AI use and assembling the workflows.",
        },
      ],
    },
    {
      number: 6,
      title: "Responsible AI use, and assemble the workflows",
      summary:
        "Today you'll set the rules for using AI responsibly and combine your work into a documented set of reusable workflows.",
      items: [
        {
          kind: "lesson",
          title: "Powerful tool, professional responsibility",
          body:
            "## Use AI responsibly\n" +
            "AI is a powerful tool, and with it comes responsibility. The professional rules:\n\n" +
            "- **Accuracy:** verify facts; never publish AI-generated claims, statistics, or 'facts' you have not checked. You are accountable for everything you put out, 'the AI said it' is no defence if it is wrong or misleading.\n" +
            "- **Authenticity + voice:** always edit to your real brand voice; never publish soulless, generic AI output. Audiences (and search engines) increasingly detect and discount it.\n" +
            "- **Originality:** use AI for drafts and ideas, not to plagiarise others' work. Make the final output genuinely yours.\n" +
            "- **Privacy:** do not feed sensitive personal/customer data into public AI tools.\n" +
            "- **Disclosure where it matters:** be honest where appropriate (e.g. AI-generated imagery should not deceptively pose as real photos of the actual product). Do not mislead customers about what is real.\n" +
            "- **No deception:** do not use AI to fake reviews, impersonate, or manufacture false social proof. Easy to do, deeply unethical, and reputation-destroying.\n\n" +
            "## The honest framing\n" +
            "Responsible AI use is not about restricting yourself, it is about *protecting your credibility and your audience's trust*, which are your most valuable assets. The marketers who win long-term with AI are those who use it to be *more* helpful, creative, and productive while keeping it accurate, authentic, and honest. Reckless AI use (publishing unchecked, generic, or deceptive content) burns the trust you spent weeks building.\n\n" +
            "## Assemble your workflows\n" +
            "Now combine the week into one documented asset: your three **AI marketing workflows** (content + repurposing, research + ideation, analysis + reporting), each with its process steps, the reusable prompt templates, the human-edit/verify step, and an example output (human-edited). Plus your responsible-use note. This is a genuinely valuable, reusable toolkit, you (or Adwoa, or a team) can run these workflows again and again. Today you set the responsible-use rules and assemble the workflows; tomorrow you ship case study #10.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "'The AI said it' is a valid defence if you publish a false claim it generated.",
              answer: false,
              whenRight: "Right, no. You are accountable for everything you publish. Verify facts; an AI hallucination you posted is your responsibility.",
              whenWrong: "It is not a defence. You own what you publish. Always verify AI claims, the accountability is yours.",
            },
            {
              prompt: "Using AI to fake reviews or manufacture social proof is an acceptable growth tactic.",
              answer: false,
              whenRight: "Right, never. Faking reviews/social proof is deeply unethical, often illegal, and reputation-destroying. Do not do it.",
              whenWrong: "Absolutely not. Deception with AI (fake reviews, impersonation) is unethical and destroys trust. Off-limits.",
            },
            {
              prompt: "Responsible AI use protects your credibility and your audience's trust, your most valuable assets.",
              answer: true,
              whenRight: "Yes. Accuracy, authenticity, honesty, those keep the trust you built. Reckless AI use burns it. Responsibility is self-interest too.",
              whenWrong: "It does. Trust is the asset. Responsible use (verify, edit, do not deceive) protects it; reckless use destroys it.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, set rules + assemble",
          body:
            "Finalise the AI toolkit:\n\n" +
            "- [ ] Write a short responsible-AI-use note (accuracy, voice, privacy, no deception, disclosure)\n" +
            "- [ ] Assemble the three workflows (process + prompt templates + human-edit step) into one doc\n" +
            "- [ ] Include one human-edited example output per workflow\n" +
            "- [ ] Confirm your Prompt Library is populated with your best prompts\n\n" +
            "Tomorrow you ship case study #10.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship it, AI marketing workflows (case study #10)",
      summary:
        "Today you'll package your reusable AI workflows and prompt library into case study #10.",
      items: [
        {
          kind: "lesson",
          title: "Ship it, the modern marketer's edge",
          body:
            "## Package case study #10\n" +
            "Present **Adwoa's Kitchen, AI Marketing Workflows**, with:\n\n" +
            "- A **challenge/approach** opener (a solo marketer needed the output of a team; you built AI workflows to multiply productivity while keeping quality and authenticity)\n" +
            "- The **three workflows** (content + repurposing, research + ideation, analysis + reporting), each documented as a repeatable process\n" +
            "- The **prompt library** (your best reusable prompts)\n" +
            "- **Before/after examples:** a vague-prompt output vs a strong-prompt-then-human-edited output, to show the skill\n" +
            "- The **responsible-use note**\n\n" +
            "## Why this is one of your most marketable case studies\n" +
            "AI fluency is, right now, one of the most in-demand skills in all of marketing, and most people only dabble. A case study showing *real, documented AI workflows* (not just 'I use ChatGPT') signals that you are a modern, force-multiplied marketer who can do more, faster, while keeping judgement, voice, and accuracy. Employers are actively seeking exactly this. It future-proofs your CV.\n\n" +
            "## The balance you have demonstrated\n" +
            "Crucially, your case study shows *balanced* AI use: speed AND quality, automation AND authenticity, AI drafting AND human judgement. That balance is the mature, valuable position, neither the luddite who refuses AI nor the lazy user who publishes unchecked sludge. You direct AI skilfully and keep the human edge. That is exactly the marketer the next decade needs. Save case study #10.\n\n" +
            "Next week: brand management. You will pull together everything into a coherent brand, a complete brand guide for Adwoa's Kitchen and the start of your *own* personal brand as a marketer, the identity layer over all the tactics you have mastered.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Showing real, documented AI workflows is more impressive than just saying 'I use ChatGPT'.",
              answer: true,
              whenRight: "Yes. Documented workflows + a prompt library + edited examples prove skilful, productive AI use, exactly what employers want now.",
              whenWrong: "It is. Anyone can name a tool; showing real workflows proves you can wield AI as a force-multiplier. That stands out.",
            },
            {
              prompt: "The valuable position is balanced AI use: speed AND quality, AI drafting AND human judgement.",
              answer: true,
              whenRight: "Yes. Neither luddite nor lazy-user. Direct AI skilfully, keep the human edge. That balance is the mature, in-demand stance.",
              whenWrong: "It is the balance. Use AI's speed but keep judgement, voice, and accuracy. That combination is what the market wants.",
            },
            {
              prompt: "AI fluency is currently one of the most in-demand skills in marketing.",
              answer: true,
              whenRight: "Yes. The field is being reshaped by AI; marketers who use it skilfully are sought after. This case study future-proofs your CV.",
              whenWrong: "It is. Skilful AI use is a top-demanded skill right now. Demonstrating it gives you a real edge.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Ship it",
          body:
            "Package and ship case study #10:\n\n" +
            "- [ ] One document titled `Adwoa's Kitchen, AI Marketing Workflows`\n" +
            "- [ ] Challenge/approach framing\n" +
            "- [ ] The three workflows, the prompt library, before/after examples, and responsible-use note, all present\n" +
            "- [ ] Saved in your `Week 10 AI` portfolio folder\n\n" +
            "Ten case studies done. Next week: brand management, the identity layer over everything.",
        },
      ],
    },
  ],
};
