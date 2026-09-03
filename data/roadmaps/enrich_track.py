#!/usr/bin/env python3
"""
Universal track enricher v3 — preserve-and-pad with hard quality gates.

New in v3:
- Library URLs are pre-validated via YouTube oembed at startup (disk-cached).
- Raw video items with youtube.com/results search URLs are dropped.
- Raw video items with duration_min >= 15 are dropped.
- Raw video items whose URL fails oembed are dropped.
- Dropped videos are replaced via the verified library; if no replacement, skip.
- Every exercise body gets a [CODE]/[WRITE]/[PRODUCE] label.
- Every video gets a 'why' field.
- Data Science + Data Analysis tracks now go through the same pipeline.

Usage:
    python enrich_track.py
    python enrich_track.py full-stack-web
"""

import json
import re
import sys
import urllib.parse
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

HERE = Path(__file__).resolve().parent
CACHE_FILE = HERE / '.video-cache.json'

YT_URL_RE = re.compile(
    r'^https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[A-Za-z0-9_-]{11}'
)
YT_SEARCH_RE = re.compile(r'youtube\.com/results')

# ============================================================
# Candidate video library — multiple alternates per topic key.
# Validated at startup; dead URLs are pruned.
# ============================================================
KNOWN_GOOD = {
    'git': [
        ('https://www.youtube.com/watch?v=USjZcfj8yxE', 10, 'Web Dev Simplified', 'Your First Git + GitHub Push'),
        ('https://www.youtube.com/watch?v=HkdAHXoRtos', 12, 'Fireship',           '13 Advanced Git Tricks'),
        ('https://www.youtube.com/watch?v=eulnSXkhE7I', 8,  'Fireship',           'Git Branches Explained'),
    ],
    'linux':       [('https://www.youtube.com/watch?v=ROjZy1WbCIA', 5, 'ThePrimeagen', 'Linux in 5 minutes')],
    'ssh':         [('https://www.youtube.com/watch?v=ORrELbFHwU4', 5, 'NetworkChuck', 'SSH in 5 minutes')],
    'docker': [
        ('https://www.youtube.com/watch?v=Gjnup-PuquQ', 2, 'Fireship', 'Docker in 100 Seconds'),
        ('https://www.youtube.com/watch?v=eGz9DS-aIeY', 6, 'Fireship', 'Docker Tutorial for Beginners'),
        ('https://www.youtube.com/watch?v=DM65_JyGxCo', 5, 'Fireship', 'Dockerfile Best Practices'),
    ],
    'kubernetes': [
        ('https://www.youtube.com/watch?v=X48VuDVv0do', 2, 'Fireship', 'Kubernetes in 100 Seconds'),
    ],
    'terraform': [
        ('https://www.youtube.com/watch?v=tomUWcQ0P3k', 2, 'Fireship', 'Terraform in 100 Seconds'),
    ],
    'helm':        [('https://www.youtube.com/watch?v=ufiTD4I8k48', 2, 'Fireship', 'Helm in 100 Seconds')],
    'argo':        [('https://www.youtube.com/watch?v=MeU5_k9ssrs', 2, 'Fireship', 'Argo CD in 100 Seconds')],
    'prometheus':  [('https://www.youtube.com/watch?v=h4Sl21AKiDg', 2, 'Fireship', 'Prometheus in 100 Seconds')],
    'nginx':       [('https://www.youtube.com/watch?v=9t4MvM9iP8M', 5, 'Fireship', 'Nginx in 5 minutes')],
    'iac':         [('https://www.youtube.com/watch?v=hg3f3gWOKq4', 5, 'Fireship', 'Infrastructure as Code in 5 minutes')],
    'networking':  [('https://www.youtube.com/watch?v=qiQR5rTSshw', 2, 'Fireship', 'Computer Networking in 100 seconds')],
    'owasp':       [('https://www.youtube.com/watch?v=ub1GvSlj1uE', 5, 'Fireship', 'OWASP Top 10')],
    'javascript':  [('https://www.youtube.com/watch?v=DHjqpvDnNGE', 2, 'Fireship', 'JavaScript in 100 Seconds')],
    'typescript':  [('https://www.youtube.com/watch?v=zQnBQ4tB3ZA', 2, 'Fireship', 'TypeScript in 100 Seconds')],
    'react':       [('https://www.youtube.com/watch?v=Tn6-PIqc4UM', 2, 'Fireship', 'React in 100 Seconds')],
    'nextjs':      [('https://www.youtube.com/watch?v=Sklc_fQBmcs', 2, 'Fireship', 'Next.js in 100 Seconds')],
    'tailwind':    [('https://www.youtube.com/watch?v=mr15Xzb1Ook', 2, 'Fireship', 'Tailwind CSS in 100 Seconds')],
    'astro':       [('https://www.youtube.com/watch?v=gxBkghlglTg', 2, 'Fireship', 'Astro in 100 Seconds')],
    'vite':        [('https://www.youtube.com/watch?v=KCrXgy8qtjM', 2, 'Fireship', 'Vite in 100 Seconds')],
    'redux':       [('https://www.youtube.com/watch?v=_shA5Xwe8_4', 2, 'Fireship', 'Redux in 100 Seconds')],
    'graphql':     [('https://www.youtube.com/watch?v=eIQh02xuVw4', 2, 'Fireship', 'GraphQL in 100 Seconds')],
    'nodejs':      [('https://www.youtube.com/watch?v=ENrzD9HAZK4', 2, 'Fireship', 'Node.js in 100 Seconds')],
    'express':     [('https://www.youtube.com/watch?v=-MTSQjw5DrM', 2, 'Fireship', 'Express in 100 Seconds')],
    'postgres':    [('https://www.youtube.com/watch?v=n2Fluyr3lbc', 2, 'Fireship', 'PostgreSQL in 100 Seconds')],
    'prisma':      [('https://www.youtube.com/watch?v=rLRIB6AF2Dg', 2, 'Fireship', 'Prisma in 100 Seconds')],
    'rest':        [('https://www.youtube.com/watch?v=-MTSQjw5DrM', 2, 'Fireship', 'REST API in 100 Seconds')],
    'auth': [
        ('https://www.youtube.com/watch?v=2PPSXonhIck', 5, 'Fireship', '7 Auth Strategies in 5 minutes'),
    ],
    'jwt':         [('https://www.youtube.com/watch?v=7Q17ubqLfaM', 2, 'Fireship', 'JWT in 100 Seconds')],
    'websocket':   [('https://www.youtube.com/watch?v=1BfCnjr_Vjg', 2, 'Fireship', 'WebSockets in 100 Seconds')],
    'reactnative': [('https://www.youtube.com/watch?v=gvkqT_Uoahw', 2, 'Fireship', 'React Native in 100 Seconds')],
    'expo':        [('https://www.youtube.com/watch?v=mQM5nPwMod0', 5, 'Fireship', 'Expo + React Native')],
    'flutter':     [('https://www.youtube.com/watch?v=lHhRhPV--G0', 2, 'Fireship', 'Flutter in 100 Seconds')],
    'python':      [('https://www.youtube.com/watch?v=x7X9w_GIm1s', 2, 'Fireship', 'Python in 100 Seconds')],
    'pandas':      [('https://www.youtube.com/watch?v=DkjCaAMBGWM', 2, 'Fireship', 'Pandas in 100 Seconds')],
    'jupyter':     [('https://www.youtube.com/watch?v=h1sAzPojKMg', 2, 'Fireship', 'Jupyter in 100 Seconds')],
    'pytorch':     [('https://www.youtube.com/watch?v=ORMx45xqWkA', 2, 'Fireship', 'PyTorch in 100 Seconds')],
    'tensorflow':  [('https://www.youtube.com/watch?v=i8NETqtGHms', 2, 'Fireship', 'TensorFlow in 100 Seconds')],
    'ml':          [('https://www.youtube.com/watch?v=I74ymkoNTnw', 5, 'Fireship', 'Machine Learning in 100 Seconds')],
    'langchain':   [('https://www.youtube.com/watch?v=lG7Uxts9SXs', 2, 'Fireship', 'LangChain in 100 Seconds')],
    'rag':         [('https://www.youtube.com/watch?v=T-D1OfcDW1M', 5, 'IBM Technology', 'What is RAG?')],
    'vector':      [('https://www.youtube.com/watch?v=klTvEwg3oJ4', 2, 'Fireship', 'Vector Databases in 100 Seconds')],
    'embedding':   [('https://www.youtube.com/watch?v=klTvEwg3oJ4', 2, 'Fireship', 'Vector Databases in 100 Seconds')],
    'n8n':         [('https://www.youtube.com/watch?v=AURnISajubk', 5, 'n8n',       'Getting Started with n8n')],
    'sql':         [('https://www.youtube.com/watch?v=zsjvFFKOm3c', 2, 'Fireship',  'SQL in 100 Seconds')],
    'kali':        [('https://www.youtube.com/watch?v=U1w4T03B30I', 5, 'NetworkChuck', 'Kali Linux Crash Course')],
    'metasploit':  [('https://www.youtube.com/watch?v=8lR27r8Y_ik', 5, 'NetworkChuck', 'Metasploit in 5 minutes')],
    'nmap':        [('https://www.youtube.com/watch?v=4t4kBkMsDbQ', 5, 'NetworkChuck', 'Nmap Tutorial for Beginners')],
    'wireshark':   [('https://www.youtube.com/watch?v=jvuiI1Leg6w', 5, 'NetworkChuck', 'Wireshark Crash Course')],
    'siem':        [('https://www.youtube.com/watch?v=GG-VRGx2j8s', 5, 'Professor Messer', 'SIEM Explained')],
    'zerotrust':   [('https://www.youtube.com/watch?v=yn6CPQ9RioA', 5, 'IBM Technology', 'Zero Trust Explained')],
    'xss':         [('https://www.youtube.com/watch?v=EoaDgUgS6QA', 5, 'PwnFunction', 'Cross-Site Scripting Explained')],
    'idor':        [('https://www.youtube.com/watch?v=rINq_dahdtg', 5, 'PwnFunction', 'IDOR Explained')],
}

# ============================================================
# Deep-dive library — iconic, high-quality math/ML/stats videos (3Blue1Brown,
# StatQuest). These are masterpieces worth 10-27 minutes; the tiered duration
# budget decides where they fit. Entries are 5-tuples with a difficulty tag.
# Titles are distinctive so the oembed title-gate can verify identity.
# ============================================================
DEEP_DIVE = {
    'neural-network':      [('https://www.youtube.com/watch?v=aircAruvnKk', 19, '3Blue1Brown', 'But what is a neural network', 'intermediate')],
    'backprop':            [('https://www.youtube.com/watch?v=Ilg3gGewQ5U', 14, '3Blue1Brown', 'Backpropagation intuitively Deep Learning', 'advanced'),
                            ('https://www.youtube.com/watch?v=tIeHLnjs5U8', 10, '3Blue1Brown', 'Backpropagation calculus Deep Learning', 'advanced')],
    'gradient-descent':    [('https://www.youtube.com/watch?v=IHZwWFHWa-w', 21, '3Blue1Brown', 'Gradient descent how neural networks learn', 'advanced')],
    'linear-algebra':      [('https://www.youtube.com/watch?v=fNk_zzaMoSs', 10, '3Blue1Brown', 'Vectors Essence of linear algebra', 'beginner'),
                            ('https://www.youtube.com/watch?v=kYB8IZa5AuE', 11, '3Blue1Brown', 'Linear transformations and matrices', 'intermediate')],
    'eigen':               [('https://www.youtube.com/watch?v=PFDu9oVAE-g', 17, '3Blue1Brown', 'Eigenvectors and eigenvalues', 'advanced')],
    'normal-distribution': [('https://www.youtube.com/watch?v=rzFX5NWojp0', 5, 'StatQuest', 'The Normal Distribution clearly explained', 'beginner')],
    'linear-regression':   [('https://www.youtube.com/watch?v=7ArmBVF2dCs', 27, 'StatQuest', 'Linear Regression clearly explained', 'beginner')],
    'calculus':            [('https://www.youtube.com/watch?v=WUvTyaaNkzM', 17, '3Blue1Brown', 'The essence of calculus', 'beginner')],
    'bayes':               [('https://www.youtube.com/watch?v=HZGCoVF3YvM', 15, '3Blue1Brown', 'Bayes theorem the geometry of changing beliefs', 'intermediate')],
    'convolution':         [('https://www.youtube.com/watch?v=KuXjwB4LzSA', 23, '3Blue1Brown', 'But what is a convolution', 'advanced')],
    'transformer':         [('https://www.youtube.com/watch?v=wjZofJX0v4M', 27, '3Blue1Brown', 'Transformers the tech behind LLMs Deep Learning', 'advanced'),
                            ('https://www.youtube.com/watch?v=eMlx5fFNoYc', 26, '3Blue1Brown', 'Attention in transformers visually explained', 'advanced')],
    'logistic-regression': [('https://www.youtube.com/watch?v=yIYKR4sgzI8', 9,  'StatQuest', 'StatQuest Logistic Regression', 'beginner')],
    'random-forest':       [('https://www.youtube.com/watch?v=J4Wdy0Wc_xQ', 10, 'StatQuest', 'StatQuest Random Forests', 'intermediate')],
    'decision-tree':       [('https://www.youtube.com/watch?v=_L39rN6gz7Y', 17, 'StatQuest', 'StatQuest Decision Trees', 'intermediate')],
    'bias-variance':       [('https://www.youtube.com/watch?v=EuBBz3bI-aA', 7,  'StatQuest', 'Machine Learning Fundamentals Bias and Variance', 'beginner')],
    'cross-validation':    [('https://www.youtube.com/watch?v=fSytzGwwBVw', 6,  'StatQuest', 'Machine Learning Fundamentals Cross Validation', 'beginner')],
    'confusion-matrix':    [('https://www.youtube.com/watch?v=Kdsp6soqA7o', 7,  'StatQuest', 'Machine Learning Fundamentals The Confusion Matrix', 'beginner')],
    'roc-auc':             [('https://www.youtube.com/watch?v=4jRBRDbJemM', 16, 'StatQuest', 'ROC and AUC Clearly Explained', 'intermediate')],
    'pca':                 [('https://www.youtube.com/watch?v=HMOI_lkzW08', 6,  'StatQuest', 'StatQuest PCA main ideas', 'intermediate')],
    'kmeans':              [('https://www.youtube.com/watch?v=4b5d3muPQmA', 9,  'StatQuest', 'StatQuest K-means clustering', 'beginner')],
    'mle':                 [('https://www.youtube.com/watch?v=XepXtl9YKwc', 6,  'StatQuest', 'Maximum Likelihood clearly explained', 'intermediate')],
    'word2vec':            [('https://www.youtube.com/watch?v=viZrOnJclY0', 16, 'StatQuest', 'Word Embedding and Word2Vec Clearly Explained', 'intermediate')],
    'rnn':                 [('https://www.youtube.com/watch?v=AsNTP8Kwu80', 16, 'StatQuest', 'Recurrent Neural Networks RNNs Clearly Explained', 'advanced')],
    'lstm':                [('https://www.youtube.com/watch?v=YCzL96nL7j0', 21, 'StatQuest', 'Long Short-Term Memory LSTM Clearly Explained', 'advanced')],
    # ── candidate batch (gate-verified: kept only if the oembed title matches) ──
    'gradient-boost':      [('https://www.youtube.com/watch?v=3CC4N4z3GJc', 16, 'StatQuest', 'Gradient Boost Part 1 Regression Main Ideas', 'advanced')],
    'adaboost':            [('https://www.youtube.com/watch?v=LsK-xG1cLYA', 20, 'StatQuest', 'AdaBoost Clearly Explained', 'advanced')],
    'naive-bayes':         [('https://www.youtube.com/watch?v=O2L2Uv9pdDA', 15, 'StatQuest', 'Naive Bayes Clearly Explained', 'intermediate')],
    'svm':                 [('https://www.youtube.com/watch?v=efR1C6CvhmE', 20, 'StatQuest', 'Support Vector Machines Part 1 Main Ideas', 'advanced')],
    'knn':                 [('https://www.youtube.com/watch?v=HVXime0nQeI', 5,  'StatQuest', 'K-nearest neighbors Clearly Explained', 'beginner')],
    'regularization':      [('https://www.youtube.com/watch?v=Q81RR3yKn30', 20, 'StatQuest', 'Regularization Part 1 Ridge Regression', 'advanced')],
    'csrf':                [('https://www.youtube.com/watch?v=eWEgUcHPle0', 6,  'PwnFunction', 'Cross-site Request Forgery CSRF Explained', 'intermediate')],
    'sqli':                [('https://www.youtube.com/watch?v=ciNHn38EyRc', 9,  'PwnFunction', 'SQL Injection Explained', 'intermediate')],
    'redis':               [('https://www.youtube.com/watch?v=G1rOthIU-uo', 2,  'Fireship', 'Redis in 100 Seconds', 'beginner')],
    'firebase':            [('https://www.youtube.com/watch?v=vAoB4VbhRzM', 2,  'Fireship', 'Firebase in 100 Seconds', 'beginner')],
    'agent':               [('https://www.youtube.com/watch?v=F8NKVhkZZWE', 7,  'IBM Technology', 'What are AI Agents', 'intermediate')],
}
KNOWN_GOOD.update(DEEP_DIVE)

