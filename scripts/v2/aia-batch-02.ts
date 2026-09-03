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

// W6: AI agents — what they are and how they work
rewriteWeek("ai-automation", 6, {
  context: `An AI agent is an LLM in a loop. The model receives a task, decides on an action, your code executes that action, the result comes back to the model, and the loop continues until the model decides the task is complete. The key insight: the model is the reasoner, your code is the executor.

The ReAct (Reasoning + Acting) pattern is the foundation of most agent architectures: the model outputs a Thought (what it is trying to do), an Action (which tool to call with which arguments), and after you execute the action, an Observation (the result). This repeats until the model outputs a Final Answer.

Understanding agents at this level — not as magic, but as a specific loop with specific failure modes — is what separates builders who can debug and improve agents from users who can only run pre-built ones.`,
  pre_flight: `**Build a ReAct agent from scratch:**
\`\`\`python
import anthropic
import json

client = anthropic.Anthropic()

# Define tools the agent can use
tools = [
    {
        "name": "web_search",
        "description": "Search the web for current information",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}},
            "required": ["query"]
        }
    },
    {
        "name": "calculate",
        "description": "Perform arithmetic calculations",
        "input_schema": {
            "type": "object",
            "properties": {"expression": {"type": "string"}},
            "required": ["expression"]
        }
    }
]

def run_tool(name: str, args: dict) -> str:
    if name == "calculate":
        return str(eval(args["expression"]))  # safe eval in production
    if name == "web_search":
        return f"[Search results for '{args['query']}': ...]"  # replace with real search
    return "Unknown tool"

def run_agent(task: str, max_iterations: int = 10) -> str:
    messages = [{"role": "user", "content": task}]

    for i in range(max_iterations):
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1000,
            tools=tools,
            messages=messages
        )

        # Add assistant's response to conversation
        messages.append({"role": "assistant", "content": response.content})

        # Check if done
        if response.stop_reason == "end_turn":
            text_blocks = [b for b in response.content if hasattr(b, 'text')]
            return text_blocks[-1].text if text_blocks else "No response"

        # Execute any tool calls
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = run_tool(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result
                })

        if tool_results:
            messages.append({"role": "user", "content": tool_results})

    return "Max iterations reached"

# Test it
print(run_agent("What is 15% of 847 and what day of the week was January 1, 2020?"))
\`\`\``,
  mastery_questions: [
    "Explain the ReAct pattern. What are Thought, Action, and Observation and in what order do they occur?",
    "What is the difference between a tool call and a function call? Are they the same thing in the Anthropic API?",
    "What happens when an agent calls a tool that returns an error? How should you handle it in the agent loop?",
    "Why do agents need a max_iterations limit? What failure mode does this prevent?",
    "What is the difference between an agent and a chain? When is a simple chain sufficient and when do you need an agent?",
  ],
  common_mistakes: [
    "Not limiting tool execution — an agent can call tools in an infinite loop. Always set a max_iterations limit and log how many iterations a task uses.",
    "Giving the agent too many tools — models perform better with fewer, well-defined tools. More than 10 tools in a single agent degrades performance.",
    "Using eval() for calculations without sandboxing — in production, never use eval() on user input. Use a proper math expression parser library.",
    "Not including tool error handling in the agent loop — if a tool raises an exception, the agent should receive an error message, not a crash.",
    "Building an agent for a task that a simple prompt solves — if the task has a fixed set of steps, use a chain, not an agent. Agents add complexity and cost.",
  ],
  debug_help: `**Agent stuck in a loop?**
\`\`\`python
# Add logging to see every iteration
for i in range(max_iterations):
    print(f"\\n--- Iteration {i+1} ---")
    print(f"Messages: {len(messages)}")
    # ... make API call ...
    print(f"Stop reason: {response.stop_reason}")
    for block in response.content:
        print(f"Block type: {block.type}")
        if block.type == "tool_use":
            print(f"Tool: {block.name}, Args: {block.input}")
\`\`\`

**Tool result not parsed by model?**
- Ensure tool_result content is a string (not a dict)
- The tool_use_id must match the id from the tool_use block exactly
- Add validation: print the tool_results list before appending to messages

**Agent using wrong tool for a task?**
- Improve tool descriptions — be specific about when to use each tool
- Add negative examples to descriptions: "Do NOT use this tool for..."
- Reduce the number of similar tools to avoid confusion`,
  ai_assist: `**Prompts that work:**
- "What is the fundamental difference between a language model and a language model agent? Give a concrete example where you need an agent and a simpler approach would fail."
- "Design a tool set for a customer support agent: what tools does it need, and write the tool schema for each in Anthropic's format."
- "What are the failure modes specific to agentic systems? For each, describe a mitigation strategy."
- "Explain how memory works in AI agents. What is the difference between in-context memory and external memory?"`,
  stretch: [
    "Build an agent that can search Wikipedia (using the Wikipedia API), do basic calculations, and answer factual questions — test with 10 different questions and log accuracy.",
    "Add persistent memory to your agent: after each run, save a summary of what the agent learned to a JSON file, and load it as context on the next run.",
    "Implement a human-in-the-loop mechanism: the agent pauses and asks for human approval before any tool call that modifies data (vs. read-only calls).",
    "Read the Anthropic documentation on agentic use: https://docs.anthropic.com/en/docs/build-with-claude/agents",
  ],
});

