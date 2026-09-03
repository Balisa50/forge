// Rebuild DS W42-W43 to the teach->swipe->project standard.
// W42 Distributed ML — when your data does not fit on one laptop
// W43 Privacy and Differential Privacy — the senior-DS topic nobody teaches
const path = require('path');
const fs = require('fs');
const FILE = path.join(__dirname, '..', 'data', 'roadmaps', 'data-science.json');
const ds = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const L = (title, body) => ({ kind: 'lesson', title, body });
const V = (title, url, dm, creator, why) => ({ kind: 'video', title, url, duration_min: dm, creator, why });
const S = (cards) => ({ kind: 'swipe', title: 'Quick check — swipe to answer', cards });
const E = (title, body) => ({ kind: 'exercise', title, body });
const D = (number, title, summary, items) => ({ number, title, summary, items });

/* ════ WEEK 42 — Distributed ML: when your data does not fit on one laptop ════ */
const W42 = {
  number: 42, title: "Distributed ML - when your data does not fit on one laptop",
  phase: "Specialty", commitment_hours: "8-10",
  context: ds.weeks[41].context,
  concept_check: [
    { q: "Why is 'I have big data so I need PySpark' often wrong?",
      choices: ["Spark is hard","A 50M-row × 20-column dataset is ~8GB in memory and fits comfortably on a $200/month 32GB cloud VM with pandas. Spark adds cluster setup, runtime overhead, and slower iteration — only worth it when data genuinely exceeds single-machine RAM",
        "Spark is slow","Random"],
      correct: 1, explain: "The single most common 'distributed ML' mistake is reaching for Spark on data that fits in RAM. Pandas on a 32GB box handles tens of GB comfortably; Polars handles 100GB+ in some cases. Spark only earns its complexity when data truly doesn't fit OR when you need cluster compute for parallel training. Knowing WHEN to switch is more valuable than knowing how to write Spark." },
    { q: "What's the difference between Dask and PySpark in one sentence?",
      choices: ["Same thing","Dask scales pandas/numpy APIs to clusters with minimal code change; PySpark is a separate DataFrame API + ecosystem (MLlib, Streaming) that scales from one node to thousands but requires its own paradigm",
        "PySpark is older","Dask is faster"],
      correct: 1, explain: "Dask: 'pandas you already know, distributed under the hood'. Same API; replace `pd` with `dd` and many things just work. Best for teams that already speak pandas + need to scale a bit beyond single-machine. PySpark: 'a separate framework with its own DataFrame, SQL, ML, streaming, and graph libraries'. More mature at huge scale; bigger learning curve; what most enterprise data platforms run on." },
    { q: "Why does ML training on a cluster need DIFFERENT algorithms than ML training on one machine?",
      choices: ["No reason","Algorithms that pass over all data multiple times (e.g., scikit-learn GBM) don't fit when 'all data' lives on 100 machines — distributed-friendly algorithms either work on one batch at a time (mini-batch SGD), or use careful tree-building schemes (XGBoost, LightGBM distributed), or use approximate methods (Spark MLlib's linear models)",
        "Speed","Trendy"],
      correct: 1, explain: "When data is split across nodes, you can't 'iterate over the whole dataset' the way scikit-learn does — each iteration would require shuffling terabytes between machines. Distributed ML algorithms are designed around this: minibatch SGD (each node updates with its slice), distributed XGBoost (histograms + tree-building synchronization), Spark MLlib's linear models (gradient aggregation per pass). The algorithm choice IS the engineering." }
  ],
  days: [
    D(1,"Dask setup","Install + first groupby on bigger-than-pandas-likes data.",[
      L("Dask — pandas that scales out gracefully",
"## What it is\n" +
"Dask gives you the pandas/numpy APIs you already know — backed by a lazy task graph that can run on a single multi-core machine OR a cluster.\n\n" +
"```text\n" +
"pandas DataFrame:   in-memory, one core, ~RAM-sized data\n" +
"Dask DataFrame:     partitioned, all cores, larger-than-RAM via spill-to-disk\n" +
"                    or scaled to a cluster\n" +
"```\n\n" +
"For most learners and small teams, Dask on a single laptop solves the 'my data is 10GB and pandas is OOMing' problem without needing a cluster.\n\n" +
"## Install + first run\n" +
"```bash\n" +
"pip install dask[complete] pyarrow\n" +
"```\n\n" +
"```python\n" +
"import dask.dataframe as dd\n\n" +
"# Read a multi-file parquet dataset (works on local glob or s3://)\n" +
"df = dd.read_parquet('data/big/*.parquet')\n" +
"\n" +
"# Inspect WITHOUT loading everything\n" +
"print(df.npartitions)        # number of partitions\n" +
"print(df.dtypes)             # column types\n" +
"print(df.head())             # only loads first partition\n" +
"\n" +
"# Compute a GROUPBY across all partitions\n" +
"result = df.groupby('user_id')['amount'].sum().compute()\n" +
"# .compute() = 'actually execute the lazy graph and return a pandas DataFrame'\n" +
"```\n\n" +
"## The mental model\n" +
"Dask is LAZY by default. Every operation builds a task graph; nothing executes until you call `.compute()` or `.persist()`. This lets it optimize execution across the whole pipeline.\n\n" +
"## Try it on a real-ish dataset\n" +
"NYC Taxi data: ~5GB compressed parquet per year, hundreds of millions of rows.\n\n" +
"```python\n" +
"# Download e.g. 4 months of yellow-taxi 2019 parquet from\n" +
"# https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page\n" +
"df = dd.read_parquet('data/yellow_2019_*.parquet')\n" +
"print(f'{df.npartitions} partitions, {len(df):,} rows total')\n" +
"# 4 partitions, 32,150,832 rows\n\n" +
"# Same query as TaxiPulse week 1, but at scale\n" +
"by_hour = (\n" +
"    df.assign(hour=df['tpep_pickup_datetime'].dt.hour)\n" +
"      .groupby('hour')['fare_amount']\n" +
"      .agg(['count', 'mean'])\n" +
"      .compute()\n" +
")\n" +
"print(by_hour.sort_values('count', ascending=False).head())\n" +
"```\n\n" +
"On a typical laptop that runs in ~30 seconds. Same query in pandas needs the data loaded all at once — typically OOM on the same machine.\n\n" +
"## Dashboard\n" +
"```python\n" +
"from dask.distributed import Client\n" +
"client = Client()  # spins up a local cluster + dashboard\n" +
"print(client.dashboard_link)\n" +
"# http://127.0.0.1:8787/status\n" +
"```\n\n" +
"Open the dashboard while a query runs. You SEE the task graph executing in real time. Profoundly useful for understanding distributed execution."
      ),
      V("Dask in 100 Seconds","https://www.youtube.com/watch?v=ods97a5Pzw0",2,"Fireship","Watch first. Fast Dask overview — what it is, why it exists, how it compares to pandas + Spark."),
      S([
        { prompt: "Dask DataFrames are LAZY — operations build a task graph; nothing runs until .compute().", answer: true, whenRight: "Right — laziness lets Dask optimize the whole pipeline before execution.", whenWrong: "Yes — lazy. Build graph, then execute. Same pattern as Spark." },
        { prompt: "Dask is a drop-in replacement for pandas in every case.", answer: false, whenRight: "Right — no. Most pandas ops work; a few (heavily index-dependent ones, some `.apply` patterns) don't translate cleanly.", whenWrong: "Most ops work; some don't. Index-dependent + arbitrary .apply often need re-thinking." },
        { prompt: "Spinning up a local Dask cluster with Client() gives you a real-time dashboard of task execution.", answer: true, whenRight: "Right — the dashboard at 8787 shows the live task graph. Best teaching tool for distributed execution.", whenWrong: "Yes — dashboard at port 8787. Watch tasks execute in real time; learn how distributed work flows." }
      ]),
      E("Your turn — Dask first run","[CODE] In `dist/01_dask.ipynb`:\n1. `pip install dask[complete] pyarrow`.\n2. Download 2-4 months of NYC yellow-taxi parquet.\n3. dd.read_parquet on the glob.\n4. Run a groupby('hour')['fare_amount'].mean().compute().\n5. Open the Dask dashboard while it runs.\n6. Markdown: how many rows did you process, in how many seconds?")
    ]),
    D(2,"PySpark setup","Local Spark session. The other distributed paradigm.",[
      L("PySpark — the enterprise paradigm",
"## What it is\n" +
"PySpark is the Python API for Apache Spark, the most-deployed distributed-compute framework in production data engineering and ML. Different from Dask in three ways:\n\n" +
"```text\n" +
"1. SEPARATE API — pyspark.sql.DataFrame, not pandas.\n" +
"   The patterns are SQL-like; you'll feel at home if you know SQL.\n" +
"\n" +
"2. BIGGER ECOSYSTEM — MLlib (ML), Streaming, SQL, GraphX, Delta Lake.\n" +
"   Same framework solves data engineering + analytics + ML.\n" +
"\n" +
"3. MORE OPERATIONAL — Real production deploys use cluster managers (YARN,\n" +
"   Kubernetes, Databricks). Heavier than Dask but proven at scale.\n" +
"```\n\n" +
"## Local install\n" +
"```bash\n" +
"pip install pyspark\n" +
"# Java 11 or 17 required; install if not present\n" +
"```\n\n" +
"```python\n" +
"from pyspark.sql import SparkSession\n\n" +
"spark = (\n" +
"    SparkSession.builder\n" +
"    .appName('DistML')\n" +
"    .master('local[*]')          # all available cores on this machine\n" +
"    .config('spark.driver.memory', '8g')\n" +
"    .getOrCreate()\n" +
")\n\n" +
"print(spark.version)\n" +
"# 3.5.x\n" +
"```\n\n" +
"## Read the same NYC taxi parquet\n" +
"```python\n" +
"df = spark.read.parquet('data/yellow_2019_*.parquet')\n" +
"df.printSchema()\n" +
"# root\n" +
"#  |-- VendorID: integer (nullable = true)\n" +
"#  |-- tpep_pickup_datetime: timestamp (nullable = true)\n" +
"#  ...\n\n" +
"print(df.count())\n" +
"# 32,150,832\n" +
"```\n\n" +
"## The same groupby in Spark SQL\n" +
"```python\n" +
"from pyspark.sql.functions import hour, col, count, mean\n\n" +
"by_hour = (\n" +
"    df.withColumn('hour', hour('tpep_pickup_datetime'))\n" +
"      .groupBy('hour')\n" +
"      .agg(count('*').alias('trips'), mean('fare_amount').alias('avg_fare'))\n" +
"      .orderBy('trips', ascending=False)\n" +
")\n" +
"by_hour.show(5)\n" +
"# +----+--------+----------+\n" +
"# |hour|   trips|  avg_fare|\n" +
"# +----+--------+----------+\n" +
"# |  18| 2010491|     13.45|\n" +
"# ...\n" +
"```\n\n" +
"## Or write actual SQL\n" +
"```python\n" +
"df.createOrReplaceTempView('trips')\n" +
"spark.sql(\"\"\"\n" +
"    SELECT hour(tpep_pickup_datetime) AS hour, COUNT(*) AS trips\n" +
"    FROM trips\n" +
"    GROUP BY hour\n" +
"    ORDER BY trips DESC\n" +
"\"\"\").show(5)\n" +
"```\n\n" +
"## The Spark UI\n" +
"```python\n" +
"# While the session is running, open:\n" +
"#   http://localhost:4040\n" +
"# You'll see: jobs, stages, executors, SQL queries\n" +
"```\n\n" +
"Spark's UI is the production-monitoring equivalent of Dask's dashboard. You'll use it for debugging slow queries in real jobs.\n\n" +
"## When to reach for Spark over Dask\n" +
"```text\n" +
"- Your team / company already runs Spark — interoperability\n" +
"- You need the Spark ecosystem (MLlib, Delta Lake, structured streaming)\n" +
"- You're on Databricks, EMR, Glue, Synapse — Spark is native\n" +
"- Data scale truly exceeds what Dask handles cleanly (multi-TB)\n" +
"\n" +
"- Quick prototyping in pandas-style → Dask\n" +
"- Solo / small team, just need to scale beyond RAM → Dask\n" +
"```"
      ),
      V("PySpark in 100 Seconds","https://www.youtube.com/watch?v=cZS5xYYIPzk",2,"Fireship","Watch first. What Spark is, why every enterprise runs it, and what PySpark gives you."),
      S([
        { prompt: "PySpark uses a SQL-like DataFrame API rather than the pandas API.", answer: true, whenRight: "Right — different paradigm. Same data ops, different syntax. SQL knowledge transfers directly.", whenWrong: "Yes — Spark DataFrame is SQL-shaped. .select() / .filter() / .groupBy() / .agg() — feels like SQL." },
        { prompt: "Local Spark (`master='local[*]'`) lets you use all your machine's cores without a real cluster.", answer: true, whenRight: "Right — single-machine multi-core. Same code runs on a cluster later; just change the master URL.", whenWrong: "Yes — local mode uses all cores. Production swap = change the master URL; code stays the same." },
        { prompt: "Spark is always faster than Dask on a single machine.", answer: false, whenRight: "Right — no. On single-machine, Dask often matches or beats Spark due to less startup overhead.", whenWrong: "Not always. Dask is often faster locally; Spark wins at multi-node scale + ecosystem." }
      ]),
      E("Your turn — first Spark","[CODE] In `dist/02_spark.ipynb`:\n1. `pip install pyspark`; install Java 11/17 if needed.\n2. Spin up a local SparkSession.\n3. Read the same NYC taxi parquet glob.\n4. Run the groupby('hour') query in both DataFrame API + SQL.\n5. Open Spark UI at localhost:4040 — explore one query's stages.\n6. Markdown: which API felt more natural to you?")
    ]),
    D(3,"Replicate the query","Same query, three engines.",[
      L("Same query, three engines — the runtime triangle",
"## What you'll do\n" +
"Run the SAME query (busiest hour from NYC taxi data) in:\n" +
"1. **Pandas** (single-thread, in-memory)\n" +
"2. **Dask** (multi-core, lazy)\n" +
"3. **PySpark** (Spark on local mode, all cores)\n" +
"\n" +
"Time each one. Inspect peak memory.\n\n" +
"## The query (consistent across engines)\n" +
"```text\n" +
"For each hour of day, count trips and average fare.\n" +
"Filter: fare_amount between 2.5 and 200.\n" +
"Order by trips descending.\n" +
"```\n\n" +
"## Pandas\n" +
"```python\n" +
"import pandas as pd, glob, time\n" +
"start = time.time()\n" +
"df = pd.concat([pd.read_parquet(f) for f in glob.glob('data/yellow_2019_*.parquet')])\n" +
"df = df[(df['fare_amount'] >= 2.5) & (df['fare_amount'] <= 200)]\n" +
"df['hour'] = df['tpep_pickup_datetime'].dt.hour\n" +
"result = df.groupby('hour').agg(trips=('hour','count'),\n" +
"                                 avg_fare=('fare_amount','mean'))\n" +
"result = result.sort_values('trips', ascending=False)\n" +
"print(f'pandas: {time.time()-start:.1f}s')\n" +
"```\n\n" +
"On 30M rows, expect either OOM on 16GB machines or ~40-90 seconds and high memory.\n\n" +
"## Dask\n" +
"```python\n" +
"import dask.dataframe as dd\n" +
"start = time.time()\n" +
"df = dd.read_parquet('data/yellow_2019_*.parquet')\n" +
"df = df[(df['fare_amount'] >= 2.5) & (df['fare_amount'] <= 200)]\n" +
"df['hour'] = df['tpep_pickup_datetime'].dt.hour\n" +
"result = (\n" +
"    df.groupby('hour')\n" +
"      .agg({'hour': 'count', 'fare_amount': 'mean'})\n" +
"      .rename(columns={'hour': 'trips', 'fare_amount': 'avg_fare'})\n" +
"      .compute()\n" +
"      .sort_values('trips', ascending=False)\n" +
")\n" +
"print(f'dask: {time.time()-start:.1f}s')\n" +
"```\n\n" +
"Expect ~15-30 seconds, lower memory footprint than pandas.\n\n" +
"## PySpark\n" +
"```python\n" +
"from pyspark.sql import SparkSession\n" +
"from pyspark.sql.functions import hour, col, count, mean\n\n" +
"spark = SparkSession.builder.master('local[*]').getOrCreate()\n" +
"start = time.time()\n" +
"df = spark.read.parquet('data/yellow_2019_*.parquet')\n" +
"result = (\n" +
"    df.filter((col('fare_amount') >= 2.5) & (col('fare_amount') <= 200))\n" +
"      .withColumn('hour', hour('tpep_pickup_datetime'))\n" +
"      .groupBy('hour')\n" +
"      .agg(count('*').alias('trips'), mean('fare_amount').alias('avg_fare'))\n" +
"      .orderBy('trips', ascending=False)\n" +
")\n" +
"result.show()\n" +
"print(f'spark: {time.time()-start:.1f}s')\n" +
"```\n\n" +
"Expect ~20-40 seconds on local mode; Spark has higher startup cost than Dask but better at multi-stage queries.\n\n" +
"## Capture peak memory\n" +
"```python\n" +
"# Run each query in a subprocess + measure with /usr/bin/time -v on Linux\n" +
"# or psutil.Process().memory_info().rss on a polling loop.\n" +
"```\n\n" +
"## The honest comparison\n" +
"```markdown\n" +
"| Engine  | Time (s) | Peak mem (GB) | Code length | Notes                |\n" +
"|---------|----------|---------------|-------------|----------------------|\n" +
"| pandas  | 80       | 14            | 8 lines     | OOM risk above 30M   |\n" +
"| Dask    | 25       | 5             | 9 lines     | Lazy; pandas-like    |\n" +
"| Spark   | 35       | 6             | 11 lines    | Startup cost; SQL    |\n" +
"```\n\n" +
"Note: numbers will vary widely by machine. The relative shape — pandas slower + memory-heavy, Dask + Spark roughly tied locally — is the lesson.\n\n" +
"## What this teaches\n" +
"At single-machine scale, the engines are MORE SIMILAR than they look in marketing. The real differences emerge at cluster scale, which is tomorrow's lesson (training a model with Spark MLlib)."
      ),
      S([
        { prompt: "On a single machine, pandas is usually the FASTEST engine if the data fits in memory.", answer: true, whenRight: "Right — no distribution overhead. Dask and Spark add fixed costs that only pay off at scale or under memory pressure.", whenWrong: "Yes — when data fits, pandas is fastest. Distribution costs > distribution gains until you hit RAM limits." },
        { prompt: "Dask and Spark have similar performance on single-machine queries; the differences emerge at cluster scale.", answer: true, whenRight: "Right — local mode hides the real differences. Multi-node deployment is where each tool's design choices matter.", whenWrong: "Yes — local benchmarks are misleading. Cluster behavior + ecosystem are the real differentiators." },
        { prompt: "The right engine for a query depends only on raw speed.", answer: false, whenRight: "Right — no. Memory footprint, code maintainability, ecosystem fit (Spark for Databricks shops), and team familiarity all matter.", whenWrong: "Speed is one factor; ecosystem + team + memory all matter. 'Fastest' often isn't 'best'." }
      ]),
      E("Your turn — three engines","[CODE] In `dist/03_compare.ipynb`:\n1. Run the same query in pandas, Dask, PySpark.\n2. Time each + record peak memory (psutil polling loop is fine).\n3. Build the comparison table.\n4. Save results to `dist/RUNTIME.md`.\n5. Markdown: if you had to pick ONE for this query on YOUR machine, which and why?")
    ]),
    D(4,"Spark MLlib regression","Distributed training.",[
      L("Distributed training with Spark MLlib",
"## What it is\n" +
"MLlib is Spark's built-in ML library. The killer feature is distributed training: same algorithm, runs on one machine OR a 100-node cluster, scales linearly with data.\n\n" +
"For learner work, you'll train a regression on the NYC taxi data — predict trip fare from distance, time of day, day of week. Train on 30M rows. Watch it run distributedly.\n\n" +
"## The pattern (DataFrame API + MLlib Pipeline)\n" +
"```python\n" +
"from pyspark.sql.functions import hour, dayofweek, col\n" +
"from pyspark.ml.feature import VectorAssembler\n" +
"from pyspark.ml.regression import LinearRegression, GBTRegressor\n" +
"from pyspark.ml import Pipeline\n" +
"from pyspark.ml.evaluation import RegressionEvaluator\n\n" +
"df = spark.read.parquet('data/yellow_2019_*.parquet')\n" +
"df = df.filter((col('fare_amount').between(2.5, 200)) &\n" +
"               (col('trip_distance').between(0.1, 100)))\n\n" +
"# Feature engineering at Spark scale\n" +
"df = (\n" +
"    df.withColumn('hour', hour('tpep_pickup_datetime'))\n" +
"      .withColumn('dow',  dayofweek('tpep_pickup_datetime'))\n" +
")\n\n" +
"# Train / test split (random 80/20 — Spark's randomSplit)\n" +
"train, test = df.randomSplit([0.8, 0.2], seed=42)\n" +
"print(f'train: {train.count():,}, test: {test.count():,}')\n\n" +
"# Build the pipeline\n" +
"assembler = VectorAssembler(\n" +
"    inputCols=['trip_distance', 'hour', 'dow', 'passenger_count'],\n" +
"    outputCol='features',\n" +
")\n" +
"lr = LinearRegression(featuresCol='features', labelCol='fare_amount')\n" +
"pipeline = Pipeline(stages=[assembler, lr])\n\n" +
"model = pipeline.fit(train)\n\n" +
"# Evaluate on test\n" +
"preds = model.transform(test)\n" +
"eval_rmse = RegressionEvaluator(labelCol='fare_amount', metricName='rmse')\n" +
"eval_r2   = RegressionEvaluator(labelCol='fare_amount', metricName='r2')\n" +
"print(f'RMSE: {eval_rmse.evaluate(preds):.2f}')\n" +
"print(f'R²:   {eval_r2.evaluate(preds):.3f}')\n" +
"```\n\n" +
"On 30M rows, the LinearRegression fit takes ~30-60 seconds on local mode. Compare that to scikit-learn on the same data (likely OOM or several minutes if you sub-sample).\n\n" +
"## Try GBT for better accuracy\n" +
"```python\n" +
"gbt = GBTRegressor(\n" +
"    featuresCol='features', labelCol='fare_amount',\n" +
"    maxIter=20, maxDepth=6, seed=42,\n" +
")\n" +
"pipeline_gbt = Pipeline(stages=[assembler, gbt])\n" +
"model_gbt = pipeline_gbt.fit(train)\n" +
"preds_gbt = model_gbt.transform(test)\n" +
"print(f'GBT RMSE: {eval_rmse.evaluate(preds_gbt):.2f}')\n" +
"# Typically ~30% lower than LR.\n" +
"```\n\n" +
"GBT training on 30M rows in local mode: ~3-5 minutes. Equivalent in sklearn: hours or impossible.\n\n" +
"## Cross-validation, the Spark way\n" +
"```python\n" +
"from pyspark.ml.tuning import CrossValidator, ParamGridBuilder\n\n" +
"param_grid = (\n" +
"    ParamGridBuilder()\n" +
"    .addGrid(gbt.maxDepth, [4, 6, 8])\n" +
"    .addGrid(gbt.maxIter, [10, 20])\n" +
"    .build()\n" +
")\n\n" +
"cv = CrossValidator(\n" +
"    estimator=pipeline_gbt,\n" +
"    estimatorParamMaps=param_grid,\n" +
"    evaluator=eval_rmse,\n" +
"    numFolds=3,\n" +
"    parallelism=2,\n" +
")\n" +
"# Heavy — would take ~30+ min on this data. Run with smaller sample first.\n" +
"```\n\n" +
"## What this gives you\n" +
"- Models trained on data that wouldn't fit on one machine\n" +
"- Standard Pipeline API — same shape as sklearn pipelines you know\n" +
"- Production-ready: same code runs on Databricks / EMR / Synapse clusters\n\n" +
"## Save the model\n" +
"```python\n" +
"model_gbt.write().overwrite().save('models/gbt_fare_v1')\n" +
"# Saves to a directory with model metadata + Spark-readable artifacts\n" +
"```\n\n" +
"To load on inference:\n" +
"```python\n" +
"from pyspark.ml import PipelineModel\n" +
"loaded = PipelineModel.load('models/gbt_fare_v1')\n" +
"predictions = loaded.transform(new_data)\n" +
"```"
      ),
      S([
        { prompt: "Spark MLlib's VectorAssembler is a Pipeline stage that turns multiple columns into a single 'features' vector column.", answer: true, whenRight: "Right — MLlib estimators expect a single vector column. VectorAssembler is how you produce it.", whenWrong: "Yes — single vector column for the estimator. Same pattern as a sklearn ColumnTransformer." },
        { prompt: "Spark ML Pipelines have the same shape as scikit-learn Pipelines — stages of transformers + a final estimator.", answer: true, whenRight: "Right — design copied from sklearn deliberately. Same mental model, distributed under the hood.", whenWrong: "Yes — same shape. fit() / transform() / fit_transform() on a sequence of stages." },
        { prompt: "GBT training on 30M rows in Spark local mode is comparable to scikit-learn GBT on the same data.", answer: false, whenRight: "Right — sklearn GBT can't realistically handle 30M rows; either OOMs or takes hours. Distributed GBT is what enables it.", whenWrong: "Distributed-by-design wins on big data. sklearn's GBT is single-process; struggles past a few million rows." }
      ]),
      E("Your turn — train at scale","[CODE] In `dist/04_mllib.ipynb`:\n1. Train LinearRegression + GBT on the taxi data via MLlib Pipeline.\n2. Compute RMSE + R² on test.\n3. Save the GBT model with PipelineModel.\n4. Markdown: how many rows did you train on, and how long did GBT take?")
    ]),
    D(5,"Runtime comparison","Pandas vs Dask vs Spark — by query type.",[
      L("Building the decision matrix",
"## What it is\n" +
"Today you systematise the comparison. Run a small benchmark suite of common operations across all three engines. Build a decision matrix the next-time-you ships from.\n\n" +
"## The benchmark suite\n" +
"```text\n" +
"1. SIMPLE GROUPBY (one column, one aggregate)\n" +
"   df.groupby('col_a')['col_b'].mean()\n" +
"\n" +
"2. MULTI-COLUMN GROUPBY with multiple aggregates\n" +
"   df.groupby(['col_a','col_b']).agg({'col_c':'sum', 'col_d':'mean'})\n" +
"\n" +
"3. JOIN of two large tables\n" +
"   df_a.merge(df_b, on='key')\n" +
"\n" +
"4. WINDOW function\n" +
"   df['rolling'] = df.groupby('user')['amount'].transform(lambda x: x.rolling(7).mean())\n" +
"\n" +
"5. STRING / TEXT operation at scale\n" +
"   df['col'].str.contains('pattern')\n" +
"\n" +
"6. ML training (linear regression)\n" +
"```\n\n" +
"For each operation, on the same data, record:\n" +
"- wall-clock time\n" +
"- peak memory\n" +
"- (if relevant) lines of code\n\n" +
"## Sample table\n" +
"```markdown\n" +
"| Operation              | pandas  | Dask    | Spark   | Winner    |\n" +
"|------------------------|---------|---------|---------|-----------|\n" +
"| Simple groupby         |  3s     |  4s     | 12s     | pandas    |\n" +
"| Multi-col groupby      | 12s     |  8s     | 18s     | Dask      |\n" +
"| Join of two big tables | OOM     | 22s     | 26s     | Dask/Sp   |\n" +
"| Window function        |  8s     | 11s     | 9s      | pandas/Sp |\n" +
"| String at scale (30M)  |  41s    | 18s     | 16s     | Spark/Dask|\n" +
"| Linear regression      |  N/A    | N/A     | 40s     | Spark     |\n" +
"```\n\n" +
"(Numbers vary wildly by machine — record yours.)\n\n" +
"## The patterns you'll see\n" +
"```text\n" +
"- Pandas wins on small data + simple ops (no overhead).\n" +
"- Pandas OOMs on joins of two big tables (try to load both at once).\n" +
"- Dask + Spark win on memory-constrained ops; cost: startup time.\n" +
"- Spark wins on training large-data ML; Dask offers Dask-ML but with caveats.\n" +
"- For exploration: pandas. For production / huge data: Spark. Middle ground: Dask.\n" +
"```\n\n" +
"## What this is good for\n" +
"- Stops you reaching for Spark when pandas would do\n" +
"- Stops you stuck in pandas when memory is the actual bottleneck\n" +
"- Gives you the DATA to argue for the right tool in a real team\n\n" +
"## The blog material this generates\n" +
"A benchmark table + 'when to pick what' guidance is a high-traffic post for DS readers. Genuine educational value; gets bookmarks."
      ),
      S([
        { prompt: "Benchmark tables of pandas vs Dask vs Spark on YOUR machine are more useful than someone else's blog post numbers.", answer: true, whenRight: "Right — your benchmarks include your hardware, your data shape, your environment. Someone else's are for theirs.", whenWrong: "Yes — your own measurements. Others' numbers are useful as context, not decisions." },
        { prompt: "Pandas usually wins on simple ops when the data fits in memory.", answer: true, whenRight: "Right — no distribution overhead. Dask + Spark add fixed startup cost that doesn't pay off at small scale.", whenWrong: "Yes — pandas for small data + simple ops. Distribution earns its keep only past a threshold." },
        { prompt: "If Spark trains a model faster than pandas/sklearn, Spark is always the right pick.", answer: false, whenRight: "Right — no. Spark adds ops complexity (cluster, monitoring, debugging). Speed is one factor; team + deploy fit matter.", whenWrong: "Speed alone doesn't decide. Operational fit + team familiarity + ecosystem matter." }
      ]),
      E("Your turn — benchmark","[CODE] In `dist/05_benchmark.ipynb`:\n1. Run the 6-operation suite in pandas, Dask, Spark.\n2. Time each. Record peak memory where possible.\n3. Build the table.\n4. Markdown the 'when to pick what' guidance in `dist/DECISION.md`.")
    ]),
    D(6,"Scaling decision rules","When is each right?",[
      L("The scaling-decision framework",
"## What it is\n" +
"A short, decisive document that codifies WHEN to scale up (bigger machine) vs scale out (cluster) vs do nothing.\n\n" +
"## The decision tree\n" +
"```text\n" +
"Q1: Does your data fit in 32GB RAM?\n" +
"      YES → pandas + a 32GB machine. STOP.\n" +
"      NO  → Q2.\n" +
"\n" +
"Q2: Does it fit in 128GB RAM (single big cloud VM)?\n" +
"      YES → pandas/polars on a 128GB VM ($1-3/hr on demand). STOP.\n" +
"      NO  → Q3.\n" +
"\n" +
"Q3: Are you doing AD-HOC ANALYTICS (one-off queries, exploration)?\n" +
"      YES → BigQuery / Snowflake / Athena. Don't deploy Spark for this.\n" +
"      NO  → Q4.\n" +
"\n" +
"Q4: Are you doing RECURRING ETL or distributed ML training?\n" +
"      YES → PySpark (on Databricks / EMR / Synapse). True distributed path.\n" +
"      NO  → reconsider Q1-Q3.\n" +
"```\n\n" +
"## The cost reality at each tier\n" +
"```text\n" +
"32GB local laptop:        $0 marginal\n" +
"32GB cloud VM (24/7):    ~$200/mo\n" +
"128GB cloud VM (24/7):   ~$700/mo  (often $1/hr on-demand for one-off jobs)\n" +
"BigQuery / Snowflake:     pay per query (~$5/TB scanned)\n" +
"Databricks cluster:       $1-5/hr per node, often 4-10 node\n" +
"```\n\n" +
"Most learners and small teams should stay at tier 1-2 until the data + workload truly forces tier 3-4. Most don't.\n\n" +
"## Three RED FLAGS that you've over-scaled\n" +
"```text\n" +
"1. Your Spark cluster sits idle 95% of the time.\n" +
"   → Move to BigQuery / Snowflake (pay per query, no idle cost).\n" +
"\n" +
"2. Your job takes 5 minutes on Spark vs 3 minutes on pandas.\n" +
"   → Distribution overhead > distribution gain. Drop back.\n" +
"\n" +
"3. You have 200GB of data but query 5GB at a time.\n" +
"   → Partition by query dimension; query subsets. Don't scale the engine; scale the query.\n" +
"```\n\n" +
"## Three RED FLAGS that you've UNDER-scaled\n" +
"```text\n" +
"1. Your pandas job OOMs once a week, requiring babysitting.\n" +
"   → Move up. The babysitting time is more expensive than the bigger machine.\n" +
"\n" +
"2. Your job takes 8 hours; coworkers wait on it.\n" +
"   → 8 hours of waiting is more expensive than $50 of cluster time.\n" +
"\n" +
"3. You're sampling the data because the full set is too big.\n" +
"   → If the sample is leading to wrong decisions, scale up the engine.\n" +
"```\n\n" +
"## The document\n" +
"```markdown\n" +
"# Scaling decisions\n" +
"\n" +
"## Current tier\n" +
"<Where this project sits today and why>\n" +
"\n" +
"## Trigger to scale UP\n" +
"- <Specific condition>\n" +
"- e.g.: 'When dataset crosses 30M rows or 6GB compressed.'\n" +
"\n" +
"## Trigger to scale DOWN\n" +
"- <Specific condition>\n" +
"- e.g.: 'If Spark cluster sits idle >70% of the day, move to BigQuery.'\n" +
"\n" +
"## What I'd choose for a NEW project today\n" +
"<Default starting tier + criteria for tier promotion>\n" +
"```\n\n" +
"## Why this document is portfolio gold\n" +
"Most DS candidates think distributed = sophisticated. Senior DS candidates know distributed = appropriate-to-scale. Writing this document signals you understand the difference."
      ),
      S([
        { prompt: "If your dataset fits in 32GB RAM, pandas + a 32GB machine is usually the right choice.", answer: true, whenRight: "Right — no distribution overhead, full pandas ecosystem, fastest iteration. Don't over-engineer.", whenWrong: "Yes — pandas wins under RAM limits. Distribute only when you must." },
        { prompt: "A Spark cluster that sits idle 95% of the time is a sign you SHOULD scale up to a bigger cluster.", answer: false, whenRight: "Right — opposite. Idle cluster = move to query-based pricing (BigQuery / Snowflake) or scale down.", whenWrong: "Idle = over-provisioned. Move to pay-per-query or scale DOWN. Idle cluster = wasted money." },
        { prompt: "Knowing when NOT to use Spark is at least as valuable as knowing how to use Spark.", answer: true, whenRight: "Right — that's the senior signal. Junior reaches for sophisticated tools; senior picks the right tool.", whenWrong: "Yes — judgment > sophistication. The senior conversation is about fit, not buzzwords." }
      ]),
      E("Your turn — decision doc","[WRITE] In `dist/SCALING.md`:\n1. Follow the template (current tier, triggers to scale up/down, default for new project).\n2. Apply it: where would YOUR capstone sit?\n3. Where would TaxiPulse W26 sit (you ran it on BigQuery for a reason)?\n4. Be specific.")
    ]),
    D(7,"Tag dist-shipped","Push the comparison + blog.",[
      L("Shipping the distributed milestone",
"## What goes in the repo\n" +
"```text\n" +
"dist/\n" +
"  01_dask.ipynb         # Dask first run\n" +
"  02_spark.ipynb        # PySpark first run\n" +
"  03_compare.ipynb      # same query, three engines\n" +
"  04_mllib.ipynb        # distributed training\n" +
"  05_benchmark.ipynb    # 6-operation benchmark suite\n" +
"  RUNTIME.md            # benchmark table\n" +
"  DECISION.md           # 'when to pick what'\n" +
"  SCALING.md            # decision-tree document\n" +
"```\n\n" +
"## The blog post (~1000 words)\n" +
"```text\n" +
"1. Hook — 'I ran the same query in pandas, Dask, and Spark on 30M rows.\n" +
"           Here's when each one wins.'\n" +
"2. The setup — dataset, machine, methodology\n" +
"3. The benchmark table — the 6-operation comparison\n" +
"4. The patterns — what surprised me + what didn't\n" +
"5. The decision tree — when to scale up vs scale out vs scale at all\n" +
"6. The senior take — knowing when NOT to use Spark\n" +
"7. Repo + scaling doc links\n" +
"```\n\n" +
"This kind of post gets traffic and bookmarks because most DS readers face the same question.\n\n" +
"## Tag and ship\n" +
"```bash\n" +
"git add dist/\n" +
"git commit -m \"Distributed ML: pandas vs Dask vs Spark benchmark + scaling decision tree\"\n" +
"git tag dist-shipped\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## Why this is hireable\n" +
"Most candidates either avoid distributed work or jump straight to Spark without thinking. You've shown:\n" +
"- Working knowledge of all three engines on real data\n" +
"- Measured, defensible runtime comparisons\n" +
"- The judgment to know WHEN distribution earns its complexity\n\n" +
"That last one is the senior signal. Interviewers ask 'when would you use Spark?' to distinguish learners from seniors. You have the answer ready, with numbers."
      ),
      S([
        { prompt: "The benchmark + decision tree make 'when would you use Spark?' an interview question with a prepared, data-backed answer.", answer: true, whenRight: "Right — most candidates wave hands; you bring numbers and a decision tree. Senior signal.", whenWrong: "Yes — concrete answer. Hand-waving loses; data-backed answer wins." },
        { prompt: "Writing a 'when NOT to use Spark' section in the blog post weakens the project.", answer: false, whenRight: "Right — no. Knowing the limits of a tool signals more depth than knowing only how to use it.", whenWrong: "Strengthens it. The senior conversation is about tradeoffs; show you understand them." },
        { prompt: "Three engines + benchmark + decision doc is a stronger distributed-ML portfolio piece than 'I deployed Spark on Databricks'.", answer: true, whenRight: "Right — judgment + measurement > 'I used the trendy tool'. Demonstrates thinking, not just doing.", whenWrong: "Yes — depth + judgment > 'I used the trendy tool'. Interviewers respect documented thinking." }
      ]),
      E("Your turn — ship dist-shipped","[PRODUCE] 1. Write the blog post; publish on dev.to.\n2. Commit + tag:\n`git add dist/ && git commit -m 'dist-shipped' && git tag dist-shipped && git push --tags`\n\nPASS:\n[x] Dask notebook + Spark notebook + comparison notebook\n[x] MLlib training notebook\n[x] Benchmark notebook + RUNTIME.md table\n[x] DECISION.md + SCALING.md\n[x] Blog post published\n[x] dist-shipped tag pushed")
    ])
  ]
};

