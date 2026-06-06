#!/usr/bin/env python3
"""
Universal track enricher v2 — preserve-and-pad strategy.

Key changes vs v1:
- Raw per-day items are the SOURCE OF TRUTH; we only pad missing kinds.
- Day 0: prefer raw D0 (after off-topic filtering); only synthesise if missing.
- Videos use day-specific title (not week-level keyword soup) and rotate within a week.
- Off-topic leakage (e.g., SQL lesson stuck in DevOps W1 D0) is filtered out.
- Exercises come from raw day items, not the generic fallback.

Usage:
    python enrich_track.py                   # processes ALL 8 tracks
    python enrich_track.py full-stack-web    # one track by slug
"""

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent

# ============================================================
# KNOWN_GOOD video library — each key now has a list of alternates
# (url, duration_min, creator, title) so days in the same week can
# rotate through different videos for the same topic family.
# ============================================================
KNOWN_GOOD = {
    'git': [
        ('https://www.youtube.com/watch?v=USjZcfj8yxE', 10, 'Web Dev Simplified', 'Your First Git + GitHub Push'),
        ('https://www.youtube.com/watch?v=HkdAHXoRtos', 12, 'Fireship',           '13 Advanced Git Tricks'),
        ('https://www.youtube.com/watch?v=eulnSXkhE7I', 8,  'Fireship',           'Git Branches Explained'),
    ],
    'linux':       [('https://www.youtube.com/watch?v=ROjZy1WbCIA', 5, 'ThePrimeagen', 'Linux in 5 minutes')],
    'ssh':         [('https://www.youtube.com/watch?v=ORrELbFHwU4', 5, 'NetworkChuck', 'SSH in 5 minutes')],
    'docker': [
        ('https://www.youtube.com/watch?v=Gjnup-PuquQ', 2, 'Fireship', 'Docker in 100 Seconds'),
        ('https://www.youtube.com/watch?v=eGz9DS-aIeY', 6, 'Fireship', 'Docker Tutorial for Beginners'),
        ('https://www.youtube.com/watch?v=DM65_JyGxCo', 5, 'Fireship', 'Dockerfile Best Practices'),
    ],
    'kubernetes': [
        ('https://www.youtube.com/watch?v=X48VuDVv0do', 2, 'Fireship',     'Kubernetes in 100 Seconds'),
        ('https://www.youtube.com/watch?v=PziYflu8cB8', 6, 'TechWorld w/ Nana', 'Kubernetes Crash Course'),
    ],
    'terraform': [
        ('https://www.youtube.com/watch?v=tomUWcQ0P3k', 2, 'Fireship', 'Terraform in 100 Seconds'),
        ('https://www.youtube.com/watch?v=l5k1ai_GBDE', 10, 'DevOps Toolkit', 'Terraform Tutorial for Beginners'),
    ],
    'helm':        [('https://www.youtube.com/watch?v=ufiTD4I8k48', 2, 'Fireship', 'Helm in 100 Seconds')],
    'argo':        [('https://www.youtube.com/watch?v=MeU5_k9ssrs', 2, 'Fireship', 'Argo CD in 100 Seconds')],
    'prometheus':  [('https://www.youtube.com/watch?v=h4Sl21AKiDg', 2, 'Fireship', 'Prometheus in 100 Seconds')],
    'nginx':       [('https://www.youtube.com/watch?v=9t4MvM9iP8M', 5, 'Fireship', 'Nginx in 5 minutes')],
    'aws': [
        ('https://www.youtube.com/watch?v=Kp_4tTHtOVk', 10, 'Fireship',     'AWS in 10 minutes'),
        ('https://www.youtube.com/watch?v=ulprqHHWlng', 12, 'NetworkChuck', 'AWS Tutorial for Beginners'),
    ],
    'iac':         [('https://www.youtube.com/watch?v=hg3f3gWOKq4', 5, 'Fireship', 'Infrastructure as Code in 5 minutes')],
    'networking':  [('https://www.youtube.com/watch?v=qiQR5rTSshw', 2, 'Fireship', 'Computer Networking in 100 seconds')],
    'owasp':       [('https://www.youtube.com/watch?v=ub1GvSlj1uE', 5, 'Fireship', 'OWASP Top 10')],
    # Frontend / web
    'javascript':  [('https://www.youtube.com/watch?v=DHjqpvDnNGE', 2, 'Fireship', 'JavaScript in 100 Seconds')],
    'typescript':  [('https://www.youtube.com/watch?v=zQnBQ4tB3ZA', 2, 'Fireship', 'TypeScript in 100 Seconds')],
    'react': [
        ('https://www.youtube.com/watch?v=Tn6-PIqc4UM', 2, 'Fireship', 'React in 100 Seconds'),
        ('https://www.youtube.com/watch?v=bMknfKXIFA8', 12, 'freeCodeCamp', 'React Course for Beginners'),
    ],
    'nextjs': [
        ('https://www.youtube.com/watch?v=Sklc_fQBmcs', 2, 'Fireship', 'Next.js in 100 Seconds'),
        ('https://www.youtube.com/watch?v=ZVnjOPwW4ZA', 10, 'Vercel', 'Next.js App Router Walkthrough'),
    ],
    'tailwind':    [('https://www.youtube.com/watch?v=mr15Xzb1Ook', 2, 'Fireship', 'Tailwind CSS in 100 Seconds')],
    'astro':       [('https://www.youtube.com/watch?v=gxBkghlglTg', 2, 'Fireship', 'Astro in 100 Seconds')],
    'vite':        [('https://www.youtube.com/watch?v=KCrXgy8qtjM', 2, 'Fireship', 'Vite in 100 Seconds')],
    'redux':       [('https://www.youtube.com/watch?v=_shA5Xwe8_4', 2, 'Fireship', 'Redux in 100 Seconds')],
    'graphql':     [('https://www.youtube.com/watch?v=eIQh02xuVw4', 2, 'Fireship', 'GraphQL in 100 Seconds')],
    'html':        [('https://www.youtube.com/watch?v=qz0aGYrrlhU', 60, 'freeCodeCamp', 'HTML Tutorial for Beginners')],
    'css':         [('https://www.youtube.com/watch?v=OEV8gMkCHXQ', 60, 'freeCodeCamp', 'CSS Tutorial for Beginners')],
    'netlify':     [('https://www.youtube.com/watch?v=2DSL4Wf3DUk', 5, 'Netlify',    'Deploy a Site on Netlify')],
    'vercel':      [('https://www.youtube.com/watch?v=DkFkM5kn8XY', 5, 'Vercel',     'Deploy with Vercel in 5 minutes')],
    # Backend
    'nodejs':      [('https://www.youtube.com/watch?v=ENrzD9HAZK4', 2, 'Fireship', 'Node.js in 100 Seconds')],
    'express':     [('https://www.youtube.com/watch?v=-MTSQjw5DrM', 2, 'Fireship', 'Express in 100 Seconds')],
    'postgres':    [('https://www.youtube.com/watch?v=n2Fluyr3lbc', 2, 'Fireship', 'PostgreSQL in 100 Seconds')],
    'prisma':      [('https://www.youtube.com/watch?v=rLRIB6AF2Dg', 2, 'Fireship', 'Prisma in 100 Seconds')],
    'rest':        [('https://www.youtube.com/watch?v=-MTSQjw5DrM', 2, 'Fireship', 'REST API in 100 Seconds')],
    'auth': [
        ('https://www.youtube.com/watch?v=2PPSXonhIck', 5, 'Fireship', '7 Auth Strategies in 5 minutes'),
        ('https://www.youtube.com/watch?v=ZV5yTm4pT8g', 5, 'OktaDev',  'OAuth 2.0 Explained'),
    ],
    'jwt':         [('https://www.youtube.com/watch?v=7Q17ubqLfaM', 2, 'Fireship', 'JWT in 100 Seconds')],
    'stripe':      [('https://www.youtube.com/watch?v=Psm9LUiOtbU', 5, 'Fireship', 'Stripe Checkout Tutorial')],
    'websocket':   [('https://www.youtube.com/watch?v=1BfCnjr_Vjg', 2, 'Fireship', 'WebSockets in 100 Seconds')],
    # Mobile
    'reactnative': [('https://www.youtube.com/watch?v=gvkqT_Uoahw', 2, 'Fireship', 'React Native in 100 Seconds')],
    'expo':        [('https://www.youtube.com/watch?v=mQM5nPwMod0', 5, 'Fireship', 'Expo + React Native')],
    'flutter':     [('https://www.youtube.com/watch?v=lHhRhPV--G0', 2, 'Fireship', 'Flutter in 100 Seconds')],
    # Data / ML / AI
    'python':      [('https://www.youtube.com/watch?v=x7X9w_GIm1s', 2, 'Fireship', 'Python in 100 Seconds')],
    'pandas':      [('https://www.youtube.com/watch?v=DkjCaAMBGWM', 2, 'Fireship', 'Pandas in 100 Seconds')],
    'jupyter':     [('https://www.youtube.com/watch?v=h1sAzPojKMg', 2, 'Fireship', 'Jupyter in 100 Seconds')],
    'pytorch':     [('https://www.youtube.com/watch?v=ORMx45xqWkA', 2, 'Fireship', 'PyTorch in 100 Seconds')],
    'tensorflow':  [('https://www.youtube.com/watch?v=i8NETqtGHms', 2, 'Fireship', 'TensorFlow in 100 Seconds')],
    'ml':          [('https://www.youtube.com/watch?v=I74ymkoNTnw', 5, 'Fireship', 'Machine Learning in 100 Seconds')],
    'openai':      [('https://www.youtube.com/watch?v=ULqJxckBfHA', 5, 'Fireship',  'GPT-4 + LangChain Tutorial')],
    'anthropic':   [('https://www.youtube.com/watch?v=jGvipKziJ_E', 5, 'Anthropic', 'Building with Claude')],
    'langchain':   [('https://www.youtube.com/watch?v=lG7Uxts9SXs', 2, 'Fireship',  'LangChain in 100 Seconds')],
    'rag':         [('https://www.youtube.com/watch?v=T-D1OfcDW1M', 5, 'IBM Technology', 'What is RAG?')],
    'vector':      [('https://www.youtube.com/watch?v=klTvEwg3oJ4', 2, 'Fireship',  'Vector Databases in 100 Seconds')],
    'agent':       [('https://www.youtube.com/watch?v=ZYf9V2fSFwU', 5, 'Anthropic', 'Building Effective Agents')],
    'mcp':         [('https://www.youtube.com/watch?v=7j_NE6Pjv-E', 5, 'Anthropic', 'Introduction to MCP')],
    'embedding':   [('https://www.youtube.com/watch?v=klTvEwg3oJ4', 2, 'Fireship',  'Vector Databases in 100 Seconds')],
    'n8n':         [('https://www.youtube.com/watch?v=AURnISajubk', 5, 'n8n',       'Getting Started with n8n')],
    # BI
    'powerbi':     [('https://www.youtube.com/watch?v=AGrl-H87pRU', 5, 'Microsoft', 'Power BI in 6 minutes')],
    'sql':         [('https://www.youtube.com/watch?v=zsjvFFKOm3c', 2, 'Fireship',  'SQL in 100 Seconds')],
    'dax':         [('https://www.youtube.com/watch?v=NgY-PqQfeAQ', 5, 'Microsoft', 'DAX Fundamentals')],
    'bigquery':    [('https://www.youtube.com/watch?v=eyBK9nj-7AA', 5, 'Google Cloud', 'BigQuery in 5 minutes')],
    # Security
    'burp':        [('https://www.youtube.com/watch?v=2VKvkX9CSXg', 10, 'PortSwigger', 'Burp Suite Beginner Tutorial')],
    'kali':        [('https://www.youtube.com/watch?v=U1w4T03B30I', 5,  'NetworkChuck', 'Kali Linux Crash Course')],
    'metasploit':  [('https://www.youtube.com/watch?v=8lR27r8Y_ik', 5,  'NetworkChuck', 'Metasploit in 5 minutes')],
    'nmap':        [('https://www.youtube.com/watch?v=4t4kBkMsDbQ', 5,  'NetworkChuck', 'Nmap Tutorial for Beginners')],
    'wireshark':   [('https://www.youtube.com/watch?v=jvuiI1Leg6w', 5,  'NetworkChuck', 'Wireshark Crash Course')],
    'siem':        [('https://www.youtube.com/watch?v=GG-VRGx2j8s', 5,  'Professor Messer', 'SIEM Explained')],
    'zerotrust':   [('https://www.youtube.com/watch?v=yn6CPQ9RioA', 5,  'IBM Technology', 'Zero Trust Explained')],
    'ethics':      [('https://www.youtube.com/watch?v=Vfpc4rEW7tg', 8,  'NetworkChuck', 'Hacking Ethics & The Law')],
    'xss':         [('https://www.youtube.com/watch?v=EoaDgUgS6QA', 5,  'PwnFunction', 'Cross-Site Scripting Explained')],
    'idor':        [('https://www.youtube.com/watch?v=rINq_dahdtg', 5,  'PwnFunction', 'IDOR Explained')],
    'reports':     [('https://www.youtube.com/watch?v=qHQynltMzaQ', 5,  'InsiderPhD',  'How to Write a Bug Report')],
}

