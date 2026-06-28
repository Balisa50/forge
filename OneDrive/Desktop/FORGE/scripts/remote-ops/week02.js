/* Week 2 - Digital productivity systems (Phase: Digital Productivity) */
module.exports = {
  number: 2,
  title: "Digital productivity systems",
  phase: "Digital Productivity",
  commitment_hours: "6, 10",
  context:
    "A remote operator is only as good as their system. Last week you learned to communicate; this week you build the machine that lets you keep ten things straight without dropping any. When you are juggling Ama's inbox, the team's tasks, supplier files, and your own work, memory is not a plan. Memory is how things get lost.\n\n" +
    "You will build a real digital workspace: a clean file structure in Google Drive, a second brain in Notion, a single place where every task lives, and a daily planning habit. The test is simple, by Friday a stranger should be able to open your workspace and find any file in under ten seconds, and you should never again answer a client with \"sorry, I think I lost that\".\n\n" +
    "By the end of the week you will have a workspace you could hand to a client on day one and look like someone who has done this for years.",
  concept_check: [
    {
      q: "Ama asks for 'the September supplier invoice' and you have 400 files in one folder with names like 'invoice', 'invoice (1)', 'scan2'. What is the real problem?",
      choices: [
        "You need a faster computer",
        "You need a folder structure and a naming convention so files are findable",
        "You should delete old files",
        "You should email Ama to ask which invoice she means",
      ],
      correct: 1,
      explain: "Findability is a system problem, not a memory or speed problem. A logical folder tree plus a naming convention means you find anything in seconds, even files you never touched.",
    },
    {
      q: "You capture tasks in your head, on sticky notes, in WhatsApp to yourself, and in three different apps. What happens?",
      choices: [
        "You stay flexible and fast",
        "Things slip through the cracks because there is no single source of truth",
        "Nothing, as long as you check all of them",
        "It only matters for big tasks",
      ],
      correct: 1,
      explain: "Scattered capture guarantees dropped work. The core rule of any productivity system is one trusted place where every task lives, so you only have to look in one spot.",
    },
    {
      q: "Which system is better: a beautiful, complex Notion setup with 12 databases, or a simple one you actually update every day?",
      choices: [
        "The complex one, it is more professional",
        "The simple one you actually maintain",
        "They are equal",
        "Neither, use paper",
      ],
      correct: 1,
      explain: "A system you abandon is worthless. The best system is the simplest one that prevents lost work and that you will genuinely keep up. Maintainability beats sophistication.",
    },
  ],
  days: [
    {
      number: 0,
      title: "Why a system beats memory, and set up your tools",
      summary: "Understand why operators run on systems, then create your Drive and Notion accounts and the base structure.",
      items: [
        {
          kind: "lesson",
          title: "Memory is not a system",
          body:
            "## The hidden job of an operator\n" +
            "Last week was about the words you send. This week is about the machine behind them. When Ama hands you her operations, she is also handing you the mental load she was carrying: where is that file, did that task get done, when is that deadline. If you carry all of that in your head, you become the bottleneck, and eventually you drop something. The fix is to move the load out of your head and into a system.\n\n" +
            "## What a 'system' actually means\n" +
            "A productivity system is just three reliable habits with tools behind them:\n" +
            "1. **One place for files** that is organised so anything is findable in seconds.\n" +
            "2. **One place for tasks** so nothing is ever 'kept in mind' (and therefore forgotten).\n" +
            "3. **One daily rhythm** that turns a pile of work into a plan.\n\n" +
            "That is it. Not twelve apps. The operators who look calm under a heavy load are not superhuman, their system is catching the balls so their brain does not have to.\n\n" +
            "## Why this is worth a whole week\n" +
            "A client cannot see your effort, but they feel your reliability. \"Can you send me the August sales sheet?\" answered in fifteen seconds, every time, is what makes Ama trust you with bigger things. \"Um, let me look for it...\" said twice is what makes her start doing the work herself again. The system is invisible until the moment it saves you, and it saves you constantly.\n\n" +
            "## This week's destination\n" +
            "You will set up a real Google Drive structure, a Notion second brain with a task board, a naming convention, and a daily planning template, then write a one-page guide so anyone could navigate it. That guide plus the workspace is portfolio artefact number two.",
        },
        {
          kind: "lesson",
          title: "Set up your workspace foundation, step by step",
          body:
            "## Do this now\n" +
            "You only need free tools this week. Set up the two that run almost every remote operation.\n\n" +
            "**1. Google Drive.** You already have a Google account from Week 1, so you have Drive. Go to drive.google.com. Create one top-level folder named for your client, for example `Kola`. Inside it, create these subfolders: `01 Admin`, `02 Finance`, `03 Suppliers`, `04 Customers`, `05 Marketing`, `06 SOPs`. The number prefixes force a sensible order instead of alphabetical chaos. You should now see a clean, numbered list of folders, this is the spine of everything.\n\n" +
            "**2. Notion.** Go to notion.so and sign up free with your professional email. Create a new page called `Kola HQ`. This will become your second brain: a task board, notes, and links to the Drive folders, all in one place. Do not build anything fancy yet, just create the page. You should see a blank page with a title, that is the starting point for Day 3.\n\n" +
            "**3. A test file.** Drop any document into `01 Admin` so the structure is not empty. Right-click it and check you can rename and move it. Confirm you can share a folder: right-click `Kola` > Share, and notice the permission options (Viewer, Commenter, Editor). You will use those constantly.\n\n" +
            "That is the foundation. Everything this week hangs off these two tools.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Number-prefixing folders (01 Admin, 02 Finance) is pointless because Drive sorts alphabetically anyway.",
              answer: false,
              whenRight: "Correct. That is exactly why you prefix them: numbers force the order YOU want instead of alphabetical accident, so the important folders sit where you expect.",
              whenWrong: "The prefix is the point. Alphabetical sorting scatters your folders randomly; '01', '02' pins them in a deliberate, logical order.",
            },
            {
              prompt: "The goal of a productivity system is to have as many specialised apps as possible.",
              answer: false,
              whenRight: "Right. More apps means more places to check and more places to lose things. The goal is few, trusted places: one for files, one for tasks, one daily rhythm.",
              whenWrong: "No. App-sprawl is the disease, not the cure. A good system uses few trusted places so you never wonder where something lives.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build the foundation",
          body:
            "Tick each box only when it is truly done.\n\n" +
            "- [ ] Created a top-level Drive folder for your client (e.g. `Kola`)\n" +
            "- [ ] Created the six numbered subfolders (Admin, Finance, Suppliers, Customers, Marketing, SOPs)\n" +
            "- [ ] Signed up for Notion (free) with your professional email and created a `Kola HQ` page\n" +
            "- [ ] Dropped a test file into `01 Admin` and confirmed you can rename, move, and share it\n" +
            "- [ ] Checked the three Drive sharing permission levels (Viewer, Commenter, Editor)\n\n" +
            "Deliverable: a screenshot of your Drive folder structure.",
        },
      ],
    },
    {
      number: 1,
      title: "File organisation and naming conventions",
      summary: "A naming convention turns a pile of files into a searchable database.",
      items: [
        {
          kind: "lesson",
          title: "Name files so future-you can find them",
          body:
            "## The problem with 'invoice (3)'\n" +
            "Default file names are written for the moment you save them and useless a week later. `scan2.pdf`, `invoice.pdf`, `final_FINAL_v2.docx`, none of these tell you what is inside without opening it. Multiply by 400 files and you have a swamp.\n\n" +
            "## A naming convention\n" +
            "A convention is just an agreed pattern for naming every file. A reliable one for operations work:\n\n" +
            "`YYYY-MM-DD_Category_Description_vN`\n\n" +
            "Examples:\n" +
            "- `2026-09-03_Invoice_NorthernWeavers_baskets.pdf`\n" +
            "- `2026-09-01_Report_AugustSales.xlsx`\n" +
            "- `2026-08-28_Contract_AmaSignature_v2.pdf`\n\n" +
            "Why it works: the date-first format sorts chronologically on its own, the category groups similar files, the description tells you the contents at a glance, and the version number kills the 'final_FINAL' problem. You can now find any file by sorting by name or searching one keyword.\n\n" +
            "## Pick one and never deviate\n" +
            "The power is in consistency. A perfect convention you follow half the time is worse than a simple one you follow every time. Decide your pattern, write it at the top of your `06 SOPs` folder, and apply it to every new file from now on. When you join a client who already has a convention, use theirs, do not impose yours.\n\n" +
            "## A word on folders vs search\n" +
            "Good names make folders less critical, because you can search. But folders still matter for sharing (you share a folder, not 50 files) and for the mental map. Aim for shallow folders (two or three levels deep at most); deeply nested folders are where files go to die.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Starting file names with the date in YYYY-MM-DD format makes them sort in chronological order automatically.",
              answer: true,
              whenRight: "Yes. YYYY-MM-DD sorts correctly as text, so a name-sort becomes a date-sort for free. That is why date-first naming is so common in operations.",
              whenWrong: "It does work. Because YYYY-MM-DD sorts the same as text and as dates, putting it first makes your files line up chronologically with no effort.",
            },
            {
              prompt: "A simple naming convention you follow every time beats a perfect one you follow half the time.",
              answer: true,
              whenRight: "Right. Consistency is the whole value. A pattern with gaps is unreliable, and an unreliable system is one you stop trusting.",
              whenWrong: "Consistency wins. The benefit comes from EVERY file matching the pattern; a half-followed convention leaves you guessing again.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Design and apply a convention",
          body:
            "1. Write your file naming convention in one line, with the pattern and what each part means.\n" +
            "2. Give five example file names that follow it (an invoice, a report, a contract, a product photo, a meeting note).\n" +
            "3. Take five badly-named sample files (make them up: 'doc1', 'IMG_4432', 'final', 'new sheet', 'untitled') and rename each to your convention.\n" +
            "4. Save the convention as a note in your `06 SOPs` folder so it is documented for any future teammate.\n\n" +
            "Deliverable: the convention line plus before/after names for the five files.",
        },
      ],
    },
    {
      number: 2,
      title: "Google Workspace and sharing without leaks",
      summary: "Docs, Sheets, and Drive sharing done right, including the permission mistakes that embarrass people.",
      items: [
        {
          kind: "lesson",
          title: "Drive, Docs, Sheets, and safe sharing",
          body:
            "## The three tools you will live in\n" +
            "Most remote operations run on Google Workspace because it is free, collaborative, and everyone has it.\n" +
            "- **Docs** for anything written: SOPs, meeting notes, drafts, plans. Real-time collaboration means Ama can comment without emailing a new version back and forth.\n" +
            "- **Sheets** for anything with rows: order trackers, budgets, content calendars, contact lists. You do not need to be an Excel wizard; basic formulas (SUM, simple filtering, sorting) cover most operations work.\n" +
            "- **Drive** to hold it all, organised with your folders and convention.\n\n" +
            "## Sharing: the part people get wrong\n" +
            "Sharing is where careless operators leak data or block access. The rules:\n" +
            "- **Share folders, not individual files**, where possible, so new files inside are covered automatically.\n" +
            "- **Pick the right permission**: Viewer (can read), Commenter (can suggest, cannot change), Editor (can change everything). Default to the least access that lets the person do their job. A supplier needs Viewer on a purchase order, not Editor.\n" +
            "- **Be careful with 'Anyone with the link'.** It is convenient and dangerous, anyone who ever gets that link can see the file forever. For sensitive things (finance, contracts), share with specific email addresses only.\n" +
            "- **Check before you send.** Before sharing a link with a client, open it in an incognito window to confirm it actually works and shows what you intend. The 'you need access' reply is a small but avoidable credibility hit.\n\n" +
            "## A reliability habit\n" +
            "When you create something a client will need, share it proactively and say so: \"I have put the August report in the Finance folder and shared it with you, link here.\" They never have to ask where things are. That is the feeling you are selling.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Giving a supplier 'Editor' access to your purchase order is the safe default.",
              answer: false,
              whenRight: "Correct. Default to the least access needed. A supplier should usually get Viewer; Editor lets them change the document, which you rarely want.",
              whenWrong: "Too much access. The safe default is the minimum that lets them do the job. For reading a PO, that is Viewer, not Editor.",
            },
            {
              prompt: "Opening a share link in an incognito window before sending it is a smart way to confirm it works.",
              answer: true,
              whenRight: "Yes. Incognito shows what an outsider sees, so you catch 'you need access' errors before the client does.",
              whenWrong: "It is smart. Incognito simulates someone who is not logged in as you, which is the fastest way to verify a link actually works for the recipient.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Build a tracker and share it safely",
          body:
            "1. In Google Sheets, build a simple order tracker for Kola with columns: Order ID, Customer, Item, Date, Status, Amount.\n" +
            "2. Add five sample rows and a SUM of the Amount column.\n" +
            "3. Save it into your `04 Customers` folder using your naming convention.\n" +
            "4. Share it with one test address as Commenter, then open the link in an incognito window to confirm it works and shows the right access.\n\n" +
            "Deliverable: a screenshot of the tracker plus a note of which permission you used and why.",
        },
      ],
    },
    {
      number: 3,
      title: "Notion as a second brain",
      summary: "Turn the blank Notion page into a real operations hub: tasks, notes, and links in one place.",
      items: [
        {
          kind: "lesson",
          title: "Build your operations hub in Notion",
          body:
            "## Why Notion\n" +
            "Drive holds your files. Notion holds everything else: your tasks, your notes, your client information, your links, your SOPs index, all on pages you can shape however you want. Think of it as the front desk of your operation, the one page you open first every morning.\n\n" +
            "## The minimum viable hub\n" +
            "Do not build a cathedral. On your `Kola HQ` page, add four sections (type `/` in Notion to insert blocks):\n" +
            "1. **A task board.** Add a Board database (type `/board`). It gives you columns To Do, In Progress, Done. Each card is a task you drag across as it moves. This is your single source of truth for work.\n" +
            "2. **Quick notes.** A simple text area for things you need to remember: passwords location, Ama's preferences, recurring questions.\n" +
            "3. **Key links.** Links to the Drive folders, the order tracker, the website admin, so you never hunt for them.\n" +
            "4. **People.** A short list of who is who: Ama, the team, key suppliers, key customers, with one line each.\n\n" +
            "## The discipline that makes it work\n" +
            "A second brain only works if you actually put things in it. Build the habit: the moment a task appears (an email, a request, a thought in the shower), it goes on the board, not in your head. The moment you learn something about the client (Ama prefers voice notes, the courier is closed Sundays), it goes in quick notes. Capture first, organise later. An empty, tidy Notion is useless; a slightly messy one you actually use is gold.\n\n" +
            "## Notion vs Drive vs Sheets, when to use which\n" +
            "Rough rule: structured rows of data go in Sheets, long written documents go in Docs/Drive, and your day-to-day operating hub (tasks, notes, links) goes in Notion. Notion can do databases too, so some people run trackers there as well, either is fine. Pick what you will maintain.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A second brain works best when you capture tasks and notes into it the moment they appear, not later.",
              answer: true,
              whenRight: "Yes. Capture-first is the whole point: if it goes into the system immediately, it cannot be forgotten. Sorting can happen later.",
              whenWrong: "Capture-first is the key habit. If you wait to log things 'later', later often never comes and the task is lost.",
            },
            {
              prompt: "You should build the most elaborate Notion setup possible before you start using it.",
              answer: false,
              whenRight: "Correct. Start minimal and grow it as real needs appear. An over-built system you do not maintain is worse than a simple one you use daily.",
              whenWrong: "No. Elaborate-before-use is how systems get abandoned. Build the minimum hub, use it, and add only what you actually need.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Build the Kola HQ hub",
          body:
            "On your `Kola HQ` Notion page, build the four sections:\n" +
            "- [ ] A Board database (To Do / In Progress / Done) with at least five real-looking tasks\n" +
            "- [ ] A Quick Notes section with three things to remember about the client\n" +
            "- [ ] A Key Links section linking to your Drive folders and order tracker\n" +
            "- [ ] A People section listing Ama, one teammate, and one supplier with a one-line note each\n\n" +
            "Deliverable: a screenshot (or share link) of your Kola HQ page.",
        },
      ],
    },
    {
      number: 4,
      title: "One place for every task",
      summary: "A capture system so nothing is ever 'kept in mind' and then forgotten.",
      items: [
        {
          kind: "lesson",
          title: "Capture everything, decide later",
          body:
            "## The cost of 'I will remember that'\n" +
            "Every task you hold in your head is a small, constant drain, and eventually one slips. Ama mentions in passing that the courier needs a new address; you are mid-task; you tell yourself you will do it later; you forget; a parcel goes to the wrong place. That is not carelessness, it is a system gap. The fix is total capture: every task, request, and idea goes into one trusted place the instant it appears.\n\n" +
            "## How capture works in practice\n" +
            "1. **One inbox for tasks.** Your Notion board's To Do column (or a Sheet, or a simple list) is the only place tasks live. Email requests, WhatsApp asks, your own ideas, all land here.\n" +
            "2. **Make capture frictionless.** It has to take five seconds or you will not do it. Keep Notion open in a pinned tab; on your phone, use the Notion app or even a quick note you sweep into the board daily.\n" +
            "3. **A task is a clear action.** Write 'Email courier the new pickup address by Thu' not 'courier'. A vague task is one you will avoid because you have to re-think it every time you see it.\n\n" +
            "## Process, do not just collect\n" +
            "Capture without processing becomes a graveyard. Once a day, run your task list: for each item, do it now if it takes under two minutes, schedule it if it is bigger, delegate it if it is not yours, or delete it if it no longer matters. This quick daily pass keeps the list trustworthy, and a trustworthy list is one your brain can finally let go of.\n\n" +
            "## The payoff\n" +
            "When everything is captured and processed, you can honestly tell a client \"it is on my list and it will be done by Thursday\" and mean it. That sentence, reliably true, is worth more than any single piece of work.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A task written as 'courier' is just as useful as 'Email courier the new pickup address by Thursday'.",
              answer: false,
              whenRight: "Correct. A vague task makes you re-think it every time, so you avoid it. A clear action with a deadline is one you can just do.",
              whenWrong: "Not equal. 'Courier' forces you to reconstruct what you meant. A specific action plus a deadline is what actually gets done.",
            },
            {
              prompt: "If a captured task takes under two minutes, the efficient move is usually to just do it now.",
              answer: true,
              whenRight: "Yes. The two-minute rule: tiny tasks cost more to track than to do, so clear them immediately during your daily pass.",
              whenWrong: "Doing it now is usually right. Tracking a 30-second task across days costs more attention than just finishing it on the spot.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Run a capture and process pass",
          body:
            "1. Brain-dump every task, real or imagined, for running Kola for a week into your task board's To Do column (aim for 12 to 15).\n" +
            "2. Rewrite any vague ones as clear actions with a verb and, where it matters, a deadline.\n" +
            "3. Process the list: mark which you would do now (under two minutes), schedule, delegate, or delete.\n\n" +
            "Deliverable: your processed task list with each item labelled do-now / schedule / delegate / delete.",
        },
      ],
    },
    {
      number: 5,
      title: "Time management and the daily plan",
      summary: "Time-blocking turns a long task list into a realistic day.",
      items: [
        {
          kind: "lesson",
          title: "Plan the day, not just the list",
          body:
            "## A list is not a plan\n" +
            "A task list tells you what to do. It does not tell you when, and it has no sense of how many hours you actually have. That is why long lists feel overwhelming and half-finished: you keep starting whatever is loudest and run out of day. A plan assigns tasks to time.\n\n" +
            "## Time-blocking\n" +
            "Time-blocking means giving each chunk of work a slot on your calendar. Instead of a floating list of ten things, your day looks like:\n" +
            "- 09:00 to 09:30, process inbox and reply to anything under five minutes\n" +
            "- 09:30 to 10:30, ship yesterday's orders and update the tracker\n" +
            "- 10:30 to 11:00, supplier follow-ups\n" +
            "- 11:00 to 12:00, build the content calendar (focus block, no chat)\n\n" +
            "Two things happen. First, you confront reality, you cannot block twelve hours of work into a six-hour day, so you prioritise honestly. Second, you defend focus, a labelled block is a promise to yourself that this hour is for this one thing.\n\n" +
            "## The daily plan ritual\n" +
            "Spend the first ten minutes of each day (or the last ten of the day before) turning your task list into a blocked plan. Pick the two or three things that matter most and block them first, ideally in your sharpest hours. Leave buffer, things overrun and urgent issues land, so a day packed to the minute always breaks. Aim to plan about 70% of your time and leave the rest for the unexpected.\n\n" +
            "## Match energy to task\n" +
            "Do demanding, brain-heavy work (writing a report, planning) when you are freshest. Save shallow work (filing, simple replies) for low-energy stretches. An operator who schedules the hard thing for their best hour gets more done than one who grinds randomly all day.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Blocking your entire day minute-to-minute with no buffer is the most productive approach.",
              answer: false,
              whenRight: "Correct. No buffer means the first overrun or urgent issue breaks the whole plan. Plan about 70% and leave room for reality.",
              whenWrong: "Over-packing backfires. Tasks run long and surprises happen; a plan with no buffer collapses by mid-morning. Leave slack.",
            },
            {
              prompt: "It is smart to schedule your hardest, most focus-heavy task for your sharpest hours.",
              answer: true,
              whenRight: "Yes. Match energy to task: deep work in your best hours, shallow work when you are tired. You get far more from the same day.",
              whenWrong: "It is smart. Your best hours are scarce; spending them on demanding work (and leaving filing for tired hours) maximises output.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Build a time-blocked day",
          body:
            "1. Take your processed task list from Day 4.\n" +
            "2. Build a time-blocked plan for one realistic working day (use your real available hours), assigning each major task a slot.\n" +
            "3. Put your two most important tasks in your sharpest hours, and leave at least 30% of the day as buffer.\n" +
            "4. Save this as a reusable `Daily Plan` template in Notion or Docs.\n\n" +
            "Deliverable: your blocked day plus the blank reusable template.",
        },
      ],
    },
    {
      number: 6,
      title: "Information management and the weekly review",
      summary: "Keep the system clean so it stays trustworthy, with one habit: the weekly review.",
      items: [
        {
          kind: "lesson",
          title: "The weekly review keeps the system alive",
          body:
            "## Systems decay without maintenance\n" +
            "Any system drifts. Files land in the wrong folder, tasks pile up half-done, notes go stale. Left alone for a month, even a good setup becomes a mess you no longer trust, and a system you do not trust is one you abandon. The cure is a small, regular maintenance habit: the weekly review.\n\n" +
            "## The weekly review, in 20 minutes\n" +
            "Once a week (Friday afternoon works well), run a short loop:\n" +
            "1. **Clear the task inbox.** Process anything that got captured but not sorted.\n" +
            "2. **Review the board.** Move done tasks to Done, re-date anything that slipped, delete what no longer matters.\n" +
            "3. **Tidy files.** Move any stray files into the right folders, fix any names that broke the convention.\n" +
            "4. **Look ahead.** Glance at next week, what deadlines, meetings, or deliverables are coming? Block the big ones now.\n" +
            "5. **Write the client update.** A weekly Done/Doing/Blocked (from Week 1) falls out of this review naturally, you have just looked at everything.\n\n" +
            "## Information management\n" +
            "Beyond tasks and files, you accumulate knowledge about the client: how Ama likes things, supplier quirks, recurring customer questions. Capture this somewhere durable (your Notion notes, or a 'client playbook' doc) instead of in your memory. When you eventually hand work to someone else, or come back after a break, that captured knowledge is what lets the operation run without you holding it all in your head.\n\n" +
            "## The compounding effect\n" +
            "Twenty minutes a week keeps the whole system trustworthy, which means every other day runs faster. Skip it for a month and you spend a painful afternoon digging out. The review is the cheapest insurance you will buy.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A productivity system, once set up, stays organised on its own.",
              answer: false,
              whenRight: "Correct. Every system drifts. Without a small regular review, files scatter and tasks rot until you stop trusting it.",
              whenWrong: "It does not. Systems decay; a weekly review is the maintenance that keeps yours trustworthy enough to actually rely on.",
            },
            {
              prompt: "A weekly review naturally produces the material for your weekly client status update.",
              answer: true,
              whenRight: "Yes. By the end of the review you have looked at everything done, in progress, and blocked, which is exactly the update.",
              whenWrong: "It does. Since the review surveys all your work, the Done/Doing/Blocked update writes itself from what you just saw.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Write and run a weekly review checklist",
          body:
            "1. Write a weekly review checklist (the five steps, adapted to your setup) and save it in `06 SOPs`.\n" +
            "2. Actually run it on your current workspace: clear the task inbox, tidy the board, fix any file names, and note next week's deadlines.\n" +
            "3. From the review, draft a one-paragraph Done/Doing/Blocked update for Ama.\n\n" +
            "Deliverable: the checklist plus the status update it produced.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship your digital workspace",
      summary: "Package the workspace and write the one-page guide. Portfolio artefact #2.",
      items: [
        {
          kind: "lesson",
          title: "Make the workspace handover-ready",
          body:
            "## A workspace is only done when someone else can use it\n" +
            "You have built a Drive structure, a naming convention, a Notion hub, a capture system, a daily plan, and a weekly review. The final step turns it from 'your setup' into a professional asset: documentation. A workspace a client can understand without you standing over their shoulder is what separates an operator from a freelancer who keeps everything in their own head.\n\n" +
            "## The one-page workspace guide\n" +
            "Write a single page that explains your system to a newcomer:\n" +
            "- Where files live (the folder structure and what each folder is for)\n" +
            "- The naming convention, with examples\n" +
            "- Where tasks live and how the board works\n" +
            "- The daily plan and weekly review rhythm\n" +
            "- Key links\n\n" +
            "Keep it short and plain. The test: could Ama, or a future second assistant, read this page and navigate everything without asking you a single question?\n\n" +
            "## Why this is portfolio gold\n" +
            "When you pitch a future client, 'I will organise your operations' is a claim. This workspace plus its guide is proof. It shows you do not just do tasks, you build systems that make a business run smoother, and that is a far more valuable, far better-paid thing to be.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A workspace counts as finished once it works for you, even if no one else could navigate it.",
              answer: false,
              whenRight: "Correct. The professional standard is handover-ready: documented so a client or future teammate can use it without you. That is what makes it an asset.",
              whenWrong: "Not finished. A system only you understand keeps you as the bottleneck. Documentation is what turns it into something a business can rely on.",
            },
            {
              prompt: "Documenting your system makes you more valuable, not more replaceable.",
              answer: true,
              whenRight: "Yes. It proves you build systems, not just do tasks, which is the higher-paid skill. It also frees you to take on more.",
              whenWrong: "More valuable. Operators who build documented systems get trusted with bigger responsibilities; the ones who hoard knowledge stay stuck doing the same tasks.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Final build: workspace + one-page guide",
          body:
            "This is the Week 2 portfolio deliverable.\n\n" +
            "**Part A.** Make sure your workspace is complete and tidy: Drive folders with the convention applied, the Notion hub with a real task board, your daily plan template, and your weekly review checklist.\n\n" +
            "**Part B.** Write the one-page Workspace Guide covering file locations, the naming convention, the task system, the daily/weekly rhythm, and key links. Make it readable by a total newcomer.\n\n" +
            "Export the guide as a PDF named `Workspace-Guide-YourName.pdf` and keep the workspace shareable. This is portfolio artefact #2.",
        },
      ],
    },
  ],
  topics: [
    "Google Workspace (Docs, Sheets, Drive) for operators",
    "Microsoft Office basics and when clients use it",
    "Notion as a second brain and client hub",
    "Cloud storage and file organisation",
    "A consistent file naming convention",
    "Total capture: one place for every task",
    "Time management and time-blocking",
    "The weekly review and keeping a system alive",
  ],
  tasks: [
    "Build a clean Google Drive folder structure for a client",
    "Adopt a file naming convention and apply it",
    "Create a Notion hub with a task board and notes",
    "Set up a total-capture task system",
    "Create a daily time-blocking template",
    "Write and run a weekly review checklist",
    "Document the workspace in a one-page guide",
  ],
  project:
    "Build a complete digital workspace for Kola: an organised Drive with a folder structure and naming convention, a Notion hub with a task board, a daily-plan template, and a weekly review checklist. Document it in a one-page Workspace Guide a newcomer could follow. Portfolio artefact #2.",
  exercises: [
    "Design and document a file naming convention with five examples",
    "Build a Notion task board with status columns and real tasks",
    "Build a Google Sheet tracker and share it with correct permissions",
    "Create a time-blocked daily plan and a reusable template",
    "Write a weekly review checklist and run it once",
  ],
  questions: [
    "Why does an operator need a system rather than relying on memory?",
    "What makes a good file naming convention?",
    "When would you choose Notion over Google Docs, or vice versa?",
  ],
  outputs: [
    "Organised cloud workspace (Drive + Notion)",
    "Documented file naming convention",
    "Notion hub with task board",
    "Daily-plan template and weekly review checklist",
    "One-page Workspace Guide (PDF)",
  ],
  mastery_questions: [
    "Create a logical, numbered top-level folder structure for an e-commerce client",
    "Write a file naming convention and rename five badly-named files to match it",
    "Build a Notion (or Trello) task board with To Do / In Progress / Done",
    "Set up a total-capture habit so every task lands in one place",
    "Build a Google Sheet tracker with a SUM and share it as Commenter",
    "Verify a share link works by opening it in an incognito window",
    "Create a time-blocked daily plan that leaves at least 30% buffer",
    "Write a weekly review checklist and run it on a real workspace",
    "Draft a Done/Doing/Blocked update produced by your weekly review",
    "Write a one-page Workspace Guide a newcomer could follow with no help",
  ],
  ai_assist:
    "Use AI to design and document systems faster. Ask it to propose a folder structure for a specific business type, to draft your naming convention, or to turn a messy brain-dump of tasks into a structured board with clear action verbs. Ask it to draft your Workspace Guide from your bullet points. Then refine, you own the system and know the client; AI just accelerates the first draft. Do not let it invent a system you will not actually maintain.",
  pre_flight:
    "Before building anything, write down how you currently lose things: where do tasks slip, which files vanish, what do you forget? Your system should solve your real failure points, not copy a generic template. Keep that list and check at the end of the week whether each gap is now covered.",
  common_mistakes: [
    "Building an over-complicated system you will not maintain",
    "No naming convention, so files become unsearchable within a week",
    "Capturing tasks in five different places instead of one",
    "Setting 'Anyone with the link' on sensitive finance or contract files",
    "Nesting folders so deeply that files get lost three levels down",
  ],
  debug_help:
    "If your system feels like a chore, it is too complex, strip it back to the minimum that prevents lost work: one place for tasks, one logical file tree, one daily plan. If you keep losing files, your naming convention is not being applied consistently, fix the habit, not the folders. If sharing keeps failing with 'you need access', test every link in an incognito window before sending. A system you actually use beats a beautiful one you abandon.",
  stretch: [
    "Add a simple Notion CRM database to track contacts and clients",
    "Create reusable Notion templates for recurring work (order, content post)",
    "Automate one repetitive step with a Google Sheet formula or a saved filter",
  ],
  resources: [
    { label: "Notion Help & Guides", url: "https://www.notion.so/help", note: "Free, official tutorials" },
    { label: "Google Workspace Learning Center", url: "https://support.google.com/a/users/", note: "Free, Drive/Docs/Sheets" },
  ],
};
