import fs from "fs";
import path from "path";

function rewriteWeek(slug: string, weekNumber: number, patch: Record<string, unknown>) {
  const filePath = path.join(process.cwd(), "data/roadmaps", `${slug}.json`);
  const roadmap = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const week = roadmap.weeks.find((w: { week?: number; number?: number }) => (w.week ?? w.number) === weekNumber);
  if (!week) throw new Error(`Week ${weekNumber} not found in ${slug}`);
  Object.assign(week, patch);
  fs.writeFileSync(filePath, JSON.stringify(roadmap, null, 2));
  console.log(`✓ ${slug} W${weekNumber} (${week.title}) — fields updated: ${Object.keys(patch).join(", ")}`);
}

// W21: Forensics and Malware Analysis Basics
rewriteWeek("cybersecurity", 21, {
  context: `Digital forensics is the practice of recovering and analysing evidence from digital systems. Malware analysis is the reverse-engineering of malicious software to understand how it works. Together, they form the investigative backbone of incident response — you need both to answer "what happened, how, and what did the attacker do?"

Static analysis: examine a file without running it (strings, file type, hash, PE headers, disassembly). Dynamic analysis: run the malware in an isolated sandbox and observe what it does (network connections, file writes, registry changes, process creation). You start with static analysis for safety — you never run unknown malware on your own machine.

This week you learn basic forensics workflows, how to use ANY.RUN or Cuckoo for sandboxed malware analysis, and how to use Volatility for memory forensics. You also learn the basics of the Windows PE format — understanding the format helps you detect packed or obfuscated malware.`,
  pre_flight: `**Static analysis tools:**
\`\`\`bash
# strings — extract readable strings from a binary
strings suspicious.exe | grep -E "(http|cmd|powershell|reg)"

# file — identify file type regardless of extension
file suspicious.exe

# xxd — hex dump
xxd suspicious.exe | head -20

# sha256sum — compute hash for IOC lookup
sha256sum suspicious.exe
\`\`\`

**Dynamic analysis (sandboxes — DO NOT run malware locally):**
- ANY.RUN: https://app.any.run/ (free tier, interactive sandbox)
- Hybrid Analysis: https://www.hybrid-analysis.com/ (free)
- Joe Sandbox Cloud Basic: https://www.joesandbox.com/

**Volatility 3 (memory forensics):**
\`\`\`bash
pip install volatility3
# Download a test memory image
# https://github.com/volatilityfoundation/volatility/wiki/Memory-Samples

# List processes
vol -f memory.dmp windows.pslist
# Network connections
vol -f memory.dmp windows.netstat
# Command line arguments
vol -f memory.dmp windows.cmdline
# Dump a suspicious process
vol -f memory.dmp windows.dumpfiles --pid 1234
\`\`\``,
  mastery_questions: [
    "What is the difference between static and dynamic malware analysis? Why do you start with static?",
    "You receive a suspicious .docx file from a user. Walk me through your triage process — what do you check first without opening it?",
    "What is a PE (Portable Executable) file? What sections does it contain and what does each do?",
    "What artefacts does a running process leave in memory that Volatility can recover?",
    "What is packed malware? What tool can detect if a Windows executable is packed?",
  ],
  common_mistakes: [
    "Running unknown malware on your personal machine — always use an isolated VM or an online sandbox. Assume any suspicious file is live malware.",
    "Trusting sandbox results without question — sophisticated malware detects sandbox environments and behaves differently. Static analysis is always needed too.",
    "Not computing hashes before analysis — always hash the file first. The hash is your IOC and proves the file has not changed during your analysis.",
    "Not preserving the original file — analysis can modify files. Work on a copy and preserve the original with documented chain of custody.",
    "Missing the strings output — malware often contains readable strings: C2 URLs, mutex names, hardcoded paths. Strings is the first and fastest analysis step.",
  ],
  debug_help: `**Volatility can't identify the OS profile?**
\`\`\`bash
# Volatility 3 auto-detects — if it fails, check the image is a full memory dump
# For Windows: the memory image must include the kernel
vol -f memory.dmp windows.info

# For Linux memory images
vol -f memory.dmp linux.pslist
\`\`\`

**strings output too noisy?**
\`\`\`bash
# Filter for URLs
strings suspicious.exe | grep -E "https?://"
# Filter for IPs
strings suspicious.exe | grep -E "\b([0-9]{1,3}\.){3}[0-9]{1,3}\b"
# Filter for registry keys
strings suspicious.exe | grep -i "HKEY"
\`\`\`

**ANY.RUN free tier limitations?**
- Files up to 100MB
- 60 seconds execution time on free tier
- Use Hybrid Analysis for longer analysis`,
  ai_assist: `**Prompts that work:**
- "Explain the Windows PE format. What is the difference between the .text, .data, and .rsrc sections?"
- "I ran strings on a suspicious executable and found: [paste output]. What do these strings suggest about the malware's behaviour?"
- "What is process hollowing? How does an EDR detect it and what Volatility plugin would show evidence of it?"
- "Walk me through the analysis of a suspicious PowerShell script — what do I look for?"`,
  stretch: [
    "Submit a known malware sample hash to VirusTotal and read the full analysis report — understand what each AV engine found.",
    "Analyse a DFIR challenge memory dump from CyberDefenders.org using Volatility — answer the scenario questions.",
    "Read 'The Art of Memory Forensics' Chapter 1 (free sample) — understand the foundations of memory forensics.",
    "Set up Cuckoo Sandbox locally (complex but educational) or use ANY.RUN to analyse a safe malware sample from theZoo repository.",
  ],
});

