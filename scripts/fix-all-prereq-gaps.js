// One-shot closer for every CRITICAL / HIGH gap surfaced by
// scripts/audit-prerequisites.js. Reuses a single tool-teach library
// across all 9 affected tracks so we don't write the same Git intro nine
// times — write it once, deploy it nine times.
//
// Insertion target: W1 D1 of each track. This is the earliest position
// possible, so firstTeach <= firstUse for every gap and the audit clears.
// Constraint honoured: NO new day, ever. We only prepend items into an
// existing day's items array.
//
// Idempotent: re-running this script is a no-op for any (track, tool)
// pair where a teach lesson with the tool name already exists in ANY
// week earlier-than-or-equal-to the tool's first-use week.
//
// Videos: only included when we have a confident, well-known short URL
// (Fireship's "X in 100 Seconds" library + a couple of others). When in
// doubt the lesson + canonical docs reading carry the teach load, per the
// user's "if a video does not exist at that length, write a clear text
// explanation" rule.
const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/Abdoulie Balisa/OneDrive/Desktop/FORGE/data/roadmaps';

// ─── Tool teach library ──────────────────────────────────────────────
// Each entry returns an ORDER of items to prepend into W1 D1. Lesson
// title MUST contain the tool name — that's how the audit detects it.
const TEACH = {
  Git: () => ([
    { kind: 'lesson', title: 'Git — version control from day 1',
      body:
"## What Git is\n" +
"Git is the version-control tool every codebase past day 1 uses. It snapshots your project after every meaningful change so you can: see what changed, undo a mistake, collaborate without overwriting each other, and ship to GitHub.\n\n" +
"You will use Git every single day on this track. The five commands below cover ~95% of daily work.\n\n" +
"## Install + first-time setup\n" +
"```bash\n" +
"# macOS:    brew install git\n" +
"# Windows:  download from git-scm.com (or `winget install Git.Git`)\n" +
"# Linux:    sudo apt install git\n\n" +
"git --version\n" +
"git config --global user.name  'Your Name'\n" +
"git config --global user.email 'you@example.com'\n" +
"```\n\n" +
"## The five commands you actually use\n" +
"```bash\n" +
"git init                 # turn a folder into a git repo\n" +
"git add file.py          # stage a change for the next commit\n" +
"git commit -m 'message'  # snapshot the staged changes\n" +
"git status               # what's changed since the last commit?\n" +
"git log --oneline        # the history of snapshots\n" +
"```\n\n" +
"## Push to GitHub\n" +
"```bash\n" +
"# After creating an empty repo on github.com:\n" +
"git remote add origin https://github.com/YOU/your-repo.git\n" +
"git branch -M main\n" +
"git push -u origin main\n" +
"```\n\n" +
"## When you'll see Git next\n" +
"Every project on this track ships to GitHub. Every checkin you submit is backed by a commit. This is the prerequisite — read it once, refer back to it whenever you're not sure." },
    { kind: 'video', title: 'Git Explained in 100 Seconds',
      url: 'https://www.youtube.com/watch?v=hwP7WQkmECE',
      duration_min: 2, creator: 'Fireship',
      why: 'Watch second. 100 seconds. Visual primer for what Git is doing under the hood. The five commands above suddenly click.' },
    { kind: 'reading', title: 'Git Handbook (GitHub)',
      url: 'https://docs.github.com/en/get-started/using-git/about-git',
      why: 'Read third. GitHub\'s short Git primer. Skim the basics; bookmark for whenever you forget a command.' }
  ]),

  SQL: () => ([
    { kind: 'lesson', title: 'SQL — the language your data lives in',
      body:
"## What SQL is\n" +
"SQL (Structured Query Language) is how you talk to relational databases — Postgres, MySQL, SQLite, BigQuery, Snowflake. Every analyst, data engineer, backend dev, ML engineer reads + writes SQL daily.\n\n" +
"There is ONE syntax (with minor dialect quirks). Learn it once; use it on every database for the rest of your career.\n\n" +
"## The five queries that cover 80% of real work\n" +
"```sql\n" +
"-- 1. SELECT: pull rows from a table\n" +
"SELECT name, email FROM users;\n\n" +
"-- 2. WHERE: filter rows\n" +
"SELECT * FROM users WHERE country = 'GM' AND age >= 18;\n\n" +
"-- 3. ORDER BY + LIMIT: sort + cap\n" +
"SELECT name, signup_at FROM users ORDER BY signup_at DESC LIMIT 10;\n\n" +
"-- 4. GROUP BY: aggregate (counts, sums, averages per group)\n" +
"SELECT country, COUNT(*) AS n FROM users GROUP BY country;\n\n" +
"-- 5. JOIN: combine rows from two tables\n" +
"SELECT u.name, o.total\n" +
"FROM   users u\n" +
"JOIN   orders o ON o.user_id = u.id\n" +
"WHERE  o.total > 100;\n" +
"```\n\n" +
"## Mental model\n" +
"Every query is `SELECT <columns> FROM <table> [WHERE <filter>] [GROUP BY ...] [ORDER BY ...] [LIMIT ...]`. Memorise that skeleton; everything else is variation.\n\n" +
"## Try it without setup\n" +
"Practice these queries right now at https://sqlbolt.com/lesson/select_queries_introduction — interactive, no install, 15 minutes to read through the first 5 lessons.\n\n" +
"## When you'll see SQL next\n" +
"This track uses SQL whenever it touches a database. The five queries above are your bedrock." },
    { kind: 'video', title: 'SQL Explained in 100 Seconds',
      url: 'https://www.youtube.com/watch?v=zsjvFFKOm3c',
      duration_min: 2, creator: 'Fireship',
      why: 'Watch second. The shape of SQL in 100 seconds — tables, rows, joins. Visual reinforcement before the docs.' },
    { kind: 'reading', title: 'SQLBolt — Interactive SQL lessons',
      url: 'https://sqlbolt.com/lesson/select_queries_introduction',
      why: 'Read third. The fastest interactive SQL primer on the internet. Lessons 1-5 in 20 minutes; you are operational after.' }
  ]),

  Docker: () => ([
    { kind: 'lesson', title: 'Docker — containers in 10 minutes',
      body:
"## What Docker is\n" +
"Docker packages your application + its OS dependencies into a single immutable image that runs the same on your laptop, on CI, and in production. \"Works on my machine\" stops happening.\n\n" +
"## The three nouns\n" +
"- **Image** — a blueprint. Built from a Dockerfile. Stored in a registry (Docker Hub, GHCR).\n" +
"- **Container** — a running instance of an image. Multiple containers can run from the same image.\n" +
"- **Dockerfile** — the text recipe describing how to build the image.\n\n" +
"## Smallest possible Dockerfile\n" +
"```dockerfile\n" +
"FROM python:3.11-slim\n" +
"WORKDIR /app\n" +
"COPY requirements.txt .\n" +
"RUN pip install -r requirements.txt\n" +
"COPY . .\n" +
"CMD [\"python\", \"main.py\"]\n" +
"```\n\n" +
"## The five commands you actually use\n" +
"```bash\n" +
"docker build -t myapp .              # build the image from ./Dockerfile\n" +
"docker run -p 8000:8000 myapp        # run it; map container port 8000 to host\n" +
"docker ps                            # what's running?\n" +
"docker logs <container_id>           # what is it saying?\n" +
"docker stop <container_id>           # graceful stop\n" +
"```\n\n" +
"## When you'll see Docker next\n" +
"This track containerises one or more services later in the roadmap. The five commands above are all you need to read the rest." },
    { kind: 'video', title: 'Docker in 100 Seconds',
      url: 'https://www.youtube.com/watch?v=Gjnup-PuquQ',
      duration_min: 2, creator: 'Fireship',
      why: 'Watch second. 100-second visual mental model — image vs container, Dockerfile, build vs run.' },
    { kind: 'reading', title: 'Docker — official Getting Started',
      url: 'https://docs.docker.com/get-started/',
      why: 'Read third. The official tutorial. Skim "What is a container" + "Build an image"; skip the multi-container app for now.' }
  ]),

  NumPy: () => ([
    { kind: 'lesson', title: 'NumPy — the array library underneath every Python data tool',
      body:
"## What NumPy is\n" +
"NumPy is the Python library for fast typed arrays. It is the bedrock under pandas, scikit-learn, PyTorch, TensorFlow. If you do data work in Python, you use NumPy — often through other libraries that wrap it.\n\n" +
"## Install + import\n" +
"```bash\n" +
"pip install numpy\n" +
"```\n" +
"```python\n" +
"import numpy as np   # the universal alias\n" +
"```\n\n" +
"## NumPy array vs Python list\n" +
"A list holds anything. An array holds ONE type only and lives in contiguous memory — that's why NumPy is 10-100× faster than equivalent list code.\n\n" +
"```python\n" +
"py = [1, 2, 3]            ;  np_arr = np.array([1, 2, 3])\n" +
"py * 2    # [1,2,3,1,2,3]    np_arr * 2   # array([2, 4, 6])  <- ELEMENT-WISE\n" +
"```\n\n" +
"That element-wise behaviour is the whole game — arithmetic on arrays vectorises with no `for` loop.\n\n" +
"## The dot product (a.k.a. `@`) — the operation half this track uses\n" +
"```python\n" +
"a = np.array([2.3, 17.0, 4.0])\n" +
"b = np.array([3.0, 0.1, -0.2])\n" +
"a @ b           # 7.8\n" +
"np.dot(a, b)    # 7.8  -- same thing; `@` is the modern syntax\n" +
"```\n\n" +
"## The surface this track actually needs from you\n" +
"- `np.array([...])` — create.\n" +
"- `a @ b` or `np.dot(a, b)` — dot product.\n" +
"- `np.linalg.norm(v)` — vector length.\n" +
"- Element-wise arithmetic — no loops needed.\n\n" +
"That is the whole prerequisite. The rest you learn as you meet it." },
    { kind: 'video', title: 'Learn NumPy in 5 minutes',
      url: 'https://www.youtube.com/watch?v=xECXZ3tyONo',
      duration_min: 5, creator: 'Python Programmer',
      why: 'Watch second. Five-minute visual pass over the same arrays + element-wise ops + dot products you just read about.' },
    { kind: 'reading', title: 'NumPy quickstart (official docs)',
      url: 'https://numpy.org/doc/stable/user/quickstart.html',
      why: 'Read third. The canonical NumPy primer. Skim array creation + basic operations; skip indexing for now.' }
  ]),

  pandas: () => ([
    { kind: 'lesson', title: 'pandas — the DataFrame library every analyst uses',
      body:
"## What pandas is\n" +
"pandas is the de-facto Python library for tabular data. Anywhere you'd open a spreadsheet, you open a pandas DataFrame instead. The Series + DataFrame primitives, plus a few hundred methods, cover ~all data-prep work in Python.\n\n" +
"```bash\n" +
"pip install pandas\n" +
"```\n" +
"```python\n" +
"import pandas as pd\n" +
"```\n\n" +
"## The two primitives\n" +
"- **Series** = a single column. 1-D, labelled.\n" +
"- **DataFrame** = a table. Each column is a Series; the whole thing is 2-D.\n\n" +
"## The seven moves that cover 80% of daily work\n" +
"```python\n" +
"df = pd.read_csv('trips.csv')     # 1. LOAD\n" +
"df.head(); df.shape; df.dtypes    # 2. INSPECT\n" +
"df['fare'].mean()                 # 3. AGGREGATE one column\n" +
"df[df['miles'] > 10]              # 4. FILTER rows\n" +
"df.groupby('day').sum()           # 5. GROUP + aggregate\n" +
"df.merge(other, on='id')          # 6. JOIN two DataFrames\n" +
"df.to_csv('out.csv', index=False) # 7. WRITE\n" +
"```\n\n" +
"## When you'll see pandas next\n" +
"Most code in this track that handles data lives in a Jupyter notebook with a `df = pd.read_...` at the top. The seven moves above are the surface you need to read it." },
    { kind: 'video', title: 'Pandas in 100 Seconds',
      url: 'https://www.youtube.com/watch?v=dcqPhpY7tWk',
      duration_min: 2, creator: 'Fireship',
      why: 'Watch second. Frame pandas in 100 seconds — DataFrames, Series, the read/filter/agg pattern.' },
    { kind: 'reading', title: 'pandas — 10 minutes to pandas (official)',
      url: 'https://pandas.pydata.org/docs/user_guide/10min.html',
      why: 'Read third. The official 10-min primer. Skim the first half (objects, view/select); the rest you learn as you meet it.' }
  ]),

  'scikit-learn': () => ([
    { kind: 'lesson', title: 'scikit-learn — fit, predict, score',
      body:
"## What scikit-learn is\n" +
"scikit-learn is Python's classical ML library. Linear regression, logistic regression, decision trees, k-means, train/test split, every standard metric — all behind one consistent API.\n\n" +
"## The API is three methods on every estimator\n" +
"```python\n" +
"from sklearn.linear_model import LogisticRegression\n" +
"from sklearn.model_selection import train_test_split\n" +
"from sklearn.metrics import accuracy_score\n\n" +
"# X = features (rows × cols), y = labels (rows)\n" +
"X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)\n\n" +
"model = LogisticRegression()\n" +
"model.fit(X_tr, y_tr)                 # 1. FIT — learn from training data\n" +
"preds = model.predict(X_te)           # 2. PREDICT — score new examples\n" +
"print(accuracy_score(y_te, preds))    # 3. SCORE — how good was it?\n" +
"```\n\n" +
"That three-step shape — `fit`, `predict`, `score` (or `metric`) — is the same for Linear/Logistic regression, KNN, SVM, decision trees, random forests, gradient boosting, KMeans. Learn the shape once; pick any estimator that fits the task.\n\n" +
"## Install\n" +
"```bash\n" +
"pip install scikit-learn\n" +
"```\n\n" +
"## When you'll see sklearn next\n" +
"Every classical-ML week on this track. The `fit / predict / score` pattern is the bedrock; everything else is choosing the right estimator + the right metric." },
    { kind: 'reading', title: 'scikit-learn — Getting Started (official)',
      url: 'https://scikit-learn.org/stable/getting_started.html',
      why: 'Read second. The official 5-minute tour. Same fit/predict/score loop, with the canonical example datasets.' }
  ]),

  matplotlib: () => ([
    { kind: 'lesson', title: 'matplotlib — every Python chart you have ever seen',
      body:
"## What matplotlib is\n" +
"matplotlib is the foundational Python plotting library. Almost every chart you see in a Jupyter notebook comes from it (or from seaborn / pandas, which wrap it).\n\n" +
"```bash\n" +
"pip install matplotlib\n" +
"```\n" +
"```python\n" +
"import matplotlib.pyplot as plt    # the universal alias\n" +
"```\n\n" +
"## The four chart calls that cover most work\n" +
"```python\n" +
"plt.plot(x, y)                     # 1. line chart\n" +
"plt.scatter(x, y)                  # 2. scatter\n" +
"plt.hist(values, bins=30)          # 3. histogram\n" +
"plt.bar(categories, counts)        # 4. bar chart\n" +
"```\n\n" +
"## The four calls AROUND every chart\n" +
"```python\n" +
"plt.figure(figsize=(8, 4))         # set canvas size\n" +
"plt.title('Trips per hour')\n" +
"plt.xlabel('hour'); plt.ylabel('trips')\n" +
"plt.savefig('out.png', dpi=150)    # save before plt.show() clears it\n" +
"plt.show()\n" +
"```\n\n" +
"That's ~80% of matplotlib for this track. Aliases: `seaborn` calls underneath; `df.plot()` calls underneath. Same library, different convenience wrappers.\n\n" +
"## When you'll see matplotlib next\n" +
"Every notebook with a chart. Read the four chart calls and the four \"around\" calls and you can read any plotting code on this track." },
    { kind: 'reading', title: 'matplotlib — Pyplot tutorial (official)',
      url: 'https://matplotlib.org/stable/tutorials/pyplot.html',
      why: 'Read second. The canonical pyplot primer. The four chart calls map straight onto its first half.' }
  ]),

  PyTorch: () => ([
    { kind: 'lesson', title: 'PyTorch — tensors, autograd, the 90-second mental model',
      body:
"## What PyTorch is\n" +
"PyTorch is the deep-learning library most modern AI work uses. Whether you ever build a neural net from scratch or just fine-tune an off-the-shelf one, you read PyTorch code.\n\n" +
"```bash\n" +
"pip install torch\n" +
"```\n" +
"```python\n" +
"import torch\n" +
"```\n\n" +
"## Two ideas that are the whole library\n" +
"### 1. Tensor — a multi-dimensional array (like NumPy, but on GPU)\n" +
"```python\n" +
"x = torch.tensor([[1., 2.], [3., 4.]])\n" +
"y = x @ x.T              # @ is matrix multiply, same as NumPy\n" +
"```\n\n" +
"### 2. Autograd — automatic gradient tracking\n" +
"```python\n" +
"w = torch.tensor([2.0], requires_grad=True)  # we'll learn this\n" +
"loss = (w * 3 - 6) ** 2\n" +
"loss.backward()\n" +
"print(w.grad)            # PyTorch computed dloss/dw automatically\n" +
"```\n\n" +
"Tensor + autograd → you can write a training loop in 15 lines. That's the whole point of PyTorch.\n\n" +
"## Move work to GPU\n" +
"```python\n" +
"device = 'cuda' if torch.cuda.is_available() else 'cpu'\n" +
"x = x.to(device); model = model.to(device)\n" +
"```\n\n" +
"## When you'll see PyTorch next\n" +
"Every neural-net / fine-tuning week on this track. Tensors + autograd + .to(device) is the prerequisite — the rest you learn week by week." },
    { kind: 'video', title: 'PyTorch in 100 Seconds',
      url: 'https://www.youtube.com/watch?v=ORMx45xqWkA',
      duration_min: 2, creator: 'Fireship',
      why: 'Watch second. 100-second mental model — tensors, autograd, train loop. Hits the same beats as the lesson.' },
    { kind: 'reading', title: 'PyTorch — Quickstart tutorial (official)',
      url: 'https://pytorch.org/tutorials/beginner/basics/quickstart_tutorial.html',
      why: 'Read third. The canonical 15-minute walkthrough — load data, define model, train, save. The bedrock.' }
  ]),

  'OpenAI SDK': () => ([
    { kind: 'lesson', title: 'OpenAI SDK — your first API call in 10 lines',
      body:
"## What the OpenAI SDK is\n" +
"A Python (or Node) client that wraps OpenAI's HTTP API. You write `client.chat.completions.create(...)` and get a response from a model.\n\n" +
"## Install + key\n" +
"```bash\n" +
"pip install openai python-dotenv\n" +
"```\n" +
"Get a key at https://platform.openai.com → API keys → Create. Paste into a `.env` file in your project:\n" +
"```\n" +
"OPENAI_API_KEY=sk-...\n" +
"```\n" +
"**Critical**: add `.env` to `.gitignore` BEFORE you ever stage it. Leaked keys are scraped from public repos within minutes.\n\n" +
"## The minimal call\n" +
"```python\n" +
"import os\n" +
"from dotenv import load_dotenv\n" +
"from openai import OpenAI\n\n" +
"load_dotenv()\n" +
"client = OpenAI()                # reads OPENAI_API_KEY from env\n\n" +
"resp = client.chat.completions.create(\n" +
"    model='gpt-4o-mini',         # cheap; great for dev\n" +
"    messages=[\n" +
"        {'role': 'system', 'content': 'You are a concise assistant.'},\n" +
"        {'role': 'user',   'content': 'Hello in three languages?'},\n" +
"    ],\n" +
")\n\n" +
"print(resp.choices[0].message.content)\n" +
"print('USAGE:', resp.usage)        # input/output/total tokens\n" +
"```\n\n" +
"## Cost discipline from day 1\n" +
"Every response carries a `usage` block (prompt_tokens, completion_tokens). Multiply by the model's per-token rate = literal dollar cost. Log it from the first call.\n\n" +
"## When you'll see the OpenAI SDK next\n" +
"Any week on this track that calls an LLM. The .env-key pattern + the chat.completions.create call are the bedrock." },
    { kind: 'reading', title: 'OpenAI — Quickstart (official)',
      url: 'https://platform.openai.com/docs/quickstart',
      why: 'Read second. The official 5-min quickstart. Same shape as the lesson; bookmark for parameter reference.' }
  ]),
};