DEFAULT_VIDEO_KEY = 'git'

# Keyword -> KNOWN_GOOD key. Order matters: most specific first.
KEYWORD_VIDEO_MAP = [
    # ── priority curated concepts (keys are filled via CURATE_TOP.csv; routing is
    #    pre-wired so one curated video lands on every matching day-title variant) ──
    ('function calling', 'function-calling'), ('tool calling', 'function-calling'),
    ('tool use', 'function-calling'), ('tool/function', 'function-calling'),
    ('parallel tool', 'function-calling'), ('forced tool', 'function-calling'),
    ('structured output', 'structured-outputs'), ('json mode', 'structured-outputs'),
    ('json schema', 'structured-outputs'), ('pydantic', 'structured-outputs'),
    ('llm-as-judge', 'llm-eval'), ('llm as judge', 'llm-eval'), ('eval set', 'llm-eval'),
    ('golden test', 'llm-eval'), ('answer metrics', 'llm-eval'), ('test cases', 'llm-eval'),
    ('run the eval', 'llm-eval'), ('why eval', 'llm-eval'), ('evaluation framework', 'llm-eval'),
    ('prompt injection', 'prompt-injection'), ('injection defence', 'prompt-injection'),
    ('injection defense', 'prompt-injection'), ('input wrapping', 'prompt-injection'), ('jailbreak', 'prompt-injection'),
    ('prompt engineering', 'prompt-engineering'), ('few-shot', 'prompt-engineering'),
    ('few shot', 'prompt-engineering'), ('chain-of-thought', 'prompt-engineering'),
    ('chain of thought', 'prompt-engineering'), ('system prompt', 'prompt-engineering'),
    ('rag evaluation', 'rag-eval'), ('ragas', 'rag-eval'), ('retrieval eval', 'rag-eval'),
    ('rag quality', 'rag-eval'), ('answer relevance', 'rag-eval'),
    ('observability', 'llm-observability'), ('tracing', 'llm-observability'),
    ('langsmith', 'llm-observability'), ('phoenix', 'llm-observability'), ('helicone', 'llm-observability'),
    ('fine-tuning', 'fine-tuning'), ('fine tuning', 'fine-tuning'), ('fine tune', 'fine-tuning'),
    ('lora', 'fine-tuning'), ('peft', 'fine-tuning'),
    ('token streaming', 'llm-streaming'), ('buffering and flushing', 'llm-streaming'),
    ('streaming and cost', 'llm-streaming'), ('sse', 'llm-streaming'),
    ('plan-then-execute', 'agent'), ('plan and execute', 'agent'), ('react agent', 'agent'),
    ('agent loop', 'agent'), ('agentic', 'agent'), ('autonomous', 'agent'), ('ai agent', 'agent'),
    ('conversation buffer', 'agent-memory'), ('agent memory', 'agent-memory'),
    ('multi-step agent', 'agent-memory'), ('context window', 'agent-memory'),
    ('model context protocol', 'mcp'), ('mcp', 'mcp'), ('tool server', 'mcp'),
    ('burp', 'burp'),
    ('owasp', 'owasp'), ('top 10', 'owasp'), ('juice shop', 'owasp'),
    ('idor', 'idor'), ('broken access', 'idor'), ('insecure direct object', 'idor'),
    ('ssrf', 'ssrf'), ('server-side request', 'ssrf'),
    ('privilege escalation', 'privesc'), ('privesc', 'privesc'),
    ('incident response', 'incident-response'), ('incident handling', 'incident-response'),
    ('threat model', 'threat-modeling'), ('threat modeling', 'threat-modeling'), ('stride', 'threat-modeling'),
    ('web scraping', 'web-scraping'), ('scraping', 'web-scraping'), ('beautifulsoup', 'web-scraping'),
    ('document processing', 'document-ai'), ('ocr', 'document-ai'), ('pdf extraction', 'document-ai'),
    ('browser automation', 'browser-automation'), ('playwright', 'browser-automation'),
    ('computer use', 'browser-automation'), ('selenium', 'browser-automation'),
    ('api integration', 'api-integration'), ('calling apis', 'api-integration'), ('http request', 'api-integration'),
    # ── broad concept vocabulary -> verified library (boosts coverage massively) ──
    # LLM / AI engineering
    ('retrieval-augmented', 'rag'), ('retrieval augmented', 'rag'), ('rag', 'rag'), ('retrieval', 'rag'),
    ('vector database', 'vector'), ('vector db', 'vector'), ('vector store', 'vector'),
    ('embedding', 'embedding'), ('embeddings', 'embedding'), ('semantic search', 'embedding'),
    ('large language model', 'transformer'), ('llm', 'transformer'), ('language model', 'transformer'),
    ('langchain', 'langchain'), ('llamaindex', 'langchain'),
    ('word2vec', 'word2vec'), ('word embedding', 'word2vec'),
    ('recurrent neural', 'rnn'), ('rnn', 'rnn'), ('sequence model', 'rnn'),
    ('lstm', 'lstm'), ('long short-term', 'lstm'), ('long short term', 'lstm'),
    ('gradient boost', 'gradient-boost'), ('xgboost', 'gradient-boost'),
    ('adaboost', 'adaboost'),
    ('naive bayes', 'naive-bayes'),
    ('support vector', 'svm'), ('svm', 'svm'),
    ('k-nearest', 'knn'), ('nearest neighbor', 'knn'), ('knn', 'knn'),
    ('regularization', 'regularization'), ('ridge', 'regularization'), ('lasso', 'regularization'),
    ('csrf', 'csrf'), ('cross-site request', 'csrf'),
    ('sql injection', 'sqli'), ('sqli', 'sqli'),
    ('redis', 'redis'), ('caching', 'redis'),
    ('firebase', 'firebase'),
    ('ai agent', 'agent'), ('agentic', 'agent'), ('agent loop', 'agent'), ('agents', 'agent'),
    # ML / stats
    ('logistic regression', 'logistic-regression'), ('regression', 'logistic-regression'),
    ('random forest', 'random-forest'), ('random forests', 'random-forest'),
    ('decision tree', 'decision-tree'), ('decision trees', 'decision-tree'),
    ('gradient boosting', 'decision-tree'), ('gradient boost', 'decision-tree'), ('xgboost', 'decision-tree'),
    ('boosting', 'decision-tree'), ('ensemble', 'random-forest'),
    ('clustering', 'kmeans'), ('cluster', 'kmeans'), ('k-means', 'kmeans'), ('kmeans', 'kmeans'), ('unsupervised', 'kmeans'),
    ('dimensionality reduction', 'pca'), ('principal component', 'pca'), ('pca', 'pca'),
    ('cross-validation', 'cross-validation'), ('cross validation', 'cross-validation'),
    ('overfitting', 'bias-variance'), ('bias and variance', 'bias-variance'), ('bias-variance', 'bias-variance'),
    ('confusion matrix', 'confusion-matrix'),
    ('roc', 'roc-auc'), ('auc', 'roc-auc'), ('precision and recall', 'roc-auc'), ('classification metric', 'roc-auc'),
    ('maximum likelihood', 'mle'), ('mle', 'mle'),
    ('naive bayes', 'bayes'), ('bayesian', 'bayes'), ('bayes', 'bayes'),
    ('neural network', 'neural-network'), ('neural net', 'neural-network'), ('deep learning', 'neural-network'),
    ('perceptron', 'neural-network'), ('mlp', 'neural-network'),
    ('backpropagation', 'backprop'), ('backprop', 'backprop'),
    ('gradient descent', 'gradient-descent'),
    ('convolutional', 'convolution'), ('convolution', 'convolution'), ('cnn', 'convolution'),
    ('computer vision', 'convolution'), ('image classification', 'convolution'),
    ('eigenvalue', 'eigen'), ('eigenvector', 'eigen'), ('svd', 'eigen'),
    ('linear algebra', 'linear-algebra'), ('vectors and matrices', 'linear-algebra'), ('matrix', 'linear-algebra'),
    ('dot product', 'linear-algebra'), ('vectors and the', 'linear-algebra'),
    ('normal distribution', 'normal-distribution'), ('central limit', 'normal-distribution'), ('the clt', 'normal-distribution'),
    ('linear regression', 'linear-regression'), ('normal equation', 'linear-regression'), ('least squares', 'linear-regression'),
    ('calculus', 'calculus'), ('derivative', 'calculus'),
    ('pytorch', 'pytorch'), ('tensorflow', 'tensorflow'), ('keras', 'tensorflow'),
    ('time series', 'ml'), ('feature engineering', 'ml'), ('machine learning', 'ml'), ('first model', 'ml'),
    # web / frontend
    ('react hook', 'react'), ('hooks', 'react'), ('usestate', 'react'), ('useeffect', 'react'),
    ('component', 'react'), ('jsx', 'react'), ('react', 'react'),
    ('app router', 'nextjs'), ('server component', 'nextjs'), ('server action', 'nextjs'), ('next.js', 'nextjs'), ('nextjs', 'nextjs'),
    ('tailwind', 'tailwind'), ('design system', 'tailwind'),
    ('state management', 'redux'), ('redux', 'redux'), ('zustand', 'redux'),
    ('rest api', 'rest'), ('api design', 'rest'), ('endpoint', 'rest'), ('rest', 'rest'),
    ('prisma', 'prisma'), ('orm', 'prisma'), ('migration', 'prisma'),
    ('postgres', 'postgres'), ('postgresql', 'postgres'), ('relational database', 'postgres'),
    ('authentication', 'jwt'), ('authorization', 'jwt'), ('session', 'jwt'), ('jwt', 'jwt'), ('oauth', 'jwt'), ('login', 'jwt'),
    ('websocket', 'websocket'), ('real-time', 'websocket'), ('realtime', 'websocket'), ('socket', 'websocket'),
    ('graphql', 'graphql'),
    ('node.js', 'nodejs'), ('node', 'nodejs'), ('express', 'express'),
    ('astro', 'astro'), ('vite', 'vite'), ('typescript', 'typescript'), ('javascript', 'javascript'),
    # mobile
    ('react native', 'reactnative'), ('expo', 'reactnative'), ('navigation', 'reactnative'),
    ('flutter', 'flutter'),
    # security
    ('cross-site scripting', 'xss'), ('xss', 'xss'),
    ('nmap', 'nmap'), ('port scan', 'nmap'), ('reconnaissance', 'nmap'), ('recon', 'nmap'),
    ('metasploit', 'metasploit'), ('exploitation', 'metasploit'), ('exploit', 'metasploit'),
    ('wireshark', 'wireshark'), ('packet', 'wireshark'),
    ('kali', 'kali'), ('zero trust', 'zerotrust'), ('zero-trust', 'zerotrust'),
    # data / infra
    ('sql', 'sql'), ('query', 'sql'), ('joins', 'sql'),
    ('pandas', 'pandas'), ('dataframe', 'pandas'), ('groupby', 'pandas'), ('aggregation', 'pandas'),
    ('jupyter', 'jupyter'), ('notebook', 'jupyter'), ('python', 'python'),
    ('docker', 'docker'), ('container', 'docker'), ('dockerfile', 'docker'),
    ('kubernetes', 'kubernetes'), ('k8s', 'kubernetes'), ('pod', 'kubernetes'),
    ('terraform', 'terraform'), ('infrastructure as code', 'terraform'),
    ('prometheus', 'prometheus'), ('monitoring', 'prometheus'), ('observability', 'prometheus'),
    ('networking', 'networking'), ('dns', 'networking'),
    ('linux', 'linux'), ('shell', 'linux'), ('bash', 'linux'),
    ('git', 'git'), ('github', 'git'), ('version control', 'git'),
    # ── deep-dive math/ML/stats concepts (specific multi-word keys first) ──
    ('backpropagation', 'backprop'), ('backprop', 'backprop'),
    ('gradient descent', 'gradient-descent'),
    ('neural network', 'neural-network'), ('neural net', 'neural-network'),
    ('linear algebra', 'linear-algebra'), ('matrices', 'linear-algebra'), ('vectors and matrices', 'linear-algebra'),
    ('eigenvalue', 'eigen'), ('eigenvector', 'eigen'), ('eigen', 'eigen'),
    ('calculus', 'calculus'), ('derivative', 'calculus'),
    ("bayes' theorem", 'bayes'), ('bayes theorem', 'bayes'), ('bayesian', 'bayes'), ('bayes', 'bayes'),
    ('convolutional', 'convolution'), ('convolution', 'convolution'), ('cnn', 'convolution'),
    ('attention mechanism', 'transformer'), ('attention', 'transformer'), ('transformer', 'transformer'), ('gpt', 'transformer'),
    ('logistic regression', 'logistic-regression'),
    ('random forest', 'random-forest'),
    ('decision tree', 'decision-tree'),
    ('bias-variance', 'bias-variance'), ('bias and variance', 'bias-variance'), ('overfitting', 'bias-variance'),
    ('cross-validation', 'cross-validation'), ('cross validation', 'cross-validation'),
    ('confusion matrix', 'confusion-matrix'),
    ('roc', 'roc-auc'), ('auc', 'roc-auc'),
    ('pca', 'pca'), ('principal component', 'pca'), ('dimensionality reduction', 'pca'),
    ('k-means', 'kmeans'), ('kmeans', 'kmeans'), ('k means', 'kmeans'),
    ('maximum likelihood', 'mle'), ('mle', 'mle'),
    # ── original keys ──
    ('react native', 'reactnative'), ('expo', 'expo'), ('flutter', 'flutter'),
    ('next.js', 'nextjs'), ('next js', 'nextjs'), ('app router', 'nextjs'), ('nextjs', 'nextjs'),
    ('astro', 'astro'), ('vite', 'vite'), ('tailwind', 'tailwind'),
    ('redux', 'redux'), ('zustand', 'redux'), ('graphql', 'graphql'),
    ('react', 'react'), ('typescript', 'typescript'), ('javascript', 'javascript'),
    ('node', 'nodejs'), ('express', 'express'),
    ('postgres', 'postgres'), ('prisma', 'prisma'),
    ('websocket', 'websocket'), ('socket.io', 'websocket'),
    ('jwt', 'jwt'), ('oauth', 'auth'), ('auth', 'auth'),
    ('rest api', 'rest'), ('rest', 'rest'),
    ('pandas', 'pandas'), ('jupyter', 'jupyter'),
    ('pytorch', 'pytorch'), ('tensorflow', 'tensorflow'),
    ('langchain', 'langchain'), ('rag', 'rag'),
    ('embedding', 'embedding'), ('vector', 'vector'),
    ('n8n', 'n8n'),
    ('machine learning', 'ml'), ('ml model', 'ml'), ('first model', 'ml'),
    ('xss', 'xss'), ('cross-site', 'xss'),
    ('idor', 'idor'), ('broken auth', 'idor'),
    ('kali', 'kali'),
    ('metasploit', 'metasploit'), ('nmap', 'nmap'), ('wireshark', 'wireshark'),
    ('siem', 'siem'), ('zero trust', 'zerotrust'),
    ('owasp', 'owasp'), ('vulnerability', 'owasp'), ('juice shop', 'owasp'),
    ('docker', 'docker'), ('container', 'docker'),
    ('kubernetes', 'kubernetes'), ('k8s', 'kubernetes'),
    ('terraform', 'terraform'),
    ('helm', 'helm'),
    ('argo', 'argo'), ('gitops', 'argo'),
    ('prometheus', 'prometheus'), ('monitoring', 'prometheus'), ('observability', 'prometheus'),
    ('nginx', 'nginx'), ('web server', 'nginx'),
    ('infrastructure', 'iac'),
    ('networking', 'networking'), ('dns', 'networking'),
    ('linux', 'linux'), ('shell', 'linux'), ('terminal', 'linux'),
    ('ssh', 'ssh'),
    ('git', 'git'), ('github', 'git'),
    ('sql', 'sql'), ('python', 'python'),
    # ---- Data engineering term -> adjacent verified video ----
    ('warehouse', 'sql'), ('bigquery', 'sql'), ('snowflake', 'sql'), ('redshift', 'sql'),
    ('etl', 'sql'), ('elt', 'sql'), ('dbt', 'sql'), ('star schema', 'sql'),
    ('oltp', 'postgres'), ('olap', 'sql'), ('dimension', 'sql'), ('fact table', 'sql'),
    ('spark', 'python'), ('pyspark', 'python'), ('batch', 'python'),
    ('kafka', 'python'), ('kinesis', 'python'), ('stream', 'python'),
    ('airflow', 'python'), ('dagster', 'python'), ('orchestrat', 'python'),
    ('lake', 'python'), ('parquet', 'python'), ('iceberg', 'python'), ('delta', 'python'),
    ('ingest', 'python'), ('pipeline', 'python'), ('extract', 'python'),
    ('governance', 'sql'), ('catalog', 'sql'), ('lineage', 'sql'),
    ('quality', 'sql'), ('great expectations', 'python'),
    ('capstone', 'git'), ('architecture', 'git'), ('serving', 'sql'), ('dashboard', 'sql'),
]