DEFAULT_VIDEO_KEY = 'git'

# Keyword -> KNOWN_GOOD key. Order matters: most specific first.
KEYWORD_VIDEO_MAP = [
    ('react native', 'reactnative'), ('expo', 'expo'), ('flutter', 'flutter'),
    ('next.js', 'nextjs'), ('next js', 'nextjs'), ('app router', 'nextjs'), ('nextjs', 'nextjs'),
    ('astro', 'astro'), ('vite', 'vite'), ('tailwind', 'tailwind'),
    ('redux', 'redux'), ('zustand', 'redux'), ('graphql', 'graphql'),
    ('html', 'html'), ('css', 'css'),
    ('netlify', 'netlify'), ('vercel', 'vercel'),
    ('react', 'react'), ('typescript', 'typescript'), ('javascript', 'javascript'),
    ('node', 'nodejs'), ('express', 'express'),
    ('postgres', 'postgres'), ('prisma', 'prisma'),
    ('stripe', 'stripe'),
    ('websocket', 'websocket'), ('socket.io', 'websocket'),
    ('jwt', 'jwt'), ('oauth', 'auth'), ('auth', 'auth'),
    ('rest api', 'rest'), ('rest', 'rest'),
    ('powerbi', 'powerbi'), ('power bi', 'powerbi'), ('dax', 'dax'),
    ('bigquery', 'bigquery'), ('looker', 'bigquery'),
    ('pandas', 'pandas'), ('jupyter', 'jupyter'),
    ('pytorch', 'pytorch'), ('tensorflow', 'tensorflow'),
    ('langchain', 'langchain'), ('rag', 'rag'), ('mcp', 'mcp'),
    ('embedding', 'embedding'), ('vector', 'vector'),
    ('agent', 'agent'), ('autonomous', 'agent'),
    ('openai', 'openai'), ('claude', 'anthropic'), ('anthropic', 'anthropic'), ('llm', 'openai'),
    ('n8n', 'n8n'), ('automation', 'n8n'),
    ('machine learning', 'ml'), ('ml model', 'ml'), ('first model', 'ml'),
    ('xss', 'xss'), ('cross-site', 'xss'),
    ('idor', 'idor'), ('broken auth', 'idor'),
    ('bug report', 'reports'), ('report', 'reports'),
    ('ethics', 'ethics'),
    ('burp', 'burp'), ('zap', 'burp'),
    ('kali', 'kali'), ('virtualbox', 'kali'),
    ('metasploit', 'metasploit'), ('nmap', 'nmap'), ('wireshark', 'wireshark'),
    ('siem', 'siem'), ('zero trust', 'zerotrust'),
    ('owasp', 'owasp'), ('vulnerability', 'owasp'), ('vuln ', 'owasp'),
    ('pentest', 'burp'), ('juice shop', 'owasp'),
    ('docker', 'docker'), ('container', 'docker'),
    ('kubernetes', 'kubernetes'), ('k8s', 'kubernetes'),
    ('terraform', 'terraform'),
    ('helm', 'helm'),
    ('argo', 'argo'), ('gitops', 'argo'),
    ('prometheus', 'prometheus'), ('monitoring', 'prometheus'), ('observability', 'prometheus'),
    ('nginx', 'nginx'), ('web server', 'nginx'),
    ('aws', 'aws'), ('cloud', 'aws'),
    ('infrastructure', 'iac'),
    ('networking', 'networking'), ('dns', 'networking'),
    ('linux', 'linux'), ('shell', 'linux'), ('terminal', 'linux'),
    ('ssh', 'ssh'),
    ('git', 'git'), ('github', 'git'),
    ('sql', 'sql'), ('python', 'python'),
]


