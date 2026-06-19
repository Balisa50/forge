/**
 * Outline base for the Remote Operations Professional track (Weeks 3-13).
 *
 * Each week here has complete week-level fields (context/topics/tasks/project/
 * outputs/mastery_questions/ai_assist/common_mistakes/debug_help/pre_flight/
 * stretch/resources) but NO `days` array yet, so it renders in the Overview
 * tab. As each week gets a full module (scripts/remote-ops/weekNN.js with
 * D0-D7 + concept_check + verified videos), that module OVERRIDES the outline
 * here. This keeps the live track at 13 complete weeks while content deepens.
 */
module.exports = [
  {
    number: 3,
    title: "Email and calendar management",
    phase: "Executive Support",
    commitment_hours: "6, 10",
    context:
      "This is the bread and butter of executive support, and the skill most clients hire for first. You will learn to take a chaotic inbox to zero, build filters and labels that triage automatically, manage a calendar across time zones, and coordinate meetings without the endless back-and-forth. This week you run a mock CEO inbox and calendar for Ama and turn the chaos into calm. Master this and you are immediately hireable.",
    topics: [
      "Inbox management and getting to inbox zero",
      "Email triage: labels, filters, folders, priority",
      "Templates and canned responses for speed",
      "Calendar management and scheduling",
      "Appointment coordination without back-and-forth",
      "Scheduling tools (Calendly and similar)",
      "Time zones and international scheduling",
      "Basic travel planning and itineraries",
    ],
    tasks: [
      "Triage a messy mock inbox to zero with labels and filters",
      "Build canned responses for common email types",
      "Set up and manage a mock executive calendar",
      "Coordinate a multi-person meeting across time zones",
      "Create a simple travel itinerary",
    ],
    project:
      "Run Ama's inbox and calendar for a simulated week: triage a 40-email mock inbox to zero using a label/filter system, schedule five meetings (including one international), resolve a double-booking, and produce a clean weekly calendar plus a travel itinerary for a supplier visit. Document your inbox system. Portfolio artefact #3.",
    exercises: [
      "Design a label and filter system and apply it to a mock inbox",
      "Write four canned responses for recurring email situations",
      "Schedule a meeting across three time zones and confirm in writing",
      "Build a one-day travel itinerary with times, addresses, and confirmations",
    ],
    questions: [
      "What is a repeatable system for getting an inbox to zero?",
      "How do filters and labels save hours per week?",
      "How do you coordinate a meeting without ten back-and-forth emails?",
    ],
    outputs: [
      "A triaged mock inbox at zero with a documented system",
      "A set of canned email responses",
      "A managed weekly calendar with meetings booked",
      "A travel itinerary document",
    ],
    mastery_questions: [
      "Triage a messy inbox into actionable, waiting, reference, and archive",
      "Create three Gmail filters that auto-label incoming mail",
      "Write a canned response and save it for reuse",
      "Schedule a meeting and send a confirmation with the time zone stated",
      "Resolve a calendar double-booking and notify everyone affected",
      "Set up a scheduling link (Calendly or similar) with availability rules",
      "Convert a meeting time across three time zones correctly",
      "Block focus time and buffer time on a calendar",
      "Build a simple travel itinerary with flights, hotel, and meetings",
      "Document your inbox-zero system so someone else could run it",
    ],
    ai_assist:
      "Use AI to draft canned responses, summarise long email threads into the key decision and action, and convert time zones. Ask it to triage a list of email subjects into priority buckets so you learn the pattern. Always apply your own judgement on what is truly urgent.",
    pre_flight:
      "Before touching the inbox, define what 'done' means: what does inbox zero actually look like for this client, and which emails should never reach them at all? Decide your triage categories first.",
    common_mistakes: [
      "Treating every email as equally urgent",
      "Archiving things you will need without a label to find them",
      "Scheduling without confirming the time zone",
      "Letting meetings stack with no buffer between them",
    ],
    debug_help:
      "If the inbox keeps refilling to chaos, your filters are doing too little. Automate the repetitive sorting (newsletters, receipts, notifications) so only real decisions land in the main view. The goal is fewer items needing a human, not faster human sorting.",
    stretch: [
      "Build an email SOP a future assistant could follow",
      "Set up snooze and follow-up reminders so nothing is dropped",
      "Create a VIP filter that flags the most important senders",
    ],
    resources: [
      { label: "Gmail Help: filters and labels", url: "https://support.google.com/mail/", note: "Free, official" },
      { label: "Calendly Help Center", url: "https://help.calendly.com/", note: "Free, scheduling" },
    ],
  },
  {
    number: 4,
    title: "Online research",
    phase: "Research",
    commitment_hours: "6, 10",
    context:
      "Founders constantly need answers: who are our competitors, who could we sell to, is this supplier legitimate, what does the market look like. A research specialist turns vague questions into clear, sourced answers fast. This week you learn advanced search, source verification, competitor and market analysis, and lead generation, then deliver real research reports for Kola that Ama could act on immediately.",
    topics: [
      "Advanced search techniques and operators",
      "Source evaluation and information verification",
      "Market research fundamentals",
      "Competitor analysis",
      "Lead generation and prospect research",
      "Data collection and organisation in spreadsheets",
      "Presenting findings clearly",
      "Avoiding misinformation and bias",
    ],
    tasks: [
      "Run advanced searches to answer a specific business question",
      "Verify a source and a piece of information",
      "Build a competitor comparison table",
      "Compile a prospect/lead list in a spreadsheet",
      "Write a short research report with sources",
    ],
    project:
      "Deliver three research assets for Kola: a startup/market research report on the West African handmade-goods market, a competitor analysis of five similar brands, and a prospect database of 25 potential wholesale buyers or stockists with contact details and notes. Cite sources throughout. Portfolio artefact #4.",
    exercises: [
      "Use search operators to find a specific, hard-to-find fact and cite it",
      "Verify a claim using at least two independent reliable sources",
      "Build a five-competitor comparison table with consistent criteria",
      "Compile a 25-row prospect list with name, role, contact, and a note",
    ],
    questions: [
      "How do you tell a reliable source from an unreliable one?",
      "What belongs in a competitor analysis?",
      "What makes a prospect list actually usable for outreach?",
    ],
    outputs: [
      "A sourced market/startup research report",
      "A competitor analysis table",
      "A 25-row prospect database",
      "A short written summary of findings",
    ],
    mastery_questions: [
      "Use at least three search operators to narrow results to a precise answer",
      "Evaluate a source for credibility (author, date, bias, corroboration)",
      "Verify one fact against two independent sources",
      "Build a competitor comparison with consistent columns and a takeaway",
      "Compile a 20+ row prospect list with clean, structured data",
      "Find verified contact details for a specific decision-maker",
      "Summarise a long article into three sourced bullet points",
      "Spot and flag a misleading or biased claim",
      "Organise research findings into a readable one-page report",
      "Cite every claim so a reader can trace it back",
    ],
    ai_assist:
      "Use AI to accelerate research, but verify everything it tells you, AI can invent facts and sources. Good uses: brainstorming search angles, summarising long documents you paste in, structuring a report, drafting a competitor framework. Bad use: trusting an unsourced 'fact' it generates. Treat AI as a fast intern whose work you always fact-check.",
    pre_flight:
      "Before researching, write the exact question you are answering and what a useful answer looks like. Vague research ('find stuff about competitors') wastes hours. Specific questions ('which five brands sell similar baskets to West African diaspora buyers, and how do they price?') get answered.",
    common_mistakes: [
      "Trusting the first result without checking the source",
      "Copying AI-generated facts without verifying them",
      "Collecting data with no consistent structure, so it cannot be used",
      "Researching endlessly without ever writing the answer down",
    ],
    debug_help:
      "If research is taking forever, your question is too broad or you are perfectionist-collecting. Set a timebox, answer the specific question with the best sourced evidence you have, and note what is uncertain. A clear 80% answer delivered today beats a perfect one next week.",
    stretch: [
      "Build a reusable research-report template",
      "Learn one tool for finding verified business emails",
      "Create a source-credibility checklist you apply every time",
    ],
    resources: [
      { label: "Google Search operators guide", url: "https://support.google.com/websearch/answer/2466433", note: "Free, official" },
      { label: "Google Scholar", url: "https://scholar.google.com/", note: "Free, credible sources" },
    ],
  },
  {
    number: 5,
    title: "AI-powered virtual assistant",
    phase: "AI Operations",
    commitment_hours: "6, 10",
    context:
      "AI is the force multiplier that lets one operator do the work of three, if you know how to direct it. This week you learn practical prompt engineering and build AI into your daily workflow: drafting, summarising, research acceleration, reporting, and light automation. The operators who get hired in the next few years are the ones who make AI do the repetitive work while they apply judgement. You will build an AI-assisted assistant system for Kola.",
    topics: [
      "Prompt engineering fundamentals (role, context, task, format)",
      "Using ChatGPT, Claude, Gemini, and Perplexity well",
      "AI for drafting and editing communication",
      "AI for research acceleration and summarising",
      "AI-assisted reporting and data summaries",
      "Building reusable prompt templates",
      "Light workflow automation concepts",
      "Knowing AI's limits: hallucination, privacy, judgement",
    ],
    tasks: [
      "Write structured prompts that get reliable results",
      "Build a personal prompt library for recurring tasks",
      "Use AI to summarise a long document into an action list",
      "Use AI to draft and then improve a report",
      "Design an AI-assisted workflow for a real recurring task",
    ],
    project:
      "Build an 'AI-assisted operations system' for Kola: a documented prompt library (at least 10 reusable prompts for drafting, research, summarising, and reporting), plus a worked example of an automated research-to-report workflow that took a task from hours to minutes. Show before/after time. Portfolio artefact #5.",
    exercises: [
      "Write a structured prompt (role, context, task, format) and refine it twice",
      "Summarise a long thread or document into a decisions-and-actions list",
      "Build five reusable prompt templates for your most common tasks",
      "Use AI to draft a report, then edit it to sound human and accurate",
    ],
    questions: [
      "What are the parts of a prompt that reliably get good output?",
      "Where does AI help most in an operator's day, and where is it dangerous?",
      "How do you keep AI output accurate and on-brand?",
    ],
    outputs: [
      "A documented prompt library (10+ prompts)",
      "A before/after automated workflow example",
      "An AI-assisted report",
      "A summary turning a long document into actions",
    ],
    mastery_questions: [
      "Write a structured prompt using role, context, task, and output format",
      "Improve a weak prompt and explain why the new version is better",
      "Use AI to summarise a long document into a decisions-and-actions list",
      "Build five reusable prompt templates for recurring operator tasks",
      "Draft a report with AI and edit it for accuracy and human tone",
      "Use Perplexity (or similar) for sourced research and verify the sources",
      "Catch a hallucinated fact in AI output and correct it",
      "Design a multi-step workflow where AI does the repetitive part",
      "Measure time saved on one task before and after adding AI",
      "Document an AI workflow so a teammate could reuse it",
    ],
    ai_assist:
      "This whole week is AI assist, so the meta-skill is judgement: when to trust it, when to verify, when to keep a human fully in the loop (anything involving money, legal commitments, or a client's voice on sensitive matters). Build the habit of always reading and owning AI output. The tools are powerful; your judgement is the product.",
    pre_flight:
      "Before automating anything, list the tasks you do most often and rank them by how repetitive and rule-based they are. Those are your best AI targets. Creative judgement and relationship work stay human.",
    common_mistakes: [
      "Sending AI output without reading it, so errors and generic tone slip through",
      "Vague prompts that produce vague results, then blaming the tool",
      "Pasting confidential client data into tools without checking privacy",
      "Trusting AI 'facts' and sources without verification",
    ],
    debug_help:
      "If AI keeps giving mediocre output, the prompt is the problem 90% of the time. Add the missing context: who you are, who it is for, the exact task, the format you want, and an example of good output. Iterate on the prompt instead of fixing the result by hand each time.",
    stretch: [
      "Build a simple no-code automation (e.g. a Zapier or Make zap) that uses AI",
      "Create a 'house style' prompt so AI always writes in your client's voice",
      "Compare two models on the same task and document which wins where",
    ],
    resources: [
      { label: "OpenAI prompt guidance", url: "https://platform.openai.com/docs/guides/prompt-engineering", note: "Free, official" },
      { label: "Perplexity", url: "https://www.perplexity.ai/", note: "Free tier, sourced research" },
    ],
  },
  {
    number: 6,
    title: "Project and task management",
    phase: "Team Operations",
    commitment_hours: "6, 10",
    context:
      "When a founder says 'can you just keep this organised?', they mean project management. This week you learn to plan projects, break work into tasks, coordinate a team, and report progress using the tools companies actually run on: Trello, Asana, ClickUp, Monday. You will manage a complete project end to end for Kola and build the dashboards that tell everyone where things stand at a glance.",
    topics: [
      "Project planning and breaking work into tasks",
      "Task management boards (Trello, Asana, ClickUp, Monday)",
      "Assigning owners, deadlines, and dependencies",
      "Coordinating a team's work",
      "Progress tracking and status reporting",
      "Running a project from kickoff to delivery",
      "Dashboards and at-a-glance status",
      "Handling scope, delays, and blockers",
    ],
    tasks: [
      "Break a real project into tasks with owners and deadlines",
      "Set up a project board in Trello or Asana",
      "Track progress and report status to stakeholders",
      "Identify and escalate blockers",
      "Build a simple project dashboard",
    ],
    project:
      "Plan and 'run' a complete project for Kola, the December holiday sale launch: build the task board (with owners, deadlines, and dependencies), write the project plan, produce two weekly status reports, and create a dashboard showing progress at a glance. Portfolio artefact #6.",
    exercises: [
      "Decompose a launch into 15-25 tasks with owners and due dates",
      "Build a Trello/Asana board with lists, cards, labels, and dates",
      "Write a one-page project status report",
      "Create a dashboard view that shows progress and blockers",
    ],
    questions: [
      "How do you break a vague goal into a trackable plan?",
      "What does a useful status report contain?",
      "How do you keep a project moving when someone is blocked?",
    ],
    outputs: [
      "A project plan with tasks, owners, and deadlines",
      "A live project board",
      "Two weekly status reports",
      "A progress dashboard",
    ],
    mastery_questions: [
      "Break a project goal into tasks with clear owners and deadlines",
      "Set up a board with To Do / Doing / Done and meaningful labels",
      "Add dependencies so blocked tasks are visible",
      "Write a status report covering progress, risks, and next steps",
      "Build a dashboard that shows project health at a glance",
      "Identify a blocker and write the escalation message",
      "Estimate and sequence tasks realistically",
      "Run a project kickoff: goal, scope, roles, timeline",
      "Update a board and re-plan when a deadline slips",
      "Hand a project board to someone else with no verbal explanation needed",
    ],
    ai_assist:
      "Use AI to break a goal into a task list, draft a project plan, and turn raw board updates into a clean status report. Ask it to spot risks and missing steps in your plan. You stay the coordinator who knows the people and the real priorities; AI just speeds the paperwork.",
    pre_flight:
      "Before building a board, write the project's one-line goal and its deadline. Every task should ladder up to that goal. If a task does not, question whether it belongs.",
    common_mistakes: [
      "Tasks with no owner or no deadline, so nothing actually moves",
      "A beautiful board no one updates, so it goes stale",
      "Reporting activity ('lots happening') instead of progress against the goal",
      "Hiding blockers instead of escalating them early",
    ],
    debug_help:
      "If a project is drifting, it is usually because tasks are too big or ownership is fuzzy. Break the stuck task into smaller concrete steps and assign one named owner with one date. Momentum returns when the next action is small and clearly someone's job.",
    stretch: [
      "Learn one automation in your PM tool (auto-move cards, due-date reminders)",
      "Build a reusable project template for recurring launches",
      "Create a RACI chart for who is responsible, accountable, consulted, informed",
    ],
    resources: [
      { label: "Trello Guide", url: "https://trello.com/guide", note: "Free, official" },
      { label: "Asana resources", url: "https://asana.com/resources", note: "Free, PM guides" },
    ],
  },
  {
    number: 7,
    title: "Customer support operations",
    phase: "Customer Experience",
    commitment_hours: "6, 10",
    context:
      "Customer support is where many remote operators earn their first international paycheck, and where Kola keeps its customers. This week you learn to run support like a pro: handling tickets, writing a response library, the basics of CRMs and help desks, and resolving conflict so an angry customer becomes a loyal one. You will run a support simulation for Kola and build the response library that makes good support fast and consistent.",
    topics: [
      "Customer service fundamentals and mindset",
      "Support channels and ticketing systems",
      "Help desk tools (Zendesk, Freshdesk, Gmail-as-helpdesk)",
      "Writing a response/macro library",
      "CRM basics and customer records",
      "Conflict resolution and de-escalation",
      "Response time, tone, and consistency",
      "Turning support into retention",
    ],
    tasks: [
      "Handle a queue of mixed support tickets",
      "Write a library of response templates (macros)",
      "Set up or simulate a basic help desk / CRM",
      "De-escalate a difficult customer in writing",
      "Track and report support metrics",
    ],
    project:
      "Run a Kola support simulation: work a queue of 15 realistic tickets (orders, refunds, complaints, questions), build a response library of 10+ macros, log customers in a simple CRM, and write a short report on what you handled and what could reduce future tickets. Portfolio artefact #7.",
    exercises: [
      "Resolve five varied support tickets with appropriate tone and action",
      "Write 10 reusable response macros for common situations",
      "De-escalate one genuinely angry customer in writing",
      "Build a simple CRM/customer log and record interactions",
    ],
    questions: [
      "What turns a one-time buyer into a loyal customer through support?",
      "When do you use a template versus a personal reply?",
      "How do you de-escalate without giving away the business?",
    ],
    outputs: [
      "A worked ticket queue with resolutions",
      "A 10+ macro response library",
      "A simple CRM/customer log",
      "A short support report with metrics",
    ],
    mastery_questions: [
      "Resolve a refund request following a clear, fair policy",
      "Write a response macro and adapt it for a real ticket",
      "De-escalate an angry customer using acknowledge, apologise, act",
      "Prioritise a queue by urgency and impact",
      "Log a customer interaction in a CRM with the key details",
      "Turn a complaint into a retention moment with a concrete gesture",
      "Write a clear answer to a confused customer's question",
      "Set and communicate a realistic response-time expectation",
      "Identify a recurring ticket type and propose a fix that prevents it",
      "Report support volume, resolution, and common issues",
    ],
    ai_assist:
      "Use AI to draft macros, suggest de-escalation phrasing, and summarise a long customer history before you reply. Ask it to rewrite a reply to sound more empathetic or more concise. Keep the human in the loop on refunds, exceptions, and anything emotional, customers can tell when they are talking to a robot.",
    pre_flight:
      "Before working the queue, decide your policies: what is the refund rule, what can you offer to make things right, and what must go to the founder? Knowing your limits in advance makes you fast and confident.",
    common_mistakes: [
      "Slow responses that let a small issue grow into anger",
      "Copy-pasting a macro that does not fit the actual situation",
      "Getting defensive or quoting policy at an upset customer",
      "Not logging interactions, so the next person starts blind",
    ],
    debug_help:
      "If customers keep escalating, look at your first reply: does it acknowledge their feeling and give a concrete next action with a timeline? Most escalation comes from a first response that felt robotic or vague. Lead with a human acknowledgement and a specific action.",
    stretch: [
      "Build a short FAQ or help-centre article to deflect common tickets",
      "Create a tone guide so all support sounds consistent",
      "Set up basic automation: auto-acknowledgement and routing",
    ],
    resources: [
      { label: "Zendesk blog (support basics)", url: "https://www.zendesk.com/blog/", note: "Free reference" },
      { label: "Help Scout blog", url: "https://www.helpscout.com/blog/", note: "Free, support writing" },
    ],
  },
  {
    number: 8,
    title: "Social media management",
    phase: "Content Operations",
    commitment_hours: "6, 10",
    context:
      "Many founders need someone to run their social presence, and it is a service you can sell on its own. This week you learn content operations: planning a content calendar, creating simple branded graphics in Canva, scheduling posts, managing a community, and reporting on what worked. You will manage Kola's social accounts for a month on paper and produce a complete content plan a client would pay for.",
    topics: [
      "Social media basics for business accounts",
      "Content calendars and planning",
      "Creating graphics in Canva",
      "Writing captions and hooks",
      "Scheduling tools (Buffer, Meta Business Suite)",
      "Community management and engagement",
      "Analytics and reporting",
      "Maintaining a consistent brand voice",
    ],
    tasks: [
      "Build a monthly content calendar",
      "Design branded post graphics in Canva",
      "Write captions with hooks and calls to action",
      "Schedule a week of posts",
      "Report on engagement metrics",
    ],
    project:
      "Manage Kola's social media for a month: produce a 30-day content calendar, design 8 branded posts in Canva, write all captions, set up a scheduling workflow, and create a monthly analytics report template. Define the brand voice in a short guide. Portfolio artefact #8.",
    exercises: [
      "Plan a 2-week content calendar with themes and post types",
      "Design three on-brand graphics in Canva",
      "Write five captions, each with a hook and a call to action",
      "Build a monthly analytics report template",
    ],
    questions: [
      "What makes a content calendar useful rather than just a list?",
      "What is a 'hook' and why does the first line decide everything?",
      "Which metrics actually matter for a small business?",
    ],
    outputs: [
      "A 30-day content calendar",
      "8 branded Canva graphics",
      "A set of captions and a brand-voice guide",
      "A monthly analytics report template",
    ],
    mastery_questions: [
      "Build a content calendar with dates, themes, formats, and captions",
      "Design an on-brand graphic in Canva using a consistent palette",
      "Write a caption with a scroll-stopping first line",
      "Schedule posts using Buffer or Meta Business Suite",
      "Respond to comments and DMs in brand voice",
      "Read an analytics dashboard and name the best-performing post and why",
      "Write a monthly performance summary with one recommendation",
      "Define a brand voice in three to five adjectives with examples",
      "Repurpose one idea into three different post formats",
      "Plan a simple campaign around a single goal (e.g. a sale)",
    ],
    ai_assist:
      "Use AI to brainstorm content ideas, draft caption variations, and turn one idea into a week of posts. Ask it to suggest hooks and to adapt a caption to a specific platform. Keep your client's real voice and facts, AI drafts, you make it true and on-brand.",
    pre_flight:
      "Before planning content, define the goal (sales, awareness, community) and the audience. Posting without a goal produces busy work that does not move the business.",
    common_mistakes: [
      "Posting with no plan, so content is inconsistent and last-minute",
      "Generic captions with a weak or missing first line",
      "Ignoring comments and DMs, so the community goes cold",
      "Reporting vanity metrics (likes) instead of what drove sales or reach",
    ],
    debug_help:
      "If engagement is flat, look at hooks and consistency first. The first line and the first second of a post decide whether anyone stops, and an account that posts erratically loses momentum. Fix the hook, fix the cadence, then worry about everything else.",
    stretch: [
      "Create a reusable Canva brand kit and post templates",
      "Plan a full product-launch campaign across platforms",
      "Set up UTM links to track which posts drive clicks",
    ],
    resources: [
      { label: "Canva Design School", url: "https://www.canva.com/designschool/", note: "Free, official tutorials" },
      { label: "Buffer resources", url: "https://buffer.com/resources/", note: "Free, social strategy" },
    ],
  },
  {
    number: 9,
    title: "Business operations and SOPs",
    phase: "Operations & SOPs",
    commitment_hours: "6, 10",
    context:
      "This is what turns a good assistant into an operations professional: the ability to look at how a business runs and make it run better. This week you learn to map workflows, write standard operating procedures (SOPs), document processes, and spot improvements. SOPs are also how you make yourself scalable, you can hand work to others. You will build an operations manual for Kola that captures how the business actually works.",
    topics: [
      "What an SOP is and why businesses need them",
      "Process mapping and workflow documentation",
      "Writing clear, followable SOPs",
      "Identifying inefficiencies and improvements",
      "Building checklists and templates",
      "Documentation that stays current",
      "Team systems and handoffs",
      "Turning yourself into a system others can run",
    ],
    tasks: [
      "Map an existing business workflow",
      "Write a clear SOP someone else could follow",
      "Spot one inefficiency and propose a fix",
      "Build a checklist for a recurring process",
      "Assemble an operations manual",
    ],
    project:
      "Build Kola's operations manual: document at least five core processes as SOPs (order fulfilment, customer support, social posting, supplier ordering, weekly reporting), each with steps, owners, and tools, plus a process improvement proposal for the biggest bottleneck. Portfolio artefact #9.",
    exercises: [
      "Map a five-to-ten step workflow visually or in writing",
      "Write one SOP a stranger could follow without help",
      "Audit a process and propose one concrete improvement",
      "Create a reusable checklist for a recurring task",
    ],
    questions: [
      "What makes an SOP good enough that someone new can follow it?",
      "How do you find the bottleneck in a process?",
      "Why do SOPs make you more valuable, not more replaceable?",
    ],
    outputs: [
      "At least five written SOPs",
      "A process map of a core workflow",
      "A process-improvement proposal",
      "An assembled operations manual",
    ],
    mastery_questions: [
      "Write an SOP with numbered steps, owner, tools, and expected outcome",
      "Map a workflow showing each step and handoff",
      "Test an SOP by following it exactly and noting every gap",
      "Identify a bottleneck and quantify its cost in time",
      "Propose a process improvement with the before and after",
      "Build a checklist that prevents a common error",
      "Document a tool setup so it can be reproduced",
      "Organise multiple SOPs into a navigable manual",
      "Write a handoff doc so someone can take over a task",
      "Keep documentation current with a simple review cadence",
    ],
    ai_assist:
      "Use AI to turn your rough notes into a clean, structured SOP, to suggest steps you forgot, and to spot inefficiencies in a process you describe. Ask it to rewrite an SOP at a simpler reading level so anyone can follow it. You provide the real process knowledge; AI formats and pressure-tests it.",
    pre_flight:
      "Before documenting, actually do or watch the process once and note every step, including the small ones people skip in their heads. SOPs fail because the writer assumed a step was obvious.",
    common_mistakes: [
      "Writing SOPs too vaguely to actually follow ('handle the order')",
      "Documenting the ideal process instead of the real one",
      "Creating SOPs no one maintains, so they go stale and get ignored",
      "Improving a process before understanding why it works the way it does",
    ],
    debug_help:
      "If an SOP does not work, the fastest test is to follow it literally, doing only what it says. Every place you have to guess or add a step from memory is a gap to fix. The document should make your knowledge unnecessary.",
    stretch: [
      "Record a screen walkthrough (Loom-style) to pair with a written SOP",
      "Build a master index of all SOPs with owners and last-reviewed dates",
      "Propose an automation that removes a manual step entirely",
    ],
    resources: [
      { label: "Atlassian: work management", url: "https://www.atlassian.com/work-management", note: "Free reference" },
      { label: "Notion templates (SOP/wiki)", url: "https://www.notion.so/templates", note: "Free starting points" },
    ],
  },
  {
    number: 10,
    title: "Remote work mastery",
    phase: "Remote Work Mastery",
    commitment_hours: "6, 10",
    context:
      "This week is about the business of being a remote operator: how to work with international clients, understand contracts and payments, navigate freelance platforms, and apply for remote roles. The skills mean nothing if you cannot find and keep clients and get paid reliably across borders. You will complete a full remote-work simulation and set yourself up to actually earn.",
    topics: [
      "Remote work culture and communication norms",
      "Working with international clients across cultures and time zones",
      "Contracts, agreements, and scope",
      "Getting paid: international payments and invoicing",
      "Freelance platforms (Upwork, others) and how they work",
      "Finding and applying for remote jobs",
      "Rates, packages, and positioning",
      "Protecting yourself: clear terms and boundaries",
    ],
    tasks: [
      "Set up a way to receive international payments",
      "Write a simple service agreement / scope doc",
      "Create a freelance profile or job-application package",
      "Build a service package with clear deliverables and pricing",
      "Complete a remote-work simulation end to end",
    ],
    project:
      "Complete a remote-work setup and simulation: a polished freelance/job profile, a service package with tiers and pricing, a simple client agreement template, an invoice template, and a documented payment method. Run one simulated client onboarding from inquiry to signed agreement. Portfolio artefact #10.",
    exercises: [
      "Write a one-page service agreement covering scope, timeline, and payment",
      "Create an invoice template with all required details",
      "Build a service package with three tiers and clear deliverables",
      "Draft a freelance profile or cover letter for a real remote listing",
    ],
    questions: [
      "What should a basic client agreement always include?",
      "How do you get paid reliably from an international client?",
      "How do you price your services without underselling?",
    ],
    outputs: [
      "A freelance/job profile or application package",
      "A service package with pricing",
      "A client agreement and invoice template",
      "A documented international payment method",
    ],
    mastery_questions: [
      "Write a service agreement covering scope, deliverables, timeline, and payment terms",
      "Create a professional invoice with all required fields",
      "Set up at least one method to receive international payments",
      "Build a tiered service package with clear deliverables per tier",
      "Write a strong freelance profile or proposal for a real listing",
      "Set a rate and justify it against the value delivered",
      "Define your scope and the boundary for 'out of scope' work",
      "Handle a client asking for free extra work, in writing",
      "Convert time zones and propose working hours for an overseas client",
      "Run a mock onboarding from inquiry to agreed scope",
    ],
    ai_assist:
      "Use AI to draft proposals, tailor cover letters to a specific job post, polish your profile, and pressure-test your pricing. Ask it to play a skeptical client so you can practise discovery calls and objection handling. Keep your real terms and numbers; AI helps you present them well.",
    pre_flight:
      "Before setting rates, research what the role actually pays internationally and locally, and decide your minimum. Knowing your floor stops you accepting work that is not worth your time out of fear.",
    common_mistakes: [
      "Starting work with no written scope, leading to unpaid extra work",
      "Underpricing dramatically out of fear, then resenting the client",
      "No clear payment terms, so invoices get paid late or not at all",
      "Saying yes to everything and burning out instead of setting boundaries",
    ],
    debug_help:
      "If clients keep pushing scope or paying late, the fix is upstream: a clear agreement and invoice terms set at the start. When something is out of scope, point to the agreement calmly and offer it as additional paid work. Boundaries written down in advance are easy to hold.",
    stretch: [
      "Build a simple one-page portfolio website linking your projects",
      "Create a discovery-call script for new client inquiries",
      "Research and document three platforms where your ideal clients hire",
    ],
    resources: [
      { label: "Upwork resources", url: "https://www.upwork.com/resources/", note: "Free, freelancing guides" },
      { label: "Wise (international payments)", url: "https://wise.com/", note: "Cross-border payments" },
    ],
  },
  {
    number: 11,
    title: "Real client experience, part 1",
    phase: "Real Client Experience",
    commitment_hours: "8, 12",
    context:
      "Theory is over. The next two weeks are about doing real work for real (or realistic) clients across different contexts, because the difference between someone who studied this and someone who can do it is reps under real conditions. Part 1 covers two client types: a startup and an NGO. You will scope the work, deliver it, and have it reviewed against a professional standard, the way an actual engagement runs.",
    topics: [
      "Scoping a real engagement and clarifying the ask",
      "Onboarding: gathering what you need to start",
      "Delivering operations work for a startup",
      "Delivering operations work for an NGO context",
      "Managing a client relationship through a project",
      "Handling ambiguity and incomplete information",
      "Receiving and acting on feedback",
      "Documenting and handing off the work",
    ],
    tasks: [
      "Scope and plan a startup operations project",
      "Scope and plan an NGO operations project",
      "Deliver both projects to a professional standard",
      "Collect feedback and revise",
      "Document and present the completed work",
    ],
    project:
      "Complete two real-world engagements: a startup project (e.g. set up a founder's inbox, calendar, and task system, or run a product launch) and an NGO project (e.g. build a donor/contact database, draft communications, and create reporting). Each is scoped, delivered, reviewed by a mentor, and added to your portfolio.",
    exercises: [
      "Write a scope document for the startup engagement",
      "Write a scope document for the NGO engagement",
      "Produce the first deliverable for each and request feedback",
      "Revise both based on feedback and document the change",
    ],
    questions: [
      "How do you scope work when the client's request is vague?",
      "What changes when the client is an NGO versus a startup?",
      "How do you respond to critical feedback professionally?",
    ],
    outputs: [
      "Two scoped and delivered client projects",
      "Scope documents for each",
      "Mentor-reviewed deliverables",
      "Documented, presentable final work",
    ],
    mastery_questions: [
      "Turn a vague client request into a clear scope with deliverables and a deadline",
      "Run a short onboarding to gather everything needed to start",
      "Deliver a startup operations deliverable to a professional standard",
      "Deliver an NGO operations deliverable to a professional standard",
      "Ask a clarifying question that prevents a wrong assumption",
      "Incorporate mentor feedback and explain what you changed",
      "Handle missing information without stalling the whole project",
      "Communicate progress to the client during the engagement",
      "Document the finished work so the client can use it without you",
      "Present the outcome and the impact in one clear summary",
    ],
    ai_assist:
      "Use AI to accelerate the real work (drafting, structuring, summarising) but treat these engagements as the test of your judgement. The client is paying for your reliability and decisions, not for AI text. Use it to go faster, then make every deliverable genuinely yours and correct.",
    pre_flight:
      "Before starting each engagement, write what success looks like for the client in one sentence and confirm it. Most failed projects fail because the operator solved a different problem than the one the client had.",
    common_mistakes: [
      "Starting work before the scope is clear",
      "Going silent during the project instead of sending updates",
      "Treating feedback as criticism instead of direction",
      "Delivering something technically complete that misses the real need",
    ],
    debug_help:
      "If an engagement feels stuck or off-track, go back to the one-sentence goal and confirm it with the client. Re-aligning early is cheap; discovering at delivery that you built the wrong thing is expensive. When unsure, ask one sharp question rather than guessing.",
    stretch: [
      "Add a third engagement: a local business project",
      "Write a short case study of one engagement for your portfolio",
      "Ask the client for a testimonial you can use",
    ],
    resources: [
      { label: "Notion (client workspaces)", url: "https://www.notion.so/help", note: "Free, for delivery" },
      { label: "Google Workspace", url: "https://support.google.com/a/users/", note: "Free, delivery tools" },
    ],
  },
  {
    number: 12,
    title: "Real client experience, part 2",
    phase: "Real Client Experience",
    commitment_hours: "8, 12",
    context:
      "Part 2 of the real-client phase deepens the experience: a local business project and a full founder-assistant simulation where you operate as someone's right hand for a simulated week, juggling inbox, calendar, tasks, research, and support at once. This is the closest thing to the real job, and it is where everything you have learned has to work together under realistic pressure. Mentors review the whole performance.",
    topics: [
      "Delivering operations work for a local business",
      "The founder-assistant role: doing everything at once",
      "Prioritising across competing demands",
      "Context-switching without dropping balls",
      "Proactive operation (anticipating needs)",
      "End-to-end ownership of a founder's operations",
      "Performing under realistic pressure",
      "Final review and portfolio consolidation",
    ],
    tasks: [
      "Scope and deliver a local business project",
      "Run a multi-day founder-assistant simulation",
      "Manage inbox, calendar, tasks, and support together",
      "Operate proactively, not just reactively",
      "Consolidate all engagements into the portfolio",
    ],
    project:
      "Complete the local business project and the founder-assistant simulation: operate as Ama's full right hand for a simulated week, handling a live mix of inbox, calendar, tasks, research, support, and reporting, while delivering a local business engagement in parallel. Capture everything as case studies.",
    exercises: [
      "Write the scope for the local business engagement",
      "Run a simulated founder day-in-the-life and log how you prioritised",
      "Handle a sudden urgent issue mid-simulation and document the response",
      "Write a case study for each of your strongest engagements",
    ],
    questions: [
      "How do you prioritise when everything feels urgent?",
      "What does operating proactively look like in practice?",
      "How do you keep quality high while context-switching?",
    ],
    outputs: [
      "A delivered local business project",
      "A completed founder-assistant simulation log",
      "Case studies of your best engagements",
      "A consolidated, reviewed portfolio of real work",
    ],
    mastery_questions: [
      "Prioritise a list of competing tasks and justify the order",
      "Run a simulated day handling inbox, calendar, and tasks together",
      "Respond to an unexpected urgent issue without dropping other work",
      "Anticipate a need and act before being asked",
      "Deliver a local business operations project to standard",
      "Keep a clear status visible to the 'founder' throughout",
      "Switch between four task types in a day without errors",
      "Write a case study with situation, action, and result",
      "Consolidate ten projects into a coherent portfolio",
      "Reflect on the simulation and name your two biggest growth areas",
    ],
    ai_assist:
      "Use AI as your operating partner during the simulation: rapid drafting, summarising long threads, converting time zones, turning your notes into reports. The simulation tests whether you can run real operations fast and well; AI is part of how a modern operator moves quickly. Own every output.",
    pre_flight:
      "Before the simulation, set up your daily plan and your capture system so nothing gets lost when things get busy. The operators who stay calm under load are the ones whose system catches the balls, not their memory.",
    common_mistakes: [
      "Reacting to whatever is loudest instead of what matters most",
      "Letting one urgent fire cause three other things to slip silently",
      "Only doing what is asked, never anticipating",
      "Finishing the work but never packaging it as portfolio case studies",
    ],
    debug_help:
      "If the simulation feels overwhelming, that is the point, and the fix is the system, not heroics. Triage with your priorities, communicate what will wait, and trust your capture system to hold everything. Calm, communicated triage under pressure is exactly the skill being tested.",
    stretch: [
      "Add a fourth engagement type you have not tried yet",
      "Get a testimonial or reference from a real or mentor 'client'",
      "Record a short video walkthrough of your portfolio",
    ],
    resources: [
      { label: "Notion (portfolio + delivery)", url: "https://www.notion.so/help", note: "Free" },
      { label: "Loom (walkthroughs)", url: "https://www.loom.com/", note: "Free tier" },
    ],
  },
  {
    number: 13,
    title: "Career launchpad",
    phase: "Career Launchpad",
    commitment_hours: "8, 12",
    context:
      "You have the skills and ten real projects. This final week turns that into income: a professional CV, an optimised LinkedIn profile, a portfolio website, interview preparation, and a client-acquisition plan. The goal of the whole track is met here, you finish able to apply for remote roles, pitch freelance clients, and present yourself as the remote operations professional you have become. You will leave with everything packaged and ready to send.",
    topics: [
      "CV building for remote and operations roles",
      "LinkedIn profile optimisation",
      "Building a portfolio website or page",
      "Interview preparation (and the operator's interview)",
      "Client acquisition and outreach",
      "Personal brand and positioning",
      "Where to find remote work and how to apply well",
      "Your 30-day plan after graduation",
    ],
    tasks: [
      "Write a strong, results-focused CV",
      "Optimise a LinkedIn profile end to end",
      "Build a portfolio website or page linking your projects",
      "Prepare for interviews with practised answers",
      "Create a client-acquisition / job-application plan",
    ],
    project:
      "Build your complete career package: a polished CV, an optimised LinkedIn profile, a portfolio website/page showcasing your 10 projects, an interview-preparation document, and a 30-day client-acquisition plan. This is the capstone that makes you employable on day one.",
    exercises: [
      "Write a CV with results-focused bullet points (not just duties)",
      "Rewrite your LinkedIn headline, about, and experience sections",
      "Build a portfolio page linking all ten projects with short case notes",
      "Prepare answers to ten common operator interview questions",
    ],
    questions: [
      "What makes a CV stand out for a remote operations role?",
      "How should your portfolio present the ten projects?",
      "What is your specific plan to land the first client or role?",
    ],
    outputs: [
      "A professional CV",
      "An optimised LinkedIn profile",
      "A portfolio website/page",
      "An interview-prep doc and a 30-day acquisition plan",
    ],
    mastery_questions: [
      "Write a CV bullet that shows a result, not just a responsibility",
      "Craft a LinkedIn headline that states who you help and how",
      "Write a LinkedIn 'about' section in your voice with a clear call to action",
      "Build a portfolio page that links and frames your ten projects",
      "Write a case note for one project (situation, action, result)",
      "Answer 'tell me about yourself' for an operations role in 60 seconds",
      "Answer a behavioural question using a clear situation-action-result story",
      "Write a cold outreach message to an ideal client",
      "Create a target list of 20 potential clients or employers",
      "Write your concrete 30-day plan to land paid work",
    ],
    ai_assist:
      "Use AI to draft and sharpen your CV bullets, LinkedIn copy, portfolio case notes, and outreach messages, then make them unmistakably yours. Ask it to interview you with hard questions and critique your answers. The final presentation of you should sound like you at your most clear and confident, not like generic AI copy.",
    pre_flight:
      "Before writing your CV and profile, list every concrete result from your ten projects: time saved, things organised, customers handled, deliverables shipped. Your materials should be built from real evidence, not adjectives.",
    common_mistakes: [
      "A CV that lists duties instead of results",
      "A LinkedIn profile that is a job-title list with no positioning",
      "A portfolio that shows files with no context on the impact",
      "Finishing the course but never actually sending a single application",
    ],
    debug_help:
      "If your materials feel weak, the fix is almost always specificity: replace 'managed social media' with 'planned and ran a 30-day content calendar that did X'. Concrete, evidenced claims from your real projects are what make you credible. You have the evidence, use it.",
    stretch: [
      "Record a 60-second video intro for your profile",
      "Apply to five real listings or pitch five real prospects this week",
      "Set up a simple system to track applications and follow-ups",
    ],
    resources: [
      { label: "LinkedIn Help", url: "https://www.linkedin.com/help/linkedin", note: "Free, profile basics" },
      { label: "Canva (CV + portfolio templates)", url: "https://www.canva.com/", note: "Free templates" },
    ],
  },
];