/* ════ WEEK 43 — Privacy and Differential Privacy ════ */
const W43 = {
  number: 43, title: "Privacy and Differential Privacy - the senior-DS topic nobody teaches",
  phase: "Specialty", commitment_hours: "8-10",
  context: ds.weeks[42].context,
  concept_check: [
    { q: "Why is 'just remove names from the dataset' not enough for privacy?",
      choices: ["Names matter","Combinations of supposedly anonymous fields (zip + birth date + sex) re-identify ~87% of US adults uniquely. 'Anonymous' datasets have been re-identified repeatedly (Netflix Prize, AOL search logs, NYC taxi medallions)",
        "Aesthetic","Random"],
      correct: 1, explain: "The Sweeney result (2000) showed that ZIP + birth date + sex alone uniquely identifies most US adults. The Netflix Prize dataset was de-anonymized by cross-referencing with IMDB ratings. AOL's 'anonymous' search logs identified specific users. Re-identification is the rule, not the exception. Anonymization isn't privacy; it's the appearance of privacy. Differential privacy is the rigorous fix." },
    { q: "What does ε (epsilon) mean in differential privacy?",
      choices: ["Greek letter","ε is the privacy budget — how much your query's output can differ depending on whether ANY single individual is in the dataset. Smaller ε = more privacy + more noise; larger ε = less privacy + less noise. Real systems use ε between 0.1 and 10",
        "Just notation","Random"],
      correct: 1, explain: "The formal definition: a mechanism M is ε-differentially-private if for any two datasets differing by one row, the output distributions differ by at most a factor of e^ε. Practically: ε quantifies the worst-case information leak from including/excluding any individual. ε=0.1 is very private (heavy noise, US Census uses this kind of budget); ε=10 is barely private (almost no noise). The choice IS the privacy policy." },
    { q: "Why does DP-SGD (the differentially private optimizer) add noise to gradients, not to data?",
      choices: ["Random","Adding noise to the gradient at each step adds noise to whatever the model learns FROM each user — it limits how much any single user's data can influence the final weights, providing per-example DP guarantees on the trained model itself",
        "Speed","Tradition"],
      correct: 1, explain: "DP-SGD adds calibrated noise to clipped gradients during each training step. The mathematical guarantee: no single training example can shift the final model parameters by more than ε. Adding noise to data (input perturbation) gives weaker guarantees and worse utility. Adding noise to gradients is what gives modern DP-trained models meaningful privacy without destroying accuracy." }
  ],
  days: [
    D(1,"Why privacy","Re-identification case studies. The end of 'just anonymize'.",[
      L("Re-identification — why 'anonymous' isn't",
"## What it is\n" +
"The naive approach to privacy: remove names, addresses, social security numbers. Call the result 'anonymous'. Release.\n\n" +
"For three decades, this has been demonstrably broken — but it's still the default in most organizations.\n\n" +
"## Case 1 — Sweeney (2000)\n" +
"Latanya Sweeney showed that ZIP code + date of birth + sex uniquely identifies about 87% of US adults. She purchased the 'anonymized' Massachusetts state employee medical records and identified the governor's records by cross-referencing voter rolls.\n\n" +
"```text\n" +
"Anonymized record:  ZIP 02138, born 1945-07-31, male\n" +
"Voter roll:         William Weld, 02138, born 1945-07-31, male, governor\n" +
"```\n\n" +
"## Case 2 — Netflix Prize (2008)\n" +
"Netflix released an 'anonymized' dataset: 100M ratings, 500k users (user IDs replaced with numbers). Narayanan + Shmatikov cross-referenced ratings with public IMDB profiles. Identified specific users by their ratings of obscure films.\n\n" +
"Result: lawsuit, dataset withdrawn, no second Netflix Prize. The technique now has a name: linkage attack.\n\n" +
"## Case 3 — NYC Taxi Medallions (2014)\n" +
"NYC released 'anonymized' taxi trip data. Researchers reversed the hash on medallion numbers (the hash space was small enough to brute-force) and identified individual drivers' entire 2013 trip history — including drivers' homes inferred from end-of-shift trips.\n\n" +
"## Case 4 — AOL Search Logs (2006)\n" +
"AOL released 'anonymized' search queries from 650k users (user IDs replaced with numbers). The New York Times identified specific user 4417749 (Thelma Arnold) from her searches for nearby businesses + family members' names.\n\n" +
"## The pattern\n" +
"Across decades + industries: anonymization is the appearance of privacy, not actual privacy. Auxiliary data is everywhere; combination attacks are cheap; reidentification is the rule.\n\n" +
"## What this means for your data\n" +
"```text\n" +
"Every dataset you have worked with this year contained real information\n" +
"about real entities — taxi trips, Reddit posts, electricity meters,\n" +
"customer records. Treat them all as 'potentially re-identifiable'.\n" +
"\n" +
"Especially: if you train a model on private data, the MODEL ITSELF can\n" +
"leak information — membership inference attacks (Shokri 2017) can tell\n" +
"whether a specific person's data was in the training set.\n" +
"```\n\n" +
"## This week\n" +
"The structured fix for these failures is **differential privacy**: a mathematical framework that GUARANTEES limits on what any output can reveal about any individual. By Friday you'll have implemented:\n" +
"- A DP count query (Day 3)\n" +
"- A DP-SGD trained model (Day 4)\n" +
"- Awareness of federated learning (Day 5)\n" +
"- A PRIVACY.md document for one project (Day 6)\n" +
"- Tagged + shipped (Day 7)"
      ),
      V("How they unmasked the Netflix Prize winners","https://www.youtube.com/watch?v=KkX_zSZHL0M",10,"various","Watch first. Walks through the Narayanan + Shmatikov de-anonymization. Concrete, visceral, the kind of example that lands."),
      S([
        { prompt: "Removing names + IDs is sufficient privacy for releasing a dataset publicly.", answer: false, whenRight: "Right — no. Sweeney, Netflix Prize, AOL, NYC taxis — re-identification is the rule, not the exception.", whenWrong: "Wrong — anonymization is the appearance of privacy. Linkage attacks defeat it across decades + industries." },
        { prompt: "A trained model can leak information about specific training examples (membership inference attack).", answer: true, whenRight: "Right — Shokri 2017 demonstrated this. The model itself is a privacy vector, not just the data.", whenWrong: "Yes — models leak. Membership inference attacks can identify whether a specific user's data was in the training set." },
        { prompt: "Differential privacy is a mathematical framework with formal guarantees, not just a heuristic.", answer: true, whenRight: "Right — provable bounds on information leakage per query. The fix that actually works.", whenWrong: "Yes — formal framework. Proves the worst-case leakage; no hand-waving." }
      ]),
      E("Your turn — frame privacy","[WRITE] In `privacy/INTRO.md`:\n1. Summarise ONE re-identification case study in your own words.\n2. Pick ONE of your past projects. Name the privacy risk if its data were released today.\n3. State the week's goal: 'I will implement DP query + DP-trained model + write PRIVACY.md for one project.'")
    ]),
    D(2,"Differential privacy intuition","Without math.",[
      L("DP in plain English",
"## The core idea\n" +
"Differential privacy says: the OUTPUT of any query / model should be essentially the SAME whether or not any specific individual is in the dataset.\n\n" +
"```text\n" +
"Dataset D₁ = 1000 people (Alice included)\n" +
"Dataset D₂ = 999 people (same, minus Alice)\n" +
"\n" +
"DP guarantee: any query Q must satisfy:\n" +
"   Q(D₁) and Q(D₂) are statistically indistinguishable\n" +
"   (their output distributions differ by at most a factor of e^ε)\n" +
"```\n\n" +
"If that holds, an attacker observing Q's output learns essentially nothing about Alice. Whether she's in or out, the answer looks the same.\n\n" +
"## How you achieve it\n" +
"Add CALIBRATED NOISE to the query result. The noise size is calibrated to the SENSITIVITY of the query (how much one person can change it) and the desired privacy budget ε.\n\n" +
"```text\n" +
"True count: 532\n" +
"Sensitivity: 1 (each person changes count by ≤ 1)\n" +
"ε = 1 → Laplace noise scale = 1\n" +
"Noisy count: 532 + Laplace(scale=1) = 531.7\n" +
"```\n\n" +
"That answer is close enough to 532 to be useful; the noise is enough to make Alice's presence ambiguous.\n\n" +
"## The privacy budget — the only knob that matters\n" +
"```text\n" +
"ε (epsilon) is the privacy budget. Smaller = more privacy + more noise.\n" +
"\n" +
"ε = 0.1   very private. Heavy noise. US Census uses this kind of budget.\n" +
"ε = 1     a good default for most applications.\n" +
"ε = 10    weak privacy. Useful as research baseline but not for production.\n" +
"```\n\n" +
"There's no 'right' ε — it's a privacy policy decision, not a technical one.\n\n" +
"## Composition — privacy budgets add up\n" +
"```text\n" +
"Run 5 queries each at ε = 0.2 → total ε ≤ 1.0\n" +
"Train a model with DP-SGD for 100 steps each at ε = 0.01 → total ε ≤ 1.0\n" +
"```\n\n" +
"Composition is why production DP systems carefully ALLOCATE budget across queries. Run too many noisy queries; the total budget drains away; privacy is lost.\n\n" +
"## What DP does NOT do\n" +
"- Doesn't prevent legitimate aggregate insights — that's the whole point\n" +
"- Doesn't replace data minimization (don't collect what you don't need)\n" +
"- Doesn't fix bad-actor INPUT (if Alice told you she has cancer, you knew it)\n" +
"- Doesn't apply retroactively to data already released non-DP\n\n" +
"## Production deployments of DP (real)\n" +
"- **US Census 2020** — entire census released with DP. ε=1 effective. Heavy controversy + iteration.\n" +
"- **Apple iOS telemetry** — DP for emoji preferences, browser bug reporting.\n" +
"- **Google Chrome (RAPPOR)** — DP for usage statistics.\n" +
"- **Microsoft Windows telemetry** — DP for crash reports.\n\n" +
"These aren't research papers. They're how real privacy-preserving data collection works in 2025-2026."
      ),
      V("Differential Privacy — visually","https://www.youtube.com/watch?v=4nqbITGcqjk",12,"various","Watch first. 12-min visual explainer of ε, Laplace mechanism, composition. The intuition before code."),
      S([
        { prompt: "Smaller ε means MORE noise added to outputs (stronger privacy).", answer: true, whenRight: "Right — smaller budget = tighter constraint = more noise. Inverse relationship.", whenWrong: "Yes — smaller ε = more noise = more privacy. Counter-intuitive name; that's the convention." },
        { prompt: "Differential privacy guarantees that an attacker can learn nothing about an individual from a query output.", answer: true, whenRight: "Right — formal guarantee. Whether Alice is in or out, the output distribution is indistinguishable.", whenWrong: "Yes — formal indistinguishability. The attacker observing Q's output can't tell Alice's presence." },
        { prompt: "If you run 10 queries each with ε=0.1, the total privacy cost is ε=0.1.", answer: false, whenRight: "Right — no. Composition adds: 10 × 0.1 = 1.0. That's why production DP carefully budgets across queries.", whenWrong: "Composition. Privacy budgets accumulate across queries; that's the only constraint you can't cheat." }
      ]),
      E("Your turn — intuition write-up","[WRITE] In `privacy/INTUITION.md`:\n1. Explain DP in 3 sentences in your own words.\n2. Name the role of ε.\n3. Explain composition with a small example (3 queries × ε=0.3 → total ε≤0.9).\n4. Name one real production DP deployment.")
    ]),
    D(3,"DP count query","Add Laplace noise to a real count.",[
      L("The Laplace mechanism — the simplest DP primitive",
"## What it is\n" +
"For any query whose sensitivity is bounded (each individual can change the answer by at most Δ), add Laplace noise with scale Δ/ε. The result is ε-differentially-private.\n\n" +
"```text\n" +
"DP_query(D) = TrueQuery(D) + Laplace(scale = Δ/ε)\n" +
"```\n\n" +
"Counts have sensitivity 1 (each person changes the count by at most 1). Sums of values bounded to [0, B] have sensitivity B. Etc.\n\n" +
"## A worked example\n" +
"```python\n" +
"import numpy as np\n\n" +
"def laplace_mechanism(true_value, sensitivity, epsilon):\n" +
"    scale = sensitivity / epsilon\n" +
"    noise = np.random.laplace(loc=0, scale=scale)\n" +
"    return true_value + noise\n\n" +
"true_count = 532\n" +
"# Single query at ε=1.0:\n" +
"noisy = laplace_mechanism(true_count, sensitivity=1, epsilon=1.0)\n" +
"print(f'noisy count: {noisy:.1f}')\n" +
"# noisy count: 531.7  (or anywhere in the noise band)\n\n" +
"# Show the noise distribution:\n" +
"samples = [laplace_mechanism(true_count, 1, 1.0) for _ in range(10000)]\n" +
"print(f'noisy mean: {np.mean(samples):.2f}, std: {np.std(samples):.2f}')\n" +
"# noisy mean: 531.99, std: 1.41   <- centered on truth; ~1.4 std for ε=1\n" +
"```\n\n" +
"## Apply to a real query\n" +
"Take your capstone (or any project) dataset. Pick a count or aggregate that would be sensitive in a real release:\n" +
"```python\n" +
"# Example: count of users in a sensitive subgroup\n" +
"# (e.g., users who clicked a stigmatized category)\n" +
"true_count = (df['category'] == 'sensitive_x').sum()\n" +
"\n" +
"for eps in [0.1, 1.0, 10.0]:\n" +
"    noisy = laplace_mechanism(true_count, sensitivity=1, epsilon=eps)\n" +
"    print(f'ε={eps:5.1f}: true={true_count} noisy={noisy:.1f}')\n" +
"# ε=0.1 : true=841 noisy=853.2    <- heavy noise; private\n" +
"# ε=1.0 : true=841 noisy=841.6    <- meaningful; private enough for analytics\n" +
"# ε=10.0: true=841 noisy=840.9    <- light noise; weak privacy\n" +
"```\n\n" +
"## The utility tradeoff\n" +
"```text\n" +
"ε=0.1:  noise std ≈ 10   → if the true count is 50, the noise dominates\n" +
"ε=1.0:  noise std ≈  1   → if the true count is 50, noise is small but visible\n" +
"ε=10:   noise std ≈ 0.1  → noise basically invisible; privacy basically gone\n" +
"```\n\n" +
"For SMALL counts the same ε feels less private; for LARGE counts the same ε feels more private. The mathematical guarantee is the same; the utility-vs-privacy intuition shifts with the question scale.\n\n" +
"## Build a 'DP analytics' helper\n" +
"```python\n" +
"def dp_count(df, condition, epsilon):\n" +
"    true_count = condition(df).sum()\n" +
"    return laplace_mechanism(true_count, sensitivity=1, epsilon=epsilon)\n\n" +
"def dp_sum(df, column, bound, epsilon):\n" +
"    # Clip to [0, bound] so sensitivity = bound\n" +
"    true_sum = df[column].clip(0, bound).sum()\n" +
"    return laplace_mechanism(true_sum, sensitivity=bound, epsilon=epsilon)\n" +
"```\n\n" +
"That tiny library is enough for most simple DP analytics. Real-world DP libraries (Google's diffprivlib, OpenDP) add more mechanisms but the Laplace pattern is the core.\n\n" +
"## The diffprivlib library (the production-grade version)\n" +
"```python\n" +
"# pip install diffprivlib\n" +
"from diffprivlib.mechanisms import Laplace\n\n" +
"m = Laplace(epsilon=1.0, sensitivity=1)\n" +
"noisy = m.randomise(532)\n" +
"```\n\n" +
"Same math, more mechanisms, better testing. Use for anything beyond a tutorial."
      ),
      S([
        { prompt: "The Laplace mechanism adds noise with scale = sensitivity / ε to make a query ε-DP.", answer: true, whenRight: "Right — Δ/ε is the noise calibration. Bigger sensitivity OR smaller ε = more noise.", whenWrong: "Yes — scale = Δ/ε. The whole math of the Laplace mechanism." },
        { prompt: "For SMALL true values, the SAME ε feels less private because the noise is similar in size to the value.", answer: true, whenRight: "Right — utility intuition shifts with scale. Math is the same; perceived privacy shifts with the question size.", whenWrong: "Yes — small values + same noise = relatively more obvious. Same ε, different perceived strength." },
        { prompt: "For a count query (each person contributes 0 or 1), the sensitivity is 1.", answer: true, whenRight: "Right — one person changes count by at most 1. Sensitivity = max change from any one individual.", whenWrong: "Yes — count sensitivity is 1. Bounded sums have sensitivity = bound." }
      ]),
      E("Your turn — DP query","[CODE] In `privacy/01_dp_count.ipynb`:\n1. Implement laplace_mechanism + dp_count.\n2. Run on a real (or simulated) count from one of your past projects.\n3. Run at ε ∈ {0.1, 1, 10}; show the noisy result + utility tradeoff.\n4. Histogram the noise distribution at ε=1, 10k samples.\n5. Markdown: at what ε does the answer become unusable for the question you're asking?")
    ]),
    D(4,"DP-SGD with Opacus","Train one model privately.",[
      L("DP-SGD — making the trained model itself private",
"## What it is\n" +
"Differentially private stochastic gradient descent. Same training loop you already know, with two added steps per batch:\n\n" +
"```text\n" +
"Standard SGD:\n" +
"  1. Compute gradients on a batch\n" +
"  2. Update weights\n" +
"\n" +
"DP-SGD:\n" +
"  1. Compute PER-EXAMPLE gradients in the batch\n" +
"  2. CLIP each per-example gradient to bounded norm (sensitivity = clip)\n" +
"  3. SUM clipped gradients + Gaussian noise\n" +
"  4. Update weights\n" +
"```\n\n" +
"That's it. Per-example clipping makes each user's influence bounded; Gaussian noise prevents any user's gradients from being recoverable from the update.\n\n" +
"## Opacus (the PyTorch implementation)\n" +
"```python\n" +
"# pip install opacus\n" +
"import torch\n" +
"import torch.nn as nn\n" +
"from torch.utils.data import DataLoader\n" +
"from opacus import PrivacyEngine\n\n" +
"model = nn.Sequential(\n" +
"    nn.Linear(10, 64), nn.ReLU(),\n" +
"    nn.Linear(64, 32), nn.ReLU(),\n" +
"    nn.Linear(32, 1),\n" +
")\n" +
"optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)\n" +
"loss_fn = nn.BCEWithLogitsLoss()\n\n" +
"train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)\n\n" +
"# Wrap with DP\n" +
"privacy_engine = PrivacyEngine()\n" +
"model, optimizer, train_loader = privacy_engine.make_private_with_epsilon(\n" +
"    module=model,\n" +
"    optimizer=optimizer,\n" +
"    data_loader=train_loader,\n" +
"    epochs=10,\n" +
"    target_epsilon=1.0,        # privacy budget\n" +
"    target_delta=1e-5,         # δ — small failure probability\n" +
"    max_grad_norm=1.0,         # gradient clipping\n" +
")\n\n" +
"for epoch in range(10):\n" +
"    for x, y in train_loader:\n" +
"        optimizer.zero_grad()\n" +
"        loss = loss_fn(model(x).squeeze(), y.float())\n" +
"        loss.backward()\n" +
"        optimizer.step()\n" +
"    eps = privacy_engine.get_epsilon(target_delta=1e-5)\n" +
"    print(f'epoch {epoch+1}: ε = {eps:.2f}')\n" +
"```\n\n" +
"## What you'll see\n" +
"```text\n" +
"epoch  1: ε = 0.22\n" +
"epoch  2: ε = 0.31\n" +
"epoch  3: ε = 0.39\n" +
"...\n" +
"epoch 10: ε = 0.98     <- under target_epsilon=1.0\n" +
"```\n\n" +
"Opacus tracks the privacy budget as you train. When you hit the target ε, stop training; the model is ε-DP for that budget.\n\n" +
"## The utility cost\n" +
"DP-trained models are LESS accurate than non-DP models, especially at small ε:\n" +
"```text\n" +
"Non-private:           AUC 0.879\n" +
"DP-SGD ε=1.0:          AUC 0.832   (-5pt cost)\n" +
"DP-SGD ε=0.1:          AUC 0.751   (-13pt cost)\n" +
"```\n\n" +
"This is the privacy/utility tradeoff in numbers. For very sensitive applications (medical, financial), the cost is acceptable. For low-stakes analytics, often not worth it.\n\n" +
"## What DP-SGD prevents\n" +
"- **Membership inference**: attackers can't reliably tell if a specific user's data was in the training set\n" +
"- **Model inversion**: attackers can't reconstruct training examples from the model\n" +
"- **Data extraction**: GPT-style 'tell me memorised training text' attacks lose effectiveness\n\n" +
"## When DP-SGD makes sense\n" +
"```text\n" +
"✓ Model trained on data that contains personal information\n" +
"✓ Model will be released publicly or queried by untrusted parties\n" +
"✓ Privacy guarantees are required by regulation (HIPAA, GDPR Art.25)\n" +
"\n" +
"✗ Internal model on aggregate, non-personal data → DP-SGD is overkill\n" +
"✗ Highly accurate models on small data → DP cost may dominate utility\n" +
"```\n\n" +
"## The δ (delta) parameter\n" +
"You'll see (ε, δ)-DP rather than pure ε-DP for DP-SGD. δ is a small probability of failure (typical 10⁻⁵). For privacy: δ < 1/N (where N is the dataset size) is the usual guidance."
      ),
      S([
        { prompt: "DP-SGD clips per-example gradients to bound the influence of any single training example.", answer: true, whenRight: "Right — per-example clipping = bounded sensitivity. The gradients each user contributes are capped in size.", whenWrong: "Yes — per-example clipping is the sensitivity bound. Without it, one outlier dominates the gradient + leaks information." },
        { prompt: "Opacus tracks the cumulative privacy budget (ε) as training proceeds, letting you stop when you hit your target.", answer: true, whenRight: "Right — accounting tracks the budget. Stop training when ε hits target; the model is ε-DP for that budget.", whenWrong: "Yes — privacy accountant runs alongside training. ε grows; stop when target is reached." },
        { prompt: "DP-SGD trained models always match the accuracy of non-private models.", answer: false, whenRight: "Right — no. Noise + clipping cost accuracy, especially at small ε. The privacy / utility tradeoff is real.", whenWrong: "Wrong — accuracy cost is real. 5-15pt loss is typical depending on ε. Tradeoff is the whole point." }
      ]),
      E("Your turn — DP-SGD","[CODE] In `privacy/02_dp_sgd.ipynb`:\n1. `pip install opacus`.\n2. Pick a tabular dataset (Adult Income works).\n3. Train a small NN classifier WITHOUT DP. Record AUC.\n4. Re-train with DP-SGD at ε ∈ {0.1, 1, 10}. Record AUC for each.\n5. Plot privacy budget vs AUC curve.\n6. Markdown: at what ε does utility become unacceptable?")
    ]),
    D(5,"Federated learning","The intuition (no big implementation).",[
      L("Federated learning — when the data CAN'T leave the device",
"## What it is\n" +
"Standard ML: all training data goes to a central server, you train, you deploy.\n" +
"Federated learning: training data STAYS on user devices; the model travels TO the data; only weight updates flow back.\n\n" +
"```text\n" +
"STANDARD:\n" +
"  device → upload all data → central server → train → deploy model\n" +
"\n" +
"FEDERATED:\n" +
"  server sends model to N devices\n" +
"     each device trains a few epochs on LOCAL data (never uploaded)\n" +
"     each device sends back weight UPDATES (small)\n" +
"  server AGGREGATES the updates (FedAvg)\n" +
"  repeat for many rounds\n" +
"```\n\n" +
"## Where it's actually deployed\n" +
"- **Apple QuickType keyboard** — your typing data trains the next-word predictor without leaving your phone\n" +
"- **Google Gboard** — same pattern, Android scale\n" +
"- **Hospitals collaborating on diagnostic models** — patient data stays in each hospital; the model is co-trained\n" +
"- **Cross-org fraud detection** — banks share model improvements without sharing transactions\n\n" +
"## The fedavg algorithm (simplest version)\n" +
"```python\n" +
"# Pseudocode\n" +
"def federated_round(server_model, devices, lr=0.01):\n" +
"    updates = []\n" +
"    for device in devices:\n" +
"        # Each device trains locally\n" +
"        local_model = copy.deepcopy(server_model)\n" +
"        for batch in device.local_data:\n" +
"            local_model.fit(batch, lr=lr)\n" +
"        update = local_model.weights - server_model.weights\n" +
"        updates.append((device.n_samples, update))\n" +
"    \n" +
"    # Server aggregates (weighted by sample count)\n" +
"    total_n = sum(n for n, _ in updates)\n" +
"    avg_update = sum(n * u for n, u in updates) / total_n\n" +
"    server_model.weights += avg_update\n" +
"    return server_model\n" +
"```\n\n" +
"## The challenges (why this is hard)\n" +
"```text\n" +
"1. NON-IID DATA — your phone's data ≠ a random sample of all phones'\n" +
"   data. Different users have different distributions. Naive averaging\n" +
"   can produce worse models than centralized training.\n" +
"\n" +
"2. DEVICE DROP-OUT — phones go offline, batteries die. Robust aggregation\n" +
"   has to tolerate participants disappearing mid-round.\n" +
"\n" +
"3. PRIVACY OF UPDATES — model updates can still leak training data\n" +
"   (gradient inversion attacks). Production FL combines with DP-SGD\n" +
"   to protect the updates themselves.\n" +
"\n" +
"4. COMMUNICATION COST — weight updates are MBs per round; thousands of\n" +
"   rounds, millions of devices = lots of data flow.\n" +
"```\n\n" +
"## Tools (for production use, not learner experimentation)\n" +
"- **PySyft** / **Flower** / **TensorFlow Federated** — open-source FL frameworks\n" +
"- Apple + Google built their own internal stacks; not publicly available\n\n" +
"## Why you don't implement it this week\n" +
"Real federated learning requires multiple devices + coordination. Simulating it on a single laptop teaches the algorithm but not the real challenges. The intuition + use cases are the takeaway; production FL is a multi-week speciality of its own.\n\n" +
"## When FL is the right answer\n" +
"- Data is genuinely personal AND cannot be moved (medical, sensitive financial)\n" +
"- You have many devices each with small but meaningful data\n" +
"- Privacy regulation (GDPR Article 25 — Privacy by Design) requires data minimization\n" +
"- You're willing to accept lower accuracy + heavier infrastructure for the privacy gain\n\n" +
"## When FL is overkill\n" +
"- Data already centralized — FL adds infrastructure for nothing\n" +
"- Small number of large-data participants — easier to negotiate a shared dataset\n" +
"- Tight accuracy requirements — FL accuracy costs may be too high"
      ),
      S([
        { prompt: "In federated learning, training data stays on user devices; only model updates travel.", answer: true, whenRight: "Right — that's the whole point. Data minimization at the architecture level.", whenWrong: "Yes — model to data, not data to model. Updates only." },
        { prompt: "Model updates in federated learning are completely safe from leaking training data.", answer: false, whenRight: "Right — no. Gradient inversion attacks can reconstruct examples from updates. Production FL combines with DP-SGD.", whenWrong: "Updates leak too. Combine with DP-SGD for proper guarantees; FL alone is necessary but not sufficient." },
        { prompt: "Federated learning is the right choice when all your data is already centralized.", answer: false, whenRight: "Right — no. FL adds infrastructure for nothing in that case. FL is for when data CAN'T centralize.", whenWrong: "FL solves a specific problem: data can't move. If it can, don't FL — it adds complexity for no privacy gain." }
      ]),
      E("Your turn — federated write-up","[WRITE] In `privacy/FL.md`:\n1. Explain the federated learning idea in 3 sentences.\n2. Name 3 real production deployments (Gboard, QuickType, etc.).\n3. Name 2 specific challenges (non-IID, device drop-out).\n4. State when YOU would choose FL vs centralized training for a hypothetical project.")
    ]),
    D(6,"PRIVACY.md","Add to one project.",[
      L("PRIVACY.md — the document that ships with sensitive models",
"## What it is\n" +
"A single document, living next to the model in the repo, that names:\n" +
"- What personal data the model was trained on\n" +
"- The privacy risk if the model were released\n" +
"- The mitigation applied (DP, aggregation, anonymization, etc.)\n" +
"- The residual risk + when to re-audit\n\n" +
"Same role BIAS.md played in W36, but for privacy.\n\n" +
"## The template\n" +
"```markdown\n" +
"# Privacy audit — <model / dataset name>\n" +
"\n" +
"**Audit date:** YYYY-MM-DD\n" +
"**Auditor:** <name>\n" +
"**Model / dataset version:** <git tag>\n" +
"\n" +
"## What personal data is involved\n" +
"<List every column / data source that contains or proxies personal info.>\n" +
"- user_id (direct identifier)\n" +
"- zip_code (quasi-identifier; combines with birth+sex for re-identification)\n" +
"- ip_address (direct identifier)\n" +
"- session timestamps (behavioral; linkable to other data)\n" +
"\n" +
"## Re-identification risks if released\n" +
"<Specific. With examples like the Sweeney / Netflix / AOL precedents.>\n" +
"\n" +
"## Mitigations applied\n" +
"<List the protections actually in place. Be specific about ε if DP applies.>\n" +
"- Direct identifiers removed (user_id, ip_address) before storage\n" +
"- ZIP code coarsened to first 3 digits before storage\n" +
"- DP aggregations: ε=1 across all reported counts\n" +
"- Model trained with DP-SGD at (ε=1, δ=10⁻⁵)\n" +
"\n" +
"## Residual risk\n" +
"<Honest. What could still leak.>\n" +
"- Behavioral patterns (session timing) are not DP-protected; combining\n" +
"  with auxiliary data might enable re-identification of frequent users\n" +
"- Model outputs can still leak if attacker controls a large sample of\n" +
"  queries (membership inference at scale, even on DP-trained models, is\n" +
"  diminished but not zero)\n" +
"\n" +
"## What I did NOT do (and why)\n" +
"<Named omissions, like BIAS.md's 'groups not audited'.>\n" +
"- No federated training (data was already centralized)\n" +
"- No formal k-anonymity check (DP at ε=1 supersedes)\n" +
"\n" +
"## Stakeholder decisions required\n" +
"<For the team / company to fill in, not the auditor.>\n" +
"- Is the residual behavioral-linkage risk acceptable?\n" +
"- What re-audit cadence (annually? on each retrain?)?\n" +
"\n" +
"## How to reproduce the audit\n" +
"<Commands that re-run the DP analytics + DP-trained model.>\n" +
"```bash\n" +
"make privacy-audit\n" +
"# runs: dp_counts.py, dp_train.py, generates audit report\n" +
"```\n" +
"```\n\n" +
"## Update the project's main README\n" +
"```markdown\n" +
"## 🔒 Privacy\n" +
"\n" +
"This model was trained on data containing personal information about <X>.\n" +
"DP-SGD was applied at (ε=1, δ=10⁻⁵). See [PRIVACY.md](PRIVACY.md) for the\n" +
"full audit including residual risks.\n" +
"\n" +
"**Do not retrain on different data without re-running the privacy audit.**\n" +
"```\n\n" +
"## Why this document is portfolio gold\n" +
"Most ML projects don't have a PRIVACY.md. Most ML candidates can't write one. Producing one — even for a learner project — puts you in a different conversation. Specifically:\n" +
"- Demonstrates you UNDERSTAND privacy as engineering, not legal disclaimer\n" +
"- Shows you can name SPECIFIC mitigations + their ε / δ\n" +
"- Shows you can name RESIDUAL RISKS honestly\n" +
"- Mirrors the audit-document discipline you applied in BIAS.md\n\n" +
"## What separates this from a junior privacy write-up\n" +
"- Specific data inventory (every column, including quasi-identifiers)\n" +
"- Quantified mitigation (ε=1 + δ=10⁻⁵, not 'we anonymized')\n" +
"- Named residual risks (specific attack scenarios, not 'further work')\n" +
"- Named omissions (what wasn't audited + why)\n" +
"- Stakeholder decisions section (auditor vs decision-maker separation)"
      ),
      S([
        { prompt: "A privacy audit document should name specific residual risks, not just say 'data is anonymized'.", answer: true, whenRight: "Right — honest residual risk + specific mitigations build trust. Vague claims read as marketing.", whenWrong: "Yes — specifics + honesty. 'Anonymized' alone is not a privacy claim; ε=1 is." },
        { prompt: "PRIVACY.md should include the COMMANDS to reproduce the privacy audit, not just describe the results.", answer: true, whenRight: "Right — reproducibility same as BIAS.md. Auditable means anyone can re-run.", whenWrong: "Yes — commands + reasoning. Auditable not just describable; same discipline as fairness work." },
        { prompt: "Producing a PRIVACY.md for a learner project is overkill since the data is public.", answer: false, whenRight: "Right — no. The document is the PORTFOLIO signal. Demonstrates you understand privacy as engineering. Even on public data, the practice carries.", whenWrong: "The document is the signal. Practice on public data; the discipline transfers to real work where it matters." }
      ]),
      E("Your turn — PRIVACY.md","[WRITE] 1. Pick ONE of your past projects (capstone is recommended).\n2. Open `privacy/PRIVACY.md` in that project's repo.\n3. Fill EVERY section.\n4. Apply at least ONE specific mitigation (DP count on a sensitive aggregate; OR DP-SGD on the model).\n5. Update the project README with a ⛔ Privacy block.\n6. Commit.")
    ]),
    D(7,"Tag privacy-shipped","Push everything. Roadmap finished.",[
      L("Shipping the privacy specialty — and the whole 43-week roadmap",
"## What goes in the repo\n" +
"```text\n" +
"privacy/\n" +
"  INTRO.md             # framing + re-id case studies\n" +
"  INTUITION.md         # DP intuition + ε + composition\n" +
"  01_dp_count.ipynb    # Laplace mechanism on a real count\n" +
"  02_dp_sgd.ipynb      # DP-trained model with Opacus\n" +
"  FL.md                # federated learning write-up\n" +
"  PRIVACY.md           # the audit document (lives in target project)\n" +
"```\n\n" +
"## The blog post (~1000 words)\n" +
"```text\n" +
"1. Hook — 'I added differential privacy to one of my models. Here's what\n" +
"           ε=1 costs in accuracy — and why I'd pay it on real personal data.'\n" +
"2. Why anonymization fails (Sweeney + Netflix + AOL)\n" +
"3. DP intuition without math (ε as privacy budget)\n" +
"4. The Laplace mechanism in code (with numbers)\n" +
"5. DP-SGD with Opacus — accuracy/privacy curve\n" +
"6. Federated learning (when data can't centralize)\n" +
"7. PRIVACY.md — what an audit document looks like\n" +
"8. When privacy matters in DS work + when it doesn't\n" +
"9. Links\n" +
"```\n\n" +
"## Tag and ship\n" +
"```bash\n" +
"git add privacy/\n" +
"git commit -m \"Privacy specialty: DP analytics + DP-SGD + PRIVACY.md audit document\"\n" +
"git tag privacy-shipped\n" +
"git tag roadmap-all-shipped\n" +
"git push && git push --tags\n" +
"```\n\n" +
"Two tags. `privacy-shipped` for this week. `roadmap-all-shipped` for the full 43-week journey — the structured roadmap (W1-39) PLUS the four specialty deep-dives (W40 RL, W41 Recsys, W42 Distributed, W43 Privacy).\n\n" +
"## What you've built in 43 weeks\n" +
"```text\n" +
"FOUNDATIONS (W1-W21)\n" +
"  - TaxiPulse shipped (W7 v1.0)\n" +
"  - Reddit Sentiment shipped (W17 v1.0)\n" +
"  - SQL, statistics, viz, classical ML, deep learning fundamentals\n" +
"\n" +
"TIME SERIES + PRODUCTION (W21-W30)\n" +
"  - Energy Forecast shipped (W27 v1.0)\n" +
"  - Capstone v0.1 → v1.0 (W28-W30)\n" +
"  - Cloud + BigQuery (W26)\n" +
"\n" +
"PORTFOLIO + INTERVIEW (W31)\n" +
"  - yourname.com live\n" +
"  - Profiles polished\n" +
"  - Interview answers rehearsed\n" +
"\n" +
"MODERN ML (W32-W34)\n" +
"  - LoRA fine-tuned LLM on HuggingFace Hub (W32)\n" +
"  - RAG with hybrid search + citations (W33)\n" +
"  - CV: CNN + ViT + FastAPI + Gradio (W34)\n" +
"\n" +
"SENIOR-DS SKILLS (W35-W36)\n" +
"  - Causal analysis with DAG + PSM + sensitivity (W35)\n" +
"  - Fairness audit with mitigation comparison (W36)\n" +
"\n" +
"CAPSTONE EXTENDED (W37-W39)\n" +
"  - Reproducible pipeline + rigorous evaluation\n" +
"  - Refactor + tests + Docker + deploy\n" +
"  - 3-min demo + 3 pitch versions + interview-ready story\n" +
"\n" +
"SPECIALTY DEEP-DIVES (W40-W43)\n" +
"  - RL + contextual bandits + design doc (W40)\n" +
"  - Three generations of recsys + comparison (W41)\n" +
"  - Pandas vs Dask vs Spark benchmark + decision tree (W42)\n" +
"  - DP analytics + DP-SGD + PRIVACY.md (W43)\n" +
"```\n\n" +
"## What this portfolio looks like to a hiring manager\n" +
"- **6 shipped projects** with live demos, blog posts, repos, retros\n" +
"- **8 tagged milestones**: cloud-aware, lora-shipped, rag-shipped, cv-shipped, causal-shipped, bias-shipped, rl-shipped, recsys-shipped, dist-shipped, privacy-shipped\n" +
"- **Modern ML mastery**: LoRA + RAG + CV + DP-SGD — uncommon combination\n" +
"- **Senior DS judgment**: causal inference, fairness, distributed scaling, privacy — topics most candidates can't speak to\n" +
"- **The story**: 43 weeks of compounding work, documented at every milestone\n\n" +
"## You finished\n" +
"The roadmap is done. Every week shipped. Every retro written. Apply with confidence — your portfolio is more complete than most working DS practitioners' resumes."
      ),
      S([
        { prompt: "Tagging roadmap-all-shipped as a SEPARATE tag from privacy-shipped marks both milestones for posterity.", answer: true, whenRight: "Right — two milestones, two tags. The roadmap completion deserves its own marker.", whenWrong: "Yes — both. Privacy-shipped for the week; roadmap-all-shipped for the 43-week journey." },
        { prompt: "Shipping all 43 weeks puts you in the small minority of self-taught DS learners who actually finish what they start.", answer: true, whenRight: "Right — completion is rare. Most learners abandon at week 12; finishing 43 weeks of structured + specialty work is the differentiator.", whenWrong: "Yes — completion = differentiator. Most candidates have fragments; you have a complete portfolio." },
        { prompt: "The privacy specialty week is required for entry-level DS job applications.", answer: false, whenRight: "Right — no. It's a +1 for roles in regulated industries (health, finance, gov). Strongly differentiating but not required.", whenWrong: "Specialty signal. Required for regulated industries; nice-to-have for others. Doesn't gate applications." }
      ]),
      E("Your turn — ship the roadmap","[PRODUCE] 1. Write the blog post; publish on dev.to.\n2. Commit + double-tag:\n`git add privacy/`\n`git commit -m 'privacy-shipped + roadmap-all-shipped: 43 weeks done'`\n`git tag privacy-shipped`\n`git tag roadmap-all-shipped`\n`git push && git push --tags`\n3. Update yourname.com portfolio site with the privacy + RL + recsys + distributed cards.\n4. Post on LinkedIn: '43 weeks. 6 shipped projects. Done.'\n5. Apply to 10 jobs this week with the full portfolio link.\n\nPASS:\n[x] DP count notebook\n[x] DP-SGD notebook with accuracy/privacy curve\n[x] FL.md write-up\n[x] PRIVACY.md in target project\n[x] Blog post published\n[x] privacy-shipped tag pushed\n[x] roadmap-all-shipped tag pushed\n[x] Portfolio updated\n[x] LinkedIn announcement posted\n\nYou finished. Apply.")
    ])
  ]
};

/* ═══════════════════════════════════════════════════════════
   VALIDATE + WRITE
   ═══════════════════════════════════════════════════════════ */
const newWeeks = [W42, W43];
newWeeks.forEach((w) => {
  if (w.days.length !== 7) throw new Error(`W${w.number}: need 7 days, got ${w.days.length}`);
  if (!w.concept_check || w.concept_check.length !== 3) {
    throw new Error(`W${w.number}: concept_check must have 3 entries`);
  }
  w.days.forEach((d) => {
    const k = d.items.map((i) => i.kind);
    if (!k.includes('lesson'))   throw new Error(`W${w.number} D${d.number}: missing lesson`);
    if (!k.includes('swipe'))    throw new Error(`W${w.number} D${d.number}: missing swipe`);
    if (!k.includes('exercise')) throw new Error(`W${w.number} D${d.number}: missing exercise`);
  });
});

ds.weeks.splice(41, 2, ...newWeeks);

fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log(`SUCCESS — DS W42-W43 rebuilt. Total weeks: ${ds.weeks.length}. ROADMAP COMPLETE.`);
