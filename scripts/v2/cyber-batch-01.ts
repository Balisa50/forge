import fs from "fs";
import path from "path";

const roadmapPath = path.join(process.cwd(), "data/roadmaps/cybersecurity.json");

function rewriteWeek(slug: string, weekNumber: number, patch: Record<string, unknown>) {
  const filePath = path.join(process.cwd(), "data/roadmaps", `${slug}.json`);
  const roadmap = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const week = roadmap.weeks.find((w: { week?: number; number?: number }) => (w.week ?? w.number) === weekNumber);
  if (!week) throw new Error(`Week ${weekNumber} not found in ${slug}`);
  Object.assign(week, patch);
  fs.writeFileSync(filePath, JSON.stringify(roadmap, null, 2));
  console.log(`✓ ${slug} W${weekNumber} (${week.title}) — fields updated: ${Object.keys(patch).join(", ")}`);
}

// W1: How attackers actually think
rewriteWeek("cybersecurity", 1, {
  context: `Security work starts with adversarial thinking. Before you can defend anything, you need to understand how attackers reason: they are looking for the cheapest path to their objective, not the most clever one. That means misconfigurations, unpatched dependencies, weak credentials, and human error are attacked far more often than exotic zero-days.

This week you build that mental model. You learn the attack lifecycle (recon → exploit → persist → exfil), the difference between vulnerability and exploit, and how OWASP Top 10 maps to real breaches. You also set up your lab environment so you have a safe place to practise everything that follows.

The Juice Shop is a deliberately vulnerable Node.js app maintained by OWASP. Every bug in it maps to a real vulnerability class. Finding bugs there is not cheating — it is the point.`,
  pre_flight: `**Lab setup (do this before anything else):**
\`\`\`bash
# Install Docker if not already
docker run --rm -p 3000:3000 bkimminich/juice-shop
# Open http://localhost:3000 — this is your target all week
\`\`\`

**Tools to install:**
- Burp Suite Community (free): https://portswigger.net/burp/communitydownload
- Firefox + FoxyProxy extension (for routing through Burp)
- OWASP ZAP as a secondary scanner

**Read first:**
- OWASP Top 10 (2021): https://owasp.org/Top10/
- The Cyber Kill Chain: https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html

**Understand the vocabulary:**
- Vulnerability: a weakness in a system
- Exploit: code or technique that takes advantage of a vulnerability
- Attack surface: every point where an attacker can interact with your system
- Threat model: who wants to attack you, why, and how`,
  mastery_questions: [
    "Walk me through the 7 phases of the Cyber Kill Chain and give a real example of what happens at each phase.",
    "What is the difference between SQL injection and XSS? Which OWASP Top 10 category does each fall under?",
    "You find a login page. List 5 things you would test before touching any automated tools.",
    "Why do most real-world breaches involve misconfigurations rather than zero-days? What does that mean for a defender?",
    "Explain the difference between a CVE, a CVSS score, and an exploit. Can a CVE with CVSS 9.8 be unexploitable? When?",
  ],
  common_mistakes: [
    "Skipping the recon phase — attackers spend 80% of their time on recon. Jump to exploitation too fast and you miss the real attack surface.",
    "Confusing scanning with hacking — running nmap or nikto at a target is not 'hacking'. It is information gathering. Exploitation is a separate step.",
    "Testing on systems you don't own — always work in a lab (Juice Shop, TryHackMe, HackTheBox). Never test against real sites without written permission.",
    "Treating OWASP Top 10 as a checklist you tick once — it is a risk classification framework. The same app can have multiple A03 injection variants.",
    "Assuming encrypted means secure — HTTPS protects data in transit. It does not prevent XSS, CSRF, SQLi, or broken access control.",
  ],
  debug_help: `**Can't load Juice Shop?**
\`\`\`bash
# Check container is running
docker ps
# View logs
docker logs <container_id>
# Port conflict — try different port
docker run --rm -p 3001:3000 bkimminich/juice-shop
\`\`\`

**Burp Suite not intercepting traffic?**
- Check FoxyProxy is set to 127.0.0.1:8080
- In Burp: Proxy > Options > confirm listener is on 8080
- For HTTPS sites: install Burp CA cert in Firefox (Proxy > Options > Import/Export CA Certificate)

**Found a bug but don't know if it's real?**
- Check the Juice Shop challenge list: http://localhost:3000/#/score-board
- A green challenge = you triggered it correctly
- Read the hints — they explain the vulnerability class`,
  ai_assist: `**Prompts that work:**
- "Explain SQL injection to me like I have never seen it before, then show me what a vulnerable Node.js query looks like and how to fix it."
- "I found this error message in a web app: [paste error]. What does it tell an attacker about the backend?"
- "What is the OWASP Top 10 A01 Broken Access Control? Give me 3 specific examples of how it manifests in a real app."
- "Help me understand the difference between stored XSS, reflected XSS, and DOM-based XSS. Which is most dangerous and why?"

**What NOT to ask:**
- "Write me an exploit for [real target]" — this is illegal. AI will refuse and you should not be doing it.
- "Is [real website] vulnerable?" — only test what you own or have permission to test.`,
  stretch: [
    "Complete the first 10 challenges on the Juice Shop score board and document each vulnerability class found.",
    "Read the Google Project Zero blog — pick one disclosed vulnerability and write a 1-page explanation of how it worked.",
    "Set up a personal threat model for your own home network: what assets do you have, who might attack them, what are your biggest risks?",
    "Watch LiveOverflow's 'How to get into CTF/Security Research' and outline your learning path for the next 6 months.",
  ],
});

