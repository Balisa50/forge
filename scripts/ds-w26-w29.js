// Rebuild DS W26-W29 to the teach -> swipe -> project standard.
// W26 Cloud + BigQuery, W27 Energy Forecast v1.0 ship + retro,
// W28 Capstone v0.1 (pick + scope), W29 Capstone v0.2 (build).
const fs = require('fs');
const FILE = 'C:/Users/Abdoulie Balisa/OneDrive/Desktop/FORGE/data/roadmaps/data-science.json';
const ds = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const L = (title, body) => ({ kind: 'lesson', title, body });
const V = (title, url, dm, creator, why) => ({ kind: 'video', title, url, duration_min: dm, creator, why });
const S = (cards) => ({ kind: 'swipe', title: 'Quick check — swipe to answer', cards });
const E = (title, body) => ({ kind: 'exercise', title, body });
const D = (number, title, summary, items) => ({ number, title, summary, items });

/* ════ WEEK 26 — Cloud + BigQuery for Data Scientists ════ */
const W26 = {
  number: 26, title: "Cloud + BigQuery for Data Scientists",
  phase: "Production", commitment_hours: "10-12",
  context: ds.weeks[25].context,
  concept_check: [
    { q: "Why does a data scientist need to know cloud storage even if they don't deploy services?",
      choices: ["For show","Real datasets, models and pipelines outgrow a laptop — S3 / GCS / Azure Blob is where they actually live in any company past startup phase",
        "Cloud is required by Python","To use more RAM"],
      correct: 1, explain: "Datasets you'll work on professionally don't fit on a laptop; trained models need a single canonical location your team can load from; pipelines run on machines that aren't yours. Cloud object storage (S3 + friends) is the universal place all three live. Knowing it puts you on speaking terms with the production half of the job." },
    { q: "What does BigQuery's free tier specifically give you?",
      choices: ["A free server","1 TB of query processing and 10 GB of storage per month, no credit card required — enough to learn on public datasets",
        "Free machine learning","Unlimited everything"],
      correct: 1, explain: "Google's free tier is 1 TB of query-bytes scanned + 10 GB of storage per month, no credit card. Google's public datasets (NYC taxi, GitHub commits, OpenStreetMap) are pre-loaded. You can scan whole years of trip records in a query and stay under the cap." },
    { q: "Why ALWAYS set a billing alarm before doing anything on AWS?",
      choices: ["AWS requires it","A single misconfigured resource (open S3 bucket, runaway EC2, accidentally-public RDS) can cost hundreds before you notice — the alarm emails you at $5",
        "It's for show","To enable services"],
      correct: 1, explain: "The classic cloud horror story: you spin up an instance for a tutorial, forget about it, and find a $400 bill weeks later. A CloudWatch billing alarm at $5 catches every common misconfiguration before it goes anywhere near painful. Set it on day 1, leave it on forever. Free." }
  ],
  days: [
    D(1,"Why the cloud","Datasets, models and pipelines that outgrow your laptop.",[
      L("The three reasons cloud knowledge is non-optional",
"## What it is\n" +
"You've spent 25 weeks shipping projects that run on your laptop. That's perfect for learning. It's perfect for portfolios. It is **not** perfect for the actual job. In your first DS role you will hit one of three walls:\n\n" +
"1. **The data is too big.** A real customer or transactional dataset is 50-500 GB. You can't `pd.read_parquet` that on a 16 GB laptop. The data lives in **S3 (or GCS / Azure Blob)**; you query it from there with SQL (BigQuery, Athena, Snowflake) or stream it through Spark/Dask.\n" +
"2. **The model has to run on a schedule.** Not 'I ran it once.' 'It runs every Sunday at 3am whether or not I'm awake.' That means cron on a cloud machine, or a managed service (Lambda, Cloud Run, Step Functions).\n" +
"3. **Other people need to reach it.** Your model has to be loadable by other teams, your dashboard has to live somewhere your boss can click. None of that works from your laptop with the lid closed.\n\n" +
"All three roads lead to **cloud object storage**. This week you set up the basics on AWS and Google Cloud — safely, with billing alarms — and run a meaningful task on both. By Sunday you have a working AWS account, a working BigQuery project, your Prophet model living in S3, and one full TaxiPulse query running on BigQuery's public NYC taxi dataset.\n\n" +
"## Why before the capstone\n" +
"The W28-W30 capstone may well use a public dataset that's too big to download locally. The cloud setup you do this week unlocks that option."
      ),
      V("AWS in 100 Seconds","https://www.youtube.com/watch?v=ZzI9JE0i6Lc",3,"Fireship","Watch first. Frames what AWS actually is — the big services, the rough pricing model, why every company uses it."),
      V("What is Google Cloud (and BigQuery) — 100 seconds","https://www.youtube.com/watch?v=kzKFuHk8ovk",3,"Fireship","Watch second. Same orientation for Google Cloud, with BigQuery specifically called out as the data-analytics piece."),
      L("The four cloud habits that protect your wallet",
"## Set a billing alarm before anything else\n" +
"Every cloud horror story (\"I owe AWS $1,800\") starts with someone spinning up a service for a tutorial and forgetting it. Habit #1 on every new cloud account: a billing alarm at $5 that emails you when costs creep up. Free, takes 60 seconds, prevents 100% of catastrophes.\n\n" +
"## Tag everything you create\n" +
"Every resource you spin up — bucket, instance, function — gets a tag like `project=forge-w26 user=me`. When you later wonder \"what's this random thing costing me $3/month?\", the tag tells you exactly which project it belonged to. Real teams do this with Terraform; learners do it by hand and it's still worth the friction.\n\n" +
"## Delete what you stop using\n" +
"Cloud bills are death by a thousand cuts. The 'oh I'll keep that around in case' attitude is what produces the $1,800 horror story. When you finish a week, **delete the bucket / instance / project** unless you have a concrete reason to keep it.\n\n" +
"## Never commit credentials\n" +
"Same rule from the AI-engineering Day 0. AWS access keys + GCS service-account JSON go in `~/.aws/credentials` or `gcloud auth login` profile — never in your repo. A leaked AWS key costs people thousands within hours of being scraped from a public commit.\n\n" +
"Get these habits right today and the cloud is a tool, not a liability."
      ),
      S([
        { prompt: "A billing alarm at $5 protects against the most common cloud cost surprises.", answer: true, whenRight: "Right — runaway tutorial resources rarely make it past $5 before the alarm catches them.", whenWrong: "Yes — set it day 1. Most accidents are caught before they get painful." },
        { prompt: "If a cloud resource is small enough, it's safe to leave running forever without a billing alarm.", answer: false, whenRight: "Right — no. Even a tiny resource compounds, and 'small' once you add five of them isn't small anymore. Always alarm.", whenWrong: "Never skip the alarm. 'Small' adds up; quietly leaking a few dollars per day for a year is a real bill." },
        { prompt: "Committing AWS access keys to a public GitHub repo is mostly harmless because they're scoped.", answer: false, whenRight: "Right — no. Scraped within minutes; abused for crypto mining; you wake up to a $5k bill and a frozen account.", whenWrong: "Never commit keys. They're scraped within minutes by bots; abuse costs real money before AWS rolls back." }
      ]),
      E("Your turn — frame the week","[WRITE] In `CLOUD.md`:\n1. Name the three walls a cloud-illiterate DS hits in a first role.\n2. State your goal for the week: 'By Sunday I will have a working AWS account with billing alarm, a working GCP project with BigQuery, and one meaningful query run on each.'\n3. Commit to deleting any resource you create that you don't actively need by Sunday night.")
    ]),
    D(2,"AWS Free Tier — safely","Sign up, MFA, billing alarm, IAM user, CLI.",[
      L("AWS account setup, done right",
"## What you'll do\n" +
"1. Sign up at https://aws.amazon.com/free with a real email + credit card. Pick **Basic Support — Free**.\n" +
"2. Turn on **MFA** on the root user. Authenticator app (Google Authenticator / Authy).\n" +
"3. Set a **billing alarm at $5** via CloudWatch.\n" +
"4. Create an **IAM user** called `forge-dev` with AdministratorAccess. Never use root again.\n" +
"5. Install **AWS CLI**, run `aws configure`, paste the IAM user's access key.\n" +
"6. Verify with `aws sts get-caller-identity` → you see the IAM user ARN, not root.\n\n" +
"## Why each step\n" +
"- **MFA on root** — the only account that can do truly catastrophic things. Locking it behind a phone is the difference between a stolen password being a scare and a disaster.\n" +
"- **Billing alarm** — see Day 1.\n" +
"- **IAM user (not root)** — the same idea as 'don't use the admin Windows account for everyday browsing.' If your credentials leak, the IAM user gets locked down; the root account is untouched.\n" +
"- **`aws sts get-caller-identity`** — your sanity check that the CLI is correctly authenticated as the IAM user.\n\n" +
"## Free Tier is generous but not infinite\n" +
"Most learning tasks fit comfortably inside Free Tier: S3 (5 GB storage + 20k GET / 2k PUT per month), Lambda (1M requests/month), small EC2 t2.micro hours. Things that escape Free Tier: anything 'larger' (m5, NAT Gateway, RDS), anything you forgot to stop.\n\n" +
"The billing alarm + 'delete what you stop using' habit (Day 1) keeps you safely inside."
      ),
      V("AWS Free Tier setup with MFA + billing alarm","https://www.youtube.com/watch?v=Ip-fqIMG6KU",15,"various","Watch first. Walks you through the exact clicks on AWS's console for MFA + billing alarm + IAM user."),
      S([
        { prompt: "After creating an IAM user, the CLI should authenticate as that user, NOT the root account.", answer: true, whenRight: "Right — verify with `aws sts get-caller-identity`. The ARN should mention forge-dev, not 'root'.", whenWrong: "Yes — root is for emergencies. Day-to-day is the IAM user. The CLI knows the difference via aws configure." },
        { prompt: "You should write down or paste your access keys into a text file in your project repo for convenience.", answer: false, whenRight: "Right — never. `aws configure` stores them in `~/.aws/credentials` which is outside any repo and properly secured.", whenWrong: "Never in a repo. `aws configure` puts them in ~/.aws/credentials — outside any git tracking by default." },
        { prompt: "MFA on the root account is excessive for a learner project.", answer: false, whenRight: "Right — no. Root MFA is the cheapest mistake-prevention you'll ever buy. Always on.", whenWrong: "Root MFA is non-negotiable. Cost: 30 seconds setup. Benefit: catastrophic mistakes become merely uncomfortable." }
      ]),
      E("Your turn — AWS setup","[CODE] 1. Sign up at aws.amazon.com/free (Basic Support — Free).\n2. Turn on MFA on the root user (authenticator app).\n3. Set CloudWatch billing alarm at $5 USD.\n4. Create IAM user `forge-dev` with AdministratorAccess. Save the access key in a password manager.\n5. Install AWS CLI. Run `aws configure`. Paste the key.\n6. Run `aws sts get-caller-identity` → confirm you see your IAM user ARN.\n\nPASS:\n[x] AWS account exists\n[x] Root MFA on\n[x] Billing alarm at $5\n[x] IAM user authenticated via CLI")
    ]),
    D(3,"Upload your Prophet model to S3","From local file to cloud artefact.",[
      L("Creating a bucket + uploading",
"## Create a bucket\n" +
"```bash\n" +
"# bucket names are GLOBALLY unique. Pick something namespaced.\n" +
"aws s3 mb s3://forge-yourname-models --region us-east-1\n" +
"# make_bucket: forge-yourname-models\n" +
"```\n\n" +
"## Upload the v0.3 Prophet model\n" +
"```bash\n" +
"aws s3 cp models/prophet.pkl s3://forge-yourname-models/energy-forecast/prophet.pkl\n" +
"# upload: models/prophet.pkl to s3://...\n\n" +
"aws s3 ls s3://forge-yourname-models/energy-forecast/\n" +
"#                           PRE energy-forecast/\n" +
"# 2026-... 12345  prophet.pkl\n" +
"```\n\n" +
"## Buckets aren't public by default — keep it that way\n" +
"S3 buckets are **private** by default. Don't change that. You'll load from this bucket using IAM credentials from your machine; nothing on the public internet needs to touch it. The cloud's biggest visible failures (Capital One, accidentally-public datasets) all start with 'someone made an S3 bucket public.'\n\n" +
"## Versioning is one click and worth it\n" +
"```bash\n" +
"aws s3api put-bucket-versioning \\\n" +
"  --bucket forge-yourname-models \\\n" +
"  --versioning-configuration Status=Enabled\n" +
"```\n" +
"With versioning on, every upload of `prophet.pkl` keeps the previous version too. Accidentally overwrite with a worse model? Roll back in one CLI call. Costs almost nothing for sub-100MB artefacts."
      ),
      L("See it in code (with output)",
"## A clean upload flow\n" +
"```bash\n" +
"# Create the bucket (one time)\n" +
"aws s3 mb s3://forge-yourname-models --region us-east-1\n\n" +
"# Turn on versioning\n" +
"aws s3api put-bucket-versioning \\\n" +
"  --bucket forge-yourname-models \\\n" +
"  --versioning-configuration Status=Enabled\n\n" +
"# Upload from v0.3 of Energy Forecast\n" +
"aws s3 cp models/prophet.pkl s3://forge-yourname-models/energy-forecast/prophet.pkl\n\n" +
"# Verify it lives there\n" +
"aws s3 ls s3://forge-yourname-models/energy-forecast/\n" +
"# 2026-XX-XX HH:MM:SS   123456 prophet.pkl\n" +
"```\n\n" +
"## What you just made possible\n" +
"Any machine with your IAM credentials can now load `prophet.pkl` with three lines of code (Day 4). That means:\n" +
"- A teammate on a different laptop can use the same model.\n" +
"- A scheduled job on Lambda or Cloud Run can load it without bundling it into the deploy artefact.\n" +
"- Future you, on a fresh machine in a year, can pull v0.3 of the model back instantly via the versioning history."
      ),
      S([
        { prompt: "S3 bucket names are globally unique across all AWS customers.", answer: true, whenRight: "Right — yours doesn't exist anywhere on AWS. Namespace with your username to avoid collisions.", whenWrong: "Yes — global namespace. Pick something unique like forge-yourname-models." },
        { prompt: "Making an S3 bucket public is a normal way to share data with your team.", answer: false, whenRight: "Right — no. Keep buckets private; teammates use IAM credentials. Public-by-mistake is the #1 cloud breach source.", whenWrong: "Never public. IAM credentials, presigned URLs, or VPC endpoints are the right tools for team sharing." },
        { prompt: "Versioning on a bucket lets you recover the previous version of a file after overwriting it.", answer: true, whenRight: "Right — every PUT stores a new version; previous ones stay accessible by version ID.", whenWrong: "Yes — versioning preserves history. Overwrote prophet.pkl with junk? Roll back in one command." }
      ]),
      E("Your turn — upload","[CODE] 1. Create an S3 bucket with a namespaced name (forge-yourname-models). Versioning on.\n2. `aws s3 cp models/prophet.pkl s3://your-bucket/energy-forecast/prophet.pkl`.\n3. `aws s3 ls s3://your-bucket/energy-forecast/` to confirm it's there.\n4. Markdown: paste the listing into your notebook for the record.")
    ]),
    D(4,"Load the model FROM S3 in code","Inference that doesn't depend on local files.",[
      L("Loading from S3 in Python",
"## The clean pattern\n" +
"```python\n" +
"import io, joblib, boto3\n\n" +
"BUCKET = 'forge-yourname-models'\n" +
"KEY    = 'energy-forecast/prophet.pkl'\n\n" +
"s3   = boto3.client('s3')\n" +
"data = s3.get_object(Bucket=BUCKET, Key=KEY)['Body'].read()\n" +
"model = joblib.load(io.BytesIO(data))\n\n" +
"# Now make a prediction without any local file dependency\n" +
"forecast = model.predict(model.make_future_dataframe(periods=7, freq='D'))\n" +
"print(forecast[['ds','yhat']].tail())\n" +
"```\n\n" +
"## Why `io.BytesIO`\n" +
"`joblib.load` expects a file-like object. `s3.get_object` returns the raw bytes; wrapping in `BytesIO` gives joblib something it can read from without ever touching a file on disk. Clean and works on serverless environments where the filesystem is ephemeral.\n\n" +
"## boto3 finds your credentials automatically\n" +
"Because you ran `aws configure` on Day 2, `boto3.client('s3')` automatically reads `~/.aws/credentials`. No keys in code. If the same script runs on EC2 / Lambda / Cloud Run, it would pick up the service's IAM role automatically — same code, no changes.\n\n" +
"## What you've actually built\n" +
"A model artefact and a loading pattern that work identically on:\n" +
"- Your laptop\n" +
"- A scheduled cron on a cloud VM\n" +
"- A Lambda function\n" +
"- A teammate's machine\n\n" +
"That's portability. That's the cloud's main gift to a data scientist."
      ),
      L("See it in code (with output)",
"## Minimal end-to-end inference\n" +
"```python\n" +
"import io, joblib, boto3, pandas as pd\n\n" +
"s3 = boto3.client('s3')\n" +
"raw = s3.get_object(Bucket='forge-yourname-models',\n" +
"                    Key='energy-forecast/prophet.pkl')['Body'].read()\n" +
"model = joblib.load(io.BytesIO(raw))\n\n" +
"future = model.make_future_dataframe(periods=14, freq='D')\n" +
"forecast = model.predict(future)\n" +
"print(forecast[['ds','yhat','yhat_lower','yhat_upper']].tail(3).round(0))\n" +
"#            ds     yhat  yhat_lower  yhat_upper\n" +
"# 5044  2018-04-07  16670       15140       18180\n" +
"# 5045  2018-04-08  16410       14860       17920\n" +
"# 5046  2018-04-09  16895       15370       18450\n" +
"```\n" +
"No `prophet.pkl` on the local filesystem. The model is pulled fresh from S3 every run."
      ),
      S([
        { prompt: "boto3 finds credentials automatically via `~/.aws/credentials` (or an IAM role when running on EC2 / Lambda).", answer: true, whenRight: "Right — same code on laptop or in the cloud. Credentials come from the environment.", whenWrong: "Yes — that's the magic. Local: credentials file. Cloud: IAM role. Code is identical." },
        { prompt: "joblib.load can read directly from a bytes buffer like `io.BytesIO`.", answer: true, whenRight: "Right — that's how you avoid writing a temp file. Get bytes from S3, wrap, load.", whenWrong: "Yes — file-like input is fine. BytesIO turns raw bytes into something joblib understands." },
        { prompt: "Loading the model from S3 every run is wasteful and you should always cache to local disk.", answer: false, whenRight: "Right — depends. For batch jobs that re-run sporadically, fresh-from-S3 is correct (always latest). For latency-sensitive services, cache after first load.", whenWrong: "Context-dependent. Caching helps latency but risks staleness. For batch jobs, fresh-each-run is right." }
      ]),
      E("Your turn — load from S3","[CODE] In a fresh notebook `notebooks/06-cloud.ipynb`:\n1. Use boto3 to pull `prophet.pkl` from your bucket.\n2. joblib.load from BytesIO.\n3. Predict 14 days ahead. Print the tail.\n4. Delete `models/prophet.pkl` LOCALLY (or move it). Re-run — the code should still work because it reads from S3.")
    ]),
    D(5,"Set up BigQuery (free, no credit card)","Google Cloud's free analytics warehouse.",[
      L("BigQuery in plain English",
"## What it is\n" +
"**BigQuery** is Google's serverless data warehouse. You write SQL; Google runs it on however many machines it takes to finish in seconds — even on terabytes. You pay per byte scanned, not per machine-hour.\n\n" +
"## Why the free tier is so good\n" +
"- **1 TB of query bytes scanned per month** — for context, querying every NYC taxi trip from 2009 scans ~5 GB. You'd need to run ~200 such queries before hitting the cap.\n" +
"- **10 GB of storage**\n" +
"- **No credit card required to start**\n" +
"- **Free access to Google's public datasets** (NYC taxi, GitHub commits, Wikipedia, OpenStreetMap, Patents)\n\n" +
"## Setup, the path of least resistance\n" +
"1. Sign in at https://console.cloud.google.com with a free Google account.\n" +
"2. Create a project (any name — `forge-bq` is fine).\n" +
"3. Enable the BigQuery API (the console prompts you the first time you open BigQuery).\n" +
"4. That's it. No billing setup required for the free tier.\n\n" +
"## The BigQuery console\n" +
"At `https://console.cloud.google.com/bigquery` you get a SQL editor in the browser. Write a query, hit Run, results in seconds with the bytes-scanned cost shown right above. **Look at the bytes-scanned number before clicking Run** — if it says 10 GB on a query you didn't think was that big, abort and add a `WHERE` clause first.\n\n" +
"## Python client\n" +
"```bash\n" +
"pip install google-cloud-bigquery\n" +
"gcloud auth application-default login   # browser opens, you sign in\n" +
"```\n" +
"After that, Python code can run queries without API keys in code — same idea as AWS's IAM. Credentials live in your local config; production code uses service accounts."
      ),
      L("Your first BigQuery query",
"## Public NYC taxi data, in three lines\n" +
"```sql\n" +
"-- In the BigQuery console SQL editor\n" +
"SELECT\n" +
"  EXTRACT(HOUR FROM pickup_datetime) AS hour,\n" +
"  COUNT(*) AS trips\n" +
"FROM `bigquery-public-data.new_york_taxi_trips.tlc_yellow_trips_2019`\n" +
"WHERE pickup_datetime BETWEEN '2019-06-01' AND '2019-06-08'\n" +
"GROUP BY hour\n" +
"ORDER BY hour;\n" +
"```\n\n" +
"## What you'll see\n" +
"```text\n" +
"hour | trips\n" +
"-----+-------\n" +
" 0   | 81233\n" +
" 1   | 51019\n" +
" ...\n" +
" 18  | 167482   <- rush hour\n" +
" 19  | 161904\n" +
"\n" +
"This query will process 1.2 GB when run.\n" +
"```\n\n" +
"## Why this is real cloud work\n" +
"You scanned one week of every yellow-taxi trip in NYC (millions of rows) in <5 seconds. The same query as a `pd.read_parquet` would need the file downloaded locally first — which for a year of yellow-taxi data is ~25 GB. BigQuery flips that: data stays put, query goes to it.\n\n" +
"That model is how cloud data warehouses (Snowflake, Databricks, Redshift) all work. Once you can write BigQuery SQL, the others are 80% identical syntax."
      ),
      S([
        { prompt: "BigQuery's free tier gives you 1 TB of query processing per month with no credit card.", answer: true, whenRight: "Right — enough to learn meaningfully on real public datasets. Plenty of headroom for a learner.", whenWrong: "Yes — 1 TB scanned + 10 GB storage. Public datasets included. No card to start." },
        { prompt: "BigQuery charges per byte SCANNED, not per machine-hour.", answer: true, whenRight: "Right — pricing model = bytes read by the query. The same query on the same data costs roughly the same regardless of machine pool.", whenWrong: "Yes — per byte scanned. That's why a tight WHERE clause is cost-effective; it scans fewer bytes." },
        { prompt: "You should always click Run immediately; checking bytes-scanned first is paranoid.", answer: false, whenRight: "Right — no. Bytes-scanned is your cost preview. A SELECT * with no filter on a big table can scan TB.", whenWrong: "Always read bytes-scanned first. A no-WHERE-clause query on a TB table costs as much as a TB. Filter first." }
      ]),
      E("Your turn — first BigQuery","[CODE] 1. console.cloud.google.com → create project `forge-bq`.\n2. Open BigQuery (the console prompts you to enable the API).\n3. Paste the NYC taxi SQL from above into the SQL editor.\n4. CHECK the bytes-scanned number before clicking Run.\n5. Run. Screenshot the results.\n6. Markdown: how many trips happened in the peak hour, and how many GB did the query scan?")
    ]),
    D(6,"Run TaxiPulse at full scale","Reproduce your Week 1-3 analysis on the whole multi-year dataset.",[
      L("Scaling TaxiPulse to multiple years",
"## What you'll do\n" +
"Take the busiest-hour analysis from TaxiPulse W1 — a single month — and run it on every yellow-taxi trip BigQuery has (multiple years). On your laptop this would mean downloading and processing tens of GB. On BigQuery it's a few seconds.\n\n" +
"```sql\n" +
"WITH hours AS (\n" +
"  SELECT EXTRACT(HOUR FROM pickup_datetime) AS hour,\n" +
"         EXTRACT(YEAR FROM pickup_datetime) AS year,\n" +
"         COUNT(*) AS trips\n" +
"  FROM `bigquery-public-data.new_york_taxi_trips.tlc_yellow_trips_2015`\n" +
"  WHERE fare_amount BETWEEN 2.5 AND 200\n" +
"  GROUP BY year, hour\n" +
"  UNION ALL\n" +
"  SELECT EXTRACT(HOUR FROM pickup_datetime), EXTRACT(YEAR FROM pickup_datetime), COUNT(*)\n" +
"  FROM `bigquery-public-data.new_york_taxi_trips.tlc_yellow_trips_2016`\n" +
"  WHERE fare_amount BETWEEN 2.5 AND 200\n" +
"  GROUP BY 2, 1\n" +
"  UNION ALL\n" +
"  SELECT EXTRACT(HOUR FROM pickup_datetime), EXTRACT(YEAR FROM pickup_datetime), COUNT(*)\n" +
"  FROM `bigquery-public-data.new_york_taxi_trips.tlc_yellow_trips_2017`\n" +
"  WHERE fare_amount BETWEEN 2.5 AND 200\n" +
"  GROUP BY 2, 1\n" +
")\n" +
"SELECT year, hour, trips\n" +
"FROM hours\n" +
"ORDER BY year, trips DESC;\n" +
"```\n\n" +
"## What you'll find\n" +
"Same shape as your W1 finding: 6-7pm is the busiest hour, but now you'll see the **trend across years** — total trips dropping as ride-share (Uber, Lyft) eats yellow-cab share. That's the story your W1 single-month dataset couldn't tell.\n\n" +
"## Compare with what `pd.read_parquet` would cost\n" +
"```text\n" +
"3 years of yellow-taxi parquets ~ 75 GB to download\n" +
"  Bandwidth + disk + laptop RAM: practically impossible.\n" +
"BigQuery: query runs in ~10 seconds, scans ~15 GB on Google's side.\n" +
"```\n" +
"This week's cost: ~$0 (well inside free tier). What you'd pay for a single laptop capable of processing it locally: thousands.\n\n" +
"## Pull the result into Python\n" +
"```python\n" +
"from google.cloud import bigquery\n" +
"client = bigquery.Client()\n" +
"sql = open('queries/multi_year_hours.sql').read()\n" +
"df = client.query(sql).to_dataframe()\n" +
"print(df.head())\n" +
"```\n" +
"`to_dataframe()` returns a pandas DataFrame from the query result. From there, plotting and downstream analysis are identical to anything you've done locally."
      ),
      L("See it in code (with output)",
"## End to end\n" +
"```python\n" +
"from google.cloud import bigquery\n" +
"import matplotlib.pyplot as plt\n\n" +
"client = bigquery.Client()\n" +
"sql = '''\n" +
"  SELECT EXTRACT(YEAR FROM pickup_datetime) AS year,\n" +
"         COUNT(*)                              AS trips\n" +
"  FROM `bigquery-public-data.new_york_taxi_trips.tlc_yellow_trips_2015`\n" +
"  WHERE fare_amount BETWEEN 2.5 AND 200\n" +
"  GROUP BY year\n" +
"  UNION ALL\n" +
"  SELECT 2016, COUNT(*) FROM `bigquery-public-data.new_york_taxi_trips.tlc_yellow_trips_2016`\n" +
"  WHERE fare_amount BETWEEN 2.5 AND 200\n" +
"  UNION ALL\n" +
"  SELECT 2017, COUNT(*) FROM `bigquery-public-data.new_york_taxi_trips.tlc_yellow_trips_2017`\n" +
"  WHERE fare_amount BETWEEN 2.5 AND 200\n" +
"  ORDER BY year\n" +
"'''\n" +
"df = client.query(sql).to_dataframe()\n" +
"print(df)\n" +
"#   year      trips\n" +
"# 0 2015  146112989\n" +
"# 1 2016  131165043   <- down 10%\n" +
"# 2 2017  113496231   <- down 13%\n" +
"# That's the Uber effect, visible at last.\n" +
"```"
      ),
      S([
        { prompt: "BigQuery lets you ask questions of data far too big to fit on your laptop.", answer: true, whenRight: "Right — 75 GB of taxi data, queried in seconds without leaving Google's infra.", whenWrong: "Yes — that's the whole pitch. Data stays in cloud storage; queries reach it." },
        { prompt: "`client.query(sql).to_dataframe()` returns a pandas DataFrame from a BigQuery result.", answer: true, whenRight: "Right — direct integration. Everything downstream is identical to local pandas work.", whenWrong: "Yes — to_dataframe() bridges BigQuery and pandas. From there, plotting and analysis are your normal tools." },
        { prompt: "Running this query 100 times on the free tier will go over the 1 TB limit.", answer: false, whenRight: "Right — no. Each run scans ~5 GB. 100 runs ≈ 500 GB. Still inside the 1 TB free monthly cap.", whenWrong: "100 runs of a 5 GB query = 500 GB. Still inside the 1 TB monthly cap. You have a lot of headroom." }
      ]),
      E("Your turn — multi-year","[CODE] In `notebooks/06-cloud.ipynb`:\n1. `pip install google-cloud-bigquery pandas-gbq pyarrow`.\n2. Run a BigQuery query that fetches trip counts per year for 2015, 2016, 2017 (yellow-taxi).\n3. `to_dataframe()` and print the result.\n4. Plot the year-over-year trend. Save chart to `charts/taxi_yoy.png`.\n5. Markdown: name the trend you see and one plausible explanation.")
    ]),
    D(7,"Tag cloud-aware","Document + commit + tag what you just built.",[
      L("Shipping the cloud milestone",
"## What goes in the README\n" +
"```text\n" +
"## cloud-aware — AWS + GCP set up safely\n" +
"- AWS: account with root MFA, billing alarm at $5, IAM user forge-dev, CLI authenticated\n" +
"- S3 bucket: forge-yourname-models (versioning on), prophet.pkl stored at energy-forecast/\n" +
"- Inference now loads model from S3 (notebooks/06-cloud.ipynb) — no local file dependency\n" +
"- GCP: project forge-bq, BigQuery enabled, console + gcloud client both working\n" +
"- TaxiPulse multi-year scan: 2015→2017 yellow-taxi trip counts (charts/taxi_yoy.png)\n" +
"  -10% yoy 2015→2016, -13% yoy 2016→2017 — Uber-effect visible at last\n" +
"- Habits enforced: every resource tagged; tear-down planned before billing rolls over\n" +
"```\n\n" +
"## What you ship\n" +
"```bash\n" +
"git add notebooks/06-cloud.ipynb charts/taxi_yoy.png queries/*.sql README.md CLOUD.md\n" +
"git commit -m \"Cloud aware: AWS S3 + BigQuery on free tier, model artifact in S3\"\n" +
"git tag cloud-aware\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## What this milestone proves\n" +
"You're no longer laptop-bound. You can:\n" +
"- Store a model in a place your team can reach\n" +
"- Run analytics on datasets too big for your machine\n" +
"- Do all of this without leaking credentials or surprise bills\n\n" +
"That's the production-aware data scientist. Most learner projects never cross this line.\n\n" +
"## Tear-down checklist before billing rolls over\n" +
"- [ ] S3 bucket still needed? Keep (it's a few cents/month) or delete + reupload next time.\n" +
"- [ ] AWS billing alarm verified working (test by setting threshold to $0.01 temporarily, confirm email, reset).\n" +
"- [ ] BigQuery project — keep it, no charges accrue under free tier.\n" +
"- [ ] No EC2 / RDS / NAT Gateway accidentally left running."
      ),
      S([
        { prompt: "Tagging `cloud-aware` marks the moment your portfolio crossed from laptop-only to cloud-native.", answer: true, whenRight: "Right — meaningful checkpoint. Reviewers can see exactly when you stopped being purely local.", whenWrong: "Yes — the tag is the marker. Anyone checking out cloud-aware sees your first cloud-native commit." },
        { prompt: "After this week, you can store models and query data without your laptop being the bottleneck.", answer: true, whenRight: "Right — the cloud half of the job is now within reach. Same SQL, same Python, just hosted somewhere bigger.", whenWrong: "Yes — your data + model artefacts live in places your laptop's size doesn't constrain." },
        { prompt: "After tagging, you can ignore the resources you created — cloud accounts manage themselves.", answer: false, whenRight: "Right — no. Bills accumulate quietly. Run the tear-down checklist; delete what you don't actively need.", whenWrong: "Cloud accounts never self-manage. Always tear down or alarm. The end-of-week ritual prevents surprise bills." }
      ]),
      E("Your turn — ship cloud-aware","[PRODUCE] 1. README cloud-aware section with: AWS bucket, S3-loaded model, BigQuery YoY finding + chart, the cost stats (bytes scanned, $0).\n2. Commit + tag:\n`git add . && git commit -m 'cloud-aware: S3 + BigQuery setup'`\n`git tag cloud-aware && git push --tags`\n3. Tear-down checklist:\n- [ ] S3 bucket reviewed (keep or delete)\n- [ ] AWS billing alarm verified\n- [ ] No accidental resources running\n\nPASS:\n[x] AWS account with billing alarm + IAM user\n[x] Prophet model in S3\n[x] notebooks/06-cloud.ipynb loads from S3\n[x] BigQuery multi-year query + chart in README\n[x] cloud-aware tag pushed")
    ])
  ]
};

