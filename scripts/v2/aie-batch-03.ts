import { rewriteWeek } from "../rewrite-week";

// ai-engineering W11-W15

rewriteWeek("ai-engineering", 11, {
  context: `Naive RAG is simple: chunk documents, embed them, retrieve the top-k by similarity, stuff them into the prompt. It works on demos. In production, it fails in specific and predictable ways: the user asks a multi-part question and the retrieval only captures part of it; the user uses different vocabulary than the document; the retrieved chunks lack the context needed to understand them in isolation. This week you go beyond naive retrieval and build a paper assistant that implements the patterns that address each of these failures.

Query rewriting is the first pattern. The user's query is rarely the ideal retrieval query. HyDE (Hypothetical Document Embeddings) generates a hypothetical answer to the question, then embeds and retrieves that hypothetical answer against the corpus — because what a correct answer looks like is often closer to relevant documents than what the question looks like. Multi-query generates multiple different phrasings of the question and retrieves for each, then merges and deduplicates the result sets.

Contextual chunk headers address the isolated chunk problem. A paragraph that says "The third limitation is..." is meaningless without knowing what is being limited. Prepending the document title, section heading, and a one-sentence summary before each chunk's embedding ensures the model retrieving it has context about where it came from.

The retrieval-then-rerank pipeline applies the cross-encoder pattern from last week at this level: retrieve a large candidate set (top-50 or top-100) with fast approximate search, then rerank the candidates with a more expensive model that scores (query, passage) pairs jointly. The reranker consistently improves the final top-5 by catching relevant documents that were ranked poorly by vector similarity alone.

Building on ArXiv papers forces you to work with real documents that have structure: abstract, introduction, methodology, results, conclusion. Your chunking and retrieval strategy must account for that structure.`,

  pre_flight: `Download 20 ArXiv papers in a domain you care about. Install PyMuPDF or pdfminer for PDF extraction. Have a vector database running (Qdrant local or pgvector). Know the HyDE pattern: generate a hypothetical answer, embed it, retrieve. Know multi-query: generate 3-5 paraphrases, retrieve for each, merge. Have a reranker available: Cohere Rerank API or a local cross-encoder from sentence-transformers.`,

  mastery_questions: [
    `You implement HyDE for your paper assistant. Instead of embedding the user's question, you ask GPT-4o-mini to write a hypothetical answer paragraph, then embed that. Why does this improve retrieval? A question and a relevant document passage are in different "spaces" in the embedding model's training distribution. Questions are short, interrogative, often lacking the technical vocabulary of the answer. A hypothetical answer is in the same distributional space as document passages — it contains the vocabulary, structure, and concepts that a real answer would have. The embedding similarity between the hypothetical answer and the actual relevant passage is higher than between the question and the passage.`,

    `Your multi-query retrieval generates 4 paraphrases of the user's question and retrieves top-20 for each. After deduplication, you have up to 80 candidates. You pass all 80 to the reranker. How does the reranker handle 80 candidates and what is the latency implication? The reranker scores each (query, candidate) pair independently. For Cohere Rerank, this is a single API call with the query and all 80 documents — latency is roughly proportional to total text. For a local cross-encoder, it is 80 forward passes which can be batched on GPU. Expected latency: Cohere at 150-300ms for 80 docs, local cross-encoder at 200-500ms depending on hardware. The reranker is the latency bottleneck in the pipeline. Balance candidate set size against reranker latency.`,

    `A chunk from one of your papers says "Our method achieves a 23% improvement over the baseline." Out of context, this is useless. How do contextual chunk headers fix this? Before embedding the chunk, prepend: "Paper: Attention Is All You Need (Vaswani et al., 2017) | Section: Results | Summary: The paper proposes the Transformer architecture and demonstrates its effectiveness on translation tasks. | Chunk: Our method achieves a 23% improvement over the baseline." The embedding now captures the context. When retrieved, the model reading this chunk knows which paper, which section, and what the broader claim is.`,

    `Your RAGAS evaluation shows Context Recall of 0.65 — only 65% of the information needed to answer the questions is present in the retrieved context. You are already retrieving top-10 chunks. How do you improve recall without just retrieving more? Better chunking: if your chunks cut off in the middle of a thought, increase chunk size or add overlap. Better retrieval: switch from single-query to multi-query retrieval — your current 35% miss rate may be from vocabulary mismatch that multi-query addresses. Better coverage: check whether the 35% missing information is in papers you have not indexed. Recall is bounded by index coverage — if the answer is not in any indexed document, no retrieval improvement helps.`,

    `You want to add citation tracking: every answer the assistant gives should cite the specific papers and sections it used. How do you implement this? Store the source metadata (paper title, authors, section, page number) alongside each chunk in the vector database payload. When chunks are retrieved and included in the prompt, also pass their metadata. Instruct the model to cite sources using a specific format: "[Title, Section, Page]". Parse the model's citations from the response and verify they correspond to actual retrieved chunks — reject any citation for a source that was not in the context. This prevents hallucinated citations.`,
  ],

  common_mistakes: [
    `Using a fixed chunk size across all document types. ArXiv abstracts are 200 words. Methodology sections can be 2000 words. Use structure-aware chunking: split at section boundaries first, then split oversized sections at paragraph boundaries. Never cut across sentence boundaries.`,

    `Generating HyDE hypothetical answers without a temperature cap. A high-temperature hypothetical answer introduces irrelevant vocabulary that degrades retrieval quality. Use temperature 0.2-0.4 for hypothetical answer generation. The goal is a plausible, vocabulary-stable answer, not a creative one.`,

    `Running RAGAS evaluation without a golden test set. RAGAS needs questions, correct answers, and the source documents that support each answer. If you evaluate without ground truth, you can only measure faithfulness and answer relevance (whether the answer uses the retrieved context), not whether you retrieved the right context in the first place.`,

    `Including all 20 papers in the context window instead of using retrieval. If you have a 128k context window and 20 short papers, you might fit them all. This is not RAG — this is "stuff everything in." It is more expensive, often less precise (the model has to find the needle in a large haystack), and does not scale. RAG is the right architecture for document search even when the documents fit in context.`,

    `Not filtering retrieved chunks by minimum similarity score. If the user asks a question that has no answer in the indexed papers, your system should say so instead of hallucinating an answer from low-confidence retrievals. Add a threshold: if no chunk exceeds 0.6 cosine similarity, return "I could not find relevant information in the indexed papers."`,
  ],

  debug_help: `The hardest RAG failure to diagnose is when the model gives a plausible answer that is wrong or fabricated. It looked like it worked. To catch this, always log the retrieved chunks alongside the answer. Check: is the answer supported by the retrieved chunks? If not, the model hallucinated. If the answer is not in any chunk, the retrieval failed. RAGAS's "faithfulness" metric automates this check — it asks the model whether each claim in the answer is supported by the provided context. Run faithfulness evaluation on every answer during development.`,

  ai_assist: `Use Claude to help you write the RAGAS golden test set — given a paper title and abstract, ask it to generate 5 questions with correct answers that can be answered from the paper. Use those question/answer pairs as your ground truth eval set. Review every generated pair: some will be unanswerable from the abstract alone. Modify or discard those. The eval set is only useful if the answers are verifiably correct.`,

  stretch: [
    `Add a citation graph feature: when the assistant cites Paper A, also retrieve and surface the papers that Paper A cites that are relevant to the query. This gives the user a breadcrumb trail through the literature.`,
    `Implement conversational RAG: maintain conversation history and reformulate queries in light of previous turns. "Tell me more about the methodology" should resolve "methodology" relative to the paper discussed in the previous turn.`,
    `Compare three chunking strategies (fixed-size, sentence-aware, section-aware) on the same 20 papers and the same 20 eval questions. Report precision@5 and Context Recall for each. Document which strategy wins and why.`,
  ],
});