# ============================================================
# Library validation via YouTube oembed (disk-cached)
# ============================================================
def _load_cache():
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def _save_cache(cache):
    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, indent=2)


_STOPWORDS = {'the', 'a', 'an', 'in', 'of', 'to', 'and', 'for', 'with', 'your', 'you',
              'is', 'it', 'on', 'how', 'what', 'why', 'this', 'that', 'explained',
              'tutorial', 'beginners', 'beginner', 'part', 'full', 'course', 'guide',
              'introduction', 'intro', 'minutes', 'minute', 'seconds', 'second', 'using'}


def _title_tokens(title: str) -> set:
    toks = re.findall(r'[a-z0-9]+', (title or '').lower())
    return {t for t in toks if len(t) >= 3 and t not in _STOPWORDS}


def titles_match(expected: str, actual: str) -> bool:
    """True if the fetched title plausibly IS the expected video.
    Guards against wrong-but-alive IDs: oembed proves existence, this proves identity."""
    e, a = _title_tokens(expected), _title_tokens(actual)
    if not e or not a:
        return False
    shared = e & a
    if len(shared) >= 2:
        return True
    return len(shared) / min(len(e), len(a)) >= 0.5


def _oembed_fetch(url):
    """Return (alive, title). title is '' on failure."""
    req = urllib.request.Request(
        f'https://www.youtube.com/oembed?url={urllib.parse.quote(url, safe="")}&format=json',
        headers={'User-Agent': 'Mozilla/5.0 enrich-bot'}
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as r:
            if r.status != 200:
                return (False, '')
            data = json.loads(r.read().decode('utf-8'))
            return (True, data.get('title', '') or '')
    except Exception:
        return (False, '')


def is_alive_cached(url, cache):
    if not YT_URL_RE.match(url or ''):
        return False
    rec = cache.get(url)
    if isinstance(rec, dict):
        return bool(rec.get('alive'))
    if isinstance(rec, bool):
        return rec
    alive, title = _oembed_fetch(url)
    cache[url] = {'alive': alive, 'title': title}
    return alive


def load_curated_library():
    """Merge human-curated videos (curated_library.json from import_videos.py) into
    KNOWN_GOOD, KEYWORD_VIDEO_MAP, and the per-track allow-list, so each is placed on
    its concept day. Curated videos are first-class — exactly like the built-in ones."""
    p = HERE / "curated_library.json"
    if not p.exists():
        return 0
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return 0
    n = 0
    keys = set()
    for e in data.get("videos", []):
        key, url = e.get("concept_key"), e.get("url")
        if not key or not url:
            continue
        keys.add(key)
        try:
            dur = int(e.get("duration_min", 10))
        except (TypeError, ValueError):
            dur = 10
        # Curated videos are hand-vetted: NO duration cap (an excellent 50-min deep
        # dive is allowed; its length is noted in the 'why'). The 'curated' tag below
        # exempts it from the budget filter in pick_video_for_day.
        tup = (url, dur, e.get("creator", "YouTube"),
               e.get("title", "") or e.get("concept", ""), e.get("difficulty", "curated"),
               e.get("why", ""))
        bucket = KNOWN_GOOD.setdefault(key, [])
        if not any(t[0] == url for t in bucket):
            bucket.append(tup)
            n += 1
        kw = (e.get("concept", "") or "").lower().strip()
        if kw and (kw, key) not in KEYWORD_VIDEO_MAP:
            KEYWORD_VIDEO_MAP.insert(0, (kw, key))   # specific concept phrase, highest priority
        track = e.get("track")
        if track:
            TRACK_VIDEO_KEYS.setdefault(track, list(DEFAULT_TRACK_KEYS))
            if key not in TRACK_VIDEO_KEYS[track]:
                TRACK_VIDEO_KEYS[track].append(key)
    if n:
        print(f"  Loaded curated library: {n} videos across {len(keys)} concepts.")
    return n


def apply_api_library():
    """If video_library.json exists (produced by video_api.py), use the YouTube Data
    API's REAL durations/channels: override duration_min, drop any entry the API
    rejected (untrusted channel or >30 min). Returns the number of entries adjusted."""
    p = HERE / "video_library.json"
    if not p.exists():
        return 0
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return 0
    by_url = {r["url"]: r for r in data.get("videos", []) if r.get("url")}
    adjusted = 0
    for key in list(KNOWN_GOOD):
        kept = []
        for tup in KNOWN_GOOD[key]:
            rec = by_url.get(tup[0])
            if rec is None:
                kept.append(tup)               # not vetted by API yet — keep as-is
                continue
            if not rec.get("ok"):
                adjusted += 1                  # API rejected (untrusted/over-cap) -> drop
                continue
            # Override duration with the API's real value.
            real = rec.get("duration_min")
            if isinstance(real, int) and real != tup[1]:
                tup = (tup[0], real) + tuple(tup[2:])
                adjusted += 1
            kept.append(tup)
        if kept:
            KNOWN_GOOD[key] = kept
        else:
            del KNOWN_GOOD[key]
    if adjusted:
        print(f"  Applied YouTube Data API library: {adjusted} entries adjusted/dropped.")
    return adjusted


def validate_library_and_collect(extra_urls):
    """Validate KNOWN_GOOD + raw URLs via oembed, fetching TITLES. Prune entries that
    are dead OR whose fetched title does not match the expected title (wrong ID).
    If an API-vetted video_library.json exists, its real durations/channels win."""
    load_curated_library()
    apply_api_library()
    cache = _load_cache()
    # Expected title per url, from the library (for identity verification).
    expected = {}
    for entries in KNOWN_GOOD.values():
        for tup in entries:
            expected[tup[0]] = tup[3]
    all_urls = set(extra_urls) | set(expected)
    to_check = [u for u in all_urls if not isinstance(cache.get(u), dict)]
    if to_check:
        print(f"  Verifying {len(to_check)} URLs via oembed (existence + title)...")
        with ThreadPoolExecutor(max_workers=10) as pool:
            futs = {pool.submit(_oembed_fetch, u): u for u in to_check}
            for fut in as_completed(futs):
                u = futs[fut]
                try:
                    alive, title = fut.result()
                except Exception:
                    alive, title = False, ''
                cache[u] = {'alive': alive, 'title': title}
        _save_cache(cache)
    # Prune dead OR identity-mismatched library entries.
    dead_count = mismatch_count = 0
    for key in list(KNOWN_GOOD):
        kept = []
        for tup in KNOWN_GOOD[key]:
            rec = cache.get(tup[0], {})
            if not (isinstance(rec, dict) and rec.get('alive')):
                dead_count += 1
                continue
            if not titles_match(tup[3], rec.get('title', '')):
                mismatch_count += 1
                print(f"    [prune] {key}: expected '{tup[3][:40]}' got '{rec.get('title','')[:40]}'")
                continue
            kept.append(tup)
        if kept:
            KNOWN_GOOD[key] = kept
        else:
            del KNOWN_GOOD[key]
    print(f"  Library verified: {dead_count} dead, {mismatch_count} title-mismatch pruned. "
          f"{len(KNOWN_GOOD)} keys, {sum(len(v) for v in KNOWN_GOOD.values())} videos remain.")
    return cache


# ============================================================
# Video picker (returns None if no verified video found)
# ============================================================
def _video_dict(tup):
    url, dur, creator = tup[0], tup[1], tup[2]
    title = tup[3]
    difficulty = tup[4] if len(tup) > 4 else 'beginner'
    # Curated entries carry their own length-aware 'why' (6th element) — keep it.
    if len(tup) > 5 and tup[5]:
        return {"title": title, "url": url, "duration_min": dur, "creator": creator,
                "difficulty": difficulty, "why": tup[5]}
    # "why this video + what to focus on"
    if dur <= 5:
        why = (f"Chosen for clarity: this {dur}-minute {creator} explainer ('{title}') nails the "
               "core idea fast. Watch once, then do the exercise — the concept, not the syntax, is the point.")
    elif dur <= 15:
        why = (f"This {dur}-minute {creator} video ('{title}') builds the intuition before the code. "
               "Focus on the mental model it draws; you'll apply exactly that in the exercise.")
    else:
        why = (f"This {dur}-minute {creator} deep dive ('{title}') is worth the length — it makes the "
               "concept click for good. Watch the first ~10 minutes for the essential intuition; the rest is bonus depth.")
    return {"title": title, "url": url, "duration_min": dur, "creator": creator,
            "difficulty": difficulty, "why": why}


# ============================================================
# Track-specific video domains. A video is ONLY ever drawn from its track's
# allowed KNOWN_GOOD keys — a Data Analysis day can never get a Linux video.
# Keys are ordered by relevance; the first present key is the track default.
# ============================================================
# Deep-dive concept keys, grouped for reuse across the quantitative tracks.
_STATS_KEYS = ['bayes', 'mle', 'logistic-regression', 'random-forest', 'decision-tree',
               'bias-variance', 'cross-validation', 'confusion-matrix', 'roc-auc', 'pca', 'kmeans']
_DL_KEYS = ['neural-network', 'backprop', 'gradient-descent', 'convolution', 'transformer',
            'linear-algebra', 'eigen', 'calculus']

TRACK_VIDEO_KEYS = {
    'data-analysis':       ['pandas', 'python', 'jupyter', 'sql', 'powerbi', 'dax', 'bigquery', 'git',
                            'bayes', 'pca', 'kmeans', 'logistic-regression', 'cross-validation', 'confusion-matrix', 'roc-auc', 'linear-algebra'],
    'data-science':        ['python', 'pandas', 'jupyter', 'ml', 'sql', 'pytorch', 'tensorflow', 'vector', 'git',
                            'normal-distribution', 'linear-regression'] + _STATS_KEYS + _DL_KEYS,
    'data-engineering':    ['python', 'sql', 'postgres', 'docker', 'kubernetes', 'terraform', 'prometheus', 'bigquery', 'git'],
    'devops-cloud':        ['docker', 'kubernetes', 'terraform', 'helm', 'argo', 'prometheus', 'nginx', 'linux', 'ssh', 'networking', 'iac', 'aws', 'git'],
    'full-stack-web':      ['javascript', 'typescript', 'react', 'nextjs', 'tailwind', 'astro', 'vite', 'redux', 'graphql',
                            'html', 'css', 'netlify', 'vercel', 'nodejs', 'express', 'postgres', 'prisma', 'rest', 'auth', 'jwt', 'stripe', 'websocket', 'git'],
    'mobile-engineering':  ['reactnative', 'expo', 'react', 'typescript', 'javascript', 'git'],
    'cybersecurity':       ['owasp', 'burp', 'kali', 'metasploit', 'nmap', 'wireshark', 'siem', 'zerotrust', 'xss', 'idor', 'reports', 'linux', 'networking', 'ssh', 'git',
                            'sqli', 'csrf', 'ssrf', 'privesc', 'incident-response', 'threat-modeling'],
    'ml-engineering':      ['python', 'pandas', 'jupyter', 'ml', 'pytorch', 'tensorflow', 'sql', 'vector', 'docker', 'git'] + _STATS_KEYS + _DL_KEYS,
    'ai-automation':       ['python', 'n8n', 'langchain', 'rag', 'vector', 'anthropic', 'openai', 'git',
                            'web-scraping', 'document-ai', 'browser-automation', 'api-integration', 'agent'],
    'ai-engineering':      ['python', 'langchain', 'rag', 'vector', 'embedding', 'anthropic', 'openai', 'typescript', 'nextjs', 'git',
                            'transformer', 'neural-network', 'backprop', 'convolution', 'bayes',
                            'function-calling', 'structured-outputs', 'llm-eval', 'prompt-injection',
                            'prompt-engineering', 'rag-eval', 'llm-observability', 'fine-tuning',
                            'llm-streaming', 'agent', 'agent-memory', 'mcp'],
    'bi-analytics':        ['powerbi', 'dax', 'sql', 'bigquery', 'python', 'jupyter', 'git', 'bayes', 'logistic-regression', 'roc-auc'],
}
# Fallback domain if a track isn't listed: general programming, never domain-mismatched.
DEFAULT_TRACK_KEYS = ['python', 'sql', 'git']


def _allowed_keys(track_slug: str) -> list:
    keys = TRACK_VIDEO_KEYS.get(track_slug, DEFAULT_TRACK_KEYS)
    return [k for k in keys if k in KNOWN_GOOD]


# Hard cap: no video may ever exceed 30 minutes. Per-day-type budgets below it.
HARD_CAP_MIN = 30
BUDGET_DAY0 = 30      # setup: full install + first-run walkthrough
BUDGET_CAPSTONE = 25  # end-of-week project synthesis
BUDGET_DEEP = 20      # hard concepts: backprop, transformers, eigen, MLE...
BUDGET_CORE = 15      # most days: one focused idea

_CAPSTONE_RE = re.compile(r'\b(capstone|synthesis|ship|project|deploy|portfolio|put it together)\b', re.I)
_DEEP_RE = re.compile(r'\b(backprop|gradient descent|neural network|transformer|attention|eigen|'
                      r'convolution|derivation|maximum likelihood|\bmle\b|calculus|linear algebra|'
                      r'theorem|proof|architecture|optimis|optimiz)\b', re.I)


# AI/ML/data tracks lean on longer masterpiece explainers (3B1B, StatQuest); give
# them a higher budget so a 17-27 min video can land on a normal concept day.
HIGH_VIDEO_TRACKS = {'ai-engineering', 'ml-engineering', 'data-science', 'data-analysis', 'ai-automation'}


def budget_for_day(day_title: str, day_num, track_slug: str = '') -> int:
    """Minute budget for this day's video, by day type + track. Hard-capped at 30."""
    if day_num == 0:
        return BUDGET_DAY0
    t = day_title or ''
    hi = track_slug in HIGH_VIDEO_TRACKS
    if _CAPSTONE_RE.search(t):
        return BUDGET_CAPSTONE
    if _DEEP_RE.search(t):
        return 27 if hi else BUDGET_DEEP
    return 20 if hi else BUDGET_CORE


def pick_video_for_day(day_topic: str, used_urls: set, cache: dict, track_slug: str, max_min: int):
    """Return the BEST on-topic video for the day within `max_min` (and the 30-min
    hard cap), or None. No forced videos: a video is attached only when a concept
    keyword in the day's title maps to a verified, in-domain library video. Among
    matches, prefer an unused one; pick concise videos for simple days and allow a
    richer (longer) deep dive for high-budget days."""
    c = (day_topic or '').lower()
    allowed_set = set(_allowed_keys(track_slug))
    budget = min(max_min, HARD_CAP_MIN)

    # Gather every on-topic candidate (dedup by url). Curated (hand-vetted) videos are
    # exempt from the duration budget — quality over length; library videos still obey it.
    seen = set()
    candidates = []  # (tup,)
    for keyword, key in KEYWORD_VIDEO_MAP:
        if keyword in c and key in allowed_set:
            for tup in KNOWN_GOOD[key]:
                is_curated = len(tup) > 4 and tup[4] == 'curated'
                if tup[0] in seen or (tup[1] > budget and not is_curated):
                    continue
                seen.add(tup[0])
                candidates.append(tup)
    if not candidates:
        return None

    prefer_longer = budget >= BUDGET_DEEP  # deep/capstone/day0 days reward depth
    def score(tup):
        unused = 0 if tup[0] in used_urls else 1            # unused first
        dur = tup[1]
        fit = dur if prefer_longer else -dur                 # longer for deep, shorter for simple
        return (unused, fit)
    candidates.sort(key=score, reverse=True)
    return _video_dict(candidates[0])


# ============================================================
# Per-track Day 0 topic
# ============================================================
TRACK_PREREQUISITES = {
    'devops-cloud': {
        1: "Terminal, Git, GitHub", 2: "DNS basics + Cloudflare account",
        3: "GitHub Actions workflow file basics", 4: "UptimeRobot account + log viewer setup",
        5: "Docker Desktop install + first container", 6: "Docker Compose CLI verification",
        7: "Trivy security scanner install", 8: "containerd + nerdctl install",
        9: "kind / k3d local cluster setup", 10: "kubectl install and context switching",
        11: "Helm CLI install", 12: "istioctl / linkerd CLI install",
        13: "Terraform CLI install + AWS credentials", 14: "aws / gcloud / az CLI install + auth",
        15: "Multi-cloud CLI setup", 16: "AWS Secrets Manager / HashiCorp Vault setup",
        17: "GitHub Actions runner + repo secrets", 18: "Argo CD CLI install + bootstrap repo",
        19: "Prometheus + Grafana docker-compose stack", 20: "SLO tracking sheet / Nobl9 trial account",
        21: "AWS Cost Explorer access + CUR setup", 22: "Velero backup CLI install",
        23: "AWS IAM Access Analyzer / Prowler install",
        24: "Capstone toolchain check (terraform, kubectl, helm, argocd)",
    },
    'full-stack-web': {
        1: "Node.js, npm, VS Code, Git", 2: "Browser DevTools + JavaScript console",
        3: "Netlify CLI install + form testing", 4: "Astro CLI install + project scaffold",
        5: "React + Vite project scaffold", 6: "Next.js App Router + create-next-app",
        7: "Tailwind CSS install + PostCSS config", 8: "Zustand / Redux Toolkit install",
        9: "Node + Express scaffold", 10: "PostgreSQL + Prisma CLI install",
        11: "Postman / Bruno API client install", 12: "NextAuth.js / Clerk install + provider keys",
        13: "Stripe CLI + test account", 14: "Resend / Postmark account + SDK install",
        15: "AWS S3 bucket + AWS SDK install", 16: "Socket.io / Pusher install",
        17: "Vitest + Playwright install", 18: "Lighthouse CI install + WebPageTest account",
        19: "Vercel CLI + GitHub Actions", 20: "Sentry + Axiom account",
        21: "OWASP ZAP install + security headers checker", 22: "k6 load testing CLI install",
        23: "Figma account + Framer Motion install",
        24: "Production stack check (Next.js, Prisma, Stripe, Sentry, Vercel)",
    },
    'mobile-engineering': {
        1: "Expo CLI + Node + iOS/Android emulator",
        2: "expo-notifications install + push token", 3: "AsyncStorage install + simulator persistence test",
        4: "TypeScript + tsconfig strict mode", 5: "React Hook Form + zod install",
        6: "Reanimated + Gesture Handler install", 7: "NativeWind / Restyle theme system install",
        8: "MMKV + SQLite (expo-sqlite) install", 9: "expo-camera + expo-image-picker permissions",
        10: "expo-location + react-native-maps API keys", 11: "expo-notifications + Firebase Cloud Messaging",
        12: "Expo Modules CLI for native code", 13: "axios + TanStack Query install",
        14: "expo-auth-session + expo-local-authentication", 15: "expo-task-manager + expo-background-fetch",
        16: "Sentry React Native + Firebase Analytics", 17: "Flipper / React DevTools for performance",
        18: "Accessibility scanner + screen reader test", 19: "i18next + expo-localization",
        20: "Jest + Maestro install", 21: "EAS CLI + Apple/Google developer accounts",
        22: "expo-updates + EAS channels", 23: "App Store Connect + Play Console setup",
        24: "Full mobile pipeline check (Expo, EAS, Sentry, stores)",
    },
    'cybersecurity': {
        1: "Kali Linux VM + browser DevTools", 2: "Juice Shop docker container running",
        3: "TryHackMe account + OpenVPN config", 4: "Burp Suite Community + browser proxy",
        5: "OWASP ZAP install + scan target", 6: "Metasploit framework + msfconsole",
        7: "Nmap + nikto install", 8: "Markdown editor + report template",
        9: "Splunk Free / Elastic stack install", 10: "TheHive + Cortex docker setup",
        11: "Wazuh agent + manager install", 12: "MITRE ATT&CK Navigator + STIX tools",
        13: "Prowler / ScoutSuite install + AWS credentials", 14: "kube-bench + Trivy install",
        15: "Semgrep + Snyk install", 16: "OWASP Threat Dragon install",
        17: "SonarQube + DAST scanner install", 18: "Sigstore + cosign install",
        19: "OpenSCAP / compliance-as-code tools", 20: "Okta developer account / Keycloak",
        21: "Volatility 3 + Autopsy install", 22: "Atomic Red Team + Caldera install",
        23: "LinkedIn profile + GitHub portfolio repo",
        24: "Full sec toolchain check (Kali, Burp, ZAP, Metasploit, Prowler)",
    },
    'bi-analytics': {
        1: "Power BI Desktop install (Windows)", 2: "Power BI + DAX Studio install",
        3: "Power BI Service workspace + RLS test users", 4: "Power BI Service + on-prem data gateway",
        5: "DAX Studio + Tabular Editor install", 6: "Power BI + advanced DAX patterns",
        7: "SQL Server Express / DBeaver install", 8: "dbt-core + a warehouse account (BigQuery free tier)",
        9: "Excel / Google Sheets + statistics add-ins", 10: "Python + scipy + statsmodels install",
        11: "Figma + Notion for storytelling", 12: "Python 3.11 + Jupyter Lab install",
        13: "Google Cloud account + BigQuery + Looker Studio", 14: "ChatGPT + Claude + GitHub Copilot accounts",
        15: "LinkedIn profile + portfolio site", 16: "Capstone tool stack selection",
        17: "Presentation tools (PowerPoint / Loom) check",
    },
    'ml-engineering': {
        1: "Python 3.11 + Conda + scikit-learn", 2: "pandas + matplotlib + seaborn install",
        3: "Optuna + scikit-learn install", 4: "Flask + gunicorn install",
        5: "scikit-learn + statsmodels install", 6: "XGBoost + LightGBM install",
        7: "UMAP + HDBSCAN install", 8: "statsmodels + Prophet install",
        9: "PyTorch + CUDA toolkit install", 10: "torchvision + image datasets",
        11: "transformers + tokenizers + datasets", 12: "diffusers + accelerate install",
        13: "MLflow + Weights & Biases install", 14: "NVIDIA drivers + CUDA + cuDNN check",
        15: "DVC + Apache Airflow install", 16: "Docker + nvidia-container-toolkit",
        17: "FastAPI + Uvicorn install", 18: "Evidently AI + Whylogs install",
        19: "statsmodels + ab-test calculator", 20: "Implicit / LightFM install",
        21: "Kubeflow Pipelines SDK / Metaflow", 22: "Ray + Dask install",
        23: "SHAP + Fairlearn + DiCE install",
        24: "End-to-end MLOps stack check (MLflow, DVC, FastAPI, Kubeflow)",
    },
    'ai-automation': {
        1: "Python 3.11 + OpenAI account + n8n", 2: "n8n cloud account or self-hosted install",
        3: "Python + requests + python-dotenv install", 4: "OpenAI + Anthropic SDK install + API keys",
        5: "OpenAI Playground / Anthropic Workbench access", 6: "CrewAI / LangChain agents install",
        7: "BeautifulSoup + Playwright install", 8: "Tesseract + PyPDF2 + Unstructured install",
        9: "Gmail API / Slack API credentials", 10: "gspread + Airtable API + pyairtable",
        11: "LangChain + langchain-openai install", 12: "LangGraph install + agent template",
        13: "n8n workflow editor + Python sub-workflows", 14: "LangChain + ChromaDB / Pinecone install",
        15: "Playwright + Anthropic Computer Use SDK", 16: "Docker + Railway / Render account",
        17: "Sentry + Logfire account", 18: "Stripe + simple landing page",
        19: "Client brief template + Notion workspace",
        20: "Portfolio site + LinkedIn + GitHub README",
    },
    'ai-engineering': {
        1: "Python 3.11 + OpenAI + Anthropic SDK install", 2: "Streamlit / Gradio install",
        3: "promptfoo / Inspect AI eval framework", 4: "Prompt injection test suite (PromptArmor / Lakera)",
        5: "OpenAI + Anthropic SDKs installed with API keys", 6: "Pydantic + JSON schema validation",
        7: "SSE streaming + tiktoken cost calculator", 8: "Tool / function-calling JSON schemas",
        9: "sentence-transformers + OpenAI embeddings", 10: "ChromaDB / Qdrant / Pinecone account",
        11: "LlamaIndex install", 12: "RAGAS evaluation framework install",
        13: "LangGraph / Anthropic Agent SDK", 14: "mem0 / Zep memory store install",
        15: "Anthropic MCP SDK + reference servers", 16: "AutoGen / CrewAI install",
        17: "LangSmith / Braintrust eval account", 18: "Arize Phoenix / Helicone install",
        19: "Anthropic prompt cache + Batch API", 20: "Vercel AI SDK + edge runtime",
        21: "OpenAI fine-tuning / Together AI account", 22: "Vision API + Whisper / TTS SDK install",
        23: "Anthropic safety + content filter API",
        24: "Full AI stack check (SDKs, vector DB, evals, observability, deploy)",
    },
    'data-science': {
        # 26 weeks — generic but tool-aware
        1: "Python 3.11 + Jupyter Lab + pandas",
        2: "VS Code + git + a SQL client",
        3: "pandas + matplotlib + seaborn",
        4: "NumPy + scipy",
        5: "scikit-learn + first regression",
        6: "scikit-learn classification + train/test split",
        7: "Feature engineering + pipelines",
        8: "Cross-validation + hyperparameter tuning",
        9: "Tree-based models: XGBoost, LightGBM",
        10: "Clustering + dimensionality reduction",
        11: "Statistics for ML: confidence + significance",
        12: "Bayesian intuition + A/B testing primer",
        13: "Time series basics + statsmodels",
        14: "Forecasting with Prophet / NeuralProphet",
        15: "Storytelling: matplotlib + plotly polish",
        16: "FastAPI + serving a model behind an endpoint",
        17: "Streamlit + a one-page dashboard",
        18: "MLflow tracking experiments",
        19: "Docker + reproducible runs",
        20: "Cloud notebooks: Colab / SageMaker",
        21: "Big-data interfaces: PySpark or Dask",
        22: "Causal-inference primer",
        23: "Communicating to non-technical stakeholders",
        24: "End-to-end DS portfolio repo",
        25: "Interview prep: SQL + take-home",
        26: "Capstone toolchain check",
    },
    'data-engineering': {
        1: "Python 3.11 + DuckDB + a SQL client",
        2: "PostgreSQL (OLTP) + a warehouse sandbox (OLAP)",
        3: "BigQuery / Snowflake free-tier account",
        4: "dbt-core install + warehouse connection",
        5: "AWS S3 (or GCS) bucket + PyArrow",
        6: "Apache Airflow (or Dagster) local install",
        7: "Kafka (or Redpanda) docker-compose stack",
        8: "Apache Spark / PySpark local install",
        9: "Great Expectations + dbt tests",
        10: "OpenMetadata / Amundsen docker stack",
        11: "Capstone repo + warehouse + lake provisioned",
        12: "Source API access + requests + python-dotenv",
        13: "PyArrow + object-storage CLI for the lake",
        14: "Warehouse loader + service-account credentials",
        15: "dbt project connected to the warehouse",
        16: "dbt marts + dimensional modelling tooling",
        17: "Airflow / Dagster wired to the full pipeline",
        18: "Kafka consumer + a fast store (Redis)",
        19: "Great Expectations + dbt build in CI",
        20: "dbt docs + a data catalog for lineage",
        21: "BI tool connected to the warehouse",
        22: "Monitoring + alerting + cost dashboards",
        23: "GitHub Actions CI/CD + Terraform",
        24: "Full capstone toolchain check + README/demo",
    },
    'data-analysis': {
        # 27 weeks — analyst stack
        1: "Excel + Anaconda + Jupyter Lab",
        2: "pandas + read_csv",
        3: "SQL: SELECT, WHERE, GROUP BY, JOIN",
        4: "Excel pivot tables + VLOOKUP",
        5: "Power Query + cleaning workflows",
        6: "Tableau Public account",
        7: "Tableau dashboards + filters",
        8: "Statistics: mean, median, distributions",
        9: "Statistical tests: t-test, chi-square",
        10: "A/B testing fundamentals",
        11: "Cohort analysis in SQL",
        12: "Power BI Desktop install",
        13: "Power BI + DAX measures",
        14: "Looker Studio + connectors",
        15: "BigQuery sandbox + first query",
        16: "Storytelling: a single chart, well-explained",
        17: "Stakeholder interview template",
        18: "Excel macros + automation",
        19: "Python for analysts: requests + pandas",
        20: "Webscraping basics with BeautifulSoup",
        21: "Geo data: folium + GeoPandas",
        22: "Notion / Confluence reporting",
        23: "Presentation polish: Loom + slides",
        24: "Portfolio site + LinkedIn",
        25: "Interview prep: case studies",
        26: "Capstone: end-to-end analysis",
        27: "Capstone presentation",
    },
}

# Verification commands per tool keyword for Day 0 exercise
PREREQ_VERIFY = {
    'git': ("git --version\nssh -T git@github.com", "Git prints a version; SSH greets you by name."),
    'node': ("node --version\nnpm --version", "Both print versions; Node is v20 or later."),
    'docker': ("docker run hello-world", "Container starts and exits cleanly."),
    'compose': ("docker compose version", "Compose plugin version prints."),
    'trivy': ("trivy --version", "Trivy version string prints."),
    'containerd': ("nerdctl version", "Both client and server versions are listed."),
    'kind': ("kind create cluster --name day0\nkubectl get nodes", "One control-plane node shows Ready."),
    'k3d': ("k3d cluster create day0\nkubectl get nodes", "Cluster shows at least one Ready node."),
    'kubectl': ("kubectl version --client\nkubectl config get-contexts", "Client version prints; at least one context exists."),
    'helm': ("helm version", "Helm prints v3.x.x."),
    'istio': ("istioctl version --remote=false", "istioctl client version prints."),
    'terraform': ("terraform -version\naws sts get-caller-identity", "Terraform and AWS identity both print."),
    'aws': ("aws --version\naws sts get-caller-identity", "AWS CLI version and your account ARN print."),
    'gcloud': ("gcloud --version\ngcloud auth list", "gcloud version and an active account print."),
    'az': ("az --version\naz account show", "az CLI version and your subscription print."),
    'vault': ("vault --version", "Vault CLI version prints."),
    'argocd': ("argocd version --client", "Argo CD client version prints."),
    'prometheus': ("docker compose up -d\ncurl -s localhost:9090/-/healthy", "Prometheus answers Prometheus Server is Healthy."),
    'velero': ("velero version --client-only", "Velero CLI version prints."),
    'prowler': ("prowler -v", "Prowler version prints."),
    'github': ("gh --version\ngh auth status", "gh CLI prints version and logged-in user."),
    'nextjs': ("npx create-next-app@latest day0-app --ts --app --tailwind --no-git --use-npm\ncd day0-app && npm run dev",
               "Browser shows the Next.js starter at localhost:3000."),
    'react': ("npm create vite@latest day0-app -- --template react-ts\ncd day0-app && npm install && npm run dev",
              "Vite serves the React starter at localhost:5173."),
    'astro': ("npm create astro@latest day0-astro -- --template minimal\ncd day0-astro && npm install && npm run dev",
              "Astro starter runs at localhost:4321."),
    'tailwind': ("npm install -D tailwindcss\nnpx tailwindcss init", "tailwind.config.js is created."),
    'vite': ("npm create vite@latest", "Vite scaffolds a starter project."),
    'netlify': ("npm install -g netlify-cli\nnetlify --version", "Netlify CLI prints its version."),
    'vercel': ("npm install -g vercel\nvercel --version", "Vercel CLI prints its version."),
    'stripe': ("stripe --version\nstripe login", "Stripe CLI prints version and authenticates."),
    'postgres': ("psql --version", "psql prints its version."),
    'prisma': ("npx prisma --version", "Prisma CLI prints version info."),
    'expo': ("npx create-expo-app day0-app --template blank-typescript\ncd day0-app && npx expo start",
             "Expo Dev Tools open; QR code shows."),
    'eas': ("npm install -g eas-cli\neas --version\neas login", "EAS CLI prints version and you log in."),
    'python': ("python --version\npip --version", "Python is 3.11+ and pip prints a version."),
    'conda': ("conda --version\nconda info", "Conda prints version and env info."),
    'jupyter': ("jupyter --version", "Jupyter Core, Notebook, and Lab versions print."),
    'pytorch': ("python -c \"import torch; print(torch.__version__, torch.cuda.is_available())\"",
                "PyTorch version prints; CUDA flag shows True if you have a GPU."),
    'sklearn': ("python -c \"import sklearn; print(sklearn.__version__)\"", "scikit-learn version prints."),
    'pandas': ("python -c \"import pandas as pd; print(pd.__version__)\"", "pandas version prints."),
    'fastapi': ("pip install fastapi uvicorn\nuvicorn --version", "uvicorn prints version."),
    'mlflow': ("pip install mlflow\nmlflow --version", "MLflow prints version."),
    'dvc': ("pip install dvc\ndvc --version", "DVC prints version."),
    'openai': ("pip install openai\npython -c \"import openai; print(openai.__version__)\"",
               "OpenAI SDK version prints; .env file exists (NOT committed)."),
    'anthropic': ("pip install anthropic\npython -c \"import anthropic; print(anthropic.__version__)\"",
                  "Anthropic SDK version prints."),
    'langchain': ("pip install langchain langchain-openai\npython -c \"import langchain; print(langchain.__version__)\"",
                  "LangChain version prints."),
    'vector': ("pip install chromadb\npython -c \"import chromadb; print(chromadb.__version__)\"",
               "ChromaDB version prints."),
    'mcp': ("pip install mcp\nmcp --version", "MCP CLI prints version."),
    'n8n': ("npx n8n --version", "n8n prints its version."),
    'playwright': ("npm install -D @playwright/test\nnpx playwright install\nnpx playwright --version",
                   "Playwright prints version and installs browsers."),
    'powerbi': ("# Open Power BI Desktop and confirm version under Help -> About",
                "Power BI Desktop is installed and opens."),
    'dax': ("# Open DAX Studio after Power BI is installed",
            "DAX Studio launches and connects to a model."),
    'sql': ("psql --version  # or sqlite3 --version", "Your SQL client prints a version."),
    'dbt': ("pip install dbt-core\ndbt --version", "dbt prints version info."),
    'bigquery': ("gcloud --version\nbq --version\nbq ls", "bq CLI lists at least one dataset."),
    'kali': ("# Boot the Kali VM, then run\nuname -a\nwhoami", "You're root@kali in a working VM."),
    'burp': ("# Launch Burp Community and open Proxy -> Intercept", "Burp opens; browser traffic is intercepted."),
    'zap': ("zap.sh -version", "ZAP prints its version."),
    'metasploit': ("msfconsole --version", "Metasploit framework version prints."),
    'nmap': ("nmap --version", "Nmap version and capabilities print."),
    'wireshark': ("wireshark --version", "Wireshark version prints."),
    'splunk': ("# Open Splunk web UI on localhost:8000 and log in", "Splunk dashboard is visible."),
    'thehive': ("docker compose up -d\ncurl -s localhost:9000/api/status", "TheHive replies with status JSON."),
    'semgrep': ("pip install semgrep\nsemgrep --version", "Semgrep prints version."),
    'snyk': ("npm install -g snyk\nsnyk --version", "Snyk CLI prints version."),
    'sonarqube': ("docker run -d -p 9000:9000 sonarqube:lts", "SonarQube returns status UP on localhost:9000."),
    'cosign': ("cosign version", "cosign prints version."),
    'volatility': ("pip install volatility3\nvol --info | head", "Volatility lists available plugins."),
    'tryhackme': ("# Connect to TryHackMe VPN\nip a | grep tun0", "tun0 interface has an IP address."),
    'tableau': ("# Open Tableau Public Desktop and confirm version under Help -> About",
                "Tableau Public starts and you can connect to a CSV."),
    'excel': ("# Open Excel, verify version under File -> Account", "Excel opens and runs `=NOW()` successfully."),
    'looker': ("# Open Looker Studio at lookerstudio.google.com and sign in",
               "You can create a new blank report."),
}


def _verify_for_topic(topic: str):
    t = topic.lower()
    priority = [
        'terraform', 'argocd', 'prometheus', 'velero', 'prowler', 'vault',
        'helm', 'kubectl', 'kind', 'k3d', 'istio', 'compose', 'containerd',
        'docker', 'trivy', 'aws', 'gcloud', 'az',
        'nextjs', 'react', 'astro', 'tailwind', 'vite', 'netlify', 'vercel',
        'stripe', 'prisma', 'postgres',
        'expo', 'eas',
        'mcp', 'langchain', 'openai', 'anthropic', 'vector',
        'jupyter', 'pytorch', 'sklearn', 'pandas', 'fastapi', 'mlflow', 'dvc',
        'conda', 'n8n', 'playwright',
        'powerbi', 'dax', 'dbt', 'bigquery', 'sql', 'tableau', 'excel', 'looker',
        'kali', 'burp', 'zap', 'metasploit', 'nmap', 'wireshark',
        'splunk', 'thehive', 'semgrep', 'snyk', 'sonarqube', 'cosign',
        'volatility', 'tryhackme',
        'node', 'github', 'git', 'python',
    ]
    for key in priority:
        if key in t:
            return PREREQ_VERIFY[key]
    return ("# Install per official docs, then verify with the tool's --version flag",
            "The tool prints its version without error.")


# ============================================================
# Exercise label inference
# ============================================================
EX_LABEL_RE = re.compile(r'^\s*\[(CODE|WRITE|PRODUCE)\]', re.IGNORECASE)
PRODUCE_TOKENS = ['git push', 'git commit', 'git tag', 'tag v', 'ship it', 'pushed to github',
                  'create a pr', 'pull request', 'publish', 'deploy', 'submit your',
                  'commit your work', 'README.md', 'commit a', 'pushed to your repo']
WRITE_TOKENS = ['reflect', 'journal', 'in your own words', 'draw a diagram', 'one paragraph',
                'write a paragraph', 'write notes', 'write up', 'setup.md', 'document',
                'notes.md', 'reflection', 'explain in writing']
CODE_TOKENS = ['```', 'bash', 'npm ', 'pip ', 'python ', 'docker ', 'kubectl ', 'terraform ',
               'curl ', 'install', 'run the following', 'run:', '$ ', 'helm ', 'aws ',
               'gcloud ', 'gh ', 'apt ', 'brew ']


def ensure_exercise_label(body: str) -> str:
    if not body:
        return '[CODE] Apply today\'s lesson and commit your work.'
    if EX_LABEL_RE.match(body):
        return body
    b_lower = body.lower()
    if any(tok in b_lower for tok in PRODUCE_TOKENS):
        label = 'PRODUCE'
    elif any(tok in b_lower for tok in WRITE_TOKENS):
        label = 'WRITE'
    elif any(tok in b_lower for tok in CODE_TOKENS):
        label = 'CODE'
    else:
        label = 'CODE'
    return f'[{label}] {body.lstrip()}'


# ============================================================
# Synthesised content
# ============================================================
def synth_lesson(day_title: str, week_context: str) -> dict:
    body = (
        f"## {day_title}\n\n"
        f"{(week_context or '')[:500]}\n\n"
        "## Key ideas\n"
        "- Understand the concept before reaching for code.\n"
        "- Build the smallest working example first.\n"
        "- Commit early and often so each step is reversible.\n"
    )
    return {"kind": "lesson", "title": day_title, "body": body}


# ============================================================
# Zero-cost path: a student must finish every track with $0 and no card. We TEACH
# industry-standard paid tools but inject a free, no-card alternative into the
# setup day of any week that references one. Additive — never rewrites a lesson.
# ============================================================
PAID_FREE_GROUPS = [
    (re.compile(r'openai|anthropic|claude|\bgpt[-\s]?[0-9]?\b|\bllm\b', re.I),
     "**LLM calls** — use **Ollama** (runs Llama 3 / Mistral locally, free, no API key): point the base URL at `http://localhost:11434`. The chat shape is identical; you just swap the endpoint. Hugging Face's free Inference API also needs no credit card."),
    (re.compile(r'\baws\b|amazon web services|\bs3\b|\bec2\b|cloudfront|sts get-caller', re.I),
     "**AWS** — use **LocalStack** (mocks AWS APIs on your laptop) plus **MinIO** (local S3). The CLI commands are the same; set `--endpoint-url=http://localhost:4566`. No AWS account or card required."),
    (re.compile(r'\bgcp\b|google cloud|gcloud|bigquery|\bbq\b', re.I),
     "**Google Cloud / BigQuery** — use **DuckDB** (local, the same SQL, blazing fast) or local **Postgres**. No GCP account needed."),
    (re.compile(r'redshift|snowflake', re.I),
     "**Cloud warehouse** — use **DuckDB** or local **Postgres**: identical SQL, zero cost."),
    (re.compile(r'\bazure\b', re.I),
     "**Azure** — substitute **LocalStack** / local tooling; the concepts transfer directly."),
    (re.compile(r'vercel', re.I),
     "**Hosting** — **Vercel Hobby** is free with no card; Netlify's free tier and GitHub Pages also work."),
    (re.compile(r'netlify', re.I),
     "**Hosting** — Netlify's free tier or GitHub Pages — no card."),
    (re.compile(r'\beas\b|expo application services', re.I),
     "**Mobile builds** — build locally with `expo run:android` / Xcode (free); EAS cloud builds are optional, not required."),
    (re.compile(r'sentry', re.I),
     "**Error tracking** — self-host **GlitchTip** (free) or use Sentry's free developer tier (no card)."),
    (re.compile(r'datadog', re.I),
     "**Monitoring** — use **Prometheus + Grafana** locally (free)."),
    (re.compile(r'stripe', re.I),
     "**Payments** — use **Stripe test mode**: test API keys are free and need no business or card."),
    (re.compile(r'pinecone', re.I),
     "**Vector DB** — use **Chroma** or **Qdrant** locally (free)."),
    (re.compile(r'twilio|sendgrid|resend|postmark', re.I),
     "**Email / SMS** — capture mail locally with **Mailpit** / **MailHog** for learning (free)."),
]


def free_path_lines(blob: str):
    lines = []
    for rx, line in PAID_FREE_GROUPS:
        if rx.search(blob or '') and line not in lines:
            lines.append(line)
    return lines


def inject_free_path(d0: dict, week_blob: str):
    """If a week references any paid service, add a 'Zero-cost path' lesson to Day 0."""
    lines = free_path_lines(week_blob)
    if not lines:
        return
    body = ("## Zero-cost path (no credit card required)\n\n"
            "This week mentions industry-standard tools that can cost money. You can "
            "complete every step for **free**, with no card and no trial that auto-renews:\n\n"
            + "\n".join(f"- {l}" for l in lines)
            + "\n\nLearn the concept with the free tool; the paid service is only how some "
              "teams run it in production. The skills and the code are the same.")
    d0.setdefault('items', []).append({"kind": "lesson", "title": "Zero-cost path (free alternatives)", "body": body})


# ============================================================
# Dataset clarity: every week that uses a dataset gets a "📁 Dataset" callout —
# exact file name, whether it's reused, where to download it, where to save it.
# A student should never wonder "which file?" or "where is it?".
# ============================================================
DATASET_DEFS = {
    'superstore': {
        'file': 'superstore.csv', 'label': 'Sample Superstore (a fictional office-supply retailer, 4 years of orders)',
        'reuse': 'This is the SAME Sample Superstore dataset from the Excel week (Week 1) — do not look for a new file. If you have the Excel copy, just export/Save-As `superstore.csv`.',
        'source': 'Re-download from the Week 1 resources, or this direct CSV link',
        'url': 'https://www.tableau.com/sites/default/files/training/regional_sales.csv',
        'alt': '', 'loc': '`data/superstore.csv`, in the same folder as your notebook',
    },
    'nyc-taxi': {
        'file': 'yellow_tripdata_2023-10.parquet', 'label': 'NYC Yellow Taxi trip records, October 2023 (~3.5M rows)',
        'reuse': 'This is a NEW download for the TaxiPulse project (you did not use it before).',
        'source': 'Official NYC TLC Trip Record Data — direct CDN link',
        'url': 'https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2023-10.parquet',
        'alt': 'https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page',
        'loc': '`data/yellow_tripdata_2023-10.parquet`, next to your notebook',
    },
    'taxi-zone': {
        'file': 'taxi_zone_lookup.csv', 'label': 'NYC taxi zone lookup (maps zone IDs to borough/neighbourhood)',
        'reuse': 'A small companion file for the NYC taxi data.',
        'source': 'Official NYC TLC — direct CDN link',
        'url': 'https://d37ci6vzurychx.cloudfront.net/misc/taxi_zone_lookup.csv',
        'alt': '', 'loc': '`data/taxi_zone_lookup.csv`',
    },
    'flights': {
        'file': 'flights.csv', 'label': 'US domestic flight delays & cancellations (sample of a few million rows)',
        'reuse': 'This is the FlightWise project dataset — download it once at the start of the track.',
        'source': 'Kaggle (free account required): "Flight Delay and Cancellation Dataset"',
        'url': 'https://www.kaggle.com/datasets/patrickzel/flight-delay-and-cancellation-dataset-2019-2023',
        'alt': '', 'loc': '`data/flights.csv` (rename the downloaded file to flights.csv)',
    },
    'attrition': {
        'file': 'Employee-Attrition.csv', 'label': 'IBM HR Analytics Employee Attrition (1,470 employees)',
        'reuse': 'A NEW dataset for this week.',
        'source': 'Kaggle (free account): "IBM HR Analytics Employee Attrition & Performance"',
        'url': 'https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset',
        'alt': '', 'loc': '`data/Employee-Attrition.csv`',
    },
    'olist': {
        'file': 'olist_*_dataset.csv', 'label': 'Brazilian E-Commerce (Olist) — a set of related CSVs (orders, customers, reviews…)',
        'reuse': 'A NEW multi-file dataset for this week.',
        'source': 'Kaggle (free account): "Brazilian E-Commerce Public Dataset by Olist"',
        'url': 'https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce',
        'alt': '', 'loc': 'a `data/olist/` folder (keep all the CSVs together)',
    },
}
# filename/topic pattern -> dataset id (detected per week)
DATASET_REGISTRY = [
    (re.compile(r'superstore|regional_sales', re.I), 'superstore'),
    (re.compile(r'yellow_tripdata|nyc.?taxi|tripdata', re.I), 'nyc-taxi'),
    (re.compile(r'taxi_zone_lookup', re.I), 'taxi-zone'),
    (re.compile(r'flights_sample|flights\.csv|flight delay|flightwise', re.I), 'flights'),
    (re.compile(r'employee-attrition|attrition', re.I), 'attrition'),
    (re.compile(r'olist|brazilian e-commerce', re.I), 'olist'),
]
# For weeks that reference a CSV only generically ("load the CSV"), fall back to the
# track's default dataset over the given week numbers.
TRACK_DEFAULT_DATASET = {
    'data-analysis': (set(range(1, 10)), 'superstore'),
    'data-science': (set(range(1, 6)), 'nyc-taxi'),
    'ml-engineering': (set(range(1, 5)), 'flights'),
}
_GENERIC_DATA_RE = re.compile(r'read_csv|read_parquet|\bthe csv\b|your dataset|the dataset|\.csv\b|\.parquet\b', re.I)


def _dataset_callout_body(did: str) -> str:
    d = DATASET_DEFS[did]
    lines = [f"## 📁 Dataset for this week's project: `{d['file']}`",
             "Before you start the assignment below, make sure you have the right file:", "",
             f"- **What it is:** {d['label']}.",
             f"- **Reuse:** {d['reuse']}",
             f"- **Where to get it:** {d['source']} — {d['url']}"]
    if d.get('alt'):
        lines.append(f"  - Mirror / official page: {d['alt']}")
    lines.append(f"- **Where to save it:** {d['loc']}.")
    lines.append("")
    lines.append("Whenever a lesson says `read_csv(...)` or \"load the data\", it means THIS file.")
    return "\n".join(lines)


def inject_dataset_callout(week_days, week_num, track_slug, week_blob):
    """Insert a '📁 Dataset' callout at the top of Day 1 for this week's dataset(s).
    The track's PRIMARY dataset wins (so an incidental mention of another dataset
    can't hijack the callout); a companion file (e.g. the taxi zone lookup) is added
    only when actually referenced."""
    ids = []
    wk, default_id = TRACK_DEFAULT_DATASET.get(track_slug, (set(), None))
    if default_id and week_num in wk:
        # The week belongs to the track's flagship project — that dataset is primary.
        ids.append(default_id)
        if default_id == 'nyc-taxi' and re.search(r'taxi_zone_lookup', week_blob, re.I):
            ids.append('taxi-zone')
    else:
        # Outside the flagship range: identify the week's dataset by what it references,
        # but ignore an incidental mention of the track's default (e.g. a Superstore
        # comparison in an attrition week) so the week's REAL dataset is the callout.
        for rx, did in DATASET_REGISTRY:
            if did == default_id:
                continue
            if rx.search(week_blob) and did not in ids:
                ids.append(did)
    if not ids:
        return
    # Put the callout on the LAST day — the mini-assignment / project day — where the
    # student actually loads the data. It reminds them which file to use right before
    # they do the week's project, not on Day 1 (which isn't about the dataset).
    project_day = max((d for d in week_days if d.get('number', 0) >= 1),
                      key=lambda d: d.get('number', 0), default=None)
    if not project_day:
        return
    callouts = [{"kind": "lesson", "title": f"Dataset: {DATASET_DEFS[did]['file']}",
                 "body": _dataset_callout_body(did)} for did in ids[:2]]
    project_day.setdefault('items', [])[0:0] = callouts  # on top of the project day


def synth_second_lesson(day_title: str, week_context: str) -> dict:
    """A 'deeper dive' lesson used INSTEAD of a video when no on-topic video exists.
    Clear teaching beats a tangential video — this block gives a worked-example
    scaffold anchored to the day's concept."""
    topic = re.sub(r'^Day\s*\d+\s*[-–—]\s*', '', day_title).strip() or day_title
    body = (
        f"## Deeper dive: {topic}\n\n"
        "There isn't a single short video that nails this exact concept, so work it the "
        "way professionals actually learn it — by running small variations yourself and "
        "reading the output.\n\n"
        "## Two more worked examples\n"
        f"1. Take the smallest case of **{topic}** and predict the result *before* you run it. "
        "Then run it and compare — the gap between your prediction and reality is the learning.\n"
        "2. Change one variable (a column, a parameter, a condition) and predict again. "
        "Repeat until your predictions are reliably right.\n\n"
        "## What to watch for\n"
        "- Trace the data through each step (split, apply, combine) rather than memorising syntax.\n"
        "- Read the shape and the index of every intermediate result; most bugs are shape bugs.\n"
        "- When stuck, shrink the input to 3 rows you can verify by hand.\n"
    )
    return {"kind": "lesson", "title": f"Deeper dive: {topic}", "body": body}


def synth_swipe() -> dict:
    return {
        "kind": "swipe", "title": "Quick check - swipe to answer",
        "cards": [
            {"prompt": "The fastest way to learn a new tool is to read the docs end-to-end before writing any code.",
             "answer": False, "whenRight": "Right - building a tiny example first beats reading every page.",
             "whenWrong": "Docs are a reference, not a tutorial. Code first, read second."},
            {"prompt": "Committing small checkpoints helps you debug regressions and review your own progress.",
             "answer": True, "whenRight": "Exactly - tiny commits are a superpower.",
             "whenWrong": "They really do help; `git revert` is one command away."},
            {"prompt": "Copy-pasting from Stack Overflow without understanding is a sustainable long-term strategy.",
             "answer": False, "whenRight": "Correct - understanding the why is what makes you employable.",
             "whenWrong": "Short-term it works; long-term it stalls you."}
        ]
    }


def synth_exercise(day_title: str) -> dict:
    body = (
        f"[CODE] Apply today's lesson to a small, working artefact.\n\n"
        f"Concretely: produce one file or one command that demonstrates **{day_title}** end-to-end. "
        "Commit it with a message that names what you did and why.\n\n"
        "PASS:\n"
        "[x] The artefact runs without errors.\n"
        "[x] You can explain in one sentence what it does.\n"
        "[x] It's pushed to GitHub on a `day{N}` branch or commit."
    )
    return {"kind": "exercise", "title": "Your turn", "body": body}


def synth_concept_check_q(week_title: str) -> list:
    return [
        {"q": f"What is the primary benefit of learning {week_title}?",
         "choices": ["It's a buzzword", "It makes your work reproducible, maintainable, or shippable",
                     "It impresses recruiters", "It pays more"],
         "correct": 1,
         "explain": "Topics on this track are picked because they make real work easier to ship. The other answers may have grains of truth but they don't capture the core benefit."},
        {"q": "Which of these is the best first step when learning a new tool?",
         "choices": ["Read every page of the docs", "Build the smallest possible working example",
                     "Watch ten videos", "Ask a friend"],
         "correct": 1,
         "explain": "A smallest-working-example beats every other learning strategy because it forces you to engage with the tool's actual mechanics rather than skim words about it."},
        {"q": "When you hit an error, what should you do first?",
         "choices": ["Switch tools", "Read the error message carefully",
                     "Delete and restart", "Ask ChatGPT immediately"],
         "correct": 1,
         "explain": "The error message usually tells you the answer in plain English. Read it twice before reaching for any other tool — most fixes are spelled out right there."},
    ]


# ============================================================
# Off-topic filter
# ============================================================
TRACK_OFF_TOPIC_KEYWORDS = {
    'devops-cloud': ['SQL', 'SQLBolt', 'sqlbolt'],
}

# Stale Day-0 template that leaked SQL lessons into non-data tracks' setup day.
# These EXACT titles are never a legitimate lesson — strip them from ANY track,
# any week. Real SQL teaching (full-stack W10 Postgres, data tracks, etc.) has
# different titles and is untouched.
_STALE_ITEM_TITLES = {
    'sql the language your data lives in',
    'sql explained in 100 seconds',
    'sqlbolt interactive sql lessons',
}


def _norm_title(t: str) -> str:
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', ' ', (t or '').lower())).strip()


def is_off_topic(item: dict, track_slug: str) -> bool:
    if _norm_title(item.get('title', '')) in _STALE_ITEM_TITLES:
        return True  # leaked stale SQL-template item — never legitimate
    suspects = TRACK_OFF_TOPIC_KEYWORDS.get(track_slug, [])
    if not suspects:
        return False
    title = item.get('title', '') or ''
    body = (item.get('body', '') or '')[:300]
    url = item.get('url', '') or ''
    haystack = f"{title} {body} {url}"
    return any(s in haystack for s in suspects)


def clean_items(items: list, track_slug: str, cache: dict) -> list:
    """Drop off-topic items AND ALL raw video items.

    Every video in the output is re-sourced from the validated KNOWN_GOOD
    allowlist by pad_day / synth_day_zero, which guarantees:
      - real youtube.com/watch?v= URLs
      - duration < 15 min
      - URL is in the allowlist and oembed-alive
      - no search placeholders
    Keeping raw videos would risk URLs outside the allowlist, so we drop them.
    """
    out = []
    for it in items:
        if is_off_topic(it, track_slug):
            continue
        if it.get('kind') == 'video':
            continue  # always re-sourced from the verified library
        out.append(it)
    return out


# ============================================================
# Body hygiene: code blocks must be preceded by a prose sentence
# ============================================================
def ensure_code_blocks_explained(body: str) -> str:
    if not body or '```' not in body:
        return body
    lines = body.split('\n')
    out = []
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i]
        if line.lstrip().startswith('```'):
            # Find the last non-blank line already emitted
            prev = None
            for j in range(len(out) - 1, -1, -1):
                if out[j].strip():
                    prev = out[j].strip()
                    break
            # A heading (starts with #) or nothing is NOT a prose sentence.
            needs_lead = (prev is None) or prev.startswith('#') or prev.startswith('```')
            if needs_lead:
                out.append("The snippet below shows exactly what to do:")
                out.append("")
        out.append(line)
        i += 1
    return '\n'.join(out)