// W7: Web scraping + AI extraction
rewriteWeek("ai-automation", 7, {
  context: `Web scraping plus AI is more powerful than either alone. Traditional scraping uses CSS selectors or XPath — brittle, breaks when the page changes. AI-powered scraping uses the model to extract structured data from raw HTML or text, making the extraction logic robust to layout changes.

The workflow: fetch the page (requests + BeautifulSoup for static pages, Playwright for JavaScript-rendered pages), convert HTML to markdown or plain text to reduce token count, send to Claude with an extraction prompt, parse the structured output. This approach works even when the page structure changes because the model understands the semantic content, not the DOM structure.

Ethical and legal note: always check robots.txt before scraping, respect rate limits (1-2 requests per second maximum for well-behaved scrapers), and do not scrape personal data without a legal basis. Many websites have terms of service that prohibit scraping — read them first.`,
  pre_flight: `**Install scraping stack:**
\`\`\`bash
pip install requests beautifulsoup4 playwright markdownify anthropic
playwright install chromium
\`\`\`

**Pattern 1 — Static page scraping + AI extraction:**
\`\`\`python
import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md
import anthropic

client = anthropic.Anthropic()

def scrape_and_extract(url: str, extraction_prompt: str) -> dict:
    # Fetch page
    response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    soup = BeautifulSoup(response.text, "html.parser")

    # Remove nav, footer, scripts (reduce noise)
    for tag in soup.find_all(["nav", "footer", "script", "style", "aside"]):
        tag.decompose()

    # Convert to markdown (much shorter than raw HTML)
    text = md(str(soup.body), strip=["img", "a"])[:8000]  # limit tokens

    # Extract with Claude
    message = client.messages.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": f"{extraction_prompt}\\n\\nContent:\\n{text}"
        }]
    )
    return message.content[0].text
\`\`\`

**Pattern 2 — JavaScript-rendered pages with Playwright:**
\`\`\`python
from playwright.sync_api import sync_playwright

def scrape_dynamic(url: str) -> str:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url)
        page.wait_for_load_state("networkidle")
        content = page.content()
        browser.close()
    return content
\`\`\``,
  mastery_questions: [
    "What is the difference between requests + BeautifulSoup and Playwright for web scraping? When do you need Playwright?",
    "Why do you convert HTML to markdown before sending to Claude? What is the token count difference?",
    "Explain robots.txt. What does 'Disallow: /api/' mean for a scraper?",
    "How do you implement rate limiting in a scraper so you don't get IP-banned?",
    "What is the difference between CSS selectors and XPath? Give an example where XPath is more powerful than a CSS selector.",
  ],
  common_mistakes: [
    "Scraping raw HTML instead of cleaned text — raw HTML with CSS classes, JavaScript, and attributes can be 10x the tokens of the actual content. Always clean before sending to the model.",
    "Not rotating User-Agent headers — many sites block default Python/requests User-Agent strings. Use a realistic browser User-Agent.",
    "No delay between requests — scraping at full speed will trigger rate limiting or IP bans. Add random sleep between requests: time.sleep(random.uniform(1, 3)).",
    "Not handling 403/429 responses — check the status code before parsing the response body. A 403 HTML page looks like content but is an access denied page.",
    "Parsing the wrong element — always inspect the page source (not DevTools rendered view) to understand the actual HTML structure your scraper sees.",
  ],
  debug_help: `**Scraper returning 403?**
\`\`\`python
import random
import time

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}
response = requests.get(url, headers=headers)
time.sleep(random.uniform(1, 3))
\`\`\`

**Playwright not waiting for content?**
\`\`\`python
# Wait for a specific element instead of networkidle
page.goto(url)
page.wait_for_selector(".product-price", timeout=10000)
content = page.inner_text(".main-content")
\`\`\`

**Claude extraction missing fields?**
- Print the cleaned text before sending — if the field is not there, Claude can't extract it
- Check if the page uses JavaScript to load the content (Playwright needed)
- Reduce the amount of text sent — irrelevant context confuses extraction`,
  ai_assist: `**Prompts that work:**
- "Write a Python scraper that extracts job postings from [type of job board]. For each posting, extract: title, company, location, salary, and requirements. Handle pagination."
- "I have a 5,000-character HTML page. How do I clean it to the minimum text needed for Claude to extract [specific fields]? Write the BeautifulSoup cleaning code."
- "What are the ethical and legal considerations when building a web scraper? What should I check before scraping any website?"
- "How do I handle a website that uses infinite scroll? Write Playwright code that scrolls to the bottom 5 times and collects all loaded content."`,
  stretch: [
    "Build a competitive intelligence scraper: monitor 5 competitor websites weekly, extract pricing or product changes, and send a summary email.",
    "Implement a scraping pipeline with caching: don't re-scrape the same URL within 24 hours, store raw HTML and extracted data in SQLite.",
    "Build a news aggregator: scrape RSS feeds from 10 sources, extract articles with Claude, classify by topic, and store in a searchable database.",
    "Handle anti-bot measures: implement Playwright stealth mode and test your scraper against a bot-detection site like bot.sannysoft.com.",
  ],
});