// ─── The full gap list from the most recent audit ────────────────────
// [track-slug, tool-name, firstUseWeek]. firstUseWeek is informational —
// we always insert into W1 D1 to guarantee firstTeach <= firstUse.
const GAPS = [
  ['data-science',       'scikit-learn',  2],
  ['data-science',       'PyTorch',       15],
  ['data-science',       'SQL',           1],
  ['data-science',       'OpenAI SDK',    14],
  ['data-analysis',      'NumPy',         6],
  ['data-analysis',      'matplotlib',    3],
  ['data-analysis',      'Git',           1],
  ['data-analysis',      'SQL',           1],
  ['ai-engineering',     'Git',           1],
  ['ml-engineering',     'pandas',        1],
  ['ml-engineering',     'scikit-learn',  1],
  ['ml-engineering',     'matplotlib',    1],
  ['ml-engineering',     'PyTorch',       1],
  ['ml-engineering',     'Git',           1],
  ['full-stack-web',     'Git',           1],
  ['full-stack-web',     'SQL',           21],
  ['mobile-engineering', 'Git',           1],
  ['mobile-engineering', 'SQL',           7],
  ['cybersecurity',      'Git',           1],
  ['bi-analytics',       'Git',           1],
  ['devops-cloud',       'SQL',           4],
  ['ai-automation',      'NumPy',         14],
  ['ai-automation',      'Docker',        16],
  ['ai-automation',      'Git',           16],
  ['ai-automation',      'SQL',           10],
];

