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

// W11: Endpoint Security — EDR, Hardening, MDM
rewriteWeek("cybersecurity", 11, {
  context: `Endpoints — laptops, servers, mobile devices — are where most attacks land. Phishing delivers malware to a laptop. A compromised server is an endpoint. Endpoint security is the practice of hardening these devices and monitoring them for malicious activity.

EDR (Endpoint Detection and Response) is the modern evolution of antivirus. Instead of signature matching, EDR monitors system behaviour: process creation, network connections, file writes, registry changes. When a process does something suspicious (like spawning PowerShell from Word), the EDR flags it.

This week you learn how defenders harden endpoints (CIS Benchmarks, Group Policy on Windows, sysctl on Linux) and how attackers bypass these controls. Understanding bypass techniques as a defender helps you build better detections.`,
  pre_flight: `**CIS Benchmarks (free with registration):**
https://www.cisecurity.org/cis-benchmarks/
Download the benchmark for your primary OS (Windows/Ubuntu).

**Linux hardening quick audit:**
\`\`\`bash
# Check for world-writable files
find / -xdev -type f -perm -0002 2>/dev/null

# Check SUID binaries
find / -perm -4000 -type f 2>/dev/null

# Check listening services
ss -tlnp

# Check cron jobs (potential persistence)
crontab -l
ls /etc/cron.*

# Check users with shell access
grep -v '/sbin/nologin\|/bin/false' /etc/passwd
\`\`\`

**Free EDR options for learning:**
- Wazuh (open-source HIDS/EDR): https://wazuh.com/
- Velociraptor (DFIR/EDR): https://www.rapid7.com/products/velociraptor/
- Both have Docker-based quick-start setups`,
  mastery_questions: [
    "What is the difference between an antivirus and an EDR? What does an EDR detect that a traditional AV misses?",
    "Name 5 Windows Event IDs that are critical for detecting endpoint attacks and explain what each logs.",
    "What is a CIS Benchmark? Pick one control from the CIS Ubuntu benchmark and explain why it reduces risk.",
    "What is LOLBAS (Living Off The Land Binaries and Scripts)? Give 3 examples of legitimate Windows tools attackers abuse.",
    "How does a defender detect a process injection attack? What artefacts does it leave that an EDR can see?",
  ],
  common_mistakes: [
    "Treating hardening as a one-time task — configurations drift. Run hardening checks continuously or on every deploy.",
    "Blocking legitimate admin tools to reduce attack surface — this creates operational friction. Use allowlisting with context, not blanket blocking.",
    "Ignoring endpoint telemetry — an EDR that nobody monitors is worthless. Alerts need to route to a SOC or a human who can act.",
    "Not testing your detections — write a detection rule, then simulate the attack to confirm the rule fires. Untested detections give false confidence.",
    "Underestimating LOLBAS — attackers who use PowerShell, certutil, and mshta are harder to detect than those who drop custom malware.",
  ],
  debug_help: `**Wazuh agent not reporting?**
\`\`\`bash
# Check agent status
sudo systemctl status wazuh-agent
# Verify manager connection
sudo /var/ossec/bin/agent_control -l
# Check agent logs
tail -f /var/ossec/logs/ossec.log
\`\`\`

**auditd not logging?**
\`\`\`bash
# Check audit daemon is running
sudo systemctl status auditd
# Check audit rules
sudo auditctl -l
# View audit log
sudo ausearch -k <keyname>
\`\`\`

**Windows Event Log not showing events?**
- Check the correct log source (Security, System, Application)
- Event ID 4625 = failed login, 4688 = process creation, 4663 = file access
- Use Get-WinEvent in PowerShell for filtering`,
  ai_assist: `**Prompts that work:**
- "What are the most important Windows Event IDs for detecting lateral movement? Give me a list with descriptions."
- "Explain process injection techniques (DLL injection, process hollowing, reflective DLL). How does an EDR detect each?"
- "What is AppLocker and how does it differ from Windows Defender Application Control (WDAC)?"
- "Write an auditd rule that logs all executions of /bin/bash and /bin/sh."`,
  stretch: [
    "Install Wazuh on a local VM and generate alerts by simulating a brute-force attack against SSH.",
    "Run Lynis (open-source hardening audit) on a Linux system and address 5 of the findings: sudo lynis audit system",
    "Complete the TryHackMe 'Endpoint Security Monitoring' room.",
    "Read about the SolarWinds supply chain attack — what endpoint artefacts could have detected the Sunburst malware?",
  ],
});

