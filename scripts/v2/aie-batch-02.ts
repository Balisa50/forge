import { rewriteWeek } from "../rewrite-week";

// ai-engineering W6-W10

rewriteWeek("ai-engineering", 6, {
  context: `Language models are text generators. When you need structured data — a JSON object, a list of extracted entities, a form with typed fields — you cannot rely on asking nicely and hoping the model formats it correctly. JSON mode helps. Schema-enforced function calling helps more. The instructor library makes the whole thing reliable. This week you build an invoice parser that turns images of real invoices into structured Pydantic objects with a measurable success rate.

The fundamental insight is that Pydantic models serve two purposes simultaneously: they validate the output you receive, and they define the schema that tells the model what to produce. When you pass a Pydantic model to instructor, it extracts the JSON schema from the model definition, constructs the appropriate tool-use call or response format parameter, and automatically retries if the response fails validation. You write the model once and get both validation and structured prompting from it.

Failure modes in structured output are important to understand because they occur in production even with the best models. The model invents a field that does not exist in your schema. It puts a string where you expected a number. It drops a required field when the source document is ambiguous. It returns a list when you expected a single object. Each of these requires a different mitigation strategy.

The invoice parser is a strong portfolio project because it solves a real business problem. Every company processes invoices. The ability to extract structured data from unstructured documents — receipts, contracts, medical records, shipping manifests — is high-value and broadly applicable. Build it well, measure it honestly, and you have something worth showing.`,

  pre_flight: `Install instructor: \`pip install instructor\`. Install pdf2image or PyMuPDF for PDF handling. Get 5 real invoices — use your own email receipts, or generate mockups with an online invoice generator. Understand the difference between JSON mode (guarantees parseable JSON, not schema compliance) and tool calling (forces specific schema structure). Read the Pydantic v2 Field documentation for validators and constraints.`,

  mastery_questions: [
    `You define an Invoice Pydantic model with a \`line_items: list[LineItem]\` field. The invoice image has three items but the model returns only two. Is this a structured output failure or a vision failure? It is a vision failure — the model did not read all items from the image. The structured output layer correctly returned a list; it just had fewer items than the source document. How do you detect this? Add a validation step: compare the model's subtotal (sum of line_items unit_price times quantity) against the extracted subtotal field. If they differ by more than 1%, flag the result for human review. Structured outputs and vision accuracy are separate failure modes.`,

    `instructor's auto-retry fires when validation fails. What does it send to the model on the retry? It sends the original prompt plus the validation error message as additional context. For example: "ValidationError: line_items[0].unit_price: expected float, got string '$45.00'". The model uses that error to correct its response. This is why instructor's retry pattern works better than a simple retry loop — the model receives diagnostic information, not just a blind retry request.`,

    `Your invoice parser succeeds on 4 out of 5 invoices. The 5th invoice has a handwritten amount and an unusual format. What do you report? Report all of this in your accuracy measurement: 4/5 structured success rate (80%), and classify the failure reason — vision failure (could not read handwriting) vs schema failure (returned wrong types) vs hallucination (invented fields not in the document). The failure taxonomy matters more than the single number. A 80% rate with all failures from one specific edge case is a very different product quality than 80% with random scattered failures.`,

    `You want to add a \`confidence: float\` field to your LineItem model that the model populates with its own confidence in each extracted value. Is this a good idea? It is tempting but problematic. LLMs are not calibrated confidence estimators. A model that returns confidence 0.95 for a field it hallucinated is worse than no confidence estimate because it misleads downstream logic. Better approach: use a cross-check against the document. If the extracted total equals the sum of line items, confidence in those fields is higher. If it does not, flag the discrepancy explicitly rather than relying on the model's self-reported confidence.`,

    `You are comparing instructor with native function calling without instructor. What does instructor actually add beyond what the OpenAI SDK already provides for function calling? Three things: (1) automatic schema extraction from Pydantic models, so you do not have to manually write the JSON schema, (2) automatic retry with validation error feedback when the model returns an invalid response, (3) a consistent interface that works across OpenAI, Anthropic, and other providers. Without instructor, you write the schema manually, parse the response manually, and write your own retry logic. Instructor reduces boilerplate but you should understand what it is doing underneath.`,
  ],

  common_mistakes: [
    `Defining overly strict Pydantic constraints on fields from noisy real-world documents. An invoice might have "N/A" for a tax field. If your model requires \`tax: float\`, that fails. Use \`Optional[float] = None\` for fields that may legitimately be absent. Real-world document parsing requires tolerance.`,

    `Not measuring the success rate. Running the parser on 5 invoices and reporting "it works" is not engineering. Measure: structured output success rate, field-level accuracy (correct vendor name, correct total), and failure reason taxonomy. Document all three.`,

    `Using JSON mode instead of function calling / instructor for complex nested schemas. JSON mode guarantees parseable JSON but not schema compliance. For a schema with nested objects and typed arrays, use function calling or instructor. JSON mode is fine for flat, simple structures.`,

    `Sending large PDF pages as full-resolution images. Vision models have context limits and image tokens are expensive. Resize invoice images to 1024x1024 or smaller before encoding. High resolution rarely adds extraction accuracy for text-dense documents and significantly increases cost.`,

    `Not logging the raw model response alongside the parsed result. When instructor retries fail and you fall through to an error, you need to know what the model actually returned. Log the raw completion alongside every structured output attempt.`,
  ],

  debug_help: `The most confusing instructor error is \`MaxRetriesError\` — instructor retried the maximum number of times and still got an invalid response. Debug by printing the last raw response and the validation error that triggered the retry. Usually it is one of three things: (1) the Pydantic model has a constraint the model consistently cannot satisfy given the document content, (2) the image quality is too low for the model to read specific fields, (3) the field description in the Pydantic model is ambiguous. Fix the constraint or the field description, not the retry limit. Increasing retries without fixing the root cause just burns tokens.`,

  ai_assist: `Use Claude to help you design the Pydantic model schema for Invoice and LineItem — describe a typical invoice's fields and ask it to suggest the types, constraints, and Optional vs required designations. Review and modify the suggested schema before using it. This is legitimate model design assistance. Do not use Claude to write the instructor integration code — that is short, documented in the instructor library docs, and writing it yourself teaches you the API.`,

  stretch: [
    `Add support for multi-page invoices by splitting the PDF into pages, running the parser on each page, and merging the results. Detect which page contains the line items and which contains the header information.`,
    `Build a web interface using Streamlit that accepts a PDF upload and returns the parsed invoice as a formatted table plus a JSON download button. Measure the end-to-end latency from upload to display.`,
    `Compare the extraction accuracy of GPT-4o vision vs Claude 3.5 Sonnet vision on the same 5 invoices. Document which model does better on which invoice types and hypothesise why.`,
  ],
});

