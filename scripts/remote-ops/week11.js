/* Week 11 - Real client experience, part 1 (Phase: Real Client Experience) */
module.exports = {
  number: 11,
  title: "Real client experience, part 1",
  phase: "Real Client Experience",
  commitment_hours: "8, 12",
  context:
    "Theory is over. The next two weeks are reps under real conditions, because the only thing that separates someone who studied this from someone who can do it is doing it. Part 1 puts you through two engagements with different client types: a startup and an NGO. You will scope the work, gather what you need, deliver it, take feedback, and revise, exactly the way a real engagement runs.\n\n" +
    "The work itself uses everything from Weeks 1 to 10. What is new this week is operating as a real service provider: turning a vague request into a clear scope, working with incomplete information, managing a client relationship through a project, and treating critical feedback as direction rather than insult. These engagements are reviewed against a professional standard and go into your portfolio as real-context work.\n\n" +
    "The most common reason real projects fail is not skill; it is that the operator solved a different problem than the one the client actually had. This week trains you to nail the real problem first.",
  concept_check: [
    {
      q: "A client says 'I need help getting organised, can you sort it out?' What is your first move?",
      choices: [
        "Start reorganising everything immediately to show initiative",
        "Clarify the request into a specific scope: what 'organised' means to them, what success looks like, and by when",
        "Send them a long questionnaire and wait",
        "Guess what they probably mean and build it",
      ],
      correct: 1,
      explain: "Vague requests must be sharpened into a clear scope before you start. The biggest cause of failed projects is solving a different problem than the client had. Clarify first.",
    },
    {
      q: "Halfway through, the client gives blunt feedback that a deliverable misses what they wanted. How should you respond?",
      choices: [
        "Defend your work and explain why you did it that way",
        "Treat it as direction: thank them, understand specifically what is off, and revise, feedback is information, not insult",
        "Apologise profusely and feel terrible",
        "Quietly resent it and do the minimum to fix it",
      ],
      correct: 1,
      explain: "Professionals treat feedback as direction toward what the client actually needs. Get specific on what is off, revise cleanly, and the relationship strengthens.",
    },
    {
      q: "You are missing one piece of information needed to finish a task, and the client is slow to reply. What do you do?",
      choices: [
        "Stop all work until they respond",
        "Keep the rest of the project moving, make a reasonable documented assumption to proceed where you can, and flag the open question clearly",
        "Guess silently and hope it is right",
        "Do nothing and blame the client later",
      ],
      correct: 1,
      explain: "Do not let one missing piece stall everything. Progress what you can, make and flag a reasonable assumption, and keep the open question visible. Stalling silently frustrates clients.",
    },
  ],
  days: [
    {
      number: 0,
      title: "How a real engagement runs, and set up your intake",
      summary: "Understand the shape of a real client engagement, then set up how you take one on.",
      items: [
        {
          kind: "lesson",
          title: "The arc of a real engagement",
          body:
            "## From learner to provider\n" +
            "Until now you practised skills. This week you run engagements: real work for a real (or realistic) client, start to finish. The skills are the same; what is new is the professional arc around them, the thing clients actually experience and judge.\n\n" +
            "## The engagement arc\n" +
            "Every client engagement, large or small, follows the same shape:\n" +
            "1. **Scope:** turn the request into a clear, agreed definition of what you will deliver and what success looks like.\n" +
            "2. **Onboard:** gather everything you need to start, access, context, materials, preferences.\n" +
            "3. **Deliver:** do the work, communicating progress as you go (no silence).\n" +
            "4. **Review:** show the work, get feedback, and revise to hit the real need.\n" +
            "5. **Hand off / close:** deliver the finished work in a usable form, documented so the client can use it without you.\n\n" +
            "Run that arc well and clients trust you, refer you, and rehire you. Skip steps (start before scoping, go silent during delivery, get defensive at feedback) and even good work lands badly.\n\n" +
            "## Two clients this week\n" +
            "You will run two engagements with different flavours:\n" +
            "- **A startup:** fast-moving, founder-led, often ambiguous (e.g. set up a founder's inbox/calendar/task system, or coordinate a launch).\n" +
            "- **An NGO:** mission-driven, often resource-constrained, more stakeholders (e.g. build a donor/contact database, draft communications, create reporting).\n\n" +
            "Different contexts teach you to adapt your style while keeping the same professional arc.\n\n" +
            "## This week's destination\n" +
            "Two scoped, delivered, mentor-reviewed engagements in your portfolio as real-context work. These prove you do not just have skills; you can run an engagement and deliver for a client.",
        },
        {
          kind: "lesson",
          title: "Set up your engagement intake, step by step",
          body:
            "## Take on a client like a professional\n" +
            "How you start sets the tone. Set up a simple, repeatable intake so every engagement begins cleanly, this is your own SOP (Week 9) for taking on work.\n\n" +
            "**1. An engagement workspace.** For each client, a clear home (a Drive folder or Notion page) with the scope, the working files, the deliverables, and a log of communication. You built this skill in Week 2; now apply it per client.\n\n" +
            "**2. An intake checklist.** What you need before starting: the goal in one sentence, the deliverables, the deadline, the materials/access required, the client's preferences (communication, hours), and who the stakeholders are. A checklist means you never start half-blind.\n\n" +
            "**3. A scope doc template.** From Week 10, a one-pager that captures what you will deliver, by when, and what is not included, confirmed with the client before work starts.\n\n" +
            "**4. A communication plan.** Agree how and how often you will update them (e.g. a short update every few days, a check-in call at the midpoint). Decide this up front so you never go silent and they never wonder.\n\n" +
            "## Set it up for both engagements now\n" +
            "Create the workspace and intake for both your startup and NGO engagements this week. Walking in organised, with a clear intake and a place for everything, is itself a signal to the client that you are a professional who has done this before, even if this is your first time.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Starting the work before the scope is clearly agreed is usually fine if you are eager to impress.",
              answer: false,
              whenRight: "Correct. Starting before scope is agreed is how you build the wrong thing. Scope first, always, no matter how eager you are.",
              whenWrong: "It is not fine. Eagerness without a clear scope leads to wasted work on the wrong problem. Agree what 'done' means before you start.",
            },
            {
              prompt: "Agreeing a communication plan up front (how often you'll update the client) prevents you from going silent.",
              answer: true,
              whenRight: "Yes. A pre-agreed update rhythm means the client always knows where things stand and you never accidentally go quiet, which is the fastest way to lose trust.",
              whenWrong: "It does. Deciding the update cadence at the start builds in the communication that keeps a client calm and trusting throughout the engagement.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, set up two engagements",
          body:
            "Set up to run a startup engagement and an NGO engagement.\n" +
            "- [ ] Create an engagement workspace for each (folder/Notion page with scope, files, deliverables, comms log)\n" +
            "- [ ] Build an intake checklist you will use for both\n" +
            "- [ ] Draft a communication plan (cadence, channels, check-in points)\n" +
            "- [ ] Choose a concrete project for each (e.g. startup: founder inbox/calendar/task setup; NGO: donor database + comms + reporting)\n\n" +
            "Deliverable: the two workspaces, the intake checklist, and the comms plan.",
        },
      ],
    },
    {
      number: 1,
      title: "Scoping a vague request",
      summary: "Turn 'help me get organised' into a clear, agreed deliverable.",
      items: [
        {
          kind: "lesson",
          title: "Nail the real problem",
          body:
            "## Clients ask vaguely\n" +
            "Real clients rarely hand you a clean brief. They say 'I need help getting organised', 'can you sort out our socials', 'I'm drowning, just help'. Your first and most important job is to turn that fog into a specific, agreed scope, because the number one cause of failed engagements is solving a different problem than the client actually had.\n\n" +
            "## The scoping conversation\n" +
            "Sharpen the request with a few good questions (Week 1's good-question skill, applied):\n" +
            "- **What does success look like?** 'If this goes perfectly, what's different in 30 days?' This surfaces the real goal behind the vague ask.\n" +
            "- **What's the pain right now?** 'What's eating most of your time / causing the most stress?' The pain points you to the highest-value work.\n" +
            "- **What specifically do you want me to handle?** Pin down the concrete deliverables.\n" +
            "- **What's the deadline / priority?** Understand urgency and what matters most.\n" +
            "- **What does 'done' mean for each piece?** So you both agree on the finish line.\n\n" +
            "## Write the scope back to them\n" +
            "After the conversation, reflect it back in writing: 'Here's what I understand you need: [scope]. Success looks like [outcome] by [date]. This includes [X, Y, Z] and does not include [things out of scope]. Have I got that right?' This does three things: confirms you understood, catches misunderstandings before they cost time, and creates the written scope that protects you both (Week 10).\n\n" +
            "## Scope realistically\n" +
            "Do not over-promise to win the work. Scope what you can genuinely deliver well in the time. An honest 'I can do X and Y this month; Z would be a next phase' builds more trust than an over-ambitious promise you miss. Under-promise slightly and over-deliver, never the reverse.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Asking 'if this goes perfectly, what's different in 30 days?' helps uncover the client's real goal.",
              answer: true,
              whenRight: "Yes. It surfaces the outcome they actually want, behind the vague request, which is what you should scope toward.",
              whenWrong: "It does. That question reveals the real goal hiding behind 'help me get organised', so you build toward the outcome, not a guess.",
            },
            {
              prompt: "Reflecting the scope back to the client in writing before starting is unnecessary if you had a good conversation.",
              answer: false,
              whenRight: "Correct. Always write it back. It confirms understanding, catches misunderstandings early, and creates the record that protects you both. Conversations get misremembered.",
              whenWrong: "Still write it back. A good conversation can still hide a misunderstanding; the written scope confirms alignment and protects both sides when memories differ.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Scope both engagements",
          body:
            "For each engagement (startup and NGO), starting from a deliberately vague client request:\n" +
            "1. Write the 5 scoping questions you would ask.\n" +
            "2. Write the scope-back: the goal, the success outcome, the deadline, what's included, what's not.\n\n" +
            "Deliverable: the scoping questions and written scope for both engagements.",
        },
      ],
    },
    {
      number: 2,
      title: "Onboarding and gathering what you need",
      summary: "Get everything to start, without endless back-and-forth.",
      items: [
        {
          kind: "lesson",
          title: "Start fully equipped",
          body:
            "## The slow-start trap\n" +
            "A common rookie mistake: agree the scope, then discover three days in you cannot proceed because you lack a login, a file, or an answer, and the client is slow to provide it. Good onboarding gathers everything you need up front, so delivery is smooth.\n\n" +
            "## What to gather\n" +
            "Using your intake checklist (Day 0), collect at the start:\n" +
            "- **Access:** the accounts, tools, or systems you need (inbox access, the social accounts, the file drive). Handle credentials securely.\n" +
            "- **Materials:** existing files, brand assets, past examples, anything you will build on.\n" +
            "- **Context:** how things currently work, who is involved, what has been tried, any constraints. The background that stops you making naive mistakes.\n" +
            "- **Preferences:** the client's voice, style, do's and don'ts, communication and hours.\n\n" +
            "## Make it easy for the client\n" +
            "Clients are busy; a giant questionnaire gets ignored. Make onboarding low-friction: ask for what you genuinely need (not everything imaginable), grouped clearly, ideally in one go. 'To get started I need three things: access to the inbox, your brand colours/logo, and a quick note on how you like to be updated. Once I have those I'll run with it.' Specific and small gets answered fast.\n\n" +
            "## Handle access and security responsibly\n" +
            "You will often be trusted with access to a client's systems and sometimes credentials. Handle this carefully: use secure methods where possible, never share credentials carelessly, and treat the client's data with the privacy discipline from earlier weeks. Being trusted with access is a privilege; protecting it is part of being trustworthy.\n\n" +
            "## Confirm you are ready\n" +
            "Once you have what you need, confirm: 'Got everything, starting now, first update by [date].' That single message tells the client the engagement is underway and in good hands, the calm, in-control start that sets the tone for the whole relationship.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Sending the client a huge questionnaire is the best way to gather what you need.",
              answer: false,
              whenRight: "Correct. Big questionnaires get ignored. Ask for the few things you genuinely need, grouped and specific, so a busy client can answer fast.",
              whenWrong: "It backfires. A giant form is friction; busy clients skip it. Ask for the minimum you truly need, clearly, and you get a fast response.",
            },
            {
              prompt: "Gathering access, materials, and context up front prevents the project stalling mid-way.",
              answer: true,
              whenRight: "Yes. Good onboarding front-loads what you need so delivery flows, instead of stalling three days in waiting for a login or file.",
              whenWrong: "It does. The slow-start trap comes from missing pieces discovered late. Collecting them at onboarding keeps delivery smooth.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Onboard both clients",
          body:
            "For each engagement:\n" +
            "1. List exactly what you need to start (access, materials, context, preferences) from your intake checklist.\n" +
            "2. Write the low-friction onboarding message asking for it (specific, grouped, easy to answer).\n" +
            "3. Write the 'I have everything, starting now' confirmation.\n\n" +
            "Deliverable: the needs list, onboarding message, and confirmation for both.",
        },
      ],
    },
    {
      number: 3,
      title: "Delivering for a startup",
      summary: "Move fast and stay aligned in a founder-led, ambiguous environment.",
      items: [
        {
          kind: "lesson",
          title: "Operating in a startup",
          body:
            "## What startups are like\n" +
            "Startups are fast, founder-led, and often chaotic. The founder is stretched thin, priorities shift, and things are rarely fully defined. They do not want a slow, process-heavy assistant; they want someone who takes a goal and runs, fills gaps with good judgement, and makes their life lighter immediately. Your value is reducing the founder's load and bringing order without needing to be managed.\n\n" +
            "## How to deliver well here\n" +
            "- **Bias to action.** Where reasonable, do rather than ask. Make sensible decisions, document them, and flag the ones that matter. A founder loves an assistant who moves things forward.\n" +
            "- **Communicate proactively but briefly.** Short, frequent updates (Done/Doing/Blocked from Week 3) keep an anxious founder calm without eating their time.\n" +
            "- **Show early wins fast.** In the first few days, deliver something visible, a cleaned inbox, a set-up system, a handled task, so the founder immediately feels the relief. Early wins build the trust that earns you bigger responsibility.\n" +
            "- **Roll with change.** Priorities will shift. Adapt gracefully, re-confirm what matters most now, and do not be thrown. Flexibility is part of the job.\n\n" +
            "## A concrete startup deliverable\n" +
            "For your startup engagement, deliver something real and complete. For example, set up the founder's operating system: a triaged inbox with labels/filters, a managed calendar, a task board, and a simple weekly-update rhythm, the combined Weeks 2, 3, and 6 skills applied to one founder. Or coordinate a specific launch end to end. Whatever it is, finish it to a standard the founder can use immediately.\n\n" +
            "## Keep judgement at the centre\n" +
            "Moving fast does not mean reckless. The bias to action is balanced by judgement: act on the reversible, low-stakes things; check before anything costly, public, or hard to undo (the Week 5 human-in-the-loop principle). A startup wants speed AND a safe pair of hands, and showing both is how you become indispensable.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "In a startup, delivering an early visible win in the first few days builds trust quickly.",
              answer: true,
              whenRight: "Yes. A cleaned inbox or a set-up system in the first days makes the founder feel immediate relief, which earns you bigger responsibility fast.",
              whenWrong: "It does. Early wins are powerful in a startup: visible relief early builds the trust that opens the door to more important work.",
            },
            {
              prompt: "A bias to action means you should act on everything without ever checking with the founder.",
              answer: false,
              whenRight: "Correct. Act on reversible, low-stakes things; check before anything costly, public, or hard to undo. Speed is balanced by judgement.",
              whenWrong: "Not everything. Move fast on the reversible stuff, but pause for costly or irreversible decisions. A startup wants speed AND a safe pair of hands.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Deliver the startup engagement",
          body:
            "1. Define and produce a concrete startup deliverable (e.g. the founder's operating system: triaged inbox + calendar + task board + weekly-update rhythm, or a coordinated launch).\n" +
            "2. Identify one early win you delivered in the first days.\n" +
            "3. Note two decisions you made on your own judgement and one you flagged for the founder, and why.\n\n" +
            "Deliverable: the startup deliverable plus your early-win and judgement notes.",
        },
      ],
    },
    {
      number: 4,
      title: "Delivering for an NGO",
      summary: "Adapt to a mission-driven, multi-stakeholder, resource-tight context.",
      items: [
        {
          kind: "lesson",
          title: "Operating in an NGO",
          body:
            "## What NGOs are like\n" +
            "NGOs (non-profits, charities, community organisations) differ from startups in important ways: they are mission-driven (impact, not profit), often resource-constrained (small budgets, free tools matter), and usually have more stakeholders (a director, a board, funders, beneficiaries, volunteers). The work is similar, operations, communications, organisation, but the context shapes how you do it.\n\n" +
            "## How to deliver well here\n" +
            "- **Lead with the mission.** Frame your work in terms of impact: 'this donor database will help you steward relationships and raise more for the programme', not just 'a tidy spreadsheet'. Connecting your work to the mission resonates and guides good choices.\n" +
            "- **Favour free and simple tools.** Budgets are tight. The free-tool fluency from this whole course (Google Workspace, Notion, Canva free) is exactly right here. Do not propose expensive software an NGO cannot sustain.\n" +
            "- **Mind multiple stakeholders.** More people may need to see, approve, or use your work. Document clearly, make things shareable and followable (SOPs from Week 9), and communicate so the right people are informed.\n" +
            "- **Sensitivity and trust.** NGOs handle sensitive data (donors, beneficiaries, sometimes vulnerable people). Apply real privacy discipline and a respectful, careful tone.\n\n" +
            "## A concrete NGO deliverable\n" +
            "For your NGO engagement, deliver something genuinely useful. For example: a donor/contact database (clean, structured, with interaction notes, Week 7 CRM skills), a set of communications (a newsletter, donor thank-you templates, Week 1), and a simple reporting template the team can reuse. Or organise their operations with SOPs so volunteers can run things consistently. Make it complete and handover-ready, NGOs especially need work that survives staff and volunteer turnover.\n\n" +
            "## Adapt your style, keep your standard\n" +
            "The big lesson of running both a startup and an NGO engagement: you adapt your style to the context (faster and looser for the startup, more documented and stakeholder-aware for the NGO) while holding the same professional standard, clear scope, proactive communication, quality delivery, and feedback handled gracefully. That adaptability is what lets you serve any kind of client.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Proposing expensive software is usually the right move for a resource-constrained NGO.",
              answer: false,
              whenRight: "Correct. NGOs run on tight budgets; favour free, simple, sustainable tools (Google Workspace, Notion, Canva free), the exact fluency this course built.",
              whenWrong: "Wrong fit. NGOs cannot sustain costly tools. Free, simple solutions they can keep running are the right recommendation.",
            },
            {
              prompt: "You adapt your style to the client context while holding the same professional standard.",
              answer: true,
              whenRight: "Yes. Faster for a startup, more documented and stakeholder-aware for an NGO, but the standard (clear scope, proactive comms, quality, graceful feedback) stays constant.",
              whenWrong: "That is the lesson. Style flexes to context; the professional standard does not. Adaptability plus a constant bar is what lets you serve any client.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Deliver the NGO engagement",
          body:
            "1. Define and produce a concrete NGO deliverable (e.g. a donor/contact database + comms templates + a reporting template, or an operations setup with SOPs for volunteers).\n" +
            "2. Use only free tools, and note which you chose and why.\n" +
            "3. Write one sentence connecting your deliverable to the NGO's mission/impact.\n\n" +
            "Deliverable: the NGO deliverable, the tool choices, and the mission link.",
        },
      ],
    },
    {
      number: 5,
      title: "Managing the relationship and ambiguity",
      summary: "Keep the client confident and keep moving when things are unclear.",
      items: [
        {
          kind: "lesson",
          title: "Through the messy middle",
          body:
            "## The relationship is part of the deliverable\n" +
            "How the client feels during the engagement matters as much as the final output. A great deliverable handed over after weeks of silence and uncertainty lands worse than a good deliverable accompanied by calm, confident communication throughout. Managing the relationship is the work.\n\n" +
            "## Keep them confident\n" +
            "- **Proactive updates.** Stick to your communication plan. Even 'on track, nothing you need to do, full update Friday' is valuable, it tells them it is handled.\n" +
            "- **Surface issues early with a plan.** If something is harder than expected or will slip, say so early with your proposed response (Week 6 risk-flagging). Early honesty builds trust; silence then a surprise destroys it.\n" +
            "- **Make them look good.** Especially with the NGO's multiple stakeholders or a founder reporting to investors, deliver work they can confidently pass on or present. Anticipating that need marks you as senior.\n\n" +
            "## Handling ambiguity\n" +
            "Real work is full of gaps and unclear bits. Two failure modes to avoid: stalling everything until you get an answer, and guessing silently and building the wrong thing. The professional path between them:\n" +
            "1. **Progress what you can** while the unclear part is pending, do not let one gap freeze the whole project.\n" +
            "2. **Make a reasonable, documented assumption** to keep moving where you can, and flag it: 'I've assumed X to keep going, shout if that's wrong.'\n" +
            "3. **Ask a sharp, batched question** for what you genuinely cannot proceed without, framed with options where possible (Week 1's good-question skill), so the client decides in seconds.\n\n" +
            "## Read the client\n" +
            "Different clients want different things: some want frequent contact, some want to be left alone until it is done; some want detail, some want only the headline. Pay attention and adapt to how each client likes to work. Matching their preferred style makes you easy and pleasant to work with, which is half of why clients rehire and refer.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "When part of a task is unclear, the best move is to stop all work until the client clarifies.",
              answer: false,
              whenRight: "Correct. Don't freeze the whole project. Progress what you can, make and flag a reasonable assumption, and ask one sharp question for what truly blocks you.",
              whenWrong: "Don't stop everything. Keep the rest moving, proceed on a documented assumption where you can, and ask a focused question only for the real blocker.",
            },
            {
              prompt: "How the client feels during the engagement matters as much as the final deliverable.",
              answer: true,
              whenRight: "Yes. Calm, confident communication throughout is part of the deliverable. Great work after weeks of silence lands worse than good work with steady updates.",
              whenWrong: "It does. The experience of working with you, confident, communicative, in control, is half of what the client is buying and what makes them rehire.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Manage the messy middle",
          body:
            "1. Write a mid-engagement proactive update for one of your clients (on-track or flagging a small issue with a plan).\n" +
            "2. You hit an ambiguity: write how you progress what you can, the assumption you'd make and flag, and the one sharp question you'd ask.\n" +
            "3. Note how the startup founder vs the NGO director might prefer to be communicated with differently.\n\n" +
            "Deliverable: the update, the ambiguity-handling note, and the client-style comparison.",
        },
      ],
    },
    {
      number: 6,
      title: "Receiving feedback and revising",
      summary: "Turn critical feedback into a better deliverable and a stronger relationship.",
      items: [
        {
          kind: "lesson",
          title: "Feedback is direction, not insult",
          body:
            "## The professional response to criticism\n" +
            "At some point a client will say a deliverable is not right, too much, too little, missed the point, wrong tone. How you respond separates amateurs from professionals. The amateur gets defensive or crushed; the professional treats feedback as information about what the client actually needs, and uses it to deliver better.\n\n" +
            "## How to receive feedback well\n" +
            "1. **Thank them, genuinely.** Feedback is a gift, it is the client investing in getting what they want rather than quietly leaving unhappy. 'Thanks for the clear feedback' sets the right tone.\n" +
            "2. **Get specific.** Vague feedback ('it's not quite right') needs sharpening: 'Help me understand, is it the structure, the tone, the level of detail?' You cannot fix what you do not precisely understand.\n" +
            "3. **Do not defend, understand.** Resist explaining why you did it your way. The point is what they need, not why you did what you did. Listen for the real want behind the words.\n" +
            "4. **Confirm and revise.** Reflect back what you'll change ('so you'd like it shorter, with the numbers up front, got it'), then revise cleanly and promptly.\n\n" +
            "## Separate yourself from the work\n" +
            "Feedback on your work is not a verdict on you. Beginners take it personally and either crumble or resist; professionals hold the work at arm's length, 'this draft missed; the next one will hit' . That emotional separation lets you improve fast without the sting, and it is a skill you build with reps, which is exactly what this week gives you.\n\n" +
            "## Feedback strengthens relationships\n" +
            "Handled well, a round of feedback actually builds trust: the client learns you listen, adapt, and care about getting it right for them. Many strong long-term client relationships are forged in the first revision, when the client sees you take direction gracefully and come back better. So a critical note is not a setback; it is an opportunity to demonstrate exactly the reliability that makes clients keep you.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "When feedback is vague ('it's not quite right'), you should guess what they mean and just redo it.",
              answer: false,
              whenRight: "Correct. Sharpen it first: 'Is it the structure, the tone, the detail?' You cannot fix precisely what you do not precisely understand, and guessing wastes another round.",
              whenWrong: "Don't guess. Ask specific questions to pin down exactly what's off, then revise. Guessing risks missing again and burning the client's patience.",
            },
            {
              prompt: "Handling a round of feedback gracefully can actually strengthen the client relationship.",
              answer: true,
              whenRight: "Yes. The client sees you listen, adapt, and care about getting it right. Many strong long-term relationships are forged in the first revision.",
              whenWrong: "It can. Taking direction well and coming back better proves your reliability, which often deepens trust more than getting it perfect first time.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Process feedback and revise",
          body:
            "1. Imagine a client gives this feedback on a deliverable: 'This is good but not quite what I needed, it feels off.' Write the questions you'd ask to make it specific.\n" +
            "2. Given a concrete version of the feedback (e.g. 'too long and the key numbers are buried'), revise one of your week's deliverables accordingly.\n" +
            "3. Write the message confirming what you changed.\n\n" +
            "Deliverable: the clarifying questions, the revised deliverable, and the confirmation message.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship: two delivered engagements",
      summary: "Finish, document, and present both engagements.",
      items: [
        {
          kind: "lesson",
          title: "Real-context work, packaged",
          body:
            "## The week's deliverable\n" +
            "Today you finish both engagements and package them: the startup project and the NGO project, each scoped, delivered, revised on feedback, and documented in a handover-ready form. These join your portfolio as real-context work, not exercises, but engagements run end to end.\n\n" +
            "## Document and present\n" +
            "For each engagement, produce a clean final package: the deliverable itself, plus a short summary, what the client needed, what you delivered, and the outcome/impact. This summary is the seed of a case study (Week 12 goes deeper). Present the work the way you would to the client: clearly, leading with the outcome, easy to use without you.\n\n" +
            "## Why these matter most so far\n" +
            "A portfolio of practice pieces shows skill. A portfolio of delivered engagements shows you can do the actual job, run a real piece of work for a real client, from a vague request to a delivered, revised, documented result. That is what a hiring founder or a prospective client most wants to see, because it is the closest proxy to 'will this person deliver for me?'. After this week, your answer is evidenced, not promised.\n\n" +
            "## The standard\n" +
            "Three tests per engagement: the scope was clear and you delivered to it; you communicated and handled feedback like a professional throughout; and the final work is complete, documented, and usable by the client without you. Hit those across two different client types and you have proven adaptability and delivery, the heart of being a remote operations professional.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A portfolio of delivered engagements is stronger evidence than a portfolio of practice exercises alone.",
              answer: true,
              whenRight: "Yes. A run-end-to-end engagement is the closest proxy to 'will this person deliver for me?', which is exactly what a hiring client wants to see.",
              whenWrong: "It is stronger. Practice shows skill; delivered engagements show you can do the real job, scope to delivery, which is what convinces a client to hire.",
            },
            {
              prompt: "Final delivered work should be usable by the client without you having to explain it.",
              answer: true,
              whenRight: "Yes. Handover-ready, documented, clear, leading with the outcome, is the standard. Work only you can operate keeps you a bottleneck and looks unfinished.",
              whenWrong: "It should. The standard is work the client can use without you. Documented, clear, outcome-first delivery is what makes an engagement truly complete.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Final build: deliver and document both",
          body:
            "This is the Week 11 portfolio deliverable. For BOTH the startup and the NGO engagement:\n" +
            "1. Finish the deliverable to a usable, documented standard.\n" +
            "2. Write a one-page summary: what the client needed, what you delivered, how you handled feedback, and the outcome/impact.\n" +
            "3. Package each as a presentable portfolio piece.\n\n" +
            "Keep the workspaces shareable and export the summaries as PDFs. These are your first real-context portfolio engagements.",
        },
      ],
    },
  ],
  topics: [
    "The engagement arc: scope, onboard, deliver, review, hand off",
    "Scoping a vague request into a clear deliverable",
    "Onboarding and gathering what you need",
    "Delivering for a startup (fast, founder-led, ambiguous)",
    "Delivering for an NGO (mission-driven, resource-tight, multi-stakeholder)",
    "Managing the relationship and handling ambiguity",
    "Receiving feedback and revising professionally",
    "Documenting and presenting delivered work",
  ],
  tasks: [
    "Set up an intake, workspace, and comms plan for two engagements",
    "Scope a startup and an NGO engagement from vague requests",
    "Onboard both clients with low-friction requests",
    "Deliver a concrete startup operations deliverable",
    "Deliver a concrete NGO operations deliverable",
    "Handle ambiguity and a round of feedback professionally",
    "Document and present both engagements",
  ],
  project:
    "Complete two real-world engagements: a startup project (e.g. set up a founder's inbox/calendar/task system or coordinate a launch) and an NGO project (e.g. a donor database, communications, and reporting). Each is scoped, delivered, revised on feedback, documented, and added to your portfolio as real-context work.",
  exercises: [
    "Write scoping questions and a written scope for a startup and an NGO engagement",
    "Write low-friction onboarding messages for both clients",
    "Produce a concrete startup deliverable and an NGO deliverable",
    "Handle an ambiguity by progressing, assuming, and asking a sharp question",
    "Process vague feedback into specifics and revise a deliverable",
  ],
  questions: [
    "How do you scope work when the client's request is vague?",
    "What changes when the client is an NGO versus a startup?",
    "How do you respond to critical feedback professionally?",
  ],
  outputs: [
    "Two scoped and delivered client engagements",
    "Scope documents and onboarding for each",
    "Mentor-reviewable deliverables, revised on feedback",
    "Documented, presentable final packages with outcome summaries",
  ],
  mastery_questions: [
    "Turn a vague client request into a clear scope with deliverables, success, and a deadline",
    "Run an onboarding that gathers access, materials, context, and preferences with low friction",
    "Deliver a startup operations deliverable to a professional, usable standard",
    "Deliver an NGO operations deliverable using free tools, tied to the mission",
    "Ask a clarifying question (with options) that prevents a wrong assumption",
    "Progress a project despite a missing piece by assuming-and-flagging",
    "Process vague feedback into specifics and revise cleanly",
    "Communicate progress proactively through an engagement",
    "Document finished work so the client can use it without you",
    "Present an engagement's outcome and impact in one clear summary",
  ],
  ai_assist:
    "Use AI to accelerate the real work, drafting, structuring documents, summarising, building first versions, but treat these engagements as the test of your judgement and delivery. The client is paying for your reliability and decisions, not for AI text. Use it to go faster, then make every deliverable genuinely correct, specific to the client, and yours. A useful move: ask AI to play the client and critique your scope or deliverable before you send it.",
  pre_flight:
    "Before starting each engagement, write what success looks like for the client in one sentence and confirm it with them. Most failed projects fail because the operator solved a different problem than the one the client had. Get the one-sentence goal agreed before you do anything else.",
  common_mistakes: [
    "Starting work before the scope is clearly agreed",
    "Going silent during delivery instead of sending proactive updates",
    "Stalling the whole project when one piece is unclear",
    "Getting defensive at feedback instead of treating it as direction",
    "Delivering something technically complete that misses the client's real need",
  ],
  debug_help:
    "If an engagement feels stuck or off-track, go back to the one-sentence goal and re-confirm it with the client, re-aligning early is cheap, discovering at delivery that you built the wrong thing is expensive. If you are blocked on missing info, progress what you can, proceed on a flagged assumption, and ask one sharp question. If feedback stings, separate yourself from the work: the draft missed, the next will hit. Treat the revision as the chance to prove you take direction well.",
  stretch: [
    "Add a third engagement: a local business project (good warm-up for Week 12)",
    "Write a proper case study of your strongest engagement",
    "Ask the (real or mentor) client for a testimonial you can use",
  ],
  resources: [
    { label: "Notion (client workspaces)", url: "https://www.notion.so/help", note: "Free, for delivery" },
    { label: "Google Workspace", url: "https://support.google.com/a/users/", note: "Free, delivery tools" },
  ],
};
