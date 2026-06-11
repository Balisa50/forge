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

// W11: LangChain basics
rewriteWeek("ai-automation", 11, {
  context: `LangChain is a framework for building LLM-powered applications. It provides abstractions for the most common patterns: chains (sequences of LLM calls), agents (LLMs with tools), memory (persisting conversation state), and document loaders + retrievers (for RAG). The value of LangChain is reducing boilerplate — the same patterns you would implement manually in 200 lines take 20 lines with LangChain.

The critique of LangChain is equally valid: it adds abstraction and magic that makes debugging harder, and its API surface changes frequently. For production systems, many teams drop LangChain and implement the specific patterns they need directly. You should know both approaches: LangChain for rapid prototyping and experimentation, direct API calls for production.

This week you use LangChain to build the same automations you built in Python in previous weeks — compare the implementation and form your own opinion.`,
  pre_flight: `**Install LangChain:**
\`\`\`bash
pip install langchain langchain-anthropic langchain-community
\`\`\`

**LangChain with Claude:**
\`\`\`python
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate

llm = ChatAnthropic(model="claude-3-5-haiku-20241022", temperature=0)

# Simple chain
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant that extracts data as JSON."),
    ("human", "{input}")
])
chain = prompt | llm | JsonOutputParser()
result = chain.invoke({"input": "Extract: John Smith, CEO at Acme Corp, email john@acme.com"})
\`\`\`

**LangChain document loading + splitting:**
\`\`\`python
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

loader = PyPDFLoader("document.pdf")
docs = loader.load()

splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)
chunks = splitter.split_documents(docs)
print(f"Split into {len(chunks)} chunks")
\`\`\`

**LCEL (LangChain Expression Language) pipe syntax:**
\`\`\`python
# Chain components with | operator
chain = prompt | llm | output_parser
# Add a fallback
robust_chain = chain.with_fallbacks([backup_chain])
# Stream output
for chunk in chain.stream({"input": "..."}):
    print(chunk, end="", flush=True)
\`\`\``,
  mastery_questions: [
    "What is LangChain Expression Language (LCEL)? How does the | pipe operator connect components?",
    "What is the difference between a LangChain chain and a LangChain agent? Give a concrete example of when you need each.",
    "What is LangSmith and why does LangChain recommend using it? What does it trace?",
    "What are the main criticisms of LangChain for production use? When should you avoid it?",
    "How does LangChain's StrOutputParser differ from JsonOutputParser? When would you use each?",
  ],
  common_mistakes: [
    "Using LangChain for everything — LangChain adds complexity. For simple single-LLM calls, use the Anthropic SDK directly. LangChain is valuable for complex multi-step pipelines.",
    "Not setting temperature in LangChain — LangChain's default temperature is 0.7. For automation, always set temperature=0 explicitly.",
    "Assuming LangChain abstractions are stable — LangChain's API changes frequently. Pin your version in requirements.txt and read the changelog before upgrading.",
    "Not using LangSmith for debugging complex chains — when a 5-step chain produces wrong output, you need to see the intermediate state. LangSmith shows every step.",
    "Mixing LangChain versions — langchain, langchain-core, and langchain-community have separate versioning. Pin all three.",
  ],
  debug_help: `**LangChain chain returning unexpected output?**
\`\`\`python
# Enable verbose logging
from langchain.globals import set_verbose
set_verbose(True)
# Or use LangSmith tracing
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your-langsmith-key"
\`\`\`

**JsonOutputParser failing?**
\`\`\`python
# The model must return ONLY JSON, no surrounding text
# Add format instructions to the prompt:
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel

class Contact(BaseModel):
    name: str
    email: str

parser = JsonOutputParser(pydantic_object=Contact)
prompt = ChatPromptTemplate.from_messages([
    ("human", "{input}\\n{format_instructions}")
]).partial(format_instructions=parser.get_format_instructions())
\`\`\`

**Document splitting losing context?**
\`\`\`python
# Increase overlap for documents where context spans chunks
splitter = RecursiveCharacterTextSplitter(
    chunk_size=2000,
    chunk_overlap=400,  # 20% overlap
    separators=["\\n\\n", "\\n", " ", ""]
)
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Compare implementing a document Q&A system with LangChain vs. directly using the Anthropic SDK. What does LangChain provide and what does it hide?"
- "Walk me through building a LangChain chain that: loads a PDF, splits it, embeds the chunks, stores in a vector store, and answers questions using retrieved context."
- "What is the LCEL 'Runnable' interface? How does .with_retry() and .with_fallbacks() work?"
- "When should I prefer LangChain over direct API calls for a production automation system? Give specific criteria."`,
  stretch: [
    "Rebuild your document processing automation from W8 using LangChain — compare lines of code, readability, and debuggability.",
    "Set up LangSmith and trace a complex 4-step LangChain pipeline — identify which step takes the most time and costs the most tokens.",
    "Build a LangChain agent with 3 tools: web search (Tavily), calculator (PythonREPL), and Wikipedia lookup — test it with 10 research questions.",
    "Read the LangChain Expression Language documentation: https://python.langchain.com/docs/concepts/lcel/",
  ],
});