// W12: Threat Intelligence and Hunting
rewriteWeek("cybersecurity", 12, {
  context: `Threat intelligence is information about adversaries — who they are, what they want, what tools they use, and how they operate. Threat hunting is proactively searching your environment for signs of compromise that automated tools have not detected.

Most security teams are reactive: they respond to alerts. Threat hunters are proactive: they form a hypothesis ('I think an attacker might be using WMI for persistence') and go hunting for evidence of that technique across all their endpoint telemetry.

This week you learn the threat intelligence lifecycle, how to consume and apply threat feeds (IOCs, TTPs), and how to run a basic threat hunt using MITRE ATT&CK as your framework. You also learn about threat actor groups — understanding your likely adversaries changes how you prioritise defences.`,
  pre_flight: `**MITRE ATT&CK Navigator (free, browser-based):**
https://mitre-attack.github.io/attack-navigator/

**Threat intelligence feeds (free):**
- AlienVault OTX: https://otx.alienvault.com/
- VirusTotal: https://www.virustotal.com/ (IOC lookup)
- Shodan: https://www.shodan.io/ (exposed service intelligence)
- abuse.ch: https://abuse.ch/ (malware hashes, C2 IPs)

**IOC types to understand:**
\`\`\`
Hash-based IOCs: MD5, SHA1, SHA256 of malware files
Network-based IOCs: IP addresses, domain names, URLs of C2 servers
Host-based IOCs: registry keys, file paths, mutex names
Behavioural IOCs: TTPs (Tactics, Techniques, Procedures)
\`\`\`

**Threat hunting hypothesis examples:**
- "Are any hosts running PowerShell from Word or Excel?"
- "Are any hosts communicating with IP ranges in a specific threat actor's known infrastructure?"
- "Are any service accounts running interactive logons (anomalous for service accounts)?"`,
  mastery_questions: [
    "What is the difference between strategic, operational, and tactical threat intelligence? Who consumes each?",
    "What is an IOC vs a TTP? Which has a longer shelf life and why (reference the Pyramid of Pain)?",
    "Explain the MITRE ATT&CK framework. What is the difference between a Tactic, a Technique, and a Sub-technique?",
    "How do you form a threat hunting hypothesis? Give an example hypothesis for detecting lateral movement.",
    "What is threat actor attribution and why is it difficult? Why does attribution matter (or not matter) to a defender?",
  ],
  common_mistakes: [
    "Chasing IOC hashes without context — a malware hash is the least useful IOC. Attackers recompile malware daily. TTPs persist for years.",
    "Treating all threat intelligence as equally relevant — a threat feed full of Chinese APT IOCs is not useful if you are a small retail company. Contextualise to your threat model.",
    "Hunting without a hypothesis — randomly looking through logs is not threat hunting. Start with a specific technique and look for its artefacts.",
    "Not documenting hunts — record your hypothesis, what you searched, what you found, and your conclusion. This builds institutional knowledge.",
    "Confusing threat intelligence with vulnerability intelligence — CVEs are not threat intelligence. Threat intel is about adversary behaviour.",
  ],
  debug_help: `**VirusTotal API (free tier):**
\`\`\`bash
# Look up a file hash
curl --request GET \
  --url 'https://www.virustotal.com/api/v3/files/<hash>' \
  --header 'x-apikey: YOUR_API_KEY'

# Look up a domain
curl --request GET \
  --url 'https://www.virustotal.com/api/v3/domains/suspicious.com' \
  --header 'x-apikey: YOUR_API_KEY'
\`\`\`

**MITRE ATT&CK Navigator — loading a layer file?**
- File → Open Existing Layer
- Or paste a JSON layer exported from another Navigator session

**Threat intel not actionable?**
- Convert IOCs to SIEM rules immediately after receiving them
- Set an expiry date on IOC rules (IPs especially) — stale IOCs cause false positives`,
  ai_assist: `**Prompts that work:**
- "Explain the Pyramid of Pain and why TTPs are more valuable than IP addresses for defenders."
- "What is the Diamond Model of Intrusion Analysis? How does it differ from the Cyber Kill Chain?"
- "Give me 5 threat hunting hypotheses based on MITRE ATT&CK techniques related to persistence."
- "What is STIX/TAXII and how does it enable threat intelligence sharing?"`,
  stretch: [
    "Use the MITRE ATT&CK Navigator to build a threat profile for APT29 (Cozy Bear) — which techniques do they use most?",
    "Sign up for AlienVault OTX and subscribe to 5 relevant threat intelligence feeds.",
    "Complete a free threat hunting exercise at: https://github.com/OTRF/ThreatHunter-Playbook",
    "Read the Mandiant APT1 report (public, from 2013) — still one of the best examples of threat actor attribution.",
  ],
});