// ─── Mirror of audit's teach-patterns: how we detect "already taught" ─
const TEACH_PATTERNS = {
  'Git':           [/\bgit\b/i],
  'SQL':           [/\bsql\b/i],
  'Docker':        [/\bdocker\b/i, /\bcontainer/i],
  'NumPy':         [/\bnumpy\b/i],
  'pandas':        [/\bpandas\b/i],
  'scikit-learn':  [/\bscikit[\s-]?learn\b/i, /\bsklearn\b/i],
  'matplotlib':    [/\bmatplotlib\b/i, /\bplt\b/i],
  'PyTorch':       [/\bpytorch\b/i, /\btorch\b/i],
  'OpenAI SDK':    [/\bopenai\b/i],
};

// True iff some week ≤ ceilingWeek already has a lesson/video/reading
// whose TITLE matches the tool's teach pattern. This is what the audit
// uses; matching it keeps us idempotent.
function alreadyTaught(track, toolName, ceilingWeek) {
  const patterns = TEACH_PATTERNS[toolName];
  if (!patterns) return false;
  for (const w of track.weeks) {
    if (w.number > ceilingWeek) break;
    for (const d of (w.days || [])) {
      for (const it of (d.items || [])) {
        if (it.kind !== 'lesson' && it.kind !== 'reading' && it.kind !== 'video') continue;
        const title = it.title || '';
        if (patterns.some((re) => re.test(title))) return true;
      }
    }
  }
  return false;
}

