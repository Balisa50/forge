import { rewriteWeek } from "../rewrite-week";

// ml-engineering W11-W15

rewriteWeek("ml-engineering", 11, {
  context: `The Transformer architecture is the most consequential invention in machine learning of the last decade. It replaced recurrent networks for sequence modelling, underpins every large language model, and has expanded into vision, audio, protein structure prediction, and code generation. Understanding how it works — not at a hand-wavy level but mechanically — is now fundamental knowledge for ML engineers.

Tokenisation is the first step. Text is not processed as characters or words but as subword units called tokens. BPE (Byte Pair Encoding) — used by GPT models — starts with individual characters and iteratively merges the most common adjacent pairs. The vocabulary of ~50,000 tokens represents both common whole words and common subword units, allowing the model to handle rare words by decomposing them. Tokens are not words and not characters. "unhappiness" might become ["un", "happiness"] or ["unhap", "piness"] depending on the tokeniser.

Self-attention is the core mechanism. For each token in the sequence, it computes a weighted sum over all other tokens' values, where the weights are determined by how relevant each other token is to the current one. The relevance is computed as the dot product between the current token's query vector and each other token's key vector. This is scaled by 1/sqrt(d_k) to prevent the dot products from becoming too large for large dimensions, then softmaxed to produce attention weights. The output is a weighted sum of value vectors.

The transformer's power comes from parallel computation across all tokens simultaneously (unlike RNNs which process sequentially) and from the ability to build rich context-dependent representations. "bank" near "river" gets a different representation than "bank" near "deposit" — the self-attention mechanism encodes this contextual disambiguation.

BERT uses bidirectional attention — each token attends to all other tokens in both directions. This makes it powerful for understanding tasks (classification, NER, QA) but not for generation. GPT uses causal (masked) attention — each token only attends to previous tokens. This makes it an autoregressive language model capable of generation but less powerful for tasks that require seeing the full sequence before answering.`,

  pre_flight: `Install transformers from HuggingFace. Know how to use tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased') and model = AutoModel.from_pretrained('bert-base-uncased'). Understand the output: BERT returns last_hidden_state of shape (batch_size, sequence_length, hidden_dim). The [CLS] token's representation (index 0) is used for classification tasks. Know what masked language modelling is: BERT's training objective.`,

  mastery_questions: [
    `You tokenise the word "unhappiness" with a BERT tokeniser. It becomes ["un", "##happi", "##ness"]. The ## prefix means what, and how does this affect your downstream model? The ## prefix indicates a subword that continues from the previous token — it should not be preceded by a space. For a token classification task (NER, POS tagging), you need to map predictions back from subword tokens to original words. The standard approach: make predictions for the first subword of each word and ignore the continuation tokens. For sentence-level tasks (classification, similarity), use the [CLS] token representation which aggregates the full sequence.`,

    `In self-attention, why is the dot product scaled by 1/sqrt(d_k)? For large d_k (the dimension of the query/key vectors, typically 64 per head), the dot products between queries and keys can become very large in magnitude. When these large values are passed through softmax, the gradient becomes very small (the softmax is in a near-saturated regime). This is the vanishing gradient problem applied to attention. Scaling by 1/sqrt(d_k) keeps the dot products in a moderate range where the softmax has reasonable gradients.`,

    `Your transformer model has 12 attention heads. What does each head learn and why have multiple heads? Each head can learn a different type of relationship between tokens. Empirically: some heads learn syntactic relationships (subject-verb agreement), some learn semantic similarity (synonym relationships), some learn positional patterns (adjacent token relationships). Multi-head attention allows the model to attend to information from multiple "representation subspaces" simultaneously. The outputs of all heads are concatenated and projected back to the model dimension.`,

    `You want to use a pretrained BERT model for sentiment analysis. What do you add and what do you train? Add a linear layer on top: nn.Linear(768, 2) for binary sentiment. Train two things: (1) the new classification head from scratch (large learning rate: 1e-3), (2) optionally fine-tune the BERT weights (very small learning rate: 2e-5). The fine-tuning adapts BERT's general language understanding to your specific domain and task. Without fine-tuning the BERT weights, you use BERT only as a static feature extractor — which works but is usually worse than full fine-tuning.`,

    `What is the key difference between BERT-style models and GPT-style models that makes them suitable for different tasks? BERT uses bidirectional attention: the representation of each token is influenced by both preceding and following tokens. This is powerful for understanding (the model sees the full context before producing a representation) but prevents generation (you cannot autoregressively generate tokens if each depends on future ones). GPT uses causal attention: each token only attends to previous tokens. This enables generation — generate token 1, condition token 2 on token 1, generate token 2, etc. But for classification, BERT typically wins because full bidirectional context provides richer representations for each token.`,
  ],

  common_mistakes: [
    `Not padding sequences to the same length within a batch. Transformers require same-length sequences in a batch. The tokenizer handles this automatically if you set padding=True and truncation=True. Use the tokenizer's output attention_mask to prevent the model from attending to padding tokens.`,

    `Using the wrong learning rate for fine-tuning. Too high (1e-3 for the BERT weights) causes catastrophic forgetting — the pretrained weights are overwritten. Too low (1e-7) means the model barely learns from your task data. Use 2e-5 to 5e-5 for BERT fine-tuning — these rates are well-established for transformer fine-tuning.`,

    `Not using the attention mask during fine-tuning. The model.forward() call accepts an attention_mask argument. Without it, the model attends to padding tokens, which adds noise to the representation. Always pass attention_mask=batch['attention_mask'].`,

    `Fine-tuning on a very small dataset (fewer than 500 examples) without monitoring for overfitting. Transformer models are large and can overfit small datasets quickly. Use early stopping, dropout, and weight decay. Consider freezing the lower BERT layers and only fine-tuning the top few.`,

    `Interpreting individual attention weights as explanations for predictions. Research has shown that attention weights do not reliably reflect which tokens "caused" the prediction. Use gradient-based methods (Integrated Gradients, SHAP for transformers) for attribution, not attention weights.`,
  ],

  debug_help: `The most common HuggingFace fine-tuning error is "ValueError: You have to specify either input_ids or inputs_embeds." This means you forgot to unpack the tokenizer's output when passing it to the model. The tokenizer returns a dict: \`{'input_ids': ..., 'attention_mask': ..., 'token_type_ids': ...}\`. Pass it as: \`model(**tokenizer_output)\` or explicitly: \`model(input_ids=..., attention_mask=...)\`. Do not try to pass the dict directly as a positional argument.`,

  ai_assist: `Use Claude to help you understand the matrix dimensions at each step of a self-attention computation. Give it the configuration: batch_size=2, sequence_length=10, d_model=512, n_heads=8. Ask it to trace the shape of Q, K, V matrices, the attention weight matrix, and the final output. This dimensional analysis is the clearest way to understand what is happening inside each attention head.`,

  stretch: [
    `Visualise attention patterns in a fine-tuned BERT model using BertViz. Load a pretrained model, run it on a few sentence pairs, and visualise which tokens attend to which. Identify at least one head that appears to learn a syntactic pattern.`,
    `Compare a fine-tuned BERT model against a TF-IDF + logistic regression baseline on a text classification task of your choice. Measure: accuracy, training time, inference time, model size. Document when TF-IDF is actually good enough.`,
    `Implement a simple language model using the GPT-2 architecture from scratch (using PyTorch MultiheadAttention and a causal mask). Train it on a small text corpus (5MB). Generate text by sampling from it. This is the exercise that makes the architecture concrete.`,
  ],
});

