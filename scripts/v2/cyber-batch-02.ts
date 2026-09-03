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

// W6: Exploitation — Real Bugs in Real Apps
rewriteWeek("cybersecurity", 6, {
  context: `Exploitation is where theory meets practice. This week you move beyond finding vulnerabilities and start exploiting them — in controlled lab environments only. You work through PortSwigger Web Security Academy labs, which are the best free hands-on exploitation training available anywhere.

The goal is not to write exploits from scratch. It is to understand how exploitation chains work: one vulnerability becomes the entry point, another escalates privileges, another exfiltrates data. Real attacks are rarely a single CVE — they are a chain.

You also learn Metasploit this week. Metasploit is a framework for running known exploits against known vulnerable targets. It is not a magic hacking button — it is a library of modules that each implement a specific exploit. Understanding why a Metasploit module works is more important than knowing how to run it.`,
  pre_flight: `**PortSwigger Web Security Academy (free):**
https://portswigger.net/web-security

Complete labs in this order this week:
1. SQL Injection: "SQL injection UNION attack, determining the number of columns"
2. XSS: "Reflected XSS into HTML context with nothing encoded"
3. CSRF: "CSRF vulnerability with no defenses"
4. File Upload: "Remote code execution via web shell upload"

**Metasploit setup (use Kali Linux or Docker):**
\`\`\`bash
# In Kali or Metasploitable lab
msfconsole
# Search for a module
search type:exploit name:eternalblue
# Use a module
use exploit/windows/smb/ms17_010_eternalblue
show options
set RHOSTS <target-ip>
run
\`\`\`

**Safe target for Metasploit:** Metasploitable 2
\`\`\`bash
# Download Metasploitable 2 VM from SourceForge
# Run in VirtualBox (host-only network)
\`\`\``,
  mastery_questions: [
    "Explain a SQL injection UNION attack. What must be true about the original query for a UNION attack to work?",
    "Walk me through how a web shell upload exploit works, step by step from file upload to code execution.",
    "What is Metasploit's Meterpreter? How does it differ from a standard reverse shell?",
    "You exploit a vulnerability and get a low-privilege shell. Name 3 techniques for privilege escalation on Linux.",
    "What is an exploit chain? Give a real example (you can use a known CVE) of how two vulnerabilities combine to give full system access.",
  ],
  common_mistakes: [
    "Running Metasploit against real targets — Metasploit modules send exploit payloads. Running them against anything you don't own is a crime.",
    "Not understanding the exploit before running it — 'use, set RHOSTS, run' is not learning. Read the module source (show info, less modules/...) and understand what it does.",
    "Confusing payload and exploit — the exploit gets you code execution; the payload is what runs after. Meterpreter, reverse shell, bind shell are payloads.",
    "Ignoring post-exploitation — getting a shell is not the end. A professional pentester documents what they can access from that shell: files, credentials, network access.",
    "Not cleaning up — in real engagements, you remove web shells and reverse shells after testing. In labs, always reset the machine when done.",
  ],
  debug_help: `**Metasploit module fails?**
\`\`\`bash
# Check target is reachable
ping <target-ip>
# Check the required port is open
nmap -p <port> <target-ip>
# Read the module's check function
msf6 exploit(...) > check
\`\`\`

**PortSwigger lab not working as expected?**
- Read the solution approach (not the solution itself) to check your methodology
- Use Burp's HTTP History to see exactly what requests are sent
- Some labs require specific browser settings (disable extensions)

**Web shell upload — file not executing?**
\`\`\`bash
# Check what language the server runs (look at response headers, file extensions)
# .php shell on a Python server won't work
# Try different extensions: .phtml, .php5, .phar
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Explain how a SQL injection UNION attack extracts data from a database. Walk me through the steps to determine column count, then extract data."
- "What is the difference between a bind shell and a reverse shell? Which works better through NAT and why?"
- "I got a low-privilege shell on a Linux machine. Walk me through a privilege escalation checklist — what do I check first?"
- "Explain what Metasploit's 'multi/handler' module does and when I need it."`,
  stretch: [
    "Complete all 'SQL injection' apprentice-level labs on PortSwigger Web Security Academy.",
    "Exploit Metasploitable 2 using at least 3 different Metasploit modules — document each in your vault.",
    "Read the full Metasploit Unleashed guide (free): https://www.offensive-security.com/metasploit-unleashed/",
    "Set up a reverse shell from Juice Shop using the file upload vulnerability — document the exact steps.",
  ],
});