rewriteWeek("ai-engineering", 12, {
  context: `You have built RAG systems. Now you need to know whether they work. The answer is not "I tried it and the answers seemed reasonable." The answer is numbers: retrieval precision, context recall, answer faithfulness, answer relevance. This week you build a RAG eval CLI that runs a complete evaluation pipeline from a config file and outputs a structured report.

A golden test set is the foundation. Without ground truth — specific questions with known correct answers and known source documents — you cannot measure recall or faithfulness. Building the test set is manual work and it is the most important investment you make in eval quality. Spend time on it. Include questions where the answer is easy to find, questions where the answer requires combining two chunks, and questions that have no answer in the corpus (to test your system's ability to abstain).

Retrieval metrics measure whether your system is finding the right documents. Recall@k measures what fraction of relevant documents appear in the top-k results. Precision@k measures what fraction of the top-k results are actually relevant. NDCG (Normalised Discounted Cumulative Gain) accounts for position — a relevant document at rank 1 contributes more than one at rank 5. MRR (Mean Reciprocal Rank) measures where the first relevant document appears.

Answer metrics measure whether the final answer is correct. Faithfulness measures whether the answer's claims are supported by the retrieved context — it catches hallucinations. Answer relevance measures whether the answer addresses the question asked. Correctness requires ground truth: does the answer contain the information in the expected answer?

The CLI architecture makes evaluation repeatable and configurable. Different config files test different pipeline variants: different chunking strategies, different top-k values, different models. Running the CLI on every code change tells you whether a change improved or degraded quality.`,

  pre_flight: `Build a golden test set of 20 questions from your paper corpus. For each question: the question text, the correct answer, and the IDs of the document chunks that support the answer. Install ragas (optional) or implement metrics manually. Understand what faithfulness measures: for each claim in the model's answer, is it supported by the retrieved context? Know how to write a YAML config file and load it with PyYAML.`,

  mastery_questions: [
    `Your eval pipeline measures faithfulness and gets 0.72. What does that number mean and what do you investigate? 72% of the claims in the model's answers are supported by the retrieved context. The remaining 28% are either hallucinated or drawn from the model's training data rather than the provided documents. Investigate: which question types have low faithfulness? Are they questions where the answer is not in the corpus (so the model fills in from training data)? Are they questions where the answer is in the corpus but was not retrieved? Faithfulness below 0.8 is a signal that either retrieval is missing relevant content or the model needs stronger instructions to stay grounded in the provided context.`,

    `You measure Recall@10 of 0.78. This means 22% of questions are missing relevant context in the top-10 results. You increase k to 25 and Recall@10 rises to 0.91. Is this improvement free? No — more context means longer prompts, more tokens, higher cost, potentially lower answer quality if the model is confused by irrelevant context among the 25 retrieved chunks. The right response is: investigate why 22% of questions miss at rank-10 before increasing k. Are they vocabulary mismatch failures (HyDE or multi-query would fix them)? Are they structural failures (the relevant chunk was split across two chunk boundaries)? Fix the root cause rather than working around it with more retrieval.`,

    `You add a new question to your golden test set and the question has no answer in the indexed documents. Your RAG system should say "I don't know" or "I couldn't find relevant information." How do you measure whether this abstention works correctly? Create a separate "no-answer" test subset. Measure abstention rate: what fraction of no-answer questions get a correct abstention vs a hallucinated answer. Target: above 90% abstention on no-answer questions. The abstention mechanism is typically a similarity threshold (if max similarity < threshold, return a canned "no answer" response). Tune the threshold against your no-answer subset before measuring.`,

    `Your eval CLI takes a YAML config with fields for chunk_size, overlap, top_k, reranker, model. You run it with three different chunk_size values: 256, 512, 1024. Describe how you structure the output to make comparison easy. Output a table with one row per config variant and columns for each metric: Recall@10, Precision@10, Faithfulness, Answer Relevance, avg cost per question, avg latency. Sort by the metric you care about most. Also store full results (per-question breakdown) in a JSON file so you can drill into specific failures. The summary table tells you which config wins; the per-question breakdown tells you why.`,

    `You want to run the eval pipeline on every pull request in CI. The full eval over 20 questions with retrieval plus LLM-as-judge costs $0.40 and takes 3 minutes. Is this acceptable for CI? It depends on your PR frequency and budget. At 20 PRs/day, that is $8/day in eval costs. Mitigation: run the full eval only on PRs that touch the RAG pipeline code. For all other PRs, run a 5-question smoke test ($0.10, 45 seconds). Tag PRs with [rag-change] to trigger the full eval. This gating strategy balances coverage against cost.`,
  ],

  common_mistakes: [
    `Building a golden test set only from the easiest documents in your corpus. If all test questions are about the most clearly written papers and none are from the dense or ambiguous ones, your eval will overestimate real-world performance. Include hard cases deliberately.`,

    `Using the same model as both the generator and the judge. If GPT-4o generates the answers and GPT-4o judges them, the judge may be lenient about the generator's characteristic failure modes. Use a different model (or Claude) as the judge when possible, or use deterministic metrics that do not require a judge model.`,

    `Treating the RAGAS score as a single number. RAGAS reports multiple metrics. A system with 0.95 faithfulness and 0.45 answer relevance is not "good" — it is grounded but off-topic. Report and track all metrics. Only aggregate them into a single score for dashboard display, not for decision-making.`,

    `Not re-running the baseline after changing the pipeline. If you add multi-query retrieval and the eval score improves, but you changed the chunking strategy at the same time, you do not know which change drove the improvement. Change one variable at a time.`,

    `Forgetting that eval costs money. A pipeline with LLM-as-judge over 20 questions, run 50 times during development, is not free. Budget your eval usage the same way you budget production usage.`,
  ],

  debug_help: `The most common eval pipeline failure is the judge returning an unexpected format that breaks score parsing. Even with structured output, edge cases appear — the model returns a nested object when you expected a flat one, or a string where you expected a number. Add schema validation on every judge response before processing it. Log raw judge responses to a file during development so you can inspect failures without re-running the entire pipeline. If more than 5% of judge calls fail schema validation, your judge prompt needs tightening.`,

  ai_assist: `Use Claude to help you write the judge prompt for faithfulness evaluation — describe what faithfulness means (each claim in the answer is supported by the provided context), the input format (answer + retrieved chunks), and the output format (per-claim list with supported/unsupported, plus an overall score). Ask it to draft the judge prompt and the Pydantic output schema. Review and modify both before using them in your pipeline.`,

  stretch: [
    `Build a regression detector: store eval results in a SQLite table keyed by pipeline version (git commit hash). After every run, compare to the previous version and flag any metric that dropped by more than 0.05. Surface the regression as a warning in the CLI output.`,
    `Add an adversarial test subset: questions designed to elicit hallucinations, leading questions with false premises, and questions that require the model to disagree with the retrieved context. Measure faithfulness separately on adversarial questions.`,
    `Publish your eval results in a Markdown report that is automatically generated by the CLI. Include a comparison table if multiple config runs exist. This becomes the documentation for your RAG system's known quality level.`,
  ],
});

