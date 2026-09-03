import { rewriteWeek } from "../rewrite-week";

// ml-engineering W16-W20

rewriteWeek("ml-engineering", 16, {
  context: `Reproducibility in ML is harder than in regular software. Not because engineers are careless, but because ML training depends on many things that are easy to forget to version: the Python environment, the random seeds, the GPU driver version, the preprocessing order, the exact dataset slice. Docker solves the environment problem comprehensively: everything your training needs — Python, CUDA libraries, installed packages, environment variables — is declared in a Dockerfile, frozen into an image, and reproducible on any compatible machine.

A Dockerfile is a recipe. The FROM instruction specifies the base image — for ML, this is usually an official PyTorch or CUDA image. Each subsequent RUN instruction adds a layer. Layers are cached: if the first 5 instructions have not changed, Docker skips them and rebuilds only from the changed instruction. This caching is what makes iterative development with Docker practical.

Layer ordering matters for cache efficiency. The most stable layers go first. Dependencies (requirements.txt install) go before application code, because requirements change rarely and code changes often. If you put COPY . . before RUN pip install, every code change invalidates the pip install layer, costing minutes on rebuilds.

Multi-stage builds solve the size problem. The build stage installs compilers and build dependencies needed to compile packages. The runtime stage copies only the compiled artifacts, leaving the build tools behind. A training image built naively might be 8GB. A multi-stage build can shrink it to 3GB by excluding the build toolchain from the final image.

The Dockerfile as a lab notebook metaphor means: every environment decision (Python version, CUDA version, library version) is explicitly recorded in the Dockerfile and in version control. Anyone who has the Dockerfile can reproduce the exact environment. This is the gold standard for reproducibility that "works on my machine" can never achieve.`,

  pre_flight: `Have Docker Desktop installed and confirmed running. Know the difference between a Docker image (the template) and a container (the running instance). Know the docker build and docker run commands. Find the official PyTorch Docker images at hub.docker.com/r/pytorch/pytorch — pick the right tag for your CUDA version (or cpu-only). Know that .dockerignore works like .gitignore for excluding files from the image context.`,

  mastery_questions: [
    `You want to train your model in a Docker container with GPU access. What additional configuration is required beyond a standard CPU container? You need the NVIDIA Container Toolkit installed on the host machine. The docker run command requires the --gpus flag: \`docker run --gpus all my-training-image\`. Inside the container, CUDA-capable GPU is available to PyTorch. The base image must match the CUDA version installed on the host: if the host runs CUDA 12.1, the base image should be pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime or similar. Version mismatch between host CUDA driver and container CUDA toolkit is the most common GPU-in-Docker failure.`,

    `Your Dockerfile has these instructions in this order: COPY requirements.txt .; RUN pip install -r requirements.txt; COPY . .. Your teammate changes app.py. Docker rebuilds. Which layers are cached and which are rebuilt? COPY requirements.txt . — cached (requirements.txt unchanged). RUN pip install — cached (requirements.txt unchanged, so this layer's cache is valid). COPY . . — rebuilt (app.py changed, so the context changed). Only the final layer is rebuilt. If requirements.txt and app.py were in the wrong order (COPY . . before RUN pip install), every code change would invalidate the pip install layer, costing minutes.`,

    `You want to ensure your ML training container is as small as possible. What are three strategies? (1) Multi-stage build: compile dependencies in one stage, copy only the compiled artifacts to a smaller runtime base image. (2) Use slim base images: pytorch/pytorch:xxx-runtime instead of -devel (devel includes compiler tools not needed for inference/training). (3) Aggressively clean up in the same RUN layer: \`RUN pip install ... && pip cache purge && apt-get clean && rm -rf /var/lib/apt/lists/*\`. Cleaning in a separate RUN layer does not reduce size — each layer adds to the total. Clean within the same layer.`,

    `You want to pin your Python environment exactly. requirements.txt with pinned versions is good. What is better and why? A conda environment.yaml or pip-compiled requirements with hashes: \`pip-compile --generate-hashes\` produces a requirements file where each package has an expected hash. When installing, pip verifies the hash. This prevents supply chain attacks (a malicious package silently replacing a dependency) and ensures byte-for-byte identical installs regardless of what new versions were published. For critical ML systems, hash-pinned requirements are the correct approach.`,

    `Your Docker build succeeds but training in the container crashes with a different error than local training. What is the first thing you check? Environment differences. Check: (1) Python version inside the container vs local (python --version inside a running container), (2) package versions (pip list inside the container vs local), (3) CUDA version mismatch between the container and host driver, (4) environment variables — does the training script read any environment variable that was set locally but not in the container? Run the container interactively (docker run -it --entrypoint /bin/bash) and reproduce the error step by step.`,
  ],

  common_mistakes: [
    `Building the training image on every run instead of tagging and pushing to a registry. Build once, push to Docker Hub or AWS ECR, pull on the training machine. Rebuilding on the training machine wastes time and may produce slightly different images if PyPI packages have been updated between builds.`,

    `Not adding .dockerignore. Without it, COPY . . copies everything: .git directory, local data files, __pycache__, virtual environments. This bloats the image, slows the build, and may inadvertently include secrets. .dockerignore should exclude at minimum: .git, __pycache__, .env, data/.`,

    `Running training as root inside the container. The default Docker user is root. Training with root is fine for single-user personal projects. In a shared environment, running as root means container processes can write to any file on the host if the container is misconfigured. Add USER 1000 near the end of the Dockerfile to run as a non-root user.`,

    `Not testing the container with the same volume mount configuration used in production. If you mount a data directory with -v /host/data:/container/data, verify the path matches inside the training script. A training script hardcoded with /data/raw.csv will fail if the volume is mounted at /workspace/data/.`,

    `Using latest tags for base images. FROM pytorch/pytorch:latest changes what is installed every time the image is built. Use specific version tags: FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime. Your Dockerfile should produce the exact same image today and in 6 months.`,
  ],

  debug_help: `The hardest Docker GPU error is "NVIDIA driver version does not support CUDA runtime". The container's CUDA toolkit requires a minimum host driver version. For CUDA 12.1, the minimum host NVIDIA driver is 525.85. Run \`nvidia-smi\` on the host to check the driver version. If it is older than required, either update the host driver or use an older CUDA version in your container image. The error often appears as a cryptic "failed to initialise NVML" or "no CUDA-capable device is detected" rather than the direct driver version message.`,

  ai_assist: `Use Claude to help you write a production-grade Dockerfile for your ML training code. Describe: the base image you want, the Python version, the ML framework, the packages you need, and whether you need GPU support. Ask it to generate a Dockerfile with layer caching optimised and security best practices (non-root user, pinned versions). Review every instruction before using it.`,

  stretch: [
    `Build a Docker Compose setup for your full ML workflow: one service for training (GPU-enabled), one for the Flask serving API, and one for a Jupyter notebook server for exploration. All three share a data volume. Test that they can all run simultaneously.`,
    `Set up automated Docker image building: a GitHub Actions workflow that builds and pushes the training image to Docker Hub whenever the Dockerfile or requirements.txt changes. Tag images with the git commit hash for traceability.`,
    `Profile the Docker build time before and after implementing layer caching optimisation. Document: which layer was the slowest before optimisation, what you changed, and how much faster the rebuild is after a code change.`,
  ],
});

