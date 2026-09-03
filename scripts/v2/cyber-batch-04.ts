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

// W16: Threat Modelling — Designing Security Before Code
rewriteWeek("cybersecurity", 16, {
  context: `Threat modelling is the practice of systematically identifying what can go wrong in a system before you build it. Done well, it shifts security from reactive (finding bugs after shipping) to proactive (designing them out before writing a line of code).

The most widely used methodology is STRIDE: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege. You apply STRIDE to a data flow diagram (DFD) of your system, identify threats at each trust boundary, and design mitigations.

This week you learn to draw DFDs, run STRIDE analysis, and produce a threat model document that engineers can act on. Threat modelling is a skill that makes you valuable at any seniority level — most teams do it poorly or not at all.`,
  pre_flight: `**Threat modelling tools (free):**
- OWASP Threat Dragon: https://owasp.org/www-project-threat-dragon/ (browser-based DFD tool)
- Microsoft Threat Modeling Tool: https://aka.ms/threatmodelingtool (Windows only)
- Draw.io: just use shapes to draw DFDs manually

**The 4 questions of threat modelling (Adam Shostack):**
1. What are we building? (DFD)
2. What can go wrong? (STRIDE)
3. What are we going to do about it? (mitigations)
4. Did we do a good enough job? (review)

**STRIDE categories:**
\`\`\`
Spoofing        → Authentication controls
Tampering       → Integrity controls (checksums, MACs, signatures)
Repudiation     → Audit logging, non-repudiation
Information Disclosure → Confidentiality controls (encryption, access control)
Denial of Service → Availability controls (rate limiting, redundancy)
Elevation of Privilege → Authorisation controls (RBAC, least privilege)
\`\`\`

**Data flow diagram elements:**
- Rectangle: external entity (user, third-party service)
- Circle/oval: process (your application code)
- Parallel lines: data store (database, file system, cache)
- Arrow: data flow
- Dashed line: trust boundary`,
  mastery_questions: [
    "Draw a DFD for a simple login flow (user → browser → web app → database) and apply STRIDE to the trust boundary between the browser and web app.",
    "What is a trust boundary? Give 3 examples of trust boundaries in a typical SaaS application.",
    "How is STRIDE different from OWASP Top 10? When would you use each?",
    "What is PASTA (Process for Attack Simulation and Threat Analysis) and how does it differ from STRIDE?",
    "A product manager says 'we don't have time for threat modelling'. How do you quantify the cost of skipping it?",
  ],
  common_mistakes: [
    "Making the DFD too granular — you don't need every function call. One process per logical component (auth service, payment service) is the right level.",
    "Only modelling the happy path — threat modelling must include error paths, retry logic, admin flows, and third-party integrations.",
    "Not assigning mitigations to owners — a threat model with no owner for each mitigation sits in a document forever. Every finding needs an owner and a deadline.",
    "Treating threat modelling as a one-time exercise — systems change. Re-run threat modelling whenever you add a new trust boundary, data store, or external integration.",
    "Confusing threats with vulnerabilities — a threat is 'attacker spoofs user identity', a vulnerability is 'no MFA on admin accounts'. Threats are abstract; vulnerabilities are specific.",
  ],
  debug_help: `**OWASP Threat Dragon won't load DFD?**
- Use the browser-based version at: https://www.threatdragon.com/
- Export your DFD as JSON for version control

**STRIDE analysis feeling mechanical?**
Apply these questions at each trust boundary:
1. Could an attacker pretend to be someone they're not? (Spoofing)
2. Could an attacker modify data in transit? (Tampering)
3. Could an action be denied later? (Repudiation)
4. Could an attacker read data they should not? (Information Disclosure)
5. Could an attacker make the system unavailable? (DoS)
6. Could an attacker gain more permissions than they have? (EoP)

**Threat model template:**
\`\`\`markdown
## Threat: [Name]
STRIDE category: Tampering
Affected component: Payment API
Description: An attacker in a MITM position modifies the transaction amount in transit.
Likelihood: Low (HTTPS in use)
Impact: High (financial loss)
Mitigation: Enforce TLS 1.2+, certificate pinning on mobile client, request signing.
Owner: Backend team
Due date: Q1 2026
\`\`\``,
  ai_assist: `**Prompts that work:**
- "I am building a SaaS app with: user auth, Stripe payments, file upload to S3, and a PostgreSQL database. Help me identify the main trust boundaries and apply STRIDE to each."
- "What is the difference between STRIDE and DREAD for threat modelling? When is DREAD useful?"
- "Review this threat model entry: [paste entry]. Is the mitigation sufficient? What am I missing?"
- "How do I integrate threat modelling into a 2-week sprint process without slowing down the team?"`,
  stretch: [
    "Build a complete threat model for one of your own projects using OWASP Threat Dragon — DFD plus STRIDE analysis.",
    "Read 'Threat Modeling: Designing for Security' by Adam Shostack (or the free resources on his site: shostack.org).",
    "Apply STRIDE to a well-known breach (Capital One, Equifax) and identify which threats materialised and which controls failed.",
    "Propose and run a threat modelling session for a feature in a personal project — document the output.",
  ],
});