/* ════ WEEK 27 — Energy Forecast v1.0: Ship + retro ════ */
const W27 = {
  number: 27, title: "Energy Forecast v1.0: Ship + retro",
  phase: "Time Series", commitment_hours: "10-15",
  context: ds.weeks[26].context,
  concept_check: [
    { q: "Why ship Energy Forecast v1.0 the same way Reddit Sentiment shipped (blog post + demo + readers + retro)?",
      choices: ["Tradition","The shipping ritual proves you can communicate the work AND hardens it — outsider feedback always exposes things you can't see yourself",
        "More commits","To use more disk space"],
      correct: 1, explain: "Building the model is half the work. Communicating it is the other half. The blog post forces you to explain the choices a non-DS reader can follow; the demo gives them something to click; three readers expose what's confusing; the retro extracts portable lessons. Every project gets harder if you skip this ritual — and the lessons compound across projects." },
    { q: "Which is the right model to put in the live demo for Energy Forecast?",
      choices: ["LSTM — it's the most modern","Prophet — lowest MAE on this holiday-heavy series and interpretable component plots a stakeholder can read",
        "Persistence — simplest","Whichever you trained most recently"],
      correct: 1, explain: "Prophet wins on this dataset (612 MAE vs LSTM 654, ARIMA 706, persistence 868) AND its components plot turns the forecast into an explanation a grid operator can act on. LSTM goes in the repo as a documented alternative; the demo shows the production pick." },
    { q: "Why send the post + repo to THREE outside readers, not just one?",
      choices: ["Three is a magic number","One reader's confusion could be idiosyncratic; three converging on the same point of confusion is a reliable signal",
        "More feedback = better","Because you'd ignore one"],
      correct: 1, explain: "Three readers gives you the statistical signal that one doesn't. If all three got lost at the same paragraph, you have your highest-value edit. If three readers all skip different things, you've probably built a good piece. One reader is a sample of one; you don't act on a sample of one." }
  ],
  days: [
    D(1,"Pick the winner","One model. One story. One link.",[
      L("Closing out the modeling choice",
"## What it is\n" +
"You've built four models across W21-W25 (persistence baseline, ARIMA, Prophet, LSTM). MLflow has them all logged. This week ships **one** — the production pick — with a public link a recruiter can click.\n\n" +
"## The pick\n" +
"On this dataset, **Prophet** wins. Reasoning, written for the README:\n" +
"\n" +
"- **Lowest MAE on a holiday-heavy series.** 612 vs LSTM 654, ARIMA 706, persistence 868.\n" +
"- **Interpretable component plot.** A non-technical reader can look at the trend / weekly / yearly / holiday breakdown and explain why demand is what it is. ARIMA's coefficients and the LSTM's weights don't enable that conversation.\n" +
"- **Explicit uncertainty intervals.** Grid-operator audiences plan against worst-plausible, not mean. Prophet's intervals are usable as-is; LSTM intervals require extra Bayesian-NN work that isn't worth it for the gain.\n" +
"- **Fast to retrain.** Drift fires (W25); we retrain Prophet in seconds on a few hundred MB of recent data. LSTM is hours of GPU.\n\n" +
"## What this means for the demo\n" +
"The live dashboard shows Prophet's forecast + intervals + component plot. The other three models stay in the repo as documented alternatives with their MAEs in the comparison table.\n\n" +
"## Where this fits\n" +
"By tonight: production pick is explicit + justified. Tomorrow: a small Streamlit dashboard around it. Wednesday: deploy. Thursday: blog. Friday: demo video. Saturday: outside readers. Sunday: retro + tag v1.0."
      ),
      S([
        { prompt: "Picking ONE model for the demo (with the others documented in the repo) is clearer than showing all four in the live UI.", answer: true, whenRight: "Right — the live demo tells one story. Comparison table goes in the repo where reviewers want depth.", whenWrong: "Yes — one story for the demo, depth in the repo. Don't make the live app a museum." },
        { prompt: "Prophet is the right pick for this project mainly because it has the lowest MAE.", answer: false, whenRight: "Right — MAE alone isn't the reason. Interpretability + intervals + retrain speed all reinforce the choice.", whenWrong: "MAE matters but so do intervals, interpretability, retrain cost. Pick on the whole story." },
        { prompt: "Keeping the other models in the repo as alternatives is more credible than deleting them.", answer: true, whenRight: "Right — comparison shows you measured. Reviewers see you didn't pick the trendy choice unjustified.", whenWrong: "Yes — keep them. The comparison is half the story. Reviewers respect documented losers." }
      ]),
      E("Your turn — write the pick","[WRITE] In a new section of the Energy Forecast README:\n1. Headline: 'Production model: Prophet. Why.'\n2. Three reasons (MAE, intervals, interpretability) with the actual numbers.\n3. Tell the reader where ARIMA + LSTM live in the repo and what they're useful for.\n4. End with: 'Demo dashboard ships this week.'")
    ]),
    D(2,"Build a small Streamlit dashboard","Forecast + interval + components plot, one page.",[
      L("The dashboard structure",
"## What it is\n" +
"A single-page Streamlit app that:\n" +
"1. Loads the Prophet model from S3 (Week 26 setup paying off).\n" +
"2. Lets the user pick a forecast horizon (slider, 7-30 days).\n" +
"3. Shows the forecast plot with the 95% interval shaded.\n" +
"4. Shows the components plot (trend / weekly / yearly / holidays).\n" +
"5. Shows a small table: 'next 7 days forecast + interval'.\n\n" +
"## Why Streamlit\n" +
"For a portfolio dashboard with no real users, Streamlit is the fastest path. Same reason the Reddit Sentiment dashboard used it. ~80 lines of Python and you have something deployable.\n\n" +
"## File layout\n" +
"```text\n" +
"app/\n" +
"  streamlit_app.py        # main entry point\n" +
"  load_model.py           # boto3 + joblib helper (from W26)\n" +
"  requirements.txt        # streamlit, prophet, boto3, joblib, matplotlib\n" +
"```\n\n" +
"## Cache the model load\n" +
"The Prophet model is several MB. Without caching, Streamlit reloads it on every interaction. With `@st.cache_resource`, it loads once per session.\n" +
"```python\n" +
"@st.cache_resource\n" +
"def get_model():\n" +
"    return load_prophet_from_s3()\n" +
"```\n\n" +
"## What you'll see by end of day\n" +
"`streamlit run app/streamlit_app.py` opens the browser at localhost:8501. Slider works. Forecast updates. Components render. That's the local prototype that goes live tomorrow."
      ),
      L("See it in code (with output)",
"## Minimal streamlit_app.py\n" +
"```python\n" +
"import streamlit as st\n" +
"import pandas as pd\n" +
"from load_model import get_model\n\n" +
"st.set_page_config(page_title='Energy Forecast', layout='wide')\n" +
"st.title('AEP Energy Demand Forecast')\n\n" +
"horizon = st.slider('Forecast horizon (days)', 7, 30, 14)\n\n" +
"@st.cache_resource\n" +
"def cached():\n" +
"    return get_model()\n\n" +
"model = cached()\n" +
"future = model.make_future_dataframe(periods=horizon, freq='D')\n" +
"forecast = model.predict(future).tail(horizon)\n\n" +
"col1, col2 = st.columns([2, 1])\n" +
"with col1:\n" +
"    st.subheader('Forecast')\n" +
"    fig = model.plot(model.predict(model.make_future_dataframe(periods=horizon, freq='D')))\n" +
"    st.pyplot(fig)\n" +
"with col2:\n" +
"    st.subheader('Next ' + str(horizon) + ' days')\n" +
"    st.dataframe(forecast[['ds','yhat','yhat_lower','yhat_upper']].round(0))\n\n" +
"st.subheader('Components')\n" +
"st.pyplot(model.plot_components(model.predict(model.make_future_dataframe(periods=horizon, freq='D'))))\n" +
"```\n\n" +
"## What this gives the viewer\n" +
"In ~50 lines: a usable forecaster with intervals and explainability. They drag the slider; the forecast updates; the components plot tells them WHY. That's a complete demo."
      ),
      S([
        { prompt: "`@st.cache_resource` prevents Streamlit from re-loading the model on every interaction.", answer: true, whenRight: "Right — cached once per session. Without it, every slider drag re-downloads from S3.", whenWrong: "Yes — cache the expensive thing. Models, DB connections, anything slow to set up." },
        { prompt: "Showing the components plot in the demo is more useful than just showing the forecast.", answer: true, whenRight: "Right — the forecast is one number; the components explain it. Reviewers see the story, not the punchline.", whenWrong: "Yes — components is the story. The forecast is the punchline. Show both." },
        { prompt: "For a portfolio demo, you should hand-build the dashboard in React + a Python API to look more impressive.", answer: false, whenRight: "Right — no. Streamlit ships in hours; React+API ships in weeks. Spend time on the model + story, not the chrome.", whenWrong: "Streamlit is the right tool for a learner demo. React + API for portfolios is over-engineering." }
      ]),
      E("Your turn — local demo","[CODE] 1. Create `app/streamlit_app.py` with the structure above.\n2. `pip install streamlit prophet boto3 joblib matplotlib`.\n3. `streamlit run app/streamlit_app.py`.\n4. Confirm: slider works, forecast updates, components render.\n5. Screenshot for the README.")
    ]),
    D(3,"Deploy the dashboard","Streamlit Community Cloud (free) or Hugging Face Spaces.",[
      L("Going live in 20 minutes",
"## Streamlit Community Cloud (recommended)\n" +
"Free, no card. The path:\n" +
"1. Push your `app/` folder + `requirements.txt` to a GitHub repo (even your existing Energy Forecast repo works — point Streamlit at the `app/` subfolder).\n" +
"2. Sign in at https://share.streamlit.io with GitHub.\n" +
"3. New app → pick the repo → main file is `app/streamlit_app.py`.\n" +
"4. Add **secrets**: AWS access key + secret for the S3 model download. Streamlit's secrets UI keeps them out of git.\n" +
"5. Deploy. ~3 minutes later you have a public `https://your-app.streamlit.app` URL.\n\n" +
"## Why not Vercel or AWS\n" +
"Vercel is for Next.js/Node, not Python. Direct AWS deployment (EC2, ECS, Lambda) takes hours and requires more infra knowledge than this project demands. Streamlit Cloud is the path of least resistance for a single Python script.\n\n" +
"## Hugging Face Spaces as a fallback\n" +
"If Streamlit Cloud is down or you've hit its app limit, Hugging Face Spaces deploys the same Streamlit app from a different repo (their Spaces system supports Streamlit out of the box). Same deploy effort.\n\n" +
"## Test the public URL\n" +
"Open it in an incognito window (no auth, no cached creds) — confirm it loads, the slider works, the components plot renders. That's the URL going in the blog post."
      ),
      L("Secrets, the safe way",
"## Why you absolutely don't commit AWS keys\n" +
"You set this rule on W26 Day 2. The deployed app needs to load from S3, which means credentials — but those credentials live in Streamlit's secrets, never in your repo.\n\n" +
"## In Streamlit Cloud's UI\n" +
"App settings → Secrets → paste a TOML block:\n" +
"```toml\n" +
"[aws]\n" +
"access_key_id     = \"AKIAxxxxxxxxxxxx\"\n" +
"secret_access_key = \"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\"\n" +
"region            = \"us-east-1\"\n" +
"```\n\n" +
"## In your Python code\n" +
"```python\n" +
"import streamlit as st\n" +
"import boto3\n\n" +
"def s3_client():\n" +
"    creds = st.secrets['aws']\n" +
"    return boto3.client(\n" +
"        's3',\n" +
"        aws_access_key_id=creds['access_key_id'],\n" +
"        aws_secret_access_key=creds['secret_access_key'],\n" +
"        region_name=creds['region'],\n" +
"    )\n" +
"```\n\n" +
"## Why this is the right pattern\n" +
"- Secrets stay in Streamlit Cloud's encrypted store, never on disk.\n" +
"- Your repo is safe to be public.\n" +
"- Rotation is one paste in the secrets UI, no redeploy.\n\n" +
"## What you'll have live by end of day\n" +
"A public URL serving the dashboard. You can text it to a friend. It loads anywhere. That's the demo link the blog post and the demo video both point at."
      ),
      S([
        { prompt: "Streamlit Cloud's free tier is enough for a portfolio dashboard.", answer: true, whenRight: "Right — free, public URL, decent uptime. Perfect for portfolio + interview demos.", whenWrong: "Yes — generous free tier. Cold-start latency is the trade-off, fine for a demo." },
        { prompt: "AWS keys should be pasted into `streamlit_app.py` for the deploy.", answer: false, whenRight: "Right — never. Use Streamlit's secrets UI. The repo stays clean; rotation stays painless.", whenWrong: "Never inline. Streamlit secrets → toml block. Code reads from st.secrets, repo stays safe." },
        { prompt: "Testing the public URL in an incognito window verifies it works for someone who's NOT signed in to your accounts.", answer: true, whenRight: "Right — that's the demo experience. Cookies-clean test is the real check.", whenWrong: "Yes — incognito mimics a recruiter. If it works there, it works for anyone you send the link to." }
      ]),
      E("Your turn — deploy","[CODE] 1. Push `app/` + `requirements.txt` to your Energy Forecast GitHub repo.\n2. share.streamlit.io → New app → pick repo, point at `app/streamlit_app.py`.\n3. Add AWS secrets in Streamlit's UI (toml block).\n4. Deploy. Wait for the public URL.\n5. Test in incognito. Slider, forecast, components — all working.\n6. Save the URL — it's going in the blog tomorrow.")
    ]),
    D(4,"Write the blog post","One link in the world that tells the story.",[
      L("The post structure",
"## What it is\n" +
"A single dev.to (or Medium, or Substack) post. ~1,500 words. Written for a data-scientist reader who has heard of ARIMA but isn't a forecasting specialist. Tells the story of building Energy Forecast end-to-end.\n\n" +
"## The structure that works\n" +
"```text\n" +
"1. Hook — one paragraph: 'I forecast US electricity demand 7 days out. Here's how, and why Prophet beat ARIMA and a neural net.'\n" +
"2. The data — 1 paragraph. AEP hourly demand, ~15 years, public.\n" +
"3. Persistence baseline — 1 paragraph. The bar to beat. MAE = 868.\n" +
"4. ARIMA — 2 paragraphs. The classical approach, what it captured, what it missed.\n" +
"5. Prophet — 2 paragraphs. Decomposable model, holiday effects, why it pulled ahead.\n" +
"6. LSTM — 2 paragraphs. The deep-learning attempt, what it learned, why it didn't beat Prophet on this data.\n" +
"7. The verdict — 1 paragraph. Prophet, with reasoning (MAE, intervals, interpretability, retrain speed).\n" +
"8. Live demo — 1 line + a link. The Streamlit URL from Day 3.\n" +
"9. Code + retros — link to repo.\n" +
"10. What I'd do differently — 2 short bullet points. Honest weaknesses (heatwave under-prediction; need more recent data).\n" +
"```\n\n" +
"## Why this structure\n" +
"- **Hook with a result, not a setup.** Readers leave halfway; deliver value early.\n" +
"- **Comparison structure mirrors the project.** Anyone reading sees the same workflow they'd run themselves.\n" +
"- **Demo link before the deep dive.** Even a reader who only skims gets to the working thing.\n" +
"- **Weaknesses at the end.** Builds trust; shows you know your model's limits.\n\n" +
"## What to put in vs. leave out\n" +
"In: numbers (MAE), one chart per model, the verdict reasoning.\n" +
"Out: code snippets longer than 5 lines (link to repo), implementation trivia (which scaler you used), library version pinning.\n\n" +
"## The headline matters more than the body\n" +
"Write 5 candidate titles. Pick the one that promises something specific:\n" +
"- Good: 'Why I shipped Prophet (not the LSTM) for forecasting US electricity demand'\n" +
"- Mediocre: 'My time series forecasting project'\n" +
"- Bad: 'Energy Forecasting with Machine Learning'"
      ),
      L("Practical writing tips",
"## Open in markdown\n" +
"Write the post locally in a `.md` file. Copy/paste into dev.to or Medium when done. Editing in those rich-text editors is slow + risky.\n\n" +
"## Reuse your charts\n" +
"The three-way model comparison chart from W24, the components plot, the residual analysis — all of them go directly in the post. You already have them.\n\n" +
"## Honest tone beats polished tone\n" +
"'I expected the LSTM to win and it didn't. Here's why.' is more memorable than 'In this exhaustive comparison...'\n\n" +
"## Keep code blocks short\n" +
"Maximum ~10 lines per code block in the post. For longer code, link to the GitHub file: `[full training loop on GitHub](https://github.com/.../w24-lstm.py)`.\n\n" +
"## Read the post out loud before publishing\n" +
"You catch ~80% of awkward sentences this way. The 'too jargon-y' sections especially become obvious."
      ),
      S([
        { prompt: "Putting the live demo URL near the top of the post is more effective than at the end.", answer: true, whenRight: "Right — even skim readers see the working thing. The demo proves the story before the story is read.", whenWrong: "Yes — demo early. Most readers skim; reward them with a working link before they bounce." },
        { prompt: "You should include long code blocks in the blog post so readers don't have to leave for GitHub.", answer: false, whenRight: "Right — no. Long code blocks kill flow. 10-line snippets max; link to the repo for full files.", whenWrong: "Keep blocks short. Long code in posts disrupts reading. Link to GitHub for the full thing." },
        { prompt: "An honest section about what you'd do differently makes the post more credible, not weaker.", answer: true, whenRight: "Right — owning limits builds trust. 'Everything was perfect' reads as marketing.", whenWrong: "Yes — honesty hardens credibility. Polished without weaknesses reads as sales pitch." }
      ]),
      E("Your turn — blog post","[WRITE] 1. Write the post in markdown locally (`docs/blog.md`).\n2. Follow the 10-part structure.\n3. Include the live Streamlit URL near the top.\n4. Embed the 3-way comparison chart + the components plot.\n5. Publish on dev.to.\n6. Paste the published URL into the README.")
    ]),
    D(5,"Record a demo video","90-second walkthrough of the live dashboard.",[
      L("The video that earns interviews",
"## What it is\n" +
"A 60-90 second screen recording of the live dashboard. No editing, no music, no intro — just a clear walkthrough of what the project does. Posted unlisted to YouTube. Linked from the README and the blog post.\n\n" +
"## Why this is high-leverage\n" +
"Most portfolio projects have screenshots. A working video earns more attention because (1) it proves the link works, (2) recruiters can watch on the train, (3) you can speak to nuance the static post can't.\n\n" +
"## The script (literally read this)\n" +
"```text\n" +
"[0:00-0:10]  'This is Energy Forecast, a 7-day demand forecaster for AEP\n" +
"              electricity built on 15 years of public hourly data.'\n" +
"[0:10-0:30]  Show the slider. Drag from 7 to 30 days. Point at the forecast\n" +
"              line, the shaded interval. 'Prophet model. 95% interval.'\n" +
"[0:30-0:55]  Scroll to the components plot. 'You can see the long-term trend,\n" +
"              the weekly cycle — weekdays higher than weekends because of\n" +
"              industrial load — and the holiday effects. Christmas drops\n" +
"              demand by about 2300 MW, which the model learned from data.'\n" +
"[0:55-1:15]  Switch to the dev.to post. 'Full write-up here. Compared three\n" +
"              models — Prophet won by 13% on MAE.'\n" +
"[1:15-1:30]  Switch to the GitHub repo. 'Code, models, MLflow runs, all here.'\n" +
"```\n\n" +
"## Tools\n" +
"- Loom (free tier, 5-min cap), OBS Studio (free, unlimited), or Mac's QuickTime/Screen Recording.\n" +
"- Mic: built-in laptop mic is fine for unlisted YouTube. Don't overthink audio.\n" +
"\n" +
"## One take, then maybe one more\n" +
"Don't try to make it perfect. Stumble through the script once; if you're embarrassed, do it once more. Three takes max. The video is a tool, not a film."
      ),
      S([
        { prompt: "A 90-second demo video is more effective than a 6-minute one for a portfolio.", answer: true, whenRight: "Right — 90 seconds gets watched; 6 minutes gets bounced. Front-load the story.", whenWrong: "Yes — short is watched. Recruiters skim. Cut everything past 90 seconds." },
        { prompt: "You should script the video word-for-word before recording.", answer: true, whenRight: "Right — a short script keeps the take tight and prevents rambling. Read it on the second take.", whenWrong: "Yes — script first. Unscripted demos meander. A 10-line script is the difference between watchable and boring." },
        { prompt: "Posting the video as Unlisted on YouTube is fine — Public adds little.", answer: true, whenRight: "Right — unlisted = anyone with the link sees it; doesn't surface in search to be ranked against polished channels.", whenWrong: "Yes — unlisted is enough. Public competes against millions; unlisted serves your one purpose (recruiter link)." }
      ]),
      E("Your turn — record","[PRODUCE] 1. Write a 10-line script (use the template above).\n2. Open the live dashboard.\n3. Record 60-90 seconds (Loom / OBS / QuickTime).\n4. Upload to YouTube Unlisted. Get the URL.\n5. Embed the video in the dev.to post and link it from the README.")
    ]),
    D(6,"Get 3 outside readers","Three real humans confused = three real edits.",[
      L("The reader review process",
"## What it is\n" +
"Send the blog post URL (NOT the dashboard, NOT the repo — just the post) to **three** people who are NOT data scientists. Ask one question: 'Where did you get lost?'\n\n" +
"## Why three\n" +
"- One reader's confusion could be them. Three readers converging on the same spot is signal.\n" +
"- Three is also small enough to actually get back from people in a day.\n" +
"- More than three is diminishing returns + analysis-paralysis.\n\n" +
"## Who counts as 'not a data scientist'\n" +
"Friends, family, coworkers from other functions, friends-from-bootcamp who do something else. The goal is **non-expert intelligent readers** — people who can follow a clear explanation but won't pretend to understand jargon you didn't define.\n\n" +
"## How to ask\n" +
"```text\n" +
"Subject: 90 seconds — where did you get lost?\n" +
"Body:\n" +
"  I wrote up a project: <link>. \n" +
"  Could you read it (~5 min) and tell me the FIRST place\n" +
"  you got lost or bored? That's the most useful thing I\n" +
"  can hear right now. No need to read past that point.\n" +
"  Thanks!\n" +
"```\n\n" +
"## The pattern to look for\n" +
"- **All three got lost at the same paragraph** → priority #1 edit. Rewrite that section.\n" +
"- **All three got lost at different paragraphs** → the post is roughly clear; minor edits.\n" +
"- **All three say 'it was fine' but you can tell they're being polite** → ask a more pointed question: 'What was the main point?' If they can't answer, the post buried it.\n\n" +
"## Don't argue\n" +
"If a reader was confused, the post is unclear at that spot — full stop. Their experience IS the data. The temptation to explain 'but I meant...' is wrong; the fix is to edit the post so the next reader doesn't have the same problem.\n\n" +
"## What 'address the feedback' looks like\n" +
"On the spot in the post:\n" +
"- Add a sentence of context\n" +
"- Define a term inline\n" +
"- Break a long paragraph in half\n" +
"- Replace jargon with the plain word"
      ),
      S([
        { prompt: "If all three readers get lost at the same paragraph, you have your highest-priority edit.", answer: true, whenRight: "Right — converging confusion is the strongest signal. Rewrite that paragraph first.", whenWrong: "Yes — convergence = priority. Three independent readers stuck at the same line is the cleanest possible bug report." },
        { prompt: "If a reader is confused, you should respond by explaining what you meant — they'll understand after that.", answer: false, whenRight: "Right — no. The post is what the reader sees; conversation doesn't scale. Edit the post.", whenWrong: "Don't defend. Edit. The reader's confusion is data; the temptation to argue is the bug." },
        { prompt: "Sending to three non-data-scientist readers is more useful than sending to three data scientists.", answer: true, whenRight: "Right — non-experts will tell you where jargon kicks in. Experts read past your weaknesses out of professional courtesy.", whenWrong: "Yes — non-experts are tougher reviewers. Experts smooth over gaps they'd want to fill themselves." }
      ]),
      E("Your turn — three readers","[WRITE] 1. Pick three non-DS readers.\n2. Send each the post URL + the 'where did you get lost' email.\n3. Wait for replies.\n4. Note their confusion points in `docs/reader_feedback.md`.\n5. Edit the post to address whatever 2+ readers converged on.\n6. Update dev.to with the edits.")
    ]),
    D(7,"Tag v1.0 + retro","Ship the project, extract the lessons.",[
      L("Shipping v1.0",
"## The retro\n" +
"At the bottom of the repo's README, add a section:\n" +
"```text\n" +
"## Retro (W21-W27, Energy Forecast)\n" +
"\n" +
"What worked\n" +
"- Persistence baseline first (W21) — gave every later week a clear bar.\n" +
"- Prophet's components plot - actually made the model defensible to a non-DS reader.\n" +
"- MLflow tracking - made the cps sweep (W25) trivial to compare.\n" +
"- Reader review on the blog - rewrote the LSTM section after 2/3 confusion.\n" +
"\n" +
"What didn't\n" +
"- Heatwave under-prediction stayed unsolved. Would need recent training data + \n" +
"  possibly an exogenous temperature regressor.\n" +
"- LSTM intervals — punted on those entirely. Bayesian NN was out of scope.\n" +
"- Real-time drift alerts (W25) print locally; never wired up to a real Slack.\n" +
"\n" +
"What I'd do differently\n" +
"- Add a temperature regressor in week 22 (when fitting ARIMA), not week 27.\n" +
"- Build the Streamlit demo earlier (week 25) so feedback shaped the model choice.\n" +
"- Push the blog post to two outside readers, not three — diminishing returns past two.\n" +
"\n" +
"What I learned\n" +
"- The shipping ritual matters as much as the model. Half the value of W27 was reader feedback,\n" +
"  not new code.\n" +
"- Forecast intervals are the deliverable most non-DS readers actually care about.\n" +
"  Point forecasts feel wrong; intervals feel honest.\n" +
"- MLflow + model registry pays off the first time you do a small sweep. Before that, it's overhead.\n" +
"```\n\n" +
"## Tag v1.0\n" +
"```bash\n" +
"git add docs/blog.md README.md app/ docs/reader_feedback.md\n" +
"git commit -m \"Energy Forecast v1.0: Prophet in production, dashboard live, blog published\"\n" +
"git tag v1.0\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## What you've actually shipped\n" +
"7 weeks. 4 models trained and honestly compared. A live dashboard. A blog post with three rounds of reader review. A demo video. A registered model in MLflow. A monitored production pipeline.\n\n" +
"That's not a tutorial project. That's a finished data-science project at the level a junior DS would ship in their first job. Which is exactly what the capstone (W28-W30) gives you a chance to do once more, on a topic you pick."
      ),
      S([
        { prompt: "A retro is more valuable when it includes things that didn't work, not just wins.", answer: true, whenRight: "Right — wins teach less than failures. The 'what I'd do differently' section is what compounds.", whenWrong: "Yes — failures + alternatives drive the lesson. A wins-only retro doesn't earn its name." },
        { prompt: "Tagging v1.0 marks the project as finished and the lessons as locked in.", answer: true, whenRight: "Right — the tag is the milestone. The lessons in the retro carry to the capstone next.", whenWrong: "Yes — v1.0 = finished. The retro extracts what was learned; the capstone gets to apply it." },
        { prompt: "The capstone (W28+) is a fresh project that can ignore the lessons from this one.", answer: false, whenRight: "Right — no. The whole point of the retro is to make the capstone go better. Carry the lessons forward.", whenWrong: "The retro feeds the capstone. Lessons compound. Re-reading the retro on W28 Day 1 is non-optional." }
      ]),
      E("Your turn — tag v1.0","[PRODUCE] 1. Write the retro in the README (four sections).\n2. Commit + tag:\n`git add . && git commit -m 'Energy Forecast v1.0'`\n`git tag v1.0 && git push --tags`\n3. Verify everything:\n[x] Live demo URL works in incognito\n[x] Blog post published\n[x] Video uploaded + linked\n[x] Three readers gave feedback\n[x] Retro written\n[x] v1.0 tag pushed\n4. Take the rest of the day off. You earned it.")
    ])
  ]
};

