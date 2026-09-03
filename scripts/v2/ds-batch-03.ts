/**
 * v2 rewrite batch 3: data-science Weeks 13-17
 *  W13: Reddit Sentiment v0.2 — Hand-label + classical ML
 *  W14: A/B testing + experimentation
 *  W15: Reddit Sentiment v0.3 — Fine-tune DistilBERT
 *  W16: Model interpretability with SHAP
 *  W17: Synthetic data generation
 */

import { rewriteWeek } from "../rewrite-week";

// ─── W13 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 13, {
  context: `Last week you let a generic pretrained model label your 1000 Reddit posts. You probably already had a feeling some of those labels were wrong — the model trained on movie reviews has no idea that "this paper is fire" is positive in ML Twitter or that "thanks for the dataset" can be passive-aggressive depending on context.

This week you do something most online courses skip entirely: you hand-label your own gold set. You will read 200 posts, decide their sentiment yourself, save your labels to a CSV, and then use that gold set as the source of truth to evaluate every model from here on out. This is unglamorous, slow work — and it is exactly what separates a working data scientist from someone who pastes models together. Every serious NLP team at every serious company has gold sets. They are the bedrock.

Then you train your own classifier. Not a fancy one — a plain TF-IDF + logistic regression. The same workhorse that powered Gmail spam filtering until about 2017 and still beats fancier models on small datasets. By Friday you will compare three things: your hand labels (truth), the pretrained model from week 12 (the baseline), and your trained classifier (the challenger). The honest accuracy comparison is the deliverable.

Spoiler: your classical model might actually win on this domain, with 200 hand labels and good feature engineering. That outcome surprises people. It is also the reason classical NLP is still in production at most companies — when you have <10k labelled examples, simpler is often better. Knowing this saves you from defaulting to BERT for every problem.`,

  pre_flight: `Set a timer for 25 minutes. In that block, read 50 of your Reddit posts and label each one positive / negative / neutral in a CSV. Do not stop to look at the model's previous answer. Just decide what YOU think. Note the moments where you hesitate — those ambiguous posts are exactly the ones the model gets wrong, and writing down WHY a post is hard to label is the first step to better training data.`,

  mastery_questions: [
    `Hand-label 200 of your scraped posts. Save the labels to a CSV with columns post_id, your_label, confidence (1-3, how sure are you), notes (optional). Paste the head of the file. Now compute: what percentage did you mark "confidence 1" (low confidence)? Those low-confidence posts are the ones where reasonable humans would disagree — and they put a hard ceiling on how accurate any model can be. If 15% are genuinely ambiguous, no model can hit better than 85% accuracy. Knowing your ceiling is gold.`,
    `Use sklearn's TfidfVectorizer on the post text. ngram_range=(1,2) to capture unigrams and bigrams. Paste your vectorizer call. Run it on your training texts and paste X_train.shape. Why so many columns? (Each unique word/bigram becomes a feature — vocabulary is huge.) Now train a LogisticRegression on it with your hand labels. Paste your test accuracy.`,
    `Inspect the most predictive features for each class. For LogisticRegression, that means looking at the coefficients — the top 10 most positive coefficients for "positive" class are the words that most push a post toward "positive." Paste your top 10. Do they make sense? ("awesome", "love", "thanks" should be near the top.) Do any surprise you? (Maybe a specific technical term keeps showing up — that is your dataset talking.) This interpretability is exactly what BERT does NOT give you, and it is why analysts still love linear models.`,
    `Compare three accuracies on the SAME test set (your hand labels): pretrained Hugging Face model from week 12, your classical TF-IDF + LogReg, and majority-class baseline (always predict "neutral"). Paste all three numbers. The order is informative: if your classical beats pretrained, generic models do not transfer well to this domain. If majority-class is within 5 points of your classical, your model is not actually doing much beyond the obvious.`,
    `Pick 5 posts where your classical model and the pretrained model DISAGREE. For each, write one sentence about which one is right and why. Paste the analysis. This is real error analysis — looking at specific disagreements and reasoning from data. Senior data scientists do this for every model they ship.`,
  ],

  common_mistakes: [
    `Hand-labelling while looking at the model's previous label. You will unconsciously anchor to it and your "ground truth" becomes "agreement with the model." Cover the model's label column when labelling.`,
    `Not setting a random_state on train_test_split when comparing models. Different splits give different accuracies — both models need the exact same split to be comparable.`,
    `Using accuracy as the only metric on imbalanced data. If 70% of your posts are neutral, a model that always says "neutral" gets 70% accuracy. Also report precision, recall, and F1 per class.`,
    `Using TfidfVectorizer without removing stopwords or considering min_df. Without min_df=2 you end up with one-off vocabulary (typos, usernames) cluttering your feature space. Set min_df=2 or min_df=0.001 and watch your model improve.`,
    `Training on the full dataset and reporting training accuracy. The test accuracy is what matters — training accuracy can be 99% with a memorising model that fails on new data.`,
  ],

  debug_help: `Two common pain points. First: TF-IDF "no rows after filtering" error. That happens when your min_df is too high for the dataset size — drop it. Second: confusion when your model's classes do not align between training and test. Always check y_train.value_counts() and y_test.value_counts() and confirm both have all three classes. If "negative" is missing from one set, your classification report will look bizarre. The fix is stratified sampling: train_test_split(..., stratify=y) to preserve class balance.`,

  ai_assist: `Ask Claude to suggest 5 additional features beyond TF-IDF that might help for Reddit specifically (post length, has-question-mark, all-caps ratio, etc.). Then engineer 2 of them yourself and retrain. Do NOT ask Claude to label your gold set — you would be optimising for "agreement with Claude" instead of "agreement with truth," which defeats the entire purpose. The whole point of a human gold set is that it is human.`,

  stretch: [
    `Try CountVectorizer instead of TfidfVectorizer. Which works better on your data? The answer is "depends" and the comparison is educational.`,
    `Try a Linear SVC instead of LogReg. They often perform identically on text — but the differences in training time at scale are dramatic. Worth knowing.`,
    `Find one mislabelled post in your own hand labels (you will). Reading 200 posts in a sitting causes mistakes. The fact that this happens to you is exactly why production ML teams have multiple labellers per item and inter-annotator agreement metrics.`,
  ],
});