// W12: Building your first autonomous agent
rewriteWeek("ai-automation", 12, {
  context: `An autonomous agent operates without human intervention from start to finish on multi-step tasks. This week you build one that is genuinely useful: a research agent that takes a topic, searches the web, reads the most relevant pages, synthesises the information, and writes a structured research report.

The architecture: a ReAct loop with 3 tools (web search, page reader, write-report), a system prompt that defines the research process and output format, and a stopping condition when the model decides it has enough information. The challenge is reliability — agents fail in unpredictable ways, and you need to build monitoring and guardrails from the start.

You also learn the concept of agent evaluation: how do you measure whether an agent is doing a good job? You build a small test harness that runs the agent on 5 known tasks and scores the output quality.`,
  pre_flight: `**Research agent tools:**
\`\`\`bash
pip install anthropic tavily-python requests beautifulsoup4 markdownify
\`\`\`

\`\`\`python
from tavily import TavilyClient  # free tier: 1000 searches/month
import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md

tavily = TavilyClient(api_key="tvly-...")

def search_web(query: str) -> str:
    results = tavily.search(query=query, max_results=5)
    return "\\n\\n".join([
        f"**{r['title']}**\\n{r['url']}\\n{r['content']}"
        for r in results["results"]
    ])

def read_page(url: str) -> str:
    try:
        resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup.find_all(["nav", "footer", "script", "style"]):
            tag.decompose()
        return md(str(soup.body))[:5000]
    except Exception as e:
        return f"Error reading page: {e}"

tools = [
    {
        "name": "search_web",
        "description": "Search the web for current information on a topic. Use for finding sources.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "Search query"}},
            "required": ["query"]
        }
    },
    {
        "name": "read_page",
        "description": "Read the full content of a web page given its URL.",
        "input_schema": {
            "type": "object",
            "properties": {"url": {"type": "string", "description": "URL to read"}},
            "required": ["url"]
        }
    }
]
\`\`\``,
  mastery_questions: [
    "What is the stopping condition for an autonomous research agent? How does the model know when to stop and produce the final report?",
    "How do you prevent a research agent from looping indefinitely on the same search queries?",
    "What is agent evaluation? How do you measure the quality of an agent's research output systematically?",
    "Describe 3 failure modes specific to research agents and how you would detect each.",
    "What is the difference between a planning agent and a ReAct agent? When would you choose a planning approach?",
  ],
  common_mistakes: [
    "Not limiting web page read time — reading a slow page can block the agent for 30 seconds. Always set a timeout on HTTP requests.",
    "Not deduplicating search results — if the agent searches the same query twice and reads the same URLs twice, you waste tokens and money. Track visited URLs.",
    "Sending full page content to the model — a web page can be 50,000 characters. Send only the first 5,000 characters, or use a chunked approach with relevance filtering.",
    "Not separating the research phase from the writing phase — some agents try to research and write simultaneously, producing inconsistent reports. Gather all sources first, then write.",
    "Not logging tool call sequences — when an agent fails or produces a poor report, you need to see every search query and page it visited. Log everything.",
  ],
  debug_help: `**Tavily API key setup:**
\`\`\`bash
# Sign up at tavily.com for free API key
export TAVILY_API_KEY="tvly-..."
\`\`\`

**Agent not stopping after finding enough info?**
Add explicit stopping criteria to the system prompt:
\`\`\`
You should stop searching and write the final report when:
1. You have read at least 3 high-quality sources
2. You have enough information to answer all required sections
3. Additional searches are returning redundant information
\`\`\`

**Agent producing low-quality reports?**
Add output format requirements to the system prompt:
\`\`\`
The final report must include:
- Executive Summary (2-3 sentences)
- Key Findings (5 bullet points with sources cited)
- Detailed Analysis (3-4 paragraphs)
- Sources (numbered list with URLs)
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Write the system prompt for a research agent that produces structured reports. The agent has access to web search and page reading. Include clear stopping criteria and output format requirements."
- "How do I implement URL deduplication in an agent that might search the same topic multiple times? Write the Python code."
- "Design an evaluation rubric for research agent output quality. What 5 dimensions would you score and how would you score each automatically?"
- "My research agent keeps using the same 2 search queries. How do I prompt it to diversify its search strategy?"`,
  stretch: [
    "Build a complete research agent that produces a 500-word report on any given topic — test with 5 diverse topics and evaluate output quality manually.",
    "Add agent observability: log every tool call, its arguments, execution time, and token cost to a SQLite database for analysis.",
    "Implement an agent planner: before starting research, the agent creates a plan (list of subtopics and search strategies) and then executes it sequentially.",
    "Deploy your research agent as a FastAPI endpoint — accept topic via POST, return the report as JSON, and handle concurrent requests.",
  ],
});

