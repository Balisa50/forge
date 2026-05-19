/**
 * Close the curriculum gaps for FAANG / senior-level roles.
 * Appends new weeks AT THE END of each track so existing students
 * (Fatoumatta + Gifty currently on DA) keep their week numbers stable -
 * refresh-roadmap-details only touches existing tasks, so new weeks
 * only appear for NEW seeds.
 *
 * Data Analysis: + Power BI mastery week
 * Data Science:  + LoRA/PEFT, + RAG, + Computer Vision, + Causal Inference,
 *                  + ML Fairness, + extended capstone (3 weeks instead of 1)
 *
 * Run from repo root:  node scripts/add-elite-weeks.cjs
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "data", "roadmaps");

// -------- Data Analysis: Power BI dedicated week ----------------------
const DA_NEW = [
  {
    number: 28,
    title: "Power BI Mastery - DAX, modeling, deployment",
    phase: "Advanced BI",
    commitment_hours: "8-10",
    context:
      "Power BI is the BI tool used by more companies than Tableau, Looker, and Qlik combined. This week you get fluent: DAX measures, data modeling with relationships, and publishing to Power BI Service. By Sunday you have a Power BI version of your Superstore dashboard published to a workspace.",
    topics: [
      "Power BI Desktop interface and Power Query (M language basics)",
      "Data modeling with relationships (1:1, 1:many, many:many)",
      "Star schema vs flat tables in Power BI",
      "DAX measures vs calculated columns (when to use which)",
      "Time intelligence DAX (YTD, YoY, rolling averages)",
      "Drill-through pages and bookmarks",
      "Publishing to Power BI Service + workspaces",
      "Power BI vs Tableau - when to recommend each",
    ],
    tasks: [
      "Install Power BI Desktop (free on Windows; web version on Mac)",
      "Import Superstore CSV and build the data model",
      "Write 8 DAX measures (Total Sales, Margin %, YoY Growth, Top-N filters, etc)",
      "Build a 4-page dashboard (Overview, Sales detail, Product detail, Customer detail)",
      "Add a drill-through page from any product to its order history",
      "Publish to Power BI Service free tier - paste the public-share URL",
      "Compare Power BI version to Tableau version - write SWITCH.md noting which tool wins for which task",
    ],
    outputs: [
      "Public Power BI Service URL of your Superstore dashboard",
      "DAX measures committed in dax-measures.md",
      "SWITCH.md comparing Power BI vs Tableau for this analysis",
    ],
    project:
      "Superstore in Power BI - a 4-page Power BI Service dashboard with proper data modeling, DAX measures, and drill-through. Same insights as your Tableau version, demonstrating fluency in both major BI tools.",
    resources: [
      {
        label: "Power BI Beginner in 30 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=Power+BI+beginner+tutorial+30+minutes+Pragmatic+Works",
        note: "30 min. Pragmatic Works walkthrough. Open Power BI on the side and follow along.",
      },
      {
        label: "DAX measures fundamentals - SQLBI (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=DAX+measures+vs+calculated+columns+SQLBI",
        note: "20 min. SQLBI is THE Power BI authority. Measures vs calculated columns is the #1 confusion point.",
      },
      {
        label: "Power BI data modeling 101 (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=Power+BI+data+modeling+star+schema+beginner",
        note: "15 min. Relationships, cardinality, star schema. The thing that makes Power BI fast.",
      },
      {
        label: "Time intelligence DAX in 12 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=Power+BI+time+intelligence+DAX+YoY+YTD",
        note: "12 min. YoY, YTD, rolling averages. The DAX patterns you'll use weekly in any job.",
      },
      {
        label: "Drill-through pages tutorial (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=Power+BI+drill+through+pages+tutorial",
        note: "8 min. Click a customer name, jump to a customer-detail page. Pro feature in 8 minutes.",
      },
      {
        label: "Power BI Service deployment in 6 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=Power+BI+publish+to+service+workspace+tutorial",
        note: "6 min. From Desktop to live URL.",
      },
      {
        label: "Power BI Desktop download (free, Windows)",
        url: "https://powerbi.microsoft.com/desktop/",
        note: "Free download. Mac users use the web version at app.powerbi.com.",
      },
    ],
    days: [
      {
        number: 1,
        title: "Install + first dashboard",
        summary: "Install Power BI Desktop, import Superstore, build the simplest possible visual.",
        items: [
          { kind: "video", title: "Power BI Beginner in 30 min", url: "https://www.youtube.com/results?search_query=Power+BI+beginner+tutorial+30+minutes+Pragmatic+Works", duration_min: 30 },
          { kind: "exercise", title: "Import + first bar chart", body: "Install Power BI Desktop. File > Get Data > Excel > select Superstore. Drag Region to Axis, Sales to Values. You have your first Power BI visual." },
        ],
      },
      {
        number: 2,
        title: "Data modeling and relationships",
        summary: "Build the model. Star schema. Relationships matter more than measures.",
        items: [
          { kind: "video", title: "Power BI data modeling 101", url: "https://www.youtube.com/results?search_query=Power+BI+data+modeling+star+schema+beginner", duration_min: 15 },
          { kind: "exercise", title: "Build the star schema", body: "Model view. Add a Date table. Create relationships from Date[Date] to Orders[Order Date]. Mark Date as a date table. Now your time intelligence will work." },
        ],
      },
      {
        number: 3,
        title: "DAX measures",
        summary: "Write 8 measures. Measures vs columns is the central concept.",
        items: [
          { kind: "video", title: "DAX measures fundamentals", url: "https://www.youtube.com/results?search_query=DAX+measures+vs+calculated+columns+SQLBI", duration_min: 20 },
          { kind: "exercise", title: "Write 8 DAX measures", body: "Total Sales, Total Profit, Margin %, YoY Sales Growth, MoM Sales, YTD Sales, Top 10 Customers (using TOPN), Average Order Value. Commit them to dax-measures.md." },
        ],
      },
      {
        number: 4,
        title: "Time intelligence",
        summary: "YoY, YTD, rolling averages with DATEADD and SAMEPERIODLASTYEAR.",
        items: [
          { kind: "video", title: "Time intelligence DAX in 12 min", url: "https://www.youtube.com/results?search_query=Power+BI+time+intelligence+DAX+YoY+YTD", duration_min: 12 },
          { kind: "exercise", title: "Build a YoY chart", body: "Use SAMEPERIODLASTYEAR to compute YoY on monthly sales. Add it to a line chart showing this year vs last year." },
        ],
      },
      {
        number: 5,
        title: "Multi-page dashboard",
        summary: "Build 4 pages with cross-page slicers.",
        items: [
          { kind: "exercise", title: "Build 4 pages", body: "Page 1: Executive Overview (KPI tiles + trend). Page 2: Sales detail (by region, sub-category, customer). Page 3: Product detail. Page 4: Customer detail. Add a Year slicer that syncs across all pages (right-click slicer > Sync slicers)." },
        ],
      },
      {
        number: 6,
        title: "Drill-through + bookmarks",
        summary: "Click a customer name, jump to their detail page.",
        items: [
          { kind: "video", title: "Drill-through pages tutorial", url: "https://www.youtube.com/results?search_query=Power+BI+drill+through+pages+tutorial", duration_min: 8 },
          { kind: "exercise", title: "Add drill-through", body: "Right-click on a customer in a table on Page 2 > Drill through > Customer Detail. The drill-through filter is auto-applied to Page 4." },
        ],
      },
      {
        number: 7,
        title: "Publish + compare to Tableau",
        summary: "Publish to Power BI Service. Write SWITCH.md.",
        items: [
          { kind: "video", title: "Power BI Service deployment in 6 min", url: "https://www.youtube.com/results?search_query=Power+BI+publish+to+service+workspace+tutorial", duration_min: 6 },
          { kind: "exercise", title: "Publish + compare", body: "Sign up for Power BI Service free tier (powerbi.microsoft.com). Publish your .pbix from Desktop. Get the share link. Then write SWITCH.md - 1 paragraph each on: what Power BI does better, what Tableau does better, when to recommend each." },
        ],
      },
    ],
    ai_assist:
      "Cursor + Claude can write DAX measures correctly first try. Paste the question in plain English ('measure for sales growth vs same period last year, returning %') and validate the formula against SQLBI's docs. Use AI to generate alternative ways to model the same data (long-vs-wide). Have it critique your dashboard layout from a CFO perspective.",
    stakeholder_moment:
      "Power BI is the de facto tool inside Microsoft-stack companies (60% of mid-large enterprises). Your audience is often a manager who already uses Power BI in their day job - they'll ask 'why didn't you use Tableau?' Be ready to defend the tool choice based on the company's existing stack, not personal preference.",
    mastery_questions: [
      "Install Power BI Desktop and paste a screenshot of the version number.",
      "Build your data model. Paste a screenshot of the Model view showing the relationships you created. Is your Date table marked? Yes/no.",
      "Write a DAX measure: 'Margin %' that returns Profit / Sales. Paste the exact DAX formula.",
      "Write a DAX measure: 'YoY Sales Growth %' using SAMEPERIODLASTYEAR. Paste the formula.",
      "Build the Top 10 Customers measure using TOPN. Paste the formula and the top 3 customer names it returns.",
      "Build 4 pages. Add a Year slicer that syncs across all 4. Confirm with a screenshot of the same Year filter applied on 2 different pages.",
      "Add drill-through from a customer table on Page 2 to a customer detail page on Page 4. Confirm with a 2-screenshot sequence (click + landing page).",
      "Publish to Power BI Service. Paste the public share URL.",
      "Compare to your Tableau version: in SWITCH.md write one paragraph each on (a) what Power BI does better here, (b) what Tableau does better, (c) when to recommend each. Paste the GitHub URL.",
      "Push your .pbix file to GitHub. Paste the commit URL.",
    ],
  },
];

// -------- Data Science: LoRA, RAG, CV, Causal, Ethics, capstone ext --
const DS_NEW = [
  {
    number: 32,
    title: "LLM Era - Fine-tuning with LoRA + PEFT",
    phase: "Modern ML",
    commitment_hours: "8-10",
    context:
      "By 2026, fine-tuning a 7B-parameter LLM on consumer hardware is normal - LoRA and PEFT make it possible. This week you fine-tune a small LLM (TinyLlama or Phi-2) on a custom dataset, evaluate it, and ship the adapter weights. You'll know exactly when to fine-tune vs prompt-engineer.",
    topics: [
      "LoRA intuition - why low-rank adaptation works",
      "PEFT library overview (Hugging Face)",
      "QLoRA - quantized LoRA for consumer GPUs",
      "When to fine-tune vs few-shot prompt vs RAG",
      "Hardware reality - what fits in 8GB / 16GB / 24GB VRAM",
      "Adapter weights - the 10-50 MB output you actually ship",
      "Evaluation: BLEU, perplexity, eyeball test, human-rated",
    ],
    tasks: [
      "Set up Colab T4 (free GPU)",
      "Pick a small base model (TinyLlama-1.1B or Phi-2)",
      "Build a 200-row fine-tuning dataset (instruction format)",
      "Fine-tune with LoRA via PEFT in 1-2 hours of GPU time",
      "Evaluate before vs after on 30 held-out examples",
      "Save adapter weights and demo notebook",
    ],
    outputs: [
      "lora-finetune notebook in your DS portfolio repo",
      "adapter_model.safetensors saved with Git LFS",
      "EVAL.md with before/after examples + your honest assessment",
      "1-paragraph blog explaining when fine-tuning is worth it",
    ],
    project:
      "FineTune-1.0 - a real LoRA fine-tune of a small LLM on a niche task (e.g. converting Superstore questions to SQL, classifying Reddit posts as ML-news vs ML-learning, etc). Demonstrates you can do what 90% of self-taught DS still cannot.",
    resources: [
      {
        label: "LoRA explained in 15 min - Yannic Kilcher (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=LoRA+low+rank+adaptation+explained+Yannic+Kilcher",
        note: "15 min. The clearest LoRA intuition video. Watch BEFORE coding anything.",
      },
      {
        label: "QLoRA fine-tuning in Colab - free GPU walkthrough (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=QLoRA+fine+tune+Colab+free+GPU+TinyLlama",
        note: "25 min. Walkthrough you copy-paste into Colab. Fine-tune in 1-2 hours of T4 time.",
      },
      {
        label: "When to fine-tune vs prompt vs RAG - DeepLearning.AI (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=when+to+fine+tune+vs+prompt+vs+RAG+DeepLearning.AI",
        note: "10 min. The decision tree. Most problems do NOT need fine-tuning.",
      },
      {
        label: "PEFT library docs - Hugging Face",
        url: "https://huggingface.co/docs/peft",
        note: "Reference. Use after watching the videos. The official API.",
      },
      {
        label: "TinyLlama base model on Hugging Face",
        url: "https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0",
        note: "1.1B param chat model. Small enough to fine-tune on T4. Good starting point.",
      },
      {
        label: "Microsoft Phi-2 on Hugging Face",
        url: "https://huggingface.co/microsoft/phi-2",
        note: "2.7B param. Slightly bigger, slightly better at instructions. Also T4-compatible.",
      },
    ],
    days: [
      { number: 1, title: "Understand LoRA", summary: "Watch + read. No coding yet.", items: [
        { kind: "video", title: "LoRA explained in 15 min", url: "https://www.youtube.com/results?search_query=LoRA+low+rank+adaptation+explained+Yannic+Kilcher", duration_min: 15 },
        { kind: "reflection", title: "Decision tree", body: "When would you fine-tune vs few-shot vs RAG? Write 3 lines for each in WHY_FINETUNE.md." },
      ] },
      { number: 2, title: "Pick a task + dataset", summary: "200 instruction-format examples.", items: [
        { kind: "exercise", title: "Build dataset", body: "Pick: 'convert Superstore questions to SQL' OR 'tag Reddit posts as news/learning'. Generate 200 instruction examples (jsonl format). Use ChatGPT to help - then hand-validate." },
      ] },
      { number: 3, title: "Set up Colab T4", summary: "Free GPU. Install PEFT, bitsandbytes.", items: [
        { kind: "video", title: "QLoRA Colab walkthrough", url: "https://www.youtube.com/results?search_query=QLoRA+fine+tune+Colab+free+GPU+TinyLlama", duration_min: 25 },
      ] },
      { number: 4, title: "Run the fine-tune", summary: "1-2 hours of GPU time. Save checkpoint.", items: [
        { kind: "exercise", title: "Fine-tune TinyLlama", body: "Follow the QLoRA notebook with YOUR dataset. Train 3 epochs. Save adapter_model.safetensors. Total: ~$0 (free Colab)." },
      ] },
      { number: 5, title: "Evaluate", summary: "Before vs after on 30 held-out examples.", items: [
        { kind: "exercise", title: "Eval notebook", body: "Load base model, run 30 held-out prompts. Load base + adapter, run same 30. Diff the outputs. Score each pair 1-5 manually. Compute average improvement." },
      ] },
      { number: 6, title: "Ship the adapter", summary: "Push to HF Hub or Git LFS.", items: [
        { kind: "exercise", title: "Publish adapter", body: "Push adapter_model.safetensors via Git LFS or upload to your Hugging Face Hub account. Paste the URL." },
      ] },
      { number: 7, title: "Write the EVAL post", summary: "1-paragraph honest blog post.", items: [
        { kind: "exercise", title: "Honest writeup", body: "Did fine-tuning beat zero-shot prompting? Was it worth the time? When would you do it again? Write EVAL.md and a 200-word LinkedIn or Dev.to post." },
      ] },
    ],
    ai_assist:
      "Use Claude to generate your instruction dataset (200 examples). Paste a few good examples, ask it to extrapolate the format. Use Cursor to debug bitsandbytes install errors on Colab (common). Have AI critique your eval methodology - it'll catch unfair comparisons.",
    mastery_questions: [
      "Open WHY_FINETUNE.md and paste your 3-line decision tree for fine-tune vs few-shot vs RAG.",
      "Pick your task. Paste 5 example rows from your 200-row instruction dataset.",
      "Set up Colab T4. Paste a screenshot of nvidia-smi showing the T4 detected.",
      "Run the fine-tune. Paste the final training loss + training time.",
      "Pick 5 held-out prompts. Run them on base model. Paste base outputs.",
      "Run the same 5 on base + adapter. Paste the new outputs side by side with base.",
      "Score each pair 1-5 manually. Paste your 5 scores + average.",
      "Save adapter_model.safetensors. Paste either the Hugging Face Hub URL or the Git LFS file URL.",
      "Write EVAL.md answering: did fine-tuning beat zero-shot prompting on YOUR task? Be honest. Paste the URL.",
      "Publish a 200-word post on LinkedIn or Dev.to about your fine-tune experience. Paste the live URL.",
    ],
  },
  {
    number: 33,
    title: "RAG Systems - retrieval-augmented generation in production",
    phase: "Modern ML",
    commitment_hours: "8-10",
    context:
      "RAG is how 95% of real LLM applications work in 2026. This week you build a working RAG pipeline: chunk a document corpus, embed it, store in a vector DB, retrieve relevant chunks for a query, feed to an LLM. By Sunday you ship a deployed Q&A app over a real corpus.",
    topics: [
      "RAG architecture - retrieve, augment, generate",
      "Chunking strategies (fixed, semantic, recursive)",
      "Embedding models - sentence-transformers vs OpenAI ada-002",
      "Vector databases - FAISS (local), Chroma, Pinecone (managed)",
      "Hybrid search (vector + BM25)",
      "Re-ranking with cross-encoders",
      "Evaluation: retrieval accuracy, answer faithfulness",
      "Streamlit deploy of a RAG app",
    ],
    tasks: [
      "Pick a corpus (your own notes, a public docs site, ~100 documents)",
      "Chunk + embed with sentence-transformers",
      "Build a FAISS local vector index",
      "Build a retrieve-then-generate pipeline with Claude or open-source LLM",
      "Add hybrid search (vector + keyword)",
      "Evaluate on 20 hand-written Q&A pairs",
      "Deploy as a Streamlit Q&A app",
    ],
    outputs: [
      "rag-qa repo with corpus loader, indexer, retriever, generator",
      "Live Streamlit URL for Q&A over your corpus",
      "EVAL.md with retrieval accuracy + answer quality numbers",
    ],
    project:
      "RAG-QA - a deployed question-answering app over a corpus you care about. Demonstrates the LLM application pattern every enterprise wants.",
    resources: [
      {
        label: "RAG explained in 12 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=Retrieval+Augmented+Generation+RAG+explained+15+min",
        note: "12 min. The clearest intuition for the retrieve-augment-generate loop.",
      },
      {
        label: "Build a RAG app with LangChain in 20 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=LangChain+RAG+tutorial+FAISS+OpenAI+20+min",
        note: "20 min. End-to-end walkthrough you can adapt.",
      },
      {
        label: "Sentence Transformers in 8 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=sentence+transformers+tutorial+all-MiniLM-L6-v2+embeddings",
        note: "8 min. The default open-source embedding model. Free, fast, decent quality.",
      },
      {
        label: "Hybrid search BM25 + vector (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=hybrid+search+BM25+vector+retrieval+tutorial",
        note: "10 min. Vector retrieval alone misses keyword matches. Hybrid wins on real corpora.",
      },
      {
        label: "FAISS Github docs",
        url: "https://github.com/facebookresearch/faiss/wiki/Getting-started",
        note: "Reference. Local vector DB from Meta. 1M+ vectors easily.",
      },
      {
        label: "LangChain RAG docs",
        url: "https://python.langchain.com/docs/use_cases/question_answering/",
        note: "Reference. After the video.",
      },
    ],
    days: [
      { number: 1, title: "Understand RAG", summary: "Watch + sketch the architecture.", items: [
        { kind: "video", title: "RAG explained in 12 min", url: "https://www.youtube.com/results?search_query=Retrieval+Augmented+Generation+RAG+explained+15+min", duration_min: 12 },
        { kind: "reflection", title: "Sketch", body: "Draw the RAG loop: corpus -> chunks -> embeddings -> vector DB -> query -> retrieve -> augment prompt -> LLM -> answer. Paste in NOTES.md." },
      ] },
      { number: 2, title: "Pick corpus + chunk", summary: "100 documents. Recursive chunking.", items: [
        { kind: "exercise", title: "Load + chunk", body: "Pick a corpus. Use LangChain's RecursiveCharacterTextSplitter with chunk_size=500, overlap=50. Save chunks.jsonl." },
      ] },
      { number: 3, title: "Embed + index", summary: "sentence-transformers + FAISS.", items: [
        { kind: "video", title: "Sentence Transformers in 8 min", url: "https://www.youtube.com/results?search_query=sentence+transformers+tutorial+all-MiniLM-L6-v2+embeddings", duration_min: 8 },
        { kind: "exercise", title: "Build FAISS index", body: "Use all-MiniLM-L6-v2 to embed all chunks. Index in FAISS. Save index to disk." },
      ] },
      { number: 4, title: "Retrieve + generate", summary: "First end-to-end query.", items: [
        { kind: "video", title: "LangChain RAG tutorial", url: "https://www.youtube.com/results?search_query=LangChain+RAG+tutorial+FAISS+OpenAI+20+min", duration_min: 20 },
        { kind: "exercise", title: "First query", body: "Query: embed, retrieve top 5 chunks, build a prompt: 'Answer using this context: [chunks]. Question: [user query]'. Send to Claude or GPT. Print answer." },
      ] },
      { number: 5, title: "Add hybrid search", summary: "Vector + BM25 keyword.", items: [
        { kind: "video", title: "Hybrid search tutorial", url: "https://www.youtube.com/results?search_query=hybrid+search+BM25+vector+retrieval+tutorial", duration_min: 10 },
        { kind: "exercise", title: "Hybrid retriever", body: "Use rank_bm25 + your FAISS retriever. Combine scores. Compare answers vs pure vector retrieval." },
      ] },
      { number: 6, title: "Evaluate", summary: "20 hand-written Q&A pairs.", items: [
        { kind: "exercise", title: "Eval", body: "Hand-write 20 Q&A pairs from your corpus. Run all 20 through your RAG. Score retrieval (did the right chunk come back?) and answer quality (1-5). Compute averages." },
      ] },
      { number: 7, title: "Deploy", summary: "Streamlit app, public URL.", items: [
        { kind: "exercise", title: "Streamlit RAG app", body: "Build a Streamlit text-input chat over your RAG. Deploy to Streamlit Cloud. Paste live URL." },
      ] },
    ],
    ai_assist:
      "Use Cursor to write the chunking + indexing code in one prompt. Have Claude generate the RAG prompt template (system prompt that prevents hallucination). Use AI to generate your 20 hand-written eval Q&A pairs from the corpus - then verify each one yourself.",
    mastery_questions: [
      "Sketch your RAG architecture in NOTES.md. Paste the GitHub URL.",
      "Pick your corpus. How many documents? What's the total token count? Paste numbers.",
      "Chunk with RecursiveCharacterTextSplitter (500 chunk, 50 overlap). How many chunks total?",
      "Embed all chunks with all-MiniLM-L6-v2. How long did it take? Paste seconds + chunks/sec.",
      "Build FAISS index. Run your first query. Paste the top-3 retrieved chunks for one example question.",
      "Build the generate step (Claude or open-source LLM). Paste a full Q + retrieved chunks + generated answer.",
      "Add hybrid search (BM25 + vector). Show one query where hybrid retrieves a different (better) top-1 chunk than pure vector.",
      "Hand-write 20 Q&A pairs from your corpus. Run all 20. Paste retrieval accuracy (% correct chunk in top 5) + average answer quality (1-5).",
      "Deploy to Streamlit Cloud. Paste the live URL.",
      "Push rag-qa repo + paste GitHub URL.",
    ],
  },
  {
    number: 34,
    title: "Computer Vision - CNN, transfer learning, Vision Transformers",
    phase: "Vision",
    commitment_hours: "8-10",
    context:
      "Computer vision is now a one-week field for working DS, thanks to transfer learning. This week you fine-tune a pretrained ResNet on a real dataset, deploy it as an API, and explore Vision Transformers. You'll understand when CV is the right tool and when it's overkill.",
    topics: [
      "CNNs intuition - convolutions, pooling, feature maps",
      "Transfer learning - why you almost never train from scratch",
      "Image preprocessing - resize, normalize, augment",
      "Fine-tuning a pretrained ResNet50 or EfficientNet",
      "Vision Transformers (ViT) - what changed",
      "Object detection vs classification vs segmentation",
      "Inference cost - latency, model size on edge",
      "Deploying a CV model as an API",
    ],
    tasks: [
      "Pick a CV dataset (CIFAR-10 or a Kaggle image dataset)",
      "Fine-tune ResNet50 on the dataset in PyTorch",
      "Evaluate test accuracy + confusion matrix",
      "Try a ViT model on the same task - compare",
      "Build a FastAPI endpoint for inference on an uploaded image",
      "Deploy to HF Spaces with a Gradio UI",
    ],
    outputs: [
      "cv-classifier repo with training notebook + saved model",
      "Live HF Spaces URL with Gradio image classifier",
      "RESULTS.md with ResNet vs ViT comparison",
    ],
    project:
      "CV-Classifier - a deployed image classifier on a real task. Bird species, dog breeds, food types - pick something specific. Demonstrates CV competence for any role that needs it.",
    resources: [
      {
        label: "CNNs in 10 min - StatQuest (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=convolutional+neural+networks+StatQuest",
        note: "10 min. The clearest CNN intuition video.",
      },
      {
        label: "Transfer learning in PyTorch tutorial (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=PyTorch+transfer+learning+ResNet+tutorial+15+min",
        note: "15 min. Fine-tune ResNet50 in PyTorch in 15 minutes.",
      },
      {
        label: "Vision Transformers explained in 12 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=Vision+Transformer+ViT+explained+12+min",
        note: "12 min. What ViT changed vs CNN. The new state of the art for most CV tasks.",
      },
      {
        label: "FastAPI image upload endpoint (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=FastAPI+image+upload+file+endpoint+tutorial",
        note: "8 min. Receiving image uploads in FastAPI.",
      },
      {
        label: "Gradio image classifier (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=Gradio+image+classifier+HuggingFace+Spaces",
        note: "10 min. Gradio is to images what Streamlit is to text. Easiest CV demo UI.",
      },
      {
        label: "TIMM (PyTorch image models) library",
        url: "https://github.com/huggingface/pytorch-image-models",
        note: "Reference. 700+ pretrained vision models. Use this for state-of-the-art backbones.",
      },
    ],
    days: [
      { number: 1, title: "Intuition", summary: "Watch CNN + ViT videos.", items: [
        { kind: "video", title: "CNNs in 10 min", url: "https://www.youtube.com/results?search_query=convolutional+neural+networks+StatQuest", duration_min: 10 },
        { kind: "video", title: "ViT in 12 min", url: "https://www.youtube.com/results?search_query=Vision+Transformer+ViT+explained+12+min", duration_min: 12 },
      ] },
      { number: 2, title: "Pick dataset + preprocess", summary: "CIFAR-10 or Kaggle.", items: [
        { kind: "exercise", title: "Load + preprocess", body: "torchvision datasets or download Kaggle. Resize to 224x224. Normalize with ImageNet stats. Build dataloaders." },
      ] },
      { number: 3, title: "Fine-tune ResNet50", summary: "Transfer learning in PyTorch.", items: [
        { kind: "video", title: "PyTorch transfer learning", url: "https://www.youtube.com/results?search_query=PyTorch+transfer+learning+ResNet+tutorial+15+min", duration_min: 15 },
        { kind: "exercise", title: "Fine-tune", body: "Load ResNet50 pretrained. Freeze backbone, train head 3 epochs. Then unfreeze top 2 layers, train 2 more. Save best model." },
      ] },
      { number: 4, title: "Evaluate", summary: "Confusion matrix + per-class accuracy.", items: [
        { kind: "exercise", title: "Evaluate", body: "Test accuracy. Plot confusion matrix. Find the 3 worst-classified examples - what went wrong?" },
      ] },
      { number: 5, title: "Try ViT", summary: "Compare against ResNet.", items: [
        { kind: "exercise", title: "ViT comparison", body: "Load ViT from TIMM or HuggingFace. Same data, same training schedule. Compare test accuracy + inference time. Which won and why?" },
      ] },
      { number: 6, title: "FastAPI inference", summary: "Image upload endpoint.", items: [
        { kind: "video", title: "FastAPI image upload", url: "https://www.youtube.com/results?search_query=FastAPI+image+upload+file+endpoint+tutorial", duration_min: 8 },
        { kind: "exercise", title: "Build /predict", body: "POST /predict accepting image file. Run through your model. Return JSON with class + confidence." },
      ] },
      { number: 7, title: "Deploy with Gradio", summary: "HF Spaces, public URL.", items: [
        { kind: "video", title: "Gradio image classifier", url: "https://www.youtube.com/results?search_query=Gradio+image+classifier+HuggingFace+Spaces", duration_min: 10 },
        { kind: "exercise", title: "Ship", body: "Wrap your model in Gradio Interface. Push to HF Spaces. Paste public URL." },
      ] },
    ],
    ai_assist:
      "Cursor + Claude write the data augmentation pipeline correctly first try (random crops, flips, color jitter). Use AI to debug 'CUDA out of memory' (it'll suggest gradient checkpointing). Have it explain the difference between CNN inductive bias and ViT's lack of it - in plain English.",
    mastery_questions: [
      "Pick your CV dataset. Paste image count + class count + a sample image URL.",
      "Build dataloaders with proper preprocessing. Paste the transform code.",
      "Fine-tune ResNet50. Paste final test accuracy.",
      "Plot confusion matrix. Paste the figure URL. Which classes does the model confuse most?",
      "Find the 3 worst-classified test examples. Paste them with predicted vs actual labels.",
      "Try a ViT model. Paste test accuracy + inference time per image.",
      "Compare ResNet vs ViT. Which won on YOUR task and by how much? Write RESULTS.md.",
      "Build FastAPI /predict endpoint. curl with a sample image. Paste request + response.",
      "Deploy Gradio interface to HF Spaces. Paste the public URL.",
      "Push cv-classifier repo. Paste GitHub URL.",
    ],
  },
  {
    number: 35,
    title: "Causal Inference - going beyond correlation",
    phase: "Causal ML",
    commitment_hours: "8-10",
    context:
      "Senior data scientists earn 2x junior ones because they can answer 'will this CHANGE the metric?', not just 'is this CORRELATED?'. This week you learn the causal inference toolkit: DAGs, propensity scores, instrumental variables, and difference-in-differences. By Sunday you can answer one real causal question on your past project data.",
    topics: [
      "Correlation vs causation - the senior-DS distinction",
      "Directed Acyclic Graphs (DAGs) for causal modeling",
      "Confounders, mediators, colliders",
      "Randomized controlled trials (RCTs) - the gold standard",
      "Propensity score matching (when RCT is impossible)",
      "Difference-in-differences (DiD)",
      "Instrumental variables (IVs)",
      "Causal libraries: dowhy, econml",
    ],
    tasks: [
      "Draw the DAG for one decision in your TaxiPulse or Reddit project",
      "Identify confounders, mediators, colliders",
      "Use dowhy to estimate one causal effect with propensity score matching",
      "Validate with a sensitivity analysis",
      "Write a 1-page memo on a causal question your data answers",
    ],
    outputs: [
      "DAG diagram for your chosen question",
      "causal.ipynb with dowhy analysis + sensitivity checks",
      "MEMO.md answering the causal question with appropriate caveats",
    ],
    project:
      "Causal-Memo - a 1-page memo answering one real causal question from your project data, using proper causal inference. Demonstrates senior-DS thinking.",
    resources: [
      {
        label: "Causation vs correlation - Veritasium (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=correlation+causation+Veritasium",
        note: "12 min. The most-shared causation video on the internet. Watch first.",
      },
      {
        label: "DAGs intro for data scientists (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=causal+DAG+confounders+mediators+colliders+data+science",
        note: "15 min. Drawing DAGs is the prerequisite for everything else this week.",
      },
      {
        label: "Propensity Score Matching tutorial (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=propensity+score+matching+python+tutorial",
        note: "20 min. The classic causal technique. Pythonic walkthrough.",
      },
      {
        label: "Difference-in-differences in 12 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=difference+in+differences+causal+inference+tutorial",
        note: "12 min. DiD is the second tool you reach for after PSM.",
      },
      {
        label: "Instrumental Variables explained in 10 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=instrumental+variables+causal+inference+10+min",
        note: "10 min. When you have a great natural experiment hiding in your data.",
      },
      {
        label: "dowhy library on GitHub",
        url: "https://github.com/py-why/dowhy",
        note: "Reference. The standard causal inference library from Microsoft Research.",
      },
      {
        label: "EconML library on GitHub",
        url: "https://github.com/py-why/EconML",
        note: "Reference. Heterogeneous treatment effects - causal ML at scale.",
      },
    ],
    days: [
      { number: 1, title: "Mindset shift", summary: "Watch causation videos. No code yet.", items: [
        { kind: "video", title: "Veritasium causation", url: "https://www.youtube.com/results?search_query=correlation+causation+Veritasium", duration_min: 12 },
        { kind: "reflection", title: "Causal questions", body: "Pick 3 questions from your past projects that LOOK causal. Are they? Write 1 sentence each in NOTES.md." },
      ] },
      { number: 2, title: "DAGs", summary: "Draw one. Identify confounders.", items: [
        { kind: "video", title: "DAGs for DS", url: "https://www.youtube.com/results?search_query=causal+DAG+confounders+mediators+colliders+data+science", duration_min: 15 },
        { kind: "exercise", title: "Draw a DAG", body: "Use dagitty.net (free). Pick: 'does fare increase tip%?' or similar. Draw treatment, outcome, confounders, mediators. Save SVG to repo." },
      ] },
      { number: 3, title: "Propensity score matching", summary: "Code one PSM analysis.", items: [
        { kind: "video", title: "PSM tutorial", url: "https://www.youtube.com/results?search_query=propensity+score+matching+python+tutorial", duration_min: 20 },
        { kind: "exercise", title: "PSM in dowhy", body: "Use dowhy on your data. identify_effect, estimate_effect with method='backdoor.propensity_score_matching'. Paste the estimated ATE." },
      ] },
      { number: 4, title: "Sensitivity analysis", summary: "What if there's an unobserved confounder?", items: [
        { kind: "exercise", title: "Sensitivity check", body: "dowhy refute_estimate with method='placebo_treatment_refuter' and 'random_common_cause'. Report whether your estimate holds up." },
      ] },
      { number: 5, title: "Difference-in-differences", summary: "Try DiD if you have time-series with a treatment moment.", items: [
        { kind: "video", title: "DiD in 12 min", url: "https://www.youtube.com/results?search_query=difference+in+differences+causal+inference+tutorial", duration_min: 12 },
        { kind: "exercise", title: "DiD optional", body: "Pick a treatment moment in your data (e.g. 'after December 2023'). Build treatment/control. Compute DiD. Compare to naive before/after." },
      ] },
      { number: 6, title: "Write the memo", summary: "1 page. Honest about uncertainty.", items: [
        { kind: "exercise", title: "Causal memo", body: "Write MEMO.md: causal question, your estimate, the assumptions you made, the sensitivity check results, and what would change your conclusion. Show this to one person." },
      ] },
      { number: 7, title: "Ship", summary: "Push to GitHub. Commit the DAG.", items: [
        { kind: "exercise", title: "Ship", body: "Commit causal.ipynb + DAG.svg + MEMO.md. Paste the commit URL." },
      ] },
    ],
    ai_assist:
      "Use AI to identify likely confounders for your question - it'll suggest 5 you didn't think of. Have Claude draft the DAG in DAGitty syntax. CRITICALLY: never let AI tell you a result is causal - causation is a judgment, not a calculation. Use AI for the math and the code, but the causal interpretation must be yours.",
    stakeholder_moment:
      "Causal claims are the senior-DS calling card. Your audience for a causal memo is a director or VP making a real decision. They want to know: 'If I do X, what happens to Y?' Be honest about uncertainty. Say 'our best estimate is X with 95% CI [a,b], assuming no unobserved confounders' - never 'X causes Y' without caveats.",
    mastery_questions: [
      "Pick a question from your past projects that LOOKS causal but might not be. Write it in 1 sentence.",
      "Draw the DAG in dagitty.net. Identify treatment, outcome, confounders, mediators, colliders. Paste SVG URL.",
      "List the 3 most concerning confounders. For each, say whether you have data on it.",
      "Run propensity score matching with dowhy. Paste the estimated average treatment effect (ATE) + 95% CI.",
      "Run a placebo refuter (dowhy refute_estimate). Did your estimate survive? Paste result.",
      "Run a random_common_cause refuter. Did it survive? Paste result.",
      "Try difference-in-differences if your data has a treatment moment. Paste estimated DiD effect + 95% CI.",
      "Compare naive correlation vs your causal estimate. By how much did they differ?",
      "Write MEMO.md with honest caveats. Paste the URL.",
      "Push to GitHub. Paste the commit URL.",
    ],
  },
  {
    number: 36,
    title: "ML Fairness and Bias - the audit you actually run",
    phase: "Production ML",
    commitment_hours: "6-8",
    context:
      "Every production ML model gets a fairness audit at any company that takes itself seriously. This week you audit one of your earlier models (Reddit Sentiment, fare predictor, HR Attrition) for demographic parity, equal opportunity, and calibration. By Sunday you've found at least one real bias and documented mitigation options.",
    topics: [
      "Why fairness is a job-relevance issue, not just ethics",
      "Demographic parity, equal opportunity, equalized odds",
      "Calibration across groups",
      "Bias sources: data, label, feedback loops, deployment",
      "Mitigation: data, model, post-processing approaches",
      "Audit frameworks: Fairlearn, AI Fairness 360",
      "Reporting: what to write in BIAS.md",
    ],
    tasks: [
      "Pick one of your earlier models",
      "Identify potential 'sensitive' attributes in the data",
      "Run a Fairlearn audit (or AI Fairness 360)",
      "Find at least one disparity",
      "Document at least 2 mitigation options",
      "Write BIAS.md as a production-ready audit report",
    ],
    outputs: [
      "fairness-audit notebook",
      "BIAS.md with quantified disparities + mitigation recommendations",
      "Updated README pointing to the audit",
    ],
    project:
      "Fairness-Audit - a full audit of one of your earlier models, written as a real production audit document. Demonstrates you can spot bias before it ships, not after it goes public.",
    resources: [
      {
        label: "ML Fairness in 12 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=machine+learning+fairness+demographic+parity+equal+opportunity",
        note: "12 min. The 3 fairness definitions and why they conflict.",
      },
      {
        label: "Fairlearn tutorial - Microsoft (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=Fairlearn+tutorial+Python+Microsoft",
        note: "15 min. The standard Python fairness library. Hands-on.",
      },
      {
        label: "Real-world ML bias examples (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=COMPAS+Amazon+hiring+ML+bias+real+world+cases",
        note: "12 min. COMPAS, Amazon hiring, healthcare risk scores. The cases that put fairness on the map.",
      },
      {
        label: "Fairlearn library on GitHub",
        url: "https://github.com/fairlearn/fairlearn",
        note: "Reference. Microsoft's fairness toolkit.",
      },
      {
        label: "AI Fairness 360 - IBM",
        url: "https://github.com/Trusted-AI/AIF360",
        note: "Reference. IBM's competing toolkit. Different metrics, similar pattern.",
      },
    ],
    days: [
      { number: 1, title: "Concepts", summary: "Watch + read.", items: [
        { kind: "video", title: "ML Fairness in 12 min", url: "https://www.youtube.com/results?search_query=machine+learning+fairness+demographic+parity+equal+opportunity", duration_min: 12 },
        { kind: "video", title: "Real-world bias cases", url: "https://www.youtube.com/results?search_query=COMPAS+Amazon+hiring+ML+bias+real+world+cases", duration_min: 12 },
      ] },
      { number: 2, title: "Pick model + sensitive attribute", summary: "Be honest about which is most at risk.", items: [
        { kind: "exercise", title: "Pick + identify", body: "Pick one model. Identify which attribute(s) in the data could lead to bias (gender, race, age, region, education). For HR Attrition, that might be Gender + Age. For Reddit Sentiment, it might be subreddit." },
      ] },
      { number: 3, title: "Run Fairlearn audit", summary: "Disparity metrics across groups.", items: [
        { kind: "video", title: "Fairlearn tutorial", url: "https://www.youtube.com/results?search_query=Fairlearn+tutorial+Python+Microsoft", duration_min: 15 },
        { kind: "exercise", title: "Audit", body: "Run Fairlearn MetricFrame on your test set. Report demographic parity ratio, equal opportunity ratio. Find the worst-served group." },
      ] },
      { number: 4, title: "Quantify the disparity", summary: "Put a number on the gap.", items: [
        { kind: "exercise", title: "Disparity numbers", body: "For each fairness metric: state the gap (e.g. 'False negative rate is 15pp higher for group A vs group B'). At least 2 metrics, with numbers." },
      ] },
      { number: 5, title: "Document mitigation options", summary: "Three approaches: data, model, post-processing.", items: [
        { kind: "exercise", title: "Mitigations", body: "Document at least 2 concrete mitigations: (a) data-level (rebalance, drop sensitive feature, etc), (b) post-processing (Fairlearn's ThresholdOptimizer). For each: pros + cons + cost." },
      ] },
      { number: 6, title: "Write BIAS.md", summary: "Production-grade audit document.", items: [
        { kind: "exercise", title: "Audit report", body: "Write BIAS.md: Executive summary, methodology, findings (with numbers), 2 mitigation options ranked, recommended action. 1-2 pages." },
      ] },
      { number: 7, title: "Update README + ship", summary: "Point future readers to BIAS.md.", items: [
        { kind: "exercise", title: "Ship", body: "Update your project README with a 'Bias Audit' section linking to BIAS.md. Push to GitHub. Paste commit URL." },
      ] },
    ],
    ai_assist:
      "Use Claude to identify sensitive attributes you might miss. Ask it to suggest fairness metrics appropriate for your problem type. Have it draft the BIAS.md template. CRITICALLY: the conclusions and recommendations must be yours - AI can identify the maths gap, but the business call about WHAT to mitigate is human judgment.",
    stakeholder_moment:
      "BIAS.md is a document a hiring manager wants to see in your portfolio. It signals you know production ML is more than test accuracy. Frame the audit as risk management: 'If we ship this without mitigation, here's what could go wrong, here's what it would cost the business.' That's senior-DS thinking on display.",
    mastery_questions: [
      "Pick the model + sensitive attribute. Why this attribute? Paste 2 sentences.",
      "Run Fairlearn MetricFrame. Paste the table of metrics across groups.",
      "What is the demographic parity ratio? (Range 0-1, closer to 1 is fairer.) Paste the number.",
      "What is the equal opportunity ratio? Paste the number.",
      "Find the worst-served group. Name it + paste the specific metric where it's worst served.",
      "Quantify ONE disparity in plain numbers (e.g. 'Group A has 15pp higher false-negative rate than Group B'). Paste it.",
      "Document mitigation option 1 (data-level). Paste pros + cons.",
      "Document mitigation option 2 (post-processing with ThresholdOptimizer). Paste pros + cons.",
      "Write BIAS.md. Paste the URL.",
      "Update README to link to BIAS.md. Push to GitHub. Paste commit URL.",
    ],
  },
  {
    number: 37,
    title: "Capstone v0.2 - Build (extended)",
    phase: "Capstone Extended",
    commitment_hours: "10-12",
    context:
      "Senior-DS interview is the capstone presentation. This week you DEEPEN the build: better data pipeline, more thorough EDA, multiple models with proper cross-validation, full eval suite. This is the week senior interviewers can tell apart a portfolio project from a self-promoted demo.",
    topics: [
      "Reproducible data pipelines (Make, dvc, or scripts)",
      "Cross-validation done right (no leakage)",
      "Baseline depth - never skip the simple model",
      "Honest evaluation across multiple metrics",
      "What to document as you build (so it's reviewable later)",
    ],
    tasks: [
      "Containerize your data prep with a Makefile or dvc",
      "Run proper k-fold cross-validation on at least 3 models",
      "Build an evaluation suite (not just accuracy - look at calibration, robustness, latency)",
      "Document every decision in DECISIONS.md as you go",
      "Push intermediate results - the senior interviewer reads commits",
    ],
    outputs: [
      "Makefile or dvc.yaml for reproducible data prep",
      "k-fold cross-val results for 3+ models",
      "EVAL.md with 4+ metrics per model",
      "DECISIONS.md tracking decisions + tradeoffs",
    ],
    project:
      "Capstone v0.2 - reproducible pipeline + proper cross-validation + multi-metric evaluation. The depth that distinguishes senior portfolios.",
    resources: [
      {
        label: "Cross-validation done right (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=cross+validation+done+right+data+leakage+sklearn",
        note: "12 min. The leakage traps that kill 'great' models in production.",
      },
      {
        label: "Reproducible ML with dvc in 15 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=dvc+data+version+control+ML+pipeline+tutorial",
        note: "15 min. dvc tracks data the way git tracks code.",
      },
      {
        label: "Makefile for data science (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=Makefile+data+science+reproducible+tutorial",
        note: "10 min. The 50-year-old tool every senior eng uses for pipelines.",
      },
      {
        label: "Honest evaluation - multiple metrics (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=honest+ML+evaluation+calibration+robustness+latency",
        note: "10 min. Accuracy is one number. Honest eval is 4-5 numbers.",
      },
    ],
    days: [
      { number: 1, title: "Reproducible pipeline", summary: "Makefile or dvc.", items: [
        { kind: "exercise", title: "Pipeline", body: "Write a Makefile with targets: data-fetch, data-clean, features, train, evaluate. Or use dvc.yaml. Run end-to-end with one command." },
      ] },
      { number: 2, title: "Baseline first", summary: "The simplest model, fairly evaluated.", items: [
        { kind: "exercise", title: "Baseline", body: "Train the simplest possible model. Constant prediction or simple linear. This is the bar everything else must beat." },
      ] },
      { number: 3, title: "k-fold cross-val", summary: "Proper splits, no leakage.", items: [
        { kind: "video", title: "Cross-validation done right", url: "https://www.youtube.com/results?search_query=cross+validation+done+right+data+leakage+sklearn", duration_min: 12 },
        { kind: "exercise", title: "k-fold all 3 models", body: "5-fold cross-val on 3 models (baseline + 2 candidates). Paste mean + std per fold." },
      ] },
      { number: 4, title: "Multi-metric eval", summary: "Beyond accuracy.", items: [
        { kind: "video", title: "Honest evaluation", url: "https://www.youtube.com/results?search_query=honest+ML+evaluation+calibration+robustness+latency", duration_min: 10 },
        { kind: "exercise", title: "4-metric table", body: "For each model: accuracy/F1/MAE, calibration (Brier score), robustness (perturbation test), latency (ms). 4-column table." },
      ] },
      { number: 5, title: "Pick the winner", summary: "Not always the highest accuracy.", items: [
        { kind: "exercise", title: "Pick + justify", body: "Write WINNER.md: which model you'll ship and why. Reference all 4 metrics. Honest tradeoff." },
      ] },
      { number: 6, title: "Save artifacts", summary: "Models, predictions, plots.", items: [
        { kind: "exercise", title: "Save artifacts", body: "Save best model, sample predictions CSV, all 4 metric plots. Commit." },
      ] },
      { number: 7, title: "DECISIONS.md", summary: "Track tradeoffs.", items: [
        { kind: "exercise", title: "Decision log", body: "Write DECISIONS.md: each decision you made this week + the alternative you rejected + why. 5-10 decisions minimum." },
      ] },
    ],
    ai_assist:
      "Use Cursor to write the Makefile + cross-val code. Have Claude critique your pipeline - it'll catch data leakage you missed. Use AI to draft DECISIONS.md from your git commit history.",
    mastery_questions: [
      "Run your pipeline end-to-end with one command. Paste the command + the resulting output.",
      "Train the simplest baseline. Paste its eval metric.",
      "Run 5-fold cross-val on 3 models. Paste the mean + std per model.",
      "Build the 4-metric evaluation table. Paste it.",
      "Pick the winning model. Paste your justification in 3 sentences.",
      "Save the winning model. Paste the file path + size.",
      "Save sample predictions to predictions.csv. Paste 5 example rows.",
      "Write DECISIONS.md with at least 5 decisions documented. Paste URL.",
      "Push everything to GitHub. Paste the commit URL.",
      "Tag this checkpoint v0.2 (mid-build) and push. Paste the GitHub commit URL.",
    ],
  },
  {
    number: 38,
    title: "Capstone v0.3 - Polish + deploy",
    phase: "Capstone Extended",
    commitment_hours: "8-10",
    context:
      "Senior portfolio = working demo + clean code + a story that lands. This week you polish the code, write tests, deploy to a public URL, and craft the narrative. By Sunday a hiring manager could click your demo and see exactly what you built and why.",
    topics: [
      "Code cleanup - removing dead code, naming, docstrings",
      "Adding basic tests (unit + smoke)",
      "Containerizing with Docker",
      "Deploying to a free public host",
      "Writing a portfolio README that tells a story",
    ],
    tasks: [
      "Refactor the messiest module",
      "Add 5+ unit tests covering critical paths",
      "Build a Dockerfile",
      "Deploy to HF Spaces or Render",
      "Rewrite README with the senior-DS framing (problem, approach, result, tradeoffs)",
    ],
    outputs: [
      "tests/ folder with pytest tests",
      "Dockerfile + working build",
      "Live public URL of the capstone demo",
      "Portfolio-grade README",
    ],
    project:
      "Capstone v0.3 - polished, tested, deployed. The version a hiring manager actually clicks.",
    resources: [
      {
        label: "pytest in 15 minutes (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=pytest+beginner+tutorial+15+minutes",
        note: "15 min. The Python testing standard. 5 tests is enough to signal you do it.",
      },
      {
        label: "Docker for Python apps - Patrick Loeber (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=Docker+for+Python+apps+Patrick+Loeber",
        note: "20 min. Re-watch from W19 if you covered it then.",
      },
      {
        label: "Hugging Face Spaces deployment (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=Hugging+Face+Spaces+deployment+tutorial",
        note: "10 min. Free public hosting for Docker, Streamlit, Gradio.",
      },
      {
        label: "Portfolio README that gets you hired (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=data+science+portfolio+README+template+hired",
        note: "10 min. The 6 sections every hireable README has.",
      },
    ],
    days: [
      { number: 1, title: "Refactor the worst", summary: "Pick the messiest module.", items: [
        { kind: "exercise", title: "Refactor", body: "Pick the module you'd be most embarrassed to show. Refactor: split long functions, rename badly-named variables, add docstrings. 30-90 min." },
      ] },
      { number: 2, title: "Write 5 tests", summary: "pytest. Cover the critical paths.", items: [
        { kind: "video", title: "pytest in 15 min", url: "https://www.youtube.com/results?search_query=pytest+beginner+tutorial+15+minutes", duration_min: 15 },
        { kind: "exercise", title: "5 tests", body: "Write tests/test_*.py with 5+ test functions. Cover: data loading, feature engineering, model prediction, edge case, error case. Run pytest and confirm green." },
      ] },
      { number: 3, title: "Dockerize", summary: "One Dockerfile, working build.", items: [
        { kind: "video", title: "Docker for Python", url: "https://www.youtube.com/results?search_query=Docker+for+Python+apps+Patrick+Loeber", duration_min: 20 },
        { kind: "exercise", title: "Build Docker image", body: "Write Dockerfile. docker build, docker run. Confirm the demo works inside the container." },
      ] },
      { number: 4, title: "Deploy", summary: "Public URL.", items: [
        { kind: "video", title: "HF Spaces deployment", url: "https://www.youtube.com/results?search_query=Hugging+Face+Spaces+deployment+tutorial", duration_min: 10 },
        { kind: "exercise", title: "Ship", body: "Push to HF Spaces, Render, or Streamlit Cloud. Paste live URL." },
      ] },
      { number: 5, title: "Portfolio README", summary: "The senior-DS framing.", items: [
        { kind: "video", title: "Portfolio README that gets you hired", url: "https://www.youtube.com/results?search_query=data+science+portfolio+README+template+hired", duration_min: 10 },
        { kind: "exercise", title: "README rewrite", body: "Sections: Headline / Problem / Approach / Result (with numbers) / Tradeoffs you considered / Live demo / How to run locally. Each section 3-5 sentences max." },
      ] },
      { number: 6, title: "Demo screenshots", summary: "Hero image + 3 detail shots.", items: [
        { kind: "exercise", title: "Demo visuals", body: "Take a hero screenshot of the live demo. Plus 3 detail screenshots showing different features. Add to README." },
      ] },
      { number: 7, title: "First reader", summary: "Get one stranger to click + comment.", items: [
        { kind: "exercise", title: "First read", body: "Share the live demo URL with one stranger (Discord, Reddit, classmate). Paste their first reaction." },
      ] },
    ],
    ai_assist:
      "Use Cursor to refactor the messiest module quickly (paste it, ask for cleanup). Have Claude write the pytest tests. Use AI to draft the README - then rewrite the headlines yourself so they sound human.",
    stakeholder_moment:
      "Your audience for the README is a hiring manager who has 30 seconds before deciding to click your demo. The first sentence has to answer: 'What did you build, and why did it matter?' If they can't tell from the headline, they bounce.",
    mastery_questions: [
      "Pick the messiest module. Paste before-screenshot. Refactor. Paste after-screenshot.",
      "Write 5 pytest tests. Run pytest. Paste the green output.",
      "Write a Dockerfile. Build. Run. Paste 'docker ps' output showing it running.",
      "Deploy to HF Spaces or Render. Paste the live URL.",
      "Rewrite README with senior-DS framing. Paste GitHub URL.",
      "Add hero screenshot + 3 detail screenshots. Paste README link showing them.",
      "Share live URL with one stranger. Paste their first reaction.",
      "Fix one thing based on the stranger's reaction. Paste the commit URL.",
      "Run pytest one more time on final state. Paste the green output.",
      "Push final v0.3 commit. Paste the GitHub commit URL.",
    ],
  },
  {
    number: 39,
    title: "Capstone v1.0 - Ship + interview-ready story",
    phase: "Capstone Extended",
    commitment_hours: "6-8",
    context:
      "Final week. You craft the interview-grade story, record a 3-min demo, get 3 readers, apply feedback, write the retrospective, and ship v1.0. Your capstone is now interview-ready: you can talk about it for 45 minutes if needed, or pitch it in 90 seconds.",
    topics: [
      "The 90-second elevator pitch",
      "The 5-min walkthrough (for screening calls)",
      "The 30-min deep-dive (for technical interviews)",
      "Anticipating senior-DS interview questions",
      "Retrospective document - the senior-DS signal",
    ],
    tasks: [
      "Record a 3-min demo video walking through the working app",
      "Write the 90-second elevator pitch script",
      "Get 3 readers and apply at least the most common critique",
      "Write RETRO.md - what worked, what failed, what you'd do differently",
      "Tag v1.0 and add to your portfolio site",
    ],
    outputs: [
      "3-min demo video on YouTube or Loom",
      "PITCH.md with 90-sec / 5-min / 30-min variants",
      "RETRO.md with honest reflection",
      "v1.0 tag in git",
      "Updated portfolio site",
    ],
    project:
      "Capstone v1.0 - shipped, polished, story-ready. The thing you talk about in interviews for the next 12 months.",
    resources: [
      {
        label: "How to demo data science work in 3 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=data+science+project+demo+video+3+minutes+template",
        note: "10 min. Scripts, screen recording, what to highlight.",
      },
      {
        label: "The 90-second elevator pitch (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=90+second+elevator+pitch+technical+project",
        note: "8 min. The structure: hook, problem, what you built, result, why it matters.",
      },
      {
        label: "Senior DS interview deep-dive (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=senior+data+science+project+deep+dive+interview",
        note: "15 min. What senior interviewers ask about your project. Be ready.",
      },
    ],
    days: [
      { number: 1, title: "Script the demo", summary: "3 min, single take.", items: [
        { kind: "video", title: "Demo in 3 min", url: "https://www.youtube.com/results?search_query=data+science+project+demo+video+3+minutes+template", duration_min: 10 },
        { kind: "exercise", title: "Demo script", body: "Write 3 min of script. Intro (15s) - Problem (30s) - Walkthrough (90s) - Result (30s) - Wrap (15s). Paste into DEMO_SCRIPT.md." },
      ] },
      { number: 2, title: "Record the demo", summary: "Loom or OBS, single take.", items: [
        { kind: "exercise", title: "Record", body: "Record full screen with your demo open. Read from script. One take. Upload to YouTube unlisted or Loom. Paste URL." },
      ] },
      { number: 3, title: "Write the pitch variants", summary: "90s / 5min / 30min.", items: [
        { kind: "video", title: "90-second pitch", url: "https://www.youtube.com/results?search_query=90+second+elevator+pitch+technical+project", duration_min: 8 },
        { kind: "exercise", title: "PITCH.md", body: "3 versions of the same story: 90 seconds (elevator), 5 minutes (screening call), 30 minutes (technical deep-dive). Each builds on the prior." },
      ] },
      { number: 4, title: "Get 3 readers", summary: "Real eyeballs.", items: [
        { kind: "exercise", title: "3 readers", body: "Share live URL + demo video with 3 different audiences: 1 senior DS, 1 layperson, 1 hiring manager (LinkedIn). Capture their critiques." },
      ] },
      { number: 5, title: "Apply feedback", summary: "Most-common critique gets a fix.", items: [
        { kind: "exercise", title: "Apply", body: "Identify the most-common critique. Fix it. Paste the commit URL." },
      ] },
      { number: 6, title: "Anticipate hard questions", summary: "Senior-DS interview prep.", items: [
        { kind: "video", title: "Senior DS deep-dive", url: "https://www.youtube.com/results?search_query=senior+data+science+project+deep+dive+interview", duration_min: 15 },
        { kind: "exercise", title: "5 hard questions", body: "Write 5 hard questions a senior interviewer would ask about YOUR capstone. Write your answer to each. Paste into QA.md." },
      ] },
      { number: 7, title: "Ship v1.0", summary: "Tag, portfolio, LinkedIn post.", items: [
        { kind: "exercise", title: "Ship", body: "Tag v1.0. Update portfolio site to feature this project. Write one LinkedIn post announcing the project (use your demo video as the post). Paste post URL." },
      ] },
    ],
    ai_assist:
      "Use Claude to draft the 90-second pitch from your README. Have it suggest 10 questions a senior interviewer might ask - prepare answers to the 5 hardest. Use Cursor to refactor any final code smell you notice while making the demo.",
    stakeholder_moment:
      "For the final ship, your stakeholder is your future self at an interview. Will the version of you on a Zoom call in 3 months be able to navigate this demo confidently? Will you remember why you chose the model you chose? RETRO.md is your future-self's notes - write it for them.",
    mastery_questions: [
      "Record the 3-min demo video. Paste the YouTube/Loom URL.",
      "Write the 90-second elevator pitch. Time yourself reading it aloud. Paste the timing.",
      "Get 3 readers (senior DS + layperson + hiring manager). Paste each critique.",
      "Apply the most-common critique. Paste the commit URL.",
      "Write 5 hard interview questions about your project. Paste them with your answers.",
      "Write RETRO.md: what worked, what failed, what you'd do differently. Paste URL.",
      "Update your portfolio site to feature this capstone. Paste live portfolio URL.",
      "Post on LinkedIn announcing the project (with demo video). Paste the post URL.",
      "Tag v1.0 in git and push. Paste the GitHub release-or-tag URL.",
      "Write ROADMAP_DONE.md - 1 paragraph on what 39 weeks of FORGE got you. Paste URL.",
    ],
  },
];

function appendTo(file, newWeeks) {
  const p = path.join(ROOT, file);
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  // Append in order, skipping any that are already present.
  for (const w of newWeeks) {
    if (d.weeks.find((x) => x.number === w.number)) {
      console.log(`  ${file}: W${w.number} already exists - skipping`);
      continue;
    }
    d.weeks.push(w);
  }
  d.weeks.sort((a, b) => a.number - b.number);
  d.total_weeks = d.weeks.length;
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
  console.log(`${file}: now ${d.total_weeks} weeks`);
}

appendTo("data-analysis.json", DA_NEW);
appendTo("data-science.json", DS_NEW);
