import { rewriteWeek } from "../rewrite-week";

// ml-engineering W6-W10

rewriteWeek("ml-engineering", 6, {
  context: `Decision trees and ensemble methods are the workhorses of tabular machine learning. In competitions and production systems handling structured data — the kind that comes in spreadsheet rows — gradient boosted trees consistently match or outperform neural networks with less tuning and better interpretability. Understanding how they work at a mechanical level is what separates someone who runs XGBoost from someone who can diagnose when it is failing and why.

A single decision tree is interpretable but weak. It splits the training data recursively based on the feature and threshold that best separates the classes, down to a maximum depth or minimum leaf size. The splitting criterion — Gini impurity for classification, mean squared error for regression — measures how homogeneous each resulting group is. A perfect split produces groups where all members belong to one class. A useless split produces groups with the same class distribution as the parent.

Bagging (bootstrap aggregation) reduces variance. Each tree in a random forest trains on a random subset of the training data (drawn with replacement). The diversity between trees means their errors are partially uncorrelated. Averaging uncorrelated errors reduces the total error. This is the mathematical reason ensembles outperform individual trees.

Random feature subsampling — the "random" in random forest — adds another dimension of diversity. Each split considers only a random subset of features (typically sqrt(n_features) for classification). This prevents any one dominant feature from appearing in all trees, forcing the ensemble to discover diverse relationships.

Gradient boosting is different from bagging. Instead of training trees in parallel on different data subsets, it trains them sequentially. Each new tree fits the residuals (errors) of all previous trees. The ensemble improves by correcting its own mistakes. XGBoost, LightGBM, and CatBoost are all gradient boosted tree implementations with different optimisations for speed, memory, and specific data types (CatBoost handles categoricals natively).`,

  pre_flight: `Have the flight dataset (or any tabular classification dataset) ready. Understand the difference between Gini impurity and entropy as splitting criteria — they usually produce similar trees. Know that sklearn's DecisionTreeClassifier has max_depth and min_samples_leaf parameters that control overfitting. Install xgboost and lightgbm. Know that RandomForestClassifier has n_estimators (number of trees) and max_features (fraction of features to consider per split).`,

  mastery_questions: [
    `A decision tree trained to depth 1 (a "stump") splits on one feature and produces two leaves. What is this model's bias and variance? A depth-1 tree has very high bias — it can only represent one threshold decision and will underfit complex patterns. It has very low variance — changing the training data slightly barely changes the split. This is the bias-variance tradeoff in its simplest form. A depth-20 tree has low bias (can fit complex patterns) but high variance (sensitive to training data noise). Ensemble methods reduce variance without increasing bias proportionally, which is why they outperform individual trees.`,

    `Your random forest has 100 trees and each tree has max_features=sqrt(20)=4. Tree 37 did not get DEP_HOUR in its random feature subset for a particular split. How does the forest still learn from DEP_HOUR? Other trees in the ensemble did receive DEP_HOUR in their feature subsets and did learn from it. The final prediction is the majority vote (for classification) or average (for regression) across all 100 trees. Even if Tree 37 ignores DEP_HOUR, Trees 1, 15, 42, 67... all use it. The ensemble aggregates knowledge from all trees, so no feature is permanently excluded — only temporarily excluded from individual splits in individual trees.`,

    `You compare XGBoost to LightGBM on a dataset with 500k rows and 50 features. LightGBM trains 10x faster. What does LightGBM do differently? LightGBM uses Gradient-based One-Side Sampling (GOSS): it keeps all instances with large gradients (the ones the current model gets wrong) and samples only a fraction of instances with small gradients. This reduces the data the algorithm processes while focusing learning on hard cases. It also uses histogram-based splitting (bucketing continuous features into discrete bins) which is faster than XGBoost's default exact splitting. For large datasets, LightGBM is usually the better starting point.`,

    `You have a dataset with a "customer lifetime value" column that is highly correlated with your target. Including it gives you ROC AUC of 0.95 in training and 0.62 at deployment. What happened? The CLV feature is computed using future information — it reflects behavior after the prediction target. This is data leakage: the model learned to use information that would not be available at prediction time. At deployment, CLV is computed from past behavior only, and the model is using a completely different signal than it trained on. Feature leakage is the #1 cause of models that look great in development and fail in production. Always verify every feature is available at prediction time in its production form.`,

    `SHAP (SHapley Additive exPlanations) values tell you how much each feature contributed to a specific prediction. How do SHAP values differ from feature importance in tree models? Tree feature importance is global: it summarises the average contribution of each feature across all predictions. It can be misleading because features used in early (high-depth) splits appear more important than those in later splits regardless of their actual impact on individual predictions. SHAP values are local: they give the contribution of each feature to a specific prediction. They satisfy mathematical axioms (efficiency, symmetry, linearity) that feature importance does not. For explaining individual predictions to a loan applicant or a doctor, SHAP values are the right tool.`,
  ],

  common_mistakes: [
    `Not setting random_state on RandomForestClassifier. Without it, each run produces different trees, making results non-reproducible. Always set random_state=42 (or any fixed integer) for reproducible experiments.`,

    `Comparing tree models without considering prediction speed. Random forests with 1000 trees are slow at inference — each prediction requires traversing 1000 trees. For low-latency production endpoints, 100 trees with optimised depth may be necessary. Always benchmark inference speed alongside training accuracy.`,

    `Using default max_depth in XGBoost (which is 6) without considering whether it is appropriate for your data. For small datasets, max_depth=6 leads to overfitting. For large datasets with complex interactions, it may be too shallow. Tune max_depth as a first-order hyperparameter.`,

    `Interpreting feature importance from a single tree instead of the full forest. A single tree's feature importance is noisy. Use the forest's averaged importance or, better, SHAP values computed from the full model.`,

    `Not using early stopping in gradient boosting. Without early stopping, XGBoost and LightGBM train for exactly n_estimators trees regardless of whether adding more trees helps. Early stopping with a validation set stops training when performance plateaus, preventing overfitting.`,
  ],

  debug_help: `The most confusing tree model behaviour is when training accuracy is 0.99 and validation accuracy is 0.71. This is classic overfitting. The tree has memorised the training data. Fix: reduce max_depth (start at 3-5), increase min_samples_leaf (to at least 20 for classification), add subsampling (subsample=0.8 for XGBoost), add regularisation (increase lambda and alpha for XGBoost). Apply one change at a time and re-measure. The goal is to reduce the gap between training and validation accuracy to under 0.05.`,

  ai_assist: `Use Claude to help you interpret a specific XGBoost SHAP plot. Paste a description of the SHAP summary plot (which features appear at the top, what the colour distribution looks like) and ask it to explain what the plot reveals about the model's decision-making. Use this to develop your own ability to read SHAP plots — then verify Claude's interpretation against your own analysis.`,

  stretch: [
    `Compare the three gradient boosting libraries — XGBoost, LightGBM, and CatBoost — on the same dataset with default hyperparameters. Report: ROC AUC, training time, inference time for 10k predictions. Document which you would choose as a default and why.`,
    `Implement a stacked ensemble: train XGBoost and LightGBM on the training data, use their predictions as features for a logistic regression meta-learner, and evaluate on the test set. Does the stack outperform either individual model?`,
    `Use sklearn's PermutationImportance to evaluate feature importance post-training: randomly shuffle each feature one at a time and measure the performance drop. Compare permutation importance to XGBoost's built-in importance. Where do they disagree and what might that tell you?`,
  ],
});

