// Cloud/DevOps W3-W7 enrichment to the teach->swipe->project standard.
//   W3 Edge Portfolio v0.3 — GitHub Actions CI/CD
//   W4 Edge Portfolio v0.4 — Monitoring + logs + alarms
//   W5 Docker from first principles
//   W6 Docker Compose + the inner loop
//   W7 Image hardening + scanning + supply chain
const path = require('path');
const fs = require('fs');
const FILE = path.join(__dirname, '..', 'data', 'roadmaps', 'devops-cloud.json');
const ds = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const L = (title, body) => ({ kind: 'lesson', title, body });
const V = (title, url, dm, creator, why) => ({ kind: 'video', title, url, duration_min: dm, creator, why });
const R = (title, url, why) => ({ kind: 'reading', title, url, why });
const S = (cards) => ({ kind: 'swipe', title: 'Quick check — swipe to answer', cards });
const E = (title, body) => ({ kind: 'exercise', title, body });
const D = (number, title, summary, items) => ({ number, title, summary, items });

/* ════ W3 — Edge Portfolio v0.3: GitHub Actions CI/CD ════ */
const W3 = {
  number: 3, title: "Edge Portfolio v0.3: GitHub Actions CI/CD",
  phase: "Foundation", commitment_hours: "12-18",
  context: ds.weeks[2].context,
  concept_check: [
    { q: "Why does CI/CD make deploys LESS scary, not more?",
      choices: ["Magic","Removing the human from `ssh prod && git pull && restart` removes the most common deploy failure: typos and forgotten steps. The pipeline runs identically every time, and you see green/red BEFORE traffic reaches the change",
        "Required","Trendy"],
      correct: 1, explain: "The pre-CI/CD deploy script lived in someone's head. They'd SSH in, pull, install, restart. Half the time they'd forget a step. CI/CD codifies the steps as YAML; the runner executes them identically every time. Plus tests run BEFORE deploy — broken commits never reach the server. The scary part of deploys is the variability; CI/CD removes it." },
    { q: "Why do GitHub Actions runners get fresh state on every workflow run?",
      choices: ["GitHub bug","Hermetic builds — no state leaks between runs, so a passing build on your laptop and on CI mean the same thing. Caching is opt-in and explicit, not a side effect",
        "To slow things down","Required by AWS"],
      correct: 1, explain: "If runners reused state, a green CI build could mean 'the cached node_modules from last week happens to work'. Fresh runners force the workflow to install everything from scratch every time — so when CI passes, you know that exact `package-lock.json` actually builds. Caching is added back through `actions/cache` with explicit keys, never implicit." },
    { q: "Why do you store secrets in GitHub's `Secrets` UI and not in the workflow YAML?",
      choices: ["Habit","Secrets in the YAML get committed to the repo, end up in git history, leak via PRs, get scraped by bots. GitHub's encrypted Secrets are exposed to the workflow as env vars at runtime without touching disk",
        "Required","No reason"],
      correct: 1, explain: "The classic mistake: hardcoding `AWS_ACCESS_KEY_ID=AKIA...` in the workflow YAML. That commit is now permanent — even if you rotate the key, anyone with repo history can see what you used. GitHub Secrets are encrypted at rest, decrypted into env vars only inside the runner, and never appear in logs (GitHub masks them). Use them from day one." }
  ],
  days: [
    D(1, "What is CI/CD?", "The discipline that removes the human from deploy.", [
      L("Before and after CI/CD",
"## Before\n" +
"A developer writes code. Tests it locally (maybe). SSHs into the server. `git pull && npm install && npm run build && systemctl restart app`. Hopes nothing broke. If it broke, SSHs back in, debugs at 2am.\n\n" +
"## After\n" +
"A developer writes code. Pushes to GitHub. A workflow runs: install deps → run tests → build → deploy. If tests fail, deploy doesn't happen — the developer sees the red ❌ in PR. If they pass, the server gets the new code automatically.\n\n" +
"The human is REMOVED from the deploy path. That's the whole point.\n\n" +
"## CI vs CD — the two halves\n" +
"```text\n" +
"CI (Continuous Integration)\n" +
"  Every push: pull, install, lint, test, build.\n" +
"  Verdict: green or red. Visible on the PR.\n" +
"  Goal: catch breakage BEFORE merge.\n\n" +
"CD (Continuous Deployment / Delivery)\n" +
"  Every merge to main: deploy the green build to production.\n" +
"  Goal: main is always shippable; deploy is a non-event.\n" +
"```\n\n" +
"## What GitHub Actions gives you\n" +
"- A YAML file in `.github/workflows/` defines the workflow.\n" +
"- Workflows trigger on events: `push`, `pull_request`, `workflow_dispatch`, `schedule`.\n" +
"- Each run gets a fresh Ubuntu/macOS/Windows VM (the runner).\n" +
"- Free minutes: 2,000/month for private repos, unlimited for public.\n\n" +
"## What you build this week\n" +
"`.github/workflows/deploy.yml` that runs on every push to `main`:\n" +
"1. Checks out the repo\n" +
"2. Validates the HTML (a basic test)\n" +
"3. Configures AWS credentials from GitHub Secrets\n" +
"4. Syncs `index.html` to S3\n" +
"5. Invalidates CloudFront so the new file goes live\n\n" +
"You'll push a change to `index.html` and watch it land on your live URL ~90 seconds later. No SSH, no typing, no fear."
      ),
      S([
        { prompt: "CI means deploying to production on every push.", answer: false, whenRight: "Right — CI = Continuous Integration (build + test on every push). CD = the deploy half. Different concepts that team up.", whenWrong: "CI is the build/test half. CD is the deploy half. Together: CI/CD. Distinct concepts." },
        { prompt: "GitHub Actions workflows live as YAML files in `.github/workflows/`.", answer: true, whenRight: "Right — convention is hard-coded. Folder, filename, schema all defined by GitHub.", whenWrong: "Yes — `.github/workflows/<name>.yml`. Standard location; one file per workflow." },
        { prompt: "Removing the human from deploys makes deploys MORE risky.", answer: false, whenRight: "Right — opposite. Humans typo and forget steps; pipelines run identically every time. Removing the human reduces variance.", whenWrong: "Less risky. The human IS the variance. Pipelines = consistency = boring deploys, which is the goal." }
      ]),
      E("Your turn — frame CI/CD", "[WRITE] In `cicd/INTRO.md`:\n1. Write 2 sentences on what your current deploy looks like (manual S3 sync? `aws s3 cp`? nothing yet?).\n2. List the 3 steps your CI/CD workflow will replace.\n3. State the week's goal: push to main → site updates automatically in <2 min, with NO terminal touched.")
    ]),
    D(2, "AWS IAM user for CI", "A least-privileged user the workflow can sign requests with.", [
      L("Why a dedicated IAM user for CI",
"## The principle of least privilege\n" +
"The IAM user your workflow uses should be able to do ONLY what the workflow needs and nothing else. If a credential leaks, the blast radius is exactly the workflow's permissions.\n\n" +
"## What the workflow needs\n" +
"1. PUT objects into your S3 bucket (sync `index.html`).\n" +
"2. Invalidate CloudFront for the matching distribution.\n" +
"\n" +
"That's it. No EC2, no IAM, no Route53, no SSM — none of which the workflow touches.\n\n" +
"## Create the user (AWS console)\n" +
"1. **IAM → Users → Create user**.\n" +
"2. Name: `edge-portfolio-ci`.\n" +
"3. **DO NOT** enable AWS Management Console access. Programmatic access only.\n" +
"4. Skip groups → Next → Create user.\n" +
"5. After creation: open the user → **Security credentials → Create access key** → **Application running outside AWS**.\n" +
"6. Download the CSV with `Access key ID` + `Secret access key`. **You will see the secret ONCE.**\n\n" +
"## Attach the minimal policy\n" +
"User → **Permissions → Add permissions → Attach policies directly → Create policy** → JSON tab. Paste (replace YOUR-BUCKET + YOUR-DIST):\n\n" +
"```json\n" +
"{\n" +
"  \"Version\": \"2012-10-17\",\n" +
"  \"Statement\": [\n" +
"    {\n" +
"      \"Sid\": \"S3SyncSiteOnly\",\n" +
"      \"Effect\": \"Allow\",\n" +
"      \"Action\": [\"s3:PutObject\", \"s3:DeleteObject\", \"s3:ListBucket\"],\n" +
"      \"Resource\": [\n" +
"        \"arn:aws:s3:::YOUR-BUCKET\",\n" +
"        \"arn:aws:s3:::YOUR-BUCKET/*\"\n" +
"      ]\n" +
"    },\n" +
"    {\n" +
"      \"Sid\": \"InvalidateCloudFront\",\n" +
"      \"Effect\": \"Allow\",\n" +
"      \"Action\": [\"cloudfront:CreateInvalidation\"],\n" +
"      \"Resource\": \"arn:aws:cloudfront::*:distribution/YOUR-DIST\"\n" +
"    }\n" +
"  ]\n" +
"}\n" +
"```\n\n" +
"Save as `EdgePortfolioCiPolicy`. Attach to the user. Done.\n\n" +
"## The rule for every CI credential going forward\n" +
"- Dedicated IAM user per pipeline (never reuse your dev creds).\n" +
"- Programmatic access only (no console login).\n" +
"- Inline policy that names the exact resources, never `*`.\n" +
"- Rotate the access key every 90 days.\n\n" +
"This is the practice that prevents the disasters."
      ),
      S([
        { prompt: "Reusing your personal AWS access key for CI is a fine shortcut for a personal project.", answer: false, whenRight: "Right — no. Your dev key has broad permissions; a leak via CI logs = everything compromised. Dedicated CI user = scoped blast radius.", whenWrong: "Wrong. Dedicated CI user, minimal policy, rotatable independently. Same effort for huge safety upgrade." },
        { prompt: "An IAM policy with `\"Resource\": \"*\"` is the safe default.", answer: false, whenRight: "Right — opposite. `*` means every resource. Scope to the exact bucket ARN + the exact distribution ID.", whenWrong: "`*` is the dangerous default. Always name the specific resource ARNs. Tedious; necessary." },
        { prompt: "The secret access key is shown to you ONCE on creation; lose it and you must create a new one.", answer: true, whenRight: "Right — same pattern as OpenAI / GitHub keys. Show-once is industry-wide.", whenWrong: "Yes — once. Save it carefully (or just rotate and replace). AWS never shows it again." }
      ]),
      E("Your turn — IAM user", "[CODE]\n1. AWS console → IAM → Create user `edge-portfolio-ci` (programmatic access only).\n2. Create the inline policy from the lesson (substitute YOUR bucket name + distribution ID).\n3. Attach to the user. Generate access key.\n4. Save the Access Key ID + Secret in a password manager (NOT in the repo).\n5. In `cicd/IAM.md`: paste the policy + note the user's ARN.")
    ]),
    D(3, "Add secrets to GitHub", "Where the AWS keys live — encrypted, scoped to the repo.", [
      L("Secrets, not env vars in YAML",
"## The mechanism\n" +
"GitHub Repo → **Settings → Secrets and variables → Actions → New repository secret**.\n\n" +
"Add three:\n" +
"```text\n" +
"AWS_ACCESS_KEY_ID         (from step 2)\n" +
"AWS_SECRET_ACCESS_KEY     (from step 2)\n" +
"CLOUDFRONT_DISTRIBUTION_ID (the distribution ID, e.g. E1A2B3C4D5E6F7)\n" +
"```\n\n" +
"At workflow runtime they're available as:\n" +
"```yaml\n" +
"env:\n" +
"  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}\n" +
"```\n\n" +
"## What GitHub does for you\n" +
"- Encrypted at rest (libsodium sealed boxes).\n" +
"- Only available inside workflow runs of THIS repo (not even forks of public repos can read them).\n" +
"- Automatically masked in workflow logs — if a step accidentally prints `$AWS_SECRET_ACCESS_KEY`, GitHub replaces it with `***`.\n" +
"- Rotation is a single UI action.\n\n" +
"## What you must still do\n" +
"- Don't echo secrets explicitly via `set -x` or `env | grep AWS`. Masking helps but isn't perfect.\n" +
"- Don't pass secrets to `if` conditions in YAML — the entire expression can leak in logs.\n" +
"- Rotate the AWS key (and update both GitHub Secrets) every 90 days.\n\n" +
"## Environment secrets (for later)\n" +
"GitHub also supports per-environment secrets (`production` vs `staging`) and protection rules (require manual approval for prod deploys). For Edge Portfolio v0.3 you only have prod — repo-level secrets are enough."
      ),
      S([
        { prompt: "GitHub masks secrets in workflow logs by replacing them with `***`.", answer: true, whenRight: "Right — automatic masking. Useful safety net; not a substitute for not echoing secrets in the first place.", whenWrong: "Yes — `***`. Backup defence. Don't rely on it alone; structure your YAML so secrets never appear in command output." },
        { prompt: "Forks of a public repo can read its repository secrets.", answer: false, whenRight: "Right — no. Secrets are scoped to the upstream repo. PRs from forks run with restricted permissions and no secrets.", whenWrong: "Forks can't. This is critical — it's why PR workflows from forks can't deploy. Plan accordingly." },
        { prompt: "Per-environment secrets + protection rules are necessary even for a personal portfolio with only one environment.", answer: false, whenRight: "Right — repo-level secrets are fine for one environment. Per-env + manual approval matter when prod and staging coexist.", whenWrong: "Overkill for one env. Repo secrets here; per-env later when staging exists." }
      ]),
      E("Your turn — secrets", "[CODE]\n1. GitHub repo → Settings → Secrets and variables → Actions → New repository secret.\n2. Add AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY + CLOUDFRONT_DISTRIBUTION_ID.\n3. Confirm they appear in the list (values hidden).\n4. NOTES.md: list the secrets you added and where to rotate them.")
    ]),
    D(4, "Write the workflow", ".github/workflows/deploy.yml — the whole pipeline.", [
      L("The deploy workflow",
"## File location\n" +
"`.github/workflows/deploy.yml` — GitHub auto-discovers anything in this folder.\n\n" +
"## The complete workflow\n" +
"```yaml\n" +
"name: Deploy to S3 + invalidate CloudFront\n\n" +
"on:\n" +
"  push:\n" +
"    branches: [main]      # only on main\n" +
"  workflow_dispatch:       # plus manual trigger for testing\n\n" +
"jobs:\n" +
"  deploy:\n" +
"    runs-on: ubuntu-latest\n" +
"    steps:\n" +
"      - name: Checkout\n" +
"        uses: actions/checkout@v4\n\n" +
"      - name: Configure AWS credentials\n" +
"        uses: aws-actions/configure-aws-credentials@v4\n" +
"        with:\n" +
"          aws-access-key-id:     ${{ secrets.AWS_ACCESS_KEY_ID }}\n" +
"          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}\n" +
"          aws-region: us-east-1\n\n" +
"      - name: Sync site to S3\n" +
"        run: |\n" +
"          aws s3 sync . s3://YOUR-BUCKET-NAME \\\n" +
"            --exclude '.git/*' \\\n" +
"            --exclude '.github/*' \\\n" +
"            --exclude '*.md' \\\n" +
"            --delete\n\n" +
"      - name: Invalidate CloudFront\n" +
"        run: |\n" +
"          aws cloudfront create-invalidation \\\n" +
"            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \\\n" +
"            --paths '/*'\n" +
"```\n\n" +
"## Read it line by line\n" +
"- `on.push.branches: [main]` — runs ONLY when main updates. PR pushes don't trigger deploy.\n" +
"- `workflow_dispatch` — gives you a \"Run workflow\" button in the Actions tab.\n" +
"- `runs-on: ubuntu-latest` — fresh Ubuntu VM, no leftover state.\n" +
"- `aws-actions/configure-aws-credentials@v4` — official AWS action. Pin to a version, not `@main`.\n" +
"- `aws s3 sync ... --delete` — uploads changed files, removes files from the bucket that aren't in the repo. Aggressive but accurate.\n" +
"- `--exclude` patterns keep `.git/`, workflows, and READMEs out of the bucket.\n" +
"- The invalidation has cost: $0.005/path beyond the free 1,000/month per account. `/*` invalidates everything; cheap.\n\n" +
"## Commit and watch\n" +
"```bash\n" +
"git add .github/workflows/deploy.yml\n" +
"git commit -m 'ci: add S3 + CloudFront deploy workflow'\n" +
"git push origin main\n" +
"```\n" +
"Open https://github.com/YOU/edge-portfolio/actions — there will be a run in progress (or failed, fix and re-push). Click into it to see each step's output."
      ),
      S([
        { prompt: "`@v4` on the official AWS action is safer than `@main`.", answer: true, whenRight: "Right — version pin = predictable behaviour. `@main` lets the action change under you silently.", whenWrong: "Pin versions. `@main` makes your pipeline depend on someone else's HEAD. Pin to a tag; upgrade deliberately." },
        { prompt: "`aws s3 sync --delete` is destructive and can remove files you didn't intend.", answer: true, whenRight: "Right — anything in the bucket not in your repo gets DELETED. Test in a non-prod bucket first.", whenWrong: "Yes — destructive. Excellent for keeping bucket = repo, but verify the `--exclude` patterns; one wrong glob and you wipe the wrong file." },
        { prompt: "CloudFront invalidations are free.", answer: false, whenRight: "Right — 1,000/month free per account, then $0.005/path. Use `/*` for full invalidation; very cheap unless you're inval'ing thousands of paths/day.", whenWrong: "Has a free tier then per-path cost. For a portfolio, the cost is irrelevant; for a CMS-driven site, design the invalidation strategy carefully." }
      ]),
      E("Your turn — workflow", "[CODE]\n1. Create `.github/workflows/deploy.yml` from the lesson.\n2. Substitute YOUR bucket name in the sync step.\n3. Commit + push to main.\n4. Open the Actions tab; watch the run. Fix any errors. Common issues: typo in secret name, IAM policy missing s3:ListBucket, wrong bucket name.\n5. Confirm the run goes green.")
    ]),
    D(5, "Test the pipeline", "End-to-end: edit a file, push, watch it land on the live URL.", [
      L("The test",
"## The change\n" +
"Edit `index.html`. Add an obvious visible change — a new sentence, a different background colour, anything you'll spot.\n\n" +
"## The push\n" +
"```bash\n" +
"git add index.html\n" +
"git commit -m 'test: visible change to confirm CI/CD pipeline'\n" +
"git push origin main\n" +
"```\n\n" +
"## The watch\n" +
"1. Open https://github.com/YOU/edge-portfolio/actions — see the run start.\n" +
"2. Click into it. Each step expands to show output.\n" +
"3. The `Sync site to S3` step should show `upload: index.html to s3://...`.\n" +
"4. The `Invalidate CloudFront` step should print an Invalidation ID.\n" +
"5. Total run time: ~30-60 seconds.\n\n" +
"## The verify\n" +
"1. Open your live URL (`https://yourdomain.com`).\n" +
"2. **Hard refresh** (Ctrl+Shift+R or Cmd+Shift+R) to bypass browser cache.\n" +
"3. The change is live.\n\n" +
"## Common failures and what they actually mean\n" +
"```text\n" +
"  ❌ 'Unable to locate credentials'\n" +
"    → secret name typo in YAML or secret not added in GitHub Settings.\n" +
"\n" +
"  ❌ 'AccessDenied' on s3 PutObject\n" +
"    → IAM policy missing the resource ARN or wrong bucket name.\n" +
"\n" +
"  ❌ 'NoSuchBucket'\n" +
"    → bucket name typo in YAML.\n" +
"\n" +
"  ❌ 'AccessDenied' on cloudfront:CreateInvalidation\n" +
"    → distribution ID wrong in secret OR IAM policy missing the dist ARN.\n" +
"\n" +
"  ✓ Run green but site doesn't change\n" +
"    → browser cache. Hard refresh; if still wrong, check CloudFront\n" +
"      invalidation finished (Console → Distributions → Invalidations).\n" +
"```\n\n" +
"Read errors carefully — they almost always tell you exactly which step + which permission + which resource."
      ),
      S([
        { prompt: "A green CI run guarantees the change is live in the browser within seconds.", answer: false, whenRight: "Right — CloudFront invalidations take 1-5 minutes to propagate edge-wide. AND the browser may show its own cached copy.", whenWrong: "Two cache layers: CloudFront edges (mins to invalidate) + browser. Hard refresh + wait." },
        { prompt: "Reading the AWS error message in the failed step is the fastest debugging path.", answer: true, whenRight: "Right — AWS errors are specific: which API, which resource, which permission. Read them.", whenWrong: "Yes — AWS errors are unusually informative. The step that failed names the API call; the API call names the resource; the resource names the permission." },
        { prompt: "If the workflow is wrong, you should ALWAYS revert the deploy step first to prevent further damage.", answer: false, whenRight: "Right — depends. CI/CD pipelines are forward-only by design. Fix the workflow YAML, push, run again. Reverting code is for code bugs, not pipeline bugs.", whenWrong: "Fix forward, don't revert. Pipeline failures don't pollute the bucket; the next push fixes things." }
      ]),
      E("Your turn — end-to-end", "[CODE]\n1. Edit index.html with a visible change.\n2. Commit + push.\n3. Watch the Actions tab; confirm green.\n4. Hard refresh your live URL; confirm the change.\n5. NOTES.md: record total time from `git push` to visible change.")
    ]),
    D(6, "Add an HTML validation step", "A real test that runs BEFORE deploy.", [
      L("htmlhint as a gate",
"## What you add\n" +
"A linting step that runs BEFORE the deploy step. If your HTML has errors, the workflow fails and deploy doesn't happen.\n\n" +
"```yaml\n" +
"      - name: Install htmlhint\n" +
"        run: npm install -g htmlhint\n" +
"\n" +
"      - name: Lint HTML\n" +
"        run: htmlhint index.html\n" +
"```\n\n" +
"Place these between the `Configure AWS credentials` step and the `Sync site to S3` step. If `htmlhint` finds errors (unclosed tags, bad attributes, missing alt text), it exits non-zero and the workflow stops before any S3 write.\n\n" +
"## htmlhint config — optional but recommended\n" +
"Add `.htmlhintrc` at the repo root:\n" +
"```json\n" +
"{\n" +
"  \"doctype-first\": true,\n" +
"  \"title-require\": true,\n" +
"  \"tag-pair\": true,\n" +
"  \"attr-no-duplication\": true,\n" +
"  \"alt-require\": true,\n" +
"  \"src-not-empty\": true\n" +
"}\n" +
"```\n\n" +
"Now the gate is: `<title>` present, doctype declared, tags balanced, `<img>` has `alt`, etc. The baseline a portfolio site should always meet.\n\n" +
"## Test the gate\n" +
"Deliberately break index.html (remove `</body>`). Commit + push. Watch the workflow FAIL at the Lint HTML step. Deploy never runs. Fix the tag, push again, deploy runs.\n\n" +
"## Why test gates matter\n" +
"This is the whole CI philosophy in miniature. The pipeline catches breakage BEFORE it hits prod. As you add more checks (link check, Lighthouse score, image size budget), each one becomes a gate. You ship faster because the pipeline guards quality."
      ),
      S([
        { prompt: "A failed lint step should still allow the deploy to proceed.", answer: false, whenRight: "Right — no. The whole point of the gate is to STOP the deploy. A failed test = no deploy.", whenWrong: "No deploy if tests fail. That's the gate. If you bypass, the gate is decoration." },
        { prompt: "Linting catches every HTML bug; you don't need to test in a browser anymore.", answer: false, whenRight: "Right — no. Lint catches structural issues. Browser testing catches rendering, interactivity, accessibility. Both layers.", whenWrong: "Different bugs. Linters: structure. Browsers: render. Both layers; neither replaces the other." },
        { prompt: "Adding more gates (link check, Lighthouse, etc.) slows you down.", answer: false, whenRight: "Right — opposite. Each gate catches a class of bug pre-deploy. Faster to fix in CI than to revert prod.", whenWrong: "Each gate REMOVES a class of regression. Gates compound; they don't slow you down once they're in place." }
      ]),
      E("Your turn — add gate", "[CODE]\n1. Add the htmlhint install + lint steps to deploy.yml.\n2. (Optional) Add `.htmlhintrc` with the config from the lesson.\n3. Deliberately break index.html. Push. Confirm workflow fails at Lint step + deploy didn't run.\n4. Fix the HTML. Push. Confirm workflow goes green + deploys.\n5. Commit final state.")
    ]),
    D(7, "Tag v0.3", "Document + tag the CI/CD milestone.", [
      L("Ship + record",
"## README update\n" +
"Add to README.md:\n" +
"```markdown\n" +
"## Deploy\n" +
"Every push to `main` automatically deploys via GitHub Actions:\n" +
"- HTML is linted (htmlhint)\n" +
"- On green: synced to S3 + CloudFront invalidated\n" +
"- Average run time: ~45 seconds from push to live\n" +
"\n" +
"Pipeline: [.github/workflows/deploy.yml](.github/workflows/deploy.yml)\n" +
"\n" +
"## Roadmap\n" +
"- [x] v0.1 — bucket + static site\n" +
"- [x] v0.2 — custom domain + HTTPS\n" +
"- [x] v0.3 — automated CI/CD (you are here)\n" +
"- [ ] v0.4 — monitoring + alarms\n" +
"```\n\n" +
"## CICD.md — the brief technical writeup\n" +
"```markdown\n" +
"# CI/CD design\n" +
"\n" +
"## Trigger\n" +
"Workflow runs on every push to `main` and on manual dispatch.\n" +
"\n" +
"## Steps\n" +
"1. Checkout (actions/checkout@v4)\n" +
"2. Configure AWS credentials (aws-actions/configure-aws-credentials@v4)\n" +
"3. Lint HTML (htmlhint)\n" +
"4. Sync to S3 with --delete + exclude patterns\n" +
"5. CloudFront invalidation\n" +
"\n" +
"## IAM\n" +
"User: `edge-portfolio-ci` (programmatic access only)\n" +
"Policy: scoped to ONE bucket ARN + ONE distribution ARN. No wildcards.\n" +
"\n" +
"## Secrets stored in GitHub\n" +
"- AWS_ACCESS_KEY_ID\n" +
"- AWS_SECRET_ACCESS_KEY\n" +
"- CLOUDFRONT_DISTRIBUTION_ID\n" +
"\n" +
"## Rotation policy\n" +
"AWS access key rotated every 90 days. Both GitHub Secrets updated atomically.\n" +
"```\n\n" +
"## Tag\n" +
"```bash\n" +
"git add README.md CICD.md\n" +
"git commit -m 'docs: CI/CD writeup for v0.3'\n" +
"git tag v0.3\n" +
"git push && git push --tags\n" +
"```"
      ),
      S([
        { prompt: "A CICD.md document that names the IAM user + policy is overkill for a personal project.", answer: false, whenRight: "Right — no. Three months from now you won't remember which user the workflow uses. Write it down.", whenWrong: "Write it down. Three months later you'll want this doc. Future-you thanks you." },
        { prompt: "Tagging v0.3 preserves the CI/CD-shipped state recoverable forever.", answer: true, whenRight: "Right — tags = immutable bookmarks. v0.4 next week can diff cleanly against v0.3.", whenWrong: "Yes — recoverable. `git checkout v0.3` will always reproduce the state at this commit." },
        { prompt: "Naming a rotation policy (90 days) but never rotating is fine.", answer: false, whenRight: "Right — no. Calendar reminder. Stale credentials are how organisations get owned.", whenWrong: "Set a reminder. Policy without execution is theatre." }
      ]),
      E("Your turn — ship v0.3", "[PRODUCE]\n1. Write CICD.md from the template.\n2. Update README roadmap section.\n3. Commit + tag v0.3 + push tags.\n4. (Optional) Schedule a calendar reminder for 90 days out: 'Rotate edge-portfolio-ci AWS keys'.\n\nPASS:\n[x] .github/workflows/deploy.yml committed and green\n[x] CICD.md committed\n[x] README updated\n[x] v0.3 tag pushed\n[x] Push to main → live URL updates in <2 min (verified)")
    ])
  ]
};