def _video_dict(tup):
    url, dur, creator, title = tup
    return {"title": title, "url": url, "duration_min": dur, "creator": creator,
            "why": "The fastest mental model for today's core idea."}


def pick_video_for_day(day_topic: str, used_urls: set) -> dict:
    """Pick a video for one day, preferring URLs not used yet this week."""
    c = (day_topic or '').lower()
    for keyword, key in KEYWORD_VIDEO_MAP:
        if keyword in c:
            for tup in KNOWN_GOOD[key]:
                if tup[0] not in used_urls:
                    return _video_dict(tup)
            return _video_dict(KNOWN_GOOD[key][0])
    for tup in KNOWN_GOOD[DEFAULT_VIDEO_KEY]:
        if tup[0] not in used_urls:
            return _video_dict(tup)
    return _video_dict(KNOWN_GOOD[DEFAULT_VIDEO_KEY][0])


# ============================================================
# Day 0 setup — per-track prerequisite topics
# ============================================================
TRACK_PREREQUISITES = {
    'devops-cloud': {
        1: "Terminal, Git, GitHub", 2: "DNS basics + Cloudflare account",
        3: "GitHub Actions workflow file basics", 4: "UptimeRobot account + log viewer setup",
        5: "Docker Desktop install + first container", 6: "Docker Compose CLI verification",
        7: "Trivy security scanner install", 8: "containerd + nerdctl install",
        9: "kind / k3d local cluster setup", 10: "kubectl install and context switching",
        11: "Helm CLI install", 12: "istioctl / linkerd CLI install",
        13: "Terraform CLI install + AWS credentials", 14: "aws / gcloud / az CLI install + auth",
        15: "Multi-cloud CLI setup", 16: "AWS Secrets Manager / HashiCorp Vault setup",
        17: "GitHub Actions runner + repo secrets", 18: "Argo CD CLI install + bootstrap repo",
        19: "Prometheus + Grafana docker-compose stack", 20: "SLO tracking sheet / Nobl9 trial account",
        21: "AWS Cost Explorer access + CUR setup", 22: "Velero backup CLI install",
        23: "AWS IAM Access Analyzer / Prowler install",
        24: "Capstone toolchain check (terraform, kubectl, helm, argocd)",
    },
    'full-stack-web': {
        1: "Node.js, npm, VS Code, Git", 2: "Browser DevTools + JavaScript console",
        3: "Netlify CLI install + form testing", 4: "Astro CLI install + project scaffold",
        5: "React + Vite project scaffold", 6: "Next.js App Router + create-next-app",
        7: "Tailwind CSS install + PostCSS config", 8: "Zustand / Redux Toolkit install",
        9: "Node + Express scaffold", 10: "PostgreSQL + Prisma CLI install",
        11: "Postman / Bruno API client install", 12: "NextAuth.js / Clerk install + provider keys",
        13: "Stripe CLI + test account", 14: "Resend / Postmark account + SDK install",
        15: "AWS S3 bucket + AWS SDK install", 16: "Socket.io / Pusher install",
        17: "Vitest + Playwright install", 18: "Lighthouse CI install + WebPageTest account",
        19: "Vercel CLI + GitHub Actions", 20: "Sentry + Axiom account",
        21: "OWASP ZAP install + security headers checker", 22: "k6 load testing CLI install",
        23: "Figma account + Framer Motion install",
        24: "Production stack check (Next.js, Prisma, Stripe, Sentry, Vercel)",
    },
    'mobile-engineering': {
        1: "Expo CLI + Node + iOS/Android emulator",
        2: "expo-notifications install + push token", 3: "AsyncStorage install + simulator persistence test",
        4: "TypeScript + tsconfig strict mode", 5: "React Hook Form + zod install",
        6: "Reanimated + Gesture Handler install", 7: "NativeWind / Restyle theme system install",
        8: "MMKV + SQLite (expo-sqlite) install", 9: "expo-camera + expo-image-picker permissions",
        10: "expo-location + react-native-maps API keys", 11: "expo-notifications + Firebase Cloud Messaging",
        12: "Expo Modules CLI for native code", 13: "axios + TanStack Query install",
        14: "expo-auth-session + expo-local-authentication", 15: "expo-task-manager + expo-background-fetch",
        16: "Sentry React Native + Firebase Analytics", 17: "Flipper / React DevTools for performance",
        18: "Accessibility scanner + screen reader test", 19: "i18next + expo-localization",
        20: "Jest + Maestro install", 21: "EAS CLI + Apple/Google developer accounts",
        22: "expo-updates + EAS channels", 23: "App Store Connect + Play Console setup",
        24: "Full mobile pipeline check (Expo, EAS, Sentry, stores)",
    },
    'cybersecurity': {
        1: "Kali Linux VM + browser DevTools", 2: "Juice Shop docker container running",
        3: "TryHackMe account + OpenVPN config", 4: "Burp Suite Community + browser proxy",
        5: "OWASP ZAP install + scan target", 6: "Metasploit framework + msfconsole",
        7: "Nmap + nikto install", 8: "Markdown editor + report template",
        9: "Splunk Free / Elastic stack install", 10: "TheHive + Cortex docker setup",
        11: "Wazuh agent + manager install", 12: "MITRE ATT&CK Navigator + STIX tools",
        13: "Prowler / ScoutSuite install + AWS credentials", 14: "kube-bench + Trivy install",
        15: "Semgrep + Snyk install", 16: "OWASP Threat Dragon install",
        17: "SonarQube + DAST scanner install", 18: "Sigstore + cosign install",
        19: "OpenSCAP / compliance-as-code tools", 20: "Okta developer account / Keycloak",
        21: "Volatility 3 + Autopsy install", 22: "Atomic Red Team + Caldera install",
        23: "LinkedIn profile + GitHub portfolio repo",
        24: "Full sec toolchain check (Kali, Burp, ZAP, Metasploit, Prowler)",
    },
    'bi-analytics': {
        1: "Power BI Desktop install (Windows)", 2: "Power BI + DAX Studio install",
        3: "Power BI Service workspace + RLS test users", 4: "Power BI Service + on-prem data gateway",
        5: "DAX Studio + Tabular Editor install", 6: "Power BI + advanced DAX patterns",
        7: "SQL Server Express / DBeaver install", 8: "dbt-core + a warehouse account (BigQuery free tier)",
        9: "Excel / Google Sheets + statistics add-ins", 10: "Python + scipy + statsmodels install",
        11: "Figma + Notion for storytelling", 12: "Python 3.11 + Jupyter Lab install",
        13: "Google Cloud account + BigQuery + Looker Studio", 14: "ChatGPT + Claude + GitHub Copilot accounts",
        15: "LinkedIn profile + portfolio site", 16: "Capstone tool stack selection",
        17: "Presentation tools (PowerPoint / Loom) check",
    },
    'ml-engineering': {
        1: "Python 3.11 + Conda + scikit-learn", 2: "pandas + matplotlib + seaborn install",
        3: "Optuna + scikit-learn install", 4: "Flask + gunicorn install",
        5: "scikit-learn + statsmodels install", 6: "XGBoost + LightGBM install",
        7: "UMAP + HDBSCAN install", 8: "statsmodels + Prophet install",
        9: "PyTorch + CUDA toolkit install", 10: "torchvision + image datasets",
        11: "transformers + tokenizers + datasets", 12: "diffusers + accelerate install",
        13: "MLflow + Weights & Biases install", 14: "NVIDIA drivers + CUDA + cuDNN check",
        15: "DVC + Apache Airflow install", 16: "Docker + nvidia-container-toolkit",
        17: "FastAPI + Uvicorn install", 18: "Evidently AI + Whylogs install",
        19: "statsmodels + ab-test calculator", 20: "Implicit / LightFM install",
        21: "Kubeflow Pipelines SDK / Metaflow", 22: "Ray + Dask install",
        23: "SHAP + Fairlearn + DiCE install",
        24: "End-to-end MLOps stack check (MLflow, DVC, FastAPI, Kubeflow)",
    },
    'ai-automation': {
        1: "Python 3.11 + OpenAI account + n8n", 2: "n8n cloud account or self-hosted install",
        3: "Python + requests + python-dotenv install", 4: "OpenAI + Anthropic SDK install + API keys",
        5: "OpenAI Playground / Anthropic Workbench access", 6: "CrewAI / LangChain agents install",
        7: "BeautifulSoup + Playwright install", 8: "Tesseract + PyPDF2 + Unstructured install",
        9: "Gmail API / Slack API credentials", 10: "gspread + Airtable API + pyairtable",
        11: "LangChain + langchain-openai install", 12: "LangGraph install + agent template",
        13: "n8n workflow editor + Python sub-workflows", 14: "LangChain + ChromaDB / Pinecone install",
        15: "Playwright + Anthropic Computer Use SDK", 16: "Docker + Railway / Render account",
        17: "Sentry + Logfire account", 18: "Stripe + simple landing page",
        19: "Client brief template + Notion workspace",
        20: "Portfolio site + LinkedIn + GitHub README",
    },
    'ai-engineering': {
        1: "Python 3.11 + OpenAI + Anthropic SDK install", 2: "Streamlit / Gradio install",
        3: "promptfoo / Inspect AI eval framework", 4: "Prompt injection test suite (PromptArmor / Lakera)",
        5: "OpenAI + Anthropic SDKs installed with API keys", 6: "Pydantic + JSON schema validation",
        7: "SSE streaming + tiktoken cost calculator", 8: "Tool / function-calling JSON schemas",
        9: "sentence-transformers + OpenAI embeddings", 10: "ChromaDB / Qdrant / Pinecone account",
        11: "LlamaIndex install", 12: "RAGAS evaluation framework install",
        13: "LangGraph / Anthropic Agent SDK", 14: "mem0 / Zep memory store install",
        15: "Anthropic MCP SDK + reference servers", 16: "AutoGen / CrewAI install",
        17: "LangSmith / Braintrust eval account", 18: "Arize Phoenix / Helicone install",
        19: "Anthropic prompt cache + Batch API", 20: "Vercel AI SDK + edge runtime",
        21: "OpenAI fine-tuning / Together AI account", 22: "Vision API + Whisper / TTS SDK install",
        23: "Anthropic safety + content filter API",
        24: "Full AI stack check (SDKs, vector DB, evals, observability, deploy)",
    },
}