// W22: Tabletop Exercises and Red Teaming
rewriteWeek("cybersecurity", 22, {
  context: `A tabletop exercise is a structured discussion where a team works through a simulated security incident. No systems are touched — it is a meeting. The value is in discovering gaps in your response process, communication chains, and decision-making before a real incident happens.

Red teaming is an adversarial simulation where a skilled team tries to compromise an organisation's defences using real attack techniques, with full scope and duration (days to weeks, not hours). Red team engagements are distinct from pentests: pentests find as many vulnerabilities as possible; red teams test whether defenders can detect and respond to a realistic attack.

This week you learn to run a basic tabletop exercise, understand the structure of a red team engagement, and learn about adversary simulation frameworks (Atomic Red Team, CALDERA) that let you safely simulate specific ATT&CK techniques in your own lab.`,
  pre_flight: `**Tabletop exercise structure:**
\`\`\`markdown
# Tabletop Exercise — [Scenario Name]

## Participants
- Incident Commander: [name]
- Security Lead: [name]
- Engineering: [name]
- Legal/Comms: [name]

## Scenario
[3-4 sentence description of the incident]

## Injects (delivered during exercise)
- T+0: Initial detection — [what was detected and how]
- T+30min: New information — [additional detail that changes the picture]
- T+60min: Escalation — [complication that increases severity]

## Discussion Questions
1. Who is the incident commander?
2. What is our immediate containment action?
3. Do we need to notify affected users? When?
4. What is our external communication strategy?
5. How do we preserve forensic evidence?
\`\`\`

**Atomic Red Team — ATT&CK technique simulation:**
\`\`\`bash
# Install Invoke-AtomicRedTeam (PowerShell)
Install-Module -Name invoke-atomicredteam
Import-Module invoke-atomicredteam
# Run a specific atomic test (T1059.001 = PowerShell)
Invoke-AtomicTest T1059.001
\`\`\`

**MITRE CALDERA (free, open-source adversary simulation):**
\`\`\`bash
git clone https://github.com/mitre/caldera.git --recursive
pip3 install -r requirements.txt
python3 server.py --insecure
# Access at http://localhost:8888
\`\`\``,
  mastery_questions: [
    "What is the difference between a tabletop exercise, a purple team exercise, and a red team engagement?",
    "You are running a tabletop for a ransomware scenario. What are the 5 most important discussion questions to ask?",
    "What is Atomic Red Team? How does running an atomic test help you evaluate your detections?",
    "Explain the difference between a red team's objective and a pentester's objective.",
    "What is CALDERA and how does it help a defender without a dedicated red team?",
  ],
  common_mistakes: [
    "Running tabletops without a facilitator — someone must drive the scenario, inject new information, and keep the discussion on track.",
    "Not including legal/comms in tabletops — breach notification, regulatory reporting, and PR are decisions that need the right people in the room.",
    "Treating red team findings as a task list — a red team finding means your detection failed. Fix the detection gap, not just the vulnerability.",
    "Using Atomic Red Team without first baselining your detections — run an atomic test, see if your SIEM alerts, iterate. Without the detection gap analysis, you are just making noise.",
    "Not running post-exercise action items — a tabletop that produces no follow-up tasks was a social exercise, not a security exercise.",
  ],
  debug_help: `**Invoke-AtomicRedTeam install fails?**
\`\`\`powershell
# Set execution policy for current user
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
# Install from PSGallery
Install-Module -Name invoke-atomicredteam -Scope CurrentUser -Force
\`\`\`

**CALDERA agent not connecting?**
\`\`\`bash
# Check server is running
curl http://localhost:8888/api/v2/agents
# Deploy a sandcat agent (built-in agent)
# Go to CALDERA UI → Agents → Deploy Agent → select your OS
\`\`\`

**Tabletop feels unfocused?**
- Timebox each inject to 15-20 minutes of discussion
- The facilitator stops open-ended debates with: "Note that as an action item and move on"
- End with a clear list of follow-up tasks, owners, and dates`,
  ai_assist: `**Prompts that work:**
- "Write a tabletop exercise scenario for a phishing attack that escalates to ransomware — include 3 injects at T+0, T+30, T+60."
- "What MITRE ATT&CK techniques would a financially motivated ransomware group use? Map them to the kill chain."
- "How do I measure the effectiveness of a red team engagement? What metrics matter?"
- "What is the difference between a red team, blue team, and purple team? What is a purple team exercise?"`,
  stretch: [
    "Run a tabletop exercise with 2-3 friends or colleagues using a scenario you write — debrief and document action items.",
    "Run 5 Atomic Red Team tests in a Windows VM and check which ones generate alerts in your SIEM or EDR.",
    "Read the Mandiant M-Trends 2024 report — what are the most common initial access vectors and dwell times?",
    "Set up CALDERA in a local lab and run a complete adversary simulation from initial access to exfiltration.",
  ],
});