// W2: Vuln Reports v0.2 — 5 more Juice Shop bugs
rewriteWeek("cybersecurity", 2, {
  context: `Last week you found your first bugs. This week you go deeper into Juice Shop and find 5 more, but more importantly you learn how to document them. A security finding you cannot communicate clearly is worthless. Bug bounty hunters, pentesters, and security engineers all get paid to write clear, reproducible vulnerability reports.

A good vulnerability report has: title, severity (CVSS score), description, reproduction steps, impact, and remediation. Every step must be exact — if another person cannot reproduce it from your steps alone, the report fails.

You also learn CVSS scoring this week. CVSS v3.1 lets you score a vulnerability's severity from 0 to 10 based on attack vector, complexity, privileges required, and impact. You should be able to score any bug you find from first principles.`,
  pre_flight: `**Juice Shop must be running:**
\`\`\`bash
docker run --rm -p 3000:3000 bkimminich/juice-shop
\`\`\`

**CVSS Calculator:**
https://www.first.org/cvss/calculator/3.1

**Vulnerability report template (save this):**
\`\`\`markdown
# Vulnerability Report

**Title:** [Clear, specific title]
**Severity:** Critical / High / Medium / Low / Informational
**CVSS Score:** X.X (vector string)
**Date Found:** YYYY-MM-DD
**Tester:** Your name

## Description
[What is the vulnerability? One paragraph.]

## Reproduction Steps
1. Navigate to...
2. Enter...
3. Observe...

## Impact
[What can an attacker do with this?]

## Evidence
[Screenshot or HTTP request/response]

## Remediation
[How to fix it — be specific]
\`\`\`

**Target 5 bugs this week. Prioritise these Juice Shop challenges:**
- Score Board (A01), DOM XSS (A03), Password Strength (A07), Admin Registration (A01), Zero Stars (A04)`,
  mastery_questions: [
    "Write a CVSS v3.1 vector string for a reflected XSS vulnerability that requires user interaction, is network-based, and affects confidentiality and integrity but not availability.",
    "What makes a vulnerability report 'reproducible'? What happens to a bug bounty report that is not reproducible?",
    "You found a path traversal bug that lets you read /etc/passwd on a web server. What is the impact? What is the CVSS score?",
    "What is the difference between Severity and Priority in vulnerability management? Can a Low severity bug have High priority?",
    "Explain Broken Access Control (OWASP A01). Give 3 specific examples that are different from each other.",
  ],
  common_mistakes: [
    "Writing impact as 'attacker can do bad things' — impact must be specific: 'attacker can read all user PII including email and hashed passwords for all 50,000 accounts'.",
    "Scoring CVSS without reading the specification — every field has a definition. 'Attack Complexity: Low' means the attack requires no special conditions, not that it is easy.",
    "Reporting duplicate bugs with different names — SQL injection on /login and SQL injection on /search are two findings, but both get their own report, not one merged report.",
    "Skipping remediation — 'fix the XSS' is not remediation. 'Encode all user-supplied output using DOMPurify before inserting into innerHTML' is.",
    "Not including HTTP request/response evidence — screenshots of the browser are not enough. Include the raw Burp request that reproduces the bug.",
  ],
  debug_help: `**CVSS scoring feels confusing?**
Use the NVD calculator and hover over each field — it shows examples. Key principle: score the vulnerability as-is, not with mitigating controls in place.

**Juice Shop challenge not triggering?**
\`\`\`bash
# Check the hints on score board
# Use Burp to see exactly what HTTP request is sent
# Some challenges require specific payloads — check the solutions repo ONLY after genuine attempt:
# https://github.com/juice-shop/juice-shop/tree/master/routes (source code)
\`\`\`

**Report formatting:**
- Use Markdown — most bug bounty platforms render it
- Paste raw HTTP requests in code blocks
- Redact any real PII from screenshots (blur or black bar)`,
  ai_assist: `**Prompts that work:**
- "Review this vulnerability report and tell me what is missing, unclear, or incorrect: [paste your report]"
- "Help me calculate the CVSS v3.1 score for this vulnerability: [describe the bug]. Walk me through each vector component."
- "What is the remediation for stored XSS in a Node.js/Express app that renders user content in EJS templates?"
- "I found this HTTP response from a web app: [paste response]. What vulnerabilities does this response header configuration suggest?"`,
  stretch: [
    "Find and report 5 additional Juice Shop challenges beyond the required ones — aim for the harder ones (3+ stars).",
    "Read a real-world bug bounty report from HackerOne's disclosed reports list — analyse the structure and what makes it good.",
    "Set up a Notion or Obsidian vault for tracking your vulnerability findings — you will use this throughout the course.",
    "Practice scoring 5 real CVEs from NVD using the CVSS calculator before looking at the official score — compare your score to the official one.",
  ],
});

