// Add a Day 0 environment-setup teaching day to every track's Week 1 (or DS W1
// where the project actually starts). DA W2 already shipped its Day 0; this
// script handles the other 9 tracks. Each Day 0 follows the same shape:
// lesson -> video -> lesson (steps) -> swipe check -> exercise.
const fs = require('fs');
const path = require('path');

const TRACKS = [
  { slug: 'data-science', week: 1, env: 'jupyter' },
  { slug: 'devops-cloud', week: 1, env: 'shell-git' },
  { slug: 'full-stack-web', week: 1, env: 'node-vscode' },
  { slug: 'ai-engineering', week: 1, env: 'python-keys' },
  { slug: 'ml-engineering', week: 1, env: 'colab-conda' },
  { slug: 'mobile-engineering', week: 1, env: 'expo' },
  { slug: 'cybersecurity', week: 1, env: 'terminal-vm' },
  { slug: 'bi-analytics', week: 1, env: 'excel-powerbi' },
  { slug: 'ai-automation', week: 1, env: 'browser-account' },
];

const VIDEO_URL = {
  jupyter:        'https://www.youtube.com/watch?v=2FwcFdybn34',
  'shell-git':    'https://www.youtube.com/watch?v=USjZcfj8yxE',
  'node-vscode':  'https://www.youtube.com/watch?v=ENrzD9HAZK4',
  'python-keys':  'https://www.youtube.com/watch?v=YYXdXT2l-Gg',
  'colab-conda':  'https://www.youtube.com/watch?v=RLYoEyIHL6A',
  'expo':         'https://www.youtube.com/watch?v=mkualZPRZCs',
  'terminal-vm':  'https://www.youtube.com/watch?v=ROjZy1WbCIA',
  'excel-powerbi':'https://www.youtube.com/watch?v=AGrl-H87pRU',
  'browser-account':'https://www.youtube.com/watch?v=lYYRtR1m4Mw',
};