// W13: Cloud Security — AWS, Azure, GCP
rewriteWeek("cybersecurity", 13, {
  context: `Cloud infrastructure is now the default for most companies. Cloud security is fundamentally different from on-premise security: the attack surface is configuration, not physical access. Most cloud breaches happen because of misconfigured S3 buckets, overly permissive IAM roles, or exposed metadata endpoints — not because an attacker broke into a data centre.

This week you learn the cloud security fundamentals: shared responsibility model, IAM policies, network security groups, and the most common cloud misconfigurations. You will audit an AWS environment for security issues using tools like ScoutSuite, Prowler, and AWS Config.

The mindset shift: in cloud, your infrastructure is code (Terraform, CloudFormation). Security misconfigurations in that code are vulnerabilities, just like SQL injection in application code.`,
  pre_flight: `**AWS Free Tier account:**
https://aws.amazon.com/free/ (12-month free tier, needs credit card)

**ScoutSuite — multi-cloud security auditing:**
\`\`\`bash
pip install scoutsuite
# Audit AWS (requires configured AWS credentials)
scout aws --profile default
# Output: HTML report in scoutsuite-report/
\`\`\`

**Prowler — AWS security best practices:**
\`\`\`bash
pip install prowler
prowler aws
\`\`\`

**CloudGoat — deliberately vulnerable AWS environment:**
\`\`\`bash
# Rhino Security Labs' CloudGoat for practise
git clone https://github.com/RhinoSecurityLabs/cloudgoat
cd cloudgoat && pip install -r requirements.txt
./cloudgoat.py create iam_privesc_by_rollback
\`\`\`

**Key AWS security concepts:**
- IAM: Identity and Access Management (users, roles, policies)
- S3 bucket policies: object-level permissions
- Security Groups: stateful firewall rules
- CloudTrail: API call audit logs
- GuardDuty: threat detection service`,
  mastery_questions: [
    "What is the AWS Shared Responsibility Model? Where does AWS's responsibility end and the customer's begin?",
    "What is an IAM role vs an IAM user? When should you use a role instead of a user?",
    "A S3 bucket is publicly readable. What is the risk? How do you audit all buckets in an account for public access?",
    "What is the IMDS (Instance Metadata Service) and how has it been abused in cloud attacks?",
    "Explain IAM privilege escalation. How can an attacker with iam:PassRole and lambda:CreateFunction escalate to admin?",
  ],
  common_mistakes: [
    "Using the root account for daily operations — root has unlimited permissions and cannot be restricted. Create IAM users with least privilege immediately.",
    "Storing credentials in application code or environment variables without using IAM roles — any code execution vulnerability exposes those credentials.",
    "Leaving security groups open to 0.0.0.0/0 on port 22 or 3389 — SSH and RDP should never be open to the internet. Use VPN, bastion host, or SSM Session Manager.",
    "Not enabling CloudTrail — without CloudTrail, you have no audit log of API calls. This is the first thing to turn on in any AWS account.",
    "Assuming 'private' S3 means secure — check bucket policies, ACLs, and public access blocks. Multiple layers can each introduce exposure.",
  ],
  debug_help: `**ScoutSuite authentication error?**
\`\`\`bash
# Configure AWS credentials first
aws configure
# Check which profile ScoutSuite uses
scout aws --profile <profile-name>
# Verify your credentials work
aws sts get-caller-identity
\`\`\`

**CloudGoat scenario deploy failing?**
\`\`\`bash
# Ensure Terraform is installed
terraform version
# CloudGoat needs specific AWS permissions
# Use an IAM user with AdministratorAccess for the lab account
\`\`\`

**Finding public S3 buckets manually:**
\`\`\`bash
# List all buckets
aws s3 ls
# Check public access settings
aws s3api get-public-access-block --bucket <bucket-name>
# Check bucket policy
aws s3api get-bucket-policy --bucket <bucket-name>
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Explain the principle of least privilege as it applies to AWS IAM. What does a minimal IAM policy for an S3 read-only role look like?"
- "What is the AWS IMDSv2 and how does it prevent SSRF-based credential theft?"
- "Walk me through a cloud attack scenario: attacker gets AWS keys from a public GitHub repo. What do they do next?"
- "What are the CIS AWS Foundations Benchmark controls? List the top 5 most impactful ones."`,
  stretch: [
    "Complete the CloudGoat 'iam_privesc_by_rollback' scenario and document the privilege escalation path.",
    "Run Prowler against your AWS account and fix 5 findings.",
    "Read the Capital One breach post-mortem — understand how SSRF + IMDS led to credential theft.",
    "Complete the TryHackMe 'Cloud Security' path or HackTheBox cloud-themed challenges.",
  ],
});

