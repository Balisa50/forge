/* Week 6 - Project and task management (Phase: Team Operations) */
module.exports = {
  number: 6,
  title: "Project and task management",
  phase: "Team Operations",
  commitment_hours: "6, 10",
  context:
    "When a founder says 'can you just keep this organised?', they mean project management. It is the skill that turns a pile of tasks and a vague goal into something that actually ships, on time, with everyone knowing what they own. This week you learn to plan projects, break work into tasks, coordinate a team, and report progress using the tools companies actually run on: Trello, Asana, ClickUp, Monday.\n\n" +
    "You will plan and run a complete project for Kola, the December holiday sale launch, end to end: the plan, the board, the team coordination, two status reports, and a dashboard. By Friday you can take 'we want to launch X by Y' and turn it into a tracked plan that gets there.\n\n" +
    "A project manager's real job is not the board; it is making sure the right things happen in the right order and nothing important quietly stalls.",
  concept_check: [
    {
      q: "A task on the board reads 'marketing'. Three weeks later nothing has happened. What is the most likely cause?",
      choices: [
        "The team is lazy",
        "The task is too big and vague, with no clear owner or deadline, so no one can start it",
        "The board software is bad",
        "Marketing is just hard",
      ],
      correct: 1,
      explain: "Stalled work is almost always a task that is too big, with fuzzy ownership and no date. Break it into a small concrete next action, give it one named owner and a deadline, and it moves.",
    },
    {
      q: "Ama asks 'how's the launch going?' Which answer is most useful?",
      choices: [
        "'Lots happening, lots of emails, very busy!'",
        "'On track for the 1st. Done: store updated, emails drafted. Next: finalise discounts (me, Thu). One risk: the photographer is delayed, backup booked.'",
        "'Fine.'",
        "'I'll let you know when it's finished.'",
      ],
      correct: 1,
      explain: "A useful status report covers progress against the goal, what is next and who owns it, and any risks, not activity ('lots happening') but real status the founder can act on.",
    },
    {
      q: "Why assign every task a single named owner rather than a team?",
      choices: [
        "To blame someone if it fails",
        "Because a task owned by 'the team' is owned by no one; one named owner makes it clear who acts",
        "It does not matter who owns a task",
        "So one person does all the work",
      ],
      correct: 1,
      explain: "Shared ownership diffuses responsibility, everyone assumes someone else has it. One named owner per task is the simplest way to make sure things actually move.",
    },
  ],
  days: [
    {
      number: 0,
      title: "What project management is, and build your first board",
      summary: "Understand the PM mindset, then set up a board in Trello and learn its building blocks.",
      items: [
        {
          kind: "lesson",
          title: "The coordinator who makes things ship",
          body:
            "## What you are really managing\n" +
            "A project is any goal with multiple steps and a deadline: a product launch, a website redesign, an event, onboarding a new supplier. Left informal, projects drift, steps get forgotten, people wait on each other, and the deadline arrives with half the work undone. The project manager's job is to make sure the right things happen in the right order and nothing important stalls quietly.\n\n" +
            "## The core loop\n" +
            "Every project, big or small, runs the same loop:\n" +
            "1. **Define** the goal and deadline (what does done look like, by when).\n" +
            "2. **Break it down** into tasks.\n" +
            "3. **Assign** each task an owner and a date.\n" +
            "4. **Track** progress and surface blockers.\n" +
            "5. **Report** status and adjust.\n\n" +
            "Master that loop and you can run any project in any tool.\n\n" +
            "## The tools are interchangeable\n" +
            "Trello, Asana, ClickUp, and Monday all do the same fundamental thing: a visual board of tasks you move through stages. Learn one well (we will use Trello, the simplest) and you can pick up the others in an hour, because the concepts transfer. Do not get hung up on the software; the thinking is the skill.\n\n" +
            "## This week's destination\n" +
            "You will run Kola's December holiday-sale launch as a tracked project: a plan, a live board, team coordination, status reports, and a dashboard. That package is portfolio artefact number six, and 'I can run your projects' is one of the most in-demand operator skills.",
        },
        {
          kind: "video",
          title: "How to use TRELLO - Tutorial for Beginners",
          url: "https://www.youtube.com/watch?v=geRKHFzTxNY",
          duration_min: 12,
          creator: "Simpletivity",
          difficulty: "beginner",
          why: "Scott from Simpletivity gives a clear, fast tour of Trello's boards, lists, and cards, the exact building blocks you will use this week. Watch it, then build your own board in the exercise.",
        },
        {
          kind: "lesson",
          title: "Build your first board, step by step",
          body:
            "## Set up Trello\n" +
            "Go to trello.com and sign up free. Create a new board called `Kola - Holiday Sale Launch`.\n\n" +
            "## The building blocks\n" +
            "- **Board:** the whole project (one board per project).\n" +
            "- **Lists:** the columns, usually stages. Create three to start: `To Do`, `In Progress`, `Done`. (You can add `Blocked` or `Review` later.)\n" +
            "- **Cards:** individual tasks. Add a few to `To Do`: 'Update store with sale items', 'Draft launch emails', 'Design sale graphics'. Each card is one task you drag rightward as it progresses.\n" +
            "- **Card details:** click a card to add a description, a due date, a member (owner), a checklist of sub-steps, and labels (e.g. colour by area: marketing, store, suppliers).\n\n" +
            "## See the flow\n" +
            "Drag a card from To Do to In Progress to Done. That simple motion is the heartbeat of project management: at a glance, anyone sees what is waiting, what is active, and what is finished. A founder glancing at this board instantly knows where the launch stands, no meeting required.\n\n" +
            "## Why visual beats a list\n" +
            "A flat to-do list hides status. A board shows it: a pile-up in 'In Progress' means too much started at once; an empty 'Done' near the deadline is a warning. The visual layout turns the state of the project into something you can read in two seconds.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Learning the concepts of one project tool (board, lists, cards) means you can pick up the others quickly.",
              answer: true,
              whenRight: "Yes. Trello, Asana, ClickUp, and Monday share the same core ideas, so the thinking transfers. Learn one well, adapt to any.",
              whenWrong: "It does transfer. The tools differ in details but share the board/list/card model. Master the concepts once and the software is interchangeable.",
            },
            {
              prompt: "A visual board shows project status more clearly than a flat to-do list.",
              answer: true,
              whenRight: "Yes. A board makes status visible at a glance, what is waiting, active, done, and warning signs like a pile-up. A flat list hides all that.",
              whenWrong: "The board wins. Columns show the state of every task instantly; a flat list tells you the tasks but not where each one stands.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build a board",
          body:
            "- [ ] Sign up for Trello (free) and create a `Kola - Holiday Sale Launch` board\n" +
            "- [ ] Create three lists: To Do, In Progress, Done\n" +
            "- [ ] Add at least six task cards to To Do\n" +
            "- [ ] Open one card and add a due date, a description, and a label\n" +
            "- [ ] Drag one card to In Progress to see the flow\n\n" +
            "Deliverable: a screenshot (or share link) of your board.",
        },
      ],
    },
    {
      number: 1,
      title: "Breaking a goal into tasks",
      summary: "Turn a vague goal into a sequence of small, doable, owned steps.",
      items: [
        {
          kind: "lesson",
          title: "Decomposition: the heart of planning",
          body:
            "## Why goals stall\n" +
            "'Launch the holiday sale' is a goal, not a task. You cannot 'do' it, which is exactly why vague goals stall. The skill is decomposition: breaking a goal into tasks small enough that each one has an obvious next action.\n\n" +
            "## How to decompose\n" +
            "Work backwards from done and ask 'what has to happen for this?' Keep splitting until each task is a single concrete action one person can do in a sitting. For Kola's launch:\n" +
            "- Decide the sale dates and discount\n" +
            "- Choose which products are on sale\n" +
            "- Update the store: prices, a sale banner, a sale collection\n" +
            "- Design the sale graphics\n" +
            "- Write the launch email and two follow-ups\n" +
            "- Schedule the social posts\n" +
            "- Brief the support inbox on likely questions\n" +
            "- Test the checkout with a discount code\n\n" +
            "Each of those is concrete and ownable. 'Launch the sale' was not.\n\n" +
            "## The right size for a task\n" +
            "Too big ('do marketing') and it stalls. Too small ('open laptop') and it is noise. Aim for a task that is one clear action with a clear 'done', roughly an hour to a day of work. If a card keeps not moving, it is probably still too big, split it.\n\n" +
            "## Sequence and dependencies\n" +
            "Some tasks must come before others, you cannot write the launch email before deciding the discount. Note these dependencies so the plan runs in a possible order. Spotting that 'X is blocked until Y is done' before it happens is what keeps a project from stalling at the worst moment.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "'Launch the holiday sale' is a good, actionable task to put on a board as-is.",
              answer: false,
              whenRight: "Correct. That is a goal, not a task, you cannot 'do' it. Break it into concrete actions (set discount, update store, write email) that each have an owner.",
              whenWrong: "It is a goal, not a task. It needs decomposing into small, concrete, ownable actions before anyone can actually start.",
            },
            {
              prompt: "If a card on the board keeps not moving week after week, it is probably too big and should be split.",
              answer: true,
              whenRight: "Yes. A stuck card usually means the task is too large or vague. Break it into a small, clear next action with one owner and it moves.",
              whenWrong: "Splitting usually fixes it. Persistent stalling is the classic sign of a task that is too big; shrink it to one concrete next step.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Decompose the launch",
          body:
            "1. Take the goal 'Launch Kola's December holiday sale by the 1st'.\n" +
            "2. Break it into 15 to 25 concrete tasks, each a single clear action.\n" +
            "3. Mark any dependencies (which tasks must finish before others can start).\n" +
            "4. Put them on your Trello board in To Do.\n\n" +
            "Deliverable: the task list with dependencies noted, on the board.",
        },
      ],
    },
    {
      number: 2,
      title: "Boards, lists, cards, and labels",
      summary: "Use the board's features so status is obvious to everyone.",
      items: [
        {
          kind: "lesson",
          title: "Make the board readable at a glance",
          body:
            "## A board is a communication tool\n" +
            "The board is not just for you; it is how the whole team and the founder see the project without a meeting. Set it up so anyone can read it in seconds.\n\n" +
            "## Lists that match your workflow\n" +
            "Three lists (To Do / In Progress / Done) suit most small projects. Add stages only if they earn their place: a `Blocked` list makes stalled work visible; a `Review` list works when things need approval before done. Resist over-engineering, more columns means more to maintain.\n\n" +
            "## Labels for category\n" +
            "Use coloured labels to group tasks by area: marketing, store, suppliers, support. Now you can glance at the board and see 'all the marketing work is still in To Do' even though tasks are scattered across lists. Labels turn a board into something you can filter and read by theme.\n\n" +
            "## Cards that hold everything\n" +
            "A good card is self-contained: a clear title (a verb: 'Write launch email'), a description with any context or links, a checklist of sub-steps, a due date, and an owner. The test: could the owner open this card and start working with no other explanation? If they would have to ask you something, add it to the card.\n\n" +
            "## Keep it current\n" +
            "A board is only useful if it reflects reality. The discipline is moving cards as work actually progresses and updating dates when they slip. A stale board ('everything still says To Do but half is done') is worse than no board, because people stop trusting it. Update it as part of your daily and weekly review.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Adding lots of lists/columns always makes a board more useful.",
              answer: false,
              whenRight: "Correct. More columns means more to maintain and a messier view. Add a stage only if it earns its place (e.g. Blocked, Review).",
              whenWrong: "Not always. Over-engineering a board makes it harder to read and keep current. Keep stages minimal and meaningful.",
            },
            {
              prompt: "A board that is not kept up to date can be worse than having no board at all.",
              answer: true,
              whenRight: "Yes. A stale board misleads people and they stop trusting it. The board's whole value is reflecting reality, so keep it current.",
              whenWrong: "It can be worse. If the board says 'To Do' when work is done, people are misinformed and lose trust in it. Keep it current or it backfires.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Set up the board properly",
          body:
            "On your launch board:\n" +
            "1. Confirm your lists match the real workflow (add Blocked or Review only if useful).\n" +
            "2. Add coloured labels by area (marketing, store, suppliers, support) and apply them to your cards.\n" +
            "3. Make three cards fully self-contained: clear verb title, description, a checklist, due date.\n\n" +
            "Deliverable: a screenshot of the labelled board and one fully-detailed card.",
        },
      ],
    },
    {
      number: 3,
      title: "Owners, deadlines, and dependencies",
      summary: "Make it unambiguous who does what, by when, and in what order.",
      items: [
        {
          kind: "lesson",
          title: "Ownership is what makes work happen",
          body:
            "## The single most important rule\n" +
            "Every task has one named owner. Not 'the team', not 'us', one person who is responsible for it moving. A task owned by everyone is owned by no one; each person assumes someone else has it, and it stalls. Assigning a single owner is the simplest, highest-impact thing a coordinator does.\n\n" +
            "## Every task has a date\n" +
            "A task with no deadline is a wish. Dates create the gentle pressure that makes things happen and let you see what is due, late, or coming. When you assign a card, set its due date. As coordinator, your job is partly to chase the dates: a quiet nudge before something is due beats a scramble after it is late.\n\n" +
            "## Dependencies: order matters\n" +
            "Map which tasks block others. 'Schedule social posts' depends on 'design graphics'; 'send launch email' depends on 'finalise discount'. If you start tasks in an impossible order, people sit blocked. Sequencing the work so each task is ready when its turn comes is a quiet skill that separates smooth projects from chaotic ones.\n\n" +
            "## Realistic estimates and buffer\n" +
            "People underestimate how long things take, and projects slip. Add buffer before the real deadline, do not plan to finish the launch at 11pm on the 30th for a December 1st sale. Aim to be done a couple of days early so there is room for the inevitable surprise. A plan with no slack is a plan that misses.\n\n" +
            "## The coordinator's daily habit\n" +
            "Each day, glance at what is due soon and what is overdue, and nudge the owners. You are not doing all the work; you are making sure it flows. That gentle, consistent follow-through is exactly what a founder cannot do themselves while running the business, which is why they pay you to.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Assigning a task to 'the whole team' is a reliable way to make sure it gets done.",
              answer: false,
              whenRight: "Correct. Shared ownership means everyone assumes someone else has it. One named owner per task is what actually makes work move.",
              whenWrong: "It backfires. 'The team' owns nothing in practice. Give each task one named owner so responsibility is clear.",
            },
            {
              prompt: "Building buffer time before the real deadline is wise because projects usually slip.",
              answer: true,
              whenRight: "Yes. People underestimate task time and surprises happen. Aim to finish a couple of days early so there is room to absorb the slip.",
              whenWrong: "Buffer is wise. Plans without slack miss, because tasks run long and surprises land. Target an early finish to protect the real deadline.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Assign owners, dates, and order",
          body:
            "On your launch board:\n" +
            "1. Give every card a single named owner (invent team members: you, Ama, a designer, a support person).\n" +
            "2. Set a realistic due date on each, working back from a December 1st launch with two days of buffer.\n" +
            "3. List the key dependencies (which tasks must finish before others start).\n\n" +
            "Deliverable: the board with owners and dates, plus a short dependency list.",
        },
      ],
    },
    {
      number: 4,
      title: "Coordinating a team",
      summary: "Keep people moving and aligned without nagging or chaos.",
      items: [
        {
          kind: "lesson",
          title: "Moving work through people",
          body:
            "## Your job: flow, not control\n" +
            "Coordinating a team means making sure work flows between people smoothly, handoffs happen, blockers get cleared, and everyone knows what is expected. You are the connective tissue, not the boss. Done well, the team barely notices the coordination; things just keep moving.\n\n" +
            "## Clear handoffs\n" +
            "Most delays happen at handoffs: the designer finishes the graphic but no one tells the person scheduling posts. As coordinator, you make handoffs explicit: when a card moves to Done, the next owner is notified and knows it is their turn. A comment on the card ('@scheduler graphics are ready, you are up') closes the gap.\n\n" +
            "## The gentle nudge\n" +
            "People are busy and forget. A short, friendly reminder before a due date ('hey, the launch email is due Thursday, all good?') is not nagging, it is your job, and people appreciate it because it keeps them from being caught out. The tone matters: helpful, not policing.\n\n" +
            "## Surface and clear blockers\n" +
            "When someone is stuck ('I cannot finish the store update until the prices are confirmed'), that blocker is now your problem to clear, get the prices confirmed, or escalate to the founder. A coordinator who actively hunts down blockers keeps the project moving; one who just watches the board does not.\n\n" +
            "## Lightweight check-ins\n" +
            "For a team, a short regular check-in (an async message or a brief call) keeps everyone aligned: what is done, what is next, anything stuck. Keep it short and decision-focused, the goal is alignment, not a meeting that eats the morning. Often a written daily or twice-weekly update beats a call entirely.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A friendly reminder before a task is due counts as nagging and should be avoided.",
              answer: false,
              whenRight: "Correct. A helpful pre-deadline nudge is part of coordinating, and people appreciate it. Tone matters: helpful, not policing.",
              whenWrong: "It is not nagging, it is the job. A gentle reminder keeps people from being caught out. The skill is the friendly tone, not avoiding the nudge.",
            },
            {
              prompt: "When a team member is blocked, clearing that blocker is the coordinator's problem to chase.",
              answer: true,
              whenRight: "Yes. A coordinator actively hunts and clears blockers (or escalates them). Just watching the board while someone stays stuck is not coordinating.",
              whenWrong: "It is yours to chase. The coordinator's value is removing blockers so work flows, not merely noting that someone is stuck.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Coordinate the launch team",
          body:
            "Simulate coordination on your board:\n" +
            "1. Write the handoff comment you would post when graphics are done and the scheduler is up next.\n" +
            "2. Write a friendly pre-deadline nudge for an owner whose task is due in two days.\n" +
            "3. A team member is blocked waiting on confirmed prices, write how you would clear or escalate it.\n" +
            "4. Draft a short twice-weekly team check-in message (done / next / blocked).\n\n" +
            "Deliverable: the four messages.",
        },
      ],
    },
    {
      number: 5,
      title: "Progress tracking and status reports",
      summary: "Tell the founder where the project really stands, in a form they can act on.",
      items: [
        {
          kind: "lesson",
          title: "Reporting status that means something",
          body:
            "## Activity is not progress\n" +
            "'Lots happening, very busy' is not a status report, it is noise. A founder needs to know whether the project will hit its goal, what is next, and what might go wrong. Report progress against the goal, not how busy you have been.\n\n" +
            "## The status report shape\n" +
            "A useful update, weekly for an ongoing project, has four parts:\n" +
            "1. **Headline:** on track / at risk / off track for the deadline. One line, up front.\n" +
            "2. **Done since last update:** the meaningful completions.\n" +
            "3. **Next:** what happens next and who owns it.\n" +
            "4. **Risks/blockers:** anything threatening the deadline, and what you are doing about it.\n\n" +
            "Example: \"Holiday sale, on track for Dec 1. Done: store updated, emails drafted, graphics complete. Next: schedule posts (me, Mon) and test checkout (me, Tue). Risk: the discount code plugin is glitchy, I am testing a fix today; will escalate if not resolved by Wed.\"\n\n" +
            "## Honesty about risk\n" +
            "The hardest and most valuable part is flagging risk early. A founder would much rather hear 'this might slip, here is my plan' on Monday than 'it slipped' on the deadline. Surfacing problems early, with a proposed response, is what makes a founder trust you with bigger things. Hiding a slipping deadline is the fastest way to lose that trust.\n\n" +
            "## Cadence and consistency\n" +
            "Send the update on a regular rhythm (e.g. every Friday) so the founder knows when to expect it and never has to ask. Consistency turns your reporting into something they rely on, the project is handled, and they will hear if it is not.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A good status report leads with whether the project is on track, at risk, or off track.",
              answer: true,
              whenRight: "Yes. Headline first (BLUF): the founder gets the bottom line immediately, with detail underneath if they want it.",
              whenWrong: "It should lead with that. The on-track/at-risk verdict is the thing the founder most needs; put it first, then the detail.",
            },
            {
              prompt: "If a deadline might slip, it is better to flag it early with a plan than to hope you recover before anyone notices.",
              answer: true,
              whenRight: "Yes. Early warning with a proposed response builds trust; a silent slip discovered at the deadline destroys it. Flag risk early.",
              whenWrong: "Flag it early. Founders far prefer 'this might slip, here is my plan' on Monday over a surprise miss on the deadline. Silence is the costly choice.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Write two status reports",
          body:
            "1. Write a week-1 status report for the launch (headline, done, next, risks), with the project on track.\n" +
            "2. Write a week-2 report where one risk has materialised (e.g. the photographer is delayed). Show how you flag it and what you are doing about it.\n\n" +
            "Deliverable: the two status reports.",
        },
      ],
    },
    {
      number: 6,
      title: "Dashboards and handling delays",
      summary: "Show project health at a glance and keep moving when things go wrong.",
      items: [
        {
          kind: "lesson",
          title: "At-a-glance health, and recovering from slips",
          body:
            "## The dashboard\n" +
            "A dashboard is a single view that shows project health without reading every card: how many tasks are done versus remaining, what is overdue, what is blocked, and whether you are on pace. In Trello you can approximate this with a clear board layout, labels, and the count of cards per list; tools like Asana and ClickUp have built-in dashboard views with charts. The point is the same: a founder (or you) glances at it and instantly knows if the project is healthy.\n\n" +
            "## What makes a dashboard useful\n" +
            "- **Progress:** done vs total (a simple 'we are 12 of 20 tasks done, on pace for the 1st').\n" +
            "- **Overdue:** anything past its date, flagged.\n" +
            "- **Blocked:** anything stuck, so it is visible and gets cleared.\n" +
            "- **Upcoming:** what is due in the next few days.\n\n" +
            "Keep it simple, one screen the founder reads in ten seconds. A cluttered dashboard nobody reads is worse than a clear sentence.\n\n" +
            "## When things slip (they will)\n" +
            "Projects rarely go exactly to plan. A task runs long, someone gets sick, a supplier is late. The coordinator's job is to re-plan calmly, not panic:\n" +
            "1. **Assess the impact:** does this threaten the deadline, or just shuffle the order?\n" +
            "2. **Re-sequence:** can other work continue while this is stuck? Keep the rest moving.\n" +
            "3. **Communicate:** tell the founder early, with the impact and your plan (Day 5's risk reporting).\n" +
            "4. **Protect the goal:** cut or simplify the least important tasks if needed to hit the deadline. Knowing what to drop is as important as knowing what to do.\n\n" +
            "## The mindset\n" +
            "A great coordinator is unflappable. Problems are expected; the value is calm, communicated re-planning. The founder should feel that whatever goes wrong, you have it handled, that feeling is the whole product.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A good dashboard is a single, simple view that shows project health in about ten seconds.",
              answer: true,
              whenRight: "Yes. Progress, overdue, blocked, upcoming, one clear screen. A cluttered dashboard nobody reads defeats the purpose.",
              whenWrong: "Simple and glanceable is the goal. If it takes more than a few seconds to read, it is not doing its job. One clear screen.",
            },
            {
              prompt: "When a task slips, sometimes the right move is to cut or simplify a less important task to protect the deadline.",
              answer: true,
              whenRight: "Yes. Protecting the goal can mean dropping the least important work. Knowing what to cut is as much a skill as knowing what to do.",
              whenWrong: "It can be right. If the deadline matters most, trimming lower-priority tasks to hit it is smart re-planning, not failure.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Build a dashboard and re-plan a slip",
          body:
            "1. Create a simple dashboard view for the launch (done vs total, overdue, blocked, upcoming), as a Trello layout or a short summary.\n" +
            "2. A key task slips by three days four days before launch. Write your re-plan: impact, what keeps moving, what you tell Ama, and what (if anything) you would cut to protect the deadline.\n\n" +
            "Deliverable: the dashboard and the re-plan note.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship: run the project end to end",
      summary: "Deliver the full project package for Kola's launch. Portfolio artefact #6.",
      items: [
        {
          kind: "lesson",
          title: "The complete project, packaged",
          body:
            "## The week's deliverable\n" +
            "Today you assemble the whole project into a portfolio package: the plan, the live board (with owners, dates, labels, dependencies), two status reports, and a dashboard. This is portfolio artefact number six, and it proves you can take a goal and a deadline and actually deliver it through other people.\n\n" +
            "## Why this skill is in such demand\n" +
            "Founders are full of ideas and short on execution. The person who can turn 'we should run a holiday sale' into a tracked, on-time launch is worth a great deal, because they convert intention into results. Project coordination also scales into bigger roles (operations coordinator, project manager) with higher pay. This package is your evidence.\n\n" +
            "## The standard\n" +
            "Three tests: the board is clear enough that a stranger could see the project's status in seconds; every task has an owner and a date; and the status reports show real progress against the goal with honest risk-flagging. If a founder could hand you their next launch based on this package, you have hit the bar.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "The core value a project coordinator provides is turning a founder's intentions into delivered results.",
              answer: true,
              whenRight: "Yes. Founders have no shortage of ideas; execution is the gap. Reliably converting 'we should' into 'it is done, on time' is the whole value.",
              whenWrong: "That is the value. The skill is execution, taking a goal and deadline and making it actually happen through coordination.",
            },
            {
              prompt: "A project board passes the standard if only you can understand its current status.",
              answer: false,
              whenRight: "Correct. The standard is that a stranger (or the founder) can read the status in seconds. A board only you understand is not done.",
              whenWrong: "Not enough. The board is a communication tool; it must be clear to others. If only you can read it, it fails the standard.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Final build: the project package",
          body:
            "This is the Week 6 portfolio deliverable. Assemble for Kola's holiday-sale launch:\n" +
            "1. **The project plan** (goal, deadline, the decomposed tasks).\n" +
            "2. **The live board** with lists, labelled cards, owners, due dates, and dependencies.\n" +
            "3. **Two weekly status reports** (one on-track, one flagging a risk).\n" +
            "4. **A dashboard** showing progress, overdue, blocked, and upcoming.\n\n" +
            "Keep the board shareable and export the plan + reports as a PDF. This is portfolio artefact #6.",
        },
      ],
    },
  ],
  topics: [
    "The project-management loop: define, break down, assign, track, report",
    "Boards, lists, cards, and labels (Trello/Asana/ClickUp/Monday)",
    "Decomposing a goal into owned tasks",
    "Owners, deadlines, and dependencies",
    "Coordinating a team and clearing blockers",
    "Progress tracking and status reports",
    "Dashboards and at-a-glance health",
    "Handling delays and re-planning calmly",
  ],
  tasks: [
    "Build a project board in Trello",
    "Decompose a goal into 15-25 owned tasks",
    "Set owners, deadlines, and dependencies",
    "Coordinate a team with handoffs, nudges, and blocker-clearing",
    "Write weekly status reports",
    "Build a project dashboard",
    "Run a complete project end to end and package it",
  ],
  project:
    "Plan and run Kola's December holiday-sale launch as a tracked project: a project plan, a live board with owners/dates/labels/dependencies, two weekly status reports, and a dashboard showing progress at a glance. Portfolio artefact #6.",
  exercises: [
    "Build a Trello board with lists, labelled cards, and a detailed card",
    "Decompose a launch into 15-25 tasks with dependencies",
    "Assign every card an owner and a realistic due date with buffer",
    "Write two status reports (one on-track, one flagging a risk)",
    "Build a simple dashboard and re-plan a slipped task",
  ],
  questions: [
    "How do you break a vague goal into a trackable plan?",
    "What does a useful status report contain?",
    "How do you keep a project moving when someone is blocked?",
  ],
  outputs: [
    "A project plan with tasks, owners, and deadlines",
    "A live, labelled project board",
    "Two weekly status reports",
    "A progress dashboard",
  ],
  mastery_questions: [
    "Break a project goal into 15-25 tasks with clear owners and deadlines",
    "Set up a board with lists and meaningful labels",
    "Note the dependencies so blocked tasks are visible",
    "Assign every task one named owner and a realistic due date with buffer",
    "Write a handoff message and a friendly pre-deadline nudge",
    "Write a status report covering on-track/at-risk, done, next, and risks",
    "Build a dashboard that shows progress, overdue, and blocked at a glance",
    "Re-plan calmly when a task slips, protecting the deadline",
    "Run a project kickoff: goal, scope, roles, timeline",
    "Hand a project board to someone else so they understand it with no explanation",
  ],
  ai_assist:
    "Use AI to break a goal into a first-draft task list, draft a project plan, and turn your raw board notes into a clean status report. Ask it to spot missing steps and risks in your plan ('what am I forgetting for an e-commerce holiday launch?'). You stay the coordinator who knows the people, the priorities, and the real deadlines; AI just speeds the planning and paperwork. Verify its task list against reality before you commit to it.",
  pre_flight:
    "Before building a board, write the project's one-line goal and its hard deadline. Every task must ladder up to that goal; if one does not, question whether it belongs. Decide what 'done' looks like before you plan the steps to get there.",
  common_mistakes: [
    "Tasks with no owner or no deadline, so nothing actually moves",
    "A beautiful board no one updates, so it goes stale and misleads",
    "Reporting activity ('lots happening') instead of progress against the goal",
    "Hiding blockers or a slipping deadline instead of flagging them early",
    "Over-engineering the board with too many columns to maintain",
  ],
  debug_help:
    "If a project is drifting, it is usually because tasks are too big or ownership is fuzzy, break the stuck task into a small concrete next action and assign one named owner with one date. If the board feels useless, you are probably not keeping it current; update it as part of your daily and weekly review. If a deadline is slipping, re-plan calmly: assess impact, keep other work moving, flag it early with a plan, and cut the least important tasks if needed.",
  stretch: [
    "Learn one automation in your PM tool (auto-move cards, due-date reminders)",
    "Build a reusable project template for recurring launches",
    "Create a RACI chart (responsible, accountable, consulted, informed) for the launch",
  ],
  resources: [
    { label: "Trello Guide", url: "https://trello.com/guide", note: "Free, official" },
    { label: "Asana resources", url: "https://asana.com/resources", note: "Free, PM guides" },
  ],
};
