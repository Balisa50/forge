import fs from "fs";
import path from "path";

function rewriteWeek(slug: string, weekNumber: number, patch: Record<string, unknown>) {
  const filePath = path.join(process.cwd(), "data/roadmaps", `${slug}.json`);
  const roadmap = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const week = roadmap.weeks.find((w: { week?: number; number?: number }) => (w.week ?? w.number) === weekNumber);
  if (!week) throw new Error(`Week ${weekNumber} not found in ${slug}`);
  Object.assign(week, patch);
  fs.writeFileSync(filePath, JSON.stringify(roadmap, null, 2));
  console.log(`✓ ${slug} W${weekNumber} (${week.title}) — fields updated: ${Object.keys(patch).join(", ")}`);
}

// W16: Deploying automation pipelines
rewriteWeek("ai-automation", 16, {
  context: `An automation that only runs on your laptop is not an automation — it is a script. Production automations run on servers, trigger reliably, scale when needed, and continue working when you are not watching. Deployment is where most automation projects fail: the script works locally, the deployment is broken, and nobody notices until a week later when something important was not processed.

The deployment stack for AI automations: a VPS or cloud function to host the code, a process manager (PM2, systemd) to keep it running, a queue (Redis + Celery, or BullMQ) for workloads that need reliable processing at scale, and scheduled triggers (cron, Prefect schedules) for time-based runs.

For most AI automation businesses, the simplest production setup is a $5-10/month VPS running Python scripts with PM2, triggered by webhook or cron. Complexity should only be added when you have proved you need it.`,
  pre_flight: `**Deployment stack (start simple):**

Option A — VPS + PM2 (for persistent scripts):
\`\`\`bash
# On a DigitalOcean $6/month droplet
# Install PM2
npm install -g pm2
# Run your Python automation
pm2 start "python3 automation.py" --name my-automation
pm2 save
pm2 startup  # auto-restart on server reboot
# Monitor
pm2 logs my-automation
pm2 monit
\`\`\`

Option B — Railway (simplest, no server management):
\`\`\`bash
# Push code to GitHub, connect to Railway
# railway.app → New Project → Deploy from GitHub
\`\`\`

Option C — Modal (serverless, pay per execution):
\`\`\`bash
pip install modal
modal run automation.py  # runs in cloud, scales to zero
\`\`\`

**Webhook deployment with FastAPI:**
\`\`\`python
from fastapi import FastAPI, BackgroundTasks
import uvicorn

app = FastAPI()

@app.post("/webhook/process-document")
async def process_document(data: dict, background_tasks: BackgroundTasks):
    background_tasks.add_task(run_automation, data)
    return {"status": "accepted"}  # respond immediately, process async

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
\`\`\`

**Secure environment variables on VPS:**
\`\`\`bash
# Create .env file (never commit this)
echo "ANTHROPIC_API_KEY=sk-ant-..." >> /home/user/.env
echo "OPENAI_API_KEY=sk-..." >> /home/user/.env
# Load in systemd service or PM2 ecosystem file
\`\`\``,
  mastery_questions: [
    "What is the difference between a webhook trigger and a cron trigger? When do you use each for automations?",
    "A Python automation runs fine locally but crashes on the VPS after 2 hours. What are the 3 most common causes?",
    "What is a message queue and why do you need one for high-volume automation processing?",
    "How do you deploy secrets (API keys) to a production server without putting them in your code or git repository?",
    "What is the difference between PM2, systemd, and Supervisor as process managers? When would you choose each?",
  ],
  common_mistakes: [
    "Deploying without a process manager — if your Python script crashes, it stays down until you SSH in and restart it. Always use PM2, systemd, or a platform that manages restarts.",
    "Putting secrets in environment variables in the .env file committed to git — even if you add .env to .gitignore, you may still accidentally commit it. Use a secrets manager or a deployment platform's secret store.",
    "Not setting resource limits — a Python automation that leaks memory will crash the VPS after days. Set ulimits and monitor memory usage.",
    "Deploying to a single server with no failover — for critical automations, run on at least 2 servers or use a platform with automatic failover.",
    "Not testing the production deployment before pointing real traffic to it — always deploy to a staging environment first and run the full end-to-end test before switching over.",
  ],
  debug_help: `**PM2 process keeps restarting?**
\`\`\`bash
# View restart logs
pm2 logs my-automation --lines 100
# View restart count
pm2 info my-automation
# If restarting due to memory: set max memory limit
pm2 start automation.py --max-memory-restart 200M
\`\`\`

**FastAPI webhook not receiving calls?**
\`\`\`bash
# Check it is listening on 0.0.0.0 (not 127.0.0.1)
uvicorn automation:app --host 0.0.0.0 --port 8000
# Check firewall allows the port
sudo ufw allow 8000
# Check with curl from your local machine
curl -X POST http://your-server-ip:8000/webhook/test -H "Content-Type: application/json" -d '{"test": true}'
\`\`\`

**Cron job not running?**
\`\`\`bash
# Check cron syntax
crontab -l
# 0 9 * * 1-5 = 9am Mon-Fri
# Verify the PATH in cron — it is minimal, use absolute paths
0 9 * * 1-5 /usr/bin/python3 /home/user/automation.py >> /home/user/automation.log 2>&1
\`\`\``,
  ai_assist: `**Prompts that work:**
- "I have a Python AI automation that processes 100 documents per day via webhook. Design the minimal production deployment architecture for a $30/month budget."
- "What is the difference between deploying on Railway, Render, and a bare VPS for a Python automation? When does each make sense?"
- "How do I use Modal to deploy a Python function that processes uploaded PDFs with Claude? Show me the modal decorator syntax."
- "Write a systemd service file for a Python automation that should start on boot, restart on failure, and load environment variables from /etc/automation.env."`,
  stretch: [
    "Deploy your research agent from W12 as a production webhook endpoint on a VPS — test it from the public internet with a real request.",
    "Set up a Celery worker with Redis for processing automation tasks from a queue — test with 50 concurrent tasks.",
    "Implement blue-green deployment for your automation: maintain two identical servers, update one at a time, switch traffic only after health checks pass.",
    "Set up Uptime Robot (free) to monitor your automation endpoint and send alerts to Telegram when it goes down.",
  ],
});