// W8: Document processing with AI
rewriteWeek("ai-automation", 8, {
  context: `Document processing is one of the highest-value AI automation use cases because every business has documents: invoices, contracts, reports, forms, emails, PDFs. Manually extracting data from documents is slow, error-prone, and expensive. AI makes this process fast, cheap, and scalable.

The document processing pipeline: ingest (read from file system, email, S3, or API), extract text (PDF parsing, OCR for scanned documents), chunk if needed (large documents exceed context windows), process with AI (extraction, summarisation, classification), validate output, and store results.

Claude supports vision — you can send document images directly and let the model extract text and data without explicit OCR. This is particularly powerful for scanned forms, handwritten documents, and complex layouts where text extraction tools fail.`,
  pre_flight: `**Install document processing libraries:**
\`\`\`bash
pip install anthropic pymupdf pillow python-docx openpyxl pdfplumber
\`\`\`

**Pattern 1 — PDF text extraction:**
\`\`\`python
import pdfplumber
import anthropic

client = anthropic.Anthropic()

def process_pdf(pdf_path: str, extraction_prompt: str) -> dict:
    with pdfplumber.open(pdf_path) as pdf:
        text = "\\n\\n".join(
            page.extract_text() or ""
            for page in pdf.pages
        )

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": f"{extraction_prompt}\\n\\nDocument:\\n{text[:8000]}"
        }]
    )
    return response.content[0].text
\`\`\`

**Pattern 2 — Vision-based extraction (for scanned docs):**
\`\`\`python
import base64
from pathlib import Path

def extract_from_image(image_path: str, prompt: str) -> str:
    image_data = Path(image_path).read_bytes()
    b64_image = base64.standard_b64encode(image_data).decode("utf-8")

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": b64_image
                    }
                },
                {"type": "text", "text": prompt}
            ]
        }]
    )
    return response.content[0].text
\`\`\``,
  mastery_questions: [
    "What is the difference between text-based PDF extraction (pdfplumber) and vision-based extraction (sending the page as an image to Claude)? When do you use each?",
    "A contract is 50 pages long. How do you process it when the context window only holds 15 pages of text? Describe the chunking strategy.",
    "What is OCR and when is it needed? How does Claude's vision capability reduce reliance on traditional OCR?",
    "How do you validate extracted data from documents? What checks should you run on every invoice extraction?",
    "Describe a complete invoice processing pipeline from email attachment to database row.",
  ],
  common_mistakes: [
    "Sending entire documents without chunking — a 50-page contract sent as one blob often loses important content from the middle. Chunk by page or section and process each chunk.",
    "Not handling extraction failures gracefully — if Claude can't extract a required field, the pipeline should flag the document for human review, not silently drop it.",
    "Using pdfplumber on scanned PDFs — scanned PDFs contain images of text, not text. pdfplumber returns empty strings. Use Claude vision or a dedicated OCR service.",
    "Not normalising extracted data — Claude may return dates as 'January 15, 2024' or '01/15/24' or '2024-01-15'. Normalise all fields to consistent types before storing.",
    "Processing documents sequentially when you can parallelise — if you have 100 invoices to process, use asyncio or thread pools to process them concurrently.",
  ],
  debug_help: `**pdfplumber returning empty text?**
\`\`\`python
# Check if PDF is scanned (image-based)
with pdfplumber.open("file.pdf") as pdf:
    for page in pdf.pages:
        print(repr(page.extract_text()[:100]))  # prints None or empty if scanned
# If empty -> use Claude vision or pytesseract for OCR
\`\`\`

**Large document exceeding context?**
\`\`\`python
def chunk_text(text: str, chunk_size: int = 6000, overlap: int = 200) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap  # overlap for context continuity
    return chunks
\`\`\`

**Vision extraction slow?**
- Resize images to 1024px width before encoding — Claude doesn't need print-quality resolution for text extraction
- Use JPEG compression (quality=85) instead of PNG for smaller base64 payload`,
  ai_assist: `**Prompts that work:**
- "Write a Python pipeline that processes all PDF files in a folder, extracts invoice data (vendor, amount, date, line items), validates the extraction, and writes results to a CSV file."
- "How do I handle a multi-page document where the relevant data might be split across pages? Write a chunking strategy that maintains context between chunks."
- "Write a system prompt for extracting data from diverse invoice formats — the prompt must handle different layouts, currencies, and date formats."
- "What is the best approach for classifying thousands of PDF documents into categories (contract, invoice, report, form)? Compare classifier fine-tuning vs. prompt-based classification."`,
  stretch: [
    "Build a complete document intake system: watch a folder for new PDFs, extract to JSON, validate required fields, write to SQLite, and alert via email if extraction confidence is low.",
    "Process a set of handwritten forms using Claude vision — compare accuracy to a traditional OCR tool on the same forms.",
    "Build a contract analyzer: extract parties, dates, key obligations, and termination clauses from legal contracts — test with sample contracts from SEC EDGAR.",
    "Implement a document classifier that routes incoming documents (invoice/contract/receipt/report) to different processing pipelines based on document type.",
  ],
});

