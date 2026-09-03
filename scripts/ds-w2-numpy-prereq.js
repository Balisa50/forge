// Patch DS W2 D1 to teach NumPy BEFORE the vector / dot-product lesson.
// Critical: NO NEW DAY. We prepend a NumPy lesson + canonical reading + a
// dedicated "Quick check — NumPy basics" swipe into D1's existing items
// array. The downstream vector lesson now has a real prerequisite to lean on.
const path = require('path');
const fs = require('fs');
const FILE = path.join(__dirname, '..', 'data', 'roadmaps', 'data-science.json');
const ds = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const w2 = ds.weeks[1]; // W2: Math you actually need
if (!w2 || !w2.days || !w2.days[0]) throw new Error('DS W2 D1 not found');
const d1 = w2.days[0];

// Guard against double-patching — run the script twice = no duplicate.
const alreadyPatched = d1.items.some(
  (it) => it.kind === 'lesson' && /numpy.{0,20}foundation/i.test(it.title || '')
);
if (alreadyPatched) {
  console.log('SKIP — D1 already has the NumPy prerequisite lesson. No change.');
  process.exit(0);
}

const numpyLesson = {
  kind: 'lesson',
  title: 'NumPy — the foundation under every line of code today',
  body:
"## Why this comes first\n" +
"Every code sample in the rest of this week uses **NumPy** — `np.array`, `np.dot`, `np.linalg.norm`. You will not understand the dot-product code below if you have not met NumPy. Read this lesson FIRST, then read the vector lesson under it.\n\n" +
"NumPy is a Python library for fast numerical arrays. It is the bedrock of pandas, scikit-learn, PyTorch, TensorFlow. If you use Python for data, you use NumPy — usually without realising it.\n\n" +
"## Install + import\n" +
"```bash\n" +
"pip install numpy\n" +
"```\n\n" +
"```python\n" +
"import numpy as np   # the universal alias. Every Python data tutorial uses np.\n" +
"```\n\n" +
"## NumPy arrays vs Python lists\n" +
"A Python list can hold anything: `[1, 'apple', 3.0, [9, 9]]`. A NumPy array holds ONE TYPE only and lives in a single contiguous block of memory. That single difference is why NumPy is 10–100× faster than equivalent list code.\n\n" +
"```python\n" +
"py_list = [1, 2, 3, 4, 5]                # plain Python list\n" +
"np_arr  = np.array([1, 2, 3, 4, 5])      # NumPy 1-D array\n\n" +
"py_list * 2   # [1, 2, 3, 4, 5, 1, 2, 3, 4, 5]   <- list duplication\n" +
"np_arr  * 2   # array([2, 4, 6, 8, 10])           <- element-wise multiply\n" +
"```\n\n" +
"That second result is the headline: arithmetic on NumPy arrays runs ELEMENT-WISE, no `for` loop required. This is what 'vectorised' code means.\n\n" +
"## Three ways to create an array\n" +
"```python\n" +
"a = np.array([1, 2, 3])           # from a Python list\n" +
"b = np.zeros(5)                    # array([0., 0., 0., 0., 0.])\n" +
"c = np.arange(0, 10, 2)            # array([0, 2, 4, 6, 8])\n" +
"```\n\n" +
"`a.shape` is `(3,)` (one-dimensional, length 3). `a.dtype` is `int64`. Every NumPy array has a shape and a dtype — that's the mental model: a typed grid of numbers.\n\n" +
"## Element-wise operations are the whole game\n" +
"```python\n" +
"distances = np.array([2.3, 5.1, 8.7, 1.2])\n" +
"fares     = np.array([7.5, 14.0, 22.0, 5.5])\n\n" +
"per_mile = fares / distances        # element-wise divide\n" +
"# array([3.26, 2.75, 2.53, 4.58])\n\n" +
"discounted = fares * 0.9            # scalar × array = scalar applied to every element\n" +
"# array([6.75, 12.6, 19.8, 4.95])\n" +
"```\n\n" +
"No loops. No list comprehensions. Operations vectorise over the whole array. This is the pattern you'll use thousands of times.\n\n" +
"## The dot product — the operation today's lesson needs you to know\n" +
"Two ways to write it. They do the same thing:\n\n" +
"```python\n" +
"trip    = np.array([2.3, 17.0, 4.0])\n" +
"weights = np.array([3.0, 0.1, -0.2])\n\n" +
"# Method 1 — the function form\n" +
"pred1 = np.dot(trip, weights)\n\n" +
"# Method 2 — the @ operator (introduced in Python 3.5; preferred for readability)\n" +
"pred2 = trip @ weights\n\n" +
"print(pred1, pred2)   # 7.8  7.8\n" +
"```\n\n" +
"The `@` operator was added to Python specifically for matrix / dot operations. Most modern data code uses `@`; older code uses `np.dot`. Both compile to the same fast C routine underneath.\n\n" +
"## Vector length (magnitude)\n" +
"You will see `np.linalg.norm` below. It is the length of a vector — square each element, sum, take the square root:\n\n" +
"```python\n" +
"v = np.array([3.0, 4.0])\n" +
"np.linalg.norm(v)   # 5.0   (because √(9 + 16) = 5 — the 3-4-5 triangle)\n" +
"```\n\n" +
"## What you now have to read the next lesson\n" +
"- `np.array([...])` — create an array.\n" +
"- `array1 @ array2` or `np.dot(array1, array2)` — dot product.\n" +
"- `np.linalg.norm(array)` — vector length.\n" +
"- Element-wise arithmetic — no loops needed.\n\n" +
"That is the entire NumPy surface this week needs. The rest you learn as you meet it."
};