# Verification command per tool keyword for Day 0 exercise
PREREQ_VERIFY = {
    'git': ("git --version\nssh -T git@github.com", "Git prints a version; SSH greets you by name."),
    'node': ("node --version\nnpm --version", "Both print versions; Node is v20 or later."),
    'docker': ("docker run hello-world", "Container starts and exits cleanly."),
    'compose': ("docker compose version", "Compose plugin version prints."),
    'trivy': ("trivy --version", "Trivy version string prints."),
    'containerd': ("nerdctl version", "Both client and server versions are listed."),
    'kind': ("kind create cluster --name day0\nkubectl get nodes", "One control-plane node shows Ready."),
    'k3d': ("k3d cluster create day0\nkubectl get nodes", "Cluster shows at least one Ready node."),
    'kubectl': ("kubectl version --client\nkubectl config get-contexts", "Client version prints; at least one context exists."),
    'helm': ("helm version", "Helm prints v3.x.x."),
    'istio': ("istioctl version --remote=false", "istioctl client version prints."),
    'terraform': ("terraform -version\naws sts get-caller-identity", "Terraform and AWS identity both print."),
    'aws': ("aws --version\naws sts get-caller-identity", "AWS CLI version and your account ARN print."),
    'gcloud': ("gcloud --version\ngcloud auth list", "gcloud version and an active account print."),
    'az': ("az --version\naz account show", "az CLI version and your subscription print."),
    'vault': ("vault --version", "Vault CLI version prints."),
    'argocd': ("argocd version --client", "Argo CD client version prints."),
    'prometheus': ("docker compose up -d\ncurl -s localhost:9090/-/healthy", "Prometheus answers `Prometheus Server is Healthy`."),
    'velero': ("velero version --client-only", "Velero CLI version prints."),
    'prowler': ("prowler -v", "Prowler version prints."),
    'github': ("gh --version\ngh auth status", "gh CLI prints version and logged-in user."),
    'nextjs': ("npx create-next-app@latest day0-app --ts --app --tailwind --no-git --use-npm\ncd day0-app && npm run dev",
               "Browser shows the Next.js starter at localhost:3000."),
    'react': ("npm create vite@latest day0-app -- --template react-ts\ncd day0-app && npm install && npm run dev",
              "Vite serves the React starter at localhost:5173."),
    'astro': ("npm create astro@latest day0-astro -- --template minimal\ncd day0-astro && npm install && npm run dev",
              "Astro starter runs at localhost:4321."),
    'tailwind': ("npm install -D tailwindcss\nnpx tailwindcss init", "tailwind.config.js is created."),
    'vite': ("npm create vite@latest", "Vite scaffolds a starter project."),
    'netlify': ("npm install -g netlify-cli\nnetlify --version", "Netlify CLI prints its version."),
    'vercel': ("npm install -g vercel\nvercel --version", "Vercel CLI prints its version."),
    'stripe': ("stripe --version\nstripe login", "Stripe CLI prints version and authenticates."),
    'postgres': ("psql --version", "psql prints its version."),
    'prisma': ("npx prisma --version", "Prisma CLI prints version info."),
    'expo': ("npx create-expo-app day0-app --template blank-typescript\ncd day0-app && npx expo start",
             "Expo Dev Tools open; QR code shows."),
    'eas': ("npm install -g eas-cli\neas --version\neas login", "EAS CLI prints version and you log in."),
    'python': ("python --version\npip --version", "Python is 3.11+ and pip prints a version."),
    'conda': ("conda --version\nconda info", "Conda prints version and env info."),
    'jupyter': ("jupyter --version", "Jupyter Core, Notebook, and Lab versions print."),
    'pytorch': ("python -c \"import torch; print(torch.__version__, torch.cuda.is_available())\"",
                "PyTorch version prints; CUDA flag shows True if you have a GPU."),
    'sklearn': ("python -c \"import sklearn; print(sklearn.__version__)\"", "scikit-learn version prints."),
    'pandas': ("python -c \"import pandas as pd; print(pd.__version__)\"", "pandas version prints."),
    'fastapi': ("pip install fastapi uvicorn\nuvicorn --version", "uvicorn prints version."),
    'mlflow': ("pip install mlflow\nmlflow --version", "MLflow prints version."),
    'dvc': ("pip install dvc\ndvc --version", "DVC prints version."),
    'openai': ("pip install openai\npython -c \"import openai; print(openai.__version__)\"",
               "OpenAI SDK version prints; .env file exists (NOT committed)."),
    'anthropic': ("pip install anthropic\npython -c \"import anthropic; print(anthropic.__version__)\"",
                  "Anthropic SDK version prints."),
    'langchain': ("pip install langchain langchain-openai\npython -c \"import langchain; print(langchain.__version__)\"",
                  "LangChain version prints."),
    'vector': ("pip install chromadb\npython -c \"import chromadb; print(chromadb.__version__)\"",
               "ChromaDB version prints."),
    'mcp': ("pip install mcp\nmcp --version", "MCP CLI prints version."),
    'n8n': ("npx n8n --version", "n8n prints its version."),
    'playwright': ("npm install -D @playwright/test\nnpx playwright install\nnpx playwright --version",
                   "Playwright prints version and installs browsers."),
    'powerbi': ("# Open Power BI Desktop and confirm version under Help -> About",
                "Power BI Desktop is installed and opens."),
    'dax': ("# Open DAX Studio after Power BI is installed",
            "DAX Studio launches and connects to a model."),
    'sql': ("psql --version  # or sqlite3 --version", "Your SQL client prints a version."),
    'dbt': ("pip install dbt-core\ndbt --version", "dbt prints version info."),
    'bigquery': ("gcloud --version\nbq --version\nbq ls", "bq CLI lists at least one dataset."),
    'kali': ("# Boot the Kali VM, then run\nuname -a\nwhoami", "You're root@kali in a working VM."),
    'burp': ("# Launch Burp Community and open Proxy -> Intercept", "Burp opens; browser traffic is intercepted."),
    'zap': ("zap.sh -version", "ZAP prints its version."),
    'metasploit': ("msfconsole --version", "Metasploit framework version prints."),
    'nmap': ("nmap --version", "Nmap version and capabilities print."),
    'wireshark': ("wireshark --version", "Wireshark version prints."),
    'splunk': ("# Open Splunk web UI on localhost:8000 and log in", "Splunk dashboard is visible."),
    'thehive': ("docker compose up -d\ncurl -s localhost:9000/api/status", "TheHive replies with status JSON."),
    'semgrep': ("pip install semgrep\nsemgrep --version", "Semgrep prints version."),
    'snyk': ("npm install -g snyk\nsnyk --version", "Snyk CLI prints version."),
    'sonarqube': ("docker run -d -p 9000:9000 sonarqube:lts", "SonarQube returns status UP on localhost:9000."),
    'cosign': ("cosign version", "cosign prints version."),
    'volatility': ("pip install volatility3\nvol --info | head", "Volatility lists available plugins."),
    'tryhackme': ("# Connect to TryHackMe VPN\nip a | grep tun0", "tun0 interface has an IP address."),
}