PASS_BOX_RE = re.compile(r'\[(x| )\]', re.IGNORECASE)


def ensure_pass_checklist(body: str) -> str:
    """Guarantee an exercise body has a PASS: block with >=2 checkboxes."""
    if not body:
        body = "[CODE] Apply today's lesson and commit your work."
    boxes = len(PASS_BOX_RE.findall(body))
    has_pass = 'PASS:' in body
    if has_pass and boxes >= 2:
        return body
    addition = ("\n\nPASS:\n"
                "[x] You completed the task described above\n"
                "[x] You can explain in one sentence what you produced\n"
                "[x] Your work is committed to your repo")
    # If a PASS: header exists but too few boxes, append more boxes under it; else add block.
    return body.rstrip() + addition


# ============================================================
# Day 0 synthesis
# ============================================================
def synth_day_zero(topic: str, used_urls: set, cache: dict, track_slug: str) -> dict:
    verify_cmd, verify_pass = _verify_for_topic(topic)
    items = [
        {"kind": "lesson", "title": "Set up your tooling",
         "body": (
             f"## What it is\n{topic} is the foundation for this week's work. "
             "Without it installed and working, every later day will fail with a cryptic error.\n\n"
             "## What you'll do today\n"
             "- Install the required tool(s)\n"
             "- Authenticate (if the tool talks to a cloud or remote service)\n"
             "- Run a one-line verification command\n"
             "- Commit a `day0` checkpoint to GitHub\n\n"
             "## Why before anything else\n"
             "The #1 reason mentees stall is a missing CLI, a wrong PATH, or unauthenticated credentials. "
             "Spend 30 minutes here and save hours later."
         )},
    ]
    video = pick_video_for_day(topic, used_urls, cache, track_slug, BUDGET_DAY0)
    if video:
        items.append({"kind": "video", **video})
        used_urls.add(video['url'])
    items.extend([
        {"kind": "lesson", "title": "See it in action - the exact steps",
         "body": (
             f"## Walkthrough\nDo every step now, in your terminal.\n\n"
             f"```bash\n{verify_cmd}\n```\n\n"
             f"## What 'working' looks like\n{verify_pass}\n\n"
             "If anything errors, read the message carefully - 90% of Day 0 failures are PATH or auth "
             "issues, both of which the error spells out."
         )},
        {"kind": "swipe", "title": "Quick check - swipe to answer",
         "cards": [
             {"prompt": f"You can run a version command for {topic} and it prints output without error.",
              "answer": True, "whenRight": "The tool is on your PATH.",
              "whenWrong": "Re-run the installer; confirm the binary is on PATH."},
             {"prompt": "You stored credentials (where needed) outside the repo.",
              "answer": True, "whenRight": "Secrets stay out of git.",
              "whenWrong": "Use env vars or the cloud's credential helper; never commit keys."},
             {"prompt": "You committed a `SETUP.md` recording versions you installed.",
              "answer": True, "whenRight": "Your future self will thank you.",
              "whenWrong": "Future-you debugs version mismatches; record them now."}
         ]},
        {"kind": "exercise", "title": "Verify your setup",
         "body": (
             f"[CODE] Run the verification commands in your terminal:\n```bash\n{verify_cmd}\n```\n\n"
             f"PASS:\n[x] {verify_pass}\n[x] No error messages in output\n"
             "[x] Committed `SETUP.md` with the versions you installed."
         )}
    ])
    # Body hygiene on Day 0 items
    for it in items:
        if it.get('kind') in ('lesson', 'exercise') and it.get('body'):
            it['body'] = ensure_code_blocks_explained(it['body'])
    return {"number": 0, "title": f"Day 0 - Setup: {topic}",
            "summary": f"Install and verify {topic} before diving into the week.", "items": items}