// W23: Building a Career in Security — Specialisation + Portfolio
rewriteWeek("cybersecurity", 23, {
  context: `Security is a broad field and no one masters all of it. The people who get hired and promoted are specialists with a visible track record. This week you decide your specialisation, build your public portfolio, and learn how to navigate the security job market.

The main specialisation tracks: offensive security (pentesting, red team, bug bounty), defensive security (SOC analyst, detection engineer, incident response), cloud security, AppSec, GRC (governance, risk, compliance), and malware/threat intelligence. Each has different certifications, job titles, and career paths.

Your portfolio is your proof of work. A GitHub with CTF writeups, a blog with vulnerability research, and a list of CVEs or bug bounty findings is more valuable than any certification. Certifications validate that you have studied; portfolio proves you can do.`,
  pre_flight: `**Certifications by career path:**

Offensive:
- eJPT (free, beginner): https://ine.com/learning/certifications/internal/elearnsecurity-junior-penetration-tester
- PNPT (intermediate, practical): https://certifications.tcm-sec.com/pnpt/
- OSCP (advanced, industry standard): https://www.offensive-security.com/pwk-oscp/

Defensive / SOC:
- CompTIA Security+ (foundational)
- Blue Team Labs Online (free labs): https://blueteamlabs.online/
- SC-200 (Microsoft Security Operations Analyst)

Cloud Security:
- AWS Security Specialty
- GCP Professional Cloud Security Engineer

AppSec:
- GWEB (GIAC Web Application Penetration Tester)
- Burp Suite Certified Practitioner (PortSwigger, practical)

**Portfolio elements:**
1. GitHub: CTF writeups, tool scripts, detection rules
2. Blog: vulnerability research, technique explanations, lab walkthroughs
3. HackerOne/Bugcrowd: public bug bounty submissions
4. LinkedIn: skills, projects, publications, certifications
5. CVEs: even one CVE you discovered and disclosed is career-defining`,
  mastery_questions: [
    "What specialisation in security most aligns with your strengths and interests? What is the 12-month path to your first job in that specialisation?",
    "What is the difference between OSCP and CEH? Which does an employer value more and why?",
    "How do you responsibly disclose a vulnerability you find in a real company's system? Walk me through the process.",
    "What makes a good CTF writeup? What should you include that most people leave out?",
    "How do you negotiate salary as a security professional? What data sources tell you the market rate?",
  ],
  common_mistakes: [
    "Getting certifications before building practical skills — certs are signals, not skills. Build the skills first, then certify to signal them.",
    "Doing CTFs without writing up your solutions — nobody can see that you solved it. Write it up, publish it, share it. This is your portfolio.",
    "Applying for senior roles before doing bug bounty or CTFs — companies hiring for security roles want to see proof of work. A junior with 10 public writeups beats a senior with a clean LinkedIn.",
    "Not networking in the security community — Twitter/X, Discord (TryHackMe, HackTheBox, NahamSec), DEF CON, BSides conferences. The industry is small and interconnected.",
    "Underselling yourself because security feels like a 'special' field — you have spent 23 weeks building real skills. Own them. Apply.",
  ],
  debug_help: `**Not sure which specialisation to choose?**
Answer these:
1. Do you prefer building/defending or breaking things?
2. Do you prefer code (AppSec, detection engineering) or operations (SOC, IR)?
3. Do you want to talk to customers (GRC, consulting) or work alone (malware analysis)?
Your answers point to a path.

**Blog platform:**
- Ghost (free tier): professional, security community uses it
- GitHub Pages + Hugo/Jekyll: free, shows technical ability
- Medium: largest audience but no custom domain on free tier

**First bug bounty program:**
- HackerOne: filter by "Beginner Friendly"
- Bugcrowd: similar filtering
- Start with a program that has a large scope — more surface area = more bugs`,
  ai_assist: `**Prompts that work:**
- "I want to specialise in [offensive/defensive/cloud/AppSec] security. What is the realistic career path from zero to first job in 12 months?"
- "Review this CTF writeup draft and tell me what I should add to make it educational and portfolio-worthy: [paste draft]"
- "What are the 5 most valued security certifications in 2025 and what role does each target?"
- "How do I responsibly disclose a vulnerability I found in a company's public bug bounty program?"`,
  stretch: [
    "Write and publish a blog post about any technique or tool you learned in this course — technical, specific, your own words.",
    "Complete a HackTheBox or TryHackMe machine and publish a writeup on your blog.",
    "Attend a local BSides conference or watch a DEF CON talk on your specialisation area.",
    "Reach out to one security professional you admire on LinkedIn or Twitter — ask one specific question. Most people in security are happy to help.",
  ],
});