const numpyReading = {
  kind: 'reading',
  title: 'NumPy quickstart (official docs)',
  url: 'https://numpy.org/doc/stable/user/quickstart.html',
  why: 'Read second, after the lesson above. The canonical NumPy primer. Skim the array-creation and basic-operations sections; skip indexing for now.'
};

const numpySwipe = {
  kind: 'swipe',
  title: 'Quick check — swipe to answer',
  cards: [
    { prompt: 'A NumPy array and a Python list behave identically when multiplied by a number.', answer: false,
      whenRight: "Right — different. `list * 3` duplicates the list. `np.array * 3` multiplies every element by 3.",
      whenWrong: "Different. NumPy is element-wise (every element × 3); Python lists duplicate (the list × 3 = three copies)." },
    { prompt: '`a @ b` and `np.dot(a, b)` compute the same dot product for 1-D arrays.', answer: true,
      whenRight: "Right — `@` is shorthand for the dot product (added in Python 3.5). Both call the same C routine.",
      whenWrong: "Yes — same operation, different syntax. `@` is preferred in modern code; `np.dot` is older but identical." },
    { prompt: 'NumPy arrays hold mixed types (numbers + strings + lists) just like Python lists.', answer: false,
      whenRight: "Right — single dtype only. That is exactly why NumPy can store the array in one contiguous memory block and run 10–100× faster.",
      whenWrong: "One dtype per array. The single-type rule is what makes NumPy fast; it is the whole point." }
  ]
};

// Prepend in order: lesson → reading → swipe. The existing items follow.
d1.items.unshift(numpyLesson, numpyReading, numpySwipe);

// Tighten the day's summary so the order is explicit.
d1.summary = 'NumPy first, then vectors and dot product. Without NumPy the code below is unreadable; with it, every line is a one-liner.';

// Also: the existing video on D1 is 3Blue1Brown's "Essence of Linear Algebra — Ep 1" at 15 min.
// That is at the 15-min hard cap; keep it. We are not adding a NumPy video item because we
// cannot verify the duration of any external NumPy intro without making a claim that could
// be wrong. The rich text lesson + official docs reading cover NumPy from zero per the spec
// ("If a video does not exist at that length, you will write a clear text explanation").

fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log(`SUCCESS — DS W2 D1 now teaches NumPy as a prerequisite. Items count: ${d1.items.length} (no new day).`);