rewriteWeek("ml-engineering", 7, {
  context: `Most ML problems have labels — a target variable you are trying to predict. But a large fraction of real-world data problems do not: you have customer transaction records and you want to find natural customer segments, you have sensor readings and you want to detect anomalous patterns, you have high-dimensional gene expression data and you want to find structure before you know what to look for. Clustering and dimensionality reduction are the tools for these unsupervised problems.

K-Means clusters data by iteratively assigning each point to its nearest centroid and updating centroids to the cluster mean. It is fast, scalable, and produces compact clusters — but it assumes spherical clusters of similar size and requires you to choose k. The elbow method (plotting inertia versus k) helps find a natural k, but the elbow is often subtle. Silhouette score (average intra-cluster similarity versus nearest-cluster similarity, from -1 to 1) gives a more quantitative criterion.

DBSCAN clusters by density rather than centroid proximity. Points with sufficient nearby neighbours form clusters; isolated points are labelled noise. This makes DBSCAN excellent for non-spherical clusters and automatic noise detection — but it requires tuning epsilon (neighbourhood radius) and min_samples. Choosing good DBSCAN parameters for high-dimensional data requires PCA reduction first.

PCA (Principal Component Analysis) reduces dimensionality by finding the directions of maximum variance in the data. The first principal component explains the most variance, the second (orthogonal to the first) explains the next most, and so on. Projecting your 50-dimensional customer features onto the first 2 PCs gives a 2D view of the data structure that preserves the most information possible in 2 dimensions.

UMAP (Uniform Manifold Approximation and Projection) is a nonlinear dimensionality reduction technique that often produces better visualisations than PCA for complex datasets. It preserves both local and global structure better than t-SNE and is faster. For visualising high-dimensional embeddings (word embeddings, image embeddings, model activations), UMAP is now the standard choice.`,

  pre_flight: `Install umap-learn and hdbscan. Have a dataset ready for clustering — the Iris dataset works for learning, but use a real dataset with at least 10 features (customer transactions, sensor readings, or any tabular dataset without an obvious target). Understand what inertia means in K-Means: the sum of squared distances from each point to its cluster centroid. Know what silhouette score measures: how similar each point is to its own cluster compared to other clusters.`,

  mastery_questions: [
    `You run K-Means with k=3, k=4, k=5, and k=6. The elbow plot shows a kink at k=4. You choose k=4 and get silhouette score 0.48. Is k=4 definitely the right number of clusters? Not necessarily. The elbow is a heuristic, and 0.48 silhouette score is moderate (scores above 0.5 indicate reasonable cluster separation, above 0.7 is strong). Validate by checking whether the 4 clusters are meaningful in your domain: do they correspond to identifiable groups of customers, sensor operating states, or other interpretable categories? A statistically reasonable k that produces meaningless clusters is not useful. Domain validation is the final step, not the statistics.`,

    `You run DBSCAN and 35% of your points are labelled -1 (noise). What does this tell you and how do you respond? A 35% noise rate is very high — it suggests your epsilon is too small or your min_samples is too large, and many points are isolated in your feature space. Options: (1) increase epsilon to expand neighbourhood radius so more points join clusters, (2) decrease min_samples to make it easier to be part of a cluster, (3) reduce dimensionality with PCA before DBSCAN — DBSCAN struggles with high-dimensional data due to the curse of dimensionality. Alternatively, the data may genuinely have many isolated outliers, in which case DBSCAN is correctly labelling them as noise.`,

    `You reduce your 50-feature dataset to 2 dimensions with PCA and plot it. You see overlapping clouds with no clear structure. You then try UMAP and see 4 well-separated clusters. Why might UMAP reveal structure that PCA missed? PCA is a linear method — it finds the global directions of maximum variance. If the cluster structure exists in a lower-dimensional nonlinear manifold (which is common in real data), PCA cannot reveal it because it can only perform linear projections. UMAP is a nonlinear method that tries to preserve the topological structure of the data, including local neighbourhood relationships. It can "unfold" a manifold that PCA would compress into an overlapping projection.`,

    `You run K-Means and use the cluster labels as features in a supervised model. Your accuracy improves. Is this valid? It depends on how you computed the clusters. If you fit K-Means on the full dataset (including test data) and then add cluster labels as features, you have data leakage — test data influenced the cluster centroids. Valid approach: fit K-Means on training data only, then use trained_kmeans.predict(X_test) to assign test points to clusters based on the trained centroids. This is the same principle as fitting scalers and encoders on training data only.`,

    `You have 100k customer records and want to find anomalous customers for fraud investigation. You run K-Means and plan to flag points far from any centroid as anomalies. What is the problem with this approach and what is better? K-Means is not designed for anomaly detection. Every point is assigned to a cluster regardless of how far it is — there is no concept of "noise." Points that are far from any centroid are still assigned to the nearest one. Isolation Forest is better for anomaly detection: it builds an ensemble of random trees and measures how many splits are needed to isolate each point. Anomalous points (unusual patterns) require fewer splits. Alternatively, DBSCAN's noise label (-1) directly identifies isolated outliers.`,
  ],

  common_mistakes: [
    `Running K-Means on unscaled features. K-Means uses Euclidean distance. If annual_income ranges from 20k to 200k and age ranges from 18 to 80, the clustering is dominated by income because its scale is 2000x larger. Always StandardScale (or MinMaxScale) features before K-Means.`,

    `Choosing k based solely on the elbow plot without domain validation. The elbow gives you a statistically motivated number of clusters. Whether those clusters correspond to anything meaningful in your domain requires looking at the cluster profiles, not just the statistics.`,

    `Applying PCA as a mandatory preprocessing step without checking if it helps. For models that handle high-dimensional data well (random forests, XGBoost), PCA may remove information that helps the model. For K-Means and distance-based models on high-dimensional data, PCA often helps. Match the preprocessing to the model and dataset.`,

    `Not fixing the random seed for K-Means. K-Means initialisation is random (unless you use k-means++). Without a fixed seed, different runs can produce different cluster assignments. Use random_state=42 and optionally use n_init=10 to run 10 initialisations and choose the best.`,

    `Treating dimensionality reduction as a black box. When you reduce to 2 dimensions for visualisation, the axes no longer correspond to original features. PC1 is a linear combination of all original features. Report which original features load most strongly on each principal component — this is the interpretation that makes PCA results useful.`,
  ],

  debug_help: `The most common UMAP failure is "all points collapse to a single region" or "the structure looks like random noise." Both usually indicate the n_neighbors and min_dist parameters need tuning. n_neighbors controls the balance between local and global structure (higher = more global). min_dist controls how tightly points are packed in the embedding (lower = tighter clusters). Start with n_neighbors=15, min_dist=0.1 and adjust. Also: UMAP is sensitive to whether features are scaled — always standardise before running UMAP.`,

  ai_assist: `Use Claude to help you interpret your K-Means cluster profiles. After clustering, compute the mean of each feature per cluster and paste the resulting table. Ask Claude to describe what type of customer or entity each cluster might represent. Use this to validate whether the clusters are meaningful in your domain. The interpretation is yours to verify — Claude is helping you move faster through the analysis.`,

  stretch: [
    `Implement HDBSCAN (hierarchical DBSCAN) and compare its cluster assignments against K-Means and DBSCAN on the same dataset. HDBSCAN automatically selects the number of clusters and handles varying cluster densities better than DBSCAN.`,
    `Build a customer segmentation report using K-Means on a real transaction dataset. Profile each cluster: average spend, frequency, product categories, demographic distribution. Present the clusters as actionable customer personas with recommended marketing approaches.`,
    `Apply PCA and UMAP to the MNIST handwritten digit dataset. Visualise the 10-digit clusters in 2D. Measure the degree of overlap between digit clusters in each representation. Document which digits are most confused (likely 3/8, 4/9, 5/6) and why.`,
  ],
});