def _verify_for_topic(topic: str):
    t = topic.lower()
    priority = [
        'terraform', 'argocd', 'prometheus', 'velero', 'prowler', 'vault',
        'helm', 'kubectl', 'kind', 'k3d', 'istio', 'compose', 'containerd',
        'docker', 'trivy', 'aws', 'gcloud', 'az',
        'nextjs', 'react', 'astro', 'tailwind', 'vite', 'netlify', 'vercel',
        'stripe', 'prisma', 'postgres',
        'expo', 'eas',
        'mcp', 'langchain', 'openai', 'anthropic', 'vector',
        'jupyter', 'pytorch', 'sklearn', 'pandas', 'fastapi', 'mlflow', 'dvc',
        'conda', 'n8n', 'playwright',
        'powerbi', 'dax', 'dbt', 'bigquery', 'sql',
        'kali', 'burp', 'zap', 'metasploit', 'nmap', 'wireshark',
        'splunk', 'thehive', 'semgrep', 'snyk', 'sonarqube', 'cosign',
        'volatility', 'tryhackme',
        'node', 'github', 'git', 'python',
    ]
    for key in priority:
        if key in t:
            return PREREQ_VERIFY[key]
    return ("# Install per official docs, then verify with the tool's --version flag",
            "The tool prints its version without error.")