rewriteWeek("ml-engineering", 12, {
  context: `Generative modelling is the branch of ML concerned with learning the data distribution rather than a mapping from inputs to labels. Once you have learned the distribution, you can sample from it to generate new data, interpolate between existing examples, or detect anomalies as low-likelihood samples. The progression from autoencoders to VAEs to GANs to diffusion models represents increasingly sophisticated ways to model and sample from complex data distributions.

An autoencoder compresses data into a low-dimensional latent representation (encoding) and then reconstructs the original data from that representation (decoding). The bottleneck forces the encoder to retain the most essential information. Autoencoders learn useful representations for downstream tasks: anomaly detection (high reconstruction error = anomaly), denoising (train to reconstruct clean from noisy inputs), and feature extraction. The limitation: the latent space has no structure that makes it easy to sample from.

Variational autoencoders add probabilistic structure. Instead of encoding each input to a point in latent space, the encoder produces a distribution (Gaussian, parameterised by mean and variance). The decoder samples from this distribution. The training objective has two terms: reconstruction loss (how well the decoder reconstructs the input) and KL divergence (how close the encoder's distribution is to a standard normal). The KL term forces the latent space to be regularised — similar inputs are near each other, and sampling from the prior (N(0,1)) produces plausible outputs.

Generative Adversarial Networks take a different approach. Two networks train simultaneously: the generator produces fake data, the discriminator tries to distinguish real from fake. The generator tries to fool the discriminator; the discriminator tries not to be fooled. This adversarial dynamic, when it works, produces extremely sharp, realistic outputs. When it does not work, you get mode collapse (the generator produces only a few types of outputs) or training instability.

Diffusion models are the current state of the art for image generation. They learn to reverse a process of progressively adding Gaussian noise. Training: add noise to images in small steps. Learning: train a model to predict and remove the noise at each step. Sampling: start from pure noise and iteratively denoise. The key insight: denoising is a well-defined supervised task, making diffusion models more stable to train than GANs.`,

  pre_flight: `Have PyTorch and torchvision installed. Choose a dataset for generative modelling: MNIST (simple, good for learning), CelebA (faces, more complex), or a custom dataset of images you care about. Understand the ELBO (Evidence Lower BOund): the VAE training objective. Know that the reparameterisation trick allows backpropagation through a sampling operation by parameterising z = mu + epsilon * sigma where epsilon ~ N(0,1).`,

  mastery_questions: [
    `You train a VAE on MNIST and the reconstruction loss converges well but the generated samples (sampled from the prior) look blurry and unrealistic. What is the likely cause? The KL term is being ignored — the model is converging to a standard autoencoder where the latent space is not regularised. This is called "posterior collapse" or KL vanishing. Causes: the KL weight is too high (anneal KL weight from 0 to 1 during training), the decoder is too powerful (it can reconstruct without using the latent space). Fix: add KL annealing — start training with reconstruction loss only, then gradually increase the KL term weight over the first 50 epochs.`,

    `Your GAN training is unstable. The discriminator loss drops to near zero quickly and the generator loss diverges. What is happening? The discriminator has become too powerful — it can perfectly distinguish real from fake, leaving the generator no useful gradient signal. The generator loss diverges because it is trying to fool a perfect discriminator, which is impossible. Fixes: reduce the discriminator's capacity (fewer layers or filters), add label smoothing to the discriminator (use 0.9 instead of 1.0 for real labels), add noise to discriminator inputs, or use a different GAN objective like WGAN-GP which provides more stable gradient signal.`,

    `Explain the reparameterisation trick and why it is necessary for training VAEs. The VAE encoder outputs mu and log_var (the parameters of a Gaussian distribution). To get a latent sample z, you sample from N(mu, sigma). Sampling is a stochastic operation — gradients cannot flow through it. The reparameterisation trick: sample epsilon from N(0,1) (a fixed distribution with no learned parameters), then compute z = mu + epsilon * exp(log_var / 2). Now z is a deterministic function of mu, log_var, and epsilon. Gradients can flow through mu and log_var back to the encoder. The randomness is in epsilon, which has no parameters to differentiate.`,

    `You want to use a VAE for anomaly detection in manufacturing images. How does this work? Train the VAE on normal (non-defective) product images only. The VAE learns to reconstruct normal images well. At inference: pass a new image through the VAE and measure reconstruction error. Normal images (similar to training data) have low reconstruction error. Defective images (different from training data) have high reconstruction error because the model learned the normal distribution and cannot reconstruct anomalous patterns well. Set a threshold on reconstruction error to classify images as normal or anomalous.`,

    `You want to generate new faces by interpolating between two real faces. How do you do this with a VAE? Encode both faces to their latent distributions: z1_mu, z1_logvar and z2_mu, z2_logvar. Take the mean vectors z1_mu and z2_mu (not samples — using the mean gives the most representative latent point for each face). Interpolate linearly between them: z_t = (1-t) * z1_mu + t * z2_mu for t in [0, 1]. Decode each z_t. The resulting images should smoothly transition between the two faces. This works because the VAE regularises the latent space to be smooth — nearby latent points decode to similar, valid-looking images. GANs do not have this property by default.`,
  ],

  common_mistakes: [
    `Training a GAN without monitoring both discriminator and generator loss independently. If the discriminator wins early, training collapses. Track both losses on separate plots. Healthy GAN training shows both losses fluctuating in a narrow range rather than one steadily decreasing.`,

    `Not normalising images to [-1, 1] for GAN training. GANs with Tanh output in the generator expect images in [-1, 1] range. Using [0, 1] normalisation causes a distribution mismatch between real and generated images that destabilises training.`,

    `Setting the KL weight too high from the start of VAE training. A KL weight that is too large penalises any deviation from the prior so heavily that the encoder collapses — it learns to always output N(0,1) regardless of input. Start the KL weight at 0 and anneal.`,

    `Expecting diffusion models to be fast at inference without understanding the sampling cost. Diffusion models require hundreds of denoising steps at inference. DDPM with 1000 steps takes minutes to generate one image on CPU. DDIM and other fast samplers reduce this to 50-100 steps. For real-time applications, diffusion models require specialised acceleration.`,

    `Evaluating generative model quality only visually. Visual inspection misses systematic failures. Use FID (Fréchet Inception Distance) to measure the distributional distance between real and generated images. FID requires computing Inception features for a large sample of real and generated images — impractical for small experiments but important for reporting final results.`,
  ],

  debug_help: `The most frustrating GAN failure is mode collapse: the generator produces nearly identical images regardless of the noise input, while the discriminator loss stabilises. The generator found one mode of the real distribution that consistently fools the discriminator and stopped exploring. Diagnostic: generate 100 images and compute pairwise pixel similarity. If most pairs have similarity above 0.9, mode collapse has occurred. Fixes: use minibatch discrimination (the discriminator sees multiple samples at once and penalises identical samples), use spectral normalisation on the discriminator, or switch to WGAN-GP.`,

  ai_assist: `Use Claude to help you debug your VAE training by describing the loss curves you observe. Share: what the reconstruction loss is doing over epochs, what the KL term is doing, what generated samples look like qualitatively. Ask it to diagnose whether you are seeing posterior collapse, KL annealing issues, or underfitting. Loss curve patterns in VAEs are diagnostic — Claude can help you read them while you build intuition.`,

  stretch: [
    `Implement conditional generation in your VAE: add the class label as an additional input to both encoder and decoder. For MNIST, this lets you generate images conditioned on a specific digit. Compare conditional generation quality to unconditional.`,
    `Implement a simple DCGAN (Deep Convolutional GAN) on MNIST or CIFAR-10. Train for 50 epochs and visualise generated samples every 5 epochs. Document the progression from noise to recognisable images.`,
    `Implement a 1D diffusion model that learns to generate a simple 1D signal (a sine wave with random phase). The reduced complexity makes the training dynamics easier to study. Plot the progressive denoising at inference time.`,
  ],
});