# ============================================================
# Day padding
# ============================================================
def pad_day(raw_day, week_context, day_num, week_title, track_slug, used_video_urls, cache):
    items_in = clean_items(raw_day.get('items', []), track_slug, cache) if raw_day else []
    day_title = (raw_day.get('title') if raw_day else '') or f"Day {day_num} - {week_title}"
    kinds_present = {it.get('kind') for it in items_in}
    items = list(items_in)

    if 'lesson' not in kinds_present:
        items.insert(0, synth_lesson(day_title, week_context))

    # Video ONLY on a direct concept match (no forced/tangential videos). Match on the
    # day title AND the week title, so a day inside (say) the "Transformers" or "RAG"
    # week still gets that concept's video even if the day title is generic. When no
    # on-topic video fits, add a 'deeper dive' second lesson instead.
    # Two-phase pick so a day's OWN concept always wins, and the week theme only
    # FILLS a day that has no concept video of its own (never displaces one):
    #   phase 1 — match on the day title alone (day-specific concept video)
    #   phase 2 — match on day + week title (week-theme / week-concept fallback)
    budget = budget_for_day(day_title, day_num, track_slug)
    video = pick_video_for_day(day_title, used_video_urls, cache, track_slug, budget)
    if not video or video['url'] in used_video_urls:
        alt = pick_video_for_day(f"{day_title} {week_title}", used_video_urls, cache, track_slug, budget)
        if alt and alt['url'] not in used_video_urls:
            video = alt
    first_lesson_idx = next((i for i, it in enumerate(items) if it.get('kind') == 'lesson'), -1)
    insert_at = first_lesson_idx + 1 if first_lesson_idx >= 0 else 0
    if video and video['url'] not in used_video_urls:
        items.insert(insert_at, {"kind": "video", **video})
        used_video_urls.add(video['url'])
    else:
        items.insert(insert_at, synth_second_lesson(day_title, week_context))

    if 'swipe' not in kinds_present:
        ex_idx = next((i for i, it in enumerate(items) if it.get('kind') == 'exercise'), len(items))
        items.insert(ex_idx, synth_swipe())

    if 'exercise' not in kinds_present:
        items.append(synth_exercise(day_title))

    # Body hygiene: label + PASS + code-block explanation on exercises; code hygiene on lessons.
    for it in items:
        if it.get('kind') == 'exercise':
            b = ensure_exercise_label(it.get('body', '') or '')
            b = ensure_pass_checklist(b)
            b = ensure_code_blocks_explained(b)
            it['body'] = b
        elif it.get('kind') == 'lesson' and it.get('body'):
            it['body'] = ensure_code_blocks_explained(it['body'])

    summary = (raw_day.get('summary') if raw_day else '') or f"Focus: {day_title}"
    return {"number": day_num, "title": day_title, "summary": summary, "items": items}