// W13: Multi-step workflows and orchestration
rewriteWeek("ai-automation", 13, {
  context: `Multi-step workflows chain multiple AI calls, external API calls, database operations, and conditional logic together into a coherent pipeline. As automations grow more complex, you need orchestration — a way to manage state, handle failures at any step, and retry or route around errors without starting from scratch.

Orchestration patterns: sequential (A → B → C), parallel (A and B run simultaneously, then C waits for both), conditional (if A returns X, go to B, else go to C), and fan-out/fan-in (process N items in parallel, aggregate results). The right pattern depends on the task — sequential is simplest, parallel is fastest when steps are independent.

This week you build a multi-step content production workflow using Prefect (a Python orchestration framework) and compare it to building the same workflow manually. You also learn state management: how to track which steps have completed when a workflow is interrupted and needs to resume.`,
  pre_flight: `**Install Prefect:**
\`\`\`bash
pip install prefect anthropic
prefect server start  # local development server
\`\`\`

**Prefect workflow example — content production pipeline:**
\`\`\`python
from prefect import flow, task
from prefect.tasks import task_input_hash
from datetime import timedelta
import anthropic

client = anthropic.Anthropic()

@task(cache_key_fn=task_input_hash, cache_expiration=timedelta(hours=1))
def research_topic(topic: str) -> str:
    # Cached: same topic won't re-run within 1 hour
    response = client.messages.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=500,
        messages=[{"role": "user", "content": f"Research key facts about: {topic}"}]
    )
    return response.content[0].text

@task
def write_outline(research: str) -> str:
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=500,
        messages=[{"role": "user", "content": f"Create a blog post outline from: {research}"}]
    )
    return response.content[0].text

@task
def write_draft(outline: str) -> str:
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1500,
        messages=[{"role": "user", "content": f"Write a full blog post from this outline:\\n{outline}"}]
    )
    return response.content[0].text

@flow(name="content-production")
def produce_content(topic: str) -> str:
    research = research_topic(topic)
    outline = write_outline(research)
    draft = write_draft(outline)
    return draft
\`\`\``,
  mastery_questions: [
    "What is the difference between a Prefect task and a Prefect flow? Can a flow call another flow?",
    "What is task caching in Prefect and when does it save you time and money in an AI automation context?",
    "Describe the fan-out/fan-in pattern. Give an example where you would process 20 documents in parallel with a concurrency limit of 5.",
    "What happens to a Prefect flow when one task fails? How do you configure retry behaviour?",
    "Compare Prefect, Airflow, and n8n for orchestrating AI automation workflows. When would you choose each?",
  ],
  common_mistakes: [
    "Building all steps in a single Python function instead of Prefect tasks — if one step fails in a monolithic function, the entire workflow reruns from the start. Tasks enable granular retry and caching.",
    "Not setting concurrency limits — processing 1,000 items with 1,000 parallel tasks hits API rate limits immediately. Use task_runner with concurrency_limit.",
    "Ignoring task input hashing for expensive AI steps — a research step that costs $0.10 per run should be cached. Add cache_key_fn=task_input_hash.",
    "Not monitoring workflow runs — always set up Prefect alerts for failures. A workflow that silently fails and nobody notices is worse than no automation.",
    "Hardcoding configuration in workflows — use Prefect variables or environment variables for API keys, model names, and other configuration that changes between environments.",
  ],
  debug_help: `**Prefect tasks running sequentially instead of parallel?**
\`\`\`python
from prefect import flow
from prefect.futures import PrefectFuture

@flow
def parallel_flow(items: list[str]) -> list[str]:
    futures = [process_item.submit(item) for item in items]
    return [f.result() for f in futures]  # waits for all
\`\`\`

**Task caching not working?**
\`\`\`python
# Cache requires serialisable inputs
# If your input is a complex object, use a custom cache key function
from prefect.tasks import task_input_hash

@task(cache_key_fn=task_input_hash, cache_expiration=timedelta(hours=24))
def my_task(input: str) -> str: ...
\`\`\`

**Prefect flow not appearing in UI?**
\`\`\`bash
# Start Prefect server in a separate terminal
prefect server start
# Set the API URL in your environment
export PREFECT_API_URL="http://127.0.0.1:4200/api"
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Design a Prefect workflow for a weekly competitive intelligence report: scrape 5 competitor websites, extract product changes, compare to previous week, and email a summary. What are the tasks and how do they connect?"
- "How do I implement fan-out/fan-in in Prefect to process 100 documents in parallel with max 10 concurrent tasks?"
- "What is the difference between Prefect retry policies and manual try/except in a task? When do you use each?"
- "How do I pass the output of one AI call as the input to the next in a Prefect workflow, while handling the case where the first call fails?"`,
  stretch: [
    "Build a complete content production pipeline in Prefect: topic research → outline → draft → SEO optimisation → publish to Ghost CMS via API.",
    "Implement workflow state persistence: if a workflow fails midway, resume from the last completed task rather than starting over.",
    "Add Prefect notifications: send a Slack message when a workflow completes successfully or fails, including the total cost (tokens used * price per token).",
    "Compare the same 5-step workflow built with: (1) Prefect, (2) n8n, (3) manual Python. Document the tradeoffs in terms of debuggability, reliability, and development speed.",
  ],
});

