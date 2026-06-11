import { rewriteWeek } from "../rewrite-week";

// ai-engineering W16-W20

rewriteWeek("ai-engineering", 16, {
  context: `One agent can do a lot. A network of specialised agents, each focused on a narrow domain, can do more — and do it more reliably. Multi-agent systems exist because generalisation has limits: a single agent that is both researcher, security auditor, and style editor will be mediocre at each. Three separate agents with tight briefs will collectively outperform the generalist.

This week you build a code review agent system. Three agents work on the same submitted code: a Security agent that looks for vulnerabilities, a Quality agent that flags code smells and style issues, and a Synthesis agent that merges the findings into a coherent review. You choose the orchestration pattern and implement it.

Manager-worker is the most common pattern. A coordinator agent receives the task, decomposes it into subtasks, dispatches each to a specialist worker, collects the results, and synthesises a final output. The coordinator does not do the domain work — it manages the process. This pattern maps well to problems that can be cleanly decomposed and where the subtasks are independent.

Sequential pipeline is different: Agent A's output is the direct input to Agent B. The review does not start synthesis until security review is complete. This is appropriate when the tasks are ordered — synthesis logically requires the individual reviews to be finished. But it is slower than parallel execution and a failure at step N breaks the chain.

The shared state pattern is worth knowing even if you do not use it here: agents communicate by reading and writing to a shared data store (a database or message queue). Agents do not call each other directly. This creates looser coupling but requires careful coordination around concurrent writes.

Context window management is the main engineering challenge. The Synthesis agent must receive the outputs of the Security and Quality agents. If those outputs are long, the Synthesis agent's context fills quickly. Design each agent to produce concise, structured output that downstream agents can consume efficiently.`,

  pre_flight: `Understand the manager-worker, sequential pipeline, and swarm patterns. Plan the message passing: how does the Security agent's output reach the Synthesis agent? Via direct function call, via a message queue, or via shared state? Pick one and implement it consistently. Know how to run two agents concurrently with asyncio.gather(). Have a test code snippet ready — at least 50 lines of Python or JavaScript with at least two deliberate vulnerabilities.`,

  mastery_questions: [
    `You run the Security agent and Quality agent concurrently on the same code. They complete in 8 and 12 seconds respectively. The Synthesis agent starts as soon as both finish. Total time: 12 seconds. In the sequential version, total time was 8+12+6=26 seconds. What are the risks of the parallel approach that did not exist in the sequential? Race conditions are not a concern here since the agents only read the code, not write to shared state. The real risk is context: if the Security agent's output is long, it is passed verbatim to the Synthesis agent. If Quality is also long, the Synthesis agent's context grows quickly. In sequential execution, you could summarise intermediate outputs before passing them forward. In parallel, all outputs arrive simultaneously. Design both agents to produce compact structured output (under 500 tokens) to mitigate this.`,

    `Your Security agent returns: "Lines 47-52 contain a SQL injection vulnerability. The query string is constructed by directly concatenating user input without parameterisation." Your Quality agent returns a 2000-word style analysis. The Synthesis agent receives both. What is wrong with this and how do you fix it? The Quality agent is producing far more output than needed for synthesis. Each specialist agent should be given a maximum output length and a structured format: bullet points with severity, location, and recommendation. Cap Quality output at 5 bullets for style and 3 for architecture. The Synthesis agent's job becomes merging structured lists, not summarising essays.`,

    `You want the manager agent to retry a specialist that fails. The Security agent raises an exception on obfuscated code. Walk through the retry logic. The manager catches the exception, logs it, and retries the Security agent with a modified prompt: "The previous attempt failed on this code. Focus only on obvious vulnerabilities like SQL injection, hardcoded credentials, and unsafe deserialization. Skip analysis of obfuscated sections." The retry uses a simpler task framing. If the retry also fails, the manager proceeds without the Security agent's output and notes the gap in the Synthesis prompt: "Security review was unavailable. Treat security recommendations as incomplete."`,

    `A "swarm" pattern lets agents communicate peer-to-peer via a message bus. Describe how this changes the code review system. Each agent subscribes to a "code submitted" event. The Security agent processes and publishes a "security review complete" event with its findings. The Quality agent does the same. The Synthesis agent subscribes to both "review complete" events and fires when both arrive. The manager is replaced by an event bus. This is more decoupled — adding a fourth agent (Performance analysis) means adding a subscriber, not modifying the manager. But it is harder to reason about ordering, failure handling, and timeout management.`,

    `After shipping the code review system to your team, you find that engineers sometimes ignore the security findings. The Synthesis agent buried them in paragraph 3 of a long report. How do you fix this at the agent system level? Redesign the Synthesis agent's output format. Security findings above a threshold severity (High or Critical) must appear in a dedicated section at the top of the report, before all other content. Change the Synthesis agent's system prompt to enforce this: "Format: (1) Critical Security Findings — if none, omit this section. (2) High Priority Issues. (3) Style and Quality Findings. (4) Summary." The information hierarchy in the output is a product decision, not just a formatting preference.`,
  ],

  common_mistakes: [
    `Giving each specialist agent the full conversation history from the other agents. Specialist agents should receive only what they need to do their job: the code to review, their specific task description, and the output format. Giving the Security agent the Quality agent's review introduces bias and unnecessary context.`,

    `Not handling partial failures. If the Security agent times out, the system should still produce a report with a clear note that security analysis was unavailable. A system that fails completely when one component fails is not production-ready.`,

    `Building multi-agent systems when one agent would do. Multi-agent adds complexity, latency, and cost. If a single agent with a detailed system prompt can do the job, do not add agents. Use multi-agent for tasks that are genuinely too broad for one agent, or where parallel execution is worth the overhead.`,

    `Not logging which agent produced which finding. The synthesised report should trace each finding back to its source agent. If a finding is wrong, you need to know whether it came from the Security or Quality agent to fix the right component.`,

    `Assuming agents will collaborate naturally. Agents do not "know" about each other unless you tell them. If the Synthesis agent needs to understand the format of the Security agent's output, put that format specification in the Synthesis agent's system prompt explicitly.`,
  ],

  debug_help: `The hardest multi-agent bug is when the Synthesis agent produces a report that does not reflect what the specialist agents found. Often the cause is context truncation: one of the specialist agent outputs was too long and was silently cut off before the Synthesis agent processed it. Fix: log the exact content that each agent receives, not just what it returns. Verify the Synthesis agent received the full output of each specialist. If truncation is happening, reduce the specialists' output length or increase the Synthesis agent's context window.`,

  ai_assist: `Use Claude to help you design the system prompt for each specialist agent. Describe the agent's role, the input format (a code snippet), the output format (structured findings), and constraints (maximum length, required fields). Ask it to draft three system prompts — one per agent. Compare and contrast them. Good specialist system prompts are narrow, specific about output format, and clear about what the agent should and should not do.`,

  stretch: [
    `Add a fourth agent: a Mentor that takes the review and produces a learning resource — a 5-bullet "what to learn to avoid these issues" recommendation with specific book chapters, documentation links, or practice exercises.`,
    `Implement a debate pattern for the security review: two Security agents with different biases (one optimistic about security, one pessimistic) review the same code independently. A judge agent synthesises their disagreements into a more balanced assessment.`,
    `Add latency measurement per agent and a visualisation of the agent execution graph: which agents ran in parallel, which were sequential, and how long each took. This is the observability that production multi-agent systems require.`,
  ],
});

