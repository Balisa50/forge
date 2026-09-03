// Rebuild DS W40-W41 to the teach->swipe->project standard.
// W40 Reinforcement Learning — the practical intro
// W41 Recommender Systems — the algorithms behind every feed
const fs = require('fs');
const FILE = 'C:/Users/Abdoulie Balisa/OneDrive/Desktop/FORGE/data/roadmaps/data-science.json';
const ds = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const L = (title, body) => ({ kind: 'lesson', title, body });
const V = (title, url, dm, creator, why) => ({ kind: 'video', title, url, duration_min: dm, creator, why });
const S = (cards) => ({ kind: 'swipe', title: 'Quick check — swipe to answer', cards });
const E = (title, body) => ({ kind: 'exercise', title, body });
const D = (number, title, summary, items) => ({ number, title, summary, items });

/* ════ WEEK 40 — Reinforcement Learning: the practical intro ════ */
const W40 = {
  number: 40, title: "Reinforcement Learning - the practical intro",
  phase: "Specialty", commitment_hours: "8-10",
  context: ds.weeks[39].context,
  concept_check: [
    { q: "Why is most production 'RL' actually contextual bandits, not deep RL?",
      choices: ["Trendier","Most real product decisions are single-step (which ad to show, which item to recommend) with immediate reward feedback — that's exactly the contextual-bandit problem. Multi-step deep RL is rare outside games and robotics",
        "Easier to spell","Random"],
      correct: 1, explain: "Deep RL solves multi-step sequential decision problems with delayed rewards (game playing, robotics navigation). Most product decisions a DS faces are single-step: pick the best action now, observe the immediate reward (click / no click), update. That's a contextual bandit. Calling it 'RL' is technically correct but misleading — the algorithms, the infra, and the math are far simpler than DQN / PPO." },
    { q: "What does 'exploration vs exploitation' mean in plain terms?",
      choices: ["Theory only","Exploitation: pick the action that LOOKS best given current data. Exploration: try a less-known action to learn whether it's actually better. Pure exploitation gets stuck on locally good answers; pure exploration never converges",
        "Buzzword","Random"],
      correct: 1, explain: "If you only ever pick the best-known action, you never learn whether an under-tried action is actually better — you get stuck in a local optimum. If you randomly explore, you waste reward on bad actions forever. The whole RL/bandits field is about balancing the two: enough exploration to find truly best actions, enough exploitation to actually earn rewards. ε-greedy, UCB, Thompson sampling are all answers to the same question." },
    { q: "Why is CartPole a fine FIRST RL implementation but a bad EVALUATION of RL?",
      choices: ["Old","CartPole is small enough to train in minutes — perfect for learning the algorithm shape. But it has a 2-action discrete space and a clean reward; success on CartPole doesn't transfer to harder problems. It's a 'hello world', not a benchmark",
        "Boring","Random"],
      correct: 1, explain: "CartPole is the right project for Day 2: simple enough that you can see Q-learning converge in a few hundred episodes, watch the cart balance, get the algorithmic intuition. But the algorithm that solves CartPole won't necessarily scale to Atari, let alone real-world problems. Don't conclude 'RL works' from CartPole; conclude 'I understand the basic loop'." }
  ],
  days: [
    D(1,"RL intuition","The contract: environment, actions, reward. No code today.",[
      L("RL in plain English",
"## What it is\n" +
"Supervised learning: you give the model labelled examples; it learns to predict labels.\n" +
"Reinforcement learning: you give the model an environment + a set of actions + a reward signal; it learns a policy by TRYING things and observing the consequences.\n\n" +
"## The contract\n" +
"```text\n" +
"At each step t:\n" +
"  - Agent observes state s_t (what the world looks like right now)\n" +
"  - Agent picks action a_t (from the available actions)\n" +
"  - Environment returns next state s_{t+1} and reward r_t\n" +
"  - Agent updates its policy π(a | s) based on the reward\n" +
"\n" +
"The goal: maximise cumulative discounted reward over time.\n" +
"```\n\n" +
"## The two flavours you'll meet this week\n" +
"```text\n" +
"DEEP RL (W40 Day 2 — CartPole)\n" +
"  - Multi-step, sequential decisions\n" +
"  - Rewards often DELAYED (you balance the pole for a while, then it falls)\n" +
"  - Needs Q-learning or policy gradients\n" +
"  - Examples: game-playing, robotics, navigation\n" +
"\n" +
"CONTEXTUAL BANDITS (W40 Day 4 — the practical version)\n" +
"  - Single-step decisions\n" +
"  - Reward IMMEDIATE (click or no click; bought or not)\n" +
"  - Simpler math — basically online classification + exploration\n" +
"  - Examples: which ad to show, which item to recommend, which email subject to send\n" +
"```\n\n" +
"## What this matters for you\n" +
"Junior DS learners often confuse 'I want to learn RL' with 'I'm going to deploy DQN at work'. The realistic version is:\n" +
"- You'll see deep RL in interview questions about how things like AlphaGo work\n" +
"- You'll DEPLOY contextual bandits in product work (ad selection, recommendation, A/B test scoring)\n" +
"- Knowing both — and the boundary between them — is the practical skill\n\n" +
"## This week\n" +
"- Day 2: Q-learning on CartPole — the 'hello world' of deep RL\n" +
"- Day 3: ε-greedy vs UCB — the exploration question, made concrete\n" +
"- Day 4: Contextual bandits — the algorithm that actually ships in product\n" +
"- Day 5: When RL is right (and when it's a misuse)\n" +
"- Day 6: Document a real product use case\n" +
"- Day 7: Ship + tag"
      ),
      V("RL in 100 seconds","https://www.youtube.com/watch?v=wOK0NtdGsKI",2,"Fireship","Watch first. Frames RL vs supervised in 100 seconds. The intuition before the math."),
      V("Reinforcement Learning, Briefly Explained","https://www.youtube.com/watch?v=JgvyzIkgxF0",10,"various","Watch second. 10-min visual walkthrough of the agent-environment loop, exploration vs exploitation, and what 'policy' actually means."),
      S([
        { prompt: "RL learns from labelled input-output pairs, like supervised learning does.", answer: false, whenRight: "Right — no. RL learns from rewards observed after trying actions in an environment. No labels.", whenWrong: "Different contract. Supervised = labels; RL = environment + rewards. The agent generates its own 'data' by acting." },
        { prompt: "Contextual bandits are single-step decisions with immediate reward feedback.", answer: true, whenRight: "Right — single decision, immediate reward, repeat. Simpler than full multi-step RL.", whenWrong: "Yes — one step, immediate feedback. That's why they fit ads / recs / ranking — the reward arrives quickly." },
        { prompt: "Most production 'RL' in product DS is actually contextual bandits, not deep RL.", answer: true, whenRight: "Right — single-step decisions dominate product work. Deep RL is the games-and-robotics specialty.", whenWrong: "Yes — bandits in product, deep RL in games + robotics. Knowing the boundary is the practical skill." }
      ]),
      E("Your turn — frame RL","[WRITE] In `rl/INTRO.md`:\n1. Explain the RL contract in 3 sentences in your own words.\n2. Name ONE product you use daily that probably uses contextual bandits (ad selection, feed ranking, email subject choice, etc.).\n3. Explain why bandits — not deep RL — are the right tool for that product.\n4. State the week's goal: 'I'll implement Q-learning on CartPole, then a contextual bandit, then document where each one fits.'")
    ]),
    D(2,"CartPole Q-learning","First RL implementation. ~30 min on a laptop.",[
      L("Q-learning on CartPole — the hello world",
"## What it is\n" +
"CartPole: a pole balanced on a cart. The agent applies left/right force; reward is +1 for each step the pole stays up. Episode ends when the pole tips past 12° or the cart leaves the screen.\n\n" +
"You'll implement Q-learning: the canonical value-based RL algorithm.\n\n" +
"## Q-learning, the equation\n" +
"```text\n" +
"Q(s, a) ← Q(s, a) + α · [ r + γ · max Q(s', a') − Q(s, a) ]\n" +
"                            └── target ──┘   └─ current ─┘\n" +
"\n" +
"α = learning rate (how fast to update)\n" +
"γ = discount factor (how much to value future reward, typically 0.99)\n" +
"r = immediate reward\n" +
"s' = next state\n" +
"```\n\n" +
"That update rule is the whole algorithm. Everything else is plumbing.\n\n" +
"## The pattern with stable-baselines3 (the fast way)\n" +
"```python\n" +
"# pip install gymnasium stable-baselines3\n" +
"import gymnasium as gym\n" +
"from stable_baselines3 import DQN\n\n" +
"env = gym.make('CartPole-v1')\n" +
"model = DQN('MlpPolicy', env, verbose=0, learning_rate=1e-3, buffer_size=10_000)\n" +
"model.learn(total_timesteps=50_000)\n\n" +
"# Evaluate\n" +
"obs, _ = env.reset()\n" +
"total_reward = 0\n" +
"for _ in range(500):\n" +
"    action, _ = model.predict(obs, deterministic=True)\n" +
"    obs, r, done, trunc, _ = env.step(action)\n" +
"    total_reward += r\n" +
"    if done or trunc: break\n" +
"print(f'eval reward: {total_reward}')\n" +
"# eval reward: 500.0  (the max — pole balanced for full episode)\n" +
"```\n\n" +
"## The pattern from scratch (the educational way)\n" +
"```python\n" +
"import numpy as np\n" +
"import gymnasium as gym\n\n" +
"env = gym.make('CartPole-v1')\n\n" +
"# Discretise the continuous state\n" +
"def discretise(obs):\n" +
"    bins = [\n" +
"        np.linspace(-2.4, 2.4, 6),     # cart position\n" +
"        np.linspace(-3.0, 3.0, 6),     # cart velocity\n" +
"        np.linspace(-0.21, 0.21, 12),  # pole angle\n" +
"        np.linspace(-3.0, 3.0, 12),    # pole angular velocity\n" +
"    ]\n" +
"    return tuple(int(np.digitize(o, b)) for o, b in zip(obs, bins))\n\n" +
"Q = np.zeros((7, 7, 13, 13, 2))  # state-bins × n_actions\n" +
"alpha, gamma, eps = 0.1, 0.99, 1.0\n\n" +
"for episode in range(2000):\n" +
"    obs, _ = env.reset()\n" +
"    s = discretise(obs)\n" +
"    done = False\n" +
"    while not done:\n" +
"        # ε-greedy action\n" +
"        if np.random.rand() < eps:\n" +
"            a = env.action_space.sample()\n" +
"        else:\n" +
"            a = int(np.argmax(Q[s]))\n" +
"        obs, r, done, trunc, _ = env.step(a)\n" +
"        s_ = discretise(obs)\n" +
"        # Q-learning update\n" +
"        Q[s][a] += alpha * (r + gamma * Q[s_].max() - Q[s][a])\n" +
"        s = s_\n" +
"        if trunc: break\n" +
"    eps = max(0.05, eps * 0.995)  # anneal exploration\n" +
"```\n\n" +
"## What you'll see\n" +
"```text\n" +
"episode  100: avg reward over last 100 = 22\n" +
"episode  500: avg reward over last 100 = 68\n" +
"episode 1000: avg reward over last 100 = 152\n" +
"episode 1500: avg reward over last 100 = 380\n" +
"episode 2000: avg reward over last 100 = 472   <- close to the max of 500\n" +
"```\n\n" +
"That's learning in action — the agent goes from 'falls instantly' to 'balances for the full episode' through pure trial + error + Q updates.\n\n" +
"## Render it\n" +
"```python\n" +
"env = gym.make('CartPole-v1', render_mode='human')\n" +
"# ... run inference with the trained model\n" +
"```\n\n" +
"Watch the cart actually balance. That's the moment RL clicks."
      ),
      V("Q-learning explained visually","https://www.youtube.com/watch?v=qhRNvCVVJaA",10,"various","Watch first. Walks through the Q-learning update visually with a grid-world example. The equation makes sense after this."),
      S([
        { prompt: "Q-learning updates Q(s,a) toward `r + γ · max_a' Q(s', a')` — the observed reward plus the discounted future value.", answer: true, whenRight: "Right — that's the whole equation. Reward you saw + best you can do from the next state.", whenWrong: "Yes — Bellman update. Current = reward + γ × best-next. Iterate until it stops changing." },
        { prompt: "On CartPole, average reward of 500 means the agent balanced the pole for the full episode.", answer: true, whenRight: "Right — CartPole gives +1 per step, max 500 steps. Hitting 500 = perfect balance for the cap.", whenWrong: "Yes — 500 = max reward. The cap is 500 steps; hitting that means full balance." },
        { prompt: "stable-baselines3 implements RL algorithms (DQN, PPO, A2C) so you don't have to write the training loops from scratch.", answer: true, whenRight: "Right — production-grade RL. Same role sklearn plays for supervised: standard implementations of standard algorithms.", whenWrong: "Yes — sb3 is the RL sklearn. Use it for serious work; write from scratch once to understand the loop." }
      ]),
      E("Your turn — CartPole","[CODE] In `rl/01_cartpole.ipynb`:\n1. `pip install gymnasium stable-baselines3`.\n2. EITHER write Q-learning from scratch on discretised state, OR use sb3 DQN. (Recommended: do both; ~30 min total.)\n3. Train. Plot reward per episode.\n4. Evaluate: avg reward over 10 eval episodes.\n5. Render one episode to confirm the pole stays up.\n6. Save the trained model.")
    ]),
    D(3,"Exploration strategies","ε-greedy vs UCB.",[
      L("The exploration-vs-exploitation question, made concrete",
"## What it is\n" +
"Yesterday's Q-learning used ε-greedy: with probability ε pick a random action; otherwise pick the best-known. Today: compare ε-greedy to UCB (Upper Confidence Bound) on a small bandit problem.\n\n" +
"## The toy bandit\n" +
"Imagine 10 slot machines, each with a different (unknown) reward probability. You have 1000 pulls. Maximise total reward.\n\n" +
"```python\n" +
"import numpy as np\n\n" +
"np.random.seed(42)\n" +
"true_means = np.random.uniform(0.1, 0.9, size=10)\n" +
"# e.g. [0.45, 0.83, 0.12, 0.65, ...]\n" +
"\n" +
"def pull(arm):\n" +
"    return 1 if np.random.rand() < true_means[arm] else 0\n" +
"```\n\n" +
"## ε-greedy\n" +
"```python\n" +
"def epsilon_greedy(eps=0.1, n_steps=1000):\n" +
"    counts = np.zeros(10); rewards = np.zeros(10)\n" +
"    total = 0\n" +
"    for t in range(n_steps):\n" +
"        if np.random.rand() < eps:\n" +
"            a = np.random.randint(10)\n" +
"        else:\n" +
"            avg = np.divide(rewards, counts, out=np.zeros(10), where=counts>0)\n" +
"            a = int(np.argmax(avg))\n" +
"        r = pull(a)\n" +
"        counts[a] += 1\n" +
"        rewards[a] += r\n" +
"        total += r\n" +
"    return total\n" +
"```\n\n" +
"## UCB (Upper Confidence Bound)\n" +
"```python\n" +
"def ucb(c=2.0, n_steps=1000):\n" +
"    counts = np.zeros(10); rewards = np.zeros(10)\n" +
"    total = 0\n" +
"    # Initialise: pull each arm once\n" +
"    for a in range(10):\n" +
"        r = pull(a); counts[a] += 1; rewards[a] += r; total += r\n" +
"    for t in range(10, n_steps):\n" +
"        avg = rewards / counts\n" +
"        bonus = c * np.sqrt(np.log(t) / counts)\n" +
"        a = int(np.argmax(avg + bonus))\n" +
"        r = pull(a)\n" +
"        counts[a] += 1; rewards[a] += r; total += r\n" +
"    return total\n" +
"```\n\n" +
"The UCB bonus `c · √(log t / N_a)` adds 'exploration credit' to arms that haven't been tried recently. It naturally tries undertried arms more often, then settles on the best-looking ones.\n\n" +
"## The race\n" +
"```python\n" +
"trials = 1000\n" +
"eg = [epsilon_greedy() for _ in range(trials)]\n" +
"uc = [ucb() for _ in range(trials)]\n" +
"print(f'ε-greedy avg total: {np.mean(eg):.1f} ± {np.std(eg):.1f}')\n" +
"print(f'UCB       avg total: {np.mean(uc):.1f} ± {np.std(uc):.1f}')\n" +
"# ε-greedy avg total: 753.4 ± 22.1\n" +
"# UCB       avg total: 791.2 ± 18.7\n" +
"```\n\n" +
"UCB typically wins on this kind of stationary bandit because its exploration is data-driven (try the under-explored arms more, settle on best ones cleanly). ε-greedy keeps wasting ε% of pulls on random arms forever.\n\n" +
"## When to use which\n" +
"```text\n" +
"ε-greedy — simple, works fine when reward distribution is roughly stationary.\n" +
"            Tune ε by annealing (start high, decay over time).\n" +
"\n" +
"UCB      — better theoretical guarantees; works well when arms are stable.\n" +
"            Tune c (typically 1-2).\n" +
"\n" +
"Thompson sampling — Bayesian approach; samples from posterior over each arm's\n" +
"            reward and picks the highest sample. Often wins in production.\n" +
"            (Tomorrow's lesson hints at this.)\n" +
"```\n\n" +
"## What this teaches\n" +
"Exploration isn't free; it costs reward in the short run. The right exploration strategy buys long-run reward by learning faster. Concrete comparison teaches the tradeoff better than a chapter of theory."
      ),
      S([
        { prompt: "UCB picks the arm with the highest 'estimated mean + exploration bonus', where the bonus shrinks as the arm is sampled more.", answer: true, whenRight: "Right — the bonus pulls in under-explored arms, then shrinks once you've sampled them. Natural exploration-exploitation balance.", whenWrong: "Yes — bonus rewards under-exploration, vanishes once sampled. Auto-balance." },
        { prompt: "ε-greedy always exploits the best-known arm — no exploration.", answer: false, whenRight: "Right — no. ε-greedy explores ε% of the time. Pure exploitation never learns when a worse-looking arm is actually better.", whenWrong: "ε-greedy explores ε% of pulls. Pure greedy (ε=0) can get stuck on locally best arms." },
        { prompt: "Annealing ε (start high, decay) is a common trick to reduce wasted exploration once the agent has learned.", answer: true, whenRight: "Right — early in training you need to explore; late you should exploit what you learned. Annealing handles that automatically.", whenWrong: "Yes — anneal ε. Early high (learn fast); late low (exploit what you learned)." }
      ]),
      E("Your turn — exploration race","[CODE] In `rl/02_bandits.ipynb`:\n1. Implement the 10-arm bandit (random reward probabilities).\n2. Implement ε-greedy + UCB.\n3. Run 1000 trials of each; report mean + std of cumulative reward.\n4. Plot cumulative regret (max possible − actual) over time for each.\n5. Markdown: which wins on this problem, and by how much?")
    ]),
    D(4,"Contextual bandits","The practical version. What actually ships.",[
      L("Contextual bandits — RL's practical cousin",
"## What it is\n" +
"Standard bandits: 'which slot machine?'. Each arm has a fixed reward distribution; no side information.\n\n" +
"Contextual bandits: 'which slot machine, GIVEN this customer profile?'. The optimal arm depends on the CONTEXT — different customers respond differently.\n\n" +
"This is where 80% of production 'RL' lives:\n" +
"- 'Which ad creative for THIS user?'\n" +
"- 'Which email subject for THIS segment?'\n" +
"- 'Which item to recommend to THIS customer?'\n" +
"- 'Which interest rate to offer THIS applicant?'\n\n" +
"## The shape\n" +
"```text\n" +
"At step t:\n" +
"  1. Observe context x_t (user features, time, etc.)\n" +
"  2. Pick action a_t from K options\n" +
"  3. Observe reward r_t (click / no click; purchase / no purchase)\n" +
"  4. Update: 'in contexts like x_t, action a_t had reward r_t'\n" +
"```\n\n" +
"## LinUCB — the workhorse algorithm\n" +
"For each action, maintain a linear model of reward as a function of context:\n" +
"```text\n" +
"E[reward | x, a] ≈ θ_a · x\n" +
"```\n" +
"Each action has its own weight vector θ_a. Update with ridge regression as data arrives. Pick the action whose UPPER CONFIDENCE BOUND on expected reward is highest.\n\n" +
"```python\n" +
"import numpy as np\n\n" +
"class LinUCB:\n" +
"    def __init__(self, n_actions, context_dim, alpha=1.0):\n" +
"        self.K, self.d, self.alpha = n_actions, context_dim, alpha\n" +
"        self.A = [np.eye(context_dim) for _ in range(n_actions)]\n" +
"        self.b = [np.zeros(context_dim) for _ in range(n_actions)]\n\n" +
"    def pick(self, x):\n" +
"        scores = []\n" +
"        for a in range(self.K):\n" +
"            A_inv = np.linalg.inv(self.A[a])\n" +
"            theta = A_inv @ self.b[a]\n" +
"            mean = theta @ x\n" +
"            bonus = self.alpha * np.sqrt(x @ A_inv @ x)\n" +
"            scores.append(mean + bonus)\n" +
"        return int(np.argmax(scores))\n\n" +
"    def update(self, x, a, r):\n" +
"        self.A[a] += np.outer(x, x)\n" +
"        self.b[a] += r * x\n" +
"```\n\n" +
"## A toy simulation\n" +
"```python\n" +
"# 3 ad creatives; reward depends on user age + interest score\n" +
"np.random.seed(42)\n" +
"true_weights = np.array([\n" +
"    [0.5, 0.1],   # creative 0 prefers older + low-interest\n" +
"    [0.2, 0.6],   # creative 1 prefers younger + high-interest\n" +
"    [0.3, 0.4],   # creative 2 mid\n" +
"])\n\n" +
"def reward(creative, context):\n" +
"    p = 1 / (1 + np.exp(-true_weights[creative] @ context))\n" +
"    return 1 if np.random.rand() < p else 0\n\n" +
"bandit = LinUCB(n_actions=3, context_dim=2, alpha=1.0)\n" +
"total = 0\n" +
"for t in range(10_000):\n" +
"    x = np.random.uniform(-1, 1, size=2)\n" +
"    a = bandit.pick(x)\n" +
"    r = reward(a, x)\n" +
"    bandit.update(x, a, r)\n" +
"    total += r\n" +
"print(f'total reward: {total}/10000')\n" +
"```\n\n" +
"After 10k rounds, the bandit has learned to match the right creative to the right user — total reward will be near the theoretical maximum.\n\n" +
"## Why this is what ships\n" +
"- Updates are cheap (single ridge regression update per round)\n" +
"- Real-time learning: every impression / click teaches the model\n" +
"- A/B test interpretation falls out naturally — the bandit picks the best variant per user instead of giving each variant 50% of traffic\n" +
"- Industry libraries exist: Vowpal Wabbit, Microsoft's Counterfactual ML library, AWS Personalize\n\n" +
"## Where it doesn't fit\n" +
"- Multi-step decisions (game playing, navigation) — use full RL\n" +
"- Reward arrives much later than action (multi-day attribution) — counterfactual evaluation gets hard\n" +
"- Reward distribution shifts rapidly — bandits assume some stationarity"
      ),
      S([
        { prompt: "Contextual bandits use a model of reward as a function of CONTEXT (user features, time, etc.), not just arm identity.", answer: true, whenRight: "Right — context-dependent reward. That's what makes them 'contextual' and what makes them ship in product.", whenWrong: "Yes — context-conditional. Standard bandits ignore who's pulling; contextual ones know." },
        { prompt: "LinUCB combines a linear reward model with a UCB exploration bonus.", answer: true, whenRight: "Right — ridge-regression on context per arm + UCB on the residual uncertainty. Clean algorithm.", whenWrong: "Yes — linear model + UCB. Updates fast; performs well in practice." },
        { prompt: "Contextual bandits learn from EVERY user interaction in real time.", answer: true, whenRight: "Right — each impression + reward updates the model. Fast adaptation, unlike batch supervised learning.", whenWrong: "Yes — online learning. Every round teaches the model; no offline retraining cycle needed." }
      ]),
      E("Your turn — LinUCB","[CODE] In `rl/03_contextual_bandit.ipynb`:\n1. Implement LinUCB.\n2. Build a toy ad-selection environment (3 creatives; reward depends on context).\n3. Run 10,000 rounds; track cumulative reward.\n4. Compare to: (a) random arm, (b) always-best-on-average arm.\n5. Plot regret vs round.\n6. Markdown: how much did context-awareness add over the best non-contextual baseline?")
    ]),
    D(5,"Real-world use cases","When RL is right vs wrong.",[
      L("RL fit — and misfit",
"## What it is\n" +
"A decision framework: when is RL the right tool vs when is it a fashionable misuse?\n\n" +
"## When RL is the right tool\n" +
"```text\n" +
"✓ Sequential decisions where actions affect future state\n" +
"  - Game playing (chess, Go, video games)\n" +
"  - Robotics (manipulation, navigation)\n" +
"  - Multi-step recommendation (session-based ranking)\n" +
"  - Adaptive trial design in medicine\n" +
"\n" +
"✓ Single-step decisions with immediate reward + lots of data per arm\n" +
"  - Ad selection (contextual bandits)\n" +
"  - Email subject lines (contextual bandits)\n" +
"  - Headline / image variant selection\n" +
"  - Real-time bidding\n" +
"```\n\n" +
"## When RL is the wrong tool\n" +
"```text\n" +
"✗ Sparse rewards, billions of states, no simulator\n" +
"  - You can't train; the agent never sees enough reward signal\n" +
"\n" +
"✗ Decisions affecting safety or compliance\n" +
"  - Exploration = experimenting on real users. Often not acceptable.\n" +
"  - E.g., 'should this patient get drug A or B' — needs an RCT, not a bandit\n" +
"\n" +
"✗ Problems where supervised + counterfactual evaluation would work\n" +
"  - If you have historical labelled data, supervised is faster + safer\n" +
"  - Counterfactual policy evaluation lets you A/B test offline\n" +
"\n" +
"✗ Highly non-stationary environments\n" +
"  - If the reward distribution changes faster than you can learn, RL\n" +
"    constantly chases a moving target\n" +
"\n" +
"✗ You don't have a simulator AND you can't afford online exploration\n" +
"  - This rules out most 'I want to RL-optimise <X>' projects in B2B\n" +
"```\n\n" +
"## The three questions to ask before using RL\n" +
"```text\n" +
"1. Is the reward IMMEDIATE and ATTRIBUTABLE to a single action?\n" +
"   If yes → consider contextual bandits.\n" +
"   If no → consider whether the reward delay is acceptable.\n" +
"\n" +
"2. Do you have a SIMULATOR or can you afford ONLINE exploration?\n" +
"   If no → you can't train. RL is off the table.\n" +
"\n" +
"3. Would supervised learning + a thoughtful policy work?\n" +
"   If yes → use it. RL adds complexity; only pay the cost if it earns value.\n" +
"```\n\n" +
"## Real production examples (and why they work)\n" +
"- **Netflix homepage thumbnail selection** — contextual bandits. Single-step (which thumbnail?), immediate reward (clicked?), tons of data.\n" +
"- **Spotify Discover Weekly ordering** — contextual bandits + ranking. Single-step per item, near-immediate reward (skipped or finished).\n" +
"- **AlphaGo / AlphaZero** — deep RL with self-play simulator. Multi-step, delayed reward, but a perfect simulator (the game rules).\n" +
"- **OpenAI's robotics work** — deep RL in simulation, transferred to reality. Multi-step, delayed reward, simulator generated trillions of training steps.\n\n" +
"## Real production failures (and why they happened)\n" +
"- **'RL for dynamic pricing'** — often misused. Tiny number of pricing decisions per day means data starvation; safety concerns mean exploration is dangerous.\n" +
"- **'RL for inventory management'** — usually solvable with operations research + supervised demand forecast; RL overcomplicates.\n" +
"- **'RL for chatbots' (pre-RLHF)** — reward is hard to define; conversation drift was unaligned with user intent."
      ),
      S([
        { prompt: "RL is the right tool for problems with immediate reward, lots of data per action, and an acceptable cost of exploration.", answer: true, whenRight: "Right — contextual bandits hit all three for many product problems.", whenWrong: "Yes — those three conditions. Sparse reward, low data, or no exploration budget all kill RL." },
        { prompt: "If supervised learning + a sensible policy would work, you should still use RL because it's more sophisticated.", answer: false, whenRight: "Right — no. RL adds complexity; only pay the cost if it earns value. Supervised is faster, safer, more debuggable.", whenWrong: "Sophistication ≠ value. Use the simplest tool that works. RL's complexity has to be paid for in actual reward." },
        { prompt: "RL is appropriate for safety-critical or compliance-bound decisions like clinical treatment selection.", answer: false, whenRight: "Right — no. Exploration = experimenting on real patients. RCT is the right tool, not a bandit.", whenWrong: "Wrong tool. Exploration on real users with safety implications = ethical and regulatory problem. RCT, not bandit." }
      ]),
      E("Your turn — decision framework","[WRITE] In `rl/USE_CASES.md`:\n1. List 3 product problems where RL or bandits would fit + reasoning.\n2. List 3 problems where RL would be a misuse + reasoning.\n3. Pick ONE company you'd like to work at; sketch where RL/bandits might already be running there (educated guess).")
    ]),
    D(6,"Document one use case","Pick a real product. Write the design doc.",[
      L("The bandit design doc — what real ML teams write",
"## What it is\n" +
"A 1-2 page design document for ONE specific application of RL or contextual bandits to a real product. Same shape as design docs at Netflix / Spotify / Amazon's bandit teams.\n\n" +
"## The template\n" +
"```markdown\n" +
"# Bandit design — <product feature>\n" +
"\n" +
"## The decision being made\n" +
"<One sentence. E.g.: 'Which of N email subject lines to send for an onboarding email.'>\n" +
"\n" +
"## Why this is bandit-shaped (not supervised, not full RL)\n" +
"- Single-step: <reason>\n" +
"- Immediate reward: <reason>\n" +
"- Reward attributable to action: <reason>\n" +
"\n" +
"## Context features\n" +
"<List the features you'd use to condition the decision. 5-15 features.>\n" +
"- user_signup_age_days (numeric)\n" +
"- user_country (categorical)\n" +
"- prior_open_rate (numeric)\n" +
"- ...\n" +
"\n" +
"## Action space\n" +
"<List the arms / variants the bandit chooses among. 2-10 typical.>\n" +
"\n" +
"## Reward definition\n" +
"<Specific, machine-readable. E.g.: 'r = 1 if user clicks within 24h, else 0'>\n" +
"\n" +
"## Algorithm\n" +
"<LinUCB / Thompson sampling / contextual ε-greedy + reason.>\n" +
"\n" +
"## Exploration policy\n" +
"<How much exploration is allowed? E.g.: 'ε starts at 0.2, anneals to 0.05 over\n" +
" 30 days as the model learns.'>\n" +
"\n" +
"## Cold-start handling\n" +
"<What happens before the model has any data?\n" +
" E.g.: 'For first 1k impressions, uniform random over all arms.'>\n" +
"\n" +
"## Evaluation\n" +
"- Online metric: <e.g., 7-day cumulative reward, vs the always-best-on-avg arm>\n" +
"- Offline metric: <counterfactual policy evaluation using IPS or DR>\n" +
"- Guardrails: <e.g., 'rollback if reward drops 10% below baseline for 2h'>\n" +
"\n" +
"## Risks\n" +
"- <Specific risk + mitigation>\n" +
"- e.g.: 'Bandit might over-explore a high-variance arm; cap per-arm exploration\n" +
"   budget at X% of traffic.'\n" +
"- e.g.: 'Fairness concern if some user segments get worse arms; monitor per-\n" +
"   segment reward; treat large gaps as a launch blocker.'\n" +
"\n" +
"## Open questions\n" +
"- <Things you don't know and would have to answer with experiments / research>\n" +
"```\n\n" +
"## Why this document is portfolio gold\n" +
"It demonstrates:\n" +
"- You can pick the right tool for the problem (bandits, not deep RL)\n" +
"- You think about cold-start, exploration budget, fairness, rollback\n" +
"- You know about counterfactual evaluation (a senior signal)\n" +
"- You've gone from 'I read about RL' to 'here's how I'd actually deploy it'\n\n" +
"Most learners can't produce this document. Producing one puts you above the 'I trained DQN on CartPole' tier instantly.\n\n" +
"## How to pick the use case\n" +
"- Pick something CONCRETE you've encountered as a user (e.g., 'I always notice when Spotify changes the order of my Discover Weekly — what bandit might be doing that?')\n" +
"- Don't pick generic ('RL for trading'). Pick specific ('contextual bandit for selecting which 3 of 8 onboarding screens to show during signup').\n" +
"- Specific = defensible at interview. Generic = waves of hand."
      ),
      S([
        { prompt: "A bandit design doc with cold-start, exploration budget, rollback guardrails, and fairness checks signals senior judgment.", answer: true, whenRight: "Right — these are the questions that get asked when bandits actually deploy. Anticipating them shows production thinking.", whenWrong: "Yes — production thinking. Cold-start + guardrails + fairness = senior signal. Most learners never think this far." },
        { prompt: "Picking 'RL for trading' as your use case is more impressive than 'contextual bandit for onboarding-email subject lines'.", answer: false, whenRight: "Right — no. Specific + defensible beats vague + impressive-sounding. Trading is a red flag in interviews; specific UX work is credible.", whenWrong: "Specific beats vague. 'Email subject bandit' has a clear shape; 'RL for trading' triggers safety/regulation skepticism." },
        { prompt: "Counterfactual policy evaluation lets you compare candidate bandit policies offline without running each one in production.", answer: true, whenRight: "Right — IPS / Doubly Robust estimators reuse logged data to estimate counterfactual reward. Production-grade evaluation skill.", whenWrong: "Yes — reuse logged data + importance weights. Lets you compare policies offline before risking traffic." }
      ]),
      E("Your turn — design doc","[WRITE] In `rl/DESIGN_DOC.md`:\n1. Pick ONE specific product decision.\n2. Fill EVERY section of the template.\n3. The Risks section must name AT LEAST 2 specific risks with mitigations.\n4. The Cold-start section is mandatory.\n5. Keep it under 2 pages.")
    ]),
    D(7,"Tag rl-shipped","Ship the milestone + short EVAL post.",[
      L("Shipping the RL milestone",
"## What goes in the repo\n" +
"```text\n" +
"rl/\n" +
"  INTRO.md                # framing\n" +
"  01_cartpole.ipynb       # Q-learning / DQN baseline\n" +
"  02_bandits.ipynb        # ε-greedy vs UCB race\n" +
"  03_contextual_bandit.ipynb  # LinUCB on toy ad-selection\n" +
"  USE_CASES.md            # right vs wrong fits\n" +
"  DESIGN_DOC.md           # the specific real-product application\n" +
"```\n\n" +
"## The blog post (~700 words)\n" +
"```text\n" +
"1. Hook — 'I implemented Q-learning, ε-greedy/UCB, and LinUCB this week.\n" +
"           Here's what they're each good for — and what most product DS work\n" +
"           actually looks like under the RL hood.'\n" +
"2. The Q-learning hello world — CartPole result, what I learned about the loop\n" +
"3. The exploration race — ε-greedy vs UCB on a 10-arm bandit, with numbers\n" +
"4. The contextual bandit — LinUCB on toy ad selection, why this is what ships\n" +
"5. The fit framework — when RL is right vs wrong (4-5 bullets)\n" +
"6. A specific product application — summarise the design doc\n" +
"7. Links — repo, design doc\n" +
"```\n\n" +
"## Tag and ship\n" +
"```bash\n" +
"git add rl/\n" +
"git commit -m \"RL specialty: Q-learning + bandits + LinUCB + design doc\"\n" +
"git tag rl-shipped\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## Why this earned a specialty tag\n" +
"You haven't just trained DQN on CartPole. You've:\n" +
"- Implemented Q-learning yourself (or DQN via sb3) and explained the loop\n" +
"- Compared two exploration strategies with concrete numbers\n" +
"- Built LinUCB from scratch and applied it to a contextual problem\n" +
"- Written a design doc for a real product use case with cold-start + guardrails + fairness\n\n" +
"Most candidates' 'I know RL' is `import stable_baselines3; PPO('MlpPolicy').learn(1e6)`. Yours is the design doc + the algorithmic understanding behind it. Different conversation in interviews."
      ),
      S([
        { prompt: "Including the design doc for a specific product application makes the RL specialty week more interview-credible.", answer: true, whenRight: "Right — algorithm + product judgment together = a senior conversation. Algorithm alone = a learner conversation.", whenWrong: "Yes — design doc bridges 'I know the math' and 'I can deploy this'. Senior signal." },
        { prompt: "Tagging rl-shipped without the design doc is sufficient for the portfolio.", answer: false, whenRight: "Right — no. The design doc is the differentiator. Without it, you're another candidate who ran DQN on CartPole.", whenWrong: "Design doc = differentiator. CartPole alone = generic; CartPole + design doc = senior signal." },
        { prompt: "RL specialty week is required for entry-level DS job applications.", answer: false, whenRight: "Right — no. The structured roadmap completed at W39. RL is a +1 specialty for roles where it applies (recsys, ads, growth, gaming).", whenWrong: "Optional. RL is a multiplier for specific roles, not a generic requirement. Apply with or without it." }
      ]),
      E("Your turn — ship rl-shipped","[PRODUCE] 1. Write the blog post; publish on dev.to.\n2. Commit + tag:\n`git add rl/ && git commit -m 'RL specialty shipped' && git tag rl-shipped && git push --tags`\n\nPASS:\n[x] CartPole notebook with trained model + reward curve\n[x] Bandits notebook with ε-greedy vs UCB comparison\n[x] LinUCB notebook with contextual reward simulation\n[x] USE_CASES.md (right vs wrong fits)\n[x] DESIGN_DOC.md for one specific product application\n[x] Blog post published\n[x] rl-shipped tag pushed")
    ])
  ]
};