// W14: RAG — retrieval augmented generation
rewriteWeek("ai-automation", 14, {
  context: `RAG (Retrieval Augmented Generation) is how you give an LLM access to a large knowledge base without putting all of it in the context window. Instead of feeding the model an entire documentation library, you embed the documents into vector representations, store them in a vector database, and at query time retrieve only the most relevant chunks — then send those chunks plus the user's question to the model.

RAG is the dominant pattern for enterprise AI applications: chatbots that answer questions from company documentation, support agents that reference product manuals, search systems that understand natural language. Understanding the full pipeline — chunking, embedding, storing, retrieving, reranking, prompting — lets you build and debug these systems from first principles.

The hardest part of RAG is not the retrieval — it is getting the chunking and retrieval quality right. A RAG system that retrieves the wrong chunks gives the model bad context, which produces confident-sounding but wrong answers. Chunk quality and retrieval quality are the primary levers for RAG accuracy.`,
  pre_flight: `**RAG stack:**
\`\`\`bash
pip install anthropic chromadb sentence-transformers pdfplumber
\`\`\`

**Complete RAG pipeline:**
\`\`\`python
import chromadb
from sentence_transformers import SentenceTransformer
import pdfplumber
import anthropic

# 1. Load and chunk documents
def load_and_chunk(pdf_path: str, chunk_size: int = 500) -> list[str]:
    with pdfplumber.open(pdf_path) as pdf:
        text = " ".join(page.extract_text() or "" for page in pdf.pages)

    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - 50):  # 50-word overlap
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

# 2. Embed and store
embedder = SentenceTransformer("all-MiniLM-L6-v2")
chroma = chromadb.Client()
collection = chroma.create_collection("docs")

chunks = load_and_chunk("document.pdf")
embeddings = embedder.encode(chunks).tolist()
collection.add(
    documents=chunks,
    embeddings=embeddings,
    ids=[f"chunk_{i}" for i in range(len(chunks))]
)

# 3. Retrieve and generate
def rag_query(question: str) -> str:
    # Retrieve top 3 relevant chunks
    q_embedding = embedder.encode([question]).tolist()
    results = collection.query(query_embeddings=q_embedding, n_results=3)
    context = "\\n\\n".join(results["documents"][0])

    # Generate answer with context
    client = anthropic.Anthropic()
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=500,
        system="Answer the question using only the provided context. If the answer is not in the context, say so.",
        messages=[{
            "role": "user",
            "content": f"Context:\\n{context}\\n\\nQuestion: {question}"
        }]
    )
    return response.content[0].text
\`\`\``,
  mastery_questions: [
    "Explain the RAG pipeline: what happens at indexing time vs query time?",
    "What is a vector embedding? Why does similarity search on embeddings work for semantic retrieval?",
    "What is chunking strategy and why does it matter? Compare fixed-size chunking vs semantic chunking.",
    "What is reranking in RAG? When does it improve retrieval quality over basic similarity search?",
    "What are the failure modes of RAG? How do you evaluate whether your RAG system is answering correctly?",
  ],
  common_mistakes: [
    "Chunks too large — large chunks dilute the relevant content with irrelevant text, reducing retrieval precision. 200-500 words is a good starting point.",
    "Chunks too small — small chunks lose surrounding context that is needed to understand the content. Too-small chunks also increase the number of chunks and retrieval noise.",
    "Retrieving too few chunks — retrieving only 1-2 chunks may miss relevant information that is spread across the document. Retrieve 3-5 and let the model synthesise.",
    "Not citing sources — a RAG system that answers without citing which chunks it used cannot be audited or trusted. Include source references in the output.",
    "Not evaluating retrieval separately from generation — RAG has two components. If the answer is wrong, is it because retrieval returned wrong chunks or because the model misunderstood good chunks? Evaluate separately.",
  ],
  debug_help: `**Retrieved chunks seem irrelevant?**
\`\`\`python
# Print retrieved chunks to diagnose
results = collection.query(query_embeddings=q_embedding, n_results=5)
for i, (doc, score) in enumerate(zip(results["documents"][0], results["distances"][0])):
    print(f"\\nChunk {i+1} (distance: {score:.3f}):")
    print(doc[:200])
# Lower distance = more similar (in ChromaDB with L2 distance)
# If top chunks are irrelevant, try a different embedding model or adjust chunking
\`\`\`

**ChromaDB persisting between runs:**
\`\`\`python
# Use PersistentClient to save embeddings to disk
chroma = chromadb.PersistentClient(path="./chroma_db")
# Data persists between Python process restarts
\`\`\`

**Sentence transformers slow on first run?**
- The model downloads on first use (~80MB)
- Cache it: the model is stored in ~/.cache/torch/sentence_transformers/
- For production: use a hosted embedding API (Anthropic does not have one; use OpenAI or Cohere embeddings)`,
  ai_assist: `**Prompts that work:**
- "Compare the embedding models all-MiniLM-L6-v2, text-embedding-3-small (OpenAI), and voyage-2 (Anthropic partner) for a RAG system over technical documentation. What are the tradeoffs?"
- "What is hybrid search in RAG? How does combining vector search with BM25 keyword search improve retrieval quality?"
- "Design a RAG evaluation framework. How do I measure retrieval precision, answer faithfulness, and answer relevance programmatically?"
- "My RAG system answers correctly most of the time but confidently hallucinates on questions where the answer is not in the knowledge base. How do I fix this?"`,
  stretch: [
    "Build a RAG chatbot over your own documentation or a public knowledge base — deploy it as a FastAPI endpoint.",
    "Implement a RAG evaluation pipeline: create 20 test questions with known correct answers, run your RAG system, and score accuracy automatically.",
    "Add hybrid search: combine ChromaDB vector similarity with BM25 keyword search using rank_bm25, then merge results by reciprocal rank fusion.",
    "Compare ChromaDB vs Pinecone vs Weaviate for a use case with 100k documents — benchmark indexing time, query latency, and cost.",
  ],
});

