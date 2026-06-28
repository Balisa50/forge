// Adds Day 0 ("Your Coding Environment — Jupyter Notebook") to the very start
// of Data Analysis Week 2, before the existing Day 1 (Series). The renderer
// iterates week.days in order, so a day with number:0 displays first as
// "Day 0 — Your Coding Environment". No other days are modified.
const fs = require('fs');
const FILE = 'C:/Users/Abdoulie Balisa/OneDrive/Desktop/FORGE/data/roadmaps/data-analysis.json';
const d = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const w2 = d.weeks.find(w => w.number === 2);
if (!w2) throw new Error('W2 not found');
if (w2.days.some(x => x.number === 0)) throw new Error('Day 0 already present — refusing to duplicate');

const day0 = {
  number: 0,
  title: "Your Coding Environment — Jupyter Notebook",
  summary: "Set up the notebook you'll use all week, run your first cell, install pandas. No coding-environment surprises later.",
  items: [
    {
      kind: "lesson",
      title: "What Jupyter Notebook is — and why analysts use it",
      body:
"## What it is\n" +
"**Jupyter Notebook** is the place where Python code actually runs *for analysts*. Instead of writing a `.py` script you run all at once, a notebook is a list of **cells**: each cell holds a small chunk of code (or notes), and you run them one at a time, watching the output appear directly below the cell. That cell-by-cell rhythm is exactly how analysis works — load a bit, look at it, do one thing, look again.\n\n" +
"## The vocabulary you need today\n" +
"- **Notebook** — a single file ending in `.ipynb`, containing many cells.\n" +
"- **Cell** — one box of code or text. Two kinds:\n" +
"  - **Code cell** — runs Python. Output appears below it.\n" +
"  - **Markdown cell** — formatted text (headings, lists). For your notes and explanations.\n" +
"- **Kernel** — the running Python instance behind your notebook. When you run cells, the kernel keeps memory of every variable you defined.\n\n" +
"## Why this comes before pandas\n" +
"Pandas code (and every line of code in this track) runs inside a notebook cell. If you don't have a working notebook and don't know how to run a cell, every later instruction (`import pandas as pd`, `df.head()`) lands nowhere. Today is the foundation. By the end of it you'll have a notebook open, you'll know exactly how to run code in it, and you'll have installed pandas — so tomorrow's Day 1 (the Series) just works.\n\n" +
"## What you'll actually do today\n" +
"1. Install **Anaconda** (the easiest way — bundles Python + Jupyter + pandas).\n" +
"2. Launch Jupyter Notebook from your terminal / Anaconda Prompt.\n" +
"3. Create a new notebook and save it as `day0.ipynb`.\n" +
"4. Run your first cell: `print(\"Hello Forge\")` — press **Shift + Enter**.\n" +
"5. Make a markdown cell, write a one-line note.\n" +
"6. Confirm pandas is installed by running `import pandas as pd` in a cell.\n\n" +
"That's it. Slow and complete today means smooth and fast every day after."
    },
    {
      kind: "video",
      title: "Master Jupyter Notebook in Minutes — install + launch + run a cell",
      url: "https://www.youtube.com/watch?v=bTzm6vVVqi4",
      duration_min: 3,
      creator: "various",
      why: "Watch first. You'll see the exact steps you're about to do — install, launch, new notebook, run a cell — performed on screen."
    },
    {
      kind: "lesson",
      title: "See it in action — the exact steps, with what you'll see",
      body:
"## Step 1 — Install Anaconda (one time, ~10 min)\n" +
"Go to **https://www.anaconda.com/download**, pick your operating system (Windows / macOS / Linux), download the installer, and run it. Click **Next** on every screen — the defaults are fine. Anaconda installs Python, Jupyter Notebook, pandas, and ~150 other libraries at once — far simpler than installing them one by one.\n\n" +
"## Step 2 — Launch Jupyter Notebook\n" +
"Open your terminal. (**Windows**: press the Windows key, type `Anaconda Prompt`, press Enter. **macOS**: press Cmd+Space, type `Terminal`, press Enter. **Linux**: open your terminal.)\n\n" +
"Then type:\n\n" +
"```bash\n" +
"jupyter notebook\n" +
"```\n" +
"and press Enter.\n\n" +
"**What you'll see:** a few seconds of log text, then your browser opens automatically to a page titled *Jupyter* showing your file list at `http://localhost:8888`. **Leave the terminal open** — closing it stops Jupyter.\n\n" +
"## Step 3 — Create your first notebook\n" +
"In the Jupyter file page, click the **New** button (top right) → **Python 3 (ipykernel)**. A new browser tab opens with an empty notebook called `Untitled.ipynb` and a single empty code cell waiting for you.\n\n" +
"## Step 4 — Save it with a real name\n" +
"Click the title **Untitled** at the top → rename to **day0** → Rename. The file is now `day0.ipynb` — saved automatically every couple of minutes (you'll also see a small disk icon and the word *Saved*).\n\n" +
"## Step 5 — Run your first cell\n" +
"Click into the empty cell and type exactly:\n\n" +
"```python\n" +
"print(\"Hello Forge\")\n" +
"```\n\n" +
"Press **Shift + Enter**.\n\n" +
"**What you'll see:** the word `Hello Forge` appears directly below the cell, and a new empty cell appears beneath. That's the loop you'll be in for the rest of the track: write code, Shift+Enter, read the output, repeat.\n\n" +
"## Step 6 — Add a markdown cell\n" +
"On the new empty cell, in the toolbar at the top change the dropdown from **Code** to **Markdown**. Now type:\n\n" +
"```\n" +
"# My first notebook\n" +
"This is where I'll learn pandas.\n" +
"```\n" +
"Press **Shift + Enter**. The text renders as a heading and a paragraph — that's how you take notes inside the notebook itself. Switch a cell to Markdown when you want notes; leave it on Code when you want to run Python.\n\n" +
"## Step 7 — Install pandas (one line, in a cell)\n" +
"Click into a new code cell and type:\n\n" +
"```python\n" +
"!pip install pandas\n" +
"```\n\n" +
"The `!` at the front tells Jupyter to run this as a terminal command, not Python. Press Shift+Enter. You'll see install logs, then `Successfully installed pandas-...` Confirm it works by running this in the next cell:\n\n" +
"```python\n" +
"import pandas as pd\n" +
"print(pd.__version__)\n" +
"# 2.x.x\n" +
"```\n\n" +
"If you see a version number, **pandas is installed and ready** — Day 1 will just work tomorrow."
    },
    {
      kind: "swipe",
      title: "Quick check — swipe to answer",
      cards: [
        {
          prompt: "To run a code cell in Jupyter, you press Shift + Enter.",
          answer: true,
          whenRight: "Right — Shift+Enter runs the current cell AND moves you to the next one. This is the rhythm of the whole track.",
          whenWrong: "Shift+Enter runs the cell and advances to the next. (Ctrl+Enter runs but stays on the same cell — useful when re-running.)",
          sim: "type: print(\"Hello Forge\")\nShift+Enter\n# Hello Forge   (output appears below)"
        },
        {
          prompt: "A Markdown cell runs Python code.",
          answer: false,
          whenRight: "Right — Markdown cells are for notes and headings. Code cells run Python. Switch between them with the toolbar dropdown.",
          whenWrong: "The opposite — Markdown is for formatted notes. Only Code cells run Python.",
          sim: "Code cell:     runs Python\nMarkdown cell: renders text/headings"
        },
        {
          prompt: "`!pip install pandas` inside a notebook cell installs pandas from a terminal — the `!` is what makes it run as a shell command.",
          answer: true,
          whenRight: "Right — the `!` prefix tells Jupyter 'this is a shell command, not Python'. Same as if you'd typed `pip install pandas` in the terminal.",
          whenWrong: "Yes — the leading `!` escapes to the shell. `!pip install pandas` is exactly the same as running `pip install pandas` in a terminal."
        }
      ]
    },
    {
      kind: "exercise",
      title: "Your turn — your first notebook is the deliverable",
      body:
"[CODE] Do every step below. By the end you'll have a working notebook and pandas installed — the foundation for the whole week.\n\n" +
"1. Install **Anaconda** from https://www.anaconda.com/download (skip if Anaconda is already installed).\n" +
"2. Open your terminal (Windows: Anaconda Prompt; macOS/Linux: Terminal) and run `jupyter notebook`. A browser tab opens automatically.\n" +
"3. Click **New → Python 3 (ipykernel)**. Rename the notebook **day0**.\n" +
"4. In the first code cell, type `print(\"Hello Forge\")` and press **Shift + Enter**. Confirm `Hello Forge` appears below.\n" +
"5. In a new cell, switch to **Markdown**, write `# My first notebook` and press Shift+Enter. Confirm it renders as a heading.\n" +
"6. In a new code cell, run `!pip install pandas` (will be quick if Anaconda is installed).\n" +
"7. In a new code cell, run `import pandas as pd; print(pd.__version__)`. Confirm a version number prints with no error.\n\n" +
"PASS:\n" +
"[x] `day0.ipynb` saved\n" +
"[x] `Hello Forge` printed from a code cell\n" +
"[x] One markdown cell rendered as a heading\n" +
"[x] `import pandas as pd` runs without error and prints a version\n\n" +
"If any step errored, fix it before moving on — every later day in this week depends on this being solid."
    }
  ]
};

// Add Day 0 at the very start of the array so the renderer shows it first
w2.days.unshift(day0);

// Quick shape sanity-check
const k = day0.items.map(i => i.kind);
if (!k.includes('lesson') || !k.includes('swipe') || !k.includes('exercise') || !k.includes('video')) {
  throw new Error('Day 0 missing required kinds');
}

fs.writeFileSync(FILE, JSON.stringify(d, null, 2), 'utf8');
console.log('SUCCESS — DA W2 now has', w2.days.length, 'days');
console.log('Day order:', w2.days.map(x => `${x.number}:${x.title.slice(0,32)}`).join(' | '));