// W17: Application Security — SAST, DAST, IAST
rewriteWeek("cybersecurity", 17, {
  context: `Application security (AppSec) is the discipline of making software secure. This week you go deeper into the testing methodologies: SAST (static analysis of code), DAST (dynamic testing of a running app), and IAST (instrumentation inside a running app that observes its own behaviour).

Each has different coverage: SAST finds code-level issues without running the app (good for injection, hardcoded secrets, insecure patterns); DAST attacks the running app from outside (good for auth issues, injection, misconfigurations); IAST sits inside the app and observes data flows at runtime (best coverage, highest complexity).

You also learn code review for security this week — how to manually review a pull request and identify security issues that no automated tool would catch, like broken business logic.`,
  pre_flight: `**SAST tools:**
\`\`\`bash
# Semgrep (free)
semgrep --config=p/nodejs-security ./src

# Bandit (Python)
pip install bandit && bandit -r ./app

# ESLint security plugins (JavaScript)
npm install --save-dev eslint-plugin-security
\`\`\`

**DAST tools:**
\`\`\`bash
# OWASP ZAP full scan
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  -t http://localhost:3000 -r zap-report.html

# Nuclei (template-based scanner)
brew install nuclei
nuclei -u http://localhost:3000 -t cves/
\`\`\`

**IAST:**
- Contrast Security Community Edition (free): https://www.contrastsecurity.com/
- Seeker by Synopsys (commercial)
- IAST requires a language agent installed in the running app

**Code review checklist (save this):**
- Input validation: is user input sanitised before use?
- Output encoding: is data encoded before rendering in HTML?
- Authentication: is every endpoint protected appropriately?
- Authorisation: does each action check the caller's permissions?
- Cryptography: is sensitive data encrypted at rest and in transit?
- Error handling: do error messages leak internal details?
- Dependencies: are third-party libraries up to date?`,
  mastery_questions: [
    "What is the difference between SAST, DAST, and IAST? Draw a simple diagram showing where in the SDLC each runs.",
    "You are reviewing a pull request. The code uses string concatenation to build a SQL query. What is the exact change you request and why?",
    "What is a false positive in SAST? What is a false negative? Which is more dangerous in a security context?",
    "Explain IAST instrumentation. How does it differ from DAST in terms of coverage and accuracy?",
    "What is a broken business logic vulnerability? Give an example that SAST and DAST would both miss.",
  ],
  common_mistakes: [
    "Running SAST and treating the output as ground truth — SAST tools are wrong often. Every finding needs manual confirmation.",
    "Only running DAST against the happy path — DAST needs to be authenticated and needs to cover every application feature, not just the home page.",
    "Skipping manual code review in favour of automated tools — tools miss business logic bugs, race conditions, and architectural flaws. Human review is irreplaceable.",
    "Not integrating tools into CI — security tools run once at audit time are not security. They must run continuously on every change.",
    "Fixing SAST findings without understanding why they are vulnerabilities — developers who don't understand the vulnerability will recreate it in a different form.",
  ],
  debug_help: `**Semgrep not matching expected patterns?**
\`\`\`bash
# Test a specific rule against a file
semgrep --config=my-rule.yaml test-file.js
# Use the online playground to test rules
# https://semgrep.dev/playground
\`\`\`

**ZAP DAST missing authenticated pages?**
\`\`\`bash
# Use ZAP with authentication configured
# Proxy through ZAP, log in manually, then export the session
# Or use ZAP's Form-Based Authentication in Spider settings
\`\`\`

**ESLint security plugin producing noise?**
\`\`\`json
// .eslintrc.json — turn off overly noisy rules
{
  "rules": {
    "security/detect-object-injection": "off"
  }
}
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Review this JavaScript function for security vulnerabilities: [paste code]. What are the issues and what is the correct fix?"
- "What Semgrep rules are most important for finding OWASP Top 10 vulnerabilities in a Node.js/Express app?"
- "Explain how Nuclei templates work. Write a simple Nuclei template that checks if a server leaks a stack trace in error responses."
- "What is the difference between encoding, escaping, and sanitising? Which is correct for preventing XSS?"`,
  stretch: [
    "Write 3 custom Semgrep rules for patterns that are specific security risks in your codebase.",
    "Perform a manual security code review of an open-source project and submit findings responsibly via their security disclosure policy.",
    "Complete PortSwigger's 'Advanced' labs for one vulnerability category — SQL injection, XSS, or SSRF.",
    "Read the Google Application Security blog for AppSec techniques used at scale.",
  ],
});

