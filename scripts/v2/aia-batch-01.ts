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

// W1: What is AI Automation?
rewriteWeek("ai-automation", 1, {
  context: `AI automation is the practice of combining AI models (language models, vision models, classification models) with workflow orchestration to replace or augment repetitive, judgment-heavy tasks that previously required a human. It is not RPA (Robotic Process Automation) — clicking through UIs with a script — though it can include that. It is not just calling an API and displaying the result. AI automation is building systems that can perceive input, reason about it, act on it, and handle the variation that human workers handle.

The economic model is simple: if a task costs $X per hour and takes Y hours per week, and an AI automation can do it for $0.01 per run in 30 seconds, the business case is obvious. Your job as an AI automation builder is to identify those tasks, build the automations reliably, and deliver them to clients or employers as working systems.

This week you map the landscape: what can AI automation do today (document extraction, classification, drafting, research, data transformation), what it cannot do reliably yet (tasks requiring physical world interaction, novel judgment in high-stakes domains), and what the full toolchain looks like from trigger to output.`,
  pre_flight: `**Landscape map — categories of AI automation:**

Data Extraction:
- PDFs, invoices, contracts → structured data
- Tool: Claude/GPT + structured output parsing

Content Generation:
- Templates + data → personalised emails, reports, proposals
- Tool: LLM with prompt templates + variable substitution

Classification and Routing:
- Incoming emails, tickets, documents → category + priority + assignee
- Tool: LLM with structured output or fine-tuned classifier

Research and Summarisation:
- Web pages, documents, databases → synthesised summaries, competitive intel
- Tool: LLM + web scraping + RAG

Process Automation:
- Form submissions, database entries, notifications → multi-step workflows
- Tool: n8n, Make, Zapier + API calls

**Read first:**
- LangChain blog: https://blog.langchain.dev/
- n8n blog: https://n8n.io/blog/

**Set up accounts this week:**
- Anthropic API: https://console.anthropic.com/
- OpenAI API (optional): https://platform.openai.com/
- n8n Cloud (free trial): https://n8n.io/`,
  mastery_questions: [
    "What is the difference between traditional RPA and AI automation? Give a task where RPA works but AI automation is needed.",
    "Name 5 business tasks that are strong candidates for AI automation. For each, explain why AI is better than a traditional script.",
    "What is a workflow trigger? List 4 different types of triggers an automation might use.",
    "Explain the economics of AI automation to a small business owner who has never heard of it.",
    "What are the main failure modes of AI automation systems? How do you build reliability into a system that uses LLMs?",
  ],
  common_mistakes: [
    "Automating the wrong things first — start with tasks that are high-volume, low-variation, and clearly defined. Avoid tasks with high judgment requirements until you have production experience.",
    "Treating LLM output as ground truth without validation — AI automation must include output validation. A model that hallucinates a wrong number in an invoice automation causes real business damage.",
    "Building fragile automations that break on format changes — if your automation parses a specific email format and that format changes, it breaks. Build for variation.",
    "Not considering the error case — every automation must have a fallback: what happens when the LLM returns something unexpected? Log it, alert a human, and don't silently fail.",
    "Overengineering the first version — build the simplest automation that delivers value. Complexity is earned by proved use cases, not anticipated ones.",
  ],
  debug_help: `**Not sure where to start?**
Pick the most repetitive task in a process you know well.
Answer these questions:
1. What is the input? (email, PDF, form, database row)
2. What is the output? (structured data, email draft, database entry, notification)
3. How often does it happen? (hourly, daily, weekly)
4. What variation exists in the input? (low/medium/high)
5. What happens if the automation is wrong? (low/medium/high stakes)

Start with: high frequency + low variation + low stakes.

**Anthropic API key not working?**
\`\`\`bash
export ANTHROPIC_API_KEY="sk-ant-..."
# Test with a simple curl
curl https://api.anthropic.com/v1/messages \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -H "x-api-key: \${ANTHROPIC_API_KEY}" \
  --data '{"model":"claude-3-5-haiku-20241022","max_tokens":100,"messages":[{"role":"user","content":"hello"}]}'
\`\`\``,
  ai_assist: `**Prompts that work:**
- "I work at a [type of business]. We spend [X hours/week] on [describe task]. Design an AI automation that could handle this, including the input, the AI processing step, and the output."
- "What are the top 5 AI automation use cases for [industry]? For each, describe the business problem, the automation approach, and the expected ROI."
- "I want to sell AI automation services. What are the first 3 questions I should ask a potential client to qualify whether their problem is automatable?"
- "What is the difference between a synchronous and asynchronous AI automation pipeline? Give an example of when you'd use each."`,
  stretch: [
    "Interview a business owner or professional about their most repetitive tasks — write up a 1-page automation opportunity assessment.",
    "Map out 10 AI automation use cases in a niche you know well (legal, medical, finance, real estate, e-commerce).",
    "Read the Anthropic API documentation completely: https://docs.anthropic.com/ — understand rate limits, pricing, and available models.",
    "Sign up for n8n Cloud and build your first trivial automation: HTTP trigger → Claude API → return response. Get the end-to-end working.",
  ],
});

