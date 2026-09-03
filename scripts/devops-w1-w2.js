const path = require('path');
const fs = require('fs');
const FILE = path.join(__dirname, '..', 'data', 'roadmaps', 'devops-cloud.json');
const d = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const L = (title, body) => ({ kind: 'lesson', title, body });
const SW = (cards) => ({ kind: 'swipe', title: 'Quick check — swipe to answer', cards });

// ── Per-day teaching content (lesson + swipe). Keyed by week.day ──
// Existing videos/readings/exercises are preserved; we PREPEND a lesson and
// INSERT a swipe immediately before the first exercise on each day.

const TEACH = {
  // ===== WEEK 1 — Edge Portfolio v0.1: S3 + CloudFront via Terraform =====
  '1.1': {
    lesson: L("What 'the cloud' and infrastructure-as-code actually are",
"## What it is\n" +
"'The cloud' is someone else's computers, rented by the minute, controlled over an API. AWS owns the data centres; you rent a slice and pay only for what you use. There is no physical machine you touch — you describe what you want and AWS provisions it.\n\n" +
"**Infrastructure as Code (IaC)** is the practice of declaring that infrastructure in text files instead of clicking through a web console. You write a file that says 'I want an S3 bucket and a CloudFront distribution', and a tool (Terraform) makes reality match the file.\n\n" +
"## Why it matters\n" +
"Clicking around the AWS console works once. But you cannot review a click, diff a click, or roll back a click. With IaC:\n" +
"- The infra is **version-controlled** — every change is a git commit\n" +
"- It is **reproducible** — `terraform apply` rebuilds the exact same stack on a fresh account\n" +
"- It is **reviewable** — a teammate reads the diff before it ships\n\n" +
"## Where this fits in Edge Portfolio\n" +
"This week you ship Edge Portfolio v0.1: a real portfolio page, served worldwide over HTTPS from AWS S3 + CloudFront, with every piece of infrastructure declared in Terraform. By Sunday it is live at a public URL and the Terraform code is on your GitHub — your first infrastructure artifact."
    ),
    swipe: SW([
      { prompt: "Infrastructure-as-code means clicking through the AWS console carefully and writing down each step.", answer: false, whenRight: "Right — IaC means DECLARING infra in text files a tool applies, not documenting manual clicks.", whenWrong: "IaC replaces the clicking entirely. You write the desired state in a file; Terraform makes reality match it.", sim: "# IaC: declare it\nresource 'aws_s3_bucket' 'site' {\n  bucket = 'my-site'\n}" },
      { prompt: "A key benefit of IaC is that infrastructure changes can be version-controlled and code-reviewed like any code.", answer: true, whenRight: "Exactly — every infra change becomes a git diff a teammate can review before it ships.", whenWrong: "That is the core benefit. IaC turns infra into reviewable, diffable, rollback-able text.", sim: "git diff infra/main.tf\n# +  aws_cloudfront_distribution added\n# reviewable before apply" },
      { prompt: "With the cloud, you must buy and rack a physical server before you can run anything.", answer: false, whenRight: "Right — the cloud is rented compute. No hardware to buy; you provision over an API in seconds.", whenWrong: "The whole point of cloud is no physical hardware. You rent a slice over an API and pay by usage." }
    ])
  },
  '1.2': {
    lesson: L("The shell, the filesystem, and why the terminal is the DevOps cockpit",
"## What it is\n" +
"The **shell** is a text interface to your operating system. You type a command, it runs, it prints output. Every server you will ever manage in this track has no graphical interface — the shell is the only way in.\n\n" +
"The handful of commands that do 90% of the work:\n\n" +
"```bash\n" +
"pwd                 # print working directory — where am I?\n" +
"ls                  # list files here\n" +
"cd edge-portfolio   # change directory\n" +
"mkdir infra         # make a directory\n" +
"cat index.html      # print a file's contents\n" +
"```\n\n" +
"## Why it matters\n" +
"A web page is just a text file (`index.html`) that a server hands to a browser. Before you can deploy one, you need to (a) navigate a filesystem from the keyboard and (b) create that file. Both happen in the shell. Today you set up a working terminal and hand-write the portfolio page you will host all week.\n\n" +
"## The mental model for HTML\n" +
"`index.html` is the default file a web server serves when someone visits `/`. It is plain text with tags. The browser reads the tags and paints the page. That is the entire contract — no magic."
    ),
    swipe: SW([
      { prompt: "`pwd` tells you which directory you are currently in.", answer: true, whenRight: "Right — 'print working directory'. Your first move whenever you feel lost in the filesystem.", whenWrong: "pwd = print working directory. It answers 'where am I?' — run it any time you're unsure.", sim: "$ pwd\n/home/you/Desktop/edge-portfolio" },
      { prompt: "`index.html` is special: web servers serve it by default when a visitor requests the root path `/`.", answer: true, whenRight: "Exactly — `/` maps to `index.html` by convention. That is why the file is named that.", whenWrong: "It is the convention. A request for `/` is served `index.html` unless configured otherwise.", sim: "GET /  ->  serves index.html" },
      { prompt: "You need a graphical file manager to create an HTML file — it cannot be done from the terminal.", answer: false, whenRight: "Right — the terminal (or a code editor) creates files directly. No GUI required, ever.", whenWrong: "Files are created from the shell or an editor constantly. The GUI is optional; the terminal is not." }
    ])
  },
  '1.3': {
    lesson: L("AWS accounts, the root user, IAM, and not getting a surprise bill",
"## What it is\n" +
"An **AWS account** is your tenancy in Amazon's cloud. It comes with one all-powerful **root user** (your signup email). The first rule of AWS: **lock the root user away and never use it for daily work.** Instead you create an **IAM user** — a scoped identity for everyday tasks.\n\n" +
"**IAM (Identity and Access Management)** is how AWS decides who can do what. A user has credentials (an Access Key ID + Secret) and policies (permissions). Your CLI authenticates as this IAM user.\n\n" +
"## Why it matters — two ways beginners get burned\n" +
"1. **A leaked root key = full account compromise.** Attackers scan GitHub for committed AWS keys and spin up crypto miners within minutes. MFA on root + an IAM user for daily work is the defence.\n" +
"2. **A surprise bill.** A misconfigured resource can quietly run up charges. A **billing alarm** emails you the moment estimated charges cross a threshold (set it at $5). This is non-negotiable on a learner account.\n\n" +
"## Where this fits\n" +
"Today you create the account, enable MFA, set the billing alarm, create the `forge-dev` IAM user, and configure the AWS CLI. Everything Terraform does this week authenticates as that IAM user."
    ),
    swipe: SW([
      { prompt: "You should use the AWS root user for all your daily Terraform work.", answer: false, whenRight: "Right — never. Lock root behind MFA and use a scoped IAM user for everything.", whenWrong: "Never use root for daily work. Create an IAM user (forge-dev). Root is for emergencies only.", sim: "aws sts get-caller-identity\n# should show forge-dev IAM ARN,\n# NOT the root user" },
      { prompt: "A billing alarm emails you when estimated AWS charges cross a threshold you set.", answer: true, whenRight: "Exactly — set it at $5 on a learner account. It is your early-warning system against a runaway bill.", whenWrong: "That is what it does. Set the threshold low ($5). It is the first thing to configure on any new account." },
      { prompt: "Committing an AWS Access Key to a public GitHub repo is harmless as long as you delete it later.", answer: false, whenRight: "Right — it's already too late. Bots scan GitHub continuously and exploit keys within minutes of the push.", whenWrong: "Automated scanners find committed keys in minutes. Deleting later doesn't undo the compromise. Never commit keys.", sim: "# .gitignore must include:\n*.tfstate   # may contain secrets\n.env" }
    ])
  },
  '1.4': {
    lesson: L("Terraform: providers, resources, and the init / plan / apply loop",
"## What it is\n" +
"**Terraform** is the IaC tool you'll use all track. You write `.tf` files describing the desired state; Terraform figures out the API calls to make it real. Three concepts:\n\n" +
"- **Provider** — the plugin that talks to a specific cloud (here, `aws`). You declare it once.\n" +
"- **Resource** — one thing you want to exist (`aws_s3_bucket`, `aws_cloudfront_distribution`). Each has a type, a local name, and a config block.\n" +
"- **State** — Terraform's record of what it has already created, so it knows what to change next time.\n\n" +
"## The core loop\n" +
"```bash\n" +
"terraform init    # download the provider plugin (once per project)\n" +
"terraform plan    # preview: what WILL change, before anything happens\n" +
"terraform apply   # execute the plan after you type 'yes'\n" +
"```\n\n" +
"`plan` is the safety rail — it shows you 'Plan: 1 to add, 0 to change, 0 to destroy' so you confirm intent before touching reality.\n\n" +
"## Where this fits\n" +
"Today you create your first real resource: an S3 bucket, declared in `main.tf` and applied. S3 bucket names are **globally unique** across all of AWS — yours must be a name no one else has used."
    ),
    swipe: SW([
      { prompt: "`terraform plan` previews what will change WITHOUT modifying any real infrastructure.", answer: true, whenRight: "Right — plan is read-only. It is your safety check before apply touches anything.", whenWrong: "plan is a dry run. Nothing changes until you run apply and type 'yes'. Always read the plan first.", sim: "$ terraform plan\nPlan: 1 to add, 0 to change, 0 to destroy." },
      { prompt: "S3 bucket names only need to be unique within your own AWS account.", answer: false, whenRight: "Right — they are GLOBALLY unique across all of AWS. Pick a name no one on earth has used.", whenWrong: "Bucket names are globally unique across all AWS accounts worldwide. Add your name + a year to be safe.", sim: "bucket = 'jane-edge-portfolio-2026'\n# must be unique on all of AWS" },
      { prompt: "You must run `terraform init` before `terraform apply` in a new project.", answer: true, whenRight: "Right — init downloads the provider plugin. apply fails without it on a fresh project.", whenWrong: "init comes first — it fetches the aws provider. Without it, Terraform doesn't know how to talk to AWS.", sim: "terraform init   # downloads aws provider\nterraform apply  # now it can run" }
    ])
  },
  '1.5': {
    lesson: L("CloudFront, CDNs, and serving a static site fast + private",
"## What it is\n" +
"**S3** stores your files. **CloudFront** is AWS's **CDN (Content Delivery Network)** — a global fleet of edge servers that cache your content close to users. A visitor in Tokyo hits a Tokyo edge node, not your bucket's home region. Result: fast loads everywhere.\n\n" +
"Two pieces make this secure and correct:\n" +
"- **Origin Access Identity (OAI)** — lets CloudFront read your S3 bucket while keeping the bucket itself **private**. Users can only reach files through CloudFront, never the raw bucket URL.\n" +
"- **`viewer_protocol_policy = redirect-to-https`** — anyone arriving over HTTP is bounced to HTTPS automatically.\n\n" +
"## Why it matters\n" +
"Serving straight from a public S3 bucket is slow (one region) and exposes the bucket. The S3 + CloudFront + OAI pattern is the industry-standard way to host a static site: fast, private origin, HTTPS by default. You'll reuse this exact pattern for years.\n\n" +
"## Where this fits\n" +
"Today `main.tf` grows from one bucket to the full stack: bucket + OAI + bucket policy + CloudFront distribution, with an `output` that prints your live `https://...cloudfront.net` URL. CloudFront takes 5-10 minutes to deploy globally — that wait is normal."
    ),
    swipe: SW([
      { prompt: "A CDN like CloudFront speeds up your site by caching content on edge servers near users.", answer: true, whenRight: "Right — a visitor hits the nearest edge node, not your origin region. That's the whole point of a CDN.", whenWrong: "That is exactly what a CDN does. Edge caching means a user in Tokyo loads from Tokyo, not Virginia.", sim: "User (Tokyo) -> CloudFront edge (Tokyo)\n# fast, cached — origin untouched" },
      { prompt: "An Origin Access Identity (OAI) lets you keep the S3 bucket private while CloudFront still serves it.", answer: true, whenRight: "Exactly — OAI is the bridge. Bucket stays private; only CloudFront can read it.", whenWrong: "OAI is what keeps the bucket private. CloudFront reads via OAI; the public can't hit the raw bucket URL.", sim: "Public -> CloudFront -> (OAI) -> private S3\n# raw bucket URL: access denied" },
      { prompt: "CloudFront distributions deploy instantly — if your URL 404s right after apply, something is broken.", answer: false, whenRight: "Right — global deploy takes 5-10 minutes. A brief 404 right after apply is expected; wait it out.", whenWrong: "CloudFront takes 5-10 min to propagate to all edges. An immediate 404 is normal — give it time before debugging." }
    ])
  },
  '1.6': {
    lesson: L("Git, .gitignore, and why Terraform state must never be committed",
"## What it is\n" +
"Today the **Terraform code itself** becomes a portfolio piece on GitHub. But not every file belongs in git. Terraform produces local files you must **exclude**:\n\n" +
"```text\n" +
".terraform/            # downloaded provider binaries (huge)\n" +
"*.tfstate              # the state file — may contain secrets\n" +
"*.tfstate.backup\n" +
".terraform.lock.hcl    # (often committed; fine either way for solo)\n" +
"```\n\n" +
"## Why it matters\n" +
"The **state file** (`terraform.tfstate`) records what Terraform created — and can contain sensitive values (resource IDs, sometimes secrets). Committing it to a public repo leaks information and creates merge conflicts on teams. The `.gitignore` is what keeps it out.\n\n" +
"A good **README** turns raw `.tf` files into a story a recruiter understands: what it builds, the live URL, the cost, and how someone forks and deploys it themselves. The README is the difference between 'some config files' and 'a portfolio piece'.\n\n" +
"## Where this fits\n" +
"Today you add `.gitignore`, write the README, and push Edge Portfolio's infrastructure to a public GitHub repo. The repo — not just the live site — is the deliverable."
    ),
    swipe: SW([
      { prompt: "Terraform state files (*.tfstate) should be added to .gitignore and never committed to a public repo.", answer: true, whenRight: "Right — state can contain secrets and resource IDs. Keep it out of git, especially public repos.", whenWrong: "State files can leak secrets and cause team conflicts. Always .gitignore *.tfstate.", sim: "# .gitignore\n*.tfstate\n*.tfstate.backup\n.terraform/" },
      { prompt: "A README that explains what the project builds, its cost, and how to deploy it makes the repo a real portfolio piece.", answer: true, whenRight: "Exactly — the README turns config files into a story a recruiter can follow and trust.", whenWrong: "The README is what communicates value. Without it, even great IaC looks like noise to a reviewer." },
      { prompt: "Committing the `.terraform/` directory is good practice because it makes the repo self-contained.", answer: false, whenRight: "Right — it holds large downloaded provider binaries. `terraform init` re-fetches them; never commit it.", whenWrong: "Never commit .terraform/ — it's big downloaded binaries. Anyone who clones runs `terraform init` to get them." }
    ])
  },
  '1.7': {
    lesson: L("Idempotency: the destroy + redeploy test that proves your IaC works",
"## What it is\n" +
"The real test of infrastructure-as-code is not 'does the site load?' — it is **'can I wipe everything and rebuild it identically from the code alone?'**\n\n" +
"```bash\n" +
"terraform destroy   # tear down every resource in state\n" +
"terraform apply     # rebuild it all from main.tf\n" +
"```\n\n" +
"If your site comes back identical after a full destroy + redeploy, your IaC is **complete** — nothing important lives only in your memory or in a manual console click.\n\n" +
"## Why it matters — idempotency\n" +
"**Idempotent** means running the same operation repeatedly gives the same result. Good infrastructure code is idempotent: `apply` on an unchanged file changes nothing; a destroy + apply reproduces the exact stack. This is what lets teams rebuild a region after an outage, spin up identical staging environments, and trust that the code IS the system.\n\n" +
"If something breaks during the rebuild, you found a gap in your code — a manual step you forgot to capture. Finding it now, on a portfolio project, is far cheaper than finding it during a real incident.\n\n" +
"## Where this fits\n" +
"Today you destroy Edge Portfolio entirely, redeploy it from the Terraform code, and confirm the live URL works again. That round-trip is the proof that closes v0.1."
    ),
    swipe: SW([
      { prompt: "Running `terraform destroy` then `terraform apply` should rebuild your infrastructure identically if your IaC is complete.", answer: true, whenRight: "Right — that round-trip is the proof. If it rebuilds identically, nothing lives outside your code.", whenWrong: "That is the test of complete IaC. If the rebuild matches, your code IS the system — no hidden manual steps.", sim: "terraform destroy   # all gone\nterraform apply     # back, identical" },
      { prompt: "'Idempotent' means running the same apply twice on an unchanged file makes a second set of changes.", answer: false, whenRight: "Right — the opposite. Idempotent means a second apply on an unchanged file changes NOTHING.", whenWrong: "Idempotent means repeating the operation has no extra effect. apply on an unchanged file = 'No changes'.", sim: "$ terraform apply\nNo changes. Infrastructure is up-to-date." },
      { prompt: "If the redeploy breaks, it usually means you did a manual step that never made it into the Terraform code.", answer: true, whenRight: "Exactly — a broken rebuild exposes a gap: something you clicked once but never codified.", whenWrong: "A failed rebuild is a feature — it reveals the manual step you forgot to capture in code. Fix it now." }
    ])
  },

  // ===== WEEK 2 — Edge Portfolio v0.2: Custom domain + HTTPS =====
  '2.1': {
    lesson: L("Domains, registrars, and what you're actually buying",
"## What it is\n" +
"A **domain name** (yourname.com) is a human-readable address that points to your infrastructure. You don't *own* a domain forever — you **lease** it, usually yearly, from a **registrar** (Namecheap, Cloudflare, etc.) who is accredited to sell names under a TLD (.com, .dev, .io).\n\n" +
"## Why it matters\n" +
"Users navigate to names, not IP addresses or `random123.cloudfront.net` URLs. A custom domain is what makes Edge Portfolio feel like a real product instead of a demo. It is also the foundation everything else this week builds on — HTTPS certificates are issued *for a domain*, so you need the domain first.\n\n" +
"## Choosing well\n" +
"- Keep it short and spellable (someone will type it from a business card)\n" +
"- `.com` is still the most trusted; `.dev` and `.io` are fine for engineers\n" +
"- Budget ~$10-15/year. Beware $1 first-year deals that renew at $40\n\n" +
"## Where this fits\n" +
"Today you buy one real domain for Edge Portfolio. Every remaining day this week — DNS, the TLS certificate, the HTTPS redirect — attaches to this name."
    ),
    swipe: SW([
      { prompt: "When you 'buy' a domain you are actually leasing it, typically renewed yearly through a registrar.", answer: true, whenRight: "Right — domains are annual leases via an accredited registrar, not permanent purchases.", whenWrong: "You lease it yearly. Stop paying the registrar and the name returns to the pool. Watch auto-renew." },
      { prompt: "You need a working domain before you can get a TLS/HTTPS certificate for it.", answer: true, whenRight: "Exactly — certificates are issued FOR a domain. The Certificate Authority verifies you control the name.", whenWrong: "The domain comes first. A cert authority issues a certificate only after you prove control of that domain." },
      { prompt: "A '$1 first year' domain deal always costs $1/year going forward.", answer: false, whenRight: "Right — check the RENEWAL price. Cheap-first-year domains often renew at $30-40/year.", whenWrong: "The first-year price is a hook. Always read the renewal price — it's frequently many times higher." }
    ])
  },
  '2.2': {
    lesson: L("DNS, nameservers, and pointing your domain at AWS Route 53",
"## What it is\n" +
"**DNS (Domain Name System)** is the internet's phone book: it translates a name (yourdomain.com) into the address of whatever should answer (here, your CloudFront distribution). The authoritative source for your domain's records is a set of **nameservers**.\n\n" +
"**Route 53** is AWS's DNS service. To let AWS answer for your domain, you:\n" +
"1. Create a **hosted zone** for yourdomain.com in Route 53 → it gives you 4 nameservers\n" +
"2. Go to your registrar and replace its default nameservers with those 4\n\n" +
"From then on, the world asks Route 53 for your domain's records.\n\n" +
"## Why it matters — propagation\n" +
"Nameserver changes don't take effect instantly. Resolvers around the world cache the old answer until it expires. This **propagation** can take 5-60 minutes (sometimes longer). You verify it with `dig`:\n\n" +
"```bash\n" +
"dig NS yourdomain.com\n" +
"# should list the 4 Route 53 nameservers\n" +
"```\n\n" +
"## Where this fits\n" +
"Today you create the hosted zone and repoint your registrar's nameservers to Route 53. This is the switch that hands DNS control to AWS, so Terraform can manage your records next."
    ),
    swipe: SW([
      { prompt: "DNS translates a human-readable domain name into the address of the server that should answer.", answer: true, whenRight: "Right — it's the internet's phone book: name in, address out.", whenWrong: "That's DNS in one line: it maps yourdomain.com to wherever requests should go (e.g. CloudFront).", sim: "dig yourdomain.com\n# -> points to CloudFront" },
      { prompt: "Changing your domain's nameservers takes effect instantly worldwide.", answer: false, whenRight: "Right — propagation takes 5-60 min as cached records expire across global resolvers.", whenWrong: "Nameserver changes propagate over minutes to an hour. Resolvers cache the old answer until its TTL expires.", sim: "$ dig NS yourdomain.com\n# wait until it lists the\n# Route 53 nameservers" },
      { prompt: "A Route 53 hosted zone gives you nameservers that you then set at your domain registrar.", answer: true, whenRight: "Exactly — create the zone, copy its 4 NS records to the registrar. That hands DNS to AWS.", whenWrong: "That's the flow: hosted zone -> 4 nameservers -> paste them at the registrar. Now AWS answers for your domain." }
    ])
  },
  '2.3': {
    lesson: L("TLS certificates, Certificate Authorities, and AWS ACM",
"## What it is\n" +
"**HTTPS** is HTTP wrapped in **TLS** encryption. For a browser to trust the encryption, your server presents a **certificate** signed by a **Certificate Authority (CA)** the browser already trusts. The cert proves 'this server really is yourdomain.com'.\n\n" +
"**ACM (AWS Certificate Manager)** issues these certificates **free** and renews them automatically. You request a cert for yourdomain.com (and www.yourdomain.com), and ACM proves you own the domain via **DNS validation** — it asks you to add a special record (which it can auto-create in Route 53), then confirms it's there.\n\n" +
"## Why it matters\n" +
"- Browsers mark plain HTTP as 'Not Secure' and Google ranks it lower\n" +
"- Auto-renewal means you never get paged at 2am for an expired cert (a classic outage)\n" +
"- CloudFront requires the ACM cert to be in **us-east-1** specifically — a detail that trips up everyone once\n\n" +
"## Where this fits\n" +
"Today you request a free ACM certificate (in us-east-1!) for your domain, validated via DNS through the Route 53 zone you created yesterday. Tomorrow you attach it to CloudFront."
    ),
    swipe: SW([
      { prompt: "A TLS certificate signed by a trusted Certificate Authority is what lets browsers show the padlock for HTTPS.", answer: true, whenRight: "Right — the browser trusts the CA, the CA vouches for your domain, so the padlock appears.", whenWrong: "That's the chain of trust: CA signs your cert, browser trusts the CA, padlock shows. No trusted cert = no padlock." },
      { prompt: "An ACM certificate used with CloudFront must be requested in the us-east-1 region.", answer: true, whenRight: "Right — CloudFront only reads certs from us-east-1. Request it there even if everything else is elsewhere.", whenWrong: "CloudFront requires the cert in us-east-1, full stop. This catches everyone once — remember it.", sim: "# ACM region for CloudFront:\n# always us-east-1" },
      { prompt: "AWS ACM certificates are expensive and must be manually renewed every 90 days.", answer: false, whenRight: "Right — ACM certs are free AND auto-renew. No 90-day scramble, no cost.", whenWrong: "ACM is free and renews automatically. The manual-90-day pain is Let's Encrypt-by-hand, not ACM." }
    ])
  },
  '2.4': {
    lesson: L("Wiring it together: aliases, viewer certs, and Route 53 alias records",
"## What it is\n" +
"Now you connect the three pieces in Terraform so your domain serves the site over HTTPS:\n\n" +
"1. **`aliases`** on the CloudFront distribution — tells CloudFront 'I also answer to yourdomain.com and www.yourdomain.com'\n" +
"2. **`viewer_certificate`** with your ACM cert ARN — replaces the default `*.cloudfront.net` cert so HTTPS works for YOUR name\n" +
"3. A **Route 53 alias record** — an A record pointing your apex domain at the CloudFront distribution\n\n" +
"## Why an ALIAS record, not a CNAME\n" +
"The apex (yourdomain.com with no `www`) **cannot** be a CNAME — DNS forbids it. Route 53's **alias** record is an AWS-specific A record that points at an AWS resource (CloudFront) and resolves correctly at the apex. This is exactly the kind of edge case IaC documents for you so you never re-learn it.\n\n" +
"## Why it matters\n" +
"This day is where everything from the week becomes one coherent stack — all in `main.tf`, all version-controlled. Change the cert later? It's a diff. Move domains? It's a diff.\n\n" +
"## Where this fits\n" +
"Today you update `main.tf` with aliases, the viewer certificate, and the Route 53 alias record, then `terraform apply`. After propagation, your domain is wired to CloudFront over HTTPS."
    ),
    swipe: SW([
      { prompt: "The CloudFront `aliases` setting tells the distribution which custom domain names it should answer to.", answer: true, whenRight: "Right — without aliases, CloudFront only answers to its default *.cloudfront.net name.", whenWrong: "aliases is the list of custom domains CloudFront accepts. Omit it and your domain won't route to the distribution." },
      { prompt: "You can use a CNAME record for the apex domain (yourdomain.com with no www).", answer: false, whenRight: "Right — DNS forbids a CNAME at the apex. Use a Route 53 ALIAS record instead.", whenWrong: "The apex can't be a CNAME (DNS rule). Route 53's ALIAS record solves it — an A record that targets an AWS resource.", sim: "# apex (yourdomain.com):\n# CNAME -> not allowed\n# ALIAS -> works (Route 53)" },
      { prompt: "Attaching your ACM certificate via `viewer_certificate` is what makes HTTPS work for your custom domain.", answer: true, whenRight: "Exactly — it swaps the default cert for yours, so the padlock validates against your name.", whenWrong: "viewer_certificate points CloudFront at your ACM cert. Without it, HTTPS only works for *.cloudfront.net." }
    ])
  },
  '2.5': {
    lesson: L("Verifying HTTPS end-to-end and reading a certificate",
"## What it is\n" +
"Provisioning isn't done until you've **verified it from the outside**. After DNS + CloudFront propagate (10-15 min), you visit `https://yourdomain.com` and confirm:\n" +
"- The page loads over HTTPS\n" +
"- The browser shows a **padlock** (no 'Not Secure' warning)\n" +
"- The certificate details show it was **issued by Amazon Trust Services** for your domain\n\n" +
"## Why it matters — verify, don't assume\n" +
"`terraform apply` succeeding means AWS accepted your config — not that the live experience works. DNS could still be propagating, the cert could be attached to the wrong domain, a redirect could be misconfigured. A senior engineer's habit is to **check the actual user-facing result**, every time, before calling it done.\n\n" +
"Click the padlock → 'Connection is secure' → certificate. Reading a cert (who issued it, what names it covers, when it expires) is a core debugging skill you'll use whenever HTTPS misbehaves.\n\n" +
"## Where this fits\n" +
"Today is the verification gate for v0.2: your real domain, loading your portfolio, over a valid certificate. If the padlock is there and the cert names your domain, the HTTPS work is proven."
    ),
    swipe: SW([
      { prompt: "A successful `terraform apply` guarantees the live site works for end users immediately.", answer: false, whenRight: "Right — apply means AWS accepted the config. DNS/CloudFront may still propagate; always verify externally.", whenWrong: "apply only means the config was accepted. The user-facing result can still be propagating or misconfigured. Verify it.", sim: "terraform apply  # ok != live yet\n# then: open https://yourdomain.com" },
      { prompt: "Clicking the browser padlock lets you inspect who issued the certificate and which domains it covers.", answer: true, whenRight: "Right — padlock -> certificate details. Reading certs is a core HTTPS debugging skill.", whenWrong: "The padlock reveals the cert: issuer, covered names, expiry. Knowing how to read it is essential for debugging HTTPS." },
      { prompt: "An ACM-issued certificate will show as issued by 'Amazon Trust Services' in the browser.", answer: true, whenRight: "Right — that's ACM's CA. Seeing it confirms your cert is the ACM one you provisioned.", whenWrong: "ACM certs chain to Amazon Trust Services. Seeing that issuer confirms the right cert is attached." }
    ])
  },
  '2.6': {
    lesson: L("Security headers and HSTS: hardening the response",
"## What it is\n" +
"HTTPS encrypts the connection, but you can harden the site further with **response headers** that instruct the browser to behave safely. The key ones:\n\n" +
"```text\n" +
"Strict-Transport-Security: max-age=31536000   # HSTS — always use HTTPS\n" +
"X-Content-Type-Options: nosniff               # don't guess content types\n" +
"Referrer-Policy: strict-origin-when-cross-origin\n" +
"```\n\n" +
"**HSTS** is the important one: once a browser sees it, it **refuses** to connect to your domain over plain HTTP for the duration — even if the user types `http://`. It closes the brief window where a first HTTP request could be intercepted and downgraded.\n\n" +
"## Why it matters\n" +
"These headers are free, set-once, and meaningfully raise your security posture. Tools like **securityheaders.com** grade your site A-to-F based on which headers you send — and recruiters and security reviewers do check. CloudFront applies them via a **response headers policy**, declared in Terraform like everything else.\n\n" +
"## Where this fits\n" +
"Today you add a CloudFront response headers policy setting HSTS + the hardening headers, apply it, and confirm an **A grade** on securityheaders.com. That grade is a concrete, linkable proof of competence on the portfolio."
    ),
    swipe: SW([
      { prompt: "HSTS tells the browser to always use HTTPS for your domain, even if the user types http://.", answer: true, whenRight: "Right — once seen, the browser refuses plain HTTP to your domain for the max-age duration.", whenWrong: "That's HSTS: after the first time, the browser auto-upgrades and refuses HTTP. Closes the downgrade window.", sim: "Strict-Transport-Security: max-age=31536000\n# browser: HTTPS only, no exceptions" },
      { prompt: "Security headers like HSTS and X-Content-Type-Options require buying an extra AWS service.", answer: false, whenRight: "Right — they're free response headers, set via a CloudFront response headers policy in Terraform.", whenWrong: "They're free — just headers CloudFront adds. No extra service, declared in your existing main.tf." },
      { prompt: "securityheaders.com grades a site based on which security response headers it sends.", answer: true, whenRight: "Right — it's a quick external grade (A-F). Aiming for A is a concrete, linkable portfolio proof.", whenWrong: "It scans your response headers and grades A-F. Add HSTS + the hardening headers and you reach grade A." }
    ])
  },
  '2.7': {
    lesson: L("Acceptance criteria and tagging a release",
"## What it is\n" +
"A version ships when it meets its **acceptance criteria** — an explicit checklist of what 'done' means — not when you *feel* finished. For Edge Portfolio v0.2:\n\n" +
"```text\n" +
"[ ] https://yourdomain.com loads\n" +
"[ ] www redirects to apex (or both work)\n" +
"[ ] ACM certificate is valid\n" +
"[ ] securityheaders.com grade A or better\n" +
"[ ] v0.2 tag pushed\n" +
"```\n\n" +
"Then you **tag the release** in git:\n\n" +
"```bash\n" +
"git commit -m 'v0.2: custom domain + HTTPS + security headers'\n" +
"git tag v0.2 && git push --tags\n" +
"```\n\n" +
"## Why it matters\n" +
"A **git tag** is an immutable marker of a known-good state. `v0.1` was the bare CloudFront URL; `v0.2` is your hardened custom domain. Tags let you (and anyone reading the repo) see the project's progression and check out any past version exactly as it shipped. A checklist + tag is how professionals close a unit of work — no ambiguity about what was delivered.\n\n" +
"## Where this fits\n" +
"Today you run the acceptance checklist, fix anything that fails, and tag v0.2. Edge Portfolio now lives at your own domain, over HTTPS, with an A security grade and a clean version history."
    ),
    swipe: SW([
      { prompt: "Acceptance criteria are an explicit checklist defining 'done' before you call a version shipped.", answer: true, whenRight: "Right — done is a checklist you can verify, not a feeling. Every item must pass.", whenWrong: "Acceptance criteria make 'done' objective. You ship when every box is checked, not when you're tired of it." },
      { prompt: "A git tag like `v0.2` is an immutable marker you can use to check out exactly that shipped state later.", answer: true, whenRight: "Right — tags pin a known-good commit. `git checkout v0.2` restores precisely what shipped.", whenWrong: "Tags are permanent pointers to a commit. They let you (and reviewers) revisit any released version exactly.", sim: "git tag v0.2 && git push --tags\n# v0.2 is now a permanent checkpoint" },
      { prompt: "You should tag v0.2 even if securityheaders.com still shows a failing grade, and fix it in v0.3.", answer: false, whenRight: "Right — the A grade is IN the acceptance criteria. Don't tag until every checklist item passes.", whenWrong: "The grade-A check is part of v0.2's acceptance criteria. Tagging with it failing means v0.2 isn't actually done." }
    ])
  }
};