// ─── W14 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 14, {
  context: `You have been comparing models informally. Now you learn to do it with the rigour that gets results admitted into a court of evidence — or, more practically, into a product decision at a real company.

A/B testing is the discipline of comparing two versions of something — a model, a feature, a marketing email, a checkout flow — using statistical methods that tell you whether the observed difference is real or noise. Every major internet company runs hundreds of A/B tests at any given moment. Netflix tests thumbnails. Booking.com tests button copy. The data scientists who design these tests well are the most senior people in those organisations, because the cost of getting one wrong is a product decision based on noise.

You will run a real experiment this week: two different prompts feeding the same Hugging Face model on the same test set. Prompt A is your default. Prompt B is one you redesign with structured instructions. The question: does Prompt B actually produce better-aligned labels (against your hand-labelled gold set), or are the differences just random variation?

You will calculate the required sample size BEFORE running the test (using power analysis — most beginners skip this and end up with underpowered experiments). You will randomly assign posts to A or B (never both — that would taint the comparison). You will compute the lift (B's accuracy minus A's accuracy) and the p-value (probability of seeing this lift if there were no real difference). You will write the result in two ways: technical (for your team) and plain English (for a PM who has never run an experiment).

By Sunday you have a real experiment report. That document — even just one — is the artefact that proves to senior interviewers that you can be trusted with product decisions.`,

  pre_flight: `Pick the two prompts you will compare. Be honest with yourself: what is your prior belief about which one will win? Write it down. Most experimenters secretly want one variant to win and unconsciously bias their analysis toward it (called confirmation bias). Writing down your prior makes the bias visible — and once visible, it is much easier to resist.`,

  mastery_questions: [
    `Calculate the required sample size to detect a 5-percentage-point lift in accuracy with 80% power at alpha=0.05. Use a power analysis library (statsmodels.stats.power) or an online calculator. Paste the calculation. Why does this matter? Because if you only have 100 posts in your test set, you cannot reliably detect anything smaller than maybe a 15-point lift — and most real product changes are 1-3 point lifts. Underpowered experiments are how teams ship things that quietly do not work.`,
    `Randomly assign your test posts to variant A or variant B using random_state. Run each variant's prompt against the model. Paste the accuracy of each variant (compared to your hand labels). What is the raw lift (B - A)?`,
    `Run a chi-squared or two-proportion z-test on the result. Paste the p-value and a 95% confidence interval for the lift. If p < 0.05, B is significantly better. If not, the difference is within noise — you cannot conclude B is better. Write one sentence interpreting your specific number.`,
    `Translate your result into PM-readable English. Maximum 3 sentences. No statistics jargon. Example shape: "Prompt B produced labels that match human judgement 4.2 percentage points more often than Prompt A. This is statistically meaningful (we ran the comparison 1000 times and saw a difference this big or bigger less than 1% of the time by chance). Recommendation: use Prompt B going forward." Paste your version.`,
    `Write the experiment report: hypothesis, setup, sample size justification, results, decision, limitations. Maximum one page. Save it in your repo as experiment-01.md. Paste the file. This single document is more valuable than the experiment itself — it is proof you can think rigorously, which is the actual job.`,
  ],

  common_mistakes: [
    `Peeking at the result before the experiment finishes. "Variant B is winning, let's call it!" After 10% of the data, that lead is almost certainly noise. Either pre-register a stopping rule or wait for the full sample.`,
    `Running the experiment then deciding which metric to report. Pick the metric BEFORE you run, otherwise you will inevitably "discover" the metric that makes the result look best (called HARKing — Hypothesizing After Results are Known).`,
    `Not random-assigning. If A gets the first 500 posts (which happen to be from a specific subreddit timeframe) and B gets the next 500, the difference might be from the data, not the prompt. Always shuffle then split.`,
    `Calling 0.06 "marginally significant." It is not. The line is 0.05 by convention. Treat it as "we did not find a significant difference."`,
    `Forgetting to report effect size alongside p-value. With enough data, even a 0.1% lift is "significant." But nobody cares about a 0.1% lift in a product decision — practical significance matters as much as statistical significance.`,
  ],

  debug_help: `The most common surprise is "my variants get identical accuracy." That usually means the prompt change did not actually change the model's behaviour meaningfully — your variants are essentially the same. Print a sample of 5 predictions from each variant side-by-side. If they are identical, you need a more aggressive prompt change. If they differ but accuracy is the same, you might be in a case where one variant is right about a different set of posts but the same number total — interesting finding, worth investigating per-class.`,

  ai_assist: `Use Claude to critique your experiment design BEFORE you run it. Paste your hypothesis, sample size calculation, and randomisation strategy, and ask "what could go wrong with this experiment?" The catches it surfaces (selection bias, confounds, contamination) are the same ones senior researchers would catch in a design review. Do NOT use Claude to interpret your results — the interpretation is the value, and a model "interpreting" your data the way you wanted is not real interpretation.`,

  stretch: [
    `Run a SECOND experiment immediately after the first. Two prompts you thought were equivalent. Apply Bonferroni correction (divide alpha by number of tests). Notice how the threshold for significance shifts.`,
    `Calculate Cohen's d (effect size, not p-value) for your lift. Effect size is sample-size-independent and tells you whether the difference is large or small in standard-deviation terms. Senior reports always include effect size.`,
    `Read "The Garden of Forking Paths" (Andrew Gelman). 10 minutes of reading that changes how you think about every result you will ever see online.`,
  ],
});

