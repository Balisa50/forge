#!/usr/bin/env python3
"""
gen_curate_top.py — a FOCUSED, high-leverage curation worklist.

Instead of 498 micro-rows, this is ~25 CORE concepts (weak tracks first). Fill one
great video per concept and the enricher's keyword router places it on every day
that touches that concept. import_videos.py-compatible.

Run: python gen_curate_top.py  ->  fill CURATE_TOP.csv  ->  python import_videos.py CURATE_TOP.csv
"""
import csv
import urllib.parse
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "CURATE_TOP.csv"

# (priority, track, concept (display + search), concept_key, suggested search query)
PRIORITY = [
    # ── AI Engineering (weakest) ──
    (1, "ai-engineering", "Function calling / tool use with LLMs", "function-calling", "LLM function calling tool use tutorial"),
    (2, "ai-engineering", "Structured outputs / JSON mode", "structured-outputs", "LLM structured outputs JSON mode tutorial"),
    (3, "ai-engineering", "Evals / LLM-as-judge", "llm-eval", "LLM evals llm as a judge tutorial"),
    (4, "ai-engineering", "Prompt injection & defence", "prompt-injection", "prompt injection attack defense explained"),
    (5, "ai-engineering", "Prompt engineering (few-shot, chain-of-thought)", "prompt-engineering", "prompt engineering few-shot chain of thought tutorial"),
    (6, "ai-engineering", "RAG evaluation", "rag-eval", "RAG evaluation RAGAS measure retrieval quality"),
    (7, "ai-engineering", "LLM observability / tracing", "llm-observability", "LLM observability tracing tutorial"),
    (8, "ai-engineering", "Fine-tuning with LoRA", "fine-tuning", "fine tuning LLM LoRA explained"),
    (9, "ai-engineering", "Streaming LLM responses (SSE)", "llm-streaming", "streaming LLM responses SSE tutorial"),
    (10, "ai-engineering", "Agent loops (ReAct / plan-execute)", "agent", "AI agents ReAct loop tutorial"),
    (11, "ai-engineering", "Agent memory / context window", "agent-memory", "LLM agent memory context window tutorial"),
    (12, "ai-engineering", "MCP / tool servers", "mcp", "Model Context Protocol MCP tutorial"),
    # ── Cybersecurity ──
    (13, "cybersecurity", "Burp Suite workflow", "burp", "Burp Suite tutorial for beginners"),
    (14, "cybersecurity", "OWASP Top 10", "owasp", "OWASP Top 10 explained"),
    (15, "cybersecurity", "IDOR (broken access control)", "idor", "IDOR insecure direct object reference explained"),
    (16, "cybersecurity", "SSRF", "ssrf", "SSRF server side request forgery explained"),
    (17, "cybersecurity", "Privilege escalation", "privesc", "privilege escalation linux explained"),
    (18, "cybersecurity", "Incident response basics", "incident-response", "incident response process explained"),
    (19, "cybersecurity", "Threat modeling", "threat-modeling", "threat modeling STRIDE explained"),
    # ── AI Automation ──
    (20, "ai-automation", "Web scraping basics", "web-scraping", "web scraping python beautifulsoup tutorial"),
    (21, "ai-automation", "Document processing / OCR with AI", "document-ai", "document processing OCR AI tutorial"),
    (22, "ai-automation", "Browser automation (Playwright)", "browser-automation", "Playwright browser automation tutorial"),
    (23, "ai-automation", "API integration basics", "api-integration", "REST API integration python requests tutorial"),
    (24, "ai-automation", "Workflow orchestration (n8n)", "n8n", "n8n workflow automation tutorial"),
]


def main():
    cols = ["priority", "track", "concept", "concept_key", "search_url", "status",
            "video_id", "duration_min", "creator", "why"]
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        wr = csv.DictWriter(f, fieldnames=cols)
        wr.writeheader()
        for pri, track, concept, key, q in PRIORITY:
            wr.writerow({
                "priority": pri, "track": track, "concept": concept, "concept_key": key,
                "search_url": f"https://www.youtube.com/results?search_query={urllib.parse.quote_plus(q)}",
                "status": "", "video_id": "", "duration_min": "", "creator": "", "why": "",
            })
    print(f"Wrote {OUT.name}: {len(PRIORITY)} core concepts to curate (weak tracks first).")
    print("Fill video_id/duration_min/creator/why, then: python import_videos.py CURATE_TOP.csv")


if __name__ == "__main__":
    main()