rewriteWeek("ml-engineering", 8, {
  context: `Time series data violates the fundamental assumption of most ML algorithms: that observations are independent. Yesterday's energy consumption affects today's. Last week's flu cases predict next week's. The order of observations is not just metadata — it is the core signal. This week you build a time series forecasting system that respects this structure, using the methods that actually get used in production: ARIMA for parametric modelling, XGBoost for feature-based forecasting, and the skill of decomposing a time series to understand its components before fitting any model.

Decomposition is where every time series problem should start. STL decomposition (Seasonal and Trend decomposition using Loess) separates your time series into three components: trend (the long-term direction), seasonality (repeating patterns at known periods), and residuals (what is left over). Visualising these three components separately tells you what you are dealing with. A strong weekly seasonality with a clear upward trend is a different problem than a flat trend with irregular spikes.

Stationarity is the property that the mean, variance, and autocorrelation structure of the series do not change over time. ARIMA requires stationarity. Most real series are not stationary — they have trends, seasonality, or variance that changes over time. Differencing (computing the change from one period to the next) is the most common transformation to achieve stationarity. The Augmented Dickey-Fuller test checks whether a series is stationary: a p-value below 0.05 rejects the null hypothesis of a unit root, indicating stationarity.

The persistence baseline is what you compare against. Predicting that tomorrow's value equals today's value is the simplest possible forecast. On many real time series, the persistence baseline is hard to beat. If your ARIMA model cannot beat persistence, you need a different model or different features — not more model complexity.`,

  pre_flight: `Install statsmodels (for ARIMA, STL, ADF test), pmdarima (for auto_arima), and prophet (for Facebook Prophet). Download a real time series dataset: hourly energy consumption, daily stock prices, monthly airline passengers, or similar. Confirm the index is a datetime. Understand the difference between in-sample fit (how well the model fits training data) and out-of-sample forecast (how well it predicts held-out future data).`,

  mastery_questions: [
    `You run the ADF test on your time series and get a p-value of 0.42. What does this mean and what do you do? A p-value of 0.42 fails to reject the null hypothesis of a unit root — the series appears non-stationary. Difference it: df['value_diff'] = df['value'].diff(). Run ADF again on the differenced series. If the p-value now drops below 0.05, the differenced series is stationary. This means d=1 in your ARIMA(p,d,q) model. If the series has weekly seasonality, you may also need seasonal differencing: df['value_sdiff'] = df['value_diff'].diff(7).`,

    `Your ARIMA model achieves MAE of 4.2 on the test set. Your persistence baseline (predict tomorrow = today) achieves MAE of 4.8. Is your model useful? Your model outperforms persistence — good. But the improvement is only 12.5%. Whether this is sufficient depends on the business context. If the forecast is used for inventory planning where a 10% MAE improvement saves $50k/month, the model is very useful. If the use case requires MAE under 2.0 to be actionable, neither model is sufficient and you need a better approach (more features, ensemble with exogenous variables, a neural network).`,

    `You fit ARIMA and the residuals show autocorrelation in the ACF (Autocorrelation Function) plot at lag 7. What does this indicate? The residuals are correlated at weekly lags — the model is not capturing the weekly seasonality. Solutions: add seasonal components to your model (use SARIMA with s=7), or remove seasonality through seasonal differencing before fitting ARIMA. The Ljung-Box test formally tests whether the residuals are white noise. A statistically significant Ljung-Box test means the model is leaving predictable structure in the residuals — the model is not yet complete.`,

    `You want to use XGBoost for time series forecasting instead of ARIMA. How do you frame the problem? Create lag features: target_lag_1 (yesterday's value), target_lag_7 (same day last week), target_lag_14 (same day two weeks ago). Create calendar features: day_of_week, hour_of_day, month, is_holiday. Create rolling features: 7-day rolling mean, 7-day rolling standard deviation. Now each row is a standard tabular ML sample with features derived from the history. Train XGBoost on older data, test on newer data (never shuffle time series data randomly — the split must be temporal). XGBoost with lag features often outperforms ARIMA because it can capture nonlinear patterns and interaction effects.`,

    `You want to forecast 14 days ahead. Your ARIMA model produces a point forecast with confidence intervals. What do the confidence intervals represent and why do they widen as the horizon increases? Confidence intervals represent the range within which the true future value will fall with a given probability (typically 95%). They widen as the horizon increases because prediction uncertainty accumulates: the forecast for day 2 depends on day 1's actual value (unknown), which adds uncertainty; day 3 depends on days 1 and 2 (both unknown); and so on. The widening reflects the honest propagation of uncertainty. A flat confidence interval at all horizons would be epistemically dishonest.`,
  ],

  common_mistakes: [
    `Shuffling time series data before splitting into train and test. The test set must always be the future — data after the training period. Random shuffling allows the model to "see the future" during training because test set rows that occur before training rows end up in the training data. Always use a temporal split.`,

    `Using RMSE as the only forecast metric. RMSE penalises large errors heavily and is sensitive to outliers. Also compute MAE (mean absolute error) and MAPE (mean absolute percentage error) — they give different views of forecast quality. MAPE is intuitive (percentage error) but explodes when actual values are near zero.`,

    `Fitting ARIMA without checking stationarity first. ARIMA on a non-stationary series produces invalid parameter estimates. Always check stationarity (ADF test) and apply necessary transformations before fitting.`,

    `Not computing a naive baseline. Before fitting any model, compute the persistence baseline (predict yesterday's value) and the seasonal naive baseline (predict same time last week). Your model must beat both to be considered useful.`,

    `Treating forecast uncertainty as a precise measure. Confidence intervals from ARIMA assume the model is correctly specified and the residuals are normally distributed. In practice, these assumptions are often violated. Treat confidence intervals as rough guides to uncertainty, not precise probability statements.`,
  ],

  debug_help: `The most frustrating ARIMA error is "MLE optimisation failed to converge." This usually means the model parameters (p, d, q) you specified do not fit the data well, or the data has structural issues (long missing stretches, extreme outliers, very high autocorrelation). Fix: start with auto_arima from pmdarima, which searches for parameters automatically. If that also fails, check your data for gaps or outliers and fill/remove them before modelling. Alternatively, try a first difference to reduce autocorrelation before fitting.`,

  ai_assist: `Use Claude to help you interpret the ACF and PACF plots from your time series analysis. Paste descriptions of the plots (at what lags do significant spikes appear? how quickly does the autocorrelation decay?) and ask it to suggest ARIMA(p,d,q) parameters based on the patterns. ACF and PACF interpretation is mechanical and well-documented — this is a good use of AI assistance to speed through the diagnostic step.`,

  stretch: [
    `Build an ensemble forecast: average the predictions of ARIMA, XGBoost (with lag features), and a simple exponential smoothing model. Measure whether the ensemble outperforms any individual model. Document when ensembles typically help in time series forecasting.`,
    `Add a changepoint detection step using the ruptures library. Identify structural breaks in your time series (points where the trend or variance changes significantly). Report whether changepoints align with real-world events you can identify.`,
    `Implement a walk-forward validation: rather than a single train/test split, train on the first 80% of data, predict the next week, add that week to training, predict the following week, and so on. Compute MAE across all prediction windows. This is the most realistic evaluation for time series models.`,
  ],
});