rewriteWeek("ai-engineering", 17, {
  context: `Shipping an AI feature without evals is like shipping code without tests — it works until it does not, and you find out from users rather than from CI. Production evals are the discipline that lets you ship with confidence: a set of golden test cases in version control, a pipeline that scores model outputs against them, and a gate that blocks deployment if quality regresses.

The difference between development evals (which you have been building) and production evals is that production evals run automatically, gate deployments, and monitor live traffic. They require infrastructure: somewhere to store results, something to trigger runs, something to alert when quality drops.

Pre-deploy evals run on every pull request. They test that a code change — a new prompt, a different model version, a modified retrieval pipeline — does not degrade quality below an acceptable threshold. The threshold is specific and numeric: if faithfulness drops below 0.80 or answer relevance drops below 0.75, the PR is blocked. These numbers are decisions you make based on what failure modes users will tolerate.

Online evals monitor production traffic. You sample a fraction of live requests (10-20%), score them with an LLM judge or deterministic metric, and store the results. Over time, you build a quality dashboard that shows how model quality changes with traffic patterns, with model updates from the provider, and with changes in the distribution of user questions. Without online evals, model degradation is invisible until it is severe.

A/B testing for AI features uses the same statistical framework as A/B testing in product development but with AI-specific gotchas: LLM responses are not binary (clicked/not clicked) but graded (quality score), which requires different statistical tests. Small sample sizes, high variance in quality scores, and provider model updates mid-experiment all complicate the analysis.`,

  pre_flight: `Have a working project from the last 16 weeks that you will add production evals to. Identify the 3 most important quality metrics for that project. Build a golden test set of 25-30 cases. Know how to run a GitHub Actions workflow. Understand what statistical significance means for your chosen metric — if you are measuring average quality score, know how to run a t-test in Python with scipy.`,

  mastery_questions: [
    `You add a pre-deploy eval gate to your RAG pipeline. The eval runs on every PR and blocks merge if faithfulness drops below 0.80. A developer changes the prompt and faithfulness drops to 0.76. The PR is blocked. The developer argues the change was needed for another metric. What is the right process? The developer should open a separate PR that updates the eval threshold and provides evidence — run the full eval on both the old and new prompts, show that the 0.76 faithfulness is accompanied by measurable improvements in the other metric, and make the case that the threshold should be adjusted. Thresholds should not be lowered without explicit discussion and documentation. Otherwise every developer who changes something will want to lower thresholds to unblock their work.`,

    `You sample 15% of live production requests and score them with an LLM judge. You notice that quality scores drop every Friday afternoon. What hypotheses would you investigate? Friday afternoon traffic may have different characteristics: more casual queries, more time-sensitive questions, different user demographics. The model may also be under higher load (provider rate limits, slower responses). Check: is the drop in eval score correlated with higher latency (model under load)? Is the Friday traffic a different distribution of question types? Export the Friday afternoon queries and compare their topics, lengths, and complexity against the baseline. The answer tells you whether to fix the prompt, the load handling, or the model selection.`,

    `You are A/B testing two prompts for your paper assistant. Prompt A scores 3.8 average quality (on a 1-5 scale) and Prompt B scores 4.1. You have 50 queries. Is this statistically significant? Run a two-sample t-test: \`scipy.stats.ttest_ind(scores_a, scores_b)\`. With high variance quality scores and only 50 samples, the confidence interval around the 0.3 difference is likely wide. The p-value may not reach 0.05. This is the core tension in AI A/B testing: quality scores have high variance and you rarely have the sample sizes that web A/B tests have. Decision: if the confidence interval excludes zero (even at 90% confidence), Prompt B is probably better. If it includes zero, collect more data or accept uncertainty.`,

    `You want to detect when your AI feature has regressed without running a full eval set on every request. What lightweight monitoring approach works? Monitor proxy metrics that correlate with quality: response length (unusually short responses often indicate a problem), refusal rate (if the model starts refusing more requests, something changed), user feedback signals (thumbs up/down if you have them), retry rate (if users are asking the same question multiple times in a session, the first answer probably was not good enough). None of these is as accurate as an LLM judge, but they are cheap and fast. Use them to trigger a full eval run when they spike.`,

    `A provider updates the model version behind a stable API alias (e.g., gpt-4o gets a silent patch update). Your eval scores change but you did not change your code. How do you detect and handle this? Run your eval suite on a schedule — weekly, not just on code changes. If scores change between code-identical runs, the provider's model changed. Log the model version (or fingerprint the responses) so you can attribute the change. Your response: understand whether the new model is better or worse on your specific task, and decide whether to pin to the previous version or adopt the new one. Provider model updates are the silent disruptor in production AI systems.`,
  ],

  common_mistakes: [
    `Running evals only when something breaks. Evals run continuously, on a schedule, on every deployment. If you only run them when something seems wrong, you have already lost the early warning signal.`,

    `Having a single aggregate score as the only metric. An aggregate hides failures in specific categories. Track metrics by question type, by complexity level, and by the feature or flow that generated the request. Aggregate score 0.82 might mean 0.95 on simple questions and 0.62 on complex ones — very different implications.`,

    `Not storing eval results with enough context to reproduce the failure. Each eval record should contain: the exact prompt sent, the model response, the judge reasoning, the score, the timestamp, the model version, and the test case ID. Without this, a failing eval result is a number you cannot debug.`,

    `Using the same eval set indefinitely without updating it. User query distributions change over time. Eval sets become stale — they test the problems you had when you built them, not the problems you have now. Review and refresh the golden test set quarterly.`,

    `Not having an alert that fires when evals degrade. Evals that run and store results but do not alert anyone are monitoring theater. Set up a notification (email, Slack, PagerDuty) when any tracked metric drops more than 0.05 from the 30-day baseline.`,
  ],

  debug_help: `The hardest production eval problem is when the judge model disagrees with human judgment consistently. You review 10 flagged responses by hand and find 7 of them are actually good — the judge is wrong. This is a calibration failure in the judge prompt or the judge model. Fix: run a calibration study. Have 3 humans independently rate the same 20 responses on your quality scale. Compute inter-rater agreement (Fleiss' kappa). Then compare the judge's ratings against the human ratings. If the judge systematically disagrees with humans in a specific direction or for a specific response type, update the judge prompt to correct for it.`,

  ai_assist: `Use Claude to help you write the LLM judge prompt for your specific project. Describe the task (what the model is supposed to do), the dimensions you care about (accuracy, helpfulness, groundedness), and the scoring format (1-5 with explanation). Ask it to draft a judge prompt and a validation rubric. Test the rubric on 10 responses you have already manually rated and verify the judge agrees with your ratings at least 80% of the time before using it in production.`,

  stretch: [
    `Build a quality dashboard in Streamlit that reads from your eval database and shows: score trend over 30 days, per-metric breakdown, worst-performing question categories, and recent failures with their judge reasoning. This is the monitoring tool you actually want.`,
    `Implement a canary eval: before deploying a new prompt or model version to 100% of traffic, deploy it to 5% and run online evals on that slice for 24 hours. Only promote to 100% if quality metrics hold.`,
    `Set up a weekly eval report that emails you a digest: average scores by metric, any regressions from the previous week, the top 5 lowest-scoring queries from the week. Make it actionable — include a "what to investigate" section that flags specific issues.`,
  ],
});