// W7: Network and Service Pentesting
rewriteWeek("cybersecurity", 7, {
  context: `Web applications are one attack surface. Networks and services are another. This week you learn to audit networks and services: scanning, fingerprinting, and exploiting common service misconfigurations.

Every open port is an attack surface. SSH, FTP, SMTP, RDP, SMB, databases — each service has known vulnerabilities, default credentials, and misconfigurations that attackers look for. A real pentest starts with a full port scan of the target network, then service fingerprinting, then research on each service version for known CVEs.

You also learn Nessus or OpenVAS this week — professional vulnerability scanners used in real engagements. These are different from Burp/ZAP (which are web-only); network scanners evaluate every open service for known vulnerabilities.`,
  pre_flight: `**Nessus Essentials (free for personal use):**
https://www.tenable.com/products/nessus/nessus-essentials
Register for a free activation key, install on your machine.

**OpenVAS (open-source alternative):**
\`\`\`bash
docker run -d -p 443:443 --name openvas mikesplain/openvas
# Access at https://localhost (admin/admin default)
\`\`\`

**Network scanning with nmap:**
\`\`\`bash
# Full port scan (slow but thorough)
nmap -p- -T4 <target-ip>
# Service and version detection
nmap -sV -sC -p 22,80,443,3306 <target-ip>
# OS detection (requires root)
sudo nmap -O <target-ip>
# Output to file
nmap -oN scan.txt -oX scan.xml <target-ip>
\`\`\`

**Target: Metasploitable 2** (host-only network in VirtualBox)
Default credentials: msfadmin / msfadmin`,
  mastery_questions: [
    "What is the difference between a SYN scan (nmap -sS) and a full connect scan (nmap -sT)? When would you use each?",
    "You find port 21 (FTP) open on a target. What are the first 3 things you test?",
    "What is SMB and why is it historically a high-risk service? Name 2 CVEs related to SMB.",
    "Explain the difference between a vulnerability scanner (Nessus) and a penetration test. Can you replace one with the other?",
    "What is a service banner and how does it help an attacker? How can a defender reduce banner information leakage?",
  ],
  common_mistakes: [
    "Only scanning common ports — attackers scan all 65535 ports. Running services on non-standard ports is security through obscurity, not security.",
    "Treating Nessus output as a pentest report — a vulnerability scan is a list of potential issues. A pentest confirms which ones are actually exploitable.",
    "Not checking for default credentials — 'admin/admin', 'root/root', 'guest/guest' still work on thousands of exposed services. Always check.",
    "Missing UDP services — nmap defaults to TCP. Services like DNS (53/UDP), SNMP (161/UDP), and TFTP (69/UDP) require nmap -sU.",
    "Ignoring old/unpatched service versions — nmap -sV shows you the version. Search that version in CVE database immediately.",
  ],
  debug_help: `**nmap scan too slow?**
\`\`\`bash
# Adjust timing template (T1=slow, T5=fast/loud)
nmap -T4 -p- <target-ip>
# Skip host discovery if you know the host is up
nmap -Pn -p- <target-ip>
\`\`\`

**Nessus won't start?**
\`\`\`bash
# Linux/macOS
sudo systemctl start nessusd
# Check status
sudo systemctl status nessusd
# Access at: https://localhost:8834
\`\`\`

**Can't connect to FTP on Metasploitable?**
\`\`\`bash
ftp <target-ip>
# If connection refused, confirm FTP port is open
nmap -p 21 <target-ip>
# Try anonymous login
ftp> anonymous
ftp> anonymous@
\`\`\``,
  ai_assist: `**Prompts that work:**
- "I ran nmap and found these open ports on a target: [paste output]. What should I investigate first and why?"
- "Explain what an SNMP community string is and how it can be abused by an attacker."
- "What are the most common FTP misconfigurations a pentester looks for?"
- "Walk me through how you would audit an SSH server configuration for security weaknesses."`,
  stretch: [
    "Run a full Nessus scan against Metasploitable 2 and document the top 5 critical findings.",
    "Enumerate SNMP on Metasploitable 2 using snmpwalk — what information can you extract?",
    "Complete TryHackMe's 'Network Services' room (covers FTP, Telnet, SMB, NFS, SMTP, MySQL).",
    "Write an nmap NSE script that checks for a specific service banner — Lua scripting, documented in nmap NSE docs.",
  ],
});