// ─── W15 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 15, {
  context: `Classical models hit a ceiling. You probably saw it last week — TF-IDF + LogReg got you maybe 75% accuracy on Reddit posts, and adding features only crept it up another point or two. To get past that ceiling, you need a model that understands language as language, not just as a bag of words.

That is what transformers do. And the most famous, most fine-tunable, most-actually-used transformer for tasks like this is BERT — and its smaller, faster cousin DistilBERT, which is what you will fine-tune this week.

"Fine-tuning" is the practice of taking a large pretrained model (DistilBERT has 66 million parameters and was trained on the entire English Wikipedia plus a giant book corpus), and then continuing the training for a few epochs on your specific task with your specific data. The pretrained weights know English. You teach them sentiment on Reddit. The whole process takes about 15 minutes on a free Colab GPU. Six years ago, this would have required a research lab and weeks of compute. The fact that it now takes 15 minutes on free hardware is one of the genuine miracles of the last decade in ML.

By Sunday: a fine-tuned DistilBERT that beats your classical baseline on your hand-labelled test set. The model weights stored in your repo via Git LFS (because they are too big for vanilla git). And — most importantly — a written report explaining why this model is better, by how much, and what it cost in compute and accuracy ceiling.

Fair warning: this week involves Google Colab, which is occasionally flaky. Save often. Run on the free GPU tier. If you hit a "GPU not available" message, wait 10 minutes and retry — Colab cycles availability.`,

  pre_flight: `Open the Hugging Face model hub (huggingface.co/models). Search for "distilbert-base-uncased." Read the model card — specifically the "training data" section. Distilbert was trained on Wikipedia + BookCorpus, which is mostly clean prose. Your Reddit data is messy, casual, full of typos and abbreviations. Predict: will fine-tuning bridge that gap easily, or will you need a model already adapted to social media text (like Twitter-RoBERTa)? Write your prediction. Check it Sunday.`,

  mastery_questions: [
    `Open Google Colab, create a new notebook, and confirm you have GPU access (Runtime → Change runtime type → T4 GPU). Run !nvidia-smi to confirm. Paste the GPU model name. This is the same hardware that trained much of modern AI — and you are using it for free.`,
    `Convert your hand-labelled CSV into a Hugging Face Dataset object (from datasets import Dataset; Dataset.from_pandas(df)). Tokenize using DistilBertTokenizer. Paste the tokenization line and the first tokenized example. What does tokenization actually do? (Hint: splits text into subword units like "play" and "##ing," gives each a numeric ID.) Understanding tokenization is what makes BERT stop being mysterious.`,
    `Fine-tune DistilBERT on your training set for 3 epochs using the Trainer API. Paste the training loop / Trainer config. While it runs, watch the loss curve — it should drop, then start to plateau. If it goes UP, your learning rate is too high; reduce it from 5e-5 to 2e-5.`,
    `Evaluate the fine-tuned model on your test set. Paste the accuracy and macro F1. Compare against last week's classical baseline. By how much did DistilBERT win? Now compute the time cost (15 min of GPU vs minutes on CPU for the classical) — at what dataset size does the accuracy gain justify the compute and infra complexity?`,
    `Save the fine-tuned model with model.save_pretrained('./distilbert-reddit-sentiment'). Set up Git LFS (git lfs install + .gitattributes for *.bin and *.safetensors) and commit. Paste the GitHub URL where the model file is hosted. You have just published your own AI model. Other people can git clone it, load it, and use it. That is open-source ML.`,
  ],

  common_mistakes: [
    `Forgetting to .to('cuda') the model and the inputs. Training runs on CPU instead, takes 10x longer, you wonder why your Colab session crashed before finishing.`,
    `Training with the wrong number of labels. If your dataset has 3 classes (positive/negative/neutral) but you initialise the model with num_labels=2, training crashes confusingly.`,
    `Not stratifying the train/test split. If your test set ends up with no examples of one class, accuracy will look fine but the model is silently broken for that class.`,
    `Pushing the .bin model file directly to git without LFS. GitHub rejects files over 100MB. Set up Git LFS BEFORE the first commit, not after.`,
    `Overfitting because you ran too many epochs on a tiny dataset. Watch the validation loss — when it starts going up while training loss keeps dropping, you are overfitting. Stop training.`,
  ],

  debug_help: `Three pain points unique to this week. First: "RuntimeError: CUDA out of memory." Reduce batch_size in your TrainingArguments (try 8 then 4 then 2). DistilBERT fits comfortably in 16GB; if you are OOM, something else is wrong. Second: training runs but loss stays flat. Usually a learning rate problem — try 2e-5 instead of 5e-5. Third: Colab disconnects mid-training. Save checkpoints to Google Drive (mount your Drive at the start of the notebook) so a disconnect does not wipe progress. The fourth, less common: tokenizer and model from different checkpoints. ALWAYS load tokenizer and model from the same model_name to keep them aligned.`,

  ai_assist: `Use Claude to translate intuition into code. "I want to fine-tune DistilBERT on this dataset, what does a minimal Trainer setup look like?" gets you 80% there. The other 20% is the actual data prep and evaluation, which YOU must understand. Do NOT copy a Trainer config without reading every argument — the defaults change between Hugging Face versions and the subtle ones (warmup_steps, weight_decay, gradient_accumulation) matter for whether your model converges.`,

  stretch: [
    `Try a different base model — twitter-roberta-base-sentiment-latest (already trained on social media text). Fine-tune it on the same data. Does the social-media-trained base beat the Wikipedia-trained base? Worth knowing for any future social media work.`,
    `Push your fine-tuned model to the Hugging Face Hub (free). Now anyone in the world can pip install transformers and load YOUR model with from_pretrained("yourname/distilbert-reddit-sentiment"). That single act is what open-source ML actually looks like.`,
    `Plot the confusion matrix for your fine-tuned model. Where does it fail? Most likely on the neutral class — neutral is genuinely the hardest to detect. Knowing your model's weak class is essential before deployment.`,
  ],
});