# ============================================================
# Off-topic content filter — strips lessons/videos/readings that
# don't belong in this track (e.g., SQL leakage in DevOps W1 D0).
# ============================================================
TRACK_OFF_TOPIC_KEYWORDS = {
    'devops-cloud': ['SQL', 'SQLBolt', 'sqlbolt'],
}


def is_off_topic(item: dict, track_slug: str) -> bool:
    suspects = TRACK_OFF_TOPIC_KEYWORDS.get(track_slug, [])
    if not suspects:
        return False
    title = item.get('title', '') or ''
    body = (item.get('body', '') or '')[:300]
    url = item.get('url', '') or ''
    haystack = f"{title} {body} {url}"
    return any(s in haystack for s in suspects)


def clean_items(items: list, track_slug: str) -> list:
    return [it for it in items if not is_off_topic(it, track_slug)]


# ============================================================
# Synthesised content for padding missing day kinds
# ============================================================
def synth_lesson(day_title: str, week_context: str) -> dict:
    body = (
        f"## {day_title}\n\n"
        f"{(week_context or '')[:500]}\n\n"
        "## Key ideas\n"
        "- Understand the concept before reaching for code.\n"
        "- Build the smallest working example first.\n"
        "- Commit early and often so each step is reversible.\n"
    )
    return {"kind": "lesson", "title": day_title, "body": body}