// W18: Software Supply Chain Security
rewriteWeek("cybersecurity", 18, {
  context: `The SolarWinds attack in 2020 compromised 18,000 organisations by injecting malicious code into a trusted software update. The Log4Shell vulnerability in 2021 affected millions of apps because they all used the same dependency. Supply chain security is now one of the top priorities in enterprise security.

Your application's attack surface is not just your code — it includes every npm package, Docker base image, CI/CD tool, and cloud provider you depend on. An attacker who compromises any of these can compromise you.

This week you learn: dependency pinning and verification, SBOM (Software Bill of Materials), signed commits and releases, provenance and reproducible builds, and how to use tools like Sigstore/cosign to cryptographically verify the software you consume.`,
  pre_flight: `**SBOM generation:**
\`\`\`bash
# CycloneDX for npm
npm install -g @cyclonedx/cyclonedx-npm
cyclonedx-npm --output-file sbom.json

# Syft for container images
brew install syft
syft nginx:latest -o cyclonedx-json > sbom.json
\`\`\`

**Sigstore/cosign — signing and verifying container images:**
\`\`\`bash
brew install cosign
# Sign an image (requires OIDC token)
cosign sign --key cosign.key your-registry/your-image:tag
# Verify a signed image
cosign verify --key cosign.pub your-registry/your-image:tag
\`\`\`

**Dependency pinning in package.json:**
\`\`\`json
{
  "dependencies": {
    "express": "4.18.2"
  }
}
\`\`\`
Pinning to exact versions + using npm ci (not npm install) in CI ensures reproducibility.

**GitHub commit signing:**
\`\`\`bash
git config --global commit.gpgsign true
git config --global user.signingkey YOUR_GPG_KEY_ID
# Or use SSH signing (simpler)
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
\`\`\``,
  mastery_questions: [
    "What is a software supply chain attack? Describe the SolarWinds attack mechanism in 3 sentences.",
    "What is an SBOM? Who needs it and why? What format is most commonly used?",
    "What is the difference between dependency pinning and integrity checking? Why do you need both?",
    "Explain how Sigstore/cosign enables keyless signing. What does a signature prove?",
    "What is a typosquatting attack in the context of package registries? Give an example.",
  ],
  common_mistakes: [
    "Using ^ or ~ version specifiers in production — these allow minor/patch version float. A malicious patch release can get pulled automatically.",
    "Not locking your lock files in CI — run npm ci (not npm install) in CI. npm ci requires package-lock.json and fails if it is inconsistent.",
    "Trusting popular packages without scrutiny — high download counts do not mean secure. Popular packages are high-value targets for supply chain attacks.",
    "Not auditing transitive dependencies — a direct dependency that is secure can depend on a transitive dependency that is not. SCA tools check the full tree.",
    "Not rotating build tool credentials — CI secrets (npm tokens, Docker Hub credentials) are high-value targets. Rotate them regularly and scope them minimally.",
  ],
  debug_help: `**cosign verify failing?**
\`\`\`bash
# Check the signature exists
cosign triangulate your-image:tag
# Verify with transparency log
cosign verify --certificate-identity your@email.com \
  --certificate-oidc-issuer https://github.com/login/oauth \
  your-registry/your-image:tag
\`\`\`

**npm ci failing in CI?**
\`\`\`bash
# Ensure package-lock.json is committed
git add package-lock.json && git commit -m "add lockfile"
# If lock file is out of sync
npm install && git add package-lock.json
\`\`\`

**SBOM not including all dependencies?**
\`\`\`bash
# Include dev dependencies
cyclonedx-npm --include-dev-dependencies --output-file sbom.json
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Explain the difference between SLSA levels 1, 2, and 3 for software supply chain security. What does each level require?"
- "How does the dependency confusion attack work? How do I protect my private npm packages from it?"
- "What is reproducible builds? Why does it matter for supply chain security?"
- "Write a GitHub Actions workflow that generates an SBOM for a Node.js project and attaches it to a release."`,
  stretch: [
    "Generate an SBOM for one of your projects and use it to identify any vulnerable transitive dependencies.",
    "Set up cosign to sign your Docker images in GitHub Actions using GitHub OIDC (keyless signing).",
    "Read the SLSA framework: https://slsa.dev/ — understand what Level 3 supply chain security requires.",
    "Research the 2024 XZ Utils backdoor — understand how the attacker gained trust and what artefacts they left.",
  ],
});