// W17: Monitoring, logging, and error handling
rewriteWeek("ai-automation", 17, {
  context: `Production AI automation without monitoring is gambling. LLMs return unexpected outputs. External APIs go down. Files arrive in unexpected formats. Rate limits are hit. Every automation in production will fail in ways you did not anticipate — the question is whether you find out via your monitoring or via an angry client.

Good monitoring for AI automation: structured logging with loguru (every API call logged with inputs, outputs, latency, and token cost), error alerting via Telegram or email (immediate notification when an automation fails), output quality monitoring (sampling and reviewing automation outputs to catch degradation), and cost tracking (token usage and API cost per run, with alerts if costs spike unexpectedly).

This week you build monitoring into your existing automations and practise the discipline of treating log analysis as a regular task, not a reactive one.`,
  pre_flight: `**Structured logging with loguru:**
\`\`\`bash
pip install loguru
\`\`\`

\`\`\`python
from loguru import logger
import sys

# Configure loguru to write structured JSON logs
logger.remove()
logger.add(
    "automation.log",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
    rotation="10 MB",
    retention="30 days",
    level="INFO"
)
logger.add(sys.stderr, level="ERROR")

# Usage
def call_claude(prompt: str) -> str:
    import time
    start = time.time()
    response = client.messages.create(...)
    latency = time.time() - start
    tokens = response.usage.input_tokens + response.usage.output_tokens

    logger.info(
        "claude_call",
        extra={
            "prompt_preview": prompt[:100],
            "latency_ms": int(latency * 1000),
            "tokens": tokens,
            "cost_usd": tokens / 1_000_000 * 0.80  # Haiku pricing
        }
    )
    return response.content[0].text
\`\`\`

**Error alerting via Telegram:**
\`\`\`python
import httpx

def send_alert(message: str):
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    httpx.post(
        f"https://api.telegram.org/bot{token}/sendMessage",
        json={"chat_id": chat_id, "text": f"🚨 Automation Alert:\\n{message}"}
    )

# Use in exception handler
try:
    run_automation()
except Exception as e:
    logger.error(f"Automation failed: {e}")
    send_alert(f"Automation failed: {e}")
    raise
\`\`\``,
  mastery_questions: [
    "What is the difference between a log and a metric? Give 3 examples of each in the context of AI automation monitoring.",
    "An automation runs 1,000 times per day. Your logging shows that 3% of runs produce output that fails the downstream validation. How do you investigate and fix this?",
    "What information should every log entry for an AI API call contain? Why does latency matter for automation monitoring?",
    "How do you detect when an LLM's output quality degrades without manually reviewing every output?",
    "What is the difference between error alerting and on-call escalation? When do you need an on-call rotation for an AI automation?",
  ],
  common_mistakes: [
    "Using print() for logging — print() goes to stdout which may not be captured or stored. Use a proper logging library with rotation, retention, and levels.",
    "Logging everything at INFO level — use DEBUG for verbose development output, INFO for significant events, WARNING for unexpected-but-handled situations, ERROR for failures.",
    "Not logging the input — when an automation fails, you need to know what input caused the failure to reproduce it. Log enough of the input to reproduce the issue.",
    "Not setting log rotation — logs grow unbounded and fill your disk. Rotate at 10MB and retain 30 days maximum.",
    "Alerting on every error — alert fatigue is real. Alert only on errors that require immediate human action. Log non-critical errors for batch review.",
  ],
  debug_help: `**Log files growing too large?**
\`\`\`python
logger.add(
    "automation.log",
    rotation="10 MB",      # rotate when file reaches 10MB
    retention="7 days",    # delete logs older than 7 days
    compression="zip"      # compress rotated logs
)
\`\`\`

**Not sure which automation run failed?**
\`\`\`python
import uuid
# Add a run_id to every log entry
run_id = str(uuid.uuid4())[:8]
logger.bind(run_id=run_id).info("Starting automation run")
# Filter logs by run_id: grep 'run_id=abc123' automation.log
\`\`\`

**Cost tracking across all API calls:**
\`\`\`python
from dataclasses import dataclass, field
from contextlib import contextmanager

@dataclass
class RunStats:
    total_tokens: int = 0
    total_cost_usd: float = 0.0
    api_calls: int = 0

run_stats = RunStats()

def track_api_call(usage):
    run_stats.total_tokens += usage.input_tokens + usage.output_tokens
    run_stats.total_cost_usd += (usage.input_tokens / 1e6 * 0.25) + (usage.output_tokens / 1e6 * 1.25)
    run_stats.api_calls += 1
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Design a monitoring system for a production AI automation that processes 500 documents per day. What metrics would you track, what alerts would you set up, and what does the daily operations review look like?"
- "How do I implement sampling-based output quality monitoring for an AI automation? I can't review every output, but I want to catch degradation."
- "Write a Python decorator that wraps any function, logs its execution time and any exceptions, and sends a Telegram alert if the function fails."
- "What is the difference between monitoring and observability? How does each apply to AI automation systems?"`,
  stretch: [
    "Add comprehensive monitoring to all your automations from previous weeks: structured logging, error alerting, and a daily cost report sent via email.",
    "Build a Grafana dashboard connected to your automation logs — show: API calls per hour, average latency, error rate, and total cost per day.",
    "Implement output sampling: for every 100th automation run, save the input and output to a review queue, then build a simple UI for reviewing samples.",
    "Set up a weekly cost report: query your logs, calculate total tokens and USD cost for the week, and send a summary email every Monday morning.",
  ],
});