const CONCEPT_CHECKS = {
  1: [
    { q: "What is the core idea of infrastructure-as-code (IaC)?",
      choices: ["Carefully documenting each click you make in the AWS console","Declaring your infrastructure in version-controlled text files a tool applies for you","Writing application code that runs on a server","Backing up your servers to disk regularly"],
      correct: 1, explain: "IaC means the desired state of your infrastructure lives in text files (Terraform). The tool makes reality match the files — reproducible, reviewable, version-controlled." },
    { q: "Why use an S3 + CloudFront + OAI pattern instead of serving straight from a public S3 bucket?",
      choices: ["It is cheaper to store files twice","CloudFront caches globally for speed AND the OAI keeps the bucket private","Public buckets cannot host HTML","S3 cannot serve HTTPS at all"],
      correct: 1, explain: "CloudFront is a CDN — it caches near users for fast loads worldwide. The Origin Access Identity lets CloudFront read the bucket while the bucket itself stays private, so users can only reach files through the CDN." },
    { q: "What does the destroy + redeploy test prove about your Terraform code?",
      choices: ["That your AWS bill is low","That the code fully captures the infrastructure with no hidden manual steps","That CloudFront is fast","That your domain resolves correctly"],
      correct: 1, explain: "If you can destroy everything and rebuild it identically from the code alone, your IaC is complete and idempotent — nothing lives only in your memory or a one-off console click." }
  ],
  2: [
    { q: "What is the role of DNS in serving your site at a custom domain?",
      choices: ["It encrypts traffic between browser and server","It translates yourdomain.com into the address of the resource that should answer (CloudFront)","It stores your HTML files","It issues your TLS certificate"],
      correct: 1, explain: "DNS is the internet's phone book — it maps the human-readable name to wherever requests should go. Route 53 is the AWS service that answers DNS for your domain once you repoint nameservers to it." },
    { q: "An ACM certificate used with CloudFront must be requested in which region?",
      choices: ["The region closest to your users","us-east-1, always","The same region as your S3 bucket","Any region works"],
      correct: 1, explain: "CloudFront only reads ACM certificates from us-east-1, regardless of where the rest of your infrastructure lives. This catches almost everyone the first time." },
    { q: "What does the HSTS response header do?",
      choices: ["Compresses the page for faster loading","Tells the browser to always use HTTPS for your domain, even if the user types http://","Blocks all traffic from other countries","Renews your TLS certificate automatically"],
      correct: 1, explain: "HTTP Strict Transport Security instructs the browser to refuse plain HTTP connections to your domain for the max-age duration, closing the window where a first HTTP request could be downgraded or intercepted." }
  ]
};