// W2: No-code automation with n8n
rewriteWeek("ai-automation", 2, {
  context: `n8n is an open-source workflow automation platform — like Zapier but self-hostable and with a full visual workflow builder. It connects to 400+ services out of the box and lets you write JavaScript in nodes when you need custom logic. For AI automation, n8n is the orchestration layer: it handles the trigger, calls external APIs (including Claude), parses responses, and routes data to the right outputs.

The no-code approach is not a lesser approach — it is faster for many tasks. A workflow that routes incoming Gmail emails based on sentiment, extracts structured data, and adds a row to a Google Sheet should take 20 minutes to build in n8n, not a day in Python. Use the right tool for the complexity of the task.

This week you build 3 complete n8n workflows using Claude: an email classifier that routes support tickets, a document summariser triggered by a webhook, and a daily news digest that pulls from RSS feeds and summarises them.`,
  pre_flight: `**n8n setup (choose one):**

Cloud (easiest — free trial):
https://n8n.io/ → Sign Up → Start Free Trial

Self-hosted (more control):
\`\`\`bash
docker run -it --rm -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
# Open http://localhost:5678
\`\`\`

**Workflow 1 — Email classifier:**
Trigger: Gmail (or webhook to simulate email)
→ HTTP Request: POST to Anthropic API
  Body: "Classify this email as Support/Sales/Spam: [email body]"
→ IF node: branch by classification
→ Gmail: move to folder / add label

**Workflow 2 — Webhook document summariser:**
Trigger: Webhook (POST with {"text": "..."})
→ HTTP Request: Claude API with system prompt: "Summarise in 3 bullet points"
→ Respond to Webhook: return summary

**Anthropic HTTP node config:**
\`\`\`json
{
  "url": "https://api.anthropic.com/v1/messages",
  "method": "POST",
  "headers": {
    "x-api-key": "{{ \$env.ANTHROPIC_API_KEY }}",
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
  },
  "body": {
    "model": "claude-3-5-haiku-20241022",
    "max_tokens": 500,
    "messages": [{"role": "user", "content": "{{ \$json.text }}"}]
  }
}
\`\`\``,
  mastery_questions: [
    "What is the difference between a trigger node and an action node in n8n? Give 3 examples of each.",
    "How do you handle errors in an n8n workflow? What happens to data if a node fails midway through?",
    "Explain how n8n passes data between nodes. What is \$json and \$node in an expression?",
    "You want to process 100 emails in a batch. How do you structure an n8n workflow to process them one at a time without hitting API rate limits?",
    "What is the difference between n8n's Split In Batches node and a regular loop? When would you use each?",
  ],
  common_mistakes: [
    "Not handling rate limits — Claude API has rate limits (requests per minute, tokens per minute). Add a Wait node between batch iterations.",
    "Storing API keys in node configuration instead of environment variables — use n8n credentials or environment variables. Never hardcode keys in workflow nodes.",
    "Not logging intermediate results — when an n8n workflow fails, you need to know which node failed and what data it had. Use Set nodes to capture intermediate state.",
    "Building one huge workflow instead of sub-workflows — n8n supports calling workflows from other workflows. Split complex automations into smaller, testable units.",
    "Not testing with real edge-case data — test with the messiest real emails/documents you have, not clean sample data.",
  ],
  debug_help: `**n8n node not receiving data from previous node?**
- Click the failing node → Input tab — check if data is arriving
- Use the 'Execute Node' button on individual nodes to test in isolation
- Check expression syntax: n8n uses {{ \$json.fieldName }}, not {{ json.fieldName }}

**Anthropic API returning 429 (rate limit)?**
- Add a Wait node: 1-2 seconds between API calls
- Use batch sizes of 5-10 items max per workflow execution
- Check your API tier limits in the Anthropic console

**Webhook not triggering?**
- For local n8n: expose with ngrok: ngrok http 5678
- Check the webhook URL matches exactly (trailing slash matters)
- Set workflow to 'Active' — workflows must be active to receive webhook calls`,
  ai_assist: `**Prompts that work:**
- "I want to build an n8n workflow that monitors a Gmail inbox, classifies each email as [Sales/Support/Spam] using Claude, and moves it to the appropriate Gmail label. Walk me through the node structure."
- "What is the n8n expression syntax for extracting the body from the previous node's output when it is a JSON array?"
- "How do I handle Claude returning malformed JSON in an n8n workflow? What nodes should I add for error handling?"
- "Design an n8n workflow that takes a Typeform submission, sends the answers to Claude for analysis, and posts a summary to a Slack channel."`,
  stretch: [
    "Build an n8n workflow that monitors a Telegram bot for incoming messages, sends them to Claude, and returns the AI response to the chat.",
    "Implement a complete support ticket triage workflow: Gmail → classify (Support/Billing/Technical) → create Notion database entry → send acknowledgement email.",
    "Set up n8n self-hosted on a VPS (DigitalOcean $5 droplet) with persistent storage and environment variables.",
    "Explore n8n's AI Agent node — build a simple ReAct agent that can answer questions using Wikipedia search and basic calculations.",
  ],
});