// W8: Reporting and Communication — The Skill That Pays
rewriteWeek("cybersecurity", 8, {
  context: `Finding vulnerabilities is 40% of a pentester's job. Communicating them clearly is the other 60%. A security finding that the engineering team cannot understand and act on is worthless. This week you learn to write professional penetration test reports.

A professional pentest report has two sections: an executive summary (for leadership, non-technical, focused on business risk) and a technical findings section (for developers, specific reproduction steps, code-level remediation). You need to write both.

You also learn to triage findings by risk. Not everything is Critical. Severity is based on CVSS; risk is based on severity + likelihood + business impact. A CVSS 9.8 vulnerability on an internal system with no external access has lower risk than a CVSS 6.0 vulnerability on a public-facing payment page.`,
  pre_flight: `**Read these real pentest reports (public, redacted):**
- Cure53 public reports: https://cure53.de/#publications
- NCC Group public advisories: https://research.nccgroup.com/

**Report structure to memorise:**
\`\`\`
1. Title Page
2. Table of Contents
3. Executive Summary (1 page, non-technical)
   - Scope and Objectives
   - Overall Risk Rating
   - Key Findings Summary (3-5 bullets)
   - Strategic Recommendations
4. Technical Findings
   - Finding 1: Title, Severity, CVSS, Description, Steps, Impact, Remediation, Evidence
   - Finding 2: ...
5. Appendix
   - Methodology
   - Tools Used
   - Scope Details
\`\`\`

**Tools for report writing:**
- Notion or Obsidian: note-taking during testing
- PlexTrac, Dradis, or Sysreptor: professional report platforms
- For now: Markdown + PDF export is fine`,
  mastery_questions: [
    "Write an executive summary paragraph for a pentest that found: SQL injection on login page (Critical), missing security headers (Low), outdated Apache version (Medium).",
    "What is the difference between severity and risk? Give an example where a Low severity finding has High risk.",
    "A developer reads your remediation for XSS and says 'just sanitise the input'. Why is this wrong? What is the correct remediation?",
    "How do you explain CVSS scoring to a non-technical executive without using the acronym?",
    "What goes in an executive summary that should NOT be in the technical findings, and vice versa?",
  ],
  common_mistakes: [
    "Writing one report for both audiences — executives do not read CVSS vector strings; developers do not need business risk narratives. Split them clearly.",
    "Copying CVE descriptions as your finding description — you must describe the vulnerability as it exists in the specific application you tested, not generically.",
    "Not including evidence — 'we found SQL injection' without a screenshot or HTTP request is not a valid report finding.",
    "Recommending 'upgrade to the latest version' without checking what the latest version is and if it is stable for production.",
    "Delivering findings verbally without a written report — verbal findings cannot be tracked, assigned, or closed. Always deliver in writing.",
  ],
  debug_help: `**Not sure how to write the remediation?**
Start with: 'The remediation is to [specific action] using [specific library/config]. Here is an example: [code snippet].'
Never write: 'Fix the SQL injection.' That is not remediation.

**Struggling with risk rating?**
Use this framework:
- Critical: directly exploitable, significant data loss or system compromise, no authentication required
- High: exploitable but requires some conditions, significant impact
- Medium: exploitable with significant conditions, moderate impact, or low-impact with easy exploit
- Low: theoretical or requires many conditions to exploit, minimal impact
- Info: no direct security risk, but relevant context

**Report template starting point:**
Copy a Cure53 report structure and use it as your template.`,
  ai_assist: `**Prompts that work:**
- "Review this vulnerability finding and improve the remediation section: [paste your finding]"
- "Help me write an executive summary for a pentest with these findings: [list findings with severity]"
- "What is the correct remediation for stored XSS in a React application? Be specific about which library to use and how."
- "How do I explain the business impact of an IDOR vulnerability to a non-technical CEO in 2 sentences?"`,
  stretch: [
    "Write a complete mock pentest report for your Juice Shop findings — executive summary plus full technical findings for 5 bugs.",
    "Submit a bug report to a real bug bounty program on HackerOne or Bugcrowd — start with programs labelled 'Beginner Friendly'.",
    "Read Offensive Security's exam report requirements for OSCP — understand what professional reporting standards look like.",
    "Practise explaining a security vulnerability to a non-technical friend without using jargon — if they can act on it, your communication works.",
  ],
});