rewriteWeek("ai-engineering", 13, {
  context: `An LLM that thinks step by step and can call tools is an agent. The basic loop is simple: observe the situation, reason about what to do next, take an action, observe the result, repeat until done. ReAct (Reason + Act) formalises this: the model explicitly alternates between reasoning tokens ("I need to find the cost comparison between GPT-4o and Claude Sonnet") and action tokens ("search: GPT-4o vs Claude Sonnet cost 2025"). The interleaved structure keeps the model's reasoning grounded in the actions it has taken.

This week you build a researcher agent. Given a research question, it searches, reads, synthesises, and produces a structured report. The agent loops — each tool call results inform the next — until it has enough information to write the final report. Building it forces you to confront every practical challenge in agent development: loop control, context management, tool failure handling, and knowing when the agent has enough information to stop.

Plan-then-execute is the alternative architecture. Instead of interleaving reasoning and action, the agent first produces a complete plan (a sequence of steps), then executes the plan deterministically. This architecture is more predictable but less adaptive — if step 3 fails, the plan breaks. ReAct is more adaptive but harder to observe and debug. Understanding when to use each is an architectural judgment call.

Reflection adds a self-critique step. After completing a draft answer, the agent sends it to itself (or a separate model instance) with the prompt "what is wrong or missing in this response?" The critic's feedback is incorporated into a second pass. This consistently improves output quality at the cost of additional tokens and latency. For research and writing tasks, the improvement is usually worth it.

Context management is the hard engineering problem in agents. Each tool call adds to the conversation history. A 10-step agent on a large research question can accumulate 30k tokens of context. You need a strategy: summarise old tool results, drop low-relevance results, enforce a maximum context budget.`,

  pre_flight: `Understand the ReAct paper's core idea: interleaving Thought: and Action: and Observation: turns in the agent loop. Have your web search tool ready (Serper API, Brave Search API, or Tavily). Have your earlier read_file and grep tools available. Know how to implement a loop with a maximum iteration count. Understand the difference between the conversation history (all messages) and the agent's working memory (what it currently knows).`,

  mastery_questions: [
    `Your researcher agent is on step 8 of a research task. The context window has 45k tokens of conversation history. The model starts hallucinating details from its training data instead of from the retrieved sources. What is happening and how do you fix it? The context is overwhelming the model's ability to stay grounded. When context approaches the model's practical limit (typically 60-70% of the stated window), quality degrades. Fix: implement a context compression step that runs every 3 iterations. Summarise the last 3 tool results into a compact paragraph, replace the verbose tool result messages with the summary, and drop the original messages. This keeps the context size bounded without losing the information.`,

    `The agent calls a search tool and receives 10 results. It reads all 10 in full and includes them in its next reasoning step. The context grows by 8000 tokens on this one step. What should you have done instead? Two-stage information gathering: first scan the 10 results (title + snippet only), then select the 2-3 most relevant to read in full. Implement a \`get_snippets(query)\` tool that returns title + 150-char snippet for each result, and a separate \`read_url(url)\` tool that returns the full content. The agent decides which URLs to read in full after seeing the snippets. This reduces context growth by 70-80% without losing relevant information.`,

    `You want to implement reflection: after the agent drafts its report, it critiques its own draft. How do you structure this as code without a separate model instance? Add a final step to the agent loop: call the model with the draft report and the prompt "You are a critical reviewer. What is incomplete, inaccurate, or unclear in this report? Be specific." The response is a critique. Call the model again with the draft plus the critique and ask it to revise. This is a two-pass pattern implemented in one model instance. A separate instance is only needed if you want the critic to have different instructions or a different model (e.g., use Claude to critique a GPT-4o draft).`,

    `Your agent loop has a maximum iteration count of 15. The agent reaches step 15 without finishing its research task. What happens? You return whatever the agent has produced so far — a partial report with a note that the maximum iteration count was reached. Do not silently truncate. Do not throw an exception. Log the final state of the agent's context so you can review what it was doing when it ran out of iterations. Afterwards, investigate: was 15 iterations enough for typical research questions? Did the agent waste steps on unproductive searches? Adjust the limit and the agent's search strategy accordingly.`,

    `You compare your ReAct agent to a plan-then-execute agent on the same research task. The ReAct agent produces a better answer. The plan-execute agent is easier to debug. Walk through the trade-off. ReAct adapts: if an early search returns nothing useful, the agent changes direction. If a source contradicts a prior assumption, the agent updates its reasoning. Plan-execute cannot adapt mid-execution — a failed step must be handled specially. ReAct is harder to debug because the reasoning chain is implicit in the model's outputs. Plan-execute makes the plan explicit and observable. For research tasks with uncertain information availability, ReAct wins. For tasks with predictable steps (data pipeline, multi-step form filling), plan-execute wins.`,
  ],

  common_mistakes: [
    `Not enforcing a maximum iteration limit. An agent without a loop guard can run indefinitely on edge cases. Always have a hard cap. Log when the cap is hit.`,

    `Including the full content of every tool result in the conversation history. This bloats the context exponentially. Store full tool results in a separate working memory dict and include only summaries in the conversation history. Retrieve full results from working memory when needed.`,

    `Designing the agent's stop condition as "when the model says it is done." The model may declare completion prematurely. Have the agent produce a structured output on completion: \`{"status": "complete", "report": "..."}\`. Parse this and verify the report meets minimum criteria (word count, required sections) before accepting it.`,

    `Not separating the agent loop from the tool implementations. Keep the loop logic in one module and the tool implementations in separate modules. This makes it easy to swap tools, test tools independently, and add new tools without touching the loop.`,

    `Running the full agent during development without caching search results. If you iterate on the loop logic, you want the same search results each time for reproducibility. Cache all tool results to disk with a content-addressed key. During development, replay from cache. In production, fetch live.`,
  ],

  debug_help: `The hardest agent bug to catch is a reasoning loop where the agent keeps searching for information it already has. It retrieved the answer in step 3, but by step 8 it has "forgotten" it because the relevant tool result is buried deep in the context. Fix: add a working memory module — after each tool result, extract key facts into a structured working memory dict that is always visible at the top of the context. The agent can then check its working memory before making another search call. If the answer is already there, it does not need to search again.`,

  ai_assist: `Use Claude to help you write the ReAct prompt — the system prompt that teaches the model to alternate Thought:/Action:/Observation: turns and to call tools using a specific format. Describe the desired behaviour and the tool list, and ask it to draft a system prompt. This is a prompt engineering task where AI assistance is appropriate. Test the drafted prompt with 5 research questions before committing to it.`,

  stretch: [
    `Add a planning step before the ReAct loop: the agent first generates a 5-step research plan, then executes it with ReAct, adapting when steps fail. Compare this hybrid to pure ReAct on 5 research questions.`,
    `Implement a second-agent critic that runs after the first agent completes. The critic reads the report and checks for: unsupported claims, missing important angles, logical inconsistencies. Have the first agent revise based on the critique.`,
    `Add cost tracking to the agent loop: log the token cost of each step. At the end, produce a cost breakdown by step type (reasoning, search, reading, writing). Use this to identify the most expensive steps and optimise them.`,
  ],
});

