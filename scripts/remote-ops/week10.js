/* Week 10 - Remote work mastery (Phase: Remote Work Mastery) */
module.exports = {
  number: 10,
  title: "Remote work mastery",
  phase: "Remote Work Mastery",
  commitment_hours: "6, 10",
  context:
    "You have the skills. This week is about the business of using them: working with international clients, contracts and scope, getting paid reliably across borders, freelance platforms, and applying for remote roles. The best operator in the world earns nothing if they cannot find clients, agree clear terms, and get paid. From The Gambia or anywhere in West Africa, you can work for founders in London, New York, or Dubai, this week is how you make that real and protect yourself while doing it.\n\n" +
    "You will build a complete remote-work setup: a freelance/job profile, a service package with pricing, a client agreement and invoice template, a documented payment method, and a simulated client onboarding from inquiry to signed agreement. By Friday you are set up to actually earn, not just to do the work.\n\n" +
    "Two truths anchor the week: a clear written agreement prevents most client problems before they start, and your rate is a decision you make, not a number a client hands you.",
  concept_check: [
    {
      q: "A client says 'just start, we'll sort out the details as we go'. What is the risk?",
      choices: [
        "No risk; being flexible builds trust",
        "Without a written scope, you end up doing unpaid extra work and have no protection if there is a dispute",
        "The client will pay more for flexibility",
        "It only matters for big projects",
      ],
      correct: 1,
      explain: "A clear written scope and agreement protects both sides. 'Sort it out as we go' is how operators end up overworked and underpaid, with no record to point to when scope creeps.",
    },
    {
      q: "You are based in Accra and a client is in New York. How should you handle working hours?",
      choices: [
        "Be available 24/7 to seem committed",
        "Agree overlap hours and your response rhythm up front, and always state time zones",
        "Only work New York hours, even if it means working all night",
        "Assume they will adjust to you",
      ],
      correct: 1,
      explain: "Agree clear overlap hours and a response rhythm in advance so neither side waits anxiously. Predictability beats constant availability, and you protect your own life and sustainability.",
    },
    {
      q: "How should you decide your rate?",
      choices: [
        "Charge the lowest possible to win every client",
        "Research what the role pays, decide your minimum based on the value you deliver, and price with confidence",
        "Whatever the client offers first",
        "The same as everyone else on the platform",
      ],
      correct: 1,
      explain: "Your rate is a decision based on value and a researched floor, not a race to the bottom. Underpricing out of fear leads to resentment and burnout; price for the value you provide.",
    },
  ],
  days: [
    {
      number: 0,
      title: "The business of remote work, and set up your profile",
      summary: "Understand what it takes to earn remotely, then start building your professional profile.",
      items: [
        {
          kind: "lesson",
          title: "Skills are half the job; the business is the other half",
          body:
            "## Why this week matters as much as the skills\n" +
            "Weeks 1 to 9 made you capable. This week makes you employable and payable. Plenty of skilled people never earn from those skills because they do not know how to find clients, agree terms, or get paid across borders, especially from Africa, where the payment and platform questions are real. This week closes that gap.\n\n" +
            "## The two paths to remote income\n" +
            "1. **Employment / contracts:** a remote role with one company (an EA, an operations coordinator, a support agent). Steadier, often through job boards or direct applications.\n" +
            "2. **Freelancing:** multiple clients, project or retainer based, often through platforms (Upwork) or direct outreach. More freedom, more responsibility for finding work and getting paid.\n\n" +
            "Most people do a mix, and this week prepares you for both. The skills transfer; only the way you package and sell them changes.\n\n" +
            "## What you need to actually earn\n" +
            "- A **profile** that shows you are credible (your portfolio from this whole course is your proof).\n" +
            "- A **service offer**: what you do, for whom, at what price.\n" +
            "- A **way to agree terms**: a simple contract/scope.\n" +
            "- A **way to get paid**: an international payment method that works for you.\n" +
            "- A **way to find clients**: platforms, job boards, outreach.\n\n" +
            "## This week's destination\n" +
            "You will build all of that: a profile, a service package with pricing, an agreement and invoice template, a documented payment method, and a run-through of onboarding a client. That setup is portfolio artefact number ten, the one that turns the whole course into income.",
        },
        {
          kind: "video",
          title: "Upwork Tutorial for Beginners [FULL GUIDE]",
          url: "https://www.youtube.com/watch?v=bCcssVfBd98",
          duration_min: 25,
          creator: "Evan Fisher",
          difficulty: "beginner",
          why: "A complete walk-through of setting up an Upwork profile and applying to jobs, one of the most common ways to land remote clients. Focus on the profile and proposal sections; you will build your own profile in the exercise.",
        },
        {
          kind: "lesson",
          title: "Set up your professional profile, step by step",
          body:
            "## Your profile is your storefront\n" +
            "Whether on a freelance platform, LinkedIn, or a job application, your profile answers one question for a client: can I trust this person with my work? You answer it with clarity and proof, not adjectives.\n\n" +
            "**1. A clear headline.** State who you help and how, not just a title. 'Remote Operations Assistant helping founders tame their inbox, calendar, and admin' beats 'Virtual Assistant'. Specific beats generic.\n\n" +
            "**2. A strong 'about'.** A few short paragraphs: what you do, who you help, the results you create, and a line of personality. Written in your voice, scannable, no fluff. Lead with what you do for the client, not your life story.\n\n" +
            "**3. Proof.** This is where your course pays off, link the portfolio pieces you built: the communication toolkit, the inbox system, the research package, the social content, the operations manual. Real artefacts beat claims every time. Even with no paid clients yet, you have a portfolio of real work, which most beginners do not.\n\n" +
            "**4. A clean photo and complete profile.** The Week 1 professional photo, a complete profile (platforms reward completeness), skills listed, and any relevant experience framed by results.\n\n" +
            "## Start building it now\n" +
            "Pick where you will start (a freelance platform like Upwork, and/or LinkedIn) and draft your headline and 'about'. You will refine these in Week 13 (career launchpad), but starting now means you can already point a potential client somewhere credible. The goal: a profile a client lands on and thinks 'this person is the real thing'.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A profile headline like 'Remote Operations Assistant helping founders tame their inbox and admin' beats just 'Virtual Assistant'.",
              answer: true,
              whenRight: "Yes. Specific beats generic: it states who you help and how, so the right client immediately sees you are for them.",
              whenWrong: "Specific wins. A headline that names who you help and the outcome you create is far more compelling than a bare job title.",
            },
            {
              prompt: "With no paid clients yet, you have nothing to show on your profile.",
              answer: false,
              whenRight: "Correct. You have a full portfolio of real work from this course, the toolkit, systems, research, content, manual. That is more proof than most beginners ever show.",
              whenWrong: "Not true. The whole course built real artefacts. Linking those portfolio pieces is exactly the proof that sets you apart from beginners who only make claims.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, start your profile",
          body:
            "- [ ] Choose where to start (Upwork and/or LinkedIn) and create/begin the profile\n" +
            "- [ ] Write a specific headline (who you help + how)\n" +
            "- [ ] Draft a short 'about' (what you do, who for, results, a line of personality)\n" +
            "- [ ] List 3 to 5 portfolio pieces from this course you will link as proof\n\n" +
            "Deliverable: your headline, 'about' draft, and the list of proof pieces.",
        },
      ],
    },
    {
      number: 1,
      title: "Remote work culture and international clients",
      summary: "Work across cultures and time zones in a way that earns trust.",
      items: [
        {
          kind: "lesson",
          title: "Being a great remote teammate",
          body:
            "## Remote trust is built differently\n" +
            "In an office, presence signals work. Remotely, no one sees you, so trust is built entirely through communication and reliability (everything from Week 1). The remote operators clients love share a few habits:\n" +
            "- **Proactive communication.** They send updates without being asked, so the client never wonders. Silence is the enemy of remote trust.\n" +
            "- **Reliability over availability.** They do what they said by when they said. They are not online 24/7; they are dependable within agreed hours.\n" +
            "- **Self-direction.** They do not need to be told every step. They take a goal and run, asking sharp questions when needed (Week 1's good-question skill).\n" +
            "- **Written clarity.** Their messages, updates, and docs are clear, because writing is how remote work happens.\n\n" +
            "## Working across cultures\n" +
            "International clients bring cultural differences in directness, formality, and expectations. A few principles: be respectful and a little more formal until you learn the client's style, then match it; do not assume your norms are universal; ask if unsure rather than guess; and be punctual and reliable, which is valued everywhere. Cultural humility, observing and adapting, makes you easy to work with across any border.\n\n" +
            "## Time zones and working hours (revisited)\n" +
            "From Week 3 you know to always state zones. For ongoing client work, go further: agree your working hours and overlap up front. 'I work 9 to 5 GMT; we overlap with your morning; for anything urgent outside that, message me and I'll respond first thing.' This protects both the client's expectations and your own life, you are building a sustainable career, not burning out trying to be awake for every time zone.\n\n" +
            "## Protect your sustainability\n" +
            "Remote and freelance work can blur into all hours. Set boundaries early (hours, response times, days off) and hold them kindly. A rested, sustainable operator delivers better for years; one who says yes to everything at all hours burns out in months. Boundaries are professional, not difficult.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Remote clients value being available 24/7 more than being reliable within agreed hours.",
              answer: false,
              whenRight: "Correct. Reliability beats constant availability. Doing what you said by when you said, within agreed hours, is what builds trust, and it is sustainable.",
              whenWrong: "Reliability wins. Clients want to depend on you within clear hours, not have you exhausted and always-on. Dependability beats 24/7 presence.",
            },
            {
              prompt: "Agreeing your working hours and overlap up front protects both the client's expectations and your own life.",
              answer: true,
              whenRight: "Yes. Clear hours prevent anxious waiting and prevent burnout. Boundaries set early and held kindly are professional, not difficult.",
              whenWrong: "It does. Up-front hours give the client predictability and give you a sustainable career. Setting them early is a sign of professionalism.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Define how you work",
          body:
            "Write a short 'how I work with clients' one-pager covering:\n" +
            "1. Your working hours and time zone, and the overlap you offer an international client.\n" +
            "2. Your communication rhythm (updates, response times, preferred channels).\n" +
            "3. Two boundaries you will hold (e.g. no weekend work, urgent-only outside hours).\n\n" +
            "Deliverable: the one-page 'how I work' doc (this complements your Week 1 version).",
        },
      ],
    },
    {
      number: 2,
      title: "Contracts and scope",
      summary: "A simple written agreement that prevents most client problems.",
      items: [
        {
          kind: "lesson",
          title: "Agree it in writing, always",
          body:
            "## Why a written agreement protects you\n" +
            "Most client disputes, unpaid work, scope creep, mismatched expectations, trace back to one cause: nothing was agreed in writing. A simple written agreement, even a one-page scope, prevents the vast majority of these before they happen. It is not about distrust; it is about clarity, and clarity protects both sides.\n\n" +
            "## What a basic agreement covers\n" +
            "You do not need a lawyer for most small engagements; a clear scope doc both sides confirm is enough to start:\n" +
            "- **Scope:** exactly what you will do (and, importantly, what you will NOT do). 'Manage the inbox and calendar, 20 hours/month' is clear; 'help with admin' is not.\n" +
            "- **Deliverables and timeline:** what gets produced and by when.\n" +
            "- **Payment:** how much, for what (hourly vs monthly retainer vs per project), when, and how.\n" +
            "- **Terms:** working hours, communication, what happens with extra work, and how either side can end the arrangement (notice period).\n\n" +
            "## Scope creep, the operator's silent killer\n" +
            "Scope creep is when 'can you also just...' requests slowly expand your work beyond what was agreed, unpaid. A written scope is your defence: when extra work comes, you can warmly point to the agreement and offer the extra as additional paid work. 'Happy to take that on, it's outside our current scope so I'll send a quick quote, just confirm and I'll start.' That sentence, backed by a written scope, protects your time and your rate without any awkwardness.\n\n" +
            "## Keep it professional and simple\n" +
            "For platform work (Upwork), the platform provides contract structure. For direct clients, a simple scope doc or a short agreement (templates are freely available) works. The point is that both sides have read and agreed the same thing. Confirm it in writing ('confirming we're agreed on the scope and terms below') before you start, and you have prevented most of the problems that sink freelance relationships.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A written scope is mainly useful as a defence against scope creep and disputes.",
              answer: true,
              whenRight: "Yes. When 'can you also just...' arrives, you point to the scope warmly and offer the extra as paid work. It protects your time and rate without awkwardness.",
              whenWrong: "It is exactly that. A written scope lets you handle scope creep gracefully, the agreement does the saying-no for you, so extra work becomes extra paid work.",
            },
            {
              prompt: "Defining what you will NOT do is as important as defining what you will do.",
              answer: true,
              whenRight: "Yes. The boundary is half the value of a scope. Without 'not included', everything becomes 'can you also...' and your work expands unpaid.",
              whenWrong: "It is. Stating exclusions prevents misunderstanding and scope creep. A scope without boundaries invites endless additions.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Write a service agreement",
          body:
            "Write a one-page service agreement / scope doc for a sample client engagement (e.g. 'manage Kola's inbox and calendar, 20 hours/month'):\n" +
            "1. Scope (what is included AND what is not).\n" +
            "2. Deliverables and timeline.\n" +
            "3. Payment (amount, basis, when, how).\n" +
            "4. Terms (hours, extra-work handling, notice to end).\n\n" +
            "Deliverable: the one-page agreement, reusable as a template.",
        },
      ],
    },
    {
      number: 3,
      title: "Getting paid across borders",
      summary: "Invoice professionally and receive international payments reliably.",
      items: [
        {
          kind: "lesson",
          title: "Invoicing and international payments",
          body:
            "## The part that actually matters\n" +
            "Doing the work means nothing until the money lands. For an African operator working with international clients, this takes a little setup, but it is very solvable, and getting it right makes you easy to pay, which makes you easy to hire.\n\n" +
            "## Professional invoicing\n" +
            "An invoice is a simple document requesting payment. A professional one includes: your name/business and contact, the client's details, an invoice number and date, a clear line-item description of what is being charged, the amount and currency, the payment due date and terms (e.g. 'due within 7 days'), and exactly how to pay. Clear invoices get paid faster. Build a reusable template (or use a free invoicing tool) so each invoice takes two minutes.\n\n" +
            "## Receiving international payments\n" +
            "The common options for someone in West Africa:\n" +
            "- **Platform payments (Upwork):** the platform handles the payment and pays you out; simplest to start, takes a fee.\n" +
            "- **Wise:** widely used for cross-border payments; you can receive in major currencies and withdraw locally.\n" +
            "- **Payoneer:** popular with freelancers in Africa for receiving international payments and marketplace payouts.\n" +
            "- **PayPal:** common but check availability and terms in your country.\n" +
            "- **Direct bank transfer:** sometimes works but can be slow and costly internationally.\n\n" +
            "Set up at least one method that works in your country and test it. Knowing exactly how a client can pay you, and being able to tell them simply, removes friction and looks professional.\n\n" +
            "## Payment terms that protect you\n" +
            "- For project work, consider a **deposit up front** (e.g. 50%) so you are not fully exposed.\n" +
            "- For ongoing retainers, **invoice at the start of the month** for that month, or bill regularly on a set date.\n" +
            "- State terms clearly and follow up politely on late payment, your Week 1 follow-up skills apply. A friendly, firm reminder with the invoice attached usually does it.\n\n" +
            "## Keep records\n" +
            "Track your invoices and payments (a simple sheet: invoice number, client, amount, date sent, date paid). This keeps you on top of who owes what and is essential when you are running multiple clients, and for any tax obligations you may have.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "There are workable ways for someone in West Africa to receive international client payments.",
              answer: true,
              whenRight: "Yes. Platform payouts, Wise, Payoneer, and others let African operators get paid by international clients. It takes a little setup but is very solvable.",
              whenWrong: "There are. Wise, Payoneer, platform payouts and others work for cross-border payments. The key is setting up and testing one that works in your country.",
            },
            {
              prompt: "For project work, asking for a deposit up front is a reasonable way to protect yourself.",
              answer: true,
              whenRight: "Yes. A deposit (e.g. 50%) means you are not fully exposed if a client disappears. It is standard, professional practice for project work.",
              whenWrong: "It is reasonable and common. A deposit reduces your risk on project work and is normal practice; many clients expect it.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Set up getting paid",
          body:
            "1. Create a professional invoice template with all the required fields.\n" +
            "2. Fill it in for a sample engagement (e.g. one month managing Kola's inbox).\n" +
            "3. Research and document at least one international payment method that works in your country, and note the steps a client would take to pay you.\n" +
            "4. Create a simple invoice-tracking sheet.\n\n" +
            "Deliverable: the invoice template (filled example), the documented payment method, and the tracking sheet.",
        },
      ],
    },
    {
      number: 4,
      title: "Freelance platforms and finding work",
      summary: "Where remote work lives, and how to actually land it.",
      items: [
        {
          kind: "lesson",
          title: "Finding clients and roles",
          body:
            "## Where the work is\n" +
            "Remote work comes from a few main channels; use several:\n" +
            "- **Freelance platforms (Upwork, others):** lots of work, lots of competition. Good for starting because clients come to the platform looking to hire. Win by a strong profile, tailored proposals, and great early reviews.\n" +
            "- **Job boards:** remote-specific boards and general ones with remote filters list employed and contract roles (EA, ops, support). Good for steadier work.\n" +
            "- **Direct outreach:** contacting businesses or founders directly (the prospect skills from Week 4). Higher effort, but less competition and often better clients.\n" +
            "- **Your network and referrals:** the best source over time. Do great work, ask happy clients for referrals, and be visible (LinkedIn). One good client often leads to the next.\n\n" +
            "## Winning on a platform\n" +
            "Platforms are competitive, so beginners struggle by sending generic applications. To win:\n" +
            "- **Tailor every proposal.** Reference the specific job, show you read it, and address their exact need. Generic copy-paste loses.\n" +
            "- **Lead with the client's problem,** not your life story. 'You need your inbox under control, here's exactly how I'd do that in week one' beats 'I am hardworking and detail-oriented'.\n" +
            "- **Show proof.** Link a relevant portfolio piece.\n" +
            "- **Start with a few strong reviews.** Early on, it can be worth taking a smaller well-matched job to earn a 5-star review that unlocks bigger ones. Reviews are the platform's currency of trust.\n\n" +
            "## Apply with focus, not spray\n" +
            "Ten tailored applications beat fifty generic ones. Pick roles that genuinely fit your skills and write each proposal as if it is the only one. This is the Week 1 'specific beats generic' lesson applied to landing work.\n\n" +
            "## Beware scams\n" +
            "Where there are job-seekers there are scams: 'jobs' that ask you to pay upfront, send money, or hand over sensitive details before any work. Real clients pay you, not the other way around. Use reputable platforms, be cautious of offers that seem too good, and never pay to get a job.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Ten proposals tailored to specific jobs beat fifty generic copy-pasted ones.",
              answer: true,
              whenRight: "Yes. Tailored, problem-focused proposals win; generic spray loses. Quality and specificity beat volume on every platform.",
              whenWrong: "Tailored wins. A focused proposal that shows you read the job and addresses their need outperforms a pile of generic ones.",
            },
            {
              prompt: "A legitimate client might ask you to pay a fee upfront before you can start the job.",
              answer: false,
              whenRight: "Correct. That is a scam signal. Real clients pay you, not the reverse. Never pay to get a job, and be wary of offers that seem too good.",
              whenWrong: "No, that is a scam. Legitimate clients pay you for work; being asked to pay upfront to start is a red flag to walk away from.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Find and apply for real work",
          body:
            "1. Find three real remote listings that fit your skills (on a platform or job board).\n" +
            "2. For one, write a tailored proposal: reference the specific job, lead with their problem, show how you'd help, and link a relevant portfolio piece.\n" +
            "3. List two channels (besides platforms) you will use to find clients, and one scam red flag you will watch for.\n\n" +
            "Deliverable: the three listings, the tailored proposal, and your channels + red-flag note.",
        },
      ],
    },
    {
      number: 5,
      title: "Rates, packages, and positioning",
      summary: "Price your work for value and present it so clients say yes.",
      items: [
        {
          kind: "lesson",
          title: "What to charge and how to package it",
          body:
            "## Your rate is a decision\n" +
            "Beginners often charge whatever the client offers, or the lowest possible to win work, and then resent it and burn out. Your rate is a decision you make based on the value you deliver and a researched floor, not a number handed to you. Research what the role pays (internationally and locally), decide your minimum, and price with quiet confidence.\n\n" +
            "## Pricing models\n" +
            "- **Hourly:** simple, common on platforms. Good when scope is unclear. Downside: caps your income at your hours and penalises you for being fast.\n" +
            "- **Monthly retainer:** a set fee for an agreed scope each month (e.g. 'inbox + calendar + scheduling, 20 hours, fixed monthly fee'). Great for ongoing operator work, predictable income for you, predictable cost for them.\n" +
            "- **Per project:** a fixed price for a defined deliverable (e.g. 'set up your operations manual'). Rewards efficiency and suits one-off work.\n\n" +
            "Retainers are often the sweet spot for a remote operations professional: stable, relationship-based, and they value your reliability rather than your clock.\n\n" +
            "## Package your services\n" +
            "Rather than a vague 'I do VA work', offer clear packages, it makes you easy to buy. For example:\n" +
            "- **Starter:** inbox + calendar management (X hours/month) at one price.\n" +
            "- **Operations:** the above plus project coordination and reporting.\n" +
            "- **Full operator:** the above plus support and social management.\n\n" +
            "Tiered packages let a client self-select and make upselling natural. They also frame you as a professional with a defined offer, not someone improvising.\n\n" +
            "## Positioning: be specific\n" +
            "You will earn more as 'the operations person for early-stage founders' than as 'a general VA who does anything'. Specificity (a niche, a clearly-defined service) commands higher rates and attracts better-fit clients. The whole 'Remote Operations Professional' framing of this course is exactly this, you are not the cheapest pair of hands; you are the reliable operator a founder builds their back office around.\n\n" +
            "## Raising rates\n" +
            "Start at a fair rate, deliver great work, and raise rates over time as your proof and reviews grow. Underpricing forever is a trap; your rate should rise with your demonstrated value.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "For ongoing operations work, a monthly retainer is often a better fit than pure hourly billing.",
              answer: true,
              whenRight: "Yes. A retainer gives you predictable income and the client predictable cost, and it values your reliability rather than penalising you for being fast.",
              whenWrong: "Retainers often fit best for ongoing work: stable income, predictable cost, and they reward reliability over hours clocked.",
            },
            {
              prompt: "Positioning yourself as 'a general VA who does anything' earns more than a specific niche.",
              answer: false,
              whenRight: "Correct. Specificity commands higher rates and attracts better-fit clients. 'The operations person for early-stage founders' beats 'I do anything'.",
              whenWrong: "The opposite. Generalists compete on price; a specific, well-defined offer commands higher rates and draws the right clients.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Build your service package",
          body:
            "1. Research a rough rate range for remote operations/VA work (international and local) and decide your starting rate and your floor.\n" +
            "2. Build a tiered service package (e.g. Starter / Operations / Full operator) with clear deliverables and a price for each.\n" +
            "3. Write a one-sentence positioning statement (who you serve and what you do).\n\n" +
            "Deliverable: the rate decision, the tiered package, and the positioning statement.",
        },
      ],
    },
    {
      number: 6,
      title: "Applications, proposals, and the discovery call",
      summary: "Turn an opportunity into a signed client.",
      items: [
        {
          kind: "lesson",
          title: "Winning the work",
          body:
            "## From opportunity to client\n" +
            "Finding a role is step one; converting it is step two. Whether it is a job application, a platform proposal, or a founder who DM'd you, the same principles win the work.\n\n" +
            "## The application/proposal\n" +
            "- **Lead with them, not you.** Open with their problem and the outcome you'll create, not 'I am a hardworking VA'. (Week 1 BLUF again: the point first.)\n" +
            "- **Be specific and show you understood.** Reference their actual situation. A line that proves you read carefully beats a paragraph of generic enthusiasm.\n" +
            "- **Show proof, not adjectives.** Link a relevant portfolio piece. 'Here's an inbox system I built' beats 'I'm very organised'.\n" +
            "- **Make the next step easy.** End with a clear, low-friction call to action: 'Happy to do a quick call this week, here's my calendar link' or 'I can start with a paid trial week so you can see the work'.\n\n" +
            "## The discovery call\n" +
            "Many engagements involve a short call. Treat it as a conversation to understand their needs, not a pitch. Prepare: research them, prepare a few smart questions ('what's eating most of your time right now?', 'what would make this a win for you in 30 days?'), and listen more than you talk. Then reflect their need back and explain simply how you'd help. People hire those who clearly understand their problem.\n\n" +
            "## Handle objections calmly\n" +
            "Expect a few: 'you're more expensive than someone else', 'you don't have X years experience', 'how do I know you'll deliver?'. Answer with value and proof, not defensiveness: point to your portfolio, offer a paid trial period to de-risk it, and be honest about what you do and don't have. Confidence plus proof beats discounting yourself.\n\n" +
            "## The de-risking trial\n" +
            "A powerful tool for a beginner with no client reviews yet: offer a small, paid trial (a trial week, or a single defined task) so the client can see your work with low commitment. It converts 'I'm not sure' into 'let's try it', and your real work does the rest. It is how many operators land their first clients.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A proposal should open with the client's problem and the outcome you'll create, not with your qualities.",
              answer: true,
              whenRight: "Yes. Lead with them. 'You need X, here's how I'd deliver it' beats 'I am hardworking and organised'. The client cares about their problem first.",
              whenWrong: "Lead with their problem. Opening about yourself loses; opening with their need and your solution wins. Make it about them.",
            },
            {
              prompt: "Offering a small paid trial can help a beginner land a client who is unsure.",
              answer: true,
              whenRight: "Yes. A paid trial de-risks the decision for the client and lets your real work prove itself. It is a common way to land early clients.",
              whenWrong: "It can. A low-commitment paid trial turns 'I'm not sure' into 'let's try it', and your work converts them. Great tool when you lack reviews.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Prepare to convert",
          body:
            "1. Write a discovery-call prep sheet: 5 smart questions you'd ask a prospective client.\n" +
            "2. Write responses to three common objections (too expensive, not enough experience, how do I trust you).\n" +
            "3. Write how you'd propose a paid trial to de-risk a first engagement.\n\n" +
            "Deliverable: the prep sheet, objection responses, and trial proposal.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship: your remote-work setup and onboarding sim",
      summary: "Package everything and run a client onboarding. Portfolio artefact #10.",
      items: [
        {
          kind: "lesson",
          title: "Set up to actually earn",
          body:
            "## The week's deliverable\n" +
            "Today you package your complete remote-work setup: a profile, a tiered service package with pricing, a client agreement and invoice template, a documented payment method, and a run-through of onboarding a client from first inquiry to signed agreement. This is portfolio artefact number ten, the final one in your skill-building portfolio, and the one that turns capability into income.\n\n" +
            "## The onboarding simulation\n" +
            "Run the full sequence with Kola (or an invented client) as practice: a client inquiry arrives; you respond and propose a discovery call; you 'hold' the call (write what you'd ask and learn); you send a proposal and scope; the client agrees; you send the agreement and first invoice; you onboard (gather what you need, set up the workspace, agree communication and hours). Doing this once on paper means the first real time is not the first time.\n\n" +
            "## Why this matters most\n" +
            "Everything you learned is potential until you can find a client, agree terms, and get paid. This week converts the course into a livelihood. With this setup, you are not 'someone learning to be a VA', you are a remote operations professional ready to take a client. The next phase (real client experience) puts it to work.\n\n" +
            "## The standard\n" +
            "Three tests: a client could land on your profile and offer, understand exactly what you do and what it costs, and say yes; your agreement and invoice are clear and professional; and you have a real, tested way to get paid. Hit those and the only thing left between you and income is reaching out, which is exactly where Weeks 11 to 13 take you.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Running a client onboarding on paper once means the first real time is not the first time.",
              answer: true,
              whenRight: "Yes. Rehearsing the inquiry-to-signed sequence builds confidence and reveals gaps, so the real engagement goes smoothly.",
              whenWrong: "It does. A practice run-through means you have already navigated the steps once, so the real onboarding feels familiar, not nerve-wracking.",
            },
            {
              prompt: "This week's setup matters because skills alone do not produce income without a way to find clients, agree terms, and get paid.",
              answer: true,
              whenRight: "Yes. Capability is potential; the business setup is what turns it into a livelihood. That is exactly what this artefact proves you have.",
              whenWrong: "It is the point. Many skilled people never earn because they lack this setup. The profile, offer, agreement, and payment method convert skill into income.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Final build: remote-work setup + onboarding sim",
          body:
            "This is the Week 10 portfolio deliverable. Assemble:\n" +
            "1. **Your profile** (headline, about, linked proof) on a platform and/or LinkedIn.\n" +
            "2. **A tiered service package** with clear deliverables and pricing, plus a positioning statement.\n" +
            "3. **A client agreement template and an invoice template** (filled examples).\n" +
            "4. **A documented, tested payment method.**\n" +
            "5. **A written onboarding simulation**: inquiry to discovery call to proposal/scope to agreement to first invoice to onboarding.\n\n" +
            "Export the package as a PDF. This is portfolio artefact #10 (your tenth).",
        },
      ],
    },
  ],
  topics: [
    "The two paths: remote employment and freelancing",
    "Building a credible profile from your portfolio",
    "Remote work culture and international clients",
    "Contracts, scope, and avoiding scope creep",
    "Invoicing and international payments from Africa",
    "Freelance platforms, job boards, and finding work",
    "Rates, pricing models, packages, and positioning",
    "Applications, proposals, discovery calls, and trials",
  ],
  tasks: [
    "Build a profile that leads with who you help and shows proof",
    "Define your working hours, rhythm, and boundaries",
    "Write a service agreement / scope template",
    "Build an invoice template and set up a payment method",
    "Find real listings and write a tailored proposal",
    "Build a tiered service package with pricing and positioning",
    "Run a client onboarding simulation",
  ],
  project:
    "Build a complete remote-work setup and simulation: a profile, a tiered service package with pricing, a client agreement and invoice template, a documented international payment method, and a written onboarding run-through from inquiry to signed agreement. Portfolio artefact #10.",
  exercises: [
    "Draft a profile headline, about, and list of proof pieces",
    "Write a one-page service agreement (scope, deliverables, payment, terms)",
    "Create an invoice template and document a payment method that works in your country",
    "Write a tailored proposal for a real listing and a positioning statement",
    "Prepare discovery-call questions, objection responses, and a trial proposal",
  ],
  questions: [
    "What should a basic client agreement always include?",
    "How do you get paid reliably from an international client?",
    "How do you price your services without underselling?",
  ],
  outputs: [
    "A profile (platform and/or LinkedIn) linking your portfolio",
    "A tiered service package with pricing and positioning",
    "A client agreement and invoice template",
    "A documented payment method and an onboarding simulation",
  ],
  mastery_questions: [
    "Write a profile headline that names who you help and how",
    "Write a service agreement covering scope (incl. exclusions), deliverables, payment, and terms",
    "Create a professional invoice with all required fields",
    "Set up and describe at least one international payment method for your country",
    "Build a tiered service package with clear deliverables per tier",
    "Decide a rate from a researched floor and justify it by value",
    "Write a tailored proposal that leads with the client's problem and shows proof",
    "Handle a client pushing for unpaid extra work by pointing to the scope",
    "Agree working hours and overlap with an international client",
    "Run a mock onboarding from inquiry to signed agreement",
  ],
  ai_assist:
    "Use AI to draft and tailor proposals to a specific job post, polish your profile copy, pressure-test your pricing ('is this rate reasonable for X work for an international client?'), and role-play a skeptical client so you can practise the discovery call and objections. Ask it to review your service agreement for anything missing. Keep your real terms, numbers, and voice, AI helps you present them clearly and confidently, but the decisions (rate, scope, boundaries) are yours.",
  pre_flight:
    "Before setting rates, research what the role actually pays both internationally and locally, and decide your minimum. Knowing your floor stops you accepting work that is not worth your time out of fear. Write the floor down before you talk to any client.",
  common_mistakes: [
    "Starting work with no written scope, leading to unpaid extra work",
    "Underpricing dramatically out of fear, then resenting the client and burning out",
    "No clear payment terms or method, so invoices get paid late or not at all",
    "Sending generic proposals instead of tailored, problem-led ones",
    "Saying yes to everything at all hours instead of setting sustainable boundaries",
  ],
  debug_help:
    "If clients keep pushing scope or paying late, the fix is upstream: a clear written agreement and invoice terms set at the start. When extra work arrives, point to the scope warmly and offer it as additional paid work. If you cannot land clients, check your proposals, are they tailored and problem-led, with proof, or generic? If payment is the blocker, you have not set up and tested a method yet, do that before you take a client. And never pay to get a job; that is always a scam.",
  stretch: [
    "Build a simple one-page portfolio website linking your ten projects",
    "Write a discovery-call script and a follow-up-after-the-call message",
    "Research and document three specific places your ideal clients actually hire",
  ],
  resources: [
    { label: "Upwork resources", url: "https://www.upwork.com/resources/", note: "Free, freelancing guides" },
    { label: "Wise", url: "https://wise.com/", note: "Cross-border payments" },
    { label: "Payoneer", url: "https://www.payoneer.com/", note: "Freelancer payments in Africa" },
  ],
};