// W14: Container and Kubernetes Security
rewriteWeek("cybersecurity", 14, {
  context: `Container security is now essential because most production workloads run in containers. A container is not a VM — it shares the host kernel. A container escape vulnerability means an attacker who compromises a container can potentially escape to the host and access all other containers.

Kubernetes adds another layer: the API server is the control plane for the entire cluster. A misconfigured RBAC policy or an exposed dashboard can give an attacker cluster-admin access. The 2019 Tesla cryptojacking breach happened because their Kubernetes dashboard had no authentication.

This week you learn container image security (scanning, base image choice), Kubernetes RBAC, Pod Security Standards, network policies, and how to use tools like Trivy, kubeaudit, and kube-bench to audit a cluster.`,
  pre_flight: `**Trivy — container image scanning:**
\`\`\`bash
brew install trivy  # macOS
# Scan an image
trivy image nginx:latest
# Scan a running container
trivy image --input container.tar
\`\`\`

**kube-bench — CIS Kubernetes Benchmark:**
\`\`\`bash
# Run in a cluster (as a pod)
kubectl apply -f https://raw.githubusercontent.com/aquasecurity/kube-bench/main/job.yaml
kubectl logs job/kube-bench
\`\`\`

**kubeaudit:**
\`\`\`bash
brew install kubeaudit
kubeaudit all -f deployment.yaml
\`\`\`

**Vulnerable Kubernetes lab:**
- KubeCTF: https://github.com/inguardians/peirates (cloud-native attack framework)
- Kind (Kubernetes in Docker): kubectl apply -f bad-pod-all-rights.yaml
  https://github.com/BishopFox/badPods

**Key concepts:**
- Pod Security Standards: Privileged, Baseline, Restricted
- RBAC: ServiceAccounts, Roles, RoleBindings, ClusterRoles
- Network Policies: default deny, explicit allow`,
  mastery_questions: [
    "What is a container escape? Name 2 techniques that can lead to container escape.",
    "What is a privileged container and why is it dangerous? What is the difference between --privileged and running as root inside a container?",
    "Explain Kubernetes RBAC. What is the difference between a Role and a ClusterRole?",
    "What is a Kubernetes Network Policy? Write a policy that denies all ingress to a namespace except from pods with label 'app=frontend'.",
    "What is the Kubernetes API server and what happens if it is exposed with no authentication?",
  ],
  common_mistakes: [
    "Running containers as root — containers should run as non-root users. Add 'USER nobody' to your Dockerfile.",
    "Using --privileged in production — a privileged container has full access to the host. Only use it for specific tooling with awareness of the risk.",
    "Not setting resource limits — a container without CPU/memory limits can starve other containers on the node (denial of service).",
    "Leaving the Kubernetes dashboard exposed — it should require authentication and not be publicly accessible. Many clusters have it open by default.",
    "Not scanning container images in CI — by the time an image reaches production, you should know every CVE in it and have accepted or mitigated each one.",
  ],
  debug_help: `**Trivy not finding vulnerabilities?**
\`\`\`bash
# Update vulnerability database
trivy image --download-db-only
# Scan with severity filter
trivy image --severity CRITICAL,HIGH nginx:latest
\`\`\`

**Pod won't start due to security context?**
\`\`\`yaml
# Add securityContext to fix common issues
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
  containers:
  - name: app
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
\`\`\`

**kube-bench job pending?**
\`\`\`bash
kubectl describe pod -l app=kube-bench
# Check if it needs node affinity for the control plane node
\`\`\``,
  ai_assist: `**Prompts that work:**
- "What is the worst Kubernetes RBAC misconfiguration? Walk me through how an attacker exploits it."
- "Write a Kubernetes NetworkPolicy that implements default-deny for all pods in the 'production' namespace, then allows ingress from pods with label 'tier=frontend' on port 8080."
- "Explain what a supply chain attack on a container image looks like. How does Docker Content Trust help?"
- "What Pod Security Standard settings prevent container escape? Map them to specific risk scenarios."`,
  stretch: [
    "Use the BishopFox bad-pods repository to run a privileged pod and attempt a container escape — document what you can access from the host.",
    "Scan a production Docker image you own with Trivy — fix all Critical findings by choosing a better base image.",
    "Implement a default-deny NetworkPolicy in a local Kind cluster and verify it blocks cross-namespace traffic.",
    "Complete the TryHackMe 'Kubernetes Security' or 'Container Security' rooms.",
  ],
});