// W18: Selling automation services
rewriteWeek("ai-automation", 18, {
  context: `Building automations is only half the business. Selling them is the other half, and it requires a different skill set: identifying the right clients, scoping projects accurately, pricing for value not time, and managing client expectations about AI reliability.

AI automation is a new service category and most businesses do not know what to ask for. Your job as an automation builder is to identify the pain (repetitive, manual, time-consuming processes), translate it into an automation opportunity, demonstrate the ROI, and deliver a working system. The best clients are businesses that are already paying humans to do repetitive work that could be automated.

Pricing AI automation: charge for the outcome (time saved, errors reduced, scale enabled), not for the hours you spent building. A system that saves a business 20 hours per week is worth $1,000-3,000/month in ongoing value — and typically $2,000-10,000 to build. Learn to calculate and present this ROI to clients before discussing price.`,
  pre_flight: `**Discovery call framework (use these questions):**
\`\`\`markdown
## AI Automation Discovery Questions

### Volume and Frequency
1. How often does this task occur? (daily, weekly, X times per day)
2. How many items are processed each time?
3. How long does it take a human to process one item?

### Current Process
4. Walk me through the exact steps — start to finish
5. What are the inputs? (emails, PDFs, spreadsheets, web pages)
6. What are the outputs? (database entries, emails sent, reports generated)
7. What judgment calls does the human make during this process?

### Pain and Stakes
8. What goes wrong when this is done manually?
9. What is the cost of an error?
10. What would you do with the time saved?

### Technical
11. What software does this process touch?
12. Do those systems have APIs?
13. Who owns the data and where is it stored?
\`\`\`

**ROI calculation template:**
\`\`\`
Hours saved per week: [X hours]
Hourly cost of that labour: [$Y/hour]
Weekly value: X × Y = $Z/week

Monthly value: $Z × 4.3 = $[monthly]
Annual value: $Z × 52 = $[annual]

Typical pricing: 3-6 months of monthly value as a one-time build fee
Monthly retainer: 20-30% of monthly value for maintenance and support
\`\`\``,
  mastery_questions: [
    "A prospect says 'we spend 30 hours per week manually processing invoices at $25/hour'. Calculate the ROI of an automation and propose a price.",
    "What are the 3 best industries to sell AI automation to and why? What are the common use cases in each?",
    "How do you scope an AI automation project to avoid scope creep? What should be in a project contract?",
    "A client expects 100% accuracy from the AI automation. How do you set realistic expectations and design the system to handle the accuracy gap?",
    "What is the difference between selling a one-time automation build and a monthly retainer? What does a retainer include?",
  ],
  common_mistakes: [
    "Charging for time instead of value — 'I charge $75/hour' means a client can calculate your worth. 'This system saves you $5,000/month, my fee is $2,500' is value pricing.",
    "Automating the wrong thing first — automate the highest-volume, lowest-judgment task first. Don't start with the complex case that requires the most customisation.",
    "Over-promising accuracy — 95% accuracy sounds great. At 1,000 documents per day, that is 50 errors. Set expectations upfront: 'the automation handles 95%, humans review the 5%'.",
    "Not including maintenance in the contract — the client's data format will change. The external API will break. The model will need prompt updates. Charge for ongoing maintenance.",
    "Building for one client without thinking about productisation — if you build the same automation twice, build it the third time as a product with a monthly subscription.",
  ],
  debug_help: `**Client unhappy with AI accuracy?**
1. Quantify: what is the actual error rate on their data?
2. Categorise: what types of documents or inputs cause errors?
3. Threshold: add confidence scoring and route low-confidence outputs to human review
4. Improve: add more few-shot examples from their actual failing cases
5. Report: show them: 95 handled automatically, 5 flagged for review, 0 missed

**Scope creep during a project?**
Every new request goes through:
1. Is it in the original scope? (reference the contract)
2. If not: here is the change order, here is the price, do you approve?
Never do out-of-scope work without a signed change order.

**Client wants real-time processing but you built batch?**
If real-time was not in the spec, it is a change order.
If it should have been in the spec, this is a scoping lesson for future projects — always ask about latency requirements in discovery.`,
  ai_assist: `**Prompts that work:**
- "Help me write a proposal for an AI automation project. The client: a law firm that spends 40 hours/week reviewing contracts for key clauses. The automation: extract clauses, flag risks, generate summary. Scope the project and propose a price."
- "What are the top 5 objections a client raises about AI automation and how do I address each?"
- "Design a retainer package for an AI automation client: what does monthly support include, what is excluded, and how do I price it?"
- "Help me identify automation opportunities for [industry]. What manual processes are typically ripe for AI automation?"`,
  stretch: [
    "Interview 3 small business owners about their most repetitive manual processes — write up an automation opportunity assessment for each.",
    "Create a one-page case study: pick a hypothetical client in an industry you know, define their pain, design the automation, calculate ROI, and propose a price.",
    "Build a landing page for your AI automation service — clear problem statement, solution description, and a call to book a discovery call.",
    "Apply to 3 freelance platforms (Upwork, Contra, Toptal) with an AI automation profile — treat this as a portfolio and client acquisition exercise.",
  ],
});