rewriteWeek("ai-engineering", 7, {
  context: `Two things determine whether an AI feature feels good to users: how fast it responds and how much it costs to operate. Streaming addresses the first — a response that appears word by word feels faster than a response that appears all at once after a 4-second wait, even if the total time is identical. Cost decomposition addresses the second — you cannot optimise what you do not measure.

This week you build a cost dashboard that reads from a SQLite database and visualises per-day cost, per-model cost, per-feature cost, and the top 10 most expensive individual requests. More importantly, you instrument one of your existing projects so that every API call writes a record to this database. By the end of the week, you have a live view of exactly what your AI usage costs.

Streaming is technically simple — the SDK provides an iterator that yields chunks — but the implementation details matter. Markdown rendering requires buffering: you cannot render a heading until you have seen the closing newline. Code blocks require detecting the opening triple-backtick before you know what language to highlight. JSON streaming requires handling partial JSON that may not be valid until the stream completes. Each of these is a real problem you will encounter in production.

The economics of AI APIs have a structure worth understanding deeply. Input tokens typically cost 3-4x less than output tokens. Prompt caching (available on both major providers) gives you a significant discount on cache-read tokens when the same prefix is reused. Model routing — using a smaller, cheaper model for simple queries — can reduce costs by 80% with minimal quality loss. These levers only work if you have instrumented your costs well enough to know where the money is going.`,

  pre_flight: `Understand Server-Sent Events (SSE): the HTTP chunked response format where each chunk is prefixed with "data: ". Know how to iterate over a streaming response with the OpenAI SDK: \`for chunk in stream: delta = chunk.choices[0].delta.content\`. Have a SQLite database set up. Know the cost per million tokens for gpt-4o, gpt-4o-mini, claude-3-5-sonnet, and claude-haiku — look them up on the provider pricing pages.`,

  mastery_questions: [
    `You stream a response and display it word-by-word. The model returns a markdown table. The table looks broken during streaming because the pipe characters appear one at a time before the row structure is complete. How do you handle this? Buffer the stream and detect when a markdown table is being generated — look for a line starting with | that is not yet complete. Hold the buffer until the entire row is assembled, then render. Alternatively, switch to non-streaming for table-heavy responses. The general principle: streaming and formatted rendering require explicit handling for structured content types. Document which content types you buffer.`,

    `Your cost dashboard shows that one feature (the RAG search endpoint) costs 10x more per query than all your other features combined. What do you investigate? Start with the database records for that feature: how long are the prompts? How many documents are being retrieved and included? Are you including the full document content or just the relevant chunk? A common cause is over-retrieval — sending 10 documents when the question only needs 2. Another cause is not implementing prompt caching for the system prompt that is identical across all queries. Check both.`,

    `Anthropic's prompt caching discounts tokens in the cached prefix by 90%. What does this mean in practice and when does it apply? If your system prompt is 2000 tokens and is identical across 1000 requests, without caching you pay for 2000 input tokens on every request. With prompt caching, after the first request, you pay cache-read token rates (roughly 10% of the input rate) for that 2000-token prefix. Over 1000 requests, this can save significant costs. The cache is invalidated after 5 minutes of the same prefix not being used. Effective use requires that your system prompt is stable and long — short or variable system prompts do not benefit.`,

    `You implement a model router that sends short queries to gpt-4o-mini and long or complex queries to gpt-4o. You expect a 60% cost reduction but only see 20%. Why might the router be underperforming? The router classification itself makes an API call (even if cheap), adding cost. More importantly, your "short query" heuristic may be misclassifying complex short queries as simple. Audit the router's decisions: log which queries went to which model and manually review a sample. Another possibility: the prompts that go to gpt-4o-mini are getting worse responses, so users are asking follow-up questions that increase total costs even if per-call costs are lower. Measure total session cost, not just per-call cost.`,

    `Your cost dashboard has a "top 10 most expensive requests" table. One request cost $0.84 — 40x the average. What do you want to know about it? The full prompt text (or a truncated preview), the completion text, the model, the feature that triggered it, the timestamp, and the token counts for input and output separately. A single expensive request is often caused by: (1) a very long user input that was not truncated before being included in the prompt, (2) a runaway generation where the model did not stop at the expected point (check finish_reason), (3) a loop that made the same call multiple times due to a bug. The database record should contain enough information to diagnose all three.`,
  ],

  common_mistakes: [
    `Logging only the total_tokens and not the split between prompt_tokens and completion_tokens. The cost calculation requires both because they have different rates. Store both separately from the start.`,

    `Implementing streaming without handling the finish_reason field on the final chunk. The last chunk has an empty delta.content but a finish_reason of either "stop" (natural completion) or "max_tokens" (truncated). If you do not check this, you cannot distinguish a complete response from a cut-off one.`,

    `Building the cost dashboard after you have accumulated cost data without instrumentation. Add instrumentation to each project before moving to the next week. Cost data without historical depth is not useful.`,

    `Not accounting for retry costs. If your API call retries three times before succeeding, you paid for four calls. Log each retry separately with a parent_request_id so you can see the true cost including retries.`,

    `Using floating-point arithmetic for cost calculations without rounding. \`0.000015 * 1247\` can produce subtle floating-point errors. Use Python's Decimal type for money calculations, or store costs in microdollars (integer) and convert to display format only at the rendering layer.`,
  ],

  debug_help: `The most subtle streaming bug is a stream that appears complete but is actually truncated because finish_reason was "max_tokens" rather than "stop". To the user, the response just ends mid-sentence. Fix: check the finish_reason on the last chunk. If it is "max_tokens", append a visible indicator to the streamed output: "[response truncated — increase max_tokens or shorten the prompt]". Do not silently accept truncated responses. The second common issue is the database write failing mid-session and losing cost data. Use a try/finally block to ensure the database write happens even if the application raises an exception after the API call.`,

  ai_assist: `Use Claude to help you design the database schema for cost logging — describe what you want to track (model, feature, tokens, cost, timestamp, prompt preview) and ask it to suggest a SQLite schema with appropriate indexes. Verify the suggested indexes make sense for your query patterns: if you query by date range most often, index on timestamp. If you query by model most often, index on model. Schema design is a good use of AI assistance.`,

  stretch: [
    `Add a cost anomaly alert: if any single request costs more than 5x the 7-day average for that feature, send yourself a notification (email, Slack webhook, or SMS via Twilio). This is production-grade cost monitoring.`,
    `Implement semantic caching: before calling the API, embed the user's query and check your cache for a cosine-similar query (threshold 0.95). If a cache hit exists, return the cached response without an API call. Measure cache hit rate and cost savings over 100 queries.`,
    `Add a daily cost report that emails you a breakdown of yesterday's spending by feature and model. Use a cron job or GitHub Actions scheduled workflow to run it at 8am.`,
  ],
});

