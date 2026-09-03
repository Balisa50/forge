"""
Comprehensive roadmap content quality fix — all tracks.

Operations:
  1. Remove all "Deeper dive: …" template-filler items across every track.
     (These have title starting "Deeper dive:" AND body containing the
     "There isn't a single short video" sentence — they teach nothing.)

  2. Strip the artifact sentence "The snippet below shows exactly what to do:"
     from every lesson body.  It was leftover template scaffold text that
     appears before code blocks, confusing students.

  3. data-science Week 1 Day 0 ("Your Coding Environment — Jupyter Notebook"):
     Remove three wildly-misplaced lesson groups (OpenAI SDK, PyTorch, scikit-learn)
     that somehow got injected into the environment-setup day.  Those topics live
     in Weeks 15-20+.  Students see them on Day 0 of Week 1 and are rightfully
     confused about what they need to know.

  4. For every Day 0 whose setup lesson body is the pure generic template
     ("Install the required tool(s) … Authenticate …"), expand it with
     a tool-specific first paragraph so students know EXACTLY what they
     are installing and why, not just a 3-bullet boilerplate.

Run from the FORGE root:
    python scripts/fix_all_tracks.py
"""

import json
import pathlib
import re
import sys

ROADMAP_DIR = pathlib.Path("data/roadmaps")

TARGETS = [
    "data-science.json",
    "data-analysis.json",
    "data-engineering.json",
    "ai-automation-enriched.json",
    "ai-engineering-enriched.json",
    "bi-analytics-enriched.json",
    "cybersecurity-enriched.json",
    "devops-cloud-enriched.json",
    "full-stack-web-enriched.json",
    "ml-engineering-enriched.json",
    "mobile-engineering-enriched.json",
]

FILLER_MARKER = "There isn"          # "There isn't a single short video…"
ARTIFACT      = "The snippet below shows exactly what to do:"
GENERIC_SETUP = "Install the required tool(s)"  # thin generic Day 0 body

# Items to remove from data-science Week 1 Day 0
DS_W1_D0_DROP_TITLES = {
    "OpenAI SDK — your first API call in 10 lines",
    "OpenAI — Quickstart (official)",
    "PyTorch — tensors, autograd, the 90-second mental model",
    "PyTorch — Quickstart tutorial (official)",
    "scikit-learn — fit, predict, score",
    "scikit-learn — Getting Started (official)",
    # ASCII dashes too (in case the file uses plain hyphens)
    "OpenAI SDK - your first API call in 10 lines",
    "OpenAI - Quickstart (official)",
    "PyTorch - tensors, autograd, the 90-second mental model",
    "PyTorch - Quickstart tutorial (official)",
    "scikit-learn - fit, predict, score",
    "scikit-learn - Getting Started (official)",
}


def is_filler(item: dict) -> bool:
    title = item.get("title", "")
    body  = item.get("body", "")
    return title.startswith("Deeper dive:") and FILLER_MARKER in body


def strip_artifact(body: str) -> str:
    # Remove the artifact line in whatever context it appears
    cleaned = body.replace(ARTIFACT + "\n\n", "")
    cleaned = cleaned.replace(ARTIFACT + "\n", "")
    cleaned = cleaned.replace(ARTIFACT, "")
    return cleaned


def expand_thin_setup_body(title: str, body: str) -> str:
    """
    When the Day 0 setup lesson is the generic 3-bullet template, prepend a
    tool-specific paragraph so students immediately know what they're doing.
    We extract the tool stack from the lesson title / week Day 0 title and
    add an opening paragraph before the generic bullets.
    """
    if GENERIC_SETUP not in body:
        return body  # not the thin template — leave it alone

    # Try to extract the tool name from the lesson title
    tool = title.replace("Set up your tooling", "").strip()
    if not tool:
        return body  # can't infer; leave it

    preamble = (
        f"## What you're setting up today\n\n"
        f"**{tool}** is the tooling this week depends on. Every code sample, every exercise, "
        f"every exercise this week assumes it is installed and verified. Spend 20 minutes here "
        f"now to avoid a frustrating stop in the middle of a lesson later.\n\n"
        f"The steps below tell you exactly what to run and what a working install looks like. "
        f"If anything fails, read the last line of the error — 90 % of setup failures are a "
        f"wrong PATH, a missing authentication step, or a typo in a package name, and the "
        f"error message spells it out.\n\n"
    )
    return preamble + body