rewriteWeek("ml-engineering", 17, {
  context: `Training a model is the beginning. Getting it to serve predictions reliably to real users — at low latency, at scale, with good error handling — is the engineering challenge that occupies most of a production ML engineer's time. Model serving involves architectural decisions that are not visible in the model itself: synchronous versus asynchronous, single-instance versus distributed, online versus batch, request-level versus session-level state.

FastAPI is the current standard for Python model serving. It is async-first, has automatic OpenAPI documentation, validates request and response schemas through Pydantic, and handles concurrent requests efficiently. For most model serving use cases — one model, moderate traffic — FastAPI with uvicorn is the correct starting point. The limitations appear when your model is slow (long GPU inference) or when you need dynamic batching.

Dynamic batching is the technique that makes GPU model serving efficient. GPUs are parallelism engines — they perform far more efficiently on batched inputs than on one sample at a time. But users send requests one at a time. Dynamic batching collects concurrent requests into a batch, runs one GPU forward pass for the entire batch, and returns results to each requester. At low traffic, a short time window collects whatever concurrent requests arrive. At high traffic, the window fills instantly with a full batch. The net effect: GPU utilisation is much higher and cost per request is much lower.

Serving patterns: synchronous request/response is the simplest — client sends a request, waits, gets a response. Appropriate when inference latency is under 1 second and users can tolerate waiting. Async with queue is better for slow inference or batch processing — client submits a job and gets a job ID, then polls or receives a webhook when complete. Batch inference runs at scheduled times on accumulated data without any real-time user interaction.

TorchServe (for PyTorch) and Triton Inference Server (for multiple frameworks including ONNX) are production serving frameworks that handle dynamic batching, GPU memory management, model versioning, and health checks at a level that hand-built FastAPI servers cannot match at scale. Knowing when you have outgrown FastAPI and need one of these frameworks is an important judgment call.`,

  pre_flight: `Install fastapi, uvicorn, and pydantic. Have your FlightWise model serialised as a joblib file or a PyTorch state_dict. Understand the difference between cpu and gpu inference — for a small sklearn or XGBoost model, CPU is usually fast enough. Know that uvicorn serves FastAPI apps: \`uvicorn main:app --host 0.0.0.0 --port 8000\`. Know what ONNX is: a model format that can be exported from PyTorch and run with ONNX Runtime for faster CPU inference.`,

  mastery_questions: [
    `You serve your PyTorch model with FastAPI. Each request takes 200ms (model inference). Your server receives 20 requests per second. What happens? Each request takes 200ms and FastAPI with a single uvicorn worker processes them sequentially in the async loop. At 20 requests/second, the server falls 4 seconds behind every second — requests queue and latency grows without bound. Fix: run with multiple workers: \`uvicorn main:app --workers 4\`. Four workers can handle 4 * (1000/200) = 20 requests/second in parallel. Alternatively, move inference to a background thread with asyncio.to_thread() so the async event loop is not blocked. For GPU inference, add dynamic batching.`,

    `You export your PyTorch model to ONNX format. What does ONNX provide that the original PyTorch model does not? ONNX Runtime is a high-performance inference engine that applies graph-level optimisations: operator fusion (combining multiple operations into one), constant folding (pre-computing values that do not depend on input), and hardware-specific optimisations (using CPU instruction sets like AVX-512). On CPU inference, ONNX Runtime typically provides 2-4x speedup over PyTorch for the same model. The tradeoff: you lose access to PyTorch-specific features and dynamic computation graphs. For production inference with a fixed architecture, ONNX is usually faster.`,

    `Your model serving endpoint needs to handle two types of requests: single-sample prediction (for real-time API calls) and batch prediction (for bulk scoring at night). How do you design the FastAPI API? Two endpoints: POST /predict accepts a single FlightFeatures Pydantic model and returns a single prediction. POST /predict/batch accepts a List[FlightFeatures] and returns a List[PredictionResponse]. The batch endpoint passes the whole list to model.predict() in one call — efficient because sklearn and XGBoost are already vectorised. Add a maximum batch size limit on /predict/batch to prevent memory exhaustion from very large batches.`,

    `You want to add model versioning to your serving endpoint. How do you serve two versions of the model simultaneously? Load both versions at startup: model_v1 = load_model('v1/flightwise.pkl'); model_v2 = load_model('v2/flightwise.pkl'). Add a version parameter to the prediction endpoint: GET /predict?version=v2. Route the request to the appropriate model. Add an endpoint GET /models that returns the available versions and which one is the default. The default can be configured via an environment variable, so promoting v2 to default does not require a code change.`,

    `You deploy your FastAPI serving endpoint. What does the startup event (lifespan function in FastAPI) give you compared to loading the model at module level? Loading at module level happens when the module is imported, which can delay startup and may fail if the model file is not yet available (e.g., if it is downloaded from S3 during startup). The FastAPI lifespan function (using asyncio context manager) runs after the server is ready to accept connections. It is the right place for: loading models from disk or remote storage, establishing database connections, initialising caches. Using lifespan also enables graceful shutdown: the teardown code in the lifespan function runs when the server receives a shutdown signal, allowing you to release resources cleanly.`,
  ],

  common_mistakes: [
    `Loading the model inside the request handler function. This loads the model from disk on every request, adding hundreds of milliseconds. Load once at startup, store as an application state variable, reuse on every request.`,

    `Not setting a request timeout. If a model inference takes longer than expected (unusual input, high server load), a request without a timeout hangs indefinitely. Set timeouts at the client level (HTTP client timeout) and at the server level (add a timeout middleware to FastAPI).`,

    `Returning numpy arrays or sklearn objects directly in the response without converting to JSON-serialisable types. FastAPI serialises responses through Pydantic. If your prediction function returns np.float32, Pydantic cannot serialise it. Convert to float(): float(model.predict_proba(X)[0][1]).`,

    `Not logging prediction inputs and outputs. A serving endpoint without logging is a black box in production. Log a sample of requests (10-20%) with the input features and prediction, enabling debugging when something goes wrong and monitoring for data drift.`,

    `Deploying without a load test. A server that handles 1 request/second in development may fail at 50 requests/second due to resource exhaustion. Use locust or k6 to load test your endpoint before deploying to production.`,
  ],

  debug_help: `The most confusing serving bug is a model that performs well in offline evaluation but produces bad predictions on 10% of live requests. This is almost always a preprocessing mismatch: the live request preprocessing differs from the training preprocessing in some edge case. Debug: log the raw input features and the preprocessed features for the bad predictions. Compare the preprocessed feature distributions between training time and inference time. Common causes: a scaler that was fitted on training data but receives a feature value outside the training range, an encoder that encounters a new category value at inference, or a missing value imputed differently.`,

  ai_assist: `Use Claude to help you write the FastAPI lifespan function that loads your model and any preprocessing artifacts at startup. Describe what needs to be loaded (model file, scaler, encoder, etc.) and ask it to write the lifespan function with proper error handling (what happens if the model file is not found?). Review the generated code with focus on the error paths.`,

  stretch: [
    `Implement dynamic batching from scratch: use asyncio.Queue to collect incoming requests, batch them when the queue reaches size N or a timeout expires, run one batch inference call, and return results to each waiting coroutine.`,
    `Export your PyTorch model to ONNX and serve it with ONNX Runtime instead of PyTorch. Measure the inference latency difference for single-sample and batch requests. Document the speedup.`,
    `Add a /metrics endpoint (Prometheus format) that exposes: request count, error count, p50/p95/p99 latency, and model prediction distribution (histogram of predicted probabilities). This is the minimum observability for a production serving endpoint.`,
  ],
});