rewriteWeek("ai-engineering", 8, {
  context: `Language models are limited to what is in their context window. Tool use is what extends that boundary — it lets the model reach out and touch real systems: your filesystem, a database, an external API, a code executor. The model does not run the tools itself. It decides when to call a tool and with what parameters. Your code runs the tool and returns the result. The model uses the result in its next response. This loop is the foundation of every agent you will build.

This week you build CLI-mate: a terminal chat where the AI has access to filesystem tools. You can ask it to find files that changed today, read their contents, search for patterns, and summarise what it finds. When you run it against one of your earlier roadmap repos, you will see it chain multiple tool calls — list files, read a file, grep for a function, git log — to answer a single question.

Tool schema design is more important than it looks. The model reads the tool name, description, and parameter descriptions to decide whether and how to call each tool. A poorly named tool ("process_query") gives the model nothing. A well-named tool with a precise description and annotated parameters ("list_files: lists files modified within a given time window in a directory. dir: the directory path. modified_within_hours: only include files modified in the last N hours.") gets called correctly.

Side-effect tools — tools that write files, send emails, modify a database — require a different design pattern than read-only tools. The model is not infallible. It will sometimes call a tool with incorrect parameters. For side-effect tools, implement a confirmation pattern: the model proposes the action, your code presents it to the user, the user confirms, then the code executes. This is not a limitation of the protocol — it is how responsible agentic software behaves.`,

  pre_flight: `Read the OpenAI function calling documentation end-to-end. Understand the message structure when a tool is called: the model returns a message with role "assistant" and a tool_calls array instead of content. You must add that assistant message to the conversation history, run the tool, add a tool_result message, and then call the model again. This is the execution loop. Write the loop before you write any tools.`,

  mastery_questions: [
    `The model calls two tools in the same response — parallel tool calling. Walk through the message structure. The assistant message has \`tool_calls: [{id: "call_1", name: "list_files", ...}, {id: "call_2", name: "grep", ...}]\`. You run both tools, then you add two tool result messages to the conversation, each with the \`tool_call_id\` matching its respective call. Then you call the model again. Why does parallel tool calling matter? The model can gather information from multiple tools in one round trip instead of two sequential round trips. For agents with high-latency tools (database queries, API calls), parallel tool use can cut total latency by 50%.`,

    `Your CLI-mate agent has a \`read_file(path)\` tool. A user asks it to "read all the Python files in this repo." The model calls read_file 47 times in sequence. What is the problem and how do you prevent it? The agent is calling a single-file tool in a loop when a batch tool would be more appropriate. Fix: add a \`read_files(paths: list[str])\` tool that reads multiple files in one call. Also add a max_files parameter and enforce it. Agents need guardrails on tool use: maximum calls per turn, maximum total context added, hard limits on list operations. Without guardrails, an agent acting in good faith can exhaust your context window and your budget.`,

    `You want the git_log tool to be safe — it should only read, never modify the repo. How do you enforce this at the implementation level? Run git commands with a whitelist: accept only specific git subcommands (log, diff, status, show) and reject anything else. Parse the incoming git command string, extract the subcommand, and check it against the whitelist before executing. Subprocess calls with arbitrary user-controlled strings are a security risk even when the "user" is a language model. Never pass model-provided arguments directly to subprocess.run without validation.`,

    `The model returns a tool call with an invalid parameter — it calls list_files with modified_within_hours set to "yesterday" (a string) instead of an integer. What should your tool implementation do? Validate all inputs before executing. Raise a descriptive error: "modified_within_hours must be an integer, received string 'yesterday'". Return the error as the tool result. The model will read the error message and correct its next call. This is the correct pattern for tool error handling — the error feeds back into the agent loop, not into a Python exception that crashes the program.`,

    `Your agent successfully chains five tool calls to answer a question about your codebase. The final answer is correct. What else do you want to know about the execution? Total tokens consumed across all five round trips (input and output, summed). Total cost. Total wall-clock time. Which tool was called in which order and with what parameters. Whether any tool returned an error that caused the agent to adjust course. Log all of this. Agentic systems are harder to debug post-hoc than single-call systems because the failure might be in the third tool call of a six-step chain. Observability is non-optional for agents.`,
  ],

  common_mistakes: [
    `Forgetting to add the assistant message with tool_calls to the conversation history before adding the tool results. The conversation must contain: user message, assistant message (with tool_calls), tool result message(s), then the next model call. Skipping the assistant message causes a context error or confuses the model.`,

    `Using vague tool names and descriptions. "execute" tells the model nothing. "grep: search for a text pattern in files within a directory. Returns matching lines with filename and line number. pattern: the regex or literal string to search for. dir: the directory to search in." That description is what makes the model call the tool correctly.`,

    `Not implementing a maximum number of tool call iterations. An agent that loops indefinitely — calling tools, getting partial answers, calling more tools — can run for minutes and consume significant tokens. Set a hard limit: if the agent has made more than N tool calls without returning a final answer, stop the loop and return what you have so far.`,

    `Returning tool errors as Python exceptions instead of tool result messages. If a tool raises an unhandled exception, the agent loop breaks. Wrap every tool call in a try/except and return the error as a tool result string. The model can handle the error context; it cannot handle a Python traceback.`,

    `Giving the model tools that read private or sensitive files without access controls. Your list_files tool should respect directory boundaries — it should not be able to traverse above the working directory. Validate the path argument: resolve it, check it is within the allowed scope, reject it if not.`,
  ],

  debug_help: `The most common agent loop bug is an infinite loop where the model keeps calling tools without producing a final answer. Debug by adding a step counter and logging each tool call with its parameters and result. Often the cause is: (1) the tool is returning data the model does not know how to use, so it keeps asking for more, or (2) the tool is returning an error the model thinks it can fix with another tool call but cannot. The fix is usually better tool result formatting — add a clear summary at the top of the tool result before the raw data, so the model has a synthesised view to work with rather than raw noise.`,

  ai_assist: `Use Claude to help you write the tool schema definitions — the JSON schema objects describing each tool's parameters. Describe what each tool does and what its parameters are, and ask it to write the schema. Verify the generated schemas against the OpenAI function calling documentation. This is exactly the kind of boilerplate that AI assistance accelerates without removing understanding. Do not ask Claude to write the execution loop — building that yourself is the point of this week.`,

  stretch: [
    `Add a \`write_file(path, content)\` tool with a mandatory confirmation step: the model proposes the write, you print the proposed path and content, and the user must type "confirm" before the write executes. This is the pattern used in Claude Code and similar agents.`,
    `Add a \`run_python(code)\` tool that executes Python code in a subprocess sandbox with a 5-second timeout. The model can write and run code to answer questions about your codebase. Add a hard blocklist for dangerous operations: os.remove, shutil.rmtree, subprocess.run with shell=True.`,
    `Connect CLI-mate to your cost dashboard database: add a tool that queries the database and answers questions like "how much did I spend on the invoice parser feature last week?" The agent can now introspect its own costs.`,
  ],
});