// W24: Capstone — Earn It
rewriteWeek("cybersecurity", 24, {
  context: `You have spent 24 weeks learning how to think like an attacker, communicate like a professional, defend like an engineer, and build a career in security. The capstone is not a test — it is a proof of work that demonstrates all of this in a form that is visible to employers and the community.

You will complete three deliverables: a full vulnerability report from a real bug bounty programme or a self-hosted lab environment, a public write-up (blog post) of a technique or finding, and a security portfolio document that ties together everything you have built.

No shortcuts. No AI-generated findings. Every vulnerability you report must be one you found yourself, understood fully, and can explain in detail. The capstone is the start of your career, not the end of a course.`,
  pre_flight: `**Capstone deliverables checklist:**

1. Vulnerability Report (real finding or lab-based):
   - At least one finding documented to professional standard
   - Executive summary + technical finding + remediation
   - CVSS score with full vector string
   - Evidence (screenshots, HTTP requests)
   - Submitted to bug bounty OR documented against Juice Shop/HackTheBox

2. Public Write-up (blog post):
   - Minimum 800 words
   - Explains a technique, tool, or vulnerability in your own words
   - Published on your blog (GitHub Pages, Ghost, Medium)
   - Shared on LinkedIn and Twitter/X

3. Portfolio document:
   \`\`\`markdown
   # [Your Name] — Security Portfolio

   ## Skills
   - Penetration Testing: [list tools and techniques]
   - Defensive Security: [SIEM, detection, IR]
   - Cloud Security: [AWS tools, compliance frameworks]

   ## Projects
   - [Project 1]: [description, link]
   - [CTF writeups]: [link to blog/GitHub]
   - [Bug bounty submissions]: [public if available]

   ## Certifications / Training
   - [Cert/course + date]

   ## Vulnerability Research
   - [Finding 1]: [severity, type, where]
   \`\`\``,
  mastery_questions: [
    "Walk me through your most interesting finding from the course — the vulnerability, how you found it, what the impact is, and how to fix it.",
    "If a potential employer asked you to demonstrate your skills right now, what would you show them first?",
    "What specialisation do you want to pursue? What specific role title are you targeting and what does the job description typically require?",
    "What is the most important security concept you learned in this course and how has it changed how you think about software?",
    "Where do you want to be in 12 months from today in your security career? What is the first action you take after this week ends?",
  ],
  common_mistakes: [
    "Writing a capstone that only demonstrates tools you can run, not concepts you understand — employers test understanding in interviews, not tool usage.",
    "Publishing a blog post that copies technique documentation — your write-up must add something: your analysis, your mistakes, your observations. Copy-paste is visible and worthless.",
    "Not including your thought process in findings — 'I ran Burp and found XSS' is not a finding. 'I noticed the search parameter was reflected in the response without encoding, so I tested with a basic script tag payload and confirmed execution' is a finding.",
    "Treating the capstone as a final assignment instead of a beginning — this document is the first version of your public profile. Update it every time you find something new.",
    "Waiting until everything is perfect to publish — publish now, improve later. A slightly rough write-up published is infinitely more valuable than a perfect one on your hard drive.",
  ],
  debug_help: `**Blog post feels too short or thin?**
Add these sections:
- What I tried that didn't work (shows methodology)
- What the root cause is (shows understanding)
- How to test for this in 5 minutes (shows practicality)
- What a developer should do to fix it (shows full-cycle thinking)

**Vulnerability report feels incomplete?**
Check against this template:
- Title: Clear and specific
- Severity + CVSS: with full vector string
- Description: What the vulnerability is
- Reproduction: Step-by-step that a stranger can follow
- Impact: What an attacker gains
- Evidence: Raw HTTP request + response or screenshot
- Remediation: Specific, code-level, actionable

**Portfolio not getting traction?**
- Share in TryHackMe Discord, HackTheBox Discord, r/netsec
- Tag the tool author when you write about their tool
- Engage with comments — a portfolio is the start of a conversation`,
  ai_assist: `**Prompts that work:**
- "Review my vulnerability report draft and tell me what is missing, what is unclear, and what would make a security recruiter take this seriously: [paste draft]"
- "Help me write the introduction paragraph for my blog post about [technique] — I want it to be direct, technical, and compelling without being sensational."
- "What should a junior security analyst's portfolio include to stand out to a hiring manager at a mid-size SaaS company?"
- "I am applying for my first security role. Review this portfolio document and suggest what to add, remove, or restructure: [paste portfolio]"`,
  stretch: [
    "Submit your vulnerability report to a real bug bounty programme. Even an Informational finding is a start — document and submit it.",
    "Get your blog post indexed: submit it to Hacker News, Reddit r/netsec, and LinkedIn. Track the views.",
    "Apply for 3 security roles this week — analyst, junior pentester, or security engineer. The capstone is your portfolio; use it.",
    "Book OSCP, eJPT, or PNPT for 3 months from now — give yourself a deadline for your first certification.",
  ],
});

console.log("\nAll done — cybersecurity W21-W24 applied.");