/* ════ W4 — Edge Portfolio v0.4: Monitoring + logs ════ */
const W4 = {
  number: 4, title: "Edge Portfolio v0.4: Monitoring + logs",
  phase: "Foundation", commitment_hours: "10-15",
  context: ds.weeks[3].context,
  concept_check: [
    { q: "Why is uptime monitoring (black-box) the first layer to add, not the deepest?",
      choices: ["Tradition","Uptime probes test the system the way a USER does: hit the URL, did it respond? It catches the largest class of outages (the site is down) for the smallest setup cost. White-box telemetry comes second",
        "Required","No reason"],
      correct: 1, explain: "Black-box monitoring asks the one question that matters most: from the outside, is the site up? It catches DNS failures, certificate issues, origin outages, edge problems — anything that breaks the user experience — without instrumentation inside your app. White-box (per-request logs, latency histograms, error rates per route) tells you WHY the site is down, but you start with black-box because it's 10 minutes to set up and catches the loudest failures." },
    { q: "Why bother with a billing alarm even when your monthly bill is $1?",
      choices: ["Habit","Run-away costs from misconfiguration (recursive Lambda, infinite CloudFront invalidation loop, leaked key) escalate in hours, not weeks. A $50 alarm is the safety net that catches the bug before it becomes a $5,000 invoice",
        "Required","Tradition"],
      correct: 1, explain: "The horror stories are real: a developer's S3 key gets scraped from a public repo, the attacker spins up bitcoin miners, and the bill is $32,000 by morning. Or a Lambda that triggers itself spirals to $4,000 in 6 hours. A SNS-fed CloudWatch billing alarm at $50 catches these the moment the spend curve bends, while you still have time to act. Setup: 10 minutes. Insurance: priceless." },
    { q: "Why is `5xx error rate` a more useful alarm than `total request count went down`?",
      choices: ["Easier to compute","Drops in traffic could be legitimate (off-hours, weekend, marketing pause); a spike in 5xx is ALWAYS a real problem. The signal-to-noise ratio is dramatically better",
        "Required","No reason"],
      correct: 1, explain: "Alarms should fire on signal, not noise. A traffic drop has a hundred legitimate causes (it's 3am, a marketing campaign ended, search ranked you lower this week). A 5xx spike has ~zero legitimate causes — it means requests are failing. The on-call discipline is to alarm on irreducible-signal metrics and rely on dashboards for the noisy ones." }
  ],
  days: [
    D(1, "Why monitor", "Black-box vs white-box; the four golden signals.", [
      L("The two kinds of monitoring",
"## Black-box (synthetic / uptime)\n" +
"An external service hits your URL every minute from multiple regions. Did you respond 200 OK in under 5 seconds? If not, page someone.\n\n" +
"```text\n" +
"Probe (Tokyo)  ──[GET https://yoursite.com]──> 200 OK in 280ms ✓\n" +
"Probe (London) ──[GET https://yoursite.com]──> timeout ✗ ALERT\n" +
"```\n\n" +
"This is what users experience. If black-box says down, you're down.\n\n" +
"## White-box (telemetry)\n" +
"Your application emits metrics (CloudWatch / Prometheus / OTel) and logs about itself: request count, latency histogram, error rate per route, memory usage, queue depth.\n\n" +
"This tells you WHY you're down. The black-box probe says \"500s from London\"; white-box logs say \"the /api/users handler is timing out because the DB has 47% CPU\".\n\n" +
"## The four golden signals (Google SRE)\n" +
"Per service, watch:\n" +
"```text\n" +
"1. LATENCY    — how long does a request take?\n" +
"2. TRAFFIC    — how many requests per second?\n" +
"3. ERRORS     — what fraction fail?\n" +
"4. SATURATION — how full is the system (CPU, memory, disk)?\n" +
"```\n\n" +
"Anomaly in any of those = the system is in trouble. If you only have time to watch four numbers, watch these.\n\n" +
"## What you build this week\n" +
"For Edge Portfolio (a static site, no app code), the monitoring stack is small:\n" +
"1. Uptime ping every minute from BetterUptime / UptimeRobot.\n" +
"2. CloudWatch billing alarm at $50 (cheap insurance).\n" +
"3. CloudFront 5xx-error-rate alarm.\n" +
"4. A tiny static status page reading from CloudWatch.\n" +
"\n" +
"Total ops effort: ~3 hours. Outcome: you know within 60 seconds when the site goes down."
      ),
      R("Google SRE Book — Monitoring distributed systems", "https://sre.google/sre-book/monitoring-distributed-systems/", "Canonical reference. Read the 'Four Golden Signals' section (5 mins); skim the rest as you mature your stack."),
      S([
        { prompt: "Black-box monitoring tests your system from the outside, like a user.", answer: true, whenRight: "Right — synthetic probes hit the URL externally. Catches what users actually see.", whenWrong: "Yes — external probe = user perspective. White-box adds the internals; both are needed at scale." },
        { prompt: "The four golden signals are Latency, Traffic, Errors, Saturation.", answer: true, whenRight: "Right — Google SRE's irreducible four. Anomaly in any = real problem.", whenWrong: "Yes — LTES. Memorise these; they apply to any service." },
        { prompt: "For a static portfolio site, you should skip monitoring entirely until you have real traffic.", answer: false, whenRight: "Right — no. The billing alarm alone is worth 100x its setup cost. Uptime check is 5 minutes more.", whenWrong: "Set the basics now. Billing alarm catches the cost-leak disaster; uptime catches outages while you sleep. Both are free or cheap." }
      ]),
      E("Your turn — pick your stack", "[WRITE] In `monitoring/INTRO.md`:\n1. What's the worst-case downtime cost for your portfolio? (Realistically: none — a recruiter sees a 404.)\n2. What signal would tell you the site is down right now?\n3. Pick ONE black-box service (BetterUptime / UptimeRobot / Freshping) and note why.\n4. State the week's goal: by Sunday, my phone vibrates within 90 seconds of my site going down.")
    ]),
    D(2, "Uptime monitoring", "BetterUptime / UptimeRobot — set up the external probe.", [
      L("Set up the probe",
"## BetterUptime (recommended)\n" +
"Free tier: 10 monitors, 3-minute checks, email + Slack alerts.\n\n" +
"```text\n" +
"1. Sign up at betterstack.com/better-uptime.\n" +
"2. Monitors → Create monitor.\n" +
"3. URL to monitor: https://yourdomain.com\n" +
"4. Check frequency: 3 minutes (free) or 30 seconds (paid).\n" +
"5. HTTP status code: 200 (default).\n" +
"6. Alert when: HTTP code != 200 OR response time > 5 seconds.\n" +
"7. Notification channels: email + Slack webhook (if you have one).\n" +
"8. Save.\n" +
"```\n\n" +
"## UptimeRobot (alternative)\n" +
"Free tier: 50 monitors, 5-minute checks, email alerts only.\n\n" +
"## Test the alarm — important\n" +
"You MUST verify the alarm fires before trusting it. Temporarily block your URL:\n" +
"1. Edit your local hosts file: add `127.0.0.1 yourdomain.com` (so YOUR machine can't resolve it; the probe still can).\n" +
"   — Actually this only tests YOUR machine; the probe is external.\n" +
"2. Better test: in CloudFront, temporarily disable your distribution. Wait 2 minutes; the probe fails; you should get the alert email.\n" +
"3. Re-enable the distribution. Probe recovers. You should get an 'Up' email.\n\n" +
"## What 'good' looks like\n" +
"```text\n" +
"  ✓ You get the down alert email within 5 minutes of disabling.\n" +
"  ✓ You get the up email within 5 minutes of re-enabling.\n" +
"  ✓ Status page shows the incident in history.\n" +
"```\n\n" +
"If the alert doesn't fire, the monitor isn't useful. Test before relying on it.\n\n" +
"## Public status page (optional)\n" +
"BetterUptime generates a free public status page (status.betterstack.com/yourname). Link it from your portfolio's footer — recruiters love this signal."
      ),
      S([
        { prompt: "An untested uptime monitor is a placebo.", answer: true, whenRight: "Right — never trust an alarm you haven't seen fire. Test deliberately.", whenWrong: "Yes — test it. Disable the origin, watch the alarm fire, re-enable. Now you trust the alarm." },
        { prompt: "BetterUptime's free tier (3-min checks) is fine for a portfolio site.", answer: true, whenRight: "Right — 3-min checks catch real outages quickly enough for a non-revenue site. Save the paid tier for production systems.", whenWrong: "Yes — free tier suffices. The signal is the same; latency to detection differs." },
        { prompt: "Linking a public status page from your portfolio footer is a positive hiring signal.", answer: true, whenRight: "Right — it says 'I take operations seriously'. Most candidates' portfolios show zero ops thinking.", whenWrong: "Strong signal. Cheap to add (one link), differentiates instantly." }
      ]),
      E("Your turn — uptime alarm", "[PRODUCE]\n1. Sign up at BetterUptime (or UptimeRobot).\n2. Add a monitor for your live URL.\n3. Configure email + (optional) Slack notification.\n4. TEST the alarm: disable CloudFront for 2 minutes. Confirm you receive the down alert.\n5. Re-enable. Confirm 'Up' alert.\n6. (Optional) Generate public status page; link from portfolio footer.\n7. NOTES.md: record the time-to-detection.")
    ]),
    D(3, "Billing alarm", "The $50 alarm that prevents the $5,000 invoice.", [
      L("CloudWatch billing alarm — required infrastructure",
"## Why first\n" +
"The single highest-leverage alarm you'll ever set up. 10 minutes; protects against the most expensive class of mistake: cost runaway.\n\n" +
"## Manual setup (one-time)\n" +
"AWS console (region us-east-1 — billing metrics only exist there):\n" +
"```text\n" +
"1. Billing → Billing preferences → Receive Free Tier Usage Alerts + Billing Alerts → save.\n" +
"   (Without this, no metrics flow to CloudWatch.)\n" +
"2. CloudWatch (us-east-1) → Alarms → Create alarm.\n" +
"3. Select metric → Billing → Total Estimated Charge → Currency: USD.\n" +
"4. Threshold: Greater than $50.\n" +
"5. Period: 6 hours (billing metrics update slowly).\n" +
"6. Notification: New SNS topic → enter your email → confirm via the email link.\n" +
"7. Name: BillingAlarm-50USD. Create.\n" +
"```\n\n" +
"## Terraform version (preferred — codify it)\n" +
"```hcl\n" +
"# billing-alarm.tf — apply once, sleep better forever\n" +
"resource \"aws_sns_topic\" \"billing_alerts\" {\n" +
"  name = \"billing-alerts\"\n" +
"}\n\n" +
"resource \"aws_sns_topic_subscription\" \"billing_email\" {\n" +
"  topic_arn = aws_sns_topic.billing_alerts.arn\n" +
"  protocol  = \"email\"\n" +
"  endpoint  = \"you@example.com\"\n" +
"}\n\n" +
"resource \"aws_cloudwatch_metric_alarm\" \"billing_50usd\" {\n" +
"  provider            = aws.useast1   # billing metrics ONLY in us-east-1\n" +
"  alarm_name          = \"billing-50-usd\"\n" +
"  comparison_operator = \"GreaterThanThreshold\"\n" +
"  evaluation_periods  = 1\n" +
"  metric_name         = \"EstimatedCharges\"\n" +
"  namespace           = \"AWS/Billing\"\n" +
"  period              = 21600        # 6 hours\n" +
"  statistic           = \"Maximum\"\n" +
"  threshold           = 50\n" +
"  dimensions          = { Currency = \"USD\" }\n" +
"  alarm_actions       = [aws_sns_topic.billing_alerts.arn]\n" +
"}\n" +
"```\n\n" +
"After confirming the SNS subscription (email link), the alarm is active. It fires when CloudWatch's 6-hour estimate exceeds $50.\n\n" +
"## Test it\n" +
"You can manually transition the alarm state to test the notification path:\n" +
"```bash\n" +
"aws cloudwatch set-alarm-state \\\n" +
"  --alarm-name billing-50-usd \\\n" +
"  --state-value ALARM \\\n" +
"  --state-reason 'testing notification path' \\\n" +
"  --region us-east-1\n" +
"```\n" +
"You should get the email within seconds. Now you trust the alarm."
      ),
      S([
        { prompt: "Billing metrics are available in any AWS region.", answer: false, whenRight: "Right — only us-east-1. CloudWatch billing alarms must be created there.", whenWrong: "us-east-1 only. AWS quirk. Document it; you'll forget otherwise." },
        { prompt: "An SNS topic subscription requires email confirmation before notifications work.", answer: true, whenRight: "Right — AWS sends a confirmation email; click the link or no alarms fire.", whenWrong: "Yes — click the confirm link. Untested subscriptions = silent alarms." },
        { prompt: "A $50 threshold for a portfolio is too high — you'll never hit it.", answer: false, whenRight: "Right — that's the POINT. The alarm catches the disaster scenario, not normal spend. $50 ≫ normal spend = clean signal.", whenWrong: "$50 = disaster threshold, not budget. Normal spend is $1-5; the alarm catches the runaway scenario." }
      ]),
      E("Your turn — billing alarm", "[CODE]\n1. AWS Billing → Billing preferences → enable billing alerts.\n2. Create the CloudWatch alarm in us-east-1 (console or Terraform).\n3. Confirm SNS email subscription.\n4. Test via `aws cloudwatch set-alarm-state` from the lesson.\n5. Document in `monitoring/BILLING.md`: threshold + subscribers + how to silence/raise.")
    ]),
    D(4, "5xx error rate alarm", "Alarm on the signal that matters most for a CDN.", [
      L("CloudFront 5xx alarm",
"## Why this metric\n" +
"For a CDN-fronted site, the four-signal mapping is:\n" +
"- LATENCY → CloudWatch CloudFront `Latency` metric\n" +
"- TRAFFIC → `Requests` metric\n" +
"- ERRORS → `5xxErrorRate` (and `4xxErrorRate`)\n" +
"- SATURATION → mostly N/A (CloudFront scales for you)\n" +
"\n" +
"`5xxErrorRate` is the irreducible signal: percentage of requests that returned a 5xx. Spikes here = real problem.\n\n" +
"## The alarm (Terraform)\n" +
"```hcl\n" +
"resource \"aws_cloudwatch_metric_alarm\" \"cloudfront_5xx\" {\n" +
"  provider            = aws.useast1\n" +
"  alarm_name          = \"cloudfront-5xx-rate-above-1pct\"\n" +
"  comparison_operator = \"GreaterThanThreshold\"\n" +
"  evaluation_periods  = 2          # 2 consecutive periods\n" +
"  metric_name         = \"5xxErrorRate\"\n" +
"  namespace           = \"AWS/CloudFront\"\n" +
"  period              = 300        # 5-min buckets\n" +
"  statistic           = \"Average\"\n" +
"  threshold           = 1.0        # percent\n" +
"  dimensions = {\n" +
"    DistributionId = var.cloudfront_distribution_id\n" +
"    Region         = \"Global\"\n" +
"  }\n" +
"  alarm_actions     = [aws_sns_topic.billing_alerts.arn]\n" +
"  ok_actions        = [aws_sns_topic.billing_alerts.arn]   # notify on recovery too\n" +
"  treat_missing_data = \"notBreaching\"\n" +
"}\n" +
"```\n\n" +
"## Reading the parameters\n" +
"- `threshold = 1.0` — fire when 5xx rate exceeds 1% of requests.\n" +
"- `evaluation_periods = 2` — must be over threshold for TWO consecutive 5-min windows. Reduces flapping.\n" +
"- `ok_actions` — notify on recovery too. Without this, you get the bad-news email and never the good-news email.\n" +
"- `treat_missing_data = notBreaching` — if no data arrived (low traffic, weekend), don't fire.\n" +
"\n" +
"## What the alarm catches\n" +
"- Origin (S3) outage → CloudFront returns 5xx as a passthrough.\n" +
"- Bucket policy misconfiguration → 403 disguised as 5xx in some cases.\n" +
"- Lambda@Edge throwing (if you ever add one).\n" +
"- Cert issues / TLS handshake failures.\n\n" +
"## What it does NOT catch\n" +
"- DNS pointing the wrong way (no requests = no 5xx data).\n" +
"- Domain expired.\n" +
"- Your phone is in airplane mode.\n" +
"That's what the BetterUptime probe is for — different layer."
      ),
      S([
        { prompt: "`evaluation_periods = 2` reduces false alarms from one-off spikes.", answer: true, whenRight: "Right — needs sustained breach, not a single noisy window. Classic anti-flapping pattern.", whenWrong: "Yes — sustained signal vs spike. 2 periods at 5min = ~10 mins of breach before fire." },
        { prompt: "`ok_actions` notifies you when an alarm clears.", answer: true, whenRight: "Right — without it you're left wondering if the incident self-resolved or you missed an alert.", whenWrong: "Yes — recovery is half the story. Always set ok_actions to the same SNS topic." },
        { prompt: "An origin outage in S3 will show up as 5xx on CloudFront's metric.", answer: true, whenRight: "Right — CloudFront passes the failure through. The 5xx rate jumps; your alarm fires.", whenWrong: "Yes — origin failures bubble up. The CDN is opinionated about masking some failures but 5xx generally surfaces." }
      ]),
      E("Your turn — 5xx alarm", "[CODE]\n1. Add the Terraform block to your IaC repo OR create the alarm via console.\n2. Apply. Confirm the alarm shows OK in CloudWatch console.\n3. Test recovery notification: set state to ALARM via CLI, then to OK; receive both emails.\n4. Document in monitoring/ALARMS.md: each alarm's threshold + rationale + escalation channel.")
    ]),
    D(5, "Status dashboard", "A tiny static page reading from CloudWatch.", [
      L("status.html — the public dashboard",
"## What it shows\n" +
"A simple static page at `https://yoursite.com/status` showing:\n" +
"- Current uptime (from BetterUptime's public widget OR pulled via API)\n" +
"- Last 7 days' incident count\n" +
"- Average latency from the last hour\n" +
"\n" +
"This is portfolio gold — recruiters love seeing ops thinking.\n\n" +
"## Simplest version — BetterUptime embed\n" +
"BetterUptime gives you an embeddable widget. In your repo, create `status.html`:\n" +
"```html\n" +
"<!doctype html>\n" +
"<html>\n" +
"<head>\n" +
"  <title>Edge Portfolio — Status</title>\n" +
"  <style>\n" +
"    body { font-family: -apple-system, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 1rem; }\n" +
"    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }\n" +
"    .stack { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 2rem; }\n" +
"  </style>\n" +
"</head>\n" +
"<body>\n" +
"  <h1>Edge Portfolio · Status</h1>\n" +
"  <p>Uptime + incident history for <a href='/'>yourdomain.com</a>.</p>\n" +
"  <div class='stack'>\n" +
"    <iframe\n" +
"      src='https://status.betterstack.com/YOUR-PAGE-ID/'\n" +
"      width='100%' height='420' frameborder='0'\n" +
"      title='Status'>\n" +
"    </iframe>\n" +
"    <a href='https://status.betterstack.com/YOUR-PAGE-ID/'>Open full status page →</a>\n" +
"  </div>\n" +
"</body>\n" +
"</html>\n" +
"```\n\n" +
"Commit and push. Your CI/CD from W3 deploys it. Now `https://yoursite.com/status` is live.\n\n" +
"## Link from portfolio\n" +
"In your main `index.html` footer:\n" +
"```html\n" +
"<footer>\n" +
"  ...\n" +
"  <a href=\"/status\">Status</a>\n" +
"</footer>\n" +
"```\n\n" +
"## Advanced version (optional)\n" +
"Pull CloudWatch metrics via the AWS SDK at build time (in a GitHub Action), bake them into a generated `status.html`. More moving parts; same UX. Wait until v0.5 if you want this."
      ),
      S([
        { prompt: "A public status page is a positive recruiter signal for an entry-level portfolio.", answer: true, whenRight: "Right — most candidates show zero ops awareness. A status page is rare and instantly distinguishing.", whenWrong: "Strong signal. Show the ops thinking; cheap to do; rare in entry-level portfolios." },
        { prompt: "Embedding BetterUptime's status widget requires their paid tier.", answer: false, whenRight: "Right — embed widget is free. Custom domain for the status page is paid; embedding into YOUR domain is free.", whenWrong: "Free. Embed via iframe; their hosted page renders inside your domain wrapper." },
        { prompt: "Pulling CloudWatch metrics at build time is required for v0.4.", answer: false, whenRight: "Right — overkill for this week. v0.4's goal is monitoring + alarms; a third-party widget delivers the same UX in 5 minutes.", whenWrong: "Skip for now. v0.5 if you want the bespoke dashboard. v0.4 ships the value with the widget." }
      ]),
      E("Your turn — status page", "[CODE]\n1. Get your BetterUptime status-page ID (settings → status pages).\n2. Create status.html from the template; substitute the page ID.\n3. Add a footer link from index.html.\n4. Commit + push. CI/CD deploys both.\n5. Verify /status loads + shows live status.")
    ]),
    D(6, "Structured logs (optional but useful)", "Structured JSON logs for CloudFront access logs.", [
      L("CloudFront access logs",
"## What they are\n" +
"CloudFront can write a log entry to S3 for every request. Each entry: timestamp, edge location, client IP, request path, status code, bytes served, latency, referer, user agent.\n\n" +
"## Why bother for a portfolio\n" +
"- Real data to query (great practice for SQL on Athena later in the track).\n" +
"- Detect anomalies (sudden 4xx spike, scraper hitting you).\n" +
"- Trend analysis (when do recruiters actually visit your site?).\n\n" +
"## Enable\n" +
"```text\n" +
"CloudFront console → Your distribution → Logs and metrics → Standard logging → Edit.\n" +
"  Status: On\n" +
"  S3 bucket: create new bucket cloudfront-logs-YOUR-NAME (us-east-1)\n" +
"  Prefix: portfolio/\n" +
"  Save.\n" +
"```\n\n" +
"## Or in Terraform\n" +
"```hcl\n" +
"resource \"aws_s3_bucket\" \"cf_logs\" {\n" +
"  bucket = \"cloudfront-logs-${var.yourname}\"\n" +
"}\n\n" +
"resource \"aws_cloudfront_distribution\" \"main\" {\n" +
"  # ... existing config ...\n" +
"  logging_config {\n" +
"    bucket          = \"${aws_s3_bucket.cf_logs.bucket}.s3.amazonaws.com\"\n" +
"    prefix          = \"portfolio/\"\n" +
"    include_cookies = false\n" +
"  }\n" +
"}\n" +
"```\n\n" +
"## Query with Athena (15-min setup)\n" +
"1. Athena → Query editor → New query.\n" +
"2. Create external table pointing at your logs bucket:\n" +
"```sql\n" +
"CREATE EXTERNAL TABLE cf_logs (\n" +
"  date_col      DATE,\n" +
"  time_col      STRING,\n" +
"  x_edge_loc    STRING,\n" +
"  sc_bytes      BIGINT,\n" +
"  c_ip          STRING,\n" +
"  cs_method     STRING,\n" +
"  cs_host       STRING,\n" +
"  cs_uri_stem   STRING,\n" +
"  sc_status     INT,\n" +
"  cs_referer    STRING,\n" +
"  cs_user_agent STRING\n" +
"  -- ... cloudfront log format has more fields; abbreviated here\n" +
")\n" +
"ROW FORMAT DELIMITED FIELDS TERMINATED BY '\\t'\n" +
"LOCATION 's3://cloudfront-logs-YOUR-NAME/portfolio/'\n" +
"TBLPROPERTIES ('skip.header.line.count'='2');\n" +
"```\n" +
"3. Query:\n" +
"```sql\n" +
"-- 5xx rate by hour over last 7 days\n" +
"SELECT\n" +
"  date_trunc('hour', from_iso8601_timestamp(concat(cast(date_col as varchar), 'T', time_col))) AS hour,\n" +
"  count(*) AS requests,\n" +
"  sum(CASE WHEN sc_status >= 500 THEN 1 ELSE 0 END) * 100.0 / count(*) AS error_rate_pct\n" +
"FROM cf_logs\n" +
"WHERE date_col > current_date - interval '7' day\n" +
"GROUP BY 1\n" +
"ORDER BY 1 DESC;\n" +
"```\n\n" +
"## Cost reality\n" +
"- Logs in S3: ~$0.023 / GB-month. A portfolio generates KB/day. Effectively free.\n" +
"- Athena queries: $5/TB scanned. Per query on logs: pennies.\n" +
"\n" +
"Genuine portfolio data + real Athena queries = strong signal."
      ),
      S([
        { prompt: "CloudFront access logs are appropriate for portfolio-scale traffic from a cost perspective.", answer: true, whenRight: "Right — KB/day of logs; pennies of storage; pennies of Athena queries. Free for real.", whenWrong: "Yes — costs are negligible at portfolio scale. Don't over-think; turn them on." },
        { prompt: "Querying logs via Athena requires a separate ETL pipeline.", answer: false, whenRight: "Right — no. Athena queries raw S3 files. Define the schema; run SQL. No ETL.", whenWrong: "Athena does it directly. Schema-on-read; no pipeline needed for log analysis." },
        { prompt: "Enabling logging is opt-in; CloudFront doesn't log by default.", answer: true, whenRight: "Right — explicit enable. Default is OFF; you toggle and provide a bucket.", whenWrong: "Yes — off by default. Enable explicitly; set the bucket; logs flow." }
      ]),
      E("Your turn — logs", "[CODE]\n1. Create a logs bucket (cloudfront-logs-YOURNAME in us-east-1).\n2. Enable CloudFront logging into it with prefix portfolio/.\n3. Wait an hour; load your site; confirm log files arrive.\n4. (Optional) Set up the Athena table + run the 5xx-by-hour query.\n5. Document in monitoring/LOGS.md.")
    ]),
    D(7, "Tag v0.4", "Document + ship the monitoring milestone.", [
      L("MONITORING.md + tag",
"## MONITORING.md\n" +
"```markdown\n" +
"# Monitoring & alerting\n" +
"\n" +
"## Black-box (synthetic)\n" +
"BetterUptime probe every 3 minutes from 3 regions.\n" +
"- Status page: https://status.betterstack.com/YOUR-PAGE-ID/\n" +
"- Alerts: email + Slack to <your channel>.\n" +
"\n" +
"## White-box (CloudWatch)\n" +
"\n" +
"### Billing alarm\n" +
"- Metric: AWS/Billing EstimatedCharges (USD)\n" +
"- Threshold: > $50\n" +
"- Period: 6h, EvaluationPeriods: 1\n" +
"- Notification: SNS → email\n" +
"\n" +
"### CloudFront 5xx rate\n" +
"- Metric: AWS/CloudFront 5xxErrorRate\n" +
"- Threshold: > 1.0% sustained for 10 minutes\n" +
"- Period: 5min, EvaluationPeriods: 2\n" +
"- treat_missing_data: notBreaching\n" +
"- Notification: SNS → email (alarm + recovery)\n" +
"\n" +
"## Logs\n" +
"CloudFront access logs → s3://cloudfront-logs-YOUR-NAME/portfolio/\n" +
"Queryable via Athena (cf_logs table).\n" +
"\n" +
"## Tested\n" +
"All alarms exercised via `aws cloudwatch set-alarm-state ... ALARM` + verified notification arrived.\n" +
"\n" +
"## Limitations / known gaps\n" +
"- No alarm for DNS / cert issues (rely on BetterUptime).\n" +
"- No latency budget alarm yet (consider for v0.5).\n" +
"- Single recipient for alerts (consider PagerDuty for v0.5).\n" +
"```\n\n" +
"## README update\n" +
"```markdown\n" +
"## Monitoring\n" +
"See [MONITORING.md](MONITORING.md). Uptime + 5xx + billing alarms.\n" +
"Live status: https://yoursite.com/status\n" +
"\n" +
"## Roadmap\n" +
"- [x] v0.1 — bucket + static site\n" +
"- [x] v0.2 — custom domain + HTTPS\n" +
"- [x] v0.3 — automated CI/CD\n" +
"- [x] v0.4 — monitoring + alarms (you are here)\n" +
"- [ ] v1.0 — containerise + reusable IaC module\n" +
"```\n\n" +
"## Tag\n" +
"```bash\n" +
"git add MONITORING.md README.md status.html\n" +
"git commit -m 'docs: monitoring writeup + status page'\n" +
"git tag v0.4\n" +
"git push && git push --tags\n" +
"```"
      ),
      S([
        { prompt: "A MONITORING.md with named thresholds + tested-state notes is portfolio-grade.", answer: true, whenRight: "Right — recruiters who read this know you operate, not just code. Rare differentiator.", whenWrong: "Yes — operational paperwork = senior signal. Document the thresholds + the tests." },
        { prompt: "Limitations and known gaps belong in MONITORING.md.", answer: true, whenRight: "Right — honest gaps prevent over-claiming. Caveat = credibility.", whenWrong: "Yes — own the gaps. Hidden gaps get caught; named ones earn trust." },
        { prompt: "Edge Portfolio is now finished — no v0.5 or beyond.", answer: false, whenRight: "Right — v1.0 next week containerises the build. Then you can claim full-stack ops for the project.", whenWrong: "v1.0 is the destination — containerised, IaC-modular, fully reusable. Then we pivot tracks." }
      ]),
      E("Your turn — ship v0.4", "[PRODUCE]\n1. Write MONITORING.md from the template.\n2. Update README roadmap.\n3. Tag: `git tag v0.4 && git push --tags`.\n\nPASS:\n[x] Uptime alarm tested + receives alert\n[x] Billing alarm created + tested\n[x] 5xx alarm created + tested\n[x] /status page deployed and linked\n[x] CloudFront logs enabled (optional but encouraged)\n[x] MONITORING.md committed\n[x] v0.4 tag pushed")
    ])
  ]
};