rewriteWeek("ai-engineering", 18, {
  context: `An AI feature that fails in production fails in ways you cannot see without instrumentation. The model returns a response — but did it use the right retrieved documents? Did the agent take the expected path? Did the tool call succeed? Did a prompt change last Tuesday cause the quality drop you see in Friday's metrics? Observability answers these questions by recording what happened inside the black box.

Tracing is the core primitive. A trace is a tree of spans, each representing a unit of work: one span for the total request, child spans for retrieval, reranking, the model call, and any tool calls. Each span has a duration, input, output, and attributes (model name, token count, cost). When something goes wrong, you look at the trace and see exactly which span is slow, which returned unexpected output, and which cost more than expected.

OpenTelemetry is the open standard for telemetry data — traces, metrics, and logs — that is increasingly adopted by AI tooling. The practical meaning: you instrument your code once with the OTel SDK, and you can send the data to any compatible backend (Langfuse, Phoenix, Jaeger, Grafana Tempo) without changing your instrumentation code. Lock-in risk is lower.

Hosted observability platforms — LangSmith, Helicone, Arize Phoenix, Langfuse — provide dashboards, query interfaces, and alerting built specifically for AI workloads. They understand the concept of a "run" that includes an LLM call, they render conversation trees, and they surface latency and cost metrics in AI-native formats. Self-hosted alternatives (Langfuse OSS, Phoenix) give you the same features without sending data to a third party — relevant when your data is sensitive.

This week you add full observability to your researcher agent from W13. Every run — every thought, every tool call, every retrieval, every model response — gets traced. By the end of the week, you can open the dashboard and see exactly what the agent did on any given run.`,

  pre_flight: `Install langfuse or arize phoenix. Understand the OpenTelemetry tracing model: a trace is a tree of spans. Each span has a start time, end time, parent span ID, and attributes. Know how to create a span in Python using the OTel SDK. Have your W13 researcher agent code ready to instrument. Identify the 5 key operations to trace: agent loop iteration, tool calls, retrieval, model calls, final answer generation.`,

  mastery_questions: [
    `You add tracing to your researcher agent. After a week of usage, you open the dashboard and see that 30% of runs have a retrieval span that takes over 3 seconds. The other 70% take under 500ms. What do you investigate? Start with the attributes on the slow retrieval spans: how many documents were retrieved? What query was used? What was the total context size passed to the vector search? The 3-second outliers might be caused by large result sets, cold cache misses, or a specific query pattern that generates an expensive HNSW traversal. Compare the slow runs against fast runs: what is different? Once you identify the pattern, the fix is specific — it might be adjusting ef_search for certain query types, adding a result count cap, or implementing a query cache.`,

    `You want to trace both the outer agent loop and the inner model call. The model call is a child of the agent loop. How do you propagate the trace context from parent to child span in Python? In the OTel SDK, get the current tracer: \`tracer = trace.get_tracer("agent")\`. Start the parent span: \`with tracer.start_as_current_span("agent_loop") as span:\`. Inside that context, start the child span: \`with tracer.start_as_current_span("model_call") as child_span:\`. The OTel SDK automatically sets the parent-child relationship based on the active context. The resulting trace tree shows agent_loop at the root with model_call, tool_call, and retrieval as children at the correct nesting level.`,

    `Your traces show that one tool call — the web search tool — fails 15% of the time. The agent retries and succeeds, but the failed call is still recorded in the trace. How do you distinguish a "failed then recovered" trace from a "failed permanently" trace? Add attributes to the span: \`span.set_attribute("retry_count", n)\` and \`span.set_attribute("final_status", "success" or "failure")\`. A trace with retry_count=2 and final_status="success" is different from retry_count=2 and final_status="failure". In your dashboard, filter for final_status="failure" to see traces that required human attention. Filter for retry_count > 0 to see all traces where recovery happened — these are the ones that would have failed before you added retries.`,

    `Langfuse stores your traces including the full prompt text and model responses. Your agent processes queries that contain user-provided text. What data governance considerations apply? You are sending user content to a third-party service. If your users are in the EU, this may implicate GDPR. If users enter sensitive information, you need consent for that data to be logged. Mitigations: (1) hash or truncate PII before logging, (2) use Langfuse OSS (self-hosted) so data never leaves your infrastructure, (3) implement a user consent mechanism that disables logging for users who opt out, (4) configure data retention policies so traces are purged after 30 days.`,

    `You want to measure the cost of each trace, not just the cost of individual model calls. Some traces involve 5 model calls and 3 retrieval calls. How do you compute total trace cost? Each model call span should have an attribute: \`cost_usd\`. Sum all \`cost_usd\` attributes across all spans in the trace to get total trace cost. In Langfuse, this is a computed field if you log usage correctly. In a self-built solution, aggregate at query time: \`SELECT SUM(attributes->>'cost_usd') FROM spans WHERE trace_id = ?\`. Report both per-span cost (to identify expensive operations) and per-trace cost (to understand what a complete user interaction costs).`,
  ],

  common_mistakes: [
    `Adding traces only to the outermost function and not to inner operations. A single top-level span that says "agent run took 12 seconds" tells you nothing useful. Trace every meaningful operation: each tool call, each retrieval, each model call. The value of tracing is in the breakdown, not the total.`,

    `Not logging inputs and outputs on spans. A span with just a duration is nearly useless for debugging. Add span attributes for the key inputs and outputs: the query that went to retrieval, how many documents came back, the first 200 chars of the model response. This is what lets you diagnose failures retroactively.`,

    `Logging full prompt text including sensitive user data to a hosted service without consideration. Add an input sanitiser that strips or masks known sensitive patterns (emails, phone numbers, names) before logging.`,

    `Not setting up alerts based on trace data. Observability without alerting is passive — you have to go looking for problems. Set up alerts for: trace error rate above 5%, p95 latency above 10 seconds, tool call failure rate above 10%. These fire proactively when something goes wrong.`,

    `Using different span names for the same operation across code versions. If you rename a span, your dashboard queries that filter by span name break and you lose continuity in your historical data. Treat span names as a schema — change them intentionally and update all downstream queries when you do.`,
  ],

  debug_help: `The most confusing observability problem is when the dashboard shows a trace but it looks incomplete — some spans are missing. This usually means the OTel context was not properly propagated into an async function or a thread pool worker. The OTel context is thread-local by default. When you run tool calls in asyncio.gather() or a ThreadPoolExecutor, you must explicitly copy the context into each worker. Use \`contextvars.copy_context().run(fn)\` or the OTel library's async-aware span creation methods. If context propagation is broken, child spans appear as root-level spans in the dashboard rather than nested under their parent.`,

  ai_assist: `Use Claude to help you write the OpenTelemetry instrumentation code for your researcher agent. Describe the operations you want to trace (agent loop, tool call, model call, retrieval), the attributes to capture on each span, and ask it to generate the instrumentation code. Review the generated code carefully — OTel instrumentation is boilerplate-heavy and correct instrumentation is the kind of task where AI assistance saves time without bypassing understanding.`,

  stretch: [
    `Build a cost alert dashboard that sends a Slack message when any single trace costs more than \$0.50, or when the total cost for the day exceeds \$5.00. Include the trace ID and a link to the dashboard in the alert.`,
    `Implement trace sampling: only send 20% of traces to Langfuse to reduce storage costs, but always send 100% of traces that contain errors or have latency above the 95th percentile. This is tail-based sampling.`,
    `Build a "session replay" feature: given a trace ID, reconstruct the exact conversation the agent had — every thought, every tool call, every result — in a readable format. This is the debugging tool you wish you had before you built observability.`,
  ],
});

