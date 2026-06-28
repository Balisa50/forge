/* Week 7 - Customer support operations (Phase: Customer Experience) */
module.exports = {
  number: 7,
  title: "Customer support operations",
  phase: "Customer Experience",
  commitment_hours: "6, 10",
  context:
    "Customer support is where many remote operators earn their first international paycheck, and where Kola keeps the customers it worked so hard to win. Every business with customers needs someone calm, clear, and quick to handle questions, complaints, and the occasional angry message. Done well, support is not a cost; it is how a one-time buyer becomes a loyal one.\n\n" +
    "This week you learn to run support like a pro: a help desk, a reply formula, a library of response macros, the basics of CRMs, and de-escalation that turns an angry customer into a fan. You will run a 15-ticket support simulation for Kola and build the response library that makes good support fast and consistent.\n\n" +
    "The core truth of support: people remember how you made them feel far longer than they remember the problem. Handle the feeling first, and the rest gets easy.",
  concept_check: [
    {
      q: "A customer messages, clearly upset, that their order is damaged. What should your reply do FIRST?",
      choices: [
        "Explain the return policy and the conditions for a refund",
        "Acknowledge their frustration and that a damaged order is not okay, before getting to the fix",
        "Ask them to send five photos from different angles",
        "Tell them these things happen sometimes",
      ],
      correct: 1,
      explain: "Handle the feeling first. People need to feel heard before they can hear a solution. Lead with acknowledgement, then move to the concrete fix.",
    },
    {
      q: "You notice 40% of tickets are 'where is my order?'. What is the smartest long-term move?",
      choices: [
        "Reply to each one faster",
        "Reduce the cause: add tracking info to the order confirmation and an FAQ, so fewer customers need to ask",
        "Ignore them; they are easy",
        "Tell customers to be patient",
      ],
      correct: 1,
      explain: "Great support does not just answer tickets fast; it removes the reasons tickets happen. A recurring question is a signal to fix something upstream.",
    },
    {
      q: "When is a saved response (macro) the right tool, and when is it wrong?",
      choices: [
        "Always use macros; never write custom replies",
        "Use a macro as a starting point for common questions, but always personalise it; never send a generic macro to an emotional or unusual situation",
        "Never use macros; always type everything fresh",
        "Macros are only for spam",
      ],
      correct: 1,
      explain: "Macros make routine replies fast and consistent, but they must be personalised, and an angry or unusual situation needs a human, tailored response, not a template.",
    },
  ],
  days: [
    {
      number: 0,
      title: "The support mindset, and set up your help desk",
      summary: "Understand what great support really is, then set up a simple system to handle tickets.",
      items: [
        {
          kind: "lesson",
          title: "Support is how you keep customers",
          body:
            "## The real job of support\n" +
            "Winning a customer is expensive; keeping one is cheap, and support is where you keep them. A customer with a problem is at a fork: handle it well and they often become more loyal than if nothing had gone wrong; handle it badly and they leave and tell others. Support is not damage control, it is one of the highest-leverage things a small business does.\n\n" +
            "## The mindset\n" +
            "- **The customer is a person, not a ticket.** Behind every message is someone who paid money and wants to feel taken care of.\n" +
            "- **Feeling first, fix second.** People remember how you made them feel. Acknowledge before you solve.\n" +
            "- **You represent the brand.** To the customer, you ARE Kola. Calm, warm, and competent is the brand they should feel.\n" +
            "- **Every ticket is information.** Patterns in tickets tell the business what to fix.\n\n" +
            "## What you will run\n" +
            "For a small business, support usually flows through email (or a shared inbox), social DMs, and maybe a chat widget. You do not need expensive software to be excellent; you need a system: somewhere tickets land, a way to track them, fast and consistent replies, and a record of each customer.\n\n" +
            "## This week's destination\n" +
            "You will work a 15-ticket queue for Kola, build a 10+ macro response library, log customers in a simple CRM, and write a report on what you handled and what would reduce future tickets. That package is portfolio artefact number seven, and 'I can run your customer support' is a service you can sell on its own from day one.",
        },
        {
          kind: "video",
          title: "7 Phrases Customer Service Agents with Astute De-escalation Skills Use Everyday",
          url: "https://www.youtube.com/watch?v=8VksLCHy0iA",
          duration_min: 15,
          creator: "Myra Golden",
          difficulty: "beginner",
          why: "Myra Golden trains support teams at major companies. These exact phrases for staying calm and defusing tension are what you will use on the hardest tickets this week. Watch, then practise them on the de-escalation exercise.",
        },
        {
          kind: "lesson",
          title: "Set up a simple help desk, step by step",
          body:
            "## You do not need fancy software\n" +
            "Dedicated help desks (Zendesk, Freshscout, Help Scout) are great at scale, and worth knowing by name, but a small business can run excellent support from a shared inbox plus a simple tracker. Set that up now.\n\n" +
            "**1. A shared support inbox.** A dedicated address like `support@` (or a label in Gmail) so all customer messages land in one place, separate from the founder's personal mail. Everyone who handles support sees the same queue.\n\n" +
            "**2. A status system.** Use labels or columns to track each ticket's state: `New`, `In Progress`, `Waiting on Customer`, `Resolved`. Now nothing falls through the cracks and you can see the queue at a glance, this is the support version of inbox triage from Week 3.\n\n" +
            "**3. A simple CRM / customer log.** A Google Sheet with one row per customer: name, contact, order history, and notes from past interactions. When a customer writes in, you can see who they are and what happened before, which lets you treat them like a known person, not a stranger.\n\n" +
            "**4. Saved responses on.** Enable Gmail Templates (from Week 3) so your macros are ready.\n\n" +
            "## The flow\n" +
            "A ticket arrives, you label it New, read it, reply (often from a personalised macro), update its status, and log the interaction in the CRM. Resolved tickets get marked Resolved. That loop, run consistently, is professional support.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Handling a customer's problem well can make them more loyal than if nothing had gone wrong.",
              answer: true,
              whenRight: "Yes. A well-handled problem proves the business cares, which often builds more loyalty than a smooth experience that was never tested.",
              whenWrong: "It is true. Recovery done well is powerful: customers remember that you took care of them when it mattered, and many become more loyal for it.",
            },
            {
              prompt: "You need expensive help-desk software to run professional customer support.",
              answer: false,
              whenRight: "Correct. A shared inbox, a status system, a simple CRM sheet, and saved responses are enough to run excellent support for a small business.",
              whenWrong: "You do not. Great support is a system, not a tool. A shared inbox plus a tracker and a customer log handles small-business support well.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, set up support",
          body:
            "- [ ] Set up a support inbox or label and four status labels (New, In Progress, Waiting, Resolved)\n" +
            "- [ ] Build a simple CRM sheet (name, contact, order history, notes) with three sample customers\n" +
            "- [ ] Enable saved responses (Gmail Templates)\n" +
            "- [ ] Process two sample tickets through the full loop (read, reply, update status, log)\n\n" +
            "Deliverable: a screenshot of your status labels and CRM sheet.",
        },
      ],
    },
    {
      number: 1,
      title: "Handling tickets: the reply formula",
      summary: "A reliable shape for support replies that works on almost any ticket.",
      items: [
        {
          kind: "lesson",
          title: "The support reply formula",
          body:
            "## One shape, most tickets\n" +
            "Most support replies follow the same shape. Internalise it and you handle any ticket calmly:\n" +
            "1. **Acknowledge.** Show you read and understood, especially the feeling. \"Thanks for reaching out, and sorry your order hasn't arrived yet, I completely understand the worry.\"\n" +
            "2. **Answer or act.** The concrete substance: the answer, or what you are doing. \"I've checked and your parcel is in Tema, out for delivery tomorrow.\"\n" +
            "3. **Next step / set expectation.** What happens now and by when. \"I'll personally confirm once it's delivered. If it's not with you by Friday, reply here and I'll escalate immediately.\"\n" +
            "4. **Warm close.** \"Thanks for your patience, and sorry again for the wait.\"\n\n" +
            "## Match the energy, do not mirror it\n" +
            "If the customer is calm, be efficient and friendly. If they are upset, slow down and lead with more acknowledgement. Never mirror their anger, your calm is what brings the temperature down. A measured, warm reply to a furious message is disarming.\n\n" +
            "## Be specific, not corporate\n" +
            "\"Your inquiry is important to us and will be processed\" says nothing and feels cold. \"I've refunded your shipping (you'll see it in 3 to 5 days) and flagged your account so this doesn't happen again\" is specific and reassuring. Specifics prove you actually did something.\n\n" +
            "## Know your authority before you reply\n" +
            "Decide in advance (or confirm with the founder) what you can offer: refunds up to what amount, replacements, discounts, exceptions. Knowing your limits lets you resolve confidently instead of saying 'let me check' to everything. Anything beyond your authority goes to the founder, fast, with your recommendation.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "If a customer's message is angry, matching their tone shows you take them seriously.",
              answer: false,
              whenRight: "Correct. Never mirror anger. Your calm, warm reply is what lowers the temperature; matching it escalates.",
              whenWrong: "Mirroring anger makes it worse. Stay calm and warm, that steadiness is what defuses the situation. Match a calm customer's efficiency, not an angry one's heat.",
            },
            {
              prompt: "Knowing in advance what you are allowed to offer (refunds, replacements) lets you resolve tickets confidently.",
              answer: true,
              whenRight: "Yes. Clear authority means you act decisively instead of 'let me check' on everything. Anything beyond your limit goes to the founder fast.",
              whenWrong: "It does. Pre-agreed authority is what lets you resolve on the spot. Without it you stall on every ticket; with it you are fast and confident.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Reply to five tickets",
          body:
            "Write replies to five varied tickets using the formula (acknowledge, answer/act, next step, warm close):\n" +
            "1. 'Where is my order? It's been a week.'\n" +
            "2. 'Do you ship to the UK and how much?'\n" +
            "3. 'The basket I received is smaller than it looked online.'\n" +
            "4. 'Can I change the delivery address? I just ordered.'\n" +
            "5. 'Your website wouldn't take my payment.'\n\n" +
            "Decide a sensible support policy for each. Deliverable: the five replies.",
        },
      ],
    },
    {
      number: 2,
      title: "Building a response library",
      summary: "Macros that make you fast without making you robotic.",
      items: [
        {
          kind: "lesson",
          title: "A macro library for support",
          body:
            "## Why macros matter even more in support\n" +
            "Support is high-volume and repetitive: the same dozen questions, over and over. Without saved responses you re-type the same answer all day, slowly and inconsistently. A macro library (saved replies) lets you answer the common 80% in seconds and spend your real time on the hard 20%.\n\n" +
            "## What to build\n" +
            "Cover your most common tickets. For Kola:\n" +
            "- Order status / tracking\n" +
            "- Shipping options and costs\n" +
            "- Returns and refunds\n" +
            "- Out of stock / restock\n" +
            "- Damaged or wrong item\n" +
            "- Address change\n" +
            "- Payment issue\n" +
            "- A warm thank-you for a first order\n" +
            "- A holding reply ('looking into this, will update you by X')\n" +
            "- A de-escalation opener for upset customers\n\n" +
            "## The golden rule: personalise\n" +
            "A macro is a skeleton, never a finished message. Always fill in the human parts: the customer's name, their actual order number, the specific detail. The customer should never be able to tell it started as a template. Compare 'Dear Customer, your issue is noted' with 'Hi Fatou, I've sorted your refund for order KOLA-318, you'll see it in a few days'. Same speed, completely different feeling.\n\n" +
            "## A consistent voice\n" +
            "Your macros define Kola's support voice, warm, clear, human. Writing them once and reusing them means every customer gets the same good experience, no matter how busy you are or who is on shift. That consistency is part of what makes support feel professional rather than improvised.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A macro should be sent exactly as saved so support stays fast and consistent.",
              answer: false,
              whenRight: "Correct. A macro is a starting point; always personalise the name, order number, and specifics. Sent verbatim it feels cold and robotic.",
              whenWrong: "Never send it verbatim. The macro saves the structure; you fill in the human details so the customer feels seen, not processed.",
            },
            {
              prompt: "A 'holding reply' that acknowledges the customer and promises an update by a time is a valuable macro.",
              answer: true,
              whenRight: "Yes. It buys you time while keeping the customer calm, far better than silence while you work out the answer.",
              whenWrong: "It is valuable. A quick honest holding reply stops the 'are they ignoring me?' spiral and keeps the customer patient while you sort the real fix.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Build a 10-macro library",
          body:
            "Write at least 10 reusable support macros for Kola covering the common ticket types listed in the lesson.\n" +
            "For two of them, show the bare macro and a personalised send (with a name and order number).\n\n" +
            "Deliverable: the 10+ macros plus the two personalised examples.",
        },
      ],
    },
    {
      number: 3,
      title: "CRM basics and customer records",
      summary: "Treat every customer like someone you know, because you have the record.",
      items: [
        {
          kind: "lesson",
          title: "Remembering the customer",
          body:
            "## What a CRM is, simply\n" +
            "A CRM (customer relationship management) is just an organised record of your customers and your interactions with them. It can be a dedicated tool (HubSpot, a Shopify customer list) or, for a small business, a well-kept spreadsheet. The point is the same: when a customer contacts you, you can see who they are and what has happened before.\n\n" +
            "## Why it changes the experience\n" +
            "Without a record, every contact starts from zero, the customer re-explains, you guess. With a record, you open their row and see: this is Fatou, a repeat buyer, her last order had a shipping issue we fixed, she prefers WhatsApp. Now you can say 'Hi Fatou, good to hear from you again' and handle her as a valued, known customer. That small thing builds enormous loyalty.\n\n" +
            "## What to capture\n" +
            "One row per customer: name, contact (and preferred channel), order history, past issues and how they were resolved, and any notes (preferences, VIP status, anything personal they mentioned). Update it after every meaningful interaction, capture-first, like Week 2.\n\n" +
            "## Use it proactively\n" +
            "A good record is not just reactive. It lets you spot a VIP and treat them specially, notice a customer who had a bad experience and check in, or see that someone has not ordered in a while. Support shades into retention here: the record is what lets you turn one-time buyers into regulars.\n\n" +
            "## Privacy matters\n" +
            "Customer data is sensitive. Keep it secure (proper sharing permissions, from Week 2), only collect what you need, and never expose it. Handling customer information carefully is part of being trusted with a business's operations.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "For a small business, a well-kept spreadsheet can serve as a CRM.",
              answer: true,
              whenRight: "Yes. A CRM is just an organised record of customers and interactions; a clean sheet does that fine until the business outgrows it.",
              whenWrong: "It can. You do not need expensive software at small scale; a structured sheet (one row per customer, with history and notes) is a real CRM.",
            },
            {
              prompt: "Logging past interactions lets you treat a returning customer as a known person, which builds loyalty.",
              answer: true,
              whenRight: "Yes. Seeing their history means you greet them by name and handle them in context, which feels personal and earns loyalty.",
              whenWrong: "It does. A record turns a stranger into a known customer; 'good to hear from you again, Fatou' is only possible if you logged the history.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Build and use a CRM",
          body:
            "1. Build a customer log sheet with columns: Name, Contact, Preferred channel, Order history, Past issues/resolutions, Notes.\n" +
            "2. Add five sample customers, including one repeat buyer with a past resolved issue and one VIP.\n" +
            "3. Write the opening line of a reply to the repeat buyer that shows you know their history.\n\n" +
            "Deliverable: the CRM sheet plus the personalised opening line.",
        },
      ],
    },
    {
      number: 4,
      title: "Conflict resolution and de-escalation",
      summary: "Turn a furious customer into a calm, and often loyal, one.",
      items: [
        {
          kind: "lesson",
          title: "Defusing the hard ones",
          body:
            "## The angry customer is an opportunity\n" +
            "Most businesses handle angry customers badly, defensive, slow, robotic, which is exactly why handling them well stands out. A furious customer who is treated with calm respect and a real fix often becomes one of your most loyal, because you exceeded the low bar they expected.\n\n" +
            "## The de-escalation sequence\n" +
            "1. **Acknowledge and validate the feeling.** \"You're absolutely right to be frustrated, this isn't the experience we want for you, and I'm sorry.\" This single step releases most of the heat. People escalate when they feel unheard.\n" +
            "2. **Take ownership, do not deflect.** No 'the courier did it' or 'our policy says'. \"Let me sort this out for you.\" You can acknowledge a bad experience without admitting legal fault.\n" +
            "3. **Act concretely.** Tell them exactly what you are doing, now. Vague reassurance does not calm anyone; a specific action does.\n" +
            "4. **Follow through and follow up.** Do what you said, then confirm it is done. The follow-up ('just confirming your refund went through') turns a save into loyalty.\n\n" +
            "## Phrases that work (and ones that do not)\n" +
            "Helpful: 'You're right.' 'I'm sorry this happened.' 'Here's what I'm going to do.' 'Let me make this right.' Harmful: 'Calm down.' 'As per our policy...' 'There's nothing I can do.' 'You should have...'. The harmful ones all blame or dismiss; the helpful ones acknowledge and act.\n\n" +
            "## Protect yourself too\n" +
            "Empathy is not endless tolerance. If a customer is abusive, you can stay calm, set a boundary ('I want to help and I'll keep helping, but I'd ask that we keep this respectful'), and escalate to the founder if needed. And use the Week 1 rule: if a message makes you want to fire back, wait. Reply calm, never hot.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "'I understand your frustration, let me make this right' works better than 'as per our policy...'.",
              answer: true,
              whenRight: "Yes. Acknowledge-and-act calms; policy-quoting and blame escalate. Lead with the feeling, then the concrete fix.",
              whenWrong: "Acknowledge-and-act wins. 'Per our policy' reads as a brush-off to an upset person. Validate first, then fix.",
            },
            {
              prompt: "Showing empathy means tolerating any amount of abuse from a customer.",
              answer: false,
              whenRight: "Correct. Empathy is not endless tolerance. Stay calm, set a respectful boundary, and escalate genuine abuse to the founder.",
              whenWrong: "No. You can be empathetic and still set a boundary against abuse. Calm respect goes both ways; escalate if it turns abusive.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "De-escalate two hard tickets",
          body:
            "Write replies that de-escalate:\n" +
            "1. 'This is the WORST shop ever. My order is 3 weeks late, no updates, and now I've missed my mother's birthday. I want a full refund and I'm warning everyone away from you.' (Assume the parcel is delayed but arrives in 2 days.)\n" +
            "2. 'I've emailed twice and no one has replied. Are you even a real business?' (Assume the earlier emails were genuinely missed.)\n\n" +
            "Use the de-escalation sequence and offer something concrete. Deliverable: the two replies.",
        },
      ],
    },
    {
      number: 5,
      title: "Speed, tone, and prioritising the queue",
      summary: "Be fast and consistent, and work the queue by what matters most.",
      items: [
        {
          kind: "lesson",
          title: "Running the queue well",
          body:
            "## Speed matters, within reason\n" +
            "A fast first response calms people, even if the full fix takes longer. A customer who hears back in an hour ('I'm on it, will have an answer by end of day') is calm; one who hears nothing for two days is angry by the time you reach them. Set a response-time standard you can keep (e.g. 'all tickets get a first reply within one business day') and tell customers what to expect.\n\n" +
            "## Prioritise the queue\n" +
            "Not all tickets are equal. Work by urgency and impact, not just order received:\n" +
            "- **Urgent and high-impact first:** an angry customer, a payment failure, anything time-sensitive (a delivery for an event).\n" +
            "- **Quick wins next:** simple questions you can clear in seconds keep the queue from piling up.\n" +
            "- **Slower, complex ones:** give these proper time, but send a holding reply first so the customer is not left waiting in silence.\n\n" +
            "## A consistent tone\n" +
            "Every reply should sound like the same warm, competent Kola, whether it is the first ticket of the day or the fiftieth, whether you are fresh or tired. That is what your macros and a short tone guide protect. Consistency is what makes support feel like a real, dependable business rather than one person's mood.\n\n" +
            "## Do not over-promise\n" +
            "It is tempting to promise a quick fix to make someone happy now. Resist. Promise only what you can deliver, then deliver it. An over-promise that fails ('it'll be there tomorrow' when it won't) does far more damage than an honest 'it'll be 3 days'. Reliability beats optimism every time.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A fast first response calms a customer even when the full resolution takes longer.",
              answer: true,
              whenRight: "Yes. A quick 'I'm on it, answer by end of day' reassures; silence breeds anger. Acknowledge fast, even if the fix takes time.",
              whenWrong: "It does. The first reply's speed is what calms people. A holding response now beats a perfect answer two days of silence later.",
            },
            {
              prompt: "It is better to over-promise a quick fix to make the customer happy now, even if you might not deliver.",
              answer: false,
              whenRight: "Correct. A failed over-promise does more damage than an honest longer estimate. Promise only what you can deliver, then deliver it.",
              whenWrong: "No. Over-promising and missing destroys trust. Be honest about timing; reliability beats a hopeful promise you cannot keep.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Prioritise and set standards",
          body:
            "1. Given this queue, number them in the order you would work them and say why: a simple shipping question; a furious customer whose event is tomorrow; a payment failure; a restock request; a 'thank you, love my order' message.\n" +
            "2. Write a one-line response-time standard you would commit to and communicate to customers.\n" +
            "3. Write a short tone guide (3 to 5 adjectives with a do/don't example) for Kola support.\n\n" +
            "Deliverable: the prioritised queue with reasons, the standard, and the tone guide.",
        },
      ],
    },
    {
      number: 6,
      title: "From support to retention",
      summary: "Turn good support into loyal customers and fewer tickets over time.",
      items: [
        {
          kind: "lesson",
          title: "Support that grows the business",
          body:
            "## Support is a growth lever, not just a cost\n" +
            "The best operators see support as a way to grow the business, not just to put out fires. Two big moves: turn resolved problems into loyalty, and reduce the tickets that keep happening.\n\n" +
            "## Turning a save into loyalty\n" +
            "After you fix a problem, a small extra step creates a fan: a follow-up to confirm all is well, a sincere thank-you for their patience, sometimes a small gesture (a discount code, free shipping next time). The customer who had a problem you solved generously will tell people about you. This is far cheaper than winning a new customer and far more powerful than an ad.\n\n" +
            "## Reduce tickets at the source\n" +
            "Every recurring question is a signal. If 40% of tickets are 'where is my order?', the fix is not faster replies, it is putting clear tracking in the confirmation email and an FAQ on the site, so customers never need to ask. Track which questions repeat, and propose upstream fixes:\n" +
            "- A clear FAQ or help page for the top questions\n" +
            "- Better product photos/descriptions (cuts 'not as pictured' complaints)\n" +
            "- Clear shipping info up front (cuts 'where is it / how much' questions)\n" +
            "- Proactive shipping updates (cuts 'where is my order')\n\n" +
            "Proposing these makes you more than a ticket-answerer; you become someone improving the business.\n\n" +
            "## Report the patterns\n" +
            "Part of running support is telling the founder what you are seeing: 'This week, 30% of tickets were about shipping times, here are two things that would cut that in half.' That insight, which only the person in the inbox has, is genuinely valuable and marks you as an operator, not just a responder.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "If the same question keeps coming up, the best fix is just to answer it faster each time.",
              answer: false,
              whenRight: "Correct. A recurring question is a signal to fix the cause (add tracking, an FAQ, clearer info) so customers stop needing to ask at all.",
              whenWrong: "Faster answers treat the symptom. The real win is removing the cause upstream so the ticket stops happening. Fix the source, not just the speed.",
            },
            {
              prompt: "Telling the founder which issues are driving the most tickets is valuable insight only the support person has.",
              answer: true,
              whenRight: "Yes. You are in the inbox; you see the patterns no one else does. Reporting them (with fixes) marks you as an operator, not just a responder.",
              whenWrong: "It is valuable. The person handling tickets sees patterns the founder cannot. Surfacing them with proposed fixes is high-value operator work.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Reduce tickets and build loyalty",
          body:
            "1. From the ticket types this week, identify the two most common and propose a concrete upstream fix for each (e.g. an FAQ entry, a confirmation-email change).\n" +
            "2. Write a follow-up message that turns a resolved complaint into loyalty (with a small gesture).\n" +
            "3. Draft a short FAQ (5 questions and answers) for Kola that would deflect common tickets.\n\n" +
            "Deliverable: the two fixes, the loyalty follow-up, and the 5-question FAQ.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship: the support simulation",
      summary: "Run a full ticket queue and report. Portfolio artefact #7.",
      items: [
        {
          kind: "lesson",
          title: "A support operation, packaged",
          body:
            "## The week's deliverable\n" +
            "Today you run a realistic support week for Kola and package it: a 15-ticket queue worked end to end, your 10+ macro library, customers logged in your CRM, and a short report covering what you handled, how you de-escalated the hard ones, and what would reduce future tickets. This is portfolio artefact number seven.\n\n" +
            "## Why this sells\n" +
            "Customer support is one of the most available remote roles for someone starting out, because every online business needs it and it can be done from anywhere. Showing that you can run a support operation, fast, warm, consistent, with de-escalation and a retention mindset, makes you immediately hireable. The report, in particular, shows you do not just answer tickets; you think about the customer experience as a whole.\n\n" +
            "## The standard\n" +
            "Three tests: your replies are warm, specific, and resolve the issue (no robotic non-answers); your hardest ticket is genuinely de-escalated, not just appeased; and your report turns ticket patterns into concrete recommendations. Hit those and a founder would trust you with their customers, which is a real thing to be trusted with.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Customer support is a strong entry point into remote work because nearly every online business needs it.",
              answer: true,
              whenRight: "Yes. It is in constant demand, can be done from anywhere, and a strong support portfolio makes you immediately hireable.",
              whenWrong: "It is a strong entry point. Every online business needs support, it is location-independent, and it is a skill you can demonstrate clearly.",
            },
            {
              prompt: "A great support deliverable just shows fast replies, not any thinking about the wider customer experience.",
              answer: false,
              whenRight: "Correct. The report that turns ticket patterns into fixes is what marks you as an operator, not just a responder. Thinking about the whole experience is the value.",
              whenWrong: "Speed alone is not the bar. Showing you analyse patterns and improve the customer experience is what makes the support package genuinely impressive.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Final build: the support simulation",
          body:
            "This is the Week 7 portfolio deliverable. Produce:\n" +
            "1. **A worked 15-ticket queue** (mix of orders, questions, complaints, one furious customer), each with your reply, the policy you applied, and its final status.\n" +
            "2. **Your 10+ macro library** and the CRM with the customers logged.\n" +
            "3. **A short support report**: volume by type, how you handled the hardest one, and two recommendations to reduce future tickets.\n\n" +
            "Export the report and macro library as a PDF. This is portfolio artefact #7.",
        },
      ],
    },
  ],
  topics: [
    "The support mindset: feeling first, fix second",
    "Setting up a simple help desk and status system",
    "The support reply formula",
    "Building a macro/response library",
    "CRM basics and customer records",
    "Conflict resolution and de-escalation",
    "Speed, tone, and prioritising the queue",
    "From support to retention and reducing tickets",
  ],
  tasks: [
    "Set up a support inbox, status system, and simple CRM",
    "Reply to tickets using the support formula",
    "Build a 10+ macro response library",
    "Log customers and use their history",
    "De-escalate angry customers in writing",
    "Prioritise a queue and set a response-time standard",
    "Run a 15-ticket simulation and report patterns",
  ],
  project:
    "Run a Kola support simulation: a 15-ticket queue worked end to end (including a furious customer), a 10+ macro response library, customers logged in a simple CRM, and a short report on what you handled and what would reduce future tickets. Portfolio artefact #7.",
  exercises: [
    "Reply to five varied tickets using the support formula",
    "Build a 10-macro library with two personalised examples",
    "Build a CRM and write a history-aware reply to a repeat customer",
    "De-escalate two furious customers using the sequence",
    "Prioritise a queue and propose two ticket-reducing fixes",
  ],
  questions: [
    "What turns a one-time buyer into a loyal customer through support?",
    "When do you use a macro versus a personal reply?",
    "How do you de-escalate without giving away the business?",
  ],
  outputs: [
    "A worked 15-ticket queue with resolutions",
    "A 10+ macro response library",
    "A simple CRM/customer log",
    "A support report with patterns and recommendations",
  ],
  mastery_questions: [
    "Resolve a refund request following a clear, fair policy",
    "Write a support reply using acknowledge, answer/act, next step, warm close",
    "De-escalate an angry customer with the full sequence and a concrete fix",
    "Prioritise a queue by urgency and impact and justify the order",
    "Log a customer interaction and write a history-aware opening line",
    "Turn a resolved complaint into loyalty with a follow-up and a gesture",
    "Write a macro and personalise it for a real ticket",
    "Set and communicate a realistic response-time standard",
    "Identify a recurring ticket type and propose an upstream fix",
    "Report support volume and patterns with two recommendations",
  ],
  ai_assist:
    "Use AI to draft macros, suggest de-escalation phrasing, and summarise a long customer history before you reply ('summarise this customer's past three tickets'). Ask it to rewrite a reply to sound warmer or more concise. Keep the human firmly in the loop on refunds, exceptions, and anything emotional, an upset customer can instantly tell they are talking to a robot, and that makes it worse. Use AI for speed on the routine; bring your own warmth and judgement to the hard ones.",
  pre_flight:
    "Before working the queue, decide your policies and authority: what is the refund rule, what can you offer to make things right (discount, free shipping, replacement), and what must go to the founder? Knowing your limits in advance makes you fast, confident, and consistent instead of stalling on every ticket.",
  common_mistakes: [
    "Leading with policy or blame instead of acknowledging the feeling",
    "Slow first responses that let a small issue grow into anger",
    "Sending a macro verbatim so it reads robotic",
    "Over-promising a fix you cannot deliver",
    "Answering recurring tickets faster instead of fixing their cause",
  ],
  debug_help:
    "If customers keep escalating, look at your first reply: does it acknowledge the feeling and give a concrete next action with a timeline? Most escalation comes from a first response that felt robotic, slow, or defensive. Lead with a genuine acknowledgement, take ownership, and act specifically. If the same tickets keep coming, stop treating the symptom, fix the cause upstream (FAQ, clearer info, proactive updates) and the volume drops.",
  stretch: [
    "Build a full help-centre / FAQ page to deflect the top tickets",
    "Create a support tone guide so every reply sounds like the same brand",
    "Set up basic automation: an auto-acknowledgement and ticket routing",
  ],
  resources: [
    { label: "Help Scout blog", url: "https://www.helpscout.com/blog/", note: "Free, support writing and strategy" },
    { label: "Zendesk blog", url: "https://www.zendesk.com/blog/", note: "Free, customer-service reference" },
  ],
};