rewriteWeek("ml-engineering", 13, {
  context: `You have now trained many models. How many of those experiments can you reproduce? How many times did you change the learning rate or the number of layers and forget which combination produced the best result? Experiment tracking is the practice of systematically recording what you tried, what it produced, and how to reproduce it. Without it, ML development is archaeology — you dig through notebooks and git blame to reconstruct decisions made weeks ago.

Weights & Biases (wandb) and MLflow are the two dominant experiment tracking tools. Both let you log hyperparameters, metrics (loss, accuracy, any custom number), artifacts (model files, plots, datasets), and environment information (Python version, library versions, git commit). Both provide a web interface for comparing runs. The practical difference: wandb is hosted and has a polished UI; MLflow is open-source and self-hostable, which matters when your data cannot leave your infrastructure.

What to track per experiment: the code version (git commit hash), the exact dataset version (not the filename — the hash of the data, or a pointer to a versioned data artifact), every hyperparameter (not just the ones you changed — all of them), every metric at every epoch, the model artifact at the end, and the training environment. If any of these is missing, you cannot fully reproduce the experiment.

The mental model shift is from "notebooks" to "runs." Each training job is a run. Each run has a unique ID, a set of recorded inputs (hyperparameters, data), and a set of recorded outputs (metrics, artifacts). A project groups related runs. You compare runs in a table to see which configuration performed best. You compare runs in charts to see how loss curves differed. This replaces the pattern of "I think that one notebook was the best, let me check."

Artifact versioning extends tracking to data and models. If you retrain on new data, you need to know which model was trained on which data version. MLflow Models and wandb Artifacts both provide this — you store each dataset and model as a versioned artifact with a name and version number. A model registered as "flightwise-v3" has a provenance chain: which data version it trained on, which hyperparameter run produced it, which code version generated it.`,

  pre_flight: `Install wandb (\`pip install wandb\`) and authenticate with \`wandb login\`. Alternatively, install mlflow. Have a training script from a previous week ready to instrument. Know that wandb.init(project="my-project", config=hyperparams) starts a run and wandb.log({"loss": loss, "accuracy": acc}) logs metrics. Know that MLflow uses mlflow.start_run() as a context manager and mlflow.log_param, mlflow.log_metric for logging.`,

  mastery_questions: [
    `You run 20 experiments over three days. On day four, you want to reproduce the best run. What information do you need and where is it stored? You need: (1) the git commit hash of the code at that run's time — stored in the wandb run metadata, (2) the exact hyperparameters — stored in the run's config, (3) the data version — stored as an artifact reference if you logged it, or in the run's config if you log data paths/hashes, (4) the environment — Python version, package versions (stored in requirements.txt or as a wandb artifact). With all of this, you can check out the git commit, recreate the environment, and reproduce the run. Without any one of these, reproduction is uncertain.`,

    `Your wandb dashboard shows two runs with identical hyperparameters but different validation loss: 0.42 vs 0.51. You did not change the code. What could cause this difference? Randomness from sources you did not control: random weight initialisation (torch.manual_seed not set), random data shuffling (DataLoader without generator with fixed seed), data augmentation randomness. Any source of randomness that is not seeded produces different results on each run. Fix: set all random seeds at the start of your training script: torch.manual_seed(42), numpy.random.seed(42), random.seed(42), and if using PyTorch: torch.backends.cudnn.deterministic = True.`,

    `You want to log a matplotlib plot (your confusion matrix) to wandb at the end of training. How? \`wandb.log({"confusion_matrix": wandb.Image(plt)})\` after creating the plot with matplotlib. wandb.Image accepts a PIL image, a numpy array, or a matplotlib figure. Alternatively, use wandb's built-in confusion matrix visualization: \`wandb.log({"conf_mat": wandb.plot.confusion_matrix(y_true=y_true, preds=y_pred, class_names=class_names)})\`. The built-in version is interactive in the UI.`,

    `MLflow has a Model Registry. What does it do and why do you need it beyond just logging model artifacts? The model registry is a catalogue of production-ready models with lifecycle management. A model artifact (logged during training) is just a file. A registered model has: a name, multiple versions, and lifecycle stages (Staging, Production, Archived). Transitioning a model from Staging to Production via the registry is an explicit, auditable action. Your serving infrastructure can query the registry for the "Production" version of "flightwise" without hardcoding a model path. When you update the production model, you register a new version and transition it — the serving infrastructure automatically picks it up.`,

    `You are running hyperparameter sweeps with wandb Sweeps. You define a search space and an optimisation strategy (Bayesian). Wandb runs 20 trials. How is this different from Optuna? Wandb Sweeps and Optuna are functionally similar for hyperparameter optimisation — both support Bayesian search and can parallelise trials across multiple machines. The key difference is integration: wandb Sweeps are deeply integrated with wandb logging, so every trial is automatically tracked as a wandb run with all metrics and artifacts. Optuna requires you to manually log to wandb inside the objective function. If you are already using wandb for experiment tracking, wandb Sweeps require less configuration. If you need more sophisticated search algorithms (multi-objective, pruning), Optuna provides more control.`,
  ],

  common_mistakes: [
    `Logging only the final metric, not the per-epoch metrics. The training curve is as important as the final value. Log at every epoch. This lets you see whether a model was still improving when training stopped, or whether it had already converged.`,

    `Not logging the data version. If you retrain on updated data and your results change, you need to know whether the change came from the new data or from a code change. Log the data file hash or a data version string as a run hyperparameter.`,

    `Treating experiments as throw-away. The experiments that failed are as valuable as the ones that succeeded. They tell you what does not work, which reduces the search space for future experiments. Keep all runs, tag them clearly, and write notes in the run description about what you learned.`,

    `Running experiments without a consistent evaluation metric. If different runs evaluate on different test sets or use different metrics, comparisons are invalid. Define the evaluation protocol before running any experiments and apply it consistently.`,

    `Not using wandb.finish() at the end of the script. Without explicit finish, the run may be marked as "crashed" in the UI even if training completed successfully. Always call wandb.finish() at the end of your training script.`,
  ],

  debug_help: `The most common wandb issue is "Run not appearing in the dashboard" after a training script completes. Usually: the run was not initialised correctly (wandb.init() was never called), the internet was unavailable during the run (wandb runs offline and syncs later — run \`wandb sync\` to push offline runs), or wandb.finish() was not called and the run is in a "running" state that the UI shows separately. Check the wandb directory in your project folder: runs are stored there locally before syncing.`,

  ai_assist: `Use Claude to help you write the MLflow experiment tracking instrumentation for your FlightWise training script. Describe the hyperparameters you use, the metrics you compute, and the model artifacts you save. Ask it to generate the MLflow logging code. Review and understand every log call before using it — each logged metric becomes searchable and filterable in the MLflow UI.`,

  stretch: [
    `Set up a wandb Sweep for hyperparameter optimisation of FlightWise. Define the search space, run 20 trials, and compare the sweep results against your earlier manual Optuna tuning. Did the wandb Sweep find a better configuration?`,
    `Implement model versioning with MLflow Model Registry: register your best FlightWise model as version 1, retrain with updated data to produce version 2, transition version 2 to Production, and update your Flask serving code to load from the registry rather than a hardcoded file path.`,
    `Build a training reproducibility test: given a wandb run ID, write a script that retrieves the run's hyperparameters, loads the exact data version, sets all random seeds, and re-runs training. Verify that the reproduced run achieves the same final validation loss within 0.001.`,
  ],
});

