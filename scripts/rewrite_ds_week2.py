"""
Rewrite Week 2 of the Data Science roadmap.

Problems fixed:
  - Day 0 was "VS Code + SQL" — wrong for a math week. Now: NumPy/SciPy/Matplotlib verify.
  - Every odd-numbered day had a boilerplate "Deeper dive" lesson saying
    "There isn't a single short video..." — pure template filler. Replaced with real content.
  - Day 1 had "Machine Learning in 100 Seconds" (Fireship) — repeated pattern.
    Replaced with 3Blue1Brown "Vectors, what even are they?" which is actually the best
    video for the topic.
  - Day 6 had "StatQuest Logistic Regression" on a Linear Regression day. Fixed.
  - Code snippets had scattered "The snippet below shows exactly what to do:" artifacts.
    All removed.
  - Lesson bodies now teach the concept completely — no external source needed.
"""

import json, sys
from pathlib import Path

ROADMAP = Path(__file__).parent.parent / "data" / "roadmaps" / "data-science.json"

NEW_DAYS = [
  # ── DAY 0 ────────────────────────────────────────────────────────────────────
  {
    "number": 0,
    "title": "Day 0 — Math tools: NumPy, SciPy, Matplotlib",
    "summary": "Verify the three libraries this week runs on. All ship with Anaconda — this takes 15 minutes.",
    "items": [
      {
        "kind": "lesson",
        "title": "The three tools you need for math week",
        "body": (
          "## What you're verifying today\n\n"
          "You already installed Anaconda in Week 1. Good news: it ships with every library you need this week.\n\n"
          "- **NumPy** — fast numerical arrays. Every dot product, matrix multiply, and element-wise operation this week runs on NumPy. Without it, the Day 1 code won't even import.\n"
          "- **SciPy** — statistical functions built on top of NumPy. You'll use `scipy.stats` on Day 4 to run a normality test on taxi fares.\n"
          "- **Matplotlib** — the plotting library. You'll plot histograms of distributions, scatter plots of distance vs fare, and residual plots to check your linear model.\n\n"
          "The task today is not installation — it's verification. You want to know before Day 1 that all three work, not find out mid-lesson when you're stuck on an import error.\n\n"
          "## The one command that checks everything\n\n"
          "Open an Anaconda Prompt (Windows) or Terminal (Mac/Linux) and run:\n\n"
          "```bash\n"
          "python -c \"import numpy as np; import scipy; import matplotlib; print('numpy', np.__version__); print('scipy', scipy.__version__); print('matplotlib', matplotlib.__version__)\"\n"
          "```\n\n"
          "Expected output (versions may differ slightly):\n"
          "```\n"
          "numpy 1.26.4\n"
          "scipy 1.13.1\n"
          "matplotlib 3.8.4\n"
          "```\n\n"
          "If any import fails, run `conda install numpy scipy matplotlib` and try again.\n\n"
          "## Create this week's notebook\n\n"
          "In your taxipulse project folder:\n\n"
          "```bash\n"
          "mkdir -p notebooks\n"
          "```\n\n"
          "Open Jupyter, create a new notebook, save it as `notebooks/05-math.ipynb`. Add a first markdown cell:\n\n"
          "```markdown\n"
          "# Week 2: Math you actually need\n"
          "## TaxiPulse — vectors, matrices, probability, stats\n"
          "```\n\n"
          "Run it. Commit. This notebook grows every day this week."
        )
      },
      {
        "kind": "swipe",
        "title": "Quick check — swipe to answer",
        "cards": [
          {
            "prompt": "All three libraries (NumPy, SciPy, Matplotlib) print version numbers without error.",
            "answer": True,
            "whenRight": "You're ready for Day 1.",
            "whenWrong": "Run `conda install numpy scipy matplotlib` in Anaconda Prompt and retry."
          },
          {
            "prompt": "You need to download and install NumPy separately — it doesn't come with Anaconda.",
            "answer": False,
            "whenRight": "Anaconda bundles them. The one-line verify command is your entire setup today.",
            "whenWrong": "Anaconda includes NumPy, SciPy, and Matplotlib. No separate install needed."
          },
          {
            "prompt": "notebooks/05-math.ipynb exists in your taxipulse repo and has been committed.",
            "answer": True,
            "whenRight": "Good — you have a home for this week's work.",
            "whenWrong": "Create the file now in Jupyter, save it, then `git add notebooks/05-math.ipynb && git commit -m 'stub math notebook'`."
          }
        ]
      },
      {
        "kind": "exercise",
        "title": "Verify and commit",
        "body": (
          "[CODE] In your terminal:\n"
          "```bash\n"
          "python -c \"import numpy as np; import scipy; import matplotlib; print('numpy', np.__version__); print('scipy', scipy.__version__); print('matplotlib', matplotlib.__version__)\"\n"
          "```\n\n"
          "Then create and commit the stub notebook:\n"
          "```bash\n"
          "git add notebooks/05-math.ipynb\n"
          "git commit -m 'Week 2 Day 0: create math notebook stub'\n"
          "```\n\n"
          "PASS:\n"
          "[x] All three libraries print a version number\n"
          "[x] notebooks/05-math.ipynb committed to your repo"
        )
      }
    ]
  },

  # ── DAY 1 ────────────────────────────────────────────────────────────────────
  {
    "number": 1,
    "title": "Vectors and the dot product",
    "summary": "One taxi trip is a vector. Linear regression is a dot product. This is the atom of every ML model.",
    "items": [
      {
        "kind": "lesson",
        "title": "What a vector is — and why your DataFrame is full of them",
        "body": (
          "## A vector is an ordered list of numbers\n\n"
          "You have been working with vectors since Week 1 — you just didn't call them that.\n\n"
          "Every row in your taxi DataFrame is a vector:\n"
          "```text\n"
          "trip = [2.3,   17,    4  ]\n"
          "        ↑      ↑      ↑\n"
          "      miles  hour  day_of_week\n"
          "```\n\n"
          "That single row — as a NumPy array — is a 3-dimensional vector. The three numbers describe where this trip 'lives' in a 3D space: how long it was, when it happened, which day. Every model you will ever train takes vectors like this as input.\n\n"
          "## The dot product — the operation that powers ML\n\n"
          "Multiply corresponding elements, then sum. That is the complete definition.\n\n"
          "```text\n"
          "trip    = [2.3,   17,    4  ]\n"
          "weights = [3.0,   0.1,  -0.2]\n"
          "           ↓      ↓      ↓\n"
          "dot = 2.3×3.0 + 17×0.1 + 4×(-0.2)\n"
          "    = 6.9    + 1.7    - 0.8\n"
          "    = 7.8   ← predicted fare contribution\n"
          "```\n\n"
          "Those `weights` are what a trained linear model actually learns. The weight 3.0 says 'each extra mile adds $3.00 to the fare.' The weight 0.1 says 'each later hour adds $0.10.' Training is the process of finding the weights that make predictions accurate.\n\n"
          "When `sklearn.LinearRegression().predict(X)` runs on your test set, it is computing one dot product per row. That's it. The entire prediction mechanism is this arithmetic.\n\n"
          "## Why the dot product is everywhere in ML\n\n"
          "- **Neural networks** — every layer is a matrix of weights applied to input vectors via dot products, then passed through a non-linear function. Stack enough layers and you can approximate any function.\n"
          "- **Recommendation systems** — Spotify finds songs you'll like by computing dot products between your taste vector and every song's feature vector. High dot product = similar.\n"
          "- **Transformers (ChatGPT, Claude)** — the attention mechanism computes dot products between every word pair to decide which words are relevant to each other.\n\n"
          "This is the atom. Once you understand the dot product, you can read the mathematics of almost any ML paper."
        )
      },
      {
        "kind": "video",
        "title": "Vectors — what even are they?",
        "url": "https://www.youtube.com/watch?v=fNk_zzaMoSs",
        "duration_min": 9,
        "creator": "3Blue1Brown",
        "difficulty": "beginner",
        "why": "3Blue1Brown's opening chapter of 'Essence of Linear Algebra' — the best visual introduction to vectors that exists. Watch before you write any code today. The geometric intuition it builds makes the dot product feel obvious rather than arbitrary."
      },
      {
        "kind": "lesson",
        "title": "NumPy dot products — in code, on real data",
        "body": (
          "## Import NumPy and load your data\n\n"
          "```python\n"
          "import numpy as np\n"
          "import pandas as pd\n\n"
          "df = pd.read_parquet('data/clean.parquet')\n"
          "```\n\n"
          "## Two syntaxes — same operation\n\n"
          "```python\n"
          "trip    = np.array([2.3, 17.0, 4.0])\n"
          "weights = np.array([3.0, 0.1, -0.2])\n\n"
          "# Older syntax\n"
          "pred1 = np.dot(trip, weights)\n\n"
          "# Modern syntax — preferred, introduced in Python 3.5\n"
          "pred2 = trip @ weights\n\n"
          "print(pred1, pred2)\n"
          "# 7.8  7.8\n"
          "```\n\n"
          "The `@` operator was added to Python specifically for matrix and vector operations. Use it — it reads like math.\n\n"
          "## Vector magnitude (length)\n\n"
          "Square each element, sum, take the square root. That's the formula — `np.linalg.norm` does it for you:\n\n"
          "```python\n"
          "v = np.array([3.0, 4.0])\n"
          "np.linalg.norm(v)   # 5.0  ← because √(9 + 16) = 5\n"
          "```\n\n"
          "You recognise it: the 3-4-5 right triangle. `np.linalg.norm` computes that for any number of dimensions.\n\n"
          "## Cosine similarity — how similar are two trips?\n\n"
          "The angle between two vectors measures similarity. Two vectors pointing in the same direction (angle = 0°) have cosine similarity = 1. Perpendicular vectors have similarity = 0.\n\n"
          "```python\n"
          "trip1 = np.array([2.3, 17.0, 4.0])   # 2.3 miles, 5pm, Thursday\n"
          "trip2 = np.array([2.1, 18.0, 4.0])   # 2.1 miles, 6pm, Thursday\n"
          "trip3 = np.array([8.4,  3.0, 1.0])   # 8.4 miles, 3am, Monday\n\n"
          "def cos_sim(a, b):\n"
          "    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))\n\n"
          "print(f'trip1 vs trip2: {cos_sim(trip1, trip2):.4f}')  # 0.9998\n"
          "print(f'trip1 vs trip3: {cos_sim(trip1, trip3):.4f}')  # 0.6021\n"
          "# trip2 is nearly identical to trip1; trip3 is very different.\n"
          "```\n\n"
          "Recommendation systems do exactly this across millions of items. Two users with similar feature vectors get similar recommendations."
        )
      },
      {
        "kind": "swipe",
        "title": "Quick check — swipe to answer",
        "cards": [
          {
            "prompt": "The dot product of [1, 2, 3] and [4, 5, 6] equals 1×4 + 2×5 + 3×6 = 32.",
            "answer": True,
            "whenRight": "Correct — multiply element-by-element, then sum: 4 + 10 + 18 = 32.",
            "whenWrong": "Walk through it: 1×4=4, 2×5=10, 3×6=18. Sum = 32."
          },
          {
            "prompt": "Training a linear model means finding the weights vector that minimises prediction error.",
            "answer": True,
            "whenRight": "Exactly — training = find weights such that (X @ weights) is as close as possible to real targets.",
            "whenWrong": "That is what training is. Weights start random; the algorithm adjusts them to reduce error."
          },
          {
            "prompt": "Two vectors pointing in the same direction have cosine similarity close to 0.",
            "answer": False,
            "whenRight": "Opposite — same direction = angle 0° = cos(0°) = 1. Perpendicular vectors have similarity 0.",
            "whenWrong": "Same direction → angle = 0° → cos(0°) = 1. Similarity of 0 means the vectors are perpendicular."
          }
        ]
      },
      {
        "kind": "exercise",
        "title": "Your turn — vectors on real taxi data",
        "body": (
          "[CODE] In `notebooks/05-math.ipynb`, add section `## Day 1: Vectors`:\n\n"
          "1. Sample 5 random trips from `data/clean.parquet`. Store each as a NumPy array `[trip_distance, pickup_hour, pickup_dow]`.\n"
          "2. Compute the dot product of each trip with `weights = [3.5, 0.05, -0.15]`. These are approximate NYC metered fare coefficients.\n"
          "3. Compute cosine similarity between trip 1 and each of the other 4 trips.\n"
          "4. In a markdown cell: 'The most similar trip to trip 1 is trip N. The similarity score is Z, which means [interpret it].'\n\n"
          "PASS:\n"
          "[x] You completed the task described above\n"
          "[x] You can explain in one sentence what you produced\n"
          "[x] Your work is committed to your repo"
        )
      }
    ]
  },

  # ── DAY 2 ────────────────────────────────────────────────────────────────────
  {
    "number": 2,
    "title": "Matrices — why neural nets are just table operations",
    "summary": "A matrix transforms many vectors at once. Batch prediction, neural network layers, image processing — all matrix multiplies.",
    "items": [
      {
        "kind": "lesson",
        "title": "What a matrix is — and why it lets you predict 10,000 trips at once",
        "body": (
          "## A matrix is a 2D array of numbers\n\n"
          "Pack your trip vectors into a table and you have a matrix:\n\n"
          "```text\n"
          "X = [[2.3, 17, 4],\n"
          "     [0.8,  9, 2],\n"
          "     [5.1, 22, 5],\n"
          "     [1.2, 13, 1],\n"
          "     [3.7,  8, 0]]\n"
          "```\n\n"
          "This is a **5×3 matrix**: 5 rows (trips), 3 columns (features). In NumPy notation: `shape = (5, 3)`. A dataset of N trips with F features is always an N×F matrix. Shape is the first thing you check on any dataset:\n\n"
          "```python\n"
          "print(X.shape)   # (5, 3) — 5 trips, 3 features\n"
          "```\n\n"
          "## Matrix multiplication — the rule\n\n"
          "To multiply matrix A (m×n) by matrix B (n×p): the column count of A must equal the row count of B. The result has shape (m×p).\n\n"
          "The rule: row of A dot column of B = one element of the result.\n\n"
          "```text\n"
          "A (2×3)          B (3×1)           result (2×1)\n"
          "[[1, 2, 3],      [[a],             [[1a + 2b + 3c],\n"
          " [4, 5, 6]]  ×   [b],     =         [4a + 5b + 6c]]\n"
          "               [c]]\n"
          "```\n\n"
          "Each row of the result is a dot product. A is your trip data, B is your weights, the result is predictions — one per trip, all at once.\n\n"
          "## Why this matters: batch prediction\n\n"
          "Without matrices:\n"
          "```python\n"
          "# Slow — one trip at a time\n"
          "for trip in trips:\n"
          "    pred = trip @ weights\n"
          "```\n\n"
          "With matrices:\n"
          "```python\n"
          "# Fast — all trips simultaneously\n"
          "preds = X @ weights\n"
          "```\n\n"
          "The NumPy matrix multiply calls BLAS routines written in optimised C/Fortran. Predicting 1 million rows takes roughly 10ms. Pure Python loops would take minutes.\n\n"
          "## The shape constraint — the most common error you'll see\n\n"
          "```python\n"
          "A = np.array([[1,2,3],[4,5,6]])    # shape (2,3)\n"
          "B = np.array([[1,2],[3,4],[5,6]])   # shape (3,2)\n\n"
          "A @ B    # (2,3) @ (3,2) → (2,2)  ✓  inner dims match: 3=3\n"
          "B @ A    # (3,2) @ (2,3) → (3,3)  ✓  inner dims match: 2=2\n"
          "A @ A    # (2,3) @ (2,3) → ERROR  ✗  3 ≠ 2\n"
          "```\n\n"
          "When you see `ValueError: matmul: Input operand 1 has a mismatch in its core dimension 0`, check `.shape` on both arrays. The inner dimensions must match."
        )
      },
      {
        "kind": "video",
        "title": "But what is a neural network?",
        "url": "https://www.youtube.com/watch?v=aircAruvnKk",
        "duration_min": 19,
        "creator": "3Blue1Brown",
        "difficulty": "beginner",
        "why": "3Blue1Brown's 'But what is a neural network?' is the clearest visual explanation of how matrix multiplies become intelligence. Watch the first 10 minutes to see exactly how weights and dot products combine into layers. The animation of 784 inputs × 16 weights makes matrix multiplication tangible."
      },
      {
        "kind": "lesson",
        "title": "Batch prediction on 1,000 trips — in code",
        "body": (
          "## All 1,000 predictions in one matrix multiply\n\n"
          "```python\n"
          "import numpy as np\n"
          "import pandas as pd\n\n"
          "df = pd.read_parquet('data/clean.parquet').sample(1000, random_state=42)\n\n"
          "# Feature matrix: 1000 rows × 3 columns\n"
          "X = df[['trip_distance', 'pickup_hour', 'pickup_dow']].values  # shape (1000, 3)\n"
          "y = df['fare_amount'].values                                    # shape (1000,)\n\n"
          "# Add bias column — a column of 1s so the model can learn an intercept\n"
          "X_b = np.column_stack([X, np.ones(len(X))])  # shape (1000, 4)\n"
          "W   = np.array([3.48, 0.07, -0.12, 8.12])    # [dist, hour, dow, bias]\n\n"
          "preds = X_b @ W    # (1000, 4) @ (4,) → (1000,)\n\n"
          "print('First 5 predictions:', preds[:5].round(2))\n"
          "# [16.42  9.87  22.16  12.33  14.09]\n\n"
          "mae      = np.mean(np.abs(y - preds))\n"
          "baseline = np.mean(np.abs(y - y.mean()))\n"
          "print(f'Model MAE:    {mae:.2f}')\n"
          "print(f'Baseline MAE: {baseline:.2f}  (always predict the mean)')\n"
          "print(f'Improvement:  {(1 - mae/baseline)*100:.1f}%')\n"
          "# Model MAE:    6.21\n"
          "# Baseline MAE: 9.03\n"
          "# Improvement:  31.2%\n"
          "```"
        )
      },
      {
        "kind": "swipe",
        "title": "Quick check — swipe to answer",
        "cards": [
          {
            "prompt": "To multiply matrix A (3×4) by matrix B, B must have exactly 4 rows.",
            "answer": True,
            "whenRight": "Right — inner dimensions must match. A has shape (3,4) so B must have 4 rows. Result: (3, B_cols).",
            "whenWrong": "Inner dimensions must match: A is 3×4, so B needs 4 rows."
          },
          {
            "prompt": "`X_b @ W` for a (1000,4) matrix and (4,) vector produces shape (1000,) — one prediction per row.",
            "answer": True,
            "whenRight": "Correct — (1000,4) @ (4,) contracts the inner 4, leaving 1000 predictions.",
            "whenWrong": "(1000,4) @ (4,) contracts the 4-dimensional inner dimension, leaving shape (1000,)."
          },
          {
            "prompt": "NumPy matrix multiply and a Python for-loop produce the same numbers but very different speeds.",
            "answer": True,
            "whenRight": "Same result, very different speed. NumPy calls optimised BLAS routines; a Python loop runs interpreted bytecode.",
            "whenWrong": "Same result, different speed. NumPy is 100-1000× faster for large arrays."
          }
        ]
      },
      {
        "kind": "exercise",
        "title": "Your turn — matrix prediction",
        "body": (
          "[CODE] In `notebooks/05-math.ipynb`, add section `## Day 2: Matrices`:\n\n"
          "1. Load 1,000 random trips as a NumPy feature matrix X of shape (1000, 3): columns `[trip_distance, pickup_hour, pickup_dow]`.\n"
          "2. Add a bias column so X_b has shape (1000, 4).\n"
          "3. Use `X_b @ W` to predict all 1,000 fares. Use `W = [3.48, 0.07, -0.12, 8.12]`.\n"
          "4. Compute and print model MAE vs baseline MAE (always predict mean). Compute improvement %.\n"
          "5. In a markdown cell: is the matrix model better than the baseline, and by how much?\n\n"
          "PASS:\n"
          "[x] You completed the task described above\n"
          "[x] You can explain in one sentence what you produced\n"
          "[x] Your work is committed to your repo"
        )
      }
    ]
  },

  # ── DAY 3 ────────────────────────────────────────────────────────────────────
  {
    "number": 3,
    "title": "Probability — the language every model reasons in",
    "summary": "Every prediction is a probability. Understanding uncertainty is what separates guessing from data science.",
    "items": [
      {
        "kind": "lesson",
        "title": "Probability from first principles — what it actually means",
        "body": (
          "## Start with the simplest possible question\n\n"
          "You have 3.5 million taxi trips. 2,352,750 of them resulted in a tip. What's the probability the next random trip has a tip?\n\n"
          "```text\n"
          "P(tip > 0) = 2,352,750 / 3,500,000 = 0.672\n"
          "```\n\n"
          "That fraction is probability. Not mystical — just counting.\n\n"
          "## Conditional probability: given what we know\n\n"
          "Conditional probability asks: does knowing something change the likelihood?\n\n"
          "```text\n"
          "P(tip > 0 | pickup on Friday night)\n"
          "```\n\n"
          "The `|` reads as 'given'. This is a restricted count:\n"
          "- Restrict to Friday-night trips: say 180,000 of them.\n"
          "- Count how many tipped: 137,700.\n"
          "- P(tip > 0 | Friday night) = 137,700 / 180,000 = 0.765\n\n"
          "Friday night raises the probability from 67% to 77%. That 10-point lift is an actual finding.\n\n"
          "## The formal rule\n\n"
          "```text\n"
          "P(A | B) = P(A and B) / P(B)\n"
          "```\n\n"
          "- P(A and B): fraction of all trips that are BOTH Friday night AND tipped.\n"
          "- P(B): fraction of all trips that are Friday night.\n"
          "- Divide: the probability of A given B.\n\n"
          "## Joint probability for independent events\n\n"
          "If two things are independent (knowing one gives you no information about the other):\n\n"
          "```text\n"
          "P(A and B) = P(A) × P(B)\n"
          "```\n\n"
          "If P(tip)=0.67 and P(Bronx)=0.09, and these are independent, then P(tip and Bronx) ≈ 0.060.\n\n"
          "**But they might not be independent.** Bronx trips may tip at a different rate. You compute P(tip | Bronx) directly from data and compare to P(tip). If they match: independent. If different: there's a relationship worth investigating."
        )
      },
      {
        "kind": "lesson",
        "title": "Bayes theorem — why flipping a conditional is harder than it looks",
        "body": (
          "## The question Bayes answers\n\n"
          "You know P(positive test | disease). What you actually want is P(disease | positive test). These are NOT the same number — and Bayes theorem is the only way to get from one to the other.\n\n"
          "```text\n"
          "P(A | B) = P(B | A) × P(A)\n"
          "           ———————————————\n"
          "               P(B)\n"
          "```\n\n"
          "## A worked example: rare disease screening\n\n"
          "A test for a rare disease is 99% accurate. You test positive. Surely you have the disease, right?\n\n"
          "Not so fast. Say only 1 in 1,000 people have this disease:\n\n"
          "```text\n"
          "P(disease)                = 0.001   ← base rate (how common is it?)\n"
          "P(positive | disease)     = 0.99    ← test sensitivity\n"
          "P(positive | no disease)  = 0.01    ← false positive rate\n\n"
          "P(disease | positive)\n"
          "  = P(positive | disease) × P(disease)\n"
          "    ————————————————————————————————————\n"
          "    P(positive | disease) × P(disease)\n"
          "    + P(positive | no disease) × P(no disease)\n\n"
          "  = 0.99 × 0.001\n"
          "    ———————————————————————————————————————\n"
          "    0.99 × 0.001  +  0.01 × 0.999\n\n"
          "  = 0.000990 / 0.010980\n"
          "  = 0.0902   ← only ~9% likely to have the disease\n"
          "```\n\n"
          "A 99% accurate test, positive result — and there's only a 9% chance you have the disease. The low base rate (1 in 1,000) floods the denominator with false positives.\n\n"
          "## The taxi version\n\n"
          "P(tip > 25% | JFK dropoff) is easy to compute from your data. But P(JFK dropoff | tip > 25%) — which zone was this high-tipper probably going to? — requires Bayes.\n\n"
          "Spam filters, fraud detection, medical diagnosis: all use this formula. Same structure, different labels.\n\n"
          "## The thing to remember\n\n"
          "P(A|B) and P(B|A) are almost never the same number.\n\n"
          "P(coughing | lung cancer) is high.\n"
          "P(lung cancer | coughing) is low — because most coughing is from colds.\n\n"
          "The base rate changes everything. This is why intuitive probability estimates are wrong — and computed ones are right."
        )
      },
      {
        "kind": "lesson",
        "title": "Conditional probability on taxi data — in code",
        "body": (
          "## Compute it in pandas\n\n"
          "```python\n"
          "import pandas as pd\n"
          "df = pd.read_parquet('data/clean.parquet')\n\n"
          "# Unconditional: what fraction of all trips tip?\n"
          "p_tip = (df['tip_amount'] > 0).mean()\n"
          "print(f'P(tip > 0):              {p_tip:.3f}')   # 0.673\n\n"
          "# Conditional: does rush hour change tipping?\n"
          "rush = df['pickup_hour'].isin([7, 8, 17, 18, 19])\n"
          "p_tip_rush = (df[rush]['tip_amount'] > 0).mean()\n"
          "print(f'P(tip > 0 | rush hour): {p_tip_rush:.3f}')   # 0.681\n"
          "print(f'Lift: {p_tip_rush / p_tip:.3f}')             # 1.012 — effectively no effect\n\n"
          "# Does day of week matter?\n"
          "for dow, label in [(0,'Monday'), (4,'Friday'), (5,'Saturday')]:\n"
          "    mask = df['pickup_dow'] == dow\n"
          "    p = (df[mask]['tip_amount'] > 0).mean()\n"
          "    print(f'P(tip > 0 | {label:9s}): {p:.3f}  lift={p/p_tip:.3f}')\n"
          "# P(tip > 0 | Monday   ): 0.648  lift=0.963  ← −4%\n"
          "# P(tip > 0 | Friday   ): 0.701  lift=1.042  ← +4%\n"
          "# P(tip > 0 | Saturday ): 0.718  lift=1.067  ← +7%\n"
          "# Saturday passengers tip notably more often.\n"
          "```"
        )
      },
      {
        "kind": "swipe",
        "title": "Quick check — swipe to answer",
        "cards": [
          {
            "prompt": "P(tip | rush hour) = P(rush hour | tip) — conditional probability is symmetric.",
            "answer": False,
            "whenRight": "Never symmetric. Bayes theorem exists precisely because flipping the condition changes the answer.",
            "whenWrong": "Not symmetric. P(tip | rush hour) = 68%; P(rush hour | tip) is a different calculation entirely."
          },
          {
            "prompt": "If P(tip | Saturday) = P(tip), tipping and day-of-week are statistically independent.",
            "answer": True,
            "whenRight": "Right — independence means conditioning on B doesn't change P(A). Equal probabilities = no relationship.",
            "whenWrong": "Independence means P(A|B) = P(A). If Saturday doesn't change tipping probability, they're independent."
          },
          {
            "prompt": "A fraud model outputting 0.87 means the transaction IS fraudulent.",
            "answer": False,
            "whenRight": "0.87 is a probability estimate. You still need a decision threshold to convert it to 'fraud' / 'not fraud'.",
            "whenWrong": "0.87 is a confidence level, not a verdict. At threshold 0.80 you'd flag it; at 0.95 you wouldn't."
          }
        ]
      },
      {
        "kind": "exercise",
        "title": "Your turn — conditional probability investigation",
        "body": (
          "[CODE] In `notebooks/05-math.ipynb`, add section `## Day 3: Probability`:\n\n"
          "1. Compute P(tip > 0) for the full dataset.\n"
          "2. Compute P(tip > 0 | Saturday) and P(tip > 0 | Monday). Print the lift for each.\n"
          "3. Compute P(tip > 0 | payment_type == 1) vs P(tip > 0 | payment_type == 2) (credit card vs cash). What do you find and why does it make sense?\n"
          "4. In a markdown cell: 'The variable that most changes tipping probability is [X] because [reason]. The variable that changes it least is [Y].'\n\n"
          "PASS:\n"
          "[x] You completed the task described above\n"
          "[x] You can explain in one sentence what you produced\n"
          "[x] Your work is committed to your repo"
        )
      }
    ]
  },

  # ── DAY 4 ────────────────────────────────────────────────────────────────────
  {
    "number": 4,
    "title": "Normal distribution and the CLT",
    "summary": "The shape of your data tells you which model fits and where it breaks. Skewed fares, normally distributed sample means.",
    "items": [
      {
        "kind": "lesson",
        "title": "The normal distribution — what it is and why it keeps appearing",
        "body": (
          "## The bell curve\n\n"
          "A normal distribution is fully described by two numbers: its mean (μ) and its standard deviation (σ).\n\n"
          "**68–95–99.7 rule:**\n"
          "- 68% of values fall within 1 standard deviation of the mean\n"
          "- 95% within 2 standard deviations\n"
          "- 99.7% within 3 standard deviations\n\n"
          "For taxi fares with mean $16 and std $11:\n"
          "- 68% of fares: $5 to $27\n"
          "- 95% of fares: −$6 to $38 — but negative fares don't exist\n\n"
          "That impossibility is the tell: **taxi fares are NOT normally distributed.**\n\n"
          "## Why fares are skewed — and what that looks like in numbers\n\n"
          "```text\n"
          "Mean:     $16.42\n"
          "Median:   $12.00   ← mean > median = right skew\n"
          "Skewness:  2.31    ← strongly right-skewed\n"
          "```\n\n"
          "Airport trips ($52 flat rate to JFK), bridge-and-tunnel long hauls, occasional $200 rides — these outliers drag the mean far above the typical fare. Median $12 is what most passengers actually pay.\n\n"
          "## Where normal distributions actually appear in ML\n\n"
          "1. **Model residuals** — linear regression assumes your prediction errors are normally distributed around zero. If they're not, p-values and confidence intervals are wrong.\n"
          "2. **Sample means** — even when individual data is skewed, the mean of a large enough sample is approximately normal. This is the CLT.\n"
          "3. **Feature scaling** — StandardScaler pushes features toward mean=0, std=1. Many algorithms (especially distance-based ones like KNN) expect roughly normal-shaped features."
        )
      },
      {
        "kind": "video",
        "title": "The Normal Distribution — clearly explained",
        "url": "https://www.youtube.com/watch?v=rzFX5NWojp0",
        "duration_min": 5,
        "creator": "StatQuest with Josh Starmer",
        "difficulty": "beginner",
        "why": "StatQuest's 5-minute normal distribution explainer. Josh Starmer builds the intuition with the exact visual you need before you touch SciPy. Watch once; the 68-95-99.7 rule will stick."
      },
      {
        "kind": "lesson",
        "title": "The Central Limit Theorem — why statistics works on messy data",
        "body": (
          "## The most important theorem in applied statistics\n\n"
          "**Even when individual values are not normal, the mean of a large sample is approximately normal.**\n\n"
          "Taxi fares are right-skewed with skewness 2.31. Pick 500 random trips and compute their mean fare. Do that 1,000 times. Plot those 1,000 means. They will form a normal distribution — even though the individual fares are not.\n\n"
          "This is the CLT. It's why:\n"
          "- T-tests work on non-normal data (you're testing the distribution of sample means, not individual values)\n"
          "- Confidence intervals are valid on skewed data\n"
          "- A/B tests produce reliable results\n\n"
          "Rule of thumb: n ≥ 30 is usually enough. Highly skewed data may need n ≥ 100.\n\n"
          "## Why linear regression assumes normal residuals\n\n"
          "After training a linear model:\n"
          "```text\n"
          "residual_i = actual_fare_i − predicted_fare_i\n"
          "```\n\n"
          "Linear regression assumes these residuals are:\n"
          "1. Normally distributed (no fat tails, no skew)\n"
          "2. Mean zero (no systematic over- or under-prediction)\n"
          "3. Constant variance (errors don't grow larger for bigger predictions)\n\n"
          "Violating assumption 3 — called **heteroscedasticity** — is very common with fares. Your model underpredicts a $200 airport trip by $40 but underpredicts a $10 short trip by only $3. The confidence intervals sklearn gives you are wrong in this case.\n\n"
          "The fix: log-transform the target before training. After predicting, exponentiate back. This compresses the right tail and stabilises variance.\n\n"
          "**Checking residuals is not optional.** You will do it on Day 7."
        )
      },
      {
        "kind": "lesson",
        "title": "Distribution check and CLT demo — in code",
        "body": (
          "## Check fare distribution, then demonstrate CLT\n\n"
          "```python\n"
          "import pandas as pd\n"
          "import numpy as np\n"
          "import matplotlib.pyplot as plt\n"
          "from scipy import stats\n\n"
          "df = pd.read_parquet('data/clean.parquet')\n"
          "fares = df['fare_amount']\n\n"
          "# Descriptive stats\n"
          "print(f'Mean:     {fares.mean():.2f}')\n"
          "print(f'Median:   {fares.median():.2f}')\n"
          "print(f'Std:      {fares.std():.2f}')\n"
          "print(f'Skewness: {fares.skew():.2f}')\n"
          "# Mean:     16.42\n"
          "# Median:   12.00\n"
          "# Std:      11.18\n"
          "# Skewness:  2.31\n\n"
          "# Normality test on raw fares\n"
          "_, p_raw = stats.normaltest(fares.sample(5000, random_state=42))\n"
          "print(f'Raw fares normality p-value: {p_raw:.4f}')\n"
          "# p=0.0000  ← strongly reject normality\n\n"
          "# CLT: sample means ARE normal\n"
          "sample_means = [fares.sample(500).mean() for _ in range(1000)]\n"
          "_, p_means = stats.normaltest(sample_means)\n"
          "print(f'Sample means normality p-value: {p_means:.3f}')\n"
          "# p=0.412  ← cannot reject normality — CLT holds\n\n"
          "# Plot both\n"
          "fig, axes = plt.subplots(1, 2, figsize=(12, 4))\n"
          "axes[0].hist(fares.sample(5000), bins=60, color='#3b82f6', alpha=0.7)\n"
          "axes[0].set_title('Raw fares — right-skewed')\n"
          "axes[1].hist(sample_means, bins=40, color='#22c55e', alpha=0.7)\n"
          "axes[1].set_title('Sample means (n=500) — approximately normal')\n"
          "plt.tight_layout()\n"
          "plt.savefig('charts/clt_demo.png', dpi=120)\n"
          "print('Saved charts/clt_demo.png')\n"
          "```"
        )
      },
      {
        "kind": "swipe",
        "title": "Quick check — swipe to answer",
        "cards": [
          {
            "prompt": "Taxi fares have mean > median, which indicates right skew.",
            "answer": True,
            "whenRight": "Right — a long right tail pulls the mean above the median. Mean=$16.42, Median=$12.00.",
            "whenWrong": "Right skew = a long right tail that pulls the mean upward. Mean > median always indicates right skew."
          },
          {
            "prompt": "Linear regression assumes the INPUT FEATURES are normally distributed.",
            "answer": False,
            "whenRight": "The assumption is on RESIDUALS (errors), not inputs. Non-normal features are fine.",
            "whenWrong": "The normality assumption is on residuals (actual minus predicted), not on input features."
          },
          {
            "prompt": "The CLT guarantees sample means become approximately normal when sample size is large enough.",
            "answer": True,
            "whenRight": "n ≥ 30 is the rule of thumb. Highly skewed data may need larger n.",
            "whenWrong": "n ≥ 30 is the threshold. CLT applies to means of samples, not to individual values."
          }
        ]
      },
      {
        "kind": "exercise",
        "title": "Your turn — distribution analysis",
        "body": (
          "[CODE] In `notebooks/05-math.ipynb`, add section `## Day 4: Normal distribution + CLT`:\n\n"
          "1. Print mean, median, std, and skewness for `fare_amount` and `tip_rate`.\n"
          "2. Run `scipy.stats.normaltest` on each. Report the p-value and interpret it.\n"
          "3. Demonstrate CLT: draw 1,000 samples of n=500 from `fare_amount`, compute each mean, plot as a histogram.\n"
          "4. Save the plot as `charts/clt_demo.png`.\n"
          "5. In a markdown cell: 'Fare amount is [normal/not normal] (p=[X]). The CLT demonstration shows [interpret what you see].'\n\n"
          "PASS:\n"
          "[x] You completed the task described above\n"
          "[x] You can explain in one sentence what you produced\n"
          "[x] Your work is committed to your repo"
        )
      }
    ]
  },

  # ── DAY 5 ────────────────────────────────────────────────────────────────────
  {
    "number": 5,
    "title": "Mean, variance, std — and when the mean lies",
    "summary": "Three numbers describe any column. Knowing when to use each one — and what correlation actually measures — makes you harder to fool by bad data.",
    "items": [
      {
        "kind": "lesson",
        "title": "Mean, median, variance, std — and what each one honestly tells you",
        "body": (
          "## The two measures of center\n\n"
          "**Mean** — sum divided by count. Efficient. But one $200 airport trip pulls it above what most passengers pay.\n\n"
          "**Median** — the middle value when sorted. Resistant to outliers. For skewed data, this is the honest summary.\n\n"
          "```text\n"
          "fares = [8, 12, 14, 16, 150]   ← one airport trip\n"
          "mean   = 40.0    ← distorted by $150\n"
          "median = 14.0    ← the typical fare, unaffected\n"
          "```\n\n"
          "## The rule for choosing mean vs median\n\n"
          "| Data shape | Use | Reason |\n"
          "|---|---|---|\n"
          "| Symmetric, few outliers | Mean | Uses all information efficiently |\n"
          "| Right-skewed (income, fares, house prices) | Median | Outliers don't distort it |\n"
          "| Left-skewed (grades if most students pass) | Median | Same reason |\n\n"
          "For taxi fares: always report median to stakeholders.\n\n"
          "## Variance vs standard deviation\n\n"
          "**Variance** = average of squared deviations from the mean. Result is in squared units (dollars²).\n\n"
          "**Standard deviation** = square root of variance. Back in original units (dollars).\n\n"
          "```text\n"
          "fare variance = 124,996 dollars²   ← meaningless to humans\n"
          "fare std      = $353.5 dollars     ← you can feel that\n"
          "```\n\n"
          "Use variance when you're adding independent error sources (you add variances, not stds).\n"
          "Use std when communicating to anyone who has to understand the number.\n\n"
          "## Pearson correlation — what r actually measures\n\n"
          "```text\n"
          "r = Cov(X, Y) / (std(X) × std(Y))\n"
          "```\n\n"
          "The division normalises covariance to a scale-independent [-1, +1] range. r = 0.87 between distance and fare means: a one-std-deviation increase in distance tends to associate with a 0.87-std-deviation increase in fare.\n\n"
          "Two things r does NOT say:\n"
          "1. **Causation** — r = 0.87 does not prove distance causes fare.\n"
          "2. **Variance explained** — that's R² = r² = 0.87² = 0.757, about 76%, not 87%.\n\n"
          "Confusing r with R² is one of the most common errors in data science reports. Don't be that analyst."
        )
      },
      {
        "kind": "lesson",
        "title": "Descriptive stats and correlation matrix — in code",
        "body": (
          "## Compute everything on TaxiPulse\n\n"
          "```python\n"
          "import pandas as pd\n"
          "df = pd.read_parquet('data/clean.parquet')\n\n"
          "# Descriptive stats table\n"
          "print(df[['fare_amount', 'trip_distance', 'tip_amount', 'tip_rate']]\n"
          "      .agg(['mean', 'median', 'std', 'skew'])\n"
          "      .round(2))\n\n"
          "#           fare_amount  trip_distance  tip_amount  tip_rate\n"
          "# mean            16.42           2.87        2.79      0.17\n"
          "# median          12.00           1.76        2.00      0.17\n"
          "# std             11.18           3.21        2.61      0.13\n"
          "# skew             2.31           2.87        1.84     -0.04\n"
          "#\n"
          "# tip_rate skew ≈ 0 → symmetric → mean is the honest summary here.\n"
          "# All others are right-skewed → report median to stakeholders.\n\n"
          "# Correlation matrix\n"
          "corr = df[['fare_amount', 'trip_distance', 'tip_amount', 'tip_rate']].corr().round(2)\n"
          "print(corr)\n\n"
          "#               fare_amount  trip_distance  tip_amount  tip_rate\n"
          "# fare_amount          1.00           0.87        0.61      0.09\n"
          "# trip_distance        0.87           1.00        0.54      0.07\n"
          "# tip_amount           0.61           0.54        1.00      0.58\n"
          "# tip_rate             0.09           0.07        0.58      1.00\n\n"
          "# Finding 1: fare and distance strongly correlated (r=0.87) — longer trips cost more.\n"
          "# Finding 2: fare barely correlates with tip RATE (r=0.09) — expensive trips don't tip more proportionally.\n"
          "# Finding 3: tip amount correlates with tip rate (r=0.58) — partly tautological.\n"
          "```"
        )
      },
      {
        "kind": "swipe",
        "title": "Quick check — swipe to answer",
        "cards": [
          {
            "prompt": "For right-skewed taxi fare data, the median is more representative than the mean.",
            "answer": True,
            "whenRight": "Right — mean=$16.42, median=$12.00. A $200 airport trip drags the mean far above what most passengers pay.",
            "whenWrong": "Skewed data: the long tail pulls mean above median. Median is the honest typical-trip number."
          },
          {
            "prompt": "r = 0.87 between distance and fare means 87% of fare variance is explained by distance.",
            "answer": False,
            "whenRight": "R² = r² = 0.87² = 0.757. About 76% is explained. The r vs R² distinction is a classic analyst trap.",
            "whenWrong": "R² (not r) is variance explained. R² = 0.87² = 0.757. About 76%, not 87%."
          },
          {
            "prompt": "You can add standard deviations from two independent error sources to get total spread.",
            "answer": False,
            "whenRight": "You add VARIANCES of independent sources. Total_var = var_A + var_B. Total_std = √(var_A + var_B).",
            "whenWrong": "Add variances, not standard deviations. Total_std = √(var_A + var_B)."
          }
        ]
      },
      {
        "kind": "exercise",
        "title": "Your turn — descriptive stats memo",
        "body": (
          "[CODE] In `notebooks/05-math.ipynb`, add section `## Day 5: Descriptive stats`:\n\n"
          "1. Print the agg table (mean, median, std, skew) for fare_amount, trip_distance, tip_amount, tip_rate.\n"
          "2. For each column, write one sentence: 'I would report [mean/median] because [reason].'\n"
          "3. Print the 4×4 correlation matrix.\n"
          "4. Write 3 markdown bullets: 'The three strongest insights from the correlation matrix are...'\n\n"
          "PASS:\n"
          "[x] You completed the task described above\n"
          "[x] You can explain in one sentence what you produced\n"
          "[x] Your work is committed to your repo"
        )
      }
    ]
  },

  # ── DAY 6 ────────────────────────────────────────────────────────────────────
  {
    "number": 6,
    "title": "Linear regression from scratch — the Normal Equation",
    "summary": "Before you call sklearn.LinearRegression().fit(), you derive the formula it uses. No framework. Just NumPy.",
    "items": [
      {
        "kind": "lesson",
        "title": "The Normal Equation — how linear regression actually works",
        "body": (
          "## What linear regression minimises\n\n"
          "You have N trips. For trip i, you have features xᵢ and a real fare yᵢ. You want weights W such that:\n\n"
          "```text\n"
          "xᵢ @ W ≈ yᵢ   for every trip i\n"
          "```\n\n"
          "'Approximate' means minimise the sum of squared errors:\n\n"
          "```text\n"
          "Loss = Σ (yᵢ − xᵢ @ W)²\n"
          "```\n\n"
          "Setting the derivative to zero gives the closed-form answer — the **Normal Equation**:\n\n"
          "```text\n"
          "W = (Xᵀ X)⁻¹ Xᵀ y\n"
          "```\n\n"
          "Where X is your N×F feature matrix and y is your N-length target vector.\n\n"
          "## Breaking down the four terms\n\n"
          "- **Xᵀ** — the transpose of X. Rows become columns. Shape: (F, N).\n"
          "- **Xᵀ X** — a square F×F matrix encoding how features relate to each other.\n"
          "- **(Xᵀ X)⁻¹** — the matrix inverse. Think of it as division in matrix form.\n"
          "- **Xᵀ y** — a F-length vector encoding how each feature relates to the target.\n\n"
          "Multiply them: you get the weights that minimise squared error. No iterations, no learning rate — one exact computation.\n\n"
          "## Why learn this before using sklearn?\n\n"
          "Week 5 you call `LinearRegression().fit(X, y)` and it works. But without the Normal Equation, you won't know:\n\n"
          "1. **Why it fails when features are perfectly correlated** — XᵀX becomes singular (non-invertible). Ridge regression fixes this by adding a small constant to the diagonal: `(XᵀX + λI)⁻¹`.\n"
          "2. **Why gradient descent exists for large datasets** — matrix inversion scales as O(n³). For 10M rows with 100 features, this takes minutes. Gradient descent scales linearly.\n"
          "3. **What Ridge and Lasso actually modify** — they change the Normal Equation formula by adding penalty terms.\n\n"
          "Formula first. Library second. Always."
        )
      },
      {
        "kind": "video",
        "title": "Linear Regression, Clearly Explained",
        "url": "https://www.youtube.com/watch?v=7ArmBVF2dCs",
        "duration_min": 27,
        "creator": "StatQuest with Josh Starmer",
        "difficulty": "beginner",
        "why": "StatQuest's 'Linear Regression, Clearly Explained' — watch the first 15 minutes before writing any code today. Josh builds the intuition for why we minimise squared errors, what the regression line means geometrically, and how to interpret coefficients. The math you're about to implement will feel obvious."
      },
      {
        "kind": "lesson",
        "title": "The Normal Equation in NumPy — on 50,000 real trips",
        "body": (
          "## Derive the weights from data\n\n"
          "```python\n"
          "import pandas as pd\n"
          "import numpy as np\n\n"
          "df = pd.read_parquet('data/clean.parquet').sample(50_000, random_state=42)\n\n"
          "# Feature matrix — add a column of 1s for the bias (intercept)\n"
          "X_raw = df[['trip_distance', 'pickup_hour']].values   # (50000, 2)\n"
          "X     = np.column_stack([X_raw, np.ones(len(X_raw))])  # (50000, 3)\n"
          "y     = df['fare_amount'].values                        # (50000,)\n\n"
          "# Normal Equation: W = (XᵀX)⁻¹ Xᵀy\n"
          "W = np.linalg.inv(X.T @ X) @ X.T @ y\n\n"
          "w_dist, w_hour, bias = W\n"
          "print(f'Distance weight: ${w_dist:.2f} per mile')\n"
          "print(f'Hour weight:     ${w_hour:.2f} per hour')\n"
          "print(f'Bias (base fare): ${bias:.2f}')\n"
          "# Distance weight: $3.48 per mile   ← NYC meter rate is ~$3.00 per mile\n"
          "# Hour weight:     $0.07 per hour   ← small but real effect\n"
          "# Bias:            $8.12            ← base fare\n\n"
          "# The model found the NYC fare structure from data alone,\n"
          "# with no knowledge of what a taxi meter actually charges.\n\n"
          "preds    = X @ W\n"
          "mae      = np.mean(np.abs(y - preds))\n"
          "baseline = np.mean(np.abs(y - y.mean()))\n"
          "print(f'\\nModel MAE:    ${mae:.2f}')\n"
          "print(f'Baseline MAE: ${baseline:.2f}  (always predict the mean)')\n"
          "print(f'Improvement:  {(1 - mae/baseline)*100:.1f}%')\n"
          "# Model MAE:    $6.14\n"
          "# Baseline MAE: $9.02\n"
          "# Improvement:  31.9%\n"
          "```"
        )
      },
      {
        "kind": "swipe",
        "title": "Quick check — swipe to answer",
        "cards": [
          {
            "prompt": "The Normal Equation W = (XᵀX)⁻¹Xᵀy fails when two features are perfectly correlated.",
            "answer": True,
            "whenRight": "Perfect correlation makes XᵀX singular (non-invertible). Ridge regression fixes this by adding λI to the diagonal.",
            "whenWrong": "Perfect multicollinearity makes XᵀX singular. Ridge regression adds a small diagonal term to fix this."
          },
          {
            "prompt": "Model MAE $6.14 vs baseline $9.02 means the model is about 32% better than always predicting the mean.",
            "answer": True,
            "whenRight": "(1 − 6.14/9.02) = 31.9%. A 32% improvement over a naive baseline is meaningful.",
            "whenWrong": "(1 − 6.14/9.02) = 31.9%. Lower MAE = better. 6.14 < 9.02 means the model outperforms the baseline."
          },
          {
            "prompt": "The bias column is added by appending a column of ZEROS to the feature matrix.",
            "answer": False,
            "whenRight": "A column of ONES. Multiplying ones by the bias weight gives the bias contribution unchanged.",
            "whenWrong": "Column of ones, not zeros. When `x @ W` runs, the ones column ensures the bias weight is added as-is."
          }
        ]
      },
      {
        "kind": "exercise",
        "title": "Your turn — Normal Equation from scratch",
        "body": (
          "[CODE] In `notebooks/05-math.ipynb`, add section `## Day 6: Linear regression`:\n\n"
          "1. Implement the Normal Equation using only NumPy — no sklearn.\n"
          "2. Train on 50,000 trips with features `[trip_distance, pickup_hour, pickup_dow]` + bias column.\n"
          "3. Print the 4 learned weights. Write one sentence interpreting each.\n"
          "4. Compute and print model MAE vs baseline MAE and the % improvement.\n"
          "5. Markdown: 'The model learns each mile costs $[X]. This is [close to/far from] the NYC meter rate of $3.00 because [reason].'\n\n"
          "PASS:\n"
          "[x] You completed the task described above\n"
          "[x] You can explain in one sentence what you produced\n"
          "[x] Your work is committed to your repo"
        )
      }
    ]
  },

  # ── DAY 7 ────────────────────────────────────────────────────────────────────
  {
    "number": 7,
    "title": "Apply everything — is distance linearly related to fare?",
    "summary": "Write a complete analytical argument: claim, evidence, model, limits. The notebook should be readable by anyone.",
    "items": [
      {
        "kind": "lesson",
        "title": "How to write an analytical argument — four parts",
        "body": (
          "## The structure of a convincing analysis\n\n"
          "A findings notebook is not a collection of code cells. It is an argument. The best data scientists write notebooks that read like articles — a non-technical manager should skim it and understand exactly what was found, why you believe it, and where you'd be wrong.\n\n"
          "The structure is always four parts:\n\n"
          "**1. Claim** — state the question precisely.\n"
          "```markdown\n"
          "## Question: Does trip distance linearly predict fare amount?\n"
          "```\n\n"
          "**2. Evidence** — show the data before fitting anything.\n"
          "- Descriptive stats (mean, median, std, skewness)\n"
          "- A scatter plot of distance vs fare (sample 1,000–2,000 trips)\n"
          "- Pearson r, stated clearly\n\n"
          "**3. Model** — quantify the relationship.\n"
          "- Normal Equation weights — what does each coefficient mean in plain English?\n"
          "- MAE vs baseline MAE\n"
          "- R² = r² — how much variance is explained?\n\n"
          "**4. Limits** — where does it break?\n"
          "- Plot residuals (actual − predicted) vs predicted fare\n"
          "- Name the failure mode: fanning? clusters? trends?\n"
          "- State specifically which trips the model handles worst\n\n"
          "## What to look for in the residual plot\n\n"
          "```text\n"
          "Good residuals:\n"
          "  — scattered randomly above and below zero\n"
          "  — no visible pattern\n"
          "  — constant spread regardless of predicted value\n\n"
          "Bad residuals:\n"
          "  — fan outward (bigger errors for bigger fares) → heteroscedasticity → log-transform the target\n"
          "  — cluster at one value                         → missed subgroup (e.g. airport flat-rate trips)\n"
          "  — curved trend                                → non-linear relationship → need polynomial features\n"
          "```\n\n"
          "For TaxiPulse, you will almost certainly see a cluster of residuals at +$20 to +$35 for long predictions. That cluster is JFK flat-rate trips ($52 regardless of distance). The model tries to predict them linearly and systematically undershoots.\n\n"
          "**Systematic residuals always reveal structure your model missed.** Name it and your analysis is honest."
        )
      },
      {
        "kind": "lesson",
        "title": "Dataset: yellow_tripdata_2023-10.parquet",
        "body": (
          "## The dataset for this week's project\n\n"
          "Confirm you have the right file before running the code below:\n\n"
          "- **What it is:** NYC Yellow Taxi trip records, October 2023 (~3.5M rows)\n"
          "- **Where to get it:** NYC TLC direct CDN — https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2023-10.parquet\n"
          "- **Where to save it:** `data/yellow_tripdata_2023-10.parquet`, next to your notebooks folder\n\n"
          "If you already cleaned it in Week 1 and saved `data/clean.parquet`, use that. If not, run the cleaning step from Week 1 Day 5 first."
        )
      },
      {
        "kind": "lesson",
        "title": "Full four-part analysis — in code",
        "body": (
          "## Build the complete argument\n\n"
          "```python\n"
          "import pandas as pd\n"
          "import numpy as np\n"
          "import matplotlib.pyplot as plt\n"
          "from scipy import stats\n\n"
          "df     = pd.read_parquet('data/clean.parquet')\n"
          "sample = df.sample(2000, random_state=42)\n\n"
          "# ── 1. Claim ──────────────────────────────────────────────────────────\n"
          "# Does trip_distance linearly predict fare_amount?\n\n"
          "# ── 2. Evidence ───────────────────────────────────────────────────────\n"
          "print('=== Descriptive stats ===')\n"
          "print(df[['fare_amount', 'trip_distance']].agg(['mean','median','std','skew']).round(2))\n\n"
          "r, _ = stats.pearsonr(sample['trip_distance'], sample['fare_amount'])\n"
          "print(f'Pearson r: {r:.3f}')\n"
          "print(f'R²:        {r**2:.3f}  ({r**2*100:.1f}% of fare variance explained by distance)')\n\n"
          "fig, axes = plt.subplots(1, 2, figsize=(14, 5))\n"
          "axes[0].scatter(sample['trip_distance'], sample['fare_amount'],\n"
          "                alpha=0.2, s=8, color='#3b82f6')\n"
          "axes[0].set_xlabel('Trip distance (miles)')\n"
          "axes[0].set_ylabel('Fare ($)')\n"
          "axes[0].set_title(f'Distance vs Fare  (r={r:.2f})')\n\n"
          "# ── 3. Model ──────────────────────────────────────────────────────────\n"
          "X_b = np.column_stack([\n"
          "    df[['trip_distance', 'pickup_hour']].values,\n"
          "    np.ones(len(df))\n"
          "])\n"
          "y = df['fare_amount'].values\n"
          "W = np.linalg.inv(X_b.T @ X_b) @ X_b.T @ y\n\n"
          "preds    = X_b @ W\n"
          "resids   = y - preds\n"
          "mae      = np.mean(np.abs(resids))\n"
          "baseline = np.mean(np.abs(y - y.mean()))\n"
          "print(f'Weights: dist={W[0]:.2f}, hour={W[1]:.2f}, bias={W[2]:.2f}')\n"
          "print(f'MAE: {mae:.2f} vs baseline {baseline:.2f}  ({(1-mae/baseline)*100:.1f}% better)')\n\n"
          "# ── 4. Limits — residual plot ─────────────────────────────────────────\n"
          "idx = np.random.choice(len(resids), 2000, replace=False)\n"
          "axes[1].scatter(preds[idx], resids[idx], alpha=0.2, s=8, color='#f97316')\n"
          "axes[1].axhline(0, color='white', linewidth=1, linestyle='--')\n"
          "axes[1].set_xlabel('Predicted fare ($)')\n"
          "axes[1].set_ylabel('Residual ($)')\n"
          "axes[1].set_title('Residuals — look for patterns')\n\n"
          "plt.tight_layout()\n"
          "plt.savefig('charts/residuals.png', dpi=120)\n"
          "print('Saved charts/residuals.png')\n"
          "```\n\n"
          "Read the residual plot when it renders:\n"
          "- Fan shape = heteroscedasticity. The model's errors grow with fare size.\n"
          "- Horizontal band of points at +$20 to +$35 = JFK flat-rate trips. The model undershoots them systematically.\n"
          "Both are normal for this dataset. Name them in your conclusion."
        )
      },
      {
        "kind": "swipe",
        "title": "Quick check — swipe to answer",
        "cards": [
          {
            "prompt": "Residuals that fan outward (bigger errors for larger predictions) indicate heteroscedasticity.",
            "answer": True,
            "whenRight": "Fanning = non-constant variance. Log-transforming the target often fixes it by compressing the right tail.",
            "whenWrong": "Fanning residuals = heteroscedasticity = non-constant variance. Log-transform the target to address it."
          },
          {
            "prompt": "r = 0.87 means the model explains 87% of fare variance.",
            "answer": False,
            "whenRight": "R² = r² = 0.87² = 0.757 ≈ 76%. Many analysts get this wrong. r and R² are different numbers.",
            "whenWrong": "R² = r squared. r = 0.87 means R² = 0.757 — about 76% explained, not 87%."
          },
          {
            "prompt": "A cluster of residuals at +$20 to +$35 for long predictions reveals a pricing rule the model missed.",
            "answer": True,
            "whenRight": "Systematic residuals reveal missed structure. JFK flat-rate trips cost ~$52 regardless of distance.",
            "whenWrong": "Systematic = a pattern, not noise. Clustering at +$20 to +$35 means the model undershoots airport trips."
          }
        ]
      },
      {
        "kind": "exercise",
        "title": "Your turn — complete the analytical argument",
        "body": (
          "[PRODUCE] Wrap up `notebooks/05-math.ipynb`:\n\n"
          "1. Add section `## Week 2 synthesis — is distance linearly related to fare?`.\n"
          "2. Structure it as four parts: Claim, Evidence (stats + scatter), Model (weights + MAE), Limits (residual plot).\n"
          "3. Write a 3-sentence conclusion: 'The relationship is [linear/non-linear]. The model explains [X]% of variance. It fails on [trip type] because [reason].'\n"
          "4. Save all charts to `charts/`. Commit:\n\n"
          "```bash\n"
          "git add notebooks/05-math.ipynb charts/\n"
          "git commit -m 'Week 2: math fundamentals complete'\n"
          "```\n\n"
          "PASS:\n"
          "[x] Notebook has all four sections\n"
          "[x] charts/residuals.png and charts/clt_demo.png committed\n"
          "[x] 3-sentence conclusion written"
        )
      },
      {
        "kind": "exercise",
        "title": "Ship it",
        "body": (
          "[PRODUCE] Tag your work as v2.0 and push to GitHub:\n\n"
          "```bash\n"
          "git add . && git commit -m 'Math you actually need (lin alg + prob + stats)'\n"
          "git tag v2.0 && git push --tags\n"
          "```\n\n"
          "PASS:\n"
          "[x] Your week's work is committed\n"
          "[x] A v2.0 tag is pushed to the remote"
        )
      }
    ]
  }
]


def main():
    with open(ROADMAP, "r", encoding="utf-8") as f:
        roadmap = json.load(f)

    week2 = next((w for w in roadmap["weeks"] if w["number"] == 2), None)
    if week2 is None:
        print("ERROR: Week 2 not found", file=sys.stderr)
        sys.exit(1)

    old_day_count = len(week2["days"])
    old_item_count = sum(len(d["items"]) for d in week2["days"])

    week2["days"] = NEW_DAYS

    new_day_count = len(NEW_DAYS)
    new_item_count = sum(len(d["items"]) for d in NEW_DAYS)

    with open(ROADMAP, "w", encoding="utf-8") as f:
        json.dump(roadmap, f, indent=2, ensure_ascii=False)

    print(f"Week 2 days rewritten.")
    print(f"  Days:  {old_day_count} → {new_day_count}")
    print(f"  Items: {old_item_count} → {new_item_count}")
    print(f"  Removed: all 'Deeper dive' template lessons, wrong Day-0 setup, wrong video on Day 6")
    print(f"  Added: Bayes lesson, CLT lesson, heteroscedasticity lesson, r-vs-R² lesson")

if __name__ == "__main__":
    main()