// W19: Compliance — SOC2, ISO27001, GDPR
rewriteWeek("cybersecurity", 19, {
  context: `Compliance is how organisations demonstrate their security posture to customers, regulators, and auditors. It is not security itself — a fully compliant organisation can still be breached. But compliance frameworks (SOC 2, ISO 27001, GDPR) encode security best practices that, when implemented honestly, meaningfully reduce risk.

For a security engineer, understanding compliance is essential because it translates business requirements into technical controls. An enterprise customer saying 'do you have SOC 2 Type II?' means 'can you prove your security controls have operated continuously for at least 6 months?'

This week you learn the major frameworks, how to map your technical controls to compliance requirements, and how to prepare for and support an audit.`,
  pre_flight: `**Framework summaries to read:**

SOC 2 (US, for SaaS):
- 5 Trust Service Criteria: Security, Availability, Processing Integrity, Confidentiality, Privacy
- Type I: controls exist at a point in time
- Type II: controls operated effectively for 6-12 months
- Common controls: access management, encryption, logging, vulnerability management

ISO 27001 (international):
- Information Security Management System (ISMS)
- 93 controls across 4 themes: Organisational, People, Physical, Technological
- Requires annual audit + certification body

GDPR (EU, for any company handling EU personal data):
- Lawful basis for processing
- Data subject rights (access, deletion, portability)
- Privacy by design and default
- 72-hour breach notification to regulator
- DPA (Data Processing Agreement) with sub-processors

**Free resource:**
SOC 2 Academy by Drata: https://drata.com/resources/soc-2-academy
Vanta's compliance guides: https://www.vanta.com/resources`,
  mastery_questions: [
    "What is the difference between SOC 2 Type I and Type II? Which does an enterprise customer typically require?",
    "A user emails you requesting their data be deleted under GDPR. Walk me through what you must do and in what timeframe.",
    "Map these technical controls to SOC 2 Trust Service Criteria: MFA, backup encryption, access logs, security training.",
    "What is a RACI chart in a compliance context? Why does every control need an owner?",
    "Your company is moving from startup to enterprise sales. Which compliance framework should you pursue first and why?",
  ],
  common_mistakes: [
    "Treating compliance as the goal instead of security — passing an audit by ticking boxes does not protect your users. Implement controls because they work, not because they are required.",
    "Not having a written policy for every control — compliance auditors ask for evidence. A technical control without a documented policy is an audit finding.",
    "Scoping SOC 2 too broadly — only the systems that handle customer data are in scope. Over-scoping makes audits expensive and long.",
    "Ignoring vendor compliance — your subprocessors must also be compliant. Review their SOC 2 reports before signing contracts.",
    "Not logging compliance events — access grants, privilege escalation, configuration changes, and security events must be logged in a tamper-proof system.",
  ],
  debug_help: `**Mapping controls to SOC 2 criteria:**
\`\`\`
CC6.1 (Logical Access): MFA, SSO, access review, off-boarding process
CC6.2 (System Access): provisioning/de-provisioning workflows, role-based access
CC7.1 (Change Management): code review process, staging environment, approval workflows
CC7.2 (System Monitoring): logging, alerting, SIEM, vulnerability scanning
CC9.2 (Risk Assessment): threat modelling, penetration testing, vendor security reviews
\`\`\`

**GDPR Article 30 — Records of processing activities (required):**
Document for each processing activity:
- What data you process
- Why (lawful basis)
- Where it is stored and for how long
- Who can access it

**SOC 2 audit evidence types:**
- Screenshots (point-in-time evidence)
- Log exports (operational evidence)
- Policy documents (written evidence)
- Automated evidence from compliance platforms (Vanta, Drata, Secureframe)`,
  ai_assist: `**Prompts that work:**
- "What are the SOC 2 Type II controls that a SaaS startup should implement in year 1? List them with priority."
- "Help me write a data retention policy that satisfies GDPR requirements for a B2B SaaS storing EU customer data."
- "What is the difference between GDPR and CCPA? Which applies to a company based in The Gambia that has EU customers?"
- "What technical controls does ISO 27001 Annex A require for access management?"`,
  stretch: [
    "Download a real SOC 2 Type II report (many companies publish them on request) and read the trust service criteria and test descriptions.",
    "Map your personal or side-project infrastructure against SOC 2 Security criteria — what gaps do you have?",
    "Write a GDPR-compliant privacy policy for a hypothetical SaaS app using a template as a starting point.",
    "Research what a Data Processing Agreement (DPA) must contain and find a sample DPA from a major vendor (AWS, Stripe, etc.).",
  ],
});