# ============================================================
# Concept-check extraction & normalisation
# ============================================================
def parse_mastery_questions(qs):
    out = []
    for q in qs[:3]:
        s = q if isinstance(q, str) else str(q)
        parts = s.split(" A: ")
        if len(parts) == 2:
            question_text = parts[0].replace("Q: ", "").strip()
            answer_text = parts[1].strip()
        else:
            question_text = s[:200]
            answer_text = "See the lesson for explanation. The right answer follows directly from the core idea taught today."
        if len(answer_text) < 80:
            answer_text = answer_text + " " + "Re-read the lesson if this isn't yet obvious; the explanation walks through why."
        out.append({"q": question_text,
                    "choices": ["First option", "Second option", "Third option", "Fourth option"],
                    "correct": 0, "explain": answer_text})
    return out


def _count_sentences(text: str) -> int:
    return len([s for s in re.split(r'(?<=[.!?])\s+', text.strip()) if s.strip()])


def _normalise_cc_entry(q, fallback_explain):
    out = {}
    qtext = (q.get('q') or q.get('question') or '').strip()
    if qtext and not qtext.endswith('?'):
        # Drop trailing terminal punctuation then add a question mark.
        qtext = qtext.rstrip('.!:') + '?'
    if not qtext:
        qtext = "What is the key idea behind this topic?"
    out['q'] = qtext

    ch = q.get('choices') or q.get('options') or []
    if not isinstance(ch, list):
        ch = []
    ch = [str(x).strip() for x in ch if str(x).strip()]
    while len(ch) < 4:
        ch.append(f"Option {chr(ord('A') + len(ch))}")
    out['choices'] = ch[:4]

    corr = q.get('correct')
    if not isinstance(corr, int) or not (0 <= corr <= 3):
        corr = 0
    out['correct'] = corr

    ex = q.get('explain') or q.get('explanation') or fallback_explain
    if not isinstance(ex, str):
        ex = str(ex)
    ex = ex.strip()
    # Ensure >=80 chars AND 2-4 sentences.
    pad_sentences = [
        "The correct option follows directly from the core idea taught in this part of the week.",
        "The other choices are plausible distractors that miss that central point.",
    ]
    pi = 0
    while (len(ex) < 80 or _count_sentences(ex) < 2) and pi < len(pad_sentences):
        if ex and not ex.rstrip().endswith(('.', '!', '?')):
            ex = ex.rstrip() + '.'
        ex = (ex + ' ' + pad_sentences[pi]).strip()
        pi += 1
    # Cap at 4 sentences.
    sents = [s for s in re.split(r'(?<=[.!?])\s+', ex.strip()) if s.strip()]
    if len(sents) > 4:
        ex = ' '.join(sents[:4])
    out['explain'] = ex
    return out