/* ════ WEEK 41 — Recommender Systems: the algorithms behind every feed ════ */
const W41 = {
  number: 41, title: "Recommender Systems - the algorithms behind every feed",
  phase: "Specialty", commitment_hours: "8-10",
  context: ds.weeks[40].context,
  concept_check: [
    { q: "Why is collaborative filtering called 'collaborative'?",
      choices: ["Cute name","Each user's preferences inform recommendations for OTHER users with similar taste — users 'collaborate' implicitly through the rating matrix",
        "Group project","Trendy"],
      correct: 1, explain: "User-based CF: 'people similar to you watched X; recommending X to you.' Item-based CF: 'people who liked X also liked Y; recommending Y to you.' The 'collaboration' is implicit — users never meet, but each user's behaviour contributes to the recommendations another user sees. That's where the name comes from." },
    { q: "Why does matrix factorization typically beat user-based CF in production?",
      choices: ["Trendier","User-based CF stores the entire user-item rating matrix and searches for similar users at query time — O(users × items) memory and slow lookups. MF decomposes the matrix into low-rank embeddings — O((users + items) × k) memory and fast vector lookups",
        "Smaller code","Random"],
      correct: 1, explain: "On Netflix-scale data (100M users × 100k items), user-based CF needs 10 trillion cells of memory and a similarity search across millions of users per request. MF learns a small embedding per user and per item (say k=50 dimensions); recommendation becomes a dot product. Memory drops by orders of magnitude; latency goes from seconds to milliseconds. That's why it won the Netflix Prize and what powers production recsys today." },
    { q: "Why does cold-start matter even after your model is great?",
      choices: ["Marketing","Brand-new users have no rating history; brand-new items have no users yet. CF and MF can't recommend anything for either. Cold-start fallbacks (content features, popular items, demographic priors) are required even when the main model is perfect for warm users",
        "Bug","Marketing fluff"],
      correct: 1, explain: "CF and MF both depend on observed interactions. A user who just signed up has no interactions; a movie just added has no viewers. The model produces garbage (or nothing) for them. Production recsys ALWAYS has a separate cold-start path — content-based recs using item features, demographic priors using user signup data, popularity-based fallbacks. Without it, new users and new items get no traffic, and your platform can't grow." }
  ],
  days: [
    D(1,"Intuition + dataset","Three generations of recsys + MovieLens.",[
      L("Three generations, one problem",
"## What it is\n" +
"Recommender systems = 'given a user, surface items they'll like'. The biggest interview topic at consumer tech (Amazon, Netflix, Spotify, TikTok, YouTube). Three generations of algorithms:\n\n" +
"```text\n" +
"GEN 1 — Collaborative Filtering (2000s)\n" +
"  Idea: users similar to you liked X → recommend X.\n" +
"  Tool: user-user similarity, item-item similarity\n" +
"  Strength: simple, interpretable, no item features needed\n" +
"  Weakness: doesn't scale; cold-start; sparse data\n" +
"\n" +
"GEN 2 — Matrix Factorization (2006-2015)\n" +
"  Idea: learn small embeddings per user and per item; rec = dot product.\n" +
"  Tool: SVD, ALS, FunkSVD\n" +
"  Strength: scales to millions of users; fast inference; better accuracy\n" +
"  Weakness: still cold-start; linear model of interaction\n" +
"\n" +
"GEN 3 — Deep / Two-Tower Models (2016+)\n" +
"  Idea: neural networks produce user + item embeddings from RICH features.\n" +
"  Tool: two-tower networks, transformers, graph nets\n" +
"  Strength: handles cold-start via features; non-linear interactions\n" +
"  Weakness: more compute; less interpretable; more data needed\n" +
"```\n\n" +
"This week you implement one from each generation. Same dataset. Compare honestly.\n\n" +
"## The dataset: MovieLens\n" +
"MovieLens is the textbook recsys benchmark. 25M ratings, 162k users, 62k movies, freely available.\n\n" +
"```python\n" +
"# pip install pandas requests\n" +
"import pandas as pd, zipfile, io, requests\n\n" +
"url = 'https://files.grouplens.org/datasets/movielens/ml-25m.zip'\n" +
"r = requests.get(url)\n" +
"with zipfile.ZipFile(io.BytesIO(r.content)) as zf:\n" +
"    ratings = pd.read_csv(zf.open('ml-25m/ratings.csv'))\n" +
"    movies  = pd.read_csv(zf.open('ml-25m/movies.csv'))\n" +
"\n" +
"print(ratings.shape, movies.shape)\n" +
"# (25,000,095, 4) (62,423, 3)\n" +
"```\n\n" +
"For learner work, use the smaller `ml-latest-small` (100k ratings) — fits in seconds, same patterns.\n\n" +
"## What's in the ratings file\n" +
"```text\n" +
"userId  movieId  rating  timestamp\n" +
"1       296      5.0     1147880044\n" +
"1       306      3.5     1147868817\n" +
"...\n" +
"```\n\n" +
"That's all you need for the entire week. Three columns: who, what, score.\n\n" +
"## The split\n" +
"```python\n" +
"# Time-based split (closest to production reality)\n" +
"ratings = ratings.sort_values('timestamp')\n" +
"cutoff = int(len(ratings) * 0.8)\n" +
"train = ratings.iloc[:cutoff]\n" +
"test  = ratings.iloc[cutoff:]\n" +
"```\n\n" +
"Random splits LEAK in recsys — they let the model see future ratings during training. Time-based splits respect causality.\n\n" +
"## This week\n" +
"- Day 2: User-based CF (the simple one)\n" +
"- Day 3: Matrix factorization (SVD/ALS)\n" +
"- Day 4: Two-tower deep model in PyTorch\n" +
"- Day 5: Cold-start mitigation\n" +
"- Day 6: Multi-metric eval (precision@K, recall@K, NDCG)\n" +
"- Day 7: Streamlit demo + ship"
      ),
      V("How Netflix recommends movies (overview)","https://www.youtube.com/watch?v=f8OK1HBEgn0",10,"various","Watch first. Frames the production recsys problem at scale — what your week's models are doing in miniature."),
      S([
        { prompt: "Collaborative filtering is 'collaborative' because users implicitly contribute to each other's recommendations through the rating matrix.", answer: true, whenRight: "Right — users never meet, but each rating shapes what others see. That's the 'collaboration'.", whenWrong: "Yes — implicit collaboration. Your ratings train the system that recommends to others; theirs train yours." },
        { prompt: "Random train/test splits work fine for recsys data.", answer: false, whenRight: "Right — no. Random splits leak (train sees future ratings). Time-based splits respect causality.", whenWrong: "Time-based always. Random splits inflate test scores by leaking future interactions back into training." },
        { prompt: "Matrix factorization beats user-based CF in production primarily because it's faster at inference time AND scales better.", answer: true, whenRight: "Right — small embeddings + dot products vs gigantic similarity matrices + nearest-neighbor search. Orders of magnitude.", whenWrong: "Yes — embeddings + dot product. CF stores everyone's ratings; MF compresses to a few hundred floats per user." }
      ]),
      E("Your turn — load + split","[CODE] In `recsys/01_data.ipynb`:\n1. Download MovieLens (small or 25M).\n2. Time-based train/test split (80/20).\n3. Print: number of users, items, ratings; average rating; sparsity.\n4. Compute a baseline: predict the global average rating for every user-item.\n5. Compute RMSE of the baseline on the test set. This is the bar to beat.")
    ]),
    D(2,"User-based CF","The simplest recommender that works.",[
      L("User-based collaborative filtering",
"## What it is\n" +
"For each target user u and target item i:\n" +
"1. Find users SIMILAR to u (cosine similarity on rating vectors)\n" +
"2. Among those similar users, take a weighted average of their ratings for i\n" +
"3. Predict u's rating for i as that average\n" +
"4. Recommend the highest-predicted items u hasn't rated yet\n\n" +
"## The math, compressed\n" +
"```text\n" +
"sim(u, v) = cos(ratings_u, ratings_v)   # cosine similarity\n" +
"\n" +
"pred(u, i) = sum over k similar users v: sim(u, v) · rating(v, i)\n" +
"             / sum over k similar users v: |sim(u, v)|\n" +
"```\n\n" +
"## A minimal implementation\n" +
"```python\n" +
"import numpy as np\n" +
"from scipy.sparse import csr_matrix\n" +
"from sklearn.metrics.pairwise import cosine_similarity\n\n" +
"# Build sparse user × item matrix\n" +
"user_idx = {u: i for i, u in enumerate(train['userId'].unique())}\n" +
"item_idx = {m: i for i, m in enumerate(train['movieId'].unique())}\n" +
"R = csr_matrix((train['rating'].values,\n" +
"                ([user_idx[u] for u in train['userId']],\n" +
"                 [item_idx[m] for m in train['movieId']])))\n" +
"# Sparse: most cells empty\n\n" +
"# Mean-centre ratings per user (removes 'this user gives 5s to everything' bias)\n" +
"user_means = np.array(R.sum(axis=1) / (R != 0).sum(axis=1)).flatten()\n" +
"R_centred = R.copy().toarray().astype(float)\n" +
"for u in range(R_centred.shape[0]):\n" +
"    mask = R_centred[u] != 0\n" +
"    R_centred[u, mask] -= user_means[u]\n\n" +
"# User-user similarity (only for the users you'll query)\n" +
"def predict_for(u_id, i_id, k=20):\n" +
"    u = user_idx[u_id]; i = item_idx[i_id]\n" +
"    sims = cosine_similarity(R_centred[u:u+1], R_centred).flatten()\n" +
"    sims[u] = 0  # exclude self\n" +
"    # Top-k users who rated item i\n" +
"    rated_i = np.where(R[:, i].toarray().flatten() > 0)[0]\n" +
"    top = rated_i[np.argsort(-sims[rated_i])[:k]]\n" +
"    if len(top) == 0:\n" +
"        return user_means[u]\n" +
"    weights = sims[top]\n" +
"    ratings = R_centred[top, i]\n" +
"    return user_means[u] + np.sum(weights * ratings) / (np.sum(np.abs(weights)) + 1e-9)\n" +
"```\n\n" +
"## Evaluate\n" +
"```python\n" +
"from sklearn.metrics import mean_squared_error\n" +
"preds = [predict_for(u, m) for u, m in zip(test['userId'][:5000], test['movieId'][:5000])]\n" +
"rmse = np.sqrt(mean_squared_error(test['rating'][:5000], preds))\n" +
"print(f'User-CF RMSE: {rmse:.3f}')\n" +
"# User-CF RMSE: 0.945  (vs baseline ~1.05)\n" +
"```\n\n" +
"## Why this matters as a baseline\n" +
"User-based CF is the simplest model that does anything intelligent. It will beat 'predict global average' by ~10% on RMSE. That's the bar for matrix factorization tomorrow.\n\n" +
"## Why it doesn't scale\n" +
"- Memory: full user×item matrix (sparse, but still huge at scale)\n" +
"- Latency: similarity search across all users per query\n" +
"- Cold-start: a user with no ratings has no similarity to anyone\n\n" +
"Production CF systems use approximate nearest-neighbor (ScaNN, FAISS) to handle the second issue but the first and third stay. Hence matrix factorization."
      ),
      S([
        { prompt: "Mean-centring each user's ratings before computing similarity removes the bias from users who rate everything high (or low).", answer: true, whenRight: "Right — 'always-5-stars' user looks similar to 'always-4-stars' user by raw cosine even if their tastes differ. Centring fixes this.", whenWrong: "Yes — centring = de-biasing rating scale. Different users have different baselines; centring isolates relative preference." },
        { prompt: "User-based CF can recommend items to a brand-new user with no ratings.", answer: false, whenRight: "Right — no. Cold-start failure. Without ratings, the user has no similarity to anyone. Need a separate cold-start path.", whenWrong: "Cold-start kills CF. Day 5 covers fallbacks; CF alone can't recommend to new users." },
        { prompt: "User-based CF beating the global-average baseline by 10% on RMSE is a meaningful first result.", answer: true, whenRight: "Right — proves the model is doing something intelligent. Sets the bar for MF and deep models.", whenWrong: "Yes — meaningful improvement over a trivial baseline. The relative gap is what matters; absolute RMSE alone doesn't." }
      ]),
      E("Your turn — user-CF","[CODE] In `recsys/02_user_cf.ipynb`:\n1. Build the sparse user × item matrix.\n2. Mean-centre per user.\n3. Implement predict_for(u, i, k).\n4. Evaluate RMSE on test set (sample 5-10k pairs for speed).\n5. Compare to the global-average baseline. Markdown the improvement %.")
    ]),
    D(3,"Matrix factorization","SVD or ALS.",[
      L("Matrix factorization — the production workhorse",
"## What it is\n" +
"Decompose the user-item rating matrix R (m users × n items) into two LOW-RANK matrices:\n" +
"```text\n" +
"R ≈ U · V^T\n" +
"\n" +
"U: m × k   (user embeddings; each user is a k-dim vector)\n" +
"V: n × k   (item embeddings)\n" +
"k: latent dimensions, typically 50-200\n" +
"```\n\n" +
"Predicted rating for (u, i) is the dot product of their embeddings:\n" +
"```text\n" +
"pred(u, i) = U[u] · V[i]\n" +
"```\n\n" +
"## Why this beats CF\n" +
"- **Memory**: (m + n) × k floats vs m × n cells. Netflix: 100M × 50 + 100k × 50 = 5GB vs 10TB. Huge win.\n" +
"- **Latency**: one dot product (50 multiplies) vs nearest-neighbor search across millions.\n" +
"- **Implicit similarity**: items rated similarly end up with similar embeddings. You don't compute similarity explicitly.\n\n" +
"## Two ways to train\n" +
"\n" +
"### SVD (offline, for dense matrices)\n" +
"```python\n" +
"from scipy.sparse.linalg import svds\n" +
"# k = number of latent factors\n" +
"k = 50\n" +
"U, sigma, Vt = svds(R_centred_sparse, k=k)\n" +
"# pred = U @ diag(sigma) @ Vt + user_means\n" +
"```\n\n" +
"### ALS (Alternating Least Squares) — what production uses\n" +
"```python\n" +
"# pip install implicit\n" +
"import implicit\n" +
"from scipy.sparse import csr_matrix\n\n" +
"als = implicit.als.AlternatingLeastSquares(\n" +
"    factors=50,\n" +
"    regularization=0.01,\n" +
"    iterations=15,\n" +
")\n\n" +
"# implicit expects (item, user) sparse matrix of confidence/rating\n" +
"R_implicit = csr_matrix(\n" +
"    (train['rating'].values, (item_indices, user_indices)),\n" +
"    shape=(n_items, n_users),\n" +
")\n" +
"als.fit(R_implicit)\n\n" +
"# Recommend top-N for a user\n" +
"recs = als.recommend(user_id=42, user_items=R_implicit.T[42], N=10)\n" +
"```\n\n" +
"## Evaluate\n" +
"```python\n" +
"# Build prediction = U[user] @ V[item] for each (u, i) in test\n" +
"preds = (als.user_factors[u_idx_test] * als.item_factors[i_idx_test]).sum(axis=1)\n" +
"# Note: implicit's ALS is trained for implicit feedback (no rating value);\n" +
"# for explicit ratings, scale the result or use a different lib (scikit-surprise).\n" +
"```\n\n" +
"## Alternative: scikit-surprise (for explicit ratings)\n" +
"```python\n" +
"# pip install scikit-surprise\n" +
"from surprise import SVD, Dataset, Reader, accuracy\n" +
"from surprise.model_selection import train_test_split\n\n" +
"reader = Reader(rating_scale=(0.5, 5.0))\n" +
"data = Dataset.load_from_df(train[['userId','movieId','rating']], reader)\n" +
"surprise_train, surprise_test = train_test_split(data, test_size=0.2, random_state=42)\n\n" +
"svd = SVD(n_factors=50, n_epochs=20, lr_all=0.005, reg_all=0.02)\n" +
"svd.fit(surprise_train)\n" +
"preds = svd.test(surprise_test)\n" +
"print(f'SVD RMSE: {accuracy.rmse(preds):.3f}')\n" +
"# SVD RMSE: 0.86   (vs User-CF ~0.945, baseline ~1.05)\n" +
"```\n\n" +
"## The Netflix-Prize history\n" +
"In 2006-2009 Netflix offered $1M for a 10% RMSE improvement over their CineMatch system. The winning approach was MF + ensembles. Matrix factorization went from research to standard infrastructure in three years."
      ),
      S([
        { prompt: "Matrix factorization replaces the full user-item rating matrix with small per-user and per-item embeddings.", answer: true, whenRight: "Right — k=50-200 dimensions per user/item. Massive memory + latency win.", whenWrong: "Yes — compressed representation. (users+items)×k instead of users×items." },
        { prompt: "Predicting a rating in MF is one dot product between the user embedding and the item embedding.", answer: true, whenRight: "Right — single dot product. That's why latency drops from seconds to milliseconds.", whenWrong: "Yes — U[u] · V[i]. Dot product, instant." },
        { prompt: "Matrix factorization solves the cold-start problem.", answer: false, whenRight: "Right — no. MF needs interactions to learn embeddings. Cold-start still needs fallbacks. Day 5's problem.", whenWrong: "Cold-start still broken. New users / new items have no embeddings; MF alone can't recommend. Need fallbacks." }
      ]),
      E("Your turn — MF","[CODE] In `recsys/03_mf.ipynb`:\n1. Train SVD with surprise OR ALS with implicit.\n2. Evaluate RMSE on test set.\n3. Compare: baseline (avg) vs user-CF (W41 D2) vs MF.\n4. Plot RMSE for each.\n5. Markdown: how much did MF improve, and what does the improvement say about the dataset?")
    ]),
    D(4,"Two-tower deep model","PyTorch user + item embeddings.",[
      L("Two-tower models — what 2020s recsys looks like",
"## What it is\n" +
"A two-tower model has two separate neural networks (towers):\n" +
"- **User tower**: takes user features → user embedding\n" +
"- **Item tower**: takes item features → item embedding\n\n" +
"At training time, similarity between matched (user, item) pairs is HIGH; mismatched pairs LOW. The model learns rich, feature-aware embeddings that handle cold-start (because the embeddings come from FEATURES, not just IDs).\n\n" +
"## The PyTorch sketch\n" +
"```python\n" +
"import torch\n" +
"import torch.nn as nn\n\n" +
"class TwoTower(nn.Module):\n" +
"    def __init__(self, n_users, n_items, emb_dim=64,\n" +
"                 n_user_features=10, n_item_features=20):\n" +
"        super().__init__()\n" +
"        # ID embeddings (warm-start performance)\n" +
"        self.user_id = nn.Embedding(n_users, emb_dim)\n" +
"        self.item_id = nn.Embedding(n_items, emb_dim)\n" +
"        # Feature-based tower (cold-start path)\n" +
"        self.user_feat = nn.Sequential(\n" +
"            nn.Linear(n_user_features, 64), nn.ReLU(), nn.Linear(64, emb_dim),\n" +
"        )\n" +
"        self.item_feat = nn.Sequential(\n" +
"            nn.Linear(n_item_features, 64), nn.ReLU(), nn.Linear(64, emb_dim),\n" +
"        )\n\n" +
"    def user_tower(self, user_ids, user_feats):\n" +
"        return self.user_id(user_ids) + self.user_feat(user_feats)\n\n" +
"    def item_tower(self, item_ids, item_feats):\n" +
"        return self.item_id(item_ids) + self.item_feat(item_feats)\n\n" +
"    def forward(self, user_ids, user_feats, item_ids, item_feats):\n" +
"        u = self.user_tower(user_ids, user_feats)\n" +
"        v = self.item_tower(item_ids, item_feats)\n" +
"        # Cosine or dot product\n" +
"        return (u * v).sum(dim=-1)\n" +
"```\n\n" +
"## Training with negative sampling\n" +
"You only have POSITIVE examples (user u rated movie i). Generate NEGATIVES (random items u didn't rate) on the fly. Train to push positives' dot products HIGH and negatives' LOW.\n\n" +
"```python\n" +
"# Pseudocode\n" +
"for batch in dataloader:\n" +
"    u_ids, u_feats, i_pos_ids, i_pos_feats = batch\n" +
"    # Sample negatives\n" +
"    i_neg_ids = torch.randint(0, n_items, size=u_ids.shape)\n" +
"    i_neg_feats = item_features[i_neg_ids]\n" +
"    \n" +
"    pos_score = model(u_ids, u_feats, i_pos_ids, i_pos_feats)\n" +
"    neg_score = model(u_ids, u_feats, i_neg_ids, i_neg_feats)\n" +
"    \n" +
"    # BPR (Bayesian Personalised Ranking) loss\n" +
"    loss = -torch.log(torch.sigmoid(pos_score - neg_score)).mean()\n" +
"    loss.backward(); optimizer.step(); optimizer.zero_grad()\n" +
"```\n\n" +
"## Why two-tower won at scale\n" +
"```text\n" +
"1. Offline pre-compute every ITEM tower output → store as a vector index\n" +
"2. At query time: compute USER tower → search the item index for top-N nearest\n" +
"3. Latency: single forward pass + ANN search ≈ 10-50ms at billion-item scale\n" +
"4. Cold-start: new items get embeddings from FEATURES, not just IDs\n" +
"```\n\n" +
"That separation (user tower at query time, item tower precomputed) is what makes deep recsys ship at YouTube / Spotify / Pinterest scale.\n\n" +
"## What you'll get on MovieLens\n" +
"```text\n" +
"Baseline (avg)       : RMSE 1.05\n" +
"User-CF              : RMSE 0.945\n" +
"SVD (MF)             : RMSE 0.86\n" +
"Two-tower (with feats): RMSE 0.84 + cold-start works\n" +
"```\n\n" +
"The improvement over MF on MovieLens alone may be small; the COLD-START gain is the bigger win. With movie genres + tags as item features, brand-new items immediately get sensible recommendations.\n\n" +
"## When to use what\n" +
"- **Toy / learning**: user-CF or MF; understand the basics\n" +
"- **Production with few features**: MF (ALS via implicit)\n" +
"- **Production with rich features + cold-start matters**: two-tower\n" +
"- **Multi-modal (text + image features)**: two-tower with pretrained encoders"
      ),
      S([
        { prompt: "Two-tower models pre-compute item embeddings offline; only the user tower runs at query time.", answer: true, whenRight: "Right — that's the latency win. Item tower = batch job; user tower = real-time + ANN search.", whenWrong: "Yes — item tower offline; user tower online. Massive latency drop." },
        { prompt: "Two-tower models with feature-based towers handle cold-start better than ID-only MF.", answer: true, whenRight: "Right — new items get embeddings from their FEATURES, not from interaction history. Cold-start works immediately.", whenWrong: "Yes — feature tower = cold-start path. New item with features = instant embedding; new item with only ID = nothing." },
        { prompt: "BPR (Bayesian Personalised Ranking) loss uses pairs of (positive, negative) items per user.", answer: true, whenRight: "Right — push positive scores above negative scores. Pairwise ranking loss, standard for implicit feedback.", whenWrong: "Yes — pairwise. Pos > Neg by margin. Trains a ranking, not a calibrated probability." }
      ]),
      E("Your turn — two-tower","[CODE] In `recsys/04_two_tower.ipynb`:\n1. Build user features (number of ratings, avg rating) + item features (genre one-hot).\n2. Build the TwoTower model in PyTorch.\n3. Train with BPR loss + negative sampling, ~5 epochs.\n4. Evaluate RMSE + top-10 NDCG on test set.\n5. Markdown: how much did adding features help vs ID-only MF?")
    ]),
    D(5,"Cold-start mitigation","What about brand-new users?",[
      L("Cold-start — the perpetual problem",
"## Three cold-start scenarios\n" +
"```text\n" +
"NEW USER cold-start:\n" +
"  - First-time visitor. No history.\n" +
"  - Need: sensible first session before they bounce.\n" +
"\n" +
"NEW ITEM cold-start:\n" +
"  - Movie just released; product just listed.\n" +
"  - Need: surface to relevant users; build initial signal.\n" +
"\n" +
"NEW SEGMENT cold-start:\n" +
"  - Launch in a new country / language / category.\n" +
"  - Need: bootstrap recommendations for a fresh population.\n" +
"```\n\n" +
"## The fallback strategies\n\n" +
"### 1. Popularity-based (the cheapest fallback)\n" +
"For new users: recommend the globally most-popular items.\n" +
"```python\n" +
"top_popular = ratings.groupby('movieId')['rating'].agg(['count', 'mean'])\n" +
"top_popular = top_popular[top_popular['count'] >= 1000].sort_values('mean', ascending=False).head(20)\n" +
"```\n\n" +
"### 2. Content-based (for new items)\n" +
"Embed items using their FEATURES (genre, tags, plot description). Recommend items whose feature-vector is similar to ones the user has liked.\n" +
"```python\n" +
"from sklearn.feature_extraction.text import TfidfVectorizer\n" +
"from sklearn.metrics.pairwise import cosine_similarity\n\n" +
"vectorizer = TfidfVectorizer(stop_words='english')\n" +
"item_vectors = vectorizer.fit_transform(movies['title'] + ' ' + movies['genres'])\n" +
"# Item similarity: items with similar feature vectors are similar\n" +
"item_sim = cosine_similarity(item_vectors)\n" +
"```\n\n" +
"### 3. Demographic priors (for new users)\n" +
"Ask 3-5 onboarding questions (genre preferences, age, country). Use those to seed initial embeddings.\n\n" +
"### 4. Hybrid: blend by confidence\n" +
"```python\n" +
"def recommend(user_id, n=10):\n" +
"    n_ratings = user_rating_count.get(user_id, 0)\n" +
"    if n_ratings < 5:\n" +
"        # Cold: popularity + content from onboarding\n" +
"        return blend([popular_recs(n=20), demographic_recs(user_id, n=20)])\n" +
"    elif n_ratings < 50:\n" +
"        # Warming up: blend MF with popularity (downweight MF)\n" +
"        return blend([mf_recs(user_id, n=30, weight=0.6),\n" +
"                      popular_recs(n=30, weight=0.4)])\n" +
"    else:\n" +
"        # Warm: MF alone\n" +
"        return mf_recs(user_id, n=n)\n" +
"```\n\n" +
"## The 'first 5 ratings' UX\n" +
"Almost every consumer app does this:\n" +
"1. New user signs up\n" +
"2. Show 'pick 5 things you like' onboarding screen with popular items\n" +
"3. Use those 5 as the initial ratings to bootstrap embeddings\n" +
"\n" +
"This is product design solving a model problem. Worth knowing about — interview gold.\n\n" +
"## What goes in the documentation\n" +
"```markdown\n" +
"## Cold-start strategy\n" +
"\n" +
"- New user (0 ratings): popular_top_20 + (if onboarding completed)\n" +
"  demographic-seed embeddings\n" +
"- Warming user (1-50 ratings): blend(MF, popular) with weight on MF\n" +
"  rising as ratings accumulate\n" +
"- Warm user (>50): MF alone\n" +
"- New item (0 ratings): content-based recs via item features for 7 days,\n" +
"  then transition to MF as ratings accumulate\n" +
"\n" +
"## Why this matters\n" +
"- ~30% of MovieLens users have <10 ratings; they need cold-start to be\n" +
"  treated well or they churn.\n" +
"- New movies get ~0 ratings the first day; without item features they would\n" +
"  never surface.\n" +
"```"
      ),
      S([
        { prompt: "A popularity-based fallback is a sensible first move for cold-start new users.", answer: true, whenRight: "Right — cheap, works, doesn't embarrass the system. Popular items are popular for a reason.", whenWrong: "Yes — popularity is the baseline cold-start. Not personalised, but not broken either." },
        { prompt: "A 'pick 5 things you like' onboarding screen is product design solving a model problem.", answer: true, whenRight: "Right — that's why every major consumer app does it. Cheap data collection + immediate personalisation seed.", whenWrong: "Yes — product solves what model can't. Onboarding ratings become the seed for personalisation from day one." },
        { prompt: "Cold-start can be ignored if your main model is good enough.", answer: false, whenRight: "Right — no. Even perfect models can't help users with no history. Cold-start is REQUIRED, not optional.", whenWrong: "Cold-start is mandatory. New users / items are a constant flow; ignoring them = churning new users + dead inventory." }
      ]),
      E("Your turn — cold-start","[CODE] In `recsys/05_cold_start.ipynb`:\n1. Implement: popularity_recs(n), content_recs(user_history, n), hybrid_recs(user_id, n).\n2. Hold out 50 users with <5 ratings as 'cold' eval set.\n3. Compare: popularity vs content vs hybrid on those cold users.\n4. Markdown the cold-start strategy in `recsys/COLD_START.md`.")
    ]),
    D(6,"Multi-metric eval","precision@K, recall@K, NDCG.",[
      L("Why RMSE is the wrong metric for recsys",
"## What it is\n" +
"RMSE measures how close your predicted rating is to the true rating. That's not what users experience. Users experience a RANKED LIST of recommendations — they care about whether the top items are good, not whether you predicted 4.2 vs 4.5.\n\n" +
"The right metrics for recsys are RANKING metrics:\n\n" +
"```text\n" +
"PRECISION@K\n" +
"  Of your top-K recommendations, what fraction were relevant?\n" +
"  precision@10 = (# of relevant items in top-10) / 10\n" +
"\n" +
"RECALL@K\n" +
"  Of the items the user would have liked, what fraction did you surface?\n" +
"  recall@10 = (# of relevant items in top-10) / (total # of relevant items)\n" +
"\n" +
"NDCG@K (Normalised Discounted Cumulative Gain)\n" +
"  Like precision but rewards items at higher positions more.\n" +
"  Position 1 hit > Position 10 hit > Position 100 hit.\n" +
"  Normalised against the perfect ranking; max = 1.\n" +
"\n" +
"MAP@K (Mean Average Precision)\n" +
"  Average of precision at each correct hit position.\n" +
"  Like NDCG but binary relevance.\n" +
"\n" +
"COVERAGE\n" +
"  What fraction of items ever appear in any user's top-K?\n" +
"  Low coverage = filter bubble.\n" +
"\n" +
"DIVERSITY\n" +
"  How dissimilar are the top-K items to each other?\n" +
"  All romcoms in top-10 = boring.\n" +
"```\n\n" +
"## The implementations\n" +
"```python\n" +
"def precision_at_k(rec_items, relevant_items, k=10):\n" +
"    rec_top_k = rec_items[:k]\n" +
"    return len(set(rec_top_k) & set(relevant_items)) / k\n\n" +
"def recall_at_k(rec_items, relevant_items, k=10):\n" +
"    rec_top_k = rec_items[:k]\n" +
"    return len(set(rec_top_k) & set(relevant_items)) / len(relevant_items)\n\n" +
"def ndcg_at_k(rec_items, relevant_items, k=10):\n" +
"    import numpy as np\n" +
"    dcg = sum(\n" +
"        1.0 / np.log2(i + 2) for i, item in enumerate(rec_items[:k])\n" +
"        if item in relevant_items\n" +
"    )\n" +
"    idcg = sum(1.0 / np.log2(i + 2) for i in range(min(k, len(relevant_items))))\n" +
"    return dcg / idcg if idcg else 0.0\n" +
"```\n\n" +
"## Build the relevance set\n" +
"For each user in the test set: their 'relevant' items are those they rated ≥ 4 stars (or any threshold matching your problem).\n\n" +
"```python\n" +
"user_relevance = test[test['rating'] >= 4].groupby('userId')['movieId'].apply(set)\n" +
"```\n\n" +
"## Evaluate each model\n" +
"```python\n" +
"results = {'user_cf': [], 'mf': [], 'two_tower': []}\n" +
"for user_id, rel_items in user_relevance.items():\n" +
"    if len(rel_items) < 5:\n" +
"        continue\n" +
"    recs_cf  = user_cf_topk(user_id, k=10)\n" +
"    recs_mf  = mf_topk(user_id, k=10)\n" +
"    recs_tt  = two_tower_topk(user_id, k=10)\n" +
"    results['user_cf'].append((precision_at_k(recs_cf, rel_items, 10),\n" +
"                               recall_at_k(recs_cf, rel_items, 10),\n" +
"                               ndcg_at_k(recs_cf, rel_items, 10)))\n" +
"    # same for mf, tt\n\n" +
"# Average over users\n" +
"for name, vals in results.items():\n" +
"    p, r, n = zip(*vals)\n" +
"    print(f'{name}: P@10={np.mean(p):.3f}  R@10={np.mean(r):.3f}  NDCG@10={np.mean(n):.3f}')\n" +
"```\n\n" +
"## The honest comparison table\n" +
"```markdown\n" +
"| Model      | RMSE | P@10  | R@10  | NDCG@10 | Coverage |\n" +
"|------------|------|-------|-------|---------|----------|\n" +
"| Avg        | 1.05 | 0.05  | 0.02  | 0.06    | 0%       |\n" +
"| User-CF    | 0.95 | 0.18  | 0.06  | 0.21    | 12%      |\n" +
"| MF (SVD)   | 0.86 | 0.27  | 0.10  | 0.32    | 45%      |\n" +
"| Two-tower  | 0.84 | 0.31  | 0.12  | 0.36    | 67%      |\n" +
"```\n\n" +
"That table is the recsys deliverable. Each row tells a different story; the picks differ depending on which column matters."
      ),
      S([
        { prompt: "RMSE is the right primary metric for production recsys.", answer: false, whenRight: "Right — no. Users experience a ranked list, not a predicted rating. Ranking metrics (P@K, NDCG@K) match user experience.", whenWrong: "Wrong target. Users see rankings, not predictions. NDCG@K is closer to user experience." },
        { prompt: "NDCG rewards relevant items at higher positions more than at lower positions.", answer: true, whenRight: "Right — log discount. Position 1 is worth more than position 10. Matches how users actually consume rankings.", whenWrong: "Yes — position-discounted. Higher position = more credit, because users actually scroll less than you think." },
        { prompt: "Coverage and diversity are vanity metrics that don't matter for a real recsys.", answer: false, whenRight: "Right — no. Low coverage = filter bubble + dead inventory; low diversity = boring sessions + churn. Both are real production concerns.", whenWrong: "Real concerns. Filter bubbles + boring lists are how recsys fail in production even with high P@K." }
      ]),
      E("Your turn — multi-metric","[CODE] In `recsys/06_eval.ipynb`:\n1. Implement precision@K, recall@K, NDCG@K.\n2. Build relevance sets from test (rating ≥ 4).\n3. Evaluate each model from W41 D2/3/4.\n4. Build the comparison table (RMSE + P@10 + R@10 + NDCG@10 + coverage).\n5. Markdown: which model wins on which dimension, and what's the tradeoff?")
    ]),
    D(7,"Streamlit demo + tag","Live deployment + ship.",[
      L("The recsys Streamlit demo + ship",
"## The demo\n" +
"```python\n" +
"import streamlit as st\n" +
"import pandas as pd\n\n" +
"st.title('MovieLens Recommender')\n\n" +
"@st.cache_resource\n" +
"def load_artifacts():\n" +
"    # load: MF model, item features, movie titles, item embeddings\n" +
"    ...\n\n" +
"model, items, movies = load_artifacts()\n\n" +
"st.subheader('Pick 5 movies you like')\n" +
"liked = st.multiselect('Movies', movies['title'].tolist())\n\n" +
"if len(liked) >= 5:\n" +
"    # Build a temporary user from those 5 ratings; embed; recommend\n" +
"    recs = recommend_for_new_user(liked, n=20)\n" +
"    st.subheader('You might like')\n" +
"    for r in recs:\n" +
"        col1, col2, col3 = st.columns([3, 1, 2])\n" +
"        col1.write(r['title'])\n" +
"        col2.metric('Score', f\"{r['score']:.2f}\")\n" +
"        col3.write(r['genres'])\n" +
"else:\n" +
"    st.info(f'Pick {5 - len(liked)} more movies to see recommendations.')\n" +
"```\n\n" +
"## Why the 'pick 5' UX\n" +
"Cold-start in action. Users don't have ratings yet; the onboarding screen IS the cold-start mitigation. Streamlit lets you ship this in 30 lines.\n\n" +
"## Deploy on Streamlit Cloud\n" +
"Same path as every other week. Push to GitHub. Connect Streamlit Cloud. Get a URL.\n\n" +
"## The blog post (~1000 words)\n" +
"```text\n" +
"1. Hook — 'Three generations of recsys on the same dataset. The winner —\n" +
"           and the surprising loser.'\n" +
"2. Why recsys matters — interview gold at consumer tech\n" +
"3. User-based CF — implementation + RMSE\n" +
"4. Matrix factorization — embeddings + the Netflix Prize moment\n" +
"5. Two-tower deep model — features + cold-start\n" +
"6. Cold-start strategy\n" +
"7. The comparison table — RMSE + ranking metrics + coverage\n" +
"8. What I'd add for production — counterfactual eval, real-time updates\n" +
"9. Live demo link + repo\n" +
"```\n\n" +
"## Tag and ship\n" +
"```bash\n" +
"git add recsys/\n" +
"git commit -m \"Recsys specialty: CF + MF + two-tower + cold-start, with multi-metric eval\"\n" +
"git tag recsys-shipped\n" +
"git push && git push --tags\n" +
"```\n\n" +
"## Why this is interview gold\n" +
"'Tell me how you'd build a recommender for X' is the most-asked technical question at consumer tech DS interviews. With three implementations + a comparison + a working demo + a documented cold-start strategy, you have a ready answer at every level of depth — from 30 seconds to 30 minutes."
      ),
      S([
        { prompt: "A 'pick 5 movies you like' onboarding screen is the cold-start mitigation in action.", answer: true, whenRight: "Right — product solves what the model alone can't. The onboarding ratings become the seed.", whenWrong: "Yes — product UX solves the model's cold-start problem. Most consumer apps do this." },
        { prompt: "Building three generations of recsys + comparison + working demo is a ready interview answer at every depth.", answer: true, whenRight: "Right — same answer scales from 30s to 30min. That's why it's interview gold at consumer tech.", whenWrong: "Yes — depth-on-demand. The hardest interview question becomes a prepared talk." },
        { prompt: "Recsys specialty week is required for hiring at any DS company.", answer: false, whenRight: "Right — no. It's a +1 for consumer tech specifically (Amazon, Netflix, Spotify, TikTok, ad-tech). Not required for B2B / analytics DS.", whenWrong: "Specialty for consumer tech. Strongly differentiating for ads/recommendations roles; less critical for analytics-leaning DS." }
      ]),
      E("Your turn — ship recsys-shipped","[PRODUCE] 1. Build Streamlit demo with 'pick 5' onboarding.\n2. Deploy on Streamlit Cloud.\n3. Write the blog post; publish.\n4. Commit + tag:\n`git add recsys/ && git commit -m 'recsys-shipped' && git tag recsys-shipped && git push --tags`\n\nPASS:\n[x] User-CF, MF, two-tower notebooks\n[x] Cold-start notebook + COLD_START.md\n[x] Multi-metric comparison table\n[x] Streamlit demo live\n[x] Blog post published\n[x] recsys-shipped tag pushed")
    ])
  ]
};

/* ═══════════════════════════════════════════════════════════
   VALIDATE + WRITE
   ═══════════════════════════════════════════════════════════ */
const newWeeks = [W40, W41];
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

ds.weeks.splice(39, 2, ...newWeeks);

fs.writeFileSync(FILE, JSON.stringify(ds, null, 2), 'utf8');
console.log(`SUCCESS — DS W40-W41 rebuilt. Total weeks: ${ds.weeks.length}`);
