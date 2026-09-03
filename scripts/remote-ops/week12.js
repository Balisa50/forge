/* Week 12 - Real client experience, part 2 (Phase: Real Client Experience) */
module.exports = {
  number: 12,
  title: "Real client experience, part 2",
  phase: "Real Client Experience",
  commitment_hours: "8, 12",
  context:
    "Part 2 is the deep end. You will deliver a local business project and run a full founder-assistant simulation: operating as Ama's right hand for a simulated week, juggling inbox, calendar, tasks, research, and support all at once, while a couple of urgent things go wrong. This is the closest thing to the real job, and it is where everything from Weeks 1 to 11 has to work together under realistic pressure.\n\n" +
    "The new skill this week is integration: prioritising across competing demands, switching contexts without dropping balls, and operating proactively (anticipating needs, not just reacting). You will also learn to capture your work as case studies, because the difference between having done great work and being able to prove it is the story you can tell about it.\n\n" +
    "Under load, the operators who stay calm are not the ones with the best memory; they are the ones whose system catches the balls so their head stays clear. This week tests exactly that.",
  concept_check: [
    {
      q: "It's a busy simulated day: an angry customer, a report due, a meeting to book, and the founder asking for research, all at once. What do you do first?",
      choices: [
        "Whatever landed most recently",
        "Triage by urgency and impact: handle what is time-critical and high-impact first, send holding replies on the rest, and communicate what will wait",
        "Try to do all four simultaneously",
        "The easiest one, to feel productive",
      ],
      correct: 1,
      explain: "Under load you triage by urgency and impact, not by what is loudest or easiest. Handle the critical first, acknowledge the rest with holding replies, and communicate what waits.",
    },
    {
      q: "What does operating 'proactively' look like for a founder's assistant?",
      choices: [
        "Doing exactly what you are told, quickly",
        "Anticipating needs and acting before being asked, e.g. preparing the meeting brief before the founder requests it",
        "Asking the founder what to do at every step",
        "Waiting for instructions to avoid mistakes",
      ],
      correct: 1,
      explain: "Proactive operation means anticipating what the founder will need and handling it ahead of time. That foresight is what separates a great assistant from a merely competent one.",
    },
    {
      q: "Why write case studies of your engagements?",
      choices: [
        "To pad your portfolio with text",
        "Because being able to clearly tell the story of a problem you solved (situation, action, result) is what wins the next client or job",
        "Clients require them by law",
        "They are not actually useful",
      ],
      correct: 1,
      explain: "A case study turns work you did into proof you can sell: situation, action, result. The ability to tell that story is often what lands the next opportunity.",
    },
  ],
  days: [
    {
      number: 0,
      title: "The founder-assistant role, and set up for the simulation",
      summary: "Understand what it means to be someone's right hand, then set up your system to run a full week of it.",
      items: [
        {
          kind: "lesson",
          title: "Being someone's right hand",
          body:
            "## The integrated role\n" +
            "So far you practised skills one at a time and ran focused engagements. The founder-assistant role is all of it at once: you are the person a founder relies on to keep everything running, inbox, calendar, tasks, research, support, reporting, whatever the day brings. It is the role this whole course has been building toward, and the most valuable, because you take the widest possible load off the founder.\n\n" +
            "## What changes when it is everything at once\n" +
            "- **You constantly prioritise.** With many demands, you decide what matters most, right now, all day. Prioritisation becomes your core skill.\n" +
            "- **You context-switch.** From an angry customer to a calendar to a report to research, cleanly, without dropping the thread on any of them. Your system, not your memory, holds it together.\n" +
            "- **You operate proactively.** You do not just react to requests; you anticipate what the founder will need and have it ready.\n" +
            "- **You stay calm under load.** Things go wrong; the founder watches how you handle it. Calm, communicated control is the product.\n\n" +
            "## This week's two pieces\n" +
            "1. **A local business project:** another real client type (a shop, a restaurant, a service business), often less tech-savvy, very practical needs. You scope and deliver it like Week 11.\n" +
            "2. **The founder-assistant simulation:** a simulated week as Ama's right hand, a realistic mix of daily work plus a couple of curveballs, run with your full system.\n\n" +
            "## This week's destination\n" +
            "The delivered local-business project, a completed simulation log showing how you handled a real week, and case studies of your best work, consolidating everything into a portfolio that proves you can run a founder's operations. After this, Week 13 turns it all into a job or clients.",
        },
        {
          kind: "lesson",
          title: "Set up to run a whole week, step by step",
          body:
            "## Your system is what makes this possible\n" +
            "You cannot hold a founder's entire operation in your head, that is the whole point of the systems you built. Before the simulation, get your system ready so that when the week gets busy, nothing is lost.\n\n" +
            "**1. One capture inbox.** Every incoming thing (a request, an email, an idea, a problem) lands in one place (your task board's inbox from Week 2). Under load, capture-first is non-negotiable, the moment something arrives, it goes into the system, not your memory.\n\n" +
            "**2. A daily plan with priorities.** Each morning of the simulation, turn the load into a time-blocked plan (Week 2), with your two or three most important things first. Re-plan as the day throws curveballs.\n\n" +
            "**3. A status surface for the founder.** A place (a shared board, a daily update) where Ama can see what is handled, in progress, and waiting, so she stays calm without asking.\n\n" +
            "**4. Your toolkits ready.** Your communication templates, support macros, prompt library, SOPs, all the assets you built are now your speed. Have them at hand so you respond fast.\n\n" +
            "## Rehearse the rhythm\n" +
            "Plan to run the simulation as a real working rhythm: a morning plan, focused work blocks, regular capture and triage, an end-of-day update. Set this up now so the simulation tests your operating system under pressure, which is exactly what a real founder engagement will do.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Under a heavy workload, capturing every incoming task into one system the moment it arrives is non-negotiable.",
              answer: true,
              whenRight: "Yes. When it is busy, memory fails fastest. Capture-first into one inbox is what keeps balls from dropping while you focus on the task at hand.",
              whenWrong: "It is non-negotiable. The busier it gets, the more you must trust the system over your head. Capture everything immediately, decide later.",
            },
            {
              prompt: "A founder-assistant's core skill, when handling everything at once, is constant prioritisation.",
              answer: true,
              whenRight: "Yes. With many competing demands, deciding what matters most right now, all day, is the central skill. The system holds the rest.",
              whenWrong: "It is. Doing everything is impossible; deciding what matters most at each moment is the job. Prioritisation is the founder-assistant's core muscle.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, set up the operating system",
          body:
            "- [ ] Confirm your capture inbox (one place all incoming work lands)\n" +
            "- [ ] Prepare a daily-plan template with a priorities section\n" +
            "- [ ] Set up a status surface the 'founder' can see (board or daily update format)\n" +
            "- [ ] Gather your toolkits (templates, macros, prompts, SOPs) so they're at hand\n" +
            "- [ ] Choose a local business and a concrete project for it\n\n" +
            "Deliverable: your ready operating system and the chosen local-business project.",
        },
      ],
    },
    {
      number: 1,
      title: "Prioritising across competing demands",
      summary: "Decide what matters most when everything is asking for attention.",
      items: [
        {
          kind: "lesson",
          title: "Triage like an operator",
          body:
            "## The skill that defines the role\n" +
            "When you run everything, the hardest and most valuable thing you do is decide what to work on when ten things compete. Get this right and the important things happen and the founder feels on top of it all; get it wrong and you are busy all day while the thing that mattered slips.\n\n" +
            "## Triage by urgency and impact\n" +
            "Judge each demand on two axes:\n" +
            "- **Urgency:** how time-sensitive is it? (A customer's event tomorrow; a payment failure; a report due in an hour.)\n" +
            "- **Impact:** how much does it matter to the goal/business? (A big client at risk vs a minor formatting tweak.)\n\n" +
            "Roughly: do the urgent-and-high-impact first; schedule the important-but-not-urgent (and protect that time, this is where the valuable proactive work lives); knock out or batch the quick low-impact things; and question or drop the low-urgency, low-impact noise. The classic trap is spending the day on urgent-but-trivial things while the important-not-urgent work (that actually moves the business) never gets done.\n\n" +
            "## Communicate what waits\n" +
            "You cannot do everything at once, and that is fine, as long as you communicate. When you prioritise one thing over another, send a holding reply on what waits: 'On it, will have this to you by 2pm' or 'Got your request, I'm handling an urgent customer issue first, yours by end of day, shout if it's more urgent.' Communicated triage feels handled; silent triage feels ignored. The difference is one sentence.\n\n" +
            "## Re-prioritise as the day changes\n" +
            "A plan made at 9am rarely survives to noon. New urgent things land; priorities shift. Re-triage calmly when they do, do not rigidly stick to a stale plan, and do not panic. The skill is fluid, judgement-based reprioritising, all day, while keeping the founder informed of what that means for their expectations.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "The classic trap is spending all day on urgent-but-trivial tasks while important-not-urgent work never gets done.",
              answer: true,
              whenRight: "Yes. Urgency screams; importance whispers. Protecting time for important-not-urgent work (the proactive, business-moving stuff) is what separates great operators.",
              whenWrong: "It is the classic trap. The loud urgent-trivial things eat the day while the important work that actually matters keeps getting deferred. Protect it.",
            },
            {
              prompt: "When you prioritise one task over another, sending a quick holding reply on what waits makes the difference between feeling handled and feeling ignored.",
              answer: true,
              whenRight: "Yes. Communicated triage feels handled; silent triage feels ignored. One sentence ('on it, yours by 2pm') is the whole difference.",
              whenWrong: "It does. You can't do everything at once, but a holding reply tells people they're not forgotten. Silence is what makes triage feel like neglect.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Triage a chaotic morning",
          body:
            "It's 9am for Ama and these all land at once: a furious customer whose order is for an event tomorrow; the monthly report due to a partner by noon; three new customer questions; Ama asking for quick research on a new courier; a supplier needing a deposit confirmed; and a teammate blocked waiting on you.\n" +
            "1. Order them by what you'd do, with a one-line reason each (urgency x impact).\n" +
            "2. Write the holding replies you'd send for the things that must wait.\n\n" +
            "Deliverable: the prioritised order with reasons and the holding replies.",
        },
      ],
    },
    {
      number: 2,
      title: "Context-switching without dropping balls",
      summary: "Move between very different tasks while keeping every thread.",
      items: [
        {
          kind: "lesson",
          title: "Switching cleanly",
          body:
            "## The cost of switching\n" +
            "A founder-assistant switches contexts constantly: a tense customer reply, then a calendar, then a spreadsheet, then research, then a quick decision. Each switch has a cost, a moment of 'where was I?', and the risk that something half-done gets forgotten. Managing that cost is a real skill.\n\n" +
            "## How to switch without dropping anything\n" +
            "- **Close the loop or capture the open thread before you switch.** If you must leave a task half-done, write down exactly where you stopped and the next step, in the task. Then when you return, you resume instantly instead of reconstructing. Never leave an open thread only in your head when you switch.\n" +
            "- **Batch similar work when you can.** Instead of switching for every single email, batch all email into a block, all calls into another. Fewer switches, less cost. Some interruptions are unavoidable; reduce the avoidable ones.\n" +
            "- **Protect focus for the deep task.** When something needs real concentration (a report, a plan), defend a block for it and let the routine queue, you will do the routine faster afterward anyway.\n" +
            "- **Trust the system, not your head.** With everything captured (Day 0), switching is safe: nothing is lost because nothing lives only in your memory. This is why the system matters most exactly when it is busy.\n\n" +
            "## The end-of-task habit\n" +
            "When you finish (or pause) any task, take three seconds: update its status, note any follow-up, and glance at what's next. This tiny ritual keeps the whole operation current and means you always know your real state, no nasty surprises, no 'I completely forgot about that'.\n\n" +
            "## Calm is a choice the system enables\n" +
            "Frantic switching, where you feel scattered and afraid of forgetting, comes from relying on memory. Calm switching comes from trusting a system that holds everything. The founder feels which one you are: a scattered assistant makes them nervous; a calm one, who clearly has it all captured, makes them relax. Your system is what produces that calm.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Before switching away from a half-done task, you should note where you stopped and the next step.",
              answer: true,
              whenRight: "Yes. Capturing the open thread means you resume instantly and never forget it. Leaving it only in your head is how half-done work gets dropped.",
              whenWrong: "You should. A quick 'stopped here, next step is X' note lets you return cleanly and guarantees the task is not forgotten in the shuffle.",
            },
            {
              prompt: "Calm context-switching comes from a good memory, not from a system.",
              answer: false,
              whenRight: "Correct. Calm comes from trusting a system that holds everything; relying on memory is what makes switching frantic and risky. The system produces the calm.",
              whenWrong: "It comes from the system, not memory. When everything is captured, switching is safe and calm. Memory-reliance is exactly what makes it frantic.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Switch cleanly through a sequence",
          body:
            "Simulate a sequence: you're writing the monthly report when (1) an urgent customer email arrives, then (2) Ama pings for a quick decision, then (3) you return to the report.\n" +
            "1. Write what you capture/note at each switch so nothing is dropped.\n" +
            "2. Describe how you'd batch or protect focus to minimise the switching cost.\n\n" +
            "Deliverable: the switch-notes for each transition and your batching/focus approach.",
        },
      ],
    },
    {
      number: 3,
      title: "Operating proactively",
      summary: "Anticipate needs and act before being asked.",
      items: [
        {
          kind: "lesson",
          title: "Anticipation is the senior skill",
          body:
            "## Reactive vs proactive\n" +
            "A competent assistant does what they are asked, well. A great one anticipates what will be needed and handles it before being asked. That foresight is the single biggest thing that elevates an assistant from helpful to indispensable, and it is what justifies higher trust and higher pay.\n\n" +
            "## What proactive looks like\n" +
            "- **Prepare ahead.** The founder has a meeting at 2pm? The brief, the relevant docs, and any prep are ready on their desk by 1pm, without them asking. They mention a supplier visit next month? You've started the itinerary.\n" +
            "- **Spot and surface issues early.** You notice a deadline that will collide, a customer going quiet, a low-stock item that will sell out, and you flag it (with a suggestion) before it becomes a fire.\n" +
            "- **Remove future friction.** You see a question customers keep asking and propose an FAQ; you notice a recurring manual task and suggest a fix (Weeks 7 and 9). You're improving the operation, not just running it.\n" +
            "- **Think one step ahead.** For every task, ask 'what will the founder need next because of this?' and tee it up. Booked the flight? Prepare the itinerary. Finished the report? Draft the message that sends it on.\n\n" +
            "## How to become proactive\n" +
            "Proactivity grows from understanding the business and the founder. The more you learn how Ama works, what she cares about, what's coming up, the better you anticipate. Keep a running awareness (your notes, the calendar, the patterns you see) and regularly ask yourself 'what's coming that I could get ahead of?'. Early on you'll anticipate a little; with familiarity, a lot.\n\n" +
            "## Proactive, not overstepping\n" +
            "There's a line: anticipate and prepare, but do not make significant or irreversible decisions that are the founder's to make. The skill is teeing things up and surfacing options ('I noticed X and drafted a response, want me to send it?'), so the founder gets the benefit of your foresight while keeping the decisions that are theirs. That balance, initiative with judgement, is exactly what the most trusted operators master.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Anticipating what a founder will need and preparing it before they ask is what elevates an assistant from helpful to indispensable.",
              answer: true,
              whenRight: "Yes. Foresight is the senior skill. Having the meeting brief ready before it's requested is what earns the highest trust and pay.",
              whenWrong: "It is the elevating skill. Reacting well is good; anticipating and preparing ahead is what makes a founder feel they can't run things without you.",
            },
            {
              prompt: "Being proactive means making the founder's significant decisions for them to save their time.",
              answer: false,
              whenRight: "Correct. Anticipate and tee things up, but keep the founder's decisions theirs. Surface options ('I drafted this, want me to send it?'); don't overstep on irreversible calls.",
              whenWrong: "That oversteps. Proactivity is preparing and surfacing options, not making the founder's big or irreversible decisions. Initiative with judgement is the balance.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Practise anticipation",
          body:
            "For each situation, write the proactive move (what you'd prepare or surface before being asked):\n" +
            "1. Ama has an investor call Thursday.\n" +
            "2. A best-selling product is down to 12 units.\n" +
            "3. The same customer question has come up five times this week.\n" +
            "4. Ama mentioned wanting to 'do something for the holidays' next month.\n\n" +
            "For each, also note where you'd stop and surface a decision rather than act alone. Deliverable: the four proactive moves with their decision-points.",
        },
      ],
    },
    {
      number: 4,
      title: "Delivering for a local business",
      summary: "Serve a practical, often less tech-savvy client well.",
      items: [
        {
          kind: "lesson",
          title: "Operating for a local business",
          body:
            "## A different client again\n" +
            "A local business, a shop, a restaurant, a salon, a tradesperson, is another flavour of client. Often the owner is very busy with the hands-on work, less comfortable with tech, and has practical, immediate needs rather than abstract strategy. The opportunity is huge: many local businesses are drowning in admin and have never considered remote help.\n\n" +
            "## How to deliver well here\n" +
            "- **Be practical and concrete.** They want problems solved, not jargon. 'I'll set up online booking so you stop losing appointments to missed calls' beats 'I'll optimise your customer-acquisition funnel'. Speak their language.\n" +
            "- **Keep it simple and low-maintenance.** A less tech-savvy owner needs solutions they can actually use and sustain. Favour the simplest tool that works, and document it plainly (Week 9 SOPs, written for someone non-technical).\n" +
            "- **Show quick, tangible wins.** Sort their inbox, set up a booking system, organise their supplier orders, something they feel immediately. Local owners are sceptical of 'online help'; a fast concrete result wins them over.\n" +
            "- **Respect how they work.** They built the business their way; come in helping, not lecturing. Understand their reality (busy, hands-on, practical) and fit your help to it.\n\n" +
            "## A concrete local-business deliverable\n" +
            "Pick a real, useful project. Examples: set up and organise their customer enquiries (a simple inbox + response system + a booking or order process); build a basic system to track orders/appointments/stock; create simple social media or a Google Business Profile presence; or document their key processes so a new staff member can be trained. Deliver one of these fully and simply, with plain documentation they can keep using.\n\n" +
            "## Why this client type matters for you\n" +
            "Local businesses are an accessible, often-overlooked market, especially close to home. Serving one well proves you can adapt to a non-technical, practical client and deliver real, felt value, and it may be exactly where your first paying clients come from. Adapting across a startup, an NGO, and a local business shows the full range that makes you hireable anywhere.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "With a less tech-savvy local business owner, you should favour the simplest tool that works and document it plainly.",
              answer: true,
              whenRight: "Yes. They need solutions they can actually use and sustain. Simple tools plus plain, non-technical documentation is what serves them, not the fanciest option.",
              whenWrong: "Simple wins here. A non-technical owner needs maintainable solutions and clear plain-language docs, the fanciest tool they can't sustain is useless.",
            },
            {
              prompt: "Speaking in marketing jargon ('optimise your acquisition funnel') impresses a local business owner.",
              answer: false,
              whenRight: "Correct. It alienates them. Be concrete: 'I'll set up online booking so you stop losing appointments.' Plain, practical language earns their trust.",
              whenWrong: "It does the opposite. Jargon creates distance. Local owners respond to concrete, practical descriptions of the problem you'll solve.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Deliver the local-business project",
          body:
            "1. Choose a local business type and a concrete, practical project (e.g. enquiry/booking system, order tracking, simple social presence, process docs for staff).\n" +
            "2. Deliver it fully and simply, using sustainable tools.\n" +
            "3. Write plain, non-technical documentation the owner could follow.\n" +
            "4. Note one quick tangible win you delivered early.\n\n" +
            "Deliverable: the delivered project, the plain documentation, and the early-win note.",
        },
      ],
    },
    {
      number: 5,
      title: "Performing under pressure",
      summary: "Stay calm and effective when things go wrong mid-week.",
      items: [
        {
          kind: "lesson",
          title: "When the curveballs come",
          body:
            "## Real weeks have fires\n" +
            "No real week goes to plan. Mid-simulation, things will go wrong: a furious customer escalates, the website goes down, a supplier cancels, two deadlines collide, the founder dumps an urgent new priority on you at 4pm. How you handle pressure is what a founder is really paying to find out, because the calm days do not need you nearly as much as the chaotic ones.\n\n" +
            "## The under-pressure playbook\n" +
            "1. **Pause and assess, do not react blindly.** Ten seconds to see the whole picture beats instantly grabbing the loudest thing. What's actually most urgent and important?\n" +
            "2. **Triage and sequence** (Day 1). Handle the critical first; hold the rest with quick replies.\n" +
            "3. **Communicate proactively.** Tell the founder what's happening, what you're doing, and what (if anything) you need from them: 'Website's down, I've contacted the host and posted a holding note on social, will update you in 20 min.' A founder who knows you're on it relaxes; one in the dark panics.\n" +
            "4. **Protect the essentials, let the non-essentials slip, on purpose.** Under real pressure you may not get everything done. Consciously protect what matters most and let the trivial wait, communicating that, rather than dropping things at random.\n" +
            "5. **Keep your system current even while busy.** Capture the new things; don't let the chaos blow up your whole operation. The system is what lets you absorb a shock without losing the rest.\n\n" +
            "## Your calm is the deliverable\n" +
            "When everything is on fire, the founder takes their emotional cue from you. If you're visibly panicking, they panic. If you're calm, clear, and communicating ('here's what happened, here's what I'm doing, here's when I'll update you'), they trust that it's handled, and that trust is worth more than any single task. Cultivating that steadiness, real or practised, under pressure is the mark of a senior operator.\n\n" +
            "## After the fire\n" +
            "Once it's resolved, close the loop (confirm it's fixed) and, where useful, note what would prevent or speed up handling it next time (a backup plan, a contact, an SOP). Turning a crisis into a slightly better-prepared operation is exactly the proactive, systems-minded thinking that makes you valuable.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "When a crisis hits, the founder takes their emotional cue from how you handle it.",
              answer: true,
              whenRight: "Yes. Your calm (or panic) is contagious. A clear, communicating operator makes the founder trust it's handled; a frantic one makes them panic too.",
              whenWrong: "They do. In a crisis your composure sets the tone. Calm, clear communication signals 'handled'; visible panic spreads. Your steadiness is the deliverable.",
            },
            {
              prompt: "Under real pressure, consciously letting trivial tasks slip (and saying so) is better than dropping things at random.",
              answer: true,
              whenRight: "Yes. Deliberately protecting the essentials and communicating what waits beats silent random dropping. Intentional triage under pressure is the skill.",
              whenWrong: "It is better. You may not get everything done in a crisis; choosing what slips and saying so is professional, dropping things randomly and silently is not.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Handle a mid-week crisis",
          body:
            "Mid-simulation, two things hit at once: the website goes down during a sale, AND a major wholesale customer emails threatening to cancel a large order over a delay.\n" +
            "1. Write your first 30 minutes: assess, triage, the actions you take, and the holding communications.\n" +
            "2. Write the proactive update you send Ama.\n" +
            "3. Note one 'after the fire' improvement (a backup plan or SOP) you'd add.\n\n" +
            "Deliverable: the crisis-response plan, the founder update, and the improvement note.",
        },
      ],
    },
    {
      number: 6,
      title: "Capturing your work as case studies",
      summary: "Turn what you did into stories that win the next opportunity.",
      items: [
        {
          kind: "lesson",
          title: "The story is what sells",
          body:
            "## Doing the work is not enough\n" +
            "You've now done a lot of real work. But work nobody knows about wins you nothing. The bridge from 'I did good work' to 'someone hires me because of it' is the case study: a clear, short story of a problem you solved. Learning to tell these well is as important as doing the work.\n\n" +
            "## The case-study formula: situation, action, result\n" +
            "Every strong case study (and every strong interview answer, Week 13) follows this shape:\n" +
            "- **Situation:** the problem or context. 'Ama's inbox had 300 unread emails and she was missing customer orders.'\n" +
            "- **Action:** what YOU did, specifically. 'I built a label-and-filter triage system, cleared the backlog to zero, and set up a daily processing routine and a weekly update.'\n" +
            "- **Result:** the outcome, ideally concrete. 'Inbox stays at zero, no orders missed since, and Ama got back ~5 hours a week.'\n\n" +
            "Situation, action, result. Short, specific, outcome-focused. That structure turns work into proof.\n\n" +
            "## Quantify where you can\n" +
            "Numbers make a case study credible: hours saved, backlog cleared, response time cut, tickets reduced, orders handled, a launch delivered on time. Even rough, honest figures ('cut the report time from ~90 minutes to ~20') are far more persuasive than 'made things more efficient'. Where you don't have numbers, a concrete before/after still works ('from a chaotic inbox to inbox zero, every day').\n\n" +
            "## Keep them honest and specific\n" +
            "A case study is only as good as its truth. Use real (or realistic, for these simulations) details and outcomes, never inflate. Specific and honest beats grand and vague every time, and you'll have to back it up in an interview. The good news: after this course you have ten real artefacts and these engagements to draw genuine case studies from, which most beginners cannot do.\n\n" +
            "## Write a few now\n" +
            "Turn your strongest pieces of work, the communication toolkit, an inbox transformation, the operations manual, a delivered engagement, the crisis you handled, into short situation-action-result case studies. These become the backbone of your portfolio, profile, and interview answers in Week 13.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A strong case study follows situation, action, result, and quantifies the outcome where possible.",
              answer: true,
              whenRight: "Yes. Situation-action-result with a concrete number ('saved ~5 hours/week') turns work into credible proof that wins the next opportunity.",
              whenWrong: "That's the formula. Situation, action, result, with figures where you can, is what makes a case study persuasive rather than a vague claim.",
            },
            {
              prompt: "It's fine to inflate the results in a case study to make it more impressive.",
              answer: false,
              whenRight: "Correct. Never inflate, you'll have to back it up in an interview, and specific honest results beat grand vague ones. Truth is the case study's value.",
              whenWrong: "No. Inflation backfires when you can't defend it. Honest, specific outcomes are both more credible and more persuasive than exaggerated claims.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Write three case studies",
          body:
            "Pick three of your strongest pieces of work (from the whole course and these engagements). For each, write a short case study:\n" +
            "1. Situation (the problem/context).\n" +
            "2. Action (specifically what you did).\n" +
            "3. Result (the outcome, quantified or concrete before/after).\n\n" +
            "Keep each to a short paragraph, honest and specific. Deliverable: three situation-action-result case studies.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship: simulation complete, portfolio consolidated",
      summary: "Finish the simulation and pull everything into one portfolio.",
      items: [
        {
          kind: "lesson",
          title: "Everything, working together",
          body:
            "## The week's deliverable\n" +
            "Today you complete the founder-assistant simulation and consolidate your work: the delivered local-business project, a simulation log (how you ran the week, prioritised, switched, operated proactively, and handled the crisis), and your case studies, all pulled into one coherent portfolio of real work.\n\n" +
            "## The simulation log\n" +
            "Write up the simulated week honestly: what the week threw at you, how you prioritised the chaotic morning, how you handled the crisis, where you operated proactively, and what you'd do better. This reflection is not busywork, it cements the integrated skill and gives you rich, specific material for interviews ('tell me about a time you handled competing priorities under pressure', you have a real answer now).\n\n" +
            "## Consolidate the portfolio\n" +
            "You now have a lot: ten skill artefacts (Weeks 1 to 10) plus real engagements (startup, NGO, local business) and a founder simulation. Pull them into one organised portfolio, grouped and labelled, each with a short case-study note. This is the body of evidence Week 13 will turn into a CV, a LinkedIn profile, and a portfolio site. Organising it now means Week 13 is assembly, not scramble.\n\n" +
            "## What you've proven\n" +
            "Stepping back: you can communicate, organise, run an inbox and calendar, research, use AI, manage projects, run support, manage social, document operations, handle the business of remote work, AND deliver for different client types while running everything at once under pressure. That is a genuinely capable remote operations professional. The simulation is the proof that it all works together, not just as separate skills.\n\n" +
            "## The standard\n" +
            "Three tests: the local-business project is delivered and documented; the simulation log honestly shows you prioritising, switching, anticipating, and staying calm under pressure; and the consolidated portfolio is organised, labelled, and case-studied, ready to present. Hit those and you walk into Week 13 with everything you need to get hired or land clients.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Writing an honest reflection on the simulation gives you real material for interview questions about handling pressure.",
              answer: true,
              whenRight: "Yes. 'Tell me about a time you juggled competing priorities under pressure' now has a real, specific answer from your logged simulation. Reflection turns experience into stories.",
              whenWrong: "It does. The log becomes interview gold: concrete situation-action-result stories about prioritising and handling crises, drawn from what you actually did.",
            },
            {
              prompt: "Consolidating the portfolio now makes Week 13 (career launch) assembly rather than a scramble.",
              answer: true,
              whenRight: "Yes. With artefacts organised, labelled, and case-studied, Week 13 is just assembling them into a CV, profile, and site, not hunting and writing from scratch.",
              whenWrong: "It does. Organising the evidence now means the career-launch week is smooth assembly. Leaving it scattered makes Week 13 a frantic scramble.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Final build: simulation + consolidated portfolio",
          body:
            "This is the Week 12 deliverable. Produce:\n" +
            "1. **The delivered local-business project**, documented plainly.\n" +
            "2. **A founder-assistant simulation log**: the week's events, how you prioritised the busy morning, handled the crisis, operated proactively, and what you'd improve.\n" +
            "3. **A consolidated portfolio**: all your artefacts and engagements organised, labelled, each with a short case-study note.\n\n" +
            "Keep it shareable and export key pieces as PDFs. This completes your real-context portfolio, ready for Week 13.",
        },
      ],
    },
  ],
  topics: [
    "The integrated founder-assistant role",
    "Prioritising across competing demands (urgency x impact)",
    "Context-switching without dropping balls",
    "Operating proactively and anticipating needs",
    "Delivering for a local business",
    "Performing and communicating under pressure",
    "Writing case studies (situation, action, result)",
    "Consolidating a portfolio of real work",
  ],
  tasks: [
    "Set up your full operating system for a simulated week",
    "Prioritise a chaotic morning by urgency and impact",
    "Context-switch cleanly with captured open threads",
    "Practise proactive anticipation with decision-points",
    "Deliver a practical local-business project",
    "Handle a mid-week crisis calmly and communicate it",
    "Write situation-action-result case studies and consolidate the portfolio",
  ],
  project:
    "Complete the local-business project and a founder-assistant simulation: operate as Ama's right hand for a simulated week, handling a live mix of inbox, calendar, tasks, research, support, and reporting plus a crisis, while delivering a local-business engagement in parallel. Capture it all as case studies and a consolidated portfolio.",
  exercises: [
    "Prioritise a chaotic morning with reasons and holding replies",
    "Write switch-notes through a context-switching sequence",
    "Write four proactive moves with their decision-points",
    "Deliver a practical local-business project with plain documentation",
    "Write a crisis-response plan, a founder update, and three case studies",
  ],
  questions: [
    "How do you prioritise when everything feels urgent?",
    "What does operating proactively look like in practice?",
    "How do you keep quality high while context-switching?",
  ],
  outputs: [
    "A delivered local-business project",
    "A founder-assistant simulation log",
    "Situation-action-result case studies",
    "A consolidated, presentable portfolio of real work",
  ],
  mastery_questions: [
    "Prioritise a list of competing tasks by urgency and impact and justify the order",
    "Send holding replies that make triaged-aside tasks feel handled, not ignored",
    "Capture an open thread before switching tasks so nothing is dropped",
    "Identify a proactive move you'd make before being asked, and its decision-point",
    "Deliver a practical local-business project with non-technical documentation",
    "Run a simulated busy day handling inbox, calendar, tasks, and support together",
    "Respond to a mid-week crisis: assess, triage, act, and communicate calmly",
    "Write a situation-action-result case study with a quantified or concrete result",
    "Consolidate artefacts and engagements into an organised, labelled portfolio",
    "Reflect on a simulated week and name your two biggest growth areas",
  ],
  ai_assist:
    "Use AI as your operating partner during the simulation: rapid drafting, summarising long threads, converting time zones, turning your notes into reports and case studies. Ask it to draft a situation-action-result case study from your bullet points, then make it honest and specific. The simulation tests whether you can run real operations fast and well under pressure; AI is part of how a modern operator moves quickly. Own every output, and keep your judgement, especially the prioritisation and the crisis calls, firmly human.",
  pre_flight:
    "Before the simulation, set up your daily plan and your capture system so nothing gets lost when things get busy. The operators who stay calm under load are the ones whose system catches the balls, not their memory. Decide in advance how you'll triage and how often you'll update the founder.",
  common_mistakes: [
    "Reacting to whatever is loudest instead of what matters most",
    "Letting one urgent fire cause three other things to slip silently",
    "Only doing what is asked, never anticipating what's next",
    "Panicking visibly in a crisis instead of communicating calm control",
    "Finishing the work but never packaging it as case studies",
  ],
  debug_help:
    "If the simulation feels overwhelming, that is the point, and the fix is the system, not heroics. Triage by urgency and impact, communicate what will wait, and trust your capture system to hold everything. If you keep dropping things when switching, you're relying on memory, note the open thread before every switch. If a crisis rattles you, slow down ten seconds to assess before acting, and remember the founder takes their cue from your calm. Calm, communicated triage under pressure is exactly the skill being tested.",
  stretch: [
    "Add a fourth engagement type you haven't tried yet",
    "Get a testimonial or reference from a real or mentor 'client'",
    "Record a short video walkthrough of your consolidated portfolio",
  ],
  resources: [
    { label: "Notion (portfolio + delivery)", url: "https://www.notion.so/help", note: "Free" },
    { label: "Loom (walkthroughs)", url: "https://www.loom.com/", note: "Free tier" },
  ],
};
