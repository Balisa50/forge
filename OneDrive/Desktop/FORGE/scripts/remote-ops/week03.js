/* Week 3 - Email and calendar management (Phase: Executive Support) */
module.exports = {
  number: 3,
  title: "Email and calendar management",
  phase: "Executive Support",
  commitment_hours: "6, 10",
  context:
    "This is the bread and butter of executive support, and the skill most clients hire for first. A founder's inbox is where their day gets hijacked. If you can take it over and make it calm, you have made yourself indispensable. This week you learn to take a chaotic inbox to zero, build filters and labels that triage automatically, manage a calendar across time zones, and coordinate meetings without the endless back-and-forth.\n\n" +
    "You will run a mock CEO inbox and calendar for Ama: 40 messy emails, five meetings to book (one international), a double-booking to untangle, and a supplier trip to plan. By Friday the chaos is a system, and you have documented it so it runs the same way every week.\n\n" +
    "Master this week and you can walk into almost any remote role tomorrow, because every founder on earth is drowning in email and looking for someone to fix it.",
  concept_check: [
    {
      q: "Ama gets 80 emails a day. What is the most sustainable way to keep her inbox calm?",
      choices: [
        "Read and reply to every email the moment it arrives",
        "Set up filters and labels so routine mail is sorted automatically, and only real decisions reach the main view",
        "Archive everything older than a week",
        "Turn off email notifications and check once a day",
      ],
      correct: 1,
      explain: "The goal is fewer items needing a human, not faster human sorting. Automation (filters, labels) handles the routine so only genuine decisions land in front of you or the founder.",
    },
    {
      q: "You book a call with a client in London for '3pm'. You are in Accra. What is the risk?",
      choices: [
        "None, 3pm is 3pm everywhere",
        "Accra and London can be the same or an hour apart depending on the season, and without stating the zone someone shows up at the wrong time",
        "The client will be offended by the short notice",
        "Calendar apps cannot handle time zones",
      ],
      correct: 1,
      explain: "Always state the zone (e.g. '3pm GMT'). Ambiguous times cause missed international calls, one of the most avoidable and damaging early mistakes.",
    },
    {
      q: "What is 'inbox zero'?",
      choices: [
        "Having literally no emails in your account",
        "A state where every email has been processed into an action, a label, or the archive, so nothing is left undecided",
        "Deleting all emails at the end of each day",
        "Replying to every email within five minutes",
      ],
      correct: 1,
      explain: "Inbox zero is about decisions, not deletion. Every message has been triaged (do, defer, delegate, file, or delete) so nothing sits unread and undecided.",
    },
  ],
  days: [
    {
      number: 0,
      title: "The inbox-zero mindset, and set up your triage system",
      summary: "Understand what inbox zero really means, then set up Gmail labels and filters that do the sorting for you.",
      items: [
        {
          kind: "lesson",
          title: "Inbox zero is about decisions, not deletion",
          body:
            "## Why the inbox runs the founder's day\n" +
            "An unmanaged inbox is a to-do list other people write for you. Every unread email is a small open loop, and a founder with 200 of them feels permanently behind. When you take over Ama's inbox, you are not just 'answering email', you are giving her back her attention. That is why this is the single most-hired-for skill in remote operations.\n\n" +
            "## What inbox zero actually means\n" +
            "Inbox zero does not mean an empty account or deleting everything. It means **every email has been processed into a decision**, so nothing sits unread and undecided. For each message there are five possible moves (some people call it the 5 Ds):\n" +
            "- **Do** it now if it takes under two minutes.\n" +
            "- **Defer** it: it needs real work, so it becomes a task with a date.\n" +
            "- **Delegate** it: it is not yours, forward it to who owns it.\n" +
            "- **File** it: no action needed, label and archive it for reference.\n" +
            "- **Delete** it: junk.\n\n" +
            "After this pass, the inbox view is empty not because mail vanished, but because every item has a home. That is the calm you are selling.\n\n" +
            "## The mindset shift\n" +
            "Amateurs treat the inbox as a place to live in all day. Pros treat it as a queue they process in dedicated blocks (say, twice a day) and otherwise leave closed. Constant inbox-checking shatters focus; scheduled processing keeps it calm and gets more done. You will set Ama up this way.",
        },
        {
          kind: "video",
          title: "7 Proven Gmail Tips to Reach Inbox Zero (and stay there!)",
          url: "https://www.youtube.com/watch?v=n5ZRNUpvXLA",
          duration_min: 13,
          creator: "Simpletivity",
          difficulty: "beginner",
          why: "Scott from Simpletivity is a respected productivity teacher. This shows the exact Gmail moves (labels, filters, archive) you will set up below. Watch it, then build the system on your own inbox in the exercise.",
        },
        {
          kind: "lesson",
          title: "Set up labels and filters, step by step",
          body:
            "## Do this in your own Gmail now\n" +
            "You will practise on your own inbox so the muscle memory is real.\n\n" +
            "**1. Create labels (your triage categories).** In Gmail, scroll the left sidebar to 'More' > 'Create new label'. Make four: `Action` (needs you to do something), `Waiting` (you replied, waiting on someone), `Reference` (keep, no action), and `Receipts`. Labels are how you find things after archiving.\n\n" +
            "**2. Create a filter that auto-sorts.** Click the search bar's filter icon (sliders), or Settings > Filters and Blocked Addresses > Create a new filter. Try: from `noreply@` or anything with 'unsubscribe', then 'Create filter' > 'Skip the Inbox (Archive it)' + 'Apply label: Reference'. Now newsletters never clutter the main view again, they are quietly filed.\n\n" +
            "**3. Test it.** Send yourself (or find) a newsletter and confirm it lands under the label, not the inbox. That is the result you want: routine mail sorting itself.\n\n" +
            "**4. Archive vs delete.** Archive (the box icon) removes mail from the inbox but keeps it, searchable forever. Delete is for true junk. When in doubt, archive, storage is cheap and a deleted client email is a problem.\n\n" +
            "Repeat this for two or three common sender types and your inbox already does a third of the work itself.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Archiving an email deletes it permanently.",
              answer: false,
              whenRight: "Correct. Archive removes it from the inbox but keeps it fully searchable. Delete is the permanent one, reserve it for true junk.",
              whenWrong: "No. Archive just files the email out of the inbox; you can always find it by search or label. Delete is the permanent action.",
            },
            {
              prompt: "A good filter can automatically label and archive routine mail before it ever clutters the inbox.",
              answer: true,
              whenRight: "Yes. That is the whole point of filters: routine mail (newsletters, receipts) sorts itself, so only real decisions reach the main view.",
              whenWrong: "It can. Filters auto-apply labels and skip the inbox, so newsletters and receipts file themselves and never add to the founder's load.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, build a triage system",
          body:
            "Set this up on your own Gmail.\n\n" +
            "- [ ] Created four labels: Action, Waiting, Reference, Receipts\n" +
            "- [ ] Created at least two filters that auto-archive and label routine mail (newsletters, receipts)\n" +
            "- [ ] Tested a filter by confirming a matching email lands under its label, not the inbox\n" +
            "- [ ] Processed 10 real emails using the 5 Ds (do / defer / delegate / file / delete)\n\n" +
            "Deliverable: a screenshot of your label list and one filter you created.",
        },
      ],
    },
    {
      number: 1,
      title: "Triaging an inbox to zero",
      summary: "A repeatable pass that takes any inbox from chaos to processed.",
      items: [
        {
          kind: "lesson",
          title: "The inbox-zero pass",
          body:
            "## A system you repeat, not a one-time clean\n" +
            "Anyone can clean an inbox once. The skill is a repeatable pass you run in a dedicated block, so it stays calm. Here is the pass you will run on Ama's inbox.\n\n" +
            "## The pass, top to bottom\n" +
            "1. **Work top to bottom, never skip around.** Jumping to 'interesting' emails is how things get missed.\n" +
            "2. **For each email, decide in seconds using the 5 Ds.** Do (under 2 min, handle now), Defer (make it a task with a date, then archive or label Action), Delegate (forward, label Waiting), File (label Reference, archive), Delete (junk).\n" +
            "3. **Never leave an email 'read but undecided'.** That is the trap, a read email with no decision is invisible work that comes back to bite you.\n" +
            "4. **Use the labels.** After the pass, your `Action` label is your real to-do list, `Waiting` is your follow-up list.\n\n" +
            "## What 'reach Ama' should mean\n" +
            "When you run someone's inbox, most mail should never reach them. You handle the routine (order confirmations, simple questions, scheduling) and surface only what genuinely needs the founder: a decision, a relationship, money, or something sensitive. A weekly note, \"here are the three things this week that actually need you\", is the dream for a busy founder.\n\n" +
            "## Speed comes from templates\n" +
            "Half the emails you send are variations of the same few replies. That is the next day, canned responses, which turn a five-minute reply into a ten-second one.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "When running a founder's inbox, your goal is for as many emails as possible to reach the founder so they stay informed.",
              answer: false,
              whenRight: "Correct. The opposite: you handle the routine and surface only what truly needs them (decisions, money, relationships, sensitive issues). Less noise is the value.",
              whenWrong: "No. Forwarding everything just moves the overwhelm. You filter so only the few emails that genuinely need the founder reach them.",
            },
            {
              prompt: "Leaving an email 'read but with no decision made' is fine as long as you remember it.",
              answer: false,
              whenRight: "Correct. Read-but-undecided is invisible work that slips. Every email gets a decision (do/defer/delegate/file/delete) on the pass.",
              whenWrong: "It is the main trap. Memory fails; a read email with no decision quietly becomes a dropped ball. Decide on every one.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Run an inbox-zero pass on a mock inbox",
          body:
            "Create a mock inbox of 15 emails for Ama (write the subject lines and a one-line summary each: a few customer questions, two supplier replies, a newsletter, two receipts, an urgent website issue, a meeting request, a spam, a personal note from Ama).\n\n" +
            "1. Process every one top to bottom with the 5 Ds. Label each: Action, Waiting, Reference, Receipts, or Delete.\n" +
            "2. List which three (if any) genuinely need Ama, and write the one-line note you would send her.\n\n" +
            "Deliverable: the 15 emails with their decision and label, plus your 'needs Ama' shortlist.",
        },
      ],
    },
    {
      number: 2,
      title: "Templates and canned responses",
      summary: "Turn the emails you send a hundred times into ten-second replies.",
      items: [
        {
          kind: "lesson",
          title: "Canned responses that still feel personal",
          body:
            "## Most replies are variations of a few\n" +
            "Run a support-heavy inbox for a week and you will notice the same questions: where is my order, do you ship to X, can I return this, what are your prices. Re-typing each answer is slow and inconsistent. Canned responses (saved reply templates) fix both.\n\n" +
            "## Set them up in Gmail\n" +
            "Turn on Templates: Settings > Advanced > Templates > Enable. Now compose a reply, click the three-dot menu > Templates > Save draft as template. Next time, insert it in two clicks and tweak the details.\n\n" +
            "## The art: a template that does not feel like one\n" +
            "A canned response should be a *starting point*, not a robot voice. Keep the structure saved but always personalise the specifics: the person's name, their actual order number, one human line. Compare:\n\n" +
            "> *Robotic: \"Dear Customer, your inquiry has been received and will be processed.\"*\n\n" +
            "> *Good (from a template): \"Hi Fatou, thanks for reaching out. Your order (KOLA-318) shipped this morning and should reach you by Thursday, here is the tracking link. Anything else I can help with?\"*\n\n" +
            "Same speed, completely different feeling. The customer cannot tell it started as a template, because you filled in the human parts.\n\n" +
            "## Build a small library\n" +
            "Aim for the eight to ten replies you send most: order status, shipping question, return/refund, out of stock, thank-you for an order, scheduling a call, a polite 'we cannot do that', and a holding reply ('I am looking into this, will update you by X'). With these saved, you handle a heavy inbox in a fraction of the time.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A good canned response is sent exactly as saved, with no personalisation, to stay fast.",
              answer: false,
              whenRight: "Correct. Always personalise the specifics (name, order number, one human line). The template saves the structure; you fill in the human parts.",
              whenWrong: "No. Sent verbatim, a template reads robotic. Keep the saved structure but always add the person's name and real details so it feels human.",
            },
            {
              prompt: "A holding reply ('I'm looking into this, will update you by Thursday') is a useful template to have.",
              answer: true,
              whenRight: "Yes. It acknowledges the person immediately and sets an expectation, which stops the 'are they ignoring me?' spiral while you work on the real answer.",
              whenWrong: "It is very useful. A quick, honest holding reply buys you time and keeps the person calm instead of wondering if you saw their message.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Build a canned-response library",
          body:
            "1. Enable Templates in your Gmail settings.\n" +
            "2. Write and save four canned responses for Kola: order status, a shipping/returns question, an out-of-stock apology, and a holding reply.\n" +
            "3. For one of them, show two versions: the bare template and a personalised send (with a name, order number, and one human line).\n\n" +
            "Deliverable: your four templates plus the before/after personalised example.",
        },
      ],
    },
    {
      number: 3,
      title: "Calendar management",
      summary: "Own the calendar so the founder's time is protected and nothing collides.",
      items: [
        {
          kind: "lesson",
          title: "Running someone's calendar",
          body:
            "## The calendar is the founder's most finite resource\n" +
            "There are only so many hours. When you manage Ama's calendar, you are the gatekeeper of her time, and that is a position of real trust. Done well, she stops worrying about double-bookings, back-to-back exhaustion, and forgotten commitments.\n\n" +
            "## The rules of a well-run calendar\n" +
            "- **Protect focus time.** Block chunks for deep work so the day is not shredded into meetings. An unprotected calendar fills with other people's priorities.\n" +
            "- **Add buffers.** Never stack meetings back to back; leave 10 to 15 minutes between them for overrun, notes, and a breath. A day of wall-to-wall calls with no gaps is a day that collapses.\n" +
            "- **Every event has the essentials.** A clear title, the time *with time zone*, a location or video link, an agenda or purpose in the notes, and the right guests. A calendar invite with no link or agenda is a small daily failure.\n" +
            "- **Default meeting length down.** Most 60-minute meetings could be 30. Booking 30 by default quietly gives the founder hours back.\n\n" +
            "## Colour and category\n" +
            "Use colours to make the week readable at a glance: one colour for external meetings, one for internal, one for focus blocks, one for personal. Ama should be able to look at her week and instantly see its shape.\n\n" +
            "## The daily look-ahead\n" +
            "Each morning, send or prepare a quick look at the day: \"You have 3 meetings today: 10am supplier call (link in invite), 1pm team standup, 4pm investor intro, I have added prep notes to each.\" That one habit makes a founder feel completely on top of their day.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Stacking meetings back-to-back with no gaps is an efficient use of a founder's calendar.",
              answer: false,
              whenRight: "Correct. No buffers means every overrun cascades and the founder is exhausted. Leave 10 to 15 minutes between meetings.",
              whenWrong: "It backfires. Back-to-back with no buffer means one late meeting wrecks the rest of the day. Build in gaps for overrun and notes.",
            },
            {
              prompt: "Blocking focus time on the calendar is a legitimate, important part of calendar management.",
              answer: true,
              whenRight: "Yes. If you do not protect focus time, meetings expand to fill the day and deep work never happens. Blocking it is protecting the founder's priorities.",
              whenWrong: "It is. An unprotected calendar fills with other people's meetings. Reserving focus blocks is one of the highest-value things a calendar manager does.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Build a clean weekly calendar",
          body:
            "Using Google Calendar (or a drawn grid), build one realistic week for Ama:\n" +
            "1. Add five meetings, each with a clear title, time WITH zone, a link or location, and a one-line agenda.\n" +
            "2. Add two focus blocks and ensure every meeting has a 10 to 15 minute buffer.\n" +
            "3. Colour-code external, internal, focus, and personal.\n" +
            "4. Write the one-paragraph 'your day today' note for the busiest day.\n\n" +
            "Deliverable: a screenshot of the week plus the daily look-ahead note.",
        },
      ],
    },
    {
      number: 4,
      title: "Scheduling without the back-and-forth",
      summary: "Coordinate meetings between busy people without ten emails, using a scheduling link.",
      items: [
        {
          kind: "lesson",
          title: "Kill the scheduling ping-pong",
          body:
            "## The problem everyone has felt\n" +
            "\"Are you free Tuesday?\" \"No, Wednesday?\" \"Morning or afternoon?\" \"Actually Thursday is better.\" Scheduling a single meeting between two busy people can take six emails over two days. Across a founder's week, that is hours wasted. Your job is to make it disappear.\n\n" +
            "## Option A: the scheduling link\n" +
            "Tools like Calendly (free tier) connect to the calendar and share a link showing only the founder's real free slots, in the *guest's* time zone. The guest picks a time, it books itself, both calendars update, and a confirmation goes out. Six emails become one link. Set up: connect your Google Calendar, define availability rules (e.g. Tue to Thu, 10am to 4pm, 30-min slots, with buffers), and share the link. This is a genuine superpower for an assistant.\n\n" +
            "## Option B: the 'propose three times' method\n" +
            "When a link is too impersonal (a senior contact, an important client), do not ask 'when are you free?', that pushes the work onto them. Instead propose: \"Would Tuesday 2pm, Wednesday 11am, or Thursday 4pm (all GMT) work? Happy to find another time if not.\" Offering specific options turns an open question into a quick pick.\n\n" +
            "## Always confirm in writing\n" +
            "Once booked, send a confirmation: date, time *with zone*, the link or address, and the agenda. \"Confirmed: Wed 11am GMT, Google Meet (link), to review the September budget.\" The confirmation prevents no-shows and wrong-time mix-ups.\n\n" +
            "## Reminders\n" +
            "For important external meetings, a short reminder the day before ('looking forward to our call tomorrow at 11am GMT, here is the link') dramatically cuts no-shows. Small habit, big reliability.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "When scheduling with a senior client, the most considerate opening is 'when are you free?'",
              answer: false,
              whenRight: "Correct. 'When are you free?' dumps the work on them. Propose two or three specific times (with zone) so they just pick one.",
              whenWrong: "It is not. Open availability questions make the other person do the thinking. Offer specific time options so they can answer in seconds.",
            },
            {
              prompt: "A scheduling link like Calendly can show the guest available slots in the guest's own time zone.",
              answer: true,
              whenRight: "Yes. That is a big part of why it kills the back-and-forth: it auto-converts to the guest's zone, so there is no manual maths or confusion.",
              whenWrong: "It can. Calendly converts your free slots into the guest's local time automatically, removing both the email ping-pong and the time-zone errors.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Set up frictionless scheduling",
          body:
            "1. Set up a free Calendly (or similar) account, connect a calendar, and create one event type (e.g. '30-min call', Tue to Thu, with buffers). Grab the link.\n" +
            "2. Write a 'propose three times' email to a senior contact for an important meeting, with zones stated.\n" +
            "3. Write the confirmation message you would send once a time is picked.\n\n" +
            "Deliverable: your scheduling link (or a screenshot of the setup), plus the propose-times and confirmation messages.",
        },
      ],
    },
    {
      number: 5,
      title: "Time zones and international scheduling",
      summary: "Work across borders without ever causing a missed call.",
      items: [
        {
          kind: "lesson",
          title: "Never get a time zone wrong",
          body:
            "## The mistake that ends trials\n" +
            "As a remote operator you might serve a founder in New York while sitting in Accra, with a supplier in China and a client in London. The single fastest way to lose a new client's confidence is to get a time wrong and cause a missed call. It looks careless, and it is completely avoidable.\n\n" +
            "## The rules\n" +
            "- **Always state the zone.** Never write '3pm'. Write '3pm GMT' or '3pm ET'. Every time, even internally.\n" +
            "- **Confirm the other person's zone first.** When booking across borders, ask or check where each person is. Do not assume.\n" +
            "- **Use tools, not mental maths.** Google Calendar can display a second time zone (Settings > add a secondary time zone) and shows guests times in their own zone. A world clock or a site like a time-zone converter removes the error. For finding a slot that works across three cities, a tool that overlays working hours is invaluable.\n" +
            "- **Watch daylight saving.** Many countries shift their clocks twice a year; Ghana does not, but the UK and US do. The gap between Accra and London is zero or one hour depending on the season. This trips up everyone, so verify around March and November.\n\n" +
            "## Make it easy for the other person\n" +
            "When you propose a time across zones, give both: \"How about 2pm GMT (9am ET / 5pm Dubai)?\" The reader does not have to calculate, and there is no room for error. That small courtesy marks you as someone who has done this before.\n\n" +
            "## Set the working-hours expectation\n" +
            "If your client is far ahead or behind you, agree on overlap hours and your response rhythm up front, so neither side waits anxiously. \"Our hours overlap 2pm to 5pm GMT; outside that I reply first thing my morning.\" Predictability again.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "The time difference between Accra and London is always exactly the same all year.",
              answer: false,
              whenRight: "Correct. It is zero or one hour depending on UK daylight saving (Ghana does not change clocks). Verify around late March and late October.",
              whenWrong: "It changes. Ghana stays put, but the UK shifts for daylight saving, so the gap is sometimes 0 and sometimes 1 hour. Check around the clock-change dates.",
            },
            {
              prompt: "Writing '2pm GMT (9am ET)' for an international invite is over-explaining and unnecessary.",
              answer: false,
              whenRight: "Correct. Giving both zones removes all calculation and all room for error. It is a courtesy that marks you as experienced, not over-explaining.",
              whenWrong: "It is good practice. Stating both zones means the recipient never miscalculates, which prevents the missed-call disaster. Always worth the extra few words.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Schedule across three zones",
          body:
            "Ama (Accra/GMT) needs a 45-minute call with a buyer in London and a supplier in Dubai.\n" +
            "1. Find a time that falls within reasonable working hours for all three and write it with all three zones shown.\n" +
            "2. Add a secondary time zone to your Google Calendar and screenshot it.\n" +
            "3. Write the invite, with the agenda and the time in all three zones.\n\n" +
            "Deliverable: the chosen time across zones, the calendar screenshot, and the invite text.",
        },
      ],
    },
    {
      number: 6,
      title: "Travel planning and itineraries",
      summary: "Turn a trip into a single document the traveller can follow without thinking.",
      items: [
        {
          kind: "lesson",
          title: "Build an itinerary that thinks for the traveller",
          body:
            "## What good travel support feels like\n" +
            "When Ama travels to meet a supplier, she should not have to hold any logistics in her head. A great assistant hands her one clear document and she just follows it: where to be, when, how to get there, what is booked, who to contact. No digging through six confirmation emails at the airport.\n\n" +
            "## The one-page itinerary\n" +
            "Put everything in a single, time-ordered document:\n" +
            "- **Flights:** airline, flight number, departure and arrival times (with zones), terminal, booking reference.\n" +
            "- **Accommodation:** hotel name, address, check-in/out, booking reference, phone.\n" +
            "- **Ground transport:** how she gets from airport to hotel to meetings (taxi booked? address to give the driver?).\n" +
            "- **Meetings:** each one with time, location/address, who she is meeting, their phone, and the purpose.\n" +
            "- **Key contacts and essentials:** local emergency number, the supplier's contact, any visa or document notes.\n\n" +
            "Order it chronologically so she reads top to bottom through her trip. A title like 'Ama, Kumasi supplier trip, 12 to 14 Oct' and clear time stamps make it scannable.\n\n" +
            "## Anticipate, do not just book\n" +
            "The difference between an assistant and a great one is anticipation. Is there enough buffer between the flight landing and the first meeting? Is the hotel near the meetings or across town? Does she need cash, an adapter, a printed document? Thinking one step ahead, 'I have built in two hours after landing in case the flight is late', is exactly the judgement clients pay a premium for.\n\n" +
            "## Send it ahead and keep a copy\n" +
            "Share the itinerary before the trip, and keep your own copy so you can help if something changes mid-journey (a delayed flight, a cancelled meeting). Being reachable and ready to re-plan is part of the service.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A good itinerary is mostly about booking the cheapest flights and hotel.",
              answer: false,
              whenRight: "Correct. Booking is the easy part. The value is the clear, anticipatory document: order, buffers, contacts, and thinking one step ahead of problems.",
              whenWrong: "Price is only part of it. The real skill is assembling one clear, chronological document and anticipating issues (buffers, transport, contacts) so the traveller never has to think.",
            },
            {
              prompt: "Listing flight, hotel, and meeting details in chronological order makes an itinerary easier to follow.",
              answer: true,
              whenRight: "Yes. Time-ordered top-to-bottom means the traveller just reads down through their trip, no hunting across emails. Clarity is the whole point.",
              whenWrong: "It does. A chronological single document lets the traveller follow their trip step by step instead of piecing it together from scattered confirmations.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Build a trip itinerary",
          body:
            "Ama is flying from Accra to Kumasi for two days to meet two suppliers and visit a workshop.\n" +
            "1. Build a one-page, chronological itinerary covering (invent realistic details): flights with times and references, hotel, ground transport, the two supplier meetings with addresses and contacts, and one buffer you deliberately built in.\n" +
            "2. Add a short 'essentials' note (one thing she should bring or know).\n\n" +
            "Deliverable: the one-page itinerary document.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship: run the mock CEO inbox and calendar",
      summary: "Put it all together for a simulated week and document the system. Portfolio artefact #3.",
      items: [
        {
          kind: "lesson",
          title: "From skills to a documented system",
          body:
            "## The week's deliverable\n" +
            "You have learned triage, filters, templates, calendar management, frictionless scheduling, time zones, and travel planning. Today you run them together as one simulated week of executive support for Ama, and then you document the system so it is repeatable, by you or anyone who follows you.\n\n" +
            "## Why documenting it matters\n" +
            "Anyone can have one good inbox day. A client pays for a *reliable* inbox, the same calm result every week. Writing down your inbox-and-calendar system (your labels, your filters, your triage rules, your scheduling method, your daily look-ahead) does two things: it makes you consistent, and it proves to a future client that you run operations as a system, not by improvisation. That documented system is portfolio artefact number three.\n\n" +
            "## The standard\n" +
            "The test of your system write-up: could a brand-new assistant read it and run Ama's inbox the same way you do? If yes, you have not just done the work, you have built something a business can rely on, which is the difference between being hired by the hour and being trusted with the operation.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Documenting your inbox-and-calendar system mainly benefits you, not the client.",
              answer: false,
              whenRight: "Correct. It benefits both: it keeps you consistent AND proves to the client you run a reliable system, which is what earns trust and better pay.",
              whenWrong: "It benefits the client too. A documented system means the same calm result every week and shows you operate professionally, not by luck.",
            },
            {
              prompt: "The real value of email/calendar management is delivering the same calm result reliably, week after week.",
              answer: true,
              whenRight: "Yes. One good day is easy. Reliability, the founder never having to worry about their inbox or calendar again, is what they actually pay for.",
              whenWrong: "Reliability is the product. Anyone can tidy once; a client pays for the certainty that their inbox and calendar are handled every single week.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Final build: the executive-support week",
          body:
            "This is the Week 3 portfolio deliverable.\n\n" +
            "**Part A, run the week.** Using a mock inbox of ~40 emails (you can extend your Day 1 set), triage it to zero with your labels and filters; book five meetings including one international (with zones confirmed); resolve one double-booking and notify those affected; and produce the travel itinerary from Day 6.\n\n" +
            "**Part B, document the system.** Write a one-to-two page 'Inbox and Calendar SOP' covering your labels, your filters, your triage rules (the 5 Ds), your scheduling method, your time-zone rule, and your daily look-ahead, such that a new assistant could run it.\n\n" +
            "Export the SOP as a PDF and keep your mock inbox/calendar shareable. This is portfolio artefact #3.",
        },
      ],
    },
  ],
  topics: [
    "Inbox management and getting to inbox zero",
    "Email triage with the 5 Ds",
    "Labels, filters, and auto-sorting",
    "Templates and canned responses",
    "Calendar management, buffers, and focus time",
    "Scheduling without back-and-forth (Calendly, propose-times)",
    "Time zones and international scheduling",
    "Travel planning and itineraries",
  ],
  tasks: [
    "Set up labels and filters that auto-sort routine mail",
    "Run an inbox-zero pass with the 5 Ds",
    "Build a canned-response library",
    "Build a clean weekly calendar with buffers and focus time",
    "Set up a scheduling link and a propose-times method",
    "Schedule a meeting across three time zones correctly",
    "Build a travel itinerary",
    "Run a simulated executive-support week and document the SOP",
  ],
  project:
    "Run Ama's inbox and calendar for a simulated week: triage a 40-email mock inbox to zero using a label/filter system, schedule five meetings (including one international), resolve a double-booking, and produce a clean weekly calendar plus a travel itinerary. Document it all in an Inbox and Calendar SOP a newcomer could follow. Portfolio artefact #3.",
  exercises: [
    "Set up four labels and two auto-archiving filters in Gmail",
    "Process a 15-email mock inbox with the 5 Ds and a 'needs founder' shortlist",
    "Build four canned responses with one personalised example",
    "Build a clean weekly calendar with buffers, focus time, and a daily look-ahead",
    "Schedule a meeting across three time zones with all zones shown",
  ],
  questions: [
    "What is a repeatable system for getting an inbox to zero?",
    "How do filters and labels save hours per week?",
    "How do you coordinate a meeting without ten back-and-forth emails?",
  ],
  outputs: [
    "A triaged mock inbox at zero with labels and filters",
    "A canned-response library",
    "A clean weekly calendar and a travel itinerary",
    "An Inbox and Calendar SOP (PDF)",
  ],
  mastery_questions: [
    "Triage a messy inbox into Action, Waiting, Reference, Receipts, and Delete",
    "Create two Gmail filters that auto-label and archive routine mail",
    "Write a canned response and personalise it for a real customer",
    "Process an email with each of the 5 Ds and explain the choice",
    "Schedule a meeting and send a confirmation with the time zone stated",
    "Resolve a calendar double-booking and notify everyone affected",
    "Set up a scheduling link (Calendly or similar) with availability rules and buffers",
    "Convert a meeting time across three time zones correctly",
    "Build a travel itinerary with flights, hotel, transport, and a deliberate buffer",
    "Write an Inbox and Calendar SOP a new assistant could run",
  ],
  ai_assist:
    "Use AI to draft canned responses, summarise a long email thread into the key decision and action, and convert time zones. Paste a messy list of email subjects and ask it to triage them into Action/Waiting/Reference/Delete so you internalise the pattern. Ask it to draft your Inbox and Calendar SOP from your bullets. Always apply your own judgement on what is truly urgent and what must reach the founder, AI does not know your client.",
  pre_flight:
    "Before touching the inbox, define what 'done' means for this client: what does inbox zero look like, which emails should never reach the founder, and what are your triage categories? Decide the system before you process a single message.",
  common_mistakes: [
    "Treating every email as equally urgent",
    "Archiving things you will need without a label to find them",
    "Sending a canned response verbatim so it reads robotic",
    "Scheduling without confirming the time zone",
    "Stacking meetings with no buffer between them",
  ],
  debug_help:
    "If the inbox keeps refilling to chaos, your filters are doing too little, automate the repetitive sorting (newsletters, receipts, notifications) so only real decisions land in the main view. If you keep getting scheduling wrong, you are probably omitting the time zone, put it on every single time. If meetings overrun and cascade, you did not leave buffers. The goal is fewer items needing a human, not faster human sorting.",
  stretch: [
    "Build a full email SOP a future assistant could follow",
    "Set up snooze and follow-up reminders so nothing is dropped",
    "Create a VIP filter that flags the founder's most important senders",
  ],
  resources: [
    { label: "Gmail Help: filters and labels", url: "https://support.google.com/mail/", note: "Free, official" },
    { label: "Calendly Help Center", url: "https://help.calendly.com/", note: "Free, scheduling setup" },
  ],
};
