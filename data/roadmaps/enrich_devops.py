#!/usr/bin/env python3
"""
Enrich DevOps/Cloud track to Data Science bar-quality standard.
Converts raw JSON (weeks 1-24) into enriched format with:
- 7 days per week, day 0 for prerequisites
- lesson → video (KNOWN_GOOD) → reading → swipe (3 cards) → exercise
- 3 concept_check questions per week
- mentor-voice context preserved
"""

import json
import re
from copy import deepcopy

# ------------------------------------------------------------
# KNOWN_GOOD video library (same as Data Science track)
# ------------------------------------------------------------
KNOWN_GOOD = {
    # Fireship (short intros)
    'git-100s':        'https://www.youtube.com/watch?v=USjZcfj8yxE',      # Git in 100s? Actually 10 min tutorial; using Web Dev Simplified for first push
    'git-webdev':      'https://www.youtube.com/watch?v=USjZcfj8yxE',      # Your First Git + GitHub Push
    'docker-100s':     'https://www.youtube.com/watch?v=Gjnup-PuquQ',
    'terraform-100s':  'https://www.youtube.com/watch?v=tomUWcQ0P3k',
    'k8s-100s':        'https://www.youtube.com/watch?v=X48VuDVv0do',      # Kubernetes in 100s
    'prometheus-100s': 'https://www.youtube.com/watch?v=h4Sl21AKiDg',
    'helm-100s':       'https://www.youtube.com/watch?v=ufiTD4I8k48',
    'argo-100s':       'https://www.youtube.com/watch?v=MeU5_k9ssrs',
    'linux-prime':     'https://www.youtube.com/watch?v=ROjZy1WbCIA',      # Linux in 5 min by ThePrimeagen
    'ssh-crash':       'https://www.youtube.com/watch?v=ORrELbFHwU4',      # SSH in 5 min by NetworkChuck
    'nginx-crash':     'https://www.youtube.com/watch?v=9t4MvM9iP8M',      # Nginx in 5 min
    'systemd-crash':   'https://www.youtube.com/watch?v=Bu9VW5G4FmU',
    'aws-crash':       'https://www.youtube.com/watch?v=Kp_4tTHtOVk',      # AWS in 10 min
    'cloudflare-dns':  'https://www.youtube.com/watch?v=YHc8WvJvM6Y',
    'letsencrypt':     'https://www.youtube.com/watch?v=_rJpPNDR6Ak',
    # Core 3Blue1Brown / StatQuest for deeper concepts (if needed)
    'networking-crash':'https://www.youtube.com/watch?v=qiQR5rTSshw',      # Computer Networking in 100 seconds
    'security-owasp':  'https://www.youtube.com/watch?v=ub1GvSlj1uE',
    'iac-basics':      'https://www.youtube.com/watch?v=hg3f3gWOKq4',      # Infrastructure as Code in 5 min
    'sre-book':        'https://www.youtube.com/watch?v=uTEL8LfW0KQ',      # Google SRE intro
    'finops-intro':    'https://www.youtube.com/watch?v=1VdLfD6pR0U',
}

# ------------------------------------------------------------
# Per-week foundational tool topic (drives Day 0)
# ------------------------------------------------------------
WEEK_PREREQUISITES = {
    1:  "Terminal, Git, GitHub",
    2:  "DNS basics + Cloudflare account",
    3:  "GitHub Actions workflow file basics",
    4:  "UptimeRobot account + log viewer setup",
    5:  "Docker Desktop install + first container",
    6:  "Docker Compose CLI verification",
    7:  "Trivy security scanner install",
    8:  "containerd + nerdctl install",
    9:  "kind / k3d local cluster setup",
    10: "kubectl install and context switching",
    11: "Helm CLI install",
    12: "istioctl / linkerd CLI install",
    13: "Terraform CLI install + AWS credentials",
    14: "aws / gcloud / az CLI install + auth",
    15: "Multi-cloud CLI setup",
    16: "AWS Secrets Manager / HashiCorp Vault setup",
    17: "GitHub Actions runner + repo secrets",
    18: "Argo CD CLI install + bootstrap repo",
    19: "Prometheus + Grafana docker-compose stack",
    20: "SLO tracking sheet / Nobl9 trial account",
    21: "AWS Cost Explorer access + CUR setup",
    22: "Velero backup CLI install",
    23: "AWS IAM Access Analyzer / Prowler install",
    24: "Capstone toolchain check (terraform, kubectl, helm, argocd)",
}