rewriteWeek("ml-engineering", 9, {
  context: `PyTorch is the framework that most ML research happens in, and the one that most production deep learning systems are built on. This week you move from scikit-learn's fit/predict interface to PyTorch's lower-level abstractions: tensors, autograd, and nn.Module. The shift is not just syntactic — it is conceptual. PyTorch makes the computational graph visible and gives you direct control over the gradient computation that drives learning.

A tensor is a multidimensional array, conceptually similar to a NumPy ndarray. The critical difference: PyTorch tensors can track the operations performed on them, enabling automatic differentiation. When you call loss.backward(), PyTorch traverses the computational graph backward and computes gradients for every tensor that had requires_grad=True. Those gradients tell the optimizer how to change each parameter to reduce the loss.

Autograd is the engine behind this. Every operation on a requires_grad tensor creates a node in the graph. Forward: compute outputs from inputs. Backward: propagate gradients from the loss back through the graph using the chain rule. This is backpropagation, implemented generically for any computation you can express in PyTorch. You do not need to derive gradients by hand — PyTorch derives them automatically.

nn.Module is the base class for all neural network layers and models. It provides parameter tracking (every nn.Parameter registered in the module is automatically included when you call model.parameters()), a consistent forward() method, and tools for serialisation, loading, and device placement. The convention is: define the architecture in __init__, implement the forward pass in forward(). The backward pass is handled automatically.

Device placement — moving tensors and models between CPU, CUDA GPU, and Apple Silicon MPS — is where most beginners make mistakes. Operations between tensors must happen on the same device. The pattern: move the model with model.to(device) and each batch with X.to(device), y.to(device) before the forward pass.`,

  pre_flight: `Install PyTorch (follow pytorch.org for your hardware — CPU, CUDA, or MPS). Confirm with \`import torch; print(torch.cuda.is_available())\` or \`print(torch.backends.mps.is_available())\`. Review NumPy array operations — tensor operations are nearly identical. Understand what a gradient is intuitively: the slope of the loss function with respect to a parameter, pointing in the direction of steepest increase.`,

  mastery_questions: [
    `You create a tensor x = torch.tensor([2.0], requires_grad=True) and compute y = x ** 2 + 3 * x. You call y.backward(). What is x.grad and why? y = x^2 + 3x. The derivative dy/dx = 2x + 3. At x=2: 2(2) + 3 = 7. So x.grad = 7.0. This is the gradient of y with respect to x at the current value of x. If x is a model parameter and y is the loss, this gradient tells the optimizer: "to reduce the loss, move x in the direction opposite to the gradient." An optimizer would update x = x - learning_rate * 7.0.`,

    `You define a two-layer MLP in nn.Module. Where do the parameters live and how do you move them to GPU? Parameters defined as nn.Linear layers inside __init__ are registered automatically as module parameters. \`model.parameters()\` returns an iterator over all parameters. To move to GPU: \`model = model.to('cuda')\`. This moves all parameter tensors to the GPU in place. The model object itself stays on CPU — only the tensor data moves. After this, all forward pass computations happen on the GPU, and all input tensors must also be on GPU: \`X = X.to('cuda')\`.`,

    `Your training loop calls optimizer.zero_grad() before every backward pass. What happens if you forget this? PyTorch accumulates gradients — it adds new gradients to the existing .grad tensors rather than replacing them. Without zero_grad(), the gradient for each parameter at step t is the sum of gradients from all steps 0 through t. The optimizer updates parameters based on accumulated gradients rather than current-batch gradients. For standard training, this is wrong — the accumulation grows with each step and the updates become unstable. Gradient accumulation is intentionally used when you want to simulate a larger batch size by accumulating gradients over multiple mini-batches before updating.`,

    `You save a model with torch.save(model.state_dict(), 'model.pt') and load it with model.load_state_dict(torch.load('model.pt')). Why state_dict and not the entire model object? state_dict is the dictionary of parameter tensors and buffers, independent of the Python class definition. Saving the entire model with torch.save(model) pickles the class structure along with the weights, making it fragile — if you rename a class or change the module structure, the load fails. state_dict is portable: as long as the architecture is the same, you can load weights into any instance of the same model class, regardless of how the class was defined. Use state_dict for all production model saving.`,

    `You train a model for 5 epochs and the training loss decreases smoothly. The validation loss decreases for 3 epochs and then increases. What do you do? The model is overfitting starting at epoch 3. Save the model checkpoint at epoch 3 (when validation loss was lowest) using torch.save(). Add early stopping: track the best validation loss and stop training if it has not improved for N epochs. Load the epoch-3 checkpoint for deployment. Also investigate: is the model too large for the dataset? Add dropout layers or reduce the model width to add regularisation.`,
  ],

  common_mistakes: [
    `Forgetting to call model.eval() during validation. model.eval() disables dropout layers and sets batch normalisation to use running statistics rather than batch statistics. Without it, dropout randomly zeros activations during validation, making the validation loss noisier and slightly inflated. Always: model.train() before the training loop, model.eval() before validation.`,

    `Not detaching tensors before logging metrics. If you log loss.item() rather than loss (without .item()), you keep a reference to the entire computational graph in memory. Use loss.item() (which detaches and returns a Python float) for logging, and loss for backward(). Memory grows unboundedly without this.`,

    `Creating new tensors inside the training loop without specifying device. If you create torch.zeros(batch_size, n_classes) inside the loop but your model is on GPU, the default device is CPU and the forward pass fails. Always specify device: torch.zeros(batch_size, n_classes, device=device).`,

    `Not using torch.no_grad() during inference and validation. Gradient tracking adds memory overhead. During evaluation, you do not need gradients. Wrap evaluation code in: \`with torch.no_grad():\`. This reduces memory usage significantly during validation, especially important when GPU memory is limited.`,

    `Using Python lists to accumulate losses and then computing the mean. Python list operations are slow. Use tensors or simple running sums: track total loss and count, compute mean at the end of each epoch.`,
  ],

  debug_help: `The most common PyTorch error is "RuntimeError: Expected all tensors to be on the same device." This means you are mixing CPU and GPU tensors in an operation. Systematic fix: add a device assertion at the start of your forward method: \`assert X.device == next(self.parameters()).device\`. This tells you exactly which tensor is on the wrong device. Then trace backwards through your code to find where the tensor was created without .to(device). The fix is usually adding .to(device) at the point of tensor creation or in the data loading loop.`,

  ai_assist: `Use Claude to help you understand a specific part of the autograd computation graph. Paste a short PyTorch code snippet (a few lines of tensor operations leading to a loss.backward() call) and ask it to trace the computational graph: what gradients are computed, in what order, and what the gradient values would be. This builds intuition for backpropagation in a way that reading documentation alone cannot.`,

  stretch: [
    `Implement gradient clipping in your training loop: \`torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)\`. Train a model without gradient clipping and observe if the loss becomes NaN (exploding gradients). Add clipping and observe the stability improvement.`,
    `Profile your training loop with PyTorch Profiler: identify the bottleneck between data loading, forward pass, backward pass, and optimizer step. Often the bottleneck is data loading, not GPU computation. Add num_workers to your DataLoader if that is the case.`,
    `Implement a learning rate scheduler: start with learning_rate=0.01 and halve it every 5 epochs using \`torch.optim.lr_scheduler.StepLR\`. Plot the training and validation loss curves with and without the scheduler. Document the difference in final performance and convergence speed.`,
  ],
});