rewriteWeek("ml-engineering", 14, {
  context: `A GPU is a massively parallel processor with thousands of cores optimised for the matrix multiplications that underpin deep learning. Using one effectively requires understanding its memory model, its programming constraints, and the tradeoffs between batch size, precision, and throughput. This week you take a training loop that ran on CPU and run it on a GPU, then go further: mixed precision training and gradient accumulation to train models that would otherwise not fit.

GPU memory is the binding constraint. A single A100 has 40-80GB. A GeForce RTX 4090 has 24GB. Your model weights, activations (intermediate computations kept for the backward pass), gradients, and optimizer states all compete for this memory. For a large model in full float32 precision: a 100M parameter model uses 400MB for weights, 400MB for gradients, and 800MB for Adam optimizer states (two moment estimates per parameter) — 1.6GB before any activations. Activations scale with batch size and sequence length.

Mixed precision training uses float16 or bfloat16 for most computations and float32 only where needed for numerical stability. The practical effect: roughly 2x throughput (tensor cores on modern GPUs are optimised for 16-bit), 2x memory reduction for activations, and little to no quality loss when done correctly. PyTorch's automatic mixed precision (torch.cuda.amp) handles the details: the GradScaler prevents gradient underflow in float16, and autocasting handles the precision decisions.

Gradient accumulation simulates larger batch sizes without the memory cost. Instead of passing batch_size=128 samples through the model at once, you pass 16 samples, compute the loss, divide by 8, call backward(), then repeat 8 times before calling optimizer.step(). After 8 iterations, the accumulated gradients are equivalent to one batch of 128. The model update is identical; the memory peak is 1/8th.

Multi-GPU training with Distributed Data Parallel (DDP) is the next step when one GPU is not enough. DDP replicates the model on each GPU. Each GPU processes a different batch of data. After the backward pass, DDP all-reduces the gradients across all GPUs (summing them) and divides by the number of GPUs. Each GPU's optimizer step now uses the average gradient across all GPUs — equivalent to training with a batch size of num_gpus times the per-GPU batch size.`,

  pre_flight: `Confirm GPU access: \`nvidia-smi\` or \`torch.cuda.is_available()\`. If no GPU is available, use Google Colab (T4 GPU is free) for this week's exercises. Understand the difference between model size (weights), activation memory (scales with batch size and sequence/image size), and gradient memory (same as model size). Know that Adam optimizer requires 3x the model size in memory (weights + 2 moment buffers).`,

  mastery_questions: [
    `You increase batch size from 32 to 128 and GPU memory usage quadruples. Why? Activations (intermediate computations) are stored during the forward pass for use in the backward pass. For a batch of 32 images through a ResNet, each layer stores its output tensor. These activation tensors scale linearly with batch size — 128 images means 4x the activation memory. Model weights and gradients do not change with batch size. So large batch training is often memory-limited by activations, not model weights.`,

    `You implement mixed precision training with torch.cuda.amp. The training is faster but after 100 steps, you see "inf" in the gradient scaler's scale factor, then the scale drops dramatically. What is the GradScaler doing and why? The GradScaler detects gradient overflow (inf or nan values that occur in float16 due to limited dynamic range). When overflow is detected, the optimizer step is skipped (the parameter update is invalidated), and the scale factor is reduced by a factor (typically 2). When no overflow occurs for a set number of steps, the scale factor is gradually increased to maximise the dynamic range used for numerically stable gradients. This automatic scaling prevents gradient underflow (very small gradients in float16 that round to zero) and overflow (very large gradients that produce inf).`,

    `You implement gradient accumulation with accumulate_steps=8. Where exactly does optimizer.zero_grad() go in the training loop? Zero the gradients at the start of each accumulation sequence, not at the start of each mini-batch. Pseudocode: for i, (X, y) in enumerate(dataloader): loss = model(X, y) / accumulate_steps; loss.backward() [accumulate gradients]; if (i+1) % accumulate_steps == 0: optimizer.step(); optimizer.zero_grad(). The division by accumulate_steps is crucial — without it, the accumulated gradient would be the sum across all mini-batches rather than the average, and the effective learning rate would be multiplied by accumulate_steps.`,

    `DDP all-reduces gradients across GPUs after the backward pass. What does "all-reduce" mean operationally? All-reduce is a collective communication operation where each process (GPU) contributes a value, and after the operation, each process has the sum (or average) across all contributions. For gradients: each GPU computes gradients for its batch of data. After backward, DDP synchronises the gradient tensors — GPU 0's gradient for weight[0][0] gets summed with GPU 1's gradient for the same weight, and the total is divided by 2 (for 2 GPUs). After all-reduce, each GPU has the same averaged gradient and each GPU's optimizer step is therefore identical. This ensures all GPUs stay synchronised.`,

    `You want to profile your training loop to find the bottleneck between data loading, forward pass, and backward pass. How? Use PyTorch Profiler: wrap your training loop in \`with torch.profiler.profile(activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA]) as prof:\`. After profiling, call prof.key_averages() to see time spent in each operation. Common finding: on GPU, data loading is often the bottleneck (CPU cannot load and preprocess images fast enough to keep the GPU busy). Fix: increase DataLoader num_workers, pin memory with pin_memory=True, and use prefetching.`,
  ],

  common_mistakes: [
    `Forgetting to move the model to GPU before starting training. If model stays on CPU and input tensors are on GPU, you get a device mismatch error. Pattern: device = torch.device('cuda' if torch.cuda.is_available() else 'cpu'); model = model.to(device); in the training loop: X, y = X.to(device), y.to(device).`,

    `Using float16 (half precision) instead of bfloat16 on Ampere or newer GPUs. bfloat16 has the same dynamic range as float32 (8 exponent bits) but lower precision. float16 has higher precision but smaller dynamic range, making it more prone to overflow/underflow. If you have an A100 or RTX 3000+ series GPU, prefer bfloat16 for its stability. float16 is better for older GPUs (V100, T4) that lack native bfloat16 support.`,

    `Scaling the loss incorrectly in gradient accumulation. Divide the loss by accumulate_steps before backward, not after. If you forget to divide, the effective learning rate becomes accumulate_steps times higher than intended.`,

    `Not using scaler.unscale_(optimizer) before gradient clipping in mixed precision training. The GradScaler scales up the loss to prevent gradient underflow. Before clipping gradients to max_norm, you must unscale them back to their true magnitude. Otherwise you are clipping scaled gradients, which clips at the wrong magnitude.`,

    `Assuming DDP training is equivalent to single-GPU training with a larger batch. DDP changes the effective learning rate and the gradient noise characteristics. Often, linear scaling of the learning rate (lr * num_gpus) with warmup works, but this must be validated empirically rather than assumed.`,
  ],

  debug_help: `The most confusing GPU training error is CUDA OOM (out of memory) that occurs not at the start of training but mid-epoch. This usually means the model is accumulating memory during the epoch — either storing gradient history unnecessarily, keeping references to tensors that should be freed, or building a Python list of tensors across batches. Fix: check all places where you store tensors across loop iterations. Use .detach().cpu() when moving tensors off GPU. Use torch.cuda.empty_cache() between epochs if memory does not clear automatically (though this should not be necessary in a correct implementation).`,

  ai_assist: `Use Claude to help you write the mixed precision training wrapper for your existing training loop. Describe your current training loop structure (forward pass, loss computation, backward, optimizer step) and ask it to generate the torch.cuda.amp version with GradScaler. Verify that every element of the original loop appears in the AMP version, with the autocasting context manager and scaler wrapping in the right places.`,

  stretch: [
    `Benchmark your training loop at three precision levels: float32 (standard), float16 with GradScaler (AMP), and bfloat16. Measure: throughput (samples/second), memory usage, and final validation accuracy. Report all three tradeoffs.`,
    `Implement gradient checkpointing on a ResNet model: replace activations in the model's forward pass with torch.utils.checkpoint.checkpoint. Measure the memory reduction and the corresponding throughput penalty (since activations must be recomputed in the backward pass).`,
    `Set up a 2-GPU DDP training run using PyTorch's torchrun launcher. Train the same model on 1 GPU and 2 GPUs, measuring throughput scaling efficiency. Document what fraction of the theoretical 2x speedup is achieved and why perfect scaling is rarely reached.`,
  ],
});