// W3: Vuln Reports v0.3 — TryHackMe first room
rewriteWeek("cybersecurity", 3, {
  context: `TryHackMe is a guided CTF platform where each room walks you through a real vulnerability or technique in a controlled environment. This week you complete your first room and start building the habit of learning through structured hacking challenges.

The difference between Juice Shop and TryHackMe: Juice Shop is an app you attack, THM is a guided lesson where you follow instructions, answer questions, and learn the underlying technique. Both are essential — Juice Shop builds creative thinking, THM builds systematic knowledge.

This week you also start using a proper methodology. Every pentest has phases: scope, recon, scanning, exploitation, post-exploitation, reporting. Even in a lab setting, you follow the same phases — it builds muscle memory for real engagements.`,
  pre_flight: `**Create a TryHackMe account:** https://tryhackme.com (free tier is fine)

**Complete these rooms in order:**
1. "Pre-Security" path — at minimum: "How The Web Works", "Linux Fundamentals Part 1"
2. "OWASP Top 10 - 2021" room (walks through each category with hands-on tasks)
3. "Introduction to Web Hacking" room

**Connect to TryHackMe VPN:**
\`\`\`bash
# Download your .ovpn config from THM dashboard
sudo openvpn --config your-username.ovpn
# In another terminal, ping the room's target IP to confirm connection
ping <target-ip>
\`\`\`

**Install AttackBox alternative (local Kali):**
\`\`\`bash
# Pull Kali Linux Docker image (2GB+, takes time)
docker pull kalilinux/kali-rolling
docker run -it kalilinux/kali-rolling /bin/bash
# Inside container, install tools
apt update && apt install -y nmap gobuster curl wget
\`\`\``,
  mastery_questions: [
    "What is the difference between active recon and passive recon? Give 2 tools for each.",
    "Walk me through a basic web application pentest methodology from scope definition to report delivery — 6 phases minimum.",
    "What does gobuster do and when would you use it over nikto?",
    "You are given a target IP with no other information. What are the first 3 commands you run and why?",
    "Explain what a reverse shell is. Why does it work even when the target has a firewall blocking inbound connections?",
  ],
  common_mistakes: [
    "Not taking notes during a THM room — you will forget the technique. Write up every room in your vault as you complete it.",
    "Using THM answers from YouTube walkthroughs on the first attempt — you rob yourself of the learning. Struggle first, then check.",
    "Running nmap with default settings on a real target — nmap -sV -sC sends OS detection and script probes that are loud and intrusive.",
    "Not understanding why a command works — 'gobuster dir -u http://target -w wordlist.txt' has 4 parts, you should know what each does.",
    "Skipping Linux fundamentals — most security tools run on Linux. File permissions, pipes, grep, and curl are prerequisites.",
  ],
  debug_help: `**VPN not connecting?**
\`\`\`bash
# Check OpenVPN log for errors
sudo openvpn --config your-username.ovpn --verb 4
# Common fix: try TCP instead of UDP — download TCP config from THM
# If on Windows: use THM's browser-based AttackBox instead
\`\`\`

**Can't reach the target machine?**
\`\`\`bash
# Confirm VPN interface is up
ip addr show tun0
# Ping the target
ping -c 3 <target-ip>
# If no response: restart the target machine from THM dashboard
\`\`\`

**nmap scan takes forever?**
\`\`\`bash
# Fast scan first
nmap -T4 -F <target-ip>
# Then specific ports
nmap -p 80,443,8080,22 -sV <target-ip>
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Explain what this nmap output means: [paste output]. What services are running and what should I investigate first?"
- "What is a directory traversal attack? Show me a curl command that tests for it on a web server."
- "I ran gobuster and found /admin and /backup. What would you do next to investigate each one?"
- "Explain the difference between a bind shell and a reverse shell. Which is more commonly used in pentesting and why?"`,
  stretch: [
    "Complete the full 'OWASP Top 10 - 2021' room on TryHackMe and write a 1-page summary of what you learned.",
    "Join TryHackMe's Discord and find a study group or accountability partner — the community is a major asset.",
    "Write a nmap cheat sheet covering: host discovery, port scanning, service detection, OS detection, and NSE scripts.",
    "Set up a personal Kali Linux VM using VirtualBox or VMware — learn the tool properly rather than relying on cloud VMs.",
  ],
});