// W15: Browser automation and computer use
rewriteWeek("ai-automation", 15, {
  context: `Browser automation with AI closes the gap between software that has APIs and software that does not. Many tools — legacy enterprise systems, websites without APIs, desktop applications — can only be automated by controlling the UI. Playwright handles the browser control; AI handles the decision-making about what to click, type, and verify.

Anthropic's Computer Use API goes further: it gives Claude vision of a screen and the ability to click, type, and take actions through a computer. This enables automation of any computer-based task, not just web browsers. It is still in beta and is slower and more expensive than traditional automation, but it represents the direction of AI automation for tasks that resist API-based automation.

This week you build a Playwright automation guided by AI decisions, and explore Claude's Computer Use for a simple task. You also learn when browser automation is the wrong tool — it is fragile compared to API-based automation and should be used only when no API alternative exists.`,
  pre_flight: `**Playwright setup:**
\`\`\`bash
pip install playwright anthropic pillow
playwright install chromium
\`\`\`

**AI-guided browser automation:**
\`\`\`python
from playwright.sync_api import sync_playwright
import anthropic
import base64

client = anthropic.Anthropic()

def take_screenshot(page) -> str:
    screenshot = page.screenshot()
    return base64.standard_b64encode(screenshot).decode("utf-8")

def ask_claude_what_to_do(screenshot_b64: str, task: str) -> str:
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=200,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {"type": "base64", "media_type": "image/png", "data": screenshot_b64}
                },
                {"type": "text", "text": f"Task: {task}. What should I do next? Reply with one action: CLICK[selector], TYPE[text], or DONE."}
            ]
        }]
    )
    return response.content[0].text

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto("https://example.com")
    screenshot = take_screenshot(page)
    action = ask_claude_what_to_do(screenshot, "Find the contact email")
    print(action)
\`\`\`

**Computer Use API (Claude 3.5 Sonnet required):**
https://docs.anthropic.com/en/docs/build-with-claude/computer-use
Note: requires a sandboxed environment (Docker container with display)`,
  mastery_questions: [
    "When should you use Playwright browser automation versus the Anthropic Computer Use API? What are the tradeoffs?",
    "What makes browser automation brittle? Name 3 things that break a Playwright automation when a website updates.",
    "How do you make a browser automation resilient? Name 3 techniques for handling dynamic content and layout changes.",
    "What is a headless browser? When would you use headed vs headless mode?",
    "What are the ethical and legal considerations for browser automation? What is 'scraping' vs 'automation' from a legal perspective?",
  ],
  common_mistakes: [
    "Using CSS class selectors that change on every deployment — use data-testid attributes, aria labels, or text-based selectors that are more stable.",
    "Not waiting for elements before interacting — Playwright's page.click() can fail if the element has not loaded. Use page.wait_for_selector() first.",
    "Not handling pop-ups and cookie banners — most websites show cookie consent banners that block the UI. Dismiss them first or use a browser profile that has already accepted.",
    "Building browser automations for tasks that have APIs — browser automation is 10x more fragile than API calls. Always check for an official API first.",
    "Running browser automation in production without monitoring — browser automations break silently when websites change. Monitor success rates and alert on failures.",
  ],
  debug_help: `**Playwright selector not finding element?**
\`\`\`python
# Use Playwright's inspector to find the right selector
# Add this to pause execution and open browser DevTools
page.pause()
# Or try multiple selector strategies
page.wait_for_selector("text=Submit", timeout=5000)
page.wait_for_selector("[data-testid='submit-btn']", timeout=5000)
page.wait_for_selector("button:has-text('Submit')", timeout=5000)
\`\`\`

**Page not loading in headless mode?**
\`\`\`python
# Some sites block headless browsers — try with non-headless first
browser = p.chromium.launch(headless=False)
# Or use playwright-stealth
pip install playwright-stealth
from playwright_stealth import stealth_sync
stealth_sync(page)
\`\`\`

**Screenshot too large for Claude?**
\`\`\`python
from PIL import Image
import io

screenshot_bytes = page.screenshot()
img = Image.open(io.BytesIO(screenshot_bytes))
img = img.resize((1280, 720))  # resize to standard resolution
buffer = io.BytesIO()
img.save(buffer, format="PNG")
b64 = base64.standard_b64encode(buffer.getvalue()).decode()
\`\`\``,
  ai_assist: `**Prompts that work:**
- "I need to automate filling out a web form that has no API. The form has 10 fields including date pickers and dropdowns. Walk me through a reliable Playwright approach."
- "What is the Anthropic Computer Use API and how does it differ from traditional browser automation with Playwright? When would you choose one over the other?"
- "How do I make a Playwright script resilient to minor UI changes? What selector strategies and wait patterns should I use?"
- "Design a Playwright automation that logs into a web app, navigates to a report page, downloads a CSV, and emails it. Handle common failure modes."`,
  stretch: [
    "Build a Playwright automation that fills out a government or public web form end-to-end, captures a screenshot of the confirmation, and saves it as evidence.",
    "Explore the Anthropic Computer Use API in a Docker container with a VNC display — automate a simple desktop task.",
    "Implement a Playwright automation with AI verification: take a screenshot after each action and ask Claude to confirm the action succeeded before proceeding.",
    "Build a monitoring automation: check 10 URLs daily, take a screenshot of each, and alert via email if any page looks significantly different from the reference screenshot.",
  ],
});

console.log("\nAll done — ai-automation W11-W15 applied.");