// ─── W16 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 16, {
  context: `Your fine-tuned DistilBERT predicts "negative" for a post. Why? You do not know. Neither does anyone else, including the model's authors. That is a problem.

Black-box predictions are fine for low-stakes contexts (recommending a Netflix show), unacceptable for high-stakes ones (denying a loan, classifying a CV, flagging a post for moderation). The discipline of opening up that black box is called interpretability, and SHAP (SHapley Additive exPlanations) is the most-used tool for it. SHAP is rooted in cooperative game theory — it tells you, for any single prediction, exactly how much each input feature contributed to pushing the prediction toward each class. Sum of contributions = prediction. Math you can defend.

This week you instrument your week-15 model with SHAP. For each prediction, you can see which words mattered most. You will discover, predictably, that your model has biases — maybe it weights "transformers" toward positive (because most posts about transformers are excited), or "interview" toward negative (because interview posts skew complainy). You will find one such bias and document it in a BIASES.md file. That file — the willingness to admit your model has flaws and name them — is what a real ML practitioner produces. Pretending models are unbiased is what undergrads and bad consultants do.

Interpretability is also the bridge to non-technical stakeholders. You will be able to walk into a meeting, show a single prediction with its SHAP breakdown, and explain why the model thinks what it thinks — in 30 seconds, to a person who has never written code. That capability is one of the highest-leverage skills in the field right now.`,

  pre_flight: `Before running SHAP, pick three posts from your test set: one the model labelled correctly with high confidence, one labelled correctly with low confidence, and one labelled incorrectly. Predict (write down) what features you EXPECT to be most important for each prediction. We will check after SHAP gives the real answer. The gap between your intuition and SHAP's answer is exactly where bias lives.`,

  mastery_questions: [
    `Install SHAP and load your fine-tuned DistilBERT. Use the Transformers integration: shap.Explainer(model, tokenizer). Run it on one post and paste the SHAP values. Each token gets a score per class — positive scores push toward that class, negative away. Read the scores. Did the words you predicted match SHAP's answer? Where were you wrong?`,
    `Generate SHAP force plots for 5 specific posts: 2 confident correct, 2 confident wrong, 1 ambiguous. Save them as PNGs. Paste the filenames. The wrong predictions are the most informative — look at which words pushed the model toward the wrong class. Often it is a single dominant word the model has learned wrong.`,
    `Compute global feature importance: aggregate SHAP values across your whole test set. What are the top 20 most-influential words overall? Paste the list. Are there any words that surprise you? (E.g., a generic word like "the" should NOT be highly influential. If it is, your model is overfitting to noise.) Senior ML engineers always look at global importance before shipping.`,
    `Find ONE genuine bias in your model. Examples: it labels posts mentioning specific subreddits/usernames more positively, it over-weights all-caps as negative, it has a blind spot for sarcasm. Document the bias in a file called BIASES.md. Include: what the bias is, evidence (3 specific posts), why it probably exists (your data is biased? your task is genuinely hard?), and what you would do to fix it.`,
    `Translate one SHAP explanation into plain English for a non-technical reader. Format: "The model labelled this post negative because of the words 'frustrated' (-0.8) and 'broken' (-0.5), which pushed strongly toward negative. The word 'thanks' (+0.3) pushed slightly the other way but not enough to flip the prediction." Paste the explanation. This single skill — translating model internals into human language — is what makes you valuable in cross-functional meetings.`,
  ],

  common_mistakes: [
    `Reporting SHAP values without understanding the model. SHAP tells you which features the model relied on; it does NOT tell you which features are objectively important. A biased model gives biased SHAP — garbage in, explainable garbage out.`,
    `Treating SHAP as ground truth. SHAP is one of several attribution methods (others: LIME, integrated gradients) and they sometimes disagree. When two methods disagree, you have learned something interesting about model behaviour.`,
    `Skipping the visualisation step. SHAP's force plots are designed for non-technical readers. Use them. Tables of numbers do not convince anyone.`,
    `Documenting biases vaguely. "The model might be biased against certain users" is not useful. "The model rates posts containing the word 'beginner' 12% more negatively, probably because beginner-tagged posts in our training set were more often complaints — fix: rebalance or augment with positive beginner posts" — that is a useful bias report.`,
    `Running SHAP on too many examples (it is slow on transformers). Sample 100-500 from your test set; that is enough for stable global importance.`,
  ],

  debug_help: `SHAP-on-transformers can be slow and finicky. If you hit memory errors, reduce the explanation set size or use shap.maskers.Text instead of the default. If SHAP returns odd values (all-positive or all-negative), check that your model output matches what SHAP expects — for HuggingFace classifiers, you typically wrap the model in a function that returns the softmax probabilities, not raw logits. When in doubt, start with shap.Explainer on a tiny subset (5 posts) and verify the output makes intuitive sense before scaling up.`,

  ai_assist: `Use Claude to translate SHAP output into different audience-level explanations. "Take this SHAP output and explain it to (a) a senior data scientist, (b) a product manager, (c) my grandmother." Three audiences, three different versions, same underlying truth. That practice is gold for stakeholder communication. Do NOT ask Claude to "interpret what this model has learned" — that interpretation is YOUR job and the whole point of the week.`,

  stretch: [
    `Run LIME on the same posts. Where does it disagree with SHAP? Disagreement between two attribution methods is where the most interesting analysis lives.`,
    `Build a Streamlit page (using your week-9 skills) where a user can paste any post and see the SHAP-explained prediction. Live interpretability tool. Real product behaviour.`,
    `Read "Why Should I Trust You? Explaining the Predictions of Any Classifier" (the LIME paper) and "A Unified Approach to Interpreting Model Predictions" (the SHAP paper). Both are short and accessible. Knowing the literature is what separates someone using the tools from someone who can defend their use.`,
  ],
});