// W19: Client project — build a real automation
rewriteWeek("ai-automation", 19, {
  context: `Everything this course has built toward is a real automation that solves a real problem for a real person. This week you deliver it. The client can be a real paying client, a business owner who agreed to a free build in exchange for a case study, a family member's small business, or yourself — the requirement is that the automation must be used by someone other than you and must process real data.

The deliverable is not just code — it is a working production system with documentation, a handoff meeting, and a 30-day support commitment. A system a client cannot understand and maintain is a system they will abandon. Good delivery includes a brief walkthrough of what the automation does, what to do when it fails, and how to adjust the prompts if their process changes.

If you do not have a client yet, use this week to build the automation for a real business problem you have identified — and then find someone to use it.`,
  pre_flight: `**Client project delivery checklist:**

### Pre-Build
- [ ] Discovery completed with full process documentation
- [ ] Test dataset provided by client (real data, anonymised if necessary)
- [ ] Accuracy requirements agreed on: e.g. '95% of items automated, remainder flagged for review'
- [ ] Contract signed with scope, price, and timeline

### Build
- [ ] Development environment using client data (not synthetic data)
- [ ] Test against edge cases from client's actual workflow
- [ ] Error handling for all expected failure modes documented
- [ ] Accuracy measured against a labelled test set

### Deployment
- [ ] Running on production infrastructure (not your laptop)
- [ ] Monitoring and alerting configured
- [ ] Client credentials stored securely (not in code)
- [ ] Runbook documented: how to restart, how to check logs, how to update prompts

### Handoff
- [ ] Video walkthrough recorded (Loom) showing the automation end-to-end
- [ ] Written handoff document: what it does, how it is triggered, what to do if it fails
- [ ] 30-day support commitment: client can contact you if issues arise
- [ ] Case study permission requested`,
  mastery_questions: [
    "Walk me through the automation you built this week: what is the problem, what is the solution, and how does it work technically?",
    "How did you validate that the automation achieves the agreed accuracy? What was your test methodology?",
    "What was the hardest technical challenge in this project and how did you solve it?",
    "What would you do differently if you were starting this project over? What did you learn about scoping or delivery?",
    "What is the business impact? How much time or money does this automation save per week?",
  ],
  common_mistakes: [
    "Delivering code without a working deployment — 'here is the Python script, you run it on your machine' is not a delivered automation. Deliver a running system.",
    "Not documenting the prompts — if a client's data changes and the prompts need updating, they need to be able to find and edit them without calling you.",
    "Not testing with edge cases — testing only with clean, ideal data and then failing on the client's messy real data is the most common delivery failure.",
    "Going silent after delivery — check in at day 3, day 7, and day 30. Proactive follow-up catches issues before they become client dissatisfaction.",
    "Not asking for a case study — after a successful delivery, ask for a written testimonial and permission to share the use case. This is your most valuable marketing asset.",
  ],
  debug_help: `**Automation working in dev but failing in production?**
Checklist:
1. Are all environment variables set on the production server?
2. Are all Python dependencies installed in the production environment?
3. Does the production server have network access to all external APIs?
4. Is the file system access correct (paths, permissions)?
5. Is the timezone correct for cron jobs?

**Client's data has unexpected format?**
This is normal — client data is always messier than the examples they gave you during discovery.
1. Log the specific format that failed
2. Add a handler for the new format
3. Notify the client: 'we found a format variant, I've updated the system to handle it'

**Accuracy lower than expected on production data?**
1. Sample 20 failing cases and manually categorise why they failed
2. Add those cases as few-shot examples in the prompt
3. Re-run the full test set to confirm improvement`,
  ai_assist: `**Prompts that work:**
- "I am delivering an AI automation to a client this week. The automation does [describe]. Help me write the handoff document including: what it does, how it works, what to do when it fails, and how to update the prompts."
- "Review this automation architecture for a [client type] processing [describe]: [paste architecture]. What reliability and maintenance issues should I address before delivery?"
- "What questions should I ask in a 30-day check-in call with an AI automation client? What problems are most likely to have emerged?"
- "Help me write a case study for this client project: the problem was [X], the solution was [Y], the outcome was [Z]. Make it compelling and specific."`,
  stretch: [
    "Get a written testimonial from your client — ask within 48 hours of a successful delivery while the excitement is fresh.",
    "Record a 5-minute Loom walkthrough of the automation in action — this is your demo video for future client proposals.",
    "Write a detailed post-mortem of the project: timeline, challenges, solutions, what you'd do differently — publish it as a blog post.",
    "Use this project as the foundation for a productised service: can the same automation, slightly customised, serve 10 similar businesses? Design the product.",
  ],
});