rewriteWeek("ai-engineering", 14, {
  context: `Single-turn agents answer one question and stop. Most useful agents need to remember: what the user asked yesterday, what topics have already been covered, who the user is and what they care about. Memory is the engineering problem that separates a demo agent from a daily-use one.

The conversation buffer is the simplest memory: append every turn to the history and pass it all to the model. It works until the context window fills, which happens faster than most people expect with verbose agents. Summarisation memory addresses this: periodically condense older turns into a compact summary. The model loses some detail but retains the arc of the conversation.

Vector-based long-term memory stores every turn as an embedding. When starting a new conversation, you retrieve the most relevant prior interactions based on the current topic. This gives the agent access to months of history without paying to include it all in the context. The technical challenge is retrieval quality — you want to retrieve the turns that are actually relevant, not just semantically adjacent ones.

Entity memory is a structured alternative: extract people, places, projects, and preferences from the conversation and maintain them as a structured record. When the conversation mentions "the project we discussed Tuesday," the entity memory lets you look up what project that was, when you last discussed it, and what conclusions were reached. Entity memory is expensive to build correctly but extremely powerful when it works.

The personal research librarian you build this week uses all of these. It helps you research multiple topics across sessions, remembers what you have already found, and avoids repeating research you have already done. That requires working memory (this session), long-term memory (across sessions), and entity memory (topics, sources, conclusions).`,

  pre_flight: `Understand the four memory types: buffer (append all), summary (compress old turns), vector (retrieve relevant history), entity (structured records of named things). Have SQLite set up for persistent storage across sessions. Know how to serialise and deserialise conversation history to/from JSON. Review the tiktoken library for counting tokens so you know when to trigger summarisation.`,

  mastery_questions: [
    `Your conversation buffer has accumulated 80k tokens of history. Your model has a 128k context window. You decide to summarise the oldest 40k tokens. What does the summarisation prompt look like and what information must be preserved? The prompt: "Summarise the following conversation history. Preserve: (1) specific decisions made, (2) sources cited and their key findings, (3) open questions that were not resolved, (4) any explicit user preferences or constraints stated. Be concise — the summary should be under 1000 tokens." The resulting summary replaces the 40k token history. Test the summary by verifying the agent can correctly answer questions about events in the summarised section.`,

    `A user asks your research librarian "continue our discussion about diffusion models from last week." The agent has never seen this message before. Walk through how vector memory retrieval would handle this. Embed the query "diffusion models." Search the long-term memory store (all previous turns, stored as embeddings) for the most similar turns. Return the top 10 most relevant prior turns — these will include the previous discussion about diffusion models. Add them to the context as "Relevant prior context:" and then process the current query. The agent can now respond as if it remembers the prior discussion because the relevant turns are in its context.`,

    `You implement entity extraction: after every conversation turn, you ask a lightweight model to extract entities (topics researched, sources cited, conclusions reached, open questions). The entities are stored in a structured database. What is the failure mode of this approach? The extraction model misses entities or extracts incorrect ones. A source cited as "Chen et al. 2024" might be stored as "Chen 2024" in one turn and "the Chen paper" in another — two entries for the same source. Entity disambiguation is hard. You also need to handle updates: if a conclusion from last week is superseded by new information this week, the entity record needs to be updated, not just appended. Plan for these failure modes before scaling entity memory.`,

    `The user asks a question that has already been researched and the answer is in long-term memory. Your agent retrieves the relevant prior research and gives the answer from memory rather than re-searching. How do you verify the agent is using memory correctly and not hallucinating? Add a citation requirement: when the agent uses prior memory, it must cite the session date and topic of the remembered research. Parse the citation and verify it matches an actual record in the long-term memory database. If the cited record does not exist, the agent is hallucinating a memory. This is the same faithfulness check as in RAG, applied to the memory layer.`,

    `You want the research librarian to proactively surface relevant prior research when starting a new conversation. The user says "I want to research transformers in NLP." Before the user makes any specific requests, the agent should surface: "I notice you researched attention mechanisms in April. That work is highly relevant here. Would you like me to start from where we left off?" How do you implement this proactive retrieval? On every new conversation start, embed the initial user message and retrieve the top 5 most relevant prior sessions from long-term memory. If any prior session has a similarity score above 0.7, proactively offer to incorporate it. This requires storing session-level summaries (not just turn-level) with their own embeddings.`,
  ],

  common_mistakes: [
    `Storing conversation history as raw strings rather than structured objects. A raw string loses the role information (user vs assistant), timestamps, and any metadata. Store each turn as a dict with role, content, timestamp, and any tool calls or results. Serialise to JSON.`,

    `Not testing memory retrieval across a session boundary. Most developers test within a single session where everything is in the buffer. The interesting failures happen when starting a new session and relying on long-term retrieval. Test specifically: end a session, start a new one, ask a question that requires prior context, and verify the retrieval works.`,

    `Letting the long-term memory grow unboundedly. After six months, a daily-use agent accumulates millions of turns. Add a retention policy: keep full turns for 30 days, summaries for 6 months, entity records indefinitely. Prune old full turns on a schedule.`,

    `Using the same embedding model for long-term memory storage and retrieval forever. If you switch embedding models, old vectors are in a different space and semantic search breaks. Store which model generated each embedding alongside the vector. When switching models, re-embed all stored turns (expensive but necessary).`,

    `Not considering privacy implications of long-term memory. A research librarian that stores everything indefinitely may accumulate sensitive information. Add a "forget" mechanism: the user can request deletion of specific sessions, topics, or all data. Implement it at the storage layer before deployment.`,
  ],

  debug_help: `The hardest memory bug is "ghost memory" — the agent behaves as if it remembers something it was never told. This happens when the vector retrieval brings back loosely related turns that the agent misinterprets as directly relevant. Debug by logging every retrieved memory chunk alongside the similarity score. If retrieved chunks have scores below 0.65, they are probably false positives. Add a minimum similarity threshold for including retrieved memory in the context. Anything below the threshold should not be included even if it is the top result.`,

  ai_assist: `Use Claude to help you design the entity extraction prompt — describe what entities matter for a research librarian (topics, sources, conclusions, open questions) and ask it to write a prompt that extracts them in a structured JSON format. Also ask it to design the database schema for entity storage. Review both carefully: entity schemas are hard to change after you have stored data against them.`,

  stretch: [
    `Implement a "memory audit" command that shows the user a summary of everything the agent remembers about them: all entities, all topics researched, all sources cited. Let the user delete specific entries.`,
    `Add a "memory quality score" that runs weekly: for each entity in the database, verify it is still accurate by asking the model to rate its confidence in the entity given the most recent context. Flag low-confidence entities for review.`,
    `Implement cross-topic connection finding: periodically scan all stored entities and surface connections the user might not have made — two topics that share common sources, or two conclusions that are in tension with each other.`,
  ],
});