rewriteWeek("ai-engineering", 19, {
  context: `AI API costs scale with usage. A feature that costs $0.02 per request is sustainable at 100 requests/day and painful at 100,000. The engineers who ship AI features that are both good and affordable are the ones who understand exactly where the money goes and have applied the right tools to reduce it. This week you take one of your four major projects and cut its cost by 50% without measurable quality loss.

Exact-match caching is the simplest and most effective optimisation. If the same prompt is sent twice, return the cached response. Hash the complete prompt (model, messages, temperature, and any other parameters that affect output) as the cache key. Cache responses in Redis or a SQLite table with a TTL. Hit rate depends on your workload — systems with common system prompts and repeated query patterns can achieve 30-50% cache hit rates.

Semantic caching extends this: cache by meaning, not exact text. Embed the user's query, check the cache for a semantically similar query (cosine similarity above 0.95), and return the cached response if found. This catches paraphrases of the same question. The risk: two questions can be semantically similar but require different answers. Set the threshold conservatively (0.95, not 0.85) and add a fallback to fetch fresh if the cached response does not seem to fit.

Prompt caching at the provider level discounts the input tokens in a stable, repeated prefix. If your system prompt is 2000 tokens and never changes, prompt caching means you pay cache-read rates (roughly 10% of input rates on Anthropic, similar on OpenAI) for those 2000 tokens after the first call. At scale, this is substantial.

Batch APIs are underused. If you are running evaluations, generating reports, or processing documents overnight, the batch API offers 50% cost reduction for accepting 24-hour latency. Evals, batch document processing, and asynchronous enrichment pipelines are all good candidates.

Model routing — using a smaller model for simpler queries — is the highest-leverage optimisation but requires the most care. You need a reliable classifier, and you need to measure quality on the routed requests to ensure the cheaper model is actually good enough.`,

  pre_flight: `Identify your target project and measure its current cost per request using your cost database from W7. Break down the cost by component: input tokens, output tokens, which model, which feature. This baseline is what you compare against after optimisation. Have Redis running locally or use SQLite for caching. Know the current pricing for prompt caching on Anthropic and OpenAI.`,

  mastery_questions: [
    `You implement exact-match caching and measure a 20% cache hit rate. Your cost drops by 20%. You expected more. Why might the hit rate be lower than expected and how do you investigate? Generate a cache key frequency histogram: count how many times each unique cache key was requested. If most keys are seen only once, your workload is highly non-repetitive and exact-match caching is not the right tool. Investigate semantic caching instead. Also check: are you including the full prompt in the hash (including the system prompt)? If the system prompt varies per user or per session, keys that look similar are different. Consider hashing only the user message for lookup and using the full key only for storage.`,

    `You structure your system prompt to maximise prompt caching: the stable instructions at the top, the dynamic elements at the end. Why does the ordering matter for prompt caching? Prompt caching on Anthropic works on the prefix of the prompt. The cache stores the KV representations up to the designated cache breakpoint. For the cache to hit, the prefix must be byte-for-byte identical. If you put dynamic elements (the user's name, today's date) at the beginning, the prefix is different for every request and the cache never hits. By placing the stable 2000-token system prompt at the top and the dynamic elements at the end, the cache prefix is the same across all requests and you pay the discounted cache-read rate for those 2000 tokens.`,

    `You implement a model router: a lightweight classifier that sends queries to gpt-4o-mini (cheap) or gpt-4o (expensive). The classifier itself costs $0.0001 per call. Your expected cost savings from routing are $0.005 per routed request. Is the classifier worth it? Yes — $0.0001 classification cost to save $0.005 is a 50x return. But the calculation must also include quality: if 10% of queries are misrouted to the cheap model and produce bad responses, the cost of those bad responses (in user trust, in repeat queries, in support) must be factored in. The real optimisation is not just cost — it is cost-adjusted quality.`,

    `You want to use the batch API for your nightly eval runs. Your eval set has 30 questions. You currently run them synchronously during CI and it takes 4 minutes and costs $0.80. With the batch API, the eval would run overnight and cost $0.40. What do you lose and what do you gain? You lose: immediate feedback on PRs — evals will not block a merge if they run overnight. You gain: 50% cost reduction. The right architecture: run a 5-question smoke test synchronously in CI (fast, cheap, immediate) and the full 30-question eval overnight via batch API. The smoke test blocks critical regressions in CI. The full batch eval provides comprehensive quality monitoring. Use both.`,

    `After applying all your optimisations, your project's cost per request has dropped from $0.022 to $0.010. You achieved the 50% target. Now you want to maintain this as the project evolves. What process ensures cost does not creep back up? Add cost tracking to your eval pipeline: each eval run records the average cost per request alongside quality metrics. Set an alert if cost exceeds $0.012 (20% above your optimised baseline). Review the cost breakdown whenever the prompt changes significantly. Treat cost as a first-class metric alongside quality, not as an afterthought you address when bills are too high.`,
  ],

  common_mistakes: [
    `Caching responses with a TTL that is too long. Model responses can become stale if they reference current events, prices, or time-sensitive information. Set appropriate TTLs: factual/conceptual queries can be cached for 24 hours, time-sensitive queries for 1 hour or not at all. Add a cache-bypass header or parameter for queries that must always be fresh.`,

    `Implementing semantic caching with a threshold too low. A similarity of 0.85 might cache a response about "Python list comprehensions" and return it for a question about "Python list slicing" — close enough in embedding space, wrong in content. Start at 0.95 and measure the false positive rate before lowering the threshold.`,

    `Not measuring the quality impact of model routing. Routing 40% of queries to gpt-4o-mini and claiming a 40% cost reduction is misleading if those queries get worse responses. Measure quality separately on mini-routed and flagship-routed queries. The cost savings only count if quality holds.`,

    `Caching at the wrong layer. If you cache the final formatted response and then change the response format, all cached responses are in the old format. Cache the model completion (text) and apply formatting at display time. This makes the cache format-agnostic.`,

    `Forgetting that the optimisation work itself costs time. An engineer spending two weeks optimising a system that costs $30/month is optimising the wrong thing. Focus optimisation effort on high-cost, high-volume features first.`,
  ],

  debug_help: `The most frustrating caching bug is a cache that never hits even though you know the same queries are being made. Debug by logging the cache key for every request and checking for unexpected variation. Common causes: (1) a timestamp or request ID is included in the prompt, making every key unique, (2) the system prompt includes dynamic content that was not intended to be dynamic (a user ID, a session token), (3) the cache key includes whitespace that varies between calls (trailing newlines, different line endings). Print the exact cache key as a hex string to catch invisible characters.`,

  ai_assist: `Use Claude to help you analyse your cost breakdown and identify the highest-impact optimisation to implement first. Describe your current cost per request, the breakdown by component (system prompt tokens, user message tokens, output tokens, tool call overhead), and your query distribution. Ask it to prioritise the optimisations by expected impact. Review its analysis — the recommended priority might differ based on your actual distribution and the specific models you use.`,

  stretch: [
    `Implement semantic caching with Qdrant as the cache store. Embed each user query, store in Qdrant alongside the model response, and query for similar embeddings before making an API call. Measure the hit rate and the average similarity score of cache hits.`,
    `Build a cost forecasting model: given current daily usage and the trend over the last 30 days, project the monthly cost under different growth scenarios (flat, 10% weekly growth, 50% weekly growth). Display it in your cost dashboard with alerts when the projection exceeds budget.`,
    `Implement A/B routing: send 10% of requests to a cheaper model, measure quality on those requests via LLM judge, and report weekly on whether the cheap model is performing within acceptable quality bounds. Use this to continuously validate your routing decisions.`,
  ],
});