// W20: Portfolio and what's next
rewriteWeek("ai-automation", 20, {
  context: `You have built real AI automations. Now you make them visible, position yourself in the market, and decide where to go next. The AI automation space moves fast — what is advanced today becomes a commodity in 12 months. Your competitive advantage is not knowing specific tools (tools change), it is the ability to identify automation opportunities, design reliable systems, and deliver them to clients.

Your portfolio must demonstrate three things: breadth (you have automated different types of tasks), depth (at least one complex, multi-step system), and real impact (at least one automation used by a real person for a real purpose). A portfolio without real usage is a portfolio of demos.

The career paths from AI automation: freelance automation builder (sell to businesses directly), automation agency (build a team, serve larger clients), internal automation engineer at a company (specialised role in larger organisations), or product builder (turn your automations into SaaS products).`,
  pre_flight: `**Portfolio structure (build this week):**

Portfolio website (GitHub Pages or Notion):
\`\`\`markdown
# [Your Name] — AI Automation Builder

## What I Build
I build AI-powered automations that handle [specific types of tasks] for [specific types of clients].

## Projects

### Project 1: [Name]
**Problem:** [Client's pain in 1 sentence]
**Solution:** [What the automation does]
**Impact:** [Quantified: X hours saved, Y% error reduction]
**Stack:** [Claude API, n8n, Python, etc.]
[Link to case study or demo]

### Project 2: ...
### Project 3: ...

## Skills
- AI APIs: Anthropic (Claude), OpenAI, Gemini
- Orchestration: n8n, Prefect, LangChain
- Languages: Python
- Deployment: Railway, DigitalOcean, Modal

## Availability
[Are you available for new projects? Contact info]
\`\`\`

**Positioning statement (fill this in):**
"I build AI automations that [specific outcome] for [specific type of client], using [specific approach], in [timeframe]."

Example: "I build AI automations that eliminate manual invoice processing for accounting firms, using Claude and Python, in 2-3 weeks."`,
  mastery_questions: [
    "What is your positioning statement as an AI automation builder? Be specific about the client type, the problem, and the outcome.",
    "Which 3 projects from this course best demonstrate your capabilities? What does each prove about your skills?",
    "Where do you want to be in 12 months: freelance, employed, or building a product? What is the first concrete step toward that goal?",
    "What is the most important technical skill you developed in this course? What skill do you still want to improve?",
    "What types of AI automation problems are you most interested in and best positioned to solve? How does your background give you an edge?",
  ],
  common_mistakes: [
    "Portfolio that shows only technical work without business impact — every project must include: the problem, the automation, and the quantified outcome.",
    "Not having a clear niche — 'I build AI automations for any business' is harder to sell than 'I build AI automations for law firms'. The more specific your niche, the easier the marketing.",
    "Waiting until the portfolio is perfect to share it — publish now, improve later. An imperfect portfolio that exists is infinitely more valuable than a perfect one in draft.",
    "Not continuing to build after the course — the AI automation field evolves weekly. Build something new every month, even if it is small.",
    "Building solo when community accelerates growth — join the n8n Discord, LangChain Discord, Indie Hackers, and AI automation communities. Share your work and get feedback.",
  ],
  debug_help: `**No project to add to portfolio?**
Build a public, open-source automation this week. Pick any use case:
- Scrape job postings and send a daily digest email
- Monitor a competitor's pricing and alert on changes
- Summarise a newsletter and post key points to Slack
- Answer questions about a public knowledge base via Telegram bot

Make it live, write a README, and share it.

**Not sure how to price yourself?**
Research: search Upwork for 'AI automation' 'n8n' 'LangChain'
Look at what top-rated freelancers charge and what projects they do.
Start 30% below market to build reviews, raise prices with each client.

**Struggling to find your first client?**
1. Tell everyone you know what you are building
2. Post one specific automation demo on LinkedIn weekly
3. Offer 1 free automation to a local business in exchange for a case study
4. Answer AI automation questions in relevant subreddits (r/smallbusiness, r/entrepreneur)`,
  ai_assist: `**Prompts that work:**
- "Review my AI automation portfolio: [paste portfolio draft]. What is missing, what is unclear, and what would a potential client want to see that I have not included?"
- "Help me write my positioning statement as an AI automation specialist. My background is [X], I have built automations for [Y type of client], and I am best at [Z]."
- "What are the fastest-growing AI automation niches in 2025? Where should a new automation builder focus to build a strong client base quickly?"
- "I want to productise my invoice processing automation. How do I turn a custom-built client project into a SaaS with a monthly subscription?"`,
  stretch: [
    "Publish your complete portfolio and share it on LinkedIn, relevant Discord servers, and Indie Hackers — track how many people visit in the first week.",
    "Apply to 5 automation-related opportunities: freelance platforms, job boards (for automation engineer roles), or startup job boards. Use your portfolio as the foundation.",
    "Build one more automation this week — something you have never done before, using a tool you have not used yet. Document and add it to your portfolio.",
    "Write a 12-month plan: what skills will you build, what clients will you target, what income level are you aiming for, and what milestones will tell you you're on track?",
  ],
});

console.log("\nAll done — ai-automation W16-W20 applied.");
