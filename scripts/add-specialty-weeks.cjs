/**
 * Specialty DS weeks (W40-43) - the topics needed to truly close ALL gaps:
 * RL, Recommender Systems, Distributed ML, Privacy/Differential Privacy.
 * Also: reframe DA W17 so A/B testing applies to the Olist marketing funnel
 * instead of being a stand-alone theory week.
 *
 * Run from repo root:  node scripts/add-specialty-weeks.cjs
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "data", "roadmaps");

// ---------- 4 specialty DS weeks ----------
const DS_NEW = [
  {
    number: 40,
    title: "Reinforcement Learning - the practical intro",
    phase: "Specialty",
    commitment_hours: "6-8",
    context:
      "RL is a specialty most DS jobs do not require - but understanding the basics signals senior depth. This week you implement Q-learning on a toy problem, build a contextual bandit for real recommendations, and learn when RL is the right tool (rarely) vs the wrong tool (usually).",
    topics: [
      "Markov Decision Processes (MDPs) in plain language",
      "Q-learning - the foundational algorithm",
      "Exploration vs exploitation tradeoff",
      "Contextual bandits - the practical RL most companies actually use",
      "Policy gradient intuition (no math)",
      "When RL is the wrong tool",
    ],
    tasks: [
      "Implement Q-learning on CartPole (gymnasium)",
      "Build a 4-arm contextual bandit for ad selection (synthetic)",
      "Compare epsilon-greedy vs UCB exploration strategies",
      "Document one real-world bandit use case (newsfeed, recs, A/B routing)",
    ],
    outputs: [
      "rl-intro repo with notebook + bandit implementation",
      "WHEN_RL.md - your decision rules for RL vs supervised vs heuristic",
    ],
    project:
      "RL-Intro - a working contextual bandit. The minimum viable RL portfolio piece for any DS role that wants to see breadth.",
    resources: [
      {
        label: "RL in 5 minutes - what it actually is (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=reinforcement+learning+5+minutes+overview",
        note: "5 min. Skip if you watched David Silver's lectures - else watch first.",
      },
      {
        label: "Q-learning intuition in 15 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=Q+learning+explained+15+minutes+CartPole",
        note: "15 min. The original RL algorithm. The intuition that scales.",
      },
      {
        label: "Multi-armed bandits in 12 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=multi+armed+bandit+epsilon+greedy+UCB+tutorial",
        note: "12 min. The practical RL real companies deploy.",
      },
      {
        label: "Contextual bandits explained (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=contextual+bandit+tutorial+production+recommendation",
        note: "10 min. How Netflix/Spotify do real-time personalization.",
      },
      {
        label: "Gymnasium docs (Farama)",
        url: "https://gymnasium.farama.org/",
        note: "Reference. The classic OpenAI Gym is now Gymnasium. CartPole, FrozenLake, MountainCar are 1-line imports.",
      },
    ],
    days: [
      { number: 1, title: "RL intuition", summary: "Watch + read.", items: [
        { kind: "video", title: "RL in 5 minutes", url: "https://www.youtube.com/results?search_query=reinforcement+learning+5+minutes+overview", duration_min: 5 },
        { kind: "video", title: "Q-learning in 15 min", url: "https://www.youtube.com/results?search_query=Q+learning+explained+15+minutes+CartPole", duration_min: 15 },
      ] },
      { number: 2, title: "CartPole Q-learning", summary: "First RL implementation.", items: [
        { kind: "exercise", title: "Implement Q-learning", body: "pip install gymnasium. Implement tabular Q-learning on CartPole-v1. Train 1000 episodes. Plot reward over episodes." },
      ] },
      { number: 3, title: "Exploration strategies", summary: "Epsilon-greedy vs UCB.", items: [
        { kind: "exercise", title: "Compare exploration", body: "Add UCB exploration alongside epsilon-greedy. Plot reward curves for both. Which converges faster?" },
      ] },
      { number: 4, title: "Contextual bandits", summary: "The practical version.", items: [
        { kind: "video", title: "Multi-armed bandits", url: "https://www.youtube.com/results?search_query=multi+armed+bandit+epsilon+greedy+UCB+tutorial", duration_min: 12 },
        { kind: "exercise", title: "4-arm bandit", body: "Build a synthetic ad-selection problem: 4 ads, each with a different conversion rate. Implement a contextual bandit that learns which ad to show given a user feature vector. Compare to random + greedy baselines." },
      ] },
      { number: 5, title: "Real-world use cases", summary: "When RL is right vs wrong.", items: [
        { kind: "video", title: "Contextual bandits in production", url: "https://www.youtube.com/results?search_query=contextual+bandit+tutorial+production+recommendation", duration_min: 10 },
        { kind: "exercise", title: "WHEN_RL.md", body: "Write decision rules: (1) When RL beats supervised learning, (2) When it does not, (3) Where bandits sit between A/B testing and full RL." },
      ] },
      { number: 6, title: "Document one use case", summary: "Pick a real product.", items: [
        { kind: "exercise", title: "Use case writeup", body: "Pick one real product (Netflix, Spotify, news feed, ad ranker) and document in 1 paragraph how a bandit might run there - what's the context, what's the action, what's the reward." },
      ] },
      { number: 7, title: "Ship", summary: "Push to GitHub.", items: [
        { kind: "exercise", title: "Push", body: "Push the repo + WHEN_RL.md + the use-case writeup. Paste the GitHub commit URL." },
      ] },
    ],
    ai_assist:
      "Cursor + Claude write the Q-learning training loop in one prompt. Use AI to debug 'reward not improving' (it'll spot common bugs in epsilon decay). Have Claude critique your WHEN_RL.md - it'll catch oversimplifications.",
    mastery_questions: [
      "Watch the RL intro videos. Paste 1 sentence: when would you reach for RL vs supervised?",
      "Implement Q-learning on CartPole. Plot reward over 1000 episodes. Paste the PNG URL.",
      "Run with epsilon=0.1 vs epsilon=0.5. Paste both final-100-episode-average rewards.",
      "Implement UCB exploration alongside epsilon-greedy. Plot both. Which converges faster?",
      "Build the 4-arm contextual bandit. Show user-feature -> chosen-arm mapping for 5 example users.",
      "Compare your bandit to (a) random selection (b) always-show-best-overall. Paste 3 cumulative-reward numbers.",
      "Pick one real product (Netflix, Spotify, ad system). Describe its bandit setup in 5 lines.",
      "Write WHEN_RL.md with 3 decision rules. Paste URL.",
      "Push rl-intro repo. Paste GitHub URL.",
      "In 1 sentence: why would most jobs prefer a bandit over full RL?",
    ],
  },
  {
    number: 41,
    title: "Recommender Systems - the algorithms behind every feed",
    phase: "Specialty",
    commitment_hours: "8-10",
    context:
      "Recommenders are everywhere: Netflix, Amazon, Spotify, every ecommerce site, every social feed. This week you build a movie recommender from scratch using collaborative filtering, then a deep-learning recommender with embeddings, then ship a Streamlit demo.",
    topics: [
      "Collaborative filtering (user-based vs item-based)",
      "Matrix factorization (SVD, ALS)",
      "Deep recommenders (two-tower architecture)",
      "Cold-start problem and the standard mitigations",
      "Evaluation: precision@K, recall@K, NDCG",
      "Implicit vs explicit feedback",
      "The reality: hybrid systems beat any single approach",
    ],
    tasks: [
      "Download MovieLens 1M dataset",
      "Implement user-based collaborative filtering",
      "Train matrix factorization with implicit or scikit-surprise",
      "Build a two-tower deep model with PyTorch",
      "Evaluate all 3 on the same test set with precision@10, recall@10, NDCG@10",
      "Build a Streamlit recommender demo",
    ],
    outputs: [
      "recommender-demo repo with 3 model implementations",
      "Live Streamlit URL of the movie recommender",
      "EVAL.md comparing all 3 approaches with numbers",
    ],
    project:
      "MovieRec - a deployed movie recommender comparing collaborative filtering, matrix factorization, and deep learning. Demonstrates fluency in the most-asked DS interview topic at consumer companies.",
    resources: [
      {
        label: "Recommender systems in 15 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=recommender+systems+collaborative+filtering+15+min",
        note: "15 min. The big picture before diving in.",
      },
      {
        label: "Matrix factorization explained in 12 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=matrix+factorization+SVD+ALS+recommender+tutorial",
        note: "12 min. The classical recsys approach. Still in production at many companies.",
      },
      {
        label: "Two-tower deep recommenders in 20 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=two+tower+deep+recommender+system+tutorial",
        note: "20 min. The modern approach. YouTube, Pinterest, Netflix all use variants.",
      },
      {
        label: "Cold start problem in recommenders (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=cold+start+problem+recommender+systems+solutions",
        note: "10 min. The hardest practical issue. 4 standard mitigations.",
      },
      {
        label: "MovieLens 1M dataset",
        url: "https://grouplens.org/datasets/movielens/1m/",
        note: "1M ratings. The classic dataset every recsys paper uses for benchmarking.",
      },
      {
        label: "scikit-surprise library",
        url: "https://github.com/NicolasHug/Surprise",
        note: "Reference. Easy-to-use matrix factorization in Python.",
      },
    ],
    days: [
      { number: 1, title: "Intuition + dataset", summary: "Big picture + MovieLens download.", items: [
        { kind: "video", title: "Recommender systems in 15 min", url: "https://www.youtube.com/results?search_query=recommender+systems+collaborative+filtering+15+min", duration_min: 15 },
        { kind: "exercise", title: "Load MovieLens", body: "Download MovieLens 1M. Load ratings + movies into pandas. Train/test split 80/20." },
      ] },
      { number: 2, title: "User-based CF", summary: "The simplest recommender that works.", items: [
        { kind: "exercise", title: "User CF", body: "Compute user-user cosine similarity. For each test user, recommend top-10 movies based on similar users' ratings. Compute precision@10." },
      ] },
      { number: 3, title: "Matrix factorization", summary: "SVD or ALS.", items: [
        { kind: "video", title: "Matrix factorization", url: "https://www.youtube.com/results?search_query=matrix+factorization+SVD+ALS+recommender+tutorial", duration_min: 12 },
        { kind: "exercise", title: "MF with surprise", body: "from surprise import SVD. Train on training set. Get recommendations. Compute precision@10, recall@10." },
      ] },
      { number: 4, title: "Two-tower deep model", summary: "PyTorch user + item embeddings.", items: [
        { kind: "video", title: "Two-tower deep recommenders", url: "https://www.youtube.com/results?search_query=two+tower+deep+recommender+system+tutorial", duration_min: 20 },
        { kind: "exercise", title: "Two-tower model", body: "Two embedding tables (user, item), 32-dim each. Dot product = predicted rating. Train with MSE loss on training set. 5 epochs." },
      ] },
      { number: 5, title: "Cold-start mitigation", summary: "What about brand-new users?", items: [
        { kind: "video", title: "Cold start problem", url: "https://www.youtube.com/results?search_query=cold+start+problem+recommender+systems+solutions", duration_min: 10 },
        { kind: "exercise", title: "Cold start", body: "Implement a 'popular movies' fallback for users with <5 ratings. Test on synthetic cold-start users." },
      ] },
      { number: 6, title: "Multi-metric eval", summary: "precision@K, recall@K, NDCG.", items: [
        { kind: "exercise", title: "Eval all 3", body: "Compute precision@10, recall@10, NDCG@10 for all 3 models on the same test set. Build a 3-row table." },
      ] },
      { number: 7, title: "Streamlit demo", summary: "Live deployment.", items: [
        { kind: "exercise", title: "Ship Streamlit", body: "Build a Streamlit app: user picks 5 movies they liked, app shows top-10 recommendations from the winning model. Deploy to Streamlit Cloud. Paste URL." },
      ] },
    ],
    ai_assist:
      "Use Cursor to scaffold the two-tower model in PyTorch (paste the dataset shape, it generates the architecture). Have Claude explain why dot-product similarity is enough (when it is enough). Use AI to draft the eval table commentary - then write the interpretation yourself.",
    mastery_questions: [
      "Download MovieLens 1M. Paste user count + movie count + rating count.",
      "Implement user-based CF. Paste precision@10 on test set.",
      "Train SVD with scikit-surprise. Paste precision@10 + recall@10.",
      "Build the two-tower PyTorch model. Paste model code (class definition).",
      "Train two-tower 5 epochs. Paste final train + val MSE.",
      "Run all 3 models. Paste the 3-row eval table (precision@10, recall@10, NDCG@10).",
      "Which model won? Paste your 2-sentence justification.",
      "Implement cold-start fallback. Test on a synthetic new user. Paste the recommendations.",
      "Deploy Streamlit recommender. Paste live URL.",
      "Push the repo. Paste GitHub commit URL.",
    ],
  },
  {
    number: 42,
    title: "Distributed ML - when your data does not fit on one laptop",
    phase: "Specialty",
    commitment_hours: "6-8",
    context:
      "Real production data is often 100GB+. Pandas chokes. This week you learn Dask and PySpark, run a real distributed ML job, and learn when scaling out is necessary vs premature optimization.",
    topics: [
      "Dask - the drop-in pandas replacement for bigger-than-RAM data",
      "PySpark - the industry standard for true big data",
      "When to scale up (more RAM) vs scale out (more machines)",
      "DataFrames vs RDDs (and why you almost never use RDDs)",
      "Distributed training with Spark MLlib",
      "The reality: most 'big data' problems fit on a beefy single machine",
    ],
    tasks: [
      "Install Dask + run a distributed groupby on a multi-GB CSV",
      "Spin up a local PySpark session",
      "Replicate your TaxiPulse busiest-hour query in PySpark",
      "Train a Spark MLlib regression model on the same data",
      "Compare runtime: pandas vs Dask vs Spark on the same query",
      "Write WHEN_DISTRIBUTED.md - your scaling decision rules",
    ],
    outputs: [
      "distributed-ml repo with Dask + Spark notebooks",
      "WHEN_DISTRIBUTED.md with decision rules + runtime comparison table",
    ],
    project:
      "DistributedML-Compare - a 3-tool runtime + accuracy comparison on the same task. Demonstrates you know when to scale out and when to stop fooling around with Spark.",
    resources: [
      {
        label: "Dask in 15 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=Dask+tutorial+15+minutes+pandas+replacement",
        note: "15 min. The lowest-effort step up from pandas.",
      },
      {
        label: "PySpark in 25 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=PySpark+tutorial+25+minutes+DataFrame+API",
        note: "25 min. The DataFrame API. Skip RDDs - you almost never need them.",
      },
      {
        label: "Spark vs Dask vs pandas - which when (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=Spark+vs+Dask+vs+pandas+when+to+use+each",
        note: "10 min. The decision tree.",
      },
      {
        label: "Spark MLlib quickstart (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=Spark+MLlib+tutorial+regression+pyspark",
        note: "20 min. Train a model the distributed way.",
      },
      {
        label: "Dask docs",
        url: "https://docs.dask.org/",
        note: "Reference. dask.dataframe is the API you actually use.",
      },
    ],
    days: [
      { number: 1, title: "Dask setup", summary: "Install + first groupby.", items: [
        { kind: "video", title: "Dask in 15 min", url: "https://www.youtube.com/results?search_query=Dask+tutorial+15+minutes+pandas+replacement", duration_min: 15 },
        { kind: "exercise", title: "Dask groupby", body: "pip install dask[complete]. Load a multi-GB TaxiPulse parquet (Sept+Oct+Nov+Dec 2023). Run busiest-hour groupby with dask.dataframe. Time it." },
      ] },
      { number: 2, title: "PySpark setup", summary: "Local Spark session.", items: [
        { kind: "video", title: "PySpark in 25 min", url: "https://www.youtube.com/results?search_query=PySpark+tutorial+25+minutes+DataFrame+API", duration_min: 25 },
        { kind: "exercise", title: "Spark session", body: "pip install pyspark. SparkSession.builder.appName('taxi').getOrCreate(). Load Q4 parquets. df.show()." },
      ] },
      { number: 3, title: "Replicate the query", summary: "Same busiest-hour analysis in Spark.", items: [
        { kind: "exercise", title: "Spark busiest hour", body: "groupBy('hour').count() in PySpark. Time it. Compare to pandas baseline + Dask result." },
      ] },
      { number: 4, title: "Spark MLlib regression", summary: "Distributed training.", items: [
        { kind: "video", title: "Spark MLlib quickstart", url: "https://www.youtube.com/results?search_query=Spark+MLlib+tutorial+regression+pyspark", duration_min: 20 },
        { kind: "exercise", title: "Fare model in Spark", body: "Train LinearRegression in PySpark MLlib on Q4 data. Predict fare from distance + hour. Compare MAE to your W5 sklearn baseline." },
      ] },
      { number: 5, title: "Runtime comparison", summary: "Pandas vs Dask vs Spark.", items: [
        { kind: "exercise", title: "Time everything", body: "Same busiest-hour query, 3 tools. Same data. Same hardware. Paste a 3-row table: tool, runtime, peak memory." },
      ] },
      { number: 6, title: "Scaling decision rules", summary: "When is each right?", items: [
        { kind: "video", title: "Spark vs Dask vs pandas", url: "https://www.youtube.com/results?search_query=Spark+vs+Dask+vs+pandas+when+to+use+each", duration_min: 10 },
        { kind: "exercise", title: "WHEN_DISTRIBUTED.md", body: "Write decision rules: when pandas, when Dask, when Spark. Include data-size and team-size considerations." },
      ] },
      { number: 7, title: "Ship", summary: "Push the comparison.", items: [
        { kind: "exercise", title: "Push repo", body: "Push distributed-ml repo with both notebooks + WHEN_DISTRIBUTED.md + runtime table. Paste GitHub URL." },
      ] },
    ],
    ai_assist:
      "Cursor writes the PySpark code far faster than you can. Type 'busiest pickup hour in Q4 taxi data using Spark DataFrame' as a comment. Have Claude debug the JVM heap errors (it'll suggest spark.driver.memory settings). Use AI to draft WHEN_DISTRIBUTED.md from your runtime results.",
    mastery_questions: [
      "Install Dask + PySpark. Paste both version numbers.",
      "Load Q4 TaxiPulse data (Sept+Oct+Nov+Dec) into pandas. What is the total row count + memory footprint?",
      "Run busiest-hour query in pandas. Paste runtime.",
      "Run the same query in Dask. Paste runtime.",
      "Run the same query in PySpark. Paste runtime.",
      "Train LinearRegression in Spark MLlib. Paste test MAE.",
      "Compare Spark MAE vs your W5 sklearn baseline. Same or different? Paste both.",
      "Build the 3-tool runtime + memory table. Paste it.",
      "Write WHEN_DISTRIBUTED.md with 3 scaling decision rules. Paste URL.",
      "Push the repo. Paste GitHub commit URL.",
    ],
  },
  {
    number: 43,
    title: "Privacy and Differential Privacy - the senior-DS topic nobody teaches",
    phase: "Specialty",
    commitment_hours: "6-8",
    context:
      "Privacy is the next compliance wave. GDPR, CCPA, and emerging regulations require DS to understand what privacy means mathematically. This week you learn differential privacy intuition, implement a DP query, and add a privacy section to one of your project repos.",
    topics: [
      "Why anonymization fails (re-identification attacks)",
      "Differential privacy - the formal guarantee",
      "Noise addition (Laplace + Gaussian mechanisms)",
      "Privacy budget (epsilon) tradeoffs",
      "Federated learning intuition",
      "Practical DP libraries: opacus (PyTorch), tf-privacy",
      "When DP is required vs nice-to-have",
    ],
    tasks: [
      "Read 2 case studies of re-identification attacks",
      "Implement a DP-noisy count query on the HR Attrition dataset",
      "Run a DP-SGD training pass on a small model with opacus",
      "Compare model accuracy with and without DP",
      "Add a PRIVACY.md section to one of your project repos",
    ],
    outputs: [
      "dp-demo notebook with both DP query + DP-SGD examples",
      "PRIVACY.md added to one earlier project repo",
    ],
    project:
      "Privacy-Demo - a hands-on differential privacy notebook + a PRIVACY.md document added to a real project. Demonstrates you can speak to privacy in interviews when it comes up (and it does come up at Apple, Google, Meta).",
    resources: [
      {
        label: "Differential privacy in 10 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=differential+privacy+explained+10+minutes",
        note: "10 min. The intuition before the math.",
      },
      {
        label: "Re-identification attacks - Netflix Prize case (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=Netflix+prize+de+anonymization+attack",
        note: "10 min. The famous case that ended anonymization as a privacy strategy.",
      },
      {
        label: "DP-SGD with opacus tutorial (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=opacus+PyTorch+differential+privacy+tutorial",
        note: "15 min. The standard PyTorch privacy library from Meta.",
      },
      {
        label: "Federated learning intuition in 10 min (top YouTube result)",
        url: "https://www.youtube.com/results?search_query=federated+learning+explained+10+minutes",
        note: "10 min. How models train on phones without seeing your data.",
      },
      {
        label: "opacus library on GitHub",
        url: "https://github.com/pytorch/opacus",
        note: "Reference. Meta's DP-SGD library. Add to any PyTorch model in 3 lines.",
      },
    ],
    days: [
      { number: 1, title: "Why privacy", summary: "Re-identification case studies.", items: [
        { kind: "video", title: "Netflix Prize de-anonymization", url: "https://www.youtube.com/results?search_query=Netflix+prize+de+anonymization+attack", duration_min: 10 },
        { kind: "reflection", title: "Cases", body: "Read 2 cases (Netflix Prize, AOL search data). Write 1 sentence each: what was the attack, what was the lesson. Paste to NOTES.md." },
      ] },
      { number: 2, title: "Differential privacy intuition", summary: "Without math.", items: [
        { kind: "video", title: "Differential privacy in 10 min", url: "https://www.youtube.com/results?search_query=differential+privacy+explained+10+minutes", duration_min: 10 },
        { kind: "reflection", title: "Epsilon", body: "Write 3 lines: what is epsilon, what is a noise budget, why smaller epsilon means more privacy AND less utility." },
      ] },
      { number: 3, title: "DP count query", summary: "Add Laplace noise to a real count.", items: [
        { kind: "exercise", title: "DP query", body: "On HR Attrition dataset, count employees in each Department. Add Laplace noise with epsilon=1.0. Paste true counts vs noisy counts side by side." },
      ] },
      { number: 4, title: "DP-SGD with opacus", summary: "Train one model privately.", items: [
        { kind: "video", title: "Opacus tutorial", url: "https://www.youtube.com/results?search_query=opacus+PyTorch+differential+privacy+tutorial", duration_min: 15 },
        { kind: "exercise", title: "Private training", body: "Train your TaxiPulse fare model with opacus PrivacyEngine(epsilon=8). Compare MAE to non-DP baseline. How much accuracy did you trade for privacy?" },
      ] },
      { number: 5, title: "Federated learning", summary: "The intuition.", items: [
        { kind: "video", title: "Federated learning in 10 min", url: "https://www.youtube.com/results?search_query=federated+learning+explained+10+minutes", duration_min: 10 },
        { kind: "reflection", title: "Use case", body: "Write 1 paragraph on a real product where federated learning would matter (e.g. iOS autocorrect, medical imaging across hospitals)." },
      ] },
      { number: 6, title: "PRIVACY.md", summary: "Add to one project.", items: [
        { kind: "exercise", title: "Privacy section", body: "Pick one earlier project (HR Attrition is best). Add PRIVACY.md: what sensitive attributes, what would re-identification look like, what mitigations you would deploy in production. 1 page." },
      ] },
      { number: 7, title: "Ship", summary: "Push everything.", items: [
        { kind: "exercise", title: "Push", body: "Push dp-demo notebook + PRIVACY.md on the original repo. Paste both commit URLs." },
      ] },
    ],
    ai_assist:
      "Use Claude to explain epsilon intuitively - have it draft analogies until one clicks. Use Cursor to write the Laplace noise function. Have AI critique your PRIVACY.md from a compliance officer's perspective. CRITICALLY: never let AI claim a model is 'private' without checking the actual epsilon - it sometimes oversells DP guarantees.",
    stakeholder_moment:
      "Privacy is now a compliance + brand-risk issue, not just an ethics one. Your audience for PRIVACY.md is: a compliance officer, a senior eng who has to deploy your model, and a privacy-aware user. Address all three. Be specific about what your model COULD leak, not just abstract guarantees.",
    mastery_questions: [
      "Read 2 re-identification case studies. Paste 1 sentence per case.",
      "Define epsilon in differential privacy in your own words. Paste 2 sentences.",
      "Implement a DP-noisy count on HR Attrition data with epsilon=1.0. Paste true vs noisy counts for 3 departments.",
      "Run the same query with epsilon=0.1 (more private). Paste new noisy counts. How much more noise?",
      "Train TaxiPulse fare model with opacus PrivacyEngine. Paste DP-SGD MAE.",
      "Compare to non-DP MAE from W5. How much accuracy did you trade for epsilon=8 privacy? Paste both.",
      "Write 1 paragraph on a real federated learning use case. Paste it.",
      "Pick one earlier project. Write PRIVACY.md with 3 sections: sensitive attributes, risk model, mitigations. Paste URL.",
      "Push dp-demo + PRIVACY.md. Paste 2 commit URLs.",
      "In 1 sentence: when is DP required vs nice-to-have for a product?",
    ],
  },
];

// ---------- Reframe DA W17 to be Marketing-applied (no flow interruption) ----------
function reframeDAw17(d) {
  const w17 = d.weeks.find((w) => w.number === 17);
  if (!w17) return false;
  w17.phase = "Marketing"; // was Modern Analysis - now merges into the Marketing run
  w17.title = "Olist A/B test - planning a marketing experiment";
  w17.context =
    "Your Marketing director wants to A/B test a checkout-page change to lift the repeat-purchase rate. This week you design the experiment, compute the required sample size against Olist's real traffic, simulate the result, and write AB-PLAN.md as a real product spec.";
  w17.tasks = [
    "Pick a specific Olist marketing hypothesis (e.g. 'free shipping over $50 lifts repeat rate by 2pp')",
    "Compute required sample size given the current repeat-rate baseline",
    "Simulate variant + control with a true 2pp lift",
    "Compute observed lift + p-value + Cohen's d",
    "Write AB-PLAN.md as a real product spec for the marketing director",
    "Add a secondary metric (cancellation rate) and analyze the tradeoff",
  ];
  w17.outputs = [
    "AB-PLAN.md product spec - the document a marketing director would actually approve",
    "Simulated lift + p-value + sample size justification",
    "Secondary-metric analysis",
  ];
  w17.project =
    "Olist-AB-Plan - a real product spec for an A/B test on the Olist marketing funnel. Demonstrates you can scope an experiment AS the analyst the marketing director hires you to be.";
  return true;
}

function applyTo(file, newWeeks, reframe) {
  const p = path.join(ROOT, file);
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  // Append new weeks
  for (const w of newWeeks) {
    if (d.weeks.find((x) => x.number === w.number)) {
      console.log(`  ${file}: W${w.number} already exists - skipping`);
      continue;
    }
    // Defensive: ensure all required arrays + strings exist
    w.exercises = w.exercises ?? [];
    w.questions = w.questions ?? [];
    d.weeks.push(w);
  }
  // Re-frame existing weeks
  if (reframe) reframe(d);
  d.weeks.sort((a, b) => a.number - b.number);
  d.total_weeks = d.weeks.length;
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + "\n");
  console.log(`${file}: now ${d.total_weeks} weeks`);
}

applyTo("data-analysis.json", [], reframeDAw17);
applyTo("data-science.json", DS_NEW, null);