rewriteWeek("ml-engineering", 18, {
  context: `A model deployed to production starts degrading the moment it launches. Not because of bugs, but because the world changes. The distribution of inputs shifts. The relationship between inputs and outputs changes. The ground truth labels collected over time reveal that the model's predictions are no longer accurate. Without monitoring, this degradation is invisible until it is severe enough for users or stakeholders to notice.

Input drift is the most common failure mode. The distribution of the model's input features at deployment time differs from the distribution at training time. A model trained on pre-pandemic flight patterns fails on post-pandemic patterns. A loan model trained on 2019 economic conditions fails in 2022. Detecting drift requires statistical tests: KL divergence, Wasserstein distance, Population Stability Index (PSI), or the Kolmogorov-Smirnov test. Each measures, in different ways, how different the current input distribution is from the reference (training) distribution.

Concept drift is more dangerous and harder to detect. The input distribution may be stable, but the relationship between inputs and outputs has changed. Routes that were on-time reliably now have delays due to new airline policies. High-income customers who were low default risk now exhibit different patterns. Detecting concept drift requires ground truth labels — you must wait for the outcome (flight actually late or not, loan actually defaulted or not) and compare model predictions against it. This delay between prediction and ground truth is often significant (weeks or months).

Performance drift is what you see in metrics: accuracy, ROC AUC, precision, recall falling over time on the slice of predictions where you have ground truth labels. It is a symptom of either input drift or concept drift. Measuring it requires a continuous labelling pipeline — some mechanism to collect ground truth for recent predictions.

Evidently AI is a Python library for monitoring ML models. It produces HTML reports and JSON metrics for data drift, concept drift, and model performance. It can be integrated into batch monitoring jobs (run nightly on recent predictions) or into real-time serving (compute statistics per request window).`,

  pre_flight: `Install evidently. Understand PSI (Population Stability Index): compares the distribution of a feature at deployment time against the training distribution, using binned proportions. PSI > 0.2 indicates significant drift. Know that concept drift requires ground truth — you cannot detect it in real time unless you have immediate ground truth. Have your FlightWise training data available as a reference dataset.`,

  mastery_questions: [
    `Your monitoring shows PSI of 0.35 for the DEP_HOUR feature. What does this mean and what do you do? PSI > 0.2 indicates significant distribution shift in departure hour. This might mean: the model is receiving requests for different flight times than it trained on (e.g., more red-eye flights), or data upstream has changed (a pipeline bug that transforms hours differently). First: investigate the cause. Is the shift real (the flight patterns changed) or artificial (a preprocessing bug)? Plot the historical vs current departure hour distribution. If real: consider retraining on recent data. If artificial: fix the upstream bug. Do not retrain before understanding why the drift occurred.`,

    `You have 90 days of predictions and, for 60% of those predictions, the actual flight outcome has been collected. You compute model performance on those 60% and find ROC AUC has dropped from 0.74 (at deployment) to 0.68 (now). What do you do next? First: check whether the 60% with labels is a representative sample of all predictions. If it is a biased sample (e.g., only short-haul flights report outcomes quickly), the 0.68 ROC AUC is computed on a biased subset. If the sample is representative: check whether input drift precedes the performance drop (if PSI was elevated 30 days ago and performance dropped 30 days later, they are linked). If input drift is the cause: retrain on recent data. Document the decision and set up an automated alert for PSI > 0.2.`,

    `You want to monitor a feature that has a highly skewed distribution (most values near 0, a few very large values). Standard drift metrics like KL divergence are sensitive to the exact binning. What approach is more robust? Use the Wasserstein distance (Earth Mover's Distance). It measures how much "earth" you need to move to transform one distribution into the other, and is robust to skewed distributions and the choice of binning. Alternatively, log-transform the skewed feature before computing any drift metric, which normalises the distribution. Another approach: use quantile-based comparison — compare the 10th, 25th, 50th, 75th, 90th, 99th percentiles of the current vs reference distribution.`,

    `Your ground truth labels arrive 30 days after the prediction (the flight happens 30 days after booking). How do you set up a monitoring pipeline given this delay? Maintain a prediction store: every prediction is stored with its input features, timestamp, and prediction. After 30 days, join the prediction store with outcome data to get the ground truth for each prediction. Run a daily monitoring job that processes the 30-day-old predictions: compute performance metrics, drift metrics on the input features at the time of prediction, and add results to a monitoring dashboard. Alert if performance drops below a threshold. The 30-day delay is operational reality — your monitoring pipeline must be designed around it.`,

    `You retrain your model on 6 months of recent data (including the drifted period). The new model has ROC AUC 0.75 on the test set (slightly better than the original 0.74). Should you deploy it? Not based on test ROC AUC alone. Also check: (1) Does the new model perform better on the specific segment where the old model degraded? (2) Are there segments where the new model is worse than the old one? (3) What is the model's performance on data from 12 months ago — did it forget old patterns? (4) Is the new training data high quality? Rushed retraining on noisy recent data can introduce new problems. Run a structured comparison before deploying.`,
  ],

  common_mistakes: [
    `Monitoring only overall metrics and not segment-level metrics. Overall ROC AUC may be stable while performance on a specific airline or route degrades significantly. Always segment your monitoring by the key dimensions in your data.`,

    `Computing drift metrics at a frequency that is too low. If you run drift detection weekly and a pipeline bug introduces drift on Monday, you learn about it on Sunday — six days later. For critical models, compute drift daily or even hourly on the most important features.`,

    `Setting drift thresholds without calibration. PSI > 0.2 is a common rule of thumb, but the appropriate threshold depends on your model and use case. Calibrate: compute PSI on historical data windows that did not cause performance issues and use those values to set your "no action needed" baseline.`,

    `Not storing the training reference distribution. You need the training data distribution to compute drift metrics. If you did not store it at training time, you cannot run drift detection later. Store the distribution summary (mean, std, quantiles, histogram) as part of your model artifact.`,

    `Treating monitoring as a dashboard-only activity. Dashboards require someone to look at them. Add automated alerts: if PSI exceeds threshold or model performance drops below a level, send a notification. Monitoring without alerting is passive.`,
  ],

  debug_help: `The most confusing monitoring result is when drift is detected in a feature that you know has not changed. This often means the reference distribution was computed incorrectly — from a biased sample, a different time window, or after a preprocessing step that is not applied to current data. Always compute drift between data processed through the same preprocessing pipeline as the current serving data. If the reference dataset was preprocessed differently, the drift you detect is an artifact of preprocessing differences, not real distribution shift.`,

  ai_assist: `Use Claude to help you set up Evidently monitoring for your FlightWise model. Describe your model's key features, the reference dataset format, and the current prediction data format. Ask it to generate the Evidently report code that computes data drift for the top 5 features and model performance on the ground truth subset. Review the generated code, paying attention to the column mapping configuration which Evidently uses to identify target, prediction, and feature columns.`,

  stretch: [
    `Build a drift monitoring dashboard in Streamlit: read from a SQLite table of daily PSI values per feature and display a time series chart for each feature. Add a red/yellow/green indicator based on PSI thresholds. Run the monitoring job daily and save results to the SQLite table.`,
    `Implement a statistical process control (SPC) chart for your model's prediction score distribution: track the mean and standard deviation of the prediction distribution weekly. Flag any week where the mean shifts by more than 2 standard deviations from the historical mean.`,
    `Build an automated retraining trigger: if PSI > 0.25 for more than 3 consecutive days on any top-5 feature, or if model ROC AUC drops below 0.70 on the most recent 30 days of labelled data, trigger a retraining pipeline run automatically.`,
  ],
});