// W9: Defence Basics — Logging, SIEM, Detection
rewriteWeek("cybersecurity", 9, {
  context: `Security is not only about attack. The other half of the field is defence — detecting, alerting, and responding to attacks. This week you switch to the defender's perspective and learn the core tools: logging, SIEM (Security Information and Event Management), and detection engineering.

Logs are the foundation of security operations. Every login attempt, every HTTP request, every system call generates a log. A SIEM collects logs from across an environment, normalises them, and applies detection rules to find suspicious patterns. Without logs, you cannot detect attacks.

You learn Elastic SIEM (free, open-source) or Splunk (free tier) this week. You ingest logs, write detection queries, and build a basic alert. Even as an offensive security specialist, understanding how defenders detect you makes you a better attacker.`,
  pre_flight: `**Elastic SIEM (free, via Docker):**
\`\`\`bash
# Elasticsearch + Kibana stack
docker-compose up -d
# Access Kibana at http://localhost:5601
\`\`\`

**Or use Elastic Cloud free trial:** https://cloud.elastic.co/

**Splunk Free Trial:** https://www.splunk.com/en_us/download.html (60-day trial, or Splunk Cloud free tier)

**Log sources to ingest this week:**
- Web server access logs (nginx/Apache)
- SSH authentication logs (/var/log/auth.log)
- Windows Event Logs (if available)

**Basic Elastic query (KQL):**
\`\`\`
# Find all failed SSH logins
event.action: "authentication_failure" and service.type: "ssh"

# Find HTTP 4xx errors
http.response.status_code >= 400 and http.response.status_code < 500

# Find multiple failures from same IP (brute force pattern)
event.action: "authentication_failure" | stats count by source.ip
\`\`\``,
  mastery_questions: [
    "What is a SIEM and what problem does it solve? Name 3 commercial SIEMs.",
    "What is the difference between a log and an alert? What makes a good alert rule?",
    "Explain what a false positive is in the context of detection engineering. Why is a 10% false positive rate a problem in practice?",
    "What is a Sigma rule? Write a basic Sigma rule that detects multiple failed logins from the same IP.",
    "What logs would you need to detect a successful SQL injection attack against a web application?",
  ],
  common_mistakes: [
    "Logging everything without a retention policy — logs cost money to store. Define what you log, for how long, and at what level.",
    "Writing detection rules without tuning them — a rule that fires 1,000 times a day is ignored. Tune rules to have high signal-to-noise ratio.",
    "Not logging failed authentication attempts — successful logins are not the threat. Failed logins (especially in bursts) are the signal.",
    "Ignoring log integrity — logs must be shipped to a central system immediately. An attacker who compromises a host can delete local logs.",
    "Alert fatigue is a real security risk — too many alerts means analysts stop reading them. Prioritise ruthlessly.",
  ],
  debug_help: `**Elasticsearch won't start?**
\`\`\`bash
# Check Java heap space (needs at least 2GB RAM)
docker stats elasticsearch
# Increase heap if needed
environment:
  - ES_JAVA_OPTS=-Xms1g -Xmx1g

# Check logs
docker logs elasticsearch
\`\`\`

**No data in Kibana?**
- Check Filebeat is running and pointing to Elasticsearch
- In Kibana: Management → Stack Management → Index Management — do indices exist?
- Try the Discover tab and select 'Last 24 hours'

**Sigma rule not matching?**
\`\`\`bash
# Convert Sigma to Elasticsearch query
sigma convert -t es-qs -p elasticsearch/windows rules/my-rule.yml
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Write a Sigma rule that detects a PowerShell download cradle (IEX or Invoke-WebRequest in a command line)."
- "What is the difference between a SIEM and an IDS/IPS? When would you use each?"
- "I have nginx access logs. What KQL queries would detect a directory brute-force attack?"
- "Explain the MITRE ATT&CK framework and how it relates to detection engineering."`,
  stretch: [
    "Set up Elastic SIEM locally, ingest nginx access logs from Juice Shop, and write a detection rule for SQL injection attempts.",
    "Map 3 attacks you performed in earlier weeks to MITRE ATT&CK techniques and note which ATT&CK technique IDs apply.",
    "Read the MITRE ATT&CK framework overview: https://attack.mitre.org/",
    "Complete TryHackMe's 'SOC Level 1' learning path introductory rooms.",
  ],
});