// W9: Email and communication automation
rewriteWeek("ai-automation", 9, {
  context: `Email is the highest-volume communication channel in most businesses, and it is a goldmine for AI automation. Classifying incoming emails, drafting responses, extracting action items, routing support tickets, and generating personalised outreach at scale — all of these are tractable AI automation problems.

The key to reliable email automation is the human-in-the-loop design pattern: the AI drafts or suggests, a human reviews before sending. Fully autonomous email sending is appropriate only for narrow, well-tested cases (like confirmation emails from structured triggers). For anything involving judgment about what to say to a human, keep a human in the loop.

This week you build three email automations: an inbox classifier that labels and routes incoming email, a response drafter that generates suggested replies for support emails, and a personalised outreach generator that creates unique emails from a prospect list.`,
  pre_flight: `**Gmail API setup:**
1. Google Cloud Console → Create Project
2. Enable Gmail API
3. Create OAuth 2.0 credentials (Desktop application)
4. Download credentials.json

\`\`\`bash
pip install google-auth-oauthlib google-auth-httplib2 google-api-python-client
\`\`\`

\`\`\`python
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import base64

SCOPES = ["https://www.googleapis.com/auth/gmail.modify"]

def get_gmail_service():
    creds = None
    flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
    creds = flow.run_local_server(port=0)
    return build("gmail", "v1", credentials=creds)

def get_unread_emails(service, max_results=10):
    results = service.users().messages().list(
        userId="me", q="is:unread", maxResults=max_results
    ).execute()
    return results.get("messages", [])

def get_email_body(service, msg_id: str) -> str:
    msg = service.users().messages().get(userId="me", id=msg_id, format="full").execute()
    payload = msg["payload"]
    if "body" in payload and payload["body"].get("data"):
        return base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8")
    return ""
\`\`\``,
  mastery_questions: [
    "What is the Gmail API OAuth scope difference between 'gmail.readonly' and 'gmail.modify'? When does each apply?",
    "Design an email classification system for a SaaS support inbox. What categories would you define and how would you handle ambiguous emails?",
    "What is the human-in-the-loop pattern for email automation? When is it safe to send emails fully automatically?",
    "How do you personalise outreach emails at scale without making them feel templated?",
    "What legal requirements apply to automated outreach emails in the EU and US? What must every marketing email include?",
  ],
  common_mistakes: [
    "Sending automated emails without unsubscribe links — CAN-SPAM (US) and GDPR (EU) require unsubscribe mechanisms on commercial emails. Non-compliance risks fines.",
    "Not rate limiting email sending — sending 1,000 emails in one burst triggers spam filters and can result in your domain being blacklisted.",
    "Fully automating responses to customer support without review — AI can misinterpret tone or context. Draft first, send only after human review.",
    "Storing email bodies in plain text files — email data is personal data under GDPR. Store it encrypted and define a retention policy.",
    "Using the full email thread as context without trimming — email threads can be very long and expensive to process. Extract only the latest message and include a summary of prior context.",
  ],
  debug_help: `**Gmail OAuth redirect_uri_mismatch?**
- In Google Cloud Console → OAuth credentials → Authorised redirect URIs
- Add: http://localhost:8080/ (or whatever port your local server uses)
- For InstalledAppFlow, the redirect is typically http://localhost

**Email body returning empty?**
\`\`\`python
# Gmail bodies can be in multiple parts (multipart/alternative)
def get_email_body(service, msg_id: str) -> str:
    msg = service.users().messages().get(userId="me", id=msg_id, format="full").execute()

    def extract_parts(parts):
        for part in parts:
            if part["mimeType"] == "text/plain":
                data = part["body"].get("data", "")
                if data:
                    return base64.urlsafe_b64decode(data).decode("utf-8")
            if "parts" in part:
                result = extract_parts(part["parts"])
                if result:
                    return result
        return ""

    payload = msg["payload"]
    return extract_parts(payload.get("parts", [payload]))
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Write a system prompt for an AI that classifies customer support emails into: [Billing, Technical, Feature Request, Complaint, General] and assigns a priority of High/Medium/Low."
- "Design a personalised outreach email generator. I have a prospect list with: company name, industry, recent news, and contact name. Write the system prompt and extraction logic."
- "How do I implement an AI email drafting workflow where Claude drafts a reply and a human approves it before sending via Gmail API?"
- "What is the difference between transactional and marketing emails from a legal compliance perspective? What must each include?"`,
  stretch: [
    "Build a complete support inbox automation: classify incoming emails, auto-reply to FAQs with a confidence > 95%, and route everything else to a Notion inbox for human review.",
    "Build a personalised outreach generator: given a CSV of 20 prospects with name, company, and LinkedIn bio, generate unique, personalised cold emails for each.",
    "Implement email thread summarisation: take a long email thread, summarise the history and open questions, and present it as context for writing a reply.",
    "Set up a monitoring system that alerts you (via Telegram or SMS) when an email matching specific criteria (keywords, sender, urgency score) arrives.",
  ],
});