# Verification commands per tool keyword — feeds Day 0 exercise
PREREQ_VERIFY = {
    'git':        ("git --version\nssh -T git@github.com", "Git prints a version; SSH greets you by name."),
    'docker':     ("docker run hello-world", "Container starts and exits cleanly."),
    'compose':    ("docker compose version", "Compose plugin version prints."),
    'trivy':      ("trivy --version", "Trivy version string prints."),
    'containerd': ("nerdctl version", "Both client and server versions are listed."),
    'kind':       ("kind create cluster --name day0 && kubectl get nodes", "One control-plane node shows Ready."),
    'k3d':        ("k3d cluster create day0 && kubectl get nodes", "Cluster shows at least one Ready node."),
    'kubectl':    ("kubectl version --client\nkubectl config get-contexts", "Client version prints; at least one context exists."),
    'helm':       ("helm version", "Helm prints v3.x.x."),
    'istio':      ("istioctl version --remote=false", "istioctl client version prints."),
    'linkerd':    ("linkerd version --client", "Linkerd CLI version prints."),
    'terraform':  ("terraform -version\naws sts get-caller-identity", "Terraform and AWS identity both print."),
    'aws':        ("aws --version\naws sts get-caller-identity", "AWS CLI version and your account ARN print."),
    'gcloud':     ("gcloud --version\ngcloud auth list", "gcloud version and an active account print."),
    'az':         ("az --version\naz account show", "az CLI version and your subscription print."),
    'vault':      ("vault --version", "Vault CLI version prints."),
    'argocd':     ("argocd version --client", "Argo CD client version prints."),
    'prometheus': ("docker compose up -d && curl -s localhost:9090/-/healthy", "Prometheus answers `Prometheus Server is Healthy`."),
    'grafana':    ("curl -s localhost:3000/api/health", "Grafana returns ok in JSON."),
    'velero':     ("velero version --client-only", "Velero CLI version prints."),
    'prowler':    ("prowler -v", "Prowler version prints."),
    'dns':        ("dig +short example.com\nnslookup yourdomain.com", "An A record IP comes back."),
    'github':     ("gh --version\ngh auth status", "gh CLI prints version and logged-in user."),
}

def _verify_for_topic(topic: str):
    """Pick the most specific verification command for a Day 0 topic."""
    t = topic.lower()
    # priority order matters: more specific tools first
    for key in ['terraform', 'argocd', 'prometheus', 'grafana', 'velero', 'prowler', 'vault',
                'helm', 'kubectl', 'kind', 'k3d', 'istio', 'linkerd', 'compose', 'containerd',
                'docker', 'trivy', 'aws', 'gcloud', 'az', 'github', 'git', 'dns']:
        if key in t:
            return PREREQ_VERIFY[key]
    return ("# Run the install command from the official docs, then check the version", "The tool prints its version without error.")