// W10: Incident Response Basics — When Something Real Happens
rewriteWeek("cybersecurity", 10, {
  context: `Incidents happen. The question is not whether you will face a security incident but whether you have a plan when you do. Incident Response (IR) is the structured process of detecting, containing, eradicating, and recovering from a security breach.

The IR lifecycle: Preparation → Detection → Analysis → Containment → Eradication → Recovery → Post-Incident Review. Most organisations are terrible at Preparation and Post-Incident Review, which means they keep having the same incidents.

This week you learn the IR process, how to triage an incident (what is compromised, how far has it spread, what data is at risk), and how to write a post-incident report. You also learn basic forensics: how to preserve evidence, read system logs, and establish a timeline.`,
  pre_flight: `**Read the NIST Computer Security Incident Handling Guide:**
https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r2.pdf (free)
Focus on Sections 2, 3, and 4.

**IR playbook template:**
\`\`\`markdown
# Incident Response Playbook — [Incident Type]

## Detection
- Alert source:
- Initial indicator:
- Time detected:

## Triage Questions
1. What systems are affected?
2. Is the attacker still active?
3. What data may be compromised?
4. What is the business impact?

## Containment Steps
1. Isolate affected systems
2. Preserve logs before they rotate
3. Change compromised credentials

## Eradication
- Remove malware/backdoors
- Patch exploited vulnerability
- Verify no persistence mechanisms remain

## Recovery
- Restore from known-good backup
- Monitor for re-compromise
- Verify normal operation

## Post-Incident Review
- Timeline of events
- Root cause
- What we did well / what we missed
- Action items with owners and deadlines
\`\`\``,
  mastery_questions: [
    "Walk me through the 6 phases of the NIST incident response lifecycle with a real example at each phase.",
    "You receive an alert: unusual outbound traffic to a foreign IP at 3am. What are the first 5 steps you take?",
    "What is forensic preservation? Why must you image a drive before analysing it?",
    "What is a chain of custody and why does it matter in incident response?",
    "How do you determine the scope of a compromise? What tools and log sources do you use?",
  ],
  common_mistakes: [
    "Eradicating before containing — if you clean a machine before isolating it from the network, you lose the evidence AND the attacker may still have access.",
    "Not preserving logs before containment — rotating logs and rebooting systems destroys forensic evidence. Preserve first, then act.",
    "Treating every alert as an incident — not every alert is an incident. Triage determines if it is a true positive requiring IR vs a false positive.",
    "Skipping the post-incident review — this is the most valuable part. Without it, the same incident happens again.",
    "Not communicating during the incident — stakeholders need regular updates even if you have nothing new to report. 'We are investigating, update in 1 hour' is valid.",
  ],
  debug_help: `**Building a timeline from logs:**
\`\`\`bash
# Find all events in a time range in auth.log
grep "Mar 15 02:" /var/log/auth.log
# Find all commands run by a user (bash history)
cat /home/username/.bash_history
# Find recently modified files (last 24 hours)
find / -mtime -1 -type f 2>/dev/null | head -50
# Find files with SUID bit (common persistence technique)
find / -perm -4000 -type f 2>/dev/null
\`\`\`

**Volatility for memory forensics:**
\`\`\`bash
# Install Volatility 3
pip install volatility3
# List processes from a memory image
vol -f memory.dmp windows.pslist
# Find network connections
vol -f memory.dmp windows.netstat
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Walk me through how to investigate a potential ransomware infection on a Windows server — what do I check first?"
- "What is the difference between containment and eradication in incident response? Can you do them out of order?"
- "Help me write a post-incident report for this scenario: [describe incident]. Include root cause analysis and action items."
- "What is Volatility and what kinds of artifacts can you extract from a Windows memory dump?"`,
  stretch: [
    "Complete the TryHackMe 'Incident Response and Forensics' room.",
    "Write a complete IR playbook for a specific incident type: ransomware, phishing, or account compromise.",
    "Practise with a DFIR challenge: https://cyberdefenders.org/ has free, guided scenarios with memory dumps and log files.",
    "Read the Verizon Data Breach Investigations Report (latest year) — what are the top attack patterns and how do they align with what you've learned?",
  ],
});

console.log("\nAll done — cybersecurity W6-W10 applied.");