function patchOne(trackSlug, toolName, firstUseWeek) {
  const file = path.join(ROOT, trackSlug + '.json');
  const track = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (alreadyTaught(track, toolName, firstUseWeek)) {
    return { trackSlug, toolName, action: 'skipped (already taught)' };
  }
  const d1 = track.weeks[0]?.days?.[0];
  if (!d1) throw new Error(`No W1 D1 in ${trackSlug}`);
  const teachItems = TEACH[toolName];
  if (!teachItems) throw new Error(`No teach content defined for ${toolName}`);
  const items = teachItems();
  // Prepend in order — students hit these on day 1 before anything else.
  d1.items.unshift(...items);
  fs.writeFileSync(file, JSON.stringify(track, null, 2), 'utf8');
  return { trackSlug, toolName, action: `prepended ${items.length} items into W1 D1` };
}

const results = [];
for (const [track, tool, useWeek] of GAPS) {
  try {
    results.push(patchOne(track, tool, useWeek));
  } catch (e) {
    results.push({ trackSlug: track, toolName: tool, action: 'ERROR: ' + e.message });
  }
}

console.log('\n=== Patch results ===\n');
for (const r of results) {
  const tag = r.action.startsWith('ERROR') ? '✗' : r.action.startsWith('skipped') ? '·' : '✓';
  console.log(`  ${tag} ${r.trackSlug.padEnd(22)} ${r.toolName.padEnd(16)} → ${r.action}`);
}
const patched = results.filter((r) => r.action.startsWith('prepended')).length;
const skipped = results.filter((r) => r.action.startsWith('skipped')).length;
const errored = results.filter((r) => r.action.startsWith('ERROR')).length;
console.log(`\nPatched: ${patched}  ·  Skipped (idempotent): ${skipped}  ·  Errors: ${errored}`);