/* ════ W5 — Docker — Containers from first principles ════ */
const W5 = {
  number: 5, title: "Docker — Containers from First Principles",
  phase: "Containers", commitment_hours: "20-25",
  context: ds.weeks[4].context,
  concept_check: [
    { q: "What's the precise difference between a Docker image and a container?",
      choices: ["Same thing","An image is an immutable blueprint (layers of files + metadata). A container is a running process started from an image. One image, many concurrent containers — same way a class spawns many instances",
        "Magic","Random"],
      correct: 1, explain: "An image is on disk: a tarball of filesystem layers, a config (entrypoint, env, ports), and metadata. A container is a runtime instance: a Linux process running with namespace isolation, started from an image's filesystem. The same image can run as 100 containers concurrently. Forgetting this distinction is the #1 source of confusion for newcomers." },
    { q: "Why does Docker on macOS / Windows need a Linux VM underneath?",
      choices: ["Magic","Containers are Linux kernel features (namespaces, cgroups). They cannot run natively on the macOS or Windows kernels. Docker Desktop ships a tiny Linux VM (HyperKit / WSL2) and runs containers inside that",
        "Tradition","No reason"],
      correct: 1, explain: "Containers aren't a VM technology; they're a *Linux kernel* feature stack — namespaces (isolation) + cgroups (resource limits) + chroot-like filesystem views. macOS and Windows kernels don't have those primitives. Docker Desktop solves this by running a small Linux VM in the background and forwarding `docker` commands into it. That's why your laptop's `docker run` is technically running on Linux even when you're on macOS." },
    { q: "Why are Dockerfile layers cached?",
      choices: ["Tradition","Each instruction becomes a layer. If the inputs to a layer haven't changed since last build, Docker reuses the cached output — making rebuilds 10-100x faster. Order instructions so slow-changing things (apt-installs) come BEFORE fast-changing things (your source code)",
        "Required","Random"],
      correct: 1, explain: "Every Dockerfile instruction produces a content-addressed layer. Docker hashes the layer's inputs (the parent layer + the instruction + the files COPY'd in); if that hash matches a previously-built layer, the cached layer is reused. Edit one line of source code: only the COPY-source-code layer and everything after it rebuilds. Edit the Dockerfile to add a system package: the apt layer and everything after it rebuilds. Ordering matters — put slow, stable stuff (FROM, system deps) FIRST; fast-changing stuff (source code) LAST." }
  ],
  days: [
    D(1, "A container is not a tiny VM", "Process isolation via Linux kernel features. Watch the canonical 100-second intro.", [
      L("The kernel-features mental model",
"## The pitch\n" +
"A container is one or more Linux processes running with:\n" +
"- A private view of the filesystem (chroot-like).\n" +
"- A private view of the process tree (`pid` namespace — `ps aux` inside shows ONLY container processes).\n" +
"- A private network stack (`net` namespace — own IP, own ports).\n" +
"- A private hostname (`uts` namespace).\n" +
"- Resource limits enforced by cgroups (max RAM, max CPU shares).\n" +
"\n" +
"That's it. No emulated hardware. No second kernel. Just the host kernel exposing isolated *views* of itself per container.\n\n" +
"## Container vs VM\n" +
"```text\n" +
"VM                          Container\n" +
"────                        ─────────\n" +
"Hypervisor (KVM, ESXi)      Container runtime (containerd)\n" +
"Guest kernel                Shared host kernel\n" +
"Boots in seconds            Starts in milliseconds\n" +
"~GB image                   ~MB image\n" +
"Strong isolation            Process-level isolation\n" +
"Heavy, slow                 Light, fast\n" +
"```\n\n" +
"## What you build this week\n" +
"By Sunday:\n" +
"- A multi-stage Dockerfile for a Node.js (or static site) build\n" +
"- An image tagged + pushed to Docker Hub\n" +
"- Run it locally with `docker run -p 8080:80 yourname/edge-portfolio:1.0`\n" +
"- A working README so anyone clones + runs in 30 seconds\n\n" +
"## The killer property\n" +
"\"Works on my machine\" stops being a sentence anyone can say. The image runs identically on macOS / Windows / Linux / CI / production."
      ),
      V("Docker in 100 Seconds", "https://www.youtube.com/watch?v=Gjnup-PuquQ", 2, "Fireship",
        "Watch first. 100 seconds. The image-vs-container mental model + Dockerfile + run command — same beats as the lesson above, visual."),
      R("Docker official — What is a container?", "https://www.docker.com/resources/what-container/",
        "Read after the video. Skim the diagram comparing containers and VMs."),
      S([
        { prompt: "Docker containers each have their own kernel.", answer: false, whenRight: "Right — no. Containers share the HOST kernel. Namespaces give isolated views; no separate kernel.", whenWrong: "Shared kernel. That's why containers are so light vs VMs. Namespaces isolate the views, not the kernel itself." },
        { prompt: "An image is a running thing; a container is a stored thing.", answer: false, whenRight: "Right — opposite. Image = stored blueprint. Container = running process from that blueprint.", whenWrong: "Reversed. Image on disk, container running. Same image can spawn many containers concurrently." },
        { prompt: "Docker on macOS uses a Linux VM under the hood.", answer: true, whenRight: "Right — containers ARE Linux kernel features. Mac/Windows = Linux VM via Docker Desktop.", whenWrong: "Yes — there's a Linux VM running. Docker Desktop hides it from you, but `docker run` is happening on Linux underneath." }
      ]),
      E("Your turn — frame Docker", "[WRITE] In `docker/INTRO.md`:\n1. State Docker's value prop in your own words in 2 sentences.\n2. Name 2 things that surprised you about containers vs VMs.\n3. State the week's goal: by Sunday `docker run -p 8080:80 yourname/edge-portfolio:1.0` serves my site on localhost:8080, AND the image is on Docker Hub.")
    ]),
    D(2, "Install + first container", "Docker Desktop installed, `docker run hello-world` passes.", [
      L("Install + verify",
"## Install Docker Desktop\n" +
"- **macOS**: download from docker.com/products/docker-desktop. Drag to Applications. Launch.\n" +
"- **Windows**: ensure WSL2 enabled, install from same URL.\n" +
"- **Linux**: native `docker` package or Docker Desktop for Linux (newer).\n\n" +
"After install, in a fresh terminal:\n" +
"```bash\n" +
"docker --version\n" +
"# Docker version 27.x ...\n\n" +
"docker run hello-world\n" +
"```\n" +
"You should see the welcome message. If you do, Docker is working end-to-end (image pulled from Docker Hub, container ran, output captured).\n\n" +
"## The five commands you'll use most\n" +
"```bash\n" +
"docker pull IMAGE                 # download an image\n" +
"docker run -p HOST:CONT IMAGE     # run a container, map ports\n" +
"docker ps                         # list running containers\n" +
"docker logs CONTAINER             # see its output\n" +
"docker stop CONTAINER             # graceful stop (SIGTERM)\n" +
"```\n\n" +
"## Run a real image — nginx\n" +
"```bash\n" +
"docker run -d --name web -p 8080:80 nginx:alpine\n" +
"# -d         detached (background)\n" +
"# --name     give it a friendly name\n" +
"# -p 8080:80 map host port 8080 to container port 80\n" +
"```\n\n" +
"Open http://localhost:8080 — you'll see the nginx welcome page. Inside a Docker container. Running. Just like that.\n\n" +
"```bash\n" +
"docker ps               # confirms it's running\n" +
"docker logs web         # nginx access logs\n" +
"docker stop web         # graceful stop\n" +
"docker rm web           # remove the container record\n" +
"```\n\n" +
"## Inspect the container's worldview\n" +
"```bash\n" +
"# spin one up again, this time exec into it\n" +
"docker run -d --name web -p 8080:80 nginx:alpine\n" +
"docker exec -it web sh\n" +
"# inside the container now\n" +
"ps aux              # only the nginx process — pid namespace at work\n" +
"ls /                # alpine root — different from your host\n" +
"hostname            # synthetic name like '7f3a2c...'\n" +
"exit\n" +
"```\n\n" +
"Different process list. Different filesystem. Different hostname. All on your machine. The namespaces in action."
      ),
      R("Docker — Get started", "https://docs.docker.com/get-started/", "Read in parallel with the lesson. Skim 'What is a container?' and 'Sample application'."),
      S([
        { prompt: "`docker run -p 8080:80 nginx` maps host port 80 to container port 8080.", answer: false, whenRight: "Right — opposite. The order is HOST:CONT, so 8080 on the host → 80 inside the container.", whenWrong: "Host first. `8080:80` = host 8080 → container 80. Read left-to-right as 'outside : inside'." },
        { prompt: "`docker exec -it container sh` gives you a shell inside the running container.", answer: true, whenRight: "Right — same image, same namespace; you join it interactively.", whenWrong: "Yes — `exec -it` is the get-inside command. Useful for debugging." },
        { prompt: "`docker stop` immediately kills the container with SIGKILL.", answer: false, whenRight: "Right — `docker stop` sends SIGTERM (graceful), waits 10s, THEN SIGKILL. `docker kill` is immediate.", whenWrong: "SIGTERM first, grace period, then SIGKILL. Use `docker kill` if you want immediate." }
      ]),
      E("Your turn — first container", "[CODE]\n1. Install Docker Desktop (or native docker). Confirm `docker --version`.\n2. `docker run hello-world` — passes.\n3. `docker run -d --name web -p 8080:80 nginx:alpine`. Open http://localhost:8080.\n4. `docker exec -it web sh`; run `ps aux` and `hostname`; exit.\n5. `docker stop web && docker rm web`.\n6. Record in NOTES.md: what surprised you about the namespace isolation.")
    ]),
    D(3, "First Dockerfile", "Write one that builds a working image for your project.", [
      L("Dockerfile basics",
"## The smallest useful Dockerfile (Node app)\n" +
"```dockerfile\n" +
"# Dockerfile\n" +
"FROM node:20-alpine                  # base image — minimal Linux + Node 20\n" +
"WORKDIR /app                         # cd into /app inside the container\n" +
"COPY package*.json ./                # copy lockfiles ONLY first\n" +
"RUN npm ci --only=production         # install deps from lockfile\n" +
"COPY . .                             # copy the rest of the source\n" +
"EXPOSE 3000                          # documentation; doesn't actually publish\n" +
"CMD [\"node\", \"server.js\"]            # default command when container starts\n" +
"```\n\n" +
"## Why two COPYs?\n" +
"Cache discipline. The first `COPY package*.json` + `RUN npm ci` becomes a cached layer keyed on the lockfile. If lockfile didn't change → npm install is skipped on rebuild. Source code changes in the second `COPY . .` — only that layer and downstream layers rebuild. Saves 30+ seconds on every iteration.\n\n" +
"## For a static site (Edge Portfolio)\n" +
"```dockerfile\n" +
"FROM nginx:alpine\n" +
"COPY index.html /usr/share/nginx/html/index.html\n" +
"# optional: copy a custom nginx.conf if needed\n" +
"EXPOSE 80\n" +
"# CMD inherits nginx's default — runs the daemon\n" +
"```\n\n" +
"That's the WHOLE build. nginx:alpine is ~50MB; this image adds ~1KB. Done.\n\n" +
"## Build it\n" +
"```bash\n" +
"# from your repo root\n" +
"docker build -t edge-portfolio:0.1 .\n" +
"#         tag image as edge-portfolio:0.1\n" +
"# trailing . = build context (current directory)\n" +
"```\n\n" +
"Docker uploads the context to the daemon, runs each instruction, produces a layered image. Watch the output — each line shows a layer cache hit or rebuild.\n\n" +
"## Run it\n" +
"```bash\n" +
"docker run -d --name portfolio -p 8080:80 edge-portfolio:0.1\n" +
"# Open http://localhost:8080 — your portfolio served by nginx in a container\n" +
"```\n\n" +
"## The .dockerignore — non-optional\n" +
"Create `.dockerignore` in repo root:\n" +
"```\n" +
"node_modules\n" +
".git\n" +
".github\n" +
"*.md\n" +
"Dockerfile\n" +
".dockerignore\n" +
"```\n" +
"Without this, `COPY . .` copies your `.git` directory, your local `node_modules`, everything. Image bloats 10x. ALWAYS .dockerignore."
      ),
      S([
        { prompt: "`COPY package*.json ./` before `COPY . .` is a layer-cache optimisation, not a syntax requirement.", answer: true, whenRight: "Right — semantically equivalent to one COPY, but enables npm install to be cached when lockfile didn't change.", whenWrong: "Yes — cache discipline. Slow stable stuff first; fast-changing last. Iteration time drops dramatically." },
        { prompt: "A missing `.dockerignore` can balloon image size 10x.", answer: true, whenRight: "Right — `.git` alone is often hundreds of MB. node_modules too. Always .dockerignore.", whenWrong: "Yes — set it once, save GB. Single highest-leverage file in any Docker repo." },
        { prompt: "`EXPOSE 80` in a Dockerfile actually publishes port 80 to your host.", answer: false, whenRight: "Right — no. `EXPOSE` is documentation. `-p` on `docker run` is what publishes.", whenWrong: "EXPOSE = documentation. `-p 8080:80` on `docker run` is what actually maps the port." }
      ]),
      E("Your turn — Dockerfile", "[CODE]\n1. Write a Dockerfile in your repo (use the static-site template if portfolio; the Node template if you have an app).\n2. Create .dockerignore.\n3. `docker build -t edge-portfolio:0.1 .` — succeeds.\n4. `docker run -d -p 8080:80 edge-portfolio:0.1`. Open localhost:8080. Confirm site renders.\n5. Make a trivial source change. Rebuild. Notice which layers cached.\n6. Commit Dockerfile + .dockerignore.")
    ]),
    D(4, "Multi-stage builds", "Build with heavy tools; ship only the runtime.", [
      L("Why multi-stage",
"## The problem\n" +
"For a TypeScript or webpack-built app, you need a node + npm + dev-deps environment to BUILD the bundle. But the runtime only needs the bundle + maybe a tiny static server.\n\n" +
"Single-stage: image ships 800MB of devDependencies and a node toolchain it never uses.\n\n" +
"Multi-stage: separate the build environment from the runtime image; only the bundle ships.\n\n" +
"## The pattern\n" +
"```dockerfile\n" +
"# ───── Stage 1: build ─────\n" +
"FROM node:20-alpine AS build\n" +
"WORKDIR /app\n" +
"COPY package*.json ./\n" +
"RUN npm ci                       # devDeps included for the build\n" +
"COPY . .\n" +
"RUN npm run build                # output e.g. /app/dist\n\n" +
"# ───── Stage 2: runtime ─────\n" +
"FROM nginx:alpine\n" +
"COPY --from=build /app/dist /usr/share/nginx/html\n" +
"EXPOSE 80\n" +
"```\n\n" +
"Two `FROM`s = two stages. Final image is based on the LAST stage only; intermediate stage gets discarded.\n\n" +
"## What you ship\n" +
"```text\n" +
"Single-stage with node:20:      ~1 GB\n" +
"Multi-stage with nginx:alpine:  ~50 MB (nginx base) + your bundle\n" +
"```\n\n" +
"20x smaller image. Faster pulls. Smaller attack surface (no node + npm in prod).\n\n" +
"## For a Node API (runtime that DOES need node)\n" +
"```dockerfile\n" +
"FROM node:20-alpine AS build\n" +
"WORKDIR /app\n" +
"COPY package*.json ./\n" +
"RUN npm ci\n" +
"COPY . .\n" +
"RUN npm run build && npm prune --production\n\n" +
"FROM node:20-alpine AS runtime\n" +
"WORKDIR /app\n" +
"COPY --from=build /app/node_modules ./node_modules\n" +
"COPY --from=build /app/dist ./dist\n" +
"COPY --from=build /app/package.json ./package.json\n" +
"USER node                        # non-root\n" +
"EXPOSE 3000\n" +
"CMD [\"node\", \"dist/server.js\"]\n" +
"```\n\n" +
"Two stages, final image has only production deps + the compiled output. ~150MB instead of ~1.2GB.\n\n" +
"## Build + verify\n" +
"```bash\n" +
"docker build -t edge-portfolio:0.2 .\n" +
"docker image ls edge-portfolio    # check the SIZE column\n" +
"```\n\n" +
"Compare before/after sizes. Real numbers; visible win."
      ),
      S([
        { prompt: "Multi-stage builds discard intermediate stages from the final image.", answer: true, whenRight: "Right — only the LAST stage ships. Intermediate stages exist during build only.", whenWrong: "Yes — last stage = the shipped image. Earlier stages are scratchpads, discarded." },
        { prompt: "A 20x size reduction is realistic when moving from single-stage to multi-stage.", answer: true, whenRight: "Right — typical for TypeScript/webpack projects. Dev tools alone are GB.", whenWrong: "Yes — 10-50x reduction is common. The build toolchain is heavy; the runtime usually isn't." },
        { prompt: "Smaller images are only a cost optimisation; security doesn't matter.", answer: false, whenRight: "Right — no. Fewer packages = smaller attack surface = fewer CVEs to patch. Real security gain.", whenWrong: "Both cost AND security. Every package in the image is a potential CVE. Minimise." }
      ]),
      E("Your turn — multi-stage", "[CODE]\n1. Refactor your Dockerfile to multi-stage (use the appropriate template).\n2. `docker build -t edge-portfolio:0.2 .`.\n3. `docker image ls` — note the size.\n4. Run + verify the site/app still works at localhost:8080.\n5. Record both image sizes in NOTES.md.")
    ]),
    D(5, "Persistence + multi-container basics", "Volumes for data; preview compose without diving deep.", [
      L("Volumes — when state matters",
"## Why containers + state is tricky\n" +
"Containers are EPHEMERAL by design. Kill the container, you lose its filesystem.\n\n" +
"Most app data shouldn't live in the container — it should live in a Docker VOLUME or be mounted from the host.\n\n" +
"## Three storage flavours\n" +
"```text\n" +
"1. Container layer (default)\n" +
"   Writable layer attached to the container.\n" +
"   Vanishes on docker rm.\n" +
"   Use only for temp / cache data you don't care about.\n" +
"\n" +
"2. Bind mount\n" +
"   Mount a HOST directory into the container.\n" +
"   docker run -v /host/path:/container/path ...\n" +
"   Best for dev: edit on host, container sees changes immediately.\n" +
"\n" +
"3. Named volume\n" +
"   Docker-managed storage with a name.\n" +
"   docker volume create mydata\n" +
"   docker run -v mydata:/var/lib/data ...\n" +
"   Best for prod data (Postgres, etc) — survives container removal,\n" +
"   no host filesystem layout coupling.\n" +
"```\n\n" +
"## See it in action — Postgres with a named volume\n" +
"```bash\n" +
"docker volume create pg-data\n\n" +
"docker run -d --name pg \\\n" +
"  -e POSTGRES_PASSWORD=secret \\\n" +
"  -v pg-data:/var/lib/postgresql/data \\\n" +
"  -p 5432:5432 \\\n" +
"  postgres:16-alpine\n\n" +
"# create a row\n" +
"docker exec -it pg psql -U postgres -c \"CREATE TABLE t (x int); INSERT INTO t VALUES (1);\"\n\n" +
"# nuke the container\n" +
"docker stop pg && docker rm pg\n\n" +
"# start a NEW container with the same volume\n" +
"docker run -d --name pg \\\n" +
"  -e POSTGRES_PASSWORD=secret \\\n" +
"  -v pg-data:/var/lib/postgresql/data \\\n" +
"  -p 5432:5432 \\\n" +
"  postgres:16-alpine\n\n" +
"# data is still there\n" +
"docker exec -it pg psql -U postgres -c \"SELECT * FROM t;\"\n" +
"#  x \n" +
"# ---\n" +
"#  1\n" +
"```\n\n" +
"The container died; the volume persisted. That's how stateful services work in Docker.\n\n" +
"## What about multi-container apps?\n" +
"A real app = api + db + cache, all running together. Doing this with raw `docker run` is painful (network setup, dependency ordering). That's what Docker Compose solves — entire topic next week (W6)."
      ),
      S([
        { prompt: "Data written to a container's filesystem (no volume) survives `docker rm`.", answer: false, whenRight: "Right — no. Container layer vanishes with the container. Use volumes for anything you want to keep.", whenWrong: "Lost. Container layer is ephemeral. Volumes / bind mounts / external storage for anything persistent." },
        { prompt: "Bind mounts are best for dev; named volumes are best for production state.", answer: true, whenRight: "Right — bind = host-coupled; great for live-reload. Named = managed by Docker; portable across hosts.", whenWrong: "Yes — bind for dev iteration, named for prod data. Different tools for different jobs." },
        { prompt: "Running Postgres in a container with a named volume is reasonable for development.", answer: true, whenRight: "Right — entirely. Pin a version, mount the volume, get the same DB everywhere. Standard pattern.", whenWrong: "Yes — totally reasonable for dev. Production is a separate decision (managed RDS often beats self-hosted)." }
      ]),
      E("Your turn — volumes", "[CODE]\n1. Run Postgres with a named volume per the lesson.\n2. Insert a row.\n3. Stop + remove the container.\n4. Start a new Postgres container against the same volume.\n5. Confirm the row is still there.\n6. NOTES.md: what would you LOSE if you skipped the volume?")
    ]),
    D(6, "Registries — push to Docker Hub", "Public image that anyone can pull.", [
      L("Tag + push",
"## The flow\n" +
"```text\n" +
"local image  ──[tag with registry prefix]──> registry-qualified name ──[push]──> Docker Hub\n" +
"```\n\n" +
"## Step 1 — Docker Hub account\n" +
"Sign up at hub.docker.com (free). Note your username; e.g. `yourname`.\n\n" +
"## Step 2 — login\n" +
"```bash\n" +
"docker login\n" +
"# enter username + password\n" +
"# (or use a Personal Access Token from Account Settings → Security)\n" +
"```\n\n" +
"## Step 3 — tag your image\n" +
"```bash\n" +
"# the image you built locally\n" +
"docker image ls edge-portfolio\n\n" +
"# add a registry-qualified tag\n" +
"docker tag edge-portfolio:0.2 yourname/edge-portfolio:1.0\n" +
"docker tag edge-portfolio:0.2 yourname/edge-portfolio:latest   # convention\n" +
"```\n\n" +
"## Step 4 — push\n" +
"```bash\n" +
"docker push yourname/edge-portfolio:1.0\n" +
"docker push yourname/edge-portfolio:latest\n" +
"```\n\n" +
"Each layer uploads to Hub. Existing layers (nginx:alpine base) are deduplicated — only YOUR layers actually upload.\n\n" +
"## Verify\n" +
"Visit https://hub.docker.com/r/yourname/edge-portfolio — your image page appears with the tags.\n\n" +
"## Anyone can now pull and run\n" +
"```bash\n" +
"docker pull yourname/edge-portfolio:1.0\n" +
"docker run -d -p 8080:80 yourname/edge-portfolio:1.0\n" +
"```\n\n" +
"That's distribution. From your laptop to anyone's machine in a single command.\n\n" +
"## Tagging conventions\n" +
"```text\n" +
"yourname/edge-portfolio:1.0        # specific version\n" +
"yourname/edge-portfolio:1          # major-version pin\n" +
"yourname/edge-portfolio:latest     # 'most recent' floating\n" +
"yourname/edge-portfolio:sha-abc123 # git-sha pin for reproducibility\n" +
"```\n\n" +
"For production: pin to a specific tag (not `latest`). `latest` is a moving target; pinning is reproducibility."
      ),
      S([
        { prompt: "`latest` is a safe tag for production deployments.", answer: false, whenRight: "Right — no. `latest` is a moving target. Pin to a specific version or git-sha for reproducible deploys.", whenWrong: "Pin specifically. `latest` changes under you and breaks deploys." },
        { prompt: "Pushing to Docker Hub uploads layers that the registry already has.", answer: false, whenRight: "Right — no. Layers are content-addressed; existing ones are deduplicated; only new layers actually upload.", whenWrong: "Dedup. Public base layers (nginx:alpine) are already on Hub; you only upload YOUR layers." },
        { prompt: "Once an image is on Docker Hub, anyone can `docker pull` it.", answer: true, whenRight: "Right — if it's public. Private repos require auth.", whenWrong: "Public images: anyone, no auth. Private: requires login. Default for free tier = public." }
      ]),
      E("Your turn — push", "[PRODUCE]\n1. Sign up at hub.docker.com if you haven't.\n2. `docker login`.\n3. Tag your edge-portfolio image as `yourname/edge-portfolio:1.0`.\n4. `docker push`.\n5. Visit hub.docker.com/r/yourname/edge-portfolio; confirm image is there.\n6. Test the round-trip: `docker pull yourname/edge-portfolio:1.0 && docker run -p 8081:80 yourname/edge-portfolio:1.0`. Open localhost:8081.")
    ]),
    D(7, "Ship Edge Portfolio v1.0 — containerised", "Tag the milestone, document, ship.", [
      L("README + tag",
"## README addition\n" +
"```markdown\n" +
"## Run with Docker\n" +
"```bash\n" +
"docker run -d -p 8080:80 yourname/edge-portfolio:1.0\n" +
"# open http://localhost:8080\n" +
"```\n" +
"\n" +
"Image on Docker Hub: https://hub.docker.com/r/yourname/edge-portfolio\n" +
"\n" +
"## Build locally\n" +
"```bash\n" +
"git clone https://github.com/yourname/edge-portfolio\n" +
"cd edge-portfolio\n" +
"docker build -t edge-portfolio:dev .\n" +
"docker run -d -p 8080:80 edge-portfolio:dev\n" +
"```\n" +
"\n" +
"## Roadmap\n" +
"- [x] v0.1 — bucket + static site\n" +
"- [x] v0.2 — custom domain + HTTPS\n" +
"- [x] v0.3 — automated CI/CD\n" +
"- [x] v0.4 — monitoring + alarms\n" +
"- [x] v1.0 — containerised + on Docker Hub (you are here)\n" +
"```\n\n" +
"## DOCKER.md — the short writeup\n" +
"```markdown\n" +
"# Containerisation\n" +
"\n" +
"## Image\n" +
"- Base: nginx:alpine (~50 MB)\n" +
"- Multi-stage build: build with node:20-alpine, ship only the static dist\n" +
"- Final size: ~52 MB (visible in `docker image ls`)\n" +
"\n" +
"## Registry\n" +
"hub.docker.com/r/yourname/edge-portfolio\n" +
"Tags: 1.0, 1, latest\n" +
"\n" +
"## Quickstart\n" +
"docker run -d -p 8080:80 yourname/edge-portfolio:1.0\n" +
"\n" +
"## Honest limitations\n" +
"- nginx serves on port 80 as root inside the container — for a static site\n" +
"  this is fine but generally we'd run as non-root user (W7 will harden this).\n" +
"- No image-signing yet (W7).\n" +
"- No vulnerability scan in CI yet (W7).\n" +
"```\n\n" +
"## Tag and ship\n" +
"```bash\n" +
"git add Dockerfile .dockerignore DOCKER.md README.md\n" +
"git commit -m 'docs: containerisation writeup'\n" +
"git tag v1.0\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## What you can now claim\n" +
"- Public site at yourdomain.com (v0.2).\n" +
"- Automated CI/CD on every push (v0.3).\n" +
"- Real monitoring with alarms (v0.4).\n" +
"- Containerised + on Docker Hub (v1.0).\n" +
"\n" +
"That's a full ops loop on one project. From here W6-W7 deepen the container story (Compose for multi-service; hardening for security)."
      ),
      S([
        { prompt: "v1.0 here means 'production-ready'.", answer: false, whenRight: "Right — it's a milestone tag, not a production guarantee. Hardening lands W7.", whenWrong: "v1.0 = milestone. Not a release certification. Honest tagging." },
        { prompt: "Documenting honest limitations in DOCKER.md weakens the project.", answer: false, whenRight: "Right — opposite. Named gaps = credibility. Recruiters notice this differentiates senior thinking.", whenWrong: "Strengthens. Senior signal. Hidden gaps get found; named ones earn trust." },
        { prompt: "Shipping the image to Docker Hub plus a working README is enough for a recruiter to verify the project.", answer: true, whenRight: "Right — `docker pull && docker run` is the universal reproduce-it command. Recruiters love it.", whenWrong: "Yes — fully reproducible in two commands. Cleanest demo possible." }
      ]),
      E("Your turn — ship v1.0", "[PRODUCE]\n1. Write DOCKER.md from the template (substitute YOUR sizes + URL).\n2. Update README's Run with Docker section + roadmap.\n3. Commit + tag v1.0 + push tags.\n\nPASS:\n[x] Dockerfile + .dockerignore committed\n[x] Image on Docker Hub (yourname/edge-portfolio:1.0)\n[x] `docker pull && docker run` works from anywhere\n[x] DOCKER.md committed with honest limitations\n[x] README's Roadmap shows v1.0 checked\n[x] v1.0 tag pushed")
    ])
  ]
};