rewriteWeek("ml-engineering", 19, {
  context: `You cannot trust offline metrics to predict online performance. A model that achieves 0.79 ROC AUC on a held-out test set may or may not be better than the production model for real users making real decisions. The gap between offline and online performance comes from distribution shift, user behaviour differences, and the fact that your test set was sampled from the same distribution as your training data. A/B testing is the method that generates statistically valid evidence about which model produces better outcomes in the real world.

The question of statistical significance in model A/B testing is more complex than in web A/B testing. Web A/B tests measure binary outcomes (clicked or not). Model A/B tests often measure continuous outcomes (quality score, revenue per prediction) or rare events (default rate, fraud rate). The statistical tests differ, the sample sizes required differ, and the time to significance differs.

Sample size calculation comes before the experiment. You need to specify: the minimum detectable effect (MDE — the smallest improvement worth detecting), the current baseline metric value, the desired statistical power (typically 80%), and the significance level (typically 5%). With these inputs, a power analysis tells you how many samples you need per variant. Running an underpowered experiment produces inconclusive results even if your hypothesis is correct.

Guardrail metrics are the metrics you monitor to prevent harm. If your primary metric is ROC AUC but you are also tracking user complaint rate, you need a guardrail that stops the experiment if complaint rate increases significantly. This prevents a scenario where one model scores better on your primary metric but harms users in a way you did not anticipate.

The challenge specific to model A/B testing: model updates from the provider mid-experiment. If you are using GPT-4o and OpenAI silently updates the model version during your 4-week experiment, both variant A (old prompt) and variant B (new prompt) might be affected differently. Log the model version with every prediction so you can account for this in analysis.`,

  pre_flight: `Understand what statistical power means: the probability of detecting a real effect if one exists. 80% power means you will miss 20% of real effects of your MDE size. Know what the p-value means: the probability of observing a result as extreme as yours if there is no real effect. A p-value below 0.05 means you reject the null hypothesis of no difference. Install scipy for stats tests: scipy.stats.ttest_ind for continuous metrics, scipy.stats.chi2_contingency for proportions.`,

  mastery_questions: [
    `You want to detect a 3% relative improvement in ROC AUC (from 0.74 to 0.762). Your daily traffic is 500 scored requests. How long will the experiment need to run? Use a power calculator: with alpha=0.05, power=0.80, baseline=0.74, MDE=0.762, the required sample size depends on the variance of your metric. ROC AUC has variance that you can estimate from a bootstrap of historical data. If you need 5000 samples per variant and you get 500 per day split 50/50, you get 250 per variant per day and need 20 days per variant — roughly 3 weeks. For very small effects (1-2% improvement), the required sample size can be 3-6 months at moderate traffic, which is often not practical.`,

    `You run a two-week A/B test. At day 5, the results look conclusive: variant B is significantly better (p=0.02). Your manager wants to ship B immediately. Should you? No. Looking at the results before the experiment is complete is called "peeking" and leads to inflated false positive rates. If you look at the data every day and stop when p < 0.05, you will stop early on random fluctuations much more often than 5% of the time. Run the experiment for the pre-specified duration. If you must make early decisions, use sequential testing methods (like mSPRT or Bayesian updating) that account for the peeking problem.`,

    `You run the A/B test and get p=0.07. Is there no difference between the models? A p-value of 0.07 means you cannot confidently reject the null hypothesis at the 5% significance level. It does not mean the models are equivalent. You may have been underpowered — the experiment may have ended before accumulating enough evidence for a small but real effect. Report the confidence interval for the effect size rather than just the p-value. If the confidence interval is [-0.01, +0.04], the true effect could be as large as 4% improvement. Run a larger experiment before concluding the models are equivalent.`,

    `Your A/B test shows that model B significantly outperforms model A on ROC AUC but model B also significantly increases the false positive rate (predicts late when flight is on time) for economy class passengers. How do you handle this? You have a primary metric win and a guardrail metric failure. The guardrail triggers: you should not ship model B as-is. Investigate why model B has higher false positives for economy passengers — is it a bias issue in training data? Is it the model architecture? Can the false positive rate be reduced by adjusting the prediction threshold for this segment? Report both findings fully. Shipping a model that is better overall but significantly worse for a specific segment is a fairness concern.`,

    `After running 5 A/B tests over a year, you notice that model performance differences always look significant in the first week and then the difference shrinks over two weeks. What is happening? This is a novelty effect. When a new model is deployed to a fraction of users, the behavior data for those users may be different just because they are the "test" users — perhaps they were selected with some systematic bias, or the initial traffic to the new variant is not representative. The effect diminishes over time as the traffic mix stabilises. Recommendation: discard the first 3-5 days of data in your analysis (the burn-in period) to avoid the novelty effect.`,
  ],

  common_mistakes: [
    `Starting an experiment without pre-specifying the sample size and stopping rule. Changing the stopping rule mid-experiment (deciding to run longer if results are not significant) inflates your false positive rate. Commit to the sample size before starting.`,

    `Using the same users in multiple concurrent experiments. If user A is in experiment 1 (comparing models) and experiment 2 (comparing UI changes) simultaneously, the interaction effects between experiments may make both results invalid. Ensure experiment assignment is orthogonal or analyse for interaction effects.`,

    `Not logging which variant each prediction came from. You need this for the analysis. Every prediction in your logging database should have a variant_id field. Without it, you cannot associate outcomes with the variant that caused them.`,

    `Testing too many hypotheses at once. Running 10 simultaneous A/B tests on 10 different changes means your false positive rate is not 5% per test but roughly 40% for the batch. Apply Bonferroni correction or run experiments sequentially.`,

    `Declaring victory too early on business metrics. A model that is statistically significantly better on ROC AUC over 2 weeks may not produce a statistically significant improvement in the business metric (revenue, churn reduction) over the same period, because the business metric has more noise and a longer time lag.`,
  ],

  debug_help: `The hardest A/B testing bug is a spurious significant result caused by a systematic difference in the user populations assigned to each variant. This is called a Simpson's Paradox scenario. Debug: check the distribution of key covariates (flight routes, airlines, time of day) between variants. If variant A has more early-morning flights than variant B, and early-morning flights are easier to predict, variant A will appear to perform better even if the models are identical. Always run a pre-experiment balance check: ensure the variant populations have similar distributions on key features before the experiment launches.`,

  ai_assist: `Use Claude to help you design the statistical analysis plan for a specific A/B test you want to run. Describe: the primary metric, the baseline value, the MDE, the daily traffic volume, and any guardrail metrics. Ask it to specify the sample size calculation, the appropriate statistical test, and the analysis plan including how to handle user-level vs request-level randomisation. Review the plan before starting the experiment.`,

  stretch: [
    `Implement a Bayesian A/B testing framework as an alternative to frequentist hypothesis testing. Use a Beta-Binomial model for binary outcomes (flight delayed: yes/no). After the experiment, plot the posterior distributions for both variants and compute the probability that B is better than A. Compare the Bayesian conclusion against the frequentist conclusion.`,
    `Build a traffic splitting mechanism using a feature flag system: given a user ID (or request ID), deterministically assign 50% to variant A and 50% to variant B using a hash function. Verify the assignment is stable (the same user always gets the same variant) and balanced (50/50 split over many requests).`,
    `Run a retrospective A/B test: take two model checkpoints from your training history (different epochs, different hyperparameters) and simulate what an A/B test would have shown if you had deployed both. Compare this to the offline evaluation result. Document how closely the offline and simulated online results agree.`,
  ],
});