rewriteWeek("ai-engineering", 15, {
  context: `Every agent you build has tools. Right now those tools are Python functions in the same codebase as the agent. Model Context Protocol (MCP) is the emerging standard for decoupling tool implementations from agent clients. Instead of writing tool code inside your agent, you run a separate MCP server process that exposes tools, and your agent client connects to it. This week you build your own MCP server with 8-10 tools over your personal data.

The protocol itself is JSON-RPC over either stdio (subprocess communication) or HTTP with Server-Sent Events. The client sends a tools/list request to discover what tools are available. When the agent calls a tool, the client sends a tools/call request with the tool name and arguments. The server executes the tool and returns the result. The protocol is simple. The value is in standardisation: any MCP-compatible client (Claude Code, Cursor, custom Python agent) can connect to any MCP server without modification.

Server primitives are three things: tools (callable functions with inputs and outputs), resources (readable data like files, database tables, or API endpoints), and prompts (parameterised prompt templates that the server exposes). Most practical MCP servers focus on tools, but resources and prompts become important when you want to expose structured data or reusable instructions.

Building your own MCP server forces you to design a clean tool interface. The tool schema — name, description, input schema — is what the client model reads to decide how to use the tool. A tool that is useful when called from the command line but hard to call correctly via MCP usually has a schema design problem: too many required parameters, parameters that depend on implicit context, or a description that does not tell the model when to use it.`,

  pre_flight: `Read the MCP specification: the tools, resources, and prompts primitives. Install the mcp Python SDK: \`pip install mcp\`. Understand the difference between stdio transport (the server runs as a subprocess, communicating via stdin/stdout) and HTTP+SSE transport (the server runs as an HTTP service). Know which clients support which transports. Plan 8-10 tools over your own data: file management, note search, task tracking, calendar queries — whatever you actually use daily.`,

  mastery_questions: [
    `You build an MCP server with a \`search_notes\` tool. A client agent calls it with \`query="transformer architecture"\` and gets back 10 results as a JSON list. The agent then calls \`read_note\` for each result — 10 sequential calls. How would you redesign the server to reduce round trips? Add a \`search_and_read_top_notes\` tool that combines both operations: search, then automatically read the top 3 results and return them in a single response. Alternatively, add a \`count\` parameter to \`search_notes\` and a \`include_content\` boolean. When include_content is true, the tool returns full content for the top results. Design tools for the way agents actually use them, not just for what is technically cleanest.`,

    `Your MCP server exposes a \`send_email\` tool. You connect it to Claude Code. Claude calls \`send_email\` as part of an agentic task without asking you first. You did not intend for it to send the email autonomously. How should the tool have been designed to prevent this? Side-effect tools should implement a dry_run parameter: when dry_run=True, the tool returns what it would have done without actually doing it. The tool description should explicitly state: "Sends a real email. Always call with dry_run=True first and confirm the proposed action before setting dry_run=False." This shifts the confirmation responsibility to the description — the model reads it and follows the pattern.`,

    `You expose a resource via your MCP server: a database table of your tasks. The client can read the resource with \`resources/read\`. What does the resource type add beyond a tool that queries the database? Resources have a URI scheme and MIME type, which allows clients to index and cache them. A resource is something you read repeatedly with the same structure; a tool is something you call with parameters for a specific computation. A task database is a good resource because the schema is stable and clients benefit from knowing its structure upfront. A "calculate progress toward goal" function is better as a tool because it requires specific parameters and produces a computed result.`,

    `You want your MCP server to support both Claude Code (which uses stdio transport) and a custom web app (which uses HTTP+SSE transport). How does the MCP Python SDK handle this? The mcp SDK separates the server logic from the transport. You write your tools once as decorated functions. Then you create the server with either \`mcp.run(transport="stdio")\` for CLI clients or \`mcp.run(transport="sse", port=8080)\` for HTTP clients. The same tool code works with both transports. The switching is at the process entry point, not in the tool implementations.`,

    `After using your personal MCP server for a week, you notice that the agent almost never calls three of your tools. What do you investigate? First: are those tools described in a way that helps the model know when to use them? A tool called \`manage_projects\` with a description of "manages projects" will rarely be called because the model does not know when it is appropriate. Second: are those tools redundant with other tools? If you have both \`list_tasks\` and \`get_all_tasks\`, the model may consistently prefer one over the other. Third: do those tools solve a real problem the agent encounters in your actual workflow? If not, the tools are solving a problem that does not arise, and removing them cleans up the interface.`,
  ],

  common_mistakes: [
    `Writing tool descriptions that describe what the tool does technically ("queries the SQLite database") rather than what problem it solves and when to use it ("retrieves tasks filtered by due date and priority. Use this when the user asks about upcoming deadlines or overdue items."). The model reads descriptions to decide when to call tools. Technical accuracy without usage guidance produces low-quality tool calling.`,

    `Building tools with too many required parameters. A tool with 8 required parameters will rarely be called correctly because the model must know all 8 values at call time. Prefer tools with 1-3 required parameters and sensible defaults for the rest. Required parameters should be things the model always has context for.`,

    `Not versioning the server. If you change a tool's interface (rename a parameter, change its type), existing prompts and workflows that depend on the old interface break. Use semantic versioning for your MCP server and maintain a changelog.`,

    `Exposing tools that read arbitrary file paths. Your MCP server runs with your permissions. An agent that calls read_file("~/.ssh/id_rsa") reads your private key. Restrict the allowed paths in all file-related tools. Accept only paths within a designated working directory.`,

    `Not testing the server with a real MCP client before considering it done. The server might work when called directly from Python but fail in subtle ways when called via the MCP protocol. Test with Claude Code or the MCP inspector tool: run the server, connect a client, and exercise every tool manually.`,
  ],

  debug_help: `The most common MCP server bug is a tool that returns a Python object instead of a serialisable type. The MCP protocol transmits JSON. If your tool returns a datetime, a numpy array, or a custom object, the serialisation fails with a cryptic error on the client. Fix: ensure every tool returns a string, a dict of primitives, a list of primitives, or None. Convert datetimes to ISO strings. Convert numpy arrays to lists. Convert custom objects to dicts explicitly. Add a serialisation test for every tool: pass its return value through json.dumps and catch TypeError before deploying.`,

  ai_assist: `Use Claude to help you write the tool schema descriptions for all 8-10 of your MCP server tools. Describe each tool's purpose, parameters, and usage scenarios, and ask it to write the description string that the model will read. Compare its descriptions against your own intuition. Good descriptions are specific about when to use the tool and what it returns. Vague descriptions produce poor tool calling.`,

  stretch: [
    `Publish your MCP server configuration to a GitHub Gist or repo with a README explaining how to connect it to Claude Code. This turns your personal server into a reusable component others can run with their own data.`,
    `Add authentication to the HTTP+SSE transport: generate a bearer token and require it in the Authorization header. Without this, anyone who can reach your MCP server's port can call your tools.`,
    `Build a "meta tool" on your MCP server: a tool that returns the list of available tools with detailed usage examples. Agents can call this at the start of a session to orient themselves without relying solely on the tool descriptions in the initial tool list.`,
  ],
});