function buildDay0(env) {
  const recipes = {
    jupyter: {
      title: 'Your Coding Environment — Jupyter Notebook + Anaconda',
      summary: 'Install Anaconda, launch Jupyter, run your first cell. Foundation for every Python day after this.',
      whatItIs:
"## What it is\n" +
"Almost every line of Python you'll write in this track runs inside a **Jupyter Notebook** — a browser-based scratchpad that runs Python code one cell at a time, with output appearing directly below each cell. That cell-by-cell rhythm is exactly how data scientists work: load a bit, look at it, do one thing, look again.\n\n" +
"**Anaconda** is the easiest way to get it: it bundles Python + Jupyter + pandas + ~150 other libraries in one install. No `pip` headaches, no PATH problems on Day 1.\n\n" +
"## What you'll do today\n" +
"1. Install Anaconda from anaconda.com/download (~10 min).\n" +
"2. Open Anaconda Prompt (Windows) or Terminal (Mac/Linux) and type `jupyter notebook`.\n" +
"3. In the browser tab that opens, click **New → Python 3**.\n" +
"4. In the first cell type `print(\"Hello Forge\")` and press **Shift + Enter**. Confirm `Hello Forge` appears.\n" +
"5. Save the notebook as `day0.ipynb`.\n\n" +
"You don't need to remember every keyboard shortcut. You just need to be able to run a cell tomorrow when Day 1 says 'open a notebook and write this code.'"
,
      videoTitle: 'Jupyter Notebook Tutorial — Introduction, Setup, and Walkthrough',
      videoWhy: 'Watch first. The canonical Jupyter tutorial — Corey Schafer walks through install, launch, cell types, Shift+Enter, markdown, and installing packages step by step. Skim it once, then do the steps yourself.',
      videoCreator: 'Corey Schafer',
      durationMin: 30,
      practice:
"[CODE] Do every step. By the end you have a working notebook + Python ready.\n\n" +
"1. Install **Anaconda** from anaconda.com/download (skip if already installed).\n" +
"2. Launch a terminal: Windows → Anaconda Prompt. Mac/Linux → Terminal.\n" +
"3. Type `jupyter notebook` and press Enter. The browser opens to localhost:8888.\n" +
"4. New → Python 3 (ipykernel). Rename to **day0**.\n" +
"5. First code cell: `print(\"Hello Forge\")` + **Shift + Enter**. Confirm output prints.\n" +
"6. New cell, switch to **Markdown**: `# My first notebook`. Shift+Enter renders the heading.\n\n" +
"PASS:\n" +
"[x] `day0.ipynb` saved\n" +
"[x] Code cell printed `Hello Forge`\n" +
"[x] Markdown cell rendered as a heading\n\n" +
"If any step errored, fix it before Day 1."
,
      swipe: [
        { p: "Shift + Enter runs the current cell AND advances to the next one.", a: true, r: "Right — it's the rhythm of the whole track. Ctrl+Enter runs but stays on the same cell.", w: "Shift+Enter advances; Ctrl+Enter stays. Use Shift+Enter most of the time." },
        { p: "A Markdown cell runs Python code.", a: false, r: "Right — Markdown cells render text/headings; only Code cells run Python.", w: "Switch back to Code (toolbar dropdown) to run Python. Markdown is for notes." },
        { p: "Anaconda bundles Python + Jupyter + many libraries in one install.", a: true, r: "Right — that's why we use it. No package-by-package install on Day 1.", w: "Anaconda is the all-in-one. Use it instead of plain Python + manual pip on Day 0." }
      ],
    },

    'shell-git': {
      title: 'Your Coding Environment — Terminal, Git, GitHub',
      summary: 'A working shell, git installed, GitHub account, your first commit. The bedrock of every DevOps day after this.',
      whatItIs:
"## What it is\n" +
"DevOps work happens in a **terminal**. You'll spend hours in it — running git commands, ssh-ing into servers, applying Terraform, watching CI output. If you're not comfortable opening a terminal and running a command, every later week is harder than it needs to be.\n\n" +
"Three things you must have by the end of today:\n" +
"1. A terminal you can open and navigate (Anaconda Prompt or PowerShell on Windows; Terminal on Mac/Linux).\n" +
"2. **Git** installed and configured with your name + email.\n" +
"3. A **GitHub** account, with `git push` working from your laptop to a test repo.\n\n" +
"## Why before anything else\n" +
"Every project on this track gets pushed to GitHub. Every Terraform run is committed to git. Every CI/CD pipeline starts with `git push`. Skip this day and Week 1 falls over the first time you're told to push.\n\n" +
"## What you'll do today\n" +
"Install git, configure name + email, create a GitHub account, clone an empty test repo, make a commit, push it. Then you're ready for the rest of the week."
,
      videoTitle: 'Your First Git + GitHub Push in 10 minutes',
      videoWhy: 'Watch first. Web Dev Simplified takes you from zero to a successful push. Then repeat the steps yourself in your own terminal.',
      videoCreator: 'Web Dev Simplified',
      durationMin: 10,
      practice:
"[CODE] Do every step.\n\n" +
"1. Install **git** from git-scm.com (skip if `git --version` already works).\n" +
"2. Configure: `git config --global user.name \"Your Name\"` and `git config --global user.email you@example.com`.\n" +
"3. Create a free GitHub account at github.com if you don't have one.\n" +
"4. On GitHub: New Repository → name it `forge-warmup`, leave it public, add a README.\n" +
"5. In your terminal: `git clone https://github.com/YOU/forge-warmup.git && cd forge-warmup`.\n" +
"6. Edit README.md (add any line), then run: `git add . && git commit -m 'first commit' && git push`.\n\n" +
"PASS:\n" +
"[x] `git --version` prints a version\n" +
"[x] forge-warmup repo exists on your GitHub\n" +
"[x] Your `first commit` shows up on the repo page after push"
,
      swipe: [
        { p: "`git --version` is the quickest way to confirm git is installed.", a: true, r: "Right — if it prints a version, git is on your PATH. If 'command not found', install it.", w: "It is — `git --version` is the install check. If it errors, install git from git-scm.com." },
        { p: "You can push to GitHub without configuring `user.email` first.", a: false, r: "Right — git will refuse to commit without a configured email + name. Set them once globally.", w: "git config user.name / user.email are required before your first commit. One-time setup." },
        { p: "Every DevOps project on this track gets pushed to GitHub.", a: true, r: "Right — git is the lingua franca. Every Terraform repo, every CI pipeline starts with a push.", w: "Yes — every project. Without git + GitHub working today, every later week stalls at 'push your code'." }
      ],
    },

    'node-vscode': {
      title: 'Your Coding Environment — Node.js + VS Code',
      summary: 'Install Node.js, set up VS Code, run your first script. The foundation for every full-stack week.',
      whatItIs:
"## What it is\n" +
"Full-stack web development means writing JavaScript that runs in **two places**: in a browser (the frontend) and on a server (the backend). **Node.js** is what runs your JavaScript on the server. **VS Code** is the editor where you'll spend most of your time.\n\n" +
"By the end of today:\n" +
"- Node.js installed; `node --version` works in your terminal.\n" +
"- VS Code installed with one or two essential extensions.\n" +
"- You've created a folder, written a one-line `hello.js`, and run it with `node hello.js`.\n\n" +
"## Why before anything else\n" +
"Week 1 expects you to `npm install` packages, run a dev server, and edit files in a real editor. None of that works without Node + VS Code in place today."
,
      videoTitle: 'Install Node.js + VS Code — 10 min setup',
      videoWhy: 'Watch first. You see exactly what to download, where to click, and how to confirm everything works. Then repeat in your own terminal.',
      videoCreator: 'various',
      durationMin: 12,
      practice:
"[CODE] Do every step.\n\n" +
"1. Install **Node.js LTS** from nodejs.org. Default options are fine.\n" +
"2. Open a terminal (Windows: PowerShell. Mac/Linux: Terminal). Confirm with `node --version` and `npm --version`.\n" +
"3. Install **VS Code** from code.visualstudio.com.\n" +
"4. Create a folder: `mkdir hello-forge && cd hello-forge`.\n" +
"5. Open it in VS Code: `code .` (or File → Open Folder if `code .` isn't on your PATH).\n" +
"6. New file `hello.js` with one line: `console.log('Hello Forge');`. Save.\n" +
"7. In the terminal: `node hello.js` → confirm `Hello Forge` prints.\n\n" +
"PASS:\n" +
"[x] `node --version` works\n" +
"[x] VS Code opens your hello-forge folder\n" +
"[x] `node hello.js` prints Hello Forge"
,
      swipe: [
        { p: "Node.js lets you run JavaScript on a server (or your laptop), not just in the browser.", a: true, r: "Right — that's the point. Node is the runtime for backend JS, build tools, scripts.", w: "Node runs JS outside the browser. Frontends in the browser, backends in Node." },
        { p: "You should install the LATEST (non-LTS) Node release for the most features.", a: false, r: "Right — pick LTS for stability. Latest is for experimentation; LTS for production-style projects.", w: "Pick the LTS (long-term support) build. Less breakage. Latest is for cutting-edge experiments only." },
        { p: "`node hello.js` in the terminal runs the file with Node.", a: true, r: "Right — Node executes the file. Output appears in the same terminal.", w: "Yes — that's the basic run command. `node <file.js>` executes it and prints any console.log output." }
      ],
    },

    'python-keys': {
      title: 'Your Coding Environment — Python, Anaconda, and an OpenAI / Anthropic API Key',
      summary: 'Python ready, an editor open, and your first API key safely in a .env file. Foundation for every AI Eng week.',
      whatItIs:
"## What it is\n" +
"AI engineering means calling a language model (Claude, GPT) from code. You need three things by the end of today:\n" +
"1. **Python** installed (via Anaconda — same one-install approach).\n" +
"2. An editor (VS Code) and a terminal you're comfortable in.\n" +
"3. An **API key** from OpenAI or Anthropic, stored in a `.env` file — **not** committed to git, ever.\n\n" +
"## Why the key safety today\n" +
"Leaked API keys are scraped from public GitHub repos and abused within minutes. You'll burn through your free credits in hours if you commit a key once. Today you set up the `.env + .gitignore` pattern so it never happens.\n\n" +
"## What you'll do today\n" +
"Install Anaconda, install VS Code, create a project folder with a `.env` and `.gitignore`, get an API key, run `python hello.py` that prints a model response."
,
      videoTitle: 'Python setup + your first OpenAI / Anthropic call',
      videoWhy: 'Watch first. You see the install, the API key setup, and the first model call working end to end. Then repeat the steps yourself.',
      videoCreator: 'various',
      durationMin: 15,
      practice:
"[CODE] Do every step.\n\n" +
"1. Install **Anaconda** from anaconda.com/download.\n" +
"2. Install **VS Code** from code.visualstudio.com.\n" +
"3. `mkdir hello-ai && cd hello-ai && code .`\n" +
"4. Sign up at console.anthropic.com or platform.openai.com. Generate one API key.\n" +
"5. Create a `.env` file with `ANTHROPIC_API_KEY=sk-...` (or OPENAI_API_KEY).\n" +
"6. Create a `.gitignore` containing `.env`.\n" +
"7. Create `hello.py`: load the env, call the model with `'Say hello to the Forge in one sentence.'`, print the response.\n" +
"8. Run `python hello.py` and see the reply.\n\n" +
"PASS:\n" +
"[x] `.env` exists with your key\n" +
"[x] `.gitignore` excludes `.env`\n" +
"[x] `python hello.py` prints a model reply"
,
      swipe: [
        { p: "An API key in a `.env` file is safe to commit to a public GitHub repo.", a: false, r: "Right — never. Bots scrape committed keys within minutes. Always gitignore `.env`.", w: "Never commit keys. The `.env` file lives ONLY on your machine; `.gitignore` keeps it out of git." },
        { p: "The `.gitignore` file tells git which files to leave out of commits.", a: true, r: "Right — exact purpose. List `.env` there before your first commit and you're safe.", w: "Yes — it's a list of patterns git ignores. Always add `.env` before pushing anything." },
        { p: "Anaconda is one way to get Python installed cleanly without managing system Python.", a: true, r: "Right — bundled, isolated, no PATH conflicts. Same advice as the DA / DS tracks.", w: "Anaconda gives you Python + Jupyter + libraries in one install. Cleanest start." }
      ],
    },

    'colab-conda': {
      title: 'Your Coding Environment — Conda + Google Colab GPUs',
      summary: 'Conda for local work, Colab for GPU jobs. Two environments you will use for every ML week.',
      whatItIs:
"## What it is\n" +
"ML engineering is two environments, not one:\n" +
"1. **Local (Anaconda / conda)** — for cleaning data, prototyping a model, writing tests. Your laptop CPU is fine here.\n" +
"2. **Google Colab** — for training anything that needs a **GPU**. Free Colab gives you a T4 GPU for hours of compute per session.\n\n" +
"By the end of today you'll have both working. Most weeks you'll prototype locally, then train on Colab when the model gets serious.\n\n" +
"## What you'll do today\n" +
"Install Anaconda, create a Python 3.11 conda env, install scikit-learn locally. Open a Colab notebook, enable a T4 GPU, run `import torch; torch.cuda.is_available()` and confirm `True`."
,
      videoTitle: 'Google Colab + GPU setup for ML',
      videoWhy: 'Watch first. You see how to switch on a T4 GPU and confirm CUDA works. Then repeat the steps yourself.',
      videoCreator: 'various',
      durationMin: 12,
      practice:
"[CODE] Do every step.\n\n" +
"LOCAL:\n" +
"1. Install **Anaconda** from anaconda.com/download.\n" +
"2. `conda create -n forge-ml python=3.11 -y && conda activate forge-ml`.\n" +
"3. `pip install scikit-learn`.\n" +
"4. `python -c \"from sklearn.linear_model import LinearRegression; print('ok')\"` → prints `ok`.\n\n" +
"COLAB:\n" +
"5. Go to colab.research.google.com (free Google account).\n" +
"6. New notebook. Runtime → Change runtime type → T4 GPU. Save.\n" +
"7. In the first cell:\n" +
"   ```python\n" +
"   import torch\n" +
"   print(torch.cuda.is_available(), torch.cuda.get_device_name(0))\n" +
"   ```\n" +
"8. Run it. Confirm `True Tesla T4`.\n\n" +
"PASS:\n" +
"[x] Local conda env imports sklearn\n" +
"[x] Colab shows `True` for `cuda.is_available()`\n" +
"[x] Colab is running on a T4"
,
      swipe: [
        { p: "Google Colab gives you a free GPU for training small ML models.", a: true, r: "Right — T4 GPU, hours per session, free. Reach for it whenever training is slow on CPU.", w: "Yes — free T4 GPU access via Colab is the standard 'don't have a beefy laptop' answer." },
        { p: "You should train every model on Colab, even tiny ones.", a: false, r: "Right — small models train faster locally. Save Colab for jobs that actually need a GPU.", w: "Local is faster for tiny models (no upload, no session). Use Colab when CPU training drags." },
        { p: "`torch.cuda.is_available()` returning False on Colab means you forgot to enable the GPU.", a: true, r: "Right — Runtime → Change runtime type → T4 GPU. Without it, Colab is CPU-only.", w: "Yes — Colab defaults to CPU. Switch the runtime to GPU and re-run for True." }
      ],
    },

    'expo': {
      title: 'Your Coding Environment — Node + Expo + Your Phone',
      summary: 'Node, Expo, and your phone running Expo Go. The foundation for every mobile day.',
      whatItIs:
"## What it is\n" +
"Mobile development needs more setup than web. You need:\n" +
"1. **Node.js LTS** — same as web.\n" +
"2. **Expo CLI** — `npx create-expo-app` will scaffold your projects.\n" +
"3. **Expo Go** on your phone (iOS App Store / Google Play) — runs your app live, no native build needed.\n\n" +
"By the end of today you have all three. You scaffold a starter app, run `npx expo start`, scan the QR code with Expo Go on your phone, and see your app live.\n\n" +
"## Why before anything else\n" +
"Week 1 says 'create a screen and see it on your phone.' Without Expo Go set up today, that's impossible. Get it working now so the rest of the week is just code."
,
      videoTitle: 'Expo + React Native setup in 10 minutes',
      videoWhy: 'Watch first. You see the install, the phone QR-code workflow, and the first running app. Then repeat the steps yourself.',
      videoCreator: 'various',
      durationMin: 12,
      practice:
"[CODE] Do every step.\n\n" +
"1. Install **Node.js LTS** from nodejs.org if you haven't already.\n" +
"2. Install **Expo Go** on your phone: search 'Expo Go' on the App Store / Google Play.\n" +
"3. In a terminal: `npx create-expo-app hello-forge` → confirm yes to install dependencies.\n" +
"4. `cd hello-forge && npx expo start`.\n" +
"5. A QR code appears in the terminal. Open Expo Go on your phone → Scan QR.\n" +
"6. The starter app loads on your phone.\n\n" +
"PASS:\n" +
"[x] `node --version` works\n" +
"[x] Expo Go installed on your phone\n" +
"[x] The starter app loads when you scan the QR code"
,
      swipe: [
        { p: "Expo Go lets you run your React Native app on your phone without a native build.", a: true, r: "Right — that's the speed advantage. Edit code on your laptop, save, see changes on phone.", w: "Yes — Expo Go runs your code live. No Xcode / Android Studio needed to see your app." },
        { p: "Your laptop and phone must be on the SAME Wi-Fi network for Expo Go to connect.", a: true, r: "Right — Expo Go connects over the LAN by default. Same Wi-Fi or Tunnel mode.", w: "Same Wi-Fi for the default LAN mode. If they're not, use Tunnel mode (slower)." },
        { p: "You need an Apple Developer account to test on iPhone with Expo Go.", a: false, r: "Right — no. Expo Go is free, no developer account needed for daily testing.", w: "Expo Go is a free app — no developer account needed to test daily. That's later, when publishing." }
      ],
    },

    'terminal-vm': {
      title: 'Your Coding Environment — Terminal, VirtualBox / WSL, Kali Lab',
      summary: 'A safe lab environment for hacking practice. Foundation for every cybersec day.',
      whatItIs:
"## What it is\n" +
"You **cannot** practice security tools on your everyday laptop's OS. Two reasons:\n" +
"1. Half the tools you'll run are flagged as malware (correctly — they're attack tools).\n" +
"2. You need to break things, and breaking your daily-driver is bad.\n\n" +
"The answer: a **virtual machine** with a security-focused OS like **Kali Linux**. Inside the VM you can install / break / re-image as much as you want without touching your host.\n\n" +
"## What you'll do today\n" +
"1. Install **VirtualBox** (Windows / Mac / Linux) OR **WSL2 with Kali** (Windows-only, lighter).\n" +
"2. Download the Kali VM image (or `wsl --install -d kali-linux`).\n" +
"3. Boot it.\n" +
"4. Open the terminal inside Kali and run `nmap --version` → confirm output."
,
      videoTitle: 'Install Kali Linux in VirtualBox (or WSL2)',
      videoWhy: 'Watch first. You see the VM setup, the Kali boot, and the first command. Then repeat in your own environment.',
      videoCreator: 'NetworkChuck / various',
      durationMin: 15,
      practice:
"[CODE] Do every step.\n\n" +
"WINDOWS (WSL path, fastest):\n" +
"1. Open PowerShell as Admin: `wsl --install -d kali-linux`.\n" +
"2. Reboot. Open 'Kali Linux' from Start.\n" +
"3. First-run prompts you for a username + password. Set them.\n" +
"4. `sudo apt update && sudo apt install -y nmap`.\n" +
"5. `nmap --version`.\n\n" +
"MAC / LINUX (VirtualBox path):\n" +
"1. Install **VirtualBox** from virtualbox.org.\n" +
"2. Download Kali pre-built VirtualBox VM from kali.org/get-kali.\n" +
"3. Import into VirtualBox, boot it.\n" +
"4. Inside the VM: `nmap --version`.\n\n" +
"PASS:\n" +
"[x] Kali boots\n" +
"[x] `nmap --version` prints a version inside Kali"
,
      swipe: [
        { p: "You should install security tools like nmap directly on your everyday laptop OS.", a: false, r: "Right — no. Use a VM. Half these tools are flagged by antivirus and you don't want to break your daily-driver.", w: "Use a VM. Daily-driver should stay clean; the VM is your lab." },
        { p: "WSL2 with Kali is a lighter alternative to a full VirtualBox VM on Windows.", a: true, r: "Right — WSL2 reuses your kernel, no full hypervisor. Faster boots, less RAM.", w: "Yes — WSL2 is the lightweight option on Windows. VirtualBox is heavier but works everywhere." },
        { p: "Kali Linux ships with nmap, metasploit and most security tools pre-installed.", a: true, r: "Right — that's its whole point. A pre-loaded toolkit for security work.", w: "Yes — Kali's the 'batteries included' distro for security work. You install fewer things by hand." }
      ],
    },

    'excel-powerbi': {
      title: 'Your Coding Environment — Excel + Power BI Desktop',
      summary: 'Working Excel + free Power BI Desktop installed. Foundation for every BI day.',
      whatItIs:
"## What it is\n" +
"BI work happens in two tools you'll touch every week:\n" +
"1. **Excel** — for quick analysis, ad-hoc pivots, the universal 'send me the file' format.\n" +
"2. **Power BI Desktop** — Microsoft's free dashboard builder. Where serious BI work lives.\n\n" +
"By the end of today you have both, and you've loaded a CSV into Power BI Desktop and made one chart.\n\n" +
"## What you'll do today\n" +
"Install Excel (Microsoft 365 trial if you don't already have it). Install Power BI Desktop (free) from powerbi.microsoft.com. Download a sample CSV, load it into Power BI, drag two fields onto the canvas, see a chart appear."
,
      videoTitle: 'Power BI Desktop — install + first chart',
      videoWhy: 'Watch first. You see the install, the load-CSV step, and the first chart. Then do it yourself.',
      videoCreator: 'various',
      durationMin: 12,
      practice:
"[CODE / CLICK] Do every step.\n\n" +
"1. Confirm Excel works (Microsoft 365 trial if needed).\n" +
"2. Install **Power BI Desktop** from powerbi.microsoft.com/desktop. Windows-only — Mac users use Boot Camp / Parallels / Windows VM.\n" +
"3. Open Power BI Desktop.\n" +
"4. Home → Get data → Text/CSV → pick any CSV (Superstore Sample CSVs are common; or any small public CSV).\n" +
"5. Load. Drag a category field to 'Axis' and a measure to 'Values' on a Clustered column chart.\n" +
"6. Save the .pbix file as `day0.pbix`.\n\n" +
"PASS:\n" +
"[x] Power BI Desktop launches\n" +
"[x] A CSV is loaded\n" +
"[x] A chart renders on the canvas\n" +
"[x] day0.pbix saved"
,
      swipe: [
        { p: "Power BI Desktop is free.", a: true, r: "Right — Microsoft gives Desktop away free. Sharing dashboards online is the paid part.", w: "Yes — Desktop is free. The paid tier (Pro) is for cloud sharing + scheduled refresh." },
        { p: "Power BI Desktop runs natively on macOS.", a: false, r: "Right — Windows only. Mac users use Boot Camp / Parallels / a Windows VM.", w: "Power BI Desktop is Windows-only. Mac users boot Windows in a VM or use Boot Camp." },
        { p: "Loading a CSV into Power BI Desktop is the first step of every dashboard.", a: true, r: "Right — Get data → Text/CSV. The pattern repeats with databases, APIs, Excel, etc.", w: "Yes — Get data is always step one. CSV is the simplest version of it." }
      ],
    },

    'browser-account': {
      title: 'Your Coding Environment — Browser, Zapier / Make Account, API Keys',
      summary: 'Sign up for Zapier or Make, get a Google account API key. Foundation for every AI Automation day.',
      whatItIs:
"## What it is\n" +
"AI Automation work happens almost entirely **in the browser** with no-code / low-code tools. You need:\n" +
"1. A free **Zapier** OR **Make.com** account (pick one, they're interchangeable for learning).\n" +
"2. A free OpenAI / Anthropic API key (same setup as AI Eng track).\n" +
"3. A free Google account (Gmail, Sheets, Drive — you'll connect these to the automations).\n\n" +
"## What you'll do today\n" +
"Sign up for Zapier (or Make). Connect it to Gmail. Build a one-step Zap: 'When a new email arrives in Gmail → send me a Slack DM (or another email)'. Trigger it manually. Confirm it fires."
,
      videoTitle: 'Zapier crash course — your first Zap in 10 minutes',
      videoWhy: 'Watch first. You see the sign-up, the first Zap, and the test. Then build your own.',
      videoCreator: 'various',
      durationMin: 10,
      practice:
"[CLICK] Do every step.\n\n" +
"1. Sign up at **zapier.com** (or **make.com**). Free plan is fine.\n" +
"2. Connect your Gmail (OAuth — click Allow).\n" +
"3. New Zap: Trigger = Gmail, action = 'New Email Matching Search' or similar.\n" +
"4. Add an action: Send yourself a Slack DM, or another email to a different inbox.\n" +
"5. Test the trigger. Confirm the action fires.\n" +
"6. Turn the Zap ON.\n\n" +
"PASS:\n" +
"[x] Zapier (or Make) account active\n" +
"[x] Gmail connected\n" +
"[x] One Zap built and tested\n" +
"[x] Zap is ON"
,
      swipe: [
        { p: "Zapier and Make.com cover the same kinds of automations — pick one to start.", a: true, r: "Right — same job, different UX. Start with whichever clicks for you. Switching later is easy.", w: "Yes — Zapier is more popular, Make is cheaper at scale. Either works for learning." },
        { p: "You need to write code to build a basic Zap.", a: false, r: "Right — no. Zaps are clicked together in the browser. Code is optional for advanced steps.", w: "Zaps are click-to-build. Code is only needed for unusual transformations or custom integrations." },
        { p: "Connecting Gmail to Zapier requires a one-time OAuth permission grant.", a: true, r: "Right — Google's OAuth. Click Allow once, Zapier can read/send on your behalf until you revoke.", w: "Yes — OAuth grant once. Zapier acts on your behalf until you revoke access in Google security settings." }
      ],
    },
  };

  return recipes[env];
}

