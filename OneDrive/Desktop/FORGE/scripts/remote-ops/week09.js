/* Week 9 - Business operations and SOPs (Phase: Operations & SOPs) */
module.exports = {
  number: 9,
  title: "Business operations and SOPs",
  phase: "Operations & SOPs",
  commitment_hours: "6, 10",
  context:
    "This is the week that turns a good assistant into an operations professional. Anyone can do tasks; an operator looks at how a business runs and makes it run better, then writes it down so it runs the same way every time, with or without them. That skill, documenting and improving how work happens, is what separates a $10-an-hour helper from someone trusted to run the whole back office.\n\n" +
    "This week you learn to map workflows, write standard operating procedures (SOPs) anyone can follow, spot inefficiencies, and build an operations manual. You will document at least five core processes for Kola and propose a fix for its biggest bottleneck. By Friday you can walk into a chaotic small business and turn 'how we do things' from something in the founder's head into a system the team can run.\n\n" +
    "SOPs are also how you make yourself promotable: once your work is documented, you can hand it off and take on bigger things. Counterintuitively, writing down your job is how you grow beyond it.",
  concept_check: [
    {
      q: "Ama is the only person who knows how to process a wholesale order, and she is going on leave. What does the business need?",
      choices: [
        "Ama to just be reachable on holiday",
        "A written SOP for processing a wholesale order, so anyone can do it correctly without her",
        "To pause wholesale orders until she returns",
        "A more experienced employee",
      ],
      correct: 1,
      explain: "Knowledge trapped in one person's head is a business risk. An SOP captures the process so the work continues correctly without that person, which is the whole point of documentation.",
    },
    {
      q: "What is the test of whether an SOP is actually good?",
      choices: [
        "It is long and detailed",
        "Someone who has never done the task can follow it and get the right result without asking questions",
        "It uses professional language",
        "The founder approved it",
      ],
      correct: 1,
      explain: "A good SOP makes the writer's knowledge unnecessary. If a newcomer can follow it to the correct result with no extra help, it works. If they have to guess or ask, it has gaps.",
    },
    {
      q: "You notice the team re-enters the same order data into three different places by hand. What is the operator's move?",
      choices: [
        "Do the triple entry faster",
        "Flag the inefficiency and propose a fix (one source of truth, or a simple automation) that removes the duplicate work",
        "Accept it; that is how they have always done it",
        "Wait for the founder to notice",
      ],
      correct: 1,
      explain: "Spotting waste and proposing a concrete improvement is exactly what an operations professional does. 'That is how we have always done it' is the phrase your job exists to challenge.",
    },
  ],
  days: [
    {
      number: 0,
      title: "What an operations pro does, and set up your SOP system",
      summary: "Understand why businesses run on documented processes, then set up where your SOPs will live.",
      items: [
        {
          kind: "lesson",
          title: "Documentation is leverage",
          body:
            "## The shift this week\n" +
            "So far you have done the work: communicated, organised, supported, posted. This week you step back and work ON the business, not just IN it. An operations professional asks: how does this work actually happen, can it happen more reliably, and how do we capture it so it does not depend on any one person? That is a more senior, better-paid way of thinking, and it is learnable.\n\n" +
            "## Why businesses need SOPs\n" +
            "A standard operating procedure (SOP) is a documented way of doing a recurring task, the steps, the owner, the tools, the expected result. Businesses need them because:\n" +
            "- **Consistency:** the task is done the same correct way every time, by anyone.\n" +
            "- **Resilience:** if a person leaves or is sick, the work continues. Knowledge is not trapped in one head.\n" +
            "- **Scale:** you cannot grow or delegate what only lives in someone's memory.\n" +
            "- **Quality and training:** new people get up to speed fast, and mistakes drop.\n\n" +
            "## The operator's superpower: making yourself replaceable\n" +
            "It sounds backwards, but documenting your own work is how you advance. When your tasks are written down so someone else can do them, you free yourself to take on higher-value work, and you prove you build systems, not just complete chores. The assistant who hoards 'how I do it' stays stuck; the one who documents it gets promoted.\n\n" +
            "## This week's destination\n" +
            "You will build an operations manual for Kola: at least five core processes written as SOPs, a process map, and a proposal to fix the biggest bottleneck. That manual is portfolio artefact number nine, and 'I can document and improve your operations' is one of the highest-value things a remote operator can offer.",
        },
        {
          kind: "video",
          title: "How to Write an SOP in 9 Minutes (Standard Operating Procedure)",
          url: "https://www.youtube.com/watch?v=PZIbtQVlUnA",
          duration_min: 8,
          creator: "Simpletivity",
          difficulty: "beginner",
          why: "Scott from Simpletivity gives a clear, fast method for writing an SOP that people will actually follow. Watch it, then write your first SOP for Kola in the exercise.",
        },
        {
          kind: "lesson",
          title: "Set up your SOP system, step by step",
          body:
            "## Where SOPs live\n" +
            "An SOP no one can find is useless. Set up a single home for them now, building on your Week 2 workspace.\n\n" +
            "**1. An SOP home.** In your Drive `06 SOPs` folder (or a Notion section 'Operations Manual'), this is where every process lives. One findable place.\n\n" +
            "**2. An SOP template.** Create a reusable template doc with these fields, every SOP uses the same shape so they are easy to write and read:\n" +
            "- **Title:** the task (e.g. 'Process a wholesale order')\n" +
            "- **Purpose:** one line on what this achieves and why it matters\n" +
            "- **Owner:** who is responsible for this process\n" +
            "- **Tools needed:** what systems/accounts/access are required\n" +
            "- **Steps:** numbered, specific, in order\n" +
            "- **Expected result / done:** what success looks like\n" +
            "- **Last reviewed:** the date (so you know if it is stale)\n\n" +
            "**3. An index.** A simple list (or Notion table) of all SOPs with their owner and last-reviewed date, so anyone can see what is documented and what is current. This index is the table of contents for the operations manual.\n\n" +
            "## Why the template matters\n" +
            "A consistent template does two things: it makes writing an SOP fast (you just fill the fields), and it makes the manual navigable (every SOP looks the same, so people know where to look). It also prompts you to include the parts beginners forget, the tools needed, the owner, the 'done' definition.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Documenting your own job makes you more replaceable, which is bad for your career.",
              answer: false,
              whenRight: "Correct. It feels backwards but it is how you advance: documented work can be handed off, freeing you for higher-value work and proving you build systems.",
              whenWrong: "It is actually good for your career. Operators who document get promoted; those who hoard knowledge stay stuck doing the same tasks forever.",
            },
            {
              prompt: "Using the same template for every SOP makes the operations manual easier to write and to navigate.",
              answer: true,
              whenRight: "Yes. A consistent shape speeds writing (just fill the fields) and helps readers find what they need, every SOP looks the same.",
              whenWrong: "It does. A shared template means faster writing and a navigable manual, plus it prompts the parts people forget (tools, owner, 'done').",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, set up the SOP system",
          body:
            "- [ ] Create an SOP home (Drive folder or Notion section)\n" +
            "- [ ] Build a reusable SOP template with all the fields (title, purpose, owner, tools, steps, expected result, last reviewed)\n" +
            "- [ ] Create an SOP index (a table listing each SOP, its owner, and last-reviewed date)\n" +
            "- [ ] Write one quick SOP using the template (e.g. 'How to ship a single customer order')\n\n" +
            "Deliverable: the template, the index, and your first SOP.",
        },
      ],
    },
    {
      number: 1,
      title: "What makes a good SOP",
      summary: "The difference between an SOP people follow and one they ignore.",
      items: [
        {
          kind: "lesson",
          title: "Write for someone who knows nothing",
          body:
            "## The golden rule\n" +
            "Write the SOP for someone who has never done the task and cannot ask you. That single mindset fixes most bad SOPs, because it forces you to spell out the steps you normally do on autopilot. The expert curse, assuming a step is 'obvious', is the number one reason SOPs fail.\n\n" +
            "## What a good SOP has\n" +
            "- **Specific, ordered steps.** Not 'process the order' but '1. Open the Orders sheet. 2. Find the order by ID. 3. Confirm payment cleared in Stripe. 4. ...'. Each step is one concrete action.\n" +
            "- **No assumed knowledge.** If a step needs a login, a tool, or a piece of context, say so or link it. 'Update the tracker' assumes they know which tracker and how, name it and link it.\n" +
            "- **Decision points handled.** Real processes have forks ('if payment has not cleared, do X; if it has, do Y'). Spell out the branches so the follower is never stuck guessing.\n" +
            "- **The 'done' state.** End with what success looks like, so they know they finished correctly.\n" +
            "- **Plain language.** Short sentences, simple words. An SOP is not the place for elegant prose; it is the place for unmistakable instructions.\n\n" +
            "## Right level of detail\n" +
            "Too vague and it is useless; too detailed and no one reads it. Aim for the level a competent newcomer needs: enough that they can follow it, not so much that you are explaining how to use a mouse. When unsure, err toward more clarity on the steps that are easy to get wrong.\n\n" +
            "## Visuals help\n" +
            "Screenshots, or a short screen recording (Loom) paired with the written steps, make an SOP dramatically easier to follow for anything done on a screen. 'Click the blue Export button (see screenshot)' removes all ambiguity. You do not always need them, but for fiddly tool-based tasks they are worth the few extra minutes.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "The main reason SOPs fail is that the writer assumed some steps were too obvious to include.",
              answer: true,
              whenRight: "Yes. The expert curse: you skip steps you do on autopilot, and the newcomer gets stuck on exactly those. Write as if the reader knows nothing.",
              whenWrong: "It is the top failure. Writers omit 'obvious' steps that are not obvious to a newcomer. Spelling out every step is what makes an SOP followable.",
            },
            {
              prompt: "A good SOP handles decision points ('if X do this, if Y do that') rather than describing only the perfect path.",
              answer: true,
              whenRight: "Yes. Real processes have forks. If the SOP only covers the happy path, the follower is stuck the moment reality differs. Spell out the branches.",
              whenWrong: "It should handle forks. Tasks rarely go perfectly; an SOP that ignores the 'what if' leaves the follower guessing exactly when they need guidance.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Audit a weak SOP",
          body:
            "Here is a weak SOP: 'Processing orders: Check the orders, make sure they're paid, then send them out and update everything.'\n" +
            "1. List every gap: assumed knowledge, missing steps, undefined terms, unhandled decisions.\n" +
            "2. Rewrite it as a proper SOP using your template, written for a total newcomer (invent reasonable specifics for Kola).\n\n" +
            "Deliverable: the gap list and the rewritten SOP.",
        },
      ],
    },
    {
      number: 2,
      title: "Process mapping",
      summary: "See a workflow clearly before you document or improve it.",
      items: [
        {
          kind: "lesson",
          title: "Map the process first",
          body:
            "## Understand before you document\n" +
            "Before writing an SOP or improving a process, map it: lay out every step, in order, including the handoffs between people and the decision points. Mapping reveals what is really happening, which is often messier than anyone assumed, and you cannot improve what you do not clearly see.\n\n" +
            "## How to map\n" +
            "You do not need special software. A list, a flowchart, or boxes-and-arrows in a doc all work. For each step capture: what happens, who does it, what tool is used, and what triggers the next step. Example for Kola's order fulfilment:\n" +
            "1. Order comes in (trigger: customer checkout)\n" +
            "2. Payment confirmed (who: you; tool: Stripe)\n" +
            "3. Order logged in tracker (who: you; tool: Sheet)\n" +
            "4. Item picked and packed (who: warehouse; decision: in stock? if not, backorder branch)\n" +
            "5. Shipping label created and dispatched (who: warehouse; tool: courier site)\n" +
            "6. Customer sent tracking (who: you; tool: email)\n" +
            "7. Order marked complete\n\n" +
            "## What mapping reveals\n" +
            "Once it is laid out, problems jump out: a step done twice, a handoff where things get dropped, a manual step that could be automated, a bottleneck where everything waits on one person. Mapping is diagnosis; you cannot prescribe a fix without it. Often just drawing the map makes the founder say 'wait, why do we do that?'.\n\n" +
            "## Map the real process, not the ideal\n" +
            "Document how the work ACTUALLY happens, not how it is supposed to. The gap between the official process and the real one is where the problems live. Talk to (or watch) the people doing it; they know the workarounds and shortcuts that the official version hides. The real map is the useful one.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "You should map how a process is supposed to work, not how it actually works.",
              answer: false,
              whenRight: "Correct. Map the REAL process. The gap between official and actual is exactly where the problems and improvements hide.",
              whenWrong: "Map the real one. The ideal version hides the workarounds and bottlenecks. Documenting what actually happens is what lets you fix it.",
            },
            {
              prompt: "Mapping a process is a useful diagnostic step before trying to improve it.",
              answer: true,
              whenRight: "Yes. You cannot improve what you cannot clearly see. The map reveals duplicate steps, dropped handoffs, and bottlenecks to target.",
              whenWrong: "It is. Mapping is diagnosis: it surfaces the waste and bottlenecks so your improvement targets the real problem, not a guess.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Map a Kola process",
          body:
            "Map one core Kola process end to end (e.g. order fulfilment, handling a return, or onboarding a new supplier):\n" +
            "1. List every step in order, with who does it, the tool used, and any decision points/branches.\n" +
            "2. Mark any step that looks like waste, a bottleneck, or a risky handoff.\n\n" +
            "Deliverable: the process map with problem areas flagged.",
        },
      ],
    },
    {
      number: 3,
      title: "Writing SOPs people actually follow",
      summary: "Turn a mapped process into a clear, tested, followable document.",
      items: [
        {
          kind: "lesson",
          title: "From map to followable SOP",
          body:
            "## Map then write\n" +
            "With a process mapped (Day 2), writing the SOP is mostly translation: turn each mapped step into a clear instruction in your template. But a few things make the difference between an SOP that gets used and one that gathers dust.\n\n" +
            "## Make it action-first\n" +
            "Start each step with a verb and the exact action: 'Open...', 'Click...', 'Confirm...', 'Send...'. Action-first steps are scannable and unambiguous. Avoid passive, vague phrasing ('the order should be checked') in favour of direct instruction ('Check the order against the tracker').\n\n" +
            "## Test it by following it literally\n" +
            "The single best way to find an SOP's gaps: follow it yourself, doing ONLY what it says, nothing from memory. Every time you have to guess, add a step, or use knowledge that is not written, that is a gap, fix it. Better still, have someone who does not know the task follow it while you watch silently. Their questions are your edits. An SOP is not done when you finish writing; it is done when someone else can follow it cleanly.\n\n" +
            "## Keep it scannable\n" +
            "People use SOPs while working, glancing back and forth. Numbered steps, short lines, bold key actions, and white space make it usable. A dense paragraph of instructions is technically complete and practically useless.\n\n" +
            "## Link, do not duplicate\n" +
            "If a step relies on another process, link to that SOP rather than repeating it. This keeps each SOP focused and means you update shared steps in one place. A well-linked manual is easier to maintain than one where the same instructions are copied everywhere and drift out of sync.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "The best way to find gaps in an SOP is to follow it literally, doing only what it says.",
              answer: true,
              whenRight: "Yes. Following it with no memory exposes every assumed step and undefined term. Better yet, watch a newcomer follow it; their questions are your edits.",
              whenWrong: "It is. Literally following the SOP (or watching someone who does not know the task) reveals exactly where it assumes knowledge it never wrote down.",
            },
            {
              prompt: "If two SOPs share a step, you should copy the full instructions into both for completeness.",
              answer: false,
              whenRight: "Correct. Link instead of duplicating. Copies drift out of sync; a linked shared step is updated in one place and stays consistent.",
              whenWrong: "Link, do not copy. Duplicated instructions drift apart over time. Reference the shared SOP so there is one source to maintain.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Write and test an SOP",
          body:
            "1. Take your mapped process from Day 2 and write it as a full SOP using your template.\n" +
            "2. Test it: follow it yourself doing only what it says (or have someone else try). Note every gap you hit.\n" +
            "3. Revise it to close the gaps.\n\n" +
            "Deliverable: the tested, revised SOP plus a note of the gaps you found and fixed.",
        },
      ],
    },
    {
      number: 4,
      title: "Spotting and fixing inefficiencies",
      summary: "Find the waste and propose improvements that save real time.",
      items: [
        {
          kind: "lesson",
          title: "Process improvement",
          body:
            "## The high-value question\n" +
            "Once you can see a process clearly, ask the question that earns your keep: where is the waste, and how could this be better? Founders are too close and too busy to see it; a sharp operator who proposes concrete improvements becomes invaluable.\n\n" +
            "## Common kinds of waste to look for\n" +
            "- **Duplicate work:** the same data entered in several places by hand (e.g. an order typed into a sheet, an email, and the courier site separately).\n" +
            "- **Manual steps that could be automated:** copy-paste between tools, repetitive emails, manual reminders.\n" +
            "- **Bottlenecks:** everything waits on one person or one approval.\n" +
            "- **Unnecessary steps:** things done out of habit that no longer serve a purpose ('we've always done it this way').\n" +
            "- **Rework:** errors that cause work to be redone (often a sign of a missing check or unclear step).\n" +
            "- **Waiting and handoff delays:** time lost between steps because no one knows it is their turn.\n\n" +
            "## Propose, with the before and after\n" +
            "An improvement proposal lands when it is concrete: name the problem, quantify the cost if you can ('we spend ~3 hours a week re-entering orders'), propose the fix, and show the after ('one shared sheet that all tools read from, ~3 hours saved'). 'Things could be better' is noise; 'this specific change saves this specific time' is a decision the founder can make.\n\n" +
            "## Start small and respect the why\n" +
            "Before changing a process, understand why it works the way it does, sometimes the 'inefficient' step is a guard against a real problem. Propose improvements humbly, test them small, and measure. A reckless 'optimisation' that breaks something costs more than the waste it removed. The respected operator improves carefully, not just enthusiastically.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "An improvement proposal is strongest when it names the specific cost now and the specific saving after.",
              answer: true,
              whenRight: "Yes. 'We lose ~3 hours/week to this; this fix saves it' is a decision the founder can make. Vague 'we could improve' is just noise.",
              whenWrong: "Specifics win. Quantify the current cost and the after-state saving; that turns a vague suggestion into a concrete, approvable change.",
            },
            {
              prompt: "Before changing a process, it is worth understanding why it currently works the way it does.",
              answer: true,
              whenRight: "Yes. Sometimes an 'inefficient' step guards against a real problem. Understand the why first, or your fix may break something costly.",
              whenWrong: "Understand the why first. A step that looks pointless may prevent an error you cannot see. Improve carefully, not recklessly.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Propose a process improvement",
          body:
            "Take the process you mapped and the waste you flagged.\n" +
            "1. Pick the biggest inefficiency.\n" +
            "2. Write a short improvement proposal: the problem, its cost (estimate the time/impact), the proposed fix, and the after-state.\n" +
            "3. Note any 'why' behind the current step you checked before proposing the change.\n\n" +
            "Deliverable: the one-page improvement proposal.",
        },
      ],
    },
    {
      number: 5,
      title: "Checklists and templates",
      summary: "Lightweight tools that prevent errors and speed recurring work.",
      items: [
        {
          kind: "lesson",
          title: "Checklists: simple, powerful, underused",
          body:
            "## Why checklists work\n" +
            "Not every process needs a full SOP. For recurring tasks where the risk is forgetting a step, a checklist is the perfect tool, simple, fast, and proven. Surgeons and pilots use checklists for exactly this reason: experts forget steps under pressure, and a checklist catches it. For an operator, a launch checklist, an onboarding checklist, or a 'before I send this report' checklist prevents the small misses that erode trust.\n\n" +
            "## What makes a good checklist\n" +
            "- **Each item is a clear, checkable action** ('Confirm discount code works', not 'sale stuff').\n" +
            "- **It covers the easy-to-forget items**, not the obvious ones. The value is in catching the misses, not listing everything.\n" +
            "- **It is short enough to actually use.** A 50-item checklist gets ignored; a focused 10-item one gets used.\n" +
            "- **It lives where the work happens** (in the task, the Notion page, the doc), so it is in front of you at the moment you need it.\n\n" +
            "## Templates: do not start from blank\n" +
            "The other lightweight tool is the template: a pre-built starting point for recurring outputs. You already built communication templates (Week 1), prompt templates (Week 5), a report template, a content calendar. Templates make work faster and consistent, and they encode the right structure so quality does not depend on memory. A business with good templates for its common outputs (proposals, reports, posts, onboarding docs) runs faster and more consistently, and building them is operator work.\n\n" +
            "## Build a small library\n" +
            "Over time, assemble a library of the checklists and templates a business uses repeatedly. This library, like the SOP manual, is an asset: it captures how the business does its best work so that best work happens every time, by anyone. It is also portfolio-worthy proof that you systematise, not just execute.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Checklists are only useful for beginners; experts do not need them.",
              answer: false,
              whenRight: "Correct. Surgeons and pilots use checklists precisely because experts forget steps under pressure. A checklist catches the misses no matter how experienced you are.",
              whenWrong: "Experts need them most. Under pressure, even experts skip steps; that is exactly why high-stakes fields rely on checklists.",
            },
            {
              prompt: "A focused 10-item checklist of easy-to-forget steps is more useful than an exhaustive 50-item one.",
              answer: true,
              whenRight: "Yes. The value is catching the misses, not listing everything. A short, used checklist beats a long, ignored one.",
              whenWrong: "Shorter and focused wins. A bloated checklist gets skipped; one targeting the genuinely forgettable steps actually gets used.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Build a checklist and a template",
          body:
            "1. Build a focused checklist for a recurring Kola task that has forgettable steps (e.g. a 'launch a sale' or 'onboard a new supplier' checklist), 8 to 12 clear, checkable items.\n" +
            "2. Build one reusable template for a recurring output (e.g. a supplier purchase-order template or a weekly-report template).\n\n" +
            "Deliverable: the checklist and the template.",
        },
      ],
    },
    {
      number: 6,
      title: "Keeping documentation alive and handoffs",
      summary: "Stop docs going stale, and hand work over cleanly.",
      items: [
        {
          kind: "lesson",
          title: "Living documentation and clean handoffs",
          body:
            "## The graveyard problem\n" +
            "Most documentation dies. Someone writes SOPs in a burst, they go out of date as the business changes, people stop trusting them, and everyone goes back to asking the one person who knows. Avoiding this is what makes documentation actually worth doing.\n\n" +
            "## Keep it alive\n" +
            "- **A review cadence.** Each SOP has a 'last reviewed' date (your template). Set a light rhythm, e.g. review the manual quarterly, or whenever a process changes, and update. Your weekly review (Week 2) is a natural moment to fix anything you noticed drifting.\n" +
            "- **Update at the moment of change.** When a process changes, update its SOP then, not 'later'. A five-minute edit when you change the courier keeps the manual trustworthy.\n" +
            "- **Make updating easy.** Docs in a shared, editable place (Notion, Drive) that anyone can fix beat locked PDFs no one can touch. Lower the friction and docs stay current.\n" +
            "- **One source of truth.** Avoid copies scattered everywhere. The manual is THE place; everything links to it.\n\n" +
            "## The handoff doc\n" +
            "A special, high-value document: the handoff. When you go on leave, hand off a task, or eventually move on, a good handoff doc lets someone take over without chaos. It pulls together: what the role/task involves, the relevant SOPs, the key contacts, the logins/access (stored securely), the recurring deadlines, and anything in flight right now. A clean handoff is the mark of a true professional, it shows you think about the business continuing, not just your own convenience.\n\n" +
            "## Why this makes you trusted\n" +
            "An operator whose documentation is current and who can hand off cleanly is someone a founder can rely on completely, take a holiday, scale the team, survive a key person leaving. That reliability of the whole system, not just of you personally, is the highest form of operational trust, and it is what lets you charge more and take on more.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "The best time to update an SOP is when the process actually changes, not 'later'.",
              answer: true,
              whenRight: "Yes. A quick edit at the moment of change keeps the manual trustworthy. 'Later' is how documentation rots and people stop using it.",
              whenWrong: "Update at the moment of change. Deferring edits is exactly how docs go stale and the team drifts back to asking the one person who knows.",
            },
            {
              prompt: "A good handoff document shows you think about the business continuing, not just your own convenience.",
              answer: true,
              whenRight: "Yes. A clean handoff (SOPs, contacts, access, in-flight work) lets someone take over smoothly. It is a hallmark of a professional operator.",
              whenWrong: "It does. Preparing the work to continue without you signals real professionalism and is what lets a founder trust the whole system, not just you.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Write a handoff doc and a review plan",
          body:
            "1. Write a handoff document for your role as Kola's assistant: what the role covers, links to the key SOPs, key contacts, where access/logins are stored (described, not actual passwords), recurring deadlines, and anything in flight.\n" +
            "2. Write a one-line documentation review plan (how often, what triggers an update).\n\n" +
            "Deliverable: the handoff doc and the review plan.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship: the operations manual",
      summary: "Deliver a documented, improvable operation. Portfolio artefact #9.",
      items: [
        {
          kind: "lesson",
          title: "An operation, captured",
          body:
            "## The week's deliverable\n" +
            "Today you assemble Kola's operations manual: at least five core processes written as SOPs (order fulfilment, customer support, social posting, supplier ordering, weekly reporting), a process map, an SOP index, a checklist or two, and a process-improvement proposal for the biggest bottleneck. This is portfolio artefact number nine.\n\n" +
            "## Why this is the most 'senior' artefact yet\n" +
            "Documenting and improving how a business runs is operations-coordinator and operations-manager work, roles that pay well above general VA rates. This manual proves you do not just complete tasks; you can capture an entire operation, make it repeatable, and improve it. A founder looking at this thinks 'this person could run my back office', and that is a much bigger, better-paid job than 'this person can answer my email'.\n\n" +
            "## The standard\n" +
            "Three tests: a newcomer could run any of your SOPs without asking you a question; the manual is organised and navigable (index, consistent template, one home); and your improvement proposal names a real problem with a concrete, measured fix. Hit those and you have demonstrated the skill that turns an assistant into an operations professional.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Documenting and improving how a business runs is more senior, better-paid work than completing individual tasks.",
              answer: true,
              whenRight: "Yes. Operations coordination and management pay above general VA rates because capturing and improving the whole operation is higher-leverage than doing tasks.",
              whenWrong: "It is more senior. 'Can run my back office' is a bigger, better-paid job than 'can do my tasks'. Systems thinking is the higher-value skill.",
            },
            {
              prompt: "An operations manual passes the standard if the SOPs make sense to you, even if a newcomer would need to ask questions.",
              answer: false,
              whenRight: "Correct. The standard is that a newcomer can run any SOP without asking you. If they need to ask, it has gaps to close.",
              whenWrong: "Not enough. The whole point is that the SOPs work for someone else. If a newcomer would have to ask you, the documentation is not done.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Final build: the operations manual",
          body:
            "This is the Week 9 portfolio deliverable. Assemble for Kola:\n" +
            "1. **At least five SOPs** (order fulfilment, customer support, social posting, supplier ordering, weekly reporting), each tested and followable.\n" +
            "2. **A process map** of one core workflow.\n" +
            "3. **An SOP index** and at least one checklist and one template.\n" +
            "4. **A process-improvement proposal** for the biggest bottleneck, with the cost and the fix.\n\n" +
            "Organise it as one navigable manual. Export as a PDF (or keep a shareable Notion). This is portfolio artefact #9.",
        },
      ],
    },
  ],
  topics: [
    "Why businesses need SOPs (consistency, resilience, scale)",
    "What makes a good, followable SOP",
    "Process mapping the real workflow",
    "Writing and testing SOPs people follow",
    "Spotting inefficiencies and proposing improvements",
    "Checklists and templates",
    "Keeping documentation alive and clean handoffs",
    "Assembling an operations manual",
  ],
  tasks: [
    "Set up an SOP home, template, and index",
    "Write SOPs for a newcomer to follow",
    "Map a core business process",
    "Test an SOP by following it literally",
    "Propose a process improvement with before/after",
    "Build a checklist and a reusable template",
    "Write a handoff doc and assemble an operations manual",
  ],
  project:
    "Build Kola's operations manual: at least five core processes as SOPs (order fulfilment, support, social, supplier ordering, weekly reporting), a process map, an SOP index, a checklist and template, and a process-improvement proposal for the biggest bottleneck. Portfolio artefact #9.",
  exercises: [
    "Audit a weak SOP for gaps and rewrite it for a newcomer",
    "Map a Kola process end to end with problem areas flagged",
    "Write and test an SOP by following it literally",
    "Write a process-improvement proposal with cost and fix",
    "Build a focused checklist and a reusable template",
  ],
  questions: [
    "What makes an SOP good enough that someone new can follow it?",
    "How do you find the bottleneck in a process?",
    "Why do SOPs make you more valuable, not more replaceable?",
  ],
  outputs: [
    "At least five written, tested SOPs",
    "A process map of a core workflow",
    "A process-improvement proposal",
    "An assembled, navigable operations manual",
  ],
  mastery_questions: [
    "Write an SOP with title, purpose, owner, tools, numbered steps, and a 'done' state",
    "Map a workflow showing each step, owner, tool, and decision point",
    "Test an SOP by following it literally and fix every gap you hit",
    "Identify a bottleneck and estimate its cost in time",
    "Write a process-improvement proposal with a before and after",
    "Build a checklist of the easy-to-forget steps for a recurring task",
    "Build a reusable template for a recurring output",
    "Write a handoff doc so someone can take over a role",
    "Organise multiple SOPs into a navigable manual with an index",
    "Set a documentation review cadence that keeps it current",
  ],
  ai_assist:
    "Use AI to turn your rough notes or a mapped process into a clean, structured SOP, to suggest steps you may have forgotten ('what steps am I missing for processing an e-commerce order?'), and to spot inefficiencies in a process you describe. Ask it to rewrite an SOP at a simpler reading level so anyone can follow it. You provide the real process knowledge (AI does not know how Kola actually works); AI formats it, pressure-tests it, and drafts the manual structure. Always test the result by following it.",
  pre_flight:
    "Before documenting a process, actually do it or watch it once and note every step, including the small ones people do without thinking. SOPs fail because the writer assumed a step was obvious. Capture the real process, with its workarounds, not the idealised version.",
  common_mistakes: [
    "Writing SOPs too vaguely to actually follow ('handle the order')",
    "Assuming steps are 'obvious' and leaving them out (the expert curse)",
    "Documenting the ideal process instead of the real one",
    "Creating SOPs no one maintains, so they go stale and get ignored",
    "Improving a process before understanding why it works the way it does",
  ],
  debug_help:
    "If an SOP does not work, follow it literally, doing only what it says: every place you have to guess or add a step from memory is a gap to fix. The document should make your knowledge unnecessary. If documentation keeps going stale, your review cadence is missing or updates are deferred, update at the moment a process changes. If an improvement breaks something, you probably did not understand why the original step existed; understand the why before you change the how.",
  stretch: [
    "Record a short screen walkthrough (Loom) to pair with a written SOP",
    "Build a master index of all SOPs with owners and last-reviewed dates",
    "Propose and mock up an automation that removes a manual step entirely",
  ],
  resources: [
    { label: "Atlassian: work management", url: "https://www.atlassian.com/work-management", note: "Free reference" },
    { label: "Notion templates (SOP/wiki)", url: "https://www.notion.so/templates", note: "Free starting points" },
  ],
};