rewriteWeek("ml-engineering", 10, {
  context: `Convolutional neural networks are the architecture that made computer vision practical at scale. Before CNNs, vision systems required hand-engineered features — Sobel filters for edges, HOG descriptors for object parts, SIFT for keypoints. CNNs learn these features directly from data, building a hierarchy of visual representations from pixels to edges to textures to object parts to objects. Understanding how this hierarchy forms is the foundation of modern vision work.

A convolution is a sliding dot product: a small learned filter moves across the image, computing the dot product between the filter weights and the local image patch at each position. A filter that learns to detect horizontal edges produces high activations wherever horizontal edges appear in the input. A filter for vertical edges activates on vertical edges. Later layers combine these basic detections to recognise more complex structures.

Stride controls how far the filter moves at each step. A stride of 1 produces an output nearly the same size as the input. A stride of 2 halves the spatial dimensions. Padding controls whether filters can extend beyond the image boundary — "same" padding adds zeros around the edges so the output has the same spatial size as the input.

Why convolutions are better than fully connected layers for images: parameter sharing (the same filter weights are used across all spatial positions, dramatically reducing parameters) and translation equivariance (if an object shifts right by 3 pixels, the feature map shifts right by 3 pixels, preserving the object's detected presence). A 5x5 filter shared across a 224x224 image has 25 parameters. A fully connected layer connecting all 224*224=50,176 pixels to the same output would require 50,176 parameters per output unit.

Transfer learning is the practical answer to "I don't have enough data to train a vision model from scratch." A pretrained ResNet or ViT already knows how to detect edges, textures, shapes, and high-level semantic features because it trained on millions of images. You freeze these general features and only train the final classification layers on your specific dataset.`,

  pre_flight: `Install torchvision. Download a classification dataset — dogs vs cats, CIFAR-10, or a dataset from your own domain (photos of two types of objects you care about). Understand what PIL and torchvision.transforms do: they load, resize, crop, and normalise images into tensors. Know that ImageNet normalisation uses mean=[0.485, 0.456, 0.406] and std=[0.229, 0.224, 0.225] — required when using pretrained models.`,

  mastery_questions: [
    `You have a dataset of 800 images (400 per class) and want to train a binary classifier. Should you train a CNN from scratch or use transfer learning? Transfer learning is strongly preferred with 800 images. Training a ResNet from scratch requires millions of images — with 800, a from-scratch model will overfit badly. With transfer learning: load ResNet50 pretrained on ImageNet, freeze all layers except the final fully connected layer, replace the final layer with a 2-class output, train only the new layer. You can optionally unfreeze the last few ResNet blocks after the classification head converges (this is fine-tuning). On 800 images, this approach achieves 85%+ accuracy where from-scratch would achieve 60-70%.`,

    `You are using ResNet50 with transfer learning. After 10 epochs, training accuracy is 95% and validation accuracy is 72%. What do you investigate? Overfitting. Even with frozen pretrained layers, the classification head can overfit to a small dataset. Fix: (1) add dropout before the final layer: \`nn.Dropout(0.5)\`, (2) add L2 weight decay to the optimizer: \`torch.optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-4)\`, (3) add more data augmentation: horizontal flips, random crops, color jitter. Augmentation is particularly effective here — it artificially expands the training set by creating valid variations of each image.`,

    `Grad-CAM highlights which regions of the image the model used to make its prediction. You use it on a dog/cat classifier and find the model is highlighting the background (grass for dogs, couch cushions for cats) rather than the animals. What is happening and how do you fix it? The model learned background correlations rather than object features — dogs in training data usually appear on grass, cats on furniture. This is a dataset bias, not a model failure. Fixes: collect more diverse training data with animals in varied backgrounds, apply random background replacement augmentation, or use a segmentation step to remove the background before classification. Grad-CAM is valuable precisely because it reveals these spurious correlations.`,

    `What is the key architectural innovation of Vision Transformers (ViT) compared to CNNs? ViT treats image patches as tokens (analogous to words in NLP). A 224x224 image divided into 16x16 patches produces 196 tokens. These tokens are passed through a standard Transformer encoder with self-attention. The key difference from CNN: self-attention has global receptive field from the first layer — every patch can attend to every other patch. CNNs build global receptive field progressively through depth, local to global. ViT requires more training data to match CNN performance (because attention lacks the inductive biases of convolution) but outperforms CNNs at scale. In practice, ViT is better for large datasets; ResNet variants are often better for small ones.`,

    `You train a model for binary classification and the loss decreases but accuracy stays at exactly 50%. What is happening? The model is outputting the same prediction for every input — either always class 0 or always class 1. The loss is decreasing because the model is calibrating its constant prediction to the class distribution, but it is not learning any discriminating features. Causes: class imbalance where predicting the majority class always is better than trying to learn, vanishing gradients from poor weight initialisation, a learning rate that is too small. Debug: print the output of model(X) for a batch. If all outputs are nearly identical, confirm by checking the unique values in predictions.`,
  ],

  common_mistakes: [
    `Not applying ImageNet normalisation when using pretrained models. Pretrained models expect input normalised with ImageNet statistics. Without normalisation, the input distribution is completely different from what the model trained on and performance degrades significantly.`,

    `Unfreezing all pretrained layers at the start of fine-tuning. Unfreezing all layers requires a very small learning rate and many epochs. Start by training only the classification head, then unfreeze the last 1-2 blocks with an even smaller learning rate.`,

    `Not augmenting training data. Even with transfer learning, augmentation significantly reduces overfitting on small datasets. At minimum: RandomHorizontalFlip and RandomCrop. For more robustness: ColorJitter, RandomRotation.`,

    `Using the same learning rate for pretrained layers and new layers. The pretrained layers have good weights — you want to fine-tune them gently. New layers start from random weights — they need larger updates. Use differential learning rates: \`optimizer = Adam([{'params': base_model.parameters(), 'lr': 1e-5}, {'params': classifier.parameters(), 'lr': 1e-3}])\`.`,

    `Not monitoring GPU memory usage during training. CNNs are memory-intensive. If you run out of GPU memory, PyTorch raises a CUDA OOM error. Reduce batch size first. Then consider gradient checkpointing for larger models.`,
  ],

  debug_help: `The most confusing vision model failure is an CUDA out-of-memory error mid-training, after 50 successful batches. This usually means memory leaked from earlier batches due to tensors not being freed properly. Check: are you accumulating validation outputs in a Python list without detaching? Are you storing the entire loss tensor (with graph) instead of loss.item()? Use torch.cuda.memory_summary() to see what is consuming memory. The fix is usually adding .detach() or .item() at the right places.`,

  ai_assist: `Use Claude to help you design a Grad-CAM implementation for your specific architecture. Describe your model structure (which layer you want to extract activations from, what the final output layer looks like) and ask it to write the Grad-CAM code. Grad-CAM implementation is mechanical but model-architecture-dependent boilerplate. Understand each step before using it.`,

  stretch: [
    `Build an image similarity search: embed 500 images with ResNet50 (removing the final classification layer), store the embeddings, and implement nearest-neighbour search. Given a query image, return the 5 most visually similar images from the database.`,
    `Implement test-time augmentation (TTA): at inference time, run the model on 5 augmented versions of each image (original + 4 flips/crops) and average the predictions. Measure the accuracy improvement versus single-pass inference.`,
    `Apply transfer learning to a custom dataset from your own domain — photos of plants, products, faces, handwriting, or any 2-class problem you care about. Collect at least 100 images per class (photograph them yourself or scrape ethically). Train and evaluate the classifier.`,
  ],
});