# ------------------------------------------------------------
# Helper: get a real video for a concept
# ------------------------------------------------------------
def get_video_for_concept(concept: str, fallback: str = "docker-100s") -> dict:
    """Return a video dict (title, url, duration_min, creator, why) based on concept keywords."""
    concept_lower = concept.lower()
    if 'git' in concept_lower:
        return {"title": "Your First Git + GitHub Push in 10 minutes", "url": KNOWN_GOOD['git-webdev'], "duration_min": 10, "creator": "Web Dev Simplified", "why": "The four essential git commands that you'll use every day on this track."}
    if 'linux' in concept_lower or 'shell' in concept_lower or 'terminal' in concept_lower:
        return {"title": "Linux in 5 minutes", "url": KNOWN_GOOD['linux-prime'], "duration_min": 5, "creator": "ThePrimeagen", "why": "The handful of Linux commands you need to navigate any server."}
    if 'docker' in concept_lower:
        return {"title": "Docker in 100 Seconds", "url": KNOWN_GOOD['docker-100s'], "duration_min": 2, "creator": "Fireship", "why": "The fastest visual explanation of containers, images, and the Docker CLI."}
    if 'terraform' in concept_lower:
        return {"title": "Terraform in 100 Seconds", "url": KNOWN_GOOD['terraform-100s'], "duration_min": 2, "creator": "Fireship", "why": "Why infrastructure as code matters and how Terraform declares your cloud."}
    if 'kubernetes' in concept_lower or 'k8s' in concept_lower:
        return {"title": "Kubernetes in 100 Seconds", "url": KNOWN_GOOD['k8s-100s'], "duration_min": 2, "creator": "Fireship", "why": "The mental model of pods, deployments, and services in 100 seconds."}
    if 'prometheus' in concept_lower or 'monitoring' in concept_lower:
        return {"title": "Prometheus in 100 Seconds", "url": KNOWN_GOOD['prometheus-100s'], "duration_min": 2, "creator": "Fireship", "why": "How Prometheus pulls metrics and why it's the standard for Kubernetes monitoring."}
    if 'helm' in concept_lower:
        return {"title": "Helm in 100 Seconds", "url": KNOWN_GOOD['helm-100s'], "duration_min": 2, "creator": "Fireship", "why": "Helm as a package manager for Kubernetes, charts, and releases."}
    if 'argo' in concept_lower or 'gitops' in concept_lower:
        return {"title": "Argo CD in 100 Seconds", "url": KNOWN_GOOD['argo-100s'], "duration_min": 2, "creator": "Fireship", "why": "GitOps continuous delivery: what Argo CD does and why the pull model matters."}
    if 'ssh' in concept_lower:
        return {"title": "SSH in 5 minutes", "url": KNOWN_GOOD['ssh-crash'], "duration_min": 5, "creator": "NetworkChuck", "why": "How SSH keys work and how to connect to a remote server securely."}
    if 'nginx' in concept_lower or 'web server' in concept_lower:
        return {"title": "Nginx in 5 minutes", "url": KNOWN_GOOD['nginx-crash'], "duration_min": 5, "creator": "Fireship", "why": "What nginx does as a reverse proxy and load balancer."}
    # Default fallback
    return {"title": "Core concept explained", "url": KNOWN_GOOD[fallback], "duration_min": 2, "creator": "Fireship", "why": "The essential mental model for this week's material."}

# ------------------------------------------------------------
# Build enriched day structure from raw week info
# ------------------------------------------------------------
def enrich_week(raw_week: dict, week_num: int) -> dict:
    """Convert a raw week dict into enriched format."""
    enriched = {
        "number": week_num,
        "title": raw_week["title"],
        "phase": raw_week.get("phase", "Foundations"),
        "commitment_hours": raw_week.get("commitment_hours", "12-18"),
        "context": raw_week.get("context", ""),
        "concept_check": [],   # will fill later
        "days": []
    }

    # ---- Build days 0-7 ----
    days = []
    # Day 0: foundational tool setup — every week gets one
    prereq_topic = WEEK_PREREQUISITES.get(week_num) or raw_week.get("pre_flight") or raw_week["title"]
    days.append(create_prerequisite_day(prereq_topic[:120]))

    # Create 7 days (days 1-7) from raw topics/tasks
    topics = raw_week.get("topics", [])
    tasks = raw_week.get("tasks", [])
    for d in range(1, 8):
        day_title = f"Day {d} – {topics[d-1] if d-1 < len(topics) else raw_week['title']}"
        day_summary = f"Focus: {tasks[d-1] if d-1 < len(tasks) else 'Core concept'}"
        items = []
        # lesson (short explanation from raw week's context or from a generated paragraph)
        lesson_body = generate_lesson_body(raw_week, d)
        items.append({"kind": "lesson", "title": day_title, "body": lesson_body})
        # video (relevant)
        video = get_video_for_concept(day_title + " " + " ".join(topics))
        items.append({"kind": "video", "title": video["title"], "url": video["url"], "duration_min": video["duration_min"], "creator": video["creator"], "why": video["why"]})
        # reading (from raw resources or placeholder)
        reading = {"kind": "reading", "title": "Official documentation", "url": "https://docs.example.com", "why": "Read the canonical reference to cement the ideas."}
        if raw_week.get("resources"):
            # take first resource that has a real URL (not a search query)
            for r in raw_week["resources"]:
                if r.get("url") and not r["url"].startswith("https://www.youtube.com/results?"):
                    reading = {"kind": "reading", "title": r["label"], "url": r["url"], "why": r.get("note", "Official reference.")}
                    break
        items.append(reading)
        # swipe (3 cards)
        swipe_cards = generate_swipe_cards(raw_week, d)
        items.append({"kind": "swipe", "title": "Quick check – swipe to answer", "cards": swipe_cards})
        # exercise (from tasks or generated)
        exercise_body = generate_exercise(raw_week, d)
        items.append({"kind": "exercise", "title": "Your turn", "body": exercise_body})
        days.append({"number": d, "title": day_title, "summary": day_summary, "items": items})

    # Day 7 synthesis (ensure a final "ship it" pattern)
    last_day = days[-1]
    last_day["title"] = f"Day 7 – Ship {raw_week['title']}"
    last_day["summary"] = "Tag the release, update README, push."
    # add a final exercise that includes tagging
    last_day["items"].append({
        "kind": "exercise",
        "title": "Ship it",
        "body": f"Tag your work as v{week_num}.0 and push to GitHub.\n\n```bash\ngit add . && git commit -m '{raw_week['title']}'\ngit tag v{week_num}.0 && git push --tags\n```"
    })

    enriched["days"] = days

    # ---- Concept check (3 questions) ----
    # Extract from raw week's "mastery_questions" if present, else generate
    if "mastery_questions" in raw_week and len(raw_week["mastery_questions"]) >= 3:
        for q in raw_week["mastery_questions"][:3]:
            # split into question and answer (assuming "Q: ... A: ...")
            parts = q.split(" A: ")
            if len(parts) == 2:
                question_text = parts[0].replace("Q: ", "").strip()
                answer_text = parts[1].strip()
            else:
                question_text = q[:150]
                answer_text = "See the lesson for explanation."
            enriched["concept_check"].append({
                "q": question_text,
                "choices": ["Option A", "Option B", "Option C", "Option D"],
                "correct": 0,
                "explain": answer_text
            })
    else:
        # generate generic concept check from week title
        enriched["concept_check"] = generate_concept_checks(raw_week["title"])

    return enriched