/* ════ W6 — Docker Compose, local dev, the inner loop ════ */
const W6 = {
  number: 6, title: "Docker Compose, Local Dev, and the Inner Loop",
  phase: "Containers", commitment_hours: "15-20",
  context: ds.weeks[5].context,
  concept_check: [
    { q: "Why does Compose make multi-container apps easier than raw `docker run`?",
      choices: ["Magic","One YAML file declares every service + network + volume. `docker compose up` creates them all with one command, in the right order, on a shared network. `docker run` requires manual networking + dependency management for every container",
        "Required","Random"],
      correct: 1, explain: "Raw `docker run`: create a network, run postgres with -v + -p + --network, wait for it to be ready, run redis with --network, wait, run api with --network --link or env vars pointing at postgres + redis... five terminal commands per restart. Compose makes that one YAML + one command. Plus services on the same Compose network can address each other by name (`postgres`, `redis`) instead of IP. Same primitives; sane orchestration." },
    { q: "Why use a bind mount on source code for dev but bake source INTO the image for production?",
      choices: ["Tradition","Bind mount = live reload on host file changes (fast inner loop). Image-baked = immutable, reproducible, no host coupling (deployable artifact). Different optimisations for different phases of the workflow",
        "Required","No reason"],
      correct: 1, explain: "Dev needs fast iteration: edit, see change. Bind mount mounts your local source into the container so file changes propagate without rebuilding. Production needs reproducibility + portability: the image must contain everything it needs, identical on every host. Different stages, different storage strategies — both right for their context." },
    { q: "Why does `depends_on: { condition: service_healthy }` matter beyond just `depends_on`?",
      choices: ["Verbose","`depends_on` only waits for the dependent CONTAINER to START — not for the application inside to be READY. `service_healthy` waits until the healthcheck passes, which actually means 'ready to accept connections'",
        "Required","Same thing"],
      correct: 1, explain: "Container started ≠ Postgres accepting connections. A typical bug: api container starts immediately after postgres container starts, tries to connect, gets refused, crashes. `service_healthy` gates on the healthcheck (e.g. `pg_isready -U postgres`); only when that passes does the api container start. Eliminates the race." }
  ],
  days: [
    D(1, "Orient — why Compose", "Multi-container with one file.", [
      L("Compose in one breath",
"## The problem\n" +
"Your local dev needs: web app + Postgres + Redis + maybe MailHog for email testing. With raw Docker, that's:\n" +
"```bash\n" +
"docker network create app-net\n" +
"docker volume create pg-data\n" +
"docker run -d --name pg --network app-net -v pg-data:/var/lib/postgresql/data -e POSTGRES_PASSWORD=secret postgres:16\n" +
"docker run -d --name redis --network app-net redis:7-alpine\n" +
"docker run -d --name mail --network app-net -p 8025:8025 mailhog/mailhog\n" +
"docker run -d --name api --network app-net -p 3000:3000 -e DATABASE_URL=postgres://postgres:secret@pg:5432/postgres -e REDIS_URL=redis://redis:6379 myapp:dev\n" +
"```\n" +
"Five commands. Half a dozen flags each. Memorise the connection URLs. Re-type after every reboot.\n\n" +
"## The Compose version\n" +
"```yaml\n" +
"# docker-compose.yml\n" +
"services:\n" +
"  pg:\n" +
"    image: postgres:16\n" +
"    environment: { POSTGRES_PASSWORD: secret }\n" +
"    volumes: [pg-data:/var/lib/postgresql/data]\n" +
"  redis:\n" +
"    image: redis:7-alpine\n" +
"  mail:\n" +
"    image: mailhog/mailhog\n" +
"    ports: ['8025:8025']\n" +
"  api:\n" +
"    build: .\n" +
"    ports: ['3000:3000']\n" +
"    environment:\n" +
"      DATABASE_URL: postgres://postgres:secret@pg:5432/postgres\n" +
"      REDIS_URL: redis://redis:6379\n" +
"    depends_on: [pg, redis]\n\n" +
"volumes:\n" +
"  pg-data:\n" +
"```\n\n" +
"```bash\n" +
"docker compose up -d           # everything, one command\n" +
"docker compose logs -f api     # follow the api logs\n" +
"docker compose down            # stop + remove everything\n" +
"```\n\n" +
"That's it. The YAML is the source of truth for what your dev environment IS.\n\n" +
"## What you ship this week\n" +
"`docker-compose.yml` for a real two-service setup (Node API + Postgres):\n" +
"- API live-reloads on source change (bind mount).\n" +
"- Postgres persists data via named volume.\n" +
"- Healthcheck on Postgres; API waits for it.\n" +
"- Env vars in a `.env` file (NOT committed).\n" +
"- `docker compose up` brings the whole world up in <10 seconds."
      ),
      S([
        { prompt: "Services in the same Compose file can address each other by service name (e.g. `pg:5432`).", answer: true, whenRight: "Right — Compose creates a default network; service names become DNS names on it.", whenWrong: "Yes — service name = DNS name on the Compose network. Don't hardcode IPs." },
        { prompt: "`docker compose down` deletes named volumes by default.", answer: false, whenRight: "Right — no. Volumes survive. Use `down -v` if you really want to nuke them.", whenWrong: "Survives. `down` removes containers + network; volumes persist unless you pass `-v`." },
        { prompt: "Compose is suitable for small production deploys on a single VM.", answer: true, whenRight: "Right — many companies run Compose in prod on a single VM for years. K8s only matters at scale.", whenWrong: "Yes — totally valid prod stack at small scale. K8s only when you outgrow it." }
      ]),
      E("Your turn — frame Compose", "[WRITE] In `compose/INTRO.md`:\n1. List the services you want in your dev environment (api + db at minimum).\n2. Note which need persistence (volumes) and which can be ephemeral.\n3. State the week's goal: `docker compose up` brings the whole stack up; my API can read+write the DB; source code changes hot-reload without rebuilding the image.")
    ]),
    D(2, "Write your first compose.yml", "Two services: a small Node API + Postgres.", [
      L("docker-compose.yml — minimal real version",
"## File\n" +
"```yaml\n" +
"# docker-compose.yml\n" +
"services:\n" +
"  pg:\n" +
"    image: postgres:16-alpine\n" +
"    restart: unless-stopped\n" +
"    environment:\n" +
"      POSTGRES_USER: app\n" +
"      POSTGRES_PASSWORD: app\n" +
"      POSTGRES_DB: app\n" +
"    volumes:\n" +
"      - pg-data:/var/lib/postgresql/data\n" +
"    ports:\n" +
"      - '5432:5432'\n" +
"    healthcheck:\n" +
"      test: ['CMD-SHELL', 'pg_isready -U app -d app']\n" +
"      interval: 5s\n" +
"      timeout: 3s\n" +
"      retries: 5\n\n" +
"  api:\n" +
"    build:\n" +
"      context: .\n" +
"      dockerfile: Dockerfile.dev      # see day 3 for this file\n" +
"    restart: unless-stopped\n" +
"    environment:\n" +
"      DATABASE_URL: postgres://app:app@pg:5432/app\n" +
"      NODE_ENV: development\n" +
"    ports:\n" +
"      - '3000:3000'\n" +
"    depends_on:\n" +
"      pg:\n" +
"        condition: service_healthy\n\n" +
"volumes:\n" +
"  pg-data:\n" +
"```\n\n" +
"## Bring it up\n" +
"```bash\n" +
"docker compose up -d              # detached\n" +
"docker compose ps                 # what's running\n" +
"docker compose logs -f api        # follow api logs\n" +
"docker compose down               # stop + remove containers (volume survives)\n" +
"```\n\n" +
"## Test connectivity\n" +
"```bash\n" +
"# from your host\n" +
"psql postgres://app:app@localhost:5432/app -c 'SELECT 1;'\n\n" +
"# OR from inside the api container\n" +
"docker compose exec api sh\n" +
"# inside container\n" +
"node -e \"const {Client}=require('pg'); const c=new Client({connectionString:process.env.DATABASE_URL}); c.connect().then(()=>c.query('SELECT 1')).then(r=>{console.log(r.rows); process.exit();})\"\n" +
"```\n\n" +
"## Why the healthcheck matters here\n" +
"Without `depends_on: { condition: service_healthy }`, the api starts the moment the pg CONTAINER is up — typically before pg is actually accepting connections. The api crashes on first DB query. The healthcheck eliminates this race."
      ),
      S([
        { prompt: "`restart: unless-stopped` makes the container come back up after `docker compose down`.", answer: false, whenRight: "Right — no. `unless-stopped` covers crashes + host reboots, but `compose down` is an explicit stop.", whenWrong: "Explicit stops are respected. `restart` covers crashes + boots, not deliberate stops." },
        { prompt: "Compose creates a default network for services in the file; they reach each other by service name.", answer: true, whenRight: "Right — the api can connect to `pg:5432`, not an IP. Compose-managed DNS.", whenWrong: "Yes — service-name DNS. Don't hardcode IPs; reach by name." },
        { prompt: "The healthcheck on Postgres is paranoid — `depends_on` alone is enough.", answer: false, whenRight: "Right — no. `depends_on` only waits for container START, not for readiness. Healthcheck makes 'ready' real.", whenWrong: "depends_on = container started, NOT app ready. Healthcheck is what gates on actual readiness." }
      ]),
      E("Your turn — first compose", "[CODE]\n1. Write docker-compose.yml from the lesson.\n2. `docker compose up -d`.\n3. `docker compose ps` — both services Up; pg shows healthy.\n4. Connect from host: `psql postgres://app:app@localhost:5432/app -c 'SELECT 1;'`.\n5. `docker compose down`.\n6. Bring it back up; confirm DB data persisted (after we add some next day).")
    ]),
    D(3, "Bind-mount source for live reload", "Dev Dockerfile + volume mount = hot reload without rebuild.", [
      L("Dockerfile.dev + bind mount",
"## The dev Dockerfile\n" +
"```dockerfile\n" +
"# Dockerfile.dev\n" +
"FROM node:20-alpine\n" +
"WORKDIR /app\n" +
"COPY package*.json ./\n" +
"RUN npm ci                       # install ALL deps including dev\n" +
"# DO NOT COPY source code here — it comes via bind mount\n" +
"EXPOSE 3000\n" +
"CMD [\"npm\", \"run\", \"dev\"]        # e.g. nodemon\n" +
"```\n\n" +
"`npm run dev` should run something like nodemon that watches the filesystem and restarts the process on file change.\n\n" +
"## docker-compose.yml — add the bind mount\n" +
"Update the `api` service:\n" +
"```yaml\n" +
"  api:\n" +
"    build:\n" +
"      context: .\n" +
"      dockerfile: Dockerfile.dev\n" +
"    environment:\n" +
"      DATABASE_URL: postgres://app:app@pg:5432/app\n" +
"      NODE_ENV: development\n" +
"    ports:\n" +
"      - '3000:3000'\n" +
"    volumes:\n" +
"      - .:/app                         # bind mount source ← THIS\n" +
"      - /app/node_modules              # anonymous volume preserves container's node_modules\n" +
"    depends_on:\n" +
"      pg:\n" +
"        condition: service_healthy\n" +
"```\n\n" +
"## Why two volume lines\n" +
"- `.:/app` — your local repo mounted at /app in the container. Edit on host → container sees instantly.\n" +
"- `/app/node_modules` — anonymous volume that 'masks' the host's node_modules. Without it, the host's (possibly empty or wrong-arch) node_modules would shadow the container's.\n" +
"\n" +
"This is the magic pattern for Node + Docker.\n\n" +
"## Try it\n" +
"```bash\n" +
"docker compose up -d --build       # --build rebuilds the image after Dockerfile.dev change\n" +
"docker compose logs -f api          # nodemon waiting for changes\n\n" +
"# In another terminal, edit a file in your repo\n" +
"# Save\n" +
"# Watch nodemon restart in the logs window — INSIDE the container\n" +
"```\n\n" +
"Fast inner loop, identical environment, no host node version pain."
      ),
      S([
        { prompt: "Bind-mounting source code is fine for production deploys.", answer: false, whenRight: "Right — no. Prod images bake the code in for immutability + reproducibility. Bind mounts are dev-only.", whenWrong: "Dev only. Prod = baked-in, immutable, reproducible. Different optimisation; different storage strategy." },
        { prompt: "The anonymous `/app/node_modules` volume prevents your host's node_modules from masking the container's.", answer: true, whenRight: "Right — classic gotcha. Without it, the container's node_modules disappears under the host bind mount.", whenWrong: "Yes — anonymous volume preserves the container's node_modules. Without it, fresh-install agony." },
        { prompt: "After editing source, you must `docker compose restart api` for the change to apply.", answer: false, whenRight: "Right — no. If you've configured nodemon or similar, the file change is detected automatically.", whenWrong: "Nodemon (or equivalent) auto-restarts. The whole point of the bind mount." }
      ]),
      E("Your turn — bind mount", "[CODE]\n1. Add Dockerfile.dev.\n2. Update docker-compose.yml with the bind mount + anonymous node_modules volume.\n3. `docker compose up -d --build`.\n4. Edit a source file; save.\n5. Watch `docker compose logs -f api` show nodemon restart.\n6. Confirm the change reflects when you hit the API.")
    ]),
    D(4, ".env files for secrets", "Keep dev passwords out of git.", [
      L(".env discipline in Compose",
"## The pattern\n" +
"Compose auto-reads a file called `.env` in the project root. Variables there can be referenced in `docker-compose.yml` with `${VAR}` syntax.\n\n" +
"## .env (NEVER COMMIT)\n" +
"```\n" +
"POSTGRES_USER=app\n" +
"POSTGRES_PASSWORD=this-is-only-for-dev\n" +
"POSTGRES_DB=app\n" +
"JWT_SECRET=dev-only-secret-rotate-for-prod\n" +
"```\n\n" +
"## .env.example (COMMIT)\n" +
"```\n" +
"POSTGRES_USER=app\n" +
"POSTGRES_PASSWORD=change-me\n" +
"POSTGRES_DB=app\n" +
"JWT_SECRET=change-me\n" +
"```\n\n" +
"## .gitignore — add `.env`\n" +
"```\n" +
".env\n" +
"```\n\n" +
"## docker-compose.yml — reference vars\n" +
"```yaml\n" +
"services:\n" +
"  pg:\n" +
"    image: postgres:16-alpine\n" +
"    environment:\n" +
"      POSTGRES_USER:     ${POSTGRES_USER}\n" +
"      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}\n" +
"      POSTGRES_DB:       ${POSTGRES_DB}\n" +
"    # ... rest unchanged\n" +
"  api:\n" +
"    environment:\n" +
"      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@pg:5432/${POSTGRES_DB}\n" +
"      JWT_SECRET:   ${JWT_SECRET}\n" +
"      NODE_ENV:     development\n" +
"```\n\n" +
"## Bring up + verify\n" +
"```bash\n" +
"cp .env.example .env\n" +
"# edit .env with your dev values\n" +
"docker compose up -d\n" +
"docker compose config       # shows the resolved compose with vars substituted (no secrets in stdout)\n" +
"```\n\n" +
"## Why .env.example\n" +
"Anyone cloning your repo runs `cp .env.example .env`, edits, and goes. Zero guessing about which env vars are required. Same .env discipline as W1 of AI-eng — applied here for Compose."
      ),
      S([
        { prompt: "`.env` should be committed so teammates can run the project.", answer: false, whenRight: "Right — no. .env has REAL values (passwords). Commit .env.example (placeholders) instead.", whenWrong: "Never. .env is gitignored. .env.example is the contract; teammates copy + edit." },
        { prompt: "`docker compose config` prints the YAML with env vars resolved.", answer: true, whenRight: "Right — useful for debugging substitution. Watch for missing values (shows as blank).", whenWrong: "Yes — config = resolved view. Great for verifying env vars wired correctly." },
        { prompt: "Production should reuse the dev `.env` file.", answer: false, whenRight: "Right — no. Prod env vars come from the deploy target's secrets store, never from a dev file.", whenWrong: "Different .env per env. Prod values from a secrets manager; dev values from local file." }
      ]),
      E("Your turn — env discipline", "[CODE]\n1. Add .env + .env.example with the variables from the lesson.\n2. Update docker-compose.yml to reference them via ${VAR}.\n3. Add .env to .gitignore.\n4. Confirm `git status` does NOT show .env.\n5. `docker compose up -d`; everything still works.\n6. Commit the .gitignore + .env.example + updated compose.")
    ]),
    D(5, "Healthchecks for the API too", "Self-report 'ready' so other services can wait.", [
      L("API healthcheck + readiness",
"## Why\n" +
"A real api dies on bad DB connection during boot, fails to respond, or returns errors. A healthcheck makes the container's readiness MACHINE-CHECKABLE.\n\n" +
"## Implement /healthz in your app\n" +
"```js\n" +
"// in your api server (Express example)\n" +
"app.get('/healthz', async (req, res) => {\n" +
"  try {\n" +
"    await db.query('SELECT 1');         // confirm DB reachable\n" +
"    res.status(200).json({ ok: true });\n" +
"  } catch (e) {\n" +
"    res.status(503).json({ ok: false, error: e.message });\n" +
"  }\n" +
"});\n" +
"```\n\n" +
"`/healthz` returns 200 ONLY when the api is fully operational (can talk to its dependencies). Returns 503 if not.\n\n" +
"## Add to docker-compose.yml\n" +
"```yaml\n" +
"  api:\n" +
"    # ... existing ...\n" +
"    healthcheck:\n" +
"      test: ['CMD-SHELL', 'wget -q -O /dev/null http://localhost:3000/healthz || exit 1']\n" +
"      interval: 10s\n" +
"      timeout: 3s\n" +
"      retries: 3\n" +
"      start_period: 15s     # grace period for the app to start before failures count\n" +
"```\n\n" +
"`start_period` gives the api 15s to come up cleanly before failing healthchecks count as down — important for slow-starting apps.\n\n" +
"## See it in `docker compose ps`\n" +
"```\n" +
"NAME       STATUS                    PORTS\n" +
"api        Up 12 seconds (healthy)   0.0.0.0:3000->3000/tcp\n" +
"pg         Up 12 seconds (healthy)   0.0.0.0:5432->5432/tcp\n" +
"```\n\n" +
"`(healthy)` next to status. If your reverse proxy or load balancer reads Docker health state, it can route around unhealthy backends automatically.\n\n" +
"## Why this matters for prod\n" +
"Kubernetes uses the same concept (`readinessProbe`, `livenessProbe`). Building the healthcheck discipline in Compose now means K8s migration is trivial later."
      ),
      S([
        { prompt: "/healthz should return 200 OK even if the database connection is broken.", answer: false, whenRight: "Right — no. Liveness should be honest. If you can't talk to your DB, you're not healthy.", whenWrong: "False positive = traffic routes to a broken instance. /healthz lies = outage." },
        { prompt: "`start_period` prevents healthcheck failures from counting against the container during initial boot.", answer: true, whenRight: "Right — graceful boot window. Without it, slow-starting apps die before they're ready.", whenWrong: "Yes — boot grace. Essential for any app whose startup takes more than a few seconds." },
        { prompt: "Compose healthchecks translate directly to Kubernetes readiness/liveness probes.", answer: true, whenRight: "Right — same concept, same intent. K8s probes are richer, but if you've practiced in Compose, K8s is a small jump.", whenWrong: "Yes — Compose's healthcheck is the conceptual seed of K8s probes. Practice here transfers." }
      ]),
      E("Your turn — healthcheck", "[CODE]\n1. Add `/healthz` to your api (touch the DB).\n2. Add the healthcheck block to docker-compose.yml.\n3. `docker compose up -d`.\n4. `docker compose ps` shows api as healthy after start_period.\n5. Test the negative: stop pg (`docker compose stop pg`). Watch api transition to unhealthy.\n6. Restart pg; api returns to healthy.")
    ]),
    D(6, "Compose vs prod orchestrators — when to graduate", "Compose stays good until it doesn't.", [
      L("When Compose stops being right",
"## Compose is excellent for\n" +
"- Local dev for any team size\n" +
"- CI integration tests (`docker compose up -d`, run tests, `down`)\n" +
"- Single-server production for small apps (yes really — many startups run Compose in prod for years)\n" +
"\n" +
"## Compose becomes the wrong tool when\n" +
"```text\n" +
"- You need to deploy to MULTIPLE servers (Compose runs on one host).\n" +
"- You need auto-scaling based on load.\n" +
"- You need rolling deploys with zero downtime.\n" +
"- You need a control plane (declarative desired state with self-healing).\n" +
"```\n\n" +
"At THAT scale, you move to Kubernetes (or AWS ECS / Fargate / Nomad / etc.).\n\n" +
"## The migration story\n" +
"Compose → Kubernetes manifests is mostly mechanical:\n" +
"```text\n" +
"Compose service        K8s primitive\n" +
"────────────────       ─────────────\n" +
"service                Deployment + Service\n" +
"image                  containers.image\n" +
"environment            env / envFrom\n" +
"ports                  containerPort + Service.port\n" +
"volumes (named)        PersistentVolumeClaim + volumeMount\n" +
"volumes (bind)         emptyDir or ConfigMap (no host coupling)\n" +
"healthcheck            readinessProbe + livenessProbe\n" +
"depends_on (healthy)   initContainers or readiness gating\n" +
"```\n\n" +
"Each Compose service maps to roughly 2-3 K8s manifests. Tools like `kompose` automate the bulk of the conversion.\n\n" +
"## The wrong reason to graduate\n" +
"\"Resume\" or \"because everyone uses K8s\". K8s is heavy. If you don't NEED its scale features, you're paying its complexity for nothing. Compose-on-one-VM with a healthcheck-gated reverse proxy serves real traffic at small scale.\n\n" +
"## Stay calm\n" +
"Most ML / data / web teams reach $10M ARR on Compose or simple ECS/Fargate. K8s is the migration FROM that — not the destination from day one."
      ),
      R("kompose — Compose to Kubernetes converter", "https://kompose.io/",
        "Bookmark. The day you decide to migrate, this is the first tool you'll reach for."),
      S([
        { prompt: "Docker Compose is suitable for production on a single VM.", answer: true, whenRight: "Right — many small companies run Compose in prod for years. K8s only matters at scale.", whenWrong: "Yes — totally valid prod stack at small scale. K8s only when you outgrow it." },
        { prompt: "You should always start a project on Kubernetes to avoid migration later.", answer: false, whenRight: "Right — no. K8s has heavy ops overhead. Start on Compose; migrate only when scale demands.", whenWrong: "Start simple. K8s pre-scale = paying complexity for no value. Migrate when forced." },
        { prompt: "A Compose service's healthcheck conceptually maps to a Kubernetes readinessProbe.", answer: true, whenRight: "Right — same concept; same intent. Practising in Compose builds the muscle for K8s probes.", whenWrong: "Yes — direct conceptual mapping. Healthcheck patterns transfer." }
      ]),
      E("Your turn — migration thinking", "[WRITE] In compose/MIGRATION.md:\n1. State at what point you'd consider moving off Compose (be specific: traffic, multi-host, etc.).\n2. List the 3 things K8s gives you that Compose doesn't.\n3. List the 3 things you'd LOSE in complexity by adopting K8s.\nKeep it under a page.")
    ]),
    D(7, "Ship the Compose-based dev stack", "Tag the milestone; document the inner loop.", [
      L("COMPOSE.md + tag",
"## COMPOSE.md\n" +
"```markdown\n" +
"# Local dev stack — Docker Compose\n" +
"\n" +
"## Services\n" +
"- **pg** (postgres:16-alpine) — main database, named volume `pg-data`\n" +
"- **api** (built from `Dockerfile.dev`) — Node.js api with bind-mounted source for hot reload\n" +
"\n" +
"## Bring up\n" +
"```bash\n" +
"cp .env.example .env             # edit values\n" +
"docker compose up -d\n" +
"docker compose logs -f api       # follow logs\n" +
"```\n" +
"\n" +
"API: http://localhost:3000\n" +
"Postgres: localhost:5432 (user: app / pass: from .env)\n" +
"\n" +
"## Hot reload\n" +
"Source is bind-mounted into the api container. Save a `.ts` / `.js` file in the repo — nodemon detects + restarts INSIDE the container.\n" +
"\n" +
"## Healthchecks\n" +
"- pg: `pg_isready` every 5s\n" +
"- api: GET `/healthz` every 10s (start_period 15s)\n" +
"- `docker compose ps` shows `(healthy)` next to status when both are operational\n" +
"\n" +
"## Reset DB\n" +
"```bash\n" +
"docker compose down -v           # wipes the pg-data volume\n" +
"docker compose up -d\n" +
"```\n" +
"\n" +
"## When to migrate off Compose\n" +
"See [MIGRATION.md](MIGRATION.md). Short version: when you need multi-host or auto-scaling, move to K8s.\n" +
"```\n\n" +
"## Tag\n" +
"```bash\n" +
"git add docker-compose.yml Dockerfile.dev .env.example .gitignore COMPOSE.md MIGRATION.md\n" +
"git commit -m 'docker: dev stack via Compose + healthchecks + hot reload'\n" +
"git tag compose-v1\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## What you've built this week\n" +
"- One-command up of a real multi-service dev environment\n" +
"- Live source reload — fast inner loop\n" +
"- Real healthchecks + readiness gating between services\n" +
"- .env discipline that translates to every deploy target\n" +
"- Honest writeup of when to graduate to K8s\n\n" +
"That's a real-team dev experience, reproducible across machines."
      ),
      S([
        { prompt: "A COMPOSE.md with health/reset/troubleshooting docs is overkill for a personal project.", answer: false, whenRight: "Right — no. 3-months-later-you will not remember the commands. Document.", whenWrong: "Worth it. Future-you thanks you; recruiters notice operational thinking." },
        { prompt: "Documenting WHEN to migrate to K8s is a senior-DevOps signal.", answer: true, whenRight: "Right — naming the migration trigger means you understand the tradeoffs.", whenWrong: "Yes — engineers who name the trigger are engineers who picked the right tool now." },
        { prompt: "Once Compose is in place, you never need Dockerfile.dev — the api runs from source.", answer: false, whenRight: "Right — no. Dockerfile.dev defines the BASE (node version, npm install) that the bind mount layers on.", whenWrong: "Dockerfile.dev = base layer. Bind mount = code overlay. Both required." }
      ]),
      E("Your turn — ship compose-v1", "[PRODUCE]\n1. Write COMPOSE.md from the template.\n2. Write the short MIGRATION.md from Day 6's exercise.\n3. Tag: `git tag compose-v1 && git push --tags`.\n\nPASS:\n[x] docker-compose.yml committed\n[x] Dockerfile.dev committed\n[x] .env in .gitignore; .env.example committed\n[x] /healthz endpoint exists; healthcheck wired in compose\n[x] api hot-reloads on file save\n[x] COMPOSE.md + MIGRATION.md committed\n[x] compose-v1 tag pushed")
    ])
  ]
};