// W3: Python for automation
rewriteWeek("ai-automation", 3, {
  context: `Python is what you reach for when n8n is not flexible enough. Complex data transformations, custom parsing logic, batch processing at scale, and anything requiring code that reads, writes, or manipulates files is faster and more reliable in Python than in a visual workflow builder.

For AI automation, the Python stack is: httpx or requests for API calls, pydantic for structured output validation, python-dotenv for environment management, schedule or APScheduler for cron-like scheduling, and loguru for structured logging. These five libraries cover 80% of automation scripting tasks.

This week you build automation scripts in Python: a script that monitors a folder for new files and processes them through Claude, a batch email processor, and a data extraction script that reads from a CSV and enriches each row with AI-generated content.`,
  pre_flight: `**Install the automation Python stack:**
\`\`\`bash
pip install anthropic httpx pydantic python-dotenv loguru schedule watchdog
\`\`\`

**Pattern 1 — Structured output extraction:**
\`\`\`python
import anthropic
from pydantic import BaseModel
import json

client = anthropic.Anthropic()

class Invoice(BaseModel):
    vendor: str
    amount: float
    date: str
    invoice_number: str

def extract_invoice(text: str) -> Invoice:
    message = client.messages.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"""Extract invoice details from this text and return as JSON:
{text}

Return ONLY valid JSON matching this schema:
{{"vendor": "string", "amount": number, "date": "YYYY-MM-DD", "invoice_number": "string"}}"""
        }]
    )
    data = json.loads(message.content[0].text)
    return Invoice(**data)
\`\`\`

**Pattern 2 — Folder watcher:**
\`\`\`python
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import time

class NewFileHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            print(f"New file: {event.src_path}")
            process_file(event.src_path)

observer = Observer()
observer.schedule(NewFileHandler(), path='./watch_folder', recursive=False)
observer.start()
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    observer.stop()
\`\`\``,
  mastery_questions: [
    "What is Pydantic and why use it for AI automation output validation instead of just parsing JSON directly?",
    "How do you handle retries when the Anthropic API returns a transient error (500, 529)? Write a retry decorator.",
    "What is the difference between synchronous and asynchronous Python? When would you use asyncio for AI automation?",
    "How do you process 10,000 files through an AI API without hitting rate limits? Describe the batching and throttling approach.",
    "What is the watchdog library and how does it enable event-driven file processing?",
  ],
  common_mistakes: [
    "Not using environment variables for API keys — hardcoding keys in Python scripts means they end up in git. Always use python-dotenv and a .env file.",
    "Not handling JSON parsing errors from LLM output — LLMs sometimes return markdown fences around JSON, extra text, or malformed JSON. Wrap JSON parsing in try/except.",
    "Processing files synchronously when you need speed — if you have 1000 files to process, synchronous processing takes 1000x the per-item time. Use asyncio or concurrent.futures.",
    "Not checkpointing progress in batch jobs — if your script processes 500 of 1000 items and crashes, you want to resume from item 501, not start over. Track processed items in a file or database.",
    "Not logging with context — print() is not logging. Use loguru and log the input, model, latency, and output for every API call.",
  ],
  debug_help: `**Anthropic API key not loading from .env?**
\`\`\`python
from dotenv import load_dotenv
import os

load_dotenv()  # must call before os.getenv()
api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    raise ValueError("ANTHROPIC_API_KEY not set in environment")
\`\`\`

**JSON parsing fails on LLM output?**
\`\`\`python
import json
import re

def extract_json(text: str) -> dict:
    # Remove markdown code fences if present
    text = re.sub(r'\`\`\`json?\s*', '', text)
    text = re.sub(r'\`\`\`\s*', '', text)
    # Find first { and last }
    start = text.find('{')
    end = text.rfind('}') + 1
    return json.loads(text[start:end])
\`\`\`

**Rate limit errors?**
\`\`\`python
import time
from anthropic import RateLimitError

def call_with_retry(client, **kwargs, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.messages.create(**kwargs)
        except RateLimitError:
            wait = 2 ** attempt  # exponential backoff
            time.sleep(wait)
    raise Exception("Max retries exceeded")
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Write a Python script that reads a folder of PDF files, extracts the text using PyPDF2, sends each to Claude for summarisation, and saves the summaries to a JSON file."
- "How do I use asyncio with the Anthropic Python SDK to process 50 files concurrently with a rate limit of 10 requests per second?"
- "Write a Pydantic model for validating Claude's output when extracting contract metadata: parties, effective date, termination date, and key obligations."
- "I want to build a Python script that monitors a Gmail inbox using the Gmail API and processes new emails with Claude. Walk me through the setup."`,
  stretch: [
    "Build a complete Python automation: watch a folder for new CSV files, extract key fields with Claude, validate with Pydantic, and write results to a PostgreSQL database.",
    "Implement exponential backoff with jitter for Anthropic API calls and log every call with loguru to a structured JSON log file.",
    "Use concurrent.futures.ThreadPoolExecutor to process 100 text files through Claude in parallel, with a semaphore limiting concurrent requests to 5.",
    "Write a pytest test suite for your automation script — mock the Anthropic API calls and test the extraction logic independently.",
  ],
});