def synth_swipe() -> dict:
    return {
        "kind": "swipe", "title": "Quick check – swipe to answer",
        "cards": [
            {"prompt": "The fastest way to learn a new tool is to read the docs end-to-end before writing any code.",
             "answer": False, "whenRight": "Right — building a tiny example first beats reading every page.",
             "whenWrong": "Docs are a reference, not a tutorial. Code first, read second."},
            {"prompt": "Committing small checkpoints helps you debug regressions and review your own progress.",
             "answer": True, "whenRight": "Exactly — tiny commits are a superpower.",
             "whenWrong": "They really do help; `git revert` is one command away."},
            {"prompt": "Copy-pasting from Stack Overflow without understanding is a sustainable long-term strategy.",
             "answer": False, "whenRight": "Correct — understanding the why is what makes you employable.",
             "whenWrong": "Short-term it works; long-term it stalls you."}
        ]
    }


def synth_exercise(day_title: str) -> dict:
    return {
        "kind": "exercise", "title": "Your turn",
        "body": (
            f"[CODE] Apply today's lesson to a small, working artefact.\n\n"
            f"Concretely: produce one file or one command that demonstrates **{day_title}** end-to-end. "
            "Commit it with a message that names what you did and why.\n\n"
            "PASS:\n"
            "[x] The artefact runs without errors.\n"
            "[x] You can explain in one sentence what it does.\n"
            "[x] It's pushed to GitHub on a `day{N}` branch or commit."
        )
    }


def synth_concept_check_q(week_title: str) -> list:
    return [
        {"q": f"What is the primary benefit of learning {week_title}?",
         "choices": ["It's a buzzword", "It makes your work reproducible, maintainable, or shippable",
                     "It impresses recruiters", "It pays more"],
         "correct": 1, "explain": "Topics on this track are picked because they make real work easier to ship."},
        {"q": "Which of these is the best first step when learning a new tool?",
         "choices": ["Read every page of the docs", "Build the smallest possible working example",
                     "Watch 10 videos", "Ask a friend"],
         "correct": 1, "explain": "A smallest working example beats every other learning strategy."},
        {"q": "When you hit an error, what should you do first?",
         "choices": ["Switch tools", "Read the error message carefully",
                     "Delete and restart", "Ask ChatGPT immediately"],
         "correct": 1, "explain": "The error message usually tells you the answer. Read it twice."},
    ]


# ============================================================
# Day 0 synthesis (used when raw D0 is missing or insufficient)
# ============================================================
def synth_day_zero(topic: str) -> dict:
    verify_cmd, verify_pass = _verify_for_topic(topic)
    video = pick_video_for_day(topic, set())
    return {
        "number": 0, "title": f"Day 0 – Setup: {topic}",
        "summary": f"Install and verify {topic} before diving into the week.",
        "items": [
            {"kind": "lesson", "title": "Set up your tooling",
             "body": (
                 f"## What it is\n{topic} is the foundation for this week's work. "
                 "Without it installed and working, every later day will fail with a cryptic error.\n\n"
                 "## What you'll do today\n"
                 "- Install the required tool(s)\n"
                 "- Authenticate (if the tool talks to a cloud or remote service)\n"
                 "- Run a one-line verification command\n"
                 "- Commit a `day0` checkpoint to GitHub\n\n"
                 "## Why before anything else\n"
                 "The #1 reason mentees stall is a missing CLI, a wrong PATH, or unauthenticated credentials. "
                 "Spend 30 minutes here and save hours later."
             )},
            {"kind": "video", "title": video["title"], "url": video["url"],
             "duration_min": video["duration_min"], "creator": video["creator"],
             "why": "Follow along to install and sanity-check the tool."},
            {"kind": "lesson", "title": "See it in action — the exact steps",
             "body": (
                 f"## Walkthrough\nDo every step now, in your terminal.\n\n"
                 f"```bash\n{verify_cmd}\n```\n\n"
                 f"## What 'working' looks like\n{verify_pass}\n\n"
                 "If anything errors, read the message carefully — 90% of Day 0 failures are PATH or auth "
                 "issues, both of which the error spells out."
             )},
            {"kind": "swipe", "title": "Quick check – swipe to answer",
             "cards": [
                 {"prompt": f"You can run a version command for {topic} and it prints output without error.",
                  "answer": True, "whenRight": "The tool is on your PATH.",
                  "whenWrong": "Re-run the installer; confirm the binary is on PATH."},
                 {"prompt": "You stored credentials (where needed) outside the repo.",
                  "answer": True, "whenRight": "Secrets stay out of git.",
                  "whenWrong": "Use env vars or the cloud's credential helper; never commit keys."},
                 {"prompt": "You committed a `SETUP.md` recording versions you installed.",
                  "answer": True, "whenRight": "Your future self will thank you.",
                  "whenWrong": "Future-you debugs version mismatches; record them now."}
             ]},
            {"kind": "exercise", "title": "Verify your setup",
             "body": (
                 f"[CODE] Run:\n```bash\n{verify_cmd}\n```\n\n"
                 f"PASS:\n[x] {verify_pass}\n[x] No error messages in output\n"
                 "[x] Committed `SETUP.md` with the versions you installed."
             )}
        ]
    }