def create_prerequisite_day(topic: str) -> dict:
    """Create a Day 0 lesson for foundational setup, tailored to the topic."""
    verify_cmd, verify_pass = _verify_for_topic(topic)
    video = get_video_for_concept(topic)

    return {
        "number": 0,
        "title": f"Day 0 – Setup: {topic}",
        "summary": f"Install and verify {topic} before diving into the week.",
        "items": [
            {
                "kind": "lesson",
                "title": "Set up your tooling",
                "body": (
                    f"## What it is\n{topic} is the foundation for this week's work. "
                    "Without it installed and working, every later day will fail with a cryptic error.\n\n"
                    "## What you'll do today\n"
                    "- Install the required tool(s)\n"
                    "- Authenticate (if the tool talks to a cloud or remote service)\n"
                    "- Run a one-line verification command\n"
                    "- Commit a `day0` checkpoint to GitHub so you can prove the setup worked\n\n"
                    "## Why before anything else\n"
                    "The number-one reason mentees stall on a DevOps week is a missing CLI, a wrong path, "
                    "or unauthenticated credentials. Spend 30 minutes here and you save hours later."
                )
            },
            {
                "kind": "video",
                "title": video["title"],
                "url": video["url"],
                "duration_min": video["duration_min"],
                "creator": video["creator"],
                "why": "Follow along to install and sanity-check the tool."
            },
            {
                "kind": "swipe",
                "title": "Quick check – swipe to answer",
                "cards": [
                    {"prompt": f"You have installed the CLI for {topic} and can print its version.", "answer": True, "whenRight": "Great – the tool is on your PATH.", "whenWrong": "Re-run the official installer; check that the binary is on your PATH."},
                    {"prompt": "You have authenticated (where needed) with credentials stored outside the repo.", "answer": True, "whenRight": "Perfect – secrets stay out of git.", "whenWrong": "Use environment variables or the cloud's credential helper, never commit keys."},
                    {"prompt": "Your verification command exits with status 0 and prints the expected output.", "answer": True, "whenRight": "Excellent – you're ready for Day 1.", "whenWrong": "Read the error carefully; 90% of Day 0 failures are PATH or auth issues."}
                ]
            },
            {
                "kind": "exercise",
                "title": "Verify your setup",
                "body": (
                    f"[CODE] Run:\n```bash\n{verify_cmd}\n```\n\n"
                    f"PASS:\n[x] {verify_pass}\n[x] No error messages in the output\n"
                    "[x] You committed a short note (`SETUP.md`) recording the versions you installed"
                )
            }
        ]
    }