# ── Counters ─────────────────────────────────────────────────────────────────
total_filler   = 0
total_artifact = 0
total_ds_drop  = 0
total_setup    = 0


def process_file(p: pathlib.Path) -> None:
    global total_filler, total_artifact, total_ds_drop, total_setup

    data = json.loads(p.read_text(encoding="utf-8"))
    if "weeks" not in data:
        return

    is_ds = (p.name == "data-science.json")
    filler_count = artifact_count = ds_drop_count = setup_count = 0

    for w in data["weeks"]:
        wnum = w.get("number", -1)
        for day in w.get("days", []):
            dnum = day.get("number", -1)
            orig   = day.get("items", [])
            result = []

            for item in orig:
                # ── data-science W1 D0: drop misplaced ML-library lessons ──
                if is_ds and wnum == 1 and dnum == 0:
                    if item.get("title", "") in DS_W1_D0_DROP_TITLES:
                        ds_drop_count += 1
                        continue

                # ── drop template filler ──────────────────────────────────
                if is_filler(item):
                    filler_count += 1
                    continue

                # ── strip artifact sentence ───────────────────────────────
                if "body" in item:
                    new_body = strip_artifact(item["body"])
                    if new_body != item["body"]:
                        artifact_count += 1
                        item = {**item, "body": new_body}

                # ── expand thin setup bodies ──────────────────────────────
                if item.get("kind") == "lesson" and "body" in item:
                    expanded = expand_thin_setup_body(item.get("title", ""), item["body"])
                    if expanded != item["body"]:
                        setup_count += 1
                        item = {**item, "body": expanded}

                result.append(item)

            day["items"] = result

    p.write_text(
        json.dumps(data, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    total_filler   += filler_count
    total_artifact += artifact_count
    total_ds_drop  += ds_drop_count
    total_setup    += setup_count

    parts = []
    if filler_count:   parts.append(f"filler={filler_count}")
    if artifact_count: parts.append(f"artifacts={artifact_count}")
    if ds_drop_count:  parts.append(f"misplaced_lessons={ds_drop_count}")
    if setup_count:    parts.append(f"thin_setup_expanded={setup_count}")
    msg = ", ".join(parts) if parts else "no changes"
    print(f"  {p.name}: {msg}")


def main() -> None:
    print("Scanning and fixing all roadmap tracks...\n")
    for fname in TARGETS:
        p = ROADMAP_DIR / fname
        if not p.exists():
            print(f"  {fname}: NOT FOUND — skipping")
            continue
        process_file(p)

    print()
    print(f"Done.")
    print(f"  Filler items removed:             {total_filler}")
    print(f"  Artifact sentences stripped:      {total_artifact}")
    print(f"  Misplaced DS W1 D0 items removed: {total_ds_drop}")
    print(f"  Thin setup bodies expanded:       {total_setup}")

    # Verify JSON is still valid
    print("\nValidating JSON...")
    ok = True
    for fname in TARGETS:
        p = ROADMAP_DIR / fname
        if not p.exists():
            continue
        try:
            json.loads(p.read_text(encoding="utf-8"))
            print(f"  {fname}: OK")
        except json.JSONDecodeError as e:
            print(f"  {fname}: INVALID JSON — {e}", file=sys.stderr)
            ok = False
    if ok:
        print("\nAll files are valid JSON.")
    else:
        print("\nSome files have JSON errors — check above.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