rewriteWeek("ml-engineering", 20, {
  context: `Recommender systems are how Netflix decides what to show you, how Amazon decides what to suggest, and how Spotify builds your Discover Weekly playlist. They are one of the most commercially valuable ML applications and one of the most technically interesting — the output depends not just on the item but on the specific user, creating a high-dimensional personalisation problem that standard classification and regression cannot easily solve.

The fundamental challenge is the sparsity of the user-item interaction matrix. A streaming platform with 1 million users and 100,000 titles has 100 billion possible interactions. The actual interaction data (watches, ratings, clicks) might represent 0.1% of those possibilities — 100 million observations in a 100-billion-entry matrix. Any method that requires explicit ratings for unseen user-item pairs must generalise from 0.1% of data.

Collaborative filtering works by finding similar users (or items) and using their interactions to make predictions. Matrix factorisation decomposes the sparse user-item matrix into two dense lower-rank matrices: a user embedding matrix and an item embedding matrix. Each user and each item is represented as a dense vector in a shared latent space. The predicted rating for any user-item pair is the dot product of their embeddings. This allows generalisation to unseen pairs — users and items that have never interacted but have similar embeddings will have a high predicted dot product.

Alternating Least Squares (ALS) is the standard algorithm for implicit feedback data (clicks, watches, purchases — you know what people did, not how much they liked it). SVD++ extends matrix factorisation to incorporate additional signals (the set of items a user has interacted with, regardless of rating).

The two-tower model is the dominant production architecture. Two separate neural networks — one for users, one for items — each produce a dense embedding. Training: pairs of (user, item) interactions are positive examples; random non-interacted items are negative examples. The model learns embeddings that make positive pair dot products high and negative pair dot products low. At serving time, the item embeddings are pre-computed and stored in a vector database, enabling fast approximate nearest-neighbor retrieval.`,

  pre_flight: `Download the MovieLens dataset (the 1M or 25M version). Understand the interaction matrix: rows are users, columns are movies, values are ratings (1-5) or 0 if unrated. Know that implicit feedback data uses 1 for interaction and 0 for no interaction — you do not know if 0 means "disliked" or "never encountered." Install implicit (for ALS on implicit data) or use sklearn's SVD approximation.`,

  mastery_questions: [
    `You train a matrix factorisation model with 50 latent factors. Each user and each movie is now a vector in R^50. What does a latent factor represent? There is no guaranteed interpretation for latent factors — they are not directly interpretable the way logistic regression coefficients are. Empirically, some factors correlate with interpretable concepts: one factor might separate action movies from dramas, another might separate blockbusters from art house films. You can investigate by looking at the movies with the highest values on a given factor. But the model does not guarantee interpretable factors — it finds the mathematical decomposition that best explains the observed ratings, whatever that decomposition captures.`,

    `You want to recommend movies to a new user who has just signed up. They have made no interactions yet. How does your collaborative filtering model handle this? This is the cold start problem. Matrix factorisation cannot produce embeddings for a user it has never seen. Solutions: (1) Ask the user to rate 5-10 seed movies during onboarding — start with enough interactions to produce an embedding. (2) Use a fallback: recommend globally popular or editorially curated content. (3) Use content-based features (demographics, stated preferences) to initialize the user embedding, then refine with interactions. The cold start problem is structural to collaborative filtering — it requires interaction data that does not exist for new users.`,

    `In the two-tower model, the item tower's embeddings are pre-computed at inference time. What does this enable and what does it constrain? Pre-computed item embeddings enable fast retrieval: you can store all item embeddings in a vector database and use ANN search to find the top-k most similar items to a user's embedding in milliseconds. This scales to 100 million items. The constraint: item embeddings are static until you re-run the item tower on all items and refresh the vector database. If item features change frequently (a movie's recency changes daily, its popularity changes hourly), the pre-computed embeddings become stale. For slowly-changing item features, daily or weekly refresh is fine. For fast-changing features, you need a more dynamic architecture.`,

    `You use implicit feedback (binary: watched or not watched) to train ALS. A user has watched 3 movies in 6 months. The model produces an embedding for them. How reliable is this embedding? Very unreliable. Three interactions is not enough to identify the user's latent preferences — the embedding is dominated by the popularity bias (the watched movies are probably popular with everyone). The user's embedding will be close to the centroid of all users with little personalisation. This is why recommendation quality improves dramatically as users interact more. Set a minimum interaction threshold (e.g., 20 interactions) before personalising; use popularity-based or content-based recommendations below that threshold.`,

    `You evaluate your recommender with Precision@10: for each user, you recommend 10 movies, and you measure what fraction of those 10 were actually watched (in a held-out test set). You get Precision@10 of 0.12. Is this good? Context matters. A random recommender would give Precision@10 of roughly 0.001 (assuming 0.1% of movies are relevant). Your 0.12 is 120x better than random, which is excellent. But compare to the production baseline (the previous recommender) and consider the item catalog size. Also report Recall@10 (what fraction of each user's test-set watches were in your top-10) and NDCG@10 (which accounts for the position of relevant items in the top-10, giving higher score for relevant items ranked higher).`,
  ],

  common_mistakes: [
    `Evaluating on randomly held-out ratings rather than temporally held-out ratings. If you randomly hold out 20% of ratings across all time, your training set includes future interactions. Use a temporal split: train on interactions before a date, evaluate on interactions after that date. This is how the model will actually be used.`,

    `Not accounting for exposure bias in evaluation. You can only measure whether a user liked something they saw. If certain items are recommended more often (popular items, editorially promoted items), the training data has more signal for those items. Models trained on biased exposure data will recommend popular items more than their true quality deserves.`,

    `Treating all non-interactions as negative. In implicit feedback, a 0 means the user has not interacted with the item — it does not mean they would dislike it. ALS and two-tower models handle this by weighting negative samples differently from positive samples, and by not treating all unseen items as equally negative. Ignoring this subtlety leads to models that over-penalise potentially relevant items the user simply has not seen.`,

    `Building a recommender system without thinking about diversity. A model optimised purely for predicted engagement will recommend more of the same — if a user likes action movies, recommend only action movies. Production recommenders include diversity constraints: a top-10 list should include items from multiple genres, different recency ranges, and a mix of familiar and novel items.`,

    `Not measuring serendipity alongside accuracy. A recommender that surfaces items the user would have discovered anyway without the system is less valuable than one that surfaces unexpectedly relevant items. Serendipity is hard to measure offline but worth tracking through user studies.`,
  ],

  debug_help: `The most common collaborative filtering failure mode is popularity bias: the model recommends only the most popular items to every user, regardless of their preferences. Diagnostic: look at the distribution of items in your recommendations across all users. If the top 100 most popular items account for 80%+ of all recommendations, you have a popularity collapse. Fix: add a popularity penalty to your scoring function, enforce diversity in the final ranking step, or train with a negative sampling strategy that over-samples popular items as negatives to counterbalance their dominance.`,

  ai_assist: `Use Claude to help you design the negative sampling strategy for your two-tower model training. Describe the training data (user-item interaction pairs) and ask it to compare: random negatives, popularity-weighted negatives, and in-batch negatives (treating other items in the batch as negatives). Ask it to explain the bias-accuracy tradeoff for each strategy. Use the explanation to make an informed choice for your experiment.`,

  stretch: [
    `Add a re-ranking step after your collaborative filtering model: take the top-50 candidate items from ANN search and re-rank them using a linear combination of predicted engagement score, item recency, and item diversity score. Measure whether re-ranking improves your evaluation metrics.`,
    `Implement item cold start using content features: for new movies (no interaction data), produce embeddings from their metadata (genre, cast, director, plot embeddings from a language model). Insert these content-based embeddings into the item vector database alongside the learned embeddings for established movies.`,
    `Build an A/B test infrastructure for your recommender: split users 50/50 between your ALS model and a simple popularity baseline. Log which recommendation each user saw and whether they interacted with it. Run for two weeks and compute the statistical significance of the engagement difference.`,
  ],
});