rewriteWeek("ai-engineering", 20, {
  context: `Code that works locally but is not deployed is not a product. Deploying AI features involves every challenge of deploying regular web features — servers, containers, environment variables, scaling — plus AI-specific challenges: streaming responses through your hosting layer, managing API key rotation, handling the latency characteristics of large model calls, and keeping long-running agent tasks alive when HTTP connections time out.

Platform choices matter. Vercel and Railway are excellent for Next.js and Python FastAPI apps respectively, with one-click GitHub integration and automatic deploys. Fly.io gives you more control and is cheaper at modest scale. Cloudflare Workers run at the edge globally with ultra-low cold starts but have execution time limits that may affect long model calls. AWS Lambda is flexible but cold starts add latency for the first request after idle. Matching the platform to your app's characteristics is the first deployment decision.

Streaming through a hosting layer is not always transparent. Vercel functions have a 30-second timeout on the Hobby tier that breaks long streaming responses. Netlify has similar constraints. Cloudflare Workers have a different streaming model than Node.js. When you deploy a streaming AI endpoint, test the actual streaming behaviour on the target platform — do not assume it works the same way it did locally.

Long-running requests are the hardest case. An agent that researches a topic for 3-5 minutes cannot use a synchronous HTTP endpoint. The architecture for long-running tasks: the HTTP endpoint accepts the request and returns a job ID immediately. A background worker executes the task. The client polls for results or receives a webhook when complete. This is standard async job queue architecture applied to AI tasks.

This week you deploy your strongest project from the last 19 weeks. It must have a public URL, work reliably under repeated use, and handle errors gracefully.`,

  pre_flight: `Choose the project to deploy. Pick the platform: Vercel, Railway, Render, or Fly.io. Have Docker installed if you are using a containerised deployment. Know how to set environment variables (API keys, database URLs) in your target platform's dashboard. Understand the difference between a serverless function (stateless, short-lived) and a persistent server (stateful, long-lived). Your project type should dictate the deployment model.`,

  mastery_questions: [
    `You deploy a streaming FastAPI endpoint to Railway. Locally, responses stream word by word. On Railway, the entire response appears at once after a delay. What is likely happening? The hosting layer is buffering the streaming response. Common cause: Railway (or a reverse proxy in front of it) is waiting for the response to complete before forwarding it to the client. Fix: set the correct headers to disable buffering: \`X-Accel-Buffering: no\` (for nginx reverse proxies), ensure your FastAPI endpoint returns a \`StreamingResponse\` not a \`Response\`, and verify the ASGI server (uvicorn) is configured for streaming. Test with curl and the --no-buffer flag to confirm streaming is working before browser testing.`,

    `Your deployed agent app receives a request and starts a 4-minute research task. The HTTP connection times out after 30 seconds and the client receives a 504. The task continues running on the server but the client never gets the result. What is the correct architecture? Decouple the HTTP request from the task execution. The endpoint accepts the request, starts the task in a background worker (Celery, ARQ, or a simple asyncio.create_task), and returns \`{"task_id": "abc123", "status": "running"}\` immediately. The client polls \`GET /task/abc123\` every 5 seconds for status. When the task completes, the status response includes the result. If you want to avoid polling, send the result to a webhook URL that the client provides in the original request.`,

    `You want to rotate your OpenAI API key without downtime. How do you structure your deployment for zero-downtime key rotation? Store the API key in your platform's secret management (Railway Secrets, Vercel Environment Variables, AWS Secrets Manager), not in a committed config file. When you rotate the key, update the secret in the platform dashboard. Trigger a re-deploy if your platform does not reload secrets dynamically. For production systems, store two keys with 50/50 traffic split, rotate by updating one key and shifting traffic, then rotate the second. Full rotation completes with no downtime.`,

    `Your AI app handles 1000 requests per day without issues. Traffic spikes to 5000 requests on a Thursday after you are mentioned on a newsletter. Latency spikes and some requests time out. What does your architecture need to handle this? Three things: (1) rate limiting at the API gateway level to protect your budget (10x traffic means 10x API cost — have a spending limit on your OpenAI/Anthropic account), (2) a queue in front of your AI processing so peak demand is smoothed rather than dropped, (3) horizontal scaling in your hosting platform if your server is CPU-bound (unlikely for API-heavy AI apps, but possible). Also: have a cached fallback for the most common queries so peak traffic does not all hit the model.`,

    `You want to monitor the health of your deployed AI app without a complex observability stack. What minimal monitoring is worth setting up on day one? Three things: (1) an uptime check that pings your app every minute and alerts you if it fails (UptimeRobot, Better Uptime — both have free tiers), (2) error logging to a service that notifies you when errors occur (Sentry has a generous free tier for exceptions), (3) API cost alerts from your provider dashboard (set a monthly budget limit with email notification). These three cover the most common failure modes — app goes down, app throws errors, app overspends — and cost essentially nothing to set up.`,
  ],

  common_mistakes: [
    `Not setting resource limits on your deployment. An AI app with a bug can make runaway API calls, spending $200 in an hour. Set a spending limit in your provider dashboard. Set a maximum request count in your app's rate limiter. Set a container memory limit in your hosting platform. Limits prevent accidents from becoming disasters.`,

    `Deploying without a health check endpoint. A GET /health endpoint that returns 200 OK is required for load balancers, container orchestrators, and uptime monitors. Without it, your platform may not know when your app is unhealthy. Add it before your first deploy.`,

    `Hardcoding the API base URL or model name in your deployment. When you need to switch models or point to a different API endpoint, a hardcoded value requires a code change and redeploy. Use environment variables for the model name and base URL. Switching model versions becomes a config change, not a code change.`,

    `Not testing the deployed app under realistic conditions before announcing it publicly. Deploy, then manually test: What happens when the API key is rate limited? What does the user see? What happens when a request takes 30 seconds? Does streaming work on mobile? Does error handling surface a useful message? These tests take 30 minutes and prevent embarrassing public failures.`,

    `Ignoring cold start latency for serverless deployments. The first request after idle can take 2-5 seconds to start the function container before any AI processing begins. For user-facing features, this is noticeable. Solutions: keep-warm pings (hit the endpoint every 5 minutes to prevent cold starts), or move to a persistent server deployment if cold start latency is unacceptable.`,
  ],

  debug_help: `The most common post-deploy failure is an environment variable that exists locally but was not added to the production environment. Symptoms: a 500 error with "NoneType has no attribute" or "KeyError" pointing to an API key or database URL. Fix: add a startup check that validates all required environment variables are present before the app starts serving requests. Log the missing variable name but not its value. This turns a cryptic runtime error into an explicit "OPENAI_API_KEY is not set" message that is diagnosable from logs.`,

  ai_assist: `Use Claude to help you write a deployment checklist for your specific project. Describe the project (language, framework, features, external dependencies) and ask it to produce a pre-deploy checklist covering: environment variable audit, API key security, error handling verification, streaming test, rate limiting configuration, cost alerts, health check endpoint, and DNS configuration. Review and customise the checklist for your specific hosting platform.`,

  stretch: [
    `Set up a staging environment that is automatically deployed on every PR and torn down when the PR closes. This gives you a live preview URL for every code change, identical to production. Vercel provides this by default; for other platforms, use branch-based deploys.`,
    `Implement infrastructure as code for your deployment: a Railway or Render config file (or Terraform for AWS) that defines your app, its environment variables (references to secrets, not values), and its resource limits. Check this into git alongside your app code.`,
    `Add a /metrics endpoint that returns: request count (last hour), error count (last hour), p50/p95/p99 latency, and total API cost (today). This is the starting point for a production metrics dashboard.`,
  ],
});