rewriteWeek("ml-engineering", 15, {
  context: `Notebooks are for exploration. Production ML runs in scripts, pipelines, and version-controlled code. The transition from "works in a Jupyter notebook" to "reproducible, automated, reviewable" is where ML engineering diverges from data science. This week you build the infrastructure that makes your training reproducible, versioned, and automated: DVC for data versioning, a pipeline DAG, and a testing framework for ML code.

Data Version Control (DVC) handles the problem that git handles for code: tracking changes, enabling rollback, and synchronising across team members. The difference: ML datasets are gigabytes or terabytes — too large to commit to git. DVC stores the data in remote storage (S3, GCS, Azure Blob) and commits only a small .dvc pointer file to git. When a teammate clones the repo and runs dvc pull, they get the exact data version referenced in the pointer file.

Pipelines as DAGs (Directed Acyclic Graphs) are the architecture that makes ML workflows reproducible. Each step in the pipeline (data ingestion, preprocessing, feature engineering, training, evaluation) is a node. Edges represent dependencies. If the preprocessing output has not changed since the last run, the training step uses the cached result rather than re-running preprocessing. DVC stages define these dependencies declaratively: inputs, outputs, the command to run, and the dependencies between stages.

Idempotency is the property that running a step twice produces the same result as running it once. An idempotent pipeline can be safely retried after failure, run in CI without side effects, and shared with teammates who can reproduce any historical result. Achieving idempotency requires: fixed random seeds, version-pinned dependencies, deterministic data loading (fixed shuffle order), and no side effects outside the declared outputs.

Testing ML code is genuinely different from testing regular software. The model output is probabilistic — you cannot assert an exact output. Instead you test properties: the model's output shape is correct, the loss decreases over the first 10 training steps, the preprocessing preserves row counts, the feature engineering function produces the expected column set. Behavioural tests go one level higher: the model should score higher on clean data than on corrupted data, the model's performance should not degrade more than 2% when a single feature is removed.`,

  pre_flight: `Install dvc and dvc-s3 (if using S3 for remote storage). Understand the DVC workflow: dvc add data/raw (start tracking), git add data/raw.dvc, git commit, dvc push (upload to remote). Know the difference between a dvc stage (a step in the pipeline with declared inputs/outputs) and a dvc run (running a single command). Install pytest and understand basic test structure: test functions prefixed with test_, assertions with assert.`,

  mastery_questions: [
    `You add a new CSV file to your dataset directory and run dvc add data/. What happens and what gets committed to git? DVC computes the MD5 hash of the entire data directory, writes a data.dvc pointer file containing the hash and the remote storage path, and adds the data to the DVC cache (local). The actual data files are not committed to git — only the data.dvc file (a few hundred bytes). You git add data.dvc and git commit. When a teammate runs dvc pull, DVC reads the hash from data.dvc and downloads the exact files from remote storage. If the data changes, the hash changes, the pointer file changes, and git tracks that change.`,

    `You want to add a unit test for your feature engineering function. What do you test? (1) Output shape: assert transform(X).shape == (len(X), expected_num_features). (2) Column presence: assert 'is_weekend' in transform(X).columns. (3) Value range: assert transform(X)['DEP_HOUR'].between(0, 23).all(). (4) No NaNs introduced: assert not transform(X).isnull().any().any() — unless NaNs are expected in specific columns. (5) Idempotency: assert transform(transform(X)).equals(transform(X)) — running twice gives the same result. These tests catch the most common bugs in feature engineering: wrong column names, wrong shapes, introduced NaNs, non-idempotent transforms.`,

    `Your DVC pipeline has stages: raw_data -> preprocess -> features -> train -> evaluate. You change the preprocessing code. DVC detects that the preprocessing stage's dependency (the code file) has changed. Which subsequent stages need to rerun? All of them — preprocessing -> features -> train -> evaluate. Because the preprocessing output may have changed, all downstream stages that depend on it (directly or transitively) must rerun. DVC automatically determines this from the dependency graph. Stages that have unchanged inputs and unchanged code are skipped (cached result is used). This is the caching that makes pipelines efficient: you only rerun what actually needs to change.`,

    `You want to write a behavioural test that checks your model's predictions are sensible without knowing the exact expected output. What are three assertions you can make about a flight delay classifier? (1) Predictions are binary (0 or 1): assert set(model.predict(X)).issubset({0, 1}). (2) Predict_proba outputs probabilities that sum to 1: assert np.allclose(model.predict_proba(X).sum(axis=1), 1.0). (3) Flights on known high-delay routes should score higher than flights on known low-delay routes: assert model.predict_proba(high_delay_flights)[0][1] > model.predict_proba(low_delay_flights)[0][1]. These tests do not require ground truth — they verify the model's behaviour is consistent with domain knowledge.`,

    `Your CI pipeline runs the full DVC pipeline on every PR. It takes 45 minutes because model training takes 40 minutes. How do you make CI faster without removing model training from CI entirely? Split CI into two workflows: (1) a fast smoke test (runs in under 5 minutes) that tests preprocessing, feature engineering, and a 10-step training run on 1000 samples, (2) a full pipeline run that triggers only on PRs that change the training code, the model architecture, or the data. Tag PRs with [skip-full-train] to bypass the full run. The smoke test catches the most common bugs quickly. The full run validates model quality for changes that require it.`,
  ],

  common_mistakes: [
    `Committing data files directly to git instead of using dvc add. Git performance degrades with large binary files. More importantly, git does not provide the same content-addressed deduplication that DVC provides — two identical files in different commits are stored twice in git but once in DVC.`,

    `Not locking dependency versions in requirements.txt or environment.yaml. A pipeline that runs today with numpy 1.25 may fail next month with numpy 2.0 due to API changes. Pin all dependencies: numpy==1.25.2. Reproduce the environment exactly.`,

    `Writing tests only for the happy path. ML bugs often appear on edge cases: empty input, single-row input, features with all the same value, missing values in a column that is usually complete. Include these cases in your test suite.`,

    `Not running tests in CI. A test suite that developers run locally before committing is better than no tests. A test suite that runs automatically on every PR is better than one that depends on developers remembering. Always hook tests into CI.`,

    `Using absolute file paths in DVC stages. A DVC pipeline that references /home/abdoulie/project/data will not work on any other machine. Use relative paths everywhere. DVC stages should be portable.`,
  ],

  debug_help: `The most confusing DVC error is "pipeline stage is always run, never cached." DVC caches based on file modification times and hashes. If your code changes a file's modification time without changing its content (e.g., \`touch data/raw.csv\`), DVC may consider the stage outdated even though the content is the same. DVC uses content hashing by default — run \`dvc status\` to see exactly which files DVC considers changed and why. If a file appears changed but you did not modify it, check whether something in your environment is touching files unnecessarily.`,

  ai_assist: `Use Claude to help you design the DVC pipeline for your FlightWise project. Describe the stages (ingest, preprocess, feature engineer, train, evaluate) and ask it to write the dvc.yaml pipeline definition with explicit dependencies and outputs for each stage. Review the generated YAML carefully — the dependency declarations (deps) and output declarations (outs) must accurately reflect what each script reads and writes.`,

  stretch: [
    `Add data validation to the preprocessing stage using Great Expectations or Pandera: define a schema for the preprocessed data (expected column types, value ranges, null fraction limits), run validation after preprocessing, and fail the pipeline if the schema is violated.`,
    `Build a CI/CD pipeline with GitHub Actions that runs your DVC pipeline's smoke test on every PR and the full pipeline on every merge to main. Cache the DVC remote in GitHub Actions to avoid re-downloading unchanged data artifacts.`,
    `Implement a model performance regression test: after training, load the previous best model artifact and compare its test score against the new model. If the new model is more than 1% worse, fail the pipeline with an explicit error message.`,
  ],
});