// W4: Calling AI APIs
rewriteWeek("ai-automation", 4, {
  context: `Every major AI model is available via an API. Anthropic (Claude), OpenAI (GPT-4, o1), Google (Gemini), Mistral, Cohere, Together AI — each has a REST API and a Python SDK. This week you learn to call them effectively: structured outputs, tool use / function calling, streaming, and multi-turn conversations.

Structured outputs are how you make AI automation reliable. Instead of asking the model to "return JSON", you define a schema and force the model to return data that matches it. Claude has tool use / JSON mode; OpenAI has structured outputs. When the model is constrained to a schema, parsing errors drop to near zero.

Tool use (also called function calling) is the mechanism that enables agents: you describe a set of tools the model can call (search the web, query a database, send an email), the model decides which tool to call and with what arguments, your code executes the tool, and you return the result to the model. This loop is the foundation of autonomous AI agents.`,
  pre_flight: `**Anthropic SDK — structured output with tool use:**
\`\`\`python
import anthropic

client = anthropic.Anthropic()

# Define a tool (forces structured output)
tools = [{
    "name": "extract_contact",
    "description": "Extract contact information from text",
    "input_schema": {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "email": {"type": "string"},
            "phone": {"type": "string"},
            "company": {"type": "string"}
        },
        "required": ["name", "email"]
    }
}]

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=500,
    tools=tools,
    tool_choice={"type": "tool", "name": "extract_contact"},
    messages=[{
        "role": "user",
        "content": "Extract: John Smith from Acme Corp, email john@acme.com, tel 555-1234"
    }]
)

# Parse the tool call result
tool_use = next(b for b in response.content if b.type == "tool_use")
contact = tool_use.input
print(contact)  # {'name': 'John Smith', 'email': 'john@acme.com', ...}
\`\`\`

**Streaming responses:**
\`\`\`python
with client.messages.stream(
    model="claude-3-5-haiku-20241022",
    max_tokens=1000,
    messages=[{"role": "user", "content": "Write a long explanation..."}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
\`\`\``,
  mastery_questions: [
    "What is the difference between JSON mode and tool use in Claude? When should you use tool use even for simple extraction tasks?",
    "Explain the tool use loop: how does a model decide to call a tool, and what happens after your code executes it?",
    "What is streaming and why does it matter for user-facing automations? How does it differ from a regular blocking API call?",
    "How do you implement a multi-turn conversation in the Anthropic API? What does the messages array look like after 3 turns?",
    "What is the difference between claude-3-5-haiku, claude-3-5-sonnet, and claude-3-opus? When would you choose each for an automation task?",
  ],
  common_mistakes: [
    "Using the most powerful (and expensive) model for every task — use Haiku for classification and extraction, Sonnet for reasoning, Opus for complex analysis. Cost per token varies 20x.",
    "Not setting max_tokens appropriately — a max_tokens that is too low truncates output. For structured extraction, set it to 2x the expected output size.",
    "Parsing response.content[0].text when tool use returns response.content[0].input — check the content block type before accessing properties.",
    "Not handling tool use stop reason — when the model calls a tool, stop_reason is 'tool_use', not 'end_turn'. Your code must handle both cases.",
    "Building multi-turn conversations without trimming the context — long conversations accumulate tokens and cost. Summarise and trim old turns for long-running automations.",
  ],
  debug_help: `**Tool use input is empty or wrong?**
\`\`\`python
# Print full response for debugging
print(response.model_dump_json(indent=2))
# Check stop_reason
print(response.stop_reason)  # should be 'tool_use'
# Check content blocks
for block in response.content:
    print(block.type, block)
\`\`\`

**Streaming cutting off mid-response?**
\`\`\`python
# Increase max_tokens
# Check you're not hitting a token limit in the stream
# Use stream.get_final_message() after the stream to get full usage stats
with client.messages.stream(...) as stream:
    full_response = stream.get_final_message()
    print(f"Tokens used: {full_response.usage}")
\`\`\`

**API returning 400 on tool_choice?**
\`\`\`python
# 'tool_choice' with type 'tool' requires the tool to exist in tools list
# Check the name matches exactly (case-sensitive)
tool_choice = {"type": "tool", "name": "extract_contact"}  # must match tools[0]["name"]
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Write Anthropic tool use code that extracts the following fields from a job posting: company, role, salary range, location, required skills, and experience level."
- "How do I implement a retry mechanism for Anthropic API calls that handles both rate limits (429) and overload errors (529) with exponential backoff?"
- "Show me how to implement a multi-turn conversation with the Anthropic API where the conversation history is stored in a list and sent with each request."
- "What is the token cost of my prompt? I have a system prompt of [X words] and user messages of average [Y words]. How do I optimise to reduce costs?"`,
  stretch: [
    "Build a tool-use powered invoice extractor: define a tool schema with 10+ fields, test against 20 different invoice formats, measure accuracy.",
    "Implement streaming output in a FastAPI endpoint that proxies Claude responses to a frontend — the frontend shows text as it streams.",
    "Compare claude-3-5-haiku vs claude-3-5-sonnet on the same extraction task: measure accuracy, latency, and cost per 100 documents.",
    "Implement a conversation history manager that summarises old turns when the context exceeds 80,000 tokens.",
  ],
});