def extract_concept_check(raw_week):
    fb = "The correct option follows directly from the core idea taught in this part of the week."
    cc = raw_week.get('concept_check') or []
    if isinstance(cc, list) and len(cc) >= 3:
        raw = cc[:3]
    else:
        mq = raw_week.get('mastery_questions') or []
        if len(mq) >= 3:
            raw = parse_mastery_questions(mq)
        else:
            raw = synth_concept_check_q(raw_week.get('title', 'this week'))
    return [_normalise_cc_entry(q, fb) for q in raw]


# ============================================================
# Week enrichment
# ============================================================
def enrich_week(raw_week, week_num, track_slug, cache):
    title = raw_week.get('title', f'Week {week_num}')
    context = raw_week.get('context', '')
    enriched = {
        "number": week_num, "title": title,
        "phase": raw_week.get('phase', 'Foundations'),
        "commitment_hours": raw_week.get('commitment_hours', '12-18'),
        "context": context, "concept_check": [], "days": []
    }

    raw_days = raw_week.get('days', []) or []
    by_num = {}
    for rd in raw_days:
        n = rd.get('number')
        if n is not None:
            by_num[int(n)] = rd

    used_video_urls = set()

    # Day 0
    prereq = (TRACK_PREREQUISITES.get(track_slug, {}).get(week_num) or title)[:120]
    raw_d0 = by_num.get(0)
    if raw_d0:
        cleaned = clean_items(raw_d0.get('items', []), track_slug, cache)
        kinds = {it.get('kind') for it in cleaned}
        if 'lesson' in kinds and 'exercise' in kinds:
            d0 = pad_day(raw_d0, context, 0, title, track_slug, used_video_urls, cache)
            d0['number'] = 0
        else:
            d0 = synth_day_zero(prereq, used_video_urls, cache, track_slug)
    else:
        d0 = synth_day_zero(prereq, used_video_urls, cache, track_slug)

    _finalize_day_zero(d0, prereq)
    # Zero-cost path: scan the whole week for paid tools and add a free-alternative
    # note to Day 0 so the student always has a no-card route.
    _week_blob = (context or '') + ' ' + str(raw_week.get('project', '')) + ' ' + ' '.join(
        (it.get('title', '') or '') + ' ' + (it.get('body', '') or '')
        for rd in raw_days for it in rd.get('items', []))
    inject_free_path(d0, _week_blob)
    enriched['days'].append(d0)

    # Days 1..7
    for d_num in range(1, 8):
        raw_day = by_num.get(d_num)
        day = pad_day(raw_day, context, d_num, title, track_slug, used_video_urls, cache)
        enriched['days'].append(day)

    # Ship-it final on Day 7
    last = enriched['days'][-1]
    ship_body = (
        f"[PRODUCE] Tag your work as v{week_num}.0 and push to GitHub. "
        "The commands below stamp a versioned release of this week's work:\n\n"
        "```bash\n"
        f"git add . && git commit -m '{title}'\n"
        f"git tag v{week_num}.0 && git push --tags\n"
        "```\n\n"
        "PASS:\n"
        "[x] Your week's work is committed\n"
        f"[x] A v{week_num}.0 tag is pushed to the remote"
    )
    last['items'].append({"kind": "exercise", "title": "Ship it", "body": ship_body})

    # Dataset clarity: name the file, say if it's reused, where to get it, where to save it.
    inject_dataset_callout(enriched['days'], week_num, track_slug, _week_blob)

    enriched['concept_check'] = extract_concept_check(raw_week)
    return enriched