/* ════ W7 — Image hardening + security scanning + supply chain ════ */
const W7 = {
  number: 7, title: "Image Hardening, Security Scanning, and Supply Chain",
  phase: "Containers", commitment_hours: "20-25",
  context: ds.weeks[6].context,
  concept_check: [
    { q: "Why is running as non-root inside a container important even though the container is isolated?",
      choices: ["Habit","If an attacker exploits your app, they inherit the in-container user's privileges. Root-in-container + a kernel CVE = root-on-host. Non-root limits the blast radius even when containment fails",
        "Required","Random"],
      correct: 1, explain: "Container isolation isn't perfect. Multiple historical CVEs (CVE-2019-5736, CVE-2022-0492, container escape via runc) let root-in-container break out to root-on-host. Running as non-root means: even if your app is exploited AND there's a container-escape CVE, the attacker only gets non-root on the host — still very bad, but a hard upgrade for them. Defence in depth." },
    { q: "Why pin Docker image tags to a digest (`sha256:...`) instead of a version tag?",
      choices: ["Tradition","Tags are MUTABLE — `nginx:1.25` can be re-tagged at the registry to point at a different image any day. A digest is content-addressed: the bytes don't change. Pinning to digest = truly reproducible builds + cryptographic guarantee of what you're running",
        "Required","Random"],
      correct: 1, explain: "A tag is a pointer maintained by whoever publishes the image. `nginx:1.25` today might be `sha256:abc...`; tomorrow the publisher updates it to `sha256:def...` with a security patch. Sometimes great; sometimes you're now running unverified code. A digest pin (`nginx:1.25@sha256:abc...`) anchors to the exact bytes you've audited. Production images SHOULD use digest pins; humans use tags for ergonomics." },
    { q: "What does `trivy image` actually scan for?",
      choices: ["Magic","Three categories: (1) OS packages with known CVEs (Alpine/Debian/RHEL package versions vs CVE DB), (2) language package vulnerabilities (npm / pip / maven dependencies), (3) misconfigurations (running as root, sensitive files, secrets baked in)",
        "Required","No reason"],
      correct: 1, explain: "Trivy reads the image's layers and pulls out: installed OS packages (cross-referenced with NVD / Alpine secdb / Debian DSA), language-specific lockfiles inside (npm + pip + go.sum), Dockerfile patterns (running as root, ADD with remote URLs), and even secrets that got baked in via misclicked .dockerignore. One scan, multiple risk classes. Run it in CI before pushing." }
  ],
  days: [
    D(1, "Orient — threat model", "What you're actually defending against.", [
      L("The container threat model",
"## What containers DON'T protect you from\n" +
"```text\n" +
"- A vulnerability in YOUR application code (SQL injection, RCE, etc.)\n" +
"- A vulnerability in your dependencies (npm package compromise, etc.)\n" +
"- A vulnerability in the base image's OS packages\n" +
"- A container ESCAPE CVE in the runtime (runc, containerd, kernel)\n" +
"- Compromised image at the registry (someone re-pushes nginx:1.25)\n" +
"```\n\n" +
"## What you'll add this week\n" +
"```text\n" +
"L1 — Minimal base image (Distroless / Alpine) → smaller CVE surface\n" +
"L2 — Run as non-root user → blast radius reduction\n" +
"L3 — Pin image tags by digest → reproducibility + supply-chain integrity\n" +
"L4 — Trivy CVE scan in CI → catch known vulnerabilities pre-deploy\n" +
"L5 — Image signing (cosign) → cryptographic provenance\n" +
"L6 — SBOM generation → know what's actually in the image\n" +
"```\n\n" +
"## What you ship by Sunday\n" +
"- A hardened Dockerfile (Distroless OR minimal Alpine, non-root user, digest-pinned base)\n" +
"- Trivy scan in CI: blocks build if CRITICAL CVEs found\n" +
"- An SBOM (`syft` output) committed for visibility\n" +
"- (Optional) cosign-signed image pushed to Docker Hub\n" +
"- A HARDENING.md document explaining choices + tradeoffs\n\n" +
"## Why this matters past resume\n" +
"Most production breaches that get attributed to 'containers' come from this list — not from Docker itself, but from the layers above. Patching at this layer is most teams' biggest defensive wins."
      ),
      S([
        { prompt: "A container image with no CVEs at build time stays safe forever.", answer: false, whenRight: "Right — no. New CVEs are disclosed daily. Re-scan and rebuild regularly.", whenWrong: "Continuous concern. CVE DB updates daily; rebuild + rescan as part of CI cadence." },
        { prompt: "Running as root inside a container is fine because containers are isolated.", answer: false, whenRight: "Right — no. Container escapes happen. Non-root is the cheap, foundational hardening.", whenWrong: "Isolation isn't perfect. Non-root costs ~zero, gains defence-in-depth." },
        { prompt: "Image hardening's main value is preventing CVE scanners from flagging your image.", answer: false, whenRight: "Right — opposite. The CVEs are real risks; passing the scanner is just measurement. The reduction IS the value.", whenWrong: "Scanner-pass is the symptom; risk reduction is the goal. Don't game the scanner; reduce real risk." }
      ]),
      E("Your turn — threat model", "[WRITE] In hardening/THREAT_MODEL.md:\n1. List the 5 'what containers DON'T protect you from' items in your own words.\n2. For each, name ONE concrete control from this week's plan that addresses it.\n3. State the week's goal: my Dockerfile is non-root + digest-pinned, my CI fails on CRITICAL CVEs, and an SBOM lives next to the code.")
    ]),
    D(2, "Distroless or minimal Alpine", "Less in the image = less attack surface.", [
      L("Distroless vs Alpine",
"## Two minimalism schools\n\n" +
"### Alpine\n" +
"```dockerfile\n" +
"FROM node:20-alpine\n" +
"# ~50 MB. Has busybox shell + apk package manager.\n" +
"# Debug-friendly: `docker exec -it container sh` works.\n" +
"```\n" +
"Trade: still has a shell + package manager → larger CVE surface than distroless.\n\n" +
"### Distroless (Google)\n" +
"```dockerfile\n" +
"FROM gcr.io/distroless/nodejs20-debian12\n" +
"# ~80 MB. NO shell. NO package manager. NO ssh.\n" +
"# Only the language runtime + your app.\n" +
"```\n" +
"Trade: can't `exec sh` for debugging in prod. Use `gcr.io/distroless/nodejs20-debian12:debug` (has busybox) for troubleshooting only.\n\n" +
"## The multi-stage build with distroless\n" +
"```dockerfile\n" +
"# Stage 1: build with full toolchain\n" +
"FROM node:20-alpine AS build\n" +
"WORKDIR /app\n" +
"COPY package*.json ./\n" +
"RUN npm ci\n" +
"COPY . .\n" +
"RUN npm run build && npm prune --production\n\n" +
"# Stage 2: distroless runtime\n" +
"FROM gcr.io/distroless/nodejs20-debian12 AS runtime\n" +
"WORKDIR /app\n" +
"COPY --from=build /app/node_modules ./node_modules\n" +
"COPY --from=build /app/dist ./dist\n" +
"COPY --from=build /app/package.json ./package.json\n" +
"USER nonroot                # distroless provides this user out-of-the-box\n" +
"EXPOSE 3000\n" +
"CMD [\"dist/server.js\"]      # entrypoint is /usr/bin/node\n" +
"```\n\n" +
"## What you can no longer do (correctly)\n" +
"```bash\n" +
"docker exec -it container sh      # fails — no shell in distroless\n" +
"docker exec -it container ls /    # fails — no ls\n" +
"```\n\n" +
"Use the `:debug` variant for local debugging; the non-debug variant for prod.\n\n" +
"## For a static site (Edge Portfolio)\n" +
"Distroless equivalent: `gcr.io/distroless/static-debian12` (~2 MB!). Or you can run nginx as non-root in a small Alpine.\n\n" +
"## Build + size compare\n" +
"```bash\n" +
"docker build -t myapp:alpine -f Dockerfile.alpine .\n" +
"docker build -t myapp:distroless -f Dockerfile.distroless .\n" +
"docker image ls myapp\n" +
"# REPOSITORY  TAG         SIZE\n" +
"# myapp       alpine      120 MB\n" +
"# myapp       distroless   95 MB\n" +
"```\n\n" +
"Real numbers; real differences."
      ),
      R("Distroless on GitHub", "https://github.com/GoogleContainerTools/distroless", "Bookmark. Read the README for available variants per language."),
      S([
        { prompt: "Distroless images include a shell for easy debugging.", answer: false, whenRight: "Right — no. The whole point. Use the `:debug` variant for local troubleshooting.", whenWrong: "No shell. Lower attack surface; needs different debug workflow." },
        { prompt: "Smaller image = strictly less attack surface.", answer: true, whenRight: "Right — fewer installed packages = fewer CVEs = less to defend.", whenWrong: "Yes — every package is a potential CVE. Removing what you don't use is free defence." },
        { prompt: "Distroless `:debug` variants should be used in production for emergency access.", answer: false, whenRight: "Right — no. Prod runs the slim variant. Debug variant is for staging / dev only.", whenWrong: "Debug variant defeats the purpose in prod. Use it for staging or local; prod gets the slim image." }
      ]),
      E("Your turn — distroless", "[CODE]\n1. Create Dockerfile.distroless (multi-stage, distroless runtime).\n2. Build and run.\n3. Verify the app works.\n4. Try `docker exec -it container sh` — fails. Good.\n5. Compare sizes between alpine and distroless builds; record in NOTES.md.")
    ]),
    D(3, "Non-root user", "Even if a CVE escapes the container, the attacker doesn't get root on the host.", [
      L("Non-root in Dockerfile",
"## Manually create a user (Alpine)\n" +
"```dockerfile\n" +
"FROM node:20-alpine\n" +
"\n" +
"# Create a user and group with predictable UID/GID\n" +
"RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app\n" +
"\n" +
"WORKDIR /app\n" +
"COPY --chown=app:app package*.json ./\n" +
"RUN npm ci --only=production\n" +
"COPY --chown=app:app . .\n" +
"\n" +
"USER app                          # switch to non-root\n" +
"EXPOSE 3000\n" +
"CMD [\"node\", \"server.js\"]\n" +
"```\n\n" +
"## Why the explicit UID/GID\n" +
"If you mount a host volume into the container, file ownership uses NUMERIC IDs. Predictable UID/GID lets you align host + container ownership cleanly.\n\n" +
"## In distroless (easier)\n" +
"Distroless images provide a `nonroot` user out of the box:\n" +
"```dockerfile\n" +
"FROM gcr.io/distroless/nodejs20-debian12\n" +
"USER nonroot                      # just use it\n" +
"```\n\n" +
"## Common failures and how to fix\n" +
"```text\n" +
"  ❌ EACCES: permission denied, mkdir '/app/.cache'\n" +
"     → your app tries to write somewhere it doesn't own.\n" +
"     Fix: COPY --chown=app:app on the relevant dir, or pre-mkdir as root.\n" +
"\n" +
"  ❌ Bind to port 80 fails (only root can bind to <1024)\n" +
"     → run on a high port (3000+) inside the container.\n" +
"     Map -p 80:3000 at the host.\n" +
"\n" +
"  ❌ apt / apk fails during build with non-root user\n" +
"     → switch back to root for installs:\n" +
"       USER root\n" +
"       RUN apk add --no-cache curl\n" +
"       USER app\n" +
"```\n\n" +
"## Verify\n" +
"```bash\n" +
"docker run --rm myapp id\n" +
"# uid=1001(app) gid=1001(app) groups=1001(app)\n" +
"```\n\n" +
"Not 0. That's the win."
      ),
      S([
        { prompt: "A container running as root inside is automatically root on the host.", answer: false, whenRight: "Right — no. Container namespaces isolate UIDs. Container's root != host's root EXCEPT during a container escape, which is exactly what we're defending against.", whenWrong: "Not automatically — but a container-escape CVE turns container-root into host-root in seconds. Non-root closes that gap." },
        { prompt: "Non-root containers can listen on port 80 directly.", answer: false, whenRight: "Right — no. <1024 is privileged. Listen on a high port inside; map ports outside.", whenWrong: "Map ports. Listen on 3000+ inside the container; `-p 80:3000` at run time." },
        { prompt: "Distroless makes non-root easier because it provides a `nonroot` user.", answer: true, whenRight: "Right — `USER nonroot` and you're done. One less line of Dockerfile.", whenWrong: "Yes — built-in. One reason distroless is the easier hardening path." }
      ]),
      E("Your turn — non-root", "[CODE]\n1. Update your Dockerfile to add a user + USER directive (or use distroless's `nonroot`).\n2. Build + run; verify `docker exec ... id` shows non-root.\n3. Fix any EACCES errors that surface.\n4. Confirm the app still works end-to-end.\n5. Commit.")
    ]),
    D(4, "Pin tags by digest", "Reproducible + supply-chain safe.", [
      L("Digest pins",
"## Tags are mutable\n" +
"```dockerfile\n" +
"FROM node:20-alpine\n" +
"```\n" +
"That `20-alpine` tag points at SOME image today. The maintainer can re-tag it tomorrow to point at a different image (typically a security patch — fine). But in principle, anyone who controls the tag can re-target it.\n\n" +
"## Digest pins are immutable\n" +
"```dockerfile\n" +
"FROM node:20-alpine@sha256:5a3b9d4f6b8c2d1e9a3f7b2c4d6e8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f\n" +
"```\n" +
"That digest is content-addressed. The bytes ARE that hash. Cannot be re-pointed.\n\n" +
"## How to find the current digest\n" +
"```bash\n" +
"docker pull node:20-alpine\n" +
"docker inspect --format='{{index .RepoDigests 0}}' node:20-alpine\n" +
"# node@sha256:5a3b9d4f...\n" +
"```\n\n" +
"Or just:\n" +
"```bash\n" +
"docker manifest inspect node:20-alpine | grep digest\n" +
"```\n\n" +
"## Pin in the Dockerfile\n" +
"```dockerfile\n" +
"# Pinned 2026-06-05. Refresh quarterly or when CVE patch needed.\n" +
"FROM node:20-alpine@sha256:5a3b9d4f6b8c... AS build\n" +
"# ...\n" +
"FROM gcr.io/distroless/nodejs20-debian12@sha256:7e8f9a0b1c2d... AS runtime\n" +
"# ...\n" +
"```\n\n" +
"## Refresh discipline\n" +
"- Quarterly: re-fetch tag → grab new digest → update Dockerfile → rebuild → retest.\n" +
"- On CVE disclosure: refresh immediately for the affected base.\n" +
"- Use Dependabot / Renovate to automate digest refresh PRs.\n\n" +
"## The supply-chain win\n" +
"Pinning by digest means: even if Docker Hub gets compromised AND your tag gets pointed at malicious content, your build still pulls the original bytes. Cryptographic anchor."
      ),
      S([
        { prompt: "`node:20-alpine` and `node:20-alpine@sha256:abc...` will always resolve to the same image.", answer: false, whenRight: "Right — no. The tag is a moving pointer; the digest is the actual bytes. Tag can be re-targeted.", whenWrong: "Tag mutable, digest immutable. Pin to digest for true reproducibility." },
        { prompt: "Dependabot can automate base-image digest refresh PRs.", answer: true, whenRight: "Right — GitHub-native. Set it up; review the weekly PRs; merge after CI.", whenWrong: "Yes — Dependabot watches Dockerfile bases. Weekly PRs to refresh digests; easy review." },
        { prompt: "Digest-pinning is excessive for non-production projects.", answer: false, whenRight: "Right — no. The discipline cost is one line of Dockerfile + a quarterly refresh. Trivial price for the safety guarantee.", whenWrong: "Cheap to do. Even small projects benefit; the discipline scales naturally to teams of any size." }
      ]),
      E("Your turn — digest pin", "[CODE]\n1. `docker pull node:20-alpine`; grab the digest via `docker inspect`.\n2. Update Dockerfile FROMs to use `@sha256:...`.\n3. Build + run; confirm same behaviour.\n4. (Optional) Enable Dependabot or Renovate for the repo.\n5. Document in HARDENING.md when you last refreshed digests.")
    ]),
    D(5, "Trivy in CI", "Block builds with CRITICAL CVEs.", [
      L("Trivy — the standard scanner",
"## What Trivy scans\n" +
"- OS packages (Alpine apk, Debian deb)\n" +
"- Language packages (npm, pip, maven, go.sum, etc.)\n" +
"- Dockerfile misconfigurations (running as root, ADD with URLs)\n" +
"- Hardcoded secrets baked into layers\n" +
"\n" +
"All from one binary.\n\n" +
"## Try it locally\n" +
"```bash\n" +
"brew install trivy                 # mac\n" +
"# or: docker run aquasec/trivy image YOUR-IMAGE\n" +
"\n" +
"trivy image edge-portfolio:1.0\n" +
"```\n\n" +
"Output: a table per vuln class. Severities: CRITICAL, HIGH, MEDIUM, LOW, UNKNOWN.\n\n" +
"## In CI — make it a gate\n" +
"```yaml\n" +
"# .github/workflows/security.yml\n" +
"name: Image security scan\n" +
"on:\n" +
"  push: { branches: [main] }\n" +
"  pull_request:\n" +
"\n" +
"jobs:\n" +
"  trivy:\n" +
"    runs-on: ubuntu-latest\n" +
"    steps:\n" +
"      - uses: actions/checkout@v4\n" +
"\n" +
"      - name: Build image\n" +
"        run: docker build -t edge-portfolio:scan .\n" +
"\n" +
"      - name: Trivy scan — fail on CRITICAL\n" +
"        uses: aquasecurity/trivy-action@master\n" +
"        with:\n" +
"          image-ref: edge-portfolio:scan\n" +
"          format: table\n" +
"          severity: CRITICAL,HIGH\n" +
"          exit-code: '1'             # fail build on findings\n" +
"          ignore-unfixed: true       # don't fail on CVEs with no patch yet\n" +
"```\n\n" +
"`ignore-unfixed: true` means: if a CVE has no published fix, log it but don't fail. (You can't fix what doesn't have a patch yet; failing on these is pure noise.)\n\n" +
"## The trivyignore file\n" +
"For accepted risks (CVE applies but you've assessed it as not exploitable for your use):\n" +
"```\n" +
"# .trivyignore\n" +
"CVE-2023-12345    # affects only the SMTP path; we don't send email\n" +
"```\n\n" +
"Add a comment with WHY; future-you will want to know.\n\n" +
"## Run the gate\n" +
"Push a commit. Watch the security workflow run. If clean — green. If CRITICAL — red, deploy blocked. Real gate."
      ),
      S([
        { prompt: "Trivy scans OS packages, language packages, AND misconfigurations.", answer: true, whenRight: "Right — multi-class scanner. One binary; three categories. Great default.", whenWrong: "All three. Plus optional secret-scanning. Run it; rely on it." },
        { prompt: "`ignore-unfixed: true` hides real risk.", answer: false, whenRight: "Right — no. It hides CVEs with NO published fix yet — those can't be acted on. Real signal stays.", whenWrong: "Hides only unactionable noise. Without it, every CI run drowns in unfixable findings." },
        { prompt: "A `.trivyignore` file lets you accept specific CVEs after risk assessment.", answer: true, whenRight: "Right — escape hatch for false-positives or accepted-risk CVEs. Document the WHY.", whenWrong: "Yes — case-by-case suppression. Always comment WHY; future-you will want to know." }
      ]),
      E("Your turn — Trivy gate", "[CODE]\n1. Install trivy locally; scan your image; review findings.\n2. Add `.github/workflows/security.yml` from the lesson.\n3. Push. Confirm the workflow runs.\n4. Address any CRITICAL findings (upgrade base, patch deps).\n5. Confirm the gate goes green.")
    ]),
    D(6, "SBOM + supply chain", "syft for SBOMs; cosign for signing (optional but rare-skill).", [
      L("SBOM with syft, sign with cosign",
"## What is an SBOM\n" +
"Software Bill of Materials: a machine-readable list of every package + version inside an image. SPDX or CycloneDX format.\n\n" +
"## Generate one\n" +
"```bash\n" +
"# install syft\n" +
"brew install syft\n" +
"# or: docker run anchore/syft:latest IMAGE\n" +
"\n" +
"syft edge-portfolio:1.0 -o cyclonedx-json > sbom.json\n" +
"```\n\n" +
"`sbom.json` lists every npm package, every OS package, with versions. Commit it next to your code. Now the world can see EXACTLY what's in your image without pulling it.\n\n" +
"## Why this matters\n" +
"- CISA + executive orders now require SBOMs for federal software.\n" +
"- Standard ask in security questionnaires.\n" +
"- Faster CVE response: when a critical CVE drops, you can `grep` SBOMs to find affected images instantly.\n\n" +
"## Cosign — image signing (optional)\n" +
"`cosign` signs images so consumers can cryptographically verify they came from YOU.\n\n" +
"```bash\n" +
"brew install cosign\n" +
"cosign generate-key-pair     # produces cosign.key (PRIVATE!) and cosign.pub\n" +
"\n" +
"# sign the image after push\n" +
"docker push yourname/edge-portfolio:1.0\n" +
"cosign sign --key cosign.key yourname/edge-portfolio:1.0\n" +
"\n" +
"# verify\n" +
"cosign verify --key cosign.pub yourname/edge-portfolio:1.0\n" +
"```\n\n" +
"## Keyless signing (newer, easier)\n" +
"```bash\n" +
"cosign sign yourname/edge-portfolio:1.0    # uses your OIDC identity (GitHub / Google)\n" +
"```\n" +
"No key management; the signature is bound to your identity via Sigstore's transparency log. The modern recommended path.\n\n" +
"## Why this is a rare hiring signal\n" +
"Most candidates have never heard of SBOMs or cosign. Doing it on a personal project = senior-ops signal. Worth the 30 minutes."
      ),
      R("Sigstore — cosign docs", "https://docs.sigstore.dev/cosign/signing/overview/",
        "Bookmark. The auth + verify flows are short; the docs are excellent."),
      S([
        { prompt: "An SBOM is a machine-readable list of every package + version inside an image.", answer: true, whenRight: "Right — SPDX or CycloneDX format. Useful for CVE response + procurement.", whenWrong: "Yes — package manifest in a standard format. Easy CVE matching across your fleet." },
        { prompt: "Cosign keyless signing requires you to manage a private key file.", answer: false, whenRight: "Right — no. Keyless uses your OIDC identity (GitHub / Google) bound to Sigstore's transparency log. No keys to manage.", whenWrong: "Keyless = no key file. OIDC-bound signatures. Modern recommended path." },
        { prompt: "Generating an SBOM and committing it to the repo is overkill for a personal project.", answer: false, whenRight: "Right — no. Strong portfolio signal; almost no candidates do it. 5 minutes of work.", whenWrong: "Differentiating. Rare in entry-level portfolios. Cheap; high signal." }
      ]),
      E("Your turn — SBOM + (optional) sign", "[CODE]\n1. Install syft. `syft yourname/edge-portfolio:1.0 -o cyclonedx-json > sbom.json`.\n2. Commit sbom.json.\n3. (Optional) Install cosign; sign your pushed image; document the public key.\n4. Verify locally: `cosign verify --key cosign.pub ...`.\n5. NOTES.md: record what surprised you in the SBOM.")
    ]),
    D(7, "Ship hardened v2.0", "HARDENING.md + tag.", [
      L("HARDENING.md + tag",
"## HARDENING.md\n" +
"```markdown\n" +
"# Image hardening\n" +
"\n" +
"## Defences in place\n" +
"\n" +
"### L1 — Distroless runtime\n" +
"Final image based on `gcr.io/distroless/nodejs20-debian12@sha256:...`.\n" +
"No shell, no package manager, no ssh. ~80 MB.\n" +
"\n" +
"### L2 — Non-root user\n" +
"`USER nonroot` in the runtime stage. Verified via `docker run --rm img id`.\n" +
"\n" +
"### L3 — Digest-pinned bases\n" +
"All FROM lines use `@sha256:...` digest pins. Refresh quarterly or on CVE\n" +
"disclosure. Last refreshed: YYYY-MM-DD.\n" +
"\n" +
"### L4 — CI vulnerability scan\n" +
"`.github/workflows/security.yml` runs Trivy on every push + PR.\n" +
"- Fails build on CRITICAL or HIGH (with `ignore-unfixed`).\n" +
"- Accepted CVEs documented in `.trivyignore` with rationale.\n" +
"\n" +
"### L5 — SBOM\n" +
"`sbom.json` (CycloneDX) committed; regenerated on every release.\n" +
"\n" +
"### L6 — (Optional) Image signing\n" +
"Image signed via `cosign sign` (keyless). Public key/verification command\n" +
"in README.\n" +
"\n" +
"## Residual risks\n" +
"- Application-level vulnerabilities (SQL injection, RCE) — orthogonal to\n" +
"  container hardening; addressed by app-level controls.\n" +
"- A container-escape CVE in the runtime — non-root limits blast radius\n" +
"  but doesn't eliminate.\n" +
"- Supply-chain attack against npm — partial defence via lockfile + audit;\n" +
"  no full mitigation.\n" +
"\n" +
"## Refresh cadence\n" +
"- Digest pins: quarterly + on CVE.\n" +
"- Trivy scan: every CI run.\n" +
"- SBOM: every release tag.\n" +
"- npm audit: weekly via Dependabot.\n" +
"```\n\n" +
"## README update\n" +
"```markdown\n" +
"## Security\n" +
"See [HARDENING.md](HARDENING.md). Distroless runtime, non-root user,\n" +
"digest-pinned bases, Trivy CI gate, SBOM committed.\n" +
"\n" +
"## Roadmap\n" +
"- [x] v0.1 — bucket + static site\n" +
"- [x] v0.2 — custom domain + HTTPS\n" +
"- [x] v0.3 — automated CI/CD\n" +
"- [x] v0.4 — monitoring + alarms\n" +
"- [x] v1.0 — containerised + on Docker Hub\n" +
"- [x] v2.0 — hardened image + supply chain (you are here)\n" +
"```\n\n" +
"## Tag\n" +
"```bash\n" +
"git add HARDENING.md sbom.json .github/workflows/security.yml .trivyignore README.md Dockerfile\n" +
"git commit -m 'security: hardened image + Trivy gate + SBOM'\n" +
"git tag v2.0\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## What you can claim\n" +
"- Multi-stage build, distroless runtime, non-root user\n" +
"- Digest-pinned bases with documented refresh cadence\n" +
"- Vulnerability gate in CI that blocks builds on CRITICAL\n" +
"- Public SBOM\n" +
"- HARDENING.md with named residual risks\n\n" +
"This is real-team security thinking on a portfolio project. Rare; differentiating."
      ),
      S([
        { prompt: "Naming residual risks weakens the HARDENING.md.", answer: false, whenRight: "Right — opposite. Named limits = honest engineering. Hidden ones get found.", whenWrong: "Strengthens. Specific residual risks = credibility. Vague absolute claims = naivety." },
        { prompt: "A refresh cadence (quarterly digest pin updates) is part of the discipline.", answer: true, whenRight: "Right — without cadence, pinned-and-forgotten becomes stale-and-vulnerable.", whenWrong: "Yes — pin + refresh. The cadence is the discipline; pinning without it is theatre." },
        { prompt: "Most candidates at this level can show: distroless + non-root + digest pin + Trivy gate + SBOM.", answer: false, whenRight: "Right — no. Maybe 5% can. That's why doing it differentiates.", whenWrong: "Rare. The 5%-can stat is the opportunity; do it and stand out instantly." }
      ]),
      E("Your turn — ship v2.0", "[PRODUCE]\n1. Write HARDENING.md from the template.\n2. Update README with the Security block + roadmap.\n3. Commit + tag v2.0 + push tags.\n\nPASS:\n[x] Dockerfile uses distroless + non-root + digest pins\n[x] security.yml workflow runs Trivy + blocks on CRITICAL\n[x] sbom.json committed\n[x] .trivyignore (if any accepted CVEs) with rationale comments\n[x] HARDENING.md with residual risks named\n[x] v2.0 tag pushed")
    ])
  ]
};

/* ═══════════════════════════════════════════════════════════
   VALIDATE + WRITE
   ═══════════════════════════════════════════════════════════ */
const newWeeks = [W3, W4, W5, W6, W7];
newWeeks.forEach((w) => {
  if (w.days.length !== 7) throw new Error(`W${w.number}: need 7 days, got ${w.days.length}`);
  if (!w.concept_check || w.concept_check.length !== 3) {
    throw new Error(`W${w.number}: concept_check must have 3 entries`);
  }
  w.days.forEach((d) => {
    const k = d.items.map((i) => i.kind);
    if (!k.includes('lesson'))   throw new Error(`W${w.number} D${d.number}: missing lesson`);
    if (!k.includes('swipe'))    throw new Error(`W${w.number} D${d.number}: missing swipe`);
    if (!k.includes('exercise') && !k.includes('reflection')) {
      throw new Error(`W${w.number} D${d.number}: missing exercise or reflection`);
    }
  });
});

ds.weeks.splice(2, 5, ...newWeeks);
fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log(`SUCCESS — DevOps W3-W7 rebuilt to bar. Total weeks: ${ds.weeks.length}`);