const ROOT = path.join(__dirname, '..', 'data', 'roadmaps');

let added = 0;
let skipped = 0;
for (const t of TRACKS) {
  const file = path.join(ROOT, `${t.slug}.json`);
  const d = JSON.parse(fs.readFileSync(file, 'utf8'));
  const week = d.weeks.find((w) => w.number === t.week);
  if (!week) {
    console.warn(`SKIP ${t.slug}: W${t.week} not found`);
    skipped++;
    continue;
  }
  if (week.days.some((x) => x.number === 0)) {
    console.warn(`SKIP ${t.slug}: W${t.week} already has Day 0`);
    skipped++;
    continue;
  }
  const r = buildDay0(t.env);
  const url = VIDEO_URL[t.env];
  const day0 = {
    number: 0,
    title: r.title,
    summary: r.summary,
    items: [
      { kind: 'lesson', title: `What this environment is — and why before anything else`, body: r.whatItIs },
      { kind: 'video', title: r.videoTitle, url, duration_min: r.durationMin, creator: r.videoCreator, why: r.videoWhy },
      { kind: 'lesson', title: 'See it in action — the exact steps, with what you should see', body: r.practice.replace(/^\[(CODE|CLICK)\] /,'## Walkthrough\n').replace('PASS:', '## Verify\nPASS:') },
      {
        kind: 'swipe',
        title: 'Quick check — swipe to answer',
        cards: r.swipe.map((c) => ({ prompt: c.p, answer: c.a, whenRight: c.r, whenWrong: c.w })),
      },
      { kind: 'exercise', title: 'Your turn — set it up', body: r.practice },
    ],
  };
  week.days.unshift(day0);
  fs.writeFileSync(file, JSON.stringify(d, null, 2), 'utf8');
  console.log(`OK   ${t.slug}: W${t.week} now has ${week.days.length} days (Day 0 + previous ${week.days.length - 1})`);
  added++;
}

console.log(`\nAdded ${added}, skipped ${skipped}.`);