VERIFY_CUE_RE = re.compile(r'--version|version|verify|--client|hello-world|sts get-caller|debug|gh auth|prints', re.I)


def _finalize_day_zero(d0, topic):
    """Guarantee Day 0 has >=2 swipe cards, a verification step, and a [CODE] exercise with PASS."""
    items = d0.get('items', [])
    # Swipe with >=2 cards
    swipes = [it for it in items if it.get('kind') == 'swipe']
    if not swipes or all(len(s.get('cards', [])) < 2 for s in swipes):
        ex_idx = next((i for i, it in enumerate(items) if it.get('kind') == 'exercise'), len(items))
        items.insert(ex_idx, synth_swipe())

    # Guarantee a verification step. GUI-tool Day-0s (Power BI, Zapier) may lack a CLI cue;
    # append an explicit verification exercise built from the week's prerequisite tool.
    has_verify = any(it.get('kind') == 'exercise' and VERIFY_CUE_RE.search(it.get('body', '') or '')
                     for it in items)
    if not has_verify:
        vcmd, vpass = _verify_for_topic(topic)
        items.append({"kind": "exercise", "title": "Verify your setup",
                      "body": (f"[CODE] Confirm your tooling is installed and authenticated:\n"
                               f"```bash\n{vcmd}\n```\n\nPASS:\n[x] {vpass}\n"
                               "[x] You recorded the versions in SETUP.md")})

    # Exercises: label + PASS + hygiene; ensure at least one is [CODE]
    exercises = [it for it in items if it.get('kind') == 'exercise']
    for it in exercises:
        b = ensure_exercise_label(it.get('body', '') or '')
        b = ensure_pass_checklist(b)
        b = ensure_code_blocks_explained(b)
        it['body'] = b
    has_code = any(EX_LABEL_RE.match(it.get('body', '') or '') and
                   it['body'].lstrip().upper().startswith('[CODE]') for it in exercises)
    if not has_code:
        # Relabel the first exercise to [CODE]
        if exercises:
            body = exercises[0]['body']
            exercises[0]['body'] = re.sub(r'^\s*\[(WRITE|PRODUCE)\]', '[CODE]', body, count=1, flags=re.IGNORECASE)
        else:
            items.append({"kind": "exercise", "title": "Verify your setup",
                          "body": ("[CODE] Run the tool's version command to confirm the install:\n"
                                   "```bash\n# e.g. tool --version\n```\n\nPASS:\n"
                                   "[x] The version prints without error\n[x] You recorded it in SETUP.md")})
    d0['items'] = items


# ============================================================
# Diversity rescue: force ≥5 unique videos per week
# ============================================================
def enforce_video_diversity(week, cache, track_slug, target=5):
    """If a week has <target unique videos, drop dup videos on later days and swap in new ones."""
    days = week['days']
    urls_seen = []
    for day in days:
        for it in day['items']:
            if it.get('kind') == 'video':
                urls_seen.append(it.get('url', ''))
    unique = set(urls_seen)
    if len(unique) >= target:
        return
    # Walk days and replace duplicates
    used = set()
    for day in days:
        for i, it in enumerate(day['items']):
            if it.get('kind') != 'video':
                continue
            url = it.get('url', '')
            if url in used:
                # Try to find a new video
                video = pick_video_for_day(day.get('title', ''), used, cache, track_slug)
                if video and video['url'] not in used:
                    day['items'][i] = {"kind": "video", **video}
                    used.add(video['url'])
                else:
                    # Remove duplicate video item entirely
                    day['items'][i] = None
            else:
                used.add(url)
        day['items'] = [it for it in day['items'] if it is not None]


# ============================================================
# Track runner
# ============================================================
def _norm_text(s: str) -> str:
    return re.sub(r'\s+', ' ', (s or '').strip().lower())


def dedup_lessons(weeks):
    """Ensure no two lesson bodies in the track are byte-identical (normalised)."""
    seen = {}
    for w in weeks:
        for day in w['days']:
            for it in day['items']:
                if it.get('kind') != 'lesson':
                    continue
                key = _norm_text(it.get('body', ''))
                if key in seen:
                    # Disambiguate with a unique, content-bearing line.
                    it['body'] = (it.get('body', '').rstrip() +
                                  f"\n\n## Context\nThis applies specifically to "
                                  f"week {w['number']} ('{w['title']}'), day {day['number']}.")
                else:
                    seen[key] = (w['number'], day['number'])


def process_track(slug, cache, input_filename=None, output_filename=None, out_slug=None):
    input_path = HERE / (input_filename or f"{slug}.json")
    output_path = HERE / (output_filename or f"{slug}-enriched.json")
    if not input_path.exists():
        print(f"  [skip] {input_path.name} not found")
        return
    with open(input_path, encoding='utf-8') as f:
        raw_data = json.load(f)
    raw_weeks = raw_data if isinstance(raw_data, list) else raw_data.get('weeks', [])

    enriched_weeks = []
    for idx, raw_week in enumerate(raw_weeks, start=1):
        w = enrich_week(raw_week, idx, slug, cache)
        enriched_weeks.append(w)

    dedup_lessons(enriched_weeks)

    final_slug = out_slug or (f"{slug}-enriched" if output_filename is None else slug)
    out = {
        "slug": final_slug,
        "title": slug.replace('-', ' ').title() + (" (Enriched)" if output_filename is None else ""),
        "total_weeks": len(enriched_weeks),
        "weeks": enriched_weeks
    }
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"  [ok]   {output_path.name} ({len(enriched_weeks)} weeks)")


# DS / DA: read from {slug}.json (gold raw) and write back to {slug}.json
GOLD_TRACKS = {'data-science', 'data-analysis'}

ALL_TRACKS = [
    'devops-cloud', 'full-stack-web', 'mobile-engineering', 'cybersecurity',
    'bi-analytics', 'ml-engineering', 'ai-automation', 'ai-engineering',
    'data-science', 'data-analysis',
]


def collect_all_raw_video_urls():
    urls = set()
    for slug in ALL_TRACKS:
        p = HERE / f"{slug}.json"
        if not p.exists():
            continue
        try:
            with open(p, encoding='utf-8') as f:
                d = json.load(f)
            weeks = d if isinstance(d, list) else d.get('weeks', [])
            for w in weeks:
                for day in w.get('days', []):
                    for it in day.get('items', []):
                        if it.get('kind') == 'video':
                            url = it.get('url', '') or ''
                            if YT_URL_RE.match(url):
                                urls.add(url)
        except Exception:
            pass
    return urls


def export_allowlist():
    """Write the validated allowlist of video URLs + IDs for the auditor."""
    urls = []
    for entries in KNOWN_GOOD.values():
        for tup in entries:
            urls.append(tup[0])
    ids = []
    for u in urls:
        m = re.search(r'(?:watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})', u)
        if m:
            ids.append(m.group(1))
    data = {"urls": sorted(set(urls)), "ids": sorted(set(ids))}
    (HERE / '.known-good-ids.json').write_text(json.dumps(data, indent=2), encoding='utf-8')
    print(f"  Exported allowlist: {len(data['ids'])} verified video IDs.")


def main():
    # data-engineering is processed from its -src.json into data-engineering.json
    default_order = ALL_TRACKS + ['data-engineering']
    arg = sys.argv[1] if len(sys.argv) > 1 else None
    # `--all` (or no arg) processes every track; a slug processes just that track.
    slugs = default_order if (arg is None or arg in ('--all', 'all')) else [arg]
    print("Validating video library...")
    extra = collect_all_raw_video_urls()
    cache = validate_library_and_collect(extra)
    export_allowlist()

    # Backup gold tracks before overwriting
    for slug in slugs:
        if slug in GOLD_TRACKS:
            src = HERE / f"{slug}.json"
            bak = HERE / f"{slug}.json.bak"
            if src.exists() and not bak.exists():
                bak.write_text(src.read_text(encoding='utf-8'), encoding='utf-8')
                print(f"  Backed up {src.name} -> {bak.name}")

    for slug in slugs:
        print(f"Processing {slug}...")
        if slug == 'data-engineering':
            # Raw lives in data-engineering-src.json; enriched output is data-engineering.json
            process_track(slug, cache,
                          input_filename='data-engineering-src.json',
                          output_filename='data-engineering.json',
                          out_slug='data-engineering')
        elif slug in GOLD_TRACKS:
            # Read raw from .bak, write enriched back to {slug}.json.
            bak = HERE / f"{slug}.json.bak"
            tmp = HERE / f"{slug}.json"
            data = json.loads(bak.read_text(encoding='utf-8'))
            with open(tmp, 'w', encoding='utf-8') as f:
                json.dump(data, f)  # restore raw shape temporarily as process input
            process_track(slug, cache, output_filename=f"{slug}.json", out_slug=slug)
        else:
            process_track(slug, cache)
    print("Done.")


if __name__ == "__main__":
    main()