// ─── W17 ───────────────────────────────────────────────────────────────────────
rewriteWeek("data-science", 17, {
  context: `Most real-world datasets are imbalanced. The fraud column in your bank data is 0.3% fraud, 99.7% normal. The delayed-flight column in your week-1 model was maybe 20% delayed. When the rare class is the one you care about, the model has every incentive to ignore it — predicting "not fraud" 100% of the time gets 99.7% accuracy. Useless model, great-looking metric.

Synthetic data is one answer. You create new samples of the rare class — either by interpolating between existing rare samples (SMOTE), by paraphrasing them (for text), or by generating entirely new ones (using LLMs or generative models). The training set becomes balanced, the model learns the rare class properly, and your recall on what matters goes up.

This week you do it three ways. SMOTE on the FlightWise data (week-1 imbalance: delayed flights are the minority). LLM paraphrasing on your Reddit sentiment data (the "negative" class is probably underrepresented). And Faker — a library that generates fake-but-realistic placeholder data (names, addresses, dates) — for the kind of "I need test data that looks real but is not real users" scenario every working engineer hits.

Real talk: synthetic data is also risky. It can amplify the biases of the original data (if your rare-class examples are all from one demographic, SMOTE will create more samples that look like that demographic, baking in the bias). It can cause overfitting (the model memorises the synthetic patterns rather than learning the real signal). It can also be regulatory poison in some industries (GDPR, HIPAA — using LLM-generated personal data is a minefield). You will produce honest before/after numbers showing what synthetic data did to your recall and precision — and what trade-offs you accepted.`,

  pre_flight: `Open your week-1 FlightWise model. Check the class balance in y_train (df['delayed'].value_counts()). What percentage is the minority class? Now write down your prediction: if you apply SMOTE to balance the classes, will recall go up or down? Will precision go up or down? (Hint: usually recall goes UP and precision goes DOWN — but the magnitude matters.) Check on Friday.`,

  mastery_questions: [
    `Compute baseline numbers on your FlightWise model: paste precision, recall, F1 for the "delayed" class WITHOUT any resampling. The recall is probably mediocre. The model is biased toward the majority class because that is what you trained it on.`,
    `Apply SMOTE to your training data: from imblearn.over_sampling import SMOTE; X_train_resampled, y_train_resampled = SMOTE().fit_resample(X_train, y_train). Paste the new class balance. Retrain the model on the resampled data. Evaluate on the ORIGINAL, untouched test set. Paste the new precision/recall/F1. Compare to baseline. Did your prediction hold?`,
    `Use the LLM-paraphrasing approach on your Reddit data. For 100 of your negative-class posts, ask Claude (via API or copy-paste) to paraphrase them — same sentiment, different words. Add the paraphrases to your training set with the same label. Retrain DistilBERT. Did F1 on the negative class improve? Paste before/after.`,
    `Use Faker to generate 50 fake user records (name, email, signup_date, plan_tier). Paste 3 examples. Where would this kind of synthetic data be USEFUL? (Test environments, demo data, schema validation.) Where would it be DANGEROUS? (Training a model on fake users that has wrong demographic distribution.) Two sentences each.`,
    `Write a 200-word reflection in a SYNTHETIC-DATA-NOTES.md: when did synthetic data help? When did it hurt? What is your one rule for whether to use it on future projects? Paste the file. The reflection is the deliverable; the technique is incidental. People who can articulate when a tool fails are the ones trusted to wield it.`,
  ],

  common_mistakes: [
    `Applying SMOTE to your test set. NEVER. SMOTE goes on training data only. The test set must reflect reality, which is imbalanced. Otherwise your metrics are fiction.`,
    `Believing the recall improvement at face value. SMOTE almost always improves recall — sometimes by cheating (the model memorises the synthetic patterns). Always check precision and F1 too.`,
    `Generating LLM paraphrases without checking them. Some will be hallucinations or sentiment-flipped versions of the original. Spot-check 10 per 100 before adding to training.`,
    `Treating Faker output as real distributions. Faker's "city" field is uniform random across known cities. Your real users are not uniformly distributed. Use Faker for SHAPE not for STATISTICS.`,
    `Forgetting to set a seed on your synthetic generation. Reproducibility matters — without it, every time someone reruns your notebook they get different "fake" data and different results.`,
  ],

  debug_help: `SMOTE will refuse to run if your features include strings or NaN values. Encode categoricals (one-hot, label encoding) and impute or drop nulls first. SMOTE also breaks down when the minority class has fewer than k=5 samples (its default neighbour count) — for very-rare-class problems, lower k_neighbors or use ADASYN/BorderlineSMOTE which handle edges differently. LLM paraphrasing fails silently when the LLM refuses (content policy) — always check the API responses for empty or error fields and skip those.`,

  ai_assist: `Use Claude as your paraphrase engine in a tight loop: feed it 10 posts at a time with a clear instruction ("paraphrase each post preserving sentiment; output as JSON array"). The structured prompt prevents Claude from drifting. For the SMOTE work, use Claude to suggest THREE alternative resampling techniques (ADASYN, BorderlineSMOTE, undersampling) and the cases where each beats vanilla SMOTE — that comparison is exactly what a senior would expect from you.`,

  stretch: [
    `Compare SMOTE to random undersampling on the same model. Sometimes the simpler technique wins. Knowing this saves you from defaulting to fancy when basic works.`,
    `Train a small generative model (a basic GAN on tabular data, or use SDV's CTGAN) and use IT to generate synthetic minority class samples. Compare against SMOTE on the same downstream model.`,
    `Read OpenAI's policy on training data and GDPR's stance on synthetic data. The regulatory landscape is evolving fast — knowing it puts you ahead of 95% of ML engineers.`,
  ],
});