# ============================================================
# Day padding: take raw items, strip off-topic, pad missing kinds.
# ============================================================
def pad_day(raw_day: dict, week_context: str, day_num: int, week_title: str,
            track_slug: str, used_video_urls: set) -> dict:
    items_in = clean_items(raw_day.get('items', []), track_slug) if raw_day else []
    day_title = (raw_day.get('title') if raw_day else '') or f"Day {day_num} – {week_title}"

    kinds_present = {it.get('kind') for it in items_in}
    items = list(items_in)

    if 'lesson' not in kinds_present:
        items.insert(0, synth_lesson(day_title, week_context))

    if 'video' not in kinds_present:
        video = pick_video_for_day(day_title, used_video_urls)
        first_lesson_idx = next((i for i, it in enumerate(items) if it.get('kind') == 'lesson'), -1)
        insert_at = first_lesson_idx + 1 if first_lesson_idx >= 0 else 0
        items.insert(insert_at, {"kind": "video", "title": video["title"], "url": video["url"],
                                 "duration_min": video["duration_min"], "creator": video["creator"],
                                 "why": video["why"]})
        used_video_urls.add(video['url'])
    else:
        for it in items:
            if it.get('kind') == 'video' and it.get('url'):
                used_video_urls.add(it['url'])

    if 'swipe' not in kinds_present:
        ex_idx = next((i for i, it in enumerate(items) if it.get('kind') == 'exercise'), len(items))
        items.insert(ex_idx, synth_swipe())

    if 'exercise' not in kinds_present:
        items.append(synth_exercise(day_title))

    summary = (raw_day.get('summary') if raw_day else '') or f"Focus: {day_title}"
    return {"number": day_num, "title": day_title, "summary": summary, "items": items}


# ============================================================
# Concept-check extraction
# ============================================================
def parse_mastery_questions(qs: list) -> list:
    out = []
    for q in qs[:3]:
        s = q if isinstance(q, str) else str(q)
        parts = s.split(" A: ")
        if len(parts) == 2:
            question_text = parts[0].replace("Q: ", "").strip()
            answer_text = parts[1].strip()
        else:
            question_text = s[:200]
            answer_text = "See the lesson for explanation."
        out.append({"q": question_text,
                    "choices": ["Option A", "Option B", "Option C", "Option D"],
                    "correct": 0, "explain": answer_text})
    return out


def extract_concept_check(raw_week: dict) -> list:
    cc = raw_week.get('concept_check') or []
    if len(cc) >= 3:
        return cc[:3]
    mq = raw_week.get('mastery_questions') or []
    if len(mq) >= 3:
        return parse_mastery_questions(mq)
    return synth_concept_check_q(raw_week.get('title', 'this week'))


# ============================================================
# Per-week enrichment
# ============================================================
def enrich_week(raw_week: dict, week_num: int, track_slug: str) -> dict:
    title = raw_week.get('title', f'Week {week_num}')
    context = raw_week.get('context', '')
    enriched = {
        "number": week_num, "title": title,
        "phase": raw_week.get('phase', 'Foundations'),
        "commitment_hours": raw_week.get('commitment_hours', '12-18'),
        "context": context, "concept_check": [], "days": []
    }

    raw_days = raw_week.get('days', []) or []
    by_num = {}
    for rd in raw_days:
        n = rd.get('number')
        if n is not None:
            by_num[int(n)] = rd

    used_video_urls = set()

    # Day 0: prefer raw if it has substance after off-topic filter; else synthesise
    raw_d0 = by_num.get(0)
    if raw_d0:
        cleaned = clean_items(raw_d0.get('items', []), track_slug)
        kinds = {it.get('kind') for it in cleaned}
        if 'lesson' in kinds and 'exercise' in kinds:
            d0 = pad_day(raw_d0, context, 0, title, track_slug, used_video_urls)
        else:
            prereq = TRACK_PREREQUISITES.get(track_slug, {}).get(week_num) or title
            d0 = synth_day_zero(prereq[:120])
            for it in d0.get('items', []):
                if it.get('kind') == 'video' and it.get('url'):
                    used_video_urls.add(it['url'])
    else:
        prereq = TRACK_PREREQUISITES.get(track_slug, {}).get(week_num) or title
        d0 = synth_day_zero(prereq[:120])
        for it in d0.get('items', []):
            if it.get('kind') == 'video' and it.get('url'):
                used_video_urls.add(it['url'])

    enriched['days'].append(d0)

    # Days 1..7 — preserve raw, pad missing
    for d_num in range(1, 8):
        raw_day = by_num.get(d_num)
        day = pad_day(raw_day, context, d_num, title, track_slug, used_video_urls)
        enriched['days'].append(day)

    # Day 7 — append a "ship it" exercise as the final synthesis
    last = enriched['days'][-1]
    last['items'].append({
        "kind": "exercise", "title": "Ship it",
        "body": (
            f"Tag your work as v{week_num}.0 and push to GitHub.\n\n"
            "```bash\n"
            f"git add . && git commit -m '{title}'\n"
            f"git tag v{week_num}.0 && git push --tags\n"
            "```"
        )
    })

    enriched['concept_check'] = extract_concept_check(raw_week)
    return enriched


# ============================================================
# Track runner
# ============================================================
def process_track(slug: str):
    input_path = HERE / f"{slug}.json"
    output_path = HERE / f"{slug}-enriched.json"
    if not input_path.exists():
        print(f"  [skip] {input_path.name} not found")
        return
    with open(input_path, encoding='utf-8') as f:
        raw_data = json.load(f)
    raw_weeks = raw_data if isinstance(raw_data, list) else raw_data.get('weeks', [])

    enriched_weeks = []
    for idx, raw_week in enumerate(raw_weeks, start=1):
        enriched_weeks.append(enrich_week(raw_week, idx, slug))

    out = {
        "slug": f"{slug}-enriched",
        "title": f"{slug.replace('-', ' ').title()} (Enriched)",
        "total_weeks": len(enriched_weeks),
        "weeks": enriched_weeks
    }
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"  [ok]   {output_path.name} ({len(enriched_weeks)} weeks)")


ALL_TRACKS = ['devops-cloud', 'full-stack-web', 'mobile-engineering', 'cybersecurity',
              'bi-analytics', 'ml-engineering', 'ai-automation', 'ai-engineering']


def main():
    slugs = [sys.argv[1]] if len(sys.argv) > 1 else ALL_TRACKS
    for slug in slugs:
        print(f"Processing {slug}...")
        process_track(slug)
    print("Done.")


if __name__ == "__main__":
    main()
