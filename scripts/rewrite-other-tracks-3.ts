/**
 * Rewrites context + mastery_questions for:
 *   - devops-cloud.json    (24 weeks)
 *   - cybersecurity.json   (24 weeks)
 *
 * Run: npx tsx scripts/rewrite-other-tracks-3.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

interface WeekUpdate {
  context: string;
  mastery_questions: string[];
}

function applyUpdates(filename: string, updates: Record<number, WeekUpdate>) {
  const file = resolve(process.cwd(), `data/roadmaps/${filename}`);
  const roadmap = JSON.parse(readFileSync(file, "utf-8"));
  let updated = 0;
  for (const week of roadmap.weeks) {
    const u = updates[week.number];
    if (u) {
      week.context = u.context;
      week.mastery_questions = u.mastery_questions;
      updated++;
    }
  }
  writeFileSync(file, JSON.stringify(roadmap, null, 2), "utf-8");
  console.log(`✓ ${filename} updated: ${updated} weeks rewritten`);
}

// ─── DEVOPS & CLOUD ────────────────────────────────────────────────────────────

const DEVOPS: Record<number, WeekUpdate> = {
  1: {
    context: `Every time you visit a website, a physical machine somewhere in the world receives your request, runs code, and sends back a response — in under 100 milliseconds. That machine does not belong to you. It belongs to a cloud provider: AWS, Google Cloud, or Azure. It lives in a data centre, in a rack, behind a router, connected to the internet by fibre cables that cross oceans. This week you pull back the curtain. You SSH into a real Linux server for the first time, serve a real webpage from it, and understand what actually happens when you type a domain into a browser. You are not learning to click buttons in a UI. You are learning to speak to a machine directly, in the language it understands. Every DevOps engineer alive started exactly here.`,
    mastery_questions: [
      `SSH into your server and paste the command you used including the -i flag for your key. Now run whoami and uname -a. Paste the output. What operating system is your server running? What does the kernel version tell you?`,
      `Start a simple HTTP server (python3 -m http.server 80 or nginx) and open your server's IP address in a browser. Paste a screenshot. Now describe every network hop between your laptop's browser and that HTML file on the server.`,
      `Your Edge Portfolio v0.1 is live. Run curl -I http://your-ip and paste the HTTP response headers. What do the headers tell you about your server software? Why might you want to hide the Server header in production?`,
      `Create a new Linux user, grant it sudo access, and disable root SSH login. Paste the commands you ran. Why is disabling root SSH a security best practice?`,
      `Pause and think: your server is a single point of failure. If the disk dies tonight, your site is gone. What are three things you would need to do before a production site can tolerate a hardware failure?`,
    ],
  },
  2: {
    context: `A website on a raw IP address is a toy. A website on a custom domain with HTTPS is a professional product. HTTPS is not optional: browsers mark HTTP sites as 'Not Secure', search engines rank HTTPS sites higher, and any data sent over plain HTTP — passwords, form submissions — can be read by anyone on the same network. The certificate that powers HTTPS used to cost hundreds of dollars per year. Let's Encrypt changed that in 2015: free, automated SSL certificates for everyone. Certbot is the tool that talks to Let's Encrypt. This week your Edge Portfolio gets a real domain and a real certificate. When you see the padlock icon in your browser's address bar next to your own domain, you will understand why this step matters.`,
    mastery_questions: [
      `Point a domain you own (or a free subdomain from FreeDNS/DuckDNS) to your server's IP. Paste the DNS A record you created. Run dig your-domain.com and paste the response. How long does DNS propagation take and why?`,
      `Install certbot and obtain a Let's Encrypt certificate. Paste the command you ran. Now visit https://your-domain.com. Paste a screenshot showing the padlock. Click the padlock — what is the certificate issuer and expiry date?`,
      `Configure your web server to redirect all HTTP traffic to HTTPS. Paste the redirect configuration. Why is it important that the redirect is permanent (301) rather than temporary (302)?`,
      `Run curl -I https://your-domain.com and paste the headers. Find the Strict-Transport-Security header. What does it tell the browser, and what happens if you visit the HTTP version after this header is set?`,
      `Pause and think: your Let's Encrypt certificate expires in 90 days. What happens to your site if you forget to renew it? Set up automatic renewal using certbot renew --dry-run in a cron job. Paste the crontab entry.`,
    ],
  },
  3: {
    context: `Deploying manually is archaeology. Modern engineering teams deploy dozens or hundreds of times per day — automatically, reliably, without anyone SSH-ing into a server and running git pull. GitHub Actions is the CI/CD platform that makes this possible for any project on GitHub. When you push to main, Actions runs your tests, builds your app, and deploys it to your server — all in minutes, all without you touching anything. This week you wire up a GitHub Actions workflow for your Edge Portfolio: push code, watch the Actions tab, see your site update live. You will also write your first YAML workflow file, understand the job/step model, and use GitHub Secrets to store credentials securely. The day you stop deploying manually is the day you become a DevOps engineer.`,
    mastery_questions: [
      `Push a commit to main and watch your GitHub Actions workflow run. Paste a screenshot of the workflow run summary — show all jobs and their status. How long did the total pipeline take?`,
      `Add a step that runs a linter or basic test before deployment. Make it fail deliberately, then fix it. Paste the failure output from GitHub Actions and the fix.`,
      `Your workflow needs to SSH into your server to deploy. Add your SSH private key as a GitHub Secret and use it in the workflow. Paste the workflow YAML step. Explain why the secret is masked in logs.`,
      `What is the difference between a GitHub Actions 'job' and a 'step'? Why would you run two jobs in parallel? Give a real example from a deployment pipeline.`,
      `Pause and think: your current deployment pulls code and restarts the server. This means there is a moment where the old code is stopped and the new code is not yet started — a window where requests fail. What is this called and how do production deployments avoid it?`,
    ],
  },
  4: {
    context: `You deployed your site. Now what? Is it up? Is it slow? Did that last deployment break something? Without monitoring, you are flying blind — you learn your site is down when a user tweets at you. Uptime monitoring and structured logging turn your server from a black box into a transparent system. Uptime monitoring pings your site every minute and alerts you if it stops responding. Application logs tell you exactly what happened and when. Metrics dashboards show you CPU usage, memory, request rates, and response times over time. This week you add all three to your Edge Portfolio: UptimeRobot for uptime alerting, a proper Nginx access log pipeline, and a simple Prometheus + Grafana stack for metrics. After this week, you will see exactly what your server is doing at any moment.`,
    mastery_questions: [
      `Set up UptimeRobot (or Freshping) monitoring for your site. Configure an email alert for downtime. Deliberately stop your web server for 60 seconds. Paste the alert email you received. How quickly did it detect the outage?`,
      `Analyse your Nginx access log: run awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c to count responses by status code. Paste the output. What does a spike in 499 or 502 errors tell you?`,
      `Install Prometheus and the Node Exporter on your server. Query total CPU usage in the last 5 minutes using PromQL: rate(node_cpu_seconds_total[5m]). Paste the query and result.`,
      `Set up a Grafana dashboard with two panels: server CPU usage over time and HTTP requests per second. Paste a screenshot of your dashboard.`,
      `Pause and think: a monitoring system that alerts you 24/7 for minor blips is worse than no monitoring — you start ignoring alerts. What is an SLO (Service Level Objective) and how does it help you define which alerts actually matter?`,
    ],
  },
  5: {
    context: `Before Docker, deploying software was a negotiation with the environment. It worked on your laptop but not on the server. The server had Python 2.7, you needed Python 3.11. The staging server had a different version of OpenSSL. Docker ended this negotiation. A Docker container is a self-contained unit: your code, your dependencies, your runtime — packaged together and guaranteed to behave identically everywhere. The same container runs on your MacBook, on a Linux server, on a Kubernetes cluster in AWS. Docker is now used by Netflix, Spotify, PayPal, and essentially every tech company that ships software. You are going to containerise your first app this week and understand why the industry never went back.`,
    mastery_questions: [
      `Write a Dockerfile for a Node.js app. Build the image with docker build -t myapp:v1 . and run it with docker run -p 3000:3000 myapp:v1. Paste the Dockerfile and confirm the app is accessible at localhost:3000.`,
      `Run docker images and paste the output. Your image is probably 900MB+. Now rebuild using node:20-alpine as the base image. Paste the new size. Explain what Alpine Linux is and why it produces smaller images.`,
      `Add a .dockerignore file to exclude node_modules and .git. Explain why including node_modules in the build context slows down builds and increases image size.`,
      `Run docker exec -it your-container /bin/sh and look around. Paste the output of ls / and ps aux. What processes are running inside the container? What is PID 1 and why does it matter?`,
      `Pause and think: your container runs as root by default. Why is this a security problem? Add a USER directive to your Dockerfile that runs the app as a non-root user. Paste the change.`,
    ],
  },
  6: {
    context: `A single Docker container is a party trick. Docker Compose is where containers become useful: it lets you define and run a multi-container application — your Node.js API, your PostgreSQL database, your Redis cache — all in one YAML file, started with one command. This is the local development environment that every serious development team uses. No more 'install Postgres locally', no more version conflicts between team members, no more 'it works on my machine'. One git clone, one docker compose up, and every developer has an identical, disposable, reproducible environment. This week you containerise your full application stack and eliminate the last 'but it works on my machine' from your vocabulary.`,
    mastery_questions: [
      `Write a docker-compose.yml that starts three services: your Node.js app, PostgreSQL, and Redis. Paste the file. Run docker compose up -d and verify all three services are healthy with docker compose ps.`,
      `Connect your Node.js app to the PostgreSQL container using the service name (not localhost). Paste the DATABASE_URL you used. Explain why 'postgres' (the service name) resolves correctly inside the Docker network.`,
      `Add a health check to your PostgreSQL service. Run docker compose ps and show that the database shows 'healthy'. Explain what happens to dependent services if the health check fails.`,
      `Add a volume mount so your PostgreSQL data persists across docker compose down and docker compose up. Verify it works: insert a row, stop, restart, confirm the row is still there.`,
      `Pause and think: your docker-compose.yml has your database password in plaintext. What are two ways to pass secrets to Docker containers without committing them to git?`,
    ],
  },
  7: {
    context: `The container you built last week is functional. The container you will run in production needs to be hardened. 'Hardened' means: runs as non-root, has no unnecessary packages that could be exploited, uses a minimal base image, and has no secrets baked in. Container security is the discipline of removing attack surface — every package you do not include is a vulnerability that cannot be exploited. This week you run Trivy, the industry-standard container scanner, against your images. You will find CVEs (Common Vulnerabilities and Exposures) — actual known security holes in the software inside your container. You will fix the ones you can and understand the ones you cannot. You will also implement a multi-stage build pattern to keep your final image as small and clean as possible.`,
    mastery_questions: [
      `Run trivy image your-app:v1 and paste the output summary. How many critical, high, medium, and low vulnerabilities did it find? Click into one CVE — what is the CVE ID, what package does it affect, and how is it exploited?`,
      `Write a multi-stage Dockerfile: a build stage (node:20) that compiles your TypeScript, and a runtime stage (node:20-alpine) that only copies the compiled output. Paste the Dockerfile. How much smaller is the final image?`,
      `Add a non-root USER to your final stage and verify the container runs without error. Paste the USER directive. What would break if your app tries to bind to port 80 as a non-root user?`,
      `Add an OCI label schema to your Dockerfile: LABEL org.opencontainers.image.source, version, and revision. Explain why container metadata matters in a production environment with hundreds of images.`,
      `Pause and think: your base image (node:20-alpine) has a critical CVE released today. You have 50 microservices using this image. How do you detect all affected services and update them systematically?`,
    ],
  },
  8: {
    context: `Docker is the language. The container runtime is the engine that speaks it. Docker Desktop is not what runs containers in production at Netflix or Google. Production uses containerd (the runtime inside Kubernetes), or Podman (the daemonless, rootless Docker alternative), or crun (the OCI runtime written in C). Understanding the container runtime stack — OCI spec -> runc/crun -> containerd -> Kubernetes -> your app — is what separates someone who uses containers from someone who operates them. This week you go deeper: you understand namespaces and cgroups (the Linux primitives that make containers possible), try Podman as a Docker alternative, and understand why the path from code to production container involves more layers than you thought.`,
    mastery_questions: [
      `Run a container using Podman: podman run -it alpine sh. Paste the output. What is the key difference in how Podman manages containers compared to Docker (hint: no daemon)?`,
      `Inspect the Linux namespaces of a running container: run lsns inside and outside a container. Paste both outputs. What namespaces is the container using? What would happen if two containers shared the same network namespace?`,
      `Use cgroups to limit a container's memory: docker run -m 128m your-app. Then write a program that allocates 256MB of memory inside the container. What happens? Paste the error.`,
      `Pull a container image and inspect its layers with docker history your-image. Paste the layer breakdown. Explain why each RUN command in a Dockerfile creates a new layer and how this affects caching.`,
      `Pause and think: what is the difference between a container and a virtual machine? Draw the stack for each (hardware -> OS -> runtime -> app) and explain when you would choose a VM over a container.`,
    ],
  },
  9: {
    context: `Kubernetes is where containers grow up. A single container is a single process. Kubernetes is an orchestrator: it manages thousands of containers across hundreds of machines, automatically restarting failed ones, distributing load, rolling out updates without downtime, and healing from failures. Google has been running Kubernetes (or its predecessor, Borg) for over a decade. Every major cloud provider — AWS, Google, Azure — offers managed Kubernetes. Understanding Kubernetes is non-negotiable for senior DevOps and platform engineers. The mental model is everything: Pods, Deployments, Services, Ingress — each concept solves one specific problem. This week you run your first Pod, expose it with a Service, and understand what Kubernetes is actually doing under the hood.`,
    mastery_questions: [
      `Create a Pod spec YAML that runs your containerised app. Apply it with kubectl apply -f pod.yaml. Run kubectl get pods and kubectl describe pod your-pod. Paste the output. What is a Pod vs a container?`,
      `Create a Deployment with 3 replicas. Delete one Pod manually. Watch Kubernetes recreate it: kubectl get pods -w. Paste the output. Explain why self-healing is the entire point of a Deployment.`,
      `Expose your Deployment with a Service of type ClusterIP. Then port-forward to it: kubectl port-forward svc/your-service 8080:80. Access it in your browser. Paste the kubectl commands you used.`,
      `Run kubectl get events --sort-by='.lastTimestamp' and paste the last 10 events. Kubernetes events tell you exactly what the control plane was doing — find one that shows a scheduling decision.`,
      `Pause and think: a Kubernetes node runs out of memory. What happens to the Pods on that node? Look up 'QoS classes' in Kubernetes (Guaranteed, Burstable, BestEffort). Which Pods get killed first and why?`,
    ],
  },
  10: {
    context: `Running a Pod is impressive at a demo. Running a reliable production workload is different. Production Kubernetes requires: liveness probes (does this pod need to be restarted?), readiness probes (is this pod ready to receive traffic?), resource requests and limits (how much CPU/memory can this pod use?), Horizontal Pod Autoscaler (how many replicas do I need right now?), and persistent volumes (where does my database's data actually live?). Without these, you have a cluster that works in demos and fails in production at the worst possible moment. This week you configure all five for your app. Every one of them exists because someone learned its absence the hard way.`,
    mastery_questions: [
      `Add a liveness probe to your Deployment that calls GET /healthz every 10 seconds. Deliberately make the endpoint return 500 after 30 seconds. Watch Kubernetes restart the Pod. Paste the kubectl describe pod output showing the restart.`,
      `Add a readiness probe. Configure it to fail during startup for 15 seconds. Watch the Pod not receive traffic until it's ready: kubectl get endpoints your-service -w. Paste the output showing the endpoint appearing.`,
      `Set resource requests (CPU: 100m, memory: 128Mi) and limits (CPU: 500m, memory: 256Mi) on your container. Explain what 'm' means for CPU. What happens if your app exceeds its memory limit?`,
      `Configure an HPA that scales between 2 and 10 replicas based on CPU utilisation > 50%. Run a load test to trigger it. Paste kubectl get hpa output showing the replica count change.`,
      `Pause and think: your app uses a PersistentVolumeClaim for database storage. The node it runs on dies. What happens to the PVC? To the Pod? How does Kubernetes reschedule the Pod and reattach the volume on a different node?`,
    ],
  },
  11: {
    context: `Kubernetes YAML files multiply quickly. A single microservice might need a Deployment, a Service, a ConfigMap, a Secret, an HPA, an Ingress, and a ServiceAccount — all separate YAML files. When you have 20 microservices, you have 140 YAML files to manage. Helm is the Kubernetes package manager: it bundles those files into a 'chart', allows you to template values for different environments, and tracks releases and rollbacks. Helm is used to install nearly everything in the Kubernetes ecosystem — Prometheus, cert-manager, Nginx Ingress Controller. This week you write your first Helm chart, deploy it to your cluster, and install a community chart (cert-manager) to automate TLS certificate management across your cluster.`,
    mastery_questions: [
      `Create a Helm chart for your app using helm create my-app. Customise the values.yaml for your image and service configuration. Deploy it with helm install. Paste helm list and the rendered templates (helm template my-chart).`,
      `Create two value files: values-staging.yaml and values-production.yaml with different replica counts and image tags. Deploy both: helm upgrade --install -f values-staging.yaml. Explain how Helm tracks the difference between the two releases.`,
      `Install cert-manager via Helm: helm install cert-manager jetstack/cert-manager. Create a ClusterIssuer that gets certificates from Let's Encrypt. Verify a certificate is issued: kubectl get certificates. Paste the output.`,
      `Roll back a Helm release to the previous version: helm rollback my-app 1. Paste the helm history my-app output before and after the rollback. When would you use rollback vs redeploy?`,
      `Pause and think: Helm templates are Go templates. They are powerful but can become complex and hard to read. What is Kustomize and how does it differ from Helm? When would you choose one over the other?`,
    ],
  },
  12: {
    context: `In a Kubernetes cluster with 50 microservices, every service talks to every other service over the network. That traffic is, by default, unencrypted, unauthenticated, and unobservable. You do not know which services are talking to which, how much traffic is flowing, or whether a service is failing to connect. A service mesh — Istio, Linkerd, or Cilium (eBPF-based) — intercepts all this traffic and adds encryption (mTLS), retries, circuit breaking, and deep telemetry without changing your application code. This is the infrastructure that companies like Airbnb, Lyft, and Google use to operate thousands of microservices reliably. This week you install Linkerd (the lightest, friendliest mesh) and see the traffic between your services in ways that were previously invisible.`,
    mastery_questions: [
      `Install Linkerd on your cluster and inject it into your app's namespace. Run linkerd viz dashboard and paste a screenshot of the traffic graph. What latency and success rate does it show for your service?`,
      `Simulate a service failure by adding a fault injection policy that returns 500 for 30% of requests. What does Linkerd's dashboard show? How do retries change the success rate the client sees?`,
      `What is mTLS (mutual TLS) and why does a service mesh implement it automatically? Verify that traffic between two services is encrypted: linkerd edges pod your-pod. Paste the output.`,
      `Explain the 'sidecar proxy' pattern: how does Linkerd intercept traffic without changing your application code? What does the injected container look like in kubectl describe pod?`,
      `Pause and think: eBPF-based meshes like Cilium claim to do everything Istio does with less overhead by operating at the kernel level rather than using sidecar proxies. Explain in one paragraph how eBPF works differently and why it reduces latency.`,
    ],
  },
  13: {
    context: `In 2010, a Netflix engineer accidentally deleted a database in production while SSH'd into a server and running a command by hand. It took four hours to recover. The lesson became a manifesto: no human should ever manually configure infrastructure. Infrastructure as Code (IaC) means your entire cloud environment — VPCs, subnets, security groups, load balancers, Kubernetes clusters, databases — is defined in version-controlled files. You apply it, it creates infrastructure. You destroy it, it tears down. You can recreate your entire production environment in a new region in 20 minutes. Terraform is the tool. It is vendor-agnostic (works with AWS, GCP, Azure, DigitalOcean), declarative, and used by every major engineering organisation on the planet. This week you define real infrastructure as code.`,
    mastery_questions: [
      `Write a Terraform configuration that creates a VPC with a public subnet, an internet gateway, and a security group. Run terraform plan and paste the output. Terraform shows you exactly what it will create before it does — explain why this is valuable.`,
      `Run terraform apply. Paste the final output showing what was created. Now run terraform destroy. Paste the output. You just created and deleted real cloud infrastructure in minutes with two commands.`,
      `What is Terraform state? Where is it stored? What happens if two engineers run terraform apply simultaneously? Look up 'remote state' and 'state locking' with S3 + DynamoDB. Explain why remote state is required in a team.`,
      `Add a Terraform module: abstract your VPC configuration into a reusable module in ./modules/vpc. Call it from your root module. Paste the module definition and the call. Explain why modules reduce drift between environments.`,
      `Pause and think: you wrote Terraform that creates a database. The database password needs to be in the config. How do you avoid committing it to git? Look up Terraform's sensitive variable handling and HashiCorp Vault integration.`,
    ],
  },
  14: {
    context: `You could run Kubernetes yourself — rent servers, install kubeadm, manage control planes, patch etcd, handle node upgrades. People do this. It takes months to get right and a dedicated team to operate. Or you could use managed Kubernetes: AWS EKS, Google GKE, or Azure AKS. The cloud provider runs the control plane, patches the nodes, handles upgrades, and integrates with their load balancers, IAM, and storage systems. Most companies with fewer than 50 engineers use managed Kubernetes — because the alternative is a full-time job for two people. This week you provision a real EKS (or GKE) cluster using Terraform, connect kubectl to it, and deploy your application to actual managed infrastructure. This is the environment your code will live in if you join a mid-size tech company.`,
    mastery_questions: [
      `Provision an EKS cluster using the official Terraform AWS EKS module. Paste the key parts of your main.tf. Run kubectl get nodes — paste the output showing your managed nodes.`,
      `Deploy your application to EKS. Expose it with an AWS Load Balancer (using the AWS Load Balancer Controller). Paste the external hostname of your load balancer. Access your app through it.`,
      `Enable EKS managed node group auto-scaling. Explain how this differs from Kubernetes HPA: one scales Pods, the other scales the nodes the Pods run on. What is 'Cluster Autoscaler' and when does it trigger?`,
      `Set up IRSA (IAM Roles for Service Accounts). Give your app's service account permission to read from an S3 bucket without using static credentials. Paste the IAM policy and the service account annotation.`,
      `Pause and think: your EKS cluster costs $0.10/hour for the control plane plus the EC2 instances. Estimate the monthly cost for a 3-node cluster (t3.medium). What would you do to reduce cost for a staging environment?`,
    ],
  },
  15: {
    context: `AWS, Google Cloud, and Azure each have their own load balancers, their own storage, their own Kubernetes flavour, their own databases. The moment you build a feature that uses an AWS-specific service — say, DynamoDB or SQS — you are locked into AWS. Moving later costs months of engineering time and significant risk. Multi-cloud strategy is the practice of avoiding that lock-in: using cloud-agnostic tools like Terraform, Kubernetes, and object storage APIs that work across providers. But multi-cloud also has real costs — operational complexity, inconsistent tooling, and the temptation to build the worst version of two clouds instead of the best version of one. This week you understand both sides of the debate and make an informed architectural decision.`,
    mastery_questions: [
      `List three AWS-specific services your application currently uses. For each, identify the equivalent on GCP and Azure, and a cloud-agnostic alternative. Example: SQS -> Google Pub/Sub -> Apache Kafka.`,
      `Deploy the same application to two different cloud providers using the same Terraform code (with different provider blocks). Paste the diff between your AWS and GCP provider configs. What changed?`,
      `Explain the CAP theorem in the context of a multi-region, multi-cloud database. What consistency guarantees do you sacrifice for availability across regions?`,
      `What is a Cloud Abstraction Layer? Give a real example of an open source tool that abstracts cloud provider differences (hint: Crossplane, Pulumi). Explain the trade-off it introduces.`,
      `Pause and think: a startup approaches you. They are 100% on AWS with $50k/month in bills. They want to go multi-cloud to 'avoid lock-in'. Write a one-paragraph counter-argument explaining the real cost of multi-cloud at their scale.`,
    ],
  },
  16: {
    context: `Every breach starts somewhere. In 2021, the Colonial Pipeline hack that shut down fuel for the US East Coast started with a leaked VPN password. In 2022, the Uber breach started with a social engineer convincing an employee to share their credentials. Secrets — API keys, database passwords, private keys, OAuth tokens — are the keys to your kingdom, and the way most teams manage them (hardcoded in code, stored in .env files, emailed around in plaintext) is a disaster waiting to happen. HashiCorp Vault is the industry standard for secrets management: it generates short-lived credentials, rotates them automatically, audits every access, and encrypts secrets at rest and in transit. This week you deploy Vault and change how your application thinks about secrets.`,
    mastery_questions: [
      `Deploy HashiCorp Vault (dev mode is fine). Store a database password as a secret at secret/data/myapp/db. Retrieve it using the Vault CLI and the HTTP API. Paste both commands and responses.`,
      `Configure dynamic secrets: have Vault generate a temporary PostgreSQL username and password that expire in 1 hour. Paste the vault read database/creds/my-role output. Why are short-lived credentials better than static ones?`,
      `Integrate Vault with your Kubernetes cluster using the Vault Agent Injector. Have a Pod automatically receive a secret as a mounted file without your application knowing about Vault. Paste the Pod annotation.`,
      `Enable Vault's audit log. Make a secret access request and find it in the audit log. Paste the log entry. What information does it contain that would help you investigate a breach?`,
      `Pause and think: a developer accidentally commits an API key to a public GitHub repo. It is visible for 3 minutes before they delete the commit. Is it safe? Look up 'GitHub secret scanning' and 'token rotation'. Write a one-paragraph incident response plan.`,
    ],
  },
  17: {
    context: `Deployment used to be an event. Teams scheduled deployment windows at 2am on Sundays, warned users of downtime, and gathered the whole team to watch. Google deploys thousands of times per day. Amazon deploys every 11.7 seconds. This is not recklessness — it is engineering. Continuous deployment with feature flags, canary releases, and blue-green deployments means you can ship code at any moment with zero downtime and the ability to roll back in seconds. This week you implement a production-grade deployment pipeline: tests run automatically, a canary release sends 5% of traffic to the new version, and a full rollout proceeds only if error rates stay below threshold. This is how Amazon ships every 11.7 seconds without breaking anything.`,
    mastery_questions: [
      `Implement a canary deployment in Kubernetes: deploy v2 alongside v1, split traffic 95/5 using a Service or Ingress weight. Paste the configuration. Monitor your Prometheus metrics during the canary period.`,
      `Implement a blue-green deployment: two identical environments, one live. Switch traffic from blue to green by changing a Service selector. Paste the kubectl patch command you used to switch traffic.`,
      `Add an automated rollback trigger: if your error rate exceeds 1% during a canary, roll back automatically. Paste the pipeline logic (could be a GitHub Actions step, ArgoCD application health check, or Flagger configuration).`,
      `What is the difference between a deployment strategy (rolling, blue-green, canary) and a feature flag? Give an example where you would use each and when you would combine both.`,
      `Pause and think: you are deploying a database schema migration alongside a code change. The migration is irreversible (you deleted a column). Explain why this is dangerous in a zero-downtime deployment and what the safe approach is (hint: expand/contract migration pattern).`,
    ],
  },
  18: {
    context: `GitOps is the practice of using Git as the single source of truth for your infrastructure and application state. You do not kubectl apply anything manually. You do not SSH into a server to fix a config. Every change goes through a pull request, gets reviewed, and is applied by an operator (Argo CD or Flux) that continuously reconciles the cluster state with what's in Git. If someone manually changes something in the cluster, the operator reverts it. Git becomes your audit log, your rollback mechanism, and your deployment system simultaneously. Argo CD is the most widely adopted GitOps operator and runs in production at companies like Intuit, Red Hat, and Alibaba. This week you adopt GitOps and stop touching your cluster directly.`,
    mastery_questions: [
      `Install Argo CD on your cluster. Create an Application that points to your Kubernetes manifests in a Git repo. Paste the Application YAML. Make a change to your manifests, push to Git, and watch Argo CD sync automatically.`,
      `Deliberately drift your cluster: manually kubectl set image your-deployment with a different image tag. Watch Argo CD detect the drift and show OutOfSync. Paste a screenshot of the Argo CD UI showing the drift.`,
      `Set Argo CD to auto-sync with self-healing enabled. Make the same manual change. Now watch Argo CD revert it automatically within 3 minutes. Paste the sync history.`,
      `What is the difference between Argo CD and Flux? In one paragraph, explain when you would choose each for a team of 10 engineers.`,
      `Pause and think: a production outage is happening right now. You know the fix — change one environment variable. But in a GitOps world, you cannot kubectl apply directly. What is the correct procedure? And what 'break glass' mechanism would you add for genuine emergencies?`,
    ],
  },
  19: {
    context: `Something is wrong with your production Kubernetes cluster. Response times have tripled. You do not know if it is a single slow pod, a saturated node, a misbehaving service, or a network partition. Without observability, you are guessing. With the full observability stack — Prometheus for metrics, Grafana for dashboards, Loki for logs, and OpenTelemetry for distributed traces — you can answer 'what is broken, where, since when, and why' in minutes instead of hours. This is not optional for production systems. This is the difference between a team that thrives on-call and a team that burns out. This week you deploy the full kube-prometheus-stack and trace a fake production incident from symptom to root cause.`,
    mastery_questions: [
      `Deploy the kube-prometheus-stack Helm chart. Access your Grafana dashboard. Find the 'Kubernetes / Compute Resources / Pod' dashboard. Paste a screenshot showing CPU and memory usage for your application pod.`,
      `Write a PromQL query that finds all pods with memory usage above 80% of their limit: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.8. Paste the query and result.`,
      `Configure a Prometheus alert rule that fires when pod restart count exceeds 3 in 10 minutes. Route it to a Slack channel (or email) via Alertmanager. Paste the alert rule YAML and the notification you received.`,
      `Add OpenTelemetry instrumentation to your Node.js app. Export traces to Jaeger or Tempo. Make a request that hits three internal services and view the full distributed trace. Paste a screenshot.`,
      `Pause and think: your on-call engineer gets paged at 3am for a CPU spike alert. The spike lasted 90 seconds and resolved itself. This happens 3 times a week and is never an actual problem. What is 'alert fatigue' and how do you fix your alerting rules to stop this?`,
    ],
  },
  20: {
    context: `Google's SRE (Site Reliability Engineering) book changed how the industry thinks about reliability. SREs define what reliability means (SLOs), measure how close they are (SLIs), and manage how much unreliability they can tolerate (error budgets). The error budget insight is profound: 100% availability is impossible and wrong. Every minute you spend chasing five nines of availability is a minute you are not shipping features. The error budget is the agreed-upon amount of unreliability per month. If you have budget left, ship fast. If you have burned it, slow down and stabilise. This week you define SLOs for your cluster, build error budget dashboards, and run a real game-day exercise simulating a production incident.`,
    mastery_questions: [
      `Define an SLO for your API service: availability (99.9% = 43.8 minutes of downtime/month), latency (95% of requests under 200ms). Write these as Prometheus recording rules or SLO annotations. Paste the configuration.`,
      `Build an error budget dashboard in Grafana showing: total budget this month, budget consumed, budget remaining, and burn rate. Paste a screenshot. If your burn rate is 2x, what does that mean?`,
      `Run a chaos experiment using Chaos Mesh or Litmus: kill one pod randomly every 60 seconds for 10 minutes. Observe your SLO dashboard during the experiment. Did you breach your error budget? Paste the dashboard during chaos.`,
      `Write a blameless post-mortem for a hypothetical 45-minute outage (your database ran out of connections). Include: timeline, root cause, contributing factors, action items. Paste the document.`,
      `Pause and think: your team ships 50 deployments per month. Your SLO is 99.9% availability. Your error budget is 43.8 minutes/month. Each risky deployment has a 2% chance of causing a 30-minute outage. How many risky deployments can you ship per month before you reliably blow your budget?`,
    ],
  },
  21: {
    context: `AWS sends a bill. You look at it. It is $47,000. Last month it was $31,000. You have no idea what changed. Cloud cost optimisation — FinOps — is the practice of making your cloud spend visible, understandable, and intentional. Most companies waste 30-35% of their cloud budget on idle resources, oversized instances, unused reserved capacity, and data transfer fees they did not anticipate. AWS Cost Explorer, Kubecost for Kubernetes, and tagging strategies are the tools. The insights are always the same: you are running dev environments 24/7 that only need to run 8 hours a day, you have EC2 instances that are 10% utilised, and your inter-region data transfer is costing you $8,000/month because someone forgot to co-locate their services. This week you audit a cloud bill and find the waste.`,
    mastery_questions: [
      `Open AWS Cost Explorer (or your cloud provider's billing UI). Find the three most expensive services this month. Paste the cost breakdown. For each service, identify one optimisation you could make.`,
      `Install Kubecost on your cluster. Find the most expensive namespace. Paste a screenshot of the cost breakdown by namespace and by workload. Which pod is the most expensive per hour?`,
      `Calculate the savings from using Reserved Instances vs On-Demand for your cluster's baseline workload. For a t3.medium running 730 hours/month: On-Demand cost vs 1-year Reserved cost. Paste your calculation.`,
      `Add cost allocation tags to all your resources (team: platform, environment: production, service: api). Explain how tags enable chargebacks — the practice of billing individual teams for their cloud spend.`,
      `Pause and think: your Kubernetes cluster nodes are 15% CPU utilised on average. You are paying for 85% of compute you are not using. What is 'bin packing' and how do you configure Kubernetes pod resource requests to improve it?`,
    ],
  },
  22: {
    context: `The question is not 'will something fail?' It is 'when something fails, how fast can you recover?' AWS has had major outages — us-east-1 going down has become a meme. The question is not whether AWS will fail you but whether your architecture is resilient enough to survive it. Disaster recovery is the engineering discipline of planning for failure: regular backups (and tested restores), multi-region deployments, RTO and RPO targets. RTO is how long recovery takes. RPO is how much data you can afford to lose. A bank has an RPO of zero — no data loss acceptable. A blog has an RPO of 24 hours — daily backups are fine. This week you implement backups for your database, test a restore under time pressure, and understand what multi-region failover actually requires.`,
    mastery_questions: [
      `Set up automated daily PostgreSQL backups to S3 using pg_dump and a cron job (or a Kubernetes CronJob). Restore the latest backup to a new database. Paste the pg_restore command and confirm the data is intact.`,
      `Define an RTO and RPO for your application. Justify the numbers. Example: RTO=4 hours (we can restore in 4 hours), RPO=1 hour (we back up hourly, acceptable to lose 1 hour of data). Paste your definition.`,
      `Simulate a disaster: delete your database. Start your recovery procedure. Time it. Paste the time from 'database deleted' to 'application working again'. Did you meet your RTO?`,
      `Sketch a multi-region architecture for your application: primary in eu-west-1, read replica in us-east-1, traffic failover via Route 53 health checks. Explain what 'active-passive' means vs 'active-active' and what the difference costs.`,
      `Pause and think: your restore procedure is documented in a wiki page that nobody has read in 6 months. The engineer who wrote it left the company. Why is a disaster recovery plan that has never been tested worse than no plan at all? How do 'game days' solve this?`,
    ],
  },
  23: {
    context: `AWS accounts are notorious for becoming security disasters over time: IAM policies that start as AdministratorAccess because it was 'just for testing', S3 buckets accidentally made public, security groups open to 0.0.0.0/0 on port 22, root account with no MFA. This happens at companies large and small. The 2019 Capital One breach exposed 100 million customer records because of a misconfigured WAF that let an attacker access the EC2 instance metadata service. Cloud Security Posture Management (CSPM) tools — AWS Security Hub, Prowler, Trivy — continuously scan your cloud environment for misconfigurations. This week you run a full security audit on your AWS account and fix every critical finding.`,
    mastery_questions: [
      `Run Prowler against your AWS account: prowler aws --compliance cis_level2_aws_3.0.0. Paste the summary of findings. How many critical and high severity issues did it find? Fix the top three.`,
      `Audit your S3 buckets: check that none are public, have bucket policies that allow s3:GetObject to *, or have ACLs granting public access. Paste the check you ran. What is 'S3 Block Public Access' and is it enabled at the account level?`,
      `Review your IAM users and roles: find any user with AdministratorAccess. Replace it with a least-privilege policy that grants only what that user actually needs. Paste the new policy.`,
      `Enable CloudTrail (or your cloud's equivalent) and find the last 10 API calls made to your account. Paste the events. What would you look for in CloudTrail if you suspected a breach?`,
      `Pause and think: your EC2 instance needs to read from S3. A developer hardcoded the AWS access key in the application config. List three problems with this. Explain how IAM instance roles solve all three.`,
    ],
  },
  24: {
    context: `This is the capstone. Not a tutorial. Not a demo. Real infrastructure that you build, secure, monitor, and operate. You will provision a multi-tier application on a managed Kubernetes cluster: a frontend, a backend API, a PostgreSQL database, a Redis cache, a CDN, and full observability stack. All defined in Terraform. All deployed via GitOps. Certificates managed automatically. Secrets in Vault. SLOs defined. Alerts configured. Costs tagged and monitored. This is what 'platform engineer' means at a company that takes infrastructure seriously. The difference between a DevOps engineer and a platform engineer is exactly this: not running commands manually, but building the system that runs commands for everyone else.`,
    mastery_questions: [
      `Paste your full Terraform module structure. Explain what each module provisions and why you separated them that way. How many resources does terraform plan show in your production environment?`,
      `Deploy your full stack via Argo CD. Paste a screenshot of all applications showing 'Healthy' and 'Synced' in the Argo CD dashboard. How long did the full deployment take from git push to live traffic?`,
      `Run a full DR drill: take a database backup, destroy the cluster, reprovision from Terraform, and restore from backup. Time the full recovery. Did you meet a 4-hour RTO? What was the hardest step?`,
      `Find and fix one real security misconfiguration in your production cluster (use Trivy or Prowler). Paste the finding and the fix. Commit the fix through a pull request — do not apply it manually.`,
      `Write a 400-word 'runbook' for the most likely production incident in your system — database connection exhaustion. Include: how to detect it, how to diagnose it, step-by-step resolution, and how to prevent recurrence. This is the document an on-call engineer reads at 3am.`,
    ],
  },
};

// ─── CYBERSECURITY ─────────────────────────────────────────────────────────────

const CYBER: Record<number, WeekUpdate> = {
  1: {
    context: `In 2013, a security researcher named Brian Krebs found that Target's point-of-sale systems had been compromised — 40 million credit cards stolen. The entry point was not Target itself. It was an HVAC contractor who had network access. Security is always about the attacker's perspective: how would they get in? What would they go after? How would they stay without being noticed? The best defenders think like attackers because they have to. This week you install OWASP Juice Shop — a deliberately vulnerable web app — and spend five days as an attacker. No tutorials. No walkthroughs. You read the source code, you try inputs, you think about what the application trusts that it shouldn't. Your first Vulnerability Report is the artefact: professional documentation of what you found, how you found it, and what the impact is.`,
    mastery_questions: [
      `Find and exploit the Login SQL injection vulnerability in Juice Shop. Paste the payload you used. Now explain why the query was vulnerable: what did the application trust that it shouldn't have?`,
      `Write a vulnerability report for what you found: Title, Severity (CVSS score if you can calculate it), Description, Steps to Reproduce, Impact, Recommendation. Paste the full report. This is the format you will use professionally.`,
      `Find a second vulnerability — any category. Document it in the same report format. Paste it. Now look up where it falls in the OWASP Top 10. Which category does it belong to?`,
      `What is the difference between a vulnerability, an exploit, and a payload? Give a concrete example using what you found in Juice Shop.`,
      `Pause and think: you found a SQL injection that lets you log in as any user. What is the maximum impact — what is the worst thing an attacker who found this first could do? Rate the severity (Critical / High / Medium / Low) and justify your rating.`,
    ],
  },
  2: {
    context: `A vulnerability report is only as good as its reproducibility. Across your career, you will need to show not just that a vulnerability exists but exactly how to demonstrate it — step by step, reliably, in a way that a developer can replicate and fix. The five additional vulnerabilities you find this week are your practice ground. Each one should be documented so clearly that someone who has never seen the application could reproduce the finding from your report alone. You are also training your attacker eye: learning to spot where applications make trust decisions, where input goes unvalidated, where error messages reveal too much. Every application you will ever audit has these patterns. Learning to recognise them here means you will recognise them everywhere.`,
    mastery_questions: [
      `Find five distinct vulnerability categories in Juice Shop this week — no repeats from Week 1. Paste the five vulnerability titles and their OWASP Top 10 category for each.`,
      `Pick your most interesting find. Write a proof-of-concept (PoC) — a minimal set of steps or code that demonstrates the vulnerability. Test it on a fresh Juice Shop install. Does it still work? Paste the PoC.`,
      `What is CVSS (Common Vulnerability Scoring System)? Calculate the CVSS 3.1 base score for one of your findings using the online calculator. Paste the vector string and score. Explain the three highest-weighted metrics.`,
      `Take one vulnerability and explain its root cause: not 'the input wasn't validated' but why — what assumption the developer made that was wrong, what defensive code was missing.`,
      `Pause and think: a developer reads your report and says 'this is fine, it only works in the dev environment'. Write a two-paragraph rebuttal explaining why the same vulnerability pattern almost always appears in production too.`,
    ],
  },
  3: {
    context: `Juice Shop is a training environment. TryHackMe is a battlefield. The rooms on TryHackMe — each one a self-contained vulnerable machine with challenges to solve — are the closest thing to real attack scenarios without the legal risk. The OWASP Top 10 room, the Linux Fundamentals series, the Network Fundamentals path — these are used in real security certifications and hiring assessments. This week you complete your first TryHackMe room and add it to your portfolio. You are also beginning to build your command-line reflex: the ability to move through a Linux system, enumerate what's running, and find what shouldn't be there. Every penetration tester alive learned this muscle memory through repetition. Start now.`,
    mastery_questions: [
      `Complete the 'OWASP Top 10' room on TryHackMe. Paste a screenshot of your completion badge. List the ten categories and write a one-sentence description of each that you could explain to a non-technical developer.`,
      `Complete the 'Linux Fundamentals Part 1' room. Paste your progress. Run the following on your own Linux VM: find / -perm -4000 2>/dev/null. Paste the output and explain what SUID binaries are and why they matter to an attacker.`,
      `Set up your attack environment: Kali Linux (VM or WSL), verify that nmap, gobuster, curl, and python3 are installed. Paste the version output of each. This is your toolkit for the rest of the programme.`,
      `What is the difference between black-box, grey-box, and white-box testing? For each, explain: what information do you start with, and what kind of assessments use each approach?`,
      `Pause and think: you found a critical vulnerability during a TryHackMe challenge. The exact same technique would work against a real website you have no permission to test. What are the legal and ethical boundaries? Look up the Computer Misuse Act (UK) or CFAA (US). Write a one-paragraph summary of what constitutes unauthorised access.`,
    ],
  },
  4: {
    context: `Burp Suite is to web security what VS Code is to software development: the tool that professionals actually use, every day, for real work. Burp acts as a proxy between your browser and the web server: it intercepts every request you send and every response you receive. You can inspect, modify, replay, and fuzz those requests. You can find the parameter that changes your user ID from 42 to 43 and test whether the server validates that you own ID 43. You can send 10,000 password guesses per second. You can find hidden endpoints. The entire practice of web application penetration testing runs through Burp Suite. This week you get fast with it — not just click through the UI but develop the muscle memory that makes you dangerous.`,
    mastery_questions: [
      `Intercept a login request to Juice Shop in Burp Suite. Paste the raw HTTP request you captured. Identify every parameter. Now send it to Repeater and modify the username — what happens when you submit a username that doesn't exist?`,
      `Use Burp Intruder to perform a password spray attack against Juice Shop's login endpoint. Use a wordlist of 20 common passwords. Paste the Intruder configuration (attack type, payload position, payload list). Which HTTP response signals a successful login?`,
      `Use Burp's active scanner (or manually) to find a reflected XSS vulnerability in Juice Shop. Paste the payload and the URL. Explain why reflected XSS is less dangerous than stored XSS.`,
      `Use the Target > Site map in Burp to map all endpoints in Juice Shop you've visited. Export the site map. How many unique endpoints did Burp discover? Find one endpoint you hadn't tested before.`,
      `Pause and think: Burp Suite Community Edition throttles Intruder attacks. Burp Suite Professional costs $499/year. List two free alternatives to Burp Intruder for brute-forcing web applications. What trade-offs do they have?`,
    ],
  },
  5: {
    context: `OWASP ZAP (Zed Attack Proxy) is the free, open-source alternative to Burp Suite — maintained by OWASP and used by developers, QA engineers, and security teams who cannot afford Burp Professional. Knowing both tools is a career advantage: some organisations mandate ZAP, some run it in CI/CD pipelines as part of DAST (Dynamic Application Security Testing). More importantly, using two tools on the same target teaches you something important: every tool misses things. The union of Burp and ZAP findings is always larger than either alone. This week you run both tools against Juice Shop side by side and document what each found that the other missed. That gap is where manual testing lives.`,
    mastery_questions: [
      `Run ZAP's active scan against Juice Shop. Paste the scan summary: number of alerts by severity. Compare it to your Burp findings. Which tool found more vulnerabilities? Which found different ones?`,
      `Configure ZAP as your browser proxy and spider Juice Shop manually. How many unique URLs did ZAP discover? Paste the site tree. Were there any endpoints ZAP found that surprised you?`,
      `Use ZAP's Fuzzer on a parameter you identified as potentially vulnerable. Paste the fuzzer configuration and one interesting response. Explain what fuzzing is and why automated fuzzing misses logic vulnerabilities.`,
      `Set up ZAP in CI mode: run it from the command line against a local Juice Shop instance. Paste the command and the HTML report it generates. How would you integrate this into a GitHub Actions pipeline?`,
      `Pause and think: you have run automated scans with Burp and ZAP. A developer asks: 'can I just run these tools and say our app is secure?' Write a one-paragraph answer explaining why automated scanning is necessary but not sufficient.`,
    ],
  },
  6: {
    context: `There is a difference between knowing that SQL injection exists and being able to execute it. Theory is reading about a lockpick. Practice is picking a lock. This week you move from 'I found a SQL injection' to 'I exploited a SQL injection to extract the entire user table, cracked the password hashes, and logged in as the administrator'. You use sqlmap, John the Ripper, and hashcat — the tools that real attackers use. You also exploit a broken access control vulnerability: accessing a resource that belongs to another user. These are the two most common high-severity findings in real web application assessments. Understanding how they are exploited makes you better at finding and fixing them.`,
    mastery_questions: [
      `Use sqlmap against the Juice Shop login endpoint: sqlmap -u "http://localhost:3000/rest/user/login" --data="email=test&password=test" --dbs. Paste the output. What databases did sqlmap find?`,
      `Extract the users table using sqlmap --dump. Paste the first three rows (redact real passwords). Crack one of the MD5 hashes using hashcat: hashcat -m 0 hash.txt rockyou.txt. Paste the cracked password.`,
      `Find an IDOR (Insecure Direct Object Reference) in Juice Shop: access another user's order history by changing an ID in a request. Paste the request and response. Write a one-paragraph explanation of why the server-side fix is an authorisation check, not an input sanitisation.`,
      `What is the difference between authentication and authorisation? Give a real example of a system that authenticates correctly but authorises incorrectly.`,
      `Pause and think: sqlmap just dumped your entire database in 45 seconds. What database-level controls — not application-level — would have limited the damage? (Hint: least privilege database accounts, row-level security.)`,
    ],
  },
  7: {
    context: `Web applications are not the only attack surface. Every machine on a network runs services: SSH on port 22, FTP on port 21, SMB on port 445, database on port 5432. A network and service penetration test maps what is running, identifies versions, and looks for known vulnerabilities in those services. nmap is the tool that invented network scanning — written by Gordon Lyon in 1997 and still the most used network scanner on the planet. Metasploit is the exploit framework used by penetration testers and red teams worldwide: a database of known exploits, a consistent interface, and automatic payload generation. This week you map a network, identify services, and exploit a known vulnerability in a lab environment.`,
    mastery_questions: [
      `Run an nmap scan against your lab network: nmap -sV -sC -O 192.168.1.0/24. Paste the results for one host. Explain each flag and what information it gathered. What is the difference between -sS (SYN scan) and -sT (TCP connect scan)?`,
      `Use Metasploit to exploit a known vulnerability on a deliberately vulnerable machine (Metasploitable or TryHackMe). Paste the msf6 > search, use, set, and run commands. What shell did you get?`,
      `Enumerate SMB shares on your lab network: smbclient -L //target -N. Paste the output. What information does anonymous SMB enumeration reveal that an attacker would find useful?`,
      `Run enum4linux against a Windows/Samba target. Paste the users section of the output. Explain what information this reveals and why domain enumeration is often the first step in a corporate network assessment.`,
      `Pause and think: you scan a network and find port 23 (Telnet) open on an industrial control system. You cannot exploit it without risking operational disruption. How do you document this finding in a way that conveys the risk without recommending an action that could cause an outage?`,
    ],
  },
  8: {
    context: `A penetration test that produces a bad report is a wasted penetration test. The report is the deliverable that clients pay for, executives read, and development teams use to fix things. A great security report does three things: it tells the technical team exactly how to reproduce the finding, it tells the CISO exactly what the business risk is, and it tells the development team exactly how to fix it — with specific code-level recommendations, not 'validate your input'. This week you write your first professional penetration test report. You will cover all findings from Weeks 1-7, write an executive summary that a non-technical executive can understand, and calculate a risk rating for each finding using CVSS. This document is your portfolio.`,
    mastery_questions: [
      `Write an executive summary for your Juice Shop assessment — maximum 300 words, no technical jargon. It should explain: what was tested, what the critical findings were, and what the business risk is if they are not fixed. Paste it.`,
      `Write a complete finding entry for your SQL injection: Title, CVSS Score + Vector, Description, Proof of Concept (with screenshots), Business Impact, Remediation (specific code fix). Paste the full entry.`,
      `Rate all your findings by severity: Critical, High, Medium, Low, Informational. Create a summary table. Explain your rationale for the highest-severity rating.`,
      `What is the difference between a finding and a recommendation? Why should recommendations be specific and actionable rather than generic? Rewrite a generic recommendation ('use input validation') as a specific one for the SQL injection you found.`,
      `Paste your complete report structure (table of contents). Have a peer or mentor read your executive summary. What questions did they have? Revise it based on their feedback and paste the revision.`,
    ],
  },
  9: {
    context: `Attack is glamorous. Defence is where the real engineering happens. Every second of every day, real attacks are hitting real systems — automated bots scanning for open ports, credential stuffing attacks against login forms, phishing emails landing in inboxes, ransomware propagating across corporate networks. The defenders are the SOC (Security Operations Centre) analysts watching SIEM dashboards, the detection engineers writing the rules that catch attacks before they succeed, and the incident responders who contain and eradicate threats that got through. This week you switch sides. You deploy a real SIEM, write your first detection rule, and catch a simulated attack. The best penetration testers understand defence. The best defenders understand attack.`,
    mastery_questions: [
      `Install the ELK Stack (Elasticsearch, Logstash, Kibana) or Wazuh on a VM. Ingest your web server's access logs. Create a Kibana dashboard showing requests by status code over time. Paste a screenshot.`,
      `Write a detection rule that fires when more than 5 failed SSH login attempts occur from the same IP in 60 seconds. Test it by running a brute-force tool against your own VM. Paste the rule and the alert it generated.`,
      `What is a SIEM? Explain how it differs from a log aggregator. What is 'correlation' and why does it matter for detection? Give an example of an attack that only becomes visible when events from three different sources are correlated.`,
      `Look up the MITRE ATT&CK framework. Find the technique 'T1110 - Brute Force'. What detection data sources does ATT&CK recommend? Map your SSH detection rule to the ATT&CK technique ID.`,
      `Pause and think: your SIEM generates 10,000 alerts per day. Your SOC team can investigate 100. What is 'alert tuning' and how do you decide which alerts to suppress? What is the risk of suppressing too many?`,
    ],
  },
  10: {
    context: `The breach has already happened. An alert fired 47 minutes ago. A malicious process is running somewhere in the environment. Data may be leaving the network right now. Incident response (IR) is the structured process of: identifying what happened (Detection), stopping the spread (Containment), removing the threat (Eradication), restoring systems (Recovery), and learning from it (Post-Incident Review). NIST and SANS have published IR frameworks. Every serious organisation has an IR plan. Most have never tested it. This week you run a tabletop exercise — a simulated incident — and go through the full NIST IR lifecycle. You will find gaps in your plan before an attacker does.`,
    mastery_questions: [
      `Run through this incident scenario: 'At 2am, a user reports their account was used to send 5,000 spam emails. You check the logs and see 300 failed logins followed by one successful login from an IP in a country this user has never visited.' Document your response through each NIST IR phase: Preparation, Detection, Containment, Eradication, Recovery, Lessons Learned.`,
      `What evidence would you collect first? Paste a prioritised evidence collection checklist with the reason each item is collected (volatile vs non-volatile evidence).`,
      `Write the containment decision: do you take the compromised account offline immediately, or do you monitor it to gather more intelligence? Justify your answer. What are the trade-offs?`,
      `Write the post-incident report for this scenario. Include timeline, root cause, what the attacker did, and three specific controls that would have prevented or detected it sooner.`,
      `Pause and think: your company has no IR plan. A breach happens tomorrow. List the five things you would do in the first hour, in order. What is the most common mistake organisations make in the first hour of a breach?`,
    ],
  },
  11: {
    context: `Endpoints — laptops, desktops, servers, mobile devices — are where most breaches begin and where most defenders spend most of their time. Endpoint Detection and Response (EDR) tools — CrowdStrike, SentinelOne, Microsoft Defender for Endpoint — watch every process, every file write, every network connection, and every registry change on the machine. When they see behaviour that matches a known attack pattern, they alert or automatically block. Hardening is the complement: reducing the attack surface so there is less for an attacker to exploit. CIS Benchmarks are the industry standard hardening guides: 300 controls for Windows, 200 for Linux, all graded by implementability and impact. This week you harden a Linux server to CIS Level 1 and understand the trade-offs.`,
    mastery_questions: [
      `Download the CIS Benchmark for Ubuntu Linux (or the OS your server runs). Run the CIS-CAT Lite scanner. Paste your initial compliance score. List the five highest-scoring failures that were easiest to fix.`,
      `Implement five CIS Level 1 controls on your server: disable root login, enable auditd, configure UFW firewall, set password policies, disable unused services. Paste the commands you ran. What services did you disable and why are they a risk if left on?`,
      `Install a free EDR or audit daemon (auditd, OSSEC, or Wazuh agent). Trigger an audit event by running su - as a non-root user. Paste the audit log entry. What fields does it record?`,
      `What is the principle of least privilege? Apply it to a web server process: what user should nginx run as, what directories should it have write access to, and what capabilities should it have?`,
      `Pause and think: your hardening guide recommends disabling USB storage. A developer argues that they need USB drives for data transfers. Write a one-paragraph risk-based compromise — what control could you implement that satisfies both security and usability?`,
    ],
  },
  12: {
    context: `Threat intelligence is the structured knowledge of who is attacking, how they attack, and what they are after. The 2023 MOVEit supply chain attack — which compromised hundreds of organisations — was attributed to the Cl0p ransomware group with a specific, documented set of techniques. Defenders who had that intelligence could prioritise patching before the attack reached them. Threat hunting is the proactive search for attackers who have already evaded your detection: instead of waiting for an alert, you form a hypothesis ('what if an attacker has a foothold on our network?') and go looking for evidence. This week you consume threat intelligence feeds, map them to MITRE ATT&CK, and perform your first threat hunt against simulated attacker activity.`,
    mastery_questions: [
      `Subscribe to two free threat intelligence feeds (CISA alerts, AlienVault OTX, or abuse.ch). Find one recent threat report. Identify the threat actor, TTPs (Tactics, Techniques, Procedures), and IoCs (Indicators of Compromise). Paste a summary.`,
      `Map the TTPs from your threat report to MITRE ATT&CK techniques. Paste the technique IDs and names. Now check your SIEM: do you have detection coverage for these techniques? List which ones have no detection rule.`,
      `Perform a threat hunt: form a hypothesis ('an attacker with a web shell would make unusual outbound connections from the web server'). Query your logs for that behaviour. Paste the query and the result. Did you find anything suspicious?`,
      `What is an IoC (Indicator of Compromise) vs a TTP (Tactic, Technique, Procedure)? Explain why TTPs are more valuable for long-term defence than IoCs.`,
      `Pause and think: you find a threat report about an APT (Advanced Persistent Threat) group targeting financial institutions using spearphishing and living-off-the-land techniques. Your company is a fintech startup. Write a one-page threat briefing for your CISO explaining the risk and three mitigating controls.`,
    ],
  },
  13: {
    context: `The cloud is not more secure than a data centre. It is differently insecure. In a data centre, you worry about someone walking in and plugging into a switch. In AWS, you worry about someone stealing an IAM key and making API calls from the other side of the world. The AWS Shared Responsibility Model defines the split: AWS secures the physical infrastructure, you secure everything you put on it. IAM misconfigurations, public S3 buckets, overly permissive security groups, unencrypted data at rest — these are entirely your responsibility. The 2019 Capital One breach ($80M fine, 100M records) happened because of a misconfigured WAF on an EC2 instance. This week you assess a deliberately misconfigured AWS environment using Prowler, CloudSploit, and the Pacu exploitation framework.`,
    mastery_questions: [
      `Run Prowler against a test AWS account: prowler aws -g cis_level1. Paste the number of findings by severity. Fix the three most critical. Paste the remediation commands.`,
      `Use Pacu (the AWS exploitation framework) in a lab environment to enumerate IAM permissions from a set of credentials. Paste the iam__enum_users output. What information does this give an attacker?`,
      `Find a public S3 bucket in your test environment using aws s3 ls s3://bucket-name --no-sign-request. Explain why public S3 buckets are so common and what the correct fix is (at the bucket level and the account level).`,
      `What is the AWS Metadata Service (IMDS) and why is it a target for SSRF attacks? Explain the difference between IMDSv1 and IMDSv2 and why IMDSv2 was introduced.`,
      `Pause and think: an attacker gets access to an EC2 instance via a web shell. That instance has an IAM role attached with s3:* permissions. Walk through the full attack path: what would the attacker do next, and what would they find?`,
    ],
  },
  14: {
    context: `Kubernetes has more attack surface than most people realise. The API server is the brain of the cluster — if you can reach it with the right credentials, you own everything in it. The etcd database stores all cluster secrets — if you can read etcd directly, every secret is yours. The kubelet API, if exposed without authentication, lets you exec into any container. The metadata service on each node is accessible from inside pods unless explicitly blocked. This week you attack a deliberately misconfigured Kubernetes cluster (using the KubeHound or kind-based lab) and understand the container escape and cluster escalation paths that real attackers use.`,
    mastery_questions: [
      `Run kube-hunter against your cluster: kube-hunter --remote your-cluster-ip. Paste the findings. What did it discover? Classify each finding by severity and explain the attack path it enables.`,
      `Find and exploit a misconfigured RBAC policy in your lab: a service account with cluster-admin or wildcard permissions. Paste the kubectl auth can-i --list --as=system:serviceaccount:default:your-sa output. What can this service account do?`,
      `Perform a container escape in your lab using a privileged container: run a pod with --privileged, mount the host filesystem, and chroot into it. Paste the commands. Explain why privileged containers are so dangerous.`,
      `What is the Kubernetes network policy and why are clusters without one dangerous? Write a NetworkPolicy that allows only traffic from pods with the label app=frontend to pods with the label app=backend.`,
      `Pause and think: your cluster has no PodSecurityAdmission policy. A developer deploys a pod with hostPID: true. Explain what this gives the pod access to and why it's a privilege escalation path.`,
    ],
  },
  15: {
    context: `The fastest growing attack surface in software is the software supply chain. In 2020, SolarWinds was compromised — a build server was accessed, malicious code was inserted into a software update, and 18,000 organisations (including US federal agencies) installed that update. In 2021, the xz-utils backdoor was caught moments before it would have given an attacker root access to millions of Linux servers. Your application's dependencies — the 1,200 npm packages it pulls in — are all part of your attack surface. This week you audit your application's supply chain: SBOM generation, dependency scanning, code signing, and SLSA (Supply-chain Levels for Software Artifacts) compliance.`,
    mastery_questions: [
      `Generate an SBOM (Software Bill of Materials) for your application using Syft: syft your-image -o spdx-json > sbom.json. Paste the total number of packages. Scan it with Grype: grype sbom:sbom.json. Paste the vulnerability summary.`,
      `Run npm audit on a Node.js project. Paste the output. Fix one HIGH severity vulnerability by updating the dependency. What is the difference between a direct and transitive dependency?`,
      `What is the SolarWinds attack technique called? (Hint: look up 'build pipeline compromise'.) Explain in one paragraph how an attacker compromised the build server and what controls would have detected or prevented it.`,
      `Set up GitHub's Dependabot for a repository. Paste a screenshot of an open Dependabot pull request. Explain why automated dependency updates are a security control, not just convenience.`,
      `Pause and think: you are about to install a popular npm package (100k weekly downloads). What would you check before including it in your production application? Write a 5-point checklist for evaluating a new dependency.`,
    ],
  },
  16: {
    context: `The most expensive vulnerabilities to fix are the ones discovered in production. The cheapest are the ones that never make it into code because the threat was modelled before a line was written. Threat modelling is the practice of systematically identifying what could go wrong in a system before building it. STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) is the framework developed at Microsoft. The threat model for a login system looks different from the threat model for a payment processor, which looks different from a healthcare portal. This week you produce a threat model for a real application and demonstrate that you can think like an attacker before the application exists.`,
    mastery_questions: [
      `Create a data flow diagram (DFD) for a simple login system: browser, web server, auth service, database, email service. Mark every trust boundary. Paste the diagram (ASCII is fine). Where do the most interesting attacks happen?`,
      `Apply STRIDE to each component in your DFD. For each threat category, identify one specific threat. Paste your STRIDE threat table. Which threat has the highest potential impact?`,
      `Pick the highest-impact threat from your model. Write a complete threat entry: Threat name, STRIDE category, Affected component, Attack scenario, Likelihood, Impact, Risk rating, Mitigation. Paste the full entry.`,
      `What is the difference between a threat and a vulnerability? Give an example where the same threat (SQL injection attack) results in different vulnerabilities depending on the target.`,
      `Pause and think: a startup says 'we will do threat modelling after we launch, when we have more users and more to protect'. Write a counter-argument that quantifies the cost of fixing a critical vulnerability in production vs in design.`,
    ],
  },
  17: {
    context: `Application security testing comes in three flavours: SAST (Static Application Security Testing) scans your code without running it — it reads your source and flags dangerous patterns. DAST (Dynamic Application Security Testing) attacks your running application like an attacker would. IAST (Interactive Application Security Testing) instruments your application at runtime and watches for vulnerabilities as tests execute. Each finds different things. SAST catches SQL injection in code you haven't deployed yet. DAST finds authentication bypasses that only manifest at runtime. IAST finds vulnerabilities that SAST misses because it can follow data flow across services. This week you integrate all three into your development workflow — so security checks run automatically on every commit.`,
    mastery_questions: [
      `Run Semgrep (SAST) against a Node.js codebase: semgrep --config=p/javascript-security .. Paste the findings. Find one true positive and one false positive. Explain how you distinguish them.`,
      `Run OWASP ZAP in API scan mode (DAST) against your running API: zap-api-scan.py -t http://localhost:3000/api-docs -f openapi. Paste the findings. Which vulnerabilities did DAST find that SAST could not?`,
      `Add Semgrep to your GitHub Actions pipeline: it should run on every pull request and block the merge if CRITICAL findings are present. Paste the workflow YAML. Deliberately introduce a SQL injection pattern and verify the pipeline catches it.`,
      `What is the 'shifting left' philosophy in security? Draw a cost curve showing how much more expensive a vulnerability is to fix at each SDLC stage (design -> development -> testing -> production).`,
      `Pause and think: your SAST tool flags 300 issues, 250 of which are false positives. Developers start ignoring all SAST alerts. This is the 'boy who cried wolf' problem. How do you tune your SAST tool to maximise signal and minimise noise?`,
    ],
  },
  18: {
    context: `Every software project is built on the work of others. React. Express. TensorFlow. OpenSSL. These foundational libraries are the software supply chain, and their security is your security. When Log4Shell was discovered in December 2021, it affected virtually every Java application in the world — because virtually every Java application used Log4j. When XZ Utils was backdoored in 2024, it nearly affected every Linux distribution's SSH daemon. Software supply chain security is about knowing what is in your software (SBOM), signing your artefacts (Sigstore, cosign), verifying what you receive (SLSA), and monitoring for new vulnerabilities in what you already run (Dependabot, Renovate, Trivy continuous scanning). This week you build a complete supply chain security posture.`,
    mastery_questions: [
      `Sign a container image using cosign: cosign sign --key cosign.key your-image. Verify it: cosign verify --key cosign.pub your-image. Paste both commands and outputs. Explain what this proves about the image's provenance.`,
      `Generate a SLSA provenance attestation for a build (use the SLSA GitHub Actions generator). Paste the attestation. Explain what SLSA level 2 guarantees about a build that level 1 does not.`,
      `Set up a policy that rejects container deployments to your Kubernetes cluster unless the image is signed and has a clean Trivy scan. Use Kyverno or OPA/Gatekeeper. Paste the policy YAML.`,
      `What is the 'typosquatting' attack in package managers? Give a real example (look up published typosquatting incidents in npm). How do you protect your organisation from accidentally installing a typosquatted package?`,
      `Pause and think: a zero-day is discovered in a library your app depends on. There is no patch yet. List three mitigations you could apply within 24 hours to reduce risk without patching the library.`,
    ],
  },
  19: {
    context: `Compliance is not the same as security. But compliance frameworks — SOC 2, ISO 27001, GDPR, PCI-DSS — force organisations to think systematically about their controls, document them, and get them independently verified. For a SaaS startup, SOC 2 Type II compliance is often the key that unlocks enterprise customers: procurement teams require it, and without it the deal does not close. GDPR is the law that governs personal data for anyone with EU customers — violations can reach 4% of global annual revenue. Understanding compliance is a career multiplier: security engineers who can speak the language of auditors and lawyers are rare and highly valued. This week you map your technical controls to a compliance framework and understand what auditors actually look for.`,
    mastery_questions: [
      `Download the SOC 2 Trust Services Criteria document (AICPA). Find the five Trust Service Categories (Security, Availability, Processing Integrity, Confidentiality, Privacy). For each, list one technical control you have already implemented that satisfies it.`,
      `What is the difference between SOC 2 Type I and Type II? A startup says they have a SOC 2 Type I report and calls themselves 'SOC 2 compliant'. Is that accurate? What would a Type II report additionally prove?`,
      `Map three GDPR obligations to technical controls: (1) Right to erasure (2) Data minimisation (3) Breach notification within 72 hours. For each, describe the engineering implementation.`,
      `What is a data processing agreement (DPA) and when is it required under GDPR? Give an example of a third-party service that would require a DPA and what you need to verify before using it.`,
      `Pause and think: your application stores user passwords as MD5 hashes. A security auditor flags this as a finding. Write the finding description and remediation recommendation as it would appear in an audit report, and explain the migration path from MD5 to bcrypt without requiring all users to reset their passwords.`,
    ],
  },
  20: {
    context: `Zero Trust is not a product. It is an architecture philosophy: never trust, always verify. The old model was 'hard shell, soft interior' — a firewall protected the perimeter, and everything inside was trusted. That model died when employees started working from coffee shops, when SaaS tools replaced on-premise servers, and when attackers learned to get through perimeters using phishing. Zero Trust means every request — from inside or outside the network — must be authenticated, authorised, and encrypted, regardless of where it comes from. Google implemented their version (BeyondCorp) after the 2009 Aurora attack. This week you understand Zero Trust and implement its principles: identity-based access, device trust, least privilege, and micro-segmentation.`,
    mastery_questions: [
      `What are the five pillars of Zero Trust (identity, device, network, application, data)? For each pillar, describe one control your current infrastructure does or does not have. Paste the assessment.`,
      `Implement network micro-segmentation in your Kubernetes cluster using NetworkPolicy: namespace A can only talk to namespace B on port 5432. Test that traffic from namespace C is blocked. Paste the policy and the test.`,
      `What is a PAM (Privileged Access Management) solution? Give three examples of privileged operations that should require MFA and a justification step in a Zero Trust environment.`,
      `Explain the difference between authentication (who are you?) and authorisation (what are you allowed to do?). In a Zero Trust model, why is continuous authorisation (re-checking on every request) better than session-based authorisation?`,
      `Pause and think: a developer's laptop is compromised by malware. In a traditional perimeter model, the attacker now has full corporate network access. In a Zero Trust model, what limits the blast radius? What would the attacker still be able to access?`,
    ],
  },
  21: {
    context: `When an attacker gets in, they leave traces. Registry keys, prefetch files, event logs, memory artefacts, network connections, browser history, modified system files. Digital forensics is the discipline of finding and interpreting those traces to reconstruct what happened. Malware analysis is the discipline of reverse engineering malicious software to understand how it works, what it does, and how to detect it. Both are critical for incident response — you cannot eradicate a threat you do not understand. This week you analyse a malware sample in a safe sandbox environment (Any.run or Cuckoo), extract IoCs, and perform basic memory forensics using Volatility. This is the work of the digital detective.`,
    mastery_questions: [
      `Submit a malware sample (use a known-safe sample from MalwareBazaar with the hash 'eicar' for testing) to any.run. Paste a screenshot of the behavioural analysis. What processes did it create? What network connections did it make? What files did it modify?`,
      `Extract IoCs from the any.run report: IP addresses, domains, file hashes, registry keys. Paste the IoC list. Check each IP/domain against VirusTotal. How many were flagged as malicious?`,
      `Run strings on a binary file: strings suspicious.exe | grep -E "(http|https|\.exe|cmd)" | head -20. Paste the output. What can strings analysis tell you about a binary without executing it?`,
      `What is the difference between static malware analysis and dynamic malware analysis? Give an example of something that static analysis can find that dynamic misses, and vice versa.`,
      `Pause and think: you are analysing a malware sample that communicates with a C2 (command and control) server. You have the C2 IP address. List three things you would do with that IP in an incident response context. What would you NOT do and why?`,
    ],
  },
  22: {
    context: `A tabletop exercise is where your incident response plan meets reality for the first time — without a real attacker present. A red team exercise is where trained attackers simulate a full adversary campaign against your actual systems, using real tactics, to find what your blue team would miss. Both are forms of organised adversarial testing, and both reveal gaps that no amount of policy writing and tool deployment can find. CREST, TIBER-EU, and the PCI DSS all mandate adversarial testing for organisations above a certain maturity level. This week you run your own tabletop exercise, roleplay a red vs blue scenario, and experience what it feels like to be both the attacker and the defender simultaneously — the mindset of a purple team.`,
    mastery_questions: [
      `Design and run a tabletop exercise for this scenario: 'An employee receives a phishing email, clicks the link, enters their credentials. The attacker now has their Microsoft 365 account.' Walk every stakeholder through their role: IT, security, legal, comms, executive. Paste the timeline of actions and decisions.`,
      `What is the difference between a red team, a blue team, and a purple team exercise? When would you recommend each to an organisation at different security maturity levels?`,
      `Map your tabletop scenario to the Cyber Kill Chain (Lockheed Martin model): Reconnaissance, Weaponisation, Delivery, Exploitation, Installation, Command and Control, Actions on Objectives. At which stage could the attack have been stopped? What control would have stopped it?`,
      `Write a post-exercise report: what gaps did the exercise reveal, what was the team's response time to detection, and what are the top three improvements you would make to the IR plan?`,
      `Pause and think: a red team tests your organisation for three weeks and finds nothing. Is this good news? Explain two interpretations of a clean red team result and how you would determine which interpretation is correct.`,
    ],
  },
  23: {
    context: `Cybersecurity is not one career — it is twenty. Penetration testing (offensive). SOC analysis (defensive). Digital forensics. Threat intelligence. AppSec. Cloud security. GRC (governance, risk, compliance). Security engineering. Each has different skills, different certifications, different day-to-day realities, different salary bands, and different cultural environments. The choices you make in your first two years shape which path finds you. Certifications matter for some paths (CompTIA Security+, CEH, OSCP for pentest; CISSP for leadership) and not for others. Portfolio matters for all of them. This week you make deliberate choices: you pick your specialisation, identify your target role, and build a portfolio that demonstrates what you know rather than what certifications you hold.`,
    mastery_questions: [
      `Research three cybersecurity roles you would want to hold in five years. For each: job title, typical responsibilities, required skills, common certifications, average salary in a market you want to work in. Paste your research.`,
      `Build your TryHackMe profile: complete 10 rooms and reach at least 'Hacker' rank. Paste your profile link and current rank. List the five rooms that taught you the most.`,
      `Create a GitHub repository with your security portfolio: all your vulnerability reports, your threat model, your SIEM detection rules, your hardening scripts. Paste the link. Write a compelling README that explains who you are and what you can do.`,
      `Write a LinkedIn post (or Twitter/X thread) about one technical thing you learned in this programme — SQL injection, threat modelling, or supply chain security. Make it educational, specific, and accessible to a developer audience. Paste the draft.`,
      `Pause and think: a recruiter asks you 'are you offensive or defensive security?' Most roles require both. Write a two-paragraph answer that shows you can think from both perspectives — and why that makes you a better security engineer than someone who only knows one side.`,
    ],
  },
  24: {
    context: `This is where you earn it. Not a certificate from a course platform. Not a grade. A credential that requires you to demonstrate real skill under real pressure. The OSCP (Offensive Security Certified Professional) exam is 24 hours: you attack five machines, document your findings, and write a professional report by the following day. No Google. No walkthroughs. Just you, your methodology, and everything you've learned. The TryHackMe and HackTheBox pathways leading up to it are your preparation. Your capstone this week is a full simulated OSCP-style lab: five deliberately vulnerable machines, a time limit, and a report that must stand alone as professional documentation. The engineers who pass OSCP are not the smartest. They are the most methodical, the most patient, and the most persistent.`,
    mastery_questions: [
      `Complete five machines in TryHackMe's OSCP preparation path or HackTheBox. Paste your completion screenshots. For each machine, write a one-paragraph summary: what was the vulnerability, how did you exploit it, and what did you learn?`,
      `Write a full penetration test report for the hardest machine you compromised. Include: executive summary, scope, methodology, findings (with CVSS scores), and remediation recommendations. This is your OSCP-format report.`,
      `What is your documented methodology? Write out your personal pentest process step by step: from initial reconnaissance to final report delivery. This is the document you follow so you never freeze when starting a new assessment.`,
      `Register for either OSCP (if you can afford it), eJPT (free), or eCPPT. Paste your registration confirmation or your eJPT result. Set a date to take your next certification exam.`,
      `Write a 400-word reflection: what is the hardest technical problem you solved during this programme? What would you tell a complete beginner who is terrified of cybersecurity? What does 'thinking like an attacker' actually mean to you after 24 weeks of doing it?`,
    ],
  },
};

applyUpdates("devops-cloud.json", DEVOPS);
applyUpdates("cybersecurity.json", CYBER);