/* ════ WEEK 28 — Capstone v0.1: Pick + scope ════ */
const W28 = {
  number: 28, title: "Capstone v0.1: Pick + scope",
  phase: "Capstone", commitment_hours: "10-15",
  context: ds.weeks[27].context,
  concept_check: [
    { q: "What's the right way to pick a capstone topic?",
      choices: ["Pick the trendiest model","Pick a question you genuinely want answered + a dataset that exists + a 3-week scope you can finish",
        "Pick the easiest","Pick whatever your friend is doing"],
      correct: 1, explain: "A finished mediocre project beats a half-built impressive one every time. The pick is: a question you'd care about even if no one was watching, data that actually exists and is downloadable, and scope that fits the 3 weeks ahead. Anything that fails one of the three is a wrong pick." },
    { q: "A 'tiny prototype' on Day 5 is for what?",
      choices: ["Showing off","De-risking the project — confirming your data + question + approach are viable BEFORE committing two weeks to them",
        "Filling time","Practice"],
      correct: 1, explain: "The prototype's job is to falsify the project. If you can't even load the data, the choice is wrong. If a quick baseline already gets 95% on your target, the question is too easy and you'll have nothing to write about. Day 5 is when you decide whether to commit or pivot." },
    { q: "Why is 'I'll do EVERYTHING — model + dashboard + API + paper + demo' the wrong scope?",
      choices: ["It's not","Trying to do all of them at adequate quality in 3 weeks means doing none of them at portfolio quality",
        "Some are forbidden","You need permission"],
      correct: 1, explain: "The shipping-ritual lesson from W27: half the value is in the polish. A model + a blog post + a Streamlit demo + a retro at full quality is plenty for a capstone. Add an API only if it genuinely adds to your story. 'Everything at 60%' is invisible to a recruiter; 'half of those at 95%' is hireable." }
  ],
  days: [
    D(1,"Capstone options","Pick the question, not the model.",[
      L("How to pick a capstone topic",
"## What it is\n" +
"The capstone is your fourth shipped project. Unlike the previous three (TaxiPulse, Reddit Sentiment, Energy Forecast), **you pick everything**: domain, question, dataset, models, deliverable shape. That freedom is also the danger.\n\n" +
"## Three filters every candidate must pass\n\n" +
"### 1. A question you actually care about\n" +
"You're going to stare at this for 3 weeks. If the question is 'what gets a recruiter excited' rather than 'what would I want to know,' you'll burn out in the data-cleaning phase. Pick something that you'd still want answered if no one ever saw your work.\n\n" +
"### 2. A dataset that exists, is downloadable, and is workable\n" +
"- **Public** is easiest: Kaggle, BigQuery public datasets, government open-data portals, Hugging Face datasets.\n" +
"- **Scrapeable** is allowed but adds a week.\n" +
"- **'I'll work for this company and use their data'** is not allowed unless you have explicit, written permission — it's the legal version of committing AWS keys.\n" +
"\n" +
"### 3. Scope you can finish in 3 weeks\n" +
"Look at how long Energy Forecast took (7 weeks for 4 models + dashboard + blog). Your capstone is 3 weeks for analysis + model + demo + blog + retro. If your idea has 'I'll train 5 models' or 'I'll build a full microservice,' you've over-scoped. Cut it in half.\n\n" +
"## Three example capstones that work\n" +
"- **Predicting Marathon finishing times from training data.** Question: do high-volume runners actually finish faster than high-intensity runners? Data: Strava-style activity exports from your local running club or Kaggle's running datasets.\n" +
"- **Classifying NPR podcast episodes by topic from transcripts.** Question: how distinct are 'tech' and 'science' episode topics, really? Data: NPR's public transcript API.\n" +
"- **Forecasting SF housing prices by neighborhood.** Question: which neighborhoods diverged from the city trend during 2020-2022? Data: SF open-data portal + Zillow research.\n\n" +
"Notice what they share: a specific question, public data, model is one ingredient not the centerpiece.\n\n" +
"## Bad capstone shapes\n" +
"- 'I will build an end-to-end production NLP system' — no question, just architecture.\n" +
"- 'I will use a transformer to do X' — model-first, no question.\n" +
"- 'I will study my own personal data' — usually too small, no story for a stranger."
      ),
      S([
        { prompt: "A capstone question you'd want answered EVEN IF NO ONE SAW YOUR WORK is a better pick than one designed to impress recruiters.", answer: true, whenRight: "Right — intrinsic interest survives the boring data-cleaning weeks. Recruiter-bait projects don't.", whenWrong: "Yes — the boring weeks kill projects you don't personally care about. Intrinsic interest is your fuel." },
        { prompt: "Using your employer's private data without explicit permission is fine for a capstone.", answer: false, whenRight: "Right — never. It's the legal-and-firing version of committing AWS keys. Public data only unless you have written permission.", whenWrong: "Never private data without permission. Capstones go on public repos. Get permission or use public data." },
        { prompt: "A capstone with a clear question + public data + 3-week scope is more likely to ship than one with novel architecture and 6 weeks of work.", answer: true, whenRight: "Right — shipped > impressive. A finished readable project at v1.0 beats an unfinished ambitious one every time.", whenWrong: "Yes — finished beats novel. Reviewers see one v1.0 + retro; they don't see your unfinished work-in-progress." }
      ]),
      E("Your turn — list options","[WRITE] In `capstone/IDEAS.md`:\n1. Write down 5 candidate questions you'd want answered.\n2. For each, in 1 line: what dataset would you use? How would you measure success?\n3. Cross off any that fail the three filters (interest / data exists / 3-week scope).\n4. You should have 2-3 left. Tomorrow you pick one and write the spec.")
    ]),
    D(2,"Write the spec","One-page document. Commit before you build.",[
      L("The capstone spec",
"## What it is\n" +
"A one-page document that defines your capstone before you write a line of code. Commits you to a specific shape; protects future-you from scope creep.\n\n" +
"## The template\n" +
"```markdown\n" +
"# Capstone — <Project Name>\n" +
"\n" +
"## The question\n" +
"<One sentence. Specific enough that a yes/no answer at the end is possible.>\n" +
"\n" +
"## Why it matters (1 paragraph)\n" +
"<Who cares about the answer? What would they do differently if they knew?>\n" +
"\n" +
"## The dataset\n" +
"- Source: <URL>\n" +
"- Size: <rows / GB>\n" +
"- Coverage: <date range / geography>\n" +
"- License: <verified — capstone results are publishable>\n" +
"\n" +
"## Success looks like\n" +
"- Headline finding: <a quantified claim of the form 'X is true with magnitude Y'>\n" +
"- Demo: <a live thing a reader can interact with>\n" +
"- Blog: <a 1500-word post explaining the answer>\n" +
"\n" +
"## Out of scope\n" +
"- <List of things you WILL NOT do. Cuts that protect the timeline.>\n" +
"- e.g.: 'no model deployment to AWS; Streamlit Cloud only'\n" +
"- e.g.: 'no comparison of 5 architectures; baseline + 1 main model'\n" +
"- e.g.: 'no real-time pipeline; offline batch is enough'\n" +
"\n" +
"## Plan (3 weeks)\n" +
"- W28: prototype, scope adjustment\n" +
"- W29: build, baseline, evaluate\n" +
"- W30: polish, demo, blog, retro, v1.0 tag\n" +
"\n" +
"## Risks + mitigations\n" +
"- <Risk 1>: <what you'll do if it fires>\n" +
"- e.g.: 'Data is too sparse for neural net': fall back to gradient boosting + a regularised linear baseline\n" +
"- e.g.: 'Scraping the data takes 5 days': switch to a smaller pre-packaged Kaggle version\n" +
"```\n\n" +
"## Why this commits you\n" +
"Once it's committed, scope creep becomes obvious. 'Oh, what if I also added X' meets the 'Out of scope' section and gets cut. The spec is the contract with yourself.\n\n" +
"## Sign the spec\n" +
"Commit it as `capstone/SPEC.md` to git on Day 2 of W28. Don't let yourself open the model code until the spec exists. This is the same discipline that makes engineers write design docs before kicking off projects."
      ),
      S([
        { prompt: "A capstone spec is most useful when it includes an explicit 'Out of scope' section.", answer: true, whenRight: "Right — saying NO in writing protects you from scope creep later. 'I'll just also add X' meets 'Out of scope' and dies.", whenWrong: "Yes — explicit NO is more powerful than implicit YES. The cuts are what keep the timeline." },
        { prompt: "Spec first, then code. Writing the spec after starting work is fine — it documents what you did.", answer: false, whenRight: "Right — no. Specs are commitments before; documents after. Building first risks rationalizing whatever you happened to do.", whenWrong: "Spec first. Otherwise it's a postmortem, not a plan. The commitment is the value." },
        { prompt: "A specific question ('did X correlate with Y by region in 2018-2022?') is more useful in a spec than a vague theme ('I'll study housing').", answer: true, whenRight: "Right — specific questions force a measurable answer; vague themes can't be finished.", whenWrong: "Yes — specificity = ship-ability. Vague themes never reach a clear end-state." }
      ]),
      E("Your turn — write the spec","[WRITE] 1. Open `capstone/SPEC.md`.\n2. Fill in EVERY section of the template above. Don't skip 'Out of scope' or 'Risks.'\n3. Commit and tag: `git add capstone/SPEC.md && git commit -m 'capstone spec' && git tag capstone-spec && git push --tags`.\n4. From now on, every change to the project that doesn't match the spec is a deliberate, documented change.")
    ]),
    D(3,"Find the dataset","Verify it actually exists, downloads, and works.",[
      L("Real datasets, real verification",
"## What it is\n" +
"It's astonishingly common for a capstone to die on Day 3 of W29 because the dataset turned out to be: behind a paywall, deprecated, wrong format, license-restricted, or just empty. Today you de-risk by actually downloading + opening the data.\n\n" +
"## The verification checklist\n" +
"- [ ] **Download link works without an account** (or get an account today).\n" +
"- [ ] **File downloads in < 30 minutes** on your connection (or plan for it).\n" +
"- [ ] **File opens in pandas / your tool of choice** without arcane errors.\n" +
"- [ ] **The columns you need are actually in there** — don't trust the docs blindly.\n" +
"- [ ] **The date range / geography / categories you need are covered.**\n" +
"- [ ] **License is permissive** for a public portfolio repo. (Most public open-data is fine; doublecheck Kaggle datasets — some are explicitly non-redistributable.)\n" +
"- [ ] **You can answer one tiny version of your question** with it. Even 5 rows worth.\n\n" +
"## Sources, ranked\n" +
"1. **Kaggle Datasets** — best UX, clear licenses, often pre-cleaned.\n" +
"2. **Hugging Face Datasets** — great for NLP, easy loader.\n" +
"3. **BigQuery Public Datasets** — best for serious scale (W26 taught you this).\n" +
"4. **Government open data portals** — `data.gov`, `data.gov.uk`, city portals. Often messy, always free.\n" +
"5. **Direct from research papers** — most ML papers publish a github with data links. Quality varies.\n" +
"\n" +
"## Storage discipline\n" +
"Once you've downloaded the data, **put it in S3** (if it's big) or in a `data/` folder in your repo (if it's small and license-compatible). Either way, your code should read from a single path; never have multiple copies floating around.\n\n" +
"## If verification fails\n" +
"Either pick another dataset that meets the criteria, or pivot the question to match what's actually available. Both are honorable; both protect the timeline. What's NOT honorable is plowing ahead with 'I'll figure it out later.'"
      ),
      S([
        { prompt: "Downloading the dataset and actually opening it on Day 3 of W28 is paranoid.", answer: false, whenRight: "Right — no. It's the cheapest possible insurance. A 30-minute verification today prevents a W29 disaster.", whenWrong: "Always verify early. Half of dead capstones die because the data wasn't what the docs claimed." },
        { prompt: "License compatibility matters for a public portfolio repo.", answer: true, whenRight: "Right — non-redistributable datasets put you in legal grey zone if you commit them. Check before downloading.", whenWrong: "Yes — license is the boring detail that bites you later. Verify on Day 3, not on W30." },
        { prompt: "If the dataset doesn't quite match your question, you should plow ahead and adjust later.", answer: false, whenRight: "Right — no. Pivot the question or change the dataset NOW. Mismatches compound; they don't resolve.", whenWrong: "Pivot or switch. Mismatched datasets produce findings that don't answer the question you asked." }
      ]),
      E("Your turn — verify","[CODE] 1. Download the dataset you wrote into SPEC.md.\n2. Open in pandas. Print `df.head()` and `df.shape`.\n3. Confirm every column the spec relies on is actually there.\n4. Markdown in `capstone/data_check.md`: 'Verified on YYYY-MM-DD. <Size>. <Columns confirmed>. License: <details>.'\n5. If verification fails, edit SPEC.md TODAY (don't punt).")
    ]),
    D(4,"Plan the 3 weeks","A day-by-day timeline. Then halve it.",[
      L("The 3-week plan",
"## What it is\n" +
"A concrete day-by-day plan covering W28 finish through W30 ship. Written in `capstone/PLAN.md`. Revisited every Sunday night.\n\n" +
"## The template\n" +
"```markdown\n" +
"# Capstone plan\n" +
"\n" +
"## W28 (this week)\n" +
"- D1-2: scope + spec (done)\n" +
"- D3: data verification (done)\n" +
"- D4: this plan\n" +
"- D5: tiny prototype — confirm the question is answerable\n" +
"- D6: adjust scope based on D5 findings\n" +
"- D7: v0.1 tag\n" +
"\n" +
"## W29 (build)\n" +
"- D1: clean the data; document every cleaning decision\n" +
"- D2: feature engineering — features the domain says matter\n" +
"- D3: baseline model. Persistence / always-predict-mean / simple regression.\n" +
"- D4: main model. ONE main model. Document why this one.\n" +
"- D5: iterate. Improve based on residuals / errors. NOT 'try a new model.'\n" +
"- D6: evaluate honestly. Held-out test set. MAE / accuracy / whatever metric the spec says.\n" +
"- D7: v0.2 tag\n" +
"\n" +
"## W30 (polish + ship)\n" +
"- D1: streamlit demo\n" +
"- D2: deploy demo\n" +
"- D3: blog post\n" +
"- D4: demo video\n" +
"- D5: 3 outside readers\n" +
"- D6: edits from feedback\n" +
"- D7: retro + v1.0 tag\n" +
"```\n\n" +
"## Halve the plan\n" +
"Look at the plan. Underline every day that has more than ONE concrete thing on it. Each underline is a day you've over-scoped. Halve it. The list above is already barely possible; if your version has more, cut.\n\n" +
"## Sunday night ritual\n" +
"Every Sunday during the capstone, open PLAN.md and:\n" +
"- Mark what got done with `[x]`.\n" +
"- Move anything that didn't happen to the next week — or DELETE IT.\n" +
"- Adjust the plan if reality diverged.\n\n" +
"## Why this matters\n" +
"The plan is the only thing standing between 'finished v1.0' and 'still iterating in week 5.' Most capstone failures are scope failures, not skill failures."
      ),
      S([
        { prompt: "Halving the plan after writing it is a useful discipline, not a sign of low ambition.", answer: true, whenRight: "Right — your first plan is always over-scoped. Halving once gets you closer to what actually ships.", whenWrong: "Yes — first plan is always over-scoped. Halve and ship. Real engineers under-promise and over-deliver." },
        { prompt: "If a day in the plan has 4 concrete tasks, you should leave it alone — you'll just work harder.", answer: false, whenRight: "Right — no. 4 tasks/day = 0 finished tasks. Cut to one. Working harder is not a plan.", whenWrong: "One concrete task per day. More than that means you've underestimated something. Cut, don't grind." },
        { prompt: "The plan should be revisited every Sunday during the capstone.", answer: true, whenRight: "Right — weekly check-in catches drift while it's still small. Daily would be overkill; monthly would be too late.", whenWrong: "Yes — Sunday ritual. The plan only works if you use it." }
      ]),
      E("Your turn — write the plan","[WRITE] 1. Write `capstone/PLAN.md` using the template.\n2. Halve every overloaded day.\n3. Commit it.\n4. Set a recurring Sunday-night calendar event: 'capstone Sunday — update PLAN.md'.")
    ]),
    D(5,"Tiny prototype","Smallest possible end-to-end. Prove the question is answerable.",[
      L("The de-risking prototype",
"## What it is\n" +
"In ONE day, build the simplest possible thing that answers your capstone question — even with bad accuracy, even on a tiny sample. The point is to prove every step works before you commit the next 2 weeks.\n\n" +
"## The prototype shape\n" +
"```text\n" +
"1. Load 1000 rows of the data.\n" +
"2. Compute the simplest possible answer to your question.\n" +
"   - Classification: predict majority class. Compute accuracy.\n" +
"   - Regression: predict mean. Compute MAE.\n" +
"   - Time series: predict yesterday. Compute MAE.\n" +
"   - Clustering: KMeans k=3. Look at one cluster.\n" +
"3. Print the result.\n" +
"```\n\n" +
"## What you're checking\n" +
"- [ ] The data loads (no surprise format issues).\n" +
"- [ ] The columns you need are populated (no surprise missing-data).\n" +
"- [ ] The trivial baseline produces a number (not an error).\n" +
"- [ ] The number is not already at 99% — if it is, the question is too easy.\n" +
"- [ ] The number is not chance — if it is (50% on binary classification), the signal might not be there at all.\n\n" +
"## The three outcomes\n" +
"- **Trivial baseline gets 60-80% accuracy / reasonable MAE** → you have signal. Good prospect. Commit.\n" +
"- **Trivial baseline gets 95%+** → question is too easy. Reframe to something harder. (E.g.: instead of 'classify cats vs cars,' do 'classify dog breeds' — same data, harder question.)\n" +
"- **Trivial baseline gets chance** → signal isn't there. Either the question doesn't match the data, or there's something wrong with how you're loading. Investigate today.\n\n" +
"## Why this matters\n" +
"The cost of pivoting on D5 of W28 is ~1 day of work. The cost of pivoting on D5 of W29 is ~7 days of work. Today's prototype is cheap insurance."
      ),
      S([
        { prompt: "A 'too easy' baseline (95%+ accuracy on Day 1) means you should pick a harder question, not celebrate.", answer: true, whenRight: "Right — a too-easy baseline gives you nothing to write about. Reframe to something harder.", whenWrong: "Yes — too easy = no story. Reframe the question to where the trivial baseline doesn't already dominate." },
        { prompt: "If the baseline gets chance accuracy, you should still proceed — the main model will fix it.", answer: false, whenRight: "Right — no. Chance accuracy usually means the signal isn't there or you're loading data wrong. Don't grind; investigate.", whenWrong: "Chance accuracy is a red flag. Investigate the data + the question; don't trust a fancier model to bail you out." },
        { prompt: "A prototype on Day 5 is faster than reading docs for 5 days.", answer: true, whenRight: "Right — code reveals what docs hide. Build the cheapest possible thing today.", whenWrong: "Yes — prototypes find bugs docs miss. One day of working code teaches more than five of reading." }
      ]),
      E("Your turn — prototype","[CODE] In `capstone/prototype.ipynb`:\n1. Load 1000 rows.\n2. Build the dumbest possible model that answers your question (predict-the-mean, predict-the-majority, persistence, etc.).\n3. Compute the headline metric (accuracy, MAE, whatever the spec says).\n4. Markdown: which of the three outcomes did you get?\n5. If the question is too easy, edit SPEC.md TODAY to reframe.")
    ]),
    D(6,"Adjust scope","One day to react to what the prototype taught you.",[
      L("Re-aligning spec, plan, and prototype",
"## What it is\n" +
"Yesterday's prototype either confirmed the spec, suggested a reframe, or surfaced a blocker. Today you respond to whichever happened — adjust the spec + plan to match the new reality.\n\n" +
"## The three responses\n" +
"\n" +
"### Confirmed — prototype gave a sensible baseline\n" +
"Update SPEC.md with the actual baseline number you got. Update the 'Success looks like' section if needed (e.g. 'beat the baseline of MAE=120'). PLAN.md stays as-is. Move to v0.1 tag tomorrow.\n\n" +
"### Reframe — question was too easy or too hard\n" +
"Edit SPEC.md's 'The question' section. The new question must:\n" +
"- Use the same dataset (you've verified it).\n" +
"- Be answerable in the remaining timeline.\n" +
"- Still be something you actually care about.\n" +
"\n" +
"Update PLAN.md to point at the new question. Update the prototype quickly to confirm the new question shows signal.\n\n" +
"### Blocker — data missing columns, license issue, format problem\n" +
"This is the painful one. Either:\n" +
"- **Switch dataset** to something with the same shape but cleaner. Re-do Day 3 verification on the new one.\n" +
"- **Restructure question** to match what the data actually contains.\n" +
"- **Abandon the topic** and pick from your IDEAS.md backlog. Faster than fighting the data for 2 more weeks.\n\n" +
"## Why this day exists\n" +
"Most projects skip 'adjust scope' and pay for it in week 2 or 3 with a half-finished, awkward result. Spending one explicit day on it is what professionals do."
      ),
      S([
        { prompt: "Editing the SPEC.md after the prototype is a sign of good engineering, not flip-flopping.", answer: true, whenRight: "Right — specs respond to evidence. Yesterday's prototype IS evidence.", whenWrong: "Yes — specs evolve as you learn. The first version is a hypothesis; the prototype tests it." },
        { prompt: "If the data is missing columns the spec relies on, you should plow ahead and figure it out in week 2.", answer: false, whenRight: "Right — no. Switch dataset or restructure question NOW. Week-2 panic-fixes are how capstones die.", whenWrong: "Pivot now, not later. A missing column doesn't fix itself; it forces a worse compromise next week." },
        { prompt: "Abandoning the topic entirely on Day 6 of W28 is allowed if the prototype revealed a fundamental mismatch.", answer: true, whenRight: "Right — picking from your IDEAS.md backlog beats fighting a broken topic for 14 days. Honorable.", whenWrong: "Yes — pivoting is allowed if the prototype proved the topic broken. Sunk cost is not a strategy." }
      ]),
      E("Your turn — scope check","[WRITE] 1. Read prototype results from Day 5.\n2. Decide: confirmed / reframe / blocker.\n3. Edit SPEC.md accordingly.\n4. Update PLAN.md if needed.\n5. Commit with message 'capstone scope adjusted after prototype' so future you sees the moment of decision.")
    ]),
    D(7,"Tag v0.1","Lock in the scope. Next week is build week.",[
      L("Shipping v0.1",
"## What it is\n" +
"v0.1 of the capstone is just paperwork — the spec, the plan, the prototype, the data verification. Zero modeling yet. But it's all the things that make the next two weeks possible.\n\n" +
"## What you tag\n" +
"```bash\n" +
"git add capstone/SPEC.md capstone/PLAN.md capstone/IDEAS.md \\\n" +
"        capstone/data_check.md capstone/prototype.ipynb\n" +
"git commit -m \"Capstone v0.1: spec, data verified, prototype shows signal\"\n" +
"git tag capstone-v0.1\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## Why this matters as a tag\n" +
"Two reasons:\n" +
"1. It's a contract with yourself. You can't scope-creep without acknowledging it (the diff against capstone-v0.1 will tell on you).\n" +
"2. The tag is a recoverable point. If next week's work explodes, you can `git checkout capstone-v0.1` and try a different direction without losing the spec and the dataset verification.\n\n" +
"## What you've actually finished\n" +
"- A specific question + a measurable success criterion\n" +
"- A verified dataset with a known license\n" +
"- A 3-week plan you halved into actually-possible chunks\n" +
"- A prototype that showed the question is answerable\n" +
"- Scope you've adjusted based on the prototype\n" +
"\n" +
"This is week 1 of a real DS project. Most learners skip all of this and start training models on day 1. Doing it deliberately is the difference between 'finished v1.0' and 'still iterating.'\n\n" +
"## What's next\n" +
"Week 29 — Build. One main model. Proper baseline. Honest evaluation. By Sunday W29 you have v0.2 with a working model."
      ),
      S([
        { prompt: "Tagging v0.1 with zero modeling code is fine — the spec and prototype are the deliverable.", answer: true, whenRight: "Right — paperwork-as-deliverable. Real engineering teams ship a design doc + scoping milestone exactly like this.", whenWrong: "Yes — process is part of the work. v0.1 = scope locked. Modeling starts in v0.2." },
        { prompt: "Skipping the spec + plan + prototype and going straight to model training is more efficient.", answer: false, whenRight: "Right — no. It feels faster on day 1 and costs you week 3. Front-load the scoping.", whenWrong: "Skipping scoping feels fast but costs you later. Half of dead projects skipped this exact phase." },
        { prompt: "The tag lets you checkout the scoped-but-not-built state if next week's work goes sideways.", answer: true, whenRight: "Right — recovery point. `git checkout capstone-v0.1` and try a different direction without losing the scope.", whenWrong: "Yes — tags = recovery points. If W29 derails, v0.1 is your foundation to try again from." }
      ]),
      E("Your turn — tag v0.1","[PRODUCE] 1. Verify all of: SPEC.md, PLAN.md, IDEAS.md, data_check.md, prototype.ipynb exist and are committed.\n2. `git commit` if anything's outstanding.\n3. `git tag capstone-v0.1 && git push --tags`.\n\nPASS:\n[x] SPEC.md complete (question, dataset, success criteria, out-of-scope, plan, risks)\n[x] Dataset downloaded + verified + licensed\n[x] PLAN.md exists and is halved\n[x] prototype.ipynb shows the question is answerable\n[x] capstone-v0.1 tag pushed")
    ])
  ]
};

