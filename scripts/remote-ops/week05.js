/* Week 5 - AI-powered virtual assistant (Phase: AI Operations) */
module.exports = {
  number: 5,
  title: "AI-powered virtual assistant",
  phase: "AI Operations",
  commitment_hours: "6, 10",
  context:
    "AI is the force multiplier that lets one operator do the work of three, if you know how to direct it. The operators getting hired right now are not the ones who fear AI or the ones who blindly trust it; they are the ones who make AI do the repetitive work while they keep the judgement. This week you build AI into your daily operation: drafting, summarising, research acceleration, reporting, and light automation.\n\n" +
    "You will build an AI-assisted operations system for Kola: a documented prompt library you reuse every day, and a worked example of a workflow that went from hours to minutes. By Friday you can take a recurring task and make AI do the heavy lifting while you check and own the result.\n\n" +
    "The meta-skill this week is judgement: knowing when to trust AI, when to verify, and when a human must stay fully in the loop (anything touching money, legal commitments, or a client's voice on something sensitive).",
  concept_check: [
    {
      q: "You ask AI 'write an email to a customer' and get a generic, robotic result. What is usually the real problem?",
      choices: [
        "AI is just bad at email",
        "The prompt lacked context: who you are, who it is for, the goal, the tone, and the key facts",
        "You need a paid AI plan",
        "Email cannot be written by AI",
      ],
      correct: 1,
      explain: "Vague prompts produce vague output. A good prompt supplies role, context, the exact task, the format, and an example. Fix the prompt, not the result, by hand.",
    },
    {
      q: "AI drafts a customer refund reply that quotes a policy. Before sending, what must you do?",
      choices: [
        "Send it immediately to save time",
        "Read it, check the policy and facts are correct, and adjust the tone, you own the message, not the AI",
        "Trust it because AI is precise",
        "Forward it to the customer and ask them to verify",
      ],
      correct: 1,
      explain: "Always read and own AI output, especially anything touching money or commitments. A client can tell generic AI text, and 'the AI wrote it' is never a defence for an error.",
    },
    {
      q: "Which task is the BEST candidate to hand to AI?",
      choices: [
        "Deciding whether to fire a supplier",
        "Summarising a long email thread into the key decision and action items",
        "Comforting an upset long-term customer about a personal issue",
        "Approving a large payment",
      ],
      correct: 1,
      explain: "AI shines at repetitive, rule-based, language-heavy tasks like summarising. Judgement calls, relationships, money, and sensitive matters stay human.",
    },
  ],
  days: [
    {
      number: 0,
      title: "What AI does for an operator, and write your first real prompt",
      summary: "Set up your AI tools and learn the anatomy of a prompt that actually works.",
      items: [
        {
          kind: "lesson",
          title: "AI is leverage, not a replacement",
          body:
            "## The operator's edge\n" +
            "Picture two assistants. One spends an hour writing a monthly report from scratch. The other feeds the raw numbers to AI, gets a solid draft in two minutes, then spends fifteen minutes making it accurate and human. Same quality output, a quarter of the time, and the second assistant just did three other things with the hours saved. That is the edge, and it is available to you this week.\n\n" +
            "## What AI is genuinely good at\n" +
            "Repetitive, language-heavy, rule-ish work: drafting and editing, summarising long text, restructuring information, brainstorming, converting formats, first-pass research. These are a huge slice of an operator's day.\n\n" +
            "## What AI is bad at (keep these human)\n" +
            "Judgement under uncertainty, relationships, anything sensitive or emotional, final decisions about money or commitments, and being correct about facts (it invents them). Your value is precisely the judgement AI lacks.\n\n" +
            "## The model you keep\n" +
            "Think of AI as a fast, tireless intern: brilliant at first drafts, eager, and occasionally confidently wrong. You direct it, check it, and put your name on the result. Used that way, it multiplies you. Used blindly, it embarrasses you. This week is about using it the first way.\n\n" +
            "## This week's destination\n" +
            "A documented prompt library you actually reuse, and one worked automation that shows real time saved. That library is portfolio artefact number five, proof you can run a modern, AI-leveraged operation.",
        },
        {
          kind: "video",
          title: "Prompt Engineering Tutorial - Master ChatGPT and LLM Responses",
          url: "https://www.youtube.com/watch?v=_ZvnD73m40o",
          duration_min: 41,
          creator: "freeCodeCamp.org",
          difficulty: "beginner",
          why: "freeCodeCamp is a top free education channel. This is a thorough grounding in how to write prompts that get reliable results. It is long, so watch the first ~15 minutes for the core ideas, then return for depth. Then practise on real operator tasks below.",
        },
        {
          kind: "lesson",
          title: "The anatomy of a prompt, step by step",
          body:
            "## Set up your tools\n" +
            "Create a free account on at least one of ChatGPT (chat.openai.com) and Claude (claude.ai). Both have capable free tiers. Keep one open in a pinned tab, it becomes part of your workflow, not a place you visit occasionally.\n\n" +
            "## The four parts of a strong prompt\n" +
            "A weak prompt is 'write an email about the delay'. A strong prompt has four parts:\n" +
            "1. **Role:** who the AI should be. \"You are an experienced executive assistant.\"\n" +
            "2. **Context:** the situation and key facts. \"A customer's order is 5 days late due to a courier delay; it will arrive Thursday; we are an e-commerce brand called Kola.\"\n" +
            "3. **Task:** exactly what you want. \"Write a short, warm apology email that acknowledges the frustration, gives the new date, and offers free shipping on their next order.\"\n" +
            "4. **Format:** how the output should look. \"Under 120 words, friendly but professional, no corporate jargon.\"\n\n" +
            "## See the difference\n" +
            "Run both in your AI tool: first 'write an apology email', then the full four-part version. The second produces something you could almost send. The gap between them is the entire skill of prompting.\n\n" +
            "## Add an example for even better results\n" +
            "If you have a sample of the tone you want, paste it: \"Match the tone of this example: [paste].\" Showing beats telling. Now refine: if the first output is not right, do not start over, tell the AI what to change (\"make it warmer\", \"shorten by half\", \"remove the apology at the end\"). Iterating on the prompt is how pros work.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "A strong prompt usually includes a role, the context and facts, the exact task, and the desired format.",
              answer: true,
              whenRight: "Yes. Role, context, task, format is the reliable recipe. Each part you add makes the output sharper and more usable.",
              whenWrong: "It does. The four parts (role, context, task, format) are what turn a generic answer into one you could almost send as-is.",
            },
            {
              prompt: "If the first AI output is not quite right, you should start over with a brand-new prompt.",
              answer: false,
              whenRight: "Correct. Iterate instead: tell it what to change ('shorter', 'warmer', 'drop the last line'). Refining the conversation is faster and how pros work.",
              whenWrong: "No need to restart. Just tell the AI what to fix. Iterating on the existing draft is faster than re-prompting from scratch.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Your turn, write a four-part prompt",
          body:
            "- [ ] Create a free ChatGPT and/or Claude account\n" +
            "- [ ] Run a weak prompt ('write an apology email') and save the result\n" +
            "- [ ] Run a full four-part prompt (role, context, task, format) for the same email and save the result\n" +
            "- [ ] Iterate once on the good version (ask for one specific change) and save that too\n\n" +
            "Deliverable: the weak output, the four-part output, and the iterated output, with a sentence on what improved.",
        },
      ],
    },
    {
      number: 1,
      title: "Prompt engineering fundamentals",
      summary: "Reliable techniques that work across every AI tool and task.",
      items: [
        {
          kind: "lesson",
          title: "Techniques that consistently work",
          body:
            "## Beyond the four parts\n" +
            "Once you have role-context-task-format down, a few techniques sharpen results further:\n\n" +
            "- **Give an example (few-shot).** Show one or two examples of input-and-desired-output. AI pattern-matches; examples beat description. \"Here are two captions I like: [...]. Write three more in that style.\"\n" +
            "- **Ask for a specific structure.** \"Reply with: 1) a one-line summary, 2) three bullet risks, 3) a recommendation.\" Structured asks get structured, usable answers.\n" +
            "- **Let it think for hard tasks.** For anything reasoning-heavy, add \"think step by step\" or \"first outline your approach, then do it.\" It noticeably improves quality on complex tasks.\n" +
            "- **Constrain it.** \"Use only the information I gave you. If something is missing, ask me rather than guessing.\" This reduces invented facts.\n" +
            "- **Assign a perspective.** \"Critique this email as a skeptical client would.\" Role-playing surfaces blind spots.\n\n" +
            "## Iterate like a conversation\n" +
            "Treat it as a dialogue, not a vending machine. Your second and third messages (\"more concise\", \"add a line about the discount\", \"that is too formal\") are where the real quality comes from. The people who get great output are not luckier; they refine.\n\n" +
            "## When output is bad, debug the prompt\n" +
            "Bad output is almost always a prompt problem. Before blaming the tool, ask: did I give enough context? Was the task specific? Did I show the format I wanted? Nine times out of ten, adding the missing piece fixes it, and you learn a sharper prompt for next time.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Showing AI one or two examples of what you want (few-shot) usually beats only describing it.",
              answer: true,
              whenRight: "Yes. AI pattern-matches, so concrete examples of input and desired output produce closer results than description alone.",
              whenWrong: "Examples win. AI learns the pattern from your samples, so 'here are two I like, do more like this' beats a long description.",
            },
            {
              prompt: "Telling AI 'use only the information I gave you, and ask if something is missing' helps reduce invented facts.",
              answer: true,
              whenRight: "Yes. Constraining it to your provided information and inviting it to ask instead of guess cuts down on confident fabrication.",
              whenWrong: "It does help. That constraint discourages the model from filling gaps with made-up facts and nudges it to ask you instead.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Practise the techniques",
          body:
            "Pick one real operator task (e.g. drafting three social captions for Kola, or summarising a long supplier email).\n" +
            "1. Use a few-shot prompt (give an example) and save the result.\n" +
            "2. Ask for a specific output structure and save the result.\n" +
            "3. Add a constraint ('only use what I gave you; ask if unclear') and note the difference.\n\n" +
            "Deliverable: the three prompts and outputs, with one line on which technique helped most.",
        },
      ],
    },
    {
      number: 2,
      title: "AI for communication",
      summary: "Draft, edit, and adapt messages faster while keeping your voice.",
      items: [
        {
          kind: "lesson",
          title: "Your daily writing co-pilot",
          body:
            "## The biggest daily win\n" +
            "Communication is most of an operator's day (Week 1), and AI is a superb writing co-pilot, if you stay the author. The goal is to write faster and clearer, not to sound like a robot.\n\n" +
            "## High-value uses\n" +
            "- **Improve a draft.** Write your rough version, then: \"Make this clearer and more concise without changing the meaning, and tell me what you cut.\" You stay in control and learn from the edits.\n" +
            "- **Adjust tone.** \"Make this warmer\", \"make this more direct\", \"this needs to be firmer but still polite.\" Great for hard conversations.\n" +
            "- **Adapt one message to many formats.** Turn an announcement into an email, a WhatsApp message, and a social post in one go.\n" +
            "- **Catch the blind spot.** \"What might a busy founder misread in this message?\" surfaces ambiguity before you send.\n" +
            "- **Reply in another language or fix a non-native draft** while keeping it natural.\n\n" +
            "## Keep your voice\n" +
            "The danger is everything starting to sound the same, generic AI politeness. Two defences: feed it your own examples so it matches your voice, and always do a final human pass to add a specific, real detail (a name, a fact, a warm line). The best use of AI on communication is to sharpen your voice, not replace it.\n\n" +
            "## What to never outsource blindly\n" +
            "Sensitive, emotional, or relationship-defining messages (a serious apology, firing a supplier, a delicate negotiation) should be human-led. Use AI to pressure-test your wording, but you write these. The client hired a person for exactly these moments.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "The best use of AI on communication is to write everything for you so it all sounds polished and uniform.",
              answer: false,
              whenRight: "Correct. Uniform AI politeness is a weakness, clients notice it. Use AI to sharpen YOUR voice and always add a real human detail.",
              whenWrong: "Uniform is the risk, not the goal. AI should accelerate and sharpen your writing, with a human pass that keeps it specific and in your voice.",
            },
            {
              prompt: "A serious apology or a delicate negotiation should be human-led, with AI only used to pressure-test wording.",
              answer: true,
              whenRight: "Yes. Relationship-defining messages are exactly what a client hired a person for. Let AI critique, but you write these.",
              whenWrong: "Human-led is right. For sensitive, high-stakes messages, you write them; AI can stress-test the wording, but it should not author them.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "AI as writing co-pilot",
          body:
            "1. Take a rough email draft and ask AI to make it clearer and more concise without changing the meaning; note what it cut.\n" +
            "2. Take one message and adapt it into three formats (email, WhatsApp, social post).\n" +
            "3. Ask AI 'what could a busy founder misread here?' on a real message and fix any ambiguity.\n\n" +
            "Deliverable: the before/after email, the three formats, and the misread-check result.",
        },
      ],
    },
    {
      number: 3,
      title: "AI for research and summarising",
      summary: "Compress long information into decisions, fast, then verify.",
      items: [
        {
          kind: "lesson",
          title: "Turning walls of text into action",
          body:
            "## The summarising superpower\n" +
            "Operators drown in long inputs: 40-message email threads, multi-page documents, meeting transcripts, supplier contracts. AI reads them in seconds and pulls out what matters, if you ask well.\n\n" +
            "## High-value uses\n" +
            "- **Thread to decision.** Paste a long email thread: \"Summarise this into the decision that was made and the action items, with who owns each.\" A 30-message chain becomes three lines.\n" +
            "- **Document to key points.** \"Give me the five most important points in this document for a small business owner, and flag anything that looks risky.\"\n" +
            "- **Meeting notes from a transcript.** Paste a transcript: \"Produce decisions made and action items as '[owner] will [task] by [date]'.\" (This is the Week 1 meeting-notes habit, automated.)\n" +
            "- **Compare options.** Paste two supplier quotes: \"Compare these on price, terms, and delivery in a table.\"\n\n" +
            "## The verification rule (non-negotiable)\n" +
            "AI summaries can subtly distort or invent. For anything that matters, spot-check the summary against the source, especially numbers, names, and commitments. If AI says 'the supplier agreed to a 10% discount', confirm that is actually in the thread before you act on it. The summary saves you reading time, not thinking time.\n\n" +
            "## Sourced research tools\n" +
            "For research questions, tools like Perplexity answer with citations, which makes them better than a plain chatbot for facts, you can click through to verify. Still verify; cited does not always mean correctly cited. Use AI to find and compress, then confirm before it reaches the founder.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "An AI summary of a contract or thread can be sent on without checking, because AI reads carefully.",
              answer: false,
              whenRight: "Correct. AI summaries can distort or invent, especially numbers and commitments. Spot-check against the source before acting.",
              whenWrong: "Always verify. Summaries save reading time, not thinking time. Check key facts (numbers, names, promises) against the original.",
            },
            {
              prompt: "Asking AI to turn a meeting transcript into '[owner] will [task] by [date]' action items is a strong, legitimate use.",
              answer: true,
              whenRight: "Yes. That automates the Week 1 meeting-notes habit. Just verify the actions match what was actually agreed before sending.",
              whenWrong: "It is a great use. Converting a transcript into clear owned action items is exactly what AI is good at, verify, then send.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Summarise and verify",
          body:
            "1. Paste a long email thread (real or invented, 15+ messages) and have AI extract the decision and action items; then verify against the thread.\n" +
            "2. Paste a long article or document and ask for the five key points plus any risks; spot-check two points.\n" +
            "3. Note one place the AI summary drifted or could have misled.\n\n" +
            "Deliverable: the two summaries, your verification notes, and the drift you caught.",
        },
      ],
    },
    {
      number: 4,
      title: "AI-assisted reporting",
      summary: "Turn raw numbers and notes into a clean report a founder reads in a minute.",
      items: [
        {
          kind: "lesson",
          title: "From raw data to a readable report",
          body:
            "## The monthly-report grind, solved\n" +
            "Founders want regular reports (sales, support, social, operations) but writing them is tedious. AI turns your raw inputs into a clean draft in minutes.\n\n" +
            "## How to do it well\n" +
            "1. **Gather the raw inputs.** Numbers, notes, a list of what happened. AI cannot report on what you do not give it.\n" +
            "2. **Prompt with structure and audience.** \"You are an operations assistant. Turn these numbers into a one-page monthly report for a busy small-business owner. Structure: a headline summary, key wins, key issues, and one recommendation. Plain language, no jargon. Here is the data: [...]\"\n" +
            "3. **Demand BLUF.** Ask for the headline takeaway first (Week 1 again). The founder should grasp the month in the first two lines.\n" +
            "4. **Verify every number.** This is critical: AI can transcribe or calculate numbers wrong. Check each figure against your source data before sending. A report with a wrong number destroys trust faster than no report.\n\n" +
            "## Make it a repeatable system\n" +
            "Save the prompt as a template. Each month you paste in fresh numbers and get a consistent report in minutes. Consistency (the report always looks the same and lands the same way) is what makes a founder rely on it.\n\n" +
            "## Charts and tables\n" +
            "AI can suggest how to present data (which simple chart, what to put in a table) even if you build the visual in Sheets. \"What is the clearest way to show these three months of sales?\" is a useful question. Keep visuals simple, one clear point each.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "When AI drafts a report from your numbers, you must verify every figure before sending.",
              answer: true,
              whenRight: "Yes. AI can miscalculate or mis-transcribe numbers. One wrong figure destroys trust, so check each against your source data.",
              whenWrong: "You must. Numbers are where AI errors are most damaging in a report. Verify every figure against the source before it goes out.",
            },
            {
              prompt: "Saving your report prompt as a template makes monthly reporting faster and more consistent.",
              answer: true,
              whenRight: "Yes. Paste fresh numbers into the same prompt each month and get a consistent report in minutes. Consistency builds the founder's trust.",
              whenWrong: "It does. A reusable prompt turns reporting into a quick, repeatable system that produces the same clean format every time.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Build an AI-assisted report",
          body:
            "1. Invent a month of raw data for Kola (sales total, orders, top product, support tickets, social growth).\n" +
            "2. Write a structured prompt and have AI produce a one-page monthly report (headline, wins, issues, one recommendation).\n" +
            "3. Verify every number against your data and correct any errors.\n" +
            "4. Save the prompt as a reusable Monthly Report template.\n\n" +
            "Deliverable: the report, your number-verification note, and the saved prompt template.",
        },
      ],
    },
    {
      number: 5,
      title: "Build your prompt library",
      summary: "Turn your best prompts into reusable assets you run every day.",
      items: [
        {
          kind: "lesson",
          title: "A prompt library is leverage you keep",
          body:
            "## Why a library\n" +
            "Just like email templates (Week 1), your best prompts are assets worth saving. Re-inventing a good prompt each time is slow; a library means you paste a proven prompt, fill the blanks, and get a reliable result in seconds. This is what makes AI-leveraged operators fast and consistent.\n\n" +
            "## What goes in it\n" +
            "Build a doc (or Notion page) of your go-to prompts, each with a title and `[brackets]` for the variable parts:\n" +
            "- Draft/improve an email (with role, context, task, format baked in)\n" +
            "- Summarise a thread into decision + actions\n" +
            "- Turn a transcript into meeting notes\n" +
            "- Draft a monthly report from numbers\n" +
            "- Generate social captions in the brand voice\n" +
            "- Brainstorm options / pros and cons for a decision\n" +
            "- Compare two options in a table\n" +
            "- Critique my draft as a skeptical client\n\n" +
            "## Make them client-aware\n" +
            "The strongest prompts carry your client's context. A 'house style' prompt (\"Always write in Kola's voice: warm, plain, a little playful; we sell handmade West African goods; never use corporate jargon\") pasted at the start of a session makes everything on-brand. Save one of these per client.\n\n" +
            "## The library compounds\n" +
            "Every time you craft a great prompt, add it. Within a few weeks you have a personal system that lets you handle in minutes what takes others hours, and you can show it to a future client as proof you run a modern operation. That library is the core of this week's portfolio piece.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "Saving your best prompts in a reusable library is the AI equivalent of keeping email templates.",
              answer: true,
              whenRight: "Yes. A prompt library means you paste a proven prompt and fill the blanks, fast and consistent, instead of reinventing it each time.",
              whenWrong: "It is exactly that. Reusable prompts are assets, just like templates, that make you quick and consistent on recurring AI tasks.",
            },
            {
              prompt: "A 'house style' prompt with your client's voice and facts makes AI output more on-brand.",
              answer: true,
              whenRight: "Yes. Pasting the client's voice and context at the start of a session keeps everything consistent and on-brand. Save one per client.",
              whenWrong: "It does. Giving AI the client's voice and key facts up front means its drafts come out sounding like the client, not generic.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Build your prompt library",
          body:
            "Create a Prompt Library doc with at least eight reusable prompts (use `[brackets]` for variables): email draft/improve, thread summary, meeting notes, monthly report, social captions, options/pros-cons, compare-in-a-table, and a 'house style' prompt for Kola.\n" +
            "Test three of them on real tasks and tweak based on results.\n\n" +
            "Deliverable: the Prompt Library doc with at least eight prompts, three of them tested.",
        },
      ],
    },
    {
      number: 6,
      title: "Light automation and AI's limits",
      summary: "Chain steps to save real time, and know exactly where AI must not go alone.",
      items: [
        {
          kind: "lesson",
          title: "Automate the repetitive, guard the rest",
          body:
            "## Light automation\n" +
            "You do not need to be a developer to automate. Two accessible levels:\n" +
            "- **Manual chains:** a documented sequence where AI does the heavy step. Example: paste raw numbers into your report prompt, AI drafts, you verify, you send. It is 'manual automation', a repeatable workflow that collapses a long task.\n" +
            "- **No-code tools (Zapier, Make):** these connect apps so steps trigger automatically (e.g. a new form response creates a task, or an email gets auto-summarised). You will go deeper into these in the Automation-adjacent work later; for now, know they exist and that adding AI to them is powerful.\n\n" +
            "## Measure the saving\n" +
            "An automation is only worth it if it saves real time. Time a task before and after adding AI. \"The monthly report went from 90 minutes to 20\" is a concrete, sellable result, and exactly the kind of thing that goes in your portfolio and your pitch.\n\n" +
            "## AI's hard limits (memorise these)\n" +
            "- **Hallucination:** it invents facts, sources, and details confidently. Verify anything factual.\n" +
            "- **Privacy:** do not paste confidential client data (customer personal info, financials, passwords) into AI tools without checking the client is okay with it and the tool's data policy. When unsure, anonymise or do not paste.\n" +
            "- **No real judgement:** it does not understand consequences. It will happily draft a message that damages a relationship. The judgement is yours.\n" +
            "- **It is confidently wrong:** the dangerous part is the confidence. A wrong answer looks exactly like a right one.\n\n" +
            "## The standing rule\n" +
            "Use AI to go faster on the work, then read, verify, and own every output. Money, legal commitments, confidential data, and sensitive relationships always keep a human firmly in the loop.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "It is fine to paste a client's confidential customer data into any AI tool to save time.",
              answer: false,
              whenRight: "Correct. Check the client's wishes and the tool's data policy first; when unsure, anonymise or do not paste. Privacy is a hard line.",
              whenWrong: "No. Confidential data needs care: confirm it is allowed and the tool's policy is acceptable, or anonymise. Convenience does not override privacy.",
            },
            {
              prompt: "Timing a task before and after adding AI gives you a concrete, sellable result.",
              answer: true,
              whenRight: "Yes. '90 minutes to 20' is exactly the kind of measurable win that belongs in your portfolio and your pitch to clients.",
              whenWrong: "It does. A measured time saving is concrete proof of value, far more persuasive than 'I use AI'. Always measure the before and after.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Automate one task and measure it",
          body:
            "1. Pick one recurring task you do (report, summary, caption set, email batch).\n" +
            "2. Time how long it takes the manual way.\n" +
            "3. Design an AI-assisted workflow for it (prompt + your verification step) and time the new way.\n" +
            "4. Write the before/after time and list two of AI's limits you stayed alert to.\n\n" +
            "Deliverable: the documented workflow with before/after times and the limits noted.",
        },
      ],
    },
    {
      number: 7,
      title: "Ship: your AI-assisted operations system",
      summary: "Package your prompt library and a worked automation. Portfolio artefact #5.",
      items: [
        {
          kind: "lesson",
          title: "Proof you run a modern operation",
          body:
            "## The week's deliverable\n" +
            "Today you package an AI-assisted operations system for Kola: your prompt library (10+ reusable prompts) plus a worked example of one workflow that went from hours to minutes, with the before/after time shown. This is portfolio artefact number five.\n\n" +
            "## Why this is worth a lot\n" +
            "Most assistants either ignore AI or use it carelessly. An operator who can show a documented, judgement-guarded AI system, prompts that produce reliable output, a measured time saving, and clear rules about what stays human, is exactly who founders want in the current market. You are not just 'someone who uses ChatGPT'; you are someone who has built a system that makes the whole operation faster without sacrificing quality or trust.\n\n" +
            "## The standard\n" +
            "Your system should pass three tests: the prompts produce genuinely usable output (not generic mush), the workflow shows a real measured saving, and the documentation states clearly where a human must stay in the loop. That combination, speed with judgement, is the whole point of this week.",
        },
        {
          kind: "swipe",
          title: "Quick check, swipe to answer",
          cards: [
            {
              prompt: "What makes an AI operations system valuable to a founder is speed combined with clear judgement about what stays human.",
              answer: true,
              whenRight: "Yes. Speed alone is risky; judgement alone is slow. The combination, fast AND safe, is exactly what founders want now.",
              whenWrong: "It is the combination. A system that is fast but reckless is dangerous; the value is speed WITH clear human-in-the-loop rules.",
            },
            {
              prompt: "Showing a measured time saving ('90 to 20 minutes') is stronger portfolio proof than just saying 'I use AI'.",
              answer: true,
              whenRight: "Yes. A concrete, measured result is persuasive and specific; 'I use AI' is a claim anyone can make. Measure and show it.",
              whenWrong: "Measured wins. Founders trust numbers. A documented before/after time is far more convincing than a vague claim of AI fluency.",
            },
          ],
        },
        {
          kind: "exercise",
          title: "Final build: the AI operations system",
          body:
            "This is the Week 5 portfolio deliverable. Assemble:\n" +
            "1. **A documented prompt library** of at least 10 reusable, tested prompts (with a Kola house-style prompt).\n" +
            "2. **One worked automation/workflow** for a recurring task, showing the before/after time saved and your verification step.\n" +
            "3. **A short 'guardrails' note** stating what you always verify and what stays fully human (money, legal, confidential data, sensitive relationships).\n\n" +
            "Export it as a PDF named `AI-Operations-System-YourName.pdf`. This is portfolio artefact #5.",
        },
      ],
    },
  ],
  topics: [
    "AI as leverage: strengths and hard limits",
    "Prompt anatomy: role, context, task, format",
    "Prompt techniques: few-shot, structure, constraints",
    "AI for drafting, editing, and adapting communication",
    "AI for summarising and research (with verification)",
    "AI-assisted reporting from raw data",
    "Building a reusable prompt library",
    "Light automation, hallucination, privacy, and judgement",
  ],
  tasks: [
    "Set up ChatGPT and/or Claude and write four-part prompts",
    "Practise few-shot, structured, and constrained prompts",
    "Use AI to improve drafts and adapt messages to formats",
    "Summarise threads and documents, then verify",
    "Build an AI-assisted monthly report and verify every number",
    "Build a reusable prompt library (10+ prompts)",
    "Automate one task and measure the time saved",
  ],
  project:
    "Build an AI-assisted operations system for Kola: a documented prompt library of 10+ reusable, tested prompts (including a house-style prompt), one worked automation showing real before/after time saved, and a guardrails note on what stays human. Portfolio artefact #5.",
  exercises: [
    "Compare a weak prompt with a four-part prompt and iterate once",
    "Use few-shot, structured, and constrained prompting on real tasks",
    "Improve a draft and adapt one message into three formats with AI",
    "Summarise a long thread into decisions and actions, then verify",
    "Build an AI-assisted report and verify every figure",
  ],
  questions: [
    "What are the parts of a prompt that reliably get good output?",
    "Where does AI help most in an operator's day, and where is it dangerous?",
    "How do you keep AI output accurate and on-brand?",
  ],
  outputs: [
    "A documented prompt library (10+ prompts)",
    "A before/after automated workflow example",
    "An AI-assisted report with verified numbers",
    "A guardrails note on human-in-the-loop limits",
  ],
  mastery_questions: [
    "Write a four-part prompt (role, context, task, format) and show the improvement over a weak one",
    "Use a few-shot prompt with an example to get on-style output",
    "Add a constraint that reduces invented facts and explain why it helps",
    "Use AI to improve a draft and report what it cut",
    "Summarise a long thread into decisions and owned action items, then verify",
    "Build an AI-drafted report and verify every number against the source",
    "Create a reusable prompt with [brackets] for the variable parts",
    "Write a Kola house-style prompt that keeps output on-brand",
    "Measure the time saved on one task before and after adding AI",
    "State what you always verify and what stays fully human",
  ],
  ai_assist:
    "This whole week is AI assist, so the meta-skill is judgement. Build the permanent habit of reading and owning every output. Use AI to accelerate drafting, summarising, reporting, and brainstorming; keep a human firmly in the loop on money, legal commitments, confidential data, and sensitive relationships. Verify every fact, number, and source before it reaches the founder. The tools are powerful; your judgement is the product, and 'the AI said so' is never a defence.",
  pre_flight:
    "Before automating anything, list the tasks you do most often and rank them by how repetitive and rule-based they are, those are your best AI targets. Creative judgement and relationship work stay human. Time your top target now so you can measure the saving at the end of the week.",
  common_mistakes: [
    "Sending AI output without reading it, so errors and generic tone slip through",
    "Vague prompts that produce vague results, then blaming the tool",
    "Pasting confidential client data into tools without checking privacy",
    "Trusting AI 'facts', numbers, and sources without verification",
    "Letting everything sound the same generic AI voice instead of the client's",
  ],
  debug_help:
    "If AI keeps giving mediocre output, the prompt is the problem about 90% of the time, add the missing context: who you are, who it is for, the exact task, the format you want, and an example of good output. Iterate on the prompt instead of fixing the result by hand each time. If output sounds robotic, feed it your own examples and do a human pass. If it states a 'fact' you cannot find a source for, assume it invented it.",
  stretch: [
    "Build a simple no-code automation (Zapier or Make) that uses AI",
    "Create a per-client house-style prompt for two different brand voices",
    "Compare two AI models on the same task and document which wins where",
  ],
  resources: [
    { label: "OpenAI prompt guidance", url: "https://platform.openai.com/docs/guides/prompt-engineering", note: "Free, official" },
    { label: "Perplexity", url: "https://www.perplexity.ai/", note: "Free tier, sourced research" },
    { label: "Anthropic (Claude)", url: "https://claude.ai/", note: "Free tier, strong writing" },
  ],
};