// ── Apply: prepend lesson, insert swipe before first exercise, add concept_check ──
[0, 1].forEach((wi) => {
  const w = d.weeks[wi];
  if (!CONCEPT_CHECKS[w.number]) throw new Error('no concept_check for W' + w.number);
  w.concept_check = CONCEPT_CHECKS[w.number];

  w.days.forEach((day) => {
    const key = w.number + '.' + day.number;
    const t = TEACH[key];
    if (!t) throw new Error('missing TEACH for ' + key);

    // Strip any previously-injected lesson/swipe so this script is idempotent
    let items = day.items.filter((it) => it.kind !== 'lesson' && it.kind !== 'swipe');

    // Insert swipe immediately before the first exercise (or at end if none)
    const exIdx = items.findIndex((it) => it.kind === 'exercise');
    if (exIdx === -1) {
      items.push(t.swipe);
    } else {
      items.splice(exIdx, 0, t.swipe);
    }

    // Prepend the teaching lesson
    items.unshift(t.lesson);
    day.items = items;
  });
});

// ── Validate ──
[0, 1].forEach((wi) => {
  const w = d.weeks[wi];
  if (!w.concept_check || w.concept_check.length !== 3) throw new Error('W' + w.number + ' concept_check invalid');
  w.days.forEach((day) => {
    const kinds = day.items.map((i) => i.kind);
    if (!kinds.includes('lesson')) throw new Error('W' + w.number + ' D' + day.number + ' no lesson');
    if (!kinds.includes('swipe')) throw new Error('W' + w.number + ' D' + day.number + ' no swipe');
  });
});

fs.writeFileSync(FILE, JSON.stringify(d, null, 2), 'utf8');
console.log('SUCCESS: DevOps W1 + W2 upgraded to standard.');
[0, 1].forEach((wi) => {
  const w = d.weeks[wi];
  console.log(`  W${w.number} "${w.title}": concept_check=${w.concept_check.length}q`);
  w.days.forEach((day) =>
    console.log(`    D${day.number}: [${day.items.map((i) => i.kind).join(',')}]`)
  );
});