// W20: Identity, Access, and Zero Trust
rewriteWeek("cybersecurity", 20, {
  context: `Zero Trust is the modern security architecture principle: never trust, always verify. It rejects the old perimeter model (trust everything inside the network) and replaces it with: authenticate and authorise every request, every time, regardless of network location.

The practical implementation of Zero Trust involves: strong identity verification (MFA, hardware keys), device health checks, least-privilege access, micro-segmentation (network policies that limit lateral movement), and continuous monitoring. Every access decision is made based on identity + device health + context, not IP address.

This week you learn Zero Trust architecture principles, how to implement them with tools like Tailscale (mesh VPN), Cloudflare Access (identity-aware proxy), and how to design access control systems that are both secure and usable.`,
  pre_flight: `**Zero Trust tools (free tier or open-source):**

Tailscale (mesh VPN, free for personal use):
\`\`\`bash
# Install
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
# Every device gets a Tailscale IP, accessible from anywhere
\`\`\`

Cloudflare Access (Zero Trust proxy, free tier):
- Protects internal apps with identity verification
- Dashboard at: https://one.dash.cloudflare.com/

HashiCorp Vault (secrets management with identity-based access):
\`\`\`bash
docker run --rm -p 8200:8200 --cap-add=IPC_LOCK vault server -dev
export VAULT_ADDR='http://127.0.0.1:8200'
vault status
\`\`\`

**Zero Trust principles (NIST SP 800-207):**
1. All data sources and computing services are resources
2. All communication is secured regardless of network location
3. Access to individual resources is granted per-session
4. Access is determined by dynamic policy
5. No device is inherently trusted
6. All resource authentication and authorization is dynamic
7. Collect data to improve security posture`,
  mastery_questions: [
    "Explain the Zero Trust principle 'never trust, always verify'. How does it differ from the perimeter security model?",
    "What is the difference between authentication and authorisation? Give a specific example of each failing independently.",
    "What is SAML and how does it enable Single Sign-On? When would you choose SAML over OIDC?",
    "How does Cloudflare Access implement Zero Trust for an internal web application? What does the access flow look like?",
    "Explain RBAC vs ABAC. Give an example scenario where ABAC is necessary because RBAC is insufficient.",
  ],
  common_mistakes: [
    "Treating VPN as Zero Trust — a VPN places a user on the internal network. Zero Trust requires per-resource authentication even on the internal network. They are different things.",
    "Over-relying on passwords — passwords are not strong authentication. MFA is the minimum; hardware keys (FIDO2/WebAuthn) are better for privileged access.",
    "Broad group membership instead of least privilege — users accumulate permissions over time. Regular access reviews remove permissions that are no longer needed.",
    "Not auditing service account permissions — service accounts often have wider access than needed and are rarely rotated. Treat them like privileged human accounts.",
    "Implementing Zero Trust in one layer only — network-level Zero Trust without application-level authorisation is incomplete. Both layers must verify identity.",
  ],
  debug_help: `**Tailscale device not appearing in admin console?**
\`\`\`bash
# Re-authenticate the device
sudo tailscale up --reset
# Check Tailscale status
tailscale status
\`\`\`

**Cloudflare Access blocking legitimate users?**
- Check Access policies — are they set to 'Allow' or 'Block'?
- Review Access logs in the Cloudflare dashboard
- Test with the bypass rule for specific email domains during setup

**Vault not accepting token?**
\`\`\`bash
# Check token validity
vault token lookup
# Re-login
vault login token=<your-token>
# List auth methods
vault auth list
\`\`\``,
  ai_assist: `**Prompts that work:**
- "Design a Zero Trust architecture for a 20-person remote company that needs access to internal tools without a traditional VPN."
- "What is the difference between JWT and SAML for SSO? Which should a modern SaaS app use for enterprise customers?"
- "Explain FIDO2/WebAuthn. How does it prevent phishing compared to TOTP codes?"
- "What does a Cloudflare Access policy look like that allows only users with @company.com Google accounts and a managed device?"`,
  stretch: [
    "Set up Tailscale on your home network and access a service on your desktop from your phone without opening any firewall ports.",
    "Implement Cloudflare Access in front of a personal web app — configure Google OAuth as the identity provider.",
    "Read NIST SP 800-207 (Zero Trust Architecture) — understand the logical components of a ZTA.",
    "Map a real enterprise breach to a Zero Trust failure — which principle was violated and what control would have prevented it?",
  ],
});

console.log("\nAll done — cybersecurity W16-W20 applied.");