// W10: Database and spreadsheet automation
rewriteWeek("ai-automation", 10, {
  context: `Databases and spreadsheets hold the structured data that drives business decisions. AI automation connects these data stores to intelligence: generating SQL from natural language, enriching database rows with AI-generated content, building automated reporting pipelines, and creating smart spreadsheet functions.

Natural language to SQL (text-to-SQL) is one of the most valuable enterprise automation patterns. Instead of requiring a data analyst to write SQL for every ad-hoc question, you build a system where business users ask questions in plain English and get SQL-generated answers. The key to making this reliable: the model needs your database schema, table descriptions, and example queries as context.

This week you build a natural language query interface for a SQLite database, an automated data enrichment pipeline, and a Google Sheets automation that uses the Sheets API + Claude to add AI-generated columns.`,
  pre_flight: `**Text-to-SQL with schema context:**
\`\`\`python
import sqlite3
import anthropic

client = anthropic.Anthropic()

def get_schema(db_path: str) -> str:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table'")
    schemas = cursor.fetchall()
    conn.close()
    return "\\n".join(s[0] for s in schemas if s[0])

def natural_language_to_sql(question: str, db_path: str) -> str:
    schema = get_schema(db_path)
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=500,
        system=f"""You are a SQL expert. Generate SQLite SQL queries from natural language questions.
Database schema:
{schema}

Rules:
- Return ONLY the SQL query, no explanation
- Use SQLite syntax
- Never use destructive operations (DROP, DELETE, UPDATE, INSERT)
- If the question cannot be answered from the schema, return: SELECT 'Cannot answer: [reason]'""",
        messages=[{"role": "user", "content": question}]
    )
    return response.content[0].text.strip()

def run_query(question: str, db_path: str) -> list[dict]:
    sql = natural_language_to_sql(question, db_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    try:
        cursor.execute(sql)
        return [dict(row) for row in cursor.fetchall()]
    except Exception as e:
        return [{"error": str(e), "sql": sql}]
    finally:
        conn.close()
\`\`\`

**Google Sheets API setup:**
\`\`\`bash
pip install gspread google-auth
\`\`\`
\`\`\`python
import gspread
from google.oauth2.service_account import Credentials

scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = Credentials.from_service_account_file("service-account.json", scopes=scope)
gc = gspread.authorize(creds)
sheet = gc.open("My Spreadsheet").sheet1
data = sheet.get_all_records()  # list of dicts
\`\`\``,
  mastery_questions: [
    "Why must you include the database schema in a text-to-SQL prompt? What happens if you don't?",
    "What safety measures must you apply to an AI-generated SQL query before executing it?",
    "How do you handle a text-to-SQL system that generates a correct-looking but semantically wrong query?",
    "What is the Google Sheets API service account vs OAuth? When would you use each?",
    "Design a data enrichment pipeline: you have a customer table with name and company. Use Claude to add industry, company size estimate, and likely job title fields.",
  ],
  common_mistakes: [
    "Executing AI-generated SQL without validation — always parse the SQL before executing to confirm it is a SELECT statement, not a DROP or DELETE.",
    "Not including table descriptions in the text-to-SQL prompt — schema alone is not enough for ambiguous column names. Describe what each table and key column represents.",
    "Enriching data without de-duplication — if a batch enrichment job fails midway and you re-run it, you should not re-enrich already-enriched rows. Track which rows are processed.",
    "Not rate-limiting Google Sheets API calls — the Sheets API has a limit of 300 write requests per minute. Batch your writes using batch_update() instead of one call per cell.",
    "Storing API-enriched data only in Google Sheets — use Google Sheets as the user-facing interface but store source data in a proper database with a backup.",
  ],
  debug_help: `**Text-to-SQL generating wrong JOIN?**
Add to the system prompt:
\`\`\`
Table relationships:
- orders.customer_id → customers.id (many-to-one)
- orders.product_id → products.id (many-to-one)
Example join query for "orders with customer names":
SELECT o.*, c.name FROM orders o JOIN customers c ON o.customer_id = c.id
\`\`\`

**gspread authentication failing?**
\`\`\`python
# Service account must be shared with the spreadsheet
# In Google Sheets: Share → add the service account email (found in service-account.json)
print(creds.service_account_email)  # share this email with the sheet
\`\`\`

**Google Sheets rate limit?**
\`\`\`python
# Batch writes instead of individual calls
sheet.batch_update([
    {"range": f"B{i+2}", "values": [[enriched_values[i]]]}
    for i in range(len(enriched_values))
])
\`\`\``,
  ai_assist: `**Prompts that work:**
- "I have a SQLite database with tables: customers (id, name, email, country), orders (id, customer_id, amount, created_at), products (id, name, category, price). Write a text-to-SQL system prompt that includes examples for 5 common query types."
- "How do I validate that an AI-generated SQL query is safe to execute? Write a Python function that checks for destructive operations."
- "Design a data enrichment pipeline for a leads database: given company name and domain, use Claude to estimate industry, company size, and B2B/B2C classification."
- "What is the difference between Google Sheets batch_update and individual update calls? Write code that updates 100 cells efficiently."`,
  stretch: [
    "Build a complete natural language BI interface: connect to a database, accept user questions in a Telegram bot or FastAPI endpoint, run the generated SQL, and return formatted results.",
    "Build a Google Sheets automation that runs daily: reads a sheet of company names, enriches each with AI-generated data (description, industry, HQ location), and writes results back.",
    "Implement a query result explanation feature: after running a SQL query, send the results back to Claude and ask it to explain the findings in plain English for a non-technical manager.",
    "Add SQL query caching: if the same question has been asked before (fuzzy match on question text), return the cached result instead of regenerating the SQL.",
  ],
});

console.log("\nAll done — ai-automation W6-W10 applied.");