/* ════ WEEK 29 — Capstone v0.2: Build ════ */
const W29 = {
  number: 29, title: "Capstone v0.2: Build",
  phase: "Capstone", commitment_hours: "15-20",
  context: ds.weeks[28].context,
  concept_check: [
    { q: "What does 'build' specifically mean during the capstone build week?",
      choices: ["Try every model sklearn has","Clean the data, engineer the features your domain knowledge demands, train ONE main model with a baseline, evaluate honestly",
        "Whatever feels productive","Train as many models as possible"],
      correct: 1, explain: "'Build' means one main model trained well, on cleanly engineered features, against a documented baseline, with honest evaluation. NOT a model zoo. The blog post needs one clear winner with reasoning, not 'I tried 8 models and here's a table' which reads as scattershot." },
    { q: "Why does the baseline get its own day in the build week?",
      choices: ["Filler","The baseline determines whether your main model is actually adding value — and you need an honest number to compare against",
        "Tradition","Because baselines are slow"],
      correct: 1, explain: "Every shipped DS project lives or dies by 'did your model beat the baseline.' Without a baseline you've measured against, you can't claim improvement. Spending a full day on a strong baseline is the only way to know if your main model actually earned its complexity." },
    { q: "What does 'iterate' on Day 5 mean if it doesn't mean 'try a new model'?",
      choices: ["Train longer","Look at where your model fails (residuals, confusion matrix), and improve the FEATURES or the DATA to fix those specific failures",
        "Adjust hyperparameters randomly","Make the model bigger"],
      correct: 1, explain: "On a tight timeline, iterating on features beats iterating on models. Look at the rows your model got wrong; ask 'what would a human know that the model doesn't?'; encode that as a feature; refit. That's the 80/20 — model architecture matters far less than feature quality on tabular DS problems." }
  ],
  days: [
    D(1,"Full data collection","From sample to the whole thing.",[
      L("Bringing in the full dataset",
"## What it is\n" +
"In W28 you used 1000 rows for the prototype. Today you ingest the **whole dataset** — every row, every column you'll need, into a single canonical location your downstream notebooks all read from.\n\n" +
"## The pattern\n" +
"```python\n" +
"import pandas as pd\n\n" +
"# Read from the source (Kaggle download, S3, BigQuery, etc.)\n" +
"raw = pd.read_csv('data/raw/<your_file>.csv')\n" +
"print(raw.shape)        # (rows, cols)\n" +
"print(raw.dtypes)       # quick sanity\n" +
"print(raw.head())\n\n" +
"# Save as parquet — faster + smaller than CSV for subsequent reads\n" +
"raw.to_parquet('data/raw.parquet', index=False)\n" +
"```\n\n" +
"## Why parquet, not CSV\n" +
"- 5-10x smaller on disk\n" +
"- 10x faster to read\n" +
"- Preserves column types (no more 'CSV ate my dates')\n" +
"- Skippable by column on read (`columns=['x', 'y']`)\n\n" +
"From here, every notebook in the project reads from `data/raw.parquet`. One canonical source. No copies floating around.\n\n" +
"## If the data is too big to load\n" +
"- **BigQuery / Snowflake** — query a sample once, store as parquet locally.\n" +
"- **Streaming through Dask** — works but adds complexity. Avoid for the capstone unless you must.\n" +
"- **Sample down** — explicitly document the sample method in SPEC.md if you have to.\n\n" +
"## Document what's in the file\n" +
"Add `capstone/DATA_DICT.md` — a one-line description per column. Future-you (and any reviewer) will thank you. Five minutes today saves an hour next week."
      ),
      L("See it in code (with output)",
"## Canonical-source pattern\n" +
"```python\n" +
"import pandas as pd\n\n" +
"df = pd.read_parquet('data/raw.parquet')\n" +
"print(f'{len(df):,} rows · {len(df.columns)} columns')\n" +
"# 1,247,891 rows · 23 columns\n\n" +
"print(df.dtypes.value_counts())\n" +
"# float64    11\n" +
"# object      8\n" +
"# datetime    3\n" +
"# bool        1\n\n" +
"# Sanity: any all-null columns?\n" +
"null_pct = (df.isna().mean() * 100).round(1)\n" +
"print(null_pct[null_pct > 0].sort_values(ascending=False))\n" +
"# col_x    62.4  <-- mostly missing, consider dropping\n" +
"# col_y    18.2\n" +
"```"
      ),
      S([
        { prompt: "Saving the raw data as a parquet file once means every downstream notebook reads faster and gets the same types.", answer: true, whenRight: "Right — write once, read everywhere. Parquet is the default for any project beyond toy size.", whenWrong: "Yes — write the parquet on day 1, never deal with CSV type-coercion issues again." },
        { prompt: "Keeping multiple copies of the dataset around the project is fine — disk is cheap.", answer: false, whenRight: "Right — no. Multiple copies = drift. 'Which one did I update?' is a real, expensive bug. One canonical path.", whenWrong: "Drift is the real cost. Multiple copies eventually disagree; you can't trust the analysis." },
        { prompt: "Writing a one-line description per column in DATA_DICT.md is overkill for a learner project.", answer: false, whenRight: "Right — no. Five minutes today; an hour saved next week when you forget what 'col_q3' means.", whenWrong: "DATA_DICT.md is the cheapest documentation you'll ever write. Saves you next week, saves reviewers always." }
      ]),
      E("Your turn — ingest","[CODE] In `notebooks/01_ingest.ipynb`:\n1. Read the raw dataset (CSV / API / BigQuery — whatever source).\n2. Save as `data/raw.parquet`.\n3. Print shape, dtypes, null %.\n4. Create `capstone/DATA_DICT.md` with one line per column.\n5. Commit `data/raw.parquet` (or its sample if license disallows redistribution).")
    ]),
    D(2,"Clean — and document every decision","Cleaning IS the analysis.",[
      L("Cleaning decisions are findings",
"## What it is\n" +
"Every decision you make about the data — drop a column, impute a value, exclude a date range, recode a category — is a finding worth documenting. Cleaning isn't pre-work; it's analysis you happen to do early.\n\n" +
"## The pattern\n" +
"```python\n" +
"import pandas as pd\n" +
"df = pd.read_parquet('data/raw.parquet')\n\n" +
"# DECISION 1: drop rows where target is null (can't learn from them)\n" +
"before = len(df)\n" +
"df = df.dropna(subset=['target'])\n" +
"print(f'Dropped {before - len(df):,} rows with null target')\n\n" +
"# DECISION 2: drop col_x — 62% missing, no domain reason to impute\n" +
"df = df.drop(columns=['col_x'])\n\n" +
"# DECISION 3: clip price outliers above $10k (legitimate but skew the regression)\n" +
"#   Keep but flag — the model will see them; the plot won't.\n" +
"df['price_clipped'] = df['price'].clip(upper=10_000)\n\n" +
"df.to_parquet('data/clean.parquet', index=False)\n" +
"```\n\n" +
"## Document each decision in CLEANING.md\n" +
"```markdown\n" +
"# Cleaning decisions\n" +
"\n" +
"- Dropped 1,234 rows with null `target`. Reason: can't train on them.\n" +
"- Dropped column `col_x`. Reason: 62% missing, no domain meaning.\n" +
"- Clipped `price` above $10,000 into `price_clipped`. Reason: legitimate\n" +
"  outliers (luxury sales) skew the linear fit; capping preserves info\n" +
"  without distorting the trend.\n" +
"- Recoded `category` 'OTHER' as 'misc' so it sorts last in tables.\n" +
"```\n\n" +
"## Why this matters\n" +
"When the blog post is written and a reviewer asks 'why did you drop those rows?' you have an answer ready in CLEANING.md. Without it, you'll have forgotten by W30 and the project's credibility crumbles at exactly the moment it shouldn't.\n\n" +
"## The 'cleaning is analysis' mindset\n" +
"If a cleaning decision is interesting, it goes in the blog post. 'We had to drop 8% of rows because of missing target values. That 8% turned out to be older accounts with a different data-collection workflow — they're systematically different and excluding them is correct.' That's a finding."
      ),
      S([
        { prompt: "Every cleaning decision should be documented with its reason — even simple ones.", answer: true, whenRight: "Right — future-you and the reviewer both forget your reasoning. Write it down.", whenWrong: "Yes — document every choice. The blog post needs it; the reviewer asks for it." },
        { prompt: "Cleaning is a chore separate from the real analysis.", answer: false, whenRight: "Right — no. Cleaning IS analysis. Half your final findings come from understanding why rows were excluded.", whenWrong: "Cleaning is analysis. The decisions you make here are the project's findings as much as the model's outputs." },
        { prompt: "Saving the clean version as a separate file (data/clean.parquet) is cleaner than overwriting raw.parquet.", answer: true, whenRight: "Right — keep raw untouched. Re-runnable from source, comparable to clean, auditable.", whenWrong: "Yes — never overwrite raw. Keep both; every cleaning run is reproducible from raw.parquet." }
      ]),
      E("Your turn — clean","[CODE] In `notebooks/02_clean.ipynb`:\n1. Read raw.parquet.\n2. Make every cleaning decision your spec implies (nulls, dtypes, outliers, recodes).\n3. Print before/after row counts for each drop.\n4. Save as `data/clean.parquet`.\n5. Write `capstone/CLEANING.md` listing every decision + reason.")
    ]),
    D(3,"EDA + baseline","Understand the data; nail the bar to beat.",[
      L("EDA that pays off",
"## What it is\n" +
"Two hours of exploratory data analysis (EDA) followed by one strong baseline model. EDA's job is to find the features that obviously matter; the baseline's job is to be the bar your main model must beat.\n\n" +
"## EDA shape\n" +
"For most capstones, the highest-value EDA fits on one page:\n" +
"- **Target distribution** — histogram. Is it heavily skewed? Bimodal? Long-tailed?\n" +
"- **Feature vs target** scatter / boxplot for the top 5-10 features.\n" +
"- **Pairwise correlations** for numeric features. `df.corr().style.background_gradient()` or seaborn heatmap.\n" +
"- **Missingness pattern** — already done in cleaning, but a quick chart.\n" +
"- **One surprise** — find ONE thing you didn't expect. That's the hook of the blog post.\n\n" +
"## The baseline\n" +
"Strong baselines for common problems:\n" +
"- **Regression**: Linear regression on the 5 most-correlated features.\n" +
"- **Classification**: Logistic regression on the 5 most-discriminating features (or majority-class predictor).\n" +
"- **Time series**: Persistence (yesterday's value).\n" +
"- **Recommendation**: Most popular item.\n" +
"\n" +
"Train on train, evaluate on test. Report MAE / accuracy / whatever the spec metric is. Write it into `RESULTS.md`.\n\n" +
"## Why the baseline matters\n" +
"Every model you train tomorrow gets compared to this number. If your gradient-boosted tree gets MAE 95 and your linear regression baseline was MAE 100, you've gained 5%. If they're both at MAE 95, you've gained nothing — the linear model was already enough.\n\n" +
"This is the single highest-leverage piece of analysis you'll do in the build week. Don't skip it.\n\n" +
"## Save the baseline\n" +
"```python\n" +
"import joblib\n" +
"joblib.dump(baseline, 'models/baseline.pkl')\n" +
"```\n" +
"You'll re-load it in W30 for the final comparison."
      ),
      S([
        { prompt: "Spending a day on EDA + baseline pays back for the entire rest of the project.", answer: true, whenRight: "Right — EDA finds the features that matter; baseline sets the bar. Both are reused all week.", whenWrong: "Yes — high-leverage day. Skipping it means the main model has nothing to compare against." },
        { prompt: "A 'baseline' has to be sophisticated for the comparison to be meaningful.", answer: false, whenRight: "Right — no. A simple, well-tuned baseline (linear regression, majority class) is exactly the right bar. Sophistication risks losing the 'simple' story.", whenWrong: "Simple is the point. Beating a tuned linear regression by 10% is a real finding; beating a complicated baseline by 1% is not." },
        { prompt: "Finding one surprise during EDA is more valuable than running 20 charts.", answer: true, whenRight: "Right — one surprise is the hook of the blog post. 20 unsurprising charts are wallpaper.", whenWrong: "Yes — quality over quantity. The blog needs one surprising finding, not a museum of charts." }
      ]),
      E("Your turn — EDA + baseline","[CODE] In `notebooks/03_eda_baseline.ipynb`:\n1. Plot target distribution.\n2. Plot top 5-10 features vs target.\n3. Pairwise correlation heatmap.\n4. Train your baseline. Evaluate on held-out test.\n5. Save baseline.pkl. Record metric in `capstone/RESULTS.md`.\n6. Markdown: name ONE surprise in the data.")
    ]),
    D(4,"Main model","ONE main model, well-trained, with a documented reason.",[
      L("Picking + training the main model",
"## What it is\n" +
"Today you train **one main model**. Not three. Not a comparison table. One. The one your spec + EDA suggested. Document why this one.\n\n" +
"## The shortlist by problem type\n" +
"- **Tabular regression / classification**: gradient-boosted trees (XGBoost, LightGBM). Reliably beats linear; less work than a neural net.\n" +
"- **Text classification**: fine-tuned DistilBERT (W15 work pays off here).\n" +
"- **Time series**: Prophet if calendar effects matter; ARIMA if not.\n" +
"- **Image classification**: fine-tuned ResNet50 or EfficientNet.\n" +
"- **Clustering**: KMeans with k chosen via silhouette score.\n" +
"- **Recommendation**: matrix factorization (implicit ALS, surprise).\n" +
"\n" +
"Pick from this list unless your spec demands something exotic. Exotic models eat your timeline.\n\n" +
"## Training discipline\n" +
"```python\n" +
"from sklearn.model_selection import train_test_split\n" +
"from xgboost import XGBRegressor\n\n" +
"X = df.drop(columns=['target'])\n" +
"y = df['target']\n" +
"X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\n" +
"model = XGBRegressor(n_estimators=500, max_depth=6, learning_rate=0.05,\n" +
"                     random_state=42, early_stopping_rounds=50)\n" +
"model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)\n\n" +
"from sklearn.metrics import mean_absolute_error\n" +
"mae = mean_absolute_error(y_test, model.predict(X_test))\n" +
"print(f'XGBoost MAE: {mae:.2f}')\n" +
"# Compare to baseline:\n" +
"# Baseline MAE: 100, XGBoost MAE: 87 — 13% improvement\n" +
"```\n\n" +
"## Why one model, not three\n" +
"From W24's lesson: a model comparison table is impressive only if it's a real comparison. Three half-tuned models with similar accuracy reads as scattershot. One well-tuned model that beat a strong baseline is a clear story.\n\n" +
"You can mention 'I also tried logistic regression' in the blog post in one sentence. That's enough.\n\n" +
"## Save the model\n" +
"```python\n" +
"joblib.dump(model, 'models/main.pkl')\n" +
"```\n" +
"Plus the train/test split (or just the random_state and code that recreates it). Reproducibility matters."
      ),
      S([
        { prompt: "Training one well-tuned main model is a better capstone deliverable than three half-tuned ones.", answer: true, whenRight: "Right — one clear winner with documented reasoning beats a scattershot table. Story over collection.", whenWrong: "Yes — one main model. Three half-tuned models read as 'I didn't know what to pick.' One choice + reasoning reads as professional." },
        { prompt: "Gradient-boosted trees (XGBoost, LightGBM) are a safe default for tabular DS problems.", answer: true, whenRight: "Right — reliably good; less tuning than neural nets; native handling of mixed types and missingness.", whenWrong: "Yes — XGBoost is the default for tabular. Neural nets win only on enormous data; trees win otherwise." },
        { prompt: "If your main model only beats the baseline by 1%, that's a successful project.", answer: false, whenRight: "Right — no. 1% improvement = the baseline was already enough. Reframe the question or pick a harder problem.", whenWrong: "1% over a strong baseline means the baseline was sufficient. Reframe to where the harder model adds real value." }
      ]),
      E("Your turn — main model","[CODE] In `notebooks/04_main_model.ipynb`:\n1. Pick ONE main model. Document why in a markdown cell.\n2. Train with explicit train_test_split, eval_set, random_state.\n3. Evaluate against baseline. Record both metrics in RESULTS.md.\n4. Save as `models/main.pkl`.\n5. Markdown: how much did the main model beat the baseline by? Is it enough to be a story?")
    ]),
    D(5,"Iterate — on features, not models","Look at where the model fails. Add features that fix it.",[
      L("Iterating the right way",
"## What it is\n" +
"Today is the temptation day — when most learners think 'I'll try a different model.' Don't. On a tight timeline, **iterating on features beats iterating on models** 9 times out of 10.\n\n" +
"## The diagnostic\n" +
"```python\n" +
"preds = model.predict(X_test)\n" +
"resid = y_test - preds\n\n" +
"# 1. Where is the model wrong?\n" +
"#    Plot residuals against each feature. Look for patterns.\n" +
"for col in important_features[:5]:\n" +
"    plt.figure()\n" +
"    plt.scatter(X_test[col], resid, alpha=0.3)\n" +
"    plt.title(f'Residuals vs {col}')\n\n" +
"# 2. Which rows are the worst predictions?\n" +
"worst = X_test.assign(actual=y_test, predicted=preds, resid=resid) \\\n" +
"             .nlargest(20, 'resid', keep='first')\n" +
"print(worst[['feature_a','feature_b','actual','predicted','resid']])\n" +
"```\n\n" +
"## What you're looking for\n" +
"- **A subgroup the model systematically gets wrong** — e.g., the model under-predicts demand on holidays. Encode 'is_holiday' as a feature. Refit.\n" +
"- **A non-linearity** — model under-predicts at the high end. Try `log(target)` and refit.\n" +
"- **A missing interaction** — model gets X right, Y right, but X*Y wrong. Add the interaction as a column.\n" +
"\n" +
"## Why features beat models on a tight timeline\n" +
"- Feature engineering is fast to try, fast to measure.\n" +
"- A new feature that captures real domain knowledge can shift MAE by 10-20%.\n" +
"- Switching XGBoost for LightGBM might shift MAE by 1-3% and eat a whole day.\n" +
"\n" +
"The best capstones spend Day 5 on 3-5 features added based on residual analysis. The model stays the same; the story is 'the features turned out to be the lever.'\n\n" +
"## When you SHOULD try a different model\n" +
"If today's residual analysis shows the model is fundamentally wrong-shaped — e.g., your XGBoost regressor's residuals are heavily skewed and adding features doesn't help, indicating you need a different loss function. Document the diagnosis, then switch. Don't switch on a hunch."
      ),
      S([
        { prompt: "On a tight timeline, iterating on features beats iterating on models in most cases.", answer: true, whenRight: "Right — features can shift MAE 10-20%; model swaps shift it 1-3%. Feature work has higher ROI.", whenWrong: "Yes — features compound; model swaps don't. Always check the residuals before switching models." },
        { prompt: "If residuals show a subgroup is systematically wrong, that suggests a missing feature, not a bad model.", answer: true, whenRight: "Right — encode what the model can't see (the subgroup membership) as a feature. Refit.", whenWrong: "Yes — systematic subgroup errors = missing signal in the features, not the wrong architecture." },
        { prompt: "Switching models is always the first move when accuracy plateaus.", answer: false, whenRight: "Right — no. First look at residuals; add features; only then consider a different model.", whenWrong: "Residuals first, features second, models third. Skipping the first two means you switch blind." }
      ]),
      E("Your turn — iterate","[CODE] In `notebooks/05_iterate.ipynb`:\n1. Compute residuals on test set.\n2. Plot residuals against your top 5 features. Identify ONE systematic miss.\n3. Add a feature that fixes that miss (subgroup flag, interaction, transform).\n4. Refit. Compare new MAE to old.\n5. Markdown: what feature did you add, what was the gain, why does the gain make sense?")
    ]),
    D(6,"Honest evaluation","Held-out test, real metric, error analysis.",[
      L("Final honest evaluation",
"## What it is\n" +
"Today you run the **definitive** evaluation. Numbers from this run are what go in the blog post and the RESULTS.md file. After today, the model is frozen.\n\n" +
"## The evaluation discipline\n" +
"```python\n" +
"# Re-load the test split (the SAME one you trained against)\n" +
"# Use random_state from W29 D4 — reproducibility matters\n" +
"from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score\n" +
"\n" +
"preds = main_model.predict(X_test)\n" +
"\n" +
"results = {\n" +
"    'mae':  mean_absolute_error(y_test, preds),\n" +
"    'rmse': mean_squared_error(y_test, preds, squared=False),\n" +
"    'r2':   r2_score(y_test, preds),\n" +
"}\n" +
"baseline_preds = baseline.predict(X_test)\n" +
"results['baseline_mae']  = mean_absolute_error(y_test, baseline_preds)\n" +
"results['improvement_%'] = 100 * (results['baseline_mae'] - results['mae']) / results['baseline_mae']\n" +
"\n" +
"print(results)\n" +
"# {'mae': 86.4, 'rmse': 121.7, 'r2': 0.74, 'baseline_mae': 100.2, 'improvement_%': 13.8}\n" +
"```\n\n" +
"## Error analysis\n" +
"```python\n" +
"# Where is the model still wrong?\n" +
"resid = y_test - preds\n" +
"worst = X_test.assign(actual=y_test, predicted=preds, resid=resid).nlargest(20, 'resid')\n" +
"print('Worst 20 cases:'); print(worst[['feature_a','feature_b','actual','predicted','resid']])\n" +
"\n" +
"# What fraction of the test set is the model within 10% of true value?\n" +
"within_10pct = (abs(resid) / y_test < 0.1).mean()\n" +
"print(f'Within 10%: {within_10pct:.1%}')\n" +
"# Within 10%: 67.3%\n" +
"```\n\n" +
"## What goes in RESULTS.md\n" +
"```markdown\n" +
"# Capstone results\n" +
"\n" +
"## Headline\n" +
"<Project name> predicts <target> with MAE 86.4 (R² 0.74),\n" +
"a 13.8% improvement over the linear baseline.\n" +
"67.3% of predictions are within 10% of the true value.\n" +
"\n" +
"## Where the model fails\n" +
"<Specific subgroups or value ranges where it still underperforms,\n" +
" with 1-line reasons for each.>\n" +
"\n" +
"## Honest weaknesses\n" +
"<2-3 things you'd improve if you had another week.>\n" +
"```\n\n" +
"## Why this is the day the model gets frozen\n" +
"After today, no more tweaking. Tomorrow is v0.2 tag; next week is polish + ship + retro. Locking the model now protects you from endless iteration."
      ),
      S([
        { prompt: "Reporting the % improvement over the baseline is more meaningful than reporting just the absolute MAE.", answer: true, whenRight: "Right — absolute MAE is unitful and hard to judge in isolation. Improvement over baseline anchors the number.", whenWrong: "Yes — readers need an anchor. '13.8% better than baseline' is interpretable; '86.4 MAE' alone isn't." },
        { prompt: "Including a weakness section in the results page makes the project look weaker.", answer: false, whenRight: "Right — no. Naming weaknesses honestly builds trust. Reviewers test you on this; honesty wins.", whenWrong: "Honesty wins. Hidden weaknesses get caught; named weaknesses build credibility." },
        { prompt: "Freezing the model on Day 6 of W29 protects you from endless iteration in W30.", answer: true, whenRight: "Right — locking the model frees W30 to focus on polish, demo, blog, retro. Without the freeze, you're still tweaking on day 6 of ship week.", whenWrong: "Yes — freeze date is a forcing function. W30 is about communication, not modeling." }
      ]),
      E("Your turn — final evaluation","[CODE] In `notebooks/06_evaluate.ipynb`:\n1. Run main model + baseline on held-out test.\n2. Compute all metrics from the spec.\n3. Identify the worst-predicted cases. Markdown them.\n4. Compute 'fraction within X%' for whatever X feels right.\n5. Write RESULTS.md (headline, weaknesses, improvement % over baseline).\n6. Freeze the model. Tomorrow is v0.2 tag.")
    ]),
    D(7,"Tag v0.2","Model trained. Results in. Next week: ship.",[
      L("Shipping v0.2",
"## What you tag\n" +
"```bash\n" +
"git add notebooks/01_ingest.ipynb notebooks/02_clean.ipynb \\\n" +
"        notebooks/03_eda_baseline.ipynb notebooks/04_main_model.ipynb \\\n" +
"        notebooks/05_iterate.ipynb notebooks/06_evaluate.ipynb \\\n" +
"        data/clean.parquet models/baseline.pkl models/main.pkl \\\n" +
"        capstone/SPEC.md capstone/PLAN.md capstone/CLEANING.md \\\n" +
"        capstone/RESULTS.md capstone/DATA_DICT.md\n" +
"git commit -m \"Capstone v0.2: build complete. Main model beats baseline by X%.\"\n" +
"git tag capstone-v0.2\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## What you've finished\n" +
"- Full dataset ingested + cleaned + documented\n" +
"- EDA that identified the features that mattered + one surprise\n" +
"- A strong baseline + a documented main model\n" +
"- One round of iteration based on residual analysis\n" +
"- Honest final evaluation with documented weaknesses\n" +
"\n" +
"That's a complete piece of analysis. Everything from here is communication.\n\n" +
"## What's next — W30\n" +
"- D1: Streamlit dashboard\n" +
"- D2: deploy it\n" +
"- D3: blog post\n" +
"- D4: demo video\n" +
"- D5: 3 outside readers\n" +
"- D6: edits from feedback\n" +
"- D7: capstone v1.0 + retro\n" +
"\n" +
"Same shape as Energy Forecast W27. You've done this shipping ritual once already; the second time is faster.\n\n" +
"## Update PLAN.md\n" +
"Sunday-night ritual: open PLAN.md, mark Week 29 done, look at Week 30, halve anything that looks ambitious. Then close the laptop. You've earned the rest of the day."
      ),
      S([
        { prompt: "Tagging v0.2 with the model frozen is a discipline that protects W30 from endless iteration.", answer: true, whenRight: "Right — freeze date forces focus on communication. Without it, you're still tweaking the model on demo day.", whenWrong: "Yes — the tag is a commit-to-ship. W30 is for polish, not more modeling." },
        { prompt: "By v0.2, the analysis is complete and the remaining work is communication.", answer: true, whenRight: "Right — that's the framing. Model done; story still to write. Same as Energy Forecast W27.", whenWrong: "Yes — v0.2 = analysis done. W30 is the storytelling half. Both halves matter; W30 is what reviewers actually see." },
        { prompt: "Skipping the Sunday-night PLAN.md review is fine since the week is over.", answer: false, whenRight: "Right — no. Sunday review for W30 is exactly when you'd halve over-ambitious tasks. Skipping it = scope creep next week.", whenWrong: "Sunday review is non-optional. It's the cheapest insurance against W30 over-scoping." }
      ]),
      E("Your turn — tag v0.2","[PRODUCE] 1. Verify all notebooks, models, and docs are in.\n2. `git tag capstone-v0.2 && git push --tags`.\n3. Sunday-night ritual: update PLAN.md. Halve W30 if it looks ambitious.\n\nPASS:\n[x] data/clean.parquet exists\n[x] CLEANING.md documents every decision\n[x] models/baseline.pkl + models/main.pkl both saved\n[x] RESULTS.md has the headline, improvement %, weaknesses\n[x] capstone-v0.2 tag pushed\n[x] W30 plan halved if needed")
    ])
  ]
};

const newWeeks = [W26, W27, W28, W29];
newWeeks.forEach((w) => {
  if (w.days.length !== 7) throw new Error(`W${w.number}: need 7 days, got ${w.days.length}`);
  if (!w.concept_check || w.concept_check.length !== 3) throw new Error(`W${w.number}: concept_check must have 3 entries`);
  w.days.forEach((d) => {
    const k = d.items.map((i) => i.kind);
    if (!k.includes('lesson') || !k.includes('swipe') || !k.includes('exercise')) {
      throw new Error(`W${w.number} D${d.number} missing required item kinds`);
    }
  });
});

ds.weeks.splice(25, 4, ...newWeeks);

fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log(`SUCCESS — DS W26-W29 rebuilt. Total weeks: ${ds.weeks.length}`);