rewriteWeek("ai-engineering", 9, {
  context: `Every word, sentence, and paragraph can be represented as a point in a high-dimensional space. Words that mean similar things end up near each other. Sentences with similar intent cluster together. This spatial representation — called an embedding — is what makes semantic search possible: instead of matching keywords, you match meaning.

This week you build a personal semantic search engine over your notes or any folder of markdown files. You walk the directory, split content into paragraphs, embed each paragraph using an embedding API, and store the vectors in SQLite. When you query, you embed the question, compute cosine similarity against every stored vector, and return the top 5 most relevant paragraphs. On 1000 paragraphs, results come back in under 100ms.

The embedding models matter more than most people realise. OpenAI's text-embedding-3-small produces 1536-dimensional vectors and is significantly cheaper than the large variant. Cohere's embed-v4 adds semantic compression. BGE and Nomic models run locally on your laptop with no API call required. The choice affects cost, latency, quality, and whether you need internet connectivity — all relevant tradeoffs for a production system.

Similarity functions are not interchangeable. Cosine similarity measures the angle between vectors and is invariant to magnitude — a good choice when your vectors vary in length. Dot product is equivalent to cosine when vectors are L2-normalised. L2 (Euclidean) distance measures absolute position in space. For most embedding use cases, normalise your vectors and use cosine similarity. The intuition: two documents that express the same idea but one is longer should still be near each other. Cosine handles that; L2 does not.`,

  pre_flight: `Install openai for embeddings and numpy for vector math. Understand what an embedding API call returns: a list of floats (the vector). Know how to compute cosine similarity: dot product divided by the product of the vector norms. Install sqlite3 (standard library) and understand how to store numpy arrays as BLOBs. Have a folder of at least 50 markdown files to index — your notes, your earlier project READMEs, or downloaded documentation.`,

  mastery_questions: [
    `You store 1000 paragraph embeddings in SQLite as BLOBs. On every query, you load all 1000 from the database, deserialise them, and compute cosine similarity. The query takes 450ms. You need it under 100ms. What do you do? Cache the embeddings in memory as a numpy matrix when the application starts. Serialise: store as numpy .npy file on disk. On startup, load the entire matrix into RAM with np.load(). A single numpy matrix multiply to compute all cosine similarities takes under 5ms for 1000 vectors. The bottleneck is database I/O, not the math. For 100k vectors, consider moving to a dedicated vector index (FAISS or sqlite-vss).`,

    `You embed paragraphs from your notes. A user queries "deployment steps." The top result is a paragraph that says "steps to deploy: 1. build 2. test 3. push." The second result is about "step functions in AWS." Why did the AWS result appear? Embedding similarity captures semantic proximity in the training data, not just surface relevance. "Step" is semantically close to "steps" and "step functions" is a technical term adjacent to "deployment" in the model's training corpus. This is a false positive from the semantic search. Solutions: add metadata filtering (only search notes tagged "deployment"), use a re-ranker that applies a stricter relevance criterion, or display the match score and let the user filter by threshold.`,

    `You want to embed a 10000-word document but the embedding model has a 8192-token limit. What do you do? Do not truncate the document — you lose content. Do not embed the whole document as one unit — it exceeds the limit. Chunk it: split into overlapping chunks of 512 tokens with a 64-token overlap. Each chunk gets its own embedding and its own database record. At query time, multiple chunks from the same document may appear in results. To present the user with coherent results, group chunks by source document and show the most relevant chunk per document, then expose a "show more from this document" option.`,

    `You are comparing two embedding models: one produces 768-dimensional vectors, the other 3072. What dimension tells you and what it does not. Higher dimension typically means more expressive representation — the model can capture finer-grained semantic distinctions. But higher dimension also means more storage, slower similarity computation (O(d) per comparison), and more expensive API calls. Whether the quality improvement justifies the cost depends on your task. The correct approach: run both on your eval set (if you built one) and compare retrieval quality. Do not assume bigger is better without measuring.`,

    `Your semantic search engine has been running for a week. Someone added 50 new notes to the folder. The search does not find content from the new notes. How do you handle incremental updates? Track which files have been indexed using a manifest table in SQLite: file path, file modification timestamp, embedding timestamp. On startup (or on a schedule), walk the directory and compare current modification timestamps against the manifest. Re-embed and re-index any file that is newer than its manifest entry. Delete manifest entries for files that no longer exist. This is the incremental indexing pattern that every production document search system uses.`,
  ],

  common_mistakes: [
    `Embedding full documents instead of paragraphs or sentences. A 1500-word document gets averaged into one vector, which is a poor representation of any specific part of its content. Smaller chunks produce more precise retrieval. The common heuristic: 256-512 tokens per chunk for retrieval, with 10-20% overlap to avoid cutting sentences mid-thought.`,

    `Not normalising vectors before computing cosine similarity. If your vectors have variable magnitude (which they do, depending on content length), cosine computed from raw dot product is incorrect. Normalise each vector to unit length before storing: v / np.linalg.norm(v). Then dot product is equivalent to cosine.`,

    `Embedding at query time without caching. If the same search query is made multiple times, re-embedding it on each request wastes an API call. Cache query embeddings with a simple dict keyed by the query string. TTL: 1 hour.`,

    `Treating semantic similarity as perfect recall. Semantic search misses documents that use different vocabulary to express the same concept, and returns false positives for documents that use the same vocabulary for different concepts. Always pair semantic search with keyword search (BM25) in a production system. The combination is called hybrid search.`,

    `Not including the source metadata with each search result. Returning a paragraph without telling the user which file it came from is almost useless. Store file path, paragraph index, and a snippet of surrounding context alongside each embedding. Display it with the result.`,
  ],

  debug_help: `The most confusing behaviour in semantic search is when clearly relevant results do not appear in the top-5 but irrelevant ones do. Debug by checking the similarity scores — print the top-10 results with their scores. If relevant content is at position 8 with score 0.72 while irrelevant content is at position 2 with score 0.81, the issue is likely chunking. The irrelevant paragraph is short and dense with semantically close words. The relevant paragraph is long and its key concepts are diluted by surrounding context. Solutions: experiment with smaller chunk sizes, add a re-ranker, or use contextual chunk headers (prepend the document title and section heading to each chunk before embedding).`,

  ai_assist: `Use Claude to help you choose the right chunking strategy for your specific document type. Describe the structure of your markdown files (headers, bullet lists, prose paragraphs, code blocks) and ask it to recommend a chunking approach. Different document structures call for different strategies — heading-aware chunking beats fixed-size chunking for structured notes. This is a design decision where AI reasoning over your specific context adds value.`,

  stretch: [
    `Add BM25 keyword search alongside the semantic search and implement a simple reciprocal rank fusion to combine both result sets. Compare precision@5 of semantic alone, keyword alone, and the hybrid on 20 test queries.`,
    `Build an incremental indexer that watches the notes directory with watchdog and re-indexes changed files automatically. The search engine should reflect changes within 10 seconds of a file being saved.`,
    `Add a local embedding option using sentence-transformers (all-MiniLM-L6-v2 or similar). Compare retrieval quality and latency against the OpenAI embedding API. Document when the local model is good enough.`,
  ],
});