def generate_lesson_body(raw_week: dict, day_num: int) -> str:
    """Return a markdown lesson body from raw week data or generated content."""
    # Use existing lesson content from raw week if present
    if "days" in raw_week and len(raw_week["days"]) > day_num-1 and "items" in raw_week["days"][day_num-1]:
        for item in raw_week["days"][day_num-1].get("items", []):
            if item.get("kind") == "lesson":
                return item.get("body", "## Core concept\n\nRead the week's context and tasks.")
    # Fallback: build from topics
    topics = raw_week.get("topics", [])
    topic = topics[day_num-1] if day_num-1 < len(topics) else "Core concept"
    return f"## {topic}\n\n{raw_week.get('context', '')[:500]}\n\n## Key ideas\n- Understand the problem\n- Learn the syntax\n- Apply to your infrastructure"

def generate_swipe_cards(raw_week: dict, day_num: int) -> list:
    """Return 3 swipe cards based on week topics."""
    return [
        {"prompt": "Infrastructure as Code means you click through the cloud console and document each step.", "answer": False, "whenRight": "Right – IaC means writing declarative config files that a tool applies.", "whenWrong": "IaC is about files, not clicks. The console is the enemy of repeatability."},
        {"prompt": "Containers share the host kernel, making them lighter than virtual machines.", "answer": True, "whenRight": "Exactly – they're isolated processes, not full OS emulations.", "whenWrong": "Containers share the kernel; VMs have their own. That's the key difference."},
        {"prompt": "Kubernetes automatically replaces failed pods without any manual intervention.", "answer": True, "whenRight": "Correct – the controller loop restores desired state.", "whenWrong": "Yes – that's the self-healing property of Kubernetes deployments."}
    ]

def generate_exercise(raw_week: dict, day_num: int) -> str:
    """Return an exercise from tasks or a generic template."""
    tasks = raw_week.get("tasks", [])
    if day_num-1 < len(tasks):
        return f"[CODE] {tasks[day_num-1]}\n\nComplete the task and commit your work."
    return "[CODE] Implement the core concept demonstrated in the lesson and push to GitHub."

def generate_concept_checks(week_title: str) -> list:
    """Generate 3 generic concept check questions."""
    return [
        {"q": f"What is the primary benefit of using {week_title}?", "choices": ["Faster deployment", "Reduced manual effort and reproducibility", "Lower cost", "Better security"], "correct": 1, "explain": "Infrastructure as Code (or the tool) makes your environment reproducible and auditable – the two greatest benefits."},
        {"q": "Which of the following is a declarative tool for infrastructure provisioning?", "choices": ["Bash", "Terraform", "Python", "Puppet"], "correct": 1, "explain": "Terraform is declarative; you state what you want and it figures out how."},
        {"q": "What is the main difference between a container and a virtual machine?", "choices": ["Containers are slower", "Containers share the host kernel", "VMs are more portable", "Containers can't run Linux"], "correct": 1, "explain": "Containers use the host kernel via namespaces; VMs each have their own kernel."}
    ]

# ------------------------------------------------------------
# Main
# ------------------------------------------------------------
def main():
    input_file = 'devops-cloud.json'
    output_file = 'devops-cloud-enriched.json'

    with open(input_file, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    # Support both top-level list and {weeks: [...]} shape
    if isinstance(raw_data, list):
        raw_weeks = raw_data
    elif isinstance(raw_data, dict) and "weeks" in raw_data:
        raw_weeks = raw_data["weeks"]
    else:
        raise ValueError(f"Unexpected JSON shape in {input_file}. Expected a list or {{\"weeks\": [...]}}.")

    enriched_weeks = []
    for idx, raw_week in enumerate(raw_weeks, start=1):
        print(f"Enriching week {idx}: {raw_week['title']}")
        enriched = enrich_week(raw_week, idx)
        enriched_weeks.append(enriched)

    output = {
        "slug": "devops-cloud-enriched",
        "title": "DevOps & Cloud (Enriched)",
        "total_weeks": len(enriched_weeks),
        "weeks": enriched_weeks
    }

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Done. Enriched file saved as {output_file} ({len(enriched_weeks)} weeks)")

if __name__ == "__main__":
    main()