// W5: Prompt engineering for automation
rewriteWeek("ai-automation", 5, {
  context: `Prompt engineering for automation is different from prompt engineering for chat. In a chat context, you iterate in real time and adjust. In automation, the prompt runs thousands of times without you watching. A prompt that works 95% of the time has a 5% failure rate — at 1,000 runs per day, that is 50 failures per day.

Reliability is the primary metric for automation prompts. A prompt that extracts data correctly 95% of the time at scale is worse than a prompt that achieves 99.9% — because at scale, 5% failures are operational incidents. This week you learn the techniques that move prompts from "usually works" to "always works": few-shot examples, explicit output constraints, chain-of-thought for complex tasks, and systematic prompt testing.

You also learn to write system prompts that are robust: they define the task, the constraints, the output format, how to handle uncertainty, and what to do when the input is ambiguous or missing required information.`,
  pre_flight: `**Prompt testing framework:**
\`\`\`python
import json
from anthropic import Anthropic
from typing import Callable

client = Anthropic()

def test_prompt(
    system_prompt: str,
    test_cases: list[dict],
    evaluator: Callable,
    model: str = "claude-3-5-haiku-20241022"
) -> dict:
    results = []
    for case in test_cases:
        response = client.messages.create(
            model=model,
            max_tokens=500,
            system=system_prompt,
            messages=[{"role": "user", "content": case["input"]}]
        )
        output = response.content[0].text
        passed = evaluator(output, case["expected"])
        results.append({"input": case["input"], "output": output, "passed": passed})

    pass_rate = sum(r["passed"] for r in results) / len(results)
    return {"pass_rate": pass_rate, "results": results}
\`\`\`

**Prompt components for automation (memorise this structure):**
\`\`\`
# System Prompt Template

## Role
You are an [expert role] that [specific capability].

## Task
[Clear, imperative description of the single task]

## Input
The user will provide [description of input format and variability].

## Output Format
Return ONLY valid JSON matching this exact schema:
[schema]
If you cannot extract a field, use null (not "unknown" or empty string).

## Rules
1. [Constraint 1]
2. [Constraint 2]
3. If the input does not contain [required info], return {"error": "missing [field]"}

## Examples
Input: [example 1]
Output: [expected JSON 1]

Input: [example 2]
Output: [expected JSON 2]
\`\`\``,
  mastery_questions: [
    "What is a few-shot example and why does it improve extraction accuracy more than additional instructions?",
    "You have an extraction prompt that fails on 5% of inputs. Walk me through a systematic process to identify why it fails and fix it.",
    "What is chain-of-thought prompting? When does it help for automation tasks and when does it add unnecessary latency?",
    "How do you instruct a model to return null for a missing field instead of hallucinating a value?",
    "What is temperature in LLM generation and what temperature should you use for extraction and classification tasks?",
  ],
  common_mistakes: [
    "Using high temperature for automation tasks — for extraction and classification, use temperature=0 or 0.1. Randomness is the enemy of reliability.",
    "Asking the model to do multiple things in one prompt — one task per prompt. If you need classification AND extraction, chain two prompts.",
    "Not including few-shot examples for complex extraction — instructions alone are not enough for ambiguous or complex fields. Show the model what correct output looks like.",
    "Not specifying the null case — if a model cannot find a value, it will either hallucinate it or output a string like 'not found'. Explicitly instruct: 'return null if not present'.",
    "Testing only with clean, ideal inputs — your test suite must include edge cases: empty input, partially relevant input, input in a different language, inputs that are ambiguous.",
  ],
  debug_help: `**Prompt producing inconsistent outputs?**
1. Set temperature to 0
2. Add explicit output format instructions with an example
3. Add a constraint: "Return ONLY the JSON object, no other text"
4. Test with 20+ examples and log every failure

**Model hallucinating missing fields?**
\`\`\`
Add to system prompt:
"If a field is not present in the input, set its value to null.
Never infer, guess, or fill in missing information.
Only extract what is explicitly stated."
\`\`\`

**Prompt hitting token limits?**
\`\`\`python
# Measure your system prompt token count
response = client.messages.count_tokens(
    model="claude-3-5-haiku-20241022",
    system=system_prompt,
    messages=[{"role": "user", "content": "test"}]
)
print(f"System prompt tokens: {response.input_tokens}")
\`\`\``,
  ai_assist: `**Prompts that work:**
- "I need a system prompt for an automation that extracts [specific fields] from [input type]. The main challenges are [describe variations]. Write a robust system prompt with 2 few-shot examples."
- "Review this system prompt for reliability issues: [paste prompt]. What would cause it to fail and how do I fix each failure mode?"
- "What is the best prompt structure for classifying customer support emails into [list categories]? Include how to handle emails that fit multiple categories."
- "I want to evaluate my extraction prompt on 50 test cases programmatically. Write a Python evaluator function that checks if the extracted JSON matches the expected output."`,
  stretch: [
    "Build a prompt testing harness: 20 test cases, automated evaluation, pass rate tracking, and failure analysis — run it before every prompt change.",
    "Optimise an extraction prompt by testing 3 different few-shot example sets — measure which example set produces the highest accuracy.",
    "Implement a prompt versioning system: store each prompt version with a timestamp, test results, and change log in a JSON file.",
    "Read Anthropic's prompt engineering guide completely: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
  ],
});

console.log("\nAll done — ai-automation W1-W5 applied.");