// W15: DevSecOps — Security Throughout the SDLC
rewriteWeek("cybersecurity", 15, {
  context: `DevSecOps integrates security into every phase of the software development lifecycle — not as a gate at the end, but as a continuous practice. The goal: find and fix security issues as early as possible, when they are cheapest to fix.

The DevSecOps toolchain has four layers: SAST (Static Application Security Testing — analysing source code for vulnerabilities without executing it), DAST (Dynamic Application Security Testing — attacking a running app), SCA (Software Composition Analysis — finding vulnerable dependencies), and secrets scanning (finding leaked API keys, passwords).

This week you build a security-aware CI/CD pipeline that runs all four layers on every pull request. A developer should see security feedback in the same place they see test results — in their pull request, before merge.`,
  pre_flight: `**Tools to install/configure this week:**

SAST:
\`\`\`bash
# Semgrep (free, open-source)
pip install semgrep
semgrep --config=auto ./src
\`\`\`

SCA (dependency scanning):
\`\`\`bash
# npm audit (built-in)
npm audit
npm audit fix

# Snyk (free tier)
npm install -g snyk
snyk test
\`\`\`

Secrets scanning:
\`\`\`bash
# gitleaks
brew install gitleaks
gitleaks detect --source . --verbose
\`\`\`

DAST (against running app):
\`\`\`bash
# ZAP baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://your-app-url
\`\`\`

**GitHub Actions security workflow (save this):**
\`\`\`yaml
name: Security Scan
on: [pull_request]
jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Semgrep SAST
        uses: returntocorp/semgrep-action@v1
        with:
          config: auto
  sca:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
  secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
\`\`\``,
  mastery_questions: [
    "What is the difference between SAST and DAST? What types of vulnerabilities does each find that the other misses?",
    "What is software composition analysis? A dependency has CVSS 7.5 but you don't use the vulnerable function — what do you do?",
    "How do you prevent secrets from being committed to git? Name 3 controls (not just git hooks).",
    "What is the 'shift left' principle in DevSecOps? What is the cost difference between finding a bug in PR review vs production?",
    "Describe a complete DevSecOps pipeline for a Node.js web app — what runs at each stage from commit to production?",
  ],
  common_mistakes: [
    "Running security tools but ignoring the output — SAST findings that nobody acts on are worse than no SAST. Triage, assign, and track findings.",
    "Treating all SAST findings as bugs — SAST has high false positive rates. Every finding needs human review before it becomes a bug.",
    "Only scanning at release — scanning in CI on every PR catches issues before they accumulate. End-of-cycle security scans always find too much to fix.",
    "Not managing the vulnerability backlog — SCA will find hundreds of outdated dependencies. Triage by exploitability and exposure, not just CVSS score.",
    "Adding security gates that block deploys without team buy-in — security gates that block shipping create friction and get removed. Start with warnings, graduate to blocking only for Critical.",
  ],
  debug_help: `**Semgrep finding too many false positives?**
\`\`\`bash
# Use specific rulesets instead of auto
semgrep --config=p/owasp-top-ten ./src
# Suppress a specific finding
# Add comment: # nosemgrep: rule-id
\`\`\`

**npm audit exit code 1 breaking CI?**
\`\`\`bash
# Only fail on high+ severity
npm audit --audit-level=high
# Generate audit report without failing
npm audit --json > audit-report.json || true
\`\`\`

**gitleaks false positives?**
\`\`\`toml
# .gitleaks.toml — allowlist specific patterns
[allowlist]
  regexes = ['''MY_SAFE_PATTERN''']
  paths = ['''path/to/test/fixtures''']
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Write a GitHub Actions workflow that runs Semgrep SAST, npm audit, and gitleaks on every pull request."
- "What Semgrep rules should I run for a Node.js/Express application? List the most relevant ruleset IDs."
- "How do I integrate Snyk into a GitHub Actions CI pipeline and fail the build only on new Critical findings?"
- "What is SBOM and why do enterprises now require it? How do I generate one for a Node.js project?"`,
  stretch: [
    "Build a complete DevSecOps pipeline for one of your existing projects — SAST, SCA, secrets scanning, all in CI.",
    "Complete the OWASP DevSecOps Guideline reading: https://owasp.org/www-project-devsecops-guideline/",
    "Set up Dependabot on a GitHub repository and configure it to auto-merge patch updates.",
    "Run gitleaks on your entire git history (not just current files) and check if you have ever accidentally committed a secret.",
  ],
});

console.log("\nAll done — cybersecurity W11-W15 applied.");