rewriteWeek("ai-engineering", 10, {
  context: `Storing embeddings in SQLite works for thousands of vectors. It breaks for millions. The vector database landscape exists because similarity search at scale requires specialised indexing — algorithms that avoid comparing every query vector against every stored vector. This week you build a hybrid search API: FastAPI endpoint, Qdrant or pgvector for storage, BM25 keyword search combined with vector search, and a cross-encoder reranker on the merged results.

The landscape of vector databases is genuinely diverse and the differences matter. pgvector is an extension to PostgreSQL — it gives you vector search in a database you already know, with all of PostgreSQL's transactional guarantees and the ability to join against regular tables. Pinecone is a managed vector-only service — operationally simple, expensive at scale. Qdrant, Weaviate, and Milvus are dedicated vector databases with more indexing options than pgvector. LanceDB uses a columnar format that works well for multi-modal data. The right choice depends on your existing infrastructure, scale, and whether you need transactions.

HNSW (Hierarchical Navigable Small World) is the indexing algorithm behind most modern vector databases. It builds a layered graph of connections between vectors, allowing approximate nearest-neighbor search in O(log n) time instead of O(n). The tradeoff: approximate, not exact. For most retrieval tasks, the approximation loss is negligible, but understanding it matters when you are evaluating recall metrics.

Hybrid search is the pattern that real search systems use. Vector search alone misses documents with specific terminology. Keyword search alone misses semantically similar documents with different vocabulary. Combining both via reciprocal rank fusion (RRF) consistently outperforms either alone. The cross-encoder reranker then takes the combined top-50 and reorders them by a more expensive but more precise relevance model. Two-stage retrieval is the standard architecture.`,

  pre_flight: `Install qdrant-client or psycopg2 with pgvector. Understand HNSW: it is an approximate nearest-neighbor graph that allows fast search with a small accuracy tradeoff. Know what BM25 is: a keyword relevance score based on term frequency and document length normalisation. Install rank-bm25 or use Elasticsearch/OpenSearch for BM25. Understand what a cross-encoder reranker does: it scores a (query, document) pair jointly rather than independently, which is more accurate but slower.`,

  mastery_questions: [
    `You have 50k documents indexed in Qdrant with HNSW. Your exact nearest-neighbor search (brute force) takes 800ms. HNSW takes 15ms but returns slightly different results. You set ef (the search parameter) higher to improve recall and the query time goes to 45ms. What is ef and what does it control? ef (ef_search in Qdrant) is the size of the candidate set during graph traversal. Higher ef means the algorithm explores more nodes before returning results, improving recall at the cost of latency. The relationship is not linear — doubling ef does not double latency. Tune ef by measuring recall@10 against brute force at different ef values and choosing the lowest ef that achieves your recall target (typically 0.95+).`,

    `Your hybrid search API combines vector search (top-50) and BM25 keyword search (top-50). Many documents appear in both result sets. How does reciprocal rank fusion (RRF) combine them? RRF assigns each document a score of sum(1 / (k + rank_i)) where rank_i is the document's rank in each result set and k is a smoothing constant (typically 60). A document ranked #1 in vector search and #1 in keyword search gets the highest combined score. A document ranked #45 in one search and not appearing in the other gets a low score. This approach is robust to different scoring scales across the two search systems — it uses rank, not score magnitude.`,

    `The cross-encoder reranker takes your top-50 hybrid results and reorders them. Why not just use the cross-encoder for all 50k documents instead of doing two-stage retrieval? Cross-encoders are slow. They evaluate query and document together in a single forward pass through a transformer, which cannot be pre-computed or indexed. Running a cross-encoder on 50k documents per query at 2ms per pair = 100 seconds per query. Unacceptable. The two-stage approach uses cheap approximate retrieval to get a candidate set of 50-100, then expensive precise reranking on just those candidates. Typical latency: retrieval 20ms + reranking 150ms = 170ms total.`,

    `You want to add metadata filtering to your search API: a user can optionally filter by date range or document category before semantic search. Should you implement this as pre-filtering or post-filtering? Pre-filtering: apply the metadata filter before HNSW search, reducing the candidate space. Post-filtering: run HNSW on all vectors, then filter results. Pre-filtering is faster when the filter is selective (few documents match). Post-filtering is safer when the filter is loose (many documents match) — pre-filtering a sparse subset can damage HNSW recall because the graph was built assuming a different distribution. Qdrant handles this automatically with their filtering implementation; pgvector requires you to implement it as a WHERE clause.`,

    `You document precision@10 against 20 hand-labelled queries. Your hybrid search gets precision@10 of 0.82. The pure vector search gets 0.74. The pure keyword search gets 0.68. What conclusion do you draw and what do you still want to measure? Hybrid search wins on this metric for this query set. But precision@10 is not the full picture: also measure recall@10 (what fraction of all relevant documents appear in the top 10), mean reciprocal rank (where is the first relevant result), and NDCG (graded relevance accounting for position). Also consider: is the 0.08 improvement over pure vector worth the added complexity and latency? For a production decision, you need the full metric picture plus the operational cost comparison.`,
  ],

  common_mistakes: [
    `Storing embeddings without the associated document text. The vector database stores the vectors. You need the text to display results. Store the text (or a reference to where to fetch it) as metadata alongside each vector. In Qdrant, this is the payload field. Forgetting to do this means your search returns IDs you cannot use.`,

    `Using HNSW with default parameters and never tuning them. The default ef_construction and m parameters are conservative starting points. For your specific data distribution and recall requirements, running a sweep over parameter combinations and measuring recall@10 can significantly improve quality without changing the index size.`,

    `Not evaluating the reranker separately from retrieval. If your two-stage pipeline has poor results, you need to know whether the failure is in retrieval (wrong candidates) or reranking (right candidates, wrong order). Measure precision@50 before reranking and precision@10 after. If precision@50 is low, fix retrieval first. The reranker cannot rescue bad candidates.`,

    `Assuming pgvector is always good enough. For under 1M vectors with moderate query load, pgvector is excellent and operationally simple. For higher scale or more complex filtering, dedicated vector databases offer better performance. Make the decision based on your actual scale and requirements, not on what is more impressive to mention.`,

    `Not implementing connection pooling for the vector database client. A FastAPI server that creates a new database connection per request will be slow and will run out of connections under load. Use lifespan context managers to create the client once at startup and reuse it across requests.`,
  ],

  debug_help: `The most confusing hybrid search bug is when the combined results are worse than vector-only results. This usually means BM25 is introducing noise — keyword matches on common words that are semantically irrelevant. Debug by running BM25 and vector search separately and inspecting the top-10 results of each. If BM25's top-10 are dominated by documents with high word frequency but low semantic relevance, adjust the BM25 k1 and b parameters, or limit BM25 to title and header fields rather than full text. The second issue is the reranker making the results worse. Check: is the reranker model trained on the same domain as your documents? A reranker trained on web search queries may not transfer to technical documentation search.`,

  ai_assist: `Use Claude to help you write the RRF implementation — describe the algorithm (rank-based fusion with k=60 smoothing constant) and ask it to write the Python function. Verify the implementation against the formula. Use it to also help you write the Qdrant collection creation code with the right vector configuration. The SDK usage is boilerplate that AI handles well. The architecture decisions — when to pre-filter, what ef to use, whether to rerank — are yours to make after understanding the tradeoffs.`,

  stretch: [
    `Add multi-tenancy to the search API: each user's documents are isolated in their own Qdrant collection or namespace. A user's query only searches their documents. Implement the tenant isolation at the API authentication layer.`,
    `Build a benchmark harness that tests retrieval latency at 1k, 10k, 50k document counts and plots the latency curve. Compare HNSW vs brute force at each scale. Document at what scale brute force becomes unacceptable.`,
    `Implement query caching: cache the top-10 results for each query string with a 5-minute TTL. Measure cache hit rate after 100 queries and calculate the cost savings. Add a cache bypass parameter for queries that explicitly need fresh results.`,
  ],
});