// W4: Vuln Reports v0.4 — Burp Suite + intercepting requests
rewriteWeek("cybersecurity", 4, {
  context: `Burp Suite is the primary tool for web application security testing. Every professional pentester uses it daily. This week you learn to use it like a professional — not just as a traffic viewer, but as an active testing platform.

The core Burp workflow: intercept request → modify it → send to Repeater → iterate until you find a vulnerability. The Repeater tab is where most web hacking actually happens. You send a request, tweak a parameter, observe the response, adjust, repeat.

This week you also learn HTTP deeply. Not just GET vs POST — you need to understand headers (Authorization, Cookie, Content-Type, CORS headers), status codes (200/301/302/401/403/404/500), and how the request/response cycle works at the byte level. Burp shows you everything; you need to know what you're looking at.`,
  pre_flight: `**Burp Suite setup (if not done from W1):**
1. Download Community: https://portswigger.net/burp/communitydownload
2. Start Burp → Proxy → Intercept is On
3. Firefox → FoxyProxy → add proxy: 127.0.0.1:8080
4. Navigate to http://burpsuite in Firefox → download CA cert → import into Firefox cert store

**Juice Shop targets for this week:**
- Login as admin (SQL injection on login form)
- Basket manipulation (IDOR via API)
- Forged feedback (parameter tampering)
- View another user's basket (IDOR)

**Learn these Burp tabs:**
- Proxy → Intercept: see and modify live requests
- Proxy → HTTP History: every request logged
- Repeater: replay and modify requests
- Decoder: encode/decode base64, URL, HTML
- Intruder: automated payload fuzzing (rate limited in Community)`,
  mastery_questions: [
    "What is an IDOR vulnerability? Show me a specific HTTP request that demonstrates IDOR.",
    "Walk me through how you would test a login form for SQL injection using Burp Repeater — step by step.",
    "What does the Cookie header contain? How would you test if a session token is predictable?",
    "Explain CORS. What is the difference between a misconfigured CORS policy and no CORS policy?",
    "You intercept a request and see a JWT in the Authorization header. What 3 things do you check first?",
  ],
  common_mistakes: [
    "Only using the browser to test — the browser hides things Burp shows you. Always verify in Burp, not just the UI.",
    "Forgetting to turn off Intercept — Burp intercept blocks requests. After capturing what you need, turn it off or forward requests.",
    "Not understanding base64 — JSON Web Tokens are base64-encoded. Use Burp Decoder or jwt.io to decode them immediately.",
    "Missing IDOR because you only test the current user's resources — always try incrementing IDs (1, 2, 3) and see if you can access other users' data.",
    "Sending Intruder attacks in Community edition expecting speed — Community throttles Intruder. Use Repeater for manual testing; buy Pro or use ffuf for fuzzing.",
  ],
  debug_help: `**Burp not showing HTTPS traffic?**
\`\`\`bash
# The CA cert must be installed in the browser
# Firefox: Preferences → Privacy & Security → View Certificates → Import
# Import PortSwigger CA cert you downloaded from http://burpsuite
# Test: visit https://google.com through Burp — you should see the request in HTTP History
\`\`\`

**JWT decode in terminal:**
\`\`\`bash
# Split by dots, base64 decode header and payload
echo "eyJhbGc..." | base64 -d 2>/dev/null
# Or use jwt.io in browser
\`\`\`

**Repeater shows no response?**
- Check Juice Shop is still running: docker ps
- Check target is correct URL including port (http://localhost:3000)
- Look for timeout — Juice Shop sometimes needs a restart after heavy testing`,
  ai_assist: `**Prompts that work:**
- "I intercepted this HTTP request in Burp: [paste request]. What parameters should I test for injection?"
- "Explain JWT vulnerabilities: what is the 'none' algorithm attack and the weak secret attack?"
- "What is the difference between a 401 and a 403 HTTP response? What does each tell me as a pentester?"
- "How do I test for IDOR in a REST API? Give me a systematic approach."
- "I see a Set-Cookie header: 'session=abc123; HttpOnly; Secure; SameSite=Lax'. What does each attribute do from a security perspective?"`,
  stretch: [
    "Complete PortSwigger Web Security Academy's 'SQL Injection' learning path (free, browser-based labs).",
    "Find and exploit the JWT vulnerability in Juice Shop — document the full Burp Repeater workflow.",
    "Write a 1-page explanation of how OAuth 2.0 works, including where it can go wrong from a security perspective.",
    "Set up a local vulnerable API using DVWS (Damn Vulnerable Web Services) and find 3 API-specific vulnerabilities.",
  ],
});

// W5: Burp Suite + ZAP — Your Web Testing Workbench
rewriteWeek("cybersecurity", 5, {
  context: `This week you advance from basic Burp usage to a full web testing workflow. You learn Burp's Scanner (Community has a passive scanner; Pro has active), OWASP ZAP as an open-source alternative, and how to combine automated scanning with manual testing.

Automated scanners find the obvious things fast. Manual testing finds the business logic bugs that scanners miss. A professional web pentest uses both: run the scanner to clear the easy wins, then spend 80% of your time on manual testing of the application's specific functionality.

You also learn OWASP's Web Security Testing Guide (WSTG) this week. It is the definitive manual for web application penetration testing — 12 categories, 91 test cases. You will reference it throughout your career.`,
  pre_flight: `**Install OWASP ZAP:**
\`\`\`bash
# macOS
brew install --cask owasp-zap
# Or download from: https://www.zaproxy.org/download/
\`\`\`

**Download the OWASP WSTG:**
https://owasp.org/www-project-web-security-testing-guide/

**Set up Juice Shop for this week:**
\`\`\`bash
docker run --rm -p 3000:3000 bkimminich/juice-shop
\`\`\`

**ZAP quick start:**
1. Open ZAP → set Firefox to proxy through ZAP (port 8090 by default)
2. Browse Juice Shop normally
3. ZAP → Active Scan → select the target site → Start Scan
4. Review Alerts tab — these are ZAP's findings

**Burp passive scan:**
Burp Community passively scans traffic as you browse — check the Dashboard tab for issues flagged automatically.`,
  mastery_questions: [
    "What is the difference between passive scanning and active scanning? Which is safe to run against a production system?",
    "Name 5 vulnerability categories in the OWASP WSTG and describe what you test in each.",
    "You have 4 hours to pentest a web application. How do you allocate your time between automated scanning and manual testing?",
    "A scanner reports a 'possible SQL injection' at /search?q=. How do you confirm it is a true positive versus a false positive?",
    "What is Burp Intruder and what are the 4 attack types? When would you use Cluster Bomb versus Pitchfork?",
  ],
  common_mistakes: [
    "Trusting scanner output without validation — scanners produce false positives. Every finding must be manually confirmed before reporting.",
    "Running active scans against targets you don't own — ZAP Active Scan sends attack payloads. This is illegal on systems without authorisation.",
    "Ignoring informational findings — 'missing security headers' may be informational severity but is fast to fix and often required for compliance.",
    "Not reading scanner documentation — ZAP and Burp both have extensive docs explaining what each check does. Know your tools.",
    "Using Community Burp for large engagements — Intruder throttling and no active scanner make Community inadequate for real work. Budget for Pro or use open-source alternatives.",
  ],
  debug_help: `**ZAP not finding anything?**
\`\`\`bash
# Make sure you've browsed the site through ZAP proxy first
# ZAP needs to see the site before it can scan it
# Check: Sites tab in ZAP should show http://localhost:3000 with child nodes
\`\`\`

**ZAP active scan crashes Juice Shop?**
\`\`\`bash
# Restart Juice Shop
docker restart <container_id>
# ZAP active scans can be aggressive — use "Low" attack strength first
\`\`\`

**Burp and ZAP conflict on same port?**
- Run them on different ports: Burp on 8080, ZAP on 8090
- Switch FoxyProxy profile to switch between them`,
  ai_assist: `**Prompts that work:**
- "I ran ZAP against my app and got these alerts: [paste alert list]. Which should I investigate first and why?"
- "Explain Burp Intruder's Cluster Bomb attack type. Give me an example of when I would use it."
- "What security headers should every web application return? List them with the correct values."
- "I see a scanner reported 'X-Content-Type-Options header missing'. How serious is this and how do I fix it in Express.js?"`,
  stretch: [
    "Complete 5 PortSwigger Web Security Academy labs from different vulnerability categories.",
    "Configure Burp's upstream proxy to chain with ZAP — both tools see the same traffic simultaneously.",
    "Write a custom ZAP scan policy that checks only for the OWASP Top 10 and document which ZAP rules map to which OWASP category.",
    "Set up ffuf for directory fuzzing and compare its speed and output to gobuster on the same target.",
  ],
});

console.log("\nAll done — cybersecurity W1-W5 applied.");
